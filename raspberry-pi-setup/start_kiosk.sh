#!/bin/bash

# Museum Kiosk Starter Script
# Dieses Script liest die MAC-Adresse und startet den Browser im Kiosk-Modus

# Warte auf Netzwerkverbindung
echo "Warte auf Netzwerkverbindung..."
while ! ping -c 1 -W 1 google.com > /dev/null 2>&1; do
    sleep 2
done
echo "Netzwerk verfügbar!"

# MAC-Adresse der eth0 Schnittstelle auslesen
MAC_ADDRESS=$(ip link show eth0 | awk '/ether/ {print $2}')

# Falls eth0 nicht verfügbar, versuche wlan0
if [ -z "$MAC_ADDRESS" ]; then
    MAC_ADDRESS=$(ip link show wlan0 | awk '/ether/ {print $2}')
fi

# Überprüfe ob MAC-Adresse gefunden wurde
if [ -z "$MAC_ADDRESS" ]; then
    echo "FEHLER: Keine MAC-Adresse gefunden!"
    exit 1
fi

echo "MAC-Adresse gefunden: $MAC_ADDRESS"

# Frontend-URL (Netlify)
FRONTEND_URL="https://museum-kiosk.netlify.app"

# Vollständige URL mit MAC-Parameter
KIOSK_URL="${FRONTEND_URL}/?mac=${MAC_ADDRESS}"

echo "Starte Kiosk mit URL: $KIOSK_URL"

# X-Server Umgebungsvariablen setzen
export DISPLAY=:0
export XAUTHORITY=/home/pi/.Xauthority

# Bildschirmschoner und Energiesparmodus deaktivieren
xset s off
xset -dpms
xset s noblank

# Mauszeiger verstecken
unclutter -idle 0 &

# Chromium im Kiosk-Modus starten
chromium-browser \
    --kiosk \
    --noerrdialogs \
    --disable-infobars \
    --disable-session-crashed-bubble \
    --disable-features=TranslateUI \
    --check-for-update-interval=31536000 \
    --disable-component-update \
    --autoplay-policy=no-user-gesture-required \
    --start-fullscreen \
    --window-size=1920,1080 \
    --window-position=0,0 \
    "$KIOSK_URL"