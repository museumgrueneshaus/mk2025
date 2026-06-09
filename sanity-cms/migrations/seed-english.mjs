/**
 * Add English translations to the 12 sample exponate
 *
 * Usage:
 *   cd sanity-cms
 *   npx sanity exec migrations/seed-english.mjs --with-user-token
 */
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || '832k5je1',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_AUTH_TOKEN,
})

function block(text, style = 'normal') {
  return {
    _type: 'block',
    _key: Math.random().toString(36).slice(2, 10),
    style,
    markDefs: [],
    children: [{ _type: 'span', _key: Math.random().toString(36).slice(2, 10), text, marks: [] }],
  }
}

function blocks(...paragraphs) {
  return paragraphs.map(p => typeof p === 'string' ? block(p) : block(p.text, p.style || 'normal'))
}

const translations = {
  'MGH-001': {
    titel_en: 'Roman Milestone of the Via Claudia Augusta',
    untertitel_en: 'Fragment of a road marker from the 2nd century',
    kurzbeschreibung_en: 'This milestone once marked distances along the Via Claudia Augusta, the most important Roman trade route across the Alps. It was discovered in 1956 during road construction near Reutte.',
    beschreibung_en: blocks(
      'This milestone is one of the most significant archaeological testimonies of the Roman presence in the Außerfern region. The Via Claudia Augusta, built under Emperor Claudius in 47 AD, connected the Po Valley with the Danube and was the most important trade and military route across the Alps.',
      'The Latin inscription on the stone indicates the distance to the nearest settlement and names the reigning emperor. Despite nearly two millennia of weathering, essential parts of the inscription remain legible.',
      { text: 'Discovery', style: 'h2' },
      'The stone was discovered on September 14, 1956, during canal construction work near Lermoos. It lay at a depth of about 1.80 meters, covered by a gravel layer that had preserved it for centuries.',
      'The recovery was carried out under the supervision of the Tyrolean State Museum Ferdinandeum. The milestone is considered one of the best-preserved of its kind north of the Brenner Pass.'
    ),
  },
  'MGH-002': {
    titel_en: 'Tyrolean Painted Peasant Cabinet',
    untertitel_en: 'Decorated wardrobe from the Lech Valley',
    kurzbeschreibung_en: 'A magnificently painted peasant cabinet from the 18th century with floral motifs and religious depictions. It originates from a farmstead in the Lech Valley and showcases typical Tyrolean folk art.',
    beschreibung_en: blocks(
      'This two-door wardrobe is an outstanding example of Tyrolean peasant painting from the 18th century. The front displays elaborate floral garlands on a blue background, symmetrically arranged around two central medallions.',
      'The medallions on the doors depict Saints Notburga and Isidore – both patron saints of agriculture who were particularly revered in Tyrol.',
      { text: 'Craftsmanship', style: 'h2' },
      'The cabinet was crafted from solid Swiss stone pine, prized for its pleasant aroma and excellent workability. The construction features dovetail joints and hand-forged iron fittings, testifying to high craftsmanship.',
      'The painting was executed in casein tempera technique directly on the primed wood. The vibrant colors – particularly the characteristic Tyrolean blue – have been remarkably well preserved over two and a half centuries.'
    ),
  },
  'MGH-003': {
    titel_en: 'Gothic Crucifix from the Parish Church of Breitenwang',
    untertitel_en: 'Carved Christ figure, limewood',
    kurzbeschreibung_en: 'An impressive late Gothic crucifix from around 1480. The expressive carving shows the suffering Christ and is attributed to a pupil of the Multscher workshop.',
    beschreibung_en: blocks(
      'This late Gothic crucifix is one of the most significant sacred artworks of the region. The Christ figure is carved from a single block of limewood and displays the expressive suffering typical of the Late Gothic period.',
      'The anatomical rendering of the body, particularly the detailed musculature and the taut tendons of the hands, demonstrate a masterful command of carving technique. The face expresses quiet suffering, the eyes half-closed.',
      { text: 'Stylistic Classification', style: 'h2' },
      'The formal language shows clear parallels to works from the circle of Hans Multscher, one of the most important sculptors of the Late Gothic period. Art historians suspect that the master received his training in Ulm or Augsburg.',
      'The original polychrome finish – in naturalistic tones – is partially preserved beneath later overpaintings. An infrared reflectography examination has revealed traces of the original paintwork.'
    ),
  },
  'MGH-004': {
    titel_en: 'Salt Trade Charter',
    untertitel_en: 'Letter of privilege for salt transport over the Fernpass',
    kurzbeschreibung_en: 'This parchment charter from 1432 grants the citizens of Reutte the right to transport salt over the Fernpass. It is a key document for the economic history of the region.',
    beschreibung_en: blocks(
      'The charter was issued on May 12, 1432, by Duke Friedrich IV of Tyrol and grants the citizens of Reutte extensive privileges in the salt trade. The salt trade was the economic lifeline of the Außerfern region for centuries.',
      'The document is written on parchment and bears the ducal wax seal. The text in early New High German chancellery language describes in detail the trading rights, transport routes, and tolls to be paid.',
      { text: 'Historical Significance', style: 'h2' },
      'The Fernpass was one of the most important trade routes between the Inn Valley and the Allgäu. Salt from Hall in Tyrol was transported along this route to southern Germany and brought enormous wealth to the region.',
      'Thanks to these privileges, Reutte developed into an important trading center. The rights enshrined in the charter formed the basis for the town\'s golden age in the 15th and 16th centuries.'
    ),
  },
  'MGH-005': {
    titel_en: 'Fossil Ammonite from the Lechtal Alps',
    untertitel_en: 'Arietites bucklandi, Lower Jurassic',
    kurzbeschreibung_en: 'An impressively preserved ammonite from the Jurassic period, found in the Lechtal Alps. The fossil documents that today\'s Alpine peaks were once at the bottom of a tropical sea.',
    beschreibung_en: blocks(
      'This large-format ammonite of the genus Arietites bucklandi was discovered in a limestone layer at over 2,200 meters altitude in the Lechtal Alps. It is approximately 190 million years old and dates from the Lower Jurassic.',
      'The spiral shell clearly shows the characteristic ribs and angular cross-section of the genus. The state of preservation is exceptional – even the fine structure of the chamber walls is visible.',
      { text: 'What are Ammonites?', style: 'h2' },
      'Ammonites were cephalopods related to today\'s squid and nautilus. They lived in the oceans of the Mesozoic Era and went extinct alongside the dinosaurs 66 million years ago.',
      'Their discovery at alpine elevations impressively demonstrates the enormous tectonic forces that have uplifted the Alps over millions of years. What was once the ocean floor now forms the highest peaks of Tyrol.'
    ),
  },
  'MGH-006': {
    titel_en: 'Mining Tools from the Silver Mine',
    untertitel_en: 'Hammer, chisel and pit lamp',
    kurzbeschreibung_en: 'A complete set of historical mining tools from the former silver mine near Biberwier. The tools document mining in the Außerfern region, which was operated from the 15th to the 18th century.',
    beschreibung_en: blocks(
      'This collection of mining tools comprises a hammer (fäustel), three different chisels, a pit lamp, and an ore carrier. The tools originate from the silver mine near Biberwier, which operated from approximately 1480 to 1760.',
      'The hammer is made of forged iron with an ash wood handle and shows clear signs of use. The chisels of various sizes were used to work the ore out of the rock.',
      { text: 'Mining in the Außerfern', style: 'h2' },
      'Silver mining was, alongside the salt trade, the second economic pillar of the region. The ore deposits near Biberwier and at the Fernpass attracted miners from throughout Tyrol and Saxony in the 15th century.',
      'The hard underground work was often performed by children and teenagers. A miner worked up to 12 hours daily by candlelight in narrow tunnels. The oil lamp (Geleucht) shown here was the only source of light.'
    ),
  },
  'MGH-007': {
    titel_en: 'Außerfern Women\'s Traditional Costume',
    untertitel_en: 'Festival costume from the 19th century',
    kurzbeschreibung_en: 'A complete women\'s traditional costume from the Außerfern, consisting of bodice, skirt, apron, blouse, and headdress. The elaborate embroidery makes it a showpiece of regional textile art.',
    beschreibung_en: blocks(
      'This festival costume is one of the most completely preserved examples of Außerfern traditional fashion from the 19th century. It consists of an embroidered black velvet bodice, a pleated skirt of dark green wool, a white linen apron with lace trim, and a starched blouse.',
      'The bodice features elaborate gold embroidery with floral motifs – edelweiss, gentian, and alpine roses. The embroidery was executed in couching technique, where gold threads are laid on the fabric and secured with fine silk threads.',
      { text: 'The Headdress', style: 'h2' },
      'Particularly noteworthy is the accompanying Riegelhaube, an elaborately folded and embroidered cap that indicated the wearer\'s marital status. This cap of black silk with gold braid was worn by married women at church festivals.',
      'According to family tradition, the costume was made around 1860 by a seamstress in Reutte and worn at Corpus Christi processions and weddings until the 1920s.'
    ),
  },
  'MGH-008': {
    titel_en: 'Historical Map of the Außerfern',
    untertitel_en: 'Copper engraving by Peter Anich and Blasius Hueber',
    kurzbeschreibung_en: 'A hand-colored copper engraving from the famous Atlas Tyrolensis of 1774. The map shows the Außerfern with astonishing accuracy and is considered a milestone in alpine cartography.',
    beschreibung_en: blocks(
      'This map sheet is an original print from the Atlas Tyrolensis, the first scientifically surveyed atlas of Tyrol. It was created by the farmer\'s son and autodidact Peter Anich and his student Blasius Hueber.',
      'The map shows the Außerfern territory – from Reutte and the Lech Valley across the Fernpass to Lake Plansee. Particularly remarkable is the detailed depiction of mountain formations, which Anich realized with an innovative hatching technique.',
      { text: 'Peter Anich – The Farmer Cartographer', style: 'h2' },
      'Peter Anich (1723–1766) from Oberperfuss is considered one of the most important cartographers of the Alps. As a simple farmer\'s son, he taught himself mathematics and astronomy and began the systematic survey of Tyrol at age 36.',
      'He traversed the land on foot, often in the worst conditions, and recorded heights and distances with self-built instruments. The resulting map was so precise that it served as the standard reference work into the 19th century.'
    ),
  },
  'MGH-009': {
    titel_en: 'Votive Painting "Miracle at Lake Plansee"',
    untertitel_en: 'Oil painting on wood',
    kurzbeschreibung_en: 'A naive votive painting from 1823 depicting a miraculous rescue at Lake Plansee. Such paintings were donated as thanks for divine help in times of peril.',
    beschreibung_en: blocks(
      'The votive painting shows the Virgin Mary on a cloud in the upper register, and a dramatic scene in the lower register: a raft with three people caught in a storm on Lake Plansee. The inscription at the bottom tells of the rescue.',
      'The painting in naive folk art style is applied in vibrant colors on a primed wooden panel. The perspective is deliberately simplified – the figures are oversized relative to the lake to emphasize their significance.',
      { text: 'Inscription', style: 'h2' },
      { text: '"On the 4th of July 1823, Joh. Geörg Bader found himself with his wife and son on Lake Plansee when a terrible storm arose and the raft threatened to capsize. In their greatest need they called upon the Holy Mother of God and were miraculously saved. Ex Voto."', style: 'blockquote' },
      'Votive paintings are an important part of Alpine folk culture. They were donated as offerings of thanks to pilgrimage churches or chapels and document not only personal faith, but also historical events, accidents, and natural disasters.'
    ),
  },
  'MGH-010': {
    titel_en: 'Guild Sign of the Reutte Blacksmiths',
    untertitel_en: 'Wrought-iron hanging sign',
    kurzbeschreibung_en: 'An elaborately forged guild sign of the Reutte blacksmiths from the 17th century. The filigree ironwork shows crossed hammers, an anvil, and ornamental scrollwork.',
    beschreibung_en: blocks(
      'This guild sign hung for over three centuries on the guild house of the blacksmiths on Reutte\'s Obermarktstraße. It displays the classic symbols of the blacksmith trade – crossed hammers over an anvil – framed by elaborate wrought-iron scrolls and leaves.',
      'The exceptional quality of the ironwork documents the high artistry of the Reutte blacksmiths, who were renowned far beyond the region. Each leaf and scroll was individually forged and then riveted together.',
      { text: 'The Blacksmith Trade in Reutte', style: 'h2' },
      'The blacksmiths were among the most respected craftsmen in the Außerfern. Their guild, founded in 1587, comprised farriers, weaponsmiths, and art smiths. The favorable location on the trade routes and proximity to ore deposits at Biberwier supported the trade.',
      'With the decline of mining and the onset of industrialization in the 19th century, the guild lost its importance. The guild house was demolished in 1895. This sign was entrusted to the museum by the last guild master.'
    ),
  },
  'MGH-011': {
    titel_en: 'Founding Charter of the Museum Association',
    untertitel_en: 'Document of the association\'s founding in 1975',
    kurzbeschreibung_en: 'On March 15, 1975, twenty-three dedicated citizens founded the Museum Association Reutte. This founding charter with all original signatures marks the beginning of institutional museum work in the Außerfern.',
    beschreibung_en: blocks(
      'This historic document marks the official beginning of the Museum Association Reutte. On March 15, 1975, twenty-three dedicated citizens gathered in the community hall to establish the association.',
      'The founding charter contains the original bylaws and the signatures of all founding members. It is not only an important document of the association\'s history, but also a testament to the cultural commitment of the region.',
      { text: 'The Founders\' Vision', style: 'h2' },
      'The founding members had the vision of preserving the rich history and culture of the Außerfern in a central museum and making it accessible to the public. Many historical objects were at risk of being forgotten or disappearing into private collections.',
      'The first chairman, Dr. Karl Stotter, formulated the goal: "A living museum that not only preserves but also tells stories – about the people who lived and worked here." This vision guides the Museum im Grünen Haus to this day.'
    ),
  },
  'MGH-012': {
    titel_en: 'Model of Ehrenberg Castle',
    untertitel_en: 'Scale architectural model 1:100',
    kurzbeschreibung_en: 'A detailed model of the Ehrenberg fortress complex near Reutte, as it appeared in the 17th century. The model was reconstructed based on historical plans and archaeological findings.',
    beschreibung_en: blocks(
      'This scale model (1:100) shows the Ehrenberg fortress complex in its state around 1650 – at the height of its military significance. The complex comprises the main castle, the outer castle, the Claudia bastions, and the toll station at the valley floor.',
      'The model was crafted in over 800 working hours by the Reutte model builder Hans Lechleitner. It is based on the results of archaeological excavations since 2002 and historical plans from the Tyrolean State Archives.',
      { text: 'Ehrenberg Castle', style: 'h2' },
      'Ehrenberg was one of the mightiest fortress complexes in the Alps. The castle secured the important trade route over the Fernpass and controlled access to the Lech Valley. During the Thirty Years\' War and the War of the Spanish Succession, it was besieged multiple times.',
      'After its abandonment as a fortress in the 18th century, the complex fell into increasing disrepair. Since 1993, Ehrenberg has been restored as a "castle ensemble" and developed for tourism. The "highline179" suspension bridge, opened in 2014, now connects the castle ruins with Fort Claudia.',
      { text: 'Model Technique', style: 'h3' },
      'The model consists of laser-cut wood, plaster, and hand-painted details. Particularly elaborate was the recreation of the Claudia bastions with their star-shaped layouts based on Italian models.'
    ),
  },
}

async function main() {
  console.log('🇬🇧 Adding English translations…\n')

  const exponate = await client.fetch(`*[_type=="exponat"] | order(inventarnummer asc) { _id, inventarnummer }`)
  const byInv = Object.fromEntries(exponate.map(e => [e.inventarnummer, e._id]))

  for (const [inv, data] of Object.entries(translations)) {
    const id = byInv[inv]
    if (!id) { console.log(`⚠ ${inv} not found`); continue }
    await client.patch(id).set(data).commit()
    console.log(`✓ ${inv} – ${data.titel_en}`)
  }

  console.log(`\n🎉 Done! ${Object.keys(translations).length} translations added.`)
}

main().catch(e => { console.error('❌', e.message); process.exit(1) })
