import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSync } from 'esbuild';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/**
 * LA TIRA DEL ESCÁNER DICE EN CADA PÁGINA LO DE SU ALIMENTO. Se recorre
 * lib/tira.ts con los 1.843 alimentos en los seis idiomas —empaquetado con
 * esbuild como el motor— y se exige: que cada título nombre su alimento, que
 * no quede ninguna plantilla sin rellenar, que no haya dos fichas con el
 * mismo título, que lo que rota detrás de un alimento alto sea más bajo que
 * él, y que la ración lleve la coma de cada idioma.
 */
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOCALES = ['en', 'es', 'fr', 'de', 'it', 'pt'];
const RANGO = { low: 0, moderate: 1, high: 2 };
const RANGO_NIVEL = { bajo: 0, medio: 1, alto: 2 };
const foods = JSON.parse(readFileSync(join(RAIZ, 'src', 'data', 'foods.json'), 'utf8'));
const guia = JSON.parse(readFileSync(join(RAIZ, 'src', 'data', 'guide.json'), 'utf8'));

let cache;
async function modulo() {
  if (cache) return cache;
  const tmp = join(RAIZ, 'node_modules', '.tira-tmp');
  mkdirSync(tmp, { recursive: true });
  const salida = join(tmp, 'tira.mjs');
  buildSync({ entryPoints: [join(RAIZ, 'src', 'lib', 'tira.ts')], bundle: true, format: 'esm', platform: 'node', outfile: salida, logLevel: 'silent' });
  cache = await import(`${pathToFileURL(salida).href}?${Date.now()}`);
  return cache;
}

const textos = (v) => [
  v.a.titulo, ...v.a.filas.flatMap((f) => [f.nombre, f.chip]),
  v.b.titulo, v.b.texto ?? '', ...v.b.filas.flatMap((f) => [f.nombre, f.racion]),
  v.c.titulo, v.c.texto ?? '', v.c.racion ?? '',
  v.d.titulo, ...v.d.filas.flatMap((f) => [f.nombre, f.racion]),
  v.e.titulo, v.e.texto, v.e.etiqueta, ...v.e.trozos.map((t) => t.t), v.e.pie,
];

test('tira: cada ficha, en los seis idiomas, nombra su alimento y no deja huecos', async () => {
  const m = await modulo();
  const malos = [];
  for (const l of LOCALES) {
    for (const f of foods) {
      const v = m.vistaTira(l, m.focoFicha(f));
      for (const t of textos(v)) if (typeof t !== 'string' || /[{}]|undefined|NaN|null/.test(t)) malos.push(`${l} ${f.id}: «${t}»`);
      if (v.a.filas.length !== 3) malos.push(`${l} ${f.id}: ${v.a.filas.length} filas`);
      if (v.a.filas[0].nombre !== f.names[l]) malos.push(`${l} ${f.id}: la primera fila no es el alimento`);
      const corto = m.nombreTitulo(f, l);
      if (!f.names[l].startsWith(corto.replace(/…$/, ''))) malos.push(`${l} ${f.id}: el título no empieza como el nombre: «${corto}»`);
      for (const t of [v.a.titulo, v.b.titulo, v.c.titulo, v.d.titulo, v.e.titulo]) if (!t.includes(corto)) malos.push(`${l} ${f.id}: «${t}»`);
    }
  }
  assert.deepEqual(malos.slice(0, 10), [], `${malos.length} fallos`);
});

test('tira: dos fichas distintas nunca llevan el mismo título', async () => {
  const m = await modulo();
  const repetidos = [];
  for (const l of LOCALES) {
    const vistos = new Map();
    for (const f of foods) {
      const titulo = m.vistaTira(l, m.focoFicha(f)).d.titulo;
      const otro = vistos.get(titulo);
      if (otro && otro.names[l] !== f.names[l]) repetidos.push(`${l}: «${titulo}» en ${otro.id} y ${f.id}`);
      vistos.set(titulo, f);
    }
  }
  assert.deepEqual(repetidos, []);
});

test('tira: detrás de un alimento alto o moderado rotan alternativas más bajas; detrás de uno bajo, contraste', async () => {
  const m = await modulo();
  const malos = [];
  for (const f of foods) {
    const filas = m.vistaTira('es', m.focoFicha(f)).a.filas.slice(1);
    for (const x of filas) {
      const r = RANGO_NIVEL[x.nivel];
      if (RANGO[f.level] > 0 ? r >= RANGO[f.level] : r === 0) malos.push(`${f.id} (${f.level}) → ${x.nombre} (${x.nivel})`);
    }
  }
  assert.deepEqual(malos.slice(0, 10), [], `${malos.length} fallos`);
});

test('tira: la ración sale con el separador decimal de cada idioma', async () => {
  const m = await modulo();
  const pan = foods.find((f) => f.id === 'wheat-bread');
  const esperado = { es: 'hasta 24,5 g', en: 'up to 24.5 g', fr: 'jusqu’à 24,5 g', de: 'bis 24,5 g', it: 'fino a 24,5 g', pt: 'até 24,5 g' };
  for (const l of LOCALES) assert.equal(m.vistaTira(l, m.focoFicha(pan)).d.filas[0].racion, esperado[l], l);
  const ajo = foods.find((f) => f.id === 'garlic');
  assert.equal(m.vistaTira('es', m.focoFicha(ajo)).d.filas[0].racion, 'evitar');
});

test('tira: sin alimentos dice lo general; la guía y el blog llevan el suyo', async () => {
  const m = await modulo();
  assert.equal(m.vistaTira('es').a.titulo, 'Escanea la etiqueta');
  for (const art of guia) assert.equal(m.focoGuia(art.id).length, 3, `guía ${art.id} sin alimento`);
  const post = readFileSync(join(RAIZ, 'src', 'content', 'blog', 'es', 'lactosa-o-fodmap.md'), 'utf8');
  assert.equal(m.focoPost(post, 'es')[0]?.id, 'cow-milk');
  for (const l of LOCALES) {
    const cat = [...new Set(foods.map((f) => f.category))];
    for (const c of cat) assert.ok(m.focoCategoria(c).length >= 1, `${l} categoría ${c}`);
  }
});

test('tira: lo que rota lleva su turno por clase, no por posición', () => {
  const src = readFileSync(join(RAIZ, 'src', 'components', 'TiraEscaner.astro'), 'utf8');
  assert.ok(!/(tb-esq\.col|tb-badge|tb-nom|ta-res|td-card):nth-/.test(src), 'turnos por nth-*: el visor desincroniza marco, veredicto y nombre');
});

test('tira: un toque en cualquier sitio de la tira, menos la X, es el botón', () => {
  const src = readFileSync(join(RAIZ, 'src', 'components', 'TiraEscaner.astro'), 'utf8');
  assert.ok(src.includes("closest('a, .tira-x')") && src.includes('boton.click()'), 'la tira ya no reenvía el toque al enlace');
});
