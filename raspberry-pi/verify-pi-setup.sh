#!/bin/bash
# Verify Pi Setup ist korrekt

PI_HOST="${1:-rpi01.local}"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Verify Pi Setup: $PI_HOST"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

ssh museumgh@${PI_HOST} << 'EOF'
echo "1️⃣  Kiosk Desktop Autostart:"
echo "────────────────────────────────────────────────────────────────"
cat ~/.config/autostart/kiosk.desktop
echo ""

echo "2️⃣  Cron Jobs:"
echo "────────────────────────────────────────────────────────────────"
crontab -l | grep -E "pi-sync|pi-heartbeat"
echo ""

echo "3️⃣  Sync Script vorhanden?"
echo "────────────────────────────────────────────────────────────────"
ls -lh ~/pi-sync-config.sh ~/pi-heartbeat.sh 2>/dev/null || echo "Scripts fehlen!"
echo ""

echo "4️⃣  Environment Variablen:"
echo "────────────────────────────────────────────────────────────────"
if [ -f ~/.pi-kiosk.env ]; then
    echo "✓ ~/.pi-kiosk.env exists"
    grep -v "TOKEN" ~/.pi-kiosk.env 2>/dev/null
else
    echo "✗ ~/.pi-kiosk.env FEHLT!"
fi
echo ""

echo "5️⃣  Test Sanity Query:"
echo "────────────────────────────────────────────────────────────────"
source ~/.pi-kiosk.env 2>/dev/null
HOSTNAME=$(hostname)
if [[ "$HOSTNAME" =~ rpi([0-9]+) ]]; then
    KIOSK_ID=$(printf "RPI_%02d" ${BASH_REMATCH[1]})
else
    KIOSK_ID="RPI_01"
fi

curl -s "https://832k5je1.api.sanity.io/v2021-06-07/data/query/production?query=*%5B_type%20%3D%3D%20%22kioskDevice%22%20%26%26%20kioskId%20%3D%3D%20%22${KIOSK_ID}%22%5D%5B0%5D.ausstellung-%3E.titel" | jq -r '.result // "ERROR: Keine Config gefunden!"'

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Empfehlung: Teste mit 'sudo reboot' ob es automatisch startet"
echo "═══════════════════════════════════════════════════════════════"
EOF
