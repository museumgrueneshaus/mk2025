# 🐳 Museum Kiosk via Synology Docker App

## Vorbereitung

1. **Öffne DSM** (Synology Web-Interface)
   - Browser: http://192.168.1.123:5000
   - Login mit deinem Synology-Account

2. **Docker App öffnen**
   - Hauptmenü → Docker
   - Falls nicht installiert: Paket-Zentrum → Docker installieren

---

## 📁 Schritt 1: Ordner-Struktur erstellen

### In DSM File Station:

1. **File Station öffnen**
2. Navigiere zu: `docker`
3. **Neuer Ordner:** `museum-kiosk`
4. Darin diese Unterordner erstellen:
   ```
   docker/museum-kiosk/
   ├── postgres-data/
   ├── strapi-data/
   ├── admin-portal/
   ├── katalog-frontend/
   └── uploads/
   ```

---

## 🗄️ Schritt 2: PostgreSQL Datenbank

### In Docker App:

1. **Registry** → Suche: `postgres`
2. Wähle: `postgres:15-alpine`
3. **Download** (neueste Version)
4. Nach Download → **Image** → `postgres:15-alpine` → **Starten**

### Container-Einstellungen:

#### Allgemein:
- **Container-Name:** `museum-postgres`
- ✅ **Automatisch neu starten**

#### Erweiterte Einstellungen:
- ✅ **Auto-Neustart aktivieren**

#### Volume:
| Ordner/Datei | Mount-Pfad | Beschreibung |
|--------------|------------|--------------|
| `docker/museum-kiosk/postgres-data` | `/var/lib/postgresql/data` | Datenbank-Speicher |

#### Netzwerk:
- **Netzwerk:** bridge (standard)

#### Port-Einstellungen:
| Container-Port | Host-Port |
|----------------|-----------|
| 5432 | 5432 |

#### Umgebungsvariablen:
| Variable | Wert |
|----------|------|
| `POSTGRES_DB` | `museum` |
| `POSTGRES_USER` | `museum` |
| `POSTGRES_PASSWORD` | `MuseumDB2024` |

**→ Übernehmen → Weiter → Fertig**

---

## 🚀 Schritt 3: Strapi Backend

### Docker Registry:

1. **Registry** → Suche: `strapi`
2. Wähle: `strapi/strapi:4`
3. **Download**
4. **Image** → `strapi/strapi:4` → **Starten**

### Container-Einstellungen:

#### Allgemein:
- **Container-Name:** `museum-backend`
- ✅ **Automatisch neu starten**

#### Volume:
| Ordner | Mount-Pfad |
|--------|------------|
| `docker/museum-kiosk/strapi-data` | `/srv/app` |
| `docker/museum-kiosk/uploads` | `/srv/app/public/uploads` |

#### Port-Einstellungen:
| Container-Port | Host-Port |
|----------------|-----------|
| 1337 | 1337 |

#### Umgebungsvariablen:
```
NODE_ENV = production
HOST = 0.0.0.0
PORT = 1337

DATABASE_CLIENT = postgres
DATABASE_HOST = museum-postgres
DATABASE_PORT = 5432
DATABASE_NAME = museum
DATABASE_USERNAME = museum
DATABASE_PASSWORD = MuseumDB2024

JWT_SECRET = museumJWT2024secret
ADMIN_JWT_SECRET = adminJWT2024secret
APP_KEYS = key1,key2,key3,key4
API_TOKEN_SALT = apiSalt2024
TRANSFER_TOKEN_SALT = transferSalt2024
```

#### Links (wichtig!):
- **Container verknüpfen:** `museum-postgres:postgres`
  (Alias: postgres)

**→ Übernehmen → Weiter → Fertig**

---

## 🎨 Schritt 4: Admin Portal (Nginx)

### Erst HTML-Datei erstellen:

1. **File Station** → `docker/museum-kiosk/admin-portal/`
2. **Hochladen** → Neue Textdatei → `index.html`
3. Inhalt:

```html
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Museum Admin</title>
    <style>
        body { 
            font-family: Arial; 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        h1 { color: #333; }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        .stat {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .number { 
            font-size: 2em; 
            font-weight: bold;
            color: #4CAF50;
        }
        .button {
            display: inline-block;
            background: #4CAF50;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px;
        }
        .button:hover { background: #45a049; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏛️ Museum Admin Portal</h1>
        <p>Verwaltung der digitalen Sammlung</p>
    </div>
    
    <div class="stats">
        <div class="stat">
            <div class="number" id="exponate">0</div>
            <div>Exponate</div>
        </div>
        <div class="stat">
            <div class="number" id="status">⏳</div>
            <div>Status</div>
        </div>
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
        <a href="http://192.168.1.123:1337/admin" class="button">
            Strapi Admin öffnen
        </a>
        <a href="http://192.168.1.123:8081" class="button" style="background: #2196F3">
            Katalog anzeigen
        </a>
    </div>
    
    <script>
        // API Status prüfen
        fetch('http://192.168.1.123:1337/api/exponate')
            .then(r => r.json())
            .then(data => {
                document.getElementById('exponate').textContent = data.data?.length || 0;
                document.getElementById('status').textContent = '✅';
            })
            .catch(e => {
                document.getElementById('status').textContent = '⏳';
                setTimeout(() => location.reload(), 10000); // Retry nach 10s
            });
    </script>
</body>
</html>
```

