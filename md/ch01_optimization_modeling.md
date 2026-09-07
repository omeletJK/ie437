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
handoff: the template `min f s.t. g ≤ 0`
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
- **Q2 — When does a local solution settle the global question?** ==Convexity==.
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

### A production decision, written all the way down
{sub: an illustrative two-product model}

A workshop makes $x_1$ units of product A and $x_2$ of product B. Each unit earns 3 or 2, respectively. Machine time is limited to 4 units; product A uses two units of time and B uses one. Demand for A is at most one unit. Quantities are divisible.

$$\max_{x\ge0}\ 3x_1+2x_2 \qquad \text{s.t.}\quad 2x_1+x_2\le4,\quad x_1\le1$$

::: reveal
In minimisation standard form, $f(x)=-3x_1-2x_2$, $g_1(x)=2x_1+x_2-4$ and $g_2(x)=x_1-1$. Non-negativity can be included in the domain $D=\R_+^2$ or written as $-x_i\le0$.
:::

::: reveal
::: keypoint
B earns 2 per unit of machine time; A earns only 1.5. Thus $x^{*}=(0,4)$ earns 8. Indeed $3x_1+2x_2=2(2x_1+x_2)-x_1\le8$: ==a feasible answer and a bound that proves it optimal.==
:::
:::

### Equivalent problems — four rewrites worth knowing

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

**Q2.** When does a local solution settle the global question?

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
That fact gives local search a global meaning, **provided a solution exists and the algorithm reaches it**:

- converged local minima cannot be worse than a hidden global minimum;
- many standard convex classes admit reliable, efficient solvers;
- KKT conditions can certify a global optimum; their necessity needs regularity;
- duality supplies lower bounds and, under suitable conditions, exact certificates.
:::

::: reveal
::: small
Convexity alone does not guarantee existence or convergence. The convex function $e^x$ has infimum zero but no minimiser on $\R$. For $f(x)=x^2$, gradient descent gives $x_{k+1}=(1-2\alpha)x_k$ and diverges from nonzero starts when $\alpha>1$. Step sizes, conditioning and stopping tolerances still matter.
:::
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
The same descent rule, the same twelve starting points, two objectives. For this strictly convex quadratic and this stable step size, the walkers approach the same minimiser. On the non-convex objective they can settle in different basins. The example isolates the effect of geometry; it does not make algorithm settings irrelevant.
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
The progression matters because modelling is often a matter of *recognising* which named class your problem — or its convexified version — falls into; each has mature, reliable solvers. When a finite LP optimum exists and the feasible polyhedron has vertices, an optimal vertex exists; a whole face may also be optimal. The QP's optimum occurs where the lowest attainable objective level set meets the feasible region.
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
If a finite optimum exists, an optimal basic feasible diet can be chosen: it uses no more positive food quantities than there are linearly independent binding nutrient constraints. This is a property of ==one sparse optimal solution==, not of every optimal mixture.
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

The objective is convex — a maximum of affine functions always is — but it is not itself a linear objective. Rewrite it before passing it to an LP solver.
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

$$\max_{x_c,\,r\ge0}\ r \qquad \text{s.t.}\quad a_i^\top x_c + r\lVert a_i\rVert_2 \le b_i\quad\forall i$$
:::

::: reveal
::: keypoint
$\lVert a_i\rVert_2$ is ==data, not a variable== — so the constraint is linear in $(x_c, r)$, which is all an LP asks.
:::
:::

### None of the three looked linear when it was stated
{layout: standout}

Diet was already an LP and only had to be written down. The piecewise-linear objective needed a new variable. The Chebyshev centre needed an infinite family of constraints reduced by an inequality. ==Modelling is the act of finding the rewrite== — and it is where the expertise lives, because the solver is a commodity.

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
{sub: a non-negative variance penalty preserves convexity}

The cost vector $c$ is not known, only its mean $\bar c$ and covariance $\Sigma$. The objective $c^\top x$ is then itself a random number:

$$\E[c^\top x] = \bar c^\top x, \qquad \operatorname{Var}(c^\top x) = x^\top\Sigma x .$$

Minimising a random number is not yet a decision, so you must say what its spread is worth. Charge for it linearly:

::: reveal
$$\min_x\ \bar c^\top x + \hl{\gamma\, x^\top \Sigma x}$$
:::

::: reveal
$\gamma$ is the first risk parameter of the course — the price, in units of expected cost, that you put on variance. A covariance matrix is positive semidefinite by construction, since $v^\top\Sigma v = \operatorname{Var}(c^\top v)\ge0$ for every $v$. Scaling a convex quadratic by a non-negative number keeps it convex and by a negative one flips it, so $\gamma\ge0$ ==guarantees convexity==. If $\gamma<0$ and $\Sigma\ne0$, the objective is not convex on the full space; a zero covariance or a restricted feasible subspace can be a degenerate exception.
:::

::: reveal
::: keypoint
$\gamma>0$ is risk-averse and $\gamma=0$ risk-neutral, returning the plain LP; risk-*seeking* $\gamma<0$ produces a concave quadratic objective, generally making its minimisation non-convex. The condition is a modelling decision, not a technicality.
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

For a general distribution that set is ==not necessarily convex==. Take $g_i$ Gaussian, though, and it can be written out: $g_i^\top x$ is then a scalar Gaussian with mean $\bar g_i^\top x$ and standard deviation $\lVert\Sigma_i^{1/2}x\rVert_2$, so standardising the requirement gives

::: reveal
$$\bar g_i^\top x + \Phi^{-1}(\eta)\,\lVert\Sigma_i^{1/2}x\rVert_2 \le h_i .$$
:::

::: reveal
The norm is convex, so the whole is a second-order cone constraint — but only if the number multiplying it is non-negative, and $\Phi^{-1}(\eta)\ge0$ exactly when ==$\eta\ge\tfrac12$==. Below even odds the sign flips, so this convexity guarantee is lost; special or degenerate instances can still have a convex feasible set.
:::

