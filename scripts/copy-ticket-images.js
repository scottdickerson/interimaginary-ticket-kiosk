const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const srcDir = path.join(__dirname, '..', 'src', 'data', 'imgs');
const destDir = path.join(__dirname, '..', 'public', 'tickets');

if (!fs.existsSync(srcDir)) {
  console.warn('Ticket images source not found:', srcDir);
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.png'));

async function copyRotated() {
  for (const file of files) {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    await sharp(srcPath)
      .rotate(-90)
      .png()
      .toFile(destPath);
  }
  console.log(`Copied and rotated ${files.length} ticket images (portrait) to public/tickets/`);
}

copyRotated().catch((err) => {
  console.error('copy-ticket-images failed:', err);
  process.exit(1);
});
