// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  
  // Output für Server-Side Rendering
  output: 'server',
  adapter: netlify(),
  
  // Server configuration für Development
  server: {
    port: 4321,
    host: true
  },
  
  // Build configuration
  build: {
    // Inline CSS für bessere Performance
    inlineStylesheets: 'auto',
    // Assets optimization
    assets: 'assets'
  },
  
  // Site URL für Production (wird von Netlify überschrieben)
  site: 'https://museum.netlify.app',
  
  // Prefetch für bessere Navigation
  prefetch: {
    prefetchAll: true
  }
});