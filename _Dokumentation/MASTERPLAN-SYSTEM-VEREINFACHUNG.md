# MASTERPLAN — System-Vereinfachung Museum Grünes Haus
**Erstellt:** 2026-06-10 | **Status:** in Umsetzung
**Ziel:** Das komplette Kiosk-CMS-System extrem einfach, zuverlässig und hands-off machen.

> Diese Datei ist die einzige Quelle der Wahrheit für den Umbau.
> Bei jedem abgeschlossenen Schritt wird die Status-Tabelle unten aktualisiert.

---

## 1. Zielbild

**Zwei Eingänge, sonst nichts:**
- Das Museum kennt nur **Sanity Studio** (publizieren = live in max. 5 Min)
- Marcel kennt nur **`git push`** (+ E-Mail-Alarm, wenn etwas offline geht)
- Alles dazwischen ist Maschine.

**Drei Prinzipien:**
1. **Das Pi-Image ist dumm.** Nur OS + WLAN + Bootstrap. Alles andere holt sich der Pi selbst → das Image veraltet nie.
2. **Jeder Boot ist eine Reparatur.** Kein Unterschied erster/späterer Boot — der Pi stellt bei jedem Start seinen Sollzustand her. Selbstheilend statt fehlerfrei.
3. **Sanity ist die Fernbedienung.** Alles, was man je an einem Pi tun will, geht über das Studio — nie über SSH.

### Architektur

```
INHALTE (Museum-Team)                CODE (Marcel)
      │ publiziert                       │ git push
      ▼                                  ▼
  Sanity Studio ───webhook───→  GitHub-Repo(s)
  (deutsche UI,                          │ GitHub Action: Build
   Validierung,                   ┌──────┴──────┐
   Hilfe-Tab)                     ▼             ▼
      │                       Netlify       Release-ZIP
      │                    (Website/Mobil)  (dist + pi-setup)
      │                                         │
      └──── Pi holt beides selbstständig ───────┘
            Content alle 5 Min · Build alle 15 Min
                          │
              lokaler Cache (nginx) → Chromium
                          │
                       Besucher
```

### Ausfallkette (Soll-Zustand)

| Fällt aus | Folge für Besucher | Aufwand Marcel |
|---|---|---|
| Sanity | keine — Pis nutzen Cache, Website statisch | keiner |
| Netlify | keine im Museum (Pis lokal) | keiner |
| GitHub | keine — nur keine Updates | keiner |
| Internet im Museum | keine — alles lokal gecacht | keiner |
| Kaputter Build | keine — Pis bleiben auf letzter Version | Release löschen (= Auto-Rollback) |
| Chromium/System hängt | Sekunden | keiner (Restart=always / Watchdog) |
| Pi-Hardware | ein Kiosk dunkel + E-Mail | SD-Karte flashen, einstecken |
| Redaktionsfehler | Schema-Validierung fängt das meiste | Backup existiert |

### Was rausfliegt (Komplexität ↓)

- MQTT-Broker (`mqtt-broker-setup.sh`) → ersetzt durch Befehlsfeld in Sanity
- Setup-TUI (`raspberry-pi/setup-tool/setup_tool.py`, 743 Zeilen) → ersetzt durch Golden Image
- Interaktives `setup.sh` → ersetzt durch Bootstrap + Selbst-Registrierung
- Repo-im-Repo + Code in Google Drive → Monorepo außerhalb von Drive
- Doppelte GROQ-Pflege (frontend/`sanity.js` + `sync-content.sh`) → eine Quelldatei
- SSH als Alltagswerkzeug → stirbt aus

---

## 2. Die Schritte im Detail

### Schritt 1 — Pi-Skripte ins Release-ZIP + Selbst-Update  ⬅ FUNDAMENT

**Problem:** `sync-build.sh` aktualisiert nur das Frontend-Build. Bugfixes an den
Pi-Skripten (sync-content.sh, heartbeat.sh, chromium-kiosk.service — z.B. das neue
`--kiosk-printing` Flag!) erfordern SSH auf jeden Pi.

**Änderungen:**
1. `.github/workflows/netlify-deploy.yml`: `pi-setup/` mit ins ZIP kopieren
   (`cp -r pi-setup dist/pi-setup` vor dem Zippen)
