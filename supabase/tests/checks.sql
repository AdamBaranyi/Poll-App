-- Security checks for the role anon. Run after schema.sql, policies.sql and seed.sql.
-- Everything happens in one transaction that is rolled back at the end, so this file can also
-- run against the real database without leaving anything behind. A failed check stops with
-- an error that starts with FAILED.

begin;

set local role anon;

do $$
begin
  if (select count(*) from public.surveys) = 0 then
    raise exception 'FAILED: anon cannot read surveys';
  end if;
end $$;

-- A new survey with its questions and answers is created in one step through create_survey.
do $$
declare
  new_survey uuid;
begin
  new_survey := public.create_survey('{"title": "Check survey", "description": null,
    "category": "Team Activities", "end_date": null,
    "questions": [{"text": "Check question?", "allow_multiple": false, "answers": ["Yes", "No"]}]}');
  if (select count(*) from public.answer_options
      join public.questions on questions.id = answer_options.question_id
      where questions.survey_id = new_survey) <> 2 then
    raise exception 'FAILED: create_survey did not save the question with its answers';
  end if;
end $$;

-- Nobody can add anything to a survey directly, also not to the newest one of someone else.
do $$
begin
  insert into public.surveys (title, category) values ('Direct survey', 'Team Activities');
  raise exception 'FAILED: anon inserted a survey directly';
exception when insufficient_privilege then null;
end $$;

do $$
begin
  insert into public.questions (survey_id, position, text)
  select id, 20, 'Foreign question?' from public.surveys order by created_at desc limit 1;
  raise exception 'FAILED: anon added a question to the newest survey of someone else';
exception when insufficient_privilege then null;
end $$;

do $$
begin
  insert into public.answer_options (question_id, position, label)
  select id, 6, 'Foreign answer' from public.questions limit 1;
  raise exception 'FAILED: anon added an answer to a question of someone else';
exception when insufficient_privilege then null;
end $$;

-- create_survey keeps the rules of the form.
do $$
begin
  perform public.create_survey('{"title": "Ended survey", "category": "Team Activities",
    "end_date": "2000-01-01T00:00:00Z", "questions": [{"text": "Too late?", "answers": ["Yes", "No"]}]}');
  raise exception 'FAILED: create_survey accepted a survey that has already ended';
exception when invalid_parameter_value then null;
end $$;

do $$
begin
  perform public.create_survey('{"title": "Empty survey", "category": "Team Activities", "questions": []}');
  raise exception 'FAILED: create_survey accepted a survey without questions';
exception when invalid_parameter_value then null;
end $$;

do $$
begin
  perform public.create_survey(jsonb_build_object('title', 'Long survey', 'category', 'Team Activities',
    'questions', (select jsonb_agg(jsonb_build_object('text', 'Question ' || n || '?',
      'answers', jsonb_build_array('Yes', 'No'))) from generate_series(1, 21) as n)));
  raise exception 'FAILED: create_survey accepted 21 questions';
exception when invalid_parameter_value then null;
end $$;

do $$
begin
  perform public.create_survey('{"title": "Single answer", "category": "Team Activities",
    "questions": [{"text": "Only one answer?", "answers": ["Yes"]}]}');
  raise exception 'FAILED: create_survey accepted a question with one answer';
exception when invalid_parameter_value then null;
end $$;

do $$
begin
  perform public.create_survey('{"title": "Many answers", "category": "Team Activities",
    "questions": [{"text": "Seven answers?", "answers": ["A", "B", "C", "D", "E", "F", "G"]}]}');
  raise exception 'FAILED: create_survey accepted a question with seven answers';
exception when invalid_parameter_value then null;
end $$;

-- A failure in the middle leaves nothing behind, and created_at is always set by the database.
do $$
begin
  perform public.create_survey('{"title": "Half survey", "category": "Team Activities",
    "questions": [{"text": "Fine question?", "answers": ["Yes", "No"]},
                  {"text": "x", "answers": ["Yes", "No"]}]}');
  raise exception 'FAILED: create_survey accepted a question that is too short';
exception when check_violation then null;
end $$;

do $$
begin
  if exists (select 1 from public.surveys where title = 'Half survey') then
    raise exception 'FAILED: a failed create_survey left a survey behind';
  end if;
end $$;

do $$
declare
  new_survey uuid;
begin
  new_survey := public.create_survey('{"title": "Backdated survey", "category": "Team Activities",
    "created_at": "2000-01-01T00:00:00Z", "questions": [{"text": "Backdated?", "answers": ["Yes", "No"]}]}');
  if (select created_at from public.surveys where id = new_survey) < now() - interval '1 minute' then
    raise exception 'FAILED: create_survey let the browser set created_at';
  end if;
end $$;

-- Only anon may call create_survey: neither every role (PUBLIC) nor authenticated.
do $$
begin
  if exists (select 1 from pg_proc, aclexplode(proacl) as acl
             where proname = 'create_survey' and acl.grantee = 0) then
    raise exception 'FAILED: every role may execute create_survey';
  end if;
  if has_function_privilege('authenticated', 'public.create_survey(jsonb)', 'execute') then
    raise exception 'FAILED: authenticated may execute create_survey';
  end if;
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
