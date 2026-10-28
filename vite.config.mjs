import { defineConfig } from 'vite';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { MODULES } from './vite.modules.config.mjs';

// Must not end in `.css`, or Vite's own CSS handling claims the generated module.
const STYLE = '\0perun-atlas-style:';
const INSERT = 'perun-atlas:insert-style';
const INSERT_SOURCE = [
  'export default function insertAtTopOfHead(css) {',
  `  const style = document.createElement('style');`,
  '  style.textContent = css;',
  '  document.head.insertBefore(style, document.head.firstChild);',
  '}'
].join('\n');

// Each imported sheet becomes a `<style>` at the top of `<head>`, so the deployment's sheets win
// ties. `frontend/style/README.md` says why.
function stylesAtTopOfHead() {
  return {
    name: 'perun-atlas:styles-at-top-of-head',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (source === INSERT) return `\0${INSERT}`;
      if (!importer || !source.endsWith('.css')) return null;
      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
      return resolved && `${STYLE}${resolved.id}.js`;
    },
    load(id) {
      if (id === `\0${INSERT}`) return INSERT_SOURCE;
      if (!id.startsWith(STYLE)) return null;
      const sheet = id.slice(STYLE.length, -'.js'.length);
      return [
        `import insert from '${INSERT}';`,
        `import css from ${JSON.stringify(`${sheet}?inline`)};`,
        'insert(css);'
      ].join('\n');
    }
  };
}

// The `?v=` keeps a cached module from running against a newer bundle.
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
  // React comes from perun-core; the automatic runtime would import `react/jsx-runtime`.
  oxc: { jsx: { runtime: 'classic' } },
  build: {
    outDir: 'backend/www',
    // The modules' build and the directory's .gitignore live there too.
    emptyOutDir: false,
    target: 'es2020',
    // Deployments override these sheets as written; minifying would rewrite their syntax.
    cssMinify: false,
    lib: {
      entry: 'frontend/index.js',
      name: 'perun-atlas',
      formats: ['umd'],
      fileName: () => 'perun-atlas.js'
    },
    // The shell's globals. A second spatial would mean a second Leaflet.
    rolldownOptions: {
      external: ['perun-core', 'spatial'],
      output: { globals: { 'perun-core': 'perun-core', spatial: 'spatial' } }
    }
  }
});
