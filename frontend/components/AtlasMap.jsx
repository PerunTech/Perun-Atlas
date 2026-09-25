import { React } from 'perun-core';
import { core, data, ui } from '../spatial';
import { applyToEngine, resolve } from '../bootstrap';
import { fetchLayers, firstOf } from '../data';
import { svgMarkup } from '../lib/icons';
import { FIT_PADDING, formatRatio, ratioFor } from '../lib/zoom';
import { ZoomRail, ZOOM_LABELS } from './ZoomRail';
import '../style/controls.css';

const { Map, control, factory } = core;
const { layerControl } = data;
const { useEffect, useMemo, useRef, useState } = React;

/**
 * How wide the scale bar is allowed to be, and therefore the span the ratio
 * beside it is measured across.
 *
 * One number for both on purpose: the bar and the ratio are two readings of the
 * same measurement, and taking them across different spans is how they come to
 * disagree by a rounding.
 */
const SCALE_WIDTH = 140;

/**
 * A map, mounted into whatever container this component renders.
 *
 * Consumers embed this and add layers through the children render prop; nothing
 * outside perun-atlas should need to touch spatial's `Map` or `factory`.
 *
 * Controls: spatial's map is built with its own zoom and attribution controls
 * switched off, because its toolbar supplies them and this component does not
 * mount that toolbar. Both are added here instead — zoom on by default, in the
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
 * The zoom control also carries a button that frames the data again, once a
 * layer has said where the data is: `extent`, as `[[south, west], [north,
 * east]]`, which `FeatureSet` reports and `FeaturePanel` passes on. It lives in
 * the zoom control rather than in a corner of its own because it is a zoom --
 * to a place rather than by a step -- and because a button of its own would
 * have to line up with a bar it knows nothing about. The plain bar gets it on
 * top of the `+`; the rail gets it in the same place. `fit: false` turns it off,
 * and a map with no zoom control has none, since it has nowhere to sit.
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
  zoomPosition = 'bottomright',
  zoomMarks,
  zoomLabels,
  fit = true,
  extent = null,
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
  const switcherRef = useRef(null);
  const zoomRef = useRef(null);
  const coordinatesRef = useRef(null);
  const measureRef = useRef(null);
  const fullscreenRef = useRef(null);
  const locateRef = useRef(null);
  const scaleRef = useRef(null);
  const attributionRef = useRef(null);
  const adoptedStyleRef = useRef(null);
  // Not a control, so it is not in the list that gets `remove()`d: the ratio is
  // a line inside the scale bar's own container, and what has to be undone is
  // the listener keeping it current.
  const ratioOffRef = useRef(null);
  // The same, for the listener that moves the rail's tile ceiling when the
  // reader picks another basemap.
  const baseOffRef = useRef(null);
  // The fit button in the plain zoom bar. Not a control either: it sits inside
  // the zoom control's container and goes when that does.
  const fitButtonRef = useRef(null);
  // The frame as of this render, for a button that was built once, in an
  // effect, and is clicked long after.
  const extentRef = useRef(extent);
  extentRef.current = extent;
  const [ready, setReady] = useState(false);
  const [failure, setFailure] = useState(null);
  const [nativeMax, setNativeMax] = useState(null);

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

        // Worth more here than on a full-page screen, because this map is
        // usually inside a modal: a panel sized for a record is not sized for
        // reading a country. `leaflet.fullscreen` is one of spatial's own
        // dependencies and its Factory imports it, so this is a control the
        // engine already carries rather than a new one.
        //
        // `content` is the plugin's own option for supplying the button's
        // contents, and passing it drops the `fullscreen-icon` class the sprite
        // is keyed to -- so spatial's `fullscreen-control.css`, which exists to
        // stop that two-frame image showing both frames at once, goes quiet
        // rather than fighting this. Both glyphs are put in and one is shown:
        // the plugin toggles `leaflet-fullscreen-on` and never touches the
        // contents again, which is exactly what the sprite's two frames were
        // doing, done with CSS that can say which is which.
        if (fullscreen && factory.control.fullscreen) {
          fullscreenRef.current = factory.control.fullscreen({
            position: fullscreenPosition,
            content: svgMarkup('maximize') + svgMarkup('minimize')
          }).addTo(Map);
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

        // spatial builds its map with `zoomControl: false` and
        // `attributionControl: false`, because its own toolbar carries a
        // NavigationControl and that toolbar is part of the app chrome this
        // component deliberately does not mount -- it adopts the bare container
        // instead. So a screen embedding a map this way had no way to zoom
        // without a wheel or a trackpad, and no way to display a credit.
        //
        // `prefix: false` drops Leaflet's own 'Leaflet' link: this is where a
        // deployment's credit and a tile provider's terms are satisfied, not an
        // advertisement for the mapping library.
        //
        // Added before the layers, so the attribution control is listening when
        // they arrive and picks up whatever credit each one carries.
        attributionRef.current = factory.control.attribution({ prefix: false }).addTo(Map);
        if (config.attribution) attributionRef.current.addAttribution(config.attribution);

        // After the attribution rather than before it, which is the whole of
        // what puts the zoom above the credit line: Leaflet fills a bottom
        // corner in reverse arrival order -- `insertBefore(firstChild)` -- so in
        // a bottom corner the last control added is the top one on screen, and
        // a credit that is not against the map edge does not read as a credit.
        //
        // The rail is not built here. It is a React control and it mounts
        // itself, from this component's own output, once the map is ready.
        // Anything truthy that is not the rail keeps the buttons, rather than
        // `=== true`: a menu row is JSON written by hand, and a screen that has
        // been saying `"zoomControl": 1` for a year should not lose its zoom to
        // a new spelling arriving beside it.
        //
        // Leaflet's own `zoomInText`/`zoomOutText` rather than reaching into the
        // control's DOM afterwards: they are the supported way to say what a
        // zoom button holds, and they leave every behaviour that makes this
        // control worth keeping -- the disabled state at each end of the range,
        // shift-click for three levels, the titles -- untouched.
        if (zoomControl && zoomControl !== 'rail') {
          zoomRef.current = factory.control.zoom({
            position: zoomPosition,
            zoomInText: svgMarkup('plus'),
            zoomOutText: svgMarkup('minus')
          }).addTo(Map);

          // A third button in the same bar, above the `+`. Put into the zoom
          // control's own container, like the ratio line below goes into the
          // scale's: it then shares the bar's column, its look and its
          // lifetime, and there is nothing to keep aligned by hand.
          //
          // Built the way Leaflet builds the two beside it -- an anchor with a
          // `#` href and the role of a button -- rather than as a `button`. That
          // is not a taste. spatial's `navigation.css` makes every `button` in
          // the bottom-right corner absolute, padded and round, for navigation
          // buttons of its own; an anchor is what that rule leaves alone, and
          // what `.leaflet-bar a` already draws exactly like the `+` and `-`,
          // hover and touch sizes included, on every engine this has run on.
          //
          // The glyph goes in as markup for the reason `lib/icons.js` gives,
          // and the words as attributes, never as markup. Hidden, not absent,
          // while there is no frame to go back to; see the effect that follows
          // the extent.
          if (fit) {
            const words = zoomLabels?.fit ?? ZOOM_LABELS.fit;
            const bar = zoomRef.current.getContainer();
            const link = factory.DomUtil.create('a', 'atlas-fit');

            link.href = '#';
            link.title = words;
            link.setAttribute('role', 'button');
            link.setAttribute('aria-label', words);
            link.innerHTML = svgMarkup('zoom-scan');
            link.style.display = extentRef.current ? '' : 'none';

            factory.DomEvent.disableClickPropagation(link);
            factory.DomEvent.on(link, 'click', factory.DomEvent.stop);
            factory.DomEvent.on(link, 'click', () => {
              if (extentRef.current) Map.fitBounds(extentRef.current, { padding: FIT_PADDING });
            });

            bar.insertBefore(link, bar.firstChild);
            fitButtonRef.current = link;
          }
        }

        // Leaflet's own distance bar rather than spatial's `ScaleControl`, which
        // is a 1:N ratio dropdown reading `crs.options.distances` -- a CRS built
        // from a bare EPSG code carries none, so on most deployments it mounts
        // and renders nothing. The units are the deployment's own, from the
        // setting that already answers this question everywhere else.
        if (scale) {
          const metric = config.units !== 'imperial';
          scaleRef.current = factory.control
            .scale({ position: scalePosition, metric, imperial: !metric, maxWidth: SCALE_WIDTH })
            .addTo(Map);
        }

        // The same measurement as a ratio, on the same bar.
        //
        // A bar answers "how far is that" and a ratio answers "what is this map,
        // compared to the ones I already know" -- which is the question a reader
        // arriving from a paper sheet or a cadastral plan actually has, and the
        // one a zoom level cannot answer at all, since z14 is a different map at
        // every latitude.
        //
        // Measured rather than derived from the zoom: this package supports
        // deployments whose map is not on the Web Mercator grid, and the closed
        // form everyone quotes for metres-per-pixel is only true on that one. A
        // ground distance across a known span of pixels is true on all of them,
        // and it is how Leaflet's own scale bar does it.
        //
        // Written into the scale control's own container rather than added as a
        // second control beside it, so it travels with the bar it restates --
        // same corner, same margin, same lifetime -- instead of being a second
        // thing in the corner that has to be kept next to the first.
        if (scale && scaleRatio && scaleRef.current) {
          const line = factory.DomUtil.create(
            'div', 'atlas-scale-ratio', scaleRef.current.getContainer()
          );

          const writeRatio = () => {
            const size = Map.getSize();
            const y = Math.round(size.y / 2);
            const span = Math.min(size.x, SCALE_WIDTH);
            const metres = Map.distance(
              Map.containerPointToLatLng(factory.point(0, y)),
              Map.containerPointToLatLng(factory.point(span, y))
            );
            line.textContent = formatRatio(ratioFor(metres, span)) ?? '';
          };

          // `move` rather than `moveend`: on a Mercator map the ground distance
          // a pixel covers changes as the reader pans north, so a ratio that
          // only caught the end of a drag would be wrong for the whole of it.
          Map.on('move zoomend', writeRatio);
          writeRatio();
          ratioOffRef.current = () => Map.off('move zoomend', writeRatio);
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
        // configuration. Added last of the three that share the top left, so
        // that Leaflet -- which fills a top corner in arrival order -- puts it
        // under the fullscreen and locate buttons rather than over them.
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

        // The deepest zoom this basemap has a real tile for; `data/layers.js`
        // carries the figure per provider. Above it Leaflet enlarges the last
        // tile it got, which reads as missing data rather than as the edge of
        // the data -- so the rail marks it. Null where the provider is not one
        // of the known ones, and then there is nothing honest to draw.
        const readNativeMax = layer => setNativeMax(layer?.options?.maxNativeZoom ?? null);
        readNativeMax(base);

        // And again whenever the reader picks another basemap, which is the
        // switcher's `baselayerchange` -- each provider stops at its own depth,
        // so the mark read off the first one is wrong for any other.
        const onBaseChange = event => readNativeMax(event.layer);
        Map.on('baselayerchange', onBaseChange);
        baseOffRef.current = () => Map.off('baselayerchange', onBaseChange);

        // Built here rather than through spatial's app builder, which adds the
        // control and keeps no reference to it. A control is not a layer, so
        // nothing else takes it off again, and the map outlives this component.
        if (layerSwitcher) {
          switcherRef.current = layerControl(basemap, overlays, { collapsed: true }).addTo(Map);
        }

        Map.invalidateSize();

        // `onReady` before `setReady`, and the order carries weight on React 16.
        //
        // These two calls sit in a promise continuation rather than in an event
        // handler, and React 16 batches only the latter -- so `setReady(true)`
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
        onReady?.({ map: Map, config, basemap, overlays });
        setReady(true);
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
      // `leaflet.fullscreen` subscribes `_toggleState` to the map in `onAdd` and
      // its `onRemove` does not take it off again, so `Control.remove` nulls the
      // control's `_map` and leaves a handler on the map still reading it. The
      // map is the engine's page-lifetime singleton, so that is one dead handler
      // per mount, and the next exit from fullscreen -- which the live control
      // fires at every subscriber -- throws on the first of them:
      //
      //     Cannot read properties of null (reading '_isFullscreen')
      //
      // The engine now patches this in its own Factory, and `off` on a handler
      // that is already gone is a no-op, so this is here for the deployments
      // where the two bundles are not the same age. Before `remove`, which is
      // what puts the control out of reach of its own map.
      if (fullscreenRef.current?._toggleState) {
        Map.off('enterFullscreen exitFullscreen',
          fullscreenRef.current._toggleState, fullscreenRef.current);
      }
      // Controls are not layers, so `clearLayers` never sees them and the map
      // outlives this component. Each one that was added has to come off.
      [switcherRef, zoomRef, coordinatesRef, measureRef,
       fullscreenRef, locateRef, scaleRef, attributionRef].forEach(ref => {
        if (ref.current) {
          ref.current.remove();
          ref.current = null;
        }
      });
      // The ratio line goes with the scale control that holds it; the listener
      // that keeps it current does not, and a map handler left behind on a map
      // that outlives this component is a leak by any other name.
      ratioOffRef.current?.();
      ratioOffRef.current = null;
      baseOffRef.current?.();
      baseOffRef.current = null;
      // Gone with the zoom control that held it; only the handle is left.
      fitButtonRef.current = null;
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

  // The plain bar's fit button, shown while there is somewhere to go back to.
  // Inline, because `.leaflet-bar a` and this package's own centring rule both
  // set `display`, and either would otherwise keep a dead button on screen.
  useEffect(() => {
    if (fitButtonRef.current) fitButtonRef.current.style.display = extent ? '' : 'none';
  }, [extent]);

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

  return (
    <>
      <div ref={containerRef} className={className} style={{ height: '100%', ...style }} />
      {/* Rendered rather than built in the effect above, because everything it
          draws changes -- the level on every zoom, the marks when the basemap
          arrives -- and a control built once in an effect closes over the
          values it was built with. It mounts itself into the map's corner from
          here; see ZoomRail. */}
      {ready && zoomControl === 'rail' && (
        <ZoomRail
          position={zoomPosition}
          marks={marks}
          labels={zoomLabels}
          onFit={fit && extent ? () => Map.fitBounds(extent, { padding: FIT_PADDING }) : undefined}
        />
      )}
      {ready && children}
    </>
  );
};
