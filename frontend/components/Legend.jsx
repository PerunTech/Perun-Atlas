import { React, PropTypes } from 'perun-core';
import { legendShown } from '../appearance/legend';
import { applyStyle } from '../lib/dom';
import '../style/legend.css';

const { useEffect, useRef, useState } = React;

/**
 * A point's swatch, drawn the way the marker is.
 *
 * `marker.style` is arbitrary CSS declarations -- that is how a screen described
 * entirely in a menu row carries its look -- so it is applied to the element
 * rather than translated into props. The size is overridden afterwards: a
 * descriptor may ask for a 30px marker, which is right on a map and three times
 * the height of a legend row.
 */
const PointSwatch = ({ marker }) => {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    applyStyle(node, marker?.style);
    node.style.width = '12px';
    node.style.height = '12px';
  }, [marker]);

  return (
    <span
      ref={ref}
      className={['atlas-legend__point', marker?.className].filter(Boolean).join(' ')}
      aria-hidden='true'
    />
  );
};

PointSwatch.propTypes = { marker: PropTypes.object };

/**
 * A line's swatch, including its dashes and its direction.
 *
 * Drawn rather than filled, because a dashed line and a solid one are different
 * kinds of feature and a legend that shows both as a block says they are not.
 * The arrow is drawn when the descriptor has one, at the end the map would put
 * it -- `reverse` points a movement back at the record the screen is about, and
 * a key that omitted that would be describing a different map.
 */
const LineSwatch = ({ path, arrow }) => {
  const colour = path?.color ?? '#4A5C66';
  const dash = Array.isArray(path?.dashArray) ? path.dashArray.join(' ') : path?.dashArray;
  const head = arrow?.reverse ? '3,6 9,3 9,9' : '21,6 15,3 15,9';

  return (
    <svg className='atlas-legend__swatch' width='24' height='12' viewBox='0 0 24 12' aria-hidden='true'>
      <line
        x1='2' y1='6' x2='22' y2='6'
        stroke={colour}
        strokeWidth={Math.min(path?.weight ?? 1, 4)}
        strokeDasharray={dash || undefined}
        strokeOpacity={path?.opacity ?? 1}
        strokeLinecap='round'
      />
      {arrow && <polygon points={head} fill={colour} fillOpacity={path?.opacity ?? 1} />}
    </svg>
  );
};

LineSwatch.propTypes = { path: PropTypes.object, arrow: PropTypes.object };

/** An area's swatch: its fill at its own opacity, inside its own border. */
const AreaSwatch = ({ path }) => (
  <svg className='atlas-legend__swatch' width='24' height='12' viewBox='0 0 24 12' aria-hidden='true'>
    <rect
      x='4' y='1' width='16' height='10'
      fill={path?.fillColor ?? '#B8C6CC'}
      fillOpacity={path?.fillOpacity ?? 0.55}
      stroke={path?.color ?? '#4A5C66'}
      strokeWidth={Math.min(path?.weight ?? 1, 2)}
      strokeOpacity={path?.opacity ?? 1}
    />
  </svg>
);

AreaSwatch.propTypes = { path: PropTypes.object };

const Swatch = ({ entry }) => {
  if (entry.kind === 'point') return <PointSwatch marker={entry.marker} />;
  if (entry.kind === 'line') return <LineSwatch path={entry.path} arrow={entry.arrow} />;
  return <AreaSwatch path={entry.path} />;
};

Swatch.propTypes = { entry: PropTypes.object.isRequired };

/**
 * What the colours on this map mean.
 *
 * Takes entries already shaped and already labelled -- see `appearance/legend.js`,
 * which builds them from what was drawn rather than from what was configured.
 * This renders them and knows nothing about descriptors, palettes or geometry.
 *
 * Hidden below two entries, deliberately. One kind of thing on a map needs no
 * key, and a box saying so is a box over the map for no reason. The exception
 * is a row that is switched off; see `legendShown`.
 *
 * Given `onToggle`, each row is also a switch for what it stands for: pressed
 * while that kind is on the map, released while it is not. The legend only says
 * which rows are off and reports clicks. Taking features off the map is the
 * layer's job, and the keys it goes by are the entries' own. Without `onToggle`
 * the rows are plain text, as they always were.
 *
 * @param {Array} entries - [{ key, label, kind, path, marker, arrow }].
 * @param {string} [title] - Heading, already resolved. Falls back to neutral English.
 * @param {boolean} [open] - Whether it starts expanded.
 * @param {Array} [hidden] - Keys of the entries switched off.
 * @param {Function} [onToggle] - Called with an entry's key when its row is pressed.
 * @param {Function} [onShowAll] - Called by the button that switches every row
 *        back on. The button is offered only while some row here is off.
 * @param {string} [showAllLabel] - That button's word, already resolved.
 */
export const Legend = ({
  entries = [],
  title,
  open = true,
  hidden = [],
  onToggle,
  onShowAll,
  showAllLabel,
  className = ''
}) => {
  const [expanded, setExpanded] = useState(open);

  if (!legendShown(entries, hidden)) return null;

  const heading = title ?? 'Legend';
  const anyOff = entries.some(entry => hidden.includes(entry.key));

  return (
    <div className={`atlas-legend ${className}`.trim()}>
      <button
        type='button'
        className='atlas-legend__toggle'
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <span className='atlas-legend__title'>{heading}</span>
        <span className='atlas-legend__chevron' aria-hidden='true'>{expanded ? '−' : '+'}</span>
      </button>

      {expanded && (
        <ul className='atlas-legend__list'>
          {entries.map(entry => {
            const content = (
              <>
                <Swatch entry={entry} />
                <span className='atlas-legend__label'>{entry.label}</span>
              </>
            );

            return (
              <li className='atlas-legend__row' key={entry.key}>
                {onToggle
                  ? (
                    <button
                      type='button'
                      className='atlas-legend__item'
                      aria-pressed={!hidden.includes(entry.key)}
                      onClick={() => onToggle(entry.key)}
                    >
                      {content}
                    </button>
                  )
                  : content}
              </li>
            );
          })}
        </ul>
      )}

      {expanded && onShowAll && anyOff && (
        <button type='button' className='atlas-legend__reset' onClick={onShowAll}>
          {showAllLabel ?? 'Show all'}
        </button>
      )}
    </div>
  );
};

Legend.propTypes = {
  entries: PropTypes.array,
  title: PropTypes.string,
  open: PropTypes.bool,
  hidden: PropTypes.array,
  onToggle: PropTypes.func,
  onShowAll: PropTypes.func,
  showAllLabel: PropTypes.string,
  className: PropTypes.string
};
