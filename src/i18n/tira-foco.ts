/**
 * LAS PLANTILLAS DE LA TIRA CUANDO LA PÁGINA TIENE ALIMENTO (ficha, categoría,
 * nivel, post o artículo de la guía). `{x}` es el nombre del alimento y va
 * siempre delante o como sujeto aislado, para que ninguna plantilla dependa
 * del género, el número o el artículo del nombre: «Garbanzos en el súper» y
 * «Cebolla en el súper» salen bien con la misma frase, y lo mismo en francés
 * o en alemán, donde un «le/la» o un «der/die» lo rompería.
 *
 * `{n}` es cuántos alimentos más clasifica la app, con el formato de cada
 * idioma. El registro sigue al de strings.ts: vous en francés, du en alemán, tu en
 * los demás. Los nombres cortos de los FODMAP son los que caben en la
 * etiqueta dibujada de la variante e; los largos de la ficha no caben.
 */
import type { Locale } from '../lib/rutas';
import type { FodmapType } from '../lib/tipos';

export interface TiraFoco {
  a: string;
  b: string;
  c: string;
  d: string;
  e: string;
  eEtiqueta: string;
  eNinguno: string;
  alternativa: string;
  hasta: string;
  evitar: string;
  sinLimite: string;
  sinProbar: string;
  fodmap: Record<FodmapType, string>;
}

export const TIRA_FOCO: Record<Locale, TiraFoco> = {
  es: {
    a: '{x} en el súper',
    b: '{x}, en 2 segundos',
    c: '{x} y {n} más',
    d: '{x}: tu ración segura',
    e: '{x}: qué FODMAP lleva',
    eEtiqueta: 'FODMAP',
    eNinguno: 'Ninguno a vigilar',
    alternativa: 'Alternativa: {x} ✓',
    hasta: 'hasta {r}',
    evitar: 'evitar',
    sinLimite: 'sin límite',
    sinProbar: 'sin ración probada',
    fodmap: { fructans: 'Fructanos', gos: 'GOS', lactose: 'Lactosa', fructose: 'Fructosa', sorbitol: 'Sorbitol', mannitol: 'Manitol' },
  },
  en: {
    a: '{x} at the store',
    b: '{x}, in 2 seconds',
    c: '{x} and {n} more',
    d: '{x}: your safe serving',
    e: '{x}: which FODMAPs',
    eEtiqueta: 'FODMAPs',
    eNinguno: 'None to watch',
    alternativa: 'Alternative: {x} ✓',
    hasta: 'up to {r}',
    evitar: 'avoid',
    sinLimite: 'no limit',
    sinProbar: 'no tested serving',
    fodmap: { fructans: 'Fructans', gos: 'GOS', lactose: 'Lactose', fructose: 'Fructose', sorbitol: 'Sorbitol', mannitol: 'Mannitol' },
  },
  fr: {
    a: '{x} au supermarché',
    b: '{x} en 2 secondes',
    c: '{x} et {n} autres',
    d: '{x} : portion sûre',
    e: '{x} : quels FODMAP',
    eEtiqueta: 'FODMAP',
    eNinguno: 'Aucun à surveiller',
    alternativa: 'Alternative : {x} ✓',
    hasta: 'jusqu’à {r}',
    evitar: 'à éviter',
    sinLimite: 'sans limite',
    sinProbar: 'portion non testée',
    fodmap: { fructans: 'Fructanes', gos: 'GOS', lactose: 'Lactose', fructose: 'Fructose', sorbitol: 'Sorbitol', mannitol: 'Mannitol' },
  },
  de: {
    a: '{x} im Supermarkt',
    b: '{x} in 2 Sekunden',
    c: '{x} und {n} weitere',
    d: '{x}: sichere Menge',
    e: '{x}: welche FODMAPs',
    eEtiqueta: 'FODMAPs',
    eNinguno: 'Keine zu beachten',
    alternativa: 'Alternative: {x} ✓',
    hasta: 'bis {r}',
    evitar: 'meiden',
    sinLimite: 'ohne Limit',
    sinProbar: 'keine getestete Menge',
    fodmap: { fructans: 'Fruktane', gos: 'GOS', lactose: 'Laktose', fructose: 'Fruktose', sorbitol: 'Sorbit', mannitol: 'Mannit' },
  },
  it: {
    a: '{x} al supermercato',
    b: '{x} in 2 secondi',
    c: '{x} e altri {n}',
    d: '{x}: porzione sicura',
    e: '{x}: quali FODMAP',
    eEtiqueta: 'FODMAP',
    eNinguno: 'Nessuno da controllare',
    alternativa: 'Alternativa: {x} ✓',
    hasta: 'fino a {r}',
    evitar: 'da evitare',
    sinLimite: 'senza limiti',
    sinProbar: 'porzione non testata',
    fodmap: { fructans: 'Fruttani', gos: 'GOS', lactose: 'Lattosio', fructose: 'Fruttosio', sorbitol: 'Sorbitolo', mannitol: 'Mannitolo' },
  },
  pt: {
    a: '{x} no supermercado',
    b: '{x} em 2 segundos',
    c: '{x} e mais {n}',
    d: '{x}: porção segura',
    e: '{x}: que FODMAP tem',
    eEtiqueta: 'FODMAP',
    eNinguno: 'Nenhum a vigiar',
    alternativa: 'Alternativa: {x} ✓',
    hasta: 'até {r}',
    evitar: 'evitar',
    sinLimite: 'sem limite',
    sinProbar: 'porção não testada',
    fodmap: { fructans: 'Frutanos', gos: 'GOS', lactose: 'Lactose', fructose: 'Frutose', sorbitol: 'Sorbitol', mannitol: 'Manitol' },
  },
};
