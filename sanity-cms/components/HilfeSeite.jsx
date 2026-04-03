// components/HilfeSeite.jsx
// Mitarbeiter-Handbuch direkt im Sanity Studio

export function HilfeSeite() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <h1 style={styles.h1}>📚 Mitarbeiter-Handbuch</h1>
        <p style={styles.intro}>
          Willkommen im digitalen Kiosk-System des Museum Grünes Haus.
          Alle Inhalte werden hier verwaltet und erscheinen <strong>innerhalb von 5 Minuten</strong> auf den Kiosk-Bildschirmen.
        </p>

        {/* ── SYSTEMÜBERSICHT ── */}
        <Section title="Das System auf einen Blick">
          <FlowDiagram />
          <InfoBox>
            <strong>Wichtig:</strong> Änderungen sind erst nach dem Klick auf{' '}
            <Badge color="#2a9d5c">Veröffentlichen</Badge> auf dem Kiosk sichtbar.
            Solange ein Dokument im Entwurf-Status ist, sehen Besucher noch die alte Version.
          </InfoBox>
        </Section>

        {/* ── NAVIGATION ── */}
        <Section title="Navigation – Was ist wo?">
          <NavTable />
        </Section>

        {/* ── KIOSK-MODI ── */}
        <Section title="Die vier Kiosk-Modi">
          <ModiGrid />
        </Section>

        {/* ── AUSSTELLUNG ANLEGEN ── */}
        <Section title="Neue Ausstellung anlegen – Schritt für Schritt">
          <Steps steps={[
            { emoji: '🖼️', title: 'Ausstellung öffnen', text: 'Links auf „Ausstellungen" klicken → „+ Neu"' },
            { emoji: '✏️', title: 'Grunddaten ausfüllen', text: 'Titel, Slug generieren (Klick auf „Generieren"), Kurzbeschreibung' },
            { emoji: '📺', title: 'Kiosk-Modus wählen', text: 'Tab „Kiosk-Darstellung" → Darstellungstyp wählen (Video, Slideshow, Explorer, Reader)' },
            { emoji: '📁', title: 'Inhalte hochladen', text: 'Tab „Medien & Videos" → Videos oder Bilder hinzufügen' },
            { emoji: '✅', title: 'Veröffentlichen', text: 'Grüne Schaltfläche „Veröffentlichen" klicken' },
            { emoji: '📺', title: 'Gerät zuweisen', text: 'Links auf „Kiosk-Geräte" → Gerät öffnen → Ausstellung auswählen → Veröffentlichen' },
          ]} />
        </Section>

        {/* ── EXPONATE ── */}
        <Section title="Exponate verwalten (Explorer-Modus)">
          <Steps steps={[
            { emoji: '🏷️', title: 'Kategorien anlegen', text: 'Links auf „Kategorien" → mehrere Kategorien erstellen (z.B. „Werkzeuge", „Dokumente")' },
            { emoji: '🗿', title: 'Exponate anlegen', text: 'Links auf „Exponate" → „+ Neu" → Inventarnummer, Titel, Kurzbeschreibung, Hauptbild, Kategorie' },
            { emoji: '⭐', title: 'Highlights markieren', text: 'Im Exponat: Tab „Verwaltung" → Schalter „Highlight-Objekt" aktivieren' },
            { emoji: '🖼️', title: 'Zur Ausstellung hinzufügen', text: 'In der Ausstellung: Tab „Exponate & Kategorien" → Exponate und Kategorien hinzufügen' },
          ]} />
        </Section>

        {/* ── HÄUFIGE AUFGABEN ── */}
        <Section title="Häufige Aufgaben">
          <TaskList />
        </Section>

        {/* ── FEHLERSUCHE ── */}
        <Section title="Fehlersuche">
          <TroubleTable />
        </Section>

        {/* ── GLOSSAR ── */}
        <Section title="Glossar">
          <GlossarTable />
        </Section>

        <div style={styles.footer}>
          Stand: April 2026 · Bei technischen Fragen: IT-Abteilung kontaktieren
        </div>

      </div>
    </div>
  )
}

// ── Subkomponenten ────────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <section style={styles.section}>
      <h2 style={styles.h2}>{title}</h2>
      {children}
    </section>
  )
}

function InfoBox({ children }) {
  return <div style={styles.infoBox}>{children}</div>
}

