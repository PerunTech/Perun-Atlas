import { SCHEMA, REQUIRED } from '../config';
import { coerce } from './coerce';
import { remoteSource, legacySource, defaultSource } from './sources';

/**
 * Resolves the configuration a map needs before it can be constructed.
 *
 * Precedence, highest first:
 *   1. explicit overrides passed by the caller  (tests, embedding)
 *   2. remote parameters from SVAROG_SYS_PARAMS (the deployment's own values)
 *   3. legacy window globals                    (deprecated, warned)
 *   4. schema defaults
 *
 * A required setting with no value anywhere throws, naming the parameter. That is
 * deliberate: a deployment missing its CRS should fail at startup with something
 * an administrator can act on, rather than render a plausible map of the wrong
 * country. Section H of the plan has the reasoning.
 */
/**
 * Names the globals a deployment is still relying on.
 *
 * Only the ones that actually won: a global that a seeded parameter outranks is
 * dead weight in index.html, not a dependency, and reporting it as one sends an
 * administrator to change a line that has no effect. Saying which globals still
 * decide something is also saying which lines are now safe to delete.
 */
const warnOnLegacy = (legacy, remote, overrides) => {
  const used = Object.keys(legacy).filter(key => !(key in remote) && !(key in overrides));
  if (!used.length) return;

  console.warn(
    `perun-atlas: ${used.length} setting(s) still come from window globals — ` +
    used.map(key => `window.${SCHEMA[key].legacy}`).join(', ') + '. ' +
    'Seed ' + used.map(key => SCHEMA[key].param).join(', ') + ' in SVAROG_SYS_PARAMS; ' +
    'this fallback is temporary.'
  );
};

export const resolve = async (overrides = {}) => {
  const remote = await remoteSource();
  const legacy = legacySource();
  const layered = {
    ...defaultSource(),
    ...legacy,
    ...remote,
    ...overrides
  };

  warnOnLegacy(legacy, remote, overrides);

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

/**
 * Describes where each setting would come from, without applying any of it.
 * Useful from a console when a deployment is behaving unexpectedly.
 */
export const explain = async () => {
  const [remote, legacy, defaults] = [await remoteSource(), legacySource(), defaultSource()];

  return Object.fromEntries(
    Object.keys(SCHEMA).map(key => [
      key,
      key in remote ? { source: 'SVAROG_SYS_PARAMS', value: remote[key] }
        : key in legacy ? { source: `window.${SCHEMA[key].legacy}`, value: legacy[key] }
          : key in defaults ? { source: 'schema default', value: defaults[key] }
            : { source: 'unresolved', value: undefined }
    ])
  );
};
