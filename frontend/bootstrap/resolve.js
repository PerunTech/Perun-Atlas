import { REQUIRED, SCHEMA } from '../config/Schema';
import { coerce } from './coerce';
import { remoteSource, defaultSource } from './sources';

// Overrides beat remote parameters, which beat schema defaults. A required setting with no value
// throws a ConfigError at startup rather than letting the map draw the wrong country.
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
