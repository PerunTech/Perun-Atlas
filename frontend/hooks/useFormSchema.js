import { React } from 'perun-core';
import { bindPath, fetchSchema, pickFields } from '../data';

const { useEffect, useMemo, useState } = React

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
 * One key rather than two, because it is one question: what the fields are. A
 * string is where they live and an object is what they are.
 *
 * Narrowed here rather than by whoever asked, so that `pick` means the same
 * thing either way -- and so the panel sees one schema and never the question
 * of where it came from.
 *
 * @param {Object} params
 * @param {Object} [params.form]     - The row's `draw.form` block, or nothing.
 * @param {Object} params.bindings   - What the path's placeholders resolve against.
 * @returns {Object} `{ schema, loading, failed }`. `schema` is null until it is
 *          there; `failed` says it is not coming, which is a save to refuse
 *          rather than a form to leave empty.
 */
export const useFormSchema = ({ form, bindings }) => {
  const source = form?.schema
  const path = typeof source === 'string' ? source : null
  const inline = source && typeof source === 'object' ? source : null

  /**
   * The path with its placeholders in, which is what the fetch actually depends
   * on.
   *
   * Not the bindings: they are rebuilt on every render and carry the date
   * window, so depending on them would re-ask for a schema every time the
   * reader moved the dates -- for an answer that names a table and a session
   * and could not have changed. Resolved, the dependency is the request.
   */
  const url = path ? bindPath(path, bindings ?? {}) : null

  const [fetched, setFetched] = useState(null)
  const [loading, setLoading] = useState(Boolean(path))
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!path) {
      setFetched(null)
      setLoading(false)
      // A `form` block that names neither a schema nor a path is a row that
      // meant to have one. Said here because nothing downstream can tell that
      // apart from a screen with no form at all -- it would just be a Save
      // button above nothing.
      const misconfigured = Boolean(form) && !inline
      if (misconfigured) {
        console.error('perun-atlas: draw.form needs `schema` -- either the schema itself, or the path to a service that answers with one. Got', source)
      }
      setFailed(misconfigured)
      return undefined
    }

    let cancelled = false
    setLoading(true)
    setFailed(false)

    fetchSchema(path, bindings).then((next) => {
      if (cancelled) return
      setFetched(next)
      setFailed(!next)
      setLoading(false)
    })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, url, Boolean(form), Boolean(inline)])

  // By value, for the same reason the bindings are: a menu row arrives as a
  // fresh object on every render of whatever holds it, and an array compared by
  // identity would narrow the schema again on each one.
  const picked = form?.pick?.join('\u0000') ?? null

  const schema = useMemo(
    () => pickFields(path ? fetched : inline, form?.pick),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetched, inline, path, picked]
  )

  return { schema, loading, failed }
}
