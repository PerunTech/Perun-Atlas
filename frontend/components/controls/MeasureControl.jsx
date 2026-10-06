import { React, PropTypes, elements } from 'perun-core';
import { config, core, tools as engineTools } from '../../spatial';
import { readingFor } from '../../lib/controls';
import { useAtlasMap } from '../context';
import { MapControl, Skipped } from './host';
import { label } from './messages';
import '../../style/measure-control.css';

const { MEASURE_AREA, MEASURE_RADIUS, MEAUSURE_LENGTH } = config;
const { factory } = core;
const { measure } = engineTools;
const { useCallback, useEffect, useMemo, useRef, useState } = React;

/**
 * Tabler, through perun-core, rather than the engine's own icon registry.
 *
 * The registry's measurement glyphs are filled artwork on three different
 * viewBoxes -- 512, 446.568 and 502.317 -- which is why the toolbar that uses
 * them sets a different pixel size on each of its five buttons. That is
 * survivable when the buttons are spread across a toolbar and wrong here, where
 * they sit edge to edge and have to read as one instrument. Tabler is one
 * 24x24 grid at one stroke weight.
 *
 * It costs no bundle weight: perun-core already ships `@tabler/icons-react` as
 * its own lazy chunk and commits it, so the icons arrive with the shell.
 *
 * What it does cost is certainty. This `Icon` resolves its component through a
 * dynamic import and renders nothing until the chunk arrives -- and nothing at
 * all if it never does. Every button below therefore carries a one-character
 * fallback beside the icon, shown only when it is the button's sole child. See
 * `GLYPH` and the `:only-child` rule in measure-control.css.
 */
const { Icon } = elements;

/** Shown only if the icon chunk never arrives, so a button is never blank. */
const GLYPH = {
  measure: 'M', length: 'L', area: 'A', radius: 'R', angle: '∠', erase: '⌫'
};

/** Rendered the same way everywhere: icon, then the fallback it hides. */
const Glyph = ({ icon, mark }) => (
  <>
    <Icon name={icon} size={18} stroke={1.75} aria-hidden='true' />
    <span className='measure-control__fallback' aria-hidden='true'>{mark}</span>
  </>
);

Glyph.propTypes = { icon: PropTypes.string.isRequired, mark: PropTypes.string };

/**
 * What each tool draws with. Whether a running total means anything is
 * `readingFor`'s to say, in `lib/controls.js`.
 */
const TOOLS = {
  length: { shape: 'line',    options: MEAUSURE_LENGTH, icon: 'IconRuler2',    fallback: 'Length' },
  area:   { shape: 'polygon', options: MEASURE_AREA,    icon: 'IconPolygon',   fallback: 'Area' },
  radius: { shape: 'circle',  options: MEASURE_RADIUS,  icon: 'IconCircleDot', fallback: 'Radius' },
  angle:  { shape: 'line',    options: MEAUSURE_LENGTH, icon: 'IconAngle',     fallback: 'Angle' }
};

/**
 * Measuring, on every map.
 *
 * The questions this answers are the ones no service is going to: how far is
 * this from that, how big is this piece of ground, what is the bearing along
 * that boundary. They are asked of whatever happens to be on screen, which is
 * why the tool belongs to the map rather than to any screen's configuration.
 *
 * Three faults in the engine's older measurement toolbar are avoided here, and
 * each is a consequence of where the state lives:
 *
 *   - measurements are held in a layer group created by this component and
 *     removed when it unmounts, not one created when a module is imported, so
 *     one screen's measurements are not carried onto the next screen's map;
 *   - the `new_shape` listener is removed by reference. `off('new_shape')` with
 *     no handler removes every listener on that event, including ones
 *     belonging to whatever else is drawing;
 *   - totals are summed in metres and square metres and formatted only for
 *     display, so an `imperial` deployment sums correctly.
 *
 * It draws with the map's own tools, `map.draw`, on an engine that gives each
 * map a set, and with the engine's shared `tools.draw` on one that does not --
 * on the page's map those are the same set.
 *
 * Ported from spatial's `ui.MeasureControl`, which is frozen, with the same
 * markup, classes and label codes. It reads its map from `AtlasMap`.
 *
 * @param {string} [position] - The corner it sits in.
 * @param {Array} [tools] - Which of `length`, `area`, `radius`, `angle` to
 *        offer, in order. A screen with no use for a protractor can say so.
 * @param {boolean} [expanded] - Open at mount rather than collapsed to one button.
 */
export const MeasureControl = ({ position = 'topleft', tools, expanded }) =>
  (typeof measure?.anglesAlong === 'function' && engineTools.draw
    ? <MapControl position={position}><Measure tools={tools} expanded={expanded} /></MapControl>
    : <Skipped what='measurement control' />);

MeasureControl.propTypes = {
  position: PropTypes.string,
  tools: PropTypes.array,
  expanded: PropTypes.bool
};

