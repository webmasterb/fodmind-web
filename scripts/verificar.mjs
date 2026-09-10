/**
 * Verificación del build. Comprueba el dist, no el código: lo desplegado es
 * lo que cuenta. Se ejecuta después de `astro build`:
 *
 *   node scripts/verificar.mjs
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
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
  guia: { es: 'guia', en: 'guide', fr: 'guide', de: 'guide', it: 'guida', pt: 'guia' },
  blog: { es: 'blog', en: 'blog', fr: 'blog', de: 'blog', it: 'blog', pt: 'blog' },
};

/** Los mapas de slugs se leen del código, no se repiten aquí. */
const leerConstante = (fichero, constante) => {
  const texto = readFileSync(join(RAIZ, 'src', 'i18n', fichero), 'utf8');
  const lineas = texto.slice(texto.indexOf(`const ${constante}`)).split(/\r?\n/);
  const mapa = {};
  let actual = null;
  for (const linea of lineas) {
    const abre = linea.match(/^  '?([a-zA-Z0-9_-]+)'?: \{$/);
    if (abre) {
      actual = abre[1];
      mapa[actual] = {};
      continue;
    }
    if (linea === '  },') {
      actual = null;
      continue;
    }
    if (linea === '};') break;
    const par = actual && linea.match(/^    ([a-z]{2}): '([^']+)',$/);
    if (par) mapa[actual][par[1]] = par[2];
  }
  return mapa;
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

const indice = leer('sitemap.xml');
ok(indice.includes('<sitemapindex'), 'sitemap.xml es el índice');
ok(
  LANGS.every((lang) => indice.includes(`/sitemap-${lang}.xml`)),
  'sitemap: los 6 sitemaps por idioma en el índice'
);
let urlsTotales = 0;
for (const lang of LANGS) {
  const parcial = leer(`sitemap-${lang}.xml`);
  const urls = (parcial.match(/<loc>/g) ?? []).length;
  urlsTotales += urls;
  ok(urls >= 1800, `sitemap-${lang}: ${urls} URLs`);
  ok(
    parcial.includes(`<loc>https://fodmind.com${base(lang)}/${SEG.alimentos[lang]}/${banana.slug[lang]}/</loc>`),
    `sitemap-${lang}: la ficha de un alimento, en su idioma`
  );
  ok(parcial.includes('x-default'), `sitemap-${lang}: x-default`);
  ok(
    parcial.includes(`<loc>https://fodmind.com${base(lang)}/</loc>`),
    `sitemap-${lang}: su landing`
  );
}
ok(urlsTotales >= 11000, `sitemap: ${urlsTotales} URLs entre los seis`);

// LAS LISTAS POR NIVEL, que son las que contestan a la búsqueda genérica.
const NIVEL_SLUG = leerConstante('niveles.ts', 'NIVEL_SLUG');
for (const nivel of Object.keys(NIVEL_SLUG)) {
  for (const lang of LANGS) {
    ok(
      existsSync(join(DIST, ...dir(lang), SEG.alimentos[lang], NIVEL_SLUG[nivel][lang], 'index.html')),
      `lista ${nivel} ${lang} existe`
    );
  }
}

// LOS 24 POSTS. Desaparecieron enteros del build sin un solo aviso el día que
// el campo del frontmatter se llamó `slug`, que Astro se queda como id.
let postsEnDist = 0;
for (const lang of LANGS) {
  const dirBlog = join(DIST, ...dir(lang), SEG.blog[lang]);
  const entradas = readdirSync(dirBlog).filter((e) => statSync(join(dirBlog, e)).isDirectory());
  postsEnDist += entradas.length;
  ok(entradas.length === 4, `blog ${lang}: ${entradas.length} posts (esperados 4)`);
}
ok(postsEnDist === 24, `blog: ${postsEnDist} posts en el dist`);

// Y LA GUÍA CON SU SLUG TRADUCIDO: el id es inglés y se servía tal cual.
const GUIA_SLUG = leerConstante('guia-slugs.ts', 'GUIA_SLUG');
for (const lang of LANGS) {
  ok(
    existsSync(join(DIST, ...dir(lang), SEG.guia[lang], GUIA_SLUG.elimination[lang], 'index.html')),
    `guía ${lang}: artículo con slug traducido`
  );
}

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
let sinMedicion = 0;
let examinadas = 0;
let sinBanner = 0;
let anclaSuelta = 0;
let conNoreferrer = 0;
const APP_STORE = 'https://apps.apple.com/app/id6795241315';
const PLAY = 'https://play.google.com/store/apps/details?id=com.fodmapguide.app';
/**
 * El id del banner sale de strings.ts, no se repite aquí: si alguien cambia la
 * app, esto tiene que fallar en vez de seguir apuntando a la anterior.
 */
const APP_ID = readFileSync(join(RAIZ, 'src', 'i18n', 'strings.ts'), 'utf8')
  .match(/APP_ID = '(\d+)'/)?.[1];
ok(Boolean(APP_ID) && APP_STORE.endsWith(`id${APP_ID}`), `APP_ID (${APP_ID}) y APP_STORE_URL dicen lo mismo`);
/**
 * Un botón que dice «descargar» y solo desplaza la página.
 *
 * El botón de la cabecera saltaba a la tienda en móvil y el del hero no,
 * porque le faltaba `data-descarga` y nadie lo notó: los dos se ven igual y los
 * dos llevan al mismo ancla. Esto se niega a construir si vuelve a aparecer un
 * `href="#descargar"` sin la marca en el mismo elemento.
 */
const ANCLA = /<a\b[^>]*href="#descargar"[^>]*>/g;
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
      for (const a of contenido.match(ANCLA) || []) {
        if (!a.includes('data-descarga')) anclaSuelta++;
      }
      if (!contenido.includes('name="apple-itunes-app"')) sinBanner++;
      // noreferrer borraría la cabecera Referer y con ella el informe de
      // referentes web de App Store Connect, que es la única atribución que
      // hay sin pagar un SDK.
      if (/<a\b[^>]*(apps\.apple\.com|play\.google\.com)[^>]*noreferrer/.test(contenido)) conNoreferrer++;
      if (!contenido.includes('cloudflareinsights.com/beacon.min.js')) sinMedicion++;
    }
  }
};
escanear(DIST);
ok(restos === 0, `sin restos de plantilla en ${examinadas} HTML`);
ok(sinDescarga === 0, `las ${examinadas} páginas llevan a las dos tiendas`);
// La política de privacidad afirma que se mide; que sea verdad en todas.
ok(sinMedicion === 0, `las ${examinadas} páginas miden visitas, como dice la política`);
ok(sinBanner === 0, `las ${examinadas} páginas llevan la barra nativa de la App Store`);
ok(anclaSuelta === 0, 'ningún botón de descarga se quedó sin data-descarga');
ok(conNoreferrer === 0, 'ningún enlace a las tiendas lleva noreferrer');

