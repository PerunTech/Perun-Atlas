# perun-atlas

A shared map layer for svarog bundles.

Modules that need a map depend on this rather than on `spatial` directly. That
keeps the map engine's API to a single caller, so its migrations happen in one
place instead of in every product, and gives consumers components in the shape
they actually need.

## The one rule

**Only `frontend/spatial.js` may import `spatial`.** Everything else imports from
there. If a component cannot be written without reaching for `core.factory`, the
component API is not finished — that is the signal, not the workaround.

## Layout

| Path | Contents |
|---|---|
| `frontend/index.js` | The whole public surface — see below. The webpack entry for a production build. |
| `frontend/client.js` | Registers the package with perun-core's plugin manager. The webpack entry for `build-dev` and `dev` only; a production bundle is loaded by the shell as an `IPerunPlugin` script instead. |
| `frontend/spatial.js` | The single point of contact with the map engine. |
| `frontend/config/` | `SCHEMA` — every environment setting declared once. |
| `frontend/bootstrap/` | Resolves configuration: overrides → SVAROG_SYS_PARAMS → `window` (deprecated) → defaults. Throws, loudly, on a missing required value. |
| `frontend/data/` | Everything that crosses the wire or the projection: geometry fetching and geobuf decoding, bounding boxes and rings, rows, writes, exports, which features a drawn shape covers, the GEO_LAYER_TYPE catalogue. |
| `frontend/appearance/` | What a feature looks like and what it says, decided from a descriptor. Plain data — no DOM, no engine — which is what makes it the half of the package the suite can test. |
| `frontend/style/` | The stylesheets, and only those. A deployment overrides them; read `frontend/style/README.md` before debugging one. |
| `frontend/components/` | The map, the screen around it and the chrome on it. `layers/` render nothing and put their features on the map through Leaflet. |
| `frontend/hooks/` | The panel's state, in the pieces it is made of: the date window, the choropleth's rows, the drawn shape with its save and what it caught, the export, the record pane. |
| `frontend/lib/` | The small shared pieces the components and the hooks are both built out of. `frontend/lib/README.md` lists them. |
| `build/` | The webpack hook that injects this package's CSS at `head.firstChild`. `frontend/style/README.md` says why that matters. |
| `docs/menu-row.md` | Every key a menu row may set for `ConfiguredMap`, with its defaults. The contract consuming bundles write rows against. |
| `test/` | The unit suite, and the two stubs standing in for the shell. |
| `backend/` | OSGi wrapper. Serves the bundle and registers it as a Perun plugin. No web services. |

`hooks/` and `lib/` are the two directories nothing exports. That is what makes
them free to change shape without the change being a breaking one.

## What a consumer gets

```js
import { ConfiguredMap, FeaturePanel, AtlasMap, PointPicker } from 'perun-atlas';
import * as atlas from 'perun-atlas';   // atlas.appearance, .bootstrap, .config, .data
```

Thirteen components, and four namespaces beside them. `ConfiguredMap` is the one
most screens want: it reads a menu row and builds the rest. `docs/menu-row.md`
describes every key a row may set.

`appearance` was called `style` until the stylesheets took that name back.

## Tests

```
pnpm test          # once
pnpm run test:watch
pnpm run lint      # what CI asks; lint:fix repairs your working tree instead
```

Vitest, no DOM. Everything under test is the half of this package that does not
need a map: projections and rings, descriptors and palettes, the join, the CSV,
the save body and its verdict.

Two things make that possible. `perun-core` and `spatial` are the shell's and
are `externals` in a production build, so a run points those two bare specifiers
at `test/stubs/`; the spatial stub carries Leaflet's own projection and distance
formulas rather than invented ones, because `unitsPerMetre` measures a
projection by using it and a stub with made-up arithmetic would only test
itself. And the suite lives outside `frontend/` because the pipeline's guards
grep that directory for coordinate literals, which is most of what a test for
`ringIn` is.

A component or a hook is not covered. That wants a DOM and a React renderer,
and neither is installed.

## Styling

Structure ships here; the look is the deployment's. Every colour in
`frontend/style/` comes from a token, and the deployment sets the tokens — on
these registries that is `aims-assets/assets/styles/atlas-panel.css`, which also
has to be listed in `assets/js/stylesheets.js` or the panel draws unstyled.

The cascade runs the deployment's way on purpose: webpack injects this package's
CSS at `document.head.firstChild`, so every one of the deployment's stylesheets
loads after it and wins on equal specificity. That has a sharp edge — a bare
element selector over there reaches in here, and an inherited property carries
further than the element it was written for. `frontend/style/README.md` has the
case that cost a day, the rule that follows from it, and how to reproduce a bug
that only appears in the running app.

## Configuration

Settings resolve from `SVAROG_SYS_PARAMS`, editable live through the admin
console. `window` globals still work but warn — they are a migration shim, not
architecture. A required setting with no value throws at startup naming the
parameter, rather than falling back to a plausible map of the wrong country.

Add a setting by adding a row to `frontend/config/Schema.js` and nothing else.

## Deployment

Loaded by the shell as an `IPerunPlugin` script. Its `sortOrder` (4) must stay
above `spatial`'s (3): this bundle resolves the `spatial` global as its own script
evaluates, so spatial has to load first.

## Reading a response

Every fetch logs what came back, on every environment, with nothing to switch on.
Each entry is a collapsed group in the console carrying the URL, the byte count,
the feature count and the decoded FeatureCollection as a live object:

```
perun-atlas: 42 feature(s), 8310 bytes — https://.../Ws.../get/...
```

The newest collection also stays at `window.PERUN_ATLAS_LAST`, so devtools'
`copy(PERUN_ATLAS_LAST)` puts the whole thing on the clipboard — usually the
quickest way to compare what arrived against what the encoder meant to send.

There is deliberately no flag. The people this serves are debugging an encoder
against a deployed environment, and a switch they have to be told about is a
switch that is off at the moment it would have explained something. Two
consequences worth knowing:

- a bbox-scoped screen refetches on every `moveend`, so panning produces an entry
  per pan — collapsed, but present;
- `PERUN_ATLAS_LAST` holds a reference to the newest collection, so that one set
  is not collected while the page lives.

A body that decodes to no GeoJSON `type` warns and prints the body. That is the
shape a service takes when it has written a plain-text error into the stream
instead of a protobuf body, it would otherwise be indistinguishable from a query
that legitimately matched nothing, and the body is where the message is.

## Known constraint

`spatial` constructs one Leaflet map when its script evaluates, so `AtlasMap`
adopts that instance rather than creating one, and only one may be mounted at a
time. Lifting this is the point of spatial 2.0's `createMap` / `getMap`; when it
lands, only the mount effect in `AtlasMap` changes and no consumer is affected.

## Scope

This layer serves new bundles. The legacy GIS module is not migrated and keeps
running unchanged — it is a source of proven functionality to harvest, nothing
more.
