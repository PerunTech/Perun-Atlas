import { React, PropTypes } from 'perun-core';
import { core } from '../../spatial';
import { svgMarkup } from '../../lib/icons';
import { useAtlasMap } from '../context';

const { factory } = core;
const { useLayoutEffect } = React;

// Passing `content` drops the class spatial's sprite CSS is keyed to; both glyphs go in and CSS shows
// one per state.
export const FullscreenControl = ({ position = 'topleft' }) => {
  const map = useAtlasMap();

  useLayoutEffect(() => {
    if (!factory.control.fullscreen) return undefined;

    const added = factory.control.fullscreen({
      position,
      content: svgMarkup('maximize') + svgMarkup('minimize')
    }).addTo(map);

    return () => {
      // leaflet.fullscreen's onRemove leaves `_toggleState` subscribed, and the next fullscreen exit throws
      // on the dead handler. Newer engines patch this; kept for older ones, and before `remove`.
      if (added._toggleState) map.off('enterFullscreen exitFullscreen', added._toggleState, added);
      added.remove();
    };
  }, [map, position]);

  return null;
};

FullscreenControl.propTypes = { position: PropTypes.string };
