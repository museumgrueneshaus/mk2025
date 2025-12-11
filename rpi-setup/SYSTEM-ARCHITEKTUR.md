# Raspberry Pi OS Bookworm - System-Architektur

## Aktueller Stand (Dezember 2025)

Nach Recherche im Dezember 2025 - hier ist der tatsächliche Aufbau:

### Die Stack-Architektur

```
┌─────────────────────────────────────┐
│      Pixel Desktop Environment      │  ← Desktop, Icons, Panels
├─────────────────────────────────────┤
│        labwc (Wayland Compositor)   │  ← Window Management, Compositing
├─────────────────────────────────────┤
│             Wayland Protocol        │  ← Display Server Protocol
├─────────────────────────────────────┤
│    LightDM (Display/Login Manager)  │  ← Session Management, Autologin
├─────────────────────────────────────┤
│         systemd (graphical.target)  │  ← System Init
└─────────────────────────────────────┘
```

### Die Komponenten

#### 1. LightDM - Display/Login Manager
**Funktion:**
- Startet beim Boot (via graphical.target)
- Managed User Sessions
- Handled Autologin
- Startet die Desktop-Session

**Config:**
- `/etc/lightdm/lightdm.conf`
- Autologin via `raspi-config nonint do_boot_behaviour B4`

**Wichtig:**
- LightDM ist NICHT der Desktop selbst
- LightDM startet die Session (Wayland + labwc)
- Bei Autologin: Kein Login-Screen, direkt zu Desktop

#### 2. Wayland - Display Server Protocol
**Funktion:**
- Modernes Display-Protocol (Ersatz für X11)
- Direktere Kommunikation zwischen Apps und Hardware
- Bessere Performance, weniger Overhead

**Seit wann:**
- Raspberry Pi 4/5: Default seit Bookworm (2023)
- Raspberry Pi 2/3: Default seit November 2024

#### 3. labwc - Wayland Compositor
**Funktion:**
- Window Management (Fenster verschieben, resizen, etc.)
- Compositing (Grafik-Effekte, Rendering)
- Basiert auf wlroots

**Timeline:**
- **2023:** Bookworm kam mit wayfire als Compositor
- **Nov 2024:** Umstellung auf labwc (schneller, stabiler)
- wayfire wird nicht mehr weiterentwickelt

**Warum labwc:**
- Läuft genauso schnell wie X11 auf älteren Pi-Modellen
- Weniger Ressourcen als wayfire
- Bessere Kompatibilität

#### 4. Pixel - Desktop Environment
**Funktion:**
- Der eigentliche Desktop (Icons, Panels, File Manager)
- LXDE-basiert
- Läuft auf Wayland/labwc

## Evolution der Desktop-Architektur

### Alte Versionen (Buster, Bullseye)
```
LightDM → X11 → Openbox → LXDE/Pixel
```

### Bookworm (2023)
```
LightDM → Wayland → wayfire → Pixel
```

### Bookworm (Nov 2024 - Heute)
```
LightDM → Wayland → labwc → Pixel
```

## Was bedeutet das für unser Kiosk-Setup?

### Autologin-Flow

1. **Boot:** systemd startet graphical.target
2. **LightDM startet:** Liest `/etc/lightdm/lightdm.conf`
3. **Autologin aktiv:** Kein Login-Screen, direkter Start als User `museumgh`
4. **Session startet:** LightDM startet Wayland + labwc Session
5. **Desktop lädt:** Pixel Desktop wird geladen
6. **Autostart:** `~/.config/autostart/kiosk.desktop` wird ausgeführt
7. **Chromium startet:** Im Kiosk-Modus

### Warum funktioniert unser Setup?

```bash
# 1. Desktop Autologin aktivieren
sudo raspi-config nonint do_boot_behaviour B4

# 2. Graphical Target setzen
sudo systemctl set-default graphical.target

# 3. LightDM enablen (falls deaktiviert)
sudo systemctl enable lightdm

# 4. Chromium Autostart via Desktop-Autostart
cat > ~/.config/autostart/kiosk.desktop << 'EOF'
[Desktop Entry]
Type=Application
Name=Museum Kiosk
Exec=chromium --kiosk ... --app=URL
X-GNOME-Autostart-enabled=true
EOF
```

**Das Setup:**
- Nutzt LightDM für Autologin (offizieller Weg)
- Nutzt Desktop Autostart für Chromium (standard konform)
- Funktioniert mit Wayland/labwc automatisch
- Kein custom systemd service nötig
- Kein getty/console autologin gehacke

## Raspberry Pi Connect & Wayland

**Funktioniert perfekt:**
- Raspberry Pi Connect unterstützt Wayland nativ
- Screen Sharing funktioniert mit labwc
- Keine X11-spezifischen Probleme

## Unterschied zu unserem ersten Versuch

### Was wir NICHT machen sollten:
```bash
# FALSCH: Console Autologin + manueller labwc Start
sudo raspi-config nonint do_boot_behaviour B2  # Console autologin
# + labwc als systemd user service
# → Probleme, Crash Loops, kein Desktop
```

### Was wir JETZT machen (richtig):
```bash
# RICHTIG: Desktop Autologin via LightDM
sudo raspi-config nonint do_boot_behaviour B4  # Desktop autologin
# → LightDM managed alles
# → Wayland + labwc wird automatisch gestartet
# → Desktop Autostart funktioniert standard-konform
```

## Sources

Die Informationen basieren auf offizieller Raspberry Pi Dokumentation und Community-Feedback:

- [A new release of Raspberry Pi OS (Nov 2024)](https://www.raspberrypi.com/news/a-new-release-of-raspberry-pi-os/)
- [Bookworm — the new version of Raspberry Pi OS (2023)](https://www.raspberrypi.com/news/bookworm-the-new-version-of-raspberry-pi-os/)
- [GitHub: Wayland + Desktop Issues](https://github.com/raspberrypi/bookworm-feedback/issues/147)
- [Raspberry Pi Forums: Desktop Environment](https://forums.raspberrypi.com/viewtopic.php?t=357635)

## Zusammenfassung

**Was wir gelernt haben:**

1. ✅ LightDM wird NOCH verwendet (Login Manager)
2. ✅ Wayland ist der Display Server (nicht X11)
3. ✅ labwc ist der Compositor (seit Nov 2024)
4. ✅ Pixel läuft auf Wayland/labwc
5. ✅ Desktop Autologin (B4) ist der richtige Weg
6. ✅ Desktop Autostart für Apps funktioniert perfekt

**Unser Setup ist korrekt:**
- Nutzt offizielle Mechanismen
- Kompatibel mit aktueller Architektur
- Funktioniert mit Raspberry Pi Connect
- Stabil und wartbar
