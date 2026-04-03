// schemas/kategorie.js
export default {
  name: 'kategorie',
  title: 'Kategorie',
  type: 'document',
  fields: [
    {
      name: 'titel',
      title: 'Kategorie-Name',
      type: 'string',
      validation: Rule => Rule.required().error('Bitte einen Kategorie-Namen eingeben.'),
      description: 'Anzeigename der Kategorie, z.B. "Keramik", "Werkzeuge", "Textilien"'
    },
    {
      name: 'slug',
      title: 'URL-Adresse (Slug)',
      type: 'slug',
      options: {
        source: 'titel',
        maxLength: 96
      },
      validation: Rule => Rule.required().error('Bitte einen URL-Slug generieren (Schaltfläche "Generieren" klicken).'),
      description: 'Wird automatisch aus dem Titel erzeugt. Klicken Sie auf "Generieren".'
    },
    {
      name: 'beschreibung',
      title: 'Beschreibung',
      type: 'text',
      rows: 3,
      description: 'Kurze Erklärung dieser Kategorie (optional) – wird in der Filterleiste als Tooltip angezeigt'
    },
    {
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'Emoji oder Icon-Name',
      options: {
        list: [
          {title: '🏛️ Antike', value: '🏛️'},
          {title: '⚔️ Mittelalter', value: '⚔️'},
          {title: '🎨 Kunst', value: '🎨'},
          {title: '⚙️ Technik', value: '⚙️'},
          {title: '👗 Mode', value: '👗'},
          {title: '🏺 Keramik', value: '🏺'},
          {title: '📜 Dokumente', value: '📜'},
          {title: '🪑 Möbel', value: '🪑'},
          {title: '🔨 Werkzeuge', value: '🔨'},
          {title: '🌾 Landwirtschaft', value: '🌾'},
          {title: '🏠 Alltag', value: '🏠'},
          {title: '📚 Bücher', value: '📚'},
          {title: '💎 Schmuck', value: '💎'},
          {title: '🪙 Münzen', value: '🪙'},
          {title: '🗿 Skulpturen', value: '🗿'}
        ]
      }
    },
    {
      name: 'farbe',
      title: 'Farbe (Hex)',
      type: 'string',
      description: 'Akzentfarbe der Kategorie als Hex-Code, z.B. #667eea. Wird im Explorer als Filterbadge angezeigt.',
      validation: Rule => Rule.regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
        name: 'hex',
        invert: false
      }).error('Bitte einen gültigen Hex-Farbcode eingeben (z.B. #667eea oder #abc).'),
      initialValue: '#667eea'
    },
    {
      name: 'reihenfolge',
      title: 'Reihenfolge',
      type: 'number',
      description: 'Niedrigere Zahl = weiter oben in der Filterliste. Leer lassen für alphabetische Sortierung.'
    },
    {
      name: 'elternkategorie',
      title: 'Übergeordnete Kategorie',
      type: 'reference',
      to: [{type: 'kategorie'}],
      description: 'Nur für Unterkategorien ausfüllen. Leer lassen für Hauptkategorien.'
    }
  ],
  preview: {
    select: {
      title: 'titel',
      subtitle: 'beschreibung',
      icon: 'icon'
    },
    prepare(selection) {
      const {title, subtitle, icon} = selection;
      return {
        title: `${icon || '📁'} ${title}`,
        subtitle
      };
    }
  },
  orderings: [
    {
      title: 'Reihenfolge',
      name: 'reihenfolgeAsc',
      by: [{field: 'reihenfolge', direction: 'asc'}]
    },
    {
      title: 'Alphabetisch',
      name: 'titelAsc',
      by: [{field: 'titel', direction: 'asc'}]
    }
  ]
};