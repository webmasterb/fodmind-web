// Tipos del modelo de datos de alimentos FODMAP.
//
// Base de datos propia, compilada de literatura científica pública. Esa frase
// llevaba aquí desde julio siendo una AFIRMACIÓN SIN RESPALDO: los 411
// alimentos entraron sin registrar de dónde salía ni uno solo de sus números,
// así que no había forma de contestar «¿esto es correcto?». El campo
// `verificacion` de abajo existe para que deje de ser una frase y pase a ser
// comprobable, alimento por alimento.
//
// Las reglas están en docs/PROTOCOLO-DATOS.md y NO se improvisan aquí.

export type Lang = 'es' | 'en' | 'fr' | 'de' | 'it' | 'pt';

export type LocalizedString = Record<Lang, string>;

export type FodmapLevel = 'low' | 'moderate' | 'high';

export type FodmapType =
  | 'fructans'   // fructanos (trigo, cebolla, ajo…)
  | 'gos'        // galacto-oligosacáridos (legumbres)
  | 'lactose'    // lactosa (lácteos)
  | 'fructose'   // exceso de fructosa (manzana, miel…)
  | 'sorbitol'   // poliol
  | 'mannitol';  // poliol

export type FoodCategory =
  | 'fruits'
  | 'vegetables'
  | 'grains'
  | 'legumes'
  | 'dairy'
  | 'protein'
  | 'nuts_seeds'
  | 'sweeteners'
  | 'beverages'
  | 'condiments'
  | 'snacks'
  | 'herbs_spices';

/**
 * De dónde sale un dato, según el §3 del protocolo.
 *
 *   A — medido: una fuente de mediciones lo da para este alimento y estado.
 *   B — derivado: calculado de una tabla oficial con una regla escrita, o
 *       cerrado por una de las cotas del §3.
 *   C — sin base: no hay fuente aceptada. La app NO afirma ese campo.
 */
export type GradoEvidencia = 'A' | 'B' | 'C';

/** Un campo con su procedencia. `fuente` es una clave de la lista cerrada. */
export interface Respaldo {
  grado: GradoEvidencia;
  /** clave de §2 del protocolo: 'muir2007', 'ciqual2020', 'liljebo2020'… */
  fuente?: string;
  /**
   * Para grado B: la regla aplicada, y el CÁLCULO con sus números.
   *
   * No es documentación: la guardia 6 lo relee para recalcular las cotas. La
   * cota de carbohidratos ya se escribió mal una vez —plana por 100 g cuando
   * los cortes son por ración— y con la ración puesta el huevo y el café
   * dejaban de cerrar. Sin el cálculo escrito, ese error no se detecta.
   */
  regla?: string;
}

/**
 * La procedencia de un alimento. Vive en el repo y NO se enseña en la ficha:
 * la app tiene su pantalla de fuentes en bloque, que es lo que pide Apple.
 */
export interface Verificacion {
  /** de dónde sale la lista `fodmaps` (incluida la lista vacía, que afirma ausencia) */
  fodmaps: Respaldo;
  /** de dónde sale `safeServingG` (incluido el null, que afirma «sin límite») */
  racion: Respaldo;
  /** fuentes que se contradicen y qué se hizo. El §4 manda: nunca el más permisivo. */
  conflictos?: string;
  /** quién firma la decisión. El protocolo exige persona, no herramienta. */
  decide: string;
  /** ISO corta. Las fuentes se corrigen con los años y hay que poder saber cuándo. */
  fecha: string;
}

export interface Food {
  /** id estable en inglés kebab-case, p.ej. "green-apple" */
  id: string;
  category: FoodCategory;
  /** Nivel FODMAP en una ración normal */
  level: FodmapLevel;
  /** FODMAPs presentes en cantidades relevantes (vacío si low sin límite) */
  fodmaps: FodmapType[];
  /**
   * Ración segura (baja en FODMAP). null = sin límite práctico conocido.
   * Formato: cantidad en g/ml + descripción breve, solo unidades ("60 g").
   */
  safeServingG: number | null;
  /**
   * Cuánto se come de esto en una comida de verdad, en la MISMA unidad que
   * `safeServingG`. Un plato de lentejas son 180 g; una manzana, 150 g; una
   * cucharadita de canela, 2 g.
   *
   * No es un dato de FODMAPs: es de consumo. Está aquí porque `level` se
   * calcula dividiendo uno entre otro (ver lib/level-model.ts), que es lo que
   * distingue «existe una ración baja de esto» de «puedo comerme un plato».
   */
  typicalServingG?: number;
  /** Unidad de la ración: gramos o mililitros */
  servingUnit?: 'g' | 'ml';
  names: LocalizedString;
  /** Nota breve opcional (aparece en el detalle) */
  note?: LocalizedString;
  /**
   * Las citas que respaldan lo que AFIRMA `note`, por id de `CITATIONS`
   * (src/data/sources.ts).
   *
   * `verificacion` respalda los NÚMEROS —`fodmaps` y `safeServingG`— y no dice
   * nada del texto de al lado, que es donde la ficha afirma mecanismos: «los
   * fructanos no son solubles en aceite», «al prensar el tofu se van los GOS
   * con el agua», «la destilación elimina los fructanos». El rechazo de agosto
   * fue exactamente eso, «información médica sin citas de las fuentes», y la
   * Guía se arregló añadiéndole `citas` (src/data/guide.ts) mientras la ficha
   * del alimento —la pantalla más visitada— se quedó como estaba.
   *
   * Las notas que solo dan una INSTRUCCIÓN —«mira la lista de ingredientes»—
   * no llevan ninguna: no afirman nada que haya que sostener. Y una cita nunca
   * se inventa para tapar el hueco: si no hay fuente para el mecanismo, la
   * nota se reescribe para no afirmarlo.
   */
  notaCitas?: string[];
  /**
   * La procedencia de este alimento. Opcional MIENTRAS DURA LA MIGRACIÓN, y
   * solo por eso: la guardia de `verificacion.test.ts` lleva un trinquete que
   * impide que los pendientes suban, así que el hueco se cierra y no se abre.
   *
   * Un alimento sin esto no está «mal»: está SIN VERIFICAR, que es distinto y
   * es lo que se está arreglando.
   */
  verificacion?: Verificacion;
}
