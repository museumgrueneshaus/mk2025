# Aktualisierung - Dezember 2025

## Was wurde korrigiert?

Nach Recherche im Dezember 2025 zur aktuellen Raspberry Pi OS Architektur wurden folgende Dateien aktualisiert:

### ✅ Korrigierte Dateien

#### 1. `README.md`
**Änderungen:**
- System-Architektur Sektion komplett überarbeitet
- Korrekte Beschreibung: LightDM → Wayland → labwc → Pixel
- Troubleshooting aktualisiert (graphical.target statt lightdm restart)
- Kiosk URL Änderung (Desktop Autostart statt labwc config)

#### 2. `one-click-setup.sh`
**Änderungen:**
- Kommentare korrigiert: "LightDM → Wayland + labwc"
- `sudo systemctl enable lightdm` bleibt (ist korrekt!)
- Korrekte Architektur-Beschreibung in Ausgaben

#### 3. `README-ONECLICK.md`
**Änderungen:**
- "Was wird installiert" Sektion aktualisiert
- Wayland + labwc kommen mit Bookworm (nicht extra installiert)
- Desktop Autologin (B4) statt Console Autologin
- URL-Änderung via Desktop Autostart
- Sanity Integration hinzugefügt
- Backup-Sektion aktualisiert (autostart statt labwc config)

#### 4. `WAYLAND-KIOSK-SETUP.md`
**Änderungen:**
- Als VERALTET markiert
- Hinweis auf aktuelle Dokumentation (README.md)

#### 5. `SYSTEM-ARCHITEKTUR.md` (NEU)
**Erstellt:**
- Komplette Erklärung der Desktop-Architektur
- Timeline: Buster/Bullseye → Bookworm (wayfire) → Bookworm (labwc)
- Korrekte Stack-Beschreibung mit Diagramm
- Quellen aus offizieller Raspberry Pi Dokumentation

### ❌ NICHT geänderte Dateien (absichtlich)

Diese Dateien sind veraltet/alt und werden nicht mehr genutzt:
- `setup.sh` - Alter manueller Setup (pre one-click)
- `labwc.service` - Alter manueller labwc Service (funktionierte nicht)
- `labwc-autostart` - Alte labwc Config (nicht mehr genutzt)
- `cleanup.sh` - Alter Cleanup (pre one-click)
- `deploy.sh` - Alter Deploy (pre one-click)

Diese bleiben als historische Referenz, werden aber nicht mehr verwendet.

## Die korrekte Architektur

### Raspberry Pi OS Bookworm (aktuell)

```
systemd (graphical.target)
    ↓
LightDM (Login/Session Manager)
    ↓ (startet)
Wayland (Display Server Protocol)
    ↓ (nutzt)
labwc (Wayland Compositor)
    ↓ (rendert)
Pixel Desktop Environment
    ↓ (führt aus)
Desktop Autostart (~/.config/autostart/kiosk.desktop)
    ↓ (startet)
Chromium Kiosk
```

### Timeline

- **Buster/Bullseye:** LightDM → X11 → Openbox → LXDE
- **Bookworm (2023):** LightDM → Wayland → wayfire → Pixel
- **Bookworm (Nov 2024 - heute):** LightDM → Wayland → labwc → Pixel

### Wichtige Erkenntnisse

1. ✅ **LightDM wird NOCH verwendet** - als Login/Session Manager
2. ✅ **Wayland ist Standard** - seit Bookworm für alle Pi-Modelle
3. ✅ **labwc ist aktuell** - seit November 2024 (ersetzt wayfire)
4. ✅ **Desktop Autologin (B4)** - LightDM managed Autologin
5. ✅ **Desktop Autostart** - Standard-Mechanismus für Apps
6. ❌ **Console Autologin + manueller labwc** - Alter Fehlversuch

## Quellen

Informationen basieren auf:
- [A new release of Raspberry Pi OS (Nov 2024)](https://www.raspberrypi.com/news/a-new-release-of-raspberry-pi-os/)
- [Bookworm — the new version of Raspberry Pi OS (2023)](https://www.raspberrypi.com/news/bookworm-the-new-version-of-raspberry-pi-os/)
- [GitHub: Wayland + Desktop Issues](https://github.com/raspberrypi/bookworm-feedback/issues/147)
- [Raspberry Pi Forums: Desktop Environment Discussions](https://forums.raspberrypi.com/)

## Unser Setup ist korrekt

Das aktuelle `one-click-setup.sh` nutzt:

1. ✅ Desktop Autologin (B4) via raspi-config
2. ✅ LightDM enable (startet Wayland + labwc)
3. ✅ Desktop Autostart für Chromium
4. ✅ Sanity Integration für zentrale Verwaltung
5. ✅ Raspberry Pi Connect für Screen Sharing

**Alles funktioniert mit der aktuellen Bookworm-Architektur!**

## Nächste Schritte

Keine weiteren Änderungen nötig. Das Setup ist:
- ✅ Architektur-korrekt
- ✅ Aktuell (Dez 2025)
- ✅ Dokumentiert
- ✅ Sanity-integriert
- ✅ Getestet

**Status:** Ready to use! 🎉

---

**Datum:** 11. Dezember 2025
**Version:** 3.0 (mit korrekter Architektur-Dokumentation)
