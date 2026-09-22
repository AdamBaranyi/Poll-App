-- Security checks for the role anon. Run after schema.sql, policies.sql and seed.sql.
-- Everything happens in one transaction that is rolled back at the end, so this file can also
-- run against the real database without leaving anything behind. A failed check stops with
-- an error that starts with FAILED.

begin;

-- A running survey that was created two hours ago, for the ten-minute rule.
insert into public.surveys (id, title, category, end_date, created_at)
values ('00000000-0000-4000-8000-00000000c0de', 'Older running survey', 'Team Activities',
        now() + interval '3 days', now() - interval '2 hours');

set local role anon;

do $$
begin
  if (select count(*) from public.surveys) = 0 then
    raise exception 'FAILED: anon cannot read surveys';
  end if;
end $$;

-- A new survey with questions and answers can be created in one go.
do $$
declare
  new_survey uuid;
  new_question uuid;
begin
  insert into public.surveys (title, category, end_date)
  values ('Check survey', 'Team Activities', now() + interval '2 days')
  returning id into new_survey;
  insert into public.questions (survey_id, position, text)
  values (new_survey, 1, 'Check question?')
  returning id into new_question;
  insert into public.answer_options (question_id, position, label)
  values (new_question, 1, 'Yes'), (new_question, 2, 'No');
end $$;

do $$
begin
  insert into public.surveys (title, category, end_date)
  values ('Ended survey', 'Team Activities', now() - interval '1 day');
  raise exception 'FAILED: anon created a survey that has already ended';
exception when insufficient_privilege then null;
end $$;

do $$
begin
  insert into public.surveys (title, category, created_at)
  values ('Backdated survey', 'Team Activities', now() - interval '1 year');
  raise exception 'FAILED: anon set created_at itself';
exception when insufficient_privilege then null;
end $$;

do $$
begin
  insert into public.questions (survey_id, position, text)
  values ('00000000-0000-4000-8000-00000000c0de', 1, 'Late question?');
  raise exception 'FAILED: anon added a question to an older survey';
exception when insufficient_privilege then null;
end $$;

-- Voting works on a running survey (sample survey 1) ...
insert into public.votes (survey_id, question_id, option_id, submission_id)
select questions.survey_id, questions.id, answer_options.id, gen_random_uuid()
from public.questions
join public.answer_options on answer_options.question_id = questions.id
where questions.survey_id = '5eed0000-0000-4000-8000-000000000001'
limit 1;

-- ... but not on an ended one (sample survey 7).
do $$
begin
  insert into public.votes (survey_id, question_id, option_id, submission_id)
  select questions.survey_id, questions.id, answer_options.id, gen_random_uuid()
  from public.questions
  join public.answer_options on answer_options.question_id = questions.id
  where questions.survey_id = '5eed0000-0000-4000-8000-000000000007'
  limit 1;
  raise exception 'FAILED: anon voted on an ended survey';
exception when insufficient_privilege then null;
end $$;

-- A vote cannot combine a running survey with an answer of an ended survey.
do $$
begin
  insert into public.votes (survey_id, question_id, option_id, submission_id)
  select '5eed0000-0000-4000-8000-000000000001', questions.id, answer_options.id, gen_random_uuid()
  from public.questions
  join public.answer_options on answer_options.question_id = questions.id
  where questions.survey_id = '5eed0000-0000-4000-8000-000000000007'
  limit 1;
  raise exception 'FAILED: anon mixed a running survey with an answer of an ended one';
exception when foreign_key_violation then null;
end $$;

do $$
begin
  update public.surveys set title = 'Changed title';
  raise exception 'FAILED: anon changed a survey';
exception when insufficient_privilege then null;
end $$;

do $$
begin
  delete from public.votes;
  raise exception 'FAILED: anon deleted votes';
exception when insufficient_privilege then null;
end $$;

-- Row level security does not apply to truncate, so only the missing right can stop it.
do $$
begin
  truncate public.votes;
  raise exception 'FAILED: anon emptied the votes table';
exception when insufficient_privilege then null;
end $$;

select 'All security checks passed' as result;

rollback;
