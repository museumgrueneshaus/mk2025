// schemas/kiosk-config.js
export default {
  name: 'kioskConfig',
  title: 'Kiosk Konfiguration',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Kiosk Name',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'z.B. "Eingang", "Raum 2", "Touchscreen 1"'
    },
    {
      name: 'kioskId',
      title: 'Kiosk ID',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'Eindeutige ID für diesen Kiosk (z.B. RPI_01, RPI_02). Muss mit der URL übereinstimmen!'
    },
    {
      name: 'standort',
      title: 'Standort',
      type: 'string',
      description: 'Wo befindet sich dieser Kiosk?'
    },
    {
      name: 'mac_adresse',
      title: 'MAC-Adresse',
      type: 'string',
      validation: Rule => Rule.regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, {
        name: 'MAC',
        invert: false
      }).error('Bitte gültige MAC-Adresse eingeben (z.B. AA:BB:CC:DD:EE:FF)'),
      description: 'MAC-Adresse des Geräts für automatische Konfiguration'
    },
    {
      name: 'ip_adresse',
      title: 'IP-Adresse',
      type: 'string',
      description: 'Optionale feste IP-Adresse'
    },
    {
      name: 'modus',
      title: 'Standard-Modus',
      type: 'string',
      options: {
        list: [
          {title: 'Explorer (Katalog)', value: 'explorer'},
          {title: 'Slideshow', value: 'slideshow'},
          {title: 'Einzelnes Exponat', value: 'single'},
          {title: 'Kategorie-Ansicht', value: 'category'},
          {title: 'Video-Loop', value: 'video'},
          {title: 'Info-Screen', value: 'info'},
          {title: 'QR-Scanner', value: 'scanner'}
        ]
      },
      initialValue: 'explorer'
    },
    {
      name: 'konfiguration',
      title: 'Modus-Konfiguration',
      type: 'object',
      fields: [
        // Explorer Modus
        {
          name: 'explorer_settings',
          title: 'Explorer Einstellungen',
          type: 'object',
          hidden: ({parent}) => parent?.modus !== 'explorer',
          fields: [
            {
              name: 'kategorien',
              title: 'Angezeigte Kategorien',
              type: 'array',
              of: [{type: 'reference', to: [{type: 'kategorie'}]}],
              description: 'Leer = alle Kategorien'
            },
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
              }
            },
            {
              name: 'items_pro_seite',
              title: 'Objekte pro Seite',
              type: 'number',
              initialValue: 12
            }
          ]
        },
        // Slideshow Modus
        {
          name: 'slideshow_settings',
          title: 'Slideshow Einstellungen',
          type: 'object',
          hidden: ({parent}) => parent?.modus !== 'slideshow',
          fields: [
            {
              name: 'exponate',
              title: 'Exponate für Slideshow',
              type: 'array',
              of: [{type: 'reference', to: [{type: 'exponat'}]}],
              description: 'Leer = alle Highlights'
            },
            {
              name: 'interval',
              title: 'Anzeigedauer (Sekunden)',
              type: 'number',
              initialValue: 10
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
        // Single Exponat Modus
        {
          name: 'single_settings',
          title: 'Einzelexponat Einstellungen',
          type: 'object',
          hidden: ({parent}) => parent?.modus !== 'single',
          fields: [
            {
              name: 'exponat',
              title: 'Angezeigtes Exponat',
              type: 'reference',
              to: [{type: 'exponat'}],
              validation: Rule => Rule.required()
            },
            {
              name: 'zeige_navigation',
              title: 'Navigation zu anderen Exponaten',
              type: 'boolean',
              initialValue: false
            }
          ]
        },
        // Kategorie Modus
        {
          name: 'category_settings',
          title: 'Kategorie Einstellungen',
          type: 'object',
          hidden: ({parent}) => parent?.modus !== 'category',
          fields: [
            {
              name: 'kategorie',
              title: 'Angezeigte Kategorie',
              type: 'reference',
              to: [{type: 'kategorie'}],
              validation: Rule => Rule.required()
            }
          ]
        },
        // Video-Loop Modus
        {
          name: 'video_settings',
          title: 'Video-Loop Einstellungen',
          type: 'object',
          hidden: ({parent}) => parent?.modus !== 'video',
          fields: [
            {
              name: 'playlist',
              title: 'Video Playlist',
              type: 'array',
              of: [{
                type: 'object',
                fields: [
                  {
                    name: 'typ',
                    title: 'Typ',
                    type: 'string',
                    options: {
                      list: [
                        {title: 'Video', value: 'video'},
                        {title: 'Bild', value: 'image'}
                      ]
                    },
                    initialValue: 'video'
                  },
                  {
                    name: 'video',
                    title: 'Video-Datei',
                    type: 'file',
                    options: {
                      accept: 'video/mp4,video/webm,video/mov'
                    },
                    hidden: ({parent}) => parent?.typ !== 'video'
                  },
                  {
                    name: 'video_url',
                    title: 'Oder Video-URL',
                    type: 'url',
                    description: 'Alternative: YouTube, Vimeo, oder direkter Link',
                    hidden: ({parent}) => parent?.typ !== 'video'
                  },
                  {
                    name: 'bild',
                    title: 'Bild-Datei',
                    type: 'image',
                    options: {
                      hotspot: true
                    },
                    hidden: ({parent}) => parent?.typ !== 'image'
                  },
                  {
                    name: 'dauer',
                    title: 'Anzeigedauer (Sekunden)',
                    type: 'number',
                    description: 'Nur für Bilder - wie lange soll das Bild angezeigt werden?',
                    initialValue: 10,
                    hidden: ({parent}) => parent?.typ !== 'image'
                  },
                  {
                    name: 'titel',
                    title: 'Titel',
                    type: 'string',
                    description: 'Optional: Wird als Overlay angezeigt'
                  },
                  {
                    name: 'beschreibung',
                    title: 'Beschreibung',
                    type: 'text',
                    rows: 2,
                    description: 'Optional: Wird als Overlay angezeigt'
                  },
                  {
                    name: 'untertitel',
                    title: 'Untertitel (VTT/SRT)',
                    type: 'file',
                    options: {
                      accept: '.vtt,.srt'
                    },
                    description: 'WebVTT oder SRT Untertitel-Datei',
                    hidden: ({parent}) => parent?.typ !== 'video'
                  }
                ],
                preview: {
                  select: {
                    title: 'titel',
                    typ: 'typ',
                    media: 'bild'
                  },
                  prepare(selection) {
                    const {title, typ, media} = selection;
                    return {
                      title: title || 'Unbenannt',
                      subtitle: typ === 'video' ? '🎬 Video' : '🖼️ Bild',
                      media: media
                    };
                  }
                }
              }],
              description: 'Reihenfolge durch Ziehen ändern'
            },
            {
              name: 'loop',
              title: 'Endlos-Schleife',
              type: 'boolean',
              initialValue: true,
              description: 'Playlist automatisch wiederholen'
            },
            {
              name: 'shuffle',
              title: 'Zufällige Reihenfolge',
              type: 'boolean',
              initialValue: false
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
              name: 'audio',
              title: 'Audio-Einstellungen',
              type: 'object',
              fields: [
                {
                  name: 'lautstaerke',
                  title: 'Lautstärke',
                  type: 'number',
                  description: '0-100',
                  initialValue: 70,
                  validation: Rule => Rule.min(0).max(100)
                },
                {
                  name: 'stumm',
                  title: 'Stumm schalten',
                  type: 'boolean',
                  initialValue: false
                }
              ]
            },
            {
              name: 'zeige_untertitel',
              title: 'Untertitel anzeigen',
              type: 'boolean',
              initialValue: false,
              description: 'VTT-Untertitel im Overlay anzeigen (falls vorhanden)'
            }
          ]
        }
      ]
    },
    {
      name: 'design',
      title: 'Design Anpassungen',
      type: 'object',
      fields: [
        {
          name: 'theme',
          title: 'Farbschema',
          type: 'string',
          options: {
            list: [
              {title: 'Standard (Lila)', value: 'default'},
              {title: 'Museum Klassisch', value: 'classic'},
              {title: 'Modern Hell', value: 'light'},
              {title: 'Modern Dunkel', value: 'dark'},
              {title: 'Hoher Kontrast', value: 'high-contrast'}
            ]
          },
          initialValue: 'default'
        },
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
          name: 'logo',
          title: 'Museum Logo',
          type: 'image',
          description: 'Wird in der Kopfzeile angezeigt'
        },
        {
          name: 'hintergrundbild',
          title: 'Hintergrundbild',
          type: 'image',
          description: 'Für Startbildschirm oder Hintergrund'
        },
        {
          name: 'primaerfarbe',
          title: 'Primärfarbe',
          type: 'string',
          description: 'Hex-Farbe (z.B. #667eea)',
          validation: Rule => Rule.regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
        }
      ]
    },
    {
      name: 'funktionen',
      title: 'Funktionen',
      type: 'object',
      fields: [
        {
          name: 'sprachen',
          title: 'Verfügbare Sprachen',
          type: 'array',
          of: [{
            type: 'string',
            options: {
              list: [
                {title: 'Deutsch', value: 'de'},
                {title: 'English', value: 'en'},
                {title: 'Français', value: 'fr'},
                {title: 'Italiano', value: 'it'},
                {title: 'Español', value: 'es'}
              ]
            }
          }],
          initialValue: ['de']
        },
        {
          name: 'zeige_qr_codes',
          title: 'QR-Codes anzeigen',
          type: 'boolean',
          initialValue: true,
          description: 'QR-Codes bei Exponaten anzeigen'
        },
        {
          name: 'audio_autoplay',
          title: 'Audio automatisch abspielen',
          type: 'boolean',
          initialValue: false
        },
        {
          name: 'touch_sounds',
          title: 'Touch-Sounds',
          type: 'boolean',
          initialValue: false,
          description: 'Soundeffekte bei Berührung'
        },
        {
          name: 'idle_timeout',
          title: 'Idle-Timeout (Sekunden)',
          type: 'number',
          initialValue: 300,
          description: 'Nach dieser Zeit zurück zum Startbildschirm'
        },
        {
          name: 'zeige_uhr',
          title: 'Uhrzeit anzeigen',
          type: 'boolean',
          initialValue: true
        },
        {
          name: 'statistiken',
          title: 'Nutzungsstatistiken sammeln',
          type: 'boolean',
          initialValue: false,
          description: 'Anonyme Nutzungsdaten für Verbesserungen'
        },
        {
          name: 'mqtt',
          title: 'MQTT Konfiguration',
          type: 'object',
          fields: [
            {
              name: 'aktiviert',
              title: 'MQTT aktiviert',
              type: 'boolean',
              initialValue: false,
              description: 'MQTT-Funktionalität aktivieren'
            },
            {
              name: 'broker_url',
              title: 'MQTT Broker URL',
              type: 'string',
              description: 'z.B. mqtt://localhost:1883 oder wss://broker.example.com:8883',
              hidden: ({parent}) => !parent?.aktiviert
            },
            {
              name: 'username',
              title: 'Benutzername',
              type: 'string',
              hidden: ({parent}) => !parent?.aktiviert
            },
            {
              name: 'password',
              title: 'Passwort',
              type: 'string',
              hidden: ({parent}) => !parent?.aktiviert
            },
            {
              name: 'client_id',
              title: 'Client ID',
              type: 'string',
              description: 'Eindeutige ID für diesen Kiosk',
              hidden: ({parent}) => !parent?.aktiviert
            },
            {
              name: 'topics',
              title: 'MQTT Topics',
              type: 'object',
              hidden: ({parent}) => !parent?.aktiviert,
              fields: [
                {
                  name: 'lightbulb_topic_base',
                  title: 'Lightbulb Topic Base',
                  type: 'string',
                  description: 'Basis-Topic für LED-Strips (z.B. museum/led)',
                  initialValue: 'museum/led'
                },
                {
                  name: 'status_topic',
                  title: 'Status Topic',
                  type: 'string',
                  description: 'Topic für Kiosk-Status (z.B. museum/kiosk/status)',
                  initialValue: 'museum/kiosk/status'
                },
                {
                  name: 'interaction_topic',
                  title: 'Interaction Topic',
                  type: 'string',
                  description: 'Topic für Benutzerinteraktionen (z.B. museum/kiosk/interaction)',
                  initialValue: 'museum/kiosk/interaction'
                }
              ]
            },
            {
              name: 'led_strips',
              title: 'LED Strip Konfiguration',
              type: 'array',
              hidden: ({parent}) => !parent?.aktiviert,
              of: [{
                type: 'object',
                fields: [
                  {
                    name: 'strip_number',
                    title: 'Strip Nummer',
                    type: 'number',
                    options: {
                      list: [
                        {title: 'Strip 1', value: 1},
                        {title: 'Strip 2', value: 2},
                        {title: 'Strip 3', value: 3}
                      ]
                    },
                    validation: Rule => Rule.required().min(1).max(3)
                  },
                  {
                    name: 'esp32_id',
                    title: 'ESP32 ID',
                    type: 'string',
                    description: 'Eindeutige ID des ESP32 (z.B. esp32-strip1)',
                    validation: Rule => Rule.required()
                  },
                  {
                    name: 'total_leds',
                    title: 'Anzahl LEDs',
                    type: 'number',
                    description: 'Gesamtanzahl LEDs auf dieser Strip',
                    initialValue: 100,
                    validation: Rule => Rule.required().min(1)
                  },
                  {
                    name: 'raum_position',
                    title: 'Position im Raum',
                    type: 'string',
                    description: 'Wo ist diese Strip im Raum (z.B. "Nordwand", "Ostwand", "Südwand")'
                  }
                ]
              }],
              initialValue: [
                {strip_number: 1, esp32_id: 'esp32-strip1', total_leds: 100, raum_position: 'Nordwand'},
                {strip_number: 2, esp32_id: 'esp32-strip2', total_leds: 100, raum_position: 'Ostwand'},
                {strip_number: 3, esp32_id: 'esp32-strip3', total_leds: 100, raum_position: 'Südwand'}
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'wartung',
      title: 'Wartung',
      type: 'object',
      fields: [
        {
          name: 'auto_neustart',
          title: 'Automatischer Neustart',
          type: 'object',
          fields: [
            {
              name: 'aktiviert',
              title: 'Aktiviert',
              type: 'boolean',
              initialValue: false
            },
            {
              name: 'uhrzeit',
              title: 'Neustart-Uhrzeit',
              type: 'string',
              description: 'z.B. 03:00',
              hidden: ({parent}) => !parent?.aktiviert
            }
          ]
        },
        {
          name: 'debug_modus',
          title: 'Debug-Modus',
          type: 'boolean',
          initialValue: false,
          description: 'Zeigt technische Informationen'
        },
        {
          name: 'cache_dauer',
          title: 'Cache-Dauer (Minuten)',
          type: 'number',
          initialValue: 60,
          description: 'Wie lange Inhalte zwischengespeichert werden'
        }
      ]
    },
    {
      name: 'aktiv',
      title: 'Kiosk aktiv',
      type: 'boolean',
      initialValue: true,
      description: 'Kiosk ein-/ausschalten'
    },
    {
      name: 'notizen',
      title: 'Interne Notizen',
      type: 'text',
      rows: 3,
      description: 'Wartungshinweise, besondere Konfigurationen, etc.'
    }
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'standort',
      modus: 'modus',
      aktiv: 'aktiv'
    },
    prepare(selection) {
      const {title, subtitle, modus, aktiv} = selection;
      return {
        title: `${!aktiv ? '🔴 ' : '🟢 '}${title}`,
        subtitle: `${subtitle || ''} - Modus: ${modus}`,
      };
    }
  }
};