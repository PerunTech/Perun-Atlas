import { React } from 'perun-core';
import { CloseButton } from './CloseButton';

/**
 * The card that says nothing came back, in the middle of the map.
 *
 * Whether to show it is the panel's question -- see `empty` there. This is what
 * it says: that the set is empty, the row's hint about why if it has one, an
 * offer of the longest window when a shorter one is in force, and a way to put
 * the card away.
 *
 * @param {boolean} timeScoped
 * @param {Object} [longest]      - `{ months, label }`, the longest preset.
 * @param {number} [preset]       - The months of the preset in force, if one is.
 * @param {Function} applyPreset
 * @param {Function} onClose
 * @param {Object} [labels]
 */
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
      {/* Last, so a keyboard reaches the message and the offer to widen
          before the way out of it. It sits in the corner all the same. */}
      <CloseButton label={labels.close ?? 'Close'} title={labels.close ?? 'Close'} onClick={onClose} />
    </div>
  </div>
);
