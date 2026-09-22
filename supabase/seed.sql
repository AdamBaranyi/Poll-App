-- Sample surveys with own texts. All dates are relative to now(), so run this file again shortly
-- before the review to keep "Ending soon" right. Surveys created in the app are not touched:
-- only the sample surveys have ids that start with 5eed0000.

delete from public.surveys where id::text like '5eed0000-%';

insert into public.surveys (id, title, description, category, end_date, created_at) values
  ('5eed0000-0000-4000-8000-000000000001', 'Let''s plan the next team event together',
   'The project is done and we want to celebrate it with the whole team. Tell us when and how you would like to spend the day.',
   'Team Activities', now() + interval '1 day 3 hours', now() - interval '10 days'),
  ('5eed0000-0000-4000-8000-000000000002', 'Healthier future: fit and wellness survey',
   'We are planning new offers for a healthier workday. Your answers help us choose the right ones.',
   'Health & Wellness', now() + interval '2 days 5 hours', now() - interval '6 days'),
  ('5eed0000-0000-4000-8000-000000000003', 'Gaming habits and favorite games',
   'Before the next game night we would like to know what and how you like to play.',
   'Gaming & Entertainment', now() + interval '3 days 2 hours', now() - interval '4 days'),
  ('5eed0000-0000-4000-8000-000000000004', 'Which learning format works best for you?',
   'We want to plan workshops that really help. Tell us how you learn best.',
   'Education & Learning', now() + interval '5 days 4 hours', now() - interval '3 days'),
  ('5eed0000-0000-4000-8000-000000000005', 'Coffee or tea: how do you start your day?',
   null,
   'Lifestyle & Preferences', null, now() - interval '8 days'),
  ('5eed0000-0000-4000-8000-000000000006', 'Which tools make your workday easier?',
   'We are looking at the tools we use every day and want to hear what works for you.',
   'Technology & Innovation', now() + interval '12 days', now() - interval '2 days'),
  ('5eed0000-0000-4000-8000-000000000007', 'Where should the summer outing go?',
   'Thanks for voting! The results helped us book this year''s summer outing.',
   'Team Activities', now() - interval '10 days', now() - interval '30 days'),
  ('5eed0000-0000-4000-8000-000000000008', 'Lunch break habits',
   'A short survey about how you spend your lunch break.',
   'Health & Wellness', now() - interval '3 days', now() - interval '21 days'),
  ('5eed0000-0000-4000-8000-000000000009', 'Feedback on the onboarding week',
   'Help us make the first week for new colleagues even better.',
   'Education & Learning', now() - interval '20 days', now() - interval '40 days'),
  ('5eed0000-0000-4000-8000-000000000010', 'Movie night: pick the genre',
   'Once a month we watch a movie together. Choose what comes next.',
   'Gaming & Entertainment', null, now() - interval '5 days'),
  ('5eed0000-0000-4000-8000-000000000011', 'Remote work setup check',
   'How well are you equipped when you work outside the office?',
   'Technology & Innovation', now() - interval '1 day 2 hours', now() - interval '15 days'),
  ('5eed0000-0000-4000-8000-000000000012', 'Weekend plans: city or nature?',
   null,
   'Lifestyle & Preferences', now() + interval '4 days 6 hours', now() - interval '1 day');

-- Columns: survey number, position, question, more than one answer allowed
insert into public.questions (survey_id, position, text, allow_multiple)
select ('5eed0000-0000-4000-8000-' || lpad(q.survey_no::text, 12, '0'))::uuid,
       q.position, q.text, q.allow_multiple
