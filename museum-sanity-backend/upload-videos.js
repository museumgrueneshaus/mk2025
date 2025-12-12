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

const videoDir = path.join(process.env.HOME, 'Desktop', 'museum-videos');

const videos = [
  { file: 'clip1-musik1.mp4', titel: 'Musik 1', beschreibung: 'Musikalische Einlage' },
  { file: 'clip2-redeobmann.mp4', titel: 'Rede Obmann', beschreibung: 'Rede des Obmanns' },
  { file: 'clip3-musik2.mp4', titel: 'Musik 2', beschreibung: 'Musikalische Einlage' },
  { file: 'clip4-rede-lipp.mp4', titel: 'Rede Lipp', beschreibung: 'Rede von Herrn Lipp' },
  { file: 'clip5-redemattle.mp4', titel: 'Rede Mattle', beschreibung: 'Rede von Herrn Mattle' },
  { file: 'clip6-redesalchner.mp4', titel: 'Rede Salchner', beschreibung: 'Rede von Herrn Salchner' },
  { file: 'clip7-verabschiedung.mp4', titel: 'Verabschiedung', beschreibung: 'Verabschiedung und Ausklang' }
];

async function uploadVideo(videoInfo) {
  const filePath = path.join(videoDir, videoInfo.file);

  console.log(`Uploading ${videoInfo.file}...`);

  const videoAsset = await client.assets.upload('file', fs.createReadStream(filePath), {
    filename: videoInfo.file,
    contentType: 'video/mp4'
  });

  console.log(`✓ Uploaded ${videoInfo.file} - Asset ID: ${videoAsset._id}`);

  return {
    ...videoInfo,
    assetId: videoAsset._id,
    url: videoAsset.url
  };
}

async function updateKioskPlaylist(uploadedVideos) {
  console.log('\nUpdating kiosk playlist...');

  const kioskId = 'KKKu3Cq0cPqJJloqGWSgbL'; // beamer-ausstellung

  const playlist = uploadedVideos.map(video => ({
    _key: Math.random().toString(36).substring(2, 15),
    typ: 'video',
    video: {
      _type: 'file',
      asset: {
        _type: 'reference',
        _ref: video.assetId
      }
    },
    titel: video.titel,
    beschreibung: video.beschreibung
  }));

  await client
    .patch(kioskId)
    .set({
      'konfiguration.video_settings.playlist': playlist
    })
    .commit();

  console.log('✓ Playlist updated!');
}

async function main() {
  console.log('Starting video upload to Sanity...\n');

  const uploadedVideos = [];

  for (const video of videos) {
    try {
      const result = await uploadVideo(video);
      uploadedVideos.push(result);
    } catch (error) {
      console.error(`✗ Error uploading ${video.file}:`, error.message);
    }
  }

  if (uploadedVideos.length > 0) {
    await updateKioskPlaylist(uploadedVideos);
    console.log(`\n✓ Successfully uploaded ${uploadedVideos.length} videos!`);
  }
}

main().catch(console.error);
