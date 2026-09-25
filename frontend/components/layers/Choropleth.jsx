import { React } from 'perun-core';
import { core } from '../../spatial';
import { bboxIn, fetchGeometry } from '../../data';
import { categoriesDrawn, colourBy, detailsFor, joinStatus, pathOptions, popupFor } from '../../appearance';
import { bandOf } from '../../appearance/choropleth';
import { asNode } from '../../lib/dom';
import { changesFor, restack, shownOf } from '../../lib/filter';
import { popupElement, POPUP_OPTIONS } from '../../lib/popup';

const { Map, factory } = core;
const { useEffect, useRef } = React;

/** Nothing switched off, as one array rather than a new one per render. */
const NONE = [];

/**
 * Polygons fetched by bounding box, filled by a categorical attribute.
 *
 * The polygons and the thing they are coloured by usually come from different
 * places — one service serves the geometry, another the records carrying the
 * category — so `statusRows` and `join` exist to marry them in the browser
 * rather than requiring a bespoke endpoint per screen.
 *
 * Refetches when the map stops moving, because the service is bbox-scoped --
 * except when the view only got smaller, which is a resized container rather
 * than a move and is already answered by what is on screen. See `shrunk`.
 *
 * `srid` is the projection the box is expressed in -- the deployment's
 * `sys.gis.default_srid`, because a geometry service compares the box against
 * stored coordinates rather than serving tiles. Left out, the map's own CRS is
 * used, which is the same answer wherever the two agree. See `bboxIn`.
 *
 * `context` is what the path's placeholders resolve against, as `FeatureSet`
 * takes it, with `{map.bbox}` merged over it per request because that one
 * changes with the view. Without it only the bounding box resolved here, and a
 * path wanting the session, the record or the deployment's SRID had to have them
 * substituted server-side before the configuration reached the browser -- which
 * works, and quietly makes half the placeholders in a menu row inert on this
 * layer and live on the other.
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
 *
 * `hidden` and `onShown` are `FeatureSet`'s, and mean the same here: the key's
 * rows the reader switched off, by the keys `legendFromPalette` gave them, and
 * the set as it now reads with those areas taken out. The keys hold across
 * draws, which on this layer is every pan: a band switched off stays off when
 * the reader moves on and the bands in view change under it. There is no
 * `onExtent`. The set is whatever is in view, so there is nothing to go back to.
 *
 * `reload` is a number a caller changes when it knows the service would answer
 * differently now -- after a write, most of all. It reaches no URL and means
 * nothing to this layer beyond "ask again": a set is fetched by path and
 * context, and neither of those changes when a record is created behind them.
 */
