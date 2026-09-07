---
ch: 5
title: Data-Driven Design Optimization — Surrogate-Based
subtitle: A surrogate you optimise against will be exploited where it is wrong
tagline: Offline, part 1 of 2 — approximate the function, then search it
blurb: >-
  The oracle is gone: a fixed dataset, and no way to test a new design. Fit a surrogate, optimise
  against it, and the optimiser walks straight into the region where the surrogate is confidently
  wrong. That failure — and the conservative models that answer it — is the whole chapter.
course: IE437 · Data-Driven Decision Making and Control
author: Jinkyoo Park
institute: KAIST
cube:
  stages: static
  model: data-driven
  agents: single agent
inherits: "`argmax f` with a GP, but the oracle removed (Lecture 4)"
handoff: a forward model then search, and the warning that the optimiser is an adversary (Lecture 6)
questions:
  - What changes offline?
  - Why does it fail?
  - How do we fix it?
  - What else helps?
---

### Data-Driven Design Optimization — Surrogate-Based
{layout: title}

## The handoff — optimisation with no oracle
{short: HANDOFF}

Lecture 4 could *query* the expensive function whenever it wished. Take the query away and the same loop turns on itself.

### Where we are — the query is taken away

::: tracker
:::

::: table center
|   | Model-based (certain) | Data-driven (uncertain) |
|---|---|---|
| **Static, single** | optimisation *(Lec 1)* | belief *(Lec 2–3)* · acting on belief *(Lec 4)* · ==design from a fixed dataset *(Lec 5–6)*== |
:::

Lecture 4 built a posterior over an unknown $f$ and then *acted* — chose a point, queried it, folded the answer back in. Often you cannot. The data is already collected and ==fixed==: a database of proteins and their activity, of alloys and their strength, of accelerator layouts and their latency. No new experiments; the budget was spent, or the wet lab is closed, or one evaluation costs a month.

::: reveal
::: small
Lecture 4 leaves us $\argmax_x f(x)$ with a GP — and this lecture ==removes the oracle==. Same cell of the cube: static, data-driven, single agent, and the same goal as Lecture 1. What has been taken away is not the model but the right to check.
:::
:::

### Five ways to optimise a black box, and what every one of them needs
{sub: what the source lecture spends fifteen slides establishing}

| method | what it does | what it costs |
|---|---|---|
| **Gradient ascent on a proxy** | fit $f_\theta$ to the data so far, step $x_{t+1} = x_t + \eta\nabla_x f_\theta(x_t)$, evaluate | one query per step |
| **Genetic algorithms** | population, truncation selection of the top $E$, crossover, mutation | $N$ queries per generation |
| **CMA-ES** | sample from an adaptive Gaussian $\mathcal N(\mathbf m_t,\sigma_t^2 C_t)$; update mean, covariance and step size | $n$ queries per generation |
| **Bayesian optimisation** *(Lec 4)* | GP posterior, then $x_{t+1} = \argmax_x A_t(x)$ | one query per round |
| **Policy gradient** | learn $\pi_\theta(x)$ by $\nabla_\theta\E_{x\sim\pi_\theta}[f(x)] = \E[\nabla_\theta\log\pi_\theta(x)\,f(x)]$ | $n$ queries per round |

::: reveal
::: keypoint
Every one of the five is a loop, and every loop closes through ==an evaluation of the real $f$.==
:::
:::

### The problem, and the two routes out of it

The offline problem is that loop with one line struck out — and it is exactly Lecture 1's goal under a harsh new constraint:

$$\text{find}\quad x^* = \argmax_x f(x) \qquad\text{with \hl{only} a fixed dataset } D = \{(x_1,f(x_1)),\dots,(x_N,f(x_N))\}$$

::: reveal
This is ==offline model-based optimisation==. Two routes exist, and they open the next two lectures:
:::

::: reveal
::: cols
::: col.accent 1 · Surrogate-based — *this lecture*
Approximate $f$ from $D$, then optimise **over the surrogate**. A *forward* model, and a *search*.
:::
::: col 2 · Generative-based — *Lecture 6*
Learn the inverse map $p(x\mid y)$ and **sample** designs that are already good. An *inverse* model, and a *draw*.
:::
:::
:::

::: reveal
::: small
The source deck's figure is a picture of one deleted arrow: real data flows into an offline optimiser, a design flows out to superconductors, DNA sequences, proteins and robot morphologies — and the return arrow, from the design back to the world, is struck through: ==no additional interactions==.
:::
:::

### The thesis — the surrogate's blind spots are where you will be sent
{fill: center}

::: keypoint
An optimiser turned loose on a learned surrogate will seek out exactly the inputs where ==the surrogate is wrongly optimistic.==
:::

::: reveal
It sounds like Lecture 4 again — fit a model of $f$, optimise it. Offline the danger is far sharper. In BO a promising point could be *checked* by querying it, and a wrong belief was corrected within one round. Here a design the surrogate loves but that is in fact worthless is ==returned as the answer==.
:::

