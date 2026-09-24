/**
 * LOS CONTADORES DE LA WEB: cuántos ven cada tipo de página, cuántos llegan a
 * cada botón y cuántos lo pulsan, por idioma y por día.
 *
 *   node scripts/eventos.mjs                 # los últimos 14 días
 *   node scripts/eventos.mjs 2026-09-21      # desde ese día
 *   node scripts/eventos.mjs 2026-09-21 2026-10-05
 *
 * Los cuenta la Cloud Function `webEvento` del proyecto de la app y los sirve
 * `webInforme` con clave (backend/functions/web-eventos.js en el repo de la
 * app). La clave vive fuera del repo, en CLAVE. Lo que decide es la última
 * columna: clics por cada mil vistas de esa página, por botón. Las descargas
 * las dicen las tiendas por campaña (`ct=web-<botón>`), no esto.
 */
import { readFileSync } from 'node:fs';

const CLAVE = 'C:/Users/bank0/fodmind-web-informe-clave.txt';
const URL_INFORME = 'https://europe-west1-fodmap-guide-app.cloudfunctions.net/webInforme';

const hoy = new Date().toISOString().slice(0, 10);
const hace14 = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);
const desde = process.argv[2] ?? hace14;
const hasta = process.argv[3] ?? hoy;

let clave;
try {
  clave = readFileSync(CLAVE, 'utf8').trim();
} catch {
  console.error(`No está la clave en ${CLAVE}. Sin ella la función contesta 403.`);
  process.exit(1);
}

const r = await fetch(`${URL_INFORME}?desde=${desde}&hasta=${hasta}`, { headers: { 'x-clave': clave } });
if (!r.ok) {
  console.error(`webInforme contestó ${r.status}`);
  process.exit(1);
}
const { dias } = await r.json();

// Suma de todos los días: { idioma: { pagina: { tipo: { boton: n } } } }
const total = {};
for (const dia of Object.values(dias)) {
  for (const [l, paginas] of Object.entries(dia)) {
    for (const [pg, tipos] of Object.entries(paginas)) {
      for (const [t, botones] of Object.entries(tipos)) {
        for (const [ct, n] of Object.entries(botones)) {
          total[l] ??= {};
          total[l][pg] ??= {};
          total[l][pg][t] ??= {};
          total[l][pg][t][ct] = (total[l][pg][t][ct] ?? 0) + n;
        }
      }
    }
  }
}

const porMil = (n, base) => (base ? ((1000 * n) / base).toFixed(1) : '—');
console.log(`Del ${desde} al ${hasta} · ${Object.keys(dias).length} días con datos\n`);
for (const l of Object.keys(total).sort()) {
  for (const pg of Object.keys(total[l]).sort()) {
    const vistas = total[l][pg].vista?.['-'] ?? 0;
    console.log(`${l} · ${pg}: ${vistas} vistas`);
    const botones = new Set([...Object.keys(total[l][pg].visto ?? {}), ...Object.keys(total[l][pg].clic ?? {})]);
    const filas = [...botones].sort().map((ct) => {
      const visto = total[l][pg].visto?.[ct] ?? 0;
      const clic = total[l][pg].clic?.[ct] ?? 0;
      return { botón: ct, 'llegan (‰)': porMil(visto, vistas), clics: clic, 'clics ‰ vistas': porMil(clic, vistas) };
    });
    if (filas.length) console.table(filas);
  }
}

// LA PRUEBA DE LA TIRA DEL ESCÁNER (desde el 25-sep-2026): cinco animaciones,
// una por visitante, sumadas en todos los idiomas y páginas. Como cada letra
// se reparte al azar, «vistos» dice a cuántos les tocó y la última columna
// decide: clics por cada cien que la vieron. Lectura prevista el 2-oct-2026.
const tira = {};
for (const paginas of Object.values(total)) {
  for (const tipos of Object.values(paginas)) {
    for (const [t, botones] of Object.entries(tipos)) {
      for (const [ct, n] of Object.entries(botones)) {
        if (!ct.startsWith('web-tira-')) continue;
        tira[ct] ??= { visto: 0, clic: 0 };
        if (t in tira[ct]) tira[ct][t] += n;
      }
    }
  }
}
if (Object.keys(tira).length) {
  console.log('\nLa tira del escáner, todos los idiomas y páginas:');
  console.table(
    Object.keys(tira)
      .sort()
      .map((ct) => ({
        tira: ct.slice('web-tira-'.length).toUpperCase(),
        vistos: tira[ct].visto,
        clics: tira[ct].clic,
        'clics por 100 vistos': tira[ct].visto ? ((100 * tira[ct].clic) / tira[ct].visto).toFixed(2) : '—',
      })),
  );
}
