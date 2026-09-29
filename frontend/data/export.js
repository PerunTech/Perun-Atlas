import { valueAt } from './path';
import { SYSTEM_FIELDS } from './system';

/**
 * A set, as a file.
 *
 * The map answers a question on screen; a report, an inspection record or an
 * outbreak note needs the answer as something to attach. These turn the
 * collection already in the browser into that, and add no request of their own --
 * the bytes are the ones the service already sent.
 *
 * Pure on purpose: strings in, strings out, no DOM and no engine. `download` in
 * `lib/dom.js` is the half that touches the page.
 */

/**
 * The collection, as GeoJSON.
 *
 * Verbatim and indented. The only decision here is that a person may open the
 * file, which is what the indentation is for. The positions are whatever the
 * caller hands over, and RFC 7946 says they are WGS 84 longitude and latitude:
 * `useExport` converts the set with `inDegrees` before it gets here, because a
 * projection is exactly what this file refuses to know.
 */
export const toGeoJSON = (collection) =>
  JSON.stringify(collection ?? { type: 'FeatureCollection', features: [] }, null, 2);

/**
 * Every property name in the set, in the order the features first mention them.
 *
 * Insertion order rather than alphabetical, which keeps a record's columns
 * roughly as its producer grouped them -- but only roughly, and the comment that
 * used to claim more was wrong: an encoder serialising from a map has no order
 * to stamp, and a column no feature in *this* set carries is simply absent, so
 * two exports of one screen can disagree about where a column sits and whether
 * it is there at all. A screen that needs the same columns every time says so
 * with `fields`, which fixes them and their order and their headers.
 *
 * Nested objects are not walked -- a joined record would otherwise contribute a
 * column per field of a row that most features do not have -- so a caller
 * wanting one names it with a dotted path in `fields`.
 *
 * `SYSTEM_FIELDS` are always out: the object model's bookkeeping, which every
 * row carries and nobody reads. `exclude` adds a screen's own, for the columns
 * that are real fields and still not worth a column here. Same inversion as a
 * descriptor's `details` -- name what to leave out and let the rest through --
 * so a column the service starts returning appears on its own rather than
 * waiting for a menu row.
 */
const columnsOf = (features, exclude = []) => {
  const hidden = new Set([...SYSTEM_FIELDS, ...exclude]);
  const seen = new Set();
  features.forEach(feature => {
    Object.entries(feature?.properties ?? {}).forEach(([key, value]) => {
      if (!hidden.has(key) && (value === null || typeof value !== 'object')) seen.add(key);
    });
  });
  return [...seen];
};

/**
 * The columns a file carries, each with the header a reader sees.
 *
 * The CSV, the KML and the shapefile all read this, so a set describes itself
 * the same way in every file. `fields` fixes the columns outright, and its labels
 * go through `labelResolver`. A field's `short` is the name a shapefile gives the
 * column, and only a shapefile reads it. Without `fields`, every column
 * `columnsOf` finds is headed by the column lowercased as a label code, or by its
 * own name when that misses.
 */
export const columnsFor = (features, { fields, exclude, labelResolver } = {}) => (fields?.length
  ? fields.map(({ field, label, short }) => ({ field, header: (label && labelResolver?.(label)) || label || field, short }))
  : columnsOf(features, exclude).map(field => ({ field, header: labelResolver?.(field.toLowerCase()) || field })));

/** A run of positions, as WKT writes them: `x y`, space separated, comma between. */
const positions = (list) => list.map(([x, y]) => `${x} ${y}`).join(', ');

/** A list of rings, each parenthesised -- a polygon's outline and its holes. */
const rings = (list) => list.map(ring => `(${positions(ring)})`).join(', ');

const GEOMETRY = {
  Point: ([x, y]) => `POINT (${x} ${y})`,
  MultiPoint: (coordinates) => `MULTIPOINT (${positions(coordinates)})`,
  LineString: (coordinates) => `LINESTRING (${positions(coordinates)})`,
  MultiLineString: (coordinates) => `MULTILINESTRING (${rings(coordinates)})`,
  Polygon: (coordinates) => `POLYGON (${rings(coordinates)})`,
  MultiPolygon: (coordinates) => `MULTIPOLYGON (${coordinates.map(polygon => `(${rings(polygon)})`).join(', ')})`
};

/**
 * A feature's geometry, as WKT, or an empty cell.
 *
 * A set that is not all points has rows whose only content is their shape -- a
 * movement line carries a direction and two ends and nothing else -- so a file
 * with no column for it exports those rows as commas. WKT rather than a pair of
 * numbers because a line has no single position to write, and rather than a
 * bespoke notation because QGIS, PostGIS and GDAL all read a CSV with a WKT
 * column as a layer, which makes the export worth keeping rather than worth
 * looking at once.
 *
 * `x y` is the order WKT and GeoJSON agree on -- longitude first -- which is the
 * opposite of the `latitude, longitude` pair beside it, and the reason that pair
 * is labelled.
 */
