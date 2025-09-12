// Sample data for Sanity Vision tool
// Copy and paste this into the Vision tool in Sanity Studio

// First, create categories:
const categories = [
  {
    _type: 'kategorie',
    titel: 'Steinzeit',
    slug: { current: 'steinzeit' },
    icon: '🏺',
    farbe: '#8B4513',
    beschreibung: 'Artefakte aus der Steinzeit'
  },
  {
    _type: 'kategorie', 
    titel: 'Renaissance',
    slug: { current: 'renaissance' },
    icon: '🎨',
    farbe: '#DAA520',
    beschreibung: 'Kunstwerke aus der Renaissance'
  },
  {
    _type: 'kategorie',
    titel: 'Expressionismus', 
    slug: { current: 'expressionismus' },
    icon: '🎭',
    farbe: '#FF6347',
    beschreibung: 'Expressionistische Kunstwerke'
  },
  {
    _type: 'kategorie',
    titel: 'Antike',
    slug: { current: 'antike' },
    icon: '🏛️',
    farbe: '#4682B4',
    beschreibung: 'Artefakte aus der Antike'
  },
  {
    _type: 'kategorie',
    titel: 'Mittelalter',
    slug: { current: 'mittelalter' },
    icon: '⚔️',
    farbe: '#696969',
    beschreibung: 'Objekte aus dem Mittelalter'
  }
];