::: reveal
::: small
Not "the usual choices", then, but three conditions: $\gamma\ge0$, any $\mathcal{E}_i$ at all, and $\eta\ge\tfrac12$. ==These are structural convexity guarantees; particular instances may have additional structure.== Lecture 2 takes the stochastic reading much further; Lecture 5 meets the worst-case one again when a surrogate must be trusted only where the data supports it.
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

Let $X$ be the **full feasible set**. Assume $X$ is convex, $f$ is convex and differentiable on an open set containing $X$, and $x^{*}\in X$.

$$x^{*}\text{ is globally optimal}\quad\hl{\Longleftrightarrow}\quad\nabla f(x^{*})^\top(y-x^{*})\ge0,\quad\forall y\in X$$

::: reveal
Call the right-hand statement $C(x^{*})$, the **first-order condition**. The dot product measures the initial rate of change toward $y$: a negative value would give a feasible downhill direction.
:::

::: reveal
::: cols c2
::: col Necessary · optimal ⇒ condition
**Must every optimum pass this test?** If a point fails, it cannot be optimal.
:::
::: col Sufficient · condition ⇒ optimal
**Does passing certify an optimum?** If it passes, no feasible point can have lower cost.
:::
:::
:::

::: reveal
::: keypoint
==Exact means both necessary and sufficient.== We prove each arrow separately to show that the condition completely characterises optimality.
:::
:::

### Necessary — an optimum cannot have a feasible downhill direction
{math: compact}

**Question:** if $x^{*}$ really is optimal, must it satisfy $C(x^{*})$? We prove **optimal $\Rightarrow$ condition** by ruling out a violation.

::: cols c2
::: col See why a candidate fails
::: widget first-order-proof {"mode":"necessary"}
Here $f'(0.5)(2.5-0.5)=-6<0$. Move $t$ to take a small feasible step and watch the cost fall.
:::
:::
::: col The general argument
Suppose some $y\in X$ violates the condition. Set $d=y-x^{*}$, so $\nabla f(x^{*})^\top d<0$.

::: reveal
**The segment stays feasible** because $X$ is convex:

$$x_t=(1-t)x^{*}+ty\in X,\qquad 0\le t\le1.$$
:::

::: reveal
**The cost initially falls** because $f$ is differentiable:

$$\left.\frac{\mathrm d}{\mathrm dt}f(x_t)\right|_{t=0}=\nabla f(x^{*})^\top d<0.$$

Thus $f(x_t)<f(x^{*})$ for all sufficiently small $t>0$, contradicting optimality.
:::
:::
:::

::: reveal
::: keypoint
An optimum must pass. ==Necessity uses the convexity of $X$; it does not require convexity of $f$.== The same argument applies to a local minimum.
:::
:::

### Sufficient — a convex tangent bound certifies every feasible point
{math: compact}

**Question:** if $x^{*}$ satisfies $C(x^{*})$, can we certify a global optimum? Now prove **condition $\Rightarrow$ optimal**.

::: cols c2
::: col Watch the two inequalities
::: widget first-order-proof {"mode":"sufficient"}
Illustration: minimise $x^2$ over $X=[1,3]$. At $x^{*}=1$, the orange tangent is $T(y)=1+2(y-1)$. Move the feasible comparison point $y$.
:::
:::
::: col The general argument
**Convexity of $f$ gives a global lower bound:**

$$f(y)\ge\underbrace{f(x^{*})+\nabla f(x^{*})^\top(y-x^{*})}_{T(y)}.$$

::: reveal
**The assumed condition lifts that bound above the candidate cost:** for every $y\in X$,

$$T(y)\ge f(x^{*}).$$
:::

::: reveal
Combine them:

$$f(y)\ge T(y)\ge f(x^{*}),\qquad\forall y\in X.$$

Every feasible comparison point has at least the candidate's cost. This certifies a **global** minimum.
:::
:::
:::

::: reveal
::: keypoint
==Convexity of $f$ turns first-order information into a global certificate.== A tangent to a general non-convex function need not be a lower bound.
:::
:::

### Necessary alone does not certify a minimum
{math: compact}

Remove convexity of the **objective**. Keep the convex feasible set $X=\R$ and take $f(x)=x^3$.

::: cols c2
::: col Zero slope, but lower points arbitrarily close
::: widget first-order-proof {"mode":"counterexample"}
The orange horizontal tangent passes through the candidate $x^{*}=0$. Move $y$ to the left: the curve falls below the tangent.
:::
:::
::: col The condition passes — optimality fails
At zero, $f'(0)=0$. Therefore the full first-order condition holds:

$$f'(0)(y-0)=0\ge0,\qquad\forall y\in\R.$$

::: reveal
Yet for every $\epsilon>0$,

$$f(-\epsilon)=-\epsilon^3<0=f(0).$$

There are better points arbitrarily close to zero. It is **not even a local minimum**.
:::

::: reveal
The necessary implication still holds. The sufficient implication fails because this tangent is **not a global lower bound**.
:::
:::
:::

::: reveal
::: keypoint
==Passing a necessary test only keeps a candidate in consideration.== It does not, by itself, prove optimality.
:::
:::

### Why the condition is exact — the two arrows do different work
{math: compact}

For a differentiable $f$ and feasible $x^{*}$, the two proofs use different geometric facts:

| Direction | Convexity used in the proof | What it gives |
|---|---|---|
| **Necessary:** optimal $\Rightarrow C(x^{*})$ | **Convex set $X$** | The segment toward any feasible $y$ stays feasible; a negative initial slope would disprove optimality. |
| **Sufficient:** $C(x^{*})\Rightarrow$ global optimal | **Convex function $f$** | The tangent is a global lower bound; the condition puts that bound above $f(x^{*})$ on $X$. |

::: reveal
::: cols c2
::: col If only necessity has been proved
Failing the condition rules out optimality. **Passing alone is inconclusive** — as $x^3$ demonstrates.
:::
::: col If only sufficiency has been proved
Passing the condition certifies optimality. **Failing alone is inconclusive**: this arrow does not say that every optimum must pass.
:::
:::
:::

::: reveal
With both assumptions in place, combine the arrows:

$$x^{*}\text{ globally optimal}\quad\hl{\Longleftrightarrow}\quad\nabla f(x^{*})^\top(y-x^{*})\ge0,\quad\forall y\in X$$
:::

