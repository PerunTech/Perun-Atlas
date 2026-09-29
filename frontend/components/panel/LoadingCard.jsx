import { React } from 'perun-core'
import { openingText } from '../../appearance/overlay'

/**
 * Something is under way, and which kind it is only changes the word.
 *
 * A write says so rather than inheriting `loading`, because the two do not mean
 * the same thing to a reader waiting on one: a fetch will redraw the map, a save
 * will have changed the server. A file being opened names the file, since the
 * reader has just picked it and a large one takes a second or two to read and
 * draw. The more specific event wins the word where two could be true:
 * `saving`, then the file, then `loading`.
 *
 * Not the button, which said `Saving…` in place of `Save` until now. That put
 * the report in the corner the reader had just pressed and looked away from, and
 * it said the button was busy when what is busy is the service.
 *
 * @param {boolean} [saving]  - A drawn shape is being sent.
 * @param {string} [opening]  - The name of a file being read and drawn.
 * @param {Object} [labels]
 */
export const LoadingCard = ({ saving, opening, labels = {} }) => (
  <div className='atlas-panel__loading' role='status' aria-live='polite'>
    <div className='atlas-panel__loadingcard'>
      <div className='atlas-panel__spinner' aria-hidden='true' />
      <span>
        {saving
          ? (labels.saving ?? 'Saving…')
          : opening
            ? openingText(opening, labels)
            : (labels.loading ?? 'Loading…')}
      </span>
    </div>
  </div>
)
