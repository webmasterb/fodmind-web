import { getCollection } from 'astro:content';
import { LOCALES, CAT_SLUG, SEG, base, type Locale } from './rutas';
import { foods, guia, CATEGORIAS } from './datos';
import { NIVELES, NIVEL_SLUG } from '../i18n/niveles';
import { guiaSlug } from '../i18n/guia-slugs';

export const SITE = 'https://fodmind.com';

/**
 * Cada entrada es una página en sus seis idiomas. Vive aparte porque la usan
 * el índice de sitemaps y los seis sitemaps por idioma, y una lista de URLs
 * que se calcula dos veces se desincroniza a la primera.
 */
export async function gruposDeUrls(): Promise<Record<string, string>[]> {
  const grupos: Record<string, string>[] = [];
  const porIdioma = (ruta: (l: Locale) => string) =>
    Object.fromEntries(LOCALES.map((l) => [l, ruta(l)]));

  grupos.push(porIdioma((l) => `${base(l)}/`));
  for (const tipo of ['alimentos', 'guia', 'blog', 'fuentes', 'privacidad', 'terminos'] as const) {
    grupos.push(porIdioma((l) => `${base(l)}/${SEG[tipo][l]}/`));
  }

  for (const nivel of NIVELES) {
    grupos.push(porIdioma((l) => `${base(l)}/${SEG.alimentos[l]}/${NIVEL_SLUG[nivel][l]}/`));
    for (const cat of CATEGORIAS) {
      if (!cat.alimentos.some((f) => f.level === nivel)) continue;
      grupos.push(
        porIdioma((l) => `${base(l)}/${SEG.alimentos[l]}/${NIVEL_SLUG[nivel][l]}/${CAT_SLUG[cat.id][l]}/`)
      );
    }
  }

  for (const cat of CATEGORIAS) {
    grupos.push(porIdioma((l) => `${base(l)}/${SEG.alimentos[l]}/${CAT_SLUG[cat.id][l]}/`));
  }

  for (const food of foods) {
    grupos.push(porIdioma((l) => `${base(l)}/${SEG.alimentos[l]}/${food.slug[l]}/`));
  }

  for (const art of guia) {
    grupos.push(porIdioma((l) => `${base(l)}/${SEG.guia[l]}/${guiaSlug(art.id, l)}/`));
  }

  const posts = await getCollection('blog');
  const ids = new Set(posts.map((e) => e.id.split('/')[1]));
  for (const id of ids) {
    const grupo: Record<string, string> = {};
    for (const l of LOCALES) {
      const entrada = posts.find((e) => e.id === `${l}/${id}`);
      if (entrada) grupo[l] = `${base(l)}/${SEG.blog[l]}/${entrada.data.urlSlug}/`;
    }
    grupos.push(grupo);
  }

  return grupos;
}
