# ✅ Sanity Integration - Komplett Integriert!

Deine Raspberry Pi Kiosk-Verwaltung ist jetzt vollständig in Sanity integriert.

## Was wurde gemacht?

### 1. ✅ Sanity Backend Setup
- **Schema erstellt:** `kioskDevice.js` für zentrale Pi-Verwaltung
- **Backend deployed:** https://museumghbackend.sanity.studio/
- **Schema registriert:** In `schemas/index.js` integriert

### 2. ✅ Sync-Skripte erstellt
- **pi-heartbeat.sh:** Sendet Status alle 5 Minuten an Sanity
- **pi-sync-config.sh:** Zieht Config von Sanity beim Boot
- **sanity-register-device.sh:** Registriert neue Devices in Sanity

### 3. ✅ One-Click-Setup erweitert
Der `one-click-setup.sh` macht jetzt automatisch:
- Installiert Heartbeat-Skript auf Pi
- Installiert Config-Sync-Skript auf Pi
- Richtet Cron-Jobs ein (alle 5 Min + beim Boot)
- Registriert Device nach Setup in Sanity

### 4. ✅ Dokumentation erstellt
- **SANITY-INTEGRATION.md:** Komplette Anleitung
- **SANITY-TOKENS-SETUP.md:** Token-Setup Schritt-für-Schritt

## Was musst du noch tun?

### Einmalig: API-Tokens erstellen

Die Skripte brauchen API-Tokens um mit Sanity zu kommunizieren.

**Siehe:** `SANITY-TOKENS-SETUP.md` für detaillierte Anleitung

**Kurzversion:**
1. Gehe zu: https://manage.sanity.io/projects/832k5je1/settings/api
2. Erstelle **Write-Token** (Name: "Pi Heartbeat", Permissions: Writer)
3. Erstelle **Read-Token** (Name: "Pi Config Sync", Permissions: Viewer)
4. Trage Tokens ein in:
   - `sanity-register-device.sh` (Zeile 7)
   - `one-click-setup.sh` (Zeilen 374 und 434)

## Wie funktioniert es?

### Beim Pi-Setup (einmalig)

```bash
./one-click-setup.sh
```

1. Setup fragt nach Pi-Hostname (z.B. rpi01)
2. Ermittelt automatisch MAC-Adresse
3. Generiert Kiosk-ID (z.B. RPI_01)
4. Installiert Chromium Kiosk
5. Aktiviert Raspberry Pi Connect
6. **NEU:** Installiert Sanity Sync-Skripte
7. **NEU:** Richtet Cron-Jobs ein
8. **NEU:** Registriert Device in Sanity

### Nach dem Boot (automatisch)

1. **Config-Sync läuft** (nach 60 Sekunden):
   - Zieht Kiosk-URL von Sanity
   - Zieht WLAN-Netzwerke von Sanity
   - Aktualisiert lokale Config
   - Startet Chromium mit neuer URL

2. **Heartbeat läuft** (alle 5 Minuten):
   - Sendet Status an Sanity
   - Aktualisiert Online-Status
   - Sendet IP-Adresse
   - Sendet Chromium-Status
   - Sendet Uptime

### In Sanity Studio (zentrale Verwaltung)

https://museumghbackend.sanity.studio/

**Du siehst:**
- Alle Pis auf einen Blick
- Online/Offline Status (🟢/🔴)
- Letzter Heartbeat
- IP-Adressen
- Uptime

**Du kannst:**
- WLAN-Netzwerke hinzufügen/ändern
- Kiosk-URLs ändern
- Standort-Infos pflegen
- Notizen hinzufügen

## Workflow: Neuen Pi aufsetzen

**Schritt 1 - Setup:**
```bash
cd /Users/marcelgladbach/mk2025/rpi-setup
./one-click-setup.sh
```

**Schritt 2 - Device in Sanity finden:**
- Öffne: https://museumghbackend.sanity.studio/
- Gehe zu "Kiosk Devices"
- Finde das neue Device (z.B. RPI_01)
- Status: Noch offline (Heartbeat läuft erst nach erstem Boot)

