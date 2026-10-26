---
ch: 6
title: Data-Driven Design Optimization — Generative-Based
subtitle: Learn where good designs live — then search, refit, condition or steer
tagline: Offline, part 2 of 2 — a generator decides where to look; a performance model decides what to trust
blurb: >-
  A surrogate says how good a design is; it does not say what a design looks like or where to look.
  Learn a generative model of plausible designs, then let a performance signal in at one of four places —
  the coordinates the search moves in, the distribution designs are drawn from, the performance the
  generator is asked for, or each step of its sampler — and see what each assumes, solves and leaves.
course: IE437 · Data-Driven Decision Making and Control
author: Jinkyoo Park
institute: KAIST
cube:
  stages: static
  model: data-driven
  agents: single agent
inherits: a performance model that needs grounds for trust, and the validity problem it leaves (Lecture 5)
handoff: a generator and a performance model, used together — a pairing that returns as policy and value (Lecture 7 onward)
questions:
  - What do surrogates leave?
  - How do we model designs?
  - Coordinates or distribution?
  - Condition or sampler?
---

### Data-Driven Design Optimization — Generative-Based
{layout: title}

### Where we are — from judging a design to proposing one
::: table center
|   | Lecture 4 · *Observe* | Lecture 5 · *Trust* | **Lecture 6 · *Generate*** |
|---|---|---|---|
| the question | which experiment to run next | how to judge an unmeasured design | ==which designs to propose== |
| the model | a GP of $f$ | a performance model $\hat f$ | ==a generator of plausible designs==, plus $\hat f$ |
| the decision | query the acquisition's arg-max | return the surrogate's arg-max, carefully | search, refit, condition or steer |
:::

::: keypoint
Lecture 5 **judges** a design: a performance model, trusted with care.
Lecture 6 **proposes** designs: a generator says where to look.
==Proposing is not judging== — evidence about performance still comes from the data.
:::

### Learning route — two sessions, four places to intervene
::: flow
- **Build a generator** | Session 1 · from Bayes and optimisation
- **G1 · coordinates** | Session 1 · search its codes
- **G2 · distribution** | Session 1 · refit it
- **G3 · condition** | Session 2 · ask it for a score
- **G4 · sampler** | Session 2 · steer its sampling
:::

::: keypoint
First build a generator.
Then let the performance signal in — ==at four places==.
:::

::: note
Bring: the surrogate, the decision bound and how an optimiser exploits it (Lecture 5); Bayes' rule, the evidence and maximum likelihood (Lecture 2); hidden variables, sampling and weighting (Lecture 3); convexity and gradient-based optimisation (Lecture 1). Session 1: what surrogates leave → two models, two jobs → the ELBO two ways, the VAE, diffusion → G1 → G2 with CbAS worked through. Session 2: G3 (CVAE, MINs, DDOM) → the KL-regularised view → G4 → the four side by side. Keep Lecture 5's three questions apart throughout — performance (is it good?), validity (is it possible?), reliability (can the prediction be trusted?); each method buys one and can spend another. The closing slide returns to them.
:::

## Act 1 — what surrogates still leave
{short: ACT 1, num: Session 1 · Act 1}

**Q1.** Lecture 5 gave the surrogate grounds for trust. Three problems are still standing.

### The problem, unchanged — and what the algorithm may use
The same problem as Lecture 5, with the valid set written in:

$$\text{find}\quad x^* = \argmax_{x\in\hl{\mathcal X_{\text{valid}}}} f(x) \qquad\text{with only } D = \{(x_i,y_i)\}_{i=1}^N,\quad y_i=f(x_i)+\epsilon_i$$

::: cols
::: col What the algorithm may use
The fixed dataset, and any knowledge stated up front — a known constraint can be checked directly. **Strict offline:** $f$ is never called while training, choosing or tuning.
:::
::: col.accent What it may not
The hidden oracle that scores the final candidates — as in Lecture 5's Design-Bench. The widgets draw the true $f$ for the teacher's eyes only.
:::
:::

::: note
Source alignment: Part 1 pp. 2–3, repeated as Part 2 pp. 3–4 — the source opens Lecture 6 with Lecture 5's slide; the valid set and the information boundary are made explicit here.
:::

### What Lecture 5 left standing
{q: 1}

::: qstrip
:::

::: cols c3
::: col A huge space
The optimiser still moves one point through every coordinate of $x$ — a protein of 237 residues has $20^{237}$ sequences. Conservatism made each move safer, not the space smaller.
:::
::: col.accent Validity
Most of $x$ is not a design at all — not a molecule, not a folded protein, not an image of a digit. Lecture 5's last slide: ==out of distribution and invalid are different problems==, and a surrogate scores both.
:::
::: col One answer
The arg-max returns one design; a lab wants a batch of different good candidates. Reliable scoring alone does not provide convenient coordinates, or a distribution of diverse, plausible candidates.
:::
:::

::: keypoint
The source's answer: ==model what plausible designs look like, and steer that model toward good ones== — a distribution over designs, plus a performance signal.
:::

::: note
Source alignment: Part 1 p. 4 — the main problem, conservatism limiting expressivity, and three promises of sampling (no optimisation, diverse designs, constraints satisfied implicitly). The first and third are softened here: several methods below still optimise, and a learned prior encourages validity without guaranteeing it.
:::

### One $y$, many $x$ — the average answer can be invalid
::: widget forward-inverse {"seed":7}
Run the forward map backwards — from the $y$ you need to the $x$ that delivers it — and it is not a function: ==a curve in two pieces==. The red mark is the midpoint of that set — what a least-squares inverse returns — stranded in the valley between the branches.
:::

::: keypoint
To keep several answers, make the inverse **stochastic**: $x=f^{-1}_\theta(y,z)$ with $z\sim p(z)$ choosing among them. That is a generative model.
:::

::: note
The same point in one line: for $y=x^2$ and $y=4$, the two answers are $\pm2$; their average $0$ scores $0$. The widget's numbers: every point of the curve is worth $2.00$, their midpoint $0.81$. Source alignment: Part 2 p. 20 ("make the inverse mapping stochastic … cf. CVAE").
:::

### Two models, two jobs
::: cols
::: col The performance model — *Lecture 5*
*How good is this candidate?* Trained on pairs $(x,y)$. Wrong off the data, and exploited by whatever searches it — so Lecture 5 gave it grounds for trust: conservatism, uncertainty, knowledge.
:::
::: col.accent The generator — *this lecture*
*Which candidates should we look at?* Trained on designs $x$ (sometimes with $y$). It offers plausibility, diversity and coordinates — but alone it only samples designs **like the data**, mediocre ones included.
:::
:::

::: keypoint
A generator is not an optimiser: ==every generative optimiser needs a performance signal== — the dataset's labels or a performance model. Where can it enter? Four places, G1–G4 — taken up after the tools:
:::

::: flow
- **G1 · coordinates** | search a code, then decode
- **G2 · distribution** | refit the generator toward good designs
- **G3 · condition** | ask the generator for a performance
- !**G4 · sampler** | steer the sampling process
:::

### Check — reading the function backwards
{q: 1}

::: quiz Lecture 5 learned $\hat{f}: x \mapsto y$ and searched it. A score-conditioned inverse model — one of this lecture's four routes — learns the other direction. What makes that harder than it sounds?
- =The map is many-to-one, so the "inverse" is not a function but a *distribution* over designs achieving a target
- The inverse is more expensive to evaluate
- The inverse cannot be represented by a neural network
- The training data would have to be collected in reverse
Many different designs can score the same $y$. A model trained to regress $x$ from $y$ under a squared loss returns the **average** of those designs — very often not a valid design at all. That is why the answer has to be a generative model that samples, rather than a regressor that predicts.
:::

## Act 2 — generative models, built from Bayes and optimisation
{short: ACT 2, num: Session 1 · Act 2}

**Q2.** Before steering a generator toward good designs, you need one that produces designs at all. Everything in this act is built from tools you already have: Bayes' rule and maximum likelihood (Lecture 2), hidden variables (Lecture 3), and optimisation (Lecture 1).

### What a generative model learns
{q: 2}

::: qstrip
:::

::: block The goal
Train $p_\theta(x)$ to match the data distribution $p_{\text{data}}(x)$, given only samples $\{x_i\}_{i=1}^N\sim p_{\text{data}}$.
:::

::: widget gen-pictures {"mode":"goal"}
Simple noise goes in; a network turns it into a design. Training pulls the model's distribution (green) onto the data's (blue) — ==where the data lives, and in what shape==.
:::

::: keypoint
Once trained, a draw from $p_\theta$ is a new design that resembles the data — no optimiser is needed to produce it.
To train it we need two things: a number for how far apart two distributions are, and a way to make it small.
:::

::: note
Source alignment: Part 1 p. 6. The source lists six families that do this — VAEs, autoregressive models, normalising flows, energy-based models, GANs and diffusion; Backup 2 compares four. This act builds the VAE from Lectures 1–3, then diffusion from the VAE. "Resembles the data" is not "valid": the next slides return to that.
:::

### Comparing two distributions — the KL divergence
$$D_{\mathrm{KL}}(a\,\|\,b)=\E_{x\sim a}\Big[\log\frac{a(x)}{b(x)}\Big]\;\ge 0,\qquad =0 \text{ only when } a=b.$$

::: widget kl-direction
Here $a$ is the data and $b$ the model. Press → to spread the model over both modes.
:::

::: keypoint
The KL from the data to a model charges ==wherever the data lives and the model does not==.
Fitting a model removes that charge: the model must cover the data.
:::

::: note
Not met before in this course. Only this direction is needed now: $D_{\mathrm{KL}}(p_{\text{data}}\|p_\theta)$, the next slide's maximum likelihood, and later CbAS's fit. The bar is the integral of $p\log(p/q)$, large only where $p$ lives and $q$ does not (6.43 nats on one mode, under 0.01 on both). KL is not symmetric: averaged over the model instead, it would charge only where the model goes and the data does not — that direction appears once, in Session 2's tilt, and is explained there. The VAE's code term $D_{\mathrm{KL}}(q_\phi(z\mid x)\|p(z))$ is that second direction applied to codes; on the VAE slides it only needs to be a nonnegative penalty.
:::

### Fitting the model — minimising the KL is Lecture 2's maximum likelihood
Write out the KL from the data to the model, and split the log of the ratio into two logs:

$$D_{\mathrm{KL}}\big(p_{\text{data}}\,\|\,p_\theta\big) \;=\; \underbrace{\E_{p_{\text{data}}}\big[\log p_{\text{data}}(x)\big]}_{\text{no }\theta\text{ in it}} \;-\; \underbrace{\E_{p_{\text{data}}}\big[\log p_\theta(x)\big]}_{\approx\ \frac1N\sum_i\log p_\theta(x_i)}
\qquad\Longrightarrow\qquad
\argmin_\theta D_{\mathrm{KL}} \;=\; \hl{\argmax_\theta \sum_{i=1}^N\log p_\theta(x_i)}$$

::: cols
::: col Lecture 2 — a coin
$\theta$ is one number, the chance of heads, and $\log p(D\mid\theta)=S\log\theta+(N-S)\log(1-\theta)$ is a formula: set its derivative to zero and $\hat\theta=S/N$.
:::
::: col.accent This lecture — a design
$\theta$ is the weights of a network that *makes* designs. How probable is a given design under it? ==There is no formula== — the next two slides say why, and what to do instead.
:::
:::

::: keypoint
Training a generative model is maximum likelihood.
The only new problem is ==computing $\log p_\theta(x_i)$==.
:::

::: note
The sample average replaces the expectation over $p_{\text{data}}$ — Lecture 3's Monte Carlo. What is learned is where plausible designs concentrate — not a feasibility certificate: a learned density puts low, not zero, probability away from the data, and like Lecture 5's surrogate it is unconstrained where there is no data (Backup 4). Known constraints still need a check, or a decoder that enforces them. Source alignment: Part 1 p. 7.
:::

### Hidden factors — the latent-variable model
A design has many coordinates, but its variation comes from a few factors $z$. Draw those, then make the design:

$$p_\theta(x) \;=\; \int \underbrace{p_\theta(x\mid z)}_{\text{decoder: a network}}\;\underbrace{p(z)}_{\mathcal N(0,\,I)}\,dz$$

::: widget gen-pictures {"mode":"latent"}
One draw of all the factors, decoded, is one face; amber and blue are two draws. For a design, the factors would be a few shape parameters.
:::

::: keypoint
Lecture 3's move: ==a hidden variable makes a complicated distribution simple to write== — a plain prior and a network.
:::

