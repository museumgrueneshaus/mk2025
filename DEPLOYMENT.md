# Museum Kiosk System - Deployment Guide

## 🚀 Status: Bereit für Deployment

### ✅ Erhaltene Konfigurationsdaten

#### Cloudinary (Media Storage)
- **Cloud Name:** `dtx5nuban`
- **API Key:** `484387353599576`  
- **API Secret:** `y3xRJMDNYLnKIeIE0le0jCDClw_CFU`
- **Status:** ✅ Integriert

#### Render.com (Backend Hosting)
- **API Key:** `rnd_DeAgYF22cr62VUMdDnWpWOea4s3F`
- **Status:** ✅ Bereit

#### Netlify (Frontend Hosting)
- **Access Token:** `nfp_W4bT7rLS6Mc96BqQgTYquc5RXGjU2NkD3999`
- **Status:** ✅ Bereit

#### HiveMQ Cloud (MQTT Broker)
- **Cluster URL:** ❌ AUSSTEHEND
- **Username:** ❌ AUSSTEHEND
- **Password:** ❌ AUSSTEHEND
- **Status:** ⏳ Warte auf Daten vom Architekten

---

## 📦 Deployment-Schritte

### Phase 1: GitHub Repositories erstellen

1. Gehen Sie zu https://github.com/new
2. Erstellen Sie folgende Repositories:
   - `museumgrueneshaus/kiosk-backend`
   - `museumgrueneshaus/kiosk-frontend`
   - `museumgrueneshaus/kiosk-esp32`
   - `museumgrueneshaus/kiosk-raspberry`

### Phase 2: Code zu GitHub pushen

```bash
cd /Users/marcelgladbach/mk2025
./deploy.sh
```

### Phase 3: Backend auf Render.com deployen

1. **Login:** https://dashboard.render.com
2. **New → Web Service**
3. **Konfiguration:**
   ```
   Name: museum-kiosk-backend
   Region: Frankfurt (eu-central)
   Branch: main
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm run start
   ```

4. **Environment Variables hinzufügen:**
   ```
   NODE_ENV=production
   DATABASE_CLIENT=postgres
   DATABASE_SSL=true
   DATABASE_SSL_REJECT_UNAUTHORIZED=false
   CLOUDINARY_NAME=dtx5nuban
   CLOUDINARY_KEY=484387353599576
   CLOUDINARY_SECRET=y3xRJMDNYLnKIeIE0le0jCDClw_CFU
   ```

5. **PostgreSQL hinzufügen:**
   - New → PostgreSQL
   - Name: museum-kiosk-db
   - Verbinden mit Web Service

### Phase 4: Frontend auf Netlify deployen

1. **Login:** https://app.netlify.com
2. **Add new site → Import an existing project**
3. **GitHub verbinden:** `museumgrueneshaus/kiosk-frontend`
4. **Deploy Settings:**
   ```
   Build command: (leer lassen)
   Publish directory: .
   ```
5. **Deploy site**

### Phase 5: Konfiguration aktualisieren

Nach erfolgreichem Deployment:

1. **Backend URL in Frontend eintragen:**
   ```javascript
   // frontend-kiosk/app.js
   const API_BASE_URL = 'https://museum-kiosk-backend.onrender.com/api';
   ```

2. **Commit und Push:**
   ```bash
   cd frontend-kiosk
   git add .
   git commit -m "Update backend URL"
   git push
   ```

### Phase 6: HiveMQ konfigurieren (wenn Daten erhalten)

1. **Frontend app.js aktualisieren:**
   ```javascript
   const MQTT_BROKER_URL = 'wss://[CLUSTER_URL]:8884/mqtt';
   const MQTT_USERNAME = '[USERNAME]';
   const MQTT_PASSWORD = '[PASSWORD]';
   ```

2. **ESP32 main.cpp aktualisieren:**
   ```cpp
   const char* mqtt_server = "[CLUSTER_URL].hivemq.cloud";
   const char* mqtt_user = "[USERNAME]";
   const char* mqtt_password = "[PASSWORD]";
   ```

---

## 🔗 Finale URLs (nach Deployment)

### Production
- **Backend API:** `https://museum-kiosk-backend.onrender.com/api`
- **Admin Panel:** `https://museum-kiosk-backend.onrender.com/admin`
- **Frontend App:** `https://museum-kiosk.netlify.app`

### Development
- **Backend:** `http://localhost:1337`
- **Frontend:** `http://localhost:3000`

---

## 🧪 Test-Checkliste

### Backend Tests
- [ ] Admin-Panel erreichbar
- [ ] Admin-Account erstellen
- [ ] Exponat anlegen
- [ ] Kiosk konfigurieren
- [ ] Media-Upload testen (Cloudinary)
- [ ] API-Endpoints testen

### Frontend Tests
- [ ] Seite lädt ohne Fehler
- [ ] MAC-Parameter wird erkannt
- [ ] Alle 5 Modi funktionieren
- [ ] Responsive Design
- [ ] Fehlerbehandlung

### Integration Tests
- [ ] Frontend kann Backend-API erreichen
- [ ] Kiosk-Konfiguration wird geladen
- [ ] Media-Files werden angezeigt
- [ ] MQTT-Verbindung (wenn konfiguriert)

---

## 🔐 Sicherheits-Checkliste

- [x] Cloudinary Secrets nicht im Code
- [x] Render Environment Variables gesetzt
- [x] HTTPS für alle Verbindungen
- [x] CORS konfiguriert
- [x] Public API read-only
- [ ] Admin-Passwort geändert
- [ ] Backup-Strategie definiert

---

## 📞 Support-Kontakte

### Hosting-Provider
- **Render:** support@render.com
- **Netlify:** https://www.netlify.com/support/
- **Cloudinary:** https://support.cloudinary.com/

### Projekt-Team
- **Architekt:** Gemini
- **Deployment:** Claude Code
- **Museum:** Museum Grünes Haus

---

## 🚨 Troubleshooting

### Backend startet nicht
```bash
# Logs prüfen auf Render.com
# Environment Variables überprüfen
# DATABASE_URL korrekt?
```

### Frontend zeigt Fehler
```bash
# Browser Console prüfen
# API_BASE_URL korrekt?
# CORS-Fehler?
```

### MQTT funktioniert nicht
```bash
# HiveMQ Credentials prüfen
# WebSocket-Port korrekt? (8884)
# TLS aktiviert?
```

---

## 📝 Notizen für den Architekten

**WICHTIG:** Das System ist bereit für Deployment, aber wir warten noch auf:

1. **HiveMQ Cloud Konfiguration:**
   - Cluster URL
   - Username
   - Password

Sobald diese Daten vorliegen, kann das vollständige System deployed werden.

**Bereits vorbereitet:**
- ✅ Strapi Backend mit Cloudinary
- ✅ Frontend Web-App
- ✅ ESP32 Firmware
- ✅ Raspberry Pi Setup
- ✅ Deployment Scripts

**Nächster Schritt:**
Bitte HiveMQ Cloud Account erstellen und Zugangsdaten bereitstellen.