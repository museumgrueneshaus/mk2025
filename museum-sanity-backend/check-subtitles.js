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

console.log('Playlist items:');
kiosk.konfiguration.video_settings.playlist.forEach((item, i) => {
  console.log(`\n${i+1}. ${item.titel}`);
  console.log(`   Video: ${item.video?.asset?._ref}`);
  console.log(`   Untertitel: ${item.untertitel?.asset?._ref || 'keine'}`);
});
