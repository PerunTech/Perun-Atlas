import { React, elements } from 'perun-core';
import { AtlasMap } from './AtlasMap';
import { DateRange } from './DateRange';
import { DrawBar, DrawTool } from './DrawBar';
import { Choropleth } from './layers/Choropleth';
import { CirclePicker } from './layers/CirclePicker';
import { FeatureSet } from './layers/FeatureSet';
import { LegendControl } from './LegendControl';
import { bindPath, fetchRows, fillBody, matchesIdentity, pointIn, postTo, ringIn, toCSV, toGeoJSON, unitsPerMetre, valueAt } from '../data';
import { DEFAULT_PALETTE, legendFrom, legendFromPalette } from '../style';
import { download } from './lib/dom';
import { rangeOf, sameWindow, today } from './lib/dates';
import '../style/panel.css';
import '../style/draw.css';
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
  const initial = defaultMonths ?? presets[presets.length - 1]?.months ?? 12
  const [preset, setPreset] = useState(initial)
  const [range, setRange] = useState(() => rangeOf(initial))
  const [set, setSet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [labelled, setLabelled] = useState(true)
  const [record, setRecord] = useState(null)

  /**
   * Whether this screen colours areas by a category or draws features per
   * descriptor. One question, asked once, because it decides three things: which
   * layer is mounted, which key is built from what that layer reports, and
   * whether the label switch is a control or a dead toggle.
   */
  const coloured = Boolean(choropleth)

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

  const [rows, setRows] = useState(null)

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
   * The shape being drawn, and everything that goes with sending it.
   *
   * `shape` is in ground terms -- a centre and a radius in metres -- because
   * that is what was drawn and what the map draws back. The projection it is
   * sent in is applied once, at the moment of saving, so that a shape drawn
   * before the map reported its settings is not stored in the wrong one.
   *
   * `reload` is the one piece of state a save leaves behind. A write changes
   * what the read would answer, and the layer below has no way of knowing that
   * -- so it is told, by a number it refetches on. It is not a placeholder and
   * never reaches a URL.
   */
  const drawable = Boolean(draw?.save?.onSave)
  const [drawing, setDrawing] = useState(false)
  const [shape, setShape] = useState(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [said, setSaid] = useState(null)
  const [reload, setReload] = useState(0)

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
    ...(timeScoped && { from: range.from, to: range.to }),
    ...(dataSrid && { srid: dataSrid })
  }), [context, timeScoped, range.from, range.to, dataSrid])

  // Bindings are a small flat object rebuilt on every render, so the effect below
  // compares them by value; by identity it would refetch on each one.
  const bindingKey = JSON.stringify(bindings)

  /**
   * The rows a coloured map joins onto its geometry.
   *
   * Fetched here rather than by the layer because they are not scoped to the
   * bounding box: the geometry service is asked again on every pause, and asking
   * a whole code list again with it would be a second request per pan for an
   * answer that did not change. It moves when the record or the window does,
   * which is what the bindings say.
   *
   * The layer is not mounted until they arrive -- see below -- so there is no
   * first draw in the fallback colour followed by a corrected one.
   */
  const statusPath = coloured ? choropleth.status : null

  useEffect(() => {
    if (!statusPath) return undefined

    let cancelled = false
    fetchRows(statusPath, bindings).then((next) => {
      if (!cancelled) setRows(next)
    })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusPath, bindingKey])

  /**
   * A hover label for a coloured area, built from the field a row names.
   *
   * The layer takes a function because a caller may want anything; a menu row
   * cannot write one, so it names a field and this is the function. `valueAt`
   * rather than a property read, so a joined column reads like its own.
   */
  const colourTooltip = useMemo(() => {
    const field = choropleth?.tooltip
    if (!field) return undefined
    return (feature) => valueAt(feature?.properties, field) ?? null
  }, [choropleth])

  /**
   * The record on screen, drawn as itself.
   *
   * A service returns the record and whatever it relates to as one kind of
   * thing, because to the service that is what they are. Which of them the user
   * came from is the screen's knowledge, not the service's, so it is applied
   * here: the feature whose identity is the record's gets the caller's
   * descriptor, every other one keeps the one it arrived with.
   */
  const isSubject = (feature) => matchesIdentity(feature, subject?.id, subject?.match)

  /**
   * A click on a feature opens its record -- unless a shape is being drawn.
   *
   * Leaflet passes a click on a vector layer up to the map as well, which is
   * what lets a centre be placed on top of a holding rather than only on open
   * ground. The record pane would open under the same click, covering the map
   * the reader is drawing on, so while the tool is armed the click means one
   * thing only.
   */
  const openRecord = (feature, details) => {
    if (drawing) return
    if (details) setRecord(details)
  }

  const descriptorFor = (feature) => (subject?.descriptor && isSubject(feature) ? subject.descriptor : null)

  // The record the screen is about is never collapsed into a badge. It sits
  // among its own partners, so it is the first thing a cluster swallows -- and
  // the one point whose position every line on the screen is drawn from.
  const isPinnedFeature = (feature) => isSubject(feature)

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

  /**
   * Move the date window, and clear what belonged to the old one.
   *
   * Only when it actually moves. `FeatureSet` refetches on a change to the
   * bindings it is handed, and those carry the dates as strings, so a window
   * resolving to the dates already in force produces no fetch at all -- that is
   * the byte-identical-URL refetch `timeScoped` exists to avoid, working as
   * intended.
   *
   * Clearing the set for a fetch that will not happen is what breaks: nothing
   * arrives to put it back, so `set` stays null for the life of the screen. The
   * map keeps the features it already drew, which is why it looks fine, while
   * the export buttons and the empty-set notice -- both of which wait on a set
   * having arrived -- are simply gone. Clicking the quick range that is already
   * active is the easy way to see it, and the range picker can reach it too by
   * choosing the dates already shown.
   *
   * `preset` is still set either way, since which button reads as pressed is a
   * question about the control rather than about the data.
   */
  const applyWindow = (next, months) => {
    setPreset(months)
    if (sameWindow(next, range)) return
    setRange(next)
    setSet(null)
    setRecord(null)
  }

  const applyPreset = (months) => applyWindow(rangeOf(months), months)

  const onRangeChange = (next) => applyWindow(next, null)

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

  /** Nothing drawn, nothing pending, and no answer left over from last time. */
  const clearDrawing = () => {
    setDrawing(false)
    setShape(null)
    setNote('')
    setSaid(null)
  }

  /**
   * Send the drawn shape to the service the row named.
   *
   * The shape is converted here and nowhere else. A radius is drawn in metres on
   * the ground and stored in the units of whatever projection the deployment
   * keeps geometry in, and the two are the same number only at the equator --
   * at these latitudes a circle sent across unconverted is a fifth too small,
   * silently, in a record nobody re-measures. `unitsPerMetre` asks the
   * projection itself rather than carrying a formula for it.
   *
   * Rounded, because more than one of these services parses its radius as an
   * integer and a decimal point is a rejected save rather than a rounded circle.
   * The centre keeps its decimals: it is read as a pair of doubles everywhere.
   *
   * On success the shape goes away and the layer is told to fetch again, because
   * what is now on the server is not what is on the screen. On failure it stays
   * exactly where it was -- the reader is one button press from trying again,
   * and throwing away a drawn shape to report a failure would be the second
   * thing to go wrong.
   */
  const saveShape = async () => {
    if (!shape || saving) return

    setSaving(true)
    setSaid(null)

    const centre = { lat: shape.lat, lng: shape.lng }
    const { x, y } = pointIn(centre, dataSrid)
    const scale = unitsPerMetre(centre, dataSrid)
    const radius = Math.round(shape.radius * scale)

    const vertices = ringIn(centre, shape.radius, dataSrid, draw.points)

    /**
     * The shape itself, as a ring in the projection the deployment stores.
     *
     * Formatted by the row, because the syntax is the service's and the geometry
     * is this panel's: `point` is a template for one vertex and `join` is what
     * goes between them. The default is a WKT coordinate pair, which is the only
     * spelling that is anybody's standard.
     */
    const ring = vertices
      .map((vertex) => bindPath(draw.ring?.point ?? '{x} {y}', vertex))
      .join(draw.ring?.join ?? ', ')

    /**
     * The same shape, as GeoJSON.
     *
     * Offered beside the ring rather than instead of it: a service that parses
     * the geometry out of a path segment needs the string, and one that reads a
     * body needs this, and which of the two a deployment has is not this panel's
     * to know. A row asking for `{draw.geojson}` gets the object itself, because
     * `fillBody` hands over a sole placeholder unconverted.
     *
     * Closed, unlike the ring: GeoJSON says a linear ring repeats its first
     * position as its last, and the readers that take it enforce that. The ring
     * is left open because the services that parse one close it themselves, and
     * a ring that arrived closed would be closed twice.
     */
    const geojson = {
      type: 'Polygon',
      coordinates: [[...vertices, vertices[0]].map((vertex) => [vertex.x, vertex.y])]
    }

    /**
     * A radius smaller than one unit of the projection it would be sent in.
     *
     * Only when that is what is being sent. `{draw.radius}` is the shape's size
     * in the stored projection, and rounding it is not optional -- more than one
     * of these services parses a radius as an integer. But a deployment storing
     * degrees measures a 720 m circle as 0.0065 of a unit, which rounds to
     * nothing, and a radius of zero is a save that either fails somewhere deep
     * or stores a shape with no extent. A row in that position wants
     * `{draw.metres}` and the ring, neither of which has this problem.
     *
     * Said here, before the request, because this is the one place that knows
     * both numbers. The service cannot tell the difference, and the reader would
     * otherwise be told only that it refused.
     */
    const sendsUnits = [draw.save.onSave, JSON.stringify(draw.save.body ?? null)]
      .some((text) => String(text).includes('{draw.radius}'))

    if (sendsUnits && !(radius >= 1)) {
      setSaving(false)
      setSaid({
        ok: false,
        text: labels.saveTooSmall
          ?? `This deployment stores geometry in EPSG:${dataSrid ?? '?'}, where ${Math.round(shape.radius)} m is less than one unit. Nothing was sent.`
      })
      console.error(
        `perun-atlas: a radius of ${Math.round(shape.radius)} m is ${shape.radius * scale} units in `
        + `EPSG:${dataSrid}, which rounds to zero. A projection measured in degrees cannot carry an `
        + 'integer radius: send {draw.metres} for the size and {draw.ring} for the shape instead.'
      )
      // The path as it reached the browser, because that is the thing to change
      // and the row it came from has already had its %TOKEN%s substituted --
      // so this is the only place the two halves are visible together.
      console.error('perun-atlas: the configured path is', draw.save.onSave)
      return
    }

    const context = {
      ...bindings,
      note,
      draw: {
        lat: shape.lat,
        lng: shape.lng,
        metres: Math.round(shape.radius),
        x,
        y,
        radius,
        ring,
        geojson
      }
    }

    const answer = await postTo(draw.save.onSave, context, {
      body: draw.save.body === undefined ? undefined : fillBody(draw.save.body, context),
      contentType: draw.save.contentType,
      encoding: draw.save.encoding,
      failure: draw.save.failure
    })

    setSaving(false)

    if (answer.ok) {
      clearDrawing()
      setReload((n) => n + 1)
      setSaid({ ok: true, text: labels.saved ?? 'Saved' })
      return
    }

    setSaid({
      ok: false,
      text: [labels.saveFailed ?? 'Could not save', answer.message].filter(Boolean).join(': ')
    })
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
  const filename = [offer?.filename ?? 'features', timeScoped ? `${range.from}_${range.to}` : today()].join('-')

  const saveGeoJSON = () => download(`${filename}.geojson`, toGeoJSON(set), 'application/geo+json')
  const saveCSV = () => download(`${filename}.csv`, toCSV(set, { fields: offer?.fields, exclude: offer?.exclude, labelResolver }), 'text/csv;charset=utf-8')

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
                onStart={() => { setSaid(null); setDrawing(true) }}
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
            something to say: what to click, then the shape's radius and note,
            then what the save answered. A row that is always there is a row of
            empty space on every screen that draws, which is every screen this
            panel renders. */}
        {drawable && (drawing || shape || said) && (
          <DrawBar
            shape={shape}
            drawing={drawing}
            busy={saving}
            said={said}
            limits={draw.radius}
            note={draw.note ? { value: note, onChange: setNote, required: draw.note.required } : undefined}
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
                onDrawn={() => setDrawing(false)}
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

