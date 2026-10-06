import { React, PropTypes, elements } from 'perun-core';
import { config, core, tools } from '../../spatial';
import { canLocate, locatePress } from '../../lib/controls';
import { useAtlasMap } from '../context';
import { MapControl, Skipped } from './host';
import { label } from './messages';
import '../../style/locate-control.css';

const { setting } = config;
const { factory } = core;
const { readout } = tools;
const { useCallback, useEffect, useRef, useState } = React;
const { Icon } = elements;

const available = () => canLocate(
  typeof navigator === 'undefined' ? undefined : navigator,
  typeof window === 'undefined' ? undefined : window
);

/**
 * Where the reader is, on a map that may not cover it.
 *
 * `map.locate({ setView: true })` is one line and this is not, because the one
 * line is wrong in three ways that all show up in the field. It flies the map to
 * wherever the browser says, which on a national deployment may be another
 * country and leaves the user looking at grey; it reports nothing at all while
 * the fix is being taken, which on a tablet outdoors is several seconds of a
 * button that appears not to have worked; and it reports failure only to the
 * console.
 *
 * So: locate without moving, check the position against the deployment's own
 * limits the way the coordinate readout checks a typed one, and move only if it
 * is somewhere this map can show. A position outside is not an error -- it is an
 * answer, and saying so is more useful than a blank map.
 *
 * Ported from spatial's `ui.LocateControl`, which is frozen, with the same
 * markup, classes and label codes. It reads its map from `AtlasMap`.
 *
 * @param {string} [position] - The corner it sits in.
 * @param {number} [maxZoom] - How far to zoom in on a fix. The accuracy circle
 *        is drawn regardless, which is the honest picture of what was found.
 */
export const LocateControl = ({ position = 'topleft', maxZoom }) =>
  (typeof readout?.inside === 'function'
    ? <MapControl position={position}><Locate maxZoom={maxZoom} /></MapControl>
    : <Skipped what='locate control' />);

LocateControl.propTypes = { position: PropTypes.string, maxZoom: PropTypes.number };

const Locate = ({ maxZoom = 16 }) => {
  const map = useAtlasMap();
  const [state, setState] = useState(available() ? 'idle' : 'unavailable');
  const [message, setMessage] = useState(null);

  /* Created here and taken off on unmount: a mark left on a map that outlives
     this control is a mark on the next screen. */
  const groupRef = useRef(null);
  useEffect(() => {
    const group = factory.layerGroup().addTo(map);
    groupRef.current = group;

    return () => {
      map.stopLocate();
      group.clearLayers();
      map.removeLayer(group);
      groupRef.current = null;
    };
  }, [map]);

  const clear = useCallback(() => {
    groupRef.current?.clearLayers();
    setMessage(null);
    setState(available() ? 'idle' : 'unavailable');
  }, []);

  useEffect(() => {
    const found = (event) => {
      const group = groupRef.current;
      if (!group) return;

      group.clearLayers();

      factory.circleMarker(event.latlng, {
        radius: 5, weight: 2, color: '#1a73e8', fillColor: '#1a73e8', fillOpacity: 1
      }).addTo(group);

      // What the browser actually promised, drawn rather than described. A
      // fix good to 2km and one good to 5m are the same dot otherwise.
      if (Number.isFinite(event.accuracy) && event.accuracy > 0) {
        factory.circle(event.latlng, {
          radius: event.accuracy, weight: 1, color: '#1a73e8',
          fillColor: '#1a73e8', fillOpacity: 0.12
        }).addTo(group);
      }

      if (readout.inside(event.latlng, setting('bounds'))) {
        map.setView(event.latlng, Math.min(maxZoom, map.getMaxZoom()));
        setState('found');
        setMessage(null);
        return;
      }

      // Marked but not flown to. The mark is still worth having: it says
      // the fix succeeded and the map is simply somewhere else.
      setState('outside');
      setMessage(label('outside_bounds', 'You are outside this map'));
    };

    const failed = (event) => {
      setState('error');
      setMessage(
        label('geolocation_failed', 'Could not find your position') +
        (event?.message ? ` — ${event.message}` : '')
      );
    };

    map.on('locationfound', found);
    map.on('locationerror', failed);

    return () => {
      map.off('locationfound', found);
      map.off('locationerror', failed);
    };
  }, [map, maxZoom]);

  const locate = () => {
    const step = locatePress(state);

    if (step === 'explain') {
      setMessage(label(
        'geolocation_insecure',
        'Your position is only available over https'
      ));
      return;
    }

    if (step === 'clear') { clear(); return; }

    setState('locating');
    setMessage(null);
    // `setView: false` deliberately -- `locationfound` decides whether the
    // map may go there, which it cannot do once Leaflet has already moved it.
    map.locate({ setView: false, enableHighAccuracy: true, timeout: 10000 });
  };

  const icon = state === 'unavailable' || state === 'error'
    ? 'IconCurrentLocationOff'
    : 'IconCurrentLocation';

  return (
    <div className='locate-control'>
      {/* `leaflet-bar` is the look, shared with the zoom and fullscreen
          buttons this stacks under. Wrapping only the button, so the
          message below it does not pick up the bar's shadow. */}
      <div className='leaflet-bar'>
        <button
          type='button'
          className={`locate-control__button${state === 'locating' ? ' is-busy' : ''}${state === 'found' ? ' is-found' : ''}`}
          onClick={locate}
          title={label('geolocation', 'Show my position')}
          aria-label={label('geolocation', 'Show my position')}
          aria-busy={state === 'locating' || undefined}
        >
          <Icon name={icon} size={18} stroke={1.75} aria-hidden='true' />
          <span className='locate-control__fallback' aria-hidden='true'>&#9678;</span>
        </button>
      </div>

      {message && (
        <div className='locate-control__message' role='status'>{message}</div>
      )}
    </div>
  );
};

Locate.propTypes = { maxZoom: PropTypes.number };
