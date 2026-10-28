import { labelVisible } from '../../appearance/descriptor';
import { applyStyle, asNode } from '../dom';

// A point's label sits above it, since a pill wide enough for an identifier would cover the marker.
// Returns whether the label is zoom-banded, so syncLabels has to follow it.
export const bindLabel = (layer, feature, descriptor, text) => {
  const point = /Point$/.test(feature.geometry?.type ?? '');
  const clearance = (descriptor.marker?.size ?? 24) / 2;

    // A text node, since Leaflet applies string content with innerHTML.
  layer.bindTooltip(asNode(text), {
    permanent: true,
    direction: descriptor.label?.direction ?? (point ? 'top' : 'center'),
    offset: descriptor.label?.offset ?? (point ? [0, -clearance] : [0, 0]),
    className: ['atlas-label', descriptor.label?.className].filter(Boolean).join(' '),
    // Leaflet sets opacity inline, so a stylesheet cannot make a translucent label solid.
    opacity: 1
  });
  // The pill is Leaflet's and rebuilt on every open, so its style is applied then.
  if (descriptor.label?.style) {
    layer.on('tooltipopen', (event) => applyStyle(event.tooltip.getElement(), descriptor.label.style));
  }

  return Boolean(descriptor.label?.scale);
};

export const syncLabels = (labelled, zoom) => {
  labelled.forEach(({ layer, descriptor }) => {
    // A line or area off the map throws when Leaflet asks it where to put the label.
    if (layer._atlasHidden) return;

    const wanted = labelVisible(descriptor, zoom);

    // Checked here because openTooltip walks the layer for a position before Leaflet's own guard, and
    // this runs on every pan while a set is clustered.
    if (wanted === layer.isTooltipOpen()) return;

    if (wanted) layer.openTooltip();
    else layer.closeTooltip();
  });
};
