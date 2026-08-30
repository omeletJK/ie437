# IE437 — build plan for the full lecture series

The spine ([`../IE437_Course_Narrative_Spine.md`](../IE437_Course_Narrative_Spine.md)) fixes the
narrative; this file fixes what actually gets built, chapter by chapter, in the format the three
finished decks established. Act titles below are the real `\section{}` headings of the `tex/`
sources, so the markdown can be written straight against them.

**The format, in one line.** Title → *handoff* (tracker · translation table · roadmap of four
questions) → four **Acts**, each opening with the question strip advanced one place → *closing*
(where we are · the one sentence) → *appendix* of complete arguments. One widget per Act that
carries an idea a static picture cannot.

---

## 1. The whole course at a glance

| # | Chapter | Cube move | Widgets | tex frames | est. slides | status |
|---|---|---|---|---|---|---|
| 0 | Introduction | *the map itself* | 4 | 11 | 23 | **done** |
| 1 | Optimization Problem Modeling | origin corner | 5 | 16 | 29 | **done** |
| 2 | Bayesian Statistics | **model → data** (on *f*) | 5 | 15 | 38 | **done** |
| 3 | Bayesian Network | same cell, deeper | 4 | 14 | 46 | **done** |
| 4 | Bayesian Optimization | same cell, now acting | 4 | 16 | 37 | **done** |
| 5 | Surrogate Design Optimization | same cell, offline | 4 | 15 | 40 | **done** |
| 6 | Generative Design Optimization | same cell, inverted | 4 | 15 | 48 | **done** |
| 7 | MDP & Dynamic Programming | **static → dynamic** | 4 | 20 | 46 | **done** |
| 8 | Value-Based RL | **model → data** (*r* and *P*) | 4 | 30 | 41 | **done** |
| 9 | Optimal Control | model axis resets, lineage B | 4 | 17 | 42 | **done** |
| 10 | Policy-Based RL | **model → data** (lineage B) | 4 | 19 | 44 | **done** |
| 11 | Model-Based RL | the two lineages rejoin | 4 | 15 | 53 | **done** |
| **12** | **Offline RL** *(new, and the finale)* | interaction removed | 4 | — *(spec, no tex)* | 39 | **done** |
| ~~—~~ | ~~Dynamic Games~~ · ~~MARL~~ | — | — | 107 | — | **→ IE579** |
| A | Probability Review | toolbox, no cube position | 3+1 | 12 | 30 | **done** |

Thirteen files after the v3 revision: **Ch 0–12 plus the probability appendix**, with the whole
multi-agent axis moved to IE579. **All are built** — 556 slides and 57 widget mounts.

**Sources, and what each one settles.** The spine fixes the narrative — cube position, crossings,
handoff chain. The `tex` fixes the act structure, the central thesis and the equations. The
original `lecture_slides/*.pdf` are the lectures actually taught, and they carry the body: the
worked examples, the derivations the tex compressed away, and every diagram. Structure from the
first two; substance and figures from the third.

---

## 2. Chapter by chapter

### Part I — the given world

**Ch 1 · Optimization Problem Modeling** — *done.*
Acts: standard form · convexity, the watershed · certifying optimality · when it is not convex.
Widgets: `formulation-balance`, `convex-set`, `convex-watershed`, `kkt-point`, `trust-region`.

### Part II — the uncertain world (the objective becomes unknown)

**Ch 2 · Bayesian Statistics** — *the handoff: the objective was uncertain.*
Acts: belief as a distribution · how data updates belief · collapsing to a point (MLE, MAP,
regularization) · predicting with uncertainty intact.

- `prior-posterior` — drop observations one at a time and watch prior → posterior. A prior-strength
  slider shows the balance the whole chapter is about: who wins, the prior or the data.
- `mle-map-bayes` — the *same* data, three answers. Raise *n* and watch MAP slide into MLE; raise
  the prior variance and watch the ridge penalty vanish. This is where regularization stops being
  a trick and becomes a prior.
- `predictive-band` — plug-in prediction against the posterior predictive; the band that a point
  estimate throws away.

**Ch 3 · Bayesian Network** — *the handoff: belief over a whole system.*
Acts: the joint as a graph · what the graph encodes · reasoning with the network · from belief to
decision.

