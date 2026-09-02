---
ch: 1
title: Optimization Problem Modeling
subtitle: Before you can learn a decision, you must be able to state one
tagline: The atom every later method is built from
blurb: >-
  How to state a decision problem so that it can be solved at all: variables, objective,
  constraints, and the standard form everything later is written in. Convexity is the watershed —
  on one side a local optimum is global, on the other it is not — and the KKT conditions are how
  you certify an answer rather than merely find one.
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

### Equivalent problems — four rewrites worth knowing
{fill: top}

::: lede
The standard form is a shape, and most problems must be *put into* it. Four transformations do almost all of that work, and each leaves the optimal value unchanged.
:::

| rewrite | from | to |
|---|---|---|
| **equality constraints** | $f(\mathbf{A}_ix+\mathbf{b}_i)$ inside | $f(z_i)$ with $z_i=\mathbf{A}_ix+\mathbf{b}_i$ |
| **slack variables** | $a_i^\top x \le b_i$ | $a_i^\top x + s_i = b_i,\; s\ge 0$ |
| **epigraph form** | $\min_x f(x)$ | $\min_{x,t} t$ s.t. $f(x)-t\le 0$ |
| **minimise out a variable** | $\min_{x_1,x_2} f(x_1,x_2)$ | $\min_{x_1}\hat f(x_1),\ \hat f=\inf_{x_2} f$ |

::: reveal
::: small
The ==epigraph form== is the one to remember: every convex problem can be written with a *linear* objective, because the difficulty pushes into the single constraint $f(x)\le t$.
:::
:::

### Check — putting it in the standard form
{q: 1}

::: quiz A plant requirement reads *"output must be at least 100 units."* Written into the standard form $\min f$ s.t. $g(x) \le 0$, the constraint becomes:
- =$100 - x \le 0$
- $x \ge 100$, left as it is — the form allows either direction
- $x - 100 \le 0$
- It is an equality constraint, so it becomes $h(x) = x - 100 = 0$
The standard form admits **one** inequality direction, so every "at least" is flipped by negating both sides. It is bookkeeping, but it is the bookkeeping that lets a single solver read every problem in the course — and getting the sign backwards silently optimises the opposite plant.
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

- a convex problem has a ==globally== optimal solution, not merely a locally optimal one;
- reliable, efficient solvers exist;
- the choice of solver and its internal settings — initialisation, step size, batch size — ==does not matter==;
- global optimality is ==certifiable== — via KKT, in Act 3;
- the dual problem gives a computable lower bound and an optimality gap;
- distributed and decentralised methods are well studied.
:::

### Convex sets — the segment test

::: lede
Non-convex problems enjoy none of those guarantees for free, so much of practical optimisation is the art of ==getting a convex problem== — or a sequence of them. And both halves of one are the same test.
:::

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

| Class | Objective | Each constraint | The shape it carves |
|---|---|---|---|
| **Linear program (LP)** | $c^\top x + d$ | $a_i^\top x \le b_i$ | a ==half-space==; $m$ of them cut a polyhedron — flat faces, sharp corners |
| **Quadratic program (QP)** | $\tfrac12 x^\top P x + q^\top x$, $P\succeq 0$ | $a_i^\top x \le b_i$ | ==the same polyhedron==; only the objective bent, plane into bowl |
| **QCQP** | convex quadratic | $\tfrac12 x^\top P_i x + q_i^\top x + r_i \le 0$ | an ==ellipsoid== when $P_i\succ 0$; the walls are curved now, not flat |

::: reveal
The progression matters because modelling is often a matter of *recognising* which named class your problem — or its convexified version — falls into; each has mature, reliable solvers. The LP's optimum sits at a vertex of the polyhedron; the QP's, where the quadratic's level sets first touch the feasible region.
:::

::: reveal
::: small
These same quadratic models reappear in Act 4 as the *local* approximation of hard problems — and, much later, as the trust-region subproblem inside TRPO (Lecture 10).
:::
:::

### Three problems that are secretly linear programs
{fill: top}

::: cols c3
::: col Diet {p}(Example 1.2)
Buy quantities $x_j$ of $n$ foods as cheaply as possible; food $j$ costs $c_j$ and carries $a_{ij}$ of nutrient $i$, and the diet needs at least $b_i$ of each.

$$\min_{x\in\R_+^{n}} c^\top x \quad \text{s.t.}\ \sum_j a_{ij}x_j \ge b_i$$
:::
::: col Piecewise-linear {p}(Example 1.3)
A maximum of affine pieces is not linear, but its *epigraph* is:

$$\min_x \max_i (a_i^\top x + b_i)$$

$$=\ \min_{x,t} t \ \ \text{s.t.}\ a_i^\top x + b_i \le t$$

The epigraph rewrite of Act 1, earning its keep.
:::
::: col Chebyshev centre {p}(Example 1.4)
The centre of the largest ball inscribed in $\mathcal{P}=\{x: a_i^\top x\le b_i\}$. The ball fits iff $\sup_{\lVert u\rVert\le r} a_i^\top(x_c+u) \le b_i$, and that supremum is available in closed form:

