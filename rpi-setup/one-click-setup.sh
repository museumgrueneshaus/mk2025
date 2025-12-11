#!/bin/bash
# One-Click Wayland Kiosk Setup für Raspberry Pi
# Mit interaktiver Multi-WLAN Konfiguration und MAC-basierter Kiosk-ID

set -e

# Configuration
PI_USER="museumgh"
PI_PASSWORD="gh2025#"

echo "╔══════════════════════════════════════════╗"
echo "║  Raspberry Pi Wayland Kiosk Setup       ║"
echo "║  Museum Grünes Haus                     ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Ask for hostname if not provided as argument
if [ -z "$1" ]; then
    echo "Welchen Pi möchtest du aufsetzen?"
    echo ""
    read -p "Hostname oder IP [rpi01.local]: " PI_HOST
    PI_HOST="${PI_HOST:-rpi01.local}"
else
    PI_HOST="$1"
fi

echo ""
echo "Target: $PI_HOST"
echo "User: $PI_USER"
echo ""

# Check if Pi is reachable
echo "► Prüfe ob Pi erreichbar ist..."
if ! ping -c 1 -W 2 $PI_HOST &> /dev/null; then
    echo "✗ ERROR: Kann $PI_HOST nicht erreichen"
    echo ""
    echo "Stelle sicher:"
    echo "  1. Pi ist eingeschaltet"
    echo "  2. Pi ist mit Netzwerk verbunden"
    echo "  3. Du bist im gleichen Netzwerk"
    echo "  4. Hostname ist korrekt (oder nutze IP-Adresse)"
    echo ""
    echo "Versuche:"
    echo "  ./one-click-setup.sh 192.168.1.XXX"
    echo ""
    exit 1
fi
echo "✓ Pi ist erreichbar!"
echo ""

# Remove old SSH host key if exists (happens after SD card reflash)
echo "► Bereite SSH-Verbindung vor..."
ssh-keygen -R $PI_HOST 2>/dev/null
ssh-keygen -R $(echo $PI_HOST | sed 's/.local//') 2>/dev/null
echo "✓ Alte SSH-Keys entfernt"
echo ""

# Setup SSH key authentication (so password is only needed once!)
echo "► Richte SSH-Key-Authentifizierung ein..."
echo "   (Danach musst du das Passwort nicht mehr eingeben!)"
echo ""

# Create SSH key if it doesn't exist
if [ ! -f ~/.ssh/id_rsa ]; then
    echo "Erstelle SSH-Key..."
    ssh-keygen -t rsa -N "" -f ~/.ssh/id_rsa -q
    echo "✓ SSH-Key erstellt"
fi

# Copy SSH key to Pi (this will ask for password ONE time)
echo "Bitte gib EINMAL das Passwort ein: $PI_PASSWORD"
echo ""
if ! ssh-copy-id -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i ~/.ssh/id_rsa.pub ${PI_USER}@${PI_HOST} 2>&1 | grep -v "Warning"; then
    echo ""
    echo "✗ Konnte SSH-Key nicht kopieren!"
    echo ""
    echo "Versuche manuelle Verbindung..."
    if ! ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${PI_USER}@${PI_HOST} "echo 'SSH OK'"; then
        echo ""
        echo "✗ SSH-Verbindung fehlgeschlagen!"
        echo ""
        echo "Mögliche Probleme:"
        echo "  1. Falsches Passwort (sollte sein: $PI_PASSWORD)"
        echo "  2. SSH ist nicht aktiviert am Pi"
        echo "  3. User '$PI_USER' existiert nicht"
        echo ""
        exit 1
    fi
fi

echo ""
echo "✓ SSH-Key-Authentifizierung eingerichtet!"
echo "✓ Ab jetzt wird KEIN Passwort mehr benötigt!"
echo ""

# Get MAC address and determine Kiosk ID
echo "► Lese Pi-Informationen aus..."
MAC_ADDRESS=$(ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=5 ${PI_USER}@${PI_HOST} "cat /sys/class/net/eth0/address 2>/dev/null || cat /sys/class/net/wlan0/address" 2>/dev/null | tr -d ':' | tail -c 7)
HOSTNAME=$(ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=5 ${PI_USER}@${PI_HOST} "hostname" 2>/dev/null)

