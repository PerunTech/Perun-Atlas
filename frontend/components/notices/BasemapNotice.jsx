import { React, PropTypes } from 'perun-core';
import { cornerFor } from '../../lib/controls';
import { noticeDismissed, rememberDismissed, say } from '../../lib/notices';
import { useAtlasMap } from '../context';
import { containEvents, MapControl } from '../controls/host';
import { Glyph } from '../Glyph';
import '../../style/notice.css';

const { useState } = React;

export const BasemapNotice = ({ notice, labels, onRetry, reloading }) => {
  const map = useAtlasMap();
  const [dismissed, setDismissed] = useState(() => noticeDismissed(notice));
  const [open, setOpen] = useState(false);

  if (dismissed) return null;

  const text = notice.kind === 'fallback'
    ? say(notice.unreachable ? 'basemapUnreachable' : 'basemapDefault', labels, { name: notice.name })
    : say(notice.unreachable ? 'basemapNoneUnreachable' : 'basemapNone', labels);

  const dismiss = () => {
    rememberDismissed(notice);
    setDismissed(true);
  };

  return (
    <MapControl position={cornerFor(map._controlCorners, 'bottomcenter', 'bottomleft')}>
      <div
        className={`atlas-basemap-notice${notice.unreachable ? ' atlas-basemap-notice--warning' : ''}`}
        role='status'
        ref={containEvents}
      >
        {open && <p className='atlas-basemap-notice__details'>{notice.details}</p>}
        <div className='atlas-basemap-notice__pill'>
          <Glyph name={notice.unreachable ? 'alert-triangle' : 'info-circle'} size={16} />
          <span className='atlas-basemap-notice__text'>{text}</span>
          {notice.details && (
            <button
              type='button'
              className='atlas-basemap-notice__action'
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {say('details', labels)}
            </button>
          )}
          {onRetry && (
            <button type='button' className='atlas-basemap-notice__action' disabled={reloading} onClick={onRetry}>
              {say('basemapRetry', labels)}
            </button>
          )}
          <button
            type='button'
            className='atlas-basemap-notice__dismiss'
            aria-label={say('dismiss', labels)}
            title={say('dismiss', labels)}
            onClick={dismiss}
          >
            <Glyph name='x' size={14} />
          </button>
        </div>
      </div>
    </MapControl>
  );
};

BasemapNotice.propTypes = {
  notice: PropTypes.object.isRequired,
  labels: PropTypes.object,
  onRetry: PropTypes.func,
  reloading: PropTypes.bool
};
