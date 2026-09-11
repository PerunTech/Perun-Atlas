import pkg from '../package.json';

import * as bootstrap from './bootstrap';
import * as config from './config';
import * as data from './data';
import * as style from './style';
import { AtlasMap, Choropleth, DateRange, FeatureSet, PointPicker } from './components';

/**
 * perun-atlas — the shared map layer.
 *
 * A library plugin: it exports components and helpers, and registers no routes of
 * its own. Consumers take this rather than `spatial`, so that the engine's API has
 * exactly one caller and its 2.0 migration has exactly one place to happen.
 *
 * Loaded by the shell as an IPerunPlugin script. Its sort order must place it
 * after spatial, whose global this bundle resolves as it evaluates.
 */
export const name = pkg.name;
export const version = pkg.version;

export { AtlasMap, Choropleth, DateRange, FeatureSet, PointPicker };
export { bootstrap, config, data, style };
