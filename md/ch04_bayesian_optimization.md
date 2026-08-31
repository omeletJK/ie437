---
ch: 4
title: Bayesian Optimization
subtitle: Put the belief to work — act to learn, and to win
tagline: The first policy in the course — a rule that turns a belief into an action
blurb: >-
  Now the belief acts. A Gaussian process carries uncertainty about an expensive unknown function,
  and an acquisition function turns that uncertainty into the next experiment worth running. This
  is the first policy in the course, and the exploration–exploitation dilemma it raises comes back
  in every chapter after it.
course: IE437 · Data-Driven Decision Making and Control
author: Jinkyoo Park
institute: KAIST
cube:
  stages: static
  model: data-driven
  agents: single agent
inherits: structured belief, and a prior over functions (Lecture 3)
handoff: the acquisition policy — the seed of an RL policy — and the bandit (Lecture 5)
questions:
  - Model an unknown f?
  - What is a GP?
  - Where next?
  - What lies beyond?
---

### Bayesian Optimization
{layout: title}

## The handoff — belief that acts
{short: HANDOFF}

Lectures 2 and 3 built a belief and reasoned inside it — passively. Now the belief has to choose.

### Where we are — belief stops observing and starts choosing

::: tracker
:::

::: table center
|   | Model-based | Data-driven |
|---|---|---|
| **Static, single** | optimisation *(Lec 1)* | Bayesian statistics · network *(Lec 2–3)* → ==Bayesian optimisation *(Lec 4)*== |
:::

Nothing on the cube moves this lecture. We stay in the static, data-driven, single-agent cell and ==go deeper into it==: the belief we built in Lectures 2 and 3 stops being a report on the world and starts being the thing that decides what to do next.

::: reveal
::: small
The loop closes. Use the belief to choose a query, observe the answer, update the belief, repeat. That is a different kind of object from anything in Part I — not an answer but a ==rule for producing answers==, which is what the rest of the course will call a *policy*.
:::
:::

### The setting — unknown, expensive, and every query counts

::: lede
Lecture 1 minimised an $f$ that was written down, cheap, and differentiable. Delete all three assumptions.
:::

$$x^* = \argmax_x f(x), \qquad f \text{ \hl{unknown} and \hl{expensive}}$$

::: cols
::: col What "unknown" costs you
No formula, so no gradient. No gradient, so none of Lecture 1's machinery applies directly — the only thing you may do with $f$ is **ask it a question and receive a number**.
:::
::: col.accent What "expensive" costs you
One evaluation is a wet-lab experiment, a multi-hour CFD run, a clinical trial, a season of a wind farm. You get **tens** of queries, not millions. ==Every query must be spent deliberately.==
:::
:::

::: reveal
::: small
Both halves matter. Unknown alone would be handled by fitting a model once and optimising it — that is Lecture 5. Expensive alone would be handled by a careful experimental design fixed in advance. It is *unknown **and** expensive together* that forces the loop: you must learn $f$ and optimise it **at the same time**, with the same queries.
:::
:::

### The thesis — model the unknown, then act on the model
{fill: center}

::: keypoint
Build a belief over the unknown function, then choose where to look by ==balancing learning against winning.==
:::

::: reveal
::: flow | | 
- **1 · Learn** | fit a Gaussian process to the data so far — a posterior over $f$
- **2 · Optimise** | maximise an ==acquisition function== over that posterior to pick $x_{\text{next}}$
- !**3 · Observe** | pay for one evaluation $f(x_{\text{next}})$, add it to the data, return to 1
:::
:::

::: reveal
::: small
Three earlier lectures fused into one turn of a crank: step 1 is Lecture 2's Bayesian update, now over a whole function; step 2 is Lecture 1's optimisation, now over a *cheap* surrogate; step 3 is the single expensive query we are trying to spend wisely.
:::
:::

### The roadmap — four questions

::: qstrip 0
:::

- **Q1 — How do we model a function we have never seen?** A probabilistic ==surrogate==: not one fitted curve but a distribution over the curves consistent with the data.
- **Q2 — What is that model, concretely?** The ==Gaussian process== — and its one real assumption, the kernel.
- **Q3 — Where do we look next?** The ==acquisition function==, which fuses "probably good" with "worth learning" into one optimisable score.
- **Q4 — What lies beyond?** Contextual BO, and the ==bandit-to-RL== bridge.

## Act 1 — a belief over an unknown function
{short: ACT 1, num: Act 1}

**Q1.** You cannot afford to probe $f$ everywhere. So carry a distribution over the functions it might be.

### The surrogate — a distribution, not a fitted curve
{q: 1}

::: qstrip
:::

From a handful of evaluations, build a **surrogate**: a cheap stand-in for $f$ that can be evaluated anywhere. The usual move is to fit one curve. The Bayesian move is to keep ==all the curves the data has not ruled out==.

