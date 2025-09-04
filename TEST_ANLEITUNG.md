# 🚀 Museum Kiosk System - Test-Anleitung

## Schnellstart in 5 Minuten

### 1️⃣ System starten

```bash
# Terminal öffnen und ins Projektverzeichnis wechseln
cd /Users/marcelgladbach/mk2025

# Start-Script ausführen
./start-development.sh
```

Das Script:
- ✅ Startet PostgreSQL Datenbank
- ✅ Startet Strapi Backend
- ✅ Startet Admin Portal
- ✅ Startet Katalog Frontend
- ✅ Zeigt alle URLs an

---

## 2️⃣ Zugriff auf die Services

Nach dem Start (dauert ~30 Sekunden) sind verfügbar:

### 📊 **Strapi Admin** (Backend)
- **URL:** http://localhost:1337/admin
- **Login:** admin@museum.local
- **Passwort:** Museum2024!

### 🎨 **Admin Portal** (Verwaltung)
- **URL:** http://localhost:8080
- Kein Login nötig (Development)

### 📚 **Katalog Frontend** (Besucher-Ansicht)
- **URL:** http://localhost:8081
- Öffentlich zugänglich

### 🗄️ **pgAdmin** (Datenbank-Browser)
- **URL:** http://localhost:5050
- **Login:** admin@museum.local / admin
- Server hinzufügen: Host: `postgres`, User: `museum`, Pass: `museum123`

---

## 3️⃣ Erste Schritte zum Testen

### A) **Erstes Exponat anlegen (Strapi Admin)**

1. Gehe zu http://localhost:1337/admin
2. Login mit admin@museum.local / Museum2024!
3. Links auf **"Content Manager"** → **"Exponat"**
4. Klick **"Create new entry"**
5. Fülle aus:
   - **Inventarnummer:** TEST-001
   - **Titel:** Alte Kaffeemühle
   - **Kurzbeschreibung:** Handbetriebene Kaffeemühle aus Holz, um 1920
   - **Jahr von:** 1920
   - **Epoche:** Neuzeit
6. **Bilder hochladen:** Drag & Drop oder "Add assets"
7. Klick **"Save"** dann **"Publish"**

### B) **Im Katalog anschauen**

1. Öffne http://localhost:8081
2. Das Exponat sollte erscheinen
3. Klick drauf für Details
4. Teste Filter (Epoche, Suche)

### C) **IMDAS Import testen (Admin Portal)**

1. Gehe zu http://localhost:8080
2. Klick auf **"IMDAS Import"**
3. Wähle Format (XML/CSV)
4. Drag & Drop eine Test-Datei

---

## 4️⃣ Test-Daten erstellen

### Option 1: **Manuell (schnell)**
```javascript
// In Strapi Admin 5-10 Test-Exponate anlegen:
- Verschiedene Epochen
- Mit/ohne Bilder
- Mit Audio (MP3)
- Mit Tags
```

### Option 2: **Excel Import**

Erstelle eine Excel-Datei `test-import.csv`:
```csv
inventarnummer,titel,kurzbeschreibung,jahr_von,epoche,material,standort
TEST-001,Spinnrad,Funktionsfähiges Spinnrad aus Eichenholz,1850,Neuzeit,Holz,Vitrine 1
TEST-002,Webstuhl,Kleiner Handwebstuhl für Leinen,1890,Neuzeit,Holz und Metall,Depot
TEST-003,Töpferscheibe,Fußbetriebene Töpferscheibe,1920,Moderne,Holz und Ton,Ausstellung EG
TEST-004,Schmiedehammer,Schwerer Schmiedehammer,1880,Neuzeit,Eisen,Vitrine 3
TEST-005,Butterfass,Holzfass zur Butterherstellung,1900,Neuzeit,Eichenholz,Depot
```

### Option 3: **API Test** (für Entwickler)

```bash
# POST Request zum Erstellen
curl -X POST http://localhost:1337/api/exponate \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "inventarnummer": "API-TEST-001",
      "titel": "Test Objekt via API",
      "kurzbeschreibung": "Erstellt über die API",
      "jahr_von": 1950,
      "epoche": "Moderne"
    }
  }'

# GET Request zum Abrufen
curl http://localhost:1337/api/exponate?populate=*
```

---

## 5️⃣ Features testen

### ✅ **Medien-Upload**
1. Bilder: JPG, PNG (Drag & Drop)
2. Audio: MP3 für Audioguide
3. Video: MP4 für Dokumentation
4. PDFs: Alte Inventarkarten

### ✅ **Such-Funktionen**
- Volltext-Suche
- Filter nach Epoche
- Filter nach Medien (mit Audio/Video)
- Highlights filtern

### ✅ **Verschiedene Ansichten**
- Grid View (Kacheln)
- Listen View (Tabelle)
- Masonry View (Pinterest-Style)

