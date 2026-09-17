import { FodmapType, LocalizedString } from './types';

// Planes de reto de reintroducción, alineados con la práctica clínica
// (Monash 2025 / protocolo KCL):
// - Los fructanos se retan alimento por alimento (pan, cebolla y ajo por
//   separado): el intestino los maneja distinto según el alimento.
// - Sorbitol y manitol son siempre dos retos separados.
// - Fructosa y lactosa solo se retan si se restringieron (opcionales).
// - La coliflor y el champiñón ya no se usan como test de manitol
//   (actualización Monash abril 2025); se usa boniato.
// Las dosis son orientativas ("una guía, no un reglamento").
//
// EL ALIMENTO DE PRUEBA TIENE QUE SER «PURO», Y DOS NO LO ERAN. La Guía lo dice
// con todas las letras —«un alimento "puro" que solo contenga ese FODMAP»— y el
// propio catálogo desmentía a dos de los ocho retos:
//
//   · sorbitol usaba `dried-apricots`, que declara `['sorbitol', 'fructans']`;
//   · fructanos-cereal usaba `wheat-bread`, que declara `['fructans', 'fructose']`.
//
// El daño no es de etiqueta. Quien reacciona a los orejones se lleva un
// veredicto que dice «sorbitol» cuando por los datos de la app podían ser los
// fructanos, y sobre esa atribución falsa se construye después TODO lo
// personalizado: qué se reintroduce, qué se vuelve a mirar y de qué color sale
// cada ficha. Un reto que no distingue nada es peor que no tenerlo, porque el
// resultado se cree.
//
// Ahora el sorbitol se prueba con el albaricoque FRESCO (`apricot`, lista
// `['sorbitol']`) y los fructanos de cereal con la pasta de trigo cocida
// (`wheat-pasta`, lista `['fructans']`, medida por liljebo2020). Las dosis de
// la pasta son fracciones de su propia ración habitual —180 g— y no un número
// nuevo. El `id` del reto sigue siendo `fructans-bread` a propósito: es la
// clave con la que se guardan los resultados de quien ya lo hizo, y también
// `FREE_CHALLENGE_ID`. Renombrarlo borraría retos ya completados.
//
// La guardia está en `__tests__/integrity.test.ts`: la lista de FODMAP del
// alimento de prueba tiene que ser EXACTAMENTE la del reto.

export interface ChallengePlan {
  id: string;
  fodmap: FodmapType;
  /** Nombre mostrado del reto (distingue los sub-retos de fructanos) */
  name: LocalizedString;
  /** Solo retar si ese FODMAP se restringió en la eliminación */
  optional?: boolean;
  testFood: LocalizedString;
  /** el id del alimento de prueba, para saber si lo marcaste como que te sienta mal */
  testFoodId: string;
  doses: [LocalizedString, LocalizedString, LocalizedString];
  /**
   * Las mismas tres dosis en gramos, para los retos cuyo texto YA las dice.
   *
   * Existe porque el día superado se apunta ahora en el diario, y un apunte de
   * comida sin gramos no entra en la carga FODMAP: 180 g de pasta son dos veces
   * la ración segura de `wheat-pasta`, o sea el apunte más informativo de esa
   * semana, y se perdía.
   *
   * NO SE PARSEA EL TEXTO DE `doses`: sacar un número de una cadena de interfaz
   * es fabricarlo. Se escribe a mano y una guardia exige que cada cifra aparezca
   * literalmente en su propia dosis.
   *
   * OPCIONAL A PROPÓSITO. El ajo se mide en dientes y el albaricoque en piezas,
   * y la leche viene en mililitros: convertirlos a gramos sería inventar una
   * equivalencia que esta app no tiene. Sin `dosesG` el apunte se escribe igual,
   * solo que sin carga — que es exactamente lo que se sabe.
   */
  dosesG?: [number, number, number];
}

