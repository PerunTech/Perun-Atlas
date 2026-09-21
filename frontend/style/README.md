The stylesheets, and nothing else.

Six files, each imported for its side effect by the component it dresses —
`panel.css` and `draw.css` by `FeaturePanel`, `draw.css` again by
`CirclePicker`, `features.css` by `FeatureSet`, `legend.css` by `Legend`,
`picker.css` by `PointPicker`, `controls.css` by `AtlasMap`.

They are kept together rather than beside their components because a
deployment restyles this package from the outside, and one directory is the
visible surface of what it can restyle.

## Structure only

Everything here that has a colour takes it from the panel's tokens
(`--ap-accent`, `--ap-ink`, `--ap-rule`, …), so a screen described entirely in
a menu row still gets controls that match its accent. The values are the
deployment's: `aims-assets/assets/styles/atlas-panel.css` sets the tokens and
the rest of the look.

## The cascade runs the other way

webpack injects these at `document.head.firstChild` (`build/style-insert.js`),
so **every one of the deployment's stylesheets loads after them and wins on
equal specificity.** That is deliberate — the deployment owns the look — but it
has a consequence worth knowing before debugging one of these:

A bare element selector in a deployment sheet reaches into this package, and an
inherited property carries further than the element it was written for. These
registries ship

```css
label { display: block; margin-bottom: 3px; padding-left: 15px; text-indent: -15px; }
```

for their forms. The draw row's two fields are `<label>` elements, so
`.atlas-panel__drawfield` won the display — a class beats an element whatever
the order — and nothing won the rest. `text-indent` inherits, so `-15px`
reached the span holding the radius unit and pulled `m` fifteen pixels left,
over the number it measures, taking its width to zero on the way: a flex base
size of `max-content - 15px` clamps at nothing.

So: **say it, do not inherit it.** Where this package owns an element that a
bare element selector might name — a `label`, an `input`, a `p`, a `ul` — set
the properties that matter on the package's own class rather than assuming the
default. A class beats an element regardless of source order, which is the one
part of the cascade that works in this direction.

## Reproducing it

A component can look right in isolation and wrong in the app. To see what the
app sees, concatenate the deployment's stylesheets in the order
`aims-assets/assets/js/stylesheets.js` lists them, after this package's CSS,
into one HTML file with the markup in question; render it with
`google-chrome --headless --screenshot`; and read the computed styles back with
a probe script and `--dump-dom`. That is how the `text-indent` above was found,
after the layout had been blamed twice.
