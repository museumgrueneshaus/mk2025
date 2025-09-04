#!/bin/bash -e

# Museum branding and final customizations

# Copy branding files if they exist
if [ -d files/branding ]; then
    cp -r files/branding/* "${ROOTFS_DIR}/"
fi

on_chroot << EOF
# Set custom MOTD
cat > /etc/motd << END

 __  __                                  _  ___           _    
|  \/  |_   _ ___  ___ _   _ _ __ ___   | |/ (_) ___  ___| | __
| |\/| | | | / __|/ _ \ | | | '_ \` _ \  | ' /| |/ _ \/ __| |/ /
| |  | | |_| \__ \  __/ |_| | | | | | | | . \| | (_) \__ \   < 
|_|  |_|\__,_|___/\___|\__,_|_| |_| |_| |_|\_\_|\___/|___/_|\_\\

Museum Kiosk System v1.0
========================
Server config: /boot/museum-config/server.txt
Logs: /var/log/museum-kiosk-health.log
Service: systemctl status museum-kiosk

Commands:
  museum-restart  - Restart kiosk
  museum-status   - Show status
  museum-logs     - View logs
  museum-config   - Edit server config

END

# Create helper commands
cat > /usr/local/bin/museum-restart << 'END'
#!/bin/bash
echo "Restarting Museum Kiosk..."
sudo systemctl restart museum-kiosk
END

cat > /usr/local/bin/museum-status << 'END'
#!/bin/bash
echo "=== Museum Kiosk Status ==="
systemctl status museum-kiosk --no-pager
echo ""
echo "=== Kiosk Configuration ==="
echo "  Kiosk ID: $(cat /boot/museum-config/kiosk-id.txt 2>/dev/null || echo 'not set')"
echo "  Server: $(cat /boot/museum-config/server.txt 2>/dev/null | grep -v '^#' | grep -v '^$' | head -n1 || echo 'not set')"
echo ""
echo "=== Network Status ==="
ip addr show | grep -E "eth0|wlan0" -A 2
END

cat > /usr/local/bin/museum-logs << 'END'
#!/bin/bash
echo "=== Museum Kiosk Logs ==="
journalctl -u museum-kiosk -n 50 --no-pager
echo ""
echo "=== Health Check Logs ==="
tail -n 20 /var/log/museum-kiosk-health.log 2>/dev/null || echo "No health logs yet"
END

cat > /usr/local/bin/museum-config << 'END'
#!/bin/bash
echo "Editing server configuration..."
sudo nano /boot/museum-config/server.txt
echo "Configuration updated. Restart kiosk? (y/n)"
read -r response
if [[ "\$response" == "y" ]]; then
    museum-restart
fi
END

chmod +x /usr/local/bin/museum-*

# Configure splash screen
if [ -f /usr/share/plymouth/themes/pix/pix.script ]; then
    # Customize Plymouth splash
    sed -i 's/title = "Raspberry Pi OS"/title = "Museum Kiosk"/' \
        /usr/share/plymouth/themes/pix/pix.script 2>/dev/null || true
fi

# Final cleanup
apt-get autoremove -y
apt-get clean
rm -rf /var/cache/apt/archives/*

# Create first boot flag
touch /boot/museum-firstboot

# Create README in boot partition
cat > /boot/museum-README.txt << 'END'
MUSEUM KIOSK - RASPBERRY PI IMAGE
==================================

This SD card contains a ready-to-use Museum Kiosk system.

QUICK START:
1. Edit museum-config/server.txt with your server address
2. Insert SD card into Raspberry Pi
3. Connect to network (Ethernet recommended)
4. Power on - the kiosk will start automatically

CONFIGURATION:
- Server: Edit /boot/museum-config/server.txt
- WiFi: Create wpa_supplicant.conf in /boot (see below)

WIFI SETUP (optional):
Create /boot/wpa_supplicant.conf:
---
country=DE
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
network={
    ssid="YourNetworkName"
    psk="YourPassword"
}
---

SSH ACCESS:
- Default user: museum
- Default pass: museum2024
- SSH is enabled by default
- Connect via: ssh museum@<pi-ip-address>

TROUBLESHOOTING:
- No display: Check HDMI connection and TV input
- Black screen: Server might be unreachable
- To access terminal: Press Ctrl+Alt+F2

VERSION: 1.0
BUILD DATE: $(date +%Y-%m-%d)
END

echo "Museum Kiosk configuration complete!"
EOF