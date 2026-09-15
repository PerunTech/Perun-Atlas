/**
 * Where this package's stylesheets go in `<head>`.
 *
 * At the top, ahead of everything the page links for itself. style-loader's
 * default is to append, which puts a bundle's CSS after the deployment's and
 * makes the package the final word at equal specificity -- so `panel.css`
 * shipping a neutral default would override the deployment's designed one
 * rather than stand in for it where there is none.
 *
 * Prepending inverts that: the package states a default, and anything the
 * deployment serves is later in the cascade and wins.
 *
 * Its own file because style-loader v4 takes `insert` as a module path and
 * bundles it; an inline function is a v3 spelling and fails validation.
 */
module.exports = function insertAtTopOfHead(element) {
  document.head.insertBefore(element, document.head.firstChild);
};
