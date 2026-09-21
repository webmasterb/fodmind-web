import { challengeById, challengePlans } from '@/data/challenges';
import { FodmapType } from '@/data/types';

// Modelo puro del plan de reintroducción: estado y transiciones sin React
// ni almacenamiento, para poder razonar (y testear) la lógica clínica aislada.

export type Tolerance = 'unknown' | 'ok' | 'moderate' | 'trigger';

export type ToleranceProfile = Record<FodmapType, Tolerance>;

export interface ActiveChallenge {
  challengeId: string;
  /** día actual del reto: 1-3 */
  day: 1 | 2 | 3;
  startedAt: number;
  /**
   * Cuándo se puso el día actual. Es lo que impide hacer los tres días de un
   * reto en el mismo minuto — ver `puedeAvanzarDia`.
   *
   * Opcional porque los retos empezados con una versión anterior no lo traen, y
   * a esos no se les puede bloquear el avance a mitad de camino.
   */
  dayAt?: number;
  /**
   * Días que la persona ha estado parada a mitad de reto (un viaje, un
   * resfriado), sin comer la dosis. Corren la fecha de la siguiente dosis y las
   * fechas estimadas de los retos que faltan, que es lo que IBS Pal llama
   * «adjust schedule». Ausente = 0.
   */
  diasParados?: number;
}

/** Duraciones de eliminación que se ofrecen, en semanas. Todas dentro de las 2-6 que cita `aga2022`. */
export const SEMANAS_OPCIONES = [2, 3, 4, 6] as const;
export type SemanasEliminacion = (typeof SEMANAS_OPCIONES)[number];

export interface PlanState {
  /** veredicto (hipótesis) por reto completado, por id de reto */
  results: Record<string, Tolerance>;
  /**
   * Cuándo se cerró cada reto, por id.
   *
   * Sin esto la app no podía acompañar su propia promesa: el artículo de fase 3
   * dice «vuelve a probarlos cada 3-6 meses» y la pantalla no sabía cuándo se
   * hizo ninguno, así que la frase era un adorno. Los estados guardados con
   * versiones anteriores no lo traen: `parseStoredState` les pone una fecha
   * estimada y la marca en `resultsAtAprox`, porque sin ella toda la fase 3
   * quedaba muerta justo para el único que la necesita.
   */
  resultsAt: Record<string, number>;
  /**
   * Los ids cuya fecha de cierre es una ESTIMACIÓN puesta al migrar, no el día
   * real en que se cerró el reto.
   *
   * TODA LA FASE 3 ESTABA MUERTA PARA EL ÚNICO QUE LA NECESITA. `resultsAt`
   * empezó a escribirse con esta versión, así que quien terminó sus ocho retos
   * hace cuatro meses tenía el mapa vacío: `tocaRepetir` exige una fecha y
   * devolvía `false` para siempre —la etiqueta «toca repetirlo» no aparecía
   * nunca— y la línea «Hecho el {fecha}» tampoco se pintaba. La app le prometía
   * «repítelos cada 3-6 meses» a quien ya no podía verlo.
   *
   * Se estima con `lastEndedAt`, que sí es una fecha real, y se marca aquí para
   * que la pantalla diga «Hecho ANTES del {fecha}» y no invente un día exacto.
   */
  resultsAtAprox: Record<string, true>;
  /** día máximo tolerado por reto (0-3); 3 = reto completo sin síntomas */
  thresholds: Record<string, number>;
  /** ajustes manuales del usuario por grupo FODMAP (ganan a los retos) */
  overrides: Partial<Record<FodmapType, Tolerance>>;
  active: ActiveChallenge | null;
  /** fin del último reto (para el descanso entre retos) */
  lastEndedAt: number | null;
  /** inicio de la fase de eliminación (temporizador 2-6 semanas) */
  eliminationStartedAt: number | null;
  /**
   * Cuándo se declaró terminada la fase de eliminación.
   *
   * `eliminationStartedAt` volvía a `null` y la tarjeta perdía la memoria: a
   * quien acababa de terminar cuatro semanas de dieta se le ofrecía otra vez,
   * en acento y en el sitio más visible, «Hoy empiezo la eliminación».
   */
  eliminationEndedAt: number | null;
  /**
   * Cuántas semanas eligió para la eliminación. Ausente = las 4 de
   * `SEMANAS_ELIMINACION` (`lib/perfil.ts`), que es lo que firmó todo el que
   * empezó antes de poder elegir.
   */
  eliminationWeeks?: SemanasEliminacion;
}

