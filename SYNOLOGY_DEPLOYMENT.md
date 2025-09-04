# 🎯 Museum Kiosk auf Synology NAS

## Vorteile Synology NAS:
- ✅ Läuft 24/7
- ✅ Automatische Backups
- ✅ Docker bereits installiert
- ✅ Im lokalen Netzwerk erreichbar
- ✅ Keine zusätzlichen Kosten

---

## 📋 Vorbereitung

### Was du brauchst:
- Synology NAS mit Docker (hast du ✓)
- IP: 192.168.1.123 (✓)
- SSH aktiviert (✓)
- 2GB RAM frei
- 10GB Speicherplatz

---

## 🚀 Installation via SSH

### 1️⃣ Mit NAS verbinden

```bash
# Von deinem Computer aus
ssh admin@192.168.1.123

# Oder mit deinem Synology-Benutzernamen
ssh dein-username@192.168.1.123
```

### 2️⃣ Projektordner erstellen

```bash
# Zu shared folder wechseln
cd /volume1/docker

# Museum-Kiosk Ordner erstellen
mkdir -p museum-kiosk
cd museum-kiosk

# Unterordner anlegen
mkdir -p kiosk-backend
mkdir -p admin-portal  
mkdir -p katalog-frontend
mkdir -p postgres-data
mkdir -p uploads
```

### 3️⃣ docker-compose.yml erstellen

```bash
# Docker Compose Datei erstellen
cat > docker-compose.yml << 'EOF'
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
      POSTGRES_PASSWORD: museum2024secure
    volumes:
      - ./postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - museum-network

  # Strapi Backend
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
      DATABASE_PASSWORD: museum2024secure
      JWT_SECRET: jwt-secret-museum-2024
      ADMIN_JWT_SECRET: admin-jwt-secret-museum-2024
      APP_KEYS: app-key-1,app-key-2,app-key-3,app-key-4
    volumes:
      - ./kiosk-backend:/srv/app
      - ./uploads:/srv/app/public/uploads
    ports:
      - "1337:1337"
    networks:
      - museum-network
    depends_on:
      - postgres

  # Admin Portal
  admin-portal:
    image: nginx:alpine
    container_name: museum-admin
    restart: always
    volumes:
      - ./admin-portal:/usr/share/nginx/html:ro
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
    ports:
      - "8081:80"
    networks:
      - museum-network

networks:
  museum-network:
    driver: bridge

volumes:
  postgres_data:
  strapi_uploads:
EOF
```

### 4️⃣ Frontend-Dateien kopieren

```bash
# Admin Portal files
cat > admin-portal/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Museum Admin</title>
    <meta charset="UTF-8">
</head>
<body>
    <h1>Museum Admin Portal</h1>
    <p>Verbinde mit Strapi: <a href="http://192.168.1.123:1337/admin">Admin Panel</a></p>
</body>
</html>
EOF

# Katalog Frontend
cat > katalog-frontend/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Museum Katalog</title>
    <meta charset="UTF-8">
</head>
<body>
    <h1>Museum Katalog</h1>
    <div id="app">Loading...</div>
    <script>
        const API_URL = 'http://192.168.1.123:1337/api';
        // Katalog JS hier
    </script>
</body>
</html>
EOF
```

### 5️⃣ Services starten

```bash
# Docker Compose starten
docker-compose up -d

# Status prüfen
docker-compose ps

# Logs anschauen
docker-compose logs -f
```

---

## 🖥️ Alternative: Synology Docker GUI

### Über DSM Web-Interface:

1. **Öffne DSM** → http://192.168.1.123:5000
2. **Package Center** → Docker öffnen
3. **Registry** → Images suchen:
   - postgres:15-alpine
   - strapi/strapi:4
   - nginx:alpine

4. **Container erstellen:**

#### PostgreSQL:
- Name: museum-postgres
- Port: 5432 → 5432
- Volume: /docker/museum-kiosk/postgres-data → /var/lib/postgresql/data
- Environment:
  - POSTGRES_DB=museum
  - POSTGRES_USER=museum
  - POSTGRES_PASSWORD=museum2024secure

#### Strapi:
- Name: museum-backend
- Port: 1337 → 1337
- Volume: /docker/museum-kiosk/uploads → /srv/app/public/uploads
- Environment: (siehe oben)
- Links: postgres:postgres

---

## 📱 Zugriff im Netzwerk

Nach erfolgreicher Installation:

### Von jedem Gerät im Netzwerk:

| Service | URL | Beschreibung |
|---------|-----|--------------|
| **Strapi Admin** | http://192.168.1.123:1337/admin | Backend-Verwaltung |
| **Admin Portal** | http://192.168.1.123:8080 | Exponat-Verwaltung |
| **Katalog** | http://192.168.1.123:8081 | Öffentlicher Katalog |
| **Datenbank** | 192.168.1.123:5432 | PostgreSQL |

