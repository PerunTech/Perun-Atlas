import { Form, React, elements, validator } from 'perun-core';
import '../style/form.css';
import '../style/draw.css';

const { Icon } = elements;
const { useState } = React;

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
 * A name for one row's form, unique in the document.
 *
 * The Save button is not inside the form -- it sits in the row's actions,
 * beside Discard, where the two buttons that end a shape belong -- so it says
 * which form it submits by naming it, and `form="..."` names it by id. An id is
 * document-wide: a second row with the same one would point its Save at the
 * first row's form, submit that, and save the wrong fields without a word. So
 * it is counted rather than fixed, and the same count is the `idPrefix`, which
 * puts the fields inside out of each other's way for the same reason.
 */
let rows = 0;
const nextRow = () => `atlas-draw-${rows += 1}`;

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
 * @param {Object} [form]        - { schema, uiSchema, data, onChange, loading,
 *        failed } for the fields a row described instead of hardcoding. Passed
 *        at all, it is a row that has fields; `schema` null is a row whose
 *        fields are still on their way from a service, or are not coming. What
 *        is wrong with what has been typed is not read here -- the form is the
 *        thing that knows, and the thing that says so. See below.
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
  form,
  caught,
  savable = true,
  limits = {},
  labels = {}
}) => {
  const { min = 50, max = 500000, step = 50 } = limits;
  const hasShape = Boolean(shape);
  // Stable for as long as this row is on screen, and different from the next
  // row's. See `nextRow`.
  const [rowId] = useState(nextRow);
  const formId = `${rowId}-form`;
  // A form on screen to submit. Not merely `form`: a row whose fields are still
  // arriving has no `<form>` in the document yet, and a button pointing at an id
  // that is not there is a button that does nothing.
  const submits = Boolean(form?.schema);

  /**
   * What the row will and will not send.
   *
   * The form's own errors are deliberately not here. They were, and a form with
   * a mandatory field empty meant a Save nobody could press -- which says
   * *that* something is missing and never *what*, because the form only writes
   * its messages when it is asked to validate, and it is asked when it is
   * submitted. A Save that cannot be pressed is a Save that is never submitted,
   * so the two states held each other shut. Pressable, the press produces the
   * messages, and the fields that need filling say so themselves.
   *
   * What is left is everything the form has no opinion about: a save already
   * out, no shape to save, the note this row hardcodes, and a row with fields
   * that never arrived -- saving that one would write a record with everything
   * the form was there to carry missing, which is worse than not saving and
   * quieter.
   */
  const blocked = busy
    || !hasShape
    || (note?.required && !String(note.value ?? '').trim())
    || Boolean(form && !form.schema);

  // One gate, two ways in. The button is the obvious one; Enter in a text field
  // is the other, and it arrives as a submit on the form rather than as a click
  // on anything, so a check that lives only on the button is a check that
  // pressing Enter walks around.
  const send = () => {
    if (!blocked && savable) onSave?.();
  };

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

      {hasShape && form && !form.schema && (
        <p className='atlas-panel__drawhint'>
          {form.loading
            ? (labels.formLoading ?? 'Loading the fields…')
            : (labels.formFailed ?? 'These fields did not load, so there is nothing to save into.')}
        </p>
      )}

      {/*
        * The fields a row described, rather than the ones this file happens to
        * have.
        *
        * RJSF, because perun-core already exports it and `DateRange` above this
        * panel is already one -- so these fields inherit the house widgets, the
        * error rendering and whatever a deployment does to its forms, instead of
        * being a second look on the same screen.
        *
        * `idPrefix` is not optional here and is the reason `DateRange` gained
        * one in the same change. RJSF names every control `root_<field>` by
        * default, so two forms on one panel put two elements with id `root` in
        * the document -- and a `<label for>` then points at whichever the
        * browser found first, which is the date filter stealing clicks meant for
        * a field beside the shape. It counts up rather than reading `atlas-draw`
        * flat, because the form now has a name of its own that Save points at,
        * and both names have to be the only ones of their kind in the document.
        *
        * The form is what Save submits, rather than something Save reads on its
        * way past. It is the form that knows which of its fields are empty and
        * where to write that, and it writes it when it is submitted -- so the
        * button says `form={formId}`, the form says `onSubmit`, and pressing
        * Save on an unfinished form marks the fields instead of doing nothing.
        * What is finally sent is still assembled outside: the record *and* a
        * geometry the form knows nothing about.
        *
        * `liveValidate` is off because errors that appear while the reader is
        * still typing are errors about a field nobody has finished. They appear
        * on the press instead, which is when there is something to be wrong
        * about.
        *
        * The browser's own required check is left on -- there is no
        * `noHtml5Validate` here -- and it is not belt and braces. A grouppath is
        * one key holding an object, its `required` lives inside that object, and
        * nothing above says the object has to exist: an untouched form holds
        * `{}`, and `{}` answers such a schema with no errors at all. Measured:
        * with the browser's check off, submitting an untouched form of that
        * shape calls back with `{}` and every mandatory field missing. With it
        * on, the browser stops on the first empty field, puts the focus there
        * and says so beside it.
        * The one case it cannot see is a mandatory field a row hides --
        * `ui:widget: 'hidden'` renders an input the browser is told to skip, and
        * the form's message for it has nowhere to appear -- so a row that hides
        * a field seeds a value into it or leaves it out of `pick`.
        *
        * A schema a row named rather than wrote arrives one request later than
        * the rest of this row, so `form` without a `schema` is the state above:
        * a line where the fields will be, and a Save that stays disabled either
        * way. A row that wrote its schema out never sees it.
        */}
      {hasShape && form?.schema && (
        <div className='atlas-panel__drawform'>
          <Form
            id={formId}
            idPrefix={rowId}
            schema={form.schema}
            uiSchema={{ 'ui:submitButtonOptions': { norender: true }, ...form.uiSchema }}
            formData={form.data}
            validator={validator}
            disabled={busy}
            liveValidate={false}
            showErrorList={false}
            onChange={({ formData }) => form.onChange?.(formData)}
            onSubmit={send}
          >
            <></>
          </Form>
        </div>
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
              type={submits ? 'submit' : 'button'}
              form={submits ? formId : undefined}
              className='atlas-panel__btn atlas-panel__btn--primary'
              onClick={submits ? undefined : send}
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