::: note
Source alignment: Part 1 p. 8 (its sixth axis is left out of the redraw; draw A carries the source's values). The factors are learned, so they need not be interpretable: the labels are the source's illustration. The solid arrow is the generative story; the dashed arrow back is inference — Bayes' rule, next slide.
:::

### Why the posterior — training must know which code made each design
The decoder learns a map from codes to designs. How would we train it?

::: cols
::: col If each design came with its code
Pairs $(z_i, x_i)$: fit $p_\theta(x\mid z)$ by maximum likelihood — ==ordinary regression==, Lecture 2.
:::
::: col.accent Only the designs are observed
The code is a **hidden variable**, Lecture 3. For each design we must first ask: ==which codes could have made it?== That answer is the posterior $p_\theta(z\mid x)$.
:::
:::

::: flow
- **A design $x_i$** | observed
- !**Which code made it?** | the posterior $p_\theta(z\mid x_i)$
- **Train the decoder** | rebuild $x_i$ from those codes
:::

::: keypoint
Generating needs only the prior and the decoder.
Training needs, for each design, ==the codes that could have made it== — the posterior.
:::

::: note
The same need, in the language of the last slide: $\log p_\theta(x)$ averages $p_\theta(x\mid z)$ over every code, but only codes that explain $x$ contribute — the next widget counts how few they are. Lecture 3 filled in hidden variables the same way: infer them from what was observed, then learn. After training, the same posterior (approximated by the encoder) gives each design its coordinates, which G1 searches.
:::

### Bayes' rule again — the evidence is an integral we cannot do
So we need the posterior. Lecture 2's Bayes' rule gives it, with the code $z$ as the unknown:

$$\underbrace{p_\theta(z\mid x)}_{\text{posterior: which code made }x} \;=\; \frac{p_\theta(x\mid z)\,p(z)}{\underbrace{\textstyle\int p_\theta(x\mid z')\,p(z')\,dz'}_{\text{evidence }p_\theta(x)\text{: what training needs}}}$$

::: widget elbo-views {"mode":"prior"}
Press → twice. A one-number code and a toy decoder, so every curve is exact.
:::

::: keypoint
One integral blocks both needs: the evidence for training, the posterior for encoding.
The way out: pick a simple $q_\phi(z\mid x)$ and ==tune it to be as close to the posterior as it can be== — inference turned into optimisation.
:::

::: note
Why the integral is hard here. Lecture 2's coin evidence $\int p(D\mid\theta)\,p(\theta)\,d\theta$ had a closed form, because a Beta prior and a Binomial likelihood fit together (conjugacy). Lecture 3's evidence was a sum over every assignment of the hidden variables — exponential in how many there are. Here $z$ is continuous and $p_\theta(x\mid z)$ is a network: no conjugacy, and no grid fine enough. Drawing codes from the prior is Lecture 3's likelihood weighting with a rare cause: in the toy, about 1 draw in 4 explains $x$ (likelihood above 10% of its peak, $|z|\in(0.96,1.75)$, prior mass 0.256); if ten factors each had to land that well, about 1 in 800 000. "Variational" means choosing the best member of a family of distributions — here Gaussians whose mean and spread a network computes from $x$. Two derivations follow and reach the same objective: one starts from the evidence, the other from the posterior. Source alignment: Part 1 pp. 8–9.
:::

### What training optimises — $\theta$ is the goal, $\phi$ the helper
{math: compact}

::: cols
::: col The goal — $\theta$, the decoder $p_\theta(x\mid z)$
The generator we want. Fit it by Lecture 2's maximum likelihood, $\max_\theta\sum_i\log p_\theta(x_i)$ — ==blocked by the integral==.
:::
::: col.accent The helper — $\phi$, the encoder $q_\phi(z\mid x)$
==The posterior, approximated by a network==: for each design, the codes that could have made it. Training needs it; G1 later uses it as coordinates.
:::
:::

**The objective** — one number per design, summed over the data, maximised over both:

$$\max_{\theta,\phi}\ \sum_{i=1}^N \mathrm{ELBO}(\theta,\phi;x_i),\qquad \mathrm{ELBO}(\theta,\phi;x)\;=\;\underbrace{\log p_\theta(x)}_{\text{what }\theta\text{ should raise}}\;-\;\underbrace{D_{\mathrm{KL}}\big(q_\phi(z\mid x)\,\|\,p_\theta(z\mid x)\big)}_{\text{the encoder's error, }\ge 0}$$

::: small
Neither term can be computed alone; their difference can. The next slides derive it twice and reach its computable form.
:::

::: keypoint
Over $\phi$, raising the ELBO shrinks the encoder's error.
Over $\theta$, it raises the likelihood.
==Both at once==: every step in $\theta$ moves the posterior that $\phi$ must follow.
:::

::: note
This answers "what do we learn, and what do we optimise". The purpose is $\theta$: a decoder that turns prior codes into plausible designs. $\phi$ is needed only because the true posterior $p_\theta(z\mid x)$ cannot be computed; the encoder is that posterior, approximated. The ELBO is a lower bound on $\log p_\theta(x)$ because the KL is never negative, with equality exactly when $q_\phi$ is the posterior. Why not train $\theta$ alone? With a poor $q$ the bound is loose, and raising it over $\theta$ also pushes the model's posterior toward $q$ rather than only raising the likelihood. So $q$ must keep up. One could alternate — fit $\phi$ with $\theta$ fixed, then $\theta$ with $\phi$ fixed, as EM does when the posterior is exact. The VAE instead takes one gradient step on both per batch, with one encoder shared by every design. The computable form, derived on the next slides: $\mathrm{ELBO}=\E_{q_\phi}[\log p_\theta(x\mid z)]-D_{\mathrm{KL}}(q_\phi(z\mid x)\,\|\,p(z))$.
:::

### Jensen's inequality — the log of an average is at least the average of the logs
::: widget elbo-views {"mode":"jensen"}
To show the ELBO is a floor under $\log p_\theta(x)$, view 1 needs one fact about the log. Press → for the chord.
:::

$$\underbrace{\log \E[w]}_{\text{log of the average}} \;\ge\; \underbrace{\E[\log w]}_{\text{average of the logs}} \qquad \text{for any positive random } w\text{, because the log is concave}$$

::: keypoint
Lecture 1 read a bound off a convex function's tangent; a concave function's chord gives this one.
It turns ==the log of an integral, which we cannot compute,== into ==an average of logs, which we can estimate by sampling==.
:::

::: note
New in this course: view 1 needs it. Equality holds only when $w$ is constant. Two points with weight $\tfrac12$ each are the picture exactly; an expectation is the same chord argument with many points. Numbers: $w_1=0.3$, $w_2=2.5$, $\log 1.4=0.336\ge\tfrac12(\log0.3+\log2.5)=-0.144$.
:::

### ELBO, view 1 — bound the evidence from below
{math: compact}

**Multiply and divide by $q_\phi(z\mid x)$** — the integral becomes an average over $q$:

$$\underbrace{\log p_\theta(x)}_{\text{the evidence}} \;=\; \underbrace{\log \int p_\theta(x,z)\,dz}_{\text{an integral we cannot do}} \;=\; \underbrace{\log \E_{z\sim q_\phi}\Big[\frac{p_\theta(x,z)}{q_\phi(z\mid x)}\Big]}_{\text{the same, as an average over }q}$$

::: reveal
**Jensen**, with $w=p_\theta(x,z)/q_\phi(z\mid x)$ — move the log inside the average:

$$\ge\; \E_{z\sim q_\phi}\Big[\log\frac{p_\theta(x,z)}{q_\phi(z\mid x)}\Big] \;=:\; \hl{\mathrm{ELBO}(\theta,\phi;x)}$$
:::

::: reveal
**Split $p_\theta(x,z)=p_\theta(x\mid z)\,p(z)$** — two terms, each estimated by drawing $z$ from $q$:

$$\mathrm{ELBO} \;=\; \underbrace{\E_{q_\phi}\big[\log p_\theta(x\mid z)\big]}_{\text{reconstruct }x\text{ from its code}} \;-\; \underbrace{D_{\mathrm{KL}}\big(q_\phi(z\mid x)\,\|\,p(z)\big)}_{\text{keep codes near the prior}}$$
:::

::: reveal
::: keypoint
We cannot compute $\log p_\theta(x)$, but we can compute — and raise — ==a floor under it==: the **E**vidence **L**ower **BO**und.
Raising the floor over $\theta$ raises the likelihood it guarantees: Lecture 2's maximum likelihood, done through a bound.
:::
:::

::: note
Source alignment: Part 1 p. 9, "Variational Inference (Evidence Perspective)", line for line. The KL term in the last line has a closed form for Gaussians; the reconstruction term is estimated with one draw of $z$ per design.
:::

### ELBO, view 2 — measure how far $q$ is from the true posterior
{math: compact}

**How far is $q$ from the posterior?** Encoding needs them equal, so measure the difference with the KL:

$$D_{\mathrm{KL}}\big(q_\phi(z\mid x)\,\|\,p_\theta(z\mid x)\big) \;=\; \E_{q_\phi}\Big[\log\frac{q_\phi(z\mid x)}{p_\theta(z\mid x)}\Big]$$

::: reveal
**Bayes' rule**, $p_\theta(z\mid x)=p_\theta(x,z)\,/\,p_\theta(x)$ — the evidence moves to the top:

$$=\; \E_{q_\phi}\Big[\log\frac{q_\phi(z\mid x)\;\hl{p_\theta(x)}}{p_\theta(x,z)}\Big]$$
:::

::: reveal
**Split the log** of a product into a sum of two logs:

$$=\; \underbrace{\E_{q_\phi}\Big[\log\frac{q_\phi(z\mid x)}{p_\theta(x,z)}\Big]}_{-\,\mathrm{ELBO}\text{: view 1's quantity, sign flipped}} \;+\; \underbrace{\E_{q_\phi}\big[\log p_\theta(x)\big]}_{=\ \log p_\theta(x)\text{: no }z\text{ inside}}$$
:::

::: reveal
::: keypoint
Rearranged: $\log p_\theta(x)=\mathrm{ELBO}+D_{\mathrm{KL}}\big(q_\phi\,\|\,p_\theta(z\mid x)\big)$.
The KL is never negative, so the ELBO is a floor again — and the gap is ==exactly how far $q$ is from the true posterior==.
:::
:::

::: note
Source alignment: Part 1 p. 10, "Variational Inference (Optimization Perspective)". The second underbrace: the average of a constant is the constant. The first: view 1 defined the ELBO as $\E_q[\log p_\theta(x,z)/q_\phi(z\mid x)]$, and flipping the fraction flips the sign of the log.
:::

### The gap, drawn — move $q$, and the evidence stays put
$$\log p_\theta(x) \;=\; \underbrace{\mathrm{ELBO}(\theta,\phi;x)}_{\text{blue bar}} \;+\; \underbrace{D_{\mathrm{KL}}\big(q_\phi(z\mid x)\,\|\,p_\theta(z\mid x)\big)}_{\text{amber gap}}$$

::: widget elbo-views {"mode":"gap","try":"Drag mean and spread","tryAt":"bar"}
The same design and the same two-peaked posterior as two slides ago. Move $q$: the evidence line stays put, and ==whatever the ELBO gains, the gap loses==. Press → for the best single Gaussian.
:::

::: keypoint
Raising the ELBO over $q$ is the same as ==moving $q$ onto the posterior==.
One Gaussian cannot cover two peaks, so the best one sits on a single peak and a gap remains.
:::

::: note
Source alignment: Part 1 p. 10's picture of a two-peaked posterior with one Gaussian laid over it. Toy model: $z\sim\mathcal N(0,1)$, $x\mid z\sim\mathcal N(z^2,0.5^2)$, observed $x=2$ — Act 1's "one $y$, many $x$", now with codes. $\log p(x)=-2.17$. With $q$ equal to the prior: ELBO $-6.23$, KL $4.06$. The best Gaussian ($m=1.33$, $s=0.19$): ELBO $-2.88$, KL $0.71$ — close to $\log 2$, because one bump covers one of two equal peaks. That is the KL slide's "stay where $p$ lives" direction: $q$ picks a peak rather than straddling both.
:::

### Two views, one objective
$$\log p_\theta(x) \;=\; \underbrace{\mathrm{ELBO}(\theta,\phi;x)}_{\text{computable}} \;+\; \underbrace{D_{\mathrm{KL}}\big(q_\phi(z\mid x)\,\|\,p_\theta(z\mid x)\big)}_{\text{gap}\;\ge\;0}$$

::: table center
| | View 1 — from the evidence | View 2 — from the posterior |
|---|---|---|
| starts from | $\log p_\theta(x)$: what training needs | $D_{\mathrm{KL}}(q_\phi\,\|\,p_\theta(z\mid x))$: what encoding needs |
| one step | Jensen's inequality | Bayes' rule |
| it shows | the ELBO is a floor under the evidence | the gap is exactly the encoder's error |
| maximise the ELBO over | $\theta$ — raise the floor under the likelihood: ==learning== | $\phi$ — move $q$ onto the posterior: ==inference== |
:::

::: keypoint
One objective, maximised over both $\theta$ and $\phi$, learns the model and infers the codes at once.
==That objective is the VAE.==
:::

::: note
The source's box (Part 1 p. 9): maximising the evidence = maximising the ELBO with respect to $q$ = minimising $D_{\mathrm{KL}}(q(Z\mid X)\,\|\,p(Z\mid X))$ with respect to $q$. Read the identity left to right for view 1, right to left for view 2. Lecture 2 found posteriors by conjugacy and Lecture 3 by enumeration and sampling; here, for the first time, a posterior is found by optimisation — which is what "variational inference" means.
:::

### VAE — encode, decode, and an objective with two terms
{sub: “Auto-Encoding Variational Bayes” · Kingma & Welling · ICLR 2014, math: compact}

::: paper
- Why it is here | Act 2's ELBO with $q_\phi$ and $p_\theta$ made two networks — view 1's last line, below.
- What it is | The VAE paper: one encoder infers every code; reparameterisation (next slide) makes it trainable.
- Why it matters | It joined deep learning to probabilistic inference — ICLR's first Test of Time award, 2024.
:::

$$\mathcal{L}(\theta,\phi;x) = \underbrace{\E_{q_\phi(z\mid x)}\big[\log p_\theta(x\mid z)\big]}_{\text{\hl{reconstruct the design}}} \;-\; \underbrace{D_{\mathrm{KL}}\big(q_\phi(z\mid x)\,\|\,p(z)\big)}_{\text{\hl{keep codes near the prior}}}$$

::: widget gen-pictures {"mode":"arch"}
:::

::: keypoint
The KL term makes the latent space ==samplable== — a **coordinate system for designs**, which G1 will search.
:::

::: note
The formula is view 1's last line, maximised over both networks at once. The figure: the encoder gives a mean and a spread, the code is drawn as $\mu+\sigma\odot\epsilon$, and the decoder rebuilds the design. Each term attaches to one part. To generate, only the decoder is needed. The paper (arXiv December 2013) opened deep generative modelling; Rezende, Mohamed & Wierstra (ICML 2014) reached the same model independently. ICLR's 2024 Test of Time committee credited it with joining deep learning to scalable probabilistic inference. Codes from the prior decode to plausible designs because the KL term keeps the codes near the prior. $p(z)$ is a prior over **codes**, not Lecture 2's prior over parameters: the network's weights are point estimates, and drawing $z$ does not express uncertainty about them. The standard ELBO has weight 1 on the KL; the $\beta$-VAE two slides on changes that weight and is a different objective. A one-coordinate ELBO calculation is in the appendix. Source alignment: Part 1 p. 11.
:::

### Reparameterisation — a sample you can differentiate
::: widget gen-pictures {"mode":"reparam"}
Left: the encoder's output feeds a random draw, and the gradient has nowhere to go. Right: the same draw written as a formula, with the noise as an input.
:::

For one design $x$ with a one-number code, both terms are plain formulas in $\mu$ and $\sigma$ — a loss for Lecture 1's gradient methods:

$$\mathcal L(x) \;\approx\; \underbrace{-\,\big\|x-\hat x_\theta(\mu+\sigma\epsilon)\big\|^2}_{\text{reconstruction: a squared error}} \;-\; \underbrace{\tfrac12\big(\mu^2+\sigma^2-1-\log\sigma^2\big)}_{\text{KL from }\mathcal N(\mu,\sigma^2)\text{ to }\mathcal N(0,1)}$$

::: keypoint
==The randomness moves into an input $\epsilon$==, so the gradient reaches the encoder — and the whole VAE trains like any other network.
:::

::: note
Here $\mu=\mu_\phi(x)$, $\sigma=\sigma_\phi(x)$, and one draw $\epsilon\sim\mathcal N(0,1)$ per design per step; $\hat x_\theta(z)$ is the decoder's output. "$\approx$": the squared error is $\log p_\theta(x\mid z)$ for a Gaussian decoder with its noise scale and constants dropped. With a code of several numbers the KL is summed over them, and training averages $\mathcal L$ over the designs. The source writes the same objective as $\log p_\theta(x_i\mid\mu_\phi(x)+\epsilon\sigma_\phi(x))-D_{\mathrm{KL}}[\mathcal N(\mu_\phi(x_i),\sigma_\phi(x_i))\,\|\,\mathcal N(0,I)]$. "A linear map of a Gaussian is Gaussian" — the probability appendix's Property 2 — is why $\mu+\sigma\epsilon$ has the right distribution. Source alignment: Part 1 p. 12.
:::

### Reading the two terms — move, shrink, pull back
{math: compact}

::: cols c3
::: col (i) reconstruction alone
$$\max\ \E_{q}\big[\log p_\theta(x\mid z)\big]$$

::: widget gen-pictures {"mode":"terms","k":1}
Each design's code moves to wherever the decoder recognises it best — ==away from the prior==.
:::
:::
::: col (ii) … and it cheats
::: reveal
$$\max\ \E_{q}\big[\log p_\theta(x\mid z)\big],\quad \sigma\to 0$$

::: widget gen-pictures {"mode":"terms","k":2}
Shrink the spread to nothing and reconstruction is perfect — but ==a draw from the prior lands between the codes==, where the decoder never trained.
:::
:::
:::
::: col.accent (iii) + the KL term
::: reveal
$$\max\ \E_{q}\big[\log p_\theta(x\mid z)\big]\;\hl{-\;D_{\mathrm{KL}}\big(q\,\|\,p(z)\big)}$$

::: widget gen-pictures {"mode":"terms","k":3}
The KL pulls each code toward zero and keeps it wide: the codes ==overlap and fill the prior==.
:::
:::
:::
:::

::: keypoint
The VAE arranges the data on a ==compact, smooth latent space that we can sample from==.
:::

::: note
Source alignment: Part 1 p. 13, the three-panel figure: penalising the reconstruction loss makes each distribution describe its input; without regularisation the network can cheat by learning narrow distributions; penalising the KL divergence acts as a regularising force — zero mean, enough variance for a smooth latent space. Panel (ii) has the same objective as (i): it is what (i) does when nothing stops it. The next slide turns the KL weight continuously.
:::

### Turning the dial
::: widget latent-beta {"seed":5}
An exactly solvable VAE with a weight $\beta$ on the KL term. Each dot is a design's code, each halo its blur, the ring the prior. ==At $\beta=1$ the codes fill the prior exactly==; below it they spill outside, above it they collapse to a dot.
:::

::: note
Spread plus blur sum to exactly $1.000$ at $\beta=1$, $1.565$ at $\beta=0.05$ and $0.930$ at $\beta=20$ (Backup 1 has the formula).
:::

### From the VAE to diffusion — stack the codes, fix the encoder
::: widget gen-pictures {"mode":"ladder"}
Press → twice: one code, then two stacked codes, then $T$ codes — each the size of the design, made by an encoder that only adds noise.
:::

::: keypoint
Diffusion is a VAE with ==$T$ codes and a fixed encoder==, trained with the same ELBO.
Only the decoder — the denoiser — is learned.
:::

::: note
The source's "key differences with the VAE" (Part 1 p. 18): the latent has the dimension of the data; the encoder is a predefined linear-Gaussian noising step, with nothing to train; $p(x_T)=\mathcal N(0,I)$. With $T$ codes the ELBO is $\E_q[\log p_\theta(x_{0:T})/q(x_{1:T}\mid x_0)]$ — the encoder's parameters $\phi$ have disappeared. Backup 2b expands it into one KL per step; Backup 3 shows it collapses to one squared error on the noise — the next slide. Source alignment: Part 1 pp. 15–18.
:::

### Diffusion — learn the noise, then remove it step by step
{sub: “Denoising Diffusion Probabilistic Models” · Ho, Jain & Abbeel · NeurIPS 2020}

::: paper
- Why it is here | The generator behind DDOM, GTG, RGD and our lab's layouts. Its denoising steps are where G4 steers.
- What it is | A Berkeley paper: the diffusion models of 2015, trained by one squared error on the noise.
- Why it matters | It matched GANs' image quality and started the diffusion era — in images, proteins and molecules.
:::

Train the ladder's decoder: the ELBO with $T$ codes collapses to one squared error on the added noise (Backup 3).

::: cols
::: col Train — corrupt once, predict the noise
$$x_t=\sqrt{\bar\alpha_t}\,x_0+\sqrt{1-\bar\alpha_t}\,\epsilon,\qquad L_{\mathrm{simple}}=\E\,\big\|\epsilon-\epsilon_\theta(x_t,t)\big\|^2$$

Draw a clean design, corrupt it by a known amount, and ==predict the noise that was added== — a supervised problem at every noise level.
:::
::: col.accent Generate — start from noise, denoise
$$x_{t-1}=\frac{1}{\sqrt{\alpha_t}}\Big(x_t-\frac{\beta_t}{\sqrt{1-\bar\alpha_t}}\,\epsilon_\theta(x_t,t)\Big)+\sigma_t z$$

Start from $x_T\sim\mathcal N(0,I)$, not from a training design; each step is ==a small denoising step==.
:::
:::

::: keypoint
Denoising steps are steps of the algorithm, not physical time — and each one is a place where the sampler could be **steered**: Session 2 shows two ways.
:::

::: note
$\alpha_t=1-\beta_t$, $\bar\alpha_t=\prod_{j\le t}\alpha_j$, $z\sim\mathcal N(0,I)$ at stochastic steps and none at the last. The full variational derivation and its weights are Backups 2b and 3; a one-number training step is in Backup 3. Source alignment: Part 1 pp. 15–22, 47–63.
:::

### Check — turning the KL weight
{q: 2}

::: quiz In a $\beta$-VAE, you raise $\beta$, the weight on the KL term. What do you get?
- Sharper reconstructions and a more structured latent space
- Sharper reconstructions at the cost of latent structure
- =A latent space closer to the prior and easier to sample from, at the cost of blurrier reconstructions
- No change in either — $\beta$ only affects training speed
The KL term pulls the codes toward the prior; the reconstruction term pulls them apart so that designs stay distinguishable. Raising $\beta$ wins the first and loses the second: prior samples decode to plausible designs, but detail is lost. It is the same trade as Lecture 5's conservatism dial — fidelity to the data against freedom to generate.
:::

## Act 3 — coordinates and distribution
{short: ACT 3, num: Session 1 · Act 3}

**Q3.** A generator and a performance model are on the table. Where does the performance signal get in?

### Four places to intervene
{q: 3}

::: qstrip
:::

::: table center
|   | where the performance signal enters | what changes | in depth | where Lecture 5's failure can re-enter |
|---|---|---|---|---|
| **G1 · coordinates** | the search over codes | search a code $z$; decode $x=g(z)$ | latent search {p}(2018) | the predictor on codes is a surrogate |
| **G2 · distribution** | the generator's parameters | refit $p(x)$ toward predicted success | CbAS {p}(2019) | the refit follows the success model's errors |
| **G3 · condition** | the generator's input | ask $p(x\mid y)$ for a high $y$ | MINs {p}(2020), DDOM {p}(2023) | a requested $y$ beyond the data |
| **G4 · sampler** | the sampling process | performance information moves the sample (a gradient) or sets the guidance strength | classifier guidance {p}(2021), RGD {p}(2024) | the sampler follows the performance model where it is wrong |
:::

::: keypoint
Intervention points, not rival classes: a method can use several. For each, ask ==what it assumes, what it solves, what it leaves== — and wherever a surrogate enters, Lecture 5's three streams still apply.
:::

### The papers of this lecture — why each is here
::: widget mbo-papers {"set":"ch06","try":"Click any paper"}
Press → for Session 2's papers; click any paper for what it does, why we read it and how it connects. The same list is a table in the appendix.
:::

### G1 — search in learned coordinates
{sub: “Automatic Chemical Design Using a Data-Driven Continuous Representation of Molecules” · Gómez-Bombarelli et al. · ACS Central Science 2018}

::: paper
- Why it is here | G1's founding example. Lecture 4 met it for the dimension; here it is about validity.
- What it is | A chemistry paper (Aspuru-Guzik group, Harvard): a VAE on molecules, a predictor on its codes.
- Why it matters | It started latent-space molecular design; its invalid decodes set the agenda for JT-VAE.
:::

::: cols wide-r
::: col
A VAE turns molecules (SMILES strings) into continuous codes, with a property predictor trained on the codes; search the codes — by gradient steps or Bayesian optimisation — and decode the best.

::: reveal
::: keypoint
The search becomes low-dimensional and continuous, and every point it visits decodes to *something*.
==Whether that something is valid is one bet.==
==Whether the predictor is right about it is a separate one.==
:::
:::
:::
::: col
::: figure ch04/latent-bo-fig1 | 520
Encode, predict, optimise in the latent space, decode. {p}(Gómez-Bombarelli et al., 2018)
:::
:::
:::

::: note
Lecture 4 used it for its dimension reduction: a 196-dimensional latent space for ZINC molecules, searched with a GP. Here the point is validity: the coordinates were learned from valid molecules. About 74% of random latent points decode to a valid molecule (Lecture 4, from the paper's Table 4).
:::

### Search the plane, or search the code
::: widget manifold-search {"mode":"g1"}
Press → three times: search the plane, search along the road, then ask how good the answer is.
:::

::: note
The road is the curve itself, known exactly — a teaching device; a learned decoder is only approximately valid, and its code need not be a distance. Numbers behind the picture: ascent on the quadratic surrogate $\hat f(x)$ (data RMSE $0.065$) leaves the curve within two steps and reaches the corner, where $\hat f$ promises $4.97$. The latent surrogate $\hat f(t)$ picks $t=2.8$: $\hat f=1.88$, truth $0.39$; the true best is $2.40$ at $t=1.8$, beyond the last measured code ($t\approx1.05$). Lecture 5's $B$, now on a valid design.
:::

### What latent search buys, and what it costs
::: cols c3
::: col Assumption added
The latent space is **faithful**: nearby codes decode to similar, valid designs, and the predictor on codes is honest.
:::
::: col.accent What it solves
A continuous, low-dimensional search whose candidates are designs — validity moves into the decoder.
:::
::: col.red What it leaves
Codes the decoder handles badly decode to **invalid** designs; the latent predictor is a surrogate, **exploitable** exactly as in Lecture 5.
:::
:::

::: table center
| the fix | paper | how | why it matters |
|---|---|---|---|
| validity by construction | JT-VAE {p}(Jin, Barzilay & Jaakkola, ICML 2018) | build a tree of chemically valid fragments, then assemble them | every output is a valid molecule — validity became a property of the decoder |
| reliability, from Lecture 5 | LCOMs {p}(Qi et al., ICLR 2023 workshop) | train the predictor on codes with COMs' penalty | the two lectures joined in one method — a workshop paper, read for the idea |
:::

::: keypoint
==Validity and reliability are repaired separately.==
A better decoder repairs validity.
Lecture 5's tools repair reliability.
:::

::: note
JT-VAE is a standard baseline for molecular graph generation (MIT, Barzilay and Jaakkola). "Valid" means valid chemistry: not yet synthesisable, and not yet good. LCOMs comes from the group behind COMs and applies it to crystal structures.
:::

### G2 — condition the generator on success
Move the distribution, not a point. With the **generator as the prior** and a **success model** as the likelihood — $S$: "meets the requested performance" — Bayes' rule gives the designs we want:

$$p(x\mid S)=\frac{P(S\mid x)\,p(x)}{\sum_{x'}P(S\mid x')\,p(x')}$$

::: cols
::: col The prior keeps it plausible
Designs the generator finds implausible keep little mass, however promising the success model says they are.
:::
::: col.accent The success model is Lecture 5's
Offline, $P(S\mid x)$ is a **prediction** — e.g. $P(\hat y\ge\gamma\mid x)$ from a surrogate. Its errors are inside the target; a pessimistic one ($\mu-\kappa\sigma$) gives a pessimistic target.
:::
:::

::: keypoint
Lecture 3 conditioned a fixed model on observed evidence.
Here the "evidence" is a requested outcome, judged by a model — ==the target is only as good as the success model==.
:::

### Temperature thread — condition on success: propose, then keep what succeeds
{sub: shared teaching example · predict before revealing}

::: widget cond-bars {"mode":"heater"}
Lecture 0's room, now a design choice: switch on the left heater or the right one, never both. Success means the room reaches 22 °C. The right heater sits under a window, so it rarely succeeds.
:::

**Predict:** Of the rooms that reach 22 °C, what share has the left heater on?

::: reveal
Four in five. Conditioning on success is Lecture 3's rejection sampling: propose from the generator, throw away what fails, count what is left. Press → to see it.
:::

::: note
Numbers behind the picture: prior $(0.5,0.5)$, $P(S\mid L)=0.8$, $P(S\mid R)=0.2$. Of ten proposals, $5\times0.8=4$ left and $5\times0.2=1$ right are kept (expected counts, drawn exactly), so $P(L\mid S)=4/5=0.8$ — the previous slide's Bayes rule, $0.5\times0.8/(0.5\times0.8+0.5\times0.2)$. Every kept room is a real design. If a student asks about averaging: the average of the two designs is both heaters half on, which the rule forbids — Act 1's point.
:::

### Try it — the generator now proposes the right heater four times as often
{sub: work independently · reveal only after deciding}

::: widget cond-bars {"mode":"try"}
Most rooms in the data use the right heater, so the generator now proposes it four times as often. The success model is unchanged.
:::

Of the rooms that reach 22 °C, which heater is more common now?

::: reveal
**Check your answer.** Neither — four kept rooms each. The prior and the success model decide **together**. Press → to see it.
:::

::: note
Numbers behind the picture: prior $(0.2,0.8)$, the same success model. Of 25 proposals, $5\times0.8=4$ left and $20\times0.2=4$ right are kept, so the conditional is $(0.5,0.5)$ — Bayes: $(0.2\times0.8,\;0.8\times0.2)=(0.16,0.16)$.
:::

### CbAS — fit a generator to the conditional
{sub: “Conditioning by Adaptive Sampling for Robust Design” · Brookes, Park & Listgarten · ICML 2019}

::: paper
- Why it is here | G2's rule: the previous slide's Bayes' rule, with the generator as the prior.
- What it is | A protein-design paper (Listgarten group, Berkeley) that fits a generator to that conditional.
- Why it matters | It showed refits chase a model's errors, and made the prior the brake. A standard baseline since.
:::

The target cannot be sampled directly — so fit a second generator $q(x\mid\phi)$ to it, averaging over the target:

$$p\big(x\mid S,\theta^{(0)}\big) = \frac{P(S\mid x)\,p\big(x\mid\theta^{(0)}\big)}{P\big(S\mid\theta^{(0)}\big)},\qquad \phi^* = \argmin_\phi\ D_{\mathrm{KL}}\big(p(x\mid S,\theta^{(0)})\,\|\,q(x\mid\phi)\big)$$

::: reveal
**Derivation.** Expand the KL and drop what does not depend on $\phi$:

$$D_{\mathrm{KL}} = -\E_{p(x\mid S,\theta^{(0)})}\big[\log q(x\mid\phi)\big]-H_0 = -\frac{1}{P(S\mid\theta^{(0)})}\,\E_{p(x\mid\theta^{(0)})}\big[P(S\mid x)\log q(x\mid\phi)\big]-H_0$$

$$\Longrightarrow\qquad \phi^*=\hl{\argmax_\phi\ \E_{p(x\mid\theta^{(0)})}\big[P(S\mid x)\,\log q(x\mid\phi)\big]}$$
:::

::: reveal
::: keypoint
==Weighted maximum likelihood==: draw designs from the generator, weight each by how likely it is predicted to succeed, refit. Any generative model can be trained this way, and $q$ need not be of the prior's form.
:::
:::

::: note
The prior is the trained generator $p(x\mid\theta^{(0)})$; the KL is averaged over the target — the KL slide's "cover the data" direction. $H_0=-\E_{p(x\mid S,\theta^{(0)})}[\log p(x\mid S,\theta^{(0)})]$ is constant in $\phi$. The paper builds on the same group's DbAS (Brookes & Listgarten, 2018) — CbAS without the prior. Design-Bench (Lecture 5) runs CbAS as a baseline on every task. Source alignment: Part 2 pp. 9–11.
:::

### Why one shot fails — Lecture 3's rare cause, again
::: widget cond-bars {"mode":"rare"}
A harder request: 22 °C in five minutes. Only the left heater can do it — and the generator, trained on rooms that mostly use the right heater, rarely proposes it.
:::

**Predict:** Of 100 proposed rooms, how many are kept?

::: reveal
One. ==When success is rare, almost every proposal is thrown away== — Lecture 3's rare cause. Press → to see it.
:::

::: note
Numbers behind the picture: prior $(0.02,0.98)$, $P(S\mid L)=0.5$, $P(S\mid R)=0$, so $P(S)=0.01$ — one room in 100 is kept, and ten proposals keep none with probability $0.99^{10}\approx0.90$. The two fixes as CbAS writes them. Fix 1 (next slide): propose from last round's fit, $r^{(t)}=q(x\mid\phi^{(t-1)})$, and weight each draw by $w_i=\frac{p(x_i\mid\theta^{(0)})}{q(x_i\mid\phi^{(t-1)})}P(S^{(t)}\mid x_i)$. Fix 2 (the slide after): relax the condition so that (A) each $S^{(t)}$ is met often enough under the current proposal, and (B) $S^{(t)}\supset S^{(t+1)}\supset S$ — the bar only rises, and reaches the target. The source sets $S^{(t)}$ to $y\ge\gamma^{(t)}$ with $\gamma^{(t)}$ the $Q$-th percentile of the oracle's predictions on the current samples, capped at the target. The ratio corrects the change of proposal; it is not a validity check, and it fails if the proposal misses part of the target. Source alignment: Part 2 pp. 12–15.
:::

### Why the importance ratio belongs in the weight
::: widget cond-bars {"mode":"ratio"}
Three designs, sampled from last round's model instead of the prior. Press → four times.
:::

::: note
Numbers: prior $(0.6,0.3,0.1)$, success $(0.1,0.5,0.8)$, target $p\times P(S)=(0.06,0.15,0.08)$. Proposal $q=(0.2,0.3,0.5)$; weights $(0.6/0.2)(0.1)=0.30$, $(0.3/0.3)(0.5)=0.50$, $(0.1/0.5)(0.8)=0.16$; $q\times$weight gives back the target. Without the ratio, $q\times P(S)=(0.02,0.15,0.40)$.
:::

### One shot, then the ladder
::: widget cbas-ladder {"seed":31}
Press → to ask for the target in one shot, then to climb. Here $q$ is a Gaussian refit by weighted maximum likelihood — ==the pattern Lecture 4's CMA-ES also follows==: sample, weight the good candidates, refit the distribution.
:::

::: note
The widget's title is the slide's point. Say the contrast with Lecture 3 aloud: there the model was fixed; here the proposal and the condition both move. Target $2.65$: one shot keeps $70$ effective draws of $4{,}000$; the ladder's worst round keeps $27\%$; the final design is worth $2.647$ against the dataset's best $2.523$ (true optimum $2.657$). Lecture 5's objective, with 200 designs.
:::

### What CbAS does on a real design problem
{sub: protein fluorescence, 5,000 measured sequences · Brookes et al., 2019}

::: cols wide-r
::: col
Each round, **dashed**: the oracle's 80th percentile of the samples; **solid**: their true mean.

Methods that chase the oracle — RWR, DbAS, and CEM-PI, a distribution search like Lecture 4's — climb on the dashed line while the solid line **falls**: they have found where the oracle is wrong. CbAS keeps the two together.

::: reveal
::: keypoint
==Lecture 5's failure, now in a distribution==: a generator refit to a surrogate's favourites drifts to where the surrogate is wrong, unless the prior holds it. The ratio $p/q$ is that hold — a partial one.
:::
:::
:::
::: col
::: figure cbas-iterations | 500
80th percentile of oracle predictions (dashed) and mean ground truth of the same samples (solid). {p}(Brookes et al., 2019, Fig. 2b)
:::
:::
:::

::: note
The paper's caption: high dashed and low solid values mark methods "led astray into pathological regions of the oracle". DbAS is CbAS without the prior ratio. Source alignment: Part 2 p. 16.
:::

### Two more ways to move the distribution — GFlowNet and BootGen
::: cols
::: col GFlowNet {p}(Bengio, Jain, Korablyov, Precup & Bengio · NeurIPS 2021)
::: paper
- Why it is here | A second way to move the distribution: draw designs ==in proportion to reward==, $P(x)\propto R(x)$, instead of refitting to weighted samples.
- What it is | A Mila paper: build a design step by step — an atom, a fragment, a residue — and train the steps by flow consistency. It needs **reward calls**; offline, a proxy answers them.
- Why it matters | It opened a research line on diverse candidates for discovery. Our lab's Genetic-guided GFlowNets {p}(NeurIPS 2024) tops the PMO molecular benchmark — with real oracle calls, so online.
:::
:::
::: col.accent BootGen {p}(Kim, Berto, Ahn & Park · NeurIPS 2023 · our lab)
::: paper
- Why it is here | Our lab's method for biological sequences, at **two** places: G2 — it refits toward its own best samples, like CbAS — and G3 — it is conditioned on $y$.
- What it is | Train $p_\theta(x\mid y)$ with weights by **rank** of $y$; sample at a high $y^\dagger$, let a proxy label the samples, add the top $K$, retrain; pool several generators.
- Why it matters | The best average score on six sequence tasks, with the most diverse candidates (appendix). The added samples are ==proxy-labelled, not new measurements==.
:::
:::
:::

::: keypoint
Both shift probability toward good designs, by objectives different from CbAS's — and both rely on a proxy wherever the real objective is not called.
:::

::: note
GFlowNet's reward calls are online if they query the real objective; offline they go to a proxy — Lecture 5's surrogate. Genetic-guided GFlowNets distils a genetic search into a GFlowNet under the PMO benchmark's budget of 10,000 oracle calls: a summed score of 16.213 across 23 tasks, ahead of every method in the paper's comparison. Source alignment: Part 2 pp. 35–41 (BootGen). Rank weights $w\propto(k|D|+\operatorname{rank}(y,D))^{-1}$; the loop figure, Algorithm 1 and the results table are on the appendix slides.
:::

### What moving the distribution buys, and what it costs
::: cols c3
::: col Assumption added
The success model is right **where the refit goes**, and the prior gives the good designs some mass to begin with.
:::
::: col.accent What it solves
Many good candidates at once, from a model that stays tied to plausible designs.
:::
::: col.red What it leaves
The refit follows the success model's errors as far as the prior allows; a bar set too high has nothing to climb to.
:::
:::

::: keypoint
Lecture 5's tools plug in here: build $P(S\mid x)$ from a **pessimistic** prediction ($\mu-\kappa\sigma$) or a **conservative** surrogate, and the refit has less to chase.
:::

### Check — coordinates or distribution?
{q: 3}

::: quiz A latent-space search returns a code whose decoded molecule is chemically invalid; the property predictor rates it the best ever seen. Before any evaluation, what has been established?
- The predictor is overfitted, and retraining it fixes both problems
- =A validity failure, and only that: the high prediction is not evidence of performance, and whether the predictor errs on valid designs is a separate question for evaluation
- The design is excellent; only the decoder needs fixing to output it
- Switching to CbAS would guarantee a valid molecule
Invalidity is observed directly: the decoder left the valid set — a problem of the coordinates, which JT-VAE addresses by construction. The predicted value is not a measurement: for an invalid design the property is not even defined, and for valid ones the predictor's reliability is Lecture 5's question, settled only by evaluating designs. CbAS keeps samples where the prior has mass, which helps, but a learned prior has tails: nothing here guarantees validity.
:::

### Session 1 — what generation fixed, and what it left
{kicker: SESSION 1}

::: cols
::: col.accent Mitigated
**Plausibility and diversity**: candidates come from a model of plausible designs. G1 searched its coordinates; G2 moved its distribution toward predicted success.
:::
::: col.red Left
- the performance signal still comes from a **surrogate**, exploited by the search (G1) or the refit (G2);
- G2 needed a bar $\gamma$, a success model and many refits.
:::
:::

::: keypoint
Session 2 moves the signal closer to the generator.
G3 ==asks for the performance directly==.
G4 ==uses the signal to steer the sampling process==.
A KL-regularised view connects several of them.
:::

## Act 4 — condition and sampler
{short: ACT 4, num: Session 2 · Act 4}

**Q4.** Instead of refitting the generator, tell it what you want — or steer it at every step.

### Session 2 — which distribution is this?
{q: 4}

::: qstrip
:::

::: table center
| distribution | the question it answers | where we met it |
|---|---|---|
| $p_\theta(x)$ | which designs to propose | Session 1: the generator |
| $p_\theta(x\mid y)$ | which designs for a requested $y$ | today: G3 |
| $\hat f(x)$, $P(S\mid x)$, $\mu\pm\kappa\sigma$ | how good a design is predicted to be | Lecture 5: the performance model |
| $p(z)$ | how to draw a code | the VAE's latent prior |
| $p(w\mid D)$ | which model weights are credible, given the data — a Bayesian posterior | Lecture 2 |
| ensemble disagreement | how much independently trained models differ — a non-Bayesian uncertainty signal | Lecture 5 (Deep Ensembles) |
:::

::: keypoint
The diversity of $p_\theta(x)$ is not uncertainty about performance.
==A requested $y$ is not a measured $y$.==
:::

::: note
Today: the **condition** (G3), the **sampler** (G4), and a KL-regularised view of both.
:::

### The papers of Session 2
::: widget mbo-papers {"set":"ch06","start":1,"try":"Click any paper"}
The two right-hand columns are today's. Click a paper for what it does, why we read it and how it connects.
:::

### Condition the encoder and the decoder — the inverse map is built
{sub: the conditional VAE — G3 in its simplest form}

::: paper
- Why it is here | Act 1 asked for a stochastic inverse $x=f^{-1}(y,z)$; a VAE that takes $y$ as input is one.
- What it is | Kingma et al. (NeurIPS 2014) gave a VAE a class label; Sohn, Lee & Yan (NeurIPS 2015) named it the CVAE.
- Why it matters | The template for this act: MINs, BootGen and DDOM all feed $y$ to the generator this way.
:::

$$\max_{\theta,\phi}\ \E_{q_\phi(z\mid x,\hl{y})}\big[\log p_\theta(x\mid z,\hl{y})\big] \;-\; D_{\mathrm{KL}}\big(q_\phi(z\mid x,\hl{y})\,\|\,p_\theta(z\mid \hl{y})\big)$$

::: cols wide-r
::: col
==Feed the condition $y$ into both networks.== Trained on street-number photographs, each row is the digit asked for and each column a style: the condition fixed, the rest of the freedom sampled.

::: reveal
::: keypoint
And the source says the quiet part: ==$y$ can be the desired property, and $x$ the corresponding design== — with the warning that a requested $y$ is not a measured one.
:::
:::
:::
::: col
::: figure cvae-svhn | 480
Samples from a CVAE trained on SVHN: row = requested digit. {p}(source deck, Part 1 p. 14)
:::
:::
:::

### G3 — ask the inverse map for a score
{sub: “Model Inversion Networks for Model-Based Optimization” · Kumar & Levine · NeurIPS 2020}

::: paper
- Why it is here | Act 1's stochastic inverse as an offline-MBO method: learn $x=f^{-1}(y,z)$, ask for a high $y$.
- What it is | A Berkeley paper from Levine's group, who also wrote Lecture 5's COMs and Design-Bench.
- Why it matters | It showed the forward arg-max is often no design at all (next slide); Design-Bench's inverse baseline.
:::

::: cols
::: col Training — *which $y$ to learn on?*
Accuracy at high $y$ matters most, but the best few points alone are too noisy. So reweight:

$$w_i=\frac{p(y_i)}{p_D(y_i)},\qquad p(y)\propto \frac{N_y}{N_y+K}\,e^{\,y-y^*}$$

Up-weight high scores — ==provided enough data share that score==.
:::
::: col.accent Querying — *how far past the data to ask?*
An **optimisation over $(y,z)$**: the largest $y$ that an independently trained forward model still confirms:

$$\tilde y,\tilde z = \argmax_{y,z}\ f_\theta\big(f^{-1}_\theta(y,z)\big)$$

$$\text{s.t.}\ \ \big\|y - f_\theta(f^{-1}_\theta(y,z))\big\|^2 \le \epsilon_1,\quad p(z)\ge\epsilon_2$$
:::
:::

::: keypoint
Even the inverse route keeps a forward model — as a ==consistency check on how far to ask==, Lecture 1's trust region in a new costume.
:::

::: note
$N_y$ is the number of points with score $y$; $y^*$ the best score in $D$. The weight comes from a bias–variance bound (Backup 5). Source alignment: Part 2 pp. 17–24.
:::

### An inverse map returns designs; the forward map's arg-max did not
::: figure mins-thick-three | 1000
"The thickest 3 that is still recognisable": MIN and its ablations (left) against the forward map's arg-max (F), and the scores. {p}(Kumar & Levine, 2020)
:::

::: keypoint
On two of these tasks the forward map's answer is ==not a wrong design but no design at all== — an array of pixels that is not a digit. Lecture 5's failure, reported as a table entry: *Invalid*.
:::

::: note
Source alignment: Part 2 pp. 25–28; the full table, including faces and controllers, is the appendix slide "What MINs does on real design problems".
:::

### How far past the data can you ask?
::: widget condition-shift {"seed":11}
The same two hundred designs and oracle, driven by the bar $\gamma$ alone. Raise it and the samples move toward the good region, then ==thin out and decay==. The red marker is Lecture 5's answer on the identical problem.
:::

::: keypoint
A requested score beyond the data is ==extrapolation moved from $x$ to $y$==.
An exact conditional puts no mass where the prior has none.
Learned generators have tails, so over-asking still produces poor or invalid designs.
:::

::: note
Mean true value of the samples: $2.13$ at $\gamma=2.00$, $2.550$ at $2.65$ (best, above the dataset's $2.523$), then $2.537$, $2.427$, $2.163$ at $2.80$, $3.00$, $3.80$ — while the effective sample count falls from $3{,}750$ to $1.5$. Gradient ascent on the same oracle returns a design it rates $4.18$ and the world rates $-0.14$.
:::

### Classifier-free guidance — push a conditional model toward its condition
{sub: “Classifier-Free Diffusion Guidance” · Ho & Salimans · NeurIPS 2021 workshop}

::: paper
- Why it is here | The sampler of DDOM and GTG, and the line between G3 and G4: no separate performance model.
- What it is | A short Google paper: one diffusion model, trained with and without the condition.
- Why it matters | It is how text-to-image models follow a prompt — GLIDE, DALL·E 2, Imagen, Stable Diffusion.
:::

Train **one** diffusion model with the condition and without it — drop $y$ at random — and combine its two noise predictions at sampling:

$$\hat\epsilon=(1+w)\,\epsilon_\theta(x_t,t,y)-w\,\epsilon_\theta(x_t,t)$$

::: cols
::: col What it amounts to
Adding $(1+w)\,\nabla\log p_t(y\mid x_t)$ for an **implicit** classifier, $p(y\mid x)\propto p(x\mid y)/p(x)$. The strength $w$ trades diversity for agreement with the condition.
:::
::: col.accent Why it is G3, not G4
There is ==no separate model of performance==: the only signal is the labels the model was trained on. Its risk is G3's — asking for a $y$ the data cannot vouch for.
:::
:::

::: note
The derivation is the appendix slide "Backup — guidance, with and without a classifier". Classifier guidance — the G4 form — comes after the tilt.
:::

### DDOM — a diffusion model as the inverse map
{sub: “Diffusion Models for Black-Box Optimization” · Krishnamoorthy, Mashkaria & Grover · ICML 2023}

::: paper
- Why it is here | A diffusion model keeps every mode of Act 1's one-to-many inverse, where one answer would average them.
- What it is | A UCLA paper that brought diffusion models to offline MBO — with no forward surrogate at all.
- Why it matters | It matched the best forward methods on Design-Bench; GTG and RGD measure themselves against it.
:::

::: flow
- **Reweight** | MINs' weights: favour high scores with enough support
- **Train** | a conditional diffusion model of $x$ given $y$, dropping $y$ at random
- !**Generate** | condition on the dataset's best $y$, with strong classifier-free guidance
:::

::: figure ddom-modes | 1000
A three-mode toy problem: the reverse trajectory splits into all three modes; the samples' mean value climbs to the optimum. {p}(Krishnamoorthy et al., 2023)
:::

::: keypoint
The one-to-many inverse, represented properly, and no surrogate anywhere. It asks only for the best label it has seen — whether samples exceed it is for the evaluation to say.
:::

::: note
Source alignment: Part 2 pp. 30–34. Benchmark numbers (rank 2.8 against COMs' 3.7 on six Design-Bench tasks) are on the appendix slide.
:::

### GTG — ask for an improvement, not a point
{sub: “Guided Trajectory Generation with Diffusion Models for Offline Model-based Optimization” · Yun, Yun, Lee & Park · NeurIPS 2024 · our lab}

::: paper
- Why it is here | Our lab's G3 method, with a richer condition: a path of **improvement**, not a point.
- What it is | An offline-MBO paper: a diffusion model of trajectories toward higher scores, built from the data.
- Why it matters | It beat strong baselines on Design-Bench and its practical variants, with a proxy that only **filters**.
:::

::: flow
- **Build** | synthetic trajectories through the data toward higher scores, with a locality bias
- **Train** | a diffusion model that generates whole trajectories, conditioned on their score
- !**Sample** | classifier-free guidance toward a high score, with a context taken from the data filled in; a proxy keeps the best final designs
:::

::: cols
::: col The condition
A trajectory carries a **direction** — from where the data are toward where they are not. Its steps are steps of improvement, not time and not denoising steps.
:::
::: col.accent The proxy
It only **filters** the final candidates; it never steers the sampler. Still G3.
:::
:::

::: note
From the paper: the model is trained on $\log p_\theta(\tau\mid y(\tau))$ with $y(\tau)$ the sum of the trajectory's scores; at sampling, "inpainting the C context data points of the trajectory with $\tau_{\text{ctx}}$, a subtrajectory sampled from $D_{\text{traj}}$", with guidance weight $\omega=1.2$; "we select top-Q samples in terms of the predicted score from the proxy".
:::

### Wind-farm layouts — condition, measure, repeat
{sub: “Wind Farm Layout Optimization with Diffusion Models” · Shin, Yun, Yun, Woo, Lim & Park · KDD 2025 · our lab}

::: paper
- Why it is here | G3 so far was scored on benchmarks; here it places turbines on a real site.
- What it is | An applied paper from our lab: a conditional diffusion model of layouts, repaired and evaluated each round.
- Why it matters | More annual energy than state-of-the-art layout methods across wind scenarios — beyond the benchmarks.
:::

::: flow | | | loop: add the measured layouts
- **Train** | a conditional diffusion model of layouts, with a graph-network denoiser
- **Sample** | at high annual energy production, for the wind scenario at hand
- **Repair** | local search fixes layouts that break the site's constraints
- !**Evaluate** | score the new layouts
:::

::: keypoint
G3 on a real design problem — with ==Lecture 4's loop closed==: every round is measured and added to the data.
Not strictly offline: the condition asks, the evaluation answers.
:::

### What asking for a score buys, and what it costs
::: cols c3
::: col Assumption added
The generator **generalises to the score you ask for** — usually the best in the data, or beyond it.
:::
::: col.accent What it solves
Many modes and diverse candidates from one model. MINs searches over $(y,z)$ through the generator and a forward model; DDOM generates without a separate forward surrogate.
:::
::: col.red What it leaves
Asking past the data is extrapolation in $y$. MINs bounds it with a forward model and an optimisation over $(y,z)$; DDOM asks only for the best label seen; the wind-farm loop measures every round.
:::
:::

### A KL-regularised view of candidate distributions
The best average estimate $\hat f$ that stays close to the generator $p$.

This KL is turned around — averaged over the search $q$, not the data: it charges $q$ wherever $q$ goes and $p$ does not, so ==$q$ must stay where the generator lives==.

$$q^\star=\argmax_{q\,\ll\,p}\ \E_q\big[\hat f(x)\big]-\frac1\beta\,D_{\mathrm{KL}}(q\,\|\,p)\qquad\Longrightarrow\qquad \hl{q^\star(x)=\frac{p(x)\,e^{\beta\hat f(x)}}{Z_\beta}}\quad (\beta>0,\ Z_\beta<\infty)$$

::: reveal
**Derivation.** $\;\E_q[\hat f]-\tfrac1\beta D_{\mathrm{KL}}(q\|p)=\tfrac1\beta\,\E_q\Big[\log\frac{p\,e^{\beta\hat f}}{q}\Big]=\tfrac1\beta\big[\log Z_\beta-D_{\mathrm{KL}}(q\,\|\,q^\star)\big]$, largest — uniquely — at $q=q^\star$. $\;\blacksquare$
:::

::: reveal
::: cols
::: col The two ends of $\beta$
$\beta\to0$: $q^\star$ is the generator itself. As $\beta$ grows, $q^\star$ concentrates — under suitable conditions — near the maximisers of $\hat f$ on the generator's support. That is a statement about the **target distribution**, not about what a search algorithm returns.
:::
::: col.accent What it regularises
==Where we search, not what we believe==: Lecture 5's COMs changed the predictor; this KL limits how far the candidate distribution moves from the generator.
:::
:::
:::

::: keypoint
For this optimisation problem the exponential tilt is ==the exact optimum==. Next: which methods it helps to read — and which it does not.
:::

### How the KL view relates to the methods
::: table center
| method | relation to $q^\star\propto p\,e^{\beta\hat f}$ |
|---|---|
| CbAS (G2) | its target is exactly $q^\star$ with $\hat f=\log P(S\mid x)$ and $\beta=1$ — fitted with the other KL direction |
| guidance (G3, G4) | each noise level's score is that of a tilted $p_t$; the full run need not sample the final tilted distribution, even with exact scores |
| DiBO {p}(ICML 2025, our lab) | the tilt **is** the method: high-dimensional BO that samples $p\cdot e^{\beta\,\mathrm{UCB}}$ with a fine-tuned diffusion model — online, Lecture 4 |
| MINs, GFlowNet, BootGen | **not this problem**: a constrained query over $(y,z)$; a reward-proportional sampler with no generator prior; rank weights and bootstrapping |
:::

::: keypoint
A useful lens for some methods, not a common objective for all. And deriving $q^\star$ exactly does not mean a sampler draws from it exactly. Tilting by a conservative or pessimistic estimate combines this view with Lecture 5.
:::

### Too hard a tilt, and Lecture 5 returns
::: widget kl-tilt {"try":"Drag β","tryAt":"bar"}
Lecture 5's fifteen designs and hidden $f$; the generator is a smoothed copy of the data with a thin tail. Drag β; press → to tilt by Lecture 5's pessimistic $\mu-2\sigma$ instead.
:::

::: keypoint
The KL is ==an average, not a leash==: it does not bound how far any one design moves. Where the generator has a thin tail and the estimate is wrong, a hard tilt moves the mass there.
:::

::: note
By the surrogate: average true value $1.52$ at $\beta=0$ (the data's average), $1.90$ at $\beta=2$, $1.49$ at $\beta=3$ when the mode jumps to $x=10$, $0.15$ at $\beta=5$. By $\mu-2\sigma$: $2.00$ at $\beta=2$ and $2.43$ at $\beta=8$ — the best design in the data — with under $1\%$ of the mass past $x=6$ at every $\beta$; the price is that it cannot go past the data either. The generator: a Gaussian kernel density of the designs (bandwidth $0.5$) with $0.5\%$ of its mass spread uniformly.
:::

### G4 — use performance information to steer the sampler
{sub: classifier guidance · “Diffusion Models Beat GANs on Image Synthesis” · Dhariwal & Nichol · NeurIPS 2021}

::: paper
- Why it is here | G4's mechanism: a **separate** model steers each denoising step — in design, Lecture 5's surrogate.
- What it is | An OpenAI paper: a better diffusion network, steered by a classifier trained on noisy images.
- Why it matters | Diffusion beat GANs on ImageNet for the first time; guidance became the standard steering dial.
:::

**Classifier guidance** — Bayes' rule for density scores, with a classifier $p_\phi$ trained on noisy inputs:

$$\nabla_{x_t}\log p_t(x_t\mid y)=\nabla_{x_t}\log p_t(x_t)+\nabla_{x_t}\log p_\phi(y\mid x_t)$$

::: cols wide-r
::: col
**With a regression surrogate**, define the candidate distribution at each noise level directly, $q_t(x)\propto p_t(x)\,e^{s\hat f_t(x)}$, so that

$$\nabla\log q_t=\underbrace{\nabla\log p_t}_{\text{the generator's pull}}+\;s\,\underbrace{\nabla\hat f_t}_{\text{the surrogate's push}}$$

::: reveal
::: keypoint
This **direct** form is ==gradient ascent on the surrogate, interleaved with denoising== — Lecture 5's optimiser inside the sampler.
:::
:::
:::
::: col
::: figure guidance-scale | 420
Classifier guidance on one class, scale 1 (left) and 10 (right). {p}(Dhariwal & Nichol, 2021)
:::
:::
:::

::: note
"Density scores" are gradients of log-densities, not performance scores; the classifier's term is scaled by $s$. $\nabla\log q_t$ is a score at each noise level — not a guarantee that the whole denoising run samples the final tilted distribution. Source alignment: Part 1 pp. 38–39 (controllable generation; the paper's Figure 3, FID 33.0 at scale 1 and 12.0 at scale 10). The surrogate $\hat f_t$ must be trained on noisy designs $x_t$. Defining $q_t$ directly avoids treating $e^{\hat f}$ as a normalised $p(y\mid x)$. Even with exact scores, the guided run need not sample the final tilted distribution (Bradley & Nakkiran, 2024). G4 in general: performance information modifies the sampling process — by a gradient on the sample (classifier or energy guidance) or by setting the guidance strength (RGD).
:::

### Too much guidance leaves the valid set
::: widget manifold-search {"mode":"g4","try":"Drag s","tryAt":"bar"}
The thin-curve problem of Session 1, now sampled with direct guidance. Drag $s$: on the valid samples prediction and truth stay close — ==the failure here is validity==: the surrogate's gradient off the curve, where it has no data, pulls samples out.
:::

::: note
Numbers behind the picture (150 samples; averages over the **valid** samples only, predicted / true): $s=0$: 87% valid, $0.68/0.68$ — the data's; $s=1$: 83%, $0.91/0.90$; $s=1.5$: 74%, $0.97/0.96$; $s=2$: 63%, $1.00/0.99$; $s=3$: 37%, $0.95/0.98$; $s=4$: 19%, $0.83/0.98$. In this example the surrogate is accurate on the curve near the data; what grows with $s$ is the share of samples that are not designs. The sampler stands in for a diffusion model: annealed Langevin dynamics on a kernel density of the data, whose noise-conditional score is exact, plus $s\nabla\hat f$.
:::

### RGD — give the proxy one knob
{sub: “Robust Guided Diffusion for Offline Black-Box Optimization” · Chen, Beckham, Liu, Liu & Pal · TMLR 2024}

::: paper
- Why it is here | G4's second mechanism: performance information sets the guidance **strength**, not the sample.
- What it is | An offline-MBO paper: proxy-free diffusion of the DDOM kind, with a proxy given one knob.
- Why it matters | State-of-the-art results on Design-Bench tasks: limiting an unreliable model can pay off.
:::

::: cols
::: col Proxy-enhanced sampling
Sample with **classifier-free** guidance — no proxy gradient on $x$ — and let the proxy choose only the guidance **strength** $\omega$, adjusted so the denoised sample scores higher.
:::
::: col.accent Diffusion-based proxy refinement
Refine the proxy toward the diffusion model's own $p(y\mid x)$, so that the proxy and the generator agree where the proxy would otherwise over-promise.
:::
:::

::: keypoint
G4's second mechanism. Lecture 5 says the proxy is unreliable off the data.
RGD ==shrinks what it controls== — one scalar per step instead of every coordinate of $x$ — and corrects it with the generator.
That reduces the exposure; it does not make the proxy right.
:::

::: note
The strength update is the paper's Eq. 8: $\omega$ is optimised by gradient ascent on the proxy's score of the predicted clean sample. It builds on proxy-free conditional diffusion of the DDOM kind. RGD reports state-of-the-art results across Design-Bench tasks.
:::

### Discrete designs — guided discrete diffusion
::: cols
::: col NOS / LaMBO-2 {p}(Gruver et al., NeurIPS 2023)
::: paper
- Why it is here | G4 where a design has no gradient: protein sequences are discrete, so NOS guides the denoiser's **continuous hidden states**.
- What it is | A paper from NYU and Genentech's Prescient Design: guided discrete diffusion, run inside LaMBO-2 — a Bayesian-optimisation loop with laboratory rounds.
- Why it matters | Guided generation tested in the wet lab: antibody designs were expressed and measured for binding. An application, not offline MBO.
:::
:::
::: col.accent Road-network layouts {p}(Yun et al., WSDM 2026 · our lab)
::: paper
- Why it is here | G4 on a graph, in our lab's own design problem: a city's road layout is a discrete structure.
- What it is | A **guided discrete diffusion** model that generates urban road-network layouts for a given traffic pattern.
- Why it matters | It carries guidance from vectors and sequences to city-scale networks — the same intervention point, on a new kind of design.
:::
:::
:::

::: keypoint
G4 travels to sequences and graphs: the same intervention point, wherever there is a continuous place to put the gradient.
:::

### What steering the sampler buys, and what it costs
::: cols c3
::: col Assumption added
The performance information is right where the sampler goes — a gradient at every noise level, or a proxy's ranking for the strength.
:::
::: col.accent What it solves
One trained generator, any objective at sampling time, and a dial for how hard to push.
:::
::: col.red What it leaves
Exploitation and invalid samples that grow with the strength. Limiting the proxy (RGD) or guiding by a pessimistic estimate (Lecture 5) can reduce the exposure; neither removes it, and both depend on their own estimates.
:::
:::

### Check — which intervention point?
{q: 4}

::: quiz DDOM samples a conditional diffusion model with classifier-free guidance at the dataset's best score. RGD lets a proxy choose the guidance strength. Which statement is right?
- Both are G4, because both use guidance
- =DDOM is G3 — no surrogate, only its training labels; RGD adds a G4 element, restricted to one scalar
- RGD is more exposed to surrogate exploitation than plain classifier guidance
- DDOM extrapolates safely because a diffusion model has no tails
Classifier-free guidance strengthens a condition the model learned from labels — a G3 intervention. G4 means a separate model of performance steers the sampler; RGD lets the proxy set only the strength $\omega$, far less than a gradient on every coordinate of $x$. DDOM's samples still need evaluation: strong guidance toward the best label it has seen can still leave the data.
:::

## Closing
{short: CLOSING}

Four places for a performance signal to get in — and Lecture 5's tools in each.

### Four interventions, side by side
::: table center
|   | **G1 · coordinates** | **G2 · distribution** | **G3 · condition** | **G4 · sampler** |
|---|---|---|---|---|
| in depth | latent search | CbAS | MINs, DDOM | classifier guidance, RGD |
| the signal enters | the search over codes | the refit's weights | the requested $y$ | the sampling process |
| plausibility from | the decoder | the prior ratio | the generator | the generator's pull |
| what it leaves | invalid decodes; an exploitable predictor | follows the success model's errors | extrapolation in $y$ | invalid samples and exploitation that grow with strength |
| Lecture 5's tool there | conservative latent predictor (LCOMs) | pessimistic $P(S\mid x)$ | a forward check (MINs), or measure | a limited proxy (RGD), or pessimistic guidance |
| our lab | — | BootGen · Genetic GFN | GTG · wind farms | road networks |
:::

::: keypoint
Not rivals: a method can combine intervention points — BootGen is G2 and G3, RGD is G3 with a G4 knob.
==The KL view== connects several of them — a lens, not their common objective.
:::

### Performance, validity, reliability — the two lectures together
Lecture 5 closed on these three questions; here is where each lecture stands.

::: cols c3
::: col Performance
Is the design good? — *the objective, in both lectures*
:::
::: col.accent Validity
Is it possible at all? — ==this lecture==: plausibility from the generator; feasibility from a decoder that enforces it, or a check
:::
::: col Reliability
Can the prediction be trusted? — ==Lecture 5==: conservatism, uncertainty, knowledge — wherever a surrogate enters
:::
:::

::: keypoint
==Generate to stay plausible, score with care, measure to settle==: a generator proposes, a conservative or uncertainty-aware model ranks, and only an evaluation decides.
BootGen selects with a proxy and is evaluated afterwards.
The wind-farm loop adds evaluations to the data while it optimises.
:::

### Diffusion Policy — generate a sequence of actions
{sub: “Diffusion Policy: Visuomotor Policy Learning via Action Diffusion” · Chi et al. · RSS 2023}

::: paper
- Why it is here | The bridge to the rest of the course: the same diffusion model, generating **actions**, not a design.
- What it is | A robotics paper (Columbia, Toyota Research Institute, MIT), trained on demonstrations.
- Why it matters | 46.9% better on average than the prior state of the art on twelve tasks; now a standard policy class.
:::

Replace a static design with an **action sequence**, conditioned on recent observations. Execute a few, observe again, generate anew.

::: figure diffusion-policy-loop | 900
The observation-conditioned generate-and-execute loop. Denoising steps happen inside one decision; they are not physical time steps.
:::

::: keypoint
A sequence keeps different demonstrated ways around an obstacle as different **modes**. This is **imitation**, not reward-based RL: the objective is the demonstrator's actions. Executing a little and re-planning anticipates **feedback and MPC** (Lectures 9–11). [Paper](https://arxiv.org/abs/2303.04137)
:::

::: note
Chi, Feng, Du, Xu, Cousineau, Burchfiel & Song. Trained with the diffusion noise-prediction loss on demonstrations. The 46.9% is the paper's average improvement over the prior state of the art across 12 tasks from four benchmarks.
:::

### Where we are — a performance model and a generator
::: table center
|   | **Lecture 5** | **Lecture 6** |
|---|---|---|
| the model | a performance model $\hat f(x)$ | a generator $p(x)$ or $p(x\mid y)$, plus a performance model |
| the decision | search $\hat f$ — carefully | search, refit, condition or steer the generator |
| what it secures | grounds for trusting a prediction | plausible, diverse candidates |
:::

::: reveal
::: cols
::: col A model of how good — *value*
Lectures 7–8 learn how good each decision is, $Q(s,a)$, and act by maximising it — and meet Lecture 5's hazard: the policy exploits $Q$ where $Q$ is wrong.
:::
::: col.accent A model of what to propose — *policy*
Lecture 10 learns a distribution over actions, $\pi_\theta(a\mid s)$, and samples it. A comparison worth keeping, not the same algorithm: the two are usually trained together.
:::
:::
:::

::: reveal
::: small
So far: static design choices, experiments that buy information, and inference over time (Lectures 3–4). From Lecture 7 on, the current action changes the next state and the future reward — and the decision is optimised over that sequence.
:::
:::

### A generator decides where to look; a performance model decides what to trust.
{layout: standout}

The signal can enter at four places — and wherever a surrogate enters, Lecture 5 comes with it. A measurement still has the last word.

### Questions?
{layout: standout}

Two things to carry out of here. **A generator buys plausibility, not evidence** — the performance signal still has to be trusted, as in Lecture 5. And **ask where the signal enters** — coordinates, distribution, condition or sampler — because that is where it can be exploited.

## Appendix — backup slides
{short: APPENDIX}

Complete derivations and reported numbers, kept out of the narrative.

### Reading guide — Session 1 papers: generative models and G1

| paper | why we read it | how it connects |
|---|---|---|
| **VAE** · Kingma & Welling, ICLR 2014 — *in depth* | a generator with an explicit latent space | the coordinates G1 searches |
| **DDPM** · Ho, Jain & Abbeel, NeurIPS 2020 — *in depth* | the generator behind most current design methods | steered by the two guidance papers |
| **Classifier guidance** · Dhariwal & Nichol, NeurIPS 2021 | a separate model's gradient steers the sampler | the mechanism of G4 |
| **Classifier-free guidance** · Ho & Salimans, NeurIPS 2021 workshop | steering without a separate model | the sampler of G3 |
| **Latent-space search** · Gómez-Bombarelli et al., ACS Cent. Sci. 2018 — *in depth* | G1: search in learned coordinates | also Lecture 4 |
| **JT-VAE** · Jin, Barzilay & Jaakkola, ICML 2018 | validity by construction | fixes G1's decoder |
| **LCOMs** · Qi et al., ICLR 2023 workshop | a conservative surrogate on latent codes | Lecture 5 inside G1 |

### Reading guide, continued — Session 1 papers: G2

| paper | why we read it | how it connects |
|---|---|---|
| **CbAS** · Brookes, Park & Listgarten, ICML 2019 — *in depth* | G2: refit the generator toward success | the tilt with $\beta=1$ |
| **GFlowNet** · Bengio et al., NeurIPS 2021 | sample in proportion to reward | needs reward calls or a proxy |
| **BootGen** · Kim, Berto, Ahn & Park, NeurIPS 2023 — *our lab* | refit on its own proxy-scored samples | G2 and G3 |
| **Genetic-guided GFlowNets** · Kim, Kim, Choi & Park, NeurIPS 2024 — *our lab* | GFlowNet training under a small oracle budget | online, not offline |

### Reading guide, continued — Session 2 papers: condition and sampler

| paper | why we read it | how it connects |
|---|---|---|
| **MINs** · Kumar & Levine, NeurIPS 2020 — *in depth* | G3: an inverse map asked for a score | keeps a forward model as a check |
| **DDOM** · Krishnamoorthy, Mashkaria & Grover, ICML 2023 — *in depth* | G3 with diffusion: every mode kept | MINs' weights, no proxy |
| **GTG** · Yun, Yun, Lee & Park, NeurIPS 2024 — *our lab* | condition a trajectory, not a point | the proxy only filters |
| **Wind-farm layouts** · Shin et al., KDD 2025 — *our lab* | G3 on a real design problem | measured every round |
| **DiBO** · Yun, Om, Lee, Yun & Park, ICML 2025 — *our lab* | the tilted target $p\,e^{\beta\,\mathrm{UCB}}$, sampled by a fine-tuned diffusion model | online; Lecture 4; a GFlowNet-family loss |
| **RGD** · Chen et al., TMLR 2024 — *in depth* | G4 with the proxy limited to one knob | classifier-free guidance + a proxy |
| **NOS / LaMBO-2** · Gruver et al., NeurIPS 2023 | guidance for discrete sequences | a BO application |
| **Road-network layouts** · Yun et al., WSDM 2026 — *our lab* | guided discrete diffusion for city design | G4 on graphs |

::: note
The lab's papers were checked against the KAIST SILAB list and the proceedings pages (2026-10-11); descriptions follow their abstracts.
:::

### Backup 1 — why a KL weight of 1 fills the prior exactly
{fill: top}

The *Turning the dial* widget, as a formula. The ELBO itself is derived twice in Act 2 (views 1 and 2); this slide only explains the dial.

With a linear-Gaussian decoder $p_\theta(x\mid z)=\mathcal N(Wz+b,\sigma^2 I)$, the encoder that maximises the ELBO with weight $\beta$ on the KL is

$$\mu = (W^\top W + \beta\sigma^2 I)^{-1}W^\top(x-b),\qquad \Sigma = \beta\sigma^2(W^\top W+\beta\sigma^2 I)^{-1}$$

Along an eigendirection of $W^\top W$ with eigenvalue $w$, the codes' total variance — spread of the means plus each code's blur — is

$$\mathrm{Var}(\mu)+\Sigma = \frac{w^2+\sigma^2 w+\beta\sigma^2 w+\beta^2\sigma^4}{(w+\beta\sigma^2)^2},\qquad \text{whose difference from } 1 \text{ is } \frac{\sigma^2 w(1-\beta)}{(w+\beta\sigma^2)^2}$$

::: keypoint
Zero at $\beta=1$: the standard ELBO makes the codes fill the prior exactly, so prior draws land where codes are.
:::

### Backup — one VAE calculation
For one latent coordinate, $q(z\mid x)=\mathcal N(1,0.5^2)$ and $p(z)=\mathcal N(0,1)$:

$$\mathrm{KL}(q\|p)=\tfrac12\left(\mu^2+\sigma^2-1-\log\sigma^2\right)=\tfrac12(1+0.25-1-\log0.25)\approx0.818.$$

With an expected reconstruction log-likelihood of $-2$, the ELBO is $-2-0.818=\mathbf{-2.818}$. One reparameterised draw with $\epsilon=-1$: $z=1+0.5(-1)=0.5$.

::: keypoint
Reconstruction rewards explaining the input.
KL charges for moving the code distribution away from the prior.
:::

### Backup 2 — the four families of generative models
{fill: top}

::: table center
| family | training | latent | trade-off |
|---|---|---|---|
| VAE | maximise the ELBO | explicit, $\sim\mathcal{N}(0,I)$ | stable; samples can be blurry |
| GAN | adversarial, generator vs. discriminator | implicit | sharp; unstable, mode collapse |
| Normalising flow | exact maximum likelihood | invertible, same dimension | exact density; architectural constraints |
| Diffusion | denoising score matching | fixed noise schedule | high quality; slow sampling |
:::

Any of the four can serve as the prior $p(x)$ of a generative design pipeline. The training objective of an inverse map can likewise be any divergence: $L_p(D)=\E_{y\sim p(y)}\big[\mathrm{Div}(p_D(x\mid y),p_{f^{-1}_\theta}(x\mid y))\big]$ — KL gives maximum likelihood, JS a GAN objective {p}(Part 2 p. 21).

### Backup 2b — diffusion as a hierarchical VAE
{fill: top}

**Forward and reverse.** $q(x_{1:T}\mid x_0)=\prod_{t=1}^T q(x_t\mid x_{t-1})$ and $p_\theta(x_{0:T}) = p(x_T)\prod_{t=1}^T p_\theta(x_{t-1}\mid x_t)$, and the same ELBO argument gives

$$\mathcal{L}(\theta) = \E_q\Big[\underbrace{\mathrm{KL}\big(q(x_T\mid x_0)\|p_\theta(x_T)\big)}_{L_T} + \sum_{t=2}^T\underbrace{\mathrm{KL}\big(q(x_{t-1}\mid x_t,x_0)\|p_\theta(x_{t-1}\mid x_t)\big)}_{L_{t-1}} - \underbrace{\log p_\theta(x_0\mid x_1)}_{-L_0}\Big]$$

**Why Gaussian.** The kernel is chosen so that $q(x_t\mid x_0)$ and $q(x_{t-1}\mid x_t,x_0)$ have closed forms and $q(x_T\mid x_0)$ forgets $x_0$. With $q(x_t\mid x_{t-1})=\mathcal{N}(\sqrt{1-\beta_t}x_{t-1},\beta_t I)$, $\alpha_t = 1-\beta_t$ and $\bar\alpha_t=\prod_{i\le t}\alpha_i$:

$$q(x_t\mid x_0) = \mathcal{N}\big(\sqrt{\bar\alpha_t}\,x_0,\ (1-\bar\alpha_t)I\big),\qquad q(x_{t-1}\mid x_t,x_0)=\mathcal{N}\big(\tilde\mu_t(x_t,x_0),\ \tilde\beta_t I\big)$$

$$\tilde\mu_t = \frac{\sqrt{\bar\alpha_{t-1}}\beta_t}{1-\bar\alpha_t}x_0 + \frac{\sqrt{\alpha_t}(1-\bar\alpha_{t-1})}{1-\bar\alpha_t}x_t,\qquad \tilde\beta_t = \frac{1-\bar\alpha_{t-1}}{1-\bar\alpha_t}\beta_t,\qquad \bar\alpha_t\to 0 \Rightarrow q_\infty=\mathcal{N}(0,I)$$

### Backup 3 — the DDPM objective collapses to one squared error
{fill: top}

Both $q(x_{t-1}\mid x_t,x_0)$ and $p_\theta(x_{t-1}\mid x_t)$ are Gaussian, so $L_{t-1}$ is an analytic KL:

$$L_{t-1} = \E_q\Big[\tfrac{1}{2\sigma_t^2}\big\|\tilde\mu_t(x_t,x_0)-\mu_\theta(x_t,t)\big\|^2\Big] + C$$

Substituting $x_t=\sqrt{\bar\alpha_t}x_0+\sqrt{1-\bar\alpha_t}\,\epsilon$ suggests predicting the *noise*:

$$\mu_\theta \;\overset{\text{def}}{=}\; \frac{1}{\sqrt{\alpha_t}}\Big(x_t - \frac{\beta_t}{\sqrt{1-\bar\alpha_t}}\,\epsilon_\theta(x_t,t)\Big) \;\Longrightarrow\; L_{t-1}=\E_{x_0,\epsilon}\Big[\tfrac{\beta_t^2}{2\sigma_t^2\alpha_t(1-\bar\alpha_t)}\big\|\epsilon-\epsilon_\theta(x_t,t)\big\|^2\Big]$$

Dropping the weight — which the authors found works better — gives $\hl{\mathcal{L}_{\text{simple}} = \E_{t,x_0,\epsilon}\big[\|\epsilon - \epsilon_\theta(\sqrt{\bar\alpha_t}x_0+\sqrt{1-\bar\alpha_t}\epsilon,\ t)\|^2\big]}$, a reweighted objective rather than the exact bound.

::: small
**One training step, in numbers.** $x_0=2$, $\bar\alpha_t=0.64$, $\epsilon=1$ give $x_t=0.8(2)+0.6(1)=2.2$; predicting $\hat\epsilon=0.5$ costs $(1-0.5)^2=0.25$. {p}(Ho, Jain & Abbeel, 2020)
:::

### Backup 4 — score matching, Langevin dynamics, and the SDE that unifies them
{fill: top}

**The estimator.** Fit $s_\theta(x)\approx\nabla_x\log p(x)$ by the Fisher divergence, computable as $\E_{p}\big[\mathrm{tr}(\nabla_x s_\theta) + \tfrac12\|s_\theta\|^2\big]$ {p}(Hyvärinen, 2005) or in the denoising form $\tfrac12\E_{q_\sigma(\tilde x\mid x)p(x)}\big[\|\nabla_{\tilde x}\log q_\sigma(\tilde x\mid x)-s_\theta(\tilde x)\|^2\big]$ {p}(Vincent, 2011). For an energy model the partition function drops out of the score: $\nabla_x\log p_\theta(x)=-\nabla_x\varepsilon_\theta(x)$.

**The blind spot.** The Fisher divergence weights the error by the data density, $\E_{p(x)}\|\nabla_x\log p(x)-s_\theta(x)\|^2=\int p(x)\,\|\cdot\|^2dx$, so the score is learned badly where data is thin — a learned object is unconstrained where there is no evidence, as Lecture 5's surrogate was. **Its cure.** Train on data perturbed at $L$ noise scales, $p_{\sigma_i}(x)=\int p(y)\mathcal{N}(x;y,\sigma_i^2 I)dy$, with a noise-conditional model $s_\theta(x,i)$ and loss $\sum_i \sigma_i^2\,\E_{p_{\sigma_i}}\|\nabla\log p_{\sigma_i}-s_\theta(x,i)\|^2$; sample by **annealed Langevin dynamics**, $\tilde x_t = \tilde x_{t-1} + \tfrac{\epsilon}{2}\nabla_x\log p(\tilde x_{t-1}) + \sqrt{\epsilon}\,z_t$, for $i = L,\dots,1$.

**The continuous limit.** The perturbation becomes $dx = f(x,t)dt + g(t)dw$, whose reverse is

$$dx = \big[f(x,t) - g^2(t)\,\hl{\nabla_x\log p_t(x)}\big]dt + g(t)\,d\bar w$$

NCSN is the variance-exploding SDE; DDPM the variance-preserving one, $dx=-\tfrac12\beta(t)x\,dt+\sqrt{\beta(t)}\,dw$.

### Backup — guidance, with and without a classifier
{fill: top}

Train $\epsilon_\theta(x_t,t,y)$ and, by dropping $y$ at random, $\epsilon_\theta(x_t,t)$. Since $\epsilon_\theta\approx-\sqrt{1-\bar\alpha_t}\,\nabla\log p_t$, the guided prediction $\hat\epsilon=(1+w)\epsilon_\theta(x_t,t,y)-w\,\epsilon_\theta(x_t,t)$ corresponds to the score

$$(1+w)\nabla\log p_t(x_t\mid y)-w\nabla\log p_t(x_t)=\nabla\log p_t(x_t)+(1+w)\,\nabla\log p_t(y\mid x_t),$$

because $p(y\mid x)\propto p(x\mid y)/p(x)$. Classifier guidance adds $s\,\nabla\log p_\phi(y\mid x_t)$ with a separately trained $p_\phi$ instead. In both, each noise level's guided score is the score of a tilted distribution, $p_t(x)\,p_t(y\mid x)^{\text{strength}}$ — but the full sampler need not draw from the final tilted distribution, even with exact scores: Bradley & Nakkiran (2024, "Classifier-Free Guidance is a Predictor-Corrector") show that CFG with DDPM or DDIM does not generate the $\gamma$-powered distribution.

### Backup — the inverse map, as the source motivates it
{fill: top}
$$f_\theta : \mathcal{X}\to\mathcal{Y} \qquad\Longrightarrow\qquad \hl{f^{-1}_\theta : \mathcal{Y}\to\mathcal{X}}$$

The forward model answers *"given $x$, what is $y$?"*. We wanted *"given the $y$ I need, which $x$ delivers it?"* — a map whose **input is one number**.

::: reveal
::: cols
::: col What the reversal fixes
The inverse map is not asked to search $\mathcal{X}$; it is asked to *emit* a point of it.
:::
::: col.red What it does not fix
The **output** is still high-dimensional and still confined to a thin valid set. Reversing the arrow moves the difficulty; it does not remove it.
:::
:::
:::

::: note
Source alignment: Part 2 p. 18 (MINs' motivation): "we can exploit various techniques from deep generative models to model high-dimensional data distribution" — the inverse map's output head has to be a generative model.
:::

### Backup 5 — MINs and CbAS, in full
{fill: top}

::: cols
::: col MINs — train, then query
**Train.** $L_p(D) = \E_{y\sim p(y)}\big[\mathrm{Div}(p_D(x\mid y), p_{f^{-1}_\theta}(x\mid y))\big]$, reweighted by $w_i = p(y)/p_D(y)$, $p(y)\propto \frac{N_y}{N_y+K}e^{y-y^*}$.

The weight comes from a bias–variance bound with three terms: *variance from thin data* $\E_y[1/N_y]$, *distribution shift* $d_2(p\|p_D)/|D|$, and *bias from the target* $D_{\mathrm{TV}}(p^*,p)^2$.

**Query.** $x = f^{-1}_\theta(z, y_{\text{target}})$, with $y_{\text{target}}$ from Approx-Infer. Ablation on CIFAR-10 (uniform): MIN $77.12$, without Approx-Infer $76.31$, without reweighting $74.87$ — ==both components matter==.
:::
::: col.accent CbAS — the adaptive ladder
```
θ⁰ ← fit the prior p(x|θ⁰) to D
q ← p(·|θ⁰)
repeat:
  x₁..x_M ~ q                     ← propose
  γ ← min(target, Q-th pct of
          f̂(x₁..x_M))             ← relax
  wᵢ ← p(xᵢ|θ⁰)/q(xᵢ) · P(y≥γ|xᵢ)
  q ← weighted MLE on {xᵢ, wᵢ}    ← refit
```

The ratio uses the *previous* iterate as the proposal; finite variance additionally needs the proposal to cover the target. $\gamma$ rises only as fast as the model can follow — condition (B).
:::
:::

::: small
**The subtlety both share.** Querying above the observed range is extrapolation — Lecture 5's hazard, moved from $x$ into $y$. Practical systems temper $y_{\text{target}}$ and re-rank samples with a (conservative) forward model: ==generate to stay valid, score to select==.
:::

### What MINs does on real design problems
{sub: MINs, three task families · note the forward-map column}

::: table center
| task | dimension | dataset avg | dataset best | forward map | **MIN** |
|---|---|---|---|---|---|
| MNIST, thickest recognisable "3" | 1,024 | 149.0 | 265.0 | *Invalid* | **276.3** |
| MNIST, variant (b) | 1,024 | 149.0 | 163.0 | *Invalid* | **234.3** |
| Faces, youngest ($\ge 15$) | 12,288 | 38.7 | $-15.0$ | *Invalid* | **$-12.2$** |
| Faces, youngest ($\ge 25$) | 12,288 | 41.5 | $-25.0$ | *Invalid* | **$-23.9$** |
| HopperController reward | 3,843 | 442.9 | 1915.5 | 93.1 | **1960.1** |
| Pendulum reward | 1,537 | 14.7 | 344.5 | 3.4 | **1000.0** |
:::

::: small
The forward map is Lecture 5's naive route: on four of six tasks its answer is ==not a design at all==; on Hopper it scores $93$ where the dataset already held $1915$. MIN beats the dataset's best on five of six. {p}(Kumar & Levine, 2020)
:::

### DDOM and BootGen — the reported numbers
{sub: as the source deck reports them}

::: cols
::: col DDOM {p}(ICML 2023)
Reweighting ablation (normalised): D'Kitty $0.926\to0.930$, Ant $0.888\to0.960$, TFBind8 $0.957\to0.971$ — improvements are task dependent.

Six Design-Bench tasks, budget 256: best mean rank $2.8$, against COMs' $3.7$ and gradient ascent's $3.5$.
:::
::: col.accent BootGen {p}(NeurIPS 2023, our lab)
Six biological-sequence tasks, 100th percentile: average $0.895$ against the dataset's $0.365$ and the best baseline's $0.792$ — with the highest ==diversity and novelty== of the methods compared.
:::
:::

::: keypoint
Benchmark results on the papers' tasks, not guarantees for a new dataset: every returned design still needs evaluation.
:::

### BootGen — generated labels do not become new measurements
{sub: rank weighting and iterative augmentation}

::: figure bootgen-loop | 820
Step A, rank-weighted training of a score-conditioned generator; Step B, bootstrapping: sample at a high score, label with a proxy, keep the top $K$, retrain. {p}(Kim et al., 2023, Fig. 2.1)
:::

Weights $\propto[k|D|+\operatorname{rank}(y,D)]^{-1}$, normalised: higher-ranked designs weigh more, and the scale of $y$ does not matter.

::: keypoint
The training pool grows without new oracle evaluations: it gains **proxy-labelled synthetic samples, not new performance measurements**, so proxy errors can be reinforced as the loop repeats. This is pseudo-labelling and augmentation — not resampling the data to build a bootstrap ensemble.
:::
