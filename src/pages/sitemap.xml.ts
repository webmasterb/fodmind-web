import type { APIRoute } from 'astro';
import { LOCALES } from '../lib/rutas';
import { SITE } from '../lib/sitemap';

/**
 * Índice de sitemaps: uno por idioma. La URL que se da de alta en Search
 * Console sigue siendo esta, y `robots.txt` no cambia.
 */
const LASTMOD = new Date().toISOString().slice(0, 10);

export const GET: APIRoute = async () => {
  const entradas = LOCALES.map(
    (l) => `  <sitemap><loc>${SITE}/sitemap-${l}.xml</loc><lastmod>${LASTMOD}</lastmod></sitemap>`
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entradas.join('\n')}
</sitemapindex>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
