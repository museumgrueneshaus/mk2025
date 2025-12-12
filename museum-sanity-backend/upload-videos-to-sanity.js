#!/usr/bin/env node

const { createClient } = require('@sanity/client');
const fs = require('fs');
const path = require('path');

// Sanity Client
const client = createClient({
  projectId: '832k5je1',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_AUTH_TOKEN || 'skDFwSLgzumgAu83TIVW3Y0ZzaDpAOAAjMPJsxUxGUWNXJMX5DeWlMU883taXA53mzQZZAn32KUvCOfuu'
});

// Video Playlist Konfiguration - Pi-compatible versions
const videos = [
  {
    file: '/Users/marcelgladbach/Desktop/museum-videos/pi-compatible/clip1-musik1-pi.mp4',
    titel: 'Museumsmusik Reutte',
    beschreibung: 'Musikalische Einlage',
    typ: 'video'
  },
  {
    file: '/Users/marcelgladbach/Desktop/museum-videos/pi-compatible/clip2-redeobmann-pi.mp4',
    titel: 'Ernst Hornstein',
    beschreibung: 'Obmann des Museumsvereins Reutte',
    typ: 'video'
  },
  {
    file: '/Users/marcelgladbach/Desktop/museum-videos/pi-compatible/clip3-musik2-pi.mp4',
    titel: 'Museumsmusik Reutte',
    beschreibung: 'Musikalische Einlage',
    typ: 'video'
  },
  {
    file: '/Users/marcelgladbach/Desktop/museum-videos/pi-compatible/clip4-rede-lipp-pi.mp4',
    titel: 'Richard Lipp',
    beschreibung: 'Gründungsmitglied des Museumsvereins Reutte',
    typ: 'video'
  },
  {
    file: '/Users/marcelgladbach/Desktop/museum-videos/pi-compatible/clip5-redemattle-pi.mp4',
    titel: 'Anton Mattle',
    beschreibung: 'Landeshauptmann Tirol',
    typ: 'video'
  },
  {
    file: '/Users/marcelgladbach/Desktop/museum-videos/pi-compatible/clip6-redesalchner-pi.mp4',
    titel: 'Günther Salchner',
    beschreibung: 'Bürgermeister Reutte',
    typ: 'video'
  },
  {
    file: '/Users/marcelgladbach/Desktop/museum-videos/pi-compatible/clip7-verabschiedung-pi.mp4',
    titel: 'Verabschiedung',
    beschreibung: '',
    typ: 'video'
  }
];

async function uploadVideo(videoInfo) {
  console.log(`\n📹 Uploading: ${videoInfo.titel}...`);

  const fileStream = fs.createReadStream(videoInfo.file);
  const fileName = path.basename(videoInfo.file);

  try {
    const asset = await client.assets.upload('file', fileStream, {
      filename: fileName,
      contentType: 'video/mp4'
    });

    console.log(`✅ Uploaded: ${videoInfo.titel} (${asset._id})`);
    return {
      ...videoInfo,
      asset: {
        _type: 'reference',
        _ref: asset._id
      }
    };
  } catch (error) {
    console.error(`❌ Error uploading ${videoInfo.titel}:`, error.message);
    throw error;
  }
}

async function updateKioskConfig(playlistItems) {
  console.log('\n🔧 Updating RPI_01 kiosk configuration...');

  // Transform playlist items to Sanity format
  const playlist = playlistItems.map(item => ({
    _type: 'playlistItem',
    _key: Math.random().toString(36).substr(2, 9),
    typ: item.typ,
    titel: item.titel,
    beschreibung: item.beschreibung,
    video: {
      _type: 'file',
      asset: item.asset
    },
    dauer: 10
  }));

  try {
    // Get existing config
    const existingConfig = await client.fetch(
      '*[_type == "kioskConfig" && name == "RPI_01"][0]'
    );

    if (!existingConfig) {
      console.error('❌ RPI_01 config not found!');
      return;
    }

    // Update with new playlist
    const result = await client
      .patch(existingConfig._id)
      .set({
        'konfiguration.video_settings.playlist': playlist
      })
      .commit();

    console.log('✅ RPI_01 configuration updated!');
    console.log(`   Playlist now has ${playlist.length} videos`);

    return result;
  } catch (error) {
    console.error('❌ Error updating config:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting video upload to Sanity...');
  console.log(`   Project: 832k5je1`);
  console.log(`   Dataset: production`);
  console.log(`   Videos to upload: ${videos.length}`);

  const uploadedVideos = [];

  // Upload all videos
  for (const video of videos) {
    try {
      const uploaded = await uploadVideo(video);
      uploadedVideos.push(uploaded);

      // Wait a bit between uploads to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Upload failed, continuing with next video...');
    }
  }

  console.log(`\n✅ Uploaded ${uploadedVideos.length}/${videos.length} videos`);

  // Update kiosk config
  if (uploadedVideos.length > 0) {
    await updateKioskConfig(uploadedVideos);
  }

  console.log('\n🎉 Done! Check https://museumgh.netlify.app/kiosk/RPI_01/video');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
