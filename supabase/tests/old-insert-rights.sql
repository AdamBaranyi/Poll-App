-- Only for tests: the insert rights a database set up before 22.10.2026 still has, like the live
-- project until supabase/migrations/2026-10-22-close-direct-inserts.sql has run.
grant insert (title, description, category, end_date) on public.surveys to anon;
grant insert (survey_id, position, text, allow_multiple) on public.questions to anon;
grant insert (question_id, position, label) on public.answer_options to anon;

create policy "New surveys must not end in the past" on public.surveys
  for insert to anon
  with check (end_date is null or end_date > now());

create policy "Questions only for surveys created in the last ten minutes" on public.questions
  for insert to anon
  with check (
    exists (
      select 1 from public.surveys
      where surveys.id = questions.survey_id and surveys.created_at > now() - interval '10 minutes'
    )
  );

create policy "Answers only for surveys created in the last ten minutes" on public.answer_options
  for insert to anon
  with check (
    exists (
      select 1 from public.questions
      join public.surveys on surveys.id = questions.survey_id
      where questions.id = answer_options.question_id
        and surveys.created_at > now() - interval '10 minutes'
    )
  );
