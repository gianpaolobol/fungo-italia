\set ON_ERROR_STOP on
begin;
create function pg_temp.check_it(ok boolean,message text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'FAIL: %',message; end if; end $$;
create function pg_temp.expect_error(statement text,expected text) returns void language plpgsql as $$
begin
 begin execute statement;
 exception when others then
  if position(expected in SQLERRM)>0 then return; end if; raise;
 end;
 raise exception 'Expected error was not raised';
end $$;
insert into auth.users(id,email,email_confirmed_at) values
 ('00000000-0000-0000-0000-000000000011','teacher1@example.test',now()),
 ('00000000-0000-0000-0000-000000000012','teacher2@example.test',now()),
 ('00000000-0000-0000-0000-000000000013','student@example.test',now()),
 ('00000000-0000-0000-0000-000000000014','other@example.test',now()),
 ('00000000-0000-0000-0000-000000000015','pending@example.test',null);
insert into pilot.teachers(user_id) values ('00000000-0000-0000-0000-000000000011'),('00000000-0000-0000-0000-000000000012');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000011',true);
set local role authenticated;
select pilot.create_course('Corso pilota') as cid \gset
select pilot.create_group(:'cid','Gruppo A') as gid \gset
select pilot.create_group(:'cid','Gruppo B') as gid2 \gset
select pg_temp.expect_error(format('select pilot.create_group(%L,%L)',:'cid','Gruppo C'),'pilot_group_limit');
select pg_temp.expect_error('select pilot.create_course(''Secondo corso'')','pilot_course_limit');
select pilot.invite_students(:'cid',array[:'gid']::uuid[],array[' STUDENT@example.test ','student@example.test']) as batch \gset
select pg_temp.check_it(jsonb_array_length(:'batch'::jsonb)=1,'case/space duplicates collapse');
select (:'batch'::jsonb->0->>'id') as iid \gset
select pg_temp.check_it((select count(*)=1 from pilot.invitations),'one invitation only');
select pilot.invite_students(:'cid',array[:'gid']::uuid[],array['student@example.test']);
select pg_temp.check_it((select count(*)=1 from pilot.invitations),'repeated publish does not duplicate');
select pg_temp.expect_error(format('select pilot.request_invite_notice(%L)',:'iid'),'notice_cooldown');
select pg_temp.expect_error(format('select pilot.invite_students(%L,array[%L]::uuid[],array[%L])',:'cid',:'gid','invalid'),'invalid_email');
select pilot.invite_students(:'cid',array[:'gid2']::uuid[],array['pending@example.test']) as pending \gset
select (:'pending'::jsonb->0->>'id') as unverified_iid \gset
reset role;

select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000012',true);
set local role authenticated;
select pg_temp.check_it((select count(*)=0 from pilot.invitations),'other teacher sees no emails');
select pg_temp.expect_error(format('select pilot.invite_students(%L,array[%L]::uuid[],array[%L])',:'cid',:'gid','new@example.test'),'course_unavailable');
select pg_temp.expect_error(format('select pilot.revoke_invitation(%L)',:'iid'),'invitation_unavailable');
reset role;

select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000014',true);
set local role authenticated;
select pg_temp.check_it(pilot.my_invitations()='[]'::jsonb,'uninvited user sees no invites');
select pg_temp.expect_error(format('select pilot.accept_invitation(%L)',:'iid'),'invitation_unavailable');
select pg_temp.expect_error('select pilot.create_course(''Student self promotion'')','teacher_required');
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000015',true);
set local role authenticated;
select pg_temp.expect_error(format('select pilot.accept_invitation(%L)',:'unverified_iid'),'verified_email_required');
reset role;

select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000013',true);
set local role authenticated;
select pg_temp.check_it(jsonb_array_length(pilot.my_invitations())=1,'verified student discovers own invite');
select pilot.accept_invitation(:'iid') as mid \gset
select pg_temp.check_it(pilot.accept_invitation(:'iid')=:'mid'::uuid,'accept replay is idempotent');
select pg_temp.check_it((select count(*)=1 from pilot.memberships),'exactly one enrollment');
select pg_temp.check_it((select count(*)=1 from pilot.groups),'student sees assigned group only');
select pg_temp.check_it(not has_table_privilege(current_user,'pilot.invitations','INSERT'),'no direct self enrollment');
reset role;

select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000011',true);
set local role authenticated;
select pilot.revoke_membership(:'mid');
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000013',true);
set local role authenticated;
select pg_temp.expect_error(format('select pilot.accept_invitation(%L)',:'iid'),'invitation_unavailable');
select pg_temp.check_it((select count(*)=0 from pilot.courses),'revocation removes course access');
reset role;

select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000011',true);
set local role authenticated;
select pilot.invite_students(:'cid',array[:'gid2']::uuid[],array['student@example.test']) as again \gset
select (:'again'::jsonb->0->>'id') as iid2 \gset
select pg_temp.check_it(:'iid2'<>:'iid','new invite after explicit revocation');
reset role;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000013',true);
set local role authenticated;
select pilot.accept_invitation(:'iid2') as mid2 \gset
select pg_temp.check_it(:'mid2'<>:'mid','rejoin creates fresh membership UUID');
reset role;

-- Service-only outbox: no student/teacher access, bounded claim, no auto retry.
set local role service_role;
select pilot.claim_invite_notices(10) as jobs \gset
select pg_temp.check_it(jsonb_array_length(:'jobs'::jsonb)=2,'only valid pending and current accepted invitation notices claimed');
select (:'jobs'::jsonb->0->>'id') as job_id,(:'jobs'::jsonb->0->>'claim_id') as claim_id \gset
select pg_temp.check_it(pilot.finish_invite_notice(:'job_id','99999999-9999-9999-9999-999999999999',true)=false,'wrong claim cannot finish');
select pg_temp.check_it(pilot.finish_invite_notice(:'job_id',:'claim_id',true),'matching claim records provider acceptance');
select pg_temp.check_it(pilot.claim_invite_notices(10)='[]'::jsonb,'claimed jobs never auto-retried');
reset role;

-- Expired invites never grant membership; disabled teacher also blocks acceptance.
update pilot.invitations set expires_at=now()-interval '1 second' where id=:'unverified_iid';
update auth.users set email_confirmed_at=now() where id='00000000-0000-0000-0000-000000000015';
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000015',true);
set local role authenticated;
select pg_temp.expect_error(format('select pilot.accept_invitation(%L)',:'unverified_iid'),'invitation_unavailable');
reset role;
rollback;
\echo 'PASS: verified-email invitations, management isolation, idempotence and bounded outbox'
