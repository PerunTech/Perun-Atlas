import { Form, React, elements, validator } from 'perun-core';
import '../style/form.css';
import '../style/draw.css';

const { Icon } = elements;
const { useState } = React;

// DrawTool arms the map from the panel's actions; DrawBar is the shape's own row beneath the toolbar.
// A toggle shown through `aria-pressed` rather than a changing label, which would reflow its neighbours.
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

// The border lives on this box, not the input, so a disabled input needs this to look disabled.
const box = (busy) => `atlas-panel__drawbox${busy ? ' atlas-panel__drawbox--off' : ''}`;

// Save sits outside the form and names it with `form=`, so each row's id must be unique in the document.
let rows = 0;
const nextRow = () => `atlas-draw-${rows += 1}`;

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
  const [rowId] = useState(nextRow);
  const formId = `${rowId}-form`;
  // Not merely `form`: a row whose fields are still arriving has no `<form>` to point at yet.
  const submits = Boolean(form?.schema);

  // The form's own errors don't block Save: it writes its messages only when submitted, so a disabled
  // Save would never show them.
  const blocked = busy
    || !hasShape
    || (note?.required && !String(note.value ?? '').trim())
    || Boolean(form && !form.schema);

  // Enter in a text field submits the form without clicking the button, so the check lives here.
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
          {/* The unit sits inside the box with its number. */}
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
                // An empty field is a number mid-typing, not a circle of no size.
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

      {/* Save submits this form, so pressing it on an unfinished form marks the fields. `idPrefix` keeps
          its ids apart from DateRange's. The browser's required check stays on: an untouched grouppath
          form is `{}`, which RJSF passes. */}
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

      {/* `aria-live` because the count changes while the reader types a radius. */}
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
