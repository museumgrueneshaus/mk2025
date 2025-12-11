# Sanity API Tokens Setup

Die Sanity-Integration ist jetzt aktiv, aber du musst noch API-Tokens erstellen.

## Warum?

Die Skripte auf dem Pi brauchen Tokens um:
- **Heartbeat**: Status an Sanity senden (Write-Token)
- **Config Sync**: Konfiguration von Sanity lesen (Read-Token)

## Setup (5 Minuten)

### 1. Tokens erstellen

Gehe zu: https://manage.sanity.io/projects/832k5je1/settings/api

**Write-Token erstellen:**
1. Klick "Add API token"
2. Name: `Pi Heartbeat`
3. Permissions: `Writer`
4. Klick "Add token"
5. **Kopiere den Token** → z.B. `skAbCd123...`

**Read-Token erstellen:**
1. Klick "Add API token"
2. Name: `Pi Config Sync`
3. Permissions: `Viewer`
4. Klick "Add token"
5. **Kopiere den Token** → z.B. `skXyZ789...`

### 2. Tokens in Skripte eintragen

Die Tokens müssen in mehreren Dateien eingetragen werden:

#### A) In sanity-register-device.sh

```bash
nano sanity-register-device.sh
```

Ändere Zeile 7:
```bash
SANITY_TOKEN="skAbCd123..."  # Dein Write-Token hier
```

Speichern: `Ctrl+O`, Enter, `Ctrl+X`

#### B) In one-click-setup.sh

Die Tokens werden während des Setups automatisch auf den Pi kopiert.
Du musst sie in `one-click-setup.sh` eintragen:

```bash
nano one-click-setup.sh
```

**Suche Zeile 374** (Heartbeat Script):
```bash
SANITY_TOKEN="YOUR_SANITY_TOKEN_HERE"  # Muss ein Write-Token sein!
```
Ersetze mit:
```bash
SANITY_TOKEN="skAbCd123..."  # Dein Write-Token
```

**Suche Zeile 434** (Sync Script):
```bash
SANITY_TOKEN="YOUR_SANITY_TOKEN_HERE"  # Read-Token reicht
```
Ersetze mit:
```bash
SANITY_TOKEN="skXyZ789..."  # Dein Read-Token
```

Speichern: `Ctrl+O`, Enter, `Ctrl+X`

### 3. Bestehende Pis aktualisieren (falls vorhanden)

Wenn du bereits Pis aufgesetzt hast:

```bash
# Tokens in lokalen Skripten aktualisieren
nano pi-heartbeat.sh    # Write-Token eintragen
nano pi-sync-config.sh  # Read-Token eintragen

# Skripte zu allen Pis kopieren
scp pi-heartbeat.sh museumgh@rpi01.local:~/
scp pi-sync-config.sh museumgh@rpi01.local:~/

# Auf Pi ausführbar machen
ssh museumgh@rpi01.local 'chmod +x ~/pi-heartbeat.sh ~/pi-sync-config.sh'
```

## Testen

Nach dem nächsten Setup eines Pis:

1. **In Sanity Studio schauen:**
   - https://museumghbackend.sanity.studio/
   - Öffne "Kiosk Devices"
   - Du solltest das neue Device sehen

2. **Nach 5 Minuten:**
   - Status sollte auf "Online" wechseln
   - IP-Adresse sollte angezeigt werden
   - Chromium Status sollte "läuft" sein

## Fertig!

Ab jetzt:
- Jeder neue Pi wird automatisch in Sanity registriert
- Status wird alle 5 Minuten aktualisiert
- Config kann zentral in Sanity geändert werden
- Pis ziehen Config beim Boot

## Sanity Studio URL

Backend: https://museumghbackend.sanity.studio/

## Probleme?

### Tokens funktionieren nicht

```bash
# Teste Token manuell:
curl -H "Authorization: Bearer skAbCd123..." \
  "https://832k5je1.api.sanity.io/v2021-06-07/data/query/production?query=*%5B_type%20%3D%3D%20%22kioskDevice%22%5D"
```

Sollte JSON zurückgeben. Falls `401 Unauthorized`: Token falsch oder abgelaufen.

### Device erscheint nicht in Sanity

- Prüfe ob `sanity-register-device.sh` ausgeführt wurde
- Manuell registrieren: `./sanity-register-device.sh RPI_01 rpi01 abc123 "Museum Reutte"`

### Status wird nicht aktualisiert

```bash
# Auf Pi prüfen:
ssh museumgh@rpi01.local

# Cron-Job vorhanden?
crontab -l | grep heartbeat

# Manuell testen:
bash ~/pi-heartbeat.sh

# Log ansehen:
tail ~/heartbeat.log
```
