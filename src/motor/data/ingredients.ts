import { FodmapType, Lang, LocalizedString } from './types';

// Diccionario de ingredientes para el lector de etiquetas.
//
// POR QUÉ NO ES LA TABLA DE ALIMENTOS. Los 411 de src/data/foods son COMIDA:
// manzana, pan, leche. Esto son INGREDIENTES tal y como los escribe un
// fabricante en un envase: «jarabe de glucosa-fructosa», «E965», «fibra de raíz
// de achicoria», «aroma natural». Se solapan poco y se buscan distinto: aquí lo
// que importa son las VARIANTES DE ESCRITURA.
//
// `forms` MEZCLA LOS SEIS IDIOMAS A PROPÓSITO. El envase que tienes en la mano
// no está en el idioma de tu app: un español en Berlín lee «Zwiebelpulver» y
// tiene que salirle «cebolla en polvo». Por eso el índice es plano y políglota,
// y por eso esto funciona en cualquier supermercado de Europa — que es
// justamente lo que las apps de código de barras no saben hacer.
//
// LAS CUATRO SEVERIDADES:
//   high      — FODMAP conocido, en cantidad que suele importar.
//   watch     — depende de la cantidad o de la variedad. Ámbar, no rojo.
//   ambiguous — la etiqueta NO dice qué hay dentro («especias», «aroma»). No es
//               un dato: es incertidumbre, y se pinta como tal.
//   ok        — aparece porque la gente lo teme y NO es FODMAP. Existe para
//               poder decir «esto sí puedes», que es la mitad del valor.
//
// FORMATO COMPACTO A PROPÓSITO: `n` admite un solo string cuando el nombre es
// igual en los seis idiomas (Sorbitol, E-números), y la explicación se comparte
// por FAMILIA, porque el porqué de la inulina es el mismo que el del FOS y el
// de la achicoria. Escribir cada entrada con seis notas propias haría el
// fichero irrevisable, y un dato que nadie revisa es un dato que miente.

export type SeveridadIngrediente = 'high' | 'watch' | 'ambiguous' | 'ok';

/** Las explicaciones, una por familia. Convierten una alarma en información. */
export const NOTAS_FAMILIA = {
  cebollaAjo: {
    es: 'Sus fructanos son solubles en agua: pasan a cualquier caldo, sofrito o polvo aunque no se vea el trozo.',
    en: 'Its fructans are water-soluble: they pass into any stock, sofrito or powder even when no piece is visible.',
    fr: 'Ses fructanes sont solubles dans l’eau : ils passent dans tout bouillon ou poudre, même sans morceau visible.',
    de: 'Seine Fruktane sind wasserlöslich: Sie gehen in jede Brühe oder jedes Pulver über, auch ohne sichtbares Stück.',
    it: 'I suoi fruttani sono solubili in acqua: passano in qualsiasi brodo o polvere anche senza pezzi visibili.',
    pt: 'Os seus frutanos são solúveis em água: passam para qualquer caldo ou pó mesmo sem pedaços visíveis.',
  },
  trigo: {
    es: 'El trigo, el centeno y la cebada aportan fructanos. Cuánto, depende de la cantidad: si va al final de la lista, pesa poco.',
    en: 'Wheat, rye and barley carry fructans. How much depends on the amount: last in the list means little.',
    fr: 'Le blé, le seigle et l’orge apportent des fructanes. La quantité dépend de la dose : en fin de liste, c’est peu.',
    de: 'Weizen, Roggen und Gerste liefern Fruktane. Wie viel, hängt von der Menge ab: am Listenende ist es wenig.',
    it: 'Frumento, segale e orzo apportano fruttani. Quanto dipende dalla quantità: in fondo alla lista, poco.',
    pt: 'Trigo, centeio e cevada trazem frutanos. Quanto depende da quantidade: no fim da lista, pouco.',
  },
  inulina: {
    es: 'Fructano concentrado que se añade como fibra o para sustituir grasa o azúcar. Suele ir en cantidades altas.',
    en: 'Concentrated fructan added as fibre or to replace fat or sugar. Usually present in high amounts.',
    fr: 'Fructane concentré ajouté comme fibre ou pour remplacer graisse ou sucre. Souvent en quantités élevées.',
    de: 'Konzentriertes Fruktan, zugesetzt als Ballaststoff oder als Fett- bzw. Zuckerersatz. Meist in hohen Mengen.',
    it: 'Fruttano concentrato aggiunto come fibra o per sostituire grassi o zucchero. Di solito in quantità elevate.',
    pt: 'Frutano concentrado adicionado como fibra ou para substituir gordura ou açúcar. Costuma vir em quantidades altas.',
  },
  legumbre: {
    es: 'Las legumbres aportan GOS. Escurridas y enjuagadas tienen bastante menos, porque el GOS se va con el líquido.',
    en: 'Pulses carry GOS. Drained and rinsed they have far less, because GOS leaches into the liquid.',
    fr: 'Les légumineuses apportent des GOS. Égouttées et rincées, bien moins : les GOS passent dans le liquide.',
    de: 'Hülsenfrüchte liefern GOS. Abgetropft und abgespült deutlich weniger, da GOS ins Wasser übergeht.',
    it: 'I legumi apportano GOS. Scolati e sciacquati ne hanno molti meno, perché i GOS passano nel liquido.',
    pt: 'As leguminosas trazem GOS. Escorridas e enxaguadas têm bastante menos, porque o GOS passa para o líquido.',
  },
  // POR QUE UNA FAMILIA PARA ESTO Y NO LA DE LEGUMBRES, que tambien es GOS: su
  // nota dice «escurridas y enjuagadas tienen bastante menos, porque el GOS se
  // va con el liquido». Cierto de un bote de garbanzos y absurdo de un punhado
  // de anacardos. La nota es lo que lee la persona: una nota equivocada es peor
  // que una constante de mas.
  pimientoColor: {
    es: 'El pimiento rojo aporta fructosa y el verde no. Si la etiqueta no dice de qué color es, cuenta como que la lleva.',
    en: 'Red bell pepper carries fructose and green does not. If the label does not say which colour, count it as carrying it.',
    fr: 'Le poivron rouge apporte du fructose, le vert non. Si l’étiquette ne dit pas la couleur, comptez qu’il en contient.',
    de: 'Rote Paprika liefert Fruktose, grüne nicht. Wenn das Etikett die Farbe nicht nennt, rechne damit, dass sie welche enthält.',
    it: 'Il peperone rosso apporta fruttosio, quello verde no. Se l’etichetta non dice il colore, conta che ne abbia.',
    pt: 'O pimento vermelho traz frutose e o verde não. Se o rótulo não diz a cor, conte que leva.',
  },
  chocolate: {
    es: 'El chocolate con leche y el blanco llevan lactosa; el negro, bastante menos. Si la etiqueta no dice cuál es, cuenta como que la lleva.',
    en: 'Milk and white chocolate carry lactose; dark carries far less. If the label does not say which one it is, count it as carrying it.',
    fr: 'Le chocolat au lait et le blanc contiennent du lactose ; le noir bien moins. Si l’étiquette ne dit pas lequel, comptez qu’il en contient.',
    de: 'Milch- und weiße Schokolade enthalten Laktose; Zartbitter deutlich weniger. Wenn das Etikett nicht sagt welche, rechne damit, dass sie welche enthält.',
    it: 'Il cioccolato al latte e quello bianco contengono lattosio; il fondente molto meno. Se l’etichetta non dice quale sia, conta che ne abbia.',
    pt: 'O chocolate de leite e o branco levam lactose; o preto bastante menos. Se o rótulo não diz qual é, conte que leva.',
  },
  platanoSinDecir: {
    es: 'Depende de lo maduro que esté, y la diferencia es enorme: poco maduro aguanta un plátano entero, y maduro —con motas marrones— se pasa de ración a un tercio. Es la misma fruta madurando.',
    en: 'It depends on how ripe it is, and the gap is huge: firm and barely ripe holds a whole banana, while ripe —with brown spots— goes over the serving at a third of one. Same fruit, further along.',
    fr: 'Cela dépend de sa maturité, et l’écart est énorme : peu mûre, elle tient une banane entière ; mûre —avec des taches brunes— elle dépasse la portion au tiers. C’est le même fruit plus avancé.',
    de: 'Es hängt von der Reife ab, und der Unterschied ist groß: fest und kaum reif trägt eine ganze Banane, reif —mit braunen Flecken— ist die Portion schon bei einem Drittel überschritten. Dieselbe Frucht, weiter gereift.',
    it: 'Dipende da quanto è matura, e la differenza è enorme: acerba regge una banana intera, matura —con le macchie scure— supera la porzione a un terzo. È lo stesso frutto più avanti.',
    pt: 'Depende de quanto está madura, e a diferença é enorme: verde aguenta uma banana inteira, madura —com manchas castanhas— passa da dose a um terço. É a mesma fruta mais adiante.',
  },
  pipaSinDecir: {
    es: 'No dice de cuál, y no hay ninguna «pipa» libre: las de girasol son altas en fructanos y las de calabaza aguantan un puñado corto. En España «pipas» a secas suele ser girasol, que es la peor de las dos.',
    en: 'It does not say which, and no seed here is free: sunflower seeds are high in fructans and pumpkin seeds hold only a small handful.',
    fr: 'Ne dit pas lesquelles, et aucune n’est libre : les graines de tournesol sont riches en fructanes et celles de courge ne tiennent qu’une petite poignée.',
    de: 'Es steht nicht, welche, und keine ist frei: Sonnenblumenkerne sind hoch an Fruktan und Kürbiskerne tragen nur eine kleine Handvoll.',
    it: 'Non dice quali, e nessuno è libero: i semi di girasole sono alti in fruttani e quelli di zucca reggono solo una manciata piccola.',
    pt: 'Não diz quais, e nenhuma é livre: as de girassol são altas em frutanos e as de abóbora aguentam apenas um punhado pequeno.',
  },
  melonSinDecir: {
    es: 'No dice de cuál. El cantalupo es alto en fructosa y el blanco aguanta poco más de media ración; la sandía es otra fruta y también es alta. Ninguno de los tres es un melón «seguro» sin mirar la cantidad.',
    en: 'It does not say which. Cantaloupe is high in fructose and honeydew holds little more than half a serving; watermelon is a different fruit and is also high. None of the three is a «safe» melon without checking the amount.',
    fr: 'Ne dit pas lequel. Le cantaloup est riche en fructose et le melon miel ne tient guère plus d’une demi-portion ; la pastèque est un autre fruit et elle est aussi élevée. Aucun des trois n’est un melon «sans souci» sans regarder la quantité.',
    de: 'Es steht nicht, welche. Cantaloupe ist hoch an Fruktose und die Honigmelone trägt kaum mehr als eine halbe Portion; die Wassermelone ist eine andere Frucht und ebenfalls hoch. Keine der drei ist eine «sichere» Melone, ohne auf die Menge zu schauen.',
    it: 'Non dice quale. Il cantalupo è alto in fruttosio e il melone bianco regge poco più di mezza porzione; l’anguria è un altro frutto ed è anch’essa alta. Nessuno dei tre è un melone «sicuro» senza guardare la quantità.',
    pt: 'Não diz qual. O cantalupo é alto em frutose e o melão branco aguenta pouco mais de meia dose; a melancia é outra fruta e também é alta. Nenhum dos três é um melão «seguro» sem olhar a quantidade.',
  },
  arandanoSinDecir: {
    es: 'No dice de cuál. El azul y el rojo son frutas distintas y ninguna es libre: las dos piden mirar la ración. Y el arándano rojo DESHIDRATADO concentra el azúcar hasta ser alto, aunque se llame igual.',
    en: 'It does not say which. Blueberry and cranberry are different fruits and neither is free: both need the serving checked. And DRIED cranberry concentrates the sugar until it is high, even though it goes by the same name.',
    fr: 'Ne dit pas lequel. La myrtille et la canneberge sont deux fruits différents et aucun n’est libre : les deux demandent de regarder la portion. Et la canneberge SÉCHÉE concentre le sucre au point d’être élevée, sous le même nom.',
    de: 'Es steht nicht, welche. Heidelbeere und Cranberry sind verschiedene Früchte und keine ist frei: bei beiden zählt die Portion. Und die GETROCKNETE Cranberry konzentriert den Zucker, bis sie hoch ist – unter demselben Namen.',
    it: 'Non dice quale. Mirtillo e mirtillo rosso sono frutti diversi e nessuno è libero: entrambi chiedono di guardare la porzione. E il mirtillo rosso ESSICCATO concentra lo zucchero fino a essere alto, pur chiamandosi uguale.',
    pt: 'Não diz qual. O mirtilo e o arando são frutas diferentes e nenhuma é livre: ambas pedem olhar a dose. E o arando DESIDRATADO concentra o açúcar até ser alto, com o mesmo nome.',
  },
  frutoSecoSinDecir: {
    es: 'El envase declara el alérgeno, no el fruto seco, y entre ellos hay mucha diferencia: el anacardo y el pistacho son altos, la almendra y la avellana dependen de la cantidad, y la nuez y la macadamia son bajas.',
    en: 'The label declares the allergen, not which nut, and they differ a lot: cashew and pistachio are high, almond and hazelnut depend on the amount, and walnut and macadamia are low.',
    fr: 'L’emballage déclare l’allergène, pas le fruit à coque, et ils diffèrent beaucoup : noix de cajou et pistache sont élevées, amande et noisette dépendent de la quantité, noix et macadamia sont basses.',
    de: 'Die Packung nennt das Allergen, nicht die Nuss, und die Unterschiede sind groß: Cashew und Pistazie sind hoch, Mandel und Haselnuss hängen von der Menge ab, Walnuss und Macadamia sind niedrig.',
    it: 'La confezione dichiara l’allergene, non quale frutto a guscio, e le differenze sono grandi: anacardo e pistacchio sono alti, mandorla e nocciola dipendono dalla quantità, noce e macadamia sono bassi.',
    pt: 'A embalagem declara o alergénio, não o fruto seco, e as diferenças são grandes: caju e pistacho são altos, amêndoa e avelã dependem da quantidade, e noz e macâdamia são baixos.',
  },
  frutoSecoGos: {
    es: 'Es de los frutos secos con más GOS y fructanos: un puñado ya cuenta, y a diferencia de las legumbres no hay forma de quitarlos con agua.',
    en: 'One of the nuts highest in GOS and fructans: a handful already counts, and unlike pulses there is no way to rinse them out.',
    fr: 'C’est l’un des fruits à coque les plus riches en GOS et fructanes : une poignée compte déjà, et contrairement aux légumineuses on ne peut pas les rincer.',
    de: 'Gehört zu den Nüssen mit dem meisten GOS und Fruktan: eine Handvoll zählt schon, und anders als bei Hülsenfrüchten lässt es sich nicht abspülen.',
    it: 'È tra la frutta secca con più GOS e fruttani: una manciata conta già, e a differenza dei legumi non si possono sciacquare via.',
    pt: 'É dos frutos secos com mais GOS e frutanos: um punhado já conta e, ao contrário das leguminosas, não se tiram com água.',
  },
  lactosa: {
    es: 'Lleva lactosa. Si ya comprobaste en un reto que la toleras, esto no es un problema para ti.',
    en: 'Contains lactose. If a challenge already showed you tolerate it, this is not a problem for you.',
    fr: 'Contient du lactose. Si un test a déjà montré que vous le tolérez, ce n’est pas un problème pour vous.',
    de: 'Enthält Laktose. Wenn ein Test bereits zeigte, dass du sie verträgst, ist das für dich kein Problem.',
    it: 'Contiene lattosio. Se una sfida ha già mostrato che lo tolleri, per te non è un problema.',
    pt: 'Contém lactose. Se um desafio já mostrou que a toleras, isto não é um problema para ti.',
  },
  fructosa: {
    es: 'Aporta más fructosa que glucosa, y ese exceso es el que cuesta absorber.',
    en: 'Provides more fructose than glucose, and it is that excess which is hard to absorb.',
    fr: 'Apporte plus de fructose que de glucose, et c’est cet excès qui est difficile à absorber.',
    de: 'Liefert mehr Fruktose als Glukose, und genau dieser Überschuss ist schwer aufzunehmen.',
    it: 'Apporta più fruttosio che glucosio, ed è questo eccesso a essere difficile da assorbire.',
    pt: 'Fornece mais frutose do que glicose, e é esse excesso que custa a absorver.',
  },
  poliol: {
    es: 'Poliol: se absorbe mal por diseño, y por eso se usa como edulcorante sin calorías. En cantidad es laxante.',
    en: 'Polyol: poorly absorbed by design, which is why it is used as a calorie-free sweetener. In amount it is laxative.',
    fr: 'Polyol : mal absorbé par nature, d’où son usage comme édulcorant sans calories. En quantité, effet laxatif.',
    de: 'Polyol: von Natur aus schlecht aufgenommen, daher als kalorienfreier Süßstoff genutzt. In Menge abführend.',
    it: 'Poliolo: assorbito male per natura, per questo si usa come dolcificante senza calorie. In quantità è lassativo.',
    pt: 'Poliol: mal absorvido por natureza, por isso se usa como adoçante sem calorias. Em quantidade é laxante.',
  },
  desecada: {
    es: 'Al secarse, el azúcar se concentra: una ración pequeña equivale a mucha fruta.',
    en: 'Drying concentrates the sugar: a small serving equals a lot of fruit.',
    fr: 'En séchant, le sucre se concentre : une petite portion équivaut à beaucoup de fruits.',
    de: 'Beim Trocknen konzentriert sich der Zucker: Eine kleine Portion entspricht viel Obst.',
    it: 'Essiccandosi lo zucchero si concentra: una porzione piccola equivale a molta frutta.',
    pt: 'Ao secar, o açúcar concentra-se: uma porção pequena equivale a muita fruta.',
  },
  ambiguo: {
    es: 'La normativa no obliga a detallar qué contiene. En muchos productos incluye ajo o cebolla.',
    en: 'Regulations do not require listing what is inside. In many products it includes garlic or onion.',
    fr: 'La réglementation n’oblige pas à détailler le contenu. Dans beaucoup de produits, cela inclut ail ou oignon.',
    de: 'Die Vorschriften verlangen keine Aufschlüsselung. In vielen Produkten sind Knoblauch oder Zwiebel enthalten.',
    it: 'La normativa non obbliga a dettagliare il contenuto. In molti prodotti include aglio o cipolla.',
    pt: 'A regulamentação não obriga a detalhar o conteúdo. Em muitos produtos inclui alho ou cebola.',
  },
  alcohol: {
    es: 'El alcohol no es un FODMAP: no es un hidrato de carbono fermentable. Irrita el intestino por su cuenta, y en un envase suele ir en cantidades minimas, como disolvente de un aroma o para que el pan aguante.',
    en: 'Alcohol is not a FODMAP: it is not a fermentable carbohydrate. It irritates the gut on its own, and on a label it is usually there in tiny amounts, as a solvent for a flavouring or to keep bread fresh.',
    fr: 'L’alcool n’est pas un FODMAP : ce n’est pas un glucide fermentescible. Il irrite l’intestin pour son propre compte, et sur un emballage il figure en quantités minimes, comme solvant d’un arôme ou pour la conservation du pain.',
    de: 'Alkohol ist kein FODMAP: er ist kein fermentierbares Kohlenhydrat. Er reizt den Darm auf eigene Rechnung, und auf einer Packung steht er meist in winzigen Mengen, als Lösungsmittel eines Aromas oder zur Frischhaltung von Brot.',
    it: 'L’alcol non è un FODMAP: non è un carboidrato fermentabile. Irrita l’intestino per conto suo, e su una confezione compare in quantità minime, come solvente di un aroma o per conservare il pane.',
    pt: 'O álcool não é um FODMAP: não é um hidrato de carbono fermentável. Irrita o intestino por sua conta, e num rótulo aparece em quantidades minimas, como solvente de um aroma ou para conservar o pão.',
  },
  seguro: {
    es: 'No es FODMAP. Aparece aquí porque se confunde a menudo con uno.',
    en: 'Not a FODMAP. It appears here because it is often mistaken for one.',
    fr: 'Ce n’est pas un FODMAP. Il figure ici parce qu’on le confond souvent avec un.',
    de: 'Kein FODMAP. Steht hier, weil es oft mit einem verwechselt wird.',
    it: 'Non è un FODMAP. Compare qui perché spesso viene scambiato per uno.',
    pt: 'Não é um FODMAP. Aparece aqui porque é frequentemente confundido com um.',
  },
  fibraSinDecir: {
    es: 'La etiqueta no dice qué fibra es. La añadida más común es la de raíz de achicoria, que es inulina (fructanos).',
    en: 'The label does not say which fibre it is. The most common added one is chicory root fibre, which is inulin (fructans).',
    fr: 'L’étiquette ne dit pas quelle fibre c’est. La plus courante des fibres ajoutées est celle de racine de chicorée : de l’inuline (fructanes).',
    de: 'Das Etikett sagt nicht, welche Faser es ist. Die häufigste zugesetzte ist Zichorienwurzelfaser, also Inulin (Fruktane).',
    it: 'L’etichetta non dice quale fibra sia. La più comune tra quelle aggiunte è la fibra di radice di cicoria, cioè inulina (fruttani).',
    pt: 'O rótulo não diz que fibra é. A adicionada mais comum é a de raiz de chicória, que é inulina (frutanos).',
  },
} satisfies Record<string, LocalizedString>;

