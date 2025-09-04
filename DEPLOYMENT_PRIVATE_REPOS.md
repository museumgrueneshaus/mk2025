# 🚀 DEPLOYMENT MIT PRIVATEN REPOSITORIES

## ✅ STATUS: Code erfolgreich gepusht!

- **Backend:** https://github.com/museumgrueneshaus/kiosk-backend (Privat)
- **Frontend:** https://github.com/museumgrueneshaus/kiosk-frontend (Privat)

---

## 📦 RENDER.COM DEPLOYMENT (Backend)

### Schritt 1: Login
https://dashboard.render.com

### Schritt 2: GitHub App installieren
1. Click **"New +"** → **"Web Service"**
2. **"Connect GitHub account"**
3. **"Configure GitHub App"**
4. Wähle: **"museumgrueneshaus"** Organisation
5. Repository Access:
   - **"Selected repositories"**
   - Wähle: `kiosk-backend`
6. **"Install"**

### Schritt 3: PostgreSQL Datenbank erstellen
1. **"New +"** → **"PostgreSQL"**
2. Konfiguration:
   ```
   Name: museum-kiosk-db
   Database: museum_kiosk
   User: museum
   Region: Frankfurt (EU Central)
   Version: 15
   Plan: Starter
   ```
3. **"Create Database"**
4. Warte auf "Available" Status
5. Kopiere die **Internal Database URL**

### Schritt 4: Web Service erstellen
1. **"New +"** → **"Web Service"**
2. **"Connect a repository"**
3. Wähle: `museumgrueneshaus/kiosk-backend`
4. Service Settings:
   ```
   Name: museum-kiosk-backend
   Region: Frankfurt (EU Central)
   Branch: main
   Root Directory: (leer)
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm run start
   Instance Type: Starter ($7/month)
   ```

### Schritt 5: Environment Variables
Click **"Advanced"** und füge hinzu:

```env
NODE_ENV=production
DATABASE_CLIENT=postgres
DATABASE_URL=[Internal URL von Schritt 3]
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false

# Cloudinary
CLOUDINARY_NAME=dtx5nuban
CLOUDINARY_KEY=484387353599576
CLOUDINARY_SECRET=y3xRJMDNYLnKIeIE0le0jCDClw_CFU

# Auto-generierte Secrets (Click "Generate")
APP_KEYS=[Generate]
API_TOKEN_SALT=[Generate]
ADMIN_JWT_SECRET=[Generate]
TRANSFER_TOKEN_SALT=[Generate]
JWT_SECRET=[Generate]
ENCRYPTION_KEY=[Generate]
```

6. **"Create Web Service"**
7. Deployment startet automatisch (~10 Minuten)

### Erwartete Backend URL:
`https://museum-kiosk-backend.onrender.com`

---

## 🌐 NETLIFY DEPLOYMENT (Frontend)

### Schritt 1: Login
https://app.netlify.com

### Schritt 2: GitHub Zugriff
1. **"Add new site"** → **"Import an existing project"**
2. **"Deploy with GitHub"**
3. **"Authorize Netlify"**
4. Gewähre Zugriff auf **"museumgrueneshaus"** Organisation

### Schritt 3: Repository verbinden
1. Wähle: `museumgrueneshaus/kiosk-frontend`
2. Site Settings:
   ```
   Team: Your team
   Site name: museum-kiosk
   Branch to deploy: main
   Base directory: (leer)
   Build command: (leer)
   Publish directory: .
   ```

### Schritt 4: Environment Variables
**"Show advanced"** → **"New variable"**:

Diese Variablen werden NICHT benötigt, da sie bereits im Code sind:
- Die API URL ist bereits konfiguriert
- MQTT Credentials sind bereits im Code

### Schritt 5: Deploy
1. **"Deploy museum-kiosk"**
2. Deployment startet (~2 Minuten)

### Erwartete Frontend URL:
`https://museum-kiosk.netlify.app`

---

## ✅ VERIFIZIERUNG

### 1. Backend testen (nach ~10 Min)
```bash
# API Test
curl https://museum-kiosk-backend.onrender.com/api/konfiguration

# Admin Panel öffnen
open https://museum-kiosk-backend.onrender.com/admin
```

### 2. Admin Account erstellen
1. Öffne: https://museum-kiosk-backend.onrender.com/admin
2. Registriere ersten Admin:
   - Email: admin@museum.de
   - Password: [Sicheres Passwort notieren!]

### 3. Test-Daten anlegen
Im Admin Panel:
1. **Konfiguration** → Erstellen:
   - Titel der Startseite: "Museum Kiosk System"
   - Farbe der LEDs: "#FFD700"
   - Helligkeit: 150

2. **Exponat** → Erstellen:
   - Titel: "Test Exponat"
   - Jahresangabe: "2024"
   - Beschreibung: "Dies ist ein Test"
   - LED Segment: "10-19"

3. **Kiosk** → Erstellen:
   - Name: "Test Kiosk"
   - MAC-Adresse: "aa:bb:cc:dd:ee:ff"
   - Modus: "Explorer"
   - Zugeordnete Inhalte: Explorer-Konfiguration hinzufügen

### 4. Frontend testen
```bash
open https://museum-kiosk.netlify.app/?mac=aa:bb:cc:dd:ee:ff
```

---

## 🔧 TROUBLESHOOTING

### Render Build Fehler
- Logs prüfen: Service → Logs
- Environment Variables prüfen
- DATABASE_URL korrekt?

### Netlify Deploy Fehler
- Deploy log prüfen
- Repository Zugriff prüfen
- Branch existiert?

### CORS Fehler im Frontend
- Backend URL in app.js prüfen
- HTTPS verwenden (nicht HTTP)

---

## 📊 MONITORING

### Render Dashboard
- Service Metrics
- Database Metrics
- Logs
- Alerts einrichten

### Netlify Dashboard
- Deploy History
- Analytics
- Forms (falls verwendet)
- Functions (falls verwendet)

---

## 🎉 FERTIG!

Nach erfolgreichem Deployment:

| Service | URL | Status |
|---------|-----|--------|
| **Backend API** | https://museum-kiosk-backend.onrender.com/api | ⏳ Deploying |
| **Admin Panel** | https://museum-kiosk-backend.onrender.com/admin | ⏳ Deploying |
| **Frontend App** | https://museum-kiosk.netlify.app | ⏳ Deploying |

**Deployment-Zeit:**
- Backend: ~10 Minuten (Render)
- Frontend: ~2 Minuten (Netlify)

---

**GitHub Token:** Sicher aufbewahren für zukünftige Updates!  
**Tipp:** Token in Password Manager speichern