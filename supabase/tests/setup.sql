-- Only for tests in a plain Postgres: creates what every Supabase project already has.
create role anon nologin;
create role authenticated nologin;
create publication supabase_realtime;
