#!/usr/bin/env bash
set -euo pipefail
# DATABASE_URL must point ONLY to an empty disposable test database.
: "${PILOT_TEST_DATABASE_URL:?Set a disposable pilot test database URL}"
psql "$PILOT_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f pilot/database/fixture.sql
psql "$PILOT_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f pilot/database/001-foundation.sql
psql "$PILOT_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f pilot/database/foundation.test.sql
