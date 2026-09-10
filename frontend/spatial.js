/**
 * The single point at which perun-atlas touches the map engine.
 *
 * `spatial` is assembled with its modules on the prototype, so they are reached
 * through getPrototypeOf rather than directly off the export. Every other file in
 * this project imports from here — nothing else should import 'spatial'.
 */
import { spatial as _spatial } from 'spatial';

const engine = Object.getPrototypeOf(_spatial);

export const assets = engine.assets;
export const config = engine.config;
export const core = engine.core;
export const data = engine.data;
export const tools = engine.tools;
export const ui = engine.ui;
export const proj4 = engine.proj4;

export default engine;