### Erste Anmeldung Strapi:
1. http://192.168.1.123:1337/admin
2. Admin-Account erstellen
3. Email: admin@museum.local
4. Passwort: Sicheres Passwort wählen!

---

## 🔧 Synology-Spezifische Optimierungen

### Auto-Start aktivieren:
```bash
# In DSM Docker GUI
# Container → Einstellungen → "Automatisch neu starten" ✓
```

### Resource Limits setzen:
```bash
# docker-compose.yml erweitern
services:
  strapi:
    # ...
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          memory: 512M
```

### Backup einrichten:

#### Automatisches Backup (Synology):
1. **Control Panel** → **Task Scheduler**
2. **Create** → **User-defined script**
3. Schedule: Täglich 2:00 Uhr
4. Script:
```bash
#!/bin/bash
# Backup Museum Kiosk
BACKUP_DIR="/volume1/backups/museum-kiosk/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Database Backup
docker exec museum-postgres pg_dump -U museum museum | gzip > $BACKUP_DIR/database.sql.gz

# Uploads Backup
tar czf $BACKUP_DIR/uploads.tar.gz /volume1/docker/museum-kiosk/uploads

# Keep only 30 days
find /volume1/backups/museum-kiosk -type d -mtime +30 -exec rm -rf {} \;
```

---

## 🌐 Externe Erreichbarkeit (Optional)

### Für Internet-Zugriff:

#### Option 1: Synology QuickConnect
1. Control Panel → QuickConnect
2. Aktivieren und ID wählen
3. Zugriff: https://deine-id.quickconnect.to:1337

#### Option 2: Port Forwarding
1. Router: Port 1337 → 192.168.1.123:1337
2. DynDNS einrichten
3. SSL mit Let's Encrypt

#### Option 3: Reverse Proxy (Empfohlen)
```nginx
# In Synology: Application Portal → Reverse Proxy
Source: https://museum.deine-domain.de
Target: http://localhost:1337
```

---

## 📊 Monitoring

### Synology Resource Monitor:
- CPU-Auslastung der Container
- RAM-Verbrauch
- Netzwerk-Traffic
- Disk I/O

### Docker Logs:
```bash
# SSH verbinden
ssh admin@192.168.1.123

# Logs anschauen
docker logs museum-backend --tail 100
docker logs museum-postgres --tail 100
```

---

## 🚨 Troubleshooting

### Container startet nicht:
```bash
# Ports prüfen
netstat -tulpn | grep -E '1337|5432|8080'

# Container neu starten
docker restart museum-backend
docker restart museum-postgres

# Kompletter Neustart
docker-compose down
docker-compose up -d
```

### Speicherplatz voll:
```bash
# Docker aufräumen
docker system prune -a

# Alte Images löschen
docker image prune -a

# Volume-Größe prüfen
du -sh /volume1/docker/museum-kiosk/*
```

### Performance-Probleme:
```bash
# RAM-Zuweisung erhöhen in DSM
# Control Panel → Resource Monitor
# Docker CPU Priority erhöhen
```

---

## ✅ Test-Checkliste

Nach Installation:

- [ ] Strapi Admin erreichbar (192.168.1.123:1337/admin)
- [ ] Admin-Account erstellt
- [ ] Erstes Exponat angelegt
- [ ] Katalog zeigt Exponat (192.168.1.123:8081)
- [ ] Upload funktioniert
- [ ] Backup läuft
- [ ] Auto-Start aktiviert

---

## 🎯 Nächste Schritte

1. **Echte Daten importieren:**
```bash
# IMDAS Export hochladen
scp imdas-export.xml admin@192.168.1.123:/volume1/docker/museum-kiosk/
```

2. **Kiosk-Displays konfigurieren:**
- Raspberry Pi im Museum
- URL: http://192.168.1.123:8081
- Vollbild-Modus

3. **QR-Codes generieren:**
- Für jedes Exponat
- Link: http://192.168.1.123:8081/exponat/[ID]

---

## 💡 Vorteile Synology-Setup

| Aspekt | Vorteil |
|--------|---------|
| **Kosten** | 0€ zusätzlich (NAS läuft sowieso) |
| **Verfügbarkeit** | 24/7 ohne extra PC |
| **Backup** | Automatisch via Synology |
| **Updates** | Docker GUI macht's einfach |
| **Sicherheit** | Firewall + User-Management |
| **Performance** | Dedizierte Hardware |

---

## 🆘 Support

Bei Problemen:

1. **Synology Logs prüfen:**
   - DSM → Log Center
   - Filter: Docker

2. **Container-Status:**
   ```bash
   docker ps -a
   docker stats
   ```

3. **Neustart über DSM:**
   - Docker Package → Container → Restart

**Das Museum-System läuft jetzt auf deinem NAS! 🎉**