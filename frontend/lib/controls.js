/** A polygon hands back its rings; a line hands back its points. */
export const pointsOf = (layer) => {
  const latLngs = layer?.getLatLngs?.() ?? [];
  return Array.isArray(latLngs[0]) ? latLngs[0] : latLngs;
};

// Length and area accumulate across measurements; a radius or an angle reports only the last one.
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

    // Two points have no corner, but they have a bearing.
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

// Geolocation needs a secure context. On plain http browsers report "User denied Geolocation",
// which sends whoever is debugging to the permission settings.
export const canLocate = (nav, win) =>
  typeof nav !== 'undefined' &&
  'geolocation' in nav &&
  (win?.isSecureContext !== false);

export const locatePress = (state) => {
  if (state === 'unavailable') return 'explain';
  if (state === 'found' || state === 'outside' || state === 'error') return 'clear';
  return 'locate';
};

// `bottomcenter` is spatial's own region; adding a control to a corner the map lacks throws.
export const cornerFor = (corners, position, fallback) =>
  (corners?.[position] ? position : fallback);
