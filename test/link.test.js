import { describe, expect, it } from 'vitest';
import { readLink, takeLink, writeLink } from '../frontend/lib/link';
import { layerNamed, shownName } from '../frontend/data/tiles';

const RECORD = 'https://aims.example/app/#/main/registry/HOLDING/4711/HOLDING_DETAILS';

describe('writing a link', () => {
  it('puts the screen and its view after the route', () => {
    const href = writeLink(RECORD, 'MAP_BTN', {
      center: [35.1856, 33.3823],
      zoom: 12,
      basemap: 'osm_streets',
      from: '2026-06-29',
      to: '2026-09-29'
    });
    expect(href).toBe(
      `${RECORD}?map=MAP_BTN&at=35.1856,33.3823,12&base=osm_streets&from=2026-06-29&to=2026-09-29`
    );
  });

  it('rounds the centre to six places and the zoom to two', () => {
    const href = writeLink(RECORD, 'M', { center: [35.18561234567, 33.38231234567], zoom: 12.3456 });
    expect(href).toBe(`${RECORD}?map=M&at=35.185612,33.382312,12.35`);
  });

  it('brings a longitude panned round the world back into range', () => {
    const href = writeLink(RECORD, 'M', { center: [35, 393.5], zoom: 3 });
    expect(href).toBe(`${RECORD}?map=M&at=35,33.5,3`);
    expect(readLink(href, 'M').center).toEqual([35, 33.5]);
  });

  it('leaves out what it was not given', () => {
    expect(writeLink(RECORD, 'M', { center: [35, 33], zoom: 9 })).toBe(`${RECORD}?map=M&at=35,33,9`);
    expect(writeLink(RECORD, 'M', {})).toBe(`${RECORD}?map=M`);
    expect(writeLink(RECORD, 'M', { from: '2026-01-01' })).toBe(`${RECORD}?map=M`);
  });

  it('replaces a view already in the address and keeps anything else', () => {
    const opened = `${RECORD}?tab=2&map=OLD&at=1,2,3&base=x&from=2026-01-01&to=2026-02-01`;
    expect(writeLink(opened, 'NEW', { center: [35, 33], zoom: 9 })).toBe(`${RECORD}?tab=2&map=NEW&at=35,33,9`);
  });

  it('writes into the query after the hash, not the page\'s own', () => {
    const href = writeLink('https://aims.example/app/?lang=en#/main/x', 'M', {});
    expect(href).toBe('https://aims.example/app/?lang=en#/main/x?map=M');
  });

  it('uses the page\'s own query where there is no hash', () => {
    expect(writeLink('https://aims.example/map?lang=en', 'M', {})).toBe('https://aims.example/map?lang=en&map=M');
  });

  it('encodes a basemap name that needs it', () => {
    const href = writeLink(RECORD, 'M', { basemap: 'Сателит & улици' });
    expect(readLink(href, 'M').basemap).toBe('Сателит & улици');
  });
});

