# The handoff chain — fixed wording

Every chapter opens by naming what the previous one left and closes by naming what it passes on.
Those two sentences are **not** for an author to invent: they are the course's spine, and a drifting
phrase here is how a fifteen-lecture argument comes apart. The `inherits:` and `handoff:` fields of a
chapter's front matter must match this table exactly, and the closing slide must hand off in these
words.

| Ch | inherits — what the previous lecture left | hands off — what this lecture leaves |
|---|---|---|
| 0 | — | the three-axis cube, and the route through it |
| 1 | the three-axis map (Lecture 0) | the template `min f s.t. g ≤ 0` |
| 2 | the template `min f s.t. g ≤ 0` (Lecture 1) | belief as a distribution |
| 3 | a belief over one parameter (Lecture 2) | structured belief, plus decision and utility nodes — the influence diagram, which is a one-stage MDP |
| 4 | structured belief, and a prior over functions (Lecture 3) | the acquisition policy — the seed of an RL policy — and the bandit |
| 5 | `argmax f` with a GP, but the oracle removed (Lecture 4) | a forward model then search, and the warning that the optimiser is an adversary |
| 6 | the same problem, inverted (Lecture 5) | an inverse model then sampling — the rhyme that returns as value ↔ policy |
| 7 | the dynamic generalisation of Lecture 1, and the decision network of Lecture 3 | the Bellman equation, which still needs the model |
| 8 | the Bellman optimality equation (Lecture 7) | the continuous-argmax wall |
| 9 | dynamic decision making's second parent — control theory, alongside Lecture 7's OR | the feedback law γ(x), u = Kx |
| 10 | optimal control, with the dynamics f still given (Lecture 9) | the trust-region machinery |
| 11 | both lineages, each with the model thrown away (Lectures 8 and 10) | a learned model plus planning, and bilevel design |
| 12 | learned models (Lecture 11) and the value and policy methods of Lectures 8 and 10 | conservative values and policies, and off-policy evaluation |
| 13 | optimal control (Lecture 9), and decision making from a fixed dataset (Lecture 12) | equilibrium characterised but not computable — which is where **IE579** begins |

## Two structural rhymes that must survive

**Lecture 7 ↔ 9 and Lecture 8 ↔ 10.** These are the two lineages of the course (spine §2), and the
symmetry has to be visible slide by slide, not merely asserted. Lecture 8's opening says: *MDP and DP
is the model-based origin of the OR lineage; delete the model (P, R) and you get value-based RL.*
Lecture 10's opening must be built to the same shape: *optimal control is the model-based origin of
the control lineage; delete the dynamics f and you get policy-based RL.* Same slide count in the
handoff, same translation table, same closing move.

**Lecture 5 ↔ 12.** The static half of the course teaches "the optimiser exploits the surrogate
where it is wrong" and answers it with conservative objective models. The dynamic half meets the
identical failure — a policy exploiting the Q-function on out-of-distribution actions — and answers
it with conservative Q-learning. Lecture 12 should say so out loud and quote Lecture 5.

## Where the crossing tracker goes

Chapters that **cross an axis** get the tracker with an arrow and a "crossing" frame: 2 (model),
7 (stages), 8 and 10 (model, and now two unknowns), 13 (agents).
Chapters that **deepen inside a cell** get the tracker with no arrow: 1, 3, 4, 5, 6, 9, 11, 12.
The appendix has no position on the cube and takes no tracker.
