import { React } from 'perun-core';
import { identifiersOf, withinCircle } from '../data';

const { useMemo } = React

/** What a row gets when it asks for a selection and says nothing else. */
const DEFAULTS = { id: '{pkid}', join: ',' }

/**
 * What the drawn shape has caught.
 *
 * The other half of drawing a circle. One half asks a service to remember the
 * shape; this one asks what is already on the screen which features the shape
 * covers -- *everything within n km of here*, which is the question a radius is
 * usually drawn to ask and the one nothing here could answer until now.
 *
 * It costs no request. The shape was drawn in this page and the features arrived
 * in one response, so both sides of the question are already in the browser and
 * the answer is arithmetic. `withinCircle` does that part and is where the
 * reasoning about distance and projection lives.
 *
 * Recomputed as the shape changes, which includes every keystroke in the radius
 * field. That is affordable because it is a distance per vertex over a set that
 * one response carried, and it is what makes a typed radius feel like a dial:
 * the count moves while the number is being typed.
 *
 * What it does not do is ask the server. The answer is over the set the layer
 * fetched -- complete for a `FeatureSet`, and only what is in view for a
 * bounding-box layer. A screen wanting *every* record within a radius, rather
 * than every record on screen within a radius, wants a service that takes the
 * circle. This is the client-side answer and says so.
 *
 * @param {Object} params
 * @param {Object} params.set         - The collection currently drawn, or null.
 * @param {Object} params.shape       - `{ lat, lng, radius }`, or null.
 * @param {number} [params.dataSrid]  - The projection that collection is in.
 * @param {boolean|Object} [params.select] - The row's `draw.select`: `true` for
 *        the defaults, or `{ mode, id, join }`. `mode` is `touches` or
 *        `contains`; `id` and `join` spell the identifier list the save body can
 *        send, exactly as `ring.point` and `ring.join` spell a ring. `export`
 *        is `false` for a screen whose file buttons should go on offering the
 *        whole set while a shape is drawn.
 * @returns {Object} `{ selecting, feedsExport, count, total, inside, has, metres, context }`.
 */
export const useSelection = ({ set, shape, dataSrid, select }) => {
  const asked = select === true ? DEFAULTS : (select ? { ...DEFAULTS, ...select } : null)

  // Read off the object rather than depending on it: a menu row arrives as a
  // fresh object on every render of whatever holds it, and depending on the
  // object would recompute the whole set on renders that changed nothing.
  const { mode, id, join } = asked ?? {}
  const feedsExport = Boolean(asked) && asked.export !== false

  return useMemo(() => {
    if (!asked) {
      return {
        selecting: false,
        feedsExport: false,
        count: 0,
        total: 0,
        inside: [],
        radius: null,
        has: () => false,
        metres: () => null,
        context: null
      }
    }

    const answer = withinCircle(set, shape, { srid: dataSrid, mode })

    return {
      selecting: true,
      feedsExport,
      count: answer.inside.length,
      total: answer.total,
      inside: answer.inside,
      // The shape's own size, carried so a caller naming the answer -- an export
      // filename, a heading -- does not have to hold the shape as well.
      radius: shape?.radius ?? null,
      has: answer.has,
      metres: answer.metres,
      /**
       * What a save body may send about the selection.
       *
       * Three spellings of one answer, for the same reason the shape itself
       * offers `ring` beside `geojson`: which one a service wants is the
       * service's business, and a row picks. Nothing is sent unless a row names
       * it.
       */
      context: {
        count: answer.inside.length,
        total: answer.total,
        ids: identifiersOf(answer.inside, { id, join }),
        geojson: { type: 'FeatureCollection', features: answer.inside }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [set, shape, dataSrid, mode, id, join, feedsExport, Boolean(asked)])
}
