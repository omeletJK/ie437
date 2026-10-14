---
ch: 5
title: Data-Driven Design Optimization — Surrogate-Based
subtitle: Deciding about designs no one has measured
tagline: Offline, part 1 of 2 — learn the objective from a fixed dataset, then decide what to trust
blurb: >-
  The oracle is gone: a fixed dataset, and no way to test a new design. Fit a surrogate, optimise it,
  and the optimiser walks into the region where the surrogate is confidently wrong. Three research
  streams answer that failure — conservatism, uncertainty, and knowledge of the system.
course: IE437 · Data-Driven Decision Making and Control
author: Jinkyoo Park
institute: KAIST
cube:
  stages: static
  model: data-driven
  agents: single agent
inherits: "`argmax f` with a GP, but the oracle removed (Lecture 4)"
handoff: what a surrogate can be trusted to say, and the validity problem it leaves (Lecture 6)
questions:
  - What breaks offline?
  - Conservatism?
  - Uncertainty?
  - System knowledge?
---

### Data-Driven Design Optimization — Surrogate-Based
{layout: title}

### Where we are — the query is taken away
::: table center
|   | Lecture 4 · *Observe* | **Lecture 5 · *Trust*** | Lecture 6 · *Generate* |
|---|---|---|---|
| the question | which experiment to run next | ==what to believe about designs no one has measured== | how to produce valid, good designs |
| access to $f$ | one evaluation per round | none — a fixed dataset | none — a fixed dataset |
| uncertainty is | a reason to look | ==a reason to be careful== | a reason to stay on the data's manifold |
:::

::: keypoint
The goal is unchanged — a good real design. What is gone is the chance to check one before it is returned.
:::

### Learning route — two sessions, one question
**Bring:** regression and gradient ascent (Lecture 1), the GP posterior and UCB (Lecture 4).

| Session | What it does |
|---|---|
| **1 · Why it fails** | Delete the evaluation → watch the optimiser exploit the surrogate → split the decision loss into two errors → conservatism, with COMs worked to the end |
| **2 · Other grounds for trust** | Uncertainty: estimate what the surrogate does not know and decide with it → system knowledge: give it structure or physics → compare the three |

::: keypoint
Throughout, keep two things apart: **how well a model predicts**, and **how good a decision it makes** when an optimiser is pointed at it.
:::

### Lecture 4's loop, with one line deleted
Every black-box method so far closes its loop through the real objective — Bayesian optimisation, and equally a genetic algorithm, CMA-ES, a policy gradient, or gradient ascent on a fitted proxy. Lecture 4's loop:

::: cols
::: col Online — Bayesian optimisation *(Lecture 4)*
```
for t = 1 … T:
  fit the GP on D_t
  x_{t+1} = argmax_x a_t(x)    ← acquisition, uses σ
  y_{t+1} = f(x_{t+1})         ← query
  D_{t+1} = D_t ∪ {(x_{t+1}, y_{t+1})}
```
:::
::: col.accent Offline *(this lecture)*
```
fit a model f_θ on D           ← once
x̂ = argmax_x f_θ(x)           ← no query

return x̂
```
:::
:::

::: reveal
::: small
One line deleted, and with it every correction. Online, an over-rated point is queried, found wanting, and the model repairs itself — which is why BO could afford to *seek* uncertainty. Offline, the model is fitted once and never contradicted again.
:::
:::

::: note
Source alignment: Part 1 pp. 3–17 (the online methods — GA, CMA-ES, BO, policy gradient; tabulated in the appendix). The source's p. 5 box, gradient ascent on a proxy with a query per step, is the naive offline method of slide 8 with the query put back.
:::

## Act 1 — what breaks offline
{short: ACT 1, num: Session 1 · Act 1}

**Q1.** Fit a model of $f$ to the data, then optimise the model. On paper it should work.

### Offline model-based optimisation
{q: 1}

::: qstrip
:::

$$\mathcal D=\{(x_i,y_i)\}_{i=1}^{N},\qquad y_i=f(x_i)+\epsilon_i$$

$$\text{find}\quad x^*=\argmax_{x\in\mathcal X_{\text{valid}}} f(x)\qquad\text{using \hl{only} }\mathcal D$$

::: reveal
Evaluating $f$ is expensive or prohibitive — a molecule to synthesise, a protein to express, a chip or an aircraft to build. The source figure is one deleted arrow: data flows into an offline optimiser, a design flows out to superconductors, DNA, proteins and robot bodies, and the return arrow from the design back to the data is struck through — ==no additional interactions==.
:::

::: reveal
::: cols
::: col.accent 1 · Surrogate-based — *this lecture*
Approximate $f$ from $\mathcal D$, then optimise **over the surrogate**. A *forward* model, and a *search*.
:::
::: col 2 · Generative-based — *Lecture 6*
Learn a representation or distribution of **plausible designs**, then search in it, condition it, or guide it toward better ones.
:::
:::
:::

::: note
Source alignment: Part 1 pp. 18–19; Part 2 pp. 3–4.
:::

### The bar to beat is the best design you already own
{sub: three ways to answer with the same data}

| rule | the design it returns | what it risks |
|---|---|---|
| **Best observed** | $\argmax_{x_i\in\mathcal D}\,y_i$ | nothing — and it can never improve |
| **Naive surrogate** | $\argmax_x \hat f_\theta(x)$ | believing $\hat f_\theta$ where no data checked it |
| **Reliable offline optimisation** | the maximiser of a score that accounts for out-of-distribution risk | ==this chapter== |

::: keypoint
Offline optimisation is worth doing only if it beats the best design in $\mathcal D$ — and it has to do so without testing the design it returns.
:::

### The obvious method — fit a proxy, then climb it
$$\textbf{Step 1.}\quad \theta^* = \argmin_\theta \frac1N\sum_{i=1}^N \big(f_\theta(x_i) - y_i\big)^2 \qquad\qquad \textbf{Step 2.}\quad \hat x = \argmax_x f_{\theta^*}(x)$$

Fit a neural network $f_\theta$ to $\mathcal D$ — this is the ==surrogate==, or proxy — and then, because $f_\theta$ is differentiable where the real $f$ was not, run gradient ascent on it, starting from the best design in $\mathcal D$.

::: reveal
::: keypoint
Step 1 can pass every supervised-learning check. What goes wrong is the interaction: Step 2 searches exactly where Step 1 was ==never checked==.
:::
:::

::: note
Source alignment: Part 1 p. 20.
:::

### What the benchmark asks for, and how it is scored
{sub: the six Design-Bench tasks as used by NEMO, COMs and RoMA (2021)}

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
**Three things to keep apart.** The *offline data* $\mathcal D$ is all a method may use. The *candidates* — 128 designs in the papers of this lecture — are what it returns. The *oracle* scores them afterwards, for the benchmark only, and is never fed back: the physics simulator for the robot tasks, a model fitted to a larger held-out dataset for tasks such as Superconductor. The usual score, the best of the 128, is a benchmark number; deploying one design would still need a way to pick it without the oracle. HopperController has 3,200 designs in 5,126 dimensions: ==almost every direction the ascent can take was never checked against anything==.
:::

