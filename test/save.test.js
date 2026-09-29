import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('perun-core', () => ({ axios: vi.fn(), utils: {}, elements: {} }));

const { axios } = await import('perun-core');
const { fillBody, postTo, shapeContext } = await import('../frontend/data/save');
const { pointIn, ringIn, unitsPerMetre } = await import('../frontend/data/project');

describe('fillBody', () => {
  const context = {
    note: 'Outbreak 12',
    draw: { metres: 1500, x: 33.941707, y: 35.124805, geojson: { type: 'Polygon', coordinates: [[[1, 2]]] } }
  };

  /**
   * The distinction the whole function exists for. A service expecting a number
   * rejects `"1500"`, and one expecting a shape reads that shape's JSON as a
   * quoted string -- so a template that is exactly one placeholder resolves to
   * what it names, and one with anything either side of it is interpolated.
   */
  it('resolves a string that is nothing but a placeholder to the value itself', () => {
    expect(fillBody('{draw.metres}', context)).toBe(1500);
    expect(fillBody('{draw.geojson}', context)).toEqual(context.draw.geojson);
  });

  it('interpolates a placeholder with anything either side of it', () => {
    expect(fillBody('{draw.metres} m', context)).toBe('1500 m');
    expect(fillBody('{draw.x},{draw.y}', context)).toBe('33.941707,35.124805');
  });

  it('walks nested objects and arrays', () => {
    const out = fillBody(
      { RADIUS: '{draw.metres}', centroid: ['{draw.x}', '{draw.y}'], group: { REASON: '{note}' } },
      context
    );
    expect(out).toEqual({
      RADIUS: 1500,
      centroid: [33.941707, 35.124805],
      group: { REASON: 'Outbreak 12' }
    });
  });

  /**
   * Left standing rather than dropped. A record saved with `{note}` written in
   * a field is wrong and legible; one saved with the field silently empty is
   * wrong and looks fine.
   */
  it('leaves a placeholder it cannot resolve exactly as it found it', () => {
    expect(fillBody('{draw.nothing}', context)).toBe('{draw.nothing}');
    expect(fillBody({ a: '{missing}' }, context)).toEqual({ a: '{missing}' });
  });

  it('passes a non-string through untouched', () => {
    expect(fillBody({ QUARANTINE_TYPE: 1, ok: true, none: null }, context))
      .toEqual({ QUARANTINE_TYPE: 1, ok: true, none: null });
  });

  /**
   * A form's data is already the payload the service wants, and the geometry
   * beside it never will be the form's business -- so the two have to end up in
   * one object, and a sole placeholder cannot have siblings.
   */
  describe('the spread key', () => {
    const form = {
      'quarantine.info': { DISEASE: 'FMD', STARTED: '2026-09-22' },
      EXTERNAL_ID: 'Q-4417'
    };

    it('lifts what it names into the object holding it', () => {
      expect(fillBody({ '...': '{form}', geometry: '{draw.geojson}' }, { ...context, form }))
        .toEqual({
          'quarantine.info': { DISEASE: 'FMD', STARTED: '2026-09-22' },
          EXTERNAL_ID: 'Q-4417',
          geometry: context.draw.geojson
        });
    });

    it('keeps a grouppath key whole, because that is the key the service reads', () => {
      const out = fillBody({ '...': '{form}' }, { ...context, form });
      // Not `{ quarantine: { info: ... } }`: the backend looks the dotted string
      // up as one key, so splitting it here would lose every field under it.
      expect(out['quarantine.info']).toEqual(form['quarantine.info']);
      expect(out.quarantine).toBeUndefined();
    });

    it('lets a later key win, as an object literal would', () => {
      expect(fillBody({ '...': '{form}', EXTERNAL_ID: 'fixed' }, { ...context, form }).EXTERNAL_ID)
        .toBe('fixed');
    });

    it('lets the spread win over a default written before it', () => {
      expect(fillBody({ EXTERNAL_ID: 'fallback', '...': '{form}' }, { ...context, form }).EXTERNAL_ID)
        .toBe('Q-4417');
    });

    it('resolves the placeholders inside what it spreads', () => {
      expect(fillBody({ '...': { size: '{draw.metres}' } }, context)).toEqual({ size: 1500 });
    });

    it('spreads an empty form to nothing rather than to a key', () => {
      expect(fillBody({ '...': '{form}', a: 1 }, { ...context, form: {} })).toEqual({ a: 1 });
    });

    /**
     * Left standing rather than dropped, on the same argument as an unresolved
     * placeholder: a body carrying a visible `"...": "{form}"` is a call
     * somebody looks at, and one quietly missing every field the form was meant
     * to supply is a record saved empty.
     */
    it('leaves a spread of something unspreadable in place, where it can be seen', () => {
      expect(fillBody({ '...': '{form}', a: 1 }, context)).toEqual({ '...': '{form}', a: 1 });
      expect(fillBody({ '...': '{draw.metres}' }, context)).toEqual({ '...': 1500 });
      expect(fillBody({ '...': [1, 2] }, context)).toEqual({ '...': [1, 2] });
    });

    it('is only special as a key, never as a value', () => {
      expect(fillBody({ marker: '...' }, context)).toEqual({ marker: '...' });
    });
  });
});

