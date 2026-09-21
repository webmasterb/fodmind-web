# De la ficha a la instalación: investigación y plan (21-sep-2026)

Objetivo: que quien llega desde Google a una ficha de alimento (o a una lista) salga con
ganas de instalar Fodmind, y medir que lo hace. Primero los datos, después el criterio,
después el plan. Nada de aquí está hecho todavía.

## 1. Datos medidos hoy

### Search Console, `sc-domain:fodmind.com`, 6 → 19 de septiembre (14 días)

| Dato | Valor |
| --- | --- |
| Clics / impresiones | 293 / 35.100 (CTR 0,8 %, posición media 12,1) |
| Dispositivo | móvil 222 (76 %), escritorio 62 (21 %), tablet 9 |
| Idioma | 87 % de los clics en es/it/de/fr/pt; inglés 6 clics de 3.200 impresiones |
| Consultas | > 1.000 distintas, todas del molde «*alimento* fodmap»: lecitina de soja, leinsamen, cime di rapa, bulgur, jus d'orange, kamillentee, figue fraîche, wakame, acelgas |
| Páginas con más impresiones | listas de categoría/nivel (`/es/alimentos/frutos-secos/` 99, `/de/lebensmittel/fodmap-arm/getraenke/` 89, `/it/alimenti/legumi/` 84), por encima de cualquier ficha suelta |
| Indexación | 4.190 indexadas; 7.212 «descubiertas, sin indexar»; 82 «rastreadas, sin indexar» |
| Tendencia | impresiones bajando: 3.942 el 10-sep → 2.176 el 19-sep; clics fijos en 18-27/día |

### App Store Connect, Analytics, 22-ago → 20-sep

| Fuente de vistas de la ficha | Media diaria |
| --- | --- |
| App Store Search | 5 |
| App Referrer | 2 |
| App Store Browse | 1 |
| **Web Referrer** | **—** (cero o por debajo del umbral) |

Campañas: «There isn't enough data to display campaigns». Ningún `ct=web-*` llega a 5
en 30 días.

**Conclusión: unas 300 visitas desde Google no han producido ninguna vista de la ficha
de la App Store atribuible a la web.** La conversión medible de la web hoy es cero.
Android sin medir (Adquisición de Play solo por la VM): pendiente, pero no hay motivo
para esperar otra cosa.

### Nota de la app en las tiendas (iTunes lookup)

ES: 5★ con **2** valoraciones. US, GB, DE, IT, FR, PT: 0. No existe prueba social de
tienda que enseñar.

### La ficha, tal como está (`src/components/paginas/Alimento.astro`)

Orden: cabecera con «Descargar la app» → migas → emoji + h1 + semáforo + frase del nivel
→ cajas ración segura / habitual → **primer CTA `CtaEscaner`** («¿En el súper? Escanea la
etiqueta», botón «Escanear el paquete») → FODMAP presentes → nota y citas → lector de
etiquetas (textarea; su CTA solo aparece tras analizar) → procedencia → sustitutos →
vecinos → FAQ → aviso → banda con insignias → pie → barra fija en móvil.

- Siete salidas a la app y **ninguna lleva prueba** (ni nota, ni número de alimentos
  junto al botón, ni fuentes, ni capturas del alimento en cuestión).
- El primer CTA vende el escáner **a todos los alimentos**, incluidos los frescos. Medido
  en `/es/alimentos/acelga/`: acelga no tiene envase; el argumento no encaja. De las nueve
  consultas top, seis son frescos o a granel.
- 1.302 de 1.843 fichas (71 %) enseñan «Nadie ha publicado una medición de este
  alimento» (procedencia C) justo debajo del lector. Es verdad y debe seguir, pero hoy
  resta confianza sin dar nada a cambio.
- Las listas de categoría y nivel (`Categoria.astro`, `AlimentosIndex.astro`) **no
  tienen ningún CTA propio**: solo los heredados de `Base`. Son las páginas con más
  impresiones.
- Analítica: solo el beacon de Cloudflare (`Base.astro:224`), sin eventos. No se sabe
  cuántos visitantes llegan hasta el CTA ni cuántos lo pulsan. Sin eso no hay A/B posible.
- Smart banner de iOS solo en Safari; desde la app de Google o Chrome no sale. La barra
  propia (`BarraApp`) lo cubre a partir de 320 px de scroll.

## 2. Referencia medida: Fig (`foodisgood.com/is-milk-fat-low-fodmap/`)

