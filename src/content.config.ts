import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /**
     * Slug de la URL en ESE idioma. El nombre del fichero identifica el post
     * y agrupa sus seis traducciones; este slug es lo que se lee en la barra
     * de direcciones, y un lector alemán no debe aterrizar en una URL escrita
     * en español.
     *
     * NO se puede llamar `slug`: Astro trata ese campo del frontmatter como el
     * id de la entrada, y al ponerlo el id dejó de empezar por el idioma. El
     * enrutador filtra por ese prefijo, así que los 24 posts desaparecieron del
     * build sin un solo aviso.
     */
    urlSlug: z.string(),
    fecha: z.string(),
  }),
});

export const collections = { blog };
