#!/bin/bash

# Local/Self-Hosted Deployment Script for Museum Kiosk System
# Supports Docker, Docker Compose, and native deployment

set -e

echo "========================================="
echo "Museum Kiosk System - Local Deployment"
echo "========================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to generate secure random strings
generate_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Check deployment method
echo "Select deployment method:"
echo "1) Docker Compose (Recommended)"
echo "2) Docker (Manual)"
echo "3) Native (Node.js + PostgreSQL)"
echo "4) SQLite (Lightweight, single file DB)"
read -p "Enter choice [1-4]: " DEPLOY_METHOD

case $DEPLOY_METHOD in
    1)
        echo "Deploying with Docker Compose..."
        
        # Check if Docker and Docker Compose are installed
        if ! command_exists docker; then
            echo "Error: Docker is not installed. Please install Docker first."
            echo "Visit: https://docs.docker.com/get-docker/"
            exit 1
        fi
        
        if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
            echo "Error: Docker Compose is not installed."
            exit 1
        fi
        
        # Create .env file if it doesn't exist
        if [ ! -f .env ]; then
            echo "Creating .env file with secure defaults..."
            cp .env.example .env
            
            # Generate secure secrets
            sed -i.bak "s/your-secure-password-here/$(generate_secret)/g" .env
            sed -i.bak "s/your-jwt-secret-here/$(generate_secret)/g" .env
            sed -i.bak "s/your-admin-jwt-secret-here/$(generate_secret)/g" .env
            sed -i.bak "s/your-api-token-salt/$(generate_secret)/g" .env
            sed -i.bak "s/your-transfer-token-salt/$(generate_secret)/g" .env
            sed -i.bak "s/key1,key2,key3,key4/$(generate_secret),$(generate_secret),$(generate_secret),$(generate_secret)/g" .env
            rm -f .env.bak
            
            echo "✓ Generated secure secrets in .env file"
        fi
        
        # Create mosquitto config if it doesn't exist
        if [ ! -f mosquitto/config/mosquitto.conf ]; then
            mkdir -p mosquitto/config
            cat > mosquitto/config/mosquitto.conf << EOF
listener 1883
allow_anonymous true
persistence true
persistence_location /mosquitto/data/
log_dest file /mosquitto/log/mosquitto.log