::: note
Opening line: We prove both directions because this condition does more than describe something an optimum must satisfy: it completely characterises optimality. The previous two columns describe what one implication alone permits; after both proofs, passing and failing are decisive for this convex problem.
:::

### Unconstrained optimality — combine two equivalences
{math: compact}

Keep $f$ **convex and differentiable**. The conclusion follows in two steps; the second step simplifies the condition from the first.

**Step 1 — the general convex problem, already proved.** For a convex feasible set $X$ and $x^{*}\in X$,

$$x^{*}\text{ globally optimal}\quad\hl{\Longleftrightarrow}\quad\nabla f(x^{*})^\top(y-x^{*})\ge0,\quad\forall y\in X.$$

::: reveal
**Step 2 — no constraints means $X=\R^n$.** Every direction is available, so the first-order inequality simplifies to

$$\nabla f(x^{*})^\top(y-x^{*})\ge0,\quad\forall y\in\R^n\quad\hl{\Longleftrightarrow}\quad\nabla f(x^{*})=0.$$

We prove this second equivalence on the next slide. It is a statement about which directions are feasible.
:::

::: reveal
**Combine the two — convex + differentiable + unconstrained:**

$$x^{*}\text{ globally optimal}\quad\hl{\Longleftrightarrow}\quad\nabla f(x^{*})=0.$$

::: keypoint
Under these three assumptions, ==zero gradient is both necessary and sufficient for global optimality.==
:::
:::

### Why the first-order inequality becomes a zero gradient
{math: compact}

**Proving Step 2.** Set $X=\R^n$ and write $C(x^{*})$ for $\nabla f(x^{*})^\top(y-x^{*})\ge0$ for every $y\in\R^n$.

::: cols c2
::: col Zero gradient ⇒ first-order inequality
If $\nabla f(x^{*})=0$, then for every $y$,

$$\nabla f(x^{*})^\top(y-x^{*})=0\ge0.$$

So $C(x^{*})$ holds immediately.
:::
::: col First-order inequality ⇒ zero gradient
Assume $C(x^{*})$. Because every point is feasible, choose $y=x^{*}-t\nabla f(x^{*})$ with any $t>0$:

$$0\le\nabla f(x^{*})^\top(y-x^{*})=-t\lVert\nabla f(x^{*})\rVert_2^2.$$

Because $t>0$ and a squared norm is non-negative, the gradient must be zero.
:::
:::

::: reveal
::: cols c2
::: col Necessary for an unconstrained optimum
A nonzero gradient gives a feasible descent direction $-\nabla f(x^{*})$, so a small step would lower the cost and contradict optimality.
:::
::: col Sufficient when f is also convex
The global tangent bound becomes

$$f(y)\ge f(x^{*})+0=f(x^{*}),\qquad\forall y.$$

Thus a zero gradient certifies a global minimum.
:::
:::
:::

::: reveal
::: keypoint
Step 2 needs no convexity of $f$; ==optimality $\Longleftrightarrow\nabla f=0$ also needs Step 1.== Without convexity, $f(x)=x^3$ still has $f'(0)=0$ but no minimum at zero.
:::
:::

### The condition, made draggable

::: widget kkt-point
Minimise $\lVert x-c\rVert^2$ over a polygon, with $c$ outside it. Drag the point: the red arrow shows a feasible decrease. At the optimum, $-\nabla f$ points outside the set, so the zero-gradient rule does not apply. Likewise, $\min_{x\in[1,3]}x^2$ has $x^{*}=1$ and $f'(1)=2$, yet $2(y-1)\ge0$ for every feasible $y$. KKT expresses how active constraints balance that nonzero gradient.
:::

### Why can the optimum stop at a wall?
{sub: one variable, one constraint — the idea behind KKT}

Choose a setting $x$ with cost $x^2$. The setting must be at least 1:

$$\min_x\ x^2 \qquad \text{subject to } x\ge1 \qquad \dm{\big(g(x)=1-x\le0\big)}$$

::: cols c2
::: col
::: widget kkt-wall
:::
:::
::: col Three small steps
**Without the wall:** choose $x=0$, where the cost is smallest.

::: reveal
**With the wall:** stop at $x^{*}=1$. The cost still pulls left: $-f'(1)=-2$.
:::

::: reveal
**Balance the pull:** the wall pushes right with strength $\lambda=2$. The two effects cancel: $-2+2=0$.
:::
:::
:::

::: reveal
::: keypoint
With a constraint, ==the gradient can be nonzero at the optimum.== KKT checks how the constraint balances it.
:::
:::

### KKT asks four simple questions
{sub: check the same example at $x^{*}=1$ and $\lambda^{*}=2$}

Combine the cost and the constraint in one expression — the **Lagrangian**:

$$L(x,\lambda)=x^2+\lambda(1-x) \qquad \frac{\partial L}{\partial x}=2x-\lambda$$

::: table
| Question | KKT condition | Check at $(x,\lambda)=(1,2)$ |
|---|---|---|
| **Is the setting allowed?** | Primal feasibility: $1-x\le0$ | $1-1=0\le0$ ✓ |
| **Does the wall push inward?** | Dual feasibility: $\lambda\ge0$ | $2\ge0$ ✓ |
| **Is any unused wall powerless?** | Complementary slackness: $\lambda(1-x)=0$ | $2(1-1)=0$ ✓ |
| **Do the two pushes balance?** | Stationarity: $2x-\lambda=0$ | $2(1)-2=0$ ✓ |
:::

::: reveal
::: keypoint
All four checks pass. ==For this convex problem, that certifies the global optimum.==
:::
:::

::: small
A slack constraint has zero multiplier; a tight constraint *may* also have zero multiplier. The general form for multiple constraints is in the appendix.
:::

### What is a little more freedom worth?
{sub: the same multiplier also measures the value of relaxing the wall}

Now let the minimum allowed setting be $a$: minimise $x^2$ subject to $x\ge a$.

