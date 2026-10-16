import { REQUIRED, SCHEMA } from '../config/Schema';
import { coerce } from './coerce';
import { remoteSource, defaultSource } from './sources';

/**
 * Resolves the configuration a map needs before it can be constructed.
 *
 * Precedence, highest first:
 *   1. explicit overrides passed by the caller  (tests, embedding)
 *   2. remote parameters from SVAROG_SYS_PARAMS (the deployment's own values)
 *   3. schema defaults
 *
 * A required setting with no value anywhere throws, naming the parameter. That is
 * deliberate: a deployment missing its CRS should fail at startup with something
 * an administrator can act on, rather than render a plausible map of the wrong
 * country. Section H of the plan has the reasoning.
 */
export const resolve = async (overrides = {}) => {
  const remote = await remoteSource();
  const layered = {
    ...defaultSource(),
    ...remote,
    ...overrides
  };

  const resolved = {};
  const problems = [];

  Object.entries(SCHEMA).forEach(([key, entry]) => {
    const raw = layered[key];
    if (raw === undefined) return;
    try {
      resolved[key] = coerce(key, raw, entry);
    } catch (err) {
      problems.push(err.message);
    }
  });

  const missing = REQUIRED.filter(key => resolved[key] === undefined);
  if (missing.length) {
    problems.push(
      'missing required setting(s): ' +
      missing.map(key => `${key} (parameter ${SCHEMA[key].param})`).join(', ')
    );
  }

  if (problems.length) {
    throw new Error(
      'perun-atlas: configuration could not be resolved.\n  - ' + problems.join('\n  - ')
    );
  }

  return resolved;
};
