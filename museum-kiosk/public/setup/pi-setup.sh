#!/bin/bash
#
# Museum Kiosk - Raspberry Pi WLAN Setup Script
# =============================================
# Einmal ausführen, dann läuft der Pi automatisch
#

set -e

echo "================================================"
echo " Museum Kiosk - Raspberry Pi Setup"
echo " WLAN-optimierte Version"
echo "================================================"

# Variablen
KIOSK_URL="https://museum-kiosk.netlify.app/viewer"  # Ändern Sie diese URL!
USER="pi"

# System aktualisieren
echo "1. System aktualisieren..."
sudo apt-get update
sudo apt-get upgrade -y

# Benötigte Pakete installieren
echo "2. Installiere benötigte Pakete..."
sudo apt-get install -y \
    chromium-browser \
    xserver-xorg \
    xinit \
    x11-xserver-utils \
    unclutter \
    nginx \
    jq

# WLAN Power Management deaktivieren (WICHTIG!)
echo "3. Deaktiviere WLAN Power Management..."
sudo tee /etc/rc.local > /dev/null <<EOF
#!/bin/sh -e
# WLAN Power Management deaktivieren
/sbin/iwconfig wlan0 power off
exit 0
EOF
sudo chmod +x /etc/rc.local

# Kiosk-Start-Script erstellen
echo "4. Erstelle Kiosk-Start-Script..."
cat > /home/$USER/kiosk.sh <<'EOF'
#!/bin/bash

# Warte auf WLAN-Verbindung
echo "Warte auf WLAN-Verbindung..."
while ! ping -c 1 -W 1 google.com > /dev/null 2>&1; do
    echo "Keine Verbindung, warte..."
    sleep 5
done
echo "WLAN verbunden!"

# MAC-Adresse auslesen (WLAN)
MAC=$(cat /sys/class/net/wlan0/address | tr ':' '-')
echo "MAC-Adresse: $MAC"

# Kiosk URL
URL="KIOSK_URL_PLACEHOLDER/$MAC"
echo "Lade: $URL"

# X-Server Einstellungen
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
    --disable-translate \
    --no-first-run \
    --fast \
    --fast-start \
    --disable-features=Translate \
    --disk-cache-dir=/tmp/chromium-cache \
    --disk-cache-size=100000000 \
    "$URL"
EOF

# URL im Script ersetzen
sed -i "s|KIOSK_URL_PLACEHOLDER|$KIOSK_URL|g" /home/$USER/kiosk.sh
chmod +x /home/$USER/kiosk.sh

# WLAN-Watchdog Script
echo "5. Erstelle WLAN-Watchdog..."
cat > /home/$USER/wifi-watchdog.sh <<'EOF'
#!/bin/bash
#
# WLAN Watchdog - Stellt sicher, dass WLAN immer läuft
#

while true; do
    # Prüfe WLAN-Verbindung
    if ! ping -c 1 -W 2 8.8.8.8 > /dev/null 2>&1; then
        echo "$(date): WLAN down, versuche Neuverbindung..."
        
        # WLAN neu starten
        sudo ifconfig wlan0 down
        sleep 2
        sudo ifconfig wlan0 up
        
        # Warte auf Verbindung
        sleep 10
        
        # Wenn immer noch keine Verbindung, Neustart
        if ! ping -c 1 -W 2 8.8.8.8 > /dev/null 2>&1; then
            echo "$(date): WLAN Neustart fehlgeschlagen, System-Neustart..."
            sudo reboot
        fi
    fi
    
    # Alle 30 Sekunden prüfen
    sleep 30
done
EOF
chmod +x /home/$USER/wifi-watchdog.sh

# Systemd Service für Kiosk
echo "6. Erstelle Systemd Service..."
sudo tee /etc/systemd/system/kiosk.service > /dev/null <<EOF
[Unit]
Description=Museum Kiosk
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$USER
Environment="DISPLAY=:0"
Environment="XAUTHORITY=/home/$USER/.Xauthority"
ExecStartPre=/bin/bash -c 'while ! ping -c 1 google.com > /dev/null 2>&1; do sleep 5; done'
ExecStart=/usr/bin/xinit /home/$USER/kiosk.sh -- :0 -nocursor
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Systemd Service für WLAN Watchdog
sudo tee /etc/systemd/system/wifi-watchdog.service > /dev/null <<EOF
[Unit]
Description=WiFi Watchdog
After=network.target

[Service]
Type=simple
User=root
ExecStart=/home/$USER/wifi-watchdog.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Offline Cache mit nginx einrichten
echo "7. Richte lokalen Cache ein..."
sudo tee /etc/nginx/sites-available/kiosk-cache > /dev/null <<'EOF'
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=kiosk_cache:10m max_size=1g inactive=60m use_temp_path=off;

server {
    listen 8080;
    
    location / {
        proxy_pass KIOSK_URL_PLACEHOLDER;
        proxy_cache kiosk_cache;
        proxy_cache_valid 200 1h;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        proxy_cache_background_update on;
        proxy_cache_lock on;
        
        add_header X-Cache-Status $upstream_cache_status;
    }
}
EOF

sudo sed -i "s|KIOSK_URL_PLACEHOLDER|$KIOSK_URL|g" /etc/nginx/sites-available/kiosk-cache
sudo ln -sf /etc/nginx/sites-available/kiosk-cache /etc/nginx/sites-enabled/
sudo systemctl restart nginx

# Auto-Login konfigurieren
echo "8. Konfiguriere Auto-Login..."
sudo mkdir -p /etc/systemd/system/getty@tty1.service.d/
sudo tee /etc/systemd/system/getty@tty1.service.d/autologin.conf > /dev/null <<EOF
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin $USER --noclear %I \$TERM
EOF

# Services aktivieren
echo "9. Aktiviere Services..."
sudo systemctl daemon-reload
sudo systemctl enable kiosk.service
sudo systemctl enable wifi-watchdog.service

# Boot-Konfiguration optimieren
echo "10. Optimiere Boot-Konfiguration..."
sudo tee -a /boot/config.txt > /dev/null <<EOF

# Kiosk Optimierungen
disable_splash=1
boot_delay=0
gpu_mem=256
EOF

# Swappiness reduzieren (SD-Karte schonen)
echo "11. Optimiere System für SD-Karte..."
echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf

# Read-only Filesystem vorbereiten (optional)
echo "12. Bereite Read-only Filesystem vor..."
cat > /home/$USER/enable-readonly.sh <<'EOF'
#!/bin/bash
# Macht das Filesystem read-only (optional, für Produktion)
echo "Aktiviere Read-only Filesystem..."
sudo raspi-config nonint enable_overlayfs
echo "Read-only aktiviert. Neustart erforderlich."
EOF
chmod +x /home/$USER/enable-readonly.sh

echo "================================================"
echo " Setup abgeschlossen!"
echo "================================================"
echo ""
echo " MAC-Adresse: $(cat /sys/class/net/wlan0/address)"
echo " Kiosk URL: $KIOSK_URL/$(cat /sys/class/net/wlan0/address | tr ':' '-')"
echo ""
echo " Der Pi startet nach dem Neustart automatisch"
echo " im Kiosk-Modus."
echo ""
echo " Optional: Read-only Filesystem aktivieren mit:"
echo " ./enable-readonly.sh"
echo ""
echo " Neustart in 10 Sekunden..."
sleep 10
sudo reboot