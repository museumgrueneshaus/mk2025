#!/bin/bash
# Pi Config Sync - zieht Konfiguration von Sanity beim Start
# Wird beim Boot ausgeführt

# Load environment variables from .env file
if [ -f "$HOME/.pi-kiosk.env" ]; then
    source "$HOME/.pi-kiosk.env"
fi

# Sanity Config (fallback to defaults if not in .env)
SANITY_PROJECT_ID="${SANITY_PROJECT_ID:-832k5je1}"
SANITY_DATASET="${SANITY_DATASET:-production}"
# SANITY_READ_TOKEN must be set in ~/.pi-kiosk.env

# Pi Info
HOSTNAME=$(hostname)
MAC_ADDRESS=$(cat /sys/class/net/eth0/address 2>/dev/null || cat /sys/class/net/wlan0/address | tr -d ':' | tail -c 7)

# Kiosk-ID bestimmen
if [[ "$HOSTNAME" =~ rpi([0-9]+) ]]; then
    KIOSK_ID=$(printf "RPI_%02d" ${BASH_REMATCH[1]})
else
    KIOSK_ID="RPI_${MAC_ADDRESS: -2}"
fi

echo "╔══════════════════════════════════════════╗"
echo "║  Pi Config Sync von Sanity               ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Kiosk-ID: ${KIOSK_ID}"
echo ""

# Config von Sanity holen (mit Ausstellung-Template)
CONFIG=$(curl -s "https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/data/query/${SANITY_DATASET}?query=*%5B_type%20%3D%3D%20%22kioskDevice%22%20%26%26%20kioskId%20%3D%3D%20%22${KIOSK_ID}%22%5D%5B0%5D%7B...,ausstellung-%3E%7BkioskTemplate%7D%7D" \
  -H "Authorization: Bearer ${SANITY_READ_TOKEN}")

if [ -z "$CONFIG" ] || [ "$CONFIG" = "null" ]; then
    echo "⚠️  Keine Config in Sanity gefunden für ${KIOSK_ID}"
    echo "   Erstelle Device in Sanity Studio!"
    exit 1
fi

echo "✓ Config von Sanity geladen"
echo ""

# Parse Config mit jq
KIOSK_URL=$(echo $CONFIG | jq -r '.result.kioskUrl // empty')
TEMPLATE=$(echo $CONFIG | jq -r '.result.ausstellung.kioskTemplate.template // "video"')
WLAN_NETWORKS=$(echo $CONFIG | jq -r '.result.wlanNetworks // empty')

# Generiere URL falls nicht in Sanity gesetzt
if [ -z "$KIOSK_URL" ] || [ "$KIOSK_URL" = "null" ]; then
    KIOSK_URL="https://museumgh.netlify.app/kiosk/${KIOSK_ID}/${TEMPLATE}"
    echo "ℹ️  Generiere URL aus Template: $KIOSK_URL"
fi

# Update Kiosk URL
echo "► Update Kiosk URL: $KIOSK_URL"

# Update Desktop Autostart
if [ -f ~/.config/autostart/kiosk.desktop ]; then
    sed -i "s|Exec=chromium.*|Exec=chromium --password-store=basic --kiosk --noerrdialogs --disable-infobars --no-first-run --autoplay-policy=no-user-gesture-required --disable-features=PreloadMediaEngagementData,MediaEngagementBypassAutoplayPolicies,Translate --accept-lang=de-DE --app=${KIOSK_URL}|" ~/.config/autostart/kiosk.desktop
    echo "✓ Kiosk URL aktualisiert"
fi

# Update WLAN Networks wenn vorhanden
if [ -n "$WLAN_NETWORKS" ] && [ "$WLAN_NETWORKS" != "null" ] && [ "$WLAN_NETWORKS" != "[]" ]; then
    echo "► Update WLAN Konfiguration..."

    # Backup alte Config
    sudo cp /etc/wpa_supplicant/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf.backup 2>/dev/null || true

    # Erstelle neue Config
    cat > /tmp/wpa_new.conf << 'EOF'
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=AT
EOF

    # Füge Networks hinzu
    echo "$WLAN_NETWORKS" | jq -r '.[] | "
network={
    ssid=\"" + .ssid + "\"
    psk=\"" + .password + "\"
    priority=" + (.priority | tostring) + "
    id_str=\"" + (.description // "") + "\"
}"' >> /tmp/wpa_new.conf

    # Installiere neue Config
    sudo mv /tmp/wpa_new.conf /etc/wpa_supplicant/wpa_supplicant.conf
    sudo wpa_cli -i wlan0 reconfigure 2>/dev/null || true

    echo "✓ WLAN Konfiguration aktualisiert"
fi

echo ""
echo "✓ Config-Sync abgeschlossen!"
echo ""

# Log
echo "[$(date)] Config synced from Sanity for ${KIOSK_ID}" >> /home/museumgh/config-sync.log