### Docker Container:

1. **Registry** → Suche: `nginx`
2. Wähle: `nginx:alpine`
3. **Download** → **Starten**

#### Container-Einstellungen:
- **Name:** `museum-admin`
- **Volume:** `docker/museum-kiosk/admin-portal` → `/usr/share/nginx/html`
- **Port:** 80 → 8080
- ✅ **Auto-Neustart**

---

## 📚 Schritt 5: Katalog Frontend

### HTML erstellen:

1. **File Station** → `docker/museum-kiosk/katalog-frontend/`
2. Neue Datei: `index.html`
3. Inhalt:

```html
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Museum Katalog</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: Arial;
            background: #f0f0f0;
        }
        .header {
            background: #333;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .container {
            max-width: 1400px;
            margin: 20px auto;
            padding: 0 20px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        .card {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            transition: transform 0.3s;
        }
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .card-image {
            height: 200px;
            background: linear-gradient(45deg, #4CAF50, #2196F3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3em;
            color: white;
        }
        .card-body {
            padding: 15px;
        }
        .card-title {
            font-size: 1.2em;
            margin-bottom: 10px;
            color: #333;
        }
        .card-text {
            color: #666;
            font-size: 0.9em;
        }
        .loading {
            text-align: center;
            padding: 50px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏛️ Museum Digital</h1>
        <p>Unsere Sammlung online</p>
    </div>
    
    <div class="container">
        <div id="loading" class="loading">
            ⏳ Lade Exponate...
        </div>
        <div id="grid" class="grid" style="display: none;"></div>
    </div>
    
    <script>
        const API = 'http://192.168.1.123:1337/api';
        
        async function loadExponate() {
            try {
                const res = await fetch(API + '/exponate?populate=*');
                const data = await res.json();
                
                if (data.data && data.data.length > 0) {
                    const grid = document.getElementById('grid');
                    grid.innerHTML = data.data.map(item => {
                        const attr = item.attributes;
                        return `
                            <div class="card">
                                <div class="card-image">
                                    ${attr.hauptbild?.data ? 
                                      '🖼️' : '📷'}
                                </div>
                                <div class="card-body">
                                    <div class="card-title">
                                        ${attr.titel || 'Ohne Titel'}
                                    </div>
                                    <div class="card-text">
                                        ${attr.kurzbeschreibung || 'Keine Beschreibung'}
                                    </div>
                                    <div style="margin-top: 10px; font-size: 0.8em; color: #999;">
                                        ${attr.inventarnummer || ''}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('');
                    
                    document.getElementById('loading').style.display = 'none';
                    grid.style.display = 'grid';
                } else {
                    document.getElementById('loading').innerHTML = 
                        'Noch keine Exponate. Füge welche im Admin-Panel hinzu!';
                }
            } catch (e) {
                console.error(e);
                setTimeout(loadExponate, 5000); // Retry
            }
        }
        
        loadExponate();
        setInterval(loadExponate, 30000); // Refresh alle 30s
    </script>
</body>
</html>
```

### Docker Container:

1. Noch ein `nginx:alpine` Container
2. **Name:** `museum-katalog`
3. **Volume:** `docker/museum-kiosk/katalog-frontend` → `/usr/share/nginx/html`
4. **Port:** 80 → 8081

---

## ✅ Schritt 6: Container starten

### In Docker App:

1. **Container** → Übersicht
2. Starte in dieser Reihenfolge:
   1. `museum-postgres` (warte 30 Sekunden)
   2. `museum-backend` (warte 2-3 Minuten)
   3. `museum-admin`
   4. `museum-katalog`

---

## 🎯 Fertig! Zugriff:

Nach 2-3 Minuten erreichbar:

| Service | URL | Beschreibung |
|---------|-----|--------------|
| **Strapi Admin** | http://192.168.1.123:1337/admin | Backend-Verwaltung |
| **Admin Portal** | http://192.168.1.123:8080 | Einfache Übersicht |
| **Katalog** | http://192.168.1.123:8081 | Öffentliche Ansicht |

---

## 🔧 Tipps für Synology Docker App:

### Container-Verwaltung:
- **Logs anzeigen:** Container → Details → Log
- **Neustart:** Container → Rechtsklick → Neu starten
- **Terminal:** Container → Details → Terminal → Erstellen → bash

### Backup:
- **Einstellungen** → **Task-Planer** → Backup-Task für `/docker/museum-kiosk`

### Performance:
- **Ressourcen-Monitor** → Docker-Tab
- CPU/RAM-Limits in Container-Einstellungen

---

## 🚨 Troubleshooting:

### Strapi startet nicht?
1. Container → `museum-backend` → Details → Log
2. Meist: Datenbank noch nicht bereit → 2 Min warten → Neustart

### "Connection refused"?
- Firewall in DSM prüfen
- Container-Links überprüfen
- Ports in Container-Einstellungen

### Langsam?
- RAM-Limit erhöhen (Container → Bearbeiten → Ressourcen)
- Mindestens 512MB für Strapi

Das ist der einfachste Weg über die Synology GUI! Keine SSH nötig.