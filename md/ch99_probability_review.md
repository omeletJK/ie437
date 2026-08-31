---
ch: 99
label: Appendix
title: Probability Review
subtitle: The toolbox beneath the course — and where each tool was used
tagline: A handful of facts about *expectation*, *Bayes* and the *Gaussian*, carrying an entire course
blurb: >-
  The toolbox the course leans on: expectation and its linearity, variance and the bias–variance
  split, Bayes' rule, and the Gaussian. Each one is shown at the point where a lecture actually
  leaned on it.
course: IE437 · Data-Driven Decision Making and Control
author: Jinkyoo Park
institute: KAIST
---

### Probability Review
{layout: title}

## Orientation
{short: ORIENTATION}

Not a prerequisite to be read first. A ledger, to be read afterwards — with a pointer to the slide where each fact did the work.

### Why an appendix — the few facts everything rested on

::: lede
Every method this term leaned on a handful of probability facts. Eight rows, and ==a pointer to where each one carried the weight.==
:::

| Tool | Where it carried the weight |
|---|---|
| expectation, and linearity | every return and value (Ch 7–11); expected improvement (Ch 4) |
| law of total expectation | *the prior mean averages every posterior mean* (Ch 2); Bellman (Ch 7) |
| law of total variance | *the posterior is on average tighter* (Ch 2); baselines (Ch 10) |
| Bayes' rule | the whole of belief updating (Ch 2–4); CbAS's target (Ch 6) |
| the multivariate Gaussian | the weight posterior (Ch 2); GP conditioning (Ch 4); LQR noise (Ch 9) |
| Monte Carlo estimation | every sampled Bellman backup (Ch 8); REINFORCE (Ch 10) |
| importance sampling | the CbAS ladder (Ch 6); off-policy evaluation (Ch 12) |
| KL divergence, entropy | the VAE's regulariser (Ch 6); TRPO's trust region (Ch 10) |

### Model to data, and the arrow inference runs backward
{fill: center}

::: flow | 
- **Model** | $\theta$ — the characteristics that generate
- **Data** | $y=(y_1,\dots,y_n)$ — the observed consequence
:::

::: center
==Statistics infers the causes that generated the observed data.== The arrow runs left to right in the world, and right to left in inference.
:::

::: reveal
::: small
Chapter 2 opened on exactly this picture and never left it: a coin's bias generates a sequence of tosses; the tosses are what we see. Chapter 3 gave $\theta$ a graph, Chapter 4 made it an entire function, and Chapters 7–12 made it a transition kernel. The arrow never changed direction — only the size of the thing at its tail.
:::
:::

::: reveal
::: keypoint
Each tool below is one line of algebra with an outsized payoff. ==The pointer beside it is the point of the appendix.==
:::
:::

## Expectation and its laws
{short: EXPECTATION}

Almost every objective in this course is an expectation. Two laws about *conditioning* do most of the work.

### Mean, variance, and the mean of a function

For a random variable $U$ with density $p$, and any $g:\R\to\R$:

$$\E[U] = \int u\,p(u)\,du, \qquad \E[g(U)] = \int g(u)\,p(u)\,du, \qquad \mathrm{var}(U) = \E\big[(U-\E[U])^2\big] = \E[U^2]-\E[U]^2$$

::: reveal
**Linearity** is the property used most often, and the one most often used without noticing:

$$\E[aU+bV] = a\,\E[U] + b\,\E[V] \qquad \hl{\text{regardless of any dependence between } U \text{ and } V.}$$
:::

::: reveal
::: small
It is why a return can be split term by term, why a baseline can be subtracted from a policy gradient without touching its mean, and why the covariance of $AY$ is $A\Sigma A^\top$. Every objective the course optimised is an expectation: the return $\E_\pi[\sum_t\gamma^t r_t]$ (Ch 7–11), expected improvement $\E[\max(0,f-f^{\max})]$ (Ch 4), the ELBO $\E_{q}[\log p(x\mid z)]$ (Ch 6), the policy objective $\E_\tau[R(\tau)]$ (Ch 10). ==Manipulating expectations *is* the technical core of the course.==
:::
:::

