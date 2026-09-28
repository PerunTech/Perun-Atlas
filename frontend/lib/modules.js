/**
 * Modules of this package's own that are not in the bundle, loaded when first
 * needed.
 *
 * The bundle is UMD, and UMD cannot code-split: a dynamic `import()` in the
 * source is folded into the one file. So a library too large for every screen's
 * download -- the shapefile reader, with proj4 -- is built as an ES module of its
 * own beside `perun-atlas.js` (`vite.modules.config.mjs`), and loaded here with
 * the browser's own `import()`. perun-core already needs ES2020, which is what
 * a dynamic `import()` needs.
 *
 * Each module is asked for with a version in its URL, derived by the build from
 * the module's contents, so a browser holding last month's module in its cache
 * never runs it against this month's bundle. The build fills
 * `__ATLAS_MODULES__` in with each file's name and version; a test run has none.
 */

const FILES = typeof __ATLAS_MODULES__ === 'undefined' ? {} : __ATLAS_MODULES__;

/**
 * The URL this bundle was loaded from.
 *
 * `document.currentScript` is the script being evaluated, and only while it is:
 * read from a click handler, it is null. So it is read here, at module level,
 * which in the UMD bundle runs while `perun-atlas.js` itself evaluates. The
 * shell's `PluginManager` adds each plugin as a script tag with a `src`, and a
 * consumer's dev server serves the same file under the same path.
 */
const loadedFrom = typeof document === 'undefined' ? null : document.currentScript?.src || null;

/**
 * Where the bundle is, for a bundle evaluated some way that left no current
 * script: its own script tag, found by name.
 */
const bundleUrl = () => loadedFrom ??
  (typeof document === 'undefined'
    ? null
    : Array.from(document.scripts).find(script => /\/perun-atlas\.js(\?|$)/.test(script.src))?.src ?? null);

/**
 * A module's URL: its file, with its version, beside the bundle.
 *
 * @param {string} name - The module's name, such as `shp`.
 * @param {string|null} base - The bundle's URL.
 * @param {Object} [files] - Each module's file, by name.
 * @returns {string|null} Null when either is unknown.
 */
export const moduleUrl = (name, base, files = FILES) =>
  base && files[name] ? new URL(files[name], base).href : null;

const loading = new Map();

/**
 * A module, loaded once and shared by every caller after.
 *
 * A load that fails is forgotten, so the next attempt asks the network again: a
 * dropped connection should not cost the reader the shapefile reader until the
 * page reloads.
 *
 * @param {string} name - The module's name, such as `shp`.
 * @param {Object} [options] - For tests.
 * @param {string} [options.base] - The bundle's URL.
 * @param {Object} [options.files] - Each module's file, by name.
 * @param {Function} [options.load] - URL to a module namespace. The browser's
 *        `import()` unless given.
 * @returns {Promise<Object>} The module's exports.
 */
export const loadModule = (name, {
  base = bundleUrl(),
  files = FILES,
  load = (url) => import(/* @vite-ignore */ url)
} = {}) => {
  if (!loading.has(name)) {
    const url = moduleUrl(name, base, files);
    const pending = url
      ? load(url)
      : Promise.reject(new Error(`perun-atlas: cannot tell where the ${name} module is. ` +
          'It is loaded from beside perun-atlas.js, and that script could not be found.'));
    pending.catch(() => loading.delete(name));
    loading.set(name, pending);
  }
  return loading.get(name);
};
