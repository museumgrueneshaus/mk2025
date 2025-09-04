#!/bin/bash

# ================================================
# Museum Kiosk - Synology NAS Deployment Script
# ================================================

# Konfiguration
NAS_IP="192.168.1.123"
NAS_USER="${NAS_USER:-admin}"
DOCKER_PATH="/volume1/docker/museum-kiosk"

echo "========================================="
echo "Museum Kiosk - Synology NAS Deployment"
echo "========================================="
echo ""
echo "NAS IP: $NAS_IP"
echo "Ziel-Pfad: $DOCKER_PATH"
echo ""

# Farben für Output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# ================================================
# 1. Dateien lokal vorbereiten
# ================================================

echo -e "${YELLOW}Bereite Deployment-Dateien vor...${NC}"

# Temp-Verzeichnis für Deployment
DEPLOY_DIR="synology-deploy-files"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# ================================================
# 2. Docker-Compose erstellen
# ================================================

cat > $DEPLOY_DIR/docker-compose.yml << 'EOFDOCKER'
version: '3.8'

services:
  # PostgreSQL Datenbank
  postgres:
    image: postgres:15-alpine
    container_name: museum-postgres
    restart: always
    environment:
      POSTGRES_DB: museum
      POSTGRES_USER: museum
      POSTGRES_PASSWORD: MuseumDB2024Secure!
      POSTGRES_INITDB_ARGS: "--encoding=UTF8"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"
    networks:
      - museum-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U museum"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Strapi Backend
  strapi:
    image: node:18-alpine
    container_name: museum-backend
    restart: always
    working_dir: /app
    command: sh -c "npm install && npm run build && npm run start"
    environment:
      NODE_ENV: production
      HOST: 0.0.0.0
      PORT: 1337
      # Database
      DATABASE_CLIENT: postgres
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_NAME: museum
      DATABASE_USERNAME: museum
      DATABASE_PASSWORD: MuseumDB2024Secure!
      DATABASE_SSL: false
      # Secrets
      JWT_SECRET: jwtSecret2024MuseumKiosk!
      ADMIN_JWT_SECRET: adminJwtSecret2024Museum!
      APP_KEYS: appKey1Museum,appKey2Museum,appKey3Museum,appKey4Museum
      API_TOKEN_SALT: apiTokenSaltMuseum2024
      TRANSFER_TOKEN_SALT: transferTokenSaltMuseum2024
      # Admin user
      ADMIN_EMAIL: admin@museum.local
      ADMIN_PASSWORD: AdminMuseum2024!
    volumes:
      - ./kiosk-backend:/app
      - strapi_uploads:/app/public/uploads
      - strapi_node_modules:/app/node_modules
    ports:
      - "1337:1337"
    networks:
      - museum-network
    depends_on:
      postgres:
        condition: service_healthy

  # Admin Portal
  admin:
    image: nginx:alpine
    container_name: museum-admin
    restart: always
    volumes:
      - ./admin-portal:/usr/share/nginx/html:ro
      - ./nginx-admin.conf:/etc/nginx/conf.d/default.conf:ro
    ports:
      - "8080:80"
    networks:
      - museum-network

  # Katalog Frontend
  katalog:
    image: nginx:alpine
    container_name: museum-katalog
    restart: always
    volumes:
      - ./katalog-frontend:/usr/share/nginx/html:ro
      - ./nginx-katalog.conf:/etc/nginx/conf.d/default.conf:ro
    ports:
      - "8081:80"
    networks:
      - museum-network

networks:
  museum-network:
    driver: bridge

volumes:
  postgres_data:
    driver: local
  strapi_uploads:
    driver: local
  strapi_node_modules:
    driver: local
EOFDOCKER

# ================================================
# 3. Nginx Konfigurationen
# ================================================

