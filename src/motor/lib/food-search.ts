import { allFoods } from '@/data/foods';
import { Food, Lang } from '@/data/types';
import { indice, normalize, palabrasDe, textosDe } from '@/lib/indice-busqueda';

// `normalize` vive en `indice-busqueda.ts` —junto al índice que la usa para
// todo el catálogo— y se reexporta desde aquí porque es de donde la importan
// la pantalla de inicio, el lector de etiquetas y sus guardias. Mover el
// fichero no tenía por qué mover el `import` de nadie.
export { normalize, palabrasDe };

/**
 * Las formas en que una palabra tecleada puede vivir en el catálogo.
 *
 * El catálogo nombra en singular («Fresa», «Zanahoria») y la gente teclea en
 * plural: `fresas` devolvía cero. Es el mismo problema que el lector de
 * etiquetas resolvió con su `singularizar` — aquí en la otra dirección: se
 * singulariza LA CONSULTA, no el índice.
 *
 * POR IDIOMA, Y NO SOLO EN ESPAÑOL. Las tres reglas de antes eran españolas
 * (-ces→z, -es, -s) y se aplicaban a los seis idiomas, así que en italiano no
 * servían para nada —sus plurales no acaban en -s— y en alemán casi tampoco.
 * Medido contra el catálogo: «mele», «carote», «patate», «cipolle»,
 * «fragole», «pomodori», «Kartoffeln», «Zwiebeln», «Karotten» y «Erdbeeren»
 * no casaban con nada, y salían rotulados «resultados aproximados» porque los
 * rescataba la red de erratas — o sea, la app le decía a alguien que había
 * escrito mal una palabra bien escrita. Y «limões» ni eso: está a dos
 * ediciones de «Limão», así que no salía de ninguna manera.
 *
 * Y LAS DIÉRESIS TRANSCRITAS, para el alemán. `normalize` borra diacríticos,
 * así que «Grüner» queda en `gruner`, pero quien no tiene tecla de umlaut no
 * escribe `gruner`: escribe `gruener`, que es la transcripción estándar. Sin
 * esto, «gruener tee», «suesswein» y «loewenzahntee» daban cero. Se hace aquí
 * y no dentro de `normalize` a propósito: transcribir el catálogo rompería
 * «Äpfel» → «Apfel», que hoy funciona precisamente porque los diacríticos se
 * borran en los dos lados.
 */
export interface Formas {
  /** la palabra tal como se tecleó: casa por subcadena, como siempre */
  subcadena: string;
  /** las derivadas: solo valen si son una PALABRA ENTERA del alimento */
  enteras: string[];
}

/**
 * Las reglas se aplican sobre la consulta YA NORMALIZADA: sin tildes, sin ß,
 * sin ligaduras. Por eso el portugués dice `oes$`→`ao` y no `ões$`→`ão`.
 */
const REGLAS: Record<Lang, [RegExp, string][]> = {
  es: [
    [/ces$/, 'z'],
    [/es$/, ''],
    [/s$/, ''],
  ],
  en: [
    [/ies$/, 'y'],
    [/([sxz]|ch|sh)es$/, '$1'],
    [/es$/, ''],
    [/s$/, ''],
  ],
  fr: [
    [/eaux$/, 'eau'],
    [/aux$/, 'al'],
    [/x$/, ''],
    [/s$/, ''],
  ],
  pt: [
    [/oes$/, 'ao'],
    [/aes$/, 'ao'],
    [/ais$/, 'al'],
    [/eis$/, 'el'],
    [/ois$/, 'ol'],
    [/ns$/, 'm'],
    [/es$/, ''],
    [/s$/, ''],
  ],
  it: [
    [/chi$/, 'co'],
    [/ghi$/, 'go'],
    [/ci$/, 'co'],
    [/gi$/, 'go'],
    [/i$/, 'o'],
    [/i$/, 'e'],
    [/i$/, 'a'],
    [/e$/, 'a'],
  ],
  de: [
    [/innen$/, 'in'],
    [/nen$/, 'ne'],
    [/en$/, ''],
    [/n$/, ''],
    [/er$/, ''],
    [/e$/, ''],
  ],
};

/**
 * Por debajo de esto una regla ya no singulariza: recorta. Cuatro es el plural
 * más corto que trae detrás un singular de verdad —«mele»→«mela»,
 * «ajos»→«ajo»—, y lo que sujeta lo demás es que la forma derivada tiene que
 * medir tres letras y casar desde el PRINCIPIO de una palabra del alimento,
 * nunca como un trozo suelto.
 */
