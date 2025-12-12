import {createClient} from '@sanity/client';

const client = createClient({
  projectId: '832k5je1',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01'
});

const identifier = 'beamer-ausstellung';

const query = `*[_type == "kioskConfig" && (
  _id == $identifier ||
  name == $identifier ||
  mac_adresse == $identifier ||
  ip_adresse == $identifier
) && aktiv == true][0]{
  _id,
  name,
  standort,
  modus,
  konfiguration{
    video_settings{
      playlist[]{
        typ,
        video{
          asset->{
            _id,
            url,
            originalFilename,
            size,
            mimeType
          }
        },
        video_url,
        bild{
          asset->{
            _id,
            url,
            metadata{lqip, dimensions}
          }
        },
        untertitel{
          asset->{
            _id,
            url
          }
        },
        dauer,
        titel,
        beschreibung
      },
      loop,
      shuffle,
      zeige_overlay,
      overlay_position,
      uebergang,
      audio
    }
  },
  design,
  funktionen
}`;

const result = await client.fetch(query, { identifier });

console.log('Config found:', result?.name);
console.log('\nPlaylist items with subtitles:');
result?.konfiguration?.video_settings?.playlist?.forEach((item, i) => {
  console.log(`${i+1}. ${item.titel}`);
  console.log(`   Video: ${item.video?.asset?.url ? 'YES' : 'NO'}`);
  console.log(`   Subtitles: ${item.untertitel?.asset?.url || 'NONE'}`);
});
