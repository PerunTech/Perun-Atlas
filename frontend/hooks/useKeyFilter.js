import { React } from 'perun-core';

const { useEffect, useRef } = React;

// A draw is asynchronous, so it applies the keys current when its response lands, via `hiddenRef`.
// `filterRef` is set by the draw on the map, the only thing that knows where its layers live.
export const useKeyFilter = (hidden) => {
  const hiddenRef = useRef(hidden);
  hiddenRef.current = hidden;

  const filterRef = useRef(null);

  // A click in the key re-filters the drawn set without a fetch. Compared by value, since a caller may
  // build the array afresh every render.
  const hiddenKey = JSON.stringify(hidden);
  useEffect(() => {
    filterRef.current?.(hidden);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hiddenKey]);

  return { hiddenRef, filterRef };
};
