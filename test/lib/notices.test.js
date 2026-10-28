import { describe, expect, it } from 'vitest';
import { ConfigError } from '../../frontend/bootstrap/resolve';
import { failureNotice, say, statusText } from '../../frontend/lib/notices';

const setting = (key, param, extra = {}) => ({ key, param, doc: `${param} doc`, ...extra });

const problems = (overrides) => ({ invalid: [], missing: [], unreachable: [], ...overrides });

describe('say', () => {
  it('falls back to English and fills the placeholders after resolving', () => {
    expect(say('retry')).toBe('Try again');
    expect(say('retry', { retry: 'Обиди се повторно' })).toBe('Обиди се повторно');
    expect(say('settingUnreadable', {}, { value: '"41.6"' })).toBe('Can\'t read "41.6"');
    expect(say('settingUnreadable', { settingUnreadable: 'Не се чита {value}' }, { value: 'x' })).toBe('Не се чита x');
  });
});

describe('failureNotice', () => {
  it('lists missing, unreadable and unanswered settings as rows', () => {
    const err = new ConfigError(problems({
      missing: [setting('crs', 'SPATIAL_CRS')],
      invalid: [{ ...setting('center', 'SPATIAL_CENTER'), got: '41.6', expected: 'a { lat, lng } pair', message: 'm' }],
      unreachable: [setting('zoom', 'SPATIAL_ZOOM')]
    }));
    const notice = failureNotice(err);
    expect(notice.kind).toBe('settings');
    expect(notice.retry).toBe(true);
    expect(notice.rows).toEqual([
      { param: 'SPATIAL_CRS', status: 'missing', doc: 'SPATIAL_CRS doc' },
      { param: 'SPATIAL_CENTER', status: 'invalid', value: '"41.6"', doc: 'SPATIAL_CENTER doc' },
      { param: 'SPATIAL_ZOOM', status: 'unreachable', doc: 'SPATIAL_ZOOM doc' }
    ]);
  });

  it('says what was expected where the schema has no words for a setting', () => {
    const err = new ConfigError(problems({
      invalid: [{ key: 'zoom', param: 'SPATIAL_ZOOM', got: 'far', expected: 'an integer', message: 'm' }]
    }));
    expect(failureNotice(err).rows[0].doc).toBe('Expected an integer.');
  });

  it('calls it the server when nothing was wrong but the answers', () => {
    const err = new ConfigError(problems({ unreachable: [setting('crs', 'SPATIAL_CRS')] }));
    expect(failureNotice(err).kind).toBe('unreachable');
  });

  it('offers no retry for an engine that is too old', () => {
    const err = Object.assign(new Error('old'), { engine: true });
    expect(failureNotice(err)).toEqual({ kind: 'engine', rows: [], retry: false });
  });

  it('has a plain card for anything else', () => {
    expect(failureNotice(new Error('boom'))).toEqual({ kind: 'failed', rows: [], retry: true });
  });
});

describe('statusText', () => {
  it('names each status, quoting what could not be read', () => {
    expect(statusText({ status: 'missing' })).toBe('Not set');
    expect(statusText({ status: 'invalid', value: '"41.6"' })).toBe('Can\'t read "41.6"');
    expect(statusText({ status: 'unreachable' })).toBe('No answer');
  });
});

