// A cluster moves a marker without telling the line that ends on it. Hiding such lines would hide
// most of them, so their ends follow the cluster instead.
// Nothing in a response links a line's end to its marker, but both come from the same records, so the
// coordinates agree exactly. Six decimals is about 10 cm and survives a float round-trip.
export const placeKey = ({ lat, lng }) => `${lat.toFixed(6)},${lng.toFixed(6)}`;

// Null when nothing moved: this runs on every pan, and setLatLngs rebuilds the whole path.
export const routeEnds = (line, markerAt, visibleParentOf) => {
  const next = line.original.map((latlng) => {
    const marker = markerAt[placeKey(latlng)];
    if (!marker) return latlng;

    const parent = visibleParentOf(marker);
    return parent && parent !== marker ? parent.getLatLng() : latlng;
  });

  const key = next.map(placeKey).join(' ');
  return key === line.key ? null : { next, key };
};

export const easeInOut = (t) =>
  (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2);

// A straight lerp in degrees: over a badge's distance the great-circle difference is below a pixel.
export const between = (from, to, t) => to.map((end, i) => {
  const start = from[i];
  if (!start) return end;
  return {
    lat: start.lat + (end.lat - start.lat) * t,
    lng: start.lng + (end.lng - start.lng) * t
  };
});

// A path in parts reverses each part and their order.
export const reversed = (points) =>
  Array.isArray(points?.[0])
    ? points.map(reversed).reverse()
    : [...(points ?? [])].reverse();