::: note
Source alignment: Part 2 p. 23 (task table). These are the 2021 versions of the tasks, the ones the COMs, NEMO and RoMA results use. The final benchmark (Trabucco, Geng, Kumar & Levine, ICML 2022, Table 1) revised them: Superconductor is 86-dimensional there, and GFP and MoleculeActivity were moved to its appendix as tasks not kept in the final suite.
:::

::: note
Source alignment: Part 2 pp. 25 and 38 (128 candidates, 50th and 100th percentile).
:::

### Two different problems
::: cols
::: col.red Problem 1 — values off the data · *every offline problem*
The training data constrains the model where it has support. Away from it, a small training loss controls nothing — and the search must go there, because the goal is a design *better than anything in $\mathcal D$*. ==The failure is the task.==
:::
::: col.red Problem 2 — the valid set · *only with a constraint*
When designs must be real molecules, foldable proteins or buildable layouts, only a thin sliver of input space is valid, and ascent can leave it: a design off it is ==not merely poor but meaningless==. If every input is a legitimate design, this problem does not exist.
:::
:::

::: reveal
::: table center
|   | **valid** | **invalid** |
|---|---|---|
| **near the data** | the data themselves | a molecule string with one character changed — when the valid set is thin |
| **far from the data** | the design we hope to find | where unchecked ascent ends |
:::
:::

::: reveal
::: small
Independent questions. A **known** constraint is Lecture 1's constrained optimisation. An **implicit** one — known only through valid examples — must be learned, and judging it off the data is Problem 1 again, for the constraint. This lecture attacks Problem 1; Lecture 6 learns the valid set.
:::
:::

::: note
Source alignment: Part 1 pp. 21, 23, 25.
:::

### The two pictures
::: widget two-failures
Left, the dataset does not determine $f$ off the data: ==every one of those dashed continuations fits $\mathcal D$ equally well==. Right, only when designs must satisfy a constraint: the valid designs are a thin curve, and ascent from a data point leaves it at once. ==A point next to the data can be off the curve, and a point far from it can be on it.==
:::

::: note
Source alignment: Part 1 p. 22 (the fan of extrapolations) and p. 24 (the valid manifold, redrawn as a thin curve). "Near the data" here means close in the input space — the sense a GP's $\sigma$ or a trust region uses. Measured instead by the support of the data distribution, a point inside it is valid whenever the data are.
:::

### Watch it happen
::: widget surrogate-exploit {"seed":17}
Fifteen measured designs, a surrogate that fits them to an RMSE of $0.058$, and gradient ascent from the best of them. The faint curve is the true $f$ — drawn so that we can watch; the optimiser never sees it. Press → to walk the ascent to $t=5$, $12$ and $40$: ==it returns $-0.14$ where the surrogate promised $4.31$==, worse than the design it started from.
:::

### The optimiser is an adversary
::: figure adversarial-panda | 700
A perturbation of size $0.007$, chosen by following a gradient, turns 57.7 % "panda" into 99.3 % "gibbon". {p}(Goodfellow, Shlens & Szegedy, ICLR 2015)
:::

Gradient ascent on $\hat f_\theta$ is the same computation aimed at a regression model: it moves the input in whatever direction raises the model's output fastest. In a high-dimensional space with little data, many of those directions lead to errors.

::: keypoint
The optimiser does not look for errors. It looks for high predictions — and where there is no data, ==high predictions are often errors==.
:::

::: note
Source alignment: Part 2 p. 29.
:::

### A good fit can still make a bad decision
{sub: the signed decision bound}

Let $\hat x$ be the design the optimiser returns and $x^*$ the true optimum. Add and subtract $\hat f$ at both points:

$$f(x^*)-f(\hat x)=\underbrace{\big[f(x^*)-\hat f(x^*)\big]}_{A}+\underbrace{\big[\hat f(x^*)-\hat f(\hat x)\big]}_{\le\,0\ \text{when }\hat x\text{ maximises }\hat f}+\underbrace{\big[\hat f(\hat x)-f(\hat x)\big]}_{B}\;\le\;A+B$$

::: cols
::: col A — at the true optimum
How much the surrogate **under-rates** the best design. A model too pessimistic about the right answer pays here.
:::
::: col.accent B — at the chosen design
How much the surrogate **over-rates** the design it picked. The optimiser's exploit pays here.
:::
:::

::: reveal
::: keypoint
Validation error is an average over the data. The decision depends on the error at two particular points — ==and the optimiser chooses one of them==.
:::
:::

::: small
The middle term, the **optimiser gap**, is never positive when $\hat x$ maximises $\hat f$ — that is all the inequality uses. The exact loss keeps it, so $A+B$ can sit well above the loss. $A$ and $B$ themselves can be negative.
:::

### Where the loss comes from, on the same fit
::: widget surrogate-exploit {"mode":"bound","seed":17}
Walk it with →. The surrogate is ==right about the true optimum== — $A=-0.03$ — and wrong about the design it chose, $B=4.44$. Exactly, $2.79=A+\text{gap}+B=-0.03-1.62+4.44$; dropping the gap gives the bound $4.41$. ==$B$ is the only large positive term.==
:::

### Temperature thread — what the surrogate promised, and what it delivered
{sub: shared teaching example · predict before revealing}

::: widget offline-heater {"mode":"thread"}
Lecture 0's heater, offline: two commands, one surrogate, no experiment.
:::

**Predict:** Which command does maximising the surrogate pick — and is it the better one?

::: reveal
It picks $u=2$, the command it rates higher. Press → to run the heater and see why that is the worse choice.
:::

::: note
Numbers behind the picture: hidden score $f(u)=-[(u-2)^2+u^2]$; predictions $\hat f(1)=-2.1$, $\hat f(2)=-1.0$; truth $f(1)=-2$, $f(2)=-4$. So $A=0.1$, gap $=-1.1$, $B=3$, and the loss $2=A+\text{gap}+B$.
:::

### Try it — the largest error is no longer the selected action
{sub: work independently · reveal only after deciding}

::: widget offline-heater {"mode":"try"}
The same two commands; the surrogate is now exact at $u=1$ and over-rates $u=2$ by less.
:::

Which command is chosen now — and does the remaining error at $u=2$ cost anything?

::: reveal
**Check your answer.** It picks $u=1$, the right command. The optimiser maximises truth plus error, not error alone: the error at $u=2$ is still there, but an error costs the decision only when it ==changes the choice==. Press → to see it.
:::

::: note
Numbers behind the picture: errors $0$ at $u=1$ and $+1$ at $u=2$, so predictions $-2$ and $-3$; the pick is $u=1$, and $A=B=0$.
:::

### The cure is not a better optimiser
::: lede
Two repairs suggest themselves first, and both treat the search as the problem.
:::

::: cols
::: col.red Search harder
A stronger, more thorough optimiser finds a *higher* point of $\hat f$ — on this surface, a point still further from the data and still more over-rated. It makes $B$ larger.

Optimisation strength is on the ==wrong side== of the problem.
:::
::: col.red Search less
Restricting the search to measured designs caps the result at the best recorded score. A neighbourhood limit can still allow improvement, but it also excludes the novel designs we came for.

