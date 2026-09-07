/**
 * Despliegue completo de fodmind.com en Cloudflare Pages.
 *
 * Requiere una sola cosa previa: `npx wrangler login` autorizado en el
 * navegador. Todo lo demás lo hace este guion:
 *
 *   node scripts/desplegar.mjs
 *
 * 1. comprueba sesión y build
 * 2. crea el proyecto Pages (fodmind-web) si no existe
 * 3. sube dist/ a producción
 * 4. atacha fodmind.com y www.fodmind.com al proyecto
 * 5. dice qué queda fuera (DNS si la zona no está en Cloudflare)
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROYECTO = 'fodmind-web';
const DOMINIOS = ['fodmind.com', 'www.fodmind.com'];

function tokenDeSesion() {
  const configRuta = join(process.env.APPDATA ?? process.env.HOME ?? '', 'xdg.config', '.wrangler', 'config', 'default.toml');
  if (!existsSync(configRuta)) return null;
  return readFileSync(configRuta, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)?.[1] ?? null;
}

const token = tokenDeSesion();
if (!token) {
  console.log('Sin sesión de Cloudflare. Ejecuta antes:  npx wrangler login');
  process.exit(1);
}

const api = async (ruta, metodo = 'GET', cuerpo) => {
  const res = await fetch(`https://api.cloudflare.com/client/v4${ruta}`, {
    method: metodo,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  return res.json();
};

const quien = await api('/user');
if (!quien.success) {
  console.log('El token de sesión no vale ya. Ejecuta de nuevo:  npx wrangler login');
  process.exit(1);
}
console.log(`Sesión OK — ${quien.result.email ?? 'cuenta Cloudflare'}`);

const cuentas = await api('/accounts');
const cuenta = cuentas.result[0].id;
console.log(`Cuenta: ${cuentas.result[0].name}`);

const nombreProyecto = { name: PROYECTO, production_branch: 'main' };
const creado = await api(`/accounts/${cuenta}/pages/projects`, 'POST', nombreProyecto);
if (creado.success) console.log(`Proyecto Pages creado: ${PROYECTO}`);
else if (String(creado.errors?.[0]?.code) === '8000021') console.log(`Proyecto Pages ya existía: ${PROYECTO}`);
else {
  console.log('No se pudo crear el proyecto:', JSON.stringify(creado.errors));
  process.exit(1);
}

if (!existsSync(join(RAIZ, 'dist', 'index.html'))) {
  console.log('No hay build; construyendo…');
  execSync('npm run build', { cwd: RAIZ, stdio: 'inherit' });
}

console.log('Subiendo dist/ a producción…');
execSync(`npx wrangler pages deploy dist --project-name ${PROYECTO} --branch main --commit-dirty=true`, {
  cwd: RAIZ,
  stdio: 'inherit',
});

for (const dominio of DOMINIOS) {
  const res = await api(`/accounts/${cuenta}/pages/projects/${PROYECTO}/domains`, 'POST', { name: dominio });
  if (res.success) console.log(`Dominio atachado: ${dominio}`);
  else if (String(res.errors?.[0]?.code) === '1208') console.log(`Dominio ya atachado: ${dominio}`);
  else console.log(`Dominio ${dominio}: ${res.errors?.[0]?.message ?? 'sin respuesta'}`);
}

console.log('\nListo. Comprueba https://fodmind.com en unos minutos (el certificado tarda un poco).');
console.log('Si la zona DNS de fodmind.com NO está en esta cuenta de Cloudflare, añade en el registrador:');
console.log('  CNAME  www  ->  fodmind-web.pages.dev');
console.log('  y para el dominio raíz, CNAME/ALIAS con aplanado (o traslada la zona a Cloudflare).');
console.log('Si SÍ está en Cloudflare, no hay que tocar nada más.');
