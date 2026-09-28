import { React } from 'perun-core';
import { readFile, sizeRefusal } from '../data';
import { refusalText } from '../appearance/overlay';

const { useRef, useState } = React

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

    let result = sizeRefusal(picked.size)
    if (!result) {
      try {
        result = readFile(await picked.text())
      } catch (err) {
        console.warn('perun-atlas: a file could not be read', err)
        result = { refused: 'unreadable' }
      }
    }
    if (ticket !== latest.current) return

    if (result.refused) {
      setRefusal(refusalText(result, picked.name, labels))
      return
    }

    setRefusal(null)
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
    setFile(null)
    onChange?.()
  }

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
    inputRef,
    choose,
    onPicked,
    close,
    failed,
    dismiss: () => setRefusal(null)
  }
}
