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

// Tabler rather than the engine's icons, which sit on three different viewBoxes. The icons load lazily
// and may never arrive, so each button carries a one-character fallback shown by `:only-child`.
const { Icon } = elements;

const GLYPH = {
  measure: 'M', length: 'L', area: 'A', radius: 'R', angle: '∠', erase: '⌫'
};

const Glyph = ({ icon, mark }) => (
  <>
    <Icon name={icon} size={18} stroke={1.75} aria-hidden='true' />
    <span className='measure-control__fallback' aria-hidden='true'>{mark}</span>
  </>
);

Glyph.propTypes = { icon: PropTypes.string.isRequired, mark: PropTypes.string };

const TOOLS = {
  length: { shape: 'line',    options: MEAUSURE_LENGTH, icon: 'IconRuler2',    fallback: 'Length' },
  area:   { shape: 'polygon', options: MEASURE_AREA,    icon: 'IconPolygon',   fallback: 'Area' },
  radius: { shape: 'circle',  options: MEASURE_RADIUS,  icon: 'IconCircleDot', fallback: 'Radius' },
  angle:  { shape: 'line',    options: MEAUSURE_LENGTH, icon: 'IconAngle',     fallback: 'Angle' }
};

// Measurements live in a group this component owns and removes on unmount, `new_shape` is unbound by
// reference, and totals are summed in base units. Ported from spatial's frozen `ui.MeasureControl`.
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

  // Owned by the mounted control, so one screen's measurements don't appear on the next one's map.
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

  // A ref: read inside the map's handler, and every write is followed by a render anyway.
  const totals = useRef({ length: 0, area: 0 });

  const active = tool ? TOOLS[tool] : null;

  const stop = useCallback(() => {
    Object.values(TOOLS).forEach(({ shape }) => draw[shape]?.disable('force'));
    setTool(null);
  }, [draw]);

  // Bound per tool: the handler has to know which tool drew the shape.
  useEffect(() => {
    if (!active) return undefined;

    const finished = (event) => {
      const layer = event?.layer;
      if (!layer) return;

      groupRef.current?.addLayer(layer);

      const reading = readingFor(tool, layer, totals.current, measure);
      if (reading) setLines(previous => [{ tool, reading, at: Date.now() }, ...previous].slice(0, 3));

      // Read back from the engine: line and polygon re-arm themselves, circle does not.
      if (!draw[TOOLS[tool].shape]?.isEnabled?.()) setTool(null);
    };

    map.on('new_shape', finished);
    return () => map.off('new_shape', finished);
  }, [active, tool, map, draw]);

  // A tool left armed would leave the next screen's map in drawing mode.
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
