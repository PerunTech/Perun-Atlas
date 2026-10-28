// The two encoders stamp these properties in different cases.
export const descriptorOf = (feature) =>
  feature?.properties?.DESCRIPTOR ?? feature?.properties?.descriptor ?? null;

export const identityOf = (feature) => ({
  id: feature?.id ?? feature?.properties?.OBJECT_ID ?? null,
  parentId: feature?.properties?.parent_id ?? feature?.properties?.PARENT_ID ?? null
});

// `match` names which identity is the record's. Ids come from per-type sequences, so accepting
// either could match an unrelated record.
export const matchesIdentity = (feature, wanted, match = 'id') => {
  if (wanted === null || wanted === undefined) return false;

  const identity = identityOf(feature);
  const mine = match === 'parent' ? identity.parentId : identity.id;
  if (mine === null || mine === undefined) return false;

  return String(mine) === String(wanted);
};