describe('postTo', () => {
  /**
   * `postTo` prints the URL and the payload whenever a service refuses, because
   * a refusal is usually about one of the two and the service that refused
   * rarely says which. That is deliberate, so it is asserted rather than
   * silenced -- a run where those lines stopped appearing would be a run where
   * a failed save had gone quiet.
   *
   * Captured rather than left to stderr for the ordinary reason: a suite that
   * prints a stack trace on a passing test has taught its reader to skim the
   * output, which is where a real one then hides.
   */
  let logged;

  beforeEach(() => {
    globalThis.window = { server: 'https://host/services' };
    axios.mockReset();
    logged = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    logged.mockRestore();
    delete globalThis.window;
  });

  const sent = () => axios.mock.calls[0][0];
  const said = () => logged.mock.calls.flat().join(' ');

  it('binds the path and prefixes the shell\'s server', async () => {
    axios.mockResolvedValue({ data: 'x.success.saved' });
    await postTo('/Ws/save/{session}/0', { session: 'abc' });
    expect(sent().url).toBe('https://host/services/Ws/save/abc/0');
  });

  it('encodes a space, which is the one character a path cannot carry', async () => {
    axios.mockResolvedValue({ data: '' });
    await postTo('/Ws/save/{shape}', { shape: 'POINT(1 2)' });
    expect(sent().url).toBe('https://host/services/Ws/save/POINT(1%202)');
  });

  it('sends JSON as JSON when the content type says so', async () => {
    axios.mockResolvedValue({ data: '' });
    await postTo('/Ws', {}, { body: { RADIUS: 1500 }, contentType: 'application/json' });
    expect(sent().data).toBe('{"RADIUS":1500}');
    expect(sent().headers['Content-Type']).toBe('application/json');
  });

  /**
   * The form convention these registries actually use: one percent-encoded JSON
   * document as the *key* of the first form entry, with nothing after an `=`.
   */
  it('sends one percent-encoded document when the content type is a form', async () => {
    axios.mockResolvedValue({ data: '' });
    await postTo('/Ws', {}, { body: { A: 'x&y' } });
    expect(sent().data).toBe(encodeURIComponent('{"A":"x&y"}'));
  });

  it('reads a refusal out of an envelope that came back with a 200', async () => {
    axios.mockResolvedValue({ data: { type: 'ERROR', title: 'No', message: 'because' } });
    const answer = await postTo('/Ws', {}, { body: { A: 1 } });
    expect(answer.ok).toBe(false);
    expect(answer.message).toBe('No — because');
    // Both halves, because a refusal is about one of them and rarely says which.
    expect(said()).toContain('https://host/services/Ws');
    expect(logged.mock.calls.some(call => call.includes('perun-atlas: the payload was'))).toBe(true);
  });

  it('reads the same envelope when it arrives as a string', async () => {
    axios.mockResolvedValue({ data: '{"type":"EXCEPTION","title":"Boom"}' });
    expect((await postTo('/Ws', {})).ok).toBe(false);
  });

  /**
   * A service answering a write with a bare label code and a 200. `failure` is
   * how a menu row says what a refusal looks like, because `error` is a word in
   * one deployment's label codes and this package does not know which word.
   */
  it('reads a bare label code only when the row said what a refusal reads like', async () => {
    axios.mockResolvedValue({ data: 'epi.error.save_quarantine_via_map' });
    expect((await postTo('/Ws', {})).ok).toBe(true);
    expect((await postTo('/Ws', {}, { failure: 'error' })).ok).toBe(false);
  });

  it('calls a success a success, and says nothing about it', async () => {
    axios.mockResolvedValue({ data: 'epi.success.save_quarantine_via_map' });
    expect((await postTo('/Ws', {}, { failure: 'error' })).ok).toBe(true);
    expect(logged).not.toHaveBeenCalled();
  });

  /**
   * Never throws. A write is started by someone pressing a button, and a
   * rejected promise reaching a render is a blank screen where a message
   * belongs.
   */
  it('answers a transport failure in the same shape as every other outcome', async () => {
    axios.mockRejectedValue(new Error('Network Error'));
    expect(await postTo('/Ws', {})).toEqual({ ok: false, message: 'Network Error', data: null });
    expect(said()).toContain('save to https://host/services/Ws failed');
  });
});

