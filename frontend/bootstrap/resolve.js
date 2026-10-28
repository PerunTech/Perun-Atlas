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
 *
 * What it throws is a `ConfigError`, which carries the same findings as data
 * for the card that shows them.
 */
export const resolve = async (overrides = {}) => {
  const remote = await remoteSource();
  const layered = {
    ...defaultSource(),
    ...remote.values,
    ...overrides
  };

  const resolved = {};
  const invalid = [];

  Object.entries(SCHEMA).forEach(([key, entry]) => {
    const raw = layered[key];
    if (raw === undefined) return;
    try {
      resolved[key] = coerce(key, raw, entry);
    } catch (err) {
      invalid.push({ ...setting(key), got: raw, expected: err.expected, message: err.message });
    }
  });

  const absent = REQUIRED.filter(key => resolved[key] === undefined && !invalid.some(p => p.key === key));
  const unreachable = absent.filter(key => remote.unreachable.includes(key)).map(setting);
  const missing = absent.filter(key => !remote.unreachable.includes(key)).map(setting);

  if (invalid.length || missing.length || unreachable.length) {
    throw new ConfigError({ invalid, missing, unreachable });
  }

  return resolved;
};

const setting = (key) => ({ key, param: SCHEMA[key].param, doc: SCHEMA[key].doc });

const listed = (settings) => settings.map(({ key, param }) => `${key} (parameter ${param})`).join(', ');

export class ConfigError extends Error {
  /**
   * @param {Object} problems - `invalid`, `missing` and `unreachable`, each a
   *        list of `{ key, param, doc }`; an invalid one adds `got`, `expected`
   *        and its own `message`.
   */
  constructor (problems) {
    const lines = [
      ...problems.invalid.map(p => p.message),
      problems.missing.length && `missing required setting(s): ${listed(problems.missing)}`,
      problems.unreachable.length && `no answer for required setting(s): ${listed(problems.unreachable)}`
    ].filter(Boolean);
    super('perun-atlas: configuration could not be resolved.\n  - ' + lines.join('\n  - '));
    this.name = 'ConfigError';
    this.problems = problems;
  }
}