const MINIMO = 4;

/** `ue`→`u`, `oe`→`o`, `ae`→`a`: el alemán escrito sin tecla de umlaut. */
function sinTranscribir(palabra: string): string {
  return palabra.replace(/ue/g, 'u').replace(/oe/g, 'o').replace(/ae/g, 'a');
}

// Las formas de una palabra no dependen del alimento, y `matchesFood` corre
// una vez por cada uno de los 1.843: sin esta caché, cada tecla rehacía las
// mismas seis expresiones regulares mil ochocientas veces. Se vacía sola
// cuando crece: son consultas, no un índice.
const FORMAS = new Map<string, Formas>();

export function formasDe(palabra: string, lang: Lang): Formas {
  const clave = `${lang}|${palabra}`;
  const hecho = FORMAS.get(clave);
  if (hecho) return hecho;
  const salida = calcularFormas(palabra, lang);
  if (FORMAS.size > 500) FORMAS.clear();
  FORMAS.set(clave, salida);
  return salida;
}

function calcularFormas(palabra: string, lang: Lang): Formas {
  const enteras: string[] = [];
  const anotar = (forma: string) => {
    if (forma.length >= 3 && forma !== palabra && !enteras.includes(forma)) enteras.push(forma);
  };
  if (palabra.length >= MINIMO) {
    // Las bases: lo tecleado y —en alemán— lo tecleado con las diéresis
    // deshechas. Las reglas de plural corren sobre las dos, que «Aepfel» es
    // las dos cosas a la vez.
    const bases = [palabra];
    if (lang === 'de') {
      const llano = sinTranscribir(palabra);
      if (llano !== palabra) {
        anotar(llano);
        bases.push(llano);
      }
    }
    for (const base of bases) {
      for (const [re, con] of REGLAS[lang]) {
        if (!re.test(base)) continue;
        anotar(base.replace(re, con));
      }
    }
  }
  return { subcadena: palabra, enteras };
}

/**
 * A partir de cuántas letras una forma derivada vale también como PRINCIPIO de
 * una palabra del alimento, y no solo como la palabra entera.
 *
 * Medido contra el catálogo, exigir la palabra entera perdía dos cosas que la
 * regla vieja —peor en todo lo demás— sí encontraba:
 *
 *  · EL FEMENINO PLURAL FRANCÉS Y PORTUGUÉS. «tomates seches» tiene que
 *    encontrar «Tomates séchées», y «sechees» no es «seche». Con la palabra
 *    entera, once alimentos secos dejaban de salir por «seches».
 *  · LOS COMPUESTOS ALEMANES, que son cómo se nombra la comida en ese idioma:
 *    quien teclea «Kartoffeln» quiere también el Kartoffelsalat.
 *
 * Cinco letras y no menos: «mele»→«mela» son cuatro, y por principio de
 * palabra se llevaría la melanzana y la melagrana, que es justo el ruido que
 * la palabra entera vino a cortar.
 */
const LARGA = 5;

const empieza = (suya: string, forma: string) =>
  suya === forma || (forma.length >= LARGA && suya.startsWith(forma));

/** ¿Coincide el alimento con la consulta ya normalizada? (nombre local, inglés o alias) */
export function matchesFood(f: Food, q: string, lang: Lang): boolean {
  // POR PALABRAS, no por subcadena contigua. Exigir la consulta entera seguida
  // hacía que `salsa soja` devolviera CERO —el nombre es «Salsa de soja»— y
  // con 284 nombres con paréntesis en español, `lentejas cocidas` tampoco
  // encontraba «Lentejas (cocidas en casa)»: entre las dos palabras hay un
  // «(de». Cada palabra tecleada tiene que estar en ALGUNO de los textos del
  // alimento (nombre local, inglés o un alias), y con una sola palabra esto es
  // exactamente lo de antes.
  const { textos, palabras } = textosDe(f, lang);
  return q.split(' ').every((p) => {
    const { subcadena, enteras } = formasDe(p, lang);
    if (textos.some((texto) => texto.includes(subcadena))) return true;
    // LAS DERIVADAS, DESDE EL PRINCIPIO DE UNA PALABRA. Por subcadena suelta,
    // «mele»→«mel» pescaría el melón, la melaza y el caramelo, y la regla
    // italiana de `i$`→`o` convertiría medio catálogo en ruido.
    return enteras.some((forma) => palabras.some((ps) => ps.some((suya) => empieza(suya, forma))));
  });
}

