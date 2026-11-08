# Ch 7: rebuilt around the source deck's diagrams

*The MDP/DP deck was text-heavy; on 2026-11-09, two hours before the lecture, it was rebuilt so that every main-body slide is one picture from the original PowerPoint deck, one sentence, and at most one labelled formula.*

The original `lecture_slides/7. Markov Decision Process and Dynamic Programming.pdf` (54 pages,
not in the repository) is almost entirely diagrams: a career-choice tree, the agent–environment
loop, the MDP as a graphical model, a route map for "the value of a state", the trajectory tree,
and then one **backup diagram** redrawn a dozen times (expectation, Q and V, optimality for V* and
Q*, policy improvement), the two-arrays/in-place sweep, the gridworld, asynchronous DP and the GPI
triangle. The HTML deck had the same four-act flow but carried that content as prose.

What was done:

- `deck/widgets/backup-tree.js` — the backup-diagram family as one widget with modes `tree`,
  `eval` (option `q` adds the Q label), `opt`, `qopt`, `improve`; all stepped by `→`. One figure
  format for the whole of Act 2 and the improvement slide, as the one-figure-per-story rule asks.
  The professor asked for the source's three Value Function slides (pp. 19–22) as one sequence:
  `tree` grows the trajectory tree in three steps and on the fourth fixes a policy
  (π(s)=a₂, π(s₁)=a₁, π(s₂)=a₂; the path turns red, the rest fades); `eval` is that red path cut
  after one step and ends by writing the backup out as one term per successor.
- `deck/widgets/mdp-pictures.js` — the remaining source figures redrawn: `career` (stepped),
  `loop`, `graph` (option `stationary`), `grid`, `arrays`, `async`, `gpi` (stepped), and `readoff`
  (p47, stepped: the greedy policy read off V^π; the arrows are computed from the value table, so
  ties keep both arrows as in the source). The p47 crop was blurry and the professor asked for it
  to be drawn, so it was removed from `assets/ch07/`.
- `assets/ch07/` — two crops that are pictures in their own right: `route-values.jpg` (p18) and
  `gridworld-sweeps.png` (p49, with the professor's blue cross through the last rows).
- The temperature-thread backup, the two-sweep table and the contraction-bound table moved to the
  appendix (Backups 5–6) or the presenter note; the proofs were already there. Numbers live in
  `::: note` blocks, not on slides.

**Why:** the professor asked for the original decks' concept pictures and flow back
("기존 슬라이드를 참조하여 그 흐름을 참조해서"), and the standing rule is a slide is a picture plus
one key sentence, algebra to the appendix.

**How to apply:** when a chapter reads as text, open its source PDF, list which page carries a
diagram, redraw the recurring family as one multi-mode widget and crop only what is a picture in
its own right (a map, a published figure). Keep the act structure; change what each slide shows,
not the order. Related: [one-figure-format-per-story](one-figure-format-per-story.md),
[examples-as-pictures](examples-as-pictures.md), [simplify-confusing-slides](simplify-confusing-slides.md).
