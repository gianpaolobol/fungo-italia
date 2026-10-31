# Pilot invitations implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans inline, task-by-task. User already authorized development; no new design decision or paid service is introduced.

**Goal:** Let an administratively enabled teacher create the pilot course/groups, invite verified-email students, accept/revoke enrollments and queue bounded invitation emails.

**Architecture:** Additive PostgreSQL migration with transactional security-definer RPCs and RLS. The existing versioned client gains RPC operations without importing app UI, billing or local history. A separate scheduled mail Worker claims a durable outbox; nothing is deployed or sent in this increment.

**Tech Stack:** PostgreSQL 17/Supabase Auth; plain ESM/Web APIs; Node24 regression tests; isolated existing CI. No app dependency.

**Spec:** `../specs/2026-10-31-free-pilot-approved.md`, PR144 design.

## Global Constraints
- Same dedicated branch; current beta/app/scientific files unchanged.
- Free services only; no actual account creation/deploy/messages. P0 #145 stays open.
- One active pilot course, max two groups, 30 active students plus pending reservations.
- Email trim/lowercase only; never remove Gmail dots or plus suffixes.
- Enrollment uses auth.users verified email, not editable JWT metadata, phone or beta code.
- Email notices never confer access. Receipt means provider acceptance, not delivery/read.
- API v1 additive; update to future corrected app SHA before UI integration.

## Review Focus
- Different or unverified email cannot accept even with invitation ID.
- Replayed acceptance is idempotent; revoke/rejoin creates a new membership UUID.
- Revoked teacher/closed course cannot invite, accept or send queued notices.
- Concurrent invitation acceptance must preserve the 30-student cap.
- Claim/send failure cannot silently retry an uncertain email and waste the free quota.

### Task 1: Transactional invitations and management RPC
Files: `pilot/database/002-invitations.sql`, `invitations.test.sql`, fixture and runner.
Interfaces: `create_course(title) -> uuid`, `create_group(course_id,title) -> uuid`,
`invite_students(course_id,group_ids,emails) -> jsonb`, `my_invitations() -> jsonb`,
`accept_invitation(invitation_id) -> uuid`, `revoke_invitation(invitation_id) -> void`,
`revoke_membership(membership_id) -> void`, `request_invite_notice(invitation_id) -> uuid`.
- [ ] Write SQL tests for verified identity, owner isolation, deduplication, expiry/revocation, replay, dynamic PDFs, limits and new membership on rejoin.
- [ ] Execute real PostgreSQL tests via isolated CI RED, add migration, execute GREEN.
- [ ] Keep direct table writes denied to clients; reject student/teacher self-promotion.

### Task 2: Versioned client mutations
Files: `pilot/client.mjs`, `pilot/client.test.mjs`.
Interfaces: same v1 client with `createCourse`, `createGroup`, `inviteStudents`,
`listInvitations`, `acceptInvitation`, `revokeInvitation`, `revokeMembership`, `resendInvitation`.
- [ ] Test payload/schema/session guards and server errors RED; implement RPC POST and GREEN.
- [ ] Recheck session after response body, never cache identities or alter billing.

### Task 3: Outbox dispatcher
Files: `pilot/invitations/{mailer.mjs,mailer.test.mjs,wrangler.example.toml}`;
service-only RPC `claim_invite_notices(limit)`, `finish_invite_notice(job_id,claim_id,accepted)`.
- [ ] Test queued jobs, wrong claim, revoked/closed jobs, provider rejection/ambiguous failure and capped batch RED→GREEN.
- [ ] Claim atomically with skip-locked, cap 60 invitation attempts/day (both pending and completed claims counted), max10/batch, explicit cooldown for resend.
- [ ] No automatic retry of claimed/uncertain messages. No real mail or secret in repo.

### Task 4: Review and publish
- [ ] Run all Node + PostgreSQL tests; independent review, regression fixes.
- [ ] Update runbook/status/handoff and PR146 around final increment; preserve entire base tree through GitHub API with expected-head lease.
- [ ] Verify remote diff and CI on exact commit; retain draft, no merge/deploy.
- [ ] Report pending UI, OTP configuration, upload/scanning/runner and live P0 qualification explicitly.
