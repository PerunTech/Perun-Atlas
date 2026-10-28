import { axios } from 'perun-core';
import { bindPath, valueAt } from './path';
import { pointIn, ringIn, unitsPerMetre } from './project';

// These services read the key of the first form entry as the whole payload. Percent-encoded because
// the container decodes the body first, and a bare `&`, `=` or `+` would mangle it.
const asFormBody = (payload) => encodeURIComponent(JSON.stringify(payload));

// Spaces only: encoding substituted values in bindPath would rewrite bounding boxes that work today.
const asPath = (path) => path.replace(/ /g, '%20');

const encodeBody = (body, encoding, contentType) => {
  if (body === undefined || body === null) return '';
  if (encoding === 'form' || (!encoding && /form-urlencoded/.test(contentType ?? ''))) {
    return asFormBody(body);
  }
  return JSON.stringify(body);
};

// A refusal arrives as `{"type":"ERROR"}` under a 200, as a bare label code under a 200 (matched by the
// row's `failure`), or as an HTTP error.
const verdictOf = (data, failure) => {
  const envelope = typeof data === 'string' ? tryParse(data) : data;
  const type = String(envelope?.type ?? '').toUpperCase();

  if (type === 'ERROR' || type === 'EXCEPTION') {
    return { ok: false, message: [envelope?.title, envelope?.message].filter(Boolean).join(' — ') };
  }

  if (failure && typeof data === 'string') {
    const said = new RegExp(failure, 'i').test(data);
    if (said) return { ok: false, message: data.trim().slice(0, 300) };
  }

  return { ok: true, message: null };
};

const tryParse = (text) => {
  try { return JSON.parse(text); } catch { return null; }
};

// A body that is exactly one placeholder takes the value itself, so a number or a shape isn't sent
// as a string.
const SOLE_PLACEHOLDER = /^\{([^{}]+)\}$/;

// `"..."` spreads what it names into the enclosing object, so `{form}` can sit beside a geometry.
// Later keys win, as in an object literal.
const SPREAD_KEY = '...';

// An unmatched placeholder, or a spread of a non-object, is left visible rather than silently dropped.
export const fillBody = (template, context) => {
  if (typeof template === 'string') {
    const sole = template.match(SOLE_PLACEHOLDER);
    if (sole) {
      const value = valueAt(context, sole[1]);
      return value === undefined || value === null ? template : value;
    }
    return bindPath(template, context);
  }
  if (Array.isArray(template)) return template.map((item) => fillBody(item, context));
  if (template && typeof template === 'object') {
    const out = {};

    Object.entries(template).forEach(([key, value]) => {
      const filled = fillBody(value, context);

      if (key === SPREAD_KEY) {
        const spreadable = filled && typeof filled === 'object' && !Array.isArray(filled);
        if (spreadable) Object.assign(out, filled);
        else out[key] = filled;
        return;
      }

      out[key] = filled;
    });

    return out;
  }
  return template;
};

// Never throws: a rejected promise reaching a render blanks the screen.
export const postTo = async (servicePath, context = {}, options = {}) => {
  const { body, contentType = 'application/x-www-form-urlencoded', encoding, failure } = options;
  const url = `${window.server}${asPath(bindPath(servicePath, context))}`;

  try {
    const response = await axios({
      method: 'post',
      url,
      headers: { 'Content-Type': contentType },
      data: encodeBody(body, encoding, contentType)
    });

    const verdict = verdictOf(response?.data, failure);
    if (!verdict.ok) {
      // A refusal is usually about the URL or the payload, and the service rarely says which.
      console.error(`perun-atlas: ${url} refused the save`, response?.data);
      console.error('perun-atlas: the payload was', body);
    }

    return { ...verdict, data: response?.data };
  } catch (err) {
    console.error(`perun-atlas: save to ${url} failed`, err);
    return { ok: false, message: err?.message ?? String(err), data: null };
  }
};

// The radius goes from ground metres to stored units here; unconverted, it is a fifth too small at
// these latitudes. Rounded, because some services parse it as an integer.
export const shapeContext = (shape, { draw, dataSrid, bindings, note, selected, form, map }) => {
  const centre = { lat: shape.lat, lng: shape.lng };
  const { x, y } = pointIn(centre, dataSrid, map);
  const units = shape.radius * unitsPerMetre(centre, dataSrid, map);
  const radius = Math.round(units);

  const vertices = ringIn(centre, shape.radius, dataSrid, draw.points, map);

  // The row formats the ring, since the syntax is the service's. Defaults to WKT coordinate pairs.
  const ring = vertices
    .map((vertex) => bindPath(draw.ring?.point ?? '{x} {y}', vertex))
    .join(draw.ring?.join ?? ', ');

  // Closed, unlike the ring: GeoJSON requires it, and the services that parse a ring close it themselves.
  const geojson = {
    type: 'Polygon',
    coordinates: [[...vertices, vertices[0]].map((vertex) => [vertex.x, vertex.y])]
  };

  // Storing degrees, a small radius rounds to 0; such a row wants `{draw.metres}` or the ring.
  const sendsUnits = [draw.save.onSave, JSON.stringify(draw.save.body ?? null)]
    .some((text) => String(text).includes('{draw.radius}'));

  const context = {
    ...bindings,
    note,
    draw: {
      lat: shape.lat,
      lng: shape.lng,
      metres: Math.round(shape.radius),
      x,
      y,
      radius,
      ring,
      geojson,
      // Absent unless asked for, so an unconfigured `{draw.selected.ids}` stays visibly unresolved.
      ...(selected ? { selected } : {})
    },
    // Spread into a body with `"...": "{form}"`.
    ...(draw.form ? { form } : {})
  };

  return { context, units, tooSmall: sendsUnits && !(radius >= 1) };
};
