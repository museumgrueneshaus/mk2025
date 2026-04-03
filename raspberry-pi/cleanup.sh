#!/bin/bash
# Cleanup script - removes all old configurations

echo "=== Cleaning up old configurations ==="

# Stop and disable old services
echo "Stopping old services..."
sudo systemctl stop kiosk.service 2>/dev/null
sudo systemctl stop lightdm.service 2>/dev/null
sudo systemctl stop getty@tty1.service 2>/dev/null

sudo systemctl disable kiosk.service 2>/dev/null
sudo systemctl disable lightdm.service 2>/dev/null
sudo systemctl unmask getty@tty1.service 2>/dev/null

# Remove old service files
echo "Removing old service files..."
sudo rm -f /etc/systemd/system/kiosk.service
sudo rm -rf /etc/systemd/system/getty@tty1.service.d/

# Clean up user configs
echo "Cleaning up user configs..."
rm -f ~/.bash_profile
rm -f ~/.profile
rm -rf ~/.config/autostart/kiosk.desktop
rm -rf ~/.config/lxsession/

# Reload systemd
sudo systemctl daemon-reload

echo "=== Cleanup complete! ==="
