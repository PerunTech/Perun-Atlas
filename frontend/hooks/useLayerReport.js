import { React } from 'perun-core';

const { useState } = React;

// FeatureSet and Choropleth take the same callbacks, so the panel can mount either as a branch.
export const useLayerReport = ({ coloured }) => {
  const [set, setSet] = useState(null);
  const [loading, setLoading] = useState(true);

  // One piece of state, in whichever shape the mounted layer reports, so no stale half is left behind.
  const noneDrawn = coloured ? { values: [], usedFallback: false } : [];
  const [drawn, setDrawn] = useState(noneDrawn);

  // What a circle counts and the file buttons write. Null wherever `set` is, so a moved window that
  // hasn't been fetched offers nothing.
  const [shown, setShown] = useState(null);
  const visible = set === null ? null : (shown ?? set);

  const [extent, setExtent] = useState(null);

  // The open record survives a fetch. Opening the pane narrows the map, which fires `moveend` and, on
  // a bbox layer, a fetch; clearing the record here closed the pane right after it opened.
  const onFetchStart = () => {
    setLoading(true);
    setDrawn(noneDrawn);
  };

  const onFetched = (collection) => {
    setSet(collection ?? { features: [] });
    setLoading(false);
  };

  // The layer reports nothing on failure, so clear what the last good set left.
  const onFetchFailed = () => {
    setSet({ features: [] });
    setShown(null);
    setExtent(null);
    setLoading(false);
  };

  return {
    set,
    visible,
    loading,
    drawn,
    extent,
    setDrawn,
    setShown,
    setExtent,
    onFetchStart,
    onFetched,
    onFetchFailed,
    forget: () => setSet(null)
  };
};
