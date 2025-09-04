#!/bin/bash

# ========================================
# Museum Kiosk System - Hetzner Deployment
# Vollständig selbstgehostete Lösung ohne externe Services
# ========================================

set -e

echo "========================================="
echo "Museum Kiosk - Hetzner Server Setup"
echo "========================================="

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funktion für farbige Ausgaben
print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${YELLOW}→ $1${NC}"; }

# Domain/IP Configuration
read -p "Server Domain oder IP-Adresse: " SERVER_DOMAIN
read -p "SSL aktivieren? (j/n): " USE_SSL

# Generiere sichere Secrets
generate_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

print_info "Erstelle Projektverzeichnis..."
mkdir -p ~/museum-kiosk
cd ~/museum-kiosk

# ========================================
# 1. System-Vorbereitung
# ========================================
print_info "Aktualisiere System-Pakete..."
sudo apt update && sudo apt upgrade -y

print_info "Installiere benötigte Pakete..."
sudo apt install -y \
    docker.io \
    docker-compose \
    nginx \
    certbot \
    python3-certbot-nginx \
    git \
    ufw \
    htop \
    ncdu

# Docker-Berechtigungen
sudo usermod -aG docker $USER
print_success "Docker installiert"

# ========================================
# 2. Firewall-Konfiguration
# ========================================
print_info "Konfiguriere Firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 1883/tcp  # MQTT
sudo ufw allow 8883/tcp  # MQTT über TLS
sudo ufw --force enable
print_success "Firewall konfiguriert"

# ========================================
# 3. Environment-Datei erstellen
# ========================================
print_info "Erstelle Environment-Datei..."
cat > .env << EOL
# Server-Konfiguration
SERVER_DOMAIN=${SERVER_DOMAIN}
NODE_ENV=production

# Datenbank
DATABASE_CLIENT=postgres
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=$(generate_secret)
DATABASE_SSL=false

# Strapi Secrets
JWT_SECRET=$(generate_secret)
ADMIN_JWT_SECRET=$(generate_secret)
APP_KEYS=$(generate_secret),$(generate_secret),$(generate_secret),$(generate_secret)
API_TOKEN_SALT=$(generate_secret)
TRANSFER_TOKEN_SALT=$(generate_secret)

# Lokaler Datei-Upload (statt Cloudinary)
UPLOAD_PROVIDER=local
UPLOAD_PATH=./public/uploads

# MQTT (selbstgehostet)
MQTT_BROKER_HOST=mosquitto
MQTT_BROKER_PORT=1883
MQTT_USERNAME=museum
MQTT_PASSWORD=$(generate_secret)

# Admin-Zugang
STRAPI_ADMIN_EMAIL=admin@museum.local
STRAPI_ADMIN_PASSWORD=$(generate_secret)
EOL

print_success "Environment-Datei erstellt"
print_info "WICHTIG: Speichere die Passwörter aus .env!"

# ========================================
# 4. Docker Compose für Hetzner
# ========================================
print_info "Erstelle Docker Compose Konfiguration..."
cat > docker-compose.yml << 'EOL'
version: '3.8'

