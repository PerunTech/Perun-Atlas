import { React } from 'perun-core';
import { core } from '../../spatial';
import { fetchGeometry } from '../../data/geometry';
import { joinStatus } from '../../data/join';
import { bboxIn } from '../../data/project';
import { detailsFor, pathOptions } from '../../appearance/descriptor';
import { bandOf, categoriesDrawn, colourBy } from '../../appearance/choropleth';
import { useKeyFilter } from '../../hooks/useKeyFilter';
import { asNode } from '../../lib/dom';
import { changesFor, restack, shownOf } from '../../lib/features/filter';
import { popupContent, POPUP_OPTIONS } from '../../lib/features/popup';
import { useAtlasMap } from '../context';

const { factory } = core;
const { useEffect, useRef } = React;

const NONE = [];

// Polygons fetched by bounding box and filled by a category, which `statusRows` and `join` may bring
// from another service. Refetches after each pause in panning; `{map.bbox}` is merged over `context`
// per request. `reload` only means "ask again".
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
  const map = useAtlasMap();
  const layerRef = useRef(null);
  const requestRef = useRef(0);

  const { hiddenRef, filterRef } = useKeyFilter(hidden);

  useEffect(() => {
    let cancelled = false;
    const fill = colourBy({ field, palette, fallback });
    const band = bandOf({ field, palette });

    const draw = async () => {
      // Responses can land out of order, so only the newest request may touch the map.
      const request = ++requestRef.current;

      fetched = { zoom: map.getZoom(), bounds: map.getBounds() };

      try {
        onLoadStart?.();
        // The bounding box last, so it wins over a caller's `map` key.
        const collection = await fetchGeometry(servicePath, {
          ...(context || {}),
          map: { ...(context?.map || {}), bbox: bboxIn(srid, map) }
        });
        if (cancelled || request !== requestRef.current) return;

        const joined = join && statusRows
          ? joinStatus(collection, statusRows, join)
          : collection;

        if (layerRef.current) map.removeLayer(layerRef.current);

        const members = [];

        const group = factory.geoJSON(joined, {
          // This map's projection, not the page's.
          crs: map.getCRS(),
          style: (feature) => pathOptions(descriptor, { fillColor: fill(feature) }),
          onEachFeature: (feature, layer) => {
            members.push({ layer, feature, key: band(feature), hidden: false });

            const text = tooltip?.(feature);
            // A text node, since Leaflet applies string content with innerHTML.
            if (text) layer.bindTooltip(asNode(text), { sticky: true });

            const content = popupContent(feature, descriptor, { popup, labelResolver });
            if (content) layer.bindPopup(content, POPUP_OPTIONS);

            if (onFeatureClick) {
              layer.on('click', () => onFeatureClick(feature, detailsFor(descriptor, feature, labelResolver)));
            }
          }
        });

        // Out of the group rather than faded, so a hidden area takes no click or hover.
        const filter = (keys) => {
          const { leaving, returning } = changesFor(members, keys);
          leaving.forEach(({ layer }) => group.removeLayer(layer));
          returning.forEach(({ layer }) => group.addLayer(layer));
          if (returning.length) restack(members);
          return leaving.length > 0 || returning.length > 0;
        };

        // Before the group goes on the map, so a hidden band is never painted.
        filter(hiddenRef.current);
        layerRef.current = group.addTo(map);

        const report = (keys) => onShown?.(shownOf(joined, keys, band));

        filterRef.current = (keys) => {
          if (filter(keys)) report(keys);
        };

        // From every area drawn, hidden or not, so a band switched off stays in the key.
        onLegend?.(categoriesDrawn(joined?.features, { field, palette }));
        report(hiddenRef.current);
        onLoad?.(joined);
      } catch (err) {
        console.error('perun-atlas: choropleth failed to render', err);
        // A superseded request didn't fail; the newer one will end the fetch.
        if (!cancelled && request === requestRef.current) onError?.(err);
      }
    };

    // One fetch per pause rather than per `moveend`, of which a reader finding an area fires several.
    let pending = null;

    // `invalidateSize` fires `moveend` too, whenever the record pane opens and narrows the map. A view
    // inside the last one at the same zoom can only be a smaller container, so it needs no fetch.
    let fetched = null;
    const shrunk = () => Boolean(fetched)
      && map.getZoom() === fetched.zoom
      && fetched.bounds.contains(map.getBounds());

    const later = () => {
      clearTimeout(pending);
      pending = setTimeout(() => { if (!shrunk()) draw(); }, 250);
    };

    draw();
    map.on('moveend', later);

    return () => {
      cancelled = true;
      filterRef.current = null;
      clearTimeout(pending);
      map.off('moveend', later);
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
    // Compared by value: the context is rebuilt on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, servicePath, field, srid, reload, statusRows, JSON.stringify(context ?? {})]);

  return null;
};
