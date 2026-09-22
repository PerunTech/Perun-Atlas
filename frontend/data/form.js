import { axios } from 'perun-core';
import { bindPath } from './geometry';

/**
 * The fields a form is made of, when a row names the service that has them.
 *
 * A screen that writes a record asks for the fields the rest of the registry
 * already asks for, and those are described somewhere: in the table's own JSON
 * Schema, which is what every other form in this shell is built from. A row
 * naming that path gets the form the table already has -- rather than a second
 * description of it, written out by hand in configuration, which drifts the
 * first time a field is added, renamed or made mandatory and drifts silently.
 *
 * Nothing here knows which table, which fields or which service. A path arrives
 * from configuration and a schema comes back, the same contract `fetchRows` and
 * `fetchGeometry` have and for the same reason.
 *
 * `pickFields` is the other half, and the one that makes the first half usable.
 * A table's schema is the whole table -- thirteen properties, nineteen, several
 * of them mandatory -- which is a form for a page, not a row under a toolbar. A
 * row names the handful it wants and gets a schema narrowed to them.
 */

/**
 * Fetches the schema a form is built from.
 *
 * Failure is null rather than an empty schema, and the difference is the whole
 * point: an empty schema renders as a form with no fields and a live Save above
 * it, which is a record written with everything the form was there to carry
 * missing. Null is the caller's signal to say so and refuse the save.
 *
 * The shape check is not defensive dressing. These services answer a refusal
 * with a bare label code -- a string, under a 200 -- so a body that is not an
 * object with properties is the ordinary shape of an expired session or a table
 * this user may not read, and handing it to RJSF would be an exception thrown
 * from inside a form rather than a sentence in the console.
 *
 * @param {string} servicePath - Path with optional {token} placeholders, from configuration.
 * @param {Object} context     - Values those placeholders resolve against.
 * @returns {Promise<Object|null>} - The schema as the service sent it, or null.
 */
export const fetchSchema = async (servicePath, context = {}) => {
  if (!servicePath) return null;

  const url = `${window.server}${bindPath(servicePath, context)}`;

  const response = await axios.get(url).catch((err) => {
    console.error(`perun-atlas: no form schema from ${url}`, err);
    return null;
  });

  if (!response) return null;

  const schema = response.data;

  if (!schema || typeof schema !== 'object' || !schema.properties) {
    console.error(`perun-atlas: ${url} answered with no JSON Schema, so the form cannot be built`, schema);
    return null;
  }

  return schema;
};

/**
 * A schema narrowed to the fields a row asked for, in the order it asked.
 *
 * Order, because a table's own order is the order of a page whose layout this
 * row is not -- and because a row that names three fields has said what it
 * wants them to look like.
 *
 * A name is matched as a whole key first, and split at its last dot only if
 * that fails. That order is what makes a group work at all: these schemas key a
 * group by a dotted string -- one key, with a dot in it, holding the group's
 * fields -- so `"a.b"` is ambiguous between a group and a field, and the key
 * that exists wins. `"a.b.FIELD"` then reaches the field inside the group
 * `"a.b"`, because the split is at the last dot rather than the first.
 *
 * The group stays a group. Flattening it is the one change here that would look
 * harmless and is not: the backend reads a group by looking its dotted name up
 * as a single key, and a body that split or flattened it has every field under
 * that name skipped -- with the record saved and the fields simply missing.
 *
 * `required` is narrowed with the properties it names, at both levels. A
 * `required` naming a field that is no longer on the form is a form that cannot
 * be filled in and a Save that never comes back.
 *
 * @param {Object} schema - A JSON Schema, as a service sent it.
 * @param {string[]} [pick] - Field names; absent or empty leaves the schema alone.
 * @returns {Object|null} A narrowed copy, or the schema itself when nothing was picked.
 */
export const pickFields = (schema, pick) => {
  if (!schema?.properties || !pick?.length) return schema ?? null;

  const source = schema.properties;
  const properties = {};
  const whole = new Set();

  pick.forEach((name) => {
    if (Object.prototype.hasOwnProperty.call(source, name)) {
      properties[name] = source[name];
      whole.add(name);
      return;
    }

    const cut = name.lastIndexOf('.');
    const groupName = cut === -1 ? '' : name.slice(0, cut);
    const field = cut === -1 ? '' : name.slice(cut + 1);
    const group = groupName ? source[groupName] : null;
    const definition = group?.properties?.[field];

    if (!definition) {
      // A row naming a field the table does not have is the one mistake a
      // narrowed form cannot show for itself: the field is not on it, which
      // looks exactly like a field nobody asked for.
      console.warn(`perun-atlas: the form schema has no "${name}", so it is not on the form`);
      return;
    }

    // Already taken whole. A row naming a group and a field inside it gets the
    // group, in whichever order the two were written.
    if (whole.has(groupName)) return;

    const held = properties[groupName] ?? { ...group, properties: {} };
    held.properties = { ...held.properties, [field]: definition };
    properties[groupName] = held;
  });

  Object.keys(properties).forEach((name) => {
    if (whole.has(name)) return;
    const group = properties[name];
    const mandatory = (source[name].required ?? []).filter((field) => field in group.properties);
    if (mandatory.length) group.required = mandatory;
    else delete group.required;
  });

  const out = { ...schema, properties };

  // The table's title, dropped: three of its fields are not that table, and a
  // narrowed form headed with the whole table's name says something untrue in
  // the largest text on the row. A row wanting a heading writes one in
  // `uiSchema` under `ui:title`.
  delete out.title;

  const mandatory = (schema.required ?? []).filter((name) => name in properties);
  if (mandatory.length) out.required = mandatory;
  else delete out.required;

  // Keyed by the field that drives it, so a dependency whose driver is off the
  // form has nothing left to react to. Filtered rather than dropped, because
  // every schema measured here has none and that should stay visible.
  if (out.dependencies) {
    const live = Object.entries(out.dependencies).filter(([name]) => name in properties);
    if (live.length) out.dependencies = Object.fromEntries(live);
    else delete out.dependencies;
  }

  return out;
};
