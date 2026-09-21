import { React } from 'perun-core';
import { matchesIdentity } from '../data';

const { useEffect, useState } = React

/**
 * The record behind a click, and which feature the screen is about.
 *
 * Both halves of one idea. A service returns the record and whatever it relates
 * to as one kind of thing; which of them the reader came from is the screen's
 * knowledge, and everything here is that knowledge being applied -- to what a
 * click opens, to which feature is drawn as the subject, and to which one is
 * never collapsed into a cluster badge.
 *
 * @param {Object} params
 * @param {Object} [params.subject]  - `{ id, match, descriptor }` from the caller.
 * @param {boolean} params.drawing   - Whether the draw tool is armed; see `openRecord`.
 */
export const useRecord = ({ subject, drawing }) => {
  const [record, setRecord] = useState(null)

  /**
   * The record on screen, drawn as itself.
   *
   * A service returns the record and whatever it relates to as one kind of
   * thing, because to the service that is what they are. Which of them the user
   * came from is the screen's knowledge, not the service's, so it is applied
   * here: the feature whose identity is the record's gets the caller's
   * descriptor, every other one keeps the one it arrived with.
   */
  const isSubject = (feature) => matchesIdentity(feature, subject?.id, subject?.match)

  /**
   * A click on a feature opens its record -- unless a shape is being drawn.
   *
   * Leaflet passes a click on a vector layer up to the map as well, which is
   * what lets a centre be placed on top of a holding rather than only on open
   * ground. The record pane would open under the same click, covering the map
   * the reader is drawing on, so while the tool is armed the click means one
   * thing only.
   */
  const openRecord = (feature, details) => {
    if (drawing) return
    if (details) setRecord(details)
  }

  const descriptorFor = (feature) => (subject?.descriptor && isSubject(feature) ? subject.descriptor : null)

  // The record the screen is about is never collapsed into a badge. It sits
  // among its own partners, so it is the first thing a cluster swallows -- and
  // the one point whose position every line on the screen is drawn from.
  const isPinnedFeature = (feature) => isSubject(feature)

  /**
   * Escape closes the pane.
   *
   * It is the one control on this panel that covers something, so it is the one
   * that needs a way out that is not a mouse -- and the map underneath keeps its
   * own keyboard handling, since this listens on the document rather than
   * trapping focus.
   */
  useEffect(() => {
    if (!record) return undefined
    const onKey = (event) => { if (event.key === 'Escape') setRecord(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [record])

  return {
    record,
    openRecord,
    closeRecord: () => setRecord(null),
    isSubject,
    descriptorFor,
    isPinnedFeature
  }
}
