import { React, PropTypes } from 'perun-core';
import { data } from '../../spatial';
import { useAtlasMap } from '../context';

const { layerControl } = data;
const { useLayoutEffect } = React;

/**
 * The engine's layer switcher, collapsed, listing the basemaps and overlays the
 * deployment's catalogue returned.
 *
 * Built here rather than through spatial's app builder, which adds the control
 * and keeps no reference to it. A control is not a layer, so nothing else takes
 * it off again, and the map outlives this component.
 *
 * @param {Object} basemap - As `fetchLayers` returns them.
 * @param {Object} overlays - The same.
 */
export const LayerSwitcher = ({ basemap, overlays }) => {
  const map = useAtlasMap();

  useLayoutEffect(() => {
    const added = layerControl(basemap, overlays, { collapsed: true }).addTo(map);

    return () => {
      // A collapsed switcher closes when the map is clicked, and subscribes
      // `collapse` to the map's clicks to do it. Its `onRemove` -- spatial's
      // port of Leaflet 1.5's, and Leaflet's own the same -- does not take that
      // off again, so every mount left one more handler on a map that outlives
      // it. Found on 5 October 2026: twenty screens in a row left twenty.
      map.off('click', added.collapse, added);
      added.remove();
    };
  }, [map, basemap, overlays]);

  return null;
};

LayerSwitcher.propTypes = {
  basemap: PropTypes.object,
  overlays: PropTypes.object
};
