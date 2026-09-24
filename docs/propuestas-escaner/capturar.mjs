// Fotografía las propuestas de propuestas.html: un PNG con las cinco, un PNG
// por propuesta en un instante representativo y un GIF por propuesta con el
// ciclo entero. Las animaciones se pausan y se colocan a mano en cada
// instante (Web Animations API), así los fotogramas salen a tiempo exacto
// aunque la captura tarde lo que tarde.
//
//   node docs/propuestas-escaner/capturar.mjs
import { createRequire } from 'node:module';
import { mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire('C:/app_appstore_fodmaps/package.json');
const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const FFMPEG = 'C:/yt-dlp/ffmpeg.exe';
const DIR = path.dirname(fileURLToPath(import.meta.url));
const SALIDA = path.join(DIR, 'salida');
const FPS = 12;
const SEG = 9;
const INSTANTE = { A: 2.2, B: 2.1, C: 3.0, D: 2.4, E: 1.9 };

rmSync(SALIDA, { recursive: true, force: true });
mkdirSync(SALIDA, { recursive: true });

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars'] });
const page = await browser.newPage();
await page.setViewport({ width: 1240, height: 900, deviceScaleFactor: 2 });
await page.goto('file:///' + path.join(DIR, 'propuestas.html').replace(/\\/g, '/'), { waitUntil: 'load' });
await new Promise((r) => setTimeout(r, 400));

const fija = (t) => page.evaluate((ms) => {
  for (const a of document.getAnimations()) { a.pause(); a.currentTime = ms; }
}, t * 1000);

await fija(2.2);
await page.screenshot({ path: path.join(SALIDA, 'todas.png'), fullPage: true });

for (const id of ['A', 'B', 'C', 'D', 'E']) {
  const movil = await page.$(`#${id} .movil`);
  await fija(INSTANTE[id]);
  await movil.screenshot({ path: path.join(SALIDA, `${id}.png`) });

  const cuadros = path.join(SALIDA, `cuadros-${id}`);
  mkdirSync(cuadros);
  const n = FPS * SEG;
  for (let i = 0; i < n; i += 1) {
    await fija(i / FPS);
    await movil.screenshot({ path: path.join(cuadros, `f${String(i).padStart(4, '0')}.png`) });
  }
  execFileSync(FFMPEG, [
    '-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(cuadros, 'f%04d.png'),
    '-vf', 'scale=562:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=160[p];[s1][p]paletteuse=dither=bayer:bayer_scale=4',
    path.join(SALIDA, `${id}.gif`),
  ]);
  rmSync(cuadros, { recursive: true, force: true });
  console.log(id, 'listo');
}

await browser.close();
