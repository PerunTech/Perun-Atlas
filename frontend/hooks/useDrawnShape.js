import { React, elements, validator } from 'perun-core';
import { withGroups } from '../data/form';
import { fillBody, postTo, shapeContext } from '../data/save';
import { useFormSchema } from './useFormSchema';
import { useSelection } from './useSelection';

const { useMemo, useState } = React;
const { alertUserResponse } = elements;

// Several services answer with a bare label code, which alertUserResponse would read as a failure.
// A service that sent its own `type` keeps it.
const alertType = (data, ok) => (data?.type ? undefined : (ok ? 'success' : 'error'));

export const useDrawnShape = ({ draw, dataSrid, set, bindings, labels = {}, map }) => {
  // A screen may draw a radius only to see what falls inside it, with nothing to send. The shape is in
  // ground metres; the stored projection is applied once, on save.
  const drawable = Boolean(draw?.save?.onSave || draw?.select);
  const [drawing, setDrawing] = useState(false);
  const [shape, setShape] = useState(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);

  const [formData, setFormData] = useState(() => draw?.form?.data ?? {});

  const fields = useFormSchema({ form: draw?.form, bindings });

  // The form validates on submit, but an untouched form is `{}`, which a group's own `required` never
  // sees. Validated against `withGroups` so a hook caller without the browser's check is stopped too.
  const formErrors = useMemo(() => {
    if (!fields.schema) return [];
    return validator.validateFormData(withGroups(formData, fields.schema), fields.schema)?.errors ?? [];
  }, [formData, fields.schema]);

  const selection = useSelection({ set, shape, dataSrid, select: draw?.select, map });

  const clearDrawing = () => {
    setDrawing(false);
    setShape(null);
    setNote('');
    // Back to what the row seeded, not to empty.
    setFormData(draw?.form?.data ?? {});
  };

  // On failure the shape stays, so the reader is one press from trying again. alertUserResponse reads
  // both a bare label code and an envelope, so nothing here parses the answer.
  const saveShape = async () => {
    if (!shape || saving) return;

    // The button is disabled for this too, but a screen building its own controls would post a body
    // missing every form field.
    if (draw.form && !fields.schema) {
      console.error('perun-atlas: nothing sent -- this row configures a form and its fields are not loaded.');
      return;
    }

    if (formErrors.length) {
      alertUserResponse({
        type: 'error',
        response: labels.saveIncomplete ?? 'Some of these fields are mandatory and are empty. Nothing was sent.'
      });
      console.error(
        'perun-atlas: nothing sent -- the form is not answerable as it stands:',
        formErrors.map((error) => `${error.property ?? ''} ${error.message ?? ''}`.trim()).join('; ')
      );
      return;
    }

    const { context, units, tooSmall } = shapeContext(shape, {
      draw,
      dataSrid,
      bindings,
      note,
      selected: selection.context,
      form: formData,
      map
    });

    // Only here are both numbers known; the service would just refuse.
    if (tooSmall) {
      alertUserResponse({
        type: 'error',
        response: labels.saveTooSmall
          ?? `This deployment stores geometry in EPSG:${dataSrid ?? '?'}, where ${Math.round(shape.radius)} m is less than one unit. Nothing was sent.`
      });
      console.error(
        `perun-atlas: a radius of ${Math.round(shape.radius)} m is ${units} units in `
        + `EPSG:${dataSrid}, which rounds to zero. A projection measured in degrees cannot carry an `
        + 'integer radius: send {draw.metres} for the size and {draw.ring} for the shape instead.'
      );
      // The path after its %TOKEN%s were substituted, which is the thing to change.
      console.error('perun-atlas: the configured path is', draw.save.onSave);
      return;
    }

    setSaving(true);

    const answer = await postTo(draw.save.onSave, context, {
      body: draw.save.body === undefined ? undefined : fillBody(draw.save.body, context),
      contentType: draw.save.contentType,
      encoding: draw.save.encoding,
      failure: draw.save.failure
    });

    setSaving(false);

    if (answer.ok) {
      clearDrawing();
      setReload((n) => n + 1);
    }

    // The transport's own words when there is no body, or an empty alert reads as nothing happening.
    alertUserResponse({
      response: answer.data || answer.message,
      type: alertType(answer.data, answer.ok)
    });
  };

  return {
    drawable,
    drawing,
    shape,
    selection,
    note,
    form: draw?.form ? {
      schema: fields.schema,
      uiSchema: fields.uiSchema,
      data: formData,
      errors: formErrors,
      onChange: setFormData,
      loading: fields.loading,
      failed: fields.failed
    } : undefined,
    saving,
    reload,
    setShape,
    setNote,
    startDrawing: () => setDrawing(true),
    // The tool disarms once a shape is placed, so the next click opens a feature again.
    finishDrawing: () => setDrawing(false),
    clearDrawing,
    saveShape
  };
};
