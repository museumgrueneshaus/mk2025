#!/bin/bash

# Museum Kiosk Pi-Gen Build Script
# This script builds a custom Raspberry Pi image for Museum Kiosk

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PIGEN_DIR="${SCRIPT_DIR}/pi-gen"
STAGE_MUSEUM="${SCRIPT_DIR}/stage-museum"
CONFIG_FILE="${SCRIPT_DIR}/config"

echo -e "${GREEN}Museum Kiosk Pi-Gen Builder${NC}"
echo "=============================="
echo ""

# Check if running as root (required for pi-gen)
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Function to check dependencies
check_dependencies() {
    echo "Checking dependencies..."
    
    DEPS="git quilt parted debootstrap zerofree zip dosfstools libarchive-tools libcap2-bin grep rsync xz-utils"
    MISSING_DEPS=""
    
    for dep in $DEPS; do
        if ! dpkg -l | grep -q "^ii  $dep"; then
            MISSING_DEPS="$MISSING_DEPS $dep"
        fi
    done
    
    if [ ! -z "$MISSING_DEPS" ]; then
        echo -e "${YELLOW}Installing missing dependencies:$MISSING_DEPS${NC}"
        apt-get update
        apt-get install -y $MISSING_DEPS
    else
        echo -e "${GREEN}All dependencies installed${NC}"
    fi
}

# Function to setup pi-gen
setup_pigen() {
    if [ ! -d "$PIGEN_DIR" ]; then
        echo "Cloning pi-gen repository..."
        git clone https://github.com/RPi-Distro/pi-gen.git "$PIGEN_DIR"
    else
        echo "Updating pi-gen repository..."
        cd "$PIGEN_DIR"
        git fetch
        git pull
        cd "$SCRIPT_DIR"
    fi
}

# Function to copy custom stage
copy_custom_stage() {
    echo "Copying Museum Kiosk stage..."
    
    # Remove old stage if exists
    if [ -d "${PIGEN_DIR}/stage-museum" ]; then
        rm -rf "${PIGEN_DIR}/stage-museum"
    fi
    
    # Copy new stage
    cp -r "$STAGE_MUSEUM" "${PIGEN_DIR}/"
    
    # Copy config
    cp "$CONFIG_FILE" "${PIGEN_DIR}/"
    
    # Make scripts executable
    find "${PIGEN_DIR}/stage-museum" -name "*.sh" -exec chmod +x {} \;
    
    echo -e "${GREEN}Custom stage copied${NC}"
}

# Function to build image
build_image() {
    echo "Starting image build..."
    echo "This will take 30-60 minutes depending on your system..."
    
    cd "$PIGEN_DIR"
    
    # Clean previous builds (optional)
    if [ -d "work" ]; then
        echo -e "${YELLOW}Cleaning previous build...${NC}"
        rm -rf work
    fi
    
    # Run build
    ./build.sh
    
    cd "$SCRIPT_DIR"
}

# Function to copy final image
copy_image() {
    echo "Copying final image..."
    
    # Find the latest image
    IMAGE=$(find "${PIGEN_DIR}/deploy" -name "*.img" -o -name "*.img.xz" | sort -r | head -n1)
    
    if [ ! -z "$IMAGE" ]; then
        DEST="${SCRIPT_DIR}/museum-kiosk-$(date +%Y%m%d).img.xz"
        cp "$IMAGE" "$DEST"
        echo -e "${GREEN}Image saved to: $DEST${NC}"
        echo ""
        echo "Image size: $(du -h $DEST | cut -f1)"
        echo ""
        echo -e "${GREEN}BUILD SUCCESSFUL!${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Write image to SD card:"
        echo "   xzcat $DEST | sudo dd of=/dev/sdX bs=4M status=progress"
        echo ""
        echo "2. Edit /boot/museum-config/server.txt on the SD card"
        echo ""
        echo "3. Insert SD card into Raspberry Pi and power on"
    else
        echo -e "${RED}No image found in deploy directory${NC}"
        exit 1
    fi
}

# Main build process
echo "Starting Museum Kiosk image build process..."
echo ""

# Step 1: Check dependencies
check_dependencies

# Step 2: Setup pi-gen
setup_pigen

# Step 3: Copy custom stage
copy_custom_stage

# Step 4: Build image
echo ""
echo -e "${YELLOW}Ready to build. This will take a while.${NC}"
echo "Press Enter to continue or Ctrl+C to cancel..."
read

build_image

# Step 5: Copy final image
copy_image

echo "Build complete!"