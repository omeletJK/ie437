# Brief for a chapter-building agent

You are authoring one chapter of an interactive HTML lecture course. Read this whole file before
touching anything.

## What the three sources are for

```
IE437_Course_Narrative_Spine.md   the narrative: cube position, the four crossings,
                                  the two lineages, the handoff chain
tex/LectureNN_*.tex               the act structure, the chapter's central thesis,
                                  and every equation, already re-typed correctly
lecture_slides/*.pdf              the lecture as actually taught: the worked examples,
                                  the derivations the tex compressed away, and the figures
```

**Structure comes from the spine and the tex. Substance and figures come from the PDF.** The tex is
a compressed re-authoring of the PDF — Lecture 1 is 50 PDF pages condensed into 16 frames — so the
tex tells you the skeleton and the PDF tells you what was cut. Restore what was cut.

`md/_CHAIN.md` fixes the exact wording of your chapter's `inherits:` and `handoff:`. Do not
paraphrase it.

## What you produce

1. **`md/_source/chNN_extract.md`** — an inventory of the PDF, written first. For every page: what
   it contains, and which of the tex's acts it belongs to. Flag every figure, every worked example
   with its actual numbers, every derivation. This is the artefact that justifies your having read
   225 pages; make it good enough that someone could write the chapter from it alone.
2. **`md/chNN_name.md`** — the chapter, following `md/_SCHEMA.md`.
3. **`deck/widgets/<id>.js`** — three or four interactive widgets.

Nothing else. **Never edit** `deck/deck.css`, `deck/deck.js`, `build.mjs`, `pdf.mjs`, the spine, or
another chapter's files. If your chapter seems to need a stylesheet change, say so in your report
instead of making it — those files are shared and edits to them collide.

## Read these two first

- **`md/_SCHEMA.md`** — the markdown schema and the widget contract.
- **`md/ch02_bayesian_statistics.md`** — the reference specimen. Read it end to end before writing a
  line. It shows the density, the voice, how a PDF's worked example becomes a slide, and how the
  four acts carry a question strip. Match it.

Chapters 0–5 and 8 are already built. If your chapter sits next to one of them in the chain, read
that neighbour's markdown too and make the join actually work — the sentence you hand off in must
be the sentence the next chapter says it received.

Also skim `deck/widgets/bayes-update.js` and `deck/widgets/ridge-lasso-prior.js` — they show the
widget conventions in practice.

## Voice

Write like the specimen. Prose, not bullet fragments, wherever a sentence will do. State the
chapter's thesis in one line and then earn it. Every act opens with the question it answers and
closes having answered it. British spelling. No exclamation marks, no "delve", no "it's worth
noting". Highlight with `==…==` sparingly — roughly one phrase per slide, on the phrase that carries
the argument.

## Widgets — the part that goes wrong

Aim for three or four. Choose them by asking: *which claim in this chapter would a student otherwise
take on faith?* That is the one to build. A static figure redrawn from the PDF is worth more than a
simulator of something already obvious.

Hard rules:

- Use only `IE437.svg(w,h)`, `IE437.el(tag,attrs,parent)`, `IE437.plot(svg,spec)`, `IE437.rng(seed)`.
- Size every SVG in real pixels via `IE437.svg` — they are not scaled, so fonts stay at 100%.
- Seed every random stream with `IE437.rng(seed)`. A rebuild must produce the identical picture.
- Implement `finish()`; `pdf.mjs` calls it so the PDF shows a finished result, not an empty chart.
- Colours: ink `#16181D`, blue `#2563EB`, green `#16A34A`, amber `#D97706`, red `#D64545`,
  slate `#64748B`. Panels are `--panel`; never introduce a new hue.
- A widget with no `.wbar` renders as a plain figure panel. Use that for redrawn diagrams.
- Total widget height must stay under about 440px or the slide overflows.

**Verify the claim before you ship it.** Two real failures from this project: a gridworld widget ran
perfectly and demonstrated the opposite of its own lesson (found only by sweeping the parameters
outside the browser), and a font-loading bug rendered every equation in the wrong typeface while
throwing no error at all. If your widget asserts that something diverges, or that a coefficient hits
exactly zero, or that one estimator beats another — compute it in `node` first and confirm the
numbers. Say in your report what you verified and how.

## Scratch files

Several agents work in this repo at once. Put every temporary script, screenshot or note in your
own directory — `/tmp/ie437-chNN/` for your chapter number — and never in a shared scratch path. In
the last wave two agents collided over a temp script and one lost work.

## Build and check

```bash
node build.mjs chNN          # never --all; other chapters are not yours
```

The build fails loudly on a bad schema. It cannot see a slide that overflows, so do not claim the
chapter is finished — say it is drafted and unverified. The visual pass is done centrally.

## Report back

Keep it short: the acts and their slide counts, the widgets with one line each on what they show and
what you verified numerically, anything you took from the PDF that the tex had dropped, and anything
you wanted to change in the shared files but did not.
