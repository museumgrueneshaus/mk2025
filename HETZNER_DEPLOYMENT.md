# Museum Kiosk - Hetzner Deployment Guide

## 💰 Kostenübersicht (unter 30€/Monat)

| Service | Anbieter | Kosten/Monat |
|---------|----------|--------------|
| Backend + DB | Hetzner Cloud CX21 | 4.15€ |
| Frontend | Netlify Free | 0€ |
| MQTT | Selbstgehostet | 0€ |
| **GESAMT** | | **4.15€** |

## 🏗️ Architektur

```
┌─────────────────────┐         ┌─────────────────────┐
│   Netlify (Free)    │         │  Hetzner CX21       │
│   - Frontend        │ ───────►│  - Strapi Backend   │
│   - Static Files    │   API   │  - PostgreSQL       │
└─────────────────────┘         │  - Nginx Proxy      │
                                └─────────────────────┘
                                          │
                                          ▼
                                   ┌──────────────┐
                                   │ Raspberry Pi │
                                   │   Kiosks     │
                                   └──────────────┘
```

## 🚀 Schnell-Installation

### 1. Hetzner Cloud Server erstellen

1. Account bei [Hetzner Cloud](https://www.hetzner.com/cloud) erstellen
2. Neuen Server erstellen:
   - **Typ**: CX21 (2 vCPU, 4GB RAM, 40GB SSD)
   - **OS**: Ubuntu 22.04
   - **Standort**: Nürnberg oder Falkenstein
   - **SSH-Key**: Hochladen oder erstellen

### 2. Server Setup ausführen

```bash
# Mit Server verbinden
ssh root@<SERVER-IP>

# Deployment-Script herunterladen
wget https://raw.githubusercontent.com/YOUR-REPO/main/deploy-hetzner-minimal.sh
chmod +x deploy-hetzner-minimal.sh

# Installation starten
./deploy-hetzner-minimal.sh
```

### 3. Frontend auf Netlify deployen

1. GitHub Repository für Frontend erstellen
2. In `frontend-kiosk/app.js` anpassen:
```javascript
const API_BASE_URL = 'http://YOUR-SERVER-IP/api';
```
3. Zu GitHub pushen
4. Netlify Account erstellen und mit GitHub verbinden
5. Auto-Deploy aktivieren

## 🔧 Konfiguration

### Backend-Zugriff

- **Admin Panel**: `http://SERVER-IP:1337/admin`
- **API**: `http://SERVER-IP/api`

### Erste Schritte im Admin Panel

1. Mit generierten Zugangsdaten einloggen
2. Content-Types sind bereits angelegt:
   - **Exponate**: Museum-Objekte
   - **Kiosks**: Terminal-Konfigurationen
   - **Konfiguration**: Globale Einstellungen

### Kiosk einrichten

1. Neuen Kiosk in Strapi anlegen
2. MAC-Adresse des Raspberry Pi eingeben
3. Modus wählen (Explorer, Slideshow, etc.)
4. Inhalte zuweisen

## 🛡️ Resilienz-Features

### Automatische Backups
- Tägliche Backups um 2 Uhr nachts
- 7 Tage Aufbewahrung
- Datenbank + Uploads

### Health-Checks
- Alle 5 Minuten Prüfung
- Automatischer Neustart bei Ausfall
- Log-Datei unter `/var/log/museum-health.log`

### Ressourcen-Management
- Docker Memory Limits
- Swap-Space (2GB)
- Nginx Caching

## 📊 Monitoring

```bash
# Live-Monitoring
./monitor.sh

# Docker Status
docker-compose ps

# Logs anzeigen
docker-compose logs -f strapi

# Ressourcen-Verbrauch
docker stats
```

## 🔄 Wartung

### Updates

```bash
# Backend updaten
cd ~/museum-kiosk
git pull
docker-compose build strapi
docker-compose up -d

# System-Updates
apt update && apt upgrade -y
```

### Backup wiederherstellen

```bash
# Letztes Backup finden
ls -la backups/

# Datenbank wiederherstellen
gunzip < backups/db_20240101_020000.sql.gz | \
  docker exec -i museum-db psql -U strapi strapi

# Uploads wiederherstellen
docker run --rm -v museum-kiosk_strapi_uploads:/data \
  -v $(pwd)/backups:/backup alpine \
  tar xzf /backup/uploads_20240101_020000.tar.gz -C /data
```

## 🚨 Troubleshooting

### API nicht erreichbar

```bash
# Services prüfen
docker-compose ps

# Strapi neustarten
docker-compose restart strapi

# Logs prüfen
docker-compose logs --tail=50 strapi
```

### Speicherplatz voll

```bash
# Docker aufräumen
docker system prune -a

# Alte Backups löschen
find backups/ -mtime +30 -delete

# Logs rotieren
docker-compose logs --no-color > logs_backup.txt
docker-compose down
docker-compose up -d
```

### Performance-Probleme

```bash
# Swap prüfen
free -h

# Prozesse prüfen
htop

# Docker Stats
docker stats

# Cache leeren
docker exec museum-proxy nginx -s reload
```

## 🔐 Sicherheit

### Firewall-Regeln

```bash
# Status prüfen
sudo ufw status

# Nur benötigte Ports:
# 22 (SSH), 80 (HTTP), 443 (HTTPS), 1337 (Strapi)
```

### SSL-Zertifikat (optional)

```bash
# Certbot installieren
apt install certbot python3-certbot-nginx

# Zertifikat erstellen
certbot --nginx -d your-domain.com
```

## 📞 Support-Kontakte

- **Hetzner Status**: https://status.hetzner.com
- **Hetzner Support**: 24/7 Ticket-System
- **Netlify Status**: https://www.netlifystatus.com

## 💡 Tipps

1. **Regelmäßige Backups** extern speichern (z.B. S3, Backblaze)
2. **Monitoring** mit Uptime Robot einrichten (kostenlos)
3. **CDN** für Bilder nutzen (Cloudflare free)
4. **Staging-Umgebung** auf lokalem Docker testen

## 📈 Skalierung

Bei Bedarf upgraden auf:
- **CX31**: 8.43€/Monat (2 vCPU, 8GB RAM)
- **CX41**: 16.85€/Monat (4 vCPU, 16GB RAM)

Upgrade ohne Downtime:
```bash
# Snapshot erstellen
# Neuen Server mit Snapshot erstellen
# DNS umstellen
```