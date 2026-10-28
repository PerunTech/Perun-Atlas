import { React } from 'perun-core';
import { core } from '../spatial';
import { applyToEngine } from '../bootstrap/apply';
import { resolve } from '../bootstrap/resolve';
import { fallbackBasemap, fetchLayers, firstOf, layerNamed } from '../data/tiles';
import { basemapNotice, FAILURE_CARD, failureNotice, say } from '../lib/notices';
import { FIT_PADDING } from '../lib/zoom';
import { AtlasMapContext } from './context';
import { BasemapNotice } from './notices/BasemapNotice';
import { UnavailableCard } from './notices/UnavailableCard';
import { AttributionControl } from './controls/AttributionControl';
import { CoordinatesControl } from './controls/CoordinatesControl';
import { FullscreenControl } from './controls/FullscreenControl';
import { LayerSwitcher } from './controls/LayerSwitcher';
import { LocateControl } from './controls/LocateControl';
import { MeasureControl } from './controls/MeasureControl';
import { ScaleControl } from './controls/ScaleControl';
import { ZoomBar } from './controls/ZoomBar';
import { ZoomRail, ZOOM_LABELS } from './controls/ZoomRail';
import '../style/controls.css';

const { useEffect, useMemo, useRef, useState } = React;

const loadLayers = async (session, map, config, labels) => {
  const { basemap, overlays, catalogue } = await fetchLayers(session, { maxZoom: config.maxZoom });
  if (catalogue === 'ok') return { basemap, overlays, notice: null };

  const crs = map.getCRS?.()?.code;
  const fallback = fallbackBasemap(config.fallbackBasemap, { crs, maxZoom: config.maxZoom });
  const withFallback = fallback.layer
    ? { ...basemap, [say('basemapDefaultGroup', labels)]: { [fallback.name]: fallback.layer } }
    : basemap;
  return { basemap: withFallback, overlays, notice: basemapNotice(catalogue, fallback, crs) };
};

const eachLayer = (grouped, fn) =>
  Object.values(grouped ?? {}).forEach(group => Object.values(group).forEach(fn));

