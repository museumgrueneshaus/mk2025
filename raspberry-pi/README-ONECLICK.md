# One-Click Raspberry Pi Kiosk Setup

Automatisches Setup für Raspberry Pi Wayland Kiosk mit Screen Sharing - **alles vom Mac aus!**

## Schnellstart (2 Schritte!)

### Schritt 1: SD-Karte vorbereiten (10 Minuten)

1. **Raspberry Pi Imager** starten
2. **OS wählen:** Raspberry Pi OS (64-bit) with Desktop
3. **Einstellungen** (Zahnrad):
   ```
   Hostname: rpi01
   Username: museumgh
   Password: gh2025#
   WLAN: [Dein WLAN + Passwort]
   Land: AT
   Zeitzone: Europe/Vienna
   SSH: Aktivieren
   ```
4. **Write** → Warten → SD-Karte in Pi einlegen → Pi starten

### Schritt 2: One-Click Setup (5 Minuten)

Warte 2 Minuten bis Pi gebootet hat, dann:

```bash
cd /Users/marcelgladbach/mk2025/rpi-setup
chmod +x one-click-setup.sh
./one-click-setup.sh
```

Das war's! 🎉

Das Skript macht automatisch:
- ✅ Prüft ob Pi erreichbar ist (SSH)
- ✅ Installiert alle Pakete (chromium, unclutter, jq)
- ✅ Konfiguriert Raspberry Pi Connect
- ✅ Aktiviert Desktop Autologin (LightDM → Wayland + labwc)
- ✅ Konfiguriert Chromium Kiosk Autostart (Desktop Autostart)
- ✅ Deaktiviert Screen Blanking
- ✅ Installiert Sanity Heartbeat & Config Sync
- ✅ Registriert Device in Sanity Backend

## Nach dem Setup

Reboot den Pi:
```bash
ssh museumgh@rpi01.local 'sudo reboot'
```

Warte 2 Minuten, dann teste Screen Sharing:
1. Geh zu https://connect.raspberrypi.com/
2. Klicke auf "rpi01"
3. Klicke "Screen Sharing"
4. Du siehst den Chromium Kiosk! 🎬

## Optionen

### Andere Kiosk-URL verwenden

```bash
./one-click-setup.sh rpi01.local https://example.com/deine-seite
```

### Anderen Pi konfigurieren

```bash
./one-click-setup.sh rpi02.local
```

### Über IP-Adresse verbinden

```bash
./one-click-setup.sh 192.168.1.100
```

## URL später ändern

### Option 1: In Sanity Studio (empfohlen)
1. Öffne: https://museumghbackend.sanity.studio/
2. Gehe zu "Kiosk Devices"
3. Öffne dein Device (z.B. RPI_01)
4. Ändere "Kiosk URL"
5. Speichern & Pi neustarten

### Option 2: Direkt auf Pi
```bash
ssh museumgh@rpi01.local
nano ~/.config/autostart/kiosk.desktop
# URL in Exec-Zeile ändern, speichern (Ctrl+O, Ctrl+X)
sudo reboot
```

## Troubleshooting

### "Cannot reach Pi"

- Prüfe ob Pi im gleichen Netzwerk ist
- Prüfe Hostname: `ping rpi01.local`
- Versuche IP-Adresse statt Hostname

### "Connection refused"

- SSH vielleicht noch nicht bereit
- Warte 1-2 Minuten länger nach dem ersten Boot
- Prüfe ob SSH im Imager aktiviert wurde

### Setup schlägt fehl

- Prüfe Internetverbindung am Pi
- Versuche nochmal: `./one-click-setup.sh`
- Das Skript ist idempotent (kann mehrfach laufen)

## Was wird installiert?

**Software:**
- **chromium** - Browser für Kiosk-Modus
- **unclutter** - Versteckt Mauszeiger bei Inaktivität
- **jq** - JSON Parser für Sanity API
- **rpi-connect** - Raspberry Pi Connect Service (Screen Sharing)

**System-Konfiguration:**
- **Desktop Autologin** - LightDM startet automatisch als museumgh
- **Wayland + labwc** - Kommt bereits mit Bookworm (nichts extra zu installieren)
- **Chromium Autostart** - Desktop Autostart File (.config/autostart/)
- **Sanity Sync** - Heartbeat & Config Sync Skripte + Cron-Jobs

## Unterschied zu manueller Installation

**Manuell:**
- 20+ Befehle
- Mehrere SSH Sessions
- Configs händisch erstellen
- Fehleranfällig
- ~30 Minuten

**One-Click:**
- 1 Befehl
- Alles automatisch
- Getestet und zuverlässig
- ~5 Minuten

## Für mehrere Pis

Das Skript funktioniert perfekt für mehrere Pis:

```bash
# Pi 1
./one-click-setup.sh rpi01.local

# Pi 2 (andere Kiosk-ID)
sed -i '' 's|RPI_01|RPI_02|g' one-click-setup.sh
./one-click-setup.sh rpi02.local

# Oder direkt mit URL override
./one-click-setup.sh rpi02.local https://museumgh.netlify.app/kiosk/RPI_02/video
```

## Backup & Recovery

Nach erfolgreichem Setup:

1. **Config sichern:**
   ```bash
   ssh museumgh@rpi01.local 'tar -czf ~/backup.tar.gz ~/.config/autostart/ ~/pi-*.sh'
   scp museumgh@rpi01.local:~/backup.tar.gz ~/Desktop/rpi01-backup.tar.gz
   ```

2. **SD-Karte Image:**
   - Pi herunterfahren
   - SD-Karte in Mac
   - Raspberry Pi Imager → "Image erstellen"
   - Speichern für später

3. **Sanity Backup:**
   - Devices werden in Sanity gespeichert
   - Export über Sanity Studio möglich

## Updates

```bash
# System-Updates
ssh museumgh@rpi01.local 'sudo apt update && sudo apt upgrade -y && sudo reboot'

# Kiosk neu aufsetzen
./one-click-setup.sh  # Kann jederzeit neu laufen
```

## Dateien

- `one-click-setup.sh` - Hauptskript (vom Mac ausführen)
- `WAYLAND-KIOSK-SETUP.md` - Detaillierte Dokumentation
- `convert-for-pi.sh` - Video-Konvertierung für Pi

---

**Setup-Zeit gesamt: ~15 Minuten**
- SD-Karte vorbereiten: ~10 Min.
- One-Click Setup: ~5 Min.
- Testen: ~2 Min.

**Version:** 2.0 (One-Click)
**Erstellt:** Dezember 2025
