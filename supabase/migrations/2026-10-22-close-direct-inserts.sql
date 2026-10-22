-- For a database set up before 22.10.2026, like the live project: from now on surveys, questions
-- and answers only come in through create_survey. Run supabase/functions.sql first, then put the
-- new app online, and only then this file, because the old app still inserts directly.
-- It can run more than once.
revoke insert on public.surveys, public.questions, public.answer_options from anon, authenticated;
drop policy if exists "New surveys must not end in the past" on public.surveys;
drop policy if exists "Questions only for surveys created in the last ten minutes" on public.questions;
drop policy if exists "Answers only for surveys created in the last ten minutes" on public.answer_options;
