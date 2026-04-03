#!/bin/bash
# Quick Check was auf dem Pi läuft

PI_HOST="${1:-rpi01.local}"

echo "═══════════════════════════════════════════════════════════════"
echo "  Pi Screen Debug: $PI_HOST"
echo "═══════════════════════════════════════════════════════════════"
echo ""

ssh museumgh@${PI_HOST} << 'EOF'
echo "1️⃣  Chromium Prozesse:"
echo "────────────────────────────────────────────────────────────────"
ps aux | grep chromium | grep -v grep | head -3
echo ""

echo "2️⃣  Aktuelle Kiosk URL:"
echo "────────────────────────────────────────────────────────────────"
ps aux | grep chromium | grep -o "https://[^ ]*" | head -1
echo ""

echo "3️⃣  Test: Kann Pi die Seite erreichen?"
echo "────────────────────────────────────────────────────────────────"
timeout 5 curl -s -o /dev/null -w "HTTP Status: %{http_code}\nTime: %{time_total}s\n" https://museumgh.netlify.app/kiosk/RPI_01/video
echo ""

echo "4️⃣  Test: Kann Pi Sanity erreichen?"
echo "────────────────────────────────────────────────────────────────"
timeout 5 curl -s "https://832k5je1.api.sanity.io/v2021-06-07/data/query/production?query=*%5B_type%20%3D%3D%20%22kioskDevice%22%5D%5B0%5D" | jq -r '.result.kioskId // "ERROR"'
echo ""

echo "5️⃣  Chromium Logs (letzte 10 Zeilen):"
echo "────────────────────────────────────────────────────────────────"
tail -10 /tmp/chromium-debug.log 2>/dev/null || echo "Keine Logs gefunden"
echo ""

echo "6️⃣  Screenshot machen (für Debugging):"
echo "────────────────────────────────────────────────────────────────"
DISPLAY=:0 scrot /tmp/pi-screenshot.png 2>/dev/null && echo "✓ Screenshot: /tmp/pi-screenshot.png" || echo "✗ scrot nicht installiert"
EOF

echo ""
echo "═══════════════════════════════════════════════════════════════"
