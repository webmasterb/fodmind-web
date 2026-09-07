export type Lang = 'es' | 'en' | 'fr' | 'de' | 'it' | 'pt';
export type Localized = Record<Lang, string>;
export type FodmapLevel = 'low' | 'moderate' | 'high';
export type FodmapType = 'fructans' | 'gos' | 'lactose' | 'fructose' | 'sorbitol' | 'mannitol';

export interface Alimento {
  id: string;
  category: string;
  level: FodmapLevel;
  fodmaps: FodmapType[];
  safeServingG: number | null;
  racionGradoC: boolean;
  typicalServingG?: number;
  servingUnit?: 'g' | 'ml';
  emoji: string;
  names: Localized;
  slug: Localized;
  note?: Localized;
  sustitutos: { id: string; motivo?: string }[];
}

export interface ArticuloGuia {
  id: string;
  grupo: 'metodo' | 'preguntas';
  title: Localized;
  summary: Localized;
  body: Localized;
}

export interface EntradaBusqueda {
  n: string;
  p: string;
  l: FodmapLevel;
  c: string;
}
