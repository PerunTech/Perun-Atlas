import { React } from 'perun-core';
import { AtlasMap } from './AtlasMap';
import { DrawBar, DrawTool } from './DrawBar';
import { Choropleth } from './layers/Choropleth';
import { CirclePicker } from './layers/CirclePicker';
import { FeatureSet } from './layers/FeatureSet';
import { FileOverlay } from './layers/FileOverlay';
import { LegendControl } from './controls/LegendControl';
import { EmptyCard } from './panel/EmptyCard';
import { ExportButtons } from './panel/ExportButtons';
import { FileActions, FileNotices } from './panel/FileControls';
import { LinkButton } from './panel/LinkButton';
import { CloseButton } from './panel/CloseButton';
import { LoadingCard } from './panel/LoadingCard';
import { PanelFooter } from './panel/PanelFooter';
import { RecordPane } from './panel/RecordPane';
import { WindowControls } from './panel/WindowControls';
import { DEFAULT_PALETTE } from '../appearance/choropleth';
import { variantOf } from '../appearance/descriptor';
import { FILE_KEY, legendFrom, legendFromPalette } from '../appearance/legend';
import { overlayEntry } from '../appearance/overlay';
import { descriptorOf } from '../data/feature';
import { useChoropleth } from '../hooks/useChoropleth';
import { useDateWindow } from '../hooks/useDateWindow';
import { useDrawnShape } from '../hooks/useDrawnShape';
import { useExport } from '../hooks/useExport';
import { useFileOverlay } from '../hooks/useFileOverlay';
import { useLayerReport } from '../hooks/useLayerReport';
import { useRecord } from '../hooks/useRecord';
import { useViewLink } from '../hooks/useViewLink';
import '../style/panel.css';
import '../style/overlay.css';
const { useEffect, useMemo, useState } = React;

