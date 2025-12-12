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

// Find Rede Mattle (index 4)
const playlist = kiosk.konfiguration.video_settings.playlist;
playlist[4].untertitel = {
  _type: 'file',
  asset: {
    _type: 'reference',
    _ref: 'file-c634a10bb5ea2450f19107b7e39864b446b00797-vtt'
  }
};

await client
  .patch(kioskId)
  .set({
    'konfiguration.video_settings.playlist': playlist
  })
  .commit();

console.log('✓ Untertitel für Rede Mattle hinzugefügt');
