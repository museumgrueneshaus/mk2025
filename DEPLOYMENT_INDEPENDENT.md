# Service-Independent Deployment Guide

## Übersicht

Diese Anleitung zeigt, wie Sie das Museum Kiosk System unabhängig von spezifischen Cloud-Diensten wie Render.com deployen können. Das System ist jetzt vollständig portabel und kann auf verschiedenen Plattformen betrieben werden.

## Deployment-Optionen

### 1. Docker Compose (Empfohlen)
**Vorteile:** Einfach, isoliert, reproduzierbar
**Geeignet für:** Lokale Entwicklung, VPS, Home-Server

```bash
# .env Datei erstellen und anpassen
cp .env.example .env

# Services starten
docker-compose up -d

# Logs anzeigen
docker-compose logs -f
```

**Zugriff:**
- Frontend: http://localhost
- Strapi Admin: http://localhost:1337/admin
- API: http://localhost:1337/api
- MQTT: mqtt://localhost:1883

### 2. Lokales Deployment
**Drei Optionen verfügbar:**

```bash
# Script ausführen
./deploy-local.sh

# Optionen:
# 1) Docker Compose - Vollständige Containerisierung
# 2) Docker Manual - Manuelle Container-Verwaltung  
# 3) Native - Node.js + PostgreSQL direkt
# 4) SQLite - Leichtgewichtig, einzelne Datei
```

### 3. VPS Deployment
**Für jeden Linux VPS (DigitalOcean, Linode, AWS EC2, Hetzner, etc.)**

```bash
# Ohne Domain (nur IP)
./deploy-vps.sh

# Mit Domain und SSL
./deploy-vps.sh example.com admin@example.com
```

**Features:**
- Automatische Docker Installation
- Nginx Reverse Proxy
- SSL mit Let's Encrypt (optional)
- Automatische Backups
- Firewall-Konfiguration

### 4. Eigener Server / Homelab

#### Option A: Mit Docker Compose
```bash
# Repository klonen
git clone <your-repo>
cd museum-kiosk

# Umgebungsvariablen konfigurieren
cp .env.example .env
nano .env

# Starten
docker-compose up -d
```

#### Option B: Systemd Service (Linux)
```bash
# Backend als Service installieren
sudo cp kiosk-backend.service /etc/systemd/system/
sudo systemctl enable kiosk-backend
sudo systemctl start kiosk-backend

# Frontend mit Nginx
sudo cp -r frontend-kiosk /var/www/
sudo cp nginx-site.conf /etc/nginx/sites-available/kiosk
sudo ln -s /etc/nginx/sites-available/kiosk /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

### 5. Kubernetes Deployment

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kiosk-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: kiosk-backend
  template:
    metadata:
      labels:
        app: kiosk-backend
    spec:
      containers:
      - name: strapi
        image: kiosk-backend:latest
        ports:
        - containerPort: 1337
        env:
        - name: DATABASE_CLIENT
          value: "postgres"
        - name: DATABASE_HOST
          value: "postgres-service"
```

## Datenbank-Optionen

### PostgreSQL (Produktion)
```env
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=secure-password
```

### MySQL/MariaDB
```env
DATABASE_CLIENT=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=secure-password
```

### SQLite (Entwicklung/Kleine Deployments)
```env
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
```

### MongoDB (Wenn bevorzugt)
```env
DATABASE_CLIENT=mongo
DATABASE_HOST=localhost
DATABASE_PORT=27017
DATABASE_NAME=strapi
```

## Media Storage Optionen

### 1. Lokaler Storage (Standard)
Dateien werden im `public/uploads` Ordner gespeichert.

### 2. Cloudinary (Optional)
```env
CLOUDINARY_NAME=your-cloud-name
CLOUDINARY_KEY=your-key
CLOUDINARY_SECRET=your-secret
```

### 3. AWS S3
```bash
npm install @strapi/provider-upload-aws-s3
```

```env
AWS_ACCESS_KEY_ID=your-key
AWS_ACCESS_SECRET=your-secret
AWS_REGION=eu-central-1
AWS_BUCKET=your-bucket
```

### 4. MinIO (Self-Hosted S3)
```bash
# MinIO in Docker Compose hinzufügen
services:
  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
```

