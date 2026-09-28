import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Unit tests for the parts of this package that do not need a map.
 *
 * `perun-core` and `spatial` are the shell's, not this package's: the build
 * leaves both external, so they are resolved from globals the shell has already
 * loaded. Neither can be installed here, so a test run points
 * the two bare specifiers at stubs. Exact matches only -- `../spatial` is this
 * package's own shim and must go on resolving to the real file, which is what
 * keeps the one-caller rule under test with everything else.
 *
 * Tests live in `test/` rather than beside the source on purpose. The pipeline's
 * architecture guards grep `frontend/` for coordinate literals, and a test for
 * `ringIn` is nothing but coordinate literals -- under `frontend/` the suite
 * would fail the build it is meant to protect.
 *
 * `.mjs` rather than `.js` because this package has no `type` field, so a `.js`
 * config would be read as CommonJS. vite.config.mjs is the same for the same
 * reason. The build's config is not merged in here: a run needs none of it.
 *
 * `fsModuleCache` is off, and says so. Vitest suggests turning it on once
 * transforms pass two seconds of a run, which they do on the shared runner, but
 * the cache lives under `node_modules/` and the pipeline deletes that before
 * every install -- so it would be written and thrown away each time. Keeping
 * it means moving it with `fsModuleCachePath` and persisting that directory
 * with a GitLab `cache:` entry, for a saving bounded by the transform time: a
 * couple of seconds, in a job that reinstalls every dependency from scratch.
 * Setting it at all, to either value, is also what stops Vitest printing the
 * suggestion on every pipeline.
 */
export default defineConfig({
  test: {
    include: ['test/**/*.test.js'],
    environment: 'node',
    fsModuleCache: false
  },
  resolve: {
    alias: [
      { find: /^perun-core$/, replacement: path.resolve('./test/stubs/perun-core.js') },
      { find: /^spatial$/, replacement: path.resolve('./test/stubs/spatial.js') }
    ]
  }
});
