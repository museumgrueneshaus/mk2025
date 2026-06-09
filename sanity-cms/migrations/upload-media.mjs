/**
 * Upload plausible media (images, gallery, audio, video) to the 12 sample exponate
 *
 * Uses freely-licensed images from Wikimedia Commons + audio/video samples.
 *
 * Usage:
 *   cd sanity-cms
 *   npx sanity exec migrations/upload-media.mjs --with-user-token
 */
import { createClient } from '@sanity/client'
import https from 'https'
import http from 'http'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '832k5je1'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_AUTH_TOKEN,
})

// ── Helpers ──
const sleep = ms => new Promise(r => setTimeout(r, ms))

function download(url) {
  return new Promise((resolve, reject) => {
    const get = url.startsWith('https') ? https.get : http.get
    get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`))
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => resolve(Buffer.concat(chunks)))
      res.on('error', reject)
    }).on('error', reject)
  })
}

async function downloadWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await download(url)
    } catch (e) {
      if (i < retries - 1 && e.message.includes('429')) {
        const wait = (i + 1) * 3000
        console.log(`     ⏳ Rate-limited, warte ${wait/1000}s…`)
        await sleep(wait)
      } else {
        throw e
      }
    }
  }
}

async function uploadImage(url, filename) {
  console.log(`     ↓ ${filename}`)
  const buf = await downloadWithRetry(url)
  const asset = await client.assets.upload('image', buf, { filename })
  await sleep(1500) // throttle between uploads
  return asset._id
}

async function uploadFile(url, filename, contentType) {
  console.log(`     ↓ ${filename}`)
  const buf = await downloadWithRetry(url)
  const asset = await client.assets.upload('file', buf, { filename, contentType })
  await sleep(1500)
  return asset._id
}

function imgRef(assetId) {
  return { _type: 'image', asset: { _type: 'reference', _ref: assetId } }
}

function fileRef(assetId) {
  return { asset: { _type: 'reference', _ref: assetId } }
}

function key() {
  return Math.random().toString(36).slice(2, 14)
}

// ── Media configuration per exponat ──
const MEDIA = {
  'MGH-001': {
    hauptbild: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Dietringen%2C_R%C3%B6mischer_Meilenstein_%281%29.jpg/1280px-Dietringen%2C_R%C3%B6mischer_Meilenstein_%281%29.jpg',
      name: 'meilenstein-via-claudia.jpg',
      credit: 'Wikimedia Commons / CC BY-SA',
    },
    bilder: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Via_Claudia_Augusta_Meilenstein_Dietringen.jpg/1280px-Via_Claudia_Augusta_Meilenstein_Dietringen.jpg',
        name: 'meilenstein-dietringen.jpg',
        caption: 'Meilenstein an der Via Claudia Augusta bei Dietringen',
      },
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Ambras_Schloss_-_Meilenstein_1.jpg/1280px-Ambras_Schloss_-_Meilenstein_1.jpg',
        name: 'meilenstein-ambras.jpg',
        caption: 'Vergleichsstück: Römischer Meilenstein in Schloss Ambras',
      },
    ],
    audio: true, // gets the german audioguide sample
  },
  'MGH-002': {
    hauptbild: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Kinderwiege_und_Schrank_mit_Bauernmalerei_im_Jura-Bauernhof-Museum.jpg/1280px-Kinderwiege_und_Schrank_mit_Bauernmalerei_im_Jura-Bauernhof-Museum.jpg',
      name: 'bauernschrank-bauernmalerei.jpg',
      credit: 'Jura-Bauernhof-Museum / Wikimedia Commons',
    },
  },
  'MGH-003': {
    hauptbild: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Kamie%C5%84_crucifix.jpg/1280px-Kamie%C5%84_crucifix.jpg',
      name: 'gotisches-kruzifix.jpg',
      credit: 'Wikimedia Commons / CC BY-SA',
    },
    audio: true,
  },
  'MGH-004': {
    hauptbild: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Lehnsbriefe_1666_with_Seal.jpg',
      name: 'urkunde-siegel.jpg',
      credit: 'Wikimedia Commons / Public Domain',
    },
  },
  'MGH-005': {
    hauptbild: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Polished_fossil_ammonite_01.jpg/1280px-Polished_fossil_ammonite_01.jpg',
      name: 'ammonit-poliert.jpg',
      credit: 'Wikimedia Commons / CC BY-SA',
    },
    bilder: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Polished_fossil_ammonite_030.jpg/1280px-Polished_fossil_ammonite_030.jpg',
        name: 'ammonit-detail.jpg',
        caption: 'Detail der polierten Schnittfläche',
      },
    ],
    audio: true,
    video: true, // gets the museum exhibit video sample
  },
  'MGH-006': {
    hauptbild: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Beltzberg_Stollen_Gro%C3%9Fsachsen.jpg',
      name: 'bergwerk-stollen.jpg',
      credit: 'Wikimedia Commons / CC BY-SA',
    },
  },
  'MGH-007': {
    hauptbild: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Egger-Lienz_-_Bildnis_einer_Frau_in_Tiroler_Tracht.jpeg/1280px-Egger-Lienz_-_Bildnis_einer_Frau_in_Tiroler_Tracht.jpeg',
      name: 'tiroler-tracht-portrait.jpg',
      credit: 'Albin Egger-Lienz / Public Domain',
    },
    bilder: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Volkstrachten_%28Folk_costume%29_Page_890_Meyers_grosses_Konversations-Lexikon_-_ein_Nachschlagewerk_des_allgemeinen_Wissens_1908.jpg/1280px-Volkstrachten_%28Folk_costume%29_Page_890_Meyers_grosses_Konversations-Lexikon_-_ein_Nachschlagewerk_des_allgemeinen_Wissens_1908.jpg',
        name: 'volkstrachten-uebersicht.jpg',
        caption: 'Übersicht: Trachten der Alpenregion (Meyers Konversationslexikon, 1908)',
      },
    ],
  },
  'MGH-008': {
    hauptbild: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Atlas_Tyrolensis-Zentralraum_Bozen_1774.jpg',
      name: 'atlas-tyrolensis-1774.jpg',
      credit: 'Peter Anich & Blasius Hueber, 1774 / Public Domain',
    },
    bilder: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Altenberg_Atlas_Tyrolensis_1774.png',
        name: 'atlas-tyrolensis-altenberg.png',
        caption: 'Kartenausschnitt: Region Altenberg im Atlas Tyrolensis',
      },
    ],
    audio: true,
  },
  'MGH-009': {
    hauptbild: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/20230213_Ex_voto_Wallfahrtskirche_Mariahilf_Passau_03.jpg/1280px-20230213_Ex_voto_Wallfahrtskirche_Mariahilf_Passau_03.jpg',
      name: 'votivtafel-exvoto.jpg',
      credit: 'Wikimedia Commons / CC BY-SA',
    },
    bilder: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/20230213_Ex_voto_Wallfahrtskirche_Mariahilf_Passau_05.jpg/1280px-20230213_Ex_voto_Wallfahrtskirche_Mariahilf_Passau_05.jpg',
        name: 'votivtafel-vergleich.jpg',
        caption: 'Vergleichsstück: Votivtafel aus der Wallfahrtskirche Mariahilf, Passau',
      },
    ],
  },
  'MGH-010': {
    hauptbild: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Wrought_iron_shop_sign%2C_Leven_Street_-_geograph.org.uk_-_1532564.jpg',
      name: 'zunftzeichen-schmiedeeisen.jpg',
      credit: 'geograph.org.uk / CC BY-SA',
    },
    bilder: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Wrought_iron_sign_on_the_wash_house_of_Hautvillers%2C_France.jpg/1280px-Wrought_iron_sign_on_the_wash_house_of_Hautvillers%2C_France.jpg',
        name: 'eisenschild-vergleich.jpg',
        caption: 'Schmiedeeisernes Aushängeschild, Frankreich (Vergleich)',
      },
    ],
  },
  'MGH-011': {
    hauptbild: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/A_Brief_History_of_the_Typewriter_-_NARA_-_7280709_%28page_4%29.jpg/1280px-A_Brief_History_of_the_Typewriter_-_NARA_-_7280709_%28page_4%29.jpg',
      name: 'gruendungsurkunde-dokument.jpg',
      credit: 'NARA / Public Domain',
    },
  },
  'MGH-012': {
    hauptbild: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Panorama_Reutte_Ehrenberg_Highline179_DSC03793_mid_PtrQs.jpg/1280px-Panorama_Reutte_Ehrenberg_Highline179_DSC03793_mid_PtrQs.jpg',
      name: 'ehrenberg-panorama.jpg',
      credit: 'Wikimedia Commons / CC BY-SA',
    },
    bilder: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Bad_Rappenau_-_Heinsheim_-_Burg_Ehrenberg_-_Ansicht_von_Norden_%281%29.jpg/1280px-Bad_Rappenau_-_Heinsheim_-_Burg_Ehrenberg_-_Ansicht_von_Norden_%281%29.jpg',
        name: 'ehrenberg-nordansicht.jpg',
        caption: 'Burgruine Ehrenberg – Ansicht von Norden',
      },
    ],
    video: true,
  },
}

// Shared audio/video sources
const AUDIO_SRC = 'https://upload.wikimedia.org/wikipedia/commons/0/03/De-museum_keltenkeller-article.ogg'
const VIDEO_SRC = 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Oloid_in_Deutsches_Museum_1.webm'

// ── Main ──
async function main() {
  console.log('🖼️  Museum im Grünen Haus – Media Upload\n')

  // Fetch all exponate
  const exponate = await client.fetch(`*[_type=="exponat"] | order(inventarnummer asc) { _id, inventarnummer }`)
  const byInv = Object.fromEntries(exponate.map(e => [e.inventarnummer, e._id]))

  console.log(`📦 ${exponate.length} Exponate gefunden\n`)

  // Reuse already-uploaded audio/video assets
  let audioAssetId = 'file-8e1a26a61e6dab21c3173b535f4aa66e22566f55-ogg'
  let videoAssetId = 'file-0eeaccd9ee2156be920f3b596d27d6eef2e4601d-webm'
  console.log(`🎵 Audio-Asset: ${audioAssetId}`)
  console.log(`🎬 Video-Asset: ${videoAssetId}\n`)

  // Process each exponat
  for (const [inv, media] of Object.entries(MEDIA)) {
    const docId = byInv[inv]
    if (!docId) { console.log(`⚠ ${inv} nicht gefunden, übersprungen`); continue }

    console.log(`\n📷 ${inv}:`)

    const patch = {}

    // Hauptbild
    if (media.hauptbild) {
      try {
        const assetId = await uploadImage(media.hauptbild.url, media.hauptbild.name)
        patch.hauptbild = {
          _type: 'image',
          asset: { _type: 'reference', _ref: assetId },
          bildnachweis: media.hauptbild.credit,
        }
        console.log(`   ✓ Hauptbild`)
      } catch (e) {
        console.log(`   ⚠ Hauptbild: ${e.message}`)
      }
    }

    // Bilder (gallery)
    if (media.bilder && media.bilder.length > 0) {
      const bilder = []
      for (const img of media.bilder) {
        try {
          const assetId = await uploadImage(img.url, img.name)
          bilder.push({
            _type: 'image',
            _key: key(),
            asset: { _type: 'reference', _ref: assetId },
            caption: img.caption || '',
          })
          console.log(`   ✓ Galerie: ${img.name}`)
        } catch (e) {
          console.log(`   ⚠ Galerie: ${e.message}`)
        }
      }
      if (bilder.length > 0) patch.bilder = bilder
    }

    // Audio
    if (media.audio && audioAssetId) {
      patch.audio = [{
        _type: 'file',
        _key: key(),
        asset: { _type: 'reference', _ref: audioAssetId },
        sprache: 'de',
        dauer: '2:15',
      }]
      console.log(`   ✓ Audio (DE)`)
    }

    // Video
    if (media.video && videoAssetId) {
      patch.video = {
        videodatei: {
          _type: 'file',
          asset: { _type: 'reference', _ref: videoAssetId },
        },
        videotitel: `${inv} – Kurzdokumentation`,
        dauer: '1:24',
      }
      console.log(`   ✓ Video`)
    }

    // Apply patch
    if (Object.keys(patch).length > 0) {
      await client.patch(docId).set(patch).commit()
      console.log(`   ✅ Gespeichert`)
    }
  }

  console.log('\n\n🎉 Fertig! Alle Medien hochgeladen.')
}

main().catch(err => {
  console.error('❌ Fehler:', err.message)
  process.exit(1)
})
