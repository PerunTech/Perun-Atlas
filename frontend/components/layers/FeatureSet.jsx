import { React } from 'perun-core';
import { core } from '../../spatial';
import { descriptorOf, fetchGeometry } from '../../data';
import { detailsFor, labelFor, pathOptions } from '../../appearance';
import { drawnKinds } from '../../appearance/legend';
import { useKeyFilter } from '../../hooks/useKeyFilter';
import { drawArrows } from '../../lib/arrows';
import { applyStyle } from '../../lib/dom';
import { changesFor, extentOf, restack, shownOf } from '../../lib/filter';
import { followClusters } from '../../lib/follow';
import { bindLabel, syncLabels } from '../../lib/labels';
import { popupContent, POPUP_OPTIONS } from '../../lib/popup';
import { placeKey } from '../../lib/route';
import { placeSet } from '../../lib/surface';
import { FIT_PADDING } from '../../lib/zoom';
import '../../style/features.css';

const { Map, factory } = core;
const { useEffect, useRef } = React;

/** Nothing switched off, as one array rather than a new one per render. */
const NONE = [];

/**
 * A geometry set, fetched once and drawn per descriptor.
 *
 * Services return mixed sets — points, lines and polygons in one response, each
 * feature carrying the descriptor its producer stamped on it. This draws by
 * descriptor rather than by geometry type, so what a feature looks like is a
 * property of the data and of the caller's configuration, never of this file.
 * A set that grows a new kind of feature needs a descriptor entry and no code.
 *
 * Unlike `Choropleth` this does not refetch as the map moves. It is for sets
 * that are complete in one response rather than scoped to a bounding box, so
 * refetching on pan would re-request the same bytes and fight the user. It
 * fetches when the service path or its context changes, and frames the result.
 *
 * Descriptors are a map of descriptor name to `style`, `marker`, `label`,
 * `popup`, `arrow`, `variants`, `details` and `legend`; `docs/menu-row.md`
 * describes each. A descriptor carrying `details` binds no popup: see
 * `onFeatureClick`.
 *
 * @param {string} servicePath - Path with {token} placeholders.
 * @param {Object} context     - The values those placeholders resolve against.
 * @param {Object} descriptors - Descriptor name to the above. Caller-owned.
 * @param {Function} [descriptorFor] - Per-feature override; see `nameOf` below.
 * @param {Function} [labelResolver] - Turns a popup field's label into display
 *        text, for descriptors that arrive from configuration carrying label
 *        codes. Left out, a label is shown as written.
 * @param {Function} [onLoadStart] - Called as a fetch begins, before the request
 *        goes out. Paired with `onLoad` and `onError`, which end it -- a caller
 *        showing progress needs the edge, not just the result, because the
 *        interesting half of a slow request is the part before it answers.
 * @param {Function} [popup] - Per-feature popup content, replacing the descriptor's.
 *        Return an element for rich content, a string for plain text, or nothing
 *        for no popup. A returned string is rendered as text, never as markup.
 * @param {boolean|number|Object} [cluster] - Collapse the points into counted
 *        badges rather than drawing a marker each. `true` always, a number to
 *        cluster only from that many points up, or an object carrying `from`,
 *        anything the plugin takes, and `className` / `style` for the badge. See
 *        `clusterSettings`. Lines and polygons in the same set are untouched --
 *        only points cluster, and a mixed set keeps its shapes.
 * @param {Function} [onLegend] - Called once a set is drawn, with one entry per
 *        distinct kind that actually reached the map:
 *        `[{ name, value, descriptor, geometry }]`, where `value` is the variant
 *        case when one matched. Reported from the draw rather than read back out
 *        of `descriptors`, because a menu row routinely configures more kinds
 *        than any one response carries and a key listing absent ones is worse
 *        than no key. Shaped into something renderable by `legendFrom`.
 * @param {Function} [onFeatureClick] - Called with `(feature, details)`, where
 *        `details` is the feature's whole record as `detailsFor` resolved it, or
 *        null for a descriptor that declares none. Resolving it here rather than
 *        in the caller is what lets a panel show a record without reading a
 *        descriptor -- the one piece of its configuration a panel is not
 *        supposed to know the shape of.
 *
 * @param {Array} [hidden] - Legend keys switched off: the `key` of each entry
 *        `legendFrom` built out of `onLegend`'s report. Their features are taken
 *        off the map without a fetch, and put back the same way. Kept across
 *        draws, so a kind switched off stays off when the set is fetched again.
 * @param {Function} [onShown] - Called with the set as the reader now sees it,
 *        after every draw and every change to `hidden`. The fetched collection
 *        itself while nothing is hidden; a copy without the hidden features
 *        otherwise. For whatever reads the set after it is drawn -- a file, a
 *        circle's count -- so that it reads what is on the screen.
 * @param {Function} [onExtent] - Called alongside `onShown` with where the shown
 *        features are, as `[[south, west], [north, east]]` -- plain numbers, so a
 *        caller holding no engine can keep it and hand it to `AtlasMap` -- or
 *        null for a set with nothing to frame.
 *
 * `reload` is a number a caller changes when it knows the service would answer
 * differently now -- after a write, most of all. It reaches no URL and means
 * nothing to this layer beyond "ask again": a set is fetched by path and
 * context, and neither of those changes when a record is created behind them.
 */