const Measure = ({ tools = ['length', 'area', 'radius', 'angle'], expanded = false }) => {
  const map = useAtlasMap();
  const draw = useMemo(() => map.draw ?? engineTools.draw, [map]);
  const [open, setOpen] = useState(expanded);
  const [tool, setTool] = useState(null);
  const [lines, setLines] = useState([]);

  const offered = useMemo(() => tools.filter(name => TOOLS[name]), [tools]);

  /* Created here, not at module scope: this group belongs to the mounted
     control, and taking it off the map on unmount is what stops one screen's
     measurements appearing on the next one's map. */
  const groupRef = useRef(null);
  useEffect(() => {
    const group = factory.layerGroup().addTo(map);
    groupRef.current = group;

    return () => {
      group.clearLayers();
      map.removeLayer(group);
      groupRef.current = null;
    };
  }, [map]);

  /* Running sums, in base units. A ref rather than state because they are read
     inside the map's event handler and every write is followed by a setLines
     that renders anyway. */
  const totals = useRef({ length: 0, area: 0 });

  /** The shape handler for the tool that is on, or nothing. */
  const active = tool ? TOOLS[tool] : null;

  const stop = useCallback(() => {
    Object.values(TOOLS).forEach(({ shape }) => draw[shape]?.disable('force'));
    setTool(null);
  }, [draw]);

  /* Bound once per active tool and removed by reference. The handler has to
     know which tool drew the shape, and the map does not carry that. */
  useEffect(() => {
    if (!active) return undefined;

    const finished = (event) => {
      const layer = event?.layer;
      if (!layer) return;

      groupRef.current?.addLayer(layer);

      const reading = readingFor(tool, layer, totals.current, measure);
      if (reading) setLines(previous => [{ tool, reading, at: Date.now() }, ...previous].slice(0, 3));

      /* Whether the tool is still armed is read back from the engine
         rather than assumed, because the shapes disagree about it:
         `draw.line` and `draw.polygon` carry `repeatable` and re-enable
         themselves inside the `disable()` that precedes this event, and
         `draw.circle` has no such branch and simply stops. Assuming
         either would leave one of them lit with nothing behind it. */
      if (!draw[TOOLS[tool].shape]?.isEnabled?.()) setTool(null);
    };

    map.on('new_shape', finished);
    return () => map.off('new_shape', finished);
  }, [active, tool, map, draw]);

  /* A tool left armed when the control unmounts leaves the map in drawing
     mode, which the next screen inherits. */
  useEffect(() => stop, [stop]);

  const choose = (name) => {
    if (tool === name) { stop(); return; }

    stop();
    setTool(name);
    draw[TOOLS[name].shape]?.enable(TOOLS[name].options);
  };

  const clear = () => {
    stop();
    groupRef.current?.clearLayers();
    totals.current = { length: 0, area: 0 };
    setLines([]);
  };

  if (!offered.length) return null;

  if (!open) {
    return (
      <div className='measure-control measure-control--closed'>
        {/* `leaflet-bar` is the look, shared with the zoom and
            fullscreen buttons this stacks under. */}
        <div className='leaflet-bar'>
          <button
            type='button'
            className='measure-control__toggle'
            onClick={() => setOpen(true)}
            title={label('measure', 'Measure')}
            aria-label={label('measure', 'Measure')}
            aria-expanded='false'
          >
            <Glyph icon='IconRulerMeasure' mark={GLYPH.measure} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='measure-control'>
      {/* A bar like the zoom control's, laid out across rather than down. */}
      <div className='measure-control__tools leaflet-bar' role='group' aria-label={label('measure', 'Measure')}>
        {offered.map(name => (
          <button
            key={name}
            type='button'
            className={`measure-control__tool${tool === name ? ' is-active' : ''}`}
            onClick={() => choose(name)}
            title={label(name, TOOLS[name].fallback)}
            aria-label={label(name, TOOLS[name].fallback)}
            aria-pressed={tool === name}
          >
            <Glyph icon={TOOLS[name].icon} mark={GLYPH[name]} />
          </button>
        ))}

        <span className='measure-control__divider' aria-hidden='true' />

        <button
          type='button'
          className='measure-control__tool'
          onClick={clear}
          title={label('erase', 'Clear')}
          aria-label={label('erase', 'Clear')}
        >
          <Glyph icon='IconEraser' mark={GLYPH.erase} />
        </button>

        <button
          type='button'
          className='measure-control__tool measure-control__close'
          onClick={() => { clear(); setOpen(false); }}
          title={label('cancel', 'Close')}
          aria-label={label('cancel', 'Close')}
          aria-expanded='true'
        >
          &times;
        </button>
      </div>

      {lines.length > 0 && (
        <dl className='measure-control__readout' aria-live='polite'>
          {lines.map(({ tool: name, reading, at }) => (
            <div className='measure-control__line' key={at}>
              <dt>{label(name, TOOLS[name].fallback)}</dt>
              <dd>{reading}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
};

Measure.propTypes = {
  tools: PropTypes.array,
  expanded: PropTypes.bool
};
