# Sanity Integration für Pi-Verwaltung

Zentrale Verwaltung aller Raspberry Pis über Sanity Backend.

## Vorteile

✅ **Zentrale Verwaltung** - Alle Pis in Sanity Studio sehen
✅ **Status Monitoring** - Online/Offline Status in Echtzeit
✅ **Remote Config** - WLAN, URLs von Sanity aus ändern
✅ **Automatic Sync** - Pis ziehen Config automatisch
✅ **History** - Wann wurde welcher Pi zuletzt gesehen?

---

## Setup (Einmalig)

### 1. ✅ Sanity Schema hinzufügen - ERLEDIGT!

Das kioskDevice Schema wurde bereits hinzugefügt und deployed:
- Schema: `museum-sanity-backend/schemas/kioskDevice.js`
- Backend deployed: https://museumghbackend.sanity.studio/

**Status:** ✅ Komplett

### 2. Sanity Token erstellen

1. Gehe zu: https://manage.sanity.io/projects/832k5je1/settings/api
2. **Erstelle Write-Token:**
   - Name: `Pi Heartbeat`
   - Permissions: `Writer`
   - Kopiere Token → `<WRITE_TOKEN>`
3. **Erstelle Read-Token:**
   - Name: `Pi Config Sync`
   - Permissions: `Reader`
   - Kopiere Token → `<READ_TOKEN>`

### 3. Tokens in Skripte eintragen

Editiere die Skripte und ersetze `YOUR_SANITY_TOKEN_HERE`:

```bash
nano pi-heartbeat.sh
# Setze: SANITY_TOKEN="<WRITE_TOKEN>"

nano pi-sync-config.sh
# Setze: SANITY_TOKEN="<READ_TOKEN>"

nano sanity-register-device.sh
# Setze: SANITY_TOKEN="<WRITE_TOKEN>"
```

---

## Workflow

### Neuen Pi aufsetzen

**1. Setup starten:**
```bash
./one-click-setup.sh
```

Das Skript macht automatisch:
- ✅ Pi konfigurieren
- ✅ Chromium Kiosk installieren
- ✅ Raspberry Pi Connect aktivieren
- ✅ Sanity Heartbeat & Sync installieren
- ✅ Device in Sanity registrieren

**2. In Sanity Studio (optional):**
- https://museumghbackend.sanity.studio/
- Öffne "Kiosk Devices"
- Finde das neue Device (z.B. RPI_01)
- Füge WLAN-Netzwerke hinzu:
  ```
  SSID: Museum.Intern
  Passwort: grHaUs2018*
  Priorität: 10
  Beschreibung: museum
  ```
- Passe Kiosk-URL an (falls nötig)
- Speichern

**3. Pi neustarten:**
```bash
ssh museumgh@rpi01.local 'sudo reboot'
```

**Fertig!** Nach Boot:
- Config wird automatisch von Sanity gezogen
- Status wird alle 5 Minuten gesendet
- Device erscheint in Sanity Studio als "Online"

---

## In Sanity Studio nutzen

### Pi-Übersicht

Alle Pis auf einen Blick:
- 🟢 **Online** - Chromium läuft
- 🔴 **Offline** - Seit wann offline?
- IP-Adresse
- Uptime
- Letzter Heartbeat

### Config ändern

**WLAN hinzufügen:**
1. Device öffnen
2. "WLAN Netzwerke" → "Add item"
3. SSID, Passwort, Priorität eingeben
4. Speichern
5. Pi syncen: `ssh museumgh@rpi01.local 'bash ~/pi-sync-config.sh'`
6. Oder warten bis nächster Boot

**Kiosk-URL ändern:**
1. Device öffnen
2. "Kiosk URL" ändern
3. Speichern
4. Pi syncen (wie oben)
5. Chromium neu starten: `ssh museumgh@rpi01.local 'pkill chromium'`

---

## ✅ Automatische Integration ins Setup - ERLEDIGT!

Sanity ist bereits vollständig in `one-click-setup.sh` integriert:

**Was automatisch passiert beim Setup:**
1. ✅ Heartbeat-Skript wird auf Pi installiert
2. ✅ Config-Sync-Skript wird auf Pi installiert
3. ✅ Cron-Jobs werden eingerichtet (Heartbeat alle 5 Min, Sync beim Boot)
4. ✅ Device wird nach Setup in Sanity registriert

**Du musst nur noch:**
- API-Tokens erstellen (siehe SANITY-TOKENS-SETUP.md)
- Tokens in die Skripte eintragen

---

## Dashboard View (Optional)

Erstelle Custom View in Sanity Studio:

```javascript
// sanity.config.js
import {defineConfig} from 'sanity'
import {structure} from 'sanity/structure'

export default defineConfig({
  // ...
  plugins: [
    structure((S) =>
      S.list()
        .title('Content')
        .items([
          // Kiosk Dashboard als erstes
          S.listItem()
            .title('🎯 Kiosk Dashboard')
            .child(
              S.documentTypeList('kioskDevice')
                .title('Alle Kiosk Devices')
                .defaultOrdering([{field: 'status.online', direction: 'desc'}])
            ),
          // ... rest
        ])
    )
  ]
})
```

---

## Troubleshooting

### Heartbeat funktioniert nicht

```bash
# Auf Pi prüfen:
ssh museumgh@rpi01.local

# Log ansehen
tail -f ~/heartbeat.log

# Manuell testen
bash ~/pi-heartbeat.sh

# Token prüfen
grep SANITY_TOKEN ~/pi-heartbeat.sh
```

### Config wird nicht geladen

```bash
# Manuell syncen
bash ~/pi-sync-config.sh

# jq installiert?
which jq || sudo apt install jq -y

# Token prüfen
grep SANITY_TOKEN ~/pi-sync-config.sh
```

### Device nicht in Sanity

```bash
# Manuell registrieren
./sanity-register-device.sh RPI_01 rpi01 f6d351 "Museum Reutte"

# Oder in Sanity Studio manuell anlegen
```

---

## Vorteile des Systems

1. **Ein Ort für alles** - Sanity ist deine zentrale Verwaltung
2. **Kein SSH nötig** - Änderungen in Sanity, Pi zieht automatisch
3. **Status-Monitoring** - Siehst sofort wenn Pi offline ist
4. **History** - Wann war welcher Pi zuletzt online?
5. **Skalierbar** - 10, 20, 100 Pis - kein Problem!

---

**Ready!** Ab jetzt verwaltest du alle Pis zentral über Sanity! 🎉
