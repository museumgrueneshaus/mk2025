# Mitarbeiter-Handbuch
## Museum Grünes Haus – Digitales Kiosk-System

**Stand:** April 2026
**Version:** 2.0
**Zielgruppe:** Museumsmitarbeiterinnen und -mitarbeiter (kein technisches Vorwissen erforderlich)

---

## Inhaltsverzeichnis

1. [Das System auf einen Blick](#1-das-system-auf-einen-blick)
2. [Zugang zum Content-Management-System](#2-zugang-zum-content-management-system)
3. [Navigationsübersicht](#3-navigationsübersicht)
4. [Ausstellungen verwalten](#4-ausstellungen-verwalten)
5. [Exponate verwalten](#5-exponate-verwalten)
6. [Kategorien verwalten](#6-kategorien-verwalten)
7. [Kiosk-Geräte verwalten](#7-kiosk-geräte-verwalten)
8. [Wie Änderungen auf den Kiosk kommen](#8-wie-änderungen-auf-den-kiosk-kommen)
9. [Häufige Aufgaben – Schritt für Schritt](#9-häufige-aufgaben--schritt-für-schritt)
10. [Fehlersuche & häufige Probleme](#10-fehlersuche--häufige-probleme)
11. [Glossar](#11-glossar)

---

## 1. Das System auf einen Blick

Das digitale Kiosk-System besteht aus drei Teilen, die zusammenarbeiten:

```
Sie bearbeiten Inhalte im CMS
         ↓ (sofort gespeichert)
Sanity CMS – Die zentrale Datenbank
         ↓ (alle 5 Minuten automatisch)
Raspberry Pi Kiosk-Computer
         ↓ (sofort)
Bildschirm im Museum
```

**Was Sie wissen müssen:**
- Alle Inhalte werden über das **Content-Management-System (CMS)** bearbeitet.
- Nach dem Speichern und Veröffentlichen sind Änderungen **innerhalb von 5 Minuten** auf dem Kiosk sichtbar.
- Die Kiosk-Computer laufen vollständig **ohne Internetverbindung** – alle Inhalte werden lokal gespeichert.
- Es gibt **vier Darstellungsmodi** für Kiosks: Video-Loop, Slideshow, Explorer und Reader.

---

## 2. Zugang zum Content-Management-System

### Adresse
Das CMS ist erreichbar unter:

> **https://832k5je1.sanity.studio**

Oder lokal auf Ihrem Arbeitsrechner, wenn das System gestartet wurde (Doppelklick auf „Sanity starten.command").

### Anmelden
1. Öffnen Sie die CMS-Adresse im Browser.
2. Klicken Sie auf **„Log in with Google"** oder **„Log in with email"**.
3. Verwenden Sie Ihr Museum-Google-Konto oder die Ihnen mitgeteilten Zugangsdaten.

> **Hinweis:** Wenn Sie keinen Zugang haben, wenden Sie sich an die IT-Abteilung oder den Systemadministrator.

---

## 3. Navigationsübersicht

Nach dem Einloggen sehen Sie die linke Seitenleiste mit folgenden Bereichen:

| Symbol | Bereich | Verwendung |
|--------|---------|------------|
| 🖼️ | **Ausstellungen** | Ausstellungen anlegen und bearbeiten |
| 🗿 | **Exponate** | Einzelne Objekte/Ausstellungsstücke verwalten |
| 🏷️ | **Kategorien** | Thematische Gruppen für Exponate |
| 🎬 | **Videos** | Hochgeladene Videodateien einsehen |
| 🖼️ | **Bilder** | Hochgeladene Bilder einsehen |
| 📄 | **Dokumente & PDFs** | Hochgeladene Dokumente einsehen |
| 📺 | **Kiosk-Geräte** | Raspberry Pi Geräte verwalten und überwachen |
| ℹ️ | **Museum Info** | Allgemeine Museumsangaben |
| 📁 | **Dokument-Vorlagen** | Ordnerstruktur für Dokumente |

---

## 4. Ausstellungen verwalten

Eine **Ausstellung** ist die zentrale Einheit im System. Jeder Kiosk zeigt genau eine Ausstellung an. Die Ausstellung bestimmt:
- Welche Inhalte angezeigt werden (Videos, Bilder, Exponate, PDF)
- Wie die Inhalte dargestellt werden (Darstellungstyp)
- Alle Einstellungen für den Kiosk-Bildschirm

### 4.1 Neue Ausstellung anlegen

1. Klicken Sie in der linken Leiste auf **🖼️ Ausstellungen**.
2. Klicken Sie oben rechts auf **„+ Neue Ausstellung"** (Stift-Symbol oder „Neu" Schaltfläche).
3. Füllen Sie die **Pflichtfelder** aus (mit rotem Stern * markiert):
   - **Titel der Ausstellung** – z.B. „50 Jahre Grünes Haus"
   - **URL-Adresse (Slug)** – Klicken Sie auf „Generieren" → wird automatisch erstellt
   - **Kurzbeschreibung** – 2–3 Sätze für Besucher (max. 500 Zeichen)
4. Klicken Sie auf **„Veröffentlichen"** (grüne Schaltfläche rechts oben).

### 4.2 Ausstellung bearbeiten

Die Ausstellung ist in mehrere **Tabs** aufgeteilt:

#### Tab: 📋 Inhalt
- **Titel & Untertitel** – Bezeichnung der Ausstellung
- **Kurzbeschreibung** – Einleitungstext für Besucher
- **Ausführliche Beschreibung** – Formatierter Langtext (wie ein Texteditor)
- **Titelbild** – Hauptbild der Ausstellung

#### Tab: 🎨 Medien & Videos
- **Bildergalerie** – Weitere Bilder zur Ausstellung
- **Videos** – Videodateien für den Video-Loop-Modus (MP4, MOV)
- **Dokumente & Downloads** – PDFs, Kataloge, Pressemitteilungen

#### Tab: 📺 Kiosk-Darstellung
Hier legen Sie fest, **wie** die Ausstellung auf dem Kiosk dargestellt wird.

Wählen Sie zunächst den **Darstellungstyp** (siehe Abschnitt 4.3), dann erscheinen die passenden Einstellungen.

#### Tab: 🗿 Exponate & Kategorien
- **Exponate** – Welche Objekte in dieser Ausstellung gezeigt werden (für Explorer-Modus)
- **Kategorien** – Thematische Filter (für Explorer-Modus)

#### Tab: ⚙️ Verwaltung
- **Status** – Entwurf / In Vorbereitung / Veröffentlicht / Archiviert
- **Laufzeit** – Datum von/bis
- **Verantwortliche Person** – interne Zuständigkeit

### 4.3 Darstellungstypen (Kiosk-Modi)

#### 🎬 Video-Loop
Der Kiosk spielt Videos in einer **Endlosschleife** ab.

**Einstellungen:**
| Einstellung | Beschreibung | Empfehlung |
|-------------|-------------|------------|
| Endlos-Schleife | Videos automatisch wiederholen | ✓ aktiviert |
| Zufällige Reihenfolge | Videos in zufälliger Reihenfolge | nach Bedarf |
| Untertitel anzeigen | VTT-Untertitel einblenden | je nach Barrierefreiheitsanforderung |
| Info-Overlay anzeigen | Titel + Beschreibung einblenden | ✓ empfohlen |
| Position des Overlays | Wo das Info-Overlay erscheint | Unten links (Standard) |
| Übergangseffekt | Überblenden / Schwarz / Kein | Überblenden (Standard) |
| Lautstärke | 0–100 % | 80 % empfohlen |

**Voraussetzung:** Mindestens ein Video muss im Tab „Medien & Videos" hochgeladen sein.

---

#### 🖼️ Slideshow
Der Kiosk zeigt Bilder als **automatische Diashow**.

**Einstellungen:**
| Einstellung | Beschreibung | Empfehlung |
|-------------|-------------|------------|
| Anzeigedauer pro Bild | Wie lange jedes Bild zu sehen ist | 10 Sekunden |
| Übergangseffekt | Überblenden / Schieben / Zoom / Kein | Überblenden |
| Bildtitel anzeigen | Titel und Bildunterschrift einblenden | ✓ aktiviert |

**Voraussetzung:** Mindestens ein Bild in der Bildergalerie (Tab „Medien & Videos").

---

#### 📖 Reader
Der Kiosk zeigt ein **PDF-Dokument** zum Blättern an (z.B. einen Ausstellungskatalog).

**Einstellungen:**
| Einstellung | Beschreibung |
|-------------|-------------|
| PDF-URL | Öffentliche Internetadresse zur PDF-Datei |
| Schriftgröße | Klein / Mittel / Groß |

**Voraussetzung:** Eine öffentlich zugängliche PDF-Datei (z.B. auf der Museumswebsite).

---

#### 🗂️ Explorer
Besucher können **interaktiv durch die Exponate** einer Ausstellung stöbern – mit Suche, Kategorien-Filter und Detailansicht.

**Einstellungen:**
| Einstellung | Beschreibung | Empfehlung |
|-------------|-------------|------------|
| Nur Highlights anzeigen | Zeigt nur als Highlight markierte Exponate | je nach Anzahl der Objekte |
| Sortierung | Inventarnummer / Titel / Datum / Zufällig | Inventarnummer |
| Objekte pro Seite | Rasteransicht 1–50 Objekte | 12 (Standard) |

**Voraussetzung:** Exponate und Kategorien müssen im Tab „Exponate & Kategorien" hinzugefügt sein.

---

### 4.4 Ausstellung veröffentlichen

> **Wichtig:** Solange eine Ausstellung im Status „Entwurf" ist, wird sie **nicht** auf dem Kiosk angezeigt – auch wenn sie einem Gerät zugeordnet ist.

1. Prüfen Sie alle Inhalte auf Vollständigkeit.
2. Klicken Sie oben rechts auf die grüne Schaltfläche **„Veröffentlichen"**.
3. Die Ausstellung ist nun aktiv. Der Kiosk übernimmt sie beim nächsten Sync (max. 5 Minuten).

Um eine veröffentlichte Ausstellung zu bearbeiten, ohne dass Änderungen sofort sichtbar sind:
- Klicken Sie auf **„Bearbeiten"** → es wird ein **Entwurf** erstellt
- Veröffentlichen Sie erst, wenn alle Änderungen fertig sind

---

## 5. Exponate verwalten

Ein **Exponat** entspricht einem einzelnen Ausstellungsobjekt (z.B. ein Gemälde, ein Werkzeug, ein Dokument). Exponate werden für den **Explorer-Modus** benötigt.

### 5.1 Neues Exponat anlegen

1. Klicken Sie in der linken Leiste auf **🗿 Exponate**.
2. Klicken Sie auf **„+ Neues Exponat"**.
3. Füllen Sie die Pflichtfelder aus:

#### Tab: 📋 Grunddaten
| Feld | Beschreibung | Pflicht |
|------|-------------|---------|
| **Inventarnummer** | Aus Ihrem Bestandssystem, z.B. INV-2024-001 | ✓ |
| **Objektbezeichnung** | Name des Objekts, wird auf dem Kiosk angezeigt | ✓ |
| **Kurzbeschreibung** | 2–3 Sätze in einfacher Sprache (max. 500 Zeichen) | ✓ |
| Untertitel | Alternativer Name oder Serientitel | |
| Ausführliche Beschreibung | Längerer Fachtext (nicht auf Kiosk sichtbar) | |

#### Tab: 🎨 Medien
| Feld | Beschreibung |
|------|-------------|
| **Hauptbild** | Hauptfoto des Objekts – erscheint im Kiosk-Raster |
| Weitere Bilder | Zusätzliche Fotos für die Detailansicht |

> **Tipp:** Das Hauptbild ist entscheidend für den ersten Eindruck im Explorer. Verwenden Sie freigestellte Fotos auf weißem oder neutralem Hintergrund.

#### Tab: 🔬 Details & Herkunft
| Feld | Beschreibung |
|------|-------------|
| Datierung | z.B. „um 1850" oder „1923" |
| Material & Technik | z.B. „Öl auf Leinwand", „Schmiedeeisen" |
| Maße | Abmessungen des Objekts |
| Herkunft & Provenienz | Woher das Objekt stammt |
| Schenkung/Ankauf | Erwerbungsart |

#### Tab: ⚙️ Verwaltung
| Feld | Beschreibung |
|------|-------------|
| **Highlight** | Als besonderes Objekt markieren (erscheint bevorzugt) |
| Kategorie | Thematische Einordnung (für Filter im Explorer) |
| Status | Entwurf / In Bearbeitung / Aktiv / Archiviert |

### 5.2 Exponat als Highlight markieren

„Highlight"-Exponate werden im Explorer bevorzugt angezeigt und können bei der Einstellung „Nur Highlights anzeigen" gefiltert werden.

1. Öffnen Sie das Exponat.
2. Gehen Sie zum Tab **„⚙️ Verwaltung"**.
3. Aktivieren Sie den Schalter **„Highlight-Objekt"**.
4. Klicken Sie auf **„Veröffentlichen"**.

### 5.3 Exponat einer Ausstellung zuordnen

Exponate gehören nicht automatisch zu einer Ausstellung. Sie müssen explizit zugeordnet werden:

1. Öffnen Sie die **Ausstellung** (nicht das Exponat).
2. Gehen Sie zum Tab **„🗿 Exponate & Kategorien"**.
3. Klicken Sie bei **„Exponate"** auf **„Hinzufügen"**.
4. Suchen Sie das gewünschte Exponat und wählen Sie es aus.
5. Klicken Sie auf **„Veröffentlichen"** bei der Ausstellung.

---

## 6. Kategorien verwalten

Kategorien sind **thematische Gruppen** für Exponate im Explorer-Modus (z.B. „Werkzeuge", „Dokumente", „Kleidung").

### Neue Kategorie anlegen

1. Klicken Sie auf **🏷️ Kategorien**.
2. Klicken Sie auf **„+ Neue Kategorie"**.
3. Vergeben Sie einen **Titel** (z.B. „Werkzeuge des Alltags").
4. Optional: **Farbe** auswählen (Hex-Code, z.B. `#2563EB` für Blau).
5. Klicken Sie auf **„Veröffentlichen"**.

### Kategorie einer Ausstellung zuordnen

1. Öffnen Sie die **Ausstellung**.
2. Tab **„🗿 Exponate & Kategorien"** → Feld **„Kategorien"**.
3. Kategorie hinzufügen und Ausstellung veröffentlichen.

### Exponat einer Kategorie zuordnen

1. Öffnen Sie das **Exponat**.
2. Tab **„⚙️ Verwaltung"** → Feld **„Kategorie"**.
3. Kategorie auswählen und Exponat veröffentlichen.

---

## 7. Kiosk-Geräte verwalten

Unter **📺 Kiosk-Geräte** sehen Sie alle Raspberry Pi Computer im Museum.

### 7.1 Gerätestatus überwachen

In der Listenansicht zeigt jedes Gerät:
- 🟢 **Online** – Gerät läuft und ist erreichbar
- 🔴 **Offline** – Gerät nicht erreichbar (ausgeschaltet, Netzwerkproblem)
- Aktuelle Ausstellung
- Standort im Museum

> **Hinweis:** Der Online-Status wird alle 5 Minuten aktualisiert. Ein kurz ausgeschaltetes Gerät erscheint möglicherweise noch als „Online".

### 7.2 Ausstellung einem Gerät zuweisen

So ändern Sie, welche Ausstellung auf einem Kiosk angezeigt wird:

1. Klicken Sie auf das gewünschte Gerät in der Liste.
2. Gehen Sie zum Tab **„🖼️ Ausstellung"**.
3. Klicken Sie auf das Feld **„Aktive Ausstellung"**.
4. Wählen Sie die neue Ausstellung aus der Liste.
5. Klicken Sie auf **„Veröffentlichen"**.
6. Die Änderung erscheint **innerhalb von 5 Minuten** auf dem Kiosk.

> **Wichtig:** Es kann immer nur eine Ausstellung pro Gerät aktiv sein.

### 7.3 Geräteinformationen (nur IT)

Im Tab **„⚙️ System (IT)"** (nur für Administratoren sichtbar) finden sich:
- **WLAN-Netzwerke** – Konfiguration der Netzwerkverbindung
- **Gerätestatus** – Automatisch aktualisierte technische Informationen
  - IP-Adresse
  - Betriebszeit (Uptime)
  - Chromium-Status
- **Setup-Informationen** – Einrichtungsdatum, Software-Version

---

## 8. Wie Änderungen auf den Kiosk kommen

### Der 5-Minuten-Zyklus

```
Sie speichern + veröffentlichen im CMS
         ↓
Sanity-Datenbank aktualisiert (sofort)
         ↓
Raspberry Pi fragt alle 5 Minuten ab
         ↓
Kiosk zeigt neue Inhalte (spätestens nach 5 Min.)
```

### Wann erscheinen Änderungen?

| Aktion | Auf Kiosk sichtbar nach |
|--------|------------------------|
| Texte ändern | max. 5 Minuten |
| Bilder ändern | max. 5 Minuten |
| Ausstellung wechseln | max. 5 Minuten |
| Darstellungstyp ändern | max. 5 Minuten |
| Neues Video hochladen | max. 5 Minuten (Streaming) |

> **Hinweis:** Videos werden über das Internet gestreamt (von Sanity's CDN). Große Videos können beim ersten Abspielen kurz laden. Lokale Video-Dateien, die direkt auf dem Pi liegen, sind sofort verfügbar.

### Software-Updates (automatisch)

Die Kiosk-Software (Frontend) wird automatisch aktualisiert, wenn eine neue Version veröffentlicht wird. Dies geschieht im Hintergrund und erfordert keine manuelle Aktion. Der Kiosk startet nach einem Update automatisch neu.

---

## 9. Häufige Aufgaben – Schritt für Schritt

### Aufgabe: Neue Ausstellung mit Videos einrichten

**Ziel:** Eine neue Video-Loop-Ausstellung auf einem Kiosk anzeigen.

1. **Ausstellung anlegen:**
   - 🖼️ Ausstellungen → „+ Neu"
   - Titel, Slug (generieren), Kurzbeschreibung ausfüllen

2. **Videos hochladen:**
   - Tab „🎨 Medien & Videos" → Feld „Videos" → „Hinzufügen"
   - Für jedes Video:
     - Videodatei hochladen (MP4 empfohlen)
     - Videotitel vergeben
     - Optional: Vorschaubild und Laufzeit angeben

3. **Kiosk-Modus konfigurieren:**
   - Tab „📺 Kiosk-Darstellung"
   - Darstellungstyp: **„🎬 Video-Loop"** auswählen
   - Einstellungen nach Bedarf anpassen (Lautstärke, Overlay, etc.)

4. **Veröffentlichen:**
   - Grüne Schaltfläche „Veröffentlichen" klicken

5. **Gerät zuweisen:**
   - 📺 Kiosk-Geräte → Gewünschtes Gerät öffnen
   - Tab „🖼️ Ausstellung" → Ausstellung auswählen → Veröffentlichen

6. **Warten:** Innerhalb von 5 Minuten erscheint die Ausstellung auf dem Kiosk.

---

### Aufgabe: Exponate für den Explorer einrichten

**Ziel:** Eine Explorer-Ausstellung mit Exponaten und Kategorien aufbauen.

1. **Kategorien anlegen** (z.B. „Werkzeuge", „Dokumente"):
   - 🏷️ Kategorien → mehrere Kategorien anlegen + veröffentlichen

2. **Exponate anlegen** (je Objekt):
   - 🗿 Exponate → „+ Neu"
   - Inventarnummer, Titel, Kurzbeschreibung ausfüllen
   - Hauptbild hochladen
   - Kategorie zuweisen (Tab „⚙️ Verwaltung")
   - Exponat veröffentlichen

3. **Ausstellung erstellen:**
   - 🖼️ Ausstellungen → „+ Neu" → Grunddaten ausfüllen

4. **Exponate + Kategorien zur Ausstellung hinzufügen:**
   - Tab „🗿 Exponate & Kategorien"
   - Alle gewünschten Exponate hinzufügen
   - Alle gewünschten Kategorien hinzufügen

5. **Kiosk-Modus konfigurieren:**
   - Tab „📺 Kiosk-Darstellung"
   - Darstellungstyp: **„🗂️ Explorer"** auswählen
   - Sortierung und Anzahl nach Bedarf

6. **Veröffentlichen und Gerät zuweisen** (wie oben Schritte 4–6)

---

### Aufgabe: Laufende Ausstellung aktualisieren

**Ziel:** Einen Text oder ein Bild in einer bereits laufenden Ausstellung ändern.

1. Öffnen Sie die Ausstellung über **🖼️ Ausstellungen**.
2. Klicken Sie auf **„Bearbeiten"** (es wird ein Entwurf erstellt).
3. Nehmen Sie Ihre Änderungen vor.
4. Prüfen Sie alle Änderungen nochmals.
5. Klicken Sie auf **„Veröffentlichen"**.
6. Der Kiosk übernimmt die Änderungen innerhalb von 5 Minuten.

> **Wichtig:** Solange Sie im Entwurf-Modus arbeiten und nicht veröffentlichen, sieht der Besucher noch die alte Version.

---

### Aufgabe: Ausstellung auf anderem Kiosk anzeigen

**Ziel:** Eine bestehende Ausstellung auf einem anderen Gerät anzeigen.

1. Öffnen Sie **📺 Kiosk-Geräte**.
2. Klicken Sie auf das Gerät, auf dem die Ausstellung erscheinen soll.
3. Tab **„🖼️ Ausstellung"** → Feld „Aktive Ausstellung" → Ausstellung auswählen.
4. Klicken Sie auf **„Veröffentlichen"**.
5. Innerhalb von 5 Minuten erscheint die Ausstellung auf dem Kiosk.

---

## 10. Fehlersuche & häufige Probleme

### Problem: Kiosk zeigt alte Inhalte

**Mögliche Ursachen & Lösungen:**

| Ursache | Lösung |
|---------|--------|
| Änderung noch nicht veröffentlicht | Überprüfen Sie im CMS, ob die grüne Schaltfläche „Veröffentlichen" geklickt wurde |
| Sync noch nicht erfolgt | Warten Sie bis zu 5 Minuten |
| Kiosk ohne Internetzugang | IT kontaktieren: Netzwerkverbindung prüfen |

### Problem: Kiosk zeigt „Kein Inhalt" oder Fehlermeldung

**Mögliche Ursachen & Lösungen:**

| Ursache | Lösung |
|---------|--------|
| Ausstellung nicht veröffentlicht | Status auf „Veröffentlicht" setzen |
| Ausstellung nicht dem Gerät zugewiesen | Im CMS Gerät öffnen → Ausstellung zuweisen |
| Pflichtfelder nicht ausgefüllt | Alle Pflichtfelder (mit * markiert) prüfen |

### Problem: Video spielt nicht ab

| Ursache | Lösung |
|---------|--------|
| Falsches Dateiformat | Nur MP4, MOV, AVI werden unterstützt |
| Video zu groß | Maximale empfohlene Dateigröße: 2 GB |
| Kiosk-Modus falsch eingestellt | Sicherstellen dass „Video-Loop" ausgewählt ist |

### Problem: Kiosk zeigt Gerät als „Offline" obwohl es eingeschaltet ist

| Ursache | Lösung |
|---------|--------|
| WLAN-Verbindung unterbrochen | Gerät neu starten (Strom trennen und wieder anschließen) |
| Status noch nicht aktualisiert | 5 Minuten warten |
| Internes Netzwerkproblem | IT kontaktieren |

### Problem: Exponat erscheint nicht im Explorer

| Ursache | Lösung |
|---------|--------|
| Exponat nicht veröffentlicht | Veröffentlichen-Schaltfläche klicken |
| Exponat nicht der Ausstellung zugeordnet | In der Ausstellung unter „Exponate & Kategorien" hinzufügen |
| Option „Nur Highlights" aktiv | Entweder Exponat als Highlight markieren oder Option deaktivieren |

### Wann die IT kontaktieren?

Kontaktieren Sie die IT-Abteilung bei:
- Kiosk startet nicht / zeigt schwarzen Bildschirm
- Gerät erscheint seit mehr als 30 Minuten als Offline
- Fehlermeldungen, die nicht mit den obigen Schritten behoben werden können
- Hardware-Schäden (Bildschirm, Gehäuse, Kabel)

---

## 11. Glossar

| Begriff | Erklärung |
|---------|-----------|
| **CMS** | Content-Management-System – die Software, mit der Sie Inhalte verwalten |
| **Sanity** | Name der CMS-Software, die das Museum verwendet |
| **Ausstellung** | Eine thematische Einheit mit Inhalten und Kiosk-Darstellung |
| **Exponat** | Ein einzelnes Ausstellungsobjekt (Gemälde, Werkzeug, Dokument etc.) |
| **Kiosk** | Der Touchscreen-Computer im Museum |
| **Raspberry Pi** | Der Minicomputer im Inneren des Kiosk-Gehäuses |
| **Sync** | Automatischer Datenabgleich zwischen CMS und Kiosk (alle 5 Min.) |
| **Slug** | URL-freundliche Version des Titels, automatisch generiert |
| **Veröffentlichen** | Inhalte für den Kiosk freischalten |
| **Entwurf** | Noch nicht freigeschaltete Version eines Dokuments |
| **Video-Loop** | Darstellungsmodus: Videos laufen in Endlosschleife |
| **Slideshow** | Darstellungsmodus: Bilder wechseln automatisch |
| **Explorer** | Darstellungsmodus: Besucher können Exponate interaktiv durchsuchen |
| **Reader** | Darstellungsmodus: PDF-Dokument (z.B. Katalog) zum Blättern |
| **Highlight** | Als besonders wichtig markiertes Exponat |
| **Overlay** | Eingeblendete Information über dem Video/Bild |
| **Kategorie** | Thematische Gruppe für Exponate (z.B. „Werkzeuge") |
| **VTT** | Untertitel-Dateiformat für Videos (WebVTT) |

---

*Letzte Aktualisierung: April 2026 | Bei Fragen: IT-Abteilung Museum Grünes Haus*
