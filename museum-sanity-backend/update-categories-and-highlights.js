import { createClient } from '@sanity/client';

// Sanity Client
const client = createClient({
  projectId: '832k5je1',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN || 'sk1VTIq7XVReoW6NVa6L7fIJnUSRYC53fByocEKF2EIXTGHe69jf52yHs7QJwGMbH5dIDz67wEosW4RCq6pjw9qDD3IqJy69N6O7VqgMT8xUcEroHy4P5ORRSvbHuhOsHoUgo70xLnueRKGgKPzsV1nMPpz7DZ1D6CpSfDUSxIapVuDWRNDU'
});

// Reduced categories (max 10)
const newCategories = [
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
    titel: 'Ägyptologie',
    slug: 'aegyptologie',
    beschreibung: 'Objekte aus dem alten Ägypten',
    icon: '🏺',
    farbe: '#FFD700', // Gold
    reihenfolge: 4
  },
  {
    titel: 'Prähistorie',
    slug: 'praehistorie',
    beschreibung: 'Steinzeit und frühe menschliche Artefakte',
    icon: '🪨',
    farbe: '#8B7355', // Dark Khaki
    reihenfolge: 5
  },
  {
    titel: 'Naturgeschichte',
    slug: 'naturgeschichte',
    beschreibung: 'Fossilien und naturkundliche Objekte',
    icon: '🦕',
    farbe: '#228B22', // Forest Green
    reihenfolge: 6
  },
  {
    titel: 'Personen',
    slug: 'personen',
    beschreibung: 'Porträts und biografische Objekte',
    icon: '👤',
    farbe: '#4169E1', // Royal Blue
    reihenfolge: 7
  },
  {
    titel: 'Dokumente',
    slug: 'dokumente',
    beschreibung: 'Historische Dokumente und Schriftstücke',
    icon: '📜',
    farbe: '#696969', // Dim Gray
    reihenfolge: 8
  },
  {
    titel: 'Design',
    slug: 'design',
    beschreibung: 'Designobjekte und angewandte Kunst',
    icon: '💡',
    farbe: '#FF6347', // Tomato
    reihenfolge: 9
  },
  {
    titel: 'Expressionismus',
    slug: 'expressionismus',
    beschreibung: 'Expressionistische Kunst und Objekte',
    icon: '🎭',
    farbe: '#FF4500', // Orange Red
    reihenfolge: 10
  }
];

async function updateCategoriesAndHighlights() {
  try {
    console.log('🗑️ Deleting all existing categories...');
    
    // Get all existing categories
    const existingCategories = await client.fetch('*[_type == "kategorie"]');
    console.log(`Found ${existingCategories.length} existing categories`);
    
    // Delete all existing categories
    for (const category of existingCategories) {
      await client.delete(category._id);
      console.log(`  ✓ Deleted: ${category.titel}`);
    }
    
    console.log('\n✨ Creating new categories...');
    
    // Create new categories
    for (let i = 0; i < newCategories.length; i++) {
      const category = newCategories[i];
      console.log(`Creating category ${i + 1}/${newCategories.length}: ${category.titel}`);
      
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
    }
    
    console.log('\n🏷️ Updating highlights...');
    
    // Find and update "Römische Amphore" to be a highlight
    const amphore = await client.fetch('*[_type == "exponat" && titel match "Römische Amphore"]');
    if (amphore.length > 0) {
      await client.patch(amphore[0]._id).set({ ist_highlight: true }).commit();
      console.log('  ✓ Römische Amphore marked as highlight');
    } else {
      console.log('  ⚠️ Römische Amphore not found');
    }
    
    // Also mark some other items as highlights for testing
    const highlights = await client.fetch('*[_type == "exponat" && ist_highlight == true]');
    console.log(`  📊 Total highlights: ${highlights.length}`);
    
    console.log('\n✅ Categories and highlights updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating categories and highlights:', error);
  }
}

// Run the script
updateCategoriesAndHighlights().catch(console.error);