The trade is between evidence and novelty.
:::
:::

::: reveal
::: keypoint
What has to change is what the surrogate is entitled to say away from the data.
:::
:::

### Check — prediction quality versus decision quality
{q: 1}

::: quiz Surrogate $S_1$ has a lower validation error than surrogate $S_2$, yet the design chosen by maximising $S_1$ is worse. Is that a contradiction?
- Yes — a lower validation error must give a better optimised design
- No — $S_1$ must have been overfitted
- =No — validation error is measured on the data; the decision depends on the error at the design the optimiser selects, usually away from the data
- Yes — the optimiser must have failed to converge
Validation error averages over designs like those in $\mathcal D$. The decision loss is bounded by $A+B$: the errors at the true optimum and at the chosen design, which the optimiser picks *because* the prediction is high there. A model can win on the first number and lose on the second — the surrogate in *Watch it happen* had an RMSE of $0.058$ and $B=4.44$.
:::

### Three ways to give a surrogate grounds for trust
{sub: the map for both sessions}

::: cols c3
::: col.accent Conservatism
Change what $\hat f$ says **where the optimiser goes**: a training penalty on the designs it would chase.

COMs {p}(ICML 2021) · PRIME · RoMA — *Session 1*
:::
::: col Uncertainty
Estimate **what $\hat f$ does not know**, and decide with it: $\mu-\kappa\sigma$, Lecture 4's UCB with the sign turned.

Deep Ensembles {p}(NeurIPS 2017) · NEMO — *Session 2*
:::
::: col System knowledge
Give the model **structure or physics**, so that its extrapolation has grounds other than the data.

FGM {p}(AISTATS 2024) · Kennedy & O'Hagan — *Session 2*
:::
:::

::: reveal
::: keypoint
All three try to shrink $B$; each brings its own assumptions and can cost something elsewhere — too much conservatism inflates $A$, as Session 1 will show. They are not rivals: an uncertainty penalty is itself conservative, and a structured model can be trained conservatively.
:::
:::

### The papers of this lecture — why each is here
::: widget mbo-papers {"try":"Click any paper"}
Press → for Session 2's papers; click any paper for what it does, why we read it and how it connects. The same list is a table in the appendix.
:::

## Act 2 — conservatism: train the surrogate against its own optimiser
{short: ACT 2, num: Session 1 · Act 2}

**Q2.** If the optimiser will attack the surrogate, let the surrogate see the attack while it is trained.

### COMs — what we want, and the obstacle
{q: 2}
{sub: Conservative Objective Models · Trabucco, Kumar, Geng & Levine, ICML 2021}

::: qstrip
:::

We want a model that ==does not over-rate the designs an optimiser would chase== — a small $B$. The obstacle is knowing which designs those are, and the answer is to generate them by running the attack we fear.

::: reveal
$$\E_{\mu_\theta}\big[f_\theta\big]=\frac1M\sum_{j=1}^{M} f_\theta\big(x_T^{(j)}\big),\qquad x_{t+1}^{(j)}=x_t^{(j)}+\eta\nabla_x f_\theta\big(x_t^{(j)}\big),\quad x_0^{(j)}\sim\mathcal D$$

$\mu_\theta$ is where $T$ ascent steps from the data **end up**; the loss uses it only through this average.

:::

::: reveal
::: flow | | 
- **Start from the data** | $x_0\sim \mathcal D$ — real designs
- **Run the attacker** | a few steps of ascent on the *current* surrogate
- !**Collect where it ends up** | those designs form $\mu_\theta$: the designs this surrogate is tempting
:::
:::

::: reveal
::: small
Because $f_\theta$ changes at every training step, $\mu_\theta$ is regenerated as training proceeds — an inner attacker chasing an outer defender, as in adversarial training for robustness.
:::
:::

::: note
Source alignment: Part 2 pp. 26–29. The paper describes $\mu$ as "several steps of gradient ascent" from data points; its implementation uses a single step (Trabucco et al., 2021, §3.4). Written as a distribution, $\mu_\theta=\frac1M\sum_j\delta_{x_T^{(j)}}$ — a point mass $1/M$ at each end point — which is why its expectation is the plain average above. The toy widgets collect every point the 25-step ascent visits, not only the end points; with the paper's one step the two coincide.
:::

### First attempt — push the attacker's designs down
$$L_1(\theta)=\tfrac12\,\E_{(x,y)\sim\mathcal D}\big[(f_\theta(x)-y)^2\big]+\alpha\,\E_{x\sim\mu_\theta}\big[f_\theta(x)\big]$$

::: widget conservative-coms {"mode":"first","alpha":0.3,"seed":17}
The cheapest way to lower the attacker's scores is to lower everything: the red surface sinks below the very data it was fitted to.
:::

::: reveal
::: keypoint
**The fix — hold the data up:** subtract $\alpha\,\E_{\mathcal D}[f_\theta]$, so only the ==gap== between the attacker's scores and the data's is penalised.
:::
:::

::: note
Source alignment: Part 2 p. 30 ("Problem: underestimation. Solution: regularise by maximising function values under the data distribution"). In the toy at α = 0.3 the first attempt's mean error on D is −0.30 — exactly −α: lowering the whole surface by $c$ cuts the penalty by $\alpha c$ and costs the fit $\tfrac12c^2$, so the balance is $c=\alpha$ (equivalently, the penalty's gradient on the constant term is α). With the data term the mean error is 0.00: a constant shift moves $\E_\mu[f]$ and $\E_{\mathcal D}[f]$ alike, so the penalty no longer rewards it. 14 of the 15 points sit above the first attempt, by up to 0.81 at the right end of D, where the attacker's designs (the grey strip) crowd. The full COMs curve is the first attempt lifted by 0.30 (exactly, inside D), so the attacker's paths — and any later search — are unchanged: only the level was wrong. If asked why that matters: the surrogate's own values are biased low even on the designs we measured, and α would set the level as well as the relative push; with the data term it sets only the gap. The attacker never goes past x ≈ 5.8. The first attempt is low at x = 8–10 only because the slope it was bent to near 5–6 continues outward, and the far edge is still over-rated (1.98 here, 2.31 for full COMs, against a true −0.14) — the point of "Conservatism is learned where the attacker went". The right panel deliberately shows no search; Algorithm 2 comes two slides later.
:::

