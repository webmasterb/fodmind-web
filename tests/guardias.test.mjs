import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const LANGS = ['es', 'en', 'fr', 'de', 'it', 'pt'];
const SEG_ALIMENTOS = { es: 'alimentos', en: 'foods', fr: 'aliments', de: 'lebensmittel', it: 'alimenti', pt: 'alimentos' };
const SEG_GUIA = { es: 'guia', en: 'guide', fr: 'guide', de: 'guide', it: 'guida', pt: 'guia' };
const SEG_BLOG = { es: 'blog', en: 'blog', fr: 'blog', de: 'blog', it: 'blog', pt: 'blog' };
const SEG_LEGAL = {
  privacidad: { es: 'privacidad', en: 'privacy', fr: 'confidentialite', de: 'datenschutz', it: 'privacy', pt: 'privacidade' },
  terminos: { es: 'terminos', en: 'terms', fr: 'conditions', de: 'nutzungsbedingungen', it: 'termini', pt: 'termos' },
};
const CAT_SLUG = JSON.parse(readFileSync(join(RAIZ, 'src', 'lib', 'cat-slug.json'), 'utf8'));

/** El idioma raíz se lee de rutas.ts: aquí no se repite la decisión. */
const rutasTs = readFileSync(join(RAIZ, 'src', 'lib', 'rutas.ts'), 'utf8');
const LOCALE_RAIZ = rutasTs.match(/LOCALE_RAIZ: Locale = '(\w+)'/)?.[1];
const base = (lang) => (lang === LOCALE_RAIZ ? '' : `/${lang}`);

const foods = JSON.parse(readFileSync(join(RAIZ, 'src', 'data', 'foods.json'), 'utf8'));
const guia = JSON.parse(readFileSync(join(RAIZ, 'src', 'data', 'guide.json'), 'utf8'));
const fuentes = JSON.parse(readFileSync(join(RAIZ, 'src', 'data', 'fuentes.json'), 'utf8'));

test('catálogo: 1843 alimentos con nombre en los 6 idiomas', () => {
  assert.equal(foods.length, 1843);
  for (const f of foods) {
    for (const lang of LANGS) {
      assert.ok(f.names[lang]?.trim(), `${f.id}: nombre vacío en ${lang}`);
      assert.ok(f.slug[lang]?.trim(), `${f.id}: slug vacío en ${lang}`);
    }
  }
});

test('slugs únicos por idioma y limpios', () => {
  for (const lang of LANGS) {
    const vistos = new Map();
    for (const f of foods) {
      const s = f.slug[lang];
      assert.equal(vistos.has(s), false, `slug ${lang}/${s} repetido (${f.id} y ${vistos.get(s)})`);
      vistos.set(s, f.id);
      assert.match(s, /^[a-z0-9-]+$/, `slug ${lang}/${s} con caracteres raros`);
    }
  }
});

test('campos del alimento: nivel, categoría, ración y sustitutos existen', () => {
  const ids = new Set(foods.map((f) => f.id));
  const niveles = new Set(['low', 'moderate', 'high']);
  for (const f of foods) {
    assert.ok(niveles.has(f.level), `${f.id}: nivel ${f.level} inválido`);
    assert.ok(CAT_SLUG[f.category], `${f.id}: categoría ${f.category} sin slug`);
    assert.ok(f.safeServingG === null || typeof f.safeServingG === 'number', `${f.id}: ración rara`);
    assert.ok(typeof f.emoji === 'string' && f.emoji.length > 0, `${f.id}: sin emoji`);
    for (const sust of f.sustitutos) {
      assert.ok(ids.has(sust.id), `${f.id}: sustituto ${sust.id} no existe`);
      assert.notEqual(sust.id, f.id, `${f.id}: es su propio sustituto`);
    }
  }
});

