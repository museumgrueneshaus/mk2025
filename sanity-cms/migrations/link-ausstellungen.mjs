/**
 * Verknüpft die neuen 12 Exponate mit den Demo-Ausstellungen
 */
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: '832k5je1',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_AUTH_TOKEN,
})

async function run() {
  // Fetch all new exponate
  const exponate = await client.fetch(`*[_type=="exponat"] | order(inventarnummer asc) { _id, titel, inventarnummer, ist_highlight }`)
  console.log(`${exponate.length} Exponate gefunden\n`)

  const allRefs = exponate.map(e => ({ _type: 'reference', _ref: e._id, _key: e._id.slice(0, 12) }))
  const highlightRefs = exponate.filter(e => e.ist_highlight).map(e => ({ _type: 'reference', _ref: e._id, _key: e._id.slice(0, 12) }))

  // Explorer-Demo: alle 12
  await client.patch('ausstellung-explorer-demo').set({ exponate: allRefs }).commit()
  console.log(`✓ Explorer-Demo: ${allRefs.length} Exponate verknüpft`)

  // Slideshow-Demo: nur Highlights
  await client.patch('ausstellung-slideshow-demo').set({ exponate: highlightRefs }).commit()
  console.log(`✓ Slideshow-Demo: ${highlightRefs.length} Highlights verknüpft`)

  // 50 Jahre: alle + highlights
  await client.patch('WibOQy2bUr7bZQESUifq3T').set({ exponate: allRefs, highlight_exponate: highlightRefs }).commit()
  console.log(`✓ 50 Jahre Ausstellung: ${allRefs.length} Exponate + ${highlightRefs.length} Highlights verknüpft`)

  console.log('\n🎉 Fertig!')
}

run().catch(e => console.error('❌', e.message))
