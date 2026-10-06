// Named, so the bundle carries these two fields rather than the whole manifest.
import { name as packageName, version as packageVersion } from '../package.json';

import * as config from './config';
import { AtlasMap, Choropleth, CirclePicker, ConfiguredMap, DateRange, DrawBar, DrawTool, FeaturePanel, FeatureSet, Legend, LegendControl, PointPicker, ZoomRail } from './components';

/**
 * perun-atlas — the shared map layer.
 *
 * A library plugin: it exports components and the settings they read, and
 * registers no routes of its own. Consumers take this rather than `spatial`, so that the engine's API has
 * exactly one caller and a change to it has exactly one place to happen.
 *
 * Loaded by the shell as an IPerunPlugin script. Its sort order must place it
 * after spatial, whose global this bundle resolves as it evaluates.
 */
export const name = packageName;
export const version = packageVersion;

export { AtlasMap, Choropleth, CirclePicker, ConfiguredMap, DateRange, DrawBar, DrawTool, FeaturePanel, FeatureSet, Legend, LegendControl, PointPicker, ZoomRail };
export { config };
