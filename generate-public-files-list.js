const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const outputFile = path.join(publicDir, 'files.json');

const mimeTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.csv': 'text/csv',
  '.zip': 'application/zip',
};

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

const entries = fs.readdirSync(publicDir)
  .filter(name => {
    const stat = fs.statSync(path.join(publicDir, name));
    return stat.isFile() && name !== 'files.json';
  })
  .map(name => {
    const filePath = path.join(publicDir, name);
    const stat = fs.statSync(filePath);
    return {
      id: Buffer.from(name).toString('base64'),
      name,
      path: name,
      mimeType: getMimeType(name),
      size: stat.size,
      modifiedTime: stat.mtime.toISOString(),
    };
  });

fs.writeFileSync(outputFile, JSON.stringify(entries, null, 2));
console.log(`Generated files.json with ${entries.length} entries.`);