**Schritt 3 - WLAN-Netzwerke hinzufügen (optional):**
- Öffne das Device
- Klick "WLAN Netzwerke" → "Add item"
- SSID: `Museum.Intern`
- Passwort: `grHaUs2018*`
- Priorität: `10`
- Beschreibung: `museum`
- Speichern

**Schritt 4 - Pi neustarten:**
```bash
ssh museumgh@rpi01.local 'sudo reboot'
```

**Schritt 5 - Warten:**
- Nach ~2 Minuten ist Pi hochgefahren
- Config-Sync zieht WLANs von Sanity
- Chromium startet im Kiosk-Modus

**Schritt 6 - Status prüfen:**
- Nach ~5 Minuten: Heartbeat sendet Status
- In Sanity: Device zeigt 🟢 Online
- IP-Adresse wird angezeigt
- Chromium Status: "läuft"

## Vorteile

### Zentrale Verwaltung
- **Ein Ort für alles:** Alle Pis in Sanity Studio
- **Kein SSH nötig:** Änderungen in Sanity, Pi zieht automatisch
- **Skalierbar:** 5, 10, 20 Pis - kein Problem

### Status-Monitoring
- **Echtzeit:** Online/Offline Status
- **History:** Wann war welcher Pi zuletzt online?
- **Chromium-Check:** Läuft der Kiosk?

### Remote Config
- **WLAN-Änderungen:** In Sanity ändern, Pi übernimmt beim Boot
- **URL-Änderungen:** Kiosk-URL zentral ändern
- **Priorisierung:** Welches WLAN hat Vorrang?

### Automation
- **Auto-Sync:** Config wird automatisch gezogen
- **Auto-Heartbeat:** Status wird automatisch gesendet
- **Auto-Register:** Neue Pis werden automatisch registriert

## Troubleshooting

### Device erscheint nicht in Sanity

**Prüfen:**
```bash
# War sanity-register-device.sh im Setup?
# Prüfe Setup-Log
```

**Manuell registrieren:**
```bash
./sanity-register-device.sh RPI_01 rpi01 abc123 "Museum Reutte"
```

### Status wird nicht aktualisiert

**Auf Pi prüfen:**
```bash
ssh museumgh@rpi01.local

# Cron-Job vorhanden?
crontab -l | grep heartbeat

# Manuell testen:
bash ~/pi-heartbeat.sh

# Log ansehen:
tail ~/heartbeat.log
```

**Erwartete Ausgabe im Log:**
```
[Wed Dec 11 14:30:01 CET 2025] Heartbeat sent for RPI_01 - Online: true
```

### Config wird nicht geladen

**Auf Pi prüfen:**
```bash
ssh museumgh@rpi01.local

# Manuell testen:
bash ~/pi-sync-config.sh

# Sollte zeigen:
# ✓ Config von Sanity geladen
# ✓ Kiosk URL aktualisiert
# ✓ WLAN Konfiguration aktualisiert
```

**Häufige Probleme:**
- Token falsch eingetragen
- jq nicht installiert: `sudo apt install jq -y`
- Device nicht in Sanity vorhanden

## Next Level: Dashboard View (Optional)

Du kannst in Sanity ein Custom Dashboard erstellen für noch bessere Übersicht.

Siehe: `SANITY-INTEGRATION.md` → "Dashboard View (Optional)"

## Zusammenfassung

**Status:**
- ✅ Sanity Backend deployed
- ✅ Schema registriert
- ✅ Sync-Skripte erstellt
- ✅ One-Click-Setup integriert
- ✅ Dokumentation komplett

**Du musst noch:**
- ⏳ API-Tokens erstellen (siehe SANITY-TOKENS-SETUP.md)
- ⏳ Tokens in Skripte eintragen

**Dann:**
- 🚀 Nächster Pi-Setup wird automatisch in Sanity integriert
- 🎯 Zentrale Verwaltung aller Pis in Sanity Studio
- 📊 Status-Monitoring in Echtzeit

## Links

- **Sanity Studio:** https://museumghbackend.sanity.studio/
- **API Token Verwaltung:** https://manage.sanity.io/projects/832k5je1/settings/api
- **Raspberry Pi Connect:** https://connect.raspberrypi.com/

---

**Ready to roll! 🎉**
