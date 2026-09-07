import catSlugJson from './cat-slug.json';
import { NIVEL_SLUG } from '../i18n/niveles';
import { guiaSlug } from '../i18n/guia-slugs';
import type { Lang, FodmapLevel } from './tipos';

export const LOCALES = ['en', 'es', 'fr', 'de', 'it', 'pt'] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_TAG: Record<Locale, string> = {
  es: 'es-ES',
  en: 'en',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  pt: 'pt-PT',
};

/** Segmentos de ruta por idioma. El exportador de la app repite alimentos. */
export const SEG: Record<'alimentos' | 'guia' | 'blog' | 'fuentes' | 'privacidad' | 'terminos', Record<Locale, string>> = {
  alimentos: {
    es: 'alimentos',
    en: 'foods',
    fr: 'aliments',
    de: 'lebensmittel',
    it: 'alimenti',
    pt: 'alimentos',
  },
  guia: {
    es: 'guia',
    en: 'guide',
    fr: 'guide',
    de: 'guide',
    it: 'guida',
    pt: 'guia',
  },
  blog: {
    es: 'blog',
    en: 'blog',
    fr: 'blog',
    de: 'blog',
    it: 'blog',
    pt: 'blog',
  },
  fuentes: {
    es: 'fuentes',
    en: 'sources',
    fr: 'sources',
    de: 'quellen',
    it: 'fonti',
    pt: 'fontes',
  },
  privacidad: {
    es: 'privacidad',
    en: 'privacy',
    fr: 'confidentialite',
    de: 'datenschutz',
    it: 'privacy',
    pt: 'privacidade',
  },
  terminos: {
    es: 'terminos',
    en: 'terms',
    fr: 'conditions',
    de: 'nutzungsbedingungen',
    it: 'termini',
    pt: 'termos',
  },
};

/**
 * El idioma que vive en la raíz. Único sitio donde se decide: el resto del
 * repo pregunta por `base()`, nunca compara con un idioma a mano.
 */
export const LOCALE_RAIZ: Locale = 'en';

/** Prefijo de URL del idioma. El idioma raíz no lleva prefijo. */
export function base(locale: Locale): string {
  return locale === LOCALE_RAIZ ? '' : `/${locale}`;
}

export function urlLanding(locale: Locale): string {
  return `${base(locale)}/`;
}

export function urlAlimentos(locale: Locale): string {
  return `${base(locale)}/${SEG.alimentos[locale]}/`;
}

export function urlCategoria(locale: Locale, catSlug: string): string {
  return `${base(locale)}/${SEG.alimentos[locale]}/${catSlug}/`;
}

export function urlAlimento(locale: Locale, foodSlug: string): string {
  return `${base(locale)}/${SEG.alimentos[locale]}/${foodSlug}/`;
}

export function urlGuia(locale: Locale): string {
  return `${base(locale)}/${SEG.guia[locale]}/`;
}

export function urlArticulo(locale: Locale, articuloSlug: string): string {
  return `${base(locale)}/${SEG.guia[locale]}/${articuloSlug}/`;
}

export function urlBlog(locale: Locale): string {
  return `${base(locale)}/${SEG.blog[locale]}/`;
}

export function urlPost(locale: Locale, postSlug: string): string {
  return `${base(locale)}/${SEG.blog[locale]}/${postSlug}/`;
}

/**
 * Listas por nivel: `/foods/low-fodmap/` y su corte por categoría,
 * `/foods/low-fodmap/fruits/`. Cuelgan del segmento de alimentos para que la
 * miga de pan y el reparto de autoridad sigan el mismo camino que las fichas.
 */
export function urlNivel(locale: Locale, nivel: FodmapLevel): string {
  return `${base(locale)}/${SEG.alimentos[locale]}/${NIVEL_SLUG[nivel][locale]}/`;
}

export function urlNivelCat(locale: Locale, nivel: FodmapLevel, catId: string): string {
  return `${base(locale)}/${SEG.alimentos[locale]}/${NIVEL_SLUG[nivel][locale]}/${CAT_SLUG[catId][locale]}/`;
}

export function alternatesNivel(nivel: FodmapLevel): Record<Locale, string> {
  return alternatesDeEntidad((l) => urlNivel(l, nivel));
}

export function alternatesNivelCat(nivel: FodmapLevel, catId: string): Record<Locale, string> {
  return alternatesDeEntidad((l) => urlNivelCat(l, nivel, catId));
}

export function urlFuentes(locale: Locale): string {
  return `${base(locale)}/${SEG.fuentes[locale]}/`;
}

export function urlLegal(locale: Locale, cual: 'privacidad' | 'terminos'): string {
  return `${base(locale)}/${SEG[cual][locale]}/`;
}

/**
 * Alternates de las páginas estáticas (landing, índices y legal), que son las
 * mismas rutas en los 6 idiomas. Alimenta hreflang, sitemap y selector.
 */
export function alternatesEstatico(tipo: 'landing' | 'alimentos' | 'guia' | 'blog' | 'fuentes' | 'privacidad' | 'terminos'): Record<Locale, string> {
  return Object.fromEntries(
    LOCALES.map((l) => {
      const pref = base(l);
      switch (tipo) {
        case 'landing':
          return [l, `${pref}/`];
        case 'alimentos':
          return [l, `${pref}/${SEG.alimentos[l]}/`];
        case 'guia':
          return [l, `${pref}/${SEG.guia[l]}/`];
        case 'blog':
          return [l, `${pref}/${SEG.blog[l]}/`];
        case 'fuentes':
          return [l, `${pref}/${SEG.fuentes[l]}/`];
        case 'privacidad':
          return [l, `${pref}/${SEG.privacidad[l]}/`];
        case 'terminos':
          return [l, `${pref}/${SEG.terminos[l]}/`];
      }
    })
  ) as Record<Locale, string>;
}

/** Alternates de una entidad con URL por idioma: alimento, categoría, artículo. */
function alternatesDeEntidad(
  rutaPorLocale: (l: Locale) => string
): Record<Locale, string> {
  return Object.fromEntries(LOCALES.map((l) => [l, rutaPorLocale(l)])) as Record<Locale, string>;
}

export function alternatesAlimento(
  slugPorLocale: Record<Locale, string>
): Record<Locale, string> {
  return alternatesDeEntidad((l) => `${base(l)}/${SEG.alimentos[l]}/${slugPorLocale[l]}/`);
}

export function alternatesCategoria(catId: string): Record<Locale, string> {
  return alternatesDeEntidad((l) => `${base(l)}/${SEG.alimentos[l]}/${CAT_SLUG[catId][l]}/`);
}

export function alternatesArticulo(articuloId: string): Record<Locale, string> {
  return alternatesDeEntidad((l) => `${base(l)}/${SEG.guia[l]}/${guiaSlug(articuloId, l)}/`);
}

/** Slugs de categoría por idioma. Clave = id de categoría en los datos. */
export const CAT_SLUG: Record<string, Record<Locale, string>> = catSlugJson;

export function esLocaleDeLang(lang: Lang): Locale {
  return lang as Locale;
}
