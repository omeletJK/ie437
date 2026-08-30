# Ch 5 · source extract — *Data-Driven Design Optimization (Surrogate Model Based)*

Inventory of the two source decks, page by page, mapped onto the four acts of
`tex/Lecture05_Surrogate_Design_Optimization.tex`.

```
P1 = "5. Data-Driven Design Optimization (Surrogate Model Based)  part 1.pdf"   25 pages
P2 = "5. Data-Driven Design Optimization (Surrogate Model Based) - Part2.pdf"   59 pages
```

Act keys: **H** = handoff · **A1** naive approach · **A2** why it fails ·
**A3** conservative objective models · **A4** other ways to be robust · **C** closing · **X** appendix.

---

## 1 · Part 1 (25 pages) — the online menu, then the offline problem

| p | act | what is on it |
|---|---|---|
| 1 | — | title |
| 2 | — | divider: *Introduction* |
| 3 | H | **Motivation.** Expensive black-box function over a high-dimensional space. Drug discovery, materials design, hardware manufacturing. `find x* = argmax_{x∈X} f(x) with a given budget of evaluations T`. Typical approaches: genetic algorithms, evolutionary strategies, Bayesian optimisation, policy gradient. |
| 4 | H | **Gradient ascent.** `x_{t+1} = x_t − η ∇_{x_t} f(x_t)` *(the source writes a minus sign throughout; it means ascent)*. Recap box, Lecture 1's convex optimality criterion: `x*` optimal iff feasible and `∇f(x)ᵀ(y − x) ≥ 0 ∀y ∈ D`. |
| **5** | **H / A1** | **The online loop — the one the offline setting deletes a line from.** No gradient of the true black box, so train a differentiable proxy `f_θ(x)` and ascend *that*. Algorithm box:<br>`For t = 1..T−1:`<br>  `Train f_θ(x) on D_t = {(x_i,y_i)}_{i=1}^t`<br>  `Choose x_{t+1} = x_t − ∇_x f_θ(x_t) and evaluate y_{t+1} = f(x_{t+1})`<br>  `Update D_{t+1} ← D_t ∪ {(x_{t+1}, y_{t+1})}`<br>**This is the slide to quote and then strike a line out of.** |
| 6 | H | **Genetic algorithms.** Flowchart figure: create initial population → evaluate fitness → apply selection → crossover/mutation → termination criterion? → END. |
| 7 | H | GA steps 1–2. Population `X^C = [x_1^C,…,x_N^C]`; fitness `f^C = [f_1^C,…,f_N^C]`. |
| 8 | H | GA step 3, selection. Parents `X^P = [x_1^P,…,x_E^P]`; `X^{P'}, f^{P'} = Selection(X^P, f^P, X^C, f^C)`. Most GAs use **truncation selection** — top-E. |
| 9 | H | GA step 4. Bit-string figure: two 13-bit parents, crossover producing two children, then one bit flipped (highlighted) per child = mutation. |
| 10 | H | **CMA-ES.** Stochastic method for real-parameter non-convex optimisation; also widely used to optimise the BO acquisition `x^{(n+1)} = argmax EI(x) ≜ E[max{0, f − f^max} | D]`. Figure: 6 generations of a 2-D contour landscape, black sample dots and an orange dashed covariance ellipse that walks to the optimum and contracts. |
| 11 | H | CMA-ES steps 1–2. Diagonal Gaussian `N(·| m_0, σ_0² I)`; sample `x_1..x_n ~ N(m_t, σ_t² I)`, get fitness `f_1..f_n`. |
| 12 | H | CMA-ES step 3. `m_{t+1} = (1−α_t) m_t + α_t Σ_j w_{t,j} x_j`; `σ_{t+1} = (1−α_t) σ_t + α_t sqrt( Σ_j w_{t,j}(x_j − m_t)² )`; `w_{t,j} = 1/E if rank(j) ≤ E else 0`. |
| 13 | H | **Bayesian optimisation recap** — the four-box loop figure: *Learning phase* update `f(x) ~ N(μ(x,θ;D_t), σ²(x,θ;D_t))` → *Decision-making phase* `x_{t+1} = argmax_x A_t(x; θ_t; D_t)` → *Execute & observe* `y_{t+1}` → *Append data* `D_{t+1} = D_t ∪ {(x_{t+1}, y_{t+1})}`, with the two coloured return arrows. |
| 14 | H | **BO worked figure.** GP posterior over `f` with three observations `y¹,y²,y³` (red ±σ band, dashed red mean, black true curve, ✱ at the true max ≈ 1.1); `EI(x)` panel below; green arrow "Next sample". `μ(x|D) = kᵀ(K+σ_ε²I)⁻¹y_{1:n}`, `σ²(x|D) = k(x,x) − kᵀ(K+σ_ε²I)⁻¹k`. **Numbers: `x⁽⁴⁾ = 0.70`, `y⁽⁴⁾ = f(x⁽⁴⁾)+ε = 1.76`, `ε ~ N(0, 0.01²)`.** |
| 15 | H | **Policy gradient for black-box optimisation.** Objective `max_θ E_{x~π_θ(x)}[f(x)]`; `∇_θ E_{x~π_θ}[f(x)] = E_{x~π_θ}[∇_θ log π_θ(x) f(x)]`. *(Seed of Lecture 10.)* |
| 16 | H | Proof, log-derivative trick: `∇_θ ∫ π_θ f dx = ∫ ∇_θπ_θ · f dx = ∫ π_θ ∇_θ log π_θ · f dx`. |
| 17 | H | Policy-gradient algorithm box: sample `x_1^r..x_n^r ~ π_θ`, evaluate, `θ_{r+1} ← θ_r + (1/n) Σ_i ∇_θ log π_{θ_r}(x_i^r)·f(x_i^r)`. |
| **18** | **H** | **The offline motivation, and the chapter's problem statement.** Figure (Design-Bench, Trabucco et al.): *Real Data* `{(x_i,y_i)}_{i=0}^N` → *Offline MBO* (blue trapezoid) → *Design* `arg max_x f̂_θ(x)` → superconductors (YBa₂Cu₃O₇), DNA sequences, proteins, molecules, robot morphologies. A red feedback arrow from *Design* back to *Real Data* is struck through with a **🚫 "No Additional Interactions"**. Text: evaluation of the objective is *expensive* and *prohibitive* (molecule design, automated aircraft design); a data-driven model given a fixed, offline dataset is crucial.<br>`find x* = argmax_x f(x) with **only** a fixed dataset D = {(x₁,f(x₁)),…,(x_N,f(x_N))}` |
| **19** | **H** | **The two routes.** 1 · *Surrogate model-based:* approximate `f(x)` from collected data, choose the query maximising the surrogate. 2 · *Generative model-based:* learn an inverse function `f⁻¹(y)`, choose the query generated by the inverse given a desired output. "Today we'll focus on surrogate model-based approaches." **← the shared Ch 5 / Ch 6 opening.** |
| 20 | A1 | **The naïve approach.** `Step 1. θ* = argmin_θ (1/N) Σ_{i=1}^N (f_θ(x_i) − f(x_i))², D = {(x_i,f(x_i))}_{i=1}^N`; `Step 2. choose x* = argmax_x f_{θ*}(x)`. |
| 21 | A2 | Step 1 boxed in **red**. **Problem 1.** "Trained model is only valid near the training distribution, which leads to a large error in out-of-distribution input values. However, **we must extrapolate from the training distribution**!!" |
| **22** | **A2** | **FIGURE — in-distribution / out-of-distribution.** A sigmoid-shaped true `f` drawn solid black across the in-distribution band, with **three red ×** data points on it. Vertical **red dashed** lines bound *In Distribution*, **blue dashed** lines bound *Out-of Distribution*. From the right edge of the data a **fan of grey dashed curves** leaves in every direction — sharply up, gently up, flat, down, sharply down. A single **blue ×** floats in the OOD region marking the true value there. Legend: red × = data point in offline dataset; blue × = data point *not* in offline dataset. **The point: the dataset does not determine `f` off the data — every one of those curves fits it equally well.** |
| 23 | A2 | Step 2 boxed in **blue**. **Problem 2.** "Searching an input that maximizes a proxy model can be done by gradient ascent. However, since **only a small manifold of input space is valid**, gradient ascent can easily fall into invalid input especially in high-dimensional space." |
| **24** | **A2** | **FIGURE — the valid manifold.** A large pale-blue disc = *total input space*; a much smaller red disc inside it, up and left of centre = *valid input space*; **eight red ×** data points scattered inside the red disc; a **light green ×** on the red disc's lower boundary = *initial point for gradient descent*; **three green curves** arcing out of the red disc, down and away into the blue, ending in **dark green ×** = *destinations of gradient descent*. A callout arrow from the red disc opens onto a 3×3 grid of drawn molecular structures — i.e. the red disc is "the molecules that are actually molecules". |
| 25 | A2→A3 | **Key challenges.** Design-optimisation algorithms must (1) *reason about uncertainty and out-of-distribution input values*; (2) *search possible input values while staying on the manifold of valid input space*. "How can we cope with such challenges?" |