::: reveal
::: small
So the whole lecture is one failure and its cure: the surrogate **overestimates** where it has no data, the optimiser **exploits** that overestimation, and the fix is to make the surrogate deliberately **conservative** exactly where it will be attacked. Keep that sentence; Lecture 12 will need it, one axis over.
:::
:::

### The roadmap — four questions

::: qstrip 0
:::

- **Q1 — What changes when optimisation goes offline?** No oracle, so no way to check a candidate before returning it.
- **Q2 — Why does the naive "fit and ascend" fail?** ==Overestimation== off the data, on a narrow manifold of valid inputs.
- **Q3 — How do we fix it?** ==Conservative objective models== — penalise the surrogate where the optimiser attacks.
- **Q4 — What else helps?** Honest ==uncertainty== (NEMO) and local ==smoothness== (RoMA).

### Learning route — separate prediction quality from design quality

**Start with:** regression loss, gradient ascent and the BO loop from Lecture 4.

::: flow
- **Diagnose** | compare the surrogate's prediction with the true score
- **Correct** | train against inputs the optimiser is likely to exploit
- **Evaluate** | compare proposed designs with the best measured design
:::

::: keypoint
You should be able to ==explain a failure using two candidate designs and calculate the signs of the COMs loss terms.== NEMO, RoMA and theorem details are extensions of this core idea.
:::

## Act 1 — the naive approach
{short: ACT 1, num: Act 1}

**Q1.** Supervised learning, then optimisation. Two lines, and on paper it should work.

### The obvious method — fit a proxy, then climb it
{q: 1}

::: qstrip
:::

$$\textbf{Step 1.}\quad \theta^* = \argmin_\theta \frac1N\sum_{i=1}^N \big(f_\theta(x_i) - f(x_i)\big)^2 \qquad\qquad \textbf{Step 2.}\quad x^* = \argmax_x f_{\theta^*}(x)$$

Fit a neural network $f_\theta$ to $D$ — this is the ==surrogate==, or proxy — and then, because $f_\theta$ is differentiable where the real $f$ was not, run gradient ascent on it.

::: reveal
::: cols
::: col Online *(Lecture 4)*
```
for t = 1 … T−1:
  train f_θ on D_t
  x_{t+1} = x_t + η ∇_x f_θ(x_t)
  y_{t+1} = f(x_{t+1})        ← query
  D_{t+1} = D_t ∪ {(x_{t+1}, y_{t+1})}
```
:::
::: col.accent Offline *(this lecture)*
```
train f_θ on D                ← once
for t = 1 … T−1:
  x_{t+1} = x_t + η ∇_x f_θ(x_t)

return x_T
```
:::
:::
:::

::: reveal
::: small
One line deleted, and with it every correction. The surrogate is fitted once and never contradicted again.
:::
:::

### What "high-dimensional" means here
{sub: the six Design-Bench tasks these methods are measured on}

::: table center
| task | dimension | type | dataset size |
|---|---|---|---|
| Superconductor | 81 | continuous | 21,263 |
| GFP *(green fluorescent protein)* | 238 | categorical (20) | 5,000 |
| MoleculeActivity | ==1,024== | binary | 4,216 |
| HopperController | ==5,126== | continuous | 3,200 |
| AntMorphology | 60 | continuous | 25,009 |
| DKittyMorphology | 56 | continuous | 25,009 |
:::

::: small
Only 3,200 designs in a 5,126-dimensional space for HopperController. Whatever the surrogate believes about that space, ==almost all of it was never checked against anything== — and gradient ascent is free to walk in any of those directions. {p}(Trabucco et al., Design-Bench, 2022)
:::

### Check — the naive pipeline
{q: 1}

::: quiz You fit a surrogate $\hat{f}$ to a fixed dataset and hand it to an optimiser to maximise. The optimiser returns a design scoring far above anything in the data. Which risk must you check before trusting that prediction?
- =The optimiser may have selected a region where the surrogate overestimates the true score
- The surrogate generalises well and has found a genuinely better design
- The optimiser has not converged
- The dataset was too small to fit the surrogate at all
Training error alone does not establish generalisation, and predictions far from the training distribution can be unreliable. The optimiser is not a neutral user of the model — it is an adversary that actively seeks the argmax, and the argmax of $\hat{f}$ tends to sit exactly where the error is largest and positive. A spectacular predicted score alone establishes neither success nor failure; it needs evidence about the proposed design.
:::

## Act 2 — why it fails
{short: ACT 2, num: Act 2}

**Q2.** Two facts collide, and the optimiser is standing exactly where they meet.

### Two problems, not one
{q: 2}

::: qstrip
:::

::: cols
::: col.red Problem 1 — extrapolation
The training data constrains the model most strongly where it has support. Error outside that region is not controlled by a small training loss.