/**
 * EL SALTO A LA TIENDA, ejecutando el script TAL COMO SE SIRVE.
 *
 * No se comprueba la intención sino el fichero desplegado: se saca el script
 * del HTML y se corre contra un DOM de mentira con la cadena de agente de cada
 * aparato. Existe porque este salto ya falló en silencio —el botón del hero se
 * quedó meses sin la marca y nadie lo vio, porque un botón que solo desplaza la
 * página se parece mucho a uno que funciona—.
 */
const portada = readFileSync(join(DIST, 'index.html'), 'utf8');
const marca = portada.indexOf('var ua = navigator.userAgent');
const guion = marca < 0 ? null
  : portada.slice(portada.indexOf('>', portada.lastIndexOf('<script', marca)) + 1, portada.indexOf('</script>', marca));
ok(Boolean(guion), 'el script del salto a la tienda está en la página');
if (guion) {
  const APARATOS = [
    ['iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Version/18.0 Mobile/15E148 Safari/604.1', 0, APP_STORE],
    // iPadOS manda cadena de Macintosh desde la 13: sin maxTouchPoints se pierde.
    ['iPad', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Version/18.0 Safari/605.1.15', 5, APP_STORE],
    ['Mac', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Version/18.0 Safari/605.1.15', 0, '#descargar'],
    ['Android', 'Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/120 Mobile Safari/537.36', 5, PLAY],
    ['TikTok/iOS', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) BytedanceWebview/d8a21c6 musical_ly_34.5.0', 0, APP_STORE],
    ['escritorio', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36', 0, '#descargar'],
  ];
  for (const [nombre, ua, toques, espera] of APARATOS) {
    const a = {
      href: '#descargar',
      setAttribute(k, v) { this[k] = v; },
      getAttribute(k) { return this[k]; },
    };
    const ctx = {
      navigator: { userAgent: ua, maxTouchPoints: toques },
      document: { readyState: 'complete', querySelectorAll: () => [a], addEventListener: () => {} },
    };
    createContext(ctx);
    runInContext(guion, ctx);
    ok(a.href === espera, `${nombre} va a ${espera === '#descargar' ? 'la banda de la página' : espera.split('/')[2]}`);
  }
}

console.log(fallos === 0 ? '\nTODO EN VERDE' : `\n${fallos} FALLOS`);
process.exit(fallos === 0 ? 0 : 1);
