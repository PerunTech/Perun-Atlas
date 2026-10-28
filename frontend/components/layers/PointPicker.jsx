import { React } from 'perun-core';
import { core } from '../../spatial';
import { useAtlasMap } from '../context';
import '../../style/picker.css';

const { factory } = core;
const { useEffect, useRef } = React;

// Inline, because Leaflet's own marker resolves its png through spatial's CSS, which bundling breaks.
const PIN = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="28" viewBox="0 0 26 36">
  <path d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 23 13 23s13-13.25 13-23C26 5.82 20.18 0 13 0z"
        fill="currentColor" stroke="#ffffff" stroke-width="1.75"/>
  <circle cx="13" cy="13" r="4" fill="#ffffff"/>
</svg>`;

// Controlled, and reports the raw position: rounding here would shift the pin away from where it was dropped.
export const PointPicker = ({
  value,
  onChange,
  draggable = true,
  className = 'atlas-pin',
  html = PIN,
  size = [20, 28],
  anchor = [10, 28]
}) => {
  const map = useAtlasMap();
  const markerRef = useRef(null);
  // Bound once, so the map keeps one handler however often the caller re-renders.
  const report = useRef(onChange);
  report.current = onChange;

  useEffect(() => {
    const onClick = (e) => report.current?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    map.on('click', onClick);

    return () => {
      map.off('click', onClick);
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    };
  }, [map]);

  // The icon is read only when the pin is created, so it can't fight a drag.
  useEffect(() => {
    if (!value) {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
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
    }).addTo(map);

    marker.on('drag', (e) => report.current?.({ ...e.target.getLatLng() }));
    markerRef.current = marker;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, value?.lat, value?.lng]);

  return null;
};
