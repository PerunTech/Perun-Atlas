import { React, PropTypes, connect, utils } from 'perun-core';
import { FeaturePanel } from './FeaturePanel';

const { labelsManager } = utils;
const { useMemo } = React;

/**
 * A map screen, drawn from a menu button's configuration.
 *
 * This is the whole of what a consuming bundle has to write. A registry that
 * grows a map grows a menu row, not a file:
 *
 *     import { ConfiguredMap } from 'perun-atlas';
 *
 *     <ConfiguredMap
 *       objConfig={mapConfig?.objectConfiguration}
 *       objectId={props.objectId}
 *       labelDomain='<the bundle's own module name>'
 *       onClose={close}
 *     />
 *
 * Everything each consumer used to repeat is here instead: the session out of
 * the store, the label codes resolved against the shell's intl context, the
 * placeholder bindings, the quick ranges, and the guard for a button configured
 * without a service. Four bundles had their own copy of that, and the copies had
 * drifted -- which is the argument for this file rather than a fifth.
 *
 * The shape it reads, all of it optional but `service`:
 *
 *   service       '/WsSomething/get/{session}/{objectId}/{from}/{to}'
 *   context       extra placeholder values, resolved per record. `{session}`,
 *                 `{objectId}` and the date window's `{from}` and `{to}` are
 *                 there already, as is `{srid}` -- the EPSG code this deployment
 *                 stores geometry in, for a service that asks. A bbox-scoped
 *                 path also takes `{map.bbox}`, re-resolved on every pause
 *   descriptors   descriptor name to how it is drawn -- `marker`, `label`,
 *                 `popup`, `details`, `arrow` and `variants`, including their
 *                 `style` keys, which is how a look reaches the screen with no
 *                 stylesheet to name. An optional `legend` code names the kind
 *                 in the key
 *   subject       { descriptor, match } drawn for the record the screen is
 *                 about; its id is the record's own. `match: 'parent'` when the
 *                 service returns the record's children rather than the record,
 *                 so the id to compare is each feature's `parent_id`
 *   cluster       collapse the points into counted badges: `true`, a number to
 *                 cluster only from that many points up, or { from, className,
 *                 style, ...plugin options }. A threshold is usually the right
 *                 answer, because one row serves every record on a screen and
 *                 the records differ by orders of magnitude -- four features on
 *                 one, thousands on the next
 *   presets       [{ months, label }], longest last; `label` is a label code
 *   defaultMonths which of them is selected when the panel opens
 *   labels        the rest of the copy, as label codes -- every key is resolved,
 *                 so a new one needs a menu row and no code here
 *   title         a label code for the heading, when the caller passes no title
 *   map           everything AtlasMap takes: { layerSwitcher, zoomControl,
 *                 zoomPosition, zoomMarks, zoomLabels, coordinates,
 *                 coordinatesPosition, measure,
 *                 measurePosition, measureTools, fullscreen, fullscreenPosition,
 *                 locate, locatePosition, scale, scalePosition, scaleRatio,
 *                 overrides }.
 *                 All of the controls are on unless a row turns one off --
 *                 `"measure": false`, `"locate": false` -- and each takes a
 *                 Leaflet corner. `measureTools` narrows the measure control to
 *                 a chosen few, for a screen with no use for a protractor.
 *
 *                 `"zoomControl": "rail"` swaps the two buttons for a ladder
 *                 from the deployment's minimum zoom to its maximum, carrying
 *                 the current level and marking where the map changes
 *                 behaviour: the basemap's own tile ceiling is marked without
 *                 being asked for, and `zoomMarks` adds a screen's own --
 *                 `[{ "from": 12, "to": 18, "kind": "labels", "label": "..." }]`,
 *                 where `kind` becomes a class and `to` may be left out for a
 *                 line rather than a band. `zoomLabels` is the control's own
 *                 copy, and `"scaleRatio": false` drops the `1:25 000` line the
 *                 scale bar carries under its distance
 *   export        false to withhold the file buttons, or { geojson, csv,
 *                 filename, fields, exclude } to choose the formats, name the
 *                 file, fix the CSV's columns, or drop more of them -- the
 *                 object model's own are out of both the file and the record
 *                 pane already. Absent means the set is offered as a file with
 *                 the defaults
 *   legend        false to withhold the key. On otherwise, and it appears only
 *                 when a set drew more than one kind of thing. It is built from
 *                 what reached the map -- the descriptor names, the variant
 *                 cases and their colours are already configured -- so it needs
 *                 no configuration of its own. A descriptor or case may carry a
 *                 `legend` label code where neither its name nor its case value
 *                 reads well; `labels.legend` names the heading
 *   choropleth    draw the set as areas filled by a category instead of as
 *                 features drawn per descriptor:
 *                 { descriptor, field, palette, fallback, join, status,
 *                   tooltip, unknownLabel }. `descriptor` names one of the
 *                 entries above and carries the outline and the popup; `status`
 *                 is a second service whose rows are joined onto the geometry by
 *                 `join`, since the shapes and the thing colouring them come
 *                 from different places; `field` is where the category is read,
 *                 dotted through the join's `as` key when it lives on a row.
 *                 The service path takes {map.bbox} and is asked again when the
 *                 map stops moving. `legend` above works the same way and is
 *                 built from the bands actually drawn
 *   notice        false withholds the card that says a set came back empty. It
 *                 is the right call on a screen whose empty state is its
 *                 ordinary one -- a map opened to draw something new has nothing
 *                 on it until it is drawn. A screen that draws withholds it
 *                 while a shape is in progress in any case
 *   draw          let the reader draw a shape and send it somewhere:
 *                 { shape: "circle", radius: { min, max, step },
 *                   note: { required }, style, points,
 *                   ring: { point, join },
 *                   save: { onSave, body, contentType, encoding, failure } }.
 *                 `onSave` takes the same placeholders every other path here
 *                 does, plus the shape's own under `{draw.*}` -- `x`, `y` and
 *                 `radius` in the projection this deployment stores geometry in,
 *                 `lat`, `lng` and `metres` on the ground, and two spellings of
 *                 the circle itself: `ring` and `geojson`.
 *
 *                 `ring` is the one a service wants when it parses the geometry
 *                 out of the path -- vertices in the stored projection, which is
 *                 the only form that works when the radius is an integer and the
 *                 deployment stores degrees, where no circle smaller than a
 *                 hundred kilometres can be described at all. `ring: { point,
 *                 join }` spells one vertex and what goes between them.
 *                 `geojson` is the same circle as a closed GeoJSON polygon, for
 *                 a service that reads its geometry from the body; `points` says
 *                 how many vertices either one has, and only the path form is
 *                 bounded by how long a URL may be.
 *
 *                 `body` is a payload template whose strings resolve the same
 *                 way, `{note}` among them -- except that a string which is
 *                 nothing but one placeholder resolves to what it names rather
 *                 than to a printing of it, so `"{draw.geojson}"` carries the
 *                 shape and `"{draw.metres}"` carries a number rather than
 *                 `"5439"`. `contentType` and `encoding` say how it travels:
 *                 `"application/json"` sends it as JSON, and the default is the
 *                 form convention these registries mostly use. `failure` is how
 *                 a refusal reads on a service that answers one with a 200 and a
 *                 string -- which decides what becomes of the drawn shape, not
 *                 what the reader is shown: the answer itself goes to
 *                 `alertUserResponse` as it arrived. The words -- `draw`,
 *                 `radius`, `save`, `saveTooSmall`, `caught` and the rest --
 *                 are label codes in `labels`, like every other word on the
 *                 panel.
 *
 *                 `form` is how a screen says what goes beside the shape
 *                 without waiting for this package to grow another input:
 *                 `{ schema, pick, uiSchema, data }`, an RJSF form rendered in
 *                 the draw row.
 *
 *                 `schema` is either the schema itself or the path to a service
 *                 that answers with one -- an object is the fields, a string is
 *                 where they live. The string is the one to reach for: the
 *                 fields a record is written from are already described by the
 *                 table they belong to, and
 *                 `"/ReactElements/getTableJSONSchema/{session}/TABLE_NAME"` is
 *                 that description. Named rather than copied into the row, a
 *                 field added, renamed, given a code list or made mandatory
 *                 reaches this form on its own.
 *
 *                 `pick` narrows it, and a named schema needs narrowing: a
 *                 table's schema is the whole table, which is a form for a page
 *                 rather than a row under a toolbar. It names fields in the
 *                 order they should appear -- a top-level field by name, a
 *                 field inside a group as `"a.b.FIELD"`, a whole group by
 *                 naming the group -- and `required` is narrowed with them, at
 *                 both levels. The table's own title is dropped, because three
 *                 of its fields are not that table; `ui:title` in `uiSchema`
 *                 puts a heading back. A name the schema does not have is said
 *                 in the console and left off the form.
 *
 *                 Either way the properties may be keyed by grouppath --
 *                 `"a.b"` as one dotted key holding an object -- and the form
 *                 data then comes out in exactly the shape
 *                 `addValueToDataObject` reads on the way in, which is why a
 *                 picked group stays a group rather than being flattened.
 *                 `data` seeds the form, and a discard puts those values back.
 *
 *                 A named schema arrives a request after the rest of the row,
 *                 so the draw row says so where the fields will be and Save
 *                 waits for them. One that never arrives -- an expired session,
 *                 a table this reader may not have -- leaves Save disabled and
 *                 the reason in the console: a record written without the
 *                 fields the form was carrying is worse than one not written.
 *
 *                 That is what lets the body stop naming fields. `"{form}"` is
 *                 the whole of it, and `"..."` spreads it so the geometry can
 *                 sit beside it:
 *
 *                     "body": { "...": "{form}",
 *                               "geometry": "{draw.geojson}",
 *                               "RADIUS": "{draw.metres}" }
 *
 *                 Later keys win, as in an object literal. A nested body means
 *                 `"contentType": "application/json"`: the default form
 *                 encoding cannot carry one, and a grouppath key must arrive
 *                 whole -- the backend looks the dotted string up as a single
 *                 key, and a body that split or flattened it has every field in
 *                 that group skipped without a word.
 *
 *                 The radius stays its own native input rather than a schema
 *                 field. It is bound to the map in both directions, and RJSF
 *                 reports a change per keystroke -- so a circle would collapse
 *                 while its radius was being retyped.
 *
 *                 `select` asks the other question a drawn shape answers: which
 *                 of the features on screen it covers. `true` for the defaults,
 *                 or `{ mode, id, join, export }`. The count appears beside the
 *                 radius and moves as the radius is typed; the file buttons
 *                 write what was caught rather than the whole set, unless
 *                 `"export": false`; and the save body gains
 *                 `{draw.selected.count}`, `{draw.selected.ids}` and
 *                 `{draw.selected.geojson}`, so a shape can be posted together
 *                 with the records it covers. `mode` is `"touches"` -- anything
 *                 reaching into the circle -- or `"contains"` for wholly
 *                 inside. `id` and `join` spell the identifier list exactly as
 *                 `ring.point` and `ring.join` spell a ring, and default to
 *                 `"{pkid}"` and `","`.
 *
 *                 It is answered in the browser, over the set the layer
 *                 fetched. For a feature set, which arrives complete in one
 *                 response, that is the whole of it. A screen colouring areas
 *                 from a bounding box holds only what is in view, so a radius
 *                 reaching past the edge of the map would be answered from a
 *                 set that stops there -- that screen wants a service that
 *                 takes the circle, which this is not.
 *
 *                 A row may ask for `select` with no `save`: a screen that
 *                 draws a radius only to see what falls inside it never sends
 *                 the shape anywhere, and the row then offers no Save button
 *   tokens        CSS custom properties: { "--ap-accent": "#6a1b9a", ... }
 *
 * Rendered inside the shell, so `connect` has a store above it. An explicit
 * `session` prop still wins -- see `mapStateToProps`.
 *
 * @param {Object} objConfig      - The button's objectConfiguration.
 * @param {string|number} objectId - The record the screen is about.
 * @param {string} labelDomain    - The consumer's module name, as labelsManager
 *        spells it ('farm_registry'), which is the one thing about a consuming
 *        bundle this package cannot work out for itself.
 */
