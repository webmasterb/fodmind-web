# fodmind.com

Web estática de la app **Fodmind** (escáner FODMAP para iOS y Android): landing,
los **1.843 alimentos** de la app como páginas indexables en 6 idiomas, guía
completa, blog y la página de fuentes. Generada con Astro, sin frameworks de UI,
sin JS salvo el buscador de alimentos y el botón de descarga.

**El inglés vive en la raíz** (`/`, `/foods/`, `/guide/`) y los demás idiomas van
prefijados (`/es/alimentos/`, `/de/lebensmittel/`…). Quién ocupa la raíz se
decide en un solo sitio, `LOCALE_RAIZ` en `src/lib/rutas.ts`: el resto del repo
pregunta por `base()` y nunca compara con un idioma a mano. Dos guardias lo
sostienen —que la home sirva ese idioma y que los enlaces del blog lleven el
prefijo del suyo—, así que cambiarlo es cambiar esa constante y volver a
construir.

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

Escribe en esta web `src/data/foods.json`, `src/data/guide.json`,
`src/data/fuentes.json` y los índices `public/search/<lang>.json`. Los slugs se
generan del nombre localizado y se deduplican ahí; las guardias de esta web los
vuelven a comprobar.

**La procedencia se calcula en la app**, con la misma función `procedencia()`
que usa su ficha, y cruza ya resuelta: el grado en lenguaje llano y el nombre de
quien publicó el dato. Por eso la ficha web y la de la app no pueden acabar
diciendo cosas distintas del mismo alimento. Lo mismo con los rótulos: los
textos de `fuentes.json` son los de la app, no una traducción paralela.

`src/data/fuentes.json` lleva además la bibliografía y los créditos de las
tablas de composición con su licencia. No es cortesía: seis son CC BY y obligan
a nombrar autor, obra y licencia allí donde se publica el dato derivado.

## Publicar

Lo sirve **Coolify** (`coolify.thumbeast.com`, proyecto `fodmind.com`), no
Cloudflare Pages. No hay nada que ejecutar a mano:

    git push origin main

El webhook de la GitHub App dispara el despliegue; Coolify corre `npm ci` y
`npm run build` —o sea, las guardias primero— y sirve `dist/` con nginx. El
certificado lo emite Traefik.

En Cloudflare solo vive el DNS: `A @` y `A www` a la IP del servidor, en
**DNS-only** (nube gris) para no estorbar a Let's Encrypt. `www` redirige a la
raíz por la opción del dominio en Coolify.

Después del primer despliegue: alta en Google Search Console y envío de
`https://fodmind.com/sitemap.xml`.

## Estructura

- `src/pages/[...slug].astro` — enruta TODO desde una tabla de rutas: español
  en la raíz, resto prefijado (`/en/`, `/fr/`…), segmentos localizados
  (`/en/foods/`, `/de/lebensmittel/`…). Slug por idioma, atados con hreflang.
- `src/components/paginas/` — una plantilla por tipo de página.
- `src/i18n/strings.ts` — todos los textos de la web en 6 idiomas. Los que
  describen los datos (grados, rótulos de procedencia, fuentes) NO están aquí:
  vienen de la app en `fuentes.json`.
- `scripts/og.mjs` — rehace `public/og.png` (1200×630). La imagen va en el repo
  para no meter sharp en el build del contenedor.
- `tests/guardias.test.mjs` — slugs únicos, rutas sin colisiones, posts completos
  en 6 idiomas, enlaces internos del blog con el prefijo de su idioma, y que los
  1.843 traigan procedencia y sus citas resueltas.
- `scripts/verificar.mjs` — valida el `dist/` desplegable (hreflang, JSON-LD,
  separador decimal por idioma, sitemap completo, la procedencia en la ficha, y
  que **las 11.251 páginas** lleven a las dos tiendas).
