#!/bin/bash
# Usage: ./query.sh HEAD~1 "SELECT * FROM users;"

COMMIT=$1
SQL="$2"

if [ -n "$COMMIT" ]; then
  git stash push --quiet --include-untracked
  git checkout "$COMMIT" -- data.db
fi

sqlite3 data.db "$SQL"

if [ -n "$COMMIT" ]; then
  git checkout - -- data.db
  git stash pop --quiet
fi
