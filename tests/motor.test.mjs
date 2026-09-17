import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildSync } from 'esbuild';
import { APP, deriva, manifiestoActual, CAMPOS_ALIMENTO } from '../scripts/sincronizar-motor.mjs';

/**
 * EL MOTOR DE LA WEB ES EL DE LA APP, y estas pruebas son las que lo
 * garantizan: que no haya deriva con el repo de la app cuando está en esta
 * máquina, que el catálogo recortado conserve lo que el analizador lee, y que
 * el analizador —empaquetado como lo empaqueta Astro, con el alias `@`—
 * conteste lo mismo que contesta en la app a una etiqueta real.
 */
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');

async function motor() {
  const tmp = join(RAIZ, 'node_modules', '.motor-tmp');
  mkdirSync(tmp, { recursive: true });
  const entrada = join(tmp, 'motor-test-entrada.ts');
  const salida = join(tmp, 'motor-test.mjs');
  if (!existsSync(entrada)) {
    const { writeFileSync } = await import('node:fs');
    writeFileSync(entrada, "export * from '../../src/lib/motor-web';\n");
  }
  buildSync({ entryPoints: [entrada], bundle: true, format: 'esm', platform: 'node', outfile: salida, alias: { '@': join(RAIZ, 'src', 'motor') }, logLevel: 'silent' });
  return import(`${pathToFileURL(salida).href}?${Date.now()}`);
}

test('motor: sin deriva con la app (si el repo de la app está en esta máquina)', (t) => {
  if (!existsSync(APP)) { t.skip('el repo de la app no está aquí'); return; }
  const d = deriva();
  assert.deepEqual(d, [], `la app cambió ${d.join(', ')}: node scripts/sincronizar-motor.mjs`);
});

test('motor: el manifiesto existe y nombra el commit de la app', () => {
  const m = manifiestoActual();
  assert.ok(m && /^[0-9a-f]{7,}$/.test(m.app), 'manifiesto con commit');
  assert.ok(Object.keys(m.hashes).length >= 14);
});

test('motor: el catálogo recortado conserva lo que el analizador lee', async () => {
  const m = await motor();
  // Se lee el fichero generado como texto: 1843 alimentos, y cada uno con id,
  // nombres en los seis idiomas y los grados de verificación.
  const src = readFileSync(join(RAIZ, 'src', 'motor', 'data', 'foods', 'index.ts'), 'utf8');
  const json = JSON.parse(src.slice(src.indexOf('= ') + 2, src.indexOf(' as unknown as Food[]')));
  assert.equal(json.length, 1843);
  for (const f of json) {
    for (const c of ['id', 'category', 'level', 'fodmaps', 'names']) assert.ok(c in f, `${f.id} sin ${c}`);
    for (const l of ['es', 'en', 'fr', 'de', 'it', 'pt']) assert.ok(f.names[l], `${f.id} sin nombre ${l}`);
    assert.ok(f.verificacion?.fodmaps?.grado && f.verificacion?.racion?.grado, `${f.id} sin grados`);
    for (const k of Object.keys(f)) assert.ok([...CAMPOS_ALIMENTO, 'verificacion'].includes(k), `${f.id} trae ${k}, que no se lee`);
  }
  assert.ok(m.analiza, 'motor cargado');
});

test('motor: una etiqueta inglesa da 4 altos, 2 a vigilar y 3 sin problema, como en la app', async () => {
  const m = await motor();
  const an = m.analiza('Wheat flour, sugar, palm oil, onion powder, whey, honey, sorbitol (E420), salt, natural flavouring', 'en');
  assert.deepEqual(an.marcador, { altos: 4, vigilar: 2, sinProblema: 3 });
  assert.deepEqual(an.altos.map((f) => m.nombreDe(f, 'en')), ['Wheat', 'Onion', 'Honey', 'Sorbitol (E420)']);
  assert.deepEqual(an.grupos.vigilar.map((f) => m.nombreDe(f, 'en')), ['Whey', 'Natural flavouring']);
  assert.equal(an.rota, false);
});

test('motor: la misma etiqueta en español y en alemán rodea lo mismo', async () => {
  const m = await motor();
  const es = m.analiza('Harina de trigo, azúcar, aceite de palma, cebolla en polvo, suero de leche, miel, sorbitol (E420), sal', 'es');
  const de = m.analiza('Weizenmehl, Zucker, Palmöl, Zwiebelpulver, Molke, Honig, Sorbit (E420), Salz', 'de');
  assert.equal(es.marcador.altos, 4);
  assert.equal(de.marcador.altos, 4);
  assert.deepEqual(es.altos.map((f) => m.nombreDe(f, 'es')), de.altos.map((f) => m.nombreDe(f, 'es')));
});

test('motor: el aceite de ajo infusionado y las trazas no cuentan como altos', async () => {
  // «garlic infused oil» está en el excludeIf del diccionario de la app; «garlic
  // oil» a secas no, y la web dice lo que dice la app: eso se arregla allí.
  const m = await motor();
  const an = m.analiza('Sunflower oil, garlic infused oil, salt. May contain traces of milk and wheat.', 'en');
  assert.equal(an.marcador.altos, 0, `altos: ${an.altos.map((f) => m.nombreDe(f, 'en')).join(', ')}`);
});

test('motor: una lista vacía o sin sentido es una lectura rota, no un verde', async () => {
  const m = await motor();
  assert.equal(m.analiza('', 'en').rota, true);
  assert.equal(m.analiza('xqzv lorem ipsum', 'en').marcador.sinProblema, 0);
});