And yet the whole point of the exercise is to return a design *better than anything in $D$* — so we often need to evaluate predictions beyond the best measured outcomes. Improvement can sometimes come from interpolation among existing inputs, too. The failure is not incidental to the task; it *is* the task.
:::
::: col.red Problem 2 — the valid manifold
Searching for the input that maximises the proxy is easy: gradient ascent. But only **a thin sliver of the input space is valid** at all — real molecules, foldable proteins, buildable layouts.

Unconstrained ascent steps can leave that sliver, and a design off it is ==not merely poor but meaningless==.
:::
:::

::: reveal
::: small
The two want different cures. Problem 1 is about the *values* the surrogate reports; Problem 2 is about the *set* the optimiser is allowed to move in. Act 3 attacks the first. Lecture 6 — which searches inside a learned generative model — attacks the second.
:::
:::

### The two pictures

::: widget two-failures
Left, the dataset does not determine $f$ off the data: ==every one of those dashed continuations fits $D$ equally well==, and the fitted surrogate is whichever one the architecture happens to prefer. Right, the valid inputs are a small disc inside a large space; ascent starting inside it leaves almost immediately, and the returned designs are not molecules at all.
:::

### A good prediction fit can still choose the wrong design
{sub: illustrative scores; the offline optimiser does not see the truth column}

| Candidate | Surrogate prediction | True score, revealed only for this example |
|---|---|---|
| A, near measured designs | $5.5$ | $5.2$ |
| B, far from measured designs | $8.0$ | $1.0$ |

The optimiser correctly solves $\argmax_x\hat f(x)$ and chooses B. Its predicted gain over A is $8-5.5=2.5$, but its true loss is $5.2-1=4.2$.

::: keypoint
==The optimisation can be correct while the decision is poor.== The missing guarantee is that a high surrogate score means a high true score at the selected input.
:::

### The optimiser is an adversary

Gradient ascent on $f_\theta$ does not merely stumble into the bad region. It ==searches for it==, because the bad region is where $f_\theta$ is highest.

::: reveal
::: block The mechanism has a name | Goodfellow, Shlens & Szegedy, 2014
A photograph classified "panda" at 57.7 % confidence, plus $0.007$ times a crafted noise field, is classified **"gibbon" at 99.3 % confidence**. Nothing about the image changed that a person could see; the perturbation was simply chosen by ascending the model's own gradient.

Gradient ascent on a learned $f_\theta$ is ==the identical mechanism==, pointed at a regression head instead of a classifier: it manufactures inputs the model rates highly and the world does not.
:::
:::

::: reveal
::: keypoint
The optimiser is not a user of the surrogate. It is ==an adversarial attack on it.==
:::
:::

### Watch it happen

::: widget surrogate-exploit {"seed":17}
The surrogate fits the fifteen data points to an RMSE of $0.058$ and then, off the data, keeps climbing. Ascent from the best design in $D$ improves the true value for about five steps — and then spends the next thirty walking downhill in reality while the surrogate reports steady progress. ==The returned design scores $-0.14$ where the surrogate promised $4.31$== , and is worse than the design we already had.
:::

### The cure is not a better optimiser

::: lede
Two repairs suggest themselves before the right one, and both fail for the same reason: they treat the search as the problem.
:::

::: cols
::: col.red Search harder
A stronger, more thorough optimiser finds a *higher* point of $f_\theta$ — which on this surface means a point still further from the data, and still more badly overestimated.

Optimisation strength is on the ==wrong side== of the problem.
:::
::: col.red Search less
Restricting search to the measured designs caps the result at the best recorded score. A neighbourhood constraint can still permit improvement, but may also exclude useful novel designs.

The trade-off is between evidence and novelty.
:::
:::

::: reveal
::: keypoint
==Search restrictions and conservative models are complementary controls.== Here we focus on changing what the surrogate predicts at tempting, weakly supported inputs.
:::
:::

### Check — the shape of the failure
{q: 2}

::: quiz Why does the failure of the naive pipeline get *worse*, not better, as the optimiser gets stronger?
- A stronger optimiser overfits the training data more heavily
- =Because it searches harder for the maximum of $\hat{f}$, and the maximum of the *error* is what it finds
- It does not — a stronger optimiser reduces the gap
- Because stronger optimisers require larger surrogates, which generalise worse
This is the uncomfortable part. Every improvement in the optimiser is an improvement in its ability to locate the surrogate's weakest point. The problem cannot be fixed downstream of the model, which is why the answer is to change the **model** — train it so that it actively pushes its own predictions down off the data, rather than leaving them free to soar.
:::

## Act 3 — conservative objective models
{short: ACT 3, num: Act 3}

**Q3.** If the optimiser will attack the surrogate, train the surrogate against that attack.

