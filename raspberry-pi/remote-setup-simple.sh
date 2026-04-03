#!/bin/bash
# Vereinfachtes Setup für Raspberry Pi Connect Remote Shell
# Kann direkt auf dem Pi ausgeführt werden

set -e

echo "╔══════════════════════════════════════════╗"
echo "║  Raspberry Pi Kiosk Setup (Remote)       ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Get hostname and determine Kiosk ID
HOSTNAME=$(hostname)
MAC=$(cat /sys/class/net/eth0/address 2>/dev/null || cat /sys/class/net/wlan0/address | tr -d ':' | tail -c 7)

if [[ "$HOSTNAME" =~ rpi([0-9]+) ]]; then
    KIOSK_ID=$(printf "RPI_%02d" ${BASH_REMATCH[1]})
else
    KIOSK_ID="RPI_${MAC: -2}"
fi

KIOSK_URL="${1:-https://museumgh.netlify.app/kiosk/${KIOSK_ID}/video}"

echo "Hostname: $HOSTNAME"
echo "MAC: $MAC"
echo "Kiosk-ID: $KIOSK_ID"
echo "URL: $KIOSK_URL"
echo ""

read -p "Fortfahren? (j/n): " confirm
if [[ ! "$confirm" =~ ^[jJyY]$ ]]; then
    echo "Abgebrochen."
    exit 0
fi

# Update system
echo ""
echo "► System-Update (dauert 2-5 Min.)..."
sudo apt-get update -qq
sudo apt-get upgrade -y -qq
echo "✓ System aktualisiert"

# Install packages
echo ""
echo "► Installiere Pakete..."
sudo apt-get install -y -qq labwc wayvnc chromium unclutter rpi-connect
echo "✓ Pakete installiert"

# Add to groups
echo ""
echo "► Konfiguriere Berechtigungen..."
sudo usermod -a -G video,input,render,netdev museumgh
echo "✓ Berechtigungen gesetzt"

# Configure Raspberry Pi Connect
echo ""
echo "► Aktiviere Screen Sharing..."
sudo systemctl enable rpi-connect
sudo systemctl start rpi-connect
rpi-connect on
echo "✓ Screen Sharing aktiviert"

# Setup labwc service
echo ""
echo "► Konfiguriere Wayland Desktop..."
mkdir -p ~/.config/systemd/user/
cat > ~/.config/systemd/user/labwc.service << 'EOF'
[Unit]
Description=labwc Wayland Compositor
After=graphical.target

[Service]
Type=simple
Environment=XDG_SESSION_TYPE=wayland
Environment=XDG_RUNTIME_DIR=/run/user/1000
ExecStart=/usr/bin/labwc
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
EOF

systemctl --user daemon-reload
systemctl --user enable labwc.service
echo "✓ Wayland Desktop konfiguriert"

# Setup Chromium autostart
echo ""
echo "► Konfiguriere Kiosk-Modus..."
mkdir -p ~/.config/labwc/
cat > ~/.config/labwc/autostart << EOF
#!/bin/bash
sleep 3
WAYLAND_DISPLAY=wayland-1 wlopm --on \* 2>/dev/null || true
chromium --kiosk --noerrdialogs --disable-infobars --no-first-run --autoplay-policy=no-user-gesture-required --app=${KIOSK_URL} &
sleep 2
unclutter -idle 5 &
EOF

chmod +x ~/.config/labwc/autostart
echo "✓ Kiosk-Modus konfiguriert"

# Configure autologin
echo ""
echo "► Konfiguriere Autologin..."
sudo raspi-config nonint do_boot_behaviour B2
echo "✓ Autologin konfiguriert"

# Enable linger
echo ""
echo "► Aktiviere User-Services..."
sudo loginctl enable-linger museumgh
echo "✓ User-Services aktiviert"

# Cleanup old configs
echo ""
echo "► Räume alte Configs auf..."
sudo systemctl stop lightdm.service 2>/dev/null || true
sudo systemctl disable lightdm.service 2>/dev/null || true
sudo rm -f /etc/systemd/system/kiosk.service 2>/dev/null || true
sudo rm -rf /etc/systemd/system/getty@tty1.service.d/ 2>/dev/null || true
rm -f ~/.bash_profile ~/.profile 2>/dev/null || true
echo "✓ Aufgeräumt"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  ✓ Setup abgeschlossen!                  ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Nächster Schritt:"
echo "  sudo reboot"
echo ""
echo "Nach Reboot (2 Min warten):"
echo "  - Screen Sharing in Connect sollte funktionieren"
echo "  - Chromium Kiosk sollte laufen"
echo ""

# Save setup info
cat > ~/pi-setup-info.txt << INFOEOF
Raspberry Pi Setup Info
=======================
Datum: $(date)
Hostname: $HOSTNAME
MAC: $MAC
Kiosk-ID: $KIOSK_ID
URL: $KIOSK_URL
INFOEOF

echo "Setup-Info gespeichert in: ~/pi-setup-info.txt"
echo ""
