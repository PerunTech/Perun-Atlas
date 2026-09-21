import { toCSV, toGeoJSON } from '../data';
import { download } from '../components/lib/dom';
import { today } from '../components/lib/dates';

/**
 * Offering the set on screen as a file.
 *
 * No state of its own: everything here is decided from the set that arrived and
 * the row that asked for the buttons, which is why it reads as a handful of
 * derivations rather than a hook. It is one because the panel should not have to
 * hold two filenames and a pair of writers to render two buttons.
 *
 * @param {Object} params
 * @param {Object} params.set          - The collection currently drawn, or null.
 * @param {boolean|Object} params.exportable - `false` to withhold the buttons, or
 *        `{ filename, fields, exclude, geojson, csv }`.
 * @param {Function} [params.labelResolver]
 * @param {boolean} params.timeScoped  - Whether the screen has a date window.
 * @param {{from: string, to: string}} params.range
 */
export const useExport = ({ set, exportable, labelResolver, timeScoped, range }) => {
  /**
   * How this set is offered as a file, or nothing.
   *
   * On unless a menu row says otherwise. The set is already on screen and
   * already in the browser -- `PERUN_ATLAS_LAST` holds the whole response --
   * so withholding the buttons withholds the convenience rather than the data,
   * and every screen that wanted them would have to remember to ask. `false`
   * turns them off for a screen where saving the set is the wrong offer.
   *
   * Only offered once a set has actually arrived and has something in it -- a
   * button that writes an empty file is worse than no button, because it looks
   * like the export worked.
   */
  const offer = exportable === false ? null : (exportable && exportable !== true ? exportable : {})
  const canExport = offer && set && (set.features?.length ?? 0) > 0

  /**
   * What the file is called.
   *
   * The range when there is one, the day when there is not, so two exports of
   * the same screen do not land in a downloads folder as `features (3)`. The
   * stem is the caller's, because this file has no idea what the set is.
   */
  const filename = [offer?.filename ?? 'features', timeScoped ? `${range.from}_${range.to}` : today()].join('-')

  const saveGeoJSON = () => download(`${filename}.geojson`, toGeoJSON(set), 'application/geo+json')
  const saveCSV = () => download(`${filename}.csv`, toCSV(set, { fields: offer?.fields, exclude: offer?.exclude, labelResolver }), 'text/csv;charset=utf-8')

  return { offer, canExport, saveGeoJSON, saveCSV }
}
