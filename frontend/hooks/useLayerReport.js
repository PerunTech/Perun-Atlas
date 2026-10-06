import { React } from 'perun-core';

const { useState } = React;

/**
 * What the layer on the map last reported, and the callbacks it reports through.
 *
 * `FeatureSet` and `Choropleth` are handed the same callbacks. That is what lets
 * the panel mount one or the other as a branch rather than as a second panel,
 * and it is why this holds the answers for both.
 *
 * @param {Object} params
 * @param {boolean} params.coloured - Whether the layer is `Choropleth`, which
 *        reports what it drew in a shape of its own. See `drawn`.
 * @returns {Object} `set`, `visible`, `loading`, `drawn` and `extent`; the
 *          layer's callbacks, `onFetchStart`, `onFetched`, `onFetchFailed`,
 *          `setDrawn`, `setShown` and `setExtent`; and `forget`, for a date
 *          window that has moved.
 */
export const useLayerReport = ({ coloured }) => {
  const [set, setSet] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * What the layer last reported it drew, in that layer's own shape.
   *
   * `FeatureSet` reports a list of kinds; `Choropleth` reports
   * `{ values, usedFallback }`. Kept as one piece of state rather than two
   * because only one layer is ever mounted, and two would mean a stale half
   * sitting beside the live one waiting to be read by mistake.
   */
  const noneDrawn = coloured ? { values: [], usedFallback: false } : [];
  const [drawn, setDrawn] = useState(noneDrawn);

  /**
   * The set as the reader sees it, as the layer last reported it: the fetched
   * collection itself while nothing is switched off, a copy without the hidden
   * kinds otherwise.
   *
   * What a circle counts and what the file buttons write, because both are
   * about what is on the screen -- the file buttons already follow a circle for
   * the same reason. `set` stays the whole response, for the one question that
   * is about the response: whether anything came back at all.
   *
   * Null wherever `set` is, so a window that has moved and not yet been fetched
   * offers nothing rather than the last window's features.
   */
  const [shown, setShown] = useState(null);
  const visible = set === null ? null : (shown ?? set);

  /** Where the shown features are, for the zoom control's button that frames them. */
  const [extent, setExtent] = useState(null);

  /**
   * A fetch is starting.
   *
   * The open record deliberately survives it. What the pane holds is a resolved
   * copy of one feature's rows, not a live view of the layer, so nothing about
   * it goes stale when the set is redrawn -- and clearing it here closed the
   * pane a click had just opened. The sequence was its own cause: a click opens
   * the pane, the pane is what makes the map narrower, a narrower map is an
   * `invalidateSize`, and `invalidateSize` fires `moveend`, which a bbox-scoped
   * layer answers with a fetch. The pane then closed itself a quarter of a
   * second after opening, widening the map and starting a second fetch on the
   * way out.
   *
   * It also closed the pane on every ordinary pan, which is the same fault
   * without the self-inflicted part: a reader who opens a record and nudges the
   * map loses what they were reading.
   *
   * The clears that mean something stay where they are. `applyWindow` empties
   * the record when the date window moves, because that is a different set
   * rather than the same one fetched again.
   */
  const onFetchStart = () => {
    setLoading(true);
    setDrawn(noneDrawn);
  };

  /** A fetch answered. A response with no collection in it is an empty set. */
  const onFetched = (collection) => {
    setSet(collection ?? { features: [] });
    setLoading(false);
  };

  /**
   * A fetch failed, so there is no set: nothing to show, count or frame. The
   * layer reports none of these on a failure, so without this the last good
   * set's would stay behind the empty one.
   */
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
    // The window moved: the set held is the last window's, and nothing yet is
    // this one's.
    forget: () => setSet(null)
  };
};
