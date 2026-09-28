import { describe, expect, it, vi } from 'vitest';
import { loadModule, moduleUrl } from '../frontend/lib/modules';

const BUNDLE = 'https://registry.example/perun-atlas/perun-atlas.js';
const FILES = { shp: 'shp.perun-atlas.js?v=5c9f573974ae' };

describe('moduleUrl', () => {
  it('puts a module beside the bundle, with its version', () => {
    expect(moduleUrl('shp', BUNDLE, FILES)).toBe('https://registry.example/perun-atlas/shp.perun-atlas.js?v=5c9f573974ae');
  });

  it("drops the bundle's own query, which says nothing about the module", () => {
    expect(moduleUrl('shp', `${BUNDLE}?t=1`, FILES)).toBe('https://registry.example/perun-atlas/shp.perun-atlas.js?v=5c9f573974ae');
  });

  it('is null when the bundle or the module is unknown', () => {
    expect(moduleUrl('shp', null, FILES)).toBeNull();
    expect(moduleUrl('kml', BUNDLE, FILES)).toBeNull();
  });
});

describe('loadModule', () => {
  it('loads a module once, however many ask for it', async () => {
    const load = vi.fn(async () => ({ readShapefile: () => 'read' }));
    const [one, two] = await Promise.all([
      loadModule('once', { base: BUNDLE, files: { once: 'once.js' }, load }),
      loadModule('once', { base: BUNDLE, files: { once: 'once.js' }, load })
    ]);
    expect(one).toBe(two);
    expect(load).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledWith('https://registry.example/perun-atlas/once.js');
  });

  it('asks again after a load fails', async () => {
    const load = vi.fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch dynamically imported module'))
      .mockResolvedValueOnce({ ok: true });
    const options = { base: BUNDLE, files: { flaky: 'flaky.js' }, load };
    await expect(loadModule('flaky', options)).rejects.toThrow('Failed to fetch');
    await expect(loadModule('flaky', options)).resolves.toEqual({ ok: true });
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('says why when it cannot tell where the bundle is', async () => {
    const load = vi.fn();
    await expect(loadModule('lost', { base: null, files: { lost: 'lost.js' }, load }))
      .rejects.toThrow(/beside perun-atlas\.js/);
    expect(load).not.toHaveBeenCalled();
  });
});
