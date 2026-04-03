#!/bin/bash
# Raspberry Pi Reboot Script

cd "$(dirname "$0")"

echo "╔══════════════════════════════════════════╗"
echo "║  Raspberry Pi Neustart                   ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Ask for hostname
read -p "Welchen Pi neustarten? [rpi01.local]: " PI_HOST
PI_HOST="${PI_HOST:-rpi01.local}"

PI_USER="museumgh"

echo ""
echo "Starte $PI_HOST neu..."
echo ""

# Reboot
if ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=5 ${PI_USER}@${PI_HOST} 'sudo reboot'; then
    echo ""
    echo "✓ Neustart-Befehl gesendet!"
    echo ""
    echo "Der Pi startet jetzt neu..."
    echo "Warte ca. 2 Minuten bis er wieder online ist."
    echo ""
else
    echo ""
    echo "✗ Konnte Pi nicht erreichen!"
    echo ""
fi

read -p "Drücke Enter zum Schließen..."
