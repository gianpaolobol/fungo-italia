-- Additive pilot-only migration. Supabase Auth verifies OTP; this API trusts
-- auth.users email_confirmed_at, never client metadata or a beta access code.
begin;
create table pilot.invitations (
 id uuid primary key default gen_random_uuid(),course_id uuid not null references pilot.courses(id),
 email text not null check(email=lower(btrim(email)) and length(email)<=254),
 created_at timestamptz not null default now(),expires_at timestamptz not null default now()+interval '7 days',
 revoked_at timestamptz,accepted_at timestamptz,accepted_user_id uuid references auth.users(id),
 membership_id uuid,unique(id,course_id),
 foreign key(membership_id,course_id) references pilot.memberships(id,course_id)
);
create unique index one_current_invitation on pilot.invitations(course_id,email) where revoked_at is null;
create table pilot.invitation_groups (
 invitation_id uuid not null,course_id uuid not null,group_id uuid not null,
 primary key(invitation_id,group_id),
 foreign key(invitation_id,course_id) references pilot.invitations(id,course_id),
 foreign key(group_id,course_id) references pilot.groups(id,course_id)
);
create table pilot.invite_outbox (
 id uuid primary key default gen_random_uuid(),invitation_id uuid not null references pilot.invitations(id),
 created_at timestamptz not null default now(),claimed_at timestamptz,claim_id uuid,
 state text not null default 'pending' check(state in ('pending','claimed','sending','accepted','failed_unknown','cancelled')),
 finished_at timestamptz
);
create unique index one_pending_invitation_notice on pilot.invite_outbox(invitation_id) where state='pending';
alter table pilot.invitations enable row level security;
alter table pilot.invitation_groups enable row level security;
alter table pilot.invite_outbox enable row level security;
create policy invitation_owner_read on pilot.invitations for select to authenticated using(pilot_private.owns_course(course_id));
grant select on pilot.invitations to authenticated;
grant all on pilot.invitations,pilot.invitation_groups,pilot.invite_outbox to service_role;

create function pilot_private.verified_email() returns text
language plpgsql stable security definer set search_path='' as $$
declare mail text;
begin
 select lower(btrim(email)) into mail from auth.users where id=auth.uid() and email_confirmed_at is not null;
 if mail is null or mail='' then raise exception 'verified_email_required'; end if;
 return mail;
