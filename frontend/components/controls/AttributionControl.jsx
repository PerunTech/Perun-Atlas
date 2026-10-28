import { React, PropTypes } from 'perun-core';
import { core } from '../../spatial';
import { useAtlasMap } from '../context';

const { factory } = core;
const { useLayoutEffect } = React;

// Always on, since a provider's terms are not optional. `prefix: false` drops Leaflet's own link.
export const AttributionControl = ({ credit }) => {
  const map = useAtlasMap();

  useLayoutEffect(() => {
    const added = factory.control.attribution({ prefix: false }).addTo(map);
    if (credit) added.addAttribution(credit);
    return () => { added.remove(); };
  }, [map, credit]);

  return null;
};

AttributionControl.propTypes = { credit: PropTypes.string };
