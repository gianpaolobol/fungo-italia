# Free pilot foundation implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first isolated increment: external continuity monitoring and private course/material authorization.

**Architecture:** A dedicated Cloudflare Worker reads a least-privilege Supabase database probe; a durable external KV record retains monitoring state during database outages. PostgreSQL RLS separates courses, memberships and PDF access. No production app imports this increment.

**Tech Stack:** Node 24 tests, standard Web APIs, Cloudflare Workers Free/KV, PostgreSQL/Supabase; no new app dependency.

**Spec:** `docs/superpowers/specs/2026-10-31-free-pilot-approved.md` and PR144 design beside it.

## Global Constraints

- Budget 0 € within free quotas; no automatic upgrade, purchases or live messages.
- Branch `feat/teacher-student-pilot-free-20261031`, base main `83fe69483c344905765ed75ed456aad4c1b72918`.
- Preserve app, entitlements, scientific data, receipts, existing workflows and releases byte-for-byte.
- Continuity is P0 and cannot be called solved without eight-day live qualification.
- 30 students, 1 GB active files, 20 MB/PDF. No identities or secrets in repository.
- Execute inline: user already authorized implementation; no further plan-approval pause.

## Review Focus

- Successful HTTP response without real database result must fail the probe.
- Lost scheduler and lost database are different failures; stale external state must be visible.
- Ambiguous email timeout must not trigger repeated mail or consume all login quota.
- Rejoining a group restores PDF library, but does not recover stale test membership.
- Anonymous users and another teacher must never obtain private material metadata.

### Task 1: External monitor and deterministic state machine

**Files:** `pilot/continuity/{monitor.mjs,monitor.test.mjs}`.
**Interfaces:** `probeDatabase(config,fetcher) -> Promise<Probe>`; `transition(previous,probe,now) -> {state,notice}`. Probe contains `ok,code`; no provider bodies/secrets. State contains bounded failure count, last successful DB read and notice markers.

- [ ] Write tests for actual-row requirement, credential failure, redirect refusal, timeout, consecutive failures, recovery, weekly summary and overdue scheduler.
- [ ] Run `node --test pilot/continuity/monitor.test.mjs`, observe RED.
- [ ] Implement minimal validated probe and deterministic state transitions; no student content in notices.
- [ ] Run same command, require GREEN; commit.

### Task 2: Worker integration, external persistence, bounded email

**Files:** `pilot/continuity/{worker.mjs,worker.test.mjs,wrangler.example.toml}`.
**Interfaces:** consumes Task1; Worker `scheduled` and authenticated `GET /status`. KV holds only operational state. Brevo notice recipient/sender configured privately, weekly notices off until configured. Every scheduled run must propagate DB/persistence failures; alert sending cannot make outage healthy.

- [ ] Write tests with real local HTTP fixture for Supabase/Brevo boundaries and KV substitute: repeated failures, failed sends, recovery, stale status, disabled monitor and invalid config.
- [ ] Run tests RED, implement, then run `node --test pilot/continuity/*.test.mjs` GREEN; commit.
- [ ] Template has no active cron until operator enables dedicated environment. No public trigger or arbitrary endpoint URL.

### Task 3: Database probe and private course/material policies

**Files:** `pilot/database/{001-foundation.sql,foundation.test.sql}`, `pilot/verify-postgres.sh`.
**Interfaces:** probe uses `pilot_health` schema, exposed explicitly only for probe role; course API uses `pilot` schema, no anonymous grants. Dedicated probe role reads one nonpersonal row. Stable membership UUID and revoked timestamp. PDF SELECT derives current group membership. Materials default to quarantine; only backend scanner may mark ready.

- [ ] Write SQL tests for probe privilege isolation, teacher/course boundaries, verified-email enrollment, overlap, revoked/rejoined membership and quarantine/retraction.
- [ ] Add SQL migration; execute rollback-only SQL tests against temporary PostgreSQL in isolated CI. Do not claim local PostgreSQL verification if runtime unavailable.
- [ ] Add safe CI restricted to this branch and pilot paths, Node plus PostgreSQL only; no deployment, native builds or secrets.

### Task 4: Readiness gate, runbook and evidence

**Files:** `pilot/{readiness.mjs,readiness.test.mjs,README.md}`, `pilot/continuity/qualification.example.json`, `docs/HANDOFF.md`, `docs/MASTER_PROJECT_STATUS.md`.
**Interfaces:** `assessQualification(evidence,now) -> {ready,blockers}`; refuses live-ready without eight days, real DB path, scheduler freshness, failure/recovery, received alerts and restore proof, zero billing and free quota headroom.

- [ ] Write RED tests for missing/forged order/future/stale evidence and positive literal fixture; implement GREEN.
- [ ] Document deployment, restricted credentials, external watchdog and pause recovery, backup responsibilities. Mark P0 open until live evidence.
- [ ] Record unavailable services as blockers, never green synthetic receipts; update handoffs and commit.

### Task 5: Independent review and draft PR

- [ ] Run all new Node tests, syntax checks and isolation verification.
- [ ] Review full delta with a fresh reviewer, fix important findings with RED→GREEN regression tests.
- [ ] Publish exact tested files using GitHub tree/commit APIs preserving the complete base tree (local checkout is a partial text snapshot because direct git transport is unavailable).
- [ ] Open draft PR, inspect isolated CI results, fix failures and verify remote branch diff. No merge or deployment.
- [ ] Final report distinguishes implemented, tested, not deployed and outstanding P0 qualification.
