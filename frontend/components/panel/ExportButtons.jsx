import { React, elements } from 'perun-core';

/**
 * Tabler, through perun-core rather than as a dependency of this package.
 *
 * perun-core already ships `@tabler/icons-react` and loads it as its own lazy
 * chunk, so this costs no bundle weight and stays on whatever version the shell
 * is serving. It renders nothing until that chunk arrives and nothing at all if
 * it fails, so every button here keeps a text label beside the icon rather than
 * relying on one.
 */
const { Icon } = elements;

/**
 * The file formats, in the order their buttons stand.
 *
 * `offer` is the row's key that switches one off (`export.<offer>: false`),
 * `save` the handler `useExport` returns for it, and `label` the panel's word
 * for it, with the English it falls back to.
 */
const FORMATS = [
  { offer: 'geojson', icon: 'IconJson', label: 'exportGeoJSON', fallback: 'GeoJSON', save: 'saveGeoJSON' },
  { offer: 'csv', icon: 'IconFileTypeCsv', label: 'exportCsv', fallback: 'CSV', save: 'saveCSV' },
  { offer: 'kml', icon: 'IconWorld', label: 'exportKml', fallback: 'KML', save: 'saveKML' },
  { offer: 'shp', icon: 'IconFileTypeZip', label: 'exportShp', fallback: 'Shapefile', save: 'saveShapefile' }
];

/**
 * The buttons that write the set to a file, one per format the row has not
 * switched off.
 *
 * Only while there is something to write: the panel asks `canExport` before
 * rendering these.
 *
 * @param {Object} exporter - What `useExport` returned.
 * @param {Object} [labels]
 */
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
