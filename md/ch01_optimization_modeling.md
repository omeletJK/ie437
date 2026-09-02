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

### The same convexity, seen through the gradient
{sub: the inequality the rest of this lecture rests on}

The segment test is the definition. Differentiate it and convexity takes the form that actually does the work — for differentiable $f$:

$$f(y)\;\ge\;f(x)+\nabla f(x)^\top (y-x)\qquad\text{for all } x,y$$

::: reveal
**Read the right-hand side.** That is the first-order Taylor expansion of $f$ at $x$ — the tangent plane. For a general function it says something about a *neighbourhood* of $x$ and nothing beyond it. For a convex function the inequality holds ==everywhere==: the tangent never rises above the graph, so a linearisation built from purely local information is a ==global underestimator.==
:::

::: reveal
::: block Why a local minimum is a global minimum
This is the promise Act 2 opened with, and it is now one line. If $x^{*}$ is an unconstrained local minimum then $\nabla f(x^{*})=0$, so for **every** $y$:
$$f(y)\;\ge\;f(x^{*})+0\;=\;f(x^{*})$$
==Local information about a convex function is global information.== Nothing about $y$ was assumed — it may be arbitrarily far away.
:::
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

### Diet — where linear programming started
{sub: Example 1.2}

::: lede
Buy quantities $x_j$ of $n$ foods as cheaply as possible, while meeting every nutritional requirement.
:::

The data is a price list and a nutrition table: food $j$ costs $c_j$, and one unit of it carries $a_{ij}$ of nutrient $i$. The diet must supply at least $b_i$ of each nutrient, and no quantity may be negative.

$$\min_{x\in\R_+^{n}}\ c^\top x \qquad \text{s.t.}\quad \sum_j a_{ij}x_j \ \ge\ b_i \quad \forall i$$

::: reveal
Look at the shape rather than the story. The objective is a price vector dotted with a quantity vector; each constraint is one row of the nutrition table held against one requirement. In the standard form of Act 1, “at least $b_i$” becomes $b_i - a_i^\top x \le 0$ — the same content with one sign flipped.
:::

::: reveal
::: keypoint
The optimum sits at a ==vertex== of the polyhedron, so an optimal diet uses no more foods than there are binding nutrients.
:::
:::

::: note
Stigler posed this in 1945 and narrowed it by hand; Dantzig's simplex method settled it a few years later. The optimal diet was cheap, adequate, and close to inedible — a first lesson in what a model leaves out.
:::

### Piecewise-linear — the epigraph earns its keep
{sub: Example 1.3}

::: lede
A maximum of affine pieces is not linear. Its *epigraph* is, and that turns out to be enough.
:::

::: cols c2
::: col The problem
Minimise the largest of several affine pieces:

$$\min_x\ \max_i\ (a_i^\top x + b_i)$$

The objective is convex — a maximum of affine functions always is — but it is not linear, and no LP solver will accept it.
:::
::: col.accent The rewrite
Give the maximum a name, then push it down:

$$\min_{x,t}\ t \qquad \text{s.t.}\quad a_i^\top x + b_i \le t$$

One new variable, one constraint per piece, and it is an LP.
:::
:::

::: reveal
Why it is sound: nothing in the objective rewards a large $t$, so at the optimum $t$ is squeezed down until it meets the largest piece. Minimising over the epigraph $\{(x,t) : t \ge f(x)\}$ therefore returns exactly $\min_x f(x)$.
:::

::: reveal
::: keypoint
The move is general — ==any convex objective can be traded for a linear one== over its epigraph. It returns in Act 3, and again as the surrogate in Lecture 10.
:::
:::

### Chebyshev centre — an infinity of constraints, collapsed
{sub: Example 1.4}

::: lede
Where inside a polyhedron can you put the largest ball? The unknowns are its centre $x_c$ and its radius $r$.
:::

Let $\mathcal{P}=\{x: a_i^\top x\le b_i\}$. The ball of radius $r$ about $x_c$ lies inside $\mathcal{P}$ exactly when *every* point of it satisfies *every* face:

$$\sup_{\lVert u\rVert_2\le r}\ a_i^\top (x_c+u)\ \le\ b_i \qquad \forall i$$