---

## 2 · Part 2 (59 pages) — the three methods

### 2.1 Recap, pp. 1–11 (repeats P1 18–25)

| p | act | content |
|---|---|---|
| 1 | — | title |
| 2 | — | divider: *Recent Papers* |
| 3–4 | H | Offline MBO motivation figure + problem statement + the two routes — **identical to P1 18–19** |
| 5–10 | A1/A2 | naïve approach, Problem 1, the OOD fan figure, Problem 2, the valid-manifold disc figure — **identical to P1 20–24** |
| 11 | A2 | key challenges — identical to P1 25 |
| 12 | — | divider: **1. NEMO · 2. COMs · 3. RoMA** |

### 2.2 NEMO, pp. 13–25  → **Act 4**

| p | content |
|---|---|
| 13 | Paper: **Fu & Levine, "Offline Model-Based Optimization via Normalized Maximum Likelihood Estimation", ICLR 2021.** |
| 14 | **Motivation.** Principal challenge: input space high-dimensional but with a *narrow manifold of valid inputs* (protein design, natural images). Algorithms must reason about uncertainty and OOD values, "since **a naive optimizer can easily exploit an estimated model to return adversarial inputs**". NEMO handles uncertainty with the **Normalized Maximum Likelihood** estimator; standard NML is intractable, so they give a tractable approximation that scales to high-capacity nets. |
| 15 | **Problem setting.** As usual. In the paper: a *stochastic* ground truth `f(y|x)`; the goal is `x* = argmax_x E_{y ~ f(y|x)}[y]`. |
| **16** | **CNML.** "The distribution closest to the MLE, **assuming the test label y is chosen adversarially**."<br>`p_NML(y|x) = argmin_h max_{y'} ( log p(y'|x; θ̂_{D∪(x,y')}) − log h(y'|x) )`<br>where `θ̂_{D∪(x,y)} = argmax_θ (1/(N+1)) Σ_{(x,y)∈D∪(x,y)} log p(y|x,θ)`.<br>Minimax solution: `p_NML(y|x) = p(y|x; θ̂_{D∪(x,y)}) / ∫ p(y'|x; θ̂_{D∪(x,y')}) dy'`. `p_NML` is a **conservative** estimate of `q(y|x)`. |
| **17** | **FIGURE 1 of the paper — the construction, in three panels.** *Left:* we wish to estimate `p(y|x)` at a query `x`, marked by a vertical red line; the fitted curve with its band stops short of it. *Middle:* four small panels, each computing the MLE **assuming we knew the true label y**, for a different candidate `y` — in each the curve bends up or down to reach a red × sitting at a different height on the red line. *Right:* normalise across all those MLE models to produce `p_NML` — at the query the band is now **very wide**. Caption: "the final prediction will likely exhibit large amounts of uncertainty on queries `x` far from the dataset, **because it is easier for the individual MLE estimates to overfit to these outliers**." <br>**This is the mechanism the tex dropped, and it is the cleanest definition of epistemic uncertainty in the whole lecture: uncertainty = how easily the model could have been talked into any answer.** |
| 18 | **Intractability.** The denominator requires *integrating over* and *training an MLE for* every possible `y`. Problem 1: retraining a deep net for every `y` is impossible. Problem 2: integrating over all `y` is impossible. |
| 19 | **Solution 2 — quantisation.** Discretise `y`: `∫_y p(y|x, θ̂_{D∪(x,y)}) dy ≈ B Σ_{k=1}^K p(⌊y_k⌋ | x, θ̂_{D∪(x,⌊y_k⌋)})`. |
| **20** | **Solution 1 — amortisation. Algorithm 1 (NEMO).** Input: model class `{f_θ}`, dataset `D = (x_{1:N}, y_{1:N})`, bins `K`, evaluation function `g(y)`, learning rates `α_θ, α_x`. Initialise `K` models `θ_0^{1:K}` and an iterate `x_0`; quantise `y_{1:N}` into `K` bins.<br>`for t = 1..T:`<br>  `for k = 1..K:  D' ← D ∪ (x_t, ⌊y_k⌋);  θ_{t+1}^k ← θ_t^k + α_θ ∇_{θ^k} LogLikelihood(θ_t^k, D')`<br>  `p̂_NML(y|x_t) ∝ p(y | x_t, θ_t^y) / Σ_k p(⌊y_k⌋ | x_t, θ_t^k)`<br>  `x_{t+1} ← x_t + α_x ∇_x E_{y ~ p̂_NML(y|x)}[ g(y) ]`<br>i.e. **learn the NML distribution incrementally *while* optimising the input** rather than rebuilding it at every iterate. |
| 21 | **Architecture.** Quantisation makes the landscape flat, killing gradients; NEMO uses a **discretised logistic** head: map `x` to the mean parameter `μ` of a logistic distribution; output one-minus-the-CDF at regular intervals of `1/K`; predicted `y` = mean over the output vector. Figure: `x` → two hidden layers → `μ` → four sigmoid panels → output `[1.0, 0.1, 0.0, 0.0]`. **Proposition 4.1 (discretised logistic gradients):** (1) if `x ∈ argmax_x μ(x)` then `x ∈ argmax_x y_mean(x)`; (2) for any `x`, `⟨∇_x μ(x), ∇_x y_mean(x)⟩ ≥ 0`. |
| **22** | **EXPERIMENT — uncertainty estimation, and the caveat about ensembles.** Three panels: the data (a sine-ish band of blue dots with a visible gap), then the **NML** density and the **bootstrapped Ensemble** density over the same domain, each with a red box drawn around the same OOD region. NML is smeared and grey there; the ensemble is still a **thin dark line**. Caption: "In regions outside of the support, the NML outputs a highly uncertain estimate. **However, the ensemble still outputs highly confident estimates, even though they may be wrong.**"<br>**Restore this: the obvious answer — "just use an ensemble" — is the one the lecture explicitly refutes.** |
| 23 | **Design-Bench tasks.** Superconductor 81-dim continuous, N = 21,263 · GFP 238-dim categorical(20), N = 5,000 · MoleculeActivity 1,024-dim binary, N = 4,216 · HopperController 5,126-dim continuous, N = 3,200 · AntMorphology 60-dim continuous, N = 25,009 · DKittyMorphology 56-dim continuous, N = 25,009. **This is what "high-dimensional" means concretely.** |
| 24 | **Baselines.** 1 Forward (single forward model) · 2 Ensemble (bootstrapped) · 3 GP-BO (GP + EI) · 4 MINs (model inversion networks) · 5 CbAS (conditioning by adaptive sampling) · 6 Autofocus (autofocused oracles). |
| **25** | **NEMO results.** Produce a batch of **128** candidate designs, report 50th and 100th percentile.<br>*100th percentile* — Superconductor: NEMO **127.0 ± 7.29**, GP-BO 89.72, Forward 89.64, Ensemble 88.01, MINs 80.23, Autofoc 77.07, CbAS 72.17 · **Dataset Max 73.90**. GFP: NEMO 3.359, CbAS **3.408**, Dataset Max 3.152. MoleculeActivity: NEMO **6.682**, GP-BO 6.745, Dataset Max 6.558. HopperController: NEMO **2130.1 ± 506.9**, Ensemble 1877.0, Forward 1050.8 · Dataset Max 1361.6. AntMorphology: NEMO **393.7**, Forward 399.9 · Dataset Max 108.5. DKitty: NEMO **431.6 ± 47.8** · Dataset Max 215.9.<br>*50th percentile* — Superconductor: GP-BO 72.42, NEMO 66.41, Forward 54.06, Autofoc 31.57. HopperController: MINs 520.4, NEMO 390.2, Forward 185.0, Autofoc 116.4. |

