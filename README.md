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
| `frontend/index.js` | The whole public surface — see below. The build's entry: `vite.config.mjs` makes it one UMD file, `backend/www/perun-atlas.js`, which the shell loads as an `IPerunPlugin` script. |
| `frontend/spatial.js` | The single point of contact with the map engine. |
| `frontend/config/` | `SCHEMA` — every environment setting declared once. |
| `frontend/bootstrap/` | Resolves configuration: overrides → SVAROG_SYS_PARAMS → `window` (deprecated) → defaults. Throws, loudly, on a missing required value. |
| `frontend/data/` | Everything that crosses the wire or the projection: geometry fetching and geobuf decoding, bounding boxes and rings, rows, writes, exports, which features a drawn shape covers, the GEO_LAYER_TYPE catalogue. |
| `frontend/appearance/` | What a feature looks like and what it says, decided from a descriptor. Plain data — no DOM, no engine — which is what makes it the half of the package the suite can test. |
| `frontend/style/` | The stylesheets, and only those. A deployment overrides them; read `frontend/style/README.md` before debugging one. |
| `frontend/components/` | The map, the screen around it and the chrome on it. `layers/` render nothing and put their features on the map through Leaflet. `panel/` holds the pieces `FeaturePanel` is drawn out of. `controls/` holds every control that goes on a map, one file each, and the context they read the map from. |
| `frontend/hooks/` | The panel's state, in the pieces it is made of: the date window, the choropleth's rows, the drawn shape with its save and what it caught, the export, the record pane, what the layer last reported. |
| `frontend/lib/` | The small shared pieces the components and the hooks are both built out of. `frontend/lib/README.md` lists them. |
| `frontend/modules/` | Libraries loaded on demand, each built by `vite.modules.config.mjs` as an ES module of its own beside the bundle: `shp.js`, the shapefile reader, is `backend/www/shp.perun-atlas.js`. Bytes in, plain data out; nothing here imports the engine or perun-core. |
| `build/` | The function that injects this package's CSS at `head.firstChild`, one `<style>` per sheet; `vite.config.mjs` puts it beside every stylesheet import. `frontend/style/README.md` says why that matters. |
| `docs/menu-row.md` | Every key a menu row may set for `ConfiguredMap`, with its defaults. The contract consuming bundles write rows against. |
| `test/` | The unit suite, and the two stubs standing in for the shell. |
| `backend/` | OSGi wrapper. Serves the bundle and registers it as a Perun plugin. No web services. |

Only the components and `config/` are exported. Everything else under
`frontend/` — `appearance/`, `bootstrap/`, `data/`, `hooks/`, `lib/` and
`components/panel/` — is the package's own, which is what makes it free to
change shape without the change being a breaking one.

## What a consumer gets

```js
import { ConfiguredMap, FeaturePanel, AtlasMap, PointPicker } from 'perun-atlas';
import * as atlas from 'perun-atlas';   // atlas.config.SCHEMA, atlas.version
```

Thirteen components, the settings schema as `config`, and the package's `name`
and `version`. `ConfiguredMap` is the one most screens want: it reads a menu row
and builds the rest. `docs/menu-row.md` describes every key a row may set.

That is the whole of it, and from 1.0.0 it is what a version number promises.
Before 1.0.0 the bundle also exported `appearance`, `bootstrap` and `data`, the
functions the components are built out of. No consumer read them, and as
exports every change to one would have been a breaking change, so they are the
package's own now. One a consumer needs can come back as an export of its own.

## Building

```
pnpm run build     # backend/www/perun-atlas.js and the modules beside it, all committed
pnpm run dev       # the same, then perun-atlas.js again on every save
```

Vite, in library mode: one UMD file publishing `window['perun-atlas']`, with
`perun-core` and `spatial` left to the shell's own globals. Each consumer's dev
server serves this file from a sibling checkout, so `dev` and a reload of the
consumer's page are the whole loop.

