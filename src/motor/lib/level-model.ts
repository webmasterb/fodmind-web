import { Food, FodmapLevel, Lang, Respaldo } from '@/data/types';

// El semáforo, calculado y no opinado.
//
// EL PROBLEMA QUE ARREGLA. El nivel de cada alimento respondía a la pregunta de
// las tablas de laboratorio —«¿existe alguna ración baja en FODMAP de esto?»— y
// por eso las lentejas cocidas salían MODERADAS: existe, son 23 g. Pero la
// pregunta que se hace quien abre la app es otra: «si me como un plato de esto,
// ¿qué pasa?». Y ahí 23 g son una cucharada frente a los 180 g de un plato: el
// 13 %. Decir «moderado» era, con todas las letras, mentir.
//
// Así que el nivel se deriva del cociente entre las dos cantidades:
//
//     r = safeServingG / typicalServingG
//
// Cambia la pregunta sin cambiar la ciencia: el numerador sigue siendo el dato
// medido de siempre, y el denominador es cuánto se come de eso de verdad.
//
// Los cortes son «te cabe la ración entera» y «te cabe media», con un 10 % de
// holgura porque la ración habitual es una aproximación y un redondeo de 10 g no
// puede cambiar un color.
//
// LO QUE ESTO NO ES. Un nivel alto no es una prohibición, y la app no puede
// dejar que se lea así: el riesgo de restricción alimentaria está documentado en
// esta población (docs/ROADMAP.md) y multiplicar los rojos sin explicar el
// porqué empeoraría la app aunque el dato fuese mejor. Por eso la ficha enseña
// SIEMPRE las dos cifras —«23 g de una ración de 180 g»— y por eso solo los
// alimentos con ración segura CERO dicen «mejor evitar».
//
// EL CÁLCULO SOLO ENDURECE. El nivel publicado nunca es más suave que el que
// sale de estos números, pero sí puede ser más severo. Es deliberado y va en la
// dirección del encargo: al aplicarlo, la división quería BAJAR a verde el
// tomate concentrado, la sriracha, el tahini y el pesto, porque de esas cosas se
// come una cucharada y la cucharada entra. Pero son el vector clásico de
// acumulación invisible —el problema que esta app existe para resolver— y nadie
// mide una cucharada a ojo. Ante la duda, el color se queda donde estaba.

/**
 * A partir de este cociente, cabe la ración entera.
 *
 * 0,85 y no 0,9 por el tomate y el calabacín: su ración segura es 65 g y la
 * habitual 75, o sea 0,87, y con el corte en 0,9 se volvían ámbar las dos
 * hortalizas más icónicas del «esto SÍ puedes comer». Las dos cifras son
 * aproximadas —la segura viene de laboratorio con criterio conservador y la
 * habitual es un arquetipo—, así que una diferencia de 10 g entre ellas no
 * puede decidir un color. El corte alternativo era retocar el dato de
 * laboratorio, y ese no se toca sin una fuente que lo respalde.
 */
export const UMBRAL_BAJO = 0.85;
/** A partir de este cociente, cabe media ración. Por debajo, ni eso. */
export const UMBRAL_MODERADO = 0.45;

// Aquí vivía además `elPeor`, «el más severo de dos niveles»: no lo llamaba
// nadie, ni en producción ni en los tests. Una función exportada sin llamador
// se lee como contrato vigente y no lo es; el día que haga falta comparar dos
// niveles, `SEVERIDAD` sigue aquí.
const SEVERIDAD: Record<FodmapLevel, number> = { low: 0, moderate: 1, high: 2 };

/** ¿Es `nivel` al menos tan severo como `minimo`? */
export function almenosTanSevero(nivel: FodmapLevel, minimo: FodmapLevel): boolean {
  return SEVERIDAD[nivel] >= SEVERIDAD[minimo];
}

/**
 * Si `safeServingG: null` significa «no hay límite práctico» (true) o «no se ha
 * podido fijar» (false).
 *
 * El mismo null vale para las dos cosas y solo el grado de la ración las
 * separa. Vive aquí, y no repetido en cada pantalla, porque la lista de
 * alimentos decía «sin límite conocido» del kombu mientras su ficha decía
 * «ración baja no establecida»: dos mensajes contrarios sobre el mismo
 * alimento según por dónde se entrase, en 43 alimentos.
 */
export function sinLimitePractico(food: Food): boolean {
  return food.safeServingG === null && food.verificacion?.racion.grado !== 'C';
}

