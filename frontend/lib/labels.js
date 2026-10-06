import { labelVisible } from '../appearance/descriptor';
import { applyStyle, asNode } from './dom';

/**
 * A feature's permanent label: binding it to the layer, and keeping it to the
 * zoom band its descriptor allows.
 *
 * Takes the layers and the zoom as arguments rather than reading the engine, so
 * a test can hand it both.
 */

/**
 * Bind a label to a feature's layer.
 *
 * A point's label sits above it, not on it: a pill wide enough to hold an
 * identifier covers a marker completely, and then the label is readable but the
 * thing it names is not. An area has room for both, so its label stays in the
 * middle.
 *
 * @param {Object} layer      - The feature's layer.
 * @param {Object} feature
 * @param {Object} descriptor - The descriptor it is drawn with, variant merged in.
 * @param {*} text            - What the label says. Rendered as text, never as markup.
 * @returns {boolean} Whether the label is banded by zoom, so `syncLabels` has to
 *          follow it.
 */
export const bindLabel = (layer, feature, descriptor, text) => {
  const point = /Point$/.test(feature.geometry?.type ?? '');
  const clearance = (descriptor.marker?.size ?? 24) / 2;

  // Permanent, because a label of this kind names a feature rather
  // than explains it — a hover tooltip would hide the thing read.
  //
  // A text node, not the string. Leaflet applies string content with
  // innerHTML, and `text` is a record's field — so a holding named
  // with anything that parses as markup was parsed as markup.
  layer.bindTooltip(asNode(text), {
    permanent: true,
    direction: descriptor.label?.direction ?? (point ? 'top' : 'center'),
    offset: descriptor.label?.offset ?? (point ? [0, -clearance] : [0, 0]),
    // A descriptor may add a class of its own, so one label can be
    // marked out from the rest without restyling all of them.
    className: ['atlas-label', descriptor.label?.className].filter(Boolean).join(' '),
    // Opaque: Leaflet sets this inline, so a translucent label cannot
    // be made solid from a stylesheet, and translucent text over a
    // basemap is the thing being fixed.
    opacity: 1
  });
  // Same as a marker's: the pill is Leaflet's element, and it is
  // built when the tooltip opens, which a zoom band may do long after
  // this runs and more than once.
  if (descriptor.label?.style) {
    layer.on('tooltipopen', (event) => applyStyle(event.tooltip.getElement(), descriptor.label.style));
  }

  return Boolean(descriptor.label?.scale);
};

/**
 * Open the banded labels this zoom allows, and close the rest.
 *
 * Permanent labels are banded by zoom, so they follow the zoom rather than the
 * fetch.
 *
 * @param {Array} labelled - `{ layer, descriptor }` for each banded label.
 * @param {number} zoom
 */
export const syncLabels = (labelled, zoom) => {
  labelled.forEach(({ layer, descriptor }) => {
    // Not on the map, so not ours to open. Leaflet places a label by
    // asking the layer where its middle is, and a line or an area answers
    // that by throwing when it is off the map. Putting it back reopens the
    // label, and the sync after the layer's filter corrects it for the band.
    if (layer._atlasHidden) return;

    const wanted = labelVisible(descriptor, zoom);

    /**
     * Nothing to do when the label is already in the state it should be in.
     *
     * Worth checking rather than just calling: `Layer.openTooltip` runs
     * `_prepareOpen` -- which walks the layer for a position -- *before*
     * Leaflet's own "this tooltip is already on the map" guard, so the
     * cheap case is only cheap if we take it ourselves. This runs on every
     * `moveend` while a set is clustered, which is every pan.
     *
     * It stays correct through the cluster because a permanent tooltip
     * closes itself with its marker (`remove: closeTooltip`) and reopens
     * when the cluster hands the marker back (`add: _openTooltip`). So a
     * marker returned at a zoom its band forbids reads as open here, which
     * is exactly the state this has to correct.
     */
    if (wanted === layer.isTooltipOpen()) return;

    if (wanted) layer.openTooltip();
    else layer.closeTooltip();
  });
};