function Badge({ children, color }) {
  return (
    <span style={{ ...styles.badge, background: color }}>{children}</span>
  )
}

function FlowDiagram() {
  const steps = [
    { icon: '✏️', label: 'Inhalt bearbeiten\nim CMS' },
    { icon: '✅', label: 'Veröffentlichen\nklicken' },
    { icon: '⏱️', label: 'Kiosk synct\n(alle 5 Min.)' },
    { icon: '📺', label: 'Bildschirm zeigt\nneue Inhalte' },
  ]
  return (
    <div style={styles.flowRow}>
      {steps.map((s, i) => (
        <div key={i} style={styles.flowItem}>
          <div style={styles.flowIcon}>{s.icon}</div>
          <div style={styles.flowLabel}>{s.label}</div>
          {i < steps.length - 1 && <div style={styles.flowArrow}>→</div>}
        </div>
      ))}
    </div>
  )
}

function NavTable() {
  const items = [
    { icon: '🖼️', name: 'Ausstellungen', desc: 'Ausstellungen anlegen und bearbeiten' },
    { icon: '🗿', name: 'Exponate', desc: 'Einzelne Ausstellungsobjekte verwalten' },
    { icon: '🏷️', name: 'Kategorien', desc: 'Thematische Gruppen für den Explorer-Modus' },
    { icon: '🎬', name: 'Videos', desc: 'Hochgeladene Videodateien einsehen' },
    { icon: '🖼️', name: 'Bilder', desc: 'Hochgeladene Bilder einsehen' },
    { icon: '📄', name: 'Dokumente & PDFs', desc: 'Hochgeladene Dokumente einsehen' },
    { icon: '📺', name: 'Kiosk-Geräte', desc: 'Pi-Geräte verwalten, Status prüfen, Ausstellung zuweisen' },
    { icon: 'ℹ️', name: 'Museum Info', desc: 'Allgemeine Museumsangaben' },
  ]
  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Symbol</th>
          <th style={styles.th}>Bereich</th>
          <th style={styles.th}>Verwendung</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
            <td style={{ ...styles.td, fontSize: '1.2em', textAlign: 'center' }}>{item.icon}</td>
            <td style={{ ...styles.td, fontWeight: 600 }}>{item.name}</td>
            <td style={styles.td}>{item.desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function ModiGrid() {
  const modi = [
    {
      emoji: '🎬',
      name: 'Video-Loop',
      desc: 'Videos spielen in Endlosschleife ab',
      voraus: 'Mindestens 1 Video im Tab „Medien & Videos"',
      tipp: 'Lautstärke und Info-Overlay können eingestellt werden',
    },
    {
      emoji: '🖼️',
      name: 'Slideshow',
      desc: 'Bilder wechseln automatisch als Diashow',
      voraus: 'Bilder in der Bildergalerie',
      tipp: 'Anzeigedauer pro Bild: 8–15 Sekunden empfohlen',
    },
    {
      emoji: '🗂️',
      name: 'Explorer',
      desc: 'Besucher stöbern interaktiv durch Exponate',
      voraus: 'Exponate + Kategorien in der Ausstellung',
      tipp: 'Highlights werden bevorzugt angezeigt',
    },
    {
      emoji: '📖',
      name: 'Reader',
      desc: 'PDF-Katalog zum Blättern (z.B. Ausstellungskatalog)',
      voraus: 'Öffentliche URL einer PDF-Datei',
      tipp: 'Schriftgröße kann angepasst werden',
    },
  ]
  return (
    <div style={styles.modiGrid}>
      {modi.map((m, i) => (
        <div key={i} style={styles.modiCard}>
          <div style={styles.modiEmoji}>{m.emoji}</div>
          <div style={styles.modiName}>{m.name}</div>
          <div style={styles.modiDesc}>{m.desc}</div>
          <div style={styles.modiVoraus}>
            <strong>Voraussetzung:</strong> {m.voraus}
          </div>
          <div style={styles.modiTipp}>💡 {m.tipp}</div>
        </div>
      ))}
    </div>
  )
}

function Steps({ steps }) {
  return (
    <div style={styles.stepsList}>
      {steps.map((step, i) => (
        <div key={i} style={styles.stepItem}>
          <div style={styles.stepNumber}>{i + 1}</div>
          <div style={styles.stepEmoji}>{step.emoji}</div>
          <div style={styles.stepContent}>
            <div style={styles.stepTitle}>{step.title}</div>
            <div style={styles.stepText}>{step.text}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function TaskList() {
  const tasks = [
    {
      title: 'Ausstellung auf anderem Kiosk anzeigen',
      steps: ['📺 Kiosk-Geräte → Gerät öffnen', 'Tab „Ausstellung" → neue Ausstellung auswählen', '„Veröffentlichen" klicken → nach 5 Min. sichtbar'],
    },
    {
      title: 'Laufende Ausstellung aktualisieren',
      steps: ['🖼️ Ausstellung öffnen → „Bearbeiten" (Entwurf wird erstellt)', 'Änderungen vornehmen', '„Veröffentlichen" → Kiosk übernimmt in max. 5 Min.'],
    },
    {
      title: 'Video zur Playlist hinzufügen',
      steps: ['Ausstellung öffnen → Tab „Medien & Videos"', '„Videos" → „Hinzufügen" → Datei hochladen (MP4)', 'Titel und Vorschaubild vergeben → Veröffentlichen'],
    },
    {
      title: 'Exponat als Highlight markieren',
      steps: ['🗿 Exponat öffnen → Tab „Verwaltung"', 'Schalter „Highlight-Objekt" aktivieren', '„Veröffentlichen" klicken'],
    },
  ]
  return (
    <div style={styles.taskList}>
      {tasks.map((task, i) => (
        <div key={i} style={styles.taskItem}>
          <div style={styles.taskTitle}>{task.title}</div>
          <ol style={styles.taskSteps}>
            {task.steps.map((s, j) => (
              <li key={j} style={styles.taskStep}>{s}</li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  )
}

function TroubleTable() {
  const rows = [
    { problem: 'Kiosk zeigt alte Inhalte', ursache: 'Änderung nicht veröffentlicht oder Sync noch ausstehend', loesung: 'Prüfen ob „Veröffentlichen" geklickt wurde. Bis zu 5 Minuten warten.' },
    { problem: 'Kiosk zeigt „Kein Inhalt"', ursache: 'Ausstellung nicht dem Gerät zugewiesen oder nicht veröffentlicht', loesung: 'Kiosk-Gerät öffnen → Ausstellung zuweisen → Veröffentlichen' },
    { problem: 'Video spielt nicht ab', ursache: 'Falsches Format oder Kiosk-Modus falsch', loesung: 'Nur MP4 verwenden. Sicherstellen dass Modus „Video-Loop" ausgewählt ist.' },
    { problem: 'Exponat fehlt im Explorer', ursache: 'Exponat nicht der Ausstellung zugeordnet', loesung: 'In der Ausstellung → Tab „Exponate & Kategorien" → Exponat hinzufügen' },
    { problem: 'Gerät zeigt „Offline"', ursache: 'Netzwerkproblem oder Gerät ausgeschaltet', loesung: 'Gerät neu starten (Strom). Falls weiter Offline: IT kontaktieren.' },
  ]
  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Problem</th>
          <th style={styles.th}>Ursache</th>
          <th style={styles.th}>Lösung</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
            <td style={{ ...styles.td, fontWeight: 600 }}>{row.problem}</td>
            <td style={styles.td}>{row.ursache}</td>
            <td style={{ ...styles.td, color: '#2a9d5c' }}>{row.loesung}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function GlossarTable() {
  const items = [
    { term: 'CMS', def: 'Content-Management-System – diese Anwendung hier' },
    { term: 'Sanity', def: 'Name der CMS-Software' },
    { term: 'Ausstellung', def: 'Thematische Einheit mit Inhalten + Kiosk-Darstellung' },
    { term: 'Exponat', def: 'Einzelnes Ausstellungsobjekt (Gemälde, Werkzeug, Dokument …)' },
    { term: 'Kiosk', def: 'Touchscreen-Computer im Museum (Raspberry Pi)' },
    { term: 'Sync', def: 'Automatischer Datenabgleich alle 5 Minuten' },
    { term: 'Slug', def: 'URL-freundliche Version des Titels (automatisch generiert)' },
    { term: 'Veröffentlichen', def: 'Inhalte für den Kiosk freischalten' },
    { term: 'Entwurf', def: 'Noch nicht freigeschaltete Version' },
    { term: 'Highlight', def: 'Als besonders wichtig markiertes Exponat' },
    { term: 'Overlay', def: 'Eingeblendete Info über dem Video/Bild' },
    { term: 'VTT', def: 'Untertitel-Dateiformat für Videos (WebVTT)' },
  ]
  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Begriff</th>
          <th style={styles.th}>Erklärung</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
            <td style={{ ...styles.td, fontWeight: 600 }}>{item.term}</td>
            <td style={styles.td}>{item.def}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = {
  page: {
    background: '#f5f5f5',
    minHeight: '100vh',
    padding: '0 0 60px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#1a1a1a',
  },
  container: {
    maxWidth: 880,
    margin: '0 auto',
    padding: '40px 24px',
  },
  h1: {
    fontSize: '2rem',
    fontWeight: 700,
    marginBottom: 8,
    color: '#0f172a',
  },
  intro: {
    fontSize: '1.05rem',
    lineHeight: 1.6,
    color: '#475569',
    marginBottom: 40,
    padding: '16px 20px',
    background: '#e0f2fe',
    borderRadius: 8,
    borderLeft: '4px solid #0284c7',
  },
  section: {
    marginBottom: 48,
  },
  h2: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottom: '2px solid #e2e8f0',
  },
  infoBox: {
    marginTop: 16,
    padding: '12px 16px',
    background: '#fef9c3',
    borderRadius: 8,
    borderLeft: '4px solid #eab308',
    fontSize: '0.9rem',
    lineHeight: 1.5,
  },
  badge: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 12,
    color: 'white',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  flowRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    padding: '20px',
    background: 'white',
    borderRadius: 10,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  flowItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  flowIcon: {
    fontSize: '1.8rem',
  },
  flowLabel: {
    fontSize: '0.8rem',
    color: '#475569',
    whiteSpace: 'pre-line',
    lineHeight: 1.3,
    maxWidth: 100,
  },
  flowArrow: {
    fontSize: '1.5rem',
    color: '#94a3b8',
    marginLeft: 8,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    fontSize: '0.9rem',
  },
  th: {
    background: '#1e293b',
    color: 'white',
    padding: '10px 14px',
    textAlign: 'left',
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  td: {
    padding: '10px 14px',
    verticalAlign: 'top',
    lineHeight: 1.5,
  },
  trEven: { background: 'white' },
  trOdd: { background: '#f8fafc' },
  modiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: 16,
  },
  modiCard: {
    background: 'white',
    borderRadius: 10,
    padding: 18,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
  },
  modiEmoji: {
    fontSize: '2rem',
    marginBottom: 6,
  },
  modiName: {
    fontWeight: 700,
    fontSize: '1rem',
    marginBottom: 4,
  },
  modiDesc: {
    fontSize: '0.85rem',
    color: '#475569',
    marginBottom: 10,
    lineHeight: 1.4,
  },
  modiVoraus: {
    fontSize: '0.78rem',
    color: '#64748b',
    background: '#f1f5f9',
    padding: '6px 8px',
    borderRadius: 6,
    marginBottom: 8,
  },
  modiTipp: {
    fontSize: '0.78rem',
    color: '#854d0e',
    background: '#fef9c3',
    padding: '6px 8px',
    borderRadius: 6,
  },
  stepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  stepItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    background: 'white',
    padding: '12px 16px',
    borderRadius: 8,
    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
  },
  stepNumber: {
    flexShrink: 0,
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: '#0284c7',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.9rem',
  },
  stepEmoji: {
    fontSize: '1.2rem',
    flexShrink: 0,
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontWeight: 600,
    marginBottom: 2,
    fontSize: '0.95rem',
  },
  stepText: {
    fontSize: '0.85rem',
    color: '#475569',
    lineHeight: 1.4,
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  taskItem: {
    background: 'white',
    borderRadius: 8,
    padding: '14px 18px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
  },
  taskTitle: {
    fontWeight: 700,
    marginBottom: 10,
    fontSize: '0.95rem',
  },
  taskSteps: {
    margin: 0,
    padding: '0 0 0 20px',
  },
  taskStep: {
    fontSize: '0.87rem',
    color: '#475569',
    lineHeight: 1.6,
  },
  footer: {
    marginTop: 48,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '0.8rem',
    borderTop: '1px solid #e2e8f0',
    paddingTop: 24,
  },
}
