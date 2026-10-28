import { React } from 'perun-core';
import { core } from '../../spatial';
import { descriptorOf } from '../../data/feature';
import { fetchGeometry } from '../../data/geometry';
import { detailsFor, labelFor, pathOptions } from '../../appearance/descriptor';
import { drawnKinds } from '../../appearance/legend';
import { useKeyFilter } from '../../hooks/useKeyFilter';
import { drawArrows } from '../../lib/features/arrows';
import { applyStyle } from '../../lib/dom';
import { changesFor, extentOf, restack, shownOf } from '../../lib/features/filter';
import { followClusters } from '../../lib/features/follow';
import { bindLabel, syncLabels } from '../../lib/features/labels';
import { popupContent, POPUP_OPTIONS } from '../../lib/features/popup';
import { placeKey } from '../../lib/features/route';
import { placeSet } from '../../lib/features/surface';
import { FIT_PADDING } from '../../lib/zoom';
import { useAtlasMap } from '../context';
import '../../style/features.css';

const { factory } = core;
const { useEffect, useRef } = React;

const NONE = [];

// A mixed set drawn by each feature's descriptor rather than its geometry type. Fetched once per path
// and context, not per pan: it is for sets complete in one response. `docs/menu-row.md` describes the
// descriptor keys; `reload` only means "ask again".
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
  const map = useAtlasMap();
  // A clustered draw puts two or three layers on the map; see `placeSet`.
  const layersRef = useRef([]);
  const labelledRef = useRef([]);

  const { hiddenRef, filterRef } = useKeyFilter(hidden);

  // Compared by value: contexts are rebuilt on every render.
  const contextKey = JSON.stringify(context ?? {});

  useEffect(() => {
    let cancelled = false;

    // `descriptorFor` lets the caller override the producer's stamp for one feature, e.g. the open record.
    const nameOf = (feature) => descriptorFor?.(feature) ?? descriptorOf(feature);

    const kinds = drawnKinds({ descriptors, nameOf });
    const { entryFor } = kinds;

    const sync = () => syncLabels(labelledRef.current, map.getZoom());

    const clear = () => {
      labelledRef.current = [];
      layersRef.current.forEach((layer) => map.removeLayer(layer));
      layersRef.current = [];
    };

    // Null-prototype, since the keys come from response data.
    const markerAt = Object.create(null);

    const routed = [];
    const cleanup = [];

    const isPinned = (feature) => Boolean(pinned?.(feature));

    const members = [];

    const draw = async () => {
      try {
        onLoadStart?.();
        const collection = await fetchGeometry(servicePath, context);
        if (cancelled) return;

        clear();

        // Markers rather than features: one multi-point feature is several markers.
        let points = 0;

        const group = factory.geoJSON(collection, {
          // This map's projection, not the page's.
          crs: map.getCRS(),
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
            // The element exists only once on the map, and again after every redraw.
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

            // Flat lines only, since nested paths have no single pair of ends. Copied, because the
            // layer's own is about to be moved around.
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

            // A descriptor with `details` opens the pane instead, so no bubble covers the map as well.
            const content = descriptor.details && !popup
              ? null
              : popupContent(feature, descriptor, { popup, labelResolver });
            if (content) layer.bindPopup(content, POPUP_OPTIONS);

            if (onFeatureClick) {
              layer.on('click', () => onFeatureClick(feature, detailsFor(descriptor, feature, labelResolver)));
            }
          }
        });

        const placed = placeSet({ map, factory, group, cluster, points });
        const { surface, clustering, settings } = placed;
        layersRef.current = placed.layers;

        const decoratorOf = drawArrows({
          factory,
          group,
          into: placed.arrows,
          arrowOf: (feature) => entryFor(feature)?.arrow
        });

        const filter = (keys) => {
          const { leaving, returning } = changesFor(members, keys);

          placed.move(leaving, false, decoratorOf);
          placed.move(returning, true, decoratorOf);

          if (returning.length) restack(members, decoratorOf);

          return leaving.length > 0 || returning.length > 0;
        };

        const report = (keys) => {
          onShown?.(shownOf(collection, keys, (feature) => kinds.kindOf(feature).key));
          onExtent?.(extentOf(members));
        };

        // Before routing and framing, so both see the set the reader asked for.
        filter(hiddenRef.current);

        let following = null;
        if (clustering && routed.length) {
          following = followClusters({
            map,
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
        map.on('zoomend', sync);

        // Leaflet opens a clustered marker's label as the marker is added back, whatever the zoom band,
        // and a pan swaps markers without `zoomend`. `moveend` covers both.
        if (clustering) map.on('moveend', sync);

        const extent = extentOf(members);
        if (fit && extent) map.fitBounds(extent, { padding: FIT_PADDING });

        // Filtering never moves the map; the frame is reported for the fit button instead.
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
      map.off('zoomend', sync);
      map.off('moveend', sync);
      clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, servicePath, contextKey, reload]);

  return null;
};
