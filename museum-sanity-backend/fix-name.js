import { createClient } from '@sanity/client';

const client = createClient({
  projectId: '832k5je1',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: 'skDFwSLgzumgAu83TIVW3Y0ZzaDpAOAAjMPJsxUxGUWNXJMX5DeWlMU883taXA53mzQZZAn32KUvCOfuu'
});

async function fixName() {
  const result = await client
    .patch('KKKu3Cq0cPqJJloqGWSgbL')
    .set({ name: 'beamer-ausstellung' })
    .commit();
  
  console.log('Name updated to:', result.name);
  console.log('URL: http://localhost:4321/kiosk/beamer-ausstellung');
}

fixName().catch(console.error);
