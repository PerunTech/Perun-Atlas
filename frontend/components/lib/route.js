/**
 * Where a line's ends belong while its markers are being clustered.
 *
 * A cluster moves a marker; the line that ends on it does not hear about it, so
 * it goes on pointing at ground where nothing is drawn. Hiding such a line is
 * the obvious fix and the wrong one -- the record a movements screen is about
 * sits among its own partners, so the badge that swallows a partner usually
 * swallows the subject too, and every line on the screen would have a collapsed
 * end at exactly the zooms worth looking at.
 *
 * So the end moves to wherever the cluster is currently drawing it, and moves
 * back as the view opens up. This module is the arithmetic; `FeatureSet` owns
 * the layers and does the applying.
 */

/**
 * A position as a key, for joining a line's end to the marker standing there.
 *
 * Nothing in a response links the two -- the service sends a movement's line
 * and its holdings' points as separate features -- but they come from the same
 * records, so the coordinates agree exactly and the position is the join.
 *
 * Six decimal places is about 10cm: finer than anything this data knows, and
 * coarse enough to survive a float round-trip.
 *
 * @param {{lat: number, lng: number}} latlng
 * @returns {string}
 */
export const placeKey = ({ lat, lng }) => `${lat.toFixed(6)},${lng.toFixed(6)}`;

/**
 * One line's ends, re-aimed at whatever is drawn for them now.
 *
 * `null` when nothing moved, which is the common answer: this runs on every pan
 * and Leaflet rebuilds a whole path on `setLatLngs`, so the unchanged case has
 * to cost nothing.
 *
 * An end with no marker at its position is left exactly where the producer put
 * it. So is one whose marker is its own visible parent -- which is every marker
 * once the view is close enough to draw them all, so a fully zoomed-in map
 * restores the geometry that arrived, to the last decimal.
 *
 * @param {{original: Array, key: ?string}} line - The path as sent, and the last key applied.
 * @param {Object} markerAt          - Position key -> marker layer, null-prototype.
 * @param {Function} visibleParentOf - A marker -> what the cluster draws for it.
 * @returns {{next: Array, key: string}|null}
 */
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

/**
 * Ease in and out, as a cubic.
 *
 * A line that starts and stops abruptly reads as a jump with extra steps; the
 * point of moving it at all is to say *where the end went*, and that is carried
 * by the acceleration rather than by the travel.
 *
 * @param {number} t - 0 to 1.
 * @returns {number}
 */
export const easeInOut = (t) =>
  (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2);

/**
 * A path part-way between two others.
 *
 * Straight lerp per vertex, in degrees. Over the distances a cluster moves an
 * end -- a badge is within a screen of its markers -- the difference between
 * this and a great-circle path is far below a pixel, and the alternative costs
 * a projection per vertex per frame.
 *
 * The two paths come from the same `original`, so they are the same length; a
 * mismatch would mean the geometry changed underneath, and the target wins.
 *
 * @param {Array} from - Where the path is now.
 * @param {Array} to   - Where it is going.
 * @param {number} t   - 0 to 1, already eased.
 * @returns {Array}
 */
export const between = (from, to, t) => to.map((end, i) => {
  const start = from[i];
  if (!start) return end;
  return {
    lat: start.lat + (end.lat - start.lat) * t,
    lng: start.lng + (end.lng - start.lng) * t
  };
});
