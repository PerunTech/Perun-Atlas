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

/**
 * A file, handed to the browser.
 *
 * An object URL and a synthetic click, which is the only way a page gives
 * someone a file it built itself. The link is never in the document's layout:
 * it is created, clicked and dropped.
 *
 * The revoke is deferred rather than immediate. Releasing the URL in the same
 * turn as the click cancels the download in some browsers -- the click is
 * queued, and by the time it is handled the URL it names is already gone.
 *
 * A BOM for CSV, because that is what tells a spreadsheet the file is UTF-8.
 * Without it the usual default is a legacy code page, and every non-ASCII name
 * in the export opens as mojibake. JSON needs no such help: its encoding is
 * UTF-8 by specification and a BOM would only confuse a parser.
 */
export const download = (filename, content, type) => {
  const bom = type.startsWith('text/csv') ? '﻿' : '';
  const url = URL.createObjectURL(new Blob([bom, content], { type }));

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 0);
};
