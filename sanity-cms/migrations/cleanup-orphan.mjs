import { createClient } from '@sanity/client'
const client = createClient({
  projectId: '832k5je1',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_AUTH_TOKEN,
})

async function run() {
  await client.patch('WibOQy2bUr7bZQESUifq3T').set({ exponate: [], highlight_exponate: [] }).commit()
  console.log('✓ Referenzen entfernt')
  await client.delete('OBx8fq2Ivqq0Ac0c7dVbzX')
  console.log('✓ Altes Exponat gelöscht')
}
run().catch(e => console.error('❌', e.message))
