import { React } from 'perun-core';
import { core } from '../spatial';
import '../style/picker.css';

const { Map, factory } = core;
const { useEffect, useRef } = React;

/**
 * The default pin: a teardrop with a hole, drawn inline.
 *
 * Inline rather than an image, because Leaflet's own marker resolves its png
 * through the spatial package's css, and that does not survive bundling. It is
 * drawn smaller than its viewBox so the stroke and the inner dot scale with it,
 * and it fills with `currentColor` so the stylesheet decides the colour.
 */
const PIN = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="28" viewBox="0 0 26 36">
  <path d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 23 13 23s13-13.25 13-23C26 5.82 20.18 0 13 0z"
        fill="currentColor" stroke="#ffffff" stroke-width="1.75"/>
  <circle cx="13" cy="13" r="4" fill="#ffffff"/>
</svg>`;

/**
 * One point on the map, placed by clicking and moved by dragging.
 *
 * Controlled: it draws `value` and reports every move through `onChange`, and
 * holds no position of its own. The caller therefore owns the coordinate — it can
 * seed it from a record, round it, clear it, or refuse a change — and this
 * component never has an opinion about what a coordinate means.
 *
 * The reported position is always the raw one. Rounding here would visibly shift
 * the pin away from where it was dropped, so a caller that displays degrees and
 * minutes should format for display and keep this value.
 *
 * @param {{lat: number, lng: number}|null} value - the placed point, or null for none
 * @param {Function} onChange   - called with { lat, lng } on click and while dragging
 * @param {boolean}  draggable
 * @param {string}   className  - class on the pin, for styling
 * @param {string}   html       - markup for the pin, if the default will not do
 * @param {number[]} size       - [width, height] in pixels
 * @param {number[]} anchor     - the point of the icon that sits on the coordinate
 */
export const PointPicker = ({
  value,
  onChange,
  draggable = true,
  className = 'atlas-pin',
  html = PIN,
  size = [20, 28],
  anchor = [10, 28]
}) => {
  const markerRef = useRef(null);
  // Bound once, so the map keeps one handler however often the caller re-renders.
  const report = useRef(onChange);
  report.current = onChange;

  useEffect(() => {
    const onClick = (e) => report.current?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    Map.on('click', onClick);

    return () => {
      Map.off('click', onClick);
      if (markerRef.current) {
        Map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    };
  }, []);

  /**
   * The pin follows `value`. Its appearance is read when the pin is created and
   * not afterwards: an icon that changed mid-drag would fight the drag.
   */
  useEffect(() => {
    if (!value) {
      if (markerRef.current) {
        Map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      return;
    }

    if (markerRef.current) {
      markerRef.current.setLatLng(value);
      return;
    }

    const marker = factory.marker(value, {
      icon: factory.divIcon({ className, html, iconSize: size, iconAnchor: anchor }),
      draggable
    }).addTo(Map);

    marker.on('drag', (e) => report.current?.({ ...e.target.getLatLng() }));
    markerRef.current = marker;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.lat, value?.lng]);

  return null;
};