::: cols c2
::: col
::: widget kkt-wall {"mode":"price"}
Move $a$ left to relax the bound. Once $a<0$, the preferred point $x=0$ is inside the allowed region: the bound is slack and its price is zero.
:::
:::
::: col Relax the bound from 1 to 0.9
**Before:** best $x=1$, cost $1$, multiplier $\lambda=2$.

::: reveal
**After:** best $x=0.9$, cost $0.81$. The actual saving is **0.19**.
:::

::: reveal
**Predict the saving using the original price:**

$$\lambda\times\text{relaxation}=2\times0.1=0.20.$$

Close to $0.19$: the price gives a ==local approximation== for a small change.
:::
:::
:::

::: reveal
::: keypoint
$\lambda$ is the **shadow price**: how much the best cost improves per small unit of extra freedom. At $a=0$, the bound is tight but its price is already zero.
:::
:::

### Certifying the production decision with actual multipliers
{math: compact}

Return to the workshop model: minimise $-3x_1-2x_2$ subject to $2x_1+x_2\le4$, $x_1\le1$ and $x\ge0$. We proposed $x^{*}=(0,4)$.

::: reveal
Choose machine-time multiplier $\lambda=2$, demand multiplier $\mu=0$ and non-negativity multipliers $\nu=(1,0)$. All are non-negative, and stationarity is

$$\binom{-3}{-2}+2\binom{2}{1}+0\binom{1}{0}-\binom{1}{0}=\binom{0}{0}.$$
:::

::: reveal
Machine time binds; the demand constraint is slack and has zero price. Product A's non-negativity constraint binds, while product B's is slack. Every multiplier times its constraint value is zero. ==All four KKT conditions hold.==
:::

::: reveal
::: keypoint
The LP is convex, so the certificate proves profit 8 is globally optimal. The machine-time price is 2: an extra unit of capacity is worth 2 in this model.
:::
:::

### Why KKT certifies a *global* optimum
{sub: the convex case, proved — five lines and no appendix}

Let $f$ and every $g_i$ be differentiable and convex, every $h_j$ affine, and let $x^{*}$ satisfy all four conditions. Take **any** feasible $y$:

$$\begin{aligned}
f(y) &\;\ge\; f(x^{*}) + \nabla f(x^{*})^\top(y-x^{*}) && \dm{\text{convexity of } f}\\[2pt]
&\;=\; f(x^{*}) - \sum_i \lambda_i^{*}\,\nabla g_i(x^{*})^\top(y-x^{*}) && \dm{\text{stationarity; the } h_j \text{ terms vanish}}\\[2pt]
&\;\ge\; f(x^{*}) - \sum_i \lambda_i^{*}\big(g_i(y)-g_i(x^{*})\big) && \dm{\text{convexity of } g_i,\ \lambda_i^{*}\ge0}\\[2pt]
&\;=\; f(x^{*}) - \sum_i \lambda_i^{*}\,g_i(y) && \dm{\text{complementary slackness}}\\[2pt]
&\;\ge\; f(x^{*}) && \dm{\lambda_i^{*}\ge0,\ g_i(y)\le0}
\end{aligned}$$

::: reveal
::: small
The $h_j$ terms vanish because an affine $h_j$ has $\nabla h_j^\top(y-x^{*}) = h_j(y)-h_j(x^{*}) = 0$ for feasible $y$. So $f(y)\ge f(x^{*})$ for *every* feasible $y$: ==not a local claim but a global one.== Conversely KKT is *necessary* when a constraint qualification such as Slater's holds — some strictly feasible point exists. Without convexity, KKT remains necessary at a local optimum under an appropriate constraint qualification, but is generally not sufficient: a KKT point may be a minimum, a maximum, or a saddle.
:::
:::

### Duality — a lower bound you get for free

Minimise the Lagrangian over $x$ and the result depends on the prices alone:

$$d(\lambda,\nu)\;=\;\inf_x\,L(x,\lambda,\nu)$$

::: reveal
For **any** $\lambda\ge0$ and any $\nu$, and any feasible $\tilde x$:

$$d(\lambda,\nu)\;\le\;L(\tilde x,\lambda,\nu)\;=\;f(\tilde x)+\underbrace{\sum_i\lambda_i g_i(\tilde x)}_{\le\,0}+\underbrace{\sum_j\nu_j h_j(\tilde x)}_{=\,0}\;\le\;f(\tilde x)$$

so $d(\lambda,\nu)\le p^{*}$ — ==weak duality, and it costs two lines.== The best such bound is $d^{*}=\sup_{\lambda\ge0,\nu} d(\lambda,\nu)$, and $p^{*}-d^{*}\ge0$ is the ==duality gap==.
:::

::: reveal
::: small
For a convex problem with a constraint qualification the gap is zero, so the dual optimum *proves* the primal one. Even when you cannot solve the primal, any dual point brackets how far you might still be from optimal — which is the practical value of duality. With additional differentiability and regularity conditions, the KKT system also provides sensitivities for optimisation layers. The following examples separate that question from optimality.
:::
:::

### An LP inside a policy — LPMARL
{sub: learned scores become feasible allocation weights}

::: figure lpmarl-pipeline | 830
A score network feeds an allocation LP; each agent's policy is conditioned on the resulting task weights. Source: original PowerPoint, slide 36.
:::

The source uses learned coefficients $c_{ij}$ in both the objective and the capacity constraints. With non-negative allocation weights, the model is

$$\begin{aligned}
\max_{z\ge0}\quad &\sum_{i,j}c_{ij}z_{ij}\\
\text{s.t.}\quad &\sum_j z_{ij}=1\quad\forall i,\qquad \sum_i c_{ij}z_{ij}\le k_j\quad\forall j.
\end{aligned}$$

::: reveal
::: small
Each row of $z$ sums to one, but it can split across tasks. Here $k_j$ bounds a ==weighted total==, not the number of assigned agents. A hard assignment requires an additional discrete decision or a feasibility-preserving decoding rule.
:::
:::

### An allocation LP need not return a matching

One agent, two tasks: let $c=(2,1)$ and $k=(1,1)$. The weighted-capacity model becomes

$$\max\ 2z_1+z_2\qquad\text{s.t.}\quad z_1+z_2=1,\quad 2z_1\le1,\quad z_2\le1,\quad z\ge0.$$

