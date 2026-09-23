import { React } from 'perun-core';
import { fetchRows } from '../data';
import { reader } from '../data/path';

const { useEffect, useMemo, useState } = React

/**
 * What a coloured map needs beyond its geometry.
 *
 * One `choropleth` block from a menu row, answered three ways: whether this
 * screen colours at all, the rows it colours by, and the hover text over an
 * area. They are together because they are one configuration, and apart from
 * the panel because none of them is about the panel.
 *
 * @param {Object} params
 * @param {Object} [params.choropleth] - `{ status, join, field, palette, tooltip, ... }`.
 * @param {Object} params.bindings     - What the status path's placeholders resolve against.
 * @param {string} params.bindingKey   - Those bindings by value; see the panel.
 */
export const useChoropleth = ({ choropleth, bindings, bindingKey }) => {
  /**
   * Whether this screen colours areas by a category or draws features per
   * descriptor. One question, asked once, because it decides three things: which
   * layer is mounted, which key is built from what that layer reports, and
   * whether the label switch is a control or a dead toggle.
   */
  const coloured = Boolean(choropleth)

  const [rows, setRows] = useState(null)

  /**
   * The rows a coloured map joins onto its geometry.
   *
   * Fetched here rather than by the layer because they are not scoped to the
   * bounding box: the geometry service is asked again on every pause, and asking
   * a whole code list again with it would be a second request per pan for an
   * answer that did not change. It moves when the record or the window does,
   * which is what the bindings say.
   *
   * The layer is not mounted until they arrive -- `FeaturePanel` waits on
   * `rows !== null` -- so there is no first draw in the fallback colour followed
   * by a corrected one.
   */
  const statusPath = coloured ? choropleth.status : null

  useEffect(() => {
    if (!statusPath) return undefined

    let cancelled = false
    fetchRows(statusPath, bindings).then((next) => {
      if (!cancelled) setRows(next)
    })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusPath, bindingKey])

  /**
   * A hover label for a coloured area, built from the field a row names.
   *
   * The layer takes a function because a caller may want anything; a menu row
   * cannot write one, so it names a field and this is the function. Read the
   * way the colouring reads its category, so a field that colours an area can
   * also name it -- nested or as a flat `TABLE.COLUMN` key alike.
   */
  const tooltip = useMemo(() => {
    const field = choropleth?.tooltip
    if (!field) return undefined
    const read = reader(field)
    return (feature) => read(feature?.properties) ?? null
  }, [choropleth])

  return { coloured, statusPath, rows, tooltip }
}
