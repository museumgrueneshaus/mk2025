# Raspberry Pi Kiosk - Quick Start

## 2-Schritte Installation

### 1️⃣ SD-Karte vorbereiten (10 Min.)

**Raspberry Pi Imager:**
- OS: Raspberry Pi OS (64-bit) **with Desktop**
- Hostname: `rpi01` (oder rpi02, rpi03, etc.)
- User: `museumgh`
- Password: `gh2025#`
- WLAN: Dein Netzwerk + Passwort
- SSH: ✓ Aktivieren

**→ Write → SD-Karte in Pi → Pi starten**

---

### 2️⃣ One-Click Setup (5 Min.)

Warte 2 Minuten, dann:

```bash
cd /Users/marcelgladbach/mk2025/rpi-setup
chmod +x one-click-setup.sh
./one-click-setup.sh
```

**Das Skript macht automatisch:**
- ✅ Liest MAC-Adresse & Hostname aus
- ✅ Bestimmt Kiosk-ID automatisch (z.B. `rpi01` → `RPI_01`)
- ✅ Zeigt vorhandene WLANs an
- ✅ Fragt ob zusätzliche WLANs hinzugefügt werden sollen
- ✅ Installiert Pakete (chromium, unclutter, jq)
- ✅ Aktiviert Desktop Autologin (LightDM → Wayland + labwc)
- ✅ Konfiguriert Screen Sharing (Raspberry Pi Connect)
- ✅ Installiert Sanity Heartbeat & Config Sync
- ✅ Registriert Device in Sanity Backend

**Beispiel:**
```
╔══════════════════════════════════════════╗
║  Raspberry Pi Wayland Kiosk Setup       ║
╚══════════════════════════════════════════╝

► Lese Pi-Informationen aus...
✓ Hostname: rpi01
✓ MAC (letzte 6): 4f3a2b
✓ Kiosk-ID: RPI_01
✓ Kiosk URL: https://museumgh.netlify.app/kiosk/RPI_01/video

╔══════════════════════════════════════════╗
║  Vorhandene WLAN-Konfiguration           ║
╚══════════════════════════════════════════╝

Bereits konfigurierte WLANs auf dem Pi:
  ✓ MeinWLAN

╔══════════════════════════════════════════╗
║  Multi-WLAN Konfiguration                ║
╚══════════════════════════════════════════╝

Zusätzliche WLANs hinzufügen? (j/n): j

WLAN #1 (Priorität: 10)
─────────────────────────────────────────
SSID (leer = fertig): Museum-WLAN
Passwort: ****
Name/Beschreibung: museum
✓ WLAN 'Museum-WLAN' hinzugefügt (Priorität: 10)

Weiteres WLAN hinzufügen? (j/n): j

WLAN #2 (Priorität: 9)
─────────────────────────────────────────
SSID (leer = fertig): Hotspot
Passwort: ****
Name/Beschreibung: hotspot
✓ WLAN 'Hotspot' hinzugefügt (Priorität: 9)

Bereit für Installation? (j/n): j
```

Warte bis fertig (~5 Min.), dann:

```bash
ssh museumgh@rpi01.local 'sudo reboot'
```

---

## ✅ Testen (2 Min.)

Warte 2 Minuten, dann:

**Screen Sharing:**
- https://connect.raspberrypi.com/
- Login → rpi01 → Screen Sharing
- Du siehst den Kiosk! 🎬

**Via SSH:**
```bash
ssh museumgh@rpi01.local
ps aux | grep labwc
rpi-connect status
```

---

## 🎯 Features

**Automatische Kiosk-ID:**
- `rpi01` → `RPI_01` → https://museumgh.netlify.app/kiosk/RPI_01/video
- `rpi02` → `RPI_02` → https://museumgh.netlify.app/kiosk/RPI_02/video
- etc.

**Multi-WLAN Support:**
- Zeigt vorhandene WLANs
- Interaktiv neue hinzufügen
- Mit Prioritäten (höhere = bevorzugt)
- Automatischer Fallback

**Setup-Info gespeichert:**
Nach dem Setup findest du eine Datei `pi-RPI_01-info.txt` mit:
- Datum
- Hostname
- MAC-Adresse
- Kiosk-ID
- URL

---

## 🔧 Für mehrere Pis

Einfach wiederholen mit neuem Pi:

```bash
# Pi 2 aufsetzen
./one-click-setup.sh rpi02.local

# Pi 3 aufsetzen
./one-click-setup.sh rpi03.local
```

Kiosk-ID wird automatisch richtig gesetzt!

---

**Gesamt: ~17 Minuten**

Weitere Infos:
- Details: `WAYLAND-KIOSK-SETUP.md`
- Troubleshooting: `README-ONECLICK.md`
- Alle Dateien: `INDEX.md`
