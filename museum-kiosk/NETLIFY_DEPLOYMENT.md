# Museum Kiosk - Netlify Deployment

## Problem: Statisches Hosting

Netlify ist ein **Static Site Generator** - es gibt keinen Server, der die MAC-Adressen verarbeiten kann. Wir brauchen eine andere Lösung für die Kiosk-Konfiguration.

## Lösungsansätze

### Option 1: Client-Side Routing mit LocalStorage
```javascript
// In der Astro-App
const MAC = new URLSearchParams(window.location.search).get('mac');
const config = localStorage.getItem(`kiosk-config-${MAC}`) || defaultConfig;
```
**Pro:** Einfach, funktioniert offline
**Contra:** Konfiguration muss lokal gespeichert werden

### Option 2: Externe Config API (Empfohlen)
Nutzen Sie einen kostenlosen Service für die Konfiguration:

#### a) GitHub als Config-Storage
```yaml
# Repository: museum-kiosk-configs
# File: configs/aa-bb-cc-dd-ee-01.json
{
  "name": "Eingang",
  "layout": "slideshow-auto",
  "content": {
    "images": ["/media/images/welcome1.jpg"]
  }
}
```

Abrufen via GitHub API:
```javascript
const MAC = getMacFromUrl();
const response = await fetch(
  `https://raw.githubusercontent.com/IHR-REPO/museum-configs/main/configs/${MAC}.json`
);
const config = await response.json();
```

#### b) Google Sheets als Backend
- Kostenlose Google Sheets API
- Tabelle mit MAC-Adressen und Konfigurationen
- Abruf via Sheets API

#### c) Netlify Functions (Serverless)
```javascript
// netlify/functions/get-config.js
exports.handler = async (event) => {
  const mac = event.queryStringParameters.mac;
  // Config from environment variables or external source
  return {
    statusCode: 200,
    body: JSON.stringify(configs[mac])
  };
};
```

### Option 3: URL-basierte Konfiguration
Encode die Konfiguration direkt in die URL:

```javascript
// Raspberry Pi URL:
https://museum.netlify.app/viewer?config=eyJsYXlvdXQiOiJzbGlkZXNob3ciLCJpbWFnZXMiOlsiLi4uIl19

// Decode im Browser:
const config = JSON.parse(atob(params.get('config')));
```

### Option 4: Vordefinierte Routen
Erstellen Sie statische Routen für jeden Kiosk:

```
/viewer/kiosk-1  -> Eingang
/viewer/kiosk-2  -> Ausstellung A
/viewer/kiosk-3  -> Ausstellung B
```

## Empfohlene Lösung: GitHub + Static Generation

### 1. Setup GitHub Repository für Configs
```bash
# Repository: museum-kiosk-configs
configs/
├── kiosk-eingang.json
├── kiosk-ausstellung-a.json
└── kiosk-ausstellung-b.json
```

### 2. Raspberry Pi Setup anpassen
```bash
# /boot/museum-config/kiosk-id.txt
kiosk-eingang
```

### 3. Start-Script anpassen
```bash
#!/bin/bash
# Lese Kiosk-ID statt MAC
KIOSK_ID=$(cat /boot/museum-config/kiosk-id.txt || echo "kiosk-default")
NETLIFY_URL="https://museum.netlify.app"

# Öffne URL mit Kiosk-ID
chromium-browser --kiosk "${NETLIFY_URL}/viewer/${KIOSK_ID}"
```

### 4. Astro App anpassen
```astro
---
// src/pages/viewer/[id].astro
const { id } = Astro.params;

// Fetch config from GitHub
const response = await fetch(
  `https://raw.githubusercontent.com/YOUR-REPO/museum-configs/main/configs/${id}.json`
);
const config = await response.json();
---

<KioskViewer config={config} />
```

## Build & Deploy Workflow

### 1. Lokale Entwicklung
```bash
npm run dev
# Test: http://localhost:4321/viewer/kiosk-eingang
```

### 2. Build für Netlify
```bash
npm run build
# Output: dist/
```

### 3. Deploy
```bash
# Via Netlify CLI
netlify deploy --prod

# Oder via Git
git push origin main
# (Netlify auto-deploy)
```

### 4. Raspberry Pi konfigurieren
```bash
# Auf SD-Karte:
echo "museum.netlify.app" > /boot/museum-config/server.txt
echo "kiosk-eingang" > /boot/museum-config/kiosk-id.txt
```

## Admin Interface für Netlify

Da Netlify statisch ist, brauchen wir eine andere Lösung für das Admin-Interface:

### Option 1: Netlify CMS
```yaml
# static/admin/config.yml
backend:
  name: git-gateway
  branch: main

collections:
  - name: "kiosks"
    label: "Kiosk Configurations"
    files:
      - label: "Eingang"
        name: "kiosk-eingang"
        file: "configs/kiosk-eingang.json"
        fields:
          - {label: "Layout", name: "layout", widget: "select"}
          - {label: "Images", name: "images", widget: "list"}
```

### Option 2: Separate Admin App
- Erstellen Sie eine separate Admin-App
- Deploy auf Vercel/Netlify mit Serverless Functions
- Verwaltet die GitHub Config-Files via API

## Beispiel-Konfiguration

### `/boot/museum-config/` auf Raspberry Pi:
```
server.txt          -> museum.netlify.app
kiosk-id.txt       -> kiosk-eingang
wifi.txt           -> (optional WiFi config)
```

### GitHub Repository `museum-configs`:
```json
// configs/kiosk-eingang.json
{
  "id": "kiosk-eingang",
  "name": "Eingangsbereich",
  "layout": "slideshow-auto",
  "content": {
    "images": [
      "/images/welcome1.jpg",
      "/images/welcome2.jpg",
      "/images/museum-info.jpg"
    ],
    "interval": 5000
  },
  "features": {
    "touchEnabled": false,
    "showClock": true
  }
}
```

## Deployment Checklist

- [ ] Astro App für Static Site Generation konfiguriert
- [ ] GitHub Repository für Configs erstellt
- [ ] Netlify Account eingerichtet
- [ ] Auto-Deploy von GitHub aktiviert
- [ ] Raspberry Pi Image mit Kiosk-ID statt MAC
- [ ] Test-Deployment durchgeführt

## Kosten

- **Netlify Free Tier**: 100GB/Monat Traffic, 300 Build-Minuten
- **GitHub**: Kostenlos für öffentliche Repos
- **Ausreichend für**: ~10-20 Kiosks bei normalem Museum-Betrieb

Für größere Installationen: Netlify Pro ($19/Monat) oder selbst-gehostete Lösung.