cat > $DEPLOY_DIR/nginx-admin.conf << 'EOFNGINX'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    
    # CORS Headers
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy to Strapi API
    location /api {
        proxy_pass http://strapi:1337/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOFNGINX

cat > $DEPLOY_DIR/nginx-katalog.conf << 'EOFNGINX2'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    
    # CORS Headers
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOFNGINX2

# ================================================
# 4. Setup Script für NAS
# ================================================

cat > $DEPLOY_DIR/setup.sh << 'EOFSETUP'
#!/bin/bash

echo "Museum Kiosk - Setup auf Synology NAS"
echo "======================================"

# Verzeichnisse erstellen
echo "Erstelle Verzeichnisstruktur..."
mkdir -p kiosk-backend
mkdir -p admin-portal
mkdir -p katalog-frontend
mkdir -p backups

# Package.json für Backend erstellen
cat > kiosk-backend/package.json << 'EOF'
{
  "name": "museum-kiosk-backend",
  "version": "1.0.0",
  "description": "Museum Kiosk Backend",
  "scripts": {
    "develop": "strapi develop",
    "start": "strapi start",
    "build": "strapi build",
    "strapi": "strapi"
  },
  "dependencies": {
    "@strapi/strapi": "4.15.5",
    "@strapi/plugin-users-permissions": "4.15.5",
    "@strapi/plugin-i18n": "4.15.5",
    "@strapi/plugin-cloud": "4.15.5",
    "pg": "8.11.3"
  },
  "engines": {
    "node": ">=16.0.0 <=20.x.x",
    "npm": ">=6.0.0"
  }
}
EOF

# Docker Compose starten
echo "Starte Docker Container..."
docker-compose up -d

# Warten bis Services bereit sind
echo "Warte auf Service-Start (60 Sekunden)..."
sleep 60

# Status anzeigen
docker-compose ps

echo ""
echo "======================================"
echo "Setup abgeschlossen!"
echo "======================================"
echo ""
echo "Zugriff:"
echo "- Strapi Admin: http://192.168.1.123:1337/admin"
echo "- Admin Portal: http://192.168.1.123:8080"
echo "- Katalog:      http://192.168.1.123:8081"
echo ""
echo "Erste Schritte:"
echo "1. Öffne http://192.168.1.123:1337/admin"
echo "2. Erstelle Admin-Account"
echo "3. Lege erstes Exponat an"
echo ""
EOFSETUP

chmod +x $DEPLOY_DIR/setup.sh

# ================================================
# 5. Frontend Dateien kopieren
# ================================================

echo -e "${YELLOW}Kopiere Frontend-Dateien...${NC}"

# Admin Portal
mkdir -p $DEPLOY_DIR/admin-portal
if [ -f admin-portal/index.html ]; then
    cp -r admin-portal/* $DEPLOY_DIR/admin-portal/
else
    # Fallback: Minimal HTML
    cat > $DEPLOY_DIR/admin-portal/index.html << 'EOFHTML'
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Museum Admin Portal</title>
    <style>
        body { font-family: Arial; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: #f5f5f5; padding: 20px; margin: 10px 0; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Museum Admin Portal</h1>
        <div class="card">
            <h2>Willkommen</h2>
            <p>Das Admin Portal wird geladen...</p>
            <a href="http://192.168.1.123:1337/admin" target="_blank">→ Strapi Admin öffnen</a>
        </div>
    </div>
</body>
</html>
EOFHTML
fi

# Admin JS
if [ -f admin-portal/admin.js ]; then
    cp admin-portal/admin.js $DEPLOY_DIR/admin-portal/
    # API URL anpassen
    sed -i '' "s|http://localhost:1337|http://192.168.1.123:1337|g" $DEPLOY_DIR/admin-portal/admin.js 2>/dev/null || \
    sed -i "s|http://localhost:1337|http://192.168.1.123:1337|g" $DEPLOY_DIR/admin-portal/admin.js
fi

# Katalog Frontend
mkdir -p $DEPLOY_DIR/katalog-frontend
if [ -f katalog-frontend/index.html ]; then
    cp -r katalog-frontend/* $DEPLOY_DIR/katalog-frontend/
else
    # Fallback: Minimal HTML
    cat > $DEPLOY_DIR/katalog-frontend/index.html << 'EOFHTML2'
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Museum Katalog</title>
    <style>
        body { font-family: Arial; padding: 20px; background: #f0f0f0; }
        .container { max-width: 1200px; margin: 0 auto; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .card img { width: 100%; height: 200px; object-fit: cover; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Museum Katalog</h1>
        <div id="exponat-grid" class="grid">
            <div class="card">
                <p>Lade Exponate...</p>
            </div>
        </div>
    </div>
    <script>
        const API_URL = 'http://192.168.1.123:1337/api';
        
        async function loadExponate() {
            try {
                const response = await fetch(API_URL + '/exponate?populate=*');
                const data = await response.json();
                const grid = document.getElementById('exponat-grid');
                
                if (data.data && data.data.length > 0) {
                    grid.innerHTML = data.data.map(item => `
                        <div class="card">
                            <h3>${item.attributes.titel}</h3>
                            <p>${item.attributes.kurzbeschreibung}</p>
                        </div>
                    `).join('');
                } else {
                    grid.innerHTML = '<div class="card"><p>Noch keine Exponate vorhanden.</p></div>';
                }
            } catch (error) {
                console.error('Fehler:', error);
                document.getElementById('exponat-grid').innerHTML = 
                    '<div class="card"><p>Fehler beim Laden. Backend läuft noch nicht.</p></div>';
            }
        }
        
        // Beim Laden
        setTimeout(loadExponate, 2000);
    </script>
</body>
</html>
EOFHTML2
fi

# Katalog JS
if [ -f katalog-frontend/katalog.js ]; then
    cp katalog-frontend/katalog.js $DEPLOY_DIR/katalog-frontend/
    # API URL anpassen
    sed -i '' "s|http://localhost:1337|http://192.168.1.123:1337|g" $DEPLOY_DIR/katalog-frontend/katalog.js 2>/dev/null || \
    sed -i "s|http://localhost:1337|http://192.168.1.123:1337|g" $DEPLOY_DIR/katalog-frontend/katalog.js
fi

# ================================================
# 6. Backend vorbereiten
# ================================================

echo -e "${YELLOW}Bereite Strapi Backend vor...${NC}"

mkdir -p $DEPLOY_DIR/kiosk-backend
cp -r kiosk-backend/* $DEPLOY_DIR/kiosk-backend/ 2>/dev/null || true

# ================================================
# 7. Upload zum NAS
# ================================================

echo -e "${YELLOW}Lade Dateien zum NAS hoch...${NC}"
echo "Bitte Passwort für $NAS_USER@$NAS_IP eingeben:"

# SSH-Befehle zum Erstellen der Verzeichnisse
ssh $NAS_USER@$NAS_IP "mkdir -p $DOCKER_PATH"

# Dateien via SCP kopieren
scp -r $DEPLOY_DIR/* $NAS_USER@$NAS_IP:$DOCKER_PATH/

# Setup-Script auf NAS ausführen
echo -e "${YELLOW}Führe Setup auf NAS aus...${NC}"
ssh $NAS_USER@$NAS_IP "cd $DOCKER_PATH && chmod +x setup.sh && ./setup.sh"

# ================================================
# 8. Aufräumen
# ================================================

echo -e "${YELLOW}Räume temporäre Dateien auf...${NC}"
rm -rf $DEPLOY_DIR

# ================================================
# Zusammenfassung
# ================================================

echo ""
echo "========================================="
echo -e "${GREEN}✓ Deployment abgeschlossen!${NC}"
echo "========================================="
echo ""
echo "Museum Kiosk läuft jetzt auf deinem Synology NAS!"
echo ""
echo "Zugriff von jedem Gerät im Netzwerk:"
echo "--------------------------------------"
echo "📊 Strapi Admin:    http://$NAS_IP:1337/admin"
echo "🎨 Admin Portal:    http://$NAS_IP:8080"
echo "📚 Katalog:         http://$NAS_IP:8081"
echo "🗄️ Datenbank:       $NAS_IP:5432"
echo ""
echo "Erste Schritte:"
echo "---------------"
echo "1. Öffne http://$NAS_IP:1337/admin"
echo "2. Erstelle Admin-Account:"
echo "   Email: admin@museum.local"
echo "   Passwort: Sicheres Passwort wählen!"
echo "3. Lege erstes Exponat an"
echo ""
echo "Monitoring:"
echo "-----------"
echo "SSH zum NAS: ssh $NAS_USER@$NAS_IP"
echo "Logs: docker logs museum-backend"
echo "Status: docker ps"
echo ""
echo "Support-Befehle:"
echo "----------------"
echo "Neustart: docker restart museum-backend"
echo "Logs: docker logs -f museum-backend"
echo "Shell: docker exec -it museum-backend sh"
echo ""
echo "========================================="