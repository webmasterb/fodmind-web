import { Lang } from '@/data/types';

// Encontrar la LISTA DE INGREDIENTES dentro de todo lo que hay escrito en un
// envase.
//
// POR QUÉ HACE FALTA. Una foto del dorso no captura «los ingredientes»:
// captura TODO. Medido sobre un bote corriente, veintidós líneas y setecientos
// caracteres, de los cuales la lista son dos. Lo demás es el nombre del
// producto, el peso neto, la tabla nutricional, el lote, la caducidad, cómo
// conservarlo, el fabricante y la web. Pasado en crudo al motor, la cabecera
// diría «38 no reconocidos» y la función parecería rota.
//
// Y HAY ALGO PEOR QUE EL RUIDO. «Puede contener trazas de apio y mostaza» no es
// una lista de ingredientes: es lo contrario, un aviso sobre lo que el producto
// NO lleva de fábrica. Sin cortar ahí, el apio entra en el análisis y salta una
// alarma por algo que no está en el producto. La tabla nutricional hace lo
// mismo con «Sal 0,85 g».
//
// ES UNA FUNCIÓN PURA Y ESO ES DELIBERADO: se prueba con etiquetas pegadas como
// texto, sin cámara, sin módulo nativo y sin compilar. Cuando exista el
// reconocimiento de texto, esta pieza ya estará verificada.

/** Los encabezados que abren la lista, por idioma. */
const ENCABEZADOS: { forma: string; lang: Lang }[] = [
  { forma: 'ingredientes', lang: 'es' },
  { forma: 'lista de ingredientes', lang: 'es' },
  { forma: 'ingredients', lang: 'en' },
  { forma: 'ingredient list', lang: 'en' },
  { forma: 'ingredients list', lang: 'en' },
  { forma: 'ingredients', lang: 'fr' },
  { forma: 'liste des ingredients', lang: 'fr' },
  { forma: 'zutaten', lang: 'de' },
  { forma: 'zutatenliste', lang: 'de' },
  { forma: 'ingredienti', lang: 'it' },
  { forma: 'elenco ingredienti', lang: 'it' },
  // «INGREDIENTES» ABRE LISTA EN ESPAÑOL Y EN PORTUGUÉS, y por eso el portugués
  // no estaba: parecía cubierto por la entrada española. No lo estaba. El
  // desempate por idioma de más abajo no tenía nada que encontrar con
  // `preferido = 'pt'`, así que en un envase ibérico —que repite la lista en los
  // dos— al usuario portugués se le devolvía el bloque ESPAÑOL, y debajo
  // `labelCroppedMulti` le decía que se había usado el suyo. Y el texto se le
  // enseña para que compruebe si la app leyó bien: en un idioma que no habla,
  // esa comprobación no existe.
  { forma: 'ingredientes', lang: 'pt' },
  { forma: 'lista de ingredientes', lang: 'pt' },
];

/**
 * Lo que cierra la lista.
 *
 * Los dos primeros grupos son los que de verdad importan: las trazas, porque
 * añaden alimentos que el producto NO lleva, y la tabla nutricional, porque
 * repite palabras («sal», «azúcares») que ya no son ingredientes.
 */
/**
 * Los avisos de trazas, aparte del resto de terminadores.
 *
 * VAN SEPARADOS PARA PODER DECIRLO. Cortar aquí es obligatorio —un «puede
 * contener leche» metía lactosa en un producto que no la lleva— pero cortarlo y
 * callarse deja al usuario creyendo que la app vio la etiqueta entera. Ahora la
 * pantalla dice que el envase avisa de posibles trazas y que están fuera del
 * análisis porque no son ingredientes.
 *
 * La lista es ESTRECHA a propósito: solo las formas que de verdad significan
 * «podría haber, sin ser ingrediente». «Contiene gluten» y «azúcares
 * naturalmente presentes» también cortan, pero afirman lo contrario —que el
 * producto SÍ lo lleva— y anunciarlas como trazas sería mentir en la única
 * frase que existe para no hacerlo. Se quedan en el grupo de abajo.
 */