export const ConfiguredMap = (props, context) => {
  const { objConfig, objectId, session, labelDomain = 'main', title, className, onClose } = props;

  /**
   * A label code, resolved, or nothing.
   *
   * `labelsManager` answers a missing key with the key's own message id -- it
   * passes one as `defaultMessage` -- which on screen reads as
   * `perun.some_module.range_hint` in the middle of a sentence. Undefined
   * instead, so the panel's own neutral wording shows until the label is
   * registered.
   */
  const getLabel = (code) => {
    if (!code) return undefined;
    const value = labelsManager(code, context, labelDomain);
    return !value || value === `perun.${labelDomain}.${code}` ? undefined : value;
  };

  const bindings = useMemo(() => ({
    session,
    objectId,
    ...(objConfig?.context || {})
  }), [session, objectId, objConfig]);

  const presets = useMemo(
    () => (objConfig?.presets || []).map(({ months, label }) => ({ months, label: getLabel(label) ?? `${months}` })),
    // getLabel closes over the intl context, which changes with the locale and is
    // not a value this can depend on; the configuration is what varies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [objConfig]
  );

  /**
   * Every configured label code, resolved by key.
   *
   * Resolved as a map rather than key by key so that adding a word to the panel
   * is a menu row and a change in `FeaturePanel`, never a line here forwarding
   * it. A key the panel does not know is passed through and ignored, which is
   * the harmless half of that trade.
   */
  const labels = useMemo(
    () => Object.fromEntries(
      Object.entries(objConfig?.labels || {}).map(([key, code]) => [key, getLabel(code)])
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [objConfig]
  );

  const service = objConfig?.service;

  if (!service) {
    return (
      <div className='atlas-panel-unavailable'>
        {getLabel('map_service_missing') ?? 'This button has no map service configured.'}
      </div>
    );
  }

  return (
    <FeaturePanel
      session={session}
      servicePath={service}
      context={bindings}
      descriptors={objConfig?.descriptors || {}}
      // Descriptors are handed over as configured, so the label codes their
      // popups carry are resolved where every other code on this panel is.
      labelResolver={getLabel}
      cluster={objConfig?.cluster}
      subject={objConfig?.subject ? { ...objConfig.subject, id: objectId } : undefined}
      title={title ?? getLabel(objConfig?.title)}
      presets={presets}
      defaultMonths={objConfig?.defaultMonths}
      map={objConfig?.map}
      choropleth={objConfig?.choropleth}
      draw={objConfig?.draw}
      exportable={objConfig?.export}
      legend={objConfig?.legend}
      notice={objConfig?.notice}
      tokens={objConfig?.tokens}
      labels={labels}
      className={className}
      onClose={onClose}
    />
  );
};

ConfiguredMap.contextTypes = {
  intl: PropTypes.object.isRequired
};

/**
 * The session, from the store unless the caller named one.
 *
 * `connect` puts state props after own props when it merges, so the default
 * would be the store overriding an explicit `session`. Reading `ownProps` here
 * puts it back the other way round: configuration wins, the store is the
 * fallback, and a caller holding a session for another reason can still say so.
 */
const mapStateToProps = (state, ownProps) => ({
  session: ownProps.session ?? state?.security?.svSession
});

export default connect(mapStateToProps)(ConfiguredMap);
