import { createClient } from '@sanity/client';

// Sanity Client
const client = createClient({
  projectId: '832k5je1',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN || 'sk1VTIq7XVReoW6NVa6L7fIJnUSRYC53fByocEKF2EIXTGHe69jf52yHs7QJwGMbH5dIDz67wEosW4RCq6pjw9qDD3IqJy69N6O7VqgMT8xUcEroHy4P5ORRSvbHuhOsHoUgo70xLnueRKGgKPzsV1nMPpz7DZ1D6CpSfDUSxIapVuDWRNDU'
});

async function createDefaultKioskConfig() {
  console.log('Creating default kiosk configuration...');
  
  try {
    const kioskConfig = {
      _type: 'kioskConfig',
      name: 'Default Kiosk',
      standort: 'Hauptausstellung',
      mac_adresse: 'AA:BB:CC:DD:EE:FF',
      modus: 'explorer',
      konfiguration: {
        explorer_settings: {
          nur_highlights: false,
          sortierung: 'inventarnummer',
          items_pro_seite: 12
        }
      },
      design: {
        theme: 'default',
        schriftgroesse: 'normal'
      },
      funktionen: {
        sprachen: ['de'],
        zeige_qr_codes: true,
        audio_autoplay: false,
        touch_sounds: false,
        idle_timeout: 300,
        zeige_uhr: true,
        statistiken: false,
        mqtt: {
          aktiviert: true,
          broker_url: 'mqtt://localhost:1883',
          username: 'museum',
          password: 'museum123',
          client_id: 'museum-kiosk-1',
          topics: {
            lightbulb_topic_base: 'museum/led',
            status_topic: 'museum/kiosk/status',
            interaction_topic: 'museum/kiosk/interaction'
          },
          led_strips: [
            {
              strip_number: 1,
              esp32_id: 'esp32-strip1',
              total_leds: 100,
              raum_position: 'Nordwand'
            },
            {
              strip_number: 2,
              esp32_id: 'esp32-strip2',
              total_leds: 100,
              raum_position: 'Ostwand'
            },
            {
              strip_number: 3,
              esp32_id: 'esp32-strip3',
              total_leds: 100,
              raum_position: 'Südwand'
            }
          ]
        }
      },
      wartung: {
        auto_neustart: {
          aktiviert: false
        },
        debug_modus: false,
        cache_dauer: 60
      },
      aktiv: true,
      notizen: 'Standard-Konfiguration für Museum Kiosk mit MQTT LED-Steuerung'
    };
    
    const result = await client.create(kioskConfig);
    console.log(`✓ Default kiosk config created: ${result._id}`);
    
  } catch (error) {
    console.error('Error creating default kiosk config:', error);
  }
}

// Run the script
createDefaultKioskConfig().catch(console.error);
