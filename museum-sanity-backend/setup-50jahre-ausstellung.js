// setup-50jahre-ausstellung.js
// Skript zum Anlegen der "50 Jahre Museumsverein Reutte" Ausstellung

import {createClient} from '@sanity/client';

const client = createClient({
  projectId: '832k5je1',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_AUTH_TOKEN || process.env.SANITY_WRITE_TOKEN,
  apiVersion: '2024-01-01'
});

async function setup50JahreAusstellung() {
  console.log('🎨 Starte Setup für "50 Jahre Museumsverein Reutte"...\n');

  try {
    // 1. Kategorie anlegen
    console.log('📁 Lege Kategorie an...');
    const kategorie = await client.create({
      _type: 'kategorie',
      titel: '50 Jahre Museumsverein',
      slug: {
        _type: 'slug',
        current: '50-jahre-museumsverein'
      },
      beschreibung: 'Jubiläumsausstellung zum 50-jährigen Bestehen des Museumsvereins Reutte',
      icon: '🎉',
      farbe: '#D4AF37', // Gold für Jubiläum
      reihenfolge: 1
    });
    console.log(`✅ Kategorie erstellt: ${kategorie._id}\n`);

    // 2. Ausstellung anlegen
    console.log('🏛️ Lege Ausstellung an...');
    const ausstellung = await client.create({
      _type: 'ausstellung',
      titel: '50 Jahre Museumsverein Reutte',
      untertitel: '1975 - 2025: Eine Erfolgsgeschichte',
      slug: {
        _type: 'slug',
        current: '50-jahre-museumsverein-reutte'
      },
      kurzbeschreibung: 'Feiern Sie mit uns 50 Jahre Engagement für die Bewahrung und Vermittlung der regionalen Geschichte und Kultur. Diese Jubiläumsausstellung präsentiert Highlights aus fünf Jahrzehnten Museumsarbeit.',
      beschreibung: [
        {
          _type: 'block',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Im Jahr 1975 gründeten engagierte Bürgerinnen und Bürger den Museumsverein Reutte mit dem Ziel, das kulturelle Erbe der Region zu bewahren und für kommende Generationen zugänglich zu machen.'
            }
          ]
        },
        {
          _type: 'block',
          style: 'h2',
          children: [
            {
              _type: 'span',
              text: 'Fünf Jahrzehnte Museumsgeschichte'
            }
          ]
        },
        {
          _type: 'block',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Diese Ausstellung nimmt Sie mit auf eine Zeitreise durch 50 Jahre Museumsarbeit. Entdecken Sie besondere Exponate, die im Laufe der Jahre in die Sammlung aufgenommen wurden, erleben Sie Meilensteine der Vereinsgeschichte und lernen Sie die Menschen kennen, die mit ihrer Leidenschaft und ihrem Engagement das Museum zu dem gemacht haben, was es heute ist.'
            }
          ]
        },
        {
          _type: 'block',
          style: 'h3',
          children: [
            {
              _type: 'span',
              text: 'Highlights der Ausstellung'
            }
          ]
        },
        {
          _type: 'block',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: '• Gründungsdokumente und historische Fotografien\n• Ausgewählte Prunkstücke aus fünf Jahrzehnten\n• Multimediale Stationen mit Zeitzeugenberichten\n• Chronik der wichtigsten Ausstellungen und Veranstaltungen\n• Einblicke in die Depotarbeit und Restaurierung'
            }
          ]
        }
      ],
      kategorien: [
        {
          _type: 'reference',
          _ref: kategorie._id
        }
      ],
      zeitraum: {
        typ: 'sonder',
        von: '2025-03-01',
        bis: '2025-12-31',
        zeitraum_text: 'März - Dezember 2025'
      },
      organisation: {
        kurator: 'Museumsverein Reutte',
        ort: 'Hauptausstellungsraum',
        partner: [
          'Gemeinde Reutte',
          'Land Tirol',
          'Sparkasse Reutte'
        ]
      },
      veranstaltungen: [
        {
          titel: 'Festliche Eröffnung',
          datum: '2025-03-15T18:00:00Z',
          beschreibung: 'Feierliche Eröffnung der Jubiläumsausstellung mit Grußworten, Sektempfang und Führung',
          typ: 'eroeffnung'
        },
        {
          titel: 'Zeitzeugengespräch mit Gründungsmitgliedern',
          datum: '2025-04-20T15:00:00Z',
          beschreibung: 'Gründungsmitglieder erzählen von den Anfängen des Museumsvereins',
          typ: 'vortrag'
        },
        {
          titel: 'Öffentliche Führung',
          beschreibung: 'Jeden ersten Sonntag im Monat um 14:00 Uhr',
          typ: 'fuehrung'
        }
      ],
      tags: [
        'Jubiläum',
        '50 Jahre',
        'Museumsverein',
        'Reutte',
        'Geschichte',
        'Chronik',
        'Sonderausstellung'
      ],
      ist_featured: true,
      reihenfolge: 1,
      veroeffentlichung: {
        status: 'vorbereitung',
        veroeffentlicht_am: new Date().toISOString()
      }
    });
    console.log(`✅ Ausstellung erstellt: ${ausstellung._id}\n`);

    // 3. Beispiel-Exponat für die Ausstellung
    console.log('📦 Lege Beispiel-Exponat an...');
    const exponat = await client.create({
      _type: 'exponat',
      inventarnummer: '50J-001',
      titel: 'Gründungsurkunde Museumsverein Reutte',
      untertitel: '15. März 1975',
      kurzbeschreibung: 'Die originale Gründungsurkunde des Museumsvereins Reutte aus dem Jahr 1975, unterzeichnet von den 23 Gründungsmitgliedern.',
      beschreibung: [
        {
          _type: 'block',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Dieses historische Dokument markiert den offiziellen Beginn des Museumsvereins Reutte. Am 15. März 1975 versammelten sich 23 engagierte Bürgerinnen und Bürger im Gemeindesaal, um den Verein zu gründen.'
            }
          ]
        },
        {
          _type: 'block',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Die Gründungsurkunde enthält die ursprünglichen Vereinsstatuten und die Unterschriften aller Gründungsmitglieder. Sie ist nicht nur ein wichtiges Dokument der Vereinsgeschichte, sondern auch ein Zeugnis des kulturellen Engagements in der Region.'
            }
          ]
        }
      ],
      organisation: {
        kategorie: {
          _type: 'reference',
          _ref: kategorie._id
        },
        sammlung: '50 Jahre Museumsverein',
        standort: 'Ausstellung, Vitrine 1'
      },
      datierung: {
        jahr_von: 1975,
        jahr_text: '15. März 1975',
        epoche: 'moderne'
      },
      herstellung: {
        entstehungsort: 'Reutte',
        material: 'Papier',
        technik: 'Schreibmaschine, handschriftliche Unterschriften'
      },
      physisch: {
        masse: 'H: 29,7cm, B: 21cm (DIN A4)',
        zustand: 'gut'
      },
      tags: [
        'Gründung',
        'Dokument',
        'Vereinsgeschichte',
        '1975',
        'Gründungsmitglieder'
      ],
      ist_highlight: true,
      reihenfolge: 1,
      veroeffentlichung: {
        status: 'veroeffentlicht'
      }
    });
    console.log(`✅ Exponat erstellt: ${exponat._id}\n`);

    // 4. Exponat mit Ausstellung verknüpfen
    console.log('🔗 Verknüpfe Exponat mit Ausstellung...');
    await client
      .patch(ausstellung._id)
      .setIfMissing({exponate: []})
      .setIfMissing({highlight_exponate: []})
      .append('exponate', [{_type: 'reference', _ref: exponat._id, _key: `exp-${Date.now()}`}])
      .append('highlight_exponate', [{_type: 'reference', _ref: exponat._id, _key: `hl-${Date.now()}`}])
      .commit();
    console.log('✅ Verknüpfung erstellt\n');

    console.log('🎉 Setup erfolgreich abgeschlossen!\n');
    console.log('─────────────────────────────────────────');
    console.log('📋 Zusammenfassung:');
    console.log(`   • Kategorie: ${kategorie.titel}`);
    console.log(`   • Ausstellung: ${ausstellung.titel}`);
    console.log(`   • Beispiel-Exponat: ${exponat.titel}`);
    console.log('─────────────────────────────────────────\n');
    console.log('🌐 Öffne Sanity Studio, um weitere Inhalte hinzuzufügen:');
    console.log('   Local:  http://localhost:3333/');
    console.log('   Online: https://museumghbackend.sanity.studio/\n');

  } catch (error) {
    console.error('❌ Fehler beim Setup:', error.message);
    if (error.response) {
      console.error('Response:', error.response.body);
    }
    process.exit(1);
  }
}

// Skript ausführen
setup50JahreAusstellung();
