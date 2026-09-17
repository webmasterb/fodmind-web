import test from 'node:test';
import assert from 'node:assert/strict';
import { lee, compila } from '../src/lib/lector-palabras.mjs';

/**
 * El lector de la web rodea lo que es un FODMAP por sí mismo y deja en paz
 * el aceite de ajo, el almidón de trigo y la palabra dentro de otra. Cada
 * caso de aquí salió de una lista real o de un fallo visto: el «trigo» de
 * «almidón de trigo» lo pescaba el patrón portugués antes de juntar las
 * exclusiones de los dos idiomas.
 */
const palabras = (texto) => lee(texto).map((t) => t.palabra.toLowerCase());

test('lector: los seis idiomas rodean cebolla, ajo y trigo', () => {
  assert.deepEqual(palabras('Onion powder, garlic, wheat flour'), ['onion', 'garlic', 'wheat flour']);
  assert.deepEqual(palabras('Cebolla en polvo, ajo deshidratado, harina de trigo'), ['cebolla', 'ajo', 'harina de trigo']);
  assert.deepEqual(palabras("Oignon, ail, farine de blé"), ['oignon', 'ail', 'farine de blé']);
  assert.deepEqual(palabras('Zwiebelpulver, Knoblauchgranulat, Weizenmehl'), ['zwiebelpulver', 'knoblauchgranulat', 'weizenmehl']);
  assert.deepEqual(palabras('Cipolla, aglio, farina di frumento'), ['cipolla', 'aglio', 'farina di frumento']);
  assert.deepEqual(palabras('Cebola, alho, farinha de trigo'), ['cebola', 'alho', 'farinha de trigo']);
});

test('lector: el aceite y las fracciones del trigo no se rodean', () => {
  assert.deepEqual(palabras('Sunflower oil, garlic oil, onion oil, wheat starch, wheat gluten'), []);
  assert.deepEqual(palabras('Aceite de ajo, aceite de cebolla, almidón de trigo, gluten de trigo'), []);
  assert.deepEqual(palabras("Huile d'ail, huile d’ail, amidon de blé, gluten de blé"), []);
  assert.deepEqual(palabras('Knoblauchöl, Zwiebelöl, Weizenstärke, Weizengluten'), []);
  assert.deepEqual(palabras("Olio all'aglio, amido di frumento"), []);
  assert.deepEqual(palabras('Óleo de alho, amido de trigo'), []);
});

test('lector: la palabra dentro de otra no cuenta y el tramo largo manda', () => {
  assert.deepEqual(palabras('détail, mail, retail, orzo pasta'), ['orzo']);
  assert.deepEqual(palabras('Harina de TRIGO integral'), ['harina de trigo']);
  assert.deepEqual(palabras('Whole grain wheat flour'), ['whole grain wheat']);
});

test('lector: lactosa, fructosa y polioles con su familia', () => {
  const t = lee('Lactose, high fructose corn syrup, honey, sorbitol (E420), Honig, lattosio, xarope de frutose');
  assert.deepEqual(t.map((x) => x.familia), ['lactose', 'fructose', 'fructose', 'polyols', 'polyols', 'fructose', 'lactose', 'fructose']);
});

test('lector: lo ambiguo no se rodea', () => {
  assert.deepEqual(palabras('Natural flavouring, spices, whey, milk, malt extract, wheat starch'), []);
});

test('lector: todos los patrones compilan con «giu»', () => {
  const reglas = compila();
  assert.ok(reglas.length > 100);
  for (const r of reglas) assert.equal(r.re.flags, 'giu');
});
