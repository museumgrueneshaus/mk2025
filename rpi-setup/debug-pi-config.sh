#!/bin/bash
# Debug Script für Pi - zeigt aktuelle Konfiguration

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Pi Konfiguration Debug                                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "1️⃣  Aktuelle Kiosk URL in Chromium:"
echo "────────────────────────────────────────────────────────────────"
if [ -f ~/.config/autostart/kiosk.desktop ]; then
    grep "Exec=" ~/.config/autostart/kiosk.desktop | sed 's/.*--app=/URL: /'
else
    echo "❌ kiosk.desktop nicht gefunden!"
fi
echo ""

echo "2️⃣  Cron Jobs:"
echo "────────────────────────────────────────────────────────────────"
crontab -l | grep -E "pi-heartbeat|pi-sync-config" || echo "❌ Keine Cron Jobs gefunden!"
echo ""

echo "3️⃣  Sync Script vorhanden?"
echo "────────────────────────────────────────────────────────────────"
ls -lh ~/pi-sync-config.sh 2>/dev/null || echo "❌ pi-sync-config.sh nicht gefunden!"
echo ""

echo "4️⃣  Letzte Config Sync Logs:"
echo "────────────────────────────────────────────────────────────────"
tail -5 ~/config-sync.log 2>/dev/null || echo "ℹ️  Keine Logs gefunden"
echo ""

echo "5️⃣  .env Datei vorhanden?"
echo "────────────────────────────────────────────────────────────────"
if [ -f ~/.pi-kiosk.env ]; then
    echo "✓ ~/.pi-kiosk.env gefunden"
    echo "Tokens: $(grep -c TOKEN ~/.pi-kiosk.env) gefunden"
else
    echo "❌ ~/.pi-kiosk.env nicht gefunden! Tokens fehlen!"
fi
echo ""

echo "══════════════════════════════════════════════════════════════"
echo "Jetzt Config Sync manuell ausführen? (j/n)"
read -r answer
if [[ "$answer" =~ ^[Jj]$ ]]; then
    echo ""
    echo "► Führe Config Sync aus..."
    ~/pi-sync-config.sh
fi
