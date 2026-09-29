import { React } from 'perun-core'

/**
 * The panel's `×`, wherever something on it can be closed.
 *
 * The header, the record pane, the empty card, the open file's chip and the two
 * lines about a file all close with one, and each says what it closes through
 * `label`, because a `×` read aloud says nothing. `title` is for the ones whose
 * target is not obvious from where the button sits; without it the button has
 * no tooltip.
 *
 * `className` is the look: `atlas-panel__close` in a corner,
 * `atlas-panel__fileclose` inline beside a file. A deployment styles each.
 *
 * @param {string} [className]
 * @param {string} label       - Its accessible name.
 * @param {string} [title]
 * @param {Function} onClick
 */
export const CloseButton = ({ className = 'atlas-panel__close', label, title, onClick }) => (
  <button
    type='button'
    className={className}
    aria-label={label}
    title={title}
    onClick={onClick}
  >
    ×
  </button>
)