$$\max_{x_c,r} r \ \ \text{s.t.}\ a_i^\top x_c + r\lVert a_i\rVert_2 \le b_i$$
:::
:::

::: reveal
::: small
None of the three looks linear when stated. ==Modelling is the act of finding the rewrite==, and it is where the expertise lives — the solver is a commodity.
:::
:::

### Two that are quadratic, and one that is neither

::: cols
::: col Quadratic programs
**Least squares with bounds.** $\min_x \lVert \mathbf{A}x-b\rVert_2^2$ subject to $l \le x \le u$. Convex for *every* $\mathbf{A}$: the Hessian $2\mathbf{A}^\top\mathbf{A}\succeq0$ whatever $\mathbf{A}$ holds, over a convex box. Nothing to check.

**A linear programme with random cost.** If $c$ has mean $\bar c$ and covariance $\Sigma$, then $c^\top x$ has mean $\bar c^\top x$ and variance $x^\top\Sigma x$, so

$$\min_x\ \bar c^\top x + \hl{\gamma\, x^\top \Sigma x}$$

trades expected cost against risk — $\gamma$ is the first risk parameter of the course. A covariance is always $\Sigma\succeq0$, so this is convex ==exactly when $\gamma\ge0$==, when variance is a cost. Risk-*seeking* $\gamma<0$ makes the objective concave and leaves the convex world at once.
:::
::: col.accent Robust linear programming
With $g_i$ uncertain there are two honest formulations — Lecture 0's uncertainty split — and ==only one is convex for free.==

**Deterministic (worst case).** Hold for *every* $g_i$ in a set $\mathcal{E}_i$:

$$g_i^\top x \le h_i \quad \forall g_i\in\mathcal{E}_i$$

Convex for **any** $\mathcal{E}_i$, even a nonconvex one: the feasible set is an intersection of half-spaces, one per $g_i$. The set decides *tractability*, not convexity — an ellipsoid gives a cone constraint.

**Stochastic (chance constrained).** Hold only with probability $\eta$:

$$\mathbf{P}\big(g_i^\top x \le h_i\big) \ge \eta$$

**Not convex in general.** Gaussian $g_i$ gives $\bar g_i^\top x + \Phi^{-1}(\eta)\lVert\Sigma_i^{1/2}x\rVert_2 \le h_i$ — a cone ==only when $\eta\ge\tfrac12$==, since that is when $\Phi^{-1}(\eta)\ge0$.
:::
:::

::: reveal
::: small
Not "the usual choices", then, but three conditions: $\gamma\ge0$, any $\mathcal{E}_i$ at all, and $\eta\ge\tfrac12$. ==Robustness is bought inside the convex world — but not below even odds.== Lecture 2 takes the stochastic reading much further; Lecture 5 meets the worst-case one again when a surrogate must be trusted only where the data supports it.
:::
:::

### Convexity, imposed on a *learned* model
{sub: pp. 20–24 of the source — where this lecture reaches into Part IV}

The classes above assume someone hands you $f$. Modern practice does the opposite: it learns $f$ from data and then wants to optimise over it — and a neural network is not convex in its input, so the resulting problem has none of the guarantees of this act.

::: reveal
- **Input Convex Neural Networks (ICNN)** — constrain the weights so the network's *output is a convex function of its input*, while remaining a free function of its parameters. Fit the model however you like; the control problem it induces is then convex. {p}(Amos, Xu & Kolter, 2017)
- **Optimisation as a layer** — OptNet and differentiable convex layers put an $\argmin$ *inside* a network and differentiate through it, using the ==derivative of the KKT system== of Act 3. {p}(Amos & Kolter, 2017; Agrawal et al., 2019)
- **Implicit deep learning** — a layer defined by a condition its output must satisfy rather than by a formula. Optimisation ($z^{*}=\argmin_z f_\theta(x,z)$), fixed points ($z^{*}=f_\theta(x,z^{*})$) and neural ODEs are the same construction, trained through the implicit function theorem: $\dfrac{\partial \mathcal{L}}{\partial\theta} = \dfrac{\partial z^{*}}{\partial\theta}\dfrac{\partial\mathcal{L}}{\partial z^{*}}$.
:::

::: reveal
::: small
This is the seam between Lecture 1 and Part IV. ==Convexity is not only a property you find; it is one you can impose== — and Lecture 11 will impose it on a learned dynamics model so that a planner can differentiate through the control problem, in the professor's own bilevel design work.
:::
:::

### Check — why convexity is the watershed
{q: 2}

::: quiz What does convexity actually buy you?
- A closed-form solution always exists
- =Every local minimum is automatically a global minimum
- The problem can be solved in a fixed number of steps
- The feasible set is guaranteed to be non-empty
Convexity does not make a problem easy to *write down* or guarantee a formula. It makes a **local** search sufficient: having found a point with no downhill direction, you are done, and no amount of further searching elsewhere can beat it. That is why the line between convex and non-convex is the one that matters.
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

