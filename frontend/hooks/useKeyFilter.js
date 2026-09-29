import { React } from 'perun-core';

const { useEffect, useRef } = React

/**
 * The key's switched-off rows, as a layer that draws asynchronously needs them.
 *
 * Shared by `FeatureSet` and `Choropleth`, which take `hidden` the same way:
 * a draw applies the keys current when its response lands, and leaves behind
 * how to apply the next ones without a fetch.
 *
 * `hiddenRef` is a ref as well as the prop because a draw is asynchronous. The
 * keys it has to apply are the ones current when the response lands, which may
 * be a click later than when the request went out.
 *
 * `filterRef` is how the draw now on the map applies a new set of keys, or null
 * between draws. The draw sets it, because only the draw knows where its layers
 * live, and its teardown clears it.
 *
 * @param {Array} hidden - The legend keys switched off.
 * @returns {{ hiddenRef: Object, filterRef: Object }}
 */
export const useKeyFilter = (hidden) => {
  const hiddenRef = useRef(hidden)
  hiddenRef.current = hidden

  const filterRef = useRef(null)

  // A click in the key, applied to the set already drawn -- not a fetch.
  // Compared by value, like a layer's context: a caller may build the array
  // afresh on every render.
  const hiddenKey = JSON.stringify(hidden)
  useEffect(() => {
    filterRef.current?.(hidden)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hiddenKey])

  return { hiddenRef, filterRef }
}
