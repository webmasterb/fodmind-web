import { Lang } from '@/data/types';

// De un código de barras a la lista de ingredientes.
//
// ── LO QUE ESTA PIEZA ES Y LO QUE NO ES ───────────────────────────────────
//
// El código de barras es un ATAJO DEL ATAJO: cuando el producto está en la
// base, es un toque y cero esfuerzo. Cuando no está —y no está más veces de
// las que parece— el lector sigue teniendo la etiqueta delante y la lee. Por
// eso esto nunca puede ser la función: es el camino rápido de una función que
// ya funciona sin él.
//
// ── LOS NÚMEROS, MEDIDOS Y NO SUPUESTOS (22-ago-2026) ─────────────────────
//
// Preguntado a la propia API de Open Food Facts: de 369.803 productos
// españoles, solo 52.341 tienen la lista de ingredientes rellena. Un 14 %.
// Por marca de la compra real: Carrefour 59 %, Dia 41 %, Hacendado 36 %,
// Eroski 19 %. O sea que escaneando algo de Mercadona hay una probabilidad
// entre tres de obtener respuesta.
//
// Leer el código, en cambio, casi nunca falla: 64 de 72 sobre ocho EAN-13
// reales degradados de nueve maneras, y el único fallo es el desenfoque de
// antes de enfocar. El cuello de botella es la BASE, no la cámara.
//
// ── POR QUÉ ESTO NO ROMPE LA PROMESA DE «SIN CONEXIÓN» ────────────────────
//
// Todo lo demás de la app sigue funcionando sin red, incluido el lector por
// texto y por foto. Esta consulta concreta la necesita, se dice, y cuando no
// hay se cae al camino que sí funciona. Además lo consultado se guarda: el
// segundo escaneo del mismo yogur ya es local.
//
// ── LA FICHA ES VIEJA, Y AHORA SE SABE CUÁNTO (26-ago-2026) ───────────────
//
// La caché medía la frescura con la fecha en que la consultamos NOSOTROS, que
// no dice nada de la ficha: un producto sin tocar desde 2021 parece fresco si
// se escaneó ayer. Preguntando a la propia base por `last_modified_t` sobre
// 1.300 productos españoles con ingredientes, repartidos por todo el índice
// (`scripts/edad-open-food-facts.mjs`):
//
//     mediana 3,4 años sin tocarse · p10 1,9 · p90 5,1 · máximo 6,8
//     NI UNO SOLO de los 1.300 editado en el último año
//
// Dos consecuencias, y las dos están aplicadas. Una, refrescar a los 90 días
// gastaba una consulta en un sótano de supermercado para volver con la misma
// ficha, así que la ventana sube a un año, que es donde la medición dice que
// empieza a haber cambios. Y dos, el año de la última revisión viaja hasta la
// pantalla: «pueden estar desactualizados» es un aviso que no se puede
// accionar, y «la revisaron en 2022» sí.
//
// ── ATRIBUCIÓN ────────────────────────────────────────────────────────────
//
// Los datos son de Open Food Facts bajo Open Database License (ODbL), que
// obliga a citar la fuente. Se cita DONDE SE ENSEÑA EL DATO: en el resultado de
// todo escaneo (`labelBarcodeSource`) y en la despensa, las dos con guardián.
// En la pantalla de fuentes todavía NO está, y esta línea decía que sí — que es
// la clase de afirmación que un revisor comprueba después de un 1.4.1. OJO: la
// cláusula de *share-alike* de la ODbL es más exigente si algún día se EMPAQUETA
// un volcado de la base dentro de la app; consultarla por red es otra cosa.

const BASE = 'https://world.openfoodfacts.org/api/v2/product';

/**
 * Se identifica la app, como pide su política de uso, y sin nada del usuario:
 * ni id de dispositivo, ni cuenta, ni nada que permita seguir a nadie.
 */
const USER_AGENT = 'Fodmind/2.3 (app movil; contacto en la ficha de la App Store)';

