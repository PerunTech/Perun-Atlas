/**
 * The properties every encoded feature carries, and nobody reads.
 *
 * spatial's `GeobufEncoder` stamps a svarog object's value map onto each
 * feature, so the wire carries the record's own columns and the object model's
 * bookkeeping in one flat map with nothing to tell them apart. These five are
 * the bookkeeping: `DESCRIPTOR` is the type name this package reads to choose
 * how a feature is drawn, and `pkid`, `parent_id`, `type` and `status` are what
 * every svarog row has whatever it is a row of.
 *
 * Kept in one place because two things have to agree about it -- the record
 * beside the map and the file it exports -- and a pane and a file describing one
 * record should not disagree about what that record is.
 *
 * Hidden by default rather than offered as a preset: a screen that wanted them
 * would have to name all five in every menu row, and none of them mean anything
 * to the person reading. A CSV that needs one back names it in `fields`, which
 * fixes the columns outright and does not consult this list.
 *
 * Framework names, not domain ones -- which is why they may be written here at
 * all. This package may not name a table, a service or a field of one; `pkid` is
 * as true of a holding as it is of an invoice.
 */
export const SYSTEM_FIELDS = ['DESCRIPTOR', 'pkid', 'parent_id', 'type', 'status'];
