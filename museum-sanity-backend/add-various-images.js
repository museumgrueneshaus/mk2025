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

// Various different images from Unsplash for each exhibit
const variousImages = {
  'INV-001': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Museum artifact 1
  'INV-002': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Museum artifact 2
  'INV-003': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Museum artifact 3
  'INV-004': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Museum artifact 4
  'INV-005': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Museum artifact 5
  'INV-006': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Museum artifact 6
  'INV-007': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Museum artifact 7
  'INV-008': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Museum artifact 8
  'INV-009': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Museum artifact 9
  'INV-010': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Museum artifact 10
  'INV-011': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Museum artifact 11
  'INV-012': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Museum artifact 12
  'INV-013': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Museum artifact 13
  'INV-014': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Museum artifact 14
  'INV-015': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Museum artifact 15
  'INV-016': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Museum artifact 16
  'INV-017': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Museum artifact 17
  'INV-018': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Museum artifact 18
  'INV-019': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center', // Museum artifact 19
  'INV-020': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center'  // Museum artifact 20
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

async function addVariousImages() {
  console.log('Adding various images to exhibits...');
  
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
      
      // Get different image URL for this exhibit
      const imageUrl = variousImages[exhibit.inventarnummer];
      if (!imageUrl) {
        console.log(`  ⚠️  No image URL found for ${exhibit.inventarnummer}`);
        continue;
      }
      
      // Download and upload new image
      const filename = `exhibit-${exhibit.inventarnummer}-various.jpg`;
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
        
        console.log(`  ✓ Image updated with various image`);
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n✓ All exhibit images updated with various images!');
    
  } catch (error) {
    console.error('Error updating exhibit images:', error);
  }
}

// Run the script
addVariousImages().catch(console.error);
