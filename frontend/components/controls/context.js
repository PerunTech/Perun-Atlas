import { React } from 'perun-core';
import { core } from '../../spatial';

const { createContext, useContext } = React;

/**
 * The map an `AtlasMap` is showing, for everything it renders.
 *
 * A control reads its map from here rather than naming the engine's, which is
 * what lets one component serve whichever map it is put on. Today that is
 * always the page's map, the one instance spatial builds as its script
 * evaluates and `AtlasMap` adopts. Once `AtlasMap` builds a map of its own per
 * mount, this is where that map is handed down, and nothing that reads it has
 * to change.
 *
 * Not exported from the package: no consumer reads the map yet, and a screen
 * that needs it has `onReady`.
 */
export const AtlasMapContext = createContext(null);

/**
 * The map this component sits on.
 *
 * Outside an `AtlasMap` there is no map to provide, and the answer is the page's
 * own: a control exported on its own, such as `LegendControl`, goes on working
 * where it worked before. Read at call time, so a test or a page that replaces
 * the engine is followed.
 */
export const useAtlasMap = () => useContext(AtlasMapContext) ?? core.Map;
