# 🚀 Quick Deploy Guide - Museum Kiosk

## Schnellstart (5 Minuten pro Pi)

### 1️⃣ Image auf SD-Karte schreiben

```bash
# macOS/Linux
xzcat museum-kiosk-*.img.xz | sudo dd of=/dev/sdX bs=4M status=progress

# Windows: Use Raspberry Pi Imager or balenaEtcher
```

### 2️⃣ Kiosk-ID festlegen

SD-Karte mounten und bearbeiten:

```bash
# macOS
echo "pi_01" > /Volumes/boot/museum-config/kiosk-id.txt

# Linux  
echo "pi_01" > /mnt/boot/museum-config/kiosk-id.txt

# Windows
# Öffnen Sie E:\museum-config\kiosk-id.txt im Editor
# Ändern Sie zu pi_01, pi_02, pi_03, etc.
```

### 3️⃣ Server-URL anpassen (einmalig)

```bash
echo "museum.netlify.app" > /Volumes/boot/museum-config/server.txt
```

### 4️⃣ Optional: WLAN konfigurieren

Erstellen Sie `/boot/wpa_supplicant.conf`:

```
country=DE
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
network={
    ssid="Museum-WiFi"
    psk="password123"
}
```

### 5️⃣ Fertig!

1. SD-Karte in Pi stecken
2. Netzwerkkabel anschließen (oder WLAN)
3. Strom anschließen
4. **Automatischer Start in 30 Sekunden!**

---

## 📋 Deployment-Checkliste für 10 Kiosks

### Vorbereitung (einmalig)

- [ ] Museum Kiosk Image gebaut (`museum-kiosk-YYYYMMDD.img.xz`)
- [ ] Netlify-App deployed (`museum.netlify.app`)
- [ ] 10 SD-Karten bereit (min. 8GB)
- [ ] SD-Karten-Schreiber bereit

### Pro SD-Karte (Batch-Prozess)

```bash
# Script für automatisches Setup (deploy-cards.sh)
#!/bin/bash

CARDS=(pi_01 pi_02 pi_03 pi_04 pi_05 pi_06 pi_07 pi_08 pi_09 pi_10)
SERVER="museum.netlify.app"

for ID in "${CARDS[@]}"; do
    echo "=== Preparing $ID ==="
    
    # Write image
    echo "Insert SD card for $ID and press Enter..."
    read
    
    # Find SD card (careful!)
    diskutil list  # macOS
    SD_DEVICE="/dev/disk2"  # CHANGE THIS!
    
    # Write image
    xzcat museum-kiosk-*.img.xz | sudo dd of=$SD_DEVICE bs=4M status=progress
    
    # Mount
    sleep 5
    diskutil mountDisk $SD_DEVICE
    
    # Configure
    echo "$ID" > /Volumes/boot/museum-config/kiosk-id.txt
    echo "$SERVER" > /Volumes/boot/museum-config/server.txt
    
    # Unmount
    diskutil eject $SD_DEVICE
    
    echo "✅ $ID ready! Remove card."
    echo ""
done
```

### Raspberry Pi Setup

| Pi # | Kiosk ID | Location | Display | Status |
|------|----------|----------|---------|--------|
| 1 | pi_01 | Eingang | Samsung 32" | ⬜ |
| 2 | pi_02 | Raum A | LG 27" | ⬜ |
| 3 | pi_03 | Raum B | Samsung 32" | ⬜ |
| 4 | pi_04 | Café | ViewSonic 24" | ⬜ |
| 5 | pi_05 | Shop | LG 32" | ⬜ |
| 6 | pi_06 | Etage 2 | Samsung 27" | ⬜ |
| 7 | pi_07 | Interaktiv | Touch 32" | ⬜ |
| 8 | pi_08 | Kinder | LG 24" | ⬜ |
| 9 | pi_09 | Ausgang | Samsung 32" | ⬜ |
| 10 | pi_10 | Reserve | - | ⬜ |

### Test-Prozedur

1. **Power On Test**
   ```
   ✓ Pi bootet
   ✓ Netzwerk verbunden
   ✓ Browser startet
   ✓ Richtiger Content
   ```

2. **Remote Check**
   ```bash
   # SSH Test
   ssh museum@<pi-ip>
   museum-status
   ```

3. **Content Verification**
   - Öffne: `https://museum.netlify.app/viewer/pi_01`
   - Prüfe: Richtiger Content wird angezeigt

---

## 🔧 Troubleshooting

### Pi zeigt falschen Content

```bash
ssh museum@<pi-ip>
cat /boot/museum-config/kiosk-id.txt
# Falls falsch:
echo "pi_02" | sudo tee /boot/museum-config/kiosk-id.txt
sudo reboot
```

### Schwarzer Bildschirm

1. **Check Network:**
   ```bash
   ping museum.netlify.app
   ```

2. **Check Service:**
   ```bash
   museum-status
   museum-restart
   ```

### Massen-Update (alle Pis)

```bash
# update-all-pis.sh
MUSEUM_PIS="192.168.1.101 192.168.1.102 192.168.1.103"

for PI in $MUSEUM_PIS; do
    echo "Updating $PI..."
    ssh museum@$PI "sudo reboot"
done
```

---

## 📊 Monitoring Dashboard

### Simple Status Check

```bash
#!/bin/bash
# check-all-kiosks.sh

echo "MUSEUM KIOSK STATUS"
echo "==================="

for i in {01..10}; do
    URL="https://museum.netlify.app/viewer/pi_$i"
    if curl -s --head $URL | head -n 1 | grep "200" > /dev/null; then
        echo "✅ pi_$i - Online"
    else
        echo "❌ pi_$i - Offline"
    fi
done
```

---

## 🎯 Pro Tips

1. **Label SD Cards!**
   - Verwenden Sie Aufkleber: "Pi_01 - Eingang"
   
2. **Backup Image**
   - Nach erfolgreicher Konfiguration Image sichern
   
3. **Spare Pi bereithalten**
   - Pi_10 als Reserve konfiguriert
   
4. **Netzwerk-Segregation**
   - Eigenes VLAN für Kiosks: 192.168.100.0/24
   
5. **Remote Management**
   - VPN für externen Zugriff einrichten

---

## 📝 Deployment Log Template

```
DEPLOYMENT LOG - Museum Kiosk System
=====================================
Date: ___________
Technician: ___________

[ ] Images written to SD cards
[ ] Kiosk IDs configured
[ ] Network tested
[ ] All Pis booting correctly
[ ] Content displaying properly
[ ] SSH access verified
[ ] Documentation updated

Notes:
_________________________________
_________________________________

Signature: ______________________
```