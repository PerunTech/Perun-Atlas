import { React, PropTypes } from 'perun-core';
import { copyText } from '../../lib/dom';
import { say, statusText } from '../../lib/notices';
import { Glyph } from '../Glyph';
import '../../style/notice.css';

const { useEffect, useRef, useState } = React;

/**
 * A card in place of a map that cannot be drawn.
 *
 * The heading and hint are for whoever opened the screen; the parameters at
 * fault and the error itself sit behind a toggle, for whoever can fix them.
 *
 * @param {string} icon - A glyph name.
 * @param {string} title
 * @param {string} hint
 * @param {Array} [rows] - `{ param, status, value, doc }`, as `failureNotice` gives them.
 * @param {string} [details] - Shown under the rows, or alone.
 * @param {string} [copy] - What Copy details puts on the clipboard. No button without it.
 * @param {Function} [onRetry] - No Try again without it.
 * @param {Object} [labels] - Resolved words, by the keys in `lib/notices.js`.
 */
export const UnavailableCard = ({ icon, title, hint, rows = [], details, copy, onRetry, labels, className }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const onCopy = async (event) => {
    if (!await copyText(copy, event.currentTarget)) return;
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  const hasDetails = rows.length > 0 || Boolean(details);

  return (
    <div className={['atlas-unavailable', className].filter(Boolean).join(' ')} role='alert'>
      <div className='atlas-unavailable__card'>
        <span className='atlas-unavailable__icon'><Glyph name={icon} size={22} /></span>
        <div className='atlas-unavailable__title'>{title}</div>
        <p className='atlas-unavailable__hint'>{hint}</p>
        {hasDetails && (
          <button
            type='button'
            className='atlas-unavailable__toggle'
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {say('adminDetails', labels)}
            <Glyph name={open ? 'chevron-up' : 'chevron-down'} size={14} />
          </button>
        )}
        {open && (
          <div className='atlas-unavailable__details'>
            {rows.map(row => (
              <div className='atlas-unavailable__row' key={row.param}>
                <code className='atlas-unavailable__param'>{row.param}</code>
                <span className={`atlas-unavailable__status atlas-unavailable__status--${row.status}`}>
                  {statusText(row, labels)}
                </span>
                {row.doc && <span className='atlas-unavailable__doc'>{row.doc}</span>}
              </div>
            ))}
            {details && <p className='atlas-unavailable__note'>{details}</p>}
          </div>
        )}
        {(copy || onRetry) && (
          <div className='atlas-unavailable__actions'>
            {copy && (
              <button type='button' className='atlas-unavailable__btn' onClick={onCopy}>
                <Glyph name={copied ? 'check' : 'copy'} size={16} />
                {say(copied ? 'detailsCopied' : 'copyDetails', labels)}
              </button>
            )}
            {onRetry && (
              <button type='button' className='atlas-unavailable__btn atlas-unavailable__btn--primary' onClick={onRetry}>
                <Glyph name='refresh' size={16} />
                {say('retry', labels)}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

UnavailableCard.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  hint: PropTypes.string,
  rows: PropTypes.array,
  details: PropTypes.string,
  copy: PropTypes.string,
  onRetry: PropTypes.func,
  labels: PropTypes.object,
  className: PropTypes.string
};
