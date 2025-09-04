# Museum Kiosk System 2.0

## Projektübersicht

Ein modulares, cloud-basiertes Informationssystem für interaktive Museum-Kiosks. Das System ermöglicht die zentrale Verwaltung von Inhalten und Konfigurationen über ein Headless CMS, während die Kiosk-Clients automatisch ihre spezifische Rolle basierend auf ihrer MAC-Adresse laden.

## Systemarchitektur

```
┌─────────────────────────────────────────────────────────┐
│                    Strapi Backend                        │
│                   (Render.com)                          │
│  - Content-Types: Exponat, Kiosk, Konfiguration        │
│  - Media: Cloudinary                                    │
│  - API: REST mit Deep Population                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Frontend Web-App                        │
│                    (Netlify)                            │
│  - 5 Modi: Explorer, Slideshow, Website, Video, Buch   │
│  - Vanilla JavaScript                                   │
│  - MQTT-Integration für IoT                            │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┬──────────────┐
        ▼                         ▼              ▼
┌──────────────┐         ┌──────────────┐  ┌──────────────┐
│ Raspberry Pi │         │ Raspberry Pi │  │   ESP32 +    │
│   Kiosk 1    │         │   Kiosk 2    │  │ LED-Strip    │
│ MAC: aa:bb:cc│         │ MAC: dd:ee:ff│  │    (MQTT)    │
└──────────────┘         └──────────────┘  └──────────────┘
```

## Komponenten

### 1. Backend (Strapi)
- **Ordner:** `/kiosk-backend`
- **Technologie:** Strapi v5, PostgreSQL, Cloudinary
- **Deployment:** Render.com
- **Features:**
  - Content-Management für Exponate
  - Kiosk-Konfiguration per MAC-Adresse
  - Media-Verwaltung über Cloudinary
  - Öffentliche Read-Only API

### 2. Frontend (Web-App)
- **Ordner:** `/frontend-kiosk`
- **Technologie:** Vanilla JavaScript, HTML5, CSS3
- **Deployment:** Netlify
- **Modi:**
  - **Explorer:** Interaktive Exponat-Liste mit Detail-Ansicht
  - **Slideshow:** Automatische Bilderpräsentation
  - **Website:** Externe Website im iFrame
  - **VideoPlayer:** Video-Wiedergabe mit Kontrollen
  - **Buch:** Blätterbare Seiten-Ansicht

### 3. IoT-Controller (ESP32)
- **Ordner:** `/esp32-led-controller`
- **Technologie:** C++ (Arduino), FastLED, MQTT
- **Features:**
  - WS2812B LED-Strip Steuerung
  - MQTT-Kommunikation über HiveMQ
  - Segment-basierte LED-Kontrolle

### 4. Client (Raspberry Pi)
- **Ordner:** `/raspberry-pi-setup`
- **Technologie:** Raspberry Pi OS, Chromium
- **Features:**
  - Auto-Start im Kiosk-Modus
  - MAC-basierte Identifikation
  - Readonly-Filesystem Option

## Installation & Deployment

### Backend Setup (Strapi)

1. **Lokale Entwicklung:**
```bash
cd kiosk-backend
npm install
npm run develop
```

2. **Umgebungsvariablen** (`.env`):
```env
DATABASE_CLIENT=postgres
DATABASE_URL=postgresql://user:pass@host:5432/db
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_KEY=your_api_key
CLOUDINARY_SECRET=your_api_secret
```

3. **Deployment auf Render.com:**
   - GitHub Repository erstellen
   - Neuen Web Service auf Render anlegen
   - PostgreSQL Datenbank hinzufügen
   - Environment Variables konfigurieren
   - Auto-Deploy aktivieren

### Frontend Deployment (Netlify)

1. **Konfiguration anpassen:**
```javascript
// app.js
const API_BASE_URL = 'https://your-backend.onrender.com/api';
const MQTT_BROKER_URL = 'wss://your-broker.hivemq.cloud:8884/mqtt';
```

2. **Deployment:**
```bash
cd frontend-kiosk
# Push zu GitHub
# Netlify mit GitHub verbinden
# Auto-Deploy aktivieren
```

### ESP32 Setup

1. **PlatformIO installieren**
2. **Konfiguration anpassen** in `src/main.cpp`
3. **Upload:**
```bash
cd esp32-led-controller
pio run -t upload
```

