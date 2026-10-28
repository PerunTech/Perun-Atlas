// The only file that imports 'spatial'. Its modules live on the prototype, not on the export.
import { spatial as _spatial } from 'spatial';

const engine = Object.getPrototypeOf(_spatial);

export const config = engine.config;
export const core = engine.core;
export const data = engine.data;
export const tools = engine.tools;
