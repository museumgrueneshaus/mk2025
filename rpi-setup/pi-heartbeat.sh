#!/bin/bash
# Pi Heartbeat - sendet Status regelmäßig an Sanity
# Wird auf dem Pi als Cron-Job ausgeführt (alle 5 Min)

# Sanity Config
SANITY_PROJECT_ID="832k5je1"
SANITY_DATASET="production"
SANITY_TOKEN="skaVkMqYzbkwHfAwuZA4pzh0rTN7rx6BhRa9zDNARi2upbn2t8HwJSfHuRIaNfODq2xss5kcc65A6QtanSPZMrFAJIN5y41TFjqxxT1opOIdiwvwRLMzOquqA8HPYnXsvdKGFMblGb4Ul8eEs1EjCky1DYzXMqC96oSzcoLyJ7bJG7cCZ2zm"  # Muss ein Write-Token sein!

# Pi Info auslesen
HOSTNAME=$(hostname)
MAC_ADDRESS=$(cat /sys/class/net/eth0/address 2>/dev/null || cat /sys/class/net/wlan0/address | tr -d ':' | tail -c 7)
IP_ADDRESS=$(hostname -I | awk '{print $1}')
UPTIME_SECONDS=$(awk '{print int($1)}' /proc/uptime)

# Kiosk-ID bestimmen
if [[ "$HOSTNAME" =~ rpi([0-9]+) ]]; then
    KIOSK_ID=$(printf "RPI_%02d" ${BASH_REMATCH[1]})
else
    KIOSK_ID="RPI_${MAC_ADDRESS: -2}"
fi

# Check ob Chromium läuft
CHROMIUM_RUNNING=false
if pgrep -x chromium > /dev/null; then
    CHROMIUM_RUNNING=true
fi

# Timestamp
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Update Status in Sanity
# Suche Device mit diesem kioskId und update den Status
curl -X POST \
  "https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/${SANITY_DATASET}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SANITY_TOKEN}" \
  -d '{
    "mutations": [
      {
        "patch": {
          "query": "*[_type == \"kioskDevice\" && kioskId == \"'${KIOSK_ID}'\"][0]",
          "set": {
            "status.online": '${CHROMIUM_RUNNING}',
            "status.lastSeen": "'${TIMESTAMP}'",
            "status.ipAddress": "'${IP_ADDRESS}'",
            "status.uptimeSeconds": '${UPTIME_SECONDS}',
            "status.chromiumRunning": '${CHROMIUM_RUNNING}'
          }
        }
      }
    ]
  }' \
  2>/dev/null

# Log
echo "[$(date)] Heartbeat sent for ${KIOSK_ID} - Online: ${CHROMIUM_RUNNING}" >> /home/museumgh/heartbeat.log
