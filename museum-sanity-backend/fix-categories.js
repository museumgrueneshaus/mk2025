import { createClient } from '@sanity/client';

const client = createClient({
  projectId: '832k5je1',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN || 'sk1VTIq7XVReoW6NVa6L7fIJnUSRYC53fByocEKF2EIXTGHe69jf52yHs7QJwGMbH5dIDz67wEosW4RCq6pjw9qDD3IqJy69N6O7VqgMT8xUcEroHy4P5ORRSvbHuhOsHoUgo70xLnueRKGgKPzsV1nMPpz7DZ1D6CpSfDUSxIapVuDWRNDU'
});

async function fixCategories() {
  console.log('🔍 Getting all categories...');
  const categories = await client.fetch(`*[_type == "kategorie"] | order(titel asc)`);
  console.log('Available categories:', categories.map(c => c.titel));

  console.log('🔍 Getting all exhibits...');
  const exhibits = await client.fetch(`*[_type == "exponat"] | order(titel asc)`);
  console.log(`Found ${exhibits.length} exhibits`);

  // Create a mapping of exhibit titles to appropriate categories
  const categoryMapping = {
    // Antike
    'Römische Amphore': 'Antike',
    'Ägyptische Mumie': 'Antike',
    'Keltischer Torques': 'Antike',
    
    // Mittelalter
    'Mittelalterliches Schwert': 'Mittelalter',
    'Gotische Skulptur': 'Mittelalter',
    'Wikinger-Schmuck': 'Mittelalter',
    
    // Barock
    'Barocke Orgelpfeife': 'Barock',
    'Barocke Uhr': 'Barock',
    
    // Klassizismus
    'Biedermeier-Sekretär': 'Klassizismus',
    'Renaissance-Gemälde': 'Klassizismus',
    
    // Salzhandel
    'Industrielle Dampfmaschine': 'Salzhandel',
    
    // Personen
    'Zeiller': 'Personen',
    
    // Dokumente
    '3344': 'Dokumente',
    
    // Musik
    'Barocke Orgelpfeife': 'Musik', // This will override the Barock assignment
    
    // Astronomie
    'Meteorit': 'Astronomie',
    
    // Kunst
    'Expressionistisches Gemälde': 'Kunst',
    'Moderne Skulptur': 'Kunst',
    'Bauhaus Lampe': 'Kunst',
    'Jugendstil-Brosche': 'Kunst',
    'Chinesische Porzellanvase': 'Kunst',
    'Art Deco Vase': 'Kunst',
    'Tongefäße': 'Kunst',
    'Fossil eines Ammoniten': 'Kunst',
    'Prähistorischer Faustkeil': 'Kunst'
  };

  for (const exhibit of exhibits) {
    const categoryName = categoryMapping[exhibit.titel];
    if (categoryName) {
      const category = categories.find(c => c.titel === categoryName);
      if (category) {
        console.log(`📝 Assigning "${exhibit.titel}" to category "${categoryName}"`);
        await client
          .patch(exhibit._id)
          .set({
            'organisation.kategorie': {
              _type: 'reference',
              _ref: category._id
            }
          })
          .commit();
      } else {
        console.log(`❌ Category "${categoryName}" not found for "${exhibit.titel}"`);
      }
    } else {
      console.log(`⚠️  No category mapping found for "${exhibit.titel}"`);
    }
  }

  console.log('✅ Category assignment completed!');
}

fixCategories().catch(console.error);

