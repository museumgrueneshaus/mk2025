# 🎉 Setup komplett vorbereitet!

## Was du jetzt hast

Alle Dateien sind in: `/Users/marcelgladbach/mk2025/rpi-setup/`

### ✅ Vollautomatisches Setup

**Datei:** `one-click-setup.sh`

**Features:**
- Liest MAC-Adresse automatisch aus
- Bestimmt Kiosk-ID automatisch (`rpi01` → `RPI_01`)
- Zeigt vorhandene WLANs
- Fragt nach zusätzlichen WLANs (Standard-Passwort voreingestellt)
- Installiert alles (labwc, wayvnc, chromium, etc.)
- Konfiguriert Screen Sharing
- Speichert Setup-Info

### ✅ Remote-Setup via Raspberry Pi Connect

**Datei:** `remote-setup-simple.sh`

Für Pis in anderen Netzwerken:
- Kopiere Skript in Remote Shell
- Führe aus
- Fertig!

### ✅ Standard-Werte (ALLE aktualisiert!)

```
User: museumgh
Passwort: gh2025#
WLAN-Passwort (Standard): gh2025#
```

## Schnellstart

### Option A: Pi im GLEICHEN Netzwerk

1. SD-Karte vorbereiten (Raspberry Pi Imager)
   - Hostname: `rpi01` (oder rpi02, etc.)
   - User: `museumgh` / Passwort: `gh2025#`
2. Pi starten, 2 Min warten
3. Setup ausführen:
   ```bash
   cd /Users/marcelgladbach/mk2025/rpi-setup
   ./one-click-setup.sh
   ```
4. Bei WLAN-Frage: Einfach Enter drücken (nutzt `gh2025#`)
5. Pi rebooten
6. Screen Sharing testen auf connect.raspberrypi.com

### Option B: Pi in ANDEREM Netzwerk

1. SD-Karte vorbereiten (siehe oben)
2. Pi starten, 2 Min warten
3. Gehe zu https://connect.raspberrypi.com/
4. Klicke auf Pi → Remote Shell
5. Kopiere Inhalt von `remote-setup-simple.sh`
6. Führe in Remote Shell aus
7. Pi rebooten
8. Screen Sharing testen

## Dokumentation

| Datei | Wofür? |
|-------|--------|
| **START-HIER.md** | Entscheidungshilfe: Welches Setup? |
| **QUICK-START.md** | Schnellstart (im gleichen Netz) |
| **SETUP-VIA-CONNECT.md** | Anleitung für Remote-Setup |
| **INDEX.md** | Übersicht aller Dateien |
| **ZUSAMMENFASSUNG.md** | Diese Datei |

## Pi-Verwaltung

**Datei:** `pi-inventory.txt`

Trage hier alle deine Pis ein:
```
rpi01,RPI_01,Museum Reutte,Hauptausstellung
rpi02,RPI_02,Museum Reutte,Sonderausstellung
```

## Was das Setup macht

1. ✅ Installiert Wayland Desktop (labwc)
2. ✅ Installiert Screen Sharing (wayvnc + rpi-connect)
3. ✅ Konfiguriert Chromium Kiosk
4. ✅ Setzt richtige Kiosk-URL: `https://museumgh.netlify.app/kiosk/RPI_XX/video`
5. ✅ Konfiguriert Autologin
6. ✅ Räumt alte Configs auf

## Los geht's!

Lies **START-HIER.md** und wähle dein Setup!

```bash
open START-HIER.md
```

Oder direkt loslegen:
```bash
./one-click-setup.sh
```

🎬 Viel Erfolg!
