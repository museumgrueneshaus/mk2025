/**
 * Seed-Script: 12 reichhaltige Sample-Exponate für Museum im Grünen Haus
 *
 * Nutzung:
 *   cd sanity-cms
 *   npx sanity login          (falls nicht eingeloggt)
 *   npx sanity exec migrations/seed-exponate.mjs --with-user-token
 */

import { createClient } from '@sanity/client'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '832k5je1'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_AUTH_TOKEN,
})

// ── Helper: Portable Text block ──
function block(text, style = 'normal', marks = []) {
  return {
    _type: 'block',
    _key: Math.random().toString(36).slice(2, 10),
    style,
    markDefs: [],
    children: [{ _type: 'span', _key: Math.random().toString(36).slice(2, 10), text, marks }],
  }
}

function blocks(...paragraphs) {
  return paragraphs.map(p => {
    if (typeof p === 'string') return block(p)
    return block(p.text, p.style || 'normal', p.marks || [])
  })
}

// ── 12 Sample Exponate ──
const exponate = [
  {
    inventarnummer: 'MGH-001',
    titel: 'Römischer Meilenstein der Via Claudia Augusta',
    untertitel: 'Fragment eines Straßensteins aus dem 2. Jahrhundert',
    kurzbeschreibung: 'Dieser Meilenstein markierte einst die Entfernung entlang der Via Claudia Augusta, der bedeutendsten römischen Handelsroute über die Alpen. Er wurde 1956 bei Straßenbauarbeiten nahe Reutte gefunden.',
    beschreibung: blocks(
      'Dieser Meilenstein ist eines der bedeutendsten archäologischen Zeugnisse der römischen Präsenz im Außerfern. Die Via Claudia Augusta, erbaut unter Kaiser Claudius im Jahr 47 n. Chr., verband die Poebene mit der Donau und war die wichtigste Handels- und Militärroute über die Alpen.',
      'Die lateinische Inschrift auf dem Stein gibt die Entfernung zur nächsten Siedlung an und nennt den regierenden Kaiser. Trotz der Verwitterung über fast zwei Jahrtausende sind wesentliche Teile der Inschrift noch lesbar.',
      { text: 'Fundgeschichte', style: 'h2' },
      'Der Stein wurde am 14. September 1956 bei Kanalbauarbeiten in der Nähe von Lermoos entdeckt. Er lag in etwa 1,80 Meter Tiefe und war von einer Schotterschicht bedeckt, die ihn über Jahrhunderte konserviert hatte.',
      'Die Bergung erfolgte unter Aufsicht des Tiroler Landesmuseums Ferdinandeum. Der Meilenstein gilt als einer der am besten erhaltenen seiner Art nördlich des Brenners.'
    ),
    datierung: { jahr_von: 100, jahr_bis: 200, jahr_text: '2. Jahrhundert n. Chr.', epoche: 'antike' },
    herstellung: { entstehungsort: 'Nordtirol', material: 'Kalkstein', technik: 'Steinmetzarbeit, Meißelung' },
    physisch: { masse: 'H: 127 cm, B: 48 cm, T: 42 cm', gewicht: 'ca. 320 kg', zustand: 'befriedigend', zustand_bemerkung: 'Oberer Teil abgebrochen, Inschrift teilweise verwittert' },
    tags: ['Römisch', 'Archäologie', 'Via Claudia Augusta', 'Straße', 'Inschrift', 'Antike'],
    ist_highlight: true,
    veroeffentlichung: { status: 'veroeffentlicht' },
    organisation: { standort: 'Erdgeschoss, Raum 1 – Römerzeit', sammlung: 'Dauerausstellung', erwerbung: { art: 'fund', datum: '1956-09-14' } },
  },
  {
    inventarnummer: 'MGH-002',
    titel: 'Tiroler Bauernschrank',
    untertitel: 'Bemalter Kastenschrank aus dem Lechtal',
    kurzbeschreibung: 'Ein prächtig bemalter Bauernschrank aus dem 18. Jahrhundert mit floralen Motiven und religiösen Darstellungen. Er stammt aus einem Bauernhof im Lechtal und zeigt die typische Tiroler Volkskunst.',
    beschreibung: blocks(
      'Dieser zweitürige Kastenschrank ist ein herausragendes Beispiel der Tiroler Bauernmalerei des 18. Jahrhunderts. Die Vorderseite zeigt auf blauem Grund aufwendige Blumenranken, die symmetrisch um zwei zentrale Medaillons angeordnet sind.',
      'Die Medaillons auf den Türen zeigen Darstellungen der Heiligen Notburga und des Heiligen Isidor – beides Schutzheilige der Landwirtschaft, die in Tirol besonders verehrt wurden.',
      { text: 'Handwerkliche Besonderheiten', style: 'h2' },
      'Der Schrank wurde aus massivem Zirbenholz gefertigt, das für sein angenehmes Aroma und seine hervorragende Bearbeitbarkeit geschätzt wird. Die Konstruktion mit Schwalbenschwanzverbindungen und handgeschmiedeten Eisenbeschlägen zeugt von hoher handwerklicher Qualität.',
      'Die Bemalung erfolgte in Kaseintemperatechnik direkt auf das grundierte Holz. Die leuchtenden Farben – insbesondere das charakteristische Tiroler Blau – haben sich über zweieinhalb Jahrhunderte erstaunlich gut erhalten.'
    ),
    datierung: { jahr_von: 1740, jahr_bis: 1760, jahr_text: 'Mitte 18. Jh.', epoche: 'fruehe_neuzeit' },
    herstellung: { kuenstler: 'Unbekannter Lechtaler Meister', entstehungsort: 'Lechtal, Tirol', material: 'Zirbenholz, Eisen, Kaseinfarben', technik: 'Tischlerarbeit, Kaseinmalerei' },
    physisch: { masse: 'H: 185 cm, B: 145 cm, T: 58 cm', gewicht: 'ca. 85 kg', zustand: 'gut', zustand_bemerkung: 'Kleine Fehlstellen in der Bemalung, ein Beschlag erneuert' },
    tags: ['Bauernmalerei', 'Möbel', 'Volkskunst', 'Lechtal', 'Zirbenholz', 'Tracht'],
    ist_highlight: true,
    veroeffentlichung: { status: 'veroeffentlicht' },
    organisation: { standort: 'Obergeschoss, Raum 3 – Volkskunst', sammlung: 'Dauerausstellung' },
  },
  {
    inventarnummer: 'MGH-003',
    titel: 'Gotisches Kruzifix aus der Pfarrkirche Breitenwang',
    untertitel: 'Geschnitzte Christusfigur, Lindenholz',
    kurzbeschreibung: 'Ein eindrucksvolles spätgotisches Kruzifix aus der Zeit um 1480. Die ausdrucksstarke Schnitzarbeit zeigt den leidenden Christus und wird einem Schüler der Multscher-Werkstatt zugeschrieben.',
    beschreibung: blocks(
      'Dieses spätgotische Kruzifix gehört zu den bedeutendsten sakralen Kunstwerken der Region. Die Christusfigur ist aus einem einzelnen Lindenholzblock geschnitzt und zeigt eine für die Spätgotik typische, expressiv-leidende Darstellung.',
      'Die anatomische Gestaltung des Körpers, insbesondere die detaillierte Muskulatur und die gespannten Sehnen der Hände, zeugen von einer meisterhaften Beherrschung der Schnitztechnik. Das Gesicht drückt stilles Leiden aus, die Augen sind halb geschlossen.',
      { text: 'Stilistische Einordnung', style: 'h2' },
      'Die Formensprache weist deutliche Parallelen zu Arbeiten aus dem Umkreis Hans Multschers auf, einem der bedeutendsten Bildhauer der Spätgotik. Kunsthistoriker vermuten, dass der Meister seine Ausbildung in Ulm oder Augsburg erhalten hat.',
      'Die originale Fassung – eine Polychromie in naturalistischen Farbtönen – ist unter späteren Übermalungen teilweise erhalten. Eine Untersuchung mit Infrarotreflektographie hat Spuren der ursprünglichen Bemalung sichtbar gemacht.'
    ),
    datierung: { jahr_von: 1470, jahr_bis: 1490, jahr_text: 'um 1480', epoche: 'mittelalter' },
    herstellung: { kuenstler: 'Umkreis Hans Multscher', entstehungsort: 'Schwaben/Tirol', material: 'Lindenholz, Reste von Polychromie', technik: 'Holzschnitzerei, gefasst' },
    physisch: { masse: 'H: 92 cm, B: 68 cm', gewicht: 'ca. 4,5 kg', zustand: 'gut', zustand_bemerkung: 'Finger der linken Hand fehlen, spätere Übermalung teilweise abgenommen' },
    tags: ['Gotik', 'Sakralkunst', 'Skulptur', 'Schnitzerei', 'Kruzifix', 'Breitenwang'],
    ist_highlight: true,
    veroeffentlichung: { status: 'veroeffentlicht' },
    organisation: { standort: 'Obergeschoss, Raum 2 – Sakrale Kunst', sammlung: 'Dauerausstellung', leihgeber: 'Pfarrei Breitenwang' },
  },
  {
    inventarnummer: 'MGH-004',
    titel: 'Salzhandels-Urkunde',
    untertitel: 'Privilegienbrief des Salzhandels über den Fernpass',
    kurzbeschreibung: 'Diese Pergamenturkunde aus dem Jahr 1432 gewährt den Reuttener Bürgern das Recht zum Salztransport über den Fernpass. Sie ist ein Schlüsseldokument für die Wirtschaftsgeschichte der Region.',
    beschreibung: blocks(
      'Die Urkunde wurde am 12. Mai 1432 von Herzog Friedrich IV. von Tirol ausgestellt und gewährt den Bürgern von Reutte weitreichende Privilegien im Salzhandel. Der Salzhandel war über Jahrhunderte die wirtschaftliche Lebensader des Außerfern.',
      'Das Dokument ist auf Pergament geschrieben und mit dem herzoglichen Wachssiegel versehen. Der Text in frühneuhochdeutscher Kanzleisprache beschreibt detailliert die Handelsrechte, die Transportwege und die zu entrichtenden Zölle.',
      { text: 'Historische Bedeutung', style: 'h2' },
      'Der Fernpass war eine der wichtigsten Handelsrouten zwischen dem Inntal und dem Allgäu. Salz aus Hall in Tirol wurde über diese Route nach Süddeutschland transportiert und brachte der Region enormen Wohlstand.',
      'Reutte entwickelte sich dank dieser Privilegien zu einem bedeutenden Handelsplatz. Die in der Urkunde festgeschriebenen Rechte waren die Grundlage für die Blütezeit der Stadt im 15. und 16. Jahrhundert.'
    ),
    datierung: { jahr_von: 1432, jahr_text: '12. Mai 1432', epoche: 'mittelalter' },
    herstellung: { entstehungsort: 'Innsbruck', material: 'Pergament, Wachssiegel, Tinte', technik: 'Handschrift, Kanzleischrift' },
    physisch: { masse: 'H: 42 cm, B: 56 cm', zustand: 'gut', zustand_bemerkung: 'Siegel leicht beschädigt, Pergament gut erhalten, kleine Wurmspuren am Rand' },
    tags: ['Urkunde', 'Salzhandel', 'Fernpass', 'Mittelalter', 'Handel', 'Pergament'],
    veroeffentlichung: { status: 'veroeffentlicht' },
    organisation: { standort: 'Erdgeschoss, Raum 2 – Handelsgeschichte', sammlung: 'Dauerausstellung' },
  },
  {
    inventarnummer: 'MGH-005',
    titel: 'Fossiler Ammonit aus den Lechtaler Alpen',
    untertitel: 'Arietites bucklandi, unterer Jura',
    kurzbeschreibung: 'Ein beeindruckend erhaltener Ammonit aus der Jurazeit, gefunden in den Lechtaler Alpen. Das Fossil dokumentiert, dass die heutigen Alpengipfel einst am Grund eines tropischen Meeres lagen.',
    beschreibung: blocks(
      'Dieser großformatige Ammonit der Gattung Arietites bucklandi wurde in einer Kalksteinschicht auf über 2.200 Metern Höhe in den Lechtaler Alpen entdeckt. Er ist etwa 190 Millionen Jahre alt und stammt aus dem unteren Jura.',
      'Die spiralförmig gewundene Schale zeigt deutlich die charakteristischen Rippen und den kantigen Querschnitt der Gattung. Der Erhaltungszustand ist außergewöhnlich – selbst die feine Struktur der Kammerwände ist sichtbar.',
      { text: 'Was sind Ammoniten?', style: 'h2' },
      'Ammoniten waren Kopffüßer (Cephalopoden), die mit den heutigen Tintenfischen und Nautilus verwandt sind. Sie lebten in den Ozeanen des Erdmittelalters und starben zusammen mit den Dinosauriern vor 66 Millionen Jahren aus.',
      'Ihr Fund in alpinen Höhenlagen beweist eindrucksvoll die gewaltigen tektonischen Kräfte, die die Alpen im Laufe von Jahrmillionen emporgehoben haben. Was einst Meeresboden war, bildet heute die höchsten Gipfel Tirols.'
    ),
    datierung: { jahr_von: -190000000, jahr_text: 'ca. 190 Mio. Jahre (unterer Jura)', epoche: 'vorgeschichte' },
    herstellung: { entstehungsort: 'Lechtaler Alpen, Tirol', material: 'Kalkstein (fossilisiert)', technik: 'Natürliche Fossilisation' },
    physisch: { masse: 'Durchmesser: 38 cm, T: 12 cm', gewicht: 'ca. 8,2 kg', zustand: 'sehr_gut' },
    tags: ['Fossil', 'Geologie', 'Ammonit', 'Jura', 'Alpen', 'Paläontologie'],
    ist_highlight: true,
    veroeffentlichung: { status: 'veroeffentlicht' },
    organisation: { standort: 'Erdgeschoss, Raum 4 – Geologie', sammlung: 'Dauerausstellung', erwerbung: { art: 'schenkung', person: 'Alpenverein Reutte' } },
  },
  {
    inventarnummer: 'MGH-006',
    titel: 'Bergbau-Gezähe aus dem Silberbergwerk',
    untertitel: 'Schlägel, Eisen und Geleucht',
    kurzbeschreibung: 'Ein vollständiges Set historischer Bergbauwerkzeuge aus dem ehemaligen Silberbergwerk bei Biberwier. Die Werkzeuge dokumentieren den Bergbau im Außerfern, der vom 15. bis 18. Jahrhundert betrieben wurde.',
    beschreibung: blocks(
      'Diese Sammlung von Bergbauwerkzeugen umfasst einen Schlägel (Fäustel), drei verschiedene Bergeisen, ein Geleucht (Grubenlampe) und eine Erztrage. Die Werkzeuge stammen aus dem Silberbergwerk bei Biberwier, das von etwa 1480 bis 1760 in Betrieb war.',
      'Der Schlägel besteht aus geschmiedetem Eisen mit einem Eschenholzstiel und zeigt deutliche Gebrauchsspuren. Die Bergeisen in verschiedenen Größen dienten zum Herausarbeiten des Erzes aus dem Gestein.',
      { text: 'Bergbau im Außerfern', style: 'h2' },
      'Der Silberbergbau war neben dem Salzhandel die zweite wirtschaftliche Säule der Region. Die Erzvorkommen bei Biberwier und am Fernpass zogen im 15. Jahrhundert Bergleute aus ganz Tirol und Sachsen an.',
      'Die harte Arbeit unter Tage wurde oft von Kindern und Jugendlichen verrichtet. Ein Bergmann arbeitete täglich bis zu 12 Stunden bei Kerzenlicht in engen Stollen. Die hier gezeigte Öllampe (Geleucht) war dabei das einzige Licht.'
    ),
    datierung: { jahr_von: 1550, jahr_bis: 1650, jahr_text: '16./17. Jh.', epoche: 'fruehe_neuzeit' },
    herstellung: { entstehungsort: 'Biberwier, Tirol', material: 'Eisen (geschmiedet), Eschenholz, Messing', technik: 'Schmiedearbeit, Holzschnitzerei' },
    physisch: { masse: 'Schlägel: L 32 cm; Bergeisen: L 25–40 cm; Geleucht: H 18 cm', zustand: 'befriedigend', zustand_bemerkung: 'Korrosion an Metallteilen, ein Holzstiel erneuert, Geleucht vollständig' },
    tags: ['Bergbau', 'Werkzeug', 'Silber', 'Biberwier', 'Handwerk', 'Arbeit'],
    veroeffentlichung: { status: 'veroeffentlicht' },
    organisation: { standort: 'Erdgeschoss, Raum 3 – Bergbau', sammlung: 'Dauerausstellung', erwerbung: { art: 'schenkung', datum: '1982-03-20', person: 'Gemeinde Biberwier' } },
  },
  {
    inventarnummer: 'MGH-007',
    titel: 'Außerferner Frauentracht',
    untertitel: 'Festtagstracht aus dem 19. Jahrhundert',
    kurzbeschreibung: 'Eine vollständige Frauentracht aus dem Außerfern, bestehend aus Mieder, Rock, Schürze, Bluse und Kopfbedeckung. Die aufwendige Stickerei macht sie zu einem Prunkstück der regionalen Textilkunst.',
    beschreibung: blocks(
      'Diese Festtagstracht gehört zu den am vollständigsten erhaltenen Beispielen der Außerferner Trachtenmode des 19. Jahrhunderts. Sie besteht aus einem bestickten Mieder aus schwarzem Samt, einem plissierten Rock aus dunkelgrünem Wollstoff, einer weißen Leinenschürze mit Spitzensaum und einer gestärkten Hemdbluse.',
      'Das Mieder zeigt eine aufwendige Goldstickerei mit floralen Motiven – Edelweiß, Enzian und Almrosen. Die Stickarbeit wurde in Anlegetechnik ausgeführt, bei der Goldfäden auf den Stoff gelegt und mit feinen Seidenfäden fixiert werden.',
      { text: 'Die Kopfbedeckung', style: 'h2' },
      'Besonders bemerkenswert ist die dazugehörige Riegelhaube, eine kunstvoll gefaltete und bestickte Haube, die den Familienstand der Trägerin anzeigte. Diese Haube aus schwarzer Seide mit Goldborte wurde von verheirateten Frauen zu kirchlichen Festtagen getragen.',
      'Die Tracht wurde laut Familienüberlieferung um 1860 von einer Schneiderin in Reutte angefertigt und bis in die 1920er Jahre bei Fronleichnamsprozessionen und Hochzeiten getragen.'
    ),
    datierung: { jahr_von: 1855, jahr_bis: 1865, jahr_text: 'um 1860', epoche: 'neuzeit' },
    herstellung: { kuenstler: 'Schneiderin in Reutte (Name unbekannt)', entstehungsort: 'Reutte, Tirol', material: 'Samt, Wolle, Leinen, Seide, Goldfaden', technik: 'Schneiderei, Goldstickerei, Anlegetechnik' },
    physisch: { masse: 'Mieder: Gr. 38; Rock: L 98 cm; Haube: 22 × 18 cm', zustand: 'gut', zustand_bemerkung: 'Leichte Verfärbungen an der Schürze, ein Knopf am Mieder fehlt, Goldfäden teilweise angelaufen' },
    tags: ['Tracht', 'Textil', 'Stickerei', 'Außerfern', 'Frauentracht', 'Volkskultur'],
    veroeffentlichung: { status: 'veroeffentlicht' },
    organisation: { standort: 'Obergeschoss, Raum 3 – Volkskunst', sammlung: 'Dauerausstellung', erwerbung: { art: 'schenkung', datum: '1975-11-08', person: 'Familie Kerber, Reutte' } },
  },
  {
    inventarnummer: 'MGH-008',
    titel: 'Historische Karte des Außerfern',
    untertitel: 'Kupferstich von Peter Anich und Blasius Hueber',
    kurzbeschreibung: 'Ein kolorierter Kupferstich aus dem berühmten Atlas Tyrolensis von 1774. Die Karte zeigt das Außerfern mit erstaunlicher Genauigkeit und gilt als Meilenstein der alpinen Kartografie.',
    beschreibung: blocks(
      'Dieses Kartenblatt ist ein Originalabzug aus dem Atlas Tyrolensis, dem ersten wissenschaftlich vermessenen Atlas Tirols. Er wurde von dem Bauernsohn und Autodidakten Peter Anich und seinem Schüler Blasius Hueber erstellt.',
      'Die Karte zeigt das Gebiet des Außerfern – von Reutte und dem Lechtal über den Fernpass bis zum Plansee. Bemerkenswert ist die detaillierte Darstellung der Gebirgsformationen, die Anich mit einer innovativen Schraffurtechnik realisierte.',
      { text: 'Peter Anich – der Bauernkartograph', style: 'h2' },
      'Peter Anich (1723–1766) aus Oberperfuss gilt als einer der bedeutendsten Kartografen der Alpen. Als einfacher Bauernsohn brachte er sich Mathematik und Astronomie selbst bei und begann mit 36 Jahren die systematische Vermessung Tirols.',
      'Er durchmaß das Land zu Fuß, oft bei widrigsten Bedingungen, und erfasste mit selbst gebauten Instrumenten Höhen und Entfernungen. Die resultierende Karte war so präzise, dass sie bis ins 19. Jahrhundert als Standardwerk galt.'
    ),
    datierung: { jahr_von: 1774, jahr_text: '1774', epoche: 'fruehe_neuzeit' },
    herstellung: { kuenstler: 'Peter Anich & Blasius Hueber', entstehungsort: 'Innsbruck (Druck)', material: 'Büttenpapier, Kupferstich, Aquarellfarben', technik: 'Kupferstich, handkoloriert' },
    physisch: { masse: 'H: 52 cm, B: 68 cm (Blatt)', zustand: 'gut', zustand_bemerkung: 'Leichte Bräunung des Papiers, minimale Knickspuren, Kolorierung gut erhalten' },
    tags: ['Karte', 'Kartografie', 'Peter Anich', 'Außerfern', 'Atlas Tyrolensis', 'Kupferstich'],
    veroeffentlichung: { status: 'veroeffentlicht' },
    organisation: { standort: 'Obergeschoss, Raum 1 – Kartografie', sammlung: 'Dauerausstellung', erwerbung: { art: 'kauf', datum: '1968-06-15' } },
  },
  {
    inventarnummer: 'MGH-009',
    titel: 'Votivtafel „Wunder am Plansee"',
    untertitel: 'Ölgemälde auf Holz',
    kurzbeschreibung: 'Eine naive Votivtafel aus dem Jahr 1823, die eine wundersame Rettung am Plansee darstellt. Solche Tafeln wurden als Dank für göttliche Hilfe in Notlagen gestiftet.',
    beschreibung: blocks(
      'Die Votivtafel zeigt im oberen Register die Muttergottes auf einer Wolke, im unteren Register eine dramatische Szene: Ein Floß mit drei Personen gerät auf dem Plansee in einen Sturm. Die Inschrift am unteren Rand berichtet von der Rettung.',
      'Die Malerei im naiven Volkskunststil ist in kräftigen Farben auf eine grundierte Holztafel aufgetragen. Die Perspektive ist bewusst vereinfacht – die Figuren sind übergroß im Verhältnis zum See dargestellt, um ihre Bedeutung hervorzuheben.',
      { text: 'Inschrift', style: 'h2' },
      { text: '„Den 4. Julj 1823 hat sich der Joh. Geörg Bader mit seiner Frau u. Sohn auf dem Plansee befunden, als ein ungestümes Wetter aufkam u. das Floß zu kentern drohete. In höchster Noth haben sie die hl. Muttergottes angeruffen u. sind wunderbar errettet worden. Ex Voto."', style: 'blockquote' },
      'Votivtafeln sind ein wichtiger Bestandteil der alpinen Volkskultur. Sie wurden als Dankgabe an Wallfahrtskirchen oder Kapellen gestiftet und dokumentieren nicht nur den persönlichen Glauben, sondern auch historische Ereignisse, Unfälle und Naturkatastrophen.'
    ),
    datierung: { jahr_von: 1823, jahr_text: '1823', epoche: 'neuzeit' },
    herstellung: { entstehungsort: 'Außerfern, Tirol', material: 'Fichtenholz, Ölfarbe', technik: 'Ölmalerei auf grundiertem Holz' },
    physisch: { masse: 'H: 28 cm, B: 36 cm, T: 2 cm', gewicht: 'ca. 850 g', zustand: 'befriedigend', zustand_bemerkung: 'Riss im Holz (restauriert), Farbe stellenweise abgeblättert, Inschrift vollständig lesbar' },
    tags: ['Votivtafel', 'Volkskunst', 'Plansee', 'Malerei', 'Wallfahrt', 'Religiöse Kunst'],
    veroeffentlichung: { status: 'veroeffentlicht' },
    organisation: { standort: 'Obergeschoss, Raum 2 – Sakrale Kunst', sammlung: 'Dauerausstellung', erwerbung: { art: 'schenkung', person: 'Pfarrei Heiterwang' } },
  },
  {
    inventarnummer: 'MGH-010',
    titel: 'Zunftzeichen der Schmiede von Reutte',
    untertitel: 'Schmiedeeisernes Aushängeschild',
    kurzbeschreibung: 'Ein kunstvoll geschmiedetes Zunftzeichen der Reuttener Schmiede aus dem 17. Jahrhundert. Das filigrane Eisenwerk zeigt gekreuzte Hämmer, einen Amboss und ornamentale Ranken.',
    beschreibung: blocks(
      'Dieses Zunftzeichen hing über drei Jahrhunderte am Zunfthaus der Schmiede in der Reuttener Obermarktstraße. Es zeigt die klassischen Symbole des Schmiedehandwerks – gekreuzte Hämmer über einem Amboss – eingerahmt von kunstvollen Ranken und Blättern aus Schmiedeeisen.',
      'Die außergewöhnliche Qualität der Eisenarbeit dokumentiert die hohe Kunstfertigkeit der Reuttener Schmiede, die weit über die Region hinaus bekannt waren. Jedes Blatt und jede Ranke wurde einzeln geschmiedet und dann zusammengenietet.',
      { text: 'Das Schmiedehandwerk in Reutte', style: 'h2' },
      'Die Schmiede gehörten zu den angesehensten Handwerkern im Außerfern. Ihre Zunft, gegründet im Jahr 1587, umfasste Huf-, Waffen- und Kunstschmiede. Die günstige Lage an den Handelsrouten und die Nähe zu den Erzlagerstätten bei Biberwier begünstigten das Handwerk.',
      'Mit dem Niedergang des Bergbaus und der Industrialisierung im 19. Jahrhundert verlor die Zunft an Bedeutung. Das Zunfthaus wurde 1895 abgerissen. Dieses Zeichen wurde vom letzten Zunftmeister dem Museum übergeben.'
    ),
    datierung: { jahr_von: 1620, jahr_bis: 1650, jahr_text: '1. Hälfte 17. Jh.', epoche: 'fruehe_neuzeit' },
    herstellung: { entstehungsort: 'Reutte, Tirol', material: 'Schmiedeeisen', technik: 'Handschmiedearbeit, Nietverzierung' },
    physisch: { masse: 'H: 78 cm, B: 62 cm', gewicht: 'ca. 12 kg', zustand: 'gut', zustand_bemerkung: 'Oberflächenpatina, zwei Rankenenden ergänzt (Restaurierung 1965)' },
    tags: ['Zunft', 'Schmied', 'Handwerk', 'Eisen', 'Schild', 'Reutte'],
    veroeffentlichung: { status: 'veroeffentlicht' },
    organisation: { standort: 'Erdgeschoss, Raum 3 – Handwerk', sammlung: 'Dauerausstellung', erwerbung: { art: 'schenkung', datum: '1895-10-01', person: 'Zunftmeister Johann Hafele' } },
  },
  {
    inventarnummer: 'MGH-011',
    titel: 'Gründungsurkunde des Museumsvereins',
    untertitel: 'Dokument der Vereinsgründung 1975',
    kurzbeschreibung: 'Am 15. März 1975 gründeten 23 engagierte Bürger den Museumsverein Reutte. Diese Gründungsurkunde mit allen Originalunterschriften markiert den Beginn der institutionellen Museumsarbeit im Außerfern.',
    beschreibung: blocks(
      'Dieses historische Dokument markiert den offiziellen Beginn des Museumsvereins Reutte. Am 15. März 1975 versammelten sich 23 engagierte Bürgerinnen und Bürger im Gemeindesaal, um den Verein zu gründen.',
      'Die Gründungsurkunde enthält die ursprünglichen Vereinsstatuten und die Unterschriften aller Gründungsmitglieder. Sie ist nicht nur ein wichtiges Dokument der Vereinsgeschichte, sondern auch ein Zeugnis des kulturellen Engagements in der Region.',
      { text: 'Die Vision der Gründer', style: 'h2' },
      'Die Gründungsmitglieder hatten die Vision, die reiche Geschichte und Kultur des Außerfern in einem zentralen Museum zu bewahren und der Öffentlichkeit zugänglich zu machen. Viele historische Objekte drohten damals in Vergessenheit zu geraten oder in private Sammlungen zu verschwinden.',
      'Der erste Vorsitzende, Dr. Karl Stotter, formulierte das Ziel: „Ein lebendiges Museum, das nicht nur bewahrt, sondern auch erzählt – von den Menschen, die hier gelebt und gewirkt haben." Diese Vision leitet das Museum im Grünen Haus bis heute.'
    ),
    datierung: { jahr_von: 1975, jahr_text: '15. März 1975', epoche: 'moderne' },
    herstellung: { entstehungsort: 'Reutte', material: 'Papier', technik: 'Schreibmaschine, handschriftliche Unterschriften' },
    physisch: { masse: 'A4 (21 × 29,7 cm), 3 Seiten', zustand: 'sehr_gut', zustand_bemerkung: 'Sehr gut erhalten, im Archivkarton aufbewahrt' },
    tags: ['Gründung', 'Dokument', 'Vereinsgeschichte', '1975', 'Museumsverein', 'Reutte'],
    veroeffentlichung: { status: 'veroeffentlicht' },
    organisation: { standort: 'Obergeschoss, Vitrine – Museumsgeschichte', sammlung: 'Vereinsarchiv' },
  },
  {
    inventarnummer: 'MGH-012',
    titel: 'Modell der Burg Ehrenberg',
    untertitel: 'Maßstabsgetreues Architekturmodell 1:100',
    kurzbeschreibung: 'Ein detailgetreues Modell der Burganlage Ehrenberg bei Reutte, wie sie im 17. Jahrhundert ausgesehen hat. Das Modell wurde anhand historischer Pläne und archäologischer Befunde rekonstruiert.',
    beschreibung: blocks(
      'Dieses maßstabsgetreue Modell (1:100) zeigt die Burganlage Ehrenberg in ihrem Zustand um 1650 – auf dem Höhepunkt ihrer militärischen Bedeutung. Die Anlage umfasst die Hauptburg, die Vorburg, die Claudia-Bastionen und die Zollstation am Talgrund.',
      'Das Modell wurde in über 800 Arbeitsstunden von dem Reuttener Modellbauer Hans Lechleitner gefertigt. Es basiert auf den Ergebnissen der archäologischen Grabungen seit 2002 und historischen Plänen aus dem Tiroler Landesarchiv.',
      { text: 'Die Burg Ehrenberg', style: 'h2' },
      'Ehrenberg war eine der mächtigsten Festungsanlagen der Alpen. Die Burg sicherte die wichtige Handelsroute über den Fernpass und kontrollierte den Zugang zum Lechtal. Im Dreißigjährigen Krieg und im Spanischen Erbfolgekrieg wurde sie mehrfach belagert.',
      'Nach ihrer Aufgabe als Festung im 18. Jahrhundert verfiel die Anlage zusehends. Seit 1993 wird Ehrenberg als „Burgenensemble" restauriert und touristisch erschlossen. Die 2014 eröffnete Hängebrücke „highline179" verbindet heute die Burgruine mit dem Fort Claudia.',
      { text: 'Modelltechnik', style: 'h3' },
      'Das Modell besteht aus lasergeschnittenem Holz, Gips und handbemalten Details. Besonders aufwendig war die Nachbildung der Claudia-Bastionen mit ihren sternförmigen Grundrissen nach italienischem Vorbild.'
    ),
    datierung: { jahr_von: 2015, jahr_text: '2015 (Modellbau)', epoche: 'zeitgenoessisch' },
    herstellung: { kuenstler: 'Hans Lechleitner', entstehungsort: 'Reutte, Tirol', material: 'Holz (Linde, Buche), Gips, Acrylfarben, Moos', technik: 'Modellbau, Laserzuschnitt, Handbemalung' },
    physisch: { masse: 'L: 120 cm, B: 80 cm, H: 45 cm', gewicht: 'ca. 15 kg', zustand: 'sehr_gut' },
    tags: ['Modell', 'Burg Ehrenberg', 'Architektur', 'Festung', 'Reutte', 'Rekonstruktion'],
    ist_highlight: true,
    veroeffentlichung: { status: 'veroeffentlicht' },
    organisation: { standort: 'Erdgeschoss, Foyer', sammlung: 'Dauerausstellung', erwerbung: { art: 'kauf', datum: '2015-09-01', person: 'Hans Lechleitner' } },
  },
]