## Monitoring & Wartung

### Health Checks
```bash
# Backend Status
curl http://localhost:1337/_health

# Database Status
docker-compose exec postgres pg_isready

# Container Status
docker-compose ps
```

### Backup-Strategie
```bash
# Automatisches Backup-Script
./backup.sh

# Manuelles Database Backup
docker-compose exec postgres pg_dump -U strapi strapi > backup.sql

# Media Backup
tar -czf uploads-backup.tar.gz ./public/uploads
```

### Updates
```bash
# Code Update
git pull

# Dependencies Update
cd kiosk-backend
npm update

# Docker Images Update
docker-compose pull
docker-compose up -d
```

## Sicherheit

### Firewall-Regeln
```bash
# Nur benötigte Ports öffnen
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw allow 1337/tcp # Strapi (nur wenn direkt erreichbar)
ufw allow 22/tcp   # SSH
```

### Environment Variables
- Niemals Secrets in Git committen
- `.env` Datei in `.gitignore` aufnehmen
- Starke, zufällige Passwörter verwenden
- Secrets regelmäßig rotieren

### SSL/TLS
- Für Produktion immer HTTPS verwenden
- Let's Encrypt für kostenlose Zertifikate
- Oder selbst-signierte Zertifikate für Intranet

## Performance-Optimierung

### Caching
```nginx
# Nginx Cache für statische Assets
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### Database Tuning
```sql
-- PostgreSQL Optimierungen
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
```

### CDN Integration (Optional)
- Cloudflare
- Fastly
- AWS CloudFront
- Selbst-gehostetes CDN mit Varnish

## Troubleshooting

### Container neustarten
```bash
docker-compose restart strapi
```

### Logs prüfen
```bash
docker-compose logs -f strapi
docker-compose logs -f postgres
```

### Database-Verbindung testen
```bash
docker-compose exec strapi npm run strapi console
> const db = strapi.db.connection
> db.raw('SELECT 1').then(console.log)
```

### Ports prüfen
```bash
netstat -tulpn | grep -E '(1337|5432|80)'
```

## Migration von Render.com

1. **Datenbank-Export:**
```bash
# Von Render PostgreSQL
pg_dump $RENDER_DATABASE_URL > render-backup.sql
```

2. **Import in neue Umgebung:**
```bash
# In lokale PostgreSQL
psql -U strapi -d strapi < render-backup.sql
```

3. **Media-Dateien:**
- Von Cloudinary herunterladen oder
- Upload-Ordner kopieren

4. **Environment anpassen:**
- DATABASE_URL entfernen
- Einzelne DB-Variablen verwenden

## Support-Matrix

| Platform | Docker | Native | Database | Storage |
|----------|--------|---------|----------|---------|
| Ubuntu/Debian | ✅ | ✅ | PostgreSQL, MySQL, SQLite | Lokal, S3, Cloudinary |
| CentOS/RHEL | ✅ | ✅ | PostgreSQL, MySQL, SQLite | Lokal, S3, Cloudinary |
| macOS | ✅ | ✅ | PostgreSQL, SQLite | Lokal, S3, Cloudinary |
| Windows | ✅ | ⚠️ | PostgreSQL, SQLite | Lokal, S3, Cloudinary |
| Raspberry Pi | ✅ | ✅ | SQLite | Lokal |
| VPS | ✅ | ✅ | PostgreSQL, MySQL | Lokal, S3, Cloudinary |
| Kubernetes | ✅ | - | PostgreSQL, MySQL | S3, Persistent Volumes |

## Zusammenfassung

Das System ist jetzt vollständig unabhängig von spezifischen Cloud-Diensten:

✅ **Flexibles Deployment:** Docker, Native, Kubernetes
✅ **Multiple Datenbanken:** PostgreSQL, MySQL, SQLite, MongoDB  
✅ **Verschiedene Storage-Optionen:** Lokal, S3, Cloudinary, MinIO
✅ **Selbst-hostbar:** VPS, Homelab, Raspberry Pi
✅ **Skalierbar:** Von SQLite bis Kubernetes Cluster

Wählen Sie die Option, die am besten zu Ihrer Infrastruktur und Ihren Anforderungen passt!