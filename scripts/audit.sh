#!/usr/bin/env bash
# Checks the dependencies for known vulnerabilities.
# Usage: bash scripts/audit.sh high|moderate
# The pipeline stops from high on, the daily run only reports from moderate on.
# npm audit cannot skip a single advisory. If one ever has to be skipped, the filter goes
# here and the reason into docs/SECURITY.md. Right now nothing is skipped.
set -euo pipefail

level="${1:-high}"

case "$level" in
  low | moderate | high | critical) ;;
  *)
    echo "Unknown audit level: $level" >&2
    exit 2
    ;;
esac

npm audit --audit-level="$level"
