import { React } from 'perun-core';
import { core } from '../spatial';
import { fetchGeometry } from '../data';
import { colourBy, joinStatus, pathOptions } from '../style';

const { Map, factory } = core;
const { useEffect, useRef } = React;

/**
 * Polygons fetched by bounding box, filled by a categorical attribute.
 *
 * The first consumer is an epidemiology screen: administrative units from
 * SVAROG_SDI_UNITS, coloured by the disease status recorded against each area. The
 * geometry and the status come from different tables, so `statusRows` and `join`
 * exist to marry them in the browser rather than requiring a bespoke endpoint per
 * screen.
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

  useEffect(() => {
    let cancelled = false;
    const fill = colourBy({ field, palette });

    const draw = async () => {
      try {
        const collection = await fetchGeometry(servicePath, { map: { bbox: Map.getBBox() } });
        if (cancelled) return;

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
        console.error('movement-atlas: choropleth failed to render', err);
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
