# Security

How the Poll App checks its dependencies and its history for secrets.

## Checks

| When                                               | What                                                                                                                      | Fails on            |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Every push and pull request (`ci.yml`)             | `bash scripts/audit.sh high`                                                                                              | high and critical   |
| Daily, on push to `main`, by hand (`security.yml`) | gitleaks over the whole history                                                                                           | any secret          |
| Same run                                           | `bash scripts/audit.sh moderate`, written to the run summary and to one issue «Sicherheitsmeldungen» (label `sicherheit`) | never, only reports |

`scripts/security-report.sh` opens that issue with the first finding, updates it only when the
list of advisories changes and, once nothing is left, keeps it open with the note «no findings»
(since 25 October 2026; closing and reopening meant a new assignment and a mail every time). So a
finding sends one mail and does not turn `main` red every day. A report without advisories only counts as clean when the
audit really ran: without the npm registry `npm audit` ends with an error and no advisory, so an
open issue stays open, and without one a new issue says that the check did not run. `npm run test:scripts` checks both scripts against fake `gh`
and `npm` programs.

## Updates

- Dependabot opens one weekly pull request for npm (minor and patch together) and a monthly one
  for GitHub Actions, both with a waiting time of seven days. Locally `.npmrc` sets
  `min-release-age=7`.
- Angular packages move together with `ng update`, never one by one. A single
  `@angular/router` update fails with `ERESOLVE`, because it needs the same `@angular/core`.
- Only green update pull requests are merged.

## Overrides

| Package | Version | Why                                                                                                         | Since      | Review by                                                             |
| ------- | ------- | ----------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------- |
| `vite`  | 8.3.4   | `@angular/build` 22.2.2 pins `vite` 8.3.0, which has the `launch-editor` advisories below; 8.3.3 fixes them | 21.10.2026 | 21.11.2026, remove it as soon as `@angular/build` pins a fixed `vite` |

## Exceptions

None at the moment. An exception names the advisory, the package, the level, whether it runs in
the app or only in the tools, the reason, the date and a «review by» date at most one month
later. `npm audit` cannot skip a single advisory, so an exception would need a filter in
`scripts/audit.sh`.

## Fixed on 10.10.2026

| Advisory            | Package                            | Level    | Where                               | Fix                                                                          |
| ------------------- | ---------------------------------- | -------- | ----------------------------------- | ---------------------------------------------------------------------------- |
| GHSA-ff3f-86qr-9cv3 | `@angular/router` 22.1.6           | high     | app (SSR only, this app has no SSR) | Angular 22.2.1                                                               |
| GHSA-6qxp-vccf-f47h | `@modelcontextprotocol/sdk` 1.30.0 | high     | tools (CLI)                         | gone: CLI 22.2.1 uses `@modelcontextprotocol/server` instead                 |
| GHSA-67c8-pqhq-4rmx | `piscina` 5.2.0                    | critical | tools (build)                       | 5.3.2 with `@angular/build` 22.2.1                                           |
| GHSA-68fv-2mgg-jv7q | `source-map-js` 1.2.1              | high     | tools (build)                       | 1.2.2 in the lockfile; postcss and sass already allow it, no override needed |

## Fixed on 21.10.2026

| Advisory            | Package                              | Level  | Where                                 | Fix                       |
| ------------------- | ------------------------------------ | ------ | ------------------------------------- | ------------------------- |
| GHSA-jm63-cq47-j5jp | `@modelcontextprotocol/server` 2.0.0 | high   | tools (MCP server of the Angular CLI) | 2.3.1 with Angular 22.2.2 |
| GHSA-46jr-4wx8-v453 | `@modelcontextprotocol/server` 2.0.0 | high   | tools (MCP server of the Angular CLI) | 2.3.1 with Angular 22.2.2 |
| GHSA-rvq5-wwqv-78pq | `@modelcontextprotocol/server` 2.0.0 | medium | tools (MCP server of the Angular CLI) | 2.3.1 with Angular 22.2.2 |
| GHSA-587h-7wmj-h5pm | `vite` 8.3.0 (`launch-editor`)       | high   | tools (development server)            | override to 8.3.4         |
| GHSA-698v-4r3x-3vcv | `vite` 8.3.0 (`launch-editor`)       | medium | tools (development server)            | override to 8.3.4         |
| GHSA-r825-w8mm-5pxw | `vite` 8.3.0 (`launch-editor`)       | medium | tools (development server)            | override to 8.3.4         |

## Database rights

`supabase/policies.sql` first takes every right away from `anon` and `authenticated` and then
grants exactly what the app needs: `anon` may read all four tables, insert votes into single
columns and call `create_survey`; `authenticated` gets nothing. From 30.10.2026 Supabase no longer gives new tables in `public` any
rights by itself, so a table without its own `grant` answers with «permission denied». The Poll
App does not depend on the old behaviour: `npm run test:db` runs the checks once with the old
default rights and once without any, and both pass. A new table without a `grant` fails the
second run. `service_role` gets no grants on purpose, because neither the app nor the tests use it.

## Security review of 21.10.2026

Done by hand with the method of the security-guidance plugin (see the pull requests of
21.10.2026). Three findings in `supabase/policies.sql`, all medium:

| Finding                                                                                                                                                                 | Decision                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Questions and answers could be added to any survey younger than ten minutes, not only by its creator. One question without answers made a survey unanswerable for good. | Fixed in the code: surveys, questions and answers only come in through `create_survey` in `supabase/functions.sql`, in one step, and `anon` has no insert right on these tables. A failure in the middle leaves nothing behind. An existing database needs three steps: run `supabase/functions.sql`, put the new app online, then run `supabase/migrations/2026-10-22-close-direct-inserts.sql`. Live: not migrated yet. |
| The voting rules (one vote per browser, one answer for a single choice question) only hold in the browser. Votes sent past the app can change the results.              | Accepted on 22.10.2026. The school task asks for no login, and without one there is no person to count votes for. The database still only takes votes while a survey is running and only with answers that belong to its questions.                                                                                                                                                                                       |
| `anon` can read `submission_id` and `created_at` of every vote. Someone who knows when a colleague voted could find that colleague's answers.                           | Accepted on 22.10.2026. Votes carry no names. Hiding the two columns would need column rights on `votes`, and the live results depend on that table; the gain is small next to the risk of breaking them.                                                                                                                                                                                                                 |

## Secrets

gitleaks checks every commit. `.gitleaks.toml` only allows the Supabase publishable key
(`sb_publishable_…`), which is public by design; a secret key would still be found. Why the
public key is safe: see «Database» in the README.
