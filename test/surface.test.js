import { afterEach, describe, expect, it, vi } from 'vitest';
import { placeSet } from '../frontend/lib/surface';

/**
 * A group that keeps its layers in a set and says whether it was on the map
 * when each one arrived.
 */
const group = (name, layers = []) => ({
  name,
  layers: new Set(layers),
  onMap: false,
  arrivals: [],
  batches: [],
  addTo(map) { map.added.push(this); this.onMap = true; return this; },
  addLayer(layer) { this.layers.add(layer); this.arrivals.push(this.onMap); return this; },
  removeLayer(layer) { this.layers.delete(layer); return this; },
  addLayers(list) { list.forEach((layer) => this.layers.add(layer)); this.batches.push(['add', list.length]); },
  removeLayers(list) { list.forEach((layer) => this.layers.delete(layer)); this.batches.push(['remove', list.length]); },
  eachLayer(fn) { [...this.layers].forEach(fn); }
});

const engine = ({ clusters = true } = {}) => ({
  featureGroup: () => group('featureGroup'),
  divIcon: (options) => options,
  ...(clusters && { markerClusterGroup: (options) => Object.assign(group('cluster'), { options }) })
});

const scene = ({ cluster, points = 3, clusters } = {}) => {
  const loose = [{ id: 'a' }, { id: 'b' }];
  const pinned = { id: 'subject', _atlasPinned: true };
  const set = group('set', [...loose, pinned]);
  const map = { added: [] };
  const placed = placeSet({ map, factory: engine({ clusters }), group: set, cluster, points });
  return { loose, pinned, set, map, placed };
};

describe('placeSet', () => {
  afterEach(() => vi.restoreAllMocks());

  it('puts the set itself on the map when nothing clusters, with the arrows in it', () => {
    const { set, map, placed } = scene();

    expect(placed.clustering).toBe(false);
    expect(placed.surface).toBe(set);
    expect(placed.arrows).toBe(set);
    expect(placed.layers).toEqual([set, map.added[0]]);
    expect(map.added).toContain(set);
  });

  it('draws a set below the threshold plainly', () => {
    const { set, placed } = scene({ cluster: 200, points: 40 });
    expect(placed.clustering).toBe(false);
    expect(placed.surface).toBe(set);
  });

  it('clusters everything but what a row pinned, which goes beside the cluster', () => {
    const { loose, pinned, placed } = scene({ cluster: true });
    const [surface, arrows, pinnedGroup] = placed.layers;

    expect(placed.clustering).toBe(true);
    expect(surface.name).toBe('cluster');
    expect([...surface.layers]).toEqual(loose);
    expect([...pinnedGroup.layers]).toEqual([pinned]);
    expect(arrows).not.toBe(surface);
    expect(placed.arrows).toBe(arrows);
  });

  it('puts the cluster on the map before handing it a layer, so the plugin can chunk', () => {
    const { placed } = scene({ cluster: true });
    expect(placed.surface.arrivals).toEqual([true, true]);
  });

  it('asks the plugin for the resolved settings and draws its badges', () => {
    const { placed } = scene({ cluster: { from: 0, maxClusterRadius: 60 } });
    expect(placed.surface.options).toMatchObject({ chunkedLoading: true, maxClusterRadius: 60 });
    expect(typeof placed.surface.options.iconCreateFunction).toBe('function');
  });

  it('draws plainly, and says so, on an engine without clustering', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { set, placed } = scene({ cluster: true, clusters: false });
    expect(placed.clustering).toBe(false);
    expect(placed.surface).toBe(set);
    expect(warn).toHaveBeenCalledOnce();
  });

  describe('move', () => {
    const members = (layers) => layers.map((layer) => ({ layer }));

    it('takes clustered layers off in one call and pinned ones one at a time, and puts them back', () => {
      const { loose, pinned, placed } = scene({ cluster: true });
      const [surface, , pinnedGroup] = placed.layers;

      placed.move(members([...loose, pinned]), false);
      expect(surface.batches).toEqual([['remove', 2]]);
      expect(surface.layers.size).toBe(0);
      expect(pinnedGroup.layers.size).toBe(0);
      expect([...loose, pinned].every((layer) => layer._atlasHidden)).toBe(true);

      placed.move(members([...loose, pinned]), true);
      expect(surface.batches).toEqual([['remove', 2], ['add', 2]]);
      expect([...pinnedGroup.layers]).toEqual([pinned]);
      expect(loose.some((layer) => layer._atlasHidden)).toBe(false);
    });

    it('moves each layer on its own when nothing clusters', () => {
      const { loose, set, placed } = scene();
      placed.move(members(loose), false);
      expect(set.batches).toEqual([]);
      expect([...set.layers].map(({ id }) => id)).toEqual(['subject']);
    });

    it('takes a line\'s arrow heads with it', () => {
      const { loose, placed } = scene({ cluster: true });
      const heads = { id: 'heads' };
      const decoratorOf = new WeakMap([[loose[0], heads]]);
      placed.arrows.addLayer(heads);

      placed.move(members(loose), false, decoratorOf);
      expect(placed.arrows.layers.has(heads)).toBe(false);

      placed.move(members(loose), true, decoratorOf);
      expect(placed.arrows.layers.has(heads)).toBe(true);
    });
  });
});
