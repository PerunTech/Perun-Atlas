import { React } from 'perun-core';
import { CloseButton } from './CloseButton';

export const EmptyCard = ({ timeScoped, longest, preset, applyPreset, onClose, labels = {} }) => (
  <div className='atlas-panel__empty'>
    <div className='atlas-panel__emptycard'>
      <div className='atlas-panel__emptytitle'>
        {labels.empty ?? (timeScoped ? 'Nothing in this range' : 'Nothing to show')}
      </div>
      {labels.emptyHint && <div className='atlas-panel__emptybody'>{labels.emptyHint}</div>}
      {timeScoped && longest && preset !== longest.months && (
        <button
          type='button'
          className='atlas-panel__btn atlas-panel__btn--primary'
          onClick={() => applyPreset(longest.months)}
        >
          {[labels.widen ?? 'Try', longest.label].filter(Boolean).join(' ')}
        </button>
      )}
      {/* Last, so a keyboard reaches the message and the offer before the way out; CSS puts it in the corner. */}
      <CloseButton label={labels.close ?? 'Close'} title={labels.close ?? 'Close'} onClick={onClose} />
    </div>
  </div>
);