- `factor-count` — the joint table against the factorized parameter count. One number, and the
  entire motivation for graphical models.
- `d-separation` — click nodes to observe them; active paths light, blocked paths grey. The
  explaining-away collider is the case worth pausing on.
- `influence-diagram` — add decision and utility nodes, compute expected utility, pick the action.
  **This is the seed of every later chapter**, so the widget should say so: a one-stage MDP.

**Ch 4 · Bayesian Optimization** — *the handoff: belief that acts.*
Acts: a belief over an unknown function · the Gaussian process · where to look next · beyond,
toward RL.

- `gp-posterior` — click to sample the unknown function; the GP mean and ±2σ band redraw. A
  length-scale slider shows what the kernel assumes.
- `acquisition-loop` — EI / UCB / PI drawn under the posterior; press *next point* and watch BO
  choose. The centrepiece of the chapter, and the first policy in the course.
- `explore-exploit` — the UCB κ dial against cumulative regret: too greedy stalls, too curious
  wanders. The bandit dilemma that returns in Ch 8's ε-greedy.

### Part III — design from a fixed dataset

**Ch 5 · Surrogate Design Optimization** — *the handoff: optimization with no oracle.*
Acts: the naive approach · why it fails · conservative objective models · other ways to be robust.

- `surrogate-exploit` — fit a surrogate to a fixed dataset, then optimise **on the surrogate**. The
  optimiser walks straight into the region where the surrogate is confidently wrong. The chapter's
  whole argument in one picture.
- `conservative-model` — add a pessimism term and watch the optimiser stay where the data is.
- `ensemble-alarm` — several surrogates; their disagreement as the out-of-distribution alarm.

**Ch 6 · Generative Design Optimization** — *the handoff: the same problem, inverted.*
Acts: inverting the function · generative models · the VAE · conditioning toward good designs.

- `forward-vs-inverse` — the same dataset read both ways: search a learned *f*, or sample a learned
  *p(x | y)*. Sets up the value ↔ policy rhyme of Part IV explicitly.
- `vae-latent` — walk a 2-D latent space and watch designs morph; a β dial trades reconstruction
  against prior match.
- `conditional-sample` — raise the target *y\** and watch the sampled design distribution shift,
  then thin out as the condition leaves the data.

### Part IV — the world that unfolds

**Ch 7 · MDP & Dynamic Programming** — *the handoff: from a single choice to a sequence.*
Acts: the arena and the value of a state · the Bellman equation · solving it with the model ·
why it works.

- `value-iteration` — a gridworld; step the sweep and watch value spread from the goal and the
  policy arrows crystallise behind it.
- `policy-vs-value-iteration` — both run on the same problem, counting backups. Policy iteration
  takes fewer, heavier steps.
- `gamma-dial` — γ from 0.5 to 0.99 and the optimal policy changing from myopic to far-sighted.
- `contraction` — ‖V<sub>k</sub> − V\*‖<sub>∞</sub> on a log axis, straight with slope log γ. Act 4's
  proof, shown rather than asserted.

**Ch 8 · Value-Based RL** — *done.*
Widgets: `mc-vs-td`, `gpi-explore`, `cliff-walk`, `deadly-triad`.

**Ch 9 · Optimal Control** — *the handoff: the second parent.*
Acts: it is the same problem · Bellman made infinitesimal (HJB) · the one closed form (LQR) ·
the other view (Pontryagin).

- `dt-to-hjb` — shrink Δt on a discrete Bellman backup and watch it converge numerically to the
  HJB solution. The claim of Act 2, verified on screen.
- `lqr` — a double integrator with Q and R dials: the Riccati gain **K**, the closed-loop
  trajectory, the cost. The one problem in the course with a closed form.
- `pontryagin` — state and costate shot forward and backward; the Hamiltonian staying flat along
  the optimal trajectory.

**Ch 10 · Policy-Based RL** — *the handoff: delete the dynamics.*
Acts: a gradient without the model · taming variance with a critic · continuous control (DDPG) ·
stepping without falling.

- `policy-gradient` — a Gaussian policy on a continuous task; watch θ move under REINFORCE and the
  estimator's variance printed beside it.
