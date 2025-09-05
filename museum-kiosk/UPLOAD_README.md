# File Upload Functionality

## Current Status

✅ **Netlify Blobs Implementation Complete**

The file upload system now uses **dual storage strategy**:

### 🟡 **Development Mode**
- **Issue**: File uploads still hang in local development (`npm run dev`)  
- **Cause**: Astro + Netlify adapter limitations with `formData()` processing
- **Workaround**: Add files manually to `public/media/` folders for testing

### ✅ **Production (Netlify)**
- **Storage**: Netlify Blobs (`museum-media` store)
- **API**: Automatic detection of Netlify environment
- **URLs**: Files accessible via `/.netlify/blobs/museum-media/[type]/[filename]`
- **Upload Size**: Up to 10MB per file (configured in `netlify.toml`)

## How It Works

### Storage Strategy
```
Environment Detection → Storage Method
├── Local Dev       → public/media/ (filesystem)
└── Netlify         → Netlify Blobs (serverless)
```

### File Organization
```
Netlify Blobs Structure:
├── images/[filename]     # .jpg, .png, .gif, .webp
├── videos/[filename]     # .mp4, .webm, .ogg  
├── audio/[filename]      # .mp3, .wav, .ogg
└── pdfs/[filename]       # .pdf files
```

## API Endpoints

### Upload File
```bash
POST /api/upload
Content-Type: multipart/form-data

Response:
{
  "success": true,
  "path": "/.netlify/blobs/museum-media/images/123456-image.jpg",
  "name": "image.jpg", 
  "type": "images",
  "storage": "blobs" | "filesystem"
}
```

### List Files
```bash
GET /api/upload?type=images

Response:
{
  "success": true,
  "files": [...],
  "storage": "blobs" | "filesystem"
}
```

## Configuration

### netlify.toml
```toml
[functions]
  max_body_size = "10MB"  # Enable large file uploads
```

### Required Packages
- `@netlify/blobs` - Netlify Blobs storage client

## Development Workflow

1. **Local Development**: Add files manually to `public/media/` 
2. **Production**: Use upload interface - files stored in Netlify Blobs
3. **Mixed**: Files from both sources are listed in admin interface

## Benefits

✅ **Serverless Compatible** - No filesystem write restrictions  
✅ **Scalable Storage** - Netlify Blobs handle large files  
✅ **Automatic Fallback** - Works locally and in production  
✅ **No External Dependencies** - Built into Netlify platform