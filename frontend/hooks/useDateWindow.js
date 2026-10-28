import { React } from 'perun-core';
import { rangeOf, sameWindow } from '../lib/dates';

const { useState } = React;

// `onMoved` fires only when the window actually changes; the caller drops what belonged to the old one.
export const useDateWindow = ({ presets = [], defaultMonths, servicePath, opening, onMoved }) => {
  const initial = defaultMonths ?? presets[presets.length - 1]?.months ?? 12;
  const [preset, setPreset] = useState(opening ? null : initial);
  const [range, setRange] = useState(() => opening ?? rangeOf(initial));

  // Only a path naming `{from}` or `{to}` takes a window. Offering one elsewhere would refetch an
  // identical URL on every change.
  const timeScoped = /\{(from|to)\}/.test(servicePath ?? '');

  // Only when it actually moves: an unchanged window fetches nothing, so clearing the set would leave it
  // null for good and take the export buttons with it.
  const applyWindow = (next, months) => {
    setPreset(months);
    if (sameWindow(next, range)) return;
    setRange(next);
    onMoved?.();
  };

  const applyPreset = (months) => applyWindow(rangeOf(months), months);

  const onRangeChange = (next) => applyWindow(next, null);

  const longest = presets[presets.length - 1];

  return { timeScoped, preset, range, applyPreset, onRangeChange, longest, initial };
};
