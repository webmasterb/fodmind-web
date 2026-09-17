// Lo corriente y aburrido: lo que sale en TODA etiqueta y no es FODMAP.
//
// POR QUÉ ESTO EXISTE, Y POR QUÉ NO VA EN ingredients.ts. Medido sobre doce
// etiquetas reales en cuatro idiomas, el lector dejaba SIN RECONOCER el 61 % de
// los trozos. Y no porque se le escaparan FODMAPs: porque no sabía qué era la
// sal, el agua, el aceite de girasol, el ácido cítrico ni las vitaminas. Una
// pantalla que responde «no conozco 6 de cada 10 cosas» no se usa dos veces, y
// con la cámara sería peor, porque el usuario culparía a la foto y repetiría
// hasta rendirse.
//
// El número que importa no es cuánto reconoce: es cuánto queda sin reconocer.
// Ese es el que decide si «no reconocido» significa algo. Cuando baja lo
// suficiente, lo que queda es una LISTA DE TAREAS —los ingredientes que de
// verdad faltan— en vez de ruido de fondo.
//
// LA DIFERENCIA CON LAS ENTRADAS `ok` DE ingredients.ts es el propósito, y por
// eso son dos ficheros. Allí, un `ok` está porque la gente LO TEME y hay que
// poder decirle que no pasa nada: el trigo sarraceno, la lecitina de soja, el
// jarabe de glucosa. Cada uno se ganó su nota y su fuente. Aquí no hay miedo
// que desmontar: nadie llega a esta app preguntándose por el corrector de
// acidez. Están para no estorbar, y por eso no llevan nota ni ficha. Fuente
// sí, desde el 13-sep: la pantalla afirma «sin FODMAP» de todo esto, y una
// afirmación médica se cita (ver `src` en la interfaz).
//
// LO QUE NO PUEDE ENTRAR AQUÍ: cualquier cosa que aporte un FODMAP, y cualquier
// cosa que la etiqueta deje ambigua («especias», «aroma natural»), que es
// incertidumbre y va como tal en el diccionario. Hay un test que recorre estas
// formas contra el diccionario entero y falla si alguna se solapa con un
// ingrediente FODMAP: sin él, meter aquí una palabra de más convierte una
// alarma real en un «sin problema», que es el peor fallo posible de esta app.

import { FodmapType, LocalizedString } from './types';

export interface GrupoCorriente {
  id: string;
  /** Cómo se llama el grupo cuando se enseña. */
  n: LocalizedString;
  /**
   * Lo que el grupo afirma llevar: ninguno, siempre. Se escribe en cada grupo
   * y no se da por supuesto, porque la pantalla pinta «sin FODMAP» de todo
   * esto y una afirmación médica se declara, no se sobreentiende.
   */
  fodmaps: FodmapType[];
  /**
   * La cita que sostiene ese «sin FODMAP» (id de CITATIONS). Casi siempre
   * Varney 2017, que es donde se define qué es un FODMAP —fructanos, GOS,
   * lactosa, exceso de fructosa y polioles— y por tanto qué no lo es: la sal,
   * un aceite, un ácido o una vitamina no son ninguno de esos azúcares. Es
   * `null` solo en lo que no se come (la mención legal). La guardia
   * `ingredientes-comunes.test.ts` lo cobra.
   */
  src: string | null;
  /** Las formas, los seis idiomas mezclados igual que en el diccionario. */
  forms: string[];
}

