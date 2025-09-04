#!/bin/bash -e

# Install kiosk startup script
install -m 755 files/start-kiosk.sh "${ROOTFS_DIR}/home/museum/"
install -m 755 files/health-check.sh "${ROOTFS_DIR}/home/museum/"
install -m 644 files/museum-kiosk.service "${ROOTFS_DIR}/etc/systemd/system/"
install -m 644 files/kiosk-openbox-config "${ROOTFS_DIR}/etc/xdg/openbox/autostart"

# Configure system for kiosk mode
on_chroot << EOF
# Create museum user if not exists
if ! id -u museum >/dev/null 2>&1; then
    useradd -m -s /bin/bash museum
    echo "museum:museum2024" | chpasswd
    usermod -a -G video,audio,input,gpio,i2c,spi museum
fi

# Configure autologin for museum user
mkdir -p /etc/systemd/system/getty@tty1.service.d/
cat > /etc/systemd/system/getty@tty1.service.d/autologin.conf << END
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin museum --noclear %I \$TERM
END

# Disable screen blanking
cat >> /etc/X11/xinit/xinitrc << END
xset s off
xset -dpms
xset s noblank
END

# Configure LightDM for autologin (backup method)
cat > /etc/lightdm/lightdm.conf << END
[Seat:*]
autologin-user=museum
autologin-user-timeout=0
user-session=openbox
END

# Enable services
systemctl enable museum-kiosk.service
systemctl enable ssh.service
systemctl enable avahi-daemon.service
systemctl set-default multi-user.target

# Disable unnecessary services
systemctl disable bluetooth.service 2>/dev/null || true
systemctl disable hciuart.service 2>/dev/null || true
systemctl disable apt-daily.service 2>/dev/null || true
systemctl disable apt-daily-upgrade.service 2>/dev/null || true

# Configure network manager for auto-connection
cat > /etc/NetworkManager/NetworkManager.conf << END
[main]
plugins=ifupdown,keyfile
dhcp=dhclient
no-auto-default=*

[ifupdown]
managed=true

[device]
wifi.scan-rand-mac-address=no
END

# Create config directory in boot partition
mkdir -p /boot/museum-config

# Server configuration
cat > /boot/museum-config/server.txt << END
# Museum Kiosk Server Configuration
# Edit this file to change the server address
# 
# For Netlify deployment:
# your-museum.netlify.app
#
# For local server:
# 192.168.1.100:4321
#
# Default (change this!):
your-museum.netlify.app
END

# Kiosk ID configuration
cat > /boot/museum-config/kiosk-id.txt << END
pi_01
END

# Instructions file
cat > /boot/museum-config/README.txt << END
MUSEUM KIOSK CONFIGURATION
==========================

To configure this Raspberry Pi:

1. Edit kiosk-id.txt
   Change "pi_01" to your desired ID:
   - pi_01, pi_02, pi_03, etc.
   - Or custom names: eingang, cafe, etc.

2. Edit server.txt  
   Change to your Netlify URL or local server

3. Save and reboot

The kiosk will open:
https://[server]/viewer/[kiosk-id]

Example:
https://museum.netlify.app/viewer/pi_01
END

# Set permissions
chown -R museum:museum /home/museum/
chmod +x /home/museum/*.sh

# Configure sudo for museum user (for maintenance)
echo "museum ALL=(ALL) NOPASSWD: /sbin/reboot, /sbin/poweroff, /bin/systemctl" >> /etc/sudoers
EOF