# Check if we got the info
if [ -z "$MAC_ADDRESS" ] || [ -z "$HOSTNAME" ]; then
    echo ""
    echo "⚠️  Konnte Pi-Infos nicht komplett auslesen"
    echo ""
    read -p "Hostname manuell eingeben [rpi01]: " MANUAL_HOSTNAME
    HOSTNAME="${MANUAL_HOSTNAME:-rpi01}"
    MAC_ADDRESS="000000"
    echo "✓ Nutze Hostname: $HOSTNAME"
else
    echo "✓ Pi-Infos erfolgreich ausgelesen"
fi

# Determine Kiosk ID from hostname or MAC
if [[ "$HOSTNAME" =~ rpi([0-9]+) ]]; then
    KIOSK_ID=$(printf "RPI_%02d" ${BASH_REMATCH[1]})
elif [[ "$PI_HOST" =~ rpi([0-9]+) ]]; then
    KIOSK_ID=$(printf "RPI_%02d" ${BASH_REMATCH[1]})
else
    # Use last 2 chars of MAC as fallback
    KIOSK_ID="RPI_${MAC_ADDRESS: -2}"
fi

KIOSK_URL="${2:-https://museumgh.netlify.app/kiosk/${KIOSK_ID}/video}"

echo "✓ Hostname: $HOSTNAME"
echo "✓ MAC (letzte 6): $MAC_ADDRESS"
echo "✓ Kiosk-ID: $KIOSK_ID"
echo "✓ Kiosk URL: $KIOSK_URL"
echo ""

# Show existing WiFi networks
echo "╔══════════════════════════════════════════╗"
echo "║  Vorhandene WLAN-Konfiguration           ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Bereits konfigurierte WLANs auf dem Pi:"
echo ""

EXISTING_WLANS=$(ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${PI_USER}@${PI_HOST} "sudo grep -E '^[[:space:]]*ssid=' /etc/wpa_supplicant/wpa_supplicant.conf 2>/dev/null | sed 's/.*ssid=\"\\(.*\\)\"/\\1/'" 2>/dev/null || echo "")

if [ -z "$EXISTING_WLANS" ]; then
    echo "  (Noch keine WLANs konfiguriert)"
else
    echo "$EXISTING_WLANS" | while IFS= read -r ssid; do
        echo "  ✓ $ssid"
    done
fi

echo ""

# Interactive WiFi Configuration
echo "╔══════════════════════════════════════════╗"
echo "║  Multi-WLAN Konfiguration                ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Möchtest du zusätzliche WLANs konfigurieren?"
echo ""
read -p "Zusätzliche WLANs hinzufügen? (j/n): " add_wlans

WIFI_CONFIG=""
if [[ "$add_wlans" =~ ^[jJyY]$ ]]; then
    echo ""
    echo "Du kannst jetzt mehrere WLANs hinzufügen."
    echo "Höhere Priorität = bevorzugtes Netzwerk"
    echo ""

    priority=10
    network_num=1

    while true; do
        echo "─────────────────────────────────────────"
        echo "WLAN #$network_num (Priorität: $priority)"
        echo "─────────────────────────────────────────"

        read -p "SSID (leer = fertig): " ssid
        if [ -z "$ssid" ]; then
            break
        fi

        read -p "Passwort [gh2025#]: " password
        password="${password:-gh2025#}"
        echo ""

        read -p "Name/Beschreibung (z.B. 'home', 'museum', 'hotspot'): " id_str

        WIFI_CONFIG+="
network={
    ssid=\"$ssid\"
    psk=\"$password\"
    priority=$priority
    id_str=\"$id_str\"
}
"

        echo "✓ WLAN '$ssid' hinzugefügt (Priorität: $priority)"
        echo ""

        priority=$((priority - 1))
        network_num=$((network_num + 1))

        read -p "Weiteres WLAN hinzufügen? (j/n): " add_more
        if [[ ! "$add_more" =~ ^[jJyY]$ ]]; then
            break
        fi
        echo ""
    done

    if [ -n "$WIFI_CONFIG" ]; then
        echo ""
        echo "✓ Insgesamt $((network_num - 1)) zusätzliche WLAN(s) konfiguriert"
    fi
fi

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  Installation starten                    ║"
echo "╚══════════════════════════════════════════╝"
echo ""
read -p "Bereit für Installation? (j/n): " start_install
if [[ ! "$start_install" =~ ^[jJyY]$ ]]; then
    echo "Installation abgebrochen."
    exit 0
fi
echo ""

# Create remote setup script
echo "► Erstelle Setup-Skript..."
cat > /tmp/pi-remote-setup.sh << 'REMOTESCRIPT'
#!/bin/bash
set -e

