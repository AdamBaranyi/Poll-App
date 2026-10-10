#!/usr/bin/env bash
# Keeps exactly one issue with the findings of the daily security run: opens it with the
# first finding, updates it only when the list of advisories changes and closes it when
# nothing is left. One mail per change instead of a red run every day.
# Usage: bash scripts/security-report.sh audit.txt (needs GH_TOKEN and GH_REPO)
# AUDIT_EXIT_CODE is the exit code of scripts/audit.sh. A report without advisories only
# counts as clean when the audit ran; without the npm registry it ends with 1 and no id.
set -euo pipefail

report="${1:-audit.txt}"
audit_code="${AUDIT_EXIT_CODE:-0}"
title='Sicherheitsmeldungen'
label='sicherheit'
assignee="${ASSIGNEE:-AdamBaranyi}"
today=$(date -u +%F)

# Prints the advisory ids of the report, sorted and without duplicates.
advisory_ids() {
  grep -o -E 'GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}' "$report" | sort -u || true
}

# Prints the number of the open findings issue, or nothing.
open_issue() {
  gh issue list --label "$label" --state open --search "in:title $title" \
    --json number --jq '.[0].number // empty'
}

# Prints the first line of the issue: the checked level, or that the audit did not run.
headline() {
  if [ "$1" = 'audit-failed' ]; then
    echo "Stand $today: Die Prüfung lief nicht (Exit $audit_code), das sagt der Bericht:"
  else
    echo "Stand $today, Prüfung ab moderat (scripts/audit.sh):"
  fi
}

# Prints the issue text. The fingerprint of the advisory list shows later runs what changed.
issue_body() {
  printf '<!-- stand:%s -->\n%s\n\n```\n%s\n```\n\n%s' "$1" "$(headline "$2")" "$(cat "$report")" \
    'Regel: high und critical sofort beheben, moderate mit dem nächsten Update-PR, ohne Fix namentlich und befristet in docs/SECURITY.md.'
}

# Opens the issue, together with its label if the label is missing.
open_new_issue() {
  gh label create "$label" --color B60205 --description 'Befunde des täglichen Sicherheitslaufs' 2>/dev/null || true
  gh issue create --title "$title" --label "$label" --assignee "$assignee" --body "$1"
}

# Rewrites the issue and adds a comment, but only if the advisory list has changed.
update_issue() {
  local current
  current=$(gh issue view "$1" --json body --jq .body)
  if [[ "$current" == *"stand:$2"* ]]; then
    return 0
  fi
  gh issue edit "$1" --body "$3"
  gh issue comment "$1" --body "$(printf 'Geänderte Befunde am %s:\n\n```\n%s\n```' "$today" "$(cat "$report")")"
}

ids=$(advisory_ids)
number=$(open_issue)

if [ -z "$ids" ] && [ "$audit_code" -eq 0 ]; then
  if [ -n "$number" ]; then
    gh issue close "$number" --comment "Der tägliche Lauf vom $today findet keine Befunde mehr."
  fi
  exit 0
fi

if [ -z "$ids" ]; then
  if [ -n "$number" ]; then
    echo "The audit did not run (exit $audit_code), the open issue stays as it is." >&2
    exit 0
  fi
  ids='audit-failed'
fi

stand=$(printf '%s' "$ids" | sha256sum | cut -c1-12)
body=$(issue_body "$stand" "$ids")

if [ -z "$number" ]; then
  open_new_issue "$body"
else
  update_issue "$number" "$stand" "$body"
fi
