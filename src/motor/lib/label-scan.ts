import { CORRIENTES, GrupoCorriente } from '@/data/common-ingredients';
import { allFoods, foodById } from '@/data/foods';
import { INGREDIENTES, Ingrediente, SeveridadIngrediente } from '@/data/ingredients';
import { PLATOS_FUERA_DEL_INDICE } from '@/data/platos-fuera-del-indice';
import { Food, FodmapType, Lang, LocalizedString } from '@/data/types';
import { normalize } from '@/lib/food-search';
import { recortarIngredientes } from '@/lib/label-crop';
import { nivelDerivado } from '@/lib/level-model';

// Lector de etiquetas: qué FODMAPs lleva una lista de ingredientes.
//
// Modelo puro —sin React, sin disco, sin cámara y sin red— igual que
// level-model.ts y safe-foods.ts. Recibe el texto de la etiqueta y devuelve
// hallazgos; quien lo llama decide cómo pintarlos.
//
// LO QUE ESTA FUNCIÓN NO HACE, Y ES DELIBERADO: no emite un veredicto del
// producto. No dice «apto» ni «no te lo comas». Dice qué ingredientes lleva,
// cuáles son FODMAP y por qué, cada uno con su fuente. Un veredicto global
// sobre un alimento concreto es justo la clase de afirmación médica por la que
// esta app ya se comió un rechazo (guideline 1.4.1), y además sería falso: la
// etiqueta no dice CUÁNTO lleva de cada cosa, y en FODMAP la dosis lo es todo.
//
// ── TRES CAPAS, Y GANA LA PRIMERA QUE CASA ────────────────────────────────
//
// Con solo el diccionario, medido sobre doce etiquetas reales en cuatro
// idiomas, el 61 % de los trozos salía como «no reconocido». Y no por FODMAPs
// que se escaparan: por la sal, el agua, el aceite de girasol y las vitaminas.
// El número que decide si esta pantalla sirve no es cuánto reconoce, sino
// cuánto le queda sin reconocer, porque de eso depende que «no reconocido»
// signifique algo en lugar de ser ruido.
//
//   1. EL DICCIONARIO DE INGREDIENTES manda siempre. Son los FODMAP escritos
//      como los escribe un fabricante, cada uno con su nota y su fuente.
//   2. LOS 411 ALIMENTOS de la app, que ya estaban ahí. Aportan su nivel, su
//      ficha y sus fuentes sin escribir un dato nuevo, y hacen que tocar
//      «tomate» abra su ficha.
//   3. LO CORRIENTE, que no es FODMAP y sale en toda etiqueta.
//
// El orden no es negociable: «manzana» dentro de «concentrado de zumo de
// manzana» tiene que seguir siendo el zumo, que es alto. Por eso el índice se
// ordena por longitud y, a igualdad, por capa.
//
// ── EL ORDEN DE BÚSQUEDA ES LA MITAD DE LA FUNCIÓN ────────────────────────
//
// Las formas se prueban de MÁS LARGA a MÁS CORTA y el tramo casado se
// enmascara, porque si no:
//   «trigo» casa dentro de «trigo sarraceno», que es sin gluten y bajo en FODMAP
//   «ajo» casa dentro de «ajonjolí»
//   «cebolla» casa dentro de «cebollino», que es la parte verde y es baja
//   «leche» casa dentro de «leche sin lactosa» y de «leche de almendras»
// Cada una de esas colisiones convierte un alimento seguro en una alarma, que
// es el fallo que más caro sale: enseña a desconfiar de la herramienta.

/** De dónde sale un hallazgo. Cambia lo que se puede enseñar de él. */
export type OrigenHallazgo = 'diccionario' | 'catalogo' | 'corriente';

export interface LabelFinding {
  /** clave estable: id del ingrediente, del alimento o del grupo corriente */
  id: string;
  origen: OrigenHallazgo;
  /** cómo se llama, en los seis idiomas */
  nombre: LocalizedString;
  /** qué FODMAP aporta. Vacío no significa seguro si el origen es «corriente». */
  fodmaps: FodmapType[];
  severidad: SeveridadIngrediente;
  /** solo el diccionario trae nota y fuente propias */
  ingrediente?: Ingrediente;
  /** la ficha del alimento, si la hay: del catálogo o del `foodId` del diccionario */
  food?: Food;
  /** el texto TAL CUAL aparecía en la etiqueta, para que el usuario se reconozca */
  textoEncontrado: string;
  /**
   * En qué lugar de la lista aparece, empezando por 0.
   *
   * No es decorativo: la ley obliga a listar los ingredientes en orden
   * decreciente de peso, así que la posición es el único dato de CANTIDAD que
   * una etiqueta da gratis. Un ajo el segundo no es un ajo detrás de la sal.
   */
  posicion: number;
  /**
   * Cómo casó la forma contra el texto. 'aproximada' = por subcadena dentro
   * de otra palabra (legítimo en alemán, arriesgado en OCR): es el único
   * casado donde la etiqueta NO escribe la forma tal cual, y por eso es el
   * único que se declara. Repegado de guion y singularización acaban casando
   * palabra entera y son 'exacta'. Obligatorio a propósito: tsc obliga a
   * decidirlo en cada sitio que construye un hallazgo.
   */
  confianza: 'exacta' | 'aproximada';
  /**
   * El porcentaje QUID que la etiqueta declara de este ingrediente, si lo
   * imprime y es creíble (0 < p ≤ 100 y la suma de la etiqueta no pasa de
   * 100). Es el ÚNICO dato de cantidad explícito que existe: hasta ahora se
   * tiraba en trocear() y con él se tiraba la dosis, que en FODMAP lo es todo.
   */
  porcentaje?: number;
}

export interface LabelResult {
  altos: LabelFinding[];
  vigilar: LabelFinding[];
  sinProblema: LabelFinding[];
  /** trozos que ninguna de las tres capas conoce. No reconocido NO es seguro. */
  noReconocidos: string[];
  /**
   * Trozos que NO NOMBRAN NINGUN INGREDIENTE, con el motivo por el que se
   * descartaron. No son un fallo del lector y no cuentan como tales.
   */
  descartados: { texto: string; motivo: MotivoDescarte }[];
  /** cuántos trozos se han examinado en total */
  totalTrozos: number;
}

/**
 * Guiones y apóstrofos, en todas las variantes tipográficas que imprime un
 * envase: el corto del teclado, los tres largos de imprenta y los apóstrofos
 * curvos.
 * Y el SUBRAYADO, que no es tipografia sino el resto de una negrita: la norma
 * europea obliga a resaltar los alergenos, y al pasar el envase a texto plano
 * eso queda como «_celeri_». Sin quitarlo, el apio —que es alergeno obligatorio
 * y lleva manitol— no se reconocia en ninguna etiqueta francesa que lo marcara.
 */
