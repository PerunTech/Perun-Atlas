import { defineConfig } from 'vite';

/**
 * The modules loaded on demand, each an ES module of its own beside the bundle.
 *
 * `vite.config.mjs` builds `perun-atlas.js` as UMD, which cannot code-split, so
 * a library too large for every screen's download is built here instead and
 * loaded with the browser's `import()` by `frontend/lib/modules.js`. The bundle
 * finds each one by the name given here, with a version taken from what this
 * build wrote, so this build runs first: `pnpm run build` runs both.
 *
 * Each is one self-contained file under a name that does not change from build
 * to build. The file list the jar packages, the CI job that commits the build
 * and each consumer's dev server then need to know nothing new. A module imports
 * nothing from perun-core or spatial: bytes in, plain data out.
 *
 * Only one so far. A second would need a build of its own rather than a second
 * entry here, since two entries share their common code through a chunk file
 * with a hashed name.
 */
export const MODULES = {
  shp: { entry: 'frontend/modules/shp.js', file: 'shp.perun-atlas.js' }
};

export default defineConfig({
  publicDir: false,
  build: {
    outDir: 'backend/www',
    // perun-atlas.js lives there too, and so does the directory's .gitignore.
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
        // Lib mode leaves an ES build's whitespace alone whatever `build.minify`
        // says, for a bundler downstream to shrink. Nothing downstream bundles
        // this -- a browser loads it as it is -- so the output is minified here.
        minify: true
      }
    }
  }
});