::: reveal
As written that is one constraint for every $u$ in a ball — infinitely many. But the supremum is available in closed form: $a_i^\top u$ is largest when $u$ points along $a_i$, so it equals $r\lVert a_i\rVert_2$ by Cauchy–Schwarz. The infinity collapses to ==one linear constraint per face==:

$$\max_{x_c,\,r}\ r \qquad \text{s.t.}\quad a_i^\top x_c + r\lVert a_i\rVert_2 \le b_i$$
:::

::: reveal
::: keypoint
$\lVert a_i\rVert_2$ is ==data, not a variable== — so the constraint is linear in $(x_c, r)$, which is all an LP asks.
:::
:::

### None of the three looked linear when it was stated
{layout: standout}

Diet was already an LP and only had to be written down. The piecewise-linear objective needed a new variable. The Chebyshev centre needed an infinite family of constraints reduced by an inequality. ==Modelling is the act of finding the rewrite== — and it is where the expertise lives, because the solver is a commodity.

### A fourth, from this lab — an LP *inside* a policy
{sub: LPMARL — hierarchical multi-agent RL with a matching layer}

The three above rewrite a problem until an LP appears. This one puts an LP ==inside a neural network.== Before $N$ agents can act they must be matched to tasks — and a learned score is not yet a decision.

::: figure lpmarl-pipeline | 830
A network scores every agent–task pair from the global state; an LP turns that score matrix into an actual assignment; each agent then acts under a policy conditioned on the task it was handed.
:::

::: reveal
With $c_{ij}=f_\theta(h_i,h_j)$ scored from the two embeddings, the high-level policy *is* the allocation — each agent takes one task, each task has capacity $k_j$:

$$\max_{z}\ \sum_{i,j} z_{ij}\,c_{ij} \qquad \text{s.t.}\quad \sum_j z_{ij}=1\ \ \forall i, \qquad \sum_i c_{ij}\,z_{ij}\le k_j\ \ \forall j$$
:::

::: reveal
::: small
The assignment polytope has integral vertices, so the relaxation returns a real matching, not a fractional one — which is why an **LP** and not a softmax belongs here.
:::
:::

### Differentiating through the matching
{sub: the same move as the bilevel work — the Jacobian of a KKT system}

::: figure lpmarl-training | 1020
The state produces the LP's costs $c=g_\theta(s)$; the LP returns the assignment $z^{*}$; each agent acts on its own column of $z^{*}$; the critic scores the joint action.
:::

The score network sits *before* an $\argmax$, so training it at all demands a gradient that passes **through the solver**:

$$\nabla_\theta J \;=\; \E\Big[\nabla_{a_i}Q_\psi(s,a_i)\;\frac{\partial a}{\partial z^{*}}\;\hl{\frac{\partial z^{*}}{\partial c}}\;\frac{\partial c}{\partial\theta}\Big]$$

::: reveal
::: small
The highlighted factor is the whole difficulty: $z^{*}$ is defined by an optimisation, not by a formula. It is recovered ==by differentiating the KKT equalities of the LP== — the identical construction the bilevel design work uses later in this lecture, and the same system Act 3 is about to certify. ==A discrete decision that a gradient can still flow through== is what an optimisation layer buys.
:::
:::

### Least squares with bounds — nothing to check
{sub: a quadratic programme that is convex for every $\mathbf{A}$}

::: lede
Four problems follow, and each is put the same question: convex, and on what condition? This first one carries no condition at all.
:::

$$\min_x\ \lVert \mathbf{A}x-b\rVert_2^2 \quad \text{s.t.}\quad l \le x \le u$$

Expanded, the objective is $x^\top\mathbf{A}^\top\mathbf{A}x - 2b^\top\mathbf{A}x + b^\top b$ — a quadratic programme outright, with $P=2\mathbf{A}^\top\mathbf{A}$ and $q=-2\mathbf{A}^\top b$. Along any direction $v$, its Hessian $2\mathbf{A}^\top\mathbf{A}$ gives

$$v^\top \mathbf{A}^\top\mathbf{A}\,v \;=\; \lVert \mathbf{A}v\rVert_2^2 \;\ge\; 0 .$$

