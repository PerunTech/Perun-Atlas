import { clusterBadge, clusterSettings } from './cluster';

// The set itself holds every layer the draw made whether or not it is what gets added, so the arrows
// and the bounds read it. Only points cluster; the plugin passes lines and polygons through.
export const placeSet = ({ map, factory, group, cluster, points }) => {
  // Empty but on the map when nothing clusters, so the teardown has one shape.
  const pinned = factory.featureGroup().addTo(map);

  const settings = clusterSettings(cluster);

  // The engine is released separately, so a row can ask for clustering it does not carry yet.
  const clusterable = typeof factory.markerClusterGroup === 'function';
  if (settings !== null && !clusterable) {
    console.warn('perun-atlas: clustering was configured, but the map engine on this deployment does not carry it');
  }

  const clustering = settings !== null && clusterable && points >= settings.from;

  const surface = clustering
    ? factory.markerClusterGroup({
      ...settings.options,
      iconCreateFunction: (node) => {
        const { element, size, className } = clusterBadge(node.getChildCount(), settings.badge);
        return factory.divIcon({ html: element, className, iconSize: [size, size] });
      }
    })
    : group;

  surface.addTo(map);

  // Filled only once on the map: `chunkedLoading` chunks only then, and otherwise the tab freezes.
  if (clustering) {
    // Pinned layers, such as the record a screen is about, sit beside the cluster and never collapse.
    const loose = [];
    group.eachLayer((layer) => {
      if (layer._atlasPinned) loose.push(layer);
      else surface.addLayer(layer);
    });
    loose.forEach((layer) => pinned.addLayer(layer));
  }

  // Not into the cluster: it unwraps a decorator, which has no children until added to a map, leaving
  // an empty group and no arrow heads.
  const arrows = clustering ? factory.featureGroup().addTo(map) : surface;

  const holderOf = (layer) => (clustering && layer._atlasPinned ? pinned : surface);

  // The cluster gets its layers in one call each way; one at a time it re-counts every badge after each.
  const move = (list, on, decoratorOf) => {
    const clustered = [];

    list.forEach(({ layer }) => {
      layer._atlasHidden = !on;

      const holder = holderOf(layer);
      if (clustering && holder === surface) clustered.push(layer);
      else if (on) holder.addLayer(layer);
      else holder.removeLayer(layer);

      const decorator = decoratorOf?.get(layer);
      if (decorator && on) arrows.addLayer(decorator);
      else if (decorator) arrows.removeLayer(decorator);
    });

    if (!clustered.length) return;
    if (on) surface.addLayers(clustered);
    else surface.removeLayers(clustered);
  };

  return {
    surface,
    arrows,
    clustering,
    settings,
    layers: arrows === surface ? [surface, pinned] : [surface, arrows, pinned],
    move
  };
};