from (values
  (1, 1, 'Which date would work best for you?', false),
  (1, 2, 'Choose the activities you prefer', true),
  (1, 3, 'What matters most to you at a team event?', false),
  (1, 4, 'How long should the event last?', false),
  (2, 1, 'How often do you exercise in a normal week?', false),
  (2, 2, 'Which offers would you use at work?', true),
  (2, 3, 'How do you usually spend your lunch break?', false),
  (3, 1, 'How many hours a week do you play?', false),
  (3, 2, 'Which platforms do you play on?', true),
  (3, 3, 'Which genre do you like most?', false),
  (4, 1, 'How do you learn new tools fastest?', false),
  (4, 2, 'Which topics would you like a workshop on?', true),
  (5, 1, 'What do you drink first in the morning?', false),
  (5, 2, 'Where do you have breakfast?', false),
  (6, 1, 'Which tools do you use every day?', true),
  (6, 2, 'What would help you most right now?', false),
  (6, 3, 'Would you test a new tool before everyone else?', false),
  (7, 1, 'Which destination do you prefer?', false),
  (7, 2, 'How would you like to travel?', false),
  (8, 1, 'How long is your usual lunch break?', false),
  (8, 2, 'What would make your break more relaxing?', true),
  (9, 1, 'How well did the first week prepare you?', false),
  (9, 2, 'Which parts were most useful?', true),
  (9, 3, 'What should we add next time?', false),
  (10, 1, 'Which genre should we watch first?', false),
  (10, 2, 'Which snacks should we bring?', true),
  (11, 1, 'Where do you work when you are not in the office?', false),
  (11, 2, 'What is missing in your setup?', true),
  (12, 1, 'Where do you spend a free weekend?', false),
  (12, 2, 'What must not be missing?', true)
) as q (survey_no, position, text, allow_multiple);

