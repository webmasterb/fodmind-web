import { FodmapType } from '@/data/types';
import { LabelFinding, LabelResult } from '@/lib/label-scan';
import { ToleranceProfile } from '@/lib/tolerance-model';

// Lo que esta app puede hacer con una etiqueta y las demás no.
//
// Fig y Spoonful escanean y devuelven una lista de ingredientes FODMAP. Eso lo
// copia cualquiera. Lo que ninguna de las dos tiene es el PERFIL DE TOLERANCIA:
// lo que este usuario concreto descubrió en sus propios retos. Esta app lo
// tiene, no lo cobra, y hasta ahora el lector era la única pantalla que lo
// ignoraba —la lista de alimentos y las fichas ya lo usaban—, así que la misma
// app se contradecía a sí misma: un yogur salía ajustado en un sitio y en rojo
// en el otro.
//
// LAS DOS DIRECCIONES, Y LA SEGUNDA IMPORTA MÁS. Bajar el tono de lo que ya
// toleras evita alarmas inútiles. Pero subirlo es lo que de verdad sirve: quien
// descubrió que los fructanos son su desencadenante quiere que la inulina le
// salte a la cara, arriba del todo, y no mezclada con los otros cinco grupos
// que le dan igual.
//
// DOS REGLAS QUE NO SE TOCAN:
//
//  1. UN INGREDIENTE DETECTADO NUNCA DESAPARECE. Cambia de grupo y de color,
//     jamás se esconde. Hay un test que suma los grupos y exige que cuadren con
//     lo que entró. Ocultar un FODMAP porque el perfil dice que se tolera sería
//     decidir por el usuario, y el perfil es una hipótesis, no un análisis.
//
//  2. ESTO NO DICE «PUEDES COMERLO». Le recuerda al usuario su propio
//     resultado: «lleva lactosa, y en tu reto la toleraste». Devolverle sus
//     datos no es una afirmación médica —es lo mismo que ya hacen las fichas de
//     alimento que Apple aprobó—, y la diferencia con un veredicto es justo la
//     que separa esta app de un rechazo por la guideline 1.4.1.

export type GrupoPersonal =
  /** algún FODMAP suyo salió como desencadenante en un reto */
  | 'desencadenante'
  /** alto en FODMAP, sin información personal que lo mueva */
  | 'alto'
  /** depende de la cantidad, o la etiqueta no dice qué hay dentro */
  | 'vigilar'
  /** alto en general, pero este usuario ya probó que lo tolera */
  | 'tolerado'
  /** conocido y sin FODMAP */
  | 'sinProblema';

export type Agrupado = Record<GrupoPersonal, LabelFinding[]>;

/** Los FODMAP de este hallazgo que el usuario marcó como desencadenantes. */
export function desencadenantesDe(f: LabelFinding, profile: ToleranceProfile): FodmapType[] {
  return f.fodmaps.filter((fm) => profile[fm] === 'trigger');
}

/** ¿Están TODOS sus FODMAP probados y tolerados? */
export function yaTolerado(f: LabelFinding, profile: ToleranceProfile): boolean {
  return f.fodmaps.length > 0 && f.fodmaps.every((fm) => profile[fm] === 'ok');
}

/**
 * Reparte los hallazgos según lo que este usuario ya sabe de su cuerpo.
 *
 * El orden de las reglas es el orden de la seguridad: un desencadenante manda
 * sobre cualquier otra consideración, incluso si el ingrediente solo estaba en
 * ámbar. Alguien que reacciona a los polioles quiere ver el sorbitol arriba,
 * aunque la etiqueta lo lleve en cantidad pequeña.
 */
export function agruparPorTolerancia(r: LabelResult, profile: ToleranceProfile): Agrupado {
  const grupos: Agrupado = {
    desencadenante: [],
    alto: [],
    vigilar: [],
    tolerado: [],
    sinProblema: [],
  };

  const repartir = (f: LabelFinding, porDefecto: GrupoPersonal) => {
    if (desencadenantesDe(f, profile).length > 0) grupos.desencadenante.push(f);
    else if (yaTolerado(f, profile)) grupos.tolerado.push(f);
    else grupos[porDefecto].push(f);
  };

  r.altos.forEach((f) => repartir(f, 'alto'));
  r.vigilar.forEach((f) => repartir(f, 'vigilar'));
  // Lo que no aporta FODMAP no tiene nada que ajustar: no hay tolerancia que
  // aplicar a la sal. Va entero a su sitio sin pasar por el reparto.
  grupos.sinProblema.push(...r.sinProblema);

  return grupos;
}

/** Cuántos hallazgos hay en total, para comprobar que no se pierde ninguno. */
export function totalAgrupado(g: Agrupado): number {
  return Object.values(g).reduce((n, lista) => n + lista.length, 0);
}

/**
 * Lo que la pantalla enseña en rojo: lo alto en general y lo que a ESTE usuario
 * le sienta mal, en un solo sitio.
 *
 * Sale del componente porque lo usaban tres cosas —el bloque, el marcador y lo
 * que se guarda en la despensa— y una de ellas se calculaba aparte.
 */
export function altosDe(g: Agrupado): LabelFinding[] {
  return [...g.desencadenante, ...g.alto];
}

/**
 * Las tres cifras de la cabecera del resultado.
 *
 * EXISTE PORQUE ESTABAN MEZCLADAS DOS FUENTES. Dos cifras se contaban sobre el
 * resultado CRUDO y la tercera sobre el ya repartido por tolerancia, así que la
 * cabecera se contradecía con los títulos que tiene justo debajo:
 *
 *   · un hallazgo de `vigilar` cuyos FODMAP el usuario ya probó aparecía en el
 *     bloque «Ya los toleras» y seguía contando en ámbar arriba;
 *   · uno con un desencadenante suyo se contaba DOS veces, en ámbar y en rojo.
 *
 * Con las tres saliendo del mismo reparto, la suma cuadra siempre con lo que
 * hay —lo comprueba un test contra `totalAgrupado`—, y eso es justo lo que la
 * versión anterior no podía prometer.
 */
export function marcadorDe(g: Agrupado): { sinProblema: number; vigilar: number; altos: number } {
  return {
    sinProblema: g.sinProblema.length,
    vigilar: g.vigilar.length,
    altos: altosDe(g).length,
  };
}
