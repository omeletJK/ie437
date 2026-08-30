# Ch 12 · Offline Reinforcement Learning — authoring spec

**This file stands in for a `tex/` source.** Every other chapter has one; this chapter is new to the
course (spine v3), so its act structure, thesis and equations are fixed here instead. Treat it
exactly as the other chapters treat their tex: it settles the skeleton, and the substance is yours
to build. It has **not** been reviewed by the professor — flag anything you think is wrong rather
than quietly working around it.

There is no PDF for this chapter either. The literature below is standard and the citations are
given so they can be checked.

---

## Front matter

```yaml
ch: 12
title: Offline Reinforcement Learning
subtitle: You cannot try. Learn from what was already done.
tagline: The last thing taken away is the right to act at all
cube:
  stages: dynamic
  model: data-driven
  agents: single agent
# deepens inside a cell — no crossing:, no cube_from:
inherits: learned models (Lecture 11) and the value and policy methods of Lectures 8 and 10
handoff: (see md/_CHAIN.md — this chapter closes the course)
questions:
  - What breaks?
  - Constrain the policy?
  - Constrain the value?
  - How would you know?
```

## The thesis, in one line

> **Every algorithm in Part IV assumed it could try something. Take that away and the Bellman
> equation starts lying to you — because the one term it needs, `max_{a'} Q(s',a')`, is evaluated at
> actions nobody ever took.**

## Where it sits, and why it is the finale

The cube position is unchanged from Lectures 8, 10 and 11 — dynamic, data-driven, single agent. What
changes is a sub-axis the course has already crossed once, on the static side:

```
static:   Ch 4  Bayesian optimisation  (may query)   →  Ch 5–6  fixed dataset
dynamic:  Ch 8 · 10 · 11  RL           (may interact) →  Ch 12   fixed dataset
```

The `given-ledger` widget in Lecture 0 has a row called *the right to query* which goes dark in
Lecture 5 and, until now, came back on for the whole dynamic half. This chapter is where it goes
dark for good. Say that.

## The four acts

### Act 1 — what breaks: distributional shift

The dataset `D = {(s, a, r, s')}` was collected by some behaviour policy β, and no more will arrive.
Run Lecture 8's Q-learning on it unchanged and the target

```
y = r + γ max_{a'} Q(s', a')
```

takes its maximum over **every** action, including actions β never took at s'. There is no data to
correct `Q(s', a')` there, function approximation will happily extrapolate, and the max actively
seeks out whichever extrapolation is highest. The error is then bootstrapped into the next target
and compounds.

Two things must be said precisely:

- This is **not** the same as ordinary off-policy learning being hard. Online, an over-estimate gets
  tested: the agent tries the action, the environment corrects it. Offline that correction channel
  is gone, and the over-estimate is never punished. {p}(Fujimoto, Meger & Precup, 2019 — *extrapolation error*)
- It is **Lecture 8's deadly triad with the escape hatch removed.** Function approximation,
  bootstrapping and off-policy data are all still present; what online RL had, and this does not, is
  the ability to visit the state–action pair it is wrong about. Quote the `deadly-triad` widget.

**And the rhyme that matters most.** This is Lecture 5's thesis one axis over. There, a surrogate
fitted to a fixed dataset was *exploited by the optimiser* in the region where it was wrong. Here a
Q-function fitted to a fixed dataset is exploited by the `max` in exactly the same way. The two
chapters answer it the same way as well — conservatism — and the source deck for Lecture 5 already
draws COMs and CQL side by side, so this is a quotation, not an invention. Read
`md/ch05_surrogate_design_optimization.md` and quote it.

Also worth naming: behaviour cloning is the trivial baseline that cannot exceed the data, and the
whole point of offline RL is **stitching** — combining good segments of mediocre trajectories into a
trajectory better than any in `D`.

### Act 2 — constrain the policy

Keep the learned policy close to the behaviour policy, so the target is never evaluated far from
support.

- **BCQ** — generate candidate actions from a model of β and take the max only over those.
  {p}(Fujimoto et al., 2019)
- **BRAC / BEAR** — an explicit divergence penalty, KL or MMD, between π and β.
- **TD3+BC** — one line added to TD3, and it is the one to dwell on because of how little it is:
  ```
  π ← argmax_π  E[ λ Q(s, π(s)) − (π(s) − a)² ]
  ```
  a behaviour-cloning term with a normalising λ. {p}(Fujimoto & Gu, 2021)

The cost of this family: the policy inherits β's ceiling wherever the constraint binds. If β was bad,
staying near it is bad.

### Act 3 — constrain the value

Do not restrict where the policy may go; make the value function itself pessimistic about places the
data does not support, and then let the policy maximise freely.

