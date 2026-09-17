import { applyStyle } from './dom';

/**
 * Turning popup rows into elements.
 *
 * The split is deliberate: `popupFor` in `style/` decides *what* a popup says and
 * is plain data with no DOM in it, and this decides how that is built and how it
 * looks. Both FeatureSet and Choropleth draw popups, so this is here rather than
 * in either.
 *
 * Content is built as elements and never as a string of markup. See `asNode` in
 * `dom.js` for why that is load-bearing rather than tidy.
 */

/**
 * A popup's content element.
 *
 * The styling keys mirror `marker` and `label`, for the same reason those have
 * them: a screen described entirely in a menu table has no stylesheet to name,
 * so its descriptor carries the declarations. Without these a configured screen
 * could style its markers and its labels and then get the package's default
 * bubble between them.
 *
 * Applied as the element is built rather than on `popupopen`, which is what a
 * label has to do. A label's pill belongs to Leaflet and is rebuilt every time
 * it opens; this element is ours, and Leaflet only appends it.
 *
 * @param {{ title: string|null, rows: Array<{label: string, value: string}> }} content
 * @param {Object} [spec] - The descriptor's `popup` entry:
 *        `className`  added to the content root, for a screen that does have a
 *                     stylesheet;
 *        `style`      the content root;
 *        `titleStyle` the title line;
 *        `labelStyle` each field's name;
 *        `valueStyle` each field's value.
 */
export const popupElement = ({ title, rows }, spec = {}) => {
  const root = document.createElement('div');
  root.className = ['atlas-popup', spec.className].filter(Boolean).join(' ');
  applyStyle(root, spec.style);

  if (title) {
    const heading = document.createElement('p');
    heading.className = 'atlas-popup-title';
    heading.textContent = title;
    applyStyle(heading, spec.titleStyle);
    root.appendChild(heading);
  }

  if (rows.length) {
    const fields = document.createElement('dl');
    fields.className = 'atlas-popup-fields';
    rows.forEach(({ label, value }) => {
      const term = document.createElement('dt');
      term.textContent = label;
      applyStyle(term, spec.labelStyle);

      const detail = document.createElement('dd');
      detail.textContent = value;
      applyStyle(detail, spec.valueStyle);

      fields.append(term, detail);
    });
    root.appendChild(fields);
  }

  return root;
};

/**
 * What Leaflet is told about the bubble itself.
 *
 * `className` so a deployment can reach the frame without competing with
 * Leaflet's own selectors, and a max width because a popup is a summary: a field
 * long enough to need more room than this wants the record, not a bubble.
 */
export const POPUP_OPTIONS = { className: 'atlas-popup-shell', maxWidth: 280 };
