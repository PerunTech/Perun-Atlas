import { React, ReactDOM } from 'perun-core';
import { core } from '../../spatial';
import { useAtlasMap } from '../context';

const { factory } = core;
const { useEffect, useLayoutEffect, useState } = React;

// Built on first use: at import time the engine's factory may not exist yet.
let Host = null;

const hostControl = () => {
  if (!Host) {
    Host = factory.Control.extend({
      onAdd () { return this.options.container; }
    });
  }
  return Host;
};

// The container is made once and kept, since replacing it would unmount the tree inside and lose its
// state. Added in a layout effect, so controls rendered together arrive in render order.
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

export const MapControl = ({ position, shown = true, children }) =>
  ReactDOM.createPortal(children, useControlHost(position, shown));

// The engine deploys separately, so it may predate a tool a control calls; skipping keeps the map up.
export const Skipped = ({ what }) => {
  useEffect(() => {
    console.warn(`perun-atlas: the engine on this environment has no ${what}; skipping it.`);
  }, [what]);
  return null;
};

// Leaflet passes a control's clicks and wheels on to the map. Module-level so the ref keeps its
// identity and the listeners are added once.
export const containEvents = (node) => {
  if (!node) return;
  factory.DomEvent.disableClickPropagation(node);
  factory.DomEvent.disableScrollPropagation(node);
};
