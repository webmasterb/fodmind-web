/**
 * QUÉ DICE LA TIRA DEL ESCÁNER EN CADA PÁGINA. Puro: recibe el idioma y los
 * alimentos de la página y devuelve los textos de las cinco variantes. El
 * componente (TiraEscaner.astro) solo pinta, y tests/tira.test.mjs recorre
 * los 1.843 alimentos en los seis idiomas con esto mismo.
 *
 * Sin alimentos (portada, índices, legal) la tira dice lo general de
 * i18n/tira.ts. Con alimentos, el primero es el de la página y los otros dos
 * son los que rotan detrás: en una ficha alta o moderada, sus sustitutos de
 * nivel más bajo; si no tiene, alimentos bajos de su categoría; en una ficha
 * baja, dos altos de su categoría, para que se vea que la app distingue. El
 * relleno se elige por un hash del id, así cada ficha lleva el suyo y no las
 * mismas dos para toda la categoría.
 *
 * Todo sale del catálogo: nivel, ración segura (con la coma de cada idioma),
 * FODMAP y sustitutos. Nada que la ficha de al lado contradiga.
 */
import { foods, resolverSustitutos } from './datos';
import { LOCALE_TAG, urlAlimento, type Locale } from './rutas';
import { fmt, fmtPorcion, rellenar } from './formatos';
import type { Alimento, FodmapLevel, FodmapType } from './tipos';
import { TIRA, type Nivel } from '../i18n/tira';
import { TIRA_FOCO } from '../i18n/tira-foco';

export type { Nivel };

export interface VistaTira {
  a: { titulo: string; filas: { nombre: string; chip: string; nivel: Nivel }[] };
  b: { titulo: string; texto?: string; filas: { nombre: string; racion: string; nivel: Nivel }[] };
  c: { titulo: string; texto?: string; nivel?: Nivel; racion?: string };
  d: { titulo: string; filas: { nombre: string; racion: string; nivel: Nivel }[] };
  e: {
    titulo: string;
    texto: string;
    etiqueta: string;
    /** El texto de la etiqueta dibujada, en trozos: los que llevan `marca` los señala la lupa. */
    trozos: { t: string; marca?: Nivel }[];
    /** Cuántos señala la lupa; 0 pinta un ✓ verde. */
    num: number;
    pie: string;
    pieNivel: Nivel;
  };
}

const NIVEL: Record<FodmapLevel, Nivel> = { low: 'bajo', moderate: 'medio', high: 'alto' };
const RANGO: Record<FodmapLevel, number> = { low: 0, moderate: 1, high: 2 };
const ORDEN_FODMAP: FodmapType[] = ['fructans', 'gos', 'lactose', 'fructose', 'sorbitol', 'mannitol'];

const porId = new Map(foods.map((f) => [f.id, f]));

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * EL NOMBRE PARA LOS TÍTULOS, en dos pasos y sin que dos fichas acaben con el
 * mismo título:
 *  1. Sin el paréntesis final («Garbanzos (en conserva, escurridos)» →
 *     «Garbanzos»), salvo que así choque con otro alimento: entonces entero.
 *  2. Si pasa de TOPE letras, cortado por palabras con «…» y sin dejar
 *     colgando un «de» o un «und». El título tiene dos líneas y lo que no
 *     puede perderse es el final («: tu ración segura», «en 2 segundos»), que
 *     es lo que dice qué hace la app; el nombre entero ya va en la fila de
 *     debajo. Si dos recortes coinciden, esas fichas llevan el nombre entero.
 * Medido el 25-sep-2026: pasan de 24 letras entre el 4 y el 6 % de los
 * nombres según el idioma.
 */
const TOPE = 24;
const titulos = new Map<Locale, Map<string, string>>();
const sinParentesis = (n: string) => n.replace(/\s*\([^)]*\)\s*$/, '').trim() || n;
function recorta(s: string): string {
  if (s.length <= TOPE) return s;
  let out = '';
  for (const p of s.split(' ')) {
    const siguiente = out ? `${out} ${p}` : p;
    if (siguiente.length > TOPE) break;
    out = siguiente;
  }
  out = out.replace(/(\s+\S{1,3})+$/, '').replace(/[\s,;:·-]+$/, '');
  return `${out || s.slice(0, TOPE)}…`;
}
export function nombreTitulo(f: Alimento, locale: Locale): string {
  let m = titulos.get(locale);
  if (!m) {
    m = new Map();
    const cuenta = new Map<string, number>();
    const suma = (k: string) => cuenta.set(k, (cuenta.get(k) ?? 0) + 1);
    for (const g of foods) {
      const n = g.names[locale];
      const c = sinParentesis(n);
      suma(c);
      if (c !== n) suma(n);
    }
    const paso1 = foods.map((g) => {
      const n = g.names[locale];
      const c = sinParentesis(n);
      return { g, t: (cuenta.get(c) ?? 0) > 1 ? n : c };
    });
    const recortes = new Map<string, number>();
    for (const x of paso1) recortes.set(recorta(x.t), (recortes.get(recorta(x.t)) ?? 0) + 1);
    for (const x of paso1) {
      const r = recorta(x.t);
      m.set(x.g.id, (recortes.get(r) ?? 0) > 1 ? x.t : r);
    }
    titulos.set(locale, m);
  }
  return m.get(f.id) ?? f.names[locale];
}