export const Choropleth = ({
  servicePath,
  context,
  reload,
  srid,
  statusRows,
  join,
  field,
  palette,
  fallback,
  descriptor,
  hidden = NONE,
  onFeatureClick,
  onLegend,
  onShown,
  onLoadStart,
  onLoad,
  onError,
  tooltip,
  popup,
  labelResolver
}) => {
  const layerRef = useRef(null);
  const requestRef = useRef(0);

  // As in `FeatureSet`: the keys a draw applies are the ones current when its
  // response lands, and the draw leaves behind how to apply the next ones.
  const hiddenRef = useRef(hidden);
  hiddenRef.current = hidden;
  const filterRef = useRef(null);
  const hiddenKey = JSON.stringify(hidden);

  useEffect(() => {
    let cancelled = false;
    // `fallback` reaches the key as well as the fill, so a deployment that
    // chose its own unclassified colour sees that colour in both places.
    const fill = colourBy({ field, palette, fallback });
    const band = bandOf({ field, palette });

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

      // The view this answer will be for, kept so that a later `moveend` can be
      // measured against it. See `shrunk`.
      fetched = { zoom: Map.getZoom(), bounds: Map.getBounds() };

      try {
        onLoadStart?.();
        // The bounding box last, so it wins: it is the one value this layer owns,
        // and a caller's `map` key is about the map's controls, not its extent.
        const collection = await fetchGeometry(servicePath, {
          ...(context || {}),
          map: { ...(context?.map || {}), bbox: bboxIn(srid) }
        });
        if (cancelled || request !== requestRef.current) return;

        const joined = join && statusRows
          ? joinStatus(collection, statusRows, join)
          : collection;

        if (layerRef.current) Map.removeLayer(layerRef.current);

        // One per area, in draw order, with the band it is filled from. See
        // `lib/filter.js`.
        const members = [];

        const group = factory.geoJSON(joined, {
          style: (feature) => pathOptions(descriptor, { fillColor: fill(feature) }),
          onEachFeature: (feature, layer) => {
            members.push({ layer, feature, key: band(feature), hidden: false });

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
        });

        /**
         * Take the switched-off bands out of the set, and put the rest back.
         *
         * Out of the group rather than faded, for `FeatureSet`'s reasons: a
         * hidden area takes no click and no hover. An area put back comes back
         * on top of its neighbours, so the shown ones are restacked into the
         * order they were drawn in.
         */
        const filter = (keys) => {
          const { leaving, returning } = changesFor(members, keys);
          leaving.forEach(({ layer }) => group.removeLayer(layer));
          returning.forEach(({ layer }) => group.addLayer(layer));
          if (returning.length) restack(members);
          return leaving.length > 0 || returning.length > 0;
        };

        // Before the group goes on the map, so a hidden band is never painted.
        filter(hiddenRef.current);
        layerRef.current = group.addTo(Map);

        const report = (keys) => onShown?.(shownOf(joined, keys, band));

        filterRef.current = (keys) => {
          if (filter(keys)) report(keys);
        };

        // After the draw, and from what was drawn: the join runs first, so a
        // category living on a joined record is there to be read by now. The
        // joined collection goes out too, since it is what is on the screen --
        // a caller offering the set as a file should offer that one.
        //
        // The key is built from every area drawn, hidden or not, so a band the
        // reader switched off stays in it to be switched back on.
        onLegend?.(categoriesDrawn(joined?.features, { field, palette }));
        report(hiddenRef.current);
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

    /**
     * The view the last fetch was made for, and whether this one is inside it.
     *
     * Not every `moveend` is a move. Leaflet fires it from `invalidateSize` as
     * well as from a drag, and `invalidateSize` is what `AtlasMap` calls when its
     * container changes size -- which happens every time the record pane opens,
     * because the map is the thing that gives way to it. So a click on an area
     * was answering itself with a request: open the pane, narrow the map, fire
     * `moveend`, fetch. Neither `options.pan` nor `debounceMoveend` suppresses
     * that event; the layer has to decide.
     *
     * The test is the honest one rather than a flag. At an unchanged zoom, a new
     * view that lies inside the one already fetched can only mean the container
     * got smaller: a pan always uncovers ground on the side it came from, and a
     * zoom moves the zoom. What is on screen is therefore already a superset of
     * what the request would answer, so there is nothing to ask for.
     *
     * A container that grows fails the containment test and is fetched, which is
     * what fills the strip the pane was covering when it closes. Every real move
     * fails it too, which is the whole of what this layer is for.
     */
    let fetched = null;
    const shrunk = () => Boolean(fetched)
      && Map.getZoom() === fetched.zoom
      && fetched.bounds.contains(Map.getBounds());

    const later = () => {
      clearTimeout(pending);
      pending = setTimeout(() => { if (!shrunk()) draw(); }, 250);
    };

    draw();
    Map.on('moveend', later);

    return () => {
      cancelled = true;
      filterRef.current = null;
      clearTimeout(pending);
      Map.off('moveend', later);
      if (layerRef.current) {
        Map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
    // Compared by value: the context is a small flat object rebuilt on every
    // render, so by identity this would refetch on each one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servicePath, field, srid, reload, statusRows, JSON.stringify(context ?? {})]);

  // A click in the key, applied to the areas already drawn -- not a fetch.
  useEffect(() => {
    filterRef.current?.(hidden);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hiddenKey]);

  return null;
};