const GUION_O_APOSTROFO = /[-‐-―‘’ʼ'`´_]/g;

/**
 * Normaliza como el buscador de alimentos y ADEMÁS iguala guiones y apóstrofos
 * a un espacio.
 *
 * Esto no es cosmético: sin ello, media docena de ingredientes eran invisibles
 * en su propio idioma, y siempre por lo mismo — la etiqueta compone con guion
 * y la forma estaba escrita con espacio, o al revés:
 *
 *   «Alho-francês» no casaba con `alho frances`   (el puerro, en portugués)
 *   «Trigo-sarraceno» no casaba con `trigo sarraceno`, y peor: casaba con
 *      `trigo`, así que el sarraceno —que es SEGURO— salía como trigo
 *   «Grão-de-bico» no casaba con `grao de bico`   (el garbanzo, en portugués)
 *   «Sirop d’agave» no casaba con `sirop d agave` (apóstrofo curvo)
 *   «High-fructose corn syrup» no casaba con `high fructose corn syrup`
 *
 * Se aplica a los dos lados —al índice y al texto de la etiqueta—, así que las
 * formas que ya llevan guion escrito siguen casando igual.
 */
export function normalizarEtiqueta(s: string): string {
  return normalize(s).replace(GUION_O_APOSTROFO, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Dónde cae este ingrediente en la lista, cuando eso dice algo.
 *
 * La ley obliga a listar los ingredientes en orden decreciente de peso, así que
 * la posición es el único dato de CANTIDAD que una etiqueta regala. Y en FODMAP
 * la cantidad lo es todo: un ajo el segundo no es un ajo detrás de la sal.
 *
 * Decir dónde aparece NO es un juicio clínico —es leer la etiqueta en voz
 * alta—, así que cabe sin acercarse a la 1.4.1. Devuelve null cuando no hay
 * nada que decir: en una lista de tres, el orden no informa de gran cosa.
 *
 * ── POR QUÉ HAY QUE DECIRLE DE DÓNDE VIENE LA LISTA ───────────────────────
 *
 * Porque toda la frase se apoya en esa ley, y la ley es de las ETIQUETAS. En una
 * lista que sale de una foto de un plato, el orden es el que se le ocurrió al
 * modelo más lo que la persona fue añadiendo al final — no significa
 * absolutamente nada.
 *
 * Se vio en la primera prueba de la foto de plato y no lo cacé: alguien tocaba
 * «ajo» en la caja de lo que no se ve, el ajo entraba el último por ser el
 * último en añadirse, y la app contestaba **«va al final de la lista, así que la
 * cantidad suele ser pequeña»** sobre el FODMAP más común que existe. Una
 * suposición de cantidad sacada de un orden inventado, y encima hacia el lado
 * que quita importancia.
 *
 * Es un parámetro OBLIGATORIO y no una opción con valor por defecto: quien
 * llame a esto tiene que declarar de dónde viene la lista, para que la próxima
 * pantalla que quiera enseñar la pista no herede la ley de las etiquetas sin
 * darse cuenta.
 */
/** Por que un trozo de la lista no puede ser un ingrediente. */
export type MotivoDescarte = 'direccion-web' | 'cifras-sueltas' | 'procedencia';

/**
 * Un envase no solo lleva ingredientes: lleva la web del fabricante, los restos
 * de la tabla nutricional que el OCR arrastra a la lista y la declaracion de
 * procedencia. Ninguno nombra un ingrediente, y hasta ahora los tres caian en
 * «no reconocido».
 *
 * IMPORTA PORQUE ESE NUMERO DECIDE DOS COSAS, y las dos se equivocaban del lado
 * caro: `pareceMalLeido` avisa de que la foto salio mal cuando pasa de la mitad,
 * y `convieneReintentarConIA` paga una llamada al modelo cuando el reconocido es
 * bajo. Un «www» y un «f200» empujaban a las dos.
 *
 * Medido sobre las 342 etiquetas del banco: de 154 trozos sin reconocer, 19 son
 * esto. No es la mitad —los aditivos de bebida energetica que tambien salian en
 * la lista SI son ingredientes y les toca otra puerta—, pero son 19 que ensucian
 * un aviso que solo sirve mientras sea raro.
 *
 * LA REGLA DE SEGURIDAD ES EL ORDEN, no las reglas: esto se pregunta DESPUES de
 * que el indice entero no haya encontrado nada. Una regla de descarte no puede
 * tapar un alimento porque nunca llega a verlo. El guardian lo comprueba en las
 * dos direcciones: ninguna forma del indice cae en una regla, y ninguna regla se
 * evalua antes que el indice.
 *
 * NO SE DESCARTAN LAS PALABRAS CORTAS SUELTAS —«pp», «ra», «str»— aunque parezcan
 * basura del mismo monton: en esa lista estaba «lin», que es el LINO en frances.
 * Una regla por longitud habria callado un alimento de verdad.
 */
const DESCARTES: { motivo: MotivoDescarte; cae: (t: string) => boolean }[] = [
  // «www», y lo que quede de una direccion al partir por los puntos.
  { motivo: 'direccion-web', cae: (t) => /(^| )(www|https?)( |$)/.test(t) },
  // «0 mg/l 1», «kal: 300g 400g», «f200», «861 del 19/04/1960». Lleva cifras y
  // ni una palabra de cuatro letras: no puede estar nombrando una comida.
  { motivo: 'cifras-sueltas', cae: (t) => /\d/.test(t) && !/\p{L}{4,}/u.test(t) },
  // «origen: espana», «origine : france», «origine vegetale». Y con tope de
  // TRES PALABRAS, que lo puso un guardian y van seis. La regla sin tope se
  // llevaba «Origen de la leete: Espania» —el OCR real del kefir—, que nombra la
  // LECHE y solo llega hasta aqui porque el texto viene roto. Justo entonces es
  // cuando `pareceMalLeido` tiene que saltar, y descartarlo lo callaba.
  {
    motivo: 'procedencia',
    cae: (t) =>
      /^(origen|origine|origem|origin|herkunft|ursprung)\b/.test(t) &&
      t.split(' ').filter(Boolean).length <= 3,
  },
];

/** El motivo por el que este trozo no nombra un ingrediente, o null. */
function motivoDeDescarte(normalizado: string): MotivoDescarte | null {
  return DESCARTES.find((d) => d.cae(normalizado))?.motivo ?? null;
}

export function pistaDeCantidad(
  posicion: number,
  total: number,
  deEtiqueta: boolean
): 'primeras' | 'ultimas' | null {
  if (!deEtiqueta) return null;
  if (total < 5) return null;
  if (posicion < 3) return 'primeras';
  if (posicion >= Math.ceil(total * 0.6)) return 'ultimas';
  return null;
}

/**
 * ¿Huele este resultado a texto mal leído?
 *
 * Salió de pasar fotos reales por un reconocedor real: de «Leche pasteurizada
 * de vaca» salía «Leete pasteurzda de vaa», y el análisis lo trataba como si
 * fuera una etiqueta correcta que simplemente no conocíamos. Con las tres capas
 * puestas, un texto bien leído deja por debajo del 20 % sin reconocer; pasar de
 * la mitad no significa que la etiqueta sea rara, significa que el texto está
 * roto.
 *
 * Importa porque el fallo es del lado peligroso: si el OCR se comió media
 * lista, lo que se enseña es media lista, y desde fuera se ve igual que una
 * lista corta. Decirlo permite ofrecer repetir la foto o corregir a mano.
 *
 * Pide un mínimo de trozos: en una lista de tres, uno desconocido es el 33 % y
 * no dice nada.
 */
export function pareceMalLeido(r: LabelResult): boolean {
  // NI UN SOLO INGREDIENTE RECONOCIDO, HABIENDO TROZOS. Eso no es una lista
  // corta: es una lista que no se ha leido, y el minimo de cuatro la dejaba
  // pasar en silencio. Con un trozo —«Leete pasteurzda», que es lo que un OCR
  // real saco de un kefir— la pantalla salia muda y sin aviso, que se ve igual
  // que un producto de un solo ingrediente conocido.
  //
  // SE DICE CON EL NUMERO DELANTE: sobre los dos corpus juntos —342 etiquetas
  // del banco y las 8 fotografiadas con su OCR y su transcripcion, 358 textos—
  // esta linea NO cambia ni uno. El unico mudo que hay ahi es la foto del
  // guacamole, cuyo OCR es la cadena vacia, y ese lo caza la camara antes de
  // llegar aqui. Es un agujero real que el corpus no pisa, no un fallo medido.
  if (r.totalTrozos > 0 && r.noReconocidos.length === r.totalTrozos) return true;
  if (r.totalTrozos < 4) return false;
  return r.noReconocidos.length / r.totalTrozos > 0.5;
}

interface EntradaIndice {
  forma: string;
  capa: 1 | 2 | 3;
  ingrediente?: Ingrediente;
  food?: Food;
  corriente?: GrupoCorriente;
}

/**
 * Las formas que se buscan de un nombre del catálogo.
 *
 * Los 411 alimentos llevan nombre de FICHA, no de etiqueta: «Azúcar de mesa
 * (sacarosa)», «Table sugar (sucrose)». Ese paréntesis no lo imprime ningún
 * envase, así que el nombre tal cual no casa nunca y la capa 2 nacía coja.
 *
 * La derivación es a propósito CORTA —el nombre sin paréntesis y lo de
 * dentro— y no baja al núcleo. Sacar «zumo» de «Zumo de naranja» habría hecho
 * que cualquier zumo del mundo pasara por naranja, y los núcleos que de verdad
 * hacían falta (azúcar, huevo, aceite) ya están en la lista de corrientes.
 */
/**
 * Lo que va entre paréntesis en el nombre de una ficha y NO es un nombre.
 *
 * ── DE DÓNDE SALE ESTO ────────────────────────────────────────────────────
 *
 * El paréntesis de un nombre se indexa como forma suelta, y casi siempre está
 * bien: «Surimi (palitos de cangrejo)» hace que «palitos de cangrejo» encuentre
 * el surimi, y así con el lino, los cornflakes o las pepitas. Pero unos cuantos
 * paréntesis no nombran el alimento: lo CALIFICAN. Y una vez sueltos, esos
 * adjetivos casan con cualquier cosa. Medido:
 *
 *   «huevo entero»   → FOIE GRAS   (la ficha es «Foie gras (entero)»)
 *   «grano entero»   → FOIE GRAS   y eso está en cualquier harina integral
 *   «sale comune»    → CUBITOS DE CALDO, que llevan cebolla y ajo
 *   «cereales»       → CEREAL DE ARROZ INFLADO, un producto concreto
 *
 * El de la sal italiana es el que hace daño: la sal no aporta nada y un cubito
 * de caldo es de los peores, así que salía un aviso alto donde no hay nada.
 *
 * Es la misma idea que el repo ya tiene escrita para los datos —«el ESTADO es
 * una dimensión del dato, no un detalle del nombre»— aplicada al índice: entero,
 * común o fresco son estados, y un estado no identifica a nadie.
 *
 * SE DECLARA LA EXCEPCIÓN Y NO SE QUITA LA REGLA, igual que con los falsos
 * amigos: dejar de indexar los paréntesis costaría el surimi, el lino y los
 * cornflakes, que sí funcionan.
 */
const PARENTESIS_QUE_CALIFICA = new Set([
  // «Foie gras (entero)»
  'entero', 'entera', 'intero', 'inteiro', 'entier', 'whole', 'ganz',
  // «Pastillas de caldo (comunes)», y sus cinco hermanas. Van los plurales
  // TAMBIEN: el italiano dice «comuni» y el portugues «comuns», y singularizar
  // no siempre los deja en la misma forma.
  'comun', 'comunes', 'comune', 'comuni', 'comum', 'comuns',
  'common', 'regular', 'classique', 'herkommlich', 'normale',
  // «Arroz inflado (cereal)» y «Riz soufflé (céréales)»
  'cereal', 'cereales', 'cereale', 'cereali', 'cereai', 'cerealien', 'cereais',
  // «Champignon shiitaké (frais)». El estado de un alimento —fresco, seco,
  // cocido— es justo lo que este repo tiene escrito que NO es un detalle del
  // nombre; y suelto, «frais» hacia que «fromage frais» fuera una seta shiitake,
  // que es alta en manitol.
  'fresco', 'fresca', 'frescos', 'frescas', 'fresh', 'frais', 'fraiche', 'frisch',
  // «seche» y «sechee» son LA RENUNCIA MEDIDA que por fin se cobro: el coco
  // rallado frances es «Noix de coco rapee (seche)», su parentesis generaba la
  // forma suelta `seche`, y con cinco letras casaba POR SUBCADENA dentro de
  // «DESECHE el liquido» — la instruccion de cualquier conserva espaniola. Un
  // bote de corazones de alcachofa contestaba COCO RALLADO (visto en la app,
  // 30-ago). El frances no pierde nada: la ficha entra ahora por sus nombres
  // completos («noix de coco sechee», «coco seche»), que son formas de la
  // entrada `coconut-dried-fr` del diccionario. NO por los alias: `aliases.ts`
  // no se importa aqui y la capa 2 solo indexa los seis nombres de ficha.
  'seco', 'seca', 'secos', 'secas', 'dried', 'sec', 'seche', 'sechee', 'sechees',
  'getrocknet', 'secco',
  // «Schweineohr (Fleisch)». Ahí el paréntesis dice DE QUÉ CATEGORÍA es, no cómo
  // se llama, y suelto convertía la palabra alemana para CARNE en una oreja de
  // cerdo. Es la cuarta vez que aparece este patrón.
  'fleisch', 'carne', 'meat', 'viande',
  // «Bulgur (cocido)». Es el que mas dolia de los cinco: «cocido» suelto hacia
  // que «jamon cocido», «pavo cocido» y «huevo cocido» —que estan en cualquier
  // etiqueta espaniola— devolvieran BULGUR, que es trigo y alto en fructanos.
  'cocido', 'cocida', 'cocidos', 'cocidas', 'cooked', 'cuit', 'cuite', 'gekocht',
  'cotto', 'cotta', 'cozido', 'cozida',
  // «Refresco en polvo (preparado)». Suelto, «preparado» convertía el frontal
  // de un lomo adobado —«Preparado de carne adobada»— en un refresco en polvo
  // alto en fructosa. Medido el 5-sep-2026 con una bandeja de Mercadona. Van
  // con él los demás calificativos de estado que salían sueltos de un
  // paréntesis de una palabra: la mezcla, lo puro, lo curado, lo suave.
  'preparado', 'preparada', 'preparados', 'preparadas', 'prepared', 'preparata', 'preparato',
  'zubereitet', 'fertig', 'fertigpackung',
  'comercial', 'commercial', 'commerciale', 'kommerziell',
  'puro', 'pura', 'pure', 'rein', 'plain', 'neutro', 'neutra', 'neutre', 'neutral', 'neutrale',
  'suave', 'light', 'leggero', 'leggera', 'fraco', 'weak', 'schwach', 'faible', 'doux', 'douce',
  'curado', 'curada', 'cured', 'stagionato', 'stagionata', 'gereift', 'affine', 'affinee',
  'mezcla', 'mistura', 'gemischt', 'mixed', 'melange', 'misto', 'mista',
  'fundido', 'fundida', 'cortado', 'cortada', 'fest', 'firm', 'trocken', 'dry', 'secs', 'secca',
  'ungezuckert', 'unsweetened', 'vegetarian', 'typisch', 'typical', 'alcoholic', 'aromatisiert',
  // ── LOS QUE SALIERON DEL BARRIDO COMPLETO ──────────────────────────────
  //
  // Los cinco de arriba se habian encontrado de uno en uno, por casualidad. Se
  // recorrieron entonces LOS 500 parentesis del catalogo y se probo cada
  // calificativo dentro de una frase real de etiqueta, no suelto —suelto casi
  // ninguno aparece—. De 36 frases, seis contestaban mal:
  //
  //   «boiled ham»      -> JUDIAS MUNG      el «cocido» en ingles
  //   «vin blanc»       -> PUERRO           alto en fructanos
  //   «atun en lata»    -> LECHE DE COCO
  //   «en conserva»     -> CORAZONES DE ALCACHOFA
  //   «poulet au jus»   -> PIÑA EN ALMIBAR  alta en fructosa
  //   «dairy free»      -> HELADO           una etiqueta que dice SIN LACTEOS
  //                                          saliendo con lactosa alta
  //
  // El ultimo es el que peor sienta: la etiqueta esta diciendo lo contrario de
  // lo que la app contesta.
  'boiled', 'bollite', 'bolliti', 'cuits', 'cuites', 'cozidas', 'cozidos',
  'blanc', 'dairy', 'lata', 'lattina', 'en conserva', 'boite', 'au jus',
  'unsalted', 'ungesalzener', 'sin sal',
  // El envase tampoco nombra al alimento, y «tomate en conserva» devolvía
  // CORAZONES DE ALCACHOFA. Van todas las variantes porque el catálogo las
  // escribe de seis maneras y basta con que se escape una.
  'conserva', 'em conserva', 'in conserva', 'en conserve', 'conserve',
  'canned', 'dose', 'in dose', 'boites', 'en lata',
  // ── Y LOS QUE EL BARRIDO ANTERIOR NO VIO, PORQUE MIRABA LO QUE NO ERA ──
  //
  // Aquel barrido probo 36 frases inventadas con los calificativos que PARECIAN
  // calificativos. Este pregunta a las 342 etiquetas del banco: cuando un
  // alimento del catalogo sale de un trozo real y NINGUNO de sus nombres de
  // fuera del parentesis esta en ese trozo, la coincidencia vino del parentesis.
  // Setenta y cuatro veces, y cinco estaban mal:
  //
  //   «sel de mer non raffine»          -> QUESO MANCHEGO  por «(affine)»
  //   «sucre de canne roux non raffine» -> QUESO MANCHEGO
  //   «dried vegetables»                -> MARGARINA       por «(vegetable)»
  //   «hydrolysed vegetable protein»    -> MARGARINA
  //   «schwarze melasse»                -> CAFE NEGRO      por «(black/schwarz)»
  //
  // Y la que no salio del banco pero cae del mismo sitio y es peor: «rape» es el
  // parentesis italiano del coco rallado —«Cocco disidratato (rape)»— y ademas
  // el nombre espaniol de un PESCADO que tiene su propia ficha. Empataban en
  // longitud y en capa, ganaba el coco, y «lomo de rape» contestaba COCO
  // RALLADO. Un parentesis de otra ficha dejaba a un alimento sin su nombre.
  'affine', 'affinee', 'aged', 'vegetable', 'vegetables', 'schwarz', 'rape',
  // ── Y EL QUE SALIO MIDIENDO LA FOTO DE PLATO, QUE ES OTRO CORPUS ────────
  //
  // «Membrillo (fruta)» —el parentesis distingue la fruta del dulce— metia la
  // forma suelta `fruta` en el indice, y ninguna ficha mas la produce, asi que
  // el filtro de «sale solo de parentesis y lo producen VARIAS» no la veia.
  // Resultado: escribir `fruta` contestaba MEMBRILLO, alto en fructosa. Es el
  // fallo caro de los dos —una alarma sobre algo que no se ha dicho—, y es
  // justo la palabra paraguas que el prompt de la foto de plato nombra como
  // ejemplo de lo que NO quiere («una palabra generica como queso, refresco o
  // fruta»), o sea la que va a llegar cuando el modelo no reconozca la pieza.
  // «Pitaya (fruta del dragon)» no se toca: eso es un nombre, no un
  // calificativo, y su forma es otra.
  'fruta',
]);

/**
 * Formas de la capa 2 que en OTRO de los seis idiomas son una palabra corriente.
 *
 * EL INDICE NO TIENE IDIOMA, y eso es deliberado: quien vive en Alemania compra
 * envases en aleman con la app en espaniol, asi que las seis lenguas de cada
 * ficha se indexan juntas. El precio es que dos idiomas pueden escribir igual
 * cosas distintas, y ahi gana el catalogo aunque se equivoque.
 *
 * `SALSA` ES EL CASO Y HACE DANIO EN LA DIRECCION MALA. Es el nombre PORTUGUES
 * del perejil (`parsley`, bajo y sin FODMAP) y es la palabra espaniola e
 * italiana para lo que cubre un plato. Medido sobre el banco de 19 platos
 * compuestos: el modelo escribe `salsa` a secas, la app contestaba PEREJIL con
 * confianza exacta y severidad ok, y esa linea salia en verde. Una salsa puede
 * ser bechamel o un sofrito de ajo y cebolla — es donde se esconde el FODMAP, y
 * es exactamente la linea que `plato-confirmar.tsx` tiene que marcar para
 * preguntar de que era. Reconocerla mal apagaba la pregunta.
 *
 * LO QUE SE PIERDE, DICHO: quien escriba `salsa` queriendo decir perejil deja de
 * verlo reconocido. Cuesta un termino sin reconocer sobre una hierba baja y sin
 * FODMAP; lo otro pintaba de verde una salsa. El perejil sigue entrando por sus
 * otros cinco nombres y por `perejil seco` (`aliases.ts`).
 *
 * `TORTILLA` ES EL OTRO CASO Y NO ES UNA PALABRA CORRIENTE: ES OTRO ALIMENTO.
 * La forma suelta no la escribe ninguna ficha en su nombre — sale del
 * parentesis de los nachos, «Chips de mais (tortilla)» y «Maischips
 * (Tortilla)», donde abrevia «tortilla chips»— y como ninguna otra ficha la
 * produce, el filtro de «sale solo de parentesis y lo producen VARIAS» no la
 * veia. Resultado medido con la foto de un bocadillo de tortilla: el modelo
 * contesta «tortilla» y la app contestaba NACHOS, que es un alimento distinto,
 * de otro cereal y de otro continente, y encima BAJO — o sea que de una
 * tortilla de patatas, que es ALTA en fructanos, no salia ni un aviso.
 *
 * ── Y NO SE ARREGLA MIRANDO EL IDIOMA, QUE ES LO QUE PARECIA ────────────
 *
 * La primera idea fue esa y se cayo al medirla, asi que queda escrita para que
 * nadie la vuelva a tener: «tortilla» en Espania es la de patatas y en Mexico
 * la de maiz, el idioma se SABE —la foto de un plato le pide al modelo que
 * conteste en el idioma de quien mira, `promptPlato(lang)`— y hasta la region,
 * que es la que de verdad desempata, esta a mano (`locale` en `i18n/index.tsx`).
 * O sea que se podia pasar. Lo que no se puede es acertar con ello: en el banco
 * de platos compuestos, con el MISMO espaniol, la palabra sale dos veces y
 * significa dos cosas distintas —la foto de unas fajitas contesta «tortilla»
 * por la de trigo del wrap, y la de un bocadillo de tortilla por la de
 * patatas—. No es un problema de dialecto: es que la palabra sola no lo dice.
 *
 * Y una tortilla mal elegida no es una equivocacion barata: `spanish-omelette`
 * es ALTA y `corn-tortilla` es BAJA, o sea que fallar da igual hacia que lado
 * miente. Fuera del indice, la linea llega sin ficha a `plato-confirmar.tsx`,
 * que es la pantalla que pregunta «¿de que era?» por cada linea que no empareja
 * (`reconoceLinea`) — y quien tiene el plato delante lo contesta en un toque.
 *
 * NO ES UNA LISTA PARA IR LLENANDO. Cada entrada tiene que traer las dos
 * mitades: en que idioma nombra un alimento y en cual es una palabra corriente
 * —o el nombre de OTRO alimento—.
 */
const FORMAS_QUE_SON_OTRA_COSA = new Set(['salsa', 'tortilla']);

/**
 * Nombres que le faltan a una ficha para que el lector la encuentre. La otra
 * lista de sinonimos, y no es `SEARCH_ALIASES` con otro nombre.
 *
 * ── POR QUE NO VALE `aliases.ts`, QUE ES LA PREGUNTA OBVIA ───────────────
 *
 * Porque las dos listas responden a cosas distintas y solo una puede
 * equivocarse gratis. `SEARCH_ALIASES` es para TECLEAR: quien escribe «papa» y
 * ve salir la patata ya ha decidido, y un sinonimo que trae de mas un alimento
 * que no era es un resultado que se ignora. Aqui no hay nadie decidiendo: el
 * lector coge una palabra que ha escrito un modelo mirando una foto y la
 * convierte en una ficha con su nivel, su racion y sus fuentes, sin preguntar.
 * Un sinonimo de mas alli sobra; el mismo sinonimo aqui es una AFIRMACION sobre
 * lo que hay en el plato. Por eso el lector no lee `SEARCH_ALIASES` —lo dicen
 * este fichero e `ingredients.ts` desde el primer dia— y por eso esto no es
 * «abrirle los alias»: son cuatro nombres medidos uno a uno contra los dos
 * bancos de fotos y contra las 342 etiquetas del banco abierto.
 *
 * ── LAS TRES CONDICIONES, Y NINGUNA ES OPINABLE ──────────────────────────
 *
 *  1. LA FICHA EXISTE. Aqui no nace ningun alimento: esto solo le pone a una
 *     ficha del catalogo un nombre que la gente usa y que sus seis nombres no
 *     traen. El nivel, la racion, los FODMAP y la fuente siguen siendo los
 *     suyos, asi que no se inventa ni un dato — que es lo que separa esto de
 *     «anadir la ensaladilla rusa», que si seria un alimento nuevo y necesita
 *     su medicion.
 *  2. EL NOMBRE ES DE UN ALIMENTO CONCRETO, no de una familia. «Pan», «pasta»,
 *     «queso», «galleta» y «judia» NO estan aqui y no es un olvido: son las
 *     palabras que `plato-confirmar.tsx` tiene que PREGUNTAR, y darles ficha
 *     apaga la pregunta. El contraejemplo medido de cada una esta en
 *     `docs/fuentes/plato-sin-emparejar.json`.
 *  3. NO CASA CON NADA HOY, O CASA CON ESTA MISMA FICHA. Un nombre que hoy
 *     lleva a OTRO alimento no se arregla anadiendolo aqui: se arregla quitando
 *     lo que lo desvia, que es lo que hace la lista de arriba. Lo cobra la
 *     guardia.
 *  3 bis. Y NO SE LO QUITA A OTRA FICHA, que es la mitad que no se ve mirando
 *     el resultado. Si dos fichas producen la MISMA forma, las dos entran al
 *     indice y casa la primera que se encuentre: gana una por el orden del
 *     catalogo, que no es un criterio, y la otra deja de ser alcanzable. El
 *     sintoma es una ficha que DESAPARECE, no una de mas, asi que preguntarle
 *     al resultado «¿lleva a otro sitio?» contesta que no y todo parece bien.
 *     Se comprueba sobre las formas y antes del indice.
 *
 * El indice no distingue idiomas, asi que un nombre de aqui vale en los seis.
 */
export const NOMBRES_PARA_EL_LECTOR: Record<string, string[]> = {
  // El plato entero, que el modelo nombra por el apellido y no por el nombre.
  // La ficha se llama «Pasta a la carbonara», asi que «espaguetis a la
  // carbonara» —lo que contesta delante de la foto— no casaba con nada y un
  // plato ALTO (fructanos y lactosa) salia mudo. «Carbonara» sola no es
  // ambigua: es el unico alimento del catalogo que lleva esa palabra.
  'pasta-carbonara': ['carbonara'],
  // «Sirope de arce» es como se dice en Espania y «jarabe de arce» como se dice
  // en America. Mismo alimento y mismo bote.
  'maple-syrup': ['jarabe de arce'],
  // La ficha dice «Te rooibos» y el modelo escribe «te de rooibos»: la misma
  // planta con la preposicion que al nombre le falta.
  'rooibos-tea': ['te de rooibos'],
  // «Tocino» es el bacon en casi toda America y la ficha solo trae «Bacon
  // (panceta ahumada)». El postre «Tocino de cielo» tiene su propia ficha y es
  // una forma mas larga, asi que gana el donde le toca.
  bacon: ['tocino'],
  // «Anchoa» es como la nombra cualquier etiqueta —aceitunas rellenas, pizzas,
  // salsas— y la ficha se llama «Anchoas en salazón»: la forma larga no
  // producía la corta, y la anchoa salía «no reconocida» en los seis idiomas
  // mientras el boquerón, el atún y la sardina sí casaban. Medido el
  // 5-sep-2026 con una lata de aceitunas rellenas de Mercadona. Van las seis
  // lenguas con su plural, porque el italiano y el alemán no lo hacen en -s.
  // «Sardelle» en singular no va: es del boquerón (anchovy-fresh) en alemán.
  'salted-anchovies': [
    'anchoa', 'anchoas', 'anchova', 'anchovas', 'anchovy', 'anchovies', 'anchois',
    'sardellen', 'acciuga', 'acciughe', 'alici',
  ],
};

/**
 * Un nombre con BARRA son dos nombres, y hasta ahora no era ninguno.
 *
 * Catorce fichas llevan barra, y en cuatro de ellas separa dos nombres enteros
 * del mismo alimento: «Brie / Camembert», «Salami / salchichón», «Nachos /
 * totopos de maíz», «Magdalena / muffin (trigo)». Ninguna de las mitades se
 * indexaba, así que `brie`, `camembert`, `salchichon`, `nachos` y `totopos` no
 * se reconocían pese a estar escritos en el catálogo.
 *
 * SOLO SE PARTE LA BARRA CON ESPACIOS, y ese detalle es la regla entera: las
 * otras diez usan la barra PEGADA para alternar una palabra dentro de un nombre
 * —«Zumo/néctar de mango», «Refresco de cola light/zero», «emmental/gruyer»— y
 * partirlas fabricaría trozos como «zumo» o «zero», que no nombran nada. Con
 * espacios alrededor, la barra separa alternativas completas.
 */
function partirPorBarra(nombre: string): string[] {
  return nombre.split(' / ').map((p) => p.trim()).filter(Boolean);
}

export function formasDeAlimento(nombre: string): string[] {
  const n = normalizarEtiqueta(nombre);
  // SE FILTRA DESPUES DE SINGULARIZAR, y ese orden importa: el parentesis de la
  // pastilla de caldo dice «comunes», no «comune», asi que filtrando el texto
  // crudo se colaba igual y aparecia al singularizarlo.
  const dentro = [...n.matchAll(/\(([^)]+)\)/g)]
    .map((m) => m[1].trim())
    .flatMap(singularizar)
    .filter((d) => !PARENTESIS_QUE_CALIFICA.has(d));
  const fuera = n.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();

  return [...partirPorBarra(fuera), ...dentro]
    .flatMap(singularizar)
    .filter((s) => s.length >= 3);
}

/** Sólo el nombre de fuera del paréntesis, que es el que nombra al alimento. */
function formasSinParentesis(nombre: string): string[] {
  const fuera = normalizarEtiqueta(nombre)
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return singularizar(fuera).filter((s) => s.length >= 3);
}

/**
 * El singular, además del plural, cuando la ficha viene en plural.
 *
 * Va en esta dirección y no en la contraria porque el singular casa dentro del
 * plural por subcadena y el plural no cabe en el singular: la ficha dice
 * «Almendras» y la etiqueta pone «almendra 2,3 %», así que sin esto el fruto
 * seco más común de Europa no se reconocía. Con el singular indexado, las dos
 * formas funcionan con una sola entrada.
 *
 * Solo se recorta la `s` final y solo si lo que queda tiene cuerpo suficiente,
 * para no fabricar cosas como «ani» a partir de «anís».
 */
function singularizar(forma: string): string[] {
  const palabras = forma.split(' ');
  const ultima = palabras[palabras.length - 1] ?? '';
  // Y EL PLURAL INGLES DE LOS QUE ACABAN EN -y, que va al reves que el resto:
  // aqui la ficha esta en SINGULAR y la etiqueta escribe el plural, asi que lo
  // que falta en el indice es la forma larga. «Strawberries» no se reconocia
  // —medido en el banco— y con ella toda la familia de la baya: blackberries,
  // blueberries, raspberries, cranberries, cherries. Cuesta 39 entradas de
  // indice, unas pocas de ellas inutiles —«brandies», «jerkies»—, que no
  // casan con nada y no tapan nada.
  const fuera = [forma];
  if (/[^aeiou]y$/.test(ultima) && ultima.length >= 6) fuera.push(forma.slice(0, -1) + 'ies');
  else if (ultima.endsWith('s') && ultima.length >= 6) fuera.push(forma.slice(0, -1));

  // ── Y EL PLURAL ESPANIOL EN -ES, QUE NO ES QUITAR UNA LETRA SINO DOS ─────
  //
  // Quitar la «s» sirve para «almendras» y no sirve para NINGUNA palabra
  // espaniola acabada en consonante, que hace el plural en -es: la ficha dice
  // «Mejillones» y la foto de unos mejillones contesta «mejillon», que es el
  // singular de verdad. Medido sobre los dos bancos de fotos: «mejillon» tres
  // veces y «pinones» -> «pinon» una, cuatro usos que no llegaban a su
  // ficha teniendola escrita en el catalogo con ese mismo nombre.
  //
  // SOLO -ONES, Y SOLO SI EL NOMBRE ES UNA SOLA PALABRA. Las dos mitades de la
  // regla son la que la hace segura, y la segunda se descubrio probandola:
  //
  //   · «-ones» es plural de «-on» sin excepciones. La regla general de «-es»
  //     fabricaria «kefted» de «Keftedes» o «tomat» de «Tomates», que no son
  //     palabras y solo engordan el indice.
  //   · UNA SOLA PALABRA, porque el catalogo tiene «Curry japones» y «Caril
  //     japones», y ahi «-ones» no es un plural: es la terminacion «-es» de un
  //     gentilicio. Sin este medio filtro entran seis formas que no escribe
  //     nadie —«curry japon», «caril japon», «chupe de camaron», «crema de
  //     champinon», «crepe de bechamel y champinon», «quesitos en porcion»—.
  //     Ninguna ficha de una sola palabra es un gentilicio.
  //
  //     LO QUE NO PASA, y conviene dejarlo escrito porque es el miedo razonable
  //     y es FALSO: `japon` suelto NO puede entrar. El corte se hace sobre la
  //     forma entera y no sobre la ultima palabra, asi que de «curry japones»
  //     sale «curry japon» —once letras, no casa dentro de nada— y nunca
  //     «japon». Medido quitando el filtro y comparando el indice entero.
  //
  //   · Y LA COLISION QUE SI EXISTE, que es la otra: `pinon` cabe dentro de
  //     «champinon». Con el umbral de subcadena en cinco letras podria casar
  //     ahi, y lo unico que lo impide es que el indice se recorre de forma
  //     larga a corta. Lo fija `plato-diccionario.test.ts`, porque hoy no falla
  //     por construccion sino por orden.
  //
  // Los otros cinco idiomas no entran: sus plurales van por otro camino
  // —«cipolle» cambia la vocal, «Zwiebeln» aniade una «n»— y esos ya los
  // recoge cada ficha con sus formas. Aqui solo se arregla el espaniol, que es
  // el idioma en el que estan medidos los dos bancos de fotos.
  if (palabras.length === 1 && ultima.endsWith('ones') && ultima.length >= 7)
    fuera.push(forma.slice(0, -2));

  // Y EL PLURAL DE TODAS LAS PALABRAS, no solo de la ultima.
  //
  // «Tomates secos» daba «tomates seco», que no lo escribe nadie, y la etiqueta
  // que pone «tomate seco» acababa en TOMATE a secas —bajo— cuando el tomate
  // seco es ALTO. Igual «pipas de girasol»: en singular contestaba «aceites».
  //
  // ESTO SE MIDIO UNA VEZ EN EL BANCO DE ETIQUETAS Y SALIO QUE NO COMPENSABA
  // —un trozo de 4.541—, y era verdad ahi: una lista de ingredientes se escribe
  // en plural. Donde manda es en la FOTO DE PLATO, porque su prompt le pide al
  // modelo que conteste «en espaniol y en singular»: el corpus de platos esta
  // entero del otro lado de esta regla.
  if (palabras.length > 1) {
    const todas = palabras
      .map((p) => (p.endsWith('s') && p.length >= 5 ? p.slice(0, -1) : p))
      .join(' ');
    if (todas !== forma) fuera.push(todas);
  }
  return [...new Set(fuera)];
}

/**
 * Los nombres con los que se puede llamar a una ficha: los seis suyos y los
 * pocos que le faltan (`NOMBRES_PARA_EL_LECTOR`, aqui arriba, con las tres
 * condiciones que tiene que cumplir uno para entrar).
 *
 * Va por aqui —y no por `SEARCH_ALIASES`, que el lector no lee ni va a leer—
 * para que el hallazgo salga con `origen: 'catalogo'` y con el nivel, la racion,
 * los FODMAP y las fuentes DE LA FICHA. Un nombre nuevo no trae ni un dato
 * nuevo: solo abre otra puerta a la misma ficha.
 */
function nombresDeFicha(food: Food): string[] {
  const extra = NOMBRES_PARA_EL_LECTOR[food.id];
  return extra ? [...Object.values(food.names), ...extra] : Object.values(food.names);
}

/**
 * El índice único de las tres capas, de la forma más larga a la más corta.
 *
 * A IGUAL LONGITUD DECIDE LA CAPA, y eso no es un detalle: sin ese desempate
 * quedaba en manos del orden de los ficheros, que no es un criterio.
 *
 * SE CONSTRUYE LA PRIMERA VEZ QUE SE ANALIZA, no al importar el módulo. Medido:
 * armar las 3.928 formas cuesta ~100 ms en Node y bastante más en un móvil, y
 * al colgar de una constante de módulo ese tiempo se pagaba AL ABRIR LA APP
 * —expo-router carga las rutas— por una pantalla en la que la mayoría no va a
 * entrar. Ahora lo paga quien abre el lector, que es quien lo usa.
 */
/**
 * La capa 2, sin los trozos de paréntesis que no nombran a nadie.
 *
 * `formasDeAlimento` indexa lo que hay DENTRO del paréntesis además del nombre
 * de fuera, y para «Ácido cítrico (E-330)» o «Hákarl (tiburón fermentado)» eso
 * es justo lo que hace falta. Pero media docena de fichas usan el paréntesis
 * para decir el ESTADO —«(seca)», «(fresh)», «(gekocht)», «(Dose)», «(con
 * azúcar)»— y esos trozos entraban al índice apuntando a una ficha concreta.
 *
 * El resultado era un falso positivo por construcción: una etiqueta alemana que
 * pone «Dose» casaba con `sardine-canned`, `tuna-canned`, `coconut-milk-canned` o
 * `artichoke-hearts-canned` según cuál ordenase primero, y «con azúcar» casaba
 * con el caramelo duro. La palabra no dice qué alimento es; dice cómo está.
 *
 * Es el mismo argumento que ya justifica que esta derivación no baje al núcleo
 * —«sacar zumo de Zumo de naranja habría hecho que cualquier zumo pasara por
 * naranja»—, aplicado a la otra mitad de la función.
 *
 * La regla es la que se puede comprobar: **un trozo que sale SOLO de paréntesis
 * y que producen VARIAS fichas no identifica a ninguna**. Si el trozo también es
 * el nombre de fuera de alguna ficha se queda —«mûre» es «madura» en el plátano
 * y es la mora en francés, y la mora tiene derecho a su forma—.
 */
function capaDeFichas(conPlatos: boolean): EntradaIndice[] {
  const fichas = conPlatos ? allFoods : allFoods.filter((food) => !PLATOS_FUERA_DEL_INDICE.has(food.id));
  const cuantas = new Map<string, number>();
  const esNombre = new Set<string>();
  for (const food of fichas) {
    const nombres = nombresDeFicha(food);
    for (const forma of new Set(nombres.flatMap(formasDeAlimento)))
      cuantas.set(forma, (cuantas.get(forma) ?? 0) + 1);
    for (const forma of new Set(nombres.flatMap(formasSinParentesis)))
      esNombre.add(forma);
  }
  // Y las formas que YA ESTAN EN LA CAPA 1. El indice se recorre de forma larga
  // a corta y a igual longitud manda la capa, asi que ante dos entradas con la
  // MISMA forma la del diccionario va primero, casa, y enmascara el texto: la
  // copia de la capa 2 no puede casar nunca. Eran 293 entradas muertas.
  //
  // Y donde no estaban muertas, estorbaban: la negacion de una entrada de capa 1
  // es su `excludeIf` y la de una ficha es otra lista distinta, asi que una copia
  // de capa 2 puede colarse justo cuando el diccionario se ha negado a proposito.
  // Hay 89 formas en ese caso —«ajo» con el aceite de ajo negado, «apio» con la
  // sal de apio, «trigo» con el sarraceno— y hoy las salva que la forma LARGA
  // case antes. Quitar la copia lo hace verdad por construccion y no por suerte.
  //
  // Se quita solo si a la ficha le queda alguna forma PROPIA: si el diccionario
  // cubre todos sus nombres —el ajo, la cebolla— la ficha se quedaria fuera del
  // indice y el lector dejaria de poder enseniar su racion.
  // ── EL NOMBRE CON SU PARENTESIS PEGADO, PERO SOLO CUANDO HACE FALTA ──────
  //
  // El parentesis se indexaba suelto y no pegado, y eso dejaba al PLATANO
  // MADURO sin poder nombrarse. Su ficha se llama «Platano (maduro)», el indice
  // guardaba «platano» y «maduro» por separado, y al analizar «platano maduro»
  // casaba primero «platano» —que es mas larga—, enmascaraba, y «maduro» ya no
  // estaba. Resultado: «platano maduro» devolvia el platano POCO maduro, que es
  // BAJO y con 100 g de racion, cuando el maduro es ALTO y aguanta 35. El peor
  // fallo que esta app puede cometer, sobre una fruta que se come todo el mundo.
  //
  // SOLO SE FABRICA CUANDO LA PARTE DE FUERA LA COMPARTEN VARIAS FICHAS, y eso
  // hace dos trabajos, no uno. El segundo se descubrio con una prueba de
  // mutacion que salio VERDE: hubo aqui un filtro extra —quitar los compuestos
  // que empiezan por una forma del diccionario— puesto para que «sorbitol e420»
  // no tapara la entrada «sorbitol». Al acotar el compuesto a los nombres
  // compartidos, ese filtro se quedo SIN TRABAJO para lo que se escribio —el
  // sorbitol lo tiene una sola ficha, asi que su compuesto ya no se fabrica— y
  // paso a quitar 37 formas utiles: se llevaba «puerro hojas verdes», que es
  // BAJO y es de los datos mas utiles de esta dieta, y contestaba PUERRO ALTO.
  // Quitar comida sin motivo es el otro lado del mismo fallo. Fuera el filtro.
  //
  // El resto del porque:
  // cuando el parentesis es lo unico que las distingue y sin el pegado la ficha
  // es inalcanzable. Hacerlo para todas costaba 814 entradas de indice y NO
  // movia ninguno de los dos corpus —97,4 % en etiquetas y 14,9 % en platos,
  // identicos—: 814 formas por un caso que ningun corpus contiene. Acotado al
  // nombre compartido son unas pocas y arreglan justo lo que se puede nombrar
  // mal.
  const conParentesis = new Map<string, string[]>();
  for (const food of fichas) {
    const suyas: string[] = [];
    for (const nombre of nombresDeFicha(food)) {
      const n = normalizarEtiqueta(nombre);
      const dentro = n.match(/\(([^)]+)\)/)?.[1]?.trim();
      const fuera = n.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
      if (!dentro || !fuera || (cuantas.get(fuera) ?? 0) < 2) continue;
      suyas.push(`${fuera} ${dentro}`);
    }
    if (suyas.length) conParentesis.set(food.id, [...new Set(suyas)]);
  }

  const deCapa1 = new Set(INGREDIENTES.flatMap((i) => i.forms.map(normalizarEtiqueta)));
  return fichas.flatMap((food) => {
    const suyas = [
      ...new Set([
        ...nombresDeFicha(food)
          .flatMap(formasDeAlimento)
          .filter((forma) => esNombre.has(forma) || (cuantas.get(forma) ?? 0) === 1),
        ...(conParentesis.get(food.id) ?? []),
      ]),
    ].filter((forma) => !FORMAS_QUE_SON_OTRA_COSA.has(forma));
    const propias = suyas.filter((forma) => !deCapa1.has(forma));
    return (propias.length ? propias : suyas).map(
      (forma): EntradaIndice => ({ forma, capa: 2, food })
    );
  });
}
const cache: Record<'etiqueta' | 'plato', EntradaIndice[] | null> = {
  etiqueta: null,
  plato: null,
};

/**
 * El indice, y son DOS.
 *
 * ── POR QUE DOS, Y NO ES UNA OPTIMIZACION ─────────────────────────────────
 *
 * Los 768 platos del catalogo estan fuera del indice del lector de etiquetas, y
 * con razon: «pizza margarita» o «lomo saltado» no aparecen jamas en una lista
 * de ingredientes. Eso se decidio para ESTA pantalla y es correcto para ella.
 *
 * Pero la foto de un plato usa el mismo motor, y ahi los platos son justo lo que
 * sale. Con un solo indice, **42 % del catalogo era inalcanzable desde una foto**
 * por construccion, hiciera lo que hiciera el prompt: el modelo contestaba
 * «cappuccino» o «batido de fresa» —acertando— y la app no tenia esas fichas
 * donde mirar.
 *
 * En el banco de 87 fotos solo hay 2 fichas de esas, porque ese banco sale de
 * las teselas de las fichas y casi ninguna es un plato compuesto. Las 2 acaban
 * en peligroso, las 2. El banco dice 2; el mecanismo dice 768, y la funcion se
 * llama «fotografia tu plato».
 */
function indice(conPlatos = false): EntradaIndice[] {
  const clave = conPlatos ? 'plato' : 'etiqueta';
  const guardado = cache[clave];
  if (guardado) return guardado;
  const construido = [
    ...INGREDIENTES.flatMap((ing) =>
      ing.forms.map((forma): EntradaIndice => ({
        forma: normalizarEtiqueta(forma),
        capa: 1,
        ingrediente: ing,
      }))
    ),
    // LOS PLATOS NO ENTRAN, y no es un ahorro cosmetico: «pizza margarita» o
    // «lomo saltado» no aparecen jamas en una lista de ingredientes, que es lo
    // unico que analiza esta pantalla. Ocupaban 1 de cada 8 formas del indice y
    // ninguna podia acertar. Ver `platos-fuera-del-indice.ts`.
    ...capaDeFichas(conPlatos),
    ...CORRIENTES.flatMap((grupo) =>
      grupo.forms.map((forma): EntradaIndice => ({
        forma: normalizarEtiqueta(forma),
        capa: 3,
        corriente: grupo,
      }))
    ),
  ].sort((a, b) => b.forma.length - a.forma.length || a.capa - b.capa);
  cache[clave] = construido;
  return construido;
}

/**
 * Cuántas formas hay que probar por cada trozo de etiqueta.
 *
 * Se expone para poder vigilarlo: el análisis recorre el índice entero por
 * trozo, así que este número multiplica el coste de la pantalla. Con las tres
 * capas el análisis de una etiqueta larga tarda 3 ms; el día que alguien indexe
 * algo enorme, conviene que salte un test y no un móvil viejo.
 *
 * OJO, llamarla construye el índice: en un test de arranque, medir esto ya
 * paga el coste que se estaba midiendo.
 */
export function tamanoIndice(conPlatos = false): number {
  return indice(conPlatos).length;
}

/**
 * Longitud a partir de la cual una forma puede casar DENTRO de otra palabra.
 *
 * Las largas tienen que poder hacerlo: el alemán compone («Zwiebelpulver»,
 * «Weizenvollkornmehl») y exigirle palabra completa dejaría fuera media
 * etiqueta alemana. Las cortas no pueden: «ajo» cabe dentro de «ajonjolí» —
 * medido, marcaba el sésamo como ajo— y «rye» dentro de más de una palabra
 * inglesa. Por debajo de este umbral se exige palabra entera.
 */
const MINIMO_PARA_SUBCADENA = 5;

/**
 * A partir de cuántas palabras un trozo deja de ser un ingrediente y pasa a ser
 * una lista que perdió sus comas.
 *
 * Seis es donde caen los dos lados: el ingrediente más largo que se escribe de
 * verdad —«aceite de girasol alto oleico», «harina integral de trigo»— llega a
 * cinco, y una lista sin separar pasa de diez a la primera. Por debajo manda la
 * regla de un trozo un ingrediente; por encima se devuelven todos los que se
 * encuentren, porque callar cinco de seis es peor que nombrar uno de más.
 */
const MINIMO_PALABRAS_LISTA = 6;

/**
 * Un porcentaje seguido de un calificativo de COMPOSICIÓN no es un QUID.
 *
 * «Leche entera 1,5 % de materia grasa» no dice que el producto lleve un 1,5 %
 * de leche: dice de qué está hecha la leche. Tomarlo por QUID convertía un vaso
 * de leche entera en «~3 g, por debajo de su ración segura», que es una cifra
 * inventada y del lado tranquilizador — el peor lado en la única frase de la
 * pantalla que da gramos, y encima sobre los lácteos, que es donde «% de materia
 * grasa» sale en todos los envases de Europa. Lo mismo con el grado alcohólico
 * y con los «mínimo N %» de cacao.
 *
 * Se mira lo que viene DETRÁS del número, que es lo que distingue «tomate 65 %»
 * —cantidad de verdad— de «35 % de grasa».
 */
const PORCENTAJE_QUE_NO_ES_CANTIDAD =
  /^\s*(?:de\s+|di\s+|of\s+|d[eo]s?\s+|en\s+)?(materi[ae]s?\s+gras[ae]?s?|mati[eè]res?\s+grasses?|grasa|grasas|gordura|gorduras|fett|fettgehalt|fettanteil|grassi|grasso|fat|milk\s?fat|m\.?\s?g\.?|vol|alc|alcohol|alcool|alkohol|cacao|kakao|cocoa|mindestens|minimum|minimo|mínimo|min)\b/i;

/**
 * Y el mismo calificativo cuando va DELANTE: «mindestens 3,5 %», «mínimo 70 %».
 *
 * Es la otra mitad de PORCENTAJE_QUE_NO_ES_CANTIDAD y hace falta porque el
 * alemán y el italiano lo escriben así de serie —«Vollmilch mindestens 3,5 %»—.
 * Un mínimo declarado no es la cantidad que lleva el producto: es el suelo que
 * el fabricante se compromete a no bajar.
 *
 * EMPIEZA EXIGIENDO UN NO-LETRA porque estas palabras son cortas y son final de
 * otras: sin eso, `min` casaba dentro de «cumin», «curcumin» o «Vitamin», y
 * «cumin 5 %» —un QUID de verdad— se quedaba sin su cifra. Al revés que el
 * lado de detrás, aquí el ancla está al final y `\b` no protege el principio.
 */
const CALIFICATIVO_ANTES_DEL_PORCENTAJE =
  /(?:^|[^\p{L}])(?:mindestens|minimum|min\.?|m[ií]nimo|almeno|au\s+moins|al\s+menos|at\s+least|no\s+m[ií]nimo|vol\.?|alc\.?)\s*$/iu;

/**
 * Los delimitadores de «palabra completa»: cualquier cosa que no sea letra ni
 * dígito, en cualquier alfabeto.
 *
 * Va en una constante y no incrustado en un template literal porque ahí `\p`
 * pierde la barra invertida —JavaScript se la come como escape desconocido— y
 * la clase queda en «cualquier cosa menos p, L o N», que casa con casi todo.
 * El síntoma fue que «ajonjolí» seguía marcándose como ajo con el arreglo ya
 * puesto: la regla estaba escrita y no se aplicaba.
 */
const NO_LETRA = '[^\\p{L}\\p{N}]';

/**
 * Las formas que, pese a medir cinco letras o mas, EXIGEN palabra entera.
 *
 * `MINIMO_PARA_SUBCADENA` deja que toda forma de cinco letras case dentro de
 * otra palabra, y tiene que ser asi: el aleman compone y sin eso media etiqueta
 * alemana se queda fuera. El precio son las palabras corrientes de OTRO idioma
 * que llevan dentro, por casualidad de deletreo, el nombre de un alimento.
 *
 * Se encontraron barriendo las 993 palabras de siete letras o mas de las 342
 * etiquetas del banco abierto y probando cada una DENTRO de una frase real: la
 * mayoria de las 122 coincidencias por subcadena son correctas —«weizen» dentro
 * de «Weizenvollkornmehl»— y en muchas de las demas gana una forma mas larga y
 * el fallo no llega a verse. Estas diez si llegan:
 *
 *   lassi     «classique», «classic», «classico», «clássico», «klassisch»
 *             — un LASSI ALTO en cinco idiomas, y «receta clasica» esta en
 *               cualquier envase. Es el peor de los diez.
 *   sidra     «desidratado» — SIDRA, alta, en portugues y espaniol
 *   lattosio  «galattosio» — la galactosa contestaba LACTOSA ALTA
 *   rizada    «pasteurizada» — col rizada
 *   especia   «especial» — «edicion especial» salia como ambiguo
 *   menta     «alimentare» — «olio alimentare», en toda etiqueta italiana
 *   cumin     «curcumina» — la curcuma contestaba comino
 *   moule     «semoule» — mejillones
 *   salva     «salvado» — salvia
 *
 * «lattosio in polvere» va tambien porque «galattosio in polvere» la lleva
 * entera dentro: prohibir solo el token corto deja pasar sus formas largas.
 *
 * Ninguna pierde nada por exigir palabra entera: sus plurales los recupera
 * `singularizar`, y sus compuestos de verdad estan escritos como formas propias
 * («semoule de ble dur», «col rizada»).
 *
 * `seche` YA NO ESTA AQUI PORQUE YA NO EXISTE COMO FORMA: fue la renuncia
 * medida de este comentario hasta que se cobro de verdad — «DESECHE el
 * liquido» de un bote de alcachofas contestaba coco rallado. El arreglo fue el
 * que este parrafo pedia: la ficha francesa entro por sus nombres completos
 * («noix de coco sechee», «coco seche», formas de `coconut-dried-fr`; los alias
 * de `aliases.ts` NO entran en este indice) y el calificativo suelto
 * se filtra en PARENTESIS_QUE_CALIFICA con los demas estados del alimento.
 */
const EXIGE_PALABRA_ENTERA = new Set([
  'lassi', 'sidra', 'lattosio', 'rizada', 'especia', 'menta', 'cumin', 'moule', 'salva',
  'lattosio in polvere',
]);

/** Con la longitud sola no basta: hay formas largas que tampoco pueden ir dentro. */
function puedeIrDentro(forma: string): boolean {
  return forma.length >= MINIMO_PARA_SUBCADENA && !EXIGE_PALABRA_ENTERA.has(forma);
}

/** ¿Está la forma como PALABRA COMPLETA en el texto? */
function apareceEnteraComoPalabra(texto: string, forma: string): boolean {
  return new RegExp(`(^|${NO_LETRA})${escapar(forma)}($|${NO_LETRA})`, 'u').test(texto);
}

/**
 * ¿Está la forma como palabra completa, ADMITIENDO SU PLURAL?
 *
 * SOLO PARA LA ETIQUETA DE CONFIANZA. `apareceEn` no la usa: quién casa y quién
 * no se decide exactamente igual que antes, así que esto no relaja ninguna regla
 * de las que evitan un falso positivo.
 *
 * Lo que cambia es que «oignons» deje de anunciarse como una inferencia, porque
 * no lo es. Medido sobre las 342 etiquetas del banco: 168 hallazgos «aproximados»
 * en 101 etiquetas —el 29,5 %—, y 28 de ellos altos. La marca de incertidumbre
 * solo sirve mientras sea rara: si una de cada tres etiquetas te manda comprobar
 * en el envase una lectura que es exacta, dejas de leer el aviso, y entonces no
 * lo lees el día que la coincidencia sí es dudosa.
 *
 * Cubre el «-s»/«-es» de es/pt/fr/en, la «-x» de «choux» y la «-n» de
 * «Zwiebeln». El italiano cambia la vocal final («cipolle») y seguirá saliendo
 * aproximado: es la renuncia consciente de esta función. Y el sufijo opcional no
 * puede convertir en exacta una coincidencia interna de verdad, porque detrás
 * sigue exigiendo un no-letra: «Zwiebelpulver» sigue siendo aproximada.
 */
function apareceComoPalabraOPlural(texto: string, forma: string): boolean {
  return new RegExp(`(^|${NO_LETRA})${escapar(forma)}(?:s|es|x|n)?($|${NO_LETRA})`, 'u').test(texto);
}

/** ¿Aparece esta forma en el texto, con la regla que le toca por longitud? */
function apareceEn(texto: string, forma: string): boolean {
  if (puedeIrDentro(forma)) return texto.includes(forma);
  return apareceEnteraComoPalabra(texto, forma);
}

function escapar(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Quita del texto todas las apariciones de una forma, para no contarla dos veces. */
function enmascarar(texto: string, forma: string): string {
  if (puedeIrDentro(forma)) return texto.split(forma).join(' ');
  return texto.replace(new RegExp(`(^|${NO_LETRA})${escapar(forma)}($|${NO_LETRA})`, 'gu'), '$1 $2');
}

/**
 * Las negaciones que invalidan una coincidencia: «sin lactosa», «lactose free».
 *
 * Se comprueban CONTRA LAS TRES CAPAS, no solo contra la entrada del
 * diccionario. Un `excludeIf` dice «esto no es X», y X puede estar también en
 * el catálogo de alimentos: sin esto, el diccionario excluía el ajo de «aceite
 * de ajo» y acto seguido la ficha «Ajo» de los 411 lo volvía a marcar. La
 * exclusión más cuidada del fichero quedaba anulada por la capa de abajo.
 */
let negacionesPorAlimento: Map<string, string[]> | null = null;

/** Las negaciones que el diccionario declara sobre cada ficha de alimento. */
function negacionesDe(foodId: string): string[] {
  if (!negacionesPorAlimento) {
    negacionesPorAlimento = new Map();
    for (const ing of INGREDIENTES) {
      if (!ing.foodId || !ing.excludeIf?.length) continue;
      const ya = negacionesPorAlimento.get(ing.foodId) ?? [];
      negacionesPorAlimento.set(ing.foodId, [...ya, ...ing.excludeIf.map(normalizarEtiqueta)]);
    }
  }
  return negacionesPorAlimento.get(foodId) ?? [];
}

/**
 * UN «SIN LACTOSA» APAGA TODO LO DEL TROZO QUE SOLO APORTE LACTOSA.
 *
 * `negacionesDe` solo sabe negar la FICHA QUE EL DICCIONARIO NOMBRA, y eso deja
 * fuera a las demás fichas del mismo FODMAP: «Kefir senza lattosio» seguía
 * dando «Kéfir, alto en lactosa» porque ninguna entrada declara nada sobre la
 * ficha del kéfir. Contradecir una declaración impresa en el envase es de lo
 * peor que puede hacer este lector, y en la lista de arriba había tres kéfires.
 *
 * La regla se construye sola desde los `excludeIf` que YA ESTÁN, y se queda con
 * los que cumplen las dos condiciones a la vez:
 *
 *   · la frase es un «libre de» —«sin», «sans», «senza», «ohne», «free»,
 *     «frei», «0 %»—, no un homónimo como «judías verdes»;
 *   · y NOMBRA A SU PROPIA ENTRADA, o sea que la declaración es sobre el mismo
 *     FODMAP que la entrada aporta.
 *
 * La segunda condición es la que impide el error simétrico y peligroso: la masa
 * madre se excluye con «sin gluten», pero SIN GLUTEN NO ES SIN FRUCTANOS —el
 * pan sin gluten lleva inulina más veces que el otro—, y sin ese filtro un
 * «sin gluten» en el trozo habría apagado la achicoria. «Sin lactosa» sí habla
 * de la lactosa, que es a la vez la proteína declarada y el FODMAP.
 *
 * Solo apaga al candidato cuyos FODMAP están TODOS dentro de los que la
 * declaración cubre: un helado «sin lactosa» con sorbitol sigue avisando.
 */
const LIBRE_DE = /(?:^|\s)(?:sin|sem|sans|senza|ohne)\s|free|frei|\d\s*%/;
let declaracionesLibreDe: { frase: string; fodmaps: FodmapType[] }[] | null = null;

function reglasLibreDe(): { frase: string; fodmaps: FodmapType[] }[] {
  if (!declaracionesLibreDe) {
    declaracionesLibreDe = [];
    for (const ing of INGREDIENTES) {
      if (!ing.excludeIf?.length || !ing.fodmaps.length) continue;
      const suyas = ing.forms.map(normalizarEtiqueta);
      for (const frase of ing.excludeIf.map(normalizarEtiqueta))
        if (LIBRE_DE.test(frase) && suyas.some((f) => frase.includes(f)))
          declaracionesLibreDe.push({ frase, fodmaps: ing.fodmaps });
    }
  }
  return declaracionesLibreDe;
}

function estaNegado(texto: string, entrada: EntradaIndice): boolean {
  const suyo = entrada.ingrediente?.excludeIf;
  if (suyo?.some((neg) => texto.includes(normalizarEtiqueta(neg)))) return true;
  const fodmaps = entrada.ingrediente?.fodmaps ?? entrada.food?.fodmaps ?? [];
  if (
    fodmaps.length > 0 &&
    reglasLibreDe().some(
      (r) => texto.includes(r.frase) && fodmaps.every((f) => r.fodmaps.includes(f))
    )
  )
    return true;
  if (!entrada.food) return false;
  return negacionesDe(entrada.food.id).some((neg) => texto.includes(neg));
}

/** El nivel del catálogo, ya endurecido por el mismo semáforo que usa la lista. */
function severidadDeAlimento(food: Food): SeveridadIngrediente {
  const nivel = nivelDerivado(food);
  if (nivel === 'high') return 'high';
  if (nivel === 'moderate') return 'watch';
  return 'ok';
}

/** Convierte una entrada del índice en el hallazgo que se devuelve. */
function aHallazgo(
  e: EntradaIndice,
  textoEncontrado: string,
  posicion: number,
  confianza: 'exacta' | 'aproximada'
): LabelFinding {
  if (e.ingrediente) {
    return {
      id: e.ingrediente.id,
      origen: 'diccionario',
      nombre: e.ingrediente.names,
      fodmaps: e.ingrediente.fodmaps,
      severidad: e.ingrediente.severity,
      ingrediente: e.ingrediente,
      food: e.ingrediente.foodId ? foodById.get(e.ingrediente.foodId) : undefined,
      textoEncontrado,
      posicion,
      confianza,
    };
  }
  if (e.food) {
    return {
      id: e.food.id,
      origen: 'catalogo',
      nombre: e.food.names,
      fodmaps: e.food.fodmaps,
      severidad: severidadDeAlimento(e.food),
      food: e.food,
      textoEncontrado,
      posicion,
      confianza,
    };
  }
  return {
    id: e.corriente!.id,
    origen: 'corriente',
    nombre: e.corriente!.n,
    fodmaps: [],
    severidad: 'ok',
    textoEncontrado,
    posicion,
    confianza,
  };
}

/**
 * El QUID de un INGREDIENTE COMPUESTO no es del producto.
 *
 * «Chocolate con leche 30 % (…, leche en polvo 20 %)» dice que la leche en polvo
 * es el 20 % del chocolate, o sea el 6 % del producto. Aplanando los paréntesis
 * se perdía la profundidad y la pantalla decía «un 20 % de leche en polvo».
 *
 * Y como efecto lateral esos porcentajes anidados hinchaban la suma por encima
 * de 100,5, con lo que `sumaCreible` tiraba TODOS los QUID de la etiqueta: 13 de
 * las 232 etiquetas del banco que traen porcentaje no enseñaban ninguno, y en
 * las tres peores el porcentaje útil —el del cereal, el de nivel superior— sí
 * estaba. A profundidad 0 la suma vuelve a ser creíble por construcción.
 *
 * Va DESPUÉS de sacar los marcadores y ANTES de aplanar los paréntesis en comas,
 * que es la única ventana en la que la profundidad todavía existe.
 */
function sinQuidAnidado(texto: string): string {
  let profundidad = 0;
  return texto.replace(/[([]|[)\]]|%%\d+(?:_\d+)?/gu, (m) => {
    if (m === '(' || m === '[') {
      profundidad += 1;
      return m;
    }
    if (m === ')' || m === ']') {
      profundidad = Math.max(0, profundidad - 1);
      return m;
    }
    return profundidad > 0 ? ' ' : m;
  });
}

/**
 * Trocea la etiqueta en ingredientes. Separa por comas, puntos y comas, puntos
 * y saltos de línea, pero NO por paréntesis: «harina (trigo, centeno)» tiene
 * que conservar lo de dentro, que es justo donde se esconde lo interesante.
 *
 * El porcentaje QUID viaja con su trozo y la coma decimal NO parte: sin eso,
 * «albahaca 0,5 %» se convertía en «albahaca 0» y «5 %», que son dos trozos y
 * ninguno es un ingrediente. Antes el porcentaje se borraba aquí por ese mismo
 * motivo; ahora se protege con un marcador y se extrae al final, porque es el
 * único dato de dosis que una etiqueta imprime. Si un trozo trae varios (un
 * OCR que fundió dos ingredientes), manda el primero y los demás se limpian.
 */
function trocear(texto: string): { texto: string; porcentaje: number | null }[] {
  const conMarcadores =
    texto
      // UNA NEGACIÓN NO SE PARTE POR EL SALTO DE RENGLÓN. Las medallas de un
      // frontal van a dos líneas —«SIN» arriba, «LACTOSA» abajo— y el
      // reconocedor las devuelve así: «sin» se quedaba en un trozo y «lactosa»
      // en otro, y la etiqueta que presume de no llevar lactosa salía ALTA en
      // lactosa. Medido el 5-sep-2026 con un lomo adobado. Lo mismo al revés
      // en inglés y alemán: «LACTOSE\nFREE», «LAKTOSE\nFREI».
      .replace(/\b(sin|sans|senza|sem|ohne|without)\s*\n\s*/giu, '$1 ')
      .replace(/\s*\n\s*(free|frei)\b/giu, ' $1')
      // Las palabras partidas al final de renglón se vuelven a pegar ANTES de
      // nada. Una etiqueta impresa parte por donde le cabe —«harina de tri-\ngo»—
      // y sin esto salían cuatro trozos ilegibles y el trigo no se detectaba.
      // Tiene que ir aquí y no después: la normalización convierte los guiones en
      // espacios, así que para entonces ya no se distingue esta rotura de un
      // guion de verdad.
      .replace(/[-‐-―]\s*\n\s*/g, '')
      .replace(/(\d),(\d)/g, '$1.$2')
      // El QUID entre paréntesis —«cebolla (12%)»— se pega al ingrediente ANTES
      // de que los paréntesis se vuelvan comas, porque una coma lo separaría de
      // su ingrediente y el dato quedaría huérfano. El marcador %% no puede
      // venir de una etiqueta: trocear es privada y nada más la llama. El punto
      // decimal se codifica como «_» dentro del marcador, porque el split de
      // abajo parte por punto y «%%6.5» quedaría en dos trozos rotos.
      .replace(/\(\s*(\d+(?:\.\d+)?)\s*%\s*\)/g, (_, p) => ` %%${p.replace('.', '_')} `)
      // Y el QUID inline —«tomate 65 %»— al mismo marcador.
      .replace(/(\d+(?:\.\d+)?)\s*%/g, (_, p) => ` %%${p.replace('.', '_')} `);

  return sinQuidAnidado(conMarcadores)
    .replace(/[()[\]]/g, ',')
    .split(/[,;.\n•·]/)
    .map((t) => t.trim())
    .map((t) => {
      const m = t.match(/%%(\d+(?:_\d+)?)/); // si hay varios, manda el primero
      // Lo que viene DETRÁS del marcador decide si el número era una cantidad o
      // una composición: «1,5 % de materia grasa» no es un QUID (ver
      // PORCENTAJE_QUE_NO_ES_CANTIDAD). El texto del trozo no cambia por esto.
      const detras = m ? t.slice(t.indexOf(m[0]) + m[0].length) : '';
      const delante = m ? t.slice(0, t.indexOf(m[0])) : '';
      const esCantidad =
        m !== null &&
        !PORCENTAJE_QUE_NO_ES_CANTIDAD.test(detras) &&
        !CALIFICATIVO_ANTES_DEL_PORCENTAJE.test(delante.trimEnd());
      return {
        texto: t.replace(/%%\d+(?:_\d+)?/g, ' ').replace(/\s+/g, ' ').trim(),
        porcentaje: esCantidad ? Number(m![1].replace('_', '.')) : null,
      };
    })
    .filter((t) => t.texto.length > 1 && /\p{L}/u.test(t.texto));
}

/**
 * Analiza la lista de ingredientes de una etiqueta.
 *
 * Un mismo ingrediente puede aparecer varias veces («ajo», «ajo en polvo»): se
 * devuelve una sola vez, con el primer texto en que apareció, para no inflar el
 * recuento y asustar de más.
 */
// ── Códigos, que son ingredientes con nombre de matrícula ────────────────────
//
// Un envase europeo escribe la mitad de sus aditivos con un número: «E-471»,
// «E150d», «e 500ii». Y las vitaminas con una letra y un dígito: «B1», «B6»,
// «D2». Ninguno es un alimento y por eso no está en el diccionario, así que
// hasta ahora salían todos como «no reconocido».
//
// POR QUÉ IMPORTA, Y NO ES COSMÉTICO. Medido sobre las 342 etiquetas del banco
// abierto: «b1» diecisiete veces, «b3» nueve, «b2» ocho, «b6» siete, «b9» seis,
// «d2» cinco. Cincuenta y cinco apariciones, el 12 % de TODO lo que no
// reconocía, y son seis vitaminas. El aviso de «no reconocido» solo sirve si es
// raro: cuando sale a todas horas el usuario deja de leerlo, y entonces el
// ingrediente que de verdad falta se pierde en el ruido de fondo.
//
// POR QUÉ UNA REGLA Y NO CUATROCIENTAS ENTRADAS. Hay unos 350 números E en uso y
// salen nuevos. Meterlos como formas literales infla el índice, hay que
// mantenerlo y aun así el que salga mañana volvería a caer fuera.
//
// LO QUE HACE QUE ESTO SEA SEGURO ES EL ORDEN, no la regla. El bucle de arriba
// recorre el diccionario ENTERO antes de llegar aquí, y los seis polioles que
// tienen número están declarados con él: E420 sorbitol, E421 manitol, E953
// isomalt, E965 maltitol, E966 lactitol, E967 xilitol. Casan por su entrada, con
// su severidad y su nota, y esta regla no los ve nunca. `normalizarEtiqueta`
// convierte además el guion en espacio, así que «E-420» y «E 420» llegan igual.
// El test `fodmap-nombrado` lo comprueba en las dos direcciones.
const CODIGO_ADITIVO = /^e ?\d{3,4} ?[a-z]{0,3}$/;
const CODIGO_VITAMINA = /^(?:b ?(?:1|2|3|5|6|7|8|9|12)|d ?[23]|k ?[12])$/;

const ADITIVO_NUMERADO: Ingrediente = {
  id: 'aditivo-numerado',
  names: {
    es: 'Aditivo con número E', en: 'Numbered E additive', fr: 'Additif avec numéro E',
    de: 'Zusatzstoff mit E-Nummer', it: 'Additivo con numero E', pt: 'Aditivo com número E',
  },
  forms: [],
  fodmaps: [],
  severity: 'ok',
  // LA NOTA ACOTA, NO AFIRMA, Y ANTES AFIRMABA. Decía «este no es ninguno de
  // ellos» sobre CUALQUIER número E que no estuviera en la lista, y eso es una
  // afirmación categórica que una regla genérica no puede sostener: el E964
  // —jarabe de poliglicitol— es un poliol y salía con esa frase debajo. Ahora el
  // E964 tiene su entrada en el diccionario y esta frase dice lo único que se
  // puede decir sin dato: que no lo tengo. Es terreno de la guideline 1.4.1.
  note: {
    es: 'Los aditivos que aportan FODMAP son los polioles, y los conozco por su nombre y por su número. Este no está entre ellos: no tengo dato de que aporte FODMAP.',
    en: 'The additives that carry FODMAPs are the polyols, and I know them by name and by number. This one is not among them: I have no data that it carries FODMAPs.',
    fr: 'Les additifs qui apportent des FODMAP sont les polyols, et je les connais par leur nom et leur numéro. Celui-ci n’en fait pas partie : je n’ai pas de donnée indiquant qu’il en apporte.',
    de: 'Die Zusatzstoffe, die FODMAP liefern, sind die Polyole, und ich kenne sie mit Namen und mit Nummer. Dieser gehört nicht dazu: mir liegt kein Hinweis vor, dass er FODMAP liefert.',
    it: 'Gli additivi che apportano FODMAP sono i polioli, e li conosco per nome e per numero. Questo non è tra loro: non ho dati che apporti FODMAP.',
    pt: 'Os aditivos que trazem FODMAP são os polióis, e conheço-os pelo nome e pelo número. Este não está entre eles: não tenho dados de que traga FODMAP.',
  },
  sourceId: 'varney2017',
};

const VITAMINA: Ingrediente = {
  id: 'vitamina',
  names: {
    es: 'Vitamina', en: 'Vitamin', fr: 'Vitamine', de: 'Vitamin', it: 'Vitamina', pt: 'Vitamina',
  },
  forms: [],
  fodmaps: [],
  severity: 'ok',
  note: {
    es: 'Una vitamina añadida no aporta FODMAP: no es un carbohidrato fermentable.',
    en: 'An added vitamin carries no FODMAP: it is not a fermentable carbohydrate.',
    fr: 'Une vitamine ajoutée n\u2019apporte pas de FODMAP : ce n\u2019est pas un glucide fermentescible.',
    de: 'Ein zugesetztes Vitamin enthält kein FODMAP: es ist kein fermentierbares Kohlenhydrat.',
    it: 'Una vitamina aggiunta non apporta FODMAP: non è un carboidrato fermentabile.',
    pt: 'Uma vitamina adicionada não traz FODMAP: não é um hidrato de carbono fermentável.',
  },
  sourceId: 'varney2017',
};

/** El ingrediente sintético que le toca a un código, o null si no lo es. */
function codigoConocido(normalizado: string): Ingrediente | null {
  if (CODIGO_ADITIVO.test(normalizado)) return ADITIVO_NUMERADO;
  if (CODIGO_VITAMINA.test(normalizado)) return VITAMINA;
  return null;
}
/**
 * Opciones del analisis.
 *
 * `conPlatos` lo pone la pantalla cuando lo analizado sale de una FOTO DE UN
 * PLATO: entonces los 768 platos del catalogo entran en el indice, porque ahi
 * son lo que se fotografia. En una etiqueta no entran nunca, que es donde se
 * decidio sacarlos y sigue siendo correcto.
 */
export interface OpcionesScan {
  conPlatos?: boolean;
}

export function scanLabel(texto: string, opciones: OpcionesScan = {}): LabelResult {
  const trozos = trocear(texto);
  const entradas = indice(opciones.conPlatos);
  const vistos = new Set<string>();
  const hallazgos: LabelFinding[] = [];
  const noReconocidos: string[] = [];
  const descartados: { texto: string; motivo: MotivoDescarte }[] = [];
  // Un QUID fuera de (0,100] o una etiqueta cuyos porcentajes suman más de 100
  // no es un dato: es un dígito mal leído. Con dosis, mejor callar que inventar.
  const declarados = trozos.map((t) => t.porcentaje).filter((p): p is number => p !== null);
  const sumaCreible = declarados.reduce((a, b) => a + b, 0) <= 100.5;
  const porcentajeDe = (p: number | null) =>
    p !== null && p > 0 && p <= 100 && sumaCreible ? p : null;
  // La posicion cuenta INGREDIENTES, no trozos: la ley ordena la lista por peso
  // y una direccion web no ocupa un puesto en ese orden.
  let posicion = 0;

  trozos.forEach((trozo) => {
    const normalizado = normalizarEtiqueta(trozo.texto);
    // Se enmascara lo ya casado para que «cebolla» no vuelva a saltar dentro de
    // «cebolla en polvo». Como el índice va de larga a corta, la primera que
    // casa es la MÁS ESPECÍFICA y las suyas propias dejan de estar: por eso
    // «inulina de achicoria» no sale a la vez como inulina y como achicoria, y
    // «Milchsäure» no sale como leche.
    let restante = normalizado;
    const candidatos: { entrada: EntradaIndice; aproximada: boolean }[] = [];

    for (const entrada of entradas) {
      if (!apareceEn(restante, entrada.forma)) continue;
      if (estaNegado(normalizado, entrada)) continue;
      // Se pregunta ANTES de enmascarar: la aproximación se mide contra el
      // texto en el que la forma acaba de casar, no contra lo que quede
      // después. Aproximado = casó por subcadena dentro de otra palabra, la
      // única vía donde la etiqueta no escribe la forma tal cual.
      const aproximada =
        puedeIrDentro(entrada.forma) && !apareceComoPalabraOPlural(restante, entrada.forma);
      restante = enmascarar(restante, entrada.forma);
      candidatos.push({ entrada, aproximada });
      if (!/\p{L}/u.test(restante)) break;
    }

    if (candidatos.length === 0) {
      // Antes de darlo por perdido: puede ser un codigo, y un codigo si se
      // sabe lo que es aunque no este en el diccionario.
      const codigo = codigoConocido(normalizado);
      if (codigo) {
        hallazgos.push({
          id: codigo.id,
          origen: 'diccionario',
          nombre: codigo.names,
          fodmaps: [],
          severidad: 'ok',
          ingrediente: codigo,
          textoEncontrado: trozo.texto,
          posicion,
          // Un regex que casa el trozo entero no es una aproximación.
          confianza: 'exacta',
        });
        posicion += 1;
        return;
      }
      // Y antes de contarlo como fallo: puede no ser un ingrediente en absoluto.
      // Se pregunta AQUI, con el indice ya agotado, para que una regla de
      // descarte no pueda tapar nunca un alimento.
      const motivo = motivoDeDescarte(normalizado);
      if (motivo) {
        descartados.push({ texto: trozo.texto, motivo });
        return;
      }
      noReconocidos.push(trozo.texto);
      posicion += 1;
      return;
    }

    // UN TROZO DE LA LISTA ES UN INGREDIENTE. Pero el que vale no es siempre el
    // primero que casó: cuando quedan varios es porque casaron en PARTES
    // DISTINTAS del texto —«edulcorante: maltitol» son dos cosas— y ahí manda la
    // capa, no la longitud. Quedarse con el primero por largo daba «edulcorante,
    // sin FODMAP» tapando el maltitol, y «almidón» tapando el «de trigo».
    //
    // SALVO QUE EL TROZO SEA UNA LISTA ENTERA SIN SEPARAR, y entonces la regla
    // se da la vuelta: se devuelven todos. Pasa más de lo que parece —un OCR
    // sobre letra de cuerpo 6 se come las comas antes que las letras, y hay
    // quien teclea sin ellas— y el fallo era mudo y del lado peligroso: de
    // «harina de trigo agua levadura sal leche entera cebolla» salía UN
    // hallazgo y los otros cinco no se mencionaban siquiera.
    const palabras = normalizado.split(' ').filter(Boolean).length;
    const esListaSinSeparar = palabras >= MINIMO_PALABRAS_LISTA && candidatos.length > 1;

    // LA REGLA NO ES CUÁNTAS PALABRAS TIENE EL TROZO, ES QUIÉN APORTA FODMAP.
    //
    // El reduce de abajo existe para que «edulcorante» no tape al maltitol ni
    // «almidón» al «de trigo»: en los dos casos lo que sobra es un candidato SIN
    // FODMAP. Pero cuando los DOS aportan —«aroma de ajo», «leite e soja», «du
    // soja et du lait»— quedarse con uno era perder el otro EN SILENCIO: el
    // perdido no salía ni en los bloques ni en «no reconocidos», así que
    // `pareceMalLeido` tampoco avisaba, el marcador decía «0 altos» y la persona
    // veía una lectura limpia de un producto con ajo.
    //
    // Medido: 23 de las 342 etiquetas del banco perdían un high/watch por esto,
    // y ocho de ellas la soja. El peor caso en español es `scanLabel('aroma de
    // ajo')`, que devolvía solo «aroma natural» porque «aroma» tiene más letras.
    // ENTRA TAMBIÉN LO AMBIGUO —el «aroma natural», los «frutos de cáscara sin
    // especificar»—, que no es un «sin FODMAP»: es un «no se sabe». Callarlo
    // porque en el mismo trozo haya un alto pierde justo el aviso de que ahí
    // puede haber más, y medido sobre el banco es lo que deja este cambio en
    // CERO hallazgos perdidos contra el comportamiento anterior: sin ello, tres
    // etiquetas dejaban de nombrar el aroma y dos los frutos de cáscara.
    //
    // Lo que este filtro NO puede hacer es tumbar una negación del diccionario:
    // «kefir sin lactosa» casa el kéfir (ficha, alto) y el «sin lactosa» (capa
    // 1, ok), y quedarse con el que aporta contradecía la declaración impresa
    // en el envase. Eso se ataja donde toca —`estaNegado`, que ahora apaga lo
    // que solo aporta el FODMAP declarado ausente—, así que aquí el kéfir ya no
    // llega ni a ser candidato.
    const especificos = candidatos.filter((c) =>
      c.entrada.ingrediente
        ? c.entrada.ingrediente.severity !== 'ok'
        : c.entrada.food
          ? severidadDeAlimento(c.entrada.food) !== 'ok'
          : false
    );

    const elegidos = esListaSinSeparar
      ? candidatos
      : especificos.length > 0
        ? especificos
        : [
            candidatos.reduce((a, b) =>
              b.entrada.capa < a.entrada.capa ||
              (b.entrada.capa === a.entrada.capa && b.entrada.forma.length > a.entrada.forma.length)
                ? b
                : a
            ),
          ];

    // El porcentaje solo se adjunta cuando el trozo casó UNA sola cosa: si
    // casó varias («edulcorante: maltitol») o es una lista sin separar, no se
    // sabe de quién es el dato, y una dosis atribuida a ojo es peor que ninguna.
    // Se mira candidatos y no elegidos: fuera de una lista, elegidos siempre
    // queda en uno aunque el trozo hubiera casado dos cosas.
    const adjuntable = candidatos.length === 1;

    // Si un ingrediente sale dos veces, gana el primer hallazgo con su
    // confianza: un casado exacto posterior NO mejora a un aproximado
    // anterior. Aceptado: mejorar exigiría un segundo recorrido por trozo y
    // el caso es rarísimo.
    for (const c of elegidos) {
      const conQuid = adjuntable ? porcentajeDe(trozo.porcentaje) : null;
      const hallazgo = {
        ...aHallazgo(c.entrada, trozo.texto, posicion, c.aproximada ? 'aproximada' : 'exacta'),
        ...(conQuid !== null ? { porcentaje: conQuid } : {}),
      };
      const clave = `${hallazgo.origen}:${hallazgo.id}`;
      if (vistos.has(clave)) continue;
      vistos.add(clave);
      hallazgos.push(hallazgo);
    }
    posicion += 1;
  });

  const de = (s: SeveridadIngrediente) => hallazgos.filter((h) => h.severidad === s);

  return {
    altos: de('high'),
    vigilar: [...de('watch'), ...de('ambiguous')],
    sinProblema: de('ok'),
    noReconocidos,
    descartados,
    totalTrozos: trozos.length - descartados.length,
  };
}

/**
 * ¿Le sirve de algo esta lectura a quien está de pie en el pasillo?
 *
 * ES LA MISMA PREGUNTA QUE DECIDE EL AVISO, Y AHORA TAMBIÉN LA QUE DECIDE EL
 * COBRO. Eran dos umbrales distintos y entre ellos había una franja injusta:
 *
 *   · la cámara cobraba salvo que la lectura fuera «floja», que es el umbral de
 *     llamar al modelo —menos de tres reconocidos, o menos de un tercio—;
 *   · la pantalla decía «casi nada de este texto me suena, repite la foto más
 *     cerca» con `pareceMalLeido`, que salta pasada la mitad.
 *
 * Con diez trozos y seis sin reconocer, la app cobraba la lectura Y mandaba a
 * repetirla: dos de las cinco del día por un fallo que no es del usuario. La
 * ficha ya lo tenía fichado —«se probó a escribirlo en el propio aviso y se
 * quitó al comprobar que era mentira»— y esto es lo que lo arregla.
 *
 * Recorta antes de analizar porque es EXACTAMENTE lo que hace la pantalla de
 * resultados: sin recortar, la tabla nutricional y el aviso de trazas cuentan
 * como trozos y la proporción sale de otro texto que el que se juzga.
 */
export function lecturaAprovechable(texto: string, preferido?: Lang): boolean {
  return !pareceMalLeido(scanLabel(recortarIngredientes(texto, preferido).texto));
}