### The two laws that recur

::: block Law of total expectation | average the conditional averages
$$\E[U] \;=\; \E_V\big[\,\E[U\mid V]\,\big]$$
:::

::: block Law of total variance | uncertainty splits in two, and the split is exact
$$\mathrm{var}(U) \;=\; \underbrace{\E_V\big[\mathrm{var}(U\mid V)\big]}_{\text{within — noise left inside each condition}} \;+\; \underbrace{\mathrm{var}\big(\E[U\mid V]\big)}_{\text{between — spread across conditions}}$$
:::

::: reveal
::: small
Both say the same thing from two heights: knowing $V$ does not change your average, and it does reduce your spread — by ==exactly the amount your average moves around== as $V$ varies. Everything on the next two slides is those two sentences, cashed.
:::
:::

### Total expectation, read in three chapters

::: cols c3
::: col Ch 2 — the prior mean
$$\E[\theta] = \E\big[\,\E[\theta\mid y]\,\big]$$

Before seeing data, your belief is already the average of every belief you might end up with. A posterior that moved in one direction *for every possible dataset* would be an incoherent prior.
:::
::: col.accent Ch 7 — the Bellman equation
$$V^\pi(s) = \E\big[r_t + \gamma V^\pi(s_{t+1})\mid s\big]$$

Lecture 7 peeled one step off the return and let the Markov property close the loop. ==That peel is the tower rule== — condition on the next state, average the conditional averages.
:::
::: col Ch 8 — the sampled backup
$$\E_{s'}[\,\cdot\,] \;\longrightarrow\; \text{one transition } (s,a,r,s')$$

Lecture 8's translation table swaps the *outer* expectation for a single draw and calls the law of large numbers to justify it. The equation is unchanged; only who evaluates it.
:::
:::

::: reveal
::: small
*↪ used in Ch 2 (the prior–posterior identity), Ch 7 (every Bellman equation), Ch 8 and 10 (every sampled backup).*
:::
:::

### Total variance, on every dataset at once
{sub: the identity computed rather than asserted — every dataset enumerated, nothing sampled}

::: widget variance-split {"alpha":2,"beta":2,"n":10}
A Beta$(\alpha,\beta)$ prior and $n$ coin tosses, with *every* dataset enumerated rather than sampled. The posterior means scatter around the prior mean and average back onto it — total expectation. The variance bar splits exactly into a within part and a between part — total variance. Raise $n$ and watch the between share grow: it is ==$n/(n+\alpha+\beta)$, the very weight Chapter 2 put on the data.==
:::

### The three places that split mattered

::: cols c3
::: col Ch 2 — the posterior tightens
$\mathrm{var}(\theta\mid y)$ is smaller than $\mathrm{var}(\theta)$ by exactly the spread of posterior means. Chapter 2 stated it as ==data cannot, on average, make you less certain== — which is this identity read as an inequality.
:::
::: col.accent Ch 2 and 4 — the predictive split
The predictive variance is $\sigma_Y^2+\tau_1^2$: measurement noise you can never remove, plus parameter uncertainty you can. Lecture 0's aleatoric/epistemic pair, arriving as the two terms of one identity.
:::
::: col Ch 10 — the baseline
Subtracting $\E[U\mid V]$ deletes the between part and leaves the mean untouched. That is why a baseline reduces the variance of a policy gradient at ==zero bias== — Chapter 10 measures the effect at nearly twentyfold — and why the advantage exists at all.
:::
:::

::: reveal
::: small
One identity, three readings: *how much did I learn*, *what can I never learn*, and *how do I stop the estimator from shaking*. Whenever a later chapter claims a quantity is "smaller on average" or "unbiased but less noisy", this is the line being invoked.
:::
:::

### Check — the tower property

