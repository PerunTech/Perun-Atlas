import { React } from 'perun-core';
import { CloseButton } from './CloseButton';

export const RecordPane = ({ record, onClose, labels = {} }) => (
  <aside
    className={['atlas-panel__details', record.spec?.className].filter(Boolean).join(' ')}
    style={record.spec?.style}
    aria-label={labels.details ?? 'Details'}
  >
    <div className='atlas-panel__detailshead'>
      <div className='atlas-panel__detailstitle' style={record.spec?.titleStyle}>
        {record.title ?? labels.details ?? 'Details'}
      </div>
      <CloseButton label={labels.close ?? 'Close'} onClick={onClose} />
    </div>

    <dl className='atlas-panel__detailsbody'>
      {record.rows.map(({ field, label, value }) => (
        <div key={field} className='atlas-panel__detailsrow'>
          <dt style={record.spec?.labelStyle}>{label}</dt>
          <dd style={record.spec?.valueStyle}>{value}</dd>
        </div>
      ))}
    </dl>
  </aside>
);
