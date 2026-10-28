// Named imports keep the rest of package.json out of the bundle.
import { name as packageName, version as packageVersion } from '../package.json';

import * as config from './config';
import { AtlasMap, Choropleth, CirclePicker, ConfiguredMap, DateRange, DrawBar, DrawTool, FeaturePanel, FeatureSet, Legend, LegendControl, PointPicker, ZoomRail } from './components';

// The shell must load this after spatial, whose global the bundle reads as it evaluates.
export const name = packageName;
export const version = packageVersion;

export { AtlasMap, Choropleth, CirclePicker, ConfiguredMap, DateRange, DrawBar, DrawTool, FeaturePanel, FeatureSet, Legend, LegendControl, PointPicker, ZoomRail };
export { config };
