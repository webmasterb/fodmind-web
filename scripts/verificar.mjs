/**
 * Verificación del build. Comprueba el dist, no el código: lo desplegado es
 * lo que cuenta. Se ejecuta después de `astro build`:
 *
 *   node scripts/verificar.mjs
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(RAIZ, 'dist');
const LANGS = ['es', 'en', 'fr', 'de', 'it', 'pt'];
const SEG = {
  alimentos: { es: 'alimentos', en: 'foods', fr: 'aliments', de: 'lebensmittel', it: 'alimenti', pt: 'alimentos' },
};

let fallos = 0;
const ok = (cond, mensaje) => {
  if (cond) console.log(`  OK  ${mensaje}`);
  else {
    fallos++;
    console.log(`  X   ${mensaje}`);
  }
};

const leer = (ruta) => readFileSync(join(DIST, ruta), 'utf8');

console.log('dist/ — lo desplegable, medido');

ok(existsSync(join(DIST, 'index.html')), 'landing es existe');
ok(existsSync(join(DIST, 'robots.txt')), 'robots.txt existe');
for (const lang of LANGS) {
  if (lang !== 'es') ok(existsSync(join(DIST, lang, 'index.html')), `landing ${lang} existe`);
}

const landing = leer('index.html');
ok(landing.includes('application/ld+json') && landing.includes('SoftwareApplication'), 'landing: JSON-LD SoftwareApplication');
ok(landing.includes('FAQPage'), 'landing: JSON-LD FAQPage');
ok((landing.match(/rel="alternate" hreflang=/g) ?? []).length === 7, 'landing: 6 hreflang + x-default');
ok(landing.includes('rel="canonical"'), 'landing: canonical');

const banana = JSON.parse(readFileSync(join(RAIZ, 'src', 'data', 'foods.json'), 'utf8')).find((f) => f.id === 'banana-unripe');
const sandia = JSON.parse(readFileSync(join(RAIZ, 'src', 'data', 'foods.json'), 'utf8')).find((f) => f.id === 'watermelon');

for (const lang of LANGS) {
  const ruta = lang === 'es' ? `${SEG.alimentos[lang]}/${banana.slug[lang]}/index.html` : `${lang}/${SEG.alimentos[lang]}/${banana.slug[lang]}/index.html`;
  const html = leer(ruta);
  ok(html.includes('100 g'), `banana ${lang}: ración 100 g`);
  ok((html.match(/rel="alternate" hreflang=/g) ?? []).length === 7, `banana ${lang}: hreflang completo`);
  ok(html.includes('BreadcrumbList') && html.includes('FAQPage'), `banana ${lang}: JSON-LD`);
}

ok(leer(`${SEG.alimentos.es}/${sandia.slug.es}/index.html`).includes('9,4'), 'sandía es: coma decimal (9,4)');
ok(leer(`en/${SEG.alimentos.en}/${sandia.slug.en}/index.html`).includes('9.4'), 'sandía en: punto decimal (9.4)');
ok(!leer(`${SEG.alimentos.es}/${sandia.slug.es}/index.html`).includes('9.4'), 'sandía es: sin punto decimal');

const sitemap = leer('sitemap.xml');
const urls = (sitemap.match(/<loc>/g) ?? []).length;
ok(urls >= 11000, `sitemap: ${urls} URLs`);
ok(sitemap.includes('x-default'), 'sitemap: x-default');
ok(
  LANGS.every((lang) => sitemap.includes(`${lang === 'es' ? '' : '/' + lang}/${SEG.alimentos[lang]}/${banana.slug[lang]}/`)),
  'sitemap: las 6 URLs de un alimento'
);

for (const lang of LANGS) ok(existsSync(join(DIST, 'search', `${lang}.json`)), `índice de búsqueda ${lang} desplegado`);

let restos = 0;
let examinadas = 0;
const escanear = (dir) => {
  for (const entrada of readdirSync(dir)) {
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) escanear(ruta);
    else if (entrada.endsWith('.html')) {
      examinadas++;
      const contenido = readFileSync(ruta, 'utf8');
      if (contenido.includes('{name}') || contenido.includes('>undefined<') || contenido.includes('NaN</')) restos++;
    }
  }
};
escanear(DIST);
ok(restos === 0, `sin restos de plantilla en ${examinadas} HTML`);

console.log(fallos === 0 ? '\nTODO EN VERDE' : `\n${fallos} FALLOS`);
process.exit(fallos === 0 ? 0 : 1);