/**
 * Corto a propósito. Esto se usa en un pasillo de supermercado, muchas veces
 * con una barra de cobertura: más de cinco segundos mirando una ruleta y el
 * usuario ya ha desistido, cuando tenía la etiqueta delante todo el rato.
 */
export const TIMEOUT_MS = 5000;

export interface Producto {
  code: string;
  nombre: string | null;
  marca: string | null;
  /** la lista tal cual, para que el motor la analice y el usuario la vea */
  ingredientes: string;
  /**
   * En qué idioma vino la lista, si se pudo saber.
   *
   * No es un detalle: la base es colaborativa y el mismo producto español
   * puede tener los ingredientes que tecleó un francés. Comprobado con un Old
   * El Paso de código español que devolvía la lista en francés. Da igual para
   * el análisis —el diccionario es políglota— pero NO para el usuario, que
   * tiene que poder comprobar lo que la app leyó.
   */
  idioma: string | null;
  /**
   * Cuándo tocó esta ficha por última vez un colaborador, en milisegundos, o
   * `null` si la base no lo dijo.
   *
   * NO ES CUÁNDO LA CONSULTAMOS: es la edad del dato, que es lo único que
   * responde «¿me puedo fiar de esto?». La mediana española son 3,4 años (ver
   * la cabecera), así que esto casi nunca es un detalle menor.
   */
  modificado: number | null;
}

export type Respuesta =
  | { estado: 'ok'; producto: Producto }
  /** está en la base pero nadie ha tecleado sus ingredientes: es el caso más común */
  | { estado: 'sin-ingredientes'; nombre: string | null }
  | { estado: 'no-esta' }
  /**
   * No hubo respuesta útil, y POR QUÉ no la hubo.
   *
   * TODO CAÍA EN «no hay conexión», y con cuatro barras de cobertura. Un 429 de
   * límite de peticiones de Open Food Facts, un 500 o el mantenimiento de su
   * servidor salían como falta de red: la pantalla mandaba a buscar señal a
   * quien la tenía entera, o sea a pasear por el súper por un fallo que está en
   * el otro extremo del cable. El otro cliente de la app ya lo separaba y dice
   * por qué (`ia-lectura.ts`), y esta era la mitad que faltaba.
   */
  | { estado: 'sin-red'; motivo: 'servidor' | 'plazo' | 'red'; codigo?: number };

/** Los EAN/UPC que tienen sentido consultar. */
export function esCodigoValido(code: string): boolean {
  return /^\d{8}$|^\d{12,14}$/.test(code.trim());
}

/**
 * El código con el que se PREGUNTA y con el que se GUARDA, que tienen que ser
 * el mismo.
 *
 * AQUÍ SE GUARDABA CON UNA CLAVE Y SE BUSCABA CON OTRA. La ficha se archivaba
 * bajo el `code` que devuelve Open Food Facts —que normaliza: un UPC-A de doce
 * dígitos vive en su índice como EAN-13 con un cero delante— y se buscaba con
 * el que había leído la cámara. En Android ML Kit entrega los UPC-A con doce
 * dígitos, así que el caso es real, y cuando pasa el acierto de cache no ocurre
 * NUNCA para ese producto: ni banner de «ya lo escaneaste», ni ahorro de los
 * cinco segundos de red, y una lectura cobrada en cada escaneo del mismo
 * envase.
 *
 * Se normaliza en un solo sitio y la clave pasa a ser siempre la nuestra, en
 * vez de depender de lo que conteste la base.
 */
export function normalizarCodigo(code: string): string {
  const solo = code.replace(/\D/g, '');
  return solo.length === 12 ? `0${solo}` : solo;
}

/**
 * Los idiomas de lista que se le piden a la base: los seis de la app.
 *
 * Son los seis y no una lista aparte a propósito: la app solo sabe enseñar un
 * texto que el usuario pueda leer, y el inglés —la lengua franca de Open Food
 * Facts, donde acaban las fichas de importación— ya está dentro.
 */
