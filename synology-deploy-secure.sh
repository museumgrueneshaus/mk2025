#!/bin/bash

# ================================================
# Museum Kiosk - Synology NAS Deployment (SECURE)
# ================================================

# Konfiguration
NAS_IP="192.168.1.123"
NAS_USER="root"
DOCKER_PATH="/volume1/docker/museum-kiosk"

echo "========================================="
echo "Museum Kiosk - Synology NAS Deployment"
echo "========================================="
echo ""
echo "NAS IP: $NAS_IP"
echo "User: $NAS_USER"
echo "Ziel-Pfad: $DOCKER_PATH"
echo ""

# Farben für Output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# SICHERHEITSHINWEIS
echo -e "${RED}WICHTIG: Lösche dieses Script nach der Installation!${NC}"
echo -e "${RED}Es enthält sensible Daten!${NC}"
echo ""
read -p "Weiter? (j/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Jj]$ ]]; then
    exit 1
fi

# ================================================
# Direkte SSH-Befehle als root
# ================================================

echo -e "${YELLOW}Erstelle Verzeichnisstruktur auf NAS...${NC}"

# SSH-Befehl mit Passwort (sshpass installieren falls nötig)
# brew install hudochenkov/sshpass/sshpass (auf Mac)
# apt-get install sshpass (auf Linux)

# Alternative: SSH-Key Setup (empfohlen)
# ssh-copy-id root@192.168.1.123

# Manuelle Methode (sicherer):
echo -e "${YELLOW}Bitte melde dich manuell am NAS an:${NC}"
echo "ssh root@$NAS_IP"
echo ""
echo "Führe dann folgende Befehle aus:"
echo "================================================"

cat << 'EOFCOMMANDS'
# 1. Verzeichnisse erstellen
mkdir -p /volume1/docker/museum-kiosk
cd /volume1/docker/museum-kiosk
mkdir -p kiosk-backend admin-portal katalog-frontend backups postgres-data

# 2. Docker-Compose Datei erstellen
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: museum-postgres
    restart: always
    environment:
      POSTGRES_DB: museum
      POSTGRES_USER: museum
      POSTGRES_PASSWORD: MuseumDB2024!
    volumes:
      - ./postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - museum-net

  strapi:
    image: strapi/strapi:4
    container_name: museum-backend
    restart: always
    environment:
      NODE_ENV: production
      DATABASE_CLIENT: postgres
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_NAME: museum
      DATABASE_USERNAME: museum
      DATABASE_PASSWORD: MuseumDB2024!
      JWT_SECRET: jwtMuseum2024Secret
      ADMIN_JWT_SECRET: adminJwtMuseum2024
      APP_KEYS: key1,key2,key3,key4
    volumes:
      - ./kiosk-backend:/srv/app
    ports:
      - "1337:1337"
    networks:
      - museum-net
    depends_on:
      - postgres

  admin:
    image: nginx:alpine
    container_name: museum-admin
    restart: always
    volumes:
      - ./admin-portal:/usr/share/nginx/html:ro
    ports:
      - "8080:80"
    networks:
      - museum-net

  katalog:
    image: nginx:alpine
    container_name: museum-katalog
    restart: always
    volumes:
      - ./katalog-frontend:/usr/share/nginx/html:ro
    ports:
      - "8081:80"
    networks:
      - museum-net

networks:
  museum-net:
    driver: bridge
EOF

# 3. Admin Portal HTML erstellen
cat > admin-portal/index.html << 'EOF'
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Museum Admin</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 p-8">
    <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold mb-8">Museum Admin Portal</h1>
        <div class="bg-white rounded-lg shadow p-6 mb-4">
            <h2 class="text-xl font-semibold mb-4">Quick Links</h2>
            <a href="http://192.168.1.123:1337/admin" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Strapi Admin öffnen
            </a>
        </div>
        <div id="stats" class="grid grid-cols-3 gap-4">
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="font-semibold">Exponate</h3>
                <p class="text-2xl font-bold" id="count-exponate">0</p>
            </div>
        </div>
    </div>
    <script>
        // Stats laden
        fetch('http://192.168.1.123:1337/api/exponate')
            .then(r => r.json())
            .then(data => {
                document.getElementById('count-exponate').textContent = data.data?.length || 0;
            })
            .catch(e => console.log('Backend noch nicht bereit'));
    </script>
</body>
</html>
EOF

