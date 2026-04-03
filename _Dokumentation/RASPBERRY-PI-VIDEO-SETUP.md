# Raspberry Pi Video Player Setup

## Was wurde erstellt

### 1. Backend (Sanity CMS)

#### Erweitertes Schema: `kiosk-config.js`
- **Video-Loop Modus** hinzugefügt mit folgenden Features:
  - **Playlist**: Videos & Bilder gemischt
  - **Video-Upload**: MP4, WebM, MOV Dateien direkt hochladen
  - **Video-URLs**: Alternativ YouTube, Vimeo oder direkte Links
  - **Bild-Upload**: Mit konfigurierbarer Anzeigedauer
  - **Overlay**: Titel & Beschreibung während Wiedergabe
  - **Audio**: Lautstärke und Stumm-Schaltung
  - **Loop**: Endlos-Wiedergabe
  - **Shuffle**: Zufällige Reihenfolge
  - **Übergänge**: Fade, Schwarz, Kein Effekt

### 2. Frontend (Astro)

#### Neue Seite: `/kiosk/[id].astro`
Vollständiger Video Player mit:
- **Autoplay & Loop**: Automatische Wiedergabe im Endlos-Modus
- **Playlist-Management**: Gemischte Videos & Bilder
- **Smooth Transitions**: Fade-Effekte zwischen Items
- **Info-Overlay**: Titel & Beschreibung einblendbar
- **Progress Indicator**: Aktueller Index / Gesamt
- **Keyboard Controls**:
  - `→` / `n`: Nächstes Video
  - `←` / `p`: Vorheriges Video
  - `Leertaste`: Pause/Play (nur Videos)
  - `Escape`: Fullscreen beenden
- **Touch Controls**: Swipe links/rechts
- **Raspberry Pi optimiert**:
  - Hardware-beschleunigtes Video
  - Cursor auto-hide nach 3 Sekunden
  - Preloading für smooth playback
- **Responsive**: Funktioniert auf allen Bildschirmgrößen

#### Erweitert: `src/lib/sanity.js`
Neue Funktionen:
- `getKioskConfig(identifier)` - Lädt Config per MAC, IP, Name oder ID
- `fileUrl(ref)` - Helper für Sanity File URLs

## So richtest du es ein

### Im Sanity Studio

1. **Öffne Sanity Studio**:
   - Lokal: http://localhost:3333/
   - Online: https://museumghbackend.sanity.studio/

2. **Erstelle neue Kiosk Konfiguration**:
   - Klicke auf "Kiosk Konfiguration" → "Create"
   - **Kiosk Name**: "Beamer Ausstellung" (oder eigener Name)
   - **Standort**: "50 Jahre Museumsverein Raum"
   - **MAC-Adresse**: `B8:27:EB:12:34:56` (ersetze mit echter Pi MAC)
   - **Standard-Modus**: Wähle "Video-Loop"

3. **Konfiguriere Video Playlist**:

   Klicke auf "Video-Loop Einstellungen" → "Video Playlist" → "Add item"

   **Beispiel-Setup (4-5 Videos + Bilder dazwischen)**:

   **Item 1 - Intro Bild**:
   - Typ: `Bild`
   - Bild hochladen (z.B. Logo oder Willkommens-Slide)
   - Titel: "Willkommen"
   - Beschreibung: "50 Jahre Museumsverein Reutte"
   - Anzeigedauer: `5` Sekunden

   **Item 2 - Video 1**:
   - Typ: `Video`
   - Video-Datei hochladen (MP4) ODER
   - Video-URL eingeben (z.B. YouTube Link)
   - Titel: "Geschichte 1975-1985"
   - Beschreibung: "Die ersten Jahre"

   **Item 3 - Trenn-Bild**:
   - Typ: `Bild`
   - Bild hochladen (z.B. historisches Foto)
   - Titel: "Meilenstein 1985"
   - Anzeigedauer: `8` Sekunden

   **Item 4 - Video 2**:
   - Typ: `Video`
   - Video hochladen
   - Titel: "Wachstum 1985-2000"

   **Item 5 - Trenn-Bild**:
   - Typ: `Bild`
   - Bild hochladen
   - Titel: "25 Jahre Jubiläum"
   - Anzeigedauer: `8` Sekunden

   **Item 6 - Video 3**:
   - Typ: `Video`
   - Video hochladen
   - Titel: "Moderne 2000-2025"

   ... und so weiter für 4-5 Videos

