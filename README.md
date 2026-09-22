# Poll App

Create surveys, share them and watch the results come in live. A school project for the
Developer Akademie, built with Angular and Supabase.

Live version: https://poll-app.adambaranyi.xyz

## What it can do

- The home page lists all surveys with category, title and deadline, split into running and past
  ones, and can be filtered by category.
- Surveys that end soonest are shown above the list, the earliest end first.
- "New survey" opens a form in an overlay: name, optional end date, category, optional description
  and up to twenty questions with up to six answers each.
- A survey page shows the questions, lets you answer them and shows the current results next to
  them. The results update live while other people vote.
- Past surveys can be read but not answered any more. The browser remembers a survey you have
  already answered.

## Technology

- Angular 22 with standalone components, signals and a zoneless setup
- Supabase for the database and the live updates
- Playwright for the tests, ESLint and Prettier for the code style
- No UI library: the design comes from Figma and is built with plain SCSS

## Running it locally

```bash
npm install
npm start
```

The app then runs on http://localhost:4200/.

Tests, lint and build:

```bash
npm run test:e2e
npm run lint
npm run build
```

The tests answer every request to Supabase themselves, so they never touch the real database.
`npm run test:e2e:browsers` repeats them in Safari and Firefox, `npm run test:db` checks the
database rules in a throwaway Postgres container (needs Docker).

## Database

`supabase/` holds the whole database: `schema.sql` for the tables, `policies.sql` for the access
rules and `seed.sql` for the sample surveys.

The Supabase URL and the publishable key in `src/environments/` are meant to be public. Every table
has row level security: anyone may read, and may add surveys, questions, answers and votes, but
only in the ways the app needs. Nothing can be changed or deleted afterwards, and votes are only
accepted while a survey is running. `supabase/tests/` checks these rules.
