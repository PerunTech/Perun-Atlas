import { React, ReactDOM } from 'perun-core';
import { core } from '../../spatial';
import { useAtlasMap } from '../context';

const { factory } = core;
const { useEffect, useLayoutEffect, useState } = React;

/**
 * A Leaflet control that holds whatever container it is handed, and nothing
 * else.
 *
 * Built on first use rather than at import, because `factory` is the engine's
 * and a module evaluating before it would extend nothing.
 */
let Host = null;

const hostControl = () => {
  if (!Host) {
    Host = factory.Control.extend({
      onAdd () { return this.options.container; }
    });
  }
  return Host;
};

/**
 * A corner of the map for a React tree to render into.
 *
 * Returns the control's container, made once and kept: replacing it would take
 * the tree inside it down too, and with it any state a reader has set, such as
 * a collapsed key. The control goes on the map while `shown` holds and comes off
 * with the component, since a control is not a layer and nothing else takes it
 * off a map that outlives the screen.
 *
 * This replaces spatial's `control()`, which this package used to mount its
 * controls with. That function renders a component into a root of its own,
 * once, at `onAdd`, and always onto the page's map. A tree portalled into this
 * container is part of the screen's own tree instead: its props update in
 * place, and the older render cycle's sweep, which unmounts every root it finds
 * in a control, has no root here to find. (It also takes every control out of
 * the page's map's corners, and only that map's, so it does not reach the map
 * an `AtlasMap` builds.) The container is the same `div.leaflet-control`
 * that `control()` made, so the markup does not change.
 *
 * Added in a layout effect, so the control is on the map within the commit
 * that renders it, and controls rendered together arrive in the order they
 * render: a corner shows its controls in the order they arrive.
 *
 * @param {string} position - Any corner of the map, `bottomcenter` included
 *        where the engine has it.
 * @param {boolean} [shown] - Off takes the control off the map and leaves the
 *        tree mounted in its container.
 */
export const useControlHost = (position, shown = true) => {
  const map = useAtlasMap();
  const [container] = useState(() => factory.DomUtil.create('div', 'leaflet-control'));

  useLayoutEffect(() => {
    if (!shown) return undefined;

    const Control = hostControl();
    const added = new Control({ position, container }).addTo(map);
    return () => { added.remove(); };
  }, [map, position, shown, container]);

  return container;
};

/**
 * `useControlHost` as a component: renders its children in a corner of the map.
 */
export const MapControl = ({ position, shown = true, children }) =>
  ReactDOM.createPortal(children, useControlHost(position, shown));

/**
 * What a control renders where the engine lacks what it is built on.
 *
 * This bundle and the engine deploy separately, so an environment can be
 * serving a spatial older than the tools a control calls. Skipping the control
 * with a warning leaves the rest of the map standing.
 *
 * @param {string} what - The control, as the warning names it.
 */
export const Skipped = ({ what }) => {
  useEffect(() => {
    console.warn(`perun-atlas: the engine on this environment has no ${what}; skipping it.`);
  }, [what]);
  return null;
};

/**
 * A ref that keeps clicks and wheels inside a node from reaching the map.
 *
 * Leaflet passes events from a control's container on to the map unless told
 * not to, so a click on a button also lands on the map, a drag on a slider pans
 * it and a wheel over a long list zooms it. Module-level and stable, because a
 * ref callback that changes identity is called again on every render, and each
 * call would add the same listeners a second time.
 */
export const containEvents = (node) => {
  if (!node) return;
  factory.DomEvent.disableClickPropagation(node);
  factory.DomEvent.disableScrollPropagation(node);
};