const TRAZAS = [
  'puede contener', 'pueden contener', 'puede haber', 'trazas de',
  'may contain', 'may also contain', 'traces of', 'produced in a factory',
  'peut contenir', 'traces de', 'fabrique dans un atelier',
  'kann spuren', 'kann enthalten', 'hergestellt in einem betrieb',
  'puo contenere', 'tracce di', 'prodotto in uno stabilimento',
  'pode conter', 'vestigios de', 'podera conter',
  'traces eventuelles', 'peuvent contenir', 'presence eventuelle',
  'puo contenere tracce', 'tracce eventuali',
  'kann spuren von', 'spuren von', 'kann andere', 'enthalt spuren',
  'trazas eventuales', 'elaborado en una linea', 'elaborado en instalaciones',
  'fabricado en una linea', 'may be present',
  'alergenos', 'allergens', 'allergenes', 'allergene', 'allergeni',
  'contiene alergenos', 'contiene trazas',
  'informacion de alergenos', 'declaracion de alergenos',
];

const TERMINADORES = [
  // avisos de trazas y alérgenos — la lista de arriba, entera
  ...TRAZAS,
  'not suitable for',
  // «contient alcool» salía 12 veces en el banco de 342 y no es un ingrediente:
  // es la advertencia legal que va DESPUÉS de la lista.
  'contient alcool', 'contiene alcohol', 'contains alcohol',
  // El OCR se come el arranque del aviso de trazas antes que nada: medido
  // sobre la foto real de un pan de Hacendado, «puede contener trazas de» salio
  // como «sola y mostaza» y sin encabezado que cortar. Estos son los trozos que
  // SI sobreviven, porque van en frase y con mayuscula inicial.
  'contiene azucares', 'contiene gluten',
  'contem acucares', 'contem gluten', 'contains milk', 'contains gluten',
  // «de la leche» a secas NO, aunque cortaria el caso del pan: «solidos de la
  // leche» es un ingrediente de verdad y se perderia la lista entera detras.
  'azucares de la leche', 'azucares naturalmente presentes', 'naturalmente presentes',
  'acucares do leite',
  // Y los sellos y avisos que cierran la lista en un envase europeo.
  'sin gluten certificado',
  'apto para veganos', 'apto para vegetarianos', 'agitar antes', 'modo de empleo',
  'modo de preparacion', 'instrucciones de uso', 'ver frontal', 'ver frente',
  // Los portugueses, que faltaban: sin encabezado `pt` no se llegaba a mirar un
  // bloque portugués, y con encabezado la lista seguía hasta el final del envase.
  'modo de preparacao', 'modo de emprego', 'depois de aberto', 'conservar em local',
  'peso liquido', 'validade', 'consumir de preferencia antes', 'fabricado em',
  // tabla nutricional
  'informacion nutricional', 'valores nutricionales', 'valor energetico',
  'nutrition', 'nutritional information', 'nutrition facts', 'typical values',
  'energy', 'valeurs nutritionnelles', 'valeur energetique', 'nahrwerte',
  'nahrwertangaben', 'brennwert', 'valori nutrizionali', 'valore energetico',
  'informacao nutricional', 'por 100 g', 'per 100 g', 'pour 100 g', 'je 100 g',
  // caducidad, lote, conservación y fabricante
  'consumir preferentemente', 'consumir antes', 'fecha de caducidad',
  'best before', 'use by', 'a consommer', 'mindestens haltbar', 'da consumarsi',
  'consumir de preferencia', 'conservar en', 'conservese en', 'una vez abierto',
  'store in', 'keep refrigerated', 'once opened', 'a conserver', 'conservare',
  'nach dem offnen', 'kuhl und trocken', 'peso neto', 'net weight', 'poids net',
  'nettogewicht', 'peso netto', 'elaborado por', 'elaborado en', 'fabricado por',
  'produced by', 'manufactured', 'fabrique par', 'hergestellt von', 'prodotto da',
  'distribuido por', 'www.', 'lote', 'batch', 'charge',
];

