import { describe, expect, it } from 'vitest';
import {
  formatRatio, labelStep, marksIn, offsetOf, ratioFor, roundRatio, rungs
} from '../frontend/lib/zoom';

describe('offsetOf', () => {
  it('puts the ends at the ends and the middle in the middle', () => {
    expect(offsetOf(0, 0, 18)).toBe(0);
    expect(offsetOf(18, 0, 18)).toBe(1);
    expect(offsetOf(9, 0, 18)).toBeCloseTo(0.5, 10);
  });

  it('clamps a view that is outside its own range, so nothing is drawn off the rail', () => {
    expect(offsetOf(-3, 0, 18)).toBe(0);
    expect(offsetOf(25, 0, 18)).toBe(1);
  });

  it('answers 0 for a range with nothing in it rather than dividing by zero', () => {
    expect(offsetOf(7, 7, 7)).toBe(0);
    expect(offsetOf(7, 12, 4)).toBe(0);
  });
});

describe('labelStep', () => {
  it('numbers every rung while they fit, and thins out as the range grows', () => {
    expect(labelStep(10)).toBe(1);
    expect(labelStep(11)).toBe(2);
    expect(labelStep(20)).toBe(2);
    expect(labelStep(21)).toBe(5);
  });
});

describe('rungs', () => {
  it('has one rung per level, bottom first', () => {
    const ladder = rungs(4, 9);
    expect(ladder.map(rung => rung.zoom)).toEqual([4, 5, 6, 7, 8, 9]);
    expect(ladder[0].offset).toBe(0);
    expect(ladder[ladder.length - 1].offset).toBe(1);
  });

  it('numbers both ends even when neither falls on the step', () => {
    const numbered = rungs(0, 18).filter(rung => rung.labelled).map(rung => rung.zoom);
    expect(numbered[0]).toBe(0);
    expect(numbered[numbered.length - 1]).toBe(18);
  });

  it('drops a stepped number that would sit under the top one', () => {
    // 0..19 steps by two, so 18 is on the step and one level under 19.
    const numbered = rungs(0, 19).filter(rung => rung.labelled).map(rung => rung.zoom);
    expect(numbered).toContain(19);
    expect(numbered).not.toContain(18);
    expect(numbered).toContain(16);
  });

  it('is empty for a range no rung can sit in', () => {
    expect(rungs(8, 8)).toEqual([]);
    expect(rungs(0, Infinity)).toEqual([]);
  });
});

describe('marksIn', () => {
  const upscaled = { from: 17, to: Number.POSITIVE_INFINITY, kind: 'upscaled' };

  it('reads an unbounded top as everything above, because that is what a tile ceiling means', () => {
    const [mark] = marksIn([upscaled], 0, 18);
    expect(mark.to).toBe(18);
    expect(mark.offset).toBeCloseTo(17 / 18, 10);
    expect(mark.span).toBeCloseTo(1 / 18, 10);
  });

  it('makes a line out of a mark with no end', () => {
    const [mark] = marksIn([{ from: 9, kind: 'labels' }], 0, 18);
    expect(mark.span).toBe(0);
    expect(mark.offset).toBeCloseTo(0.5, 10);
  });

  it('keeps everything else on the mark, so a caller can carry its own copy', () => {
    const [mark] = marksIn([{ from: 9, kind: 'labels', label: 'Names appear here' }], 0, 18);
    expect(mark.kind).toBe('labels');
    expect(mark.label).toBe('Names appear here');
  });

  it('drops a threshold the reader cannot reach', () => {
    expect(marksIn([upscaled], 0, 14)).toEqual([]);
    expect(marksIn([{ from: 2, to: 4 }], 8, 18)).toEqual([]);
  });

  it('clamps a band that runs past one end but is partly on the rail', () => {
    const [mark] = marksIn([{ from: 2, to: 10 }], 6, 18);
    expect(mark.from).toBe(6);
    expect(mark.to).toBe(10);
    expect(mark.offset).toBe(0);
  });

  it('takes nothing rather than guessing when the range is unusable', () => {
    expect(marksIn([upscaled], 0, 0)).toEqual([]);
    expect(marksIn(null, 0, 18)).toEqual([]);
    expect(marksIn([{ kind: 'upscaled' }], 0, 18)).toEqual([]);
  });
});

describe('ratioFor', () => {
  it('is 1:1 when a pixel of screen covers a pixel of ground', () => {
    // 96 CSS pixels are an inch by definition, and 0.0254 m is an inch.
    expect(ratioFor(0.0254, 96)).toBeCloseTo(1, 10);
  });

  it('is 1:1000 when an inch of screen covers a thousand inches of ground', () => {
    expect(ratioFor(25.4, 96)).toBeCloseTo(1000, 6);
  });

  it('says nothing rather than something wrong when a span is unmeasurable', () => {
    expect(ratioFor(0, 140)).toBeNull();
    expect(ratioFor(140, 0)).toBeNull();
    expect(ratioFor(NaN, 140)).toBeNull();
  });
});

describe('roundRatio', () => {
  it('keeps two figures, which is what stays still while the reader pans', () => {
    expect(roundRatio(24783)).toBe(25000);
    expect(roundRatio(473186)).toBe(470000);
    expect(roundRatio(1049)).toBe(1000);
  });

  it('rounds small denominators on their own scale', () => {
    expect(roundRatio(731)).toBe(730);
    expect(roundRatio(7.34)).toBeCloseTo(7.3, 10);
  });

  it('declines anything that is not a positive number', () => {
    expect(roundRatio(0)).toBeNull();
    expect(roundRatio(-5)).toBeNull();
    expect(roundRatio(Infinity)).toBeNull();
  });
});

describe('formatRatio', () => {
  it('groups the thousands with a no-break space, never a dot', () => {
    expect(formatRatio(473186)).toBe('1:470 000');
    expect(formatRatio(24783)).toBe('1:25 000');
  });

  it('leaves a short denominator ungrouped', () => {
    expect(formatRatio(731)).toBe('1:730');
  });

  it('never prints a denominator below one, which would read as a magnification', () => {
    expect(formatRatio(0.4)).toBe('1:1');
  });

  it('says nothing when there is no ratio to say', () => {
    expect(formatRatio(null)).toBeNull();
    expect(formatRatio(0)).toBeNull();
  });
});
