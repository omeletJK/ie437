---
ch: 2
title: Fundamentals on Bayesian Statistics
subtitle: From coin tossing to Bayesian regression
tagline: Model → update → predict, one example at a time
blurb: >-
  Follow the original lecture from coin tossing through conjugate models to regression.
  Work each model, try an experiment, and explain the result before moving on.
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
  - What does the coin teach us?
  - How does the model change?
  - How do we learn a regression?
---

### Fundamentals on Bayesian Statistics
{layout: title}

## 1 · Introduction and Bayes’ rule
{short: 01 · FOUNDATIONS}

Start with the original coin question: what is its probability of heads? Compare statistical viewpoints, then learn the update rule.

### Where we are — the coefficients must be learned
| Previous step | This chapter's question |
|---|---|
| Lecture 1 optimized a specified model. | Now represent an unknown parameter using a distribution. |

Keep the likelihood, posterior and prediction target separate. The temperature example will distinguish an unknown mean from measurement noise.

::: keypoint
Update a temperature mean and distinguish parameter uncertainty from a new noisy reading.
:::

### Statistics works backwards from data to a model
::: flow
- **Model** | $\theta$: probability of heads
- **Data** | $D=(H,H,T)$: observed tosses
:::

Given $\theta$, the model tells us which data are plausible. Given data, inference asks which values of $\theta$ remain plausible. This alone is not a claim of causal identification.

::: reveal
::: cols c2
::: col Observation uncertainty
$$Y_i\mid\theta\sim\mathrm{Bernoulli}(\theta).$$

Even if $\theta$ were known, the next toss would remain random.
:::
::: col.accent Parameter uncertainty
We do not know $\theta$. A Bayesian distribution over $\theta$ represents **our uncertainty about it**; it does not require the physical coin to change on every toss.
:::
:::
:::

::: note
Source alignment: original Lecture 2 PDF 3.
:::

### Two approaches, both able to quantify uncertainty
::: cols c2
::: col Frequentist
$\theta$ is fixed but unknown. Evaluate an estimator or interval over repeated datasets from the model.

For $S$ heads in $n$ independent tosses, $\hat\theta=S/n$ is unbiased, with

$$\mathrm{Var}(\hat\theta\mid\theta)=\frac{\theta(1-\theta)}{n}.$$

Small samples give **high variance**, not automatic bias. Confidence intervals and bootstrap distributions also express uncertainty.
:::
::: col.accent Bayesian
Specify a prior $p(\theta)$, then condition on the observed dataset to obtain $p(\theta\mid D)$.

This supports posterior intervals and predictions averaged over plausible parameters.

The prior and likelihood are modelling choices. Check their implications and compare reasonable alternatives.
:::
:::

::: keypoint
The distinction is ==what the probability statement describes==, not whether uncertainty matters.
:::

::: note
Source alignment: original Lecture 2 PDF 4–7.
:::

### The lecture route — keep each example together
**Bring:** Conditional probability, sums and a Gaussian distribution.

| First pass | What to do |
|---|---|
| **Follow the idea** | Specify → update → predict → check; repeat for coins, counts and regression |
| **Work without the solution** | Update a temperature mean and distinguish parameter uncertainty from a new noisy reading. |
| **Return later** | Complete-square derivations and additional conjugate calculations are in the appendix. |

::: keypoint
For the temperature thread: **predict → calculate → reveal and check → change one condition**. Complete the core calculation before reading the research extensions.
:::

### Bayes' rule — name each part before using it
::: qstrip
:::

