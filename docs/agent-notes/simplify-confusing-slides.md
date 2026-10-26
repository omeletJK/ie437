# Simplify confusing slides: picture + one keypoint, algebra to appendix

*When the professor says a slide is hard to understand, the confirmed fix is to simplify maximally — one picture plus one keypoint in the main body, derivation to the appendix*

On 2026-10-13 the professor did not understand Lecture 5 pages 30–31 (a tabular COMs derivation
followed by a three-design picture of it). Offered three options; the answer was "최대한 간단하게
simplify하자". The accepted shape: merge the pair into one main slide = the `coms-tabular` picture +
a one-line caption + one keypoint ("lower bound on average under the attacker, unbiased on the data,
not design by design, can cost A"); the two-line derivation moved to an appendix slide
("Backup — the tabular COMs solution"); everything else into the presenter `::: note`.

**Why:** a derivation in the main flow was read as "what is this slide for?", and splitting one
claim across two slides with different highlights left no single sentence to take away.

**How to apply:** when a slide confuses, do not add explanatory sentences to it. Cut to the picture
and the one sentence it proves, put the algebra in the appendix, keep the numbers in the note.
Merging two headings into one shifts every later slide: renumber `slide_at_review` in
`md/_source/source_fidelity_map.json` by heading lookup and fix `core_slides` / `appendix_start` in
`teaching_route_map.json` (do not JSON round-trip that file — its tail is ASCII-escaped and a
round-trip rewrites 190 lines). Related: [examples-as-pictures](examples-as-pictures.md),
[one-figure-format-per-story](one-figure-format-per-story.md).

**A widget shows one change and one readout (2026-10-26).** The Ch 6 KL slide stepped through both
directions, KL(p‖q) = 6.43 and KL(q‖p) = 0.69. The professor asked whether both directions and the
numbers were needed, and said it was unclear what kept changing and what it explained. Nothing in
Act 2 used the second direction or either number. The widget now changes one thing, the model, from
one mode to both. It reads one thing: the red area p·log(p/q) and a bar for its total, with no
number. The second direction is introduced on the tilt slide, the one place it is used. Before
building a stepped widget, name the one quantity that changes and the one reading the student
should take away. Show a concept only on the slide where an argument needs it.
