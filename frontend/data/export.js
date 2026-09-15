/**
 * A set, as a file.
 *
 * The map answers a question on screen; a report, an inspection record or an
 * outbreak note needs the answer as something to attach. These turn the
 * collection already in the browser into that, and add no request of their own --
 * the bytes are the ones the service already sent.
 *
 * Pure on purpose: strings in, strings out, no DOM and no engine. `download` in
 * `components/dom.js` is the half that touches the page.
 */

/** A feature property by dotted path, so a joined record's field reads like its own. */
export const valueAt = (properties, path) =>
  String(path).split('.').reduce((acc, part) => (acc == null ? acc : acc[part]), properties);

/**
 * The collection, as GeoJSON.
 *
 * Verbatim and indented. This is the format the service already speaks, so the
 * only decision here is that a person may open the file, which is what the
 * indentation is for.
 */
export const toGeoJSON = (collection) =>
  JSON.stringify(collection ?? { type: 'FeatureCollection', features: [] }, null, 2);

/**
 * Every property name in the set, in the order the features first mention them.
 *
 * Insertion order rather than alphabetical: the producer stamps its columns in a
 * deliberate order and a set is far easier to read in it. Nested objects are not
 * walked -- a joined record would otherwise contribute a column per field of a
 * row that most features do not have -- so a caller wanting one names it with a
 * dotted path in `fields`.
 */
const columnsOf = (features) => {
  const seen = new Set();
  features.forEach(feature => {
    Object.entries(feature?.properties ?? {}).forEach(([key, value]) => {
      if (value === null || typeof value !== 'object') seen.add(key);
    });
  });
  return [...seen];
};

/**
 * One cell, escaped.
 *
 * Two separate hazards, and only the first is the usual one:
 *
 * RFC 4180 -- a value holding a comma, a quote or a newline is wrapped in quotes
 * and its own quotes are doubled, or it would end the field early.
 *
 * Formula injection -- a spreadsheet treats a cell opening with `=`, `+`, `-`,
 * `@`, or a leading tab or carriage return as a formula, so a record's field
 * that happens to start that way is executed on open rather than read. These
 * values come from the database, which is exactly the place a string like that
 * can have been stored. Prefixing with an apostrophe makes it text; the
 * apostrophe is consumed by the spreadsheet rather than shown.
 */
const cell = (value) => {
  if (value === null || value === undefined) return '';
  const text = String(value);

  // A number is not a formula, and a negative one opens with the same character.
  // Without this every negative value in the set arrives as text and cannot be
  // summed, which is a worse outcome than the thing being guarded against.
  const numeric = /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(text);

  const defused = !numeric && /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return /[",\r\n]/.test(defused) ? `"${defused.replace(/"/g, '""')}"` : defused;
};

/**
 * The collection, as CSV.
 *
 * One row per feature, and by default one column per property the set mentions.
 * A caller that knows which of them matter says so instead:
 *
 *   fields: [{ field: 'SOME_CODE', label: 'some_label_code' }, ...]
 *
 * which fixes both the columns and their order, and takes a label code through
 * `labelResolver` the same way a popup's field labels do. Named the same as the
 * popup spec, because it is the same decision -- which fields of this record a
 * person actually reads -- and a caller that has already made it for the popup
 * can hand over the same array.
 *
 * Point coordinates are appended when the set has any, because a coordinate is
 * usually the reason a row was on a map at all. They are left off entirely when
 * nothing in the set is a point, rather than written as two empty columns.
 *
 * @param {Object} collection - GeoJSON FeatureCollection.
 * @param {Array}  [fields]   - [{ field, label }], fixing the columns and order.
 * @param {Function} [labelResolver] - Turns a field's label into display text.
 */
export const toCSV = (collection, { fields, labelResolver } = {}) => {
  const features = collection?.features ?? [];

  const columns = fields?.length
    ? fields.map(({ field, label }) => ({ field, header: (label && labelResolver?.(label)) || label || field }))
    : columnsOf(features).map(field => ({ field, header: field }));

  const points = features.some(feature => /Point$/.test(feature?.geometry?.type ?? ''));

  const header = [...columns.map(column => column.header), ...(points ? ['latitude', 'longitude'] : [])];

  const rows = features.map(feature => {
    const values = columns.map(column => cell(valueAt(feature?.properties, column.field)));
    if (!points) return values;

    // A Point's position is [x, y] -- longitude first -- and only a Point has one
    // to read. Anything else leaves the pair empty rather than guessing at a
    // centroid, which is a different number than the one a reader would expect.
    const single = /^Point$/.test(feature?.geometry?.type ?? '');
    const [lng, lat] = single ? (feature.geometry.coordinates ?? []) : [];
    return [...values, cell(lat), cell(lng)];
  });

  // CRLF, which is what RFC 4180 specifies and what a spreadsheet on Windows
  // opens without turning the file into one long row.
  return [header.map(cell), ...rows].map(row => row.join(',')).join('\r\n');
};
