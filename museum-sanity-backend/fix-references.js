import { createClient } from '@sanity/client';

// Sanity Client
const client = createClient({
  projectId: '832k5je1',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN || 'sk1VTIq7XVReoW6NVa6L7fIJnUSRYC53fByocEKF2EIXTGHe69jf52yHs7QJwGMbH5dIDz67wEosW4RCq6pjw9qDD3IqJy69N6O7VqgMT8xUcEroHy4P5ORRSvbHuhOsHoUgo70xLnueRKGgKPzsV1nMPpz7DZ1D6CpSfDUSxIapVuDWRNDU'
});

async function fixReferences() {
  try {
    console.log('🔍 Finding all references to categories...');
    
    // Find the specific document that's causing the issue
    const problemDoc = await client.fetch('*[_id == "ez3GCFW5nbkfogTJJkArpS"]');
    console.log('Problem document:', problemDoc);
    
    // Find all documents that reference categories
    const allDocs = await client.fetch('*[references(*[_type == "kategorie"]._id)]');
    console.log(`Found ${allDocs.length} documents that reference categories`);
    
    for (const doc of allDocs) {
      console.log(`\n📄 Document: ${doc._type} - ${doc._id}`);
      console.log('Content:', JSON.stringify(doc, null, 2));
      
      // Remove any category references
      const patches = [];
      if (doc.kategorie) {
        patches.push(['kategorie']);
      }
      
      // Check for category references in arrays or other fields
      Object.keys(doc).forEach(key => {
        if (key !== '_id' && key !== '_type' && key !== '_rev' && key !== '_createdAt' && key !== '_updatedAt') {
          const value = doc[key];
          if (Array.isArray(value)) {
            // Check if array contains category references
            const hasCategoryRefs = value.some(item => 
              typeof item === 'object' && item._ref && item._type === 'reference'
            );
            if (hasCategoryRefs) {
              patches.push([key]);
            }
          }
        }
      });
      
      if (patches.length > 0) {
        console.log(`  🔧 Removing category references: ${patches.map(p => p[0]).join(', ')}`);
        await client.patch(doc._id).unset(patches).commit();
        console.log(`  ✓ Updated document: ${doc._id}`);
      }
    }
    
    console.log('\n✅ All references removed!');
    
  } catch (error) {
    console.error('❌ Error fixing references:', error);
  }
}

// Run the script
fixReferences().catch(console.error);

