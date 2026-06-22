// Generates the Open Graph preview image (public/og-image.png, 1200x630)
// used by LinkedIn and other social platforms. Run: node scripts/gen-og-image.mjs
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = resolve(__dirname, '../public/og-image.png');

const BRAND = '#0f15fd';
const GOLD = '#f1be51';

// The 4 leaf paths of the logo (viewBox 0 0 455 455), placed via a transform.
const logoPaths = `
  <path d="m302.16,316.77c-76.98,1.24-140.96,50.21-163.47,121.28,26.49,10.8,55.44,16.8,85.8,16.8,93.98,0,174.63-57.01,209.29-138.33-43.88-.18-87.76-.46-131.62.25"/>
  <path d="m152.86,138.35c78.19-.88,143.48-49.69,166.39-117.65C290.4,7.44,258.32,0,224.49,0,130.46,0,49.76,57.07,15.13,138.47c45.91.12,91.83.4,137.73-.12"/>
  <path d="m392.21,266.63c25.47-15.7,45.13-34.74,58.96-56.8-5.67-74.07-46.77-138.18-106.44-175.43-38.91,79.79-77.95,159.83-117.46,240.83,57.07,25.19,112.59,23.67,164.94-8.61"/>
  <path d="m6.12,251.54c-2.24,4.03-4.24,8.14-6.12,12.28,11.17,69.43,53.77,128.31,112.75,161.65,40.07-82.16,79.93-163.88,119.75-245.53-56.89-34.36-172.23-25.87-226.38,71.59"/>
`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#ffffff"/>
  <rect x="0" y="0" width="1200" height="12" fill="${BRAND}"/>

  <g transform="translate(90,150) scale(0.62)" fill="${BRAND}">${logoPaths}</g>

  <text x="385" y="250" font-family="Helvetica, Arial, sans-serif" font-size="104" font-weight="700" fill="${BRAND}">GreenScore</text>
  <text x="388" y="318" font-family="Helvetica, Arial, sans-serif" font-size="31" fill="#222222">Évaluez l'éco-conception de vos projets numériques</text>
  <text x="388" y="374" font-family="Helvetica, Arial, sans-serif" font-size="29" fill="#666666">API Green Score · EROOM · Open source</text>

  <rect x="0" y="548" width="1200" height="82" fill="${BRAND}"/>
  <text x="90" y="600" font-family="Helvetica, Arial, sans-serif" font-size="34" font-weight="700" fill="#ffffff">greenscore.zatsit.fr</text>
  <text x="1110" y="600" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="30" fill="${GOLD}">by zatsit</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(out);
console.log('Generated', out);
