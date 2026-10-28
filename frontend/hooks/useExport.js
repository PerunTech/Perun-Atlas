import { toCSV, toGeoJSON, toKML } from '../data/export';
import { valueAt } from '../data/path';
import { inDegrees } from '../data/project';
import { toShapefile } from '../data/shapefile';
import { nameFor } from '../appearance/descriptor';
import { download } from '../lib/dom';
import { zip } from '../lib/zip';
import { today } from '../lib/dates';

export const useExport = ({ set, selection, exportable, labelResolver, timeScoped, range, srid, map, drawnWith }) => {
  // On unless a row says `false`: the set is already in the browser, so withholding the buttons only
  // withholds the convenience.
  const offer = exportable === false ? null : (exportable && exportable !== true ? exportable : {});

  // Only once the shape has caught something, so a click mid-draw doesn't swap the full file for an empty one.
  const narrowed = Boolean(selection?.selecting && selection.feedsExport && selection.count > 0);
  const source = narrowed ? { type: 'FeatureCollection', features: selection.inside } : set;

  const canExport = offer && source && (source.features?.length ?? 0) > 0;

  const filename = [
    offer?.filename ?? 'features',
    // Tells a file of everything from one of what a circle covered.
    narrowed ? `within-${Math.round(selection.radius ?? 0) || 'shape'}` : null,
    timeScoped ? `${range.from}_${range.to}` : today()
  ].filter(Boolean).join('-');

  // In degrees, as every format here expects. Converted on the click, not on every render.
  const written = () => inDegrees(source, srid, map);

  // Per feature, since a set is often two kinds of thing and a row's `name` field may belong to only one.
  const nameOf = (feature) => {
    const named = offer?.name ? valueAt(feature?.properties, offer.name) : null;
    return named === null || named === undefined || named === '' ? nameFor(drawnWith?.(feature), feature) : String(named);
  };

  const columns = { fields: offer?.fields, exclude: offer?.exclude, labelResolver };

  const saveGeoJSON = () => download(`${filename}.geojson`, toGeoJSON(written()), 'application/geo+json');
  const saveCSV = () => download(`${filename}.csv`, toCSV(written(), columns), 'text/csv;charset=utf-8');
  const saveKML = () => download(`${filename}.kml`, toKML(written(), { ...columns, nameOf }), 'application/vnd.google-earth.kml+xml');

  // Deflating is async, but finishes well inside the time a browser counts a download as the click's.
  const saveShapefile = async () =>
    download(`${filename}.zip`, await zip(toShapefile(written(), { ...columns, stem: filename })), 'application/zip');

  return { offer, canExport, saveGeoJSON, saveCSV, saveKML, saveShapefile };
};
