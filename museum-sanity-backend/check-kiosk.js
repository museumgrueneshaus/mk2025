import { createClient } from '@sanity/client';

const client = createClient({
  projectId: '832k5je1',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: 'skDFwSLgzumgAu83TIVW3Y0ZzaDpAOAAjMPJsxUxGUWNXJMX5DeWlMU883taXA53mzQZZAn32KUvCOfuu'
});

async function checkKiosks() {
  console.log('Checking all Kiosk Configs...\n');

  const query = '*[_type == "kioskConfig"]{_id, name, aktiv, modus}';
  const configs = await client.fetch(query);

  console.log('Found', configs.length, 'kiosk configs:');
  configs.forEach(c => {
    console.log(`  - ID: ${c._id}`);
    console.log(`    Name: ${c.name}`);
    console.log(`    Active: ${c.aktiv}`);
    console.log(`    Mode: ${c.modus}`);
    console.log('');
  });

  // Try to fetch by name
  console.log('Trying to fetch by name "beamer-ausstellung"...');
  const byName = await client.fetch('*[_type == "kioskConfig" && name == "beamer-ausstellung"][0]');
  console.log('Result:', byName ? 'FOUND' : 'NOT FOUND');
  if (byName) {
    console.log('Full config:', JSON.stringify(byName, null, 2));
  }
}

checkKiosks().catch(console.error);
