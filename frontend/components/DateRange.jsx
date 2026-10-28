import { Form, React, validator } from 'perun-core';
import '../style/form.css';

const { useMemo } = React;

// On perun-core's RJSF Form, not GenericForm, which is bound to the svarog save pipeline.
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
  }), [labels.from, labels.to]);

  const uiSchema = useMemo(() => ({
    'ui:order': ['from', 'to'],
    'ui:submitButtonOptions': { norender: true },
    from: { 'ui:disabled': disabled },
    to: { 'ui:disabled': disabled }
  }), [disabled]);

  // A backwards range matches nothing rather than failing, which would leave an unexplained empty map.
  const customValidate = (formData, errors) => {
    if (formData?.from && formData?.to && formData.from > formData.to) {
      errors.to.addError(labels.invalidRange ?? 'The end date is before the start date.');
    }
    return errors;
  };

  return (
    <div className={className}>
      <Form
        // Its own prefix, or this form and the draw row's share ids and `<label for>` clicks go astray.
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
