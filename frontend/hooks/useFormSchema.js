import { React } from 'perun-core';
import { bindPath, fetchSchema, fetchUISchema, pickFields, usableUI } from '../data';

const { useEffect, useMemo, useState } = React

/**
 * What the request for one of these documents depends on.
 *
 * The path with its placeholders filled in, not the bindings: those are rebuilt
 * on every render and carry the date window, so depending on them would re-ask
 * for a schema every time the reader moved the dates -- for an answer that names
 * a table and a session and could not have changed. Resolved, the dependency is
 * the request.
 */
const requestFor = (path, bindings) => (path ? bindPath(path, bindings ?? {}) : null)

/** A document a row either wrote out or named. */
const sourceOf = (value) => ({
  path: typeof value === 'string' ? value : null,
  inline: value && typeof value === 'object' ? value : null
})

/**
 * Where the fields beside a shape come from.
 *
 * Two answers to one question, because a row has two reasons to ask it. A form
 * of two fields nobody else has is quicker to write out than to point at, and
 * `draw.form.schema` takes the schema itself. A form of fields a table already
 * describes should not be described twice, and the same key takes the path to
 * the service that describes them -- one string, and the fields, their titles,
 * their code lists and which of them are mandatory all arrive from the place
 * that already knows.
 *
 * `uiSchema` works the same way and is a second service, because at the far end
 * it is a second service: a deployment keeps a field's widget in `GUI_METADATA`
 * beside the field, and the two documents are paired by field name. Named, a row
 * gets the text areas, the read-only fields and the date inputs the rest of the
 * registry already draws.
 *
 * What it does not get is the deployment's own widgets. Those are registered by
 * the component that renders record forms, and this is a toolbar with a `Form`
 * in it -- so a layout naming one is filtered before it reaches the form, by
 * `usableUI`, which is where that reasoning lives. Without that a fetched layout
 * would not be a plainer form; it would be an exception thrown mid-render.
 *
 * The two requests go out together and the form waits for both, so the fields do
 * not appear in one shape and change to another. A layout that never arrives is
 * not a reason to refuse anything: a form in default widgets is a form, while a
 * form missing a field is a record missing a value.
 *
 * @param {Object} params
 * @param {Object} [params.form]     - The row's `draw.form` block, or nothing.
 * @param {Object} params.bindings   - What the paths' placeholders resolve against.
 * @returns {Object} `{ schema, uiSchema, loading, failed }`. `schema` is null
 *          until it is there; `failed` says it is not coming, which is a save to
 *          refuse rather than a form to leave empty.
 */
export const useFormSchema = ({ form, bindings }) => {
  const { path, inline } = sourceOf(form?.schema)
  const ui = sourceOf(form?.uiSchema)

  const request = requestFor(path, bindings)
  const uiRequest = requestFor(ui.path, bindings)

  const [fetched, setFetched] = useState(null)
  const [fetchedUI, setFetchedUI] = useState(null)
  const [loading, setLoading] = useState(Boolean(path || ui.path))
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!path && !ui.path) {
      setFetched(null)
      setFetchedUI(null)
      setLoading(false)
      // A `form` block that names neither a schema nor a path is a row that
      // meant to have one. Said here because nothing downstream can tell that
      // apart from a screen with no form at all -- it would just be a Save
      // button above nothing.
      const misconfigured = Boolean(form) && !inline
      if (misconfigured) {
        console.error('perun-atlas: draw.form needs `schema` -- either the schema itself, or the path to a service that answers with one. Got', form?.schema)
      }
      setFailed(misconfigured)
      return undefined
    }

    let cancelled = false
    setLoading(true)
    setFailed(false)

    // Together, because they describe one form and arriving apart would render
    // it twice -- once in whatever widgets the schema implies, and again in the
    // ones the deployment chose.
    Promise.all([
      path ? fetchSchema(path, bindings) : Promise.resolve(null),
      ui.path ? fetchUISchema(ui.path, bindings) : Promise.resolve(null)
    ]).then(([schema, layout]) => {
      if (cancelled) return
      setFetched(schema)
      setFetchedUI(layout)
      // Only the schema. A layout that did not arrive costs the form its
      // widgets; a schema that did not arrive costs it its fields.
      setFailed(Boolean(path) && !schema)
      setLoading(false)
    })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, request, ui.path, uiRequest, Boolean(form), Boolean(inline)])

  // By value, for the same reason the bindings are: a menu row arrives as a
  // fresh object on every render of whatever holds it, and an array compared by
  // identity would narrow the schema again on each one.
  const picked = form?.pick?.join('\u0000') ?? null

  const schema = useMemo(
    () => pickFields(path ? fetched : inline, form?.pick),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetched, inline, path, picked]
  )

  // Filtered whichever way it arrived. The form is the same form, and a widget
  // written into a row by hand is as absent from this registry as one read off
  // a table.
  const uiSchema = useMemo(
    () => usableUI(ui.path ? fetchedUI : ui.inline, schema) ?? undefined,
    [fetchedUI, ui.inline, ui.path, schema]
  )

  return { schema, uiSchema, loading, failed }
}
