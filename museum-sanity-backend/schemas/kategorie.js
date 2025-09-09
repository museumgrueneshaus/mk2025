// schemas/kategorie.js
export default {
  name: 'kategorie',
  title: 'Kategorie',
  type: 'document',
  fields: [
    {
      name: 'titel',
      title: 'Titel',
      type: 'string',
      validation: Rule => Rule.required()
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
    {
      name: 'beschreibung',
      title: 'Beschreibung',
      type: 'text',
      rows: 3
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
      title: 'Farbe',
      type: 'string',
      description: 'Hex-Farbe für die Kategorie',
      validation: Rule => Rule.regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
        name: 'hex',
        invert: false
      }),
      initialValue: '#667eea'
    },
    {
      name: 'reihenfolge',
      title: 'Reihenfolge',
      type: 'number',
      description: 'Sortierung in Listen'
    },
    {
      name: 'elternkategorie',
      title: 'Übergeordnete Kategorie',
      type: 'reference',
      to: [{type: 'kategorie'}],
      description: 'Für Unterkategorien'
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