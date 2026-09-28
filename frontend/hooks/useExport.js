import { inDegrees, toCSV, toGeoJSON, toKML, valueAt } from '../data';
import { nameFor } from '../appearance';
import { download } from '../lib/dom';
import { today } from '../lib/dates';

/**
 * Offering the set on screen as a file.
 *
 * No state of its own: everything here is decided from the set that arrived and
 * the row that asked for the buttons, which is why it reads as a handful of
 * derivations rather than a hook. It is one because the panel should not have to
 * hold three filenames and three writers to render three buttons.
 *
 * @param {Object} params
 * @param {Object} params.set          - The collection currently drawn, or null.
 * @param {Object} [params.selection]  - What a drawn shape caught, from
 *        `useSelection`. While a shape has caught something the buttons write
 *        that rather than the whole set -- which is the point of drawing one on
 *        a screen that offers files, and is why the filename says so.
 * @param {boolean|Object} params.exportable - `false` to withhold the buttons, or
 *        `{ filename, fields, exclude, name, geojson, csv, kml }`.
 * @param {Function} [params.labelResolver]
 * @param {boolean} params.timeScoped  - Whether the screen has a date window.
 * @param {{from: string, to: string}} params.range
 * @param {number} [params.srid]       - The projection the set is stored in.
 *        Every file is written in WGS 84 longitude and latitude, so the set is
 *        converted out of this first. The map's own projection is assumed
 *        without one, as `latLngOf` assumes it.
 * @param {Function} [params.drawnWith] - The descriptor a feature is drawn
 *        with, its variant merged in. A KML placemark takes its name from it
 *        when the row's `name` gives none.
 */
export const useExport = ({ set, selection, exportable, labelResolver, timeScoped, range, srid, drawnWith }) => {
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

  /**
   * What the buttons write: the whole set, or what a drawn shape caught.
   *
   * Only while the shape has caught something. An empty selection is a shape
   * mid-draw or one over nothing, and swapping a full file for an empty one
   * because a reader clicked a centre would be the worst moment to do it -- so
   * until the circle covers a feature the buttons go on offering the set.
   */
  const narrowed = Boolean(selection?.selecting && selection.feedsExport && selection.count > 0)
  const source = narrowed ? { type: 'FeatureCollection', features: selection.inside } : set

  const canExport = offer && source && (source.features?.length ?? 0) > 0

  /**
   * What the file is called.
   *
   * The range when there is one, the day when there is not, so two exports of
   * the same screen do not land in a downloads folder as `features (3)`. The
   * stem is the caller's, because this file has no idea what the set is.
   */
  const filename = [
    offer?.filename ?? 'features',
    // Which question this file answers. Two files from one screen an hour apart
    // -- one of everything, one of what a circle covered -- are otherwise the
    // same name and a guess about which is which.
    narrowed ? `within-${Math.round(selection.radius ?? 0) || 'shape'}` : null,
    timeScoped ? `${range.from}_${range.to}` : today()
  ].filter(Boolean).join('-')

  /**
   * The set as the files hold it: in degrees.
   *
   * Converted once, here, before any writer sees it, so the writers stay
   * strings in and strings out and none of them has to know a projection. The
   * CSV's latitude and longitude and its WKT column come out in degrees with
   * no change to `toCSV`.
   *
   * On the click rather than on every render: the panel renders far more often
   * than anyone saves a file, and a copy of the whole set each time would be
   * work thrown away.
   */
  const written = () => inDegrees(source, srid)

  /**
   * What a KML placemark is called.
   *
   * The row's `name` field, when the row names one and this feature has a value
   * there. Otherwise whatever the feature's descriptor already calls it on the
   * map: its label, then its popup's or its pane's title. Nothing when neither
   * says, and the placemark goes without a name rather than with a made-up one.
   *
   * Decided per feature rather than per set, because a set is routinely two
   * kinds of thing and a row's field often belongs to only one of them. Sites
   * have a name and the lines between them do not, so a line falls back to its
   * own descriptor rather than coming out blank.
   */
  const nameOf = (feature) => {
    const named = offer?.name ? valueAt(feature?.properties, offer.name) : null
    return named === null || named === undefined || named === '' ? nameFor(drawnWith?.(feature), feature) : String(named)
  }

  const columns = { fields: offer?.fields, exclude: offer?.exclude, labelResolver }

  const saveGeoJSON = () => download(`${filename}.geojson`, toGeoJSON(written()), 'application/geo+json')
  const saveCSV = () => download(`${filename}.csv`, toCSV(written(), columns), 'text/csv;charset=utf-8')
  const saveKML = () => download(`${filename}.kml`, toKML(written(), { ...columns, nameOf }), 'application/vnd.google-earth.kml+xml')

  return { offer, canExport, saveGeoJSON, saveCSV, saveKML }
}
