/**
 * Genera la imagen social (1200×630) en public/og.png.
 *
 *   node scripts/og.mjs
 *
 * Se guarda en el repo en vez de generarse en cada build: el contenedor de
 * Coolify no tiene por qué traer sharp, y una imagen que no cambia no merece
 * una dependencia de build que pueda tumbar un despliegue.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const W = 1200;
const H = 630;

const fondo = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="#faf7ef"/>
  <rect x="0" y="0" width="${W}" height="10" fill="#3a7d44"/>
  <text x="96" y="300" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="82" font-weight="700" fill="#26251f">Fodmind</text>
  <text x="96" y="372" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="40" fill="#3a7d44">FODMAP scanner</text>
  <text x="96" y="446" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="30" fill="#6b675c">1,843 foods · safe serving in grams · 6 languages</text>
  <text x="96" y="512" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="26" fill="#6b675c">fodmind.com · free on iOS and Android</text>
</svg>`);

// Esquinas redondeadas: el icono trae su propio fondo y sin la máscara se
// recorta como un cuadro pegado sobre el crema de la tarjeta.
const R = 48;
const mascara = Buffer.from(
  `<svg width="240" height="240" xmlns="http://www.w3.org/2000/svg"><rect width="240" height="240" rx="${R}" ry="${R}" fill="#fff"/></svg>`
);
const icono = await sharp(join(RAIZ, 'public', 'icon.png'))
  .resize(240, 240)
  .composite([{ input: mascara, blend: 'dest-in' }])
  .png()
  .toBuffer();

const salida = await sharp(fondo)
  .composite([{ input: icono, top: 195, left: 840 }])
  .png()
  .toBuffer();

mkdirSync(join(RAIZ, 'public'), { recursive: true });
writeFileSync(join(RAIZ, 'public', 'og.png'), salida);

const { width, height } = await sharp(salida).metadata();
console.log(`public/og.png — ${width}×${height}, ${(salida.length / 1024).toFixed(1)} kB`);
