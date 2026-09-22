The stylesheets, and nothing else.

Seven files, each imported for its side effect by the component it dresses —
`panel.css` and `draw.css` by `FeaturePanel`, `draw.css` again by
`CirclePicker`, `features.css` by `FeatureSet`, `legend.css` by `Legend`,
`picker.css` by `PointPicker`, `controls.css` by `AtlasMap`, `zoom.css` by
`ZoomRail`.

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

## The second case: a form built from a table's schema

`draw.form` renders an RJSF form in the draw row, and a form is the markup these
deployments have the most CSS for. All of it arrives:

* `label { font-size: 16px; padding-left: 15px; text-indent: -15px }` — the
  record-form label, three lines tall over a 37px control.
* `legend { background-color: … !important; color: … !important }` in
  `systemcolors.css`, plus bootstrap's `legend { width: 100% }` — which together
  make a schema's grouppath a full-width blue section header, one per group.
* `.form-control { border: none; border-bottom: 1px solid #385a38 !important }`
  — three grey sides and a green one on a box this package draws.

The rules are in `panel.css` under `.atlas-panel__drawform`. Two things about
them are worth keeping in mind before adding more.

**`!important` is the only thing that reaches `!important`,** and it is spent in
exactly one place: the bottom border. A blue legend is the deployment's colour
choice arriving somewhere it was not aimed, and it is legible, so it stays; a
green line along one edge of a four-sided box is not a colour choice about
anything, and the box is this package's.

**A `<legend>` is never a flex item.** The browser takes a fieldset's first
legend out of flow and lays the rest of the fieldset's children out in an
anonymous box, so `flex`, `order` and `align-self` on a legend do nothing —
`width: auto` is what stops it being a full-width bar. A group therefore costs a
line. A row that would rather have the space says so in its own `uiSchema`, with
`"ui:title": ""` on the group.

**The date filter is deliberately not in those selectors.** It is the older form
on this panel, `aims-assets/assets/styles/atlas-panel.css` styles it field by
field, and a default written now would either lose to that or win by a property
the deployment happened not to name. The two forms share the fieldset and legend
rules above them and nothing else.

## Reproducing it

A component can look right in isolation and wrong in the app. To see what the
app sees, concatenate the deployment's stylesheets in the order
`aims-assets/assets/js/stylesheets.js` lists them, after this package's CSS,
into one HTML file with the markup in question; render it with
`google-chrome --headless --screenshot`; and read the computed styles back with
a probe script and `--dump-dom`. That is how the `text-indent` above was found,
after the layout had been blamed twice.