### 2.3 COMs, pp. 26–41  → **Act 3**

| p | content |
|---|---|
| **26** | Paper: **Trabucco, Kumar, Geng, Levine, "Conservative Objective Models for Effective Offline Model-Based Optimization", ICML 2021 (PMLR 139).** Figure: the loss as three drawn terms — `‖y − y_label‖²` over a net fed `x` from the world (*Supervised Regression*) **+** `y ↑` (green up-arrow) over the same net fed `x` from the world **+** `y ↓` (red down-arrow) over the same net fed `x` from *Adversarial Example Generation*. |
| 27 | **Motivation.** Naïve approaches **overestimate** the objective at out-of-distribution values, so the optimiser returns an invalid, low-objective design. COMs: learn a model that **estimates a lower bound** of the ground truth. Structurally COMs is just a proxy model trained with a conservative objective → simple to implement, ordinary optimisers still apply. |
| **28** | **FIGURE — the chapter's picture, in two panels.** *Left:* the OOD fan again — data ×s on the true curve in-distribution, and a spray of grey dashed extrapolations leaving the boundary, one of them (darker) climbing toward the blue × . *Right:* the same setup with a **single dashed curve that leaves the data region and bends downward**, running well below the blue ×. A black arrow labels it: **"Learns a lower bound."** |
| 29 | Problem setting (repeat). |
| **30** | **Finding the adversaries.** "What we want: train a model that does **not overestimate** output values of adversarial inputs. Problem: how to find such adversarial inputs? Solution: the idea from generating adversarial inputs." **Panda figure (Goodfellow, Shlens & Szegedy 2014):** "panda" 57.7% confidence `+ .007 ×` "nematode" 8.2% `=` "gibbon" **99.3%** confidence.<br>`μ(x) = { Σ_{t=0} δ_{x_t} : x_{t+1} = x_t + η · ∇_{x_t} f̂_θ(x_t),  x_0 ~ D }` |
| 31 | **First attempt:** `L(θ) = ½ E_{(x,y)~D}[(f̂_θ(x) − y)²] + α · E_{x~μ(x)}[f̂_θ(x)]`. Problem: **underestimation** — it drags the whole surface down. Solution: regularise by *maximising* values under the data distribution. **Final objective:**<br>`L(θ) = ½ E_{(x,y)~D}[(f̂_θ(x) − y)²] + α · ( E_{x~μ(x)}[f̂_θ(x)] − E_{x~D}[f̂_θ(x)] )` |
| 32 | Same, with the MSE term boxed: "Standard MSE loss". |
| 33 | Same, with the two conservative terms boxed: `E_{x~μ(x)}[f̂_θ(x)]` → "**Prevent overestimation of out-of-distribution values**"; `−E_{x~D}[f̂_θ(x)]` → "**Prevent underestimation of in-distribution values**". |
| **34** | **Similarity with CQL — the source deck makes the Lecture-12 rhyme itself.** "Similar to COMs, CQL also tries to learn a conservative Q-function such that the expected value of a policy under this Q-function lower-bounds its true value."<br>COMs: `θ* ← argmin_θ ½E_{(x,y)~D}[(f̂_θ(x) − y)²] + α (E_{x~μ(x)}[f̂_θ(x)] − E_{x~D}[f̂_θ(x)])`<br>CQL: `Q* ← argmin_Q ½E_{(s,a,s')~D}[(Q − B^{π̂_k}Q̂^k)²] + α E_{s~D}( log Σ_a exp Q(s,a) − E_{a~π̂_β}[Q(s,a)] )`<br>**Same three-part shape: fit the data, push down what the optimiser would chase, hold up what the data actually contains.** |
| **35** | **Proposition 1 (conservative training lower-bounds the true function).** Under regularity assumptions, for all `x ∈ D, x'' ∈ X`, the model at iteration `k+1` satisfies<br>`f̂_θ^{k+1}(x'') := max{ f̂_θ^{k+1}(x) − L̂‖x''−x‖₂ ,  f̃_θ^{k+1}(x'') − ηα E_{x~D̄, x'~μ}[G_f^k(x'',x')] + ηα E_{x~D̄, x'~D̄}[G_f^k(x'',x')] }`<br>where `f̃` is the iterate that would have resulted *without* conservative training. Hence if `α` is large enough, the asymptotic `f̂_θ = lim_k f̂_θ^k` on the inputs `x_T` found by the optimiser satisfies (boxed in red in the deck):<br>**`E_{x_0~D, x_T~μ(x_T|x_0)}[ f̂_θ(x_T) ] ≤ E_{x_0~D, x_T~μ(x_T|x_0)}[ f(x_T) ]`** |
| **36** | **Optimising COMs, and why it is the easy one.** MINs: choosing which `y` to feed the inversion map is complicated. NEMO: an iterative procedure is required. **COMs: a naïve gradient-ascent optimiser suffices** — start from the best design in the training set and take a few ascent steps.<br>**Algorithm 1 (training):** initialise `f̂_θ`; pick `η, α`. For `i = 1..training_steps`: sample `(x_0,y) ~ D`; find `x_T(x_0)` by ascent `x_{t+1} = x_t + η∇_x f̂_θ(x)|_{x=x_t}`, set `μ(x) = Σ_{x_0∈D} δ_{x = x_T(x_0)}`; minimise `L(θ;α) = E_{x_0~D}(f̂_θ(x_0) − y)² − αE_{x_0}[f̂_θ(x_0)] + αE_{μ(x)}[f̂_θ(x)]`; `θ ← θ − λ∇_θ L`.<br>**Algorithm 2 (finding x\*):** initialise at the optimum in `D`, `x̃ = argmax_{(x,y)∈D} y`; ascend `x_{t+1} = x_t + η∇_x L_opt(x)|_{x=x_t}` with `L_opt(x) := f̂*_θ(x)`; return `x* = x_T`. |
| **37** | **Practical: choosing α is hard → make it a constraint.**<br>`θ* ← argmin_θ ½E_{(x,y)~D}[(f̂_θ(x) − y)²]  s.t.  E_{x~μ(x)}[f̂_θ(x)] − E_{x~D}[f̂_θ(x)] ≤ τ`<br>"Even though we have a new hyperparameter `τ`, it is easy to handle since changing `τ` does not harm loss value." "Converting a training objective into a constrained optimisation problem is prevalent (**ex. TRPO**)." **← the trust-region rhyme, Ch 1 → Ch 10.** |
| 38 | **Benchmark, 100th percentile.** Dataset Max: GFP 3.152, Molecule 6.558, Supercond 73.90, Hopper 1361.6, Ant 108.5, Dkitty 215.9, **Avg† 1.000**. CbAS 1.324 · Autofocus 1.286 · NEMO 1.687 · MINs 1.304 · **COMs 1.589** · Grad. Ascent 1.237. COMs by task: GFP 3.305±0.024, Molecule **6.876±0.128**, Supercond 110.0±6.804, Hopper **2395.7±561.7**, Ant 378.8±10.01, Dkitty 341.4±28.47. |
| **39** | **ABLATION — COMs vs naïve gradient ascent, HopperController.** *x*: gradient-ascent steps 0→50. *y*: average return. **Gradient Ascent (blue) shoots up to ≈2800 by step 7, then collapses and oscillates back down to ≈1500–2000** as it keeps walking away from the data. **COMs (orange) climbs slowly and monotonically to ≈2700 by step 45.** Annotation: "evaluate the effect of this term" (pointing at the τ constraint).<br>**This is the empirical proof of Act 2 and Act 3 in one chart: the naïve optimiser peaks early and then degrades, precisely because further ascent means further out of distribution.** |
| 40 | **ABLATION — sensitivity to τ**, HopperController, τ ∈ {0.1, 0.2, 0.5, 1.0, 2.0}. τ = 1.0 and 2.0 reach ≈2500–3000 fastest; τ = 0.5 is close behind; **τ = 0.2 is slow and τ = 0.1 stays flat at ≈800 — too conservative to move at all.** "Important hyperparameter of the model, should be robust." |
| 41 | **ABLATION — evaluation budget N.** Return vs number of candidates selected (0→128). **COMs jumps to ≈2400 within the first ~25 candidates and plateaus; gradient ascent climbs in steps and needs the entire 128 budget to reach ≈2100.** "COMs are resilient to N." |

