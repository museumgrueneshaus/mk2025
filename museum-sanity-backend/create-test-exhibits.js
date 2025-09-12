import { createClient } from '@sanity/client';
import fetch from 'node-fetch';

// Sanity Client
const client = createClient({
  projectId: '832k5je1',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN || 'your-token-here' // You'll need to set this
});

// Test exhibits with Wikipedia images and realistic museum data
const testExhibits = [
  {
    inventarnummer: 'INV-001',
    titel: 'Römische Amphore',
    untertitel: 'Keramikgefäß aus dem 1. Jahrhundert n. Chr.',
    kurzbeschreibung: 'Eine gut erhaltene römische Amphore aus Terra Sigillata mit charakteristischen roten Glasuren.',
    beschreibung: 'Diese Amphore stammt aus einer römischen Villa in Pompeji und zeigt die typische Form und Verzierung der frühen Kaiserzeit. Das Gefäß wurde für den Transport von Wein und Öl verwendet.',
    hauptbild_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Roman_amphora_1st_century_AD.jpg/800px-Roman_amphora_1st_century_AD.jpg',
    datierung: { jahr_von: 1, jahr_bis: 100, jahr_text: '1. Jahrhundert n. Chr.' },
    herstellung: { material: 'Terra Sigillata', technik: 'Töpferei', ort: 'Pompeji' },
    physisch: { hoehe: 45, breite: 25, tiefe: 25, gewicht: 2.5 },
    organisation: 'Archäologisches Museum',
    tags: ['Römisch', 'Keramik', 'Antike', 'Transport'],
    ist_highlight: true,
    hat_led_licht: true,
    led_position: { strip_number: 1, led_start: 0, led_end: 9, raum_position: 'Nordwand, links' }
  },
  {
    inventarnummer: 'INV-002',
    titel: 'Mittelalterliches Schwert',
    untertitel: 'Ritterliches Langschwert aus dem 12. Jahrhundert',
    kurzbeschreibung: 'Ein prächtiges Langschwert mit kunstvoll verziertem Griff und scharfer Klinge.',
    beschreibung: 'Dieses Schwert gehörte einem Ritter des Deutschen Ordens und zeigt die typische Formgebung des Hochmittelalters. Die Klinge ist aus Damaszener Stahl gefertigt.',
    hauptbild_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Medieval_sword_12th_century.jpg/800px-Medieval_sword_12th_century.jpg',
    datierung: { jahr_von: 1100, jahr_bis: 1200, jahr_text: '12. Jahrhundert' },
    herstellung: { material: 'Damaszener Stahl, Leder, Holz', technik: 'Schmiedekunst', ort: 'Deutschland' },
    physisch: { hoehe: 95, breite: 8, tiefe: 3, gewicht: 1.2 },
    organisation: 'Historisches Museum',
    tags: ['Mittelalter', 'Waffe', 'Ritter', 'Schmiedekunst'],
    ist_highlight: true,
    hat_led_licht: true,
    led_position: { strip_number: 1, led_start: 10, led_end: 19, raum_position: 'Nordwand, Mitte' }
  },
  {
    inventarnummer: 'INV-003',
    titel: 'Renaissance-Gemälde',
    untertitel: 'Madonna mit Kind von einem unbekannten Meister',
    kurzbeschreibung: 'Ein zartes Gemälde der Madonna mit dem Jesuskind in typischer Renaissance-Darstellung.',
    beschreibung: 'Dieses Gemälde zeigt den Einfluss der italienischen Renaissance auf die deutsche Malerei. Die Komposition und Farbgebung verweisen auf die Schule von Dürer.',
    hauptbild_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Renaissance_madonna_painting.jpg/800px-Renaissance_madonna_painting.jpg',
    datierung: { jahr_von: 1500, jahr_bis: 1520, jahr_text: 'um 1510' },
    herstellung: { material: 'Öl auf Holz', technik: 'Malerei', ort: 'Nürnberg' },
    physisch: { hoehe: 60, breite: 45, tiefe: 2, gewicht: 3.5 },
    organisation: 'Kunstmuseum',
    tags: ['Renaissance', 'Malerei', 'Religiös', 'Dürer-Schule'],
    ist_highlight: false,
    hat_led_licht: false
  },
  {
    inventarnummer: 'INV-004',
    titel: 'Barocke Uhr',
    untertitel: 'Prunkvolle Standuhr aus dem 17. Jahrhundert',
    kurzbeschreibung: 'Eine aufwendig verzierte Standuhr mit vergoldeten Ornamenten und mechanischem Uhrwerk.',
    beschreibung: 'Diese Uhr stammt aus der Werkstatt eines Augsburger Uhrmachers und zeigt die typische barocke Ornamentik. Das Uhrwerk ist vollständig funktionsfähig.',
    hauptbild_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Baroque_clock_17th_century.jpg/800px-Baroque_clock_17th_century.jpg',
    datierung: { jahr_von: 1650, jahr_bis: 1680, jahr_text: 'um 1665' },
    herstellung: { material: 'Holz, Messing, Gold', technik: 'Uhrmacherei', ort: 'Augsburg' },
    physisch: { hoehe: 180, breite: 45, tiefe: 25, gewicht: 25.0 },
    organisation: 'Technikmuseum',
    tags: ['Barock', 'Uhr', 'Mechanik', 'Goldschmiedekunst'],
    ist_highlight: true,
    hat_led_licht: true,
    led_position: { strip_number: 2, led_start: 0, led_end: 14, raum_position: 'Ostwand, unten' }
  },
  {
    inventarnummer: 'INV-005',
    titel: 'Fossil eines Ammoniten',
    untertitel: 'Versteinerter Kopffüßer aus der Jurazeit',
    kurzbeschreibung: 'Ein perfekt erhaltener Ammonit mit spiralförmiger Schale und sichtbaren Kammerwänden.',
    beschreibung: 'Dieser Ammonit stammt aus den Solnhofener Plattenkalken und ist etwa 150 Millionen Jahre alt. Die Erhaltung ist außergewöhnlich gut.',
    hauptbild_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Ammonite_fossil_jurassic.jpg/800px-Ammonite_fossil_jurassic.jpg',
    datierung: { jahr_von: -150000000, jahr_bis: -145000000, jahr_text: 'Jurazeit, vor 150 Mio. Jahren' },
    herstellung: { material: 'Kalkstein', technik: 'Fossilisation', ort: 'Solnhofen' },
    physisch: { hoehe: 15, breite: 15, tiefe: 5, gewicht: 0.8 },
    organisation: 'Naturkundemuseum',
    tags: ['Fossil', 'Jura', 'Meer', 'Evolution'],
    ist_highlight: false,
    hat_led_licht: false
  },
  {
    inventarnummer: 'INV-006',
    titel: 'Ägyptische Mumie',
    untertitel: 'Mumifizierter Körper eines Priesters',
    kurzbeschreibung: 'Eine gut erhaltene Mumie mit farbigen Leinenbinden und goldenem Totenmaske.',
    beschreibung: 'Diese Mumie stammt aus dem Grab eines ägyptischen Priesters und zeigt die typische Mumifizierungstechnik des Neuen Reiches.',
    hauptbild_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Egyptian_mummy_new_kingdom.jpg/800px-Egyptian_mummy_new_kingdom.jpg',
    datierung: { jahr_von: -1300, jahr_bis: -1200, jahr_text: 'Neues Reich, 13. Jh. v. Chr.' },
    herstellung: { material: 'Menschliche Überreste, Leinen, Gold', technik: 'Mumifizierung', ort: 'Theben' },
    physisch: { hoehe: 170, breite: 40, tiefe: 30, gewicht: 35.0 },
    organisation: 'Ägyptisches Museum',
    tags: ['Ägypten', 'Mumie', 'Religion', 'Antike'],
    ist_highlight: true,
    hat_led_licht: true,
    led_position: { strip_number: 2, led_start: 15, led_end: 29, raum_position: 'Ostwand, Mitte' }
  },
  {
    inventarnummer: 'INV-007',
    titel: 'Industrielle Dampfmaschine',
    untertitel: 'Frühe Dampfmaschine aus dem 19. Jahrhundert',
    kurzbeschreibung: 'Eine funktionsfähige Dampfmaschine, die die industrielle Revolution symbolisiert.',
    beschreibung: 'Diese Dampfmaschine wurde in einer Textilfabrik eingesetzt und zeigt die technischen Fortschritte der Industrialisierung.',
    hauptbild_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Industrial_steam_engine_19th_century.jpg/800px-Industrial_steam_engine_19th_century.jpg',
    datierung: { jahr_von: 1850, jahr_bis: 1870, jahr_text: 'um 1860' },
    herstellung: { material: 'Gusseisen, Stahl, Messing', technik: 'Maschinenbau', ort: 'Manchester' },
    physisch: { hoehe: 200, breite: 150, tiefe: 100, gewicht: 500.0 },
    organisation: 'Technikmuseum',
    tags: ['Industrie', 'Dampf', 'Revolution', 'Technik'],
    ist_highlight: true,
    hat_led_licht: true,
    led_position: { strip_number: 3, led_start: 0, led_end: 19, raum_position: 'Südwand, links' }
  },
  {
    inventarnummer: 'INV-008',
    titel: 'Art Deco Vase',
    untertitel: 'Elegante Keramikvase im Art Deco Stil',
    kurzbeschreibung: 'Eine geometrisch gestaltete Vase mit charakteristischen Art Deco Motiven.',
    beschreibung: 'Diese Vase zeigt die typischen Merkmale des Art Deco: geometrische Formen, kontrastierende Farben und moderne Ästhetik.',
    hauptbild_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Art_deco_vase_1920s.jpg/800px-Art_deco_vase_1920s.jpg',
    datierung: { jahr_von: 1920, jahr_bis: 1930, jahr_text: '1920er Jahre' },
    herstellung: { material: 'Keramik, Emaille', technik: 'Töpferei', ort: 'Paris' },
    physisch: { hoehe: 35, breite: 20, tiefe: 20, gewicht: 1.2 },
    organisation: 'Design Museum',
    tags: ['Art Deco', 'Keramik', 'Design', '1920er'],
    ist_highlight: false,
    hat_led_licht: false
  },
  {
    inventarnummer: 'INV-009',
    titel: 'Wikinger-Schmuck',
    untertitel: 'Silberner Armring mit Runeninschrift',
    kurzbeschreibung: 'Ein kunstvoll gearbeiteter Silberarmring mit eingravierten Runen.',
    beschreibung: 'Dieser Armring gehörte einem Wikingerhäuptling und zeigt die typische nordische Ornamentik und Runenschrift.',
    hauptbild_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Viking_silver_arm_ring.jpg/800px-Viking_silver_arm_ring.jpg',
    datierung: { jahr_von: 900, jahr_bis: 1000, jahr_text: '10. Jahrhundert' },
    herstellung: { material: 'Silber', technik: 'Schmiedekunst', ort: 'Skandinavien' },
    physisch: { hoehe: 3, breite: 8, tiefe: 8, gewicht: 0.3 },
    organisation: 'Nordisches Museum',
    tags: ['Wikinger', 'Silber', 'Runen', 'Schmuck'],
    ist_highlight: true,
    hat_led_licht: true,
    led_position: { strip_number: 1, led_start: 20, led_end: 29, raum_position: 'Nordwand, rechts' }
  },
  {
    inventarnummer: 'INV-010',
    titel: 'Chinesische Porzellanvase',
    untertitel: 'Ming-Dynastie Porzellan mit Drachenmotiven',
    kurzbeschreibung: 'Eine kostbare Porzellanvase mit blauen Drachen auf weißem Grund.',
    beschreibung: 'Diese Vase stammt aus der Ming-Dynastie und zeigt die typische blaue Unterglasurmalerei auf weißem Porzellan.',
    hauptbild_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Ming_dynasty_porcelain_vase.jpg/800px-Ming_dynasty_porcelain_vase.jpg',
    datierung: { jahr_von: 1400, jahr_bis: 1500, jahr_text: 'Ming-Dynastie, 15. Jh.' },
    herstellung: { material: 'Porzellan', technik: 'Keramik', ort: 'Jingdezhen' },
    physisch: { hoehe: 45, breite: 25, tiefe: 25, gewicht: 2.8 },
    organisation: 'Asiatisches Museum',
    tags: ['China', 'Porzellan', 'Ming', 'Drachen'],
    ist_highlight: true,
    hat_led_licht: true,
    led_position: { strip_number: 2, led_start: 30, led_end: 39, raum_position: 'Ostwand, oben' }
  },
  {
    inventarnummer: 'INV-011',
    titel: 'Gotische Skulptur',
    untertitel: 'Steinerne Madonna aus dem 14. Jahrhundert',
    kurzbeschreibung: 'Eine fein gearbeitete Steinskulptur der Madonna mit Kind.',
    beschreibung: 'Diese Skulptur stammt aus einer gotischen Kathedrale und zeigt die typische Stilisierung der Gotik.',
    hauptbild_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Gothic_madonna_sculpture.jpg/800px-Gothic_madonna_sculpture.jpg',
    datierung: { jahr_von: 1300, jahr_bis: 1400, jahr_text: '14. Jahrhundert' },
    herstellung: { material: 'Sandstein', technik: 'Bildhauerei', ort: 'Köln' },
    physisch: { hoehe: 120, breite: 40, tiefe: 30, gewicht: 85.0 },
    organisation: 'Mittelalterliches Museum',
    tags: ['Gotik', 'Skulptur', 'Madonna', 'Kathedrale'],
    ist_highlight: false,
    hat_led_licht: false
  },
  {
    inventarnummer: 'INV-012',
    titel: 'Bauhaus Lampe',
    untertitel: 'Funktionalistische Tischlampe aus der Bauhaus-Zeit',
    kurzbeschreibung: 'Eine minimalistische Lampe, die die Bauhaus-Philosophie verkörpert.',
    beschreibung: 'Diese Lampe zeigt die typischen Merkmale des Bauhaus: Funktionalität, Einfachheit und moderne Materialien.',
    hauptbild_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Bauhaus_table_lamp.jpg/800px-Bauhaus_table_lamp.jpg',
    datierung: { jahr_von: 1925, jahr_bis: 1930, jahr_text: 'um 1928' },
    herstellung: { material: 'Metall, Glas', technik: 'Industriedesign', ort: 'Dessau' },
    physisch: { hoehe: 40, breite: 20, tiefe: 20, gewicht: 1.5 },
    organisation: 'Design Museum',
    tags: ['Bauhaus', 'Design', 'Funktionalismus', 'Moderne'],
    ist_highlight: true,
    hat_led_licht: true,
    led_position: { strip_number: 3, led_start: 20, led_end: 29, raum_position: 'Südwand, Mitte' }
  },
  {
    inventarnummer: 'INV-013',
    titel: 'Prähistorischer Faustkeil',
    untertitel: 'Steinwerkzeug aus der Altsteinzeit',
    kurzbeschreibung: 'Ein sorgfältig bearbeiteter Faustkeil aus Feuerstein.',
    beschreibung: 'Dieser Faustkeil wurde von Neandertalern hergestellt und diente als universelles Werkzeug.',
    hauptbild_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Prehistoric_hand_axe.jpg/800px-Prehistoric_hand_axe.jpg',
    datierung: { jahr_von: -100000, jahr_bis: -50000, jahr_text: 'Altsteinzeit, vor 80.000 Jahren' },
    herstellung: { material: 'Feuerstein', technik: 'Steinbearbeitung', ort: 'Europa' },
    physisch: { hoehe: 12, breite: 8, tiefe: 4, gewicht: 0.4 },
    organisation: 'Prähistorisches Museum',
    tags: ['Prähistorie', 'Neandertaler', 'Werkzeug', 'Steinzeit'],
    ist_highlight: false,
    hat_led_licht: false
  },
  {
    inventarnummer: 'INV-014',
    titel: 'Barocke Orgelpfeife',
    untertitel: 'Zinnpfeife aus einer historischen Kirchenorgel',
    kurzbeschreibung: 'Eine kunstvoll gefertigte Orgelpfeife mit reicher Verzierung.',
    beschreibung: 'Diese Pfeife stammt aus einer barocken Kirchenorgel und zeigt die hohe Handwerkskunst der Orgelbauer.',
    hauptbild_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Baroque_organ_pipe.jpg/800px-Baroque_organ_pipe.jpg',
    datierung: { jahr_von: 1700, jahr_bis: 1750, jahr_text: 'um 1720' },
    herstellung: { material: 'Zinn, Holz', technik: 'Orgelbau', ort: 'Sachsen' },
    physisch: { hoehe: 80, breite: 15, tiefe: 15, gewicht: 2.2 },
    organisation: 'Musikinstrumenten-Museum',
    tags: ['Barock', 'Orgel', 'Musik', 'Handwerk'],
    ist_highlight: true,
    hat_led_licht: true,
    led_position: { strip_number: 3, led_start: 30, led_end: 39, raum_position: 'Südwand, rechts' }
  },
  {
    inventarnummer: 'INV-015',
    titel: 'Jugendstil-Brosche',
    untertitel: 'Art Nouveau Schmuckstück mit floralen Motiven',
    kurzbeschreibung: 'Eine elegante Brosche mit typischen Jugendstil-Ornamenten.',
    beschreibung: 'Diese Brosche zeigt die charakteristischen floralen Motive und geschwungenen Linien des Jugendstils.',
    hauptbild_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Art_nouveau_brooch.jpg/800px-Art_nouveau_brooch.jpg',
    datierung: { jahr_von: 1900, jahr_bis: 1910, jahr_text: 'um 1905' },
    herstellung: { material: 'Gold, Emaille, Perlen', technik: 'Goldschmiedekunst', ort: 'Wien' },
    physisch: { hoehe: 6, breite: 4, tiefe: 1, gewicht: 0.1 },
    organisation: 'Jugendstil Museum',
    tags: ['Jugendstil', 'Schmuck', 'Floral', 'Art Nouveau'],
    ist_highlight: false,
    hat_led_licht: false
  },
  {
    inventarnummer: 'INV-016',
    titel: 'Meteorit',
    untertitel: 'Eisenmeteorit aus dem Asteroidengürtel',
    kurzbeschreibung: 'Ein seltenes Fragment eines Eisenmeteoriten mit charakteristischer Struktur.',
    beschreibung: 'Dieser Meteorit stammt aus dem Asteroidengürtel und zeigt die typische Widmanstätten-Struktur von Eisenmeteoriten.',
    hauptbild_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Iron_meteorite_widmanstatten.jpg/800px-Iron_meteorite_widmanstatten.jpg',
    datierung: { jahr_von: -4500000000, jahr_bis: -4500000000, jahr_text: 'vor 4,5 Milliarden Jahren' },
    herstellung: { material: 'Eisen, Nickel', technik: 'Kosmische Entstehung', ort: 'Weltraum' },
    physisch: { hoehe: 20, breite: 15, tiefe: 10, gewicht: 8.5 },
    organisation: 'Naturkundemuseum',
    tags: ['Meteorit', 'Eisen', 'Weltraum', 'Asteroid'],
    ist_highlight: true,
    hat_led_licht: true,
    led_position: { strip_number: 1, led_start: 30, led_end: 39, raum_position: 'Nordwand, oben' }
  },
  {
    inventarnummer: 'INV-017',
    titel: 'Biedermeier-Sekretär',
    untertitel: 'Elegantes Möbelstück aus der Biedermeier-Zeit',
    kurzbeschreibung: 'Ein fein gearbeiteter Sekretär mit charakteristischen Biedermeier-Elementen.',
    beschreibung: 'Dieser Sekretär zeigt die typische Eleganz und Funktionalität der Biedermeier-Möbel.',
    hauptbild_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Biedermeier_secretary_desk.jpg/800px-Biedermeier_secretary_desk.jpg',
    datierung: { jahr_von: 1820, jahr_bis: 1840, jahr_text: 'um 1830' },
    herstellung: { material: 'Mahagoni, Messing', technik: 'Möbeltischlerei', ort: 'Wien' },
    physisch: { hoehe: 140, breite: 80, tiefe: 45, gewicht: 45.0 },
    organisation: 'Möbelmuseum',
    tags: ['Biedermeier', 'Möbel', 'Mahagoni', 'Elegant'],
    ist_highlight: false,
    hat_led_licht: false
  },
  {
    inventarnummer: 'INV-018',
    titel: 'Keltischer Torques',
    untertitel: 'Goldener Halsring aus der Keltenzeit',
    kurzbeschreibung: 'Ein kunstvoller goldener Halsring mit typischen keltischen Verzierungen.',
    beschreibung: 'Dieser Torques gehörte einem keltischen Fürsten und zeigt die hohe Goldschmiedekunst der Kelten.',
    hauptbild_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Celtic_gold_torques.jpg/800px-Celtic_gold_torques.jpg',
    datierung: { jahr_von: -300, jahr_bis: -100, jahr_text: '3.-1. Jh. v. Chr.' },
    herstellung: { material: 'Gold', technik: 'Goldschmiedekunst', ort: 'Gallien' },
    physisch: { hoehe: 5, breite: 20, tiefe: 20, gewicht: 0.8 },
    organisation: 'Keltisches Museum',
    tags: ['Kelten', 'Gold', 'Schmuck', 'Fürstengrab'],
    ist_highlight: true,
    hat_led_licht: true,
    led_position: { strip_number: 2, led_start: 40, led_end: 49, raum_position: 'Ostwand, unten rechts' }
  },
  {
    inventarnummer: 'INV-019',
    titel: 'Expressionistisches Gemälde',
    untertitel: 'Farbintensives Werk der Brücke-Gruppe',
    kurzbeschreibung: 'Ein expressives Gemälde mit kräftigen Farben und dynamischen Formen.',
    beschreibung: 'Dieses Gemälde stammt von einem Mitglied der Brücke-Gruppe und zeigt die typischen Merkmale des deutschen Expressionismus.',
    hauptbild_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Expressionist_painting_bridge_group.jpg/800px-Expressionist_painting_bridge_group.jpg',
    datierung: { jahr_von: 1910, jahr_bis: 1920, jahr_text: 'um 1915' },
    herstellung: { material: 'Öl auf Leinwand', technik: 'Malerei', ort: 'Dresden' },
    physisch: { hoehe: 80, breite: 60, tiefe: 3, gewicht: 4.2 },
    organisation: 'Expressionismus Museum',
    tags: ['Expressionismus', 'Brücke', 'Farben', 'Moderne'],
    ist_highlight: true,
    hat_led_licht: true,
    led_position: { strip_number: 3, led_start: 40, led_end: 49, raum_position: 'Südwand, oben rechts' }
  },
  {
    inventarnummer: 'INV-020',
    titel: 'Moderne Skulptur',
    untertitel: 'Abstrakte Metallskulptur aus dem 21. Jahrhundert',
    kurzbeschreibung: 'Eine zeitgenössische Skulptur aus rostfreiem Stahl mit organischen Formen.',
    beschreibung: 'Diese Skulptur verbindet moderne Materialien mit organischen Formen und schafft einen Dialog zwischen Natur und Technik.',
    hauptbild_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Modern_steel_sculpture_abstract.jpg/800px-Modern_steel_sculpture_abstract.jpg',
    datierung: { jahr_von: 2020, jahr_bis: 2023, jahr_text: '2021' },
    herstellung: { material: 'Rostfreier Stahl', technik: 'Schweißen, Schmieden', ort: 'Berlin' },
    physisch: { hoehe: 200, breite: 80, tiefe: 60, gewicht: 120.0 },
    organisation: 'Museum für Moderne Kunst',
    tags: ['Moderne', 'Stahl', 'Abstrakt', 'Zeitgenössisch'],
    ist_highlight: true,
    hat_led_licht: true,
    led_position: { strip_number: 1, led_start: 40, led_end: 49, raum_position: 'Nordwand, ganz rechts' }
  }
];

