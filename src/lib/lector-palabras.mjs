/**
 * LAS PALABRAS QUE EL LECTOR DE LA WEB RODEA, en los seis idiomas.
 *
 * Es la versión de la web del lector de etiquetas: quien pega una lista de
 * ingredientes ve rodeadas las palabras que son un FODMAP por sí mismas, en
 * cualquiera de los seis idiomas, y con eso ya ha visto la app funcionar
 * antes de instalarla. Solo palabras DEFINICIONALES: la cebolla es un
 * fructano diga lo que diga el resto de la lista. Lo ambiguo —«aromas»,
 * «especias», «suero»— no se rodea ni se da por limpio: la web no afirma que
 * una lista esté limpia, solo enseña lo que ve. Pesar raciones y tolerancias
 * es de la app.
 *
 * Aceite de cebolla y de ajo quedan fuera a propósito: los fructanos no pasan
 * al aceite. Almidón, proteína y gluten de trigo también: son fracciones sin
 * los fructanos del grano. En los idiomas donde el modificador va delante
 * («almidón de trigo», «huile d'ail») se excluye con lookbehind, y como los
 * seis diccionarios corren a la vez sobre el mismo texto, una palabra que es
 * la misma en dos idiomas («trigo») lleva las exclusiones de los dos.
 *
 * Es .mjs y no .ts porque las pruebas lo importan tal cual (tests/lector.test.mjs)
 * y porque aquí no hay tipos que valgan más que las pruebas.
 *
 * Los patrones van sin \b: en JavaScript \b es ASCII y partiría «cebolla»
 * de «cebollas» pero no «ail» de «détail». `compila()` los envuelve en
 * lookarounds de letra Unicode con las banderas «giu».
 */

/** @typedef {'fructans' | 'gos' | 'lactose' | 'fructose' | 'polyols'} Familia */

const L = '[\\p{L}]';
const P = (familia, ...res) => res.map((re) => ({ familia, re }));

