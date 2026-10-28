// Clamped: a map can sit outside its range for a moment, e.g. at a fractional zoom mid-animation.
export const offsetOf = (zoom, min, max) => {
  if (!(max > min)) return 0;
  const clamped = Math.min(Math.max(zoom, min), max);
  return (clamped - min) / (max - min);
};

// Chosen against the rail length `zoom.css` sets.
export const labelStep = (levels) => {
  if (levels <= 10) return 1;
  if (levels <= 20) return 2;
  return 5;
};

// Both ends are always numbered; a stepped number too close under the top one is dropped.
export const rungs = (min, max) => {
  if (!Number.isFinite(min) || !Number.isFinite(max) || !(max > min)) return [];

  const step = labelStep(max - min + 1);
  const out = [];

  for (let zoom = Math.ceil(min); zoom <= max; zoom += 1) {
    const onStep = (zoom - min) % step === 0;
    out.push({
      zoom,
      offset: offsetOf(zoom, min, max),
      labelled: zoom === min || zoom === max || (onStep && max - zoom >= step)
    });
  }

  return out;
};

// `to: Infinity` means "and everything above". Marks outside the range are dropped, not pinned to an end.
export const marksIn = (marks, min, max) => {
  if (!Number.isFinite(min) || !Number.isFinite(max) || !(max > min)) return [];

  return (marks ?? [])
    .filter(mark => Number.isFinite(mark?.from))
    .map(mark => ({ mark, to: mark.to ?? mark.from }))
    .filter(({ mark, to }) => to >= min && mark.from <= max)
    .map(({ mark, to }) => {
      const start = offsetOf(mark.from, min, max);
      const end = offsetOf(Math.max(to, mark.from), min, max);
      return {
        ...mark,
        from: Math.min(Math.max(mark.from, min), max),
        to: Math.min(Math.max(to, min), max),
        offset: start,
        span: end - start
      };
    });
};

// The CSS reference pixel, 1/96 inch, which is what GIS tools mean by a screen scale. devicePixelRatio
// does not apply: everything measured here is in CSS pixels.
const METRES_PER_PIXEL = 0.0254 / 96;

export const ratioFor = (metres, pixels) => {
  if (!(metres > 0) || !(pixels > 0)) return null;
  return metres / pixels / METRES_PER_PIXEL;
};

// Two significant figures: on Mercator the exact denominator drifts as the reader pans north.
export const roundRatio = (n) => {
  if (!(n > 0) || !Number.isFinite(n)) return null;
  const magnitude = 10 ** (Math.floor(Math.log10(n)) - 1);
  return Math.round(n / magnitude) * magnitude;
};

// A no-break space rather than locale grouping, where a dot would read as a decimal point.
export const formatRatio = (n) => {
  const rounded = roundRatio(n);
  if (rounded === null) return null;

  const whole = String(Math.max(Math.round(rounded), 1));
  return `1:${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`;
};

// Shared by the first draw and the reframe button, so the button returns the view the reader started from.
export const FIT_PADDING = [24, 24];
