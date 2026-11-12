import { defineConfig } from 'vite';

// base './' : chemins relatifs, pour fonctionner dans le sous-dossier /maxi-gouffre/ de GitHub Pages.
// host : le serveur est joignable depuis le téléphone sur le même Wi-Fi (Vite affiche l'adresse « Network »).
export default defineConfig({
  base: './',
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
  build: { outDir: 'dist', assetsInlineLimit: 0, target: 'es2022' },
  test: { include: ['tests/unit/**/*.test.js'], environment: 'node' },
});
