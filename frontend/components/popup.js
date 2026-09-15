/**
 * Turning popup rows into elements.
 *
 * The split is deliberate: `popupFor` in `style/` decides *what* a popup says and
 * is plain data with no DOM in it, and this decides how that is built. Both
 * FeatureSet and Choropleth draw popups, so this is here rather than in either.
 *
 * Why elements and not a string of markup. Every value in a popup is a record's
 * field — a holding's name, an area's status, whatever the descriptor names — and
 * Leaflet applies string content with `innerHTML`:
 *
 *     if (typeof content === 'string') { node.innerHTML = content; }
 *     else { ...; node.appendChild(content); }          // DivOverlay._updateContent
 *
 * So a string of markup makes every one of those fields an injection point, and
 * an element makes none of them one. `textContent` never parses, and an element
 * handed to Leaflet is appended rather than parsed.
 *
 * This is the same reasoning `applyStyle` in FeatureSet already applies to a
 * descriptor's inline styles, one layer out.
 */

/**
 * A popup's content element.
 *
 * @param {{ title: string|null, rows: Array<{label: string, value: string}> }} content
 */
export const popupElement = ({ title, rows }) => {
  const root = document.createElement('div');
  root.className = 'atlas-popup';

  if (title) {
    const heading = document.createElement('p');
    heading.className = 'atlas-popup-title';
    heading.textContent = title;
    root.appendChild(heading);
  }

  if (rows.length) {
    const fields = document.createElement('dl');
    fields.className = 'atlas-popup-fields';
    rows.forEach(({ label, value }) => {
      const term = document.createElement('dt');
      term.textContent = label;
      const detail = document.createElement('dd');
      detail.textContent = value;
      fields.append(term, detail);
    });
    root.appendChild(fields);
  }

  return root;
};

/**
 * Content a caller supplied, kept out of the parser.
 *
 * A caller that returns an element gets it used as it is — that is how rich
 * content is built, and building it is one `createElement` away. A caller that
 * returns a string gets a text node, because that string is almost always a
 * record's field, and handing a record's field to an HTML parser is the one thing
 * this package should never do on a caller's behalf.
 */
export const asNode = (content) =>
  content instanceof Node ? content : document.createTextNode(String(content));

/**
 * What Leaflet is told about the bubble itself.
 *
 * `className` so a deployment can reach the frame without competing with
 * Leaflet's own selectors, and a max width because a popup is a summary: a field
 * long enough to need more room than this wants the record, not a bubble.
 */
export const POPUP_OPTIONS = { className: 'atlas-popup-shell', maxWidth: 280 };