4. **Weitere Einstellungen**:
   - **Endlos-Schleife**: ✅ An
   - **Zufällige Reihenfolge**: ❌ Aus
   - **Info-Overlay anzeigen**: ✅ An
   - **Overlay-Position**: "Unten links"
   - **Übergangseffekt**: "Überblenden"
   - **Lautstärke**: `70` (0-100)
   - **Stumm schalten**: ❌ Aus (außer gewünscht)

5. **Design**:
   - **Farbschema**: "Modern Dunkel"
   - **Schriftgröße**: "Groß" (besser lesbar auf Beamer)

6. **Funktionen**:
   - **Idle-Timeout**: `0` (kein Timeout für Dauerloop)
   - **Uhrzeit anzeigen**: ❌ Aus

7. **Speichern & Aktivieren**:
   - Scrolle nach unten
   - **Kiosk aktiv**: ✅ An
   - Klicke "Publish"

## Zugriff auf den Video Player

### Via URL
Der Player kann über verschiedene Identifier aufgerufen werden:

```
http://localhost:4321/kiosk/[identifier]
```

Wobei `[identifier]` sein kann:
- **Document ID**: `http://localhost:4321/kiosk/abc123xyz`
- **Kiosk Name**: `http://localhost:4321/kiosk/beamer-ausstellung`
- **MAC-Adresse**: `http://localhost:4321/kiosk/B8:27:EB:12:34:56`
- **IP-Adresse**: `http://localhost:4321/kiosk/192.168.1.100`

### Raspberry Pi Setup

#### 1. Raspberry Pi OS installieren
```bash
# Raspberry Pi OS Lite (Empfohlen für Performance)
# Oder Raspberry Pi OS Desktop (mit GUI)
```

#### 2. Chromium im Kiosk-Modus
```bash
# Installiere Chromium
sudo apt update
sudo apt install -y chromium-browser unclutter

# Erstelle Autostart-Script
nano ~/.config/lxsession/LXDE-pi/autostart

# Füge hinzu:
@chromium-browser --kiosk --noerrdialogs --disable-infobars \
  --disable-session-crashed-bubble --incognito \
  http://YOUR-SERVER-IP:4321/kiosk/beamer-ausstellung

@unclutter -idle 0.1
```

#### 3. Oder: Headless mit framebuffer
```bash
# Für bessere Performance ohne Desktop
sudo apt install -y chromium-browser xorg

# Start script
DISPLAY=:0 chromium-browser --kiosk --noerrdialogs \
  http://YOUR-SERVER-IP:4321/kiosk/beamer-ausstellung
```

#### 4. Automatischer Start beim Boot
```bash
# Crontab bearbeiten
crontab -e

# Hinzufügen:
@reboot sleep 10 && DISPLAY=:0 chromium-browser --kiosk http://YOUR-SERVER-IP:4321/kiosk/beamer-ausstellung
```

#### 5. Screen-Blanking deaktivieren
```bash
# /etc/xdg/lxsession/LXDE-pi/autostart
@xset s off
@xset -dpms
@xset s noblank
```

## Video Formate & Empfehlungen

### Optimale Formate für Raspberry Pi
- **Container**: MP4 (H.264)
- **Video Codec**: H.264 (hardware-beschleunigt auf Pi 4)
- **Audio Codec**: AAC
- **Auflösung**: 1920x1080 (Full HD)
- **Framerate**: 25-30 fps
- **Bitrate**: 4-8 Mbps

### Video-Konvertierung (falls nötig)
```bash
# Mit ffmpeg konvertieren für optimale Wiedergabe
ffmpeg -i input.mov -c:v h264 -preset slow -crf 22 -c:a aac -b:a 192k output.mp4
```

