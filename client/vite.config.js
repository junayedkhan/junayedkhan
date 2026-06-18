import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '../server/node_modules/@tailwindcss/vite/dist/index.mjs';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const deps = resolve(rootDir, '.client-deps/node_modules');

export default {
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      '@fortawesome': `${deps}/@fortawesome`,
      aos: `${deps}/aos`,
      axios: `${deps}/axios`,
      react: `${deps}/react`,
      'react-dom': `${deps}/react-dom`,
      'react-hook-form': `${deps}/react-hook-form`,
      'react-router-dom': `${deps}/react-router-dom`,
      'react-simple-typewriter': `${deps}/react-simple-typewriter`,
      'react-slick': `${deps}/react-slick`,
      'react-tabs': `${deps}/react-tabs`,
      scheduler: `${deps}/scheduler`,
      'slick-carousel': `${deps}/slick-carousel`,
      'web-vitals': `${deps}/web-vitals`
    }
  }
};
