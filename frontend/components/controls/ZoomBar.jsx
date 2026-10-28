import { React, PropTypes } from 'perun-core';
import { core } from '../../spatial';
import { svgMarkup } from '../../lib/icons';
import { FIT_PADDING } from '../../lib/zoom';
import { useAtlasMap } from '../context';
import { ZOOM_LABELS } from './ZoomRail';

const { factory } = core;
const { useEffect, useLayoutEffect, useRef } = React;

// The fit button is an anchor like Leaflet's own, not a `button`: spatial's navigation.css restyles
// every button in the bottom-right corner.
export const ZoomBar = ({ position = 'bottomright', fit = true, extent = null, labels }) => {
  const map = useAtlasMap();
  const words = labels?.fit ?? ZOOM_LABELS.fit;

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

    return () => {
      bar.remove();
      fitRef.current = null;
    };
  }, [map, position, fit, words]);

  // Inline, since `.leaflet-bar a` and our own centring rule both set `display`.
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
