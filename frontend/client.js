import { pluginManager } from 'perun-core';
import * as perunCore from 'perun-core';
import pkg from '../package.json';
import * as plugin from './index';

// In production perun-core and spatial are window globals published by their own
// bundles. Locally they are bundled in, so expose perun-core by hand to match.
window['perun-core'] = perunCore;
pluginManager.registerPlugin(pkg.name, plugin);
