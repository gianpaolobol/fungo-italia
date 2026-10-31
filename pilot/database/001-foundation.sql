-- Apply only to a DEDICATED Supabase Free pilot project, never current beta data.
-- Versioned additive schema. No app entitlement, catalog or local-history tables.
begin;
create schema pilot;
create schema pilot_private;
create schema pilot_health;
revoke all on schema pilot,pilot_private,pilot_health from public;

create table pilot_health.sentinel (
 id integer primary key check(id=1), schema_version integer not null check(schema_version=1)
);
insert into pilot_health.sentinel values(1,1);
alter table pilot_health.sentinel enable row level security;
create policy sentinel_read on pilot_health.sentinel for select to anon using(true);
grant usage on schema pilot_health to anon;
grant select on pilot_health.sentinel to anon;
-- Publishable/anon API key can read this one nonpersonal row, and no pilot data.

create table pilot.teachers (
 user_id uuid primary key references auth.users(id), revoked_at timestamptz
);
create table pilot.courses (
 id uuid primary key default gen_random_uuid(),
 teacher_id uuid not null references pilot.teachers(user_id),
 title text not null check(length(trim(title)) between 1 and 160),
 closed_at timestamptz, created_at timestamptz not null default now()
);
create table pilot.memberships (
 id uuid primary key default gen_random_uuid(),
 course_id uuid not null references pilot.courses(id),
 user_id uuid not null references auth.users(id),
 joined_at timestamptz not null default now(), revoked_at timestamptz,
 unique(id,course_id)
);
create unique index one_active_enrollment on pilot.memberships(course_id,user_id) where revoked_at is null;
create table pilot.groups (
 id uuid primary key default gen_random_uuid(),
 course_id uuid not null references pilot.courses(id),
 title text not null check(length(trim(title)) between 1 and 160), unique(id,course_id)
);
create table pilot.group_memberships (
 id uuid primary key default gen_random_uuid(),course_id uuid not null,
 group_id uuid not null,membership_id uuid not null,revoked_at timestamptz,
 foreign key(group_id,course_id) references pilot.groups(id,course_id),
 foreign key(membership_id,course_id) references pilot.memberships(id,course_id)
);
create unique index one_active_group_enrollment on pilot.group_memberships(group_id,membership_id) where revoked_at is null;
create table pilot.materials (
 id uuid primary key default gen_random_uuid(),course_id uuid not null references pilot.courses(id),
 title text not null check(length(trim(title)) between 1 and 160),
 author text not null check(length(trim(author)) between 1 and 300),
 bytes bigint not null check(bytes>0 and bytes<=20000000),
 state text not null default 'quarantine' check(state in ('quarantine','ready','rejected')),
 retired_at timestamptz,created_at timestamptz not null default now(),
 unique(id,course_id)
);
create table pilot.material_files (
 material_id uuid primary key references pilot.materials(id),
 object_key text not null unique,sha256 text not null check(sha256~'^[0-9a-f]{64}$')
);
create table pilot.material_shares (
 course_id uuid not null, material_id uuid not null,group_id uuid not null,
 revoked_at timestamptz, primary key(material_id,group_id),
 foreign key(material_id,course_id) references pilot.materials(id,course_id),
 foreign key(group_id,course_id) references pilot.groups(id,course_id)
);

create function pilot_private.owns_course(cid uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from pilot.courses c join pilot.teachers t on t.user_id=c.teacher_id
   where c.id=cid and c.teacher_id=auth.uid() and t.revoked_at is null);
$$;
create function pilot_private.enrolled(cid uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from pilot.memberships m join pilot.courses c on c.id=m.course_id
   where m.course_id=cid and m.user_id=auth.uid() and m.revoked_at is null and c.closed_at is null);
$$;
create function pilot_private.in_group(gid uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from pilot.group_memberships gm join pilot.memberships m on m.id=gm.membership_id
   join pilot.courses c on c.id=m.course_id where gm.group_id=gid and gm.revoked_at is null
   and m.user_id=auth.uid() and m.revoked_at is null and c.closed_at is null);
