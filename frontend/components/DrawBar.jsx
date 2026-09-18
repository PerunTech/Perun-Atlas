import { React, elements } from 'perun-core';

const { Icon } = elements;

/**
 * The controls for drawing one shape and sending it somewhere.
 *
 * Presentational: it owns nothing, decides nothing, and names nothing. The panel
 * holds the shape and does the saving; this is the row of controls that sits
 * over the map while that is happening, and every word in it arrives as a label.
 *
 * Three states, and the row says which one it is in by what it offers. Nothing
 * drawn yet: one button, which arms the map. Drawing: the same button, pressed,
 * and a way out. A shape on the map: its radius, whatever note the row asked
 * for, and the two buttons that end it.
 *
 * The radius is a number in metres because that is what was measured on the
 * ground. Typing into it is the half of this that direct manipulation is bad at
 * — nobody drags to exactly three kilometres — and dragging is the half typing
 * is bad at, which is why both exist and why neither is the primary.
 *
 * @param {Object|null} shape    - { lat, lng, radius } currently drawn
 * @param {boolean} drawing      - whether the map is armed
 * @param {boolean} busy         - a save is in flight
 * @param {Object} [note]        - { value, onChange, required } for the free-text field
 * @param {Object} [limits]      - { min, max, step } for the radius
 * @param {Object} [said]        - { ok, text }: what the last save answered
 * @param {Object} labels
 */
export const DrawBar = ({
  shape,
  drawing,
  busy,
  onStart,
  onCancel,
  onRadius,
  onSave,
  note,
  limits = {},
  said,
  labels = {}
}) => {
  const { min = 50, max = 500000, step = 50 } = limits;
  const hasShape = Boolean(shape);
  const blocked = busy || !hasShape || (note?.required && !String(note.value ?? '').trim());

  return (
    <div className='atlas-panel__draw' role='group' aria-label={labels.draw ?? 'Draw'}>
      <button
        type='button'
        className={`atlas-panel__btn ${drawing ? 'atlas-panel__btn--primary' : 'atlas-panel__btn--ghost'}`}
        aria-pressed={drawing}
        onClick={drawing ? onCancel : onStart}
        disabled={busy}
      >
        <Icon name='IconCircleDashed' size={16} stroke={1.75} aria-hidden='true' />
        {drawing ? (labels.drawing ?? 'Click a centre, then an edge') : (labels.draw ?? 'Draw an area')}
      </button>

      {hasShape && (
        <label className='atlas-panel__drawfield'>
          <span>{labels.radius ?? 'Radius'}</span>
          <input
            type='number'
            inputMode='numeric'
            value={Math.round(shape.radius)}
            min={min}
            max={max}
            step={step}
            disabled={busy}
            onChange={(event) => {
              const next = Number(event.target.value);
              // An empty field is a number in the middle of being typed, not a
              // circle of no size: leaving the shape alone keeps the one on the
              // map where it was until there is a value to move it to.
              if (Number.isFinite(next) && next > 0) onRadius(next);
            }}
          />
          <span className='atlas-panel__drawunit'>{labels.metres ?? 'm'}</span>
        </label>
      )}

      {hasShape && note && (
        <label className='atlas-panel__drawfield atlas-panel__drawfield--wide'>
          <span>{labels.note ?? 'Note'}</span>
          <input
            type='text'
            value={note.value ?? ''}
            disabled={busy}
            placeholder={labels.notePlaceholder ?? ''}
            onChange={(event) => note.onChange(event.target.value)}
          />
        </label>
      )}

      {said && (
        <div
          className={`atlas-panel__drawsaid${said.ok ? '' : ' atlas-panel__drawsaid--failed'}`}
          role='status'
          aria-live='polite'
        >
          {said.text}
        </div>
      )}

      {hasShape && (
        <div className='atlas-panel__drawactions'>
          <button
            type='button'
            className='atlas-panel__btn atlas-panel__btn--primary'
            onClick={onSave}
            disabled={blocked}
          >
            <Icon name='IconDeviceFloppy' size={16} stroke={1.75} aria-hidden='true' />
            {busy ? (labels.saving ?? 'Saving…') : (labels.save ?? 'Save')}
          </button>
          <button
            type='button'
            className='atlas-panel__btn atlas-panel__btn--ghost'
            onClick={onCancel}
            disabled={busy}
          >
            {labels.discard ?? 'Discard'}
          </button>
        </div>
      )}
    </div>
  );
};