echo ""
echo "═══════════════════════════════════════"
echo "Setup läuft auf Raspberry Pi..."
echo "═══════════════════════════════════════"
echo ""

# Update system
echo "► Aktualisiere System-Pakete..."
echo "  (Das kann einige Minuten dauern...)"
sudo apt-get update -qq
sudo apt-get upgrade -y -qq
echo "✓ System aktualisiert"
echo ""

# Install required packages (only what we need for Full Desktop!)
echo "► Installiere benötigte Pakete..."
PACKAGES="chromium unclutter rpi-connect"
for pkg in $PACKAGES; do
    if ! dpkg -l | grep -q "^ii  $pkg "; then
        echo "  Installiere $pkg..."
        sudo apt-get install -y -qq $pkg
    else
        echo "  ✓ $pkg bereits installiert"
    fi
done
echo "✓ Alle Pakete installiert"
echo ""

# Add user to required groups
echo "► Füge User zu Gruppen hinzu..."
sudo usermod -a -G video,input,render,netdev museumgh
echo "✓ User zu Gruppen hinzugefügt: video, input, render, netdev"
echo ""

# Configure WiFi if provided
if [ -f /tmp/wifi_networks.conf ]; then
    echo "► Konfiguriere zusätzliche WLANs..."

    # Create wpa_supplicant.conf if it doesn't exist
    if [ ! -f /etc/wpa_supplicant/wpa_supplicant.conf ]; then
        sudo tee /etc/wpa_supplicant/wpa_supplicant.conf > /dev/null << 'WPAEOF'
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=AT
WPAEOF
    else
        # Backup existing config
        sudo cp /etc/wpa_supplicant/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf.backup
    fi

    # Append new networks
    sudo tee -a /etc/wpa_supplicant/wpa_supplicant.conf < /tmp/wifi_networks.conf > /dev/null

    # Reconfigure WiFi
    sudo wpa_cli -i wlan0 reconfigure &>/dev/null || true

    # Cleanup
    rm /tmp/wifi_networks.conf

    echo "✓ WLANs konfiguriert"
    echo ""
fi

# Enable Raspberry Pi Connect
echo "► Konfiguriere Raspberry Pi Connect..."
sudo systemctl enable rpi-connect &>/dev/null || true
sudo systemctl start rpi-connect || true
rpi-connect on &>/dev/null || true
echo "✓ Raspberry Pi Connect aktiviert"
echo ""

# We DON'T use labwc for Full Desktop - skip this entirely!

# Configure DESKTOP autologin (for Full Desktop!)
echo "► Konfiguriere Desktop Autologin..."
sudo raspi-config nonint do_boot_behaviour B4  # Desktop autologin
echo "✓ Desktop Autologin konfiguriert"
echo ""

# Ensure graphical target and LightDM
echo "► Stelle sicher dass Desktop startet..."
sudo systemctl set-default graphical.target
sudo systemctl enable lightdm 2>/dev/null || true
# Note: Bookworm uses LightDM → Wayland + labwc
echo "✓ Desktop wird starten (LightDM → labwc)"
echo ""

# Clean up OLD configs that might interfere
echo "► Räume alte problematische Configs auf..."
sudo rm -f /etc/systemd/system/kiosk.service 2>/dev/null || true
sudo rm -rf /etc/systemd/system/getty@tty1.service.d/ 2>/dev/null || true
rm -f ~/.bash_profile 2>/dev/null || true
echo "✓ Alte Configs entfernt"
echo ""

# Disable labwc (we use Desktop instead!)
echo "► Deaktiviere labwc (nutzen Desktop stattdessen)..."
systemctl --user disable labwc.service 2>/dev/null || true
rm -f ~/.config/systemd/user/labwc.service 2>/dev/null || true
rm -f ~/.config/labwc/autostart 2>/dev/null || true
echo "✓ labwc deaktiviert"
echo ""

# Setup Desktop Autostart for Chromium
echo "► Konfiguriere Desktop Autostart für Chromium..."
mkdir -p ~/.config/autostart
cat > ~/.config/autostart/kiosk.desktop << 'DESKTOPEOF'
[Desktop Entry]
Type=Application
Name=Museum Kiosk
Exec=chromium --password-store=basic --disable-password-manager-reauthentication --kiosk --noerrdialogs --disable-infobars --no-first-run --autoplay-policy=no-user-gesture-required --disable-features=PreloadMediaEngagementData,MediaEngagementBypassAutoplayPolicies,Translate --accept-lang=de-DE --app=KIOSK_URL_PLACEHOLDER
X-GNOME-Autostart-enabled=true
DESKTOPEOF
echo "✓ Desktop Autostart konfiguriert"
echo ""

