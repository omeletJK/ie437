---
ch: 2
title: Fundamentals on Bayesian Statistics
subtitle: Don't pick a number — carry a belief
tagline: The first crossing — from a world handed to us to a world inferred from data
blurb: >-
  The first thing taken away is certainty about the objective. Instead of committing to one
  number, carry a distribution and let data update it — and watch regularization stop being a
  trick and become a prior.
course: IE437 · Data-Driven Decision Making and Control
author: Jinkyoo Park
institute: KAIST
cube:
  stages: static
  model: data-driven
  agents: single agent
crossing: model
cube_from:
  model: model-based
inherits: the template `min f s.t. g ≤ 0` (Lecture 1)
handoff: belief as a distribution (Lecture 3)
questions:
  - Why a distribution?
  - How does data update it?
  - Must I commit?
  - How do I predict?
---

### Fundamentals on Bayesian Statistics
{layout: title}

## The handoff — the objective was uncertain
{short: HANDOFF}

Lecture 1 minimised a *known* $f$. In practice $f$ is fitted to noisy data — and its parameters are uncertain.

### Where we are — the model stops being exact

::: tracker
:::

::: table center
|   | Model-based (certain) | Data-driven (uncertain) |
|---|---|---|
| **Static, single** | optimisation *(Lec 1)* | ==Bayesian statistics *(Lec 2)*== |
:::

Lecture 1 minimised a *known* $f$. But in practice $f$ comes from a ==model fit to noisy data== — its parameters are uncertain. A single "best" decision then rests on a single, possibly wrong, parameter estimate.

::: reveal
::: small
So this lecture steps back from *deciding* to *modelling under uncertainty*: how to represent, and update, what we believe about a model's parameters given data. It is the first encounter with the course's central axis — ==from a world handed to us, to a world inferred from data==.
:::
:::

### Statistics infers the cause that generated the data

::: flow | 
- **Model** | $\theta$ — the characteristics of a model
- **Data** | $y = (y_1,\dots,y_n)$ — the observed consequence
:::

For a tossed coin: $\theta$ is the probability of a head; the data is the sequence *(Head, Head, Tail, …)*. The arrow runs left to right in the world and ==right to left in statistics== — we see consequences and must infer the cause.

::: reveal
::: cols
::: col Two views on probability
- **Frequentist** — probability has meaning only as the limiting case of *repeated measurements*; it is a frequency of events.
- **Bayesian** — probability is a *degree of certainty* about a statement; it is about our own knowledge of an event.
:::
::: col.accent Two views on statistics
- **Frequentist** — data is a repeatable random sample; ==parameters are fixed and unchanging==.
- **Bayesian** — data is fixed, observed from the realised sample; ==parameters are unknown and described probabilistically==.
:::
:::
:::

### The coin, and what each view struggles with

::: cols
::: col Frequentist
$\theta$ is the relative frequency of heads in a "large number" of "identical flips". Nothing matters more than repeatability.

**The trouble.** With small $n$ the estimate is wildly unstable —