const probada = (f: Alimento) => !(f.safeServingG === null && f.racionGradoC);

/** Los dos que rotan detrás del alimento de la página. */
export function alternativas(food: Alimento): Alimento[] {
  const rango = RANGO[food.level];
  const fuera = new Set([food.id]);
  const out: Alimento[] = [];
  if (rango > 0) {
    // Primero los sustitutos con la ración medida: «sin ración probada» detrás
    // del ajo no le dice nada a quien busca con qué cambiarlo.
    const sust = resolverSustitutos(food);
    for (const s of [...sust.filter(probada), ...sust.filter((x) => !probada(x))]) {
      if (out.length === 2) break;
      if (RANGO[s.level] < rango && !fuera.has(s.id)) {
        out.push(s);
        fuera.add(s.id);
      }
    }
  }
  const quiero = rango > 0 ? (l: FodmapLevel) => l === 'low' : (l: FodmapLevel) => l !== 'low';
  const candidatos = (misma: boolean) =>
    foods.filter((f) => !fuera.has(f.id) && quiero(f.level) && probada(f) && (misma ? f.category === food.category : true) && f.names.en.length <= 26);
  for (const misma of [true, false]) {
    const lista = candidatos(misma);
    let h = hash(food.id + (misma ? '' : '*'));
    while (out.length < 2 && lista.length) {
      const [f] = lista.splice(h % lista.length, 1);
      out.push(f);
      fuera.add(f.id);
      h = hash(String(h));
    }
  }
  return out;
}

export function focoFicha(food: Alimento): Alimento[] {
  return [food, ...alternativas(food)];
}

/** La categoría: su primer alimento alto con sustitutos, que es la duda típica, y sus salidas. */
export function focoCategoria(catId: string): Alimento[] {
  const deCat = foods.filter((f) => f.category === catId);
  const f =
    deCat.find((x) => x.level === 'high' && alternativas(x).some((a) => a.category === catId)) ??
    deCat.find((x) => x.level === 'high') ??
    deCat[0];
  return f ? focoFicha(f) : [];
}

/** Una lista por nivel: tres alimentos de ese nivel (y de la categoría, si la hay). */
export function focoNivel(nivel: FodmapLevel, catId?: string): Alimento[] {
  const lista = foods.filter((f) => f.level === nivel && (!catId || f.category === catId));
  if (lista.length >= 3) return lista.slice(0, 3);
  return lista.length ? focoFicha(lista[0]) : [];
}

