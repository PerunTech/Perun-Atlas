import { React } from 'perun-core';
import { core } from '../spatial';
import { descriptorOf, fetchGeometry } from '../data';
import { detailsFor, labelFor, labelVisible, pathOptions, popupFor, variantOf } from '../style';
import { applyStyle, asNode } from './dom';
import { popupElement, POPUP_OPTIONS } from './popup';
import '../style/features.css';

const { Map, factory } = core;
const { useEffect, useRef } = React;

/**
 * A path's points, end to end reversed.
 *
 * Nested arrays are a line in several parts: each part is reversed and so is
 * their order, so the whole path still reads from one end through to the other.
 */
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
 */
export const FeatureSet = ({
  servicePath,
  context,
  descriptors = {},
  descriptorFor,
  fit = true,
  tooltip,
  popup,
  labelResolver,
  onFeatureClick,
  onLegend,
  onLoadStart,
  onLoad,
  onError
}) => {
  const layerRef = useRef(null);
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
    const entryFor = (feature) => variantOf(descriptors[nameOf(feature)], feature);

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
        if (labelVisible(descriptor, zoom)) layer.openTooltip();
        else layer.closeTooltip();
      });
    };

    const clear = () => {
      labelledRef.current = [];
      if (layerRef.current) {
        Map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
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

        const group = factory.geoJSON(collection, {
          // spatial draws its markers as styled divs, so the look is a class, a
          // style, or both — see `applyStyle`.
          pointToLayer: (feature, latlng) => {
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
            const content = descriptor.details && !popup ? null : contentFor(feature, descriptor);
            if (content) layer.bindPopup(content, POPUP_OPTIONS);

            // Both, when both are given. A popup says what the feature is; the
            // callback is how a screen reacts to it — selecting a row, opening
            // the record — and a screen that wants only one supplies only one.
            if (onFeatureClick) {
              layer.on('click', () => onFeatureClick(feature, detailsFor(descriptor, feature, labelResolver)));
            }
          }
        }).addTo(Map);

        layerRef.current = group;

        // Direction, drawn on the lines themselves. Decorators are separate
        // layers, so they join the same group and are removed with it.
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

          factory.polylineDecorator(path, {
            patterns: [{
              offset: arrow.offset ?? '12%',
              repeat: arrow.repeat ?? 160,
              symbol: factory.Symbol.arrowHead({
                pixelSize: arrow.pixelSize ?? 12,
                polygon: false,
                pathOptions: { stroke: true, weight: 2, color: layer.options.color, opacity: 1 }
              })
            }]
          }).addTo(group);
        });

        onLegend?.(Object.values(drawnKinds));

        syncLabels();
        Map.on('zoomend', syncLabels);

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
      Map.off('zoomend', syncLabels);
      clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servicePath, contextKey]);

  return null;
};
