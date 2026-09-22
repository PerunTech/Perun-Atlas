import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('perun-core', () => ({ axios: { get: vi.fn() }, utils: {}, elements: {} }));

const { axios } = await import('perun-core');
const { fetchSchema, fetchUISchema, pickFields, usableUI, withGroups } = await import('../frontend/data/form');

/**
 * A table's schema, in the shape these services actually send one.
 *
 * Two things about it are not decoration. A group is a single key with a dot
 * in it holding an object -- not a nested path -- which is what makes a picked
 * name ambiguous and what the backend looks up whole on the way back in. And
 * `required` appears at both levels, which is what a narrowed form has to
 * narrow with it: a form asking for a field that is no longer on it cannot be
 * filled in, and the Save above it never comes back.
 */
const SCHEMA = Object.freeze({
  title: 'Subject',
  type: 'object',
  properties: {
    EXTERNAL_ID: { type: 'string', title: 'External ID', maxLength: 100 },
    NOTE: { type: 'string', title: 'Note', maxLength: 2000 },
    'subject.info': {
      type: 'object',
      title: 'Subject Info',
      properties: {
        NAME: { type: 'string', title: 'Name' },
        UNIT: { type: 'integer', title: 'Unit', enum: [1, 2], enumNames: ['One', 'Two'] },
        KIND: { type: 'integer', title: 'Kind' }
      },
      required: ['NAME', 'UNIT']
    },
    'subject.location.info': {
      type: 'object',
      title: 'Location',
      properties: {
        VILLAGE: { type: 'integer', title: 'Village' },
        EAST: { type: 'number', title: 'East' }
      },
      required: ['VILLAGE', 'EAST']
    }
  },
  dependencies: {},
  required: ['EXTERNAL_ID']
});

