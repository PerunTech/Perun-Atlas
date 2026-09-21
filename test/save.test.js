import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('perun-core', () => ({ axios: vi.fn(), utils: {}, elements: {} }));

const { axios } = await import('perun-core');
const { fillBody, postTo } = await import('../frontend/data/save');

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
});

describe('postTo', () => {
  beforeEach(() => {
    globalThis.window = { server: 'https://host/services' };
    axios.mockReset();
  });
  afterEach(() => { delete globalThis.window; });

  const sent = () => axios.mock.calls[0][0];

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
    const answer = await postTo('/Ws', {});
    expect(answer.ok).toBe(false);
    expect(answer.message).toBe('No — because');
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

  it('calls a success a success', async () => {
    axios.mockResolvedValue({ data: 'epi.success.save_quarantine_via_map' });
    expect((await postTo('/Ws', {}, { failure: 'error' })).ok).toBe(true);
  });

  /**
   * Never throws. A write is started by someone pressing a button, and a
   * rejected promise reaching a render is a blank screen where a message
   * belongs.
   */
  it('answers a transport failure in the same shape as every other outcome', async () => {
    axios.mockRejectedValue(new Error('Network Error'));
    expect(await postTo('/Ws', {})).toEqual({ ok: false, message: 'Network Error', data: null });
  });
});