# 4. Katalog Frontend HTML erstellen
cat > katalog-frontend/index.html << 'EOF'
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Museum Katalog</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <div class="container mx-auto p-8">
        <h1 class="text-3xl font-bold mb-8">Museum Katalog</h1>
        <div id="loading">Lade Exponate...</div>
        <div id="grid" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"></div>
    </div>
    <script>
        const API = 'http://192.168.1.123:1337/api';
        
        async function loadExponate() {
            try {
                const res = await fetch(API + '/exponate?populate=*');
                const data = await res.json();
                const grid = document.getElementById('grid');
                document.getElementById('loading').style.display = 'none';
                
                if (data.data && data.data.length > 0) {
                    grid.innerHTML = data.data.map(item => `
                        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div class="p-4">
                                <h3 class="font-bold text-lg mb-2">${item.attributes.titel || 'Kein Titel'}</h3>
                                <p class="text-gray-600 text-sm">${item.attributes.kurzbeschreibung || ''}</p>
                                <div class="mt-3 text-xs text-gray-500">
                                    ${item.attributes.inventarnummer || ''}
                                </div>
                            </div>
                        </div>
                    `).join('');
                } else {
                    grid.innerHTML = '<p>Noch keine Exponate vorhanden.</p>';
                }
            } catch (error) {
                console.error('Fehler:', error);
                document.getElementById('loading').textContent = 'Fehler beim Laden. Backend läuft noch nicht.';
            }
        }
        
        // Nach 3 Sekunden laden (Backend braucht Zeit zum Starten)
        setTimeout(loadExponate, 3000);
        // Alle 10 Sekunden neu laden
        setInterval(loadExponate, 10000);
    </script>
</body>
</html>
EOF

# 5. Docker Container starten
docker-compose pull
docker-compose up -d

# 6. Status prüfen
sleep 5
docker-compose ps

echo ""
echo "================================================"
echo "Installation abgeschlossen!"
echo "================================================"
echo ""
echo "Zugriff:"
echo "- Strapi:  http://192.168.1.123:1337/admin"
echo "- Admin:   http://192.168.1.123:8080"
echo "- Katalog: http://192.168.1.123:8081"
echo ""
echo "Warte 60 Sekunden bis Strapi vollständig gestartet ist..."
echo "Dann öffne http://192.168.1.123:1337/admin und erstelle einen Admin-Account."
EOFCOMMANDS

echo "================================================"
echo ""

# ================================================
# Automatisches Setup-Script generieren
# ================================================

echo -e "${YELLOW}Erstelle automatisches Setup-Script...${NC}"

cat > auto-setup.sh << 'EOFAUTO'
#!/bin/bash
# Dieses Script auf dem NAS ausführen

cd /volume1/docker/museum-kiosk

# Warten bis Strapi bereit ist
echo "Warte auf Strapi Start..."
until curl -f http://localhost:1337/admin 2>/dev/null; do
    echo -n "."
    sleep 2
done
echo " Bereit!"

# Content-Type für Exponat erstellen (via Strapi CLI)
docker exec -it museum-backend sh -c "
npm run strapi generate:content-type exponat \
  inventarnummer:string \
  titel:string \
  kurzbeschreibung:text \
  beschreibung:richtext \
  jahr_von:integer \
  jahr_bis:integer
"

echo "Setup komplett!"
EOFAUTO

chmod +x auto-setup.sh

# ================================================
# Sicherheitshinweise
# ================================================

echo ""
echo -e "${RED}=========================================${NC}"
echo -e "${RED}WICHTIGE SICHERHEITSHINWEISE:${NC}"
echo -e "${RED}=========================================${NC}"
echo ""
echo "1. Ändere SOFORT das root-Passwort auf dem NAS!"
echo "   passwd"
echo ""
echo "2. Erstelle einen dedizierten Docker-User:"
echo "   adduser docker-admin"
echo "   usermod -aG docker docker-admin"
echo ""
echo "3. Deaktiviere root-SSH nach der Installation:"
echo "   In DSM: Systemsteuerung → Terminal & SNMP"
echo ""
echo "4. Aktiviere 2-Faktor-Authentifizierung"
echo ""
echo "5. Firewall-Regeln einrichten:"
echo "   - Nur Port 80/443 von außen"
echo "   - Interne Ports nur im LAN"
echo ""
echo -e "${YELLOW}Lösche dieses Script nach Verwendung:${NC}"
echo "rm synology-deploy-secure.sh"
echo ""

# ================================================
# Alternative: SSH-Key Setup (empfohlen)
# ================================================

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Empfehlung: SSH-Key Authentication${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Sicherer als Passwörter:"
echo ""
echo "1. SSH-Key generieren (auf deinem Computer):"
echo "   ssh-keygen -t ed25519 -C 'museum-admin'"
echo ""
echo "2. Key zum NAS kopieren:"
echo "   ssh-copy-id root@192.168.1.123"
echo ""
echo "3. Passwort-Login deaktivieren:"
echo "   In /etc/ssh/sshd_config:"
echo "   PasswordAuthentication no"
echo ""
echo "================================================"