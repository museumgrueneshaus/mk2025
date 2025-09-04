# Museum Kiosk System - Strategie & Use Cases

## 🎯 Kernproblem
Museums-Mitarbeiter (meist ohne IT-Kenntnisse) müssen:
- Inhalte selbstständig pflegen
- Kiosks konfigurieren 
- Bei Problemen schnell reagieren
- Ohne externe IT-Hilfe auskommen

## 👥 Realistische Use Cases

### 1. Tägliche Aufgaben (Museumspädagoge/in)

#### Neue Ausstellung einrichten
```
Szenario: Sonderausstellung "Mittelalter" startet nächste Woche
- 20 neue Exponate erfassen (Bilder, Texte, Audiodateien)
- 3 Kiosks auf neuen Content umstellen
- Slideshow für Eingangsbereich aktivieren
```

**Lösung:**
1. Login im Strapi Admin (bookmark auf Desktop)
2. "Exponate" → "Neu" → Formular ausfüllen
3. Bilder per Drag&Drop hochladen
4. "Kiosk 1" → Modus auf "Slideshow" → Exponate auswählen
5. Speichern → Kiosk aktualisiert sich automatisch

#### Fehlerhafte Information korrigieren
```
Szenario: Besucher meldet falsches Jahr bei Exponat
- Exponat finden
- Jahr korrigieren
- Änderung sofort live
```

**Lösung:**
1. Strapi → Exponate → Suche nach Titel
2. Jahr-Feld ändern
3. Speichern → Alle Kiosks aktualisiert

### 2. Wöchentliche Aufgaben (Technischer Dienst)

#### Kiosk ausgefallen
```
Szenario: Kiosk im 2. Stock zeigt nur schwarzen Bildschirm
- Problem identifizieren
- Neustart durchführen
- Funktionalität prüfen
```

**Lösung:**
1. Raspberry Pi aus/einschalten (Steckdose)
2. 2 Minuten warten
3. Kiosk startet automatisch mit richtiger Konfiguration
4. Falls nicht: QR-Code mit Anleitung scannen

#### Neue Kiosk-Station einrichten
```
Szenario: Zusätzlicher Kiosk für Sonderausstellung
- Raspberry Pi anschließen
- MAC-Adresse ermitteln
- Im System registrieren
```

**Lösung:**
1. Raspberry Pi mit vorbereitetem Image starten
2. MAC-Adresse vom Aufkleber ablesen
3. Strapi → Kiosks → Neu → MAC eingeben, Modus wählen
4. Fertig - Kiosk lädt automatisch Konfiguration

### 3. Monatliche Aufgaben (Museumsleitung)

#### Statistiken einsehen
```
Szenario: Besucherzahlen und beliebte Exponate
- Dashboard öffnen
- Zeitraum wählen
- Report erstellen
```

**Lösung:**
- Strapi Dashboard mit Grafana-Integration
- Automatische Monatsberichte per E-Mail
- Export als PDF für Vorstand

### 4. Notfall-Szenarien

#### Internet-Ausfall
```
Problem: Kein Internet, aber Museum öffnet in 30 Minuten
```

**Lösung:**
- Kiosks laufen mit gecachten Daten weiter (24h Cache)
- Notfall-USB-Stick mit Offline-Version
- Hotspot vom Handy als Backup

#### Server-Ausfall
```
Problem: Hetzner Server nicht erreichbar
```

**Lösung:**
- Automatisches Failover zu Backup-Server
- Status-Seite: status.museum-kiosk.de
- WhatsApp-Gruppe für schnelle Kommunikation

## 🛠️ Technische Strategie

### Phase 1: MVP (Monat 1-2)
✅ Basis-System auf Hetzner
✅ 3-5 Test-Kiosks
✅ Grundfunktionen (Explorer, Slideshow)
✅ Einfaches Admin-Panel

### Phase 2: Stabilisierung (Monat 3-4)
- Backup-Strategie implementieren
- Monitoring einrichten
- Schulung Mitarbeiter
- Dokumentation vervollständigen

### Phase 3: Erweiterung (Monat 5-6)
- Besucherstatistiken
- Multi-Language Support
- Touch-Gesten für Tablets
- QR-Code Integration

## 📚 Mitarbeiter-Enablement

### Schulungskonzept

#### Level 1: Basis-Nutzer (2 Stunden)
- Inhalte anlegen/ändern
- Bilder hochladen
- Texte bearbeiten
- Kiosk-Modus wechseln

#### Level 2: Power-User (4 Stunden)
- Kiosks konfigurieren
- Fehler diagnostizieren
- Backup durchführen
- Reports erstellen

#### Level 3: Admin (1 Tag)
- Server neustarten
- Updates einspielen
- Neue Kiosks einrichten
- Netzwerk-Troubleshooting

### Dokumentation

