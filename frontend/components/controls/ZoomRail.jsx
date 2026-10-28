import { React, PropTypes } from 'perun-core';
import { marksIn, rungs } from '../../lib/zoom';
import { useAtlasMap } from '../context';
import { Glyph } from '../Glyph';
import { containEvents, MapControl } from './host';
import '../../style/zoom.css';

const { useEffect, useMemo, useState } = React;

// A ladder whose marks show where the map changes behaviour: where the basemap stops sharpening, where
// labels appear. AtlasMap passes what it knows; screens add theirs through `zoomMarks`.
export const ZOOM_LABELS = {
  in: 'Zoom in',
  out: 'Zoom out',
  level: 'Zoom level',
  upscaled: 'Above here the basemap is enlarged, not sharper',
  fit: 'Zoom to the data'
};

// Several maps can share a page, so ids for `aria-describedby` are counted.
let instances = 0;

const percent = (fraction) => `${(fraction * 100).toFixed(4)}%`;

export const ZoomRail = ({ position = 'bottomright', marks = [], labels, onFit }) => {
  const copy = { ...ZOOM_LABELS, ...labels };
  const map = useAtlasMap();

  const [describedBy] = useState(() => {
    instances += 1;
    return `atlas-zoom-marks-${instances}`;
  });

  const [range, setRange] = useState(() => ({ min: map.getMinZoom(), max: map.getMaxZoom() }));
  const [zoom, setZoom] = useState(() => map.getZoom());

  useEffect(() => {
    const readZoom = () => setZoom(map.getZoom());
    const readRange = () => {
      setRange({ min: map.getMinZoom(), max: map.getMaxZoom() });
      readZoom();
    };

    map.on('zoomend', readZoom);
    // Also fires when a layer with its own limits narrows the range.
    map.on('zoomlevelschange', readRange);

    // The map may have moved between this state's initialisation and the listeners being attached.
    readRange();

    return () => {
      map.off('zoomend', readZoom);
      map.off('zoomlevelschange', readRange);
    };
  }, [map]);

  const { min, max } = range;
  const ladder = useMemo(() => rungs(min, max), [min, max]);
  const placed = useMemo(() => marksIn(marks, min, max), [marks, min, max]);

  // The reader's level: a fractional zoom mid-animation matches no rung.
  const level = Math.round(zoom);
  const described = placed.filter(mark => mark.label).map(mark => mark.label).join('. ');

  const rail = (
    <div className='atlas-zoom'>
      {onFit && (
        <button
          type='button'
          className='atlas-zoom__step atlas-zoom__fit'
          onClick={onFit}
          title={copy.fit}
          aria-label={copy.fit}
        >
          <Glyph name='zoom-scan' />
        </button>
      )}

      <button
        type='button'
        className='atlas-zoom__step'
        onClick={() => map.zoomIn()}
        disabled={level >= max}
        title={copy.in}
        aria-label={copy.in}
      >
        <Glyph name='plus' />
      </button>

      {/* A deployment can pin the min and max zoom together, and a one-rung ladder says nothing. */}
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

          {/* A rotated horizontal slider: no single vertical spelling works in every browser, and this
              keeps the native keyboard, drag and ARIA. */}
          <input
            type='range'
            className='atlas-zoom__slider'
            min={min}
            max={max}
            step={1}
            value={Math.min(Math.max(level, min), max)}
            onChange={event => map.setZoom(Number(event.target.value))}
            aria-label={copy.level}
            aria-describedby={described ? describedBy : undefined}
          />

          {described ? <p className='atlas-zoom__described' id={describedBy}>{described}</p> : null}
        </div>
      )}

      <button
        type='button'
        className='atlas-zoom__step'
        onClick={() => map.zoomOut()}
        disabled={level <= min}
        title={copy.out}
        aria-label={copy.out}
      >
        <Glyph name='minus' />
      </button>

      <output className='atlas-zoom__level' title={copy.level}>{level}</output>
    </div>
  );

  // A drag on the handle would otherwise pan the map, and a wheel over the rail zoom it twice.
  return (
    <MapControl position={position}>
      <div className='atlas-zoom__host' ref={containEvents}>{rail}</div>
    </MapControl>
  );
};

ZoomRail.propTypes = {
  position: PropTypes.string,
  marks: PropTypes.array,
  labels: PropTypes.object,
  onFit: PropTypes.func
};