# Configure Chromium preferences (disable translate dialog)
echo "► Konfiguriere Chromium Einstellungen..."
mkdir -p ~/.config/chromium/Default
cat > ~/.config/chromium/Default/Preferences << 'PREFEOF'
{
   "translate": {
      "enabled": false
   },
   "translate_accepted_count": 99,
   "translate_denied_count": 99
}
PREFEOF
echo "✓ Chromium Einstellungen konfiguriert"
echo ""

# Disable gnome-keyring (prevents password prompts)
echo "► Deaktiviere Gnome Keyring..."
cat > ~/.config/autostart/gnome-keyring-pkcs11.desktop << 'KEYEOF'
[Desktop Entry]
Type=Application
Name=Certificate and Key Storage
Hidden=true
NoDisplay=true
KEYEOF

cat > ~/.config/autostart/gnome-keyring-secrets.desktop << 'KEYEOF'
[Desktop Entry]
Type=Application
Name=Secret Storage Service
Hidden=true
NoDisplay=true
KEYEOF

cat > ~/.config/autostart/gnome-keyring-ssh.desktop << 'KEYEOF'
[Desktop Entry]
Type=Application
Name=SSH Key Agent
Hidden=true
NoDisplay=true
KEYEOF
echo "✓ Gnome Keyring deaktiviert"
echo ""

# Disable screen blanking
echo "► Deaktiviere Screen Blanking..."
mkdir -p ~/.config/lxsession/LXDE-pi
cat > ~/.config/lxsession/LXDE-pi/autostart << 'LXEOF'
@lxpanel --profile LXDE-pi
@pcmanfm --desktop --profile LXDE-pi
@xscreensaver -no-splash
@point-rpi
@xset s off
@xset -dpms
@xset s noblank
@unclutter -idle 0.1
LXEOF
echo "✓ Screen Blanking deaktiviert"
echo ""

# Install Sanity sync scripts
echo "► Installiere Sanity Sync-Skripte..."
cat > ~/pi-heartbeat.sh << 'HEARTBEAT_EOF'
#!/bin/bash
# Pi Heartbeat - sendet Status regelmäßig an Sanity
# Wird auf dem Pi als Cron-Job ausgeführt (alle 5 Min)

# Sanity Config
SANITY_PROJECT_ID="832k5je1"
SANITY_DATASET="production"
SANITY_TOKEN="skaVkMqYzbkwHfAwuZA4pzh0rTN7rx6BhRa9zDNARi2upbn2t8HwJSfHuRIaNfODq2xss5kcc65A6QtanSPZMrFAJIN5y41TFjqxxT1opOIdiwvwRLMzOquqA8HPYnXsvdKGFMblGb4Ul8eEs1EjCky1DYzXMqC96oSzcoLyJ7bJG7cCZ2zm"  # Muss ein Write-Token sein!

# Pi Info auslesen
HOSTNAME=$(hostname)
MAC_ADDRESS=$(cat /sys/class/net/eth0/address 2>/dev/null || cat /sys/class/net/wlan0/address | tr -d ':' | tail -c 7)
IP_ADDRESS=$(hostname -I | awk '{print $1}')
UPTIME_SECONDS=$(awk '{print int($1)}' /proc/uptime)

# Kiosk-ID bestimmen
if [[ "$HOSTNAME" =~ rpi([0-9]+) ]]; then
    KIOSK_ID=$(printf "RPI_%02d" ${BASH_REMATCH[1]})
else
    KIOSK_ID="RPI_${MAC_ADDRESS: -2}"
fi

# Check ob Chromium läuft
CHROMIUM_RUNNING=false
if pgrep -x chromium > /dev/null; then
    CHROMIUM_RUNNING=true
fi

# Timestamp
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Update Status in Sanity
# Suche Device mit diesem kioskId und update den Status
curl -X POST \
  "https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/${SANITY_DATASET}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SANITY_TOKEN}" \
  -d '{
    "mutations": [
      {
        "patch": {
          "query": "*[_type == \"kioskDevice\" && kioskId == \"'${KIOSK_ID}'\"][0]",
          "set": {
            "status.online": '${CHROMIUM_RUNNING}',
            "status.lastSeen": "'${TIMESTAMP}'",
            "status.ipAddress": "'${IP_ADDRESS}'",
            "status.uptimeSeconds": '${UPTIME_SECONDS}',
            "status.chromiumRunning": '${CHROMIUM_RUNNING}'
          }
        }
      }
    ]
  }' \
  2>/dev/null

