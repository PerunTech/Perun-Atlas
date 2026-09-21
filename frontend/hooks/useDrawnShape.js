import { React, elements } from 'perun-core';
import { bindPath, fillBody, pointIn, postTo, ringIn, unitsPerMetre } from '../data';

const { useState } = React
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
 * @param {Object} params
 * @param {Object} [params.draw]      - The row's `draw` block; `save.onSave` is what makes a panel drawable.
 * @param {number} [params.dataSrid]  - The projection the deployment stores geometry in.
 * @param {Object} params.bindings    - What the save path's placeholders resolve against.
 * @param {Object} [params.labels]
 * @returns {Object} The shape, its controls, and `reload` -- a number the layers
 *          refetch on, which a successful write increments.
 */
export const useDrawnShape = ({ draw, dataSrid, bindings, labels = {} }) => {
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
  const drawable = Boolean(draw?.save?.onSave)
  const [drawing, setDrawing] = useState(false)
  const [shape, setShape] = useState(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [reload, setReload] = useState(0)

  /** Nothing drawn and nothing pending. */
  const clearDrawing = () => {
    setDrawing(false)
    setShape(null)
    setNote('')
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
        geojson
      }
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
    note,
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
