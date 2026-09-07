import type { Locale } from '../lib/rutas';

export const CAT_NAMES: Record<string, Record<Locale, string>> = {
  fruits: { es: 'Frutas', en: 'Fruits', fr: 'Fruits', de: 'Obst', it: 'Frutta', pt: 'Frutas' },
  vegetables: { es: 'Verduras y hortalizas', en: 'Vegetables', fr: 'Légumes', de: 'Gemüse', it: 'Verdure', pt: 'Vegetais' },
  grains: { es: 'Cereales y tubérculos', en: 'Grains and tubers', fr: 'Céréales et tubercules', de: 'Getreide und Knollen', it: 'Cereali e tuberi', pt: 'Cereais e tubérculos' },
  legumes: { es: 'Legumbres', en: 'Legumes', fr: 'Légumineuses', de: 'Hülsenfrüchte', it: 'Legumi', pt: 'Leguminosas' },
  dairy: { es: 'Lácteos', en: 'Dairy', fr: 'Produits laitiers', de: 'Milchprodukte', it: 'Latticini', pt: 'Laticínios' },
  protein: { es: 'Proteína', en: 'Protein', fr: 'Protéines', de: 'Proteinquellen', it: 'Proteine', pt: 'Proteínas' },
  nuts_seeds: { es: 'Frutos secos y semillas', en: 'Nuts and seeds', fr: 'Fruits à coque et graines', de: 'Nüsse und Samen', it: 'Frutta secca e semi', pt: 'Frutos secos e sementes' },
  sweeteners: { es: 'Edulcorantes', en: 'Sweeteners', fr: 'Édulcorants', de: 'Süßungsmittel', it: 'Dolcificanti', pt: 'Adoçantes' },
  beverages: { es: 'Bebidas', en: 'Drinks', fr: 'Boissons', de: 'Getränke', it: 'Bevande', pt: 'Bebidas' },
  condiments: { es: 'Condimentos', en: 'Condiments', fr: 'Condiments', de: 'Würzen', it: 'Condimenti', pt: 'Condimentos' },
  snacks: { es: 'Snacks', en: 'Snacks', fr: 'Snacks', de: 'Snacks', it: 'Snack', pt: 'Snacks' },
  herbs_spices: { es: 'Hierbas y especias', en: 'Herbs and spices', fr: 'Herbes et épices', de: 'Kräuter und Gewürze', it: 'Erbe e spezie', pt: 'Ervas e especiarias' },
};

export function catName(catId: string, locale: Locale): string {
  return CAT_NAMES[catId]?.[locale] ?? catId;
}
