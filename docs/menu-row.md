# Menu-row reference

A map screen in a consuming bundle is a menu button whose `objectConfiguration`
describes the map. `ConfiguredMap` reads that configuration and builds the
screen, so adding a map to a registry means adding a menu row. The bundle
itself needs no new code.

```js
import { ConfiguredMap } from 'perun-atlas';

<ConfiguredMap
  objConfig={button.objectConfiguration}
  objectId={props.objectId}
  labelDomain='<the bundle's module name, as labelsManager spells it>'
  onClose={close}
/>
```

This page lists every key a row may set. Everything is optional except
`service`: a row without it renders a notice (label code
`map_service_missing`) rather than a map.

`FeaturePanel` takes the same keys as props, for a screen that builds its
configuration in code, with four differences: `service` is `servicePath`,
`export` is `exportable`, `subject` needs its own `id`, and every word is
passed already resolved rather than as a label code (`labelResolver` resolves
the codes descriptors carry).

## A minimal row

```json
{
  "service": "/WsExample/get/{session}/{objectId}/{from}/{to}",
  "descriptors": {
    "SITE": { "marker": { "style": { "background": "#2e7d32" } },
              "label":  { "field": "NAME" } }
  },
  "presets": [{ "months": 3, "label": "three_months" },
              { "months": 12, "label": "one_year" }],
  "title": "sites_map"
}
```

## Words on screen are label codes

Every visible word a row supplies is a label code: `title`, preset labels,
everything in `labels`, a descriptor's `legend`, popup field labels and
`choropleth.unknownLabel`. Each one is resolved through `labelsManager` against
`labelDomain`. A code that has not been registered shows the panel's own
neutral English wording, never the raw message id.

Column names are tried as codes too. The record pane, the CSV headers and the
legend each look up the column or descriptor name, lowercased, as a code. If no
such code is registered, the name itself is shown. So a bare `VILLAGE_CODE` on
screen means `village_code` needs registering.

## Placeholders

Service paths, and the strings inside a save body, take `{name}` placeholders.
They are resolved in the browser, per request. Server-side `%TOKEN%`
placeholders are already substituted before the row reaches the browser.

