/**
 * LOS TEXTOS DE LA TIRA DEL ESCÁNER (TiraEscaner.astro), en los seis idiomas.
 *
 * Van aparte de strings.ts porque son cinco animaciones con sus productos y
 * no cinco frases: cada letra lleva su título, sus tres productos y el
 * veredicto de cada uno. Los productos y sus números salen del catálogo
 * (foods.json) y no se inventan: pan de trigo alto con 25 g seguros, leche sin
 * lactosa sin límite, bebida de avena moderada a 125 ml, hummus moderado a
 * 40 g, cornflakes moderados a 30 g, manchego sin límite, cebolla frita a
 * evitar, y el pan de espelta de masa madre como alternativa baja.
 *
 * El registro sigue al de strings.ts: vous en francés, du en alemán, tu en
 * los demás.
 */
import type { Locale } from '../lib/rutas';

export type Nivel = 'bajo' | 'medio' | 'alto';

export interface TiraStrings {
  boton: string;
  nivel: Record<Nivel, string>;
  a: { productos: { nombre: string; chip: string; nivel: Nivel }[] };
  b: { productos: { nombre: string; nivel: Nivel }[] };
  c: { texto: string };
  d: { productos: { nombre: string; racion: string; nivel: Nivel }[] };
  /**
   * `titulo` es el titular grande de las cinco variantes cuando la página no tiene
   * alimento. `ingredientes` alterna texto y marca: los impares los señala la lupa.
   */
  e: { titulo: string; etiqueta: string; ingredientes: string[]; alternativa: string };
}

