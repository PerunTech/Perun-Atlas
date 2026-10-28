import { bindPath } from '../data/path';

/**
 * What the map says when it cannot be drawn, or is drawn on a basemap nobody
 * chose: the card in place of the map and the note along its bottom edge.
 *
 * Words by label key, each falling back to the English here. The details for
 * administrators are English only: they name parameters, which are English too.
 */
const WORDS = {
  mapNotSetUp: 'This map isn\'t set up yet',
  mapNotSetUpHint: 'Some settings the map needs are missing or can\'t be read, so it can\'t be drawn. Ask your administrator to check the map\'s system parameters.',
  mapUnreachable: 'Couldn\'t reach the server',
  mapUnreachableHint: 'The map\'s settings didn\'t load, so it can\'t be drawn yet. This is usually brief. Try again in a moment.',
  mapEngineOld: 'This map needs a newer map engine',
  mapEngineOldHint: 'The map engine on this server is older than this map needs. Ask your administrator to update it.',
  mapFailed: 'The map couldn\'t be drawn',
  mapFailedHint: 'Something went wrong while drawing it. Trying again may help.',
  noService: 'No map for this button yet',
  noServiceHint: 'This button doesn\'t have a map service set up. Your administrator can add one to the button\'s configuration.',
  adminDetails: 'Details for administrators',
  copyDetails: 'Copy details',
  detailsCopied: 'Copied',
  retry: 'Try again',
  settingNotSet: 'Not set',
  settingUnreadable: 'Can\'t read {value}',
  settingNoAnswer: 'No answer',
  basemapDefault: 'Showing {name}, the default basemap. Your administrator can add others.',
  basemapDefaultNote: 'No basemaps are set up for this system yet. Your administrator can add others.',
  basemapDefaultGroup: 'Default',
  basemapUnreachable: 'Couldn\'t load this system\'s basemaps. Showing {name} for now.',
  basemapNone: 'No basemap is set up for this map. Your administrator can add one.',
  basemapNoneUnreachable: 'Couldn\'t load this system\'s basemaps.',
  basemapRetry: 'Retry',
  details: 'Details',
  dismiss: 'Dismiss'
};

/**
 * One notice's words.
 *
 * @param {string} key - A key of `WORDS`.
 * @param {Object} [labels] - Resolved words by the same keys.
 * @param {Object} [values] - What the `{placeholders}` say.
 */
export const say = (key, labels = {}, values = {}) => bindPath(labels[key] ?? WORDS[key], values);

/**
 * What the card says about a map that failed to build.
 *
 * @param {Error} err - What `AtlasMap` caught. A `ConfigError` carries
 *        `problems`; the engine refusal carries `engine`.
 * @returns {{ kind: string, rows: Array, retry: boolean }} `kind` is
 *          `settings`, `unreachable`, `engine` or `failed`. Each row is
 *          `{ param, status, value, doc }`, `status` being `missing`,
 *          `invalid` or `unreachable`.
 */
export const failureNotice = (err) => {
  const problems = err?.problems;
  if (problems) {
    const rows = [
      ...problems.missing.map(p => ({ param: p.param, status: 'missing', doc: p.doc })),
      ...problems.invalid.map(p => ({
        param: p.param,
        status: 'invalid',
        value: JSON.stringify(p.got),
        doc: p.doc ?? (p.expected && `Expected ${p.expected}.`)
      })),
      ...problems.unreachable.map(p => ({ param: p.param, status: 'unreachable', doc: p.doc }))
    ];
    const onlyUnreachable = !problems.missing.length && !problems.invalid.length;
    return { kind: onlyUnreachable ? 'unreachable' : 'settings', rows, retry: true };
  }
  if (err?.engine) return { kind: 'engine', rows: [], retry: false };
  return { kind: 'failed', rows: [], retry: true };
};

/** The card's heading, hint and glyph for each `kind`. */
export const FAILURE_CARD = {
  settings: { icon: 'map-off', title: 'mapNotSetUp', hint: 'mapNotSetUpHint' },
  unreachable: { icon: 'cloud-off', title: 'mapUnreachable', hint: 'mapUnreachableHint' },
  engine: { icon: 'map-off', title: 'mapEngineOld', hint: 'mapEngineOldHint' },
  failed: { icon: 'map-off', title: 'mapFailed', hint: 'mapFailedHint' }
};

/** A row's status, in words. */
export const statusText = (row, labels) => {
  if (row.status === 'invalid') return say('settingUnreadable', labels, { value: row.value });
  if (row.status === 'unreachable') return say('settingNoAnswer', labels);
  return say('settingNotSet', labels);
};

/**
 * What the basemap note says, given what the catalogue answered.
 *
 * @param {string} catalogue - `ok`, `empty` or `unreachable`, as `fetchLayers`
 *        says it.
 * @param {Object} fallback - What `fallbackBasemap` returned, or null when it
 *        was not asked.
 * @param {string} [crs] - The map's CRS code, for the details.
 * @returns {Object|null} `{ kind, unreachable, name, details }`, `kind` being
 *          `fallback` or `none`; null when the catalogue had a basemap.
 */
export const basemapNotice = (catalogue, fallback, crs) => {
  if (catalogue === 'ok' || !fallback) return null;
  const unreachable = catalogue === 'unreachable';

  if (fallback.layer) return { kind: 'fallback', unreachable, name: fallback.name, details: null };

  const details = fallback.reason === 'crs'
    ? `The default basemap is only used on Web Mercator maps (EPSG:3857). This map draws in ${crs ?? 'another projection'}, where its tiles would land in the wrong place. Add a basemap in this projection to GEO_LAYER_TYPE.`
    : 'The default basemap is turned off by SPATIAL_FALLBACK_BASEMAP. Add a basemap to GEO_LAYER_TYPE, or set the parameter to a tile URL.';
  return { kind: 'none', unreachable, name: null, details };
};

const DISMISSED = 'perun-atlas.basemap-notice';

/**
 * Whether the reader has put this note away before, in this browser.
 *
 * Only the notes about how the system is set up are remembered. A catalogue
 * that did not answer is news each time.
 */
export const noticeDismissed = (notice) => {
  if (!notice || notice.unreachable) return false;
  try {
    return window.localStorage.getItem(DISMISSED) === notice.kind;
  } catch {
    return false;
  }
};

export const rememberDismissed = (notice) => {
  if (!notice || notice.unreachable) return;
  try {
    window.localStorage.setItem(DISMISSED, notice.kind);
  } catch {
    // Storage refused: the note comes back next time, which is harmless.
  }
};
