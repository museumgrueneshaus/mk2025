#!/bin/bash

# Raspberry Pi Kiosk Setup Script
# Führen Sie dieses Script einmalig auf jedem Raspberry Pi aus

echo "Museum Kiosk System - Raspberry Pi Setup"
echo "========================================"

# System aktualisieren
echo "Aktualisiere System-Pakete..."
sudo apt-get update
sudo apt-get upgrade -y

# Erforderliche Pakete installieren
echo "Installiere erforderliche Pakete..."
sudo apt-get install -y \
    chromium-browser \
    xserver-xorg \
    xinit \
    x11-xserver-utils \
    unclutter \
    lightdm

# Start-Script kopieren und ausführbar machen
echo "Kopiere Start-Script..."
sudo cp start_kiosk.sh /home/pi/start_kiosk.sh
sudo chmod +x /home/pi/start_kiosk.sh
sudo chown pi:pi /home/pi/start_kiosk.sh

# Systemd Service installieren
echo "Installiere Systemd Service..."
sudo cp kiosk.service /etc/systemd/system/kiosk.service
sudo systemctl daemon-reload
sudo systemctl enable kiosk.service

# Auto-Login für Benutzer pi aktivieren
echo "Konfiguriere Auto-Login..."
sudo raspi-config nonint do_boot_behaviour B4

# LightDM für Auto-Login konfigurieren
sudo bash -c 'cat > /etc/lightdm/lightdm.conf << EOF
[Seat:*]
autologin-user=pi
autologin-user-timeout=0
user-session=openbox
EOF'

# Openbox Autostart konfigurieren
mkdir -p /home/pi/.config/openbox
cat > /home/pi/.config/openbox/autostart << 'EOF'
# Deaktiviere Bildschirmschoner und Energiesparmodus
xset s off
xset -dpms
xset s noblank

# Starte Kiosk
/home/pi/start_kiosk.sh &
EOF

chmod +x /home/pi/.config/openbox/autostart

# Boot-Konfiguration optimieren
echo "Optimiere Boot-Konfiguration..."
sudo bash -c 'cat >> /boot/config.txt << EOF

# Kiosk-Optimierungen
disable_splash=1
boot_delay=0
dtoverlay=disable-bt
dtoverlay=disable-wifi
EOF'

# Cmdline.txt optimieren (Boot-Meldungen ausblenden)
sudo sed -i 's/console=tty1/console=tty3 loglevel=3 quiet/' /boot/cmdline.txt

# Swap deaktivieren (für SD-Karten-Langlebigkeit)
echo "Deaktiviere Swap..."
sudo dphys-swapfile swapoff
sudo dphys-swapfile uninstall
sudo systemctl disable dphys-swapfile

# Readonly-Filesystem vorbereiten (optional, aber empfohlen)
echo "Bereite Readonly-Filesystem vor..."
sudo bash -c 'cat > /etc/fstab << EOF
proc            /proc           proc    defaults          0       0
/dev/mmcblk0p1  /boot           vfat    defaults,ro       0       2
/dev/mmcblk0p2  /               ext4    defaults,noatime,ro  0    1
tmpfs           /tmp            tmpfs   defaults,noatime,mode=1777  0  0
tmpfs           /var/log        tmpfs   defaults,noatime,mode=0755  0  0
tmpfs           /var/tmp        tmpfs   defaults,noatime,mode=1777  0  0
EOF'

echo ""
echo "========================================="
echo "Setup abgeschlossen!"
echo ""
echo "WICHTIG: Bearbeiten Sie /home/pi/start_kiosk.sh"
echo "und passen Sie die FRONTEND_URL an!"
echo ""
echo "Danach starten Sie den Pi neu mit:"
echo "sudo reboot"
echo "========================================="