export type FamiliaNota = keyof typeof NOTAS_FAMILIA;

/** Una entrada tal y como se escribe abajo: compacta y revisable de un vistazo. */
interface EntradaCompacta {
  id: string;
  /** un string si el nombre es igual en los seis idiomas; si no, los seis */
  n: string | LocalizedString;
  forms: string[];
  fodmaps: FodmapType[];
  sev: SeveridadIngrediente;
  fam: FamiliaNota;
  src: string;
  foodId?: string;
  excludeIf?: string[];
}

export interface Ingrediente {
  id: string;
  names: LocalizedString;
  forms: string[];
  fodmaps: FodmapType[];
  severity: SeveridadIngrediente;
  note: LocalizedString;
  sourceId: string;
  foodId?: string;
  excludeIf?: string[];
}

const LANGS: Lang[] = ['es', 'en', 'fr', 'de', 'it', 'pt'];

function expandir(e: EntradaCompacta): Ingrediente {
  const names =
    typeof e.n === 'string'
      ? (Object.fromEntries(LANGS.map((l) => [l, e.n as string])) as LocalizedString)
      : e.n;
  return {
    id: e.id,
    names,
    forms: e.forms,
    fodmaps: e.fodmaps,
    severity: e.sev,
    note: NOTAS_FAMILIA[e.fam],
    sourceId: e.src,
    foodId: e.foodId,
    excludeIf: e.excludeIf,
  };
}

