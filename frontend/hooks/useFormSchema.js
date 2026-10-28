import { React } from 'perun-core';
import { fetchSchema, fetchUISchema, pickFields, usableUI } from '../data/form';
import { bindPath } from '../data/path';

const { useEffect, useMemo, useState } = React;

// Depends on the resolved path rather than the bindings, which carry the date window and would re-ask
// for the schema whenever the dates move.
const requestFor = (path, bindings) => (path ? bindPath(path, bindings ?? {}) : null);

const sourceOf = (value) => ({
  path: typeof value === 'string' ? value : null,
  inline: value && typeof value === 'object' ? value : null
});

// `schema` and `uiSchema` are each written out inline or named by a service path. Both requests go
// out together so the form doesn't render once and then change shape.
export const useFormSchema = ({ form, bindings }) => {
  const { path, inline } = sourceOf(form?.schema);
  const ui = sourceOf(form?.uiSchema);

  const request = requestFor(path, bindings);
  const uiRequest = requestFor(ui.path, bindings);

  const [fetched, setFetched] = useState(null);
  const [fetchedUI, setFetchedUI] = useState(null);
  const [loading, setLoading] = useState(Boolean(path || ui.path));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!path && !ui.path) {
      setFetched(null);
      setFetchedUI(null);
      setLoading(false);
      // A `form` block with no schema would otherwise be a Save button above nothing.
      const misconfigured = Boolean(form) && !inline;
      if (misconfigured) {
        console.error('perun-atlas: draw.form needs `schema` -- either the schema itself, or the path to a service that answers with one. Got', form?.schema);
      }
      setFailed(misconfigured);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setFailed(false);

    Promise.all([
      path ? fetchSchema(path, bindings) : Promise.resolve(null),
      ui.path ? fetchUISchema(ui.path, bindings) : Promise.resolve(null)
    ]).then(([schema, layout]) => {
      if (cancelled) return;
      setFetched(schema);
      setFetchedUI(layout);
      // A missing layout costs the form its widgets; a missing schema costs it its fields.
      setFailed(Boolean(path) && !schema);
      setLoading(false);
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, request, ui.path, uiRequest, Boolean(form), Boolean(inline)]);

  // By value: a menu row arrives as a fresh object on every render.
  const picked = form?.pick?.join('\u0000') ?? null;

  const schema = useMemo(
    () => pickFields(path ? fetched : inline, form?.pick),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetched, inline, path, picked]
  );

  // Filtered either way: a hand-written widget is as absent from this registry as a fetched one.
  const uiSchema = useMemo(
    () => usableUI(ui.path ? fetchedUI : ui.inline, schema) ?? undefined,
    [fetchedUI, ui.inline, ui.path, schema]
  );

  return { schema, uiSchema, loading, failed };
};