### COMs — train the surrogate to distrust its own optimiser
{q: 3}
{sub: Conservative Objective Models · Trabucco, Kumar, Geng & Levine, ICML 2021}

::: qstrip
:::

We want a model that ==does not overestimate the very inputs an optimiser would chase==. The obstacle is knowing which inputs those are — and the answer is to generate them, by simulating the attack we fear.

::: reveal
$$\mu_\theta=\frac1M\sum_{j=1}^{M}\delta_{x_T^{(j)}},\qquad x_{t+1}^{(j)}=x_t^{(j)}+\eta\nabla_x f_\theta(x_t^{(j)}),\quad x_0^{(j)}\sim D$$
:::

::: reveal
::: flow | | 
- **Start from the data** | $x_0\sim D$ — real designs
- **Run the attacker** | a few steps of ascent on the *current* surrogate
- !**Collect what it visited** | the empirical distribution of these candidates is $\mu_\theta$: the inputs this surrogate is tempting
:::
:::

::: reveal
::: small
Because $f_\theta$ changes at every training step, $\mu$ is regenerated as training proceeds — an inner adversary chasing an outer defender, exactly as in adversarial training for robustness.
:::
:::

### The loss, term by term

$$L(\theta) = \underbrace{\tfrac12\,\E_{(x,y)\sim D}\big[(f_\theta(x)-y)^2\big]}_{\text{(i) fit the data}} \;+\; \alpha\Big(\underbrace{\E_{x\sim\mu(x)}[f_\theta(x)]}_{\hl{\text{(ii) push the adversaries down}}} \;-\; \underbrace{\E_{x\sim D}[f_\theta(x)]}_{\hl{\text{(iii) hold the data up}}}\Big)$$

- **(i)** ordinary regression — be right about the designs we actually measured;
- **(ii)** lowers scores at the adversarial candidates;
- **(iii)** raises scores relative to the dataset. Regression already penalises unbounded downward shifts on data; this term controls the adversary-versus-data score gap.

::: reveal
::: small
Structurally this is ordinary supervised regression plus one adversarial term. The additional work is to generate adversarial candidates while training the surrogate. Optimising it is a naive gradient ascent started from ==the best design already in $D$==.
:::
:::

### One COMs loss calculation
{sub: freeze the sampled candidates while inspecting the update}

One measured design has target $y=4$ and prediction $u=3.5$. One adversarial design has prediction $v=8$. Use $\alpha=0.2$.

$$L=\tfrac12(u-4)^2+0.2(v-u)=0.125+0.9=1.025.$$

::: cols c2
::: col At the measured design
$$\frac{\partial L}{\partial u}=(u-4)-0.2=-0.7.$$

Gradient descent increases $u$, improving the fit and the relative data score.
:::
::: col.accent At the adversarial design
$$\frac{\partial L}{\partial v}=0.2.$$

Gradient descent decreases $v$, reducing the unsupported high prediction.
:::
:::

::: keypoint
==Fit measured targets and reduce the score gap to tempting candidates.== Shared network parameters couple these updates, so this calculation explains the loss, not a guaranteed independent change at each point.
:::

### Turning the dial

::: widget conservative-coms {"seed":17}
The same dataset, the same optimiser, the same fifteen points — only the training loss differs. At $\alpha = 0$ the search runs to the boundary and returns a design worth $-0.14$. At $\alpha=0.3$, the returned **input** is about $x=6.20$, near the true maximising input $x=6.04$. Watch the readout: past $\alpha \approx 0.15$ the surrogate's prediction at $x^*$ falls *below* the truth. ==At this returned design the prediction is below the true value== — and then, at $\alpha = 1.3$, so conservative that it will not leave the data at all.
:::

### Why it works — a learned lower bound

::: block Proposition 1 *(informal)* | Trabucco et al., 2021
Under regularity assumptions, if $\alpha$ is large enough then the converged conservative model, evaluated at the designs its own optimiser produces, satisfies

$$\E_{x_0\sim D,\ x_T\sim\mu(x_T\mid x_0)}\big[f_\theta(x_T)\big] \;\le\; \E_{x_0\sim D,\ x_T\sim\mu(x_T\mid x_0)}\big[f(x_T)\big]$$
:::

::: reveal
Read the expectation carefully. This is an average statement under the theorem's assumptions and the specified candidate distribution. It is not a pointwise certificate for every generated design, and finite neural-network training may not satisfy those assumptions.
:::

### An average lower bound is not a guarantee for every design

Consider two equally likely candidate designs:

| Candidate | Conservative prediction | True score |
|---|---|---|
| A | $0$ | $9$ |
| B | $10$ | $3$ |
| **Average** | **5** | **6** |

The average prediction is below the average truth, yet B is overestimated: $10>3$.

::: keypoint
==An expectation inequality cannot be read as a pointwise inequality.== Conservatism reduces a risk under stated assumptions; it does not certify every proposed design as Lecture 1's convex KKT conditions did.
:::

