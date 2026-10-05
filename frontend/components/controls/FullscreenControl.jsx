import { React, PropTypes } from 'perun-core';
import { core } from '../../spatial';
import { svgMarkup } from '../../lib/icons';
import { useAtlasMap } from './context';

const { factory } = core;
const { useLayoutEffect } = React;

/**
 * A button that takes the map fullscreen and back.
 *
 * Worth more here than on a full-page screen, because this map usually lives
 * inside a modal: a panel sized for a record is not sized for reading a country.
 * `leaflet.fullscreen` is one of spatial's own dependencies and its factory
 * imports it, so this is a control the engine already carries rather than a new
 * one. An engine without it gets no button.
 *
 * `content` is the plugin's own option for supplying the button's contents, and
 * passing it drops the `fullscreen-icon` class the sprite is keyed to -- so
 * spatial's `fullscreen-control.css`, which exists to stop that two-frame image
 * showing both frames at once, goes quiet rather than fighting this. Both glyphs
 * are put in and one is shown: the plugin toggles `leaflet-fullscreen-on` and
 * never touches the contents again, which is exactly what the sprite's two
 * frames were doing, done with CSS that can say which is which.
 *
 * Added in a layout effect, like every control `AtlasMap` renders, so it is on
 * the map in the same commit as the others and in the order they render: a
 * corner shows its controls in the order they arrive.
 *
 * @param {string} [position] - The corner it sits in.
 */
export const FullscreenControl = ({ position = 'topleft' }) => {
  const map = useAtlasMap();

  useLayoutEffect(() => {
    if (!factory.control.fullscreen) return undefined;

    const added = factory.control.fullscreen({
      position,
      content: svgMarkup('maximize') + svgMarkup('minimize')
    }).addTo(map);

    return () => {
      // `leaflet.fullscreen` subscribes `_toggleState` to the map in `onAdd`
      // and its `onRemove` does not take it off again, so `remove` nulls the
      // control's `_map` and leaves a handler on the map still reading it. On a
      // map that outlives this control that is one dead handler per mount, and
      // the next exit from fullscreen -- which the live control fires at every
      // subscriber -- throws on the first of them:
      //
      //     Cannot read properties of null (reading '_isFullscreen')
      //
      // The engine now patches this in its own factory, and `off` on a handler
      // that is already gone is a no-op, so this is here for the deployments
      // where the two bundles are not the same age. Before `remove`, which is
      // what puts the control out of reach of its own map.
      if (added._toggleState) map.off('enterFullscreen exitFullscreen', added._toggleState, added);
      added.remove();
    };
  }, [map, position]);

  return null;
};

FullscreenControl.propTypes = { position: PropTypes.string };
