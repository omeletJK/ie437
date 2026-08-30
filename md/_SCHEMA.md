# IE437 lecture-note markdown — authoring schema

**This folder is the single source of truth.** `html/` and `pdf/` are build outputs; editing
them by hand is pointless because the next build overwrites them. To change a lecture, change
its `.md` here and run `node build.mjs chNN`.

```
md/chNN_name.md  ──build.mjs──▶  html/chNN_name.html  ──pdf.mjs──▶  pdf/chNN_name.pdf
                                        └── or press P in the browser
```

---

## 1. Front matter

```yaml
---
ch: 8                                   # lecture number (used in the chrome + title slide)
title: Value-Based Reinforcement Learning
subtitle: Learning to act when the model is gone
tagline: From the Bellman equation you can *solve* to the one you can only *sample*
course: IE437 · Data-Driven Decision Making and Control
author: Jinkyoo Park
institute: KAIST

lineage: A                              # A = OR/DP · B = Control · A+B · B' (multi-agent)
lineage_here: dd-A                      # which cell of the 2x2 grid this lecture occupies:
                                        #   mb-A (Lec 7) · mb-B (Lec 9) · dd-A (Lec 8) · dd-B (Lec 10)
cube:                                   # position on the three-axis cube (spine §0)
  stages: dynamic                       #   static | dynamic
  model: data-driven                    #   model-based | data-driven
  agents: single agent                  #   single agent | multi-agent
crossing: model                         # which axis this lecture crosses: stages|model|agents|(omit)
cube_from:                              # the previous value on the crossed axis (draws the arrow)
  model: model-based

inherits: the Bellman optimality equation (Lecture 7)   # documentation only
handoff:  the continuous-argmax wall (Lecture 9)        # documentation only

questions:                              # the recurring question strip; one per Act
  - Evaluate?
  - Improve?
  - Explore?
  - Scale?
---
```

## 2. Structure

| markdown | becomes |
|---|---|
| `## Act 1 — evaluation without a model` | a **section**: emits a dark divider slide; the text under it is the divider's subtitle |
| `### Slide title` | a **slide** |
| `{layout: title}` on the line right after a heading | slide attributes (see below) |

Section attributes: `{short: ACT 1, num: Act 1}` — `short` is the kicker chip on every slide of
that section, `num` is the eyebrow on the divider. Use `{divider: false}` to suppress the divider.

Slide attributes:

| attribute | values | effect |
|---|---|---|
| `layout` | `title` `section` `standout` (default: normal) | slide template |
| `theme` | `dark` | dark ground for a normal slide |
| `fill` | *(omit — the engine balances)* · `center` · `split` · `tight` | override the vertical rhythm — see §6 |
| `q` | `1`–`4` | which question the bare `::: qstrip` highlights |
| `sub` | any text | a grey second line under the slide title |
| `kicker` | any text | override the section's `short` chip |

A value may contain commas — the parser splits only on a comma that begins the next `key:`.
One thing to know when writing a widget: `.wlabel` is set in uppercase, which mangles Greek
(ξ becomes Ξ). Spell such labels out in words rather than changing the stylesheet.

## 3. Inline

| you write | you get | LaTeX original |
|---|---|---|
| `==text==` | the accent highlight | `\alert{}` / `\hl{}` |
| `**bold**`, `*italic*` | bold, italic | `\textbf`, `\emph` |
| `$x$`, `$$x$$` | KaTeX, rendered **at build time** | `$`, `\[ \]` |
| `\hl{...}` *inside* math | the accent inside the formula | `\hl{}` |
| `{p}(Mnih et al., 2015)` | grey italic citation | `\paper{}` |

Extra KaTeX macros available: `\hl` `\alert` `\E` `\R` `\argmax` `\argmin`.
Markdown tables, lists and `code` work as usual.

## 4. Block directives

Blocks open with `::: name [argument]` and close with a bare `:::`. They nest.

```
::: reveal            one click-reveal step — this is \pause. Number them by order of appearance.
::: note              presenter note; never rendered on the slide
::: lede              the intro line under the title
::: small             de-emphasised paragraph (the \footnotesize asides)
::: keypoint          the one-line thesis; pins to the bottom rule when it ends the slide
::: block Title | note     a beamer block; `.accent` and `.red` variants
::: cols c2           column layout: c2 | c3 | wide-l | wide-r
:::   ::: col Heading     one column; `.accent` colours the heading
::: center            centre the contents
::: table center      wrap a markdown table and centre its cells
::: qstrip [n]        the four-question strip; n defaults to the slide's `q:`
::: tracker           the three-axis cube tracker, drawn from the front matter
::: lineage [cell]    the 2x2 lineage grid; cell defaults to `lineage_here`
::: flow  lbl1|lbl2   boxes joined by arrows; children are a list, `Title | subtitle`
                      prefix an item with `!` to emphasise, `!!` to mark it a hazard
::: widget id {json}  mount an interactive widget; the child text becomes its caption
```

### Worked example

````markdown
### Temporal Difference — learn a guess from a guess
{q: 1}

::: qstrip
:::

After a *single* transition, update:

$$V(s_t) \leftarrow V(s_t) + \alpha\big[\underbrace{r_{t+1} + \gamma V(s_{t+1})}_{\hl{\text{TD target}}} - V(s_t)\big]$$