$$;
create function pilot_private.can_read_material(mid uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from pilot.materials f join pilot.material_shares s on s.material_id=f.id
   join pilot.group_memberships gm on gm.group_id=s.group_id and gm.course_id=s.course_id
   join pilot.memberships m on m.id=gm.membership_id and m.course_id=gm.course_id
   join pilot.courses c on c.id=m.course_id
   where f.id=mid and f.state='ready' and f.retired_at is null and s.revoked_at is null
   and gm.revoked_at is null and m.revoked_at is null and m.user_id=auth.uid() and c.closed_at is null);
$$;

-- Serialize per-course reservations; count retired/quarantine metadata too.
-- An uploader must reserve metadata before bytes and reconcile incomplete files.
create function pilot_private.limit_material_bytes() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='UPDATE' and NEW.course_id<>OLD.course_id then raise exception 'material_course_immutable'; end if;
 perform 1 from pilot.courses where id=NEW.course_id for update;
 if (select coalesce(sum(bytes),0) from pilot.materials where course_id=NEW.course_id and id<>NEW.id)+NEW.bytes>1000000000
 then raise exception 'pilot_material_quota'; end if;
 return NEW;
end; $$;
create trigger material_quota before insert or update of bytes,course_id on pilot.materials
 for each row execute function pilot_private.limit_material_bytes();
create function pilot_private.limit_students() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='UPDATE' and (NEW.course_id<>OLD.course_id or NEW.user_id<>OLD.user_id)
 then raise exception 'membership_identity_immutable'; end if;
 perform 1 from pilot.courses where id=NEW.course_id for update;
 if NEW.revoked_at is null and (select count(*) from pilot.memberships where course_id=NEW.course_id and revoked_at is null and id<>NEW.id)>=30
 then raise exception 'pilot_student_quota'; end if;
 return NEW;
end; $$;
create trigger student_quota before insert or update on pilot.memberships
 for each row execute function pilot_private.limit_students();

alter table pilot.teachers enable row level security;
alter table pilot.courses enable row level security;
alter table pilot.memberships enable row level security;
alter table pilot.groups enable row level security;
alter table pilot.group_memberships enable row level security;
alter table pilot.materials enable row level security;
alter table pilot.material_files enable row level security;
alter table pilot.material_shares enable row level security;
create policy course_read on pilot.courses for select to authenticated
 using(pilot_private.owns_course(id) or pilot_private.enrolled(id));
create policy membership_read on pilot.memberships for select to authenticated
 using(pilot_private.owns_course(course_id) or (user_id=auth.uid() and revoked_at is null and pilot_private.enrolled(course_id)));
create policy group_read on pilot.groups for select to authenticated
 using(pilot_private.owns_course(course_id) or pilot_private.in_group(id));
create policy group_membership_read on pilot.group_memberships for select to authenticated
 using(pilot_private.owns_course(course_id));
create policy material_read on pilot.materials for select to authenticated
 using(pilot_private.owns_course(course_id) or pilot_private.can_read_material(id));
create policy material_share_read on pilot.material_shares for select to authenticated
 using(pilot_private.owns_course(course_id));

-- No client mutation grants. Invites, upload/scanner, publication and assignments
-- are separate, transactional server APIs in the next increment.
revoke all on all tables in schema pilot from public,anon,authenticated;
revoke execute on all functions in schema pilot_private from public,anon;
grant usage on schema pilot,pilot_private to authenticated;
grant select on pilot.courses,pilot.memberships,pilot.groups,pilot.group_memberships,pilot.materials,pilot.material_shares to authenticated;
grant execute on function pilot_private.owns_course(uuid),pilot_private.enrolled(uuid),pilot_private.in_group(uuid),pilot_private.can_read_material(uuid) to authenticated;
grant usage on schema pilot to service_role;
grant all on all tables in schema pilot to service_role;
commit;
