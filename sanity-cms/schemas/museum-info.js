// schemas/museum-info.js
export default {
  name: 'museumInfo',
  title: 'Museum Info',
  type: 'document',
  __experimental_actions: ['update', 'publish'], // Verhindert mehrere Dokumente

  // ── Tabs ──────────────────────────────────────────────────────────────────
  groups: [
    { name: 'allgemein',  title: 'Allgemein',                    default: true },
    { name: 'kontakt',    title: 'Kontakt & Öffnungszeiten' },
    { name: 'online',     title: 'Online & Social Media' },
    { name: 'rechtlich',  title: 'Rechtliches' },
  ],

  fields: [

    // ── TAB: ALLGEMEIN ─────────────────────────────────────────────────────
    {
      name: 'name',
      title: 'Name des Museums',
      type: 'string',
      group: 'allgemein',
      validation: Rule => Rule.required().error('Der Name des Museums ist erforderlich.'),
      description: 'Offizieller Name des Museums – erscheint auf der Website und den Kiosk-Bildschirmen'
    },
    {
      name: 'untertitel',
      title: 'Untertitel / Slogan',
      type: 'string',
      group: 'allgemein',
      description: 'Kurzer Slogan oder Untertitel, z.B. "Geschichte erleben seit 1975"'
    },
    {
      name: 'logo',
      title: 'Logo',
      type: 'image',
      group: 'allgemein',
      options: {
        hotspot: true,
        metadata: ['blurhash', 'lqip']
      },
      description: 'Logo des Museums. Empfehlung: transparenter Hintergrund (PNG), mindestens 400×200 Pixel.'
    },
    {
      name: 'willkommenstext',
      title: 'Willkommenstext',
      type: 'array',
      group: 'allgemein',
      of: [{type: 'block'}],
      description: 'Wird auf der Startseite der Website angezeigt. Kann mit Überschriften, Aufzählungen und Links formatiert werden.'
    },
    {
      name: 'sprachen',
      title: 'Verfügbare Sprachen',
      type: 'array',
      group: 'allgemein',
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
      initialValue: ['de'],
      description: 'In welchen Sprachen ist das Museum verfügbar? Bestimmt die Sprachauswahl auf Kiosk und Website.'
    },
    {
      name: 'barrierefreiheit',
      title: 'Barrierefreiheit',
      type: 'object',
      group: 'allgemein',
      description: 'Informationen zur Zugänglichkeit des Museums für Menschen mit Behinderungen',
      fields: [
        {
          name: 'rollstuhlgerecht',
          title: 'Rollstuhlgerecht',
          type: 'boolean',
          description: 'Alle Ausstellungsbereiche sind mit dem Rollstuhl zugänglich',
          initialValue: false
        },
        {
          name: 'induktionsschleife',
          title: 'Induktionsschleife vorhanden',
          type: 'boolean',
          description: 'Für Besucher mit Hörgeräten (T-Spule)',
          initialValue: false
        },
        {
          name: 'blindenhund',
          title: 'Blindenhunde erlaubt',
          type: 'boolean',
          initialValue: true
        },
        {
          name: 'beschreibung',
          title: 'Weitere Informationen',
          type: 'text',
          rows: 3,
          description: 'Weitere Details zur Barrierefreiheit, z.B. "Aufzug vorhanden", "Taktile Führungen auf Anfrage"'
        }
      ]
    },

    // ── TAB: KONTAKT & ÖFFNUNGSZEITEN ─────────────────────────────────────
    {
      name: 'kontakt',
      title: 'Kontaktinformationen',
      type: 'object',
      group: 'kontakt',
      description: 'Offizielle Kontaktdaten des Museums',
      fields: [
        {
          name: 'adresse',
          title: 'Adresse',
          type: 'text',
          rows: 3,
          description: 'Vollständige Postanschrift, z.B.:\nMuseumstraße 1\n6600 Reutte\nÖsterreich'
        },
        {
          name: 'telefon',
          title: 'Telefon',
          type: 'string',
          description: 'z.B. +43 5672 12345 oder 05672 12345-0'
        },
        {
          name: 'email',
          title: 'E-Mail',
          type: 'string',
          description: 'Allgemeine Kontakt-E-Mail Adresse'
        },
        {
          name: 'website',
          title: 'Website',
          type: 'url',
          description: 'Offizielle Website-Adresse (mit https://)'
        }
      ]
    },
    {
      name: 'oeffnungszeiten',
      title: 'Öffnungszeiten',
      type: 'array',
      group: 'kontakt',
      of: [{
        type: 'object',
        preview: {
          select: { tag: 'tag', zeit: 'zeit' },
          prepare({tag, zeit}) {
            return { title: tag || '(Kein Tag)', subtitle: zeit || '(Keine Zeit)' }
          }
        },
        fields: [
          {
            name: 'tag',
            title: 'Tag / Zeitraum',
            type: 'string',
            validation: Rule => Rule.required().error('Bitte den Tag oder Zeitraum eintragen.'),
            description: 'z.B. "Montag", "Mo–Fr" oder "Samstag & Sonntag"'
          },
          {
            name: 'zeit',
            title: 'Uhrzeit',
            type: 'string',
            validation: Rule => Rule.required().error('Bitte die Öffnungszeit eintragen.'),
            description: 'z.B. "10:00–17:00 Uhr" oder "Geschlossen"'
          }
        ]
      }],
      description: 'Bitte für jeden Tag oder Zeitraum einen eigenen Eintrag anlegen.'
    },
    {
      name: 'eintrittspreise',
      title: 'Eintrittspreise',
      type: 'array',
      group: 'kontakt',
      of: [{
        type: 'object',
        preview: {
          select: { kategorie: 'kategorie', preis: 'preis' },
          prepare({kategorie, preis}) {
            return { title: kategorie || '(Keine Kategorie)', subtitle: preis || '(Kein Preis)' }
          }
        },
        fields: [
          {
            name: 'kategorie',
            title: 'Kategorie',
            type: 'string',
            validation: Rule => Rule.required().error('Bitte eine Kategorie eintragen.'),
            description: 'z.B. "Erwachsene", "Kinder (6–14 Jahre)", "Gruppen ab 10 Personen"'
          },
          {
            name: 'preis',
            title: 'Preis',
            type: 'string',
            validation: Rule => Rule.required().error('Bitte den Preis eintragen.'),
            description: 'z.B. "8,00 €", "4,00 €" oder "Eintritt frei"'
          }
        ]
      }],
      description: 'Für jede Besucherkategorie einen eigenen Eintrag anlegen.'
    },

    // ── TAB: ONLINE & SOCIAL MEDIA ────────────────────────────────────────
    {
      name: 'social_media',
      title: 'Social Media',
      type: 'object',
      group: 'online',
      description: 'Links zu den Social-Media-Profilen des Museums. Leer lassen wenn kein Profil vorhanden.',
      fields: [
        {
          name: 'facebook',
          title: 'Facebook',
          type: 'url',
          description: 'z.B. https://facebook.com/MuseumName'
        },
        {
          name: 'instagram',
          title: 'Instagram',
          type: 'url',
          description: 'z.B. https://instagram.com/museumname'
        },
        {
          name: 'twitter',
          title: 'Twitter / X',
          type: 'url',
          description: 'z.B. https://x.com/museumname'
        },
        {
          name: 'youtube',
          title: 'YouTube',
          type: 'url',
          description: 'z.B. https://youtube.com/@museumname'
        }
      ]
    },

    // ── TAB: RECHTLICHES ──────────────────────────────────────────────────
    {
      name: 'impressum',
      title: 'Impressum',
      type: 'array',
      group: 'rechtlich',
      of: [{type: 'block'}],
      description: 'Vollständiges Impressum gemäß §5 E-Commerce-Gesetz. Wird auf der Website im Bereich "Impressum" angezeigt.'
    },
    {
      name: 'datenschutz',
      title: 'Datenschutzerklärung',
      type: 'array',
      group: 'rechtlich',
      of: [{type: 'block'}],
      description: 'Datenschutzerklärung gemäß DSGVO. Wird auf der Website im Bereich "Datenschutz" angezeigt.'
    },

  ],

  preview: {
    select: {
      title: 'name',
      subtitle: 'untertitel',
      media: 'logo'
    },
    prepare({title, subtitle, media}) {
      return {
        title: title || 'Museum Info',
        subtitle: subtitle || 'Allgemeine Museumseinstellungen',
        media
      }
    }
  }
};
