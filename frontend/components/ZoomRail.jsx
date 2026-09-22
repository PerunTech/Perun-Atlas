import { React, ReactDOM, PropTypes } from 'perun-core';
import { core } from '../spatial';
import { GLYPHS, ICON_SIZE, ICON_STROKE } from '../lib/icons';
import { marksIn, rungs } from '../lib/zoom';
import '../style/zoom.css';

const { Map, control, factory } = core;
const { useEffect, useMemo, useState } = React;

/**
 * The zoom control as a ladder rather than a pair of buttons.
 *
 * Two buttons say which way; they do not say where you are, how much further
 * there is to go, or that anything happens on the way. This map has three
 * answers to that last question and none of them was visible anywhere:
 *
 *   - A basemap stops serving real tiles somewhere below the deployment's
 *     ceiling -- `data/layers.js` knows where, per provider -- and past it
 *     Leaflet enlarges the last tile it got. The reader sees blur and reads it
 *     as missing data.
 *   - A descriptor's labels are banded by zoom (`appearance/labelVisible`), so
 *     names appear and vanish at a level nobody can guess.
 *   - A choropleth refetches when the zoom changes.
 *
 * Marks put those on the rail, which is the only reason to build one: a slider
 * that does what `+` and `-` already do is chrome, and a slider that says where
 * the map changes behaviour is an instrument. Anything this package can work out
 * for itself is passed in by `AtlasMap`; a screen adds its own through
 * `zoomMarks`.
 *
 * Mounted as a Leaflet control for the reasons `LegendControl` sets out -- it
 * travels into fullscreen with the map, and the corner owns its placement --
 * and by the same means: `control()` renders its props once at `onAdd`, so the
 * control is handed a bare container and React keeps the tree inside it through
 * a portal. Here that is not a nicety. Everything this draws changes on every
 * zoom.
 *
 * @param {string} [position] - Any corner spatial's `control` accepts. Defaults
 *        to the bottom right, above the attribution: Leaflet stacks a bottom
 *        corner in reverse arrival order, so a control added after the credit
 *        line sits on top of it and the credit keeps the map edge.
 * @param {Array} [marks] - `[{ from, to, kind, label }]`, as `lib/zoom` reads
 *        them. `kind` becomes a class, so a deployment styles a threshold by
 *        what it means.
 * @param {Object} [labels] - The control's own copy. Any key left out falls back
 *        to neutral English, so an unresolved label code is never shown.
 */

/** Neutral English, for a caller that resolves no copy of its own. */
export const ZOOM_LABELS = {
  in: 'Zoom in',
  out: 'Zoom out',
  level: 'Zoom level',
  upscaled: 'Above here the basemap is enlarged, not sharper'
};

/**
 * Unique enough for `aria-describedby`, and stable across a re-render.
 *
 * Only one map can be mounted at a time, so a counter is more than this needs --
 * but an id that collides is an id that points a screen reader at the wrong
 * control, and a counter costs a line.
 */
let instances = 0;

const percent = (fraction) => `${(fraction * 100).toFixed(4)}%`;

/**
 * A control glyph, as JSX.
 *
 * The same preset `lib/icons.js` serialises for the two Leaflet controls, said
 * again here because a React tree cannot take a string of markup. The paths, the
 * size and the stroke come from there, so the two renderings cannot disagree
 * about the part that could change; the rest is Tabler's outline preset, which
 * is the same for every icon in the set.
 */
const Glyph = ({ name }) => (
  <svg
    className={`atlas-icon atlas-icon--${name}`}
    width={ICON_SIZE}
    height={ICON_SIZE}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={ICON_STROKE}
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'
    focusable='false'
  >
    {GLYPHS[name].map(d => <path key={d} d={d} />)}
  </svg>
);

Glyph.propTypes = { name: PropTypes.oneOf(Object.keys(GLYPHS)).isRequired };

