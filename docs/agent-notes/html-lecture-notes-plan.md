# IE437 HTML lecture notes — plan

*IE437 HTML lecture-note project — the four authoring decisions and the pilot-then-rollout plan*

Decided 2026-08-30 for the IE437 interactive HTML lecture notes (this repo):

1. **All slide text in English** — the `tex/` sources stay authoritative; the Korean narrative spine is planning material only.
2. **`md/` is the single source of truth, compiled by `build.mjs`** — deterministic regeneration was chosen over hand-authoring each HTML, so 15 chapters stay visually consistent.
3. **Level-3 interactivity** — real algorithm simulators (not just click-reveals) in `deck/widgets/`.
4. **Ch 8 (Value-Based RL) was the pilot** that fixed the template; every other chapter followed it.

Status as of 2026-08-31: **all 14 decks are built** — Ch 0–12 plus the probability appendix, 564
slides, 57 widget mounts, PDFs exported. The spine's v3 revision moved the whole multi-agent axis
(old Ch 12 Dynamic Games, Ch 13 MARL) out to **IE579**, so `tex/Lecture12/13` have no chapter here
and Ch 12 is now Offline RL, written from a spec with no tex source.

Ch 0 now carries the source deck's own material: `::: figure` / `::: video` are in `build.mjs`,
~50 clips and stills sit in `assets/ch00/`, and Ch 0 references 19 figures and 11 videos — 57
built slides, QA clean. Every other chapter is still figure-free and carries widgets alone; the
same treatment for Ch 1-12 is the open opportunity, and their source PDFs are in `lecture_slides/`.
The three `_*.mjs` files at the repo root are scratch: `_qa.mjs` is the useful one (walks every
slide, reports overflow and JS errors — locally Playwright's bundled Chromium is not installed, so run
such scripts with `chromium.launch({ channel: 'chrome' })`, as of 2026-09-30); `_probe2.mjs` and `_recslide.mjs` drove asset extraction
from a sibling project and are no longer needed.

**Why:** the professor wants to edit only the markdown on future revisions and regenerate HTML/PDF, so no design or content may live solely in `html/`.

**How to apply:** author new chapters from `md/_TEMPLATE.md` following `md/_SCHEMA.md`; never hand-edit `html/` or `pdf/`. Ch 13 (MARL) has 91 source frames — about 5x every other chapter — so plan to split it. Ch 5 and Ch 6 are one module in the spine and should share a common opening.

Numbering drift: cross-references were renumbered in the spine but not in `tex/`: in Ch 8's source, "Lecture 10" for model-based RL must become **Lecture 11**, and policy-based RL is **Lecture 10**. Check the same drift in every other chapter.

`IE437_Course_Narrative_Spine.md` was brought fully into line with v3 on 2026-08-31 — §0's cube
diagram, §3 (which had defined **two** different Ch 12s: v2's Dynamic Games and v3's Offline RL),
§4's status column, §5's remap table and §9's status section. The v2/v3 revision blockquotes at the
top are kept deliberately as history. Even so, `md/_CHAIN.md` — not the spine — stays authoritative
for `inherits:` / `handoff:` wording.

Revised 2026-08-31 after the professor called the widget UX awkward ("you must press the top
next/next/reset buttons"). Three engine-level changes, all documented in `md/_SCHEMA.md`:

1. **Autoplay** — `deck.js` clicks a widget's `data-auto` control ~400 ms after its slide lands,
   so nothing sits dead waiting to be found. Print and reduced-motion are exempt (`finish()`
   covers those). 15 widgets opt in.
2. **`IE437.slider()`** replaced every `+`/`−` button pair — 17 widgets. Pass `bare: true` when
   the widget already prints its own `.wlabel`/`.wnum`. Button count fell 165 → 128.
3. **`::: quiz`** — one check per Act, 56 total across the 14 chapters. `=` prefixes the right
   option; prose after the list is the explanation. The build **throws** on a quiz with no `=`,
   no question, or fewer than two options. The PDF prints every quiz as an answer key.

Also ported `two-uncertainties` (aleatoric vs epistemic) from `ie437-platform`'s `UncertaintySim`
— the only one of that repo's 10 ebook widgets without an equivalent here; the other nine
(gp-sandbox, cliff-walker, qp-explorer, gridworld-vi, …) duplicate more developed local widgets
and were deliberately not brought over.

Then on 2026-08-31 the professor asked twice, the second time pointedly, for the `back` / `next` /
`reset` buttons to come off the widget bars entirely — a diagram should not make the reader learn a
second set of controls, or reach for the mouse mid-lecture. The deck's own keys do all three now:
`steps`/`step(i)` puts a stepped widget into the reveal sequence so `→` walks it, `reset()` is
called on every slide entry so `↓` then `↑` is the reset gesture, and `data-auto` still starts a
simulator on arrival. Widget bars hold only controls about the widget's own subject.

**How to apply:** a new widget gets **no** back/next/reset button — return `steps`/`step`/`reset`
instead. Reach for `IE437.slider` before a `+`/`−` pair, and mark the control that carries it to the
state worth seeing with `data-auto`. `deck/widgets/omelet-stack.js` is unused and the professor
asked to leave it as it is, so its stale `next ›` is not a counter-example.

On 2026-10-07, after missing that the hypervolume slides could be dragged and clicked, the professor
asked that interactive slides **tell the reader to try them**. The engine now supports a `"try"`
mount option (a pulsing blue pill; dims after the first touch; never prints). The professor then
asked for it **around the figure**, not in the bar's corner: it now sits on the widget's figure
(`data-try-anchor` / `data-try-x,y`), and only bar-control hints use `"tryAt":"bar"` —
see `md/_SCHEMA.md` §5. **How to apply:** give every widget with a non-obvious interaction a
`"try"` prompt in its markdown mount; skip step-only widgets and bars already full of labelled
buttons. Rolled out to Ch 4 first; other chapters were offered, not yet done.
