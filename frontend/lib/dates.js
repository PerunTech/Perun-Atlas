/**
 * The date window, as the wire writes it.
 *
 * A panel's quick ranges, its picker and the URL its service is called with all
 * have to agree on what a day is, and they meet on a string rather than on a
 * Date: `<input type="date">` speaks `yyyy-mm-dd`, `LocalDate.parse` on the
 * other end expects it, and a service path carries `{from}` and `{to}` as text.
 * Keeping the conversion in one place is what stops the three drifting.
 *
 * Deliberately not a date library. This is the whole of what the panel needs,
 * and a dependency for it would ship on every screen that draws a map.
 */

/** ISO yyyy-mm-dd, which is both what `<input type="date">` speaks and what `LocalDate.parse` expects. */
export const iso = (date) => date.toISOString().slice(0, 10)

/** Today, as the wire writes it. */
export const today = () => iso(new Date())

/**
 * The same day, a number of months back.
 *
 * `setMonth` does the clamping this would otherwise have to: asked for the 31st
 * of a month that has thirty days it rolls forward rather than throwing, which
 * is the behaviour a range wants -- the window is a span, and a day either side
 * of its far edge is not a difference anyone is reading.
 */
export const monthsAgo = (months) => {
  const date = new Date()
  date.setMonth(date.getMonth() - months)
  return iso(date)
}

/** A quick range: that many months back, up to today. */
export const rangeOf = (months) => ({ from: monthsAgo(months), to: today() })

/** Whether two windows name the same span, which is whether a refetch is worth making. */
export const sameWindow = (a, b) => a?.from === b?.from && a?.to === b?.to