export const ZoomRail = ({ position = 'bottomright', marks = [], labels }) => {
  const copy = { ...ZOOM_LABELS, ...labels };

  /**
   * The container the control is handed, made once and kept.
   *
   * Leaflet forwards events from a control's container to the map unless told
   * not to, and on this control that is not cosmetic: a drag on the handle
   * would pan the map underneath it, and a wheel over the rail would zoom twice.
   */
  const [host] = useState(() => {
    const node = factory.DomUtil.create('div', 'atlas-zoom__host');
    factory.DomEvent.disableClickPropagation(node);
    factory.DomEvent.disableScrollPropagation(node);
    return node;
  });

  const [describedBy] = useState(() => {
    instances += 1;
    return `atlas-zoom-marks-${instances}`;
  });

  const [range, setRange] = useState(() => ({ min: Map.getMinZoom(), max: Map.getMaxZoom() }));
  const [zoom, setZoom] = useState(() => Map.getZoom());

  useEffect(() => {
    const readZoom = () => setZoom(Map.getZoom());
    const readRange = () => {
      setRange({ min: Map.getMinZoom(), max: Map.getMaxZoom() });
      readZoom();
    };

    Map.on('zoomend', readZoom);
    // Fired when `setMinZoom`/`setMaxZoom` run and when a layer with its own
    // limits arrives, which is how a basemap narrows the range under us.
    Map.on('zoomlevelschange', readRange);

    // The map is adopted rather than created here, so it may have moved between
    // this state being initialised and the listeners being attached.
    readRange();

    return () => {
      Map.off('zoomend', readZoom);
      Map.off('zoomlevelschange', readRange);
    };
  }, []);

  useEffect(() => {
    // Not a layer, so nothing else takes it off again and the map outlives this
    // component -- the same reason AtlasMap keeps a handle on every control.
    const added = control(host, {}, { position });
    return () => { added.remove(); };
  }, [position, host]);

  const { min, max } = range;
  const ladder = useMemo(() => rungs(min, max), [min, max]);
  const placed = useMemo(() => marksIn(marks, min, max), [marks, min, max]);

  // The reader's level, not the animation's: a fractional zoom mid-flight would
  // otherwise print a number no rung carries.
  const level = Math.round(zoom);
  const described = placed.filter(mark => mark.label).map(mark => mark.label).join('. ');

  return ReactDOM.createPortal(
    <div className='atlas-zoom'>
      <button
        type='button'
        className='atlas-zoom__step'
        onClick={() => Map.zoomIn()}
        disabled={level >= max}
        title={copy.in}
        aria-label={copy.in}
      >
        <Glyph name='plus' />
      </button>

      {/* A range with no room in it gets the buttons alone. That is a real
          configuration -- a deployment can pin SPATIAL_MIN_ZOOM and
          SPATIAL_MAX_ZOOM together -- and a ladder with one rung says nothing
          while still taking the height of one. */}
      {ladder.length > 1 && (
        <div className='atlas-zoom__rail'>
          <div className='atlas-zoom__track' />

          {placed.map(mark => (
            <span
              key={`${mark.kind ?? 'mark'}-${mark.from}-${mark.to}`}
              className={`atlas-zoom__mark atlas-zoom__mark--${mark.kind ?? 'plain'}`}
              style={{ bottom: percent(mark.offset), height: percent(mark.span) }}
              title={mark.label}
            />
          ))}

          {ladder.map(rung => (
            <span
              key={rung.zoom}
              className={[
                'atlas-zoom__rung',
                rung.labelled ? 'atlas-zoom__rung--numbered' : '',
                rung.zoom === level ? 'atlas-zoom__rung--here' : ''
              ].filter(Boolean).join(' ')}
              style={{ bottom: percent(rung.offset) }}
            >
              {rung.labelled ? <i className='atlas-zoom__number'>{rung.zoom}</i> : null}
            </span>
          ))}

          {/* A horizontal slider turned on its side.
              `writing-mode`, `appearance: slider-vertical` and Firefox's `orient`
              are three spellings of a vertical range input and no one of them
              covers every browser these registries are opened in. A rotation is
              one line of CSS that all of them have always had, and it keeps the
              keyboard, the drag and the ARIA that come with the native control
              -- which is the whole reason not to build this out of divs. */}
          <input
            type='range'
            className='atlas-zoom__slider'
            min={min}
            max={max}
            step={1}
            value={Math.min(Math.max(level, min), max)}
            onChange={event => Map.setZoom(Number(event.target.value))}
            aria-label={copy.level}
            aria-describedby={described ? describedBy : undefined}
          />

          {described ? <p className='atlas-zoom__described' id={describedBy}>{described}</p> : null}
        </div>
      )}

      <button
        type='button'
        className='atlas-zoom__step'
        onClick={() => Map.zoomOut()}
        disabled={level <= min}
        title={copy.out}
        aria-label={copy.out}
      >
        <Glyph name='minus' />
      </button>

      <output className='atlas-zoom__level' title={copy.level}>{level}</output>
    </div>,
    host
  );
};

ZoomRail.propTypes = {
  position: PropTypes.string,
  marks: PropTypes.array,
  labels: PropTypes.object
};
