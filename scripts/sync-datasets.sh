#!/usr/bin/env bash
# Uploads server-data/{datasets,spells}/ to the matching apps/{datasets,spells}/
# directories on mana.pumpkin.quest, where they're served as static files
# (see modules/lss/datasets/constants.ts and modules/lss/spells/constants.ts).
set -euo pipefail

REMOTE_USER="peter"
REMOTE_HOST="185.212.148.193"
REMOTE_PORT="4855"

cd "$(dirname "$0")/.."

for dir in datasets spells; do
  echo "Syncing server-data/$dir/ -> apps/$dir/ ..."
  rsync -avz --delete -e "ssh -p $REMOTE_PORT" \
    "server-data/$dir/" "$REMOTE_USER@$REMOTE_HOST:apps/$dir/"
done

# nginx (www-data) needs read access; rsync preserves whatever local mode a file
# had, which has bitten us before (a file uploaded as 600 came back 403).
ssh -p "$REMOTE_PORT" "$REMOTE_USER@$REMOTE_HOST" \
  "chmod -R a+rX apps/datasets apps/spells"

echo "Done."