// Then create items:
const items = [
  {
    _type: 'exponat',
    inventarnummer: '2024.001',
    titel: 'Venus von Willendorf',
    untertitel: 'Steinzeitliche Venusfigur',
    kurzbeschreibung: 'Eine der berühmtesten prähistorischen Frauenfiguren aus der Altsteinzeit. Die 11 cm große Kalksteinfigur wurde 1908 in Willendorf, Österreich, gefunden.',
    beschreibung: 'Die Venus von Willendorf ist eine der bekanntesten prähistorischen Frauenfiguren und stammt aus der Altsteinzeit (Gravettien, ca. 25.000 v. Chr.). Die 11 cm große Kalksteinfigur wurde am 7. August 1908 von dem Archäologen Josef Szombathy in Willendorf an der Donau in Österreich gefunden. Die Figur zeigt eine üppige weibliche Gestalt mit betonten Geschlechtsmerkmalen und wird als Fruchtbarkeitssymbol interpretiert.',
    datierung: 'ca. 25.000 v. Chr.',
    herstellung: 'Kalkstein, geschnitzt',
    physisch: 'Höhe: 11 cm, Breite: 5,7 cm, Tiefe: 4,3 cm',
    organisation: 'Naturhistorisches Museum Wien',
    tags: ['Steinzeit', 'Venus', 'Fruchtbarkeit', 'Österreich', 'Gravettien'],
    ist_highlight: true,
    reihenfolge: 1
  },
  {
    _type: 'exponat',
    inventarnummer: '2024.002',
    titel: 'Mona Lisa',
    untertitel: 'Porträt der Lisa del Giocondo',
    kurzbeschreibung: 'Das berühmteste Gemälde der Welt von Leonardo da Vinci. Das geheimnisvolle Lächeln der Mona Lisa fasziniert seit Jahrhunderten.',
    beschreibung: 'Die Mona Lisa (italienisch Monna Lisa) ist ein weltberühmtes Ölgemälde von Leonardo da Vinci auf Pappelholz. Das 77 × 53 cm große Bild entstand zwischen 1503 und 1519 und zeigt die Florentinerin Lisa del Giocondo. Das Gemälde befindet sich heute im Louvre in Paris und ist eines der bekanntesten Kunstwerke der Welt.',
    datierung: '1503-1519',
    herstellung: 'Öl auf Pappelholz',
    physisch: '77 × 53 cm',
    organisation: 'Musée du Louvre, Paris',
    tags: ['Renaissance', 'Leonardo da Vinci', 'Porträt', 'Louvre', 'Italien'],
    ist_highlight: true,
    reihenfolge: 2
  },
  {
    _type: 'exponat',
    inventarnummer: '2024.003',
    titel: 'Der Schrei',
    untertitel: 'Expressionistisches Meisterwerk',
    kurzbeschreibung: 'Edvard Munchs berühmtes Gemälde, das menschliche Angst und Verzweiflung ausdrückt. Ein Symbol des Expressionismus.',
    beschreibung: 'Der Schrei (norwegisch Skrik) ist der Titel von vier Gemälden und einer Lithografie des norwegischen Malers Edvard Munch. Das bekannteste Werk entstand 1893 und zeigt eine schreiende Figur vor einem blutroten Himmel. Das Gemälde gilt als eines der wichtigsten Werke des Expressionismus und als Vorläufer der modernen Kunst.',
    datierung: '1893',
    herstellung: 'Öl, Tempera und Pastell auf Karton',
    physisch: '91 × 73,5 cm',
    organisation: 'Nationalgalerie Oslo',
    tags: ['Expressionismus', 'Edvard Munch', 'Angst', 'Norwegen', 'Moderne Kunst'],
    ist_highlight: true,
    reihenfolge: 3
  },
  {
    _type: 'exponat',
    inventarnummer: '2024.004',
    titel: 'Ägyptische Mumie',
    untertitel: 'Mumie aus dem Alten Ägypten',
    kurzbeschreibung: 'Eine gut erhaltene Mumie aus dem Alten Ägypten mit reichen Grabbeigaben. Zeugnis der antiken Bestattungskultur.',
    beschreibung: 'Diese Mumie stammt aus dem Alten Ägypten und ist ein hervorragendes Beispiel für die antike Einbalsamierungskunst. Die Mumie wurde mit Leinenbinden umwickelt und mit Amuletten und Grabbeigaben ausgestattet. Die Totenmaske zeigt typische ägyptische Züge und Verzierungen.',
    datierung: 'ca. 1000 v. Chr.',
    herstellung: 'Menschliche Überreste, Leinen, Harze',
    physisch: 'Länge: 170 cm',
    organisation: 'Ägyptisches Museum Berlin',
    tags: ['Ägypten', 'Mumie', 'Antike', 'Bestattung', 'Einbalsamierung'],
    ist_highlight: false,
    reihenfolge: 4
  },
  {
    _type: 'exponat',
    inventarnummer: '2024.005',
    titel: 'Römische Münze',
    untertitel: 'Denar aus der Kaiserzeit',
    kurzbeschreibung: 'Eine gut erhaltene römische Silbermünze aus der Kaiserzeit. Zeigt das Porträt des Kaisers und wichtige Symbole.',
    beschreibung: 'Dieser römische Denar stammt aus der Kaiserzeit und zeigt auf der Vorderseite das Porträt des Kaisers, auf der Rückseite wichtige Symbole und Inschriften. Die Münze ist ein wichtiges Zeugnis der römischen Geschichte und Wirtschaft.',
    datierung: '1. Jahrhundert n. Chr.',
    herstellung: 'Silber, geprägt',
    physisch: 'Durchmesser: 19 mm, Gewicht: 3,9 g',
    organisation: 'Römisch-Germanisches Museum Köln',
    tags: ['Rom', 'Münze', 'Silber', 'Kaiserzeit', 'Antike'],
    ist_highlight: false,
    reihenfolge: 5
  },
  {
    _type: 'exponat',
    inventarnummer: '2024.006',
    titel: 'Mittelalterliches Schwert',
    untertitel: 'Ritterliches Kampfschwert',
    kurzbeschreibung: 'Ein prächtiges mittelalterliches Schwert mit kunstvoll verziertem Griff. Zeugnis der ritterlichen Kultur.',
    beschreibung: 'Dieses mittelalterliche Schwert stammt aus dem 12. Jahrhundert und ist ein hervorragendes Beispiel für die Waffenkunst des Mittelalters. Der Griff ist kunstvoll verziert und zeigt typische mittelalterliche Motive. Das Schwert gehörte wahrscheinlich einem Adligen oder Ritter.',
    datierung: '12. Jahrhundert',
    herstellung: 'Eisen, Leder, Edelsteine',
    physisch: 'Länge: 95 cm, Klingenlänge: 78 cm',
    organisation: 'Germanisches Nationalmuseum Nürnberg',
    tags: ['Mittelalter', 'Schwert', 'Ritter', 'Waffen', 'Eisen'],
    ist_highlight: false,
    reihenfolge: 6
  }
];

// Instructions:
// 1. Go to Sanity Studio (http://localhost:3333)
// 2. Open the Vision tool
// 3. Copy and paste the categories array first, then run it
// 4. Then copy and paste the items array and run it
// 5. Make sure to assign the correct categories to each item

