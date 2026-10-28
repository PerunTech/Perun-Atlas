// UMD cannot code-split, so a library too large for every screen is built as an ES module beside the
// bundle and loaded with the browser's import(). The build fills __ATLAS_MODULES__; a test run has none.
const FILES = typeof __ATLAS_MODULES__ === 'undefined' ? {} : __ATLAS_MODULES__;

// `document.currentScript` is set only while the bundle evaluates, so it is read at module level.
const loadedFrom = typeof document === 'undefined' ? null : document.currentScript?.src || null;

const bundleUrl = () => loadedFrom ??
  (typeof document === 'undefined'
    ? null
    : Array.from(document.scripts).find(script => /\/perun-atlas\.js(\?|$)/.test(script.src))?.src ?? null);

export const moduleUrl = (name, base, files = FILES) =>
  base && files[name] ? new URL(files[name], base).href : null;

const loading = new Map();

// A failed load is forgotten, so a dropped connection doesn't cost the reader the module until reload.
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