```
museum-kiosk-handbuch/
├── 01_Schnellstart.pdf (2 Seiten, bebildert)
├── 02_Inhalte_pflegen.pdf (10 Seiten, Screenshots)
├── 03_Problemlösung.pdf (5 Seiten, Checklisten)
├── 04_Notfall_Kontakte.pdf (1 Seite)
└── videos/
    ├── exponat_anlegen.mp4 (3 Min)
    ├── kiosk_neustarten.mp4 (2 Min)
    └── backup_erstellen.mp4 (5 Min)
```

## 🚦 Vereinfachungen für Nicht-Techniker

### 1. Strapi Admin anpassen

```javascript
// Vereinfachtes Interface
- Deutsche Übersetzungen
- Große Buttons
- Weniger Optionen
- Visuelle Vorschau
- Drag & Drop überall
- Auto-Save
```

### 2. Status-Dashboard

```
museum-status.local
├── 🟢 Kiosk Eingang: OK
├── 🟢 Kiosk 1. Stock: OK
├── 🔴 Kiosk 2. Stock: Offline (seit 5 Min)
├── 🟢 Server: OK
└── 🟢 Internet: OK
```

### 3. WhatsApp-Bot für Support

```
Befehle:
/status - Zeigt System-Status
/neustart kiosk1 - Startet Kiosk neu
/hilfe exponat - Zeigt Anleitung
/kontakt - Ruft Support an
```

## 💰 Realistische Kostenkalkulation

### Einmalige Kosten
- Raspberry Pi (5x): 400€
- Touchscreens (5x): 1.500€
- Verkabelung: 200€
- Einrichtung: 1.000€
**Gesamt: ~3.100€**

### Laufende Kosten/Monat
- Hetzner Server: 5€
- Backup-Storage: 5€
- Domain: 1€
- Support (2h/Monat): 100€
**Gesamt: ~111€/Monat**

## ⚠️ Kritische Erfolgsfaktoren

### Must-Haves
1. **Einfachheit** - Oma-Test bestehen
2. **Zuverlässigkeit** - 99% Uptime
3. **Schnelle Hilfe** - Max. 1h Reaktionszeit
4. **Deutsch** - Komplette Lokalisierung

### Nice-to-Haves
- Besucherstatistiken
- A/B Testing
- KI-Bilderkennung
- Social Media Integration

## 🎯 Erfolgsmetriken

### Technisch
- Uptime > 99%
- Ladezeit < 2 Sekunden
- Fehlerrate < 1%

### Nutzer
- Mitarbeiter können 90% selbst lösen
- Schulungszeit < 4 Stunden
- Support-Anfragen < 5/Monat

### Business
- Besucherzufriedenheit > 85%
- Wartungskosten < 200€/Monat
- ROI innerhalb 12 Monaten

## 🚀 Nächste Schritte

### Woche 1-2: Proof of Concept
1. [ ] Hetzner Server aufsetzen
2. [ ] Basis-Installation durchführen
3. [ ] 1 Test-Kiosk einrichten
4. [ ] Mit 2 Mitarbeitern testen

### Woche 3-4: Pilot
1. [ ] 3 Kiosks im Museum
2. [ ] Mitarbeiter-Schulung
3. [ ] Feedback sammeln
4. [ ] Anpassungen vornehmen

### Monat 2: Rollout
1. [ ] Alle Kiosks migrieren
2. [ ] Alle Mitarbeiter schulen
3. [ ] Support-Prozess etablieren
4. [ ] Monitoring aktivieren

## 📞 Support-Struktur

### Level 1: Mitarbeiter untereinander
- WhatsApp-Gruppe
- Gemeinsame Notizen
- Peer-Support

### Level 2: Interner Champion
- 1 technikaffiner Mitarbeiter
- Zusätzliche Schulung
- Erste Anlaufstelle

### Level 3: Externer Support
- Remote-Zugriff
- Telefon-Hotline (werktags 9-17 Uhr)
- Vor-Ort-Service (im Notfall)

## 🔐 Datenschutz & Sicherheit

### DSGVO-Konformität
- Keine Besucher-Tracking
- Lokale Datenhaltung (Deutschland)
- Verschlüsselte Verbindungen
- Regelmäßige Backups

### Zugriffskontrolle
- Persönliche Logins
- Rollen (Redakteur, Admin)
- Aktivitätslog
- Passwort-Richtlinien

## 📝 Checkliste für Entscheider

### ✅ Vorteile
- [ ] Unabhängigkeit von IT-Abteilung
- [ ] Kosten unter 150€/Monat
- [ ] Einfache Bedienung
- [ ] Schnelle Änderungen möglich
- [ ] Ausfallsicher

### ⚠️ Herausforderungen
- [ ] Initiale Einrichtung
- [ ] Mitarbeiter-Schulung nötig
- [ ] Internet-Abhängigkeit
- [ ] Regelmäßige Updates

### 🎯 Entscheidungskriterien
- [ ] Budget vorhanden?
- [ ] Mitarbeiter motiviert?
- [ ] Technischer Support geklärt?
- [ ] Zeitplan realistisch?
- [ ] Management-Support?