const COMPACTO: EntradaCompacta[] = [
  // ── Cebolla y ajo: los dos que aparecen en casi todo producto procesado ──
  {
    id: 'onion', fam: 'cebollaAjo', src: 'varney2017', sev: 'high', fodmaps: ['fructans'], foodId: 'onion',
    n: { es: 'Cebolla', en: 'Onion', fr: 'Oignon', de: 'Zwiebel', it: 'Cipolla', pt: 'Cebola' },
    forms: ['cebolla', 'cebolla en polvo', 'cebolla deshidratada', 'cebolla granulada', 'extracto de cebolla',
      'onion', 'onion powder', 'dried onion', 'onion extract', 'oignon', 'oignon en poudre',
      'zwiebel', 'zwiebelpulver', 'zwiebelextrakt', 'cipolla', 'cipolla in polvere', 'cebola'],
  },
  {
    id: 'shallot', fam: 'cebollaAjo', src: 'varney2017', sev: 'high', fodmaps: ['fructans'],
    n: { es: 'Chalota', en: 'Shallot', fr: 'Échalote', de: 'Schalotte', it: 'Scalogno', pt: 'Chalota' },
    forms: ['chalota', 'chalote', 'shallot', 'echalote', 'schalotte', 'scalogno'],
  },
  {
    id: 'leek', fam: 'cebollaAjo', src: 'varney2017', sev: 'high', fodmaps: ['fructans'], foodId: 'leek-white',
    n: { es: 'Puerro', en: 'Leek', fr: 'Poireau', de: 'Lauch', it: 'Porro', pt: 'Alho-francês' },
    forms: ['puerro', 'leek', 'poireau', 'lauch', 'porro', 'alho frances'],
  },
  {
    id: 'garlic', fam: 'cebollaAjo', src: 'varney2017', sev: 'high', fodmaps: ['fructans'], foodId: 'garlic',
    // «ajo» casaría dentro de «ajonjolí»: el motor prueba las formas largas
    // primero y enmascara lo casado. El aceite infusionado, en excludeIf.
    n: { es: 'Ajo', en: 'Garlic', fr: 'Ail', de: 'Knoblauch', it: 'Aglio', pt: 'Alho' },
    forms: ['ajo', 'ajo en polvo', 'ajo deshidratado', 'ajo granulado', 'extracto de ajo',
      'garlic', 'garlic powder', 'dried garlic', 'garlic extract', 'knoblauch', 'knoblauchpulver',
      'aglio', 'aglio in polvere', 'alho', 'ail', 'ail en poudre'],
    excludeIf: ['aceite de ajo', 'garlic-infused oil', 'garlic infused oil', 'huile a l ail',
      'knoblauchol', 'olio all aglio', 'oleo de alho'],
  },
  {
    id: 'sofrito', fam: 'cebollaAjo', src: 'varney2017', sev: 'high', fodmaps: ['fructans'],
    n: { es: 'Sofrito', en: 'Sofrito base', fr: 'Base mirepoix', de: 'Röstbasis', it: 'Soffritto', pt: 'Refogado' },
    forms: ['sofrito', 'soffritto', 'refogado', 'mirepoix', 'rostbasis'],
  },
  {
    id: 'stock', fam: 'cebollaAjo', src: 'varney2017', sev: 'watch', fodmaps: ['fructans'],
    n: { es: 'Caldo vegetal', en: 'Vegetable stock', fr: 'Bouillon de légumes', de: 'Gemüsebrühe', it: 'Brodo vegetale', pt: 'Caldo de legumes' },
    // El caldo SUELTO, sin decir de qué, se escapaba 4 veces en un corpus de
    // 342 etiquetas reales. Y es de lo peor que puede escaparse: la nota de
    // esta misma familia dice que los fructanos de la cebolla «pasan a
    // cualquier caldo» aunque no se vea el trozo.
    forms: ['caldo', 'caldo de verduras', 'caldo vegetal', 'caldo de pollo', 'fondo de cocido',
      'stock', 'broth', 'vegetable stock', 'vegetable broth', 'chicken stock', 'beef stock',
      'bouillon', 'bouillon de legumes', 'fond de veau', 'bruhe', 'gemusebruhe', 'bruhwurfel',
      'brodo', 'brodo vegetale', 'caldo de legumes', 'caldo de galinha'],
  },

  // ── Fructanos de cereal ────────────────────────────────────────────────
  {
    id: 'wheat', fam: 'trigo', src: 'biesiekierski2011', sev: 'high', fodmaps: ['fructans'], foodId: 'wheat-bread',
    // OJO: «trigo sarraceno» NO es trigo — es sin gluten y bajo en FODMAP.
    n: { es: 'Trigo', en: 'Wheat', fr: 'Blé', de: 'Weizen', it: 'Frumento', pt: 'Trigo' },
    forms: ['harina de trigo', 'trigo', 'semola de trigo', 'wheat flour', 'wheat', 'wheat semolina',
      'ble', 'farine de ble', 'froment', 'farine de froment', 'weizenmehl', 'weizen',
      'farina di frumento', 'frumento', 'farinha de trigo',
      // En una etiqueta italiana el trigo no es «frumento», es «grano tenero» o
      // «grano duro» —«farina di grano tenero tipo 00» esta en casi todas las
      // harinas—. Sin estas formas, «farina INTEGRALE di grano tenero» no casaba
      // con nada: lo unico que salvaba a «farina di grano tenero» era el nombre
      // italiano de la ficha `wheat-flour`, «Farina di grano», que exige las dos
      // palabras pegadas. Salen seis trozos asi en el banco abierto.
      //
      // Siempre de DOS palabras: «grano» a secas casaria en «grano saraceno»
      // —que es trigo sarraceno y es BAJO— y en «granos de cafe».
      'grano tenero', 'grano duro', 'farina di grano tenero', 'farina di grano duro',
      'farina integrale di grano tenero', 'grano tenero integrale',
      'semola di grano duro', 'semola rimacinata di grano duro',
      // El freekeh es trigo duro cosechado verde y tostado. Devolvia CERO contra
      // las tres superficies del buscador y sale dos veces en el banco abierto,
      // asi que una etiqueta con freekeh no avisaba de trigo. No lleva ficha
      // propia porque no hay ni una medicion suya de fructanos, y una ficha sin
      // cifra no aniade nada a lo que ya dice el trigo; aqui si contesta.
      'freekeh', 'frikeh', 'farik'],
    excludeIf: ['trigo sarraceno', 'buckwheat', 'ble noir', 'sarrasin', 'buchweizen', 'grano saraceno', 'trigo mourisco'],
  },
  {
    id: 'rye', fam: 'trigo', src: 'biesiekierski2011', sev: 'high', fodmaps: ['fructans'], foodId: 'rye-bread',
    n: { es: 'Centeno', en: 'Rye', fr: 'Seigle', de: 'Roggen', it: 'Segale', pt: 'Centeio' },
    forms: ['centeno', 'harina de centeno', 'rye', 'rye flour', 'seigle', 'roggen', 'roggenmehl', 'segale', 'centeio'],
  },
  {
    id: 'barley', fam: 'trigo', src: 'biesiekierski2011', sev: 'high', fodmaps: ['fructans'], foodId: 'barley',
    n: { es: 'Cebada', en: 'Barley', fr: 'Orge', de: 'Gerste', it: 'Orzo', pt: 'Cevada' },
    forms: ['cebada', 'malta de cebada', 'barley', 'barley malt', 'malt extract', 'orge', 'gerste',
      'gerstenmalz', 'malzextrakt', 'orzo', 'malto d orzo', 'cevada'],
  },
  {
    id: 'spelt', fam: 'trigo', src: 'biesiekierski2011', sev: 'watch', fodmaps: ['fructans'],
    n: { es: 'Espelta', en: 'Spelt', fr: 'Épeautre', de: 'Dinkel', it: 'Farro', pt: 'Espelta' },
    forms: ['espelta', 'spelt', 'epeautre', 'dinkel', 'farro', 'kamut'],
  },
  {
    id: 'couscous', fam: 'trigo', src: 'biesiekierski2011', sev: 'high', fodmaps: ['fructans'], foodId: 'couscous',
    n: { es: 'Cuscús', en: 'Couscous', fr: 'Couscous', de: 'Couscous', it: 'Couscous', pt: 'Cuscuz' },
    forms: ['cuscus', 'couscous', 'cuscuz', 'bulgur', 'burghul'],
  },

  // ── Inulina y compañía: el fructano añadido ────────────────────────────
  {
    id: 'inulin', fam: 'inulina', src: 'varney2017', sev: 'high', fodmaps: ['fructans'],
    n: { es: 'Inulina', en: 'Inulin', fr: 'Inuline', de: 'Inulin', it: 'Inulina', pt: 'Inulina' },
    // Y «INSULIN», que no es un descuido de escritura mio sino de un envase de
    // verdad. Sale asi en una etiqueta alemana del banco abierto, entre la
    // fecula y la proteina de girasol: «...3% Schnittlauch, Insulin,
    // Sonnenblumenprotein, Ackerbohnenprotein, Citrusfasern...». En una crema
    // vegetal no hay insulina; hay INULINA de achicoria, que es lo que se usa
    // ahi para dar cuerpo y es alta en fructanos.
    //
    // Es un juicio mio sobre una palabra, y por eso queda escrito: una letra
    // separaba un fructano alto de un «no reconocido».
    forms: ['inulina', 'inulin', 'inuline', 'insulin'],
  },
  {
    id: 'chicory', fam: 'inulina', src: 'varney2017', sev: 'high', fodmaps: ['fructans'],
    n: { es: 'Raíz de achicoria', en: 'Chicory root', fr: 'Racine de chicorée', de: 'Zichorienwurzel', it: 'Radice di cicoria', pt: 'Raiz de chicória' },
    forms: ['raiz de achicoria', 'fibra de achicoria', 'achicoria', 'chicory root', 'chicory root fibre',
      'chicory root fiber', 'chicory', 'racine de chicoree', 'chicoree', 'zichorienwurzel', 'zichorie',
      'radice di cicoria', 'cicoria', 'raiz de chicoria'],
  },
  {
    id: 'fos', fam: 'inulina', src: 'varney2017', sev: 'high', fodmaps: ['fructans'],
    n: { es: 'Fructooligosacáridos (FOS)', en: 'Fructo-oligosaccharides (FOS)', fr: 'Fructo-oligosaccharides (FOS)', de: 'Fructo-Oligosaccharide (FOS)', it: 'Frutto-oligosaccaridi (FOS)', pt: 'Fruto-oligossacáridos (FOS)' },
    forms: ['fructooligosacaridos', 'fructo-oligosacaridos', 'oligofructosa', 'fructooligosaccharides',
      'fructo-oligosaccharides', 'fructo-oligosaccharide', 'oligofructose', 'fruttoligosaccaridi',
      'frutto-oligosaccaridi', 'frutooligossacarideos', 'fruto-oligossacaridos',
      // La SIGLA y el singular italiano. Los dos salieron del banco abierto: un
      // envase italiano que pone «frutto-oligosaccaride» —en singular— pasaba
      // entero, y «FOS» a secas tambien. Es un FODMAP escrito con todas las letras
      // y el lector no lo veia. Una forma de menos de cinco letras casa por PALABRA
      // ENTERA en `apareceEn`, no por subcadena, asi que «fos» no marca «fosfato».
      'fos', 'frutto-oligosaccaride', 'frutto oligosaccaride'],
  },
  {
    // ── EL ANACARDO, Y POR QUE HACE FALTA NOMBRARLO AQUI ────────────────
    //
    // La ficha del catalogo ya existe y ya trae sus datos, pero el lector solo
    // indexa los SEIS NOMBRES de una ficha —no sus alias, que son del buscador—
    // y los seis del anacardo son Anacardos, Cashews, Noix de cajou,
    // Cashewkerne, Anacardi y Cajus. Eso deja dos agujeros medidos:
    //
    //   «maranion» y «nuez de la india»   como se llama en media America. No los
    //                                     reconocia nadie: salian sin reconocer.
    //   «castanha de caju»                que es anacardo en portugues y devolvia
    //                                     CASTANIAS, porque «castanha» casa por
    //                                     subcadena y no habia forma mas larga
    //                                     que compitiera. Los dos son `high`, asi
    //                                     que no cambiaba el semaforo: cambiaba
    //                                     el alimento, su racion y su ficha.
    //
    // Es el mismo arreglo que el de «pescado»→melocoton: no se toca la regla de
    // subcadena, se pone la entrada buena para que gane por longitud.
    id: 'cashews', fam: 'frutoSecoGos', src: 'muir2009', sev: 'high', fodmaps: ['gos', 'fructans'],
    foodId: 'cashews',
    n: { es: 'Anacardos', en: 'Cashews', fr: 'Noix de cajou', de: 'Cashewkerne', it: 'Anacardi', pt: 'Cajus' },
    forms: ['castanha de caju', 'castana de caju', 'nueces de la india', 'nuez de la india',
      'noix de cajou', 'cashewkerne', 'cashewnusse', 'cashew nuts', 'cashews', 'cashew',
      'anacardos', 'anacardo', 'anacardi', 'maranion', 'maranon', 'cajus', 'caju'],
  },
  {
    id: 'gos-added', fam: 'legumbre', src: 'varney2017', sev: 'high', fodmaps: ['gos'],
    n: { es: 'Galactooligosacáridos (GOS)', en: 'Galacto-oligosaccharides (GOS)', fr: 'Galacto-oligosaccharides (GOS)', de: 'Galacto-Oligosaccharide (GOS)', it: 'Galatto-oligosaccaridi (GOS)', pt: 'Galacto-oligossacáridos (GOS)' },
    forms: ['galactooligosacaridos', 'galacto-oligosacaridos', 'galactooligosaccharides',
      'galacto-oligosaccharides', 'galacto-oligosaccharide', 'galattoligosaccaridi',
      'galatto-oligosaccaridi', 'galacto-oligossacaridos', 'gos'],
  },

  // ── Legumbres ──────────────────────────────────────────────────────────
  {
    id: 'chickpea', fam: 'legumbre', src: 'muir2009', sev: 'high', fodmaps: ['gos'], foodId: 'chickpeas-canned',
    n: { es: 'Garbanzo', en: 'Chickpea', fr: 'Pois chiche', de: 'Kichererbse', it: 'Cece', pt: 'Grão-de-bico' },
    forms: ['garbanzo', 'garbanzos', 'harina de garbanzo', 'chickpea', 'chickpeas', 'gram flour',
      'pois chiche', 'kichererbse', 'kichererbsen', 'ceci', 'cece', 'grao de bico'],
  },
  {
    // El guisante no estaba en el diccionario en NINGÚN idioma, y sale en tres
    // etiquetas del banco. `liljebo2020` le mide 1,88 g de GOS.
    id: 'pea', fam: 'legumbre', src: 'liljebo2020', sev: 'high', fodmaps: ['gos', 'fructans'], foodId: 'peas-green',
    n: { es: 'Guisante', en: 'Pea', fr: 'Pois', de: 'Erbse', it: 'Pisello', pt: 'Ervilha' },
    forms: ['guisante', 'guisantes', 'harina de guisante', 'guisantes amarillos', 'guisantes verdes',
      'pea', 'peas', 'pea flour', 'yellow peas', 'green peas', 'split peas',
      'pois', 'petits pois', 'pois cassés', 'farine de pois', 'erbse', 'erbsen', 'erbsenmehl',
      'pisello', 'piselli', 'farina di piselli', 'ervilha', 'ervilhas', 'farinha de ervilha'],
  },
  {
    // Y el AISLADO va aparte, porque no es lo mismo. Aislar la proteína se lleva
    // por delante la mayor parte de los oligosacáridos, así que copiarle aquí
    // los 1,88 g de GOS del guisante entero sería afirmar un número que nadie ha
    // medido en este ingrediente. Se nombra y se deja mirar: la etiqueta no dice
    // cuán aislada está.
    id: 'pea-protein', fam: 'legumbre', src: 'liljebo2020', sev: 'watch', fodmaps: [], foodId: 'peas-green',
    n: { es: 'Proteína de guisante', en: 'Pea protein', fr: 'Protéine de pois', de: 'Erbsenprotein', it: 'Proteine di pisello', pt: 'Proteína de ervilha' },
    forms: ['proteina de guisante', 'aislado de proteina de guisante', 'pea protein',
      'pea protein isolate', 'protéine de pois', 'proteine de pois', 'erbsenprotein',
      'erbsenproteinisolat', 'proteine di pisello', 'proteina de ervilha'],
  },
  {
    id: 'lentil', fam: 'legumbre', src: 'muir2009', sev: 'high', fodmaps: ['gos'], foodId: 'lentils-canned',
    n: { es: 'Lenteja', en: 'Lentil', fr: 'Lentille', de: 'Linse', it: 'Lenticchia', pt: 'Lentilha' },
    forms: ['lenteja', 'lentejas', 'harina de lenteja', 'lentil', 'lentils', 'lentille', 'lentilles',
      'linse', 'linsen', 'lenticchie', 'lenticchia', 'lentilha'],
  },
  {
    id: 'soy', fam: 'legumbre', src: 'muir2009', sev: 'watch', fodmaps: ['gos'],
    n: { es: 'Soja', en: 'Soy', fr: 'Soja', de: 'Soja', it: 'Soia', pt: 'Soja' },
    // La lecitina de soja NO lleva GOS: es grasa, y va aparte como segura.
    // Lo mismo el ACEITE, por el mismo motivo, y la salsa, que va fermentada.
    forms: ['harina de soja', 'proteina de soja', 'soja', 'soy', 'soy flour', 'soy protein', 'soybean',
      'sojabohne', 'sojabohnen', 'sojamehl', 'sojaprotein', 'soia', 'farina di soia',
      'proteina di soia', 'soya flour', 'soya', 'soya protein', 'farine de soja',
      'sojabasis', 'auf sojabasis', 'base de soja', 'a base de soja'],
    excludeIf: ['lecitina de soja', 'soy lecithin', 'lecithine de soja', 'sojalecithin', 'lecitina di soia',
      'salsa de soja', 'soy sauce', 'sauce soja', 'sojasauce', 'salsa di soia',
      'aceite de soja', 'soybean oil', 'soy oil', 'huile de soja', 'sojaol', 'olio di soia', 'oleo de soja'],
  },
  {
    id: 'bean', fam: 'legumbre', src: 'muir2009', sev: 'high', fodmaps: ['gos'], foodId: 'red-kidney-beans',
    // «bean» y «Bohne» sueltos NO están, y es deliberado: los dos casan dentro
    // de cosas que no son legumbre —vanilla bean, cocoa/coffee beans,
    // Kakaobohnen, Kaffeebohnen— y marcar el cacao como alubia es el falso
    // positivo que enseña a no fiarse. En su lugar van las formas concretas.
    // «haricot» y «fagiolo» sí, porque sus únicos vecinos peligrosos —el
    // haricot vert y los fagiolini, que son verdes y bajos— están abajo.
    n: { es: 'Alubia', en: 'Bean', fr: 'Haricot', de: 'Bohne', it: 'Fagiolo', pt: 'Feijão' },
    forms: ['alubia', 'alubias', 'judias blancas', 'frijol', 'frijoles', 'kidney bean', 'black bean',
      'white bean', 'butter bean', 'pinto bean', 'navy bean', 'borlotti', 'cannellini', 'baked beans',
      'haricot', 'haricot blanc', 'haricots rouges', 'kidneybohnen', 'weisse bohnen',
      'schwarze bohnen', 'bohnen', 'fagiolo', 'fagioli', 'feijao'],
    excludeIf: ['judias verdes', 'green bean', 'haricot vert', 'grune bohnen', 'fagiolini', 'feijao verde',
      'kakaobohne', 'kaffeebohne', 'vanillebohne', 'sojabohne'],
  },

  // ── Lactosa ────────────────────────────────────────────────────────────
  {
    id: 'lactose', fam: 'lactosa', src: 'varney2017', sev: 'high', fodmaps: ['lactose'],
    n: { es: 'Lactosa', en: 'Lactose', fr: 'Lactose', de: 'Laktose', it: 'Lattosio', pt: 'Lactose' },
    forms: ['lactosa', 'lactose', 'laktose', 'lattosio'],
    excludeIf: ['sin lactosa', 'lactose free', 'lactose-free', 'sans lactose', 'laktosefrei', 'laktose frei', 'lactose frei',
      'senza lattosio', 'sem lactose', '0% lactosa'],
  },
  {
    // LA LECHE LÍQUIDA, que faltaba entera: solo estaba en polvo. Es el lácteo
    // que más aparece en una etiqueta —yogures, salsas, panes, chocolate— y sin
    // esta entrada un «lait écrémé» o un «Milch» no daban NADA.
    //
    // Las bebidas vegetales llevan «leche» dentro del nombre en los seis
    // idiomas y no llevan lactosa: van todas abajo. El orden por longitud
    // protege además a «leche en polvo», «crema de leche» y «suero de leche»,
    // que son entradas propias y más largas.
    id: 'milk', fam: 'lactosa', src: 'varney2017', sev: 'high', fodmaps: ['lactose'], foodId: 'cow-milk',
    n: { es: 'Leche', en: 'Milk', fr: 'Lait', de: 'Milch', it: 'Latte', pt: 'Leite' },
    forms: ['leche', 'leche entera', 'leche desnatada', 'leche semidesnatada', 'milk', 'whole milk',
      'skimmed milk', 'semi skimmed milk', 'lait', 'lait entier', 'lait ecreme', 'lait demi ecreme',
      'milch', 'vollmilch', 'magermilch', 'buttermilch', 'latte', 'latte intero', 'latte scremato',
      'leite', 'leite gordo', 'leite magro',
      // «MILCHEIWEISS» DEVOLVIA HELADO. El helado aleman se llama «Milcheis» y
      // cabe dentro de «Milcheiweiss», que es la proteina de leche y sale en
      // media etiqueta alemana. Con la forma larga aqui, gana esta. En los
      // otros cinco idiomas ya funcionaba, porque «proteina de leche» lleva
      // «leche» dentro y no hay nada mas largo compitiendo.
      'milcheiweiss', 'milcheiweiß', 'milchprotein'],
    excludeIf: ['sin lactosa', 'lactose free', 'lactose-free', 'sans lactose', 'laktosefrei', 'laktose frei', 'lactose frei',
      'senza lattosio', 'sem lactose',
      'leche de almendras', 'leche de soja', 'leche de avena', 'leche de arroz', 'leche de coco',
      'almond milk', 'soy milk', 'soya milk', 'oat milk', 'rice milk', 'coconut milk',
      'lait d amande', 'lait de soja', 'lait d avoine', 'lait de riz', 'lait de coco',
      'mandelmilch', 'sojamilch', 'hafermilch', 'reismilch', 'kokosmilch',
      'latte di mandorla', 'latte di soia', 'latte di avena', 'latte di riso', 'latte di cocco',
      'leite de amendoa', 'leite de soja', 'leite de aveia', 'leite de arroz', 'leite de coco'],
  },
  {
    // El yogur va en ámbar y no en rojo: la fermentación se come parte de la
    // lactosa y el colado (griego) bastante más. Cuánto queda depende del
    // producto, y eso es exactamente lo que significa «vigilar».
    id: 'yogurt', fam: 'lactosa', src: 'varney2017', sev: 'watch', fodmaps: ['lactose'], foodId: 'yogurt-plain',
    n: { es: 'Yogur', en: 'Yogurt', fr: 'Yaourt', de: 'Joghurt', it: 'Yogurt', pt: 'Iogurte' },
    forms: ['yogur', 'yogurt', 'yoghurt', 'yaourt', 'joghurt', 'jogurt', 'iogurte'],
    excludeIf: ['yogur de soja', 'yogur vegetal', 'yogur sin lactosa', 'soy yogurt', 'coconut yogurt',
      'lactose free yogurt', 'yaourt au soja', 'sojajoghurt', 'kokosjoghurt', 'yogurt di soia',
      'iogurte de soja'],
  },
  {
    id: 'milk-powder', fam: 'lactosa', src: 'varney2017', sev: 'high', fodmaps: ['lactose'], foodId: 'cow-milk',
    n: { es: 'Leche en polvo', en: 'Milk powder', fr: 'Lait en poudre', de: 'Milchpulver', it: 'Latte in polvere', pt: 'Leite em pó' },
    // Las variantes con adjetivo INTERCALADO van escritas una a una: el francés
    // dice «lait écrémé en poudre» y ahí «lait en poudre» ya no cabe. Es el
    // mismo motivo por el que existe la entrada, no un capricho de exhaustividad.
    forms: ['leche en polvo', 'leche desnatada en polvo', 'leche entera en polvo',
      'solidos lacteos', 'milk powder', 'milk solids', 'skimmed milk powder',
      'whole milk powder', 'lait en poudre', 'lait ecreme en poudre', 'lait entier en poudre',
      'milchpulver', 'magermilchpulver', 'vollmilchpulver', 'latte in polvere',
      'latte scremato in polvere', 'leite em po', 'leite magro em po'],
  },
  {
    id: 'whey', fam: 'lactosa', src: 'varney2017', sev: 'watch', fodmaps: ['lactose'],
    n: { es: 'Suero de leche', en: 'Whey', fr: 'Lactosérum', de: 'Molke', it: 'Siero di latte', pt: 'Soro de leite' },
    // Las versiones EN POLVO van explícitas: «suero de leche» y «leche en
    // polvo» miden lo mismo, así que en «suero de leche en polvo» el empate lo
    // resolvía el orden del fichero y ganaba la leche. Una forma más larga es
    // lo único que decide eso sin depender de dónde esté escrita la entrada.
    forms: ['suero de leche', 'suero de leche en polvo', 'suero lacteo', 'whey', 'whey powder',
      'lactoserum', 'lactoserum en poudre', 'petit lait', 'molke', 'molkenpulver',
      'siero di latte', 'siero di latte in polvere', 'siero di latte scremato',
      'soro de leite', 'soro de leite em po'],
    excludeIf: ['aislado de proteina de suero', 'whey protein isolate', 'proteine de lactoserum isolee'],
  },
  {
    // El queso crema no estaba en el diccionario en NINGUN idioma: solo existia
    // como ficha, y una ficha aporta sus seis nombres publicados y nada mas. En
    // una etiqueta britanica el queso crema se llama «full fat soft cheese», y
    // asi sale sin reconocer en el banco abierto.
    //
    // No entra «soft cheese» a secas: eso incluye al brie y al camembert, que
    // estan curados y casi no llevan lactosa, y avisar de lactosa en un brie es
    // gastar la credibilidad del aviso donde no toca.
    id: 'cream-cheese', fam: 'lactosa', src: 'ciqual2020', sev: 'watch', fodmaps: ['lactose'],
    foodId: 'cream-cheese',
    n: { es: 'Queso crema', en: 'Cream cheese', fr: 'Fromage à la crème',
      de: 'Frischkäse', it: 'Formaggio spalmabile', pt: 'Queijo creme' },
    forms: ['queso crema', 'cream cheese', 'full fat soft cheese', 'fullfat soft cheese',
      'fromage a la creme', 'frischkase', 'formaggio spalmabile', 'queijo creme'],
    // Con ajo y finas hierbas ya no es queso crema: es la fila de Ciqual que
    // estuvo a punto de meterle los fructanos del ajo a la ficha.
    excludeIf: ['ail et fines herbes', 'ajo y finas hierbas', 'garlic and herb',
      'garlic & herb'],
  },
  {
    id: 'cream', fam: 'lactosa', src: 'varney2017', sev: 'watch', fodmaps: ['lactose'],
    n: { es: 'Nata', en: 'Cream', fr: 'Crème', de: 'Sahne', it: 'Panna', pt: 'Natas' },
    forms: ['nata', 'nata en polvo', 'crema de leche', 'crema de leche en polvo', 'cream',
      'cream powder', 'creme', 'creme fraiche', 'sahne', 'sahnepulver', 'rahm', 'panna',
      'panna in polvere', 'natas',
      // «Schlagrahm» y «Schlagsahne» son como media etiqueta alemana escribe la
      // nata de montar, y estaba «rahm» a secas, que no casa dentro de una palabra
      // compuesta por debajo del minimo de subcadena. Sale en el banco abierto.
      'schlagrahm', 'schlagsahne', 'creme entiere', 'creme liquide'],
    // «creme» cabe dentro de «écrémé», así que sin esta línea la leche
    // DESNATADA saldría marcada como nata. Es el fallo justo al revés.
    excludeIf: ['ecreme', 'demi ecreme', 'scremato', 'desnatada', 'descremada', 'desnatado'],
  },

  // ── Exceso de fructosa ─────────────────────────────────────────────────
  {
    // FRUCTOSA AÑADIDA A SECAS, que faltaba: estaba el jarabe de
    // glucosa-fructosa pero no la fructosa sola, que es peor —el jarabe al
    // menos trae glucosa, y es la glucosa la que ayuda a absorberla—.
    //
    // El orden por longitud hace el trabajo fino: «oligofructosa» y
    // «jarabe de glucosa-fructosa» son más largas y se prueban antes, así que
    // esta entrada solo salta cuando la etiqueta dice fructosa y nada más.
    id: 'fructose-added', fam: 'fructosa', src: 'varney2017', sev: 'high', fodmaps: ['fructose'],
    n: { es: 'Fructosa', en: 'Fructose', fr: 'Fructose', de: 'Fruktose', it: 'Fruttosio', pt: 'Frutose' },
    forms: ['fructosa', 'jarabe de fructosa', 'fructose', 'fructose syrup', 'sirop de fructose',
      'fruktose', 'fruktosesirup', 'fruttosio', 'sciroppo di fruttosio', 'frutose'],
    excludeIf: ['oligofructosa', 'oligofructose', 'polidextrosa', 'polydextrose'],
  },
  {
    id: 'hfcs', fam: 'fructosa', src: 'varney2017', sev: 'high', fodmaps: ['fructose'],
    n: { es: 'Jarabe de glucosa-fructosa', en: 'High-fructose corn syrup', fr: 'Sirop de glucose-fructose', de: 'Glukose-Fruktose-Sirup', it: 'Sciroppo di glucosio-fruttosio', pt: 'Xarope de glucose-frutose' },
    // «jarabe de glucosa y fructosa» va escrito así en media galleta española y
    // sin esta forma lo capturaba «jarabe de glucosa», que es seguro.
    forms: ['jarabe de glucosa-fructosa', 'jarabe de glucosa y fructosa', 'glucose fructose syrup',
      'jarabe de maiz de alta fructosa', 'high fructose corn syrup',
      'hfcs', 'glucose-fructose syrup', 'sirop de glucose-fructose', 'glukose-fruktose-sirup',
      'sciroppo di glucosio-fruttosio', 'xarope de glucose-frutose', 'isoglucosa', 'isoglucose'],
  },
  {
    id: 'honey', fam: 'fructosa', src: 'varney2017', sev: 'high', fodmaps: ['fructose'], foodId: 'honey',
    n: { es: 'Miel', en: 'Honey', fr: 'Miel', de: 'Honig', it: 'Miele', pt: 'Mel' },
    forms: ['miel', 'honey', 'honig', 'miele', 'mel'],
  },
  {
    id: 'agave', fam: 'fructosa', src: 'varney2017', sev: 'high', fodmaps: ['fructose'], foodId: 'agave-syrup',
    n: { es: 'Sirope de agave', en: 'Agave syrup', fr: 'Sirop d’agave', de: 'Agavendicksaft', it: 'Sciroppo di agave', pt: 'Xarope de agave' },
    forms: ['sirope de agave', 'jarabe de agave', 'agave syrup', 'agave nectar', 'sirop d agave',
      'agavendicksaft', 'sciroppo di agave', 'xarope de agave',
      // A secas. En una lista de ingredientes «agave» no es otra cosa, y asi es
      // como aparece en media etiqueta del banco abierto.
      'agave'],
  },
  {
    id: 'apple-juice', fam: 'fructosa', src: 'varney2017', sev: 'high', fodmaps: ['fructose'],
    n: { es: 'Zumo o concentrado de manzana', en: 'Apple juice or concentrate', fr: 'Jus ou concentré de pomme', de: 'Apfelsaft oder -konzentrat', it: 'Succo o concentrato di mela', pt: 'Sumo ou concentrado de maçã' },
    forms: ['zumo de manzana', 'concentrado de manzana', 'apple juice', 'apple juice concentrate',
      'jus de pomme', 'concentre de pomme', 'apfelsaft', 'apfelsaftkonzentrat',
      'succo di mela', 'concentrato di mela', 'sumo de maca', 'concentrado de maca'],
  },
  {
    id: 'pear-juice', fam: 'fructosa', src: 'varney2017', sev: 'high', fodmaps: ['fructose'],
    n: { es: 'Zumo o concentrado de pera', en: 'Pear juice or concentrate', fr: 'Jus ou concentré de poire', de: 'Birnensaft oder -konzentrat', it: 'Succo o concentrato di pera', pt: 'Sumo ou concentrado de pera' },
    forms: ['zumo de pera', 'concentrado de pera', 'pear juice', 'pear concentrate', 'jus de poire',
      'concentre de poire', 'birnensaft', 'birnendicksaft', 'succo di pera', 'concentrato di pera',
      'sumo de pera'],
  },

  // ── Polioles, por nombre y por número E ────────────────────────────────
  {
    id: 'sorbitol', fam: 'poliol', src: 'varney2017', sev: 'high', fodmaps: ['sorbitol'],
    n: 'Sorbitol (E420)',
    forms: ['sorbitol', 'sorbit', 'e420', 'e 420'],
  },
  {
    id: 'mannitol', fam: 'poliol', src: 'varney2017', sev: 'high', fodmaps: ['mannitol'],
    n: 'Manitol (E421)',
    forms: ['manitol', 'mannitol', 'mannit', 'e421', 'e 421'],
  },
  {
    id: 'maltitol', fam: 'poliol', src: 'varney2017', sev: 'high', fodmaps: ['sorbitol'],
    n: 'Maltitol (E965)',
    forms: ['maltitol', 'jarabe de maltitol', 'maltitol syrup', 'e965', 'e 965'],
  },
  {
    id: 'xylitol', fam: 'poliol', src: 'varney2017', sev: 'high', fodmaps: ['sorbitol'],
    n: 'Xilitol (E967)',
    forms: ['xilitol', 'xylitol', 'xylit', 'e967', 'e 967'],
  },
  {
    id: 'isomalt', fam: 'poliol', src: 'varney2017', sev: 'high', fodmaps: ['sorbitol'],
    n: 'Isomalt (E953)',
    forms: ['isomalt', 'isomaltitol', 'e953', 'e 953'],
  },
  {
    id: 'lactitol', fam: 'poliol', src: 'varney2017', sev: 'high', fodmaps: ['sorbitol'],
    n: 'Lactitol (E966)',
    forms: ['lactitol', 'lactit', 'e966', 'e 966'],
  },
  {
    id: 'erythritol', fam: 'poliol', src: 'varney2017', sev: 'ok', fodmaps: [],
    n: 'Eritritol (E968)',
    forms: ['eritritol', 'erythritol', 'erythrit', 'e968', 'e 968'],
  },
  // EL E964 FALTABA, Y LA APP AFIRMABA QUE NO ERA UN POLIOL. Sin esta entrada,
  // «Edulcorante: E964» casaba con el grupo corriente «Edulcorantes sin poliol»
  // y «E 964» caía en la regla genérica de números E, cuya nota decía «este no
  // es ninguno de ellos». O sea: la app no callaba, negaba. El jarabe de
  // poliglicitol (HSH) es una mezcla de polioles hidrogenados y quien reacciona
  // a ellos se comía el caramelo sin azúcar. Al estar en capa 1 gana al
  // «edulcorante» de capa 3 por el desempate de capa, y `codigoConocido` —que
  // solo se pregunta cuando NADIE casó— no llega a verlo.
  // «hsh» mide tres letras, así que `apareceEn` le exige palabra entera y no
  // puede colarse dentro de otra palabra.
  {
    id: 'polyglycitol', fam: 'poliol', src: 'varney2017', sev: 'high', fodmaps: ['sorbitol'],
    n: 'Jarabe de poliglicitol (E964)',
    forms: ['e964', 'e 964', 'poliglicitol', 'jarabe de poliglicitol', 'polyglycitol',
      'polyglycitol syrup', 'polyglycitolsirup', 'sciroppo di poliglicitolo',
      'sirop de polyglycitol', 'hidrolizado de almidon hidrogenado',
      'hydrogenated starch hydrolysate', 'hsh'],
  },

  // ── Fruta desecada y concentrados ──────────────────────────────────────
  {
    id: 'raisin', fam: 'desecada', src: 'varney2017', sev: 'high', fodmaps: ['fructans'], foodId: 'raisins',
    n: { es: 'Pasas', en: 'Raisins', fr: 'Raisins secs', de: 'Rosinen', it: 'Uvetta', pt: 'Passas' },
    forms: ['pasas', 'uvas pasas', 'raisins', 'sultanas', 'raisins secs', 'rosinen', 'sultaninen',
      'uvetta', 'uva passa', 'passas'],
  },
  {
    // Sin 'fructose': el datil tiene MUCHA fructosa pero tambien tanta glucosa,
    // y el FODMAP es el EXCESO sobre ella. AFCD mide 33,4 contra 32,5 y Frida
    // 27,0 contra 29,6; ninguna de las dos deja exceso. Lo suyo son fructanos.
    id: 'date', fam: 'desecada', src: 'varney2017', sev: 'high', fodmaps: ['fructans'], foodId: 'dates',
    n: { es: 'Dátiles', en: 'Dates', fr: 'Dattes', de: 'Datteln', it: 'Datteri', pt: 'Tâmaras' },
    forms: ['datil', 'datiles', 'pasta de datil', 'dates', 'date paste', 'dattes', 'datteln',
      'datteri', 'tamaras'],
  },
  {
    id: 'dried-apricot', fam: 'desecada', src: 'varney2017', sev: 'high', fodmaps: ['sorbitol'], foodId: 'dried-apricots',
    n: { es: 'Orejones', en: 'Dried apricots', fr: 'Abricots secs', de: 'Getrocknete Aprikosen', it: 'Albicocche secche', pt: 'Alperces secos' },
    forms: ['orejones', 'albaricoques secos', 'dried apricot', 'dried apricots', 'abricots secs',
      'getrocknete aprikosen', 'albicocche secche', 'alperces secos'],
  },

  // ── Los ambiguos: la queja literal de los foros ────────────────────────
  {
    id: 'natural-flavour', fam: 'ambiguo', src: 'whelan2018', sev: 'ambiguous', fodmaps: [],
    n: { es: 'Aroma natural', en: 'Natural flavouring', fr: 'Arôme naturel', de: 'Natürliches Aroma', it: 'Aroma naturale', pt: 'Aroma natural' },
    // «Aroma» A SECAS también entra, y es lo más habitual en una etiqueta
    // española. Es exactamente igual de ambiguo que «aroma natural» —la
    // normativa no obliga a decir qué lleva dentro, y muchas veces lleva ajo o
    // cebolla— así que dejarlo fuera lo convertía en «no reconocido», que es
    // decir menos de lo que se sabe.
    forms: ['aroma', 'aromas', 'aromi', 'aromen', 'aroma natural', 'aromas naturales',
      'natural flavouring',
      'natural flavoring', 'natural flavour', 'natural flavor', 'natural flavours',
      'natural flavors', 'flavouring', 'flavoring', 'arome', 'aromes', 'arome naturel',
      'aroma', 'naturliches aroma', 'aromastoffe', 'aroma naturale', 'aromi naturali',
      'aromatizante'],
  },
  {
    id: 'spices', fam: 'ambiguo', src: 'whelan2018', sev: 'ambiguous', fodmaps: [],
    n: { es: 'Especias', en: 'Spices', fr: 'Épices', de: 'Gewürze', it: 'Spezie', pt: 'Especiarias' },
    forms: ['especias', 'especia', 'mezcla de especias', 'extracto de especias',
      'extractos de especias', 'spices', 'spice', 'spice mix', 'mixed spices', 'spice extract',
      'spice extracts', 'epices', 'melange d epices', 'extrait d epices', 'gewurze',
      'gewurzmischung', 'gewurzextrakt', 'spezie', 'estratto di spezie', 'especiarias'],
  },
  {
    // LA FIBRA SIN NOMBRE. «Fibra vegetal», «fibra alimentaria», «dietary
    // fibre» estaban entre los almidones corrientes, o sea en verde. Pero la
    // fibra que más se añade a un envase es la de raíz de achicoria, que es
    // inulina: el fructano concentrado. Cuando la etiqueta pone el nombre
    // —bambú, cítricos, achicoria— cada una va a lo suyo; cuando no lo pone,
    // se dice que no lo pone, en ámbar, igual que «especias» y «aroma».
    id: 'fibre-unspecified', fam: 'fibraSinDecir', src: 'varney2017', sev: 'ambiguous', fodmaps: [],
    n: { es: 'Fibra vegetal (sin especificar)', en: 'Dietary fibre (unspecified)', fr: 'Fibre alimentaire (non précisée)', de: 'Ballaststoffe (ohne Angabe)', it: 'Fibra alimentare (non specificata)', pt: 'Fibra alimentar (sem especificar)' },
    forms: ['fibra vegetal', 'fibras vegetales', 'fibra alimentaria', 'fibra dietetica', 'fibra soluble',
      'dietary fibre', 'dietary fiber', 'vegetable fibre', 'vegetable fiber', 'plant fibre', 'plant fiber',
      'soluble fibre', 'soluble fiber',
      'fibre vegetale', 'fibres vegetales', 'fibre alimentaire', 'fibres alimentaires', 'fibre soluble',
      'ballaststoffe', 'ballaststoff', 'pflanzenfasern', 'pflanzenfaser', 'pflanzliche fasern', 'losliche ballaststoffe',
      'fibra vegetale', 'fibre vegetali', 'fibra alimentare', 'fibre alimentari', 'fibra solubile',
      'fibras vegetais', 'fibra alimentar', 'fibra soluvel'],
  },
  {
    // LA FRASE LEGAL DE LOS FRUTOS DE CASCARA, que es el hueco mas repetido de
    // todo el banco: nueve apariciones en cinco idiomas, y ninguna se reconocia.
    //
    // El anexo II del reglamento europeo obliga a resaltar el alergeno, y el
    // fabricante cumple escribiendo la CATEGORIA —«frutos de cascara», «frutta a
    // guscio», «Schalenfruchte»— sin decir cual. Es exactamente la situacion de
    // «especias»: la etiqueta declara que hay algo y no dice que.
    //
    // Y aqui la diferencia entre unos y otros es enorme: el anacardo y el
    // pistacho son altos en GOS y fructanos, la almendra y la avellana dependen
    // de la racion, y la nuez y la macadamia son bajas. Contestar «alto» seria
    // inventar y contestar «bajo» seria peor; lo unico cierto es que no se sabe.
    //
    // Va DESPUES de cada fruto seco con nombre: si la etiqueta dice «anacardos»
    // gana la entrada larga y especifica, que trae su racion y su fuente.
    id: 'tree-nuts-unspecified', fam: 'frutoSecoSinDecir', src: 'whelan2018', sev: 'ambiguous', fodmaps: [],
    n: { es: 'Frutos de cáscara sin especificar', en: 'Unspecified tree nuts', fr: 'Fruits à coque non précisés', de: 'Schalenfrüchte ohne Angabe', it: 'Frutta a guscio non specificata', pt: 'Frutos de casca rija não especificados' },
    forms: ['frutos de cascara', 'frutos secos', 'frutos de casca rija', 'otros frutos de cascara',
      'tree nuts', 'mixed nuts', 'nut mix', 'nuts',
      'fruits a coque', 'fruits secs a coque', 'autres fruits a coque',
      'schalenfruchte', 'schalenfruchten',
      'frutta a guscio', 'altra frutta a guscio', 'frutta secca a guscio'],
  },
  {
    // «MELON» A SECAS, que en una foto de plato es lo que contesta el modelo
    // —y contestaba a NADA—. Hay tres fichas de melon y ninguna se llama asi:
    // cantalupo (alto), blanco (moderado) y sandia, que es otra fruta y tambien
    // es alta. Sale del barrido de las 87 fotos: `melon-cantaloupe` y
    // `honeydew-melon` salian los dos como peligrosos con el modelo diciendo
    // exactamente «Melon».
    //
    // Va DESPUES de cada melon con apellido: si la etiqueta dice «melon
    // cantalupo» gana la ficha larga, con su racion y su fuente.
    id: 'melon-unspecified', fam: 'melonSinDecir', src: 'varney2017', sev: 'ambiguous', fodmaps: [],
    n: { es: 'Melón sin especificar', en: 'Unspecified melon', fr: 'Melon non précisé', de: 'Melone ohne Angabe', it: 'Melone non specificato', pt: 'Melão não especificado' },
    forms: ['melon', 'melones', 'melone', 'melao', 'melaos'],
  },
  {
    // «ARANDANO» A SECAS, por lo mismo: el azul y el rojo son dos fichas y
    // ninguna se llama asi. En las 87 fotos, `blueberry` salia peligroso con el
    // modelo diciendo «Arandano».
    //
    // Y «ARANDANO SECO» aparte, que ese SI es una ficha concreta y es ALTA: la
    // deshidratacion concentra el azucar. El modelo dijo «arandano seco» y la
    // app no contestaba nada.
    id: 'blueberry-cranberry-unspecified', fam: 'arandanoSinDecir', src: 'varney2017', sev: 'ambiguous', fodmaps: [],
    //
    // EL NOMBRE LLEVA LA PALABRA ESPANIOLA EN LOS SEIS IDIOMAS, y lo puso un
    // guardian: el nombre que se ensenia tiene que ser una forma que la app
    // busca. Aqui la ambiguedad es del castellano —el ingles separa blueberry
    // de cranberry y el frances myrtille de canneberge—, asi que traducir el
    // nombre lo dejaba invisible en cinco idiomas. Y ademas es lo honesto: lo
    // que se ensenia es la palabra que puso la etiqueta.
    n: { es: 'Arándano sin especificar', en: 'Arándano (unspecified)', fr: 'Arándano (non précisé)', de: 'Arándano (ohne Angabe)', it: 'Arándano (non specificato)', pt: 'Arándano (não especificado)' },
    forms: ['arandano', 'arandanos'],
  },
  {
    // «ARANDANO SECO», que SI es una ficha concreta y es ALTA: la ficha se
    // llama «Arandanos rojos deshidratados» y nadie escribe eso. El modelo dijo
    // «arandano seco» ante la foto y la app no contestaba nada.
    //
    // Los fructanos son los de la ficha, medidos: no se declara una molecula
    // nueva. Va DESPUES del ambiguo de arriba por ser mas larga.
    id: 'dried-cranberry', fam: 'desecada', src: 'varney2017', sev: 'high', fodmaps: ['fructans'],
    foodId: 'dried-cranberries',
    n: { es: 'Arándano rojo seco', en: 'Dried cranberry', fr: 'Canneberge séchée', de: 'Getrocknete Cranberry', it: 'Mirtillo rosso essiccato', pt: 'Arândano seco' },
    forms: ['arandano seco', 'arandanos secos', 'arandano rojo seco', 'dried cranberry',
      'dried cranberries', 'canneberge sechee', 'canneberges sechees', 'getrocknete cranberry',
      'mirtillo rosso essiccato', 'arando seco'],
  },
  {
    // «CREMA BATIDA», que es como se dice «nata montada» en media America. La
    // ficha existe —«Nata para montar»— y su nombre no lo escribe nadie.
    id: 'whipped-cream', fam: 'lactosa', src: 'varney2017', sev: 'watch', fodmaps: ['lactose'],
    foodId: 'whipping-cream',
    n: { es: 'Crema batida', en: 'Whipped cream', fr: 'Crème fouettée', de: 'Schlagsahne', it: 'Panna montata', pt: 'Chantili' },
    forms: ['crema batida', 'nata montada', 'whipped cream', 'creme fouettee', 'schlagsahne',
      'panna montata', 'chantilly', 'chantili'],
  },
  {
    // «GNOCCHI» a secas, que es como se llaman: la ficha es «Noquis de patata».
    id: 'gnocchi', fam: 'trigo', src: 'varney2017', sev: 'watch', fodmaps: ['fructans'],
    foodId: 'potato-gnocchi',
    n: { es: 'Ñoquis', en: 'Gnocchi', fr: 'Gnocchis', de: 'Gnocchi', it: 'Gnocchi', pt: 'Nhoque' },
    forms: ['gnocchi', 'gnocchis', 'noqui', 'noquis', 'nhoque', 'nhoques'],
  },
  {
    // «PLATANO» A SECAS, Y ES EL PEOR DE LOS TRES AMBIGUOS. El poco maduro es
    // BAJO y aguanta 100 g; el maduro es ALTO y se pasa con 35. Y «platano»
    // solo devolvia el POCO MADURO, o sea la app contestando «sin problema, un
    // platano entero» a quien le ensenia un platano cualquiera.
    //
    // No es un caso de laboratorio: es la fruta que mas se come de Europa y la
    // madurez no se escribe en ninguna etiqueta. La respuesta honesta es que
    // depende, y la nota dice de que.
    //
    // Va DESPUES de «platano maduro» y «platano poco maduro», que desde esta
    // misma vuelta si estan en el indice pegados.
    id: 'banana-unspecified', fam: 'platanoSinDecir', src: 'varney2017', sev: 'ambiguous', fodmaps: [],
    n: { es: 'Plátano sin decir la madurez', en: 'Banana, ripeness not stated', fr: 'Banane, maturité non précisée', de: 'Banane, Reife nicht angegeben', it: 'Banana, maturazione non indicata', pt: 'Banana, sem dizer a maturação' },
    forms: ['platano', 'platanos', 'banana', 'bananas', 'banane', 'bananes'],
  },
  {
    // «PIPA» A SECAS, el cuarto ambiguo y el mas claro de los cuatro: las dos
    // fichas que hay —girasol ALTA, calabaza moderada— y NINGUNA es baja, asi
    // que contestar cualquiera de las dos seria elegir por el usuario y
    // contestar nada seria callar un alto. Sale del barrido de las 87 fotos: el
    // modelo dijo «pipa» ante unas pipas de girasol y la app no contestaba.
    //
    // Va DESPUES de «pipa de girasol» y «pipa de calabaza», que son mas largas.
    id: 'seeds-unspecified', fam: 'pipaSinDecir', src: 'varney2017', sev: 'ambiguous', fodmaps: [],
    n: { es: 'Pipa sin especificar', en: 'Pipa (unspecified seed)', fr: 'Pipa (graine non précisée)', de: 'Pipa (Kern ohne Angabe)', it: 'Pipa (seme non specificato)', pt: 'Pipa (semente não especificada)' },
    forms: ['pipa', 'pipas'],
  },
  {
    id: 'seasoning', fam: 'ambiguo', src: 'whelan2018', sev: 'ambiguous', fodmaps: [],
    n: { es: 'Sazonador', en: 'Seasoning', fr: 'Assaisonnement', de: 'Würzmittel', it: 'Condimento', pt: 'Tempero' },
    forms: ['sazonador', 'condimento', 'seasoning', 'assaisonnement', 'wurzmittel', 'wurzung', 'tempero'],
  },
  {
    id: 'yeast-extract', fam: 'ambiguo', src: 'whelan2018', sev: 'watch', fodmaps: [],
    n: { es: 'Extracto de levadura', en: 'Yeast extract', fr: 'Extrait de levure', de: 'Hefeextrakt', it: 'Estratto di lievito', pt: 'Extrato de levedura' },
    forms: ['extracto de levadura', 'yeast extract', 'extrait de levure', 'hefeextrakt',
      'estratto di lievito', 'extrato de levedura'],
  },

  // ── Alimentos que TIENEN ficha y a los que les faltaba la palabra ──────
  //
  // No son datos nuevos: son nombres. La ficha existe, con su racion y su
  // fuente, y la etiqueta la escribe de otra manera, asi que el lector se
  // callaba. Cada uno sale de un trozo REAL del banco abierto, y va con la
  // frase en la que aparecia, porque un alias sin procedencia es una opinion.
  {
    // «Tomatenzubereitung, Zucker, Dextrose, Curry (enthalt Senf), Kochsalz...»
    // La ficha se llama «Curry en polvo» en los seis idiomas y ningun envase
    // escribe «en polvo».
    id: 'curry', fam: 'seguro', src: 'varney2017', sev: 'ok', fodmaps: [], foodId: 'curry-powder',
    n: { es: 'Curry', en: 'Curry', fr: 'Curry', de: 'Curry', it: 'Curry', pt: 'Caril' },
    forms: ['curry', 'currypulver', 'caril'],
  },
  {
    // «85% espelta, linaza, aceite vegetal (nabina)...» La ficha se llama
    // «Semillas de lino» y «linaza» es como lo escribe media America y medio
    // envase espaniol. «Lin» suelto es el frances: «graines de lin» si casaba,
    // «lin» solo no.
    id: 'linseed', fam: 'seguro', src: 'varney2017', sev: 'ok', fodmaps: [], foodId: 'flaxseeds',
    n: { es: 'Linaza', en: 'Linseed', fr: 'Lin', de: 'Leinsamen', it: 'Semi di lino', pt: 'Linhaca' },
    forms: ['linaza', 'lin', 'leinsamen', 'leinsaat', 'linhaca', 'lino'],
  },
  {
    // «Trinkwasser, Senfsaat, Branntweinessig, Salz...» —una mostaza—. La ficha
    // reconocia «Senf» pero no «Senfsaat», que es como se lista el grano.
    id: 'mustard-seed', fam: 'seguro', src: 'varney2017', sev: 'ok', fodmaps: [], foodId: 'mustard',
    n: { es: 'Semilla de mostaza', en: 'Mustard seed', fr: 'Graine de moutarde', de: 'Senfsaat', it: 'Semi di senape', pt: 'Semente de mostarda' },
    forms: ['senfsaat', 'senfkorner', 'semilla de mostaza', 'semillas de mostaza',
      'mustard seed', 'graine de moutarde', 'semi di senape', 'semente de mostarda'],
  },
  {
    // EL ALCOHOL, que sale en la lista de ingredientes de un pan aleman y de una
    // pasta francesa del banco abierto —«Weizenmalzmehl, Alkohol» y «arome
    // naturel (contient alcool)»— y no se reconocia en ninguno de los dos.
    //
    // Es la clase de palabra por la que existe esta seccion: asusta, se cuenta
    // entre lo que «sienta mal», y NO es un FODMAP. Decirlo vale mas que
    // callarlo, porque callado sale como «no reconocido» y eso no es «no pasa
    // nada». La nota deja claro lo otro: que irrita por su cuenta.
    id: 'alcohol', fam: 'alcohol', src: 'varney2017', sev: 'ok', fodmaps: [],
    n: { es: 'Alcohol', en: 'Alcohol', fr: 'Alcool', de: 'Alkohol', it: 'Alcol', pt: 'Álcool' },
    forms: ['alcohol', 'alcool', 'alkohol', 'alcol', 'etanol', 'ethanol', 'ethyl alcohol',
      'alcohol etilico', 'alcool ethylique'],
  },

  // ── Los que dan miedo y NO son FODMAP: la mitad del valor ──────────────
  {
    // EL GLUTEN, que es la confusión número uno de todo el nicho y no estaba.
    //
    // El gluten es una PROTEÍNA y los FODMAP son HIDRATOS: son cosas distintas
    // y la dieta baja en FODMAP no es una dieta sin gluten. Lo que pasa es que
    // el trigo trae las dos, así que quitar trigo quita las dos a la vez y la
    // gente atribuye la mejoría al gluten. Biesiekierski lo midió: al controlar
    // los FODMAP, el gluten dejaba de producir síntomas.
    //
    // Importa para leer etiquetas porque el «gluten de trigo» que añaden a un
    // pan es proteína aislada y NO arrastra fructanos, así que va delante de
    // «trigo» por longitud y sale en verde. Es de las pocas veces que esta app
    // puede devolver un alimento a la mesa en lugar de quitarlo.
    id: 'gluten', fam: 'seguro', src: 'biesiekierski2011', sev: 'ok', fodmaps: [],
    n: { es: 'Gluten', en: 'Gluten', fr: 'Gluten', de: 'Gluten', it: 'Glutine', pt: 'Glúten' },
    forms: ['gluten', 'gluten de trigo', 'gluten vital', 'gluten de trigo vital',
      'wheat gluten', 'vital wheat gluten', 'gluten de ble', 'weizengluten', 'weizenkleber',
      'glutine', 'glutine di frumento'],
  },
  {
    // «SIN LACTOSA» COMO HALLAZGO PROPIO, y no solo como negación de otro.
    //
    // El excludeIf de la leche ya impedía la falsa alarma, pero el resultado
    // era que «leche semidesnatada sin lactosa» salía como NO RECONOCIDO, que
    // es lo peor de los dos mundos: la app sabía perfectamente que ese producto
    // está bien y respondía que no lo conocía. Ahora lo dice en voz alta, que
    // es justo lo que alguien busca al girar el envase.
    //
    // Va DELANTE de la leche por longitud, así que no hay pelea entre las dos.
    id: 'lactose-free', fam: 'seguro', src: 'varney2017', sev: 'ok', fodmaps: [],
    foodId: 'lactose-free-milk',
    n: { es: 'Sin lactosa', en: 'Lactose-free', fr: 'Sans lactose', de: 'Laktosefrei', it: 'Senza lattosio', pt: 'Sem lactose' },
    forms: ['sin lactosa', '0% lactosa', 'deslactosada', 'lactose free', 'lactose-free',
      'sans lactose', 'delactose', 'laktosefrei', 'laktose frei', 'lactose frei', 'ohne laktose', 'senza lattosio',
      'delattosato', 'sem lactose'],
  },
  {
    // Los quesos curados pierden casi toda la lactosa en la maduración, y sin
    // embargo son de lo que más se retira «por si acaso». Decirlo con nombre
    // propio devuelve comida a la mesa, que es la mitad del valor de esta app.
    id: 'hard-cheese', fam: 'seguro', src: 'varney2017', sev: 'ok', fodmaps: [], foodId: 'parmesan',
    n: { es: 'Queso curado', en: 'Hard cheese', fr: 'Fromage affiné', de: 'Hartkäse', it: 'Formaggio stagionato', pt: 'Queijo curado' },
    forms: ['queso curado', 'queso parmesano', 'parmesano', 'queso manchego', 'manchego',
      'queso cheddar', 'cheddar', 'hard cheese', 'mature cheese', 'aged cheese',
      'parmesan', 'fromage affine', 'comte', 'gruyere', 'emmental', 'hartkase',
      'bergkase', 'formaggio stagionato', 'pecorino', 'grana padano', 'parmigiano',
      'queijo curado',
      // «...viande de poulet, carottes, FROMAGE a pate dure, jus de citron...»,
      // del banco abierto: es como la norma francesa nombra al queso curado
      // cuando no dice cual, y no casaba con ninguna de las de arriba.
      'fromage a pate dure', 'queso de pasta dura', 'formaggio a pasta dura',
      'queijo de pasta dura'],
  },
  {
    id: 'soy-lecithin', fam: 'seguro', src: 'varney2017', sev: 'ok', fodmaps: [],
    n: { es: 'Lecitina de soja', en: 'Soy lecithin', fr: 'Lécithine de soja', de: 'Sojalecithin', it: 'Lecitina di soia', pt: 'Lecitina de soja' },
    forms: ['lecitina de soja', 'soy lecithin', 'soya lecithin', 'lecithine de soja', 'sojalecithin',
      'lecitina di soia', 'e322'],
  },
  // ── LOS DOS QUE TAPAN UN FALSO AMIGO ─────────────────────────────
  //
  // No estaban en el diccionario y llegaban por el catálogo, en singular. En
  // plural —que es como se escriben en una etiqueta— no casaba el alimento
  // bueno y se los quedaba una forma corta de otro idioma: «pommes de terre»
  // salía como MANZANA y «pescado» como MELOCOTÓN, los dos altos. Con «pomme» y
  // «pesca» exigiendo ahora palabra entera (`SOLO_PALABRA_ENTERA` en
  // label-scan.ts), el falso amigo ya no salta; estas dos entradas son la otra
  // mitad, la que hace que salte el alimento CORRECTO en su sitio.
  //
  // Van al diccionario y no a `aliases.ts` porque el lector NO lee los alias:
  // el buscador tiene tres superficies y el lector solo dos.
  {
    id: 'potato', fam: 'seguro', src: 'varney2017', sev: 'ok', fodmaps: [], foodId: 'potato',
    n: { es: 'Patata', en: 'Potato', fr: 'Pomme de terre', de: 'Kartoffel', it: 'Patata', pt: 'Batata' },
    // El almidón de patata va nombrado entero y va PRIMERO por longitud: es de
    // los ingredientes más frecuentes que hay en un envase.
    forms: ['fecule de pommes de terre', 'fecule de pomme de terre', 'almidon de patata',
      'kartoffelstarke', 'amido di patate', 'amido de batata', 'potato starch',
      'pommes de terre', 'pomme de terre', 'kartoffeln', 'kartoffel', 'patatas', 'patata',
      'potatoes', 'potato', 'batatas', 'batata', 'papas', 'papa'],
  },
  {
    id: 'fish', fam: 'seguro', src: 'varney2017', sev: 'ok', fodmaps: [], foodId: 'white-fish',
    n: { es: 'Pescado', en: 'Fish', fr: 'Poisson', de: 'Fisch', it: 'Pesce', pt: 'Peixe' },
    forms: ['pescado blanco', 'pescados', 'pescado', 'poissons', 'poisson',
      'peixes', 'peixe', 'fisch', 'fische', 'pesce', 'pesci', 'fish'],
  },
  {
    id: 'buckwheat', fam: 'seguro', src: 'muir2009', sev: 'ok', fodmaps: [], foodId: 'buckwheat',
    n: { es: 'Trigo sarraceno', en: 'Buckwheat', fr: 'Sarrasin', de: 'Buchweizen', it: 'Grano saraceno', pt: 'Trigo-sarraceno' },
    // La HARINA va nombrada entera, y no es adorno: el catalogo tiene un
    // alimento «harina de trigo», y «farinha de trigo» (16 letras) le gana por
    // longitud a «trigo sarraceno» (15), se come el sarraceno y deja una harina
    // de trigo donde no la hay. Pasa igual en italiano —«farina di grano» contra
    // «grano saraceno»— y en frances —«farine de ble» contra «ble noir»—.
    forms: ['harina de trigo sarraceno', 'farinha de trigo sarraceno',
      'farina di grano saraceno', 'trigo sarraceno', 'alforfon', 'buckwheat',
      'buckwheat flour', 'farine de sarrasin', 'sarrasin', 'ble noir',
      'farine de ble noir', 'buchweizenmehl', 'buchweizen', 'grano saraceno', 'saraceno',
      'trigo mourisco', 'farinha de trigo mourisco'],
  },
  {
    id: 'glucose-syrup', fam: 'seguro', src: 'varney2017', sev: 'ok', fodmaps: [],
    n: { es: 'Jarabe de glucosa', en: 'Glucose syrup', fr: 'Sirop de glucose', de: 'Glukosesirup', it: 'Sciroppo di glucosio', pt: 'Xarope de glucose' },
    // Glucosa sola no es exceso de fructosa: el problema es el «glucosa-fructosa».
    forms: ['jarabe de glucosa', 'glucose syrup', 'dextrosa', 'dextrose', 'sirop de glucose',
      'glukosesirup', 'sciroppo di glucosio', 'xarope de glucose'],
    excludeIf: ['glucosa-fructosa', 'glucose-fructose', 'glukose-fruktose', 'glucosio-fruttosio'],
  },
  {
    id: 'sucrose', fam: 'seguro', src: 'varney2017', sev: 'ok', fodmaps: [], foodId: 'table-sugar',
    n: { es: 'Azúcar (sacarosa)', en: 'Sugar (sucrose)', fr: 'Sucre (saccharose)', de: 'Zucker (Saccharose)', it: 'Zucchero (saccarosio)', pt: 'Açúcar (sacarose)' },
    // `sucre` y `zucchero` FALTABAN, y son el azúcar a secas en francés y en
    // italiano. Estaban los nombres químicos —saccharose, saccarosio— y se
    // había quedado fuera el corriente, que es el que sale en la etiqueta.
    // Y EL AZÚCAR DE REMOLACHA, que es azúcar y nada más: la refinación no deja
    // ni fructanos ni nada de la raíz. Sin la forma larga, «azúcar de remolacha»
    // casaba también la ficha «Remolacha» —ALTA— por la capa de fichas, y desde
    // que el trozo devuelve a todos los que aportan, esa remolacha ya no la tapa
    // nadie: la etiqueta contestaba «Remolacha, alta en fructanos» sobre una
    // cucharada de azúcar. Al ser la forma más larga casa antes y enmascara.
    forms: ['azucar', 'sacarosa', 'sucrose', 'sugar', 'saccharose', 'zucker', 'saccarosio',
      'acucar', 'sucre', 'zucchero',
      'azucar de remolacha', 'zucchero di barbabietola', 'sucre de betterave',
      'rubenzucker', 'beet sugar', 'acucar de beterraba'],
  },
  {
    // ── EL HUEVO EN SINGULAR ───────────────────────────────────────────────
    //
    // La ficha del catálogo está en plural en los seis idiomas —«Huevos, Eggs,
    // Œufs, Eier, Uova, Ovos»— así que los plurales se reconocían y los
    // singulares no: `egg`, `oeuf`, `ei`, `uovo` y `ovo` no daban nada. Es
    // alérgeno de declaración obligatoria y sale en singular constantemente.
    //
    // Va también «huevo entero» y sus cinco hermanos: es la forma en que
    // aparece en media mayonesa y media galleta, y hasta esta noche devolvía
    // FOIE GRAS.
    id: 'egg', fam: 'seguro', src: 'muir2009', sev: 'ok', fodmaps: [], foodId: 'eggs',
    // EN ALEMAN SE DECLARA EL PLURAL, y no es un descuido: «Ei» son dos letras
    // y el indice no admite formas tan cortas —casarian dentro de media
    // etiqueta—. Hay un guardian que exige que cada nombre declarado se pueda
    // encontrar, y con «Ei» no se puede cumplir. «Eier» es ademas lo que pone
    // en un envase aleman.
    n: { es: 'Huevo', en: 'Egg', fr: 'Œuf', de: 'Eier', it: 'Uovo', pt: 'Ovo' },
    forms: ['huevo entero', 'whole egg', 'oeuf entier', 'ganzes ei', 'uovo intero',
      'ovo inteiro', 'huevo en polvo', 'egg powder', 'ovoproducto', 'ovoprodutos',
      'huevos', 'huevo', 'eggs', 'egg', 'oeufs', 'oeuf', 'uova', 'uovo', 'ovos', 'ovo', 'eier'],
  },
  {
    // ── LA VAINILLA, QUE NO ESTABA EN NINGÚN IDIOMA ────────────────────────
    //
    // Las fichas existen con apellido —«Extracto de vainilla», «Vainilla en
    // rama»— y el nombre solo no llegaba: `vainilla`, `vanilla`, `vanille`,
    // `vaniglia` y `baunilha` no daban nada, ni tampoco `vainillina`, que es lo
    // que pone en la mayoría de los envases industriales.
    id: 'vanilla', fam: 'seguro', src: 'muir2009', sev: 'ok', fodmaps: [], foodId: 'vanilla-extract',
    n: { es: 'Vainilla', en: 'Vanilla', fr: 'Vanille', de: 'Vanille', it: 'Vaniglia', pt: 'Baunilha' },
    forms: ['aroma de vainilla', 'aroma natural de vainilla', 'vanilla flavouring',
      'arome de vanille', 'vanillearoma', 'aroma di vaniglia', 'aroma de baunilha',
      'vainillina', 'vanillina', 'vanilline', 'vanillin', 'vainilla', 'vanilla',
      'vaniglia', 'baunilha', 'vanille'],
  },
  {
    id: 'rice-flour', fam: 'seguro', src: 'muir2009', sev: 'ok', fodmaps: [], foodId: 'white-rice',
    n: { es: 'Harina de arroz', en: 'Rice flour', fr: 'Farine de riz', de: 'Reismehl', it: 'Farina di riso', pt: 'Farinha de arroz' },
    // AQUÍ ESTABAN «arroz» Y «rice» A SECAS, y esta entrada se llama HARINA de
    // arroz. O sea que quien fotografiaba un plato de arroz —o leía una etiqueta
    // que ponía «arroz»— veía «Harina de arroz» en la pantalla del resultado. El
    // alimento que sale detrás es el correcto, `white-rice`, pero el nombre que
    // se lee no lo es, y el nombre es lo que la persona compara con lo que tiene
    // delante. Se van a la entrada de al lado, que es la del arroz.
    forms: ['harina de arroz', 'rice flour', 'farine de riz', 'reismehl',
      'farina di riso', 'farinha de arroz'],
  },
  {
    // ── EL ARROZ, QUE NO ESTABA ────────────────────────────────────────────
    //
    // Y no estaba de dos maneras. Una: «arroz» y «rice» vivían dentro de la
    // entrada de la harina, así que se reconocían con el nombre equivocado.
    //
    // Y dos, que es peor: **`riso`, `riz` y `reis` no se reconocían en
    // absoluto**. La ficha del catálogo se llama «Arroz blanco / White rice /
    // Riz blanc / Weißer Reis / Riso bianco», siempre con el apellido, y el
    // diccionario sólo traía las harinas. O sea que el grano más común que hay
    // no se leía en tres de los seis idiomas que publica esta app.
    //
    // Los tres cortos —`riz`, `riso`, `reis`— casan sólo como palabra entera por
    // longitud, que es justo lo que hace falta: `reis` dentro de un compuesto
    // alemán no es arroz.
    // ── EL CHOCOLATE, QUE LA APP LEÍA COMO SEPIA ───────────────────────────
    //
    // Medido, y es de lo peor que se ha encontrado en el lector:
    //
    //   «chocolate»               → SEPIA, «sin problema conocido»
    //   «chocolat»                → SEPIA
    //   «cobertura de chocolate»  → SEPIA
    //   «schokolade»              → CHAYOTE
    //   «cioccolato»              → nada
    //
    // «Choco» es sepia en español, mide cinco letras y por tanto casa DENTRO de
    // otra palabra: «chocolate» la contiene. Y la sepia es baja y sin ningún
    // FODMAP, mientras que el chocolate con leche y el blanco son ALTOS por
    // lactosa. O sea que una de las palabras más frecuentes que hay en una
    // etiqueta salía como un pescado que no lleva nada: un alto convertido en
    // bajo, que es el error que hace daño.
    //
    // Sólo acertaba con el nombre entero —«chocolate con leche» sí—, y eso deja
    // fuera «chocolate» a secas y la cobertura, que están en medio supermercado.
    //
    // NO LLEVA `foodId` A PROPÓSITO. «Chocolate» a secas no es un alimento del
    // catálogo: puede ser negro, con leche o blanco, y son tres fichas con tres
    // veredictos. Lo honesto es avisar de la lactosa y decir que se mire cuál
    // es, no elegir una por la persona. Si la etiqueta dice cuál, gana la forma
    // larga y sale la ficha exacta con su ración.
    id: 'chocolate', fam: 'chocolate', src: 'varney2017', sev: 'watch', fodmaps: ['lactose'],
    n: { es: 'Chocolate', en: 'Chocolate', fr: 'Chocolat', de: 'Schokolade', it: 'Cioccolato', pt: 'Chocolate' },
    forms: ['cobertura de chocolate', 'chocolate de cobertura', 'chocolate coating',
      'pepitas de chocolate', 'gotas de chocolate', 'chocolate chips', 'pepite di cioccolato',
      'pepites de chocolat', 'schokoladenstuckchen', 'pedacos de chocolate',
      'cioccolato', 'schokolade', 'chocolate', 'chocolat'],
  },
  {
    // El cacao puro no es chocolate y no lleva lactosa. Salía como CAZÓN.
    id: 'cocoa', fam: 'seguro', src: 'varney2017', sev: 'ok', fodmaps: [], foodId: 'cocoa-powder',
    n: { es: 'Cacao', en: 'Cocoa', fr: 'Cacao', de: 'Kakao', it: 'Cacao', pt: 'Cacau' },
    forms: ['cacao en polvo', 'cacao desgrasado', 'cocoa powder', 'cacao maigre', 'kakaopulver',
      'cacao magro', 'cacau em po', 'cacao', 'cocoa', 'kakao', 'cacau'],
  },
  {
    // El coco seco FRANCES solo se sostenia con la forma suelta «seche» —el
    // parentesis de «Noix de coco rapee (seche)»— y esa forma casaba por
    // subcadena dentro de «DESECHE el liquido»: un bote de alcachofas
    // contestaba coco rallado (visto en la app, 30-ago). La forma corta se
    // filtro con los demas calificativos de estado, y el frances entra por
    // aqui con sus nombres enteros, que no caben dentro de ninguna otra
    // palabra.
    id: 'coconut-dried-fr', fam: 'seguro', src: 'varney2017', sev: 'ok', fodmaps: ['sorbitol'],
    foodId: 'coconut-dried',
    // El nombre va en frances EN TODOS los idiomas a proposito: esta entrada
    // existe solo para las formas francesas (las demas lenguas ya entran por
    // la ficha), y la guardia de ingredient-forms exige que cada nombre
    // declarado sea alcanzable por las formas de SU entrada.
    n: 'Noix de coco séchée',
    forms: ['noix de coco sechee', 'coco sechee', 'coco seche', 'coco rape'],
  },
  {
    // El higo es ALTO en fructosa y no se reconocia en ningun idioma: la ficha
    // se llama «Higo fresco» y la palabra sola no llegaba. De los huecos de esta
    // noche es el unico que escondia un alto, que es la direccion que hace danio.
    // «Higos secos» son otra ficha y mas larga: sigue ganando.
    // LA MOLECULA ES FRUCTANOS Y NO FRUCTOSA, y lo dijo un guardian: la
    // fructosa del higo mide 0,0667 g —por debajo del corte— y su «alto» viene
    // de los fructanos, que la propia ficha declara sin medir. Declarar la
    // molecula equivocada aqui saldria impresa en la pantalla como si estuviera
    // medida.
    id: 'fig', fam: 'inulina', src: 'muir2009', sev: 'high', fodmaps: ['fructans'],
    foodId: 'fig-fresh',
    n: { es: 'Higo', en: 'Fig', fr: 'Figue', de: 'Feige', it: 'Fico', pt: 'Figo' },
    forms: ['higos', 'higo', 'figues', 'figue', 'feigen', 'feige', 'fichi', 'fico',
      'figos', 'figo', 'figs', 'fig'],
  },
  {
    // ── EL PIMIENTO DE COLOR ───────────────────────────────────────────────
    //
    // No se reconocia en cinco de los seis idiomas: `pimiento`, `poivron`,
    // `peperone`, `pimento` y `bell pepper`, todos en blanco. Solo funcionaban
    // `paprika` y los nombres con color entero.
    //
    // NO LLEVA `foodId`, y es el mismo trato que el chocolate: a secas puede ser
    // el rojo, que es moderado por fructosa, o el verde, que es bajo. Elegir uno
    // por la persona seria inventar; avisar de la fructosa y decir que mire el
    // color, no. Con el color escrito gana la forma larga y sale la ficha
    // exacta con su racion.
    //
    // «peperoni» EN ITALIANO ES EL PLURAL de peperone, pero en ingles es un
    // embutido y hay ficha de pizza de pepperoni. Se deja fuera: el plural
    // italiano no vale una confusion con una carne curada.
    // «pepper» y «red pepper» tampoco entran, por lo mismo que en la pimienta.
    id: 'bell-pepper', fam: 'pimientoColor', src: 'muir2009', sev: 'watch', fodmaps: ['fructose'],
    n: { es: 'Pimiento', en: 'Bell pepper', fr: 'Poivron', de: 'Paprikaschote', it: 'Peperone', pt: 'Pimento' },
    forms: ['paprikaschote', 'bell pepper', 'sweet pepper', 'pimientos', 'pimiento',
      'poivrons', 'poivron', 'peperone', 'pimentos', 'pimento'],
  },
  {
    // ── LOS FRUTOS SECOS EN SINGULAR ───────────────────────────────────────
    //
    // Mismo fallo que el huevo, y el catalogo lo tiene en todos: las fichas
    // estan en plural —«Almendras, Mandeln, Mandorle»— y `singularizar` solo
    // sabe recortar la `s` final. El aleman pluraliza en `-n`, el italiano en
    // `-e` y el espaniol hace «nueces»→«nuez», asi que `mandel`, `mandorla`,
    // `walnuss`, `noce`, `haselnuss`, `nocciola`, `pistazie`, `erdnuss`,
    // `arachide` y `amendoim` no se reconocian. Ni `nuez`, en espaniol.
    //
    // SE MIDIO SI VALIA LA PENA ARREGLAR `singularizar` con reglas de plural
    // aleman e italiano, Y NO: aplicadas al catalogo fabricaban 545 formas
    // inventadas —«fraisa», «appla», «pomma», «limo», «datta»— porque las
    // reglas no distinguen un plural de un nombre que ya es singular. Meter esa
    // basura en el indice es exactamente como se fabrican los falsos amigos que
    // llevamos toda la noche quitando.
    //
    // El cacahuete es ademas alergeno de declaracion obligatoria.
    id: 'almond', fam: 'seguro', src: 'muir2009', sev: 'ok', fodmaps: [], foodId: 'almonds',
    n: { es: 'Almendra', en: 'Almond', fr: 'Amande', de: 'Mandel', it: 'Mandorla', pt: 'Amêndoa' },
    forms: ['almendra', 'almond', 'amande', 'mandel', 'mandeln', 'mandorla', 'mandorle', 'amendoa'],
  },
  {
    id: 'walnut', fam: 'seguro', src: 'muir2009', sev: 'ok', fodmaps: [], foodId: 'walnuts',
    n: { es: 'Nuez', en: 'Walnut', fr: 'Noix', de: 'Walnuss', it: 'Noce', pt: 'Noz' },
    // «noce» y «nuez» a secas son la nuez, pero «noce moscata», «nuez moscada»
    // y «noix de muscade» son el macis y ya estan: ganan por longitud. Igual con
    // el coco de aqui abajo.
    forms: ['walnuss', 'walnusse', 'walnuts', 'walnut', 'nueces', 'noci', 'nuez', 'noce', 'noix', 'noz', 'nozes'],
    // «NOIX DE COCO» NO ES UNA NUEZ, es un coco, y devolvia NUECES porque
    // «noix» es la nuez francesa y el coco no tiene forma propia que compita.
    //
    // Se niega en vez de aniadir una entrada de coco, y eso lo decidio un
    // guardian: con «coco» a secas indexado, la etiqueta real del muesli de
    // Hacendado —«coco ralado seco», que la OCR lee «coco talado»— dejaba de
    // casar con la ficha del coco seco y casaba con la generica, y el banco de
    // fotos reales lo cantaba. Tenia razon: preferir la ficha concreta a la
    // generica es lo correcto, y una entrada generica de coco la tapaba.
    //
    // Asi que aqui solo se quita la respuesta EQUIVOCADA. «noix de coco» pasa a
    // no reconocerse, que es peor que acertar y mucho mejor que decir nuez —y
    // la pantalla ya avisa de que no reconocido no es seguro.
    excludeIf: ['noix de coco', 'noce di cocco', 'noix de cajou'],
  },
  {
    id: 'hazelnut', fam: 'seguro', src: 'muir2009', sev: 'ok', fodmaps: [], foodId: 'hazelnuts',
    n: { es: 'Avellana', en: 'Hazelnut', fr: 'Noisette', de: 'Haselnuss', it: 'Nocciola', pt: 'Avelã' },
    forms: ['haselnusse', 'haselnuss', 'hazelnuts', 'hazelnut', 'nocciole', 'nocciola', 'avellana', 'noisette', 'avela'],
  },
  {
    id: 'pistachio', fam: 'legumbre', src: 'muir2009', sev: 'high', fodmaps: ['gos', 'fructans'],
    foodId: 'pistachios',
    n: { es: 'Pistacho', en: 'Pistachio', fr: 'Pistache', de: 'Pistazie', it: 'Pistacchio', pt: 'Pistácio' },
    forms: ['pistachios', 'pistachio', 'pistazien', 'pistazie', 'pistacchio', 'pistacho', 'pistache', 'pistacio'],
  },
  {
    id: 'peanut', fam: 'seguro', src: 'muir2009', sev: 'ok', fodmaps: [], foodId: 'peanuts',
    n: { es: 'Cacahuete', en: 'Peanut', fr: 'Arachide', de: 'Erdnuss', it: 'Arachide', pt: 'Amendoim' },
    forms: ['erdnusse', 'erdnuss', 'arachidi', 'arachide', 'arachides', 'amendoim', 'amendoins',
      'cacahuete', 'cacahuate', 'peanut'],
  },
  {

    // ── CUATRO PALABRAS QUE SALEN EN CASI TODOS LOS ENVASES ────────────────
    //
    // Ninguna se reconocia en NINGUNO de los seis idiomas. Salieron probando a
    // mano las palabras corrientes de una etiqueta contra el lector, que es la
    // unica forma que ha funcionado de encontrar estas cosas.
    id: 'black-pepper', fam: 'seguro', src: 'muir2009', sev: 'ok', fodmaps: [], foodId: 'black-pepper',
    n: { es: 'Pimienta', en: 'Black pepper', fr: 'Poivre', de: 'Pfeffer', it: 'Pepe', pt: 'Pimenta' },
    // «pepper» A SECAS NO ENTRA, y es la unica de las seis que se deja fuera: en
    // ingles significa las dos cosas —la pimienta y el pimiento— y son un bajo y
    // un moderado. En los otros cinco idiomas la palabra distingue: pimienta y
    // pimiento, poivre y poivron, pfeffer y paprika, pepe y peperone, pimenta y
    // pimento.
    forms: ['pimienta negra', 'black pepper', 'poivre noir', 'schwarzer pfeffer',
      'pepe nero', 'pimenta preta', 'pimienta', 'poivre', 'pfeffer', 'pimenta', 'pepe'],
  },
  {
    // La levadura de panaderia es baja. El EXTRACTO de levadura no lo es y ya
    // tiene su entrada, mas larga, que gana por longitud.
    id: 'yeast', fam: 'seguro', src: 'muir2009', sev: 'ok', fodmaps: [], foodId: 'bakers-yeast',
    n: { es: 'Levadura', en: 'Yeast', fr: 'Levure', de: 'Hefe', it: 'Lievito', pt: 'Levedura' },
    forms: ['levadura de panaderia', 'bakers yeast', 'levure de boulanger', 'backhefe',
      'lievito di birra', 'fermento de padeiro', 'levadura', 'levedura', 'levure',
      'lievito', 'yeast', 'hefe'],
  },
  {
    // La pectina es fibra soluble y no es un FODMAP. Esta en cualquier
    // mermelada, yogur y gominola, y no se reconocia en ningun idioma.
    id: 'pectin', fam: 'seguro', src: 'varney2017', sev: 'ok', fodmaps: [],
    n: { es: 'Pectina', en: 'Pectin', fr: 'Pectine', de: 'Pektin', it: 'Pectina', pt: 'Pectina' },
    forms: ['pectina de manzana', 'pectina de fruta', 'apple pectin', 'fruit pectin',
      'pectine de fruits', 'fruchtpektin', 'pectina', 'pectine', 'pektin', 'pectin'],
  },
  {
    // La lecitina, de soja o de girasol, es grasa: no lleva GOS ni nada. Ya
    // habia entrada para «lecitina de soja» pero no para la palabra sola, que
    // es como aparece en medio chocolate y media galleta.
    //
    // SIN `foodId`: la ficha que hay es la de soja, y llamar «lecitina de soja»
    // a una de girasol seria decirle a alguien que come soja sin comerla.
    id: 'lecithin', fam: 'seguro', src: 'varney2017', sev: 'ok', fodmaps: [],
    n: { es: 'Lecitina', en: 'Lecithin', fr: 'Lécithine', de: 'Lecithin', it: 'Lecitina', pt: 'Lecitina' },
    forms: ['lecitina de girasol', 'sunflower lecithin', 'lecithine de tournesol',
      'sonnenblumenlecithin', 'lecitina di girasole', 'e322', 'lecitinas',
      'lecitina', 'lecithine', 'lecithin', 'lecitine'],
  },
  {
    // Y la seta que el falso amigo tapaba. La ficha se llama «Seta shiitake
    // (fresca)» y el nombre solo no llegaba: el shiitake es ALTO en manitol y
    // no se reconocia, mientras que «fromage frais» si — como shiitake.
    id: 'shiitake', fam: 'poliol', src: 'muir2009', sev: 'high', fodmaps: ['mannitol'],
    foodId: 'mushroom-shiitake',
    n: { es: 'Shiitake', en: 'Shiitake', fr: 'Shiitaké', de: 'Shiitake', it: 'Shiitake', pt: 'Shiitake' },
    forms: ['seta shiitake', 'champignon shiitake', 'fungo shiitake', 'shiitake pilz',
      'cogumelo shiitake', 'shiitake mushroom', 'shiitake'],
  },
  {
    id: 'rice', fam: 'seguro', src: 'muir2009', sev: 'ok', fodmaps: [], foodId: 'white-rice',
    n: { es: 'Arroz', en: 'Rice', fr: 'Riz', de: 'Reis', it: 'Riso', pt: 'Arroz' },
    forms: ['arroz blanco', 'arroz branco', 'white rice', 'riz blanc', 'riso bianco',
      'weisser reis', 'arroz', 'rice', 'riso', 'reis', 'riz'],
  },
  {
    // Levistico y macis. Los dos son especia, y los dos salieron del banco.
    id: 'lovage', fam: 'ambiguo', src: 'whelan2018', sev: 'ambiguous', fodmaps: [],
    n: { es: 'Levístico (apio de monte)', en: 'Lovage', fr: 'Livèche', de: 'Liebstöckel', it: 'Levistico', pt: 'Aipo-bravo' },
    // Es una Apiaceae, la familia del apio, y el apio lleva manitol medido. No
    // hay ninguna fuente que mida el levístico, así que no se cierra ni se
    // afirma: se dice que está y que no se sabe.
    forms: ['levistico', 'apio de monte', 'lovage', 'liveche', 'liebstockel', 'aipo bravo'],
  },
  {
    id: 'mace', fam: 'seguro', src: 'whelan2018', sev: 'ok', fodmaps: [], foodId: 'cinnamon',
    n: { es: 'Macis', en: 'Mace', fr: 'Macis', de: 'Muskatblüte', it: 'Macis', pt: 'Macis' },
    // La cáscara de la nuez moscada. Especia en polvo y en cantidad de especia:
    // la ración es de un gramo y ninguna de las seis llega al corte ahí.
    forms: ['macis', 'mace', 'muskatblute', 'nuez moscada', 'nutmeg', 'muscade', 'muskatnuss',
      'noce moscata', 'noz moscada'],
  },
  {
    // Formas de alimentos que YA estan en el catalogo y a las que les faltaba el
    // nombre con el que la etiqueta las escribe. Cada una hereda la severidad de
    // SU alimento —por `foodId`— y no una puesta a ojo.
    id: 'chia', fam: 'seguro', src: 'muir2009', sev: 'ok', fodmaps: [], foodId: 'chia-seeds',
    n: { es: 'Chía', en: 'Chia', fr: 'Chia', de: 'Chia', it: 'Chia', pt: 'Chia' },
    // «Salvia hispanica» es el nombre botanico y sale tres veces en el banco: el
    // envase lo pone porque la norma lo permite, y la ficha se llama «Semillas
    // de chia», que no casa con ninguna de las dos.
    forms: ['chia', 'semillas de chia', 'chia seeds', 'salvia hispanica', 'graines de chia',
      'chiasamen', 'semi di chia', 'sementes de chia'],
  },
  {
    id: 'dried-currant', fam: 'fructosa', src: 'liljebo2020', sev: 'watch', fodmaps: ['fructans'], foodId: 'dried-currants',
    n: { es: 'Pasas de Corinto', en: 'Currants (dried)', fr: 'Raisins de Corinthe', de: 'Korinthen', it: 'Uva di Corinto', pt: 'Passas de Corinto' },
    // «Currants» en una lista de ingredientes es la pasa de Corinto, no la
    // grosella: la grosella lleva su color delante —«blackcurrant»,
    // «redcurrant»— y por eso esas van en excludeIf.
    forms: ['currants', 'pasas de corinto', 'raisins de corinthe', 'korinthen',
      'uva di corinto', 'passas de corinto'],
    excludeIf: ['blackcurrant', 'redcurrant', 'black currant', 'red currant', 'grosella',
      'cassis', 'schwarze johannisbeere', 'ribes'],
  },
  {
    id: 'faba-bean', fam: 'legumbre', src: 'liljebo2020', sev: 'high', fodmaps: ['gos'], foodId: 'broad-beans',
    n: { es: 'Haba', en: 'Faba bean', fr: 'Fève', de: 'Ackerbohne', it: 'Fava', pt: 'Fava' },
    forms: ['faba bean', 'faba bean preparation', 'fava bean', 'broad bean', 'haba', 'habas',
      'farine de feve', 'ackerbohne', 'fava', 'favas', 'feve'],
  },
  {
    id: 'fig-paste', fam: 'fructosa', src: 'liljebo2020', sev: 'watch', fodmaps: [], foodId: 'dried-figs',
    n: { es: 'Pasta de higo', en: 'Fig paste', fr: 'Pâte de figues', de: 'Feigenpaste', it: 'Pasta di fichi', pt: 'Pasta de figo' },
    forms: ['pasta de higo', 'fig paste', 'pate de figues', 'feigenpaste', 'pasta di fichi', 'pasta de figo'],
  },
  {
    // EL APIO ES ALERGENO OBLIGATORIO EN LA UE, asi que sale en etiquetas a
    // todas horas y casi siempre a secas: «celeri», «Sellerie», «sedano». La
    // ficha del catalogo se llama «Celeri branche» y «Stangensellerie», que no
    // casan con ninguna de las dos. Y el apio lleva manitol medido, con racion
    // de 13 g: no reconocerlo era callar un FODMAP en una palabra que la propia
    // norma obliga a destacar.
    id: 'celery-any', fam: 'poliol', src: 'liljebo2020', sev: 'watch', fodmaps: ['mannitol'], foodId: 'celery',
    n: { es: 'Apio', en: 'Celery', fr: 'Céleri', de: 'Sellerie', it: 'Sedano', pt: 'Aipo' },
    forms: ['apio', 'celeri', 'celery', 'sellerie', 'sedano', 'aipo', 'celeri branche',
      'stangensellerie', 'celeriac', 'celeri rave', 'knollensellerie', 'sedano rapa'],
    // «apio de monte» es el levistico, otra planta, y tiene su propia entrada.
    excludeIf: ['apio de monte', 'lovage', 'liveche', 'liebstockel', 'sal de apio', 'celery salt'],
  },
  {
    id: 'sesame-any', fam: 'seguro', src: 'liljebo2020', sev: 'ok', fodmaps: [], foodId: 'sesame-seeds',
    n: { es: 'Sésamo', en: 'Sesame', fr: 'Sésame', de: 'Sesam', it: 'Sesamo', pt: 'Sésamo' },
    // Otro alergeno obligatorio, y otra ficha con nombre largo: «Sesamsamen».
    forms: ['sesamo', 'sesame', 'sesam', 'sesame seed', 'sesame seeds', 'graines de sesame',
      'sesamsamen', 'semi di sesamo', 'gergelim', 'sesame seed paste', 'tahini', 'tahina'],
  },
  {
    id: 'poppy-any', fam: 'seguro', src: 'liljebo2020', sev: 'ok', fodmaps: [], foodId: 'poppy-seeds',
    n: { es: 'Amapola', en: 'Poppy seed', fr: 'Pavot', de: 'Mohn', it: 'Papavero', pt: 'Papoila' },
    forms: ['semillas de amapola', 'poppy seed', 'poppy seeds', 'graines de pavot', 'pavot',
      'mohnsamen', 'mohn', 'semi di papavero', 'sementes de papoila', 'amapola', 'papavero', 'papoila'],
  },
  {
    id: 'sourdough', fam: 'trigo', src: 'liljebo2020', sev: 'watch', fodmaps: ['fructans'], foodId: 'sourdough-wheat-bread',
    n: { es: 'Masa madre', en: 'Sourdough', fr: 'Levain', de: 'Sauerteig', it: 'Lievito madre', pt: 'Massa mãe' },
    // La fermentacion larga se come parte de los fructanos —por eso el pan de
    // masa madre tiene 100 g de racion frente a los 24 del de trigo— pero no
    // todos: sigue siendo trigo salvo que la etiqueta diga otro cereal.
    forms: ['masa madre', 'sourdough', 'levain', 'sauerteig', 'lievito madre', 'massa mae',
      'pasta madre'],
    excludeIf: ['sin gluten', 'gluten free', 'sans gluten', 'glutenfrei', 'senza glutine',
      'de arroz', 'rice', 'sarraceno', 'buckwheat'],
  },
  {
    id: 'maize', fam: 'seguro', src: 'muir2009', sev: 'ok', fodmaps: [], foodId: 'polenta',
    n: { es: 'Maíz', en: 'Maize', fr: 'Maïs', de: 'Mais', it: 'Mais', pt: 'Milho' },
    // «mais» es además «pero» en francés y «más» en portugués. Se acepta: exige
    // palabra completa y en una lista de ingredientes acotada no aparece
    // suelto; a cambio cubre maïs, Maisgrieß, semola di mais y compañía.
    forms: ['harina de maiz', 'almidon de maiz', 'maicena', 'corn starch', 'cornstarch', 'maize',
      'maiz', 'amidon de mais', 'mais', 'maisstarke', 'amido di mais', 'milho', 'amido de milho',
      // «corn» y «cornflour» a secas: la entrada tenia «corn starch» y «maize»
      // pero no la palabra sola, que es como sale en media etiqueta inglesa.
      'corn', 'cornflour', 'corn flour', 'modified cornflour', 'corn fibre', 'corn fiber'],
    excludeIf: ['jarabe de maiz de alta fructosa', 'high fructose corn syrup'],
  },
  {
    id: 'oat', fam: 'trigo', src: 'muir2009', sev: 'watch', fodmaps: ['fructans'], foodId: 'oats',
    n: { es: 'Avena', en: 'Oats', fr: 'Avoine', de: 'Hafer', it: 'Avena', pt: 'Aveia' },
    forms: ['avena', 'copos de avena', 'harina de avena', 'salvado de avena', 'oats', 'oat',
      'oat flour', 'oat flakes', 'rolled oats', 'wholegrain oat', 'porridge oats',
      'avoine', 'flocons d avoine', 'hafer', 'haferflocken', 'aveia', 'flocos de aveia'],
  },
];

export const INGREDIENTES: Ingrediente[] = COMPACTO.map(expandir);

// AQUÍ VIVÍA `ingredienteById`, y se borró. Era un Índice por id «para enlazar un
// hallazgo con su ficha de alimento» que no leía nadie: `LabelFinding` ya lleva
// la entrada entera en `.ingrediente`. Y no era peso muerto gratis: el `Map` se
// construía AL EVALUAR EL MÓDULO, recorriendo las 101 entradas, dentro de las
// 146 KB de datos que el lector arrastra. Si alguien lo quiere de vuelta, que
// sea porque hay un llamador, no porque el índice suene útil.
