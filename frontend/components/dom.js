/**
 * The two things this package does to elements it did not create.
 *
 * Both exist for the same reason and it is worth stating once: values reaching
 * these come from configuration and from records, and neither may be allowed to
 * become markup. A property assignment cannot inject anything; an html string
 * can. So nothing here ever builds one.
 */

/**
 * A descriptor's own styling, applied to an element.
 *
 * A marker, a label and a popup are all drawn from configuration, and a screen
 * described in a menu table has no stylesheet of its own to name — so a
 * descriptor may carry its declarations instead of a class. That is what makes a
 * whole screen expressible as configuration rather than as code plus a
 * stylesheet shipped to match it.
 *
 * Keys are camelCase, as the CSSOM spells them (`borderRadius`), and custom
 * properties are set by name. A hyphenated key is the trap here: it assigns a
 * meaningless JS property and is dropped without a word. A declaration the
 * browser rejects is dropped too, which is what an unknown property in a
 * stylesheet does.
 */
export const applyStyle = (element, style) => {
  if (!element || !style) return;
  Object.entries(style).forEach(([property, value]) => {
    if (property.startsWith('--')) element.style.setProperty(property, value);
    else element.style[property] = value;
  });
};

/**
 * Content a caller supplied, kept out of the parser.
 *
 * A caller that returns an element gets it used as it is — that is how rich
 * content is built, and building it is one `createElement` away. A caller that
 * returns a string gets a text node, because that string is almost always a
 * record's field, and handing a record's field to an HTML parser is the one
 * thing this package should never do on a caller's behalf.
 *
 * Leaflet is the reason this matters rather than a general precaution: it
 * applies string content with `innerHTML` and appends anything else.
 *
 *     if (typeof content === 'string') { node.innerHTML = content; }
 *     else { ...; node.appendChild(content); }      // DivOverlay._updateContent
 */
export const asNode = (content) =>
  content instanceof Node ? content : document.createTextNode(String(content));
