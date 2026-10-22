-- Only for tests in a plain Postgres: creates what every Supabase project already has.
-- Roles belong to the whole server, so the second run finds them already there.
select 'create role anon nologin'
where not exists (select from pg_roles where rolname = 'anon') \gexec
select 'create role authenticated nologin'
where not exists (select from pg_roles where rolname = 'authenticated') \gexec
create publication supabase_realtime;

-- Until 30.10.2026 Supabase gave every new table in public all rights for anon and
-- authenticated. From then on new tables get no rights at all, so policies.sql has to
-- grant everything the app needs itself. scripts/test-database.sh runs the checks both ways.
\if :old_default_grants
alter default privileges in schema public grant all on tables to anon, authenticated;
\endif
