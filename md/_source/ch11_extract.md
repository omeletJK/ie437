# Ch 11 · Model-Based RL — source extract

**Source deck:** `lecture_slides/10. Model Based Reinforcement Learning.pdf` — 141 pages.
(Numbered 10 because it predates the renumbering; it is Lecture 11.)
**Tex:** `tex/Lecture11_Model_Based_RL.tex` — 15 frames, 4 acts + 3 backups.

The deck is organised as **five internal "MBRL Lectures"**, and the tex's four acts cut across them:

| deck's own division | pages | tex act |
|---|---|---|
| MBRL Lecture 1 · Learning Dynamic Systems | 1–9 | **Act 1** — the spectrum of model use |
| MBRL Lecture 2 · Dynamic Model Fitting and Planning | 10–56 | **Act 2** — planning with a learned model |
| MBRL Lecture 3 · Dynamic Model Fitting and Policy Learning | 57–120 | **Act 4** — the lineages teach each other |
| MBRL Lecture 4 · End-to-End Planning | 121–123 | **Act 3** — differentiable control |
| MBRL Lecture 5 · End-to-End Policy Learning | 124–125 | (horizon; named only) |
| Differentiable MPC deep-dive (second author's deck) | 126–141 | **Act 3** — differentiable control |

So the tex **reorders**: it promotes the differentiable-MPC material (deck pages 121–141) ahead of the
policy-learning material (deck pages 57–120), because differentiable control is the *technique* that
Act 4's reunion then uses. Follow the tex.

**The single most important thing the tex compressed away:** the deck's Act 2 is a four-step
escalation — *Version 1 → 2 → 3 → 4* — each version introduced by naming the failure of the previous
one. The tex reduces all four to one frame ("Planning over a learned model — MPC"). Restore the
escalation; it is the chapter's argument.

**The second:** the deck gives **three** routes from a learned model to a policy (backprop, imitate,
simulate). The tex keeps only the middle one (GPS). Restore all three — they map one-to-one onto the
course's three earlier chapters, which is exactly what makes Act 4 "the reunion".

---

## Page-by-page inventory

### MBRL Lecture 1 — Learning Dynamic Systems (pp. 1–9) → **Act 1**

**p.1** Section divider: "MBRL Lecture 1. Learning Dynamic Systems".

**p.2 — ★ THE ORGANISING FIGURE OF THE WHOLE DECK.** A four-row ladder. Columns:
`Data` → `Dynamic Model` → `{Planning, Policy}`. Rows, top to bottom:

| row | label (verbatim) | Data box | Model box | outputs |
|---|---|---|---|---|
| 1 | **Analytical Optimal Control** | greyed out (no data) | *Analytical Dynamic Model* (blue) | Planning **and** Policy |
| 2 | **2-Stages Model Based RL** — "Model Building + Planning/Control" | green (used) | *Data-Driven Dynamic Model* (blue) | Planning and Policy |
| 3 | **End-to-End Model Based RL** — "Planning/Control using Dynamics as inductive Biases" | green | *Inductive Biases on Dynamics* (pale blue), **passed through**, not fitted separately | Planning and Policy |
| 4 | **Model-Free RL** | green | *Dynamic Model* drawn **in solid black** — i.e. deleted | Policy only |

This is the tex's "spectrum, not a binary" made into a picture, and it is *richer* than the tex's
three-column table, because it separates **planning** from **policy** as two different consumers of
the model. **Redraw it.**

**pp.3–8** The same ladder, walked one highlight at a time — this is a built animation:
- p.3 row 1 lit, caption "**Linear Dynamic Systems and Control**" (= Lecture 9);
- p.4 row 4 lit, caption "**Model Free Reinforcement Learning**" (= Lectures 8 and 10);
- p.5 row 2, `Data → Model` arrow lit: "MBRL Lecture 1" (learn the model);
- p.6 row 2, `Model → Planning` lit: "MBRL Lecture 2";
- p.7 row 2, `Model → Policy` lit: "MBRL Lecture 3";
- p.8 row 3 fully lit: "MBRL Lecture 4".

**p.9 — Inductive Biases for Mathematical Properties.** Pipeline `Data → Feature → Model → Decision`
under a banner "Data-Driven Modeling → Decision Making". Two overlapping ellipses:
*Inductive Biases for Representation learning* (Dimension Reduction · Conditional Independency ·
Relationships) and *Inductive Biases for Constraints Imposing* (Linearity · Convexity · Reversibility ·
Submodularity (set) · Decomposability (set) · Permutation Invariance (set) · Stability (dynamics) ·
Markovian (dynamics)). Intersection lists: ICNNs, INNs, GNN, DeepDMD (Koopman), DeepModular, QMIX,
StableDynamics. Callout box "**Desired Characteristics** — Easy to **solve**, **interpret**,
**analyze**, **generalize**". *This slide is repeated verbatim at p.51 and p.112, so it is load-bearing:
it is the professor's thesis that a learned model should be built to be planned in.* Ties directly
to Lecture 1 (convexity) and Lecture 3 (conditional independence).

---

### MBRL Lecture 2 — Dynamic Model Fitting and Planning (pp. 10–56) → **Act 2**

**p.10** Divider: "MBRL Lecture 2. Dynamic Model Fitting and Planning".

**p.11 — Motivation: what if we knew the transition dynamics?** The RL objective, restated exactly as
Lecture 10 left it:
```
θ* = argmax_θ  E_{τ~p_θ(τ)} [ Σ_t r(s_t, a_t) ]
p_θ(s_1,a_1,…,s_T,a_T) = p(s_1) Π_{t=1..T} π_θ(a_t|s_t) p(s_{t+1}|s_t,a_t)
```
with `p_θ(…)` underlined and named `π_θ(τ)`.

**p.12** Same slide, with `p(s_{t+1}|s_t,a_t)` **highlighted in red**: "What if we know the dynamics of
the environment? Can we utilize this knowledge to optimize the optimum control policy?" — the exact
hinge from Lecture 10 into this chapter.

**p.13 — Two sources of a model.**
- *Often we **do** know the dynamics*: games (Atari, chess, Go); easily modelled systems (navigating
  a car); simulated environments (simulated robots, video games).
- *Often we can **learn** the dynamics*: **system identification** — fit unknown parameters of a
  *known* model; **learning** — fit a general-purpose model to observed transition data.
- Punchline: "Knowing the dynamics is helpful for (1) **planning a sequence of actions** and
  (2) **deriving a policy**." → these are Acts 2 and 4 respectively.

**pp.14–15** The ladder again; p.15 lights row 2's `Data → Model → Planning` path.

**p.16 — ★ THE DISTRIBUTIONAL-SHIFT FIGURE.** Naive approach: learn a model of the target system,
use it for planning/control. "Works for only exceptionally simple cases — only when the constructed
model generalized well over the entire state space." **Figure:** a red curve (*True dynamics*, a
rising-then-falling-then-rising cubic-ish shape) and a straight blue line (*Learned model*) that
agrees with it only over a small cluster of green data points near the origin, then departs
catastrophically. Caption: "The **effect of distributional shift** makes the Naive approach
unsuccessful in many cases." *This is Lecture 5's `surrogate-exploit` figure with time added.*
**Redraw / simulate.**

**p.17 — Overview: model-based RL as a 2-step approach for planning. Four versions:**
1. Model Building + Open Loop Planning
2. Iterative Model Building + Open Loop Planning
3. Iterative Model Building + MPC (+ Model Uncertainty)
4. Iterative Model Building + MPC + Latent Space Model

Reading list on the same page: *PILCO*; *Neural Network Dynamics for Model-Based Deep RL with
Model-Free Fine-Tuning* (Nagabandi); *Deep RL in a Handful of Trials using Probabilistic Dynamics
Models* (PETS); *Optimal Control Via Neural Networks: A Convex Approach* (ICNN); *Learning
Compositional Koopman Operators for Model-Based Control*.

**p.18 — Version 1 algorithm box (verbatim):**
```
1. Run base policy π₀(a_t|s_t) (e.g. random) to collect D = {(s,a,s′)_i}   (Experiencing)
2. Learn dynamics model f(s,a) to minimise Σ_i ‖f(s_i,a_i) − s′_i‖²         (Model Fitting)
3. Plan through f(s,a) to choose actions                                    (Model Based Planning)
4. Execute those actions
```
ends with "**Does it work?**"

