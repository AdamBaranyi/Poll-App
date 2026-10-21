#!/usr/bin/env bash
# Runs the SQL files and the security checks in a throwaway Postgres container, once with the
# rights Supabase gave new tables until 30.10.2026 and once without them, like after that day.
# Supabase uses Postgres 17; another version can be set with POSTGRES_IMAGE.
set -euo pipefail

image="${POSTGRES_IMAGE:-postgres:17-alpine}"
container="poll-app-database-test"

# Runs setup, schema, policies, seed and checks in a new database.
# $1 is the name of the database, $2 is true for the old default rights of new tables.
run_checks() {
  docker exec "$container" createdb -U postgres "$1"
  docker exec "$container" psql -U postgres -d "$1" -v ON_ERROR_STOP=1 -q \
    -v old_default_grants="$2" \
    -f /supabase/tests/setup.sql \
    -f /supabase/schema.sql \
    -f /supabase/policies.sql \
    -f /supabase/seed.sql \
    -f /supabase/tests/checks.sql
}

docker run --rm -d --name "$container" -e POSTGRES_PASSWORD=postgres \
  -v "$PWD/supabase:/supabase:ro" "$image" -c wal_level=logical > /dev/null
trap 'docker stop "$container" > /dev/null' EXIT

until docker exec "$container" pg_isready -h 127.0.0.1 -U postgres > /dev/null 2>&1; do
  sleep 1
done

echo 'New tables get all rights (Supabase until 30.10.2026):'
run_checks old_default_grants true
echo 'New tables get no rights (Supabase from 30.10.2026):'
run_checks new_default_grants false
