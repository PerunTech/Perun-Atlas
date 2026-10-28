import { React } from 'perun-core';

// `label` is the accessible name, since a `×` read aloud says nothing.
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
);
