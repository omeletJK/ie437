---
ch: 11
title: Model-Based Reinforcement Learning
subtitle: Put the model back — learned — and let the two lineages reunite
tagline: A model given (7, 9), a model deleted (8, 10), a model *learned* — and shared
blurb: >-
  Put the model back, but learn it. A learned model can be planned with, imagined through, or
  differentiated for design — and wherever it is wrong, rollouts drift away from reality. This is
  where the two lineages of the course rejoin.
course: IE437 · Data-Driven Decision Making and Control
author: Jinkyoo Park
institute: KAIST
lineage: A+B
lineage_here: all
cube:
  stages: dynamic
  model: data-driven
  agents: single agent
inherits: both lineages, each with the model thrown away (Lectures 8 and 10)
handoff: a learned model plus planning, and bilevel design
questions:
  - Why a model?
  - Plan with it?
  - Differentiable?
  - Reunite?
---

### Model-Based Reinforcement Learning
{layout: title}

## The handoff — the model returns
{short: HANDOFF}

Two lectures threw the model away, from opposite traditions. This one puts it back — learned, and therefore wrong.

### Where we are — both lineages, each missing its model

::: tracker
:::

::: lineage
:::

::: small
No cell of the grid is highlighted, because ==all four are ours today==. No axis moves either: still *dynamic, data-driven, single agent*. What changes is that we stop pretending the transition is unknowable. We ==estimate it==, and every model-based method of Lectures 7 and 9 becomes available again — standing, this time, on data.
:::

::: reveal
::: keypoint
Under all four cells, one new row: ==learn the model, and let the four collaborate.==
:::
:::

### What each of the four gave up, and what it cost

Lecture 8 deleted $P$ and $R$ and kept the Bellman equation. Lecture 10 deleted $f$ and kept the feedback law. Both paid in the same coin:

::: reveal
::: keypoint
==Sample inefficiency.== Real transitions can be reused through replay, as in DQN and DDPG. A learned model adds the ability to generate **new synthetic transitions**.
:::
:::

::: reveal
Lecture 10 closed by asking the question both extensions had been avoiding: *if deleting the model cost us this much, what happens if we learn it?* Here is the cost, measured. The source experiments compare substantially fewer real interactions for model-based learning than for their model-free baselines. The exact count depends on the task, performance threshold, control frequency, and baseline; a simulation step is not automatically a fixed amount of real training time. {p}(Nagabandi et al., 2018)


::: small
The reason is arithmetic, not cleverness. A learned $f_\theta$ can be queried without touching the world, so ==one real transition can inform the value of many imagined states.== That is the entire case for this lecture.
:::
:::

### The thesis — learn the dynamics, and both parents come back
{fill: center}

::: keypoint
Learn the dynamics from data, and ==the model-based machinery of both lineages comes back to work on top of it.==
:::

::: reveal
Four chapters have circled one problem. Dynamic programming (Ch 7) and optimal control (Ch 9) *had* a model and computed. Value-based (Ch 8) and policy-based RL (Ch 10) *lacked* one and sampled. Model-based RL learns $f_\theta$ and lets them collaborate — and, most strikingly, has an optimal-control **teacher** train a policy **student**.
:::

::: reveal
::: small
The price is ==model bias==. Errors in $f_\theta$ compound through planning, and a planner is an optimiser, so it will find them. Managing that trade — sample efficiency against model error — is the engineering of the whole lecture, and it is Lecture 5's warning arriving in the dynamic world.
:::
:::

### The unknowns doubled — and this is the third answer

::: lede
Lecture 0 named the deepest move in the course: crossing the model axis in the dynamic world leaves **two** unknowns, $r$ and $P$, not one. Part IV is three answers to that doubling.
:::

| answer | what it does with $r$ and $P$ | chapter |
|---|---|---|
| **Value-based** | ==fuses== them into $Q$ and models neither | Lecture 8 |
| **Policy-based** | lets $P$ ==vanish== from the gradient (the score-function trick) | Lecture 10 |
| **Model-based** | ==estimates $P$ explicitly==, then plans | **Lecture 11** |

::: reveal
::: small
Read the third row against the first two. It is the only one that pays for a whole transition kernel — far more parameters than the $Q^*$ we act on. Lecture 8 called that waste and walked past it. Today we collect the return on that investment: ==a model you can replay==.
:::
:::

### Lecture 8 promised this lecture, in three lines

Backup 4 of Lecture 8 set model-based RL aside with a ledger. Here it is, and here is where each line is paid:

::: flow
- !**Pro — sample efficiency** | a learned model can be replayed indefinitely
- !!**Con — model bias** | errors compound through planning
- **Con — cost** | a whole kernel, to act on $Q^*$
:::

::: reveal
- the **pro** is Acts 1 and 4 — the spectrum, and Dyna's imagined steps;
- the **con of bias** is Act 2 — replanning, ensembles, and uncertainty-aware models;
- the **con of cost** is answered by Act 3, which stops paying for accuracy the task does not use.
:::

::: reveal
::: small
Lecture 10 supplies **SAC** for MBPO's policy learner and **actor–critic learning** for understanding Dreamer. Its KL constraints also help read the guided-policy-search extension: a similar local-update idea, now applied to trajectory distributions.
:::
:::

### The roadmap — four questions

::: qstrip 0
:::

- **Q1 — Why bring a model back at all?** Sample efficiency, and ==the spectrum== it opens between model-free and fully differentiable control.
- **Q2 — How do we use a learned model?** ==Planning== over $f_\theta$ — Lecture 9's optimal control, run on learned dynamics, and re-planned every step.
- **Q3 — Can the planner itself be trained?** ==Differentiable MPC== — backpropagate *through* the optimiser, and fit the model to the task.
- **Q4 — How do the lineages reunite?** Compare ==Dyna → MBPO== with ==Dreamer==: use the model to create short training transitions, or learn an actor and critic in latent imagination. Guided policy search supplies a teacher-based comparison.

### Learning route — use a learned model, then check what it changes

**Bring:** Bellman backups (Lectures 7–8), feedback control (Lecture 9), and policy gradients (Lecture 10).

::: flow
- **Fit** | predict the next state from a transition
- **Plan** | compare short action sequences
- **Re-plan** | replace a prediction with a measurement
- !**Learn a policy** | differentiate, imitate, or simulate
:::

**Core goal:** calculate a two-step plan and an imagined value target, then distinguish PETS/MPC, MBPO and Dreamer. Differentiable MPC is an advanced bridge to Lecture 1; detailed KKT and GPS/PLATO derivations remain in the appendix.

A good model should support good decisions on the states the controller will actually visit. Small training error alone cannot establish that.

### Reading guide — choose how much of the learned model to trust
{sub: one main idea to explain, one comparison, one application}

