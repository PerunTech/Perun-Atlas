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
 * One of the two documents a form is made of, fetched.
 *
 * Failure is null rather than an empty object, and for the schema that is the
 * whole point: an empty schema renders as a form with no fields and a live Save
 * above it, which is a record written with everything the form was there to
 * carry missing. Null is the caller's signal to say so and refuse the save.
 *
 * The shape check is not defensive dressing. These services answer a refusal
 * with a bare label code -- a string, under a 200 -- so a body that is not the
 * document asked for is the ordinary shape of an expired session or a table this
 * user may not read, and handing it to RJSF would be an exception thrown from
 * inside a form rather than a sentence in the console.
 */
const fetchDocument = async (servicePath, context, what, usable) => {
  if (!servicePath) return null;

  const url = `${window.server}${bindPath(servicePath, context)}`;

  const response = await axios.get(url).catch((err) => {
    console.error(`perun-atlas: no ${what} from ${url}`, err);
    return null;
  });

  if (!response) return null;

  const body = response.data;

  if (!usable(body)) {
    console.error(`perun-atlas: ${url} answered with no ${what}`, body);
    return null;
  }

  return body;
};

const isObject = (body) => Boolean(body) && typeof body === 'object' && !Array.isArray(body);

/**
 * Fetches the schema a form is built from: the fields, and which are mandatory.
 *
 * @param {string} servicePath - Path with optional {token} placeholders, from configuration.
 * @param {Object} context     - Values those placeholders resolve against.
 * @returns {Promise<Object|null>} - The schema as the service sent it, or null.
 */
export const fetchSchema = (servicePath, context = {}) =>
  fetchDocument(servicePath, context, 'form schema', (body) => isObject(body) && Boolean(body.properties));

/**
 * Fetches the layout beside it: which widget a field is drawn with, and how.
 *
 * Its own request because it is its own service, and the two are paired by
 * field name at the far end. A deployment keeps this in `GUI_METADATA` beside
 * the field it belongs to, which is why it can be asked for by table and why it
 * is worth asking for: the dates, the text areas and the read-only fields are
 * already decided there.
 *
 * Null when it does not arrive, and that is not a reason to refuse anything.
 * A form that renders in the default widgets is a form; a form missing a field
 * is a record missing a value.
 */
export const fetchUISchema = (servicePath, context = {}) =>
  fetchDocument(servicePath, context, 'form layout', isObject);

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
  // narrowed form carrying the whole table's name says something untrue about
  // itself to anything that reads the schema rather than the screen. On the
  // screen it shows nowhere in any case -- the draw row hides the legends RJSF
  // draws a title as, because each one costs a line of a toolbar.
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

/**
 * The widget names this form can draw, transcribed from RJSF 5.
 *
 * `ui:widget` naming something the form's registry does not have is not a field
 * that renders plainly -- it is an exception thrown out of the middle of a
 * render, which takes the panel with it. And a table's layout is full of names
 * like that: a deployment's own widgets are registered by the component that
 * renders its record forms, and this row is not one of them. It is a toolbar
 * with a `Form` in it.
 *
 * So the names are listed rather than the registry asked, for the reason the
 * icons are drawn rather than imported: what would have to be asked is not
 * exported by anything this package is allowed to import. `@rjsf/core` exports
 * `getDefaultRegistry` and the shell does not re-export it, and the alias table
 * lives in `@rjsf/utils`, which is the shell's dependency and not this
 * package's. Two lists that change on a major version, against a crash that
 * takes the screen down.
 *
 * By type, because RJSF's map is by type: `updown` is a number widget, and
 * asking for it on a string throws exactly as loudly as a name nobody has.
 */
const ALIASES = {
  boolean: ['checkbox', 'radio', 'select', 'hidden'],
  string: ['text', 'password', 'email', 'hostname', 'ipv4', 'ipv6', 'uri', 'data-url', 'radio',
    'select', 'textarea', 'hidden', 'date', 'datetime', 'date-time', 'alt-date', 'alt-datetime',
    'time', 'color', 'file'],
  number: ['text', 'select', 'updown', 'range', 'radio', 'hidden'],
  integer: ['text', 'select', 'updown', 'range', 'radio', 'hidden'],
  array: ['select', 'checkboxes', 'files', 'hidden']
};

/** The registry's own component names, which `ui:widget` may also name directly. */
const COMPONENTS = new Set(['AltDateTimeWidget', 'AltDateWidget', 'CheckboxWidget', 'CheckboxesWidget',
  'ColorWidget', 'DateTimeWidget', 'DateWidget', 'EmailWidget', 'FileWidget', 'HiddenWidget',
  'PasswordWidget', 'RadioWidget', 'RangeWidget', 'SelectWidget', 'TextWidget', 'TextareaWidget',
  'TimeWidget', 'URLWidget', 'UpDownWidget']);

/** Every alias, for a field whose type this could not find. */
const ANY_ALIAS = new Set(Object.values(ALIASES).flat());

const drawable = (widget, type) => COMPONENTS.has(widget)
  || (type ? (ALIASES[type] ?? []).includes(widget) : ANY_ALIAS.has(widget));

/**
 * A layout with the widgets this form cannot draw taken out of it.
 *
 * Everything else is kept: `ui:readonly`, `ui:options`, a title, a placeholder,
 * an order, and the widgets that are RJSF's own -- `textarea` and `hidden` are
 * most of what these tables actually ask for. A field whose widget is dropped
 * falls back to the one its schema implies, which for the dates these services
 * describe as `{ type: "string", format: "date" }` is a date input.
 *
 * Walked against the schema rather than alone, because the question is per
 * field: `updown` is a widget, on a number. Where the schema has nothing to say
 * about a node, any of RJSF's names is allowed through -- a layout deeper than
 * its schema is a question this cannot answer, and refusing it would take out
 * entries that were never a problem.
 *
 * Said in the console once per form, naming what was dropped, because a field
 * that quietly lost its widget is a field someone chose that widget for.
 *
 * @param {Object} uiSchema - The layout, from a service or from a row.
 * @param {Object} [schema] - The schema it accompanies, for the types.
 * @returns {Object|null} A copy, or the layout itself when nothing was dropped.
 */
export const usableUI = (uiSchema, schema) => {
  if (!isObject(uiSchema)) return uiSchema ?? null;

  const dropped = [];

  const walk = (node, shape) => {
    const out = {};

    Object.entries(node).forEach(([key, value]) => {
      if (key === 'ui:widget' && typeof value === 'string' && !drawable(value, shape?.type)) {
        dropped.push(value);
        return;
      }

      // `items` is a layout for what an array holds; every other object key is
      // a field, and `ui:` keys are settings rather than fields -- their
      // contents are options, not a place a widget is named.
      const deeper = key === 'items' ? shape?.items : shape?.properties?.[key];
      out[key] = isObject(value) && !key.startsWith('ui:') ? walk(value, deeper) : value;
    });

    return out;
  };

  const out = walk(uiSchema, schema);

  if (dropped.length) {
    console.warn(
      `perun-atlas: this form cannot draw ${[...new Set(dropped)].map((name) => `"${name}"`).join(', ')}`
      + ' -- those are the widgets a record form registers, and the draw row is not one. '
      + 'The fields keep the widget their schema implies.'
    );
  }

  return dropped.length ? out : uiSchema;
};
