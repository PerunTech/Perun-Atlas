import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bindLabel, syncLabels } from '../../../frontend/lib/features/labels';

/** A layer that records what it was bound with, and a tooltip that opens and closes. */
const layer = ({ open = false, hidden = false } = {}) => {
  const handlers = {};
  return {
    _atlasHidden: hidden,
    handlers,
    bound: null,
    open,
    bindTooltip(content, options) { this.bound = { content, options }; },
    on(event, fn) { handlers[event] = fn; },
    isTooltipOpen() { return this.open; },
    openTooltip: vi.fn(function () { this.open = true; }),
    closeTooltip: vi.fn(function () { this.open = false; })
  };
};

const point = { geometry: { type: 'Point' } };
const area = { geometry: { type: 'Polygon' } };

describe('bindLabel', () => {
  beforeEach(() => {
    vi.stubGlobal('Node', class Node {});
    vi.stubGlobal('document', { createTextNode: (text) => ({ text }) });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('puts a point\'s label above its marker, clear of it', () => {
    const l = layer();
    bindLabel(l, point, { marker: { size: 30 } }, 'Site 1');
    expect(l.bound.options).toMatchObject({ permanent: true, direction: 'top', offset: [0, -15], opacity: 1 });
  });

  it('puts an area\'s label in its middle', () => {
    const l = layer();
    bindLabel(l, area, {}, 'Zone');
    expect(l.bound.options).toMatchObject({ direction: 'center', offset: [0, 0] });
  });

  it('lets the descriptor place it and add a class of its own', () => {
    const l = layer();
    bindLabel(l, point, { label: { direction: 'right', offset: [4, 0], className: 'mine' } }, 'x');
    expect(l.bound.options).toMatchObject({ direction: 'right', offset: [4, 0], className: 'atlas-label mine' });
  });

  it('binds the text as a text node, never as a string Leaflet would parse', () => {
    const l = layer();
    bindLabel(l, point, {}, '<b>Site</b>');
    expect(l.bound.content).toEqual({ text: '<b>Site</b>' });
  });

  it('styles the pill each time it opens, and only when the descriptor says how', () => {
    const plain = layer();
    bindLabel(plain, point, {}, 'x');
    expect(plain.handlers.tooltipopen).toBeUndefined();

    const styled = layer();
    const element = { style: {} };
    bindLabel(styled, point, { label: { style: { color: 'red' } } }, 'x');
    styled.handlers.tooltipopen({ tooltip: { getElement: () => element } });
    expect(element.style.color).toBe('red');
  });

  it('says whether the label is banded by zoom', () => {
    expect(bindLabel(layer(), point, {}, 'x')).toBe(false);
    expect(bindLabel(layer(), point, { label: { scale: { min: 12 } } }, 'x')).toBe(true);
  });
});

describe('syncLabels', () => {
  const banded = { label: { scale: { min: 12, max: 16 } } };

  it('opens a label inside its band and closes one outside it', () => {
    const inside = layer();
    const outside = layer({ open: true });
    syncLabels([{ layer: inside, descriptor: banded }], 14);
    syncLabels([{ layer: outside, descriptor: banded }], 10);
    expect(inside.open).toBe(true);
    expect(outside.open).toBe(false);
  });

  it('leaves a label alone that is already as it should be', () => {
    const l = layer({ open: true });
    syncLabels([{ layer: l, descriptor: banded }], 14);
    expect(l.openTooltip).not.toHaveBeenCalled();
    expect(l.closeTooltip).not.toHaveBeenCalled();
  });

  it('leaves a switched-off layer alone, since it has no place on the map to label', () => {
    const l = layer({ hidden: true });
    syncLabels([{ layer: l, descriptor: banded }], 14);
    expect(l.openTooltip).not.toHaveBeenCalled();
  });
});