::: reveal
::: cols
::: col A fitted curve gives you
one number at every $x$ — a prediction. Where the data is dense and where it is absent, it looks equally confident. It cannot tell you where it is guessing.
:::
::: col.accent A distribution gives you
a number **and a width** at every $x$. Narrow where data is dense, wide where data is sparse, and returning to the prior width far from everything.
:::
:::
:::

::: reveal
::: keypoint
That width is not decoration. It is ==the signal we will use to decide where to look next.==
:::
:::

### A function on a finite domain is a vector
{sub: The idea that makes a distribution over functions ordinary}

Let $\mathcal X=\{x_1,\dots,x_n\}$ be finite, and let $\mathcal H$ be every function from $\mathcal X$ to $\R$. One such function is just a list of values —

$$f_0(x_1)=5,\quad f_0(x_2)=2.3,\quad f_0(x_3)=-7,\quad\dots,\quad f_0(x_n)=8$$

— so $f_0$ *is* the vector $\mathbf f = [f(x_1),\dots,f(x_n)]^\top \in \R^n$, and a probability distribution over $\mathcal H$ is nothing more exotic than ==a probability distribution over that vector.==

::: reveal
Take the simplest one, $\mathbf f\sim\mathcal N(\mu,\sigma^2 I)$, and the density over functions is written out in full:

$$p(\mathbf f)=\prod_{i=1}^{n}\frac{1}{\sqrt{2\pi}\sigma}\exp\!\Big(-\frac{1}{2\sigma^2}\big(f(x_i)-\mu_i\big)^2\Big)$$
:::

::: reveal
::: small
The only thing wrong with this is the *independence*: it says knowing $f(x_1)$ tells you nothing about $f(x_2)$, however close they are. Replace $\sigma^2 I$ with a covariance matrix that couples nearby inputs, let $n\to\infty$, and you have a Gaussian process. Everything after this slide is that one substitution.
:::
:::

### Lecture 2's posterior, with the parameter replaced by a function

The handoff from Chapter 2 is not an analogy. It is the *same five steps*, with one symbol swapped.

| step | Lecture 2 — belief over $\theta$ | Lecture 4 — belief over $f$ |
|---|---|---|
| **Model** | a likelihood family for $y$ | $y_i = f(x_i)+\epsilon_i$ |
| **Prior** | $p(\theta)$ — Beta, Gamma, Normal | $p(f)=\mathcal{GP}\big(m(\cdot),k(\cdot,\cdot)\big)$ |
| **Likelihood** | $p(y\mid\theta)$ | $p(\mathbf y\mid\mathbf f)=\mathcal N(\mathbf f,\sigma_\epsilon^2 I)$ |
| **Posterior** | $p(\theta\mid y)$ — conjugate, closed form | $p(f\mid\mathcal D)$ — Gaussian, closed form |
| **Predict** | $p(\hat y\mid y)=\int p(\hat y\mid\theta)p(\theta\mid y)\,d\theta$ | $p(f^*\mid x^*,\mathcal D)=\int p(f^*\mid x^*,\mathbf f)\,p(\mathbf f\mid\mathcal D)\,d\mathbf f$ |

::: reveal
::: small
Chapter 2 ended on the Normal–Normal case and noted that the predictive variance splits into measurement noise you can never remove plus parameter uncertainty you can. ==Replace the parameter by an entire function and that same predictive integral is Gaussian-process regression.== The conjugacy that made Chapter 2 computable is the *only* reason Chapter 4 is computable too.
:::
:::

### Check — a prior over what
{q: 1}

::: quiz Lecture 2 put a prior on a *parameter*. What does Bayesian optimisation put a prior on?
- =The whole unknown function $f$ — a distribution over functions, not over numbers
- The location of the optimum $x^\*$
- The noise in each observation
- The budget of evaluations remaining
This is the step up in object. A Gaussian process says: before seeing any data, here is my belief about **every function** that $f$ could be. Each evaluation conditions that belief, and what comes back is not one fitted curve but a posterior over curves — a mean and, crucially, a variance that is small where you have looked and large where you have not.
:::

## Act 2 — the Gaussian process
{short: ACT 2, num: Act 2}

**Q2.** A prior over functions whose posterior is available in closed form — and one free choice, the kernel, which carries every assumption you are making.

### The Gaussian process — a prior over functions
{q: 2}

::: qstrip
:::

A **Gaussian process** is a collection of random variables $\{f(x): x\in\mathcal X\}$ such that ==every finite subcollection is jointly Gaussian.== Written out, for any $x_1,\dots,x_n$:

$$\begin{bmatrix} f(x_1)\\ \vdots \\ f(x_n)\end{bmatrix} \sim \mathcal N\!\left( \begin{bmatrix} m(x_1)\\ \vdots\\ m(x_n)\end{bmatrix}, \; \begin{bmatrix} k(x_1,x_1) & \cdots & k(x_1,x_n)\\ \vdots & \ddots & \vdots \\ k(x_n,x_1) & \cdots & k(x_n,x_n)\end{bmatrix}\right), \qquad f(\cdot)\sim\mathcal{GP}\big(m(\cdot),k(\cdot,\cdot)\big)$$