services:
  # PostgreSQL Datenbank
  postgres:
    image: postgres:15-alpine
    container_name: museum-postgres
    restart: always
    environment:
      POSTGRES_DB: ${DATABASE_NAME}
      POSTGRES_USER: ${DATABASE_USERNAME}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - museum-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DATABASE_USERNAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Strapi Backend (ohne Cloudinary)
  strapi:
    build: 
      context: ./kiosk-backend
      dockerfile: Dockerfile.hetzner
    container_name: museum-backend
    restart: always
    environment:
      DATABASE_CLIENT: ${DATABASE_CLIENT}
      DATABASE_HOST: ${DATABASE_HOST}
      DATABASE_PORT: ${DATABASE_PORT}
      DATABASE_NAME: ${DATABASE_NAME}
      DATABASE_USERNAME: ${DATABASE_USERNAME}
      DATABASE_PASSWORD: ${DATABASE_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      ADMIN_JWT_SECRET: ${ADMIN_JWT_SECRET}
      APP_KEYS: ${APP_KEYS}
      API_TOKEN_SALT: ${API_TOKEN_SALT}
      TRANSFER_TOKEN_SALT: ${TRANSFER_TOKEN_SALT}
      NODE_ENV: ${NODE_ENV}
    volumes:
      - strapi_uploads:/app/public/uploads
      - strapi_exports:/app/exports
    ports:
      - "1337:1337"
    networks:
      - museum-network
    depends_on:
      postgres:
        condition: service_healthy

  # Frontend (statisch)
  frontend:
    image: nginx:alpine
    container_name: museum-frontend
    restart: always
    volumes:
      - ./frontend-kiosk:/usr/share/nginx/html:ro
      - ./nginx-frontend.conf:/etc/nginx/conf.d/default.conf:ro
    ports:
      - "3000:80"
    networks:
      - museum-network

  # MQTT Broker (selbstgehostet statt HiveMQ)
  mosquitto:
    image: eclipse-mosquitto:2
    container_name: museum-mqtt
    restart: always
    volumes:
      - ./mosquitto/config:/mosquitto/config
      - ./mosquitto/data:/mosquitto/data
      - ./mosquitto/log:/mosquitto/log
    ports:
      - "1883:1883"
      - "8883:8883"
      - "9001:9001"
    networks:
      - museum-network

  # Backup-Service
  backup:
    image: postgres:15-alpine
    container_name: museum-backup
    volumes:
      - ./backups:/backups
      - ./backup-script.sh:/backup.sh:ro
    environment:
      PGPASSWORD: ${DATABASE_PASSWORD}
    command: /bin/sh -c "chmod +x /backup.sh && crond -f"
    networks:
      - museum-network
    depends_on:
      - postgres

networks:
  museum-network:
    driver: bridge

volumes:
  postgres_data:
  strapi_uploads:
  strapi_exports:
EOL

print_success "Docker Compose erstellt"

# ========================================
# 5. Strapi Dockerfile ohne Cloudinary
# ========================================
print_info "Erstelle angepasstes Strapi Dockerfile..."
cat > kiosk-backend/Dockerfile.hetzner << 'EOL'
FROM node:18-alpine

RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev

WORKDIR /app

# Kopiere Package-Dateien
COPY package*.json ./

# Installiere Dependencies (ohne Cloudinary)
RUN npm ci --only=production

# Kopiere Projekt-Dateien
COPY . .

# Build Strapi
RUN npm run build

# Erstelle Upload-Verzeichnis
RUN mkdir -p public/uploads

EXPOSE 1337

CMD ["npm", "run", "start"]
EOL

# ========================================
# 6. Lokale Upload-Konfiguration für Strapi
# ========================================
print_info "Konfiguriere lokalen Datei-Upload..."
cat > kiosk-backend/config/plugins.ts << 'EOL'
export default ({ env }) => ({
  upload: {
    config: {
      provider: 'local',
      providerOptions: {
        sizeLimit: 100 * 1024 * 1024, // 100MB
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});
EOL

# ========================================
# 7. MQTT Mosquitto Konfiguration
# ========================================
print_info "Konfiguriere MQTT Broker..."
mkdir -p mosquitto/config mosquitto/data mosquitto/log

cat > mosquitto/config/mosquitto.conf << 'EOL'
persistence true
persistence_location /mosquitto/data/

# Logs
log_dest file /mosquitto/log/mosquitto.log
log_type all

# Listener für lokale Verbindungen
listener 1883
protocol mqtt

# Listener für WebSocket (für Browser)
listener 9001
protocol websockets

# Authentifizierung
allow_anonymous false
password_file /mosquitto/config/pwfile

# ACL (Access Control List)
acl_file /mosquitto/config/aclfile
EOL

# MQTT Benutzer erstellen
cat > mosquitto/config/pwfile << EOL
museum:$(generate_secret)
EOL

# MQTT ACL
cat > mosquitto/config/aclfile << 'EOL'
# Museum Benutzer hat vollen Zugriff
user museum
topic readwrite #
EOL

# ========================================
# 8. Frontend-Konfiguration anpassen
# ========================================
print_info "Passe Frontend-Konfiguration an..."
cat > frontend-kiosk/config.js << EOL
// Automatisch generierte Konfiguration für Hetzner Server
const CONFIG = {
    API_BASE_URL: '${USE_SSL:+https}${USE_SSL:-http}://${SERVER_DOMAIN}/api',
    MQTT_BROKER_URL: 'ws://${SERVER_DOMAIN}:9001',
    MQTT_USERNAME: 'museum',
    MQTT_PASSWORD: '${MQTT_PASSWORD}'
};

export default CONFIG;
EOL

# ========================================
# 9. Nginx Reverse Proxy
# ========================================
print_info "Konfiguriere Nginx..."
sudo tee /etc/nginx/sites-available/museum-kiosk << EOL
server {
    listen 80;
    server_name ${SERVER_DOMAIN};

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Strapi API & Admin
    location /api {
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /admin {
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /uploads {
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }

    # WebSocket für MQTT
    location /mqtt {
        proxy_pass http://localhost:9001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
    }
}
EOL

sudo ln -sf /etc/nginx/sites-available/museum-kiosk /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
print_success "Nginx konfiguriert"

# ========================================
# 10. SSL mit Let's Encrypt (optional)
# ========================================
if [[ "$USE_SSL" == "j" ]]; then
    print_info "Installiere SSL-Zertifikat..."
    sudo certbot --nginx -d ${SERVER_DOMAIN} --non-interactive --agree-tos -m admin@${SERVER_DOMAIN}
    print_success "SSL-Zertifikat installiert"
fi

# ========================================
# 11. Backup-Script
# ========================================
print_info "Erstelle Backup-Script..."
cat > backup-script.sh << 'EOL'
#!/bin/sh
# Tägliches Backup um 2 Uhr nachts
echo "0 2 * * * pg_dump -h postgres -U ${DATABASE_USERNAME} ${DATABASE_NAME} > /backups/backup_\$(date +\%Y\%m\%d_\%H\%M\%S).sql" | crontab -
EOL

# ========================================
# 12. Monitoring-Script
# ========================================
print_info "Erstelle Monitoring-Script..."
cat > monitor.sh << 'EOL'
#!/bin/bash
# Einfaches Monitoring-Script

echo "=== System Status ==="
docker-compose ps

echo -e "\n=== Ressourcen ==="
docker stats --no-stream

echo -e "\n=== Logs (letzte 20 Zeilen) ==="
docker-compose logs --tail=20

echo -e "\n=== Disk Usage ==="
df -h | grep -E "^/dev/"
EOL
chmod +x monitor.sh

# ========================================
# 13. Deployment starten
# ========================================
print_info "Starte Services..."
docker-compose pull
docker-compose up -d

# Warte auf Strapi
print_info "Warte auf Strapi-Start (kann 2-3 Minuten dauern)..."
sleep 30

# ========================================
# Zusammenfassung
# ========================================
echo ""
echo "========================================="
echo -e "${GREEN}✓ Installation abgeschlossen!${NC}"
echo "========================================="
echo ""
echo "Zugriff:"
echo "  Frontend:    ${USE_SSL:+https}${USE_SSL:-http}://${SERVER_DOMAIN}"
echo "  Strapi Admin: ${USE_SSL:+https}${USE_SSL:-http}://${SERVER_DOMAIN}/admin"
echo "  API:         ${USE_SSL:+https}${USE_SSL:-http}://${SERVER_DOMAIN}/api"
echo ""
echo "Befehle:"
echo "  Status:      docker-compose ps"
echo "  Logs:        docker-compose logs -f"
echo "  Restart:     docker-compose restart"
echo "  Monitor:     ./monitor.sh"
echo ""
echo "WICHTIG: Speichere die Zugangsdaten aus .env!"
echo ""
print_info "Admin-Passwort und andere Secrets findest du in .env"