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