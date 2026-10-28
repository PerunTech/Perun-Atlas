import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('perun-core', () => ({ axios: { get: vi.fn() }, utils: {}, elements: {} }));

const { axios } = await import('perun-core');
const { ConfigError, resolve } = await import('../../frontend/bootstrap/resolve');
const { SCHEMA } = await import('../../frontend/config/Schema');

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

  it('takes a parameter over a default', async () => {
    seeded = { ...REQUIRED, SPATIAL_SWITCH_BBOX_ORDER: 'true' };
    const resolved = await resolve();
    expect(resolved.bboxOrder).toBe(true);
    expect(resolved.units).toBe('metric');
  });

  it('takes an override over everything', async () => {
    seeded = { ...REQUIRED, SPATIAL_ZOOM: '9' };
    expect((await resolve({ zoom: 14 })).zoom).toBe(14);
  });

  /** The globals perun-assets' geospatial.js used to set from the SYS_* parameters. */
  const OLD_GLOBALS = {
    sysCrs: 'EPSG:4326',
    sysCenter: { lat: 1, lng: 2 },
    sysBounds: [{ lat: 0, lng: 0 }, { lat: 3, lng: 3 }],
    measurementSystem: 'imperial',
    switchBboxOrder: 'true'
  };

  it('reads nothing from the window globals pages used to set', async () => {
    seeded = { ...REQUIRED };
    Object.assign(globalThis.window, OLD_GLOBALS);
    const resolved = await resolve();
    expect(resolved.crs).toBe('EPSG:3857');
    expect(resolved.center).toEqual({ lat: 35.1, lng: 33.4 });
    expect(resolved.bounds).toBeUndefined();
    expect(resolved.units).toBe('metric');
    expect(resolved.bboxOrder).toBe(false);
    expect(warn).not.toHaveBeenCalled();
  });

  it('refuses to start on those globals alone', async () => {
    Object.assign(globalThis.window, OLD_GLOBALS);
    await expect(resolve()).rejects.toThrow(
      'missing required setting(s): crs (parameter SPATIAL_CRS), center (parameter SPATIAL_CENTER)'
    );
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
    expect(failure.message).toMatch(/missing required setting\(s\): crs \(parameter SPATIAL_CRS\)$/);
  });

  it('carries what is wrong as data, an unreadable value apart from a missing one', async () => {
    seeded = { SPATIAL_CENTER: 'nowhere' };
    const failure = await resolve().catch((err) => err);
    expect(failure).toBeInstanceOf(ConfigError);
    expect(failure.problems.missing).toEqual([
      { key: 'crs', param: 'SPATIAL_CRS', doc: SCHEMA.crs.doc }
    ]);
    expect(failure.problems.invalid).toEqual([expect.objectContaining({
      key: 'center',
      param: 'SPATIAL_CENTER',
      got: 'nowhere',
      expected: 'a { lat, lng } pair'
    })]);
    expect(failure.problems.unreachable).toEqual([]);
  });

  it('tells a required setting whose request failed from one nobody set', async () => {
    seeded = { SPATIAL_CENTER: '35.1,33.4' };
    axios.get.mockImplementation(async (url) => {
      if (url.endsWith('SPATIAL_CRS')) throw new Error('Network Error');
      return { data: { VALUE: seeded[url.slice(PARAMS.length)] } };
    });
    const failure = await resolve().catch((err) => err);
    expect(failure.problems.missing).toEqual([]);
    expect(failure.problems.unreachable).toEqual([
      { key: 'crs', param: 'SPATIAL_CRS', doc: SCHEMA.crs.doc }
    ]);
    expect(failure.message).toMatch(/no answer for required setting\(s\): crs \(parameter SPATIAL_CRS\)/);
  });

  it('takes an override for a setting whose request failed', async () => {
    seeded = { SPATIAL_CENTER: '35.1,33.4' };
    axios.get.mockImplementation(async (url) => {
      if (url.endsWith('SPATIAL_CRS')) throw new Error('Network Error');
      return { data: { VALUE: seeded[url.slice(PARAMS.length)] } };
    });
    expect((await resolve({ crs: 'EPSG:4326' })).crs).toBe('EPSG:4326');
  });
});
