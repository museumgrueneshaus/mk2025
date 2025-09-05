# Raspberry Pi Kiosk Setup

## Übersicht
Diese Konfiguration verwandelt einen Raspberry Pi in einen Kiosk-Client für das Museum Kiosk System. Jeder Pi startet automatisch im Vollbildmodus und lädt seine spezifische Konfiguration basierend auf seiner MAC-Adresse.

## Voraussetzungen
- Raspberry Pi 3B+ oder neuer
- Raspberry Pi OS Lite (64-bit empfohlen)
- Ethernet-Verbindung (empfohlen) oder WLAN
- HDMI-Display

## Installation

### 1. Raspberry Pi OS installieren
1. Laden Sie Raspberry Pi Imager herunter
2. Wählen Sie "Raspberry Pi OS (64-bit)"
3. Konfigurieren Sie:
   - Hostname: `kiosk-01` (oder fortlaufend)
   - Benutzer: `pi`
   - SSH aktivieren
   - WLAN konfigurieren (falls benötigt)

### 2. Erste Verbindung
```bash
ssh pi@kiosk-01.local
```

### 3. Setup-Dateien übertragen
```bash
# Auf Ihrem Computer:
scp -r raspberry-pi-setup/* pi@kiosk-01.local:/home/pi/
```

### 4. Setup ausführen
```bash
# Auf dem Raspberry Pi:
cd /home/pi
chmod +x setup.sh
sudo ./setup.sh
```

### 5. Konfiguration anpassen
Bearbeiten Sie die Frontend-URL in `/home/pi/start_kiosk.sh`:
```bash
nano /home/pi/start_kiosk.sh
# Ändern Sie FRONTEND_URL zu Ihrer Netlify-URL
```

### 6. MAC-Adresse registrieren
1. MAC-Adresse anzeigen:
```bash
ip link show eth0 | grep ether
```
2. Diese MAC-Adresse in Strapi als neuen Kiosk registrieren

### 7. Neustart
```bash
sudo reboot
```

## Wartung

### Logs anzeigen
```bash
journalctl -u kiosk.service -f
```

### Service neu starten
```bash
sudo systemctl restart kiosk.service
```

### Konfiguration ändern
Nach Änderungen an `/home/pi/start_kiosk.sh`:
```bash
sudo systemctl restart kiosk.service
```

### Readonly-Filesystem temporär beschreibbar machen
```bash
sudo mount -o remount,rw /
# Änderungen vornehmen
sudo mount -o remount,ro /
```

## Fehlerbehebung

### Schwarzer Bildschirm
- Prüfen Sie die Netzwerkverbindung
- Überprüfen Sie die Logs: `journalctl -u kiosk.service`
- Stellen Sie sicher, dass die MAC-Adresse in Strapi registriert ist

### Browser startet nicht
- Überprüfen Sie die Frontend-URL in `start_kiosk.sh`
- Testen Sie die URL manuell: `curl https://your-frontend.netlify.app`

### Netzwerkprobleme
- Ethernet-Kabel prüfen
- WLAN-Konfiguration überprüfen: `sudo raspi-config`
- DNS testen: `ping google.com`

## Sicherheit

### Firewall einrichten
```bash
sudo apt-get install ufw
sudo ufw allow ssh
sudo ufw enable
```

### SSH-Zugang beschränken
Bearbeiten Sie `/etc/ssh/sshd_config`:
```
PasswordAuthentication no
PubkeyAuthentication yes
```

### Automatische Updates
```bash
sudo apt-get install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
```

## Performance-Optimierung

### GPU-Speicher erhöhen
In `/boot/config.txt`:
```
gpu_mem=256
```

### Overclocking (optional, mit Vorsicht)
In `/boot/config.txt`:
```
arm_freq=1400
over_voltage=2
sdram_freq=500
```

## Backup & Recovery

### SD-Karten-Image erstellen
```bash
# Auf einem anderen Computer:
sudo dd if=/dev/mmcblk0 of=kiosk-backup.img bs=4M status=progress
```

### Image wiederherstellen
```bash
sudo dd if=kiosk-backup.img of=/dev/mmcblk0 bs=4M status=progress
```

## Massen-Deployment

Für mehrere Kiosks:

1. Erstellen Sie ein Master-Image nach der Konfiguration
2. Schreiben Sie das Image auf alle SD-Karten
3. Jeder Pi wird automatisch seine eigene MAC-Adresse verwenden
4. Registrieren Sie alle MAC-Adressen in Strapi

## Monitoring

### Remote-Überwachung mit SSH
```bash
# CPU-Temperatur
vcgencmd measure_temp

# Speichernutzung
free -h

# Prozesse
htop
```

### Automatisches Reporting
Fügen Sie zu `/home/pi/start_kiosk.sh` hinzu:
```bash
# Status-Report senden (optional)
curl -X POST https://your-monitoring.com/api/kiosk-status \
  -H "Content-Type: application/json" \
  -d "{\"mac\":\"$MAC_ADDRESS\",\"status\":\"online\"}"
```