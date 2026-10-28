import { React } from 'perun-core';
import { identifiersOf, withinCircle } from '../data/select';

const { useMemo } = React;

const DEFAULTS = { id: '{pkid}', join: ',' };

// Answered in the browser over the set the layer fetched, so a bbox layer answers only for what is in
// view. Recomputed on every keystroke in the radius field, which is cheap enough.
export const useSelection = ({ set, shape, dataSrid, select, map }) => {
  const asked = select === true ? DEFAULTS : (select ? { ...DEFAULTS, ...select } : null);

  // Destructured so a menu row arriving as a fresh object every render doesn't recompute the set.
  const { mode, id, join } = asked ?? {};
  const feedsExport = Boolean(asked) && asked.export !== false;

  return useMemo(() => {
    if (!asked) {
      return {
        selecting: false,
        feedsExport: false,
        count: 0,
        total: 0,
        inside: [],
        radius: null,
        has: () => false,
        metres: () => null,
        context: null
      };
    }

    const answer = withinCircle(set, shape, { srid: dataSrid, mode, map });

    return {
      selecting: true,
      feedsExport,
      count: answer.inside.length,
      total: answer.total,
      inside: answer.inside,
      radius: shape?.radius ?? null,
      has: answer.has,
      metres: answer.metres,
      context: {
        count: answer.inside.length,
        total: answer.total,
        ids: identifiersOf(answer.inside, { id, join }),
        geojson: { type: 'FeatureCollection', features: answer.inside }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [set, shape, dataSrid, map, mode, id, join, feedsExport, Boolean(asked)]);
};
