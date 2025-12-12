import { createClient } from '@sanity/client';

// Sanity Client
const client = createClient({
  projectId: '832k5je1',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN || 'sk1VTIq7XVReoW6NVa6L7fIJnUSRYC53fByocEKF2EIXTGHe69jf52yHs7QJwGMbH5dIDz67wEosW4RCq6pjw9qDD3IqJy69N6O7VqgMT8xUcEroHy4P5ORRSvbHuhOsHoUgo70xLnueRKGgKPzsV1nMPpz7DZ1D6CpSfDUSxIapVuDWRNDU'
});

// Reduced categories (max 10) - based on Museum im Grünen Haus content
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
    titel: 'Barock',
    slug: 'barock',
    beschreibung: 'Prunkvolle Objekte aus der Barockzeit',
    icon: '⏰',
    farbe: '#8B008B', // Dark Magenta
    reihenfolge: 3
  },
  {
    titel: 'Klassizismus',
    slug: 'klassizismus',
    beschreibung: 'Kunst und Objekte des Klassizismus',
    icon: '🏛️',
    farbe: '#DAA520', // Goldenrod
    reihenfolge: 4
  },
  {
    titel: 'Salzhandel',
    slug: 'salzhandel',
    beschreibung: 'Objekte aus der Blütezeit des Salzhandels in Reutte',
    icon: '🧂',
    farbe: '#FFD700', // Gold
    reihenfolge: 5
  },
  {
    titel: 'Personen',
    slug: 'personen',
    beschreibung: 'Porträts und biografische Objekte',
    icon: '👤',
    farbe: '#4169E1', // Royal Blue
    reihenfolge: 6
  },
  {
    titel: 'Dokumente',
    slug: 'dokumente',
    beschreibung: 'Historische Dokumente und Schriftstücke',
    icon: '📜',
    farbe: '#696969', // Dim Gray
    reihenfolge: 7
  },
  {
    titel: 'Musik',
    slug: 'musik',
    beschreibung: 'Musikinstrumente und Musikgeschichte',
    icon: '🎵',
    farbe: '#9370DB', // Medium Purple
    reihenfolge: 8
  },
  {
    titel: 'Astronomie',
    slug: 'astronomie',
    beschreibung: 'Astronomische Instrumente und Bücher',
    icon: '🔭',
    farbe: '#191970', // Midnight Blue
    reihenfolge: 9
  },
  {
    titel: 'Kunst',
    slug: 'kunst',
    beschreibung: 'Gemälde und Kunstwerke',
    icon: '🎨',
    farbe: '#FF6347', // Tomato
    reihenfolge: 10
  }
];

async function updateCategoriesSafe() {
  try {
    console.log('🔍 Getting existing categories and their references...');
    
    // Get all existing categories
    const existingCategories = await client.fetch('*[_type == "kategorie"]');
    console.log(`Found ${existingCategories.length} existing categories`);
    
    // Get all exhibits that reference categories
    const exhibitsWithCategories = await client.fetch('*[_type == "exponat" && defined(kategorie)]');
    console.log(`Found ${exhibitsWithCategories.length} exhibits with categories`);
    
    console.log('\n🔄 Removing category references from exhibits...');
    
    // Remove category references from all exhibits
    for (const exhibit of exhibitsWithCategories) {
      await client.patch(exhibit._id).unset(['kategorie']).commit();
      console.log(`  ✓ Removed category from: ${exhibit.titel}`);
    }
    
    console.log('\n🗑️ Deleting all existing categories...');
    
    // Now delete all existing categories
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
    const amphore = await client.fetch('*[_type == "exponat" && titel match "*Amphore*"]');
    if (amphore.length > 0) {
      await client.patch(amphore[0]._id).set({ ist_highlight: true }).commit();
      console.log(`  ✓ ${amphore[0].titel} marked as highlight`);
    } else {
      console.log('  ⚠️ No amphore found, marking first exhibit as highlight');
      const firstExhibit = await client.fetch('*[_type == "exponat"][0]');
      if (firstExhibit) {
        await client.patch(firstExhibit._id).set({ ist_highlight: true }).commit();
        console.log(`  ✓ ${firstExhibit.titel} marked as highlight`);
      }
    }
    
    // Count total highlights
    const highlights = await client.fetch('*[_type == "exponat" && ist_highlight == true]');
    console.log(`  📊 Total highlights: ${highlights.length}`);
    
    console.log('\n✅ Categories and highlights updated successfully!');
    console.log('\n📋 New categories created:');
    newCategories.forEach((cat, i) => {
      console.log(`  ${i + 1}. ${cat.titel} (${cat.icon})`);
    });
    
  } catch (error) {
    console.error('❌ Error updating categories and highlights:', error);
  }
}

// Run the script
updateCategoriesSafe().catch(console.error);

