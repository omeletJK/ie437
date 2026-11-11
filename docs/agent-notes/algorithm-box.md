# The algorithm box reads as structure, not as prose

*Pseudocode on a slide is a picture of a loop: keywords in a column, indentation for scope, one
statement per line, and the update rule lit (2026-11-11).*

The ten algorithm boxes of Ch 7 and Ch 8 were `::: block Algorithm` panels: an initialise line and
three or four numbered sentences, each loop body crammed into one line with `&nbsp;` separators
("Repeat for each step: a←π(s); take a, observe r, s′; V(s)←…; s←s′"). The professor's verdict, on
the Monte Carlo prediction box: *every pseudocode in the deck is written as plain text and does not
read intuitively*. The same box prompted a second question, *why does the loop start at t = T−1?*,
which the slide never answered: the backward loop is Sutton and Barto's one-pass trick for the
returns (G ← r_{t+1} + γG), a computational detail that had been put where the idea should be.

The `::: algorithm` container (build.mjs, deck.css) now sets a box as a grid: a mono keyword
column (initialise, for each, repeat, until, start, act, learn, move, read off), the body in prose
and inline maths, a small margin note on the right, indentation guides for loop scope, and exactly
one lit line marked `!` — the update rule, its changed token in `\red{}`, the same red as the
ladder's. The act → observe → learn → move rhythm is identical in TD(0), SARSA, Q-learning, the
function-approximation box and DQN, so the ten boxes read as one family and the one differing line
stands out. deck.js no longer hands leftover slide height to an algorithm box (GROW excludes
`.blk.alg`), so a short box stays short and the slide centres.

The Monte Carlo box is written in the order of the idea: run π to the end, for each first-visited
s_t take the return that followed, learn. The backward pass is a footer line under the box and a
sentence in the presenter note.

**Why:** a numbered list of sentences hides the two things a reader needs first, which loop they
are in and which line is the algorithm; the rest is bookkeeping. Structure on the slide, prose in
the note.

**How to apply:** every procedure a widget animates gets an `::: algorithm` box before the demo
([formula-then-algorithm-then-demo](formula-then-algorithm-then-demo.md)). Keep the keyword
vocabulary and the act/learn/move order across a chapter; light one line only; put implementation
tricks (backward passes, index conventions) in the footer or the note, never in the body. A box
should be at most ten lines; if it needs more, the slide wants two boxes or a flow.
Related: [algorithm-relations-as-a-ladder](algorithm-relations-as-a-ladder.md),
[label-every-formula-block](label-every-formula-block.md).
