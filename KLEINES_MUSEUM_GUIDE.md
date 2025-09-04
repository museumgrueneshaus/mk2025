# 🏛️ Museum Kiosk für kleine Museen

## Das Problem
Kleine Museen haben oft:
- Wenig Personal (1-3 Personen)
- Knappe Budgets (< 100€/Monat für IT)
- Keine IT-Experten
- Trotzdem 100-5000 Objekte zu verwalten

## Die Lösung: Keep it Simple!

### ✅ Was wirklich wichtig ist:

#### **Pflichtfelder (nur 3!)**
1. **Inventarnummer** - Ihre bestehende Nummer
2. **Titel** - Was ist es?
3. **Kurzbeschreibung** - 2-3 Sätze

#### **Nützliche Felder (optional)**
- Jahr (z.B. "um 1850" oder "1920-1930")
- Herkunft (z.B. "Familie Müller" oder "Dorfschule")
- Material (z.B. "Holz, Metall")
- Standort (z.B. "Vitrine 3" oder "Depot Regal A")
- Kategorie (Ihre eigenen Kategorien!)

#### **Medien**
- Bilder (einfach reinziehen)
- Audio für Audioguide (optional)

---

## 🚀 In 10 Minuten starten

### 1. Excel-Liste vorbereiten
Ihre bestehende Excel-Liste muss nur diese Spalten haben:
```
| Inventarnummer | Titel | Beschreibung | Jahr | Standort |
|----------------|-------|--------------|------|----------|
| 2024.001 | Spinnrad | Aus dem Nachlass... | 1850 | Vitrine 1 |
```

### 2. Bilder organisieren
```
bilder/
├── 2024.001.jpg    (gleicher Name wie Inventarnummer!)
├── 2024.001_2.jpg  (weitere Ansichten)
├── 2024.002.jpg
```

### 3. Import mit einem Klick
- Excel hochladen
- Bilder-Ordner hochladen
- Fertig!

---

## 💡 Praktische Tipps

### Inventarnummern-System
Bleiben Sie bei Ihrem System! Egal ob:
- `2024.001` (Jahr.Nummer)
- `A-123` (Kategorie-Nummer)  
- `Inv 4567` (Alte Nummern)

### Kategorien anpassen
Passen Sie die Kategorien an Ihr Museum an:

**Heimatmuseum:**
- Alltag
- Handwerk
- Landwirtschaft
- Vereine
- Schule

**Kunstmuseum:**
- Gemälde
- Skulpturen
- Grafik
- Fotografie

**Industriemuseum:**
- Maschinen
- Werkzeuge
- Produkte
- Dokumente

### Standort-System
Einfaches System das jeder versteht:
- "Raum 1, Vitrine 2"
- "Depot, Regal A, Fach 3"
- "Ausleihe bis 31.12.2024"

---

## 📱 Für Besucher

### 3 Modi - je nach Bedarf:

#### 1. **Slideshow** (Eingang)
- Läuft automatisch
- Zeigt Highlights
- Kein Personal nötig

#### 2. **Katalog** (Touchscreen)
- Besucher können stöbern
- Nach Kategorien filtern
- Details ansehen

#### 3. **QR-Codes** (BYOD)
- QR-Code am Objekt
- Besucher scannt mit Handy
- Sieht Details + Audio

---

## 💰 Kosten

### Einmalig:
- Raspberry Pi: 80€
- Touchscreen: 200€ (optional)
- **Gesamt: 80-280€**

### Monatlich:
- Hosting (Hetzner): 5€
- Domain: 1€
- **Gesamt: 6€/Monat**

---

## 🛠️ Wartung

### Täglich (2 Minuten):
- Kurzer Blick ob alles läuft
- Bei Problemen: Aus/An schalten

### Wöchentlich (10 Minuten):
- Neue Objekte hinzufügen
- Bilder hochladen

### Monatlich (30 Minuten):
- Backup prüfen
- Updates installieren (automatisch)

---

## 🆘 Wenn was nicht geht

### Problem 1: Bildschirm schwarz
**Lösung:** Stecker raus, 10 Sekunden warten, wieder rein

### Problem 2: Neue Objekte erscheinen nicht
**Lösung:** Im Admin auf "Veröffentlichen" klicken

### Problem 3: Bilder werden nicht angezeigt
**Lösung:** Bildname = Inventarnummer (z.B. 2024.001.jpg)

---

## 📊 IMDAS/Excel Import

### Von IMDAS:
Falls Sie IMDAS nutzen:
1. Export als CSV/Excel
2. Hochladen
3. Automatische Zuordnung

### Von Excel:
Ihre Excel muss nur haben:
- Inventarnummer (Pflicht)
- Titel (Pflicht)
- Rest ist optional

### Beispiel Excel:
```excel
Inventarnummer | Titel | Beschreibung | Jahr | Kategorie
123 | Kaffeemühle | Handbetrieben, Holz | 1920 | Alltag
124 | Sense | Für Getreideernte | 1890 | Landwirtschaft
```

---

## ⭐ Best Practices für kleine Museen

### 1. Klein anfangen
- Erst 10 Highlight-Objekte
- Dann Kategorie für Kategorie
- Nicht alles auf einmal

### 2. Einfache Texte
- Kurze Sätze
- Keine Fachbegriffe
- Geschichten erzählen

### 3. Gute Bilder
- Handy-Fotos reichen!
- Gutes Licht wichtig
- Mehrere Ansichten

### 4. Zusammenarbeit
- Ehrenamtliche einbeziehen
- Schüler können helfen
- Lokalzeitung einladen

---

## 🎯 Schritt-für-Schritt Start

### Woche 1: Vorbereitung
- [ ] Excel-Liste mit 20 Objekten
- [ ] Fotos von diesen Objekten
- [ ] Kategorien festlegen

### Woche 2: Installation
- [ ] System installieren (lassen)
- [ ] Erste Objekte importieren
- [ ] Testen und anpassen

### Woche 3: Erweiterung
- [ ] Weitere Objekte hinzufügen
- [ ] Audioguide für Highlights
- [ ] QR-Codes drucken

### Woche 4: Live!
- [ ] Kiosk aufstellen
- [ ] Besucher-Feedback sammeln
- [ ] Feintuning

---

## 💬 Kontakt & Support

### Community:
- Facebook-Gruppe: "Digitale Kleinmuseen"
- WhatsApp-Support: +49 xxx

### Direkthilfe:
- TeamViewer-Support
- Vor-Ort-Hilfe durch Nachbarmuseum
- Schulungen 2x im Jahr

---

## 🌟 Erfolgsgeschichten

**Heimatmuseum Beispieldorf (300 Objekte):**
> "In 2 Wochen komplett digital. Besucher lieben den Touchscreen!"

**Schulmuseum Altstadt (150 Objekte):**
> "Schüler haben alle Objekte fotografiert. Tolles Projekt!"

**Handwerksmuseum (500 Objekte):**
> "QR-Codes sind der Hit! Besucher bleiben länger."

---

## 📝 Notizen

```
Platz für Ihre Notizen:
_________________________________
_________________________________
_________________________________
```

**Wichtig:** Sie müssen NICHT alle Features nutzen! 
Fangen Sie klein an und wachsen Sie mit Ihren Bedürfnissen.