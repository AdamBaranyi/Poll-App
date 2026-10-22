-- Access rules for the role anon, which is every visitor of the app (there is no login).
-- Anyone may read everything, create surveys through public.create_survey (functions.sql) and
-- add votes. Nobody may change or delete anything.
-- This file sets up a new database. An existing one gets the changes in supabase/migrations/.

alter table public.surveys enable row level security;
alter table public.questions enable row level security;
alter table public.answer_options enable row level security;
alter table public.votes enable row level security;

-- Depending on the project settings, Supabase gives new tables all rights for anon and
-- authenticated. Everything is taken away first, so only the rights below are left.
-- The insert right on votes names the columns, so the browser cannot set id or created_at.
-- Surveys, questions and answers have no insert right: they only come in through create_survey.
revoke all on public.surveys, public.questions, public.answer_options, public.votes
  from anon, authenticated;
grant usage on schema public to anon;
grant select on public.surveys, public.questions, public.answer_options, public.votes to anon;
grant insert (survey_id, question_id, option_id, submission_id) on public.votes to anon;

create policy "Anyone can read surveys" on public.surveys
  for select to anon using (true);

create policy "Anyone can read questions" on public.questions
  for select to anon using (true);

create policy "Anyone can read answer options" on public.answer_options
  for select to anon using (true);

create policy "Anyone can read votes" on public.votes
  for select to anon using (true);

create policy "Votes only while the survey is running" on public.votes
  for insert to anon
  with check (
    exists (
      select 1
      from public.surveys
      where surveys.id = votes.survey_id
        and (surveys.end_date is null or surveys.end_date > now())
    )
  );

-- Realtime sends every new vote to the open detail views.
alter publication supabase_realtime add table public.votes;
