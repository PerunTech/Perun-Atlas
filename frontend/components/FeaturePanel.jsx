import { React } from 'perun-core';
import { AtlasMap } from './AtlasMap';
import { DateRange } from './DateRange';
import { FeatureSet } from './FeatureSet';
import { identityOf } from '../data';
import '../style/panel.css';
const { useMemo, useState } = React

/**
 * A geometry set, with a date window over it when the service takes one.
 *
 * Deliberately knows nothing about what it is drawing. It fetches a service
 * path, draws whatever descriptors it is handed, and frames the result with a
 * title, a footer, and a date range when there is one to offer. Everything with
 * a domain in it --
 * what the features are called, which record the screen is about, which field
 * names it, what colour marks it -- arrives as a prop, so the next screen that
 * needs a map of something else needs no change here.
 *
 * Structure ships with it in `panel.css`; the look does not. A deployment's own
 * `atlas-panel.css` is later in the cascade and wins, so every map screen can be
 * restyled without releasing a bundle, and one that serves no sheet still gets a
 * panel rather than a stack of divs.
 *
 * The date window -- the picker, the quick ranges, the footer's range and the
 * reset button -- appears only when `servicePath` names a `{from}` or a `{to}`.
 * A set that is not scoped to a window gets a plain toolbar instead of a control
 * that cannot change what it is looking at. See `timeScoped`.
 *
 * Nothing in this file may name a table, a service, a field or a descriptor.
 * That is the whole point of it: it is what lets one panel serve every screen
 * that draws a set of features.
 *
 * @param {string} session      - Session the service is called with.
 * @param {string} servicePath  - Path with {token} placeholders.
 * @param {Object} context      - Extra values those placeholders resolve against.
 * @param {Object} descriptors  - Descriptor name to how it is drawn. Caller-owned.
 * @param {Object} [subject]    - The record the screen is about: { id, descriptor }.
 *                                Its descriptor is drawn instead of the
 *                                producer's, so the record stands out among the
 *                                features it arrived with.
 * @param {Array}  [presets]    - Quick ranges, [{ months, label }], longest last.
 *                                Shown only when the service takes a window; see
 *                                `timeScoped` below.
 * @param {Object} [labels]     - Every other piece of copy on the panel. Any key
 *                                left out falls back to neutral English, so an
 *                                unregistered label code is never shown.
 * @param {Function} [labelResolver] - Resolves a label code carried by a
 *                                descriptor, for the popup field names. Passed
 *                                straight to FeatureSet; descriptors are the one
 *                                part of the configuration this panel does not
 *                                resolve itself, because it never reads them.
 * @param {Object} [map]        - Passed to `AtlasMap`: `layerSwitcher`,
 *                                `zoomControl`, `zoomPosition`, `overrides`.
 * @param {Object} [tokens]     - CSS custom properties for the panel's root:
 *                                '--ap-accent' and friends. This is how a screen
 *                                described entirely in configuration carries its
 *                                colours, with no stylesheet of its own.
 */

/** ISO yyyy-mm-dd, which is both what <input type="date"> speaks and what LocalDate.parse expects. */
const iso = (date) => date.toISOString().slice(0, 10)

const monthsAgo = (months) => {
  const date = new Date()
  date.setMonth(date.getMonth() - months)
  return iso(date)
}

const rangeOf = (months) => ({ from: monthsAgo(months), to: iso(new Date()) })

