# Museum Kiosk – Sanity + Astro

Dieses Repository enthält das Backend für den Museum Kiosk:

- `museum-sanity-backend` – Sanity Studio (CMS) für Inhalte und Kiosk‑Konfiguration

**Wichtig:** Das Frontend liegt in einem separaten Repository:
- [museum-astro-frontend](https://github.com/museumgrueneshaus/museum-astro-frontend) – Astro Frontend, deploybar auf Netlify

Alle anderen Ordner und Skripte wurden entfernt, um das Setup zu vereinfachen.

## Lokale Entwicklung

- Backend starten:
  - `cd museum-sanity-backend`
  - `npm install`
  - `sanity login` (einmalig)
  - `npm run dev` (öffnet `http://localhost:3333`)

- Frontend starten:
  - `cd museum-astro-frontend`
  - `npm install`
  - `npm run dev` (öffnet `http://localhost:4321`)

### Umgebungsvariablen

- Frontend (`museum-astro-frontend/.env`):
  - `PUBLIC_SANITY_PROJECT_ID`
  - `PUBLIC_SANITY_DATASET`
  - Beispiel siehe `.env.example`

- Backend (`museum-sanity-backend/.env`):die readme schreiben me schreibenreib
iben 

  - `SANITY_STUDIO_PROJECT_ID`
  - `SANITY_STUDIO_DATASET`
  - Beis
  piel siehe `.env.example`

## Verbindung Frontend ↔ Sanity

- Project ID und Dataset im Frontend sind in `museum-astro-frontend/src/lib/sanity.js` bzw. `astro.config.mjs` hinterlegt.
- Im Backend (`museum-sanity-backend/sanity.config.js`) die eigene `projectId` und `dataset` setzen.
- CORS im Sanity Projekt für `http://localhost:4321` (dev) und die Netlify‑Domain (prod) freigeben.

## Deployment

- Sanity Studio:
  - `cd museum-sanity-backend`
  - `npm run deploy` → `https://<projekt>.sanity.studio`

- Astro Frontend (Netlify):
  - **Repository:** [museum-astro-frontend](https://github.com/museumgrueneshaus/museum-astro-frontend)
  - Netlify ist über `netlify.toml` konfiguriert
  - per Git‑Import deployen oder `netlify deploy --prod`
  - In Netlify die Env Vars setzen: `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`

## Ordnerstruktur

```
mk2025/                        # Backend Repository
└── museum-sanity-backend/     # Sanity Studio (CMS)

museum-astro-frontend/         # Frontend Repository (separat)
├── src/                       # Astro App Source
├── public/                    # Static Assets
├── netlify.toml              # Netlify Configuration
└── package.json              # Dependencies
```

## Hinweise

- Falls ein altes Projekt (z. B. Strapi, weitere Frontends) benötigt wird, bitte eine frühere Git‑Version prüfen.
- Optional: Netlify‑Umgebungsvariablen im Frontend setzen (`PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`).

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
- Bildgrößen optimieren (Cloudinary)basically should steer a adressable led band 

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
