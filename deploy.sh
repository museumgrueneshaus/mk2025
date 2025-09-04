#!/bin/bash

echo "🚀 Museum Kiosk System - Deployment Script"
echo "=========================================="

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funktion für Erfolgs-/Fehlermeldungen
success() { echo -e "${GREEN}✓${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; exit 1; }
warning() { echo -e "${YELLOW}⚠${NC} $1"; }

# Git konfigurieren
configure_git() {
    echo "📝 Konfiguriere Git..."
    git config --global user.email "museum@grueneshaus.de"
    git config --global user.name "Museum Grünes Haus"
    success "Git konfiguriert"
}

# Backend Repository
deploy_backend() {
    echo ""
    echo "📦 Deploying Backend (Strapi)..."
    echo "--------------------------------"
    
    cd kiosk-backend || error "Backend-Ordner nicht gefunden"
    
    # Git initialisieren
    git init
    git add .
    git commit -m "Initial commit: Museum Kiosk Backend"
    
    # Remote hinzufügen und pushen
    git remote add origin https://github.com/museumgrueneshaus/kiosk-backend.git
    git branch -M main
    git push -u origin main --force
    
    success "Backend zu GitHub gepusht"
    
    # Render Deployment triggern
    warning "Bitte manuell auf render.com:"
    echo "  1. Neuen Web Service erstellen"
    echo "  2. GitHub Repo verbinden: museumgrueneshaus/kiosk-backend"
    echo "  3. PostgreSQL Datenbank hinzufügen"
    echo "  4. Environment Variables aus .env.production setzen"
    
    cd ..
}

# Frontend Repository
deploy_frontend() {
    echo ""
    echo "🎨 Deploying Frontend..."
    echo "------------------------"
    
    cd frontend-kiosk || error "Frontend-Ordner nicht gefunden"
    
    # Git initialisieren
    git init
    git add .
    git commit -m "Initial commit: Museum Kiosk Frontend"
    
    # Remote hinzufügen und pushen
    git remote add origin https://github.com/museumgrueneshaus/kiosk-frontend.git
    git branch -M main
    git push -u origin main --force
    
    success "Frontend zu GitHub gepusht"
    
    # Netlify Deployment
    warning "Bitte manuell auf netlify.com:"
    echo "  1. Neuen Site from Git erstellen"
    echo "  2. GitHub Repo verbinden: museumgrueneshaus/kiosk-frontend"
    echo "  3. Build Settings: Kein Build-Command nötig (statische Files)"
    echo "  4. Deploy!"
    
    cd ..
}

# ESP32 Repository
deploy_esp32() {
    echo ""
    echo "🔌 Archiviere ESP32 Code..."
    echo "---------------------------"
    
    cd esp32-led-controller || error "ESP32-Ordner nicht gefunden"
    
    git init
    git add .
    git commit -m "Initial commit: ESP32 LED Controller"
    
    git remote add origin https://github.com/museumgrueneshaus/kiosk-esp32.git
    git branch -M main
    git push -u origin main --force
    
    success "ESP32 Code archiviert"
    
    cd ..
}

# Raspberry Pi Setup Repository
deploy_raspberry() {
    echo ""
    echo "🥧 Archiviere Raspberry Pi Setup..."
    echo "-----------------------------------"
    
    cd raspberry-pi-setup || error "Raspberry-Ordner nicht gefunden"
    
    git init
    git add .
    git commit -m "Initial commit: Raspberry Pi Kiosk Setup"
    
    git remote add origin https://github.com/museumgrueneshaus/kiosk-raspberry.git
    git branch -M main
    git push -u origin main --force
    
    success "Raspberry Pi Setup archiviert"
    
    cd ..
}

# Hauptprogramm
main() {
    echo "Dieser Script wird:"
    echo "  • Git Repositories erstellen"
    echo "  • Code zu GitHub pushen"
    echo "  • Deployment-Anweisungen ausgeben"
    echo ""
    read -p "Fortfahren? (y/n) " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Abgebrochen."
        exit 0
    fi
    
    configure_git
    
    # Alle Komponenten deployen
    deploy_backend
    deploy_frontend
    deploy_esp32
    deploy_raspberry
    
    echo ""
    echo "=========================================="
    success "Deployment vorbereitet!"
    echo ""
    echo "📋 Nächste Schritte:"
    echo "  1. Render.com Backend konfigurieren"
    echo "  2. Netlify Frontend deployen"
    echo "  3. HiveMQ Cloud Account erstellen"
    echo "  4. Finale URLs in Konfiguration eintragen"
    echo ""
    echo "🔗 Erwartete URLs:"
    echo "  Backend: https://museum-kiosk-backend.onrender.com"
    echo "  Frontend: https://museum-kiosk.netlify.app"
    echo "  Admin: https://museum-kiosk-backend.onrender.com/admin"
}

# Script ausführen
main