UMD cannot code-split, so a library too large for every screen is built as an
ES module of its own by `vite.modules.config.mjs`, into the same directory, and
`frontend/lib/modules.js` loads it with the browser's `import()` from beside
the bundle. The jar, the CI job that commits the build and each consumer's dev
server all take the whole directory, so a module needs nothing from any of
them. The bundle asks for each module with a version taken from its contents,
which is why `build` runs the modules first, and why `dev` does not rebuild them
on a save: change one and run `build`. A module has to arrive with a JavaScript
content type, since a browser refuses to run a module script served as
anything else.

## Tests

```
pnpm test          # once
pnpm run test:watch
pnpm run lint      # what CI asks; lint:fix repairs your working tree instead
```

Vitest, no DOM. Everything under test is the half of this package that does not
need a map: projections and rings, descriptors and palettes, the join, the CSV
and the KML, the save body and its verdict, and the files a reader opens. The
shapefiles among those are in `test/fixtures/shapefiles/`, made by GDAL with the
script beside them.

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

The cascade runs the deployment's way on purpose: the build injects this package's
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
evaluates, so spatial has to load first. The deployment's spatial has to be 4.2.1
or later (see "A map per mount").

## Versions

The version is the one in `backend/pom.xml`: the OSGi bundle the shell loads this
from carries it as its `Bundle-Version`. Between releases the pom names the next
one with `-SNAPSHOT`, as Maven expects. spatial is versioned the same way.

`package.json` names the last version cut, a release or a release candidate,
and the bundle's `version` export reports it at runtime. Each is tagged with its
number, as a lightweight tag, on the commit whose `package.json` says it. That
commit names its git dependencies by tag or by commit, never by branch.

- A candidate sets `package.json` to the pom's number with `-rc.N`
  (`1.0.0-rc.1`), rebuilds the bundle, and is tagged. The pom keeps its
  `-SNAPSHOT`, so nothing is released to Maven.
- A release drops the `-SNAPSHOT` from the pom, sets `package.json` to the same
  number, rebuilds, and is tagged (`1.0.0`). The next commit moves the pom to
  the next snapshot, and `package.json` stays until the next candidate. Push the
  release commit on its own first: CI deploys only the commit at the head of a
  push, so pushed together with the snapshot it would never be deployed.

Push each tag by name (`git push origin 1.0.0-rc.1`); `--follow-tags` skips
lightweight tags. A consumer depends on this package by tag:

```json
"perun-atlas": "git+https://git@gitlab.prtech.mk/svarog4/perun-atlas#semver:^1.0.0-rc.1"
```

pnpm takes the newest tag in the range, and the lockfile records its commit.
`^1.0.0-rc.1` takes candidates of 1.0.0 and then 1.0.0 itself, once a
`pnpm update perun-atlas` asks for it; `^1.0.0` skips candidates. spatial
arrives with this package, at the version it names, so a consumer names no
spatial of its own. perun-core it pins itself, by commit and with an override,
because this package and spatial each declare one and only the consumer's
override makes them one copy.

The tags have to stay lightweight: for an annotated tag pnpm 9 and 10 record
the tag's own hash and pnpm 11 the commit's, and pnpm 11 then refuses a lockfile
the others wrote.

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

## A map per mount

`AtlasMap` builds a map of its own each time it mounts, with spatial's
`createMap`, and removes it on unmount, with its layers, its controls and its
drawing tools. So a page can show more than one, such as a panel and a picker in
a dialog over it, and each draws, measures and clusters on its own. The controls
and layers an `AtlasMap` renders read its map from a context, and `onReady`
hands it out. A map takes the deployment's settings as they stand when it is
built and does not follow them afterwards.

This needs spatial 4.2.1 or later; `4.2.1-rc.1` is the first build that has it.
On an older spatial, which has only the one map it builds as its script
evaluates, `AtlasMap` renders a refusal naming the version and passes the same
error to `onError`. Before 1.0.0 this package borrowed that one map
instead, so only one `AtlasMap` could be mounted at a time.

## Scope

This layer serves new bundles. The legacy GIS module is not migrated and keeps
running unchanged — it is a source of proven functionality to harvest, nothing
more.
