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

// Museum-specific images from Unsplash
const museumImages = {
  'INV-001': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Roman pottery
  'INV-002': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Medieval weapon
  'INV-003': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Renaissance art
  'INV-004': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Antique clock
  'INV-005': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Fossil
  'INV-006': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Egyptian artifact
  'INV-007': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Industrial machine
  'INV-008': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Art Deco object
  'INV-009': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Viking artifact
  'INV-010': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Asian art
  'INV-011': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Gothic art
  'INV-012': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Modern design
  'INV-013': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Stone tool
  'INV-014': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Musical instrument
  'INV-015': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Art Nouveau jewelry
  'INV-016': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Space rock
  'INV-017': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Antique furniture
  'INV-018': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Celtic jewelry
  'INV-019': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Expressionist art
  'INV-020': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center'  // Contemporary art
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

async function addImagesToExhibits() {
  console.log('Adding images to exhibits...');
  
  try {
    // Get all exhibits
    const exhibits = await client.fetch(`*[_type == "exponat"]{
      _id,
      inventarnummer,
      titel
    }`);
    
    console.log(`Found ${exhibits.length} exhibits`);
    
    for (const exhibit of exhibits) {
      console.log(`\nProcessing exhibit: ${exhibit.titel} (${exhibit.inventarnummer})`);
      
      // Check if exhibit already has an image
      const fullExhibit = await client.fetch(`*[_id == "${exhibit._id}"][0]{
        _id,
        hauptbild
      }`);
      
      if (fullExhibit.hauptbild) {
        console.log(`  ⏭️  Exhibit already has an image, skipping`);
        continue;
      }
      
      // Get image URL for this exhibit
      const imageUrl = museumImages[exhibit.inventarnummer];
      if (!imageUrl) {
        console.log(`  ⚠️  No image URL found for ${exhibit.inventarnummer}`);
        continue;
      }
      
      // Download and upload image
      const filename = `exhibit-${exhibit.inventarnummer}.jpg`;
      const imageAsset = await downloadAndUploadImage(imageUrl, filename);
      
      if (imageAsset) {
        // Update exhibit with image
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
        
        console.log(`  ✓ Image added to exhibit`);
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n✓ All exhibits processed!');
    
  } catch (error) {
    console.error('Error processing exhibits:', error);
  }
}

// Run the script
addImagesToExhibits().catch(console.error);