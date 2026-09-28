import { defineConfig } from 'vite';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { MODULES } from './vite.modules.config.mjs';

/**
 * The production bundle: one UMD file, `backend/www/perun-atlas.js`.
 *
 * The shell loads it as an IPerunPlugin script and consumers read it off
 * `window['perun-atlas']`, so the format and the global's name are the contract.
 * `perun-core` and `spatial` are the shell's, published as window globals by
 * their own bundles, and are never bundled: a second copy of spatial would mean
 * a second Leaflet alongside the other bundles that draw maps.
 *
 * UMD cannot code-split. A dynamic `import()` is folded into this one file, so a
 * library meant to load on demand is built as a module of its own by
 * `vite.modules.config.mjs`, and loaded with the browser's `import()` from beside
 * this file.
 *
 * `.mjs` for the same reason vitest.config.mjs is: this package has no `type`
 * field, so a `.js` here would be read as CommonJS.
 */

// A module standing in for a sheet. The id must not end in `.css`, or Vite's own
// CSS handling claims it and reads the generated JavaScript as a stylesheet.
const STYLE = '\0perun-atlas-style:';
const AS_JS = '.js';
const insertStyle = path.resolve('./build/style-insert.js');

/**
 * Each stylesheet a module imports becomes a `<style>` at `head.firstChild`,
 * inserted when that module evaluates -- what style-loader did with
 * `build/style-insert.js`, and why the deployment's sheets win ties.
 * `frontend/style/README.md` says why that order is the design.
 *
 * One element per sheet rather than Vite's single extracted file, because the
 * shell loads scripts, not stylesheets, and because inserting each at the top
 * reverses them: a sheet imported later sits earlier in the cascade. That is the
 * order every deployment has been running, so it is kept rather than repaired.
 * Minifying is off for the same reason -- lightningcss lowers syntax for the
 * target, and these sheets are overridden as written.
 */
function stylesAtTopOfHead() {
  return {
    name: 'perun-atlas:styles-at-top-of-head',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (!importer || !source.endsWith('.css')) return null;
      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
      return resolved && STYLE + resolved.id + AS_JS;
    },
    load(id) {
      if (!id.startsWith(STYLE)) return null;
      const sheet = id.slice(STYLE.length, -AS_JS.length);
      return [
        `import insert from ${JSON.stringify(insertStyle)};`,
        `import css from ${JSON.stringify(sheet + '?inline')};`,
        'insert(css);'
      ].join('\n');
    }
  };
}

/**
 * Each module loaded on demand, as the bundle asks for it: its file, with a
 * version taken from the file's contents.
 *
 * The version is what keeps a cached module from running against a newer
 * bundle, since the file's name never changes. It is read from what the modules'
 * build wrote, so that build has to run first, and one that has not is a build
 * that stops here rather than a bundle that asks for a file that is not there.
 */
const moduleFiles = () => Object.fromEntries(Object.entries(MODULES).map(([name, { file }]) => {
  const built = path.resolve('backend/www', file);
  if (!fs.existsSync(built)) {
    throw new Error(`${file} is not built. \`pnpm run build\` builds it before perun-atlas.js.`);
  }
  const version = createHash('sha256').update(fs.readFileSync(built)).digest('hex').slice(0, 12);
  return [name, `${file}?v=${version}`];
}));

export default defineConfig({
  publicDir: false,
  define: { __ATLAS_MODULES__: JSON.stringify(moduleFiles()) },
  plugins: [stylesAtTopOfHead()],
  // Classic JSX: `React.createElement`, with React imported from perun-core. The
  // automatic runtime would import `react/jsx-runtime`, which is not installed
  // here and would be a second React if it were.
  oxc: { jsx: { runtime: 'classic' } },
  build: {
    outDir: 'backend/www',
    // The directory also holds its .gitignore, and the jar packages all of it.
    emptyOutDir: false,
    // perun-core's own bundle needs ES2020, so nothing runs this one where the
    // shell could not run.
    target: 'es2020',
    cssMinify: false,
    lib: {
      entry: 'frontend/index.js',
      name: 'perun-atlas',
      formats: ['umd'],
      fileName: () => 'perun-atlas.js'
    },
    rollupOptions: {
      external: ['perun-core', 'spatial'],
      output: { globals: { 'perun-core': 'perun-core', spatial: 'spatial' } }
    }
  }
});