| Placeholder | Value |
|---|---|
| `{session}` | The session, from the store unless the caller passes one. |
| `{objectId}` | The record the screen is about. |
| `{from}`, `{to}` | The date window, as `YYYY-MM-DD`. A path that names either one gets the date controls; a path that names neither gets none. |
| `{srid}` | The EPSG code this deployment stores geometry in (`sys.gis.default_srid`), without the prefix. |
| `{map.bbox}` | The visible extent. **Choropleth only**, re-resolved every time the map stops moving. A feature set is fetched once and never supplies it. |
| anything in `context` | Extra values, resolved per record. |
| `{draw.*}`, `{form}`, `{note}` | Save paths and bodies only. See [draw](#draw). |

A dotted name reaches into an object (`{map.bbox}`). At any step, the rest of
the name is first tried as a literal key, so `{row.TABLE.COLUMN}` also finds a
flat `"TABLE.COLUMN"` key. A placeholder that resolves to nothing is left in the
string as written, so a request that names an unknown value fails visibly
instead of silently sending an empty segment.

## Top-level keys

| Key | Type | What it does |
|---|---|---|
| `service` | string | **Required.** Path of the geometry service (geobuf). |
| `context` | object | Extra placeholder values. |
| `descriptors` | object | Descriptor name → how its features are drawn. See [descriptors](#descriptors). |
| `subject` | `{ descriptor, match }` | Draw the screen's own record with another descriptor. See [subject](#subject). |
| `cluster` | bool / number / object | Collapse points into counted badges. See [cluster](#cluster). |
| `presets` | `[{ months, label }]` | Quick date ranges, **longest last**. Shown only when the path takes `{from}`/`{to}`. |
| `defaultMonths` | number | Which preset is selected on open. Defaults to the longest preset, or 12 months. |
| `title` | label code | The heading, when the caller passes no `title` prop. |
| `labels` | object | The panel's other words. See [labels](#labels). |
| `map` | object | The map's controls. See [map](#map). |
| `export` | false / object | The file buttons. See [export](#export). |
| `legend` | false / corner | The key. See [legend, notice, tokens](#legend-notice-tokens). |
| `notice` | false | Withhold the "nothing to show" card. |
| `tokens` | object | CSS custom properties for the panel. |
| `choropleth` | object | Colour areas by a category instead. See [choropleth](#choropleth). |
| `draw` | object | Let the reader draw a circle and send it somewhere. See [draw](#draw). |

## descriptors

Each feature carries the descriptor its producer stamped on it (`DESCRIPTOR`).
The row says how each descriptor is drawn:

```json
"descriptors": {
  "LINK": {
    "style":  { "color": "#b26a00", "weight": 2, "dashArray": "4 4" },
    "arrow":  { "reverse": true },
    "variants": { "by": "DIRECTION",
                  "cases": { "IN":  { "style": { "color": "#1565c0" } },
                             "OUT": { "style": { "color": "#c62828" } } } },
    "legend": "link_legend"
  },
  "SITE": {
    "marker":  { "size": 24, "className": "my-marker", "style": { "background": "#2e7d32" } },
    "label":   { "field": "NAME", "scale": { "min": 12, "max": 18 } },
    "popup":   { "title": "NAME", "fields": [{ "label": "site_code", "field": "CODE" }] }
  }
}
```

| Key | Shape | Notes |
|---|---|---|
| `style` | Leaflet path options | Lines and polygons. |
| `marker` | `{ className, size, style }` | Points. `size` defaults to 24 px. `style` is CSS declarations, which is how a row styles a marker without a stylesheet. |
| `label` | `{ field, scale: { min, max }, className, style, direction, offset }` | A permanent label showing `field`'s value. With `scale`, it shows only between those zoom levels, inclusive; without it, it is always shown. Points put the label above the marker, areas in the middle. `field` is read as a flat property. |
| `popup` | `{ title, fields: [{ label, field }], className, style, titleStyle, labelStyle, valueStyle }` | Opened on click. **`title` names a field**, and the popup shows that field's value. Empty fields are dropped, and a popup left with nothing to show is not bound. |
| `details` | `{ title, exclude, className, style, titleStyle, labelStyle, valueStyle }` | Show the whole record in a pane beside the map instead of a popup. Every column is shown except the system fields (`DESCRIPTOR`, `pkid`, `parent_id`, `type`, `status`) and the ones named in `exclude`. `title` names a field, as in `popup`. A descriptor with `details` binds no popup. |
| `arrow` | `{ pixelSize, repeat, offset, reverse }` | Direction heads along a line. Defaults: 12 px, every 160 px, starting at 12%. `reverse` points them back along the path. |
| `variants` | `{ by, cases }` | One column splits the descriptor. Each case is merged over the descriptor, and applies to its style, marker, label, popup and arrows alike. Values with no case are drawn as the base descriptor. |
| `legend` | label code | What the key calls this descriptor. Without it, the key uses the variant case's value, or else the descriptor name. |

## subject

```json
"subject": { "descriptor": "SITE_SELF", "match": "parent" }
```

Features that are the screen's own record are drawn with `descriptor` instead
of the one the producer stamped. They are also never collapsed into a cluster.
The id compared is `objectId`. `match: "id"` (the default) compares each
feature's own id. `"parent"` compares its `parent_id`, which is what a service
returning the record's child geometries needs.

## cluster

| Value | Meaning |
|---|---|
| `true` | Always cluster points. |
| a number | Cluster only once a set has at least that many points. Usually the right choice, because one row serves records whose sets range from a handful of features to thousands. |
| `{ from, className, style, glide, ...plugin options }` | `from` is the threshold. `className` and `style` style the badge. `glide` is how long, in ms, lines take to follow their ends into a badge (default 280, `false` for none). Anything else is passed to the Leaflet.markercluster plugin. |

Only points cluster; lines and polygons in the same set are left alone. A line
ending on a clustered point is re-aimed at the badge standing for it.

## labels

Label codes for the panel's own words, keyed as below. A key left out, or a
code that is not registered, shows the default.

| Key | Default |
|---|---|
| `from`, `to`, `invalidRange` | From · To · The end date is before the start date. |
| `reset`, `widen` | Reset range · Try (followed by the longest preset's label) |
| `empty`, `emptyHint` | Nothing in this range / Nothing to show · (none) |
| `loading`, `saving` | Loading… · Saving… |
| `labels` | Labels (the toggle for permanent labels) |
| `legend` | Legend (the key's heading) |
| `showAll` | Show all (the key's button that switches every row back on) |
| `details`, `close` | Details · Close |
| `exportGeoJSON`, `exportCsv` | GeoJSON · CSV |
| `draw` | Draw an area (the button that arms the map) |
| `drawing` | Click a centre, then an edge |
| `radius`, `metres`, `caught` | Radius · m · inside |
| `note`, `notePlaceholder` | Note · (none) |
| `save`, `discard` | Save · Discard |
| `saveTooSmall`, `saveIncomplete` | Explains why nothing was sent: the radius rounds to zero, or mandatory form fields are empty. |
| `formLoading`, `formFailed` | Loading the fields… · These fields did not load, so there is nothing to save into. |

## map

Everything here is passed to `AtlasMap`. Every control is on unless a row turns
it off, and each one's position takes a Leaflet corner (`topleft`,
`bottomright`, …).

| Key | Default |
|---|---|
| `layerSwitcher` | `true` on a configured screen |
| `zoomControl`, `zoomPosition` | on, `bottomright`. `"rail"` replaces the two buttons with a zoom ladder. |
| `zoomMarks` | `[{ from, to, kind, label }]`: bands on the rail. `kind` becomes a CSS class; leave out `to` for a line instead of a band. The basemap's own tile ceiling is marked without being asked. |
| `zoomLabels` | `{ in, out, level, upscaled, fit }`: the rail's own words. `fit` also names the `fit` button in the plain two-button bar, which otherwise keeps Leaflet's own titles. These are words, not label codes. |
| `fit` | on. A button in the zoom control, above the `+`, that frames the map on the features again, with the same margin the first view had. It frames what is shown, so a kind switched off in the key is left out. It appears once a feature set has drawn something. A choropleth has no such button: its set is whatever is in view, so there is nothing to go back to. With `zoomControl: false` there is no button either, since it has nowhere to sit. |
| `coordinates`, `coordinatesPosition` | on, `bottomcenter` (falls back to `bottomleft` on an older engine) |
| `measure`, `measurePosition`, `measureTools` | on, `topleft`. `measureTools` narrows which tools the control offers. |
| `fullscreen`, `fullscreenPosition` | on, `topleft` |
| `locate`, `locatePosition` | on, `topleft`. The browser only answers over https or on localhost. |
| `scale`, `scalePosition`, `scaleRatio` | on, `bottomleft`, and a `1:25 000` line under the bar |
| `overrides` | Environment settings for this screen only (`crs`, `center`, `zoom`, …), taking precedence over `SVAROG_SYS_PARAMS`. |

## export

Left out, the set is offered as GeoJSON and CSV. `false` withholds the buttons.
An object chooses what is offered:

| Key | Meaning |
|---|---|
| `geojson`, `csv` | `false` drops that button. |
| `filename` | The file name's stem (default `features`). The date range, or today's date, is appended, as is `within-<radius>` when a drawn circle narrowed the set. |
| `fields` | `[{ field, label }]` fixes the CSV's columns, their order and their headers. It also brings back system fields, if named. |
| `exclude` | Columns to drop on top of the system fields, when `fields` is not given. |

The buttons write what is on the map. A kind switched off in the key is left
out of the file, as is everything outside a drawn circle when `select` is set.

Without `fields`, every flat property in the set except the system fields
becomes a column. Point
coordinates are added as `latitude, longitude`, and any non-point shape as a WKT
`geometry` column.

## legend, notice, tokens

- **`legend`**: on by default. The key appears only when a set drew more than
  one kind of thing, and it lists only kinds that are actually on the map.
  `false` withholds it; a corner name (`"topright"`) moves it from
  `bottomleft`.

  Each row is also a switch. Pressing it takes that kind off the map, and
  pressing it again puts it back, with no request to the service. A row that is
  off stays in the key, struck through, and a **Show all** button appears under
  the rows. A switched-off kind stays off when the set is fetched again: when
  the date window moves, and on a choropleth whenever the map moves. The key
  stays up while any of its rows is off, even when only that one kind is left.
  Otherwise the way back would vanish with it.

  What is switched off is also left out of the files (see [export](#export)),
  out of a circle's count, and out of `{draw.selected.*}`. It is not in the
  frame the zoom control's `fit` button returns to.
- **`notice`**: `false` withholds the card saying a set came back empty. The
  card is never shown while a circle is being drawn.
- **`tokens`**: CSS custom properties on the panel's root, which is how a row
  sets colours with no stylesheet of its own: `--ap-accent`, `--ap-ink`,
  `--ap-muted`, `--ap-rule`, `--ap-surface`, `--ap-radius`, `--ap-label-font`,
  `--ap-value-font`, `--ap-map-height`. A deployment stylesheet loaded later
  still wins over these.

## choropleth

Draw the set as areas coloured by a category, instead of features drawn per
descriptor.

```json
"service": "/WsExample/areas/{session}/{map.bbox}/{srid}",
"choropleth": {
  "descriptor": "AREA",
  "status": "/WsExample/status/{session}/{objectId}",
  "join": { "featureKey": "CODE", "rowKey": "STATUS.AREA_CODE", "as": "status" },
  "field": "status.STATUS.LEVEL",
  "palette": { "0": "#9ccc65", "1": "#ffb300", "2": "#c62828" },
  "fallback": "#b8c6cc",
  "unknownLabel": "status_unknown",
  "tooltip": "NAME"
}
```

| Key | Meaning |
|---|---|
| `descriptor` | An entry in `descriptors`, which supplies the outline, the popup and `details`. |
| `status` | A second service whose rows carry the category. The map waits for these rows, so no area is drawn in the fallback colour and then corrected. If this service fails, the map still draws, with every area in the fallback colour. |
| `join` | `{ featureKey, rowKey, as }`: match each feature to a row, and put the row under `as` (default `status`). |
| `field` | Where the category is read: a property of the feature, or through the joined row as `as.COLUMN`. |
| `palette`, `fallback` | Category value → colour, and the colour for anything else. |
| `unknownLabel` | What the key calls the fallback band. |
| `tooltip` | A field shown on hover. |

`field`, `tooltip` and both join keys accept either shape a related column
arrives in: nested (`{ STATUS: { LEVEL } }`) or flat (`{ "STATUS.LEVEL": … }`).
The geometry service is asked again every time the map stops moving; the key
lists only the bands actually drawn. A coloured map has no label toggle,
because it names its areas on hover instead.

## draw

Lets the reader draw a circle, then either send it to a service (`save`), see
what it covers (`select`), or both. Circles are the only shape; a `shape` key
in a row is ignored.

```json
"draw": {
  "radius": { "min": 50, "max": 500000, "step": 50 },
  "style":  { "color": "#6a1b9a" },
  "form": {
    "schema": "/ReactElements/getTableJSONSchema/{session}/SOME_TABLE",
    "pick":   ["basic.DATE_FROM", "basic.DATE_TO", "REASON"]
  },
  "select": { "mode": "touches" },
  "save": {
    "onSave": "/WsExample/zone/save/{session}/{objectId}",
    "contentType": "application/json",
    "body": { "...": "{form}", "geometry": "{draw.geojson}", "RADIUS_M": "{draw.metres}" },
    "failure": "\\.error\\."
  }
}
```

| Key | Meaning |
|---|---|
| `radius` | `{ min, max, step }` for the radius field, in metres. Defaults 50 / 500000 / 50. |
| `style` | Leaflet path options for the circle. |
| `points` | How many vertices `{draw.ring}` and `{draw.geojson}` have (default 24). |
| `ring` | `{ point, join }`: how one vertex of `{draw.ring}` is written, and what goes between vertices. Defaults `"{x} {y}"` and `", "`, which is WKT. |
| `note` | `{ required }`: a free-text field beside the radius. A row moving to `form` should drop it rather than show both. |
| `form` | Schema-driven fields beside the radius. See below. |
| `select` | Ask which of the features on screen the circle covers. See below. |
| `save` | `{ onSave, body, contentType, encoding, failure }`. See below. |

A `draw` block needs `save.onSave` or `select`, or both; with neither, no draw
tool is shown. With `select` and no `save`, the screen draws only to look, and
offers no Save button.

### What a save can send

`onSave` resolves every placeholder above, plus these:

| Placeholder | Value |
|---|---|
| `{draw.lat}`, `{draw.lng}` | The centre, in degrees. |
| `{draw.metres}` | The radius on the ground, rounded to a whole metre. |
| `{draw.x}`, `{draw.y}` | The centre in the projection the deployment stores geometry in. |
| `{draw.radius}` | The radius in that projection's units, **rounded to an integer**. |
| `{draw.ring}` | The circle as a ring of vertices in that projection, open (the first vertex is not repeated). |
| `{draw.geojson}` | The same circle as a closed GeoJSON polygon. |
| `{draw.selected.count}`, `.ids`, `.geojson` | What the circle covers, when `select` is set. |
| `{note}` | The note field. |
| `{form}` | The form's data, as an object. |

**Degrees and radii.** A deployment that stores geometry in degrees (4326) has
no integer radius smaller than about 100 km, so `{draw.radius}` rounds to zero.
If a row that sends `{draw.radius}` produces a zero, it is refused before the
request goes out, and the console names the fix: send `{draw.metres}` for the
size and `{draw.ring}` or `{draw.geojson}` for the shape.

**The body.** `body` is a template. Its strings resolve like paths, except that
a string consisting of exactly one placeholder is replaced by the value itself,
not by its text. So `"{draw.geojson}"` sends an object and `"{draw.metres}"`
sends a number. The key `"..."` spreads an object into the body, and later keys
win, as in an object literal: `{ "...": "{form}", "geometry": "{draw.geojson}" }`.

**Encoding.** `contentType` defaults to `application/x-www-form-urlencoded`.
`encoding` (`"form"` or `"json"`) is inferred from it unless given. A nested
body, or any body carrying a grouppath key such as `"a.b"`, needs
`"contentType": "application/json"`. Form encoding can't carry either, and the
backend reads a grouppath as one literal key.

**Refusals.** A save counts as refused when the response has an envelope with
`"type": "ERROR"` (or `"EXCEPTION"`), when the HTTP status is an error, or when
a plain-text answer matches `failure`, a case-insensitive regular expression.
Use `failure` for services that answer a refusal with HTTP 200 and a bare label
code. Whatever came back is shown through the shell's `alertUserResponse`. On
success the circle is cleared and the layer refetches; on a refusal the circle
stays where it is.

### form

```json
"form": { "schema": "...", "uiSchema": "...", "pick": ["..."], "data": { } }
```

- **`schema`**: the JSON schema itself, or the path to a service that answers
  with one. Prefer the path (`/ReactElements/getTableJSONSchema/{session}/TABLE`),
  so a field added, renamed or made mandatory in the table reaches the form on
  its own.
- **`uiSchema`**: the same choice, for how the fields are drawn: the layout
  object itself, or the path to the service that answers with the table's
  layout. The two
  requests go out together and the form waits for both. A layout that never
  arrives only costs the widgets; a schema that never arrives leaves Save
  disabled, with the reason in the console. Widgets that only the record form
  registers are removed, and those fields fall back to what their schema implies.
- **`pick`**: which fields this row shows, in order. Name a top-level field by
  name, a field inside a group as `"group.FIELD"`, or a whole group by its name.
  A table's schema is the whole table, so a named schema usually wants a `pick`.
  A name the schema does not have is logged and left off.
- **`data`**: initial values. Discarding the circle puts these back.

Schema titles and group headings are not shown in the draw row; each field
keeps its own label. The form's data reaches a save as `{form}`, with grouppath
keys kept whole.

### select

`true` for the defaults, or `{ mode, id, join, export }`:

| Key | Default | Meaning |
|---|---|---|
| `mode` | `"touches"` | `"touches"`: anything reaching into the circle. `"contains"`: only what lies wholly inside it. |
| `id`, `join` | `"{pkid}"`, `","` | How one feature's identifier is written in `{draw.selected.ids}`, and what goes between them. |
| `export` | on | `false` keeps the file buttons writing the whole set instead of what the circle caught. |

The count appears beside the radius and updates as the radius changes. The
answer is computed in the browser over the set the layer fetched, less any kind
switched off in the key. For a feature
set that is the whole of it. A choropleth holds only what is in view, so
`select` there only covers the visible part of any circle reaching past the map
edge.
