# Raspberry Pi Museum Kiosk Setup

Automatisches One-Click-Setup für Raspberry Pi Kiosk mit Chromium, Raspberry Pi Connect Screen Sharing und zentraler Sanity-Verwaltung.

## 🚀 Quick Start

```bash
./one-click-setup.sh
```

Das wars! Das Skript macht alles automatisch.

## Hauptdateien

- **`one-click-setup.sh`** - One-Click Setup von deinem Mac aus (empfohlen!)
- **`sanity-register-device.sh`** - Registriert Pis in Sanity Backend
- **`pi-heartbeat.sh`** - Sendet Status an Sanity (läuft auf Pi)
- **`pi-sync-config.sh`** - Zieht Config von Sanity (läuft auf Pi)
- **Desktop Commands** - Klickbare Shortcuts für häufige Aufgaben

## Features

✅ **One-Click Setup** - Komplettes Setup mit einem Befehl
✅ **Raspberry Pi Connect** - Remote Screen Sharing vorinstalliert
✅ **Chromium Kiosk** - Automatischer Vollbild-Browser
✅ **Sanity Integration** - Zentrale Pi-Verwaltung im Backend
✅ **Multi-WLAN Support** - Mehrere Netzwerke mit Priorität
✅ **MAC-basierte IDs** - Automatische Kiosk-ID Zuweisung
✅ **Status Monitoring** - Echtzeit-Status in Sanity Studio
✅ **Auto Config Sync** - Config von Sanity beim Boot
✅ **Desktop Shortcuts** - Klickbare Commands für häufige Tasks

## Setup Workflow

### 1. Vorbereitung

```bash
cd /Users/marcelgladbach/mk2025/rpi-setup
```

**Einmalig:** Erstelle Sanity API Tokens (siehe `SANITY-TOKENS-SETUP.md`)

### 2. Pi Setup starten

```bash
./one-click-setup.sh
```

Oder klicke auf: `🚀 Pi Setup starten.command` auf dem Desktop

**Das Skript fragt:**
- Pi Hostname (z.B. rpi01, rpi02)
- WLAN-Netzwerke (optional)

**Das Skript macht automatisch:**
1. SSH-Verbindung zum Pi
2. System-Update (apt)
3. Chromium Installation
4. Raspberry Pi Connect Installation & Activation
5. Desktop Autologin aktivieren
6. Chromium Kiosk Autostart einrichten
7. Screen Blanking deaktivieren
8. Sanity Heartbeat & Sync installieren
9. Device in Sanity registrieren

### 3. Pi neustarten

```bash
ssh museumgh@rpi01.local 'sudo reboot'
```

Oder klicke auf: `🔄 Pi Neustarten.command` auf dem Desktop

## Nach dem Setup

### Screen Sharing testen

1. Warte 2 Minuten nach dem Reboot
2. Gehe zu: https://connect.raspberrypi.com/
3. Klicke auf deinen Pi (z.B. "rpi01")
4. Klicke "Screen Sharing"
5. Du solltest Chromium Kiosk mit der Museumsseite sehen! 🎬

### Sanity Studio öffnen

1. Gehe zu: https://museumghbackend.sanity.studio/
2. Öffne "Kiosk Devices"
3. Finde dein Device (z.B. RPI_01)
4. Nach ~5 Minuten: Status wird 🟢 Online
5. Du siehst: IP-Adresse, Uptime, Chromium-Status

### WLAN-Netzwerke hinzufügen (optional)

1. Öffne dein Device in Sanity Studio
2. Klick "WLAN Netzwerke" → "Add item"
3. SSID, Passwort, Priorität eingeben
4. Speichern
5. Pi neustarten: `ssh museumgh@rpi01.local 'sudo reboot'`
6. Pi zieht automatisch neue Config von Sanity

## System-Architektur

**Raspberry Pi OS Full Desktop Bookworm** (nicht Lite!)
- **LightDM** - Login/Session Manager (managed Autologin)
- **Wayland + labwc** - Display Server mit Compositor (seit Nov 2024)
- **Pixel** - Desktop Environment (läuft auf labwc)
- **Desktop Autologin** via raspi-config B4 (LightDM startet auto)
- **Chromium Autostart** via `.config/autostart/kiosk.desktop`

Hinweis: Bookworm (2023) startete mit wayfire, wechselte Nov 2024 zu labwc

**Sanity Integration:**
- Heartbeat: Alle 5 Min Status senden
- Config Sync: Beim Boot Config ziehen
- Device Management: Zentral in Sanity Studio

**Raspberry Pi Connect:**
- Offizieller Remote Access Service
- Screen Sharing & Remote Shell (funktioniert mit Wayland)
- Automatisch aktiviert beim Setup

## Troubleshooting

### Chromium startet nicht

```bash
ssh museumgh@rpi01.local

# Prüfe Chromium Prozess
ps aux | grep chromium

# Prüfe Autostart Config
cat ~/.config/autostart/kiosk.desktop

# Desktop neu starten (bei Bookworm mit Wayland)
sudo systemctl restart graphical.target
# Oder einfach Pi neustarten:
sudo reboot
```

### Screen Sharing funktioniert nicht

```bash
ssh museumgh@rpi01.local

# Prüfe Raspberry Pi Connect Status
rpi-connect status

# Sollte zeigen: "Connected"
# Falls nicht: rpi-connect signin
```

### Device erscheint nicht in Sanity

```bash
# Manuell registrieren
cd /Users/marcelgladbach/mk2025/rpi-setup
./sanity-register-device.sh RPI_01 rpi01 abc123 "Museum Reutte"
```

### Status wird nicht aktualisiert in Sanity

```bash
ssh museumgh@rpi01.local

# Heartbeat manuell testen
bash ~/pi-heartbeat.sh

# Log prüfen
tail ~/heartbeat.log

# Cron-Job prüfen
crontab -l | grep heartbeat
```

### Config-Sync funktioniert nicht

```bash
ssh museumgh@rpi01.local

# Sync manuell testen
bash ~/pi-sync-config.sh

# Sollte zeigen:
# ✓ Config von Sanity geladen
# ✓ Kiosk URL aktualisiert

# jq installiert?
which jq || sudo apt install jq -y
```

## Kiosk URL anpassen

### Option 1: In Sanity (empfohlen)

1. Öffne: https://museumghbackend.sanity.studio/
2. Gehe zu "Kiosk Devices"
3. Öffne dein Device
4. Ändere "Kiosk URL"
5. Speichern
6. Pi neustarten: `ssh museumgh@rpi01.local 'sudo reboot'`

### Option 2: Direkt auf Pi

```bash
ssh museumgh@rpi01.local
nano ~/.config/autostart/kiosk.desktop
# Ändere die URL in der Exec-Zeile
# Speichern: Ctrl+O, Enter, Ctrl+X
sudo reboot
```

## Weitere Dokumentation

- **`SANITY-INTEGRATION-COMPLETE.md`** - Komplette Sanity Integration Dokumentation
- **`SANITY-TOKENS-SETUP.md`** - API Token Setup Anleitung
- **`SANITY-INTEGRATION.md`** - Detaillierte Sanity Nutzung
- **`README-ONECLICK.md`** - One-Click Setup Details

## Links

- **Sanity Studio:** https://museumghbackend.sanity.studio/
- **Sanity API Tokens:** https://manage.sanity.io/projects/832k5je1/settings/api
- **Raspberry Pi Connect:** https://connect.raspberrypi.com/
- **Museum Frontend:** https://museumgh.netlify.app/
