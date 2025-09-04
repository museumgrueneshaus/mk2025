#!/bin/bash

# ========================================
# Museum Kiosk - Synology NAS Setup
# Direkt auf NAS als root ausführen!
# ========================================

# Schritt 1: Verzeichnisse erstellen
echo "Erstelle Projektstruktur..."
cd /volume1
mkdir -p docker/museum-kiosk
cd docker/museum-kiosk

mkdir -p kiosk-backend
mkdir -p admin-portal  
mkdir -p katalog-frontend
mkdir -p postgres-data
mkdir -p backups

# Schritt 2: Docker-Compose erstellen
echo "Erstelle docker-compose.yml..."
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
      POSTGRES_PASSWORD: Museum2024DB
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
      DATABASE_PASSWORD: Museum2024DB
      JWT_SECRET: museumJWT2024secret
      ADMIN_JWT_SECRET: museumAdminJWT2024
      APP_KEYS: key1museum,key2museum,key3museum,key4museum
      HOST: 0.0.0.0
      PORT: 1337
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

# Schritt 3: Admin Portal HTML
echo "Erstelle Admin Portal..."
cat > admin-portal/index.html << 'EOF'
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Museum Admin Portal</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 40px;
            max-width: 800px;
            width: 100%;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 2.5em;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }
        .stat-label {
            color: #666;
            margin-top: 5px;
        }
        .btn {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 15px 30px;
            border-radius: 10px;
            text-decoration: none;
            font-weight: bold;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
            background: #764ba2;
        }
        .actions {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }
        .status {
            padding: 10px;
            background: #e8f5e9;
            color: #2e7d32;
            border-radius: 5px;
            margin-top: 20px;
        }
        .error {
            background: #ffebee;
            color: #c62828;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏛️ Museum Admin Portal</h1>
        <p class="subtitle">Verwaltung der digitalen Sammlung</p>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number" id="count-exponate">...</div>
                <div class="stat-label">Exponate</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="count-bilder">...</div>
                <div class="stat-label">Bilder</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="status">🔄</div>
                <div class="stat-label">Status</div>
            </div>
        </div>
        
        <div class="actions">
            <a href="http://192.168.1.123:1337/admin" class="btn">
                Strapi Admin öffnen
            </a>
            <a href="http://192.168.1.123:8081" class="btn" style="background: #764ba2">
                Katalog anzeigen
            </a>
        </div>
        
        <div id="status-message" class="status">
            Verbinde mit Backend...
        </div>
    </div>
    
    <script>
        const API = 'http://192.168.1.123:1337/api';
        
        async function loadStats() {
            try {
                const response = await fetch(API + '/exponate?populate=*');
                if (response.ok) {
                    const data = await response.json();
                    document.getElementById('count-exponate').textContent = data.data?.length || 0;
                    document.getElementById('count-bilder').textContent = 
                        data.data?.reduce((acc, item) => acc + (item.attributes.bilder?.data?.length || 0), 0) || 0;
                    document.getElementById('status').textContent = '✅';
                    document.getElementById('status-message').textContent = 'Backend läuft!';
                    document.getElementById('status-message').classList.remove('error');
                }
            } catch (error) {
                document.getElementById('count-exponate').textContent = '0';
                document.getElementById('count-bilder').textContent = '0';
                document.getElementById('status').textContent = '⏳';
                document.getElementById('status-message').textContent = 'Backend startet noch... (kann 2-3 Minuten dauern)';
                document.getElementById('status-message').classList.add('error');
            }
        }
        
        // Initial laden
        loadStats();
        // Alle 5 Sekunden aktualisieren
        setInterval(loadStats, 5000);
    </script>
</body>
</html>
EOF

# Schritt 4: Katalog Frontend
echo "Erstelle Katalog Frontend..."
cat > katalog-frontend/index.html << 'EOF'
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Museum Katalog</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f5f5f5;
        }
        .header {
            background: white;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .header h1 {
            color: #333;
            margin-bottom: 10px;
        }
        .search {
            padding: 10px 20px;
            border: 2px solid #e0e0e0;
            border-radius: 25px;
            width: 100%;
            max-width: 400px;
            font-size: 16px;
        }
        .container {
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .card {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.2s, box-shadow 0.2s;
            cursor: pointer;
        }
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        }
        .card-image {
            width: 100%;
            height: 200px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 3em;
        }
        .card-content {
            padding: 20px;
        }
        .card-title {
            font-size: 1.2em;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        .card-description {
            color: #666;
            line-height: 1.5;
            margin-bottom: 10px;
        }
        .card-meta {
            color: #999;
            font-size: 0.9em;
        }
        .loading {
            text-align: center;
            padding: 50px;
            color: #666;
        }
        .empty {
            text-align: center;
            padding: 50px;
            color: #999;
        }
        .modal {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.8);
            z-index: 1000;
            padding: 20px;
        }
        .modal-content {
            background: white;
            max-width: 800px;
            margin: 50px auto;
            border-radius: 10px;
            padding: 30px;
            max-height: 80vh;
            overflow-y: auto;
        }
        .modal-close {
            float: right;
            font-size: 30px;
            cursor: pointer;
            color: #999;
        }
        .modal-close:hover {
            color: #333;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏛️ Museum Katalog</h1>
        <input type="text" class="search" placeholder="Suchen..." id="search">
    </div>
    
    <div class="container">
        <div id="loading" class="loading">
            <div>⏳ Lade Exponate...</div>
            <small>Das Backend braucht beim ersten Start 2-3 Minuten</small>
        </div>
        <div id="grid" class="grid" style="display: none;"></div>
        <div id="empty" class="empty" style="display: none;">
            <h2>Noch keine Exponate vorhanden</h2>
            <p>Füge Exponate über das Admin-Panel hinzu</p>
        </div>
    </div>
    
    <div id="modal" class="modal">
        <div class="modal-content">
            <span class="modal-close" onclick="closeModal()">&times;</span>
            <h2 id="modal-title"></h2>
            <p id="modal-description"></p>
            <div id="modal-details"></div>
        </div>
    </div>
    
    <script>
        const API = 'http://192.168.1.123:1337/api';
        let allExponate = [];
        
        async function loadExponate() {
            try {
                const response = await fetch(API + '/exponate?populate=*');
                if (response.ok) {
                    const data = await response.json();
                    allExponate = data.data || [];
                    displayExponate(allExponate);
                    document.getElementById('loading').style.display = 'none';
                    
                    if (allExponate.length > 0) {
                        document.getElementById('grid').style.display = 'grid';
                        document.getElementById('empty').style.display = 'none';
                    } else {
                        document.getElementById('grid').style.display = 'none';
                        document.getElementById('empty').style.display = 'block';
                    }
                }
            } catch (error) {
                console.error('Fehler:', error);
                setTimeout(loadExponate, 5000); // Retry nach 5 Sekunden
            }
        }
        
        function displayExponate(exponate) {
            const grid = document.getElementById('grid');
            grid.innerHTML = exponate.map((item, index) => {
                const attr = item.attributes;
                return `
                    <div class="card" onclick="showDetail(${index})">
                        <div class="card-image">
                            ${attr.hauptbild?.data ? 
                              `<img src="${attr.hauptbild.data.attributes.url}" style="width:100%; height:100%; object-fit:cover;">` : 
                              '📷'}
                        </div>
                        <div class="card-content">
                            <div class="card-title">${attr.titel || 'Ohne Titel'}</div>
                            <div class="card-description">${attr.kurzbeschreibung || ''}</div>
                            <div class="card-meta">
                                ${attr.inventarnummer ? `Nr: ${attr.inventarnummer}` : ''}
                                ${attr.jahr_von ? ` | Jahr: ${attr.jahr_von}` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        function showDetail(index) {
            const item = allExponate[index].attributes;
            document.getElementById('modal-title').textContent = item.titel || 'Ohne Titel';
            document.getElementById('modal-description').innerHTML = item.beschreibung || item.kurzbeschreibung || 'Keine Beschreibung';
            document.getElementById('modal-details').innerHTML = `
                <p><strong>Inventarnummer:</strong> ${item.inventarnummer || '-'}</p>
                <p><strong>Jahr:</strong> ${item.jahr_von || '-'}</p>
                <p><strong>Material:</strong> ${item.material || '-'}</p>
                <p><strong>Standort:</strong> ${item.standort || '-'}</p>
            `;
            document.getElementById('modal').style.display = 'block';
        }
        
        function closeModal() {
            document.getElementById('modal').style.display = 'none';
        }
        
        // Suche
        document.getElementById('search').addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allExponate.filter(item => {
                const attr = item.attributes;
                return (attr.titel?.toLowerCase().includes(term) ||
                        attr.kurzbeschreibung?.toLowerCase().includes(term) ||
                        attr.inventarnummer?.toLowerCase().includes(term));
            });
            displayExponate(filtered);
        });
        
        // ESC zum Schließen
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
        
        // Initial laden
        loadExponate();
        
        // Alle 10 Sekunden neu laden (für Demo)
        setInterval(loadExponate, 10000);
    </script>
</body>
</html>
EOF

# Schritt 5: Docker Container starten
echo "Starte Docker Container..."
docker-compose pull
docker-compose up -d

# Schritt 6: Warten und Status prüfen
echo "Warte 30 Sekunden..."
sleep 30

echo "Status der Container:"
docker-compose ps

echo ""
echo "================================================"
echo "✅ Installation abgeschlossen!"
echo "================================================"
echo ""
echo "Zugriff vom Browser (auf jedem Gerät im Netzwerk):"
echo ""
echo "📊 Strapi Admin:    http://192.168.1.123:1337/admin"
echo "🎨 Admin Portal:    http://192.168.1.123:8080"
echo "📚 Katalog:         http://192.168.1.123:8081"
echo ""
echo "Erste Schritte:"
echo "1. Öffne http://192.168.1.123:1337/admin"
echo "2. Erstelle einen Admin-Account"
echo "3. Lege dein erstes Exponat an"
echo ""
echo "Logs anzeigen:"
echo "docker logs museum-backend"
echo ""
echo "Bei Problemen:"
echo "docker-compose down"
echo "docker-compose up -d"
echo ""