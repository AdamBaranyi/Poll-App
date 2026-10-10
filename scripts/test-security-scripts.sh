#!/usr/bin/env bash
# Runs scripts/audit.sh and scripts/security-report.sh with the fake gh and npm from
# scripts/fakes first on the PATH, so the tests check what the scripts do, not their text.
set -uo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
work=$(mktemp -d)
state="$work/state"
trap 'rm -rf "$work"' EXIT
failures=0
audit_exit=0

# Runs one of the scripts with the fakes and prints its exit code.
run() {
  PATH="$root/scripts/fakes:$PATH" STATE="$state" AUDIT_EXIT_CODE="$audit_exit" \
    bash "$root/scripts/$1" "${@:2}" >/dev/null 2>&1
  echo $?
}

# Reports one check as passed or failed.
check() {
  local name="$1"
  shift
  if "$@"; then
    echo "ok - $name"
  else
    echo "not ok - $name"
    failures=$((failures + 1))
  fi
}

# Succeeds when a call since the last step matches the pattern.
called() {
  grep -q -E "^$1" "$state/calls.log"
}

# Succeeds when no call since the last step matches the pattern.
not_called() {
  ! called "$1"
}

# Starts the next step with an empty call log.
next_step() {
  : > "$state/calls.log"
}

# audit.sh hands the level to npm audit and passes on its result.
test_audit() {
  next_step
  echo 0 > "$state/npm-exit"
  check 'audit.sh passes when npm audit passes' [ "$(run audit.sh high)" -eq 0 ]
  check 'audit.sh hands the level to npm audit' called 'npm audit --audit-level=high$'
  echo 1 > "$state/npm-exit"
  check 'audit.sh fails when npm audit fails' [ "$(run audit.sh moderate)" -ne 0 ]
}

# audit.sh refuses a level npm does not know, without calling npm at all.
test_audit_unknown_level() {
  next_step
  check 'audit.sh refuses an unknown level' [ "$(run audit.sh hihg)" -eq 2 ]
  check 'audit.sh does not call npm then' not_called 'npm'
}

# The first finding opens the issue with label, assignee and the advisory.
test_report_opens_issue() {
  next_step
  check 'the report succeeds with a finding' [ "$(run security-report.sh "$work/one.txt")" -eq 0 ]
  check 'a first finding opens the issue' \
    called 'gh issue create --title Sicherheitsmeldungen --label sicherheit --assignee AdamBaranyi'
  check 'the issue names the advisory' grep -q 'GHSA-aaaa-bbbb-cccc' "$state/body"
}

# The same findings on the next day leave the issue alone.
test_report_same_findings() {
  next_step
  run security-report.sh "$work/one.txt" >/dev/null
  check 'the same findings change nothing' not_called 'gh (issue (create|edit|comment)|label)'
}

# Changed findings rewrite the issue and add a comment.
test_report_changed_findings() {
  next_step
  run security-report.sh "$work/two.txt" >/dev/null
  check 'changed findings rewrite the issue' called 'gh issue edit 7'
  check 'changed findings add a comment' called 'gh issue comment 7'
}

# An audit that did not run is no all-clear: the open issue stays as it is.
test_report_outage_keeps_issue() {
  next_step
  audit_exit=1
  run security-report.sh "$work/outage.txt" >/dev/null
  audit_exit=0
  check 'a failed audit leaves the open issue alone' not_called 'gh issue (close|edit|comment)'
}

# Without an open issue, a failed audit opens one, but only once.
test_report_outage_without_issue() {
  next_step
  audit_exit=1
  run security-report.sh "$work/outage.txt" >/dev/null
  check 'a failed audit opens an issue' called 'gh issue create'
  check 'the issue says that the audit did not run' grep -q 'Prüfung lief nicht' "$state/body"
  next_step
  run security-report.sh "$work/outage.txt" >/dev/null
  audit_exit=0
  check 'the same failure again changes nothing' not_called 'gh (issue (create|edit|comment|close)|label)'
}

# Without findings the issue closes, and a second clean run writes nothing.
test_report_clean() {
  next_step
  run security-report.sh "$work/clean.txt" >/dev/null
  check 'no findings close the issue' called 'gh issue close 7'
  next_step
  run security-report.sh "$work/clean.txt" >/dev/null
  check 'no findings and no issue write nothing' not_called 'gh (issue (create|edit|comment|close)|label)'
}

mkdir -p "$state"
printf 'source-map-js  high\nhttps://github.com/advisories/GHSA-aaaa-bbbb-cccc\n' > "$work/one.txt"
printf 'piscina  critical\nhttps://github.com/advisories/GHSA-dddd-eeee-ffff\n' > "$work/two.txt"
printf 'found 0 vulnerabilities\n' > "$work/clean.txt"
printf 'npm error audit endpoint returned an error\n' > "$work/outage.txt"

test_audit
test_audit_unknown_level
test_report_opens_issue
test_report_same_findings
test_report_changed_findings
test_report_outage_keeps_issue
test_report_clean
test_report_outage_without_issue
test_report_clean
check 'the scripts only call what the fakes know' [ ! -s "$state/unknown.log" ]

[ "$failures" -eq 0 ]
