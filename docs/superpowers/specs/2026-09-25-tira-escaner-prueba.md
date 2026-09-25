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

**Cada página habla de lo suyo (desde el 25-sep, segunda versión).** Julen pidió que el
texto no fuera fijo sino de cada alimento. Lo decide `src/lib/tira.ts`, puro, con los
alimentos que le pasa la página:

| Página | Alimento de la tira |
| --- | --- |
| ficha | el suyo; detrás, sus sustitutos de nivel más bajo o, si no tiene, bajos de su categoría; detrás de uno bajo, dos altos de su categoría como contraste |
| categoría | su primer alimento alto con salida en la categoría (frutas → plátano maduro) |
| nivel | los tres primeros de ese nivel (y categoría) |
| post del blog | los alimentos que enlaza (lactosa → leche de vaca) |
| artículo de la guía | el que trata, fijado a mano en `GUIA` (etiquetas → miel, sabor sin ajo → cebolla) |
| portada, índices, legal | el texto general de `i18n/tira.ts` |

Todo sale del catálogo: nivel, ración segura con la coma de cada idioma («hasta 24,5 g»,
«evitar» si es 0, «sin ración probada» si no está medida), FODMAP y sustitutos. Las
plantillas (`i18n/tira-foco.ts`) ponen el nombre delante para no depender del género ni del
artículo. En los títulos el nombre va sin paréntesis y, si pasa de 24 letras, cortado por
palabras con «…», porque lo que no puede perderse es el final («: tu ración segura»); si
dos recortes coinciden van enteros. `tests/tira.test.mjs` recorre los 1.843 × 6 y exige
título con su nombre, ningún título repetido, alternativas más bajas y cero huecos.

**Pantallas.** Banda a todo lo ancho en móvil (la animación se encoge por debajo de 400 px);
tarjeta flotante centrada y escalada desde 700 px (iPad, portátil); más baja con el móvil
apaisado; el hueco al final de la página se mide en vivo. Comprobado a 320, 360, 390,
844×390, 768, 1024, 1366 y 1920: texto y botón no se tocan en ninguna. Único límite
conocido: con los nombres más largos a 320 px dos títulos pierden el final.

**Toda la tira es el botón (25-sep).** Un toque en cualquier sitio salvo la X se reenvía al
enlace con `.click()`: mismo destino (tienda, app en Android, banda en escritorio) y un solo
clic en el contador. Comprobado tocando título, animación, hueco y botón con iPhone, Android
y ordenador. Cambia lo que cuenta como clic desde el primer día de la lectura, igual para
las cinco.

**Arreglo en la B el 25-sep.** Los turnos de lo que rota iban por `nth-of-type` y en el
visor no coincidían: marco de un color, dos veredictos superpuestos y el nombre de otro
producto. Van por clase (t1-t3) y el test lo vigila. Como la B estuvo así unas horas y el
texto de las cinco cambió a la vez, la lectura cuenta desde el 26-sep.

**Cómo se mide.** Los tres contadores de `Base.astro` cuentan el botón de cada letra sin
tocar nada: `web-tira-a` … `web-tira-e`, «visto» (la mitad visible, una vez por página) y
«clic». `node scripts/eventos.mjs 2026-09-26 2026-10-02` imprime al final una tabla por
letra con vistos, clics y clics por cien vistos. Las tiendas separan además las descargas
por campaña `web-tira-<letra>` (App Store Connect → Analytics → Campaigns, umbral 5;
Play por UTM, solo desde la VM).

**Lectura: 2-oct-2026, con los datos del 26-sep al 2-oct.** Con ~25 clics/día desde el
buscador y cinco letras, en una semana cada letra habrá salido unas 35 veces: solo se verá
una diferencia grande. Si
ninguna despunta, dejar correr dos semanas más antes de quedarse con una. Cuando se
decida, la ganadora se queda como única tira y las otras cuatro salen del componente.

**Con la prueba del 21-sep** (`es` contra `it`, botones de la ficha): la tira sale en los
seis idiomas por igual, así que no cambia la comparación entre idiomas, pero puede
quitarle clics a los botones de `es` en prueba. Al leer el 5-oct, mirar la fila de la tira
junto a las demás.

**Ficheros.** `src/components/TiraEscaner.astro` (las cinco, el reparto y la X),
`src/lib/tira.ts` (qué dice cada página), `src/i18n/tira.ts` (el texto general) y
`src/i18n/tira-foco.ts` (las plantillas con alimento), `tests/tira.test.mjs`,
`scripts/eventos.mjs` (la tabla final),
`docs/propuestas-escaner/` (las cinco maquetas de partida y el guion que las fotografía).

**Decisiones que costaron algo.** El fondo de la tira es opaco: con alfa 0,97 Chrome sin
cabeza mezcla capas viejas en las capturas y no se puede verificar. Con
`prefers-reduced-motion` cada tira se queda quieta en su momento de veredicto con un solo
producto. Los títulos tienen dos líneas como mucho y lo que rota una por dato, con puntos
suspensivos, porque rota en posición absoluta y la altura de la tira no puede bailar.