# Log
echo "[$(date)] Heartbeat sent for ${KIOSK_ID} - Online: ${CHROMIUM_RUNNING}" >> /home/museumgh/heartbeat.log
HEARTBEAT_EOF

cat > ~/pi-sync-config.sh << 'SYNC_EOF'
#!/bin/bash
# Pi Config Sync - zieht Konfiguration von Sanity beim Start
# Wird beim Boot ausgeführt

# Sanity Config
SANITY_PROJECT_ID="832k5je1"
SANITY_DATASET="production"
SANITY_TOKEN="sk90yXpF4UxoYL90tyv4OHIXWitpSIUDkLp5v2STUyg01emutJaK16v4cg7ycRyhCYeBc0ijYbT04zklte0ecNrQRcSkZvmP7vhDqaSa3vZN2Yt6WAwYX4t3I1B5QaUXVGKAYxYShomGxT3RRJxvKPT9pbqEANfElpDkShq8qhA5Nf4oWUlp"  # Read-Token reicht

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

# Config von Sanity holen
CONFIG=$(curl -s "https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/data/query/${SANITY_DATASET}?query=*%5B_type%20%3D%3D%20%22kioskDevice%22%20%26%26%20kioskId%20%3D%3D%20%22${KIOSK_ID}%22%5D%5B0%5D" \
  -H "Authorization: Bearer ${SANITY_TOKEN}")

if [ -z "$CONFIG" ] || [ "$CONFIG" = "null" ]; then
    echo "⚠️  Keine Config in Sanity gefunden für ${KIOSK_ID}"
    echo "   Erstelle Device in Sanity Studio!"
    exit 1
fi

echo "✓ Config von Sanity geladen"
echo ""

# Parse Config mit jq
KIOSK_URL=$(echo $CONFIG | jq -r '.result.kioskUrl // empty')
WLAN_NETWORKS=$(echo $CONFIG | jq -r '.result.wlanNetworks // empty')

# Update Kiosk URL wenn vorhanden
if [ -n "$KIOSK_URL" ] && [ "$KIOSK_URL" != "null" ]; then
    echo "► Update Kiosk URL: $KIOSK_URL"

    # Update Desktop Autostart
    if [ -f ~/.config/autostart/kiosk.desktop ]; then
        sed -i "s|Exec=chromium.*|Exec=chromium --password-store=basic --disable-password-manager-reauthentication --kiosk --noerrdialogs --disable-infobars --no-first-run --autoplay-policy=no-user-gesture-required --disable-features=PreloadMediaEngagementData,MediaEngagementBypassAutoplayPolicies,Translate --accept-lang=de-DE --app=${KIOSK_URL}|" ~/.config/autostart/kiosk.desktop
        echo "✓ Kiosk URL aktualisiert"
    fi
fi

# Update WLAN Networks wenn vorhanden
if [ -n "$WLAN_NETWORKS" ] && [ "$WLAN_NETWORKS" != "null" ] && [ "$WLAN_NETWORKS" != "[]" ]; then
    echo "► Update WLAN Konfiguration..."

    # Backup alte Config
    sudo cp /etc/wpa_supplicant/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf.backup 2>/dev/null || true

    # Erstelle neue Config
    cat > /tmp/wpa_new.conf << 'WPAEOF'
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=AT
WPAEOF

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
SYNC_EOF

chmod +x ~/pi-heartbeat.sh ~/pi-sync-config.sh
echo "✓ Sync-Skripte installiert"
echo ""

# Setup cron jobs
echo "► Richte Cron-Jobs ein..."
(crontab -l 2>/dev/null | grep -v "pi-heartbeat\|pi-sync-config"; echo "*/5 * * * * /home/museumgh/pi-heartbeat.sh") | crontab -
(crontab -l 2>/dev/null | grep -v "pi-sync-config"; echo "@reboot sleep 60 && /home/museumgh/pi-sync-config.sh") | crontab -
echo "✓ Cron-Jobs eingerichtet"
echo ""