| Role | Read or revisit | Question to answer |
|---|---|---|
| **Core** | [Janner et al., *When to Trust Your Model: Model-Based Policy Optimization* (NeurIPS 2019)](https://arxiv.org/abs/1906.08253) | Why start short model rollouts from real states? |
| **Compare** | [Hafner et al., *Dream to Control: Learning Behaviors by Latent Imagination* (ICLR 2020)](https://arxiv.org/abs/1912.01603) | How can a latent world model train an actor and critic? |
| **Apply** | The original control cases and [Hafner et al., *Mastering Diverse Control Tasks through World Models* (Nature 2025)](https://www.nature.com/articles/s41586-025-08744-2) | What does the later Dreamer result demonstrate beyond the teaching diagram? |

::: keypoint
Dyna and PETS establish the model-use choices; MBPO and Dreamer are the main comparison. PILCO connects to GPs. Detailed GPS/PLATO and KKT-based MPC derivations remain research extensions.
:::

## Act 1 — the spectrum of model use
{short: ACT 1, num: Act 1}

**Q1.** "Model-based" is not the opposite of "model-free". It is the far end of a dial.

### Two ways to come by a model
{q: 1}

::: qstrip
:::

::: cols
::: col Often we simply *have* one
- **Games** — Atari, chess, Go: the rules *are* the transition function.
- **Easily modelled systems** — a car following a bicycle model.
- **Simulated environments** — the simulator is the dynamics.
:::
::: col.accent Often we can *learn* one
- **System identification** — fit the few unknown parameters of a ==known== structure. Excite the system, measure the response, fit.
- **Learning** — fit a ==general-purpose== model to observed transitions $\{(s,a,s')\}$, with architecture and regularization supplying inductive assumptions.
:::
:::

::: reveal
Either way, the payoff has two faces, and they are Acts 2 and 4 of this lecture:

::: keypoint
Knowing the dynamics helps you ==plan a sequence of actions==, and it helps you ==derive a policy.==
:::
:::

### The ladder of model use

::: widget model-use-ladder
Four ways to get from data to a decision, drawn as the source deck draws them. Walk down and the model is made less and less explicit: an analytical model needing no data at all; a model *fitted* then planned in; dynamics baked into the architecture as an inductive bias; and finally the model deleted, data wired straight to a policy. Note the right-hand column: only the model-free row cannot produce a ==plan==, because there is nothing to plan *in*.
:::

### The same ladder, as a ledger

::: table center
|   | **Model-free RL** | **Model-based RL** | **Differentiable MPC** |
|---|---|---|---|
| explicit model? | no | yes | yes |
| trained object | policy $\pi(\cdot)$ | model $f(\cdot)$ | model $f(\cdot)$, and cost $c(\cdot)$ |
| loss | task loss | ==model-prediction loss== | ==task loss== |
| execution | policy | planning | planning |
:::

::: reveal
Read left to right and more of the world's structure is made explicit, buying ==sample efficiency== and generalisation. Read right to left and there is less to get wrong, dodging ==model bias==.
:::

::: reveal
::: keypoint
A learned model is reusable but ==wrong==; a model-free policy is honest but ==hungry==.
:::
:::

### The price, named — the model is only right where the data was

::: lede
The naive plan is to fit a model, plan in it, and execute. It works for exceptionally simple cases — those in which the fitted model generalises over the *whole* state space.
:::

::: cols
::: col What goes wrong
A model is fitted where the base policy went. Planning then evaluates it where the *plan* goes, which is somewhere else — and an optimiser will walk straight to wherever the model is most flatteringly wrong.

$$p_{\pi_f}(s_t)\;\neq\;p_{\pi_0}(s_t)$$
:::
::: col.accent Where you have met this before
Lecture 5, exactly: a surrogate fitted to a fixed dataset, then handed to an optimiser that exploits it. ==The optimiser is an adversary== — and a planner is an optimiser with a time axis.

And it gets *worse* with capacity: extra capacity can worsen off-distribution overfitting without adequate data or regularization; it can also reduce misspecification.
:::
:::

::: reveal
::: small
So the optimum found in a learned model is only ==optimum from the model's point of view==. The whole of Act 2 is a sequence of four repairs to that one sentence.
:::
:::

### Check — what a model buys
{q: 1}

::: quiz Model-based RL learns $\hat{P}$ and plans with it. What is the main thing it buys over model-free methods?
- =Sample efficiency: the agent can generate as much imagined experience as it likes from a model fitted to comparatively little real data
- Lower asymptotic error — the final policy is always better
- Freedom from the Markov assumption
- Guaranteed convergence, which model-free methods lack
Real interaction is the scarce resource — it costs wall-clock time, hardware, or safety. A learned model turns a small amount of it into an unlimited supply of cheap synthetic experience. What it does **not** buy is accuracy: the eventual ranking depends on the model class, task, optimization, and data; there is no universal winner.
:::

## Act 2 — planning with a learned model
{short: ACT 2, num: Act 2}

**Q2.** Fit a model; plan in it. Four versions, each named by the failure of the last.

### Version 1 — fit, then plan once
{q: 2}

::: qstrip
:::

::: block Model building + open-loop planning
1. Run a base policy $\pi_0(a_t\mid s_t)$ — e.g. random — and collect $\mathcal{D}=\{(s,a,s')_i\}$ &nbsp;&nbsp;*(experiencing)*
2. Learn $f(s,a)$ by minimising $\sum_i \lVert f(s_i,a_i) - s'_i\rVert^2$ &nbsp;&nbsp;*(model fitting)*
3. Plan through $f(s,a)$ to choose actions &nbsp;&nbsp;*(model-based planning)*
4. Execute those actions
:::

::: reveal
::: cols
::: col.accent Yes — this is classical system identification
Excite, measure, fit a ==predefined== model. Particularly effective when physics gives the structure and only a few parameters are free: fit Newton's law once and it describes any rigid body.

Linear sysID estimates $A,B$ in $\dot x = Ax + Bu$ — and ==once the linear system is identified, all of Lecture 9 applies==: Riccati, $K$, the lot.
:::
::: col No — the distribution moves under you
The plan is executed open loop. The states it visits are not the states the model was fitted on, and there is no correction channel.

$$p_{\pi_f}(s_t)\neq p_{\pi_0}(s_t)$$
:::
:::
:::

### What system identification actually offers

::: lede
Before reaching for a network, note how much structure the control tradition already knows how to fit — and that every one of these was built to be *planned in*.
:::

| method | model | what it buys |
|---|---|---|
| **Linear sysID** | $\dot x = Ax+Bu$ | Lecture 9 applies verbatim |
| **Model reduction / DMD** | $\dot a = \tilde A a + \tilde B u$ | a low-dimensional state — fast prediction, fast control |
| **Piecewise linear** | local $A_k, B_k$ | iLQR's local model, made explicit |
| **Koopman operator** | linear in infinite-dimensional measurements | a ==nonlinear== system, solved by ==linear== theory |
| **Deep / GP models** | MLP, RNN, LSTM, Gaussian process | expressive — and the reason distribution mismatch bites |

::: small
The table is a spectrum of its own: downward, more expressive and less planable. Act 3 will argue the direction of travel should sometimes be *upward*.
:::

### Version 2 — put the loop back

Append what actually happened, refit, repeat. If the model is wrong where the plan goes, then ==go there and collect data==:

::: block Iterative model building
&nbsp;&nbsp;5. Append $\{(s,a,s')_j\}$ to $\mathcal{D}$, and return to step 2 &nbsp;&nbsp;*(collecting data)*
:::

::: reveal
This is data aggregation: add data from the controller’s current visits so the training distribution better covers the states planning needs. It helps — and it still executes a whole plan before looking.

::: keypoint
So: what if we make a mistake ==in the middle of the plan?==
:::
:::

### Version 3 — re-plan every step, and MPC is born

At each step, optimise a short horizon of actions, ==execute only the first==, observe, re-plan:

$$\min_{u_{0:H-1}}\sum_{t=0}^{H-1}C_t(x_t,u_t)+C_H(x_H),\quad x_{t+1}=f_\theta(x_t,u_t),\quad x_0=x_{\mathrm{measured}}$$

::: reveal
This is ==Lecture 9's optimal control, run on a learned model== instead of a given one. Nothing in the solver changes; only the constraint is now fitted.

::: block Replanning helps with model errors
- the more you re-plan, ==the less perfect each individual plan needs to be==;
- you can therefore use ==shorter horizons==, where the model is still trustworthy;
- and the inner optimiser can be crude — even random shooting often works.
:::
:::

### Plan twice — first from a prediction, then from a measurement

Use $\hat x_{t+1}=\hat x_t+u_t$, start at $x_0=2$, and compare two-step plans with cost $u_0^2+u_1^2+x_2^2$.

| plan | predicted final state | total predicted cost |
|---|---|---|
| $(0,0)$ | 2 | 4 |
| $(-1,0)$ | 1 | 2 |
| $(-1,-1)$ | 0 | 2 |

Among these candidates, choose $(-1,0)$ and execute **only $u_0=-1$**. Suppose the measured next state is **1.4**, not the predicted 1.

::: keypoint
The next optimization starts from **1.4**. For a final one-step cost $u^2+(1.4+u)^2$, it chooses $u=-0.7$. MPC corrects its starting state; it does not magically correct every model error.
:::

### What does “plan through the model” actually compute?
{sub: original model-based RL PDF pp. 18–30 · the inner search in MPC}

At the measured state $s_t$, compare candidate action sequences using the learned dynamics and the same objective:

$$\hat J(a_{t:t+H-1})=\sum_{j=0}^{H-1}\gamma^j\hat r(\hat s_{t+j},a_{t+j}),\qquad\hat s_{t+j+1}=\hat f(\hat s_{t+j},a_{t+j}).$$

| Search option | Calculation |
|---|---|
| Random shooting | sample several action sequences, simulate each, keep the highest predicted return |
| Cross-entropy method (CEM) | repeatedly refit a sampling distribution to the best candidate sequences |
| Gradient-based planning | differentiate predicted return through a differentiable dynamics model |

::: keypoint
MPC executes **only the first action of the chosen sequence**, measures the new state, and searches again. This feedback rule matters even when the inner search is approximate.
:::

### What a rollout does to a model's error

::: widget rollout-drift {"seed":17}
A one-dimensional system, a base policy that explored a band around the origin, and a model fitted inside it. Left: the model is ==excellent where the data is== and hopeless outside. Middle: rolled out open loop, the model is composed with *its own output*, so it walks out of the band and never comes back. Right, on a log axis: the open-loop error climbs a decade every few steps, while ==re-measuring the state each step holds it flat.==
:::

### Why rollout error grows — count the propagation

Let the one-step model error be at most $\epsilon$ and let true dynamics amplify state differences by at most $L$. For the same actions and $e_0=0$,

$$e_{t+1}\le Le_t+\epsilon,\qquad e_H\le\epsilon\sum_{j=0}^{H-1}L^j.$$

For $\epsilon=0.1$:

| amplification | bound after 1 step | after 3 steps | after 5 steps |
|---|---|---|---|
| $L=1$ | 0.1 | 0.3 | 0.5 |
| $L=2$ | 0.1 | 0.7 | 3.1 |

::: keypoint
Error can grow linearly, geometrically, or remain bounded when $L<1$. **Exponential growth is not universal.** The bound assumes the error and sensitivity limits hold along the rollout.
:::

### Version 3+ — plan with the model's uncertainty

::: lede
Version 3 still acts on the model's *mean*: it takes actions believed good in expectation, which provides no explicit incentive to seek information. It may still visit unfamiliar states.
:::

Split the error the way Lecture 0 split it, and the way Lecture 2 wrote it:

$$\E\lVert Y - \hat f(X)\rVert^2 \;=\; \underbrace{\E\lVert Y - f(X)\rVert^2}_{\sigma_s^2\;=\;\hl{\text{systemic noise}}} \;+\; \underbrace{\E\lVert f(X) - \hat f(X)\rVert^2}_{\sigma_m^2\;=\;\hl{\text{model uncertainty}}}$$

::: reveal
This decomposition assumes $f(X)=\E[Y\mid X]$ and zero-mean conditional noise for the evaluation data. The second term includes model error; sparse data can increase it, but no universal equality links error to data density.
:::

### Three ways to get $\sigma_m$, all of them borrowed

::: cols
::: col Ensembles
$$\begin{aligned}
p(\theta\mid\mathcal D)&\approx\tfrac1N\textstyle\sum_i\delta_{\theta_i}(\theta),\\
p(s'\mid s,a,\mathcal D)&=\int p(s'\mid s,a,\theta)p(\theta\mid\mathcal D)\,d\theta\\
&\approx\tfrac1N\textstyle\sum_i p(s'\mid s,a,\theta_i).
\end{aligned}$$

Train each $\theta_i$ on $\mathcal D_i$, sampled with replacement. ==Lecture 5's `ensemble-alarm`, in dynamics.==
:::
::: col.accent Gaussian processes
A GP provides a posterior distribution over transitions. Tracking changing dynamics requires an explicit time model, forgetting scheme, or other adaptation; Bayesian updating alone does not establish nonstationarity or robustness. ==Lecture 4's posterior, used as $f$.==
:::
:::

::: reveal
::: small
The third is a **Bayesian neural network** — put a distribution on the weights rather than a point estimate {p}(Blundell et al., 2015). All three answer the same question Lecture 2 asked about a coin: ==do not carry a number, carry a belief.== **PETS** combines neural-network ensembles with probabilistic outputs — a probabilistic *ensemble*, whose spread far from data is epistemic and whose per-member variance is aleatoric — and learns four continuous-control tasks in ==under 100 000 steps, or 100 trials==, where PPO, SAC and DDPG need one to two orders of magnitude more. {p}(Chua et al., 2018)
:::
:::

### Uncertain inputs require a distribution of rollouts
{sub: original model-based RL PDF pp. 38–41 · uncertainty propagates through the model}

After one prediction, a future state is uncertain. Feeding only its mean into a nonlinear model generally loses information:

$$\mathbb E[f(X)]\ne f(\mathbb E[X]).$$

For an illustrative $X$ equally likely to be $-1$ or $1$ and $f(x)=x^2$, the true next-state mean is **1**, while the plug-in mean prediction is $f(0)=\mathbf0$.

::: flow
- **Draw possible states** | represent the current uncertainty with particles
- **Propagate** | apply a sampled model and transition noise to each trajectory
- **Summarise** | compare distributions of predicted returns across action sequences
:::

The source uses Monte Carlo propagation and Gaussian moment approximations. An ensemble represents alternative models; transition noise represents variability within a model. Neither a particle count nor ensemble agreement alone certifies calibration.

### Version 4 — plan in a latent space

::: lede
Raw observations may be high-dimensional and partial. A useful latent representation should retain information needed to predict and control; it is not guaranteed to be low-dimensional or Markov.
:::

::: flow
- $p(o_t\mid s_t)$ | observation model — high-dimensional, *not* dynamic
- !$p(s_{t+1}\mid s_t,a_t)$ | transition model — low-dimensional, *dynamic*
- $p(r_t\mid s_t,a_t)$ | reward model
:::

::: reveal
Learn all three at once, with a deterministic encoder $q_\psi(s_t\mid o_t)=\delta\big(s_t = g_\psi(o_t)\big)$:

$$\max_{\phi,\psi}\frac1N\sum_{i,t}\Big[\log p_\phi(z_{t+1,i}\mid z_{t,i},a_{t,i})+\log p_\phi(o_{t,i}\mid z_{t,i})+\log p_\phi(r_{t+1,i}\mid z_{t,i},a_{t,i})\Big],\quad z_{t,i}=g_\psi(o_{t,i}).$$
:::

::: reveal
::: small
This is a simplified reconstruction-and-prediction objective, **not the full VAE ELBO**. A partially observed system generally needs history or a belief-state encoder, not one image alone. And the payload of *Embed to Control* is worth naming: it learns a latent space in which the dynamics are locally ==linear==, so Lecture 9's LQR applies to a robot controlled from pixels. {p}(Watter et al., 2015; Zhang et al., 2019)
:::
:::

### A model built to be planned in — convexity, learned

::: lede
Every version so far fits a model and hopes the planner copes. Turn the question round: what property should a learned model *have* so that planning inside it is easy?
:::

::: reveal
Lecture 1's answer, imposed on a network. An **input-convex** neural network is convex in its input by construction — every $W^{(z)}$ non-negative, every activation convex and non-decreasing — so the predictive-control problem

$$\min_{u_t,\dots,u_{t+T}}\;\sum_{\tau} f(x_{\tau-n_w},\dots,x_\tau) \quad\text{s.t.}\quad s_\tau = g(x_{\tau-n_w},\dots,u_\tau),\;\; \underline u \le u_\tau\le \bar u,\;\; \underline s \le s_\tau \le \bar s$$

is convex in the actions **only when the whole formulation preserves convexity**: appropriate monotone compositions, convex inequality constraints, and affine equalities or a valid reformulation. An ICNN dynamics model alone does not make nonlinear equality constraints convex. {p}(Amos, Xu & Kolter, 2017; Chen, Shi & Zhang, 2019)
:::

::: reveal
::: block The bill, paid in a real building
An input-convex recurrent model fits building dynamics as accurately as an ordinary RNN, and the controller built on it finds actions worth ==11.52% more energy saving== — while the ordinary RNN's decisions "vary dramatically". Later work ran the same controller on a real ETH building for a fortnight. ==Lecture 1's convexity was never a mathematical convenience; it can make the optimization tractable; predictive accuracy, feasibility, and real-system performance still need separate checks.==
:::
:::

### Check — why imagined rollouts stay short
{q: 2}

::: quiz Dyna-style methods train on rollouts imagined by the learned model. Why are those rollouts usually kept to a handful of steps?
- Longer rollouts are too expensive to compute
- =Because one-step model error compounds: each imagined step feeds the next, so trajectory errors can accumulate and amplify, especially outside the data
- Because the discount factor makes distant steps irrelevant anyway
- Because the replay buffer cannot hold long trajectories
A model accurate to within $\epsilon$ per step is not accurate to within $\epsilon$ over fifty steps — the errors feed forward and the imagined state leaves the region the model was ever fitted on. Short rollouts branched from **real** states keep the model working where it is trustworthy, which is the same discipline as Lecture 5's conservatism and Lecture 10's trust region.
:::

## Act 3 — differentiable control
{short: ACT 3, num: Act 3}

**Q3.** The model is fitted to predict. But it is *used* to decide. Fit it for what it is used for.

### Treat the planner as a policy class
{q: 3}

::: qstrip
:::

Every version in Act 2 fits $f_\theta$ by minimising $L\big(x_{t+1}, f_\theta(x_t,u_t)\big)$ — a loss that is ==task-independent and data-dependent==. Accuracy is therefore spent uniformly, and since the model class is wrong *somewhere*, prediction loss chooses where on the data's terms rather than the task's.

::: reveal
But $\mathrm{MPC}(\cdot)$ maps a state to an action, which is what a policy is. So fit its parameters end to end on a task loss — for instance, imitating an expert controller $\hat\theta$:

$$\mathcal{L}(\theta) \;=\; \E_x\Big[\big\lVert\, u_{1:T}(x;\theta) - u_{1:T}(x;\hat\theta) \,\big\rVert^2\Big]$$
:::

::: reveal
::: keypoint
The trained object is still the model, the execution is still planning — only the loss moves from ==prediction== to ==task.==
:::
:::

### Is the $\arg\min$ differentiable? Partially, yes

For a convex quadratic planning subproblem — an LQR, or a QP —

$$\tau^*_{1:T} = \argmin_{\tau_{1:T}} \sum_t \tfrac12 \tau_t^\top C_t \tau_t + c_t^\top \tau_t \quad\text{s.t.}\quad x_1 = x_{\text{init}},\;\; x_{t+1}=F_t\tau_t + f_t$$

With a locally unique optimum and a nonsingular KKT system (and a stable active set for inequalities), the solution is differentiable locally. Do not differentiate $\tau^*$; ==differentiate the conditions it satisfies==:

$$\mathcal L(\tau,\lambda) \;\Longrightarrow\; \text{KKT} \;\Longrightarrow\; \text{take differentials} \;\Longrightarrow\; \frac{\partial \tau^*}{\partial \theta}$$

::: reveal
::: small
The differentials give a *linear system* in $(d\tau, d\lambda)$ whose matrix is the KKT matrix already formed in the forward pass — so the backward pass is one more solve of the same structure. For LQR that solve ==is itself an LQR problem==: one Riccati sweep. {p}(Amos & Kolter, 2017; Amos et al., 2018)
:::
:::

::: reveal
And the saving is measurable: differentiating the fixed point costs ==about $1.5\times10^{-2}$ s over the horizons shown in the reported benchmark, not a horizon-independent complexity guarantee==, while unrolling the iLQR solver and backpropagating through every iteration costs $\approx 3$ s at 128 steps — two orders of magnitude, and growing.
:::

### Differentiate a solution — first do it with one number

A one-step planner chooses $u^*(\theta)$ by minimizing $\tfrac12(u-\theta)^2+\tfrac12u^2$.

The optimality condition is **$2u^*-\theta=0$**. Differentiate that condition:

$$2\frac{du^*}{d\theta}-1=0\quad\Rightarrow\quad\frac{du^*}{d\theta}=\frac12.$$

If the training goal is an expert action 1, let $\ell=\tfrac12(u^*-1)^2$. At $\theta=0$, $u^*=0$ and $d\ell/d\theta=(-1)(1/2)=-0.5$.

::: keypoint
We differentiate **the equation defining the solution**. The KKT matrix method is this same calculation with several variables and constraints.
:::

### A model fitted to be wrong in the right places

::: widget task-vs-prediction {"seed":5}
The same misspecified model class, fitted twice: once to minimise prediction error on the data, once to minimise the *task* loss by differentiating through the one-step planner. Move the task away from where the data was collected and the two fits separate — the task-fitted model becomes a ==worse predictor and a better controller==. Both losses are printed; neither is asserted.
:::

### Why it matters, and where the evidence is

- **Imitation learning.** Fit $\theta$ so that $\pi_\theta(s)\approx\hat\pi(s)$, inheriting a controller's structure while learning from demonstrations rather than from a hand-written cost.
- **Structure as inductive bias.** The constraint $x_{t+1}=f_\theta(x_t,u_t)$ is ==baked into the architecture==, so far less data is needed than for a generic policy network, and extrapolation improves.
- **Task-aligned models.** Accuracy lands where the task needs it, which is the direct repair of Act 2's "prediction-accurate, control-useless" failure.

::: reveal
::: block Measured, on a deliberately misspecified pendulum
The expert's dynamics lie outside the learner's model class. Against a plain system-identification baseline, the task-loss method ends with a ==*higher* system-ID loss (0.0025 vs 0.0020)== and a ==*lower* imitation loss (0.12 vs 0.19)==. A model fitted worse, in the way the task does not care about, controls better.
:::
:::

::: reveal
::: small
The honest caveat: for nonlinear problems this needs iLQR to reach a fixed point, and sometimes it does not — then you are back to unrolling the solver. The controller becomes ==a differentiable layer==, and like every layer it has conditions of use.
:::
:::

### Check — accurate is not the same as useful
{q: 3}

::: quiz Two learned models have the same one-step prediction error. One yields a much better policy. How is that possible?
- One was trained for longer, so it generalises better
- It is not possible — equal prediction error implies equal policy quality
- =Because prediction loss weights all state dimensions equally, while the policy only cares about the errors that change which action is best
- Because one model is stochastic and the other deterministic
A model can spend all its capacity predicting a visually large but decision-irrelevant part of the state and still be useless, while a cruder model that gets the decision-relevant structure right supports a good policy. This is why **task-aware** or value-equivalent model learning exists at all: the objective you train the model on should be the objective you use it for.
:::

## Act 4 — the lineages teach each other
{short: ACT 4, num: Act 4}

**Q4.** A learned model gives you a plan. How do you get a *policy* — and whose policy is it?

### Three routes from a model to a policy
{q: 4}

::: qstrip
:::

| How the model helps | Representative method | What the policy learner receives |
|---|---|---|
| **Differentiate predictions** | PILCO; the original Dreamer | Gradients of predicted future performance |
| **Supply a teacher** | Guided policy search | Actions from an optimized local controller |
| **Supply experience** | Dyna → MBPO | Simulated transitions for value/policy updates |

**Read the first two as connections to control.** Then follow Dyna → MBPO and compare Dreamer's latent imagination. Dreamer also trains a critic; these categories describe uses of a model, not mutually exclusive algorithm families.

::: keypoint
Ask **what the model produces and how that output updates the policy**. The detailed GPS/PLATO derivations are retained in the appendix.
:::

### Route 1 — backpropagate the model into the policy

Compose policy and model along the horizon and differentiate the whole chain:

$$D_\theta a_t=\partial_\theta\pi_\theta(s_t)+\partial_s\pi_\theta(s_t)D_\theta s_t,\qquad D_\theta s_{t+1}=f_sD_\theta s_t+f_aD_\theta a_t.$$

Starting from $D_\theta s_0=0$, propagate these sensitivities and sum $\nabla_\theta J=\sum_t(r_sD_\theta s_t+r_aD_\theta a_t)$, with discount factors when needed.

::: reveal
**PILCO** does this with a *probabilistic* model — a GP on the state difference $\Delta_t = x_t - x_{t-1}$ — and propagates the whole distribution forward by moment matching, so long-horizon planning carries the model's own uncertainty. Moment calculations are analytic for the selected GP and cost forms, but the Gaussian rollout distribution is an approximation. {p}(Deisenroth & Rasmussen, 2011)

::: small
The result is the data-efficiency headline of the field: real cart-pole swing-up *and* balance from ==17.5 seconds of interaction with the physical hardware==; a robotic unicycle in $\R^{12}$ from about 20 trials. Against the methods of the decade before it, roughly ==three orders of magnitude less interaction.==
:::
:::

### What limits direct policy optimization?

| Issue | Why it matters | What can help |
|---|---|---|
| **Model bias** | Optimizing predicted reward can exploit dynamics errors. | Real-data collection, uncertainty estimates and limited imagination horizons |
| **Long gradient chains** | Repeated Jacobian products can vanish or explode. | Suitable representations, shorter horizons and bootstrapped value estimates |
| **Uncertain predictions** | A probabilistic model can still be miscalibrated. | Check predictions where the current policy actually visits |

PILCO propagates uncertainty in a GP model. Dreamer later learns a latent state model and combines imagination with a critic. Neither removes the need to learn useful dynamics from real experience.

::: keypoint
Direct gradients are one design choice. Score-function policy gradients avoid differentiating the dynamics but introduce their own variance; neither estimator is uniformly better in every problem.
:::

### Route 2 — let optimal control teach

::: lede
Lecture 1 wrote an optimisation. Lecture 9 added the dynamics as a constraint. Add one more constraint and you have this lecture.
:::

::: table center
| | objective | dynamics constraint | policy constraint |
|---|---|---|---|
| **Optimisation** *(Lec 1)* | $\min_u c(u)$ | — | — |
| **Optimal control** *(Lec 9)* | $\min_{u,x}\sum_t c(x_t,u_t)$ | $x_{t+1} = f(x_t,u_t)$ | — |
| ==**+ imitation** *(Lec 11)*== | $\min_{u,x,\theta}\sum_t c(x_t,u_t)$ | $x_{t+1} = f(x_t,u_t)$ | ==$u_t = \pi_\theta(x_t)$== |
:::

::: reveal
::: small
Three rows, three lectures. The middle row constrains the trajectory to be *physical*; the bottom row constrains it to be ==reproducible by a policy==. Everything in guided policy search follows from that one extra line.
:::
:::

### Route 3 — imagine the data

::: lede
The simplest reunion: generate transitions with the learned model and use them in a compatible value or policy learner. The update formula can stay the same even though the data quality changes.
:::

::: block Dyna — online Q-learning that performs model-free RL with a model
1. From $s$, pick $a$ by an exploration policy; observe $(s,a,s',r)$
2. Update the model $\hat p(s'\mid s,a)$ and $\hat r(s,a)$
3. $Q(s,a)\leftarrow Q(s,a)+\alpha\big[r+\gamma\max_{a'}Q(s',a')-Q(s,a)\big]$ &nbsp;&nbsp;*(from real experience)*
4. Repeat $k$ times: sample $(s,a)$ from the buffer, ==simulate $s'\sim\hat p$, $r=\hat r$==, and apply the same update &nbsp;&nbsp;*(from imagined experience)*
:::

::: reveal
Line 3 is Lecture 8, untouched. Line 4 is a sampled planning backup on an estimated model, extending Lecture 7's planning idea. ==The two lineages meet inside a single loop, four lines apart.== {p}(Sutton, 1990)

::: small
Only short rollouts are needed — as few as one step — and the algorithm still sees diverse states, because the imagined transitions start from every state in the buffer. MBPO develops this idea with **short policy rollouts branched from real states** and an off-policy learner. MVE instead uses model rollouts in value-target construction. The length and the use of the imagined sequence both matter.
:::
:::

### Dyna — the same update from two different sources

Let $Q(s,a)=2$, $\alpha=0.2$, $\gamma=0.9$, and next maximum value 5.

| source | reward | target | updated estimate from 2 |
|---|---|---|---|
| real transition | 1 | $1+0.9(5)=5.5$ | 2.70 |
| correct imagined transition | 1 | 5.5 | 2.70 |
| optimistic model error | 3 | $3+0.9(5)=7.5$ | 3.10 |

::: keypoint
The update cannot tell whether its label came from reality or a model. Extra planning saves real interaction **only insofar as the imagined information is useful**. It can also repeat a mistake many times.
:::

### Real steps against imagined steps

::: widget dyna-imagination {"seed":9}
Sutton's maze, learned three ways. Raise $k$ — the number of imagined updates per real step — and the number of real environment steps needed collapses. Then corrupt a fraction of the learned model's transitions and raise $k$ again: past a point the imagined updates ==stop buying anything at all==, and the heavily-planning agent ends up behind the one with no model. The gain and its price, on one screen.
:::

### The hazard, admitted by the method's own authors

::: cols
::: col.red What breaks
Imagination rollouts "can suffer from ==severe bias when the learned model is inaccurate==". In continuous control it proved "very difficult to train nonlinear neural network models for the dynamics that would actually improve the efficiency of Q-learning when used for imagination rollouts."

The fix that worked was to give up expressiveness: ==iteratively refitted time-varying linear dynamics==. {p}(Gu et al., 2016)
:::
::: col What is worth keeping
The same paper answers Lecture 8's parting wall from the other side. Write $Q$ as a value plus a quadratic advantage,

$$Q(x,u) = V(x) - \tfrac12\big(u-\mu(x)\big)^\top P(x)\big(u-\mu(x)\big)$$

with $P(x)\succ0$, the unique maximizing action is **$\mu(x)$**, analytically. The continuous $\arg\max$ is solved by ==assuming LQR structure==: Lecture 9 answering Lecture 8 directly.
:::
:::

### MBPO — branch short rollouts from real data
{sub: Janner et al. · NeurIPS 2019 · Dyna's idea with a continuous-control learner}

::: flow
- **Fit** | train a dynamics ensemble on real transitions
- **Branch** | start from states sampled from real replay
- **Imagine** | run the current policy for a short horizon
- !**Improve** | train SAC with real and model-generated transitions
:::

Keep collecting real experience to update the model. The synthetic buffer expands the learner's training opportunities; it does not add new measurements of the environment.

**Count the trade-off:** 100 real starting states produce 100 synthetic transitions at horizon 1, or 500 at horizon 5. The second option uses five times as many predictions, with more opportunities for compounding error. These are illustrative budgets, not recommended settings for every task.

::: keypoint
The important change is **short, branched imagination**, not simply more simulation. Choose model use in light of its error and policy shift. [When to Trust Your Model](https://arxiv.org/abs/1906.08253)
:::

### Dreamer — learn feedback inside a latent world model
{sub: Hafner et al. · ICLR 2020 · a conceptual redraw of the learning loop}

The observation may be an image. Infer a compact model state from the **observation history**, then predict future latent states and rewards under the actor's actions.

::: figure dreamer-learning-loop | 1000
The model state summarizes recurrent memory and stochastic latent information. Inferring it from observations differs from predicting it without future observations.
:::

::: keypoint
Lecture 3 supplies hidden-state inference, Lecture 6 supplies latent representation learning, and Lecture 10 supplies actor–critic learning. Dreamer joins them inside one feedback loop. [Dream to Control](https://arxiv.org/abs/1912.01603)
:::

### What imagination teaches — calculate one target
{sub: a two-step illustration of bootstrapping, not the full Dreamer loss}

From an inferred state, the actor and model predict rewards **2, then 1**. The critic assigns value **4** to the final imagined state. With $\gamma=0.9$ and no termination:

$$\widehat G=2+0.9(1)+0.9^2(4)=6.14.$$

| Component | What it learns from this computation |
|---|---|
| **Critic** | Predict future return; 6.14 is one possible bootstrapped training target. |
| **Actor** | Prefer actions with higher predicted return. The original continuous-action Dreamer propagates gradients through imagined dynamics. |
| **World model** | Fit observed trajectories, rewards and representations from real replay; imagined reward is not a new ground-truth label. |

::: keypoint
The paper combines different rollout lengths through $\lambda$-returns. A convincing imagined return still depends on model and critic accuracy; acting in the real environment supplies the next correction.
:::

### Three uses of a model — compare the decision loops

| | PETS / MPC | MBPO | Dreamer |
|---|---|---|---|
| Model output | predicted trajectories | short synthetic transitions | latent trajectories and rewards |
| How actions improve | search candidate sequences | off-policy SAC updates | actor–critic learning in imagination |
| At deployment | re-plan, execute the first action | act with the learned policy | infer model state, then act with the learned policy |
| Key risk | plans exploit model error | synthetic data bias value learning | latent predictions bias actor and critic |

PETS emphasizes probabilistic ensembles and trajectory sampling. Dreamer does not need to search action sequences at every real step: the actor has already learned from imagined futures.

::: keypoint
All three use a learned model, but they spend computation in different places. Compare real interaction cost, training/planning cost and performance under the same evaluation conditions.
:::

### From Dreamer to DreamerV3 — read the evidence at the right level
{sub: the 2020 paper explains the principle; the 2025 paper tests broader robustness}

| Read | Main question | Evidence or mechanism to examine |
|---|---|---|
| **Dreamer — ICLR 2020** | Can an actor learn from compact imagined futures? | Latent dynamics, predicted rewards and value-based imagination |
| **DreamerV3 — Nature 2025** | Can the recipe work across diverse domains with fixed hyperparameters? | Normalization, balancing and transformations; broad empirical evaluation |

The 2025 paper reports results across **more than 150 tasks in eight domains** and collecting diamonds in Minecraft without human demonstrations or curricula. This is evidence about the evaluated settings; it does not establish optimality or success on every new control problem.

::: keypoint
Learn the original architecture before studying the later implementation details. Versions differ: DreamerV3 uses a score-function actor estimator for both continuous and discrete actions. [Nature paper](https://www.nature.com/articles/s41586-025-08744-2)
:::

### The reunion, and the limits

A learned model can support **planning, simulated experience or policy learning in imagination**. These operations connect the course's value and control methods without making them identical.

| Benefit to test | Limitation to check |
|---|---|
| Fewer costly real interactions | Fitting the model also consumes data and computation. |
| More opportunities to improve a policy | Repeated synthetic experience can reinforce the same model error. |
| Compact representations for image observations | A useful latent state must retain information needed for future decisions. |
| Faster action selection with a trained actor | Training performance need not transfer to new states or changed dynamics. |

::: keypoint
PETS plans; MBPO supplies short simulated transitions; Dreamer learns an actor and critic in latent imagination. **Measure actual control performance**, with interaction and computation budgets stated.
:::

### And design optimisation returns — bilevel

::: lede
Lecture 1 optimised a wind-farm layout with a trust region, and Lecture 5 designed from a fixed dataset. Neither could touch the *controller*. Differentiable control closes that loop.
:::

Many real problems are **bilevel** — an upper-level *design* $p$ wrapping a lower-level *control* problem:

$$\min_{p}\ \sum_t \mathcal L\big(x_{t+1}, u^*_t; p\big) \quad\text{s.t.}\quad u^*_{0:T-1} = \argmin_{u}\sum_t \mathcal L\big(x_{t+1},u_t;p\big),\;\; x_{t+1}=f(x_t,u_t;p)$$

::: reveal
Turbine layout with the yaw controller that will run on it; furnace geometry with the recipe that will heat it. Act 3 supplies the missing derivative: ==differentiate the optimal control through to the design, and optimise both together== rather than designing first and controlling afterwards.
:::

::: reveal
::: small
The evidence is already in the room. An input-convex model inside an MPC loop saved ==11.52%== of a building's energy and then ran on a real one; the differentiable-MPC literature names ==HVAC control and furnace control== as its motivating applications. Lecture 1's `trust-region` widget solved the wind-farm layout by a staircase of convex problems with the controller held fixed. ==Here the controller stops being fixed.==
:::
:::

### Check — what is left to take away
{q: 4}

::: quiz Lecture 11 has the model back, both lineages rejoined, and planning available. What single assumption does Lecture 12 remove?
- That the model can be learned accurately
- That the reward function is known
- That the state is fully observed
- =That the agent may interact with the environment at all — the data is a fixed log, gathered by someone else
Every method so far, model-based or model-free, could go and **try something**. Remove that and the whole safety net goes with it: a mistaken belief about an untried action can never be corrected by trying it. The static half of the course met this exact predicament in Lecture 5, and the answer turns out to be the same one.
:::

## Closing
{short: CLOSING}

### Where we are — Part IV complete

::: table center
|   | **OR / Dynamic Programming** | **Control Theory** |
|---|---|---|
| **Model-based** | MDP & DP *(Lec 7 ✓)* | Optimal Control *(Lec 9 ✓)* |
| **Data-driven** | Value-Based RL *(Lec 8 ✓)* | Policy-Based RL *(Lec 10 ✓)* |
| | ==**Model-Based RL** *(Lec 11 ✓)* — the four, reunited on a learned model== | |
:::

::: reveal
::: small
We can decide statically (Ch 1–6) and dynamically (Ch 7–11); with a model and without; by searching values and by producing policies; and now by ==learning the model== so that all of it can collaborate.
:::
:::

### What we hand on

::: flow
- !**A learned model + planning** | replay it, plan in it, re-plan every step
- !**Bilevel design** | differentiate control through to the design
- !!**And model bias** | the price, still unpaid
:::

::: reveal
Every repair in this lecture depended on one privilege we never questioned: when the model was wrong, ==we could go and collect the transition that proved it==. Version 2 aggregated data. Version 3 re-planned from a fresh measurement. Dyna and MBPO mixed real and imagined experience; Dreamer learned its world model from real trajectories.
:::

::: reveal
::: keypoint
Take that away — no new samples, ever — and model bias stops being a nuisance and becomes ==the whole problem.==
:::

::: small
That is Lecture 12, offline RL. Its answer will be this lecture's learned model, made ==pessimistic==: penalise the reward by the model's own uncertainty, $\tilde r(s,a) = r(s,a) - \lambda\,u(s,a)$, and plan in that penalised MDP. {p}(MOPO, Yu et al., 2020; MOReL, Kidambi et al., 2020) This is one defense; Lecture 12 also covers policy constraints, conservative values, and evaluation.
:::
:::

### Model-free RL learned to act by forgetting the model. Model-based RL *learns it back.*
{layout: standout}

To plan with it, to control through it, and to let dynamic programming and optimal control — the course's two parents — finally teach each other.

### Questions?
{layout: standout}

The arc of Part IV in three moves: a model **given** (7, 9), a model **deleted** (8, 10), a model **learned and shared** (11). What remains is to give up the last luxury — the right to try something and see what happens.

## Appendix — backup slides
{short: APPENDIX}

Complete arguments, kept out of the narrative.

### Backup 1 — differentiating the QP / LQR $\arg\min$, in full

For a convex QP planning subproblem $\min_z \tfrac12 z^\top Q z + q^\top z$ subject to $Az=b$, the optimum is characterised by its KKT system:

$$Qz^* + q + A^\top\nu^* = 0,\qquad Az^* - b = 0$$

Rather than differentiate $z^*$ directly, take **differentials** of both conditions:

$$dQ\,z^* + Q\,dz + dq + dA^\top\nu^* + A^\top d\nu = 0,\qquad dA\,z^* + A\,dz - db = 0$$

$$\Longrightarrow\quad \begin{bmatrix} Q & A^\top\\ A & 0\end{bmatrix}\begin{bmatrix} dz\\ d\nu\end{bmatrix} = -\begin{bmatrix} dQ\,z^* + dq + dA^\top\nu^*\\ dA\,z^* - db\end{bmatrix}$$

Each parameter perturbation has its own right-hand side; factorization can be reused. For a scalar outer loss, an adjoint solve yields all parameter gradients. Write $[d_z;d_\nu]$ for the solution of the transposed KKT system against **$[-\nabla_{z^*}\ell;0]$**. Then the chain rule gives $\nabla_Q\ell = \tfrac12(d_z z^\top + z\,d_z^\top)$, $\nabla_q\ell = d_z$, $\nabla_A\ell = d_\nu z^\top + \nu\,d_z^\top$ and $\nabla_b\ell = -d_\nu$.

::: small
**LQR:** the structured linear solve can reuse Riccati factorizations. **Nonlinear MPC:** differentiate a converged local approximation, with a stable active set and nonsingular KKT matrix. If the solver has not converged, differentiating its iterations describes that finite algorithm, not an exact optimum. {p}(OptNet; Differentiable MPC)

:::

### Backup 2 — guided policy search, the constrained program

**Objective.** Minimise trajectory cost while forcing the trajectory distribution to agree with the policy:

$$\min_{\theta,\,p(\tau)}\ \E_{p(\tau)}\Big[\textstyle\sum_t c(x_t,u_t)\Big]\quad\text{s.t.}\quad D_{\mathrm{KL}}\big(p(x_t)\pi_\theta(u_t\mid x_t)\,\big\|\,p(x_t,u_t)\big)=0\ \ \forall t$$

**Lagrangian and alternation.** Form $\mathcal L_{\mathrm{GPS}}(\theta,p,\lambda) = \E_{p(\tau)}[\ell(\tau)] + \sum_t \lambda_t D_{\mathrm{KL}}\big(p(x_t)\pi_\theta(u_t\mid x_t)\,\|\,p(x_t,u_t)\big)$ and minimise by turns:

1. **w.r.t. $p(\tau)$** — trajectory optimisation by iLQG under time-varying linear-Gaussian dynamics; the LQR structure makes the local controller $p(u_t\mid x_t)=\mathcal N(K_t(x_t-\hat x_t)+k_t+\hat u_t,\Sigma_t)$ fall out automatically;
2. **w.r.t. $\theta$** — supervised regression: minimise the weighted sum of KL divergences between $\pi_\theta$ and the local controllers;
3. **duals $\lambda$** — dual gradient ascent (in practice often *scheduled* rather than updated).

::: small
**Why the dual step is cheap.** With $x^*(\lambda)=\argmin_x \mathcal L(x,\lambda)$ and $g(\lambda)=\mathcal L(x^*(\lambda),\lambda)$, the chain rule gives $dg/d\lambda = (d\mathcal L/dx^*)(dx^*/d\lambda) + d\mathcal L/d\lambda$, and the first term vanishes because $d\mathcal L/dx^*=0$ at the argmin. So $dg/d\lambda = d\mathcal L/d\lambda$ evaluated at $x^*$ — no derivative through the inner solve is needed. That is the same envelope argument Act 3 exploits, used there in the case where the derivative through the solve *is* wanted.

**Why it is sample-efficient.** Time-varying linear-Gaussian dynamics are a strong but reasonable *local* assumption for a physical system, so each trajectory is optimised with far fewer samples than general model-free search — the return on injecting control-theoretic structure.
:::

### Backup 3 — the four versions of model-based planning, side by side

| | data | planning | fixes | still broken |
|---|---|---|---|---|
| **V1** Model building + open-loop planning | one batch from $\pi_0$ | plan once, execute all | nothing | $p_{\pi_f}\neq p_{\pi_0}$ |
| **V2** Iterative model building | aggregate $\pi_f$'s own visits | plan once, execute all | the *training* distribution | a mistake mid-plan is never corrected |
| **V3** + MPC | aggregate; refit every $N$ steps | plan, execute the **first** action, re-plan | mid-plan errors; short horizons suffice | no explicit information-seeking incentive |
| **V3+** + model uncertainty | as V3 | plan against an ensemble / GP posterior | over-confidence off-distribution | cost, and the horizon still compounds |
| **V4** + latent space | observations $(o,a,o')$ | plan in the learned latent state | high-dimensional, partial observations | everything above, plus representation error |

::: small
**Propagating uncertainty through a horizon.** If the state input is itself uncertain, $x\sim\mathcal N(\mu_x,\Sigma_x)$, then $p(f(x)\mid \mu_x,\Sigma_x) = \int p(f(x)\mid x,\mathcal D)\,p(x)\,dx$, which is intractable and is handled either by Monte-Carlo — sample $x^t\sim p(x)$ and average $p(f(x^t)\mid x^t,\mathcal D)$ over $T$ particles — or by computing moments analytically where possible and approximating the result as Gaussian, which is PILCO's choice. Rolling a large number of such trajectories and taking their mean and standard deviation gives the fan of predictions that widens with horizon: ==compounding uncertainty, drawn.==
:::

### Backup 4 — the sample-efficiency versus model-bias trade, made precise

**The gain.** A learned model can be queried without environment interaction, so one real transition informs the value or policy at *many* imagined states. Empirically this cuts the required real samples by orders of magnitude — decisive whenever interaction is expensive, slow or dangerous: robots, chemical processes, buildings, patients.

**The hazard.** Planning trusts $f_\theta$. Where $f_\theta$ is wrong the planner optimises a fiction, and errors **compound** over the horizon because each step's error is the next step's input. This is the dynamic cousin of Lecture 5's overestimation trap: an optimiser exploiting a model's blind spots.

### Backup 4b — the five mitigations, and where each appeared
{fill: top}

| mitigation | mechanism | where |
|---|---|---|
| short planning horizons | fewer compositions of the model with itself | Act 2, V3 |
| re-plan every step | replace predicted inputs with measured ones | Act 2, V3 |
| ensembles and GP posteriors | plan pessimistically where the model disagrees with itself | Act 2, V3+ |
| task loss instead of prediction loss | be accurate where the task needs it | Act 3 |
| structural inductive bias | convexity, linear latents, local linear-Gaussian models | Acts 2 and 4 |

::: small
The through-line of the whole course: ==respect the model's uncertainty, or it will be weaponised against you.== Lecture 5 said it about a surrogate over designs; this lecture says it about a surrogate over dynamics; Lecture 12 will say it once more, about a value function, with the escape hatch of fresh data closed.
:::

### Guided policy search — solve it by alternation

The constrained program, with an augmented Lagrangian:

$$\bar{\mathcal L}(\tau,\theta,\lambda) = c(\tau) + \sum_t \lambda_t^\top\big(\pi_\theta(x_t)-u_t\big) + \sum_t \rho_t\lVert\pi_\theta(x_t)-u_t\rVert^2$$

::: flow
- !**1 · Trajectory optimisation** | $\tau^*\leftarrow \min_\tau \bar{\mathcal L}$ — via iLQR
- **2 · Supervised fit** | $\theta^*\leftarrow \min_\theta \bar{\mathcal L}$ — via SGD
- **3 · Dual update** | $\lambda \leftarrow \lambda + \alpha\, d\bar{\mathcal L}/d\lambda$
:::

::: reveal
Step 1 is Lecture 9. Step 2 is plain supervised learning. Step 3 is dual gradient ascent — and its derivation uses the same envelope argument as Act 3: at the inner optimum $d\mathcal L/dx^*=0$, so ==the gradient through the $\arg\min$ collapses to a single term.==
:::

::: reveal
::: keypoint
And the direction of teaching is not one-way: ==the optimal-control teacher adapts to the learner==, avoiding actions the student cannot mimic.
:::
:::

### What makes it work — and where the trust region reappears

In the stochastic form, the local controller is constrained to stay near the previous one:

$$\min_p \sum_t \E_{p(x_t,u_t)}\big[c(x_t,u_t)\big] \quad\text{s.t.}\quad \hl{D_{\mathrm{KL}}\big(p(\tau)\,\|\,\bar p(\tau)\big)\le\epsilon},\quad p(u_t\mid x_t)=\pi_\theta(u_t\mid x_t)$$

$$p(u_t\mid x_t) = \mathcal N\big(K_t(x_t-\hat x_t) + k_t + \hat u_t,\;\Sigma_t\big)$$

::: reveal
Look at the second line. The local policy ==*is* Lecture 9's $u=Kx$==, with a Gaussian around it — which is why optimising the trajectory hands you the local controller for free, out of the LQR structure.

::: small
And the first line is ==Lecture 1's trust region, third appearance==: a constraint that keeps each step inside the region where the local model is believable. Lecture 1 measured that region in $\lVert x - x^{(k)}\rVert$, Lecture 10 in KL between policies, and here in KL between *trajectory distributions*. Same ratio-and-restrict logic every time.
:::
:::

::: reveal
::: small
Because time-varying linear-Gaussian dynamics are a strong and reasonable *local* assumption for a physical system, each trajectory is optimised from very few samples: ==5 to 20== where REPS, CEM and RWR need 100 to 800, and nine real manipulation tasks — stacking lego, threading a ring, screwing a bottle cap — converge in about ==40 samples each==. Policy search has become supervised learning against an oracle. {p}(Levine & Abbeel, 2014; Levine et al., 2016)
:::
:::

### The teacher that watches the student — PLATO

::: lede
The naive version of route 2 collects a dataset from an MPC expert and fits the policy to it. That ignores the one thing imitation always breaks on.
:::

The states visited by the *teacher* are not the states visited by the *learner*, so nothing guarantees long-horizon performance. **PLATO** repairs it by pulling the teacher toward the student at every step:

$$\pi^t_\lambda(u\mid x_t,\theta) \leftarrow \min_\pi\; J_t(\pi\mid x_t) + \lambda\, D_{\mathrm{KL}}\big(\pi(u\mid x_t)\,\|\,\pi_\theta(u\mid o_t)\big)$$

::: reveal
==The only difference from ordinary MPC is that KL term.== It encourages the teacher’s actions and state distribution to stay closer to the student’s, while still reacting competently to surprises the half-trained student could not survive.

::: small
Two practical consequences. The MPC teacher may use ==full state== at training time while the final policy uses ==only the observations== the robot will have at test time — the input-remapping trick. And in flight experiments the crash count stays near zero throughout training, where DAgger's saturates: these are empirical safety results, not a guarantee of zero crashes in other settings. {p}(Kahn et al., 2017)
:::
:::
