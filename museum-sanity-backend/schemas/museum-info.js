// schemas/museum-info.js
export default {
  name: 'museumInfo',
  title: 'Museum Information',
  type: 'document',
  __experimental_actions: ['update', 'publish'], // Verhindert mehrere Dokumente
  fields: [
    {
      name: 'name',
      title: 'Museum Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'untertitel',
      title: 'Untertitel/Slogan',
      type: 'string'
    },
    {
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'willkommenstext',
      title: 'Willkommenstext',
      type: 'array',
      of: [{type: 'block'}],
      description: 'Text für die Startseite'
    },
    {
      name: 'kontakt',
      title: 'Kontaktinformationen',
      type: 'object',
      fields: [
        {
          name: 'adresse',
          title: 'Adresse',
          type: 'text',
          rows: 3
        },
        {
          name: 'telefon',
          title: 'Telefon',
          type: 'string'
        },
        {
          name: 'email',
          title: 'E-Mail',
          type: 'string'
        },
        {
          name: 'website',
          title: 'Website',
          type: 'url'
        }
      ]
    },
    {
      name: 'oeffnungszeiten',
      title: 'Öffnungszeiten',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {
            name: 'tag',
            title: 'Tag/Zeitraum',
            type: 'string',
            description: 'z.B. "Montag" oder "Mo-Fr"'
          },
          {
            name: 'zeit',
            title: 'Zeit',
            type: 'string',
            description: 'z.B. "10:00 - 17:00" oder "geschlossen"'
          }
        ]
      }]
    },
    {
      name: 'eintrittspreise',
      title: 'Eintrittspreise',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {
            name: 'kategorie',
            title: 'Kategorie',
            type: 'string',
            description: 'z.B. "Erwachsene", "Kinder", "Gruppen"'
          },
          {
            name: 'preis',
            title: 'Preis',
            type: 'string',
            description: 'z.B. "8,00 €" oder "Eintritt frei"'
          }
        ]
      }]
    },
    {
      name: 'social_media',
      title: 'Social Media',
      type: 'object',
      fields: [
        {
          name: 'facebook',
          title: 'Facebook URL',
          type: 'url'
        },
        {
          name: 'instagram',
          title: 'Instagram URL',
          type: 'url'
        },
        {
          name: 'twitter',
          title: 'Twitter/X URL',
          type: 'url'
        },
        {
          name: 'youtube',
          title: 'YouTube URL',
          type: 'url'
        }
      ]
    },
    {
      name: 'impressum',
      title: 'Impressum',
      type: 'array',
      of: [{type: 'block'}]
    },
    {
      name: 'datenschutz',
      title: 'Datenschutzerklärung',
      type: 'array',
      of: [{type: 'block'}]
    },
    {
      name: 'barrierefreiheit',
      title: 'Barrierefreiheit',
      type: 'object',
      fields: [
        {
          name: 'rollstuhlgerecht',
          title: 'Rollstuhlgerecht',
          type: 'boolean'
        },
        {
          name: 'induktionsschleife',
          title: 'Induktionsschleife',
          type: 'boolean'
        },
        {
          name: 'blindenhund',
          title: 'Blindenhunde erlaubt',
          type: 'boolean'
        },
        {
          name: 'beschreibung',
          title: 'Weitere Informationen',
          type: 'text'
        }
      ]
    },
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
            {title: 'Español', value: 'es'},
            {title: 'Nederlands', value: 'nl'},
            {title: 'Polski', value: 'pl'},
            {title: 'Český', value: 'cs'}
          ]
        }
      }],
      initialValue: ['de']
    }
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'untertitel',
      media: 'logo'
    }
  }
};