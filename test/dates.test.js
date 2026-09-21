import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { iso, monthsAgo, rangeOf, sameWindow, today } from '../frontend/components/lib/dates';

describe('the date window', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-21T11:30:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('writes the day the way the wire does', () => {
    expect(today()).toBe('2026-09-21');
    expect(iso(new Date('2026-01-05T23:00:00Z'))).toBe('2026-01-05');
  });

  it('counts back in months rather than in days', () => {
    expect(monthsAgo(12)).toBe('2025-09-21');
    expect(monthsAgo(1)).toBe('2026-08-21');
    expect(monthsAgo(0)).toBe('2026-09-21');
  });

  /**
   * `setMonth` rolls a day that the shorter month does not have into the next
   * one: 31 August minus six months is 31 February, which is 3 March. Pinned
   * because the alternative -- clamping to the last of the month -- would be a
   * deliberate change and this is what the panel does today.
   */
  it('rolls forward off the end of a short month', () => {
    vi.setSystemTime(new Date('2026-08-31T11:30:00Z'));
    expect(monthsAgo(6)).toBe('2026-03-03');
  });

  it('gives a window ending today', () => {
    expect(rangeOf(6)).toEqual({ from: '2026-03-21', to: '2026-09-21' });
  });

  it('compares two windows by their ends, and survives not having one', () => {
    expect(sameWindow({ from: 'a', to: 'b' }, { from: 'a', to: 'b' })).toBe(true);
    expect(sameWindow({ from: 'a', to: 'b' }, { from: 'a', to: 'c' })).toBe(false);
    expect(sameWindow(undefined, undefined)).toBe(true);
    expect(sameWindow({ from: 'a', to: 'b' }, undefined)).toBe(false);
  });
});