### Conservatism is a dial, and both ends are bad
{sub: choosing α is hard — so make it a constraint instead}

$$\theta^* = \argmin_\theta \tfrac12\E_{(x,y)\sim D}\big[(f_\theta(x)-y)^2\big] \quad\text{s.t.}\quad \E_{x\sim\mu(x)}[f_\theta(x)] - \E_{x\sim D}[f_\theta(x)] \;\le\; \hl{\tau}$$

$\alpha$ is a penalty weight whose right value depends on the scale of $y$; $\tau$ is a *budget* on how far the surrogate may over-rate an adversary, and it is read in the units of the objective. Changing $\tau$ does not corrupt the loss value, so runs remain comparable.

::: reveal
::: cols
::: col.red τ too large
The constraint never binds. We are back to the naive fit, and the optimiser escapes.
:::
::: col.red τ too small
The surrogate flattens so hard that ascent cannot move. In the source ablation, $\tau = 0.1$ leaves the Hopper return pinned near its starting value for all fifty steps.
:::
:::
:::

::: reveal
::: small
Converting a penalised objective into a constrained one to get a directly interpretable constraint budget is a move this course has made before and will make again — it resembles the constraint-based control of updates in Lecture 1, and it is how TRPO will tame the policy gradient in Lecture 10.
:::
:::

### The same disease, one rung up the course
{sub: this is the rhyme Lecture 12 will name}

::: cols
::: col.accent COMs — a conservative *objective*
$$\begin{aligned}
\theta^*=\argmin_\theta\;\Big\{&\tfrac12\E_D[(f_\theta(x)-y)^2]\\
&+\alpha\big(\E_\mu[f_\theta]-\E_D[f_\theta]\big)\Big\}.
\end{aligned}$$

The optimiser exploits $f_\theta$ at ==out-of-distribution inputs==.
:::
::: col.accent CQL — a conservative *value*
$$\begin{aligned}
Q^*=\argmin_Q\;\Big\{&\tfrac12\E_D[(Q-\mathcal B^\pi\hat Q)^2]\\
&+\alpha\,\E_{s\sim D}\Big[\log\textstyle\sum_a e^{Q(s,a)}\\
&\qquad-\E_{a\sim\hat\pi_\beta(\cdot\mid s)}[Q(s,a)]\Big]\Big\}.
\end{aligned}$$

The policy exploits $Q$ at ==out-of-distribution actions==.
:::
:::

::: reveal
::: keypoint
Fit the data · push down what the optimiser would chase · hold up what the data actually contains. ==One shape, twice.==
:::
:::

::: reveal
::: small
Lecture 12 meets this failure again with a policy in place of an optimiser and a $Q$-function in place of a surrogate, and answers it with the identical three terms. When it does, it will quote this slide.
:::
:::

### Check — what conservatism costs
{q: 3}

::: quiz A conservative objective model is trained to push predicted values *down* on designs far from the data. Turn that conservatism up too far and what happens?
- The model overfits the training data
- The optimiser diverges
- =The landscape flattens: everything off-data looks equally bad, so the search cannot find genuinely good novel designs either
- Nothing — more conservatism is monotonically safer
Conservatism is a **dial, not a direction**. Too little and the optimiser exploits the error; too much and the model refuses to recommend anything it has not already seen, which is a very safe way to be useless. The whole craft is finding the setting where the model is pessimistic exactly in proportion to its ignorance — a problem that returns, identically, as CQL in Lecture 12.
:::

## Act 4 — other ways to be robust
{short: ACT 4, num: Act 4}

**Q4.** Conservatism is one answer to overestimation. Two others attack the same disease from different sides.

### Three cures for one disease
{q: 4}

::: qstrip
:::

::: table center
| method | what it treats overestimation as | the lever |
|---|---|---|
| **NEMO** {p}(Fu & Levine, ICLR 2021) | a failure of **uncertainty** — the model does not know what it does not know | a normalised-maximum-likelihood predictor |
| **COMs** {p}(Trabucco et al., ICML 2021) | a failure of **calibration on the attack** — the model over-rates what the optimiser finds | an adversarial penalty, $\alpha$ |
| **RoMA** {p}(Yu, Ahn, Song & Shin, NeurIPS 2021) | a failure of **smoothness** — spurious spikes between and beyond the data | a local smoothness prior at the current candidate |
:::

::: reveal
::: small
They are not rivals so much as three readings of the same sentence: ==the surrogate is unconstrained where there is no evidence==, and something must constrain it.
:::
:::

### NEMO — how easily could the model have been talked into it?

The conditional NML distribution is the estimator closest to maximum likelihood ==when the test label is chosen adversarially==:

$$p_{\text{NML}}(y\mid x) = \frac{p\big(y \mid x;\ \hat\theta_{D\cup(x,y)}\big)}{\displaystyle\int p\big(y' \mid x;\ \hat\theta_{D\cup(x,y')}\big)\,dy'}$$

