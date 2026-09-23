/**
 * What a decoded feature says about itself: the descriptor it was encoded with,
 * and which record it is.
 *
 * Both encoders stamp this on a feature's properties, and not in the same case,
 * so every read of it tolerates both rather than any caller knowing which
 * encoder a service used.
 */

/** Reads the svarog type descriptor a feature was encoded with. */
export const descriptorOf = (feature) =>
  feature?.properties?.DESCRIPTOR ?? feature?.properties?.descriptor ?? null;

/** Reads a feature's identity, tolerating both encoders' property casing. */
export const identityOf = (feature) => ({
  id: feature?.id ?? feature?.properties?.OBJECT_ID ?? null,
  parentId: feature?.properties?.parent_id ?? feature?.properties?.PARENT_ID ?? null
});

/**
 * Whether a feature is the record a screen is about.
 *
 * `match` names which of a feature's two identities to compare against. A
 * service routinely returns the record's *children* rather than the record --
 * a set of geometries hanging off one row -- and then the id worth matching is
 * on `parent_id` and the feature's own belongs to the geometry. `'id'` is the
 * default because it is the commoner case and because silence has to go on
 * meaning what it meant before.
 *
 * Deliberately not "try whichever one hits". Ids come from per-type sequences,
 * so a geometry and an unrelated record can hold the same number; a match that
 * accepted either would sometimes draw the wrong feature as the subject, on
 * exactly the screens this exists to serve, rarely and unreproducibly. Which
 * identity is the record's is something the caller knows and this cannot guess.
 *
 * Compared as text: an identity is a name, and the two sides reach here from
 * different places -- one decoded from the wire, one out of a configuration --
 * so one of them being a number is not a difference.
 *
 * @param {Object} feature - The GeoJSON feature.
 * @param {string|number} wanted - The record's id, or nothing for no subject.
 * @param {'id'|'parent'} [match] - Which identity to compare. Defaults to 'id'.
 * @returns {boolean}
 */
export const matchesIdentity = (feature, wanted, match = 'id') => {
  if (wanted === null || wanted === undefined) return false;

  const identity = identityOf(feature);
  const mine = match === 'parent' ? identity.parentId : identity.id;
  if (mine === null || mine === undefined) return false;

  return String(mine) === String(wanted);
};