2. `pi-setup/sync-build.sh`:
   - Nach dem Entpacken: Skripte aus `stage/pi-setup/` nach `/usr/local/bin/`
     installieren, wenn geändert (cmp-Vergleich): `sync-content.sh`,
     `sync-videos.sh`, `heartbeat.sh`
   - `chromium-kiosk.service` → `~museumgh/.config/systemd/user/` + daemon-reload
   - `sync-build.sh` selbst zuletzt via `mv` ersetzen (atomar, laufendes Skript
     behält alten Inode → sicher; neue Version greift beim nächsten Lauf)
   - `rsync --exclude='/pi-setup/'` damit Skripte nicht ins Web-Root gelangen
3. **Einmalig manuell (letztes SSH auf RPI_01):** das neue `sync-build.sh`
   einspielen, denn das alte kennt die Selbst-Update-Logik noch nicht
   (Henne-Ei). Danach nie wieder.

**Ergebnis:** `git push` erreicht jeden Pi vollständig — Web-Build UND Systemskripte.

### Schritt 2 — Befehlsfeld + Selbst-Registrierung (Sanity)

**Schema `kioskDevice`:**
- Neues Feld `befehl` (string, Liste): `neustarten` | `chromium-neustarten` |
  `update-erzwingen` | leer. Studio-UI: Dropdown im Tab „Gerät".
- Neuer Status-Wert: Gerät „neu / nicht zugewiesen" (Pi legt Dokument selbst an).

**Pi-Seite (`sync-content.sh` erweitern):**
- Befehl lesen → ausführen → Feld zurücksetzen (Patch via vorhandenem Write-Token)
- Selbst-Registrierung: existiert kein `kioskDevice` mit der eigenen ID
  (abgeleitet aus `/proc/cpuinfo` Serial, z.B. `PI-A3F2`), legt der Pi das
  Dokument an: `{kioskId, status.online, "neu": true}` → erscheint im Studio.

**Ergebnis:** Pi vom Schreibtisch/Handy neustarten. Neue Pis tauchen von selbst auf.

### Schritt 3 — Pi-Härtung + Golden Image

**Härtung (via setup.sh/Bootstrap, verteilt sich über Schritt 1 selbst):**
- Hardware-Watchdog aktivieren (`dtparam=watchdog=on` + systemd `RuntimeWatchdogSec`)
- Nacht-Reboot täglich 3:00 (cron) — Kiosk-Hygiene
- Logs ins RAM (log2ram oder journald `Storage=volatile` + tmpfs für /var/log)
- Kein Swap, Endurance-SD-Karten (Hardware-Empfehlung)
- BEWUSST NICHT: Read-only-FS, OS-Auto-Updates (Komplexität > Nutzen,
  Wiederherstellung per Neu-Flashen ist trivial)

**Bootstrap-Service (`museum-bootstrap.service`, läuft bei JEDEM Boot):**
1. Warten auf Netz
2. Neuestes Release-ZIP prüfen/holen (= sync-build.sh)
3. Selbst-Registrierung sicherstellen
4. Content-Sync
5. Chromium starten

**Golden Image erzeugen:**
1. Einen Pi frisch aufsetzen (nur: Raspberry Pi OS + WLAN-Profil Museum +
   Bootstrap-Service + Write-Token)
2. SD-Karte klonen + PiShrink → `museum-kiosk.img`
3. Ablage: Projektordner + Kopie auf GitHub Release (Repo `museum-astro-frontend`)

**Neuer-Pi-Workflow danach:** Flashen (10 Min) → einstecken → im Studio zuweisen. Fertig.

### Fernwartung / Remote Desktop (gehört zu Schritt 3) — UMGESETZT 2026-06-10

**Stack: Tailscale (VPN) + wayvnc (Wayland-VNC für labwc).**
- Tailscale: jeder Pi tritt per Pre-Auth-Key automatisch dem privaten Netz bei
  (`/etc/museum-kiosk/tailscale-authkey`). Erreichbar von überall, NAT egal,
  kostenlos bis 100 Geräte. `--ssh` aktiviert: SSH läuft auch übers VPN.
- wayvnc: bindet NUR an die Tailscale-IP (Port 5900) — im Museums-LAN
  unsichtbar, Verschlüsselung macht das VPN. Ohne Tailscale: harmloser Leerlauf.
- Zugriff vom Mac: Finder → Cmd+K → `vnc://<gerätename>:5900`
- Einmalig nötig: Tailscale-Account anlegen, Pre-Auth-Key generieren
  (reusable, tagged → läuft nicht ab), auf Geräte/ins Image legen.

### WLAN-Strategie (gehört zu Schritt 3)

Drei Ebenen — niemand fasst je einen Pi an, um WLAN zu ändern:

