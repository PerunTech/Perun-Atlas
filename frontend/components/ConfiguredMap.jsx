import { React, connect, useIntl, utils } from 'perun-core';
import { FeaturePanel } from './FeaturePanel';
import { UnavailableCard } from './notices/UnavailableCard';
import { takeLink } from '../lib/link';
import { say } from '../lib/notices';

const { labelsManager } = utils;
const { useMemo, useState } = React;

// A map screen from a menu button's objectConfiguration. The keys it reads are documented in
// `docs/menu-row.md`; a key added here is a line added there.
export const ConfiguredMap = (props) => {
  const intl = useIntl();
  const { objConfig, objectId, session, labelDomain = 'main', title, className, linkId, onClose } = props;

  const [linked] = useState(() => takeLink(window.location.href, linkId));

  // labelsManager answers a missing key with its own message id; undefined lets the panel's neutral
  // wording show instead.
  const getLabel = (code) => {
    if (!code) return undefined;
    const value = labelsManager(code, intl, labelDomain);
    return !value || value === `perun.${labelDomain}.${code}` ? undefined : value;
  };

  const bindings = useMemo(() => ({
    session,
    objectId,
    ...(objConfig?.context || {})
  }), [session, objectId, objConfig]);

  const presets = useMemo(
    () => (objConfig?.presets || []).map(({ months, label }) => ({ months, label: getLabel(label) ?? `${months}` })),
    // getLabel is rebuilt every render; what it reads is intl and labelDomain.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [objConfig, intl, labelDomain]
  );

  const labels = useMemo(
    () => Object.fromEntries(
      Object.entries(objConfig?.labels || {}).map(([key, code]) => [key, getLabel(code)])
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [objConfig, intl, labelDomain]
  );

  const service = objConfig?.service;

  if (!service) {
    const details = `The button${linkId ? ` ${linkId}` : ''} has no "service" in its objectConfiguration.`;
    return (
      <UnavailableCard
        className='atlas-panel-unavailable'
        icon='map'
        title={say('noService', labels)}
        hint={getLabel('map_service_missing') ?? say('noServiceHint', labels)}
        details={details}
        copy={details}
        labels={labels}
      />
    );
  }

  return (
    <FeaturePanel
      session={session}
      servicePath={service}
      context={bindings}
      descriptors={objConfig?.descriptors || {}}
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
      overlay={objConfig?.overlay}
      legend={objConfig?.legend}
      notice={objConfig?.notice}
      tokens={objConfig?.tokens}
      labels={labels}
      view={linked ?? undefined}
      linkId={linkId}
      link={objConfig?.link}
      className={className}
      onClose={onClose}
    />
  );
};

// `connect` merges state props over own props; reading ownProps lets an explicit `session` win.
const mapStateToProps = (state, ownProps) => ({
  session: ownProps.session ?? state?.security?.svSession
});

export default connect(mapStateToProps)(ConfiguredMap);