### 2.4 RoMA, pp. 42–53  → **Act 4**

| p | content |
|---|---|
| 42 | Paper: **Yu, Ahn, Song, Shin, "RoMA: Robust Model Adaptation for Offline Model-based Optimization", NeurIPS 2021** (KAIST / MBZUAI / BioMap). Pipeline figure: offline dataset `D` → *Gaussian noise* → stack of nets `θ̃ ∈ B(θ)` (*weight perturbation*) → **Step 1 pre-training** → `f(x;θ)` → *model adaptation* → `f(x;θ_t)` (yellow net) → *solution update* `x^{(t+1)}` back into the loop → **Step 2 model adaptation and solution update.** |
| 43 | **Motivation.** Same principal challenge; the extra clause: naïve approaches overestimate OOD and pick invalid designs **"because of the non-smooth nature of DNN"**. Three approaches listed together: NEMO (uncertainty via NML) · COMs (lower bound) · **RoMA (a local smoothness prior at adversarial samples)**. |
| **44** | **FIGURE — illustration of the local smoothness prior.** *Left, "Without local smoothness prior":* a **jagged** solid surrogate that passes through the eight data ×s but oscillates violently between them; it carries a tall spurious spike, and a **pink star = "Wrong solution"** sits on it, while the true function (grey dashed, a smooth bump) peaks elsewhere and lower. *Right, "With local smoothness prior":* the surrogate is smooth and lies on top of the dashed truth; a **green star = "Accurate solution"** sits at the true peak.<br>**The cleanest 1-D statement of the mechanism: overestimation off the data is what non-smoothness buys you.** |
| 45 | Problem setting (repeat). |
| 46 | **Overall procedure — two stages.** *Step 1.* Train the proxy on `D` to approximate the true objective **with Gaussian smoothing of inputs under worst-case weight perturbations**. *Step 2.* For `t = 0..T−1`, update the solution `x^{(t)}` **after adapting the proxy's output to be locally smooth at `x^{(t)}`**. |
| **47** | **Stage 1 loss.** "Training a DNN-based proxy model without regularization is brittle."<br>`L(θ) = max_{θ̃ ∈ B(θ)} E_{(x,y)~D, δ~N(0,σ)} [ ( f(x + δ; θ̃) − y )² ]`, `B(θ) = { θ̃ : ‖θ_l − θ̃_l‖_F ≤ ε‖θ_l‖_F ∀ l ∈ {1..L} }`.<br>From *Adversarial Weight Perturbation Helps Robust Generalization*, NeurIPS 2020 — "a double-perturbation mechanism that injects the worst-case input and weight perturbations". |
| 48 | Same; the inner maximisation is solved by **projected gradient descent**. |
| **49** | **Stage 2 — iterative proxy adaptation.** With the pre-trained model one may just run naïve ascent, "however, since smoothing to the proxy model is applied only for the training set, gradient-based updates may be erroneous for out-of-distribution values." Hence adapt the model to be smooth *at the current solution*:<br>`θ_t = argmin_{θ̃ ∈ B(θ)} [ ‖∇_x f(x; θ̃)‖₂ |_{x = x^{(t)}} + α ( f(x^{(t)}; θ̃) − f(x^{(t)}; θ_{t−1}) )² ]`<br>first term **for local smoothness**, second **prevents the model parameters going too far**. |
| **50** | **FIGURE — adaptation in action.** *Left:* a wiggly surrogate over the in-distribution and OOD bands; a **green × intermediate solution** with a green **"Gradient Ascent"** arrow climbing toward a spurious OOD peak; **blue ×** marks the true (much lower) OOD values. *Right:* after **"Model Adaptation"** (green box) the surrogate has been **locally flattened around the current solution**, so the green × now sits on a smooth shelf beside the blue ×; the old wiggly curve is drawn faintly behind. |
| **51** | **Benchmark, 100th percentile, RoMA added.** RoMA: GFP 3.357±0.024, Molecule **6.890±0.122**, Supercond 103.9±5.487, Hopper **2466.5±359.2**, Ant **468.5±12.68**, Dkitty 384.3±51.68, **Avg† 1.705** — the best average. Full column: **RoMA 1.705 · NEMO 1.687 · COMs 1.589 · CbAS 1.324 · MINs 1.304 · Autofocus 1.286 · Grad. Ascent 1.237 · Dataset Max 1.000.** |
| 52 | **ABLATION — ratio of high-scoring solutions.** Score vs percentile (Molecule 100th→95th; Superconductor 100th→50th) with a **dashed line at the dataset max**. RoMA stays above the dataset max further down the percentile range than anything else — on Superconductor it is the only method still above the line at the 60th percentile. "Because of the local smoothing prior, RoMA optimises candidates with a higher ratio." |
| 53 | **ABLATION — components.** Expected return over 500 steps: **RoMA ≈2500 > RoMA w/o adaptation ≈2200 > Gaussian smoothing only ≈1850.** Both halves earn their keep. |

