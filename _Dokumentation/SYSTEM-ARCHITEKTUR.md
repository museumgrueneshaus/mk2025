# System-Architektur
## Museum Grünes Haus – Digitales Kiosk-System

**Stand:** April 2026 | **Zielgruppe:** Entwickler, IT-Administration

---

## Überblick

```
┌─────────────────────────────────────────────────────────────┐
│                      CLOUD / INTERNET                       │
│                                                             │
│  ┌──────────────────┐       ┌──────────────────────────┐   │
│  │   Sanity CMS     │       │   GitHub                 │   │
│  │  (832k5je1)      │       │  museumgrueneshaus/      │   │
│  │                  │       │  museum-astro-frontend   │   │
│  │  • Ausstellungen │       │                          │   │
│  │  • Exponate      │       │  GitHub Actions:         │   │
│  │  • Kategorien    │       │  push → build → Release  │   │
│  │  • Kiosk-Geräte  │       │  (museum-kiosk-build.zip)│   │
│  │                  │       │                          │   │
│  │  GROQ API        │       │  Netlify:                │   │
│  │  (read-only      │       │  Auto-Deploy (Website)   │   │
│  │   für Kiosk)     │       │                          │   │
│  └────────┬─────────┘       └────────────┬─────────────┘   │
│           │                              │                  │
└───────────┼──────────────────────────────┼──────────────────┘
            │ HTTPS (alle 5 Min.)          │ HTTPS (bei Update)
            │                              │
┌───────────▼──────────────────────────────▼──────────────────┐
│                    RASPBERRY PI (pro Gerät)                 │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Systemdienste (systemd)                            │   │
│  │                                                     │   │
│  │  museum-sync.service    museum-sync.timer           │   │
│  │  └─ sync-build.sh       └─ alle 30 Minuten          │   │
│  │     └─ GitHub Release prüfen                        │   │
│  │     └─ ZIP herunterladen + deployen                 │   │
│  │     └─ chromium-kiosk.service neu starten           │   │
│  │                                                     │   │
│  │  sync-content cron      (alle 5 Minuten)            │   │
│  │  └─ sync-content.sh                                 │   │
│  │     └─ Sanity GROQ API abfragen                     │   │
│  │     └─ /var/www/museum/kiosk-content.json speichern │   │
│  │                                                     │   │
│  │  heartbeat cron         (jede Minute)               │   │
│  │  └─ heartbeat.sh                                    │   │
│  │     └─ Status an Sanity melden (IP, Uptime, etc.)   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  nginx (Port 80, localhost)                         │   │
│  │  └─ /var/www/museum/        Astro Build             │   │
│  │  └─ /var/www/museum/videos/ Lokale Videos           │   │
│  │  └─ /kiosk-config.json      Kiosk-ID                │   │
│  │  └─ /kiosk-content.json     Sanity-Daten (gecacht)  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  chromium-kiosk.service (User-Service: museumgh)    │   │
│  │  └─ Wayland / labwc                                 │   │
│  │  └─ Chromium im Kiosk-Modus                         │   │
│  │     └─ http://localhost/kiosk/                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Dateisystem:                                               │
│  /etc/museum-kiosk/kiosk-id.json    Geräte-ID + Kiosk-ID   │
│  /etc/museum-kiosk/current-version  Aktuelle Build-Version  │
│  /var/www/museum/                   Astro Frontend Build    │
│  /var/www/museum/kiosk-content.json Sanity-Daten (gecacht)  │
│  /var/www/museum/videos/            Lokale Videos           │
│  /var/log/museum-sync.log           Sync-Protokoll          │
│  /var/log/heartbeat.log             Heartbeat-Protokoll     │
└─────────────────────────────────────────────────────────────┘
```

---

## Stack

| Komponente | Technologie | Version |
|-----------|-------------|---------|
| CMS | Sanity Studio v3 | SaaS |
| Frontend | Astro (static build) | v4+ |
| Pi OS | Raspberry Pi OS Bookworm | 64-bit |
| Compositor | labwc (Wayland) | – |
| Browser | Chromium (Kiosk-Modus) | – |
| Webserver | nginx | stable |
| Deployments | GitHub Actions + Releases | – |
| Content-API | Sanity GROQ | v2024-01-01 |

---

## Datenfluss im Detail

### 1. Inhaltsänderung (Redakteur → Kiosk)

