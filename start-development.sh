#!/bin/bash

# Museum Kiosk Development Environment Starter
echo "========================================="
echo "Museum Kiosk - Development Environment"
echo "========================================="

# Farben für Output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Docker ist nicht gestartet!${NC}"
    echo "Bitte starte Docker Desktop und versuche es erneut."
    exit 1
fi

# Create necessary directories
echo -e "${YELLOW}Erstelle notwendige Verzeichnisse...${NC}"
mkdir -p kiosk-backend/public/uploads
mkdir -p admin-portal
mkdir -p katalog-frontend
mkdir -p test-media/images
mkdir -p test-media/audio
mkdir -p test-media/videos
mkdir -p test-media/documents

# Create Nginx configs if they don't exist
if [ ! -f nginx-admin.conf ]; then
    echo -e "${YELLOW}Erstelle Nginx-Konfiguration für Admin Portal...${NC}"
    cat > nginx-admin.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://strapi:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
fi

if [ ! -f nginx-katalog.conf ]; then
    echo -e "${YELLOW}Erstelle Nginx-Konfiguration für Katalog...${NC}"
    cat > nginx-katalog.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
        add_header Access-Control-Allow-Origin *;
    }
}
EOF
fi

# Update API URLs in frontends
echo -e "${YELLOW}Aktualisiere API URLs...${NC}"

# Update Admin Portal
if [ -f admin-portal/admin.js ]; then
    sed -i.bak "s|http://localhost:1337/api|http://localhost:1337/api|g" admin-portal/admin.js
fi

# Update Katalog Frontend
if [ -f katalog-frontend/katalog.js ]; then
    sed -i.bak "s|http://localhost:1337/api|http://localhost:1337/api|g" katalog-frontend/katalog.js
fi

# Stop any running containers
echo -e "${YELLOW}Stoppe existierende Container...${NC}"
docker-compose -f docker-compose.development.yml down

# Start services
echo -e "${YELLOW}Starte Services...${NC}"
docker-compose -f docker-compose.development.yml up -d

# Wait for services to be ready
echo -e "${YELLOW}Warte auf Services...${NC}"
sleep 10

# Check if Strapi is running
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -f http://localhost:1337/admin > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Strapi ist bereit!${NC}"
        break
    fi
    echo -n "."
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}✗ Strapi konnte nicht gestartet werden${NC}"
    echo "Überprüfe die Logs mit: docker-compose -f docker-compose.development.yml logs strapi"
    exit 1
fi

# Display access information
echo ""
echo "========================================="
echo -e "${GREEN}✓ Development Environment läuft!${NC}"
echo "========================================="
echo ""
echo "Zugriff auf die Services:"
echo "------------------------"
echo "📊 Strapi Admin:    http://localhost:1337/admin"
echo "   Email:           admin@museum.local"
echo "   Passwort:        Museum2024!"
echo ""
echo "🎨 Admin Portal:    http://localhost:8080"
echo "📚 Katalog:         http://localhost:8081"
echo "🗄️ pgAdmin:         http://localhost:5050"
echo "   Email:           admin@museum.local"
echo "   Passwort:        admin"
echo ""
echo "📡 API Endpoints:"
echo "   Exponate:        http://localhost:1337/api/exponate"
echo "   Playlists:       http://localhost:1337/api/playlists"
echo "   Displays:        http://localhost:1337/api/displays"
echo ""
echo "Befehle:"
echo "--------"
echo "Logs anzeigen:      docker-compose -f docker-compose.development.yml logs -f"
echo "Services stoppen:   docker-compose -f docker-compose.development.yml down"
echo "Shell in Container: docker exec -it museum-backend-dev sh"
echo ""
echo "========================================="

# Optional: Open browser
if command -v open &> /dev/null; then
    echo ""
    read -p "Browser öffnen? (j/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        open http://localhost:1337/admin
        open http://localhost:8080
        open http://localhost:8081
    fi
elif command -v xdg-open &> /dev/null; then
    echo ""
    read -p "Browser öffnen? (j/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        xdg-open http://localhost:1337/admin
        xdg-open http://localhost:8080
        xdg-open http://localhost:8081
    fi
fi