export const EMPTY_PROFILE: ToleranceProfile = {
  fructans: 'unknown',
  gos: 'unknown',
  lactose: 'unknown',
  fructose: 'unknown',
  sorbitol: 'unknown',
  mannitol: 'unknown',
};

/** Descanso mínimo entre retos (el protocolo pide 2-3 días o hasta calmar síntomas) */
export const WASHOUT_MS = 2 * 24 * 60 * 60 * 1000;

export const EMPTY_STATE: PlanState = {
  results: {},
  resultsAt: {},
  resultsAtAprox: {},
  thresholds: {},
  overrides: {},
  active: null,
  lastEndedAt: null,
  eliminationStartedAt: null,
  eliminationEndedAt: null,
};

/**
 * Cuándo vuelve a tener sentido repetir un reto.
 *
 * Seis meses es el borde del «cada 3-6 meses» del artículo de fase 3: se coge
 * el largo a propósito, porque avisar antes empuja a rehacer trabajo que
 * todavía vale.
 */
export const REPETIR_MS = 180 * 24 * 60 * 60 * 1000;

const SEVERITY: Record<Tolerance, number> = { unknown: 0, ok: 1, moderate: 2, trigger: 3 };

const TOLERANCIAS: readonly Tolerance[] = ['unknown', 'ok', 'moderate', 'trigger'];

function esTolerancia(v: unknown): v is Tolerance {
  return typeof v === 'string' && (TOLERANCIAS as readonly string[]).includes(v);
}

