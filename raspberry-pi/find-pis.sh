#!/bin/bash
# Findet alle Raspberry Pis im Netzwerk

set -e

PI_USER="museumgh"

echo "╔══════════════════════════════════════════╗"
echo "║  Raspberry Pi Discovery                  ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Suche nach Raspberry Pis im Netzwerk..."
echo "(Dies kann 10-30 Sekunden dauern)"
echo ""

# Try common hostnames
COMMON_HOSTNAMES=("rpi01" "rpi02" "rpi03" "rpi04" "rpi05" "raspberrypi")

declare -a FOUND_PIS

for hostname in "${COMMON_HOSTNAMES[@]}"; do
    if ping -c 1 -W 1 ${hostname}.local &> /dev/null; then
        echo -n "Lese Infos von ${hostname}.local..."

        # Get IP
        IP=$(ping -c 1 ${hostname}.local | grep -oE '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b' | head -1)

        # Get MAC and actual hostname via SSH
        MAC=$(ssh -o StrictHostKeyChecking=no -o ConnectTimeout=2 ${PI_USER}@${hostname}.local "cat /sys/class/net/eth0/address 2>/dev/null || cat /sys/class/net/wlan0/address" 2>/dev/null | tr -d ':' | tail -c 7 || echo "unknown")
        ACTUAL_HOST=$(ssh -o StrictHostKeyChecking=no -o ConnectTimeout=2 ${PI_USER}@${hostname}.local "hostname" 2>/dev/null || echo "$hostname")

        FOUND_PIS+=("${ACTUAL_HOST}|${IP}|${MAC}")
        echo " ✓"
    fi
done

echo ""

if [ ${#FOUND_PIS[@]} -eq 0 ]; then
    echo "✗ Keine Raspberry Pis gefunden!"
    echo ""
    echo "Mögliche Gründe:"
    echo "  - Pis sind nicht eingeschaltet"
    echo "  - Pis sind nicht im gleichen Netzwerk"
    echo "  - Hostname ist anders (nicht rpi01-05 oder raspberrypi)"
    echo ""
    echo "Versuche manuell mit IP-Adresse:"
    echo "  ./one-click-setup.sh 192.168.1.XXX"
    echo ""
    exit 1
fi

echo "╔══════════════════════════════════════════╗"
echo "║  Gefundene Raspberry Pis                 ║"
echo "╚══════════════════════════════════════════╝"
echo ""

printf "%-4s %-15s %-15s %-10s\n" "#" "Hostname" "IP-Adresse" "MAC (6)"
echo "────────────────────────────────────────────────────"

counter=1
for pi in "${FOUND_PIS[@]}"; do
    IFS='|' read -r hostname ip mac <<< "$pi"
    printf "%-4s %-15s %-15s %-10s\n" "$counter" "$hostname" "$ip" "$mac"
    counter=$((counter + 1))
done

echo ""
echo "Gefunden: ${#FOUND_PIS[@]} Raspberry Pi(s)"
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  Auswahl                                 ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Welche Pis sollen aufgesetzt werden?"
echo ""
echo "Optionen:"
echo "  - Einzeln: 1"
echo "  - Mehrere: 1,2,3"
echo "  - Bereich: 1-3"
echo "  - Alle: all"
echo ""
read -p "Auswahl: " selection

# Parse selection
SELECTED_PIS=()

if [ "$selection" = "all" ]; then
    SELECTED_PIS=("${FOUND_PIS[@]}")
elif [[ "$selection" =~ ^[0-9]+-[0-9]+$ ]]; then
    # Range (e.g., 1-3)
    IFS='-' read -r start end <<< "$selection"
    for i in $(seq $start $end); do
        if [ $i -le ${#FOUND_PIS[@]} ]; then
            SELECTED_PIS+=("${FOUND_PIS[$((i-1))]}")
        fi
    done
elif [[ "$selection" =~ ^[0-9,]+$ ]]; then
    # Comma-separated (e.g., 1,3,5)
    IFS=',' read -ra INDICES <<< "$selection"
    for idx in "${INDICES[@]}"; do
        if [ $idx -le ${#FOUND_PIS[@]} ]; then
            SELECTED_PIS+=("${FOUND_PIS[$((idx-1))]}")
        fi
    done
else
    echo "✗ Ungültige Auswahl!"
    exit 1
fi

if [ ${#SELECTED_PIS[@]} -eq 0 ]; then
    echo "✗ Keine Pis ausgewählt!"
    exit 1
fi

echo ""
echo "Ausgewählt: ${#SELECTED_PIS[@]} Pi(s)"
echo ""

for pi in "${SELECTED_PIS[@]}"; do
    IFS='|' read -r hostname ip mac <<< "$pi"
    echo "  ✓ $hostname ($ip)"
done

echo ""
read -p "Diese Pis jetzt aufsetzen? (j/n): " confirm

if [[ ! "$confirm" =~ ^[jJyY]$ ]]; then
    echo "Abgebrochen."
    exit 0
fi

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  Setup wird gestartet                    ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Create a batch setup script
for pi in "${SELECTED_PIS[@]}"; do
    IFS='|' read -r hostname ip mac <<< "$pi"

    echo "════════════════════════════════════════"
    echo "Setup: $hostname ($ip)"
    echo "════════════════════════════════════════"
    echo ""

    # Run one-click-setup for this Pi
    ./one-click-setup.sh $ip

    echo ""
    echo "✓ Setup für $hostname abgeschlossen!"
    echo ""

    # Small delay between setups
    if [ ${#SELECTED_PIS[@]} -gt 1 ]; then
        echo "Warte 5 Sekunden vor nächstem Pi..."
        sleep 5
        echo ""
    fi
done

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  🎉 Alle Setups abgeschlossen!           ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Aufgesetzte Pis:"
for pi in "${SELECTED_PIS[@]}"; do
    IFS='|' read -r hostname ip mac <<< "$pi"
    echo "  ✓ $hostname ($ip)"
done
echo ""
echo "Nächste Schritte:"
echo ""
echo "1. Alle Pis neustarten:"
for pi in "${SELECTED_PIS[@]}"; do
    IFS='|' read -r hostname ip mac <<< "$pi"
    echo "   ssh ${PI_USER}@${ip} 'sudo reboot'"
done
echo ""
echo "2. Nach 2 Minuten Screen Sharing testen:"
echo "   → https://connect.raspberrypi.com/"
echo ""
