The small shared pieces.

Package-private, like everything here but the components and `config`, which
`frontend/index.js` exports. That is what makes it free to change shape without
the change being a breaking one.

It lived under `components/` until the panel's state moved into `hooks/`, and
two of these went with it — a hook reaching into a directory named for
components was the signal that the directory had outgrown the name. At package
level the name is right: these are what the components and the hooks are built
out of.

`features/` is the part of that only the two layers drawing a fetched set use,
`FeatureSet` and `Choropleth`: how a set goes on the map, clusters, carries
arrow heads and labels, opens popups and takes the key's filter. None of it
imports the engine: what needs the map or the factory takes it as an argument,
which is what puts it under test. The rest of `lib/` is used across the package.

| File | |
|---|---|
| `dom.js` | Styling and building elements the package did not create. Nothing here ever builds a string of markup — values come from configuration and from records, and neither may become HTML. |
| `controls.js` | The parts of the map's own controls that need no map: what a measurement says, what a press of the locate button does, and which corner a control can go in. |
| `dates.js` | The date window as the wire writes it. Deliberately not a date library. |
| `icons.js` | The glyphs the map's controls are drawn with. Tabler's path data, transcribed — `elements.Icon` resolves through a dynamic import and two of the three controls that need these are Leaflet's, which take their contents as a string. |
| `link.js` | A link that reopens a map screen where the reader left it, read from and written into the query after the route. A function of the address it is given; the one thing held is which addresses have already been read. |
| `modules.js` | Loading a module this package builds beside the bundle rather than into it: where the bundle was loaded from, read while it evaluates, and the browser's `import()` from there. |
| `zip.js` | Files as one zip, for the shapefile export: the format by hand and the browser's own `CompressionStream`, rather than jszip's 100 KB for the same result. |
| `zoom.js` | The zoom ladder as arithmetic: where a level sits on a rail, which thresholds fall inside the range, the view's scale as a ratio, and the margin a set is framed with. No map, no DOM, no projection — which is what puts the numbers the rail draws with under test. |

| `features/` | |
|---|---|
| `surface.js` | Where a drawn set goes on the map -- the set itself, or a cluster with the pinned layers and the arrow heads beside it -- and taking its layers off the map and putting them back. Takes the map and the factory as arguments. |
| `cluster.js` | What the clustering plugin is asked for, and what a badge standing for a group is made of. Both settled before a layer exists. |
| `arrows.js` | The arrow heads on a set's lines, drawn into whichever group `surface.js` gives them. Takes the factory as an argument. |
| `route.js` | Where a line's ends belong while its markers are being clustered, and a path turned end to end. Arithmetic only. |
| `follow.js` | Putting a clustered set's lines where `route.js` says, as the view changes, and gliding them there. Takes the map as an argument rather than importing the engine, which is what puts it under test. |
| `labels.js` | A feature's permanent label, bound to its layer, and kept to the zoom band its descriptor allows. |
| `popup.js` | Popup rows as elements. `appearance/popupFor` decides what a popup says; this decides how it is built, and whether a caller's own content replaces it. |
| `filter.js` | Kinds switched off from the legend, applied to what a layer drew: which features move, the order the shown ones are drawn in, what the set reads as with the rest taken out, and where what is shown lies. `surface.js` does the moving. |