::: reveal
::: keypoint
TD $=$ the model-free-ness of MC $+$ ==the bootstrapping of DP.==
:::
:::

::: widget mc-vs-td {"alpha":0.1,"seed":7}
Both methods see the identical stream and differ only in the target.
:::

::: note
Ask the class to predict which curve is smoother before pressing +100.
:::
````

## 5. Widgets

Widgets live in `deck/widgets/<id>.js` and register themselves:

```js
IE437.widget('my-widget', function (host, opts) {
  host.innerHTML = '<div class="wbar">…</div><div class="wbody">…</div>';
  // helpers: IE437.svg(w,h)  IE437.el(tag,attrs,parent)  IE437.plot(svg,spec)  IE437.rng(seed)
  return { finish: function () { /* run to the end — used for PDF export */ } };
});
```

Rules that keep the PDF honest:

- Seed every random number generator with `IE437.rng(seed)` so a rebuild is reproducible.
- Size SVGs in real pixels via `IE437.svg(w, h)`; they are not scaled, so fonts stay at 100%.
- Implement `finish()` — `pdf.mjs` calls it before printing so the PDF shows a trained result,
  not an empty chart.
- `build.mjs` emits the `<script>` tag automatically for every widget id you reference, and
  warns if the file is missing.

Currently available:

| chapter | widgets |
|---|---|
| Ch 0 | `ai-vs-decision` · `modeling-loop` · `course-cube` (3-D map, walked) · `given-ledger` |
| Ch 1 | `formulation-balance` · `convex-set` · `convex-watershed` · `kkt-point` (draggable) · `trust-region` |
| Ch 2 | `bayes-anatomy` · `bayes-update` · `ci-vs-cr` · `bayes-regression` · `ridge-lasso-prior` |
| Ch 3 | `factor-count` · `d-separation` · `inference-cost` · `influence-diagram` |
| Ch 4 | `gp-posterior` · `acquisition-zoo` · `bo-run` · `explore-regret` |
| Ch 5 | `two-failures` · `surrogate-exploit` · `conservative-coms` · `ensemble-alarm` |
| Ch 8 | `mc-vs-td` · `gpi-explore` · `cliff-walk` · `deadly-triad` |

Several of these are **redrawings of figures in the original PDF decks** (`lecture_slides/`) rather
than new inventions — the three-axis cube, the AI/decision-making pipelines, the modelling and
solving loop, the formulation seesaw, the convex/non-convex sets. When a source slide already has
the right picture, redraw it in the deck's own language instead of replacing it. A widget with no
`.wbar` renders as a plain figure panel, which is what those use.

## 6. Colour and vertical rhythm

**Colour.** The chrome is monotone ink and stays that way: ticks, rules, progress bars, list
markers, table heads, panel borders, the active chip of the question strip. Colour is reserved
for meaning — `==text==` is the deck's single emphasis colour (`--accent`, blue), and the
semantic tokens `--slate --amber --red --purple --green --teal` label series in a chart or a
crossed axis. Never tint something merely to decorate it. To restyle the whole course, change
`--accent` in `deck/deck.css`; nothing else refers to a literal colour.

**Surfaces are recessed, not raised.** The slide ground `--paper` is the lightest surface in the
deck. Every panel — equation plate, table, block, lineage grid, tracker, widget shell — sits on
`--panel`, a step darker, and anything emphasised within one sits on `--panel2` with an ink
outline. A panel is therefore an inset in the page, never a white card floating above it.

**Rhythm — measured at runtime.** CSS cannot know how tall a paragraph will set, so `deck.js`
measures each slide after the fonts load and gives the leftover height back in this order:

1. **the gaps**, evenly, capped at 64px;
2. **the tallest growable block** — a table, lineage grid, flow or panel grows its rows by up to
   40% (max 120px) rather than leaving a hole;
3. **whatever is still left** centres the column.

So a slide fills its canvas evenly without any per-slide tuning. Supporting this:

- a leading `::: tracker` or `::: qstrip` is hoisted out of the body and set under the title as
  header furniture;
- top-level bullet lists are set as full-width rows on hairlines, and display equations sit on a
  panel plate, so even a plain text slide carries the canvas;
- `{fill: center | split | tight}` opts out of the measurement if a slide needs a fixed rhythm.

## 7. Build

```bash
node build.mjs ch08              # one chapter
node build.mjs --all            # every chapter, plus the html/index.html launcher
node build.mjs --all --linked   # dev build: reference deck/ rather than inlining it
node pdf.mjs  ch08              # html -> pdf (1280x720 pages, all reveals opened)
```

Each chapter builds to **one self-contained file**: deck.css, deck.js, the widgets it uses,
KaTeX and the display faces are inlined, so a chapter can be copied anywhere and opened with
no network and no sibling `deck/` folder. Use `--linked` while iterating on `deck/deck.css`,
when a stylesheet edit should show on reload without a rebuild.

Fonts fail *silently* — a missing face just falls back and the page still renders, so the build
asserts instead: if any `url(fonts/…)` survives the inlining pass it throws. Keep that check.
KaTeX's `@font-face` blocks end their `src:` run at the closing brace rather than a semicolon,
which is exactly how the maths spent a build rendering in the wrong typeface.

In the browser: `→`/space advance one reveal, `←` back, `↑ ↓` skip a slide, `M` index,
`P` print to PDF, `F` fullscreen, `?` key help.
