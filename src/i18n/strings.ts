import type { Locale } from '../lib/rutas';

export const APP_STORE_URL = 'https://apps.apple.com/app/id6795241315';
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.fodmapguide.app';
export const CONTACT_EMAIL = 'soporte@fodmind.com';

export interface Strings {
  navAlimentos: string;
  navGuia: string;
  navBlog: string;
  ctaApp: string;
  searchPlaceholder: string;
  readMore: string;
  seeCategory: string;

  heroBadge: string;
  heroTitle: string;
  heroText: string;
  heroCta: string;
  heroCtaSecondary: string;
  statFoods: string;
  statOffline: string;
  statLangs: string;

  featuresTitle: string;
  features: { icon: string; t: string; d: string }[];

  exploreTitle: string;
  exploreText: string;
  exploreCta: string;

  faqTitle: string;
  faq: { q: string; a: string }[];

  levelNames: Record<'low' | 'moderate' | 'high', string>;
  levelDescriptions: Record<'low' | 'moderate' | 'high', string>;
  safeServing: string;
  typicalServing: string;
  /** Compara la ración habitual con la segura. Admite {t}, {r} y {u}. */
  servingContext: string;
  fodmapPresent: string;
  fodmapTypes: Record<'fructans' | 'gos' | 'lactose' | 'fructose' | 'sorbitol' | 'mannitol', string>;
  noLimit: string;
  notEstablished: string;
  similarTitle: string;
  similarSub: string;
  notice: string;
  foodFaqQ: string;
  faqALow: string;
  faqAModerate: string;
  faqAHigh: string;
  faqANoLimit: string;
  faqANotEstablished: string;
  foodMetaTitle: string;
  foodMetaDescLow: string;
  foodMetaDescModerate: string;
  foodMetaDescHigh: string;
  foodMetaDescNull: string;
  foodMetaDescNoEst: string;

  foodsIndexTitle: string;
  foodsIndexText: string;
  categoriesTitle: string;
  catMetaTitle: string;
  catMetaDesc: string;
  nFoods: string;

  guideTitle: string;
  guideText: string;
  guideIndexTitle: string;

  blogTitle: string;
  blogText: string;
  blogIndexTitle: string;

  privacyTitle: string;
  privacyBody: string[];
  termsTitle: string;
  termsBody: string[];

  footerDisclaimer: string;
  footerSources: string;
  langSwitch: string;

  notFoundTitle: string;
  notFoundText: string;
  metaHomeTitle: string;
  metaHomeDesc: string;
}

