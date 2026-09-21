import { describe, expect, it } from 'vitest';
import {
  BASE_STYLE, detailsFor, labelFor, labelVisible, pathOptions, popupFor, variantOf
} from '../frontend/style/descriptor';

const feature = (properties) => ({ type: 'Feature', properties });

describe('pathOptions', () => {
  it('layers the base, the descriptor and the caller in that order', () => {
    const out = pathOptions({ style: { color: '#b3261e', weight: 2 } }, { fillColor: '#eee' });
    expect(out.color).toBe('#b3261e');
    expect(out.weight).toBe(2);
    expect(out.fillColor).toBe('#eee');
    expect(out.fillOpacity).toBe(BASE_STYLE.fillOpacity);
  });

  it('is the base alone for a descriptor that styles nothing', () => {
    expect(pathOptions()).toEqual(BASE_STYLE);
  });

  /**
   * These reach Leaflet's `style` unchanged, so whatever a menu row writes is a
   * path option and nothing translates it. Pinned because it is the reason a
   * descriptor cannot carry a casing or a halo: one path per feature, one set
   * of keys, and both are Leaflet's.
   */
  it('passes an unknown key through rather than dropping it', () => {
    expect(pathOptions({ style: { dashArray: '8 5' } }).dashArray).toBe('8 5');
  });
});

describe('variantOf', () => {
  const base = { style: { color: '#000', weight: 1 }, label: { field: 'ID' } };
  const spec = { ...base, variants: { by: 'STATE', cases: { closed: { style: { color: '#999' } } } } };

  it('returns the descriptor untouched when nothing varies', () => {
    expect(variantOf(base, feature({ STATE: 'closed' }))).toBe(base);
  });

  it('returns the descriptor untouched when no case matches', () => {
    expect(variantOf(spec, feature({ STATE: 'open' }))).toBe(spec);
  });

  it('merges the case over the descriptor rather than replacing it', () => {
    const out = variantOf(spec, feature({ STATE: 'closed' }));
    expect(out.style).toEqual({ color: '#999', weight: 1 });
    expect(out.label).toEqual({ field: 'ID' });
  });
});

describe('labelVisible', () => {
  it('is false for a descriptor with no scale, so labels are opt-in', () => {
    expect(labelVisible({ label: { field: 'ID' } }, 12)).toBe(false);
    expect(labelVisible(undefined, 12)).toBe(false);
  });

  it('is inclusive at both ends of the band', () => {
    const d = { label: { scale: { min: 10, max: 14 } } };
    expect(labelVisible(d, 10)).toBe(true);
    expect(labelVisible(d, 14)).toBe(true);
    expect(labelVisible(d, 9)).toBe(false);
    expect(labelVisible(d, 15)).toBe(false);
  });

  it('opens the band at whichever end was left out', () => {
    expect(labelVisible({ label: { scale: { min: 10 } } }, 24)).toBe(true);
    expect(labelVisible({ label: { scale: { max: 14 } } }, 0)).toBe(true);
  });
});

describe('labelFor', () => {
  it('reads the named field as text', () => {
    expect(labelFor({ label: { field: 'N' } }, feature({ N: 4471 }))).toBe('4471');
  });

  it('is null when there is no field or no value', () => {
    expect(labelFor({ label: {} }, feature({ N: 1 }))).toBeNull();
    expect(labelFor({ label: { field: 'N' } }, feature({}))).toBeNull();
  });
});

describe('popupFor', () => {
  const spec = { popup: { title: 'ID', fields: [{ label: 'x.name', field: 'NAME' }, { field: 'NOTE' }] } };

  it('resolves a label code and falls back to the field name', () => {
    const out = popupFor(spec, feature({ ID: 'Q1', NAME: 'North', NOTE: 'n' }), (code) => (code === 'x.name' ? 'Name' : null));
    expect(out.title).toBe('Q1');
    expect(out.rows).toEqual([{ label: 'Name', value: 'North' }, { label: 'NOTE', value: 'n' }]);
  });

  it('drops a row whose value is empty rather than printing a blank', () => {
    const out = popupFor(spec, feature({ ID: 'Q1', NAME: '', NOTE: null }));
    expect(out.rows).toEqual([]);
  });

  it('is null when the descriptor has no popup, and when it would say nothing', () => {
    expect(popupFor({}, feature({ ID: 'Q1' }))).toBeNull();
    expect(popupFor(spec, feature({}))).toBeNull();
  });
});

describe('detailsFor', () => {
  const spec = { details: { title: 'ID', exclude: ['GEOM'] } };

  it('hides the framework fields, the excluded ones and the title', () => {
    const out = detailsFor(spec, feature({
      ID: 'Q1', GEOM: 'x', pkid: 9, type: 1, status: 'VALID', parent_id: 2, DESCRIPTOR: 'T', KEEP: 'yes'
    }));
    expect(out.title).toBe('Q1');
    expect(out.rows.map(row => row.field)).toEqual(['KEEP']);
  });

  it('drops a property whose value is an object, which no row can print', () => {
    const out = detailsFor(spec, feature({ ID: 'Q1', JOINED: { a: 1 }, KEEP: 'yes' }));
    expect(out.rows.map(row => row.field)).toEqual(['KEEP']);
  });

  it('lowercases the field to look a label up, as these registries code them', () => {
    const out = detailsFor(spec, feature({ ID: 'Q1', REASON: 'why' }));
    expect(detailsFor(spec, feature({ ID: 'Q1', REASON: 'why' }), (c) => (c === 'reason' ? 'Reason' : null)).rows[0].label).toBe('Reason');
    expect(out.rows[0].label).toBe('REASON');
  });
});
