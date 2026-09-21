import { React } from 'perun-core';
import { rangeOf, sameWindow } from '../lib/dates';

const { useState } = React

/**
 * The date window a service path asks for, and the controls that move it.
 *
 * `onMoved` is called only when the window actually changes, and is where a
 * caller drops whatever belonged to the old one. It is a callback rather than
 * something this clears itself because what a moved window invalidates -- the
 * set, the open record -- is the panel's, and a hook that reached into it would
 * be the panel with a different name.
 *
 * @param {Object} params
 * @param {Array<{months: number, label: string}>} params.presets
 * @param {number} [params.defaultMonths]
 * @param {string} [params.servicePath] - Read for `{from}` / `{to}`; see `timeScoped`.
 * @param {Function} [params.onMoved]
 */
export const useDateWindow = ({ presets = [], defaultMonths, servicePath, onMoved }) => {
  const initial = defaultMonths ?? presets[presets.length - 1]?.months ?? 12
  const [preset, setPreset] = useState(initial)
  const [range, setRange] = useState(() => rangeOf(initial))

  /**
   * Whether this map is scoped to a date window.
   *
   * The service path is the honest signal, because the placeholders are the only
   * thing the window actually feeds: a path that names neither takes no window,
   * so offering one is offering a control that cannot change the answer. Derived
   * rather than configured for the same reason -- it is already written down,
   * and a second place to say it is a second place to say it differently.
   *
   * Not only cosmetic. `bindPath` leaves an unmatched placeholder alone and
   * ignores a value nothing names, so the URL would be right either way -- but
   * the dates reach `FeatureSet` through its context, and changing them changes
   * the key its effect depends on. On a path with no window that is a refetch of
   * a byte-identical URL, with the count blanked while it is in flight.
   */
  const timeScoped = /\{(from|to)\}/.test(servicePath ?? '')

  /**
   * Move the date window, and clear what belonged to the old one.
   *
   * Only when it actually moves. `FeatureSet` refetches on a change to the
   * bindings it is handed, and those carry the dates as strings, so a window
   * resolving to the dates already in force produces no fetch at all -- that is
   * the byte-identical-URL refetch `timeScoped` exists to avoid, working as
   * intended.
   *
   * Clearing the set for a fetch that will not happen is what breaks: nothing
   * arrives to put it back, so `set` stays null for the life of the screen. The
   * map keeps the features it already drew, which is why it looks fine, while
   * the export buttons and the empty-set notice -- both of which wait on a set
   * having arrived -- are simply gone. Clicking the quick range that is already
   * active is the easy way to see it, and the range picker can reach it too by
   * choosing the dates already shown.
   *
   * `preset` is still set either way, since which button reads as pressed is a
   * question about the control rather than about the data.
   */
  const applyWindow = (next, months) => {
    setPreset(months)
    if (sameWindow(next, range)) return
    setRange(next)
    onMoved?.()
  }

  const applyPreset = (months) => applyWindow(rangeOf(months), months)

  const onRangeChange = (next) => applyWindow(next, null)

  /** Offering the longest range is only an offer while the range is shorter than it. */
  const longest = presets[presets.length - 1]

  return { timeScoped, preset, range, applyPreset, onRangeChange, longest, initial }
}
