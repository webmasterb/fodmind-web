/**
 * EL MOTOR DEL LECTOR, COPIADO DE LA APP. No reescrito: copiado.
 *
 *   node scripts/sincronizar-motor.mjs            copia y deja el manifiesto
 *   node scripts/sincronizar-motor.mjs --comprobar   solo dice si hay deriva
 *
 * Julen quiere que el escáner de la web sea un clon del de la app: quien se
 * suscriba tiene que encontrar lo mismo que vio aquí. La única forma de que
 * dos lectores digan lo mismo de la misma etiqueta es que sean el mismo
 * código, así que esto trae de C:\app_appstore_fodmaps los ficheros del
 * analizador (label-scan.ts y lo que importa) TAL CUAL a src/motor/, con un
 * alias `@` que apunta aquí para que sus imports no cambien de una letra.
 *
 * Lo único que se transforma es el catálogo de alimentos, que en la app pesa
 * 2,4 MB de TypeScript porque lleva notas en seis idiomas, citas y el texto de
 * verificación de cada cifra. El analizador lee de cada alimento el id, la
 * categoría, el nivel, los FODMAP, las dos raciones, los nombres y los GRADOS
 * de verificación (level-model.ts: `verificacion.racion.grado` y
 * `verificacion.fodmaps.grado`); el resto es prosa que aquí no lee nadie. Se
 * conservan esos campos y nada más, y un test lo comprueba contra el original.
 *
 * Los textos del lector (las tres cifras, «no dice si es apto…») salen del
 * i18n de la app por lista de claves, para que la web diga lo mismo con las
 * mismas palabras en los seis idiomas.
 *
 * El manifiesto guarda el hash de cada fichero de origen y el commit de la
 * app: cuando la app cambie el motor, `--comprobar` (que corre en los tests
 * si el repo de la app está en esta máquina) avisa de que hay que volver a
 * sincronizar. En Coolify el repo de la app no existe y la comprobación se
 * salta: lo que se despliega es lo que está en git.
 */
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildSync } from 'esbuild';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
export const APP = process.env.FODMIND_APP || 'C:/app_appstore_fodmaps';
const DESTINO = join(RAIZ, 'src', 'motor');
const MANIFIESTO = join(DESTINO, 'manifiesto.json');

/** Lo que se copia tal cual, con su ruta dentro de src/ de la app. */
export const FICHEROS = [
  'lib/label-scan.ts',
  'lib/label-crop.ts',
  'lib/level-model.ts',
  'lib/food-search.ts',
  'lib/indice-busqueda.ts',
  'lib/label-personal.ts',
  'lib/tolerance-model.ts',
  'lib/barcode.ts',
  'data/types.ts',
  'data/ingredients.ts',
  'data/common-ingredients.ts',
  'data/platos-fuera-del-indice.ts',
  'data/aliases.ts',
  'data/challenges.ts',
];

/** Los campos del alimento que el motor lee; todo lo demás se queda en la app. */
export const CAMPOS_ALIMENTO = ['id', 'category', 'level', 'fodmaps', 'safeServingG', 'typicalServingG', 'servingUnit', 'names', 'racionGradoC'];

/** Las claves del i18n de la app que el lector de la web pinta. */
export const CLAVES_I18N = [
  'labelTitle', 'labelIntro', 'labelPlaceholder', 'labelAnalyze',
  'labelHighs', 'labelWatch', 'labelFine', 'labelUnknown', 'labelUnknownWarn', 'labelQuickUnknown',
  'labelQuickToggle', 'labelSeeDetail', 'labelNoVerdict', 'labelPortionTag', 'labelFromCatalog',
  'labelBarcodeHint', 'labelBarcodeSearching', 'labelBarcodeFound', 'labelBarcodeOtherLang', 'labelBarcodeSource',
  'labelBarcodeNotFoundNoReader', 'labelBarcodeNoIngredientsNoReader', 'labelBarcodeNoNetNoReader', 'labelBarcodeServerDownNoReader',
  'labelCameraHintBarcode',
];

const sha = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16);

/** Bundle en memoria de un fichero TS de la app, para leer sus datos desde Node. */
function importaDeLaApp(rutaTs) {
  const tmp = join(RAIZ, 'node_modules', '.motor-tmp');
  mkdirSync(tmp, { recursive: true });
  const salida = join(tmp, `${sha(rutaTs)}.mjs`);
  buildSync({
    entryPoints: [join(APP, 'src', rutaTs)], bundle: true, format: 'esm', platform: 'node', outfile: salida,
    alias: { '@': join(APP, 'src') }, logLevel: 'silent',
  });
  return import(`${pathToFileURL(salida).href}?${Date.now()}`);
}

