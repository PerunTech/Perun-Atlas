import { React } from 'perun-core';
import { core } from '../spatial';

const { createContext, useContext } = React;

// Each AtlasMap builds its own map and hands it down here, so two on one page each draw on their own.
export const AtlasMapContext = createContext(null);

// Outside an AtlasMap, the page's own map, so a control used on its own keeps working.
export const useAtlasMap = () => useContext(AtlasMapContext) ?? core.Map;