export const challengePlans: ChallengePlan[] = [
  {
    id: 'fructans-bread',
    fodmap: 'fructans',
    name: {
      es: 'Fructanos · pasta',
      en: 'Fructans · pasta',
      fr: 'Fructanes · pâtes',
      de: 'Fruktane · Nudeln',
      it: 'Fruttani · pasta',
      pt: 'Frutanos · massa',
    },
    dosesG: [90, 135, 180],
    testFoodId: 'wheat-pasta',
    testFood: {
      es: 'Pasta de trigo cocida (la que sueles comer)',
      en: 'Cooked wheat pasta (the one you usually eat)',
      fr: 'Pâtes de blé cuites (celles que vous mangez d’habitude)',
      de: 'Weizennudeln, gekocht (die du sonst isst)',
      it: 'Pasta di grano cotta (quella che mangi di solito)',
      pt: 'Massa de trigo cozida (a que costumas comer)',
    },
    doses: [
      {
        es: '90 g (media ración)',
        en: '90 g (half a serving)',
        fr: '90 g (une demi-portion)',
        de: '90 g (eine halbe Portion)',
        it: '90 g (mezza porzione)',
        pt: '90 g (meia porção)',
      },
      {
        es: '135 g (tres cuartos)',
        en: '135 g (three quarters)',
        fr: '135 g (trois quarts)',
        de: '135 g (drei Viertel)',
        it: '135 g (tre quarti)',
        pt: '135 g (três quartos)',
      },
      {
        es: '180 g (una ración)',
        en: '180 g (a full serving)',
        fr: '180 g (une portion)',
        de: '180 g (eine ganze Portion)',
        it: '180 g (una porzione)',
        pt: '180 g (uma porção)',
      },
    ],
  },
  {
    id: 'fructans-onion',
    fodmap: 'fructans',
    name: {
      es: 'Fructanos · cebolla',
      en: 'Fructans · onion',
      fr: 'Fructanes · oignon',
      de: 'Fruktane · Zwiebel',
      it: 'Fruttani · cipolla',
      pt: 'Frutanos · cebola',
    },
    dosesG: [15, 30, 45],
    testFoodId: 'onion',
    testFood: {
      es: 'Cebolla (cocinada)',
      en: 'Onion (cooked)',
      fr: 'Oignon (cuit)',
      de: 'Zwiebel (gekocht)',
      it: 'Cipolla (cotta)',
      pt: 'Cebola (cozinhada)',
    },
    doses: [
      {
        es: '1 cucharada (15 g)',
        en: '1 tbsp (15 g)',
        fr: '1 c. à soupe (15 g)',
        de: '1 EL (15 g)',
        it: '1 cucchiaio (15 g)',
        pt: '1 c. de sopa (15 g)',
      },
      {
        es: '2 cucharadas (30 g)',
        en: '2 tbsp (30 g)',
        fr: '2 c. à soupe (30 g)',
        de: '2 EL (30 g)',
        it: '2 cucchiai (30 g)',
        pt: '2 c. de sopa (30 g)',
      },
      {
        es: 'un cuarto de cebolla (45 g)',
        en: 'a quarter onion (45 g)',
        fr: "un quart d'oignon (45 g)",
        de: 'eine viertel Zwiebel (45 g)',
        it: 'un quarto di cipolla (45 g)',
        pt: 'um quarto de cebola (45 g)',
      },
    ],
  },
  {
    id: 'fructans-garlic',
    fodmap: 'fructans',
    name: {
      es: 'Fructanos · ajo',
      en: 'Fructans · garlic',
      fr: 'Fructanes · ail',
      de: 'Fruktane · Knoblauch',
      it: 'Fruttani · aglio',
      pt: 'Frutanos · alho',
    },
    testFoodId: 'garlic',
    testFood: {
      es: 'Ajo fresco (cocinado)',
      en: 'Fresh garlic (cooked)',
      fr: 'Ail frais (cuit)',
      de: 'Frischer Knoblauch (gekocht)',
      it: 'Aglio fresco (cotto)',
      pt: 'Alho fresco (cozinhado)',
    },
    doses: [
      {
        es: 'un cuarto de diente',
        en: 'a quarter clove',
        fr: 'un quart de gousse',
        de: 'eine viertel Zehe',
        it: 'un quarto di spicchio',
        pt: 'um quarto de dente',
      },
      {
        es: 'medio diente',
        en: 'half a clove',
        fr: 'une demi-gousse',
        de: 'eine halbe Zehe',
        it: 'mezzo spicchio',
        pt: 'meio dente',
      },
      {
        es: '1 diente entero',
        en: '1 whole clove',
        fr: '1 gousse entière',
        de: '1 ganze Zehe',
        it: '1 spicchio intero',
        pt: '1 dente inteiro',
      },
    ],
  },
  {
    id: 'gos',
    fodmap: 'gos',
    name: {
      es: 'GOS',
      en: 'GOS',
      fr: 'GOS',
      de: 'GOS',
      it: 'GOS',
      pt: 'GOS',
    },
    dosesG: [40, 85, 170],
    testFoodId: 'chickpeas-boiled',
    testFood: {
      es: 'Garbanzos cocidos (enjuagados)',
      en: 'Cooked chickpeas (rinsed)',
      fr: 'Pois chiches cuits (rincés)',
      de: 'Gekochte Kichererbsen (gespült)',
      it: 'Ceci cotti (sciacquati)',
      pt: 'Grão-de-bico cozido (lavado)',
    },
    doses: [
      {
        es: '40 g (2 cucharadas)',
        en: '40 g (2 tbsp)',
        fr: '40 g (2 c. à soupe)',
        de: '40 g (2 EL)',
        it: '40 g (2 cucchiai)',
        pt: '40 g (2 c. de sopa)',
      },
      {
        es: '85 g (4 cucharadas)',
        en: '85 g (4 tbsp)',
        fr: '85 g (4 c. à soupe)',
        de: '85 g (4 EL)',
        it: '85 g (4 cucchiai)',
        pt: '85 g (4 c. de sopa)',
      },
      {
        es: '170 g (1 taza)',
        en: '170 g (1 cup)',
        fr: '170 g (1 tasse)',
        de: '170 g (1 Tasse)',
        it: '170 g (1 tazza)',
        pt: '170 g (1 chávena)',
      },
    ],
  },
  {
    id: 'lactose',
    fodmap: 'lactose',
    optional: true,
    name: {
      es: 'Lactosa',
      en: 'Lactose',
      fr: 'Lactose',
      de: 'Laktose',
      it: 'Lattosio',
      pt: 'Lactose',
    },
    testFoodId: 'cow-milk',
    testFood: {
      es: 'Leche de vaca',
      en: "Cow's milk",
      fr: 'Lait de vache',
      de: 'Kuhmilch',
      it: 'Latte vaccino',
      pt: 'Leite de vaca',
    },
    doses: [
      {
        es: '125 ml (medio vaso)',
        en: '125 ml (half a glass)',
        fr: '125 ml (un demi-verre)',
        de: '125 ml (ein halbes Glas)',
        it: '125 ml (mezzo bicchiere)',
        pt: '125 ml (meio copo)',
      },
      {
        es: '250 ml (1 vaso)',
        en: '250 ml (1 glass)',
        fr: '250 ml (1 verre)',
        de: '250 ml (1 Glas)',
        it: '250 ml (1 bicchiere)',
        pt: '250 ml (1 copo)',
      },
      {
        es: '500 ml (2 vasos)',
        en: '500 ml (2 glasses)',
        fr: '500 ml (2 verres)',
        de: '500 ml (2 Gläser)',
        it: '500 ml (2 bicchieri)',
        pt: '500 ml (2 copos)',
      },
    ],
  },
  {
    id: 'fructose',
    fodmap: 'fructose',
    optional: true,
    name: {
      es: 'Fructosa',
      en: 'Fructose',
      fr: 'Fructose',
      de: 'Fruktose',
      it: 'Fruttosio',
      pt: 'Frutose',
    },
    dosesG: [7, 14, 21],
    testFoodId: 'honey',
    testFood: {
      es: 'Miel',
      en: 'Honey',
      fr: 'Miel',
      de: 'Honig',
      it: 'Miele',
      pt: 'Mel',
    },
    doses: [
      {
        es: '1 cucharadita (7 g)',
        en: '1 tsp (7 g)',
        fr: '1 c. à café (7 g)',
        de: '1 TL (7 g)',
        it: '1 cucchiaino (7 g)',
        pt: '1 c. de chá (7 g)',
      },
      {
        es: '2 cucharaditas (14 g)',
        en: '2 tsp (14 g)',
        fr: '2 c. à café (14 g)',
        de: '2 TL (14 g)',
        it: '2 cucchiaini (14 g)',
        pt: '2 c. de chá (14 g)',
      },
      {
        es: '1 cucharada (21 g)',
        en: '1 tbsp (21 g)',
        fr: '1 c. à soupe (21 g)',
        de: '1 EL (21 g)',
        it: '1 cucchiaio (21 g)',
        pt: '1 c. de sopa (21 g)',
      },
    ],
  },
  {
    id: 'sorbitol',
    fodmap: 'sorbitol',
    name: {
      es: 'Sorbitol',
      en: 'Sorbitol',
      fr: 'Sorbitol',
      de: 'Sorbit',
      it: 'Sorbitolo',
      pt: 'Sorbitol',
    },
    testFoodId: 'apricot',
    testFood: {
      es: 'Albaricoque fresco',
      en: 'Fresh apricot',
      fr: 'Abricot frais',
      de: 'Frische Aprikose',
      it: 'Albicocca fresca',
      pt: 'Damasco fresco',
    },
    doses: [
      {
        es: '1 unidad',
        en: '1 piece',
        fr: '1 unité',
        de: '1 Stück',
        it: '1 unità',
        pt: '1 unidade',
      },
      {
        es: '2 unidades',
        en: '2 pieces',
        fr: '2 unités',
        de: '2 Stück',
        it: '2 unità',
        pt: '2 unidades',
      },
      {
        es: '3 unidades',
        en: '3 pieces',
        fr: '3 unités',
        de: '3 Stück',
        it: '3 unità',
        pt: '3 unidades',
      },
    ],
  },
  {
    id: 'mannitol',
    fodmap: 'mannitol',
    name: {
      es: 'Manitol',
      en: 'Mannitol',
      fr: 'Mannitol',
      de: 'Mannit',
      it: 'Mannitolo',
      pt: 'Manitol',
    },
    dosesG: [100, 150, 200],
    testFoodId: 'sweet-potato',
    testFood: {
      es: 'Boniato (cocido)',
      en: 'Sweet potato (cooked)',
      fr: 'Patate douce (cuite)',
      de: 'Süßkartoffel (gekocht)',
      it: 'Patata dolce (cotta)',
      pt: 'Batata-doce (cozida)',
    },
    doses: [
      {
        es: '100 g (media taza)',
        en: '100 g (half a cup)',
        fr: '100 g (une demi-tasse)',
        de: '100 g (eine halbe Tasse)',
        it: '100 g (mezza tazza)',
        pt: '100 g (meia chávena)',
      },
      {
        es: '150 g (1 taza)',
        en: '150 g (1 cup)',
        fr: '150 g (1 tasse)',
        de: '150 g (1 Tasse)',
        it: '150 g (1 tazza)',
        pt: '150 g (1 chávena)',
      },
      {
        es: '200 g (1 taza colmada)',
        en: '200 g (heaped cup)',
        fr: '200 g (tasse bombée)',
        de: '200 g (gehäufte Tasse)',
        it: '200 g (tazza colma)',
        pt: '200 g (chávena cheia)',
      },
    ],
  },
];

export const challengeById = new Map(challengePlans.map((p) => [p.id, p]));