function recortaAlimento(f) {
  const min = {};
  for (const c of CAMPOS_ALIMENTO) if (f[c] !== undefined) min[c] = f[c];
  // De la verificación, solo los grados: es lo que decide si una cifra está
  // medida. La prosa de la regla y la fuente se quedan en la app.
  if (f.verificacion) {
    min.verificacion = {
      fodmaps: { grado: f.verificacion.fodmaps?.grado },
      racion: { grado: f.verificacion.racion?.grado },
    };
  }
  return min;
}

export async function catalogoRecortado() {
  const m = await importaDeLaApp('data/foods/index.ts');
  return m.allFoods.map(recortaAlimento);
}

export async function textosDelLector() {
  const m = await importaDeLaApp('i18n/strings.ts');
  const out = {};
  for (const k of CLAVES_I18N) {
    if (!m.strings[k]) throw new Error(`la app ya no tiene la clave de i18n «${k}»`);
    out[k] = m.strings[k];
  }
  return out;
}

export function manifiestoActual() {
  return existsSync(MANIFIESTO) ? JSON.parse(readFileSync(MANIFIESTO, 'utf8')) : null;
}

export function hashesDeLaApp() {
  const h = {};
  for (const f of FICHEROS) h[f] = sha(readFileSync(join(APP, 'src', f), 'utf8'));
  // El catálogo y el i18n se resumen por sus ficheros fuente, no por la salida.
  for (const f of ['data/foods', 'i18n']) {
    const lista = execSync(`git -C "${APP}" ls-files src/${f}`, { encoding: 'utf8' }).trim().split(/\r?\n/);
    h[f] = sha(lista.map((x) => sha(readFileSync(join(APP, x), 'utf8'))).join('\n'));
  }
  return h;
}

async function sincroniza() {
  rmSync(DESTINO, { recursive: true, force: true });
  for (const f of FICHEROS) {
    const destino = join(DESTINO, f);
    mkdirSync(dirname(destino), { recursive: true });
    writeFileSync(destino, readFileSync(join(APP, 'src', f)));
  }
  const alimentos = await catalogoRecortado();
  mkdirSync(join(DESTINO, 'data', 'foods'), { recursive: true });
  writeFileSync(join(DESTINO, 'data', 'foods', 'index.ts'),
    '// GENERADO por scripts/sincronizar-motor.mjs: el catálogo de la app con solo\n'
    + '// los campos que el analizador lee. No se edita a mano; se vuelve a sincronizar.\n'
    + "import { Food } from '../types';\n\n"
    + `export const allFoods: Food[] = ${JSON.stringify(alimentos)} as unknown as Food[];\n\n`
    + 'export const foodById = new Map(allFoods.map((f) => [f.id, f]));\n');
  const textos = await textosDelLector();
  writeFileSync(join(DESTINO, 'textos.json'), `${JSON.stringify(textos, null, 2)}\n`);
  const commit = execSync(`git -C "${APP}" rev-parse --short HEAD`, { encoding: 'utf8' }).trim();
  writeFileSync(MANIFIESTO, `${JSON.stringify({ app: commit, fecha: new Date().toISOString().slice(0, 10), hashes: hashesDeLaApp() }, null, 2)}\n`);
  console.log(`motor sincronizado desde la app en ${commit}: ${FICHEROS.length} ficheros, ${alimentos.length} alimentos, ${Object.keys(textos).length} textos`);
}

/** null si está al día; la lista de lo que cambió si hay deriva. */
export function deriva() {
  if (!existsSync(APP)) return null;
  const m = manifiestoActual();
  if (!m) return ['sin manifiesto'];
  const ahora = hashesDeLaApp();
  return Object.keys(ahora).filter((k) => ahora[k] !== m.hashes[k]);
}

const esPrincipal = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (esPrincipal) {
  if (process.argv.includes('--comprobar')) {
    const d = deriva();
    if (!d) console.log('el repo de la app no está en esta máquina: nada que comprobar');
    else if (d.length) { console.log(`DERIVA: ${d.join(', ')} cambiaron en la app; node scripts/sincronizar-motor.mjs`); process.exit(1); }
    else console.log('motor al día con la app');
  } else {
    await sincroniza();
  }
}