const toWKT = (geometry) => {
  const write = GEOMETRY[geometry?.type];
  return write && geometry.coordinates?.length ? write(geometry.coordinates) : '';
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
export const cell = (value) => {
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
 * Without one, every property the set mentions is a column, minus the system
 * fields and any named in `exclude`. `fields` is also the way back to one of
 * those: it fixes the columns outright and consults neither list, so a screen
 * that really does need `status` in the file can ask for it by name.
 *
 * Each header takes the same ladder the record pane takes: the
 * column lowercased, tried as a label code, and the column name itself when that
 * misses. A file headed `VILLAGE_CODE` beside a screen reading `Village` is the
 * same record described twice, and only one of them is readable.
 *
 * Geometry is written as the set needs it. Point coordinates are appended when
 * the set has any, because a coordinate is usually the reason a row was on a map
 * at all; a set holding anything that is not a point also gets a `geometry`
 * column in WKT, because those rows' shape is the only thing on them. Neither is
 * written when nothing in the set has it, rather than standing as empty columns.
 *
 * @param {Object} collection - GeoJSON FeatureCollection.
 * @param {Array}  [fields]   - [{ field, label }], fixing the columns and order.
 * @param {Array}  [exclude]  - Property names to leave out on top of
 *                              `SYSTEM_FIELDS`, when `fields` is not given.
 *                              Ignored when it is: that already says.
 * @param {Function} [labelResolver] - Turns a field's label into display text.
 */
export const toCSV = (collection, { fields, exclude, labelResolver } = {}) => {
  const features = collection?.features ?? [];
  const columns = columnsFor(features, { fields, exclude, labelResolver });

  const typeOf = (feature) => feature?.geometry?.type ?? '';
  const points = features.some(feature => /Point$/.test(typeOf(feature)));
  const shapes = features.some(feature => typeOf(feature) && !/Point$/.test(typeOf(feature)));

  const header = [
    ...columns.map(column => column.header),
    ...(points ? ['latitude', 'longitude'] : []),
    ...(shapes ? ['geometry'] : [])
  ];

  const rows = features.map(feature => {
    const values = columns.map(column => cell(valueAt(feature?.properties, column.field)));

    // A Point's position is [x, y] -- longitude first -- and only a Point has one
    // to read. Anything else leaves the pair empty rather than guessing at a
    // centroid, which is a different number than the one a reader would expect;
    // the `geometry` column is where its shape is written whole.
    if (points) {
      const single = /^Point$/.test(typeOf(feature));
      const [lng, lat] = single ? (feature.geometry.coordinates ?? []) : [];
      values.push(cell(lat), cell(lng));
    }

    // Every feature, points included. A column filled for some rows and blank
    // for the rest is a column no reader can import.
    if (shapes) values.push(cell(toWKT(feature?.geometry)));

    return values;
  });

  // CRLF, which is what RFC 4180 specifies and what a spreadsheet on Windows
  // opens without turning the file into one long row.
  return [header.map(cell), ...rows].map(row => row.join(',')).join('\r\n');
};

/**
 * Text for an XML document: escaped, and without the characters XML cannot hold.
 *
 * The same two hazards as `cell`, because these values come from the same
 * database.
 *
 * Markup: a record's field holding `<` or `&` would end an element early or
 * start an entity, so the five XML escapes are applied to every text node and
 * attribute value. One function serves both, since a quote only matters in an
 * attribute and escaping it in text changes nothing.
 *
 * Control characters: XML 1.0 cannot write most of C0 at all, not even as a
 * character reference, and a parser that meets one refuses the whole document.
 * A form feed pasted into a note from a word processor would make the file
 * unreadable rather than one value wrong, so they are dropped. Tab, newline and
 * carriage return are allowed and kept.
 */
const XML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
const xml = (value) => String(value)
  // eslint-disable-next-line no-control-regex -- matching them is the point.
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, '')
  .replace(/[&<>"']/g, char => XML_ESCAPES[char]);

/**
 * A run of positions, as KML writes them: `lng,lat` with commas inside a
 * position and spaces between them. A third number, an altitude, is kept; with no
 * `altitudeMode` a reader clamps the shape to the ground anyway.
 */
const kmlCoordinates = (list) => `<coordinates>${list.map(position => position.join(',')).join(' ')}</coordinates>`;
const kmlRing = (list) => `<LinearRing>${kmlCoordinates(list)}</LinearRing>`;

/**
 * `tessellate` on lines and areas, so they follow the ground in Google Earth.
 * Without it an edge is drawn as a straight chord between its ends, and a
 * movement line a few kilometres long runs through the hills between two
 * holdings and disappears into them.
 */
const KML_GEOMETRY = {
  Point: (position) => `<Point>${kmlCoordinates([position])}</Point>`,
  LineString: (coordinates) => `<LineString><tessellate>1</tessellate>${kmlCoordinates(coordinates)}</LineString>`,
  // One `innerBoundaryIs` per hole, which is what the KML 2.2 schema says. A
  // single one holding every hole also opens in Google Earth, and not in every
  // other reader.
  Polygon: ([outer, ...holes]) => '<Polygon><tessellate>1</tessellate>' +
    `<outerBoundaryIs>${kmlRing(outer)}</outerBoundaryIs>` +
    holes.map(hole => `<innerBoundaryIs>${kmlRing(hole)}</innerBoundaryIs>`).join('') +
    '</Polygon>',
  MultiPoint: (coordinates) => `<MultiGeometry>${coordinates.map(KML_GEOMETRY.Point).join('')}</MultiGeometry>`,
  MultiLineString: (coordinates) => `<MultiGeometry>${coordinates.map(KML_GEOMETRY.LineString).join('')}</MultiGeometry>`,
  MultiPolygon: (coordinates) => `<MultiGeometry>${coordinates.map(KML_GEOMETRY.Polygon).join('')}</MultiGeometry>`
};

/**
 * A feature's geometry, as KML, or nothing.
 *
 * The same six types `toWKT` writes. A feature with no geometry is still a
 * placemark, only without a shape, so the KML has as many placemarks as the CSV
 * has rows.
 */
const toKMLGeometry = (geometry) => {
  const write = KML_GEOMETRY[geometry?.type];
  return write && geometry.coordinates?.length ? write(geometry.coordinates) : '';
};

/** One feature, as a `Placemark`. Indented to sit inside `Document`. */
const placemark = (feature, columns, nameOf) => {
  const name = nameOf?.(feature);
  const shape = toKMLGeometry(feature?.geometry);

  // Every column on every placemark, empty where the feature has no value, as
  // in the CSV. `name` is the column itself, so a reader that turns the file
  // back into features (GDAL, or togeojson) gets the property the set had.
  // `displayName` is the header the CSV would write, which is what Google Earth
  // shows in a placemark's balloon.
  const data = columns.map(({ field, header }) => {
    const value = valueAt(feature?.properties, field);
    const text = value === null || value === undefined ? '' : xml(value);
    return `        <Data name="${xml(field)}"><displayName>${xml(header)}</displayName><value>${text}</value></Data>`;
  });

  return [
    '    <Placemark>',
    ...(name === null || name === undefined || name === '' ? [] : [`      <name>${xml(name)}</name>`]),
    ...(data.length ? ['      <ExtendedData>', ...data, '      </ExtendedData>'] : []),
    ...(shape ? [`      ${shape}`] : []),
    '    </Placemark>'
  ].join('\n');
};

/**
 * The collection, as KML, so a set opens in Google Earth.
 *
 * One `Placemark` per feature, holding the same columns under the same headers
 * as the CSV, in `ExtendedData`. `fields`, `exclude` and `labelResolver` mean
 * what they mean for `toCSV`. A KML file carries its geometry in its own
 * elements, so there are no `latitude`, `longitude` or WKT columns.
 *
 * The positions are longitude and latitude, which is the only thing KML allows.
 * As with `toGeoJSON`, `useExport` converts the set with `inDegrees` first, and
 * this file knows no projection.
 *
 * No styles, so a reader draws each placemark in its own default. Writing them
 * from the descriptors was left for later: KML colours are `aabbggrr`, the
 * reverse of CSS.
 *
 * @param {Object} collection - GeoJSON FeatureCollection, in longitude and latitude.
 * @param {Array}  [fields]   - [{ field, label }], fixing the columns and order.
 * @param {Array}  [exclude]  - Property names to leave out, when `fields` is not given.
 * @param {Function} [labelResolver] - Turns a field's label into display text.
 * @param {Function} [nameOf] - What a placemark is called: the feature in, text
 *        or nothing out. Nothing writes the placemark without a `name`. Which
 *        field names a feature is the caller's to say; `useExport` asks the row
 *        and then the descriptor.
 */
export const toKML = (collection, { fields, exclude, labelResolver, nameOf } = {}) => {
  const features = collection?.features ?? [];
  const columns = columnsFor(features, { fields, exclude, labelResolver });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<kml xmlns="http://www.opengis.net/kml/2.2">',
    '  <Document>',
    ...features.map(feature => placemark(feature, columns, nameOf)),
    '  </Document>',
    '</kml>',
    ''
  ].join('\n');
};