end $$;
create function pilot_private.lock_teacher_course(cid uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform pilot_private.verified_email();
 perform 1 from pilot.courses where id=cid and closed_at is null for update;
 if not found or not pilot_private.owns_course(cid) then raise exception 'course_unavailable'; end if;
end $$;

create function pilot.create_course(title text) returns uuid
language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 perform pilot_private.verified_email();
 if not exists(select 1 from pilot.teachers t where t.user_id=auth.uid() and t.revoked_at is null)
 then raise exception 'teacher_required'; end if;
 perform pg_advisory_xact_lock(20261031);
 if exists(select 1 from pilot.courses where closed_at is null) then raise exception 'pilot_course_limit'; end if;
 insert into pilot.courses(teacher_id,title) values(auth.uid(),btrim(title)) returning id into result;
 return result;
end $$;
create function pilot.create_group(course_id uuid,title text) returns uuid
language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 perform pilot_private.lock_teacher_course(course_id);
 if (select count(*) from pilot.groups g where g.course_id=create_group.course_id)>=2 then raise exception 'pilot_group_limit'; end if;
 insert into pilot.groups(course_id,title) values(create_group.course_id,btrim(title)) returning id into result;
 return result;
end $$;

create function pilot.invite_students(course_id uuid,group_ids uuid[],emails text[]) returns jsonb
language plpgsql security definer set search_path='' as $$
declare mail text; gid uuid; inv pilot.invitations; result jsonb='[]'; normalized text[];
begin
 perform pilot_private.lock_teacher_course(course_id);
 if cardinality(group_ids) is null or cardinality(group_ids) not between 1 and 2 or array_position(group_ids,null) is not null
 then raise exception 'invalid_groups'; end if;
 foreach gid in array group_ids loop
  if not exists(select 1 from pilot.groups g where g.id=gid and g.course_id=invite_students.course_id)
  then raise exception 'invalid_groups'; end if;
 end loop;
 if cardinality(emails) is null or cardinality(emails) not between 1 and 30 or array_position(emails,null) is not null
 then raise exception 'invalid_emails'; end if;
 select array_agg(distinct lower(btrim(e)) order by lower(btrim(e))) into normalized from unnest(emails) e;
 foreach mail in array normalized loop
  if length(mail)>254 or mail!~'^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' then raise exception 'invalid_email'; end if;
  -- Expiry does not silently resurrect a pending invitation; replacement has a new ID.
  update pilot.invitations i set revoked_at=now() where i.course_id=invite_students.course_id and i.email=mail
    and i.revoked_at is null and i.accepted_at is null and i.expires_at<=now();
  select * into inv from pilot.invitations i where i.course_id=invite_students.course_id and i.email=mail and i.revoked_at is null;
  if not found then
   insert into pilot.invitations(course_id,email) values(invite_students.course_id,mail) returning * into inv;
   insert into pilot.invite_outbox(invitation_id) values(inv.id);
  end if;
  if inv.accepted_at is not null and not exists(
    select 1 from pilot.memberships m join auth.users u on u.id=m.user_id
    where m.id=inv.membership_id and m.revoked_at is null and m.user_id=inv.accepted_user_id
      and u.email_confirmed_at is not null and lower(btrim(u.email))=mail)
  then raise exception 'invitation_identity_changed'; end if;
  -- An explicit repeat adds groups; it never removes previous groups, creates a
  -- second invitation/email or revives prior test assignments.
  insert into pilot.invitation_groups(invitation_id,course_id,group_id)
    select inv.id,invite_students.course_id,x from (select distinct unnest(group_ids) x) g on conflict do nothing;
  if inv.accepted_at is not null then
   insert into pilot.group_memberships(course_id,group_id,membership_id)
     select invite_students.course_id,x,inv.membership_id from (select distinct unnest(group_ids) x) g
     where not exists(select 1 from pilot.group_memberships gm where gm.group_id=x and gm.membership_id=inv.membership_id and gm.revoked_at is null);
  end if;
  result=result||jsonb_build_array(jsonb_build_object('id',inv.id,'email',inv.email,'accepted',inv.accepted_at is not null));
 end loop;
 -- Reserve capacity for pending new students; invitations for existing active
 -- members do not reserve a second seat. Lock serializes teacher and accept RPCs.
 if (select count(*) from pilot.memberships m where m.course_id=invite_students.course_id and m.revoked_at is null)+
    (select count(*) from pilot.invitations i where i.course_id=invite_students.course_id and i.revoked_at is null and i.accepted_at is null and i.expires_at>now()
     and not exists(select 1 from pilot.memberships m join auth.users u on u.id=m.user_id
       where m.course_id=i.course_id and m.revoked_at is null and u.email_confirmed_at is not null and lower(btrim(u.email))=i.email))>30
 then raise exception 'pilot_student_quota'; end if;
 return result;
end $$;

create function pilot.my_invitations() returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare mail text;
begin
 mail=pilot_private.verified_email();
 return coalesce((select jsonb_agg(jsonb_build_object('id',i.id,'course_id',i.course_id,'title',c.title,'expires_at',i.expires_at,
   'groups',(select jsonb_agg(g.title order by g.title) from pilot.invitation_groups ig join pilot.groups g on g.id=ig.group_id where ig.invitation_id=i.id)) order by i.created_at,i.id)
   from pilot.invitations i join pilot.courses c on c.id=i.course_id join pilot.teachers t on t.user_id=c.teacher_id
   where i.email=mail and i.revoked_at is null and i.accepted_at is null and i.expires_at>now() and c.closed_at is null and t.revoked_at is null),'[]');
end $$;
create function pilot.accept_invitation(invitation_id uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare mail text; cid uuid; inv pilot.invitations; mid uuid;
begin
 mail=pilot_private.verified_email();
 select i.course_id into cid from pilot.invitations i where i.id=invitation_id;
 if cid is null then raise exception 'invitation_unavailable'; end if;
 perform 1 from pilot.courses c join pilot.teachers t on t.user_id=c.teacher_id
  where c.id=cid and c.closed_at is null and t.revoked_at is null for update of c;
 if not found then raise exception 'invitation_unavailable'; end if;
 select * into inv from pilot.invitations i where i.id=invitation_id for update;
 if inv.revoked_at is not null or inv.email<>mail then raise exception 'invitation_unavailable'; end if;
 if inv.accepted_at is not null then
  if inv.accepted_user_id=auth.uid() and exists(select 1 from pilot.memberships m where m.id=inv.membership_id and m.revoked_at is null)
  then return inv.membership_id; end if;
  raise exception 'invitation_unavailable';
 end if;
 if inv.expires_at<=now() then raise exception 'invitation_unavailable'; end if;
 select m.id into mid from pilot.memberships m where m.course_id=cid and m.user_id=auth.uid() and m.revoked_at is null;
 if mid is null then insert into pilot.memberships(course_id,user_id) values(cid,auth.uid()) returning id into mid; end if;
 insert into pilot.group_memberships(course_id,group_id,membership_id)
  select cid,ig.group_id,mid from pilot.invitation_groups ig where ig.invitation_id=inv.id
  and not exists(select 1 from pilot.group_memberships gm where gm.group_id=ig.group_id and gm.membership_id=mid and gm.revoked_at is null);
 update pilot.invitations set accepted_at=now(),accepted_user_id=auth.uid(),membership_id=mid where id=inv.id;
 update pilot.invite_outbox o set state='cancelled' where o.invitation_id=inv.id and o.state='pending';
 return mid;
end $$;

create function pilot.revoke_invitation(invitation_id uuid) returns void
language plpgsql security definer set search_path='' as $$
declare cid uuid;
begin
 select i.course_id into cid from pilot.invitations i where i.id=invitation_id;
 if cid is null or not pilot_private.owns_course(cid) then raise exception 'invitation_unavailable'; end if;
 perform pilot_private.lock_teacher_course(cid);
 update pilot.invitations set revoked_at=coalesce(revoked_at,now()) where id=invitation_id;
 update pilot.invite_outbox o set state='cancelled' where o.invitation_id=revoke_invitation.invitation_id and o.state in ('pending','claimed');
 -- Revoking an invitation alone does not undo an already accepted enrollment.
 -- The UI must use revoke_membership for removing an enrolled student.
end $$;
create function pilot.revoke_membership(membership_id uuid) returns void
language plpgsql security definer set search_path='' as $$
declare cid uuid;
begin
 select m.course_id into cid from pilot.memberships m where m.id=membership_id;
 if cid is null or not pilot_private.owns_course(cid) then raise exception 'membership_unavailable'; end if;
 perform pilot_private.lock_teacher_course(cid);
 update pilot.memberships set revoked_at=coalesce(revoked_at,now()) where id=membership_id;
 update pilot.group_memberships set revoked_at=coalesce(revoked_at,now()) where group_memberships.membership_id=revoke_membership.membership_id;
 update pilot.invitations set revoked_at=coalesce(revoked_at,now()) where invitations.membership_id=revoke_membership.membership_id;
 update pilot.invite_outbox o set state='cancelled' where o.state in ('pending','claimed') and exists(
  select 1 from pilot.invitations i where i.id=o.invitation_id and i.membership_id=revoke_membership.membership_id);
end $$;
create function pilot.request_invite_notice(invitation_id uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare inv pilot.invitations; result uuid;
begin
 select * into inv from pilot.invitations i where i.id=invitation_id;
 if not found or not pilot_private.owns_course(inv.course_id) then raise exception 'invitation_unavailable'; end if;
 perform pilot_private.lock_teacher_course(inv.course_id);
 select * into inv from pilot.invitations i where i.id=invitation_id for update;
 if inv.revoked_at is not null or inv.accepted_at is not null or inv.expires_at<=now() then raise exception 'invitation_unavailable'; end if;
 if exists(select 1 from pilot.invite_outbox o where o.invitation_id=inv.id and
   (o.state in ('pending','claimed','sending') or greatest(o.created_at,o.claimed_at,o.finished_at)>now()-interval '10 minutes')) then raise exception 'notice_cooldown'; end if;
 insert into pilot.invite_outbox(invitation_id) values(inv.id) returning id into result;
 return result;
end $$;

create function pilot.claim_invite_notices(batch_limit integer) returns jsonb
language plpgsql security definer set search_path='' as $$
declare available integer; job record; result jsonb='[]'; claim uuid;
begin
 if batch_limit not between 1 and 10 or batch_limit is null then raise exception 'invalid_batch_limit'; end if;
 perform pg_advisory_xact_lock(20261032);
 select greatest(0,60-count(*))::integer into available from pilot.invite_outbox
   where claimed_at>=(date_trunc('day',now() at time zone 'UTC') at time zone 'UTC');
 update pilot.invite_outbox o set state='cancelled' where o.state='pending' and not exists(
  select 1 from pilot.invitations i join pilot.courses c on c.id=i.course_id join pilot.teachers t on t.user_id=c.teacher_id
  where i.id=o.invitation_id and i.revoked_at is null and i.accepted_at is null and i.expires_at>now() and c.closed_at is null and t.revoked_at is null);
 for job in select o.id,i.id invitation_id,i.email,c.title from pilot.invite_outbox o
   join pilot.invitations i on i.id=o.invitation_id join pilot.courses c on c.id=i.course_id
   where o.state='pending' order by o.created_at,o.id limit least(batch_limit,available) for update of o skip locked loop
  claim=gen_random_uuid();
  update pilot.invite_outbox set state='claimed',claimed_at=now(),claim_id=claim where id=job.id;
  result=result||jsonb_build_array(jsonb_build_object('id',job.id,'claim_id',claim,'invitation_id',job.invitation_id,'email',job.email,'title',job.title));
 end loop;
 return result;
end $$;
create function pilot.authorize_invite_notice(job_id uuid,claim_id uuid) returns boolean
language plpgsql security definer set search_path='' as $$
declare cid uuid; job pilot.invite_outbox;
begin
 select i.course_id into cid from pilot.invite_outbox o join pilot.invitations i on i.id=o.invitation_id where o.id=job_id;
 if cid is null then return false; end if;
 -- Same lock order as revoke/accept: course first, then outbox. Recheck each
 -- item immediately before its provider request, not only when claiming a batch.
 perform 1 from pilot.courses where id=cid for update;
 select * into job from pilot.invite_outbox o where o.id=job_id for update;
 if job.claim_id is distinct from authorize_invite_notice.claim_id or job.state<>'claimed' then return false; end if;
 if not exists(select 1 from pilot.invitations i join pilot.courses c on c.id=i.course_id
    join pilot.teachers t on t.user_id=c.teacher_id where i.id=job.invitation_id and
    i.revoked_at is null and i.accepted_at is null and i.expires_at>now() and c.closed_at is null and t.revoked_at is null)
 then update pilot.invite_outbox set state='cancelled',finished_at=now() where id=job_id;return false; end if;
 update pilot.invite_outbox set state='sending' where id=job_id;
 return true;
end $$;
create function pilot.finish_invite_notice(job_id uuid,claim_id uuid,accepted boolean) returns boolean
language plpgsql security definer set search_path='' as $$
declare changed integer;
begin
 if accepted is null then raise exception 'notice_result_required'; end if;
 update pilot.invite_outbox o set state=case when accepted then 'accepted' else 'failed_unknown' end,finished_at=now()
   where o.id=job_id and o.claim_id=finish_invite_notice.claim_id and o.state='sending';
 get diagnostics changed=row_count;return changed=1;
end $$;

-- Supabase may default new functions to PUBLIC execution: explicitly remove it.
revoke execute on all functions in schema pilot from public,anon,authenticated;
revoke execute on all functions in schema pilot_private from public,anon;
grant execute on function pilot.create_course(text),pilot.create_group(uuid,text),pilot.invite_students(uuid,uuid[],text[]),
 pilot.my_invitations(),pilot.accept_invitation(uuid),pilot.revoke_invitation(uuid),pilot.revoke_membership(uuid),pilot.request_invite_notice(uuid) to authenticated;
grant execute on function pilot.claim_invite_notices(integer),pilot.authorize_invite_notice(uuid,uuid),pilot.finish_invite_notice(uuid,uuid,boolean) to service_role;
commit;
