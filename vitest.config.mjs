import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Unit tests for the parts of this package that do not need a map.
 *
 * `perun-core` and `spatial` are the shell's, not this package's: webpack marks
 * both `externals` in a production build, so they are resolved from globals the
 * shell has already loaded. Neither can be installed here, so a test run points
 * the two bare specifiers at stubs. Exact matches only -- `../spatial` is this
 * package's own shim and must go on resolving to the real file, which is what
 * keeps the one-caller rule under test with everything else.
 *
 * Tests live in `test/` rather than beside the source on purpose. The pipeline's
 * architecture guards grep `frontend/` for coordinate literals, and a test for
 * `ringIn` is nothing but coordinate literals -- under `frontend/` the suite
 * would fail the build it is meant to protect.
 *
 * `.mjs` rather than `.js` because webpack.config.js is CommonJS and this is
 * not. The extension is what lets the two sit in one package without a `type`
 * field that would break whichever of them it was not written for.
 */
export default defineConfig({
  test: {
    include: ['test/**/*.test.js'],
    environment: 'node'
  },
  resolve: {
    alias: [
      { find: /^perun-core$/, replacement: path.resolve('./test/stubs/perun-core.js') },
      { find: /^spatial$/, replacement: path.resolve('./test/stubs/spatial.js') }
    ]
  }
});
