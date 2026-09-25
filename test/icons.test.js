import { describe, expect, it } from 'vitest';
import { GLYPHS, ICON_SIZE, ICON_STROKE, svgMarkup } from '../frontend/lib/icons';

describe('svgMarkup', () => {
  it('draws every path the glyph has, in order', () => {
    const svg = svgMarkup('plus');
    expect(svg).toContain(`<path d="${GLYPHS.plus[0]}"/><path d="${GLYPHS.plus[1]}"/>`);
    expect(svgMarkup('minus').match(/<path /g)).toHaveLength(1);
    expect(svgMarkup('maximize').match(/<path /g)).toHaveLength(4);
  });

  it('carries the geometry the rest of the map draws its controls at', () => {
    const svg = svgMarkup('plus');
    expect(svg).toContain(`width="${ICON_SIZE}" height="${ICON_SIZE}"`);
    expect(svg).toContain(`stroke-width="${ICON_STROKE}"`);
    expect(svg).toContain('viewBox="0 0 24 24"');
  });

  it('takes its colour from the button it sits in, so a disabled state reaches it', () => {
    expect(svgMarkup('plus')).toContain('stroke="currentColor"');
    expect(svgMarkup('plus')).toContain('fill="none"');
  });

  it('is hidden from a reader who is listening, because the button is labelled', () => {
    expect(svgMarkup('plus')).toContain('aria-hidden="true"');
  });

  it('names itself so one button can hold two glyphs and show one', () => {
    expect(svgMarkup('maximize')).toContain('class="atlas-icon atlas-icon--maximize"');
    expect(svgMarkup('minimize')).toContain('class="atlas-icon atlas-icon--minimize"');
  });

  it('takes a size and a stroke for a control that is not the map\'s own size', () => {
    expect(svgMarkup('plus', { size: 24, stroke: 2 })).toContain('width="24"');
    expect(svgMarkup('plus', { size: 24, stroke: 2 })).toContain('stroke-width="2"');
  });

  it('draws the fit button as a frame with a magnifier in it', () => {
    expect(svgMarkup('zoom-scan').match(/<path /g)).toHaveLength(6);
    expect(svgMarkup('zoom-scan')).toContain('class="atlas-icon atlas-icon--zoom-scan"');
  });

  it('gives nothing at all for a name with no glyph, rather than an empty box', () => {
    expect(svgMarkup('nothing-like-this')).toBe('');
    expect(svgMarkup(undefined)).toBe('');
  });
});