::: cols
::: col The mean function
$m(x)=\E[f(x)]$ — the overall trend. Taken as $m\equiv 0$ almost always: it costs no expressiveness and saves computation.
:::
::: col.accent The covariance function
$k(x,x')=\E\big[(f(x)-m(x))(f(x')-m(x'))\big]$ — how strongly nearby points are tied together. It must make every $\mathbf K$ positive semidefinite. ==This is where all the modelling lives.==
:::
:::

::: reveal
::: small
A function drawn from a GP prior is, in the source's own phrase, *an extremely high-dimensional vector drawn from an extremely high-dimensional multivariate Gaussian*. It is Lecture 3's graph over a **continuum** of variables, with the kernel standing in for the edge structure.
:::
:::

### Conditioning is the whole of it

Draw $\mathbf f=[f_1,\dots,f_{25}]\sim\mathcal N(0,\mathbf K)$ and plot the 25 numbers in order: they look like a smooth curve, because $\mathbf K$ made neighbouring entries nearly identical. Read two entries of $\mathbf K$ off the diagonal band:

::: cols
::: col Neighbours — $\mathrm{corr}(f_1,f_2)=0.966$
The joint $p(f_1,f_2)$ is a thin cigar. Observe $f_1=-0.313$ and the conditional $p(f_2\mid f_1)$ is ==a narrow spike== — you have almost measured $f_2$ without paying for it.
:::
::: col.accent Four apart — $\mathrm{corr}(f_1,f_5)=0.573$
The joint is a fat ellipse. The same observation $f_1=-0.313$ leaves $p(f_5\mid f_1)$ ==barely narrower than the prior== — that value you still have to buy.
:::
:::

::: reveal
And the mechanism is a single fact of linear algebra, the one the probability appendix calls Property 4:

$$\begin{bmatrix}Y_1\\Y_2\end{bmatrix}\sim\mathcal N\!\left(\begin{bmatrix}\mu_1\\\mu_2\end{bmatrix},\begin{bmatrix}\Sigma_{11}&\Sigma_{12}\\\Sigma_{21}&\Sigma_{22}\end{bmatrix}\right) \;\Longrightarrow\; Y_2\mid Y_1=y \;\sim\; \mathcal N\big(\mu_2+\Sigma_{21}\Sigma_{11}^{-1}(y-\mu_1),\; \Sigma_{22}-\Sigma_{21}\Sigma_{11}^{-1}\Sigma_{12}\big)$$
:::

::: reveal
::: small
The kernel decides how much one observation is worth at every other point in the domain. Everything the GP does — the narrowing, the interpolation, the uncertainty that grows away from data — is that one formula applied at scale.
:::
:::

### GP regression — mean and uncertainty, in closed form

Observe $\mathcal D=\{(x_i,y_i)\}_{i=1}^n$ with $y_i=f_i+\epsilon_i$, $\epsilon_i\sim\mathcal N(0,\sigma_\epsilon^2)$. Prior and likelihood are Gaussian, so the joint of the data and the value at any new $x$ is Gaussian:

$$\begin{bmatrix}\mathbf y_{1:n}\\ f\end{bmatrix}\sim\mathcal N\!\left(\mathbf 0,\begin{bmatrix}\mathbf K+\sigma_\epsilon^2\mathbf I & \mathbf k\\ \mathbf k^\top & k(x,x)\end{bmatrix}\right)$$

Condition on $\mathbf y_{1:n}$ and read off $p(f\mid\mathcal D)=\mathcal N\big(\mu(x\mid\mathcal D),\sigma^2(x\mid\mathcal D)\big)$ with

$$\hl{\mu(x\mid\mathcal D) = \mathbf k^\top(\mathbf K+\sigma_\epsilon^2 \mathbf I)^{-1}\mathbf y_{1:n}}, \qquad \hl{\sigma^2(x\mid\mathcal D) = k(x,x) - \mathbf k^\top(\mathbf K+\sigma_\epsilon^2\mathbf I)^{-1}\mathbf k}$$

::: reveal
::: keypoint
The GP hands us, at every $x$, both a best guess *and* ==how much to trust it== — and that pair is exactly what the next decision needs.
:::
:::

::: reveal
::: small
Read the two formulas. The mean is a **kernel-weighted average of the observed $y$'s** — a linear smoother whose weights the kernel chose. The variance starts at the prior value $k(x,x)$ and is reduced by $\mathbf k^\top(\cdot)^{-1}\mathbf k$, a quantity that is large near data and vanishes far from it. Note that $\sigma^2$ ==does not depend on $\mathbf y$ at all==: where the GP is uncertain is fixed the moment you choose *where* to look, before you see a single answer. That is what makes experimental design possible.
:::
:::

### The kernel is the assumption — and the data can pick it

::: cols c2
::: col A small vocabulary
- **Squared exponential** $k=\sigma_0^2\exp\!\big[-\tfrac12\big(\tfrac{x-x'}{\lambda}\big)^2\big]$ — stationary, infinitely differentiable, *very* smooth. $\lambda$ is the length scale, $\sigma_0$ the amplitude.
- **Matérn** $\tfrac32$, $\tfrac52$ — finitely differentiable, visibly rougher sample paths, usually more honest about physical data.
- **ARD** — one $\lambda_d$ per input dimension; a large $\lambda_d$ means dimension $d$ is ==irrelevant==.
- **Sums and products** — $k_1+k_2$ adds independent processes, $k_1k_2$ multiplies them: trend plus periodicity, periodicity with growing amplitude.
:::
::: col.accent Fitting $\theta=(\sigma_\epsilon,\sigma_0,\boldsymbol\lambda)$
Maximise the **marginal likelihood** of the data:

$$\theta^*=\argmax_\theta \Big[\underbrace{-\tfrac12\mathbf y^\top(\mathbf K_\theta+\sigma_\epsilon^2\mathbf I)^{-1}\mathbf y}_{\text{data fit}}\;\underbrace{-\tfrac12\log|\mathbf K_\theta+\sigma_\epsilon^2\mathbf I|}_{\text{complexity}}\Big] - \tfrac{n}{2}\log 2\pi$$

The first term rewards explaining the data, the second rewards a *rigid* model. Their sum peaks in between — ==an Occam balance, automatic and free==, and itself an optimisation (Lecture 1) sitting inside the loop.
:::
:::

### Turn the dial and watch the assumption move

::: widget gp-posterior
The same seven observations, one kernel, one knob. Short length scale: the posterior spikes at each datum and falls back to the prior between them — the model believes nothing carries. Long length scale: a near-straight line that cannot bend to the data. The right panel is the marginal likelihood split into its two terms, and ==the total peaks where neither term is happy== — that is the Occam balance, drawn.
:::

### Check — what the length scale controls
{q: 2}

::: quiz You shorten a GP kernel's length scale $\ell$. What happens to the posterior?
- It becomes smoother, and the uncertainty between data points shrinks
- =It wiggles more, and the uncertainty grows back faster as you move away from a data point
- Nothing changes between observations; $\ell$ only rescales the output
- The mean is unaffected; only the observation noise changes
The length scale says how far a datum's influence reaches. Short $\ell$ means each observation informs only its immediate neighbourhood, so the posterior returns to the prior — high variance — almost immediately beyond it. Long $\ell$ borrows strength across the whole domain and gives a smooth, confident, and possibly badly wrong fit. It is the single knob that decides how much the model is willing to extrapolate.
:::

## Act 3 — where to look next
{short: ACT 3, num: Act 3}

**Q3.** The posterior gives a best guess and a width at every $x$. One number has to fuse them, and that number is a rule for acting.

### The acquisition function — a score you are allowed to optimise
{q: 3}

::: qstrip
:::

Given the posterior $(\mu,\sigma)$, the **acquisition function** $A(x)$ scores how worthwhile it would be to query $x$ next. Then

$$x_{\text{next}} = \argmax_x\; A(x)$$

which is a *cheap* inner optimisation over the surrogate — no expensive evaluations, gradients available, run it as long as you like.

::: reveal
::: cols
::: col Two impulses
**High $\mu(x)$** says *probably good* — spend the query where the model already expects a win. That is **exploitation**.

**High $\sigma(x)$** says *worth learning* — spend the query where the model is ignorant, because that is where a surprise can hide. That is **exploration**.
:::
::: col.accent One number
$A(x)$ is whatever function of $\mu$ and $\sigma$ you are willing to defend. The three standard answers differ only in ==how they weigh the two impulses==, and the disagreement is real: on the same posterior they point at different places.
:::
:::
:::

::: reveal
::: small
This is the explore–exploit dilemma — the same one inside every reinforcement learner — but here it is not a heuristic. It is an explicit, differentiable, optimisable score, which is why Bayesian optimisation is the cleanest place in the course to meet it.
:::
:::

### Three scores

| | rule | reads as | leans |
|---|---|---|---|
| **Probability of improvement** | $\mathrm{PI}(x)=\Phi\!\big(\frac{\mu(x)-f^{+}-\xi}{\sigma(x)}\big)$ | *how likely* is any improvement at all | exploit |
| **Expected improvement** | $\mathrm{EI}(x)=\E\big[\max(0,f(x)-f^{+})\big]$ | how likely **and by how much** | balanced |
| **Upper confidence bound** | $\mathrm{UCB}(x)=\mu(x)+\kappa\,\sigma(x)$ | optimism, at an explicit price $\kappa$ | tunable |

where $f^{+}=\max_{x_i\in x_{1:t}} f(x_i)$ is the best value seen so far.

::: reveal
::: block PI's flaw, and why EI exists | the source deck's own words
"The formulation is pure exploitation. Points that have a high probability of being ==infinitesimally== greater than $f(x^{+})$ will be drawn over points that offer larger gains but less certainty."

The patch is a margin $\xi\ge0$ — demand improvement *by at least $\xi$* — scheduled large early and decayed to zero. But it is a knob you must tune: too small and the search is highly local, too large and it is excessively global. EI needs no such knob, because integrating $\max(0,f-f^{+})$ already counts **how far above the line** the improvement is, not merely whether it happens.
:::
:::

### The three rules, disagreeing

::: widget acquisition-zoo
One posterior, five observations, three scores drawn underneath it, each with its own $\argmax$ marked. At $\xi=0$, PI points at $x=0.630$ — hard against the incumbent at $0.65$, buying a near-certain sliver. EI points at $x=0.470$, into the wide-uncertainty valley where the true maximum actually is. Turn $\xi$ up and PI walks out to meet EI; turn $\kappa$ down and UCB collapses onto the greedy mean. ==The knob is the same knob in all three.==
:::

### The loop
{fill: center}

::: flow | | 
- **Learn** | GP posterior $(\mu,\sigma)$ — *Lecture 2, over a function*
- **Optimise** | $x_{\text{next}}=\argmax_x A(x)$ — *Lecture 1, over a cheap surrogate*
- !**Observe** | query $f(x_{\text{next}})$, append to $\mathcal D$ — *the one expensive thing*
:::

::: reveal
The dashed return arrow is what makes this a lecture rather than a technique. Each pass changes the belief, the changed belief changes the acquisition surface, and the changed surface changes where you look. ==Nothing in Part I had a return arrow.==
:::

::: reveal
::: small
Note also what the loop does *not* do: it never touches $f$ except at step 3. All the optimisation happens on the surrogate. The whole design is an accounting trick for spending a scarce resource — expensive evaluations — by substituting a cheap one.
:::
:::

### Ten queries on a quartic
{sub: Example 4.1 · maximise $-1.3x^4+x^3+1.5x^2+1$ over $-1 \le x \le 1.5$ with noise $\sigma_\epsilon = 0.01$}

::: widget bo-run {"seed":5}
Press *next query* and watch EI decide. The second query goes straight to the far boundary $x=-1$ — the mean there is unremarkable, but the uncertainty is enormous, and EI pays to find out. By the eighth the queries have collapsed onto $x=1.10$, and the EI peak has fallen from $0.48$ to $0.002$: ==the model no longer expects to learn anything by asking again.== The true maximum is $x^*=1.1010$, $f^*=2.2427$.
:::

::: small
The lecture's own run took eleven queries and stopped at $x=1.11$, $y=2.24$ — the same answer, to the precision the noise allows.
:::

### This loop is a policy — the first in the course
{fill: center}

::: cols
::: col The bandit, Lecture 4
$$\pi:\big[(a_1,r_1),\dots,(a_{t-1},r_{t-1})\big]\to a_t$$

Find $\pi^*$ maximising $\E\big[\textstyle\sum_t r_t\big]$.
:::
::: col.accent Bayesian optimisation, Lecture 4
$$\pi:\big[(x^1,y^1),\dots,(x^{n-1},y^{n-1})\big]\to x^n$$

Find $\pi^*$ maximising $\E\big[\textstyle\sum_t y^t\big]$.
:::
:::

::: reveal
::: keypoint
The same definition twice: a rule that maps ==the whole history to the next action.== That is what a policy is, and this is where the course meets one.
:::
:::

::: reveal
::: small
So say plainly what the acquisition function is. It is not a scoring heuristic bolted onto a regression — it is a **policy over a belief state**, and every policy in Part IV is its descendant. Lecture 8's $\varepsilon$-greedy rule chooses $\argmax_a Q(a)$ with probability $1-\varepsilon$ and explores otherwise; UCB there is $\mu_i + \sqrt{2\ln t/n_i}$, which is $\mu+\kappa\sigma$ with the count standing in for the width. ==Change the belief from a GP to a $Q$-table and the acquisition function *is* the exploration rule.==
:::
:::

### Check — the acquisition function's job
{q: 3}

::: quiz An acquisition function turns a GP posterior into the next query. Why not simply query the point with the highest posterior *mean*?
- Because the mean is biased upward wherever data is scarce
- Because the mean has no maximum when the domain is continuous
- =Because that is pure exploitation — it never visits the regions the model admits it knows nothing about, where the true optimum may sit
- Because the posterior mean is not differentiable, so it cannot be maximised
Maximising the mean trusts the model exactly where the model is least entitled to be trusted. Every acquisition function is a rule for trading the mean against the **variance**, and that trade is the seed of the explore–exploit problem that returns as $\varepsilon$-greedy in Lecture 8. Lecture 5 shows what happens to a design pipeline that forgets this and optimises the surrogate alone.
:::

## Act 4 — beyond, toward RL
{short: ACT 4, num: Act 4}

**Q4.** Strip the function away and the loop is a bandit. Add a context and it is a contextual bandit. Add dynamics and it is reinforcement learning.

### Bayesian optimisation is a bandit with infinitely many arms
{q: 4}

::: qstrip
:::

Put a slot machine under every point of the domain. Pulling arm $x$ pays $f(x)$ plus noise; the payouts are unknown; you have a budget of pulls. That is the $n$-armed bandit with $\hl{n=\infty}$ — and the reason it is not hopeless is the ==kernel==, which makes pulling one arm tell you about its neighbours.

::: reveal
::: cols
::: col What the bandit contributes
The word *policy*, and the trade-off in its bare form: **acquiring new information** against **capitalising on the information already held**. With finitely many arms the belief is one number per arm; here it is a whole GP.
:::
::: col.accent What BO contributes
Structure. A finite bandit must try every arm at least once, so its regret scales with the number of arms. A GP over a continuum needs only enough queries to pin down $f$ at ==the kernel's resolution==, which is why tens of evaluations can suffice.
:::
:::
:::

::: reveal
::: small
The lineage runs both ways. The bandit's Bayesian form is Chapter 2 exactly: after $w$ wins and $l$ losses, arm $i$ has posterior $\mathrm{Beta}(1+w_i,\,1+l_i)$ and mean $\rho_i=\frac{w_i+1}{w_i+l_i+2}$ — the pseudo-count update from Lecture 2, now serving as ==a belief state that an action will change.==
:::
:::

### How much exploration is the right amount?

::: widget explore-regret {"seed":21}
Ten arms, unknown payout probabilities, a thousand pulls, cumulative regret on the vertical axis. Pure greed ($\varepsilon=0$) locks onto whichever arm happened to pay first and never recovers. Constant thrashing ($\varepsilon=0.5$) pays a fixed toll on every round. ==The best fixed rate is in between, and the confidence-bound rule beats every fixed rate== — because it explores where the uncertainty actually is, rather than at random. That is the whole argument for $\mu+\kappa\sigma$, made without a Gaussian process anywhere in sight.
:::

### From a function to a context

Often the right action depends on a **context** $c$ revealed just before each decision — the best price given the season, the best treatment given the patient, the best yaw angles given the wind direction. The object we want is no longer a point but a map:

$$x^* = \pi^*(c) = \argmax_x f(x;c)$$

::: reveal
::: cols
::: col How the GP absorbs a context
Put a kernel on the context too and multiply:

$$k\big((x,c),(x',c')\big) = k_X(x,x')\cdot k_C(c,c')$$

which asserts that ==similar contexts have similar optima==. Without that, each context would be a separate problem and no policy could be learned at all.
:::
::: col.accent What we have just built
A rule that at each round takes all past $(c,x,y)$, maintains a belief state $B_t(f)$ over the unknown function, and acts to maximise cumulative reward.

That is an ==MDP over the belief state== — Lecture 3's decision network, unrolled in time.
:::
:::
:::

::: reveal
::: small
And it costs something up front. In the professor's own wind-farm study, the contextual learner starts at 0.79 average power efficiency against a greedy controller's 0.93, crosses it at roughly 2 500 iterations, and finishes ahead at 0.94. ==Exploration is a debt you take on early and are repaid for later==, which is exactly the shape of every learning curve in Part IV.
:::
:::

### The bridge — one table, four lectures

::: table center
|   | **Model known** — only exploitation | **Model unknown** — explore vs exploit |
|---|---|---|
| **Single state** *(optimum action)* | optimisation *(Lec 1)* | ==bandit · Bayesian optimisation *(Lec 4)*== |
| **Multiple states** *(optimum policy)* | dynamic programming *(Lec 7)* | contextual bandit → reinforcement learning *(Lec 8, 10)* |
:::

::: reveal
Read across the bottom row and you have Part IV. Read down the right column and you have this course's central axis. The one missing ingredient between a contextual bandit and full RL is **state dynamics**: in BO your action does not change the world it is asking about. ==Let the action move the state, and the bandit becomes reinforcement learning.==
:::

::: reveal
::: small
What carries over intact is the explore–exploit machinery of this lecture. What is added is a **value function**, to account for the future an action unlocks and not merely the reward it returns. That is Lecture 7.
:::
:::

### Check — what BO assumes it may do
{q: 4}

::: quiz Bayesian optimisation is a loop: fit, choose, **evaluate**, repeat. Which assumption does the next lecture take away?
- That $f$ is smooth enough for a GP prior
- That the domain is low-dimensional
- That evaluations are noiseless
- =That you may query $f$ at a point of your choosing and get an answer back
BO earns its sample efficiency by choosing where to look — it needs an **oracle** it can call. Lecture 5 removes exactly that: a fixed dataset, gathered by someone else, and no way to ask a new question. The loop collapses to a single pass, and every safeguard the loop provided has to be rebuilt from inside the model.
:::

## Closing
{short: CLOSING}

Part II is complete: belief built, belief structured, belief put to work.

### Where we are — Part II complete

::: table center
|   | Model-based | Data-driven |
|---|---|---|
| **Static, single** | optimisation *(Lec 1 ✓)* | Bayesian stats · network *(Lec 2–3 ✓)* → ==Bayesian optimisation *(Lec 4 ✓)*== |
:::

::: reveal
What this lecture hands on is ==the acquisition policy — the seed of an RL policy — and the bandit.== Two roads lead out from it.

- **Lectures 5–6** — what if you ==cannot query $f$ at all==, and hold only a fixed dataset? Offline design optimisation, forward and inverse. Bayesian optimisation minus the loop.
- **Lectures 7–10** — what if the action ==moves the world==? The loop stays, a value function is added, and the bandit becomes reinforcement learning.
:::

::: reveal
::: small
Honest limits, before you go: a GP costs $O(n^3)$, so BO lives in the low thousands of evaluations, and the acquisition surface becomes flat and hostile in high dimension — in practice BO optimises **10–20 parameters**, not 10 000. Latent-space and neural surrogates push on both walls, and the first of them, learning a low-dimensional representation to optimise inside, is Lecture 6.
:::
:::

### A known objective can be optimised; an unknown, expensive one must be learned while it is optimised.
{layout: standout}

A Gaussian process for the belief, an acquisition function to weigh learning against winning, and a loop that — quietly, three lectures before the words appear — is the first reinforcement learner in the course.

### Questions?
{layout: standout}

The acquisition function is a policy over a belief state. Everything Part IV does is add dynamics to that sentence.

## Appendix — backup slides
{short: APPENDIX}

Derivations and the bandit toolkit, kept out of the narrative.

### Backup 1 — the GP posterior, from one Gaussian fact

**The fact.** If $\begin{bmatrix}Y_1\\Y_2\end{bmatrix}\sim\mathcal N\!\left(\begin{bmatrix}\mu_1\\\mu_2\end{bmatrix},\begin{bmatrix}\Sigma_{11}&\Sigma_{12}\\\Sigma_{21}&\Sigma_{22}\end{bmatrix}\right)$, then

$$Y_2\mid Y_1 = y \sim \mathcal N\big(\mu_2 + \Sigma_{21}\Sigma_{11}^{-1}(y-\mu_1),\; \Sigma_{22}-\Sigma_{21}\Sigma_{11}^{-1}\Sigma_{12}\big)$$

**The application.** Take $Y_1=\mathbf y_{1:n}$ (observed, with $\sigma_\epsilon^2$ on the diagonal) and $Y_2=f(x)$ (the value we want). Then $\Sigma_{11}=\mathbf K+\sigma_\epsilon^2\mathbf I$, $\Sigma_{21}=\mathbf k^\top$, $\Sigma_{22}=k(x,x)$, and with $m\equiv 0$:

$$\mu(x\mid\mathcal D) = \mathbf k^\top(\mathbf K+\sigma_\epsilon^2\mathbf I)^{-1}\mathbf y, \qquad \sigma^2(x\mid\mathcal D) = k(x,x)-\mathbf k^\top(\mathbf K+\sigma_\epsilon^2\mathbf I)^{-1}\mathbf k \quad\blacksquare$$

::: small
Three readings. The mean is a **kernel-weighted average** of the observed $y$'s. The variance shrinks near data and returns to the prior $k(x,x)$ far from it. And the variance never sees $\mathbf y$ — only where you looked, not what you found — which is why a GP can plan an experiment before running it. The cost is the inverse: $O(n^3)$ once, $O(n^2)$ per prediction, which is the entire reason BO stops at a few thousand evaluations.
:::

### Backup 2 — kernels, and hyperparameters by marginal likelihood

**Squared exponential.** $k(x,x')=\sigma_0^2\exp\!\big(-\tfrac12\|x-x'\|^2/\lambda^2\big)$ — stationary, infinitely differentiable. **Matérn $\tfrac32$:** $\alpha(1+\sqrt3 r)e^{-\sqrt3 r}$; **Matérn $\tfrac52$:** $\alpha(1+\sqrt5 r+\tfrac53 r^2)e^{-\sqrt5 r}$, with $r=\|x-x'\|_2/l$ — finitely differentiable, rougher, usually more realistic. **ARD:** one $\lambda_d$ per dimension, $k=\sigma_0^2\exp\!\big[-\tfrac12\sum_d ((x_d-x_d')/\lambda_d)^2\big]$, and a large $\lambda_d$ declares dimension $d$ irrelevant. **Algebra:** $k_1+k_2$ is the sum of independent processes, $k_1k_2$ their product — so Lin $+$ Per is *periodic with a trend*, Lin $\times$ Per is *growing amplitude*.

**Fitting $\theta=(\sigma_\epsilon,\sigma_0,\boldsymbol\lambda)$.** Marginalise the latent $\mathbf f$ away and maximise what is left:

$$\theta^*=\argmax_\theta \log\!\int p(\mathbf y\mid\mathbf f,\theta)\,p(\mathbf f\mid\theta)\,d\mathbf f = \argmin_\theta\Big[\tfrac12\mathbf y^\top(\mathbf K_\theta+\sigma_\epsilon^2\mathbf I)^{-1}\mathbf y + \tfrac12\log|\mathbf K_\theta+\sigma_\epsilon^2\mathbf I|\Big]$$

::: small
The two terms pull opposite ways as the length scale grows. On the seven-point example of the Act 2 widget, the complexity term $-\tfrac12\log|\mathbf K+\sigma_\epsilon^2\mathbf I|$ climbs monotonically from $-0.04$ at $\lambda=0.05$ to $+12.2$ at $\lambda=10$ — a rigid model is *rewarded* — while the data-fit term falls from $-0.75$ near $\lambda=0.45$ to $-58.9$ at $\lambda=10$. Their sum peaks at $\lambda\approx0.85$. That is an Occam's razor you did not have to write down, and it is a Lecture 1 optimisation nested inside the Lecture 4 loop.
:::

### Backup 3 — Expected Improvement, in closed form

With $f(x)\sim\mathcal N(\mu,\sigma^2)$ and incumbent $f^{+}$, define $I=\max(0,f(x)-f^{+})$. Integrate:

$$\mathrm{EI}(x)=\int_{f^{+}}^{\infty}\big(f-f^{+}\big)\,p(f\mid\mathcal D)\,df = \sigma(x)\Big[\,\underbrace{\tfrac{\mu-f^{+}}{\sigma}\,\Phi(z)}_{\text{exploit}} + \underbrace{\phi(z)}_{\text{explore}}\,\Big], \qquad z=\frac{\mu-f^{+}}{\sigma}$$

with $\Phi,\phi$ the standard normal CDF and PDF. Adding a margin $\xi$ gives the general form $\mathrm{EI}=(\mu-f^{+}-\xi)\Phi(Z)+\sigma\phi(Z)$, $Z=(\mu-f^{+}-\xi)/\sigma$, and $\mathrm{EI}=0$ wherever $\sigma=0$.

::: small
**Reading the two terms.** $(\mu-f^{+})\Phi(z)$ is large where the mean already beats the incumbent; $\sigma\phi(z)$ is large where the uncertainty is high, even if the mean is unremarkable. **Why EI beats PI.** PI integrates the *density* above the line — it counts whether an improvement happens. EI integrates the density *weighted by how far above the line it lands* — it counts how big. That single difference removes the need for a tuning parameter, and on the Act 3 posterior it moves the query from $x=0.630$ (worth $1.075$) to $x=0.470$ (worth $1.301$, against a true maximum of $1.303$).
:::

### Backup 4 — the bandit toolkit, three lectures early

The source lecture develops the finite-armed bandit in full before reaching BO. Every rule below reappears in Part IV.

| rule | form | reappears as |
|---|---|---|
| **Action value** | $Q_t(a)=\frac{r_1+\cdots+r_{k_a}}{k_a}$, greedy $a_t=\argmax_a Q_t(a)$ | the $Q$-function, Lecture 8 |
| **Incremental update** | $Q_{k+1}=Q_k+\alpha_k\big[r_{k+1}-Q_k\big]$, with $\alpha_k=\tfrac{1}{k+1}$ or a constant | *new ← old $+$ step $\times$ (target $-$ old)* — every RL update, and a constant $\alpha$ gives exponential recency weighting |
| **$\varepsilon$-greedy** | $\pi(a)=1-\varepsilon+\tfrac{\varepsilon}{\lvert A\rvert}$ if $a=a^*$, else $\tfrac{\varepsilon}{\lvert A\rvert}$ | Lecture 8's exploration rule, unchanged |
| **Softmax** | $\pi_t(a)=e^{Q_t(a)/\tau}\big/\sum_b e^{Q_t(b)/\tau}$ | the Boltzmann policy; $\tau\to0$ recovers greedy |
| **Preference rules** | reinforcement comparison $p_{t+1}(a_t)=p_t(a_t)+\beta[r_t-\bar r_t]$; pursuit, keeping both $Q_t$ and $\pi_t$ | REINFORCE **with a baseline**, and actor–critic — Lecture 10 |
| **UCB** | $a_t=\argmax_i\big(\mu_i+\sqrt{2\ln t / n_i}\big)$ | $\mu(x)+\kappa\sigma(x)$, this lecture, continuous |

::: small
Every arm is sampled infinitely often, so $Q_t\to Q^*$ and the chance of choosing the optimal action converges to at least $1-\varepsilon$ — and never better, while $\varepsilon$ is fixed. That floor is why the Act 4 curve turns back up.
:::