**p.19 — "Yes:"** classical system identification uses exactly this. SysID = (1) excite the system and
measure its response, (2) fit **a predefined model** to the measured input/output data. "Particularly
effective if we can hand-engineer a dynamics representation using our **knowledge of physics**, and fit
just a few parameters. Generalizable knowledge is required. If we fit Newton's law, it can be applied
to describe any motion of a rigid body."

**p.20 — Data-driven system identification, block diagram.** `System ẋ = f(x,u)` ⇄ `Controller u = k(y)`,
with `u` (Actuator) and `y` (Sensors) closing the loop. Challenges listed: Nonlinear · Unknown Dynamics ·
High Dimensional (neuroscience, climate, epidemics) · Limited Measurements. "Machine learning can
resolve some of these issues."

**p.21 — Classical system identification, in detail.**
- Linear sysID estimates `A`, `B` in `ẋ = Ax + Bu`. "Once the linear system is identified, **control
  theory can be used to control the system**" ← the explicit bridge back to Lecture 9.
- Model reduction: `ȧ = Ã a + B̃ u`, lower-dimensional state → fast prediction and fast control;
  **Dynamic Mode Decomposition (DMD)**.
- Nonlinear: `ẋ = f(x,u)`; piecewise-linear models; **Koopman operator theory** — a nonlinear system
  can be expressed as a *linear* system in infinite-dimensional measurements.
- Modern ML sysID: deep learning (MLP, RNN, LSTM); **Gaussian process**.

**p.22** Brunton & Kutz, *Data-Driven Science and Engineering* — course reference, 40-video series.

**p.23 — ★ "No:"** the same Version 1 box, answered:
```
p_{π_f}(s_t)  ≠  p_{π_0}(s_t)
```
"Distribution mismatch problem prevents us from determining the optimum action. We can determine the
optimum action using the learned model, but the determined optimum action is only optimum **in the
trained model's perspective**." And: "Distribution mismatch becomes **exacerbated as we use more
expressive model classes**." *The exact counterpart of Lecture 5's "the optimiser is an adversary".*

**p.24 — Version 2** algorithm box: same, plus a loop arrow from step 5 back to step 2:
```
5. Append {(s,a,s′)_j} to dataset D                                          (Collecting Data)
```
"Can we make p_{π_f}(s_t) = p_{π_0}(s_t)? We need to collect data from p_{π_f}(s_t) that describes how
the system actually moves." (This is DAgger for dynamics.)

**p.25 — "What if we make a mistake?"** Figure: a car on a road, with green arrows showing the plan
veering off the lane and out of the top of the frame. Open-loop planning cannot correct.

**p.26 — ★ Version 3: Iterative Model Building + MPC.** Two nested loops now — an outer green loop
"Every N steps" back to step 2 (refit the model), an inner blue loop back to step 3 (re-plan):
```
3. Plan through f(s,a) to choose actions             (Model Based Planning)
4. Execute the FIRST planned action, observe s′      (MPC)
5. Append {(s,a,s′)_j} to D                          (Collecting Data)
```
Figure: two cars overlaid, a small green correction arrow, and the caption in red across the road:
"**REPLANNING HELPS WITH MODEL ERRORS**". Then three bullets, verbatim:
- "The more you replan, the less perfect each individual plan needs to be"
- "Can use shorter horizons"
- "Even random sampling can often work well here!"

**p.27** Title page of *Neural Network Dynamics for Model-Based Deep RL with Model-Free Fine-Tuning*
(Nagabandi, Kahn, Fearing, Levine). Abstract quotes: medium-sized NN models + MPC give "excellent
sample complexity"; hybrid Mb-Mf gives "sample efficiency gains of **3–5×** on swimmer, cheetah, hopper
and ant"; quadruped gait learned from **7e5** timesteps collected with no knowledge of the test task.

**p.28 — the paper's Algorithm 1 and Figure 2, reproduced.** Worth quoting exactly:
```
E(θ) = (1/|D|) Σ_{(s_t,a_t,s_{t+1})∈D} ½ ‖(s_{t+1} − s_t) − f̂_θ(s_t,a_t)‖²          (2)
A_t^(H) = argmax_{A_t^(H)} Σ_{t′=t}^{t+H−1} r(ŝ_{t′}, a_{t′}),
          ŝ_t = s_t,  ŝ_{t′+1} = ŝ_{t′} + f̂_θ(ŝ_{t′}, a_{t′})                        (4)
```
**Note the two design choices worth teaching:** the model predicts the *difference* `s_{t+1} − s_t`,
not the next state; and the planner's rollout is the model *composed with itself* — which is precisely
where error compounds. Figure 2 shows the loop: `D_RAND`/`D_RL` → NN dynamics model `f̂_θ` → MPC
controller (+ goal reward function) → agent → back to the datasets.

**p.29 — ★ THE SAMPLE-EFFICIENCY FIGURE (HalfCheetah).** Cumulative reward vs steps on a log x-axis
from 10³ to 10⁹. Three curves: **Mb** (green, short), **Mf** (blue), **Mb-Mf (ours)** (red).
Annotations under the axis:
- pure model-based reaches ≈ 500–600 reward at ~10⁴–10⁵ steps — "**about 10 minutes real time**";
- model-free needs ~10⁶–10⁸ steps to reach ≈ 4500 — "**about 10 days…**";
- Mb-Mf (red) reaches the dashed 4500 line roughly an order of magnitude earlier than Mf.
**This is the single number that justifies the whole chapter. Use it.**

**p.30 — the flaw in Version 3.** Step 3 highlighted: "What is the issue in this approach?"
- "Only take actions that are believed to give high reward **in expectation** (w.r.t. uncertain dynamics)"
- "This avoids 'exploring' the world, depriving the possibility to choose a better action for higher reward"
- "We need to explore the model → we need to take into account the **model uncertainty**"

**p.31 — ★ THE UNCERTAINTY DECOMPOSITION.** Written out in full:
```
Nature:  Y = f(X) + ε,  ε ~ N(0, σ_s²)
Model:   Ŷ = f̂(X)
E‖Y − f̂(X)‖²  =  E‖Y − f(X)‖²  +  E‖f(X) − f̂(X)‖²
              =  σ_s²          +  σ_m²
              =  systemic noise  +  model uncertainty
```
Figure: scatter in (x₁,x₂,y); after "Training", a shaded manifold with a `?` region and a red ellipse
in the input plane marked "Model uncertainty is high due to the lack of training data".
*This is Lecture 0's aleatoric/epistemic split and Lecture 2's predictive variance, arriving in dynamics.*

**p.32** *Weight Uncertainty in Neural Networks* (Blundell et al., Bayes by Backprop). Point estimation
`w^MLE = argmax log P(D|w)`, `w^MAP = argmax log P(D|w) + log P(w)`, full Bayesian prediction
`P(ŷ|x̂) = E_{P(w|D)}[P(ŷ|x̂,w)]`. *A direct callback to Lecture 2 Act 3.*

**p.33 — ensembles as the cheap posterior.**
```
p(θ|D) ≈ (1/N) Σ_i δ(θ_i)
∫ p(s_{t+1}|s_t,a_t,θ) p(θ|D) dθ  ≈  (1/N) Σ_i p(s_{t+1}|s_t,a_t,θ_i)
```
"How to train? Need to generate 'independent' datasets to get 'independent' models; θ_i is trained on
D_i, sampled **with replacement** from D." Figure: three networks fanning into `p(s_{t+1}|s_t,a_t)`.
*Same object as Lecture 5's `ensemble-alarm`.*

**p.34 — GP-NAR, part 1.** "The effectiveness of MPC crucially depends on the state dynamic model."
Most engineering approaches assume the transition model is Markovian · Stationary · Linear · Additive
noise · Gaussian noise, i.e. `x_{t+1} = Ax_t + Bu_t + w_t`, `w_t ~ N(0,σ_w²)`. The **Gaussian Process
Non-linear Auto-Regressive (GPNAR)** model relaxes to Non-Markovian · Non-stationary · Non-linear ·
additive Gaussian noise: `x_{t+1} = f_t(x_{0:t}, u_{0:t}, ŵ_{0:t})`.