::: reveal
A squared length cannot be negative, so $\mathbf{A}^\top\mathbf{A}\succeq0$ for ==every== $\mathbf{A}$ — whatever its shape, its rank, or how badly conditioned it is. The bounds are an intersection of $2n$ half-spaces, so the feasible set is a box. Both halves of the problem are convex by construction.
:::

::: reveal
::: keypoint
Convexity here is ==structural, not conditional==. There is no assumption to verify and no data that could break it.
:::
:::

### A linear programme with random cost
{sub: convex exactly when $\gamma\ge0$ — when variance is charged as a cost}

The cost vector $c$ is not known, only its mean $\bar c$ and covariance $\Sigma$. The objective $c^\top x$ is then itself a random number:

$$\E[c^\top x] = \bar c^\top x, \qquad \operatorname{Var}(c^\top x) = x^\top\Sigma x .$$

Minimising a random number is not yet a decision, so you must say what its spread is worth. Charge for it linearly:

::: reveal
$$\min_x\ \bar c^\top x + \hl{\gamma\, x^\top \Sigma x}$$
:::

::: reveal
$\gamma$ is the first risk parameter of the course — the price, in units of expected cost, that you put on variance. A covariance matrix is positive semidefinite by construction, since $v^\top\Sigma v = \operatorname{Var}(c^\top v)\ge0$ for every $v$. Scaling a convex quadratic by a non-negative number keeps it convex and by a negative one flips it, so the problem is convex ==exactly when $\gamma\ge0$==.
:::

::: reveal
::: keypoint
$\gamma>0$ is risk-averse and $\gamma=0$ risk-neutral, returning the plain LP; risk-*seeking* $\gamma<0$ makes the objective concave and leaves the convex world at once. The condition is a modelling decision, not a technicality.
:::
:::

### Robust LP — the worst case is convex for free
{sub: deterministic — the constraint must hold for every $g_i$ in a set $\mathcal{E}_i$}

::: lede
Now the *constraint* is the uncertain thing rather than the objective. Lecture 0's split between deterministic and stochastic uncertainty gives two honest formulations of it, and the two do not fare alike.
:::

Demand that the constraint survive every outcome in an uncertainty set $\mathcal{E}_i$:

$$g_i^\top x \le h_i \qquad \forall\, g_i\in\mathcal{E}_i$$

::: reveal
This is not one constraint but one per element of $\mathcal{E}_i$ — infinitely many of them when $\mathcal{E}_i$ is a continuum. Every one is a half-space in $x$, and an intersection of half-spaces is convex however many there are. The feasible set is therefore convex for ==any $\mathcal{E}_i$ whatever==, a nonconvex or disconnected one included.
:::

::: reveal
What the shape of $\mathcal{E}_i$ decides is *tractability*, not convexity. An ellipsoidal $\mathcal{E}_i$ collapses that infinite family into a single second-order cone constraint, $\bar g_i^\top x + \lVert P_i^\top x\rVert_2 \le h_i$; a polyhedral one collapses by duality into finitely many linear constraints.
:::

### Robust LP — the chance constraint is not
{sub: stochastic — the constraint need hold only with probability $\eta$}

Ask instead that the constraint hold merely often enough:

$$\mathbf{P}\big(g_i^\top x \le h_i\big) \ge \eta$$

For a general distribution that set is ==not convex==. Take $g_i$ Gaussian, though, and it can be written out: $g_i^\top x$ is then a scalar Gaussian with mean $\bar g_i^\top x$ and standard deviation $\lVert\Sigma_i^{1/2}x\rVert_2$, so standardising the requirement gives

::: reveal
$$\bar g_i^\top x + \Phi^{-1}(\eta)\,\lVert\Sigma_i^{1/2}x\rVert_2 \le h_i .$$
:::

::: reveal
The norm is convex, so the whole is a second-order cone constraint — but only if the number multiplying it is non-negative, and $\Phi^{-1}(\eta)\ge0$ exactly when ==$\eta\ge\tfrac12$==. Below even odds the sign flips: the constraint starts rewarding spread instead of penalising it, and convexity is gone.
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
This is the seam between Lecture 1 and Part IV. ==Convexity is not only a property you find; it is one you can impose.== The next four slides do exactly that, in the professor's own ongoing work: a learned dynamics model made convex where a planner has to differentiate through it — which is where Lecture 11 will pick the thread up again.
:::
:::

