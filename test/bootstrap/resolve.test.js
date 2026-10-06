import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('perun-core', () => ({ axios: { get: vi.fn() }, utils: {}, elements: {} }));

const { axios } = await import('perun-core');
const { resolve } = await import('../../frontend/bootstrap/resolve');

const SERVER = 'https://svarog.test';
const PARAMS = `${SERVER}/WsConf/params/get/sys/`;

/**
 * The parameters SVAROG_SYS_PARAMS holds, by name. A name left out answers as
 * the service does for an unseeded one: with no VALUE.
 */
let seeded = {};
let warn;

beforeEach(() => {
  seeded = {};
  globalThis.window = { server: SERVER };
  axios.get.mockImplementation(async (url) => ({ data: { VALUE: seeded[url.slice(PARAMS.length)] } }));
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  delete globalThis.window;
  vi.restoreAllMocks();
  axios.get.mockReset();
});

/** The two required settings, so a test about anything else can resolve. */
const REQUIRED = { SPATIAL_CRS: 'EPSG:3857', SPATIAL_CENTER: '35.1,33.4' };

describe('resolve', () => {
  it('resolves a deployment from its parameters and the schema defaults', async () => {
    seeded = { ...REQUIRED, SPATIAL_ZOOM: '9' };
    expect(await resolve()).toEqual({
      crs: 'EPSG:3857',
      center: { lat: 35.1, lng: 33.4 },
      zoom: 9,
      minZoom: 0,
      maxZoom: 18,
      bboxOrder: false,
      units: 'metric',
      attribution: '',
      dataSrid: '4326'
    });
    expect(warn).not.toHaveBeenCalled();
  });

  it('asks for each parameter by its own name, svarog\'s srid included', async () => {
    seeded = REQUIRED;
    await resolve();
    const asked = axios.get.mock.calls.map(([url]) => url);
    expect(asked).toContain(`${PARAMS}SPATIAL_CRS`);
    expect(asked).toContain(`${PARAMS}sys.gis.default_srid`);
  });

  it('takes a parameter over a window global, and a global over a default', async () => {
    seeded = { ...REQUIRED, SPATIAL_MEASUREMENT_SYSTEM: 'metric' };
    globalThis.window.measurementSystem = 'imperial';
    globalThis.window.switchBboxOrder = 'true';
    const resolved = await resolve();
    expect(resolved.units).toBe('metric');
    expect(resolved.bboxOrder).toBe(true);
  });

  it('takes an override over everything', async () => {
    seeded = { ...REQUIRED, SPATIAL_ZOOM: '9' };
    expect((await resolve({ zoom: 14 })).zoom).toBe(14);
  });

  /**
   * A global a seeded parameter outranks is dead weight in index.html, and
   * naming it would send an administrator to change a line that does nothing.
   */
  it('warns about the globals that still decide something, and only those', async () => {
    seeded = { ...REQUIRED };
    globalThis.window.sysCrs = 'EPSG:4326';
    globalThis.window.measurementSystem = 'imperial';
    await resolve();
    expect(warn).toHaveBeenCalledTimes(1);
    const [said] = warn.mock.calls[0];
    expect(said).toMatch(/window\.measurementSystem/);
    expect(said).toMatch(/SPATIAL_MEASUREMENT_SYSTEM/);
    expect(said).not.toMatch(/sysCrs/);
  });

  it('does not warn about a global an override outranks', async () => {
    seeded = { ...REQUIRED };
    globalThis.window.measurementSystem = 'imperial';
    await resolve({ units: 'metric' });
    expect(warn).not.toHaveBeenCalled();
  });

  it('reads an empty parameter, or one whose request failed, as unset', async () => {
    seeded = { ...REQUIRED, SPATIAL_ZOOM: '' };
    axios.get.mockImplementation(async (url) => {
      if (url.endsWith('SPATIAL_MAX_ZOOM')) throw new Error('503');
      return { data: { VALUE: seeded[url.slice(PARAMS.length)] } };
    });
    const resolved = await resolve();
    expect(resolved.zoom).toBe(8);
    expect(resolved.maxZoom).toBe(18);
  });

  it('refuses to start without a required setting, naming its parameter', async () => {
    seeded = { SPATIAL_CRS: 'EPSG:3857' };
    await expect(resolve()).rejects.toThrow('missing required setting(s): center (parameter SPATIAL_CENTER)');
  });

  it('says everything that is wrong at once', async () => {
    seeded = { SPATIAL_CENTER: 'nowhere', SPATIAL_ZOOM: 'far' };
    const failure = await resolve().catch((err) => err);
    expect(failure.message).toMatch(/^perun-atlas: configuration could not be resolved\./);
    expect(failure.message).toMatch(/cannot read "center" as a \{ lat, lng \} pair/);
    expect(failure.message).toMatch(/cannot read "zoom" as an integer/);
    expect(failure.message).toMatch(/crs \(parameter SPATIAL_CRS\), center \(parameter SPATIAL_CENTER\)/);
  });
});
