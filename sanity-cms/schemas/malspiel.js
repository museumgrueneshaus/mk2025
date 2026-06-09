// schemas/malspiel.js

export default {
  name: 'malspiel',
  title: 'Malspiel',
  type: 'document',

  groups: [
    { name: 'inhalt', title: 'Inhalt', default: true },
    { name: 'farben', title: 'Farben & Werkzeuge' },
    { name: 'verwaltung', title: 'Verwaltung' }
  ],

  fields: [

    // ── TAB: INHALT ────────────────────────────────────────────────────────
    {
      name: 'titel',
      title: 'Titel',
      type: 'string',
      group: 'inhalt',
      validation: Rule => Rule.required().error('Titel ist erforderlich.'),
      description: 'Interner Name des Malspiels (wird im Kiosk-Menü angezeigt)'
    },
    {
      name: 'ausmalbild',
      title: 'Ausmalbild (Vorlage)',
      type: 'image',
      group: 'inhalt',
      options: { hotspot: false },
      validation: Rule => Rule.required().error('Ein Ausmalbild ist erforderlich.'),
      description: 'Schwarzweiß-Vorlage als PNG oder SVG. Empfehlung: weißer Hintergrund, klare schwarze Linien, mind. 1200×1200 px.',
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternativtext',
          description: 'Kurze Bildbeschreibung für Barrierefreiheit'
        }
      ]
    },
    {
      name: 'bezug_exponat',
      title: 'Bezug zu Exponat',
      type: 'reference',
      to: [{ type: 'exponat' }],
      group: 'inhalt',
      description: 'Optional: Welchem Museumsobjekt ist dieses Malspiel zugeordnet?'
    },

    // ── TAB: FARBEN & WERKZEUGE ────────────────────────────────────────────
    {
      name: 'farben',
      title: 'Farbpalette',
      type: 'array',
      group: 'farben',
      of: [
        {
          type: 'object',
          title: 'Farbe',
          fields: [
            {
              name: 'name',
              title: 'Name',
              type: 'string',
              description: 'z.B. "Rot", "Himmelblau"'
            },
            {
              name: 'hex',
              title: 'Farbcode (HEX)',
              type: 'string',
              validation: Rule => Rule.required().regex(/^#[0-9A-Fa-f]{6}$/).error('Bitte gültigen HEX-Code eingeben, z.B. #FF0000'),
              description: 'z.B. #FF0000 für Rot'
            }
          ],
          preview: {
            select: { title: 'name', subtitle: 'hex' },
            prepare({ title, subtitle }) {
              return { title: title || subtitle, subtitle }
            }
          }
        }
      ],
      initialValue: [
        { name: 'Schwarz',      hex: '#1a1a1a' },
        { name: 'Dunkelbraun',  hex: '#5C3317' },
        { name: 'Rotbraun',     hex: '#A0522D' },
        { name: 'Rot',          hex: '#CC2200' },
        { name: 'Orange',       hex: '#E87820' },
        { name: 'Gelb',         hex: '#F5C800' },
        { name: 'Hellgrün',     hex: '#5DB85D' },
        { name: 'Dunkelgrün',   hex: '#2E6B2E' },
        { name: 'Hellblau',     hex: '#5BA4D4' },
        { name: 'Dunkelblau',   hex: '#1A3D8F' },
        { name: 'Lila',         hex: '#7B3FA0' },
        { name: 'Rosa',         hex: '#F0A0C0' },
        { name: 'Hellgrau',     hex: '#CCCCCC' },
        { name: 'Weiß',         hex: '#FFFFFF' }
      ],
      description: 'Die Farben die links im Kiosk angezeigt werden. Reihenfolge = Anzeigereihenfolge.'
    },
    {
      name: 'stifte',
      title: 'Stiftgrößen',
      type: 'array',
      group: 'farben',
      of: [
        {
          type: 'object',
          title: 'Stift',
          fields: [
            {
              name: 'bezeichnung',
              title: 'Bezeichnung',
              type: 'string',
              description: 'z.B. "Fein", "Mittel", "Breit"'
            },
            {
              name: 'groesse',
              title: 'Größe (px)',
              type: 'number',
              description: 'Stiftgröße in Pixel auf dem Touchscreen (z.B. 4, 12, 28)',
              validation: Rule => Rule.required().min(1).max(100)
            },
            {
              name: 'standard',
              title: 'Standardmäßig aktiv',
              type: 'boolean',
              initialValue: false,
              description: 'Welcher Stift ist beim Start ausgewählt?'
            }
          ],
          preview: {
            select: { title: 'bezeichnung', subtitle: 'groesse' },
            prepare({ title, subtitle }) {
              return { title: title || 'Stift', subtitle: `${subtitle} px` }
            }
          }
        }
      ],
      initialValue: [
        { bezeichnung: 'Fein',   groesse: 4,  standard: false },
        { bezeichnung: 'Mittel', groesse: 14, standard: true  },
        { bezeichnung: 'Breit',  groesse: 32, standard: false }
      ],
      description: '2–3 Stiftgrößen empfohlen. Radierer ist immer verfügbar und wird automatisch angezeigt.'
    },
    {
      name: 'radierer_groesse',
      title: 'Radierergröße (px)',
      type: 'number',
      group: 'farben',
      initialValue: 40,
      validation: Rule => Rule.min(10).max(150),
      description: 'Größe des Radierers in Pixel (Standard: 40)'
    },

    // ── TAB: VERWALTUNG ────────────────────────────────────────────────────
    {
      name: 'veroeffentlichung',
      title: 'Veröffentlichungsstatus',
      type: 'object',
      group: 'verwaltung',
      fields: [
        {
          name: 'status',
          title: 'Status',
          type: 'string',
          options: {
            list: [
              { title: 'Entwurf – noch nicht sichtbar',       value: 'entwurf' },
              { title: '✅ Aktiv – auf Kiosk sichtbar',        value: 'aktiv' },
              { title: 'Archiviert – nicht mehr aktiv',        value: 'archiviert' }
            ]
          },
          initialValue: 'entwurf'
        }
      ]
    },
    {
      name: 'reihenfolge',
      title: 'Reihenfolge',
      type: 'number',
      group: 'verwaltung',
      description: 'Niedrigere Zahl = weiter oben in der Auswahlliste am Kiosk'
    }

  ],

  preview: {
    select: {
      title: 'titel',
      media: 'ausmalbild',
      status: 'veroeffentlichung.status'
    },
    prepare({ title, media, status }) {
      const statusLabel = {
        entwurf:    '✏️',
        aktiv:      '✅',
        archiviert: '📦'
      }[status] || ''
      return {
        title: `${title || '(Ohne Titel)'}`,
        subtitle: statusLabel,
        media
      }
    }
  },

  orderings: [
    {
      title: 'Reihenfolge',
      name: 'reihenfolgeAsc',
      by: [{ field: 'reihenfolge', direction: 'asc' }]
    },
    {
      title: 'Titel A–Z',
      name: 'titelAsc',
      by: [{ field: 'titel', direction: 'asc' }]
    }
  ]
}