describe('reading a link', () => {
  const link = `${RECORD}?map=MAP_BTN&at=35.1856,33.3823,12&base=osm_streets&from=2026-06-29&to=2026-09-29`;

  it('gives back what was written', () => {
    expect(readLink(link, 'MAP_BTN')).toEqual({
      center: [35.1856, 33.3823],
      zoom: 12,
      basemap: 'osm_streets',
      from: '2026-06-29',
      to: '2026-09-29'
    });
  });

  it('answers only the screen the link names', () => {
    expect(readLink(link, 'OTHER_BTN')).toBeNull();
    expect(readLink(RECORD, 'MAP_BTN')).toBeNull();
    expect(readLink(link, undefined)).toBeNull();
    expect(readLink(link, '')).toBeNull();
  });

  it('never answers a screen with no name, even to an empty one in the address', () => {
    expect(readLink(`${RECORD}?map=&at=35,33,9`, '')).toBeNull();
    expect(readLink(`${RECORD}?map=undefined&at=35,33,9`, undefined)).toBeNull();
    expect(readLink(`${RECORD}?map=null&at=35,33,9`, null)).toBeNull();
  });

  it('compares a numeric id as the text the address holds', () => {
    expect(readLink(`${RECORD}?map=42`, 42)).toEqual({});
  });

  it('opens with nothing but the screen when no part of the view reads', () => {
    expect(readLink(`${RECORD}?map=M`, 'M')).toEqual({});
  });

  it('drops a centre it cannot place', () => {
    const view = (at) => readLink(`${RECORD}?map=M&at=${at}`, 'M');
    expect(view('95,33,12')).toEqual({});
    expect(view('35,181,12')).toEqual({});
    expect(view('35,33')).toEqual({});
    expect(view('35,33,12,4')).toEqual({});
    expect(view('35,,12')).toEqual({});
    expect(view('a,b,c')).toEqual({});
    expect(view('35,33,31')).toEqual({});
    expect(view('35,33,-1')).toEqual({});
    expect(view('-90,-180,0')).toEqual({ center: [-90, -180], zoom: 0 });
  });

  it('drops a window that is not two real days in order', () => {
    const window = (from, to) => readLink(`${RECORD}?map=M&from=${from}&to=${to}`, 'M');
    expect(window('2026-02-30', '2026-03-01')).toEqual({});
    expect(window('2026-09-29', '2026-06-29')).toEqual({});
    expect(window('29.06.2026', '2026-09-29')).toEqual({});
    expect(readLink(`${RECORD}?map=M&from=2026-06-29`, 'M')).toEqual({});
    expect(window('2026-09-29', '2026-09-29')).toEqual({ from: '2026-09-29', to: '2026-09-29' });
  });

  it('keeps each good part when another is bad', () => {
    expect(readLink(`${RECORD}?map=M&at=95,33,12&base=osm&from=2026-01-01&to=2026-02-01`, 'M'))
      .toEqual({ basemap: 'osm', from: '2026-01-01', to: '2026-02-01' });
  });
});

describe('taking a link', () => {
  it('gives the view once per address', () => {
    const href = `${RECORD}?map=ONCE&at=35,33,9`;
    expect(takeLink(href, 'ONCE')).toEqual({ center: [35, 33], zoom: 9 });
    expect(takeLink(href, 'ONCE')).toBeNull();
  });

  it('does not use up an address for a screen it does not name', () => {
    const href = `${RECORD}?map=NAMED&at=35,33,9`;
    expect(takeLink(href, 'ANOTHER')).toBeNull();
    expect(takeLink(href, undefined)).toBeNull();
    expect(takeLink(href, 'NAMED')).toEqual({ center: [35, 33], zoom: 9 });
  });
});

describe('naming a basemap', () => {
  const streets = { id: 'streets' };
  const satellite = { id: 'satellite' };
  const terrain = { id: 'terrain' };
  const grouped = { Base: { streets_label: streets, satellite_label: satellite }, Other: { terrain_label: terrain } };

  it('finds a layer by its name in whichever group it is', () => {
    expect(layerNamed(grouped, 'satellite_label')).toBe(satellite);
    expect(layerNamed(grouped, 'terrain_label')).toBe(terrain);
  });

  it('finds nothing for a name the catalogue does not list', () => {
    expect(layerNamed(grouped, 'gone')).toBeNull();
    expect(layerNamed(grouped, undefined)).toBeNull();
    expect(layerNamed(grouped, 'toString')).toBeNull();
    expect(layerNamed(undefined, 'streets_label')).toBeNull();
  });

  it('names the layer the map is showing', () => {
    const showing = (layer) => ({ hasLayer: (candidate) => candidate === layer });
    expect(shownName(grouped, showing(terrain))).toBe('terrain_label');
    expect(shownName(grouped, showing(streets))).toBe('streets_label');
    expect(shownName(grouped, showing({ id: 'overlay' }))).toBeNull();
    expect(shownName({}, showing(streets))).toBeNull();
  });
});
