/**
 * LOS TEXTOS DE LA TIRA CUANDO LA PÁGINA TIENE ALIMENTO (ficha, categoría,
 * nivel, post o artículo de la guía).
 *
 * El titular grande es el mismo en las cinco variantes (así la prueba compara
 * animaciones y no frases) y depende del nivel del alimento. El nombre no va
 * dentro de la frase sino en una etiqueta encima, para que ninguna dependa del
 * género, el número o el artículo del nombre, que en francés o en alemán la
 * rompería. `{x}` en `alternativa` es el nombre de la alternativa.
 *
 * El registro sigue al de strings.ts: vous en francés, du en alemán, tu en los
 * demás. Los nombres cortos de los FODMAP son los que caben en la etiqueta
 * dibujada de la variante e; los largos de la ficha no caben.
 */
import type { Locale } from '../lib/rutas';
import type { FodmapType } from '../lib/tipos';

export interface TiraFoco {
  /** El titular grande de las cinco variantes, según el nivel del alimento: una pregunta que pide el toque. */
  gancho: Record<'alto' | 'medio' | 'bajo', string>;
  eEtiqueta: string;
  alternativa: string;
  hasta: string;
  evitar: string;
  sinLimite: string;
  sinProbar: string;
  fodmap: Record<FodmapType, string>;
}

export const TIRA_FOCO: Record<Locale, TiraFoco> = {
  es: {
    gancho: { alto: '¿Por qué te sienta mal?', medio: 'Sí, pero ¿cuánto?', bajo: 'Luz verde. ¿Y el resto?' },
    eEtiqueta: 'FODMAP',
    alternativa: 'Alternativa: {x} ✓',
    hasta: 'hasta {r}',
    evitar: 'evitar',
    sinLimite: 'sin límite',
    sinProbar: 'sin ración probada',
    fodmap: { fructans: 'Fructanos', gos: 'GOS', lactose: 'Lactosa', fructose: 'Fructosa', sorbitol: 'Sorbitol', mannitol: 'Manitol' },
  },
  en: {
    gancho: { alto: 'Why does it upset you?', medio: 'Yes, but how much?', bajo: 'All clear. And the rest?' },
    eEtiqueta: 'FODMAPs',
    alternativa: 'Alternative: {x} ✓',
    hasta: 'up to {r}',
    evitar: 'avoid',
    sinLimite: 'no limit',
    sinProbar: 'no tested serving',
    fodmap: { fructans: 'Fructans', gos: 'GOS', lactose: 'Lactose', fructose: 'Fructose', sorbitol: 'Sorbitol', mannitol: 'Mannitol' },
  },
  fr: {
    gancho: { alto: 'Pourquoi ça vous gêne ?', medio: 'Oui, mais combien ?', bajo: 'Feu vert. Et le reste ?' },
    eEtiqueta: 'FODMAP',
    alternativa: 'Alternative : {x} ✓',
    hasta: 'jusqu’à {r}',
    evitar: 'à éviter',
    sinLimite: 'sans limite',
    sinProbar: 'portion non testée',
    fodmap: { fructans: 'Fructanes', gos: 'GOS', lactose: 'Lactose', fructose: 'Fructose', sorbitol: 'Sorbitol', mannitol: 'Mannitol' },
  },
  de: {
    gancho: { alto: 'Warum Bauchweh?', medio: 'Ja, aber wie viel?', bajo: 'Grünes Licht. Und sonst?' },
    eEtiqueta: 'FODMAPs',
    alternativa: 'Alternative: {x} ✓',
    hasta: 'bis {r}',
    evitar: 'meiden',
    sinLimite: 'ohne Limit',
    sinProbar: 'keine getestete Menge',
    fodmap: { fructans: 'Fruktane', gos: 'GOS', lactose: 'Laktose', fructose: 'Fruktose', sorbitol: 'Sorbit', mannitol: 'Mannit' },
  },
  it: {
    gancho: { alto: 'Perché ti fa male?', medio: 'Sì, ma quanto?', bajo: 'Via libera. E il resto?' },
    eEtiqueta: 'FODMAP',
    alternativa: 'Alternativa: {x} ✓',
    hasta: 'fino a {r}',
    evitar: 'da evitare',
    sinLimite: 'senza limiti',
    sinProbar: 'porzione non testata',
    fodmap: { fructans: 'Fruttani', gos: 'GOS', lactose: 'Lattosio', fructose: 'Fruttosio', sorbitol: 'Sorbitolo', mannitol: 'Mannitolo' },
  },
  pt: {
    gancho: { alto: 'Porque te faz mal?', medio: 'Sim, mas quanto?', bajo: 'Luz verde. E o resto?' },
    eEtiqueta: 'FODMAP',
    alternativa: 'Alternativa: {x} ✓',
    hasta: 'até {r}',
    evitar: 'evitar',
    sinLimite: 'sem limite',
    sinProbar: 'porção não testada',
    fodmap: { fructans: 'Frutanos', gos: 'GOS', lactose: 'Lactose', fructose: 'Frutose', sorbitol: 'Sorbitol', mannitol: 'Manitol' },
  },
};
