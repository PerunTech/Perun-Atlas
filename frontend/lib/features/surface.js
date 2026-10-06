import { clusterBadge, clusterSettings } from './cluster';

/**
 * Where a drawn set goes on the map, and how its layers come and go from there.
 *
 * `cluster.js` settles what the plugin is asked for; this is where the answer is
 * put on the map. `filter.js` decides which layers move when the key changes;
 * this moves them, because it is the part that knows where each one lives.
 *
 * Handed the map and the engine's factory rather than importing the engine, so
 * a test can give it both.
 */

/**
 * Put a drawn set on the map: the set itself, or a cluster over it.
 *
 * The set is built either way, and is what holds every layer the draw made
 * whether or not it is the thing added -- which is why the arrows and the
 * bounds both read it rather than the surface. The cluster reads it too, and
 * takes a copy of what it finds rather than emptying it.
 *
 * Only points cluster. The plugin sorts a mixed group itself: anything with no
 * position -- a line, a polygon, an arrow decorator -- goes to a layer of its
 * own that is added to the map unchanged, so a set of shapes with points among
 * them keeps its shapes.
 *
 * @param {Object} params
 * @param {Object} params.map     - The Leaflet map.
 * @param {Object} params.factory - The engine's factory.
 * @param {Object} params.group   - The set, as `factory.geoJSON` built it. A
 *        layer a row pinned carries `_atlasPinned`.
 * @param {boolean|number|Object} [params.cluster] - The row's `cluster`.
 * @param {number} params.points  - How many markers the draw produced.
 * @returns {Object} `surface`, the group on the map that holds the features;
 *          `arrows`, the group the arrow decorators go in; `clustering` and
 *          `settings`; `layers`, everything to take off the map again; and
 *          `move`, which takes layers off the map and puts them back.
 */
export const placeSet = ({ map, factory, group, cluster, points }) => {
  // Where pinned layers go when there is a cluster. Empty and on the map
  // otherwise, which costs nothing and keeps the teardown one shape.
  const pinned = factory.featureGroup().addTo(map);

  const settings = clusterSettings(cluster);

  /*
   * The clustering is the engine's, and the engine is a separate artefact
   * on a separate release cycle -- so a menu row can ask for it on a
   * deployment whose engine predates it. Drawn plainly rather than thrown
   * at, which is the same detection `AtlasMap` does for the bottom-centre
   * corner, and said out loud because a row asking for something it cannot
   * have is worth knowing about.
   */
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

  // After the line above, not instead of it. `chunkedLoading` only chunks
  // when the group it is adding into is already on a map; handed the
  // layers first, the plugin adds them in one pass and the tab freezes for
  // exactly the sets this exists for.
  if (clustering) {
    /**
     * Everything except what a row pinned.
     *
     * The subject is the one point the screen exists to show, and it sits
     * in the middle of its own partners -- so it is the first thing a
     * badge swallows and the last thing that should vanish. Pinned layers
     * go to the map beside the cluster, where they are drawn at their own
     * position at every zoom.
     */
    const loose = [];
    group.eachLayer((layer) => {
      if (layer._atlasPinned) loose.push(layer);
      else surface.addLayer(layer);
    });
    loose.forEach((layer) => pinned.addLayer(layer));
  }

  /**
   * Where the arrow decorators go.
   *
   * Not into the cluster. A decorator is itself a layer group, and a
   * cluster group unwraps any group it is handed and keeps the children --
   * of which a decorator has none until something adds it to a map. Its
   * `onAdd` is what draws the heads, and the `moveend` it binds there is
   * what keeps them on the line as the view changes. Unwrapped, it is an
   * empty group: no heads, and nothing left to draw them later.
   *
   * So when there is a cluster the decorators get a group of their own
   * beside it, and otherwise they join the set exactly as they always
   * have.
   */
  const arrows = clustering ? factory.featureGroup().addTo(map) : surface;

  /**
   * Where a feature layer lives while it is shown.
   *
   * The set itself when nothing clusters. Clustered, the cluster -- or
   * the pinned group beside it, for the layers a row said must never be
   * collapsed -- exactly as the layers were shared out above.
   */
  const holderOf = (layer) => (clustering && layer._atlasPinned ? pinned : surface);

  /**
   * Take members off the map, or put them back.
   *
   * Off the map rather than faded, so a hidden feature takes no click,
   * counts in no badge and opens no popup. Its arrow heads go with it,
   * and so does its label, which Leaflet closes with the layer.
   *
   * The cluster is handed its layers in one call each way. Given them one
   * at a time it re-counts every badge after each, which on the sets it
   * exists for is the difference between a click and a stall. The plugin
   * chunks a very large `addLayers` over several frames; the lines are
   * re-aimed as soon as this returns, so on such a set they catch up with
   * the last chunk on the next pan.
   *
   * @param {Array} list - Members, `{ layer }`, as `changesFor` returned them.
   * @param {boolean} on - Put back rather than take off.
   * @param {WeakMap} [decoratorOf] - Line layer -> its arrow decorator.
   */
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
