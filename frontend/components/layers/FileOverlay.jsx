import { React } from 'perun-core';
import { core } from '../../spatial';
import { fromDegrees } from '../../data/project';
import { useAtlasMap } from '../context';
import { OVERLAY_POINT, OVERLAY_STYLE, overlayRecord } from '../../appearance/overlay';
import { FIT_PADDING } from '../../lib/zoom';
import '../../style/overlay.css';

const { factory } = core;
const { useEffect, useRef } = React;

/**
 * Where a file's points are drawn: over the set's markers, under the labels.
 *
 * A file is opened to be compared with the set, and a waypoint on a site is the
 * comparison at its closest. In the default pane that ring is drawn under the
 * site's marker, twice its size, and cannot be seen at all. Leaflet's marker
 * pane is 600 and its tooltip pane, which holds the permanent labels, is 650.
 *
 * Only the points. A file's areas stay in the overlay pane, under the markers,
 * so a file's zone never covers the sites inside it or takes their clicks.
 */
const POINT_PANE = 'atlasFilePoints';
const POINT_PANE_Z = 620;

const pointPane = (map) => {
  if (!map.getPane(POINT_PANE)) map.createPane(POINT_PANE).style.zIndex = String(POINT_PANE_Z);
  return POINT_PANE;
};

/**
 * A file the reader opened, drawn over the map and nowhere else.
 *
 * Nothing about it leaves the browser: it is not fetched, not saved, and not
 * part of the set. So it is not in the files the panel writes, not in what a
 * circle counts, and not in the frame the zoom control's `fit` returns to --
 * the panel reads all of those from the set, and this never touches it.
 *
 * Drawn through the engine like `FeatureSet`, which is why the collection is
 * converted to stored units first: see `fromDegrees`. Renders nothing of its
 * own, and takes its layers off the map when the file is closed, replaced, or
 * the panel goes.
 *
 * @param {Object} [file] - `{ name, collection }`, the collection in degrees
 *        as `readFile` returned it. Nothing is drawn without one.
 * @param {string|number} [srid] - The EPSG code the deployment stores.
 * @param {boolean} [hidden] - Switched off in the key. Taken off the map
 *        without being rebuilt, and put back the same way.
 * @param {Function} [labelResolver] - Passed to `overlayRecord`.
 * @param {Function} [onFeatureClick] - Called with `(feature, details)`, in the
 *        shape `FeatureSet` calls it, so the panel opens the same pane.
 * @param {Function} [onDrawn] - Called once the file is on the map and framed,
 *        which on a large file is well after it was read. The panel's loading
 *        card waits for this.
 * @param {Function} [onError] - Called when the engine refuses to draw the
 *        file: a geometry the reader passed as well-formed and Leaflet did not.
 */
export const FileOverlay = ({ file, srid, hidden = false, labelResolver, onFeatureClick, onDrawn, onError }) => {
  const map = useAtlasMap();
  const groupRef = useRef(null);

  // Read when the file draws and when a feature is clicked, not when either is
  // set up, so the handlers bound to each layer see the panel's current ones.
  const hiddenRef = useRef(hidden);
  hiddenRef.current = hidden;
  const handlers = useRef({});
  handlers.current = { labelResolver, onFeatureClick, onDrawn, onError };

  // The file the map was last framed on, so a redraw for a new `srid` does not
  // move a view the reader has moved since.
  const framedRef = useRef(null);

  useEffect(() => {
    if (!file) return undefined;

    let group;
    try {
      group = factory.geoJSON(fromDegrees(file.collection, srid, map), {
        // Read back through this map's projection, the one `fromDegrees` fell
        // back on. An engine without the option reads the page's, which is the
        // same one.
        crs: map.getCRS(),
        pointToLayer: (feature, latlng) => factory.circleMarker(latlng, { ...OVERLAY_POINT, pane: pointPane(map) }),
        // By geometry, because a circle marker is a path too: Leaflet's GeoJSON
        // layer applies `style` to it after `pointToLayer`, and one style for
        // everything turned every ring into a faint dashed disc.
        style: (feature) => (/Point$/.test(feature?.geometry?.type ?? '') ? OVERLAY_POINT : OVERLAY_STYLE),
        onEachFeature: (feature, layer) => {
          layer.on('click', () => {
            const { labelResolver: resolve, onFeatureClick: open } = handlers.current;
            // Marked with the file it came from, so the panel can close the
            // pane when that file goes.
            open?.(feature, { ...overlayRecord(feature, file.name, resolve), file });
          });
        }
      });
    } catch (err) {
      console.error('perun-atlas: a file could not be drawn', err);
      handlers.current.onError?.(err);
      return undefined;
    }

    groupRef.current = group;
    if (!hiddenRef.current) group.addTo(map);

    /**
     * Framed once, when the file opens.
     *
     * The reader opened it to see it, and it may be nowhere near the view.
     * Only once: a later redraw is the same file, and the view is theirs by
     * then.
     */
    if (framedRef.current !== file) {
      framedRef.current = file;
      const bounds = group.getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: FIT_PADDING });
    }

    handlers.current.onDrawn?.();

    return () => {
      map.removeLayer(group);
      groupRef.current = null;
    };
  }, [map, file, srid]);

  // A click in the key. The layers are kept, so switching the file back on
  // costs nothing and does not move the view.
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    if (hidden) map.removeLayer(group);
    else if (!map.hasLayer(group)) group.addTo(map);
  }, [map, hidden]);

  return null;
};
