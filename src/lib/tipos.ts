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
  /** Ids de `fuentes.json` que respaldan lo que afirma la nota. */
  notaCitas?: string[];
  /** De dónde sale cada número. Lo calcula la app; aquí solo se pinta. */
  procedencia: {
    racion: MitadProcedencia;
    lista: MitadProcedencia;
  };
  sustitutos: { id: string; motivo?: string }[];
}

/** Una mitad de la procedencia: el grado en llano y quién lo publicó. */
export interface MitadProcedencia {
  texto: ClaveProcedencia;
  fuentes: string[];
}

export type ClaveProcedencia =
  | 'provenanceA'
  | 'provenanceB'
  | 'provenanceC'
  | 'provenanceComposition';

export interface Fuente {
  id: string;
  ref: string;
  where: string;
  url: string;
}

export interface CreditoComposicion {
  id: string;
  fuente: string;
  quien: string;
  licencia: string;
  licenciaUrl: string;
  consultado: string;
  url: string;
}

/** `src/data/fuentes.json`, tal y como lo escribe el puente de la app. */
export interface Fuentes {
  notaCitas: Fuente[];
  bibliografia: { id: string; ref: string; title: string; where: string; url: string }[];
  composicion: CreditoComposicion[];
  textos: Record<ClaveTexto, Localized>;
}

export type ClaveTexto =
  | ClaveProcedencia
  | 'provenanceFrom'
  | 'provenanceServingLabel'
  | 'provenanceListLabel'
  | 'dataNote'
  | 'sourcesTitle'
  | 'dataCredits'
  | 'dataCreditsNote';

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
