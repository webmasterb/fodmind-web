import { LOCALE_TAG, type Locale } from './rutas';

/** Para conteos (1.843): agrupado, sin decimales. */
export function fmt(n: number, locale: Locale): string {
  return new Intl.NumberFormat(LOCALE_TAG[locale], { maximumFractionDigits: 0 }).format(n);
}

/**
 * Para raciones en gramos, igual que la ficha de la app:
 * un decimal como máximo y SIN agrupar (1265,8 g y no 1.265,8 g).
 * Es donde ya mordió `toFixed` en la app: punto decimal en los seis idiomas.
 */
export function fmtPorcion(n: number, locale: Locale): string {
  return new Intl.NumberFormat(LOCALE_TAG[locale], {
    maximumFractionDigits: 1,
    useGrouping: false,
  }).format(n);
}

export const LEVEL_COLOR: Record<'low' | 'moderate' | 'high', string> = {
  low: '#15803d',
  moderate: '#b45309',
  high: '#b91c1c',
};

export function rellenar(plantilla: string, valores: Record<string, string>): string {
  return plantilla.replace(/\{(\w+)\}/g, (_, k: string) => valores[k] ?? `{${k}}`);
}