::: reveal
The optimum is $z=(\tfrac12,\tfrac12)$, with value $1.5$. The only feasible hard assignment is $(0,1)$, with value $1$. ==The relaxation is fractional even at its best vertex.==
:::

::: reveal
::: block When the familiar integrality theorem does apply
For a standard bipartite assignment model, use **count capacities** $\sum_i z_{ij}\le k_j$, integer $k_j$, row sums of one and $z\ge0$. If feasible, an integral optimal vertex exists. Ties can still admit fractional optimal mixtures; arbitrary weighted capacities lose this structural guarantee.
:::
:::

### Training through an optimisation layer
{sub: optimality and differentiability are separate questions}

::: figure lpmarl-training | 1020
The learned coefficients change the optimisation problem; its solution changes the actions seen by the critic. Source: original PowerPoint, slide 37. Each agent reads its row of allocation weights.
:::

$$\frac{\mathrm d J}{\mathrm d\theta}=\frac{\partial J}{\partial z^{*}}\,\frac{\partial z^{*}}{\partial c}\,\frac{\partial c}{\partial\theta}$$

::: reveal
::: small
This chain rule is useful only if the middle sensitivity exists. For an exact LP with a fixed feasible region, changing objective coefficients can leave the optimal vertex unchanged, then make it jump. A differentiable layer must specify its regularisation, smoothing or derivative convention; ==an exact discrete argmax does not supply useful gradients automatically.== The weighted model above also changes its feasible region through $c$.
:::
:::

### What differentiating KKT actually requires

Collect the primal variables and multipliers into $y=(z,\lambda,\nu)$. Locally, write a suitable KKT system as $F(y,c)=0$. If it is differentiable and its Jacobian in $y$ is nonsingular, the implicit function theorem gives

$$\frac{\mathrm d y^{*}}{\mathrm d c}=-\left(\frac{\partial F}{\partial y}\right)^{-1}\frac{\partial F}{\partial c}.$$

::: reveal
Convexity makes a feasible KKT solution globally optimal. It does **not** by itself give uniqueness, a nonsingular KKT system or smooth dependence on the data. Regularisation and active-set regularity are additional issues.
:::