-- Columns: survey number, question position, answer position (1 = A), answer
insert into public.answer_options (question_id, position, label)
select questions.id, a.position, a.label
from (values
  (1, 1, 1, 'Friday afternoon'), (1, 1, 2, 'Saturday morning'),
  (1, 1, 3, 'Saturday evening'), (1, 1, 4, 'Sunday afternoon'),
  (1, 2, 1, 'Billiard and snacks'), (1, 2, 2, 'Office costume party'),
  (1, 2, 3, 'Bouldering followed by pizza'), (1, 2, 4, 'Beach party with music'),
  (1, 2, 5, 'Escape room'),
  (1, 3, 1, 'Good food'), (1, 3, 2, 'Time to talk'), (1, 3, 3, 'A bit of sport'),
  (1, 3, 4, 'Something new to try'),
  (1, 4, 1, 'Half a day'), (1, 4, 2, 'A full day'), (1, 4, 3, 'One evening'),
  (2, 1, 1, 'Not at all'), (2, 1, 2, 'Once or twice'), (2, 1, 3, 'Three to four times'),
  (2, 1, 4, 'Almost every day'),
  (2, 2, 1, 'Yoga at lunch'), (2, 2, 2, 'Running group'), (2, 2, 3, 'Massage day'),
  (2, 2, 4, 'Fresh fruit in the office'), (2, 2, 5, 'Standing desks'),
  (2, 3, 1, 'At my desk'), (2, 3, 2, 'Outside for a walk'), (2, 3, 3, 'In the canteen with others'),
  (3, 1, 1, 'Less than one'), (3, 1, 2, 'One to five'), (3, 1, 3, 'Six to ten'),
  (3, 1, 4, 'More than ten'),
  (3, 2, 1, 'PC'), (3, 2, 2, 'Console'), (3, 2, 3, 'Smartphone'), (3, 2, 4, 'Board games at the table'),
  (3, 3, 1, 'Strategy'), (3, 3, 2, 'Puzzle'), (3, 3, 3, 'Sports and racing'),
  (3, 3, 4, 'Role-playing'), (3, 3, 5, 'Party games'),
  (4, 1, 1, 'Video tutorials'), (4, 1, 2, 'Reading the docs'),
  (4, 1, 3, 'Pair work with a colleague'), (4, 1, 4, 'Trying it out myself'),
  (4, 2, 1, 'Presenting with confidence'), (4, 2, 2, 'Time management'),
  (4, 2, 3, 'Spreadsheets for beginners'), (4, 2, 4, 'Writing clear emails'),
  (4, 2, 5, 'Giving feedback'), (4, 2, 6, 'Basics of data privacy'),
  (5, 1, 1, 'Coffee'), (5, 1, 2, 'Tea'), (5, 1, 3, 'Water'), (5, 1, 4, 'Juice or smoothie'),
  (5, 2, 1, 'At home'), (5, 2, 2, 'On the way'), (5, 2, 3, 'At work'), (5, 2, 4, 'I skip breakfast'),
  (6, 1, 1, 'Chat app'), (6, 1, 2, 'Shared calendar'), (6, 1, 3, 'Task board'),
  (6, 1, 4, 'Video calls'), (6, 1, 5, 'Cloud storage'),
  (6, 2, 1, 'Fewer tools'), (6, 2, 2, 'Better training'), (6, 2, 3, 'A faster laptop'),
  (6, 2, 4, 'Clear rules for the chat'),
  (6, 3, 1, 'Yes, gladly'), (6, 3, 2, 'Maybe'), (6, 3, 3, 'No, thanks'),
  (7, 1, 1, 'Lake with a boat trip'), (7, 1, 2, 'Mountain hike'), (7, 1, 3, 'City tour with lunch'),
  (7, 2, 1, 'By train'), (7, 2, 2, 'By bus'), (7, 2, 3, 'By bike'),
  (8, 1, 1, 'Under 30 minutes'), (8, 1, 2, '30 to 45 minutes'), (8, 1, 3, 'Up to an hour'),
  (8, 2, 1, 'A quiet room'), (8, 2, 2, 'More plants'), (8, 2, 3, 'Outdoor seating'),
  (8, 2, 4, 'Healthy snacks'),
  (9, 1, 1, 'Very well'), (9, 1, 2, 'Quite well'), (9, 1, 3, 'Not so well'),
  (9, 2, 1, 'Meeting the team'), (9, 2, 2, 'Tool introduction'), (9, 2, 3, 'Buddy program'),
  (9, 2, 4, 'Office tour'),
  (9, 3, 1, 'More hands-on tasks'), (9, 3, 2, 'A written guide'), (9, 3, 3, 'Lunch with the managers'),
  (10, 1, 1, 'Comedy'), (10, 1, 2, 'Science fiction'), (10, 1, 3, 'Documentary'), (10, 1, 4, 'Animation'),
  (10, 2, 1, 'Popcorn'), (10, 2, 2, 'Nachos'), (10, 2, 3, 'Fruit'), (10, 2, 4, 'Chocolate'),
  (11, 1, 1, 'Home office'), (11, 1, 2, 'Coworking space'), (11, 1, 3, 'Café'), (11, 1, 4, 'On the train'),
  (11, 2, 1, 'Second screen'), (11, 2, 2, 'Good chair'), (11, 2, 3, 'Headset'),
  (11, 2, 4, 'Stable internet'),
  (12, 1, 1, 'In the city'), (12, 1, 2, 'In the mountains'), (12, 1, 3, 'At a lake'), (12, 1, 4, 'At home'),
  (12, 2, 1, 'Good food'), (12, 2, 2, 'Friends'), (12, 2, 3, 'Sport'), (12, 2, 4, 'Sleeping in')
) as a (survey_no, question_position, position, label)
join public.questions
  on questions.survey_id = ('5eed0000-0000-4000-8000-' || lpad(a.survey_no::text, 12, '0'))::uuid
 and questions.position = a.question_position;

-- Votes for all sample surveys except 4, 5 and 10, which show "There are no answers yet".
-- The number of votes per answer (1 to 7) is only there to make the bars look different.
insert into public.votes (survey_id, question_id, option_id, submission_id)
select questions.survey_id, questions.id, answer_options.id, gen_random_uuid()
from public.questions
join public.answer_options on answer_options.question_id = questions.id
cross join lateral generate_series(1, (answer_options.position * 5 + questions.position * 3) % 7 + 1)
where questions.survey_id::text like '5eed0000-%'
  and questions.survey_id not in (
    '5eed0000-0000-4000-8000-000000000004',
    '5eed0000-0000-4000-8000-000000000005',
    '5eed0000-0000-4000-8000-000000000010'
  );
