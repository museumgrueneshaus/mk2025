import { createClient } from '@sanity/client';

// Sanity Client
const client = createClient({
  projectId: '832k5je1',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN || 'sk1VTIq7XVReoW6NVa6L7fIJnUSRYC53fByocEKF2EIXTGHe69jf52yHs7QJwGMbH5dIDz67wEosW4RCq6pjw9qDD3IqJy69N6O7VqgMT8xUcEroHy4P5ORRSvbHuhOsHoUgo70xLnueRKGgKPzsV1nMPpz7DZ1D6CpSfDUSxIapVuDWRNDU'
});

// Test categories
const testCategories = [
  {
    titel: 'Antike',
    slug: 'antike',
    beschreibung: 'Objekte aus der griechischen und römischen Antike',
    icon: '🏛️',
    farbe: '#8B4513', // Saddle Brown
    reihenfolge: 1
  },
  {
    titel: 'Mittelalter',
    slug: 'mittelalter',
    beschreibung: 'Artefakte aus dem europäischen Mittelalter',
    icon: '⚔️',
    farbe: '#2F4F4F', // Dark Slate Gray
    reihenfolge: 2
  },
  {
    titel: 'Renaissance',
    slug: 'renaissance',
    beschreibung: 'Kunst und Objekte der Renaissance-Zeit',
    icon: '🎨',
    farbe: '#DAA520', // Goldenrod
    reihenfolge: 3
  },
  {
    titel: 'Barock',
    slug: 'barock',
    beschreibung: 'Prunkvolle Objekte aus der Barockzeit',
    icon: '⏰',
    farbe: '#8B008B', // Dark Magenta
    reihenfolge: 4
  },
  {
    titel: 'Naturgeschichte',
    slug: 'naturgeschichte',
    beschreibung: 'Fossilien und naturkundliche Objekte',
    icon: '🦕',
    farbe: '#228B22', // Forest Green
    reihenfolge: 5
  },
  {
    titel: 'Ägyptologie',
    slug: 'aegyptologie',
    beschreibung: 'Objekte aus dem alten Ägypten',
    icon: '🏺',
    farbe: '#FFD700', // Gold
    reihenfolge: 6
  },
  {
    titel: 'Industriegeschichte',
    slug: 'industriegeschichte',
    beschreibung: 'Technische Objekte der Industrialisierung',
    icon: '⚙️',
    farbe: '#696969', // Dim Gray
    reihenfolge: 7
  },
  {
    titel: 'Design',
    slug: 'design',
    beschreibung: 'Designobjekte und angewandte Kunst',
    icon: '💡',
    farbe: '#FF6347', // Tomato
    reihenfolge: 8
  },
  {
    titel: 'Nordische Kultur',
    slug: 'nordische-kultur',
    beschreibung: 'Wikinger und nordische Artefakte',
    icon: '⚡',
    farbe: '#4169E1', // Royal Blue
    reihenfolge: 9
  },
  {
    titel: 'Asiatische Kunst',
    slug: 'asiatische-kunst',
    beschreibung: 'Kunst und Objekte aus Asien',
    icon: '🐉',
    farbe: '#DC143C', // Crimson
    reihenfolge: 10
  },
  {
    titel: 'Gotik',
    slug: 'gotik',
    beschreibung: 'Kunst und Architektur der Gotik',
    icon: '⛪',
    farbe: '#4B0082', // Indigo
    reihenfolge: 11
  },
  {
    titel: 'Bauhaus',
    slug: 'bauhaus',
    beschreibung: 'Funktionalistisches Design der Bauhaus-Schule',
    icon: '🔲',
    farbe: '#000000', // Black
    reihenfolge: 12
  },
  {
    titel: 'Prähistorie',
    slug: 'praehistorie',
    beschreibung: 'Steinzeit und frühe menschliche Artefakte',
    icon: '🪨',
    farbe: '#8B7355', // Dark Khaki
    reihenfolge: 13
  },
  {
    titel: 'Musikinstrumente',
    slug: 'musikinstrumente',
    beschreibung: 'Historische Musikinstrumente',
    icon: '🎵',
    farbe: '#9370DB', // Medium Purple
    reihenfolge: 14
  },
  {
    titel: 'Jugendstil',
    slug: 'jugendstil',
    beschreibung: 'Art Nouveau und Jugendstil-Objekte',
    icon: '🌸',
    farbe: '#FF69B4', // Hot Pink
    reihenfolge: 15
  },
  {
    titel: 'Weltraum',
    slug: 'weltraum',
    beschreibung: 'Meteoriten und Weltraumobjekte',
    icon: '☄️',
    farbe: '#191970', // Midnight Blue
    reihenfolge: 16
  },
  {
    titel: 'Biedermeier',
    slug: 'biedermeier',
    beschreibung: 'Möbel und Objekte der Biedermeier-Zeit',
    icon: '🪑',
    farbe: '#8B4513', // Saddle Brown
    reihenfolge: 17
  },
  {
    titel: 'Keltische Kultur',
    slug: 'keltische-kultur',
    beschreibung: 'Artefakte der keltischen Kultur',
    icon: '🌿',
    farbe: '#32CD32', // Lime Green
    reihenfolge: 18
  },
  {
    titel: 'Expressionismus',
    slug: 'expressionismus',
    beschreibung: 'Expressionistische Kunst und Objekte',
    icon: '🎭',
    farbe: '#FF4500', // Orange Red
    reihenfolge: 19
  },
  {
    titel: 'Zeitgenössische Kunst',
    slug: 'zeitgenossische-kunst',
    beschreibung: 'Moderne und zeitgenössische Kunst',
    icon: '🎪',
    farbe: '#FF1493', // Deep Pink
    reihenfolge: 20
  }
];

async function createTestCategories() {
  console.log('Creating test categories...');
  
  for (let i = 0; i < testCategories.length; i++) {
    const category = testCategories[i];
    console.log(`Creating category ${i + 1}/${testCategories.length}: ${category.titel}`);
    
    try {
      const categoryDoc = {
        _type: 'kategorie',
        titel: category.titel,
        slug: {
          _type: 'slug',
          current: category.slug
        },
        beschreibung: category.beschreibung,
        icon: category.icon,
        farbe: category.farbe,
        reihenfolge: category.reihenfolge
      };
      
      const result = await client.create(categoryDoc);
      console.log(`  ✓ Category created: ${result._id}`);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      console.error(`Error creating category ${category.titel}:`, error);
    }
  }
  
  console.log('Test categories creation completed!');
}

// Run the script
createTestCategories().catch(console.error);
