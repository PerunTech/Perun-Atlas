import { React } from 'perun-core';
import { core } from '../spatial';
import { applyToEngine } from '../bootstrap/apply';
import { resolve } from '../bootstrap/resolve';
import { fetchLayers, firstOf, layerNamed } from '../data/tiles';
import { FIT_PADDING } from '../lib/zoom';
import { AtlasMapContext } from './context';
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

/**
 * A map, mounted into whatever container this component renders.
 *
 * Consumers embed this and add layers through the children render prop; nothing
 * outside perun-atlas should need to touch spatial's `Map` or `factory`.
 *
 * Controls: spatial builds a map with its own zoom and attribution controls
 * switched off, because its toolbar supplies them and this component does not
 * mount that toolbar. Both are put on here instead — zoom on by default, in the
 * bottom right, positionable with `zoomControl` / `zoomPosition` and drawn as a
 * ladder rather than two buttons where a screen asks for `zoomControl: 'rail'`,
 * attribution always, since a tile provider's terms are not an option a screen
 * gets to decline, a
 * coordinate readout, on by default and positionable the same way -- it quotes
 * the pointer's position in whichever system the reader picks, which is how a
 * feature is checked against the GPS fields in its own record -- and a
 * measurement control, also on by default, which answers the questions no
 * service is going to: how far, how large, which way. Fullscreen, a scale bar
 * and a locate button are on by default too: the first because this map usually
 * lives in a modal, the second because a distance on screen means nothing
 * without one, and the third because field use on tablets is real.
 *
 * Where they sit is a division of labour rather than a taste: a control that
 * acts on the map takes a corner it can be reached in, and a control that
 * describes the map sits along the bottom with the others that describe it. The
 * zoom is the one that used to straddle that line -- two buttons that act, and
 * a level that nobody could read anywhere -- which is why it moved out of the
 * top left, where it had been the first of four, to the bottom right above the
 * credit, and why the rail carries its level with it.
 *
 * Each control is a component of its own in `controls/`, which reads the map
 * through `useAtlasMap()`; this component decides which go on, where, and in
 * what order, and takes their options as its own props.
 *
 * The zoom control also carries a button that frames the data again, once a
 * layer has said where the data is: `extent`, as `[[south, west], [north,
 * east]]`, which `FeatureSet` reports and `FeaturePanel` passes on. It lives in
 * the zoom control rather than in a corner of its own because it is a zoom --
 * to a place rather than by a step -- and because a button of its own would
 * have to line up with a bar it knows nothing about. The plain bar gets it on
 * top of the `+`; the rail gets it in the same place. `fit: false` turns it off,
 * and a map with no zoom control has none, since it has nowhere to sit.
 *
 * `view` opens the map somewhere other than the deployment's own centre and
 * zoom, on a basemap other than the first: `{ center: [lat, lng], zoom,
 * basemap }`, any of them, as a link carries them. Read once, when the map is
 * built. A basemap the catalogue does not list, or no longer lists, falls
 * back to the first, so an old link still opens.
 *
 * Note on lifecycle: each mount builds a map of its own with spatial's
 * `createMap`, new in 4.2.1, and removes it on unmount, which takes its layers,
 * its controls and its tools with it. So any number of AtlasMaps can be shown
 * at once, each with its own view, and everything one renders reads that one's
 * map from the context. The page's map, the one spatial builds as its script
 * evaluates, is left alone. An engine from before `createMap` has only that
 * one to offer, and gets a refusal naming the version instead of a map.
 */

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
  className = 'atlas-map',
  style,
  onReady,
  onError,
  children
}) => {
  const containerRef = useRef(null);
  // The map this mount built, for the cleanup and the resize observer.
  const mapRef = useRef(null);
  // The map and the settings it was built with, once it is built, which is
  // when the controls go on it; and the basemaps and overlays once they are in,
  // which is when the switcher and the children do.
  const [built, setBuilt] = useState(null);
  const [layers, setLayers] = useState(null);
  const ready = layers !== null;
  const [failure, setFailure] = useState(null);
  const [nativeMax, setNativeMax] = useState(null);

  useEffect(() => {
    let cancelled = false;

    if (typeof core.createMap !== 'function') {
      const err = new Error(
        'perun-atlas: this map needs spatial 4.2.1 or later, which builds a map per ' +
        'screen with createMap. The spatial on this page has no createMap, so no map is shown.'
      );
      setFailure(err);
      onError?.(err);
      return undefined;
    }

    const start = async () => {
      try {
        const config = await resolve(overrides);
        if (cancelled) return;

        // Push what the deployment declared into the engine first, so spatial
        // reads this rather than globals from the page. A map takes the
        // settings as they stand when it is built, and does not follow them
        // afterwards.
        applyToEngine(config);

        // A box of the map's own inside the container, rather than the container
        // itself: Leaflet adds its classes and an inline position to the element
        // it is given, and a re-render with another `className` or `style` would
        // take them off again. It has the shape of spatial's `#map`, which this
        // component used to borrow, filling its box, so the deployment's
        // stylesheets meet what they met before. Not the id: there can be two.
        const element = document.createElement('div');
        element.style.height = '100%';
        element.style.width = '100%';
        containerRef.current?.appendChild(element);

        // Built where the view says and inside the zoom limits from the start,
        // so nothing is animated into place on a map still being assembled. A
        // part the link leaves out is undefined, and `createMap` then takes the
        // setting.
        const map = core.createMap(element, {
          center: view?.center ?? config.center,
          zoom: view?.zoom ?? config.zoom,
          minZoom: config.minZoom,
          maxZoom: config.maxZoom
        });
        mapRef.current = map;

        // The controls render from this component's output, each a component
        // of its own in `controls/`, and go on the map now, before the layers:
        // the credit line has to be on the map when a basemap arrives, or the
        // credits come out in another order. Each adds itself in a layout
        // effect, and on this shell's React 16 a state change in a promise
        // continuation renders and commits before the call returns, so they are
        // all on the map before the next line runs, in the order they render.
        setBuilt({ map, config });

        // Layers take the deployment's ceiling rather than a constant, so a
        // basemap stops where the map does.
        const { basemap, overlays } = await fetchLayers(session, { maxZoom: config.maxZoom });
        if (cancelled) return;

        const base = layerNamed(basemap, view?.basemap) ?? firstOf(basemap);
        if (base) base.addTo(map);

        // The deepest zoom this basemap has a real tile for; `data/tiles.js`
        // carries the figure per provider. Above it Leaflet enlarges the last
        // tile it got, which reads as missing data rather than as the edge of
        // the data -- so the rail marks it. Null where the provider is not one
        // of the known ones, and then there is nothing honest to draw.
        const readNativeMax = layer => setNativeMax(layer?.options?.maxNativeZoom ?? null);
        readNativeMax(base);

        // And again whenever the reader picks another basemap, which is the
        // switcher's `baselayerchange` -- each provider stops at its own depth,
        // so the mark read off the first one is wrong for any other. On this
        // map alone, so it goes when the map does.
        map.on('baselayerchange', event => readNativeMax(event.layer));

        map.invalidateSize();

        // `onReady` before `setLayers`, and the order carries weight on React 16.
        //
        // These two calls sit in a promise continuation rather than in an event
        // handler, and React 16 batches only the latter -- so `setLayers`
        // flushes by itself and mounts the children before a parent listening on
        // `onReady` has re-rendered with anything it learned here. A layer that
        // reads the deployment's geometry SRID off this callback therefore made
        // its first request with the value its parent held at mount, which is
        // none, and a second one the moment the real value landed. The first of
        // those asks a geometry service for a box in the map's own projection,
        // which is the wrong question wherever the two projections differ.
        //
        // Calling the parent first puts its state in place before the children
        // exist. Harmless if React ever batches these: both updates then flush
        // together and the children mount with the parent already correct, which
        // is exactly what this is arranging by hand.
        onReady?.({ map, config, basemap, overlays });
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
      // spatial's `remove`: Leaflet's, with the map's own tools turned off
      // first. Every layer and every control comes off. The controls and
      // layers this component rendered take theirs off as they unmount too, and
      // whichever runs second finds nothing left, which Leaflet lets pass.
      //
      // Then every listener on it, which Leaflet leaves. A removed map is not
      // always let go: Leaflet 1.5 keeps the touch handlers of a drag it has
      // finished as properties of `document`, so a map pressed with the pointer
      // stays reachable from there for as long as the page lives. Without its
      // listeners it holds nothing of this screen, such as the setter the
      // basemap listener above closes over, and with it everything this
      // component rendered.
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
  }, []);

  /**
   * Leaflet measures its container once and caches the result, so a map that
   * mounts while its container has no height renders against nothing: grey
   * tiles, the centre in the wrong place, and clicks landing off-target.
   *
   * That happens whenever the map is not visible at mount — inside a modal
   * before its transition finishes, in a collapsed panel, behind an inactive
   * tab — and again whenever the surrounding layout moves, such as a side menu
   * collapsing beside it.
   *
   * Observing the container covers all of those without the consumer knowing
   * any of it, which matters here: a consumer cannot call invalidateSize itself
   * without importing the engine, and not importing the engine is the one thing
   * this package exists to guarantee.
   */
  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return undefined;

    let frame = null;

    const observer = new ResizeObserver(entries => {
      const box = entries[0]?.contentRect;
      // A hidden container reports zero, and recomputing against zero is the
      // failure being avoided. Wait until it has real dimensions.
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

  /**
   * What the rail marks, which is whatever this component already knows.
   *
   * Only the basemap's ceiling comes from here -- everything else that changes
   * with zoom belongs to a screen rather than to a map, so a screen passes it in
   * through `zoomMarks` and this does not have to learn what a descriptor is.
   */
  const marks = useMemo(() => {
    const own = nativeMax === null
      ? []
      : [{
        from: nativeMax,
        // Everything above the ceiling, not a line at it: the tiles do not stop
        // being enlarged further up, and `lib/zoom` clamps the open end to
        // whatever the range turns out to be.
        to: Number.POSITIVE_INFINITY,
        kind: 'upscaled',
        label: zoomLabels?.upscaled ?? ZOOM_LABELS.upscaled
      }];

    return [...own, ...(zoomMarks ?? [])];
  }, [nativeMax, zoomMarks, zoomLabels]);

  if (failure) {
    return (
      <div className={`${className} atlas-map-error`} role="alert">
        {failure.message}
      </div>
    );
  }

  const config = built?.config;

  // Everything below reads the map from the context rather than naming the
  // engine's, so a control or a layer serves whichever map it is put on.
  //
  // The controls in the order each corner shows them: Leaflet fills a top
  // corner in arrival order, so the locate and measure buttons sit under the
  // fullscreen button, and a bottom corner in reverse -- `insertBefore
  // (firstChild)` -- so the zoom, added after the credit line, sits above it,
  // and the credit keeps the map edge.
  return (
    <AtlasMapContext.Provider value={built?.map ?? null}>
      <div ref={containerRef} className={className} style={{ height: '100%', ...style }} />
      {built && (
        <>
          {fullscreen && <FullscreenControl position={fullscreenPosition} />}
          {locate && <LocateControl position={locatePosition} />}
          <AttributionControl credit={config.attribution} />
          {/* Anything truthy that is not the rail keeps the buttons, rather
              than `=== true`: a menu row is JSON written by hand, and a screen
              that has been saying `"zoomControl": 1` for a year should not lose
              its zoom to a new spelling arriving beside it. */}
          {zoomControl && zoomControl !== 'rail' && (
            <ZoomBar position={zoomPosition} fit={fit} extent={extent} labels={zoomLabels} />
          )}
          {scale && <ScaleControl position={scalePosition} units={config.units} ratio={scaleRatio} />}
          {coordinates && <CoordinatesControl position={coordinatesPosition} />}
          {measure && <MeasureControl position={measurePosition} tools={measureTools} />}
        </>
      )}
      {ready && layerSwitcher && <LayerSwitcher basemap={layers.basemap} overlays={layers.overlays} />}
      {/* Once the basemaps are in, because it marks where the first one stops
          sharpening. */}
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