### ✅ **Detail-Modal**
- Bilder-Galerie
- Audio-Player
- Metadaten
- Navigation (vor/zurück)

---

## 6️⃣ IMDAS Test-Daten

### Test XML erstellen:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<objektsammlung>
  <objekt>
    <inventarnummer>IMDAS-001</inventarnummer>
    <objektbezeichnung>Historische Waage</objektbezeichnung>
    <beschreibung>
      <kurz>Balkenwaage aus Messing</kurz>
      <lang>Detaillierte Beschreibung...</lang>
    </beschreibung>
    <datierung>
      <von>1850</von>
      <bis>1900</bis>
    </datierung>
    <material>Messing, Holz</material>
    <masse>
      <hoehe>30</hoehe>
      <breite>40</breite>
      <tiefe>15</tiefe>
    </masse>
  </objekt>
</objektsammlung>
```

Speichern als `imdas-test.xml` und im Admin Portal hochladen.

---

## 7️⃣ Troubleshooting

### ❌ **"Connection refused" Fehler**
```bash
# Prüfen ob Docker läuft
docker ps

# Wenn nicht, Docker Desktop starten
# Dann nochmal: ./start-development.sh
```

### ❌ **Strapi startet nicht**
```bash
# Logs anschauen
docker-compose -f docker-compose.development.yml logs strapi

# Container neu starten
docker-compose -f docker-compose.development.yml restart strapi
```

### ❌ **Keine Bilder im Katalog**
- In Strapi: Exponat → "Publish" klicken
- CORS prüfen: Browser-Console auf Fehler checken

### ❌ **Port bereits belegt**
```bash
# Andere Services auf Ports prüfen
lsof -i :1337  # Strapi
lsof -i :5432  # PostgreSQL
lsof -i :8080  # Admin Portal
lsof -i :8081  # Katalog

# Process beenden mit PID
kill -9 <PID>
```

---

## 8️⃣ Live-Monitoring

### Docker Status:
```bash
# Alle Container anzeigen
docker ps

# Ressourcen-Verbrauch
docker stats

# Logs live verfolgen
docker-compose -f docker-compose.development.yml logs -f
```

### Datenbank inspizieren:
1. Öffne pgAdmin: http://localhost:5050
2. Server hinzufügen (siehe oben)
3. Browse: Databases → museum → Schemas → public → Tables

---

## 9️⃣ Entwickler-Tools

### Strapi API Explorer:
- http://localhost:1337/api/exponate
- http://localhost:1337/api/exponate?populate=*
- http://localhost:1337/api/exponate?filters[epoche][$eq]=Neuzeit

### Browser DevTools:
- F12 öffnen
- Network Tab: API Calls beobachten
- Console: Fehler checken

### Test mit Postman/Insomnia:
- Import: http://localhost:1337/api-docs
- Alle Endpoints testen

---

## 🎯 Test-Checkliste

### Basis-Funktionen:
- [ ] System startet ohne Fehler
- [ ] Strapi Admin erreichbar
- [ ] Login funktioniert
- [ ] Exponat anlegen möglich
- [ ] Bilder hochladen klappt

### Frontend-Tests:
- [ ] Katalog zeigt Exponate
- [ ] Suche funktioniert
- [ ] Filter arbeiten korrekt
- [ ] Detail-Ansicht öffnet
- [ ] Bilder werden angezeigt

### Import-Tests:
- [ ] CSV Import klappt
- [ ] Daten werden korrekt gemappt
- [ ] Bilder werden verknüpft

### Performance:
- [ ] Ladezeiten akzeptabel
- [ ] Keine Memory Leaks
- [ ] Docker stabil

---

## 💡 Nächste Schritte

Wenn alles funktioniert:

1. **Mehr Test-Daten:** 50-100 Objekte für realistischen Test
2. **Echte Bilder:** Aus eurem Museum
3. **Audio-Guides:** Test-MP3s erstellen
4. **QR-Codes:** Generator testen
5. **Deployment:** Auf Hetzner Server

---

## 🆘 Hilfe

### Logs sammeln für Support:
```bash
# Alle Logs in Datei
docker-compose -f docker-compose.development.yml logs > debug.log

# System-Info
echo "=== System Info ===" >> debug.log
docker version >> debug.log
node --version >> debug.log
npm --version >> debug.log
```

### Quick-Reset (Neustart):
```bash
# Alles stoppen und neu starten
docker-compose -f docker-compose.development.yml down
docker-compose -f docker-compose.development.yml up -d

# Komplett-Reset (ACHTUNG: Löscht Daten!)
docker-compose -f docker-compose.development.yml down -v
./start-development.sh
```

---

**Viel Spaß beim Testen! 🚀**

Bei Fragen einfach melden!