### Check — the price of a slack constraint
{q: 3}

::: quiz At the optimum, an inequality constraint turns out to be *slack* — it is satisfied strictly, not at its boundary. What do the KKT conditions say about its multiplier $\lambda$?
- $\lambda > 0$, and it measures how far the constraint is from binding
- $\lambda$ is undetermined by the KKT conditions
- =$\lambda = 0$
- $\lambda < 0$, since the constraint pushes the optimum outward
Complementary slackness is $\lambda \cdot g(x^\*) = 0$: either the constraint binds or its price is zero. A constraint that does not constrain you **costs you nothing** — relax it and the optimum does not move. The multiplier is a shadow price, and slack goods are free.
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
{sub: the problem this lecture was built around}

::: cols
::: col Why the problem is hard
A wind farm loses efficiency as it grows: the largest, the London Array, draws 630 MW from 175 turbines, and each turbine sits in the ==wake== of those upwind of it. Power at turbine $i$ therefore depends on where *every other* turbine is.

The wake deficit is the Park model,
$$\delta u(d,r)=2\alpha\Big(\tfrac{R_0}{R_0+\kappa d}\Big)^{2}\exp\!\Big(-\big(\tfrac{r}{R_0+\kappa d}\big)^{2}\Big)$$
in the down-stream distance $d$ and the radial distance $r$.
:::
::: col.accent What is actually optimised
Wind direction and speed are random — direction from the site's own rose, speed Weibull within each direction bin — so the objective is an **expectation** over their joint mass function:

$$\max_{l}\ \E\Big[\textstyle\sum_{i=1}^{N} P_i(l;U,\theta^{W})\Big] \approx \sum_{k}\sum_{j}\sum_{i} P_i(l;U_j,\theta^{W}_k)\Pr(U_j,\theta^{W}_k)$$

$$\text{s.t.}\quad \lVert l_i - l_j\rVert_2 \ge 5D,\qquad \underline{c}\le \mathbf{C}l \le \bar c$$
:::
:::

::: reveal
::: small
The objective is a smooth expectation, but ==the spacing constraint is not convex== — a minimum distance excludes a *ball*, and the complement of a ball is the wrong side of everything this lecture has built.
:::
:::

### The staircase, in the professor's own algorithm

At iterate $l^{(k)}$: take the analytic gradient $\nabla f(l^{(k)})$ and an approximate Hessian $B^{(k)}$, **linearise** each spacing constraint about the current layout, and add a trust region.

$$\max_{l}\ \tilde f(l) = f(l^{k}) + \nabla f(l^{k})^\top(l-l^{k}) + \tfrac12 (l-l^{k})^\top B^{(k)}(l-l^{k})$$

$$\text{s.t.}\ \big(l^{(k)}_i-l^{(k)}_j\big)^\top (l_i-l_j) > 4D\,\big\lVert l^{(k)}_i-l^{(k)}_j\big\rVert_2, \qquad l \in T^{(k)}=\{l: \lVert l-l^{k}\rVert < \rho^{(k)}\}$$

::: reveal
::: block Algorithm 1 — layout optimisation by successive convex programming
Solve the convex subproblem for $\tilde l$, then judge it by the ratio
$\dfrac{f(l^{(k)}) - f(\tilde l)}{f(l^{(k)}) - \tilde f(\tilde l)} \ge a$ — **accept and grow** $\rho^{(k+1)}=\beta^{\text{succ}}\rho^{(k)}$, otherwise **reject and shrink** $\rho^{(k+1)}=\beta^{\text{fail}}\rho^{(k)}$. Repeat until $\lVert l^{(k)}-l^{(k-1)}\rVert<\epsilon$.
:::
:::

::: reveal
::: small
That ratio test is exactly what the widget two slides ago was running. ==The toy on that slide is this algorithm.== Run on a real farm it lifts power efficiency from about $0.69$ to $0.76$ and flattens the efficiency-versus-direction curve, so the farm is not only better on average but steadier. The non-convex layout problem is conquered by ==a staircase of convex problems== — Act 2's lesson, made operational: *get a convex problem, even if you have to keep making new ones*.
:::
:::

### Check — what a trust region is for
{q: 4}

::: quiz Why does a trust-region method bound the size of its step?
- To keep the iterate inside the feasible set
- To guarantee the objective decreases monotonically
- To make each iteration cheaper to compute
- =Because the local model is only a good approximation nearby, so the step must stay where the model can be believed
The method builds a simple model — usually quadratic — of a complicated $f$ around the current point. That model is **only trustworthy in a neighbourhood**, so the step is capped at a radius that is grown or shrunk according to how well the model just predicted reality. This same machinery returns in Lecture 10, holding a policy update near the policy that generated its data.
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