- **CQL** — push down the value of actions the learned policy likes, push up the value of actions in
  the data, on top of the usual Bellman error:
  ```
  min_Q  α ( E_{s~D, a~μ}[Q(s,a)] − E_{(s,a)~D}[Q(s,a)] )  +  ½ E[(Q − 𝔅Q̂)²]
  ```
  which yields a **lower bound** on the true value of the learned policy. {p}(Kumar et al., 2020)
  Two cautions, both found while building the chapter. The bound is on `E_{a~π}[Q̂]`, **not**
  pointwise on `Q̂` — individual entries can still sit above the truth. And when `μ = softmax(Q)` is
  written bare it is a soft *average*, not a soft *max*: CQL(H)'s logsumexp only behaves as a max
  because deep-RL Q-values are large relative to `log|A|`, so a small temperature is needed on a
  toy action grid.
  This is COMs with `x` replaced by `(s,a)` — draw the correspondence explicitly.
- **IQL** — never query an out-of-distribution action at all. Fit `V` by expectile regression toward
  `Q` on in-data actions, and use `V(s')` in the target:
  ```
  L_V = E[ L₂^τ( Q(s,a) − V(s) ) ],     L_Q = E[ ( r + γ V(s') − Q(s,a) )² ]
  ```
  with `L₂^τ(u) = |τ − 1{u<0}| u²`. As τ → 1 the expectile approaches the in-support maximum, so the
  policy improves without the max ever leaving the data. {p}(Kostrikov, Nair & Levine, 2022)

The α of CQL and the τ of IQL are the same dial as Lecture 5's conservatism α: too little and the
value is exploited, too much and the policy will not leave the data. Say so.

### Act 4 — the other two routes, and how you would know

- **Model-based offline RL.** Lecture 11's learned model returns, made pessimistic: penalise the
  reward by the model's own uncertainty, `r̃(s,a) = r(s,a) − λ u(s,a)`, and plan in that penalised
  MDP. {p}(MOPO, Yu et al., 2020; MOReL, Kidambi et al., 2020) The same conservatism, now applied to
  the dynamics rather than the value — which completes the set: policy, value, model.
- **Sequence models.** Drop the Bellman equation entirely and model the trajectory. Decision
  Transformer conditions on a return-to-go token and predicts the next action; Diffuser generates
  whole trajectories. {p}(Chen et al., 2021; Janner et al., 2022) Connect this to Lecture 6 — it is
  *generate, don't search*, arriving in the dynamic world exactly as the spine's value ↔ policy
  rhyme predicts.
- **Off-policy evaluation — the practitioner's first question.** You have a policy and you cannot
  deploy it to find out whether it is good. Importance sampling and its per-decision form, and the
  variance that grows with the horizon. This act should say plainly that in an industrial setting
  OPE is asked *before* the choice of algorithm, and that the course has not addressed it until now.

  > **Correction to an earlier draft of this spec.** It claimed that importance sampling's variance
  > explodes with the horizon *while a doubly-robust estimator holds up*. That is false. DR's
  > variance is also `O(q^H)` — merely scaled by the Bellman residual, so on a log axis its curve
  > runs parallel to IS, not flat. The estimators that stay usable at long horizons are **weighted
  > IS and fitted Q evaluation, and both are biased**. That is the better lesson and the one the
  > chapter teaches: at long horizons you choose which way to be wrong, you do not escape.

## The closing — this is the finale

Two jobs, in this order.

1. **The chapter's own result.** Three answers to one failure: constrain the policy, constrain the
   value, constrain the model. All three are the same instinct — *do not trust the model where the
   data is thin* — which is Lecture 5's instinct, promoted to the dynamic world.
2. **The course, stood back up.** Use the cube. The tour is complete on the near face: the origin
   (Ch 1), the model axis crossed on `f` (Ch 2–6), the stages axis crossed (Ch 7), the model axis
   crossed again on `r` and `P` with the unknowns doubling (Ch 8–11), and finally the interaction
   withdrawn (Ch 12). Name the axis **not** crossed — agents — and hand it to **IE579**, showing the
   far face of the cube as its territory. That gesture is the reason Lecture 0 draws the whole cube
   rather than only the part this course visits.

## Widgets — three or four

The one that must exist is the offline counterpart of Lecture 5's `surrogate-exploit`: run
Lecture 8's Q-learning unchanged on a fixed dataset in a small MDP and show `Q` diverging upward on
out-of-distribution actions while the true return falls. Reuse Lecture 8's gridworld or cliff if it
helps the rhyme. Then a conservatism dial (the CQL α or the IQL τ) showing the value becoming a
lower bound and the policy recovering, with the same over-conservative failure at the far end that
Lecture 5's `conservative-coms` shows. A stitching demonstration is a strong third — two mediocre
trajectories in `D`, and a policy that finds the better path neither of them took. An OPE widget
showing importance-sampling variance exploding with horizon while a doubly-robust estimator holds up
would be the fourth.

Verify numerically before shipping, as the brief requires. Divergence, a lower bound, and one
estimator beating another are all exactly the kind of claim that must be computed rather than drawn.