Misma pregunta, misma respuesta corta arriba. Después, en este orden: **5★ (16k)** en la
parte alta; «Try Free» a un deep link de Branch (`fig.app.link/...`); capturas del
escáner y de la lista de la compra; «100+ stores»; enlace a la guía; dos «siguiente
pregunta» al pie («Is milk chocolate low FODMAP?», «Is milk low FODMAP?»).

Lo que enseña: Fig **no esconde la respuesta**; vende lo que viene después de ella
(escanear, comprar, la siguiente duda) y lo respalda con la nota. Nosotros no tenemos
la nota, así que la prueba tiene que salir de otro sitio.

No medido: los interstitials de AllTrails o Vivino en móvil (la herramienta no ve la UI
móvil). Da igual: Google penaliza los interstitials de app en móvil desde 2015 y no es
un camino.

## 3. Criterio

Quién llega: alguien con una duda sobre **un** alimento, desde el móvil, en su idioma,
que ya hace la dieta (sabe la palabra «FODMAP»). La ficha le responde en la primera
pantalla, así que ya tiene lo que vino a buscar. **La instalación no puede salir de la
respuesta; sale de hacer visible la siguiente pregunta**, la que la web no responde y la
app sí. Hay tres, de más débil a más fuerte:

1. «¿Y mañana, con otro alimento?» → 1.843 sin conexión. Débil: la web también los tiene.
2. «¿Y en el súper, con un envase de treinta ingredientes?» → escáner. Fuerte, pero solo
   para envasados e ingredientes; a quien pregunta por la acelga no le dice nada.
3. «¿Y para **mí**?» → lo que tú toleras, la ración que te sienta, la fase en la que
   estás, el diario. Es la única pregunta que **solo** la app responde, es lo que Fig
   vende con «Create your Fig» y lo que las apps de salud venden con un cuestionario. La
   respuesta de la web («bajo en FODMAP en 75 g») es para la mayoría; el deseo nace de
   «para ti puede ser otra».

Confianza sin valoraciones: lo que hay y es verdad son las fuentes con nombre (ANSES,
USDA, FSANZ, DTU, los papers de Monash), «1.843 alimentos, cada uno con su fuente», y
«sin cuenta». Y el 71 % de «nadie ha medido esto» se puede convertir en criterio: la app
es la que **te dice qué está medido y qué es estimado**.

Los cuatro fallos que explican el cero: (a) el mismo argumento para todo; (b) ninguna
prueba junto a los botones; (c) las páginas con más impresiones no llevan argumento;
(d) nada se mide entre la visita y la tienda.

## 4. Plan

### Fase 0 — Medir (antes de cambiar nada)

- Eventos por CTA (`data-ct` ya distingue cada bloque) y un evento «llegó al CTA»
  (IntersectionObserver), a Plausible (sin cookies, sin banner) o a un beacon propio en
  el nginx de Coolify. Recomiendo Plausible: cuesta menos que mantener el beacon.
- Leer una vez la Adquisición de Play por `utm_campaign` en la VM: el cero de Android.
- Métrica única: **vistas de ficha en tienda por 1.000 visitas** (ASC Web Referrer +
  Play UTM), y por bloque, clics por 1.000 visitas. Base: 0.

### Fase 1 — P0, un despliegue, dos semanas de medida

| # | Cambio | Dónde | `ct` |
| --- | --- | --- | --- |
| 1 | **Argumento por tipo de alimento** en el primer CTA: frescos (fruits, vegetables, legumes, nuts_seeds, protein) → «¿Y para ti?» (ración que te sienta, fase, diario); envasados e ingredientes (condiments, snacks, beverages, sweeteners, dairy, grains) → escáner | `Alimento.astro:175`, `CtaEscaner.astro` + un `CtaTi.astro` nuevo | `web-ti` / `web-escaner` |
| 2 | **La tarjeta de la app de ESTE alimento** como imagen, generada en build desde `foods.json` (SVG → webp, una por alimento e idioma): «Así lo ves en la app», con el deslizador de ración y el aviso de acumulación. Es lo que hace concreto el «para ti» y lo que Fig no tiene | `scripts/` + `CtaTi.astro` | — |
| 3 | **Prueba junto a cada botón**, solo lo verificable: «1.843 alimentos, cada uno con su fuente», logos-texto «ANSES · USDA · FSANZ · DTU», «Sin cuenta». Nada de estrellas ni de «miles de usuarios» | `CtaApp.astro`, `CtaEscaner.astro`, `CtaTi.astro` | — |
| 4 | **Listas con CTA**: el bloque «para ti» en `Categoria.astro` y `AlimentosIndex.astro` («Esta lista, filtrada por lo que tú toleras») | `Categoria.astro:49-88` | `web-lista` |
| 5 | **Escritorio (21 %)**: QR estático (SVG en build) al enlace de tienda, en la banda, en vez del ancla `#descargar` | `CtaApp.astro`, `Base.astro:137-165` | `web-qr` |
| 6 | **Puente al final de la FAQ**: la respuesta acaba en «la tolerancia puede cambiar»; seguir con «La app lleva la cuenta del día» + botón | `Alimento.astro:252` | `web-faq` |
| 7 | **Procedencia C reescrita** sin mentir: «Ningún laboratorio ha publicado la medición; el nivel sale de tablas de composición con criterio conservador. La app marca qué dato es medido y cuál estimado» | `fuentes.json` → viene de la app (`exportar-web.ts`), así que se cambia allí | — |

