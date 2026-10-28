/**
 * Every environment-specific setting perun-atlas needs, declared once.
 *
 * One entry drives all of it: the remote parameter name, the type coercion, and
 * whether the application may start without a value. Adding a setting means
 * adding a row here and nothing else.
 */
export const SCHEMA = {
  crs: {
    type: 'crs',
    param: 'SPATIAL_CRS',
    required: true,
    doc: 'EPSG code, or { code, def } for a proj4 definition.'
  },
  center: {
    type: 'latlng',
    param: 'SPATIAL_CENTER',
    required: true,
    doc: 'Initial map centre as { lat, lng }.'
  },
  bounds: {
    type: 'bounds',
    param: 'SPATIAL_BOUNDS',
    doc: 'Spatial limits as [ {lat,lng} southwest, {lat,lng} northeast ].'
  },
  zoom: { type: 'int', param: 'SPATIAL_ZOOM', default: 8 },
  minZoom: { type: 'int', param: 'SPATIAL_MIN_ZOOM', default: 0 },
  maxZoom: { type: 'int', param: 'SPATIAL_MAX_ZOOM', default: 18 },
  bboxOrder: {
    type: 'bool',
    param: 'SPATIAL_SWITCH_BBOX_ORDER',
    default: false,
    doc: 'Reverse WMS bounding box axis order.'
  },
  units: {
    type: 'enum',
    param: 'SPATIAL_MEASUREMENT_SYSTEM',
    values: ['metric', 'imperial'],
    default: 'metric'
  },
  attribution: { type: 'string', param: 'SPATIAL_ATTRIBUTION', default: '' },
  fallbackBasemap: {
    type: 'string',
    param: 'SPATIAL_FALLBACK_BASEMAP',
    default: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    doc: 'Tile URL drawn when the layer catalogue lists no basemap, on a Web Mercator map only. "none" turns it off.'
  },

  /**
   * The CRS the database stores geometry in, which is not the CRS the map draws
   * in and frequently differs from it: a deployment commonly keeps geometry in
   * 4326 and displays on the Web Mercator tile grid.
   *
   * Named by svarog rather than by this project, because it is svarog's own
   * parameter and has been read under that name since long before SPATIAL_*.
   */
  dataSrid: {
    type: 'srid',
    param: 'sys.gis.default_srid',
    default: '4326',
    doc: 'EPSG code the database stores geometry in, without the prefix.'
  }
};

/** Settings that must resolve to a value before a map may be constructed. */
export const REQUIRED = Object.keys(SCHEMA).filter(k => SCHEMA[k].required);