- `baseline-variance` — the identical run with and without a baseline, variance of ĝ plotted. Act 2
  in one chart.
- `continuous-argmax` — the wall Ch 8 handed over: max<sub>a</sub> Q over a continuum, and μ<sub>θ</sub>(s)
  replacing the search with a learned output.
- `kl-trust-region` — `trust-region` from Ch 1, moved into policy space. The rhyme should be
  explicit: same ratio test, same accept/shrink logic.

**Ch 11 · Model-Based RL** — *the handoff: the model returns.*
Acts: the spectrum of model use · planning with a learned model · differentiable control ·
the lineages teach each other.

- `model-bias` — learn dynamics from *n* transitions, roll out, and watch predicted and true
  trajectories separate. A horizon dial shows the error compounding.
- `dyna` — real steps against imagined steps; the sample-efficiency curve that justifies the whole
  chapter, and the point where model bias overtakes the gain.
- `mpc-horizon` — receding-horizon planning on the learned model.

### Part V — many decision makers

**Ch 12 · Offline Reinforcement Learning** — *the handoff: learned models, and the value and
policy methods, with the right to interact withdrawn.* The course's finale, and the only chapter
with no source deck: its act structure, thesis and equations are fixed in
[`_source/ch12_spec.md`](_source/ch12_spec.md).

Acts: what breaks (distributional shift) · constrain the policy · constrain the value ·
the other two routes, and how you would know.

- `offline-divergence` — Lecture 8's Q-learning, unchanged, on a fixed dataset: the value climbs on
  actions nobody took while the true return falls. The offline twin of Ch 5's `surrogate-exploit`.
- a conservatism dial — CQL's α or IQL's τ turning the value into a lower bound, with the same
  over-conservative far end that Ch 5's `conservative-coms` shows.
- `stitching` — two mediocre trajectories in the data, and a policy that finds the better path
  neither of them took. This is what separates offline RL from behaviour cloning.
- off-policy evaluation — importance-sampling variance exploding with the horizon while a
  doubly-robust estimator holds.

*The multi-agent axis — dynamic games and MARL — moved to IE579 in spine v3. Lecture 0 names the
axis and shows the far face of the cube as that course's territory; this one does not cross it.*

### Appendix

**A · Probability Review** — a toolbox, no cube position, no question strip.

- `gaussian-four` — the four properties in one figure: marginal, conditional, linear map, product.
  Drag the mean, reshape Σ, condition on x₁ = c and watch the conditional slice appear. Nearly every
  later chapter reaches back to this one widget.
- `mc-estimator` — sampling, estimator variance, and why √n is the wall.

---

## 3. How to build it

**Order.** 2 → 3 → 4 → [5 · 6] → 7 → 9 → 10 → 11 → 12 → [13a · 13b] → A. Straight along the
narrative chain, because each chapter's handoff slide quotes the previous chapter's closing.
Ch 5 and Ch 6 share an opening — write them together. Ch 9 and Ch 10 must *rhyme* with Ch 7 and
Ch 8 slide for slide; write them with Ch 8 open alongside.

**Per chapter.** Read the `tex` and the source PDF → write the markdown → build → build the
widgets → screenshot every slide and fix overflow → PDF. The markdown is a few hours; the widgets
are the real cost, roughly a day per chapter at three or four each.

**Where the effort should go.** Not every act needs a simulator. Three tiers, and most chapters
want a mix:

- **redraw** — the source PDF already has the right figure (the cube, the seesaw, the convex sets).
  Cheap, and the most faithful thing to do. Always check the PDF first.
- **step-through** — a static diagram revealed in stages (the DQN loop, the GPI dance). Cheap.
- **simulator** — an algorithm that actually runs, where seeing it run is the argument
  (`cliff-walk`, `deadly-triad`, `surrogate-exploit`, `baseline-variance`). Expensive; spend it on
  the one claim per chapter that students otherwise take on faith.

**Cross-chapter checks, once the set is complete.** Every chapter's `handoff:` must match the next
chapter's `inherits:`. The Ch 8 ↔ Ch 10 and Ch 7 ↔ Ch 9 pairs must be structurally parallel. The
`trust-region` widget must be visibly the same object in Ch 1 and Ch 10, and the cube tracker must
agree with `course-cube` in Ch 0.
