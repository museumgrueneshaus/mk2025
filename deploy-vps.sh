#!/bin/bash

# VPS Deployment Script for Museum Kiosk System
# Supports any Linux VPS (DigitalOcean, Linode, AWS EC2, Hetzner, etc.)

set -e

echo "========================================="
echo "Museum Kiosk System - VPS Deployment"
echo "========================================="

# Configuration
DOMAIN=${1:-""}
EMAIL=${2:-""}
USE_SSL="n"

if [ -n "$DOMAIN" ] && [ -n "$EMAIL" ]; then
    USE_SSL="y"
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to generate secure random strings
generate_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Update system
echo "Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# Install Docker if not present
if ! command_exists docker; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Install Docker Compose
if ! command_exists docker-compose; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Install nginx for reverse proxy
if ! command_exists nginx; then
    echo "Installing Nginx..."
    sudo apt-get install -y nginx
fi

# Install certbot for SSL
if [ "$USE_SSL" = "y" ] && ! command_exists certbot; then
    echo "Installing Certbot for SSL..."
    sudo apt-get install -y certbot python3-certbot-nginx
fi

# Create application directory
APP_DIR="/opt/museum-kiosk"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Copy application files
echo "Copying application files..."
sudo cp -r . $APP_DIR/
cd $APP_DIR

# Create production environment file
if [ ! -f .env ]; then
    echo "Creating production environment file..."
    cat > .env << EOF
# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=strapi_prod
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=$(generate_secret)
DATABASE_SSL=false

# Strapi
JWT_SECRET=$(generate_secret)
ADMIN_JWT_SECRET=$(generate_secret)
APP_KEYS=$(generate_secret),$(generate_secret),$(generate_secret),$(generate_secret)
API_TOKEN_SALT=$(generate_secret)
TRANSFER_TOKEN_SALT=$(generate_secret)
NODE_ENV=production
HOST=0.0.0.0
PORT=1337

# URLs
URL=${DOMAIN:-http://$(curl -s ifconfig.me):1337}
FRONTEND_URL=${DOMAIN:-http://$(curl -s ifconfig.me)}
EOF
fi

# Create production docker-compose
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: kiosk-postgres
    restart: always
    environment:
      POSTGRES_DB: ${DATABASE_NAME}
      POSTGRES_USER: ${DATABASE_USERNAME}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - kiosk-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DATABASE_USERNAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

  strapi:
    build: ./kiosk-backend
    container_name: kiosk-backend
    restart: always
    env_file: .env
    volumes:
      - strapi_uploads:/app/public/uploads
    networks:
      - kiosk-network
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:1337"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: nginx:alpine
    container_name: kiosk-frontend
    restart: always
    volumes:
      - ./frontend-kiosk:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    networks:
      - kiosk-network
    depends_on:
      - strapi

networks:
  kiosk-network:
    driver: bridge

volumes:
  postgres_data:
  strapi_uploads:
EOF

# Configure Nginx reverse proxy
if [ -n "$DOMAIN" ]; then
    echo "Configuring Nginx for domain: $DOMAIN"
    
    sudo tee /etc/nginx/sites-available/museum-kiosk > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    # Frontend
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # API
    location /api {
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Strapi Admin
    location /admin {
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Uploads
    location /uploads {
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    
    sudo ln -sf /etc/nginx/sites-available/museum-kiosk /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl reload nginx
    
    # Setup SSL if email provided
    if [ "$USE_SSL" = "y" ]; then
        echo "Setting up SSL certificate..."
        sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m $EMAIL
    fi
fi

# Update docker-compose ports for production
sed -i 's/"80:80"/"8080:80"/g' docker-compose.prod.yml
sed -i 's/"1337:1337"/"1337:1337"/g' docker-compose.prod.yml

# Start services
echo "Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Setup firewall
echo "Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 1337/tcp
sudo ufw --force enable

# Create update script
cat > update.sh << 'EOF'
#!/bin/bash
cd /opt/museum-kiosk
git pull
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml logs -f
EOF
chmod +x update.sh

# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/$USER/backups"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U strapi strapi_prod | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup uploads
docker run --rm -v museum-kiosk_strapi_uploads:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/uploads_$DATE.tar.gz -C /data .

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR"
EOF
chmod +x backup.sh

# Setup cron for automatic backups
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/museum-kiosk/backup.sh") | crontab -

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# Check service health
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "========================================="
echo "VPS Deployment Complete!"
echo "========================================="
echo ""

if [ -n "$DOMAIN" ]; then
    echo "Your application is available at:"
    echo "- Frontend: https://$DOMAIN"
    echo "- API: https://$DOMAIN/api"
    echo "- Admin: https://$DOMAIN/admin"
else
    IP=$(curl -s ifconfig.me)
    echo "Your application is available at:"
    echo "- Frontend: http://$IP"
    echo "- API: http://$IP:1337/api"
    echo "- Admin: http://$IP:1337/admin"
fi

echo ""
echo "Important files:"
echo "- Environment: /opt/museum-kiosk/.env"
echo "- Update script: /opt/museum-kiosk/update.sh"
echo "- Backup script: /opt/museum-kiosk/backup.sh"
echo ""
echo "Daily backups are configured at 2 AM server time."
echo ""
echo "To view logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "To restart: docker-compose -f docker-compose.prod.yml restart"