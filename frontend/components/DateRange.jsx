import { Form, React, validator } from 'perun-core';
import '../style/form.css';

const { useMemo } = React;

/**
 * A from/to pair, for services that take a date window.
 *
 * Built on the RJSF form perun-core already exports rather than on hand-rolled
 * inputs, so it inherits the house widgets, error rendering and styling, and a
 * deployment that restyles its forms restyles this too.
 *
 * `GenericForm` is the other thing perun-core exports and is the wrong one here:
 * it is bound to the svarog save pipeline — it fetches a form configuration by
 * name, keeps form data in redux, and renders save and delete buttons — and this
 * filter saves nothing. This follows MarkdownMetaForm instead, which is the
 * pattern for a form that is not a record.
 *
 * Controlled, and it takes its labels as props so that this package carries no
 * module's translations. Consumers pass whatever their own labelsManager returns.
 */
export const DateRange = ({
  from,
  to,
  onChange,
  labels = {},
  disabled = false,
  className = 'atlas-date-range'
}) => {
  const schema = useMemo(() => ({
    type: 'object',
    properties: {
      from: { type: 'string', format: 'date', title: labels.from ?? 'From' },
      to: { type: 'string', format: 'date', title: labels.to ?? 'To' }
    }
    // Titles are the only thing that changes, and only with the locale.
  }), [labels.from, labels.to]);

  const uiSchema = useMemo(() => ({
    'ui:order': ['from', 'to'],
    'ui:submitButtonOptions': { norender: true },
    from: { 'ui:disabled': disabled },
    to: { 'ui:disabled': disabled }
  }), [disabled]);

  /**
   * A backwards range is not an error the service rejects — it simply matches
   * nothing, because the filter excludes a window whose start is after its end.
   * An empty map with no explanation is the worst of both, so say why.
   */
  const customValidate = (formData, errors) => {
    if (formData?.from && formData?.to && formData.from > formData.to) {
      errors.to.addError(labels.invalidRange ?? 'The end date is before the start date.');
    }
    return errors;
  };

  return (
    <div className={className}>
      <Form
        /* Named, so that the draw row's form and this one do not both call their
           root `root` and every control under it `root_<field>`. Two elements
           sharing an id make `<label for>` ambiguous, and the browser resolves
           it by document order -- which would hand a click meant for a field
           beside the shape to whichever of these rendered first. */
        idPrefix='atlas-range'
        schema={schema}
        uiSchema={uiSchema}
        formData={{ from, to }}
        validator={validator}
        customValidate={customValidate}
        liveValidate
        showErrorList={false}
        noHtml5Validate
        onChange={({ formData }) => onChange?.(formData)}
      >
        {/* Suppresses RJSF's own submit button; nothing here is submitted. */}
        <></>
      </Form>
    </div>
  );
};
