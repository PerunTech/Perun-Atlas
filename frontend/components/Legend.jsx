import { React, PropTypes } from 'perun-core';
import { legendShown } from '../appearance/legend';
import { applyStyle } from '../lib/dom';
import '../style/legend.css';

const { useEffect, useRef, useState } = React;

// The size is overridden: a 30px marker is right on a map and three rows tall in a legend.
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

// The path's `className` goes on the line too, so a colour a stylesheet sets for it, such as an open
// file's `--ap-overlay`, reaches the swatch.
export const LineSwatch = ({ path, arrow }) => {
  const colour = path?.color ?? '#4A5C66';
  const dash = Array.isArray(path?.dashArray) ? path.dashArray.join(' ') : path?.dashArray;
  const head = arrow?.reverse ? '3,6 9,3 9,9' : '21,6 15,3 15,9';

  return (
    <svg className='atlas-legend__swatch' width='24' height='12' viewBox='0 0 24 12' aria-hidden='true'>
      <line
        className={path?.className}
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

// With `onToggle`, each row switches its kind on and off; hiding the features is the layer's job.
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
