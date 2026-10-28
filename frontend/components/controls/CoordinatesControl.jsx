import { React, PropTypes } from 'perun-core';
import { config, core, tools } from '../../spatial';
import { cornerFor } from '../../lib/controls';
import { useAtlasMap } from '../context';
import { MapControl, Skipped } from './host';
import { label } from './messages';
import '../../style/coordinates.css';

const { setting } = config;
const { util } = core;
const { readout } = tools;
const { useEffect, useMemo, useRef, useState } = React;

const AXIS_LABELS = {
  latitude: ['latitude', 'Lat'],
  longitude: ['longitude', 'Lng'],
  abscissa_x: ['abscissa_x', 'X'],
  ordinate_y: ['ordinate_y', 'Y']
};

const mapSystem = (map) => {
  const crs = map.getCRS();

  return {
    code: crs?.code,
    label: crs?.desc || crs?.code,
    project: (latlng) => map.transform(latlng),
    unproject: (point) => map.untransform(point)
  };
};

const opening = (map) => {
  try {
    return map.getCenter();
  } catch {
    // A map with no view yet opens on the configured centre.
    return setting('center');
  }
};

// Follows the pointer, and takes a typed position to move the map there. Every system converts from
// the WGS84 position a Leaflet event carries, so the map's projection never changes. Ported from
// spatial's frozen `ui.CoordinatesControl`.
export const CoordinatesControl = ({ position = 'bottomcenter', precision, systems }) => {
  const map = useAtlasMap();

  if (typeof readout?.resolve !== 'function') return <Skipped what='coordinate readout' />;

  return (
    <MapControl position={cornerFor(map._controlCorners, position, 'bottomleft')}>
      <Readout precision={precision} systems={systems} />
    </MapControl>
  );
};

CoordinatesControl.propTypes = {
  position: PropTypes.string,
  precision: PropTypes.number,
  systems: PropTypes.array
};

const Readout = ({ precision = 5, systems: configured }) => {
  const map = useAtlasMap();
  const [position, setPosition] = useState(() => opening(map));
  const [chosen, setChosen] = useState(null);
  const [draft, setDraft] = useState(null);
  const [rejected, setRejected] = useState(false);
  const [copied, setCopied] = useState(false);

  // No CRS event exists; `setCRS` re-applies the view, so `viewreset` fires.
  const [crsCode, setCrsCode] = useState(() => map.getCRS()?.code);
  useEffect(() => {
    const follow = () => setCrsCode(map.getCRS()?.code);
    map.on('viewreset', follow);
    return () => map.off('viewreset', follow);
  }, [map]);

  const systems = useMemo(
    () => readout.resolve(configured ?? setting('coordinateSystems'), mapSystem(map), precision),
    // crsCode isn't read in there; it is what makes this run again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [configured, precision, crsCode, map]
  );

  const system = systems.find(candidate => candidate.key === chosen) ?? systems[0];

  // Every pointer move is a projection, so throttled, and built once so the throttle holds.
  const track = useMemo(() => util.throttle((event) => setPosition(event.latlng), 100), []);

  // Not while someone is typing, or their half-written value would be overwritten.
  useEffect(() => {
    if (draft) return undefined;

    map.on('mousemove', track);
    return () => map.off('mousemove', track);
  }, [draft, track, map]);

  const confirmation = useRef(null);
  useEffect(() => () => clearTimeout(confirmation.current), []);

  const values = system ? (draft ?? system.toText(position)) : ['', ''];

  const edit = (index, text) => {
    setRejected(false);
    setDraft(values.map((value, at) => (at === index ? text : value)));
  };

  const locate = () => {
    const latlng = system?.toLatLng(values);

    // Checked on the latitude and longitude, so one rule covers a grid easting and a degree.
    if (!latlng || !readout.inside(latlng, setting('bounds'))) {
      setRejected(true);
      return;
    }

    setRejected(false);
    setDraft(null);
    map.setView(latlng, map.getZoom());
  };

  const onKeyDown = (event) => {
    if (event.key === 'Enter') { event.preventDefault(); locate(); }
    if (event.key === 'Escape') { setDraft(null); setRejected(false); event.target.blur(); }
  };

  // Moving between the two boxes keeps the draft; leaving the control resumes tracking.
  const onBlur = (event) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    setDraft(null);
    setRejected(false);
  };

  const copy = () => {
    const written = navigator.clipboard?.writeText?.(values.join(', '));
    if (!written) return;

    written
      .then(() => {
        setCopied(true);
        clearTimeout(confirmation.current);
        confirmation.current = setTimeout(() => setCopied(false), 1500);
      })
      // An insecure origin, or permission refused.
      .catch(() => {});
  };

  if (!system) return null;

  return (
    <div id='coordinates-control' className='coordinates-control' onBlur={onBlur}>
      {systems.length > 1 && (
        <select
          className='coordinates-control__system'
          value={system.key}
          onChange={(event) => { setChosen(event.target.value); setDraft(null); }}
          aria-label={label('coordinate_system', 'Coordinate system')}
        >
          {systems.map(candidate => (
            <option key={candidate.key} value={candidate.key}>{candidate.label}</option>
          ))}
        </select>
      )}

      <div className='coordinates-control__pair'>
        {values.map((value, index) => {
          const [code, fallback] = AXIS_LABELS[system.axes[index]] ?? ['', ''];

          return (
            <label className='coordinates-control__field' key={system.axes[index]}>
              <span className='coordinates-control__axis'>{label(code, fallback)}</span>
              <input
                type='text'
                className='coordinates-control__value'
                value={value}
                spellCheck='false'
                autoComplete='off'
                aria-invalid={rejected || undefined}
                onChange={(event) => edit(index, event.target.value)}
                onKeyDown={onKeyDown}
                onFocus={(event) => { setDraft(values); event.target.select(); }}
              />
            </label>
          );
        })}
      </div>

      <button
        type='button'
        className='coordinates-control__copy'
        onClick={copy}
        title={label('copy', 'Copy')}
        aria-label={label('copy', 'Copy')}
      >
        {copied ? '✓' : '⧉'}
      </button>

      {rejected && (
        <div className='coordinates-control__rejected' role='status'>
          {label('outside_bounds', 'Outside this map')}
        </div>
      )}
    </div>
  );
};

Readout.propTypes = {
  precision: PropTypes.number,
  systems: PropTypes.array
};