// Knows nothing about what it draws: everything with a domain in it arrives as a prop, and nothing here
// may name a table, a service, a field or a descriptor. The props are a menu row's keys, described in
// `docs/menu-row.md`.
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
  view,
  linkId,
  link,
  className = '',
  onClose
}) => {
  const [labelled, setLabelled] = useState(true);

  // A link's view holds through the first draw instead of framing the set; later draws frame as usual.
  const [viewHeld, setViewHeld] = useState(Boolean(view?.center));
  const releaseView = () => { if (viewHeld) setViewHeld(false); };

  // Offered to service paths as `{srid}`. AtlasMap resolves it before its children mount, so a path
  // never goes out with the placeholder still in it.
  const [dataSrid, setDataSrid] = useState(null);

  // Undefined until ready, and the conversions then use the page's map, on the same projection.
  const [drawnOn, setDrawnOn] = useState(undefined);

  // A map that failed to build never mounts the layer that would end `loading`.
  const [mapFailed, setMapFailed] = useState(false);

  // `onMoved` names hooks declared below; it runs from an event handler, by which time they exist.
  const { timeScoped, preset, range, initial, longest, applyPreset, onRangeChange } = useDateWindow({
    presets,
    defaultMonths,
    servicePath,
    opening: view?.from && view?.to ? { from: view.from, to: view.to } : undefined,
    onMoved: () => { forget(); closeRecord(); }
  });

  const bindings = useMemo(() => ({
    ...(context || {}),
    ...(timeScoped && { from: range.from, to: range.to }),
    ...(dataSrid && { srid: dataSrid })
  }), [context, timeScoped, range.from, range.to, dataSrid]);

  // Rebuilt every render, so effects compare the bindings by value.
  const bindingKey = JSON.stringify(bindings);

  const { coloured, statusPath, rows, tooltip: colourTooltip } = useChoropleth({
    choropleth,
    bindings,
    bindingKey
  });

  const {
    set, visible, loading, drawn, extent,
    setDrawn, setShown, setExtent, onFetchStart, onFetched, onFetchFailed, forget
  } = useLayerReport({ coloured });

  // Kept across fetches: on a coloured map every pan is a fetch, and a reset would undo the filter on
  // the first drag.
  const [hidden, setHidden] = useState([]);
  const toggleKind = (key) => setHidden((current) => (
    current.includes(key) ? current.filter((k) => k !== key) : [...current, key]
  ));
  const showAll = () => setHidden([]);

  // Closed, the empty card stays closed while the question (the window, the record) is the same.
  const [emptyClosedFor, setEmptyClosedFor] = useState(null);

  const {
    drawable, drawing, shape, selection, note, form, saving, reload,
    setShape, setNote, startDrawing, finishDrawing, clearDrawing, saveShape
  } = useDrawnShape({ draw, dataSrid, set: visible, bindings, labels, map: drawnOn });

  const { record, openRecord, closeRecord, descriptorFor, isPinnedFeature } = useRecord({ subject, drawing });

  const fileOverlay = useFileOverlay({
    overlay,
    labels,
    onChange: () => setHidden((current) => current.filter((key) => key !== FILE_KEY))
  });
  const { file } = fileOverlay;

  // The pane holds a copy, so nothing else would close it when its file goes.
  useEffect(() => {
    if (record?.file && record.file !== file) closeRecord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  // As the mounted layer resolves it, so a KML placemark gets the name the feature has on the map.
  const drawnWith = (feature) => (coloured
    ? descriptors?.[choropleth.descriptor]
    : variantOf(descriptors?.[descriptorFor(feature) ?? descriptorOf(feature)], feature));

  const exporter = useExport({
    set: visible,
    selection,
    exportable,
    labelResolver,
    timeScoped,
    range,
    srid: dataSrid,
    map: drawnOn,
    drawnWith
  });

  const viewLink = useViewLink({ linkId, link, timeScoped, range, labels });

  // Not while a fetch is out, and not while drawing: the card takes clicks in the middle of the map,
  // where a centre gets placed.
  const nothingFound = !loading && set !== null && (set.features?.length ?? 0) === 0;
  const empty = nothingFound && notice !== false && !drawing && !shape && !file &&
    emptyClosedFor !== bindingKey;

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

        {/* A coloured map names its areas on hover, so it has no label switch. */}
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

        {/* Everything the reader can do, in one group, so the toolbar wraps it as one. */}
        {(drawable || exporter.canExport || fileOverlay.offered || viewLink.offered) && (
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

            {viewLink.offered && <LinkButton viewLink={viewLink} labels={labels} />}
          </div>
        )}

        <FileNotices fileOverlay={fileOverlay} labels={labels} />

        {drawable && (drawing || shape) && (
          <DrawBar
            shape={shape}
            drawing={drawing}
            busy={saving}
            limits={draw.radius}
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
            {/* `onReady`, `extent` and `view` follow the spread so a row's `map` cannot shadow them. */}
            <AtlasMap
              session={session}
              {...{ layerSwitcher: true, ...map }}
              extent={extent}
              view={view}
              noticeLabels={labels}
              onReady={(ready) => {
                setMapFailed(false);
                setDrawnOn(ready.map);
                setDataSrid(ready.config?.dataSrid ?? null);
                viewLink.attach(ready);
              }}
              onError={() => setMapFailed(true)}
            >
              {/* A coloured map waits for its rows, so no area is first drawn in the fallback colour. */}
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
                    fit={!viewHeld}
                    onFeatureClick={openRecord}
                    onLegend={setDrawn}
                    onShown={setShown}
                    onExtent={setExtent}
                    onLoadStart={onFetchStart}
                    onLoad={(collection) => { releaseView(); onFetched(collection); }}
                    onError={(err) => { releaseView(); onFetchFailed(err); }}
                  />
                )}

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

              {drawable && (
                <CirclePicker
                  value={shape}
                  drawing={drawing}
                  style={draw.style}
                  onChange={setShape}
                  onDrawn={finishDrawing}
                />
              )}

              {/* Inside the map so it goes fullscreen with it. Kept mounted across fetches, so a collapsed
                  key stays collapsed. */}
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

          {!mapFailed && (loading || saving || fileOverlay.opening) && (
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
  );
};
