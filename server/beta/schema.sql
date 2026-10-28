CREATE TABLE IF NOT EXISTS beta_grants (
 id TEXT PRIMARY KEY NOT NULL,
 email TEXT NOT NULL UNIQUE,
 invite_hash TEXT UNIQUE,
 invite_expires_at INTEGER,
 session_hash TEXT UNIQUE,
 activated_at INTEGER,
 expires_at INTEGER,
 revoked_at INTEGER,
 created_at INTEGER NOT NULL,
 updated_at INTEGER NOT NULL,
 version INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS beta_rates (
 id TEXT PRIMARY KEY NOT NULL,
 window INTEGER NOT NULL,
 hits INTEGER NOT NULL
);
