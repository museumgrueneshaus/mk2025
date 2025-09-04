#!/bin/bash -e

# This script runs before the stage starts
# Used for any preparation needed

if [ ! -d "${ROOTFS_DIR}" ]; then
    echo "Error: ROOTFS_DIR not set or not a directory"
    exit 1
fi

# Log stage start
log "Starting Museum Kiosk stage configuration"