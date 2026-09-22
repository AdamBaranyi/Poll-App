-- Access rules for the role anon, which is every visitor of the app (there is no login).
-- Anyone may read everything and create surveys and votes. Nobody may change or delete anything.

alter table public.surveys enable row level security;
alter table public.questions enable row level security;
alter table public.answer_options enable row level security;
alter table public.votes enable row level security;

-- New Supabase projects expose no table by default, so every right is granted here on purpose.
-- Insert rights name the columns, so the browser cannot set id or created_at itself.
grant usage on schema public to anon;
grant select on public.surveys, public.questions, public.answer_options, public.votes to anon;
grant insert (title, description, category, end_date) on public.surveys to anon;
grant insert (survey_id, position, text, allow_multiple) on public.questions to anon;
grant insert (question_id, position, label) on public.answer_options to anon;
grant insert (survey_id, question_id, option_id, submission_id) on public.votes to anon;

create policy "Anyone can read surveys" on public.surveys
  for select to anon using (true);

create policy "Anyone can read questions" on public.questions
  for select to anon using (true);

create policy "Anyone can read answer options" on public.answer_options
  for select to anon using (true);

create policy "Anyone can read votes" on public.votes
  for select to anon using (true);

create policy "New surveys must not end in the past" on public.surveys
  for insert to anon
  with check (end_date is null or end_date > now());

-- Questions and answers can only be added while a survey is being created (ten minutes),
-- so nobody can add questions to a survey of someone else later.
create policy "Questions only for surveys created in the last ten minutes" on public.questions
  for insert to anon
  with check (
    exists (
      select 1
      from public.surveys
      where surveys.id = questions.survey_id
        and surveys.created_at > now() - interval '10 minutes'
    )
  );

create policy "Answers only for surveys created in the last ten minutes" on public.answer_options
  for insert to anon
  with check (
    exists (
      select 1
      from public.questions
      join public.surveys on surveys.id = questions.survey_id
      where questions.id = answer_options.question_id
        and surveys.created_at > now() - interval '10 minutes'
    )
  );

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
