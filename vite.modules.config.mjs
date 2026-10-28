import { defineConfig } from 'vite';

// Libraries loaded on demand, each an ES module beside the UMD bundle, which can't code-split.
// A second needs a build of its own: two entries would share a chunk with a hashed name.
export const MODULES = {
  shp: { entry: 'frontend/modules/shp.js', file: 'shp.perun-atlas.js' }
};

export default defineConfig({
  publicDir: false,
  build: {
    outDir: 'backend/www',
    // perun-atlas.js and the directory's .gitignore live there too.
    emptyOutDir: false,
    target: 'es2020',
    lib: {
      entry: MODULES.shp.entry,
      formats: ['es'],
      fileName: () => MODULES.shp.file
    },
    rolldownOptions: {
      output: {
        codeSplitting: false,
        // Lib mode leaves ES output unminified for a downstream bundler, and there is none.
        minify: true
      }
    }
  }
});
