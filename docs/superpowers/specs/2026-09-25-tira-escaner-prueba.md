# La tira del escáner: cinco animaciones a prueba (25-sep-2026)

**Qué hay.** Desde el 25-sep todas las páginas llevan una tira fija abajo, visible al
abrir, con una animación del escáner y un botón «Escanear». Sustituye a la barra que
salía al bajar en móvil (`BarraApp`, 21-sep). Cinco variantes; a cada visitante le toca
una al azar, se guarda en `localStorage.tira-v` y la ve igual en todas las páginas. La X
la cierra para el resto de la sesión (`sessionStorage.tira`). Sale en móvil y en
escritorio (en escritorio el botón baja a la banda de descarga, como los demás).

| Letra | Animación | Lo que enseña |
| --- | --- | --- |
| a | el láser barre el paquete | veredicto y chip por producto |
| b | el visor de la cámara se tiñe | BAJO / MEDIO / ALTO en dos segundos |
| c | la cinta del súper con un arco | todo el catálogo y cualquier envase |
| d | el láser rojo del súper sobre un código | cuánto puedes comer, no solo sí o no |
| e | la lupa recorre la lista de ingredientes | los disparadores en la letra pequeña y la alternativa |

Los productos y sus números son los del catálogo (`foods.json`): pan de trigo alto con
25 g seguros, leche sin lactosa sin límite, bebida de avena moderada a 125 ml, hummus
moderado a 40 g, cornflakes moderados a 30 g, manchego sin límite, cebolla frita a evitar,
espelta de masa madre como alternativa baja. Nada que la ficha del alimento contradiga.

**Cómo se mide.** Los tres contadores de `Base.astro` cuentan el botón de cada letra sin
tocar nada: `web-tira-a` … `web-tira-e`, «visto» (la mitad visible, una vez por página) y
«clic». `node scripts/eventos.mjs 2026-09-25 2026-10-02` imprime al final una tabla por
letra con vistos, clics y clics por cien vistos. Las tiendas separan además las descargas
por campaña `web-tira-<letra>` (App Store Connect → Analytics → Campaigns, umbral 5;
Play por UTM, solo desde la VM).

**Lectura: 2-oct-2026.** Con ~25 clics/día desde el buscador y cinco letras, en una
semana cada letra habrá salido unas 35 veces: solo se verá una diferencia grande. Si
ninguna despunta, dejar correr dos semanas más antes de quedarse con una. Cuando se
decida, la ganadora se queda como única tira y las otras cuatro salen del componente.

**Con la prueba del 21-sep** (`es` contra `it`, botones de la ficha): la tira sale en los
seis idiomas por igual, así que no cambia la comparación entre idiomas, pero puede
quitarle clics a los botones de `es` en prueba. Al leer el 5-oct, mirar la fila de la tira
junto a las demás.

**Ficheros.** `src/components/TiraEscaner.astro` (las cinco, el reparto y la X),
`src/i18n/tira.ts` (textos en seis idiomas, aparte de `strings.ts` porque son cinco
animaciones con sus productos), `scripts/eventos.mjs` (la tabla final),
`docs/propuestas-escaner/` (las cinco maquetas de partida y el guion que las fotografía).

**Decisiones que costaron algo.** El fondo de la tira es opaco: con alfa 0,97 Chrome sin
cabeza mezcla capas viejas en las capturas y no se puede verificar. Con
`prefers-reduced-motion` cada tira se queda quieta en su momento de veredicto con un solo
producto. Los títulos de a, b y d van en una línea con puntos suspensivos si no caben,
porque debajo hay resultados que rotan en posición absoluta; c y e tienen el texto libre.