```
Redakteur veröffentlicht in Sanity
      ↓
Sanity-API gibt neue Daten aus (sofort)
      ↓
sync-content.sh läuft (cron, alle 5 Min.)
      ↓
GROQ-Abfrage: *[_type=="kioskDevice" && kioskId==$kioskId][0]{...}
      ↓
Ergebnis wird als kiosk-content.json gespeichert (atomisch via tmp-Datei)
      ↓
Kiosk-Frontend liest kiosk-content.json beim nächsten Seitenaufruf
      ↓
Idle-Timeout (5 Min. Inaktivität) → Seite neu laden → neue Inhalte sichtbar
```

### 2. Software-Update (GitHub → Pi)

```
git push → main branch
      ↓
GitHub Actions (netlify-deploy.yml)
  → npm ci && npm run build
  → dist/ → museum-kiosk-build.zip
  → GitHub Release (tag: build-YYYYMMDD-HHMMSS)
      ↓
sync-build.sh läuft (museum-sync.timer, alle 30 Min.)
  → GitHub API: /releases/latest
  → Vergleicht current-version mit tag_name
  → Bei neuer Version: ZIP herunterladen
  → rsync nach /var/www/museum/ (videos/ bleibt erhalten)
  → chromium-kiosk.service neu starten
```

---

## Kiosk-Modi

Jede Ausstellung hat genau einen `kioskTemplate.template`-Wert:

| Wert | Seite geladen | Beschreibung |
|------|---------------|-------------|
| `video` | `/kiosk/video` | Video-Playlist in Endlosschleife |
| `slideshow` | `/kiosk/slideshow` | Bilder-Diashow |
| `explorer` | `/kiosk/explorer` | Interaktive Exponate-Übersicht |
| `reader` | `/kiosk/reader` | PDF-Viewer |

Die Routing-Logik befindet sich in `src/pages/kiosk/index.astro`, welche nach dem Laden von `kiosk-content.json` auf den passenden Modus weiterleitet.

---

## GROQ-Abfrage (sync-content.sh)

Die Kiosk-Seiten lesen ausschließlich aus der gecachten `/kiosk-content.json`. Die Abfrage holt alle benötigten Daten in einem einzigen Request:

```groq
*[_type=="kioskDevice" && kioskId==$kioskId][0]{
  _id,
  "kioskId": kioskId,
  "modus": ausstellung->kioskTemplate.template,
  "idle_timeout": 300000,

  "konfiguration": {
    "video_settings": {
      "playlist": ausstellung->videos[]{...},
      "loop": ausstellung->kioskTemplate.videoSettings.loop,
      "shuffle": ..., "zeige_overlay": ..., ...
    }
  },
  "exponate": ausstellung->exponate[]->{...},
  "kategorien": ausstellung->kategorien[]->{_id, titel},
  "slideshowSettings": ausstellung->kioskTemplate.slideshowSettings,
  "explorerSettings":  ausstellung->kioskTemplate.explorerSettings,
  "pdf_url": ausstellung->kioskTemplate.readerSettings.pdf_url
}
```

**Offline-Resilienz:** Wenn Sanity nicht erreichbar ist, bleibt die bestehende `kiosk-content.json` erhalten. Der Kiosk läuft also weiter, zeigt aber veraltete Inhalte.

---

## nginx-Konfiguration

Datei: `/etc/nginx/sites-enabled/museum`

Relevante Konfigurationspunkte:
- Port 80, IPv4 + IPv6
- gzip für JSON, HTML, CSS, JS
- Security-Header: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- Cache-Strategie:
  - `*.html` → `max-age=3600` (1 Stunde)
  - `/_astro/` → `max-age=31536000, immutable` (inhaltsadressierte Dateien)
  - `/videos/` → `max-age=31536000` (lokale Videos)
  - `/kiosk-config.json` → `no-store` (immer frisch)
- SPA-Fallback: `try_files $uri $uri/ /index.html`

---

## systemd-Services

### `museum-sync.service` / `museum-sync.timer`
- Läuft als **root** (benötigt rsync nach /var/www)
- Timer: alle 30 Minuten
- Skript: `/usr/local/bin/sync-build.sh`
- Log: `/var/log/museum-sync.log` (logrotate: 7 Tage, komprimiert)

### `chromium-kiosk.service`
- Läuft als **museumgh** (User-Service: `~/.config/systemd/user/`)
- Startet labwc (Wayland) + Chromium im Kiosk-Modus
- Umgebung: `WAYLAND_DISPLAY=wayland-1`, `XDG_RUNTIME_DIR=/run/user/1000`
- URL: `http://localhost/kiosk/`
- Flags: `--kiosk --no-sandbox --disable-infobars --disable-session-crashed-bubble`

---

## Dateien & Verzeichnisse auf dem Pi

