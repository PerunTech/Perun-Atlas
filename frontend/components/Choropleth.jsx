import { React } from 'perun-core';
import { core } from '../spatial';
import { fetchGeometry } from '../data';
import { colourBy, joinStatus, pathOptions } from '../style';

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
 */
export const Choropleth = ({
  servicePath,
  statusRows,
  join,
  field,
  palette,
  descriptor,
  onFeatureClick,
  tooltip
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
            if (text) layer.bindTooltip(text, { sticky: true });
            if (onFeatureClick) layer.on('click', () => onFeatureClick(feature));
          }
        }).addTo(Map);
      } catch (err) {
        console.error('perun-atlas: choropleth failed to render', err);
      }
    };

    draw();
    Map.on('moveend', draw);

    return () => {
      cancelled = true;
      Map.off('moveend', draw);
      if (layerRef.current) {
        Map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servicePath, field, statusRows]);

  return null;
};
