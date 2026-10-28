import { React } from 'perun-core';
import { core, tools } from '../../spatial';
import { useAtlasMap } from '../context';
import '../../style/draw.css';

const { factory } = core;
const { useEffect, useRef } = React;

const clear = (map, ...refs) => refs.forEach((ref) => {
  if (ref.current) {
    map.removeLayer(ref.current);
    ref.current = null;
  }
});

const STYLE = {
  color: '#b3261e',
  weight: 2,
  opacity: 0.95,
  fillColor: '#b3261e',
  fillOpacity: 0.12
};

const PREVIEW = { ...STYLE, dashArray: '5 4', fillOpacity: 0.06 };

// Controlled, as PointPicker is. Drawn with the engine's own circle tool, whose layer is removed once
// finished so only the circle drawn from `value` stays. The radius is in ground metres.
export const CirclePicker = ({
  value,
  drawing = false,
  onChange,
  onDrawn,
  style,
  editable = true
}) => {
  const map = useAtlasMap();
  const circleRef = useRef(null);
  const centreRef = useRef(null);
  const handleRef = useRef(null);

  // Refs, so the map and the handles keep one handler however often the caller re-renders.
  const report = useRef(onChange);
  report.current = onChange;
  const drawn = useRef(onDrawn);
  drawn.current = onDrawn;

  // The tool adds its own circle before `new_shape`; it is removed so nothing uncontrolled stays on the map.
  useEffect(() => {
    const circle = (map.draw ?? tools?.draw)?.circle;
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
      map.removeLayer(layer);

      const next = { lat: centre.lat, lng: centre.lng, radius };
      report.current?.(next);
      drawn.current?.(next);
    };

    map.on('new_shape', onShape);
    circle.enable({
      templineStyle: PREVIEW,
      hintlineStyle: { ...PREVIEW, fillOpacity: 0 },
      pathOptions: { ...STYLE, ...style },
      cursorMarker: true,
      // Its tooltips use spatial's label codes, which would render raw where unregistered.
      tooltips: false
    });

    return () => {
      map.off('new_shape', onShape);
      if (circle.isEnabled?.()) circle.disable();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, drawing]);

  // The edge handle is placed from the circle's bounds and dragged with Leaflet's distance, so an
  // unmoved handle reports the radius unchanged.
  useEffect(() => {
    if (!value || !(value.radius > 0)) { clear(map, circleRef, centreRef, handleRef); return undefined; }

    const centre = factory.latLng({ lat: value.lat, lng: value.lng });

    if (!circleRef.current) {
      circleRef.current = factory.circle(centre, {
        ...STYLE,
        ...style,
        radius: value.radius,
        showMeasurements: true,
        interactive: false
      }).addTo(map);
    } else {
      circleRef.current.setLatLng(centre);
      circleRef.current.setRadius(value.radius);
    }

    if (!editable) { clear(map, centreRef, handleRef); return undefined; }

    const east = factory.latLng({ lat: centre.lat, lng: circleRef.current.getBounds().getEast() });

    if (!centreRef.current) {
      centreRef.current = factory.marker(centre, {
        icon: factory.divIcon({ className: 'atlas-draw-handle atlas-draw-handle--centre', html: '' }),
        draggable: true,
        zIndexOffset: 1000
      }).addTo(map);

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
      }).addTo(map);

      handleRef.current.on('drag', (e) => {
        const at = e.target.getLatLng();
        const middle = centreRef.current?.getLatLng() ?? centre;
        report.current?.({ lat: middle.lat, lng: middle.lng, radius: map.distance(middle, at) });
      });
    } else {
      handleRef.current.setLatLng(east);
    }

    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, value?.lat, value?.lng, value?.radius, editable]);

  // The effect above has no cleanup, since rebuilding on every radius change would flicker.
  useEffect(() => () => clear(map, circleRef, centreRef, handleRef), [map]);

  return null;
};