1. **Beim Flashen:** Museums-WLAN wird im **Raspberry Pi Imager** hinterlegt
   (Imager speichert Einstellungen dauerhaft; funktioniert auch mit Custom-Image,
   da Raspberry-Pi-OS-Basis). Image selbst bleibt credential-frei →
   Passwortwechsel = einmal im Imager ändern, kein Image-Neubau; verlorene
   SD-Karte enthält keine Zugangsdaten.
2. **Im Betrieb (existiert schon):** `kioskDevice → wlanNetworks` in Sanity,
   `sync-content.sh` spielt Netze alle 5 Min per nmcli ein (mit Prioritäten).
   Mehrere Standorte zentral verwaltbar (Museum, Büro, Zunftmuseum).
   **Passwortwechsel-Prozedur (Reihenfolge entscheidend!):**
   ① Neues WLAN in Sanity eintragen → ② 5 Min warten → ③ Router umstellen
   → Pis wechseln von selbst.
3. **Notnagel:** Ethernet-Kabel — null Konfiguration, funktioniert immer.
   Ein Patchkabel beim Router im Museum deponieren.

### Schritt 4 — Offline-Alarm + Sanity-Backup (2 kleine GitHub Actions)

**Offline-Alarm** (mk2025: `.github/workflows/kiosk-monitor.yml`) — ✅ live validiert:
- Schedule alle 15 Min: GROQ `*[_type=="kioskDevice" && defined(status.lastSeen) &&
  neu != true && dateTime(status.lastSeen) < dateTime(now()) - 900]`
- Bei Treffern: GitHub-Issue mit Label `kiosk-offline` (= E-Mail via Watch-Einstellung,
  keine SMTP-Secrets nötig). Anti-Spam: max. 1 offenes Issue; schließt sich automatisch,
  sobald alle Geräte wieder Heartbeats senden. Testlauf erzeugte Issue #1 korrekt.

**Backup** (privates Repo `museumgrueneshaus/museum-backups`,
`.github/workflows/sanity-backup.yml`) — ✅ live validiert (115 Dokumente, 72 KB):
- Wöchentlich Mo 02:00 UTC: HTTP-Export-Endpoint per curl
  (`/v2024-01-01/data/export/production`, Bearer-Token als Secret `SANITY_AUTH_TOKEN`)
  → gzip → Artifact (90 Tage). Plausibilitätscheck: Export muss >10 Zeilen haben.
- Hinweis: Sanity-CLI-Variante (`sanity dataset export --project --dataset`) funktioniert
  NICHT in CI ohne Projektkontext — deshalb HTTP-Endpoint.
- Restore: `gunzip` + `npx sanity dataset import backup.ndjson production --missing`

### Schritt 5 — Repo-Konsolidierung (größter Brocken, bewusst spät)

**Problem heute:** Frontend-Repo verschachtelt im CMS-Ordner, beides in Google
Drive synchronisiert (`.git` in Drive = Korruptionsrisiko). Zwei Repos, zwei
GitHub-Konten (museumgrueneshaus / marcelgladbacharchitektur).

**Soll:** Ein Monorepo `museum-kiosk` (Account museumgrueneshaus):
```
museum-kiosk/
├── sanity/        Studio + Schemas
├── frontend/      Astro
├── pi/            Setup, Skripte, Image-Doku
├── docs/          Dokumentation
└── .github/       Build, Monitor, Backup
```
- **Arbeitskopie raus aus Google Drive** (z.B. ~/Projekte/museum-kiosk);
  nach Drive wandern nur exportierte PDFs/Doku
- Netlify auf neues Repo umstellen, Sanity-Webhook umziehen
- Pi-seitig nur die GITHUB_API-URL in sync-build.sh ändern (verteilt sich
  dank Schritt 1 von selbst — Reihenfolge beachten: erst altes Repo
  released die URL-Änderung, dann umziehen)

### Schritt 6 — Datenmodell vereinheitlichen + Geräte-Übersicht

**„Ein Gerät zeigt genau ein Ding":** kioskDevice bekommt EIN Auswahlfeld statt
zwei Denkwegen (Ausstellung-Template vs. Malspiel-Direktmodus). Optionen:
Ausstellung (mit Modus) / Malspiel / Signage / Website. Migration der
bestehenden Geräte-Dokumente nötig (wenige Stück, per Mutations-API).

**Geräte-Übersicht im Studio:** Custom-Komponente/Strukturansicht — alle Kioske
mit grün/rot + „zuletzt gesehen" + zugewiesenem Inhalt. Museum sieht selbst
„Kiosk OG offline → Steckdose prüfen".

