import { React } from 'perun-core';
import { fetchRows } from '../data/rows';
import { reader } from '../data/path';

const { useEffect, useMemo, useState } = React;

export const useChoropleth = ({ choropleth, bindings, bindingKey }) => {
  const coloured = Boolean(choropleth);

  const [rows, setRows] = useState(null);

  // Fetched here, not by the bbox-scoped layer, so a pan doesn't refetch the whole code list. The layer
  // mounts only once they arrive, so there is no first draw in the fallback colour.
  const statusPath = coloured ? choropleth.status : null;

  useEffect(() => {
    if (!statusPath) return undefined;

    let cancelled = false;
    fetchRows(statusPath, bindings).then((next) => {
      if (!cancelled) setRows(next);
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusPath, bindingKey]);

  const tooltip = useMemo(() => {
    const field = choropleth?.tooltip;
    if (!field) return undefined;
    const read = reader(field);
    return (feature) => read(feature?.properties) ?? null;
  }, [choropleth]);

  return { coloured, statusPath, rows, tooltip };
};
