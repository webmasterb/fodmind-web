import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://fodmind.com',
  trailingSlash: 'always',
  build: {
    inlineStylesheets: 'auto',
  },
});