::: reveal
::: flow
- **Pick a candidate label $y'$** | for the query point $x$
- **Refit** | $\hat\theta_{D\cup(x,y')}$ — the MLE on the data *plus that made-up point*
- **Ask how well it fits** | $p(y'\mid x;\hat\theta_{D\cup(x,y')})$
- !**Normalise over all $y'$** | the answer is a normalised predictive distribution
:::
:::

::: reveal
::: small
Far from the data, *every* candidate label can be accommodated almost perfectly — one extra point barely moves a flexible model — so the normalised distribution can be wide, provided the refits and normalisation are well defined. Near the data, only labels close to the trend survive the refit, and it can be narrower. ==Uncertainty is measured as how easily the model could have been talked into any answer.== The integral is intractable, so NEMO quantises $y$ into $K$ bins, keeps $K$ models, and updates them incrementally *while* it optimises $x$ rather than rebuilding them at each iterate.
:::
:::

### But surely an ensemble would have caught it?

::: widget ensemble-alarm {"seed":17}
Ten surrogates, each fitted to a bootstrap resample of the same fifteen points. Out of distribution their spread does widen — by about six times. Their actual error grows ==thirty-seven times==. At the design their own averaged optimiser returns, the truth sits eighteen standard deviations outside the band they agree on. The alarm fires; it is simply far too quiet, because the members share an architecture and so extrapolate wrongly *together*.
:::

### RoMA — flatten the surface the optimiser is standing on

RoMA targets sensitivity of predictions and gradients near candidate inputs. A jagged surrogate can create spurious peaks; even a smooth surrogate can extrapolate incorrectly. Smoothness is a useful modelling bias, not a sufficient condition for accuracy.

::: reveal
::: cols
::: col Stage 1 — train it smooth
$$L(\theta) = \max_{\tilde\theta\in B(\theta)}\ \E_{(x,y)\sim D,\ \delta\sim\mathcal N(0,\sigma)}\Big[\big(f(x+\delta;\tilde\theta)-y\big)^2\Big]$$

Gaussian smoothing of the *inputs* under worst-case *weight* perturbations, $B(\theta) = \{\tilde\theta : \lVert\theta_l-\tilde\theta_l\rVert_F \le \epsilon\lVert\theta_l\rVert_F\}$; the inner maximisation by projected gradient ascent.
:::
::: col.accent Stage 2 — re-smooth as you go
$$\begin{aligned}
\theta_t=\argmin_{\tilde\theta\in B(\theta)}\;\Big\{&\lVert\nabla_x f(x^{(t)};\tilde\theta)\rVert_2\\
&+\alpha\big[f(x^{(t)};\tilde\theta)-f(x^{(t)};\theta_{t-1})\big]^2\Big\}.
\end{aligned}$$

Stage 1 only smooths where the data is. So at *every* ascent step, re-adapt the model to be flat at the current candidate — first term for smoothness, second to anchor the previous prediction.
:::
:::
:::

::: reveal
::: small
The source figure says it in two panels: without the prior, a jagged surrogate's tallest spike is a *wrong solution*; with it, the surrogate lies on the truth and the argmax is the ==right one==.
:::
:::