export interface Recorte {
  /** el texto de la lista, ya sin encabezado ni cola */
  texto: string;
  /** el idioma del encabezado que lo abrió, si se pudo saber */
  lang: Lang | null;
  /** cuántos bloques se encontraron: más de uno = envase multiidioma */
  bloques: number;
  /** false si no se encontró ningún encabezado y se devuelve el texto entero */
  recortado: boolean;
  /**
   * El envase avisa de posibles trazas, y ese aviso se ha dejado fuera.
   *
   * SE DEVUELVE PARA PODER DECIRLO. Cortarlo es obligatorio —un «puede contener
   * leche» metía lactosa en un producto que no la lleva— pero cortarlo en
   * silencio deja a alguien creyendo que la app leyó la etiqueta entera, y con
   * los FODMAP eso importa: el ajo y la cebolla de una línea compartida no
   * aparecen por ningún lado.
   */
  trazas: boolean;
}

interface Bloque {
  texto: string;
  lang: Lang;
  desde: number;
}

/**
 * Palabras que delatan en qué idioma está escrita una lista.
 *
 * EXISTEN PORQUE HAY ENCABEZADOS QUE NO DISTINGUEN NADA. «Ingredientes» abre
 * lista en español y en portugués, y «ingredients» en inglés y en francés: con
 * el encabezado solo, un bloque portugués se etiquetaba `es` —el primero de la
 * tabla— y el desempate por idioma de más abajo no tenía nada que encontrar. En
 * un envase ibérico, que repite la lista en los dos, al usuario portugués se le
 * devolvía el bloque español y la pantalla le decía encima que había usado el
 * suyo. Y el texto se le enseña justo para que compruebe si la app leyó bien:
 * en un idioma que no habla, esa comprobación no existe.
 *
 * Son las palabras corrientes de una lista que NO se escriben igual en las dos
 * lenguas del par. Se cuentan solo sobre el ARRANQUE del bloque (ver abajo) y
 * solo deciden empates: nunca inventan un idioma que el encabezado no ofrezca.
 */
const DELATORAS: Partial<Record<Lang, string[]>> = {
  es: ['harina', 'azucar', 'leche', 'aceite', 'huevo', 'huevos', 'mantequilla', 'levadura'],
  pt: ['farinha', 'acucar', 'leite', 'oleo', 'ovo', 'ovos', 'manteiga', 'levedura'],
  en: ['flour', 'sugar', 'milk', 'water', 'wheat', 'egg', 'eggs', 'butter'],
  fr: ['farine', 'sucre', 'lait', 'eau', 'oeuf', 'oeufs', 'beurre'],
};

/**
 * Cuántas palabras de ese idioma hay en el arranque de una lista.
 *
 * SOLO EL ARRANQUE, Y ESA ES LA CLAVE. Un bloque llega hasta su terminador, y en
 * un envase ES+PT el encabezado portugués no es un terminador: el bloque español
 * se tragaba entero al portugués, así que contar sobre el bloque completo daba
 * empate siempre. El idioma de una lista lo decide por dónde empieza.
 */
function delata(planoDelBloque: string, lang: Lang): number {
  // Por PALABRAS ENTERAS y no por `includes`: «ble» vive dentro de «vegetable»
  // y «ovo» dentro de un apellido. Se parte y se compara, que además no arrastra
  // ningún escapado.
  const palabras = new Set(planoDelBloque.slice(0, 80).split(/[^\p{L}]+/u).filter(Boolean));
  return (DELATORAS[lang] ?? []).filter((w) => palabras.has(w)).length;
}