**p.35 — GP-NAR, part 2.** Block diagram: delayed responses `(x_t,…,x_{t−L})` and sequential inputs
`(u_t,…,u_{t−L})` into a *System Dynamic model f*, plus noise `ε_t`, out to `x̂_{t+1}`.
`x̂_{t+1} = f(x_{t−L:t}, u_{t−L:t}) + ε_t`, `ε_t ~ N(0,σ_ε²)`. Three reasons for a GP, each mapped to a
requirement: **non-parametric** → non-linear transition; **Bayesian** → non-stationary transition
(update with the most recent data); **probabilistic** → robust decision making.

**p.36 — GP-NAR as an empirical hierarchical Bayesian model.** The plate-ish graph
(`x_{1:n} → f_{1:n} → y_{1:n}`, hyperparameters `τ²,λ`, noise `σ_ε²`), with the standard GP algebra:
prior on true function values `p(f^{1:n}, f | z^{1:n}, z, τ, λ) = N(0, [[K, k],[kᵀ, k(z,z)]])`,
likelihood `p(y^{1:n}|f^{1:n},σ_ε) = N(y|f, σ_ε²I)`, posterior `p(f|D_n,θ,x)`. Right panel: the exact
`gp-posterior` picture from Lecture 4 (true f, sampled points, μ(x) dashed, μ±σ band) with a green
predictive slice at a query point. *Lecture 4 returns verbatim, now as a dynamics model.*

**p.37 — ★ THE COMPOUNDING-ERROR FIGURE.** A staircase diagram: to predict `(ŷ_{t+1},…,ŷ_{t+k})` you
apply the one-step model **to its own outputs**. Row by row the blue (data) boxes are replaced by green
(predicted) boxes:
```
x_{t+1}: [y_{t−4}][ ][ ][ ][y_t]      → ŷ_{t+1} ~ N(μ(x_{t+1}|D_t), σ²(x_{t+1}|D_t))
x̂_{t+2}: [ ][ ][ ][ ][ŷ_{t+1}]        → ŷ_{t+2} ~ N(μ(x̂_{t+2}|D_{t+1}), σ²(x̂_{t+2}|D_{t+1}))
x̂_{t+3}: …                            → ŷ_{t+3} ~ …
```
Bottom: `x_{t+1} = (y_t,…,y_{t+1−L}) ⟹ ŷ_{t+1:t+L} = (ŷ_{t+1},…,ŷ_{t+L})`.
**This is the picture behind "errors compound over a horizon". Redraw or simulate.**

**p.38** The same, written as equations, with the key annotation at the bottom:
`ŷ_{t+k} = f(x̂_{t+k}) + e_{t+k}` where `x̂_{t+k} = (ŷ_{t+k−1},…,ŷ_{t+1}, y_t,…,y_{t+k−L})` — the first
group labelled **R.V.s** (random variables), the second **Data**. As the horizon grows the input is
made of more random variables and less data. *That single annotation is the cleanest statement of
compounding error anywhere in the deck.*

**p.39 — propagating an uncertain input through a GP.** If `x ~ p(x) = N(μ_x, Σ_x)`,
```
p(f(x)|μ_x,Σ_x) = ∫ p(f(x)|x,D) p(x) dx,   p(f(x)|x,D) = N(μ(x|D), σ²(x|D))
μ(x|D_n) = kᵀ(K + σ_ε²I)^{-1} y^{1:n},   σ²(x|D_n) = k(x,x) − kᵀ(K + σ_ε²I)^{-1} k
```
The integral is intractable → Monte-Carlo: `≈ (1/T) Σ_t p(f(xᵗ)|xᵗ, D)` with `xᵗ ~ p(x)`.

**p.40** The Monte-Carlo trajectory ensemble written out: for `i = 1..NumSim`, roll the whole chain,
then compute the mean trajectory `(ȳ_{t+1},…,ȳ_{t+L})` and standard deviations `(σ_{t+1},…,σ_{t+L})`.

**p.41 — the resulting picture.** A solid observed trajectory with dots, then a fan of dashed predicted
trajectories that spreads with horizon, with green vertical density slices at three future times, each
wider than the last. *The visual proof of compounding uncertainty.*

**p.42** *Deep Reinforcement Learning in a Handful of Trials using Probabilistic Dynamics Models*
(Chua, Calandra, McAllister, Levine — **PETS**). Figure 1 caption, quoted: probabilistic ensemble (PE)
= an ensemble of bootstraps, whose **disagreement far from data captures epistemic uncertainty**, each
member a probabilistic network capturing **aleatoric uncertainty**; trajectory sampling (TS) re-samples
each particle per step to horizon T; planning by MPC — compute an optimal action sequence, apply the
first, repeat.

**p.43 — PETS learning curves (4 tasks).** Cartpole (3000 steps), 7-DOF Pusher, 7-DOF Reacher,
Half-cheetah (400 000 steps). Caption: "**For all tasks, our algorithm learns in under 100K time steps
or 100 trials**"; one time step = 0.01 s (Cartpole 0.02 s). Baselines shown include PPO, SAC, DDPG "at
convergence" as horizontal dashed lines — the model-based curves reach them in a small fraction of the
samples.

**pp.44–45 — Version 4: latent-space models.** "What about complex observations?" The graphical model
`a_t → s_t → s_{t+1}`, `s_t → o_t`, `s_t,a_t → r_t`, drawn over three frames of a robot arm placing a
block. Three distributions named and characterised:
- `p(o_t|s_t)` — **observation model**, "high-dimensional but not dynamic";
- `p(s_{t+1}|s_t,a_t)` — **transition (dynamic) model**, "low dimension but dynamic";
- `p(r_t|s_t,a_t)` — **reward model**.
Hard because of: high dimensionality · redundancy · partial observability.
Training objectives, verbatim:
```
standard (fully observed):  max_φ (1/N) Σ_i Σ_t log p_φ(s_{t+1,i}|s_{t,i},a_{t,i})
latent space model:         max_φ (1/N) Σ_i Σ_t E[ log p_φ(s_{t+1,i}|s_{t,i},a_{t,i}) + log p_φ(o_{t,i}|s_{t,i}) ]
```

**p.46** The encoder. Learn `q_ψ(s_t|o_{1:t},a_{1:t})`; a single-step stochastic encoder `q_ψ(s_t|o_t)`
needs variational inference; a single-step **deterministic** encoder is
`q_ψ(s_t|o_t) = δ(s_t = g_ψ(o_t)) ⟹ s_t = g_ψ(o_t)`, giving the fully-written joint objective
```
max_{φ,ψ} (1/N) Σ_i Σ_t  log p_φ(g_ψ(o_{t+1,i}) | g_ψ(o_{t,i}), a_{t,i})   ← latent space model
                        + log p_φ(o_{t,i} | g_ψ(o_{t,i}))                  ← image reconstruction
                        + log p_φ(r_{t,i} | g_ψ(o_{t,i}))                  ← reward model
```
"Many practical methods use a stochastic encoder to model uncertainty." *Lecture 6's VAE, re-used as a
state-space model.*

**p.47 — Version 4 algorithm box.** Identical to Version 3 but over observations: collect
`D = {(o,a,o′)_i}`; learn `p_φ(s_{t+1}|s_t,a_t)`, `p_φ(r_t|s_t,a_t)`, `p_φ(o_t|s_t)` and `g_ψ(o_t)`;
plan through the model; execute the first action, observe `o′`; append.

**p.48** *Embed to Control (E2C)* — a locally-linear latent dynamics model for control from raw images
(Watter et al.). Figure 1: encode `x_t → z_t`, a transition net `h_ψ^trans` produces **local matrices
`A_t, B_t, o_t`** to predict `ẑ_{t+1}`, with a KL to the encoding of `x_{t+1}`, decoded by `h_θ^dec`.
Figure 2: true planar state space vs the latent spaces inferred by AE / VAE / VAE-with-slowness / E2C.
*Note the payload: E2C learns a latent space in which the dynamics are **linear**, so Lecture 9's LQR
applies. That is Act 1's "inductive bias" idea made concrete.*

