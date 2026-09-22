The small shared pieces.

Package-private, and the only directory here that is: `bootstrap`, `config`,
`data` and `appearance` are all exported from `frontend/index.js`, and nothing
under `lib/` is. That is what makes it free to change shape without the change
being a breaking one.

It lived under `components/` until the panel's state moved into `hooks/`, and
two of these went with it — a hook reaching into a directory named for
components was the signal that the directory had outgrown the name. At package
level the name is right: these are what the components and the hooks are built
out of.

| File | |
|---|---|
| `dom.js` | Styling and building elements the package did not create. Nothing here ever builds a string of markup — values come from configuration and from records, and neither may become HTML. |
| `popup.js` | Popup rows as elements. `appearance/popupFor` decides what a popup says; this decides how it is built. |
| `cluster.js` | What the clustering plugin is asked for, and what a badge standing for a group is made of. Both settled before a layer exists. |
| `route.js` | Where a line's ends belong while its markers are being clustered. Arithmetic only; `FeatureSet` owns the animation. |
| `dates.js` | The date window as the wire writes it. Deliberately not a date library. |
| `zoom.js` | The zoom ladder as arithmetic: where a level sits on a rail, which thresholds fall inside the range, and the view's scale as a ratio. No map, no DOM, no projection — which is what puts the numbers the rail draws with under test. |
