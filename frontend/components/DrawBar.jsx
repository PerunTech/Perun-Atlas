import { React, elements } from 'perun-core';

const { Icon } = elements;

/**
 * Drawing one shape and sending it somewhere, in two pieces.
 *
 * Two exports rather than one, because the two halves belong in different places
 * on the screen. `DrawTool` is the button that arms the map, and it sits in the
 * panel's actions — beside the file buttons — because that is the one place a
 * reader looks for something to press. `DrawBar` is everything the shape needs
 * once there is one, and it wants a row of its own: a radius, a note and the two
 * buttons that end it are not a one-word button and do not belong in a cluster
 * of them.
 *
 * That split is also what leaves room for a second tool. Whatever arrives next —
 * a rectangle, a corridor, a point — is another button in the same cluster and
 * another row under it, rather than another thing competing for the same corner
 * of the toolbar.
 *
 * Both are presentational: they own nothing, decide nothing and name nothing.
 * The panel holds the shape and does the saving; every word here arrives as a
 * label.
 */

/**
 * The button that arms the map.
 *
 * A toggle, and it says so the way a toggle does — `aria-pressed`, and the
 * accent fill the panel gives a pressed button — rather than by rewriting its
 * own label. The instruction is a sentence, and a sentence inside a button that
 * sits between `GeoJSON` and `CSV` would reflow the whole cluster the moment it
 * was pressed. It reads one row down instead, where `DrawBar` puts it and where
 * the shape's own controls are about to appear.
 *
 * @param {boolean} drawing - whether the map is armed
 * @param {boolean} busy    - a save is in flight
 * @param {Object} labels
 */
export const DrawTool = ({ drawing, busy, onStart, onCancel, labels = {} }) => (
  <button
    type='button'
    className={`atlas-panel__btn ${drawing ? 'atlas-panel__btn--primary' : 'atlas-panel__btn--ghost'}`}
    aria-pressed={drawing}
    onClick={drawing ? onCancel : onStart}
    disabled={busy}
  >
    <Icon name='IconCircleDashed' size={16} stroke={1.75} aria-hidden='true' />
    {labels.draw ?? 'Draw an area'}
  </button>
);

/**
 * The box a field's control sits in.
 *
 * Said in the markup rather than in the stylesheet because the stylesheet
 * cannot see it: the border and the ground moved off the input and onto this
 * box, so the browser's own rendering of a disabled input -- which is a grey
 * ground and a faded border -- now has nothing to render on. Without this the
 * fields would look live for as long as a save is out.
 */
const box = (busy) => `atlas-panel__drawbox${busy ? ' atlas-panel__drawbox--off' : ''}`;

/**
 * The row under the toolbar, while a shape is being made.
 *
 * Two states, and the row says which one it is in by what it offers. Armed with
 * nothing drawn: the instruction, which is what the button above stopped saying
 * when it moved into the actions. A shape on the map: its radius, whatever note
 * the row asked for, and the two buttons that end it. What the save answered is
 * not here -- it goes to `alertUserResponse` with every other write in this
 * shell, so the row closes when the shape does.
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
 * @param {Object} [caught]      - { count, total } the shape covers, for a row
 *        that asked what is inside it. Left out, the row says nothing about it.
 * @param {boolean} [savable]    - whether there is anywhere to send the shape.
 *        A screen may draw a radius only to see what falls inside it, and a Save
 *        button on that screen is a button with nothing behind it.
 * @param {Object} labels
 */
export const DrawBar = ({
  shape,
  drawing,
  busy,
  onCancel,
  onRadius,
  onSave,
  note,
  caught,
  savable = true,
  limits = {},
  labels = {}
}) => {
  const { min = 50, max = 500000, step = 50 } = limits;
  const hasShape = Boolean(shape);
  const blocked = busy || !hasShape || (note?.required && !String(note.value ?? '').trim());

  return (
    <div className='atlas-panel__draw' role='group' aria-label={labels.draw ?? 'Draw'}>
      {drawing && !hasShape && (
        <p className='atlas-panel__drawhint'>
          {labels.drawing ?? 'Click a centre, then an edge'}
        </p>
      )}

      {hasShape && (
        <label className='atlas-panel__drawfield'>
          <span>{labels.radius ?? 'Radius'}</span>
          {/* The unit goes inside the box with the number it belongs to.
              Outside it, it was a fourth loose item in this row, reading as a
              word between two fields rather than as the thing that says what
              the number is. */}
          <span className={box(busy)}>
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
          </span>
        </label>
      )}

      {hasShape && note && (
        <label className='atlas-panel__drawfield atlas-panel__drawfield--wide'>
          <span>{labels.note ?? 'Note'}</span>
          <span className={box(busy)}>
            <input
              type='text'
              value={note.value ?? ''}
              disabled={busy}
              placeholder={labels.notePlaceholder ?? ''}
              onChange={(event) => note.onChange(event.target.value)}
            />
          </span>
        </label>
      )}

      {/* What the shape covers, beside the number that decides it.
          `aria-live` because this is the one thing on the row that changes
          without being touched: a reader typing a radius is looking at the
          field, and the count moving underneath is the answer to what they are
          typing. `polite` so it waits for a pause rather than interrupting
          every keystroke. */}
      {hasShape && caught && (
        <p className='atlas-panel__drawcount' aria-live='polite'>
          <b>{caught.count}</b>
          <span>{labels.caught ?? 'inside'}</span>
          <span className='atlas-panel__drawtotal'>{`/ ${caught.total}`}</span>
        </p>
      )}

      {hasShape && (
        <div className='atlas-panel__drawactions'>
          {savable && (
          <button
            type='button'
            className='atlas-panel__btn atlas-panel__btn--primary'
            onClick={onSave}
            disabled={blocked}
          >
            <Icon name='IconDeviceFloppy' size={16} stroke={1.75} aria-hidden='true' />
            {labels.save ?? 'Save'}
          </button>
          )}
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
