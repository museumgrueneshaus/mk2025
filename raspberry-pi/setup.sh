#!/bin/bash
# Main setup script for Raspberry Pi Museum Kiosk

set -e  # Exit on error

echo "========================================"
echo "Raspberry Pi Museum Kiosk Setup"
echo "========================================"
echo ""

# 1. Cleanup old configurations
echo "Step 1: Cleaning up old configurations..."
bash cleanup.sh
echo ""

# 2. Install required packages
echo "Step 2: Checking required packages..."
PACKAGES="labwc wayvnc chromium"
for pkg in $PACKAGES; do
    if ! dpkg -l | grep -q "^ii  $pkg "; then
        echo "Installing $pkg..."
        sudo apt install -y $pkg
    else
        echo "$pkg already installed"
    fi
done
echo ""

# 3. Setup systemd user service for labwc
echo "Step 3: Setting up labwc systemd service..."
mkdir -p ~/.config/systemd/user/
cp labwc.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable labwc.service
echo "labwc service enabled"
echo ""

# 4. Setup labwc autostart
echo "Step 4: Setting up Chromium autostart..."
mkdir -p ~/.config/labwc/
cp labwc-autostart ~/.config/labwc/autostart
chmod +x ~/.config/labwc/autostart
echo "Chromium autostart configured"
echo ""

# 5. Enable autologin (if not already)
echo "Step 5: Configuring autologin..."
sudo raspi-config nonint do_boot_behaviour B2  # Console autologin
echo "Autologin configured"
echo ""

# 6. Enable linger (keeps user services running)
echo "Step 6: Enabling systemd linger..."
sudo loginctl enable-linger museumgh
echo "Linger enabled"
echo ""

echo "========================================"
echo "Setup complete!"
echo "========================================"
echo ""
echo "Please reboot the Pi:"
echo "  sudo reboot"
echo ""
echo "After reboot:"
echo "  - labwc should start automatically"
echo "  - Chromium should open in kiosk mode"
echo "  - Raspberry Pi Connect Screen Sharing should work"
echo ""
