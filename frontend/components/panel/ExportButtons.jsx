import { React, elements } from 'perun-core';

// perun-core's lazily loaded Tabler icons render nothing until their chunk arrives, so every button
// keeps a text label.
const { Icon } = elements;

const FORMATS = [
  { offer: 'geojson', icon: 'IconJson', label: 'exportGeoJSON', fallback: 'GeoJSON', save: 'saveGeoJSON' },
  { offer: 'csv', icon: 'IconFileTypeCsv', label: 'exportCsv', fallback: 'CSV', save: 'saveCSV' },
  { offer: 'kml', icon: 'IconWorld', label: 'exportKml', fallback: 'KML', save: 'saveKML' },
  { offer: 'shp', icon: 'IconFileTypeZip', label: 'exportShp', fallback: 'Shapefile', save: 'saveShapefile' }
];

// The panel asks `canExport` before rendering these.
export const ExportButtons = ({ exporter, labels = {} }) => (
  <>
    {FORMATS.filter(({ offer }) => exporter.offer[offer] !== false).map(({ offer, icon, label, fallback, save }) => (
      <button key={offer} type='button' className='atlas-panel__btn atlas-panel__btn--ghost' onClick={exporter[save]}>
        <Icon name={icon} size={16} stroke={1.75} aria-hidden='true' />
        {labels[label] ?? fallback}
      </button>
    ))}
  </>
);
