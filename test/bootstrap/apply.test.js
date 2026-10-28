import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CRS_STUB } from '../stubs/spatial.js';

// The stub engine has no `configure`, page map or store, so the shim is replaced here.
const engine = vi.hoisted(() => ({
  configure: null,
  mapCode: 'EPSG:3857',
  states: {}
}));

vi.mock('../../frontend/spatial', async () => {
  const { CRS_STUB: CRS } = await import('../stubs/spatial.js');
  return {
    config: { configure: (settings) => engine.configure(settings) },
    core: {
      Map: { getCRS: () => ({ code: engine.mapCode }) },
      store: { addState: (key, value) => { engine.states[key] = value; } },
      factory: { CRS }
    },
    data: {},
    tools: {}
  };
});

const { applyToEngine } = await import('../../frontend/bootstrap/apply');

let warn;

beforeEach(() => {
  engine.configure = vi.fn((settings) => ({ applied: settings }));
  engine.mapCode = 'EPSG:3857';
  engine.states = {};
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('applyToEngine', () => {
  it("hands the engine its settings under the engine's own names", () => {
    applyToEngine({ crs: 'EPSG:3857', zoom: 9, units: 'imperial', bboxOrder: true, attribution: 'x', dataSrid: '4326' });
    expect(engine.configure).toHaveBeenCalledWith({
      crs: 'EPSG:3857',
      zoom: 9,
      measurementSystem: 'imperial',
      switchBboxOrder: true
    });
  });

  it('leaves out what the configuration does not set, and returns what the engine answers', () => {
    expect(applyToEngine({ zoom: 9 })).toEqual({ applied: { zoom: 9 } });
    expect(applyToEngine()).toEqual({ applied: {} });
  });

  it('tells the GeoJSON reader which CRS stored geometry is in', () => {
    applyToEngine({ dataSrid: '4326' });
    expect(engine.states.dbCRSCode).toEqual({ dbCRS: '4326' });
    expect(engine.states.dbCRS).toBe(CRS_STUB.EPSG4326);
    expect(warn).not.toHaveBeenCalled();
  });

  // Geometry the engine cannot convert would be read in the map's CRS and draw near 0,0.
  it('warns when stored geometry is in a CRS the engine cannot convert from', () => {
    applyToEngine({ dataSrid: '6316' });
    expect(engine.states.dbCRSCode).toEqual({ dbCRS: '6316' });
    expect(engine.states.dbCRS).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(/stores geometry in EPSG:6316.*EPSG:3857/s);
  });

  it('says nothing when geometry it cannot convert is already in the map\'s CRS', () => {
    engine.mapCode = 'EPSG:6316';
    applyToEngine({ dataSrid: '6316' });
    expect(warn).not.toHaveBeenCalled();
  });

  it('warns when the map did not end up on the CRS the deployment declared', () => {
    applyToEngine({ crs: { code: 'EPSG:6316', def: '+proj=tmerc' } });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(/declares EPSG:6316, but the map is on EPSG:3857/);
  });

  it('checks the CRS after configuring, since configuring is what changes it', () => {
    engine.configure = vi.fn(() => { engine.mapCode = 'EPSG:4326'; });
    applyToEngine({ crs: 'EPSG:4326' });
    expect(warn).not.toHaveBeenCalled();
  });
});
