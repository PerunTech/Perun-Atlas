import { React, elements } from 'perun-core';
import { OVERLAY_STYLE } from '../../appearance/overlay';
import { countText } from '../../lib/fileText';
import { LineSwatch } from '../Legend';
import { CloseButton } from './CloseButton';

const { Icon } = elements;

export const FileActions = ({ fileOverlay, labels = {} }) => {
  const { offered, file, inputRef, choose, onPicked, close } = fileOverlay;

  return (
    <>
      {/* The input is never shown; the button opens it. */}
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
  );
};

export const FileNotices = ({ fileOverlay, labels = {} }) => {
  const { note, refusal, dismiss, dismissNote } = fileOverlay;

  return (
    <>
      {note && (
        <p className='atlas-panel__filenote' role='status'>
          <span>{note}</span>
          <CloseButton className='atlas-panel__fileclose' label={labels.close ?? 'Close'} onClick={dismissNote} />
        </p>
      )}

      {refusal && (
        <p className='atlas-panel__filerefused' role='alert'>
          <span>{refusal}</span>
          <CloseButton className='atlas-panel__fileclose' label={labels.close ?? 'Close'} onClick={dismiss} />
        </p>
      )}
    </>
  );
};