/**
 * Si la lista de FODMAP vacía significa «se midió y no hay» (true) o «nadie lo
 * ha medido» (false).
 *
 * Es la hermana de `sinLimitePractico` y nace del mismo fallo por la otra
 * puerta. Aquella arregló la RACIÓN —el ∞ ya no sale sin grado que lo
 * respalde— y la lista se quedó como estaba: `fodmaps: []` pintaba un tic
 * verde y «sin FODMAPs relevantes» sin mirar nada. Pero una lista vacía tiene
 * los mismos dos significados que el `null` de la ración, y el grado los
 * separa igual.
 *
 * El limón es el caso literal: lista vacía, y su propia regla dice «falta una
 * medicion de fructanos». La ficha decía a la vez «sin FODMAPs relevantes» y
 * «nadie ha publicado una medición de este alimento», dos líneas de la misma
 * tarjeta contradiciéndose. Son 191 alimentos con lista vacía en grado C, y en
 * 126 de ellos las dos frases salían juntas.
 *
 * Sin `verificacion` tampoco está medido: no hay nada detrás que lo sostenga.
 */
export function ausenciaMedida(food: Food): boolean {
  return !!food.verificacion && food.verificacion.fodmaps.grado !== 'C';
}

/**
 * Si un número de ración publicado tiene alguien detrás. `false` cuando la
 * ración es un grado C con cifra: el número viene de la carga de julio, nadie
 * lo ha medido, y la lista lo enseñaba como «hasta 65 g» con la misma letra que
 * un dato de laboratorio. La ficha ya decía «nadie ha publicado una medición»;
 * la lista no decía nada, y es donde se decide qué comer.
 */
export function racionSinFuente(food: Food): boolean {
  return (
    food.safeServingG !== null &&
    food.safeServingG > 0 &&
    (!food.verificacion || food.verificacion.racion.grado === 'C')
  );
}

/**
 * De dónde sale cada uno de los DOS datos que la ficha enseña, por separado.
 *
 * LA TERCERA PUERTA DEL MISMO FALLO. `sinLimitePractico` cerró el ∞ y
 * `ausenciaMedida` cerró la lista vacía; la línea de procedencia se quedó
 * mirando solo el grado de la LISTA y se pintaba debajo del número de 56 pt,
 * que es el otro campo. En 63 de los 1.843 los dos grados no coinciden: 39
 * firmaban «medido en laboratorio» o «calculado a partir de tablas oficiales»
 * sobre una cifra que nadie midió —nata para montar 33,5 g, leche desnatada
 * 21 g, leche condensada 9,5 g— y 21 decían «nadie ha publicado una medición»
 * sobre una cifra que sí sale de tablas —queso crema, clementina, polenta—.
 *
 * La misma escalera para los dos campos: grado C, nadie lo ha medido; sin
 * fuente nombrable, no hace falta medirlo —el agua no tiene FODMAPs porque no
 * tiene carbohidrato—; grado A, laboratorio; grado B, tablas.
 *
 * `nombreFuente` se pasa desde fuera (`NOMBRE_FUENTE` de `data-credits`) para
 * que el modelo no dependa de la capa de datos de créditos. El token
 * `composicion` NO está ahí a propósito: es lo que hace salir
 * `provenanceComposition` en los ~350 alimentos tipo agua, ginebra o vodka.
 */
export function procedencia(
  food: Food,
  nombreFuente: Record<string, string>
): {
  racion: { texto: ClaveProcedencia; fuentes: string[] };
  lista: { texto: ClaveProcedencia; fuentes: string[] };
} {
  const mitad = (respaldo?: Respaldo) => {
    // SIN VERIFICACIÓN NO SE DICE «POR COMPOSICIÓN». Esa rama afirma algo —no
    // hace falta medirlo, el agua no tiene carbohidrato— y un alimento que no
    // trae respaldo ninguno no sostiene esa afirmación: no es que no haga
    // falta medirlo, es que no hay nada detrás. Es el mismo criterio que
    // `ausenciaMedida` («sin `verificacion` tampoco está medido») y que
    // `racionSinFuente`, y sin esta línea las tres hermanas contestaban cosas
    // distintas al mismo caso. Hoy los 1.843 traen `verificacion`, así que no
    // cambia ninguna ficha: cierra la puerta para el día que entre uno sin ella.
    if (!respaldo) return { texto: 'provenanceC' as ClaveProcedencia, fuentes: [] as string[] };
    const fuentes = (respaldo.fuente ?? '')
      .split(' + ')
      .map((f) => nombreFuente[f.trim()])
      .filter((n): n is string => !!n);
    const texto: ClaveProcedencia =
      respaldo.grado === 'C'
        ? 'provenanceC'
        : fuentes.length === 0
          ? 'provenanceComposition'
          : respaldo.grado === 'A'
            ? 'provenanceA'
            : 'provenanceB';
    return { texto, fuentes };
  };
  return {
    racion: mitad(food.verificacion?.racion),
    lista: mitad(food.verificacion?.fodmaps),
  };
}

