import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('perun-core', () => ({ axios: { get: vi.fn() }, utils: { getServerOrigin: () => 'https://svarog.test' } }));

vi.mock('../../frontend/spatial', () => {
  const tileLayer = (url, options) => ({ url, options });
  tileLayer.extendedWMS = (url, options) => ({ url, options, wms: true });
  return { core: { factory: { tileLayer, gridLayer: {} } }, config: {}, data: {}, tools: {} };
});

const { axios } = await import('perun-core');
const { fallbackBasemap, fetchLayers } = await import('../../frontend/data/tiles');

const OSM = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

const row = (fields) => Object.fromEntries(
  Object.entries(fields).map(([key, value]) => [`GEO_LAYER_TYPE.${key}`, value])
);

beforeEach(() => {
  globalThis.window = { server: 'https://svarog.test/services' };
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  delete globalThis.window;
  vi.restoreAllMocks();
  axios.get.mockReset();
});

describe('fetchLayers', () => {
  it('says the catalogue answered when a row made a basemap', async () => {
    axios.get.mockResolvedValue({ data: [row({ LAYER_TYPE: '1', PROTOCOL: 'TILE', URL: OSM, TITLE: 'osm' })] });
    const layers = await fetchLayers('session');
    expect(layers.catalogue).toBe('ok');
    expect(layers.basemap.Other.osm.url).toBe(OSM);
  });

  it('calls a catalogue with overlays and no basemap empty', async () => {
    axios.get.mockResolvedValue({ data: [row({ LAYER_TYPE: '2', PROTOCOL: 'WMS', TITLE: 'parcels' })] });
    const layers = await fetchLayers('session');
    expect(layers.catalogue).toBe('empty');
    expect(layers.overlays.Other.parcels.wms).toBe(true);
  });

  it('calls a catalogue whose rows build nothing empty', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    axios.get.mockResolvedValue({ data: [row({ LAYER_TYPE: '1', PROTOCOL: 'FTP', TITLE: 'odd' })] });
    expect((await fetchLayers('session')).catalogue).toBe('empty');
  });

  it('tells a request that failed from an empty table', async () => {
    axios.get.mockResolvedValue({ data: [] });
    expect((await fetchLayers('session')).catalogue).toBe('empty');

    axios.get.mockRejectedValue(new Error('Network Error'));
    const layers = await fetchLayers('session');
    expect(layers.catalogue).toBe('unreachable');
    expect(layers.basemap).toEqual({});
  });
});

describe('fallbackBasemap', () => {
  it('draws the setting on a Web Mercator map, named after its provider', () => {
    const fallback = fallbackBasemap(OSM, { crs: 'EPSG:3857', maxZoom: 18 });
    expect(fallback.name).toBe('OpenStreetMap');
    expect(fallback.layer.url).toBe(OSM);
    expect(fallback.layer.options).toMatchObject({ maxZoom: 18, maxNativeZoom: 19 });
    expect(fallback.layer.options.attribution).toMatch(/OpenStreetMap/);
  });

  it('names a tile URL it does not know plainly', () => {
    expect(fallbackBasemap('https://tiles.example/{z}/{x}/{y}.png', { crs: 'EPSG:3857' }).name).toBe('Default basemap');
  });

  it('draws nothing on any other CRS, and says why', () => {
    expect(fallbackBasemap(OSM, { crs: 'EPSG:4326' })).toEqual({ layer: null, reason: 'crs' });
    expect(fallbackBasemap(OSM, { crs: 'EPSG:6316' })).toEqual({ layer: null, reason: 'crs' });
    expect(fallbackBasemap(OSM, {})).toEqual({ layer: null, reason: 'crs' });
  });

  it('can be turned off', () => {
    for (const value of ['none', 'off', 'false', ' NONE ', '']) {
      expect(fallbackBasemap(value, { crs: 'EPSG:3857' })).toEqual({ layer: null, reason: 'off' });
    }
  });
});
