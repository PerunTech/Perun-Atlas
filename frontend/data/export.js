import { valueAt } from './path';
import { SYSTEM_FIELDS } from './system';

// RFC 7946 positions are WGS 84; useExport converts the set before it gets here.
export const toGeoJSON = (collection) =>
  JSON.stringify(collection ?? { type: 'FeatureCollection', features: [] }, null, 2);

// Nested objects are skipped; a caller wanting one names it with a dotted path in `fields`.
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

// Shared by the CSV, KML and shapefile, so a set describes itself the same way in each. Only the
// shapefile reads `short`.
export const columnsFor = (features, { fields, exclude, labelResolver } = {}) => (fields?.length
  ? fields.map(({ field, label, short }) => ({ field, header: (label && labelResolver?.(label)) || label || field, short }))
  : columnsOf(features, exclude).map(field => ({ field, header: labelResolver?.(field.toLowerCase()) || field })));

const positions = (list) => list.map(([x, y]) => `${x} ${y}`).join(', ');

const rings = (list) => list.map(ring => `(${positions(ring)})`).join(', ');

const GEOMETRY = {
  Point: ([x, y]) => `POINT (${x} ${y})`,
  MultiPoint: (coordinates) => `MULTIPOINT (${positions(coordinates)})`,
  LineString: (coordinates) => `LINESTRING (${positions(coordinates)})`,
  MultiLineString: (coordinates) => `MULTILINESTRING (${rings(coordinates)})`,
  Polygon: (coordinates) => `POLYGON (${rings(coordinates)})`,
  MultiPolygon: (coordinates) => `MULTIPOLYGON (${coordinates.map(polygon => `(${rings(polygon)})`).join(', ')})`
};

// WKT, because QGIS, PostGIS and GDAL read a CSV with a WKT column as a layer.
const toWKT = (geometry) => {
  const write = GEOMETRY[geometry?.type];
  return write && geometry.coordinates?.length ? write(geometry.coordinates) : '';
};

// RFC 4180 quoting, plus a leading apostrophe against spreadsheet formula injection.
export const cell = (value) => {
  if (value === null || value === undefined) return '';
  const text = String(value);

  // Negative numbers stay numbers, or they could not be summed.
  const numeric = /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(text);

  const defused = !numeric && /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return /[",\r\n]/.test(defused) ? `"${defused.replace(/"/g, '""')}"` : defused;
};

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

    // Only a Point has a single position; a centroid is not the number a reader expects.
    if (points) {
      const single = /^Point$/.test(typeOf(feature));
      const [lng, lat] = single ? (feature.geometry.coordinates ?? []) : [];
      values.push(cell(lat), cell(lng));
    }

    // Every row, points included, or the column cannot be imported.
    if (shapes) values.push(cell(toWKT(feature?.geometry)));

    return values;
  });

  // CRLF, per RFC 4180.
  return [header.map(cell), ...rows].map(row => row.join(',')).join('\r\n');
};

// XML 1.0 cannot hold most C0 control characters, even as references, so they are dropped.
const XML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
const xml = (value) => String(value)
  // eslint-disable-next-line no-control-regex -- matching them is the point.
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, '')
  .replace(/[&<>"']/g, char => XML_ESCAPES[char]);

const kmlCoordinates = (list) => `<coordinates>${list.map(position => position.join(',')).join(' ')}</coordinates>`;
const kmlRing = (list) => `<LinearRing>${kmlCoordinates(list)}</LinearRing>`;

// `tessellate` makes lines follow the ground instead of cutting through hills.
const KML_GEOMETRY = {
  Point: (position) => `<Point>${kmlCoordinates([position])}</Point>`,
  LineString: (coordinates) => `<LineString><tessellate>1</tessellate>${kmlCoordinates(coordinates)}</LineString>`,
  // One `innerBoundaryIs` per hole, as KML 2.2 specifies; not every reader accepts them combined.
  Polygon: ([outer, ...holes]) => '<Polygon><tessellate>1</tessellate>' +
    `<outerBoundaryIs>${kmlRing(outer)}</outerBoundaryIs>` +
    holes.map(hole => `<innerBoundaryIs>${kmlRing(hole)}</innerBoundaryIs>`).join('') +
    '</Polygon>',
  MultiPoint: (coordinates) => `<MultiGeometry>${coordinates.map(KML_GEOMETRY.Point).join('')}</MultiGeometry>`,
  MultiLineString: (coordinates) => `<MultiGeometry>${coordinates.map(KML_GEOMETRY.LineString).join('')}</MultiGeometry>`,
  MultiPolygon: (coordinates) => `<MultiGeometry>${coordinates.map(KML_GEOMETRY.Polygon).join('')}</MultiGeometry>`
};

const toKMLGeometry = (geometry) => {
  const write = KML_GEOMETRY[geometry?.type];
  return write && geometry.coordinates?.length ? write(geometry.coordinates) : '';
};

const placemark = (feature, columns, nameOf) => {
  const name = nameOf?.(feature);
  const shape = toKMLGeometry(feature?.geometry);

  // `name` is the column itself, so a reader turning the file back into features gets the property
  // back; `displayName` is what Google Earth shows.
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

// Positions must be longitude and latitude. No styles yet: KML colours are `aabbggrr`.
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