### What the benchmark says
{sub: source-reported best-of-batch task scores; Avg uses the source's normalised aggregate}

::: table center
| method | GFP | Molecule | Supercond. | Hopper | Ant | DKitty | **Avg** |
|---|---|---|---|---|---|---|---|
| *Dataset max* | 3.152 | 6.558 | 73.90 | 1361.6 | 108.5 | 215.9 | *1.000* |
| Gradient ascent | 2.894 | 6.636 | 89.64 | 1050.8 | 399.9 | 390.7 | 1.237 |
| MINs | 3.315 | 6.508 | 80.23 | 746.1 | 388.5 | 352.9 | 1.304 |
| CbAS | **3.408** | 6.301 | 72.17 | 547.1 | 393.0 | 396.1 | 1.324 |
| COMs | 3.305 | 6.876 | 110.0 | 2395.7 | 378.8 | 341.4 | 1.589 |
| NEMO | 3.359 | 6.682 | **127.0** | 2130.1 | 393.7 | **431.6** | 1.687 |
| **RoMA** | 3.357 | **6.890** | 103.9 | **2466.5** | **468.5** | 384.3 | ==**1.705**== |
:::

::: small
Naive gradient ascent is not useless — it has the lowest aggregate score among the six methods shown, and on HopperController it returns less than the best trajectory already in the dataset. Every method that beats it does so by ==adding a constraint on what the surrogate is allowed to believe==, not by searching harder.
:::

### All three say the same thing
{fill: center}

::: keypoint
Respect uncertainty off-distribution, or ==the optimiser will weaponise it.==
:::

::: reveal
::: cols
::: col Bayesian optimisation *(Lec 4)*
Uncertainty is an **opportunity**: go where the band is wide, when the expected benefit justifies the evaluation cost. Uncertainty alone does not determine information gain or the best query.
:::
::: col.accent Offline MBO *(Lec 5)*
Uncertainty is a **hazard**: stay away from where the band is wide, because the fixed dataset cannot supply new evidence there. A wrong belief can become ==the answer you ship==.
:::
:::
:::

::: reveal
::: small
Same Gaussian-process-era intuition, opposite operational consequence — which is why the offline methods are built around *conservatism* where BO was built around *exploration*. Lecture 4's lesson, made non-negotiable.
:::
:::

### Check — the warning being handed on
{q: 4}

::: quiz What does this lecture hand to Lecture 6, and eventually to Lecture 12?
- That surrogates should always be ensembles
- That gradient-based optimisers are unsuitable for design
- That fixed datasets are too small to support design optimisation
- =That the optimiser is an adversary of its own model — it will find and exploit wherever the model is wrong
State it once and it explains three separate lectures. A policy maximising a learned $Q$ is the same adversary as an optimiser maximising a learned $\hat{f}$, and it fails the same way, on actions rather than designs. Lecture 12 answers it with the same instrument: make the value function a **lower bound** off the data.
:::

## Closing
{short: CLOSING}

A forward model, searched. Lecture 6 inverts every word of that.

### It is already in production

::: cols
::: col PRIME — hardware accelerators {p}(ICLR 2022)
A conservative surrogate in the COMs shape, trained over *contexts* (target workloads) and given infeasible layouts as extra negatives:

$$\theta^* = \argmin_\theta \mathcal L(\theta) - \beta\,\E_{x'\sim D_{\text{infeasible}}}[f_\theta(x')]$$

On a U-Net + t-RNN target, latency $\approx 745$ against a simulator-driven baseline's $\approx 1080$ — with the simulator never called.
:::
::: col.accent LCOMs — crystal structures {p}(ICLR 2022)
Chemical space is not a vector space, so a **CD-VAE encoder** $\phi(x,c)$ maps a crystal into one, and the conservative surrogate of the lattice energy is optimised ==inside that latent space==, then decoded.

Mean energy improvement $2.25$ against supervised learning's $1.10$.
:::
:::

::: reveal
::: small
Read the second one twice. A generative model supplies the coordinates; a conservative surrogate does the searching. Forward-and-search and inverse-and-sample are not rivals — ==the second can be the first's coordinate system==, which is one reason Lecture 6 follows immediately.
:::
:::

### Where we are — a forward model, then a search

::: table center
|   | **the model** | **the decision** |
|---|---|---|
| **Surrogate *(Lec 5 ✓)*** | ==forward: $f_\theta(x)\approx f(x)$== | ==optimise / search over $f_\theta$== |
| **Generative *(Lec 6)*** | inverse: $p(x\mid y)$ | sample a good design |
:::

::: reveal
What this lecture hands on is ==a forward model then a search, and the warning that the optimiser is an adversary==: build a *forward* surrogate of $f$, then *search* it — carefully, conservatively, so that the search cannot exploit our ignorance.
:::

::: reveal
::: small
But there is a completely different route. Instead of approximating $f$ and searching it, why not learn to ==generate== good designs directly — the inverse map from "I want a high value" to "here is an input that gives it"? That is Lecture 6: don't search the design, **produce** it. Hold the shape of this lecture, because the duality returns in Part IV as value-based RL (search a value) against policy-based RL (produce an action).
:::
:::

### Offline, a surrogate's optimism becomes the optimiser's trap.
{layout: standout}

Conservative training discourages unsupported high predictions. Its effectiveness still depends on the data, model, optimisation and candidate checks.

### Questions?
{layout: standout}

Two things to carry out of here. **The optimiser is an adversary** — you will meet it again in Lecture 12 as a policy exploiting a $Q$-function. And **a forward model plus a search** — you will meet its inverse in Lecture 6, next.

## Appendix — backup slides
{short: APPENDIX}

Complete statements, kept out of the narrative.

### Backup 1 — offline MBO against Bayesian optimisation
{fill: top}

The same goal, $\argmax_x f(x)$, under different access — and the difference dictates the method.

::: table center
|   | **Bayesian optimisation *(Lec 4)*** | **Offline MBO *(Lec 5)*** |
|---|---|---|
| data | *active* — query $f$ each round | *fixed* — a static dataset $D$ |
| a mistake is | corrected by the next query | ==uncorrectable== — it is returned as the answer |
| uncertainty drives | *where to sample* | *where not to trust* |
| the core risk is | slow convergence | overestimation $\to$ an invalid design |
| the design principle | exploration | ==conservatism== |
:::

::: small
Both build a surrogate; both maximise something over it. What differs is whether the loop closes. When it does, optimism is self-correcting and therefore cheap — an over-rated point gets queried, found wanting, and the posterior repairs itself. When it does not, optimism is a one-way door.
:::

