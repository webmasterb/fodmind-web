# fodmind.com

Web estática de la app **Fodmind** (escáner FODMAP para iOS y Android): landing,
las **1.843 alimentos** de la app como páginas indexables en 6 idiomas, guía
completa y blog. Generada con Astro, sin frameworks de UI, sin JS salvo el
buscador de alimentos.

## Comandos

```bash
npm install
npm run build        # guardias + 11.245 páginas estáticas en dist/
node scripts/verificar.mjs   # comprueba el dist, no el código
npm run dev          # vista previa local
```

## Datos: misma fuente que la app

Los alimentos y la guía NO se editan aquí. Vienen de la app
(`C:\app_appstore_fodmaps`) con un único puente:

```bash
cd C:\app_appstore_fodmaps
npx tsx scripts/exportar-web.ts
```

Escribe en esta web `src/data/foods.json`, `src/data/guide.json` y los índices
`public/search/<lang>.json`. Los slugs se generan del nombre localizado y se
deduplican ahí; las guardias de esta web los vuelven a comprobar.

## Publicar

1. `npx wrangler login` — una vez, en el navegador (cuenta de Cloudflare).
2. `node scripts/desplegar.mjs` — crea el proyecto Pages, sube `dist/` y atacha
   `fodmind.com` y `www.fodmind.com`.
3. Si la zona DNS del dominio no está en Cloudflare: `CNAME www → fodmind-web.pages.dev`
   y apuntar el raíz (o trasladar la zona a Cloudflare y no tocar nada).

Después del primer despliegue: alta en Google Search Console y envío de
`https://fodmind.com/sitemap.xml`.

## Estructura

- `src/pages/[...slug].astro` — enruta TODO desde una tabla de rutas: español
  en la raíz, resto prefijado (`/en/`, `/fr/`…), segmentos localizados
  (`/en/foods/`, `/de/lebensmittel/`…). Slug por idioma, atados con hreflang.
- `src/components/paginas/` — una plantilla por tipo de página.
- `src/i18n/strings.ts` — todos los textos de la web en 6 idiomas.
- `tests/guardias.test.mjs` — slugs únicos, rutas sin colisiones, posts completos
  en 6 idiomas, enlaces internos del blog a alimentos que existen.
- `scripts/verificar.mjs` — valida el `dist/` desplegable (hreflang, JSON-LD,
  separador decimal por idioma, sitemap completo).
