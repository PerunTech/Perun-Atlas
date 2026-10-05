/**
 * The parts of the map's own controls that need no map: what a measurement
 * says, what a press of the locate button does, and which corner a control can
 * go in. The controls are in `components/controls/`; these are here so the suite
 * can run them without a renderer.
 */

/** A polygon hands back its rings; a line hands back its points. */
export const pointsOf = (layer) => {
  const latLngs = layer?.getLatLngs?.() ?? [];
  return Array.isArray(latLngs[0]) ? latLngs[0] : latLngs;
};

/**
 * What a finished shape says.
 *
 * Reads the geometry rather than the engine's formatted output, which is what
 * keeps an imperial deployment honest: totals are summed in metres and square
 * metres and formatted only for display.
 *
 * Length and area accumulate: three parcels measured one after another have a
 * combined area, and that is usually the question. A radius and an angle do not
 * -- the sum of two bearings is not a bearing -- so those report the last
 * measurement alone rather than offering a number that would be arithmetic
 * without meaning.
 *
 * @param {string} name - `length`, `area`, `radius` or `angle`.
 * @param {Object} layer - The shape the tool finished.
 * @param {{ length: number, area: number }} totals - Running sums, in base
 *        units. Added to here.
 * @param {Object} measure - The engine's arithmetic and formatting.
 * @returns {string|null} Nothing when the shape says nothing worth showing.
 */
export const readingFor = (name, layer, totals, measure) => {
  const points = pointsOf(layer);

  if (name === 'radius') {
    const radius = layer?.getRadius?.();
    if (!Number.isFinite(radius)) return null;
    return `${measure.asDistance(radius)} · ${measure.asArea(measure.circleArea(radius))}`;
  }

  if (name === 'angle') {
    const angles = measure.anglesAlong(points).filter(Number.isFinite);
    if (angles.length) return angles.map(measure.asAngle).join(', ');

    // Two points have no corner to read, but they do have a direction, and
    // that is the useful answer rather than an empty one.
    return points.length === 2
      ? measure.asBearing(measure.bearing(points[0], points[1]))
      : null;
  }

  const value = name === 'area' ? measure.area(points) : measure.distance(points);
  if (!Number.isFinite(value) || value === 0) return null;

  totals[name] += value;
  const format = name === 'area' ? measure.asArea : measure.asDistance;

  return `${format(value)}   (Σ ${format(totals[name])})`;
};

/**
 * Whether the browser will even be asked where the reader is.
 *
 * Geolocation is a powerful feature, so browsers expose it only in a secure
 * context -- https, or localhost. A deployment served over plain http does not
 * get a permission prompt that the user denies; it gets an API that is either
 * absent or refuses, and the error text browsers supply for that case reads
 * `User denied Geolocation`, which sends whoever is debugging it to the
 * permission settings for the rest of the afternoon.
 *
 * Checked up front so the control can say the true thing instead.
 */
export const canLocate = (nav, win) =>
  typeof nav !== 'undefined' &&
  'geolocation' in nav &&
  (win?.isSecureContext !== false);

/**
 * What a press of the locate button does, from the state it is in.
 *
 * `explain` where the browser will not be asked, `clear` where there is already
 * an answer on the map -- a position, a position outside it, or a failure --
 * and `locate` otherwise, which includes asking again while a fix is pending.
 */
export const locatePress = (state) => {
  if (state === 'unavailable') return 'explain';
  if (state === 'found' || state === 'outside' || state === 'error') return 'clear';
  return 'locate';
};

/**
 * The corner a control asked for, where the map has it, and the fallback where
 * it does not.
 *
 * `bottomcenter` is spatial's own region and newer than Leaflet's four corners,
 * so an engine without it has no container to append to, and adding a control
 * there throws rather than degrades.
 */
export const cornerFor = (corners, position, fallback) =>
  (corners?.[position] ? position : fallback);