### Raspberry Pi Setup

1. **Raspberry Pi OS installieren**
2. **Setup-Dateien kopieren:**
```bash
scp -r raspberry-pi-setup/* pi@kiosk.local:/home/pi/
```
3. **Setup ausführen:**
```bash
ssh pi@kiosk.local
chmod +x setup.sh
sudo ./setup.sh
```
4. **Frontend-URL anpassen** in `/home/pi/start_kiosk.sh`

## Verwendung

### Content-Verwaltung

1. **Strapi Admin öffnen:** `https://your-backend.onrender.com/admin`
2. **Exponat erstellen:**
   - Titel, Jahresangabe, Beschreibung
   - Medien hochladen (Bilder, Audio, Video)
   - LED-Segment definieren (z.B. "10-19")

3. **Kiosk konfigurieren:**
   - Name und Standort
   - MAC-Adresse eingeben
   - Modus wählen
   - Inhalte zuordnen

4. **Globale Konfiguration:**
   - LED-Farbe (Hex)
   - LED-Helligkeit (0-255)
   - Startseiten-Titel

### Kiosk-Betrieb

- Kiosks starten automatisch
- Laden Konfiguration per MAC-Adresse
- Zeigen zugewiesenen Modus an
- Automatischer Neustart bei Fehler

## API-Endpunkte

### Öffentliche Endpoints (Read-Only)

- `GET /api/exponate` - Alle Exponate
- `GET /api/exponate/:id` - Einzelnes Exponat
- `GET /api/kiosks?filters[macAdresse][$eq]=xx:xx:xx:xx:xx:xx` - Kiosk per MAC
- `GET /api/konfiguration` - Globale Konfiguration

## MQTT-Protokoll

### Topic-Struktur
- `museum/ledstrip/set` - LED-Steuerung
- `museum/ledstrip/status` - Status-Updates
- `museum/ledstrip/heartbeat` - Keep-Alive

### Payload-Format
```
start-end;hexcolor;brightness
Beispiel: 10-19;#FFD700;200
```

## Wartung & Monitoring

### Strapi Backend
- Admin-Panel für Content-Updates
- API-Logs über Render Dashboard
- Datenbank-Backups automatisch

### Frontend
- Netlify Deploy-Logs
- Browser Console für Debugging
- Performance-Monitoring möglich

### Raspberry Pi
```bash
# Status prüfen
sudo systemctl status kiosk.service

# Logs anzeigen
journalctl -u kiosk.service -f

# Neustart
sudo systemctl restart kiosk.service
```

### ESP32
- Serielle Konsole (115200 Baud)
- MQTT-Heartbeat alle 30 Sekunden
- Auto-Reconnect bei Verbindungsverlust

## Sicherheit

### Backend
- HTTPS/TLS für alle Verbindungen
- Read-Only Public API
- Admin-Zugang geschützt

### Frontend
- Content Security Policy
- CORS konfiguriert
- Keine sensiblen Daten

### IoT
- MQTT über TLS
- Authentifizierung erforderlich
- Eingabe-Validierung

### Client
- Readonly-Filesystem Option
- Auto-Updates deaktiviert
- SSH nur mit Key-Auth

## Troubleshooting

### Backend startet nicht
- PostgreSQL-Verbindung prüfen
- Environment Variables checken
- Logs auf Render.com prüfen

### Kiosk zeigt "Fehler"
- MAC-Adresse in Strapi prüfen
- Netzwerkverbindung testen
- Browser-Console checken

### LEDs reagieren nicht
- MQTT-Broker-Verbindung prüfen
- ESP32 Serial Monitor checken
- Payload-Format validieren

### Performance-Probleme
- Bildgrößen optimieren (Cloudinary)
- API-Caching aktivieren
- CDN für Frontend nutzen

## Lizenz

MIT License - Siehe LICENSE Datei

## Support

Bei Fragen oder Problemen:
1. GitHub Issues erstellen
2. Dokumentation prüfen
3. Logs analysieren

## Roadmap

- [ ] Multi-Language Support
- [ ] Touch-Gesten für Tablets
- [ ] Analytics-Integration
- [ ] Offline-Modus
- [ ] Remote-Update für Pi
- [ ] Erweiterte LED-Effekte