### Dateigrößen-Empfehlungen
- **3 Min Video**: ca. 100-200 MB (bei 8 Mbps)
- **10 Min Video**: ca. 300-600 MB
- **Bilder**: 1920x1080, JPEG, <2 MB

### Wo Videos hochladen?
1. **Sanity Studio**: Direkt in der Playlist (empfohlen für <100MB)
2. **Externe URLs**:
   - YouTube (Embed-Link)
   - Vimeo (Direct Link)
   - Eigener Server/CDN

## Features

### ✅ Was funktioniert
- Automatische Wiedergabe beim Start
- Endlos-Loop aller Videos & Bilder
- Smooth Fade-Überblende zwischen Items
- Overlay mit Titel & Beschreibung
- Progress Indicator (aktuelles Item / gesamt)
- Keyboard & Touch Controls
- Preloading für flüssige Wiedergabe
- Responsive Design
- Cursor auto-hide

### 🎮 Steuerung
- **Pfeiltasten Links/Rechts**: Vor/Zurück navigieren
- **N**: Nächstes (Next)
- **P**: Vorheriges (Previous)
- **Leertaste**: Pause/Play (nur bei Videos)
- **Escape/Q**: Fullscreen beenden
- **Touch Swipe**: Links/Rechts wischen

### 🔧 Anpassungen
Alle Einstellungen im Sanity Studio änderbar:
- Playlist-Reihenfolge (Drag & Drop)
- Video-/Bild-Dauer
- Overlay-Position & -Inhalt
- Übergangseffekte
- Audio-Einstellungen
- Loop & Shuffle

## Troubleshooting

### Videos laden nicht
- Prüfe Video-Format (H.264 MP4 empfohlen)
- Prüfe Dateigröße (Sanity Limit: 200MB)
- Nutze externe URL für große Files

### Ruckelige Wiedergabe
- Reduziere Video-Bitrate
- Nutze H.264 statt HEVC/H.265
- Raspberry Pi 4 empfohlen (besser als Pi 3)
- Overclocking erwägen

### Kein Audio
- Prüfe "Stumm schalten" in Config
- Prüfe Lautstärke-Einstellung
- Audio-Output auf Beamer/HDMI setzen:
  ```bash
  sudo raspi-config
  # → Advanced Options → Audio → HDMI
  ```

### Player startet nicht
- Prüfe ob Kiosk-Config aktiv ist
- Prüfe Identifier (Name, MAC, ID)
- Browser-Console öffnen (F12) für Fehler

## Performance-Tipps

### Raspberry Pi 4 empfohlen
- Mindestens 2GB RAM (4GB besser)
- Aktive Kühlung empfohlen
- Overclocking möglich für bessere Performance

### Netzwerk
- LAN statt WiFi (für große Videos)
- Videos lokal in Sanity hosten (besser als Streaming)
- Oder: Videos auf lokalem Server im Museum-Netzwerk

### Preloading
- Player lädt nächstes Video im Hintergrund
- Smooth Übergang garantiert
- Kein Laden-Screen zwischen Videos

## Nächste Schritte

1. **Videos vorbereiten**: 4-5 Videos (je 3-10 Min) konvertieren
2. **Sanity Studio**: Kiosk-Config erstellen & Videos hochladen
3. **Testen**: Lokal im Browser testen (http://localhost:4321/kiosk/...)
4. **Raspberry Pi**: Pi vorbereiten & Chromium Kiosk-Modus einrichten
5. **Deployment**: Frontend deployen oder Pi auf lokalen Server zeigen

## Files

### Backend
- `schemas/kiosk-config.js` - Erweitert mit Video-Loop Settings

### Frontend
- `src/pages/kiosk/[id].astro` - Video Player Seite
- `src/lib/sanity.js` - API erweitert (getKioskConfig, fileUrl)

### Dokumentation
- `RASPBERRY-PI-VIDEO-SETUP.md` - Diese Datei

---

**Erstellt am**: 2. Dezember 2025
**Status**: ✅ Komplett & einsatzbereit
