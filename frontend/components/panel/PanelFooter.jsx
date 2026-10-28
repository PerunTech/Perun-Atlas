import { React } from 'perun-core';

export const PanelFooter = ({ timeScoped, range, initial, applyPreset, onClose, labels = {} }) => (
  <div className='atlas-panel__footer'>
    {timeScoped && <div className='atlas-panel__summary'>{`${range.from} → ${range.to}`}</div>}
    <div className='atlas-panel__actions'>
      {timeScoped && (
        <button
          type='button'
          className='atlas-panel__btn atlas-panel__btn--ghost'
          onClick={() => applyPreset(initial)}
        >
          {labels.reset ?? 'Reset range'}
        </button>
      )}
      {onClose && (
        <button
          type='button'
          className='atlas-panel__btn atlas-panel__btn--dark'
          onClick={onClose}
        >
          {labels.close ?? 'Close'}
        </button>
      )}
    </div>
  </div>
);
