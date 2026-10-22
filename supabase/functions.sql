-- Functions of the Poll App. Run this file after schema.sql and before policies.sql.

-- Creates a survey with its questions and answers in one step and returns its id. The browser
-- has no insert right on surveys, questions and answer_options, so this is the only way to add
-- them: nobody can add a question to a survey of someone else, and a failure in the middle
-- leaves nothing behind. It runs with the rights of its owner, so it checks the rules of the
-- form itself; the check constraints of the tables still apply.
create or replace function public.create_survey(survey jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_survey_id uuid;
  new_question_id uuid;
  question jsonb;
  question_number integer := 0;
begin
  if jsonb_typeof(survey -> 'questions') is distinct from 'array'
     or jsonb_array_length(survey -> 'questions') not between 1 and 20 then
    raise exception 'A survey needs 1 to 20 questions.' using errcode = 'invalid_parameter_value';
  end if;
  if (survey ->> 'end_date')::timestamptz <= now() then
    raise exception 'A new survey must not end in the past.' using errcode = 'invalid_parameter_value';
  end if;

  insert into public.surveys (title, description, category, end_date)
  values (survey ->> 'title', survey ->> 'description', survey ->> 'category',
          (survey ->> 'end_date')::timestamptz)
  returning id into new_survey_id;

  for question in select value from jsonb_array_elements(survey -> 'questions') loop
    question_number := question_number + 1;
    if jsonb_typeof(question -> 'answers') is distinct from 'array'
       or jsonb_array_length(question -> 'answers') not between 2 and 6 then
      raise exception 'A question needs 2 to 6 answers.' using errcode = 'invalid_parameter_value';
    end if;

    insert into public.questions (survey_id, position, text, allow_multiple)
    values (new_survey_id, question_number, question ->> 'text',
            coalesce((question ->> 'allow_multiple')::boolean, false))
    returning id into new_question_id;

    insert into public.answer_options (question_id, position, label)
    select new_question_id, answer.position, answer.label
    from jsonb_array_elements_text(question -> 'answers') with ordinality as answer (label, position);
  end loop;

  return new_survey_id;
end;
$$;
