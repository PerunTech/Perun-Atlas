import { React } from 'perun-core'
import { DateRange } from '../DateRange'

/**
 * The date window: the picker, and the quick ranges beside it.
 *
 * Only for a set the service scopes to a window -- the panel asks `timeScoped`
 * before rendering this -- because a picker over a set it cannot change is a
 * control with nothing behind it.
 *
 * @param {Object} range           - `{ from, to }`, as `useDateWindow` holds it.
 * @param {Function} onRangeChange
 * @param {Array} [presets]        - `[{ months, label }]`, labels resolved.
 * @param {number} [preset]        - The months of the preset in force, if one is.
 * @param {Function} applyPreset
 * @param {Object} [labels]
 */
export const WindowControls = ({ range, onRangeChange, presets = [], preset, applyPreset, labels = {} }) => (
  <>
    <DateRange
      from={range.from}
      to={range.to}
      onChange={onRangeChange}
      labels={{ from: labels.from, to: labels.to, invalidRange: labels.invalidRange }}
    />

    {presets.length > 0 && (
      <div className='atlas-panel__segmented'>
        {presets.map(({ months, label }) => (
          <button
            key={months}
            type='button'
            aria-pressed={preset === months}
            onClick={() => applyPreset(months)}
          >
            {label}
          </button>
        ))}
      </div>
    )}
  </>
)
