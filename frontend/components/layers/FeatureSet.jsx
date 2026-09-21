import { React } from 'perun-core';
import { core } from '../../spatial';
import { descriptorOf, fetchGeometry } from '../../data';
import { detailsFor, labelFor, labelVisible, pathOptions, popupFor, variantOf } from '../../appearance';
import { clusterBadge, clusterSettings } from '../../lib/cluster';
import { applyStyle, asNode } from '../../lib/dom';
import { popupElement, POPUP_OPTIONS } from '../../lib/popup';
import { between, easeInOut, placeKey, routeEnds } from '../../lib/route';
import '../../style/features.css';

const { Map, factory } = core;
const { useEffect, useRef } = React;

/**
 * A path's points, end to end reversed.
 *
 * Nested arrays are a line in several parts: each part is reversed and so is
 * their order, so the whole path still reads from one end through to the other.
 */
/**
 * Past this many lines moving at once, they are placed rather than travelled.
 *
 * Redrawing a path and its arrow heads per frame is the cost, and a hundred and
 * fifty lines all sliding at once is not motion a reader can follow anyway.
 */
const GLIDE_LIMIT = 150;

const reversed = (points) =>
  Array.isArray(points?.[0])
    ? points.map(reversed).reverse()
    : [...(points ?? [])].reverse();

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
 * Descriptors are a map of descriptor name to:
 *
 *   style   Leaflet path options for lines and polygons
 *   marker  { className, size, style } for points — a class, CSS declarations,
 *           or both; `style` is what a descriptor kept in configuration uses,
 *           since it has no stylesheet of its own to name
 *   label   { field, scale: { min, max }, className, style, direction, offset } —
 *           a permanent label, banded by zoom
 *   popup   { title, fields: [{ label, field }], className, style, titleStyle,
 *           labelStyle, valueStyle } — the detail behind the label, opened on
 *           click; the label names the feature, this explains it
 *   arrow   { pixelSize, repeat, offset, reverse } — direction markers along a
 *           line; `reverse` turns the heads back the way the path came
 *   variants { by, cases } — one column splitting the kind in two, each case
 *           merged over everything above it. See `variantOf`
 *   details { title, exclude, className, style, titleStyle, labelStyle,
 *           valueStyle } — the whole record, for a caller that shows one
 *           somewhere with room. `exclude` names what to leave out on top of
 *           `SYSTEM_FIELDS`, which are never shown. A descriptor carrying this
 *           binds no popup: see `onFeatureClick`
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
  onFeatureClick,
  onLegend,
  onLoadStart,
  onLoad,
  onError
}) => {
  // Everything a draw put on the map, so a redraw can take it all off again.
  // A list rather than one layer: a clustered set is two, because the cluster
  // cannot be the home of every kind of layer. See `arrows` below.
  const layersRef = useRef([]);
  const labelledRef = useRef([]);

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

    /**
     * The descriptor a feature is drawn with, its variant already merged in.
     *
     * Every read of a descriptor goes through here rather than indexing the map
     * directly, so a variant reaches the marker, the label, the popup and the
     * arrow alike -- a colour that applied to the line but not to its arrow
     * heads would be the obvious way to get this half right.
     */
    const entries = new WeakMap();
    const entryFor = (feature) => {
      // Every feature is asked this two or three times in one draw -- the
      // marker or the path style, `onEachFeature`, and the arrow pass -- and
      // `variantOf` builds six objects each time it merges a case. Three times
      // six, per line, on a set large enough to want clustering, is work that
      // produces the same answer every time. Keyed by the feature itself, so
      // nothing has to be cleared and nothing is retained: the map is built per
      // draw and holds its keys weakly.
      if (entries.has(feature)) return entries.get(feature);
      const entry = variantOf(descriptors[nameOf(feature)], feature);
      entries.set(feature, entry);
      return entry;
    };

    /**
     * A feature's popup content, or nothing.
     *
     * `popup` overrides the descriptor entirely rather than merging with it, the
     * same way `descriptorFor` overrides the producer's choice: a caller that is
     * building its own content has already decided what the bubble says.
     */
    const contentFor = (feature, descriptor) => {
      if (popup) {
        const supplied = popup(feature);
        return supplied === undefined || supplied === null ? null : asNode(supplied);
      }
      const rows = popupFor(descriptor, feature, labelResolver);
      return rows ? popupElement(rows, descriptor?.popup) : null;
    };

    /** Permanent labels are banded by zoom, so they follow the zoom rather than the fetch. */
    const syncLabels = () => {
      const zoom = Map.getZoom();
      labelledRef.current.forEach(({ layer, descriptor }) => {
        const wanted = labelVisible(descriptor, zoom);

        /**
         * Nothing to do when the label is already in the state it should be in.
         *
         * Worth checking rather than just calling: `Layer.openTooltip` runs
         * `_prepareOpen` -- which walks the layer for a position -- *before*
         * Leaflet's own "this tooltip is already on the map" guard, so the
         * cheap case is only cheap if we take it ourselves. This runs on every
         * `moveend` while a set is clustered, which is every pan.
         *
         * It stays correct through the cluster because a permanent tooltip
         * closes itself with its marker (`remove: closeTooltip`) and reopens
         * when the cluster hands the marker back (`add: _openTooltip`). So a
         * marker returned at a zoom its band forbids reads as open here, which
         * is exactly the state this has to correct.
         */
        if (wanted === layer.isTooltipOpen()) return;

        if (wanted) layer.openTooltip();
        else layer.closeTooltip();
      });
    };

    const clear = () => {
      labelledRef.current = [];
      layersRef.current.forEach((layer) => Map.removeLayer(layer));
      layersRef.current = [];
    };

    /**
     * The distinct kinds this draw put on the map.
     *
     * Keyed by descriptor and variant case together, since one descriptor with
     * two cases is two things a reader has to tell apart. Insertion order is the
     * order the producer sent the features in, which is as much of an order as
     * there is and is at least stable within a set.
     *
     * A null-prototype object rather than a `Map`, because `Map` in this file is
     * the engine's map singleton destructured from `core` above -- `new Map()`
     * here builds a Leaflet map, or throws. Null-prototype because the keys are
     * built from response data and a feature named `constructor` should not
     * collide with a member of `Object.prototype`.
     */
    /**
     * Where each marker is, and where each line thinks its ends are.
     *
     * `lib/route.js` says why the position is the join and what re-aiming an
     * end means; this is where the layers for it are collected.
     */
    // A null-prototype object for the same reason `drawnKinds` is one: `Map`
    // in this file is the engine's map singleton, so `new Map()` builds a
    // Leaflet map or throws.
    const markerAt = Object.create(null);

    // Lines whose ends can be re-aimed, the decorator drawn on each, and the
    // handlers to unbind. A WeakMap for the decorators because the layers are
    // this draw's and go when it does.
    const routed = [];
    const decoratorOf = new WeakMap();
    const cleanup = [];

    /** Features a menu row says must never be collapsed -- the subject, above all. */
    const isPinned = (feature) => Boolean(pinned?.(feature));

    const drawnKinds = Object.create(null);

    const noteKind = (feature) => {
      const name = nameOf(feature);
      const configured = descriptors[name];
      const by = configured?.variants?.by;
      const raw = by ? feature?.properties?.[by] : undefined;

      // Only a value with a case behind it distinguishes anything: a column
      // carrying forty values and two cases splits the descriptor in two, not
      // in forty.
      const value = raw !== undefined && configured?.variants?.cases?.[raw] ? raw : undefined;

      const key = `${name ?? ''}::${value ?? ''}`;
      if (key in drawnKinds) return;

      drawnKinds[key] = {
        name,
        value,
        descriptor: entryFor(feature),
        geometry: feature?.geometry?.type
      };
    };

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

            noteKind(feature);

            const text = tooltip ? tooltip(feature) : labelFor(descriptor, feature);
            if (text) {
              // A point's label sits above it, not on it: a pill wide enough to
              // hold an identifier covers a marker completely, and then the
              // label is readable but the thing it names is not. An area has
              // room for both, so its label stays in the middle.
              const point = /Point$/.test(feature.geometry?.type ?? '');
              const clearance = (descriptor.marker?.size ?? 24) / 2;

              // Permanent, because a label of this kind names a feature rather
              // than explains it — a hover tooltip would hide the thing read.
              //
              // A text node, not the string. Leaflet applies string content with
              // innerHTML, and `text` is a record's field — so a holding named
              // with anything that parses as markup was parsed as markup.
              layer.bindTooltip(asNode(text), {
                permanent: true,
                direction: descriptor.label?.direction ?? (point ? 'top' : 'center'),
                offset: descriptor.label?.offset ?? (point ? [0, -clearance] : [0, 0]),
                // A descriptor may add a class of its own, so one label can be
                // marked out from the rest without restyling all of them.
                className: ['atlas-label', descriptor.label?.className].filter(Boolean).join(' '),
                // Opaque: Leaflet sets this inline, so a translucent label cannot
                // be made solid from a stylesheet, and translucent text over a
                // basemap is the thing being fixed.
                opacity: 1
              });
              // Same as a marker's: the pill is Leaflet's element, and it is
              // built when the tooltip opens, which a zoom band may do long after
              // this runs and more than once.
              if (descriptor.label?.style) {
                layer.on('tooltipopen', (event) => applyStyle(event.tooltip.getElement(), descriptor.label.style));
              }
              if (descriptor.label?.scale) labelledRef.current.push({ layer, descriptor });
            }

            // A descriptor with `details` has somewhere with more room to show
            // a record, so it gets no bubble -- both would fire on one click,
            // and the bubble is the one that covers the map. An explicit
            // `popup` prop still wins: a caller building its own content has
            // said what it wants.
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

            const content = descriptor.details && !popup ? null : contentFor(feature, descriptor);
            if (content) layer.bindPopup(content, POPUP_OPTIONS);

            // Both, when both are given. A popup says what the feature is; the
            // callback is how a screen reacts to it — selecting a row, opening
            // the record — and a screen that wants only one supplies only one.
            if (onFeatureClick) {
              layer.on('click', () => onFeatureClick(feature, detailsFor(descriptor, feature, labelResolver)));
            }
          }
        });

        /**
         * What actually goes on the map: the set itself, or a cluster over it.
         *
         * The set is built either way, and is what holds every layer this draw
         * made whether or not it is the thing added -- which is why the arrows
         * below and the bounds further down both read it rather than the
         * surface. The cluster reads it too, and takes a copy of what it finds
         * rather than emptying it.
         *
         * Only points cluster. The plugin sorts a mixed group itself: anything
         * with no position -- a line, a polygon, an arrow decorator -- goes to a
         * layer of its own that is added to the map unchanged, so a set of
         * shapes with points among them keeps its shapes.
         */
        // Where pinned layers go when there is a cluster. Empty and on the map
        // otherwise, which costs nothing and keeps the teardown one shape.
        const pinnedGroup = factory.featureGroup().addTo(Map);

        const settings = clusterSettings(cluster);

        /*
         * The clustering is the engine's, and the engine is a separate artefact
         * on a separate release cycle -- so a menu row can ask for it on a
         * deployment whose engine predates it. Drawn plainly rather than thrown
         * at, which is the same detection `AtlasMap` does for the bottom-centre
         * corner, and said out loud because a row asking for something it cannot
         * have is worth knowing about.
         */
        const clusterable = typeof factory.markerClusterGroup === 'function';
        if (settings !== null && !clusterable) {
          console.warn('perun-atlas: clustering was configured, but the map engine on this deployment does not carry it');
        }

        const clustering = settings !== null && clusterable && points >= settings.from;

        const surface = clustering
          ? factory.markerClusterGroup({
            ...settings.options,
            iconCreateFunction: (node) => {
              const { element, size, className } = clusterBadge(node.getChildCount(), settings.badge);
              return factory.divIcon({ html: element, className, iconSize: [size, size] });
            }
          })
          : group;

        surface.addTo(Map);

        // After the line above, not instead of it. `chunkedLoading` only chunks
        // when the group it is adding into is already on a map; handed the
        // layers first, the plugin adds them in one pass and the tab freezes for
        // exactly the sets this exists for.
        if (clustering) {
          /**
           * Everything except what a row pinned.
           *
           * The subject is the one point the screen exists to show, and it sits
           * in the middle of its own partners -- so it is the first thing a
           * badge swallows and the last thing that should vanish. Pinned layers
           * go to the map beside the cluster, where they are drawn at their own
           * position at every zoom.
           */
          const loose = [];
          group.eachLayer((layer) => {
            if (layer._atlasPinned) loose.push(layer);
            else surface.addLayer(layer);
          });
          loose.forEach((layer) => pinnedGroup.addLayer(layer));
        }

        /**
         * Where the arrow decorators go.
         *
         * Not into the cluster. A decorator is itself a layer group, and a
         * cluster group unwraps any group it is handed and keeps the children --
         * of which a decorator has none until something adds it to a map. Its
         * `onAdd` is what draws the heads, and the `moveend` it binds there is
         * what keeps them on the line as the view changes. Unwrapped, it is an
         * empty group: no heads, and nothing left to draw them later.
         *
         * So when there is a cluster the decorators get a group of their own
         * beside it, and otherwise they join the set exactly as they always
         * have.
         */
        const arrows = clustering ? factory.featureGroup().addTo(Map) : surface;

        layersRef.current = arrows === surface
          ? [surface, pinnedGroup]
          : [surface, arrows, pinnedGroup];

        // Direction, drawn on the lines themselves. Decorators are separate
        // layers, so they join a group rather than the map and come off with it.
        group.eachLayer((layer) => {
          const arrow = entryFor(layer.feature)?.arrow;
          if (!arrow || typeof layer.getLatLngs !== 'function') return;

          // Which way a head points is the order of the points, and
          // `Symbol.arrowHead` has no option to turn one around -- so an arrow
          // that has to point back is drawn on a reversed copy of the path
          // rather than on the layer.
          //
          // Which end that is belongs to the producer: a set of these paths is
          // emitted from the record the screen is about outwards, so a plain
          // arrow points away from it and a reversed one points at it.
          const path = arrow.reverse ? reversed(layer.getLatLngs()) : layer;

          decoratorOf.set(layer, factory.polylineDecorator(path, {
            patterns: [{
              offset: arrow.offset ?? '12%',
              repeat: arrow.repeat ?? 160,
              symbol: factory.Symbol.arrowHead({
                pixelSize: arrow.pixelSize ?? 12,
                polygon: false,
                pathOptions: { stroke: true, weight: 2, color: layer.options.color, opacity: 1 }
              })
            }]
          }).addTo(arrows));
        });

        /**
         * Lines follow their ends into the badge.
         *
         * A cluster moves a marker; the line that ends on it does not hear about
         * it, so it keeps pointing at ground where nothing is drawn. Hiding the
         * line instead is the obvious fix and the wrong one: the subject of a
         * movements screen sits among its own partners, so the badge that
         * swallows a partner usually swallows the subject too, and every line on
         * the screen would have a collapsed end at exactly the zooms worth
         * looking at.
         *
         * So the end moves to wherever the cluster is currently drawing it.
         * `getVisibleParent` walks up from a marker until it reaches something
         * with an icon on screen, which is the badge standing for it -- or the
         * marker itself, once the view is close enough to draw it. Zoomed right
         * in, every marker is its own parent and this restores the geometry the
         * producer sent, exactly.
         *
         * Only flat paths. A MultiLineString's nested rings have no single pair
         * of ends to move, and guessing at one would redraw a shape rather than
         * re-aim a line.
         */
        const visibleParentOf = (marker) => surface.getVisibleParent?.(marker);

        /** A line and its decorator, put where the arithmetic says. */
        const place = (line, points) => {
          line.layer.setLatLngs(points);

          // The decorator does not read the layer back on its own, and a
          // reversed one was handed a copy that cannot change at all -- so it
          // is given the new path rather than asked to redraw.
          const decorator = decoratorOf.get(line.layer);
          if (decorator) decorator.setPaths(line.reverse ? reversed(points) : line.layer);
        };

        /**
         * The ends travel rather than teleport.
         *
         * The cluster slides its markers into the badge over Leaflet's zoom
         * animation and then fires `animationend`, which is where this starts --
         * so without a tween the markers glide and the lines snap a beat later,
         * which reads as two separate things happening rather than one.
         *
         * The travel is not decoration: an end that moves tells the reader
         * *which* badge swallowed it, which is the whole question a collapsed
         * end raises. A jump leaves them to guess.
         *
         * Straight to the answer in three cases. A reader who has asked their
         * system for less motion gets none. A set past `GLIDE_LIMIT` lines is
         * both too expensive to redraw per frame and too busy to read as motion
         * anyway. And a row can turn it off, or set its own duration, with
         * `cluster: { glide: false }` or `{ glide: 400 }`.
         */
        const reducedMotion = typeof window !== 'undefined'
          && typeof window.matchMedia === 'function'
          && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        let frame = null;

        const travel = (moves) => {
          cancelAnimationFrame(frame);

          const from = moves.map(({ line }) => line.layer.getLatLngs());
          const began = performance.now();

          const step = (now) => {
            const t = Math.min(1, (now - began) / settings.glide);
            const eased = easeInOut(t);

            moves.forEach((move, i) => place(move.line, between(from[i], move.next, eased)));

            if (t < 1) frame = requestAnimationFrame(step);
            // Land on the target itself rather than on the last frame's
            // arithmetic, so a fully zoomed-in map holds the exact coordinates
            // the producer sent.
            else moves.forEach((move) => place(move.line, move.next));
          };

          frame = requestAnimationFrame(step);
        };

        const routeLines = () => {
          const moves = [];

          routed.forEach((line) => {
            const change = routeEnds(line, markerAt, visibleParentOf);
            if (!change) return;
            line.key = change.key;
            moves.push({ line, next: change.next });
          });

          if (!moves.length) return false;

          if (!settings.glide || reducedMotion || moves.length > GLIDE_LIMIT) {
            moves.forEach((move) => place(move.line, move.next));
          } else {
            travel(moves);
          }

          return true;
        };

        if (clustering && routed.length) {
          routeLines();
          // `animationend` is the cluster settling after a zoom; `moveend` covers
          // a pan, which swaps markers in and out without any animation.
          surface.on('animationend', routeLines);
          Map.on('moveend', routeLines);
          cleanup.push(() => {
            cancelAnimationFrame(frame);
            surface.off('animationend', routeLines);
            Map.off('moveend', routeLines);
          });
        }

        onLegend?.(Object.values(drawnKinds));

        syncLabels();
        Map.on('zoomend', syncLabels);

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
        if (clustering) Map.on('moveend', syncLabels);

        const bounds = group.getBounds();
        if (fit && bounds.isValid()) Map.fitBounds(bounds, { padding: [24, 24] });

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
      cleanup.forEach((off) => off());
      Map.off('zoomend', syncLabels);
      // Unconditionally: a draw that never clustered never registered this, and
      // taking off a handler that is not on is what Leaflet does with it anyway.
      Map.off('moveend', syncLabels);
      clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servicePath, contextKey, reload]);

  return null;
};
