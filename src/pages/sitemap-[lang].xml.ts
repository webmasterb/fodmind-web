import type { APIRoute } from 'astro';
import { LOCALES, LOCALE_TAG, LOCALE_RAIZ, type Locale } from '../lib/rutas';
import { gruposDeUrls, SITE } from '../lib/sitemap';

/**
 * Un sitemap por idioma. Antes era uno solo de 8,6 MB con las 11.478 URLs:
 * cabe de sobra en el límite de Google, pero en Search Console un único
 * fichero solo sabe decir cuántas URLs se indexaron en total, y con seis
 * idiomas lo que hace falta saber es cuál se está quedando fuera.
 */
export function getStaticPaths() {
  return LOCALES.map((lang) => ({ params: { lang } }));
}

const LASTMOD = new Date().toISOString().slice(0, 10);

export const GET: APIRoute = async ({ params }) => {
  const lang = params.lang as Locale;
  const grupos = await gruposDeUrls();

  const entradas = grupos
    .filter((grupo) => grupo[lang])
    .map((grupo) => {
      const links = Object.entries(grupo)
        .map(
          ([l, ruta]) =>
            `<xhtml:link rel="alternate" hreflang="${LOCALE_TAG[l as Locale]}" href="${SITE}${ruta}"/>`
        )
        .join('');
      const defecto = `<xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${grupo[LOCALE_RAIZ] ?? Object.values(grupo)[0]}"/>`;
      return `  <url><loc>${SITE}${grupo[lang]}</loc><lastmod>${LASTMOD}</lastmod>${links}${defecto}</url>`;
    });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entradas.join('\n')}
</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
