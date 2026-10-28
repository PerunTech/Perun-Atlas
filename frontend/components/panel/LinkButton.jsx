import { React, elements } from 'perun-core';

const { Icon } = elements;

export const LinkButton = ({ viewLink, labels = {} }) => (
  <button
    type='button'
    className='atlas-panel__btn atlas-panel__btn--ghost'
    // `copyText` puts its fallback beside the button, inside the modal that holds the focus.
    onClick={(event) => viewLink.copy(event.currentTarget)}
  >
    <Icon name={viewLink.copied ? 'IconCheck' : 'IconLink'} size={16} stroke={1.75} aria-hidden='true' />
    {viewLink.copied ? (labels.linkCopied ?? 'Link copied') : (labels.copyLink ?? 'Copy link')}
  </button>
);
