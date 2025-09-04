#!/bin/bash

# Render.com Deployment Script
# Verwendet die Render API für automatisches Deployment

RENDER_API_KEY="rnd_DeAgYF22cr62VUMdDnWpWOea4s3F"
RENDER_API_URL="https://api.render.com/v1"

echo "🚀 Render.com Backend Deployment"
echo "================================="

# Service erstellen
echo "Erstelle Web Service..."
curl -X POST "$RENDER_API_URL/services" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "museum-kiosk-backend",
    "type": "web_service",
    "repo": {
      "url": "https://github.com/museumgrueneshaus/kiosk-backend",
      "branch": "main"
    },
    "buildCommand": "npm install && npm run build",
    "startCommand": "npm run start",
    "envVars": [
      {"key": "NODE_ENV", "value": "production"},
      {"key": "DATABASE_CLIENT", "value": "postgres"},
      {"key": "DATABASE_SSL", "value": "true"},
      {"key": "DATABASE_SSL_REJECT_UNAUTHORIZED", "value": "false"},
      {"key": "CLOUDINARY_NAME", "value": "dtx5nuban"},
      {"key": "CLOUDINARY_KEY", "value": "484387353599576"},
      {"key": "CLOUDINARY_SECRET", "value": "y3xRJMDNYLnKIeIE0le0jCDClw_CFU"},
      {"key": "APP_KEYS", "generateValue": true},
      {"key": "API_TOKEN_SALT", "generateValue": true},
      {"key": "ADMIN_JWT_SECRET", "generateValue": true},
      {"key": "TRANSFER_TOKEN_SALT", "generateValue": true},
      {"key": "JWT_SECRET", "generateValue": true}
    ],
    "plan": "starter",
    "region": "oregon"
  }'

echo ""
echo "✅ Web Service erstellt!"
echo "Backend URL: https://museum-kiosk-backend.onrender.com"