echo "═══════════════════════════════════════"
echo "✓ Setup auf Raspberry Pi abgeschlossen!"
echo "═══════════════════════════════════════"
REMOTESCRIPT

# Replace KIOSK_URL_PLACEHOLDER with actual URL
sed -i '' "s|KIOSK_URL_PLACEHOLDER|$KIOSK_URL|g" /tmp/pi-remote-setup.sh

echo "✓ Setup-Skript erstellt"
echo ""

# Copy WiFi config if exists
if [ -n "$WIFI_CONFIG" ]; then
    echo "► Kopiere WLAN-Konfiguration..."
    echo "$WIFI_CONFIG" > /tmp/wifi_networks.conf
    scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null /tmp/wifi_networks.conf ${PI_USER}@${PI_HOST}:/tmp/ &>/dev/null
    rm /tmp/wifi_networks.conf
    echo "✓ WLAN-Config kopiert"
    echo ""
fi

# Copy setup script to Pi
echo "► Kopiere Setup-Skript zum Pi..."
scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null /tmp/pi-remote-setup.sh ${PI_USER}@${PI_HOST}:/tmp/ &>/dev/null
echo "✓ Skript kopiert"
echo ""

# Execute setup on Pi
echo "╔══════════════════════════════════════════╗"
echo "║  Setup läuft auf dem Pi                  ║"
echo "║  (Dies kann 5-10 Minuten dauern)         ║"
echo "╚══════════════════════════════════════════╝"
echo ""
ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -t ${PI_USER}@${PI_HOST} "bash /tmp/pi-remote-setup.sh"
echo ""

# Cleanup
rm /tmp/pi-remote-setup.sh
ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${PI_USER}@${PI_HOST} "rm /tmp/pi-remote-setup.sh" 2>/dev/null || true

# Register device in Sanity
echo ""
echo "► Registriere Device in Sanity..."
if [ -f "./sanity-register-device.sh" ]; then
    bash ./sanity-register-device.sh "$KIOSK_ID" "$HOSTNAME" "$MAC_ADDRESS" "Museum Reutte"
else
    echo "⚠️  sanity-register-device.sh nicht gefunden - Device manuell in Sanity anlegen"
fi

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  🎉 Setup erfolgreich abgeschlossen!     ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Pi-Informationen:"
echo "  Hostname: $HOSTNAME"
echo "  MAC: $MAC_ADDRESS"
echo "  Kiosk-ID: $KIOSK_ID"
echo "  URL: $KIOSK_URL"
echo ""
echo "Nächste Schritte:"
echo ""
echo "1. Pi neustarten:"
echo "   ssh ${PI_USER}@${PI_HOST} 'sudo reboot'"
echo ""
echo "2. 2 Minuten warten bis Pi hochgefahren ist"
echo ""
echo "3. Screen Sharing testen:"
echo "   → https://connect.raspberrypi.com/"
echo "   → Login mit deinem Raspberry Pi Account"
echo "   → Klick auf '$HOSTNAME'"
echo "   → Klick 'Screen Sharing'"
echo "   → Du solltest Chromium Kiosk sehen! 🎬"
echo ""
echo "4. Device in Sanity Studio verwalten:"
echo "   → https://museumgh.sanity.studio/"
echo "   → Öffne 'Kiosk Devices'"
echo "   → Finde '$KIOSK_ID'"
echo "   → Füge WLAN-Netzwerke hinzu"
echo "   → Status wird alle 5 Min aktualisiert"
echo ""
echo "5. Optional - Status via SSH prüfen:"
echo "   ssh ${PI_USER}@${PI_HOST}"
echo "   ps aux | grep chromium"
echo "   rpi-connect status"
echo ""

if [ -n "$WIFI_CONFIG" ]; then
    echo "6. WLAN-Verbindung prüfen:"
    echo "   ssh ${PI_USER}@${PI_HOST} 'iwconfig wlan0'"
    echo ""
fi

echo "Bei Problemen siehe: README-ONECLICK.md"
echo ""

# Save setup info for reference
cat > /tmp/pi-${KIOSK_ID}-info.txt << EOF
Raspberry Pi Setup Info
=======================
Datum: $(date)
Hostname: $HOSTNAME
MAC: $MAC_ADDRESS
Kiosk-ID: $KIOSK_ID
URL: $KIOSK_URL
EOF

mv /tmp/pi-${KIOSK_ID}-info.txt .
echo "Setup-Info gespeichert in: pi-${KIOSK_ID}-info.txt"
echo ""
