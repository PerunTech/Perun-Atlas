import { React } from 'perun-core';
import { core } from '../../spatial';
import { fromDegrees } from '../../data/project';
import { useAtlasMap } from '../context';
import { OVERLAY_POINT, OVERLAY_STYLE, overlayRecord } from '../../appearance/overlay';
import { FIT_PADDING } from '../../lib/zoom';
import '../../style/overlay.css';

const { factory } = core;
const { useEffect, useRef } = React;

// Points go above the set's markers (600) and below the labels (650), or a waypoint on a site is hidden
// under its marker. Areas stay below the markers so they never take the sites' clicks.
const POINT_PANE = 'atlasFilePoints';
const POINT_PANE_Z = 620;

const pointPane = (map) => {
  if (!map.getPane(POINT_PANE)) map.createPane(POINT_PANE).style.zIndex = String(POINT_PANE_Z);
  return POINT_PANE;
};

// Never part of the set, so not exported, counted or framed by `fit`. Converted to stored units first,
// since spatial's GeoJSON layer reads every position as stored.
export const FileOverlay = ({ file, srid, hidden = false, labelResolver, onFeatureClick, onDrawn, onError }) => {
  const map = useAtlasMap();
  const groupRef = useRef(null);

  // Read at draw and click time, so handlers bound to each layer see the panel's current ones.
  const hiddenRef = useRef(hidden);
  hiddenRef.current = hidden;
  const handlers = useRef({});
  handlers.current = { labelResolver, onFeatureClick, onDrawn, onError };

  // So a redraw for a new `srid` doesn't move a view the reader has moved since.
  const framedRef = useRef(null);

  useEffect(() => {
    if (!file) return undefined;

    let group;
    try {
      group = factory.geoJSON(fromDegrees(file.collection, srid, map), {
        crs: map.getCRS(),
        pointToLayer: (feature, latlng) => factory.circleMarker(latlng, { ...OVERLAY_POINT, pane: pointPane(map) }),
        // A circle marker is a path too, and GeoJSON applies `style` to it after `pointToLayer`.
        style: (feature) => (/Point$/.test(feature?.geometry?.type ?? '') ? OVERLAY_POINT : OVERLAY_STYLE),
        onEachFeature: (feature, layer) => {
          layer.on('click', () => {
            const { labelResolver: resolve, onFeatureClick: open } = handlers.current;
            // Tagged with its file, so the panel can close the pane when the file goes.
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

    // Framed once, when the file opens; after that the view is the reader's.
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

  // The layers are kept, so switching the file back on doesn't move the view.
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    if (hidden) map.removeLayer(group);
    else if (!map.hasLayer(group)) group.addTo(map);
  }, [map, hidden]);

  return null;
};
