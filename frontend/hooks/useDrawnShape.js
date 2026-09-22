import { React, elements, validator } from 'perun-core';
import { bindPath, fillBody, pointIn, postTo, ringIn, unitsPerMetre, withGroups } from '../data';
import { useFormSchema } from './useFormSchema';
import { useSelection } from './useSelection';

const { useMemo, useState } = React
const { alertUserResponse } = elements

/**
 * Which icon an answer gets, when the answer cannot say for itself.
 *
 * `alertUserResponse` reads `type` off a response envelope and shows the
 * matching face. Not every service here sends one: several answer a write with
 * a bare label code -- a string, with no envelope around it -- and the helper
 * reads a body with no HTTP status on it as a failure, so a save that worked
 * would be announced as one that did not.
 *
 * So the verdict fills in, and only then. A service that sent its own `type`
 * keeps it, because `WARNING` is a thing this cannot work out from a body it
 * does not read and a status it was not given.
 */
const alertType = (data, ok) => (data?.type ? undefined : (ok ? 'success' : 'error'))

/**
 * Drawing a shape and sending it somewhere.
 *
 * The one part of this panel that writes, and the only one with arithmetic in
 * it. Both are reasons to keep it here rather than among the panel's render:
 * what a radius means depends on a projection, the conversion happens once and
 * in one place, and a guard refuses a save the projection cannot express. None
 * of that is about a toolbar.
 *
 * A shape is also a question about what it covers, and `draw.select` is a row
 * asking it. That half is `useSelection`, composed here rather than beside this
 * in the panel for one reason: it needs the shape, and the save needs its
 * answer, so a panel holding the two apart would have to pass one through a ref
 * to reach the other. Composed, the order is just the order.
 *
 * @param {Object} params
 * @param {Object} [params.draw]      - The row's `draw` block. `save.onSave` or
 *        `select` is what makes a panel drawable -- a screen may want the shape
 *        only for what it catches, and never send it anywhere.
 * @param {number} [params.dataSrid]  - The projection the deployment stores geometry in.
 * @param {Object} [params.set]       - The collection on screen, for `draw.select`.
 * @param {Object} params.bindings    - What the save path's placeholders resolve against.
 * @param {Object} [params.labels]
 * @returns {Object} The shape, its controls, what it caught, and `reload` -- a
 *          number the layers refetch on, which a successful write increments.
 */
