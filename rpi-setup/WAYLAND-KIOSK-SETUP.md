# Raspberry Pi Wayland Kiosk + Screen Sharing Setup
**Museum Grünes Haus - Mit Raspberry Pi Connect Screen Sharing**

---
## ⚠️ VERALTET - Nutze stattdessen: `README.md` und `one-click-setup.sh`
---

Diese Datei beschreibt den **alten manuellen Setup-Prozess**.

**Neuer empfohlener Weg:**
1. Siehe `README.md` für aktuelle Anleitung
2. Nutze `one-click-setup.sh` für automatisches Setup
3. Sanity Integration für zentrale Verwaltung

---

## Übersicht (ALTE VERSION)

Dieses Setup erstellt einen Raspberry Pi Kiosk mit:
- ✅ **Wayland Desktop** (für Screen Sharing)
- ✅ **Raspberry Pi Connect Screen Sharing**
- ✅ **Chromium Kiosk-Modus** (automatischer Video-Start)
- ✅ **Stabil und wartungsarm**

---

## Zugangsdaten

- **Hostname:** `rpi01` (erreichbar via `rpi01.local`)
- **Benutzer:** `museumgh`
- **Passwort:** `gh2025#`

---

## Teil 1: Frische Installation (15 Minuten)

### Schritt 1: SD-Karte vorbereiten

1. **Raspberry Pi Imager** herunterladen:
   - Download: https://www.raspberrypi.com/software/
   - Oder: `brew install --cask raspberry-pi-imager`

2. **Imager starten** und wählen:
   - **Raspberry Pi Device:** Raspberry Pi 4
   - **Operating System:**
     - Raspberry Pi OS (other)
     - **Raspberry Pi OS (64-bit) with Desktop** (Bookworm oder neuer)
   - **Storage:** Deine SD-Karte

3. **Einstellungen** (Zahnrad-Symbol):
   ```
   General:
   ✓ Hostname: rpi01
   ✓ Username: museumgh
   ✓ Password: gh2025#
   ✓ Wireless LAN:
       SSID: [Dein WLAN]
       Password: [WLAN-Passwort]
       Country: AT
   ✓ Locale:
       Timezone: Europe/Vienna
       Keyboard: de

   Services:
   ✓ Enable SSH (mit Passwort)
   ```

4. **Write** klicken und warten (~10 Min.)

5. **SD-Karte in Pi einlegen und starten**

---

### Schritt 2: Erste Verbindung (2 Minuten)

Nach ca. 2 Minuten ist der Pi online:

```bash
# Von deinem Mac
ssh museumgh@rpi01.local
# Passwort: gh2025#
```

**Falls nicht erreichbar:** IP im Router suchen oder Monitor anschließen.

---

### Schritt 3: Wayland Desktop installieren (5 Minuten)

```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Wayland Compositor (labwc) und wayvnc installieren
sudo apt install -y labwc wayvnc chromium unclutter

# User zu notwendigen Gruppen hinzufügen
sudo usermod -a -G video,input,render,netdev museumgh

# Reboot
sudo reboot
```

Warte 1 Minute, dann wieder einloggen:
```bash
ssh museumgh@rpi01.local
```

---

### Schritt 4: Raspberry Pi Connect aktivieren (2 Minuten)

```bash
# Pi Connect installieren (falls nicht vorhanden)
sudo apt install -y rpi-connect

# Pi Connect aktivieren
sudo systemctl enable rpi-connect
sudo systemctl start rpi-connect

# Screen Sharing aktivieren
rpi-connect on

# Status prüfen
rpi-connect status
```

Du solltest sehen:
```
Signed in: yes
Screen sharing: allowed
Remote shell: allowed
```

**Wichtig:** Geh zu https://connect.raspberrypi.com/ und melde dich an. Der Pi sollte dort als "rpi01" erscheinen.

---

## Teil 2: Automatisches Setup (1 Befehl!)

Das Setup-Skript macht alles automatisch:
- Labwc systemd service
- Chromium Kiosk autostart
- Screen Blanking deaktivieren

### Von deinem Mac aus:

```bash
# In dein Setup-Verzeichnis wechseln
cd /Users/marcelgladbach/mk2025/rpi-setup

# Deploy-Skript ausführbar machen
chmod +x deploy.sh

# Alles automatisch auf den Pi deployen
./deploy.sh
```

