# Museum Kiosk System - Praktischer Ansatz

## Unsere Philosophie: "Standards light"

Wir nutzen die **bewährten Strukturen** der Museums-Standards, aber **ohne den Overhead**. 
Das System kann später jederzeit in LIDO, SPECTRUM oder Dublin Core exportieren.

## 📊 Datenstruktur (vereinfacht aber vollständig)

### Kern-Identifikation
- **inventarnummer** → Eure bestehende Nummer (egal welches System)
- **titel** → Objektbezeichnung
- **kurzbeschreibung** → Für Besucher (einfache Sprache)
- **beschreibung** → Ausführlich (mit Formatierung möglich)

### Zeitliche Einordnung  
- **jahr_von / jahr_bis** → Flexibel (auch "um 1850" möglich)
- **epoche** → Vordefiniert ODER eigene Epochen

### Physische Eigenschaften
- **material** → Freitext (z.B. "Holz, Eisen, Leder")
- **masse** → Freitext (z.B. "30 x 20 x 10 cm, 500g")
- **entstehungsort** → Ort/Region

### Personen & Herkunft
- **kuenstler** → Hersteller/Künstler (wenn bekannt)
- **leihgeber** → Wichtig für kleine Museen!

### Organisation
- **standort** → Euer System (Vitrine 3, Depot A, etc.)
- **tags** → Flexibles Tagging-System
- **metadaten** → Catch-all für spezielle Infos

### Medien (das Herzstück!)
- **bilder** → Mehrere, verschiedene Ansichten
- **hauptbild** → Für Übersichten
- **audio** → Audioguides (mehrsprachig möglich)
- **videos** → Dokumentationen
- **dokumente** → PDFs, alte Inventarkarten, etc.

### Status
- **ist_highlight** → Für Hauptattraktionen
- **reihenfolge** → Für geführte Touren

## 🔄 IMDAS Import - Pragmatisch

```javascript
// Automatisches Mapping - Best Effort
IMDAS → Museum Kiosk
─────────────────────
Inventarnummer → inventarnummer
Objektbezeichnung → titel  
Datierung → jahr_von/jahr_bis (intelligent geparst)
Material/Technik → material
Maße → masse
Standort → standort

// Alles andere landet in:
→ metadaten.imdas_original (nichts geht verloren!)
```

### Import-Strategie:
1. **Was passt, wird gemappt** (80% der Felder)
2. **Rest in metadaten** (kann später zugeordnet werden)
3. **Original behalten** in `imdas_original` für Export

## 🎯 Praktische Features für kleine Museen

### 1. QR-Code Integration
```javascript
// Automatisch generiert aus Inventarnummer
exponat.qr_code = "EXP-" + exponat.inventarnummer
// QR-Code drucken → Am Objekt anbringen → Fertig!
```

### 2. Mehrsprachigkeit (einfach)
```javascript
// Nicht verschiedene Felder, sondern:
exponat.kurzbeschreibung_de = "..."
exponat.kurzbeschreibung_en = "..."  
// Oder in metadaten.translations
```

### 3. Leihverkehr
```javascript
// Einfaches Tracking
exponat.standort = "Ausgeliehen an Stadtmuseum bis 31.12.2024"
exponat.tags.push("ausgeliehen")
```

### 4. Zustandsdokumentation
```javascript
// Pragmatisch mit Fotos
exponat.bilder.push({
  url: "zustand_2024_01.jpg",
  typ: "Zustandsdokumentation",
  datum: "2024-01-15",
  notiz: "Kleine Risse im Holz"
})
```

## 💡 Warum das clever ist:

### Standards-Kompatibilität ohne Komplexität
- ✅ Kann jederzeit LIDO exportieren
- ✅ Dublin Core Mapping möglich  
- ✅ SPECTRUM-Felder vorhanden (nur anders benannt)
- ✅ Europeana-ready

### Aber:
- ❌ Keine 200 Pflichtfelder
- ❌ Keine komplexen Hierarchien
- ❌ Keine starren Vokabulare
- ❌ Kein Verwaltungs-Overhead

## 🚀 Migration von bestehenden Systemen

