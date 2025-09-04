#!/bin/bash

# ========================================
# Museum Kiosk - Lokale Installation (ohne Docker)
# ========================================

echo "========================================="
echo "Museum Kiosk - Lokale Installation"
echo "========================================="

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# PostgreSQL prüfen
echo -e "${YELLOW}Prüfe PostgreSQL...${NC}"
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✓ PostgreSQL gefunden${NC}"
else
    echo -e "${YELLOW}PostgreSQL nicht gefunden. Installiere mit:${NC}"
    echo "brew install postgresql@15"
    echo "brew services start postgresql@15"
    echo ""
    read -p "PostgreSQL jetzt installieren? (j/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        brew install postgresql@15
        brew services start postgresql@15
    else
        echo "Nutze SQLite als Alternative..."
        USE_SQLITE=true
    fi
fi

# Datenbank erstellen
if [ -z "$USE_SQLITE" ]; then
    echo -e "${YELLOW}Erstelle PostgreSQL Datenbank...${NC}"
    createdb museum 2>/dev/null || echo "Datenbank existiert bereits"
fi

# Backend installieren
echo -e "${YELLOW}Installiere Strapi Backend...${NC}"
cd kiosk-backend

# Package.json erstellen falls nicht vorhanden
if [ ! -f package.json ]; then
    cat > package.json << 'EOF'
{
  "name": "museum-kiosk-backend",
  "version": "1.0.0",
  "scripts": {
    "develop": "strapi develop",
    "start": "strapi start",
    "build": "strapi build"
  },
  "dependencies": {
    "@strapi/strapi": "4.15.5",
    "@strapi/plugin-users-permissions": "4.15.5",
    "@strapi/plugin-i18n": "4.15.5",
    "better-sqlite3": "9.0.0",
    "pg": "8.11.3"
  }
}
EOF
fi

# Dependencies installieren
npm install

# .env erstellen
cat > .env << EOF
HOST=0.0.0.0
PORT=1337
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=token123
ADMIN_JWT_SECRET=admin123
TRANSFER_TOKEN_SALT=transfer123
JWT_SECRET=jwt123
DATABASE_CLIENT=${USE_SQLITE:+sqlite}${USE_SQLITE:-postgres}
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=museum
DATABASE_USERNAME=${USER}
DATABASE_PASSWORD=
EOF

# Strapi entwickeln
echo -e "${YELLOW}Starte Strapi Backend...${NC}"
npm run develop &
STRAPI_PID=$!

cd ..

# Frontend Server starten
echo -e "${YELLOW}Starte Frontend Server...${NC}"

# Python Simple HTTP Server für Admin Portal
cd admin-portal
python3 -m http.server 8080 &
ADMIN_PID=$!
cd ..

# Python Simple HTTP Server für Katalog
cd katalog-frontend
python3 -m http.server 8081 &
KATALOG_PID=$!
cd ..

# Warte auf Services
echo -e "${YELLOW}Warte auf Services...${NC}"
sleep 10

# Status
echo ""
echo "========================================="
echo -e "${GREEN}✓ Installation abgeschlossen!${NC}"
echo "========================================="
echo ""
echo "Zugriff:"
echo "--------"
echo "📊 Strapi Admin:    http://localhost:1337/admin"
echo "🎨 Admin Portal:    http://localhost:8080"
echo "📚 Katalog:         http://localhost:8081"
echo ""
echo "PIDs zum Stoppen:"
echo "-----------------"
echo "Strapi:  $STRAPI_PID"
echo "Admin:   $ADMIN_PID"  
echo "Katalog: $KATALOG_PID"
echo ""
echo "Zum Beenden:"
echo "kill $STRAPI_PID $ADMIN_PID $KATALOG_PID"
echo ""
echo "========================================="

# Services im Vordergrund halten
wait