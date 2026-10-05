import { React, PropTypes } from 'perun-core';
import { config, core, tools } from '../../spatial';
import { cornerFor } from '../../lib/controls';
import { useAtlasMap } from './context';
import { MapControl, Skipped } from './host';
import { label } from './labels';
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

/** The map's own system, as `readout` wants it: a code, a name and a pair of conversions. */
const mapSystem = (map) => {
  const crs = map.getCRS();

  return {
    code: crs?.code,
    label: crs?.desc || crs?.code,
    project: (latlng) => map.transform(latlng),
    unproject: (point) => map.untransform(point)
  };
};

/** Where to read from before the pointer has been anywhere. */
const opening = (map) => {
  try {
    return map.getCenter();
  } catch {
    // A map with no view yet. The configured centre is what it will open on.
    return setting('center');
  }
};

/**
 * Where the pointer is, in a system the reader picks.
 *
 * Two things at once, and they are worth separating. The readout follows the
 * pointer and quotes its position; the same two boxes take a position typed into
 * them and move the map there. One is for reading this map against something
 * else -- a record's own GPS fields, a paper sheet, a parcel reference -- and
 * the other is for finding a place someone has been handed the coordinates of.
 *
 * The system is the reader's choice, and the map's projection is not. A Leaflet
 * event carries WGS84 latitude and longitude however the map is projected, so
 * every system offered here converts from that: no tile is invalidated, no WMS
 * layer is left projected the old way, and the view never moves. Which systems
 * are offered is the `coordinateSystems` setting; the engine's `readout.resolve`
 * says what an entry looks like and what an empty list falls back to.
 *
 * Typing goes back through whichever system is on screen, so pressing Enter on
 * a position quoted in one system never reads it as another.
 *
 * Centred under the map by default rather than tucked in a corner: it describes
 * the map instead of acting on it. `bottomcenter` is spatial's own region, so on
 * an engine without it the readout goes to the bottom left, where it used to be.
 *
 * Ported from spatial's `ui.CoordinatesControl`, which is frozen, with the same
 * markup, classes and label codes. It reads its map from `AtlasMap`.
 *
 * @param {string} [position] - Where it sits.
 * @param {number} [precision] - Decimal places for degrees. A system carrying its
 *        own `decimals` keeps it; this is the default for the ones that do not.
 * @param {Array} [systems] - Overrides the `coordinateSystems` setting, for a
 *        screen that knows better than its deployment does. Same shape.
 */
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

  // A map's CRS can be changed while this is mounted, and the system built out
  // of it has to follow. `setCRS` re-applies the view, so `viewreset` is the
  // event that fires -- there is no CRS event to listen for.
  const [crsCode, setCrsCode] = useState(() => map.getCRS()?.code);
  useEffect(() => {
    const follow = () => setCrsCode(map.getCRS()?.code);
    map.on('viewreset', follow);
    return () => map.off('viewreset', follow);
  }, [map]);

  const systems = useMemo(
    () => readout.resolve(configured ?? setting('coordinateSystems'), mapSystem(map), precision),
    // crsCode is not read in there; it is what makes this run again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [configured, precision, crsCode, map]
  );

  const system = systems.find(candidate => candidate.key === chosen) ?? systems[0];

  /* Throttled, because this fires on every pointer move across the map and
     each one is a projection. Built once: a throttle rebuilt every render
     throttles nothing. */
  const track = useMemo(() => util.throttle((event) => setPosition(event.latlng), 100), []);

  /* Not while someone is typing -- the pointer is over the box rather than the
     map, and whatever they had half-written would be overwritten as they went. */
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

  /* Plain, not memoised: it closes over `values`, which is rebuilt on every
     render by design -- the readout follows the pointer. A `useCallback` over
     that memoises nothing and only says otherwise. */
  const locate = () => {
    const latlng = system?.toLatLng(values);

    // Checked on the latitude and longitude rather than on what was typed,
    // so one rule covers a national grid's easting as well as a degree.
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

  /* Leaving the control resumes tracking. Moving between its two boxes does
     not, which is what the relatedTarget check is for. */
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
      // An insecure origin, or permission refused. The readout still reads.
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
