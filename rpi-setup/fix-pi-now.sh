#!/bin/bash
# Sofort-Fix für Pi - Updated die Config von Sanity

PI_HOST="${1:-rpi01.local}"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Pi Config Update von Sanity                                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Target: $PI_HOST"
echo ""

# Kopiere neues Sync-Script auf Pi
echo "► Kopiere neues Sync-Script..."
scp pi-sync-config.sh museumgh@${PI_HOST}:~/pi-sync-config.sh
ssh museumgh@${PI_HOST} "chmod +x ~/pi-sync-config.sh"

# Führe Sync aus
echo ""
echo "► Führe Config Sync aus..."
ssh museumgh@${PI_HOST} "~/pi-sync-config.sh"

echo ""
echo "► Checke neue URL..."
ssh museumgh@${PI_HOST} "grep 'Exec=' ~/.config/autostart/kiosk.desktop"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Chromium neu starten oder Pi rebooten?                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "1) Nur Chromium neu starten (schnell)"
echo "2) Pi komplett rebooten (sauber)"
echo "3) Nichts (manuell machen)"
echo ""
read -p "Auswahl [1-3]: " choice

case $choice in
    1)
        echo "► Starte Chromium neu..."
        ssh museumgh@${PI_HOST} "DISPLAY=:0 pkill chromium && sleep 2 && DISPLAY=:0 chromium --kiosk --password-store=basic --noerrdialogs --disable-infobars --no-first-run --autoplay-policy=no-user-gesture-required --disable-features=PreloadMediaEngagementData,MediaEngagementBypassAutoplayPolicies,Translate --accept-lang=de-DE --app=\$(grep 'Exec=' ~/.config/autostart/kiosk.desktop | sed 's/.*--app=//' | tr -d '\n') &"
        ;;
    2)
        echo "► Reboote Pi..."
        ssh museumgh@${PI_HOST} "sudo reboot"
        ;;
    3)
        echo "ℹ️  Keine Aktion. Manuell Chromium neu starten oder Pi rebooten."
        ;;
esac

echo ""
echo "✓ Fertig!"
