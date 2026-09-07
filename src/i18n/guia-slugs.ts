import type { Locale } from '../lib/rutas';

/**
 * Slug de cada artículo de la Guía, por idioma.
 *
 * Escritos a mano y no generados del título como los de los alimentos: son
 * nueve, y del título salían URLs como
 * `/de/guide/schritt-1-2-6-wochen-weglassen-elimination/`. Lo que interesa en
 * la barra de direcciones es el término por el que se busca —«eliminación»,
 * «Wiedereinführung»—, no el titular entero.
 *
 * El id (la clave) lo pone la app y no cambia; esto solo decide la URL. Una
 * guardia comprueba que estén los nueve en los seis idiomas y sin repetir.
 */
export const GUIA_SLUG: Record<string, Record<Locale, string>> = {
  'what-are-fodmaps': {
    en: 'what-are-fodmaps',
    es: 'que-son-los-fodmap',
    fr: 'que-sont-les-fodmap',
    de: 'was-sind-fodmaps',
    it: 'cosa-sono-i-fodmap',
    pt: 'o-que-sao-os-fodmap',
  },
  elimination: {
    en: 'elimination-phase',
    es: 'fase-de-eliminacion',
    fr: 'phase-elimination',
    de: 'eliminationsphase',
    it: 'fase-di-eliminazione',
    pt: 'fase-de-eliminacao',
  },
  reintroduction: {
    en: 'reintroduction-phase',
    es: 'fase-de-reintroduccion',
    fr: 'phase-reintroduction',
    de: 'wiedereinfuehrung',
    it: 'fase-di-reintroduzione',
    pt: 'fase-de-reintroducao',
  },
  personalization: {
    en: 'personalisation-phase',
    es: 'fase-de-personalizacion',
    fr: 'phase-personnalisation',
    de: 'personalisierung',
    it: 'fase-di-personalizzazione',
    pt: 'fase-de-personalizacao',
  },
  'how-to-read-this-app': {
    en: 'how-to-read-the-app',
    es: 'como-leer-la-app',
    fr: 'comment-lire-lapp',
    de: 'die-app-lesen',
    it: 'come-leggere-lapp',
    pt: 'como-ler-a-app',
  },
  'bad-days': {
    en: 'ibs-flare-what-to-do',
    es: 'brote-que-hacer',
    fr: 'crise-que-faire',
    de: 'schub-was-tun',
    it: 'attacco-cosa-fare',
    pt: 'crise-o-que-fazer',
  },
  'practical-tips': {
    en: 'labels-and-eating-out',
    es: 'etiquetas-y-comer-fuera',
    fr: 'etiquettes-et-restaurant',
    de: 'etiketten-und-auswaerts-essen',
    it: 'etichette-e-mangiare-fuori',
    pt: 'rotulos-e-comer-fora',
  },
  'flavour-without-garlic-onion': {
    en: 'flavour-without-garlic-or-onion',
    es: 'sabor-sin-ajo-ni-cebolla',
    fr: 'gout-sans-ail-ni-oignon',
    de: 'geschmack-ohne-knoblauch-und-zwiebel',
    it: 'sapore-senza-aglio-e-cipolla',
    pt: 'sabor-sem-alho-nem-cebola',
  },
  'smelly-gas': {
    en: 'smelly-gas-causes',
    es: 'gases-malolientes',
    fr: 'gaz-malodorants',
    de: 'uebelriechende-blaehungen',
    it: 'gas-maleodoranti',
    pt: 'gases-malcheirosos',
  },
};

export function guiaSlug(articuloId: string, locale: Locale): string {
  return GUIA_SLUG[articuloId]?.[locale] ?? articuloId;
}