### Von IMDAS:
```bash
1. Export als XML/CSV
2. Upload im Admin-Portal  
3. Automatisches Mapping
4. Manuelles Nacharbeiten (optional)
```

### Von Excel:
```bash
1. Spalten benennen (siehe Mapping-Tabelle)
2. Import
3. Fertig
```

### Von MuseumPlus, FirstRumos, etc.:
```bash
1. CSV/XML Export
2. Mapping-Tabelle anpassen
3. Import
```

## 📤 Export-Möglichkeiten

Das System kann exportieren nach:
- **LIDO** → Für Verbundkataloge
- **Dublin Core** → Für Bibliotheken
- **JSON-LD** → Für Google/SEO
- **CSV** → Für Excel
- **PDF** → Für Inventarlisten

## 🎨 Anpassung an euer Museum

### Epochen anpassen:
```javascript
// Statt: Antike, Mittelalter, Neuzeit
// Euer Museum: 
epochen = [
  "Vor 1800",
  "19. Jahrhundert", 
  "1900-1945",
  "Nachkriegszeit",
  "Gegenwart"
]
```

### Kategorien anpassen:
```javascript
// Standard-Kategorien überschreiben
kategorien = [
  "Vereinsgeschichte",
  "Schulwesen",
  "Handwerk",
  "Industrie",
  "Alltagskultur"
]
```

### Standort-System:
```javascript
// Euer System
standorte = [
  "Ausstellung EG",
  "Ausstellung OG",
  "Depot Keller",
  "Depot Dachboden",
  "In Restaurierung",
  "Ausgeliehen"
]
```

## 💰 Return on Investment

### Zeitersparnis:
- **Vorher:** 10 Min pro Objekt katalogisieren
- **Nachher:** 2 Min (mit Foto)
- **Bei 1000 Objekten:** 133 Stunden gespart!

### Besuchernutzen:
- QR-Codes → Mehr Info → Längere Verweildauer
- Audioguides → Besseres Verständnis → Zufriedenere Besucher
- Kiosk → Selbständige Erkundung → Entlastung Personal

### Förderung:
- Digital-Förderung möglich (Nachweis: Standards-kompatibel!)
- EU-Förderung für Digitalisierung
- Lokale Sparkassen-Stiftungen

## ✅ Checkliste für den Start

### Woche 1: Bestandsaufnahme
- [ ] Wie viele Objekte habt ihr?
- [ ] Welches Nummernsystem nutzt ihr?
- [ ] Gibt es schon digitale Listen?
- [ ] Wer soll das System pflegen?

### Woche 2: Testlauf
- [ ] 20 Objekte als Test erfassen
- [ ] Kategorien festlegen
- [ ] Import testen
- [ ] Feedback sammeln

### Woche 3: Vollimport
- [ ] Alle Listen vorbereiten
- [ ] Bilder organisieren
- [ ] Import durchführen
- [ ] Qualitätskontrolle

### Woche 4: Live!
- [ ] Kiosk einrichten
- [ ] QR-Codes drucken
- [ ] Team schulen
- [ ] Besucher informieren

## 🤝 Zusammenarbeit

### Mit anderen Museen:
- Gemeinsame Kategorien
- Objektaustausch digital
- Wanderausstellungen planen

### Mit Schulen:
- Schüler fotografieren
- Texte schreiben
- QR-Code-Rallyes

### Mit Vereinen:
- Heimatverein: Geschichten sammeln
- Fotoclub: Objektfotografie
- Senioren: Zeitzeugen-Berichte

## 📈 Wachstumspfad

### Phase 1: Basis (Monat 1)
- Kernbestand digital
- Ein Kiosk
- Einfache Slideshow

### Phase 2: Ausbau (Monat 2-3)
- Alle Objekte erfasst
- QR-Codes
- Audioguide für Highlights

### Phase 3: Professionell (Monat 4-6)
- Mehrsprachig
- Virtuelle Ausstellungen
- Social Media Integration

### Phase 4: Vernetzung (ab Monat 7)
- Verbundkatalog
- Europeana
- Forschungsportal

**Das Schöne:** Jede Phase funktioniert für sich! 
Ihr könnt jederzeit aufhören oder weitermachen.