$$\underbrace{p(\theta\mid\mathrm{data})}_{\hl{\text{posterior}}}
\;=\;
\frac{\overbrace{p(\mathrm{data}\mid\theta)}^{\textcolor{#16A34A}{\text{likelihood}}}\;\;\overbrace{p(\theta)}^{\textcolor{#D97706}{\text{prior}}}}
     {\underbrace{p(\mathrm{data})}_{\text{evidence}}}$$

::: widget bayes-anatomy
:::

::: reveal
::: small
The **evidence** $p(\mathrm{data})=\int p(\mathrm{data}\mid\theta)\,p(\theta)\,\mathrm{d}\theta$ is the probability of the data over every candidate at once. It does not depend on $\theta$, so it only rescales the curve — which is why *posterior $\propto$ likelihood $\times$ prior* is usually all you write.
:::
:::

::: reveal
::: keypoint
Prior in, posterior out. ==The likelihood tells us how to reweight the candidates.==
:::
:::

::: note
Source alignment: original Lecture 2 PDF 8–9.
:::

### Why Bayes' rule works
The same joint probability can be factored in two orders:

$$p(\theta,D)=p(D\mid\theta)p(\theta)=p(\theta\mid D)p(D).$$

::: reveal
Divide by the evidence $p(D)>0$:

$$p(\theta\mid D)=\frac{p(D\mid\theta)p(\theta)}{p(D)}.$$
:::

::: reveal
::: keypoint
**Multiply** prior by likelihood, then **normalise** so the posterior sums or integrates to 1.
:::
:::

::: note
Source alignment: original Lecture 2 PDF 8.
:::

### Two candidate coins — Bayes' rule with numbers
{sub: an illustrative calculation before the continuous case}

A coin is either fair ($\theta=0.5$) or head-biased ($\theta=0.8$), with equal prior probabilities. We observe **two heads**, conditionally independently.

::: table
| Candidate | Prior | Likelihood of HH | Product | Posterior |
|---|---|---|---|---|
| $\theta=0.5$ | $0.5$ | $0.5^2=0.25$ | $0.125$ | $0.125/0.445=0.281$ |
| $\theta=0.8$ | $0.5$ | $0.8^2=0.64$ | $0.320$ | $0.320/0.445=0.719$ |
:::

::: reveal
The evidence is $p(HH)=0.125+0.320=0.445$. Dividing by it makes the posterior probabilities add to 1.
:::

::: keypoint
Two heads favour the biased coin, but ==do not prove which coin we have.==
:::

::: note
Source alignment: original Lecture 2 PDF 8–10.
:::

### Likelihood scores the candidate parameters
For the observed sequence $D=(H,H,T)$, conditional independence gives

$$L(\theta;D)=p(D\mid\theta)=\theta\cdot\theta\cdot(1-\theta)=\theta^2(1-\theta).$$

::: cols c2
::: col Fix the parameter
$p(D\mid\theta)$ is a probability over possible datasets. For a fixed $\theta$, these probabilities add to 1.
:::
::: col.accent Fix the observed data
$L(\theta;D)$ compares candidate values of $\theta$. It need not integrate to 1 over $\theta$ and is not yet a posterior.
:::
:::

::: small
For continuous $\theta$, $p(\theta)$ is a **density**: interval areas are probabilities and $P(\theta=\theta_0)=0$. A density may exceed 1. This differs from the two discrete candidates on the previous slide.
:::

::: note
Source alignment: original Lecture 2 PDF 10–11.
:::

### One toss, a sequence, and a count
::: qstrip
:::

Assume $Y_i\mid\theta$ are independent Bernoulli variables. Let $S=\sum_{i=1}^nY_i$.

::: table
| What is observed? | Probability given $\theta$ | For two heads in three tosses |
|---|---|---|
| One toss $Y_i$ | $\theta^{Y_i}(1-\theta)^{1-Y_i}$ | Head: $\theta$ |
| One particular sequence | $\theta^S(1-\theta)^{n-S}$ | HHT: $\theta^2(1-\theta)$ |
| Only the total $S$ | $\binom nS\theta^S(1-\theta)^{n-S}$ | HHT, HTH, THH: $3\theta^2(1-\theta)$ |
:::

::: keypoint
The factor $\binom nS$ counts the sequences. It is constant in $\theta$, so it changes the data probability but ==not the MLE or posterior shape.==
:::

::: note
Source alignment: original Lecture 2 PDF 11.
:::

### The coin MLE — maximise the log likelihood
For $0<S<n$, taking logs turns the product into a sum:

$$\ell(\theta)=S\log\theta+(n-S)\log(1-\theta)+\text{constant}.$$

::: reveal
$$\ell'(\theta)=\frac{S}{\theta}-\frac{n-S}{1-\theta}=0
\quad\Longrightarrow\quad S(1-\theta)=(n-S)\theta
\quad\Longrightarrow\quad \hat\theta_{\rm ML}=\frac Sn.$$
:::

::: reveal
The second derivative is negative on $(0,1)$, so this is the maximum. For HHT, $\hat\theta_{\rm ML}=2/3$.
:::

::: small
If $S=0$ or $S=n$, the maximum is at the boundary, $0$ or $1$; there is no interior derivative-zero solution. Here $S$ is sufficient for $\theta$: the order adds no information under this model.
:::

::: note
Source alignment: original Lecture 2 PDF 12.
:::

### Experiment 1 — repeat the coin experiment
::: widget ch02-experiments {"mode":"sampling"}
**Predict:** will 100 tosses vary less than 5? **Try:** change tosses per experiment, then repeat the 200 experiments. **Explain:** the coin stays fixed; the datasets and their estimates change.
:::

::: note
Source alignment: original Lecture 2 PDF 4–7, 11–12.
:::

### The Bayesian move — carry a distribution
::: table
| Object | Question it answers | Coin example |
|---|---|---|
| **Prior** $p(\theta)$ | What is plausible before these data? | How biased might the coin be? |
| **Likelihood** $p(D\mid\theta)$ | How compatible is each candidate with the data? | How likely is HHT for this bias? |
| **Posterior** $p(\theta\mid D)$ | What is plausible after these data? | Which biases still have support? |
| **Predictive** $p(\tilde Y\mid D)$ | What might happen next? | How many heads in future tosses? |
:::

::: reveal
::: keypoint
The parameter and the next observation are different unknowns. ==A distribution over one is not a distribution over the other.==
:::
:::

::: note
Source alignment: original Lecture 2 PDF 13.
:::

### Prior, posterior, predictive — keep the target clear
::: qstrip
:::

::: table
| Distribution | Random quantity | Information used |
|---|---|---|
| Prior $p(\theta)$ | parameter | before observing $D$ |
| Prior predictive $p(\tilde y)$ | possible data | prior + sampling model |
| Posterior $p(\theta\mid D)$ | parameter | prior + observed data |
| Posterior predictive $p(\tilde y\mid D)$ | future observation | posterior + sampling model |
:::

::: keypoint
Posterior: **what might the parameter be?** Predictive: **what might we observe?**
:::

::: note
Source alignment: original Lecture 2 PDF 14.
:::

### Check — what the distribution is over
::: quiz A Bayesian writes $p(\theta)$ for a physical constant with one true, fixed value. What does the distribution describe?
- =Our uncertainty about the fixed unknown
- The constant changing on every measurement
- The histogram of future observations
- Nothing: a fixed quantity cannot be described probabilistically
The distribution represents **epistemic** uncertainty. Data can reduce it when informative. **Aleatoric** uncertainty is variation in future observations conditional on the model's parameters; learning the parameter alone does not remove that variation.
:::

::: note
Source alignment: original Lecture 2 PDF 13–14.
:::

## 2 · Bayesian estimation for coin flipping
{short: 02 · BAYESIAN COIN}

Keep the same coin: choose a Beta prior, observe heads and tails, quantify uncertainty, and predict the next tosses.

### A Beta prior — location and strength
Use a density supported on the possible coin biases, $0<\theta<1$:

$$p(\theta)=\frac{1}{B(\alpha,\beta)}\theta^{\alpha-1}(1-\theta)^{\beta-1},\qquad \alpha,\beta>0.$$

::: cols c2
::: col Where is the belief centred?
$$\E[\theta]=\frac{\alpha}{\alpha+\beta}.$$

$\mathrm{Beta}(2,2)$ centres at $1/2$; $\mathrm{Beta}(2,8)$ centres at $1/5$.
:::
::: col.accent How strong is that belief?
At a fixed mean, larger $\alpha+\beta$ gives smaller variance. $\mathrm{Beta}(20,20)$ is much more concentrated than $\mathrm{Beta}(2,2)$.
:::
:::

::: small
$B(\alpha,\beta)$ makes the density integrate to 1. The parameters act like pseudo-counts in the update; they need not represent actual past flips. Uniform $\mathrm{Beta}(1,1)$ is still a choice of prior.
:::

::: note
Source alignment: original Lecture 2 PDF 15–17.
:::

### Derive the posterior by collecting powers
Start with a Beta prior and observe $S$ heads in $n$ tosses:

$$\begin{aligned}
p(\theta\mid D)&\propto\underbrace{\theta^S(1-\theta)^{n-S}}_{\text{likelihood}}
\underbrace{\theta^{\alpha-1}(1-\theta)^{\beta-1}}_{\text{prior}}\\[4pt]
&=\theta^{\alpha+S-1}(1-\theta)^{\beta+n-S-1}.
\end{aligned}$$

::: reveal
Recognise a Beta density and restore its normalising constant:

$$\hl{\theta\mid D\sim\mathrm{Beta}(\alpha+S,\ \beta+n-S).}$$
:::

::: keypoint
==Add heads to the first parameter; add tails to the second.== For a $\mathrm{Beta}(2,2)$ prior and HHT, the posterior is $\mathrm{Beta}(4,3)$.
:::

::: note
Source alignment: original Lecture 2 PDF 18.
:::

### Sequential updating — do not count old data twice
The posterior after one batch becomes the prior before the next batch:

::: flow
- **Prior** | $\mathrm{Beta}(2,2)$
- **Observe HH** | $\mathrm{Beta}(4,2)$
- !**Observe T** | $\mathrm{Beta}(4,3)$
:::

::: reveal
Updating once with HHT gives exactly the same answer. More generally,

$$p(\theta\mid D_1,D_2)\propto p(D_2\mid\theta)\,p(\theta\mid D_1),$$

when the batches are conditionally independent given $\theta$.
:::

::: keypoint
The old data is already in $p(\theta\mid D_1)$. ==Multiply by the new likelihood once.==
:::

::: note
Source alignment: original Lecture 2 PDF 18–19.
:::

### Bayesian coin updating — the first five tosses
::: figure coin-update-early | 1000
Redrawn from original p. 19, retaining all six early states. Start from Beta(1,1): each head adds 1 to α and each tail adds 1 to β. The dashed line marks θ = 0.5.
:::

::: keypoint
Read left to right, then down. ==The first two heads pull the curve right; the next tail pulls it back.==
:::

::: note
Source alignment: original Lecture 2 PDF 19.
:::

### Bayesian coin updating — from 8 to 500 tosses
::: figure coin-update-late | 900
Redrawn from original p. 19 with its exact counts: 5/8, 9/15, 26/50 and 259/500. Every curve has area 1; the vertical density scales differ.
:::

::: keypoint
The final two observed proportions are similar. ==The larger dataset supports a much more precise estimate.==
:::

::: note
Source alignment: original Lecture 2 PDF 19.
:::

### What does Beta(4,3) actually tell us?
The same HHT dataset and $\mathrm{Beta}(2,2)$ prior give several useful summaries:

::: table
| Summary | Calculation | Meaning |
|---|---|---|
| Posterior mean | $4/(4+3)=0.571$ | Average bias under the posterior |
| Posterior mode (MAP) | $(4-1)/(4+3-2)=0.600$ | Most dense part of the posterior |
| 95% credible interval | approximately $[0.223,\ 0.882]$ | Middle 95% of posterior probability |
| Probability of next head | $\E[\theta\mid D]=4/7$ | A prediction about a future toss |
:::

::: reveal
::: keypoint
Three tosses leave substantial uncertainty. ==The mean, mode and interval answer different questions.==
:::
:::

::: note
Source alignment: original Lecture 2 PDF 18–21.
:::

### Experiment 2 — repeat an interval procedure
::: widget ci-vs-cr
**Predict:** must all 26 intervals cover the true value? **Try:** run the repeated experiments. **Explain:** compare the long-run coverage statement on the left with posterior probability for the observed dataset on the right.
:::

::: note
Source alignment: original Lecture 2 PDF 20–21.
:::

### Read the two 95% statements carefully
::: cols c2
::: col Confidence interval
Before drawing data, the random interval $C(D)$ covers a fixed parameter in 95% of repeated experiments:

$$P_\theta\{\theta\in C(D)\}=0.95.$$

Once $D$ is observed, the interval is fixed. Coverage alone does not assign 95% probability to that particular interval containing $\theta$.
:::
::: col.accent Credible interval
After observing $D$, an interval $C$ contains 95% of the **posterior probability**:

$$P(\theta\in C\mid D)=0.95.$$

This is conditional on the prior, likelihood and data. Its repeated-sampling coverage need not be 95%.
:::
:::

::: small
The previous picture uses Normal observations with known noise and a flat prior on the mean. The endpoints coincide in that special case; the interpretations still differ.
:::

::: note
Source alignment: original Lecture 2 PDF 20–21.
:::

### The posterior mean is a balance — in numbers
For the coin model,

$$\E[\theta\mid D]=\frac{\alpha+S}{\alpha+\beta+n}
=\frac{\alpha+\beta}{\alpha+\beta+n}\frac{\alpha}{\alpha+\beta}
+\frac{n}{\alpha+\beta+n}\frac Sn.$$

::: reveal
For $\mathrm{Beta}(2,2)$ and HHT, this becomes

$$\underbrace{\frac47}_{\text{posterior mean}}
=\underbrace{\frac47}_{\text{prior weight}}\underbrace{\frac12}_{\text{prior mean}}
+\underbrace{\frac37}_{\text{data weight}}\underbrace{\frac23}_{\text{sample proportion}}.$$
:::

::: keypoint
Compare **sample size $n$** with **prior strength $\alpha+\beta$**. Small $n$ alone does not tell us which dominates.
:::

::: note
Source alignment: original Lecture 2 PDF 22.
:::

### Experiment 3 — change the prior, keep the data
::: widget bayes-update {"preset":"HHT"}
**Predict:** which prior resists HHT most? **Try:** load HHT, switch the prior, then simulate more tosses. **Explain:** compare the displayed prior/data weights. H and T record hypothetical outcomes; simulated tosses use a fixed bias of 0.62.
:::

::: note
Source alignment: original Lecture 2 PDF 18–23.
:::

### Does more data always make a posterior narrower?
**On average, yes**, in the following precise sense. The average is over possible datasets under the joint model:

$$\mathrm{Var}(\theta)=\E_D[\mathrm{Var}(\theta\mid D)]+\mathrm{Var}_D(\E[\theta\mid D]).$$

::: reveal
The last term is non-negative, so the expected posterior variance cannot exceed the prior variance. Also $\E_D[\E(\theta\mid D)]=\E(\theta)$.
:::

::: reveal
::: block One surprising observation can widen it
A $\mathrm{Beta}(1,20)$ prior has variance $0.00206$. After one head, $\mathrm{Beta}(2,20)$ has variance $0.00359$. The surprising head challenges a strong belief in tails.
:::
:::

::: note
Source alignment: original Lecture 2 PDF 23.
:::

### From estimating the coin to predicting its next toss
The posterior answers **which coin biases are plausible**. A prediction asks **what might happen next**.

$$p(\tilde y\mid D)=\int p(\tilde y\mid\theta)\,p(\theta\mid D)\,d\theta.$$

::: reveal
For the Beta(4,3) posterior after HHT,

$$P(\tilde Y=1\mid D)=\int_0^1\theta\,p(\theta\mid D)\,d\theta=\frac47.$$
:::

::: keypoint
==Average the next-toss prediction over the plausible biases.== For one Bernoulli outcome, plugging in the posterior mean gives exactly the same distribution.
:::

::: note
Source alignment: original Lecture 2 PDF 14, 24.
:::

### Predicting a batch — one uncertain coin is shared
Let $K$ count heads in **$m$ future tosses**. All tosses use the same unknown $\theta$.

::: cols c2
::: col One fixed bias
Plug in $\theta=4/7$:

$$K\sim\mathrm{Binomial}(m,4/7).$$

The future trials are independent under this fixed-bias model.
:::
::: col.accent Average over plausible biases
Use $\theta\mid D\sim\mathrm{Beta}(4,3)$:

$$K\mid D\sim\mathrm{BetaBinomial}(m,4,3).$$

The shared uncertainty creates extra variation in the total count.
:::
:::

::: keypoint
For two tosses, $P(K=0,1,2\mid D)=(3/14,6/14,5/14)$. ==Try one toss, then a batch, on the next slide.==
:::

::: note
Source alignment: original Lecture 2 PDF 24, 29–31.
:::

### Experiment 4 — predict one toss, then a batch
::: widget bayes-predictive {"mode":"coin"}
**Predict:** do the two predictions agree for one toss? **Try:** set future tosses to 1, then 10, then 30. **Explain:** the posterior stays Beta(4,3); more future tosses share the same uncertain bias.
:::

::: note
Source alignment: original Lecture 2 PDF 24, 31.
:::

### Three steps in Bayesian approaches
::: flow
- **1 · Modelling** | specify the sampling model and a prior
- !**2 · Inference** | condition on data to obtain the posterior
- **3 · Checking** | use predictions to assess the model and its implications
:::

For the coin: Bernoulli/Binomial + Beta → updated Beta → predictions of future heads.

::: keypoint
We have completed one full example. ==Keep these steps; change the data model next.==
:::

::: note
Source alignment: original Lecture 2 PDF 25.
:::

### Check — who wins as the data piles up?
::: quiz With a fixed $\mathrm{Beta}(\alpha,\beta)$ prior and independent Bernoulli observations, what happens to the prior weight in the posterior mean as $n$ grows?
- It stays fixed because the prior was chosen first
- =It tends to zero: $(\alpha+\beta)/(\alpha+\beta+n)\to0$
- It grows because the posterior becomes more concentrated
- It becomes exactly zero after $n=\alpha+\beta$
This is exact for the specified Beta–Binomial model. At $n=\alpha+\beta$, prior and data weights are equal. At finite $n$ the prior still has positive weight. General claims about posterior concentration require additional assumptions.
:::

::: note
Source alignment: original Lecture 2 PDF 22–25.
:::

## 3 · Conjugate pairs
{short: 03 · CONJUGATE MODELS}

Repeat the coin workflow in the original order: counts with Poisson–Gamma, measurements with Normal–Normal, and categories with Multinomial–Dirichlet.

### Conjugacy — recognise the same family after updating
A prior is **conjugate** to a likelihood when the posterior stays in the prior's family. We can recognise and normalise the result analytically.

::: table
| Data model and unknown quantity | Prior | Posterior |
|---|---|---|
| Binomial success probability | Beta | Beta |
| Poisson rate | Gamma (shape, rate) | Gamma |
| Normal mean, variance known | Normal | Normal |
| Normal variance, mean known | Inverse Gamma | Inverse Gamma |
| Normal mean and precision both unknown | Normal–Gamma | Normal–Gamma |
| Multinomial category probabilities | Dirichlet | Dirichlet |
:::

::: small
Conjugacy is algebraic convenience. It does not establish model fit or make every posterior mean a simple average of prior and sample means. Unknown Normal mean and variance require an appropriate joint prior.
:::

::: note
Source alignment: original Lecture 2 PDF 26–28.
:::

### Binomial–Beta recap — our template for the next models
::: table
| Step | Coin calculation |
|---|---|
| Sampling model | $S\mid\theta\sim\mathrm{Binomial}(n,\theta)$ |
| Prior | $\theta\sim\mathrm{Beta}(\alpha,\beta)$ |
| Posterior | $\theta\mid D\sim\mathrm{Beta}(\alpha+S,\beta+n-S)$ |
| Prediction | One toss: posterior mean; a batch: Beta–Binomial |
:::

::: keypoint
==Choose a model for the observations, update its parameters, then predict observations again.== The next model counts events rather than successes out of a fixed number of trials.
:::

::: note
Source alignment: original Lecture 2 PDF 29–32.
:::

### Counting events — why Poisson and Gamma?
Let $Y_i$ count events in equal observation windows, with a common unknown rate $\lambda$:

::: cols c2
::: col Poisson likelihood
$$p(Y_i=y_i\mid\lambda)=\frac{\lambda^{y_i}e^{-\lambda}}{y_i!}.$$

$Y_i$ is a non-negative integer. Its conditional mean and variance both equal $\lambda$.
:::
::: col.accent Gamma prior
$$p(\lambda)=\frac{b^a}{\Gamma(a)}\lambda^{a-1}e^{-b\lambda}.$$

$\lambda>0$. Here $a$ is **shape** and $b$ is **rate**, with mean $a/b$ and variance $a/b^2$.
:::
:::

::: small
We use $a,b$ for Gamma to distinguish them from the coin's Beta parameters. A Gamma **scale** would be $1/b$, not $b$.
:::

::: note
Source alignment: original Lecture 2 PDF 33.
:::

### Poisson–Gamma updating — counts and exposure add
For conditionally independent, equal-exposure counts,

$$\begin{aligned}
p(\lambda\mid D)&\propto\lambda^{\sum_i y_i}e^{-n\lambda}\cdot\lambda^{a-1}e^{-b\lambda}\\
&=\lambda^{a+\sum_i y_i-1}e^{-(b+n)\lambda}.
\end{aligned}$$

::: reveal
$$\lambda\mid D\sim\mathrm{Gamma}(a+\textstyle\sum_i y_i,\ b+n),\qquad
\E[\lambda\mid D]=\frac{b}{b+n}\frac ab+\frac{n}{b+n}\bar y.$$
:::

::: keypoint
==Add events to the shape; add exposure to the rate.== If $Y_i\mid\lambda\sim\mathrm{Poisson}(t_i\lambda)$, replace $n$ by total exposure $\sum_i t_i$.
:::

::: note
Source alignment: original Lecture 2 PDF 34–35.
:::

### The original example — Pokémon counts in 20 districts
::: cols c2
::: col
::: figure pokemon-map-source | 370
Map from the original PDF, p. 36. Counts are the source's teaching dataset.
:::
:::
::: col The observations
14, 13, 7, 10, 15, 15, 2, 13, 13, 11, 10, 13, 5, 13, 9, 12, 9, 12, 8, 7.

**Twenty districts:** $n=20$, total $\sum_i y_i=211$, average $\bar y=10.55$.
:::
:::

::: reveal
The source specifies prior mean 20 and standard deviation 10. In shape–rate notation,

$$\frac ab=20,\qquad \frac{a}{b^2}=100
\quad\Longrightarrow\quad b=0.2,\qquad a=4.$$
:::

::: small
The model treats districts as comparable units with one common rate. Unequal areas, search effort or spatial dependence require a richer model or exposure adjustment.
:::

::: note
Source alignment: original Lecture 2 PDF 36.
:::

### The count estimate — calculate, then interpret
$$\lambda\mid D\sim\mathrm{Gamma}(4+211,\ 0.2+20)=\mathrm{Gamma}(215,20.2).$$

::: cols c2
::: col What is the estimated rate?
$$\E[\lambda\mid D]=\frac{215}{20.2}=10.644.$$

The prior weight is $0.2/20.2\approx0.99\%$. The data pulls the estimate close to 10.55.
:::
::: col.accent How uncertain is that rate?
$$\mathrm{Var}(\lambda\mid D)=\frac{215}{20.2^2}=0.527.$$

Posterior standard deviation: **0.726**. Central 95% credible interval: approximately **[9.27, 12.11]**.
:::
:::

::: keypoint
This interval describes the **common rate $\lambda$**. It is not a prediction interval for the count in one new district.
:::

::: note
Source alignment: original Lecture 2 PDF 35–37.
:::

### Experiment 5 — observe the districts one by one
::: widget ch02-experiments {"mode":"poisson"}
**Predict:** will 20 districts outweigh the original prior? **Try:** move from 0 to 1 to 20 districts; then increase prior exposure while keeping its mean fixed. **Explain:** distinguish uncertainty in the rate from variability in a new district.
:::

::: note
Source alignment: original Lecture 2 PDF 35–37.
:::

### Predict one new district — rate uncertainty is not count noise
Return to $\lambda\mid D\sim\mathrm{Gamma}(215,20.2)$. For one comparable new district, $\tilde Y\mid\lambda\sim\mathrm{Poisson}(\lambda)$.

::: reveal
The law of total variance gives

$$\begin{aligned}
\E[\tilde Y\mid D]&=\E[\lambda\mid D]=10.644,\\
\mathrm{Var}(\tilde Y\mid D)&=\underbrace{\E[\lambda\mid D]}_{\text{count noise}}
+\underbrace{\mathrm{Var}(\lambda\mid D)}_{\text{rate uncertainty}}\\
&\approx10.644+0.527\approx11.17.
\end{aligned}$$
:::

::: keypoint
The rate's posterior standard deviation is **0.726**; a new count's predictive standard deviation is **3.342**. ==Knowing the rate well does not make every district identical.==
:::

::: small
The predictive distribution is Negative Binomial, a Poisson–Gamma mixture. Its probability mass function and parameter convention are in the appendix.
:::

::: note
Source alignment: original Lecture 2 PDF 37.
:::

### Normal observations — combine information by precision
Let $Y_i\mid\theta\sim\mathcal N(\theta,\sigma^2)$ independently, with known noise variance, and $\theta\sim\mathcal N(\mu_0,\tau_0^2)$.

::: cols c2
::: col Data information
The sample mean satisfies

$$\bar Y\mid\theta\sim\mathcal N(\theta,\sigma^2/n).$$

Its **precision**, inverse variance, is $n/\sigma^2$.
:::
::: col.accent Prior information
Prior precision is $1/\tau_0^2$. Completing the square gives posterior precision

$$\frac{1}{\tau_1^2}=\frac{1}{\tau_0^2}+\frac{n}{\sigma^2}.$$
:::
:::

::: reveal
$$\mu_1=\frac{(1/\tau_0^2)\mu_0+(n/\sigma^2)\bar y}{1/\tau_0^2+n/\sigma^2},\qquad
\theta\mid D\sim\mathcal N(\mu_1,\tau_1^2).$$
:::

::: note
Source alignment: original Lecture 2 PDF 38–42.
:::

### Four temperature readings — calculate the update
Prior: the unknown temperature is $\theta\sim\mathcal N(20,2^2)$. Measurement noise has standard deviation 3. Four readings have average 23.

::: table
| Information | Mean | Variance | Precision |
|---|---|---|---|
| Prior | 20 | $2^2=4$ | $1/4$ |
| Average of four readings | 23 | $3^2/4=2.25$ | $4/9$ |
| Posterior | **21.92** | **1.44** | $1/4+4/9=25/36$ |
:::

::: reveal
$$\mu_1=\frac{(1/4)20+(4/9)23}{1/4+4/9}=21.92,\qquad \tau_1=1.2.$$
:::

::: keypoint
The readings pull the estimate upward. They do not erase the prior after only four measurements.
:::

::: note
Source alignment: original Lecture 2 PDF 40–42.
:::

### Temperature thread — update an uncertain temperature
{sub: shared teaching example · predict before revealing the calculation}

The true temperature $\theta$ has prior $\mathcal N(20,4)$. One sensor reading is $y=22$, with $y\mid\theta\sim\mathcal N(\theta,1)$. The second parameter here is variance.

**Predict:** Will the posterior mean be closer to 20 or to 22? Will its variance equal the variance of a new reading?

::: reveal
**Calculate and check.** The gain is $K=4/(4+1)=0.8$. The posterior mean is $20+0.8(22-20)=\mathbf{21.6}$ and variance is $(1-0.8)4=\mathbf{0.8}$. A new reading with independent sensor noise has predictive variance $0.8+1=\mathbf{1.8}$.
:::

::: keypoint
Learning the unknown temperature and predicting another noisy measurement are different questions.
:::

### Try it — the sensor variance rises to 4
{sub: work independently · reveal only after writing an answer}

Keep the prior and the observed value 22. Change the sensor variance from 1 to 4, for both this and the next reading. Find the posterior mean, posterior variance and predictive variance.

::: reveal
**Check your answer.** $K=4/(4+4)=0.5$, posterior mean **21**, posterior variance **2**, predictive variance **6**. The less precise reading pulls the posterior less strongly.
:::

::: keypoint
State which distribution each variance belongs to before adding or comparing numbers.
:::

### Experiment 6 — vary precision with the same average
::: widget ch02-experiments {"mode":"normal"}
**Predict:** does noisier data move the estimate closer to 20 or 23? **Try:** change noise SD, prior SD, and the number of readings. **Explain:** the average stays at 23; precision determines its weight. The grey likelihood is normalised for plotting.
:::

::: note
Source alignment: original Lecture 2 PDF 39–42.
:::

### Normal prediction — restore the observation noise
The updated mean parameter is $\theta\mid D\sim\mathcal N(\mu_1,\tau_1^2)$. A new reading is $\tilde Y=\theta+\epsilon$, with independent $\epsilon\sim\mathcal N(0,\sigma^2)$.

$$\tilde Y\mid D\sim\mathcal N(\mu_1,\ \tau_1^2+\sigma^2).$$

::: reveal
For the previous four readings:

$$\theta\mid D\sim\mathcal N(21.92,1.44),\qquad
\tilde Y\mid D\sim\mathcal N(21.92,10.44).$$
:::

::: keypoint
Same centre, different uncertainty. ==Learning the temperature does not remove noise from the thermometer.==
:::

::: note
Source alignment: original Lecture 2 PDF 43–44.
:::

### Experiment 7 — compare the mean and the next reading
::: widget bayes-predictive {"mode":"normal"}
**Predict:** which curve keeps a noise floor? **Try:** increase readings from 1 to 100. **Explain:** posterior parameter variance shrinks, while predictive variance remains 9 plus that variance. Here noise SD is fixed at 3 and prior SD at 2.
:::

::: note
Source alignment: original Lecture 2 PDF 43–44.
:::

### More than two outcomes — the Dirichlet update
{sub: the original PDF's categorical model, pp. 46–47}

Suppose each service request is **delivery**, **pickup** or **return**. The probabilities form a vector $\theta$ with non-negative entries adding to 1.

$$\theta\sim\mathrm{Dirichlet}(\alpha_1,\alpha_2,\alpha_3),\qquad
(Y_1,Y_2,Y_3)\mid\theta\sim\mathrm{Multinomial}(n,\theta).$$

::: reveal
The likelihood adds one count to the corresponding exponent for each observation:

$$\theta\mid D\sim\mathrm{Dirichlet}(\alpha_1+Y_1,\alpha_2+Y_2,\alpha_3+Y_3).$$
:::

::: keypoint
==The Beta update with a longer list of categories.== With two categories, the Dirichlet reduces to a Beta distribution for the first probability.
:::

::: note
Source alignment: original Lecture 2 PDF 45–46.
:::

### An unseen category need not get zero probability
Start from $\mathrm{Dirichlet}(1,1,1)$ and observe ten requests: **6 deliveries, 4 pickups, 0 returns**.

::: table
| Category | Count | MLE | Posterior parameter | Next-request probability |
|---|---|---|---|---|
| Delivery | 6 | $6/10$ | $1+6=7$ | $7/13$ |
| Pickup | 4 | $4/10$ | $1+4=5$ | $5/13$ |
| Return | 0 | $0/10$ | $1+0=1$ | $1/13$ |
:::

::: reveal
The posterior is $\mathrm{Dirichlet}(7,5,1)$ and predictive probabilities add to 1. The prior gives an unseen but possible category some support.
:::

::: keypoint
This update can estimate the rows of a transition matrix. ==Ten observations without a return do not prove returns are impossible.==
:::

::: note
Source alignment: original Lecture 2 PDF 46–47.
:::

### Experiment 8 — observe a previously unseen category
::: widget ch02-experiments {"mode":"categories"}
**Predict:** is a return impossible after zero observed returns? **Try:** add Return, change the prior strength, then clear the data. **Explain:** posterior parameters are prior pseudo-counts plus observed counts; divide by their sum to predict one request.
:::

::: note
Source alignment: original Lecture 2 PDF 46–47.
:::

### Check — what uncertainty belongs in a new measurement?
{q: 3}

::: quiz With known noise variance $\sigma^2$ and posterior mean variance $\tau_1^2$, what is the variance of the next Normal observation?
- Only $\tau_1^2$, because the posterior contains everything
- Only $\sigma^2$, because the parameter has been estimated
- Zero once enough observations have arrived
- =$\tau_1^2+\sigma^2$, because both sources contribute
The unknown mean and independent noise both vary in the predictive calculation. More data learns the mean but does not eliminate the assumed observation noise. We will use exactly this idea for regression.
:::

::: note
Source alignment: original Lecture 2 PDF 43–47.
:::

## 4 · Bayesian regression and regularisation
{short: 04 · REGRESSION}

Follow the original regression route: formulate the task, solve least squares, interpret MLE, keep a Bayesian posterior, then motivate and interpret regularisation.

### Problem solving — estimate a housing price
::: figure housing-model-flow | 1080
Redrawn from the task → model → algorithm structure of original p. 50. The two house-price observations are illustrative, not an empirical housing dataset.
:::

::: keypoint
We now learn a vector of weights. ==The Bayesian logic stays the same as for a coin, a rate, or a mean.==
:::

::: note
Source alignment: original Lecture 2 PDF 49–51.
:::

### Regression roadmap — the same model from several views
We keep $y_i=x_i^\top w+\epsilon_i$ throughout.

::: flow
- **1 · Optimisation** | minimise squared residuals → normal equation
- **2 · MLE** | Gaussian noise → the same least-squares fit
- !**3 · Full Bayes and MAP** | prior + likelihood → posterior; its peak is MAP
- **4 · Regularisation** | shrink weights → ridge or lasso; interpret the prior
:::

::: keypoint
==One regression model, several ways to describe what learning means.== We will connect the objectives instead of introducing unrelated methods.
:::

::: note
Source alignment: original Lecture 2 PDF 52.
:::

### Put a line into matrix form
Include the intercept by adding a constant feature 1. For the illustrative data $(x,y)=(0,1),(1,2),(2,2)$,

$$X=\begin{pmatrix}1&0\\1&1\\1&2\end{pmatrix},\qquad
w=\begin{pmatrix}w_0\\w_1\end{pmatrix},\qquad
y=\begin{pmatrix}1\\2\\2\end{pmatrix},\qquad
Xw=\begin{pmatrix}w_0\\w_0+w_1\\w_0+2w_1\end{pmatrix}.$$

::: reveal
::: keypoint
Each row is one observation. Each column is one feature. ==The residual vector is $y-Xw$.==
:::
:::

::: small
In general $X\in\mathbb R^{n\times d}$, $w\in\mathbb R^d$ and $y\in\mathbb R^n$. Here $d$ includes the intercept. Keep this orientation throughout the derivation.
:::

::: note
Source alignment: original Lecture 2 PDF 53–54.
:::

### Least squares — use Lecture 1's optimality condition
Choose weights to minimise squared residuals:

$$J(w)=\frac12\lVert y-Xw\rVert^2,\qquad \nabla J(w)=X^\top(Xw-y).$$

::: reveal
The Hessian is $X^\top X\succeq0$, so $J$ is convex. Therefore

$$\hat w\text{ minimises }J\quad\Longleftrightarrow\quad X^\top X\hat w=X^\top y.$$
:::

::: keypoint
This is the **normal equation**. The zero-gradient condition is exact here because the problem is convex, differentiable and unconstrained.
:::

::: small
Only when $X$ has full column rank is the minimiser unique and $(X^\top X)^{-1}X^\top y$ valid. Otherwise minimisers are not unique; use QR or SVD methods for the linear algebra instead of explicitly forming an inverse.
:::

::: note
Source alignment: original Lecture 2 PDF 55–56.
:::

### Solve the three-point regression by hand
For the previous three observations,

$$X^\top X=\begin{pmatrix}3&3\\3&5\end{pmatrix},\qquad X^\top y=\begin{pmatrix}5\\6\end{pmatrix}.$$

::: reveal
The normal equation gives $3w_0+3w_1=5$ and $3w_0+5w_1=6$. Subtract to get $w_1=1/2$, then $w_0=7/6$.
:::

::: reveal
$$\hat y=\begin{pmatrix}7/6\\5/3\\13/6\end{pmatrix},\qquad
y-\hat y=\begin{pmatrix}-1/6\\1/3\\-1/6\end{pmatrix},\qquad
\lVert y-\hat y\rVert^2=1/6.$$
:::

::: keypoint
A best-fitting line need not pass through every point. ==It balances the residuals to minimise their squared total.==
:::

::: note
Source alignment: original Lecture 2 PDF 55–56.
:::

### Why Gaussian noise turns MLE into least squares
Assume independent noise $\epsilon_i\sim\mathcal N(0,\sigma^2)$, with known $\sigma^2>0$:

$$p(y\mid X,w)=\prod_{i=1}^n\frac{1}{\sqrt{2\pi\sigma^2}}
\exp\!\left[-\frac{(y_i-x_i^\top w)^2}{2\sigma^2}\right].$$

::: reveal
Take the negative log:

$$-\log p(y\mid X,w)=\underbrace{\frac n2\log(2\pi\sigma^2)}_{\text{constant in }w}
+\frac{1}{2\sigma^2}\lVert y-Xw\rVert^2.$$
:::

::: keypoint
For fixed $\sigma^2$, ==maximising this likelihood is exactly minimising squared error.== Least squares itself does not require Gaussian noise; this probabilistic interpretation does.
:::

::: note
Source alignment: original Lecture 2 PDF 57–58.
:::

### Experiment 9 — move the line and watch its residuals
::: widget ch02-experiments {"mode":"residuals"}
**Predict:** does making one residual zero minimise the total error? **Try:** adjust intercept and slope, then select Fit least squares. **Explain:** the same minimiser gives SSE = 1/6 and maximises the displayed Gaussian likelihood.
:::

::: note
Source alignment: original Lecture 2 PDF 53–58.
:::

### From MLE to Bayesian regression
::: cols c2
::: col MLE: choose one weight vector
$$\hat w_{\rm ML}=\argmax_w p(y\mid X,w).$$

We retain the weight vector giving the largest likelihood.
:::
::: col.accent Bayesian: update a distribution
$$p(w\mid X,y)\propto p(y\mid X,w)p(w).$$

MAP is its most dense point; full Bayes also keeps the spread and correlations.
:::
:::

::: keypoint
==The prior acts on weights, just as the Beta prior acted on the coin bias.== A Gaussian prior makes this update analytically tractable.
:::

::: note
Source alignment: original Lecture 2 PDF 59–61.
:::

### Full Bayes keeps the distribution over weights
With independent noise $\epsilon_i\sim\mathcal N(0,\sigma^2)$ and prior $w\sim\mathcal N(0,\tau^2I)$, the posterior is also Gaussian:

$$w\mid X,y\sim\mathcal N(\mu_w,\Sigma_w).$$

::: cols c2
::: col The centre
$$\mu_w=\Sigma_w\frac{X^\top y}{\sigma^2}.$$

Here the mean and mode coincide, so $\mu_w$ is also the MAP estimate. Later we will connect it to ridge regression.
:::
::: col.accent The uncertainty
$$\Sigma_w^{-1}=\frac{X^\top X}{\sigma^2}+\frac{I}{\tau^2}.$$

Data precision plus prior precision. Large posterior variance marks directions in the weights that remain uncertain.
:::
:::

::: small
Complete the square in the log posterior to obtain these expressions; the derivation is in the appendix. Known positive $\sigma^2$ and $\tau^2$ are assumed.
:::

::: note
Source alignment: original Lecture 2 PDF 60–61.
:::

### Bayesian regression — one posterior in two spaces
::: figure regression-posterior-grid | 950
Original p. 62’s two-row, three-column layout, recomputed with nested simulated datasets (n = 2, 10, 100). Blue: MLE; green: posterior mean/MAP and sampled lines; ×: true weights. Corresponding axes use common scales.
:::

::: keypoint
Top: plausible mean functions. Bottom: plausible weights. ==More informative data contracts both views of the same posterior.==
:::

::: note
Source alignment: original Lecture 2 PDF 62.
:::

### Experiment 10 — change data, watch the posterior over a line
::: widget bayes-regression
**Predict:** which fit is most unstable with two cases? **Try:** compare 2, 10, and 100 nested cases, then draw new data. **Explain:** the left panel shows sampled mean functions; the right shows the same uncertainty in coefficient space.
:::

::: note
Source alignment: original Lecture 2 PDF 59–62.
:::

### Regression prediction — a line and a noisy observation
At a new feature vector $x_*$, the fitted mean is $f_*=x_*^\top w$. Since $w\mid D\sim\mathcal N(\mu_w,\Sigma_w)$,

$$f_*\mid D\sim\mathcal N\!\left(x_*^\top\mu_w,\ x_*^\top\Sigma_w x_*\right).$$

::: reveal
An individual response also includes noise, $\tilde Y_*=f_*+\epsilon_*$:

$$\tilde Y_*\mid D\sim\mathcal N\!\left(x_*^\top\mu_w,
\underbrace{x_*^\top\Sigma_w x_*}_{\text{parameter uncertainty}}+\underbrace{\sigma^2}_{\text{observation noise}}\right).$$
:::

::: keypoint
Drawing posterior lines shows uncertainty about the mean function. ==Add noise to predict actual observations.== Both depend on the linear model being appropriate.
:::

::: note
Source alignment: original Lecture 2 PDF 62.
:::

### When the integral is hard — simulate the two stages
For $s=1,\dots,M$:

::: flow
- **1 · Draw a parameter** | $\theta^{(s)}\sim p(\theta\mid D)$
- !**2 · Draw an observation** | $\tilde y^{(s)}\sim p(\tilde y\mid\theta^{(s)})$
- **3 · Summarise** | histogram, quantiles, event probabilities
:::

::: reveal
For regression, draw $w^{(s)}$ from its Gaussian posterior, then draw noise and set $\tilde y_*^{(s)}=x_*^\top w^{(s)}+\epsilon_*^{(s)}$.
:::

::: small
Conjugate examples allow direct sampling. Other models may require MCMC or an approximation, whose accuracy must be checked. See the [Stan posterior prediction guide](https://mc-stan.org/docs/stan-users-guide/posterior-prediction.html) for the same two-stage construction.
:::

::: note
Source alignment: original Lecture 2 PDF 62.
:::

### Why regularise a regression?
The original goal is to predict **new observations**, not only to fit the training cases.

::: cols c2
::: col A flexible fit
Extra features can lower training error. With limited or correlated data, fitted weights may change substantially when the sample changes.
:::
::: col.accent A controlled fit
Penalising large weights can reduce this sensitivity. We accept some fitting bias in exchange for potentially better predictions.
:::
:::

$$\hat w_{\rm ridge}=\argmin_w\{\|y-Xw\|^2+\lambda_2\|w\|^2\}.$$

::: keypoint
==Check the tradeoff on independent validation data.== Neither more flexibility nor more shrinkage is automatically better.
:::

::: note
Source alignment: original Lecture 2 PDF 63–65.
:::

### Why shrinkage helps — and what it changes
Ridge changes the normal equation to

$$\big(X^\top X+\lambda_2 I\big)\hat w=X^\top y.$$

::: cols c2
::: col Small or correlated datasets
Several weight vectors may fit almost equally well. Small data perturbations can then produce large changes in the OLS weights.

Adding $\lambda_2I$ makes the system positive definite for $\lambda_2>0$ and stabilises these directions.
:::
::: col.accent The tradeoff
Shrinkage introduces bias toward the prior mean for potentially lower variance. It can help prediction but does not guarantee better test performance.

Choose strength with prior knowledge and appropriate validation; inspect feature scaling.
:::
:::

::: small
The Gaussian-posterior example gives all weights a prior. The next experiment leaves the intercept unpenalised; applications often treat it separately.
:::

::: note
Source alignment: original Lecture 2 PDF 64–65.
:::

### Experiment 11 — compare training fit with validation error
::: widget ch02-experiments {"mode":"regularisation"}
**Predict:** must the best training fit predict best? **Try:** sweep λ on one fixed dataset, then change its size or draw new training data. **Explain:** polynomial features keep the model linear in its weights; validation data stays separate and fixed.
:::

::: note
Source alignment: original Lecture 2 PDF 63–66.
:::

### Add a Gaussian prior — derive ridge, not just name it
Let $w\sim\mathcal N(0,\tau^2I)$ with known $\tau^2>0$. The negative log posterior is

$$-\log p(w\mid X,y)=\frac{1}{2\sigma^2}\lVert y-Xw\rVert^2
+\frac{1}{2\tau^2}\lVert w\rVert^2+\text{constant}.$$

::: reveal
Multiply by $2\sigma^2$, which does not change the minimiser:

$$\hat w_{\rm MAP}=\argmin_w\left\{\lVert y-Xw\rVert^2+\lambda_2\lVert w\rVert^2\right\},\qquad
\hl{\lambda_2=\sigma^2/\tau^2.}$$
:::

::: keypoint
A smaller prior variance penalises large weights more strongly. The regulariser is the **negative log prior**, with the noise scale accounted for.
:::

::: note
Source alignment: original Lecture 2 PDF 67–68.
:::

### Lasso — a different prior changes the penalty
Independent Laplace priors with scale $b_L>0$ have

$$p(w)=\prod_j\frac{1}{2b_L}e^{-|w_j|/b_L}.$$

::: reveal
With the same Gaussian likelihood,

$$\hat w_{\rm MAP}=\argmin_w\left\{\lVert y-Xw\rVert^2+\lambda_1\lVert w\rVert_1\right\},\qquad
\lambda_1=\frac{2\sigma^2}{b_L}.$$
:::

::: keypoint
The absolute-value penalty has a corner at zero, so some **MAP coefficients** can be exactly zero. A continuous Laplace prior has **no probability mass at the single point zero**.
:::

::: note
Source alignment: original Lecture 2 PDF 66, 69.
:::

### Experiment 12 — see why ridge shrinks and lasso can select
::: widget ridge-lasso-prior
**Predict:** which constraint has corners on the axes? **Try:** change λ and switch between ridge and lasso. **Explain:** the contact point is the fitted weight vector. Priors are scaled to peak height 1 to compare shapes; this illustration uses noise variance 1.
:::

::: note
Source alignment: original Lecture 2 PDF 65–69.
:::

### Check — the prior wearing a disguise
{q: 4}

::: quiz Under Gaussian noise, what prior gives MAP the ridge objective $\lVert y-Xw\rVert^2+\lambda_2\lVert w\rVert^2$?
- A Laplace prior, because ridge selects exact zeros
- A uniform prior over all of $\mathbb R^d$
- =A zero-mean Gaussian prior with variance $\tau^2=\sigma^2/\lambda_2$
- No prior can produce a regularisation term
Taking the negative log turns the Gaussian likelihood into squared residuals and the Gaussian prior into a squared-weight penalty. For this unaveraged objective, $\lambda_2=\sigma^2/\tau^2$. Averaging the data loss by $n$ changes the coefficient convention.
:::

::: note
Source alignment: original Lecture 2 PDF 67–69.
:::

### What we can now calculate
::: table
| Task | Calculation | Example |
|---|---|---|
| Update a belief | posterior $\propto$ prior $\times$ likelihood | Beta(2,2) + HHT → Beta(4,3) |
| Choose a point | MLE, MAP or a loss-based posterior summary | Gaussian prior + Gaussian noise → ridge |
| Predict data | average the sampling model over the posterior | uncertain Poisson rate → Negative Binomial |
| Check the model | simulate, compare and revise | replicated counts or regression residuals |
:::

::: reveal
::: keypoint
Lecture 3 asks how to represent many interacting variables. ==Conditional independence makes a large probabilistic model manageable.==
:::
:::

::: note
Source alignment: original Lecture 2 PDF 70.
:::

### Questions?
{layout: standout}

Can you explain which uncertainty is over a parameter, which is over an observation, and where each appears in the calculation?

::: note
Source alignment: original Lecture 2 PDF 70.
:::

## Appendix · extra derivations and checks
{short: APPENDIX}

Optional details for questions and self-study; the main lecture has completed the original route.

### Reading guide — one Bayesian calculation, several observation models
{sub: one main idea to explain, one comparison, one application}

| Role | Read or revisit | Question to answer |
|---|---|---|
| **Core** | [Murphy, *Probabilistic Machine Learning: An Introduction* (2022): probability, Bayesian statistics and linear regression sections](https://probml.github.io/pml-book/book1.html) | What distribution is specified, updated, and used for prediction? |
| **Compare** | MLE, MAP and full Bayes on the same coin or regression data | Which answer is a point estimate, and which carries uncertainty? |
| **Apply** | The original Pokémon district counts and housing-price example | How does the observation model affect the estimate and prediction? |

::: keypoint
Use selected sections as a reference, not the entire book as an assignment. For each example write the likelihood, prior, posterior and predictive target before doing algebra.
:::

### Backup — integrate the Beta–Binomial prediction
{math: compact}

Write $\alpha'=\alpha+S$, $\beta'=\beta+n-S$. For $K$ heads in **$m$ future tosses**,

$$\begin{aligned}
P(K=k\mid D)&=\int_0^1\binom mk\theta^k(1-\theta)^{m-k}
\frac{\theta^{\alpha'-1}(1-\theta)^{\beta'-1}}{B(\alpha',\beta')}\,d\theta\\[4pt]
&=\binom mk\frac{B(\alpha'+k,\beta'+m-k)}{B(\alpha',\beta')}.
\end{aligned}$$

::: reveal
For $m=2$ and $\mathrm{Beta}(4,3)$, probabilities of $K=0,1,2$ are $3/14,6/14,5/14$. They sum to 1.
:::

::: small
Before observing data, use $\alpha,\beta$ to obtain the **prior predictive**. With a $\mathrm{Beta}(2,2)$ prior and two tosses, its probabilities are $0.3,0.4,0.3$. Future batch size $m$ need not equal training size $n$.
:::

::: note
Source alignment: original Lecture 2 PDF 24, 31.
:::

### Backup — MLE, MAP and posterior mean
::: table
| Estimate | Definition | Beta(2,2) prior + HHT |
|---|---|---|
| **MLE** | $\argmax_\theta p(D\mid\theta)$ | $2/3$ |
| **MAP** | $\argmax_\theta p(\theta\mid D)=\argmax_\theta p(D\mid\theta)p(\theta)$ | $3/5$ |
| **Posterior mean** | $\E[\theta\mid D]$ | $4/7$ |
:::

::: reveal
MAP picks the posterior's mode. The posterior mean minimises posterior expected squared-error loss; the posterior median minimises expected absolute-error loss.
:::

::: small
The posterior mode depends on the parameterisation. With abundant informative data and suitable regularity, MLE and MAP may become close; they need not be identical for a finite sample.
:::

### Backup — when does prior influence fade?
In the Beta–Binomial model, for a fixed proper Beta prior,

$$\text{prior weight}=\frac{\alpha+\beta}{\alpha+\beta+n}\longrightarrow0.$$

::: reveal
This does not mean any prior can be overcome in any model:

- An identifiable model needs informative observations about the parameter.
- A prior excluding a whole region cannot acquire posterior mass there by multiplication.
- Model misspecification can produce confident but misleading conclusions.
:::

::: keypoint
Check prior sensitivity when data is limited. ==More data is not a substitute for a plausible model.==
:::

### Backup — checking a fitted probability model
::: cols c2
::: col Before fitting: prior predictive check
Draw parameters from the prior, then simulate data. Do plausible parameters produce plausible counts, prices or temperatures?
:::
::: col.accent After fitting: posterior predictive check
Draw parameters from the posterior and simulate replicated datasets of the same design. Compare their spread, extremes and patterns with the observations.
:::
:::

::: reveal
**For the Pokémon example:** compare the observed mean 10.55 and sample variance 11.94 with replicated 20-district datasets. Also examine exposure and spatial patterns. Mean–variance similarity alone does not establish the Poisson assumptions.
:::

::: keypoint
Use a mismatch to improve the model. Evaluate future prediction on held-out data too; checking training data is not a test of generalisation.
:::

::: small
Workflow reference: [Stan, posterior and prior predictive checks](https://mc-stan.org/docs/stan-users-guide/posterior-predictive-checks.html).
:::

### Backup — Beta–Binomial normalisation and moments
{math: compact}

Let $S$ heads be observed in $n$ tosses and let $\alpha'=\alpha+S$, $\beta'=\beta+n-S$.

$$p(\theta\mid D)=\frac{\theta^{\alpha'-1}(1-\theta)^{\beta'-1}}{B(\alpha',\beta')},\qquad
B(a,b)=\frac{\Gamma(a)\Gamma(b)}{\Gamma(a+b)}.$$

$$\E[\theta\mid D]=\frac{\alpha'}{\alpha'+\beta'},\qquad
\mathrm{Var}(\theta\mid D)=\frac{\alpha'\beta'}{(\alpha'+\beta')^2(\alpha'+\beta'+1)}.$$

For $K$ heads in $m$ future tosses and $\mu=\alpha'/(\alpha'+\beta')$,

$$P(K=k\mid D)=\binom mk\frac{B(\alpha'+k,\beta'+m-k)}{B(\alpha',\beta')},\qquad
\mathrm{Var}(K\mid D)=m\mu(1-\mu)\frac{\alpha'+\beta'+m}{\alpha'+\beta'+1}.$$

::: small
$\E[K\mid D]=m\mu$. The multiplier of Binomial variance is 1 at $m=1$ and greater than 1 at $m>1$. Future tosses share one latent bias; independently resampling a bias for each toss would be a different model.
:::

### Backup — the Poisson–Gamma predictive distribution
{math: compact}

With posterior $\lambda\mid D\sim\mathrm{Gamma}(a',b')$ in **shape–rate** form, a new unit-exposure count has

$$\begin{aligned}
P(\tilde Y=k\mid D)&=\int_0^\infty\frac{\lambda^ke^{-\lambda}}{k!}
\frac{b'^{a'}}{\Gamma(a')}\lambda^{a'-1}e^{-b'\lambda}\,d\lambda\\[4pt]
&=\frac{\Gamma(k+a')}{\Gamma(a')k!}
\left(\frac{b'}{b'+1}\right)^{a'}\left(\frac{1}{b'+1}\right)^k,\quad k=0,1,\ldots
\end{aligned}$$

$$\E[\tilde Y\mid D]=\frac{a'}{b'},\qquad
\mathrm{Var}(\tilde Y\mid D)=\frac{a'}{b'}+\frac{a'}{b'^2}.$$

::: small
This is Negative Binomial with shape $a'$ and probability $b'/(b'+1)$ under the displayed convention; $a'$ need not be an integer. For future exposure $t$, the mean is $ta'/b'$ and variance $ta'/b'+t^2a'/b'^2$.
:::

### Backup — the Dirichlet predictive distribution
{math: compact}

For category counts $y_j$, let $\alpha'_j=\alpha_j+y_j$ and $A'=\sum_j\alpha'_j$. Then

$$p(\theta\mid D)\propto\prod_j\theta_j^{\alpha'_j-1},\qquad
P(\tilde Y=j\mid D)=\frac{\alpha'_j}{A'}.$$

For a future batch of size $m$ with counts $k_j$ adding to $m$,

$$P(K_1=k_1,\ldots,K_c=k_c\mid D)
=\frac{m!}{\prod_j k_j!}\frac{\Gamma(A')}{\Gamma(A'+m)}
\prod_j\frac{\Gamma(\alpha'_j+k_j)}{\Gamma(\alpha'_j)}.$$

::: keypoint
This is the **Dirichlet–Multinomial** distribution. Updated $\alpha'_j$ give the posterior predictive; original $\alpha_j$ give the prior predictive.
:::

### Backup — complete the square for the Normal mean
{math: compact}

Independent $Y_i\mid\theta\sim\mathcal N(\theta,\sigma^2)$, known $\sigma^2$, prior $\theta\sim\mathcal N(\mu_0,\tau_0^2)$:

$$\begin{aligned}
\log p(\theta\mid D)&=-\frac{1}{2\sigma^2}\sum_i(y_i-\theta)^2
-\frac{1}{2\tau_0^2}(\theta-\mu_0)^2+C\\
&=-\frac12\left[\left(\frac n{\sigma^2}+\frac1{\tau_0^2}\right)\theta^2
-2\left(\frac{n\bar y}{\sigma^2}+\frac{\mu_0}{\tau_0^2}\right)\theta\right]+C'\\
&=-\frac{(\theta-\mu_1)^2}{2\tau_1^2}+C''.
\end{aligned}$$

$$\tau_1^2=\left(\frac n{\sigma^2}+\frac1{\tau_0^2}\right)^{-1},\qquad
\mu_1=\tau_1^2\left(\frac{n\bar y}{\sigma^2}+\frac{\mu_0}{\tau_0^2}\right).$$

::: small
$C,C',C''$ do not depend on $\theta$. A new observation is $\theta$ plus independent Gaussian noise, so its predictive distribution is $\mathcal N(\mu_1,\tau_1^2+\sigma^2)$.
:::

### Backup — complete the square for regression weights
{math: compact}

With $w\sim\mathcal N(0,\tau^2I)$ and $y\mid X,w\sim\mathcal N(Xw,\sigma^2I)$,

$$\begin{aligned}
\log p(w\mid X,y)&=-\frac{1}{2\sigma^2}(y-Xw)^\top(y-Xw)-\frac{1}{2\tau^2}w^\top w+C\\
&=-\frac12w^\top\left(\frac{X^\top X}{\sigma^2}+\frac I{\tau^2}\right)w
+w^\top\frac{X^\top y}{\sigma^2}+C'\\
&=-\frac12(w-\mu_w)^\top\Sigma_w^{-1}(w-\mu_w)+C''.
\end{aligned}$$

$$\Sigma_w=\left(\frac{X^\top X}{\sigma^2}+\frac I{\tau^2}\right)^{-1},\qquad
\mu_w=\Sigma_w\frac{X^\top y}{\sigma^2}.$$

::: small
Positive noise and prior variances make the precision positive definite even if $X$ lacks full column rank. The Gaussian posterior mean equals its MAP. Posterior covariance is the information a point estimate omits.
:::

### Backup — why Lasso can select an exact zero
For one coordinate, write the objective, up to a constant, as

$$q(w_j)=a_jw_j^2-2r_jw_j+\lambda_1|w_j|,\qquad a_j>0.$$

::: reveal
At zero, $\partial|w_j|=[-1,1]$. The optimality condition is

$$0\in-2r_j+\lambda_1[-1,1]\quad\Longleftrightarrow\quad |r_j|\le\lambda_1/2.$$
:::

::: reveal
Otherwise the solution is the soft-thresholded value

$$w_j=\frac{\operatorname{sign}(r_j)}{a_j}\max(|r_j|-\lambda_1/2,0).$$
:::

::: small
This is a property of MAP optimisation. A continuous Laplace prior and the resulting continuous posterior have no atom at zero; full posterior samples are not sparse in this exact-zero sense.
:::
