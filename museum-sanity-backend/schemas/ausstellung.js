// schemas/ausstellung.js
export default {
  name: 'ausstellung',
  title: 'Ausstellung',
  type: 'document',
  fields: [
    // === GRUNDINFORMATIONEN ===
    {
      name: 'titel',
      title: 'Titel',
      type: 'string',
      validation: Rule => Rule.required().max(200),
      description: 'Name der Ausstellung'
    },
    {
      name: 'untertitel',
      title: 'Untertitel',
      type: 'string',
      description: 'Zusätzliche Information oder Zeitraum'
    },
    {
      name: 'slug',
      title: 'URL-Slug',
      type: 'slug',
      options: {
        source: 'titel',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    },

    // === BESCHREIBUNG ===
    {
      name: 'kurzbeschreibung',
      title: 'Kurzbeschreibung',
      type: 'text',
      rows: 3,
      validation: Rule => Rule.required().max(500),
      description: 'Teaser-Text für Übersichten (2-3 Sätze)'
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
      description: 'Detaillierte Informationen zur Ausstellung'
    },

    // === MEDIEN ===
    {
      name: 'titelbild',
      title: 'Titelbild',
      type: 'image',
      options: {
        hotspot: true,
        metadata: ['blurhash', 'lqip', 'palette']
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternativtext'
        },
        {
          name: 'bildnachweis',
          type: 'string',
          title: 'Bildnachweis'
        }
      ],
      validation: Rule => Rule.required()
    },
    {
      name: 'galerie',
      title: 'Bildergalerie',
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
          }
        ]
      }],
      description: 'Zusätzliche Bilder zur Ausstellung'
    },
    {
      name: 'videos',
      title: 'Videos',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {
            name: 'videodatei',
            title: 'Videodatei',
            type: 'file',
            options: {
              accept: 'video/*'
            }
          },
          {
            name: 'videotitel',
            type: 'string',
            title: 'Videotitel'
          },
          {
            name: 'beschreibung',
            type: 'text',
            title: 'Beschreibung',
            rows: 2
          },
          {
            name: 'dauer',
            type: 'string',
            title: 'Dauer',
            description: 'z.B. 5:30'
          },
          {
            name: 'thumbnail',
            type: 'image',
            title: 'Video-Vorschaubild'
          },
          {
            name: 'untertitel',
            title: 'Untertitel (VTT/SRT)',
            type: 'file',
            options: {
              accept: '.vtt,.srt'
            },
            description: 'WebVTT oder SRT Untertitel-Datei'
          }
        ],
        preview: {
          select: {
            title: 'videotitel',
            subtitle: 'dauer',
            media: 'thumbnail'
          }
        }
      }],
      description: 'Videos zur Ausstellung (Interviews, Dokumentationen, etc.)'
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
            title: 'Dokumenttitel',
            validation: Rule => Rule.required()
          },
          {
            name: 'beschreibung',
            type: 'text',
            title: 'Beschreibung',
            rows: 2
          },
          {
            name: 'ordner',
            type: 'reference',
            title: 'Ordner',
            to: [{type: 'dokumentKategorie'}],
            description: 'In welchen Ordner gehört dieses Dokument?'
          },
          {
            name: 'typ',
            type: 'string',
            title: 'Dokumenttyp',
            options: {
              list: [
                {title: 'Pressemitteilung', value: 'pressemitteilung'},
                {title: 'Ausstellungskatalog', value: 'katalog'},
                {title: 'Chronik', value: 'chronik'},
                {title: 'Zeitungsartikel', value: 'artikel'},
                {title: 'Programmheft', value: 'programm'},
                {title: 'Historisches Dokument', value: 'historisch'},
                {title: 'Sonstiges', value: 'sonstiges'}
              ]
            }
          }
        ],
        preview: {
          select: {
            title: 'titel',
            subtitle: 'typ'
          }
        }
      }],
      description: 'PDFs, Pressemitteilungen, historische Dokumente, etc.'
    },

    // === KIOSK TEMPLATE ===
    {
      name: 'kioskTemplate',
      title: '📺 Kiosk Template',
      type: 'object',
      description: 'Wie soll diese Ausstellung auf einem Kiosk dargestellt werden?',
      fields: [
        {
          name: 'template',
          title: 'Template-Typ',
          type: 'string',
          options: {
            list: [
              {title: '🎬 Video-Loop (Endlosschleife)', value: 'video'},
              {title: '🖼️ Slideshow (Bilder-Galerie)', value: 'slideshow'},
              {title: '📖 Reader (Scrollbare Inhalte)', value: 'reader'},
              {title: '🗂️ Explorer (Interaktiver Katalog)', value: 'explorer'}
            ]
          },
          initialValue: 'video',
          validation: Rule => Rule.required()
        },

        // Video-Loop Settings
        {
          name: 'videoSettings',
          title: 'Video-Loop Einstellungen',
          type: 'object',
          hidden: ({parent}) => parent?.template !== 'video',
          fields: [
            {
              name: 'loop',
              title: 'Endlos-Schleife',
              type: 'boolean',
              initialValue: true,
              description: 'Videos automatisch wiederholen'
            },
            {
              name: 'shuffle',
              title: 'Zufällige Reihenfolge',
              type: 'boolean',
              initialValue: false
            },
            {
              name: 'zeige_untertitel',
              title: 'Untertitel anzeigen',
              type: 'boolean',
              initialValue: false,
              description: 'VTT-Untertitel im Overlay anzeigen (falls vorhanden)'
            },
            {
              name: 'zeige_overlay',
              title: 'Info-Overlay anzeigen',
              type: 'boolean',
              initialValue: true,
              description: 'Titel/Beschreibung während Wiedergabe zeigen'
            },
            {
              name: 'overlay_position',
              title: 'Overlay-Position',
              type: 'string',
              options: {
                list: [
                  {title: 'Unten links', value: 'bottom-left'},
                  {title: 'Unten rechts', value: 'bottom-right'},
                  {title: 'Oben links', value: 'top-left'},
                  {title: 'Oben rechts', value: 'top-right'}
                ]
              },
              initialValue: 'bottom-left',
              hidden: ({parent}) => !parent?.zeige_overlay
            },
            {
              name: 'uebergang',
              title: 'Übergangseffekt',
              type: 'string',
              options: {
                list: [
                  {title: 'Überblenden', value: 'fade'},
                  {title: 'Schwarz blenden', value: 'black'},
                  {title: 'Kein Effekt', value: 'none'}
                ]
              },
              initialValue: 'fade'
            },
            {
              name: 'lautstaerke',
              title: 'Lautstärke',
              type: 'number',
              description: '0-100',
              initialValue: 70,
              validation: Rule => Rule.min(0).max(100)
            }
          ]
        },

        // Slideshow Settings
        {
          name: 'slideshowSettings',
          title: 'Slideshow Einstellungen',
          type: 'object',
          hidden: ({parent}) => parent?.template !== 'slideshow',
          fields: [
            {
              name: 'interval',
              title: 'Anzeigedauer (Sekunden)',
              type: 'number',
              initialValue: 10,
              validation: Rule => Rule.min(1)
            },
            {
              name: 'uebergang',
              title: 'Übergangseffekt',
              type: 'string',
              options: {
                list: [
                  {title: 'Überblenden', value: 'fade'},
                  {title: 'Schieben', value: 'slide'},
                  {title: 'Zoom', value: 'zoom'},
                  {title: 'Kein Effekt', value: 'none'}
                ]
              },
              initialValue: 'fade'
            },
            {
              name: 'zeige_info',
              title: 'Informationen anzeigen',
              type: 'boolean',
              initialValue: true
            }
          ]
        },

        // Explorer Settings
        {
          name: 'explorerSettings',
          title: 'Explorer Einstellungen',
          type: 'object',
          hidden: ({parent}) => parent?.template !== 'explorer',
          fields: [
            {
              name: 'nur_highlights',
              title: 'Nur Highlights zeigen',
              type: 'boolean',
              initialValue: false
            },
            {
              name: 'sortierung',
              title: 'Sortierung',
              type: 'string',
              options: {
                list: [
                  {title: 'Inventarnummer', value: 'inventarnummer'},
                  {title: 'Titel', value: 'titel'},
                  {title: 'Neueste zuerst', value: 'datum'},
                  {title: 'Zufällig', value: 'random'}
                ]
              },
              initialValue: 'inventarnummer'
            },
            {
              name: 'items_pro_seite',
              title: 'Objekte pro Seite',
              type: 'number',
              initialValue: 12,
              validation: Rule => Rule.min(1).max(50)
            }
          ]
        },

        // Reader Settings
        {
          name: 'readerSettings',
          title: 'Reader Einstellungen',
          type: 'object',
          hidden: ({parent}) => parent?.template !== 'reader',
          fields: [
            {
              name: 'schriftgroesse',
              title: 'Schriftgröße',
              type: 'string',
              options: {
                list: [
                  {title: 'Klein', value: 'small'},
                  {title: 'Normal', value: 'normal'},
                  {title: 'Groß', value: 'large'},
                  {title: 'Sehr groß', value: 'xlarge'}
                ]
              },
              initialValue: 'normal'
            },
            {
              name: 'zeige_inhaltsverzeichnis',
              title: 'Inhaltsverzeichnis anzeigen',
              type: 'boolean',
              initialValue: true
            }
          ]
        }
      ]
    },

    // === EXPONATE ===
    {
      name: 'exponate',
      title: 'Exponate',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{type: 'exponat'}]
      }],
      description: 'Exponate, die zu dieser Ausstellung gehören'
    },
    {
      name: 'highlight_exponate',
      title: 'Highlight-Exponate',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{type: 'exponat'}]
      }],
      description: 'Besonders wichtige Exponate dieser Ausstellung'
    },

    // === KATEGORIEN ===
    {
      name: 'kategorien',
      title: 'Zugehörige Kategorien',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{type: 'kategorie'}]
      }],
      description: 'Kategorien, die in dieser Ausstellung vorkommen'
    },

    // === ZEITRAUM ===
    {
      name: 'zeitraum',
      title: 'Zeitraum',
      type: 'object',
      fields: [
        {
          name: 'typ',
          title: 'Ausstellungstyp',
          type: 'string',
          options: {
            list: [
              {title: 'Dauerausstellung', value: 'dauer'},
              {title: 'Sonderausstellung', value: 'sonder'},
              {title: 'Temporäre Ausstellung', value: 'temporaer'},
              {title: 'Virtuelle Ausstellung', value: 'virtuell'}
            ]
          },
          initialValue: 'sonder'
        },
        {
          name: 'von',
          title: 'Von',
          type: 'date',
          description: 'Startdatum der Ausstellung'
        },
        {
          name: 'bis',
          title: 'Bis',
          type: 'date',
          description: 'Enddatum (leer lassen für Dauerausstellungen)'
        },
        {
          name: 'zeitraum_text',
          title: 'Zeitraum (Text)',
          type: 'string',
          description: 'z.B. "März - Oktober 2025", "Seit 1975"'
        }
      ]
    },

    // === KONTAKT & ORGANISATION ===
    {
      name: 'organisation',
      title: 'Organisation',
      type: 'object',
      fields: [
        {
          name: 'kurator',
          title: 'Kurator/Kuratorin',
          type: 'string'
        },
        {
          name: 'partner',
          title: 'Partner/Sponsoren',
          type: 'array',
          of: [{type: 'string'}]
        },
        {
          name: 'ort',
          title: 'Ausstellungsort',
          type: 'string',
          description: 'Raum oder Gebäude'
        },
        {
          name: 'raumplan',
          title: 'Raumplan',
          type: 'image',
          description: 'Grundriss oder Wegweiser'
        }
      ]
    },

    // === VERANSTALTUNGEN ===
    {
      name: 'veranstaltungen',
      title: 'Begleitveranstaltungen',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {
            name: 'titel',
            title: 'Titel',
            type: 'string',
            validation: Rule => Rule.required()
          },
          {
            name: 'datum',
            title: 'Datum',
            type: 'datetime'
          },
          {
            name: 'beschreibung',
            title: 'Beschreibung',
            type: 'text',
            rows: 3
          },
          {
            name: 'typ',
            title: 'Veranstaltungstyp',
            type: 'string',
            options: {
              list: [
                {title: 'Eröffnung', value: 'eroeffnung'},
                {title: 'Führung', value: 'fuehrung'},
                {title: 'Vortrag', value: 'vortrag'},
                {title: 'Workshop', value: 'workshop'},
                {title: 'Finissage', value: 'finissage'},
                {title: 'Sonstiges', value: 'sonstiges'}
              ]
            }
          }
        ],
        preview: {
          select: {
            title: 'titel',
            subtitle: 'datum',
            typ: 'typ'
          },
          prepare({title, datum, typ}) {
            return {
              title,
              subtitle: `${typ ? typ + ' - ' : ''}${datum ? new Date(datum).toLocaleDateString('de-DE') : 'Kein Datum'}`
            }
          }
        }
      }]
    },

    // === METADATEN ===
    {
      name: 'tags',
      title: 'Schlagworte',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags'
      }
    },
    {
      name: 'reihenfolge',
      title: 'Reihenfolge',
      type: 'number',
      description: 'Sortierung in Listen'
    },
    {
      name: 'ist_featured',
      title: 'Hervorgehoben',
      type: 'boolean',
      description: 'Wird prominent auf der Startseite angezeigt',
      initialValue: false
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
              {title: 'In Vorbereitung', value: 'vorbereitung'},
              {title: 'Veröffentlicht', value: 'veroeffentlicht'},
              {title: 'Beendet', value: 'beendet'},
              {title: 'Archiviert', value: 'archiviert'}
            ]
          },
          initialValue: 'entwurf'
        },
        {
          name: 'veroeffentlicht_am',
          title: 'Veröffentlicht am',
          type: 'datetime'
        }
      ]
    }
  ],

  // === PREVIEW ===
  preview: {
    select: {
      title: 'titel',
      subtitle: 'untertitel',
      media: 'titelbild',
      status: 'veroeffentlichung.status',
      featured: 'ist_featured',
      typ: 'zeitraum.typ'
    },
    prepare({title, subtitle, media, status, featured, typ}) {
      return {
        title: `${featured ? '⭐ ' : ''}${title}`,
        subtitle: `${typ ? `[${typ}] ` : ''}${subtitle || ''} ${status ? `• ${status}` : ''}`,
        media
      };
    }
  },

  // === ORDERINGS ===
  orderings: [
    {
      title: 'Reihenfolge',
      name: 'reihenfolgeAsc',
      by: [{field: 'reihenfolge', direction: 'asc'}]
    },
    {
      title: 'Neueste zuerst',
      name: 'createdDesc',
      by: [{field: '_createdAt', direction: 'desc'}]
    },
    {
      title: 'Alphabetisch',
      name: 'titelAsc',
      by: [{field: 'titel', direction: 'asc'}]
    },
    {
      title: 'Startdatum',
      name: 'startdatumDesc',
      by: [{field: 'zeitraum.von', direction: 'desc'}]
    }
  ]
};