export const CORRIENTES: GrupoCorriente[] = [
  {
    id: 'menciones-legales',
    fodmaps: [],
    src: null,
    n: {
      es: 'Mención legal, no un ingrediente', en: 'Legal wording, not an ingredient',
      fr: 'Mention légale, pas un ingrédient', de: 'Rechtlicher Hinweis, keine Zutat',
      it: 'Dicitura legale, non un ingrediente', pt: 'Menção legal, não um ingrediente',
    },
    // Lo que un envase mete DENTRO de la lista y no se come: la advertencia de
    // alcohol pegada al aroma, el porcentaje variable, el origen y los sellos.
    // No van en TERMINADORES porque no cierran la lista: van en medio, y cortar
    // ahí se lleva por delante lo que viene detrás.
    forms: ['contient alcool', 'contiene alcohol', 'contains alcohol', 'enthalt alkohol',
      'contiene alcool', 'contem alcool', 'presence naturelle de polyphenols',
      'en proportion variable', 'en proporcion variable', 'in veranderlichen gewichtsanteilen',
      'percentuali espresse sul prodotto finito', 'pourcentages exprimes sur le produit fini',
      'porcentajes expresados sobre el producto acabado', 'on the finished product',
      'origine france', 'origen espana', 'origin france', 'afrique de l ouest',
      'amerique du sud', 'si necessaire pour reguler l acidite',
      // Del banco abierto, 25-ago: las mismas menciones con dos puntos, que es
      // como las escribe la mitad de los envases, mas el origen suelto y el
      // «contem» portugues de la advertencia de alergenos.
      'perou', 'contem',
      'biologisch aufgeschlossen', 'equivalent a de jus reconstitues',
      // El sello de comercio va DENTRO de la lista y con asterisco delante, que
      // la normalizacion no se lleva porque no es guion ni apostrofo.
      'bilan massique certifie rainforest alliance', 'certifie rainforest alliance',
      'rainforest alliance certified', 'mass balance', 'organic', 'biologique',
      // Y el analisis quimico de un agua mineral, que no es una lista de
      // ingredientes aunque ocupe el mismo sitio del envase.
      'residuo seco a 180 c', 'fixed residue at 180 c', 'residu sec a 180 c',
      'electrical conductivity', 'conductividad electrica', 'conductivite electrique',
      'en g', 'en mg', 'mg l', 'valores medios',
      // LA ADVERTENCIA DE ALERGENOS, que es la coletilla mas repetida de todas
      // y hasta hoy contaba entera como «sin reconocer»: 14 trozos del banco
      // abierto en cinco idiomas. Va la FRASE, nunca la categoria: «puede
      // contener trazas de» es siempre texto legal, y «frutos de cascara» a
      // secas puede ser un ingrediente de verdad y no se toca.
      'puede contener trazas de', 'puede contener', 'peut contenir des traces de',
      'peut contenir', 'puo contenere tracce di', 'puo contenere',
      'pode conter vestigios de', 'pode conter', 'kann spuren von', 'kann auch',
      'enthalten', 'may contain', 'allergy advice', 'allergen advice',
      'for allergens', 'see ingredients in bold',
      'os ingredientes em negrito contem alergenios', 'ingredienti in grassetto',
      // Y cuatro coletillas mas que salen en el banco y no son ingredientes.
      'contains a source of phenylalanine', 'contiene una fuente de fenilalanina',
      'conditionne sous atmosphere protectrice', 'envasado en atmosfera protectora',
      'contiene naturalmente zuccheri', 'trattato con alcool etilico in superficie',
      'dichiarazione nutrizionale', 'sul prodotto finito',
      // Cinco mas que pide el banco abierto: el sello de comercio justo frances,
      // que sale con asterisco y en tres redacciones distintas, y dos coletillas
      // de alergenos en ingles y en portugues.
      'ingredients issus du commerce equitable francais',
      'issus du commerce equitable francais',
      'ingredient issu du commerce equitable francais',
      'em negrito contem alergenios', 'in bold',
      'it cannot be excluded that there are any'],
  },
  {
    id: 'water-salt',
    fodmaps: [],
    src: 'varney2017',
    n: { es: 'Agua y sal', en: 'Water and salt', fr: 'Eau et sel', de: 'Wasser und Salz', it: 'Acqua e sale', pt: 'Água e sal' },
    forms: ['agua', 'water', 'eau', 'wasser', 'acqua', 'sal', 'sal marina', 'sal yodada', 'salt',
      'sea salt', 'iodised salt', 'sel', 'sel marin', 'salz', 'meersalz', 'jodsalz', 'sale',
      // «Kochsalz» es como lo escribe media etiqueta alemana y estaba solo
      // «Speisesalz». Salio cinco veces en el banco.
      'kochsalz', 'jodiertes kochsalz', 'sale marino', 'sale iodato', 'sal marinho',
      // Sellos y coletillas que van DENTRO de la lista y no son ingredientes:
      // 12 apariciones del banco contaban como «sin reconocer» por esto.
      'issus de l agriculture biologique', 'issu de l agriculture biologique',
      'agricultura ecologica', 'organic farming', 'aus biologischer landwirtschaft',
      'da agricoltura biologica', 'rspo', 'utz', 'fairtrade', 'comercio justo',
      'sale marino', 'cloruro de sodio', 'sodium chloride', 'natriumchlorid',
      'speisesalz', 'jodiertes speisesalz', 'sal fina', 'sal comun', 'agua carbonatada',
      'agua con gas', 'carbonated water', 'kohlensaure', 'eau gazeifiee', 'acqua frizzante'],
  },
  {
    id: 'oils',
    fodmaps: [],
    src: 'varney2017',
    n: { es: 'Aceites y grasas', en: 'Oils and fats', fr: 'Huiles et graisses', de: 'Öle und Fette', it: 'Oli e grassi', pt: 'Óleos e gorduras' },
    // La grasa no lleva FODMAP: los FODMAP son hidratos. Ni siquiera el aceite
    // de ajo infusionado, que es justo por lo que está en excludeIf allí.
    forms: ['aceite de ajo', 'garlic infused oil', 'garlic-infused oil', 'huile a l ail',
      'aceite de girasol', 'aceite de girasol alto oleico', 'aceite de oliva',
      'aceite de oliva virgen extra', 'aceite de palma', 'aceite de colza', 'aceite de coco',
      'aceite vegetal', 'aceites vegetales', 'grasa vegetal', 'manteca', 'mantequilla',
      'sunflower oil', 'high oleic sunflower oil', 'olive oil', 'extra virgin olive oil',
      'palm oil', 'rapeseed oil', 'canola oil', 'coconut oil', 'vegetable oil', 'vegetable fat',
      'butter', 'butterfat', 'huile de tournesol', 'huile d olive', 'huile de palme',
      'huile de colza', 'huile de coco', 'huile vegetale', 'matiere grasse vegetale', 'beurre',
      'sonnenblumenol', 'olivenol', 'palmol', 'rapsol', 'kokosol', 'pflanzenol', 'pflanzenfett',
      'butterreinfett', 'olio di girasole', 'olio di oliva', 'olio extra vergine di oliva',
      'olio di palma', 'olio di colza', 'olio di cocco', 'olio vegetale', 'burro',
      'oleo de girassol', 'oleo de palma', 'oleo vegetal', 'manteiga',
      // El generico en plural, que es como se escribe cuando la marca se reserva
      // cambiar de aceite: «pflanzliche Ole», «grasas vegetales», «oli vegetali».
      // Y la manteca de karite, que sale en tres idiomas y es grasa igual.
      'pflanzliche ole', 'pflanzliche fette', 'pflanzliche ole und fette', 'grasas vegetales', 'graisses vegetales', 'matieres grasses vegetales', 'oli vegetali', 'grassi vegetali', 'oleos vegetais', 'kokosfett', 'palmfett', 'karite', 'shea', 'manteca de karite', 'shea butter', 'beurre de karite',
      // «palme» y «palmiste» a secas, que es como los abrevia la etiqueta francesa.
      'palme', 'palmiste', 'plant oils', 'huile de palmiste', 'palm kernel oil', 'aceite de palmiste',
      // Sueltos, sin la palabra «aceite» al lado: una etiqueta que dice
      // «sunflower, rapeseed» dejaba las dos sin reconocer. 31 apariciones.
      'sunflower', 'rapeseed', 'tournesol', 'colza', 'nabina', 'huiles vegetales',
      'sustainable palm', 'palm', 'palma', 'girasol', 'girassol', 'raps',
      'sonnenblumen', 'olio di semi', 'oleo de colza',
      // EL GENERICO, QUE FALTABA. Estaban «aceite de girasol» y hasta los
      // sueltos raros («colza», «palme»), pero no «aceite» a secas: una etiqueta
      // que pone «cebolla, ajo, sal, aceite» dejaba el aceite sin reconocer, y
      // cada trozo sin reconocer sube el numerador de `pareceMalLeido` y el de
      // `convieneReintentarConIA`, o sea que ensucia el aviso de foto mal leida
      // y puede empujar una llamada de pago al modelo por una palabra que la app
      // sabe que no aporta FODMAP.
      //
      // En FODMAP la grasa no tiene apellido: ninguna aporta, venga de donde
      // venga, asi que reconocerla no inventa nada — es el caso contrario al de
      // «harina», donde el cereal SI decide y por eso se queda fuera a proposito
      // (docs/fuentes/sin-reconocer.json, cubo «generico»).
      //
      // «ole», «oli» y «oil» miden menos de cinco caracteres, asi que `apareceEn`
      // ya les exige palabra entera y no pueden colarse dentro de otra palabra.
      // El «ol» aleman suelto se queda fuera: mide dos y la guardia de
      // `common-ingredients.test.ts` no admite formas de menos de tres.
      'aceite', 'aceites', 'huile', 'huiles', 'oil', 'oils', 'olio', 'oli', 'oleo',
      'oleos', 'ole', 'fett', 'fette', 'grasa', 'grasas', 'graisse', 'graisses',
      'gordura', 'gorduras', 'grasso', 'grassi',
      // Y el «N % de materia grasa» de todo lacteo europeo. El porcentaje ya no
      // se lee como QUID (PORCENTAJE_QUE_NO_ES_CANTIDAD en label-scan.ts); esto
      // es para que el resto del trozo deje de contar como no reconocido.
      'materia grasa', 'materias grasas', 'matiere grasse', 'matieres grasses',
      'fettgehalt', 'fettanteil', 'materia gorda', 'teor de gordura'],
  },
  {
    id: 'cocoa',
    fodmaps: [],
    src: 'varney2017',
    n: { es: 'Cacao y café', en: 'Cocoa and coffee', fr: 'Cacao et café', de: 'Kakao und Kaffee', it: 'Cacao e caffè', pt: 'Cacau e café' },
    forms: ['cacao', 'pasta de cacao', 'manteca de cacao', 'cacao desgrasado', 'cacao en polvo',
      'cocoa', 'cocoa mass', 'cocoa butter', 'cocoa powder', 'cocoa solids', 'cocoa liquor',
      'pate de cacao', 'beurre de cacao', 'kakao', 'kakaomasse', 'kakaobutter', 'kakaopulver',
      'kakaobohnen', 'massa di cacao', 'burro di cacao', 'cacau', 'manteiga de cacau',
      'cafe', 'coffee', 'kaffee', 'caffe', 'kaffeebohnen', 'cafe soluble', 'instant coffee'],
  },
  {
    id: 'acids',
    fodmaps: [],
    src: 'varney2017',
    n: { es: 'Ácidos y correctores de acidez', en: 'Acids and acidity regulators', fr: 'Acides et correcteurs d’acidité', de: 'Säuren und Säureregulatoren', it: 'Acidi e correttori di acidità', pt: 'Ácidos e reguladores de acidez' },
    forms: ['acido citrico', 'acido lactico', 'acido ascorbico', 'acido malico', 'acido acetico',
      'acido tartarico', 'acido fosforico', 'corrector de acidez', 'correctores de acidez',
      'acidulante', 'citric acid', 'lactic acid', 'ascorbic acid', 'malic acid', 'acetic acid',
      'tartaric acid', 'phosphoric acid', 'acidity regulator', 'acidifier',
      'acide citrique', 'acide lactique', 'acide ascorbique', 'acide malique',
      'correcteur d acidite', 'acidifiant', 'zitronensaure', 'milchsaure', 'ascorbinsaure',
      'apfelsaure', 'saureregulator', 'sauerungsmittel', 'acido lattico',
      'correttore di acidita', 'acidificante', 'citrato de sodio', 'sodium citrate',
      'citrato sodico', 'natriumcitrat', 'vinagre', 'vinagre de vino', 'vinegar',
      'spirit vinegar', 'wine vinegar', 'vinaigre', 'essig', 'branntweinessig', 'aceto',
      // «acid» y «acido» a secas, que es lo que queda cuando el OCR o la propia
      // etiqueta parten «acidity regulator» o «acido citrico» por la mitad.
      'acid', 'acido', 'acide', 'saure', 'acide phosphorique', 'phosphoric acid', 'acido fosforico', 'phosphorsaure',
      // Del banco abierto, 25-ago: las formas que faltaban en frances, aleman e
      // italiano de lo que este grupo ya cubre en las otras lenguas.
      'regulateurs d acidite', 'regulateur d acidite', 'acetates de sodium',
      'acetate de sodium', 'tartrato monopotassico', 'tartrato di potassio',
      'l tartrat', 'iodato di potassio', 'cloruro sodico'],
  },
  {
    id: 'preservatives',
    fodmaps: [],
    src: 'varney2017',
    n: { es: 'Conservantes y antioxidantes', en: 'Preservatives and antioxidants', fr: 'Conservateurs et antioxydants', de: 'Konservierungs- und Antioxidationsmittel', it: 'Conservanti e antiossidanti', pt: 'Conservantes e antioxidantes' },
    forms: ['conservador', 'conservadores', 'conservante', 'conservantes', 'antioxidante',
      'antioxidantes', 'sorbato de potasio', 'benzoato de sodio', 'nitrito de sodio',
      'sulfito', 'sulfitos', 'metabisulfito', 'preservative', 'preservatives', 'antioxidant',
      'potassium sorbate', 'sodium benzoate', 'sodium nitrite', 'sulphite', 'sulfite',
      'conservateur', 'antioxygene', 'sorbate de potassium', 'benzoate de sodium',
      'konservierungsstoff', 'antioxidationsmittel', 'kaliumsorbat', 'natriumbenzoat',
      'conservanti', 'antiossidante', 'sorbato di potassio', 'sorbato potasico',
      // «antioxydant» en frances: estaba «antioxygene», que es el otro.
      'antioxydant', 'antioxydants', 'benzoesaure', 'sorbinsaure', 'ascorbato sodico', 'eritorbato sodico', 'nitrito sodico', 'acido ascorbico', 'ascorbinsaure',
      'sorbato de calcio', 'conservador natural',
      'tocoferoles', 'tocopherols', 'tocopherol', 'extracto de romero', 'rosemary extract',
      // Potenciadores de sabor: no aportan FODMAP. El EXTRACTO DE LEVADURA no
      // está aquí y no puede estarlo — es dudoso y vive en el diccionario.
      'glutamato monosodico', 'glutamato', 'monosodium glutamate', 'flavour enhancer',
      'flavor enhancer', 'potenciador del sabor', 'exhausteur de gout',
      'glutamate monosodique', 'geschmacksverstarker', 'mononatriumglutamat',
      'esaltatore di sapidita', 'glutammato monosodico', 'inosinato', 'guanilato',
      'ribonucleotidos', 'ribonucleotides'],
  },
  {
    id: 'emulsifiers',
    fodmaps: [],
    src: 'varney2017',
    n: { es: 'Emulgentes y estabilizantes', en: 'Emulsifiers and stabilisers', fr: 'Émulsifiants et stabilisants', de: 'Emulgatoren und Stabilisatoren', it: 'Emulsionanti e stabilizzanti', pt: 'Emulsionantes e estabilizadores' },
    // Los polioles que se usan como estabilizante (sorbitol, maltitol, glicerol)
    // NO están aquí: son FODMAP y viven en el diccionario con su número E.
    forms: ['emulgente', 'emulgentes', 'emulsionante', 'estabilizante', 'estabilizantes',
      'espesante', 'espesantes', 'gelificante', 'emulsifier', 'emulsifiers', 'stabiliser',
      'stabilizer', 'thickener', 'gelling agent', 'emulsifiant', 'stabilisant', 'epaississant',
      'gelifiant', 'emulgator', 'stabilisator', 'verdickungsmittel', 'geliermittel',
      'emulsionanti', 'stabilizzante', 'addensante', 'gelificante',
      'mono y digliceridos', 'mono- y digliceridos', 'monogliceridos', 'digliceridos',
      'mono and diglycerides', 'mono- and diglycerides', 'monoglycerides', 'diglycerides',
      'mono et diglycerides', 'mono und diglyceride', 'mono e digliceridi',
      'goma xantana', 'xanthan gum', 'gomme xanthane', 'xanthan', 'gomma di xantano',
      'goma guar', 'guar gum', 'gomme de guar', 'guarkernmehl', 'farina di guar',
      'goma gellan', 'gellan gum', 'goma garrofin', 'locust bean gum', 'carragenano',
      'carrageenan', 'carraghenane', 'carrageen', 'carragenina', 'pectina', 'pectin',
      'pektin', 'pectine', 'lecitina de girasol', 'sunflower lecithin', 'lecithine de tournesol',
      'lecithine', 'lecithines', 'lecitine', 'lecitina', 'lecithin', 'lecitinas',
      'sonnenblumenlecithin', 'fosfato', 'fosfatos', 'phosphate', 'phosphates', 'difosfato',
      'trifosfato', 'polifosfato',
      'flour treatment agent', 'flour treatment agents', 'agente de tratamiento de la harina',
      'agent de traitement de la farine', 'mehlbehandlungsmittel', 'acido ascorbico e300',
      // Los numeros E de emulgente y conservante que NO son poliol. Los que SI
      // lo son —E420, E421, E953, E965, E966, E967— viven en el diccionario y
      // no pueden entrar aqui: hay un test que lo comprueba.
      'e471', 'e472', 'e472a', 'e472b', 'e472c', 'e472e', 'e481', 'e482', 'e322',
      'e440', 'e412', 'e415', 'e410', 'e407', 'e401', 'e451', 'e450', 'e500',
      'e503', 'e202', 'e282', 'e330', 'e300', 'e301', 'e306', 'e307', 'e160a',
      // Del banco abierto, 25-ago. El humectante y el potenciador no tenian
      // grupo y son de la misma familia: aditivo tecnologico sin carbohidrato.
      // El glicerol AQUI es E422 usado como humectante; el poliol con numero E
      // vive en el diccionario y hay un test que impide confundirlos.
      'humectant', 'humectante', 'humectants', 'feuchthaltemittel', 'umettante',
      'polyglycerol polyricinoleate', 'poliricinoleato de poliglicerol', 'e476',
      'inosinate disodique', 'dinatriuminosinat', 'inosinato disodico',
      'disodium inosinate', 'e631', 'e627', 'e635',
      'antioxidationsmitel', 'getrankegrundstoff'],
  },
  {
    id: 'starches',
    fodmaps: [],
    src: 'varney2017',
    n: { es: 'Almidones y fibras', en: 'Starches and fibres', fr: 'Amidons et fibres', de: 'Stärken und Fasern', it: 'Amidi e fibre', pt: 'Amidos e fibras' },
    // El almidón es glucosa encadenada: no es FODMAP, venga del cereal que
    // venga. El almidón de TRIGO es la excepción y va en el diccionario, porque
    // arrastra restos de fructanos.
    forms: ['almidon modificado', 'almidones modificados', 'almidon', 'fecula', 'fecula de patata',
      'modified starch', 'modified maize starch', 'starch', 'potato starch', 'tapioca starch',
      'amidon modifie', 'amidon', 'fecule', 'fecule de pomme de terre',
      'modifizierte starke', 'starke', 'kartoffelstarke', 'amido modificato', 'amido',
      // Fibras de citrico y de bambu: son pared celular, no un azucar fermentable.
      // Salen ocho veces entre las dos. La fibra SIN nombre («fibra vegetal»,
      // «dietary fibre») ya no esta aqui: suele ser inulina de achicoria y va
      // al diccionario como ambigua (fibre-unspecified).
      'citrusfasern', 'citrus fibre', 'citrus fiber', 'fibra de citricos', 'fibre d agrumes', 'fibra di agrumi', 'bambusfasern', 'fibra de bambu', 'bamboo fibre',
      'amido di patate', 'amido de mandioca', 'tapioca', 'maltodextrina', 'maltodextrin',
      'maltodextrine', 'maltodestrine', 'maltodestrina', 'dextrina', 'dextrin',
      // Fibras CON NOMBRE que no fermentan como los FODMAP y salian como
      // desconocidas. La fibra sin nombre va en el diccionario como ambigua.
      'psyllium', 'plantago ovata', 'cascara de psyllium', 'fibra de bambu',
      'celulosa', 'cellulose', 'metilcelulosa', 'goma base', 'gum base'],
  },
  {
    id: 'raising',
    fodmaps: [],
    src: 'varney2017',
    n: { es: 'Gasificantes y levaduras', en: 'Raising agents and yeast', fr: 'Poudres à lever et levures', de: 'Backtriebmittel und Hefe', it: 'Agenti lievitanti e lievito', pt: 'Levedantes e levedura' },
    // La levadura es hongo y no aporta FODMAP. El EXTRACTO de levadura sí es
    // dudoso y está en el diccionario: no se toca aquí.
    forms: ['gasificante', 'gasificantes', 'levadura', 'levadura fresca', 'levadura seca',
      'impulsor', 'bicarbonato de sodio', 'bicarbonato sodico', 'bicarbonato amonico',
      'bicarbonato', 'raising agent', 'raising agents', 'yeast', 'baking powder',
      'sodium bicarbonate', 'ammonium bicarbonate', 'baking soda',
      // El bicarbonato de amonio, escrito como «carbonato acido», que es como lo
      // pone la etiqueta francesa y la portuguesa.
      'carbonato acido de amonio', 'carbonate acide d ammonium', 'ammonium acid carbonate', 'ammonium carbonates', 'carbonato di ammonio', 'carbonato acido de sodio', 'sodium acid carbonate', 'natriumcarbonat', 'ammoniumcarbonat', 'hirschhornsalz',
      'poudre a lever', 'levure', 'levure de boulanger', 'levure chimique',
      'bicarbonate de sodium', 'backtriebmittel', 'hefe', 'backpulver', 'natriumbicarbonat',
      'natron', 'agente lievitante', 'lievito', 'lievito naturale', 'lievito di birra',
      // EN PLURAL, que es como los escribe la etiqueta. Entre todos sumaban 60
      // apariciones del banco de 342 y no casaba ninguno, porque estaban en
      // singular: «poudre a lever» no encuentra «poudres a lever».
      'poudres a lever', 'levures', 'agenti lievitanti', 'lieviti',
      'carbonates d ammonium', 'carbonate d ammonium', 'carbonates de sodium',
      'carbonate acide de sodium', 'carbonate de sodium', 'diphosphate disodique',
      'diphosphates', 'carbonato acido di sodio', 'carbonato acido di ammonio',
      'carbonato acido d ammonio', 'carbonati di sodio', 'bicarbonato di ammonio',
      'difosfato disodico', 'difosfati', 'ammoniumcarbonate', 'natriumcarbonate',
      'carbonato de amonio', 'carbonatos de sodio', 'fermento in polvere',
      'bicarbonato di sodio', 'fermento', 'fermentos lacticos', 'lactic ferments',
      'ferments lactiques', 'milchsaurekulturen', 'fermenti lattici', 'cultivos lacticos',
      'starter cultures',
      // Las bacterias de los yogures y quesos, por su nombre cientifico, que es
      // como vienen en la etiqueta. 38 apariciones en el corpus.
      'lactobacillus', 'lactobacillus acidophilus', 'acidophilus', 'bulgaricus',
      'streptococcus thermophilus', 'thermophilus', 'bifidobacterium', 'bifidus',
      'lactococcus', 'casei', 'lactis', 'cultivos vivos', 'live cultures',
      // «cultures» y «ferments» a secas: estaban las formas con apellido
      // —«live cultures», «fermentos lacticos»— y no las sueltas.
      'cultures', 'ferments', 'starter cultures', 'lactic culture', 'kasereikulturen', 'fermenti', 'culture', 'coagulante microbiano', 'coagulante', 'cuajo', 'rennet', 'presure',
      'ferments lactiques', 'fermenti lattici',
      // Enzimas: proteinas que actuan y desaparecen, no aportan FODMAP.
      'lactasa', 'lactase', 'laktase', 'lattasi', 'enzimas', 'enzymes', 'enzyme',
      'amilasa', 'amylase', 'proteasa', 'protease', 'cuajo', 'rennet', 'lab',
      // Cuatro que pide el banco: una bacteria de cultivo por su genero, el
      // cultivo iniciador en aleman y en ingles, y el mejorante de panaderia.
      'leuconostoc', 'starterkulturen', 'leavening agents', 'mejorante panario'],
  },
  {
    id: 'vitamins',
    fodmaps: [],
    src: 'varney2017',
    n: { es: 'Vitaminas y minerales', en: 'Vitamins and minerals', fr: 'Vitamines et minéraux', de: 'Vitamine und Mineralstoffe', it: 'Vitamine e minerali', pt: 'Vitaminas e minerais' },
    forms: ['vitamina', 'vitaminas', 'vitamin', 'vitamins', 'vitamine', 'vitamines', 'vitaminen',
      'niacina', 'niacin', 'riboflavina', 'riboflavin', 'tiamina', 'thiamin', 'thiamine',
      'acido folico', 'folic acid', 'biotina', 'biotin', 'hierro', 'iron', 'fer', 'eisen',
      // La acerola sale nueve veces en el banco y siempre como «extrait
      // d'acerola»: es la vitamina C natural con la que se conserva un producto.
      'acerola', 'extracto de acerola', 'extrait d acerola', 'acerola extract', 'acerolaextrakt', 'estratto di acerola',
      'ferro', 'calcio', 'calcium', 'kalzium', 'carbonato calcico', 'carbonato de calcio',
      'calcium carbonate', 'carbonate de calcium', 'calciumcarbonat', 'zinc', 'zink',
      'magnesio', 'magnesium', 'potasio', 'potassium', 'kalium', 'yodo', 'iodine',
      'sulfato ferroso', 'ferrous sulphate', 'fosfato calcico',
      // Las vitaminas B van sueltas en media etiqueta de bebida energetica.
      // Solo las de tres caracteres o mas: «b6» suelta casaria en cualquier
      // codigo de lote y el minimo de tres esta puesto justo para eso.
      'b12', 'vitamina b6', 'vitamin b6', 'vitamina c', 'vitamin c', 'acido pantotenico',
      'pantothensaure', 'pantothenic acid', 'piridoxina', 'pyridoxin', 'cobalamina',
      'taurina', 'taurin', 'taurine', 'cafeina', 'koffein', 'caffeine', 'cafeine', 'caffeina'],
  },
  {
    // LA MITAD DE UNA LATA DE BEBIDA ENERGETICA, que hasta ahora salia entera
    // como «no reconocido». Del banco abierto, una etiqueta alemana la lista
    // con sus porcentajes: Panax Ginseng Wurzelextrakt 0,08 %, L-Carnitin
    // L-Tartrat 0,015 %, Guaranasamenextrakt 0,002 %, y Glucuronolacton e
    // Inosit. El «L-Tartrat» no esta aqui: lo coge «acidos», que es su sitio.
    // Inosit sin porcentaje al final de la lista.
    //
    // POR QUE NO SON FODMAP. La carnitina es un derivado de aminoacido, la
    // glucuronolactona una lactona y el inositol un ciclitol: ninguno es de los
    // seis polioles que si lo son —sorbitol, manitol, isomalt, maltitol,
    // lactitol y xilitol—, que ademas van todos por su nombre en el
    // diccionario. Y los tres extractos de planta estan declarados en
    // centesimas de por ciento, que es donde ya no hay dosis de nada.
    //
    // La taurina y la cafeina no estan aqui: ya estaban en «vitaminas».
    id: 'estimulantes',
    fodmaps: [],
    src: 'varney2017',
    n: {
      es: 'Estimulantes de bebida energética', en: 'Energy drink stimulants',
      fr: 'Stimulants de boisson énergétique', de: 'Energydrink-Stimulanzien',
      it: 'Stimolanti da energy drink', pt: 'Estimulantes de bebida energética',
    },
    forms: ['carnitina', 'carnitin', 'carnitine', 'l carnitin', 'l carnitina', 'l carnitine',
      'glucuronolactona', 'glucuronolacton', 'glucuronolactone',
      'glucuronolattone', 'inositol', 'inosit', 'inositolo',
      'guarana', 'guaranasamenextrakt', 'extracto de guarana', 'extrait de guarana',
      'guarana extract', 'estratto di guarana',
      'ginseng', 'panax ginseng', 'ginsengwurzel', 'extracto de ginseng', 'extrait de ginseng',
      'yerba mate', 'mate tee', 'mate tee extrakt', 'extracto de mate', 'extrait de mate'],
  },
  {
    id: 'colours',
    fodmaps: [],
    src: 'varney2017',
    n: { es: 'Colorantes', en: 'Colours', fr: 'Colorants', de: 'Farbstoffe', it: 'Coloranti', pt: 'Corantes' },
    forms: ['colorante', 'colorantes', 'colour', 'colours', 'color', 'colors', 'colouring',
      'coloring', 'colorant', 'colorants', 'farbstoff', 'farbstoffe', 'lebensmittelfarbe',
      'coloranti', 'corante', 'caramelo', 'color caramelo', 'caramel', 'caramel colour',
      // Gomas y gases. La goma gellan, el konjac y la tara son polisacaridos que
      // no se fermentan como un FODMAP y ademas van en miligramos.
      'gellan', 'goma gellan', 'gellan gum', 'konjak', 'konjac', 'glucomanano', 'tarakernmehl', 'goma tara', 'tara gum',
      // Y LAS QUE FALTABAN, que son el mismo caso y llevaban lotes fuera por
      // descuido: el banco abierto las pide SIETE veces en cinco idiomas
      // —«carragenato», «gomme guar», «garrofin gum», «gomme d'acacia», «gomme
      // arabique», «johannisbrotkernmehl», «alginato sodico»— y aqui estaban ya
      // sus hermanas gellan, konjac y tara con la misma nota.
      'carragenato', 'carragenano', 'carrageenan', 'carraghenane', 'carragenina',
      'goma guar', 'gomme guar', 'guar gum', 'guarkernmehl', 'gomma di guar',
      'garrofin gum', 'goma garrofin', 'johannisbrotkernmehl', 'farine de caroube',
      'gomme d acacia', 'gomme arabique', 'goma arabiga', 'gum arabic',
      'alginato sodico', 'alginate de sodium', 'sodium alginate', 'sulphur dioxide', 'sulfur dioxide', 'dioxido de azufre', 'sussungsmittel', 'sodium carbonates', 'carbonatos de sodio',
      // El caroteno sale cinco veces en el banco y es un colorante, no una
      // zanahoria: viene de la zanahoria pero lo que se anade es el pigmento.
      'carotin', 'carotine', 'caroteno', 'betacaroteno', 'beta caroteno', 'beta carotene', 'betacarotene', 'carotenos', 'annatto', 'achiote', 'farbende lebensmittel',
      'karamell', 'zuckerkulor', 'curcuma', 'turmeric', 'kurkuma', 'cochinilla',
      'carmin', 'carmine', 'betanina', 'clorofila', 'chlorophyll', 'antocianinas',
      'anthocyanins', 'carotenos', 'carotenes', 'betacaroteno', 'beta-carotene',
      'extracto de pimenton', 'paprika extract', 'oleorresina de pimenton'],
  },
  {
    id: 'simple-sugars',
    fodmaps: [],
    src: 'varney2017',
    n: { es: 'Azúcares simples', en: 'Simple sugars', fr: 'Sucres simples', de: 'Einfachzucker', it: 'Zuccheri semplici', pt: 'Açúcares simples' },
    // Sacarosa, glucosa y dextrosa NO son FODMAP: la sacarosa trae glucosa y
    // fructosa a partes iguales, y es el EXCESO de fructosa sobre la glucosa lo
    // que da problema. La fructosa sola y el jarabe de glucosa-fructosa sí lo
    // son, y están en el diccionario: aquí no cabe ninguno de los dos.
    forms: ['azucar', 'azucar de cana', 'azucar moreno', 'azucar invertido', 'sacarosa',
      'glucosa', 'dextrosa', 'jarabe de azucar', 'sugar', 'cane sugar', 'brown sugar',
      'invert sugar', 'sucrose', 'glucose', 'dextrose', 'sucre', 'sucre de canne',
      'saccharose', 'zucker', 'rohrzucker', 'saccharose', 'traubenzucker', 'glukose',
      'zucchero', 'zucchero di canna', 'saccarosio', 'glucosio', 'destrosio',
      'acucar', 'acucar mascavado', 'sacarose'],
  },
  {
    id: 'sweeteners-safe',
    fodmaps: [],
    src: 'varney2017',
    n: { es: 'Edulcorantes sin poliol', en: 'Polyol-free sweeteners', fr: 'Édulcorants sans polyol', de: 'Süßstoffe ohne Polyole', it: 'Dolcificanti senza polioli', pt: 'Adoçantes sem poliol' },
    // Los intensos no se absorben en el intestino delgado en cantidad
    // suficiente para fermentar: no son FODMAP. Los polioles SÍ lo son y no
    // están aquí: sorbitol, manitol, maltitol, xilitol e isomalt van en el
    // diccionario, por nombre y por número E.
    forms: ['sucralosa', 'sucralose', 'aspartamo', 'aspartame', 'acesulfamo', 'acesulfame',
      'acesulfamo k', 'sacarina', 'saccharin', 'saccharine', 'estevia', 'stevia',
      // «Acesulfam K» sin la o final: la forma alemana e inglesa.
      'acesulfam k', 'acesulfame k', 'acesulfam kalium', 'natriumcyclamat', 'enzymatisch hergestellte steviolglycoside',
      'glucosidos de esteviol', 'steviol glycosides', 'ciclamato', 'cyclamate',
      'neohesperidina', 'taumatina', 'thaumatin', 'edulcorante', 'edulcorantes',
      'sweetener', 'sweeteners', 'edulcorant', 'susungsmittel', 'susstoff',
      'dolcificante', 'dolcificanti', 'adocante'],
  },
  {
    id: 'proteins',
    fodmaps: [],
    src: 'varney2017',
    n: { es: 'Carnes, pescados y huevo', en: 'Meat, fish and egg', fr: 'Viandes, poissons et œuf', de: 'Fleisch, Fisch und Ei', it: 'Carne, pesce e uovo', pt: 'Carne, peixe e ovo' },
    // La proteína animal no lleva hidratos, así que no lleva FODMAP. Lo que se
    // le añade —el caldo, el sofrito, el aroma— sí, y eso se lee aparte.
    forms: ['carne', 'carne de pollo', 'carne de cerdo', 'carne de vacuno', 'pollo', 'cerdo',
      'ternera', 'pavo', 'jamon', 'atun', 'salmon', 'huevo', 'huevos', 'clara de huevo',
      'yema de huevo', 'ovoproducto', 'meat', 'chicken', 'pork', 'beef', 'turkey', 'ham',
      'tuna', 'egg', 'eggs', 'egg white', 'egg yolk', 'viande', 'poulet', 'porc', 'boeuf',
      'jambon', 'thon', 'saumon', 'oeuf', 'oeufs', 'blanc d oeuf', 'fleisch', 'hahnchen',
      'schweinefleisch', 'rindfleisch', 'schinken', 'thunfisch', 'lachs', 'eier', 'huhnerei',
      'eiklar', 'carne di pollo', 'carne di maiale', 'manzo', 'prosciutto', 'tonno',
      'salmone', 'uovo', 'uova', 'albume', 'frango', 'porco', 'presunto', 'ovo', 'ovos',
      'gelatina', 'gelatin', 'gelatine', 'colageno', 'collagen'],
  },
  {
    id: 'common-spices',
    fodmaps: [],
    src: 'varney2017',
    n: { es: 'Especias y hierbas concretas', en: 'Named spices and herbs', fr: 'Épices et herbes nommées', de: 'Benannte Gewürze und Kräuter', it: 'Spezie ed erbe nominate', pt: 'Especiarias e ervas nomeadas' },
    // OJO: aquí solo las que la etiqueta NOMBRA. «Especias» y «mezcla de
    // especias» a secas NO están: son ambiguas, muchas veces llevan ajo o
    // cebolla dentro, y por eso van en el diccionario como incertidumbre.
    forms: ['pimienta', 'pimienta negra', 'pimienta blanca', 'pimenton', 'canela', 'comino',
      'oregano', 'tomillo', 'romero', 'laurel', 'perejil', 'albahaca', 'jengibre', 'nuez moscada',
      'clavo', 'cardamomo', 'anis', 'eneldo', 'cilantro', 'azafran', 'curcuma',
      'pepper', 'black pepper', 'white pepper', 'paprika', 'cinnamon', 'cumin', 'oregano',
      'thyme', 'rosemary', 'bay leaf', 'parsley', 'basil', 'ginger', 'nutmeg', 'clove',
      'cardamom', 'aniseed', 'dill', 'coriander', 'saffron',
      'poivre', 'cannelle', 'cumin', 'origan', 'thym', 'romarin', 'laurier', 'persil',
      'basilic', 'gingembre', 'muscade', 'girofle', 'aneth', 'safran',
      'pfeffer', 'zimt', 'kummel', 'oregano', 'thymian', 'rosmarin', 'lorbeer', 'petersilie',
      'basilikum', 'ingwer', 'muskatnuss', 'nelken', 'safran',
      'pepe', 'cannella', 'origano', 'timo', 'rosmarino', 'alloro', 'prezzemolo', 'basilico',
      'zenzero', 'noce moscata', 'chiodi di garofano', 'zafferano',
      // «salsa» es perejil en portugués y sauce en español: fuera, porque
      // «salsa de cebolla» no puede acabar clasificada como hierba.
      'pimenta', 'canela', 'cominho', 'oregaos', 'manjericao', 'gengibre',
      'vanillina', 'vanillin', 'vanilline',
      'vainilla', 'extracto de vainilla', 'aroma de vainilla', 'vanilla', 'vanilla extract',
      // «Krauter» y «herb extract»: hierbas sin decir cuales. Van con las especias
      // porque van en cantidad de especia, que es donde ninguna de las seis llega.
      'herb extract', 'extracto de hierbas', 'extrait de plantes', 'extraits vegetaux', 'krauter', 'krauterextrakt', 'erbe', 'ervas',
      'vanilla flavouring', 'vanille', 'extrait de vanille', 'arome naturel de vanille',
      'vanilleextrakt', 'vaniglia', 'estratto di vaniglia', 'baunilha'],
  },
];

/** Todas las formas, por si alguien las necesita sueltas. */
export const FORMAS_CORRIENTES = CORRIENTES.flatMap((g) => g.forms);

// AQUÍ VIVÍA `corrienteById`, y se borró por el mismo motivo que su gemelo de
// `ingredients.ts`: cero lectores y un `Map` de ~90 grupos construido al evaluar
// el módulo.
