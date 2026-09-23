import { afterEach, describe, expect, it, vi } from 'vitest';
import { followClusters, GLIDE_LIMIT } from '../frontend/lib/follow';
import { placeKey } from '../frontend/lib/route';

const at = (lat, lng) => ({ lat, lng });

/** Something that takes handlers by event name, as Leaflet's evented objects do. */
const evented = (extra = {}) => {
  const handlers = {};
  return {
    handlers,
    on: (event, fn) => { (handlers[event] ??= []).push(fn); },
    off: (event, fn) => { handlers[event] = (handlers[event] ?? []).filter((h) => h !== fn); },
    fire: (event) => (handlers[event] ?? []).forEach((fn) => fn()),
    ...extra
  };
};

const lineLayer = (points) => {
  let current = points;
  return { getLatLngs: () => current, setLatLngs: vi.fn((next) => { current = next; }) };
};

const marker = (latlng) => ({ getLatLng: () => latlng });

/**
 * One line from `a` to `b`, with a marker standing at each end and a cluster
 * that draws `b` as a badge at `badge` until `open()` is called.
 */
const scene = ({ reverse = false } = {}) => {
  const a = at(35.1, 33.9);
  const b = at(35.2, 34.0);
  const badge = at(35.25, 34.05);

  const markerA = marker(a);
  const markerB = marker(b);
  const cluster = marker(badge);

  let collapsed = true;
  const surface = evented({
    getVisibleParent: (m) => (m === markerB && collapsed ? cluster : m)
  });
  const map = evented();

  const layer = lineLayer([a, b]);
  const line = { layer, original: [a, b], reverse, key: null };
  const decorator = { setPaths: vi.fn() };

  return {
    a, b, badge, map, surface, layer, line, decorator,
    markerAt: Object.assign(Object.create(null), { [placeKey(a)]: markerA, [placeKey(b)]: markerB }),
    decoratorOf: new WeakMap([[layer, decorator]]),
    open: () => { collapsed = false; }
  };
};

const follow = (s, glide = false) => followClusters({
  map: s.map, surface: s.surface, lines: [s.line], markerAt: s.markerAt, decoratorOf: s.decoratorOf, glide
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('followClusters', () => {
  it('aims a collapsed end at its badge straight away, and leaves the other end where it was sent', () => {
    const s = scene();
    follow(s);
    expect(s.layer.setLatLngs).toHaveBeenLastCalledWith([s.a, s.badge]);
  });

  it('puts the line back exactly as sent once the view opens up', () => {
    const s = scene();
    follow(s);
    s.open();
    s.map.fire('moveend');
    expect(s.layer.setLatLngs).toHaveBeenLastCalledWith([s.a, s.b]);
  });

  it('does not redraw a line whose ends have not moved', () => {
    const s = scene();
    follow(s);
    s.map.fire('moveend');
    s.surface.fire('animationend');
    expect(s.layer.setLatLngs).toHaveBeenCalledTimes(1);
  });

  it('hands a forward decorator the layer and a reversed one a reversed copy', () => {
    const forward = scene();
    follow(forward);
    expect(forward.decorator.setPaths).toHaveBeenLastCalledWith(forward.layer);

    const back = scene({ reverse: true });
    follow(back);
    expect(back.decorator.setPaths).toHaveBeenLastCalledWith([back.badge, back.a]);
  });

  it('takes both of its handlers off again', () => {
    const s = scene();
    const off = follow(s);
    off();
    expect(s.map.handlers.moveend).toEqual([]);
    expect(s.surface.handlers.animationend).toEqual([]);
  });

  it('travels over the glide and lands on the target itself', () => {
    const frames = [];
    vi.stubGlobal('requestAnimationFrame', (fn) => frames.push(fn));
    vi.stubGlobal('cancelAnimationFrame', () => {});
    vi.stubGlobal('performance', { now: () => 0 });

    const s = scene();
    follow(s, 200);
    expect(s.layer.setLatLngs).not.toHaveBeenCalled();

    frames.shift()(100);
    const halfway = s.layer.setLatLngs.mock.lastCall[0][1];
    expect(halfway.lat).toBeGreaterThan(s.b.lat);
    expect(halfway.lat).toBeLessThan(s.badge.lat);

    frames.shift()(200);
    expect(s.layer.setLatLngs).toHaveBeenLastCalledWith([s.a, s.badge]);
    expect(frames).toHaveLength(0);
  });

  it('places rather than travels past the glide limit', () => {
    const raf = vi.fn();
    vi.stubGlobal('requestAnimationFrame', raf);

    const s = scene();
    const many = Array.from({ length: GLIDE_LIMIT + 1 }, () => ({ ...s.line, layer: lineLayer(s.line.original) }));
    followClusters({ map: s.map, surface: s.surface, lines: many, markerAt: s.markerAt, glide: 200 });

    expect(raf).not.toHaveBeenCalled();
    expect(many[0].layer.setLatLngs).toHaveBeenLastCalledWith([s.a, s.badge]);
  });
});
