# Scientific review workbench — reviewer handoff

## Purpose

The private beta is already safe because scientific claims still in `reviewNeeded`
are not exposed as public facts. This workbench prepares the remaining scientific
completion step for an independent mycological reviewer.

## Current review scope

The repository currently contains:

- **616** review-needed claims;
- deduplicated into **295** review packets;
- **98 critical** packets;
- **137 high-priority** packets;
- **60 normal-priority** packets.

Critical packets are limited to safety-relevant content such as edibility,
required treatment and high/deadly confusion claims.

## Packet contents

Each packet contains:

- stable packet and batch IDs;
- priority and claim type;
- all claim IDs covered by the decision;
- all subject IDs affected;
- exact structured value under review;
- evidence IDs;
- source title and source type;
- source location;
- source URL when one exists;
- evidence summary, strength and current review state.

No source URL is fabricated for internal editorial syntheses.

## Reviewer export

CI generates two artifacts:

- `artifacts/scientific-review/packets.json`
- `artifacts/scientific-review/packets.md`

The JSON form is suitable for importing into a review tool. The Markdown form is
human-readable and can be handed directly to an independent reviewer.

The artifact is uploaded by GitHub Actions on every validated workbench commit.

## Review policy

A reviewer must not approve a reusable editorial pattern only because it occurs
many times. The packet deduplication is an ergonomic optimization, not a scientific
shortcut.

For safety claims, the decision is atomic at the evidence/value level. A rejection
or requested correction must identify the issue in the reviewer note before any
status change is applied to the catalog.

The repository does not auto-promote `reviewNeeded` to `reviewed` or
`approved`.

## Source hierarchy

The workbench preserves the distinction between:

- S1 — official course learning-objective document;
- S2 — *Guida ragionata alla commestibilità dei funghi*;
- nomenclatural databases/revisions;
- internal editorial synthesis, which is never treated as a primary scientific
  source by itself.

## Next implementation step

After this packet export is green in CI, the next step is a persistent reviewer
decision store and an admin UI that records reviewer identity, timestamp,
decision and notes without editing generated catalog files manually.