**p.49** *SOLAR: Deep Structured Representations for Model-Based RL* (Zhang, Vikram, Smith, Abbeel,
Johnson, Levine). Figure 2's four-box loop: collect rollouts from the current policy → learn
representation and global models → infer local models given observed data → local model-based policy
improvement → back. Figure 3: the generative model with `F,Σ` (a global linear-Gaussian prior) over
`s_1…s_T`, observations `o_t` (RGB images), costs `c_t`, actions `a_t`.

**p.51 = p.9** repeated, retitled "Input Convex Neural Network for Planning" — the inductive-bias
taxonomy, now used to motivate ICNN.

**p.52** *Input Convex Neural Networks* (Amos, Xu, Kolter). FICNN and PICNN architectures.
`z_{i+1} = g_i(W_i^{(z)} z_i + W_i^{(y)} y + b_i)`, `f(y;θ) = z_k`.
**Proposition 1** (verbatim): *f is convex in y provided that all `W^{(z)}_{1:k−1}` are non-negative and
all `g_i` are convex and non-decreasing.* **Proposition 2:** a k-layer PICNN can represent any k-layer
FICNN and any purely feedforward network.

**p.53** *Optimal Control Via Neural Networks: A Convex Approach* (Chen, Shi, Zhang, ICLR 2019).
Figure 1: (a) train an input-convex NN on plant data; (b) solve a **convex** predictive-control problem
whose objective and dynamics constraints are the trained networks, and whose optimiser output is `u*`.

**p.54** ICNN / ICRNN architecture figure — the "passthrough" layers `D_{2:k}`, input expanded with `−u`,
all weights kept non-negative.

**p.55 — ★ THE BUILDING-MPC CASE STUDY (numbers).** The optimisation solved:
```
minimize_{u_t,…,u_{t+T}}  Σ_{τ=t}^{t+T} f(x_{τ−n_w},…,x_τ)
subject to  s_τ = g(x_{τ−n_w},…,x_{τ−1}, u_τ),  u_τ ≤ u_τ ≤ ū_τ,  s_τ ≤ s_τ ≤ s̄_τ
```
Figure 4: (a) *Dynamics Fitting* — ICRNN matches ground truth as well as a normal RNN and better than an
RC model; (b) *Control Performance* — "**ICRNN finds control actions which lead to 11.52% more energy
savings**"; (c) zone temperatures stay in band — "ICRNN provides **stable** control actions while
decisions generated by conventional RNN vary dramatically."

**p.56** *Input Convex Neural Networks for Building MPC* (Bünning et al., ETH Zürich / Empa, 2021).
Figures 6–7: real experimental room-temperature control by MPC with a FICNN and with a PICNN, over a
week each — room temperature tracking a night-setback band, relative control input, ambient temperature,
solar irradiation. **This is a real building, actually controlled. It is the deployed face of the
wind-farm/furnace story from Lecture 1.**

---

### MBRL Lecture 3 — Model Fitting and Policy Learning (pp. 57–120) → **Act 4**

**p.57** Divider. **pp.58–59** the ladder again; p.59 lights row 2's `Model → Policy` arrow.

**p.60 — ★ THE THREE ROUTES.** "Ways to learn a policy using the learned dynamic model:"
1. **Backpropagating the dynamic model into the policy** — *PILCO*.
2. **Imitating optimal control** in a constrained optimisation framework — *Guided Policy Search under
   Unknown Dynamics*; *End-to-End Training of Deep Visuomotor Policies*; *PLATO*.
3. **Using data simulated by the learned model** (e.g. **Dyna**) — *Continuous deep Q-learning with
   model-based acceleration*.

*These three map exactly onto the course: (1) is Lecture 9's shooting/Pontryagin view; (2) is Lecture 9
teaching Lecture 10; (3) is Lecture 7 feeding Lecture 8. That mapping is the chapter's reunion.*

#### Route 1 — backprop through the model (pp. 61–69)

**p.61 — the computation graph.** A chain `a_t = π_θ(s_t) → s_{t+1} = f(s_t,a_t) → a_{t+1} = π_θ(s_{t+1}) → …`
with `r(s_t,a_t)` hanging off each state, and **red "Backprop" arrows running backwards through every
edge**. Algorithm: run π₀ to collect D; learn f; **backpropagate through f into the policy** to optimise
π_θ; run π_θ, append the visited tuples; loop.

**p.62 — PILCO summary.** "PILCO reduces model bias, one of the key problems of model-based RL" by
learning a **probabilistic** dynamics model and explicitly incorporating model uncertainty into
long-term planning; copes with very little data; policy *evaluation* in closed form by approximate
inference; policy *improvement* by an analytically computed policy gradient.

**p.63 — ★ THE MODEL-BIAS FIGURE (PILCO Fig. 1).** Three panels over the same small dataset of
observed transitions: (left) the data — nine crosses; (centre) **multiple plausible deterministic
function approximators** — three different curves, all fitting the data, wildly different between the
points; (right) a **probabilistic** approximator — a grey band whose width is the disagreement.
Text: "model-based methods … inherently assume that the learned dynamics model sufficiently accurately
resembles the real environment. Model bias is especially an issue when only a few samples and no
informative prior knowledge about the task are available." **The best single picture of model bias in
the deck.**

**p.64 — the PILCO problem.** `x_t = f(x_{t−1}, u_{t−1})`; find a deterministic policy
`π: x ↦ π(x) = u` minimising `J^π(θ) = Σ_{t=0}^T E_{x_t}[c(x_t)]`, `x_0 ~ N(μ_0, Σ_0)`.

**p.65 — PILCO's dynamics model.** A GP with input `(x_{t−1},u_{t−1}) ∈ R^{D+F}` and target the
**difference** `Δ_t = x_t − x_{t−1} + ε ∈ R^D`. One-step prediction
`p(x_t|x_{t−1},u_{t−1}) = N(x_t|μ_t,Σ_t)`, `μ_t = x_{t−1} + E_f[Δ_t]`, `Σ_t = var_f[Δ_t]`, with the
standard GP predictive mean/variance `m_f(x̃_*) = k_*ᵀ(K+σ_ε²I)^{-1}y = k_*ᵀβ`,
`σ_f²(Δ_*) = k_{**} − k_*ᵀ(K+σ_ε²I)^{-1}k_*`.

**p.66 — policy evaluation.** Long-term prediction requires **mapping uncertain test inputs through the
GP**: approximate the joint state–control distribution `p(x̃_{t−1}) = N(μ̃_{t−1}, Σ̃_{t−1})`, then
`p(Δ_t) = ∫ p(f(x̃_{t−1})|x̃_{t−1}) p(x̃_{t−1}) dx̃_{t−1}` — analytically intractable, approximated as
Gaussian by **exact moment matching**, giving
`μ_t = μ_{t−1} + μ_Δ`, `Σ_t = Σ_{t−1} + Σ_Δ + cov[x_{t−1},Δ_t] + cov[Δ_t,x_{t−1}]`,
`cov[x_{t−1},Δ_t] = cov[x_{t−1},u_{t−1}] Σ_u^{-1} cov[u_{t−1},Δ_t]`.

**p.67 — policy improvement**, the full chain rule for `dE_t/dθ` with `E_t ≡ E_{x_t}[c(x_t)]`, plus
PILCO's Algorithm 1 (init θ ~ N(0,I) with random control; repeat: learn GP model on all data;
approximate-inference policy evaluation; gradient-based policy improvement; update θ by CG or L-BFGS;
apply π* for a single trial and record data).

**p.68 — ★ PILCO'S DATA-EFFICIENCY NUMBERS.**
- Real cart-pole: swing-up plus balancing solved with "**only 17.5 s of interaction** with the physical
  system"; a 20 s controlled trajectory shown in six frames.
- Robotic unicycle: state space `R^12`, control `R^2`; histogram of flywheel distance from upright over
  1000 test runs.
- **Table 1 — "PILCO's data efficiency scales to high dimensions":**

