\set ON_ERROR_STOP on
-- Run ONLY on the temporary CI database after fixture.sql and 001-foundation.sql.
begin;
create function pg_temp.check_it(ok boolean, message text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'FAIL: %',message; end if; end $$;

insert into auth.users(id) values
 ('00000000-0000-0000-0000-000000000001'),
 ('00000000-0000-0000-0000-000000000002'),
 ('00000000-0000-0000-0000-000000000003'),
 ('00000000-0000-0000-0000-000000000004');
insert into pilot.teachers(user_id) values ('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002');
insert into pilot.courses(id,teacher_id,title) values
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','Corso A'),
 ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','Corso B');
insert into pilot.groups(id,course_id,title) values
 ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Gruppo A'),
 ('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','Gruppo B');
insert into pilot.memberships(id,course_id,user_id) values
 ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000003');
insert into pilot.group_memberships(course_id,group_id,membership_id) values
 ('10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001'),
 ('10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001');
insert into pilot.materials(id,course_id,title,author,bytes,state) values
 ('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','PDF pronto','Docente',20000000,'ready'),
 ('40000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','PDF quarantena','Docente',2000,'quarantine');
insert into pilot.material_shares(course_id,material_id,group_id) values
 ('10000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001'),
 ('10000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002'),
 ('10000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001');

set local role anon;
select pg_temp.check_it((select count(*)=1 from pilot_health.sentinel),'probe can read exactly one row');
select pg_temp.check_it(not has_table_privilege(current_user,'pilot.materials','SELECT'),'probe has no material privilege');
select pg_temp.check_it(not has_table_privilege(current_user,'pilot_health.sentinel','UPDATE'),'probe cannot fake success by modifying row');
reset role;

select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',true);
set local role authenticated;
select pg_temp.check_it((select count(*)=1 from pilot.courses),'student sees only enrolled course');
select pg_temp.check_it((select count(*)=1 from pilot.materials),'student sees ready shared PDF once, never quarantine');
select pg_temp.check_it(not has_table_privilege(current_user,'pilot.materials','UPDATE'),'student cannot promote quarantined PDF');
select pg_temp.check_it(not has_table_privilege(current_user,'pilot.material_files','SELECT'),'object keys are never exposed directly');
reset role;

update pilot.group_memberships set revoked_at=now() where group_id='20000000-0000-0000-0000-000000000001';
set local role authenticated;
select pg_temp.check_it((select count(*)=1 from pilot.materials),'overlapping group preserves authorization');
reset role;
update pilot.memberships set revoked_at=now();
set local role authenticated;
select pg_temp.check_it((select count(*)=0 from pilot.materials),'course revocation overrides all group shares');
reset role;

insert into pilot.memberships(id,course_id,user_id) values
 ('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000003');
set local role authenticated;
select pg_temp.check_it((select count(*)=0 from pilot.materials),'reenrollment alone does not reuse old group membership');
reset role;
insert into pilot.group_memberships(course_id,group_id,membership_id) values
 ('10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002');
set local role authenticated;
select pg_temp.check_it((select count(*)=1 from pilot.materials),'new group membership sees existing dynamic library');
reset role;
update pilot.materials set retired_at=now() where state='ready';
set local role authenticated;
select pg_temp.check_it((select count(*)=0 from pilot.materials),'retirement stops new access');
reset role;

select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
set local role authenticated;
select pg_temp.check_it((select count(*)=1 from pilot.courses),'teacher B sees only own course');
select pg_temp.check_it((select count(*)=0 from pilot.memberships),'teacher B cannot list A students');
select pg_temp.check_it((select count(*)=0 from pilot.materials),'teacher B cannot see A PDF');
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000004',true);
set local role authenticated;
select pg_temp.check_it((select count(*)=0 from pilot.courses),'uninvited student cannot list courses');
select pg_temp.check_it((select count(*)=0 from pilot.materials),'uninvited student cannot list PDFs');
reset role;
rollback;
\echo 'PASS: pilot RLS, dynamic library, revocation and least-privilege probe'
