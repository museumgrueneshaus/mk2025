// schemas/dokumentKategorie.js
export default {
  name: 'dokumentKategorie',
  title: 'Dokument-Ordner',
  type: 'document',
  icon: () => '📁',
  fields: [
    {
      name: 'name',
      title: 'Ordner-Name',
      type: 'string',
      validation: Rule => Rule.required().error('Bitte einen Ordner-Namen eingeben.'),
      description: 'Anzeigename des Ordners, z.B. "50 Jahre Museum", "Pressemitteilungen 2024", "Untertitel-Dateien"'
    },
    {
      name: 'slug',
      title: 'URL-Adresse (Slug)',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96
      },
      validation: Rule => Rule.required().error('Bitte einen URL-Slug generieren (Schaltfläche "Generieren" klicken).'),
      description: 'Wird automatisch aus dem Ordner-Namen erzeugt. Klicken Sie auf "Generieren".'
    },
    {
      name: 'beschreibung',
      title: 'Beschreibung',
      type: 'text',
      rows: 2,
      description: 'Wofür ist dieser Ordner? Was wird hier abgelegt? (optional)'
    },
    {
      name: 'farbe',
      title: 'Ordner-Farbe',
      type: 'string',
      options: {
        list: [
          {title: '🔴 Rot', value: 'red'},
          {title: '🟡 Gelb', value: 'yellow'},
          {title: '🟢 Grün', value: 'green'},
          {title: '🔵 Blau', value: 'blue'},
          {title: '🟣 Lila', value: 'purple'},
          {title: '🟠 Orange', value: 'orange'},
          {title: '⚫ Grau', value: 'gray'}
        ]
      },
      initialValue: 'blue'
    },
    {
      name: 'reihenfolge',
      title: 'Reihenfolge',
      type: 'number',
      description: 'Sortierung in der Übersicht',
      initialValue: 0
    }
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'beschreibung',
      farbe: 'farbe'
    },
    prepare({title, subtitle, farbe}) {
      const colorEmoji = {
        red: '🔴',
        yellow: '🟡',
        green: '🟢',
        blue: '🔵',
        purple: '🟣',
        orange: '🟠',
        gray: '⚫'
      }[farbe] || '📁';

      return {
        title: `${colorEmoji} ${title}`,
        subtitle: subtitle || 'Dokument-Ordner'
      }
    }
  },
  orderings: [
    {
      title: 'Reihenfolge',
      name: 'reihenfolgeAsc',
      by: [{field: 'reihenfolge', direction: 'asc'}]
    },
    {
      title: 'Name',
      name: 'nameAsc',
      by: [{field: 'name', direction: 'asc'}]
    }
  ]
}