test('rutas únicas por idioma: alimentos, categorías, guía, blog y legal no chocan', () => {
  const postsDir = join(RAIZ, 'src', 'content', 'blog');
  const postsPorLang = {};
  for (const lang of LANGS) postsPorLang[lang] = readdirSync(join(postsDir, lang)).map((x) => x.replace(/\.md$/, ''));

  for (const lang of LANGS) {
    const vistos = new Map();
    const anotar = (ruta, quien) => {
      assert.equal(vistos.has(ruta), false, `en ${lang}: ${ruta} choca (${quien} vs ${vistos.get(ruta)})`);
      vistos.set(ruta, quien);
    };
    anotar('', 'landing');
    anotar(SEG_ALIMENTOS[lang], 'índice alimentos');
    for (const catId of Object.keys(CAT_SLUG)) anotar(`${SEG_ALIMENTOS[lang]}/${CAT_SLUG[catId][lang]}`, `categoría ${catId}`);
    for (const f of foods) anotar(`${SEG_ALIMENTOS[lang]}/${f.slug[lang]}`, `alimento ${f.id}`);
    anotar(SEG_GUIA[lang], 'índice guía');
    for (const art of guia) anotar(`${SEG_GUIA[lang]}/${art.id}`, `artículo ${art.id}`);
    anotar(SEG_BLOG[lang], 'índice blog');
    for (const post of postsPorLang[lang]) anotar(`${SEG_BLOG[lang]}/${post}`, `post ${post}`);
    anotar(SEG_LEGAL.privacidad[lang], 'privacidad');
    anotar(SEG_LEGAL.terminos[lang], 'términos');
  }
});

test('guía: artículos completos en 6 idiomas', () => {
  assert.ok(guia.length >= 9);
  for (const art of guia) {
    for (const lang of LANGS) {
      assert.ok(art.title[lang]?.trim(), `${art.id}: título vacío en ${lang}`);
      assert.ok(art.summary[lang]?.trim(), `${art.id}: resumen vacío en ${lang}`);
      assert.ok(art.body[lang]?.trim().length > 200, `${art.id}: cuerpo corto en ${lang}`);
    }
  }
});

test('blog: cada post existe en los 6 idiomas con frontmatter completo', () => {
  const postsDir = join(RAIZ, 'src', 'content', 'blog');
  const langs = readdirSync(postsDir).sort();
  assert.deepEqual(langs, [...LANGS].sort());
  const porLang = {};
  for (const lang of LANGS) {
    porLang[lang] = new Set(readdirSync(join(postsDir, lang)).map((x) => x.replace(/\.md$/, '')));
  }
  for (const post of porLang.es) {
    for (const lang of LANGS) {
      assert.ok(porLang[lang].has(post), `post ${post} falta en ${lang}`);
      const texto = readFileSync(join(postsDir, lang, `${post}.md`), 'utf8');
      assert.match(texto, /^title: '.+'$/m, `${lang}/${post}: sin title`);
      assert.match(texto, /^description: '.+'$/m, `${lang}/${post}: sin description`);
      assert.match(texto, /^fecha: '\d{4}-\d{2}-\d{2}'$/m, `${lang}/${post}: sin fecha`);
    }
  }
});

test('índices de búsqueda: 6 idiomas, un elemento por alimento', () => {
  for (const lang of LANGS) {
    const ruta = join(RAIZ, 'public', 'search', `${lang}.json`);
    assert.ok(existsSync(ruta), `falta search/${lang}.json`);
    const idx = JSON.parse(readFileSync(ruta, 'utf8'));
    assert.equal(idx.length, foods.length, `${lang}: índice desincronizado`);
    for (const entrada of idx) {
      assert.ok(entrada.p.startsWith(`${SEG_ALIMENTOS[lang]}/`), `${lang}: ruta rara ${entrada.p}`);
      assert.ok(['low', 'moderate', 'high'].includes(entrada.l));
    }
  }
});

test('el idioma raíz es uno de los seis y la home lo usa', () => {
  assert.ok(LANGS.includes(LOCALE_RAIZ), `LOCALE_RAIZ ${LOCALE_RAIZ} no es un idioma del sitio`);
  const home = readFileSync(join(RAIZ, 'src', 'pages', 'index.astro'), 'utf8');
  const enLaHome = home.match(/<Landing locale="(\w+)"/)?.[1];
  assert.equal(enLaHome, LOCALE_RAIZ, `la home sirve ${enLaHome} y la raíz es ${LOCALE_RAIZ}`);
});

