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

// Locates without moving, then flies there only if the fix is inside the deployment's bounds; a
// national map would otherwise fly to grey. Ported from spatial's frozen `ui.LocateControl`.
export const LocateControl = ({ position = 'topleft', maxZoom }) =>
  (typeof readout?.inside === 'function'
    ? <MapControl position={position}><Locate maxZoom={maxZoom} /></MapControl>
    : <Skipped what='locate control' />);

LocateControl.propTypes = { position: PropTypes.string, maxZoom: PropTypes.number };

const Locate = ({ maxZoom = 16 }) => {
  const map = useAtlasMap();
  const [state, setState] = useState(available() ? 'idle' : 'unavailable');
  const [message, setMessage] = useState(null);

  // Taken off on unmount, or the mark would show on the next screen's map.
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

      // A fix good to 2 km and one good to 5 m are otherwise the same dot.
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

      // Still marked: the fix worked, the map is simply somewhere else.
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
    // `locationfound` decides whether the map may go there, which it can't once Leaflet has moved it.
    map.locate({ setView: false, enableHighAccuracy: true, timeout: 10000 });
  };

  const icon = state === 'unavailable' || state === 'error'
    ? 'IconCurrentLocationOff'
    : 'IconCurrentLocation';

  return (
    <div className='locate-control'>
      {/* Only the button is wrapped, so the message below doesn't pick up the bar's shadow. */}
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
