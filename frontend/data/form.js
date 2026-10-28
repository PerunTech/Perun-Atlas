import { axios } from 'perun-core';
import { bindPath } from './path';

// Null on failure, so the caller can refuse the save: an empty schema renders a form with no fields.
// A refusal comes back as a bare label code under a 200, hence the shape check.
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

export const fetchSchema = (servicePath, context = {}) =>
  fetchDocument(servicePath, context, 'form schema', (body) => isObject(body) && Boolean(body.properties));

// Null here refuses nothing; the form falls back to the default widgets.
export const fetchUISchema = (servicePath, context = {}) =>
  fetchDocument(servicePath, context, 'form layout', isObject);

// A name is matched whole first, then split at its last dot, because groups are keyed by a dotted
// string. Groups stay groups: the backend looks one up by its dotted name and skips it otherwise.
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
      // Otherwise invisible: a missing field looks like one nobody asked for.
      console.warn(`perun-atlas: the form schema has no "${name}", so it is not on the form`);
      return;
    }

    // A group named whole wins over a field inside it.
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

  // A few of the table's fields are not the table.
  delete out.title;

  const mandatory = (schema.required ?? []).filter((name) => name in properties);
  if (mandatory.length) out.required = mandatory;
  else delete out.required;

  // Keyed by the driving field, so drop those whose driver is off the form.
  if (out.dependencies) {
    const live = Object.entries(out.dependencies).filter(([name]) => name in properties);
    if (live.length) out.dependencies = Object.fromEntries(live);
    else delete out.dependencies;
  }

  return out;
};

// RJSF keeps its defaults to itself, so an untouched form is `{}`, which a group's own `required`
// never sees. Validating against this copy reports them; what is sent is still what was typed.
export const withGroups = (formData, schema) => {
  if (!schema?.properties) return formData ?? {};

  const out = { ...(formData ?? {}) };

  Object.entries(schema.properties).forEach(([name, property]) => {
    // Generated schemas sometimes give a group no type.
    if (property?.properties) out[name] = withGroups(out[name], property);
  });

  return out;
};

// RJSF 5's widget names; its registry is not importable from here. An unknown `ui:widget` throws
// mid-render and takes the panel with it.
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

const ANY_ALIAS = new Set(Object.values(ALIASES).flat());

const drawable = (widget, type) => COMPONENTS.has(widget)
  || (type ? (ALIASES[type] ?? []).includes(widget) : ANY_ALIAS.has(widget));

// A dropped widget falls back to the one its schema implies, e.g. a date input for `format: date`.
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

      // `ui:` keys hold options, not fields.
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