// ── Main ──
async function main() {
  console.log('🏛️  Museum im Grünen Haus – Exponate Seed\n')

  // 1. Fetch existing image assets to reuse
  console.log('📸 Sammle bestehende Bild-Assets…')
  const existing = await client.fetch(
    `*[_type=="exponat"]{_id, hauptbild{asset}}`
  )
  const imageRefs = existing
    .map(e => e.hauptbild?.asset?._ref)
    .filter(Boolean)

  console.log(`   ${imageRefs.length} Bilder gefunden\n`)

  // 2. Clear references from Ausstellung documents first
  console.log('🔗 Entferne Referenzen aus Ausstellungen…')
  const ausstellungen = await client.fetch(`*[_type=="ausstellung"]{_id, exponate}`)
  if (ausstellungen.length > 0) {
    const txRef = client.transaction()
    ausstellungen.forEach(a => {
      if (a.exponate && a.exponate.length > 0) {
        txRef.patch(a._id, { set: { exponate: [] } })
        console.log(`   ✓ ${a._id} – Referenzen entfernt`)
      }
    })
    await txRef.commit()
  }

  // Also clear kioskDevice references
  const kiosks = await client.fetch(`*[_type=="kioskDevice"]{_id, ausstellung}`)
  // Don't touch kiosk references for now – they reference ausstellung, not exponat

  // 3. Delete ALL existing exponate
  console.log('\n🗑️  Lösche alle bestehenden Exponate…')
  const allIds = existing.map(e => e._id)
  if (allIds.length > 0) {
    // Delete one by one to handle any remaining references
    for (const id of allIds) {
      try {
        await client.delete(id)
        console.log(`   ✓ ${id}`)
      } catch (err) {
        console.log(`   ⚠ ${id} – ${err.message?.slice(0, 80)}`)
      }
    }
    console.log(`   ${allIds.length} Exponate verarbeitet\n`)
  } else {
    console.log('   Keine vorhanden\n')
  }

  // 3. Create 12 new exponate
  console.log('✨ Erstelle 12 neue Exponate…')
  const tx = client.transaction()

  exponate.forEach((exp, i) => {
    // Assign an existing image if available (cycle through)
    const imgRef = imageRefs.length > 0 ? imageRefs[i % imageRefs.length] : null

    const doc = {
      _type: 'exponat',
      inventarnummer: exp.inventarnummer,
      titel: exp.titel,
      untertitel: exp.untertitel || undefined,
      kurzbeschreibung: exp.kurzbeschreibung,
      beschreibung: exp.beschreibung,
      datierung: exp.datierung,
      herstellung: exp.herstellung,
      physisch: exp.physisch || undefined,
      tags: exp.tags || [],
      ist_highlight: exp.ist_highlight || false,
      veroeffentlichung: exp.veroeffentlichung || { status: 'entwurf' },
      organisation: exp.organisation || undefined,
    }

    // Add hauptbild if we have an image
    if (imgRef) {
      doc.hauptbild = {
        _type: 'image',
        asset: { _type: 'reference', _ref: imgRef },
        bildnachweis: 'Museum im Grünen Haus',
      }
    }

    tx.create(doc)
    console.log(`   ✓ ${exp.inventarnummer} – ${exp.titel}`)
  })

  await tx.commit()
  console.log(`\n🎉 Fertig! ${exponate.length} Exponate erstellt.`)
  console.log('   Öffne Sanity Studio um die Ergebnisse zu sehen.')
}

main().catch(err => {
  console.error('❌ Fehler:', err.message)
  process.exit(1)
})
