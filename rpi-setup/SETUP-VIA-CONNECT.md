# Setup über Raspberry Pi Connect

Wenn deine Pis **nicht im gleichen Netzwerk** sind (z.B. in verschiedenen Museen), nutze diese Anleitung.

## Voraussetzungen

1. Alle Pis sind mit Raspberry Pi Connect verbunden
2. Du siehst sie auf https://connect.raspberrypi.com/
3. Remote Shell funktioniert

## Setup-Schritte

### 1. Pi-Inventory pflegen

Öffne `pi-inventory.txt` und trage deine Pis ein:

```
rpi01,RPI_01,Museum Reutte,Hauptausstellung
rpi02,RPI_02,Museum Reutte,Sonderausstellung
rpi03,RPI_03,Außenstelle,Eingangsbereich
```

### 2. Setup-Skript vorbereiten

Erstelle ein vereinfachtes Setup-Skript das über Remote Shell läuft:

```bash
# Auf deinem Mac
cd /Users/marcelgladbach/mk2025/rpi-setup
cat > remote-setup-simple.sh << 'EOF'
#!/bin/bash
# Vereinfachtes Setup für Raspberry Pi Connect Remote Shell

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

KIOSK_URL="https://museumgh.netlify.app/kiosk/${KIOSK_ID}/video"

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
cat > ~/.config/systemd/user/labwc.service << 'LABWC_EOF'
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
LABWC_EOF

systemctl --user daemon-reload
systemctl --user enable labwc.service
echo "✓ Wayland Desktop konfiguriert"

# Setup Chromium autostart
echo ""
echo "► Konfiguriere Kiosk-Modus..."
mkdir -p ~/.config/labwc/
cat > ~/.config/labwc/autostart << AUTOSTART_EOF
#!/bin/bash
sleep 3
WAYLAND_DISPLAY=wayland-1 wlopm --on \* 2>/dev/null || true
chromium --kiosk --noerrdialogs --disable-infobars --no-first-run --autoplay-policy=no-user-gesture-required --app=${KIOSK_URL} &
sleep 2
unclutter -idle 5 &
AUTOSTART_EOF

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
EOF

chmod +x remote-setup-simple.sh
```

### 3. Setup durchführen

**Für JEDEN Pi:**

1. **Öffne Raspberry Pi Connect:**
   - Gehe zu https://connect.raspberrypi.com/
   - Finde deinen Pi in der Liste (z.B. "rpi01")

2. **Öffne Remote Shell:**
   - Klicke auf den Pi
   - Klicke "Remote Shell"
   - Warte bis Shell geladen ist

3. **Lade Setup-Skript:**
   ```bash
   # In der Remote Shell
   wget https://gist.github.com/DEINE_GIST_URL/remote-setup-simple.sh
   # ODER kopiere das Skript manuell
   ```

4. **Führe Setup aus:**
   ```bash
   chmod +x remote-setup-simple.sh
   ./remote-setup-simple.sh
   ```

5. **Folge den Anweisungen:**
   - Skript zeigt Hostname, MAC, Kiosk-ID
   - Bestätige mit "j"
   - Warte 5-10 Minuten

6. **Reboot:**
   ```bash
   sudo reboot
   ```

7. **Teste Screen Sharing:**
   - Warte 2 Minuten
   - Gehe zurück zu connect.raspberrypi.com
   - Klicke auf den Pi
   - Klicke "Screen Sharing"
   - Du solltest den Chromium Kiosk sehen!

### 4. Für mehrere Pis

Wiederhole Schritte 1-7 für jeden Pi in deiner Liste.

**Tipp:** Öffne mehrere Browser-Tabs mit Remote Shells für verschiedene Pis parallel!

## Alternative: Setup-Skript via Copy & Paste

Falls kein wget möglich ist, kannst du das Skript auch direkt in die Remote Shell kopieren:

1. Öffne `remote-setup-simple.sh` auf deinem Mac
2. Kopiere den **gesamten Inhalt**
3. In Remote Shell:
   ```bash
   nano setup.sh
   # Paste den Inhalt
   # Speichern: Ctrl+O, Enter, Ctrl+X
   chmod +x setup.sh
   ./setup.sh
   ```

## WiFi hinzufügen

Falls du zusätzliche WLANs brauchst, in der Remote Shell:

```bash
sudo nano /etc/wpa_supplicant/wpa_supplicant.conf
```

Füge hinzu:
```
network={
    ssid="Museum-WLAN"
    psk="passwort"
    priority=10
    id_str="museum"
}
```

Speichern und neu laden:
```bash
sudo wpa_cli -i wlan0 reconfigure
```

## Troubleshooting

### Remote Shell Verbindung bricht ab

- Warte 1 Minute und versuche erneut
- Prüfe Internetverbindung des Pi

### Setup schlägt fehl

- Prüfe ob Pi Internet-Zugang hat: `ping -c 3 8.8.8.8`
- Wiederhole Setup: `./remote-setup-simple.sh`

### Screen Sharing zeigt nichts

- Warte 2-3 Minuten nach Reboot
- Prüfe in Remote Shell: `ps aux | grep labwc`
- Prüfe Status: `rpi-connect status`

---

**Setup-Zeit pro Pi: ~10 Minuten**
(Die meiste Zeit ist System-Update)
