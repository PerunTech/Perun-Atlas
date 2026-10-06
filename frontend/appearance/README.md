What a feature looks like and what it says, decided from configuration.

Plain data, every one of them: a descriptor and a feature go in, and path
options, a label, popup rows or a legend entry come out. No DOM, no map, no
engine — which is what makes this the half of the package a test can reach
without pretending to render anything, and `test/` does.

Package-private since 1.0.0. The bundle exported these as `appearance` until
then, and nothing outside read them.

It was `style/` until that name was covering two unrelated things. The
stylesheets are still called that and still live there; they are CSS, they are
imported by components for their side effect, and a deployment overrides them
from the outside. These are functions, imported for their return values, and no
deployment can reach them. Sharing a word made `import { pathOptions } from
'../style'` and `import '../style/panel.css'` look like two halves of one idea.
They never were.

| File | |
|---|---|
| `descriptor.js` | How a feature is drawn: path options, its variant case, its label, its name, its popup and its details. |
| `choropleth.js` | Colouring features by a categorical attribute, and the bands a palette makes of it. |
| `legend.js` | What the colours on a map mean: the key's entries, and the key each kind is switched off by. |
| `overlay.js` | How a file the reader opened is drawn, named and described. |

Two things that lived here were not appearance, and have moved: `joinStatus`,
which marries a status feed's rows onto features, is `data/join.js`, and what
the panel says about a file the reader opened is `lib/fileText.js`.
