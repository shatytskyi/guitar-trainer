// One-off placeholder icon generator. Run via `node scripts/gen-icons.mjs`
// when sharp is installed. Replaced when Claude Design returns assets.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SQUARE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#f0e6d2"/>
  <text x="50%" y="62%" text-anchor="middle" font-family="Georgia, serif" font-size="320" font-weight="800" fill="#2a2520">A</text>
</svg>`;

const MASKABLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#f0e6d2"/>
  <text x="50%" y="62%" text-anchor="middle" font-family="Georgia, serif" font-size="220" font-weight="800" fill="#2a2520">A</text>
</svg>`;

await mkdir('public/icons', { recursive: true });
await sharp(Buffer.from(SQUARE)).resize(192, 192).png().toFile('public/icons/icon-192.png');
await sharp(Buffer.from(SQUARE)).resize(512, 512).png().toFile('public/icons/icon-512.png');
await sharp(Buffer.from(MASKABLE)).resize(512, 512).png().toFile('public/icons/icon-maskable-512.png');
console.log('icons generated');
