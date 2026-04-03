#!/bin/bash
# Debug Chromium auf Pi

PI_HOST="${1:-rpi01.local}"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Chromium Debug auf $PI_HOST                                "
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "► Starte Chromium mit Remote Debugging..."

ssh museumgh@${PI_HOST} << 'EOF'
# Kill altes Chromium
DISPLAY=:0 pkill chromium
sleep 2

# Starte mit Remote Debugging Port
DISPLAY=:0 chromium \
  --remote-debugging-port=9222 \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --no-first-run \
  --autoplay-policy=no-user-gesture-required \
  --disable-features=PreloadMediaEngagementData,MediaEngagementBypassAutoplayPolicies,Translate \
  --accept-lang=de-DE \
  --app=https://museumgh.netlify.app/kiosk/RPI_01 \
  > /tmp/chromium-debug.log 2>&1 &

sleep 5
echo "✓ Chromium gestartet mit Remote Debugging auf Port 9222"
echo ""
echo "Browser Console Logs:"
curl -s http://localhost:9222/json | jq -r '.[0].devtoolsFrontendUrl' | head -1
EOF

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Öffne auf deinem Mac:                                       ║"
echo "║  chrome://inspect                                            ║"
echo "║  Dann: Configure → Add: rpi01.local:9222                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
