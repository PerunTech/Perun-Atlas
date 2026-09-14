import { React } from 'perun-core';
import { core } from '../spatial';
import { descriptorOf, fetchGeometry } from '../data';
import { labelFor, labelVisible, pathOptions } from '../style';
import '../style/features.css';

const { Map, factory } = core;
const { useEffect, useRef } = React;

/**
 * A descriptor's own styling, applied to the element Leaflet built.
 *
 * A marker and a label are Leaflet's elements rather than this component's, so a
 * descriptor that wants a colour has two ways to ask for one: name a class the
 * consumer's stylesheet defines, or carry the declarations itself. The second is
 * what lets a whole descriptor live in configuration — a screen described in a
 * menu table has no stylesheet to name, and shipping one for it would put the
 * look back into code.
 *
 * Assigned onto the element's style object rather than written into markup: the
 * values arrive from configuration, and a property assignment cannot inject
 * anything, while an html string could. Keys are camelCase, as the CSSOM spells
 * them ('borderRadius'), and custom properties are set by name. A declaration
 * the browser rejects is dropped, which is what an unknown property in a
 * stylesheet does too.
 */
const applyStyle = (element, style) => {
  if (!element || !style) return;
  Object.entries(style).forEach(([property, value]) => {
    if (property.startsWith('--')) element.style.setProperty(property, value);
    else element.style[property] = value;
  });
};

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
 *   arrow   { pixelSize, repeat, offset } — direction markers along a line
 *
 * @param {string} servicePath - Path with {token} placeholders.
 * @param {Object} context     - The values those placeholders resolve against.
 * @param {Object} descriptors - Descriptor name to the above. Caller-owned.
 * @param {Function} [descriptorFor] - Per-feature override; see `nameOf` below.
 */
export const FeatureSet = ({
  servicePath,
  context,
  descriptors = {},
  descriptorFor,
  fit = true,
  tooltip,
  onFeatureClick,
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

    const draw = async () => {
      try {
        const collection = await fetchGeometry(servicePath, context);
        if (cancelled) return;

        clear();

        const group = factory.geoJSON(collection, {
          // spatial draws its markers as styled divs, so the look is a class, a
          // style, or both — see `applyStyle`.
          pointToLayer: (feature, latlng) => {
            const { marker = {} } = descriptors[nameOf(feature)] ?? {};
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

          style: (feature) => pathOptions(descriptors[nameOf(feature)]),

          onEachFeature: (feature, layer) => {
            const descriptor = descriptors[nameOf(feature)] ?? {};

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
              layer.bindTooltip(text, {
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

            if (onFeatureClick) layer.on('click', () => onFeatureClick(feature));
          }
        }).addTo(Map);

        layerRef.current = group;

        // Direction, drawn on the lines themselves. Decorators are separate
        // layers, so they join the same group and are removed with it.
        group.eachLayer((layer) => {
          const arrow = descriptors[nameOf(layer.feature)]?.arrow;
          if (!arrow || typeof layer.getLatLngs !== 'function') return;

          factory.polylineDecorator(layer, {
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