export const TIRA: Record<Locale, TiraStrings> = {
  es: {
    boton: 'Escanear',
    nivel: { bajo: 'BAJO', medio: 'MEDIO', alto: 'ALTO' },
    a: {
      productos: [
        { nombre: 'Pan de trigo', chip: 'ALTO · fructanos', nivel: 'alto' },
        { nombre: 'Leche sin lactosa', chip: 'BAJO · sin límite', nivel: 'bajo' },
        { nombre: 'Bebida de avena', chip: 'MEDIO · 125 ml', nivel: 'medio' },
      ],
    },
    b: {
      productos: [
        { nombre: 'Manchego · sin límite', nivel: 'bajo' },
        { nombre: 'Cornflakes · máx. 30 g', nivel: 'medio' },
        { nombre: 'Cebolla frita · evitar', nivel: 'alto' },
      ],
    },
    c: { texto: '1.843 alimentos y cualquier envase con código de barras' },
    d: {
      productos: [
        { nombre: 'Pan de trigo', racion: 'máx. 25 g', nivel: 'alto' },
        { nombre: 'Leche sin lactosa', racion: 'ración libre', nivel: 'bajo' },
        { nombre: 'Hummus', racion: 'máx. 40 g', nivel: 'medio' },
      ],
    },
    e: {
      titulo: '¿Qué esconde tu compra?',
      etiqueta: 'Ingredientes',
      ingredientes: ['', 'Harina de trigo', ', agua, aceite de girasol, ', 'ajo en polvo', ', sal, levadura.'],
      alternativa: 'Alternativa: espelta de masa madre ✓',
    },
  },
  en: {
    boton: 'Scan',
    nivel: { bajo: 'LOW', medio: 'MEDIUM', alto: 'HIGH' },
    a: {
      productos: [
        { nombre: 'Wheat bread', chip: 'HIGH · fructans', nivel: 'alto' },
        { nombre: 'Lactose-free milk', chip: 'LOW · no limit', nivel: 'bajo' },
        { nombre: 'Oat milk', chip: 'MEDIUM · 125 ml', nivel: 'medio' },
      ],
    },
    b: {
      productos: [
        { nombre: 'Manchego · no limit', nivel: 'bajo' },
        { nombre: 'Cornflakes · max. 30 g', nivel: 'medio' },
        { nombre: 'Fried onion · avoid', nivel: 'alto' },
      ],
    },
    c: { texto: '1,843 foods and any pack with a barcode' },
    d: {
      productos: [
        { nombre: 'Wheat bread', racion: 'max. 25 g', nivel: 'alto' },
        { nombre: 'Lactose-free milk', racion: 'free serving', nivel: 'bajo' },
        { nombre: 'Hummus', racion: 'max. 40 g', nivel: 'medio' },
      ],
    },
    e: {
      titulo: 'What’s hiding in your cart?',
      etiqueta: 'Ingredients',
      ingredientes: ['', 'Wheat flour', ', water, sunflower oil, ', 'garlic powder', ', salt, yeast.'],
      alternativa: 'Alternative: sourdough spelt ✓',
    },
  },
  fr: {
    boton: 'Scanner',
    nivel: { bajo: 'FAIBLE', medio: 'MOYEN', alto: 'ÉLEVÉ' },
    a: {
      productos: [
        { nombre: 'Pain de blé', chip: 'ÉLEVÉ · fructanes', nivel: 'alto' },
        { nombre: 'Lait sans lactose', chip: 'FAIBLE · sans limite', nivel: 'bajo' },
        { nombre: 'Lait d’avoine', chip: 'MOYEN · 125 ml', nivel: 'medio' },
      ],
    },
    b: {
      productos: [
        { nombre: 'Manchego · sans limite', nivel: 'bajo' },
        { nombre: 'Cornflakes · max. 30 g', nivel: 'medio' },
        { nombre: 'Oignons frits · à éviter', nivel: 'alto' },
      ],
    },
    c: { texto: '1 843 aliments et tout emballage à code-barres' },
    d: {
      productos: [
        { nombre: 'Pain de blé', racion: 'max. 25 g', nivel: 'alto' },
        { nombre: 'Lait sans lactose', racion: 'portion libre', nivel: 'bajo' },
        { nombre: 'Houmous', racion: 'max. 40 g', nivel: 'medio' },
      ],
    },
    e: {
      titulo: 'Que cache votre panier ?',
      etiqueta: 'Ingrédients',
      ingredientes: ['', 'Farine de blé', ', eau, huile de tournesol, ', 'ail en poudre', ', sel, levure.'],
      alternativa: 'Alternative : épeautre au levain ✓',
    },
  },
  de: {
    boton: 'Scannen',
    nivel: { bajo: 'NIEDRIG', medio: 'MITTEL', alto: 'HOCH' },
    a: {
      productos: [
        { nombre: 'Weizenbrot', chip: 'HOCH · Fruktane', nivel: 'alto' },
        { nombre: 'Laktosefreie Milch', chip: 'NIEDRIG · ohne Limit', nivel: 'bajo' },
        { nombre: 'Haferdrink', chip: 'MITTEL · 125 ml', nivel: 'medio' },
      ],
    },
    b: {
      productos: [
        { nombre: 'Manchego · ohne Limit', nivel: 'bajo' },
        { nombre: 'Cornflakes · max. 30 g', nivel: 'medio' },
        { nombre: 'Röstzwiebeln · meiden', nivel: 'alto' },
      ],
    },
    c: { texto: '1.843 Lebensmittel und jede Packung mit Barcode' },
    d: {
      productos: [
        { nombre: 'Weizenbrot', racion: 'max. 25 g', nivel: 'alto' },
        { nombre: 'Laktosefreie Milch', racion: 'ohne Limit', nivel: 'bajo' },
        { nombre: 'Hummus', racion: 'max. 40 g', nivel: 'medio' },
      ],
    },
    e: {
      titulo: 'Was steckt im Einkauf?',
      etiqueta: 'Zutaten',
      ingredientes: ['', 'Weizenmehl', ', Wasser, Sonnenblumenöl, ', 'Knoblauchpulver', ', Salz, Hefe.'],
      alternativa: 'Alternative: Dinkel-Sauerteig ✓',
    },
  },
  it: {
    boton: 'Scansiona',
    nivel: { bajo: 'BASSO', medio: 'MEDIO', alto: 'ALTO' },
    a: {
      productos: [
        { nombre: 'Pane di frumento', chip: 'ALTO · fruttani', nivel: 'alto' },
        { nombre: 'Latte senza lattosio', chip: 'BASSO · senza limiti', nivel: 'bajo' },
        { nombre: 'Bevanda d’avena', chip: 'MEDIO · 125 ml', nivel: 'medio' },
      ],
    },
    b: {
      productos: [
        { nombre: 'Manchego · senza limiti', nivel: 'bajo' },
        { nombre: 'Cornflakes · max 30 g', nivel: 'medio' },
        { nombre: 'Cipolla fritta · da evitare', nivel: 'alto' },
      ],
    },
    c: { texto: '1.843 alimenti e qualsiasi confezione con codice a barre' },
    d: {
      productos: [
        { nombre: 'Pane di frumento', racion: 'max 25 g', nivel: 'alto' },
        { nombre: 'Latte senza lattosio', racion: 'porzione libera', nivel: 'bajo' },
        { nombre: 'Hummus', racion: 'max 40 g', nivel: 'medio' },
      ],
    },
    e: {
      titulo: 'Cosa nasconde la spesa?',
      etiqueta: 'Ingredienti',
      ingredientes: ['', 'Farina di grano', ', acqua, olio di girasole, ', 'aglio in polvere', ', sale, lievito.'],
      alternativa: 'Alternativa: farro a lievitazione naturale ✓',
    },
  },
  pt: {
    boton: 'Ler rótulo',
    nivel: { bajo: 'BAIXO', medio: 'MÉDIO', alto: 'ALTO' },
    a: {
      productos: [
        { nombre: 'Pão de trigo', chip: 'ALTO · frutanos', nivel: 'alto' },
        { nombre: 'Leite sem lactose', chip: 'BAIXO · sem limite', nivel: 'bajo' },
        { nombre: 'Bebida de aveia', chip: 'MÉDIO · 125 ml', nivel: 'medio' },
      ],
    },
    b: {
      productos: [
        { nombre: 'Manchego · sem limite', nivel: 'bajo' },
        { nombre: 'Cornflakes · máx. 30 g', nivel: 'medio' },
        { nombre: 'Cebola frita · evitar', nivel: 'alto' },
      ],
    },
    c: { texto: '1.843 alimentos e qualquer embalagem com código de barras' },
    d: {
      productos: [
        { nombre: 'Pão de trigo', racion: 'máx. 25 g', nivel: 'alto' },
        { nombre: 'Leite sem lactose', racion: 'porção livre', nivel: 'bajo' },
        { nombre: 'Húmus', racion: 'máx. 40 g', nivel: 'medio' },
      ],
    },
    e: {
      titulo: 'O que esconde o carrinho?',
      etiqueta: 'Ingredientes',
      ingredientes: ['', 'Farinha de trigo', ', água, óleo de girassol, ', 'alho em pó', ', sal, fermento.'],
      alternativa: 'Alternativa: espelta de fermentação natural ✓',
    },
  },
};
