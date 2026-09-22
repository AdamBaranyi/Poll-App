-- Tables of the Poll App. Run this file first, then policies.sql and seed.sql.

create table public.surveys (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 120),
  description text check (char_length(description) <= 500),
  category text not null check (
    category in (
      'Team Activities',
      'Health & Wellness',
      'Gaming & Entertainment',
      'Education & Learning',
      'Lifestyle & Preferences',
      'Technology & Innovation'
    )
  ),
  end_date timestamptz,
  created_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys (id) on delete cascade,
  position smallint not null check (position between 1 and 20),
  text text not null check (char_length(text) between 3 and 200),
  allow_multiple boolean not null default false,
  unique (survey_id, position),
  unique (id, survey_id)
);

-- Position 1 to 6 stands for the answers A to F, so a question has at most six answers.
create table public.answer_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  position smallint not null check (position between 1 and 6),
  label text not null check (char_length(label) between 1 and 120),
  unique (question_id, position),
  unique (id, question_id)
);

-- The two combined foreign keys make sure that option, question and survey of a vote belong
-- together, so a vote cannot point to a running survey with an answer of an ended one.
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys (id) on delete cascade,
  question_id uuid not null,
  option_id uuid not null,
  submission_id uuid not null,
  created_at timestamptz not null default now(),
  foreign key (question_id, survey_id) references public.questions (id, survey_id) on delete cascade,
  foreign key (option_id, question_id) references public.answer_options (id, question_id) on delete cascade,
  unique (submission_id, option_id)
);

create index questions_survey_id_idx on public.questions (survey_id);
create index answer_options_question_id_idx on public.answer_options (question_id);
create index votes_survey_id_idx on public.votes (survey_id);
create index votes_question_survey_idx on public.votes (question_id, survey_id);
create index votes_option_question_idx on public.votes (option_id, question_id);
