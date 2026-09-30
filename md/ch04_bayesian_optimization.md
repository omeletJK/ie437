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

### Where we are — belief stops observing and starts choosing
| Previous step | This chapter's question |
|---|---|
| Lectures 2–3 supplied probability models and conditional updates. | Now choose the next expensive measurement. |

An unknown objective can be observed at selected inputs. Fit a GP, choose with an acquisition rule, measure and update.

::: keypoint
Choose the next experiment from a stated acquisition rule and weigh it against the budget.
:::

### Learning route — predict, choose, pay for one measurement
**Bring:** Gaussian conditioning and regression from Lectures 2–3.

| First pass | What to do |
|---|---|
| **Follow the idea** | GP update → acquisition choice → evaluate → update again |
| **Work without the solution** | Choose the next experiment from a stated acquisition rule and weigh it against the budget. |
| **Return later** | Multi-output kernels, and how EHVI is computed beyond two objectives, are references. |

::: keypoint
For the temperature thread: **predict → calculate → reveal and check → change one condition**. Complete the core calculation before reading the research extensions.
:::

## Act 1 — a belief over an unknown function
{short: ACT 1, num: Act 1}

**Q1.** You cannot afford to probe $f$ everywhere. So carry a distribution over the functions it might be.

### The setting — unknown, expensive, and every query counts
::: lede
Lecture 1 assumed we could evaluate the objective and use its mathematical structure. Here a new evaluation is expensive, and a formula or gradient for the true objective is unavailable.
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
The setting makes an adaptive loop useful: spend the next expensive evaluation using what earlier evaluations taught us. A fixed experimental design is another option; BO uses feedback to target promising or informative regions. Lecture 5 considers the separate restriction that no new evaluations are allowed.
:::
:::

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
Chapter 2 ended on the Normal–Normal case and noted that the predictive variance splits into measurement noise you can never remove plus parameter uncertainty you can. ==Replace the parameter by an entire function and that same predictive integral is Gaussian-process regression.== Gaussian conjugacy gives the closed-form posterior used here. Other likelihoods are possible but may require approximate inference.
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

**Q2.** A GP prior and Gaussian observation model give a closed-form posterior. The mean, kernel and noise model each express a modelling assumption.

### The Gaussian process — a prior over functions
{q: 2}

::: qstrip
:::

A **Gaussian process** is a collection of random variables $\{f(x): x\in\mathcal X\}$ such that ==every finite subcollection is jointly Gaussian.== Written out, for any $x_1,\dots,x_n$:

$$\begin{bmatrix} f(x_1)\\ \vdots \\ f(x_n)\end{bmatrix} \sim \mathcal N\!\left( \begin{bmatrix} m(x_1)\\ \vdots\\ m(x_n)\end{bmatrix}, \; \begin{bmatrix} k(x_1,x_1) & \cdots & k(x_1,x_n)\\ \vdots & \ddots & \vdots \\ k(x_n,x_1) & \cdots & k(x_n,x_n)\end{bmatrix}\right), \qquad f(\cdot)\sim\mathcal{GP}\big(m(\cdot),k(\cdot,\cdot)\big)$$

