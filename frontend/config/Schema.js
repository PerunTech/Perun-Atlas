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

  // Often not the map's CRS. svarog's own parameter, hence the name.
  dataSrid: {
    type: 'srid',
    param: 'sys.gis.default_srid',
    default: '4326',
    doc: 'EPSG code the database stores geometry in, without the prefix.'
  }
};

export const REQUIRED = Object.keys(SCHEMA).filter(k => SCHEMA[k].required);
