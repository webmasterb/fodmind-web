import type { APIRoute } from 'astro';
import { LOCALES, LOCALE_TAG, LOCALE_RAIZ, CAT_SLUG, SEG, base } from '../lib/rutas';
import { foods, guia, CATEGORIAS } from '../lib/datos';
import { getCollection } from 'astro:content';

const SITE = 'https://fodmind.com';
/**
 * `lastmod` es la fecha del build. El sitio es estático y se reconstruye
 * entero en cada despliegue, así que no hay una fecha por página más honesta
 * que esa: fingir una por URL sería inventarla.
 */
const LASTMOD = new Date().toISOString().slice(0, 10);

function url(loc: string, alternates: Record<string, string>): string {
  const links = Object.entries(alternates)
    .map(
      ([l, ruta]) =>
        `<xhtml:link rel="alternate" hreflang="${LOCALE_TAG[l as keyof typeof LOCALE_TAG]}" href="${SITE}${ruta}"/>`
    )
    .join('');
  const defecto = `<xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${alternates[LOCALE_RAIZ] ?? Object.values(alternates)[0]}"/>`;
  return `  <url><loc>${SITE}${loc}</loc><lastmod>${LASTMOD}</lastmod>${links}${defecto}</url>`;
}

function estaticas(tipo: 'landing' | 'alimentos' | 'guia' | 'blog' | 'fuentes' | 'privacidad' | 'terminos'): Record<string, string> {
  return Object.fromEntries(
    LOCALES.map((l) => [l, tipo === 'landing' ? `${base(l)}/` : `${base(l)}/${SEG[tipo][l]}/`])
  );
}

export const GET: APIRoute = async () => {
  const entradas: string[] = [];

  const anotar = (alternates: Record<string, string>) => {
    for (const [loc, ruta] of Object.entries(alternates)) {
      entradas.push(url(ruta, alternates));
      void loc;
    }
  };

  for (const tipo of ['landing', 'alimentos', 'guia', 'blog', 'fuentes', 'privacidad', 'terminos'] as const) {
    anotar(estaticas(tipo));
  }

  for (const cat of CATEGORIAS) {
    anotar(
      Object.fromEntries(
        LOCALES.map((l) => [l, `${base(l)}/${SEG.alimentos[l]}/${CAT_SLUG[cat.id][l]}/`])
      )
    );
  }

  for (const food of foods) {
    anotar(
      Object.fromEntries(
        LOCALES.map((l) => [l, `${base(l)}/${SEG.alimentos[l]}/${food.slug[l]}/`])
      )
    );
  }

  for (const art of guia) {
    anotar(
      Object.fromEntries(
        LOCALES.map((l) => [l, `${base(l)}/${SEG.guia[l]}/${art.id}/`])
      )
    );
  }

  const posts = await getCollection('blog');
  const slugs = new Set(posts.map((e) => e.id.split('/')[1]));
  for (const slug of slugs) {
    const localesCon = LOCALES.filter((l) => posts.some((e) => e.id === `${l}/${slug}`));
    anotar(
      Object.fromEntries(
        localesCon.map((l) => [l, `${base(l)}/${SEG.blog[l]}/${slug}/`])
      )
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entradas.join('\n')}
</urlset>`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
