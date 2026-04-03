# Sanity API Tokens Setup

## Übersicht

Die Raspberry Pi Kiosk-Systeme benötigen API-Tokens, um mit Sanity zu kommunizieren:

- **Write Token**: Für Heartbeat (Status-Updates an Sanity senden)
- **Read Token**: Für Config Sync (Konfiguration von Sanity abrufen)

## Setup-Anleitung

### 1. Tokens in Sanity erstellen

Gehe zu: https://manage.sanity.io/projects/832k5je1/settings/api

**Write Token erstellen:**
- Name: "Pi Heartbeat"
- Permissions: Create, Update
- Kopiere den Token

**Read Token erstellen:**
- Name: "Pi Config Sync"
- Permissions: Read only
- Kopiere den Token

### 2. `.env` Datei erstellen

Im `rpi-setup/` Verzeichnis:

```bash
cp .env.example .env
```

Öffne `.env` und füge die Tokens ein:

```bash
SANITY_WRITE_TOKEN=dein_write_token_hier
SANITY_READ_TOKEN=dein_read_token_hier
SANITY_PROJECT_ID=832k5je1
SANITY_DATASET=production
```

### 3. Setup ausführen

Das Setup-Script lädt automatisch die .env Datei und überträgt die Tokens auf den Pi:

```bash
./one-click-setup.sh rpi01.local
```

## Wie es funktioniert

### Auf dem Mac (Setup-Script)
- `one-click-setup.sh` lädt `.env` aus dem `rpi-setup/` Verzeichnis
- Erstellt `~/.pi-kiosk.env` auf dem Pi mit den Tokens
- `sanity-register-device.sh` lädt `.env` für Device-Registrierung

### Auf dem Pi (Laufzeit)
- `~/pi-heartbeat.sh` lädt `~/.pi-kiosk.env` und sendet Status alle 5 Min
- `~/pi-sync-config.sh` lädt `~/.pi-kiosk.env` und holt Config beim Boot

## Sicherheit

✅ **Committet zu Git:**
- `.env.example` (Template ohne Secrets)
- Alle Scripts (lesen Tokens aus .env)
- Diese Dokumentation

❌ **NICHT committet zu Git:**
- `.env` (enthält echte Tokens, ist in .gitignore)
- `~/.pi-kiosk.env` auf den Pis (lokal auf jedem Gerät)

## Token-Rotation

Wenn du die Tokens ändern musst:

1. Erstelle neue Tokens in Sanity
2. Update `.env` auf deinem Mac
3. Führe Setup erneut aus auf allen Pis:
   ```bash
   ./one-click-setup.sh rpi01.local
   ./one-click-setup.sh rpi02.local
   # ...
   ```

Oder SSH auf jeden Pi und editiere `~/.pi-kiosk.env` manuell:
```bash
ssh museumgh@rpi01.local
nano ~/.pi-kiosk.env
# Tokens ändern, speichern, exit
```