/**
 * ¿Están a una errata de distancia? Levenshtein ≤ 1, sin construir la matriz.
 *
 * Con distancia 1 solo hay tres casos —una letra cambiada, una de más, una de
 * menos— y se comprueban en un paseo. Es la RED DE SEGURIDAD del buscador, no
 * su camino: solo se consulta cuando lo exacto dio cero, así que «platno»
 * encuentra el plátano y «aguakate» el aguacate sin que ninguna búsqueda
 * normal pague el coste.
 */
export function casiIgual(a: string, b: string): boolean {
  if (a === b) return true;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  if (la === lb) {
    let difs = 0;
    for (let i = 0; i < la; i++) if (a[i] !== b[i]) difs++;
    return difs === 1;
  }
  const corta = la < lb ? a : b;
  const larga = la < lb ? b : a;
  let i = 0;
  let j = 0;
  let saltos = 0;
  while (i < corta.length && j < larga.length) {
    if (corta[i] === larga[j]) {
      i++;
      j++;
    } else {
      if (++saltos > 1) return false;
      j++;
    }
  }
  return true;
}

/**
 * Como `matchesFood`, pero admitiendo UNA errata por palabra tecleada.
 *
 * Cada palabra de la consulta tiene que estar a ≤1 de edición de alguna
 * palabra de los textos del alimento. Solo las palabras con cuerpo (≥4) pasan
 * por la red: con tres letras, una errata convierte «sal» en media lista.
 *
 * EL UMBRAL DECIDE CÓMO SE COMPARA ESA PALABRA, NO SI SE COMPARA LA CONSULTA
 * ENTERA. Estaba dentro del `every`, así que una sola palabra corta devolvía
 * `false` para todos los alimentos: «pan intgral», «te vrde», «sal marna» y
 * «ajo negr» no podían rescatarse nunca, que es exactamente el caso para el
 * que existe la red. Las cortas se siguen exigiendo exactas.
 */
export function matchesFoodConErratas(f: Food, q: string, lang: Lang): boolean {
  const { textos, palabras } = textosDe(f, lang);
  return q
    .split(' ')
    .every((palabra) =>
      palabra.length >= 4
        ? palabras.some((ps) => ps.some((suya) => casiIgual(palabra, suya)))
        : textos.some((texto) => texto.includes(palabra))
    );
}

/**
 * Cuánto de bien casa el alimento con la consulta. Primero por el NOMBRE EN
 * EL IDIOMA DE LA APP: 0 exacto, 1 la consulta es la CABEZA del nombre —sus
 * palabras, enteras y seguidas, donde el idioma pone el sustantivo: delante
 * en español, francés, italiano y portugués («Leche de vaca»), al final en
 * inglés y alemán («Cow's milk», «Glutenfreies Brot»)—, 2 en alemán, la
 * cabeza pegada al final de una palabra compuesta («Kuhmilch»), 3 cada
 * palabra de la consulta es una palabra entera del nombre («Bollo de leche»),
 * 4 el nombre empieza por ella a medias de una palabra («Laitue» por «lait»),
 * 5 una de sus palabras empieza por ella. Después por el resto de textos —el
 * nombre inglés y los alias—: 6 exacto o empieza, 7 una palabra empieza. Y al
 * final las erratas, que solo cuentan cuando la lista viene de
 * `matchesFoodConErratas`: 8 el nombre entero a una letra, 9 una de sus
 * palabras. 10 es «solo lo contiene». A igual rango decide la pantalla, con
 * el orden del catálogo.
 *
 * Es la clasificación por cestas de `searchFoods`, extraída como número para
 * poder usarla de comparador. Existía allí con su historia («sal» no
 * encontraba la sal) y la pantalla principal no la usaba: ordenaba
 * alfabéticamente, así que buscar «sal» enterraba «Sal» detrás de las
 * aceitunas en salmuera y el bacalao salado — 101 nombres en español
 * contienen esas tres letras.
 *
 * EL NOMBRE PROPIO MANDA SOBRE LOS ALIAS, y no era así: un alias que empezaba
 * por la consulta puntuaba igual que el nombre, y el alfabeto decidía. «ceb»
 * ponía Calçots —alias «cebolla tierna»— delante de Cebada y Cebolla; «leche»
 * ponía Bebida de almendra —alias «leche de almendras»— delante de Leche
 * entera; «jam» en inglés ponía Ham —alias «jamón»— delante de Jam. La persona
 * teclea el nombre que ve en pantalla, y ese es el que tiene que salir arriba.
 * Y en la red de erratas, «aguakate» ponía Aceite de aguacate delante de
 * Aguacate por la misma razón.
 *
 * Y LA PALABRA ENTERA MANDA SOBRE EL TROZO DE PALABRA: «lait» en francés
 * ponía tres lechugas —Laitue, Laitue romaine, Laitue iceberg— delante de
 * Lait de vache. Quien teclea una palabra completa está pidiendo esa palabra,
 * no las que empiezan igual. Y LA CABEZA SOBRE EL RESTO: con «palabra entera
 * en cualquier sitio» y el catálogo de desempate, «queso» abría con Raviolis
 * rellenos de queso y «huevo» con Fideos al huevo, porque los cereales van
 * antes que los lácteos y los huevos en el catálogo. El sustantivo que la
 * persona teclea tiene que ser el sustantivo del plato, no un ingrediente.
 *
 * LA CABEZA SE MIRA ANTES DEL PARÉNTESIS (`cabeza` del índice): con la
 * última palabra del nombre entero, «spring onion» ponía Calçots (grilled
 * spring onions) delante de Spring onion (green tops), y «leek» dejaba Leek
 * (white bulb) empatado con Leek and potato soup. Y EL COMPUESTO ALEMÁN VA
 * DETRÁS DE LA PALABRA ENTERA, no a su altura: como cabeza de pleno derecho,
 * «wein» abría con Wildschwein y «lauch» con Knoblauch.
 */
