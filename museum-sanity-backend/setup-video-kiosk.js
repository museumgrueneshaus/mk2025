// Setup script for Video Kiosk Configuration
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: '832k5je1',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: 'skDFwSLgzumgAu83TIVW3Y0ZzaDpAOAAjMPJsxUxGUWNXJMX5DeWlMU883taXA53mzQZZAn32KUvCOfuu'
});

async function setupVideoKiosk() {
  console.log('🎬 Setting up Video Kiosk Configuration...\n');

  try {
    // Create Kiosk Config for Raspberry Pi Beamer
    const kioskConfig = {
      _type: 'kioskConfig',
      name: 'Beamer Ausstellung',
      standort: '50 Jahre Museumsverein Raum',
      mac_adresse: 'B8:27:EB:12:34:56', // Example Raspberry Pi MAC
      modus: 'video',
      konfiguration: {
        video_settings: {
          playlist: [
            {
              typ: 'image',
              titel: 'Willkommen',
              beschreibung: '50 Jahre Museumsverein Reutte - 1975 bis 2025',
              dauer: 5
            },
            {
              typ: 'video',
              video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              titel: 'Video 1',
              beschreibung: 'Beispiel Video - Ersetze mit eigenem Content'
            },
            {
              typ: 'image',
              titel: 'Meilenstein 1975',
              beschreibung: 'Gründung des Museumsvereins',
              dauer: 8
            },
            {
              typ: 'video',
              video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
              titel: 'Video 2',
              beschreibung: 'Beispiel Video - Ersetze mit eigenem Content'
            },
            {
              typ: 'image',
              titel: 'Meilenstein 2000',
              beschreibung: '25 Jahre Museumsverein',
              dauer: 8
            },
            {
              typ: 'video',
              video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              titel: 'Video 3',
              beschreibung: 'Beispiel Video - Ersetze mit eigenem Content'
            }
          ],
          loop: true,
          shuffle: false,
          zeige_overlay: true,
          overlay_position: 'bottom-left',
          uebergang: 'fade',
          audio: {
            lautstaerke: 70,
            stumm: false
          }
        }
      },
      design: {
        theme: 'dark',
        schriftgroesse: 'large'
      },
      funktionen: {
        sprachen: ['de'],
        idle_timeout: 0, // No timeout for video loop
        zeige_uhr: false
      },
      aktiv: true,
      notizen: 'Raspberry Pi 4 - Beamer für 50 Jahre Ausstellung\n\nHINWEIS: Beispiel-Videos von Google Test Videos. Bitte durch eigene Videos ersetzen!\n\nSo verwendest du eigene Videos:\n1. Gehe zu dieser Kiosk-Konfiguration\n2. Klicke auf ein Playlist-Item\n3. Lade eine Video-Datei hoch (MP4, WebM, MOV)\n4. Oder füge eine URL zu deinem Video ein\n\nFür Bilder:\n1. Wähle "Typ: Bild"\n2. Lade ein Bild hoch\n3. Setze die Anzeigedauer in Sekunden'
    };

    const result = await client.create(kioskConfig);

    console.log('✅ Kiosk Config erstellt:');
    console.log('   ID:', result._id);
    console.log('   Name:', result.name);
    console.log('   Standort:', result.standort);
    console.log('   MAC:', result.mac_adresse);
    console.log('   Playlist Items:', result.konfiguration.video_settings.playlist.length);
    console.log('\n📍 Zugriff auf Video Player:');
    console.log('   Lokal: http://localhost:4321/kiosk/' + result._id);
    console.log('   Oder:  http://localhost:4321/kiosk/beamer-ausstellung');
    console.log('   Oder:  http://localhost:4321/kiosk/B8:27:EB:12:34:56');
    console.log('\n🎬 Beispiel-Videos:');
    console.log('   Die Playlist enthält Google Test Videos als Platzhalter');
    console.log('   Ersetze diese im Sanity Studio durch deine eigenen Videos!');
    console.log('\n⚙️ Sanity Studio:');
    console.log('   Lokal:  http://localhost:3333/');
    console.log('   Online: https://museumghbackend.sanity.studio/');
    console.log('\n🎮 Steuerung:');
    console.log('   Pfeiltasten: Vor/Zurück');
    console.log('   Leertaste:   Pause/Play (nur Videos)');
    console.log('   Escape:      Fullscreen beenden');
    console.log('   Swipe:       Touch-Steuerung');

  } catch (error) {
    console.error('❌ Fehler:', error.message);
    process.exit(1);
  }
}

setupVideoKiosk();
