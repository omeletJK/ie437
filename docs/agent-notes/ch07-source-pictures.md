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
  Later the same day `ladder` (p53, stepped 3): the summary as a staircase of algorithm plates,
  used three times through its `start`/`upto` options; see
  [algorithm-relations-as-a-ladder](algorithm-relations-as-a-ladder.md).
- `deck/widgets/sweep-backup.js` — the p. 35 two-arrays / in-place picture made to move: a
  five-state chain (right 0.6, left 0.4, cost 1, s_5 terminal, gamma 0.9) swept one backup at a
  time, both panels in step, the backup written out under each column with the numbers it reads
  and the in-place method's fresh number in red. Autoplays three sweeps on arrival; `+1 backup`
  and `run` on its bar. It replaced `mdp-pictures` mode `arrays`, which stays in the file unused.
- `deck/widgets/contraction-machine.js` (2026-11-09, after the professor could not read "TV" on
  the proof slide): the Bellman operator as a machine, a table in and a table out, in three modes
  `machine`, `two` (two tables in, the largest gap shrinks by gamma, then a strip 10, 9, 8.1, ...)
  and `maxineq` (two students' marks: |max f − max g| ≤ max |f − g|). The contraction is now four
  main-body slides, picture first and the proof last as three labelled inequalities; the Backup
  proof slide is gone. IE437.math has no \mathcal, so the operator's letter is drawn in
  KaTeX_Caligraphic by hand (`calT`).
- `deck/widgets/lineage-tables.js` (2026-11-09): the pp. 4–5 taxonomy was two side-by-side
  markdown tables whose cells wrapped; the professor asked for one table per page with the
  model-free version opening on a press. One full-width HTML table, two tabs above it, `→` swaps
  model-based for model-free; the formula strip comes from a `::: wformulas` block.
- `assets/ch07/` — two crops that are pictures in their own right: `route-values.jpg` (p18) and
  `gridworld-sweeps.png` (p49, with the professor's blue cross through the last rows).
- The temperature-thread backup, the two-sweep table and the contraction-bound table first moved to
  the appendix (Backups 5–6) or the presenter note. After the lecture the same day the professor asked
  for every backup slide back in the body, each right after the idea it supports, to be covered or
  skipped on the spot ("설명할 지 말지는 현장에서 내가 직접 판단하겠다"): the lineage taxonomy after the
  opening slide, the Bellman derivation after the expectation equation, the two worked backups after
  value iteration, the contraction proof after the contraction slide, in-place/asynchronous after
  asynchronous DP, the reading guide in the closing. The appendix section is gone.
- Policy improvement was one slide; the professor asked for the source's step-by-step treatment
  (pp. 38–44), so it is now four: the one-step question (`improve` mode, now two probes, a₁ then a₃
  as in the source), the greedy criterion with the argmax analogy and the once/always boxes, the
  theorem with its telescoping proof revealed one line per press (`\step{k}{…}`, a KaTeX macro
  added to `build.mjs`, with a one-line fallback in `deck.js` so a KaTeX-made fragment carries its
  group index on the inner span), and the algorithm box. Numbers still live in `::: note` blocks.
- `deck/widgets/dp-schedules.js` was rewritten the same afternoon. Its first form was a log-log
  chart of ‖V − V*‖ against cumulative backups on a new 6×6 slippery arena with a dial; the
  professor could not tell what problem it posed ("어떤 문제인지 잘 파악이 안된다"). The reasons: a
  second gridworld introduced without a word, two logarithmic axes that turn every run into a
  plateau and a cliff, three units (sweeps, improvements, backups) in one legend, and the dial's
  third curve present from the start. The replacement is a literal count: the deck's own 4×4
  gridworld from the random policy, one horizontal bar per schedule whose length is the number of
  backups, grey for expectation backups (evaluation) and red for max backups (improvement, or a
  value-iteration sweep), revealed policy iteration → value iteration → the dial's m, default
  m = 3 because that is the blue cross. Policy iteration's bar is almost entirely grey, which is the
  sentence the slide exists for. The same lesson as [demos-show-the-picture](demos-show-the-picture.md):
  a derived statistic on a clever axis is not a picture; a count is.

**Why:** the professor asked for the original decks' concept pictures and flow back
("기존 슬라이드를 참조하여 그 흐름을 참조해서"), and the standing rule is a slide is a picture plus
one key sentence, algebra to the appendix.

**How to apply:** when a chapter reads as text, open its source PDF, list which page carries a
diagram, redraw the recurring family as one multi-mode widget and crop only what is a picture in
its own right (a map, a published figure). Keep the act structure; change what each slide shows,
not the order. Related: [one-figure-format-per-story](one-figure-format-per-story.md),
[examples-as-pictures](examples-as-pictures.md), [simplify-confusing-slides](simplify-confusing-slides.md).