export const useDrawnShape = ({ draw, dataSrid, set, bindings, labels = {} }) => {
  /**
   * The shape being drawn, and everything that goes with sending it.
   *
   * `shape` is in ground terms -- a centre and a radius in metres -- because
   * that is what was drawn and what the map draws back. The projection it is
   * sent in is applied once, at the moment of saving, so that a shape drawn
   * before the map reported its settings is not stored in the wrong one.
   *
   * `reload` is the one piece of state a save leaves behind. A write changes
   * what the read would answer, and the layer below has no way of knowing that
   * -- so it is told, by a number it refetches on. It is not a placeholder and
   * never reaches a URL.
   */
  // A save or a selection. Either is a reason to put a shape on the map, and a
  // screen that draws a radius to see what falls inside it has nothing to send.
  const drawable = Boolean(draw?.save?.onSave || draw?.select)
  const [drawing, setDrawing] = useState(false)
  const [shape, setShape] = useState(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [reload, setReload] = useState(0)

  /**
   * The fields beside the shape, when a row describes them with a schema.
   *
   * `note` above is the one field this panel ever hardcoded, and it stays --
   * rows use it. `draw.form` is the general answer: a screen wanting a date, a
   * code list or three fields says so in a schema rather than waiting for this
   * file to grow another input, and says it by naming the service that already
   * describes those fields rather than describing them again.
   *
   * Seeded from the row, so a screen can open with a value already in it.
   */
  const [formData, setFormData] = useState(() => draw?.form?.data ?? {})

  const fields = useFormSchema({ form: draw?.form, bindings })

  /**
   * Whether the form is answerable as it stands.
   *
   * Validated here rather than read off RJSF's `onChange`, and the difference
   * matters at exactly one moment: the first. `liveValidate` reports errors when
   * something changes, so an untouched form with a required field empty reports
   * none -- and Save would be live on a form nobody has filled in. Asking the
   * validator directly is the same pass RJSF makes, made about the state that
   * exists rather than about the last edit.
   *
   * It is also the pass that catches a fetched schema arriving with `required`
   * on fields this row did not pick, which is the one way a form from a service
   * can be unanswerable rather than merely wrong.
   *
   * Asked of the form with its groups in place -- see `withGroups`. A grouppath
   * carries its own `required` and nothing above says the group must be there,
   * so an untouched form answers `{}` and `{}` satisfies a schema every field
   * of which is mandatory. That is not a validator to gate a save on.
   */
  const formErrors = useMemo(() => {
    if (!fields.schema) return []
    return validator.validateFormData(withGroups(formData, fields.schema), fields.schema)?.errors ?? []
  }, [formData, fields.schema])

  /**
   * What the shape covers, when a row asked.
   *
   * Derived rather than held: it is a function of the shape and the set, and
   * storing it would be a second copy of an answer that changes on every
   * keystroke in the radius field.
   */
  const selection = useSelection({ set, shape, dataSrid, select: draw?.select })

  /** Nothing drawn and nothing pending. */
  const clearDrawing = () => {
    setDrawing(false)
    setShape(null)
    setNote('')
    // Back to what the row seeded, not to empty: a screen that opens with a
    // value in a field should open that way again after a discard.
    setFormData(draw?.form?.data ?? {})
  }

  /**
   * Send the drawn shape to the service the row named.
   *
   * The shape is converted here and nowhere else. A radius is drawn in metres on
   * the ground and stored in the units of whatever projection the deployment
   * keeps geometry in, and the two are the same number only at the equator --
   * at these latitudes a circle sent across unconverted is a fifth too small,
   * silently, in a record nobody re-measures. `unitsPerMetre` asks the
   * projection itself rather than carrying a formula for it.
   *
   * Rounded, because more than one of these services parses its radius as an
   * integer and a decimal point is a rejected save rather than a rounded circle.
   * The centre keeps its decimals: it is read as a pair of doubles everywhere.
   *
   * On success the shape goes away and the layer is told to fetch again, because
   * what is now on the server is not what is on the screen. On failure it stays
   * exactly where it was -- the reader is one button press from trying again,
   * and throwing away a drawn shape to report a failure would be the second
   * thing to go wrong.
   *
   * Either way the reader is told by `alertUserResponse`, which is how every
   * other write in this shell reports itself and the reason nothing here parses
   * what came back. These services are mid-migration from a bare label code to
   * an envelope, and that helper already reads both -- so the day a service
   * starts sending a title and a message, they appear, and this file does not
   * change. `postTo`'s verdict is still read, because it decides what happens to
   * the drawn shape, which is not the same question as what to put on screen.
   */
  const saveShape = async () => {
    if (!shape || saving) return

    // A form that was configured and is not here. The button is already
    // disabled for this, and it is guarded again because the button is one
    // caller: a screen building its own controls out of this hook would
    // otherwise post a body with every field the form was carrying missing,
    // and the record would be written.
    if (draw.form && !fields.schema) {
      console.error('perun-atlas: nothing sent -- this row configures a form and its fields are not loaded.')
      return
    }

    setSaving(true)

    const centre = { lat: shape.lat, lng: shape.lng }
    const { x, y } = pointIn(centre, dataSrid)
    const scale = unitsPerMetre(centre, dataSrid)
    const radius = Math.round(shape.radius * scale)

    const vertices = ringIn(centre, shape.radius, dataSrid, draw.points)

    /**
     * The shape itself, as a ring in the projection the deployment stores.
     *
     * Formatted by the row, because the syntax is the service's and the geometry
     * is this panel's: `point` is a template for one vertex and `join` is what
     * goes between them. The default is a WKT coordinate pair, which is the only
     * spelling that is anybody's standard.
     */
    const ring = vertices
      .map((vertex) => bindPath(draw.ring?.point ?? '{x} {y}', vertex))
      .join(draw.ring?.join ?? ', ')

    /**
     * The same shape, as GeoJSON.
     *
     * Offered beside the ring rather than instead of it: a service that parses
     * the geometry out of a path segment needs the string, and one that reads a
     * body needs this, and which of the two a deployment has is not this panel's
     * to know. A row asking for `{draw.geojson}` gets the object itself, because
     * `fillBody` hands over a sole placeholder unconverted.
     *
     * Closed, unlike the ring: GeoJSON says a linear ring repeats its first
     * position as its last, and the readers that take it enforce that. The ring
     * is left open because the services that parse one close it themselves, and
     * a ring that arrived closed would be closed twice.
     */
    const geojson = {
      type: 'Polygon',
      coordinates: [[...vertices, vertices[0]].map((vertex) => [vertex.x, vertex.y])]
    }

    /**
     * A radius smaller than one unit of the projection it would be sent in.
     *
     * Only when that is what is being sent. `{draw.radius}` is the shape's size
     * in the stored projection, and rounding it is not optional -- more than one
     * of these services parses a radius as an integer. But a deployment storing
     * degrees measures a 720 m circle as 0.0065 of a unit, which rounds to
     * nothing, and a radius of zero is a save that either fails somewhere deep
     * or stores a shape with no extent. A row in that position wants
     * `{draw.metres}` and the ring, neither of which has this problem.
     *
     * Said here, before the request, because this is the one place that knows
     * both numbers. The service cannot tell the difference, and the reader would
     * otherwise be told only that it refused.
     */
    const sendsUnits = [draw.save.onSave, JSON.stringify(draw.save.body ?? null)]
      .some((text) => String(text).includes('{draw.radius}'))

    if (sendsUnits && !(radius >= 1)) {
      setSaving(false)
      alertUserResponse({
        type: 'error',
        response: labels.saveTooSmall
          ?? `This deployment stores geometry in EPSG:${dataSrid ?? '?'}, where ${Math.round(shape.radius)} m is less than one unit. Nothing was sent.`
      })
      console.error(
        `perun-atlas: a radius of ${Math.round(shape.radius)} m is ${shape.radius * scale} units in `
        + `EPSG:${dataSrid}, which rounds to zero. A projection measured in degrees cannot carry an `
        + 'integer radius: send {draw.metres} for the size and {draw.ring} for the shape instead.'
      )
      // The path as it reached the browser, because that is the thing to change
      // and the row it came from has already had its %TOKEN%s substituted --
      // so this is the only place the two halves are visible together.
      console.error('perun-atlas: the configured path is', draw.save.onSave)
      return
    }

    const context = {
      ...bindings,
      note,
      draw: {
        lat: shape.lat,
        lng: shape.lng,
        metres: Math.round(shape.radius),
        x,
        y,
        radius,
        ring,
        geojson,
        // Only where a row asked for a selection. A screen that draws a shape
        // and sends it somewhere has no use for `{draw.selected.ids}`, and an
        // empty one in the context is a placeholder that resolves to nothing
        // rather than one that is visibly not configured.
        ...(selection.context ? { selected: selection.context } : {})
      },
      // At the top rather than under `draw`, because it is not about the shape.
      // A row spreads it with `"...": "{form}"`, which is what lets the fields a
      // schema describes arrive beside a geometry that is never one of them.
      ...(draw?.form ? { form: formData } : {})
    }

    const answer = await postTo(draw.save.onSave, context, {
      body: draw.save.body === undefined ? undefined : fillBody(draw.save.body, context),
      contentType: draw.save.contentType,
      encoding: draw.save.encoding,
      failure: draw.save.failure
    })

    setSaving(false)

    if (answer.ok) {
      clearDrawing()
      setReload((n) => n + 1)
    }

    // The body as it arrived, or the transport's own words when there is no body
    // to show -- a request that never reached the service has nothing to say for
    // itself, and an empty answer put on screen reads as nothing having happened.
    alertUserResponse({
      response: answer.data || answer.message,
      type: alertType(answer.data, answer.ok)
    })
  }

  return {
    drawable,
    drawing,
    shape,
    selection,
    note,
    /**
     * The form, in the shape the row that renders it takes.
     *
     * One object rather than five loose keys, because it is one thing: a
     * schema, what has been typed into it, what is wrong with that, and the
     * two states a schema fetched from a service has and an inline one never
     * does. A panel passing this straight to `DrawBar` is passing on a whole
     * answer instead of reassembling one.
     */
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
    // The map has a shape now, so the tool disarms itself: the next click is a
    // click on a feature again, not a second centre.
    finishDrawing: () => setDrawing(false),
    clearDrawing,
    saveShape
  }
}
