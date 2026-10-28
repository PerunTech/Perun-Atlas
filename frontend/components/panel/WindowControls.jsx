import { React } from 'perun-core';
import { DateRange } from '../DateRange';

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
);
