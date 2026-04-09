#!/bin/zsh
set -euo pipefail

# ZIEL:
# Den separaten Presenter schnell auf lebende DOM-Struktur pruefen, ohne in den Vault-Hauptpfad eingreifen zu muessen.
# WAS WURDE PROBIERT:
# Erst wurde mit allgemeinen Headless-Chrome-Aufrufen gearbeitet. Danach kam ein eigener Presenter-Probe-Wrapper fuer wiederkehrende Checks dazu.
# WESHALB WURDE SO ENTSCHIEDEN:
# Der dedizierte Probe-Pfad spart wiederholte Kommandoarbeit und macht Presenter-Regressionen schneller sichtbar.

PORT="${1:-8137}"
TARGET_URL="${2:-http://127.0.0.1:${PORT}/__backlog/cristal_vault/presentation.html?course=QuS2&cover=1}"
OUTPUT_FILE="${3:-/tmp/cristal_vault_presentation_dom.html}"
CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

if [[ ! -x "$CHROME_BIN" ]]; then
  echo "Google Chrome Headless wurde nicht gefunden: $CHROME_BIN" >&2
  exit 1
fi

"$CHROME_BIN" \
  --headless=new \
  --disable-gpu \
  --window-size=1600,1000 \
  --virtual-time-budget=6000 \
  --dump-dom \
  "$TARGET_URL" > "$OUTPUT_FILE"

# ZIEL:
# Die wichtigsten Presenter-Merkmale direkt im Probe-Output sichtbar machen.
# WAS WURDE PROBIERT:
# Zuerst wurden einzelne frühere CSS-Klassen gesucht, die nach dem Orb-Umbau nicht mehr stabil waren.
# WESHALB WURDE SO ENTSCHIEDEN:
# Die aktuellen Marker decken Titel, Crystal-Cover, Orb-SVG und Rücksprung-Button ab und sind damit näher an der echten Presenter-Funktion.
echo "DOM-Probe geschrieben: $OUTPUT_FILE"
echo "Wichtige Presenter-Stellen:"
grep -n "presentation-slide__title\\|presentation-slide--crystal-cover\\|presentation-cover__orb-svg\\|presentation-cover__facet-rune\\|presentation-cover__vault-return" "$OUTPUT_FILE" || true
