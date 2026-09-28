/**
 * Where this package's stylesheets go in `<head>`.
 *
 * At the top, ahead of everything the page links for itself. Appending would
 * put a bundle's CSS after the deployment's and make the package the final word
 * at equal specificity -- so `panel.css` shipping a neutral default would
 * override the deployment's designed one rather than stand in for it where
 * there is none.
 *
 * Prepending inverts that: the package states a default, and anything the
 * deployment serves is later in the cascade and wins.
 *
 * Bundled rather than run by node: vite.config.mjs imports this beside every
 * stylesheet a module imports, and calls it with that sheet's text.
 */
export default function insertAtTopOfHead(css) {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.insertBefore(style, document.head.firstChild);
}