/**
 * Las cuatro claves de i18n que puede devolver `procedencia`. Escritas aquí y
 * no importadas de `@/i18n/strings` porque el modelo no depende del i18n: el
 * tipo cierra el juego igual y la guardia de `verificacion.test.ts` comprueba
 * que las cuatro existan de verdad.
 */
export type ClaveProcedencia =
  | 'provenanceA'
  | 'provenanceB'
  | 'provenanceC'
  | 'provenanceComposition';

/**
 * Si los FODMAP de la lista hay que dosificarlos de verdad, o si están por
 * debajo de su corte en una ración habitual.
 *
 * La lista `fodmaps` nombra las familias MEDIDAS en el alimento, y desde que la
 * verificación las escribe eso incluye al arroz blanco (fructanos y GOS con
 * una ración segura de 1.266 g) y al tomate (fructanos, 222 g). Están, y en una
 * ración no llegan al corte. El perfil personal miraba solo la lista: a quien
 * marcaba los fructanos como desencadenante, la app le ponía el arroz en rojo
 * «para ti» y se lo quitaba del filtro de bajos. Eran 82 alimentos verdes con
 * lista no vacía, 72 de ellos con la ración segura por encima de la habitual.
 *
 * Un FODMAP que no restringe la ración no puede subir el color por sí solo.
 */
export function fodmapsDosificables(food: Food): boolean {
  if (food.fodmaps.length === 0) return false;
  if (food.safeServingG === 0) return true;
  // Sin límite y verde es «sin límite práctico probado»; sin límite y rojo es
  // «no se ha podido fijar», y ahí sí hay algo que dosificar aunque no se sepa
  // cuánto.
  if (food.safeServingG === null) return !sinLimitePractico(food);
  return racionRestrictiva(food);
}

/**
 * Si la ración segura RESTRINGE de verdad, o sea si es menor que la habitual.
 *
 * Importa porque la lista de FODMAP vacía significa dos cosas distintas según
 * este número. Con `safeServingG` mayor o igual que la habitual, la lista vacía
 * es lo que parece —no hay nada que dosificar— y el número es la cantidad que
 * se midió, no un techo: el cheddar dice 40 g de una ración de 30. Pero con una
 * ración segura MENOR, alguien puso ahí un límite: el pomelo dice 90 g de 150,
 * el sésamo 11 g de 15, el taro 75 g de 150. Eso no es un dato de laboratorio,
 * es el tamaño por debajo del cual el alimento no cruza su corte.
 *
 * Quince alimentos estaban diciendo «sin FODMAPs relevantes» y «no pases de
 * dos tercios de una ración» a la vez, y salían verdes.
 *
 * DEVUELVE UN PREDICADO DE TIPO Y NO UN `boolean` A SECAS. Detrás de cada
 * llamada venían aserciones no nulas —`food.typicalServingG!`,
 * `food.safeServingG!`— sobre gramos que se DIVIDEN y se enseñan: el QUID de
 * una etiqueta y las barras de carga del plato. La garantía la daba un
 * comentario; ahora la da el compilador, y el día que alguien afloje una de las
 * cinco condiciones el `NaN` sale en `tsc` y no en una pantalla de dosis.
 */
export function racionRestrictiva(
  food: Food
): food is Food & { safeServingG: number; typicalServingG: number } {
  return (
    food.safeServingG !== null &&
    food.safeServingG > 0 &&
    !!food.typicalServingG &&
    food.typicalServingG > 0 &&
    food.safeServingG < food.typicalServingG
  );
}

/**
 * El nivel que le corresponde a un alimento por sus propios números.
 *
 * Las tres guardas van ANTES de la división y mandan sobre ella. Sin la primera
 * —la que más importa— la regla se comería la lista verde: hay ~90 alimentos sin
 * FODMAPs relevantes cuyo `safeServingG` no es un techo sino la cantidad que se
 * midió en el laboratorio (cheddar 40 g, nueces 30 g, tofu 170 g). Dividir eso
 * inventaría ámbares a partir de un número que no significa «límite».
 */