### 2.5 Applications, pp. 54–59  → **closing**

| p | content |
|---|---|
| 54 | divider: *Applications* |
| **55** | **PRIME — "Data-Driven Offline Optimization for Architecting Hardware Accelerators", ICLR 2022.** A conservative surrogate in the COMs shape:<br>`θ* = argmin_θ L(θ) = E_{(x_i,y_i)~D}[(f_θ(x_i) − y_i)²] − α E_{x_i^- ~ Opt(f_θ)}[ f_θ(x_i^-) ]`<br>plus infeasible designs used as extra negatives: `θ* = argmin_θ L(θ) − β E_{x'_i ~ D_infeasible}[ f_θ(x'_i) ]`<br>plus contextual training over application domains: `θ* = argmin_θ E_{k~[K]}[L_k(θ)]`, `L_k(θ) = E[(f_θ(x_i, c_k) − y_i)²] − α E[f_θ(x_i^-, c_k)]`. |
| 56 | **PRIME results (lower latency better).** MobileNetV2 ≈ tie (~310 both); MobileNetEdge+M4 ≈ tie (~355); U-Net + t-RNN Dec: **PRIME ≈ 745 vs simulator-driven ≈ 1080**; same with area ≤ 100 mm²: **PRIME ≈ 515 vs ≈ 860.** |
| **57** | **LCOMs — "Latent Conservative Objective Models for Data-Driven Crystal Structure Prediction", ICLR 2022.** Find the lowest-energy stable crystal structure for a chemical formula. Chemical space is non-Euclidean, so a **CD-VAE auto-encoder** turns a crystal into a vector search space and a conservative surrogate of the energy is optimised **in the latent space**:<br>`θ* = argmin_θ E_{(x,c)~D}[ (E_θ(φ(x,c),c) − E(x,c))² ] − α E_{x^- ~ Opt(E_θ)}[ E_θ(φ(x^-,c), c) ]`, `φ(x,c)` a pre-trained encoder.<br>Figure: MgS lattice → CD-VAE encoder → latent vector → an energy landscape over the latent vector with the *dataset* region bracketed → "minimise energy using conservative optimisation" → decode → lower-energy lattice.<br>**← the explicit bridge to Lecture 6: the generative model supplies the space that the conservative surrogate is then searched over. Forward-and-search and inverse-and-sample are not rivals; the second can be the first's coordinate system.** |
| 58 | **LCOMs results.** Per-formula energy improvement, sorted: **LCOMs mean ≈ 2.25 vs supervised-learning mean ≈ 1.10**; the SL bars collapse to ≈0 across most of the tail while LCOMs stays positive much further. |
| 59 | Questions? / **References.** [1] Trabucco et al., *Design-Bench: Benchmarks for data-driven offline model-based optimization*, arXiv:2202.08450, 2022. [2] Shahriari, Swersky, Wang, Adams, de Freitas, *Taking the Human Out of the Loop: A Review of Bayesian Optimization*, Proc. IEEE 104(1):148–175, 2016. [3] Goodfellow, Shlens, Szegedy, *Explaining and Harnessing Adversarial Examples*, arXiv:1412.6572, 2014. |

