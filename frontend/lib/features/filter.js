// Hiding takes layers off the map rather than making them transparent, since a see-through feature
// still takes clicks, counts in a cluster and goes into the file.
// Only the changes. Each member's `hidden` is updated in place, so the next call measures from here.
export const changesFor = (members, hidden = []) => {
  const off = new Set(hidden);
  const leaving = [];
  const returning = [];

  members.forEach((member) => {
    const hide = off.has(member.key);
    if (hide === Boolean(member.hidden)) return;
    member.hidden = hide;
    (hide ? leaving : returning).push(member);
  });

  return { leaving, returning };
};

// A layer put back on the map comes back on top, so the shown ones are brought to the front in draw
// order, then the arrow heads, so no line covers another's heads.
export const restack = (members, decoratorOf) => {
  const shown = members.filter(({ hidden }) => !hidden);
  shown.forEach(({ layer }) => layer.bringToFront?.());
  shown.forEach(({ layer }) => decoratorOf?.get(layer)?.bringToFront?.());
};

// Filtered from the collection, so features Leaflet drew nothing for still export. The same object
// when nothing is hidden.
export const shownOf = (collection, hidden = [], keyOf) => {
  const features = collection?.features;
  if (!Array.isArray(features) || !hidden.length) return collection;

  const off = new Set(hidden);
  const kept = features.filter((feature) => !off.has(keyOf(feature)));

  return kept.length === features.length ? collection : { ...collection, features: kept };
};

// Frames the shown features, or all of them when everything is off. Read off the layers, which are in
// the map's coordinates; the response is in stored units. Plain numbers, so no engine is needed to hold it.
export const extentOf = (members) => {
  const shown = members.filter((member) => !member.hidden);
  let south = Infinity;
  let west = Infinity;
  let north = -Infinity;
  let east = -Infinity;

  const take = ({ lat, lng }) => {
    south = Math.min(south, lat);
    west = Math.min(west, lng);
    north = Math.max(north, lat);
    east = Math.max(east, lng);
  };

  (shown.length ? shown : members).forEach(({ layer }) => {
    if (typeof layer.getBounds === 'function') {
      const bounds = layer.getBounds();
      if (bounds?.isValid?.()) {
        take(bounds.getSouthWest());
        take(bounds.getNorthEast());
      }
    } else if (typeof layer.getLatLng === 'function') {
      take(layer.getLatLng());
    }
  });

  return south === Infinity ? null : [[south, west], [north, east]];
};
