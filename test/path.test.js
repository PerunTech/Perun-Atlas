import { describe, expect, it } from 'vitest';
import { bindPath, reader, valueAt } from '../frontend/data/path';

describe('valueAt', () => {
  it('walks a dotted path and stops at nothing', () => {
    expect(valueAt({ a: { b: 'c' } }, 'a.b')).toBe('c');
    // Whatever stopped it, not a normalised nothing: `null` reached from a
    // present-but-empty field and `undefined` from an absent one are different
    // answers, and `cell` writes an empty string for both anyway.
    expect(valueAt({ a: null }, 'a.b')).toBeNull();
    expect(valueAt(undefined, 'a')).toBeUndefined();
  });

  it('reads a flat key with a dot in it, at any depth', () => {
    expect(valueAt({ 'T.CODE': 'x' }, 'T.CODE')).toBe('x');
    expect(valueAt({ status: { 'T.CODE': 'y' } }, 'status.T.CODE')).toBe('y');
  });

  it('answers a literal key before descending, where a record has both', () => {
    expect(valueAt({ 'a.b': 'flat', a: { b: 'nested' } }, 'a.b')).toBe('flat');
  });

});

describe('reader', () => {
  it('answers what valueAt answers, for every record it is handed', () => {
    const read = reader('status.T.CODE');
    expect(read({ status: { 'T.CODE': 'a' } })).toBe('a');
    expect(read({ status: { T: { CODE: 'b' } } })).toBe('b');
    expect(read({})).toBeUndefined();
  });
});

describe('bindPath', () => {
  it('fills nested placeholders and leaves unmatched ones standing', () => {
    expect(bindPath('/get/{session}/{map.bbox}/{missing}', { session: 's', map: { bbox: '1,2,3,4' } }))
      .toBe('/get/s/1,2,3,4/{missing}');
  });
});
