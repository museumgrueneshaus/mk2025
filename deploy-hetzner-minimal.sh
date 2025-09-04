#!/bin/bash

# ========================================
# Museum Kiosk - Hetzner Minimal Setup (20-30€/Monat)
# Backend + PostgreSQL auf Hetzner Cloud
# Frontend auf Netlify (kostenlos)
# ========================================

set -e

echo "========================================="
echo "Museum Kiosk - Kostenoptimiertes Hetzner Setup"
echo "========================================="
echo ""
echo "Empfohlener Server: Hetzner Cloud CX21 (4.15€/Monat)"
echo "  - 2 vCPU, 4GB RAM, 40GB SSD"
echo "  - Reicht für Backend + DB + MQTT"
echo ""

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${YELLOW}→ $1${NC}"; }

# Konfiguration
read -p "Server IP-Adresse: " SERVER_IP
read -p "Domain (optional, Enter für IP): " DOMAIN
SERVER_URL=${DOMAIN:-$SERVER_IP}

# Sichere Passwörter generieren
generate_password() {
    openssl rand -base64 16 | tr -d "=+/"
}

DB_PASSWORD=$(generate_password)
JWT_SECRET=$(generate_password)
ADMIN_JWT_SECRET=$(generate_password)
API_TOKEN=$(generate_password)
ADMIN_PASSWORD=$(generate_password)

# ========================================
# 1. System vorbereiten (Ubuntu 22.04)
# ========================================
print_info "Aktualisiere System..."
sudo apt update && sudo apt upgrade -y

print_info "Installiere Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
rm get-docker.sh

print_info "Installiere Docker Compose..."
sudo apt install -y docker-compose

# ========================================
# 2. Swap für kleine Server (wichtig!)
# ========================================
print_info "Erstelle Swap-Datei (2GB)..."
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
print_success "Swap aktiviert"

# ========================================
# 3. Firewall konfigurieren
# ========================================
print_info "Konfiguriere Firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 1337/tcp # Strapi
sudo ufw --force enable
print_success "Firewall aktiv"

# ========================================
# 4. Projekt-Verzeichnis
# ========================================
mkdir -p ~/museum-kiosk
cd ~/museum-kiosk

# ========================================
# 5. Optimierte Docker Compose (ressourcenschonend)
# ========================================
print_info "Erstelle Docker Compose..."
cat > docker-compose.yml << 'EOL'
version: '3.8'

services:
  # PostgreSQL mit Ressourcen-Limits
  postgres:
    image: postgres:15-alpine
    container_name: museum-db
    restart: always
    environment:
      POSTGRES_DB: strapi
      POSTGRES_USER: strapi
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      # Performance-Tuning für kleine Server
      POSTGRES_SHARED_BUFFERS: 256MB
      POSTGRES_EFFECTIVE_CACHE_SIZE: 1GB
      POSTGRES_MAINTENANCE_WORK_MEM: 64MB
      POSTGRES_WORK_MEM: 4MB
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    # Ressourcen-Limits
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          memory: 256M
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "strapi"]
      interval: 30s
      timeout: 5s
      retries: 3
    networks:
      - museum-net

  # Strapi Backend (optimiert)
  strapi:
    image: node:18-alpine
    container_name: museum-backend
    restart: always
    working_dir: /app
    command: sh -c "npm ci --production && npm run build && npm start"
    environment:
      NODE_ENV: production
      DATABASE_CLIENT: postgres
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_NAME: strapi
      DATABASE_USERNAME: strapi
      DATABASE_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      ADMIN_JWT_SECRET: ${ADMIN_JWT_SECRET}
      APP_KEYS: ${API_TOKEN},${JWT_SECRET}
      API_TOKEN_SALT: ${API_TOKEN}
      TRANSFER_TOKEN_SALT: ${API_TOKEN}
      # Performance
      NODE_OPTIONS: "--max-old-space-size=1024"
    volumes:
      - ./kiosk-backend:/app
      - strapi_uploads:/app/public/uploads
      - strapi_cache:/app/.cache
      - strapi_node_modules:/app/node_modules
    ports:
      - "1337:1337"
    # Ressourcen-Limits
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1536M
        reservations:
          memory: 512M
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - museum-net

  # Nginx als Reverse Proxy (sehr leicht)
  nginx:
    image: nginx:alpine
    container_name: museum-proxy
    restart: always
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl
    ports:
      - "80:80"
      - "443:443"
    deploy:
      resources:
        limits:
          cpus: '0.25'
          memory: 64M
    networks:
      - museum-net
    depends_on:
      - strapi

