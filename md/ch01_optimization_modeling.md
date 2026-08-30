---
ch: 1
title: Optimization Problem Modeling
subtitle: Before you can learn a decision, you must be able to state one
tagline: The atom every later method is built from
course: IE437 · Data-Driven Decision Making and Control
author: Jinkyoo Park
institute: KAIST
cube:
  stages: static
  model: model-based
  agents: single agent
inherits: the three-axis map (Lecture 0)
handoff: the template `min f s.t. g ≤ 0` (Lecture 2)
questions:
  - State it?
  - Solve it?
  - Certify it?
  - Convexify it?
---

### Optimization Problem Modeling
{layout: title}

## The handoff — the purest decision
{short: HANDOFF}

Lecture 0 drew the map. We start at the corner where nothing has been taken away yet.

### Where we are — the simplest cell of the map

::: tracker
:::

::: table center
|   | Model-based | Data-driven |
|---|---|---|
| **Static, single** | ==optimisation *(Lec 1)*== | Bayesian / learned opt. *(Lec 2–6)* |
| **Dynamic, single** | MDP / optimal control *(Lec 7, 9)* | reinforcement learning *(Lec 8, 10, 11)* |
:::

We begin at the ==simplest cell==: one decision, a known objective, no time, no rivals. This is classical mathematical optimisation.

::: reveal
::: small
Why start here when the course is about *data-driven* decisions? Because this is the ==atom==. Every later method — Bayesian optimisation, value iteration, policy gradient, trust-region RL — is this template with something made uncertain, sequential or sampled. Master the atom and the molecules become legible.
:::
:::

### The thesis — formulation precedes solution

::: keypoint
Before you can ==learn== a decision, you must be able to ==state== one.
:::

::: reveal
A decision problem becomes mathematics through three ingredients — and naming them is half the work:

- an **objective** $f(x)$ — what "good" means, as a number to minimise;
- **decision variables** $x$ — the levers you may pull;
- **constraints** $g(x)\le 0,\; h(x)=0$ — what is allowed.
:::

::: reveal
::: small
Get this right and the rest is method. Get it wrong — the wrong objective, a missing constraint — and no solver, classical or learned, can save you. The hardest and most consequential step in applied decision making is the ==modelling==, not the solving.
:::
:::

### Formulation is a balance

::: widget formulation-balance
A model that keeps every detail of the world cannot be solved; a model a solver loves may no longer be the problem you had. ==Formulation is the act of balancing the two== — and it is where most of the real difficulty of applied decision making lives.
:::

### The roadmap — four questions

::: qstrip 0
:::

- **Q1 — How do we state a decision mathematically?** The ==standard form==.
- **Q2 — Which problems can we actually solve?** ==Convexity== — the great watershed.
- **Q3 — How do we *know* a solution is optimal?** Optimality conditions and ==KKT==.
- **Q4 — What about the non-convex ones?** ==Successive convexification== and trust regions.

## Act 1 — the standard form
{short: ACT 1, num: Act 1}

**Q1.** One shape that every optimisation problem can be poured into.

### The standard form — one shape for all of them
{q: 1}

::: qstrip
:::

Every mathematical optimisation problem can be written:

$$\min_{x\in D}\; f(x) \qquad \text{s.t.}\quad g_i(x)\le 0,\; i=1,\dots,m, \qquad h_j(x)=0,\; j=1,\dots,p$$

- $x\in\R^n$ — the optimisation variable;  $f:\R^n\to\R$ — the objective;
- $g_i$ — inequality constraints;  $h_j$ — equality constraints;
- the ==optimal value== $p^{*} = \inf\{f(x): x \text{ feasible}\}$.

::: reveal
Two degenerate cases worth naming: $p^{*}=+\infty$ if the problem is *infeasible* (no $x$ satisfies the constraints), and $p^{*}=-\infty$ if it is *unbounded below*. Both are usually signs of a modelling error, not a solver failure.
:::

::: reveal
::: small
Maximising $f$ is minimising $-f$; everything is phrased as minimisation without loss of generality.
:::
:::