$$\frac{\#\text{Success}}{\#\text{Trials}} = \frac{1}{3},\; \frac{5}{6},\; \frac{5}{13},\; \frac{129}{313},\; \frac{61423}{123400}$$

and an "identical flip" is not a thing that exists.
:::
::: col.accent Bayesian
$\theta$ is itself uncertain. Express the belief as a distribution $p(\theta)$ — each $\theta$ can correspond to a different orientation, force, surface.

**The trouble.** $p(\theta)$ is ==subjective==. How do you specify it, and how much does the answer depend on it?
:::
:::

::: reveal
::: small
Act 2 answers the Bayesian objection quantitatively: the prior's influence is not a matter of taste but a *weight*, and that weight is $\beta/(\beta+n)$ — it vanishes as data accumulates.
:::
:::

### The thesis — a belief, not a guess
{fill: center}

::: keypoint
When you don't know a parameter, don't pick one value — ==carry a distribution over all of them.==
:::

::: reveal
| | Frequentist | Bayesian |
|---|---|---|
| the parameter $\theta$ | fixed but unknown | a random variable |
| what you estimate | by maximising the likelihood | a full posterior distribution |
| what you get | one point estimate $\hat\theta$ | a balance of prior belief and evidence |
:::

::: reveal
::: small
The Bayesian move — treating the unknown itself as a distribution that data sharpens — is the engine behind Gaussian processes (Ch 4), surrogate uncertainty (Ch 5), and belief-state decision making (Ch 3 onward). Learn it once, reuse it all term.
:::
:::

### The roadmap — four questions

::: qstrip 0
:::

- **Q1 — Why represent belief as a distribution?** Bayes' rule and the prior–posterior picture.
- **Q2 — How does data update belief?** The posterior as a ==balance== of prior and evidence; conjugacy.
- **Q3 — What if I must commit to one value?** MLE vs. MAP — and why ==regularisation is a prior==.
- **Q4 — How do I predict with my uncertainty intact?** The ==posterior predictive== distribution.

## Act 1 — belief as a distribution
{short: ACT 1, num: Act 1}

**Q1.** One line of algebra that turns a belief and a measurement into a new belief.

### Bayes' rule — the whole of inference on one line
{q: 1}

::: qstrip
:::

::: widget bayes-anatomy
:::

::: reveal
::: keypoint
Belief in $=$ prior; belief out $=$ posterior; ==the data does the turning.==
:::
:::

### The procedure, not the formula
{fill: center}

::: flow
- **1 · Model** | choose a structure for the data
- **2 · Prior** | place $p(\theta)$ on its parameters
- **3 · Likelihood** | write $p(y\mid\theta)$
- !**4 · Posterior** | turn the crank: $p(\theta\mid y)\propto p(y\mid\theta)p(\theta)$
- **5 · Predict** | if needed, forecast the unobserved
:::

::: reveal
::: small
Bayes' rule is not a formula to memorise but a ==procedure==. Every lecture in Part II is this same five-step loop with a different model in step 1 — a Bernoulli here, a graph in Ch 3, a whole function in Ch 4.
:::
:::

### The picture — belief sharpening with evidence
{fill: top}

::: widget bayes-update
A flat prior over a coin's bias; each toss reshapes it. Watch epistemic uncertainty shrink in front of you — and read the two weights below the chart: the posterior mean is always ==a weighted average of the prior mean and the data's estimate==. That is Act 2, arrived at early.
:::

### What a distribution buys that a point cannot

Early on the posterior is wide — and an honest decision-maker acts cautiously. That "width" becomes the explore/exploit signal of Bayesian optimisation (Ch 4), the uncertainty penalty of Ch 5, and the belief state of every sequential method after that.

::: reveal
It also changes what a "95% interval" *means*, and the two meanings are not interchangeable:
:::

::: reveal
::: widget ci-vs-cr
:::
:::

## Act 2 — how data updates belief
{short: ACT 2, num: Act 2}

**Q2.** The update is not a matter of taste. It is a weighted average, and the weights are explicit.

### The coin, done both ways
{q: 2}

::: qstrip
:::

::: cols
::: col Frequentist — maximum likelihood
With $Y_i\sim\mathrm{B}(\theta)$ the likelihood of $n$ tosses is

$$L(\theta)=p(y_1,\dots,y_n\mid\theta)=\theta^{\sum y_i}(1-\theta)^{n-\sum y_i}$$

Setting $dL/d\theta = 0$ gives

$$\hat\theta_{\mathrm{ML}}=\frac{\sum y_i}{n}$$

==MLE returns the relative frequency.== $\sum y_i$ is a *sufficient statistic*: the order of the tosses never mattered.
:::
::: col.accent Bayesian — conjugate update
Likelihood $Y\sim\mathrm{Bin}(n,\theta)$, prior $\theta\sim\mathrm{Beta}(\alpha,\beta)$:

$$p(\theta\mid y)\;\propto\;\theta^{y}(1-\theta)^{n-y}\cdot\theta^{\alpha-1}(1-\theta)^{\beta-1}$$

$$=\;\hl{\mathrm{Beta}(\theta\mid \alpha+y,\;\beta+n-y)}$$

$\alpha$ is a ==pseudo-count of successes==, $\beta$ a pseudo-count of failures. The prior is simply data you already believed you had.
:::
:::

### The posterior is a balance — prior vs. evidence

$$\E[\theta\mid y] = \frac{\alpha + y}{\alpha+\beta+n} = \underbrace{\frac{\alpha+\beta}{\alpha+\beta+n}}_{\text{weight on prior}}\,\E[\theta] \;+\; \underbrace{\frac{n}{\alpha+\beta+n}}_{\text{weight on data}}\,\hat\theta_{\mathrm{ML}}$$

::: reveal
::: keypoint
The posterior mean is a ==weighted average== of the prior mean and the data's estimate.
:::
:::

::: reveal
- small $n$ — the *prior* dominates; belief barely moves;
- large $n$ — the *data* dominates, the prior washes out and $\E[\theta\mid y]\to\hat\theta_{\mathrm{ML}}$;
- $\alpha+\beta$ tunes the ==strength== of the prior — how many pseudo-observations it is worth.
:::

### Two laws that say the same thing, exactly

::: block The prior mean is the average of every posterior mean
$$\E[\theta] = \E\big[\,\E[\theta\mid y]\,\big]$$
Before seeing data, your belief is already the average of every belief you might end up with.
:::

::: block The posterior is on average tighter than the prior
$$\mathrm{Var}(\theta) = \E\big[\mathrm{Var}(\theta\mid y)\big] + \mathrm{Var}\big(\E[\theta\mid y]\big)$$
The posterior variance is smaller than the prior variance by exactly the variation in posterior means across possible datasets. ==Data cannot, on average, make you less certain.==
:::

::: reveal
::: small
The posterior sits at a compromise between prior information and data, and the compromise is controlled more and more by the data as the sample grows.
:::
:::

### Conjugacy — why any of this is computable

A prior is ==conjugate== to a likelihood when the posterior lands in the same family as the prior. The update then has a closed form and there is no integral to evaluate.

::: flow
- Prior | $\mathcal{P}$
- Likelihood | $\mathcal{F}$
- !Posterior | $\mathcal{P}$ — the same family
:::

::: reveal
- you know the posterior's form in advance, so mean, mode and variance are immediate;
- the prior has a readable meaning — a Beta prior is just adding pseudo-counts;
- and the evidence $p(y)=\int p(y\mid\theta)p(\theta)\,d\theta$ can actually be carried out.
:::

### The conjugate pairs worth knowing
{fill: top}

| Likelihood | Conjugate prior | Posterior |
|---|---|---|
| Binomial · Negative binomial · Geometric | Beta | Beta |
| Poisson · Exponential | Gamma | Gamma |
| Normal, mean unknown | Normal | Normal |
| Normal, variance unknown | Inverse Gamma | Inverse Gamma |
| Normal, both unknown | Normal–Gamma | Normal–Gamma |
| Multinomial | Dirichlet | Dirichlet |

::: small
In every case the posterior parameters are the prior's **plus a sufficient statistic of the data** — which is exactly why the posterior mean is always a prior-vs-data weighted average, and why a prior behaves like a stock of pseudo-observations.
:::

### A worked example — counting Pokémon
{sub: Example 2.1 · Poisson likelihood, Gamma prior}

Counts in 20 districts of San Francisco: 14, 13, 7, 10, 15, 15, 2, 13, 13, 11, 10, 13, 5, 13, 9, 12, 9, 12, 8, 7.

::: cols
::: col The model
$Y_i\sim\mathrm{Poisson}(\lambda)$, and a Gamma prior with mean 20 and standard deviation 10:

$$\E[\lambda]=\frac{\alpha}{\beta}=20,\quad \mathrm{Var}(\lambda)=\frac{\alpha}{\beta^2}=10^2 \;\Rightarrow\; \alpha=4,\ \beta=0.2$$
:::
::: col.accent The update
$$p(\lambda\mid y)=\mathrm{Gamma}(\alpha+n\bar y,\ \beta+n)=\mathrm{Gamma}(215,\ 20.2)$$

$$\E[\lambda\mid y]=\frac{215}{20.2}=10.64,\qquad \mathrm{Var}=\frac{215}{20.2^2}=0.527$$
:::
:::

::: reveal
::: small
The prior said 20 and the data says 10.55. The posterior says ==10.64== — the twenty observations have all but erased a prior worth $\beta = 0.2$ pseudo-observations. The same weighted average, in numbers.
:::
:::

### Three steps, and a loop
{fill: center}

::: flow | | 
- **1 · Modelling** | a full joint probability model over everything observable and unobservable
- **2 · Inference** | compute and read the posterior over the unobserved quantities of interest
- !**3 · Checking** | does the model fit, and how sensitive is it to the assumptions of step 1?
:::

::: small
Step 3 loops back to step 1. A Bayesian analysis is not finished when the posterior is computed — it is finished when the model has survived being doubted.
:::

## Act 3 — collapsing to a point: MLE, MAP, regularisation
{short: ACT 3, num: Act 3}

**Q3.** Sometimes one number is required. There are two principled ways to extract one — and one of them has a familiar face.

### When you must commit — MLE vs. MAP
{q: 3}

::: qstrip
:::

::: cols
::: col Maximum likelihood
$$\hat\theta = \argmax_\theta\; p(y\mid\theta)$$

Ignores the prior. The frequentist's point estimate — and, as the coin showed, the relative frequency.
:::
::: col.accent Maximum a posteriori
$$\hat\theta = \argmax_\theta\; p(\theta\mid y) \;\propto\; \argmax_\theta\; p(y\mid\theta)\,p(\theta)$$

The peak of the posterior. MLE ==plus a prior term==.
:::
:::

::: reveal
With abundant data the two coincide — the likelihood swamps the prior. With scarce data the prior is what keeps the estimate sane.
:::

::: reveal
::: keypoint
And that prior term has ==a familiar face.==
:::
:::

### Linear regression, and the same fit four times

::: lede
The rest of this act is one worked problem — fit a line — approached from four directions that turn out to be the same direction.
:::

| # | Starting point | Result |
|---|---|---|
| 1 | **Optimisation.** $\min_w \tfrac12\lVert y-\mathbf{X}w\rVert_2^2$ | normal equation $\hat w = (\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top y$ |
| 2 | **MLE.** $y_i = w^\top x_i + \epsilon_i$, $\epsilon_i\sim\mathcal{N}(0,\sigma^2)$ | $\log p(y\mid \mathbf{X},w) = \text{const} - \tfrac{1}{\sigma^2}J(w)$ — ==the same $\hat w$== |
| 3 | **MAP.** add a Gaussian prior on $w$ | ridge, $\hat w = (\mathbf{X}^\top\mathbf{X}+\lambda I)^{-1}\mathbf{X}^\top y$ |
| 4 | **Full Bayes.** keep the whole posterior over $w$ | a predictive *distribution*, with error bars |

::: reveal
::: small
Maximising the log likelihood with respect to $w$ ==is== minimising the squared error. Least squares was never a separate idea from maximum likelihood; it is Gaussian-noise MLE wearing different clothes.
:::
:::

### The Bayesian fit, as the data arrives
{fill: top}

::: widget bayes-regression
Draw $w\sim p(w\mid \mathbf{X},y)=\mathcal{N}(\mu_w,\Sigma_w)$ and plot the line. With two points the posterior is broad and the sampled lines fan out; with a hundred it has collapsed onto one answer and ML and MAP agree. ==What full Bayes keeps and the point estimates throw away is exactly that fan.==
:::

### The unification — regularisation *is* a prior

| Estimator | Optimisation view | Bayesian view (MAP with a prior) |
|---|---|---|
| ordinary least squares | $\min_w \lVert y-\mathbf{X}w\rVert_2^2$ | MLE, Gaussian noise, no prior |
| **Ridge** | $\min_w \lVert y-\mathbf{X}w\rVert_2^2 + \lambda\lVert w\rVert_2^2$ | MAP with a ==Gaussian== prior on $w$ |
| **Lasso** | $\min_w \lVert y-\mathbf{X}w\rVert_2^2 + \lambda\lVert w\rVert_1$ | MAP with a ==Laplace== prior on $w$ |

::: reveal
::: block The punchline
A regulariser is not an ad-hoc penalty — it is ==the log of a prior==. Ridge's $\ell_2$ term is a Gaussian prior; Lasso's $\ell_1$ term is a Laplace prior, whose sharp peak at zero is what produces sparsity.
:::
:::

### Two views of the same picture
{fill: top}

::: widget ridge-lasso-prior
On the left, the optimisation view: level sets of the squared error meeting a budget set — a ball for $\ell_2$, a diamond for $\ell_1$, whose corners are why Lasso zeroes coefficients. On the right, the Bayesian view: the very same $\lambda$ read as ==the width of a prior==. Turn the dial and watch both stories move together.
:::

::: reveal
::: small
This is the lecture's deepest bridge: ==the optimisation world and the Bayesian world are the same world==, seen through different lenses. "Add a penalty to avoid overfitting" and "encode a prior belief about the weights" are one act.
:::
:::

## Act 4 — predicting with uncertainty intact
{short: ACT 4, num: Act 4}

**Q4.** A point estimate predicts with the best $\theta$. Full Bayes predicts with all of them.

### Full Bayes — integrate, don't plug in
{q: 4}

::: qstrip
:::

MLE and MAP collapse the posterior to a point and then predict, discarding everything else. The fully Bayesian prediction ==averages over the entire posterior==:

$$p(\hat y \mid y) = \int p(\hat y\mid\theta)\; \underbrace{p(\theta\mid y)}_{\text{posterior}}\; d\theta$$

::: reveal
::: keypoint
Don't predict with the *best* $\theta$ — predict with ==all $\theta$, weighted by belief.==
:::
:::

### What the integral buys, and what it costs

- it ==propagates uncertainty== into the prediction: the predictive distribution is wider exactly when the posterior is;
- it guards against the overconfidence of a single fitted parameter;
- the price is the integral — closed form for conjugate models, otherwise approximated by ==sampling== (MCMC) or variational methods.

::: reveal
And for conjugate pairs the answer is a named distribution, every time:

| Model | Prior predictive $p(y)$ | Posterior predictive $p(\hat y\mid y)$ |
|---|---|---|
| Binomial–Beta | Beta–Binomial$(y\mid n,\alpha,\beta)$ | Beta–Binomial$(\hat y\mid n,\alpha+y,\beta+n-y)$ |
| Poisson–Gamma | Negative binomial$(y\mid\alpha,\beta)$ | Negative binomial$(\hat y\mid \alpha+n\bar y,\beta+n)$ |
| Normal–Normal | $\mathcal{N}(y\mid\mu_0,\ \sigma_Y^2+\tau_0^2)$ | $\mathcal{N}(\hat y\mid\mu_1,\ \sigma_Y^2+\tau_1^2)$ |
:::

### The Normal case, read as precision

For $Y_i\sim\mathcal{N}(\theta,\sigma_Y^2)$ with $\theta\sim\mathcal{N}(\mu_0,\tau_0^2)$, the posterior is $\mathcal{N}(\mu_1,\tau_1^2)$ with

$$\mu_1 = \frac{\dfrac{\mu_0}{\tau_0^2}+\dfrac{n\bar y}{\sigma_Y^2}}{\dfrac{1}{\tau_0^2}+\dfrac{n}{\sigma_Y^2}}, \qquad \hl{\frac{1}{\tau_1^2} = \frac{1}{\tau_0^2}+\frac{n}{\sigma_Y^2}}$$

::: reveal
==Precisions add.== The posterior mean is the prior mean and the data mean weighted by their precisions; the posterior precision is the prior's plus the data's. Sharpen the prior ($\tau_0\downarrow$) and it pulls harder; sharpen the measurements ($\sigma_Y\downarrow$) or take more of them ($n\uparrow$) and the data pulls harder.
:::

::: reveal
::: small
And the predictive variance is $\sigma_Y^2+\tau_1^2$ — measurement noise you can never remove, plus parameter uncertainty you can. The two kinds of uncertainty Lecture 0 named, arriving as two separate terms in one formula. When the "parameter" is an entire function, this same predictive integral becomes Gaussian-process regression — the core of Lecture 4.
:::
:::

## Closing
{short: CLOSING}

Belief established. Now: what if there are many unknowns, and they interact?

### Where we are — belief established, complexity ahead

::: table center
|   | Model-based | Data-driven |
|---|---|---|
| **Static, single** | optimisation *(Lec 1 ✓)* | ==Bayesian statistics *(Lec 2 ✓)*== → Lec 3–4 |
:::

::: reveal
We can now hold and update a belief over a parameter, collapse it when forced (MLE / MAP), and predict with it intact (full Bayes). But we modelled belief over ==one parameter (vector)==.
:::

::: reveal
::: small
Real systems have *many* interacting random variables — failures that cause failures, symptoms that imply causes. A joint distribution over them is exponentially large. How do we represent, and reason within, belief over a whole system? That is Lecture 3: ==a belief about many things is a graph.==
:::
:::

### Frequentists estimate a number; Bayesians carry a distribution.
{layout: standout}

A prior turned by data into a posterior, collapsed to a point only when forced — and even then, a prior in disguise — and integrated over when prediction must stay honest.

### Questions?
{layout: standout}

The single idea — *the unknown is itself a distribution that data sharpens* — is the seed of everything data-driven this term. Regularisation was a prior; a Gaussian process will be a prior over functions; a belief state will be a prior carried through time.

## Appendix — backup slides
{short: APPENDIX}

Complete derivations, kept out of the narrative.

### Backup 1 — the Beta–Binomial pipeline, end to end
{fill: top}

**Likelihood.** $Y\sim\mathrm{Bin}(n,\theta)$, so $p(y\mid\theta)=\binom{n}{y}\theta^y(1-\theta)^{n-y}$.
**Prior.** $\theta\sim\mathrm{Beta}(\alpha,\beta)$, so $p(\theta)=\dfrac{\Gamma(\alpha+\beta)}{\Gamma(\alpha)\Gamma(\beta)}\theta^{\alpha-1}(1-\theta)^{\beta-1}$.

**Posterior.** Drop every factor free of $\theta$:

$$p(\theta\mid y)\propto \theta^{y}(1-\theta)^{n-y}\,\theta^{\alpha-1}(1-\theta)^{\beta-1} = \theta^{\alpha+y-1}(1-\theta)^{\beta+n-y-1} = \mathrm{Beta}(\alpha+y,\ \beta+n-y)$$

**Prior predictive.** Integrating the likelihood against the prior and collecting Gamma functions gives $p(y)=\text{Beta–Binomial}(y\mid n,\alpha,\beta)$ — a binomial whose success probability is itself random and Beta-distributed.

**Posterior predictive.** The same integral with $\alpha,\beta$ replaced by their updated values: $p(\hat y\mid y)=\text{Beta–Binomial}(\hat y\mid n,\alpha+y,\beta+n-y)$.

::: small
**Moments.** $\E[\theta\mid y]=\dfrac{\alpha+y}{\alpha+\beta+n}$ and $\mathrm{Var}(\theta\mid y)=\dfrac{\E[\theta\mid y](1-\E[\theta\mid y])}{\alpha+\beta+n+1}$, so as $n\to\infty$ the variance falls like $p(1-p)/n$ — the familiar frequentist rate, recovered.
:::

### Backup 2 — Lasso as MAP with a Laplace prior
{fill: top}

Gaussian likelihood $p(y\mid \mathbf{X},w)=\prod_i \mathcal{N}(y_i\mid w^\top x_i,\sigma^2)$ and Laplace prior $p(w)=\prod_k \frac{\lambda}{2\sqrt{\tau^2}}\exp\!\big(-\frac{\lambda}{\sqrt{\tau^2}}|w_k|\big)$.

Posterior $\propto$ likelihood $\times$ prior; take logs:

$$\log p(w\mid \mathbf{X},y) = -\frac{1}{2\sigma^2}\sum_i (y_i-w^\top x_i)^2 \;-\; \frac{\lambda}{\sqrt{\tau^2}}\sum_k |w_k| \;+\; \text{const}$$

Maximising over $w$ is therefore

$$\hat w = \argmax_w \log p(w\mid \mathbf{X},y) = \argmin_w \lVert y - \mathbf{X}w\rVert_2^2 + \lambda_1\lVert w\rVert_1 \qquad \blacksquare$$

which is exactly Lasso; a Gaussian prior gives the $\ell_2$ (ridge) penalty by the identical argument.

::: small
**Why $\ell_1$ is sparse.** The Laplace prior puts a sharp peak of mass at zero, so the MAP drives weak coefficients exactly to $0$ — automatic feature selection, arrived at from a belief rather than a heuristic.
:::

### Backup 3 — the Bayesian posterior over regression weights
{fill: top}

With likelihood $p(y\mid w)=\frac{1}{(2\pi\sigma^2)^{m/2}}\exp\!\big(-\frac{1}{2\sigma^2}\sum_i (y_i-w^\top x_i)^2\big)$ and prior $p(w)=\mathcal{N}(w\mid \mathbf{0},\alpha^2 I)$, the log posterior collects into a quadratic in $w$:

$$\log p(w\mid \mathbf{X},y) = -\frac{1}{2\sigma^2}y^\top y + \frac{1}{\sigma^2}y^\top \mathbf{X}w - \frac12 w^\top\Big[\frac{1}{\sigma^2}\mathbf{X}^\top\mathbf{X} + \frac{1}{\alpha^2}I\Big]w + \text{const}$$

A quadratic log density is a Gaussian, so

$$p(w\mid \mathbf{X},y)=\mathcal{N}(w\mid \mu_w,\Sigma_w),\qquad \Sigma_w = \Big[\tfrac{1}{\sigma^2}\mathbf{X}^\top\mathbf{X}+\tfrac{1}{\alpha^2}I\Big]^{-1},\qquad \mu_w = \Sigma_w\Big(\tfrac{1}{\sigma^2}\mathbf{X}^\top y\Big)$$

::: small
$\mu_w$ is the ridge solution with $\lambda=\sigma^2/\alpha^2$ — the MAP is the posterior's peak, as it must be. What the Gaussian adds is $\Sigma_w$: the *width* of the answer, which is what the sampled lines in the Act 3 widget are drawn from, and what Lecture 4 will use to decide where to sample next.
:::
