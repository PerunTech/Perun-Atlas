import { React } from 'perun-core';
import { core, data, ui } from '../spatial';
import { applyToEngine, resolve } from '../bootstrap';
import { fetchLayers, firstOf } from '../data';
import '../style/controls.css';

const { Map, control, factory } = core;
const { layerControl } = data;
const { useEffect, useRef, useState } = React;

/**
 * A map, mounted into whatever container this component renders.
 *
 * Consumers embed this and add layers through the children render prop; nothing
 * outside perun-atlas should need to touch spatial's `Map` or `factory`.
 *
 * Controls: spatial's map is built with its own zoom and attribution controls
 * switched off, because its toolbar supplies them and this component does not
 * mount that toolbar. Both are added here instead — zoom on by default and
 * positionable with `zoomControl` / `zoomPosition`, attribution always, since a
 * tile provider's terms are not an option a screen gets to decline, a
 * coordinate readout, on by default and positionable the same way -- it quotes
 * the pointer's position in whichever system the reader picks, which is how a
 * feature is checked against the GPS fields in its own record -- and a
 * measurement control, also on by default, which answers the questions no
 * service is going to: how far, how large, which way. Fullscreen, a scale bar
 * and a locate button are on by default too: the first because this map usually
 * lives in a modal, the second because a distance on screen means nothing
 * without one, and the third because field use on tablets is real.
 *
 * Note on lifecycle: spatial constructs a single Leaflet map when its script
 * evaluates, so this component adopts that instance rather than creating one, and
 * hands it back on unmount. That is the constraint spatial 2.0 lifts — once
 * `createMap` exists, only the body of this effect changes, and no consumer is
 * affected. It also means two AtlasMaps cannot be shown at once, which is fine for
 * an embedded panel and is checked for rather than left to fail obscurely.
 */

let mounted = false;

/**
 * The layers spatial puts on its own map when it builds it: empty groups that
 * its tools draw into. They belong to the engine, not to a screen, and a screen
 * that removes them leaves those tools drawing into nothing.
 *
 * Read here rather than inside the component, because module scope is the one
 * moment that is after spatial's script and before any screen has mounted.
 */
const engineLayers = new Set();
Map.eachLayer(layer => engineLayers.add(layer));

/**
 * Take off everything a screen put on, and leave the engine's own layers.
 *
 * The map is one instance shared with anything else in the page that draws on
 * spatial directly -- a coordinate picker, a legacy screen -- and there is no
 * guarantee the previous tenant removed what it added. So adopt it clean and
 * hand it back clean, and neither side inherits the other's layers.
 */
const clearLayers = () => {
  const added = [];
  Map.eachLayer(layer => { if (!engineLayers.has(layer)) added.push(layer); });
  added.forEach(layer => Map.removeLayer(layer));
};