const CABEZA_AL_FINAL: ReadonlySet<Lang> = new Set(['en', 'de']);
// En esos dos idiomas, un nombre con conjunción no termina en su cabeza: «Rice
// with tomato sauce and egg» acababa en «egg» y salía delante de «Eggs», y
// «Boxed macaroni and cheese» delante de «Cheddar cheese».
const CONJUNCIONES: ReadonlySet<string> = new Set(['and', 'with', 'in', 'of', 'und', 'mit', 'im', 'auf', 'aus']);

/**
 * La palabra del alimento ES la tecleada: igual, o una forma que las reglas
 * de plural de `formasDe` reducen a ella («Huevos» y «huevo», «Œufs» y
 * «oeuf», «Uova» y «uovo»). Las mismas reglas que ya usa `matchesFood`, en
 * el otro sentido.
 */
const mismaPalabra = (suya: string | undefined, p: string, lang: Lang) =>
  suya !== undefined && (suya === p || formasDe(suya, lang).enteras.includes(p));

export function rankFood(f: Food, q: string, lang: Lang): number {
  const { textos, palabras, cabeza } = textosDe(f, lang);
  const nombre = textos[0];
  const suyas = palabras[0];
  if (nombre === q) return 0;
  const qs = q.split(' ');
  const alFinal = CABEZA_AL_FINAL.has(lang);
  const desde = alFinal ? cabeza.length - qs.length : 0;
  if (desde >= 0 && !(alFinal && cabeza.some((w) => CONJUNCIONES.has(w)))) {
    if (qs.every((p, k) => mismaPalabra(cabeza[desde + k], p, lang))) return 1;
    // EL ALEMÁN PEGA LA CABEZA AL FINAL DE LA PALABRA: «Kuhmilch»,
    // «Weizenbrot», «Hafermilch». Sin esto, «milch» dejaba la Kuhmilch en
    // «solo lo contiene», detrás de treinta filas. Cuatro letras y no menos,
    // que «ei» está al final de media despensa; y un rango por debajo de la
    // palabra entera, que «schwein» también termina en «wein». Entre
    // compuestos, el nombre más corto primero —Rotwein antes que Wildschwein,
    // Kuhmilch antes que Hafermilch—: sin diccionario no hay forma de saber
    // dónde parte la palabra, y el alimento básico es el del nombre corto.
    const ultima = qs[qs.length - 1];
    if (
      lang === 'de' &&
      ultima.length >= 4 &&
      cabeza[cabeza.length - 1]?.endsWith(ultima) &&
      qs.slice(0, -1).every((p, k) => mismaPalabra(cabeza[desde + k], p, lang))
    ) {
      return 2 + Math.min(nombre.length, 40) / 100;
    }
  }
  if (qs.every((p) => suyas.some((suya) => mismaPalabra(suya, p, lang)))) return 3;
  if (nombre.startsWith(q)) return 4;
  if (suyas.some((palabra) => palabra.startsWith(q))) return 5;
  if (textos.some((tx) => tx.startsWith(q))) return 6;
  if (palabras.some((ps) => ps.some((palabra) => palabra.startsWith(q)))) return 7;
  if (casiIgual(nombre, q)) return 8;
  if (suyas.some((palabra) => casiIgual(palabra, q))) return 9;
  return 10;
}

