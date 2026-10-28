import { applyStyle } from '../dom';

// The plugin lives in the engine: it extends Leaflet, and a copy bundled here would extend a second one.
// Close to Leaflet's zoom animation, so lines settle just after the markers they follow.
const GLIDE = 280;

// `chunkedLoading` keeps a ten-thousand-marker set from freezing the tab. Coverage on hover is off
// because its stock blue outline looks like a highlight. Spiderfy spacing is doubled for our markers.
const DEFAULTS = {
  chunkedLoading: true,
  showCoverageOnHover: false,
  spiderfyDistanceMultiplier: 2
};

// Sized by count rather than coloured, so the badge adds no second colour language to the map.
const BANDS = [
  { upTo: 9, name: 'sm', size: 32 },
  { upTo: 99, name: 'md', size: 38 },
  { upTo: Infinity, name: 'lg', size: 46 }
];

// `true` always clusters, a number clusters from that many points up, and an object adds plugin
// options plus `from`, `className`, `style` and `glide`.
export const clusterSettings = (cluster) => {
  if (!cluster) return null;
  if (cluster === true) return { from: 0, options: { ...DEFAULTS }, badge: {}, glide: GLIDE };
  if (typeof cluster === 'number') return { from: cluster, options: { ...DEFAULTS }, badge: {}, glide: GLIDE };

  // Ours come out first; the rest goes to the plugin.
  const { from = 0, className, style, glide = GLIDE, ...options } = cluster;
  return {
    from,
    options: { ...DEFAULTS, ...options },
    badge: { className, style },
    glide: glide === true ? GLIDE : glide
  };
};

// The chip is a span inside Leaflet's wrapper div, since that div takes no styling of ours.
export const clusterBadge = (count, badge = {}) => {
  const band = BANDS.find(({ upTo }) => count <= upTo) ?? BANDS[BANDS.length - 1];

  const element = document.createElement('span');
  element.className = 'atlas-cluster__count';
  element.textContent = String(count);
  applyStyle(element, badge.style);

  return {
    element,
    size: band.size,
    // A styling hook for deployments; nothing here reads it.
    className: ['atlas-cluster', `atlas-cluster--${band.name}`, badge.className].filter(Boolean).join(' ')
  };
};
