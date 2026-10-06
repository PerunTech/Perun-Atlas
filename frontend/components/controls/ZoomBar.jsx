import { React, PropTypes } from 'perun-core';
import { core } from '../../spatial';
import { svgMarkup } from '../../lib/icons';
import { FIT_PADDING } from '../../lib/zoom';
import { useAtlasMap } from '../context';
import { ZOOM_LABELS } from './ZoomRail';

const { factory } = core;
const { useEffect, useLayoutEffect, useRef } = React;

/**
 * The zoom as two buttons, and above them a third that frames the data again.
 *
 * spatial builds its maps with `zoomControl: false`, because its own toolbar
 * carries a navigation control and that toolbar is part of the app chrome this
 * package does not mount. So without this an embedded map had no way to zoom
 * without a wheel or a trackpad. `ZoomRail` is the other way to draw it.
 *
 * Leaflet's own `zoomInText`/`zoomOutText` rather than reaching into the
 * control's DOM afterwards: they are the supported way to say what a zoom
 * button holds, and they leave every behaviour that makes this control worth
 * keeping -- the disabled state at each end of the range, shift-click for three
 * levels, the titles -- untouched.
 *
 * The fit button goes into the zoom control's own container, so it shares the
 * bar's column, its look and its lifetime, and there is nothing to keep aligned
 * by hand. It is built the way Leaflet builds the two beside it -- an anchor
 * with a `#` href and the role of a button -- rather than as a `button`. That is
 * not a taste. spatial's `navigation.css` makes every `button` in the
 * bottom-right corner absolute, padded and round, for navigation buttons of its
 * own; an anchor is what that rule leaves alone, and what `.leaflet-bar a`
 * already draws exactly like the `+` and `-`, hover and touch sizes included, on
 * every engine this has run on. The glyph goes in as markup for the reason
 * `lib/icons.js` gives, and the words as attributes, never as markup.
 *
 * @param {string} [position] - The corner it sits in. In the bottom right, added
 *        after the attribution, which is the whole of what puts it above the
 *        credit line: Leaflet fills a bottom corner in reverse arrival order.
 * @param {boolean} [fit] - Whether to carry the fit button.
 * @param {Array} [extent] - `[[south, west], [north, east]]`, where the data is.
 *        The fit button is hidden, not absent, while there is none.
 * @param {Object} [labels] - `fit` is the button's words.
 */
export const ZoomBar = ({ position = 'bottomright', fit = true, extent = null, labels }) => {
  const map = useAtlasMap();
  const words = labels?.fit ?? ZOOM_LABELS.fit;

  // The frame as of this render, for a button that was built in an effect and
  // is clicked long after.
  const extentRef = useRef(extent);
  extentRef.current = extent;
  const fitRef = useRef(null);

  useLayoutEffect(() => {
    const bar = factory.control.zoom({
      position,
      zoomInText: svgMarkup('plus'),
      zoomOutText: svgMarkup('minus')
    }).addTo(map);

    if (fit) {
      const container = bar.getContainer();
      const link = factory.DomUtil.create('a', 'atlas-fit');

      link.href = '#';
      link.title = words;
      link.setAttribute('role', 'button');
      link.setAttribute('aria-label', words);
      link.innerHTML = svgMarkup('zoom-scan');
      link.style.display = extentRef.current ? '' : 'none';

      factory.DomEvent.disableClickPropagation(link);
      factory.DomEvent.on(link, 'click', factory.DomEvent.stop);
      factory.DomEvent.on(link, 'click', () => {
        if (extentRef.current) map.fitBounds(extentRef.current, { padding: FIT_PADDING });
      });

      container.insertBefore(link, container.firstChild);
      fitRef.current = link;
    }

    // The fit button goes with the bar that holds it; only the handle is left.
    return () => {
      bar.remove();
      fitRef.current = null;
    };
  }, [map, position, fit, words]);

  // Shown while there is somewhere to go back to. Inline, because
  // `.leaflet-bar a` and this package's own centring rule both set `display`,
  // and either would otherwise keep a dead button on screen.
  useEffect(() => {
    if (fitRef.current) fitRef.current.style.display = extent ? '' : 'none';
  }, [extent]);

  return null;
};

ZoomBar.propTypes = {
  position: PropTypes.string,
  fit: PropTypes.bool,
  extent: PropTypes.array,
  labels: PropTypes.object
};
