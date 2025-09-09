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

## API Token (optional)

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
