import type { Locale } from '../lib/rutas';
import type { FodmapLevel } from '../lib/tipos';

/**
 * Las listas por nivel: «alimentos bajos en FODMAP» y sus doce cortes por
 * categoría.
 *
 * Existen porque el sitio contestaba muy bien a «¿la cebolla es baja en
 * FODMAP?» —hay 1.843 fichas para eso— y no contestaba a la búsqueda con la
 * que se empieza la dieta, que es la genérica: quien acaba de salir de la
 * consulta no sabe todavía por qué alimento preguntar.
 *
 * Los títulos de nivel+categoría van con el nivel DETRÁS del nombre («Frutas
 * con FODMAP bajo») en los idiomas con género: «Frutas bajas» y «Lácteos
 * bajos» concuerdan distinto y una sola plantilla no puede con las doce
 * categorías. En inglés y alemán el adjetivo va delante sin ese problema.
 */

export const NIVELES: FodmapLevel[] = ['low', 'moderate', 'high'];

export const NIVEL_SLUG: Record<FodmapLevel, Record<Locale, string>> = {
  low: {
    en: 'low-fodmap',
    es: 'bajos-en-fodmap',
    fr: 'pauvres-en-fodmap',
    de: 'fodmap-arm',
    it: 'bassi-in-fodmap',
    pt: 'baixos-em-fodmap',
  },
  moderate: {
    en: 'moderate-fodmap',
    es: 'moderados-en-fodmap',
    fr: 'moderes-en-fodmap',
    de: 'mittlerer-fodmap',
    it: 'moderati-in-fodmap',
    pt: 'moderados-em-fodmap',
  },
  high: {
    en: 'high-fodmap',
    es: 'altos-en-fodmap',
    fr: 'riches-en-fodmap',
    de: 'fodmap-reich',
    it: 'alti-in-fodmap',
    pt: 'altos-em-fodmap',
  },
};

interface TextosNivel {
  /** H1 de la lista completa. */
  h1: string;
  metaTitle: string;
  /** Admite {n}. */
  metaDesc: string;
  /** Párrafo de entrada. Admite {n}. */
  intro: string;
  /** H1 del corte por categoría. Admite {cat}. */
  catH1: string;
  /** Admite {cat}. */
  catMetaTitle: string;
  /** Admite {cat} y {n}. */
  catMetaDesc: string;
}

