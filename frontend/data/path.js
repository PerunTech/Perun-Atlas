/**
 * Reading a value out of a record by a configured name, and writing values into
 * a configured path.
 *
 * One reader for the whole package. There used to be three -- one for path
 * placeholders, one for the CSV and the choropleth's hover label, one for the
 * colouring and the join -- and only the last knew that svarog spells a related
 * field two ways. So a row naming `TABLE.COLUMN` coloured its areas correctly and
 * showed an empty tooltip over them, and a set carrying that key flat exported
 * it as a blank column. One copy cannot disagree with itself.
 *
 * Imports nothing, on purpose. `appearance/` reads through this and has to stay
 * free of the engine and the shell, so it takes this file directly rather than
 * through `data/index.js`, which reaches both.
 */

/**
 * One value out of a record, by a path that may or may not be nested.
 *
 * Svarog answers in both shapes and a menu row cannot tell which it will get: a
 * denormalised reader returns a flat key literally called `TABLE.COLUMN`, while
 * a record with its related object attached returns `{ TABLE: { COLUMN } }`. The
 * same configured name describes both, and a row written for one silently joins
 * nothing against the other -- a whole map in the unclassified colour, which
 * reads as a palette mistake rather than a path that missed.
 *
 * So at each step the rest of the path is tried as a literal key before
 * descending. Same tolerance `descriptorOf` and `identityOf` show about casing,
 * for the same reason: the shape belongs to the producer and the caller should
 * not have to know which one it turned out to be.
 *
 * A null or absent value part way down is answered as itself rather than
 * descended into, so `{ a: null }` read at `a.b` is null -- the record said
 * there was nothing there, which is not the same as not saying.
 *
 * @param {Object} source - The record, a feature's properties, or a context.
 * @param {Array} path    - The configured name, already split on dots.
 */
const readPath = (source, path) => {
  let value = source;

  for (let i = 0; i < path.length; i += 1) {
    if (value === null || value === undefined) return value;

    const rest = path.length - i === 1 ? path[i] : path.slice(i).join('.');
    if (Object.prototype.hasOwnProperty.call(Object(value), rest)) return value[rest];

    value = value[path[i]];
  }

  return value;
};

/**
 * A value by dotted name, so a joined record's field reads like its own.
 *
 * Splits the name on every call, which is right for something asked once per
 * placeholder or once per cell. Anything asking per feature per draw wants
 * `reader`, which splits it once.
 *
 * @param {Object} source - The record to read from.
 * @param {string} path   - Property name, or a dotted path into it.
 */
export const valueAt = (source, path) => readPath(source, String(path).split('.'));

/**
 * A reader for one field, with the path split once.
 *
 * For the callers that ask the same question of every feature in a set, which
 * can be ten thousand of them.
 *
 * @param {string} field - Property name, or a path into a joined record.
 * @returns {Function} record -> the value at that path.
 */
export const reader = (field) => {
  const path = String(field).split('.');
  return (record) => readPath(record, path);
};

/**
 * Substitutes {path} tokens in a service path against a context object.
 *
 * Server-side `%TOKEN%` placeholders are already resolved by MenuHelper before the
 * configuration reaches the browser; these are the ones that must stay live because
 * they change per request — {map.bbox} above all.
 */
export const bindPath = (path, context) =>
  path.replace(/\{([^}]+)\}/g, (match, expression) => {
    const value = valueAt(context, expression);
    return value === undefined || value === null ? match : String(value);
  });