Despliegue por idioma, no de golpe: primero `es` (54 clics en 14 días, el que más), el
resto quieto como control. Compara `es` contra `it` a los 14 días.

### Fase 2 — P1, requiere tocar la app; solo si la fase 1 mueve el cero

- **Deep link con el alimento**: `fodmind://alimento/<id>` con fallback a la tienda y,
  tras instalar, deferred deep link (Play Install Referrer en Android; en iOS hace falta
  Branch/AppsFlyer o el portapapeles). Que quien instala desde «acelga» abra la app en
  «acelga».
- **Cuestionario de tres preguntas en la web** (¿en qué fase estás? ¿qué te sienta mal?
  ¿cuánto llevas?) cuya última pantalla es «tu lista está en la app». Es el «Create your
  Fig», y encaja con que la app ya abre con cuestionario desde la 2.5.1.

### Qué no hacer

- Interstitial o pop-up de app en móvil: penalización de Google y CTR peor.
- Esconder la respuesta debajo del CTA: pierde la posición y la confianza.
- Contadores o valoraciones que no existen.
- Cambiar títulos, URLs o H1 mientras Google evalúa el índice (7.212 en cola).
- Tocar las 11.486 URLs a la vez: por idioma, con control.

### Cómo se sabe si funcionó

Cada bloque con su `ct`. Éxito a los 14 días de la fase 1 en `es`: aparece al menos una
fila en ASC → Campaigns (umbral 5) y Web Referrer deja de ser «—»; en Plausible, clics
por 1.000 visitas por bloque, para saber cuál tira. Si sigue en cero con la fase 1
puesta, el problema no está en la web: está en una ficha de tienda con 0 valoraciones, y
lo siguiente son reseñas, no landings.

## 5. Pendientes

- Adquisición de Play por UTM (VM).
- Elegir Plausible o beacon propio.
- Comprobar en qué pantalla entra hoy quien instala desde la web (onboarding con
  cuestionario en 2.5.1): el «¿Y para ti?» de la web tiene que enlazar con esa promesa.

## 6. Hecho el 21-sep (fases 0 y 1, en `es`)

- Contadores: `webEvento` y `webInforme` desplegadas en `europe-west1` del proyecto
  `fodmap-guide-app` (repo de la app, `backend/functions/web-eventos.js`). Cada
  página manda `vista`, `visto` (botón a media pantalla) y `clic` por `fetch` con
  `keepalive`, no por `sendBeacon`: medido en Chrome, `sendBeacon` devolvía `true` y
  no llegaba nada. Se leen con `node scripts/eventos.mjs [desde] [hasta]`; la clave
  está en `C:/Users/bank0/fodmind-web-informe-clave.txt`.
- Fase 1 en `es` (commit `d8d03f3` + `8283b84`): frescos → `CtaTi` (`web-ti`), envasados →
  lector (`web-escaner`), listas (`web-lista`), QR de escritorio (`/qr/`, `web-qr`), puente
  de la FAQ (`web-faq`), procedencia C reescrita, prueba junto a cada botón. Los otros
  cinco idiomas siguen como estaban: `web-contextual` y sin prueba.
- Comprobado en vivo en `/es/alimentos/acelga/`: bloques pintados, `vista` y `clic`
  contados en Firestore; los `visto` solo se registran cuando la pestaña pinta
  fotogramas (en una pestaña automatizada en segundo plano no salen).
- Sin hacer: la lectura de Adquisición de Play por UTM (solo por la VM). Es el cero de
  Android y se puede leer cuando se lea la primera quincena.
- Lectura prevista: **5 de octubre**. `node scripts/eventos.mjs 2026-09-21` para el tramo
  visita → botón, y ASC → Analytics → Campaigns para el tramo botón → descarga. Comparar
  `es` contra `it` (el control con más clics).
