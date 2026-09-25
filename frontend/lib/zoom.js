/**
 * The zoom ladder as arithmetic: where a level sits on a rail, which of the
 * map's own thresholds fall inside the range, what the view's scale is when
 * written as a ratio, and the margin a set is framed with.
 *
 * Here rather than in the control because none of it needs a map, a DOM or a
 * projection -- a range, a level and a ground distance are the whole input. That
 * is what puts it under test: `ZoomRail` places elements and `AtlasMap` reads a
 * distance off the engine, and neither of those can be asserted in this suite,
 * but every number they draw with can.
 */

/**
 * Where `zoom` sits between `min` and `max`, as a fraction from 0 to 1.
 *
 * Clamped rather than extrapolated. A map is free to sit outside its own
 * declared range for a moment -- `setMaxZoom` below the current view is one way,
 * a fractional zoom mid-animation is another -- and a handle at -4% of the rail
 * is drawn outside the control that owns it.
 */
export const offsetOf = (zoom, min, max) => {
  if (!(max > min)) return 0;
  const clamped = Math.min(Math.max(zoom, min), max);
  return (clamped - min) / (max - min);
};

/**
 * How many levels to leave between numbered rungs.
 *
 * The rail is a fixed length whatever range it holds, so a deployment allowing
 * twenty-five levels gets the same pixels as one allowing six, and numbering
 * every rung on the first would print the numbers on top of each other. The
 * thresholds are in levels rather than pixels because this cannot see pixels;
 * they are chosen against the rail length `zoom.css` sets.
 */
export const labelStep = (levels) => {
  if (levels <= 10) return 1;
  if (levels <= 20) return 2;
  return 5;
};

/**
 * Every level on the rail, with where it sits and whether it is numbered.
 *
 * Both ends are always numbered: they are the range itself, and a ladder whose
 * top rung carries no number does not say where it stops. A stepped number too
 * close under the top one is dropped instead -- with eighteen levels and a step
 * of two, seventeen and eighteen would otherwise collide.
 *
 * @param {number} min - The map's minimum zoom.
 * @param {number} max - Its maximum.
 * @returns {Array} [{ zoom, offset, labelled }], bottom rung first.
 */
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

/**
 * The marks that fall inside the rail, placed on it.
 *
 * A mark is `{ from, to, kind, label }`. `to` left out makes it a line at
 * `from`; `to` present makes it a band. Any value is clamped into the range, so
 * `to: Number.POSITIVE_INFINITY` is how a caller says "and everything above" --
 * which is what the basemap's own ceiling means, since past it there is no
 * deeper tile for the rest of the range to show.
 *
 * Marks outside the range are dropped rather than pinned to an end: a threshold
 * the reader cannot reach is not a threshold, and a line drawn at the top of the
 * rail claiming otherwise is worse than no line.
 *
 * @param {Array} marks - As above. `kind` names the rule that drew it.
 * @param {number} min - The map's minimum zoom.
 * @param {number} max - Its maximum.
 * @returns {Array} The same marks with `from`, `to`, `offset` and `span` set.
 */
export const marksIn = (marks, min, max) => {
  if (!Number.isFinite(min) || !Number.isFinite(max) || !(max > min)) return [];

  return (marks ?? [])
    .filter(mark => Number.isFinite(mark?.from))
    .map(mark => ({ mark, to: mark.to ?? mark.from }))
    // A band ending below the rail, or starting above it, has nothing to draw.
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

/**
 * Metres a CSS pixel stands for, for the purpose of a scale ratio.
 *
 * The CSS reference pixel is 1/96 inch. That is the figure every GIS tool means
 * by a screen scale, and using it is what makes 1:25 000 here the same statement
 * as 1:25 000 on a printed sheet.
 *
 * `devicePixelRatio` is deliberately not consulted. It describes device pixels,
 * and everything measured on this map -- the container's size, the span the
 * scale bar is drawn across -- is already in CSS pixels.
 */
const METRES_PER_PIXEL = 0.0254 / 96;

/**
 * The view's scale as the denominator of 1:N.
 *
 * @param {number} metres - Ground distance the span covers.
 * @param {number} pixels - The span it was measured across, in CSS pixels.
 * @returns {?number} The denominator, or null when either input is unusable.
 */
export const ratioFor = (metres, pixels) => {
  if (!(metres > 0) || !(pixels > 0)) return null;
  return metres / pixels / METRES_PER_PIXEL;
};

/**
 * The denominator at two significant figures.
 *
 * Rounded because the exact number is noise: on a Mercator map the ground
 * distance a pixel covers depends on latitude, so the last digits of an exact
 * denominator change while the reader pans north, at a zoom that has not moved.
 * Two figures are stable across that and are what the number is read for.
 */
export const roundRatio = (n) => {
  if (!(n > 0) || !Number.isFinite(n)) return null;
  const magnitude = 10 ** (Math.floor(Math.log10(n)) - 1);
  return Math.round(n / magnitude) * magnitude;
};

/**
 * `1:25 000`, ready to print.
 *
 * Grouped with a no-break space rather than by locale: a denominator separated
 * by a dot reads as a decimal across half of Europe, and this is the one number
 * on the map that must not be read as twenty-five point nought.
 */
export const formatRatio = (n) => {
  const rounded = roundRatio(n);
  if (rounded === null) return null;

  const whole = String(Math.max(Math.round(rounded), 1));
  return `1:${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`;
};

/**
 * The margin, in pixels, left around a set when the map is framed on it.
 *
 * One value for both times that happens: when a set is first drawn and when the
 * reader asks for the frame back. If the two differed, the button would never
 * quite return the view the reader started from.
 */
export const FIT_PADDING = [24, 24];
