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

const foods = JSON.parse(readFileSync(join(RAIZ, 'src', 'data', 'foods.json'), 'utf8'));
const guia = JSON.parse(readFileSync(join(RAIZ, 'src', 'data', 'guide.json'), 'utf8'));

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

test('los enlaces internos del blog apuntan a slugs que existen', () => {
  const postsDir = join(RAIZ, 'src', 'content', 'blog');
  const slugsPorLang = {};
  for (const lang of LANGS) {
    slugsPorLang[lang] = new Set(foods.map((f) => f.slug[lang]));
  }
  for (const lang of LANGS) {
    for (const file of readdirSync(join(postsDir, lang))) {
      const texto = readFileSync(join(postsDir, lang, file), 'utf8');
      const enlaces = [...texto.matchAll(/\]\((\/[a-z0-9/-]*\/)\)/g)].map((m) => m[1]);
      for (const enlace of enlaces) {
        const trozos = enlace.replace(/^\/|\/$/g, '').split('/');
        if (trozos.length === 2 && trozos[0] === SEG_ALIMENTOS[lang]) {
          assert.ok(slugsPorLang[lang].has(trozos[1]), `${lang}/${file}: enlace a alimento inexistente ${enlace}`);
        }
      }
    }
  }
});