::: reveal
::: small
A stable local minimum of a non-convex problem can also have a correct local sensitivity; it need not describe the global optimum. LP layers commonly use quadratic or barrier regularisation to obtain useful sensitivities. [Mandi & Guns, 2020](https://papers.nips.cc/paper_files/paper/2020/file/51311013e51adebc3c34d2cc591fefee-Paper.pdf).
:::
:::

### Convexity can be imposed on a learned model

**Input Convex Neural Networks (ICNNs)** constrain a network to be convex in selected inputs while remaining flexible in its parameters. **OptNet** and differentiable convex layers make an optimisation problem part of a trainable network. {p}(Amos, Xu & Kolter, 2017; Amos & Kolter, 2017; Agrawal et al., 2019)

::: reveal
::: block Check the complete control problem
A convex prediction function is not enough. A nonlinear equality $x_{t+1}=f(x_t,u_t)$ generally defines a non-convex set, and composing a convex predictor with an arbitrary cost can destroy convexity. After eliminating the dynamics, check the **whole objective and every remaining constraint** in the control variables.
:::
:::

::: reveal
::: keypoint
The modelling opportunity is to learn a useful function while preserving the structure that the ==downstream decision problem== needs.
:::
:::

### Heater placement changes the control problem
{sub: heat diffusion — a physical example of bilevel design}

::: figure heat-diffusion-system | 960
Heater inputs $u_t$ inject heat into a field; diffusion changes the temperatures observed at sensors, $o_t\to o_{t+1}$. Source: original PowerPoint, slide 26.
:::

::: reveal
::: small
We observe temperatures at a few sensor locations rather than the whole field. The model must predict how today's heating changes later observations. Moving a heater changes that response, so choosing a location also changes the controller's job.
:::
:::

### Design is chosen once; heating is chosen repeatedly

::: cols c2
::: col
::: figure heater-sensor-layout | 330
Red squares are heater locations $p_i$; grey circles are fixed sensor locations $q_j$. Source: original PowerPoint, slide 26.
:::
:::
::: col Two decisions, two time scales
**Design variables:** heater coordinates $p$, constrained to an installation region.

**Operation variables:** heat inputs $u_0,\ldots,u_{T-1}$, constrained by actuator bounds.

**Objective:** track target sensor temperatures while accounting for the cost of heating.

::: reveal
To compare two layouts fairly, optimise the heating schedule for **each** layout. A poor controller should not make a useful design look bad.
:::
:::
:::

### Bilevel design — evaluate a layout through its best operation
{math: compact}

For a fixed initial condition and a fixed design $p$, let $J_p(u)$ be the cost of rolling out the dynamics under the input sequence $u$. For one operating scenario,

$$\begin{aligned}
\min_{p\in\mathcal P}\quad &J_p\big(u^{*}(p)\big),\\
u^{*}(p)\in\argmin_{u\in\mathcal U_p}\quad &J_p(u),\\
J_p(u)=\sum_{t=0}^{T-1}\mathcal L(x_{t+1},u_t;p),\quad &x_{t+1}=f(x_t,u_t;p).
\end{aligned}$$

::: reveal
The source averages this evaluation over several target scenarios. Each outer design update therefore requires several inner control solves. If those problems have stable solutions, their sensitivities tell us how a small heater movement changes the best achievable cost.
:::

::: reveal
::: small
Convex inner problems make global operation optima certifiable. The outer design problem can remain non-convex, and a surrogate model can still be wrong about the physical plant. These are separate questions. Source: original PowerPoint, slides 24–27.
:::
:::

### The graph separates operation inputs from geometry

::: figure icgnn-architecture | 1030
Sensor and heater histories feed a graph model. Geometry enters through a separate path; selected operation inputs pass through convex subnetworks. Source: original PowerPoint, slide 27.
:::

::: reveal
::: small
Holding the layout fixed defines the inner problem. For that problem, verify convexity of the reduced cost $J_p(u)$ and of $\mathcal U_p$, including the conditions needed when model outputs are composed over time. The network architecture provides part of this argument; the objective and constraints provide the rest.
:::
:::

### A design update combines several control solves

::: figure icgnn-procedure | 880
Build the layout graph, solve $K$ operating scenarios and use their implicit sensitivities to update the heater positions. Source: original PowerPoint, slide 27.
:::

::: reveal
::: small
This separates optimisation over operations from optimisation over geometry. A valid implicit derivative requires a sufficiently solved, regular inner problem. It is a sensitivity of the **surrogate problem**; testing the resulting layout on the physical dynamics remains essential.
:::
:::

### What convexity certifies in the inner problem

::: figure icgnn-compare | 970
The source compares a joint search, an implicit solve with a general GNN and an implicit solve with an input-convex model. Source: original PowerPoint, slide 25.
:::

::: reveal
::: small
Read the last row narrowly: KKT is sufficient for global optimality of a differentiable convex inner problem. In a non-convex problem, a regular local minimum can still be differentiated correctly, but global optimality is not certified. Neither column alone establishes model accuracy or global optimality of the outer design.
:::
:::

### A lower predicted cost can hide a worse design

::: figure icgnn-results | 770
Predicted cost and true cost, with the heater layouts reached by each model. Source: original PowerPoint, slide 28.
:::

::: reveal
::: small
The linear surrogate's predicted cost falls, but its reported true cost rises from **0.0706 to 0.1305**. The final reported costs are **0.0391** for GNN and **0.0319** for ICGNN. This experiment illustrates why a good optimisation result must also survive evaluation on the true dynamics; it is not a universal ranking of model classes.
:::
:::

### Compare surrogates using the same optimisation method

::: figure heater-surrogate-comparison | 1060
Compare Linear, GNN and ICGNN, all using implicit differentiation. Source: original PowerPoint, slide 28.
:::

::: reveal
Read the logarithmic vertical axes as **true design cost**; lower is better. The panels vary sensor count, and the horizontal axes vary heater count. The linear model performs worse across the plotted settings; the gap between GNN and ICGNN is smaller and varies with the setting.
:::

::: reveal
::: keypoint
Holding the optimiser fixed helps isolate the contribution of the ==learned surrogate==. The plotted comparisons are empirical results, not an ordering guaranteed by convexity.
:::
:::

### Compare optimisers using the same surrogate

::: figure heater-optimizer-comparison | 1060
Compare CMA-ES, joint single-level search and implicit differentiation, all using ICGNN. Source: original PowerPoint, slide 28.
:::

::: reveal
Here the model class is fixed, so differences reflect the optimisation procedure and its configuration. The implicit approach is competitive across the plotted settings; read the error bars and the logarithmic scale before judging the size of a difference.
:::

::: reveal
::: keypoint
The optimiser can exploit a surrogate's errors. ==Evaluate the decision on the system it is meant to improve.== Lecture 5 develops this failure in detail.
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

Real engineering problems are usually non-convex — non-convex objective, non-convex constraints. One useful strategy is to ==solve a sequence of local convex approximations==, then evaluate each proposed step in the original problem.

::: reveal
At the current iterate $x^{(k)}$, choose $B^{(k)}\succeq0$ and build a local convex model for minimisation

$$\tilde f(x) = f(x^{(k)}) + \nabla f(x^{(k)})^\top (x - x^{(k)}) + \tfrac12 (x-x^{(k)})^\top B^{(k)} (x-x^{(k)})$$

construct suitable constraint approximations, and add a ==trust region== $\lVert x - x^{(k)}\rVert \le \rho^{(k)}$ so the model stays trustworthy.
:::

::: reveal
::: keypoint
The trust region is the key idea: ==only trust the approximation nearby.==
:::

::: small
Accept a feasible candidate only when actual improvement agrees sufficiently with predicted improvement. Shrink after rejection; expand after strong agreement at the boundary. General constraint linearisations need a feasibility or merit-function strategy. Convergence, when obtained under suitable assumptions, is usually to a stationary point rather than a global optimum.
:::
:::

### The trust region, iterated

::: widget trust-region
Watch the ratio of actual to predicted decrease. Poor agreement rejects a step; strong agreement at the boundary can enlarge the interval. The boxed problem uses a projected-gradient stopping test, so a boundary optimum is recognised. Lecture 10 applies the same idea of limiting an update through a KL constraint in TRPO, with a different step-selection procedure.
:::

### Wind-farm layout — the wakes make it a joint decision

::: cols c2
::: col
::: figure windfarm-wakes | 510
Visible wakes behind offshore turbines. Photograph reproduced from original PowerPoint, slide 43, which credits WindAction.
:::
:::
::: col The decision in the photograph
A turbine extracts energy from the wind and leaves slower, more turbulent air behind it. Downstream turbines therefore see a different inflow from the undisturbed wind.

**Variables:** the turbine coordinates $l=(l_1,\ldots,l_N)$.

**Objective:** expected total farm power, accounting for wake interactions.

**Constraints:** installation boundaries and a prescribed minimum separation $d_{\min}$.

::: reveal
Moving one turbine changes several turbines' power. ==Optimise the layout as a system.==
:::
:::
:::

### A wake model turns geometry into a power prediction

::: cols c2
::: col
::: figure wake-cross-section | 455
Turbine $j$ is upstream of $i$; $d_{ij}$ is downstream distance and $r_{ij}$ is the radial offset. Source: original PowerPoint, slide 44.
:::
:::
::: col Read the model term by term
The source uses a smooth wake-deficit profile:

$$\delta u(d,r)=2\alpha\left(\frac{R_0}{R_0+\kappa d}\right)^2 e^{-\left(\frac{r}{R_0+\kappa d}\right)^2}$$

Here $R_0$ is rotor radius, $\kappa$ controls wake spreading and $\alpha$ controls extraction. For an upstream turbine, the local speed is modelled as $U(1-\delta u)$ before combining multiple wakes.

::: reveal
Increasing $d$ spreads and weakens this wake; increasing $|r|$ moves a turbine away from its centre. The optimiser uses these geometry-dependent changes in its power calculation.
:::
:::
:::

### Recovering from one wake does not remove the others

::: cols wide-l
::: col Wake recovery with distance
::: figure wake-recovery | 620
The wake widens and its central deficit decreases downstream. Source: original PowerPoint, slide 44.
:::

The profiles at $5D$, $7D$ and $9D$ describe different downstream distances; $D=2R_0$ is rotor diameter. More spacing helps this pair, but land and site boundaries limit how far turbines can move.
:::
::: col Several upstream neighbours
::: figure wake-superposition | 285
Turbine $i$ can be affected by several upstream wakes. Source: original PowerPoint, slide 44.
:::
:::
:::

::: reveal
::: keypoint
The power function $P_i(l;U,\theta)$ depends on the ==whole layout and the wind scenario==, not only the nearest neighbour.
:::
:::

### Wind direction and speed determine the scenario weights

::: cols c2
::: col How often does each direction occur?
::: figure wind-rose | 325
The wind rose supplies direction-bin frequencies. Source: original PowerPoint, slide 45.
:::
:::
::: col What speeds occur within that direction?
::: figure wind-speed-distributions | 465
Conditional Weibull speed densities, one for each direction bin. Source: original PowerPoint, slide 45.
:::
:::
:::

::: reveal
The wind rose and the conditional speed distributions play different roles. A direction that occurs often should receive more weight, and its speed distribution determines how much power that direction can supply.
:::

### An expectation is a weighted collection of wind scenarios

::: figure wind-joint-distribution | 830
Joint wind direction–speed distribution. Integrate the plotted density over each bin to obtain its probability mass. Source: original PowerPoint, slide 45.
:::

$$\pi_{jk}=\Pr(\theta\text{ in bin }k)\Pr(U\text{ in bin }j\mid\theta\text{ in bin }k),\qquad \sum_{j,k}\pi_{jk}=1.$$

::: reveal
::: small
Powerful but rare winds need not dominate the expected objective. Use bin masses rather than raw density heights, especially when bins have different widths.
:::
:::

### The layout problem, with one consistent separation rule
{math: compact}

Let $l_i\in\R^2$ be turbine $i$'s position. Treat the fitted wind distribution and the wake model as fixed inputs to this optimisation:

$$\max_l\ F(l),\qquad F(l)=\sum_{j,k}\pi_{jk}\sum_{i=1}^{N}P_i(l;U_j,\theta_k).$$

$$\text{s.t.}\quad \lVert l_i-l_j\rVert_2\ge d_{\min}\quad(i<j),\qquad \underline c\le Cl\le\bar c.$$

::: reveal
The linear constraints encode the site. The minimum-distance constraint excludes a ball around each neighbour, which is non-convex. The wake-coupled objective is also generally non-concave. $d_{\min}$ denotes the **same prescribed distance throughout** the original problem and every subproblem.
:::

::: reveal
::: keypoint
A known expectation is still an ordinary objective function. Here the challenge is its ==geometry==; uncertainty about the fitted model itself comes next in Lecture 2.
:::
:::

### A convex inner region keeps turbines out of exclusion zones

::: figure wind-spacing-convexification | 760
Pink discs exclude positions too close to neighbours. The green polygon is a conservative convex region; blue boxes restrict movement. Source: original PowerPoint, slide 49.
:::

::: reveal
::: small
This picture holds neighbouring positions fixed to explain one turbine's allowable motion. The joint algorithm uses relative displacements of both turbines. Its linear constraints should preserve the original separation, not quietly replace it with a smaller distance.
:::
:::

### Deriving the safe linearised spacing constraint
{math: compact}

Write $d_{ij}=l_i-l_j$ and $d_{ij}^{(k)}=l_i^{(k)}-l_j^{(k)}$. At a feasible iterate $d_{ij}^{(k)}\ne0$, the convex norm has a global affine lower bound:

$$\lVert d_{ij}\rVert_2\ \ge\ \frac{(d_{ij}^{(k)})^\top d_{ij}}{\lVert d_{ij}^{(k)}\rVert_2}.$$

::: reveal
Therefore enforce

$$ (d_{ij}^{(k)})^\top d_{ij}\ \ge\ d_{\min}\lVert d_{ij}^{(k)}\rVert_2. $$

Its left side is linear in the new positions. The lower-bound inequality proves that satisfying this constraint also gives $\lVert d_{ij}\rVert_2\ge d_{\min}$.
:::

::: reveal
::: keypoint
This is an ==inner approximation==: it can exclude useful feasible layouts, but it does not admit layouts that violate the prescribed separation. The current feasible layout remains allowed.
:::
:::

### A concave local power model gives a convex subproblem
{math: compact}

For this **maximisation**, use a negative semidefinite curvature model $H_k\preceq0$; an arbitrary approximate Hessian would not suffice. With $s=l-l^{(k)}$,

$$m_k(l)=F(l^{(k)})+\nabla F(l^{(k)})^\top s+\tfrac12 s^\top H_k s.$$

$$\begin{aligned}
\max_l\quad &m_k(l)\\
\text{s.t.}\quad &(d_{ij}^{(k)})^\top(l_i-l_j)\ge d_{\min}\lVert d_{ij}^{(k)}\rVert_2,\\
&\underline c\le Cl\le\bar c,\qquad \lVert l-l^{(k)}\rVert_\infty\le\rho_k.
\end{aligned}$$

::: reveal
::: small
The box trust region keeps this a QP: equivalently minimise $-m_k$, whose Hessian is positive semidefinite, over linear constraints. All inequalities are non-strict, so the boundary is available to the solver. The original $F$ remains non-concave.
:::
:::

### Accept a step only when the power model earns trust
{math: compact}

Let $\hat l$ solve the subproblem. Compare actual power gain with predicted gain:

$$\mathrm{pred}=m_k(\hat l)-F(l^{(k)}),\quad \mathrm{ared}=F(\hat l)-F(l^{(k)}),\quad r_k=\frac{\mathrm{ared}}{\mathrm{pred}}.$$

::: reveal
- Form the ratio only when the predicted gain is positive and numerically meaningful.
- Accept when $r_k\ge\eta$ for $0<\eta<1$; otherwise keep the current layout and shrink the radius.
- Increase the radius only after strong agreement, typically when a successful step also reaches the trust-region boundary.
:::

::: reveal
::: keypoint
A rejected step changes no coordinates. ==Zero movement after rejection is not convergence.== Check first-order optimality and feasibility; a tiny radius with a large residual indicates stalling.
:::
:::

### The optimised layout breaks repeated wake alignments

::: cols c2
::: col
::: figure wind-layout-result | 510
Blue squares: initial positions. Red circles: optimised positions. Coordinates are normalised by rotor diameter $D$. Source: original PowerPoint, slide 50.
:::
:::
::: col Read the displacement pattern
The optimiser perturbs a regular initial grid while respecting the site's geometry. These movements change the chains of upstream and downstream turbines for common wind directions.

::: reveal
The layout is the **decision**, not the proof of success. It must be evaluated using the same wind scenarios and power model as the initial layout, with separation and boundary constraints checked separately.
:::

::: reveal
::: small
These are the source study's reported layouts, not a new simulation. The general derivation uses $d_{\min}$ so that the separation requirement is carried consistently through each step.
:::
:::
:::
:::

### The reported efficiency improves, then levels off

::: cols c2
::: col
::: figure wind-efficiency-history | 510
Reported wind-farm power efficiency versus optimisation iteration. Source: original PowerPoint, slide 50.
:::
:::
::: col What the curve supports
The plotted efficiency rises from approximately **0.69 to 0.77**, about eight percentage points. Most of the improvement occurs in the early iterations, followed by a plateau.

::: reveal
The curve demonstrates improvement in this modelled case. A plateau alone does not prove global optimality of the original non-convex layout problem, and modelled efficiency is not a measured increase in a real farm's annual energy production.
:::
:::
:::

### Better average power does not mean better in every direction

::: figure wind-direction-efficiency | 1080
Efficiency by wind direction: initial layout in blue, optimised layout in red. Source: original PowerPoint, slide 50.
:::

::: reveal
Several deep troughs become shallower, while some peaks decrease. The optimiser trades power between directions according to the scenario probabilities. This is compatible with an increase in the weighted average; it is not pointwise improvement for every wind direction.
:::

::: reveal
::: keypoint
The case closes the modelling loop: ==state the decision, preserve feasibility, solve local models and evaluate the resulting layout.== Convex subproblems do not make the original problem globally convex.
:::
:::

### Check — what a trust region is for
{q: 4}

::: quiz Why does a trust-region method bound the size of its step?
- To keep the iterate inside the feasible set
- To guarantee the objective decreases monotonically
- To make each iteration cheaper to compute
- =Because the local model is only a good approximation nearby, so the step must stay where the model can be believed
The method builds a simple model — usually quadratic — of a complicated $f$ around the current point. That model is **only trustworthy in a neighbourhood**, so the step is capped at a radius that is grown or shrunk according to how well the model just predicted reality. Lecture 10 uses the same principle to limit a policy update with a KL constraint; its step-selection procedure differs.
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
We can now state a decision, certify a convex optimum, and use convex subproblems to improve a non-convex problem. The research cases already fitted models and used wind distributions, but each optimisation treated those inputs as fixed:

::: keypoint
the chosen model and its coefficients defined ==one optimisation problem.==
:::
:::

::: reveal
::: small
We hand off the template `min f s.t. g ≤ 0`. Now ask what data tells us about its unknown parameters. A fixed surrogate or one fitted distribution hides uncertainty about that fit; Lecture 2 represents this uncertainty as a belief and updates it with observations.
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

1. Start from a feasible $x^{(0)}$, radius $\rho_0>0$ and tolerance $\epsilon>0$.
2. Check feasibility and a suitable first-order residual; stop only when both meet their tolerances. For a box, use $\lVert x-\Pi_D(x-\nabla f(x))\rVert$.
3. Build a model with $B_k\succeq0$ and a feasible inner constraint approximation. Solve it inside the trust region to get $\hat x$.
4. Set $\mathrm{pred}=m_k(x^{(k)})-m_k(\hat x)$. If it is not meaningfully positive, check stationarity or report stalling; do not divide by zero.
5. Set $r_k=[f(x^{(k)})-f(\hat x)]/\mathrm{pred}$. Accept a feasible candidate if $r_k\ge\eta$; otherwise keep $x^{(k+1)}=x^{(k)}$ and shrink the radius.
6. Grow the radius only after strong agreement at the boundary. Return to step 2. A rejected step is never, by itself, evidence of convergence.

::: small
**Why the ratio test.** It measures whether the convex model can be trusted at the proposed step. Trust grows where the model predicts well and shrinks where it does not — the same modelling principle that motivates the KL-constrained update in TRPO, though TRPO uses a different step-selection procedure.
:::

### Backup — the general Lagrangian and KKT conditions
{math: compact}

For $\min_x f(x)$ subject to $g_i(x)\le0$ and $h_j(x)=0$, combine all constraints:

$$L(x,\lambda,\nu)=f(x)+\sum_i\lambda_i g_i(x)+\sum_j\nu_j h_j(x).$$

::: cols c2
::: col Allowed point and inward reactions
**Primal feasibility:**

$$g_i(x^{*})\le0,\qquad h_j(x^{*})=0.$$

**Dual feasibility:** $\lambda_i^{*}\ge0$. Equality multipliers $\nu_j^{*}$ are free in sign: an equality has no allowed side.
:::
::: col No unused reaction and balanced forces
**Complementary slackness:**

$$\lambda_i^{*}g_i(x^{*})=0 \qquad \forall i.$$

**Stationarity:**

$$\nabla f(x^{*})+\sum_i\lambda_i^{*}\nabla g_i(x^{*})+\sum_j\nu_j^{*}\nabla h_j(x^{*})=0.$$
:::
:::

::: small
For differentiable convex $f,g_i$ and affine $h_j$, these four conditions are **sufficient** for global optimality. A constraint qualification such as Slater's makes them **necessary** as well. Without convexity, they are generally not sufficient. A slack inequality must have zero multiplier; a tight inequality can have either zero or a positive multiplier.
:::
