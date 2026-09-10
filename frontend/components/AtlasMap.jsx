import { React } from 'perun-core';
import { core } from '../spatial';
import { resolve } from '../bootstrap';
import { fetchLayers, firstOf } from '../data';

const { Map } = core;
const { useEffect, useRef, useState } = React;

/**
 * A map, mounted into whatever container this component renders.
 *
 * Consumers embed this and add layers through the children render prop; nothing
 * outside perun-atlas should need to touch spatial's `Map` or `factory`.
 *
 * Note on lifecycle: spatial constructs a single Leaflet map when its script
 * evaluates, so this component adopts that instance rather than creating one, and
 * hands it back on unmount. That is the constraint spatial 2.0 lifts — once
 * `createMap` exists, only the body of this effect changes, and no consumer is
 * affected. It also means two AtlasMaps cannot be shown at once, which is fine for
 * an embedded panel and is checked for rather than left to fail obscurely.
 */

let mounted = false;

export const AtlasMap = ({
  session,
  overrides,
  className = 'atlas-map',
  style,
  onReady,
  onError,
  children
}) => {
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [failure, setFailure] = useState(null);

  useEffect(() => {
    let cancelled = false;

    if (mounted) {
      const err = new Error(
        'perun-atlas: a map is already mounted. spatial provides one instance per page ' +
        'until 2.0 introduces createMap; render at most one AtlasMap at a time.'
      );
      setFailure(err);
      onError?.(err);
      return undefined;
    }
    mounted = true;

    const start = async () => {
      try {
        const config = await resolve(overrides);
        if (cancelled) return;

        // Adopt spatial's container directly rather than calling Map.render(),
        // which reaches for the host's navbar and footer and hides them.
        const element = Map.getContainer();
        containerRef.current?.appendChild(element);

        Map.setMinZoom(config.minZoom).setMaxZoom(config.maxZoom);
        Map.setView(config.center, config.zoom);

        const { basemap, overlays } = await fetchLayers(session);
        if (cancelled) return;

        const base = firstOf(basemap);
        if (base) base.addTo(Map);

        Map.invalidateSize();
        setReady(true);
        onReady?.({ map: Map, config, basemap, overlays });
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setFailure(err);
        onError?.(err);
      }
    };

    start();

    return () => {
      cancelled = true;
      mounted = false;
      const element = Map.getContainer();
      if (element?.parentNode) element.parentNode.removeChild(element);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failure) {
    return (
      <div className={`${className} atlas-map-error`} role="alert">
        {failure.message}
      </div>
    );
  }

  return (
    <>
      <div ref={containerRef} className={className} style={{ height: '100%', ...style }} />
      {ready && children}
    </>
  );
};
