import { React, elements } from 'perun-core';
import { AtlasMap } from './AtlasMap';
import { DateRange } from './DateRange';
import { FeatureSet } from './FeatureSet';
import { LegendControl } from './LegendControl';
import { identityOf, toCSV, toGeoJSON } from '../data';
import { legendFrom } from '../style';
import { download } from './dom';
import '../style/panel.css';
const { useEffect, useMemo, useState } = React

/**
 * Tabler, through perun-core rather than as a dependency of this package.
 *
 * perun-core already ships `@tabler/icons-react` and loads it as its own lazy
 * chunk, so this costs no bundle weight and stays on whatever version the shell
 * is serving. It renders nothing until that chunk arrives and nothing at all if
 * it fails, so every button here keeps a text label beside the icon rather than
 * relying on one.
 */
const { Icon } = elements

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
 *                                `zoomControl`, `zoomPosition`, `coordinates`,
 *                                `coordinatesPosition`, `measure`,
 *                                `measurePosition`, `measureTools`, `fullscreen`,
 *                                `fullscreenPosition`, `locate`, `locatePosition`,
 *                                `scale`, `scalePosition`, `overrides`.
 * @param {Object|boolean} [exportable] - Offer the set as a file. Left out, it is
 *                                offered with the defaults; `false` withholds
 *                                the buttons; { geojson, csv, filename, fields,
 *                                exclude } chooses the formats, names the file,
 *                                fixes the CSV's columns, or drops more of them:
 *                                `SYSTEM_FIELDS` are already out.
 * A feature whose descriptor declares `details` opens a pane beside the map
 * carrying its whole record. The pane is here rather than in a popup because a
 * service that returns fifteen columns has already decided the answer is long,
 * and a bubble that size covers the thing it is describing. What it shows is
 * resolved by `FeatureSet`, which owns the descriptors -- this renders rows and
 * still never reads one.
 *
 * @param {boolean|string} [legend] - `false` withholds the key. On otherwise, and
 *                                it shows itself only when a set drew more than
 *                                one kind of thing -- one kind needs no key, and
 *                                a box saying so is a box over the map for
 *                                nothing. Built from what was drawn, so it needs
 *                                no configuration of its own. A string names the
 *                                corner it sits in instead of `bottomleft`,
 *                                which is worth setting when a screen already
 *                                puts something there.
 *
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
  exportable,
  legend = true,
  tokens,
  title,
  className = '',
  onClose
}) => {
  const initial = defaultMonths ?? presets[presets.length - 1]?.months ?? 12
  const [preset, setPreset] = useState(initial)
  const [range, setRange] = useState(() => rangeOf(initial))
  const [set, setSet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [labelled, setLabelled] = useState(true)
  const [record, setRecord] = useState(null)
  const [drawn, setDrawn] = useState([])

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

  /**
   * Escape closes the pane.
   *
   * It is the one control on this panel that covers something, so it is the one
   * that needs a way out that is not a mouse -- and the map underneath keeps its
   * own keyboard handling, since this listens on the document rather than
   * trapping focus.
   */
  useEffect(() => {
    if (!record) return undefined
    const onKey = (event) => { if (event.key === 'Escape') setRecord(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [record])

  const applyPreset = (months) => {
    setPreset(months)
    setRange(rangeOf(months))
    setSet(null)
    setRecord(null)
  }

  const onRangeChange = (next) => {
    setPreset(null)
    setRange(next)
    setSet(null)
    setRecord(null)
  }

  /**
   * How this set is offered as a file, or nothing.
   *
   * On unless a menu row says otherwise. The set is already on screen and
   * already in the browser -- `PERUN_ATLAS_LAST` holds the whole response --
   * so withholding the buttons withholds the convenience rather than the data,
   * and every screen that wanted them would have to remember to ask. `false`
   * turns them off for a screen where saving the set is the wrong offer.
   *
   * Only offered once a set has actually arrived and has something in it -- a
   * button that writes an empty file is worse than no button, because it looks
   * like the export worked.
   */
  const offer = exportable === false ? null : (exportable && exportable !== true ? exportable : {})
  const canExport = offer && set && (set.features?.length ?? 0) > 0

  /**
   * What the file is called.
   *
   * The range when there is one, the day when there is not, so two exports of
   * the same screen do not land in a downloads folder as `features (3)`. The
   * stem is the caller's, because this file has no idea what the set is.
   */
  const filename = [offer?.filename ?? 'features', timeScoped ? `${range.from}_${range.to}` : iso(new Date())].join('-')

  const saveGeoJSON = () => download(`${filename}.geojson`, toGeoJSON(set), 'application/geo+json')
  const saveCSV = () => download(`${filename}.csv`, toCSV(set, { fields: offer?.fields, exclude: offer?.exclude, labelResolver }), 'text/csv;charset=utf-8')

  // Not while a fetch is out: an empty set from the previous range is not news
  // about the one being fetched, and the two messages would flicker past each
  // other on every change.
  const empty = !loading && set !== null && (set.features?.length ?? 0) === 0

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

        {canExport && (
          <div className='atlas-panel__export'>
            {offer.geojson !== false && (
              <button type='button' className='atlas-panel__btn atlas-panel__btn--ghost' onClick={saveGeoJSON}>
                <Icon name='IconJson' size={16} stroke={1.75} aria-hidden='true' />
                {labels.exportGeoJSON ?? 'GeoJSON'}
              </button>
            )}
            {offer.csv !== false && (
              <button type='button' className='atlas-panel__btn atlas-panel__btn--ghost' onClick={saveCSV}>
                <Icon name='IconFileTypeCsv' size={16} stroke={1.75} aria-hidden='true' />
                {labels.exportCsv ?? 'CSV'}
              </button>
            )}
          </div>
        )}
      </div>

      <div className='atlas-panel__body'>
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
              onFeatureClick={(feature, details) => details && setRecord(details)}
              onLegend={setDrawn}
              onLoadStart={() => { setLoading(true); setRecord(null); setDrawn([]) }}
              onLoad={(collection) => { setSet(collection ?? { features: [] }); setLoading(false) }}
              onError={() => { setSet({ features: [] }); setLoading(false) }}
            />

            {/* Inside the map, so it lives in the container that goes
                fullscreen and comes off with it. Kept mounted across a reload
                rather than gated on `loading`: `drawn` empties at the start of
                every fetch, which takes the control off the map by itself, and
                leaving the component up is what lets a reader who collapsed the
                key find it still collapsed afterwards. */}
            {legend !== false && (
              <LegendControl
                entries={legendFrom(drawn, labelResolver)}
                title={labels.legend}
                position={typeof legend === 'string' ? legend : undefined}
              />
            )}
          </AtlasMap>
        </div>

        {loading && (
          <div className='atlas-panel__loading' role='status' aria-live='polite'>
            <div className='atlas-panel__loadingcard'>
              <div className='atlas-panel__spinner' aria-hidden='true' />
              <span>{labels.loading ?? 'Loading\u2026'}</span>
            </div>
          </div>
        )}

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

      {record && (
        <aside
          className={['atlas-panel__details', record.spec?.className].filter(Boolean).join(' ')}
          style={record.spec?.style}
          aria-label={labels.details ?? 'Details'}
        >
          <div className='atlas-panel__detailshead'>
            <div className='atlas-panel__detailstitle' style={record.spec?.titleStyle}>
              {record.title ?? labels.details ?? 'Details'}
            </div>
            <button
              type='button'
              className='atlas-panel__close'
              aria-label={labels.close ?? 'Close'}
              onClick={() => setRecord(null)}
            >
              ×
            </button>
          </div>

          <dl className='atlas-panel__detailsbody'>
            {record.rows.map(({ field, label, value }) => (
              <div key={field} className='atlas-panel__detailsrow'>
                <dt style={record.spec?.labelStyle}>{label}</dt>
                <dd style={record.spec?.valueStyle}>{value}</dd>
              </div>
            ))}
          </dl>
        </aside>
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