## Act 2 — convexity, the watershed
{short: ACT 2, num: Act 2}

**Q2.** Of all the problems you can state, which can you actually solve?

### Convexity — the line between easy and hard
{q: 2}

::: qstrip
:::

A problem is ==convex== when $f$ is a convex function and the feasible set is a convex set — $g_i$ convex, $h_j$ affine.

::: reveal
::: block Why convexity is *the* dividing line
For a convex problem, ==any local minimum is a global minimum.==
:::
:::

::: reveal
That single fact changes everything:

- reliable, efficient solvers exist; initialisation and step size do not trap you in bad local optima;
- global optimality is ==certifiable== — via KKT, in Act 3;
- duality gives a computable lower bound and an optimality gap;
- the problem decomposes well for distributed and large-scale solving.
:::

::: reveal
::: small
Non-convex problems enjoy none of these for free. Much of practical optimisation is the art of ==getting a convex problem== — or a sequence of them.
:::
:::

### Convex sets — the segment test

::: widget convex-set
A set is convex when the segment joining any two of its points stays inside it. A function is convex when the segment joining any two points of its graph stays *above* it — equivalently, when its epigraph is a convex set. ==Both halves of a convex problem are this one test.==
:::

### The watershed, run twice

::: widget convex-watershed
The same descent rule, the same twelve starting points, two objectives. On the convex one the starting point is irrelevant; on the non-convex one it decides the answer. Everything in Act 2 follows from this single picture.
:::

### The convex family — LP, QP, QCQP

::: lede
Named convex forms, in order of generality.
:::

| Class | Objective | Feasible set |
|---|---|---|
| **Linear program (LP)** | $c^\top x + d$ | a polyhedron (affine inequalities) |
| **Quadratic program (QP)** | $\tfrac12 x^\top P x + q^\top x$, with $P\succeq 0$ | a polyhedron |
| **QCQP** | convex quadratic | an intersection of ellipsoids |

::: reveal
The progression matters because modelling is often a matter of *recognising* which named class your problem — or its convexified version — falls into; each has mature, reliable solvers. The LP's optimum sits at a vertex of the polyhedron; the QP's, where the quadratic's level sets first touch the feasible region.
:::

::: reveal
::: small
These same quadratic models reappear in Act 4 as the *local* approximation of hard problems — and, much later, as the trust-region subproblem inside TRPO (Lecture 10).
:::
:::

## Act 3 — certifying optimality
{short: ACT 3, num: Act 3}

**Q3.** A solver returns a point. How do you know it is *the* point?

### When is a point optimal? — the first-order condition
{q: 3}

::: qstrip
:::

For a convex problem $\min_{x\in D} f(x)$ with differentiable $f$, a feasible $x^{*}$ is optimal **if and only if**

$$\nabla f(x^{*})^\top (y - x^{*}) \;\ge\; 0 \qquad \text{for all feasible } y$$

::: reveal
**Reading it geometrically.** Moving from $x^{*}$ toward any other feasible point cannot decrease $f$ — there is no improving feasible direction. If $\nabla f(x^{*})\neq 0$ it defines a ==supporting hyperplane== to the feasible set at $x^{*}$: the whole feasible region lies on the uphill side.
:::

::: reveal
::: keypoint
Optimality $=$ ==no feasible direction points downhill.==
:::

::: small
For an *unconstrained* convex problem this collapses to the familiar $\nabla f(x^{*}) = 0$.
:::
:::

### The condition, made draggable

::: widget kkt-point
Minimise $\lVert x - c\rVert^2$ over a polygon, with $c$ outside it. Drag the point and read the test literally: the red arrow is a feasible direction that decreases $f$. It disappears exactly at the optimum, where the gradient supports the set — and that supporting normal, scaled, ==is the KKT multiplier==.
:::

### KKT — optimality with constraints, and a dual bound

With constraints, introduce multipliers $\lambda_i\ge 0$ for $g_i$ and $\nu_j$ for $h_j$. The ==Karush–Kuhn–Tucker== conditions characterise optimality:

$$\nabla f(x^{*}) + \sum_i \lambda_i \nabla g_i(x^{*}) + \sum_j \nu_j \nabla h_j(x^{*}) = 0, \qquad g_i(x^{*})\le 0,\;\; h_j(x^{*})=0,\;\; \lambda_i\ge 0,\;\; \hl{\lambda_i\, g_i(x^{*})=0}$$

::: reveal
The last identity, ==complementary slackness==, says each constraint is either active ($g_i=0$) or ignored ($\lambda_i=0$). For convex problems KKT is *necessary and sufficient* — a certificate of global optimality.
:::

::: reveal
**Duality, in one line.** The Lagrangian $L(x,\lambda,\nu)=f(x)+\sum_i\lambda_i g_i+\sum_j\nu_j h_j$ yields a dual function whose value ==lower-bounds== $p^{*}$ for any $\lambda\ge 0$. The gap between primal and dual is a computable measure of how close you are.
:::

::: reveal
::: small
Differentiating the KKT system is exactly how one back-propagates through an optimisation layer — the trick behind differentiable LQR and MPC in Lecture 11.
:::
:::

## Act 4 — when the problem is not convex
{short: ACT 4, num: Act 4}

**Q4.** Real problems are not convex. Do we give up the guarantees, or manufacture them?

### Successive convexification — solve a sequence of easy problems
{q: 4}

::: qstrip
:::

Real engineering problems are usually non-convex — non-convex objective, non-convex constraints. The dominant strategy: ==don't solve the hard problem; solve a sequence of convex approximations to it.==

::: reveal
At the current iterate $x^{(k)}$, build a local convex model

$$\tilde f(x) = f(x^{(k)}) + \nabla f(x^{(k)})^\top (x - x^{(k)}) + \tfrac12 (x-x^{(k)})^\top B^{(k)} (x-x^{(k)})$$

linearise the awkward constraints, and add a ==trust region== $\lVert x - x^{(k)}\rVert \le \rho^{(k)}$ so the model stays trustworthy.
:::

::: reveal
::: keypoint
The trust region is the key idea: ==only trust the approximation nearby.==
:::

::: small
Solve the convex subproblem; if it improves the true objective, accept and *grow* $\rho$; if not, reject and *shrink* $\rho$. Repeat.
:::
:::

### The trust region, iterated

::: widget trust-region
Step it and watch the ratio test do the work: an accepted step earns more trust, a rejected one halves it. The true objective is never solved — only a staircase of quadratics inside a shrinking and growing box. ==This exact logic returns as TRPO's KL trust region in Lecture 10.==
:::

### Case study — wind-farm layout optimisation

::: lede
Place $N$ turbines to maximise power, subject to minimum inter-turbine spacing and boundary constraints — a non-convex problem, because the spacing constraints are non-convex.
:::

::: flow
- linearise spacing | + quadratic model
- !solve a convex QP | inside the trust region $\rho$
- improved? | grow or shrink $\rho$
:::

::: reveal
Each iteration is a convex QP, solved reliably; the trust region keeps the linearised constraints close to the true ones. The non-convex layout problem is conquered by ==a staircase of convex problems== — the practical face of Act 2's lesson: *get a convex problem, even if you have to keep making new ones*.
:::

## Closing
{short: CLOSING}

We can state a decision and, when it is convex, prove we have solved it. Now the assumption we drop.

### Where we are — and the assumption we now drop

::: table center
|   | Model-based | Data-driven |
|---|---|---|
| **Static, single** | ==optimisation *(Lec 1 ✓)*== | Bayesian / learned opt. *(Lec 2–6 →)* |
:::

::: reveal
We can now *state* a decision and, when it is convex or convexifiable, *solve and certify* it. But every line above assumed one thing:

::: keypoint
the objective $f$ and the constraints were known, ==exactly.==
:::
:::

::: reveal
::: small
What if $f$ has *uncertain parameters* — a model fitted to noisy data? Then a single best $x$ is not enough; we must reason about our ==uncertainty about $f$ itself==. That is Lecture 2: don't pick a number — carry a belief.
:::
:::