| | cart-pole | cart-double-pole | unicycle |
|---|---|---|---|
| state space | R⁴ | R⁶ | R¹² |
| # trials | ≤ 10 | 20–30 | ≈ 20 |
| experience | ≈ 20 s | ≈ 60–90 s | ≈ 20–30 s |
| parameter space | R³⁰⁵ | R¹⁸¹⁶ | R²⁸ |

- Figure 5: required interaction time on the cart-pole task, **log scale**, for eight methods ordered by
  publication date (Kimura & Kobayashi 1999 … van Hasselt 2010, then **pilco 2011** in red) — pilco's
  bar is roughly **three orders of magnitude** shorter than the earliest.

**p.69 — what goes wrong.** The same backprop chain, now with the true trajectory (solid) and the
model's (dashed) diverging. "**Issues in directly backpropagating into the policy**":
- *Parameter sensitivity*: "similar issues as shooting methods"; "no longer have a convenient second-order
  LQR-like method, because policy parameters couple all the time steps, so **no dynamic programming**";
- *Vanishing and exploding gradients*: "similar issues in training long RNNs with BPTT"; "unlike LSTM,
  **we can't just 'choose' a simple dynamics — dynamics are chosen by nature**".

#### Route 2 — imitate optimal control (pp. 70–96)

**pp.70–72 — the three-stage build-up**, drawn as three plots of the same wiggly trajectory:
```
p.70   min_{u_1..u_T, x_1..x_T} Σ_t c(x_t,u_t)   s.t.  x_t = f(x_t,u_t)
p.71   min_{u, x, θ}            Σ_t c(x_t,u_t)   s.t.  x_t = f(x_t,u_t),  u_t = π_θ(x_t)
p.72   min_{τ, θ}               Σ_t c(τ)         s.t.  u_t = π_θ(x_t)
```
p.70's figure shows a *dashed* planned trajectory sitting above the *solid* true one (the model is wrong);
p.71's shows one reconciled grey curve; p.72's the same curve in red — the trajectory optimiser and the
policy have been made to agree.

**p.74 — ★ THE THREE-ROW LADDER OF OPTIMISATION PROBLEMS.** A table with two constraint columns headed
"Constraint imposed by the **learned dynamics model**" and "Constraint imposed by the **planned
(optimized) action**":

| | objective | dynamics constraint | policy constraint |
|---|---|---|---|
| **Optimization** | `min_u c(u)` | — | — |
| **Dynamic Optimization (Optimal Control)** | `min_{u_1..u_T,x_1..x_T} Σ_t c(x_t,u_t)` | `s.t. x_t = f(x_t,u_t)` | — |
| **Dynamic Optimization with Imitation Learning** | `min_{u,x,θ} Σ_t c(x_t,u_t)` | `s.t. x_t = f(x_t,u_t)` | `s.t. u_t = π_θ(x_t)` |

**Redraw this.** It is Lecture 1 → Lecture 9 → Lecture 11 in three rows, and it is the cleanest
statement in the whole course of what model-based RL adds.
"Why use imitation learning?" — overcomes the optimisation difficulties of backpropagating into the
policy directly; relatively stable, easy to use, sample-efficient; "supervised learning works very well
+ control/planning works very well with the model — the combination of two works very well"; the
**input remapping trick**: exploit extra information available *at training time* to learn a policy
from raw observation.

