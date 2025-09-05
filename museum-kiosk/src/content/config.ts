import { defineCollection, z } from 'astro:content';

// Exhibit Schema
const exhibitsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // Pflichtfelder
    title: z.string(),
    artist: z.string(),
    year: z.number(),
    category: z.enum(['painting', 'sculpture', 'photography', 'installation', 'drawing', 'mixed']),
    
    // Bilder
    image: z.string(),
    thumbnail: z.string().optional(),
    
    // Details
    technique: z.string().optional(),
    dimensions: z.string().optional(),
    location: z.string().optional(),
    inventory: z.string().optional(),
    
    // Metadaten
    tags: z.array(z.string()).optional(),
    relatedPersons: z.array(z.string()).optional(),
    relatedDocuments: z.array(z.string()).optional(),
    
    // Mehrsprachigkeit
    language: z.enum(['de', 'en', 'it']).default('de'),
    translations: z.object({
      en: z.object({
        title: z.string(),
        description: z.string()
      }).optional(),
      it: z.object({
        title: z.string(),
        description: z.string()
      }).optional()
    }).optional(),
    
    // Status
    published: z.boolean().default(true),
    featured: z.boolean().default(false),
    lastUpdated: z.date().optional()
  })
});

// Person Schema
const personsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // Basis
    name: z.string(),
    lifespan: z.string(),
    nationality: z.string(),
    profession: z.string(),
    
    // Bilder
    portrait: z.string().optional(),
    thumbnail: z.string().optional(),
    
    // Details
    birthplace: z.string().optional(),
    deathplace: z.string().optional(),
    education: z.array(z.string()).optional(),
    achievements: z.array(z.string()).optional(),
    exhibitions: z.array(z.object({
      year: z.number(),
      title: z.string(),
      location: z.string()
    })).optional(),
    
    // Beziehungen
    relatedExhibits: z.array(z.string()).optional(),
    relatedPersons: z.array(z.string()).optional(),
    
    // Kategorien
    category: z.enum(['artist', 'curator', 'collector', 'patron', 'researcher']),
    tags: z.array(z.string()).optional(),
    
    // Status
    published: z.boolean().default(true),
    featured: z.boolean().default(false)
  })
});

// Event Schema
const eventsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // Pflichtfelder
    title: z.string(),
    date: z.date(),
    time: z.string(),
    
    // Details
    duration: z.number().optional(), // in Minuten
    location: z.string().default('Museum Grünes Haus'),
    category: z.enum(['führung', 'workshop', 'konzert', 'vortrag', 'special']),
    targetGroup: z.enum(['kinder', 'familien', 'erwachsene', 'schulklassen', 'alle']).optional(),
    
    // Bilder & Medien
    image: z.string().optional(),
    documents: z.array(z.string()).optional(),
    
    // Anmeldung
    registration: z.object({
      required: z.boolean(),
      maxSpots: z.number().optional(),
      spotsLeft: z.number().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      link: z.string().url().optional()
    }).optional(),
    
    // Wiederholung
    recurring: z.object({
      enabled: z.boolean(),
      pattern: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'yearly']),
      endDate: z.date().optional(),
      exceptions: z.array(z.date()).optional()
    }).optional(),
    
    // Preise
    pricing: z.object({
      regular: z.number(),
      reduced: z.number().optional(),
      children: z.number().optional(),
      groups: z.number().optional(),
      free: z.boolean().default(false)
    }).optional(),
    
    // Mehrsprachigkeit
    language: z.enum(['de', 'en', 'it']).default('de'),
    translations: z.object({
      en: z.object({
        title: z.string(),
        description: z.string()
      }).optional(),
      it: z.object({
        title: z.string(),
        description: z.string()
      }).optional()
    }).optional(),
    
    // Meta
    tags: z.array(z.string()).optional(),
    source: z.enum(['manual', 'typo3', 'import']).default('manual'),
    published: z.boolean().default(true),
    cancelled: z.boolean().default(false)
  })
});

// Document Schema
const documentsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // Basis
    title: z.string(),
    author: z.string(),
    year: z.number(),
    
    // Dokumenttyp
    documentType: z.enum(['research', 'catalog', 'guide', 'restoration', 'publication']),
    category: z.string(),
    
    // Dateien
    pdfPath: z.string().optional(),
    thumbnail: z.string().optional(),
    
    // Details
    pages: z.number().optional(),
    language: z.enum(['de', 'en', 'it', 'multi']),
    isbn: z.string().optional(),
    doi: z.string().optional(),
    publisher: z.string().optional(),
    
    // Beziehungen
    relatedExhibits: z.array(z.string()).optional(),
    relatedPersons: z.array(z.string()).optional(),
    relatedEvents: z.array(z.string()).optional(),
    
    // Meta
    tags: z.array(z.string()).optional(),
    published: z.boolean().default(true),
    downloadable: z.boolean().default(false)
  })
});

// Tour Schema (für Audio-Guides)
const toursCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // Basis
    title: z.string(),
    duration: z.number(), // Minuten
    difficulty: z.enum(['easy', 'medium', 'advanced']),
    targetGroup: z.enum(['kinder', 'familien', 'erwachsene', 'experten']),
    
    // Stationen
    stops: z.array(z.object({
      id: z.string(),
      title: z.string(),
      location: z.string(),
      audioFile: z.string().optional(),
      duration: z.number(),
      exhibitId: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional()
    })),
    
    // Medien
    mapImage: z.string().optional(),
    thumbnail: z.string().optional(),
    
    // Sprachen
    availableLanguages: z.array(z.enum(['de', 'en', 'it'])),
    
    // Meta
    tags: z.array(z.string()).optional(),
    published: z.boolean().default(true),
    featured: z.boolean().default(false)
  })
});

// Kiosk Configuration Schema
const kiosksCollection = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    name: z.string(),
    location: z.string(),
    template: z.enum([
      'slideshow-auto',
      'image-gallery',
      'pdf-viewer',
      'video-player',
      'knowledge-base',
      'knowledge-base-extended',
      'external-url',
      'mixed-carousel',
      'iframe-embed',
      'event-calendar'
    ]),
    
    // Template-spezifische Konfiguration
    content: z.any(), // Flexibel für verschiedene Templates
    
    // Einstellungen
    settings: z.object({
      autoplay: z.boolean().optional(),
      duration: z.number().optional(),
      transition: z.string().optional(),
      language: z.enum(['de', 'en', 'it']).optional()
    }).optional(),
    
    // Idle-Verhalten
    idle: z.object({
      showInstructions: z.number().default(30),
      backToStart: z.number().default(120)
    }).optional(),
    
    // Features
    features: z.object({
      search: z.boolean().optional(),
      filter: z.boolean().optional(),
      zoom: z.boolean().optional(),
      navigation: z.boolean().optional(),
      fullscreen: z.boolean().optional()
    }).optional(),
    
    // Meta
    active: z.boolean().default(true),
    lastUpdated: z.date().optional()
  })
});

// Export Collections
export const collections = {
  'exhibits': exhibitsCollection,
  'persons': personsCollection,
  'events': eventsCollection,
  'documents': documentsCollection,
  'tours': toursCollection,
  'kiosks': kiosksCollection
};