### The loss, term by term
$$L(\theta) = \underbrace{\tfrac12\,\E_{(x,y)\sim \mathcal D}\big[(f_\theta(x)-y)^2\big]}_{\text{(i) fit the data}} \;+\; \alpha\Big(\underbrace{\E_{x\sim\mu_\theta}[f_\theta(x)]}_{\hl{\text{(ii) push the attacker's designs down}}} \;-\; \underbrace{\E_{x\sim \mathcal D}[f_\theta(x)]}_{\hl{\text{(iii) hold the data up}}}\Big)$$

::: cols wide-r
::: col
- **(i)** ordinary regression — be right about the designs we measured;
- **(ii)** prevent over-estimation out of distribution;
- **(iii)** prevent under-estimation in distribution.
:::
::: col
::: figure coms-three-terms | 440
The source's picture of the same sum: regression on real designs, a push up on real designs, a push down on designs from adversarial generation.
:::
:::
:::

### COMs as an algorithm — train against an attacker, then search slowly
{math: compact}

::: cols
::: col Algorithm 1 — training
```
initialise f_θ; pick η, α
repeat:
  sample (x₀, y) ~ D
  x_K ← K ascent steps from x₀ on f_θ
  μ   ← empirical distribution of the x_K
  L   = ½ E_D (f_θ(x₀) − y)²
        + α E_μ[f_θ] − α E_D[f_θ]
  θ   ← θ − λ ∇_θ L
```
:::
::: col.accent Algorithm 2 — finding the design
```
x₀ = argmax_{(x,y)∈D} y    ← the best design we own
for t = 0 … T−1:            ← T = 450 in the paper
  x_{t+1} = x_t + η ∇_x L_opt(x_t)

return x̂ = x_T
```
:::
:::

::: reveal
$$L_{\text{opt}}(x)=\hat f_{\theta^*}(x)-\beta\,\hat f_{\theta^*}\big(x+\eta\nabla_x\hat f_{\theta^*}(x)\big)\;\approx\;(1-\beta)\,\hat f_{\theta^*}(x)-\beta\eta\,\lVert\nabla_x\hat f_{\theta^*}(x)\rVert^2$$

A **trust region**: it penalises the value one look-ahead step further on, so the search climbs slowly and favours flat ground — up to second order, gradient ascent with a penalty on the gradient's size. The paper uses $\beta=0.9$ and a **fixed** $T=450$ steps: it is not run to convergence.
:::

::: reveal
::: keypoint
Training flattens the surrogate on a distribution of challenging designs near the data. The final search is deliberately slow and short, so that ==within its budget it does not get far from where conservatism was learned==.
:::
:::

::: note
Source alignment: Part 2 p. 35 (Algorithms 1 and 2); the trust-region objective is Trabucco et al. (2021), Eq. 4 and §3.4 (β = 0.9, T = 450; the paper also reports that using the trust-region procedure to build μ performs similarly). The toy in the next widgets: the attacker takes K = 25 plain ascent steps from every data point; the search is Algorithm 2 with β = 0.9 and T = 450. With the paper's one-step attacker this 1-D toy is too local to protect anything.
:::

### Turning the dial
::: widget conservative-coms {"seed":17,"try":"Drag α","tryAt":"bar"}
The same picture as Act 1: at $\hat x$ the dot is what the surrogate **promised**, the ring what $\hat x$ is **really worth**. The search always takes ==the same 450 slow steps== from □; only the penalty $\alpha$ changes. Too little and it runs to the edge ($B$ large); too much and it stops short of $x^*$ ($A$ large).
:::

::: note
Numbers on the dial: $B$ falls from $4.44$ at $\alpha=0$ to below zero by $\alpha=0.15$; $A$ rises to $1.41$ at $\alpha=1.3$; the loss is $2.79$, $0.33$ at $0.15$, $0.03$ or less from $0.3$ to $0.9$, and $0.70$ at $1.3$. At $\alpha=0$ the trust-region search passes the optimum (worth $2.66$) near step 50 and reaches the edge by step 450 — the same end point as plain ascent. Why the search stops: the trust-region gradient is about $0.1\times\hat f'$, so on the conservative surrogate (slope about $0.07$ beyond the data, against $0.41$ for the plain fit) each step moves about $0.0024$ and 450 steps travel about $1.1$. Run longer at $\alpha=0.3$: $x=7.41$ after 900 steps (worth $1.90$), $9.78$ after 1,800, the edge by 4,500. Only $\alpha=1.3$ stops at a real peak of the surrogate ($x=4.43$). The attacker's farthest point at $\alpha=0.3$ is $x=5.84$, so $\hat x=6.32$ is just outside $\mu$.

The exact three-term split $f(x^*)-f(\hat x)=A+\text{gap}+B$ always holds. Dropping the gap to get the bound $A+B$ is valid only when the gap is non-positive — when the search ends at a point the surrogate rates at least as high as $x^*$. A local search need not, which is why the dial shows $A$, $B$ and the loss but not the bound.
:::

### The same shape on a real task
{sub: COMs against naive gradient ascent · HopperController, 5,126 dimensions}

::: cols wide-l
::: col
::: figure coms-vs-ascent | 400
Average return of the design after each ascent step, as the source deck shows it. The published version (Trabucco et al., 2021, Fig. 3) runs to 450 steps and shows the same shape.
:::
:::
::: col
**Naive ascent** improves at first — near 2,800 after about seven steps in this figure — then deteriorates as further steps carry it further from the data.

**COMs** climbs slowly and stays high over the 450 steps — as in the toy, where a flattened surrogate and a slow search keep the design near the data for that budget.

::: keypoint
The penalty does not make the search smarter. It makes later steps ==stop being rewarded for leaving the data==.
:::
:::
:::

::: note
Source alignment: Part 2 p. 38. The paper reports the same comparison for the evaluation budget (p. 40): COMs reaches about 2,400 within 25 candidates, naive ascent needs all 128 to reach about 2,100.
:::

### Conservatism is learned where the attacker went
{sub: so the final search must not go far from there}
::: widget conservative-coms {"mode":"optimiser","alpha":0.3,"seed":17}
$\alpha=0.3$: after 450 slow steps the search is next to the true best, still rising slowly. Press →: plain ascent on the same surrogate runs to the far edge, where ==nothing pushed it down==. Press → again: the slow search on the steep plain fit.
:::

::: note
The 2 × 2 of model and search, 450 steps from the best design in $D$: plain fit + plain ascent → $x=10$, worth $-0.14$; plain fit + trust region → $x=10$, $-0.14$ (it passes $2.66$ near step 50); conservative fit + plain ascent → $x=10$, $-0.14$, where the surrogate still promises $2.31$ (it passes $2.65$ near step 40); conservative fit + trust region → $x=6.32$, $2.62$. In this toy neither half works alone — and the slow search is still rising when its steps run out: run far longer, it reaches the edge too.
:::

::: keypoint
==COMs is the pair==: a surrogate flattened where the attacker went, and a short, slow search on it.
:::

### Why it works — one value per design
{sub: a tabular simplification, for intuition}
{math: compact}

Take a finite set of designs, one free value $\hat f(x)$ for each, data frequencies $d(x)$ and attacker frequencies $\mu(x)$:

$$L=\tfrac12\sum_x d(x)\big(\hat f(x)-y(x)\big)^2+\alpha\Big(\sum_x\mu(x)\hat f(x)-\sum_x d(x)\hat f(x)\Big)$$

Setting $\partial L/\partial \hat f(x)=d(x)\big(\hat f(x)-y(x)\big)+\alpha\big(\mu(x)-d(x)\big)=0$:

$$\hat f(x)=y(x)-\alpha\Big(\frac{\mu(x)}{d(x)}-1\Big)$$

::: reveal
$$\E_\mu\big[\hat f-y\big]=-\alpha\Big(\sum_x\frac{\mu(x)^2}{d(x)}-1\Big)=-\alpha\sum_x\frac{\big(\mu(x)-d(x)\big)^2}{d(x)}\;\le\;0,\qquad \E_d\big[\hat f-y\big]=0.$$

:::

::: reveal
::: keypoint
Under the attacker's distribution the model is a lower bound on average; under the data it is unbiased. Where the attacker visits more often than the data, $\hat f$ is pushed down — and where less often, it is pushed ==up==.
:::
:::

::: small
Assumed: $\mu$ and $d$ are distributions on the same finite set, $\mu(x)>0$ only where $d(x)>0$, $y(x)$ is the mean measured value at $x$, and $\mu$ is held fixed. If the attacker reaches a design with $d(x)=0$ — genuinely out of distribution — the tabular loss has no minimum there at all: this explains the mechanism; it does not show that OOD is solved.
:::

### What the calculation promises, and what it does not
::: widget coms-tabular
Three designs, each with a free value. Grey: how often the data sees it; red: how often the attacker does. Press → to apply $\hat f=y-\alpha(\mu/d-1)$, and again for what follows.
:::

::: reveal
::: block Proposition 1 *(informal)* | Trabucco et al., 2021
For a neural network under regularity assumptions, a large enough $\alpha$ gives $\;\E_{x_0\sim\mathcal D,\,x_T\sim\mu(x_T\mid x_0)}\big[\hat f(x_T)\big]\le\E_{x_0\sim\mathcal D,\,x_T\sim\mu(x_T\mid x_0)}\big[f(x_T)\big]$ — the same kind of statement: an average over the optimiser's own outputs. Its proof needs Lipschitz and kernel-style assumptions on the network (see the paper).
:::
:::

::: note
Numbers behind the picture (α = 0.5): d = (0.5, 0.3, 0.2), μ = (0.1, 0.3, 0.6), y = (1, 2, 3), so f̂ = (1.4, 2.0, 2.0). E_μ[f̂ − y] = −0.56 = −α Σ(μ − d)²/d with Σ(μ − d)²/d = 1.12; E_d[f̂ − y] = 0.
:::

### Conservatism is a dial — make it a budget
{sub: choosing α is hard, so state the conservatism in the objective's own units}

$$\theta^* = \argmin_\theta \tfrac12\E_{\mathcal D}\big[(f_\theta(x)-y)^2\big] \quad\text{s.t.}\quad \E_{x\sim\mu_\theta}[f_\theta(x)] - \E_{x\sim \mathcal D}[f_\theta(x)] \;\le\; \hl{\tau}$$

::: cols wide-l
::: col
::: figure coms-tau | 400
HopperController, five budgets. {p}(Trabucco et al., 2021)
:::
:::
::: col
$\alpha$'s right value depends on the scale of $y$; $\tau$ is a **budget** on how far the surrogate may rate the attacker's designs above the data. It bounds a gap between two of the surrogate's *own* averages — not its error, which is never observed offline. With the objective normalised first, the paper uses $\tau=0.05$ on every task, and $\alpha$ becomes the constraint's Lagrange multiplier.

$\tau=0.1$ barely moves for forty steps — conservative enough to stay home. $\tau=1$ and $\tau=2$ climb fastest. Neither end is free.
:::
:::

::: reveal
::: small
Turning a penalty into a constraint with an interpretable budget is a move this course makes more than once — Lecture 1's trust region, and TRPO's bound on the policy step in Lecture 10.
:::
:::

::: note
Source alignment: Part 2 pp. 36 (the constraint form) and 39 (the τ ablation).
:::

### The same disease, one rung up the course
{sub: an analogy Lecture 12 takes up}

::: cols
::: col.accent COMs — a conservative *objective*
$$\begin{aligned}
\theta^*=\argmin_\theta\;\Big\{&\tfrac12\E_D[(f_\theta(x)-y)^2]\\
&+\alpha\big(\E_\mu[f_\theta]-\E_D[f_\theta]\big)\Big\}.
\end{aligned}$$

An optimiser exploits $f_\theta$ at ==designs outside the data==.
:::
::: col.accent CQL — a conservative *value*
$$\begin{aligned}
Q^*=\argmin_Q\;\Big\{&\tfrac12\E_D[(Q-\mathcal B^\pi\hat Q)^2]\\
&+\alpha\,\E_{s\sim D}\Big[\log\textstyle\sum_a e^{Q(s,a)}\\
&\qquad-\E_{a\sim\hat\pi_\beta(\cdot\mid s)}[Q(s,a)]\Big]\Big\}.
\end{aligned}$$

A policy exploits $Q$ at ==actions outside the data==.
:::
:::

::: reveal
::: keypoint
Fit the data · push down what the optimiser would chase · hold up what the data contains. The problem and the shape of the objective are shared; the targets, the optimiser and the guarantees are not.
:::
:::

::: note
Source alignment: Part 2 p. 33, where the source deck draws this comparison itself.
:::

### Check — what conservatism costs
{q: 2}

::: quiz In COMs, raise $\alpha$ far past its useful range. Which term of the decision bound grows, and why?
- $B$ — the surrogate becomes optimistic everywhere
- The training error on $\mathcal D$ — term (iii) stops holding the data up
- Neither — more conservatism is always safer
- =$A$ — the surrogate under-rates good designs the attacker visits, so the search stops short of them
Conservatism ==trades $B$ for $A$==. Too little and the optimiser exploits the error; too much and the model refuses to rate anything it has not already seen, which is a very safe way to be useless. In the toy, $\alpha=1.3$ gives $A=1.41$ and a returned design worse than the best in $\mathcal D$. Writing the conservatism as a budget $\tau$ makes the trade visible; it does not remove it.
:::

### PRIME — a conservative surrogate for hardware design
{sub: Kumar, Yazdanbakhsh, Hashemi, Swersky & Levine · ICLR 2022}

$$\theta^*=\argmin_\theta\;\E_{\mathcal D}\big[(f_\theta(x)-y)^2\big]-\alpha\,\E_{x^-\sim\mathrm{Opt}(f_\theta)}\big[f_\theta(x^-)\big]-\beta\,\E_{x'\sim\mathcal D_{\text{infeasible}}}\big[f_\theta(x')\big]$$

::: cols wide-r
::: col
Here $f$ is a **latency**, which is minimised — so conservative means pushing the predicted latency *up* at the designs the optimiser finds, and at designs the log records as **infeasible**. Training over many target applications lets one model serve unseen ones.

The search uses only a log of past simulations; the baseline calls the simulator as it searches.
:::
::: col
::: figure prime-latency | 520
Latency of the best accelerator found (lower is better). {p}(Kumar et al., 2022)
:::
:::
:::

::: note
Source alignment: Part 2 pp. 54–55. The source writes PRIME's loss without COMs' data term; it is reproduced as written.
:::

### RoMA — make the surrogate smooth where the optimiser stands
{sub: Yu, Ahn, Song & Shin · NeurIPS 2021 · the objectives are in the appendix}

::: cols wide-l
::: col
::: figure roma-smoothness | 560
Same crosses, same dashed truth. The jagged surrogate's tallest spike is a ==wrong solution==; the smoothed one peaks on the truth. {p}(Yu et al., 2021, Fig. 2)
:::
:::
::: col
The assumption it adds: over-estimates come from a network that is **not smooth** — spurious spikes between and beyond the data. So it changes the surrogate's *shape* near each candidate, not its *level*.
:::
:::

::: cols
::: col Stage 1 — train it smooth
Fit the data under noise on the inputs and the worst nearby perturbation of the weights.
:::
::: col.accent Stage 2 — re-smooth at each step
Before each ascent step, adapt the model to be flat at the current candidate, without moving its prediction there far.
:::
:::

::: keypoint
Adjacent to COMs rather than the same idea: COMs lowers the scores the optimiser would reach; RoMA removes the slopes that would carry it there.
:::

::: note
Source alignment: Part 2 pp. 41–49. The picture is the paper's Figure 2; the two objectives and the paper's pipeline figure are on the appendix slide "Backup — RoMA's two stages".
:::

### Session 1 — what conservatism fixed, and what it left
{kicker: SESSION 1}

::: cols
::: col.accent Mitigated
$B$, the optimiser's exploit — on the designs the training attacker visits, with a dial ($\alpha$) or a budget ($\tau$) to set how hard, and a short, slow search that does not get far from there.
:::
::: col.red Left
- the protection is tied to **the region its attacker explored** — and to **the search's budget**;
- too much of it inflates **$A$**;
- it never says **how much the model knows**, so it cannot tell a gap in the data from a region that is truly poor.
:::
:::

::: keypoint
COMs controls the optimiser's optimism. Session 2 asks two questions it cannot answer: can we tell **which predictions are actually uncertain**, and can **knowledge of the system** make the model trustworthy to begin with?
:::

## Act 3 — uncertainty: decide with what the model does not know
{short: ACT 3, num: Session 2 · Act 3}

**Q3.** Conservatism controls the optimiser's optimism. Can the surrogate instead tell us *where* it does not know — and can the decision use that?

### Session 2 — where Session 1 left off
{q: 3}

::: qstrip
:::

::: cols
::: col.accent What conservatism did
It lowered the scores the optimiser would reach — $B$ shrank — on the designs its own attacker visited, and a slow search kept the final design there.
:::
::: col.red What it could not tell us
**How much the model knows.** A penalty treats a gap in the data and a genuinely poor region alike: both are simply rated low.
:::
:::

::: keypoint
Two answers today. **Uncertainty:** estimate what the surrogate does not know, and decide with it. **System knowledge:** give the surrogate grounds to extrapolate that the data alone cannot.
:::

### The papers of Session 2
::: widget mbo-papers {"start":1,"try":"Click any paper"}
The two right-hand columns are today's. Click a paper for what it does, why we read it and how it connects.
:::

### Uncertainty is Lecture 4's tool, with the sign turned
::: cols
::: col Online — Bayesian optimisation *(Lecture 4)*
$$x_{t+1}=\argmax_x\;\mu(x)+\kappa\,\sigma(x)$$

**Optimism.** Go where the band is wide: if the model is wrong there, the next measurement says so and the band collapses.
:::
::: col.accent Offline — this lecture
$$\hat x=\argmax_x\;\mu(x)-\kappa\,\sigma(x)$$

**Pessimism.** Stay where the band is narrow: no measurement will ever correct a wrong guess, so a wide band is a risk, not an opportunity.
:::
:::

::: keypoint
The same two numbers, $\mu$ and $\sigma$. What changed is whether the loop closes — whether uncertainty can still be **reduced** by looking.
:::

### One model, two signs
::: widget lcb-flip {"kappa":2,"try":"Drag κ","tryAt":"bar"}
A model of the same fifteen points whose mean extrapolates optimistically — like Session 1's surrogate — but whose $\sigma$ grows honestly away from the data. Optimism walks to the far edge, where the band is widest; pessimism with $\kappa$ about 2 stays at the data.
:::

### Where $\sigma$ comes from for a neural surrogate — Deep Ensembles
{sub: Lakshminarayanan, Pritzel & Blundell · NeurIPS 2017}

A GP gives $\sigma$ in closed form. A neural network does not. The simplest widely used answer: train several networks and read their disagreement.

$$\mu(x)=\frac1M\sum_{m=1}^M\hat f_m(x),\qquad \sigma^2_{\text{ens}}(x)=\frac1M\sum_{m=1}^M\big(\hat f_m(x)-\mu(x)\big)^2$$

::: cols
::: col The bet
Members trained from different random starts (or resampled data) agree where the data pins the function down, and **disagree** where it does not.
:::
::: col.accent The offline rule
Plug the ensemble's $\mu$ and $\sigma$ into $\mu-\kappa\sigma$. If the bet holds, the rule avoids the designs the members argue about.
:::
:::

::: note
The paper also has each member predict its own noise variance and adds it to $\sigma^2$; the disagreement term above is the part that grows away from the data.
:::

### In our toy, the alarm is too quiet
::: widget ensemble-alarm {"seed":17,"kappa":2,"try":"Drag κ","tryAt":"bar"}
Ten members, each fitted to a resample of the same fifteen points. Their spread does widen off the data — but at the far edge it is only 0.24 while their mean is wrong by 4.4. The rule $\mu-\kappa\sigma$ still walks to $x=10$; it would take $\kappa\approx10$ to stop it. The members share an architecture and data, so they ==extrapolate wrongly together==.
:::

### NEMO — uncertainty as how easily the model could be talked into any answer
{sub: Fu & Levine · ICLR 2021}

::: figure nemo-cnml | 760
**Left:** we want $p(y\mid x)$ at a design far from the data. **Middle:** pretend each possible label $y$ was observed there, and refit. **Right:** normalise across all those refits. {p}(Fu & Levine, 2021, Fig. 1)
:::

$$p_{\text{NML}}(y\mid x)=\frac{p\big(y\mid x;\hat\theta_{\mathcal D\cup(x,y)}\big)}{\int p\big(y'\mid x;\hat\theta_{\mathcal D\cup(x,y')}\big)\,dy'}$$

::: keypoint
Far from the data, one extra point can be fitted whatever its label, so the distribution is ==wide==; near the data, only labels close to the trend survive.
:::

**The decision.** Climb $x$ on $\E_{p_{\text{NML}}}[y\mid x]$: where the distribution is wide, it is pulled toward the middle of the label range, so ==optimistic extrapolation stops paying==.

::: note
Source alignment: Part 2 pp. 15–16. Computing it exactly would mean refitting for every label; NEMO quantises $y$ into $K$ bins and keeps $K$ models that it updates *while* it optimises $x$ (Part 2 pp. 17–20; see the appendix backup).
:::

### NEMO's own test — against the ensemble
::: figure nemo-vs-ensemble | 1000
The same data (left), modelled by NML (middle) and by a bootstrapped ensemble (right). In the boxed region, outside the data, NML is smeared; the ensemble is still a thin, confident line. {p}(Fu & Levine, 2021)
:::

::: keypoint
The point NEMO makes is the one our toy just made: an uncertainty estimate is only useful offline if it ==widens where the data runs out==.
:::

::: note
Source alignment: Part 2 p. 21.
:::

### How far can an uncertainty estimate be trusted?
{sub: Ovadia et al., "Can you trust your model's uncertainty?" · NeurIPS 2019}

::: cols
::: col What they found
Across many methods, calibration — whether a 90 % band holds the truth 90 % of the time — gets worse as the test data drift away from the training data. Ensembles held up best, but they also degraded.
:::
::: col.accent What it means here
An optimiser does not drift gently away from the data: it ==searches for the most extreme design it can find==. Offline MBO puts the uncertainty estimate exactly where such studies find it least reliable.
:::
:::

::: note
Not an MBO paper; it is the standard large-scale study of predictive uncertainty under dataset shift, and it tested deep ensembles among other methods.
:::

### What uncertainty buys, and what it costs
::: cols c3
::: col Assumption added
$\sigma$ tracks the error: wide where the model is wrong, narrow where it is right.
:::
::: col.accent What it solves
The decision can see the difference between *I have checked this* and *I have not* — and avoid the second.
:::
::: col.red What it leaves
$\sigma$ is itself a model output. Off the data it can be as wrong as $\mu$, and in the same direction.
:::
:::

### Check — reading an ensemble's agreement
{q: 3}

::: quiz At a design far from the data, all ten members of an ensemble agree to within 0.05. What can you conclude?
- The prediction there is reliable
- The design must lie inside the data distribution
- =Very little: members that share an architecture and data can extrapolate wrongly together
- The true value is within 0.1 of the mean
Agreement is evidence only where the members could have disagreed. Off the data, members built the same way from the same points tend to extrapolate the same way — our toy's ensemble agreed to 0.24 where it was wrong by 4.4. Uncertainty estimates also degrade under shift for every method studied (Ovadia et al., 2019), and an optimiser seeks out exactly the most shifted designs.
:::

## Act 4 — system knowledge: give extrapolation grounds
{short: ACT 4, num: Session 2 · Act 4}

**Q4.** The data cannot say what happens where there is no data. What we know about the system sometimes can.

### Knowledge, ordered by how much of it you have
{q: 4}

::: qstrip
:::

::: flow | | 
- **Structure** | which variables act together — the function splits into parts
- **A simulator** | an approximate model of the system, wrong in level but right in shape
- !**The equations** | the governing laws themselves, as constraints
:::

::: keypoint
Each step down adds information the dataset does not contain — and each is an assumption. Right knowledge makes extrapolation trustworthy; ==wrong knowledge biases every prediction==.
:::

### Structure — count what it takes to see the space
{sub: functional graphical models · Grudzien Kuba, Uehara, Abbeel & Levine, AISTATS 2024}

::: widget fgm-stitch {"mode":"graph"}
Cut each variable into ten cells. To see every cell of the whole space takes $10^4$ designs; if the function splits into parts, it is enough to see every cell of each part — press →. A count of coverage, not the paper's theorem.
:::

::: note
The paper's result is a regret bound for offline optimisation that depends on how well the data cover each clique's marginal, rather than the joint; it also gives an algorithm that infers the structure from data, over the inputs or over a latent representation. The 10,000-versus-210 count is the intuition, not the bound.
:::

### Structure — a design better than any in the data
::: widget fgm-stitch {"mode":"stitch"}
Press → to stitch, and again to check.
:::

::: keypoint
FGM's question is exactly slide 7's: can offline optimisation beat the best design in the data? With the right structure, yes — by combining parts that were each seen, ==in a combination that never was==.
:::

### A simulator — Kennedy & O'Hagan
{sub: Bayesian calibration of computer models · JRSS-B 2001}

::: widget ko-discrepancy
The same fifteen points and the same hidden function as Session 1. Press → twice.
:::

::: keypoint
The prediction relaxes to the simulator, not to a straight line, because the GP's error term returns to its zero prior mean away from the data. That is an assumption, not a guarantee: ==where the simulator is wrong and there is no data, so is the model==.
:::

::: note
Kennedy & O'Hagan is a calibration paper — it fits the simulator's parameters $\theta$ and the discrepancy jointly; it is not itself an MBO algorithm. Here $\theta$ is fixed and only the discrepancy is learned. Lecture 4's GP plays the role of $\delta(x)$.
:::

### The equations — physics-informed surrogates
{sub: hPINN · Lu, Pestourie, Yao, Wang, Verdugo & Johnson · SIAM J. Sci. Comput. 2021}

::: flow | | 
- **Design** | the shape or material layout being optimised
- **Network** | predicts the physical field the design produces
- !**Physics in the loss** | the governing equation's residual, and hard constraints built into the network
- **Objective** | computed from the field, then improved
:::

::: keypoint
When the governing equation is known, extrapolation is no longer left to the data: the network is trained to satisfy the equation at points spread over the domain, with the design's constraints imposed explicitly. The cost is the strongest assumption of the three — ==a known equation== — and the physics holds only as well as it is enforced.
:::

::: note
hPINN solves inverse-design problems in optics and fluids with physics-informed networks, imposing hard constraints by penalty and augmented-Lagrangian methods. It is adjacent work, not fixed-dataset offline MBO: it uses the equations, not just logged designs.
:::

### What knowledge buys, and what it costs
::: cols c3
::: col Assumption added
The structure, the simulator or the equations are **right** — beyond the data, where they cannot be checked.
:::
::: col.accent What it solves
Extrapolation gets grounds other than the data: parts combine, a simulator supplies the shape, physics rules out the impossible.
:::
::: col.red What it leaves
Knowledge is often partial or missing, and wrong knowledge does not announce itself — it is trusted most exactly where the data cannot correct it.
:::
:::

### Check — when to trust a stitched design
{q: 4}

::: quiz An additive model $f(x_1,x_2)=g(x_1)+h(x_2)$ predicts that a combination never measured beats every design in the data. When should you trust it?
- Always — the model fits the data closely
- =When $x_1$ and $x_2$ really do not interact, and each part was observed across the range used
- Never — the design is out of distribution
- When the dataset is large enough
The prediction rests on the structure, not on the fit: if $x_1$ and $x_2$ interact, a small training error can coexist with a badly wrong stitched value. With the right structure and coverage of each part, combining parts that were each seen is exactly how offline optimisation can beat the best design in the data.
:::

## Closing
{short: CLOSING}

Three answers to one failure — and the problem they leave for Lecture 6.

### Three answers, side by side
::: table center
|   | **Conservatism** | **Uncertainty** | **System knowledge** |
|---|---|---|---|
| in depth | COMs | Deep Ensembles, NEMO | FGM |
| mechanism | lower the scores the optimiser would reach | estimate what the model does not know; decide with $\mu-\kappa\sigma$ | constrain how the model may extrapolate |
| assumption | the attacker finds the tempting designs | $\sigma$ tracks the error | the structure, simulator or physics is right |
| strength | curbs optimism where the search goes | separates *unchecked* from *checked* | can beat the best design in the data |
| weakness | too much inflates $A$; tied to its search | $\sigma$ fails where it matters most | wrong knowledge biases everything |
:::

::: keypoint
Not rivals: an uncertainty penalty is itself conservative, and a structured model can be trained conservatively. Each controls $B$ under a different assumption.
:::

### What all three leave — and what Lecture 6 takes up
::: cols c3
::: col Performance
Is the design good? — *the objective*
:::
::: col.accent Reliability
Can we trust the predicted score? — ==this lecture==
:::
::: col Validity
Is the design possible at all — a molecule, a foldable protein? — ==Lecture 6==
:::
:::

::: keypoint
OOD and invalid are different problems: a design outside the data can be valid and excellent, and one next to the data can break a constraint. This lecture gave predictions grounds for trust, each under a stated assumption; it did not make the search space valid or give a batch of different good candidates. Lecture 6 learns ==the distribution of plausible designs== and lets a performance model in at four places — and every tool of this lecture can still be used there.
:::

### Where we are — a forward model, then a search
::: table center
|   | **the model** | **the decision** |
|---|---|---|
| **Surrogate *(Lec 5 ✓)*** | ==forward: $f_\theta(x)\approx f(x)$== | ==search $f_\theta$ — conservatively, with uncertainty, or with knowledge== |
| **Generative *(Lec 6)*** | a distribution of plausible designs, plus a performance model | search its coordinates, refit it, condition it, or steer its sampler |
:::

::: reveal
::: small
Hold the shape of this lecture: a forward model searched carefully. Lecture 6 keeps a performance model in the loop and adds a generator that decides **where to look** — and this lecture's failure reappears there wherever the performance model steers the generator. Lecture 12 meets it again, with a policy exploiting a $Q$-function.
:::
:::

### Offline, every number off the data is a guess — decide accordingly.
{layout: standout}

Lower the guess where the search goes, measure how unsure it is, or give it grounds from what you know about the system.

### Questions?
{layout: standout}

Two things to carry out of here. **The optimiser is an adversary of its own model** — it will find the errors. And **trust needs grounds** — a penalty, an honest uncertainty, or knowledge of the system.

## Appendix — backup slides
{short: APPENDIX}

Complete statements, kept out of the narrative.

### Reading guide — Session 1 papers: the problem and conservatism

| paper | why we read it | how it connects |
|---|---|---|
| **Adversarial examples** · Goodfellow et al., ICLR 2015 | the mechanism: gradient search finds where a model is wrong | COMs generates this attack during training and trains against it |
| **Design-Bench** · Trabucco et al., ICML 2022 | defines offline evaluation; every method here is scored on it | we use its 2021 task versions |
| **COMs** · Trabucco et al., ICML 2021 — *in depth* | the clearest conservative surrogate | one-step twin of CQL; PRIME and LCOMs build on it |
| **PRIME** · Kumar et al., ICLR 2022 | conservatism in real chip design, from logged simulations | builds on COMs |
| **RoMA** · Yu et al., NeurIPS 2021 | another lever: shape, not level | compared with COMs |
| **CQL** · Kumar et al., NeurIPS 2020 | the same disease, with a policy as the optimiser | Lecture 12 |
| **LCOMs** · Qi et al., ICLR 2023 workshop | a conservative surrogate searched in a learned space | Lecture 6 |

### Reading guide, continued — Session 2 papers: uncertainty and system knowledge

| paper | why we read it | how it connects |
|---|---|---|
| **Deep Ensembles** · Lakshminarayanan et al., NeurIPS 2017 — *in depth* | the standard σ behind $\mu-\kappa\sigma$ | Lecture 4's UCB, sign turned |
| **NEMO** · Fu & Levine, ICLR 2021 | uncertainty built for offline MBO | same group and year as COMs |
| **Uncertainty under shift** · Ovadia et al., NeurIPS 2019 | calibration degrades with shift, even for ensembles | stress-tests the uncertainty stream |
| **Functional graphical models** · Grudzien Kuba et al., AISTATS 2024 — *in depth* | when structure lets us beat the best design in the data | Lecture 3's graphs |
| **Kennedy & O'Hagan** · JRSS-B 2001 | a simulator inside a surrogate | Lecture 4's GP as the error term |
| **Hard-constraint PINN** · Lu et al., SIAM J. Sci. Comput. 2021 | the governing equations themselves | needs a known PDE |

::: note
Most of these papers come from one research programme — Levine's group at Berkeley: CQL (2020), COMs and NEMO (2021), PRIME and Design-Bench (2022), LCOMs (2023), FGM (2024). The map slide says so in its Session 2 text.
:::

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

### Backup 2 — NEMO, made tractable
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

### Backup — one COMs loss calculation
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
==Fit measured targets and shrink the score gap to tempting candidates.== In a network the two updates share parameters, so each moves the other's prediction too.
:::

### Backup — RoMA's two stages
{sub: Yu, Ahn, Song & Shin · NeurIPS 2021}

::: figure roma-pipeline | 600
Step 1 pre-trains under input noise and weight perturbation, but only smooths where the data is; so Step 2 re-adapts the model (yellow) at every candidate $x^{(t)}$ before the solution update. {p}(Yu et al., 2021, Fig. 1)
:::

::: cols
::: col Stage 1 — train it smooth
$$L(\theta) = \max_{\tilde\theta\in B(\theta)}\ \E_{(x,y)\sim D,\ \delta\sim\mathcal N(0,\sigma)}\Big[\big(f(x+\delta;\tilde\theta)-y\big)^2\Big]$$

Noise on the inputs, worst-case perturbations of the weights, $B(\theta)=\{\tilde\theta:\lVert\theta_l-\tilde\theta_l\rVert_F\le\epsilon\lVert\theta_l\rVert_F\}$; the inner maximisation by projected gradient ascent.
:::
::: col.accent Stage 2 — re-smooth at each step
$$\begin{aligned}
\theta_t=\argmin_{\tilde\theta\in B(\theta)}\;\Big\{&\lVert\nabla_x f(x^{(t)};\tilde\theta)\rVert_2\\
&+\alpha\big[f(x^{(t)};\tilde\theta)-f(x^{(t)};\theta_{t-1})\big]^2\Big\}
\end{aligned}$$

Flatten the model at the current candidate, without moving its prediction there far.
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

### LCOMs — a conservative surrogate searched in a learned space
{sub: Latent Conservative Objective Models · Qi et al., ICLR 2023 workshop on ML for materials}

Chemical space is not a vector space, so a **CD-VAE encoder** $\phi(x,c)$ maps a crystal into one, and a conservative surrogate of the lattice energy is optimised ==inside that latent space==, then decoded:

$$\theta^*=\argmin_\theta\ \E_{(x,c)\sim\mathcal D}\big[(E_\theta(\phi(x,c),c)-E(x,c))^2\big]-\alpha\,\E_{x^-\sim\mathrm{Opt}(E_\theta)}\big[E_\theta(\phi(x^-,c),c)\big]$$

::: small
Mean energy improvement $2.25$ against supervised learning's $1.10$. A generative model supplies the coordinates; a conservative surrogate does the searching — the bridge Lecture 6 crosses.
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
