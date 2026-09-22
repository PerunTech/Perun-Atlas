import { React, elements } from 'perun-core';
import { AtlasMap } from './AtlasMap';
import { DateRange } from './DateRange';
import { DrawBar, DrawTool } from './DrawBar';
import { Choropleth } from './layers/Choropleth';
import { CirclePicker } from './layers/CirclePicker';
import { FeatureSet } from './layers/FeatureSet';
import { LegendControl } from './LegendControl';
import { DEFAULT_PALETTE, legendFrom, legendFromPalette } from '../appearance';
import { useChoropleth, useDateWindow, useDrawnShape, useExport, useRecord } from '../hooks';
import '../style/panel.css';
import '../style/draw.css';
const { useMemo, useState } = React

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
 * @param {Object} [subject]    - The record the screen is about:
 *                                { id, descriptor, match }. Its descriptor is
 *                                drawn instead of the producer's, so the record
 *                                stands out among the features it arrived with.
 *                                `match: 'parent'` for a service that returns
 *                                the record's children rather than the record --
 *                                then the id worth comparing is the feature's
 *                                `parent_id`. See `matchesIdentity`.
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
 * @param {boolean|number|Object} [cluster] - Collapse the points into counted
 *                                badges rather than a marker each. `true`
 *                                always, a number to cluster only from that many
 *                                points up, or an object for the plugin's own
 *                                options and the badge's look. Off unless asked
 *                                for: it trades every label and every marker
 *                                position for a count, which is the right trade
 *                                only once there are too many of them to read.
 * @param {Object} [map]        - Passed to `AtlasMap`: `layerSwitcher`,
 *                                `zoomControl`, `zoomPosition`, `zoomMarks`,
 *                                `zoomLabels`, `coordinates`,
 *                                `coordinatesPosition`, `measure`,
 *                                `measurePosition`, `measureTools`, `fullscreen`,
 *                                `fullscreenPosition`, `locate`, `locatePosition`,
 *                                `scale`, `scalePosition`, `scaleRatio`,
 *                                `overrides`.
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
 * @param {boolean} [notice]    - `false` withholds the card that says a set came
 *                                back empty. On otherwise, and worth turning off
 *                                for a screen whose empty state is its ordinary
 *                                one -- a map opened to draw something new has
 *                                nothing on it yet by definition, and a card
 *                                explaining that sits over the middle of the map
 *                                it is about to be drawn on.
 *
 * @param {Object} [tokens]     - CSS custom properties for the panel's root:
 *                                '--ap-accent' and friends. This is how a screen
 *                                described entirely in configuration carries its
 *                                colours, with no stylesheet of its own.
 * @param {Object} [choropleth] - Draw the set as areas filled by a category
 *                                rather than as features drawn per descriptor:
 *                                { descriptor, field, palette, fallback, join,
 *                                status, tooltip, unknownLabel }. `descriptor`
 *                                names an entry in `descriptors`; `status` is a
 *                                second service path whose rows are joined onto
 *                                the geometry by `join`; `tooltip` names the
 *                                field to show on hover.
 *
 * @param {Object} [draw]       - Let the reader draw a shape and send it to a
 *                                service: { shape, radius, note, save, labels }.
 *                                `save.onSave` is the path it is posted to, and
 *                                it resolves the same placeholders every other
 *                                path here does plus the shape's own, under
 *                                `{draw.*}`: `x`, `y` and `radius` in the
 *                                deployment's stored projection, `lat`, `lng`
 *                                and `metres` on the ground, `ring` -- the
 *                                circle as a ring of vertices in that
 *                                projection, which is the only form a service
 *                                reading an integer radius can take from a
 *                                deployment that stores degrees -- and `geojson`,
 *                                the same circle as a closed GeoJSON polygon.
 *                                `ring: { point, join }` is how the ring is
 *                                spelled, and `points` how many vertices either
 *                                form has.
 *                                `save.body` is a payload template whose strings
 *                                resolve the same way, except that a string
 *                                which is nothing but one placeholder resolves
 *                                to the value rather than to a printing of it --
 *                                which is what lets `"{draw.geojson}"` carry a
 *                                shape and `"{draw.metres}"` carry a number.
 *                                Nothing here knows what the shape means; this
 *                                panel draws a circle and posts numbers.
 *
 *                                `form` is `{ schema, pick, uiSchema, data }`
 *                                -- an RJSF form in the draw row, for the
 *                                fields this panel does not hardcode. `schema`
 *                                is the fields themselves or the path to a
 *                                service that has them, and `pick` names the
 *                                few of them this row wants, in order. Its data
 *                                reaches the save as `{form}`, which `"..."`
 *                                spreads into a body beside the geometry.
 *                                `note` is the one field that was hardcoded and
 *                                stays, for the rows that use it; a row moving
 *                                to `form` should drop it rather than render
 *                                both.
 *
 *                                `select` asks the other question a shape
 *                                answers: which features on screen it covers.
 *                                `true`, or `{ mode, id, join, export }`. The
 *                                count sits beside the radius, the file buttons
 *                                follow it, and the save body gains
 *                                `{draw.selected.*}`. See `useSelection` for
 *                                what that answer is over -- the set the layer
 *                                fetched, which is not the same as the database
 *                                -- and `ConfiguredMap` for how a row spells it.
 *                                A `draw` block carrying `select` and no `save`
 *                                is a screen that draws to look rather than to
 *                                write.
 *
 *                                It is one key rather than a mode because that is
 *                                the honest shape: everything else on this panel
 *                                -- the title, the record, the file buttons, the
 *                                key, the empty state -- is the same either way,
 *                                and only the layer under them differs. The date
 *                                window disappears by itself, because a
 *                                bbox-scoped path names no {from} or {to}.
 */

