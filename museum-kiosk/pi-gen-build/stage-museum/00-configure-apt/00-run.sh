#!/bin/bash -e

# Configure APT for minimal installation
on_chroot << EOF
# Remove unnecessary packages to save space
apt-get remove --purge -y \
    wolfram-engine \
    libreoffice* \
    scratch* \
    minecraft-pi \
    python-minecraftpi \
    sonic-pi \
    oracle-java* \
    bluej \
    greenfoot \
    nodered \
    nuscratch \
    scratch2 \
    scratch3 \
    smartsim \
    mu-editor \
    geany* \
    thonny \
    piwiz \
    rpd-wallpaper \
    2>/dev/null || true

# Clean package cache
apt-get autoremove -y
apt-get clean

# Update package list
apt-get update
EOF