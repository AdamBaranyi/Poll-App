#!/usr/bin/env bash
# Keeps exactly one issue with the findings of the daily security run: opens it with the
# first finding, updates it only when the list of advisories changes and closes it when
# nothing is left. One mail per change instead of a red run every day.
# Usage: bash scripts/security-report.sh audit.txt (needs GH_TOKEN and GH_REPO)
set -euo pipefail

report="${1:-audit.txt}"
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

# Prints the issue text. The fingerprint of the advisory list shows later runs what changed.
issue_body() {
  printf '<!-- stand:%s -->\nStand %s, Prüfung ab moderat (scripts/audit.sh):\n\n```\n%s\n```\n\n%s' \
    "$1" "$today" "$(cat "$report")" \
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

if [ -z "$ids" ]; then
  if [ -n "$number" ]; then
    gh issue close "$number" --comment "Der tägliche Lauf vom $today findet keine Befunde mehr."
  fi
  exit 0
fi

stand=$(printf '%s' "$ids" | sha256sum | cut -c1-12)
body=$(issue_body "$stand")

if [ -z "$number" ]; then
  open_new_issue "$body"
else
  update_issue "$number" "$stand" "$body"
fi