::: quiz The law of total expectation says $\mathbb{E}[X] = \mathbb{E}\big[\mathbb{E}[X \mid Y]\big]$. Where does this course lean on it hardest?
- =In every Bellman equation — conditioning on the next state and averaging over it is exactly this identity
- In proving that the sample mean is unbiased
- In deriving the Gaussian density
- In the definition of conditional independence
Writing $V(s) = \mathbb{E}[r + \gamma V(s')]$ is the tower property with the conditioning done on the next state. Every backup in Lectures 7 to 12 is one application of it, and the reason a one-step update can stand in for an infinite sum of future rewards is that this identity says it may.
:::

## Bayes and the two views
{short: BAYES}

One line of algebra that turns a belief and a measurement into a new belief — and two incompatible ways of saying what "uncertain" means.

### Bayes' rule — the whole of inference on one line

$$p(\theta\mid \text{data}) = \frac{p(\text{data}\mid\theta)\,p(\theta)}{p(\text{data})} \;\propto\; \underbrace{p(\text{data}\mid\theta)}_{\text{likelihood}}\,\underbrace{p(\theta)}_{\text{prior}}$$

::: reveal
::: cols
::: col Where it was the whole method
- **Ch 2** — prior to posterior, conjugacy, and MAP as MLE plus a prior term. Regularisation turned out to *be* a prior.
- **Ch 3** — the same rule with many unknowns at once: marginalise the hidden variables, then normalise. The graph writes the joint as a product; *summing it back down* is where the cost lives.
- **Ch 4** — a prior over *functions*; the GP posterior is Bayes' rule with $\theta$ replaced by $f$.
:::
::: col.accent Where it was hiding
- **Ch 6** — CbAS writes its target as $p(x\mid S)\propto P(S\mid x)\,p(x\mid\theta^{(0)})$: ==the generative model is the prior and the oracle is the likelihood.==
- **Ch 5** — an ensemble's disagreement is a crude posterior width, used as an out-of-distribution alarm.
:::
:::
:::

::: reveal
::: keypoint
Belief in $=$ prior; belief out $=$ posterior; ==the data does the turning.==
:::
:::

### Frequentist and Bayesian — two readings of the same data

::: table center
| | Frequentist | Bayesian |
|---|---|---|
| **what is random** | $\theta$ fixed, the data random | the data fixed, $\theta$ random |
| **what varies** | variability *in the data* given $\theta$ | variability *in $\theta$* given the data |
| **the interval** | confidence: $\theta\in\mathrm{CI}$, or not | credible: $\Pr(\theta\in\mathrm{CR})=0.95$ |
| **the sentence** | 95% of repeated intervals cover $\theta$ | 95% chance $\theta$ lies in *this* region |
:::

::: reveal
::: small
The distinction is not pedantry. It is the MLE-versus-MAP, point-versus-distribution choice that Chapter 2 was built on, and it is why a Gaussian process reports a credible ==band== rather than a confidence *statement*.
:::
:::

### Both say 95%, and they are different claims

::: widget ci-vs-cr
Left, the frequentist picture: $\theta$ is a fixed vertical line and the *intervals* are what move — run the experiment 26 times and about 95% of them cover it. Right, the Bayesian picture: one dataset, and the *parameter* is what is spread. Chapter 2 ran this widget for the same reason.
:::

### The other two views — aleatoric and epistemic

::: cols
::: col Aleatoric — irreducible
The world is genuinely stochastic. Repeating the experiment gives a different answer, and no amount of data removes it. All you can do is *characterise* it, as a distribution.

Measurement noise $\sigma_Y^2$ (Ch 2), observation noise $\sigma_\epsilon^2$ on the GP diagonal (Ch 4), the transition kernel's own randomness (Ch 7).
:::
::: col.accent Epistemic — reducible
We simply do not know the model: its parameters, its state, its dynamics. ==Data shrinks it, and the whole course is a campaign against it.==

Parameter uncertainty $\tau_1^2$ (Ch 2), the GP band away from data (Ch 4), ensemble disagreement (Ch 5), and PETS' ensemble spread far from data, whose *per-member* variance is the aleatoric half (Ch 11).
:::
:::

::: reveal
::: small
Lecture 0 named the pair on the slide *Two kinds of uncertainty — name them once*; Chapter 2's Act 4 ended by writing them as the two terms of $\sigma_Y^2+\tau_1^2$. That is the law of total variance again — the *within* part is aleatoric, the *between* part epistemic — which is why this appendix keeps circling the same identity.
:::
:::

### Check — the estimator's wall

::: quiz A Monte Carlo estimate from $n$ samples has standard error $\sigma/\sqrt{n}$. To halve the error, you must:
- Double the number of samples
- =Quadruple the number of samples
- Halve $\sigma$; $n$ has no effect on the error
- Increase $n$ by a factor of $\sqrt{2}$
The $\sqrt{n}$ is a wall, not a slope: each additional digit of accuracy costs a hundredfold more samples. This single fact is why variance reduction is worth so much effort — baselines in Lecture 10, control variates, doubly-robust estimators in Lecture 12. Shrinking $\sigma$ buys what growing $n$ can only buy at enormous cost.
:::

## The multivariate Gaussian — the workhorse
{short: GAUSSIAN}

The single most-used distribution in the course. Four properties, and each one buys a chapter.

### The multivariate normal — definition

A random vector $Y=(Y_1,\dots,Y_k)$ is jointly Gaussian if

$$p(y) = \mathcal N(y\mid\mu,\Sigma) = \frac{1}{\sqrt{(2\pi)^k|\Sigma|}}\exp\!\Big(-\tfrac12 (y-\mu)^\top\Sigma^{-1}(y-\mu)\Big)$$

with $\E[Y]=\mu$ and $\mathrm{var}(Y)=\Sigma\succeq0$, $\Sigma_{ij}=\mathrm{cov}(Y_i,Y_j)$.

::: reveal
::: center
Four properties make it the backbone of ==Gaussian-process regression== — and of half the closed forms in this course.
:::
:::

::: reveal
::: small
Each is a one-line fact. Together they are why so much of the course can carry uncertainty *analytically* rather than by sampling: a Gaussian goes in, a Gaussian comes out, and the parameters update by matrix algebra rather than by an integral you cannot do.
:::
:::

### Property 1 — for Gaussians, uncorrelated means independent

Setting $\Sigma_{ij}=0$ for $i\ne j$ makes $\Sigma$ and $\Sigma^{-1}$ diagonal, so the joint density factors:

$$\Sigma \text{ diagonal} \;\Longrightarrow\; p(y)=\prod_i \mathcal N(y_i\mid\mu_i,\sigma_{ii})$$

::: reveal
For general random variables this is false. Take $X\sim\mathcal N(0,1)$ and $Y=X^2$: then $\mathrm{cov}(X,Y)=\E[X^3]=0$, and yet $Y$ is a *function* of $X$ — as dependent as two variables can be.
:::

::: reveal
::: keypoint
Zero correlation is a statement about ==second moments only.== ==The Gaussian is special== because it has nothing else.
:::
:::

::: reveal
::: small
*↪ every i.i.d. noise model in the course leans on this — it is what lets a diagonal $\Sigma$ stand in for genuine independence.*
:::
:::

### Property 2 — a linear map of a Gaussian is Gaussian

$$Z = AY \;\sim\; \mathcal N\big(A\mu,\; A\Sigma A^\top\big)$$

Both moments are just linearity: $\E[AY]=A\mu$ and $\mathrm{cov}(AY)=A\Sigma A^\top$. No integral is needed, and ==the family is closed under the operation== — which is the property that makes Gaussians tractable everywhere they appear.

::: reveal
::: small
*↪ the reparameterisation trick $z=\mu_\phi+\epsilon\sigma_\phi$ (Ch 6), and linear-Gaussian dynamics $x_{t+1}=Ax_t+Bu_t+w_t$ (Ch 9) — in both, a Gaussian is pushed through a linear map and must come out Gaussian for the method to close.*
:::
:::

### Properties 3 and 4 — marginals and conditionals stay Gaussian

**Property 3 — marginals are Gaussian.** Any sub-vector of a Gaussian is Gaussian; read off the matching blocks of $\mu$ and $\Sigma$ and ignore the rest. (It is Property 2 with a selector matrix.)

::: reveal
**Property 4 — conditionals are Gaussian.** The one that makes GP regression work. For

$$Z = \begin{bmatrix}Y_1\\Y_2\end{bmatrix}\sim\mathcal N\!\left(\begin{bmatrix}\mu_1\\\mu_2\end{bmatrix},\begin{bmatrix}\Sigma_{11}&\Sigma_{12}\\\Sigma_{21}&\Sigma_{22}\end{bmatrix}\right)
\;\Longrightarrow\;
Y_2\mid Y_1=y \;\sim\; \mathcal N\big(\underbrace{\mu_2+\Sigma_{21}\Sigma_{11}^{-1}(y-\mu_1)}_{\hl{\text{posterior mean}}},\; \underbrace{\Sigma_{22}-\Sigma_{21}\Sigma_{11}^{-1}\Sigma_{12}}_{\hl{\text{posterior covariance}}}\big)$$
:::

::: reveal
::: small
Read the two braces. The mean moves by ==how far the observation fell from its own mean, geared by the correlation==; the covariance drops by a term that does not depend on the observed *value* at all — which is why a GP's error bars can be planned before any data arrives, and why Chapter 4 could choose where to sample next.
:::
:::

### Conditioning, in your hands

::: widget gaussian-four {"seed":11}
Drag the mean, reshape $\Sigma$ with the correlation and scale controls, then drag the conditioning line $y_1=c$. The blue slice is the exact conditional: its mean slides along the regression line $\mu_2+\rho\frac{\sigma_2}{\sigma_1}(c-\mu_1)$ and its width shrinks to $\sigma_2\sqrt{1-\rho^2}$ — ==a factor that depends on the correlation and on nothing else.== The two presets are Chapter 4's own numbers.
:::

### Where Property 4 did the work

::: cols c3
::: col Ch 4 — the GP posterior
Take $Y_1=\mathbf y_{1:n}$ and $Y_2=f(x)$, so $\Sigma_{11}=\mathbf K+\sigma_\epsilon^2\mathbf I$, $\Sigma_{21}=\mathbf k^\top$, $\Sigma_{22}=k(x,x)$:

$$\mu(x\mid\mathcal D) = \mathbf k^\top(\mathbf K+\sigma_\epsilon^2\mathbf I)^{-1}\mathbf y$$

==A GP posterior is Gaussian conditioning, and nothing else.==
:::
::: col.accent Ch 2 — the weight posterior
With $y=\mathbf Xw+\epsilon$ and both $w$ and $\epsilon$ Gaussian, $w$ and $y$ are *jointly* Gaussian — so $p(w\mid\mathbf X,y)$ is Property 4 again.

It lands on $\mathcal N(\mu_w,\Sigma_w)$ with $\mu_w$ the ridge solution, $\lambda=\sigma^2/\alpha^2$.
:::
::: col Ch 9 — LQR with noise
The value is quadratic, $V(x)=x^\top P x$. Put Gaussian noise back into $x_{t+1}=Ax_t+Bu_t+w_t$ and

$$\E[x^\top P x] = \mu^\top P\mu + \mathrm{tr}(P\Sigma), \quad x\sim\mathcal N(\mu,\Sigma)$$

The noise adds a *constant*. The gain $K$ is unchanged — certainty equivalence, in one line.
:::
:::

::: reveal
::: small
Chapter 4 quantified this at two correlations from its own kernel. At $\mathrm{corr}(f_1,f_2)=0.966$ one observation shrinks the neighbour's standard deviation to $\sqrt{1-0.966^2}=0.259$ of the prior — *a narrow spike*. Four points apart, at $\mathrm{corr}=0.573$, it shrinks only to $0.820$ — *barely narrower than the prior*, a value you still have to buy. Both are $\sqrt{1-\rho^2}$ and nothing more.
:::
:::

### Check — the property everything rests on

::: quiz Which property of the multivariate Gaussian is used most often in this course?
- That it maximises entropy for a given mean and covariance
- That the sum of independent Gaussians is Gaussian
- =That conditioning on part of the vector leaves a Gaussian, with a closed form for its mean and covariance
- That it is the limit distribution of the central limit theorem
Gaussian conditioning **is** the Gaussian process posterior, and the GP posterior is Lecture 4's entire engine and Lecture 5's surrogate. Marginals stay Gaussian, conditionals stay Gaussian, and linear maps of Gaussians stay Gaussian — which together are why so much of this course has closed-form answers instead of sampling loops.
:::

## Sampling and divergences
{short: SAMPLING}

What to do when the integral has no closed form — and how to say that one distribution is far from another.

### Monte Carlo — when the integral is intractable

When an expectation has no closed form, ==estimate it by sampling:==

$$\E_{x\sim p}[g(x)] \;\approx\; \hat\mu_N = \frac1N\sum_{i=1}^N g(x_i), \qquad x_i\sim p$$

unbiased by construction, with standard error $\sigma_g/\sqrt N$ by the central limit theorem — where $\sigma_g^2=\mathrm{var}_p(g)$.

::: reveal
::: small
This is the quiet foundation of *model-free* reinforcement learning. When the expectation over unknown dynamics cannot be computed, average over sampled trajectories instead: Monte-Carlo returns and TD targets (Ch 8), REINFORCE and advantage estimates (Ch 10), and the ELBO's reconstruction term, which the reparameterisation trick turns into a one-sample average (Ch 6). *↪ Ch 8 and 10 — the entire data-driven half of the course.*
:::
:::

::: reveal
::: keypoint
For an i.i.d. average the rate $1/\sqrt N$ is fixed by the central limit theorem. ==The constant $\sigma_g$ is entirely yours to choose.==
:::
:::

### Importance sampling — sample here, answer about there

$$\E_{x\sim p}[g(x)] = \E_{x\sim q}\Big[\underbrace{\tfrac{p(x)}{q(x)}}_{\text{weight } w(x)}g(x)\Big] \qquad\text{for any } q \text{ with } q>0 \text{ wherever } pg\ne0$$

::: reveal
::: cols
::: col Where it worked — Ch 6
CbAS cannot draw from $p(x\mid S)$ directly, so it draws from the previous iterate and reweights. The ladder exists precisely to keep $q$ close to the target, ==so the weights never get the chance to explode.==
:::
::: col.accent Where it is the whole problem — Ch 12
Off-policy evaluation scores a policy you may not deploy, by reweighting a dataset another policy collected. The weight is a *product over the horizon*, so its variance grows with $T$ — which is why the chapter reaches for doubly-robust estimators.
:::
:::
:::

::: reveal
::: small
Unbiased for *any* legal $q$. The catch is entirely in the variance: $\mathrm{var}_q(wg)$ can be far smaller than $\mathrm{var}_p(g)$, far larger, or infinite — and unbiasedness will not warn you which.
:::
:::

### The rate is fixed; the proposal sets the constant

::: widget mc-estimator {"seed":12345}
Estimating $\Pr(X>3)=1.35\times10^{-3}$ for $X\sim\mathcal N(0,1)$. Both clouds of points fall as $1/\sqrt N$ and sit on their own exact $\sigma/\sqrt N$ line: the rate is not negotiable. What moves is the constant — a proposal aimed at the event needs ==339 samples for 10% accuracy, plain sampling needs 74,000, and one aimed the wrong way needs 3.4 million== and returns a confident zero until it does not.
:::

### KL divergence and entropy — comparing distributions

$$\mathrm{KL}(p\,\|\,q) = \E_{x\sim p}\Big[\log\tfrac{p(x)}{q(x)}\Big] \;\ge\; 0, \qquad =0 \iff p=q$$

Not symmetric, and not a metric — but the natural *information cost* of using $q$ where $p$ is true. For Gaussians it is closed form, which is why it can sit inside a loss: $\mathrm{KL}\big(\mathcal N(0,1)\|\mathcal N(0,2)\big)=0.318$ while the reverse is $0.807$.

::: reveal
- **Ch 6, the VAE.** The ELBO's KL term pulls the encoder onto the prior, which is what makes the latent space ==samplable==: without it $q_\phi$ is free to encode anywhere and new draws decode to nothing.
- **Ch 6, generative training.** Minimising KL to the data distribution *is* maximum likelihood; minimising JS instead is the GAN. Same shape, different divergence, different failure mode.
- **Ch 10, trust regions.** TRPO maximises an importance-weighted advantage subject to $\E[\mathrm{KL}(\pi_{\text{old}}\|\pi_\theta)]\le\delta$ — the largest step that keeps the new policy *close in behaviour*, not close in parameters. PPO recovers the effect with a clip.
:::

::: reveal
::: small
**Entropy** $H(p)=-\E_p[\log p(x)]$ measures spread rather than distance. Maximising it keeps a policy exploratory — the seed of maximum-entropy RL — and it is the term that turns a hard argmax into a soft, probabilistic best response.
:::
:::

### Check — which divergence, and why it is asymmetric

::: quiz The KL divergence $\mathrm{KL}(q \Vert p)$ is not symmetric. In variational inference, minimising it over $q$ produces what behaviour?
- $q$ spreads out to cover every mode of $p$
- The asymmetry has no practical consequence for the fitted $q$
- $q$ matches the mean and variance of $p$ exactly
- =$q$ is penalised heavily for putting mass where $p$ has none, so it tends to fit a single mode and under-cover
The integrand carries $q \log(q/p)$: wherever $q$ is large and $p$ is near zero the penalty explodes, but where $p$ is large and $q$ near zero it costs almost nothing. So this direction is **mode-seeking** — it would rather explain part of the distribution well than all of it badly. That is the tendency behind a VAE's blurry, over-averaged samples in Lecture 6.
:::

## Closing
{short: CLOSING}

Everything above, on one page.

### The toolbox map — one glance
{fill: top}

::: table center
| Probability tool | Lectures that depend on it |
|---|---|
| expectation, linearity | all of Part IV — returns and values |
| law of total expectation | the Bellman equation (Ch 7–11) |
| law of total variance | the predictive split (Ch 2, 4); baselines and advantage (Ch 10) |
| Bayes' rule | Ch 2, 3, 4; CbAS's target (Ch 6) |
| Gaussian, **Property 4** | ==Ch 4 — the GP posterior *is* this formula== |
| Gaussian, linear map | Ch 6 (reparameterisation), Ch 9 (LQR noise) |
| Monte Carlo estimation | Ch 8, 10 — model-free RL |
| importance sampling | Ch 6 (CbAS), Ch 12 (off-policy evaluation) |
| KL, entropy | Ch 6 (VAE), Ch 10 (TRPO) |
:::

### Two objects, and the rest is bookkeeping
{fill: center}

::: keypoint
The whole course manipulates an ==expectation== — what we believe will happen on average — and a ==Gaussian== — the one uncertainty we can carry in closed form.
:::

::: reveal
Everything else is how to **update** them (Bayes, conjugacy, conditioning), how to **estimate** them when the integral will not close (Monte Carlo, importance sampling), or how to **bound the gap** between two of them (KL, trust regions).
:::

::: reveal
::: small
Keep this appendix beside the main lectures. Whenever a derivation moves quickly through a probability step — a swapped expectation, a conditional that stays Gaussian, a sample average standing in for an integral — the justification is one of the ten rows above, and the pointer beside it says where to look.
:::
:::

### An expectation, and a Gaussian.
{layout: standout}

Update them, estimate them, or bound the gap between them — that is the course.
