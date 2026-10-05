import { React, PropTypes } from 'perun-core';
import { legendShown } from '../../appearance/legend';
import { containEvents, MapControl } from './host';
import { Legend } from '../Legend';

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
 * The tree is portalled into the control (see `controls/host.js`), so it stays
 * part of the screen's own: entries update as props, and the collapsed state
 * survives a reload because nothing unmounts when the rows change.
 *
 * @param {Array} entries - As `appearance/legend.js` builds them.
 * @param {string} [title] - Heading, already resolved.
 * @param {boolean} [open] - Whether it starts expanded.
 * @param {Array} [hidden] - Passed to `Legend`, as are the next three, which
 *        makes its rows switches when given `onToggle`.
 * @param {Function} [onToggle]
 * @param {Function} [onShowAll]
 * @param {string} [showAllLabel]
 * @param {string} [position] - Any corner of the map. Defaults
 *        to the bottom left, which is where a map key conventionally goes and
 *        which holds only the scale bar now that the coordinate readout has its
 *        own region underneath the map. The alternatives are all worse here:
 *        bottom right is attribution, top left is already four buttons deep,
 *        and top right made the collapsed layer switcher share a column with
 *        the widest thing on the map.
 */
export const LegendControl = ({
  entries = [],
  title,
  open,
  hidden = [],
  onToggle,
  onShowAll,
  showAllLabel,
  position = 'bottomleft'
}) => {
  // Where `Legend` renders nothing, a control holding nothing is still a margin
  // in the corner. Take it off the map instead -- by the same rule, so a key
  // kept up for a row that is switched off has a control to sit in.
  const shown = legendShown(entries, hidden);

  // Without `containEvents`, a click on the toggle also reaches the map, and a
  // wheel over a long key zooms rather than scrolls it.
  return (
    <MapControl position={position} shown={shown}>
      <div className='atlas-legend__host' ref={containEvents}>
        <Legend
          entries={entries}
          title={title}
          open={open}
          hidden={hidden}
          onToggle={onToggle}
          onShowAll={onShowAll}
          showAllLabel={showAllLabel}
        />
      </div>
    </MapControl>
  );
};

LegendControl.propTypes = {
  entries: PropTypes.array,
  title: PropTypes.string,
  open: PropTypes.bool,
  hidden: PropTypes.array,
  onToggle: PropTypes.func,
  onShowAll: PropTypes.func,
  showAllLabel: PropTypes.string,
  position: PropTypes.string
};
