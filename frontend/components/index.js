/**
 * Everything this package offers a consumer, and where each kind lives.
 *
 * The directory has one subdivision, and it is drawn on something real rather
 * than on how the files sort.
 *
 * `layers/` is the components that render nothing. They return null and put
 * their features on the map imperatively, through Leaflet, which makes them
 * adapters wearing a React interface -- a distinction worth seeing before
 * reading one, because none of the usual reasoning about what a component
 * returns applies to them.
 *
 * Everything else sits at the top level: the map, the screen around it, and the
 * chrome on it.
 *
 * What these are built out of is not here: `frontend/lib/` holds the small
 * shared pieces and `frontend/hooks/` the panel's state, and neither is
 * exported from the package.
 */

export { AtlasMap } from './AtlasMap';
export { Choropleth } from './layers/Choropleth';
export { CirclePicker } from './layers/CirclePicker';
export { DateRange } from './DateRange';
export { DrawBar, DrawTool } from './DrawBar';
export { FeatureSet } from './layers/FeatureSet';
export { FeaturePanel } from './FeaturePanel';
export { Legend } from './Legend';
export { LegendControl } from './LegendControl';
export { PointPicker } from './layers/PointPicker';
export { ZoomRail } from './ZoomRail';

// The connected one is the public name: a consumer wants the screen that finds
// its own session, and the bare component next to it in ConfiguredMap.jsx is for
// tests and for anything rendering outside a store.
export { default as ConfiguredMap } from './ConfiguredMap';