export const NIVEL_TEXTOS: Record<Locale, Record<FodmapLevel, TextosNivel>> = {
  en: {
    low: {
      h1: 'Low FODMAP foods',
      metaTitle: 'Low FODMAP foods: the full list with safe servings',
      metaDesc:
        'The {n} low FODMAP foods in Fodmind, each with its safe serving in grams and the FODMAPs it contains. Browse by category or check a label with the app.',
      intro:
        'These {n} foods are low FODMAP in a normal serving. The grams next to each one are the serving that stays low: past that amount, the same food can stop being safe.',
      catH1: 'Low FODMAP {cat}',
      catMetaTitle: 'Low FODMAP {cat}: the list with safe servings',
      catMetaDesc:
        'The {n} {cat} that are low FODMAP, each with its safe serving in grams and the FODMAPs it contains.',
    },
    moderate: {
      h1: 'Moderate FODMAP foods',
      metaTitle: 'Moderate FODMAP foods: how much of each you can eat',
      metaDesc:
        'The {n} moderate FODMAP foods: there is a serving that stays low, but it is smaller than a normal portion. See how much of each one you can eat.',
      intro:
        'These {n} foods are moderate: there is a serving that stays low, but it is smaller than what people normally eat. Here the amount is what decides.',
      catH1: 'Moderate FODMAP {cat}',
      catMetaTitle: 'Moderate FODMAP {cat}: how much you can eat',
      catMetaDesc:
        'The {n} {cat} rated moderate, with the safe serving in grams for each one.',
    },
    high: {
      h1: 'High FODMAP foods',
      metaTitle: 'High FODMAP foods: the list and what to eat instead',
      metaDesc:
        'The {n} high FODMAP foods in Fodmind, with the FODMAPs behind each one and low FODMAP substitutes that play the same role on the plate.',
      intro:
        'These {n} foods are high FODMAP in a normal serving. Most have a substitute that does the same job on the plate: open any of them to see it.',
      catH1: 'High FODMAP {cat}',
      catMetaTitle: 'High FODMAP {cat}: the list and what to use instead',
      catMetaDesc:
        'The {n} {cat} that are high FODMAP, with the FODMAPs they contain and substitutes for each one.',
    },
  },

  es: {
    low: {
      h1: 'Alimentos bajos en FODMAP',
      metaTitle: 'Alimentos bajos en FODMAP: la lista completa con raciones seguras',
      metaDesc:
        'Los {n} alimentos bajos en FODMAP de Fodmind, cada uno con su ración segura en gramos y los FODMAPs que contiene. Explóralos por categoría o comprueba una etiqueta con la app.',
      intro:
        'Estos {n} alimentos son bajos en FODMAP en una ración normal. Los gramos que van al lado de cada uno son la ración que sigue siendo baja: a partir de ahí, el mismo alimento puede dejar de serlo.',
      catH1: '{cat} con FODMAP bajo',
      catMetaTitle: '{cat} con FODMAP bajo: la lista con raciones seguras',
      catMetaDesc:
        'Los {n} {cat} bajos en FODMAP, cada uno con su ración segura en gramos y los FODMAPs que contiene.',
    },
    moderate: {
      h1: 'Alimentos moderados en FODMAP',
      metaTitle: 'Alimentos moderados en FODMAP: cuánto puedes comer de cada uno',
      metaDesc:
        'Los {n} alimentos moderados en FODMAP: hay una ración que sigue siendo baja, pero es más pequeña que una ración normal. Mira cuánto puedes comer de cada uno.',
      intro:
        'Estos {n} alimentos son moderados: existe una ración que sigue siendo baja, pero es más pequeña que la que se come normalmente. Aquí manda la cantidad.',
      catH1: '{cat} con FODMAP moderado',
      catMetaTitle: '{cat} con FODMAP moderado: cuánto puedes comer',
      catMetaDesc:
        'Los {n} {cat} clasificados como moderados, con la ración segura en gramos de cada uno.',
    },
    high: {
      h1: 'Alimentos altos en FODMAP',
      metaTitle: 'Alimentos altos en FODMAP: la lista y por qué cambiarlos',
      metaDesc:
        'Los {n} alimentos altos en FODMAP de Fodmind, con los FODMAPs que hay detrás de cada uno y sustitutos bajos que hacen el mismo papel en el plato.',
      intro:
        'Estos {n} alimentos son altos en FODMAP en una ración normal. Casi todos tienen un sustituto que hace el mismo papel en el plato: entra en cualquiera para verlo.',
      catH1: '{cat} con FODMAP alto',
      catMetaTitle: '{cat} con FODMAP alto: la lista y con qué cambiarlos',
      catMetaDesc:
        'Los {n} {cat} altos en FODMAP, con los FODMAPs que contienen y sustitutos para cada uno.',
    },
  },

  fr: {
    low: {
      h1: 'Aliments pauvres en FODMAP',
      metaTitle: 'Aliments pauvres en FODMAP : la liste complète avec les portions sûres',
      metaDesc:
        'Les {n} aliments pauvres en FODMAP de Fodmind, chacun avec sa portion sûre en grammes et les FODMAP qu’il contient. Parcourez-les par catégorie ou vérifiez une étiquette avec l’app.',
      intro:
        'Ces {n} aliments sont pauvres en FODMAP dans une portion normale. Les grammes indiqués à côté de chacun sont la portion qui reste basse : au-delà, le même aliment peut cesser de l’être.',
      catH1: '{cat} à FODMAP faible',
      catMetaTitle: '{cat} à FODMAP faible : la liste avec les portions sûres',
      catMetaDesc:
        'Les {n} {cat} pauvres en FODMAP, chacun avec sa portion sûre en grammes et les FODMAP qu’il contient.',
    },
    moderate: {
      h1: 'Aliments modérés en FODMAP',
      metaTitle: 'Aliments modérés en FODMAP : quelle quantité manger',
      metaDesc:
        'Les {n} aliments modérés en FODMAP : il existe une portion qui reste basse, mais plus petite qu’une portion normale. Voyez combien vous pouvez en manger.',
      intro:
        'Ces {n} aliments sont modérés : il existe une portion qui reste basse, mais elle est plus petite que celle qu’on mange d’habitude. Ici, c’est la quantité qui décide.',
      catH1: '{cat} à FODMAP modéré',
      catMetaTitle: '{cat} à FODMAP modéré : quelle quantité manger',
      catMetaDesc:
        'Les {n} {cat} classés modérés, avec la portion sûre en grammes de chacun.',
    },
    high: {
      h1: 'Aliments riches en FODMAP',
      metaTitle: 'Aliments riches en FODMAP : la liste et par quoi les remplacer',
      metaDesc:
        'Les {n} aliments riches en FODMAP de Fodmind, avec les FODMAP responsables et des substituts pauvres en FODMAP qui jouent le même rôle dans l’assiette.',
      intro:
        'Ces {n} aliments sont riches en FODMAP dans une portion normale. Presque tous ont un substitut qui joue le même rôle dans l’assiette : ouvrez-en un pour le voir.',
      catH1: '{cat} à FODMAP élevé',
      catMetaTitle: '{cat} à FODMAP élevé : la liste et par quoi les remplacer',
      catMetaDesc:
        'Les {n} {cat} riches en FODMAP, avec les FODMAP qu’ils contiennent et des substituts pour chacun.',
    },
  },

  de: {
    low: {
      h1: 'FODMAP-arme Lebensmittel',
      metaTitle: 'FODMAP-arme Lebensmittel: die vollständige Liste mit sicheren Portionen',
      metaDesc:
        'Die {n} FODMAP-armen Lebensmittel in Fodmind, jedes mit seiner sicheren Portion in Gramm und den enthaltenen FODMAPs. Nach Kategorie durchsehen oder ein Etikett mit der App prüfen.',
      intro:
        'Diese {n} Lebensmittel sind in einer normalen Portion FODMAP-arm. Die Gramm daneben sind die Portion, die niedrig bleibt: darüber hinaus kann dasselbe Lebensmittel aufhören, es zu sein.',
      catH1: '{cat} mit niedrigem FODMAP-Gehalt',
      catMetaTitle: '{cat} mit niedrigem FODMAP-Gehalt: die Liste mit sicheren Portionen',
      catMetaDesc:
        'Die {n} {cat} mit niedrigem FODMAP-Gehalt, jedes mit seiner sicheren Portion in Gramm und den enthaltenen FODMAPs.',
    },
    moderate: {
      h1: 'Lebensmittel mit mittlerem FODMAP-Gehalt',
      metaTitle: 'Lebensmittel mit mittlerem FODMAP-Gehalt: wie viel du essen kannst',
      metaDesc:
        'Die {n} Lebensmittel mit mittlerem FODMAP-Gehalt: es gibt eine Portion, die niedrig bleibt, aber sie ist kleiner als eine normale. Sieh nach, wie viel davon geht.',
      intro:
        'Diese {n} Lebensmittel sind mittel: es gibt eine Portion, die niedrig bleibt, aber sie ist kleiner als das, was man normalerweise isst. Hier entscheidet die Menge.',
      catH1: '{cat} mit mittlerem FODMAP-Gehalt',
      catMetaTitle: '{cat} mit mittlerem FODMAP-Gehalt: wie viel du essen kannst',
      catMetaDesc:
        'Die {n} {cat} mit mittlerem FODMAP-Gehalt, mit der sicheren Portion in Gramm für jedes.',
    },
    high: {
      h1: 'FODMAP-reiche Lebensmittel',
      metaTitle: 'FODMAP-reiche Lebensmittel: die Liste und was stattdessen geht',
      metaDesc:
        'Die {n} FODMAP-reichen Lebensmittel in Fodmind, mit den FODMAPs dahinter und FODMAP-armen Alternativen, die auf dem Teller dieselbe Rolle spielen.',
      intro:
        'Diese {n} Lebensmittel sind in einer normalen Portion FODMAP-reich. Fast alle haben eine Alternative, die auf dem Teller dasselbe leistet: öffne eines, um sie zu sehen.',
      catH1: '{cat} mit hohem FODMAP-Gehalt',
      catMetaTitle: '{cat} mit hohem FODMAP-Gehalt: die Liste und die Alternativen',
      catMetaDesc:
        'Die {n} {cat} mit hohem FODMAP-Gehalt, mit den enthaltenen FODMAPs und Alternativen für jedes.',
    },
  },

  it: {
    low: {
      h1: 'Alimenti bassi in FODMAP',
      metaTitle: 'Alimenti bassi in FODMAP: l’elenco completo con le porzioni sicure',
      metaDesc:
        'I {n} alimenti bassi in FODMAP di Fodmind, ognuno con la sua porzione sicura in grammi e i FODMAP che contiene. Sfoglia per categoria o controlla un’etichetta con l’app.',
      intro:
        'Questi {n} alimenti sono bassi in FODMAP in una porzione normale. I grammi accanto a ciascuno sono la porzione che resta bassa: oltre quella, lo stesso alimento può smettere di esserlo.',
      catH1: '{cat} con FODMAP basso',
      catMetaTitle: '{cat} con FODMAP basso: l’elenco con le porzioni sicure',
      catMetaDesc:
        'I {n} {cat} bassi in FODMAP, ognuno con la sua porzione sicura in grammi e i FODMAP che contiene.',
    },
    moderate: {
      h1: 'Alimenti moderati in FODMAP',
      metaTitle: 'Alimenti moderati in FODMAP: quanto puoi mangiarne',
      metaDesc:
        'I {n} alimenti moderati in FODMAP: esiste una porzione che resta bassa, ma è più piccola di una porzione normale. Guarda quanto puoi mangiarne.',
      intro:
        'Questi {n} alimenti sono moderati: esiste una porzione che resta bassa, ma è più piccola di quella che si mangia di solito. Qui comanda la quantità.',
      catH1: '{cat} con FODMAP moderato',
      catMetaTitle: '{cat} con FODMAP moderato: quanto puoi mangiarne',
      catMetaDesc:
        'I {n} {cat} classificati come moderati, con la porzione sicura in grammi di ciascuno.',
    },
    high: {
      h1: 'Alimenti alti in FODMAP',
      metaTitle: 'Alimenti alti in FODMAP: l’elenco e con cosa sostituirli',
      metaDesc:
        'I {n} alimenti alti in FODMAP di Fodmind, con i FODMAP che ci sono dietro e sostituti bassi che fanno la stessa parte nel piatto.',
      intro:
        'Questi {n} alimenti sono alti in FODMAP in una porzione normale. Quasi tutti hanno un sostituto che fa la stessa parte nel piatto: aprine uno per vederlo.',
      catH1: '{cat} con FODMAP alto',
      catMetaTitle: '{cat} con FODMAP alto: l’elenco e con cosa sostituirli',
      catMetaDesc:
        'I {n} {cat} alti in FODMAP, con i FODMAP che contengono e sostituti per ciascuno.',
    },
  },

  pt: {
    low: {
      h1: 'Alimentos baixos em FODMAP',
      metaTitle: 'Alimentos baixos em FODMAP: a lista completa com porções seguras',
      metaDesc:
        'Os {n} alimentos baixos em FODMAP do Fodmind, cada um com a sua porção segura em gramas e os FODMAP que contém. Percorre por categoria ou verifica um rótulo com a app.',
      intro:
        'Estes {n} alimentos são baixos em FODMAP numa porção normal. As gramas ao lado de cada um são a porção que continua baixa: a partir daí, o mesmo alimento pode deixar de o ser.',
      catH1: '{cat} com FODMAP baixo',
      catMetaTitle: '{cat} com FODMAP baixo: a lista com porções seguras',
      catMetaDesc:
        'Os {n} {cat} baixos em FODMAP, cada um com a sua porção segura em gramas e os FODMAP que contém.',
    },
    moderate: {
      h1: 'Alimentos moderados em FODMAP',
      metaTitle: 'Alimentos moderados em FODMAP: quanto podes comer de cada um',
      metaDesc:
        'Os {n} alimentos moderados em FODMAP: existe uma porção que continua baixa, mas é mais pequena do que uma porção normal. Vê quanto podes comer.',
      intro:
        'Estes {n} alimentos são moderados: existe uma porção que continua baixa, mas é mais pequena do que a que se come normalmente. Aqui manda a quantidade.',
      catH1: '{cat} com FODMAP moderado',
      catMetaTitle: '{cat} com FODMAP moderado: quanto podes comer',
      catMetaDesc:
        'Os {n} {cat} classificados como moderados, com a porção segura em gramas de cada um.',
    },
    high: {
      h1: 'Alimentos altos em FODMAP',
      metaTitle: 'Alimentos altos em FODMAP: a lista e por que trocá-los',
      metaDesc:
        'Os {n} alimentos altos em FODMAP do Fodmind, com os FODMAP que estão por trás de cada um e substitutos baixos que fazem o mesmo papel no prato.',
      intro:
        'Estes {n} alimentos são altos em FODMAP numa porção normal. Quase todos têm um substituto que faz o mesmo papel no prato: abre qualquer um para o ver.',
      catH1: '{cat} com FODMAP alto',
      catMetaTitle: '{cat} com FODMAP alto: a lista e com que trocá-los',
      catMetaDesc:
        'Os {n} {cat} altos em FODMAP, com os FODMAP que contêm e substitutos para cada um.',
    },
  },
};
