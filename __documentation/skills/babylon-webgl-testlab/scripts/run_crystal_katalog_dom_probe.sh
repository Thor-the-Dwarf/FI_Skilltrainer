#!/bin/zsh
set -euo pipefail

PORT="${1:-8137}"
TARGET_URL="${2:-http://127.0.0.1:${PORT}/__backlog/crystal_katalog/index.html?selection=4&testlab=1}"
OUTPUT_FILE="${3:-/tmp/crystal_katalog_testlab_dom.html}"
CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

if [[ ! -x "$CHROME_BIN" ]]; then
  echo "Google Chrome Headless wurde nicht gefunden: $CHROME_BIN" >&2
  exit 1
fi

"$CHROME_BIN" \
  --headless=new \
  --use-angle=swiftshader \
  --enable-unsafe-swiftshader \
  --enable-webgl \
  --ignore-gpu-blocklist \
  --window-size=1440,1000 \
  --virtual-time-budget=5000 \
  --dump-dom \
  "$TARGET_URL" > "$OUTPUT_FILE"

echo "DOM-Probe geschrieben: $OUTPUT_FILE"
echo "Wichtige Testlab-Stellen:"
grep -n "runtimeDebugSummary\\|runtimeDebugLog\\|Babylon.js lokal\\|Testlab" "$OUTPUT_FILE" || true