test('los enlaces internos del blog llevan el prefijo de su idioma y existen', () => {
  const postsDir = join(RAIZ, 'src', 'content', 'blog');
  const indices = (lang) =>
    new Set([
      SEG_ALIMENTOS[lang],
      SEG_GUIA[lang],
      SEG_BLOG[lang],
      SEG_LEGAL.privacidad[lang],
      SEG_LEGAL.terminos[lang],
    ]);

  for (const lang of LANGS) {
    const slugs = new Set(foods.map((f) => f.slug[lang]));
    const articulos = new Set(guia.map((a) => a.id));
    for (const file of readdirSync(join(postsDir, lang))) {
      const texto = readFileSync(join(postsDir, lang, file), 'utf8');
      for (const [, enlace] of texto.matchAll(/\]\((\/[a-z0-9/-]*\/)\)/g)) {
        const pref = base(lang);
        assert.ok(
          pref === '' ? !LANGS.some((l) => enlace.startsWith(`/${l}/`)) : enlace.startsWith(`${pref}/`),
          `${lang}/${file}: ${enlace} no lleva el prefijo de su idioma (${pref || 'raíz'})`
        );
        const trozos = enlace.slice(pref.length).replace(/^\/|\/$/g, '').split('/').filter(Boolean);
        if (trozos.length === 0) continue;
        assert.ok(indices(lang).has(trozos[0]), `${lang}/${file}: ${enlace} no es una sección del sitio`);
        if (trozos.length === 2 && trozos[0] === SEG_ALIMENTOS[lang]) {
          assert.ok(slugs.has(trozos[1]), `${lang}/${file}: enlace a alimento inexistente ${enlace}`);
        }
        if (trozos.length === 2 && trozos[0] === SEG_GUIA[lang]) {
          assert.ok(articulos.has(trozos[1]), `${lang}/${file}: enlace a artículo inexistente ${enlace}`);
        }
      }
    }
  }
});

test('procedencia: los 1843 dicen de dónde salen sus dos números', () => {
  const claves = new Set(['provenanceA', 'provenanceB', 'provenanceC', 'provenanceComposition']);
  for (const f of foods) {
    assert.ok(f.procedencia, `${f.id}: sin procedencia`);
    for (const mitad of ['racion', 'lista']) {
      const m = f.procedencia[mitad];
      assert.ok(claves.has(m.texto), `${f.id}/${mitad}: grado ${m.texto} desconocido`);
      assert.ok(Array.isArray(m.fuentes), `${f.id}/${mitad}: fuentes no es lista`);
      // Grado C es «nadie lo ha medido»: no puede venir con fuente detrás.
      if (m.texto === 'provenanceC') assert.equal(m.fuentes.length, 0, `${f.id}/${mitad}: grado C con fuente`);
    }
  }
});

test('las citas de las notas existen y llevan enlace', () => {
  const porId = new Map(fuentes.notaCitas.map((c) => [c.id, c]));
  for (const f of foods) {
    for (const id of f.notaCitas ?? []) {
      const cita = porId.get(id);
      assert.ok(cita, `${f.id}: cita ${id} sin resolver en fuentes.json`);
      assert.match(cita.url, /^https?:\/\//, `cita ${id}: sin URL`);
      assert.ok(cita.ref?.trim(), `cita ${id}: sin referencia`);
    }
    // Una nota con citas y sin nota sería una cita huérfana en la ficha.
    if (f.notaCitas?.length) assert.ok(f.note, `${f.id}: cita sin nota que respaldar`);
  }
});

test('fuentes: bibliografía, composición y textos completos en 6 idiomas', () => {
  assert.ok(fuentes.bibliografia.length >= 20, 'bibliografía corta');
  assert.ok(fuentes.composicion.length >= 10, 'faltan tablas de composición');
  for (const c of fuentes.composicion) {
    assert.ok(c.quien?.trim(), `${c.id}: sin quién lo publica`);
    assert.ok(c.licencia?.trim(), `${c.id}: sin licencia — las CC BY obligan a nombrarla`);
  }
  for (const [clave, valor] of Object.entries(fuentes.textos)) {
    for (const lang of LANGS) assert.ok(valor[lang]?.trim(), `texto ${clave}: vacío en ${lang}`);
  }
});
