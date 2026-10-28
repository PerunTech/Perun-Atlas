import { React, PropTypes } from 'perun-core';
import { core } from '../../spatial';
import { formatRatio, ratioFor } from '../../lib/zoom';
import { useAtlasMap } from '../context';

const { factory } = core;
const { useLayoutEffect } = React;

// Shared by the bar and the ratio, so the two readings of one measurement can't disagree.
const SCALE_WIDTH = 140;

// Leaflet's bar rather than spatial's ScaleControl, which renders nothing for a CRS built from a bare
// EPSG code. The ratio is measured across the bar's span, not derived from the zoom, so it holds off
// the Web Mercator grid too.
export const ScaleControl = ({ position = 'bottomleft', units, ratio = true }) => {
  const map = useAtlasMap();

  useLayoutEffect(() => {
    const metric = units !== 'imperial';
    const scale = factory.control
      .scale({ position, metric, imperial: !metric, maxWidth: SCALE_WIDTH })
      .addTo(map);

    if (!ratio) return () => { scale.remove(); };

    const line = factory.DomUtil.create('div', 'atlas-scale-ratio', scale.getContainer());

    const writeRatio = () => {
      const size = map.getSize();
      const y = Math.round(size.y / 2);
      const span = Math.min(size.x, SCALE_WIDTH);
      const metres = map.distance(
        map.containerPointToLatLng(factory.point(0, y)),
        map.containerPointToLatLng(factory.point(span, y))
      );
      line.textContent = formatRatio(ratioFor(metres, span)) ?? '';
    };

    // `move`, not `moveend`: on Mercator the ground distance per pixel changes while panning north.
    map.on('move zoomend', writeRatio);
    writeRatio();

    return () => {
      map.off('move zoomend', writeRatio);
      scale.remove();
    };
  }, [map, position, units, ratio]);

  return null;
};

ScaleControl.propTypes = {
  position: PropTypes.string,
  units: PropTypes.string,
  ratio: PropTypes.bool
};
