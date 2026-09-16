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
 *   context       extra placeholder values, resolved per record
 *   descriptors   descriptor name to how it is drawn -- `marker`, `label` and
 *                 `popup`, including their `style` keys, which is how a look
 *                 reaches the screen with no stylesheet to name
 *   subject       { descriptor } drawn for the record the screen is about; its
 *                 id is the record's own
 *   presets       [{ months, label }], longest last; `label` is a label code
 *   defaultMonths which of them is selected when the panel opens
 *   labels        the rest of the copy, as label codes -- every key is resolved,
 *                 so a new one needs a menu row and no code here
 *   title         a label code for the heading, when the caller passes no title
 *   map           { layerSwitcher, zoomControl, zoomPosition, coordinates,
 *                 coordinatesPosition }, passed to AtlasMap. The coordinate
 *                 readout is on unless a row says `"coordinates": false`
 *   export        false to withhold the file buttons, or { geojson, csv,
 *                 filename, fields, exclude } to choose the formats, name the
 *                 file, fix the CSV's columns, or drop more of them -- the
 *                 object model's own are out of both the file and the record
 *                 pane already. Absent means the set is offered as a file with
 *                 the defaults
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
      subject={objConfig?.subject ? { ...objConfig.subject, id: objectId } : undefined}
      title={title ?? getLabel(objConfig?.title)}
      presets={presets}
      defaultMonths={objConfig?.defaultMonths}
      map={objConfig?.map}
      exportable={objConfig?.export}
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
