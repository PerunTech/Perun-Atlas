import { React } from 'perun-core'
import { shownName } from '../data/tiles'
import { copyText } from '../lib/dom'
import { writeLink } from '../lib/link'

const { useEffect, useRef, useState } = React

/** How long the button says the link was copied before it goes back to offering one. */
const COPIED_FOR = 2000

/**
 * A link to this screen as it stands, and the button that copies it.
 *
 * Offered only where a link can reopen the screen: the caller names it
 * (`linkId`, which a consuming bundle reads back out of the address to open
 * the right map), and the row has not switched it off. A screen with no name
 * would copy an address that opens the record and leaves the map shut.
 *
 * The view is read when the button is pressed, not tracked as it changes. The
 * map moves on every drag, and nothing here needs to know where it is until
 * someone asks.
 *
 * @param {Object} params
 * @param {string|number} [params.linkId] - The screen's name in a link.
 * @param {boolean} [params.link] - The row's `link`: `false` withholds the button.
 * @param {boolean} params.timeScoped
 * @param {{from: string, to: string}} params.range
 * @param {Object} [params.labels]
 */
export const useViewLink = ({ linkId, link, timeScoped, range, labels = {} }) => {
  const offered = linkId !== undefined && linkId !== null && linkId !== '' && link !== false

  // The map and its basemaps, as `AtlasMap` hands them over once it is ready.
  const mapRef = useRef(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return undefined
    const timer = setTimeout(() => setCopied(false), COPIED_FOR)
    return () => clearTimeout(timer)
  }, [copied])

  const attach = ({ map, basemap }) => { mapRef.current = { map, basemap } }

  /**
   * Copy the link, or show it where there is no clipboard to put it on.
   *
   * @param {Element} [origin] - The button pressed; see `copyText`.
   */
  const copy = async (origin) => {
    const { map, basemap } = mapRef.current ?? {}
    if (!map) return

    const center = map.getCenter()
    const href = writeLink(window.location.href, linkId, {
      center: [center.lat, center.lng],
      zoom: map.getZoom(),
      basemap: shownName(basemap, map),
      ...(timeScoped && { from: range.from, to: range.to })
    })

    if (await copyText(href, origin?.parentNode ?? undefined)) setCopied(true)
    else window.prompt(labels.copyLinkPrompt ?? 'Copy this link:', href)
  }

  return { offered, copied, attach, copy }
}
