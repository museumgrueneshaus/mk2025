# Museum Kiosk - Sanity Backend

## Setup

### 1. Sanity Account erstellen
1. Gehe zu [sanity.io](https://www.sanity.io)
2. Registriere dich (kostenlos)
3. Erstelle ein neues Projekt

### 2. Projekt konfigurieren
Nach der Registrierung bekommst du:
- Project ID (z.B. `abc123xyz`)
- Dataset Name (verwende `production`)

### 3. Installation

```bash
# Dependencies installieren
npm install

# Sanity CLI global installieren
npm install -g @sanity/cli

# Mit Sanity einloggen
sanity login

# Projekt initialisieren (wenn noch nicht geschehen)
sanity init
```

### 4. Konfiguration anpassen

Setze die Projektwerte per `.env` (siehe `.env.example`) oder Umgebungsvariablen:

```
SANITY_STUDIO_PROJECT_ID=your_project_id
SANITY_STUDIO_DATASET=production
```

Die `sanity.config.js` liest diese Variablen automatisch; ohne Werte werden `832k5je1`/`production` verwendet.

### 5. Studio starten

```bash
npm run dev
# Öffnet auf http://localhost:3333
```

### 6. Studio deployen

```bash
npm run deploy
# Studio ist dann verfügbar unter:
# https://DEIN-PROJEKT.sanity.studio
```

## Schemas

Das Backend enthält folgende Schemas:

- **exponat** - Museum-Objekte mit allen Feldern
- **kategorie** - Kategorien für Exponate
- **kioskConfig** - Konfiguration für einzelne Kiosks
- **museumInfo** - Allgemeine Museum-Informationen

## CORS konfigurieren

Im Sanity Dashboard:
1. Gehe zu API → CORS Origins
2. Füge hinzu:
   - `http://localhost:4321` (für lokale Entwicklung)
   - `https://deine-museum-app.netlify.app` (für Production)

## Netlify Build Hook (Auto-Deploy)

Damit das Frontend nach Veröffentlichungen automatisch deployt:

1) Netlify: Site Settings → Build & deploy → Build hooks → Build Hook anlegen (URL z. B.):
   - `https://api.netlify.com/build_hooks/68c029e04a4a99209a1825e8`

2) Sanity Webhook: manage.sanity.io → Projekt → API → Webhooks → Add webhook
   - URL: Netlify Build Hook URL
   - Methode: POST, Include payload: aus
   - Trigger: Create, Update, Delete
   - Filter (GROQ) – nur relevante Typen, keine Drafts:
     ```groq
     _type in ["exponat","kategorie","kioskConfig","museumInfo"] && !(_id in path("drafts.**"))
     ```

CLI-Alternative:
```bash
sanity webhook create \
  --dataset production \
  --name "Netlify Build (prod)" \
  --url "https://api.netlify.com/build_hooks/68c029e04a4a99209a1825e8" \
  --httpMethod post \
  --includeBody false \
  --filter '_type in ["exponat","kategorie","kioskConfig","museumInfo"] && !(_id in path("drafts.**"))'
```

## Deploy des Studios

```bash
# Login (einmalig)
npx sanity login

# Deploy (Hostname gespeichert in sanity.cli.js)
npm run deploy
# Beispiel-URL: https://museumghbackend.sanity.studio/
```

## API Token

**Aktueller Token (für Testdaten-Scripts):**
```
sk1VTIq7XVReoW6NVa6L7fIJnUSRYC53fByocEKF2EIXTGHe69jf52yHs7QJwGMbH5dIDz67wEosW4RCq6pjw9qDD3IqJy69N6O7VqgMT8xUcEroHy4P5ORRSvbHuhOsHoUgo70xLnueRKGgKPzsV1nMPpz7DZ1D6CpSfDUSxIapVuDWRNDU
```

Für private Daten:
1. API → Tokens → Add API token
2. Name: "Frontend Read"
3. Permissions: Viewer
4. Token sicher speichern

## Import von IMDAS-Daten

Siehe `scripts/import-imdas.js` für den Import bestehender Daten.

## Kosten

**Free Tier beinhaltet:**
- 3 Nutzer
- 10.000 Dokumente
- 1 Million API Requests/Monat
- 20GB Asset Storage
- 200GB Bandwidth

Für ein kleines Museum mehr als ausreichend!
