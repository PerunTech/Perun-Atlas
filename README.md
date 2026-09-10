# movement-atlas

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
| `frontend/spatial.js` | The single point of contact with the map engine. |
| `frontend/config/` | `SCHEMA` — every environment setting declared once. |
| `frontend/bootstrap/` | Resolves configuration: overrides → SVAROG_SYS_PARAMS → `window` (deprecated) → defaults. Throws, loudly, on a missing required value. |
| `frontend/data/` | Geometry fetching and geobuf decoding; the GEO_LAYER_TYPE catalogue. |
| `frontend/style/` | Descriptors and choropleth colouring. Engine-free, unit-testable without a map. |
| `frontend/components/` | `AtlasMap`, `Choropleth`. |
| `backend/` | OSGi wrapper. Serves the bundle and registers it as a Perun plugin. No web services. |

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

## Known constraint

`spatial` constructs one Leaflet map when its script evaluates, so `AtlasMap`
adopts that instance rather than creating one, and only one may be mounted at a
time. Lifting this is the point of spatial 2.0's `createMap` / `getMap`; when it
lands, only the mount effect in `AtlasMap` changes and no consumer is affected.

## Scope

This layer serves new bundles. The legacy NAITS GIS module keeps running on
`Sofi.js` and is not migrated — it is a source of proven functionality to harvest,
nothing more.
