# Test Data Creation Scripts

Diese Scripts erstellen 20 Testexponate mit realistischen Metadaten für das Museum-System.

## Verfügbare Scripts

### 1. `create-test-categories.js`
Erstellt 20 Testkategorien mit verschiedenen Themen:
- Antike, Mittelalter, Renaissance, Barock
- Naturgeschichte, Ägyptologie, Industriegeschichte
- Design, Nordische Kultur, Asiatische Kunst
- Gotik, Bauhaus, Prähistorie, Musikinstrumente
- Jugendstil, Weltraum, Biedermeier, Keltische Kultur
- Expressionismus, Zeitgenössische Kunst

### 2. `create-simple-test-exhibits.js`
Erstellt 20 Testexponate **ohne externe Bilder**:
- Römische Amphore, Mittelalterliches Schwert
- Renaissance-Gemälde, Barocke Uhr
- Fossil eines Ammoniten, Ägyptische Mumie
- Industrielle Dampfmaschine, Art Deco Vase
- Wikinger-Schmuck, Chinesische Porzellanvase
- Gotische Skulptur, Bauhaus Lampe
- Prähistorischer Faustkeil, Barocke Orgelpfeife
- Jugendstil-Brosche, Meteorit
- Biedermeier-Sekretär, Keltischer Torques
- Expressionistisches Gemälde, Moderne Skulptur

### 3. `create-test-exhibits.js`
Erstellt 20 Testexponate **mit Wikipedia-Bildern** (experimentell):
- Lädt Bilder von Wikipedia herunter
- Uploads sie zu Sanity
- Kann bei Netzwerkproblemen fehlschlagen

## LED-Licht Konfiguration

Die Testexponate haben verschiedene LED-Konfigurationen:

### Mit LED-Licht (12 Exponate):
- **Strip 1**: Römische Amphore, Mittelalterliches Schwert, Wikinger-Schmuck, Meteorit, Moderne Skulptur
- **Strip 2**: Barocke Uhr, Ägyptische Mumie, Chinesische Porzellanvase, Keltischer Torques
- **Strip 3**: Industrielle Dampfmaschine, Bauhaus Lampe, Barocke Orgelpfeife, Expressionistisches Gemälde

### Ohne LED-Licht (8 Exponate):
- Renaissance-Gemälde, Fossil eines Ammoniten, Art Deco Vase, Gotische Skulptur
- Prähistorischer Faustkeil, Jugendstil-Brosche, Biedermeier-Sekretär

## Verwendung

### 1. Sanity Token setzen
```bash
export SANITY_TOKEN="your-sanity-token-here"
```

### 2. Kategorien erstellen
```bash
node create-test-categories.js
```

### 3. Exponate erstellen (einfache Version)
```bash
node create-simple-test-exhibits.js
```

### 4. Exponate mit Bildern erstellen (experimentell)
```bash
node create-test-exhibits.js
```

## Metadaten der Testexponate

Jedes Exponat enthält:
- **Inventarnummer**: INV-001 bis INV-020
- **Titel und Untertitel**: Beschreibende Namen
- **Kurzbeschreibung**: Ein-Satz Beschreibung
- **Ausführliche Beschreibung**: Detaillierte Informationen
- **Datierung**: Mit Jahr-Bereichen und Text
- **Herstellung**: Material, Technik, Ort
- **Physische Eigenschaften**: Höhe, Breite, Tiefe, Gewicht
- **Organisation**: Museumsname
- **Tags**: Suchbare Schlagwörter
- **Highlight-Status**: Einige als Highlights markiert
- **LED-Konfiguration**: Position auf LED-Strips

## LED-Strip Mapping

### Strip 1 (Nordwand):
- LEDs 0-9: Römische Amphore
- LEDs 10-19: Mittelalterliches Schwert
- LEDs 20-29: Wikinger-Schmuck
- LEDs 30-39: Meteorit
- LEDs 40-49: Moderne Skulptur

### Strip 2 (Ostwand):
- LEDs 0-14: Barocke Uhr
- LEDs 15-29: Ägyptische Mumie
- LEDs 30-39: Chinesische Porzellanvase
- LEDs 40-49: Keltischer Torques

### Strip 3 (Südwand):
- LEDs 0-19: Industrielle Dampfmaschine
- LEDs 20-29: Bauhaus Lampe
- LEDs 30-39: Barocke Orgelpfeife
- LEDs 40-49: Expressionistisches Gemälde

## Testen der Features

Nach dem Erstellen der Testdaten können Sie testen:

1. **Filterung**: Kategorien-Filter und "Mit LED-Licht" Filter
2. **Suche**: Volltextsuche durch alle Metadaten
3. **LED-Integration**: Lightbulb-Button nur bei LED-fähigen Exponaten
4. **MQTT**: LED-Befehle an ESP32-Strips senden
5. **Responsive Design**: Verschiedene Bildschirmgrößen
6. **Dark/Light Mode**: Theme-Umschaltung
7. **Inactivity Overlay**: Auto-Reset nach Inaktivität

## Hinweise

- Die Scripts verwenden Rate-Limiting (Verzögerungen zwischen Requests)
- Bei Fehlern wird das Script fortgesetzt
- Alle Exponate haben eine Reihenfolge (1-20)
- LED-Positionen sind realistisch auf 3 Strips verteilt
- Kategorien haben verschiedene Farben und Icons
