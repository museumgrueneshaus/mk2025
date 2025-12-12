import { createClient } from '@sanity/client';

// Sanity Client
const client = createClient({
  projectId: '832k5je1',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN || 'sk1VTIq7XVReoW6NVa6L7fIJnUSRYC53fByocEKF2EIXTGHe69jf52yHs7QJwGMbH5dIDz67wEosW4RCq6pjw9qDD3IqJy69N6O7VqgMT8xUcEroHy4P5ORRSvbHuhOsHoUgo70xLnueRKGgKPzsV1nMPpz7DZ1D6CpSfDUSxIapVuDWRNDU'
});

async function removeSpecificReference() {
  try {
    console.log('🔍 Removing specific reference from document ez3GCFW5nbkfogTJJkArpS...');
    
    // Remove the organization.kategorie reference from the specific document
    await client.patch('ez3GCFW5nbkfogTJJkArpS').unset(['organisation.kategorie']).commit();
    console.log('✓ Removed organisation.kategorie reference');
    
    // Also remove from the other document
    await client.patch('42cedd0e-0043-403b-b8a4-d2e1fe6137da').unset(['organisation.kategorie']).commit();
    console.log('✓ Removed organisation.kategorie reference from second document');
    
    console.log('\n✅ All references removed!');
    
  } catch (error) {
    console.error('❌ Error removing references:', error);
  }
}

// Run the script
removeSpecificReference().catch(console.error);

