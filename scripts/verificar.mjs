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
const LANGS = ['en', 'es', 'fr', 'de', 'it', 'pt'];
/** El idioma raíz se lee de rutas.ts: aquí no se repite la decisión. */
const LOCALE_RAIZ = readFileSync(join(RAIZ, 'src', 'lib', 'rutas.ts'), 'utf8').match(/LOCALE_RAIZ: Locale = '(\w+)'/)?.[1];
const base = (lang) => (lang === LOCALE_RAIZ ? '' : `/${lang}`);
const dir = (lang) => (lang === LOCALE_RAIZ ? [] : [lang]);
const SEG = {
  alimentos: { es: 'alimentos', en: 'foods', fr: 'aliments', de: 'lebensmittel', it: 'alimenti', pt: 'alimentos' },
};
const LOCALE_TAG = { es: 'es-ES', en: 'en', fr: 'fr-FR', de: 'de-DE', it: 'it-IT', pt: 'pt-PT' };

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

ok(existsSync(join(DIST, 'index.html')), `landing ${LOCALE_RAIZ} existe (raíz)`);
ok(existsSync(join(DIST, 'robots.txt')), 'robots.txt existe');
for (const lang of LANGS) {
  if (lang !== LOCALE_RAIZ) ok(existsSync(join(DIST, lang, 'index.html')), `landing ${lang} existe`);
}
ok(
  leer('index.html').includes(`<html lang="${LOCALE_TAG[LOCALE_RAIZ]}"`),
  `la raíz se sirve en ${LOCALE_RAIZ}`
);
ok(
  leer('index.html').includes(`hreflang="x-default" href="https://fodmind.com/"`),
  'x-default apunta a la raíz'
);

const landing = leer('index.html');
ok(landing.includes('application/ld+json') && landing.includes('SoftwareApplication'), 'landing: JSON-LD SoftwareApplication');
ok(landing.includes('FAQPage'), 'landing: JSON-LD FAQPage');
ok((landing.match(/rel="alternate" hreflang=/g) ?? []).length === 7, 'landing: 6 hreflang + x-default');
ok(landing.includes('rel="canonical"'), 'landing: canonical');

const banana = JSON.parse(readFileSync(join(RAIZ, 'src', 'data', 'foods.json'), 'utf8')).find((f) => f.id === 'banana-unripe');
const sandia = JSON.parse(readFileSync(join(RAIZ, 'src', 'data', 'foods.json'), 'utf8')).find((f) => f.id === 'watermelon');

for (const lang of LANGS) {
  const ruta = [...dir(lang), SEG.alimentos[lang], banana.slug[lang], 'index.html'].join('/');
  const html = leer(ruta);
  ok(html.includes('100 g'), `banana ${lang}: ración 100 g`);
  ok((html.match(/rel="alternate" hreflang=/g) ?? []).length === 7, `banana ${lang}: hreflang completo`);
  ok(html.includes('BreadcrumbList') && html.includes('FAQPage'), `banana ${lang}: JSON-LD`);
}

const sandiaEs = [...dir('es'), SEG.alimentos.es, sandia.slug.es, 'index.html'].join('/');
const sandiaEn = [...dir('en'), SEG.alimentos.en, sandia.slug.en, 'index.html'].join('/');
ok(leer(sandiaEs).includes('9,4'), 'sandía es: coma decimal (9,4)');
ok(leer(sandiaEn).includes('9.4'), 'sandía en: punto decimal (9.4)');
ok(!leer(sandiaEs).includes('9.4'), 'sandía es: sin punto decimal');

const sitemap = leer('sitemap.xml');
const urls = (sitemap.match(/<loc>/g) ?? []).length;
ok(urls >= 11000, `sitemap: ${urls} URLs`);
ok(sitemap.includes('x-default'), 'sitemap: x-default');
ok(
  LANGS.every((lang) => sitemap.includes(`${base(lang)}/${SEG.alimentos[lang]}/${banana.slug[lang]}/`)),
  'sitemap: las 6 URLs de un alimento'
);
ok(
  LANGS.every((lang) => sitemap.includes(`<loc>https://fodmind.com${base(lang)}/</loc>`)),
  'sitemap: una landing por idioma, no seis veces la raíz'
);

for (const lang of LANGS) ok(existsSync(join(DIST, 'search', `${lang}.json`)), `índice de búsqueda ${lang} desplegado`);

// LA PÁGINA DE FUENTES, que es donde se cumplen las licencias CC BY de las
// tablas de composición: la web publica los mismos números que la app.
const SEG_FUENTES = { es: 'fuentes', en: 'sources', fr: 'sources', de: 'quellen', it: 'fonti', pt: 'fontes' };
for (const lang of LANGS) {
  ok(
    existsSync(join(DIST, ...dir(lang), SEG_FUENTES[lang], 'index.html')),
    `página de fuentes ${lang} existe`
  );
}
const fuentesJson = JSON.parse(readFileSync(join(RAIZ, 'src', 'data', 'fuentes.json'), 'utf8'));
const fuentesEn = leer(join('sources', 'index.html'));
ok(
  fuentesJson.composicion.every((c) => fuentesEn.includes(c.quien)),
  `fuentes: las ${fuentesJson.composicion.length} tablas de composición, con su licencia`
);
ok(
  fuentesJson.bibliografia.every((c) => fuentesEn.includes(c.url)),
  `fuentes: las ${fuentesJson.bibliografia.length} referencias enlazadas`
);

// LA PROCEDENCIA, que es el dato que la app enseña y la web no enseñaba.
const manzanaEn = leer([...dir('en'), SEG.alimentos.en, 'apple', 'index.html'].join('/'));
ok(manzanaEn.includes(fuentesJson.textos.provenanceA.en), 'manzana en: grado de la procedencia');
ok(manzanaEn.includes(fuentesJson.textos.provenanceFrom.en), 'manzana en: quién lo publicó');
const cebollaEn = leer([...dir('en'), SEG.alimentos.en, 'onion', 'index.html'].join('/'));
ok(cebollaEn.includes('Muir JG'), 'cebolla en: la nota lleva su cita');

let restos = 0;
let sinDescarga = 0;
let examinadas = 0;
const APP_STORE = 'https://apps.apple.com/app/id6795241315';
const PLAY = 'https://play.google.com/store/apps/details?id=com.fodmapguide.app';
const escanear = (dir) => {
  for (const entrada of readdirSync(dir)) {
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) escanear(ruta);
    else if (entrada.endsWith('.html')) {
      examinadas++;
      const contenido = readFileSync(ruta, 'utf8');
      if (contenido.includes('{name}') || contenido.includes('>undefined<') || contenido.includes('NaN</')) restos++;
      // La app se descarga desde CUALQUIER página: es a lo que viene el
      // tráfico del buscador. Sin esto, basta olvidar el CTA en una plantilla
      // nueva para tener 1.843 fichas sin salida a la tienda.
      if (!contenido.includes(APP_STORE) || !contenido.includes(PLAY)) sinDescarga++;
    }
  }
};
escanear(DIST);
ok(restos === 0, `sin restos de plantilla en ${examinadas} HTML`);
ok(sinDescarga === 0, `las ${examinadas} páginas llevan a las dos tiendas`);

console.log(fallos === 0 ? '\nTODO EN VERDE' : `\n${fallos} FALLOS`);
process.exit(fallos === 0 ? 0 : 1);
