import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    include: ['test/**/*.test.js'],
    // The cache lives in node_modules, which CI deletes. Setting it also stops Vitest suggesting it.
    fsModuleCache: false
  },
  resolve: {
    // The shell's globals, stubbed. Exact matches, so the `../spatial` shim stays real.
    alias: [
      { find: /^perun-core$/, replacement: path.resolve('./test/stubs/perun-core.js') },
      { find: /^spatial$/, replacement: path.resolve('./test/stubs/spatial.js') }
    ]
  }
});
