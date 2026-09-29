import { React } from 'perun-core';
import { AtlasMap } from './AtlasMap';
import { DrawBar, DrawTool } from './DrawBar';
import { Choropleth } from './layers/Choropleth';
import { CirclePicker } from './layers/CirclePicker';
import { FeatureSet } from './layers/FeatureSet';
import { FileOverlay } from './layers/FileOverlay';
import { LegendControl } from './LegendControl';
import { EmptyCard } from './panel/EmptyCard';
import { ExportButtons } from './panel/ExportButtons';
import { FileActions, FileNotices } from './panel/FileControls';
import { CloseButton } from './panel/CloseButton';
import { LoadingCard } from './panel/LoadingCard';
import { PanelFooter } from './panel/PanelFooter';
import { RecordPane } from './panel/RecordPane';
import { WindowControls } from './panel/WindowControls';
import { DEFAULT_PALETTE, legendFrom, legendFromPalette, variantOf } from '../appearance';
import { FILE_KEY } from '../appearance/legend';
import { overlayEntry } from '../appearance/overlay';
import { descriptorOf } from '../data';
import {
  useChoropleth, useDateWindow, useDrawnShape, useExport, useFileOverlay, useLayerReport, useRecord
} from '../hooks';
import '../style/panel.css';
import '../style/overlay.css';
const { useEffect, useMemo, useState } = React

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
 * A feature whose descriptor declares `details` opens a pane beside the map
 * carrying its whole record. A pane rather than a popup, because a service that
 * returns fifteen columns has already decided the answer is long, and a bubble
 * that size covers the thing it is describing. What it shows is resolved by
 * `FeatureSet`, which owns the descriptors -- this renders rows and still never
 * reads one.
 *
 * `draw` is one key rather than a mode because that is the honest shape:
 * everything else on this panel -- the title, the record, the file buttons, the
 * key, the empty state -- is the same either way, and only the layer under them
 * differs.
 *
 * The props are a menu row's keys, and `docs/menu-row.md` is where each is
 * described: every option, default and placeholder. The differences from a row
 * are that words arrive resolved rather than as label codes, and the four below.
 *
 * The pieces it renders are in `panel/`, and its state is in `hooks/`. What is
 * left here is how they fit together.
 *
 * @param {string} session      - Session the service is called with.
 * @param {string} servicePath  - The row's `service`: a path with {token} placeholders.
 * @param {Object} context      - Extra values those placeholders resolve against.
 * @param {Object} descriptors  - Descriptor name to how it is drawn. Caller-owned.
 * @param {Object} [subject]    - `{ id, descriptor, match }`: the row's `subject`
 *                                with the record's own id.
 * @param {Function} [labelResolver] - Resolves the label codes a descriptor
 *                                carries. Passed straight to the layer;
 *                                descriptors are the one part of the
 *                                configuration this panel never reads.
 * @param {Object|boolean} [exportable] - The row's `export`.
 * @param {boolean} [overlay]   - The row's `overlay`: `false` withholds the
 *                                button that opens a file over the map.
 * @param {Array}  [presets]    - `[{ months, label }]`, longest last, labels resolved.
 * @param {number} [defaultMonths]
 * @param {Object} [labels]     - The panel's words, resolved. Any key left out
 *                                falls back to neutral English.
 * @param {boolean|number|Object} [cluster]
 * @param {Object} [map]        - Passed to `AtlasMap`, merged over `layerSwitcher: true`.
 * @param {boolean|string} [legend]
 * @param {boolean} [notice]
 * @param {Object} [tokens]     - CSS custom properties for the panel's root.
 * @param {Object} [choropleth]
 * @param {Object} [draw]
 * @param {string} [title]
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
  overlay,
  legend = true,
  notice = true,
  tokens,
  title,
  choropleth,
  draw,
  className = '',
  onClose
}) => {
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
   * The file buttons convert out of it too, because every file is written in
   * longitude and latitude whatever the deployment stores.
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
   * `onMoved`, naming `forget` and `closeRecord`, and it is a closure rather
   * than a call -- created here, run from an event handler, by which time both
   * hooks have been declared.
   */
  const { timeScoped, preset, range, initial, longest, applyPreset, onRangeChange } = useDateWindow({
    presets,
    defaultMonths,
    servicePath,
    onMoved: () => { forget(); closeRecord() }
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

  const {
    set, visible, loading, drawn, extent,
    setDrawn, setShown, setExtent, onFetchStart, onFetched, onFetchFailed, forget
  } = useLayerReport({ coloured })

  /**
   * The key's rows the reader has switched off, by the entries' own keys.
   *
   * Kept across fetches on purpose. A kind switched off before the date window
   * moved is still one the reader does not want after it, and on a coloured
   * map every pan is a fetch -- a filter that reset whenever the view moved
   * would last until the first drag. A key for something no longer drawn does
   * nothing until it is drawn again, and then it is still off, and the key says
   * so.
   */
  const [hidden, setHidden] = useState([])
  const toggleKind = (key) => setHidden((current) => (
    current.includes(key) ? current.filter((k) => k !== key) : [...current, key]
  ))
  const showAll = () => setHidden([])

  /**
   * The question the reader closed the empty card on, as its `bindingKey`.
   *
   * The card covers the middle of the map, and a reader who has read it may
   * want the map back without changing anything. Closed, it stays closed for
   * as long as the question is the same one -- through a reload after a save,
   * and through every pan on a coloured map, whose box is not part of the key.
   * A different window, or a different record, is a new question, and an empty
   * answer to it is news again.
   */
  const [emptyClosedFor, setEmptyClosedFor] = useState(null)

  const {
    drawable, drawing, shape, selection, note, form, saving, reload,
    setShape, setNote, startDrawing, finishDrawing, clearDrawing, saveShape
  } = useDrawnShape({ draw, dataSrid, set: visible, bindings, labels })

  const { record, openRecord, closeRecord, descriptorFor, isPinnedFeature } = useRecord({ subject, drawing })

  /**
   * A file the reader opened over the map, and the key's row for it.
   *
   * A new file comes in switched on, whatever the reader did with the last
   * one's row: they opened it to look at it.
   */
  const fileOverlay = useFileOverlay({
    overlay,
    labels,
    onChange: () => setHidden((current) => current.filter((key) => key !== FILE_KEY))
  })
  const { file } = fileOverlay

  // A record read from a file goes with the file. What the pane holds is a copy,
  // so nothing else would take it down, and a pane describing a file that is no
  // longer on the map is describing nothing.
  useEffect(() => {
    if (record?.file && record.file !== file) closeRecord()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file])

  /**
   * The descriptor a feature is drawn with, in the steps the mounted layer
   * takes: a coloured map's one descriptor, or else the record's own override,
   * then the name the producer stamped, with the variant case merged in, as
   * `FeatureSet` does. The KML export reads it so a placemark has the name the
   * feature has on the map.
   */
  const drawnWith = (feature) => (coloured
    ? descriptors?.[choropleth.descriptor]
    : variantOf(descriptors?.[descriptorFor(feature) ?? descriptorOf(feature)], feature))

  const exporter = useExport({
    set: visible,
    selection,
    exportable,
    labelResolver,
    timeScoped,
    range,
    srid: dataSrid,
    drawnWith
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
  const empty = nothingFound && notice !== false && !drawing && !shape && !file &&
    emptyClosedFor !== bindingKey

  return (
    <div
      className={`atlas-panel ${className}${labelled ? '' : ' atlas-panel--nolabels'}`.trim()}
      style={tokens}
    >
      <header className='atlas-panel__header'>
        <div className='atlas-panel__title'>{title}</div>
        {onClose && <CloseButton label={labels.close ?? 'Close'} onClick={onClose} />}
      </header>

      <div className='atlas-panel__toolbar'>
        {timeScoped && (
          <WindowControls
            range={range}
            onRangeChange={onRangeChange}
            presets={presets}
            preset={preset}
            applyPreset={applyPreset}
            labels={labels}
          />
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
        {(drawable || exporter.canExport || fileOverlay.offered) && (
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

            {exporter.canExport && <ExportButtons exporter={exporter} labels={labels} />}

            <FileActions fileOverlay={fileOverlay} labels={labels} />
          </div>
        )}

        <FileNotices fileOverlay={fileOverlay} labels={labels} />

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
            {/* `extent` after the spread for the same reason: it is the layer's
                report, and nothing in a row can know it. */}
            <AtlasMap
              session={session}
              {...{ layerSwitcher: true, ...map }}
              extent={extent}
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
                    hidden={hidden}
                    onFeatureClick={openRecord}
                    onLegend={setDrawn}
                    onShown={setShown}
                    onLoadStart={onFetchStart}
                    onLoad={onFetched}
                    onError={onFetchFailed}
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
                    hidden={hidden}
                    onFeatureClick={openRecord}
                    onLegend={setDrawn}
                    onShown={setShown}
                    onExtent={setExtent}
                    onLoadStart={onFetchStart}
                    onLoad={onFetched}
                    onError={onFetchFailed}
                  />
                )}

              {/* A file the reader opened, over the set and under the shape being
                  drawn. Its row in the key switches it off like any other. */}
              {file && (
                <FileOverlay
                  file={file}
                  srid={dataSrid}
                  hidden={hidden.includes(FILE_KEY)}
                  labelResolver={labelResolver}
                  onFeatureClick={openRecord}
                  onDrawn={fileOverlay.drawn}
                  onError={fileOverlay.failed}
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
                  entries={[
                    ...(coloured
                      ? legendFromPalette({
                        palette: choropleth.palette,
                        fallback: choropleth.fallback ?? DEFAULT_PALETTE.__unknown,
                        unknownLabel: choropleth.unknownLabel,
                        ...drawn
                      }, labelResolver)
                      : legendFrom(drawn, labelResolver)),
                    ...(file ? [overlayEntry(file.name)] : [])
                  ]}
                  title={labels.legend}
                  hidden={hidden}
                  onToggle={toggleKind}
                  onShowAll={showAll}
                  showAllLabel={labels.showAll}
                  position={typeof legend === 'string' ? legend : undefined}
                />
              )}
            </AtlasMap>
          </div>

          {(loading || saving || fileOverlay.opening) && (
            <LoadingCard saving={saving} opening={fileOverlay.opening} labels={labels} />
          )}

          {empty && (
            <EmptyCard
              timeScoped={timeScoped}
              longest={longest}
              preset={preset}
              applyPreset={applyPreset}
              labels={labels}
              onClose={() => setEmptyClosedFor(bindingKey)}
            />
          )}
        </div>

        {record && <RecordPane record={record} labels={labels} onClose={closeRecord} />}
      </div>

      {(timeScoped || onClose) && (
        <PanelFooter
          timeScoped={timeScoped}
          range={range}
          initial={initial}
          applyPreset={applyPreset}
          labels={labels}
          onClose={onClose}
        />
      )}
    </div>
  )
}
