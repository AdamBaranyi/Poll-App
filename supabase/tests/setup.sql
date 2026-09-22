-- Only for tests in a plain Postgres: creates what every Supabase project already has.
create role anon nologin;
create role authenticated nologin;
create publication supabase_realtime;

-- Like a Supabase project with "Automatically expose new tables" switched on, which gives
-- every new table all rights for anon and authenticated.
alter default privileges in schema public grant all on tables to anon, authenticated;
