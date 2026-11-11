# Formula, then algorithm, then the moving picture

*An animated demo of a procedure comes third, after the equation it iterates and the pseudocode that wraps it (Ch 7 policy evaluation, 2026-11-09).*

Ch 7's Act 3 opened policy evaluation with the `sweep-backup` widget: two value tables, one backup
at a time, the two-array and in-place versions side by side. The professor asked for two slides
in front of it: first the policy evaluation formula, then its pseudocode, and only then the sweep.
The widget shows *what happens*; without the equation the audience does not know what quantity is
being written into the cells, and without the algorithm box they do not know which loop the
"+1 backup" button is stepping through.

The two slides now read: (1) the Bellman expectation equation with `=` turned into `←` and the
indices k, k+1 added in red, in the ladder convention, with the keypoint that V^π is the fixed
point; (2) an algorithm box in the same form as the policy improvement and value
iteration boxes later in the act (initialise, Δ, sweep, stop at ε). The demo follows, and its note
points back to both.

**Why:** a widget that moves is persuasive but not self-explaining. Students should be able to
predict each step of a demo from a formula and a loop they have already seen; then the demo
confirms rather than introduces.

**How to apply:** whenever a slide animates a procedure (a sweep, an iteration, a sampling loop),
check that the two slides before it give the update rule, labelled, and the algorithm as a box in
the deck's `::: algorithm name | input …; output …` box (see [algorithm-box](algorithm-box.md); until
2026-11-11 this was a numbered-prose `::: block Algorithm` box).
Keep the tolerance symbol and the index convention identical across the chapter's algorithm boxes.
Related: [label-every-formula-block](label-every-formula-block.md),
[algorithm-relations-as-a-ladder](algorithm-relations-as-a-ladder.md),
[ch07-source-pictures](ch07-source-pictures.md).