describe('shapeContext', () => {
  /** A circle in the deployment's own latitudes, where the scale error is worth having. */
  const CENTRE = { lat: 35.124805, lng: 33.941707 };
  const SHAPE = { ...CENTRE, radius: 1499.6 };
  const METRES = { save: { onSave: '/Ws/save/{draw.metres}' } };
  const UNITS = { save: { onSave: '/Ws/save/{draw.radius}' } };

  const drawn = (draw, params = {}) => shapeContext(SHAPE, { draw, dataSrid: 3857, ...params });

  it('keeps the centre in degrees and puts x and y in the stored projection', () => {
    const { lat, lng, x, y } = drawn(METRES).context.draw;
    expect({ lat, lng }).toEqual(CENTRE);
    expect({ x, y }).toEqual(pointIn(CENTRE, 3857));
    expect(shapeContext(SHAPE, { draw: METRES, dataSrid: 4326 }).context.draw)
      .toMatchObject({ x: CENTRE.lng, y: CENTRE.lat });
  });

  it('rounds the ground radius to whole metres', () => {
    expect(drawn(METRES).context.draw.metres).toBe(1500);
  });

  /**
   * The conversion the function exists for. A Web Mercator metre is 0.82
   * ground metres here, so the stored radius is a fifth longer than the drawn
   * one -- and rounded, because these services parse it as an integer.
   */
  it('converts the radius into the stored projection and rounds it', () => {
    const { context, units } = drawn(METRES);
    expect(units).toBeCloseTo(1499.6 * unitsPerMetre(CENTRE, 3857), 9);
    expect(context.draw.radius).toBe(Math.round(units));
    expect(context.draw.radius).toBeGreaterThan(1800);
  });

  it('writes the ring as open WKT pairs, one per vertex, by default', () => {
    const vertices = ringIn(CENTRE, 1499.6, 3857);
    const pairs = drawn(METRES).context.draw.ring.split(', ');
    expect(pairs).toHaveLength(24);
    expect(pairs[0]).toBe(`${vertices[0].x} ${vertices[0].y}`);
    expect(pairs[23]).toBe(`${vertices[23].x} ${vertices[23].y}`);
    expect(pairs[0]).not.toBe(pairs[23]);
  });

  it('writes the ring the way the row says, with the vertex count it asks for', () => {
    const ring = drawn({ ...METRES, points: 8, ring: { point: '[{x},{y}]', join: ';' } }).context.draw.ring;
    const parts = ring.split(';');
    expect(parts).toHaveLength(8);
    parts.forEach((part) => expect(part).toMatch(/^\[-?[\d.]+,-?[\d.]+\]$/));
  });

  /**
   * Closed, where the ring is open: GeoJSON says a linear ring repeats its
   * first position as its last, and the services that parse the WKT ring close
   * it themselves.
   */
  it('closes the GeoJSON polygon the WKT ring leaves open', () => {
    const vertices = ringIn(CENTRE, 1499.6, 3857, 8);
    const { geojson } = drawn({ ...METRES, points: 8 }).context.draw;
    expect(geojson.type).toBe('Polygon');
    expect(geojson.coordinates).toHaveLength(1);
    expect(geojson.coordinates[0]).toHaveLength(9);
    expect(geojson.coordinates[0][0]).toEqual([vertices[0].x, vertices[0].y]);
    expect(geojson.coordinates[0][8]).toEqual(geojson.coordinates[0][0]);
  });

  it('puts the bindings and the note beside the shape', () => {
    const { context } = drawn(METRES, { bindings: { session: 'abc', objectId: 7 }, note: 'Outbreak 12' });
    expect(context).toMatchObject({ session: 'abc', objectId: 7, note: 'Outbreak 12' });
  });

  it("lets the shape's own keys win over a binding of the same name", () => {
    const { context } = drawn(METRES, { bindings: { note: 'bound', draw: 'bound' }, note: '' });
    expect(context.note).toBe('');
    expect(context.draw.metres).toBe(1500);
  });

  /**
   * Absent rather than empty: an empty selection in the context is a
   * placeholder that resolves to nothing, where a missing one stays visibly
   * unconfigured.
   */
  it('names a selection only when there is one', () => {
    expect(drawn(METRES).context.draw).not.toHaveProperty('selected');
    expect(drawn(METRES, { selected: { ids: '4,5' } }).context.draw.selected).toEqual({ ids: '4,5' });
  });

  it('carries the form only for a row that configures one', () => {
    const typed = { EXTERNAL_ID: 'Q-4417' };
    expect(drawn(METRES, { form: typed }).context).not.toHaveProperty('form');
    expect(drawn({ ...METRES, form: { schema: {} } }, { form: typed }).context.form).toEqual(typed);
  });

  describe('a radius too small to send', () => {
    /**
     * A deployment storing degrees measures 1500 m as 0.0165 of a unit, which
     * rounds to nothing -- a save that fails somewhere deep or stores a shape
     * with no extent.
     */
    it('is refused in degrees when the path sends the radius', () => {
      const { context, units, tooSmall } = shapeContext(SHAPE, { draw: UNITS, dataSrid: 4326 });
      expect(tooSmall).toBe(true);
      expect(context.draw.radius).toBe(0);
      expect(units).toBeCloseTo(1499.6 * unitsPerMetre(CENTRE, 4326), 12);
    });

    it('is refused when the body sends it', () => {
      const draw = { save: { onSave: '/Ws/save', body: { geometry: { R: '{draw.radius}' } } } };
      expect(shapeContext(SHAPE, { draw, dataSrid: 4326 }).tooSmall).toBe(true);
    });

    it('is no concern when the row sends metres instead', () => {
      const draw = { save: { onSave: '/Ws/save/{draw.metres}', body: { ring: '{draw.ring}' } } };
      expect(shapeContext(SHAPE, { draw, dataSrid: 4326 }).tooSmall).toBe(false);
    });

    it('is no concern in a projection measured in metres', () => {
      expect(drawn(UNITS).tooSmall).toBe(false);
    });

    it('lets through a radius of one unit, the smallest an integer can carry', () => {
      const oneDegree = { ...CENTRE, radius: 1 / unitsPerMetre(CENTRE, 4326) };
      const { context, tooSmall } = shapeContext(oneDegree, { draw: UNITS, dataSrid: 4326 });
      expect(context.draw.radius).toBe(1);
      expect(tooSmall).toBe(false);
    });

    it('catches a circle with no size at all, whatever the projection', () => {
      expect(shapeContext({ ...CENTRE, radius: 0 }, { draw: UNITS, dataSrid: 3857 }).tooSmall).toBe(true);
    });
  });
});
