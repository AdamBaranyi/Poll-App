# Security

How the Poll App checks its dependencies and its history for secrets.

## Checks

| When                                               | What                                                                                                                      | Fails on            |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Every push and pull request (`ci.yml`)             | `bash scripts/audit.sh high`                                                                                              | high and critical   |
| Daily, on push to `main`, by hand (`security.yml`) | gitleaks over the whole history                                                                                           | any secret          |
| Same run                                           | `bash scripts/audit.sh moderate`, written to the run summary and to one issue «Sicherheitsmeldungen» (label `sicherheit`) | never, only reports |

`scripts/security-report.sh` opens that issue with the first finding, updates it only when the
list of advisories changes and closes it when nothing is left. So a finding sends one mail and
does not turn `main` red every day. `npm run test:scripts` checks both scripts against fake `gh`
and `npm` programs.

## Updates

- Dependabot opens one weekly pull request for npm (minor and patch together) and a monthly one
  for GitHub Actions, both with a waiting time of seven days. Locally `.npmrc` sets
  `min-release-age=7`.
- Angular packages move together with `ng update`, never one by one. A single
  `@angular/router` update fails with `ERESOLVE`, because it needs the same `@angular/core`.
- Only green update pull requests are merged.

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

## Secrets

gitleaks checks every commit. `.gitleaks.toml` only allows the Supabase publishable key
(`sb_publishable_…`), which is public by design; a secret key would still be found. Why the
public key is safe: see «Database» in the README.