describe('pickFields', () => {
  let warned;

  beforeEach(() => { warned = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
  afterEach(() => { warned.mockRestore(); });

  it('keeps what was named, in the order it was named', () => {
    const out = pickFields(SCHEMA, ['NOTE', 'EXTERNAL_ID']);
    expect(Object.keys(out.properties)).toEqual(['NOTE', 'EXTERNAL_ID']);
    expect(out.properties.NOTE).toEqual(SCHEMA.properties.NOTE);
  });

  /**
   * The ambiguity the whole matching order exists for. `"subject.info"` is a
   * key with a dot in it; `"subject.info.NAME"` is that key and a field inside
   * it. Splitting at the first dot would find neither.
   */
  it('reaches a field inside a group whose own key has dots in it', () => {
    const out = pickFields(SCHEMA, ['subject.info.NAME']);
    expect(Object.keys(out.properties)).toEqual(['subject.info']);
    expect(Object.keys(out.properties['subject.info'].properties)).toEqual(['NAME']);
    expect(out.properties['subject.info'].title).toBe('Subject Info');
  });

  it('gathers several fields of one group into that one group, in order', () => {
    const out = pickFields(SCHEMA, ['subject.info.UNIT', 'NOTE', 'subject.info.NAME']);
    expect(Object.keys(out.properties)).toEqual(['subject.info', 'NOTE']);
    expect(Object.keys(out.properties['subject.info'].properties)).toEqual(['UNIT', 'NAME']);
  });

  it('takes a whole group when the group itself is named', () => {
    const out = pickFields(SCHEMA, ['subject.location.info']);
    expect(out.properties['subject.location.info']).toEqual(SCHEMA.properties['subject.location.info']);
  });

  /**
   * The code list survives the narrowing, because it is the field. RJSF still
   * reads the deprecated `enumNames` -- with a warning -- so a picked code
   * field shows its names rather than its ids.
   */
  it('carries a field over whole, code list and all', () => {
    const out = pickFields(SCHEMA, ['subject.info.UNIT']);
    expect(out.properties['subject.info'].properties.UNIT).toEqual(SCHEMA.properties['subject.info'].properties.UNIT);
  });

  it('narrows a group\'s required to the fields that survived', () => {
    const out = pickFields(SCHEMA, ['subject.info.NAME']);
    expect(out.properties['subject.info'].required).toEqual(['NAME']);
  });

  it('drops a group\'s required entirely when none of them was picked', () => {
    const out = pickFields(SCHEMA, ['subject.info.KIND']);
    expect(out.properties['subject.info']).not.toHaveProperty('required');
  });

  it('narrows the top-level required the same way', () => {
    expect(pickFields(SCHEMA, ['EXTERNAL_ID']).required).toEqual(['EXTERNAL_ID']);
    expect(pickFields(SCHEMA, ['NOTE'])).not.toHaveProperty('required');
  });

  it('drops the table\'s title, because a few of its fields are not that table', () => {
    expect(pickFields(SCHEMA, ['NOTE'])).not.toHaveProperty('title');
  });

  it('says so when a name is not in the schema, and leaves it off the form', () => {
    const out = pickFields(SCHEMA, ['NOTE', 'NOT_A_FIELD', 'subject.info.NOT_A_FIELD']);
    expect(Object.keys(out.properties)).toEqual(['NOTE']);
    expect(warned).toHaveBeenCalledTimes(2);
    expect(warned.mock.calls.flat().join(' ')).toContain('NOT_A_FIELD');
  });

  it('gives the whole group when a group and one of its fields are both named', () => {
    const after = pickFields(SCHEMA, ['subject.info.NAME', 'subject.info']);
    const before = pickFields(SCHEMA, ['subject.info', 'subject.info.NAME']);
    expect(after.properties['subject.info']).toEqual(SCHEMA.properties['subject.info']);
    expect(before.properties['subject.info']).toEqual(SCHEMA.properties['subject.info']);
  });

  it('leaves a schema alone when nothing was picked', () => {
    expect(pickFields(SCHEMA, undefined)).toBe(SCHEMA);
    expect(pickFields(SCHEMA, [])).toBe(SCHEMA);
    expect(pickFields(null, ['NOTE'])).toBeNull();
  });

  /**
   * The schema came from a service and may be handed to this again -- on a
   * second panel, or a re-render -- so narrowing has to be a copy. A pick that
   * edited the source would narrow it a little further every time.
   */
  it('does not touch the schema it was given', () => {
    const copy = JSON.parse(JSON.stringify(SCHEMA));
    pickFields(SCHEMA, ['subject.info.NAME', 'EXTERNAL_ID']);
    expect(SCHEMA).toEqual(copy);
  });

  it('keeps only the dependencies whose driver is still on the form', () => {
    const schema = {
      ...SCHEMA,
      dependencies: { EXTERNAL_ID: { required: ['NOTE'] }, NOTE: { required: ['EXTERNAL_ID'] } }
    };
    expect(pickFields(schema, ['NOTE']).dependencies).toEqual({ NOTE: { required: ['EXTERNAL_ID'] } });
    expect(pickFields(schema, ['subject.info'])).not.toHaveProperty('dependencies');
  });
});

describe('fetchSchema', () => {
  let logged;

  beforeEach(() => {
    globalThis.window = { server: 'https://host/services' };
    axios.get.mockReset();
    logged = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    logged.mockRestore();
    delete globalThis.window;
  });

  const said = () => logged.mock.calls.flat().join(' ');

  it('binds the path and prefixes the shell\'s server', async () => {
    axios.get.mockResolvedValue({ data: SCHEMA });
    const schema = await fetchSchema('/Ws/getTableJSONSchema/{session}/SUBJECT', { session: 'abc' });
    expect(axios.get).toHaveBeenCalledWith('https://host/services/Ws/getTableJSONSchema/abc/SUBJECT');
    expect(schema).toBe(SCHEMA);
  });

  /**
   * The shape these services refuse in: a label code, under a 200. Handed to
   * RJSF it is an exception thrown from inside a form; here it is a sentence.
   */
  it('answers null for a body that is not a schema, and says which body', async () => {
    axios.get.mockResolvedValue({ data: 'x.error.no_session' });
    expect(await fetchSchema('/Ws/schema/{session}', { session: 'abc' })).toBeNull();
    expect(said()).toContain('https://host/services/Ws/schema/abc');
  });

  it('answers null for an object with no properties, which is not a form either', async () => {
    axios.get.mockResolvedValue({ data: { title: 'Subject', type: 'object' } });
    expect(await fetchSchema('/Ws/schema/abc')).toBeNull();
  });

  it('answers null for a request that failed, rather than throwing into a render', async () => {
    axios.get.mockRejectedValue(new Error('403'));
    expect(await fetchSchema('/Ws/schema/abc')).toBeNull();
    expect(said()).toContain('no form schema');
  });

  it('asks nothing when the row named no path', async () => {
    expect(await fetchSchema(undefined)).toBeNull();
    expect(axios.get).not.toHaveBeenCalled();
  });
});

describe('usableUI', () => {
  let warned;

  beforeEach(() => { warned = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
  afterEach(() => { warned.mockRestore(); });

  /**
   * The fault this exists for. A deployment registers its own widgets on the
   * component that renders record forms, and a table's layout names them --
   * so a layout fetched into this row would not render plainly, it would throw
   * out of the middle of a render and take the panel with it.
   */
  it('drops a widget the form has no component for, and keeps the rest of the entry', () => {
    const ui = { 'a.b': { DATE_FROM: { 'ui:widget': 'CustomDateWithNowButton', 'ui:helpCode': 'help.date' } } };
    const out = usableUI(ui);
    expect(out['a.b'].DATE_FROM).toEqual({ 'ui:helpCode': 'help.date' });
    expect(warned.mock.calls.flat().join(' ')).toContain('CustomDateWithNowButton');
  });

  it('keeps the widgets RJSF has, by alias and by component name', () => {
    const ui = { NOTE: { 'ui:widget': 'textarea' }, HIDE: { 'ui:widget': 'hidden' }, X: { 'ui:widget': 'TextareaWidget' } };
    expect(usableUI(ui)).toBe(ui);
    expect(warned).not.toHaveBeenCalled();
  });

  /**
   * `updown` is a widget, on a number. Asked for on a string it throws exactly
   * as loudly as a name nobody has, which is why the schema is walked beside
   * the layout rather than the names being checked in a flat list.
   */
  it('reads a widget against the type of the field it is on', () => {
    const schema = { type: 'object', properties: { N: { type: 'number' }, S: { type: 'string' } } };
    expect(usableUI({ N: { 'ui:widget': 'updown' } }, schema).N).toEqual({ 'ui:widget': 'updown' });
    expect(usableUI({ S: { 'ui:widget': 'updown' } }, schema).S).toEqual({});
  });

  it('reaches a field inside a group, and a group is keyed by a dotted name', () => {
    const schema = {
      type: 'object',
      properties: { 'a.b': { type: 'object', properties: { N: { type: 'number' } } } }
    };
    const out = usableUI({ 'a.b': { N: { 'ui:widget': 'range' }, ORDER: { 'ui:widget': 'range' } } }, schema);
    expect(out['a.b'].N).toEqual({ 'ui:widget': 'range' });
    // ORDER is not in the schema, so its type is unknown and a real RJSF name
    // is let through rather than taken out on a guess.
    expect(out['a.b'].ORDER).toEqual({ 'ui:widget': 'range' });
  });

  it('leaves ui: settings alone, including an object of options', () => {
    const ui = { NOTE: { 'ui:options': { rows: 4, label: false }, 'ui:readonly': true, 'ui:order': ['a', 'b'] } };
    expect(usableUI(ui)).toBe(ui);
  });

  it('says nothing and hands back what it was given when there is no layout', () => {
    expect(usableUI(undefined)).toBeNull();
    expect(usableUI('epi.error.no_session')).toBe('epi.error.no_session');
  });
});

describe('fetchUISchema', () => {
  let logged;

  beforeEach(() => {
    globalThis.window = { server: 'https://host/services' };
    axios.get.mockReset();
    logged = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    logged.mockRestore();
    delete globalThis.window;
  });

  it('takes any object, because a layout has no required shape', async () => {
    const ui = { NOTE: { 'ui:widget': 'textarea' } };
    axios.get.mockResolvedValue({ data: ui });
    expect(await fetchUISchema('/Ws/getTableUISchema/{session}/SUBJECT', { session: 'abc' })).toBe(ui);
    expect(axios.get).toHaveBeenCalledWith('https://host/services/Ws/getTableUISchema/abc/SUBJECT');
  });

  it('takes an empty object, which is a table that decorates nothing', async () => {
    axios.get.mockResolvedValue({ data: {} });
    expect(await fetchUISchema('/Ws/ui/abc')).toEqual({});
  });

  it('answers null for a label code, and says which path said it', async () => {
    axios.get.mockResolvedValue({ data: 'x.error.no_session' });
    expect(await fetchUISchema('/Ws/ui/abc')).toBeNull();
    expect(logged.mock.calls.flat().join(' ')).toContain('form layout');
  });
});

describe('withGroups', () => {
  /**
   * The gap this closes. A grouppath keeps its `required` inside the group and
   * nothing above says the group has to be there, so `{}` -- which is what an
   * untouched form is -- satisfies a schema every field of which is mandatory,
   * and a Save gated on the error count is live over an empty form.
   */
  it('puts an empty object where a group is missing, so its required is read', () => {
    const narrowed = pickFields(SCHEMA, ['subject.info.NAME', 'NOTE']);
    expect(withGroups({}, narrowed)).toEqual({ 'subject.info': {} });
  });

  it('leaves what was typed alone', () => {
    const narrowed = pickFields(SCHEMA, ['subject.info.NAME', 'NOTE']);
    expect(withGroups({ 'subject.info': { NAME: 'a' }, NOTE: 'b' }, narrowed))
      .toEqual({ 'subject.info': { NAME: 'a' }, NOTE: 'b' });
  });

  it('reaches a group inside a group', () => {
    const schema = {
      type: 'object',
      properties: { outer: { type: 'object', properties: { inner: { type: 'object', properties: { X: { type: 'string' } } } } } }
    };
    expect(withGroups({}, schema)).toEqual({ outer: { inner: {} } });
  });

  it('reads a node with properties as a group whatever it says its type is', () => {
    const schema = { type: 'object', properties: { 'a.b': { properties: { X: { type: 'string' } }, required: ['X'] } } };
    expect(withGroups({}, schema)).toEqual({ 'a.b': {} });
  });

  it('does not touch what it was given', () => {
    const data = { NOTE: 'b' };
    const narrowed = pickFields(SCHEMA, ['subject.info.NAME', 'NOTE']);
    withGroups(data, narrowed);
    expect(data).toEqual({ NOTE: 'b' });
  });

  it('hands back the form untouched when there is no schema to read', () => {
    expect(withGroups({ a: 1 }, null)).toEqual({ a: 1 });
    expect(withGroups(undefined, null)).toEqual({});
  });
});
