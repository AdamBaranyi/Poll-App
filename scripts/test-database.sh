#!/usr/bin/env bash
# Runs the SQL files and the security checks in a throwaway Postgres container.
# Supabase uses Postgres 17; another version can be set with POSTGRES_IMAGE.
set -euo pipefail

image="${POSTGRES_IMAGE:-postgres:17-alpine}"
container="poll-app-database-test"

docker run --rm -d --name "$container" -e POSTGRES_PASSWORD=postgres \
  -v "$PWD/supabase:/supabase:ro" "$image" -c wal_level=logical > /dev/null
trap 'docker stop "$container" > /dev/null' EXIT

until docker exec "$container" pg_isready -h 127.0.0.1 -U postgres > /dev/null 2>&1; do
  sleep 1
done

docker exec "$container" psql -U postgres -v ON_ERROR_STOP=1 -q \
  -f /supabase/tests/setup.sql \
  -f /supabase/schema.sql \
  -f /supabase/policies.sql \
  -f /supabase/seed.sql \
  -f /supabase/tests/checks.sql