export const FeaturePanel = ({
  session,
  servicePath,
  context,
  descriptors,
  labelResolver,
  cluster,
  subject,
  presets = [],
  defaultMonths,
  labels = {},
  map,
  exportable,
  legend = true,
  notice = true,
  tokens,
  title,
  choropleth,
  draw,
  className = '',
  onClose
}) => {
  const [set, setSet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [labelled, setLabelled] = useState(true)

  /**
   * The EPSG code this deployment stores geometry in, once the map has resolved
   * its settings.
   *
   * Offered to a service path as `{srid}`, because a bbox-scoped service that
   * asks which projection it is being sent needs an answer that is the
   * deployment's rather than the screen's, and `sys.gis.default_srid` is where
   * svarog already keeps it. `AtlasMap` resolves it before its children mount --
   * it renders them only once it is ready -- so a path naming it is never sent
   * with the placeholder still in it.
   *
   * Not the same question as which projection the bounding box is *in*: that is
   * the map's CRS, and where the two disagree the engine converts incoming
   * geometry and nothing converts the box going out. That is worth knowing
   * before a path is written; it is not something this can decide.
   */
  const [dataSrid, setDataSrid] = useState(null)

  /**
   * The panel's own state, in the pieces it is made of.
   *
   * Ordered by what each piece needs from the one above: the window feeds the
   * bindings, the bindings feed the rows and the save, and the record pane needs
   * to know whether the draw tool is armed. The one backward reference is
   * `onMoved` naming `closeRecord`, and it is a closure rather than a call --
   * created here, run from an event handler, by which time the record hook has
   * been declared.
   */
  const { timeScoped, preset, range, initial, longest, applyPreset, onRangeChange } = useDateWindow({
    presets,
    defaultMonths,
    servicePath,
    onMoved: () => { setSet(null); closeRecord() }
  })

  const bindings = useMemo(() => ({
    ...(context || {}),
    ...(timeScoped && { from: range.from, to: range.to }),
    ...(dataSrid && { srid: dataSrid })
  }), [context, timeScoped, range.from, range.to, dataSrid])

  // Bindings are a small flat object rebuilt on every render, so the effects that
  // depend on them compare them by value; by identity they would refetch on each
  // one. Handed down beside the bindings themselves, because the hook that reads
  // them cannot tell a rebuilt object from a changed one either.
  const bindingKey = JSON.stringify(bindings)

  const { coloured, statusPath, rows, tooltip: colourTooltip } = useChoropleth({
    choropleth,
    bindings,
    bindingKey
  })

  /**
   * What the layer last reported it drew, in that layer's own shape.
   *
   * `FeatureSet` reports a list of kinds; `Choropleth` reports
   * `{ values, usedFallback }`. Kept as one piece of state rather than two
   * because only one layer is ever mounted, and two would mean a stale half
   * sitting beside the live one waiting to be read by mistake.
   */
  const noneDrawn = coloured ? { values: [], usedFallback: false } : []
  const [drawn, setDrawn] = useState(noneDrawn)

  const {
    drawable, drawing, shape, selection, note, form, saving, reload,
    setShape, setNote, startDrawing, finishDrawing, clearDrawing, saveShape
  } = useDrawnShape({ draw, dataSrid, set, bindings, labels })

  const { record, openRecord, closeRecord, descriptorFor, isPinnedFeature } = useRecord({ subject, drawing })

  /**
   * A fetch is starting.
   *
   * The open record deliberately survives it. What the pane holds is a resolved
   * copy of one feature's rows, not a live view of the layer, so nothing about
   * it goes stale when the set is redrawn -- and clearing it here closed the
   * pane a click had just opened. The sequence was its own cause: a click opens
   * the pane, the pane is what makes the map narrower, a narrower map is an
   * `invalidateSize`, and `invalidateSize` fires `moveend`, which a bbox-scoped
   * layer answers with a fetch. The pane then closed itself a quarter of a
   * second after opening, widening the map and starting a second fetch on the
   * way out.
   *
   * It also closed the pane on every ordinary pan, which is the same fault
   * without the self-inflicted part: a reader who opens a record and nudges the
   * map loses what they were reading.
   *
   * The clears that mean something stay where they are. `applyWindow` empties
   * the record when the date window moves, because that is a different set
   * rather than the same one fetched again.
   */
  const onFetchStart = () => {
    setLoading(true)
    setDrawn(noneDrawn)
  }

  const { offer, canExport, saveGeoJSON, saveCSV } = useExport({
    set,
    selection,
    exportable,
    labelResolver,
    timeScoped,
    range
  })

  /**
   * Whether to say that nothing came back.
   *
   * Not while a fetch is out: an empty set from the previous range is not news
   * about the one being fetched, and the two messages would flicker past each
   * other on every change.
   *
   * And not while a shape is being drawn, whatever the row asked for. The card
   * is the one thing on this panel that takes pointer events in the middle of
   * the map, which is exactly where a centre gets placed -- so a reader drawing
   * on an empty map would click the explanation instead of the map. A screen
   * that draws is a screen whose empty state is its ordinary one anyway.
   */
  const nothingFound = !loading && set !== null && (set.features?.length ?? 0) === 0
  const empty = nothingFound && notice !== false && !drawing && !shape

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

        {/* A control for permanent labels, which only one of the two layers
            draws. A coloured map names its areas on hover instead, so the switch
            would be a toggle with nothing on the other side of it. */}
        {!coloured && (
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
        )}

        {/* Everything the reader presses, in one group at the far end of the
            row. A tool that draws and a button that writes a file are different
            kinds of thing -- one changes what is on the server, the other takes
            a copy of what is on screen -- but they are alike in the way that
            decides where they go: they are what there is to do here, as against
            the date window and the label switch, which change what is shown.
            Two clusters said otherwise and lined up differently as the toolbar
            wrapped. A second tool is another button in here. */}
        {(drawable || canExport) && (
          <div className='atlas-panel__actions'>
            {drawable && (
              <DrawTool
                drawing={drawing}
                busy={saving}
                labels={labels}
                onStart={startDrawing}
                onCancel={clearDrawing}
              />
            )}

            {canExport && offer.geojson !== false && (
              <button type='button' className='atlas-panel__btn atlas-panel__btn--ghost' onClick={saveGeoJSON}>
                <Icon name='IconJson' size={16} stroke={1.75} aria-hidden='true' />
                {labels.exportGeoJSON ?? 'GeoJSON'}
              </button>
            )}

            {canExport && offer.csv !== false && (
              <button type='button' className='atlas-panel__btn atlas-panel__btn--ghost' onClick={saveCSV}>
                <Icon name='IconFileTypeCsv' size={16} stroke={1.75} aria-hidden='true' />
                {labels.exportCsv ?? 'CSV'}
              </button>
            )}
          </div>
        )}

        {/* The tool's own row, under everything else, and only while it has
            something to say: what to click, then the shape's radius and note.
            A row that is always there is a row of empty space on every screen
            that draws, which is every screen this panel renders. */}
        {drawable && (drawing || shape) && (
          <DrawBar
            shape={shape}
            drawing={drawing}
            busy={saving}
            limits={draw.radius}
            // Only what a row asked to see. `selecting` is false unless
            // `draw.select` is set, and the row then shows nothing extra.
            caught={selection.selecting ? { count: selection.count, total: selection.total } : undefined}
            savable={Boolean(draw.save?.onSave)}
            note={draw.note ? { value: note, onChange: setNote, required: draw.note.required } : undefined}
            form={form}
            labels={labels}
            onCancel={clearDrawing}
            onRadius={(radius) => setShape((current) => (current ? { ...current, radius } : current))}
            onSave={saveShape}
          />
        )}
      </div>

      <div className='atlas-panel__body'>
      <div className='atlas-panel__mapwrap'>
        <div className='atlas-panel__map'>
          {/* Merged rather than defaulted: a caller setting one of AtlasMap's
              options should not silently lose the others. */}
          {/* `onReady` after the spread on purpose: `map` comes from a menu row,
              which is JSON and cannot carry a function, so nothing there can be
              shadowing this -- and if a caller ever passes one in code, losing
              the panel's own settings silently would be the worse failure. */}
          <AtlasMap
            session={session}
            {...{ layerSwitcher: true, ...map }}
            onReady={({ config }) => setDataSrid(config?.dataSrid ?? null)}
          >
            {/* One layer or the other, never both. The callbacks are the same
                pair of hands either way -- which is what let this be a branch
                here rather than a second panel. A coloured map waits for its
                rows before it is mounted at all, so an area is never drawn in
                the unclassified colour and then corrected a moment later. */}
            {coloured
              ? (rows !== null || !statusPath) && (
                <Choropleth
                  servicePath={servicePath}
                  context={bindings}
                  srid={dataSrid}
                  reload={reload}
                  statusRows={rows}
                  join={choropleth.join}
                  field={choropleth.field}
                  palette={choropleth.palette}
                  fallback={choropleth.fallback}
                  descriptor={descriptors?.[choropleth.descriptor]}
                  labelResolver={labelResolver}
                  tooltip={colourTooltip}
                  onFeatureClick={openRecord}
                  onLegend={setDrawn}
                  onLoadStart={onFetchStart}
                  onLoad={(collection) => { setSet(collection ?? { features: [] }); setLoading(false) }}
                  onError={() => { setSet({ features: [] }); setLoading(false) }}
                />
              )
              : (
                <FeatureSet
                  servicePath={servicePath}
                  context={bindings}
                  reload={reload}
                  descriptors={descriptors}
                  descriptorFor={descriptorFor}
                  labelResolver={labelResolver}
                  cluster={cluster}
                  pinned={isPinnedFeature}
                  onFeatureClick={openRecord}
                  onLegend={setDrawn}
                  onLoadStart={onFetchStart}
                  onLoad={(collection) => { setSet(collection ?? { features: [] }); setLoading(false) }}
                  onError={() => { setSet({ features: [] }); setLoading(false) }}
                />
              )}

            {/* The shape the reader is drawing, over everything the service
                returned. `drawing` arms the map; once a shape exists the tool is
                disarmed and the handles take over, so a second circle is drawn
                by pressing the button again rather than by an unlucky click. */}
            {drawable && (
              <CirclePicker
                value={shape}
                drawing={drawing}
                style={draw.style}
                onChange={setShape}
                onDrawn={finishDrawing}
              />
            )}

            {/* Inside the map, so it lives in the container that goes
                fullscreen and comes off with it. Kept mounted across a reload
                rather than gated on `loading`: `drawn` empties at the start of
                every fetch, which takes the control off the map by itself, and
                leaving the component up is what lets a reader who collapsed the
                key find it still collapsed afterwards. */}
            {legend !== false && (
              <LegendControl
                entries={coloured
                  ? legendFromPalette({
                    palette: choropleth.palette,
                    fallback: choropleth.fallback ?? DEFAULT_PALETTE.__unknown,
                    unknownLabel: choropleth.unknownLabel,
                    ...drawn
                  }, labelResolver)
                  : legendFrom(drawn, labelResolver)}
                title={labels.legend}
                position={typeof legend === 'string' ? legend : undefined}
              />
            )}
          </AtlasMap>
        </div>

        {/* A request is out, and which kind it is only changes the word. A
            write says so rather than inheriting `loading`, because the two do
            not mean the same thing to a reader waiting on one: a fetch will
            redraw the map, a save will have changed the server. `saving` wins
            the word where both could be true, being the more specific event.

            Not the button, which said `Saving…` in place of `Save` until now.
            That put the report in the corner the reader had just pressed and
            looked away from, and it said the button was busy when what is busy
            is the service. */}
        {(loading || saving) && (
          <div className='atlas-panel__loading' role='status' aria-live='polite'>
            <div className='atlas-panel__loadingcard'>
              <div className='atlas-panel__spinner' aria-hidden='true' />
              <span>
                {saving
                  ? (labels.saving ?? 'Saving\u2026')
                  : (labels.loading ?? 'Loading\u2026')}
              </span>
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
              onClick={closeRecord}
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