/**
 * Búsqueda corta para autocompletar: primero el nombre exacto, luego los
 * prefijos, luego el resto.
 *
 * LO EXACTO VA DELANTE, y no es un refinamiento. Antes había dos cestas
 * —prefijo y resto— y con el límite de cinco de la app, escribir «sal» NO
 * encontraba la sal: «salchicha», «salmón», «salsa de soja», «salvado» y
 * «salvia» empiezan igual, llenaban las cinco plazas y el bucle cortaba ahí.
 * Y cortaba del todo, así que ni llegaba a la cesta de «contiene». Lo cazó el
 * test de cobertura de búsqueda al probar los 490 en los seis idiomas contra
 * el límite DE VERDAD: fallaban dos, «Sal» en español y en portugués, que son
 * de los alimentos más básicos que hay.
 *
 * El corte también se mueve: se para cuando hay `limit` EXACTOS, no cuando hay
 * `limit` prefijos. Con la cesta exacta llena no queda nada mejor por
 * encontrar; con la de prefijos llena, sí.
 */
export function searchFoods(query: string, lang: Lang, limit = 5): Food[] {
  const q = normalize(query.trim());
  if (q.length === 0) return [];
  // Se toca el índice una vez y se lee de él en el bucle: sin esto, cada
  // alimento reconstruía y renormalizaba sus tres o cuatro textos.
  const textos = indice(lang);
  const exactos: Food[] = [];
  // Y DENTRO DE CADA CESTA, LA PALABRA ENTERA ANTES QUE EL TROZO. Con «cabra»
  // salían primero el «Cabracho» y el queso de Cabrales —los dos empiezan por
  // esas cinco letras— y el queso, la leche y el yogur de cabra quedaban detrás;
  // con el límite de cinco, la carne de cabra se caía de la lista. Ninguno de
  // los dos intrusos es lo que nadie busca escribiendo «cabra»: la palabra sigue
  // dentro de otra palabra.
  const empiezaPalabra: Food[] = [];
  const empiezaTrozo: Food[] = [];
  const llevaPalabra: Food[] = [];
  const llevaTrozo: Food[] = [];
  // El siguiente carácter cierra palabra: fin de cadena, espacio o paréntesis.
  const cierra = (s: string, i: number) => i >= s.length || !/[a-z0-9]/.test(s[i]);
  for (const f of allFoods) {
    if (!matchesFood(f, q, lang)) continue;
    const nombre = textos.get(f.id)!.nombre;
    if (nombre === q) exactos.push(f);
    else if (nombre.startsWith(q)) (cierra(nombre, q.length) ? empiezaPalabra : empiezaTrozo).push(f);
    else {
      const i = nombre.indexOf(q);
      const entera = i > 0 && cierra(nombre, i - 1) && cierra(nombre, i + q.length);
      // Un SINÓNIMO que es la consulta entera vale tanto como una palabra del
      // nombre. El cabrito se llama «Cabrito» y solo casa con «cabra» por su
      // sinónimo, así que caía a la última cesta y con el límite de cinco se
      // quedaba fuera detrás de tres lácteos de cabra y del cabracho.
      const porSinonimo = textos.get(f.id)!.alias.some((a2) => {
        const j = a2.indexOf(q);
        return j === 0 ? cierra(a2, q.length) : j > 0 && cierra(a2, j - 1) && cierra(a2, j + q.length);
      });
      (entera || porSinonimo ? llevaPalabra : llevaTrozo).push(f);
    }
    if (exactos.length >= limit) break;
  }
  return [...exactos, ...empiezaPalabra, ...llevaPalabra, ...empiezaTrozo, ...llevaTrozo].slice(
    0,
    limit
  );
}
