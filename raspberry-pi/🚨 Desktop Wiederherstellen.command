#!/bin/bash
# Desktop SOFORT wiederherstellen!

cd "$(dirname "$0")"

PI_HOST="rpi01.local"
PI_USER="museumgh"

echo "╔══════════════════════════════════════════╗"
echo "║  🚨 DESKTOP WIEDERHERSTELLEN             ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Stelle Desktop auf $PI_HOST wieder her..."
echo ""

ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${PI_USER}@${PI_HOST} << 'FIXSCRIPT'
echo "► Aktiviere Desktop Autologin..."
sudo raspi-config nonint do_boot_behaviour B4

echo "► Aktiviere LightDM..."
sudo systemctl enable lightdm
sudo systemctl set-default graphical.target

echo "► Deaktiviere labwc User-Service..."
systemctl --user disable labwc.service 2>/dev/null || true
systemctl --user stop labwc.service 2>/dev/null || true

echo ""
echo "✓ Desktop wiederhergestellt!"
echo ""
echo "Starte neu..."
sudo reboot
FIXSCRIPT

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  ✓ Desktop wird wiederhergestellt!       ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Pi startet neu... Warte 2 Minuten."
echo "Dann sollte der Pixel Desktop wieder da sein!"
echo ""

read -p "Drücke Enter zum Schließen..."
