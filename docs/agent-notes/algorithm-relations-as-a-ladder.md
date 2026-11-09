# Relations between methods: one formula, a ladder of deletions

*How the professor draws the relationship between a family of algorithms (Ch 7 summary, 2026-11-09): the same formula on a stack of plates, each plate indented one step further, and the one thing that changed from the plate above marked in red.*

On 2026-11-09 the professor showed the source deck's Summary slide (p. 53: policy evaluation,
policy improvement, value iteration, asynchronous value iteration) and said that the way the
source shows how methods relate was not carried into the HTML deck. The rebuilt Ch 7 had the
pictures (backup tree, gridworld, GPI triangle) but no slide that put the four methods on one
page, and Act 3's seven algorithm slides used six different figure formats, so each method looked
like its own thing.

The source's device, now `mdp-pictures {"mode":"ladder"}`:

- **One plate per method**, a grey panel with a red title above it, a "for ..." line and exactly
  one formula inside. Labels are prose, formulas are maths.
- **The formula is the same on every plate.** What changes is marked in red: the `max` that turns
  evaluation into value iteration, the words "any single" that drop the sweep.
- **Indentation is nesting.** Each plate sits one step to the right of the plate it was derived
  from, so the page reads as a staircase.
- **A loop arrow's span is its scope.** A bracket joining two plates is policy iteration; a
  self-loop on one plate is value iteration; the asynchronous plate's loop is the smallest.
- **Stepped, one plate per press**, and the caption names the one deletion that step makes.

The same picture is used three times in Ch 7, by the `start`/`upto` options: the first two plates
on "Two halves of one machine", the third growing out of them on the value-iteration slide, and
all four on "One backup, four loop scopes" after asynchronous DP. By the summary the students have
seen every plate once.

**Why:** a summary that lists methods side by side asks the audience to find the relation; a
ladder where each rung is "the rung above, minus one loop" *is* the relation. It also carries the
course's story forward: the next deletion, the model inside the backup, is Lecture 8.

**How to apply:** when several methods are variants of one update, draw one formula, stack it,
indent, and colour the diff. Ch 8 (MC, TD, SARSA, Q-learning: one backup, the expectation sampled
and the max moved) and Ch 10 (REINFORCE, baseline, actor-critic) fit the same mould. Reuse the
`ladder` plate helpers rather than inventing a new figure. Related:
[one-figure-format-per-story](one-figure-format-per-story.md),
[label-every-formula-block](label-every-formula-block.md),
[ch07-source-pictures](ch07-source-pictures.md).