---

## 3. Status

| # | Schritt | Status | Datum |
|---|---|---|---|
| 1 | Pi-Skripte ins ZIP + Selbst-Update | ✅ erledigt (Commit 41e4c4b, Release baut automatisch) | 2026-06-10 |
| 2 | Befehlsfeld + Selbst-Registrierung | ✅ erledigt (Schema deployed, Pi-Skript Commit 4619cfb) | 2026-06-10 |
| 3 | Pi-Härtung + Golden Image | 🔶 Software fertig (Commit 96f42fa: Tailscale+wayvnc Remote Desktop, Watchdog, Nacht-Reboot, journald→RAM, setup.sh non-interaktiv/idempotent) — Image-Erstellung offen | 2026-06-10 |
| 4 | Offline-Alarm + Backup | ✅ erledigt (Monitor: mk2025 kiosk-monitor.yml, 15-Min-Takt, Issue=E-Mail; Backup: privates Repo museum-backups, wöchentlich Mo 02:00) | 2026-06-10 |
| 5 | Repo-Konsolidierung (Monorepo, raus aus Drive) | ⬜ offen | |
| 6 | Datenmodell + Geräte-Übersicht | ✅ erledigt (modus: ausstellung/malspiel/signage/website am Gerät, websiteUrl-Feld, kioskUrl entfernt; Geräte-Dashboard im Studio mit grün/rot + Auto-Refresh; Router + sync-content.sh angepasst, live gegen beide Geräte validiert — Altbestand mit modus=null fällt aufs Ausstellungs-Template zurück, keine Migration nötig. WLAN-Passwort-Entscheidung noch offen, siehe unten) | 2026-06-10 |

**⚠ Offenes Sicherheitsthema (entdeckt 2026-06-10):**
Das Sanity-Dataset ist öffentlich lesbar (nötig fürs Frontend) — damit sind auch
die **WLAN-Passwörter** in `kioskDevice.wlanNetworks` über die Query-API abrufbar.
**✅ Gelöst 2026-06-11 mit Option (b):** Das `wlanNetworks`-Feld war leer
(nie Passwörter öffentlich) und wurde aus Schema + sync-content.sh entfernt.
Fixe WLANs (3 Netze) leben jetzt auf den Geräten in
`/etc/museum-kiosk/wlans.conf` (Tab-getrennt: SSID, Passwort, Priorität) —
setup.sh spielt sie idempotent per nmcli ein. Die Datei kommt per scp bzw.
ins Golden Image, Master liegt lokal bei Marcel (`~/.museum-kiosk/wlans.conf`),
nie im Repo. Passwortwechsel remote: via Tailscale-SSH neue wlans.conf
einspielen + `sudo bash setup.sh`, solange das Gerät noch online ist.

**Offene Einmal-Aktionen:**
- [x] ~~GitHub Watch auf mk2025~~ — per API aktiviert (2026-06-10), Offline-Issues kommen als E-Mail
- [ ] Letztes SSH auf RPI_01: neues `sync-build.sh` manuell einspielen (Henne-Ei, Schritt 1)
      — dabei gleich: Tailscale-Authkey ablegen + `sudo bash setup.sh` erneut laufen
      lassen (idempotent → installiert Tailscale, wayvnc, Watchdog, Nacht-Reboot)
- [x] ~~Tailscale-Account + Pre-Auth-Key~~ — erledigt 2026-06-11, Key liegt in
      `~/.museum-kiosk/tailscale-authkey` (reusable, tag:kiosk, gültig bis ~Sep 2026).
      Komplette Besuchs-Anleitung: `~/.museum-kiosk/RPI01-BESUCH.md`
- [ ] Drucker an der Kassa als CUPS-Standarddrucker auf RPI einrichten (Malspiel-Druck)

---

## 4. Referenzen

- Bestehende Doku: [README.md](README.md), [SYSTEM-ARCHITEKTUR.md](SYSTEM-ARCHITEKTUR.md)
- Pi-Setup: `frontend/pi-setup/`
- Repos: `museumgrueneshaus/museum-astro-frontend` (Frontend), `museumgrueneshaus/mk2025` (CMS)
- Sanity: Projekt `832k5je1`, Dataset `production`, Studio https://museumghbackend.sanity.studio
- Push-Befehl Frontend (Dual-Account):
  `git push https://museumgrueneshaus:$(gh auth token --user museumgrueneshaus)@github.com/museumgrueneshaus/museum-astro-frontend.git main`
  danach `gh auth switch --user marcelgladbacharchitektur`
