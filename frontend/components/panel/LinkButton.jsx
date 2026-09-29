import { React, elements } from 'perun-core'

/** Tabler through perun-core; `ExportButtons` says why. */
const { Icon } = elements

/**
 * The button that copies a link to this screen as it stands.
 *
 * It says so for a moment once the link is on the clipboard, in place of its
 * own words, since nothing else on screen changes when something is copied.
 *
 * @param {Object} viewLink - What `useViewLink` returned.
 * @param {Object} [labels]
 */
export const LinkButton = ({ viewLink, labels = {} }) => (
  <button
    type='button'
    className='atlas-panel__btn atlas-panel__btn--ghost'
    // Read here, while React still holds the event: `copyText` puts its
    // fallback beside the button, inside the modal that keeps the focus.
    onClick={(event) => viewLink.copy(event.currentTarget)}
  >
    <Icon name={viewLink.copied ? 'IconCheck' : 'IconLink'} size={16} stroke={1.75} aria-hidden='true' />
    {viewLink.copied ? (labels.linkCopied ?? 'Link copied') : (labels.copyLink ?? 'Copy link')}
  </button>
)