export const PATRONES = [
  // ---- fructanos: cebolla, ajo, puerro, chalota, inulina y el trigo y sus primos
  ...P('fructans',
    // en
    'onions?(?! oil)', 'garlic(?! oil| infused)', 'leeks?', 'shallots?',
    'inulin', 'chicory root', 'oligofructose', 'fructo-?oligosaccharides?', 'jerusalem artichokes?',
    '(wheat|rye|barley|spelt) (flour|semolina|bran|malt|meal|flakes)', 'barley malt',
    'whole ?grain wheat', 'whole ?wheat', 'wheat(?! (starch|protein|gluten))',
    // es
    '(?<!aceite de )cebollas?', '(?<!aceite de )ajos?', 'puerros?', 'chalotas?',
    'inulina', 'ra[ií]z de achicoria', 'oligofructosa', 'fructooligosac[áa]ridos?', 'aguaturma',
    '(harina|s[ée]mola|salvado|malta|copos) de (trigo|centeno|cebada|espelta)',
    '(?<!almid[óo]n de )(?<!prote[íi]na de )(?<!gluten de )(?<!amido de )(?<!gl[úu]ten de )trigo', 'centeno', 'cebada', 'espelta',
    // fr
    "(?<!huile d')(?<!huile d’)oignons?", "(?<!huile d')(?<!huile d’)ail", 'poireaux?', '[ée]chalotes?',
    'inuline', 'racine de chicor[ée]e', 'topinambours?',
    '(farine|semoule|son|malt|flocons) de (bl[ée]|seigle|orge|[ée]peautre)',
    '(?<!amidon de )(?<!gluten de )(?<!prot[ée]ine de )bl[ée]', 'seigle', 'orge', '[ée]peautre',
    // de: compuestos. «Zwiebelpulver», «Knoblauchgranulat», «Weizenmehl» son
    // una palabra; se admite lo que siga, salvo el aceite y las fracciones.
    `zwiebel(?!öl)${L}*`, `knoblauch(?!öl)${L}*`, 'lauch', 'porree', 'schalotten?',
    'zichorienwurzel', 'fructooligosaccharide', 'topinambur',
    `(vollkorn)?weizen(?!stärke|protein|gluten|eiweiß)${L}*`, `roggen${L}*`, `gerste(?:n${L}*)?`, `dinkel${L}*`,
    // it
    "(?<!olio all')(?<!olio all’)cipoll[ae]", "(?<!olio all')(?<!olio all’)aglio", 'porr[oi]', 'scalogn[oi]',
    'radice di cicoria', 'oligofruttosio', 'frutto-?oligosaccaridi',
    '(farina|semola|crusca|malto|fiocchi) di (frumento|grano|segale|orzo|farro)',
    '(?<!amido di )(?<!glutine di )frumento', 'grano tenero', 'segale', 'orzo', 'farro',
    // pt
    '(?<![óo]leo de )cebolas?', '(?<![óo]leo de )alho', 'alho[- ](porro|franc[êe]s)',
    'raiz de chic[óo]ria', 'oligofrutose', 'fruto-?oligossacar[íi]deos?',
    '(farinha|s[êe]mola|farelo|malte|flocos) de (trigo|centeio|cevada|espelta)',
    'centeio', 'cevada',
  ),
  // ---- GOS: legumbres y sus harinas
  ...P('gos',
    '(soya?|chick ?pea|gram|lentil|lupin|bean|pea) flour', 'chick ?peas?', 'lentils?', '(black|kidney|baked|soya?|butter) beans?',
    'harina de (garbanzo|lenteja|guisante|altramuz|soja)', 'garbanzos?', 'lentejas?', 'alubias?', 'jud[íi]as?( blancas?| rojas?| pintas?| verdes?)?',
    'farine de (pois chiches?|lentilles?|pois|lupin|soja)', 'pois chiches?', 'lentilles?', 'haricots?( rouges?| blancs?| secs?)?',
    '(kichererbsen|linsen|lupinen|bohnen|erbsen|soja)mehl', 'kichererbsen', 'linsen', 'bohnen',
    'farina di (ceci|lenticchie|piselli|lupini|soia)', 'ceci', 'lenticchie', 'fagioli',
    'farinha de (gr[ãa]o[- ]de[- ]bico|lentilha|ervilha|tremo[çc]o|soja)', 'gr[ãa]o[- ]de[- ]bico', 'lentilhas?', 'feij[ãa]o',
  ),
  // ---- lactosa: la palabra y los sólidos de leche
  ...P('lactose',
    'lactose', '(skimmed |whole |dried )?milk powder', 'milk solids', 'whey powder', 'condensed (skimmed |whole )?milk',
    'lactosa', 'leche (en polvo|condensada)', 'suero (de leche )?en polvo', 's[óo]lidos (de )?l[áa]cteos',
    'lait (en poudre|concentr[ée])', 'lactos[ée]rum en poudre', 'poudre de lait',
    'laktose', '(mager|voll)?milchpulver', 'kondensmilch', 'molkenpulver',
    'lattosio', 'latte (in polvere|condensato)', 'siero di latte in polvere',
    'leite (em p[óo]|condensado)', 'soro de leite em p[óo]',
  ),
  // ---- fructosa en exceso: los jarabes, la miel y los concentrados de manzana y pera
  ...P('fructose',
    'high fructose', '(glucose-fructose|fructose-glucose|fructose) syrup', 'honey', 'agave', '(apple|pear) (juice )?(concentrate|pur[ée]e)',
    'jarabe de ma[íi]z (de )?alto (contenido )?(en|de) fructosa', 'jarabe de (glucosa-fructosa|fructosa-glucosa|fructosa)', 'miel', '[áa]gave', '(concentrado|pur[ée]) de (manzana|pera)',
    'sirop de (glucose-fructose|fructose-glucose|fructose)', 'sirop de ma[ïi]s [àa] haute teneur en fructose', '(concentr[ée]|pur[ée]e) de (jus de )?(pomme|poire)',
    '(fructose-glucose|glukose-fruktose|glucose-fructose|fruktose|fructose)-?sirup', 'honig', '(apfel|birnen)(saft)?konzentrat',
    'sciroppo di (glucosio-fruttosio|fruttosio-glucosio|fruttosio)', 'miele', '(concentrato|purea) di (mela|pera)',
    'xarope de (glicose-frutose|frutose-glicose|frutose)', 'xarope de milho (rico|alto) em frutose', 'mel', '(concentrado|pur[ée]) de (ma[çc][ãa]|pera)',
  ),
  // ---- polioles: por nombre y por número E, en todos los idiomas a la vez
  ...P('polyols',
    'sorbitol[oe]?', 'sorbit', 'e ?420', 'mannitol[oe]?', 'mannit', 'manitol', 'e ?421', 'maltitol[oe]?', 'maltit', 'e ?965',
    'xylitol[oe]?', 'xylit', 'xilitol[oe]?', 'e ?967', 'isomalt[oe]?', 'e ?953', 'lactitol[oe]?', 'lactit', 'e ?966',
  ),
];

/** Los patrones compilados, con los lookarounds de letra. */
export function compila() {
  return PATRONES.map((p) => ({ familia: p.familia, re: new RegExp(`(?<!${L})(?:${p.re})(?!${L})`, 'giu') }));
}

/**
 * Los tramos encontrados en un texto, sin solapar: el más largo manda
 * («harina de trigo» antes que «trigo»). Es la misma lógica que corre en el
 * navegador (LectorWeb.astro); las pruebas la ejercen desde aquí.
 */
export function lee(texto, reglas = compila()) {
  const t = String(texto).replace(/\s+/g, ' ').trim();
  const tramos = [];
  for (const r of reglas) {
    r.re.lastIndex = 0;
    let m;
    while ((m = r.re.exec(t))) {
      tramos.push({ a: m.index, b: m.index + m[0].length, familia: r.familia, palabra: m[0] });
      if (!m[0].length) r.re.lastIndex += 1;
    }
  }
  tramos.sort((x, y) => x.a - y.a || (y.b - y.a) - (x.b - x.a));
  const limpios = [];
  for (const tr of tramos) {
    const ultimo = limpios[limpios.length - 1];
    if (!ultimo || tr.a >= ultimo.b) limpios.push(tr);
  }
  return limpios;
}
