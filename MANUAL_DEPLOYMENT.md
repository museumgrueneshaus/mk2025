# 🚀 MANUELLES DEPLOYMENT - MUSEUM KIOSK SYSTEM

## SCHRITT 1: GitHub Repositories erstellen

### 1.1 Gehe zu https://github.com/new und erstelle:

**Repository 1: Backend**
- Name: `kiosk-backend`
- Owner: `museumgrueneshaus`
- Visibility: Public
- ❌ KEIN README, .gitignore oder License hinzufügen

**Repository 2: Frontend**
- Name: `kiosk-frontend`
- Owner: `museumgrueneshaus`
- Visibility: Public
- ❌ KEIN README, .gitignore oder License hinzufügen

### 1.2 Code pushen

```bash
# Backend pushen
cd /Users/marcelgladbach/mk2025/kiosk-backend
git push -u origin main --force

# Frontend pushen
cd /Users/marcelgladbach/mk2025/frontend-kiosk
git push -u origin main --force
```

---

## SCHRITT 2: Render.com Backend Deployment

### 2.1 Login
https://dashboard.render.com

### 2.2 PostgreSQL Datenbank erstellen
1. Click **"New +"** → **"PostgreSQL"**
2. Konfiguration:
   - Name: `museum-kiosk-db`
   - Database: `museum_kiosk`
   - User: `museum`
   - Region: `Frankfurt (EU Central)`
   - Plan: `Starter ($7/month)`
3. **"Create Database"**
4. Warte bis Status "Available" 
5. Kopiere die **Internal Database URL**

### 2.3 Web Service erstellen
1. Click **"New +"** → **"Web Service"**
2. **"Connect a repository"** → GitHub verbinden
3. Repository wählen: `museumgrueneshaus/kiosk-backend`
4. Konfiguration:
   ```
   Name: museum-kiosk-backend
   Region: Frankfurt (EU Central)
   Branch: main
   Root Directory: (leer lassen)
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm run start
   Plan: Starter ($7/month)
   ```

### 2.4 Environment Variables setzen
Click **"Advanced"** → Add Environment Variables:

```env
NODE_ENV=production
DATABASE_CLIENT=postgres
DATABASE_URL=[Internal Database URL von Schritt 2.2]
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false

# Cloudinary
CLOUDINARY_NAME=dtx5nuban
CLOUDINARY_KEY=484387353599576
CLOUDINARY_SECRET=y3xRJMDNYLnKIeIE0le0jCDClw_CFU

# Secrets (Click "Generate" für jeden)
APP_KEYS=[Generate]
API_TOKEN_SALT=[Generate]
ADMIN_JWT_SECRET=[Generate]
TRANSFER_TOKEN_SALT=[Generate]
JWT_SECRET=[Generate]
ENCRYPTION_KEY=[Generate]
```

5. **"Create Web Service"**
6. Warte auf Deployment (~10 Minuten)
7. Backend URL: `https://museum-kiosk-backend.onrender.com`

---

## SCHRITT 3: Netlify Frontend Deployment

### 3.1 Login
https://app.netlify.com

### 3.2 Site erstellen
1. **"Add new site"** → **"Import an existing project"**
2. **"Deploy with GitHub"**
3. Repository wählen: `museumgrueneshaus/kiosk-frontend`
4. Deploy Settings:
   ```
   Branch to deploy: main
   Base directory: (leer)
   Build command: (leer)
   Publish directory: .
   ```

### 3.3 Environment Variables
1. Go to **"Site settings"** → **"Environment variables"**
2. Add:
   ```
   VITE_API_BASE_URL=https://museum-kiosk-backend.onrender.com/api
   VITE_MQTT_BROKER_URL=wss://478ecbad737943fba16f5c7c4900d7cb.s1.eu.hivemq.cloud:8884/mqtt
   VITE_MQTT_USERNAME=museumgrueneshaus
   VITE_MQTT_PASSWORD=moKqog-waqpaf-bejwi1
   ```

### 3.4 Deploy
1. **"Deploy site"**
2. Warte auf Deployment (~2 Minuten)
3. Frontend URL: `https://[generated-name].netlify.app`

### 3.5 Custom Domain (Optional)
1. **"Domain settings"** → **"Add custom domain"**
2. Domain: `museum-kiosk.netlify.app`

---

## SCHRITT 4: Verifizierung

### 4.1 Backend testen
```bash
# API Test
curl https://museum-kiosk-backend.onrender.com/api/konfiguration

# Admin Panel
open https://museum-kiosk-backend.onrender.com/admin
```

### 4.2 Frontend testen
```bash
# Mit Test-MAC
open https://museum-kiosk.netlify.app/?mac=aa:bb:cc:dd:ee:ff
```

### 4.3 Strapi Admin Setup
1. Öffne: https://museum-kiosk-backend.onrender.com/admin
2. Erstelle Admin Account:
   - Email: admin@museum.de
   - Password: [Sicheres Passwort]
3. Erstelle Test-Daten:
   - Exponat mit Titel "Test Exponat"
   - Kiosk mit MAC "aa:bb:cc:dd:ee:ff"
   - Konfiguration mit LED-Farbe "#FFD700"

---

## ✅ DEPLOYMENT CHECKLISTE

- [ ] GitHub Repositories erstellt
- [ ] Code zu GitHub gepusht
- [ ] Render PostgreSQL Datenbank läuft
- [ ] Render Web Service deployed
- [ ] Netlify Site deployed
- [ ] Backend API erreichbar
- [ ] Frontend lädt ohne Fehler
- [ ] Admin Panel funktioniert
- [ ] Test-Kiosk konfiguriert

---

## 🔗 FINALE URLS

| Service | URL | Status |
|---------|-----|--------|
| **Backend API** | https://museum-kiosk-backend.onrender.com/api | ⏳ |
| **Admin Panel** | https://museum-kiosk-backend.onrender.com/admin | ⏳ |
| **Frontend App** | https://museum-kiosk.netlify.app | ⏳ |

---

## 📞 SUPPORT

Bei Problemen:
1. Render Logs: Dashboard → Service → Logs
2. Netlify Logs: Deploys → View Deploy Log
3. Browser Console: F12 → Console

---

**Deployment-Zeit:** ~15 Minuten
**Status:** Bereit für manuelles Deployment