### Optimization is how a decision becomes mathematics — and, when the problem is convex, an answer we can not only find but *prove*.
{layout: standout}

An objective to minimise, levers to pull, limits to respect.

### Questions?
{layout: standout}

Hold onto two pieces: the standard form — it is the skeleton of every objective to come — and the trust region, which returns in surrogate optimisation and again in trust-region RL. Everything else this term is this atom, perturbed by uncertainty.

## Appendix — backup slides
{short: APPENDIX}

Complete statements, kept out of the narrative.

### Backup 1 — the KKT conditions in full

For $\min f(x)$ subject to $g_i(x)\le 0$ and $h_j(x)=0$, the KKT conditions at $x^{*}$, with multipliers $\lambda^{*}\ge 0$ and $\nu^{*}$:

- **Stationarity** — $\nabla f(x^{*}) + \sum_i \lambda_i^{*} \nabla g_i(x^{*}) + \sum_j \nu_j^{*} \nabla h_j(x^{*}) = 0$
- **Primal feasibility** — $g_i(x^{*})\le 0$, $h_j(x^{*})=0$
- **Dual feasibility** — $\lambda_i^{*}\ge 0$
- **Complementary slackness** — $\lambda_i^{*}\, g_i(x^{*}) = 0$

::: small
**Convex case.** If $f, g_i$ are convex and $h_j$ affine, and a constraint qualification such as Slater's holds, KKT is *necessary and sufficient* for global optimality — a checkable certificate. **Non-convex case.** KKT remains necessary under a constraint qualification but not sufficient: a KKT point may be a local minimum, a saddle, or a local maximum.
:::

### Backup 2 — Lagrangian duality and the gap

**Lagrangian.** $L(x,\lambda,\nu) = f(x) + \sum_i \lambda_i g_i(x) + \sum_j \nu_j h_j(x)$.

**Dual function.** $d(\lambda,\nu) = \inf_x L(x,\lambda,\nu)$. For any $\lambda\ge 0$ and any $\nu$, weak duality gives $d(\lambda,\nu)\le p^{*}$ — the dual is a *lower bound* on the optimum, always.

**Dual problem.** $\max_{\lambda\ge0,\,\nu} d(\lambda,\nu) =: d^{*}$. The ==duality gap== is $p^{*} - d^{*}\ge 0$. For convex problems with a constraint qualification the gap is zero ($p^{*}=d^{*}$, *strong duality*), so the dual optimum certifies the primal.

::: small
**Use.** Even when you cannot solve the primal, evaluating $d(\lambda,\nu)$ at any feasible dual point brackets how far your current solution can possibly be from optimal — the practical value of duality.
:::

### Backup 3 — the successive convex programming loop

**Algorithm — trust-region SCP.**

1. Initialise $x^{(0)}$ and a trust radius $\rho^{(0)}$.
2. **Repeat** until $\lVert x^{(k)} - x^{(k-1)}\rVert < \epsilon$:
3.  form the convex model $\tilde f$ — gradient plus an approximate Hessian $B^{(k)}$ — and linearise the constraints;
4.  solve the convex subproblem over $\{x: \lVert x-x^{(k)}\rVert\le\rho^{(k)}\}$, giving a candidate $\tilde x$;
5.  compute the ratio $r = \dfrac{f(x^{(k)}) - f(\tilde x)}{f(x^{(k)}) - \tilde f(\tilde x)}$ — actual over predicted improvement;
6.  if $r \ge a$: accept $x^{(k+1)} = \tilde x$ and grow $\rho^{(k+1)} = \beta_{\text{succ}}\,\rho^{(k)}$;
7.  else: reject $x^{(k+1)} = x^{(k)}$ and shrink $\rho^{(k+1)} = \beta_{\text{fail}}\,\rho^{(k)}$.

::: small
**Why the ratio test.** It measures whether the convex model can be trusted at the proposed step. Trust grows where the model predicts well and shrinks where it does not — the exact logic that, in policy space, becomes TRPO's KL trust region in Lecture 10.
:::