export const AtlasMap = ({
  session,
  overrides,
  layerSwitcher = false,
  zoomControl = true,
  zoomPosition = 'topleft',
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
  className = 'atlas-map',
  style,
  onReady,
  onError,
  children
}) => {
  const containerRef = useRef(null);
  const switcherRef = useRef(null);
  const zoomRef = useRef(null);
  const coordinatesRef = useRef(null);
  const measureRef = useRef(null);
  const fullscreenRef = useRef(null);
  const locateRef = useRef(null);
  const scaleRef = useRef(null);
  const attributionRef = useRef(null);
  const adoptedStyleRef = useRef(null);
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

        // Push what the deployment declared into the engine before the map is
        // touched, so spatial reads this rather than globals from the page.
        applyToEngine(config);

        // Adopt spatial's container directly rather than calling Map.render(),
        // which reaches for the host's navbar and footer and hides them.
        const element = Map.getContainer();

        // spatial builds that container with an inline `height: 100vh`, so it
        // sizes itself to the window and ignores the box it is put in --
        // overflowing a short panel and leaving a tall one half empty.
        // Deployments have been undoing it per screen with rules like
        // `#holding-map #map { height: 100% !important }`. Take it over while
        // the map is ours, and hand it back exactly as we found it.
        adoptedStyleRef.current = { height: element.style.height, width: element.style.width };
        element.style.height = '100%';
        element.style.width = '100%';

        containerRef.current?.appendChild(element);

        clearLayers();

        Map.setMinZoom(config.minZoom).setMaxZoom(config.maxZoom);
        Map.setView(config.center, config.zoom);

        // spatial builds its map with `zoomControl: false` and
        // `attributionControl: false`, because its own toolbar carries a
        // NavigationControl and that toolbar is part of the app chrome this
        // component deliberately does not mount -- it adopts the bare container
        // instead. So a screen embedding a map this way had no way to zoom
        // without a wheel or a trackpad, and no way to display a credit.
        //
        // Added before the layers, so the attribution control is listening when
        // they arrive and picks up whatever credit each one carries.
        if (zoomControl) {
          zoomRef.current = factory.control.zoom({ position: zoomPosition }).addTo(Map);
        }

        // Worth more here than on a full-page screen, because this map is
        // usually inside a modal: a panel sized for a record is not sized for
        // reading a country. `leaflet.fullscreen` is one of spatial's own
        // dependencies and its Factory imports it, so this is a control the
        // engine already carries rather than a new one.
        if (fullscreen && factory.control.fullscreen) {
          fullscreenRef.current = factory.control.fullscreen({ position: fullscreenPosition }).addTo(Map);
        }

        // Where the reader is. Guarded like the readout and the measure tools --
        // this bundle and the engine deploy separately -- and worth knowing that
        // the browser only answers over https or on localhost, which the control
        // reports rather than failing as a denied permission.
        if (locate && ui.LocateControl) {
          locateRef.current = control(ui.LocateControl, {}, { position: locatePosition });
        } else if (locate) {
          console.warn('perun-atlas: the engine on this environment has no locate control; skipping it.');
        }

        // `prefix: false` drops Leaflet's own 'Leaflet' link: this is where a
        // deployment's credit and a tile provider's terms are satisfied, not an
        // advertisement for the mapping library.
        attributionRef.current = factory.control.attribution({ prefix: false }).addTo(Map);
        if (config.attribution) attributionRef.current.addAttribution(config.attribution);

        // Leaflet's own distance bar rather than spatial's `ScaleControl`, which
        // is a 1:N ratio dropdown reading `crs.options.distances` -- a CRS built
        // from a bare EPSG code carries none, so on most deployments it mounts
        // and renders nothing. The units are the deployment's own, from the
        // setting that already answers this question everywhere else.
        if (scale) {
          const metric = config.units !== 'imperial';
          scaleRef.current = factory.control
            .scale({ position: scalePosition, metric, imperial: !metric, maxWidth: 140 })
            .addTo(Map);
        }

        // Where the pointer is, quoted in a system the reader chooses -- which is
        // not the system the map is projected in, and deliberately so: the map's
        // is the deployment's decision, and changing it invalidates every tile,
        // while changing what a position is quoted in costs one conversion.
        //
        // Mounted through spatial's `control`, which renders a React component
        // into a Leaflet control rather than a factory returning a layer.
        //
        // Checked for rather than assumed: this bundle and the engine are
        // deployed separately, and an environment still serving an older
        // spatial has no such export -- which would otherwise take the whole
        // map down at the moment the control was added.
        if (coordinates && ui.CoordinatesControl) {
          // Centred under the map rather than tucked in a corner: it describes
          // the map instead of acting on it, and it was sharing the bottom left
          // with the scale, which describes it too. `bottomcenter` is spatial's
          // own region and newer than the four corners, so an engine without it
          // has no container to append to and `addTo` would throw -- fall back
          // to the corner this used to occupy.
          const corner = Map._controlCorners?.[coordinatesPosition]
            ? coordinatesPosition
            : 'bottomleft';

          coordinatesRef.current = control(ui.CoordinatesControl, {}, { position: corner });
        } else if (coordinates) {
          console.warn('perun-atlas: the engine on this environment has no coordinate readout; skipping it.');
        }

        // How far is this from that, how big is this piece of ground, what is
        // the bearing along that boundary -- asked of whatever happens to be on
        // screen, which is why it belongs to the map rather than to a screen's
        // configuration. Added after the zoom so that Leaflet, which stacks a
        // corner in the order controls arrive, puts it underneath.
        //
        // Guarded like the readout above, and for the same reason: this bundle
        // and the engine deploy separately, so an environment on an older
        // spatial has no such export and would otherwise take the map down at
        // the moment the control was added.
        if (measure && ui.MeasureControl) {
          measureRef.current = control(
            ui.MeasureControl,
            measureTools ? { tools: measureTools } : {},
            { position: measurePosition }
          );
        } else if (measure) {
          console.warn('perun-atlas: the engine on this environment has no measurement control; skipping it.');
        }

        // Layers take the deployment's ceiling rather than a constant, so a
        // basemap stops where the map does.
        const { basemap, overlays } = await fetchLayers(session, { maxZoom: config.maxZoom });
        if (cancelled) return;

        const base = firstOf(basemap);
        if (base) base.addTo(Map);

        // Built here rather than through spatial's app builder, which adds the
        // control and keeps no reference to it. A control is not a layer, so
        // nothing else takes it off again, and the map outlives this component.
        if (layerSwitcher) {
          switcherRef.current = layerControl(basemap, overlays, { collapsed: true }).addTo(Map);
        }

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
      // Controls are not layers, so `clearLayers` never sees them and the map
      // outlives this component. Each one that was added has to come off.
      [switcherRef, zoomRef, coordinatesRef, measureRef,
       fullscreenRef, locateRef, scaleRef, attributionRef].forEach(ref => {
        if (ref.current) {
          ref.current.remove();
          ref.current = null;
        }
      });
      clearLayers();
      const element = Map.getContainer();
      if (element && adoptedStyleRef.current) {
        element.style.height = adoptedStyleRef.current.height;
        element.style.width = adoptedStyleRef.current.width;
        adoptedStyleRef.current = null;
      }
      if (element?.parentNode) element.parentNode.removeChild(element);
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
        Map.invalidateSize();
      });
    });

    observer.observe(node);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [ready]);

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