| Pfad | Inhalt |
|------|--------|
| `/etc/museum-kiosk/kiosk-id.json` | `{"kioskId": "RPI_01", "hostname": "rpi01"}` |
| `/etc/museum-kiosk/current-version` | Aktueller Build-Tag (z.B. `build-20260403-120000`) |
| `/var/www/museum/` | Astro Frontend Build (nginx root) |
| `/var/www/museum/kiosk-content.json` | Gecachte Sanity-Daten |
| `/var/www/museum/videos/` | Lokale Video-Dateien (bleibt bei Updates erhalten) |
| `/usr/local/bin/sync-build.sh` | Build-Sync-Skript |
| `/usr/local/bin/sync-content.sh` | Content-Sync-Skript |
| `/usr/local/bin/heartbeat.sh` | Heartbeat-Skript |
| `/var/log/museum-sync.log` | Sync-Protokoll |
| `/var/log/sync-content.log` | Content-Sync-Protokoll |
| `/var/log/heartbeat.log` | Heartbeat-Protokoll |

---

## Setup neuer Pi-Geräte

Neue Geräte werden über das Python Setup-Tool eingerichtet:

```
raspberry-pi/setup-tool/setup_tool.py
```

**Voraussetzungen:**
```bash
pip install textual paramiko
cp secrets.example.py secrets.py   # Zugangsdaten eintragen
python3 setup_tool.py
```

**Das Tool übernimmt:**
1. SSH-Verbindung zum Pi
2. Pakete installieren (nginx, chromium, jq, curl, python3)
3. Kiosk-User anlegen (museumgh)
4. Skripte deployen (sync-build.sh, sync-content.sh, heartbeat.sh)
5. nginx konfigurieren
6. systemd-Services einrichten
7. Cronjobs anlegen
8. Kiosk-ID in Sanity registrieren (kioskDevice-Dokument anlegen)
9. WLAN konfigurieren
10. Logrotate einrichten
11. Overlay-Filesystem aktivieren (optional, für Schreibschutz)

---

## Sanity-Schemas

| Schema | Dokument-Typ | Beschreibung |
|--------|-------------|-------------|
| `ausstellung.js` | `ausstellung` | Ausstellung mit allen Inhalten + kioskTemplate |
| `exponat.js` | `exponat` | Einzelnes Ausstellungsobjekt |
| `kategorie.js` | `kategorie` | Thematische Gruppe |
| `kioskDevice.js` | `kioskDevice` | Kiosk-Gerät mit Heartbeat-Status |
| `museum-info.js` | `museumInfo` | Allgemeine Museumsangaben |
| `dokumentKategorie.js` | `dokumentKategorie` | Ordner für Dokumente |

---

## Umgebungsvariablen

### Frontend (`.env` / Netlify Environment)
| Variable | Wert | Beschreibung |
|----------|------|-------------|
| `PUBLIC_SANITY_PROJECT_ID` | `832k5je1` | Sanity Projekt-ID |
| `PUBLIC_SANITY_DATASET` | `production` | Sanity Dataset |

### Sanity Studio (`.env` / lokal)
| Variable | Wert | Beschreibung |
|----------|------|-------------|
| `SANITY_STUDIO_PROJECT_ID` | `832k5je1` | Sanity Projekt-ID |
| `SANITY_STUDIO_DATASET` | `production` | Sanity Dataset |

### Setup-Tool (`secrets.py` – gitignored)
| Variable | Beschreibung |
|----------|-------------|
| `PI_USER` | SSH-Benutzername des Pi |
| `PI_PASSWORD` | SSH-Passwort des Pi |
| `SANITY_TOKEN` | Sanity API Write-Token |
| `DEFAULT_WIFI` | Standard-WLAN-Konfiguration |

---

## Repositories

| Repository | Inhalt | Zugang |
|-----------|--------|--------|
| `museumgrueneshaus/museum-astro-frontend` | Astro Frontend, GitHub Actions, Pi-Setup-Skripte | GitHub |
| `museumgrueneshaus/mk2025` | Sanity CMS, Python Setup-Tool, Dokumentation | GitHub |

---

## Sicherheitshinweise

- Der Sanity API-Token (Write-Zugriff) darf **niemals** in Git committed werden → liegt in `secrets.py` (gitignored)
- Die Kiosk-API verwendet **kein Token** (read-only, public GROQ-API)
- SSH-Zugang zum Pi sollte langfristig auf Key-Auth umgestellt werden
- Das Overlay-Filesystem schützt die Pi-SD-Karte vor Korruption durch Stromausfälle
- nginx läuft nur auf `localhost` – kein externer Zugriff auf den Kiosk-Webserver

---

*Letzte Aktualisierung: April 2026*
