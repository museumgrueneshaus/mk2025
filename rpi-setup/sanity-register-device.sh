#!/bin/bash
# Registriert neues Device in Sanity
# Wird vom Setup-Skript aufgerufen oder manuell ausgeführt

SANITY_PROJECT_ID="832k5je1"
SANITY_DATASET="production"
SANITY_TOKEN="skaVkMqYzbkwHfAwuZA4pzh0rTN7rx6BhRa9zDNARi2upbn2t8HwJSfHuRIaNfODq2xss5kcc65A6QtanSPZMrFAJIN5y41TFjqxxT1opOIdiwvwRLMzOquqA8HPYnXsvdKGFMblGb4Ul8eEs1EjCky1DYzXMqC96oSzcoLyJ7bJG7cCZ2zm"  # Write-Token!

# Parameter
KIOSK_ID="$1"
HOSTNAME="$2"
MAC_ADDRESS="$3"
LOCATION="${4:-Unbekannt}"

if [ -z "$KIOSK_ID" ] || [ -z "$HOSTNAME" ] || [ -z "$MAC_ADDRESS" ]; then
    echo "Usage: $0 <KIOSK_ID> <HOSTNAME> <MAC_ADDRESS> [LOCATION]"
    echo "Beispiel: $0 RPI_01 rpi01 f6d351 'Museum Reutte'"
    exit 1
fi

KIOSK_URL="https://museumgh.netlify.app/kiosk/${KIOSK_ID}/video"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "Registriere Device in Sanity..."
echo "  Kiosk-ID: $KIOSK_ID"
echo "  Hostname: $HOSTNAME"
echo "  MAC: $MAC_ADDRESS"
echo "  Location: $LOCATION"
echo ""

# Erstelle Device in Sanity
RESPONSE=$(curl -X POST \
  "https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/${SANITY_DATASET}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SANITY_TOKEN}" \
  -d '{
    "mutations": [
      {
        "createOrReplace": {
          "_type": "kioskDevice",
          "_id": "kioskDevice-'${KIOSK_ID}'",
          "kioskId": "'${KIOSK_ID}'",
          "hostname": "'${HOSTNAME}'",
          "macAddress": "'${MAC_ADDRESS}'",
          "location": "'${LOCATION}'",
          "kioskUrl": "'${KIOSK_URL}'",
          "wlanNetworks": [],
          "status": {
            "online": false,
            "lastSeen": "'${TIMESTAMP}'"
          },
          "setupInfo": {
            "setupDate": "'${TIMESTAMP}'",
            "setupVersion": "2.0",
            "osVersion": "Raspberry Pi OS"
          }
        }
      }
    ]
  }')

if echo "$RESPONSE" | grep -q "kioskDevice"; then
    echo "✓ Device erfolgreich in Sanity registriert!"
    echo ""
    echo "Jetzt kannst du:"
    echo "  1. In Sanity Studio das Device öffnen"
    echo "  2. WLANs hinzufügen"
    echo "  3. Kiosk-URL anpassen"
    echo "  4. Standort-Info ergänzen"
    echo ""
else
    echo "✗ Fehler beim Registrieren!"
    echo "$RESPONSE"
    exit 1
fi