export const IDIOMAS_DE_LISTA = ['es', 'en', 'fr', 'de', 'it', 'pt'] as const;

/**
 * Si esto tiene forma de lista de ingredientes.
 *
 * AQUÍ HABÍA UN MÍNIMO DE 25 CARACTERES, y descartaba listas de verdad:
 * «Tomate, sal» son once. Los productos de dos o tres ingredientes —conservas,
 * lácteos, legumbres de bote— son justo los que más se miran con SII, porque
 * tienen poco dentro, y la app contestaba que nadie los había escrito y mandaba
 * a fotografiar una etiqueta de tres palabras.
 *
 * Lo que se quería descartar no era lo corto sino los restos de UNA palabra que
 * la base tiene a montones («agua», «-»), y eso se reconoce por la forma —hay
 * separadores, o sea más de un ingrediente—, no por el largo.
 */
export function pareceLista(v: string): boolean {
  const t = v.trim();
  if (t.length >= 25) return true;
  const trozos = t
    .split(/[,;·()]/)
    .map((x) => x.trim())
    .filter(Boolean);
  return trozos.length >= 2;
}

/**
 * Saca la lista de ingredientes de la respuesta: primero el idioma de la app,
 * luego el campo genérico y por último los otros cinco idiomas de la app.
 *
 * LOS OTROS CINCO SON NUEVOS Y SON BARATOS. El cuello de botella medido de esta
 * función es la cobertura (14 %), y una ficha con `ingredients_text` vacío pero
 * con `ingredients_text_en` relleno se contestaba como «nadie ha escrito sus
 * ingredientes» teniendo el dato delante. La app ya sabe convivir con una lista
 * en otro idioma: el diccionario es políglota y el aviso de idioma ajeno
 * existe. Ojo con lo que esto NO es: el campo genérico suele ser copia del
 * idioma principal de la ficha, así que el caso es minoritario y esto no mueve
 * el 14 %.
 */
export function elegirIngredientes(
  p: Record<string, unknown>,
  lang: Lang
): { texto: string; idioma: string | null } | null {
  const candidatos: [string, string | null][] = [
    [`ingredients_text_${lang}`, lang],
    ['ingredients_text', (p.lang as string) ?? null],
    ...IDIOMAS_DE_LISTA.filter((l) => l !== lang).map(
      (l) => [`ingredients_text_${l}`, l] as [string, string | null]
    ),
  ];
  for (const [campo, idioma] of candidatos) {
    const v = p[campo];
    if (typeof v === 'string' && pareceLista(v)) {
      return { texto: v.replace(/\s+/g, ' ').trim(), idioma };
    }
  }
  return null;
}

/**
 * Pregunta por un código de barras.
 *
 * NUNCA LANZA: los cuatro finales posibles son estados, no excepciones, porque
 * los cuatro llevan a un mensaje distinto en pantalla y todos son normales.
 * «No está en la base» no es un error de la app, es el caso mayoritario.
 */
