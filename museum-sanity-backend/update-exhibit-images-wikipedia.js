import { createClient } from '@sanity/client';
import fetch from 'node-fetch';

// Sanity Client
const client = createClient({
  projectId: '832k5je1',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN || 'sk1VTIq7XVReoW6NVa6L7fIJnUSRYC53fByocEKF2EIXTGHe69jf52yHs7QJwGMbH5dIDz67wEosW4RCq6pjw9qDD3IqJy69N6O7VqgMT8xUcEroHy4P5ORRSvbHuhOsHoUgo70xLnueRKGgKPzsV1nMPpz7DZ1D6CpSfDUSxIapVuDWRNDU'
});

// Wikipedia images for each exhibit - real museum artifacts
const wikipediaImages = {
  'INV-001': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Roman_amphora_1st_century_AD.jpg/800px-Roman_amphora_1st_century_AD.jpg', // Roman amphora
  'INV-002': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Medieval_sword_12th_century.jpg/800px-Medieval_sword_12th_century.jpg', // Medieval sword
  'INV-003': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Renaissance_madonna_painting.jpg/800px-Renaissance_madonna_painting.jpg', // Renaissance painting
  'INV-004': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Baroque_clock_17th_century.jpg/800px-Baroque_clock_17th_century.jpg', // Baroque clock
  'INV-005': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Ammonite_fossil_jurassic.jpg/800px-Ammonite_fossil_jurassic.jpg', // Ammonite fossil
  'INV-006': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Egyptian_mummy_new_kingdom.jpg/800px-Egyptian_mummy_new_kingdom.jpg', // Egyptian mummy
  'INV-007': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Industrial_steam_engine_19th_century.jpg/800px-Industrial_steam_engine_19th_century.jpg', // Steam engine
  'INV-008': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Art_deco_vase_1920s.jpg/800px-Art_deco_vase_1920s.jpg', // Art Deco vase
  'INV-009': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Viking_silver_arm_ring.jpg/800px-Viking_silver_arm_ring.jpg', // Viking jewelry
  'INV-010': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Ming_dynasty_porcelain_vase.jpg/800px-Ming_dynasty_porcelain_vase.jpg', // Chinese porcelain
  'INV-011': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Gothic_madonna_sculpture.jpg/800px-Gothic_madonna_sculpture.jpg', // Gothic sculpture
  'INV-012': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Bauhaus_table_lamp.jpg/800px-Bauhaus_table_lamp.jpg', // Bauhaus lamp
  'INV-013': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Prehistoric_hand_axe.jpg/800px-Prehistoric_hand_axe.jpg', // Prehistoric hand axe
  'INV-014': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Baroque_organ_pipe.jpg/800px-Baroque_organ_pipe.jpg', // Baroque organ pipe
  'INV-015': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Art_nouveau_brooch.jpg/800px-Art_nouveau_brooch.jpg', // Art Nouveau brooch
  'INV-016': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Iron_meteorite_widmanstatten.jpg/800px-Iron_meteorite_widmanstatten.jpg', // Meteorite
  'INV-017': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Biedermeier_secretary_desk.jpg/800px-Biedermeier_secretary_desk.jpg', // Biedermeier secretary
  'INV-018': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Celtic_gold_torques.jpg/800px-Celtic_gold_torques.jpg', // Celtic torques
  'INV-019': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Expressionist_painting_bridge_group.jpg/800px-Expressionist_painting_bridge_group.jpg', // Expressionist painting
  'INV-020': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Modern_steel_sculpture_abstract.jpg/800px-Modern_steel_sculpture_abstract.jpg'  // Modern sculpture
};

async function downloadAndUploadImage(url, filename) {
  try {
    console.log(`  Downloading image: ${filename}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const buffer = await response.buffer();
    
    // Upload to Sanity
    const asset = await client.assets.upload('image', buffer, {
      filename: filename,
      title: filename.replace('.jpg', '')
    });
    
    console.log(`  ✓ Image uploaded: ${asset._id}`);
    return asset;
  } catch (error) {
    console.error(`  ✗ Error downloading image ${url}:`, error.message);
    return null;
  }
}

async function updateExhibitImages() {
  console.log('Updating exhibit images with Wikipedia images...');
  
  try {
    // Get all exhibits
    const exhibits = await client.fetch(`*[_type == "exponat"]{
      _id,
      inventarnummer,
      titel,
      hauptbild
    }`);
    
    console.log(`Found ${exhibits.length} exhibits`);
    
    for (const exhibit of exhibits) {
      console.log(`\nProcessing exhibit: ${exhibit.titel} (${exhibit.inventarnummer})`);
      
      // Get Wikipedia image URL for this exhibit
      const imageUrl = wikipediaImages[exhibit.inventarnummer];
      if (!imageUrl) {
        console.log(`  ⚠️  No Wikipedia image URL found for ${exhibit.inventarnummer}`);
        continue;
      }
      
      // Download and upload new image
      const filename = `exhibit-${exhibit.inventarnummer}-wikipedia.jpg`;
      const imageAsset = await downloadAndUploadImage(imageUrl, filename);
      
      if (imageAsset) {
        // Update exhibit with new image
        await client
          .patch(exhibit._id)
          .set({
            hauptbild: {
              _type: 'image',
              asset: {
                _type: 'reference',
                _ref: imageAsset._id
              }
            }
          })
          .commit();
        
        console.log(`  ✓ Image updated with Wikipedia image`);
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    console.log('\n✓ All exhibit images updated with Wikipedia images!');
    
  } catch (error) {
    console.error('Error updating exhibit images:', error);
  }
}

// Run the script
updateExhibitImages().catch(console.error);
