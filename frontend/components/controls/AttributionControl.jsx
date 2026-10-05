import { React, PropTypes } from 'perun-core';
import { core } from '../../spatial';
import { useAtlasMap } from './context';

const { factory } = core;
const { useLayoutEffect } = React;

/**
 * The credit line: the deployment's own, and each tile provider's.
 *
 * Always there, since a provider's terms are not an option a screen gets to
 * decline. spatial builds its maps with `attributionControl: false`, because its
 * own toolbar carries the chrome this package does not mount, so without this a
 * map had no way to display a credit.
 *
 * `prefix: false` drops Leaflet's own 'Leaflet' link: this is where a
 * deployment's credit and a tile provider's terms are satisfied, not an
 * advertisement for the mapping library.
 *
 * On the map before the layers, which `AtlasMap` sees to by rendering it before
 * it loads them: the deployment's credit comes first, and each layer's is added
 * as the layer arrives.
 *
 * @param {string} [credit] - The deployment's own, from its settings.
 */
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
