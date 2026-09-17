/**
 * LA PUERTA DE LA WEB AL MOTOR DE LA APP.
 *
 * Todo lo que hay debajo de `@/` es código de la app copiado tal cual
 * (scripts/sincronizar-motor.mjs); aquí solo se encadena como lo encadena la
 * app —recorte de trazas, análisis, reparto por tolerancia, marcador— y se
 * devuelve lo que la pantalla pinta. El perfil de tolerancia va vacío: la
 * web no sabe nada de la persona, así que un hallazgo alto es alto y punto,
 * igual que en la app antes del primer reto.
 *
 * Este módulo se carga con `import()` la primera vez que alguien pulsa
 * «Analizar»: pesa 135 KB comprimidos (el catálogo con sus nombres en seis
 * idiomas) y la mayoría de las visitas a una ficha no lo necesitan.
 */
import { scanLabel, type LabelFinding, type LabelResult } from '@/lib/label-scan';
import { agruparPorTolerancia, altosDe, marcadorDe, type Agrupado } from '@/lib/label-personal';
import { recortarIngredientes } from '@/lib/label-crop';
import { buscarProducto, elegirIngredientes, type Respuesta } from '@/lib/barcode';
import type { Lang } from '@/data/types';

export type { LabelFinding, LabelResult, Agrupado, Respuesta };
export { buscarProducto, elegirIngredientes };

export interface Analisis {
  resultado: LabelResult;
  grupos: Agrupado;
  marcador: { sinProblema: number; vigilar: number; altos: number };
  altos: LabelFinding[];
  /** no había nada que analizar: ni un trozo reconocible */
  rota: boolean;
}

export function analiza(texto: string, lang: Lang): Analisis {
  const recorte = recortarIngredientes(texto, lang);
  const resultado = scanLabel(recorte.texto);
  const grupos = agruparPorTolerancia(resultado, {});
  return {
    resultado,
    grupos,
    marcador: marcadorDe(grupos),
    altos: altosDe(grupos),
    rota: resultado.totalTrozos === 0,
  };
}

/** El nombre de un hallazgo en el idioma de la página, con el inglés de reserva. */
export function nombreDe(f: LabelFinding, lang: Lang): string {
  const n = f.nombre as unknown as Record<string, string> | string;
  if (typeof n === 'string') return n;
  return n[lang] || n.en || Object.values(n)[0] || '';
}