::: cols
::: col The mean function
$m(x)=\E[f(x)]$ — the prior trend. We use $m\equiv0$ after centring the outputs for this derivation. The choice matters, especially far from the observed inputs.
:::
::: col.accent The covariance function
$k(x,x')=\E\big[(f(x)-m(x))(f(x')-m(x'))\big]$ — how strongly nearby points are tied together. It must make every $\mathbf K$ positive semidefinite. ==This is where all the modelling lives.==
:::
:::

::: reveal
::: small
A function drawn from a GP prior is, in the source's own phrase, *an extremely high-dimensional vector drawn from an extremely high-dimensional multivariate Gaussian*. A finite set of function values has a Gaussian joint distribution. The kernel specifies **covariances**, not the missing-edge conditional independences of a Bayesian network.
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

### A GP update with just two numbers
{sub: the source's correlation example, calculated explicitly}

Assume $f_1,f_2$ have zero mean, unit variance and correlation $\rho$. We observe $f_1=-0.313$ without noise.

$$\mathbb E[f_2\mid f_1]=\rho(-0.313),\qquad\operatorname{Var}(f_2\mid f_1)=1-\rho^2.$$

| Relationship to the measured point | Correlation | Posterior mean | Posterior variance |
|---|---|---|---|
| Nearby | $0.966$ | $-0.302$ | $0.0668$ |
| Farther away | $0.573$ | $-0.179$ | $0.6717$ |

::: keypoint
==A stronger correlation transfers more information.== The next matrix formula performs this same calculation using many measurements at once.
:::

### GP regression, two ways — the setup
{sub: p. 15 of the source — a distribution over functions, used as a Bayesian prior}

Observe $\mathcal D=\{(x_i,y_i)\}_{i=1}^n$, collected as $\mathbf X$ and $\mathbf y$. Two ingredients, both Gaussian:

::: cols
::: col Prior — over the function
$$p(\mathbf f)=\mathcal{GP}\big(m(\cdot),k(\cdot,\cdot)\big)$$

At the $n$ training inputs: $\mathbf f_{1:n}\sim\mathcal N(\mathbf m,\mathbf K)$, $K_{ij}=k(x_i,x_j)$. From here on ==$m(\cdot)=0$== — subtract any known trend first.
:::
::: col Likelihood — how we see it
$$y_i=f_i+\epsilon_i,\quad \epsilon_i\overset{\text{iid}}{\sim}\mathcal N(0,\sigma_\epsilon^2)$$

$$p(\mathbf y\mid\mathbf f)=\mathcal N(\mathbf f_{1:n},\sigma_\epsilon^2\mathbf I)$$
:::
:::

::: reveal
We want $f^*=f(x^*)$ at a new input $x^*$. There are two ways to get there, and ==they land on the same answer==:

- **A · the Bayesian view** — exactly Lecture 2's posterior predictive, with $\mathbf f$ in the place of $\theta$.
- **B · the Gaussian shortcut** — write one joint Gaussian and condition it. This is how it is computed.
:::

### A1 — the graphical model
{sub: p. 14 of the Lecture 2 source, redrawn — θ becomes the latent function values}

<div class="routes"><div class="rlane">A · Bayesian view</div><div class="rstep on">A1  Graph</div><div class="rarr"></div><div class="rstep">A2  Integrate f out</div><div class="rbrace"></div><div class="rmeet">same posterior<br>p(f* | x*, X, y)</div><div class="rlane">B · Gaussian shortcut</div><div class="rstep">B1  Joint</div><div class="rarr"></div><div class="rstep">B2  Condition</div></div>

::: widget gp-pgm
The latent values $f_1,\dots,f_n,f^*$ are coupled by the GP prior; each training value is seen once, through noise. The query $f^*$ is never observed. Reading the arrows: ==$f^*\perp\mathbf y\mid\mathbf f$== — the data can reach the prediction only through the function values beneath it.
:::

### A2 — integrate the function values out
{sub: p. 15 of the source — Lecture 2's posterior predictive, verbatim}

<div class="routes"><div class="rlane">A · Bayesian view</div><div class="rstep done">A1  Graph</div><div class="rarr"></div><div class="rstep on">A2  Integrate f out</div><div class="rbrace"></div><div class="rmeet">same posterior<br>p(f* | x*, X, y)</div><div class="rlane">B · Gaussian shortcut</div><div class="rstep">B1  Joint</div><div class="rarr"></div><div class="rstep">B2  Condition</div></div>

::: cols
::: col Lecture 2 — a parameter
$$p(\hat y\mid y)=\int_\theta p(\hat y\mid\theta)\,p(\theta\mid y)\,d\theta$$
:::
::: col.accent Lecture 4 — a function
$$p(f^*\mid x^*,\mathbf X,\mathbf y)=\int_{\mathbf f} \hl{p(f^*\mid x^*,\mathbf f)}\,\hl{p(\mathbf f\mid\mathbf X,\mathbf y)}\,d\mathbf f$$
:::
:::

::: reveal
| factor | what it is | why it has this form |
|---|---|---|
| $p(\mathbf f\mid\mathbf X,\mathbf y)\propto p(\mathbf y\mid\mathbf f)\,p(\mathbf f)$ | the **posterior** over the function values | Bayes' rule — Gaussian likelihood times Gaussian prior |
| $p(f^*\mid x^*,\mathbf f)$ | the **GP prior** read at $x^*$, given $\mathbf f$ | $f^*\perp\mathbf y\mid\mathbf f$ from A1 lets $\mathbf y$ drop out |
:::

::: reveal
::: keypoint
Integrate $\mathbf f$ out and what remains depends ==only on the data $(\mathbf X,\mathbf y)$ and the query $x^*$==. Every factor is Gaussian, so the integral closes — route B finds its value without doing it.
:::
:::

### B1 — the joint of the data and the query
{sub: p. 37 of the source — one Gaussian over everything we see and everything we want}

<div class="routes"><div class="rlane">A · Bayesian view</div><div class="rstep done">A1  Graph</div><div class="rarr"></div><div class="rstep done">A2  Integrate f out</div><div class="rbrace"></div><div class="rmeet">same posterior<br>p(f* | x*, X, y)</div><div class="rlane">B · Gaussian shortcut</div><div class="rstep on">B1  Joint</div><div class="rarr"></div><div class="rstep">B2  Condition</div></div>

Stack the observations and the query value. They are jointly Gaussian — fill in the three blocks:

$$\begin{bmatrix}\mathbf y_{1:n}\\ f^*\end{bmatrix}\sim\mathcal N\!\left(\mathbf 0,\begin{bmatrix}\mathbf K+\sigma_\epsilon^2\mathbf I & \mathbf k\\ \mathbf k^\top & k(x^*,x^*)\end{bmatrix}\right)$$

::: reveal
| block | where it comes from |
|---|---|
| $\mathrm{cov}(\mathbf y,\mathbf y)=\mathrm{cov}(\mathbf f)+\mathrm{cov}(\boldsymbol\epsilon)=\hl{\mathbf K+\sigma_\epsilon^2\mathbf I}$ | $\mathbf y=\mathbf f+\boldsymbol\epsilon$, two independent Gaussians — ==their covariances add== |
| $\mathrm{cov}(\mathbf y,f^*)=\mathrm{cov}(\mathbf f+\boldsymbol\epsilon,\,f^*)=\mathbf k$, $k_i=k(x_i,x^*)$ | the noise is independent of $f^*$, so it drops out |
| $\mathrm{var}(f^*)=k(x^*,x^*)$ | the prior at the query |
:::

::: reveal
::: small
Noise sits on the $\mathbf y$–$\mathbf y$ block only: we predict the latent $f(x^*)$, not a future noisy reading of it. No separate $p(\mathbf y)$ is needed here — only this one block of the joint.
:::
:::

### B2 — condition on the data
{sub: pp. 38–39 of the source — Property 4, applied block by block}

<div class="routes"><div class="rlane">A · Bayesian view</div><div class="rstep done">A1  Graph</div><div class="rarr"></div><div class="rstep done">A2  Integrate f out</div><div class="rbrace"></div><div class="rmeet">same posterior<br>p(f* | x*, X, y)</div><div class="rlane">B · Gaussian shortcut</div><div class="rstep done">B1  Joint</div><div class="rarr"></div><div class="rstep on">B2  Condition</div></div>

::: cols
::: col Property 4 — Gaussian conditional
$$\begin{bmatrix}Y_1\\Y_2\end{bmatrix}\sim\mathcal N\!\left(\begin{bmatrix}\mu_1\\\mu_2\end{bmatrix},\begin{bmatrix}\Sigma_{11}&\Sigma_{12}\\\Sigma_{21}&\Sigma_{22}\end{bmatrix}\right)$$

$$Y_2\mid Y_1\!=\!y \sim \mathcal N\big(\mu_2+\Sigma_{21}\Sigma_{11}^{-1}(y-\mu_1),\; \Sigma_{22}-\Sigma_{21}\Sigma_{11}^{-1}\Sigma_{12}\big)$$
:::
::: col.accent Match the blocks from B1
Set $Y_1=\mathbf y_{1:n}$, $Y_2=f^*$, and both means to zero:

| Property 4 | GP |
|---|---|
| $\Sigma_{11}$ | $\hl{\mathbf K+\sigma_\epsilon^2\mathbf I}$ |
| $\Sigma_{21}=\Sigma_{12}^\top$ | $\hl{\mathbf k^\top}$ |
| $\Sigma_{22}$ | $k(x^*,x^*)$ |
:::
:::

::: reveal
Substitute, and the **posterior predictive distribution** falls out:

$$\begin{gathered}p(f^*\mid x^*,\mathcal D)=\mathcal N\big(\mu(x^*\mid\mathcal D),\,\sigma^2(x^*\mid\mathcal D)\big)\\[4pt] \hl{\mu(x^*\mid\mathcal D) = \mathbf k^\top(\mathbf K+\sigma_\epsilon^2 \mathbf I)^{-1}\mathbf y_{1:n}},\qquad \hl{\sigma^2(x^*\mid\mathcal D) = k(x^*,x^*) - \mathbf k^\top(\mathbf K+\sigma_\epsilon^2\mathbf I)^{-1}\mathbf k}\end{gathered}$$
:::

### The posterior predictive — mean and uncertainty, in closed form
{sub: what both routes bought}

$$\mu(x\mid\mathcal D) = \mathbf k^\top(\mathbf K+\sigma_\epsilon^2 \mathbf I)^{-1}\mathbf y_{1:n}, \qquad \sigma^2(x\mid\mathcal D) = k(x,x) - \mathbf k^\top(\mathbf K+\sigma_\epsilon^2\mathbf I)^{-1}\mathbf k$$

::: cols
::: col A · the Bayesian view
Posterior over $\mathbf f$, then integrate $\mathbf f$ out. Says ==what the prediction *is*==: Lecture 2's posterior predictive over a function.
:::
::: col.accent B · the Gaussian shortcut
One joint, one conditioning. Says ==how to *compute* it==: a single linear solve with $\mathbf K+\sigma_\epsilon^2\mathbf I$.
:::
:::

::: reveal
::: keypoint
The GP hands us, at every $x$, both a best guess *and* ==how much to trust it== — and that pair is exactly what the next decision needs.
:::
:::

::: reveal
::: small
Read the two formulas. The mean is a **linear combination of the observed $y$'s**, with weights set by the kernel — they need not be positive or sum to one. The variance starts at the prior value $k(x,x)$ and is reduced by $\mathbf k^\top(\cdot)^{-1}\mathbf k$, large near data and vanishing far from it. For a fixed kernel and noise level, $\sigma^2$ ==does not depend on $\mathbf y$==: where the GP is uncertain is fixed the moment you choose *where* to look.
:::
:::

### Check — route A, carried out, lands on route B
{sub: two Gaussians and one integral — the algebra closes, math: compact}

Write $\mathbf S=\sigma_\epsilon^2\mathbf I$ and $k^{**}=k(x^*,x^*)$. Both factors of A2 are Gaussian:

$$\mathbf f\mid\mathbf y\sim\mathcal N\big(\mathbf K(\mathbf K+\mathbf S)^{-1}\mathbf y,\;\mathbf K-\mathbf K(\mathbf K+\mathbf S)^{-1}\mathbf K\big),\qquad f^*\mid\mathbf f\sim\mathcal N\big(\mathbf k^\top\mathbf K^{-1}\mathbf f,\;k^{**}-\mathbf k^\top\mathbf K^{-1}\mathbf k\big)$$

::: reveal
$f^*$ is a linear map of $\mathbf f$ plus independent noise, so its mean passes through and its variance adds:

$$\mu=\mathbf k^\top\mathbf K^{-1}\,\mathbf K(\mathbf K+\mathbf S)^{-1}\mathbf y=\hl{\mathbf k^\top(\mathbf K+\mathbf S)^{-1}\mathbf y}$$

$$\sigma^2=k^{**}-\mathbf k^\top\mathbf K^{-1}\mathbf k+\mathbf k^\top\mathbf K^{-1}\big[\mathbf K-\mathbf K(\mathbf K+\mathbf S)^{-1}\mathbf K\big]\mathbf K^{-1}\mathbf k=\hl{k^{**}-\mathbf k^\top(\mathbf K+\mathbf S)^{-1}\mathbf k}$$
:::

::: reveal
::: small
The $\mathbf k^\top\mathbf K^{-1}\mathbf k$ terms cancel, leaving exactly route B. Checked numerically on six random points: the two routes agree to twelve decimal places. Route B is what you implement — it never forms $\mathbf K^{-1}$, only one solve with $\mathbf K+\mathbf S$.
:::
:::

### Read the GP formula — what each object means
For $n$ observations and one query input $x$, $\mathbf K$ is an $n\times n$ matrix with $K_{ij}=k(x_i,x_j)$; $\mathbf k$ is a length-$n$ vector with $k_i=k(x_i,x)$.

::: cols c2
::: col One noisy observation
Use prior variances 1, covariance $k(x_1,x)=0.8$, noise variance $0.25$, and observe $y_1=1$.

$$\mu(x)=\frac{0.8}{1+0.25}(1)=0.64.$$

$$\sigma_f^2(x)=1-\frac{0.8^2}{1.25}=0.488.$$
:::
::: col.accent A function value or a new measurement?
The formula predicts the latent $f(x)$.

For a future independent noisy measurement $y=f(x)+\epsilon$, add its noise:

$$\sigma_y^2(x)=0.488+0.25=0.738.$$
:::
:::

::: keypoint
==Uncertainty about the function and noise in a new measurement are different.== Numerically, solve linear systems with $\mathbf K+\sigma_\epsilon^2 I$ rather than explicitly forming its inverse.
:::

### The kernel is the assumption
{sub: pp. 22–25 of the source — every kernel is a different belief about f, visible before any data}

::: widget kernel-gallery
Pick a kernel and move the length scale. Left: the covariance $k(x,x')$ over the input range — a band along the diagonal says *nearby points agree*, stripes say *the pattern repeats*. Right: four functions the prior considers typical, drawn from ==the same random numbers for every kernel==, so what changes is the assumption alone. **ARD** is the SE kernel with one $\lambda_d$ per input dimension; a large $\lambda_d$ switches that dimension off.
:::

::: wformulas
- $$k_{\text{SE}}(x,x')=\sigma_0^2\exp\!\Big(-\frac{r^2}{2\lambda^2}\Big),\qquad r=|x-x'|$$
- $$k_{5/2}(x,x')=\sigma_0^2\Big(1+\frac{\sqrt5\,r}{\lambda}+\frac{5r^2}{3\lambda^2}\Big)\exp\!\Big(-\frac{\sqrt5\,r}{\lambda}\Big)$$
- $$k_{3/2}(x,x')=\sigma_0^2\Big(1+\frac{\sqrt3\,r}{\lambda}\Big)\exp\!\Big(-\frac{\sqrt3\,r}{\lambda}\Big)$$
- $$k_{\text{per}}(x,x')=\sigma_0^2\exp\!\Big(-\frac{2\sin^2(\pi r/p)}{\lambda^2}\Big),\qquad p=\text{period}$$
- $$k_{\text{lin}}(x,x')=\sigma_b^2+\sigma_v^2\,x\,x'$$
- $$k(x,x')=k_{\text{SE}}(x,x')+k_{\text{lin}}(x,x')\qquad\text{sum: independent components add}$$
- $$k(x,x')=k_{\text{SE}}(x,x')\cdot k_{\text{per}}(x,x')\qquad\text{product: both similarities required}$$
:::

### Fitting the kernel — maximise the marginal likelihood
{sub: p. 28 of the source — the hyperparameters are fitted, not chosen}

The kernel's knobs $\theta=(\sigma_\epsilon,\sigma_0,\boldsymbol\lambda)$ are chosen to make the observed data most probable, with $\mathbf f$ integrated out. Write $\mathbf C_\theta=\mathbf K_\theta+\sigma_\epsilon^2\mathbf I$, so that $\mathbf y\mid\theta\sim\mathcal N(\mathbf 0,\mathbf C_\theta)$:

$$\mathcal L(\theta)=\log p(\mathbf y\mid\theta)
=\underbrace{-\tfrac12\,\mathbf y^\top\mathbf C_\theta^{-1}\mathbf y}_{\mathcal F(\theta)\ :\ \hl{\text{data fit}}}\ \underbrace{-\,\tfrac12\log|\mathbf C_\theta|}_{\mathcal S(\theta)\ :\ \hl{\text{simplicity}}}\ \underbrace{-\ \tfrac n2\log 2\pi}_{\text{constant}}
\qquad\Longrightarrow\qquad
\theta^*=\argmax_\theta\ \big[\,\mathcal F(\theta)+\mathcal S(\theta)\,\big]$$

::: reveal
::: cols
::: col Data fit $\mathcal F(\theta)$ — always $\le 0$
How typical the observed $\mathbf y$ is under $\mathcal N(\mathbf 0,\mathbf C_\theta)$. A flexible kernel — short $\lambda$ — can bend to any $\mathbf y$ and keeps $\mathcal F$ near $0$; a rigid one — long $\lambda$ — cannot, and $\mathcal F$ falls.
:::
::: col.accent Simplicity $\mathcal S(\theta)$
$\log|\mathbf C_\theta|$ is the log-volume of datasets the prior spreads itself over. With the minus sign, a kernel prepared for *fewer* datasets — long $\lambda$ — scores ==higher==. Rasmussen & Williams call $+\tfrac12\log|\mathbf C_\theta|$ the *complexity penalty*; $\mathcal S$ is its negative.
:::
:::
:::

::: reveal
::: keypoint
Both terms are **larger-is-better**, but ==no $\theta$ maximises both==: as $\lambda$ grows, $\mathcal S$ rises and $\mathcal F$ falls. So we maximise their **sum**, and $\theta^*$ is the best trade-off — not the maximiser of either term. The constant does not depend on $\theta$ and never moves $\theta^*$.
:::
:::

### Why the two terms must disagree
{sub: probability has to sum to one — and Occam's razor falls out of that}

A kernel is a claim about which datasets are plausible, and that claim is a **distribution**: its total mass is fixed at $1$. So being ready for more costs you on each.

::: cols c2
::: col A flexible kernel — short $\lambda$
Prepared for a huge variety of $\mathbf y$. It must spread one unit of probability thinly, so the particular $\mathbf y$ you saw receives ==a small share==.

It can bend to anything, and is rewarded for nothing.
:::
::: col.accent A rigid kernel — long $\lambda$
Prepared for very few $\mathbf y$. If yours is among them it receives ==a large share==; if it is not, almost none.

Simplicity pays — right up until it cannot reach the data.
:::
:::

::: reveal
::: keypoint
==Occam's razor is not imposed here; it falls out of normalisation.== $\mathcal F$ asks *did it explain my data?*; $\mathcal S$ asks *how little else was it prepared to explain?*
:::
:::

::: reveal
::: small
In symbols: as $\lambda$ grows, $\mathcal S(\theta)$ rises and $\mathcal F(\theta)$ falls. The widget two slides on draws exactly these two curves and their sum $\mathcal L(\theta)$.
:::
:::

### Why the *marginal* likelihood — and not the likelihood
{sub: the question every student should ask of the previous slide}

The likelihood $p(\mathbf y\mid\mathbf f,\sigma_\epsilon)=\mathcal N(\mathbf f,\sigma_\epsilon^2\mathbf I)$ is right there. Why integrate $\mathbf f$ away first?

::: reveal
::: cols c3
::: col 1 · It cannot see the kernel
$\lambda$ and $\sigma_0$ do not appear in $p(\mathbf y\mid\mathbf f)$ at all — they live only in the prior $p(\mathbf f\mid\theta)$. ==Maximising the likelihood cannot choose a kernel.==
:::
::: col 2 · It has a trivial optimum
Maximise over $\mathbf f$ as well and the answer is $\mathbf f=\mathbf y$, $\sigma_\epsilon\to 0$: the function threads every noisy point and the likelihood goes to $+\infty$. ==Perfect fit, zero information.==
:::
::: col.accent 3 · The marginal asks the right question
$p(\mathbf y\mid\theta)=\int p(\mathbf y\mid\mathbf f)\,p(\mathbf f\mid\theta)\,d\mathbf f$ averages over every function the prior finds plausible: *how probable was this data under the kernel, before we saw it?*
:::
:::
:::

::: reveal
::: keypoint
A kernel that could explain anything spreads its probability thin and scores low; a rigid one cannot reach the data. ==The marginal likelihood is Occam's razor, built in== — no validation set required.
:::
:::

::: reveal
::: small
It is Lecture 2's **prior predictive** $p(y)=\int p(y\mid\theta)\,p(\theta)\,d\theta$ (p. 14 of that deck), with $\mathbf f$ in the place of $\theta$ — the same object that, in route A, the posterior was normalised by. The next slide shows $\mathcal F$ and $\mathcal S$ trading off as $\lambda$ moves.
:::
:::

### Turn the dial and watch the assumption move
::: widget gp-posterior
The same seven observations, one kernel, one knob: $\theta=\lambda$, with $\sigma_0=1$ and $\sigma_\epsilon=0.1$ held fixed. Short $\lambda$: the posterior spikes at each datum and falls back to the prior between them. Long $\lambda$: a near-straight line that cannot bend to the data. Right: ==$\mathcal S$ rises, $\mathcal F$ falls, and their sum peaks where neither is at its own maximum== — the Occam balance, drawn.
:::

::: wformulas
- $$\textcolor{#D97706}{\mathcal L(\lambda)}=\textcolor{#2563EB}{\underbrace{-\tfrac12\,\mathbf y^\top\mathbf C_\lambda^{-1}\mathbf y}_{\mathcal F(\lambda)\text{: data fit}}}\ \textcolor{#16A34A}{\underbrace{-\,\tfrac12\log|\mathbf C_\lambda|}_{\mathcal S(\lambda)\text{: simplicity}}}\ -\ \tfrac n2\log2\pi,\qquad \mathbf C_\lambda=\mathbf K_\lambda+\sigma_\epsilon^2\mathbf I$$
:::

### The original regression exercise — fit $x\sin x$ before optimising
{sub: Rebuilt illustration with stated settings}

::: figure gp-source-regression | 910
True function $f(x)=x\sin x$; five observations at $x=0,2,4,6,8$. This redrawing uses observed values equal to $f(x)$, a zero-mean SE prior, amplitude 5, length scale 1.5, and assumed observation-noise standard deviation 0.2.
:::

The line is the posterior mean. The band is **latent-function mean ± 2 standard deviations** under this model. An interval for a new noisy reading would be wider.

::: keypoint
Regression answers **what might the function be?** The next act adds the separate decision: **which input should we measure next?**
:::

::: note
Source alignment: original PDF pp. 40–45.
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

### Why not just fit a model and take its best point?
{sub: the obvious thing to do — done honestly, and watched}

An expensive $f$, three samples, and a regression through them. The regression has a highest point. Spend a query there, refit, and repeat. No uncertainty anywhere — just fit and exploit.

::: widget greedy-trap
The green dashes are the **true $f$** — drawn for us, invisible to the fit, which has only the three grey samples. ==Click the red peak== to spend a query on it, then the new peak, and again. The tall peak on the right stays in plain sight the whole time.
:::

::: note
Motivation for Act 3, placed before the acquisition function so the acquisition
function answers a question the class has already felt. The regression is kernel
ridge — the GP posterior mean of Act 2 with the variance thrown away — so the only
thing removed between this slide and the rest of the lecture is the uncertainty.
:::

### What went wrong — the model had no way to say "I have not looked here"
The greedy peak walks $2.98 \to 2.35 \to 2.30$ and then stops. Every later query lands on the same point, and nothing beyond $x=4.9$ is ever tried.

::: cols c2
::: col What it found
Best value **$1.481$** at $x=2.30$, against a true optimum of **$2.636$** at $x=7.67$ — ==44% short==, and the optimum sits $2.8$ away from the furthest point ever queried.
:::
::: col.accent Why it never went there
At $x=7.67$ the truth is $2.636$ and the fit predicts $-0.011$. We could see the peak; the fit could not. It does not report *ignorance* about the right half — it reports a **low value**, and a greedy rule has no reason to go and check.
:::
:::

::: reveal
::: keypoint
A point estimate cannot distinguish ==“I looked, and it is bad”== from ==“I never looked.”== Both come back as a small number. Exploration has to be paid for by something the fit alone does not contain.
:::
:::

::: reveal
::: small
This is not a failure of the optimiser — the argmax was computed exactly every time. It is a failure of what was handed to the optimiser. The fix is not a better search; it is a score that knows where the model is uncertain, which is the next slide.
:::
:::

::: note
All figures from the widget's own arithmetic, verified in node: kernel ridge with
$\ell=1.3$, $\lambda=10^{-3}$ on samples at $0.8, 3.3, 4.9$.
:::

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

### Where the number comes from — one area at one point
{sub: pp. 113–116 of the source, redrawn — probability of improvement}

At one input the GP is only a Gaussian, $f(x)\mid\mathcal D\sim\mathcal N(\mu(x),\sigma^2(x))$. Stand it on its side against the incumbent line and ask what fraction clears:

$$\mathrm{PI}(x)=\Pr\big(f(x)>f^{+}\big)=\int_{f^{+}}^{\infty} p(f\mid\mathcal D)\,\mathrm{d}f=\Phi\!\Big(\frac{\mu(x)-f^{+}}{\sigma(x)}\Big)$$

::: widget improvement-integral {"mode":"pi"}
The curve on the dashed column *is* the posterior at that $x$, sideways; shade it and the number appears. ==That one area is one point of the PI curve below== — move the candidate and watch the dot travel along it. And there is the complaint against PI: a sliver a thousandth above the line counts the same as a gain of half a unit, because the integrand is $p(f)$, which has no idea how high $f$ is.
:::

### Expected improvement — the same tail, weighted by how far it clears
{sub: pp. 118–123 of the source — five printed pages of one accumulating sum}

Keep the region; change what a sliver is worth — not $1$, but the improvement it delivers.

$$\mathrm{EI}(x)=\E\big[\max(0,f-f^{+})\big]=\int_{f^{+}}^{\infty}\hl{(f-f^{+})}\;p(f\mid\mathcal D)\,\mathrm{d}f
\;=\;\sigma(x)\big[z\,\Phi(z)+\phi(z)\big],\quad z=\frac{\mu(x)-f^{+}}{\sigma(x)}$$

::: widget improvement-integral {"mode":"ei"}
Each slice contributes ==the green length times the red one== — how far above $f^{+}$ it sits, times how probable that is. Watch the dot below climb onto $\mathrm{EI}(x)$ as the sum completes: ==the integral you are building is that point.== PI weighted every slice by $1$ and answered *how often*; EI weights each by $(f-f^{+})$, which is why it needs no margin $\xi$ to stop it hugging the incumbent.
:::

### Three scores
| | rule | reads as | leans |
|---|---|---|---|
| **Probability of improvement** | $\mathrm{PI}(x)=\Phi\!\big(\frac{\mu(x)-f^{+}-\xi}{\sigma(x)}\big)$ | *how likely* is any improvement at all | exploit |
| **Expected improvement** | $\mathrm{EI}(x)=\E\big[\max(0,f(x)-f^{+})\big]$ | how likely **and by how much** | balanced |
| **Upper confidence bound** | $\mathrm{UCB}(x)=\mu(x)+\kappa\,\sigma(x)$ | optimism, at an explicit price $\kappa$ | tunable |

Here $\Phi$ is the standard normal CDF, $\xi\ge0$ is an improvement margin, and $\kappa\ge0$ weights uncertainty. In the noiseless case, $f^{+}$ is the best observed value. With noise, the incumbent requires a noise-aware definition.

::: reveal
::: block Why PI plays it safe — and why EI exists
PI asks only ==*will* $x$ beat $f^{+}$?== — never *by how much*. A point just beside the incumbent, with $\mu$ a hair above $f^{+}$ and almost no uncertainty, wins almost surely: $\mathrm{PI}\approx1$, for a gain of almost nothing. An unexplored point that could win big — but whose mean is no better than $f^{+}$ — scores at most $\tfrac12$. So PI keeps taking the safe sliver: ==exploitation, not exploration==. It ranks bets by the chance of winning and ignores the payout.

**Patch:** count only wins larger than a margin $\xi$ — a knob to tune: too small and the search stays local, too large and it wanders. **Fix:** EI weights each win by its size $(f-f^{+})$, so a large, uncertain gain can outscore a certain sliver, with no knob at all.
:::
:::

### Choose between two candidate experiments
{sub: maximisation, incumbent 1, no improvement margin}

Suppose the posterior at candidate A is $\mathcal N(1.10,0.05^2)$ and at B is $\mathcal N(1.00,0.50^2)$. For UCB, use $\kappa=2$.

| Score | Candidate A | Candidate B | Choice |
|---|---|---|---|
| Mean only | $1.10$ | $1.00$ | A |
| PI | $\Phi(2)\approx0.977$ | $\Phi(0)=0.500$ | A |
| EI | $0.10\Phi(2)+0.05\phi(2)\approx0.1004$ | $0.50\phi(0)\approx0.1995$ | B |
| UCB | $1.10+2(0.05)=1.20$ | $1.00+2(0.50)=2.00$ | B |

::: keypoint
A offers a likely small gain. B offers a less certain but potentially larger gain. ==The acquisition rule determines which opportunity is worth the next measurement.==
:::

### The three rules, disagreeing
::: widget acquisition-zoo
One posterior, five observations, three scores drawn underneath it, each with its own $\argmax$ marked. At $\xi=0$, PI points at $x=0.630$ — hard against the incumbent at $0.65$, buying a near-certain sliver. EI points at $x=0.470$, into the wide-uncertainty valley where the true maximum actually is. Turn $\xi$ up and PI walks out to meet EI; turn $\kappa$ down and UCB collapses onto the greedy mean. ==The knob is the same knob in all three.==
:::

### Temperature thread — choose an informative heater experiment
{sub: shared teaching example · predict before revealing the calculation}

Room at 20 °C, target 22 °C, so the error is $x=-2$. A heater command $u\in[0,2]$ gives $x'=x+u$ at cost $c=(x')^2+u^2$. BO **never sees this formula** — it can only run an experiment and read the score $f=-c$. Its GP currently believes:

::: widget ucb-heater {"kappa":1}
**Predict:** at $\kappa=1$, does UCB $a(u)=\mu(u)+\kappa\sigma(u)$ pick **A** (better mean, narrow band) or **B** (worse mean, wide band)? Press → to add each candidate's optimism bonus $\kappa\sigma$, and → again to run the experiment it picks.
:::

::: keypoint
Acquisition value is not predicted reward or measured reward. A disappointing experiment can still provide useful information.
:::

### Try it — the exploration weight becomes zero
{sub: work independently · reveal only after writing an answer}

Same two beliefs, but now $\kappa=0$. **Which candidate is selected?** And if its measured score turns out better, **does that show $\kappa=0$ is the better policy?** Write both answers, then press →.

::: widget ucb-heater {"kappa":0}
After the reveal, drag $\kappa$: each line's slope is its $\sigma$, so ==the more uncertain candidate gains faster as $\kappa$ grows==, and the pick flips where the lines cross.
:::

::: keypoint
Distinguish a calculation about one acquisition choice from evidence about a whole optimization strategy.
:::

### Optimise the acquisition — an optimisation inside the optimisation
{sub: source pp. 139–140 · a cheap problem with an awkward shape}

Every round of BO ends in an inner problem, $\;x_{t+1}=\argmax_{x\in\mathcal X}\,a_t(x)$. One evaluation of $a_t$ is one GP prediction — $O(n^2)$ arithmetic, microseconds — against hours for one experiment. So we can afford ==thousands of evaluations of $a_t$==. What makes the problem awkward is its shape.

::: widget acq-optimisers {"mode":"surface"}
A real EI surface: a GP on twenty observations (crosses) in $[0,1]^2$, colour $\propto\sqrt{a_t}$. Drag the slice to see the profile. EI is $\approx 0$ wherever the GP is confident a point cannot beat $f^+$ — ==flat almost everywhere, with a few narrow peaks==.
:::

::: reveal
::: small
The source deck names three families of solver (p. 140): **gradient methods** (conjugate gradient, BFGS), **Lipschitz-based heuristics** (DIRECT) and **evolutionary algorithms** (CMA-ES). The next three slides run each one on this surface.
:::
:::

### Method 1 — gradient ascent, from many starts
{sub: source p. 141 · Wilson, Hutter & Deisenroth (2018); BoTorch, Balandat et al. (2020)}

EI is differentiable, and with $z=(\mu-f^+)/\sigma$ its gradient is closed-form:

$$\frac{\partial\,\mathrm{EI}}{\partial\mu}=\Phi(z),\quad \frac{\partial\,\mathrm{EI}}{\partial\sigma}=\phi(z)\quad\Longrightarrow\quad \nabla_x a_t(x)=\Phi(z)\,\nabla_x\mu(x)+\phi(z)\,\nabla_x\sigma(x),\qquad x\leftarrow x+\eta\,\nabla_x a_t(x)$$

::: widget acq-optimisers {"mode":"grad"}
Each → moves all six starts two ascent steps uphill; the last → keeps the best end point as $x_{t+1}$ (★). The dashed ring marks the true maximiser.
:::

::: note
Recipe as in BoTorch (Balandat et al., NeurIPS 2020). Why this inner problem matters, and gradient-based maximisation of acquisition functions: Wilson, Hutter & Deisenroth, *Maximizing acquisition functions for Bayesian optimization*, NeurIPS 2018.
:::

### Method 2 — DIRECT, dividing rectangles
{sub: source pp. 142–146 · Jones, Perttunen & Stuckman (1993); Finkel's user guide (2003)}

Sample the centre $c_j$ of each box; $d_j$ is its centre-to-corner size. If $a_t$ were $K$-Lipschitz, box $j$ could hold at most $a_t(c_j)+K d_j$. DIRECT divides every box that is best for ==*some*== $K\ge0$:

$$\exists K\ge0:\quad a_t(c_j)+K\,d_j\;\ge\;a_t(c_i)+K\,d_i\quad\text{for all boxes } i$$

::: widget acq-optimisers {"mode":"direct"}
Each → is one iteration: the yellow boxes are the potentially optimal ones, and they are trisected along their longest side. Right: every box as a point (size, value); the selected ones form the upper-right hull.
:::

### Method 3 — CMA-ES, moving a Gaussian
{sub: source pp. 147–149 · Hansen & Ostermeier (2001); Hansen, *The CMA Evolution Strategy: A Tutorial* (2016)}

Search with a distribution over inputs instead of a single point — **sample** $\lambda$ points, **select** the $\mu$ best, **re-fit** the Gaussian:

$$\begin{aligned}
&\mathbf x_k^{(g+1)}\sim\mathbf m^{(g)}+\sigma^{(g)}\mathcal N\big(\mathbf 0,\mathbf C^{(g)}\big),\qquad
\mathbf m^{(g+1)}=\mathbf m^{(g)}+c_m\textstyle\sum_{i=1}^{\mu}w_i\big(\mathbf x_{i:\lambda}^{(g+1)}-\mathbf m^{(g)}\big),\\
&\mathbf C_\mu^{(g+1)}=\textstyle\sum_{i=1}^{\mu}w_i\big(\mathbf x_{i:\lambda}^{(g+1)}-\mathbf m^{(g)}\big)\big(\mathbf x_{i:\lambda}^{(g+1)}-\mathbf m^{(g)}\big)^{\!\top}
\end{aligned}$$

::: widget acq-optimisers {"mode":"cma"}
Each → is one generation: grey ellipse = the current Gaussian ($2\sigma$), dots = its $\lambda=12$ samples, blue = the $\mu=6$ kept, amber = the re-fitted Gaussian. $x_{i:\lambda}$ is the $i$-th best sample; $w_i$ are decreasing weights.
:::

::: note
The widget uses the rank-$\mu$ estimation shown on the source's p. 148, blended with the previous $\mathbf C$; full CMA-ES adds evolution paths and step-size control.
:::

### Three optimisers, one inner problem
{sub: what each spends, and when to reach for it}

| | Gradient, multi-start | DIRECT | CMA-ES |
|---|---|---|---|
| uses | values **and gradients** of $a_t$ | values only | values only (ranks) |
| global? | only through the starts | yes, by design (bounded box) | partly — one Gaussian, restarts help |
| cost grows with dimension | mildly | fast | moderately |
| typical use | the default in BoTorch-style libraries | low-dimensional boxes | non-smooth or awkward $a_t$ |

::: flow
- **Many cheap scores** | evaluate $a_t$ hundreds or thousands of times
- **One selected input** | $x_{t+1}\approx\argmax_x a_t(x)$
- !**One expensive measurement** | query the real objective and update the data
:::

::: keypoint
DIRECT and CMA-ES could optimise $f$ itself when $f$ can be evaluated (source p. 140) — but they need hundreds of evaluations, exactly what an expensive $f$ cannot afford. ==BO spends those evaluations on $a_t$ instead==, and a locally optimised $a_t$ still costs only a slightly worse query, never an extra experiment.
:::

### The loop
{fill: center}

::: flow | | loop: new data, new posterior
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
Press *next query* and watch EI decide — or click either chart to spend a query where *you* think best, and compare it with EI's choice. The second query goes straight to the far boundary $x=-1$ — the mean there is unremarkable, but the uncertainty is enormous, and EI pays to find out. By the eighth the queries have collapsed onto $x=1.10$, and the EI peak has fallen from $0.48$ to $0.002$: ==the model expects little additional improvement under this acquisition rule.== A small EI is not a proof that the true global optimum has been found. The true maximum is $x^*=1.1010$, $f^*=2.2427$.
:::

::: small
The lecture's own run took eleven queries and stopped at $x=1.11$, $y=2.24$ — the same answer, to the precision the noise allows.
:::

### Two representative BO applications — the same loop, different experiments
{sub: EGO for expensive engineering functions · practical BO for ML hyperparameters}

| | Jones, Schonlau & Welch: EGO (1998) | Snoek, Larochelle & Adams (2012) |
|---|---|---|
| Decision $x$ | an engineering design | a model's hyperparameters |
| One expensive observation | a simulation or physical evaluation | train the model and measure validation performance |
| Shared idea | GP surrogate and expected improvement | GP-based acquisition and repeated experiments |
| Additional emphasis | spend a small evaluation budget well | kernel/hyperparameter treatment, evaluation duration and parallelism |

**Teaching experiment:** give grid search, random search and BO the same initial observations and evaluation budget. Plot the best observed value after each query; if evaluation costs differ, also compare elapsed cost. Keep a separate test set for the final ML evaluation.

::: keypoint
A smooth posterior plot is a regression result. **A better recommendation under the same experimental budget** is an optimization result. [EGO](https://doi.org/10.1023/A:1008306431147) · [Practical Bayesian Optimization](https://proceedings.neurips.cc/paper/2012/hash/05311655a15b75fab86956663e1819cd-Abstract.html)
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

A common BO objective is a good **final recommendation** $\hat x_T$: maximise $\E[f(\hat x_T)]$ after $T$ queries.
:::
:::

::: reveal
::: keypoint
Both are rules mapping ==history to the next action==. Their goals can differ: cumulative reward values every trial; final-design optimisation values the recommendation after the trials.
:::
:::

::: reveal
::: small
An acquisition rule and an RL exploration rule both turn current information into the next action. Their stored objects differ: a GP posterior describes uncertainty about a function; a standard $Q$-table estimates expected returns and is not itself a posterior distribution. In Lecture 8, an exploration rule acts on those estimates.
:::
:::

### Discuss — do the trials count, or only the answer?
{sub: Same policy form, two objectives. Decide before the next slide.}

::: cols
::: col Six problems
1. Tuning a network's hyperparameters on a GPU cluster
2. Choosing which headline each visitor to a news site sees
3. Assigning doses to patients in a clinical trial
4. Screening alloy compositions, one furnace run each
5. Setting yaw angles on a wind farm that is selling its power
6. Tuning a walking robot's gait on the real hardware
:::
::: col.accent Three questions
1. **Which objective?** $\E\big[\sum_t r_t\big]$ or $\E[f(\hat x_T)]$ — and what in the problem decides it?
2. **Should exploration change?** More or less of it — and early or late in the budget?
3. **What do you hand over at the end?** The last query, the best $y$ observed, or $\argmax_x\mu(x)$?
:::
:::

::: note
Pairs, three minutes. Ask one question the students can settle among themselves: *does anyone lose anything when a trial goes badly?* That decides the objective. Leave problem 6 for last — it fits neither column cleanly, which is the point.
:::

### Answers — the objective sets how much to explore
{sub: simple regret $f^*-f(\hat x_T)$ versus cumulative regret $\sum_t\big(f^*-f(x^t)\big)$}

| | Only the answer counts | Every trial counts |
|---|---|---|
| Problems | 1 hyperparameters · 4 alloys | 2 headlines · 3 doses · 5 live wind farm |
| A poor query costs | one unit of budget — only $\hat x_T$ is deployed | budget **and** its reward — each trial is a payoff, or a patient |
| Exploration | cheap; still worth it at the last query | repaid only over the remaining horizon — explore early, exploit late |
| Suited rules | EI, knowledge gradient, entropy search | UCB (GP-UCB), Thompson sampling |
| Hand over | $\argmax_x\mu(x)$, not the luckiest noisy $y$ | nothing separate — the queries were the product |

::: reveal
::: small
Problem 6 is a hybrid: only the final gait matters, but a query that topples the robot is not free. Safe BO (e.g. SafeOpt) keeps the final-answer objective and restricts every query to where the posterior is confidently safe.
:::
:::

::: reveal
::: keypoint
The objective, not the model, sets the exploration schedule — and no rule is best at both. [Bubeck, Munos & Stoltz (2009)](https://doi.org/10.1007/978-3-642-04414-4_7): the smaller a strategy's cumulative regret, the larger its lower bound on simple regret.
:::
:::

::: note
EI belongs in the left column: it is the one-step-optimal rule when the recommendation must be a point already evaluated and observations are noise-free. Knowledge gradient drops that restriction and recommends $\argmax_x\mu(x)$. The Act 4 regret widget plots cumulative regret, so it is scoring the right-hand column.
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
The word *policy*, and the trade-off in its bare form: **acquiring new information** against **capitalising on the information already held**. A Bayesian finite-bandit model can carry a posterior for each arm; the GP additionally couples rewards across input locations.
:::
::: col.accent What BO contributes
Structure. A kernel lets an observation inform other inputs. This can reduce the number of required evaluations when the smoothness assumptions fit the problem; there is no universal small-query guarantee.
:::
:::
:::

::: reveal
::: small
The lineage runs both ways. The bandit's Bayesian form is Chapter 2 exactly: after $w$ wins and $l$ losses, arm $i$ has posterior $\mathrm{Beta}(1+w_i,\,1+l_i)$ and mean $\rho_i=\frac{w_i+1}{w_i+l_i+2}$ — the pseudo-count update from Lecture 2, now serving as ==a belief state that an action will change.==
:::
:::

### The finite-bandit calculation underneath the loop
{sub: Evaluative feedback and incremental learning}

A pull reveals the reward of **the chosen arm**, not the reward every alternative would have given. Suppose arm A has three observed rewards $1,0,1$, so $Q_3(A)=2/3$.

After one more reward of 0,

$$Q_4(A)=Q_3(A)+\tfrac14(0-Q_3(A))=\tfrac12.$$

| Choice rule | What it uses | Remaining issue |
|---|---|---|
| Greedy / optimistic initial values | largest estimated reward / initially hopeful estimates | early luck can mislead; optimism is not a permanent exploration guarantee |
| $\varepsilon$-greedy / softmax | uniform exploration / reward-based randomisation | exploration depends on the rate or temperature |
| UCB | mean plus an uncertainty bonus | confidence assumptions and reward scale matter |

A constant step size tracks changing rewards by forgetting old observations; $1/k$ computes a sample average in a stationary problem. Preference and pursuit updates are in the appendix.

::: note
Source alignment: original PDF pp. 69–94.
:::

### How much exploration is the right amount?
::: widget explore-regret {"seed":21}
Ten arms, unknown payout probabilities, a thousand pulls, cumulative regret on the vertical axis. Pure greed ($\varepsilon=0$) locks onto whichever arm happened to pay first and never recovers. Constant thrashing ($\varepsilon=0.5$) pays a fixed toll on every round. ==Compare the fixed exploration rates with UCB in this simulated run== — because it explores where the uncertainty actually is, rather than at random. That is the whole argument for $\mu+\kappa\sigma$, made without a Gaussian process anywhere in sight.
:::

### From a function to a context
Often the right action depends on a **context** $c$ revealed just before each decision — the best price given the season, the best treatment given the patient, the best yaw angles given the wind direction. The object we want is no longer a point but a map:

$$x^* = \pi^*(c) = \argmax_x f(x;c)$$

::: reveal
::: cols
::: col How the GP absorbs a context
Put a kernel on the context too and multiply:

$$k\big((x,c),(x',c')\big) = k_X(x,x')\cdot k_C(c,c')$$

which couples function values at similar inputs and contexts. Similar values do not guarantee similar argmax locations, especially when two peaks nearly tie.
:::
::: col.accent What we have just built
A rule that takes past $(c,x,y)$ data, maintains a belief over the function, and chooses the next action for the observed context. The objective may be cumulative reward or the quality of a final recommendation.

With a context-arrival model and a horizon, the decisions can be formulated over a belief state. A myopic acquisition rule is not generally the optimal policy of that planning problem.
:::
:::
:::

::: reveal
::: small
And it costs something up front. In the professor's own wind-farm study, the contextual learner starts at 0.79 average power efficiency against a greedy controller's 0.93, crosses it at roughly 2 500 iterations, and finishes ahead at 0.94. ==This reported run illustrates a short-term exploration cost and a later benefit==. Other problems and exploration rules need not show the same pattern.
:::
:::

### Unknown constraints — feasibility is also an experiment
{sub: source pp. 176–178 · Gardner et al. (2014)}

Lecture 1 wrote constraints as known functions: you could check $c(x)$ before spending anything. Here the constraint is ==as expensive to evaluate as the objective==, and you learn whether $x$ was feasible only after running it.

$$\max_x f(x)\quad\text{subject to}\quad c(x)\le\lambda$$

| Setting in the source | Maximise $f(x)$ | Constraint $c(x)\le\lambda$ |
|---|---|---|
| Tuning an approximate ML model | speed (shorter test time) | accuracy must match the exact model |
| Chemical experimental design | process yield | unwanted by-product below a threshold |
| CPU micro-architecture | processor speed | power usage within a fixed budget |

::: reveal
In each case **one experiment returns both numbers**: running $x$ yields $y^F\approx f(x)$ and $y^C\approx c(x)$ together. So the data set grows in pairs, and BO needs a belief about each.
:::

::: keypoint
A good predicted objective is not enough. **Feasibility is also uncertain**, and an acquisition score is not a guarantee that every tested design is safe.
:::

::: note
Source alignment: original PDF pp. 176–178. The source also writes several constraints as $h_i(x)<a_i$; that form returns two slides on.
:::

### Two surrogates, one loop
{sub: source p. 179 · the BO loop with a second GP}

::: flow | | loop: both data sets grow
- **Learn twice** | $f\sim\mathcal{GP}$ from $\mathcal D^F_t$, $\;c\sim\mathcal{GP}$ from $\mathcal D^C_t$
- **Choose** | $x_{t+1}=\argmax_x A_t(x;\mathcal D^F_t,\mathcal D^C_t)$
- !**Run one experiment** | observe $y^F_{t+1}$ *and* $y^C_{t+1}$
- **Append** | $(x_{t+1},y^F_{t+1})\to\mathcal D^F$, $\;(x_{t+1},y^C_{t+1})\to\mathcal D^C$
:::

::: cols
::: col Objective GP
$f(x)\mid\mathcal D^F\sim\mathcal N\big(\mu_F(x),\sigma_F^2(x)\big)$ answers: *how much could this design improve performance?* It is the GP of Act 2, unchanged.
:::
::: col.accent Constraint GP
$c(x)\mid\mathcal D^C\sim\mathcal N\big(\mu_C(x),\sigma_C^2(x)\big)$ answers: *how likely is this design to be feasible?* Same machinery, its own kernel hyperparameters $\theta^C$.
:::
:::

::: reveal
Only the acquisition $A_t$ is new — it must read **both** posteriors. The source builds it by editing EI.
:::

### Constrained improvement — two edits to EI
{sub: source pp. 180–181 · from I(x) to Δ(x)·I(x)}

Recall $\operatorname{EI}(x)=\mathbb E[I(x)\mid\mathcal D]$ with $I(x)=\max\big(0,f(x)-f(x^+)\big)$. Constraints enter through two edits:

::: cols
::: col 1 · The incumbent must be feasible
A high but infeasible result is not a design you could ship, so it is no benchmark. $x^+$ becomes the best **feasible** observation:
$$f^+=\max\{\,y^F_i : y^C_i\le\lambda\,\}$$
:::
::: col.accent 2 · Infeasible points improve nothing
$$I_C(x)=\Delta(x)\,I(x),\qquad \Delta(x)=\begin{cases}1 & c(x)\le\lambda\\ 0 & \text{otherwise}\end{cases}$$
:::
:::

::: reveal
Before the experiment $\Delta(x)$ is unknown — a **Bernoulli** variable, and for $Y\sim\mathrm B(p)$, $\mathbb E[Y]=1\cdot p+0\cdot(1-p)=p$. Its parameter is read off the constraint GP:

$$\mathbb E[\Delta(x)]=\operatorname{PF}(x)=P\big(c(x)\le\lambda\mid\mathcal D^C\big)=\int_{-\infty}^{\lambda}p\big(c(x)\mid\mathcal D^C\big)\,dc=\hl{\Phi\!\left(\frac{\lambda-\mu_C(x)}{\sigma_C(x)}\right)}$$
:::

::: note
Source alignment: original PDF pp. 180–181. The source writes $\Pr(x)$ for $\operatorname{PF}(x)$, the probability of feasibility.
:::

### Expected constrained improvement — PF × EI
{sub: source p. 182 · where independence is used}

$$\operatorname{EI}_C(x)=\mathbb E\big[\Delta(x)\,I(x)\mid\mathcal D^F,\mathcal D^C\big]\;\overset{\text{indep.}}{=}\;\underbrace{\mathbb E\big[\Delta(x)\mid\mathcal D^C\big]}_{\operatorname{PF}(x)}\;\underbrace{\mathbb E\big[I(x)\mid\mathcal D^F\big]}_{\operatorname{EI}(x)}$$

$\Delta(x)$ depends only on $c(x)$ and $I(x)$ only on $f(x)$. With **two separate GPs**, the posteriors of $c(x)$ and $f(x)$ are independent at each $x$, so the expectation factorises. Both factors are closed-form: the constrained score costs one extra GP prediction.

::: reveal
| Candidate | $\operatorname{EI}(x)$ | $\operatorname{PF}(x)$ | $\operatorname{EI}_C(x)$ |
|---|---:|---:|---:|
| A — promising but risky | 2.0 | 0.20 | 0.40 |
| B — modest but safe | 1.0 | 0.90 | **0.90** |

B has less potential improvement but more **expected feasible improvement**. $\operatorname{PF}$ acts as a soft veto: $\operatorname{PF}\to0$ silences any EI, and $\operatorname{PF}\to1$ gives back ordinary EI.
:::

::: note
Source alignment: original PDF p. 182. The source calls the step "conditional independence of $c(x)$ and $f(x)$ given $x$"; it is a modelling choice made by fitting two independent GPs, not a fact about the experiment.
:::

### Constrained BO, run — EI × PF against plain EI
::: widget constrained-ei
Press → to spend one query. Top: objective GP; middle: constraint GP and threshold $\lambda$; bottom: $\operatorname{PF}$ (green), EI (dashed) and ==the score actually maximised== (amber). Red shading is where $c>\lambda$ — drawn for us, unknown to the algorithm. Switch to *EI alone* to replay the same budget with a rule that ignores $c$.
:::

### Several constraints, and no feasible point yet
{sub: source p. 183 · and what the formula leaves open}

For constraints $c_i(x)\le\lambda_i$, $i=1,\dots,m$, only $\operatorname{PF}$ changes; $\operatorname{EI}_C=\operatorname{PF}\cdot\operatorname{EI}$ stays.

$$\operatorname{PF}(x)=P\big(c_1(x)\le\lambda_1,\dots,c_m(x)\le\lambda_m\mid\mathcal D^C\big)\;\approx\;\prod_{i=1}^{m}P\big(c_i(x)\le\lambda_i\mid\mathcal D^C\big)$$

The product is exact when each $c_i$ has its own independent GP. For correlated constraints, use their **joint** posterior instead.

::: reveal
| Situation | What the formula says | What to do |
|---|---|---|
| No feasible observation yet | $f^+$ is undefined, so EI is too | maximise $\operatorname{PF}(x)$ alone until one feasible point is found |
| Constraint is cheap or known | nothing to learn about $c$ | check it directly and search only the feasible set (Lecture 1) |
| An infeasible trial is unacceptable | $\operatorname{EI}_C$ only *discourages* risky queries | *safe* BO restricts queries to a high-confidence safe set (Sui et al., 2015) |
:::

::: reveal
::: small
The source closes (pp. 184–185) with Gardner et al.'s 2-D tests: uniform sampling spreads its budget everywhere, plain BO piles queries onto the infeasible optimum, and ==constrained BO concentrates on the best feasible region== — the pattern the widget shows in 1-D.
:::
:::

::: note
Source alignment: original PDF pp. 183–185. Gardner, Kusner, Xu, Weinberger & Cunningham, *Bayesian Optimization with Inequality Constraints*, ICML 2014. Sui, Gotovos, Burdick & Krause, *Safe Exploration for Optimization with Gaussian Processes*, ICML 2015.
:::

### Several objectives — a Pareto set replaces one best number
{sub: The fastest car and the most economical car are different cars}

With $m$ objectives the unknown is a vector, $\mathbf f(x)=\big(f_1(x),\dots,f_m(x)\big)$, and no single value can play $f^+$. In this section ==both objectives are minimised== — less fuel, less time — so better lies toward the lower left.

::: widget mobo-hypervolume {"mode":"front"}
Press → to walk it; click any design to test it. $\mathbf y''\succ\mathbf y'$, **dominates**: no worse in every objective, strictly better in one. **Pareto set**: $P(Y)=\{\mathbf y'\in Y:\nexists\,\mathbf y''\in Y,\ \mathbf y''\succ\mathbf y'\}$.
:::

::: note
Source alignment: original PDF pp. 186–189. The car photographs of p. 187 become points; its green "no better car regarding both" box is the widget's first step, and p. 188's Pareto front and utopia point are its last. The rest of Chapter 4 maximises $f$; this section minimises, as the source does — say so once, aloud.
:::

### Multi-objective BO — the same loop, with a front where $f^+$ was
{sub: One GP per objective; only the acquisition function is new}

::: flow | | | loop: new data, new front
- **Learn** | one GP per objective
- **Construct** | $A_t\big(x;P(\mathcal D_t)\big)$ from the front
- **Decide** | $x_{t+1}=\argmax_x A_t$
- !**Observe** | a *vector* $\mathbf y_{t+1}$, appended
:::

| | One objective | Several objectives |
|---|---|---|
| The best so far | the incumbent $f^+$ | the Pareto front $P(\mathcal D_t)$ |
| What one outcome improves | how far $f(x)$ beats $f^+$ | ==the hypervolume it adds to $P$==, $\mathrm{HVI}\big(P,\mathbf f(x)\big)$ |
| Chance of any improvement | PI | **PHVI** |
| Improvement, on average | EI | **EHVI** |
| A cheaper stand-in | — | **HVPI** $=\mathrm{HVI}(P,\boldsymbol\mu)\times\mathrm{PHVI}$ |

::: note
Source alignment: original PDF pp. 190 and 196. The line to say: each multi-objective acquisition is a single-objective one with "beats $f^+$" replaced by "adds hypervolume to $P$" — so the one new object to understand is the hypervolume.
:::

### Hypervolume — one number for a whole front
{sub: What the front dominates, what one outcome adds, and where that gain is positive}

::: widget mobo-hypervolume {"mode":"hvi"}
Press → for each piece, and ==drag **f**== anywhere. The reference point $r$ is a deliberately poor corner, fixed before the search, that fences the area off. An outcome dropped into the blue is dominated and adds nothing.
:::

::: wformulas
- $$\textcolor{#2563EB}{\mathrm{HV}(P)}=\operatorname{area}\Big(\bigcup_{\mathbf p\in P}\,[\mathbf p,\ r]\Big)\qquad\text{the region the front dominates, fenced off by } r$$
- $$\textcolor{#D97706}{\mathrm{HV}\big(P,\mathbf f(x)\big)}=\mathrm{HV}\big(P\cup\{\mathbf f(x)\}\big)\qquad\text{the same area, with one more point in the set}$$
- $$\mathrm{HVI}\big(P,\mathbf f(x)\big)=\textcolor{#D97706}{\mathrm{HV}\big(P,\mathbf f(x)\big)}-\textcolor{#2563EB}{\mathrm{HV}(P)}$$
- $$\mathrm{HVI}\big(P,\mathbf f(x)\big)>0\ \text{ for }\ \mathbf f(x)\in\textcolor{#16A34A}{A(P)},\qquad \mathrm{HVI}\big(P,\mathbf f(x)\big)=0\ \text{ otherwise}$$
:::

::: note
Source alignment: original PDF pp. 191–195, on the source's own coordinates — its five Pareto points and $r$. The HVI rectangle of p. 194 is $(4.4-3.4)\times(4.2-3.2)=1$.
:::

### PHVI — will the outcome move the front at all?
{sub: Probability of improvement, with “beats $f^+$” replaced by “lands in $A(P)$”}

::: widget mobo-hypervolume {"mode":"phvi"}
Press → to shade the belief that lands in $A(P)$, then to count 160 draws. Drag the mean, widen $\sigma$. The product form assumes one independent GP per objective.
:::

::: wformulas
- $$\textcolor{#D64545}{p\big(\mathbf f(x)\big)}=\prod_{j=1}^{m}\phi_j\big(f_j(x)\big),\qquad f_j(x)\mid\mathcal D\sim\mathcal N\big(\mu_j(x),\sigma_j^2(x)\big)$$
- $$\mathrm{PHVI}(P,x,r)=\int_{\mathbf f\in\textcolor{#16A34A}{A(P)}}\textcolor{#D64545}{p\big(\mathbf f(x)\big)}\,d\mathbf f$$
- $$\mathrm{PHVI}(P,x,r)=\int_{\mathbf f\in\textcolor{#16A34A}{A(P)}}\textcolor{#D64545}{p\big(\mathbf f(x)\big)}\,d\mathbf f\;\approx\;\frac1N\sum_{k=1}^{N}\mathbf 1\big[\mathbf f^{(k)}\in\textcolor{#16A34A}{A(P)}\big],\qquad \mathbf f^{(k)}\sim p\big(\mathbf f(x)\big)$$
:::

::: note
Source alignment: original PDF pp. 197–199; the contours sit where p. 198 draws them. The widget's PHVI is exact: $A(P)$ splits into vertical strips — one left of the front, one under each Pareto point — and each contributes $P(f_1\in\text{strip})\,P(f_2<\text{its cap})$.
:::

### EHVI — how far will it move the front, on average?
{sub: Expected improvement for a set — every possible outcome, weighted by the hypervolume it adds}

::: widget mobo-hypervolume {"mode":"ehvi"}
Press → for three possible outcomes ①–③ and a dominated one ④, then 160 draws sized by the hypervolume each adds — their average is EHVI.
:::

::: wformulas
- $$\mathrm{EHVI}(P,x,r)=\mathbb E\big[\max\{0,\mathrm{HVI}(P,\mathbf f(x),r)\}\big]=\int_{\mathbf f(x)\in\textcolor{#16A34A}{A(P)}}\mathrm{HVI}\big(P,\mathbf f(x),r\big)\,\textcolor{#D64545}{p\big(\mathbf f(x)\big)}\,d\mathbf f$$
- $$\mathrm{EHVI}(P,x,r)\;\approx\;\frac1N\sum_{k=1}^{N}\mathrm{HVI}\big(P,\mathbf f^{(k)},r\big),\qquad \mathbf f^{(k)}\sim\textcolor{#D64545}{p\big(\mathbf f(x)\big)}\quad\text{— each draw's gain, averaged}$$
:::

::: note
Source alignment: original PDF pp. 200–204; outcomes ①–③ are the three points of pp. 201–203. For two objectives the integral has a closed form, which is the widget's "exact" value; with more objectives it is usually estimated by Monte Carlo. The exact form: since $\mathrm{HVI}(P,\mathbf f)=\int_{A(P)}\mathbf 1[\mathbf f\le\mathbf z]\,d\mathbf z$, $\mathrm{EHVI}=\int_{A(P)}\Phi_1(z_1)\,\Phi_2(z_2)\,d\mathbf z$, which factorises strip by strip with $\int\Phi\big(\tfrac{z-\mu}{\sigma}\big)dz=\sigma\,[u\Phi(u)+\phi(u)]$. Analytic EHVI and its gradient: Yang, Emmerich, Deutz & Bäck (2019).
:::

### HVPI — the improvement at the mean, times PHVI
{sub: A cheaper stand-in for EHVI, and the candidate it cannot see}

::: widget mobo-hypervolume {"mode":"hvpi"}
Press → for the rectangle at the mean, the product, EHVI beside it — then two candidates: **A**, a near-certain small gain; **B**, a wide belief whose mean is dominated.
:::

::: wformulas
- $$\mathrm{HVI}\big(P,\boldsymbol\mu(x)\big)\qquad\text{the gain if the outcome landed exactly on its mean}$$
- $$\mathrm{HVPI}(P,x)=\mathrm{HVI}\big(P,\boldsymbol\mu(x)\big)\times\mathrm{PHVI}(P,x)$$
- $$\mathrm{HVPI}=\mathrm{HVI}\big(P,\mathbb E[\mathbf f]\big)\times\Pr\big(\mathbf f\in\textcolor{#16A34A}{A(P)}\big)\;\ne\;\mathbb E\big[\mathrm{HVI}(P,\mathbf f)\big]=\mathrm{EHVI}$$
- $$\mathrm{HVPI}=\mathrm{HVI}(P,\boldsymbol\mu)\times\mathrm{PHVI}:\qquad \mathrm{HVI}(P,\boldsymbol\mu_B)=0\ \Rightarrow\ \mathrm{HVPI}_B=0\ \text{ for every }\sigma_B$$
:::

::: note
Source alignment: original PDF p. 205. The source's HVPI figure reuses p. 203's outcome; here the rectangle stands at the mean, which is where the formula evaluates it. Before the last press, ask which candidate each rule picks: A has PHVI 0.954 and HVPI 0.453; B has EHVI 0.615 against A's 0.487, and HVPI exactly 0 because its mean is dominated. It is Act 3's "Choose between two candidate experiments", with two objectives: only EHVI weighs how far as well as how likely, so only EHVI can pick B — as EI could, and PI could not.
:::

### Two different scaling limits — data count and input dimension
{sub: Why the original lecture continues beyond standard BO}

| Bottleneck | Why it arises | Source directions |
|---|---|---|
| Many observations $n$ | dense GP factorisation costs $O(n^3)$, storage $O(n^2)$ | sparse/inducing-point GPs, online approximations, neural surrogates |
| Many input dimensions | measurements cover the domain poorly; acquisition search becomes harder | low-dimensional embeddings, learned latent coordinates, partitions/ensembles |
| Expensive repeated fitting | updating hyperparameters can cost more than a cheap query | schedule refits; update the posterior between refits |

A latent representation helps only if it preserves the variables relevant to the objective and constraints. A neural predictor helps BO only if its uncertainty is useful for choosing experiments.

::: keypoint
There is no universal “BO works in any dimension” guarantee. **Representation, inference, and query selection** each have their own approximation error.
:::

::: note
Source alignment: original PDF pp. 209–225.
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
Honest limits, before you go: dense exact GP training costs $O(n^3)$, and high-dimensional acquisition optimisation can be difficult. The practical range depends on evaluation budget, effective dimension, kernels and approximations. Latent-space and neural surrogates push on both walls, and the first of them, learning a low-dimensional representation to optimise inside, is Lecture 6.
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

### Reading guide — from an expensive experiment to the next measurement
{sub: one main idea to explain, one comparison, one application}

| Role | Read or revisit | Question to answer |
|---|---|---|
| **Core** | [Frazier, *A Tutorial on Bayesian Optimization* (2018)](https://arxiv.org/abs/1807.02811) | How do GP regression and an acquisition rule form one loop? |
| **Compare** | [Jones, Schonlau & Welch, *Efficient Global Optimization of Expensive Black-Box Functions* (1998)](https://doi.org/10.1023/A:1008306431147) | Why evaluate expected improvement instead of only the predicted optimum? |
| **Apply** | [Snoek, Larochelle & Adams, *Practical Bayesian Optimization of Machine Learning Algorithms* (NeurIPS 2012)](https://proceedings.neurips.cc/paper/2012/hash/05311655a15b75fab86956663e1819cd-Abstract.html) | How does the same loop select expensive model-training hyperparameters? |

::: keypoint
Understand one GP update and one acquisition choice first. The original traffic and wind cases then add context; multi-output, constrained and multiobjective BO extend the same loop.
:::

### Backup 1 — the GP posterior, from one Gaussian fact
**The fact.** If $\begin{bmatrix}Y_1\\Y_2\end{bmatrix}\sim\mathcal N\!\left(\begin{bmatrix}\mu_1\\\mu_2\end{bmatrix},\begin{bmatrix}\Sigma_{11}&\Sigma_{12}\\\Sigma_{21}&\Sigma_{22}\end{bmatrix}\right)$, then

$$Y_2\mid Y_1 = y \sim \mathcal N\big(\mu_2 + \Sigma_{21}\Sigma_{11}^{-1}(y-\mu_1),\; \Sigma_{22}-\Sigma_{21}\Sigma_{11}^{-1}\Sigma_{12}\big)$$

**The application.** Take $Y_1=\mathbf y_{1:n}$ (observed, with $\sigma_\epsilon^2$ on the diagonal) and $Y_2=f(x)$ (the value we want). Then $\Sigma_{11}=\mathbf K+\sigma_\epsilon^2\mathbf I$, $\Sigma_{21}=\mathbf k^\top$, $\Sigma_{22}=k(x,x)$, and with $m\equiv 0$:

$$\mu(x\mid\mathcal D) = \mathbf k^\top(\mathbf K+\sigma_\epsilon^2\mathbf I)^{-1}\mathbf y, \qquad \sigma^2(x\mid\mathcal D) = k(x,x)-\mathbf k^\top(\mathbf K+\sigma_\epsilon^2\mathbf I)^{-1}\mathbf k \quad\blacksquare$$

::: small
Three readings. The mean is a **linear combination** of observed $y$ values; its weights need not form an average. The variance shrinks near data and returns to the prior $k(x,x)$ far from it. For fixed hyperparameters, the variance depends on the inputs and noise level, not directly on $\mathbf y$ — which is why a GP can plan an experiment before running it. The cost is the factorisation: $O(n^3)$ once, $O(n^2)$ per prediction, one reason dense exact GPs become expensive as the dataset grows.
:::

### Backup 2 — kernels, and hyperparameters by marginal likelihood
**Squared exponential.** $k(x,x')=\sigma_0^2\exp\!\big(-\tfrac12\|x-x'\|^2/\lambda^2\big)$ — stationary, infinitely differentiable. **Matérn $\tfrac32$:** $\alpha(1+\sqrt3 r)e^{-\sqrt3 r}$; **Matérn $\tfrac52$:** $\alpha(1+\sqrt5 r+\tfrac53 r^2)e^{-\sqrt5 r}$, with $r=\|x-x'\|_2/l$ — finitely differentiable, rougher, usually more realistic. **ARD:** one $\lambda_d$ per dimension, $k=\sigma_0^2\exp\!\big[-\tfrac12\sum_d ((x_d-x_d')/\lambda_d)^2\big]$, and a large $\lambda_d$ means slow variation along dimension $d$ on the studied range. **Algebra:** $k_1+k_2$ is the covariance of a sum of independent GPs; $k_1k_2$ is a valid covariance, but multiplying GP sample paths does not generally produce a GP — so Lin $+$ Per is *periodic with a trend*, Lin $\times$ Per is *growing amplitude*.

**Fitting $\theta=(\sigma_\epsilon,\sigma_0,\boldsymbol\lambda)$.** Marginalise the latent $\mathbf f$ away and maximise what is left:

$$\theta^*=\argmax_\theta \log\!\int p(\mathbf y\mid\mathbf f,\theta)\,p(\mathbf f\mid\theta)\,d\mathbf f = \argmin_\theta\Big[\tfrac12\mathbf y^\top(\mathbf K_\theta+\sigma_\epsilon^2\mathbf I)^{-1}\mathbf y + \tfrac12\log|\mathbf K_\theta+\sigma_\epsilon^2\mathbf I|\Big] = \argmax_\theta\big[\mathcal F(\theta)+\mathcal S(\theta)\big]$$

::: small
The two terms pull opposite ways as the length scale grows. On the seven-point example of the Act 2 widget, the simplicity term $\mathcal S=-\tfrac12\log|\mathbf K+\sigma_\epsilon^2\mathbf I|$ — the negative of Rasmussen & Williams' *complexity penalty*, so that larger is better — climbs monotonically from $-0.04$ at $\lambda=0.05$ to $+12.2$ at $\lambda=10$, because a rigid model is *rewarded* for being prepared for little, while the data-fit term $\mathcal F=-\tfrac12\mathbf y^\top(\mathbf K+\sigma_\epsilon^2\mathbf I)^{-1}\mathbf y$ falls from $-0.75$ near $\lambda=0.45$ to $-58.9$ at $\lambda=10$. Their sum $\mathcal F+\mathcal S$ peaks at $\lambda\approx0.85$. That is an Occam's razor you did not have to write down, and it is a Lecture 1 optimisation nested inside the Lecture 4 loop.
:::

### Backup 3 — Expected Improvement, in closed form
With $f(x)\sim\mathcal N(\mu,\sigma^2)$ and incumbent $f^{+}$, define $I=\max(0,f(x)-f^{+})$. Integrate:

$$\mathrm{EI}(x)=\int_{f^{+}}^{\infty}\big(f-f^{+}\big)\,p(f\mid\mathcal D)\,df = \sigma(x)\Big[\,\underbrace{\tfrac{\mu-f^{+}}{\sigma}\,\Phi(z)}_{\text{exploit}} + \underbrace{\phi(z)}_{\text{explore}}\,\Big], \qquad z=\frac{\mu-f^{+}}{\sigma}$$

with $\Phi,\phi$ the standard normal CDF and PDF. Adding a margin $\xi$ gives the general form $\mathrm{EI}=(\mu-f^{+}-\xi)\Phi(Z)+\sigma\phi(Z)$, $Z=(\mu-f^{+}-\xi)/\sigma$, and at $\sigma=0$ use $\mathrm{EI}=\max(0,\mu-f^{+}-\xi)$.

::: small
**Reading the two terms.** $(\mu-f^{+})\Phi(z)$ is large where the mean already beats the incumbent; $\sigma\phi(z)$ is large where the uncertainty is high, even if the mean is unremarkable. **Why EI and PI differ.** PI integrates the *density* above the line — it counts whether an improvement happens. EI integrates the density *weighted by how far above the line it lands* — it counts how big. The basic EI formula needs no explicit exploration margin, although variants use one. On the illustrative Act 3 posterior it moves the query from $x=0.630$ (worth $1.075$) to $x=0.470$ (worth $1.301$, against a true maximum of $1.303$).
:::

### Backup 4 — the bandit toolkit, three lectures early
The source lecture develops the finite-armed bandit in full before reaching BO. Every rule below reappears in Part IV.

| rule | form | reappears as |
|---|---|---|
| **Action value** | $Q_t(a)=\frac{r_1+\cdots+r_{k_a}}{k_a}$, greedy $a_t=\argmax_a Q_t(a)$ | the $Q$-function, Lecture 8 |
| **Incremental update** | $Q_{k+1}=Q_k+\alpha_k\big[r_{k+1}-Q_k\big]$, with $\alpha_k=\tfrac{1}{k+1}$ or a constant | *new ← old $+$ step $\times$ (target $-$ old)* — every RL update, and a constant $\alpha$ gives exponential recency weighting |
| **$\varepsilon$-greedy** | $\pi(a)=1-\varepsilon+\tfrac{\varepsilon}{\lvert A\rvert}$ if $a=a^*$, else $\tfrac{\varepsilon}{\lvert A\rvert}$ | Lecture 8's exploration rule, unchanged |
| **Softmax** | $\pi_t(a)=e^{Q_t(a)/\tau}\big/\sum_b e^{Q_t(b)/\tau}$ | the Boltzmann policy; $\tau\to0$ recovers greedy |
| **Preference rules** | reinforcement comparison $p_{t+1}(a_t)=p_t(a_t)+\beta[r_t-\bar r_t]$; pursuit, keeping both $Q_t$ and $\pi_t$ | preference learning anticipates policy gradients; see the distinction in the later backup slide |
| **UCB** | $a_t=\argmax_i\big(\mu_i+\sqrt{2\ln t / n_i}\big)$ | $\mu(x)+\kappa\sigma(x)$, this lecture, continuous |

::: small
For a stationary finite bandit with sufficient sampling, sample averages converge to action means. Under uniform fixed-$\varepsilon$ exploration and a unique best arm, its selection probability approaches $1-\varepsilon+\varepsilon/|A|$, so exploration still incurs a continuing cost.
:::

### Backup — the multi-output covariance, with dimensions visible
{sub: Kronecker product and the latent-factor construction}

For $D$ outputs measured at the same $N$ inputs, stack $\mathbf f=[\mathbf f_1^\top,\ldots,\mathbf f_D^\top]^\top$ in **output-major order**.

$$K_{\mathrm{ICM}}=B\otimes K_X,\qquad K_{\mathrm{LMC}}=\sum_q B_q\otimes K_q.$$

| Matrix | Size |
|---|---|
| $B_q=A_qA_q^\top$ | $D\times D$ |
| $K_q=[k_q(x_i,x_j)]$ | $N\times N$ |
| Stacked covariance | $DN\times DN$ |

Each independent latent group contributes one PSD covariance; adding them preserves positive semidefiniteness. Independent output-specific noise adds $\operatorname{diag}(\sigma_1^2,\ldots,\sigma_D^2)\otimes I_N$.

For different input sets per output, use the corresponding covariance entries; the simple complete-grid Kronecker layout need not remain available.

::: note
Source alignment: original PDF pp. 56–68.
:::

### Backup — preference and pursuit are different bandit updates
{sub: Keep their relationship to policy gradients precise}

| Method | Stored object | Update idea |
|---|---|---|
| Reinforcement comparison | preferences $h(a)$ and a reward baseline $\bar r$ | increase the chosen arm's preference when its reward exceeds the baseline |
| Pursuit | action-value estimates $Q(a)$ **and** probabilities $\pi(a)$ | move probabilities toward the currently greedy action $a^*$ |

For pursuit, $\pi_{t+1}=(1-\beta)\pi_t+\beta e_{a^*}$ with $0<\beta<1$. This preserves nonnegative probabilities summing to one.

The exact softmax bandit policy gradient instead updates **every** preference:

$$h_b\leftarrow h_b+\alpha(r-\bar r)\big[\mathbf1\{b=a\}-\pi(b)\big].$$

::: keypoint
Reward-relative preference learning anticipates Lecture 10, but the source's chosen-arm-only reinforcement-comparison rule is **not the full softmax policy-gradient formula**.
:::

::: note
Source alignment: original PDF pp. 87–91.
:::

### Backup — the source's computational exercises
{sub: GPflowOpt-era lab material}

| Original exercise | Learning task retained here |
|---|---|
| Branin / polynomial functions | distinguish a local search result from the global best; plot best measured value versus query count |
| Goldstein and other test functions | compare acquisitions using the same starting observations and evaluation budget |
| Airline-passenger regression | compare initial and fitted kernel hyperparameters; evaluate held-out predictions |
| Modified Binh multiobjective problem | identify the Pareto set and compare hypervolume before and after a query |

The source's package installation screens are historical implementation material. The mathematical exercises do not depend on that specific library. Record the function, bounds, initial points, noise model, budget, and random seed before comparing methods.

::: keypoint
An experiment compares **the same problem under controlled settings**. A good-looking posterior plot alone does not measure optimisation performance.
:::

::: note
Source alignment: original PDF pp. 164–175 and 207–208.
:::

### Backup — three ways to combine Gaussian processes and neural networks
{sub: These are different model families}

| Source direction | Construction | What changes |
|---|---|---|
| Deep Gaussian process | compose latent GP layers | nonlinear latent transformation; inference is generally approximate |
| Deep kernel learning | $k_\theta(x,x')=k(\phi_\theta(x),\phi_\theta(x'))$ | a neural network learns the features used by a GP |
| Conditional neural process | encode a context dataset and predict distributions at query inputs | learn a conditional predictor; it is not automatically a GP posterior |

The source also connects variational autoencoders to latent GP models and low-dimensional search. Lecture 6 develops the latent-variable machinery.

::: keypoint
“Uses a neural network” does not specify the uncertainty model. Ask what is random, what is fitted, and which posterior calculation is exact or approximate.
:::

::: note
Source alignment: original PDF pp. 222–225.
:::

## Extensions — shared outputs and hypervolume acquisition
{short: EXTENSION}

Read after completing the main route.

### More than one output — share information through a latent function
{sub: Intrinsic coregionalisation}

Suppose one design has two measured responses. A simple shared latent model is $u\sim\mathcal{GP}(0,k)$, $f_1(x)=u(x)$ and $f_2(x)=2u(x)$.

$$\operatorname{cov}\!\left(\begin{bmatrix}f_1(x)\\f_2(x)\end{bmatrix},\begin{bmatrix}f_1(x')\\f_2(x')\end{bmatrix}\right)=\underbrace{\begin{bmatrix}1&2\\2&4\end{bmatrix}}_{B}\,k(x,x').$$

| Object | What it relates |
|---|---|
| Scalar kernel $k(x,x')$ | different input locations |
| Output matrix $B$ | different responses |
| Independent observation noise | uncertainty in each measurement; added separately |

::: keypoint
Measuring one response can inform another **if the cross-output covariance model is appropriate**. Predicting several outputs is distinct from deciding how to trade off several objectives.
:::

::: note
Source alignment: original PDF pp. 46–59.
:::

### ICM, SLFM and LMC — change which latent patterns are shared
{sub: Retain the model hierarchy}

Write each output as a linear combination of independent latent GPs. Their covariance always has the form

$$\operatorname{cov}(f_d(x),f_{d'}(x'))=\sum_q (B_q)_{dd'}\,k_q(x,x').$$

| Model | Restriction | What the extra freedom buys |
|---|---|---|
| **ICM** | one shared input kernel, $B\,k(x,x')$ | all output relationships share one spatial pattern |
| **SLFM** | several kernels, each $B_q=a_qa_q^\top$ | each latent factor can have its own length scale |
| **LMC** | several kernels and PSD matrices $B_q$ | several shared factors can use each kernel |

For $D$ outputs, every $B_q$ is **$D\times D$**. With $R_q$ latent factors, $B_q=A_qA_q^\top$ has rank at most $\min(D,R_q)$.

::: keypoint
The source's many covariance derivations implement one rule: **independent latent contributions add their covariances**. The appendix gives the stacked matrix.
:::

::: note
Source alignment: original PDF pp. 54–68.
:::

### Computing EHVI — more objectives, correlated outputs, batches, contexts
{sub: Where the two-objective picture of Act 4 needs more machinery}

| Situation | What changes |
|---|---|
| Two objectives, independent GPs | exact: split $A(P)$ into strips and integrate each in closed form — differentiable too (Yang et al., 2019) |
| Three or more objectives | $A(P)$ splits into boxes whose number grows quickly with $m$; Monte Carlo is the usual fallback |
| Correlated objectives | draw $\mathbf f(x)$ jointly from a multi-output GP — the covariance of the previous two slides |
| A batch of $q$ experiments | qEHVI: Monte Carlo over the joint outcome of all $q$ at once (Daulton, Balandat & Bakshy, 2020) |
| A context $c_{t+1}$ seen first | contextual MOBO: build the front from $\boldsymbol\mu(x,c_{t+1})$, then choose $x_{t+1}$ for that context |

::: keypoint
Multiple outputs describe **what is predicted**; multiple objectives describe **what is valued**. Every variant keeps the same hypervolume improvement and changes only how its expectation is computed.
:::

::: note
Source alignment: original PDF pp. 204 and 206–208 — the 3-D EHVI figure of Yang et al., contextual MOBO, and the GPflowOpt HVI example. K. Yang, M. Emmerich, A. Deutz & T. Bäck, *Multi-objective Bayesian global optimization using expected hypervolume improvement gradient*, Swarm and Evolutionary Computation 44 (2019). S. Daulton, M. Balandat & E. Bakshy, *Differentiable expected hypervolume improvement for parallel multi-objective Bayesian optimization*, NeurIPS 2020.
:::

