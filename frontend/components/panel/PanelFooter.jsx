import { React } from 'perun-core';

/**
 * The line under the map: the window being shown, the way back to the one the
 * panel opened on, and the close a host asked for by passing `onClose`.
 *
 * @param {boolean} timeScoped
 * @param {Object} range         - `{ from, to }`.
 * @param {number} [initial]     - The months the panel opened on.
 * @param {Function} applyPreset
 * @param {Function} [onClose]
 * @param {Object} [labels]
 */
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