async function downloadImage(url, filename) {
  try {
    const response = await fetch(url);
    const buffer = await response.buffer();
    
    // Upload to Sanity
    const asset = await client.assets.upload('image', buffer, {
      filename: filename,
      title: filename.replace('.jpg', '')
    });
    
    return asset;
  } catch (error) {
    console.error(`Error downloading image ${url}:`, error);
    return null;
  }
}

async function createTestExhibits() {
  console.log('Creating test exhibits...');
  
  for (let i = 0; i < testExhibits.length; i++) {
    const exhibit = testExhibits[i];
    console.log(`Creating exhibit ${i + 1}/20: ${exhibit.titel}`);
    
    try {
      // Download and upload image
      let imageAsset = null;
      if (exhibit.hauptbild_url) {
        const filename = `exhibit-${exhibit.inventarnummer}.jpg`;
        imageAsset = await downloadImage(exhibit.hauptbild_url, filename);
        if (imageAsset) {
          console.log(`  ✓ Image uploaded: ${imageAsset._id}`);
        }
      }
      
      // Create exhibit document
      const exhibitDoc = {
        _type: 'exponat',
        inventarnummer: exhibit.inventarnummer,
        titel: exhibit.titel,
        untertitel: exhibit.untertitel,
        kurzbeschreibung: exhibit.kurzbeschreibung,
        beschreibung: exhibit.beschreibung,
        hauptbild: imageAsset ? {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAsset._id
          }
        } : undefined,
        datierung: exhibit.datierung,
        herstellung: exhibit.herstellung,
        physisch: exhibit.physisch,
        organisation: exhibit.organisation,
        tags: exhibit.tags,
        ist_highlight: exhibit.ist_highlight,
        hat_led_licht: exhibit.hat_led_licht,
        led_position: exhibit.led_position,
        reihenfolge: i + 1
      };
      
      const result = await client.create(exhibitDoc);
      console.log(`  ✓ Exhibit created: ${result._id}`);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Error creating exhibit ${exhibit.titel}:`, error);
    }
  }
  
  console.log('Test exhibits creation completed!');
}

// Run the script
createTestExhibits().catch(console.error);
