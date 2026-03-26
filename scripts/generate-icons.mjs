// generate-icons.mjs
// Run: node scripts/generate-icons.mjs
// Generates icon-192.png and icon-512.png from the existing icon.png

import { createRequire } from 'module';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

async function run() {
  // Try to load sharp
  let sharp;
  try {
    const require = createRequire(import.meta.url);
    sharp = require('sharp');
    console.log('✅ sharp is available');
  } catch (e) {
    console.error('❌ sharp not available:', e.message);
    console.log('Install with: npm install --save-dev sharp');
    process.exit(1);
  }

  const source = path.join(publicDir, 'icon.png');
  if (!existsSync(source)) {
    console.error('❌ Source icon not found at', source);
    process.exit(1);
  }

  const sizes = [192, 512];
  for (const size of sizes) {
    const dest = path.join(publicDir, `icon-${size}.png`);
    await sharp(source)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(dest);
    console.log(`✅ Generated ${dest}`);
  }

  console.log('Done! Update manifest.json to reference icon-192.png and icon-512.png');
}

run().catch(console.error);
