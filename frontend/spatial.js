/**
 * The single point at which perun-atlas touches the map engine.
 *
 * `spatial` is assembled with its modules on the prototype, so they are reached
 * through getPrototypeOf rather than directly off the export. Every other file in
 * this project imports from here — nothing else should import 'spatial'.
 *
 * Only the parts this package uses are named: the map and its factory, the
 * settings, the layer switcher and the geobuf decoder, and the drawing,
 * measuring and readout tools. spatial's React parts, such as `ui`, are left
 * out: they are frozen until spatial removes them, and every component here is
 * this package's own.
 */
import { spatial as _spatial } from 'spatial';

const engine = Object.getPrototypeOf(_spatial);

export const config = engine.config;
export const core = engine.core;
export const data = engine.data;
export const tools = engine.tools;
