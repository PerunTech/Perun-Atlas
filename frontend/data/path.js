// Imports nothing: appearance/ reads through this and must stay free of the engine and the shell.
// svarog returns a related field either nested or as a flat `TABLE.COLUMN` key, so at each step the
// rest of the path is tried as a literal key first.
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

// Splits on every call; anything asking per feature wants `reader`.
export const valueAt = (source, path) => readPath(source, String(path).split('.'));

export const reader = (field) => {
  const path = String(field).split('.');
  return (record) => readPath(record, path);
};

// `%TOKEN%` placeholders are resolved server-side; these stay live because they change per request.
export const bindPath = (path, context) =>
  path.replace(/\{([^}]+)\}/g, (match, expression) => {
    const value = valueAt(context, expression);
    return value === undefined || value === null ? match : String(value);
  });