/**
 * Busca las apariciones de una aguja en un pajar ya normalizado, y devuelve las
 * posiciones EN EL TEXTO ORIGINAL.
 *
 * Se busca sobre el normalizado —sin tildes, con los guiones igualados— porque
 * un OCR escribe «INGRÉDIENTS» o «Ingredientes:» indistintamente. Y se
 * devuelven posiciones del original porque lo que hay que recortar es el
 * original: el usuario tiene que reconocer lo que leyó en el envase.
 *
 * Vale porque `normalizarEtiqueta` no cambia la longitud salvo al colapsar
 * espacios, y por eso el recorte trabaja sobre un normalizado SIN colapsar.
 */
function normalizarConservandoLongitud(s: string): string {
  // Carácter a carácter, y NO con `.normalize('NFD')` sobre la cadena entera:
  // NFD parte «ä» en dos, así que cada tilde desplazaba una posición y el
  // recorte salía corrido. El síntoma era «Tomato» devuelto como «omato» y
  // «Nährwerte» sin reconocerse como final de la lista. Aquí cada carácter se
  // mapea a exactamente uno, y si no tiene equivalente simple se deja igual.
  return [...s]
    .map((c) => {
      // Ni siquiera minusculizar es seguro carácter a carácter: la «İ» turca
      // baja a dos code points. Cualquier expansión se descarta y se deja el
      // original, porque medir bien importa más que minusculizar bien.
      const bajo = c.toLowerCase();
      const uno = bajo.length === 1 ? bajo : c;
      if (/[-‐-―‘’ʼ'`´]/.test(uno)) return ' ';
      const base = uno.normalize('NFD').replace(/[̀-ͯ]/g, '');
      return base.length === 1 ? base : uno;
    })
    .join('');
}

/**
 * Cuánto puede medir un paréntesis para seguir siendo un inciso.
 *
 * Un «(contiene gluten)» son veinte caracteres. Se pone tope porque el OCR se
 * come paréntesis de cierre a menudo, y sin tope un «(» perdido anularía todos
 * los terminadores que vinieran detrás — o sea, se tragaría la tabla
 * nutricional entera como si fuera lista de ingredientes.
 */
const MAX_INCISO = 120;

/**
 * Los tramos entre paréntesis, que son incisos y no el final de nada.
 *
 * Solo cuentan los que CIERRAN y son cortos. Uno sin cerrar no marca nada.
 */
function incisos(plano: string): [number, number][] {
  const fuera: [number, number][] = [];
  for (let i = 0; i < plano.length; i++) {
    if (plano[i] !== '(') continue;
    const cierra = plano.indexOf(')', i + 1);
    if (cierra !== -1 && cierra - i <= MAX_INCISO) fuera.push([i, cierra]);
  }
  return fuera;
}

/**
 * Encuentra el primer terminador a partir de una posición.
 *
 * NO CUENTAN LOS QUE VAN ENTRE PARÉNTESIS, y esto no es un detalle: era un
 * falso negativo, que en esta app es el fallo que puede hacer daño.
 *
 * El etiquetado europeo obliga a destacar los alérgenos DENTRO de la lista, y
 * la forma normal de hacerlo en español es un inciso: «harina de trigo
 * (contiene gluten), agua, cebolla deshidratada, sal». Como «contiene gluten»
 * está en la lista de terminadores —y tiene que estarlo, porque también aparece
 * suelto al final—, se cortaba ahí. El recorte quedaba en «harina de trigo (» y
 * la CEBOLLA desaparecía sin dejar rastro.
 *
 * El resultado es lo grave: la pantalla decía «ningún FODMAP alto entre lo que
 * conozco» de un producto con cebolla. Un falso positivo enseña a desconfiar de
 * la app; un falso negativo manda a alguien a comerse justo lo que evitaba.
 *
 * Un aviso de verdad —«Sal 0,85 g», «Puede contener trazas de apio»— nunca va
 * dentro de un paréntesis de la lista, así que la regla no le quita nada.
 */
function primerTerminador(plano: string, desde: number): { corte: number; trazas: boolean } {
  const dentro = incisos(plano);
  const esInciso = (i: number) => dentro.some(([a, b]) => i > a && i < b);
  const primero = (t: string) => {
    let i = plano.indexOf(t, desde);
    while (i !== -1 && esInciso(i)) i = plano.indexOf(t, i + 1);
    return i;
  };
  let corte = plano.length;
  for (const t of TERMINADORES) {
    const i = primero(t);
    if (i !== -1 && i < corte) corte = i;
  }
  // Y SI LO QUE SE DEJA FUERA ES UN AVISO DE TRAZAS, SE DICE. Basta con que
  // aparezca en algún sitio a partir de aquí: el corte es el mínimo sobre TODOS
  // los terminadores, así que cualquier forma de trazas cae en el corte o
  // después, o sea siempre fuera de lo que se devuelve.
  const trazas = TRAZAS.some((t) => primero(t) !== -1);
  return { corte, trazas };
}

/**
 * Saca la lista de ingredientes del texto de un envase.
 *
 * Si hay varios bloques —los envases europeos repiten la lista en cuatro o
 * cinco idiomas— se queda con el del idioma que se le pida. No porque el
 * análisis lo necesite (el diccionario es políglota y da igual leer la lista en
 * alemán) sino porque el TEXTO SE LE ENSEÑA AL USUARIO: devolverle un párrafo
 * en un idioma que no habla le impide comprobar si la app leyó bien, que es la
 * única defensa contra un fallo de reconocimiento.
 *
 * Si no encuentra encabezado devuelve el texto entero y lo dice. Eso es lo
 * correcto cuando alguien pega solo la lista, que es el caso normal a mano.
 */
export function recortarIngredientes(texto: string, preferido?: Lang): Recorte {
  const plano = normalizarConservandoLongitud(texto);

  /**
   * Dónde empieza cada encabezado que además CIERRA el bloque de antes, para
   * que un bloque no se coma el siguiente. No son todos los encabezados: ver
   * la condición de puntuación de abajo.
   */
  const arranques: number[] = [];
  const candidatos: { forma: string; lang: Lang; i: number; desde: number }[] = [];
  for (const { forma, lang } of ENCABEZADOS) {
    let desde = 0;
    for (;;) {
      const i = plano.indexOf(forma, desde);
      if (i === -1) break;
      desde = i + forma.length;

      // Tiene que ser palabra: «ingredientes» dentro de otra palabra no abre
      // nada, y sin esto «ingredients» encontraba el «ingredient» de una frase.
      const antes = plano[i - 1];
      if (antes && /[\p{L}\p{N}]/u.test(antes)) continue;
      candidatos.push({ forma, lang, i, desde });
      // SOLO CORTA EL QUE LLEVA DOS PUNTOS —o un guion, o un salto de linea—,
      // que es como se escribe un encabezado en un envase. Sin esta condicion,
      // «ingredientes» dentro de su propia lista («harina de trigo, ingredientes
      // lacteos, sal») contaba como el arranque del bloque siguiente y amputaba
      // la lista ahi mismo: quedaba «harina de trigo,» y los tres ingredientes
      // que faltaban no se le ensenaban a nadie. En una app que existe para
      // decir lo que lleva un envase, una lista recortada es peor que ninguna.
      // Un encabezado sin puntuacion detras sigue abriendo bloque; lo unico que
      // no hace es cerrar el de antes, que es como funcionaba hasta ahora.
      if (/^[ \t]*[:\-–—\r\n]/.test(texto.slice(desde)) && !arranques.includes(i)) {
        arranques.push(i);
      }
    }
  }
  arranques.sort((a, b) => a - b);

  const bloques: Bloque[] = [];
  for (const { lang, i, desde } of candidatos) {
    // Detrás del encabezado va un separador —dos puntos, un salto— o el propio
    // contenido.
    const resto = texto.slice(desde).replace(/^[\s:.\-–—]+/, '');
    const consumido = texto.slice(desde).length - resto.length;
    const inicio = desde + consumido;
    const { corte } = primerTerminador(plano, inicio);
    // UNA LISTA TERMINA TAMBIÉN DONDE EMPIEZA LA SIGUIENTE. El encabezado de otro
    // idioma no es un terminador, así que en un envase ES+PT el bloque español
    // se tragaba entero al portugués: el texto que se le enseñaba al usuario
    // llevaba la lista repetida en dos idiomas, y el idioma de cada bloque no
    // había forma de distinguirlo porque los dos contenían las dos.
    const siguiente = arranques.find((a) => a > i) ?? texto.length;
    const fin = Math.min(corte, siguiente);
    const contenido = texto.slice(inicio, fin).trim();
    if (contenido.length < 8) continue;
    bloques.push({ texto: contenido, lang, desde: i });
  }

  if (bloques.length === 0) {
    // SIN ENCABEZADO SIGUE HABIENDO QUE CORTAR EL AVISO DE TRAZAS, y esto era
    // un agujero de verdad: los terminadores solo se aplicaban dentro de un
    // bloque abierto por «Ingredientes:», y el texto que llega por CÓDIGO DE
    // BARRAS es la lista pelada, sin encabezado ninguno. Medido sobre las 342
    // etiquetas del banco: ni uno solo de los seis idiomas cortaba su aviso.
    //
    // Lo que se colaba no es ruido: son alimentos que el producto NO LLEVA. Un
    // postre vegetal que avisa «peut contenir des traces de lait» salía con
    // lactosa, que es exactamente el error que hace desinstalar la app.
    const { corte, trazas } = primerTerminador(plano, 0);
    if (corte < plano.length && corte >= 8) {
      return { texto: texto.slice(0, corte).trim(), lang: null, bloques: 0, recortado: true, trazas };
    }
    return { texto: texto.trim(), lang: null, bloques: 0, recortado: false, trazas };
  }

  // Dos encabezados distintos pueden apuntar al mismo sitio («ingredients» vale
  // para inglés y para francés): se ordena por posición y se queda el primero
  // de cada arranque.
  bloques.sort((a, b) => a.desde - b.desde || a.texto.length - b.texto.length);
  const unicos: Bloque[] = [];
  for (const b of bloques) {
    const i = unicos.findIndex((u) => u.desde === b.desde);
    if (i === -1) {
      unicos.push(b);
      continue;
    }
    // MISMO ARRANQUE, DOS IDIOMAS CON LA MISMA PALABRA: decide lo que está
    // escrito, no el orden de la tabla. Se quedaba el primero, y con un `sort`
    // estable el primero es siempre el que va antes en `ENCABEZADOS` —el
    // español—, así que una lista portuguesa salía marcada `es` y el desempate
    // por idioma del usuario no tenía nada que encontrar. Si ninguna de las dos
    // lenguas se delata, se queda la de antes: adivinar sería peor.
    const plano2 = normalizarConservandoLongitud(b.texto);
    if (delata(plano2, b.lang) > delata(normalizarConservandoLongitud(unicos[i].texto), unicos[i].lang)) {
      unicos[i] = b;
    }
  }

  const elegido = (preferido && unicos.find((b) => b.lang === preferido)) || unicos[0];
  return {
    texto: elegido.texto,
    lang: elegido.lang,
    bloques: unicos.length,
    recortado: true,
    // Se pregunta sobre el TEXTO ENTERO y no desde el bloque elegido: en un
    // envase multiidioma el aviso de trazas va detrás de una de las listas, y
    // sigue siendo el mismo envase el que avisa.
    trazas: primerTerminador(plano, 0).trazas,
  };
}

/**
 * Solo para los tests.
 *
 * `normalizarConservandoLongitud` se expone porque su contrato —que la salida
 * mida exactamente lo mismo que la entrada— es lo único que hace que las
 * posiciones del recorte sean correctas, y eso hay que poder comprobarlo.
 */
export const _interno = { normalizarConservandoLongitud, TERMINADORES, TRAZAS, ENCABEZADOS };
