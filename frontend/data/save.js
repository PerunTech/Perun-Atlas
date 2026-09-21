import { axios } from 'perun-core';
import { bindPath, valueIn } from './geometry';

/**
 * Sending something back.
 *
 * Every other file in `data/` reads. This one writes, and it is the first thing
 * in the package that does, so the rules it follows are worth stating rather
 * than inferring.
 *
 * It knows nothing about what it is saving. A path from configuration, a body
 * from configuration, and the same `{token}` substitution every read here
 * already does -- which is what lets a screen that draws a shape post it to a
 * service this package has never heard of.
 */

/**
 * A JSON document posted as though it were a form.
 *
 * Several of these services declare `application/x-www-form-urlencoded` and then
 * read the *key* of the first form entry as the whole payload, so the body is
 * one percent-encoded JSON document with nothing on the other side of an `=`.
 * That is not a workaround: it is what the screens in these registries do, and
 * the services parse nothing else.
 *
 * Percent-encoded rather than raw because the container decodes the body before
 * the service sees it -- a bare `&` or `=` inside a value would cut the document
 * in half, and a bare `+` would arrive as a space.
 */
const asFormBody = (payload) => encodeURIComponent(JSON.stringify(payload));

/**
 * The one character a path cannot carry as itself.
 *
 * These services take structured values as path segments -- a point printed as
 * text, a comma-separated box -- and parentheses and commas are legal there.
 * A space is not, and a configured path that contains one is a path whose
 * service asked for it. Encoded here rather than in `bindPath`, which every read
 * in this package shares: encoding a substituted value would rewrite bounding
 * boxes that have worked for as long as there have been maps here.
 */
const asPath = (path) => path.replace(/ /g, '%20');

/**
 * What the body looks like on the wire.
 *
 * Named by the caller where it matters, and inferred from the content type
 * otherwise, because the two go together in practice and a screen configuring
 * one and forgetting the other should still send something a service can read.
 */
const encodeBody = (body, encoding, contentType) => {
  if (body === undefined || body === null) return '';
  if (encoding === 'form' || (!encoding && /form-urlencoded/.test(contentType ?? ''))) {
    return asFormBody(body);
  }
  return JSON.stringify(body);
};

/**
 * Whether the service accepted it.
 *
 * Three habits, and a screen meets all three. Most of these services answer a
 * failure with HTTP 200 and `{"type":"ERROR"}` in the body, so the status line
 * says nothing. Some answer with a bare label code -- `x.success.thing` or
 * `x.error.thing` -- which is a 200 carrying a string, and a client that trusts
 * the status reports a save that did not happen. And a few do use the status.
 *
 * The first and the third are read here because they are conventions rather than
 * domain knowledge. The second cannot be: `error` is a word in one deployment's
 * label codes, and this package does not know which word. So a row that talks to
 * such a service says what its refusal looks like, in `failure`, and a row that
 * does not is answered the way every other client here answers -- by the
 * envelope, or by the status.
 */
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

/**
 * A string that is one placeholder and nothing else.
 *
 * `bindPath` answers with text, which is what a path wants and what a sentence
 * wants. A body is the case where the placeholder *is* the value: a service
 * expecting a number reads `"5439"` and rejects it, and one expecting a shape
 * reads that shape's JSON as a quoted string. So a template that is exactly one
 * placeholder resolves to what it names -- an object, an array, a number -- and
 * a placeholder with anything either side of it is interpolated as before.
 *
 * Deliberately strict about the braces: `"{a}{b}"` and `" {a}"` are text with
 * substitutions in them, and a body that turned either into a value would be
 * guessing at what the row meant.
 */
const SOLE_PLACEHOLDER = /^\{([^{}]+)\}$/;

/**
 * A configured payload, with its placeholders resolved.
 *
 * The same `{token}` substitution the paths take, applied through a body of any
 * shape -- nested objects and arrays included, because these services want their
 * fields sorted into sections and a menu row writes that structure literally.
 *
 * An unmatched placeholder is left standing, as `bindPath` leaves one. In a path
 * that produces a request that fails loudly; in a body it produces a record with
 * `{note}` written in a field, which is worse to read and better than a record
 * saved with a value silently dropped. A sole placeholder that resolves to
 * nothing is left standing as its own text for the same reason.
 */
export const fillBody = (template, context) => {
  if (typeof template === 'string') {
    const sole = template.match(SOLE_PLACEHOLDER);
    if (sole) {
      const value = valueIn(sole[1], context);
      return value === undefined || value === null ? template : value;
    }
    return bindPath(template, context);
  }
  if (Array.isArray(template)) return template.map((item) => fillBody(item, context));
  if (template && typeof template === 'object') {
    return Object.fromEntries(Object.entries(template).map(([key, value]) => [key, fillBody(value, context)]));
  }
  return template;
};

/**
 * Posts something to a configured service.
 *
 * Never throws. A write is started by someone pressing a button, and a rejected
 * promise reaching a render is a blank screen where a message belongs -- so
 * every outcome comes back as the same shape and the caller decides what to say.
 *
 * @param {string} servicePath - Path with {token} placeholders, from configuration.
 * @param {Object} context     - Values those placeholders resolve against.
 * @param {Object} [options]
 * @param {Object} [options.body]        - The payload, with its placeholders already resolved.
 * @param {string} [options.contentType] - Defaults to the form convention above.
 * @param {string} [options.encoding]    - 'form' or 'json'; inferred from the content type.
 * @param {string} [options.failure]     - Pattern that marks a refusal in a plain-text answer.
 * @returns {Promise<{ok: boolean, message: ?string, data: *}>}
 */
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
      // The URL and the payload together, because a refusal is usually about
      // one of the two and the service that refused rarely says which. A
      // service answering with a bare code keeps its reason in its own log,
      // which is the next place to look and not a place this can reach.
      console.error(`perun-atlas: ${url} refused the save`, response?.data);
      console.error('perun-atlas: the payload was', body);
    }

    return { ...verdict, data: response?.data };
  } catch (err) {
    console.error(`perun-atlas: save to ${url} failed`, err);
    return { ok: false, message: err?.message ?? String(err), data: null };
  }
};