export async function buscarProducto(
  code: string,
  lang: Lang,
  fetchImpl: typeof fetch = fetch
): Promise<Respuesta> {
  if (!esCodigoValido(code)) return { estado: 'no-esta' };

  const campos = [
    'code',
    'product_name',
    `product_name_${lang}`,
    'brands',
    'lang',
    'last_modified_t',
    'ingredients_text',
    ...IDIOMAS_DE_LISTA.map((l) => `ingredients_text_${l}`),
  ].join(',');

  // EL PLAZO SE MONTA A MANO, Y NO ES POR GUSTO.
  //
  // Aquí ponía `AbortSignal.timeout(TIMEOUT_MS)`, que es lo natural y lo que
  // funciona en Node. En la app NO EXISTE: React Native sustituye el
  // `AbortSignal` global por el del paquete `abort-controller`, y ese solo trae
  // el prototipo — no tiene el estático `timeout`. Llamarlo lanza un TypeError,
  // lo recoge el `catch` de abajo, y la función devuelve «sin red».
  //
  // O sea que la búsqueda por código de barras contestaba «no he podido
  // conectar» SIEMPRE, en todos los escaneos, con cobertura perfecta. Y no lo
  // veía ningún test porque Jest corre en Node, donde el estático sí está: el
  // banco de códigos entero pasaba en verde sobre una función muerta.
  //
  // `AbortController` + `setTimeout` es lo que ya usa `ia-lectura.ts`, y
  // funciona en los dos sitios.
  const corte = new AbortController();
  const plazo = setTimeout(() => corte.abort(), TIMEOUT_MS);

  let datos: Record<string, unknown>;
  try {
    const r = await fetchImpl(`${BASE}/${encodeURIComponent(normalizarCodigo(code))}?fields=${campos}`, {
      headers: { 'User-Agent': USER_AGENT },
      signal: corte.signal,
    });
    // Un 404 de esta API significa «no lo tengo», que es información y no un
    // fallo; cualquier otro código raro se trata como falta de red, porque
    // desde el punto de vista del usuario es lo mismo: no hay respuesta.
    if (r.status === 404) return { estado: 'no-esta' };
    // Y CUALQUIER OTRO CÓDIGO ES SU SERVIDOR, NO TU COBERTURA. Se distinguen
    // porque el consejo no se parece: sin cobertura hay que moverse, y con el
    // servidor caído moverse no arregla nada.
    if (!r.ok) return { estado: 'sin-red', motivo: 'servidor', codigo: r.status };
    const crudo: unknown = await r.json();
    // Un cuerpo que no es un objeto —null, una cadena, una lista— es una
    // respuesta que no entendemos, y leerle propiedades revienta. Se trata como
    // «no lo tengo», que es lo único honesto que se puede decir de ella.
    if (typeof crudo !== 'object' || crudo === null) return { estado: 'no-esta' };
    datos = crudo as Record<string, unknown>;
  } catch {
    // Agotar el plazo aborta la petición, así que aquí llegan las dos cosas por
    // la misma puerta y solo la señal las separa: cinco segundos sin contestar
    // es lentitud del otro lado, y un fetch que revienta antes es esta red.
    return { estado: 'sin-red', motivo: corte.signal.aborted ? 'plazo' : 'red' };
  } finally {
    clearTimeout(plazo);
  }

  if (datos.status === 0 || typeof datos.product !== 'object' || datos.product === null) {
    return { estado: 'no-esta' };
  }
  const p = datos.product as Record<string, unknown>;

  const nombre =
    (typeof p[`product_name_${lang}`] === 'string' && (p[`product_name_${lang}`] as string)) ||
    (typeof p.product_name === 'string' && p.product_name) ||
    null;

  const ing = elegirIngredientes(p, lang);
  if (!ing) return { estado: 'sin-ingredientes', nombre: nombre || null };

  return {
    estado: 'ok',
    producto: {
      // NUESTRA CLAVE, NO LA SUYA: con `p.code` la ficha se guardaba bajo el
      // código normalizado por Open Food Facts y se buscaba con el que leyó la
      // cámara. Ver `normalizarCodigo`.
      code: normalizarCodigo(code),
      nombre: nombre || null,
      marca: typeof p.brands === 'string' ? p.brands.split(',')[0].trim() : null,
      ingredientes: ing.texto,
      idioma: ing.idioma,
      // Viene en segundos y se guarda en milisegundos, que es lo que usa el
      // resto de la app. Un cero o un texto no son una fecha: valen `null`,
      // porque «no lo sé» y «lo revisaron en 1970» no se parecen en nada.
      modificado:
        typeof p.last_modified_t === 'number' && p.last_modified_t > 0
          ? p.last_modified_t * 1000
          : null,
    },
  };
}
