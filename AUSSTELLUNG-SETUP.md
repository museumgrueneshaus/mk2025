# 50 Jahre Museumsverein Reutte - Setup Dokumentation

## ✅ Was wurde erstellt

### 1. Backend (Sanity CMS)

#### Neues Schema: `ausstellung.js`
Ein vollständiges Content-Schema für Ausstellungen mit folgenden Features:
- **Grundinformationen**: Titel, Untertitel, URL-Slug
- **Beschreibungen**: Kurz- und ausführliche Beschreibung (Rich Text)
- **Medien**: Titelbild, Bildergalerie, Videos, Dokumente
- **Exponate**: Verknüpfung mit Exponaten und Highlight-Exponaten
- **Kategorien**: Zuordnung zu Themenbereichen
- **Zeitraum**: Typ (Dauer/Sonder/Temporär), Start-/Enddatum
- **Organisation**: Kurator, Partner, Ausstellungsort, Raumplan
- **Veranstaltungen**: Eröffnungen, Führungen, Vorträge, Workshops
- **Metadaten**: Tags, Reihenfolge, Featured-Status, Veröffentlichung

#### Automatisch angelegt:
✅ **Kategorie**: "50 Jahre Museumsverein" (ID: `OBx8fq2Ivqq0Ac0c7dVbej`)
   - Icon: 🎉
   - Farbe: Gold (#D4AF37)

✅ **Ausstellung**: "50 Jahre Museumsverein Reutte" (ID: `WibOQy2bUr7bZQESUifq3T`)
   - Untertitel: "1975 - 2025: Eine Erfolgsgeschichte"
   - Zeitraum: März - Dezember 2025
   - Status: In Vorbereitung
   - Featured: Ja
   - 3 Begleitveranstaltungen vorkonfiguriert

✅ **Beispiel-Exponat**: "Gründungsurkunde Museumsverein Reutte" (ID: `OBx8fq2Ivqq0Ac0c7dVbzX`)
   - Inventarnummer: 50J-001
   - Als Highlight markiert
   - Mit Ausstellung verknüpft

### 2. Frontend (Astro)

#### Neue Seiten:

**`/ausstellungen`** - Übersichtsseite
- Grid-Layout für alle Ausstellungen
- Featured-Badges für Highlights
- Typ-Badges (Dauer/Sonder/Temporär/Virtuell)
- Zeitraum und Exponat-Anzahl
- Responsive Design

**`/ausstellung/[id]`** - Detailseite
- Hero-Bild mit Overlay
- Info-Bar (Zeitraum, Ort, Kurator)
- Rich Text Beschreibung
- Kategorien-Übersicht
- Highlight-Exponate Galerie
- Alle Exponate (kompakte Liste)
- Bildergalerie
- Video-Bereich
- Begleitveranstaltungen
- Navigation

#### Erweitert: `src/lib/sanity.js`
Neue Query-Funktionen:
- `getAusstellungen(options)` - Liste aller Ausstellungen
- `getAusstellung(id)` - Einzelne Ausstellung mit allen Details

## 🌐 Zugriff

### Sanity Studio
- **Lokal**: http://localhost:3333/
- **Online**: https://museumghbackend.sanity.studio/

Hier kannst du:
- Weitere Exponate zur Ausstellung hinzufügen
- Bilder, Videos und Dokumente hochladen
- Veranstaltungen ergänzen
- Texte bearbeiten

### Astro Frontend
- **Lokal**: http://localhost:4321/
- **Ausstellungen**: http://localhost:4321/ausstellungen
- **50 Jahre**: http://localhost:4321/ausstellung/50-jahre-museumsverein-reutte

## 📝 Nächste Schritte

### Im Sanity Studio:

1. **Medien hochladen**
   - Gehe zur Ausstellung "50 Jahre Museumsverein Reutte"
   - Füge ein Titelbild hinzu
   - Lade Bilder in die Galerie hoch
   - Lade Videos hoch
   - Füge Dokumente (PDFs) hinzu

2. **Exponate verknüpfen**
   - Erstelle neue Exponate oder nutze bestehende
   - Setze die Kategorie auf "50 Jahre Museumsverein"
   - Markiere wichtige als "Highlight"
   - Verknüpfe sie mit der Ausstellung

3. **Texte anpassen**
   - Bearbeite die Beschreibung
   - Füge weitere Abschnitte hinzu
   - Ergänze Informationen zu den Veranstaltungen

### Optional:

4. **Navigation erweitern**
   - Link zur Ausstellungsübersicht in die Hauptnavigation
   - Startseite um Ausstellungs-Teaser erweitern

5. **Kiosk-Modus**
   - Ausstellungs-Modus in KioskConfig hinzufügen
   - Slideshow-Modus für Ausstellungsexponate

## 🚀 Deployment

Wenn alles fertig ist:

### Backend
```bash
cd museum-sanity-backend
npm run deploy
```

### Frontend
Netlify deployed automatisch bei Git-Push:
```bash
git add .
git commit -m "Add 50 Jahre Ausstellung"
git push
```

## 📦 Dateien

### Backend
- `schemas/ausstellung.js` - Ausstellungs-Schema
- `schemas/index.js` - Schema-Registry (erweitert)
- `setup-50jahre-ausstellung.js` - Setup-Skript (kann gelöscht werden)

### Frontend
- `src/pages/ausstellungen.astro` - Übersichtsseite
- `src/pages/ausstellung/[id].astro` - Detailseite
- `src/lib/sanity.js` - API-Queries (erweitert)

## 💡 Tipps

- **Inventarnummern**: Nutze das Schema "50J-001", "50J-002", etc. für Jubiläumsexponate
- **Bilder**: Optimal 1600x900px für Titelbilder, 1200x800px für Galerie
- **Videos**: MP4-Format, max. 100MB pro Video
- **Dokumente**: PDFs für Chroniken, Zeitungsartikel, etc.
- **Kategorien**: Weise Exponate mehreren Kategorien zu (z.B. "50 Jahre" + "Dokumente")

## 🎨 Design-Anpassungen

Die Ausstellungsseiten nutzen das bestehende Design-System:
- CSS-Variablen für Farben und Abstände
- Responsive Grid-Layouts
- Smooth Transitions
- Lazy Loading für Bilder
- LQIP (Low Quality Image Placeholders)

Anpassungen können in den `<style>`-Bereichen der Astro-Dateien vorgenommen werden.

---

**Erstellt am**: 29. November 2025
**Status**: ✅ Komplett eingerichtet und einsatzbereit