networks:
  museum-net:
    driver: bridge

volumes:
  postgres_data:
    driver: local
  strapi_uploads:
    driver: local
  strapi_cache:
    driver: local
  strapi_node_modules:
    driver: local
EOL

# ========================================
# 6. Nginx Konfiguration mit Caching
# ========================================
print_info "Konfiguriere Nginx mit Caching..."
cat > nginx.conf << 'EOL'
events {
    worker_connections 1024;
}

http {
    # Caching für bessere Performance
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;
    proxy_cache_key "$scheme$request_method$host$request_uri";
    
    # Gzip Kompression
    gzip on;
    gzip_types text/plain application/json application/javascript text/css;
    
    # Rate Limiting zum Schutz
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    upstream strapi {
        server strapi:1337;
    }
    
    server {
        listen 80;
        server_name _;
        
        # API mit Caching
        location /api {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://strapi;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            
            # Cache für GET Requests
            proxy_cache api_cache;
            proxy_cache_valid 200 5m;
            proxy_cache_valid 404 1m;
            proxy_cache_use_stale error timeout updating;
            
            # CORS Headers
            add_header Access-Control-Allow-Origin "*";
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range";
        }
        
        # Admin Panel
        location /admin {
            proxy_pass http://strapi;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
        
        # Uploads
        location /uploads {
            proxy_pass http://strapi;
            proxy_cache api_cache;
            proxy_cache_valid 200 30d;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
        
        # Health Check
        location /health {
            access_log off;
            return 200 "OK";
            add_header Content-Type text/plain;
        }
    }
}
EOL

# ========================================
# 7. Environment Datei
# ========================================
print_info "Erstelle .env Datei..."
cat > .env << EOL
# Datenbank
DB_PASSWORD=${DB_PASSWORD}

# Strapi
JWT_SECRET=${JWT_SECRET}
ADMIN_JWT_SECRET=${ADMIN_JWT_SECRET}
API_TOKEN=${API_TOKEN}

# Admin
ADMIN_EMAIL=admin@museum.local
ADMIN_PASSWORD=${ADMIN_PASSWORD}

# Server
SERVER_URL=http://${SERVER_URL}
EOL

# ========================================
# 8. Automatisches Backup-Script
# ========================================
print_info "Erstelle Backup-Script..."
cat > backup.sh << 'EOL'
#!/bin/bash
# Tägliches Backup mit Rotation (7 Tage)

BACKUP_DIR="/home/$USER/museum-kiosk/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Datenbank-Backup
docker exec museum-db pg_dump -U strapi strapi | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Uploads-Backup
docker run --rm -v museum-kiosk_strapi_uploads:/data -v $BACKUP_DIR:/backup \
    alpine tar czf /backup/uploads_$DATE.tar.gz -C /data .

# Alte Backups löschen (älter als 7 Tage)
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOL
chmod +x backup.sh

# Cron-Job für tägliches Backup
(crontab -l 2>/dev/null; echo "0 2 * * * /home/$USER/museum-kiosk/backup.sh") | crontab -

# ========================================
# 9. Health-Check & Auto-Restart Script
# ========================================
print_info "Erstelle Health-Check Script..."
cat > health-check.sh << 'EOL'
#!/bin/bash
# Prüft Services und startet sie neu wenn nötig

check_service() {
    SERVICE=$1
    if ! docker ps | grep -q $SERVICE; then
        echo "$(date): $SERVICE ist down, starte neu..."
        docker-compose up -d $SERVICE
        echo "$(date): $SERVICE neugestartet" >> /var/log/museum-health.log
    fi
}

# Prüfe alle Services
check_service "museum-db"
check_service "museum-backend"
check_service "museum-proxy"

# Prüfe API-Verfügbarkeit
if ! curl -f http://localhost/api/exponate > /dev/null 2>&1; then
    echo "$(date): API antwortet nicht, starte Backend neu..."
    docker-compose restart strapi
    echo "$(date): Backend neugestartet" >> /var/log/museum-health.log
fi
EOL
chmod +x health-check.sh

# Cron-Job für Health-Check alle 5 Minuten
(crontab -l 2>/dev/null; echo "*/5 * * * * /home/$USER/museum-kiosk/health-check.sh") | crontab -

# ========================================
# 10. Monitoring Script
# ========================================
print_info "Erstelle Monitoring Script..."
cat > monitor.sh << 'EOL'
#!/bin/bash
clear
echo "==================================="
echo "Museum Kiosk System - Monitor"
echo "==================================="
echo ""
echo "SERVICES:"
docker-compose ps
echo ""
echo "RESSOURCEN:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
echo ""
echo "SPEICHER:"
df -h | grep -E "(^Filesystem|^/dev/)"
echo ""
echo "NETZWERK:"
netstat -tuln | grep -E "(1337|80|443)"
echo ""
echo "LETZTE LOGS:"
docker-compose logs --tail=10 strapi 2>/dev/null | grep -E "(error|Error|ERROR)" || echo "Keine Fehler"
EOL
chmod +x monitor.sh

# ========================================
# 11. Update Script für Frontend-URL
# ========================================
print_info "Erstelle Frontend-Update Script..."
cat > update-frontend-url.sh << 'EOL'
#!/bin/bash
# Aktualisiert die Frontend-URL in der Konfiguration

read -p "Neue Netlify URL: " NETLIFY_URL

# Update CORS in Strapi
cat > kiosk-backend/config/middlewares.ts << EOF
export default [
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      origin: ['${NETLIFY_URL}', 'http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization'],
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
EOF

docker-compose restart strapi
echo "Frontend URL aktualisiert!"
EOL
chmod +x update-frontend-url.sh

# ========================================
# 12. Services starten
# ========================================
print_info "Starte Services..."
docker-compose up -d

print_info "Warte auf Service-Start..."
sleep 30

# ========================================
# 13. Ausgabe der Zugangsdaten
# ========================================
clear
echo "========================================="
echo -e "${GREEN}✓ Installation erfolgreich!${NC}"
echo "========================================="
echo ""
echo "ZUGANGSDATEN (WICHTIG - NOTIEREN!):"
echo "-----------------------------------"
echo "Strapi Admin: http://${SERVER_URL}:1337/admin"
echo "  Email: admin@museum.local"
echo "  Pass:  ${ADMIN_PASSWORD}"
echo ""
echo "API-Endpoint: http://${SERVER_URL}/api"
echo ""
echo "WICHTIGE BEFEHLE:"
echo "-----------------"
echo "Status:      docker-compose ps"
echo "Logs:        docker-compose logs -f"
echo "Monitor:     ./monitor.sh"
echo "Backup:      ./backup.sh"
echo "Restart:     docker-compose restart"
echo ""
echo "NÄCHSTE SCHRITTE:"
echo "-----------------"
echo "1. Frontend auf Netlify deployen"
echo "2. In frontend-kiosk/app.js API_BASE_URL anpassen:"
echo "   const API_BASE_URL = 'http://${SERVER_URL}/api';"
echo "3. ./update-frontend-url.sh ausführen für CORS"
echo ""
echo "KOSTEN:"
echo "-------"
echo "Hetzner CX21: 4.15€/Monat"
echo "Netlify Free: 0€/Monat"
echo "Gesamt:       4.15€/Monat"
echo ""
echo "Alle Passwörter sind in .env gespeichert!"
echo "========================================="