export function nivelDerivado(food: Food): FodmapLevel {
  // 1. Sin FODMAPs que dosificar no hay nada que graduar. Aquí vive el mensaje
  //    más útil de toda la dieta: el aceite de ajo es verde aunque el ajo sea
  //    rojo, porque los fructanos no son liposolubles y no pasan al aceite.
  //    Salvo que la ración segura RESTRINJA: ahí hay algo que dosificar aunque
  //    no se sepa qué, y el color no puede ser más verde que el número que la
  //    propia ficha enseña.
  if (food.fodmaps.length === 0 && !racionRestrictiva(food)) return 'low';

  // 2. Sin límite. Esto era una sola regla y esconde DOS cosas distintas, y la
  //    diferencia la dice el grado de la ración:
  //
  //    · Grado A o B: el límite está PROBADO y resulta que no hay límite
  //      práctico. Para llegar al corte harían falta diez raciones —el
  //      manchego pedía diez kilos—. Eso es bajo, y era el único caso que esta
  //      regla contemplaba.
  //
  //    · Grado C: el límite NO SE HA PODIDO FIJAR porque falta alguna molécula
  //      por resolver. Eso no es «no hay límite», es «no lo sabemos», y pintarlo
  //      de verde es exactamente la mentira que todo este trabajo evita. Lo que
  //      sí se sabe manda: la lista de FODMAP solo lleva familias MEDIDAS por
  //      encima de su corte en una ración habitual, así que si hay lista, hay un
  //      FODMAP demostrado. El kombu seco tiene 23,4 g/100 g de manitol, que en
  //      su ración de 5 g son 1,17 g contra un corte de 0,20; su sorbitol no lo
  //      mide nadie, y sin él no hay límite que dar — pero de bajo no tiene nada.
  //
  //    Se pinta alto y no ámbar a propósito: sin límite no hay proporción que
  //    calcular, y entre quedarse corto y pasarse, este avisa.
  if (food.safeServingG === null) return sinLimitePractico(food) ? 'low' : 'high';

  // 3. Ración segura cero: es el único grupo que la ficha llama «evitar».
  if (food.safeServingG === 0) return 'high';

  // Sin ración habitual no se inventa un color: se conserva el que ya tenía.
  // El test de integridad impide que esto ocurra en los datos publicados.
  if (!food.typicalServingG || food.typicalServingG <= 0) return food.level;

  const r = food.safeServingG / food.typicalServingG;
  if (r >= UMBRAL_BAJO) return 'low';
  if (r >= UMBRAL_MODERADO) return 'moderate';
  return 'high';
}

/**
 * Qué fracción de una ración habitual se puede comer, de 0 a 1. `null` cuando
 * la pregunta no aplica (sin FODMAPs, sin límite, o sin ración habitual).
 *
 * Es lo que la ficha convertía en «puedes tomar 23 g de los 180 g de un plato»:
 * la frase que impide que un rojo se lea como una prohibición.
 *
 * HOY NO LA LLAMA NADIE, Y ESO ESTÁ BIEN. Esa proporción la dice ahora
 * `racionEnPalabras` —«como dos tercios de una ración normal»—, que se lee sin
 * dividir; tenerla además en porcentaje contaba la misma cantidad tres veces
 * en la misma pantalla. No se borra porque `docs/ESCANER-IDEAS.md` la nombra
 * como pieza reutilizable del QUID de etiquetas, y porque su guardia sobre los
 * alimentos sin FODMAP no es la misma que la de `racionEnPalabras`: no son
 * intercambiables aunque las dos dividan lo mismo.
 */
export function fraccionDeRacion(food: Food): number | null {
  if (food.safeServingG === null) return null;
  // La fracción se calla sin FODMAPs, por la misma razón y con la misma
  // excepción que el nivel: si la ración segura restringe, la pregunta sí
  // aplica y esconderla dejaría el ámbar sin explicación.
  if (food.fodmaps.length === 0 && !racionRestrictiva(food)) return null;
  if (!food.typicalServingG || food.typicalServingG <= 0) return null;
  return food.safeServingG / food.typicalServingG;
}

/**
 * El QUID convertido a gramos de UNA ración típica de la ficha, y de qué lado
 * del límite cae. `null` cuando la comparación no aplica: sin ración típica,
 * sin ración segura positiva, o cuando la segura no restringe — ahí el número
 * es lo que se midió, no un techo, y comparar contra él inventaría un límite.
 * La ración típica es de la FICHA GENÉRICA, no del producto: la frase de
 * pantalla lo dice («de la ficha») y este contrato lo mantiene. El empate
 * exacto es «debajo»: no supera el límite.
 */