function numeroFinito(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

/** Un `Record` plano de lo guardado, o `{}` si lo que hay no es un objeto. */
function comoMapa(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

/**
 * Lo guardado, filtrado a los retos que ESTA versión conoce.
 *
 * Renombrar el id de un reto —o importar un fichero de otra versión— dejaba
 * resultados colgando de retos inexistentes, y `challenges.ts:31` ya avisaba de
 * ello sin que nadie protegiera el caso.
 */
function soloRetosQueExisten<T>(m: unknown, valido: (v: unknown) => v is T): Record<string, T> {
  const limpio: Record<string, T> = {};
  for (const [id, v] of Object.entries(comoMapa(m))) {
    if (challengeById.has(id) && valido(v)) limpio[id] = v;
  }
  return limpio;
}

/**
 * Lo guardado se cree, pero no a ciegas.
 *
 * UN RETO ACTIVO QUE ESTA VERSIÓN NO CONOCE DEJABA «MI PLAN» SIN SALIDA: la
 * tarjeta del reto pide `active && activePlan` para pintarse, y el botón de
 * abandonar vive dentro de esa tarjeta. Con un id huérfano no se pintaba nada y
 * la mitad clínica de la app se quedaba atascada para siempre, sin ningún botón
 * que lo deshiciera. Lo mismo con un `day: 99`, que no es ninguno de los tres.
 *
 * Aquí se poda, no se repara: lo que no encaja se va y el resto se conserva.
 * Es el mismo criterio de `leerPerfil` en `perfil.ts`, que es el único almacén
 * de la app que ya validaba campo a campo.
 */
export function sanearPlanState(x: unknown): PlanState {
  const crudo = comoMapa(x);
  const activo = comoMapa(crudo.active);
  const dia = activo.day;
  const activeValido =
    typeof activo.challengeId === 'string' &&
    challengeById.has(activo.challengeId) &&
    (dia === 1 || dia === 2 || dia === 3) &&
    numeroFinito(activo.startedAt);
  return {
    results: soloRetosQueExisten(crudo.results, esTolerancia),
    resultsAt: soloRetosQueExisten(crudo.resultsAt, numeroFinito),
    resultsAtAprox: soloRetosQueExisten(
      crudo.resultsAtAprox,
      (v): v is true => v === true
    ),
    thresholds: soloRetosQueExisten(
      crudo.thresholds,
      (v): v is number => numeroFinito(v) && Number.isInteger(v) && v >= 0 && v <= 3
    ),
    overrides: Object.fromEntries(
      Object.entries(comoMapa(crudo.overrides)).filter(
        // `hasOwnProperty` y no `in`: con `in`, un fichero importado con un
        // override llamado `toString` o `constructor` pasaba el filtro —están
        // en la cadena de prototipos de cualquier objeto— y `effectiveProfile`
        // lo copiaba encima del perfil. Este saneador existe justo para lo que
        // llega de fuera.
        ([fm, v]) =>
          Object.prototype.hasOwnProperty.call(EMPTY_PROFILE, fm) && esTolerancia(v) && v !== 'unknown'
      )
    ) as Partial<Record<FodmapType, Tolerance>>,
    active: activeValido
      ? {
          challengeId: activo.challengeId as string,
          day: dia as 1 | 2 | 3,
          startedAt: activo.startedAt as number,
          ...(numeroFinito(activo.dayAt) ? { dayAt: activo.dayAt } : {}),
          ...(numeroFinito(activo.diasParados) && activo.diasParados > 0
            ? { diasParados: Math.min(MAX_DIAS_PARADOS, Math.floor(activo.diasParados)) }
            : {}),
        }
      : null,
    lastEndedAt: numeroFinito(crudo.lastEndedAt) ? crudo.lastEndedAt : null,
    eliminationStartedAt: numeroFinito(crudo.eliminationStartedAt) ? crudo.eliminationStartedAt : null,
    eliminationEndedAt: numeroFinito(crudo.eliminationEndedAt) ? crudo.eliminationEndedAt : null,
    ...(esSemanas(crudo.eliminationWeeks) ? { eliminationWeeks: crudo.eliminationWeeks } : {}),
  };
}

function esSemanas(v: unknown): v is SemanasEliminacion {
  return (SEMANAS_OPCIONES as readonly number[]).includes(v as number);
}

/** Tope de la pausa: más de un mes parado a mitad de reto es empezar de nuevo, no ajustar fechas. */
export const MAX_DIAS_PARADOS = 30;
const DIA_MS = 24 * 3600_000;

export function withDiasParados(state: PlanState, dias: number): PlanState {
  if (!state.active) return state;
  const n = Math.max(0, Math.min(MAX_DIAS_PARADOS, Math.floor(dias)));
  const { diasParados: _fuera, ...resto } = state.active;
  void _fuera;
  return { ...state, active: n > 0 ? { ...resto, diasParados: n } : resto };
}

export function withEliminationWeeks(state: PlanState, semanas: SemanasEliminacion): PlanState {
  return { ...state, eliminationWeeks: semanas };
}

/** Un reto son tres días de dosis; entre dos retos, el lavado. */
const RETO_MS = 3 * DIA_MS;

/**
 * Cuándo podría empezar cada reto que falta, en el orden de la lista: el
 * que está en curso termina, pasa el lavado, y de ahí en adelante cada reto
 * ocupa tres días más el lavado. Es una estimación —«~14 sept»— para poder
 * decir «sigue evitando esto hasta entonces», no una cita.
 */
/**
 * Cuándo termina la fase de eliminación que está en marcha, o null si no hay
 * ninguna. Las semanas son las elegidas o las cuatro de `SEMANAS_ELIMINACION`
 * (lib/perfil.ts), que aquí no se importa para no cerrar un ciclo.
 */
const SEMANAS_POR_DEFECTO: SemanasEliminacion = 4;
export function finDeEliminacion(state: PlanState): number | null {
  if (state.eliminationStartedAt === null || state.eliminationEndedAt !== null) return null;
  return state.eliminationStartedAt + (state.eliminationWeeks ?? SEMANAS_POR_DEFECTO) * 7 * DIA_MS;
}

export function fechasEstimadas(state: PlanState, now: number): Map<string, number> {
  let base: number;
  if (state.active) {
    const desde = (state.active.dayAt ?? state.active.startedAt) + (state.active.diasParados ?? 0) * DIA_MS;
    base = Math.max(now, desde + (4 - state.active.day) * DIA_MS) + WASHOUT_MS;
  } else {
    base = Math.max(now, (state.lastEndedAt ?? 0) + WASHOUT_MS);
  }
  // CON LA ELIMINACIÓN EN MARCHA, NINGÚN RETO ANTES DE QUE ACABE (19-sep).
  // El día 1 de la fase, «Lo que queda» ponía el primer reto para hoy mismo
  // y el segundo para dentro de cinco días, cuando el onboarding acababa de
  // decir «de uno en uno, a partir de la semana 5». Se contaba desde hoy en
  // vez de desde el fin de la fase.
  const fin = finDeEliminacion(state);
  if (fin !== null) base = Math.max(base, fin);
  const fechas = new Map<string, number>();
  for (const plan of challengePlans) {
    if (state.results[plan.id] !== undefined || state.active?.challengeId === plan.id) continue;
    fechas.set(plan.id, base);
    base += RETO_MS + WASHOUT_MS;
  }
  return fechas;
}

/**
 * Los retos cerrados antes de que existiera `resultsAt` reciben una fecha
 * estimada, marcada como tal. Ver `PlanState.resultsAtAprox`.
 */
function conFechasEstimadas(s: PlanState, now: number): PlanState {
  const faltan = Object.keys(s.results).filter((id) => s.resultsAt[id] === undefined);
  if (faltan.length === 0) return s;
  const resultsAt = { ...s.resultsAt };
  const aprox: Record<string, true> = { ...s.resultsAtAprox };
  for (const id of faltan) {
    // `lastEndedAt` es una fecha real —la del último reto cerrado— y todos los
    // demás son necesariamente anteriores: por eso la pantalla dice «antes del».
    resultsAt[id] = s.lastEndedAt ?? now;
    aprox[id] = true;
  }
  return { ...s, resultsAt, resultsAtAprox: aprox };
}

/**
 * Reconstruye el estado desde el almacenamiento: v2 si existe; si no,
 * migra el perfil plano v1 a ajustes manuales (descartando "unknown").
 *
 * `now` solo se usa como último recurso para fechar retos cerrados por una
 * versión que no guardaba fechas; se pasa desde fuera para que esto siga siendo
 * una función pura y testeable.
 */
export function parseStoredState(rawV2: string | null, rawV1: string | null, now = 0): PlanState {
  if (rawV2) {
    try {
      return conFechasEstimadas(sanearPlanState(JSON.parse(rawV2)), now);
    } catch {
      return { ...EMPTY_STATE };
    }
  }
  if (rawV1) {
    try {
      const old = JSON.parse(rawV1) as { profile?: Partial<ToleranceProfile> };
      const overrides: Partial<Record<FodmapType, Tolerance>> = {};
      for (const [k, v] of Object.entries(old.profile ?? {})) {
        if (v && v !== 'unknown') overrides[k as FodmapType] = v;
      }
      return { ...EMPTY_STATE, overrides };
    } catch {
      return { ...EMPTY_STATE };
    }
  }
  return { ...EMPTY_STATE };
}

/**
 * El peor resultado registrado entre los retos de un grupo (conservador).
 *
 * UN SUB-RETO NO CERTIFICA A LA FAMILIA, y creerlo pintaba de verde el ajo y la
 * cebolla. Los fructanos se retan por separado —pan, cebolla y ajo— porque, en
 * palabras de `challenges.ts`, «el intestino los maneja distinto según el
 * alimento». Pero esto tomaba el peor de los COMPLETADOS y los que faltaban no
 * contaban nada, así que superar el del pan —el único gratis— dejaba
 * `fructans: 'ok'` para toda la familia: 661 alimentos pasaban a «bajo · para
 * ti» y 593 de ellos son de los que la propia app marca como evitar. Y ni
 * siquiera hacían falta los tres días: el selector manual de Mi plan lo hacía
 * de un toque.
 *
 * Mientras falte un sub-reto, lo que se sepa solo puede EMPEORAR el color,
 * nunca mejorarlo: un 'trigger' se propaga —quien reacciona a la cebolla tiene
 * un motivo para desconfiar del ajo—, y un 'ok' o un 'moderate' se quedan en
 * «sin probar» hasta que la familia esté entera. Los grupos de un solo reto
 * (lactosa, fructosa, GOS, sorbitol, manitol) no cambian: ahí un reto ES la
 * familia.
 */
export function derivedGroupTolerance(state: PlanState, fodmap: FodmapType): Tolerance {
  let worst: Tolerance = 'unknown';
  let hechos = 0;
  let total = 0;
  for (const plan of challengePlans) {
    if (plan.fodmap !== fodmap) continue;
    total += 1;
    const r = state.results[plan.id];
    if (!r) continue;
    hechos += 1;
    if (SEVERITY[r] > SEVERITY[worst]) worst = r;
  }
  if (hechos < total && SEVERITY[worst] < SEVERITY.trigger) return 'unknown';
  return worst;
}

/**
 * Cuántos sub-retos de la familia están hechos y cuántos son.
 *
 * La pantalla decía «Fructanos — de tu reto — Sin probar» y las dos mitades se
 * contradecían: basta un sub-reto para que haya procedencia, pero hacen falta
 * los tres para que haya veredicto. Con esto la fila puede decir lo que de
 * verdad pasa —cuántos van y cuáles faltan— en vez de dejar el hueco.
 */
export function avanceDeFamilia(
  state: PlanState,
  fodmap: FodmapType
): { hechos: number; total: number } {
  const planes = challengePlans.filter((p) => p.fodmap === fodmap);
  return {
    hechos: planes.filter((p) => state.results[p.id] !== undefined).length,
    total: planes.length,
  };
}

/** Perfil efectivo por grupo: ajuste manual > peor resultado de retos > sin probar */
export function effectiveProfile(state: PlanState): ToleranceProfile {
  const p = { ...EMPTY_PROFILE };
  (Object.keys(p) as FodmapType[]).forEach((fm) => {
    p[fm] = state.overrides[fm] ?? derivedGroupTolerance(state, fm);
  });
  return p;
}

export function withOverride(state: PlanState, fodmap: FodmapType, value: Tolerance): PlanState {
  const overrides = { ...state.overrides };
  if (value === 'unknown') {
    delete overrides[fodmap]; // limpiar ajuste manual: vuelve a los retos
  } else {
    overrides[fodmap] = value;
  }
  return { ...state, overrides };
}

export function withChallengeStarted(state: PlanState, challengeId: string, now: number): PlanState {
  return { ...state, active: { challengeId, day: 1, startedAt: now, dayAt: now } };
}

export function withChallengeFinished(
  state: PlanState,
  verdict: Tolerance,
  toleratedDay: number,
  now: number
): PlanState {
  if (!state.active) return state;
  const plan = challengeById.get(state.active.challengeId);
  if (!plan) return state;
  // LA MARCA DE «FECHA ESTIMADA» SE VA CON LA FECHA ESTIMADA. `resultsAt` se
  // reescribe aquí con el día real, y si `resultsAtAprox` se quedara puesto la
  // tarjeta seguiría diciendo «Hecho ANTES del …» de un reto cerrado hoy — y
  // justo a quien la migración existe para servir: el que repite cada 3-6
  // meses. Ver `PlanState.resultsAtAprox`.
  const resultsAtAprox = { ...state.resultsAtAprox };
  delete resultsAtAprox[plan.id];
  const siguiente: PlanState = {
    ...state,
    results: { ...state.results, [plan.id]: verdict },
    resultsAt: { ...state.resultsAt, [plan.id]: now },
    resultsAtAprox,
    thresholds: { ...state.thresholds, [plan.id]: toleratedDay },
    active: null,
    lastEndedAt: now,
  };
  // EL AJUSTE MANUAL SOLO SE BORRA CUANDO HAY ALGO QUE PONER EN SU SITIO.
  //
  // Esta línea era un `delete` seco, y con los fructanos tiraba el dato de la
  // persona sin sustituirlo: marcas a mano «me sienta mal» —lo sabes, llevas
  // años con el pan—, superas el reto de la pasta, y el derivado sigue en
  // 'unknown' porque faltan la cebolla y el ajo. Resultado: la familia pasaba
  // de «Me sienta mal» a «Sin probar» sin que nada lo dijera, y 661 alimentos
  // perdían tu etiqueta. Es el agujero opuesto al que arregló
  // `derivedGroupTolerance`: allí la app inventaba un «ok», aquí borraba un
  // «trigger» real. Las familias de un solo reto se comportan igual que antes.
  const overrides = { ...state.overrides };
  if (derivedGroupTolerance(siguiente, plan.fodmap) !== 'unknown') delete overrides[plan.fodmap];
  return { ...siguiente, overrides };
}

/**
 * Quita el resultado de un reto y su umbral.
 *
 * Sin esto un veredicto no se podía deshacer: la propia pantalla admite que
 * «1 de cada 4 retos falla incluso con placebo», y la única salida que ofrecía
 * eran otros tres días más dos de lavado. Te resfrías el día 2 o marcas
 * síntomas por error y ese dato se queda para siempre recoloreando la lista,
 * el lector, las recetas y el plato.
 *
 * No toca `lastEndedAt`: borrar un dato no es haber comido nada, y el descanso
 * entre retos no puede empezar a contar desde aquí.
 */
export function withResultRemoved(state: PlanState, challengeId: string): PlanState {
  const results = { ...state.results };
  const resultsAt = { ...state.resultsAt };
  const resultsAtAprox = { ...state.resultsAtAprox };
  const thresholds = { ...state.thresholds };
  delete results[challengeId];
  delete resultsAt[challengeId];
  delete resultsAtAprox[challengeId];
  delete thresholds[challengeId];
  return { ...state, results, resultsAt, resultsAtAprox, thresholds };
}

/** Un reto cerrado hace más de `REPETIR_MS`: la tolerancia cambia y toca volver a mirarlo. */
export function tocaRepetir(state: PlanState, challengeId: string, now: number): boolean {
  const cuando = state.resultsAt?.[challengeId];
  return state.results[challengeId] !== undefined && cuando !== undefined && now - cuando >= REPETIR_MS;
}

/**
 * En qué fase del protocolo está el plan: 1 sin nada hecho, 2 con retos por
 * hacer, 3 cuando los no opcionales están todos.
 *
 * La fase 3 existía en la Guía y en `/menu` y no existía en el plan: quien
 * terminaba los ocho retos —seis semanas de trabajo— llegaba a una pantalla
 * idéntica a la del primer día.
 */
export function faseDelPlan(state: PlanState): 1 | 2 | 3 {
  const obligatorios = challengePlans.filter((p) => !p.optional);
  if (obligatorios.every((p) => state.results[p.id] !== undefined)) return 3;
  if (state.active || Object.keys(state.results).length > 0) return 2;
  return 1;
}

/**
 * ¿Se puede dar por bueno el día de hoy?
 *
 * UN DÍA DEL RETO ES UN DÍA, NO UN TOQUE. Pulsando «día superado» tres veces
 * seguidas se completaba el protocolo entero en el mismo minuto: día 1, día 2 y
 * día 3 con sus dosis crecientes, y al final un veredicto que la app da por
 * bueno y con el que recolorea la lista, el lector, las recetas y el plato. Es
 * el dato más caro que produce esta app y se podía fabricar sin comer nada.
 *
 * Es el mismo cuidado que ya tenía el descanso ENTRE retos —ver
 * `withChallengeAbandoned`— aplicado al tiempo DENTRO de uno.
 *
 * Se mide por día de calendario y no por 24 horas exactas: quien desayuna la
 * dosis y la apunta por la noche no puede quedarse esperando hasta la mañana
 * siguiente a la misma hora. Y quien se dejó el reto empezado con una versión
 * anterior no trae `dayAt`: a ese no se le bloquea.
 *
 * PERO EL CALENDARIO SOLO NO BASTA, y ahí quedaba abierto el mismo agujero por
 * la puerta de al lado: cena la dosis 1 a las 23:40 y la apunta a las 23:50, y
 * a las 00:05 el botón ya está encendido — la dosis 2, que es un 50 % mayor,
 * quince minutos después de la primera; a las 00:05 del día siguiente, la 3.
 * Las tres dosis crecientes caben en 24 horas y media. El artículo de
 * reintroducción dice que los síntomas tardan 24-72 h en aparecer
 * (`guide.ts`), así que ese reto mide la dosis 2 antes de que la 1 haya podido
 * dar la cara, y de ahí sale el veredicto que recolorea el catálogo.
 *
 * Así que hacen falta las dos cosas: otro día del calendario Y medio día de
 * reloj. Doce horas y no veinte porque `dayAt` guarda cuándo se APUNTÓ, no
 * cuándo se comió: con veinte, quien apunta la dosis del desayuno por la noche
 * no podría marcar el día siguiente hasta la tarde, que es justo a quien el
 * día de calendario venía a proteger.
 */
export const MINIMO_ENTRE_DOSIS_MS = 12 * 3600_000;

export function puedeAvanzarDia(state: PlanState, now: number): boolean {
  if (!state.active) return false;
  // Sin `dayAt` no hay con qué comparar y no se frena: ver arriba.
  if (state.active.dayAt === undefined) return true;
  const desde = proximaDosisDesde(state);
  return desde !== null && now >= desde;
}

/**
 * A partir de cuándo se puede dar por bueno el día, o `null` si no hay reto (o
 * si viene de una versión sin `dayAt` y por tanto no se le frena).
 *
 * Existe para que el botón apagado pueda DECIR hasta cuándo, como ya hace el
 * descanso entre retos: apagar sin explicar es el callejón que esta pantalla
 * lleva toda su historia cerrando.
 *
 * `null` Y NO CERO en el caso de la versión anterior, aunque para
 * `puedeAvanzarDia` diera igual: esto lo pinta una pantalla, y un cero es el 1
 * de enero de 1970 en cuanto alguien lo pase por una fecha. Lo que no hay se
 * dice que no hay.
 */
export function proximaDosisDesde(state: PlanState): number | null {
  if (!state.active) return null;
  const { dayAt: apuntado, diasParados } = state.active;
  if (apuntado === undefined) return null; // retos de versiones anteriores: no se frenan
  // La pausa corre la siguiente dosis tantos días como se estuvo parado.
  const dayAt = apuntado + (diasParados ?? 0) * DIA_MS;
  const manana = new Date(dayAt);
  manana.setHours(0, 0, 0, 0);
  manana.setDate(manana.getDate() + 1);
  return Math.max(manana.getTime(), dayAt + MINIMO_ENTRE_DOSIS_MS);
}

/** El día ha ido bien: avanza; al superar el día 3, veredicto "ok". */
export function withDayPassed(state: PlanState, now: number): PlanState {
  if (!state.active) return state;
  if (!puedeAvanzarDia(state, now)) return state;
  if (state.active.day >= 3) {
    return withChallengeFinished(state, 'ok', 3, now);
  }
  return {
    ...state,
    active: { ...state.active, day: (state.active.day + 1) as 2 | 3, dayAt: now },
  };
}

/** Hubo síntomas: umbral = último día superado; veredicto según el día. */
export function withDayFailed(state: PlanState, now: number): PlanState {
  if (!state.active) return state;
  const verdict: Tolerance = state.active.day >= 3 ? 'moderate' : 'trigger';
  return withChallengeFinished(state, verdict, state.active.day - 1, now);
}

/**
 * Abandona sin veredicto. El lavado corre si hubo dosis.
 *
 * Quien lleva dos días comiendo ajo tiene el intestino tan cargado como quien
 * terminó: sin `lastEndedAt` podía empezar el siguiente reto en el mismo
 * minuto y salir contaminado por el FODMAP anterior.
 *
 * PERO QUIEN NO HA LLEGADO A COMER NADA NO ARRASTRA NADA, y a ése el lavado le
 * apagaba los ocho botones durante 48 horas por un toque en «Empezar reto» —el
 * único reto gratis se pulsa, muy razonablemente, para ver qué hay dentro—. El
 * estado no puede distinguir los dos casos: el día 1 empezado y el día 1 comido
 * son idénticos. Así que no se adivina, lo dice la persona.
 */
export function withChallengeAbandoned(state: PlanState, now: number, comido = true): PlanState {
  return { ...state, active: null, lastEndedAt: comido ? now : state.lastEndedAt };
}
