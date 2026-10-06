import { React } from 'perun-core';
import { core } from '../spatial';

const { createContext, useContext } = React;

/**
 * The map an `AtlasMap` is showing, for everything it renders.
 *
 * A control or a layer reads its map from here rather than naming the
 * engine's, which is what lets one component serve whichever map it is put on.
 * Each `AtlasMap` builds a map of its own, and this is where it hands that map
 * down, so two of them on one page each draw on their own.
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