export const FeatureSet = ({
  servicePath,
  context,
  reload,
  descriptors = {},
  descriptorFor,
  cluster,
  fit = true,
  tooltip,
  popup,
  labelResolver,
  pinned,
  hidden = NONE,
  onFeatureClick,
  onLegend,
  onShown,
  onExtent,
  onLoadStart,
  onLoad,
  onError
}) => {
  // Everything a draw put on the map, so a redraw can take it all off again.
  // A list rather than one layer: a clustered set is two or three, because the
  // cluster cannot be the home of every kind of layer. See `placeSet`.
  const layersRef = useRef([]);
  const labelledRef = useRef([]);

  // What the key has switched off, and how the draw on the map applies a
  // change to it. See `useKeyFilter`.
  const { hiddenRef, filterRef } = useKeyFilter(hidden);

  // Contexts are small flat objects rebuilt on every render, so compare by value
  // rather than by identity or the effect would refetch on each keystroke.
  const contextKey = JSON.stringify(context ?? {});

  useEffect(() => {
    let cancelled = false;

    /**
     * Which descriptor a feature is drawn with.
     *
     * The producer stamps one on every feature, which is the right answer about
     * the set and cannot say anything about the caller's own state — which
     * record is open, which row is selected, which of these is *here*. That is
     * what `descriptorFor` is for: return a name to draw one feature
     * differently, or nothing to leave the producer's choice alone.
     */
    const nameOf = (feature) => descriptorFor?.(feature) ?? descriptorOf(feature);

    // Each feature's descriptor with its variant merged in, and the kinds that
    // reached the map. See `drawnKinds`.
    const kinds = drawnKinds({ descriptors, nameOf });
    const { entryFor } = kinds;

    /** Permanent labels are banded by zoom, so they follow the zoom rather than the fetch. */
    const sync = () => syncLabels(labelledRef.current, Map.getZoom());

    const clear = () => {
      labelledRef.current = [];
      layersRef.current.forEach((layer) => Map.removeLayer(layer));
      layersRef.current = [];
    };

    /**
     * Where each marker is, and where each line thinks its ends are.
     *
     * `lib/route.js` says why the position is the join and what re-aiming an
     * end means; this is where the layers for it are collected.
     *
     * A null-prototype object rather than a `Map`, because `Map` in this file
     * is the engine's map singleton destructured from `core` above -- `new
     * Map()` here builds a Leaflet map, or throws. Null-prototype because the
     * keys are built from response data, and a position should never collide
     * with a member of `Object.prototype`.
     */
    const markerAt = Object.create(null);

    // Lines whose ends can be re-aimed, and the handlers to unbind.
    const routed = [];
    const cleanup = [];

    /** Features a menu row says must never be collapsed -- the subject, above all. */
    const isPinned = (feature) => Boolean(pinned?.(feature));

    /**
     * One entry per feature layer, in the order the producer sent them, with
     * the legend row it belongs to. What the legend's filter works through --
     * see `lib/filter.js`.
     */
    const members = [];

    const draw = async () => {
      try {
        onLoadStart?.();
        const collection = await fetchGeometry(servicePath, context);
        if (cancelled) return;

        clear();

        /**
         * How many markers this draw produced.
         *
         * Counted here rather than from the response, because the two differ:
         * one multi-point feature is one feature and several markers, and it is
         * markers that a browser struggles to draw. `pointToLayer` is called
         * once per point either way, so the count is exact and costs nothing.
         */
        let points = 0;

        const group = factory.geoJSON(collection, {
          // spatial draws its markers as styled divs, so the look is a class, a
          // style, or both — see `applyStyle`.
          pointToLayer: (feature, latlng) => {
            points += 1;
            const { marker = {} } = entryFor(feature) ?? {};
            const size = marker.size ?? 24;
            const point = factory.marker(latlng, {
              icon: factory.divIcon({
                className: marker.className ?? 'atlas-marker',
                iconSize: [size, size]
              })
            });
            // The element exists only once the marker is on the map, and again
            // after every redraw, so the style is applied on the event rather
            // than to the layer.
            if (marker.style) point.on('add', () => applyStyle(point.getElement(), marker.style));
            markerAt[placeKey(latlng)] = point;
            point._atlasPinned = isPinned(feature);
            return point;
          },

          style: (feature) => pathOptions(entryFor(feature)),

          onEachFeature: (feature, layer) => {
            const descriptor = entryFor(feature) ?? {};

            members.push({ layer, feature, key: kinds.note(feature), hidden: false });

            const text = tooltip ? tooltip(feature) : labelFor(descriptor, feature);
            if (text && bindLabel(layer, feature, descriptor, text)) {
              labelledRef.current.push({ layer, descriptor });
            }

            /**
             * A line with two ends that can be looked up, kept for re-aiming.
             *
             * Flat paths only: `getLatLngs` answers with nested arrays for a
             * MultiLineString or a polygon, and those have no single pair of
             * ends. A copy, because this is the geometry the producer sent and
             * the layer's own is about to be moved around.
             */
            if (typeof layer.getLatLngs === 'function') {
              const points = layer.getLatLngs();
              if (Array.isArray(points) && points.length >= 2 && !Array.isArray(points[0])) {
                routed.push({
                  layer,
                  original: points.map(({ lat, lng }) => factory.latLng(lat, lng)),
                  reverse: Boolean(descriptor.arrow?.reverse),
                  key: null
                });
              }
            }

            // A descriptor with `details` has somewhere with more room to show
            // a record, so it gets no bubble -- both would fire on one click,
            // and the bubble is the one that covers the map. An explicit
            // `popup` prop still wins: a caller building its own content has
            // said what it wants.
            const content = descriptor.details && !popup
              ? null
              : popupContent(feature, descriptor, { popup, labelResolver });
            if (content) layer.bindPopup(content, POPUP_OPTIONS);

            // Both, when both are given. A popup says what the feature is; the
            // callback is how a screen reacts to it — selecting a row, opening
            // the record — and a screen that wants only one supplies only one.
            if (onFeatureClick) {
              layer.on('click', () => onFeatureClick(feature, detailsFor(descriptor, feature, labelResolver)));
            }
          }
        });

        // On the map, plainly or clustered, with the groups that go beside a
        // cluster. See `placeSet`.
        const placed = placeSet({ map: Map, factory, group, cluster, points });
        const { surface, clustering, settings } = placed;
        layersRef.current = placed.layers;

        const decoratorOf = drawArrows({
          factory,
          group,
          into: placed.arrows,
          arrowOf: (feature) => entryFor(feature)?.arrow
        });

        /**
         * Take the switched-off kinds off the map and put the rest back.
         *
         * @returns {boolean} Whether anything moved.
         */
        const filter = (keys) => {
          const { leaving, returning } = changesFor(members, keys);

          placed.move(leaving, false, decoratorOf);
          placed.move(returning, true, decoratorOf);

          // Something put back came back on top of everything drawn after it.
          if (returning.length) restack(members, decoratorOf);

          return leaving.length > 0 || returning.length > 0;
        };

        /** What the panel reads after a draw or a filter: the set as shown, and its frame. */
        const report = (keys) => {
          onShown?.(shownOf(collection, keys, (feature) => kinds.kindOf(feature).key));
          onExtent?.(extentOf(members));
        };

        // Before the lines are routed and before the frame is taken, so both
        // see the set the reader asked for. The layers went on the map a few
        // lines up, in this same task, so nothing hidden is ever painted.
        filter(hiddenRef.current);

        /**
         * Lines follow their ends into the badge.
         *
         * A cluster moves a marker; the line ending on it does not hear about
         * it. `followClusters` re-aims each flat line at whatever the cluster is
         * drawing for its ends, and moves it there -- see `lib/follow.js` and
         * `lib/route.js` for why the end moves rather than the line hiding.
         */
        let following = null;
        if (clustering && routed.length) {
          following = followClusters({
            map: Map,
            surface,
            lines: routed,
            markerAt,
            decoratorOf,
            glide: settings.glide
          });
          cleanup.push(following);
        }

        onLegend?.(kinds.drawn());

        sync();
        Map.on('zoomend', sync);

        /**
         * Clustered markers arrive long after the draw, and bring labels with them.
         *
         * A clustered marker is not on the map, so its permanent label is not
         * either -- and Leaflet opens that label the moment the marker is added,
         * which is right at a zoom the band allows and wrong at every other one.
         * Only `syncLabels` knows which, and without a cluster it has nothing to
         * do after the draw but follow the zoom.
         *
         * A cluster also swaps markers in and out as the view is panned, at an
         * unchanged zoom, which `zoomend` never hears about. `moveend` hears
         * about both: Leaflet fires it after `zoomend` on a zoom, and on its own
         * after a pan. The cluster's own handlers were registered when it joined
         * the map, which was before these, so by the time this runs the markers
         * it is correcting are already there.
         */
        if (clustering) Map.on('moveend', sync);

        const extent = extentOf(members);
        if (fit && extent) Map.fitBounds(extent, { padding: FIT_PADDING });

        /**
         * A later change to what is switched off, applied to this draw.
         *
         * The map does not move. Switching a kind off is a question about what
         * to look at, not where, and a view that jumped on every click in the
         * key would lose the place the reader was reading. The frame is
         * reported instead, for the button that asks for it.
         */
        filterRef.current = (keys) => {
          if (!filter(keys)) return;
          following?.reroute();
          sync();
          report(keys);
        };

        report(hiddenRef.current);
        onLoad?.(collection);
      } catch (err) {
        if (cancelled) return;
        console.error('perun-atlas: feature set failed to render', err);
        onError?.(err);
      }
    };

    draw();

    return () => {
      cancelled = true;
      filterRef.current = null;
      cleanup.forEach((off) => off());
      Map.off('zoomend', sync);
      // Unconditionally: a draw that never clustered never registered this, and
      // taking off a handler that is not on is what Leaflet does with it anyway.
      Map.off('moveend', sync);
      clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servicePath, contextKey, reload]);

  return null;
};
