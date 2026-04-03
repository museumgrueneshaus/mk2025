#!/bin/bash
# Convert videos to Raspberry Pi compatible format
# H.264 Main Profile, AAC audio, web-optimized

cd ~/Desktop/museum-videos

echo "Starting conversion..."

for file in clip*.mp4; do
  echo ""
  echo "===================="
  echo "Converting: $file"
  echo "===================="

  ffmpeg -i "$file" \
    -c:v libx264 -profile:v main -level:v 4.1 \
    -pix_fmt yuv420p \
    -preset medium \
    -crf 23 \
    -maxrate 2M -bufsize 4M \
    -c:a aac -b:a 128k -ar 48000 \
    -movflags +faststart \
    "pi-compatible/${file%.mp4}-pi.mp4" \
    -y

  if [ $? -eq 0 ]; then
    echo "✓ $file converted successfully"
  else
    echo "✗ Error converting $file"
  fi
done

echo ""
echo "===================="
echo "Conversion complete!"
echo "===================="
ls -lh pi-compatible/
