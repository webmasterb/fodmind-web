import foodsJson from '../data/foods.json';
import guideJson from '../data/guide.json';
import fuentesJson from '../data/fuentes.json';
import type { Alimento, ArticuloGuia, EntradaBusqueda, Fuentes } from './tipos';
import { CAT_SLUG, LOCALES, type Locale } from './rutas';

export const foods = foodsJson as unknown as Alimento[];
export const guia = guideJson as ArticuloGuia[];
export const fuentes = fuentesJson as unknown as Fuentes;

/** Texto de la app en el idioma pedido: la web no reescribe estos rótulos. */
export function texto(clave: keyof Fuentes['textos'], locale: keyof Fuentes['textos']['provenanceFrom']): string {
  return fuentes.textos[clave][locale];
}

/** Las citas que respaldan la nota de un alimento, ya resueltas. */
export function citasDeNota(ids: string[] | undefined) {
  if (!ids?.length) return [];
  return ids
    .map((id) => fuentes.notaCitas.find((f) => f.id === id))
    .filter((f): f is Fuentes['notaCitas'][number] => Boolean(f));
}

export const foodById = new Map(foods.map((f) => [f.id, f]));

/** Ruta relativa al prefijo del idioma (sin locale base). */
export function rutaRelativaAlimento(locale: Locale, food: Alimento): string {
  const seg = { es: 'alimentos', en: 'foods', fr: 'aliments', de: 'lebensmittel', it: 'alimenti', pt: 'alimentos' }[locale];
  return `${seg}/${food.slug[locale]}/`;
}

export const CATEGORIAS: { id: string; alimentos: Alimento[] }[] = Object.keys(CAT_SLUG).map((id) => ({
  id,
  alimentos: foods.filter((f) => f.category === id),
}));

export function categoria(id: string): { id: string; alimentos: Alimento[] } | undefined {
  return CATEGORIAS.find((c) => c.id === id);
}

/** El sustituto siempre existe (guardia en la app); si no, se filtra aquí. */
export function resolverSustitutos(food: Alimento): Alimento[] {
  return food.sustitutos
    .map((s) => foodById.get(s.id))
    .filter((f): f is Alimento => Boolean(f));
}

export function indiceBusqueda(locale: Locale): EntradaBusqueda[] {
  return foods
    .map((f) => ({
      n: f.names[locale],
      p: rutaRelativaAlimento(locale, f),
      l: f.level,
      c: f.category,
    }))
    .sort((a, b) => a.n.localeCompare(b.n, locale));
}
