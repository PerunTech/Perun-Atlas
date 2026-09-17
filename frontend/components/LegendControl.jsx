import { React, ReactDOM, PropTypes } from 'perun-core';
import { core } from '../spatial';
import { Legend, MINIMUM_ENTRIES } from './Legend';

const { control, factory } = core;
const { useEffect, useState } = React;

/**
 * The legend, as part of the map rather than a box on top of it.
 *
 * Mounted as a Leaflet control, which is the difference that matters: a sibling
 * div positioned over the map is outside the element that goes fullscreen, so
 * the key vanishes exactly when there is most map to read. It also has to win a
 * z-index argument against the frame spatial draws, and it sits in the panel's
 * coordinate space rather than the map's, so it drifts whenever the two differ.
 * A control has none of those problems: Leaflet's corner owns the placement, and
 * the whole chrome travels with the container.
 *
 * `control()` renders its props once, at `onAdd`, and closes over them -- fine
 * for a toolbar, wrong for a key whose rows change with every set drawn. So the
 * control is given a bare container and React keeps the tree inside it through a
 * portal: entries update as props, and the collapsed state survives a reload
 * because nothing unmounts when the rows change.
 *
 * @param {Array} entries - As `style/legend.js` builds them.
 * @param {string} [title] - Heading, already resolved.
 * @param {boolean} [open] - Whether it starts expanded.
 * @param {string} [position] - Any corner spatial's `control` accepts. Defaults
 *        to the bottom left, which is where a map key conventionally goes and
 *        which holds only the scale bar now that the coordinate readout has its
 *        own region underneath the map. The alternatives are all worse here:
 *        bottom right is attribution, top left is already four buttons deep,
 *        and top right made the collapsed layer switcher share a column with
 *        the widest thing on the map.
 */
export const LegendControl = ({ entries = [], title, open, position = 'bottomleft' }) => {
  /**
   * The container the control is handed, made once and kept.
   *
   * Built outside the effect so the portal has a target on the first render,
   * and never rebuilt: replacing it would take the React tree -- and with it
   * the collapsed state -- down alongside it.
   */
  const [host] = useState(() => {
    const node = factory.DomUtil.create('div', 'atlas-legend__host');

    // Leaflet forwards events from a control's container on to the map unless
    // told not to. Without these, a click on the toggle also reaches the map,
    // and a wheel over a long key zooms rather than scrolls it.
    factory.DomEvent.disableClickPropagation(node);
    factory.DomEvent.disableScrollPropagation(node);

    return node;
  });

  // Below the threshold `Legend` renders nothing, and a control holding nothing
  // is still a margin in the corner. Take it off the map instead.
  const shown = entries.length >= MINIMUM_ENTRIES;

  useEffect(() => {
    if (!shown) return undefined;

    // Not a layer, so nothing else takes it off again and the map outlives this
    // component -- the same reason AtlasMap keeps a handle on every control it
    // adds.
    const added = control(host, {}, { position });

    return () => { added.remove(); };
  }, [shown, position, host]);

  return ReactDOM.createPortal(
    <Legend entries={entries} title={title} open={open} />,
    host
  );
};

LegendControl.propTypes = {
  entries: PropTypes.array,
  title: PropTypes.string,
  open: PropTypes.bool,
  position: PropTypes.string
};
