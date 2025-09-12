// schemas/exponat.js
export default {
  name: 'exponat',
  title: 'Exponat',
  type: 'document',
  fields: [
    // === IDENTIFIKATION ===
    {
      name: 'inventarnummer',
      title: 'Inventarnummer',
      type: 'string',
      validation: Rule => Rule.required().error('Inventarnummer ist erforderlich'),
      description: 'Ihre bestehende Inventarnummer (z.B. 2024.001, INV-123, etc.)'
    },
    {
      name: 'titel',
      title: 'Titel',
      type: 'string',
      validation: Rule => Rule.required().max(200).error('Titel ist erforderlich (max. 200 Zeichen)'),
      description: 'Objektbezeichnung - Was ist es?'
    },
    {
      name: 'untertitel',
      title: 'Untertitel',
      type: 'string',
      description: 'Optionaler Untertitel oder alternative Bezeichnung'
    },

    // === BESCHREIBUNG ===
    {
      name: 'kurzbeschreibung',
      title: 'Kurzbeschreibung',
      type: 'text',
      rows: 3,
      validation: Rule => Rule.required().max(500).error('Kurzbeschreibung erforderlich (max. 500 Zeichen)'),
      description: 'Für Besucher - in einfacher Sprache (2-3 Sätze)'
    },
    {
      name: 'beschreibung',
      title: 'Ausführliche Beschreibung',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'Zitat', value: 'blockquote'}
          ],
          marks: {
            decorators: [
              {title: 'Fett', value: 'strong'},
              {title: 'Kursiv', value: 'em'},
              {title: 'Unterstrichen', value: 'underline'}
            ],
            annotations: [
              {
                title: 'Link',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url'
                  }
                ]
              }
            ]
          }
        },
        {
          type: 'image',
          options: {
            hotspot: true
          }
        }
      ],
      description: 'Detaillierte Informationen mit Formatierung und Bildern'
    },

    // === MEDIEN ===
    {
      name: 'hauptbild',
      title: 'Hauptbild',
      type: 'image',
      options: {
        hotspot: true,
        metadata: ['blurhash', 'lqip', 'palette']
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternativtext',
          description: 'Beschreibung für Barrierefreiheit'
        },
        {
          name: 'bildnachweis',
          type: 'string',
          title: 'Bildnachweis',
          description: '© Fotograf/Museum'
        }
      ]
    },
    {
      name: 'bilder',
      title: 'Weitere Bilder',
      type: 'array',
      of: [{
        type: 'image',
        options: {
          hotspot: true,
          metadata: ['blurhash', 'lqip']
        },
        fields: [
          {
            name: 'alt',
            type: 'string',
            title: 'Alternativtext'
          },
          {
            name: 'caption',
            type: 'string',
            title: 'Bildunterschrift'
          },
          {
            name: 'ansicht',
            type: 'string',
            title: 'Ansicht',
            options: {
              list: [
                {title: 'Vorderseite', value: 'vorderseite'},
                {title: 'Rückseite', value: 'rueckseite'},
                {title: 'Seitenansicht', value: 'seitenansicht'},
                {title: 'Detail', value: 'detail'},
                {title: 'Signatur', value: 'signatur'},
                {title: 'Zustand', value: 'zustand'}
              ]
            }
          }
        ]
      }],
      description: 'Verschiedene Ansichten und Details'
    },
    {
      name: 'audio',
      title: 'Audioguide',
      type: 'array',
      of: [{
        type: 'file',
        title: 'Audiodatei',
        options: {
          accept: 'audio/*'
        },
        fields: [
          {
            name: 'sprache',
            type: 'string',
            title: 'Sprache',
            options: {
              list: [
                {title: 'Deutsch', value: 'de'},
                {title: 'English', value: 'en'},
                {title: 'Français', value: 'fr'},
                {title: 'Italiano', value: 'it'}
              ]
            }
          },
          {
            name: 'dauer',
            type: 'string',
            title: 'Dauer',
            description: 'z.B. 2:30'
          }
        ]
      }]
    },
    {
      name: 'video',
      title: 'Video',
      type: 'file',
      options: {
        accept: 'video/*'
      },
      fields: [
        {
          name: 'videotitel',
          type: 'string',
          title: 'Videotitel'
        },
        {
          name: 'dauer',
          type: 'string',
          title: 'Dauer'
        }
      ]
    },
    {
      name: 'dokumente',
      title: 'Dokumente',
      type: 'array',
      of: [{
        type: 'file',
        title: 'Dokument',
        fields: [
          {
            name: 'titel',
            type: 'string',
            title: 'Dokumenttitel'
          },
          {
            name: 'typ',
            type: 'string',
            title: 'Dokumenttyp',
            options: {
              list: [
                {title: 'Inventarkarte', value: 'inventarkarte'},
                {title: 'Restaurierungsbericht', value: 'restaurierung'},
                {title: 'Expertise', value: 'expertise'},
                {title: 'Historisches Dokument', value: 'historisch'},
                {title: 'Sonstiges', value: 'sonstiges'}
              ]
            }
          }
        ]
      }]
    },

    // === DATIERUNG ===
    {
      name: 'datierung',
      title: 'Datierung',
      type: 'object',
      fields: [
        {
          name: 'jahr_von',
          title: 'Jahr von',
          type: 'number',
          description: 'z.B. 1850 (negative Zahlen für v.Chr.)'
        },
        {
          name: 'jahr_bis',
          title: 'Jahr bis',
          type: 'number',
          description: 'Leer lassen wenn gleich wie "von"'
        },
        {
          name: 'jahr_text',
          title: 'Datierung (Text)',
          type: 'string',
          description: 'z.B. "um 1850", "1. Hälfte 19. Jh.", "Mittelalter"'
        },
        {
          name: 'epoche',
          title: 'Epoche',
          type: 'string',
          options: {
            list: [
              {title: 'Vorgeschichte', value: 'vorgeschichte'},
              {title: 'Antike', value: 'antike'},
              {title: 'Mittelalter', value: 'mittelalter'},
              {title: 'Frühe Neuzeit', value: 'fruehe_neuzeit'},
              {title: 'Neuzeit', value: 'neuzeit'},
              {title: 'Moderne', value: 'moderne'},
              {title: 'Zeitgenössisch', value: 'zeitgenoessisch'}
            ]
          }
        }
      ]
    },

    // === HERKUNFT & HERSTELLUNG ===
    {
      name: 'herstellung',
      title: 'Herstellung',
      type: 'object',
      fields: [
        {
          name: 'kuenstler',
          title: 'Künstler/Hersteller',
          type: 'string',
          description: 'Person oder Firma'
        },
        {
          name: 'entstehungsort',
          title: 'Entstehungsort',
          type: 'string',
          description: 'Ort oder Region'
        },
        {
          name: 'material',
          title: 'Material',
          type: 'string',
          description: 'z.B. "Holz, Eisen, Leder"'
        },
        {
          name: 'technik',
          title: 'Technik',
          type: 'string',
          description: 'z.B. "Öl auf Leinwand", "Geschmiedet"'
        },
        {
          name: 'signatur',
          title: 'Signatur/Stempel',
          type: 'string'
        }
      ]
    },

    // === MASSE & ZUSTAND ===
    {
      name: 'physisch',
      title: 'Physische Eigenschaften',
      type: 'object',
      fields: [
        {
          name: 'masse',
          title: 'Maße',
          type: 'string',
          description: 'z.B. "H: 30cm, B: 20cm, T: 10cm"'
        },
        {
          name: 'gewicht',
          title: 'Gewicht',
          type: 'string',
          description: 'z.B. "500g", "2,3 kg"'
        },
        {
          name: 'zustand',
          title: 'Erhaltungszustand',
          type: 'string',
          options: {
            list: [
              {title: 'Sehr gut', value: 'sehr_gut'},
              {title: 'Gut', value: 'gut'},
              {title: 'Befriedigend', value: 'befriedigend'},
              {title: 'Restaurierungsbedürftig', value: 'restaurierungsbeduerftig'},
              {title: 'Fragment', value: 'fragment'}
            ]
          }
        },
        {
          name: 'zustand_bemerkung',
          title: 'Zustandsbemerkung',
          type: 'text',
          rows: 2
        }
      ]
    },

    // === ORGANISATION ===
    {
      name: 'organisation',
      title: 'Organisation',
      type: 'object',
      fields: [
        {
          name: 'standort',
          title: 'Aktueller Standort',
          type: 'string',
          description: 'z.B. "Vitrine 3", "Depot A, Regal 2", "Ausgeliehen"'
        },
        {
          name: 'kategorie',
          title: 'Kategorie',
          type: 'reference',
          to: [{type: 'kategorie'}]
        },
        {
          name: 'sammlung',
          title: 'Sammlung',
          type: 'string',
          description: 'z.B. "Dauerausstellung", "Sondersammlung Meyer"'
        },
        {
          name: 'leihgeber',
          title: 'Leihgeber',
          type: 'string',
          description: 'Bei Leihgaben'
        },
        {
          name: 'erwerbung',
          title: 'Erwerbung',
          type: 'object',
          fields: [
            {
              name: 'art',
              title: 'Erwerbungsart',
              type: 'string',
              options: {
                list: [
                  {title: 'Schenkung', value: 'schenkung'},
                  {title: 'Kauf', value: 'kauf'},
                  {title: 'Leihgabe', value: 'leihgabe'},
                  {title: 'Fund', value: 'fund'},
                  {title: 'Nachlass', value: 'nachlass'}
                ]
              }
            },
            {
              name: 'datum',
              title: 'Erwerbungsdatum',
              type: 'date'
            },
            {
              name: 'person',
              title: 'Von Person/Institution',
              type: 'string'
            }
          ]
        }
      ]
    },

    // === TAGS & METADATEN ===
    {
      name: 'tags',
      title: 'Schlagworte',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags'
      },
      description: 'Für die Suche und Filterung'
    },
    {
      name: 'ist_highlight',
      title: 'Highlight-Objekt',
      type: 'boolean',
      description: 'Wird prominent auf der Startseite angezeigt'
    },
    {
      name: 'reihenfolge',
      title: 'Reihenfolge',
      type: 'number',
      description: 'Für geführte Touren oder Sortierung'
    },
    {
      name: 'qr_code',
      title: 'QR-Code ID',
      type: 'slug',
      options: {
        source: 'inventarnummer',
        slugify: input => 'EXP-' + input.replace(/[^a-zA-Z0-9]/g, '-')
      },
      description: 'Automatisch generiert für QR-Codes'
    },
    {
      name: 'hat_led_licht',
      title: 'Hat LED-Licht',
      type: 'boolean',
      initialValue: false,
      description: 'Hat dieses Exponat LED-Beleuchtung?'
    },
    {
      name: 'led_position',
      title: 'LED Position im Raum',
      type: 'object',
      description: 'Position des Exponats auf der LED-Strip (zeigt wo das Exponat im Raum hängt)',
      hidden: ({parent}) => !parent?.hat_led_licht,
      fields: [
        {
          name: 'strip_number',
          title: 'LED Strip Nummer',
          type: 'number',
          options: {
            list: [
              {title: 'Strip 1 (ESP32-1)', value: 1},
              {title: 'Strip 2 (ESP32-2)', value: 2},
              {title: 'Strip 3 (ESP32-3)', value: 3}
            ]
          },
          description: 'Welche LED-Strip (1, 2 oder 3)',
          validation: Rule => Rule.required().min(1).max(3)
        },
        {
          name: 'led_start',
          title: 'LED Start Position',
          type: 'number',
          description: 'Erste LED-Nummer auf dieser Strip (z.B. 0 für erste LED)',
          validation: Rule => Rule.min(0)
        },
        {
          name: 'led_end',
          title: 'LED End Position',
          type: 'number',
          description: 'Letzte LED-Nummer auf dieser Strip (z.B. 9 für LEDs 0-9)',
          validation: Rule => Rule.min(0)
        },
        {
          name: 'raum_position',
          title: 'Raum Position',
          type: 'string',
          description: 'Beschreibung der Position im Raum (z.B. "Nordwand, Mitte", "Ostwand, oben")'
        }
      ]
    },

    // === IMDAS IMPORT ===
    {
      name: 'import_metadata',
      title: 'Import Metadaten',
      type: 'object',
      fields: [
        {
          name: 'imdas_id',
          title: 'IMDAS ID',
          type: 'string',
          readOnly: true
        },
        {
          name: 'import_date',
          title: 'Import Datum',
          type: 'datetime',
          readOnly: true
        },
        {
          name: 'original_data',
          title: 'Original Daten',
          type: 'text',
          readOnly: true,
          description: 'JSON der ursprünglichen IMDAS-Daten'
        }
      ],
      hidden: ({currentUser}) => !currentUser.roles.find(r => r.name === 'administrator')
    },

    // === VERÖFFENTLICHUNG ===
    {
      name: 'veroeffentlichung',
      title: 'Veröffentlichung',
      type: 'object',
      fields: [
        {
          name: 'status',
          title: 'Status',
          type: 'string',
          options: {
            list: [
              {title: 'Entwurf', value: 'entwurf'},
              {title: 'In Bearbeitung', value: 'in_bearbeitung'},
              {title: 'Veröffentlicht', value: 'veroeffentlicht'},
              {title: 'Archiviert', value: 'archiviert'}
            ]
          },
          initialValue: 'entwurf'
        },
        {
          name: 'sichtbar_ab',
          title: 'Sichtbar ab',
          type: 'datetime',
          description: 'Für zeitgesteuerte Veröffentlichung'
        },
        {
          name: 'sichtbar_bis',
          title: 'Sichtbar bis',
          type: 'datetime',
          description: 'Für temporäre Ausstellungen'
        }
      ]
    }
  ],

  // === PREVIEW ===
  preview: {
    select: {
      title: 'titel',
      subtitle: 'inventarnummer',
      media: 'hauptbild',
      status: 'veroeffentlichung.status',
      highlight: 'ist_highlight'
    },
    prepare(selection) {
      const {title, subtitle, media, status, highlight} = selection;
      return {
        title: `${highlight ? '⭐ ' : ''}${title}`,
        subtitle: `${subtitle} ${status ? `[${status}]` : ''}`,
        media
      };
    }
  },

  // === ORDERINGS ===
  orderings: [
    {
      title: 'Inventarnummer',
      name: 'inventarnummerAsc',
      by: [{field: 'inventarnummer', direction: 'asc'}]
    },
    {
      title: 'Titel',
      name: 'titelAsc',
      by: [{field: 'titel', direction: 'asc'}]
    },
    {
      title: 'Neueste zuerst',
      name: 'createdDesc',
      by: [{field: '_createdAt', direction: 'desc'}]
    },
    {
      title: 'Highlights zuerst',
      name: 'highlightDesc',
      by: [
        {field: 'ist_highlight', direction: 'desc'},
        {field: 'reihenfolge', direction: 'asc'}
      ]
    }
  ]
};