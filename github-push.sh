#!/bin/bash

echo "📦 GitHub Push Script für Museum Kiosk System"
echo "============================================="
echo ""
echo "⚠️  WICHTIG: Stelle sicher, dass folgende Repositories auf GitHub existieren:"
echo "   1. https://github.com/museumgrueneshaus/kiosk-backend"
echo "   2. https://github.com/museumgrueneshaus/kiosk-frontend"
echo ""
echo "Repositories können erstellt werden unter: https://github.com/new"
echo "(Als 'Public' repositories, ohne README/License/gitignore)"
echo ""
read -p "Sind die Repositories erstellt? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Abgebrochen. Bitte erst Repositories erstellen."
    exit 1
fi

echo ""
echo "🚀 Pushe Backend Repository..."
cd /Users/marcelgladbach/mk2025/kiosk-backend
git push -u origin main --force
if [ $? -eq 0 ]; then
    echo "✅ Backend erfolgreich gepusht!"
else
    echo "❌ Backend Push fehlgeschlagen!"
    exit 1
fi

echo ""
echo "🚀 Pushe Frontend Repository..."
cd /Users/marcelgladbach/mk2025/frontend-kiosk
git push -u origin main --force
if [ $? -eq 0 ]; then
    echo "✅ Frontend erfolgreich gepusht!"
else
    echo "❌ Frontend Push fehlgeschlagen!"
    exit 1
fi

echo ""
echo "✅ Alle Repositories erfolgreich gepusht!"
echo ""
echo "Nächste Schritte:"
echo "1. Render.com konfigurieren"
echo "2. Netlify konfigurieren"