export const STR: Record<Locale, Strings> = {
  es: {
    navAlimentos: 'Alimentos',
    navGuia: 'Guía',
    navBlog: 'Blog',
    ctaApp: 'Descargar la app',
    searchPlaceholder: 'Buscar un alimento…',
    readMore: 'Leer más',
    seeCategory: 'Ver la categoría',

    heroBadge: 'Escáner FODMAP para iOS y Android',
    heroTitle: '¿Puedo comer esto? Escanéalo y lo sabes.',
    heroText:
      'Fodmind clasifica 1.843 alimentos con un semáforo FODMAP, escanea códigos de barras, lee etiquetas con la cámara y te acompaña en la dieta baja en FODMAP fase a fase.',
    heroCta: 'Descargar gratis',
    heroCtaSecondary: 'Explorar alimentos',
    statFoods: '1.843 alimentos clasificados',
    statOffline: 'Sin cuentas ni anuncios, funciona offline',
    statLangs: 'En 6 idiomas',

    featuresTitle: 'Todo lo que necesitas para la dieta baja en FODMAP',
    features: [
      {
        icon: '📷',
        t: 'Lector de etiquetas',
        d: 'Fotografía la lista de ingredientes de un producto y Fodmind te dice si es bajo en FODMAP.',
      },
      {
        icon: '🔎',
        t: 'Escáner de código de barras',
        d: 'Escanea cualquier envase y consulta su clasificación al momento, en el supermercado.',
      },
      {
        icon: '🚦',
        t: 'Semáforo por raciones',
        d: 'Verde, ámbar o rojo según la ración de verdad que se come, no solo según la tabla de laboratorio.',
      },
      {
        icon: '🗺️',
        t: 'Guía por fases',
        d: 'Eliminación, reintroducción y personalización explicadas paso a paso, con retos prácticos.',
      },
      {
        icon: '📔',
        t: 'Diario de síntomas',
        d: 'Anota comidas y síntomas con su intensidad y descubre tus desencadenantes.',
      },
      {
        icon: '🍳',
        t: 'Recetas',
        d: 'Recetas bajas en FODMAP filtrables para cada comida del día.',
      },
    ],

    exploreTitle: '1.843 alimentos, con su ración segura',
    exploreText:
      'Cada alimento lleva su semáforo, su ración segura en gramos y los FODMAPs que contiene. Empieza por lo que más buscas:',
    exploreCta: 'Ver todos los alimentos',

    faqTitle: 'Preguntas frecuentes',
    faq: [
      {
        q: '¿Qué son los FODMAP?',
        a: 'Son hidratos de carbono de cadena corta (oligosacáridos, disacáridos, monosacáridos y polioles) que se absorben mal en el intestino delgado y fermentan, causando gases, hinchazón y dolor en personas con intestino sensible.',
      },
      {
        q: '¿Es gratis?',
        a: 'Puedes descargar Fodmind gratis y consultar el buscador de alimentos. El lector de etiquetas, la guía completa y el diario se desbloquean con una suscripción, con una semana de prueba gratis.',
      },
      {
        q: '¿Funciona sin conexión?',
        a: 'Sí. La base de alimentos, la guía y el diario funcionan 100 % offline. Solo el lector de etiquetas necesita conexión para enviar la foto al servidor.',
      },
      {
        q: '¿Sustituye el consejo de un dietista?',
        a: 'No. Fodmind es una herramienta educativa que te ayuda a seguir la dieta baja en FODMAP, pero no diagnostica ni sustituye a un profesional sanitario.',
      },
    ],

    levelNames: {
      low: 'Bajo en FODMAP',
      moderate: 'Moderado',
      high: 'Alto en FODMAP',
    },
    levelDescriptions: {
      low: 'Puedes comer una ración normal sin problema.',
      moderate: 'La ración segura es menor que la habitual: ajusta la cantidad.',
      high: 'La ración habitual supera la ración segura. Mira cuánto cabe: no es una prohibición.',
    },
    safeServing: 'Ración segura',
    typicalServing: 'Ración habitual',
    servingContext: 'Una ración normal son {t} {u} y la segura {r} {u}: la diferencia es lo que decide si sienta bien.',
    fodmapPresent: 'FODMAPs en cantidad relevante',
    fodmapTypes: {
      fructans: 'Fructanos',
      gos: 'GOS (galacto-oligosacáridos)',
      lactose: 'Lactosa',
      fructose: 'Fructosa en exceso',
      sorbitol: 'Sorbitol',
      mannitol: 'Manitol',
    },
    noLimit: 'Sin límite práctico',
    notEstablished: 'Ración baja no establecida',
    similarTitle: 'Parecidos que sí puedes',
    similarSub: 'Cumplen un papel parecido en el plato, con mejor tolerancia.',
    notice:
      'Información educativa, no consejo médico. Datos compilados de literatura científica pública y verificados alimento a alimento.',
    foodFaqQ: '¿{name} es bajo en FODMAP?',
    faqALow:
      'Sí. En una ración de {r} {u}, {name} es bajo en FODMAP. Ten en cuenta que los FODMAPs se acumulan a lo largo del día: si lo combinas con otros alimentos que contengan el mismo FODMAP, la tolerancia puede cambiar.',
    faqAModerate:
      'Con matices. {name} es moderado: su ración segura ({r} {u}) es más pequeña que la ración habitual. Ajusta la cantidad y no la superes.',
    faqAHigh:
      'En ración habitual, no: {name} es alto en FODMAP. La ración segura ({r} {u}) es mucho menor que una ración normal; si lo comes, ajusta la cantidad y observa tu tolerancia.',
    faqANoLimit:
      'Sí. {name} no tiene un límite práctico conocido: se considera bajo en FODMAP en cantidades normales de consumo.',
    faqANotEstablished:
      'No hay datos suficientes para fijar una ración segura de {name}. Trátalo con cautela y consulta la etiqueta del producto concreto.',
    foodMetaTitle: '{name}: ¿es bajo en FODMAP? Ración segura y semáforo',
    foodMetaDescLow:
      '{name} es bajo en FODMAP en una ración de {r} {u}. Descubre su ración segura, los FODMAPs que contiene y alternativas en Fodmind.',
    foodMetaDescModerate:
      '{name} es moderado en FODMAP: la ración segura es {r} {u}. Descubre cuánto puedes comer y sus alternativas en Fodmind.',
    foodMetaDescHigh:
      '{name} es alto en FODMAP en ración habitual. Descubre su ración segura, por qué lo es y con qué sustituirlo en Fodmind.',
    foodMetaDescNull:
      '{name} no tiene un límite práctico conocido: es bajo en FODMAP en cantidades normales. Ración, FODMAPs y alternativas en Fodmind.',
    foodMetaDescNoEst:
      '{name}: ración baja no establecida. Clasificación FODMAP, FODMAPs presentes y alternativas en Fodmind.',

    foodsIndexTitle: 'Alimentos y FODMAPs',
    foodsIndexText:
      'Busca un alimento o explora por categoría. Cada ficha muestra el semáforo FODMAP, la ración segura en gramos y los FODMAPs que contiene.',
    categoriesTitle: 'Por categorías',
    catMetaTitle: 'Alimentos {cat} y FODMAP: cuáles puedes comer',
    catMetaDesc:
      'Lista de {cat} con su clasificación FODMAP: semáforo, ración segura en gramos y FODMAPs presentes. Con el escáner de Fodmind lo compruebas en el súper.',
    nFoods: '{n} alimentos',

    guideTitle: 'Guía de la dieta baja en FODMAP',
    guideText:
      'Qué son los FODMAPs, cómo funciona la eliminación, cómo reintroducir alimentos y cómo personalizar tu dieta: el método completo, gratis.',
    guideIndexTitle: 'La guía',

    blogTitle: 'Blog',
    blogText: 'Guías prácticas sobre la dieta baja en FODMAP, sin listas copiadas ni promesas milagro.',
    blogIndexTitle: 'El blog',

    privacyTitle: 'Política de privacidad',
    privacyBody: [
      'Fodmind no tiene cuentas, no pide datos personales y no muestra publicidad. Las búsquedas de alimentos, el diario y la guía funcionan íntegramente en tu dispositivo y esa información no sale de él.',
      'Escáner de etiquetas y de platos: si fotografías la lista de ingredientes de un producto o un plato, la foto se envía a nuestro servidor para leerla mejor que tu móvil. Nuestro servidor no la guarda; el proveedor externo de reconocimiento de imagen puede conservarla hasta 30 días.',
      'El escáner de código de barras funciona en el propio móvil y no envía nada más allá de la consulta.',
      'Compras: las suscripciones se gestionan por Apple (App Store) o Google (Play Store). El estado de tu suscripción nos llega de forma anónima a través de RevenueCat para desbloquear las funciones premium. No conocemos tu identidad ni tus datos de pago.',
      'Esta web no usa cookies de seguimiento. Las visitas se miden de forma anónima y agregada con Cloudflare Web Analytics.',
      'Contacto: soporte@fodmind.com',
    ],
    termsTitle: 'Términos de uso',
    termsBody: [
      'Fodmind es una herramienta educativa sobre la dieta baja en FODMAP. No diagnostica, no trata y no sustituye el consejo de un médico o dietista-nutricionista. Si tienes síntomas digestivos, consulta a un profesional sanitario antes de empezar una dieta de eliminación.',
      'La base de datos se compila de literatura científica pública y se verifica alimento a alimento, pero puede contener errores u quedar desactualizada. Los productos comerciales cambian de fórmula: comprueba siempre la etiqueta del producto concreto.',
      'Las suscripciones se renuevan automáticamente salvo cancelación. Puedes gestionarlas o cancelarlas desde la configuración de tu cuenta de App Store o Google Play. La prueba gratuita, si está disponible, se convierte en suscripción de pago si no se cancela antes de terminar.',
      'Fodmind, su logotipo y el contenido de esta web son propiedad de su autor. Los datos de alimentos pueden citarse con atribución y enlace a esta web.',
      'Nos reservamos el derecho de modificar la app y esta web. La ley aplicable es la española.',
    ],

    footerDisclaimer: 'Fodmind es una herramienta educativa y no sustituye el consejo de un profesional sanitario.',
    footerSources:
      'Base de datos propia compilada de literatura científica pública (Monash University, Ciqual, y otras fuentes citadas en la app).',
    langSwitch: 'Idioma',

    notFoundTitle: 'Esta página no existe',
    notFoundText: 'Puede que el enlace esté mal escrito o que la página se haya movido. Busca el alimento desde aquí:',
    metaHomeTitle: 'Fodmind — Escáner FODMAP: semáforo de alimentos, lector de etiquetas y guía',
    metaHomeDesc:
      'Escanea un producto, fotografía una etiqueta o busca entre 1.843 alimentos y sabrás al instante si es bajo en FODMAP. Guía por fases, diario y recetas. Gratis en iOS y Android.',
  },

  en: {
    navAlimentos: 'Foods',
    navGuia: 'Guide',
    navBlog: 'Blog',
    ctaApp: 'Get the app',
    searchPlaceholder: 'Search a food…',
    readMore: 'Read more',
    seeCategory: 'View category',

    heroBadge: 'FODMAP scanner for iOS and Android',
    heroTitle: 'Can I eat this? Scan it and you’ll know.',
    heroText:
      'Fodmind classifies 1,843 foods with a FODMAP traffic light, scans barcodes, reads ingredient labels with your camera and walks you through the low FODMAP diet phase by phase.',
    heroCta: 'Download free',
    heroCtaSecondary: 'Browse foods',
    statFoods: '1,843 foods classified',
    statOffline: 'No accounts, no ads, works offline',
    statLangs: 'In 6 languages',

    featuresTitle: 'Everything you need for the low FODMAP diet',
    features: [
      {
        icon: '📷',
        t: 'Label reader',
        d: 'Photograph a product’s ingredient list and Fodmind tells you whether it is low FODMAP.',
      },
      {
        icon: '🔎',
        t: 'Barcode scanner',
        d: 'Scan any package and check its rating on the spot, right in the supermarket.',
      },
      {
        icon: '🚦',
        t: 'Serving-based traffic light',
        d: 'Green, amber or red based on the serving people actually eat, not just the lab table.',
      },
      {
        icon: '🗺️',
        t: 'Phase-by-phase guide',
        d: 'Elimination, reintroduction and personalization explained step by step, with practical challenges.',
      },
      {
        icon: '📔',
        t: 'Symptom diary',
        d: 'Log meals and symptoms with intensity and discover your personal triggers.',
      },
      {
        icon: '🍳',
        t: 'Recipes',
        d: 'Filterable low FODMAP recipes for every meal of the day.',
      },
    ],

    exploreTitle: '1,843 foods, each with its safe serving',
    exploreText:
      'Every food comes with its traffic light, its safe serving in grams and the FODMAPs it contains. Start with what you search most:',
    exploreCta: 'See all foods',

    faqTitle: 'Frequently asked questions',
    faq: [
      {
        q: 'What are FODMAPs?',
        a: 'They are short-chain carbohydrates (oligosaccharides, disaccharides, monosaccharides and polyols) that are poorly absorbed in the small intestine and ferment, causing gas, bloating and pain in people with sensitive guts.',
      },
      {
        q: 'Is it free?',
        a: 'You can download Fodmind for free and use the food search. The label reader, the full guide and the diary are unlocked with a subscription, which includes a one-week free trial.',
      },
      {
        q: 'Does it work offline?',
        a: 'Yes. The food database, the guide and the diary work 100% offline. Only the label reader needs a connection to send the photo to the server.',
      },
      {
        q: 'Does it replace a dietitian?',
        a: 'No. Fodmind is an educational tool that helps you follow the low FODMAP diet, but it does not diagnose and does not replace a healthcare professional.',
      },
    ],

    levelNames: {
      low: 'Low FODMAP',
      moderate: 'Moderate',
      high: 'High FODMAP',
    },
    levelDescriptions: {
      low: 'You can eat a normal serving without a problem.',
      moderate: 'The safe serving is smaller than a regular one: adjust the amount.',
      high: 'A regular serving exceeds the safe serving. Check how much fits: it is not a ban.',
    },
    safeServing: 'Safe serving',
    typicalServing: 'Typical serving',
    servingContext: 'A normal serving is {t} {u} and the safe one {r} {u}: that gap is what decides whether it sits well.',
    fodmapPresent: 'FODMAPs in relevant amounts',
    fodmapTypes: {
      fructans: 'Fructans',
      gos: 'GOS (galacto-oligosaccharides)',
      lactose: 'Lactose',
      fructose: 'Excess fructose',
      sorbitol: 'Sorbitol',
      mannitol: 'Mannitol',
    },
    noLimit: 'No practical limit',
    notEstablished: 'Low serving not established',
    similarTitle: 'Similar foods you can eat',
    similarSub: 'They play a similar role on the plate, with better tolerance.',
    notice:
      'Educational information, not medical advice. Data compiled from public scientific literature and verified food by food.',
    foodFaqQ: 'Is {name} low in FODMAPs?',
    faqALow:
      'Yes. In a {r} {u} serving, {name} is low in FODMAPs. Keep in mind that FODMAPs stack up over the day: if you combine it with other foods containing the same FODMAP, tolerance can change.',
    faqAModerate:
      'With nuances. {name} is moderate: its safe serving ({r} {u}) is smaller than a regular serving. Adjust the amount and do not exceed it.',
    faqAHigh:
      'In a regular serving, no: {name} is high in FODMAPs. The safe serving ({r} {u}) is far smaller than a normal serving; if you eat it, adjust the amount and watch your tolerance.',
    faqANoLimit:
      'Yes. {name} has no known practical limit: it is considered low in FODMAPs in normal amounts.',
    faqANotEstablished:
      'There is not enough data to establish a safe serving for {name}. Treat it with caution and check the label of the specific product.',
    foodMetaTitle: '{name}: is it low FODMAP? Safe serving and traffic light',
    foodMetaDescLow:
      '{name} is low in FODMAPs in a {r} {u} serving. See its safe serving, the FODMAPs it contains and alternatives on Fodmind.',
    foodMetaDescModerate:
      '{name} is moderate in FODMAPs: the safe serving is {r} {u}. See how much you can eat and its alternatives on Fodmind.',
    foodMetaDescHigh:
      '{name} is high in FODMAPs in a regular serving. See its safe serving, why, and what to swap it for on Fodmind.',
    foodMetaDescNull:
      '{name} has no known practical limit: it is low in FODMAPs in normal amounts. Serving, FODMAPs and alternatives on Fodmind.',
    foodMetaDescNoEst:
      '{name}: low serving not established. FODMAP rating, FODMAPs present and alternatives on Fodmind.',

    foodsIndexTitle: 'Foods and FODMAPs',
    foodsIndexText:
      'Search for a food or browse by category. Each entry shows the FODMAP traffic light, the safe serving in grams and the FODMAPs it contains.',
    categoriesTitle: 'By category',
    catMetaTitle: '{cat} and FODMAPs: which ones you can eat',
    catMetaDesc:
      'List of {cat} with their FODMAP rating: traffic light, safe serving in grams and FODMAPs present. Check them in the shop with the Fodmind scanner.',
    nFoods: '{n} foods',

    guideTitle: 'Low FODMAP diet guide',
    guideText:
      'What FODMAPs are, how elimination works, how to reintroduce foods and how to personalize your diet: the complete method, free.',
    guideIndexTitle: 'The guide',

    blogTitle: 'Blog',
    blogText: 'Practical guides about the low FODMAP diet, with no copied lists and no miracle promises.',
    blogIndexTitle: 'The blog',

    privacyTitle: 'Privacy policy',
    privacyBody: [
      'Fodmind has no accounts, asks for no personal data and shows no ads. Food searches, the diary and the guide run entirely on your device and that information never leaves it.',
      'Label and plate scanner: if you photograph a product’s ingredient list or a plate, the photo is sent to our server, which reads it better than your phone. Our server does not store it; the external image recognition provider may retain it for up to 30 days.',
      'The barcode scanner runs on the phone itself and sends nothing beyond the lookup.',
      'Purchases: subscriptions are handled by Apple (App Store) or Google (Play Store). Your subscription status reaches us anonymously through RevenueCat to unlock premium features. We never learn your identity or payment details.',
      'This website uses no tracking cookies. Visits are measured anonymously and in aggregate with Cloudflare Web Analytics.',
      'Contact: soporte@fodmind.com',
    ],
    termsTitle: 'Terms of use',
    termsBody: [
      'Fodmind is an educational tool about the low FODMAP diet. It does not diagnose, treat, or replace the advice of a physician or registered dietitian. If you have digestive symptoms, talk to a healthcare professional before starting an elimination diet.',
      'The database is compiled from public scientific literature and verified food by food, but it may contain errors or become outdated. Commercial products change formulas: always check the label of the specific product.',
      'Subscriptions renew automatically unless cancelled. You can manage or cancel them from your App Store or Google Play account settings. The free trial, when available, converts into a paid subscription if not cancelled before it ends.',
      'Fodmind, its logo and the content of this website are the property of their author. Food data may be quoted with attribution and a link to this website.',
      'We reserve the right to modify the app and this website. Spanish law applies.',
    ],

    footerDisclaimer: 'Fodmind is an educational tool and does not replace the advice of a healthcare professional.',
    footerSources:
      'Own database compiled from public scientific literature (Monash University, Ciqual and other sources cited in the app).',
    langSwitch: 'Language',

    notFoundTitle: 'This page does not exist',
    notFoundText: 'The link may be mistyped, or the page may have moved. Look the food up from here:',
    metaHomeTitle: 'Fodmind — FODMAP scanner: food traffic light, label reader and guide',
    metaHomeDesc:
      'Scan a product, photograph a label or search 1,843 foods and know instantly whether it is low FODMAP. Phase guide, diary and recipes. Free on iOS and Android.',
  },

  fr: {
    navAlimentos: 'Aliments',
    navGuia: 'Guide',
    navBlog: 'Blog',
    ctaApp: 'Télécharger l’app',
    searchPlaceholder: 'Rechercher un aliment…',
    readMore: 'Lire la suite',
    seeCategory: 'Voir la catégorie',

    heroBadge: 'Scanner FODMAP pour iOS et Android',
    heroTitle: 'Puis-je manger ça ? Scannez et vous saurez.',
    heroText:
      'Fodmind classe 1 843 aliments avec un feu tricolore FODMAP, scanne les codes-barres, lit les étiquettes avec la caméra et vous accompagne dans le régime pauvre en FODMAP, phase par phase.',
    heroCta: 'Télécharger gratuitement',
    heroCtaSecondary: 'Explorer les aliments',
    statFoods: '1 843 aliments classés',
    statOffline: 'Sans comptes ni pub, fonctionne hors ligne',
    statLangs: 'En 6 langues',

    featuresTitle: 'Tout ce qu’il faut pour le régime pauvre en FODMAP',
    features: [
      {
        icon: '📷',
        t: 'Lecteur d’étiquettes',
        d: 'Photographiez la liste d’ingrédients d’un produit et Fodmind vous dit s’il est pauvre en FODMAP.',
      },
      {
        icon: '🔎',
        t: 'Scanner de code-barres',
        d: 'Scannez n’importe quel emballage et consultez sa classification sur le champ, au supermarché.',
      },
      {
        icon: '🚦',
        t: 'Feu tricolore par portions',
        d: 'Vert, orange ou rouge selon la portion réellement mangée, pas seulement selon le tableau de laboratoire.',
      },
      {
        icon: '🗺️',
        t: 'Guide phase par phase',
        d: 'Élimination, réintroduction et personnalisation expliquées pas à pas, avec des défis pratiques.',
      },
      {
        icon: '📔',
        t: 'Journal des symptômes',
        d: 'Notez repas et symptômes avec leur intensité et découvrez vos déclencheurs.',
      },
      {
        icon: '🍳',
        t: 'Recettes',
        d: 'Recettes pauvres en FODMAP filtrables pour chaque repas de la journée.',
      },
    ],

    exploreTitle: '1 843 aliments, chacun avec sa portion sûre',
    exploreText:
      'Chaque aliment a son feu tricolore, sa portion sûre en grammes et les FODMAP qu’il contient. Commencez par ce que vous cherchez le plus :',
    exploreCta: 'Voir tous les aliments',

    faqTitle: 'Questions fréquentes',
    faq: [
      {
        q: 'Que sont les FODMAP ?',
        a: 'Ce sont des glucides à chaîne courte (oligosaccharides, disaccharides, monosaccharides et polyols) mal absorbés par l’intestin grêle qui fermentent, causant gaz, ballonnements et douleurs chez les personnes à l’intestin sensible.',
      },
      {
        q: 'Est-ce gratuit ?',
        a: 'Vous pouvez télécharger Fodmind gratuitement et consulter la recherche d’aliments. Le lecteur d’étiquettes, le guide complet et le journal se débloquent avec un abonnement, avec une semaine d’essai gratuit.',
      },
      {
        q: 'Fonctionne-t-il hors ligne ?',
        a: 'Oui. La base d’aliments, le guide et le journal fonctionnent à 100 % hors ligne. Seul le lecteur d’étiquettes a besoin d’une connexion pour envoyer la photo au serveur.',
      },
      {
        q: 'Remplace-t-il un diététicien ?',
        a: 'Non. Fodmind est un outil éducatif qui aide à suivre le régime pauvre en FODMAP, mais il ne diagnostique pas et ne remplace pas un professionnel de santé.',
      },
    ],

    levelNames: {
      low: 'Pauvre en FODMAP',
      moderate: 'Modéré',
      high: 'Riche en FODMAP',
    },
    levelDescriptions: {
      low: 'Vous pouvez en manger une portion normale sans problème.',
      moderate: 'La portion sûre est plus petite que l’habituelle : ajustez la quantité.',
      high: 'La portion habituelle dépasse la portion sûre. Regardez ce qui passe : ce n’est pas une interdiction.',
    },
    safeServing: 'Portion sûre',
    typicalServing: 'Portion habituelle',
    servingContext: 'Une portion normale, c’est {t} {u}, et la portion sûre {r} {u} : c’est cet écart qui décide de la tolérance.',
    fodmapPresent: 'FODMAP en quantité significative',
    fodmapTypes: {
      fructans: 'Fructanes',
      gos: 'GOS (galacto-oligosaccharides)',
      lactose: 'Lactose',
      fructose: 'Fructose en excès',
      sorbitol: 'Sorbitol',
      mannitol: 'Mannitol',
    },
    noLimit: 'Pas de limite pratique',
    notEstablished: 'Portion sûre non établie',
    similarTitle: 'Des équivalents que vous pouvez manger',
    similarSub: 'Ils jouent un rôle similaire dans l’assiette, avec une meilleure tolérance.',
    notice:
      'Information éducative, pas un avis médical. Données compilées à partir de la littérature scientifique publique et vérifiées aliment par aliment.',
    foodFaqQ: 'Est-ce que {name} est pauvre en FODMAP ?',
    faqALow:
      'Oui. En une portion de {r} {u}, {name} est pauvre en FODMAP. Attention, les FODMAP s’accumulent au fil de la journée : si vous le combinez avec d’autres aliments contenant le même FODMAP, la tolérance peut changer.',
    faqAModerate:
      'Avec des nuances. {name} est modéré : sa portion sûre ({r} {u}) est plus petite que la portion habituelle. Ajustez la quantité sans la dépasser.',
    faqAHigh:
      'En portion habituelle, non : {name} est riche en FODMAP. La portion sûre ({r} {u}) est bien plus petite qu’une portion normale ; si vous en mangez, ajustez la quantité et observez votre tolérance.',
    faqANoLimit:
      'Oui. {name} n’a pas de limite pratique connue : il est considéré comme pauvre en FODMAP aux quantités normalement consommées.',
    faqANotEstablished:
      'Il n’y a pas assez de données pour établir une portion sûre pour {name}. Prudence, et vérifiez l’étiquette du produit concerné.',
    foodMetaTitle: '{name} : est-ce pauvre en FODMAP ? Portion sûre et feu tricolore',
    foodMetaDescLow:
      '{name} est pauvre en FODMAP en une portion de {r} {u}. Découvrez sa portion sûre, les FODMAP qu’il contient et ses alternatives sur Fodmind.',
    foodMetaDescModerate:
      '{name} est modéré en FODMAP : la portion sûre est de {r} {u}. Découvrez combien vous pouvez en manger et ses alternatives sur Fodmind.',
    foodMetaDescHigh:
      '{name} est riche en FODMAP en portion habituelle. Découvrez sa portion sûre, pourquoi, et par quoi le remplacer sur Fodmind.',
    foodMetaDescNull:
      '{name} n’a pas de limite pratique connue : il est pauvre en FODMAP aux quantités normales. Portion, FODMAP et alternatives sur Fodmind.',
    foodMetaDescNoEst:
      '{name} : portion sûre non établie. Classification FODMAP, FODMAP présents et alternatives sur Fodmind.',

    foodsIndexTitle: 'Aliments et FODMAP',
    foodsIndexText:
      'Cherchez un aliment ou explorez par catégorie. Chaque fiche montre le feu tricolore FODMAP, la portion sûre en grammes et les FODMAP présents.',
    categoriesTitle: 'Par catégories',
    catMetaTitle: '{cat} et FODMAP : lesquels manger',
    catMetaDesc:
      'Liste de {cat} avec leur classification FODMAP : feu tricolore, portion sûre en grammes et FODMAP présents. Vérifiez-les au supermarché avec le scanner Fodmind.',
    nFoods: '{n} aliments',

    guideTitle: 'Guide du régime pauvre en FODMAP',
    guideText:
      'Ce que sont les FODMAP, comment fonctionne l’élimination, comment réintroduire et personnaliser votre régime : la méthode complète, gratuitement.',
    guideIndexTitle: 'Le guide',

    blogTitle: 'Blog',
    blogText: 'Guides pratiques sur le régime pauvre en FODMAP, sans listes copiées ni promesses miracles.',
    blogIndexTitle: 'Le blog',

    privacyTitle: 'Politique de confidentialité',
    privacyBody: [
      'Fodmind n’a pas de comptes, ne demande aucune donnée personnelle et n’affiche aucune publicité. Les recherches d’aliments, le journal et le guide fonctionnent entièrement sur votre appareil et ces informations n’en sortent pas.',
      'Lecteur d’étiquettes et de plats : si vous photographiez la liste d’ingrédients d’un produit ou un plat, la photo est envoyée à notre serveur, qui la lit mieux que votre téléphone. Notre serveur ne la conserve pas ; le prestataire externe de reconnaissance d’image peut la conserver jusqu’à 30 jours.',
      'Le scanner de code-barres fonctionne sur le téléphone lui-même et n’envoie rien au-delà de la consultation.',
      'Achats : les abonnements sont gérés par Apple (App Store) ou Google (Play Store). Le statut de votre abonnement nous parvient de manière anonyme via RevenueCat pour débloquer les fonctions premium. Nous ne connaissons ni votre identité ni vos moyens de paiement.',
      'Ce site n’utilise pas de cookies de suivi. Les visites sont mesurées de façon anonyme et agrégée avec Cloudflare Web Analytics.',
      'Contact : soporte@fodmind.com',
    ],
    termsTitle: 'Conditions d’utilisation',
    termsBody: [
      'Fodmind est un outil éducatif sur le régime pauvre en FODMAP. Il ne diagnostique pas, ne traite pas et ne remplace pas l’avis d’un médecin ou d’un diététicien-nutritionniste. En cas de symptômes digestifs, consultez un professionnel de santé avant de commencer un régime d’élimination.',
      'La base de données est compilée à partir de la littérature scientifique publique et vérifiée aliment par aliment, mais elle peut contenir des erreurs ou devenir obsolète. Les produits commerciaux changent de formule : vérifiez toujours l’étiquette du produit concerné.',
      'Les abonnements se renouvellent automatiquement sauf annulation. Vous pouvez les gérer ou les annuler depuis les réglages de votre compte App Store ou Google Play. L’essai gratuit, s’il est disponible, devient un abonnement payant s’il n’est pas annulé avant son terme.',
      'Fodmind, son logo et le contenu de ce site sont la propriété de leur auteur. Les données d’aliments peuvent être citées avec attribution et un lien vers ce site.',
      'Nous nous réservons le droit de modifier l’application et ce site. Le droit applicable est le droit espagnol.',
    ],

    footerDisclaimer: 'Fodmind est un outil éducatif et ne remplace pas l’avis d’un professionnel de santé.',
    footerSources:
      'Base de données propre, compilée à partir de la littérature scientifique publique (Monash University, Ciqual et autres sources citées dans l’app).',
    langSwitch: 'Langue',

    notFoundTitle: 'Cette page n’existe pas',
    notFoundText: 'Le lien est peut-être mal écrit, ou la page a été déplacée. Cherchez l’aliment ici :',
    metaHomeTitle: 'Fodmind — Scanner FODMAP : feu tricolore des aliments, lecteur d’étiquettes et guide',
    metaHomeDesc:
      'Scannez un produit, photographiez une étiquette ou cherchez parmi 1 843 aliments et sachez aussitôt s’il est pauvre en FODMAP. Guide par phases, journal et recettes. Gratuit sur iOS et Android.',
  },

  de: {
    navAlimentos: 'Lebensmittel',
    navGuia: 'Anleitung',
    navBlog: 'Blog',
    ctaApp: 'App laden',
    searchPlaceholder: 'Lebensmittel suchen…',
    readMore: 'Weiterlesen',
    seeCategory: 'Kategorie ansehen',

    heroBadge: 'FODMAP-Scanner für iOS und Android',
    heroTitle: 'Darf ich das essen? Einfach scannen.',
    heroText:
      'Fodmind ordnet 1.843 Lebensmittel mit einer FODMAP-Ampel ein, scannt Barcodes, liest Zutatenlisten mit der Kamera und begleitet dich durch die FODMAP-arme Ernährung, Phase für Phase.',
    heroCta: 'Kostenlos laden',
    heroCtaSecondary: 'Lebensmittel entdecken',
    statFoods: '1.843 Lebensmittel klassifiziert',
    statOffline: 'Ohne Konten und Werbung, funktioniert offline',
    statLangs: 'In 6 Sprachen',

    featuresTitle: 'Alles für die FODMAP-arme Ernährung',
    features: [
      {
        icon: '📷',
        t: 'Etiketten-Leser',
        d: 'Fotografiere die Zutatenliste eines Produkts und Fodmind sagt dir, ob es FODMAP-arm ist.',
      },
      {
        icon: '🔎',
        t: 'Barcode-Scanner',
        d: 'Scanne jede Verpackung und sieh sofort die Einstufung – mitten im Supermarkt.',
      },
      {
        icon: '🚦',
        t: 'Ampel nach Portionen',
        d: 'Grün, gelb oder rot nach der Portion, die wirklich gegessen wird – nicht nur nach der Labortabelle.',
      },
      {
        icon: '🗺️',
        t: 'Anleitung Phase für Phase',
        d: 'Eliminierung, Wiedereinführung und Personalisierung Schritt für Schritt, mit praktischen Tests.',
      },
      {
        icon: '📔',
        t: 'Symptomtagebuch',
        d: 'Halte Mahlzeiten und Symptome mit Intensität fest und entdecke deine Auslöser.',
      },
      {
        icon: '🍳',
        t: 'Rezepte',
        d: 'Filterbare FODMAP-arme Rezepte für jede Mahlzeit des Tages.',
      },
    ],

    exploreTitle: '1.843 Lebensmittel, jedes mit sicherer Portion',
    exploreText:
      'Jedes Lebensmittel hat seine Ampel, seine sichere Portion in Gramm und die FODMAPs, die es enthält. Starte mit dem, was du am häufigsten suchst:',
    exploreCta: 'Alle Lebensmittel ansehen',

    faqTitle: 'Häufige Fragen',
    faq: [
      {
        q: 'Was sind FODMAPs?',
        a: 'Das sind kurzkettige Kohlenhydrate (Oligosaccharide, Disaccharide, Monosaccharide und Polyole), die im Dünndarm schlecht aufgenommen werden und vergären. Bei empfindlichem Darm verursachen sie Blähungen, Bauchschmerzen und Unwohlsein.',
      },
      {
        q: 'Ist die App kostenlos?',
        a: 'Du kannst Fodmind kostenlos laden und die Lebensmittelsuche nutzen. Etiketten-Leser, vollständige Anleitung und Tagebuch schaltet ein Abo frei, mit einer Woche kostenlos zum Testen.',
      },
      {
        q: 'Funktioniert sie offline?',
        a: 'Ja. Lebensmitteldatenbank, Anleitung und Tagebuch funktionieren zu 100 % offline. Nur der Etiketten-Leser braucht eine Verbindung, um das Foto an den Server zu schicken.',
      },
      {
        q: 'Ersetzt sie einen Ernährungsberater?',
        a: 'Nein. Fodmind ist ein Bildungswerkzeug, das dir bei der FODMAP-armen Ernährung hilft. Es stellt keine Diagnosen und ersetzt keine medizinische Beratung.',
      },
    ],

    levelNames: {
      low: 'FODMAP-arm',
      moderate: 'Moderat',
      high: 'FODMAP-reich',
    },
    levelDescriptions: {
      low: 'Eine normale Portion ist unproblematisch.',
      moderate: 'Die sichere Portion ist kleiner als die übliche: Passe die Menge an.',
      high: 'Die übliche Portion übersteigt die sichere. Schau, wie viel passt: Das ist kein Verbot.',
    },
    safeServing: 'Sichere Portion',
    typicalServing: 'Übliche Portion',
    servingContext: 'Eine normale Portion sind {t} {u}, die sichere {r} {u}: dieser Abstand entscheidet, ob es bekommt.',
    fodmapPresent: 'FODMAPs in relevanter Menge',
    fodmapTypes: {
      fructans: 'Fructane',
      gos: 'GOS (Galacto-Oligosaccharide)',
      lactose: 'Laktose',
      fructose: 'Überschüssige Fruktose',
      sorbitol: 'Sorbit',
      mannitol: 'Mannit',
    },
    noLimit: 'Keine praktische Grenze',
    notEstablished: 'Sichere Portion nicht ermittelt',
    similarTitle: 'Ähnliche Lebensmittel, die du essen kannst',
    similarSub: 'Sie erfüllen auf dem Teller eine ähnliche Aufgabe und werden besser vertragen.',
    notice:
      'Bildungsinformation, kein medizinischer Rat. Daten aus öffentlicher wissenschaftlicher Literatur, Lebensmittel für Lebensmittel geprüft.',
    foodFaqQ: 'Ist {name} FODMAP-arm?',
    faqALow:
      'Ja. In einer Portion von {r} {u} ist {name} FODMAP-arm. Beachte: FODMAPs summieren sich über den Tag. Kombinierst du es mit anderen Lebensmitteln mit demselben FODMAP, kann sich die Toleranz ändern.',
    faqAModerate:
      'Mit Einschränkung. {name} ist moderat: Die sichere Portion ({r} {u}) ist kleiner als die übliche. Passe die Menge an und überschreite sie nicht.',
    faqAHigh:
      'In üblicher Portionsgröße, nein: {name} ist FODMAP-reich. Die sichere Portion ({r} {u}) ist viel kleiner als eine normale; wenn du es isst, passe die Menge an und beobachte deine Toleranz.',
    faqANoLimit:
      'Ja. Für {name} ist keine praktische Grenze bekannt: In normalen Mengen gilt es als FODMAP-arm.',
    faqANotEstablished:
      'Es gibt nicht genug Daten, um eine sichere Portion für {name} festzulegen. Sei vorsichtig und prüfe das Etikett des konkreten Produkts.',
    foodMetaTitle: '{name}: FODMAP-arm oder nicht? Sichere Portion und Ampel',
    foodMetaDescLow:
      '{name} ist in einer Portion von {r} {u} FODMAP-arm. Sicherer Portion, enthaltene FODMAPs und Alternativen – auf Fodmind.',
    foodMetaDescModerate:
      '{name} ist moderat: Die sichere Portion beträgt {r} {u}. Wie viel du essen kannst und welche Alternativen es gibt – auf Fodmind.',
    foodMetaDescHigh:
      '{name} ist in üblicher Portion FODMAP-reich. Sicherer Portion, warum, und womit du es ersetzt – auf Fodmind.',
    foodMetaDescNull:
      'Für {name} ist keine praktische Grenze bekannt: In normalen Mengen ist es FODMAP-arm. Portion, FODMAPs und Alternativen auf Fodmind.',
    foodMetaDescNoEst:
      '{name}: sichere Portion nicht ermittelt. FODMAP-Einstufung, enthaltene FODMAPs und Alternativen auf Fodmind.',

    foodsIndexTitle: 'Lebensmittel und FODMAPs',
    foodsIndexText:
      'Suche ein Lebensmittel oder stöbere nach Kategorie. Jede Karte zeigt die FODMAP-Ampel, die sichere Portion in Gramm und die enthaltenen FODMAPs.',
    categoriesTitle: 'Nach Kategorien',
    catMetaTitle: '{cat} und FODMAP: Was du essen kannst',
    catMetaDesc:
      'Liste von {cat} mit FODMAP-Einstufung: Ampel, sichere Portion in Gramm und enthaltene FODMAPs. Prüfe sie im Supermarkt mit dem Fodmind-Scanner.',
    nFoods: '{n} Lebensmittel',

    guideTitle: 'Anleitung zur FODMAP-armen Ernährung',
    guideText:
      'Was FODMAPs sind, wie die Eliminierung läuft, wie du Lebensmittel wiedereinführst und deine Ernährung personalisierst: die komplette Methode, gratis.',
    guideIndexTitle: 'Die Anleitung',

    blogTitle: 'Blog',
    blogText: 'Praktische Anleitungen zur FODMAP-armen Ernährung – ohne kopierte Listen und ohne Wunderversprechen.',
    blogIndexTitle: 'Der Blog',

    privacyTitle: 'Datenschutzerklärung',
    privacyBody: [
      'Fodmind hat keine Konten, fragt keine persönlichen Daten ab und zeigt keine Werbung. Lebensmittelsuche, Tagebuch und Anleitung laufen vollständig auf deinem Gerät; diese Informationen verlassen es nicht.',
      'Etiketten- und Gerichte-Scanner: Fotografierst du die Zutatenliste eines Produkts oder ein Gericht, wird das Foto an unseren Server gesendet, der es besser liest als dein Handy. Unser Server speichert es nicht; der externe Anbieter der Bilderkennung kann es bis zu 30 Tage aufbewahren.',
      'Der Barcode-Scanner läuft auf dem Handy selbst und sendet nichts über die Abfrage hinaus.',
      'Käufe: Abos werden über Apple (App Store) oder Google (Play Store) abgewickelt. Der Status deines Abos erreicht uns anonym über RevenueCat, um Premium-Funktionen freizuschalten. Deine Identität und Zahlungsdaten kennen wir nicht.',
      'Diese Website verwendet keine Tracking-Cookies. Besuche werden anonym und aggregiert mit Cloudflare Web Analytics gemessen.',
      'Kontakt: soporte@fodmind.com',
    ],
    termsTitle: 'Nutzungsbedingungen',
    termsBody: [
      'Fodmind ist ein Bildungswerkzeug zur FODMAP-armen Ernährung. Es diagnostiziert nicht, behandelt nicht und ersetzt nicht den Rat eines Arztes oder Diätassistenten. Bei Verdauungsbeschwerden sprich bitte mit einer Fachperson, bevor du eine Eliminierungsdiät beginnst.',
      'Die Datenbank stammt aus öffentlicher wissenschaftlicher Literatur und wird Lebensmittel für Lebensmittel geprüft, kann aber Fehler enthalten oder veralten. Kommerzielle Produkte ändern ihre Rezeptur: Prüfe immer das Etikett des konkreten Produkts.',
      'Abos verlängern sich automatisch, wenn sie nicht gekündigt werden. Verwalten oder kündigen kannst du sie in den Einstellungen deines App-Store- bzw. Google-Play-Kontos. Die kostenlose Testphase wird – wo verfügbar – zu einem kostenpflichtigen Abo, wenn sie nicht vorher gekündigt wird.',
      'Fodmind, sein Logo und der Inhalt dieser Website gehören ihrem Autor. Lebensmitteldaten dürfen mit Quellenangabe und Link auf diese Website zitiert werden.',
      'Wir behalten uns Änderungen an App und Website vor. Es gilt spanisches Recht.',
    ],

    footerDisclaimer: 'Fodmind ist ein Bildungswerkzeug und ersetzt nicht den Rat einer medizinischen Fachkraft.',
    footerSources:
      'Eigene Datenbank aus öffentlicher wissenschaftlicher Literatur (Monash University, Ciqual und weitere in der App genannte Quellen).',
    langSwitch: 'Sprache',

    notFoundTitle: 'Diese Seite gibt es nicht',
    notFoundText: 'Vielleicht ist der Link falsch geschrieben oder die Seite ist umgezogen. Such das Lebensmittel hier:',
    metaHomeTitle: 'Fodmind — FODMAP-Scanner: Lebensmittel-Ampel, Etiketten-Leser und Anleitung',
    metaHomeDesc:
      'Scanne ein Produkt, fotografiere ein Etikett oder suche unter 1.843 Lebensmitteln und weiß sofort, ob es FODMAP-arm ist. Phasen-Anleitung, Tagebuch und Rezepte. Gratis für iOS und Android.',
  },

  it: {
    navAlimentos: 'Alimenti',
    navGuia: 'Guida',
    navBlog: 'Blog',
    ctaApp: 'Scarica l’app',
    searchPlaceholder: 'Cerca un alimento…',
    readMore: 'Leggi di più',
    seeCategory: 'Vedi la categoria',

    heroBadge: 'Scanner FODMAP per iOS e Android',
    heroTitle: 'Posso mangiarlo? Scansiona e lo scopri.',
    heroText:
      'Fodmind classifica 1.843 alimenti con un semaforo FODMAP, scansiona codici a barre, legge le etichette con la fotocamera e ti accompagna nella dieta povera di FODMAP, fase per fase.',
    heroCta: 'Scarica gratis',
    heroCtaSecondary: 'Esplora gli alimenti',
    statFoods: '1.843 alimenti classificati',
    statOffline: 'Senza account né pubblicità, funziona offline',
    statLangs: 'In 6 lingue',

    featuresTitle: 'Tutto ciò che serve per la dieta povera di FODMAP',
    features: [
      {
        icon: '📷',
        t: 'Lettore di etichette',
        d: 'Fotografa la lista degli ingredienti di un prodotto e Fodmind ti dice se è povero di FODMAP.',
      },
      {
        icon: '🔎',
        t: 'Scanner di codici a barre',
        d: 'Scansiona qualsiasi confezione e consulta subito la sua classificazione, al supermercato.',
      },
      {
        icon: '🚦',
        t: 'Semaforo per porzioni',
        d: 'Verde, giallo o rosso in base alla porzione che si mangia davvero, non solo alla tabella di laboratorio.',
      },
      {
        icon: '🗺️',
        t: 'Guida per fasi',
        d: 'Eliminazione, reintroduzione e personalizzazione spiegate passo a passo, con prove pratiche.',
      },
      {
        icon: '📔',
        t: 'Diario dei sintomi',
        d: 'Annota pasti e sintomi con la loro intensità e scopri i tuoi fattori scatenanti.',
      },
      {
        icon: '🍳',
        t: 'Ricette',
        d: 'Ricette povere di FODMAP filtrabili per ogni pasto della giornata.',
      },
    ],

    exploreTitle: '1.843 alimenti, ognuno con la sua porzione sicura',
    exploreText:
      'Ogni alimento ha il suo semaforo, la sua porzione sicura in grammi e i FODMAP che contiene. Inizia da quelli che cerchi più spesso:',
    exploreCta: 'Vedi tutti gli alimenti',

    faqTitle: 'Domande frequenti',
    faq: [
      {
        q: 'Cosa sono i FODMAP?',
        a: 'Sono carboidrati a catena corta (oligosaccaridi, disaccaridi, monosaccaridi e polioli) mal assorbiti nell’intestino tenue, dove fermentano: nelle persone con intestino sensibile causano gas, gonfiore e dolore.',
      },
      {
        q: 'È gratis?',
        a: 'Puoi scaricare Fodmind gratis e usare la ricerca degli alimenti. Il lettore di etichette, la guida completa e il diario si sbloccano con un abbonamento, con una settimana di prova gratuita.',
      },
      {
        q: 'Funziona offline?',
        a: 'Sì. La base dati degli alimenti, la guida e il diario funzionano al 100 % offline. Solo il lettore di etichette richiede una connessione per inviare la foto al server.',
      },
      {
        q: 'Sostituisce un dietista?',
        a: 'No. Fodmind è uno strumento educativo che ti aiuta a seguire la dieta povera di FODMAP, ma non fa diagnosi e non sostituisce un professionista sanitario.',
      },
    ],

    levelNames: {
      low: 'Povero di FODMAP',
      moderate: 'Moderato',
      high: 'Ricco di FODMAP',
    },
    levelDescriptions: {
      low: 'Puoi mangiare una porzione normale senza problemi.',
      moderate: 'La porzione sicura è più piccola di quella abituale: regola la quantità.',
      high: 'La porzione abituale supera quella sicura. Guarda quanta ne passa: non è un divieto.',
    },
    safeServing: 'Porzione sicura',
    typicalServing: 'Porzione abituale',
    servingContext: 'Una porzione normale è {t} {u} e quella sicura {r} {u}: è questa differenza che decide se ti va giù bene.',
    fodmapPresent: 'FODMAP in quantità rilevanti',
    fodmapTypes: {
      fructans: 'Fruttani',
      gos: 'GOS (galatto-oligosaccaridi)',
      lactose: 'Lattosio',
      fructose: 'Fruttosio in eccesso',
      sorbitol: 'Sorbitolo',
      mannitol: 'Mannitolo',
    },
    noLimit: 'Nessun limite pratico',
    notEstablished: 'Porzione sicura non stabilita',
    similarTitle: 'Simili che puoi mangiare',
    similarSub: 'Svolgono un ruolo simile nel piatto, con una tolleranza migliore.',
    notice:
      'Informazione educativa, non un consiglio medico. Dati compilati dalla letteratura scientifica pubblica e verificati alimento per alimento.',
    foodFaqQ: '{name} è povero di FODMAP?',
    faqALow:
      'Sì. In una porzione di {r} {u}, {name} è povero di FODMAP. Ricorda che i FODMAP si accumulano durante la giornata: se lo abbinhi ad altri alimenti con lo stesso FODMAP, la tolleranza può cambiare.',
    faqAModerate:
      'Con riserve. {name} è moderato: la sua porzione sicura ({r} {u}) è più piccola di quella abituale. Regola la quantità e non superarla.',
    faqAHigh:
      'Nella porzione abituale, no: {name} è ricco di FODMAP. La porzione sicura ({r} {u}) è molto più piccola di una normale; se lo mangi, regola la quantità e osserva la tua tolleranza.',
    faqANoLimit:
      'Sì. {name} non ha un limite pratico noto: è considerato povero di FODMAP nelle quantità normalmente consumate.',
    faqANotEstablished:
      'Non ci sono dati sufficienti per stabilire una porzione sicura per {name}. Prudenza, e controlla l’etichetta del prodotto specifico.',
    foodMetaTitle: '{name}: è povero di FODMAP? Porzione sicura e semaforo',
    foodMetaDescLow:
      '{name} è povero di FODMAP in una porzione di {r} {u}. Scopri la porzione sicura, i FODMAP che contiene e le alternative su Fodmind.',
    foodMetaDescModerate:
      '{name} è moderato: la porzione sicura è {r} {u}. Quanto puoi mangiarne e quali alternative ci sono, su Fodmind.',
    foodMetaDescHigh:
      '{name} è ricco di FODMAP nella porzione abituale. Scopri la porzione sicura, perché, e con cosa sostituirlo su Fodmind.',
    foodMetaDescNull:
      '{name} non ha un limite pratico noto: è povero di FODMAP nelle quantità normali. Porzione, FODMAP e alternative su Fodmind.',
    foodMetaDescNoEst:
      '{name}: porzione sicura non stabilita. Classificazione FODMAP, FODMAP presenti e alternative su Fodmind.',

    foodsIndexTitle: 'Alimenti e FODMAP',
    foodsIndexText:
      'Cerca un alimento o esplora per categoria. Ogni scheda mostra il semaforo FODMAP, la porzione sicura in grammi e i FODMAP presenti.',
    categoriesTitle: 'Per categorie',
    catMetaTitle: '{cat} e FODMAP: quali puoi mangiare',
    catMetaDesc:
      'Elenco di {cat} con la classificazione FODMAP: semaforo, porzione sicura in grammi e FODMAP presenti. Verificali al supermercato con lo scanner di Fodmind.',
    nFoods: '{n} alimenti',

    guideTitle: 'Guida alla dieta povera di FODMAP',
    guideText:
      'Cosa sono i FODMAP, come funziona l’eliminazione, come reintrodurre gli alimenti e come personalizzare la dieta: il metodo completo, gratis.',
    guideIndexTitle: 'La guida',

    blogTitle: 'Blog',
    blogText: 'Guide pratiche sulla dieta povera di FODMAP, senza liste copiate né promesse miracolose.',
    blogIndexTitle: 'Il blog',

    privacyTitle: 'Informativa sulla privacy',
    privacyBody: [
      'Fodmind non ha account, non chiede dati personali e non mostra pubblicità. La ricerca degli alimenti, il diario e la guida funzionano interamente sul tuo dispositivo e queste informazioni non lo lasciano.',
      'Lettore di etichette e piatti: se fotografi la lista degli ingredienti di un prodotto o un piatto, la foto viene inviata al nostro server, che la legge meglio del telefono. Il nostro server non la conserva; il fornitore esterno di riconoscimento immagini può conservarla fino a 30 giorni.',
      'Lo scanner di codici a barre funziona sul telefono e non invia nulla oltre la consultazione.',
      'Acquisti: gli abbonamenti sono gestiti da Apple (App Store) o Google (Play Store). Lo stato dell’abbonamento ci arriva in forma anonima tramite RevenueCat per sbloccare le funzioni premium. Non conosciamo la tua identità né i tuoi dati di pagamento.',
      'Questo sito non usa cookie di tracciamento. Le visite vengono misurate in forma anonima e aggregata con Cloudflare Web Analytics.',
      'Contatti: soporte@fodmind.com',
    ],
    termsTitle: 'Termini di utilizzo',
    termsBody: [
      'Fodmind è uno strumento educativo sulla dieta povera di FODMAP. Non fa diagnosi, non cura e non sostituisce il parere di un medico o di un dietista. In presenza di sintomi digestivi, consulta un professionista sanitario prima di iniziare una dieta di eliminazione.',
      'La base dati è compilata dalla letteratura scientifica pubblica e verificata alimento per alimento, ma può contenere errori o diventare datata. I prodotti commerciali cambiano formula: controlla sempre l’etichetta del prodotto specifico.',
      'Gli abbonamenti si rinnovano automaticamente salvo disdetta. Puoi gestirli o disdire dalle impostazioni del tuo account App Store o Google Play. La prova gratuita, dove disponibile, diventa un abbonamento a pagamento se non disdetta prima della scadenza.',
      'Fodmind, il suo logo e i contenuti di questo sito sono proprietà del loro autore. I dati degli alimenti possono essere citati con attribuzione e un link a questo sito.',
      'Ci riserviamo il diritto di modificare l’app e questo sito. La legge applicabile è quella spagnola.',
    ],

    footerDisclaimer: 'Fodmind è uno strumento educativo e non sostituisce il parere di un professionista sanitario.',
    footerSources:
      'Base dati propria compilata dalla letteratura scientifica pubblica (Monash University, Ciqual e altre fonti citate nell’app).',
    langSwitch: 'Lingua',

    notFoundTitle: 'Questa pagina non esiste',
    notFoundText: 'Questo link potrebbe essere sbagliato, o la pagina è stata spostata. Cerca l’alimento da qui:',
    metaHomeTitle: 'Fodmind — Scanner FODMAP: semaforo degli alimenti, lettore di etichette e guida',
    metaHomeDesc:
      'Scansiona un prodotto, fotografa un’etichetta o cerca tra 1.843 alimenti e scopri all’istante se è povero di FODMAP. Guida per fasi, diario e ricette. Gratis su iOS e Android.',
  },

  pt: {
    navAlimentos: 'Alimentos',
    navGuia: 'Guia',
    navBlog: 'Blog',
    ctaApp: 'Descarregar a app',
    searchPlaceholder: 'Procurar um alimento…',
    readMore: 'Ler mais',
    seeCategory: 'Ver a categoria',

    heroBadge: 'Scanner FODMAP para iOS e Android',
    heroTitle: 'Posso comer isto? Digitaliza e ficas a saber.',
    heroText:
      'A Fodmind classifica 1 843 alimentos com um semáforo FODMAP, digitaliza códigos de barras, lê etiquetas com a câmara e acompanha-te na dieta pobre em FODMAP, fase a fase.',
    heroCta: 'Descarregar grátis',
    heroCtaSecondary: 'Explorar alimentos',
    statFoods: '1 843 alimentos classificados',
    statOffline: 'Sem contas nem anúncios, funciona offline',
    statLangs: 'Em 6 idiomas',

    featuresTitle: 'Tudo o que precisas para a dieta pobre em FODMAP',
    features: [
      {
        icon: '📷',
        t: 'Leitor de etiquetas',
        d: 'Fotografa a lista de ingredientes de um produto e a Fodmind diz-te se é pobre em FODMAP.',
      },
      {
        icon: '🔎',
        t: 'Leitor de código de barras',
        d: 'Digitaliza qualquer embalagem e consulta a classificação na hora, no supermercado.',
      },
      {
        icon: '🚦',
        t: 'Semáforo por doses',
        d: 'Verde, amarelo ou vermelho conforme a dose que se come a sério, não só conforme a tabela de laboratório.',
      },
      {
        icon: '🗺️',
        t: 'Guia por fases',
        d: 'Eliminação, reintrodução e personalização explicadas passo a passo, com desafios práticos.',
      },
      {
        icon: '📔',
        t: 'Diário de sintomas',
        d: 'Regista refeições e sintomas com a intensidade e descobre os teus gatilhos.',
      },
      {
        icon: '🍳',
        t: 'Receitas',
        d: 'Receitas pobres em FODMAP filtráveis para cada refeição do dia.',
      },
    ],

    exploreTitle: '1 843 alimentos, cada um com a sua dose segura',
    exploreText:
      'Cada alimento traz o seu semáforo, a sua dose segura em gramas e os FODMAP que contém. Começa pelo que mais procuras:',
    exploreCta: 'Ver todos os alimentos',

    faqTitle: 'Perguntas frequentes',
    faq: [
      {
        q: 'O que são FODMAP?',
        a: 'São hidratos de carbono de cadeia curta (oligossacáridos, dissacáridos, monossacáridos e polióis) mal absorvidos no intestino delgado, onde fermentam: em pessoas com intestino sensível causam gases, distensão e dor.',
      },
      {
        q: 'É grátis?',
        a: 'Podes descarregar a Fodmind grátis e usar a pesquisa de alimentos. O leitor de etiquetas, o guia completo e o diário desbloqueiam-se com uma subscrição, com uma semana de teste grátis.',
      },
      {
        q: 'Funciona offline?',
        a: 'Sim. A base de alimentos, o guia e o diário funcionam 100 % offline. Só o leitor de etiquetas precisa de ligação para enviar a foto ao servidor.',
      },
      {
        q: 'Substitui um nutricionista?',
        a: 'Não. A Fodmind é uma ferramenta educativa que ajuda a seguir a dieta pobre em FODMAP, mas não faz diagnósticos nem substitui um profissional de saúde.',
      },
    ],

    levelNames: {
      low: 'Pobre em FODMAP',
      moderate: 'Moderado',
      high: 'Rico em FODMAP',
    },
    levelDescriptions: {
      low: 'Podes comer uma dose normal sem problema.',
      moderate: 'A dose segura é menor do que a habitual: ajusta a quantidade.',
      high: 'A dose habitual ultrapassa a dose segura. Vê quanto cabe: não é uma proibição.',
    },
    safeServing: 'Dose segura',
    typicalServing: 'Dose habitual',
    servingContext: 'Uma porção normal são {t} {u} e a segura {r} {u}: é essa diferença que decide se cai bem.',
    fodmapPresent: 'FODMAP em quantidade relevante',
    fodmapTypes: {
      fructans: 'Frutanos',
      gos: 'GOS (galacto-oligossacáridos)',
      lactose: 'Lactose',
      fructose: 'Frutose em excesso',
      sorbitol: 'Sorbitol',
      mannitol: 'Manitol',
    },
    noLimit: 'Sem limite prático',
    notEstablished: 'Dose segura não estabelecida',
    similarTitle: 'Semelhantes que podes comer',
    similarSub: 'Desempenham um papel parecido no prato, com melhor tolerância.',
    notice:
      'Informação educativa, não conselho médico. Dados compilados de literatura científica pública e verificados alimento a alimento.',
    foodFaqQ: '{name} é pobre em FODMAP?',
    faqALow:
      'Sim. Numa dose de {r} {u}, {name} é pobre em FODMAP. Tem em conta que os FODMAP acumulam-se ao longo do dia: se o combinares com outros alimentos com o mesmo FODMAP, a tolerância pode mudar.',
    faqAModerate:
      'Com nuances. {name} é moderado: a dose segura ({r} {u}) é menor do que a habitual. Ajusta a quantidade e não a ultrapasses.',
    faqAHigh:
      'Na dose habitual, não: {name} é rico em FODMAP. A dose segura ({r} {u}) é muito menor do que uma dose normal; se o comeres, ajusta a quantidade e observa a tua tolerância.',
    faqANoLimit:
      'Sim. {name} não tem um limite prático conhecido: é considerado pobre em FODMAP nas quantidades habitualmente consumidas.',
    faqANotEstablished:
      'Não há dados suficientes para fixar uma dose segura para {name}. Vai com cautela e consulta a etiqueta do produto concreto.',
    foodMetaTitle: '{name}: é pobre em FODMAP? Dose segura e semáforo',
    foodMetaDescLow:
      '{name} é pobre em FODMAP numa dose de {r} {u}. Descobre a dose segura, os FODMAP que contém e alternativas na Fodmind.',
    foodMetaDescModerate:
      '{name} é moderado: a dose segura é {r} {u}. Quanto podes comer e que alternativas existem, na Fodmind.',
    foodMetaDescHigh:
      '{name} é rico em FODMAP na dose habitual. Descobre a dose segura, porquê, e com que o substituir na Fodmind.',
    foodMetaDescNull:
      '{name} não tem um limite prático conhecido: é pobre em FODMAP nas quantidades normais. Dose, FODMAP e alternativas na Fodmind.',
    foodMetaDescNoEst:
      '{name}: dose segura não estabelecida. Classificação FODMAP, FODMAP presentes e alternativas na Fodmind.',

    foodsIndexTitle: 'Alimentos e FODMAP',
    foodsIndexText:
      'Procura um alimento ou explora por categoria. Cada ficha mostra o semáforo FODMAP, a dose segura em gramas e os FODMAP presentes.',
    categoriesTitle: 'Por categorias',
    catMetaTitle: '{cat} e FODMAP: quais podes comer',
    catMetaDesc:
      'Lista de {cat} com a classificação FODMAP: semáforo, dose segura em gramas e FODMAP presentes. Confirma no supermercado com o scanner da Fodmind.',
    nFoods: '{n} alimentos',

    guideTitle: 'Guia da dieta pobre em FODMAP',
    guideText:
      'O que são os FODMAP, como funciona a eliminação, como reintroduzir alimentos e como personalizar a dieta: o método completo, grátis.',
    guideIndexTitle: 'O guia',

    blogTitle: 'Blog',
    blogText: 'Guias práticos sobre a dieta pobre em FODMAP, sem listas copiadas nem promessas milagrosas.',
    blogIndexTitle: 'O blog',

    privacyTitle: 'Política de privacidade',
    privacyBody: [
      'A Fodmind não tem contas, não pede dados pessoais e não mostra anúncios. As pesquisas de alimentos, o diário e o guia funcionam inteiramente no teu dispositivo e essa informação não sai dele.',
      'Leitor de etiquetas e de pratos: se fotografares a lista de ingredientes de um produto ou um prato, a foto é enviada ao nosso servidor, que a lê melhor do que o telemóvel. O nosso servidor não a guarda; o fornecedor externo de reconhecimento de imagem pode conservá-la até 30 dias.',
      'O leitor de código de barras funciona no próprio telemóvel e não envia nada além da consulta.',
      'Compras: as subscrições são geridas pela Apple (App Store) ou pela Google (Play Store). O estado da subscrição chega-nos de forma anónima através da RevenueCat para desbloquear as funções premium. Não conhecemos a tua identidade nem os teus dados de pagamento.',
      'Este site não usa cookies de rastreio. As visitas são medidas de forma anónima e agregada com o Cloudflare Web Analytics.',
      'Contacto: soporte@fodmind.com',
    ],
    termsTitle: 'Termos de utilização',
    termsBody: [
      'A Fodmind é uma ferramenta educativa sobre a dieta pobre em FODMAP. Não faz diagnósticos, não trata e não substitui o conselho de um médico ou nutricionista. Se tens sintomas digestivos, consulta um profissional de saúde antes de começar uma dieta de eliminação.',
      'A base de dados é compilada de literatura científica pública e verificada alimento a alimento, mas pode conter erros ou ficar desatualizada. Os produtos comerciais mudam de fórmula: confirma sempre a etiqueta do produto concreto.',
      'As subscrições renovam-se automaticamente salvo cancelamento. Podes geri-las ou cancelá-las nas definições da tua conta App Store ou Google Play. O período de teste gratuito, quando disponível, converte-se numa subscrição paga se não for cancelado antes de terminar.',
      'A Fodmind, o seu logótipo e o conteúdo deste site são propriedade do seu autor. Os dados dos alimentos podem ser citados com atribuição e ligação para este site.',
      'Reservamo-nos o direito de modificar a app e este site. Aplica-se a lei espanhola.',
    ],

    footerDisclaimer: 'A Fodmind é uma ferramenta educativa e não substitui o conselho de um profissional de saúde.',
    footerSources:
      'Base de dados própria compilada de literatura científica pública (Monash University, Ciqual e outras fontes citadas na app).',
    langSwitch: 'Idioma',

    notFoundTitle: 'Esta página não existe',
    notFoundText: 'O link pode estar mal escrito ou a página pode ter mudado. Procura o alimento aqui:',
    metaHomeTitle: 'Fodmind — Scanner FODMAP: semáforo de alimentos, leitor de etiquetas e guia',
    metaHomeDesc:
      'Digitaliza um produto, fotografa uma etiqueta ou pesquisa entre 1 843 alimentos e fica a saber na hora se é pobre em FODMAP. Guia por fases, diário e receitas. Grátis em iOS e Android.',
  },
};

export function t(locale: Locale): Strings {
  return STR[locale];
}
