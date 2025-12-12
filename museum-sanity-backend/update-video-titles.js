import {createClient} from '@sanity/client';

const client = createClient({
  projectId: '832k5je1',
  dataset: 'production',
  useCdn: false,
  token: 'skDFwSLgzumgAu83TIVW3Y0ZzaDpAOAAjMPJsxUxGUWNXJMX5DeWlMU883taXA53mzQZZAn32KUvCOfuu',
  apiVersion: '2024-01-01'
});

const kioskId = 'KKKu3Cq0cPqJJloqGWSgbL';
const kiosk = await client.getDocument(kioskId);

const playlist = kiosk.konfiguration.video_settings.playlist;

// Update titles
playlist[0].titel = 'Musikverein Reutte';
playlist[1].titel = 'Ernst Hornstein, Obmann des Museumsvereins Reutte';
playlist[2].titel = 'Musikalische Einlage';
playlist[3].titel = 'Alexander Lipp, Kammer für Arbeiter und Angestellte';
playlist[4].titel = 'Anton Mattle, Landeshauptmann Tirol';
playlist[5].titel = 'Thomas Salchner, Bürgermeister Reutte';
playlist[6].titel = 'Verabschiedung';

await client
  .patch(kioskId)
  .set({
    'konfiguration.video_settings.playlist': playlist
  })
  .commit();

console.log('✓ Video-Titel aktualisiert:');
playlist.forEach((item, i) => {
  console.log(`  Video ${i+1}: ${item.titel}`);
});
