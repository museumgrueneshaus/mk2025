#!/bin/bash
# Deploy script - copies all files to Raspberry Pi and runs setup

set -e

PI_HOST="rpi01.local"
PI_USER="museumgh"
PI_PASSWORD="gh2025#"

echo "========================================"
echo "Deploying to Raspberry Pi"
echo "========================================"
echo ""

# Check if Pi is reachable
echo "Checking if Pi is reachable..."
if ! ping -c 1 $PI_HOST &> /dev/null; then
    echo "ERROR: Cannot reach $PI_HOST"
    echo "Make sure you are in the same network!"
    exit 1
fi
echo "Pi is reachable!"
echo ""

# Create tarball
echo "Creating deployment package..."
tar -czf rpi-setup.tar.gz cleanup.sh labwc.service labwc-autostart setup.sh
echo "Package created: rpi-setup.tar.gz"
echo ""

# Copy to Pi
echo "Copying files to Pi..."
scp rpi-setup.tar.gz ${PI_USER}@${PI_HOST}:~/
echo "Files copied!"
echo ""

# Extract and run setup on Pi
echo "Running setup on Pi..."
ssh ${PI_USER}@${PI_HOST} << 'ENDSSH'
    cd ~
    tar -xzf rpi-setup.tar.gz
    chmod +x cleanup.sh setup.sh
    bash setup.sh
ENDSSH

echo ""
echo "========================================"
echo "Deployment complete!"
echo "========================================"
echo ""
echo "Now reboot the Pi:"
echo "  ssh museumgh@rpi01.local 'sudo reboot'"
echo ""
echo "After reboot, test Screen Sharing at:"
echo "  https://connect.raspberrypi.com/"
echo ""

# Cleanup local tarball
rm rpi-setup.tar.gz