### Bilevel design — the problem this makes tractable
{sub: the professor's own ongoing work, and where Lecture 1 reaches Lecture 11}

Much of engineering chooses a **design** once and then **operates** it for years: a wind farm's turbine layout, a robot's morphology, the placement of heaters in a furnace. The design $p$ is fixed up front; the operation $u_t$ is chosen afresh at every step. So judging a design means solving a whole control problem *inside* it.

$$\begin{aligned}
\min_{p\in\mathcal{P}}\ &\textstyle\sum_{t=0}^{T-1}\mathcal{L}(x_{t+1},u_t^{*};p) &&\dm{\text{upper level — the design}}\\[2pt]
\text{s.t.}\ \ u_{0:T-1}^{*} = \argmin_{u_{0:T-1}}\ &\textstyle\sum_{t=0}^{T-1}\mathcal{L}(x_{t+1},u_t;p) &&\dm{\text{lower level — the operation}}\\[2pt]
\text{s.t.}\ \ &x_{t+1}=f(x_t,u_t;p),\quad u_t\in\mathcal{U}_p
\end{aligned}$$

::: reveal
::: small
**Two difficulties, stacked.** Every single evaluation of the outer objective requires solving the inner problem to optimality. And in practice $f$ is not handed to you — the plant's dynamics must be learned. Learn them with an ordinary network and ==the inner problem is non-convex==: $u^{*}$ is then some local minimum, and the sensitivity $\mathrm{d}u^{*}/\mathrm{d}p$ that the outer level depends on is simply wrong.
:::
:::

### Input-convex where it must be, free where it may be
{sub: ICGNN — a graph network made convex in the operation variables only}

::: figure icgnn-procedure | 740
Heater placement in a heat-diffusion plant. The design $p$ builds a graph; each of $K$ lower-level problems is solved for $u^{*}$ — ==now a convex programme==; the loss is aggregated; implicit differentiation returns $\mathrm{d}u^{*}/\mathrm{d}p$; the chain rule turns it into a gradient step on the heater positions.
:::

::: reveal
::: small
The trick is that convexity is imposed **only where it is needed.** The ==convex path== carries the operation variables — the heat each heater emits, the temperatures the sensors read. The ==non-convex path== carries the geometry: where heaters and sensors physically sit. The surrogate stays a free, expressive function of the design while being a convex function of the control, which is exactly the split the bilevel structure asks for.
:::
:::

### Why the convexity is load-bearing
{sub: and why the bottom row of this table is Act 3}

::: figure icgnn-compare | 980
Three ways to attack the same bilevel problem. Only the third solves a convex lower level — and only the third can therefore ==satisfy the sufficiency of KKT.==
:::

::: reveal
::: small
Read the last row against Act 3. A non-convex lower level makes KKT *necessary but not sufficient*, so the $u^{*}$ handed upward may be a saddle or a local maximum, and the implicit gradient built from that KKT system inherits the error. Convexity is not decoration here: ==it is what makes the gradient the outer problem receives a true one.== Searching $\mathcal{P}$ alone rather than $\mathcal{U}\times\mathcal{P}$ is the second prize.
:::
:::

### What it buys — and a warning that returns in Lecture 5

::: figure icgnn-results | 715
Predicted design cost (top left) against *true* design cost (bottom left), over 100 optimisation steps, with the heater layouts each method reaches.
:::

::: reveal
::: small
Watch the blue curve. The linear surrogate's **predicted** cost falls beautifully while its **true** cost climbs — $0.0706 \to 0.1305$, worse than where it started. ==The optimiser exploited the surrogate exactly where the surrogate was wrong==, and that failure is the whole subject of Lecture 5. The convex graph surrogate reaches $0.0319$ against the plain GNN's $0.0391$: convexity costs a little expressiveness and returns a gradient you can trust.
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
Both directions of the *if and only if*, and the collapse to the familiar $\nabla f(x^{*})=0$, are on the next slide.
:::
:::

### Why that condition is exact — and what it becomes with no constraints
{sub: both directions, and the collapse to $\nabla f = 0$}

::: cols c2
::: col Sufficient
Suppose $\nabla f(x^{*})^\top(y-x^{*})\ge 0$ for every feasible $y$. The global underestimator finishes it:

$$f(y)\;\ge\;f(x^{*})+\underbrace{\nabla f(x^{*})^\top(y-x^{*})}_{\ge\,0}\;\ge\;f(x^{*})$$

True for *every* feasible $y$, so $x^{*}$ is a ==global== minimum — not merely a local one.
:::
::: col Necessary
Suppose instead some feasible $y$ has $\nabla f(x^{*})^\top(y-x^{*})<0$. The feasible set is convex, so $x_t=x^{*}+t(y-x^{*})$ stays in it, and

$$\tfrac{\mathrm d}{\mathrm dt}f(x_t)\big|_{t=0}=\nabla f(x^{*})^\top(y-x^{*})<0$$

Then $f(x_t)<f(x^{*})$ for small $t>0$: $x^{*}$ was not optimal after all.
:::
:::

::: reveal
**With no constraints the condition *is* $\nabla f(x^{*})=0$.** If the gradient vanishes the inequality is trivial. For the converse, every $y$ is now feasible — so try the steepest-descent direction itself, $y=x^{*}-t\,\nabla f(x^{*})$ with $t>0$:

$$0\;\le\;\nabla f(x^{*})^\top(y-x^{*})\;=\;-t\,\lVert\nabla f(x^{*})\rVert_2^2 \qquad\Longrightarrow\qquad \nabla f(x^{*})=0$$
:::

::: reveal
::: small
So the constrained condition is not a different rule; it is ==the same rule with fewer directions available.== On a boundary, $-\nabla f(x^{*})$ may simply not be a feasible direction, and the gradient is then free to stay non-zero — which is exactly the slack the multipliers of Act 3 will put a price on.
:::
:::

### The condition, made draggable

::: widget kkt-point
Minimise $\lVert x - c\rVert^2$ over a polygon, with $c$ outside it. Drag the point and read the test literally: the red arrow is a feasible direction that decreases $f$. It disappears exactly at the optimum, where the gradient supports the set — and that supporting normal, scaled, ==is the KKT multiplier==.
:::

### The problem, restated — and the price of a constraint

Act 1 put every problem into one shape. Act 3 asks how you would *know* you had solved it:

$$\min_{x}\ f(x) \qquad \text{subject to}\qquad g_i(x)\le 0\ \ (i=1,\dots,m), \qquad h_j(x)=0\ \ (j=1,\dots,p)$$

::: reveal
The constraints are the whole difficulty: strip them away and $\nabla f(x^{*})=0$ settles it. So ==buy your way out of them.== Put a price $\lambda_i$ on each inequality and $\nu_j$ on each equality, and charge violations to the objective itself:

$$L(x,\lambda,\nu)\;=\;f(x)\;+\;\sum_{i}\lambda_i\,g_i(x)\;+\;\sum_{j}\nu_j\,h_j(x)$$
:::

::: reveal
::: small
Why $\lambda_i\ge0$ but $\nu_j$ free: breaking $g_i\le0$ is a one-sided fault, so it must always *cost*. An equality can be missed from either side, and its price carries the sign of the miss.
:::
:::

### The four KKT conditions
{sub: what holds at a solution $x^{*}$, with multipliers $\lambda^{*}\ge0$ and $\nu^{*}$}

::: cols c2
::: col 1 · Stationarity
$$\nabla f(x^{*}) + \sum_i \lambda_i^{*}\nabla g_i(x^{*}) + \sum_j \nu_j^{*}\nabla h_j(x^{*}) = 0$$

The Lagrangian is flat in $x$ — with the prices paid, no direction improves it.
:::
::: col 2 · Primal feasibility
$$g_i(x^{*})\le 0,\qquad h_j(x^{*})=0$$

$x^{*}$ is a legal point of the problem we actually asked about.
:::
:::

::: cols c2
::: col 3 · Dual feasibility
$$\lambda_i^{*}\ \ge\ 0$$

No inequality is ever priced negatively — you are not paid to break one.
:::
::: col.accent 4 · Complementary slackness
$$\lambda_i^{*}\,g_i(x^{*}) = 0$$

Each constraint is ==either active or free==: $g_i=0$, or $\lambda_i=0$. Never priced and slack at once.
:::
:::

### The intuition — a balance of forces

Move the gradients to one side and stationarity stops being algebra:

$$\underbrace{-\nabla f(x^{*})}_{\text{the pull downhill}}\;=\;\sum_{i}\lambda_i^{*}\underbrace{\nabla g_i(x^{*})}_{\text{wall }i\text{ pushes back}}\;+\;\sum_j \nu_j^{*}\nabla h_j(x^{*})$$

::: reveal
::: cols c3
::: col A wall you do not touch
If $g_i(x^{*})<0$ you are nowhere near wall $i$, so it exerts nothing: $\lambda_i=0$. That *is* complementary slackness.
:::
::: col Why prices are non-negative
A wall can only push you back **into** the feasible set, never pull you out — so $\lambda_i\ge0$. An equality constrains from both sides, so $\nu_j$ may take either sign.
:::
::: col.accent What the price is worth
Relax $g_i\le0$ to $g_i\le\epsilon$ and the optimum improves by about $\lambda_i\epsilon$. ==The multiplier is a shadow price== — what one unit of that constraint costs you.
:::
:::
:::

::: reveal
::: keypoint
The optimum is where ==the walls push back exactly as hard as the objective pulls.==
:::
:::

### Why KKT certifies a *global* optimum
{sub: the convex case, proved — five lines and no appendix}

Let $f$ and every $g_i$ be convex, every $h_j$ affine, and let $x^{*}$ satisfy all four conditions. Take **any** feasible $y$:

$$\begin{aligned}
f(y) &\;\ge\; f(x^{*}) + \nabla f(x^{*})^\top(y-x^{*}) && \dm{\text{convexity of } f}\\[2pt]
&\;=\; f(x^{*}) - \sum_i \lambda_i^{*}\,\nabla g_i(x^{*})^\top(y-x^{*}) && \dm{\text{stationarity; the } h_j \text{ terms vanish}}\\[2pt]
&\;\ge\; f(x^{*}) - \sum_i \lambda_i^{*}\big(g_i(y)-g_i(x^{*})\big) && \dm{\text{convexity of } g_i,\ \lambda_i^{*}\ge0}\\[2pt]
&\;=\; f(x^{*}) - \sum_i \lambda_i^{*}\,g_i(y) && \dm{\text{complementary slackness}}\\[2pt]
&\;\ge\; f(x^{*}) && \dm{\lambda_i^{*}\ge0,\ g_i(y)\le0}
\end{aligned}$$

::: reveal
::: small
The $h_j$ terms vanish because an affine $h_j$ has $\nabla h_j^\top(y-x^{*}) = h_j(y)-h_j(x^{*}) = 0$ for feasible $y$. So $f(y)\ge f(x^{*})$ for *every* feasible $y$: ==not a local claim but a global one.== Conversely KKT is *necessary* when a constraint qualification such as Slater's holds — some strictly feasible point exists. Without convexity KKT stays necessary but stops being sufficient: a KKT point may be a minimum, a maximum, or a saddle.
:::
:::

### Duality — a lower bound you get for free

Minimise the Lagrangian over $x$ and the result depends on the prices alone:

$$d(\lambda,\nu)\;=\;\inf_x\,L(x,\lambda,\nu)$$

::: reveal
For **any** $\lambda\ge0$ and any $\nu$, and any feasible $\tilde x$:

$$d(\lambda,\nu)\;\le\;L(\tilde x,\lambda,\nu)\;=\;f(\tilde x)+\underbrace{\sum_i\lambda_i g_i(\tilde x)}_{\le\,0}+\underbrace{\sum_j\nu_j h_j(\tilde x)}_{=\,0}\;\le\;f(\tilde x)$$

so $d(\lambda,\nu)\le p^{*}$ — ==weak duality, and it costs two lines.== The best such bound is $d^{*}=\max_{\lambda\ge0,\nu} d(\lambda,\nu)$, and $p^{*}-d^{*}\ge0$ is the ==duality gap==.
:::

::: reveal
::: small
For a convex problem with a constraint qualification the gap is zero, so the dual optimum *proves* the primal one. Even when you cannot solve the primal, any dual point brackets how far you might still be from optimal — which is the practical value of duality. Differentiating this same KKT system is how one back-propagates through an optimisation layer, the trick behind differentiable LQR and MPC in Lecture 11.
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

### Backup — the successive convex programming loop

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
