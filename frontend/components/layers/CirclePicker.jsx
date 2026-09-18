import { React } from 'perun-core';
import { core, tools } from '../../spatial';
import '../../style/draw.css';

const { Map, factory } = core;
const { useEffect, useRef } = React;

/** Takes the named layers off the map, if they are on it. */
const clear = (...refs) => refs.forEach((ref) => {
  if (ref.current) {
    Map.removeLayer(ref.current);
    ref.current = null;
  }
});

/** How the drawn shape looks, unless a caller says otherwise. */
const STYLE = {
  color: '#b3261e',
  weight: 2,
  opacity: 0.95,
  fillColor: '#b3261e',
  fillOpacity: 0.12
};

/** The preview while the circle is being drawn: the same colour, lighter. */
const PREVIEW = { ...STYLE, dashArray: '5 4', fillOpacity: 0.06 };

/**
 * A circle on the map: a centre, and a radius in metres.
 *
 * Controlled, as `PointPicker` is. It draws `value` and reports every change
 * through `onChange`, and holds no shape of its own — so the caller can seed it
 * from a record, round the radius, clear it, or refuse a change, and this
 * component never has an opinion about what a circle means. That is what keeps
 * it usable wherever a screen means *around here, about this far*: a point and a
 * distance is the whole of the geometry, whatever the screen calls it.
 *
 * Two ways to set one, because the two answer different questions. Drawing it —
 * `drawing`, one click for the centre and a second for the edge — is how a
 * reader says *around here, about this far*. Dragging the handles afterwards, or
 * typing a radius into whatever the caller renders, is how they say *exactly
 * 3 km*. Both end in the same `{ lat, lng, radius }`.
 *
 * The drawing itself is the engine's: `tools.draw.circle` is Geoman's, with the
 * live preview, the hint line and the cursor tooltip already built. It is armed
 * while `drawing` is true and disarmed the moment a shape is finished, and the
 * layer it leaves behind is removed — what stays on the map is the controlled
 * circle below, drawn from `value`, so there is never a moment with two circles
 * on screen disagreeing about where the shape is.
 *
 * The radius travels in metres on the ground, which is what Leaflet sizes a
 * circle by and what a reader measured. A service storing a projected CRS wants
 * it in its own units; converting is the caller's, through `unitsPerMetre`,
 * because only the caller knows which projection it is sending to.
 *
 * @param {{lat: number, lng: number, radius: number}|null} value - the circle, or null
 * @param {boolean}  drawing   - arm the engine's draw tool
 * @param {Function} onChange  - called with { lat, lng, radius } on every change
 * @param {Function} [onDrawn] - called once when a drawn shape is finished
 * @param {Object}   [style]   - path options for the drawn circle
 * @param {boolean}  [editable] - draggable centre and edge handles
 */
export const CirclePicker = ({
  value,
  drawing = false,
  onChange,
  onDrawn,
  style,
  editable = true
}) => {
  const circleRef = useRef(null);
  const centreRef = useRef(null);
  const handleRef = useRef(null);

  // Bound once, so the map and the handles keep one handler however often the
  // caller re-renders.
  const report = useRef(onChange);
  report.current = onChange;
  const drawn = useRef(onDrawn);
  drawn.current = onDrawn;

  /**
   * The engine's draw tool, while `drawing` is true.
   *
   * `new_shape` is fired after the tool has already added its own circle to the
   * map and disabled itself, so this reads the shape off that layer and takes it
   * away again. Leaving it would put an uncontrolled circle on the map that no
   * later change to `value` could move.
   */
  useEffect(() => {
    const circle = tools?.draw?.circle;
    if (!drawing || !circle) {
      if (!drawing && circle?.isEnabled?.()) circle.disable();
      if (drawing && !circle) {
        console.warn('perun-atlas: the engine on this environment has no circle draw tool; skipping it.');
      }
      return undefined;
    }

    const onShape = ({ shape, layer }) => {
      if (shape !== 'circle' || !layer) return;

      const centre = layer.getLatLng();
      const radius = layer.getRadius();
      Map.removeLayer(layer);

      const next = { lat: centre.lat, lng: centre.lng, radius };
      report.current?.(next);
      drawn.current?.(next);
    };

    Map.on('new_shape', onShape);
    circle.enable({
      templineStyle: PREVIEW,
      hintlineStyle: { ...PREVIEW, fillOpacity: 0 },
      pathOptions: { ...STYLE, ...style },
      cursorMarker: true,
      // The engine's own tooltips, and they are its own label codes: an
      // unregistered one renders as `perun.spatial.start_circle` on the cursor,
      // which is worse than silence. The caller says what to do in its own
      // words, in the bar above the map, and in a language this package is not
      // choosing for it.
      tooltips: false
    });

    return () => {
      Map.off('new_shape', onShape);
      if (circle.isEnabled?.()) circle.disable();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawing]);

  /**
   * The circle follows `value`, and the handles follow the circle.
   *
   * The east handle is placed from the circle's own bounds rather than from
   * arithmetic on the radius, so it sits where the engine actually drew the edge
   * at this latitude and in this projection. Dragging it back the other way
   * measures with Leaflet's own distance, which is the same function the circle
   * was sized by — so a handle that is not moved reports the radius unchanged
   * rather than one rounded through two conversions.
   */
  useEffect(() => {
    if (!value || !(value.radius > 0)) { clear(circleRef, centreRef, handleRef); return undefined; }

    const centre = factory.latLng({ lat: value.lat, lng: value.lng });

    if (!circleRef.current) {
      circleRef.current = factory.circle(centre, {
        ...STYLE,
        ...style,
        radius: value.radius,
        // The area readout the engine draws on a measured circle. Where the
        // build has no measure module the option is simply unread.
        showMeasurements: true,
        interactive: false
      }).addTo(Map);
    } else {
      circleRef.current.setLatLng(centre);
      circleRef.current.setRadius(value.radius);
    }

    if (!editable) { clear(centreRef, handleRef); return undefined; }

    const east = factory.latLng({ lat: centre.lat, lng: circleRef.current.getBounds().getEast() });

    if (!centreRef.current) {
      centreRef.current = factory.marker(centre, {
        icon: factory.divIcon({ className: 'atlas-draw-handle atlas-draw-handle--centre', html: '' }),
        draggable: true,
        zIndexOffset: 1000
      }).addTo(Map);

      centreRef.current.on('drag', (e) => {
        const at = e.target.getLatLng();
        report.current?.({ lat: at.lat, lng: at.lng, radius: circleRef.current?.getRadius() });
      });
    } else {
      centreRef.current.setLatLng(centre);
    }

    if (!handleRef.current) {
      handleRef.current = factory.marker(east, {
        icon: factory.divIcon({ className: 'atlas-draw-handle atlas-draw-handle--edge', html: '' }),
        draggable: true,
        zIndexOffset: 1000
      }).addTo(Map);

      handleRef.current.on('drag', (e) => {
        const at = e.target.getLatLng();
        const middle = centreRef.current?.getLatLng() ?? centre;
        report.current?.({ lat: middle.lat, lng: middle.lng, radius: Map.distance(middle, at) });
      });
    } else {
      handleRef.current.setLatLng(east);
    }

    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.lat, value?.lng, value?.radius, editable]);

  // Everything above is imperative and lives on the map. The effect that draws
  // it deliberately has no cleanup -- tearing the circle down and rebuilding it
  // on every change to the radius would flicker it -- so unmounting is what
  // takes it off.
  useEffect(() => () => clear(circleRef, centreRef, handleRef), []);

  return null;
};
