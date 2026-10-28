import { React } from 'perun-core';
import { openingText } from '../../lib/fileText';

// The most specific event wins the word: saving, then the file being opened, then loading.
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
);