/** Un post del blog: los alimentos que enlaza, en el orden en que salen. */
export function focoPost(cuerpo: string, locale: Locale): Alimento[] {
  const porRuta = new Map(foods.map((f) => [urlAlimento(locale, f.slug[locale]), f]));
  const vistos: Alimento[] = [];
  for (const m of cuerpo.matchAll(/\]\((\/[^)\s#?]+)/g)) {
    const ruta = m[1].endsWith('/') ? m[1] : `${m[1]}/`;
    const f = porRuta.get(ruta);
    if (f && !vistos.includes(f)) vistos.push(f);
  }
  if (vistos.length === 0) return [];
  if (vistos.length >= 3) return vistos.slice(0, 3);
  return focoFicha(vistos[0]);
}

/** Los artículos de la guía no enlazan alimentos: el de cada uno es el que el artículo trata. */
const GUIA: Record<string, string> = {
  'what-are-fodmaps': 'wheat-bread',
  elimination: 'garlic',
  reintroduction: 'cow-milk',
  personalization: 'hummus',
  'how-to-read-this-app': 'apple',
  'bad-days': 'white-rice',
  'practical-tips': 'honey',
  'flavour-without-garlic-onion': 'onion',
  'smelly-gas': 'cauliflower',
};
export const GUIA_TIRA = GUIA;

export function focoGuia(articuloId: string): Alimento[] {
  const f = porId.get(GUIA[articuloId] ?? '');
  return f ? focoFicha(f) : [];
}

export function racionTira(f: Alimento, locale: Locale): string {
  const p = TIRA_FOCO[locale];
  if (f.safeServingG === 0) return p.evitar;
  if (f.safeServingG === null) return f.racionGradoC ? p.sinProbar : p.sinLimite;
  return rellenar(p.hasta, { r: `${fmtPorcion(f.safeServingG, locale)} ${f.servingUnit ?? 'g'}` });
}

function minuscula(s: string, locale: Locale): string {
  return locale === 'de' || s === s.toUpperCase() ? s : s.charAt(0).toLowerCase() + s.slice(1);
}

export function vistaTira(locale: Locale, alimentos?: Alimento[]): VistaTira {
  const g = TIRA[locale];
  if (!alimentos || alimentos.length === 0) {
    return {
      a: { titulo: g.a.titulo, filas: g.a.productos.map((p) => ({ nombre: p.nombre, chip: p.chip, nivel: p.nivel })) },
      b: { titulo: g.b.titulo, texto: g.b.texto, filas: g.b.productos.map((p) => { const [nombre, racion = ''] = p.nombre.split(' · '); return { nombre, racion, nivel: p.nivel }; }) },
      c: { titulo: g.c.titulo, texto: g.c.texto },
      d: { titulo: g.d.titulo, filas: g.d.productos },
      e: {
        titulo: g.e.titulo,
        texto: g.e.texto,
        etiqueta: g.e.etiqueta,
        trozos: g.e.ingredientes.map((t, i) => (i % 2 ? { t, marca: 'alto' as Nivel } : { t })).filter((x) => x.t),
        num: 2,
        pie: g.e.alternativa,
        pieNivel: 'bajo',
      },
    };
  }

  const p = TIRA_FOCO[locale];
  const [f] = alimentos;
  const x = nombreTitulo(f, locale);
  const nivel = NIVEL[f.level];
  const palabra = (a: Alimento) => g.nivel[NIVEL[a.level]];
  const filas = alimentos.slice(0, 3);
  const chipA = (a: Alimento) =>
    a.level === 'high' && a.fodmaps.length
      ? `${palabra(a)} · ${minuscula(p.fodmap[a.fodmaps[0]], locale)}`
      : `${palabra(a)} · ${racionTira(a, locale)}`;

  const presentes = ORDEN_FODMAP.filter((t) => f.fodmaps.includes(t));
  const trozos: VistaTira['e']['trozos'] = [];
  ORDEN_FODMAP.forEach((t, i) => {
    trozos.push(presentes.includes(t) ? { t: p.fodmap[t], marca: nivel } : { t: p.fodmap[t] });
    trozos.push({ t: i === ORDEN_FODMAP.length - 1 ? '.' : ', ' });
  });
  const lista = new Intl.ListFormat(LOCALE_TAG[locale], { type: 'conjunction' });
  const texto = presentes.length
    ? lista.format(presentes.map((t, i) => (i === 0 ? p.fodmap[t] : minuscula(p.fodmap[t], locale))))
    : p.eNinguno;
  const alt = alimentos.slice(1).find((a) => RANGO[a.level] < RANGO[f.level]);
  const pie = alt
    ? rellenar(p.alternativa, { x: alt.names[locale] })
    : `${palabra(f)} · ${racionTira(f, locale)}${f.level === 'low' ? ' ✓' : ''}`;

  return {
    a: { titulo: rellenar(p.a, { x }), filas: filas.map((a) => ({ nombre: a.names[locale], chip: chipA(a), nivel: NIVEL[a.level] })) },
    b: {
      titulo: rellenar(p.b, { x }),
      filas: filas.map((a) => ({ nombre: a.names[locale], racion: racionTira(a, locale), nivel: NIVEL[a.level] })),
    },
    c: { titulo: rellenar(p.c, { x, n: fmt(foods.length - 1, locale) }), nivel, racion: racionTira(f, locale) },
    d: {
      titulo: rellenar(p.d, { x }),
      filas: filas.map((a) => ({ nombre: a.names[locale], racion: racionTira(a, locale), nivel: NIVEL[a.level] })),
    },
    e: {
      titulo: rellenar(p.e, { x }),
      texto,
      etiqueta: p.eEtiqueta,
      trozos,
      num: presentes.length,
      pie,
      pieNivel: alt ? NIVEL[alt.level] : nivel,
    },
  };
}