// Each mount builds its own map with spatial's createMap (4.2.1+) and removes it on unmount, so any
// number can be shown at once. spatial's toolbar is not mounted; the controls here are our own.
export const AtlasMap = ({
  session,
  overrides,
  layerSwitcher = false,
  zoomControl = true,
  zoomPosition = 'bottomright',
  zoomMarks,
  zoomLabels,
  fit = true,
  extent = null,
  view = null,
  coordinates = true,
  coordinatesPosition = 'bottomcenter',
  measure = true,
  measurePosition = 'topleft',
  measureTools,
  fullscreen = true,
  fullscreenPosition = 'topleft',
  locate = true,
  locatePosition = 'topleft',
  scale = true,
  scalePosition = 'bottomleft',
  scaleRatio = true,
  noticeLabels,
  className = 'atlas-map',
  style,
  onReady,
  onError,
  children
}) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [built, setBuilt] = useState(null);
  const [layers, setLayers] = useState(null);
  const ready = layers !== null;
  const [failure, setFailure] = useState(null);
  const [nativeMax, setNativeMax] = useState(null);
  const [notice, setNotice] = useState(null);
  const [reloading, setReloading] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    if (typeof core.createMap !== 'function') {
      const err = new Error(
        'perun-atlas: this map needs spatial 4.2.1 or later, which builds a map per ' +
        'screen with createMap. The spatial on this page has no createMap, so no map is shown.'
      );
      err.engine = true;
      setFailure(err);
      onError?.(err);
      return undefined;
    }

    const start = async () => {
      try {
        const config = await resolve(overrides);
        if (cancelled) return;

        // A map takes the engine's settings as they stand when it is built.
        applyToEngine(config);

        // A box of its own: Leaflet writes classes and an inline position onto the element, which a
        // re-render with another `className` or `style` would strip.
        const element = document.createElement('div');
        element.style.height = '100%';
        element.style.width = '100%';
        containerRef.current?.appendChild(element);

        // Built at the view and inside the zoom limits, so nothing animates into place mid-assembly.
        const map = core.createMap(element, {
          center: view?.center ?? config.center,
          zoom: view?.zoom ?? config.zoom,
          minZoom: config.minZoom,
          maxZoom: config.maxZoom
        });
        mapRef.current = map;

        // Controls go on before the layers, or the attribution credits come out in another order. On
        // React 16 this commits before the call returns.
        setBuilt({ map, config });

        const { basemap, overlays, notice: note } = await loadLayers(session, map, config, noticeLabels);
        if (cancelled) return;

        const base = layerNamed(basemap, view?.basemap) ?? firstOf(basemap);
        if (base) base.addTo(map);

        // Above the basemap's deepest real tile Leaflet enlarges the last one, so the rail marks it.
        const readNativeMax = layer => setNativeMax(layer?.options?.maxNativeZoom ?? null);
        readNativeMax(base);

        // Each provider stops at its own depth.
        map.on('baselayerchange', event => readNativeMax(event.layer));

        map.invalidateSize();

        // onReady before setLayers: React 16 doesn't batch in a promise continuation, so the children
        // would otherwise mount before the parent has the data SRID and request a box in the wrong CRS.
        onReady?.({ map, config, basemap, overlays });
        setNotice(note);
        setLayers({ basemap, overlays });
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
      // map.off() as well: Leaflet 1.5 keeps a finished drag's handlers on `document`, which would keep a
      // removed map, and everything its listeners close over, alive.
      const map = mapRef.current;
      mapRef.current = null;
      if (map) {
        const element = map.getContainer();
        map.remove();
        map.off();
        element.parentNode?.removeChild(element);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const retry = () => {
    setFailure(null);
    setBuilt(null);
    setLayers(null);
    setNativeMax(null);
    setNotice(null);
    setAttempt(n => n + 1);
  };

  const reloadLayers = async () => {
    const { map, config } = built;
    setReloading(true);
    const next = await loadLayers(session, map, config, noticeLabels);
    if (mapRef.current !== map) return;
    setReloading(false);
    if (next.notice?.unreachable) return;

    eachLayer(layers.basemap, layer => map.removeLayer(layer));
    const base = firstOf(next.basemap);
    if (base) base.addTo(map);
    setNativeMax(base?.options?.maxNativeZoom ?? null);
    setNotice(next.notice);
    setLayers({ basemap: next.basemap, overlays: next.overlays });
  };

  // Leaflet caches its container's size, so a map mounted hidden (a modal mid-transition, a collapsed
  // panel) renders against nothing. Consumers cannot call invalidateSize without the engine.
  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return undefined;

    let frame = null;

    const observer = new ResizeObserver(entries => {
      const box = entries[0]?.contentRect;
      // A hidden container reports zero, which is the failure being avoided.
      if (!box || box.width === 0 || box.height === 0) return;

      // Coalesce the burst a modal transition produces into one recompute.
      if (frame !== null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = null;
        mapRef.current?.invalidateSize();
      });
    });

    observer.observe(node);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [ready]);

  // Only the basemap's ceiling comes from here; screens pass their own marks through `zoomMarks`.
  const marks = useMemo(() => {
    const own = nativeMax === null
      ? []
      : [{
        from: nativeMax,
        to: Number.POSITIVE_INFINITY,
        kind: 'upscaled',
        label: zoomLabels?.upscaled ?? ZOOM_LABELS.upscaled
      }];

    return [...own, ...(zoomMarks ?? [])];
  }, [nativeMax, zoomMarks, zoomLabels]);

  if (failure) {
    const found = failureNotice(failure);
    const card = FAILURE_CARD[found.kind];
    return (
      <div className={`${className} atlas-map-error`} style={{ height: '100%', ...style }}>
        <UnavailableCard
          icon={card.icon}
          title={say(card.title, noticeLabels)}
          hint={say(card.hint, noticeLabels)}
          rows={found.rows}
          details={found.rows.length ? null : failure.message}
          copy={[failure.message, window.server && `Server: ${window.server}`].filter(Boolean).join('\n\n')}
          onRetry={found.retry ? retry : undefined}
          labels={noticeLabels}
        />
      </div>
    );
  }

  const config = built?.config;

  // Leaflet fills a top corner in arrival order and a bottom corner in reverse, so this order keeps the
  // zoom above the credit line and the credit on the map edge.
  return (
    <AtlasMapContext.Provider value={built?.map ?? null}>
      <div ref={containerRef} className={className} style={{ height: '100%', ...style }} />
      {built && (
        <>
          {fullscreen && <FullscreenControl position={fullscreenPosition} />}
          {locate && <LocateControl position={locatePosition} />}
          <AttributionControl credit={config.attribution} />
          {/* Any truthy value but 'rail' keeps the buttons; hand-written rows say `1`. */}
          {zoomControl && zoomControl !== 'rail' && (
            <ZoomBar position={zoomPosition} fit={fit} extent={extent} labels={zoomLabels} />
          )}
          {scale && <ScaleControl position={scalePosition} units={config.units} ratio={scaleRatio} />}
          {coordinates && <CoordinatesControl position={coordinatesPosition} />}
          {measure && <MeasureControl position={measurePosition} tools={measureTools} />}
        </>
      )}
      {ready && layerSwitcher && (
        <LayerSwitcher
          basemap={layers.basemap}
          overlays={layers.overlays}
          note={notice?.kind === 'fallback' && !notice.unreachable ? say('basemapDefaultNote', noticeLabels) : undefined}
        />
      )}
      {ready && notice && (
        <BasemapNotice
          key={`${notice.kind}-${notice.unreachable}`}
          notice={notice}
          labels={noticeLabels}
          reloading={reloading}
          onRetry={notice.unreachable ? reloadLayers : undefined}
        />
      )}
      {/* It marks where the first basemap stops sharpening. */}
      {ready && zoomControl === 'rail' && (
        <ZoomRail
          position={zoomPosition}
          marks={marks}
          labels={zoomLabels}
          onFit={fit && extent ? () => built.map.fitBounds(extent, { padding: FIT_PADDING }) : undefined}
        />
      )}
      {ready && children}
    </AtlasMapContext.Provider>
  );
};
