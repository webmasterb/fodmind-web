import type { Lang } from './tipos';

function escapar(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Los cuerpos de la Guía son texto plano con párrafos separados por líneas en
 * blanco y viñetas U+2022 a principio de línea. Los convierto a HTML aquí,
 * una sola vez, para que las páginas no improvisen.
 */
export function cuerpoAHtml(cuerpo: string): string {
  const bloques = cuerpo.trim().split(/\n\s*\n/);
  const partes: string[] = [];
  for (const bloque of bloques) {
    const lineas = bloque.split('\n').map((l) => l.trim());
    if (lineas.every((l) => l.startsWith('•'))) {
      const items = lineas.map((l) => `<li>${escapar(l.replace(/^•\s*/, ''))}</li>`).join('');
      partes.push(`<ul>${items}</ul>`);
    } else {
      partes.push(`<p>${escapar(bloque.trim())}</p>`);
    }
  }
  return partes.join('\n');
}

export function cuerpo(cuerpos: Record<Lang, string>, lang: Lang): string {
  return cuerpoAHtml(cuerpos[lang]);
}
