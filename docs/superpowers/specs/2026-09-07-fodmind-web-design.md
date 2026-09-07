# Fodmind.com — diseño

Web de producto y posicionamiento en Google para la app Fodmind (escáner FODMAP,
1843 alimentos, iOS + Android). Sitio estático, 6 idiomas, ~11 000 páginas.

## Objetivo

Que quien busca «¿x tiene fodmap?» en Google caiga en la página del alimento y
de ahí instale la app. La landing convierte; los alimentos y el blog traen el
tráfico.

## Stack

- **Astro 5**, estático puro, TypeScript, sin framework UI. CSS propio con variables.
- **Datos**: script `scripts/exportar-web.mjs` EN el repo de la app (`C:\app_appstore_fodmaps`).
  Importa `allFoods`, `SUSTITUTOS`, `FOOD_EMOJI`, `guideSections` con tsx y escribe
  en la web `src/data/foods.json` y `src/data/guide.json`. El JSON se commitea.
- **Hosting**: Cloudflare Pages (gratis, SSL, dominio propio, analítica cookieless).
- **Repo**: `fodmind-web` en GitHub (webmasterb).

## Estructura de URLs

Español en la raíz, resto prefijado. Segmentos localizados:

| Página | es | en | fr | de | it | pt |
| --- | --- | --- | --- | --- | --- | --- |
| Inicio | `/` | `/en/` | `/fr/` | `/de/` | `/it/` | `/pt/` |
| Índice alimentos | `/alimentos/` | `/en/foods/` | `/fr/aliments/` | `/de/lebensmittel/` | `/it/alimenti/` | `/pt/alimentos/` |
| Categoría | `/alimentos/<cat>/` | … | … | … | … | … |
| Alimento | `/alimentos/<slug>/` | … | … | … | … | … |
| Guía | `/guia/` | `/en/guide/` | `/fr/guide/` | `/de/guide/` | `/it/guida/` | `/pt/guia/` |
| Blog | `/blog/` | igual | igual | igual | igual | igual |
| Legal | `/privacidad/`, `/terminos/` | prefijado | … | … | … | … |

- **Slug por idioma**, generado del nombre localizado (NFKD, sin diacríticos,
  minúsculas, guiones). Colisión → sufijo con el id. Mismo alimento, 6 URLs
  paralelas, atadas con hreflang + canonical.
- Routing con un catch-all `src/pages/[...slug].astro` que genera todo desde
  una tabla de rutas: estructura 100 % paralela entre idiomas.

## Páginas

1. **Landing**: hero (escanea → semáforo), features (código de barras, foto de
   etiqueta, platos, guía por fases, diario, recetas), cifras (1843 alimentos,
   6 idiomas, offline), badges de tiendas, FAQ breve, JSON-LD `SoftwareApplication`.
2. **Índice de alimentos**: las 12 categorías con conteos + buscador client-side
   (JS vanilla, índice JSON por idioma cargado al enfocar).
3. **Categoría**: alimentos de la categoría agrupados por nivel.
4. **Alimento** (la página clave): semáforo, ración segura y habitual con
   separador decimal por idioma, FODMAPs presentes, nota, sustitutos («Parecidos
   que sí puedes»), aviso educativo, CTA a la app, JSON-LD, FAQ.
5. **Guía**: 7 artículos de `guideSections` (ya traducidos en la app).
6. **Blog**: 4 posts iniciales × 6 idiomas, long-tail: lista de alimentos altos
   en FODMAP, ajo y cebolla (sustitutos), lactosa vs FODMAP, errores al empezar.
7. **Legal**: privacidad y términos (los que las fichas de tiendas ya exigen).

## SEO

- Sitemap con alternates hreflang (defaultLocale es), robots.txt, canonicals.
- JSON-LD: `SoftwareApplication` (landing), `Article` (guía/blog),
  `BreadcrumbList` (alimentos).
- Meta title/description por plantilla y por idioma; OG tags con el icono de la app.
- Cero JS salvo el buscador; fuentes del sistema; favicon del repo de la app.
- Alta en Search Console al desplegar.

## i18n

- `LOCALES = ['es','en','fr','de','it','pt']`, es por defecto.
- UI strings en `src/i18n/strings.ts` por idioma, escritas para la web.
- Números con `Intl.NumberFormat(locale)` (coma decimal en es/fr/de/it/pt —
  guardia específica, que es donde ya mordió en la app).

## Guardias (node --test, sin dependencias)

1. Slugs únicos por idioma; todo alimento con nombre en los 6 idiomas.
2. Rutas paralelas: cada URL de es tiene sus 5 alternates y al revés.
3. Separador decimal correcto en la página de un alimento por idioma.
4. Sitemap contiene las páginas clave; robots.txt permite todo y apunta al sitemap.
5. guide.json: 7 artículos × 6 idiomas, sin cuerpo vacío.

## Despliegue

- Push a GitHub → Cloudflare Pages (build `npm run build`, output `dist`).
- Dominio `fodmind.com` + `www` sobre el proyecto, CNAME en el DNS del registrador.
- Cloudflare Web Analytics.

## Fuera de ámbito (V2)

Newsletter, comentarios, CMS, capturas de pantalla reales, dark mode,
páginas de recetas.