export const FeaturePanel = ({
  session,
  servicePath,
  context,
  descriptors,
  labelResolver,
  subject,
  presets = [],
  defaultMonths,
  labels = {},
  map,
  tokens,
  title,
  className = '',
  onClose
}) => {
  const initial = defaultMonths ?? presets[presets.length - 1]?.months ?? 12
  const [preset, setPreset] = useState(initial)
  const [range, setRange] = useState(() => rangeOf(initial))
  const [set, setSet] = useState(null)
  const [labelled, setLabelled] = useState(true)

  /**
   * Whether this map is scoped to a date window.
   *
   * The service path is the honest signal, because the placeholders are the only
   * thing the window actually feeds: a path that names neither takes no window,
   * so offering one is offering a control that cannot change the answer. Derived
   * rather than configured for the same reason -- it is already written down,
   * and a second place to say it is a second place to say it differently.
   *
   * Not only cosmetic. `bindPath` leaves an unmatched placeholder alone and
   * ignores a value nothing names, so the URL would be right either way -- but
   * the dates reach `FeatureSet` through its context, and changing them changes
   * the key its effect depends on. On a path with no window that is a refetch of
   * a byte-identical URL, with the count blanked while it is in flight.
   */
  const timeScoped = /\{(from|to)\}/.test(servicePath ?? '')

  const bindings = useMemo(() => ({
    ...(context || {}),
    ...(timeScoped && { from: range.from, to: range.to })
  }), [context, timeScoped, range.from, range.to])

  /**
   * The record on screen, drawn as itself.
   *
   * A service returns the record and whatever it relates to as one kind of
   * thing, because to the service that is what they are. Which of them the user
   * came from is the screen's knowledge, not the service's, so it is applied
   * here: the feature whose identity is the record's gets the caller's
   * descriptor, every other one keeps the one it arrived with.
   */
  const isSubject = (feature) => {
    if (subject?.id === null || subject?.id === undefined) return false
    const { id } = identityOf(feature)
    if (id === null || id === undefined) return false
    // Compared as text: an identity is a name, and the two sides reach here from
    // different places -- one decoded from the wire, one out of a configuration
    // -- so one of them being a number is not a difference.
    return String(id) === String(subject.id)
  }

  const descriptorFor = (feature) => (subject?.descriptor && isSubject(feature) ? subject.descriptor : null)

  const applyPreset = (months) => {
    setPreset(months)
    setRange(rangeOf(months))
    setSet(null)
  }

  const onRangeChange = (next) => {
    setPreset(null)
    setRange(next)
    setSet(null)
  }

  const empty = set !== null && (set.features?.length ?? 0) === 0

  /** Offering the longest range is only an offer while the range is shorter than it. */
  const longest = presets[presets.length - 1]

  return (
    <div
      className={`atlas-panel ${className}${labelled ? '' : ' atlas-panel--nolabels'}`.trim()}
      style={tokens}
    >
      <header className='atlas-panel__header'>
        <div className='atlas-panel__title'>{title}</div>
        {onClose && (
          <button
            type='button'
            className='atlas-panel__close'
            aria-label={labels.close ?? 'Close'}
            onClick={onClose}
          >
            ×
          </button>
        )}
      </header>

      <div className='atlas-panel__toolbar'>
        {timeScoped && (
          <DateRange
            from={range.from}
            to={range.to}
            onChange={onRangeChange}
            labels={{ from: labels.from, to: labels.to, invalidRange: labels.invalidRange }}
          />
        )}

        {timeScoped && presets.length > 0 && (
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

        <button
          type='button'
          className='atlas-panel__switch'
          aria-pressed={labelled}
          onClick={() => setLabelled(!labelled)}
        >
          <span className='atlas-panel__track'>
            <span className='atlas-panel__knob' />
          </span>
          {labels.labels ?? 'Labels'}
        </button>
      </div>

      <div className='atlas-panel__mapwrap'>
        <div className='atlas-panel__map'>
          {/* Merged rather than defaulted: a caller setting one of AtlasMap's
              options should not silently lose the others. */}
          <AtlasMap session={session} {...{ layerSwitcher: true, ...map }}>
            <FeatureSet
              servicePath={servicePath}
              context={bindings}
              descriptors={descriptors}
              descriptorFor={descriptorFor}
              labelResolver={labelResolver}
              onLoad={(collection) => setSet(collection ?? { features: [] })}
              onError={() => setSet({ features: [] })}
            />
          </AtlasMap>
        </div>

        {empty && (
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
            </div>
          </div>
        )}
      </div>

      {(timeScoped || onClose) && (
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
      )}
    </div>
  )
}

