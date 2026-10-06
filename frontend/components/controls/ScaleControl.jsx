import { React, PropTypes } from 'perun-core';
import { core } from '../../spatial';
import { formatRatio, ratioFor } from '../../lib/zoom';
import { useAtlasMap } from '../context';

const { factory } = core;
const { useLayoutEffect } = React;

/**
 * How wide the scale bar is allowed to be, and therefore the span the ratio
 * beside it is measured across.
 *
 * One number for both on purpose: the bar and the ratio are two readings of the
 * same measurement, and taking them across different spans is how they come to
 * disagree by a rounding.
 */
const SCALE_WIDTH = 140;

/**
 * A scale bar, with the same measurement as a ratio under it.
 *
 * Leaflet's own distance bar rather than spatial's `ScaleControl`, which is a
 * 1:N ratio dropdown reading `crs.options.distances` -- a CRS built from a bare
 * EPSG code carries none, so on most deployments it mounts and renders nothing.
 *
 * A bar answers "how far is that" and a ratio answers "what is this map,
 * compared to the ones I already know" -- which is the question a reader
 * arriving from a paper sheet or a cadastral plan actually has, and the one a
 * zoom level cannot answer at all, since z14 is a different map at every
 * latitude.
 *
 * The ratio is measured rather than derived from the zoom: this package supports
 * deployments whose map is not on the Web Mercator grid, and the closed form
 * everyone quotes for metres-per-pixel is only true on that one. A ground
 * distance across a known span of pixels is true on all of them, and it is how
 * Leaflet's own scale bar does it. It is written into the scale control's own
 * container rather than added as a second control beside it, so it travels with
 * the bar it restates -- same corner, same margin, same lifetime.
 *
 * @param {string} [position] - The corner it sits in.
 * @param {string} [units] - The deployment's, from the setting that already
 *        answers this everywhere else: `imperial`, or metric otherwise.
 * @param {boolean} [ratio] - Whether to write the ratio under the bar.
 */
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

    // `move` rather than `moveend`: on a Mercator map the ground distance a
    // pixel covers changes as the reader pans north, so a ratio that only
    // caught the end of a drag would be wrong for the whole of it.
    map.on('move zoomend', writeRatio);
    writeRatio();

    // The line goes with the control that holds it; the listener keeping it
    // current does not, and a handler left on a map that outlives this control
    // is a leak by any other name.
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
