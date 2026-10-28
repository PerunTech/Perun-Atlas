import { React, PropTypes } from 'perun-core';
import { data } from '../../spatial';
import { useAtlasMap } from '../context';
import '../../style/notice.css';

const { layerControl } = data;
const { useLayoutEffect } = React;

export const LayerSwitcher = ({ basemap, overlays, note }) => {
  const map = useAtlasMap();

  useLayoutEffect(() => {
    const added = layerControl(basemap, overlays, { collapsed: true }).addTo(map);

    // The engine's control has no slot for a note, and redraws only its two lists, so this line stays.
    if (note) {
      const line = document.createElement('p');
      line.className = 'atlas-switcher-note';
      line.textContent = note;
      added.getContainer().querySelector('.leaflet-control-layers-list')?.appendChild(line);
    }

    return () => {
      // Its onRemove (spatial's port of Leaflet 1.5's) leaves `collapse` on the map's clicks.
      map.off('click', added.collapse, added);
      added.remove();
    };
  }, [map, basemap, overlays, note]);

  return null;
};

LayerSwitcher.propTypes = {
  basemap: PropTypes.object,
  overlays: PropTypes.object,
  note: PropTypes.string
};
