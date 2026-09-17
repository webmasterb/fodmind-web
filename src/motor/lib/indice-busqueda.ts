import { SEARCH_ALIASES } from '@/data/aliases';
import { allFoods } from '@/data/foods';
import { Food, Lang } from '@/data/types';

// LOS TEXTOS DEL CATÁLOGO, NORMALIZADOS UNA VEZ Y NO EN CADA TECLA.
//
// `matchesFood`, `matchesFoodConErratas`, `rankFood` y `searchFoods` tenían la
// MISMA línea copiada cuatro veces —reconstruir el nombre local, el inglés y
// los alias y pasarlos por `normalize`—, así que cada pulsación de tecla
// renormalizaba los 1.843 alimentos hasta cuatro veces, y el comparador del
// `sort` de la pantalla de inicio repetía `rankFood` decenas de miles de veces
// más. `normalize` no es barata: un `toLowerCase`, cuatro `replace`, un
// `normalize('NFD')` y dos regex más, por cadena.
//
// Aquí se hace una vez por idioma y se guarda. No depende de ningún dato del
// usuario —el catálogo es estático—, así que NO hay nada que invalidar: no se
// engancha a `alBorrarTodo` ni a `alImportar`.

const GUION_O_APOSTROFO = /[-‐‑‒–—―‘’ʼ'`´_]/g;

/** Lo que separa una palabra de otra una vez normalizado: espacios, paréntesis, comas. */
const NO_PALABRA = /[^a-z0-9]+/;

export function normalize(s: string): string {
  return (
    s
      // NFC ANTES DE MIRAR LETRAS. Un texto en NFD trae la diéresis como
      // carácter suelto, y entonces `ü` no es `ü` para un `replace`: la
      // eszett y las ligaduras se salvaban por ser letras de una pieza, pero
      // cualquier regla sobre vocales acentuadas fallaría en silencio según
      // de dónde venga la cadena (un OCR, un portapapeles, el catálogo).
      .normalize('NFC')
      .toLowerCase()
      // La eszett NO es un diacrítico y sobrevive al NFD: «süßungsmittel» se
      // quedaba en `sußungsmittel` y no casaba con nada escrito con ss. Y en
      // alemán eso no es un caso raro, es la mitad del idioma en una etiqueta:
      // LAS MAYÚSCULAS ALEMANAS NO TIENEN ß, siempre se escriben SS. Una lista de
      // ingredientes en mayúsculas —que son muchas— dejaba invisibles WEISSKOHL,
      // EIWEISS y SÜSSUNGSMITTEL, cada uno con su alimento detrás.
      .replace(/ß/g, 'ss')
      // Y la misma historia con las ligaduras francesas, que tampoco son
      // diacríticos ni se descomponen: «Bœuf» y «Œufs» son la ternera y los
      // huevos, de lo más buscado que hay, y quien teclea `boeuf` u `oeufs`
      // desde un móvil —que es como se escribe cuando no hay tecla— no
      // encontraba nada. También los corazones de alcachofa y de palmito.
      .replace(/œ/g, 'oe')
      .replace(/æ/g, 'ae')
      .normalize('NFD')
      // elimina diacríticos para que "platano" encuentre "plátano"
      .replace(/[̀-ͯ]/g, '')
      // Y el guion y el apóstrofo pasan a espacio, en los DOS lados. El lector
      // de etiquetas ya lo hacía y el buscador no compartía el arreglo: 106
      // alimentos no se encontraban al teclearlos como se teclean. El portugués
      // y el alemán componen con guion —«batata-doce», «couve-flor»,
      // «alho-francês», «Nashi-Birne»— y nadie escribe el guion al buscar.
      .replace(GUION_O_APOSTROFO, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/** Las palabras sueltas de un texto ya normalizado, sin paréntesis ni comas. */
export function palabrasDe(texto: string): string[] {
  return texto.split(NO_PALABRA).filter((p) => p.length > 0);
}

export interface TextosDeAlimento {
  /** nombre local, inglés y alias, ya normalizados */
  textos: string[];
  /** cada uno partido en palabras, para las comparaciones por palabra entera */
  palabras: string[][];
  /** el nombre local normalizado, que es el que ordena `searchFoods` */
  nombre: string;
  /** solo los sinónimos, que `searchFoods` puntúa aparte del nombre */
  alias: string[];
  /**
   * Las palabras del nombre local ANTES del paréntesis: «Spring onion (green
   * tops)» es «spring onion». Lo de dentro del paréntesis es una apostilla,
   * nunca el sustantivo, y `rankFood` busca el sustantivo aquí.
   */
  cabeza: string[];
}

function construir(f: Food, lang: Lang): TextosDeAlimento {
  const nombre = normalize(f.names[lang] ?? f.names.en);
  const alias = (SEARCH_ALIASES[f.id] ?? []).map((a) => normalize(a));
  const textos = [nombre, normalize(f.names.en), ...alias];
  const corte = nombre.indexOf('(');
  const cabeza = palabrasDe(corte > 0 ? nombre.slice(0, corte) : nombre);
  return { nombre, alias, textos, palabras: textos.map(palabrasDe), cabeza };
}

const CACHE = new Map<Lang, Map<string, TextosDeAlimento>>();

/** El catálogo entero normalizado en ese idioma. Se construye la primera vez y se queda. */
export function indice(lang: Lang): Map<string, TextosDeAlimento> {
  const hecho = CACHE.get(lang);
  if (hecho) return hecho;
  const m = new Map<string, TextosDeAlimento>();
  for (const f of allFoods) m.set(f.id, construir(f, lang));
  CACHE.set(lang, m);
  return m;
}

/**
 * Los textos de UN alimento en ese idioma.
 *
 * Con caída al cálculo directo a propósito: las funciones de búsqueda se
 * llaman también con alimentos que no salen de `allFoods` —los de los tests y
 * los que arma el lector de etiquetas—, y un `indice(lang).get(id)!` los
 * convertiría en un `undefined` reventando en producción.
 */
export function textosDe(f: Food, lang: Lang): TextosDeAlimento {
  return indice(lang).get(f.id) ?? construir(f, lang);
}