**p.75 — dual gradient descent, recapped** (the professor's own recap, because GPS is DGD):
```
min_x f(x)  s.t. C(x) = 0,      L(x,λ) = f(x) + λC(x)
x*(λ) = argmin_x L(x,λ),        g(x) = L(x*(λ),λ)
dg/dλ = [dL/dx*][dx*/dλ] + dL/dλ  — the first term VANISHES because dL/dx* = 0 at the argmin
1. find x* = argmin_x L(x,λ)   2. compute dg/dλ = dL/dλ(x*(λ),λ)   3. update λ ← λ + α dg/dλ
```
*The crossed-out first term is the same envelope/implicit-function idea that Act 3 uses to
differentiate through an argmin. Point that out.*

**pp.76–77 — the GPS alternation, with the augmented Lagrangian.**
```
L(τ,θ,λ)  = c(τ) + Σ_t λ_t (π_θ(x_t) − u_t)
L̄(τ,θ,λ) = c(τ) + Σ_t λ_t (π_θ(x_t) − u_t) + Σ_t ρ_t (π_θ(x_t) − u_t)²      (Augmented Lagrangian)

1. τ*  ← min_τ L̄(τ,θ,λ)   (e.g. via iLQR)   — constrained trajectory optimisation
2. θ*  ← min_θ L̄(τ,θ,λ)   (e.g. via SGD)    — supervised learning
3. λ   ← λ + α dL̄/dλ (τ*,θ*,λ)
```
p.77's three bullets, verbatim: "Can be interpreted as constrained **trajectory optimization**"; "Can be
interpreted as **imitation** of an optimum control expert, since step 2 is just supervised learning";
"**The optimal control 'teacher' adapts to the learner, and avoids actions that the learner can't mimic.**"

**p.78 — the general GPS scheme.** 1. Optimise `p(τ)` w.r.t. a surrogate `c̃(x_t,u_t)`; 2. optimise θ
w.r.t. a supervised objective; 3. increment or modify the duals λ. "Need to choose: form of `p(τ)` or τ;
optimisation method for it; the surrogate `c̃`; the supervised objective for `π_θ(u_t|x_t)`."

**pp.79–80 — the deterministic case**, with `c̃(τ)` identified as the whole penalised bracket, and the
multi-trajectory version where each `τ_i` is optimised **in parallel**.

**p.81 — the stochastic (Gaussian) case = Guided Policy Search proper.**
```
min_p Σ_t E_{p(x_t,u_t)}[c(x_t,u_t)]
s.t. D_KL(p(τ) ‖ p̄(τ)) ≤ ε
s.t. p(u_t|x_t) = π_θ(u_t|x_t)                     ← imitation: local policy → global policy
where D_KL(p‖p̄) = E_{p}[−log p̄(u_t|x_t) − H(p(u_t|x_t))]
and   p(u_t|x_t) = N(K_t(x_t − x̂_t) + k_t + û_t, Σ_t)      ← A TIME-VARYING LINEAR-GAUSSIAN CONTROLLER
```
*Note that last line: the local policy **is** Lecture 9's `u = Kx` with a Gaussian around it. Say so.*
The KL trust region `D_KL(p‖p̄) ≤ ε` is **TRPO's constraint** in trajectory space — Lecture 1's trust
region, third appearance.

**p.82 — the GPS loop figure** (from the papers): `run p(u_t|x_t) on robot, collect D={τ_i}` → `{τ_i}` →
`fit dynamics p(x_{t+1}|x_t,u_t)` and `train π_θ(u_t|o_t)` → `improve p(u_t|x_t)` → next iteration.

**pp.83–86 — *Learning Neural Network Policies with GPS under Unknown Dynamics*.**
Objective and Lagrangian, verbatim:
```
min_{θ,p(τ)} E_{p(τ)}[ℓ(τ)]  s.t.  D_KL(p(x_t)π_θ(u_t|x_t) ‖ p(x_t,u_t)) = 0  ∀t
L_GPS(θ,p,λ) = E_{p(τ)}[ℓ(τ)] + Σ_t λ_t D_KL(p(x_t)π_θ(u_t|x_t) ‖ p(x_t,u_t))
```
Step 1 w.r.t. `p(τ)` = trajectory optimisation; step 2 w.r.t. θ = supervised policy optimisation
minimising a weighted sum of KL divergences; step 3 = dual gradient descent (the paper *schedules*
rather than updates λ). Key remark, verbatim: "**Optimizing the trajectory p(τ) automatically provides
the optimum local policy p(u_t|x_t) due to the linear LQR structure** (optimization is conducted by
iLQG, i.e. linear dynamic theory)."
Algorithm 1 annotated in the margin with the four roles: *(Learning dynamics) (Imitation learning)
(Trajectory optimization) (Update the dual variables)*.
**p.86 results figure:** 2D insertion, 3D insertion, octopus arm, swimming. Baselines REPS (100 and
20+500 samp), CEM (100 / 20 samp), RWR (100 / 20 samp), **PILCO (5 samp)**, ours (20 samp), **ours with
GMM (5 samp)**. The GPS curves reach the iLQG-with-true-model reference line in ~100–400 samples where
the baselines never do. Text: "the improved performance … is due in part to the use of stronger
assumptions about the task: **time-varying linear Gaussians are a reasonable local approximation for the
dynamics**."

**pp.87–91 — *End-to-End Training of Deep Visuomotor Policies*.** Policies map raw images directly to
motor torques; trained by GPS, so policy search becomes supervised learning; the supervision labels come
from trajectory-centric RL (trajectory optimisation). The full alternating dual-descent equations
(`L_θ(θ,p)`, `L_p(p,θ)`, the θ / p / λ updates). Figure 2: the visuomotor architecture — RGB 240×240 →
conv 7×7 stride 2, 64 filters → 5×5 conv, 32 → 5×5 conv, 32 → **spatial softmax** → expected 2-D
position (32 feature points) → concatenated with the 39-d robot configuration → three FC layers → 7
motor torques. Figure 3: the outer/inner loop diagram, with "requires robot" boxes marked. Figure 6:
nine real tasks (lego blocks fixed/free/in-hand, ring on peg, toy-aeroplane wheels, shoe tree, pill
bottle caps, water bottle). Figure 7: distance-to-target vs samples — all nine tasks converge in
**under ~40 samples**.

**pp.92–96 — *PLATO: Policy Learning using Adaptive Trajectory Optimization*.**
- The naive approach: generate a training set with MPC, then fit the policy by supervised learning.
  "The teacher can safely choose robust, near-optimal trajectories. **However, this ignores that the
  state distribution for the teacher and that of the learner are different** … we therefore cannot
  expect good long-horizon performance." *DAgger's problem, in control.*
- PLATO's fix — an **adaptive MPC teacher** whose actions are pulled toward the learner:
```
π_λ^t(u|x_t,θ) ← min_π  J_t(π|x_t) + λ D_KL( π(u|x_t) ‖ π_θ(u|o_t) )
```
  "The only difference with ordinary MPC is the inclusion of the KL divergence." The MPC is a
  maximum-entropy iLQG variant producing linear-Gaussian controllers `π(u|x_t) = N(K_t x_t + k_t, Σ_t)`.
- Training the learner: estimate a locally optimal `π*` at each `x_t` with iLQG *excluding* the KL term,
  then `θ ← argmin_θ Σ_{(x_t,o_t)} D_KL(π_θ(u|o_t) ‖ π*(u|x_t))`.
- MPC uses **full state** at training time; the final policy uses **only the observations** available to
  the robot, so it runs at test time without instrumentation. (The "input remapping trick" of p.74.)
- Figure 2: quadrotor flight through canyon/forest, laser and camera variants. PLATO (black) reaches
  higher average flight duration than DAgger variants, Coach, and plain supervised, **and** keeps
  average training crashes near zero where DAgger's saturate at the maximum. *Safety, not just accuracy.*

#### Route 3 — imagine the data (pp. 97–111)

**p.97 — the two gradients, side by side.**
```
policy gradient:            ∇_θJ(θ) = (1/N) Σ_i Σ_t ∇_θ log π_θ(a_t^i|s_t^i) Q̂_t^π
backprop (pathwise) gradient: ∇_θJ(θ) = Σ_i (dr_t/ds_t) Π_{t′=2..t} (ds_{t′}/da_{t′−1})(da_{t′−1}/ds_{t′−1})
```
"Use derivative-free ('model-free') RL algorithms, with the model used to generate synthetic samples —
essentially **model-based acceleration** for model-free RL. Policy gradient might be **more stable** (if
enough samples are used) because it does not require multiplying many Jacobians." *That contrast is
Lecture 10's score-function trick versus Route 1's chain of Jacobians — worth quoting.*

**p.98 — Dyna, in words**, with Sutton's two figures reproduced: Figure 8.1 (the `value/policy ⇄
experience ⇄ model` triangle, with *acting*, *direct RL*, *model learning*, *planning* on the arcs) and
Figure 8.2 (the general Dyna architecture: real experience → direct RL update *and* model learning;
model → simulated experience → planning update; "search control").
"Dyna-Q integrates both direct RL and model learning, where planning is one-step tabular Q-planning and
learning is one-step tabular Q-learning. … potentially suitable for applications where real/historical
data is insufficient to produce good models."

**p.99 — ★ THE DYNA ALGORITHM, verbatim.** "Online Q-learning algorithm that performs model-free RL
with a model":
```
1. Given state s, pick action a using an exploration policy
2. Observe s′ and r, giving the transition (s,a,s′,r)
3. Update model p̂(s′|s,a) and r̂(s,a) using (s,a,s′,r)
4. Q-update: Q(s,a) ← Q(s,a) + α E_{s′,r}[ r + max_{a′} Q(s′,a′) − Q(s,a) ]   (Model-based backup + Planning)
5. Repeat K times:
   5.1 sample (s,a) ~ B from the buffer of past states and actions
   5.2 Q-update: Q(s,a) ← Q(s,a) + α E_{s′,r}[ r + max_{a′} Q(s′,a′) − Q(s,a) ]   (Model-free RL)
```
Cited: "Richard S. Sutton. Integrated architectures for learning, planning, and reacting based on
approximating dynamic programming."

**p.100 — the general "Dyna-style" recipe.** 1. collect transitions; 2. **learn** `p̂(s′|s,a)` (and
optionally `r̂`); 3. repeat K times: sample `s ~ B`; choose `a` (from the buffer, from π, or random);
**simulate** `s′ ~ p̂(s′|s,a)`, `r = r̂(s,a)`; train on `(s,a,s′,r)` with model-free RL; optionally take
N more model-based steps. Two bullets: "Only requires **short (as few as one step) rollouts** from the
model"; "Algorithm can still see diverse states." Figure: four green dots on real trajectories, each
sprouting one short blue arrow — the picture of one-step imagination.

**p.101 — MBA / MVE / MBPO**, as one algorithm: take an action and add it to B; sample a mini-batch;
update the model; sample states `{s_j}` from B; **for each `s_j`, perform a model-based rollout with
`a = π(s)`**; use all transitions along the rollout to update the Q-function. Same figure, now with
*longer* blue arrows. Cited: "Continuous deep Q-learning with model-based acceleration"; "Model-based
value expansion"; "**When to trust your model: model-based policy optimization**".

**pp.102–108 — *Continuous deep Q-learning with model-based acceleration* (NAF).**
- **NAF**, the continuous Q-learning trick:
```
Q(x,u|θ^Q) = A(x,u|θ^A) + V(x|θ^V)
A(x,u|θ^A) = −½ (u − μ(x|θ^μ))ᵀ P(x|θ^P) (u − μ(x|θ^μ)),   P = L Lᵀ, L lower-triangular from a linear layer
```
  "Although this representation is restrictive, it **guarantees that the action that maximizes the
  Q-function is always given by μ(x|θ^μ)**." *This is Lecture 8's continuous-argmax wall, solved by
  making Q quadratic in u — i.e. by assuming LQR structure. Lecture 9 answering Lecture 8, directly.*
- **Model-guided exploration**: use iLQG under the learned model to generate good trajectories and mix
  them into the replay buffer. But: "it's not enough to simply show the algorithm good actions, it must
  also experience bad actions to understand which are better and which are worse."
- **Imagination rollouts**: synthetic on-policy trajectories generated under the learned model, added to
  the replay buffer. Two honest warnings, verbatim: "Incorporating off-policy exploration from good,
  narrow distributions, such as those induced by iLQG, often does **not** result in significant
  improvement for Q-learning" — Q-learning "inherently requires noisy on-policy actions to succeed";
  and "**Imagination rollouts can suffer from severe bias when the learned model is inaccurate.** For
  example, it is very difficult to train nonlinear neural network models for the dynamics that would
  actually improve the efficiency of Q-learning when used for imagination rollouts. The study found
  that using **iteratively refitted time-varying linear dynamics** produced substantially better results."
  *That is the chapter's central hazard, stated by a paper against its own method. Quote it.*
- Algorithms 1 and 2 reproduced (Continuous Q-Learning with NAF; Imagination Rollouts with Fitted
  Dynamics and Optional iLQG Exploration).
- **p.109 Table 1** — best test rewards of DDPG vs NAF and the episodes needed to get within 5% of best:
  Cartpole (DDPG −0.601/420 vs NAF −0.604/**190**), Reacher (−0.509/1370 vs **−0.331**/1260),
  Peg (−0.950/690 vs **−0.438**/**130**), Gripper (1.03/2420 vs **1.81**/**1920**), GripperM
  (−20.2/1350 vs **−12.4**/**730**), Canada2d (−4.64/1040 vs **−4.21**/900), Cheetah (**8.23**/**1590**
  vs 7.91/2390), Swimmer6 (−174/220 vs **−172**/**190**), Ant (**−2.54**/2450 vs −2.58/**1350**),
  Walker2d (**2.96**/**850** vs 1.85/1530). Mixed, honestly reported.

**p.110 — Summary of the three routes:**
- backprop into the policy — "**simple but potentially unstable**";
- imitate optimal control — "an effective planning method should be used: **iLQR · MCTS · MPC**";
- data simulated by the model (Dyna) — "**simple but not as sample-efficient as other methods**".

**p.111 — ★ Limitations (the honest slide).**
- "**Need some kind of model** — not always available; sometimes **harder to learn than the policy**."
- "**Learning the model takes time & data** — need to balance expressibility and tractability:
  expressive model classes are not fast (neural nets); fast model classes (linear) are not expressive."
- "**Learning a model relies on additional assumptions** — linearizability, continuity, smoothness, etc."

**p.112 = p.9** repeated a third time, retitled "Decision-centric data driven modeling for dynamic
systems with functional inductive biases".

---

### MBRL Lectures 4–5 and the differentiable-MPC deep-dive (pp. 113–141) → **Act 3**

**pp.113–114** Divider "MBRL Lecture 4. End-to-End Planning"; the ladder with row 3's
`Data → Inductive Biases → Planning` path lit.

**p.115 — the thesis of end-to-end planning.** "The model is **implicitly learned while deriving the
planning strategy**. The dynamic model is implicitly considered as a **constraint** while optimizing the
actions." References: *Task-based End-to-end Model Learning in Stochastic Optimization*; *Differentiable
MPC for End-to-end Planning and Control*.

**pp.116–118** Divider "MBRL Lecture 5. End-to-End Policy Learning"; the ladder with row 3's
`Data → Inductive Biases → Policy` path lit; "Learn **simultaneously** both the dynamic model and the
policy" — *Learning Continuous Control Policies by Stochastic Value Gradients*; *Dream to Control:
Learning Behaviors by Latent Imagination* (Dreamer); *Graph Networks as Learnable Physics Engines for
Inference and Control*. **(pp.119–123 repeat these two dividers and overviews.)**

**p.124** Contents of the deep-dive: *OptNet: Differentiable Optimization as a Layer in Neural Networks*
(ICML 2017); *Differentiable MPC for End-to-end Planning and Control* (NeurIPS 2018).

**p.125 — model-free vs model-based, the loop pictures.** Left: `Agent ⇄ Environment`. Right: the same
with a `Model` box inside the agent's shaded box, and a squiggle marking model ≈ environment. Table:

| Model-free RL | | Model-based RL |
|---|---|---|
| No | Model? | Yes |
| Use policy function π_θ(s_t) | Decision-making? | Use planning method |
| End-to-end learning | Goodness? | Sample-efficient |

**p.126 — the MPC problem, and the idea.**
```
τ*_{1:T} = (x*_t, u*_t)_{1:T} = MPC(x_init; C_t, f_θ)
         = argmin_{x_{1:T}, u_{1:T}} Σ_{t=1}^T C_t(x_t,u_t)
           s.t. x_{t+1} = f_θ(x_t,u_t),  x_1 = x_init
```
"with a learned model `f_θ(x,u)`. The model is usually learned by minimizing the predictive loss
`L(x_{t+1}, f_θ(x_t,u_t))` — **independent of task, dependent on dataset**."
"**Idea: treat MPC(·) as a policy class to cast an end-to-end learning!** The model and the action are
derived by minimizing the task loss `ℓ(·)` over θ."

**p.127 — ★ THE THREE-COLUMN TABLE** (the tex reproduces this one):

| | Model-free RL | Model-based RL | Differentiable MPC |
|---|---|---|---|
| Model | No | Yes | Yes |
| Thing to be trained | Policy π(·) | Model f(·) | Model f(·) (potentially cost c(·)) |
| Loss function | Task loss | **Model prediction loss** | **Task loss** |
| Execution | Policy | Planning | Planning |

**p.128 — "Useful When…"** "Your task is not just minimizing your control objective `c(x,u)`" —
**imitation learning**: find θ minimising `(π_θ(s) − π(s))²` where `π(s)` is generated by an expert.
"In this case, differentiable MPC can be useful. **Ex) HVAC control, (possibly) WONIK.**"
Then: "BTW, is the argmin operator differentiable? If it is, is the backward fast enough?"
*WONIK is the furnace/semiconductor-equipment partner; with p.55's building-MPC result this is the
deck's own evidence that the Lecture 1 industrial problems come back here.*

**p.129 — "(Partially) YES, it is!"** For a QP (convex):
```
τ*_{1:T} = argmin_{τ_{1:T}} ½ τ_tᵀ C_t τ_t + c_tᵀ τ_t
           s.t. x_1 = x_init,  x_{t+1} = F_t τ_t + f_t
```
"State the KKT conditions of a Lagrangian and take the differentials of them!"

**p.130 — differentiating the argmin.**
```
L(τ,λ) = Σ_{t=1}^T (½ τ_tᵀ C_t τ_t + c_tᵀ τ_t) + Σ_{t=0}^{T−1} λ_tᵀ (F_t τ_t + f_t − x_{t+1})
∇_{C_t} ℓ = ½ (d*_{τ_t} τ*_tᵀ + τ*_t d*_{τ_t}ᵀ),   ∇_{c_t} ℓ = d*_{τ_t},   ∇_{x_init} ℓ = d*_{λ_0}
∇_{F_t} ℓ = d*_{λ_{t+1}} τ*_tᵀ + λ*_{t+1} d*_{τ_t}ᵀ,   ∇_{f_t} ℓ = d*_{λ_t}
where  [d*_{τ_t}; d*_{λ_t}; …] = −K^{-1} [∇_{τ*_t} ℓ; 0; …]
```
with `K` the block-tridiagonal KKT matrix drawn out (blocks `C_t, F_tᵀ; F_t, [−I 0]; …`).

**p.131 — Module 1, Differentiable LQR** (from the paper), forward pass `τ* = LQR_T(x_init;C,c,F,f)` then
`λ*_{1:T}`; backward pass `d*_{τ_{1:T}} = LQR_T(0; C, ∇_{τ*}ℓ, F, 0)` — **the backward pass is itself an
LQR solve**, "ideally reusing the factorizations from the forward pass".

**p.132 — non-linear dynamics and cost.** General MPC with box constraints
`τ* = argmin Σ_t C_{θ,t}(τ_t) s.t. x_1 = x_init, x_{t+1} = f_θ(τ_t), u ≤ u ≤ ū`.
"After obtaining a fixed point by **iLQR**, use Taylor approximation to form an LQR. **Backward pass is
faster than unrolling iLQR.**" Module 2 reproduced; note step 1 of the backward pass: "F̃_θⁿ is F_θⁿ with
the rows corresponding to the **tight control constraints zeroed**."

**p.133 — Drawback**, in two lines: "Sometimes the fixed point of iLQR does not exist. If this is the
case, use the unrolling procedure to compute the backward pass."

**p.134 — ★ RUNTIME FIGURE.** Log-scale runtime (s) vs number of LQR steps ∈ {1, 32, 64, 128}, four bars
each: FP Forward, FP Backward, Unroll Forward, Unroll Backward. **The FP backward bar is flat at
≈1.5×10⁻² s across all horizons**, while unrolling grows to ≈3 s at 128 steps — roughly **two orders of
magnitude** at the long horizon. This is the quantitative justification for differentiating the KKT
conditions rather than unrolling the solver.

**p.135 — ★ IMITATION EXPERIMENTS.** Two losses defined:
```
convex control (LQR):        L(θ) = E_x[ ‖ τ_{1:T}(x;θ) − τ_{1:T}(x;θ̂) ‖² ]
non-convex (pendulum, cartpole): L(θ) = E_x[ ‖ u_{1:T}(x;θ) − u_{1:T}(x;θ̂) ‖² ]
```
Figure 3: imitation loss falls and plateaus while **model loss for several runs turns around and rises**
— the model gets *worse at prediction* while the controller gets *better at the task*.
Figure 4: pendulum and cartpole, log-scale imitation loss, methods `nn`, `sysid`, `mpc.dx`, `mpc.cost`,
`mpc.cost.dx`, at #Train ∈ {10, 50, 100}. On pendulum the differentiable-MPC variants reach ~10⁻⁷–10⁻⁸
against `nn` at ~10⁻¹ and `sysid` at ~10⁻⁴.

**p.136 — ★ THE NON-REALIZABLE EXPERIMENT (the money slide for Act 3).** "Expert dynamics is outside of
the real dynamics. Proposed method shows **less imitation loss** than MBRL." Figure 5, two panels over
250 epochs:
- *SysID Loss*: the **blue** vanilla-SysId baseline settles at ≈0.002; the **red** task-loss method
  settles **higher**, at ≈0.0025.
- *Imitation Loss*: blue settles at ≈0.19–0.20; red settles **lower**, at ≈0.12–0.13.
**A model deliberately fitted worse, in the way the task does not care about, controls better.**
This is exactly the tex's claim "the model is wrong in whatever way helps the task least" — and it is
measured, not asserted.

**pp.137–141 — Appendix: full derivation of the gradients of the task loss.**
- p.137: the LQR problem, its Lagrangian, and `∇_{τ_t}L(τ*,λ*) = C_t τ*_t + c_t + F_tᵀ λ*_t − [λ*_{t−1}; 0] = 0`,
  "thus the optimal `λ*_{1:T}` can be calculated backwards".
- p.138: the full block-tridiagonal KKT system `K [τ*; λ*; …] = −[c_t; f_t; c_{t+1}; f_{t+1}; …]`, with the
  note "solving the LQR is the alternative way to solve the KKT system problem".
- pp.139–141 (**from OptNet**): for `min_z ½zᵀQz + qᵀz s.t. Az = b`, KKT `Qz* + q + Aᵀν* = 0`, `Az* − b = 0`;
  take **differentials**:
```
dQ z* + Q dz + dq + dAᵀ ν* + Aᵀ dν = 0
dA z* + A dz − db = 0
⟹  [Q Aᵀ; A 0] [dz; dν] = − [dQ z* + dq + dAᵀ ν* ;  dA z* − db]
```
  "Now you can compute ∂z/∂θ by setting db = I and others to 0." Then the chain rule for the loss:
  `∇_Q ℓ = ½(d_z z ᵀ + z d_zᵀ)`, `∇_q ℓ = d_z`, `∇_A ℓ = d_ν zᵀ + ν d_zᵀ`, `∇_b ℓ = −d_ν`, with
  `[d_z; d_ν] = [Q Aᵀ; A 0] [(∂ℓ/∂z*)ᵀ; 0]`. Change of notation gives p.130's MPC formulas.

---

## What the tex dropped, and what to restore

| dropped | where it is | why restore |
|---|---|---|
| The four-row ladder (analytical OC / 2-stage MBRL / end-to-end MBRL / model-free) | pp.2–8 | It **is** Act 1's spectrum, and unlike the tex's table it separates *planning* from *policy*. → widget `model-use-ladder` |
| Versions 1 → 2 → 3 → 4 escalation | pp.17–47 | Act 2's whole argument. Each version is named by the failure of the last. |
| `p_{π_f}(s_t) ≠ p_{π_0}(s_t)` | p.23 | The precise statement of why open-loop planning on a learned model fails. Lecture 5's rhyme. |
| "REPLANNING HELPS WITH MODEL ERRORS" + 3 bullets | p.26 | The reason MPC is the answer, and the widget's claim. |
| `σ² = σ_s² + σ_m²`, ensembles, GP-NAR, PETS | pp.31–43 | Lectures 0, 2, 4, 5 all return here. Without it the chapter has no answer to model bias. |
| The compounding-prediction staircase and the R.V.s/Data annotation | pp.37–38, 41 | The mechanism of compounding error. → widget `rollout-drift` |
| ICNN / convex learned models, 11.52% building energy saving, the ETH building experiment | pp.51–56 | Lecture 1's convexity, imposed on a *learned* model; and the deployed industrial face. |
| PILCO's numbers (17.5 s cart-pole; the R⁴/R⁶/R¹² table; three orders of magnitude) | p.68 | The sample-efficiency claim, in seconds. |
| The three routes to a policy | p.60 | The reunion. Route 1 ↔ Lec 9 shooting, Route 2 ↔ Lec 9 → Lec 10, Route 3 ↔ Lec 7 → Lec 8. |
| The three-row optimisation ladder (opt / dynamic opt / dynamic opt + imitation) | p.74 | Lecture 1 → 9 → 11 in three rows. |
| "The teacher adapts to the learner" | p.77, p.92 | GPS's actual idea; DAgger's problem solved in control. |
| Dyna's algorithm, and the K-planning-steps dial | pp.99–101 | Act 4's third route. → widget `dyna-imagination` |
| "Imagination rollouts can suffer severe bias… nonlinear NN models did not help" | p.108 | The hazard, admitted by the method's own authors. |
| NAF's `Q = A + V` with `A` quadratic in u | p.106 | Lecture 8's continuous-argmax wall, solved by assuming LQR structure. |
| The FP-vs-unroll runtime figure | p.134 | Why differentiate the KKT rather than unroll. |
| The non-realizable pendulum result (SysID loss ↑, imitation loss ↓) | p.136 | Act 3's claim, measured. → widget `task-vs-prediction` |
| The limitations slide | p.111 | Honesty, and the setup for Lecture 12. |
| Dual gradient descent recap, with `dL/dx* = 0` crossed out | p.75 | The same envelope argument that Act 3 uses. Ties Acts 3 and 4 together. |

## What is in the tex but not the deck

- The **bilevel design-optimisation** program (upper-level design `p`, lower-level control `u*`) and the
  explicit wind-farm / furnace naming. The deck's *evidence* for it is p.55 (building MPC, 11.52%),
  p.56 (a real ETH building under MPC) and p.128 ("HVAC control, (possibly) WONIK"). So the connection
  is supported but the program itself must come from the tex.
- The naming of Lectures 7/8/9/10 as the four reunited chapters (deck says "control theory can be used",
  "linear LQR structure", "no dynamic programming" — the pieces, not the frame).

## Numbers worth putting on a slide

| number | source | claim |
|---|---|---|
| ~10 min vs ~10 days of real time | p.29 | pure model-based vs model-free on HalfCheetah |
| 3–5× sample-efficiency gain | p.27 | Nagabandi's Mb-Mf on swimmer/cheetah/hopper/ant |
| under 100K steps, ≤100 trials | p.43 | PETS vs PPO/SAC/DDPG at convergence |
| 17.5 s of physical interaction | p.68 | PILCO, real cart-pole swing-up + balance |
| ≤10 trials (R⁴), 20–30 (R⁶), ≈20 (R¹²) | p.68 | PILCO scaling |
| ~3 orders of magnitude less interaction | p.68 Fig. 5 | PILCO vs 1999–2010 methods |
| ≈40 samples per task | p.91 Fig. 7 | GPS linear-Gaussian controllers, 9 real robot tasks |
| 5–20 samples | p.86 | GPS vs REPS/CEM/RWR at 100–800 |
| 11.52% more energy saving | p.55 | ICRNN-based MPC vs conventional RNN, building control |
| ≈1.5×10⁻² s flat vs ≈3 s at 128 steps | p.134 | KKT backward vs unrolling iLQR |
| SysID loss 0.0025 vs 0.0020; imitation loss 0.12 vs 0.19 | p.136 | task-loss model: worse predictor, better controller |
| NAF vs DDPG: peg 130 vs 690 episodes | p.109 | model-based acceleration, honestly mixed |