### Backup 2 — generating the adversarial distribution
{fill: top}

$$\mu_\theta=\frac1M\sum_{j=1}^M\delta_{x_T^{(j)}},\qquad x_0^{(j)}\sim D,\quad x_{t+1}^{(j)}=x_t^{(j)}+\eta\nabla_xf_\theta(x_t^{(j)})$$

**Reading it.** Start from real data points; run a few steps of gradient ascent on the *current* surrogate; collect what it visits. These are exactly the inputs this surrogate would lure an optimiser toward, so these are the inputs whose predicted value must come down.

::: cols
::: col Algorithm 1 — training
```
initialise f_θ; pick η, α
for i = 1 … steps:
  sample (x₀, y) ~ D
  x_T ← ascent from x₀ on f_θ
  μ ← empirical distribution of sampled x_T
  L = E_D (f_θ(x₀)−y)²
      − α E_D[f_θ] + α E_μ[f_θ]
  θ ← θ − λ ∇_θ L
```
:::
::: col.accent Algorithm 2 — finding $x^*$
```
x₀ = input of argmax_{(x,y)∈D} y ← best
                           design we own
for t = 0 … T−1:
  x_{t+1} = x_t + η ∇_x f_θ*(x_t)

return x* = x_T
```
:::
:::

::: small
Note where Algorithm 2 starts. Ascent is initialised at the ==best design in the dataset==, not at random — which gives a sensible starting point. It does not guarantee that the final true score is at least the starting score; that would need an additional valid improvement check.
:::

### Backup 3 — the COMs loss and the scope of its guarantee

$$L(\theta)=\tfrac12\mathbb E_D[(f_\theta(x)-y)^2]+\alpha\left(\mathbb E_{\mu_\theta}[f_\theta(x)]-\mathbb E_D[f_\theta(x)]\right).$$

**Fit:** the squared loss anchors predictions at measured inputs. **Penalise:** the additional term lowers the adversarial-versus-data prediction gap.

An informal reading of the paper's conservative-result assumptions is

$$\mathbb E_{x_T\sim\mu_\theta}[f_\theta(x_T)]\le\mathbb E_{x_T\sim\mu_\theta}[f(x_T)].$$

::: keypoint
This is an **expected-value statement under additional assumptions**, not a global certificate that $f_\theta(x)\le f(x)$ for all $x$. A large penalty or low training loss alone does not establish the theorem's hypotheses.
:::

::: small
Advanced reference: Trabucco et al., *Conservative Objective Models*, ICML 2021. Consult the paper for the precise iterate, regularity and candidate-distribution assumptions. The main lecture's two-candidate counterexample explains why an average bound can still overestimate an individual design.
:::

### Backup 4 — NEMO, made tractable
{fill: top}

**The estimator.** $p_{\text{NML}}$ is the minimax solution of $\;\argmin_h \max_{y'} \big(\log p(y'\mid x;\hat\theta_{D\cup(x,y')}) - \log h(y'\mid x)\big)$, where $\hat\theta_{D\cup(x,y)} = \argmax_\theta \frac{1}{N+1}\sum_{(x,y)\in D\cup(x,y)}\log p(y\mid x,\theta)$.

**Problem.** The denominator requires training an MLE *for every possible $y$* and then integrating over them — impossible twice over for a deep network.

**Fix 1 — quantise.** Floor each $y$ into one of $K$ bins, so the integral becomes a sum: $\;\int_y p(y\mid x,\hat\theta_{D\cup(x,y)})\,dy \approx B\sum_{k=1}^K p\big(\lfloor y_k\rfloor \mid x, \hat\theta_{D\cup(x,\lfloor y_k\rfloor)}\big)$.

**Fix 2 — amortise.** Keep $K$ models and update them incrementally *while* optimising $x$, rather than retraining from scratch at each iterate:

```
for t = 1 … T:
  for k = 1 … K:  D' ← D ∪ (x_t, ⌊y_k⌋);  θ^k ← θ^k + α_θ ∇ LogLik(θ^k, D')
  p̂_NML(y | x_t) ∝ p(y | x_t, θ^y) / Σ_k p(⌊y_k⌋ | x_t, θ^k)
  x_{t+1} ← x_t + α_x ∇_x E_{y ~ p̂_NML(y|x)}[ g(y) ]
```

::: small
Quantisation flattens the landscape and kills the gradient, so NEMO's head outputs one minus the CDF of a *logistic* distribution sampled at intervals of $1/K$ and takes the mean; gradients then flow through the logistic mean $\mu(x)$, and Proposition 4.1 guarantees $\langle\nabla_x\mu(x),\nabla_x y_{\text{mean}}(x)\rangle \ge 0$ — the smooth surrogate gradient never points against the one we want.
:::
