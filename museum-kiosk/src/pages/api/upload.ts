import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

// API routes are not supported in static builds
// export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Determine target directory based on file type
    const fileExt = path.extname(file.name).toLowerCase();
    let targetDir = 'images'; // default
    
    if (['.mp4', '.webm', '.ogg'].includes(fileExt)) {
      targetDir = 'videos';
    } else if (fileExt === '.pdf') {
      targetDir = 'pdfs';
    } else if (['.mp3', '.wav', '.ogg'].includes(fileExt)) {
      targetDir = 'audio';
    }

    // Create directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'media', targetDir);
    await fs.mkdir(uploadDir, { recursive: true });

    // Save file
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadDir, fileName);
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    // Return the public URL path
    const publicPath = `/media/${targetDir}/${fileName}`;
    
    return new Response(JSON.stringify({ 
      success: true,
      path: publicPath,
      name: file.name,
      type: targetDir
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// List files in media directories
export const GET: APIRoute = async ({ url }) => {
  try {
    const type = url.searchParams.get('type') || 'all';
    const mediaDir = path.join(process.cwd(), 'public', 'media');
    
    let files: any[] = [];
    const directories = type === 'all' 
      ? ['images', 'videos', 'pdfs', 'audio'] 
      : [type];

    for (const dir of directories) {
      const dirPath = path.join(mediaDir, dir);
      try {
        const dirFiles = await fs.readdir(dirPath);
        const fileList = dirFiles
          .filter(f => !f.startsWith('.')) // Skip hidden files
          .map(f => ({
            name: f,
            path: `/media/${dir}/${f}`,
            type: dir
          }));
        files = files.concat(fileList);
      } catch (err) {
        // Directory might not exist yet
        console.log(`Directory ${dir} not found, skipping`);
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      files 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('List files error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to list files',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};