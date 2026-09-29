import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { popupContent } from '../frontend/lib/popup';

/** Just enough of an element for `popupElement` to build into. */
const element = (tag) => ({
  tag,
  className: '',
  textContent: '',
  style: {},
  children: [],
  appendChild(child) { this.children.push(child); },
  append(...children) { this.children.push(...children); }
});

/** Stands in for the DOM's `Node`, which `asNode` asks about. */
class FakeNode {}

const site = { properties: { NAME: 'Site 1', CODE: 'S-1' } };
const described = { popup: { title: 'NAME', fields: [{ label: 'Code', field: 'CODE' }] } };

describe('popupContent', () => {
  beforeEach(() => {
    vi.stubGlobal('Node', FakeNode);
    vi.stubGlobal('document', { createElement: element, createTextNode: (text) => ({ text }) });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('builds the popup a descriptor describes', () => {
    const root = popupContent(site, described);
    expect(root.className).toBe('atlas-popup');
    expect(root.children[0].textContent).toBe('Site 1');
    expect(root.children[1].children.map((child) => child.textContent)).toEqual(['Code', 'S-1']);
  });

  it('resolves a field\'s label through the resolver it is given', () => {
    const root = popupContent(site, described, { labelResolver: (code) => `[${code}]` });
    expect(root.children[1].children[0].textContent).toBe('[Code]');
  });

  it('is nothing for a descriptor that describes no popup', () => {
    expect(popupContent(site, {})).toBeNull();
    expect(popupContent(site, undefined)).toBeNull();
  });

  it('lets a caller\'s content replace the descriptor\'s, as text when it is a string', () => {
    expect(popupContent(site, described, { popup: (f) => `<b>${f.properties.NAME}</b>` }))
      .toEqual({ text: '<b>Site 1</b>' });
  });

  it('passes a caller\'s element through untouched', () => {
    const own = new FakeNode();
    expect(popupContent(site, described, { popup: () => own })).toBe(own);
  });

  it('is nothing when the caller\'s content is, whatever the descriptor says', () => {
    expect(popupContent(site, described, { popup: () => null })).toBeNull();
    expect(popupContent(site, described, { popup: () => undefined })).toBeNull();
  });
});
