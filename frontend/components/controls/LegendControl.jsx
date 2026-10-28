import { React, PropTypes } from 'perun-core';
import { legendShown } from '../../appearance/legend';
import { containEvents, MapControl } from './host';
import { Legend } from '../Legend';

// A control rather than a div over the map, so it goes fullscreen with the map and Leaflet's corner
// owns its placement.
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
  // Taken off the map when Legend would render nothing, or an empty control leaves a margin in the corner.
  const shown = legendShown(entries, hidden);

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
