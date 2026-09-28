import { React } from 'perun-core';
import { FILE_LIMITS, fileKind, readFile, readLayers, sizeRefusal } from '../data';
import { loadModule } from '../lib/modules';
import { assumedText, refusalText } from '../appearance/overlay';

const { useRef, useState } = React

/**
 * A promise that settles once the browser has painted.
 *
 * Reading a large file and drawing it both hold the main thread -- a day's GPS
 * track does for well over a second -- and the browser paints nothing while it
 * is held. A loading card asked for in the same turn as the work would be
 * painted only after the work, which is to say never. So the card is put up,
 * this waits for the frame that shows it, and the work starts after.
 *
 * `requestAnimationFrame` runs just before a paint, so a timeout from inside it
 * runs just after one.
 */
const afterPaint = () => new Promise((resolve) => {
  requestAnimationFrame(() => setTimeout(resolve, 0))
})

/**
 * A picked file's contents, read by whichever reader its first bytes ask for.
 *
 * Text goes to `readFile`. A zip or a `.shp` goes to the shapefile reader, which
 * is fetched from beside the bundle the first time one is opened. The loading
 * card is already up by then, so the reader sees one wait, for the file.
 */
const readPicked = async (picked) => {
  const bytes = await picked.arrayBuffer()
  const kind = fileKind(bytes, picked.name)
  if (kind === 'text') return readFile(new TextDecoder().decode(bytes))
  if (kind === 'part') return { refused: 'shapefilePart' }

  let reader
  try {
    reader = await loadModule('shp')
  } catch (err) {
    console.warn('perun-atlas: the shapefile reader could not be loaded', err)
    return { refused: 'readerUnavailable' }
  }
  return readLayers(await reader.readShapefile(bytes, { kind, limit: FILE_LIMITS.bytes }))
}

/**
 * A file the reader opened over the map, or why one was not opened.
 *
 * One file at a time: opening another replaces it. Every file is drawn in the
 * same style, so two open at once could only be told apart by clicking them.
 * A file that is refused does not replace the one already open. The reader
 * still has what they had, and is told why the new one did not open.
 *
 * Reading happens here and drawing in `FileOverlay`, because the file is read
 * the moment it is picked and drawn once the map is ready. The map may resolve
 * its projection after the pick, and the drawing is what depends on it.
 *
 * @param {Object} params
 * @param {boolean|Object} [params.overlay] - The row's `overlay`. `false` takes
 *        the button away; anything else offers it.
 * @param {Object} [params.labels] - The panel's resolved words.
 * @param {Function} [params.onChange] - Called when a file opens or closes, so
 *        the panel can switch the key's file row back on for the next one.
 */
export const useFileOverlay = ({ overlay, labels, onChange }) => {
  const offered = overlay !== false

  /** `{ name, collection, count }`, the collection in degrees. */
  const [file, setFile] = useState(null)

  /** What to tell the reader about the last file that did not open. */
  const [refusal, setRefusal] = useState(null)

  /**
   * What to tell the reader about the file that is open: that a shapefile with
   * no `.prj` was read as longitude and latitude. It goes with the file.
   */
  const [note, setNote] = useState(null)

  /**
   * The name of the file being read and drawn, or null.
   *
   * Set once a file has passed the size check, and cleared when the overlay
   * reports that it has drawn -- not when reading ends, because drawing a large
   * file takes as long again. A refusal, a close and a failed draw clear it too.
   */
  const [opening, setOpening] = useState(null)

  const inputRef = useRef(null)

  /**
   * Which pick is the latest.
   *
   * Reading is asynchronous, and a large file takes long enough for a reader to
   * pick another one. Whichever was picked last wins, however the reads finish.
   */
  const latest = useRef(0)

  const choose = () => inputRef.current?.click()

  const open = async (picked) => {
    const ticket = ++latest.current

    // Too large is known before a byte is read, so it is said at once, with no
    // card in between.
    let result = sizeRefusal(picked.size)
    if (!result) {
      setOpening(picked.name)
      await afterPaint()
      if (ticket !== latest.current) return

      try {
        result = await readPicked(picked)
      } catch (err) {
        console.warn('perun-atlas: a file could not be read', err)
        result = { refused: 'unreadable' }
      }
    }
    if (ticket !== latest.current) return

    if (result.refused) {
      setOpening(null)
      setRefusal(refusalText(result, picked.name, labels))
      return
    }

    // `opening` stays set: the overlay draws this after the render, and says
    // when it has through `drawn`.
    setRefusal(null)
    setNote(result.assumed ? assumedText(picked.name, labels) : null)
    setFile({ name: picked.name, collection: result.collection, count: result.collection.features.length })
    onChange?.()
  }

  /**
   * The input's `change`.
   *
   * The input is emptied straight away, so the same file picked again -- after
   * closing it, or after fixing it in another tool -- fires another `change`
   * rather than nothing.
   */
  const onPicked = (event) => {
    const picked = event.target.files?.[0]
    event.target.value = ''
    if (picked) open(picked)
  }

  const close = () => {
    latest.current += 1
    setOpening(null)
    setNote(null)
    setFile(null)
    onChange?.()
  }

  /** The overlay has drawn the file, so the card can come down. */
  const drawn = () => setOpening(null)

  /** The engine refused to draw a file the reader passed. Said the way a refusal is. */
  const failed = () => {
    if (!file) return
    setRefusal(refusalText({ refused: 'unreadable' }, file.name, labels))
    close()
  }

  return {
    offered,
    file,
    refusal,
    note,
    opening,
    inputRef,
    choose,
    onPicked,
    close,
    drawn,
    failed,
    dismiss: () => setRefusal(null),
    dismissNote: () => setNote(null)
  }
}
