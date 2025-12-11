# 🚀 START HIER - Welches Setup brauchst du?

## Situation 1: Pi ist im GLEICHEN Netzwerk ✅

**Du bist zuhause/im Museum und der Pi ist im selben WLAN**

→ **Nutze:** `one-click-setup.sh`

```bash
cd /Users/marcelgladbach/mk2025/rpi-setup
./one-click-setup.sh
```

**Features:**
- ✅ Automatische Pi-Erkennung
- ✅ MAC-Adresse wird ausgelesen
- ✅ Kiosk-ID wird automatisch bestimmt
- ✅ Vorhandene WLANs werden angezeigt
- ✅ WLAN-Passwort Standard: `gh2025#` (einfach Enter drücken)
- ✅ Alles in einem Durchlauf

**Zeit:** ~5 Minuten pro Pi

---

## Situation 2: Pi ist in ANDEREM Netzwerk 🌐

**Pi ist in einem Museum, du arbeitest von zuhause**

→ **Nutze:** Raspberry Pi Connect + `remote-setup-simple.sh`

**Anleitung:** `SETUP-VIA-CONNECT.md`

**Workflow:**
1. Gehe zu https://connect.raspberrypi.com/
2. Finde deinen Pi (z.B. "rpi01")
3. Klicke "Remote Shell"
4. Kopiere Inhalt von `remote-setup-simple.sh` in die Shell
5. Führe aus und folge Anweisungen

**Zeit:** ~10 Minuten pro Pi

---

## Mehrere Pis gleichzeitig?

### Im gleichen Netzwerk:
```bash
# Pi 1
./one-click-setup.sh rpi01.local

# Pi 2
./one-click-setup.sh rpi02.local

# Pi 3
./one-click-setup.sh rpi03.local
```

### In verschiedenen Netzwerken:
- Öffne mehrere Browser-Tabs auf connect.raspberrypi.com
- Öffne Remote Shell für jeden Pi
- Führe Setup parallel aus

---

## Standard-Werte

**Alle Setups verwenden:**
- User: `museumgh`
- Passwort: `gh2025#`
- WLAN-Passwort (Standard): `gh2025#`
- Kiosk-URL Schema: `https://museumgh.netlify.app/kiosk/RPI_XX/video`

**Kiosk-ID wird automatisch bestimmt:**
- `rpi01` → `RPI_01`
- `rpi02` → `RPI_02`
- etc.

---

## Pi-Verwaltung

### Inventory pflegen

Trage alle deine Pis in `pi-inventory.txt` ein:

```
rpi01,RPI_01,Museum Reutte,Hauptausstellung
rpi02,RPI_02,Museum Reutte,Sonderausstellung
rpi03,RPI_03,Außenstelle,Eingang
```

So behältst du den Überblick!

### Setup-Infos

Nach jedem Setup wird eine Info-Datei erstellt:
- Lokal: `pi-RPI_01-info.txt`
- Am Pi: `~/pi-setup-info.txt`

Enthält: Datum, Hostname, MAC, Kiosk-ID, URL

---

## Schnellstart-Checkliste

- [ ] SD-Karte mit Raspberry Pi Imager vorbereiten
  - OS: Raspberry Pi OS (64-bit) with Desktop
  - Hostname: rpi01 (oder rpi02, etc.)
  - User: museumgh / Passwort: gh2025#
  - WLAN konfigurieren
  - SSH aktivieren
- [ ] SD-Karte in Pi, Pi starten
- [ ] 2 Minuten warten
- [ ] Setup durchführen:
  - Im gleichen Netz: `./one-click-setup.sh`
  - Remote: Raspberry Pi Connect + `remote-setup-simple.sh`
- [ ] Bei WLAN-Abfrage: Enter drücken für Standard-Passwort `gh2025#`
- [ ] Warten bis fertig (~5-10 Min)
- [ ] Pi rebooten: `ssh museumgh@rpi01.local 'sudo reboot'`
- [ ] 2 Minuten warten
- [ ] Screen Sharing testen: https://connect.raspberrypi.com/
- [ ] Eintrag in `pi-inventory.txt` machen

---

## Dateien-Übersicht

| Datei | Wofür? |
|-------|--------|
| **START-HIER.md** | 👈 Diese Datei - Entscheidungshilfe |
| **QUICK-START.md** | Schnellanleitung (im gleichen Netz) |
| **SETUP-VIA-CONNECT.md** | Anleitung für Remote-Setup |
| **one-click-setup.sh** | Hauptskript (im gleichen Netz) |
| **remote-setup-simple.sh** | Setup-Skript für Remote Shell |
| **pi-inventory.txt** | Deine Pi-Verwaltung |
| **INDEX.md** | Alle Dateien erklärt |
| **WAYLAND-KIOSK-SETUP.md** | Technische Details |

---

## Bei Problemen

1. **Lies:** `README-ONECLICK.md` → Troubleshooting-Bereich
2. **Prüfe:** Ist Pi erreichbar? `ping rpi01.local`
3. **Prüfe:** Läuft Screen Sharing? `rpi-connect status`
4. **Logs:** In Remote Shell: `journalctl --user -u labwc.service`

---

**Jetzt loslegen!** 🎉

Wähle oben deine Situation und folge der entsprechenden Anleitung.