---

## 3 · What the tex compressed away, and is worth restoring

1. **The online menu (P1 3–17, 15 pages).** GA, CMA-ES, BO, policy gradient — four ways to solve `argmax f`, *and every one of them needs to call `f`*. The tex opens by asserting the query is gone; the PDF earns it by first showing four methods that cannot live without it. Restore as one handoff slide. (Bonus: the policy-gradient slides here are literally Lecture 10's REINFORCE, written for a one-shot design.)
2. **The online loop with one line struck out (P1 5).** The offline problem is exactly that algorithm box with `evaluate y_{t+1} = f(x_{t+1})` deleted. Best single way to state the handoff.
3. **Two problems, not one (P1 21/23).** The tex fuses them. The PDF separates *Problem 1 — extrapolation error* (the model is only valid near the data, yet we must extrapolate) from *Problem 2 — the narrow valid manifold* (ascent walks off the set of inputs that mean anything). Two different figures, two different cures.
4. **The two Act-2 figures (P1 22, P1 24)** — the OOD fan and the valid-manifold discs. Redraw both.
5. **The COMs lower-bound figure (P2 28)** — the naive fan beside the conservative curve that bends down, labelled "learns a lower bound".
6. **The COMs-vs-gradient-ascent ablation (P2 39).** Naïve ascent peaks at step ~7 and then *collapses*. The strongest empirical evidence in the deck for the chapter's thesis, and the shape a widget should reproduce.
7. **The τ constraint and its ablation (P2 37, 40).** Conservatism is a *dial* — too little and the optimiser escapes, too much (τ = 0.1) and it never leaves the dataset. Also the explicit TRPO analogy.
8. **The NEMO CNML construction (P2 16–17).** Fit the model once for every candidate label, then normalise; uncertainty is *how easily the model could have been talked into any answer*. The tex has "use an NML estimator" and no mechanism.
9. **NML vs bootstrapped ensemble (P2 22).** The obvious cure — an ensemble — stays confident where it is wrong. Refuting the obvious answer is worth a slide and a widget.
10. **Quantisation + the discretised logistic head + Proposition 4.1 (P2 19, 21).** How NEMO is made to run at all.
11. **Proposition 1 (P2 35)** — the actual lower-bound inequality, and **Algorithms 1 and 2** (P2 36), including "start the optimiser from the best design in `D`".
12. **RoMA's mechanism (P2 44, 47, 49, 50).** Non-smoothness *is* the overestimation; the AWP training loss; and the adaptation step that re-smooths at each intermediate solution.
13. **The Design-Bench numbers.** Task dimensions 56 → 5,126 make "high-dimensional" concrete; the average column (RoMA 1.705 · NEMO 1.687 · COMs 1.589 · Grad. Ascent 1.237 · Dataset Max 1.000) settles the act empirically.
14. **The panda's actual numbers** (57.7 % → 99.3 %).
15. **The applications (P2 55–58)**, especially **LCOMs**: a conservative surrogate optimised inside a VAE latent space — the Ch 5 / Ch 6 bridge, drawn by the source deck itself.

## 4 · Figures worth redrawing as widgets

| source | what it shows | verdict |
|---|---|---|
| P1 22 / P2 28-left | the fan of extrapolations that all fit the data | **redraw** — Act 2, paired with the next |
| P1 24 | valid manifold ⊂ total input space; ascent leaves it | **redraw** — Act 2 |
| P2 28-right | the conservative model bending down: "learns a lower bound" | **simulate** — Act 3 |
| P2 39 | naive ascent peaks then collapses; COMs climbs monotonically | **simulate** — build the trace into the Act-2 widget |
| P2 22 | NML wide OOD, ensemble narrow and wrong | **simulate** — Act 4 |
| P2 44 | jagged vs smooth surrogate; wrong vs accurate solution | redraw if space allows |
| P2 17 | CNML: refit for every candidate label, then normalise | describe in prose; three panels is a lot of pixels |
