#!/bin/bash

# Museum Kiosk Startup Script
# This script starts Chromium in kiosk mode with the correct viewer URL

echo "Museum Kiosk starting..."

# Read server configuration
SERVER_CONFIG="/boot/museum-config/server.txt"
if [ -f "$SERVER_CONFIG" ]; then
    SERVER=$(grep -v '^#' "$SERVER_CONFIG" | grep -v '^$' | head -n1)
else
    # Default to Netlify deployment
    SERVER="your-museum.netlify.app"
    echo "Warning: No server config found, using default: $SERVER"
fi

# Get Kiosk ID from config file
KIOSK_ID_FILE="/boot/museum-config/kiosk-id.txt"
if [ -f "$KIOSK_ID_FILE" ]; then
    KIOSK_ID=$(cat "$KIOSK_ID_FILE" | tr -d '\n\r' | tr -d ' ')
else
    # Default to pi_01 if no config found
    KIOSK_ID="pi_01"
    echo "Warning: No kiosk ID found, using default: $KIOSK_ID"
fi

echo "Configuration:"
echo "  Server: $SERVER"
echo "  Kiosk ID: $KIOSK_ID"

# Wait for network
echo "Waiting for network connection..."
for i in {1..30}; do
    if ping -c 1 -W 1 8.8.8.8 > /dev/null 2>&1; then
        echo "Network is up!"
        break
    fi
    echo "Waiting for network... ($i/30)"
    sleep 2
done

# Set display environment
export DISPLAY=:0
export XAUTHORITY=/home/museum/.Xauthority

# Kill any existing browser instances
pkill -f chromium || true

# Start X if not running
if ! pgrep -x "Xorg" > /dev/null; then
    echo "Starting X server..."
    xinit -- :0 -nocursor &
    sleep 5
fi

# Configure display
xset s off
xset -dpms
xset s noblank
unclutter -idle 0.5 -root &

# Build viewer URL (HTTPS for Netlify)
if [[ "$SERVER" == *"netlify"* ]] || [[ "$SERVER" == *"vercel"* ]] || [[ "$SERVER" == *"github.io"* ]]; then
    # Static hosting services use HTTPS
    VIEWER_URL="https://${SERVER}/viewer/${KIOSK_ID}"
else
    # Local network or custom server
    VIEWER_URL="http://${SERVER}/viewer/${KIOSK_ID}"
fi
echo "Opening: $VIEWER_URL"

# Start Chromium in kiosk mode
exec chromium-browser \
    --kiosk \
    --noerrdialogs \
    --disable-infobars \
    --disable-session-crashed-bubble \
    --disable-features=TranslateUI \
    --check-for-update-interval=31536000 \
    --disable-component-update \
    --autoplay-policy=no-user-gesture-required \
    --start-fullscreen \
    --window-size=1920,1080 \
    --window-position=0,0 \
    --disable-pinch \
    --overscroll-history-navigation=0 \
    --disable-translate \
    --no-first-run \
    --fast \
    --fast-start \
    --disable-features=Translate \
    --password-store=basic \
    --disable-web-security \
    --disable-features=CrossSiteDocumentBlockingIfIsolating \
    --disable-site-isolation-trials \
    --app="$VIEWER_URL"