Das Skript:
1. Prüft ob Pi erreichbar ist
2. Kopiert alle Config-Dateien
3. Installiert labwc systemd user service
4. Richtet Chromium Autostart ein
5. Aktiviert Console Autologin

### Dann Pi rebooten:

```bash
ssh museumgh@rpi01.local 'sudo reboot'
```

---

## Teil 3: Testen (2 Minuten)

Warte 2 Minuten nach dem Reboot, dann:

### 1. Screen Sharing testen:

1. Geh zu: https://connect.raspberrypi.com/
2. Login mit deinem Raspberry Pi Account
3. Klick auf **rpi01**
4. Klick auf **"Screen Sharing"**
5. Du solltest den Wayland Desktop mit Chromium im Kiosk-Modus sehen!

### 2. Via SSH prüfen:

```bash
ssh museumgh@rpi01.local

# Läuft labwc?
ps aux | grep labwc | grep -v grep

# Läuft Chromium?
ps aux | grep chromium | grep -v grep

# Screen Sharing Status
rpi-connect status
```

Du solltest sehen:
- labwc Prozess läuft
- chromium Prozess läuft
- "Screen sharing: allowed (1 session active)" wenn du verbunden bist

---

## Troubleshooting

### labwc startet nicht

```bash
# Service Status prüfen
systemctl --user status labwc.service

# Logs ansehen
journalctl --user -u labwc.service -b
```

### Chromium startet nicht

```bash
# Autostart-Datei prüfen
cat ~/.config/labwc/autostart

# Manuell starten zum testen
WAYLAND_DISPLAY=wayland-1 chromium --kiosk --app=https://museumgh.netlify.app/kiosk/RPI_01/video &
```

### Screen Sharing zeigt schwarzen Bildschirm

```bash
# Prüfe ob Wayland Session läuft
echo $WAYLAND_DISPLAY
loginctl list-sessions

# wayvnc neu starten
sudo systemctl restart wayvnc
```

### Videos spielen nicht

→ Siehe `convert-for-pi.sh` - Videos müssen H.264 Main Profile sein

---

## Kiosk URL ändern

```bash
# Auf dem Pi
nano ~/.config/labwc/autostart
```

Ändere die URL in der Zeile:
```bash
chromium --kiosk --app=DEINE_URL_HIER &
```

Dann:
```bash
# Chromium neu starten
pkill chromium
```

labwc startet Chromium automatisch wieder neu.

---

## Wartung

### System Updates (monatlich)

```bash
ssh museumgh@rpi01.local
sudo apt update && sudo apt upgrade -y
sudo reboot
```

### Remote Zugriff

1. **Screen Sharing:** https://connect.raspberrypi.com/ → rpi01 → Screen Sharing
2. **Shell:** https://connect.raspberrypi.com/ → rpi01 → Remote Shell
3. **SSH:** `ssh museumgh@rpi01.local`

---

## Backup

### Config sichern

```bash
# Auf dem Pi
tar -czf ~/wayland-kiosk-backup.tar.gz \
  ~/.config/systemd/user/labwc.service \
  ~/.config/labwc/autostart

# Auf Mac runterladen
scp museumgh@rpi01.local:~/wayland-kiosk-backup.tar.gz ~/Desktop/
```

### SD-Karte Image erstellen

Nach erfolgreicher Einrichtung:
1. Pi herunterfahren: `sudo shutdown -h now`
2. SD-Karte in Mac einlegen
3. Mit Raspberry Pi Imager → "Image erstellen"
4. Image speichern für Disaster Recovery

---

## Unterschied zu X11-Setup

**Alt (X11/LXDE):**
- Desktop: LXDE/Openbox (X11)
- Autostart: ~/.config/autostart/kiosk.desktop
- Kein Screen Sharing
- Display Manager: LightDM

**Neu (Wayland/labwc):**
- Desktop: labwc (Wayland)
- Autostart: systemd user service + labwc/autostart
- ✅ Raspberry Pi Connect Screen Sharing
- Kein Display Manager (sauberer)

---

## Setup-Zeit

- **Frische Installation:** ~15 Minuten
- **Automatisches Setup:** ~2 Minuten
- **Testen:** ~2 Minuten
- **Gesamt:** ~20 Minuten

---

**Version:** 2.0 (Wayland)
**Erstellt:** Dezember 2025
**Für:** Museum Grünes Haus - 50 Jahre Museumsverein Reutte
