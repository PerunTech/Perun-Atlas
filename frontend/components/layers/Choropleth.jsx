import { React } from 'perun-core';
import { core } from '../../spatial';
import { fetchGeometry } from '../../data';
import { categoriesDrawn, colourBy, detailsFor, joinStatus, pathOptions, popupFor } from '../../style';
import { asNode } from '../lib/dom';
import { popupElement, POPUP_OPTIONS } from '../lib/popup';

const { Map, factory } = core;
const { useEffect, useRef } = React;

/**
 * Polygons fetched by bounding box, filled by a categorical attribute.
 *
 * The polygons and the thing they are coloured by usually come from different
 * places — one service serves the geometry, another the records carrying the
 * category — so `statusRows` and `join` exist to marry them in the browser
 * rather than requiring a bespoke endpoint per screen.
 *
 * Refetches when the map stops moving, because the service is bbox-scoped.
 *
 * `descriptor.popup` — `{ title, fields: [{ label, field }] }` — puts the detail
 * behind an area on a click, which is where a joined status belongs: the fill
 * says which band an area is in, and the popup says what it actually is. Name a
 * joined field the way `joinStatus` wrote it — under its `as` key, so
 * `status.<column>` unless the caller renamed it.
 *
 * `labelResolver` turns those field labels into display text, for descriptors
 * that arrive from configuration carrying label codes rather than words, and the
 * popup's `style`, `titleStyle`, `labelStyle` and `valueStyle` carry its look the
 * way `marker` and `label` carry theirs elsewhere.
 *
 * `onLegend` reports what each draw actually coloured --
 * `{ values, usedFallback }`, which is `legendFromPalette`'s own argument. It
 * fires on every draw rather than once, because this layer refetches as the map
 * moves and the categories on screen move with it: a key naming a band that
 * scrolled off is the same wrong answer as a key missing one that scrolled on.
 * Reported from the features drawn rather than read out of the palette, for the
 * reason `FeatureSet` reports its own kinds that way -- a deployment configures
 * more bands than any one bounding box contains.
 *
 * `onLoadStart`, `onLoad` and `onError` are `FeatureSet`'s, and mean the same
 * here: the edges of a fetch, so a caller showing progress has the beginning as
 * well as the result. They fire on every draw, because every pause on this map
 * is another request -- a panel that showed a spinner once would be silent for
 * the ones that matter, which are the ones the reader waits on.
 *
 * `onFeatureClick` is handed `(feature, details)` as `FeatureSet` hands it, with
 * `details` resolved from this layer's own descriptor, so a caller can show a
 * record beside the map without reading a descriptor itself.
 */
export const Choropleth = ({
  servicePath,
  statusRows,
  join,
  field,
  palette,
  descriptor,
  onFeatureClick,
  onLegend,
  onLoadStart,
  onLoad,
  onError,
  tooltip,
  popup,
  labelResolver
}) => {
  const layerRef = useRef(null);
  const requestRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const fill = colourBy({ field, palette });

    const draw = async () => {
      /**
       * Which fetch this is.
       *
       * Every `moveend` starts one, and they can land out of order: pan twice
       * over an uneven connection and the first response arrives last, removes
       * the layer the second one drew, and redraws the map with polygons for a
       * bounding box the user has already left. `cancelled` does not cover it —
       * it guards unmount, and both of these fetches belong to a mounted
       * component. Only the newest request may touch the map.
       */
      const request = ++requestRef.current;

      try {
        onLoadStart?.();
        const collection = await fetchGeometry(servicePath, { map: { bbox: Map.getBBox() } });
        if (cancelled || request !== requestRef.current) return;

        const joined = join && statusRows
          ? joinStatus(collection, statusRows, join)
          : collection;

        if (layerRef.current) Map.removeLayer(layerRef.current);

        layerRef.current = factory.geoJSON(joined, {
          style: (feature) => pathOptions(descriptor, { fillColor: fill(feature) }),
          onEachFeature: (feature, layer) => {
            const text = tooltip?.(feature);
            // A text node, not the string: Leaflet applies string content
            // with innerHTML, and this one comes from a record's field.
            if (text) layer.bindTooltip(asNode(text), { sticky: true });

            const supplied = popup?.(feature);
            const rows = popup ? null : popupFor(descriptor, feature, labelResolver);
            const content = supplied !== undefined && supplied !== null
              ? asNode(supplied)
              : (rows ? popupElement(rows, descriptor?.popup) : null);
            if (content) layer.bindPopup(content, POPUP_OPTIONS);

            if (onFeatureClick) {
              layer.on('click', () => onFeatureClick(feature, detailsFor(descriptor, feature, labelResolver)));
            }
          }
        }).addTo(Map);

        // After the draw, and from what was drawn: the join runs first, so a
        // category living on a joined record is there to be read by now. The
        // joined collection goes out too, since it is what is on the screen --
        // a caller offering the set as a file should offer that one.
        onLegend?.(categoriesDrawn(joined?.features, { field, palette }));
        onLoad?.(joined);
      } catch (err) {
        console.error('perun-atlas: choropleth failed to render', err);
        // The guarded returns above leave early without ending the fetch, which
        // is right: a superseded request did not fail, it stopped mattering, and
        // the one that superseded it will end it. A throw is the other case.
        if (!cancelled && request === requestRef.current) onError?.(err);
      }
    };

    /**
     * One fetch per pause, not one per `moveend`.
     *
     * Leaflet fires `moveend` at the end of every drag and every zoom, and a
     * reader finding an area does several in a row. Each one was a bbox request
     * that went out, came back and was decoded in full before the guard above
     * threw it away -- the guard keeps the map right, it does not keep the
     * request from being made.
     *
     * Short enough not to feel like lag on a single pan, long enough that a
     * burst collapses into one. The trailing edge is the one that matters: the
     * bbox worth asking about is the one the reader stopped on.
     */
    let pending = null;
    const later = () => {
      clearTimeout(pending);
      pending = setTimeout(draw, 250);
    };

    draw();
    Map.on('moveend', later);

    return () => {
      cancelled = true;
      clearTimeout(pending);
      Map.off('moveend', later);
      if (layerRef.current) {
        Map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servicePath, field, statusRows]);

  return null;
};
