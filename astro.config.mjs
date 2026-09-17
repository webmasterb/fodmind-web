import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  site: 'https://fodmind.com',
  trailingSlash: 'always',
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    resolve: {
      // EL MOTOR DEL LECTOR ES EL DE LA APP, copiado tal cual a src/motor/ por
      // scripts/sincronizar-motor.mjs. Sus ficheros importan `@/lib/...` y
      // `@/data/...` como en la app, y este alias es lo que hace que no haya
      // que tocarles una letra: es la condición para que los dos lectores
      // digan lo mismo. Nada de la web propia usa `@`.
      alias: { '@': fileURLToPath(new URL('./src/motor', import.meta.url)) },
    },
  },
});
