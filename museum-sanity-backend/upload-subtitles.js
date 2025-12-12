import {createClient} from '@sanity/client';
import fs from 'fs';
import path from 'path';

const client = createClient({
  projectId: '832k5je1',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_AUTH_TOKEN || 'skDFwSLgzumgAu83TIVW3Y0ZzaDpAOAAjMPJsxUxGUWNXJMX5DeWlMU883taXA53mzQZZAn32KUvCOfuu',
  apiVersion: '2024-01-01'
});

const subtitlesDir = path.join(process.env.HOME, 'Desktop', 'museum-videos', 'subtitles');

// Map subtitle files to video clips
const subtitleFiles = [
  { file: 'clip2-redeobmann.vtt', videoClip: 'clip2-redeobmann.mp4' },
  { file: 'clip4-rede-lipp.vtt', videoClip: 'clip4-rede-lipp.mp4' },
  { file: 'clip5-redemattle.vtt', videoClip: 'clip5-redemattle.mp4' },
  { file: 'clip6-redesalchner.vtt', videoClip: 'clip6-redesalchner.mp4' },
  { file: 'clip7-verabschiedung.vtt', videoClip: 'clip7-verabschiedung.mp4' }
];

async function uploadSubtitle(subtitleFile) {
  const filePath = path.join(subtitlesDir, subtitleFile);

  if (!fs.existsSync(filePath)) {
    console.log(`⏳ ${subtitleFile} noch nicht fertig, überspringe...`);
    return null;
  }

  console.log(`Uploading ${subtitleFile}...`);

  const asset = await client.assets.upload('file', fs.createReadStream(filePath), {
    filename: subtitleFile,
    contentType: 'text/vtt'
  });

  console.log(`✓ Uploaded ${subtitleFile} - Asset ID: ${asset._id}`);
  return asset;
}

async function main() {
  console.log('Starting subtitle upload...\n');

  const uploadedSubtitles = {};

  // Upload all available subtitle files
  for (const {file, videoClip} of subtitleFiles) {
    try {
      const asset = await uploadSubtitle(file);
      if (asset) {
        uploadedSubtitles[videoClip] = asset._id;
      }
    } catch (error) {
      console.error(`✗ Error uploading ${file}:`, error.message);
    }
  }

  if (Object.keys(uploadedSubtitles).length === 0) {
    console.log('\nKeine Untertitel zum Hochladen gefunden.');
    return;
  }

  console.log(`\n${Object.keys(uploadedSubtitles).length} Untertitel hochgeladen`);
  console.log('Updating kiosk playlist with subtitles...');

  // Get current kiosk config
  const kioskId = 'KKKu3Cq0cPqJJloqGWSgbL';
  const kiosk = await client.getDocument(kioskId);

  const playlist = kiosk.konfiguration.video_settings.playlist || [];

  // Update playlist items with subtitles
  const updatedPlaylist = playlist.map(item => {
    if (item.typ === 'video' && item.video?.asset) {
      // Find video filename from asset
      const videoFilename = item.video.asset.originalFilename || item.titel;

      // Check if we have subtitles for this video
      for (const [clipName, subtitleAssetId] of Object.entries(uploadedSubtitles)) {
        if (videoFilename && videoFilename.includes(clipName.replace('.mp4', ''))) {
          console.log(`✓ Adding subtitles to: ${item.titel || videoFilename}`);
          return {
            ...item,
            untertitel: {
              _type: 'file',
              asset: {
                _type: 'reference',
                _ref: subtitleAssetId
              }
            }
          };
        }
      }
    }
    return item;
  });

  await client
    .patch(kioskId)
    .set({
      'konfiguration.video_settings.playlist': updatedPlaylist
    })
    .commit();

  console.log('\n✓ Playlist erfolgreich mit Untertiteln aktualisiert!');
}

main().catch(console.error);
