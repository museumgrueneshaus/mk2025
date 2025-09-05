import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';
import { getStore } from '@netlify/blobs';

// API routes require server-side rendering
export const prerender = false;

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

    // Generate unique filename
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const blobKey = `${targetDir}/${fileName}`;
    
    // Get file content as array buffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Check if running on Netlify (use Blobs) or locally (use filesystem)
    const isNetlify = process.env.NETLIFY === 'true' || process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    if (isNetlify) {
      // Use Netlify Blobs for production
      const store = getStore({
        name: 'museum-media',
        siteID: process.env.NETLIFY_SITE_ID || ''
      });
      
      await store.set(blobKey, arrayBuffer, {
        metadata: {
          contentType: file.type,
          originalName: file.name,
          uploadDate: new Date().toISOString()
        }
      });
      
      // Return Netlify Blobs URL (will be accessible via /.netlify/blobs/)
      const publicPath = `/.netlify/blobs/museum-media/${blobKey}`;
      
      return new Response(JSON.stringify({ 
        success: true,
        path: publicPath,
        name: file.name,
        type: targetDir,
        storage: 'blobs'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Use filesystem for local development
      const uploadDir = path.join(process.cwd(), 'public', 'media', targetDir);
      await fs.mkdir(uploadDir, { recursive: true });
      
      const filePath = path.join(uploadDir, fileName);
      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(filePath, buffer);
      
      const publicPath = `/media/${targetDir}/${fileName}`;
      
      return new Response(JSON.stringify({ 
        success: true,
        path: publicPath,
        name: file.name,
        type: targetDir,
        storage: 'filesystem'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
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
    const isNetlify = process.env.NETLIFY === 'true' || process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    let files: any[] = [];
    const directories = type === 'all' 
      ? ['images', 'videos', 'pdfs', 'audio'] 
      : [type];

    if (isNetlify) {
      // Use Netlify Blobs for production
      try {
        const store = getStore({
          name: 'museum-media',
          siteID: process.env.NETLIFY_SITE_ID || ''
        });
        
        // List all blobs and filter by directories
        const allBlobs = await store.list();
        
        for (const dir of directories) {
          const dirFiles = allBlobs.blobs
            .filter(blob => blob.key.startsWith(`${dir}/`))
            .map(blob => ({
              name: path.basename(blob.key),
              path: `/.netlify/blobs/museum-media/${blob.key}`,
              type: dir,
              storage: 'blobs',
              metadata: blob.metadata
            }));
          files = files.concat(dirFiles);
        }
      } catch (err) {
        console.log('Netlify Blobs not available or empty, skipping');
      }
    } else {
      // Use filesystem for local development
      const mediaDir = path.join(process.cwd(), 'public', 'media');
      
      for (const dir of directories) {
        const dirPath = path.join(mediaDir, dir);
        try {
          const dirFiles = await fs.readdir(dirPath);
          const fileList = dirFiles
            .filter(f => !f.startsWith('.')) // Skip hidden files
            .map(f => ({
              name: f,
              path: `/media/${dir}/${f}`,
              type: dir,
              storage: 'filesystem'
            }));
          files = files.concat(fileList);
        } catch (err) {
          // Directory might not exist yet
          console.log(`Directory ${dir} not found, skipping`);
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      files,
      storage: isNetlify ? 'blobs' : 'filesystem'
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