# WebSocket support
listener 9001
protocol websockets
EOF
            echo "✓ Created MQTT broker configuration"
        fi
        
        # Start services
        echo "Starting services..."
        docker-compose up -d
        
        echo "✓ Services started successfully!"
        echo ""
        echo "Access points:"
        echo "- Frontend: http://localhost"
        echo "- Strapi Admin: http://localhost:1337/admin"
        echo "- API: http://localhost:1337/api"
        echo "- MQTT Broker: mqtt://localhost:1883"
        echo ""
        echo "To view logs: docker-compose logs -f"
        echo "To stop: docker-compose down"
        ;;
        
    2)
        echo "Deploying with Docker (Manual)..."
        
        if ! command_exists docker; then
            echo "Error: Docker is not installed."
            exit 1
        fi
        
        # Create network
        docker network create kiosk-network 2>/dev/null || true
        
        # Start PostgreSQL
        echo "Starting PostgreSQL..."
        docker run -d \
            --name kiosk-postgres \
            --network kiosk-network \
            -e POSTGRES_DB=strapi \
            -e POSTGRES_USER=strapi \
            -e POSTGRES_PASSWORD=strapi123 \
            -p 5432:5432 \
            -v kiosk-postgres-data:/var/lib/postgresql/data \
            postgres:15-alpine
        
        # Build and start Strapi
        echo "Building Strapi image..."
        cd kiosk-backend
        docker build -t kiosk-backend .
        
        docker run -d \
            --name kiosk-backend \
            --network kiosk-network \
            -e DATABASE_CLIENT=postgres \
            -e DATABASE_HOST=kiosk-postgres \
            -e DATABASE_PORT=5432 \
            -e DATABASE_NAME=strapi \
            -e DATABASE_USERNAME=strapi \
            -e DATABASE_PASSWORD=strapi123 \
            -e JWT_SECRET=$(generate_secret) \
            -e ADMIN_JWT_SECRET=$(generate_secret) \
            -e APP_KEYS="$(generate_secret),$(generate_secret),$(generate_secret),$(generate_secret)" \
            -p 1337:1337 \
            kiosk-backend
        
        cd ..
        
        # Start frontend
        echo "Starting frontend..."
        docker run -d \
            --name kiosk-frontend \
            --network kiosk-network \
            -v $(pwd)/frontend-kiosk:/usr/share/nginx/html:ro \
            -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
            -p 80:80 \
            nginx:alpine
        
        echo "✓ Deployment complete!"
        ;;
        
    3)
        echo "Native deployment with Node.js and PostgreSQL..."
        
        # Check Node.js
        if ! command_exists node; then
            echo "Error: Node.js is not installed."
            echo "Install from: https://nodejs.org/"
            exit 1
        fi
        
        # Check PostgreSQL
        if ! command_exists psql; then
            echo "Warning: PostgreSQL client not found. Make sure PostgreSQL is running."
        fi
        
        # Install backend dependencies
        echo "Installing backend dependencies..."
        cd kiosk-backend
        npm install
        
        # Setup environment
        if [ ! -f .env ]; then
            cat > .env << EOF
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi123
JWT_SECRET=$(generate_secret)
ADMIN_JWT_SECRET=$(generate_secret)
APP_KEYS=$(generate_secret),$(generate_secret),$(generate_secret),$(generate_secret)
API_TOKEN_SALT=$(generate_secret)
TRANSFER_TOKEN_SALT=$(generate_secret)
NODE_ENV=production
EOF
        fi
        
        # Build Strapi
        echo "Building Strapi..."
        npm run build
        
        # Start Strapi
        echo "Starting Strapi..."
        npm start &
        
        cd ..
        
        # Serve frontend
        echo "Starting frontend..."
        cd frontend-kiosk
        npx serve -s . -p 3000 &
        
        cd ..
        
        echo "✓ Native deployment complete!"
        echo "- Frontend: http://localhost:3000"
        echo "- Backend: http://localhost:1337"
        ;;
        
    4)
        echo "Deploying with SQLite (lightweight)..."
        
        if ! command_exists node; then
            echo "Error: Node.js is not installed."
            exit 1
        fi
        
        cd kiosk-backend
        
        # Create SQLite environment
        if [ ! -f .env ]; then
            cat > .env << EOF
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
JWT_SECRET=$(generate_secret)
ADMIN_JWT_SECRET=$(generate_secret)
APP_KEYS=$(generate_secret),$(generate_secret),$(generate_secret),$(generate_secret)
API_TOKEN_SALT=$(generate_secret)
TRANSFER_TOKEN_SALT=$(generate_secret)
NODE_ENV=production
HOST=0.0.0.0
PORT=1337
EOF
        fi
        
        # Install and build
        echo "Installing dependencies..."
        npm install
        
        echo "Building Strapi..."
        npm run build
        
        # Create systemd service (optional)
        read -p "Create systemd service for auto-start? (y/n): " CREATE_SERVICE
        if [ "$CREATE_SERVICE" = "y" ]; then
            sudo tee /etc/systemd/system/kiosk-backend.service > /dev/null << EOF
[Unit]
Description=Museum Kiosk Backend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=$(which node) $(which npm) start
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF
            sudo systemctl daemon-reload
            sudo systemctl enable kiosk-backend
            sudo systemctl start kiosk-backend
            echo "✓ Systemd service created and started"
        else
            npm start &
        fi
        
        cd ../frontend-kiosk
        npx serve -s . -p 3000 &
        
        echo "✓ SQLite deployment complete!"
        echo "- Frontend: http://localhost:3000"
        echo "- Backend: http://localhost:1337"
        echo "- Database: kiosk-backend/.tmp/data.db"
        ;;
        
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "========================================="
echo "Deployment completed successfully!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Access Strapi admin panel and create your first admin user"
echo "2. Configure content types and add exhibition data"
echo "3. Set up kiosk configurations with MAC addresses"
echo "4. Connect Raspberry Pi kiosks to the system"