export function quidEnRacion(
  food: Food,
  porcentaje: number
): { gramos: number; lado: 'debajo' | 'encima' } | null {
  // Sin los dos `!` que había aquí: `racionRestrictiva` estrecha el tipo y es
  // ella la que garantiza que los dos números existen y son positivos.
  if (!racionRestrictiva(food)) return null;
  const gramos = (food.typicalServingG * porcentaje) / 100;
  return { gramos, lado: gramos > food.safeServingG ? 'encima' : 'debajo' };
}

/**
 * Un número tal y como lo escribe cada idioma.
 *
 * POR QUÉ EXISTE. Hasta el 24-ago todas las raciones seguras de la app eran
 * enteras, así que interpolar el número en crudo no se notaba. Al derivar las
 * raciones de mediciones aparecieron los decimales —la aguaturma tiene 1,6 g—
 * y JavaScript los escribe SIEMPRE con punto, en los seis idiomas. «hasta 1.6
 * g» en español está mal escrito, y en una ficha que habla de gramos el punto
 * decimal se puede leer como separador de millares.
 *
 * Es la misma trampa que este proyecto ya pagó una vez con `toFixed`.
 */
const SEPARADOR_COMA: readonly Lang[] = ['es', 'fr', 'de', 'it', 'pt'];

/**
 * La holgura del coma flotante al bajar al escalón de abajo.
 *
 * `Math.floor` es implacable y el binario no guarda 2,9: guarda 2,899999…, que
 * al multiplicar por 10 da 28,999999999999996 y cae a 28. Sin esta holgura,
 * bajar el redondeo convertía «hasta 2,9 g» en «hasta 2,8 g» por un decimal
 * que no existe en el dato. Es 1e-9 porque el error del doble en estas
 * magnitudes es de orden 1e-12: coge el redondeo del binario y no toca ninguna
 * medición de verdad.
 */
const HOLGURA = 1e-9;

export function numero(valor: number, lang: Lang): string {
  // LA PRECISIÓN SE AJUSTA AL TAMAÑO, y antes era fija en un decimal. El
  // argumento que ya estaba escrito aquí —«3,47 g de manzana finge una
  // exactitud que la medición no tiene»— vale igual para el otro extremo:
  // «hasta 333,3 g de uvas» finge la misma exactitud y además obliga a leer
  // cinco cifras para una ración que nadie va a pesar al décimo de gramo.
  //
  // Tres tramos, por lo que de verdad se distingue en una cocina:
  //   · por debajo de 10, el decimal importa   → 2,5 g
  //   · de 10 a 99, el gramo entero basta      → 23 g
  //   · de 100 en adelante, la decena          → 330 g
  //
  // Y SE BAJA AL ESCALÓN, NUNCA SE SUBE. Redondeaba al más cercano, que para
  // un número cualquiera da igual pero aquí no: casi todo lo que pasa por esta
  // función es `safeServingG`, y eso no es una medición cualquiera, es un
  // TECHO. Al subir al escalón de arriba, la lista y la ficha publicaban
  // «hasta N g» con una N MAYOR que el límite que dice la fuente: 61 de los 378
  // alimentos con ración numérica. La carambola, la leche de avena y el zumo de
  // naranja decían 130 con 125 reales; el yogur de cabra 130 con 126,6;
  // el hojaldre 140 con 136,4; la leche de vaca 19 con 18,5; el pan de trigo 25
  // con 24,5. Quien siguiera la cifra de pantalla se pasaba del corte que la
  // propia app defiende, y en una app de salud eso es publicar un número que
  // no se puede sostener.
  //
  // Bajar no cuesta nada donde el número NO es un techo —el porcentaje de una
  // etiqueta, la media del diario—: el tramo ya declara que el dato no da para
  // más precisión que ésa, así que dentro de un escalón las dos direcciones son
  // igual de ciertas. Donde SÍ es un techo, solo una lo es.
  //
  // No cambia ningún dato: solo cómo se escribe. El corte sigue siendo el que
  // dice la fuente, y quien quiera el número exacto lo tiene en las fuentes.
  const redondeado =
    valor < 10
      ? Math.floor(valor * 10 + HOLGURA) / 10
      : valor < 100
        ? Math.floor(valor + HOLGURA)
        : Math.floor(valor / 10 + HOLGURA) * 10;
  const texto = String(redondeado);
  return SEPARADOR_COMA.includes(lang) ? texto.replace('.', ',') : texto;
}
