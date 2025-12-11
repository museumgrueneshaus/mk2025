# Raspberry Pi Kiosk Setup - Dateien Übersicht

## 📖 Dokumentation

| Datei | Beschreibung | Wann benutzen |
|-------|--------------|---------------|
| **QUICK-START.md** | ⭐ **START HIER!** 2-Schritte Anleitung | Du willst schnell loslegen |
| **README-ONECLICK.md** | One-Click Setup Dokumentation | Detaillierte Infos zum automatischen Setup |
| **WAYLAND-KIOSK-SETUP.md** | Vollständige Anleitung | Du willst alles verstehen oder manuell installieren |
| **INDEX.md** | Diese Datei | Übersicht aller Dateien |

## 🔧 Skripte

| Datei | Beschreibung | Verwendung |
|-------|--------------|------------|
| **one-click-setup.sh** | ⭐ **Hauptskript** - Komplettes automatisches Setup | `./one-click-setup.sh` |
| **convert-for-pi.sh** | Video-Konvertierung für Pi-kompatibles Format | `./convert-for-pi.sh` |
| **cleanup.sh** | Entfernt alte Konfigurationen | Wird von Setup automatisch aufgerufen |
| **setup.sh** | Remote-Setup auf dem Pi | Wird von one-click-setup.sh aufgerufen |
| **deploy.sh** | Alte Version (nicht mehr nötig) | Veraltet - nutze one-click-setup.sh |

## 📁 Config-Dateien

| Datei | Beschreibung | Zweck |
|-------|--------------|-------|
| **labwc.service** | Systemd User Service für labwc | Startet Wayland Compositor automatisch |
| **labwc-autostart** | Autostart-Skript für labwc | Startet Chromium im Kiosk-Modus |
| **README.md** | Alte README | Veraltet - nutze README-ONECLICK.md |

## 🚀 Empfohlener Workflow

### Neu-Installation (empfohlen)

1. **Lies:** `QUICK-START.md` (2 Minuten lesen)
2. **Führe aus:** `./one-click-setup.sh` (5 Minuten laufen lassen)
3. **Fertig!**

### Manuelle Installation (falls nötig)

1. **Lies:** `WAYLAND-KIOSK-SETUP.md`
2. **Folge** den Schritten manuell
3. **Nutze:** `setup.sh` für einzelne Schritte

### Video-Konvertierung

1. **Nutze:** `convert-for-pi.sh`
2. **Videos** müssen H.264 Main Profile sein
3. **Siehe** Skript für Details

## 🎯 Welche Datei für welches Problem?

| Problem | Datei |
|---------|-------|
| Erste Installation | `QUICK-START.md` |
| Setup schlägt fehl | `README-ONECLICK.md` → Troubleshooting |
| Verstehe Wayland nicht | `WAYLAND-KIOSK-SETUP.md` |
| Videos spielen nicht | `convert-for-pi.sh` |
| Kiosk URL ändern | `README-ONECLICK.md` → "URL später ändern" |
| Mehrere Pis aufsetzen | `README-ONECLICK.md` → "Für mehrere Pis" |
| Screen Sharing geht nicht | `WAYLAND-KIOSK-SETUP.md` → Troubleshooting |

## 📦 Was macht das Setup?

Das **one-click-setup.sh** Skript:

1. ✅ Prüft Pi-Erreichbarkeit
2. ✅ Installiert Pakete (labwc, wayvnc, chromium, rpi-connect)
3. ✅ Fügt User zu Gruppen hinzu (video, input, render)
4. ✅ Aktiviert Raspberry Pi Connect
5. ✅ Konfiguriert labwc Systemd Service
6. ✅ Richtet Chromium Autostart ein
7. ✅ Aktiviert Console Autologin
8. ✅ Räumt alte Configs auf

**Ergebnis:**
- Wayland Desktop (labwc)
- Chromium Kiosk mit deiner URL
- Raspberry Pi Connect Screen Sharing funktioniert
- Alles startet automatisch beim Boot

## 🔄 Version History

| Version | Datum | Änderung |
|---------|-------|----------|
| 1.0 | Dez 2024 | X11/LXDE Setup (Desktop-Skripte) |
| 2.0 | Dez 2025 | Wayland/labwc Setup (dieses Setup) |

**Hauptunterschied:**
- **v1.0:** X11 Desktop, kein Screen Sharing
- **v2.0:** Wayland Desktop, mit Screen Sharing

---

**Start hier:** `QUICK-START.md` → `./one-click-setup.sh` → Fertig! 🎉
