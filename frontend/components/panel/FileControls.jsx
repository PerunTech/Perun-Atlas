import { React, elements } from 'perun-core'
import { OVERLAY_STYLE } from '../../appearance/overlay'
import { countText } from '../../lib/fileText'
import { LineSwatch } from '../Legend'
import { CloseButton } from './CloseButton'

/** Tabler through perun-core; `ExportButtons` says why. */
const { Icon } = elements

/**
 * Opening a file over the map, in two pieces for the two places they go.
 *
 * `FileActions` is the button, the input it opens and the open file's chip. It
 * sits in the panel's actions, after the buttons that write files. `FileNotices`
 * is what there is to say about a file: a note about the one that is open, or
 * why the last one picked did not open. It takes a line of its own under the
 * actions, where a sentence has room.
 *
 * Both take what `useFileOverlay` returned, whole.
 */

/**
 * @param {Object} fileOverlay - What `useFileOverlay` returned.
 * @param {Object} [labels]
 */
export const FileActions = ({ fileOverlay, labels = {} }) => {
  const { offered, file, inputRef, choose, onPicked, close } = fileOverlay

  return (
    <>
      {/* The other direction: a file in, drawn over the map and nowhere
          else. Last, so the buttons that write files stay together. The
          input is never shown; the button opens it. */}
      {offered && (
        <button type='button' className='atlas-panel__btn atlas-panel__btn--ghost' onClick={choose}>
          <Icon name='IconFolderOpen' size={16} stroke={1.75} aria-hidden='true' />
          {labels.openFile ?? 'Open file'}
        </button>
      )}
      {offered && (
        <input
          ref={inputRef}
          type='file'
          className='atlas-panel__fileinput'
          accept='.geojson,.json,.kml,.gpx,.zip,.shp'
          tabIndex={-1}
          aria-hidden='true'
          onChange={onPicked}
        />
      )}

      {/* The open file, beside the button that opened it: the overlay's
          own swatch, the file's name, what it drew, and the way to close
          it. The key carries the same swatch and name. */}
      {file && (
        <div className='atlas-panel__file'>
          <LineSwatch path={OVERLAY_STYLE} />
          <span className='atlas-panel__filename' title={file.name}>{file.name}</span>
          <span className='atlas-panel__filecount'>{countText(file.count, labels)}</span>
          <CloseButton
            className='atlas-panel__fileclose'
            label={labels.closeFile ?? 'Close file'}
            title={labels.closeFile ?? 'Close file'}
            onClick={close}
          />
        </div>
      )}
    </>
  )
}

/**
 * @param {Object} fileOverlay - What `useFileOverlay` returned.
 * @param {Object} [labels]
 */
export const FileNotices = ({ fileOverlay, labels = {} }) => {
  const { note, refusal, dismiss, dismissNote } = fileOverlay

  return (
    <>
      {/* What to know about the open file, until the reader dismisses it or
          the file closes. */}
      {note && (
        <p className='atlas-panel__filenote' role='status'>
          <span>{note}</span>
          <CloseButton className='atlas-panel__fileclose' label={labels.close ?? 'Close'} onClick={dismissNote} />
        </p>
      )}

      {/* Why the last file picked did not open, until the reader dismisses it
          or a file does open. */}
      {refusal && (
        <p className='atlas-panel__filerefused' role='alert'>
          <span>{refusal}</span>
          <CloseButton className='atlas-panel__fileclose' label={labels.close ?? 'Close'} onClick={dismiss} />
        </p>
      )}
    </>
  )
}
