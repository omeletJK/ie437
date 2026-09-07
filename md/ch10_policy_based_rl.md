---
ch: 10
title: Policy-Based Reinforcement Learning
subtitle: Optimal control with the dynamics replaced by data
tagline: Lecture 9 derived feedback from a model; this lecture learns a feedback policy from experience.
blurb: >-
  Lecture 9 with the dynamics replaced by data. Optimise the policy directly by gradient ascent,
  cut the variance with a baseline, and control the size of policy updates — the machinery
  that PPO is built from.
course: IE437 · Data-Driven Decision Making and Control
author: Jinkyoo Park
institute: KAIST
lineage: B
lineage_here: dd-B
cube:
  stages: dynamic
  model: data-driven
  agents: single agent
crossing: model
cube_from:
  model: model-based
inherits: optimal control, with the dynamics f still given (Lecture 9)
handoff: the trust-region machinery (Lecture 11)
questions:
  - Gradient?
  - Variance?
  - Continuous?
  - Safe step?
---

### Policy-Based Reinforcement Learning
{layout: title}

## The handoff — delete the dynamics
{short: HANDOFF}

Lecture 9 owned the dynamics. This lecture takes them away and keeps the controller.

### Where we are — the control lineage, made data-driven

::: tracker
:::

::: lineage dd-B
:::

::: small
We stay in the same cell of the big map — ==single agent, multiple stages== — and move along **one axis only**: from a system whose $f$ we are *handed* to one we can only *sample*. This is the move Lecture 8 made on the other column, performed now on ours. ==The 2×2 closes here.==
:::

::: reveal
What Lecture 9 gave us, stated as one object — the ==feedback law==:

$$u = \gamma(t,x), \qquad\text{and in the one closed form,}\qquad u = -Kx, \quad K = R^{-1}B^\top P$$
:::

::: reveal
::: small
And three ways to obtain it — HJB, Riccati, Pontryagin. They provide verification, special-case solutions, or necessary conditions. All three take ==$f$ (or $A,B$) as an input==, and we no longer have it.
:::
:::

### What we keep, and what we lose

::: keypoint
The feedback law survives. ==The dynamics do not.==
:::

::: reveal
Everything else follows from removing $f$. Three things break the moment it vanishes:

- **The solvers.** HJB is a PDE *in* $f$; the Riccati equation is built from $A$ and $B$; Pontryagin needs $\partial_x f$ to run the costate backwards. They cannot be evaluated directly without the required model.
- **The pointwise minimisation.** Every one of them ends in $\min_{u\in U}\{\,g + \partial_x V\cdot f\,\}$ — a search over a continuum that needs $f$ to evaluate. Lecture 8 met the same object as $\max_{a'}Q(s',a')$ and could not do it either.
- **The rollout.** We cannot integrate $\dot x = f$ to see what a candidate controller *would* do. We can only run it and watch.
:::

::: reveal
::: keypoint
So stop trying to compute the best action. ==If you cannot search for the best action, learn to output it.==
:::
:::

### The translation table — optimal control, learned
::: lede
Every object of Lecture 9 has a data-driven counterpart. Keep this in sight all lecture.
:::

| Lecture 9 (optimal control) | Lecture 10 (policy-based RL) | What replaces the model |
|---|---|---|
| value field $V(t,x)$, the HJB equation | critic $V_w$, $Q_w$ | a *learned* value |
| feedback law $u=\gamma(t,x)$, $u=-Kx$ | actor $\pi_\theta(a\mid s)$ / $\mu_\theta(s)$ | a *learned* controller |
| known dynamics $\dot x = f(x,u)$ | sampled transitions $(s,a,r,s')$ | the environment itself |
| Pontryagin's costate, trajectory optimisation | REINFORCE, trajectory sampling | the score-function trick |
| solve Riccati / HJB | gradient ascent on $J(\theta)$ | stochastic optimisation |
| controllability of $(A,B)$ | sufficient exploration | a reachability assumption, either way |

::: reveal
::: small
Read column 3. Nothing here is a new *principle* — it is Lecture 9's programme with the one piece we no longer own quietly swapped out. ==Policy gradient is optimal control with $f$ deleted and replaced by data.== DDPG's actor $\mu_\theta(s)$ is the learned cousin of LQR's gain $K$; REINFORCE also uses trajectories, but its score-function gradient is a different mathematical argument from Pontryagin’s costate equations.
:::
:::

### One honest detour — why not identify the system?

The most literal idea, and the exact rhyme of the detour Lecture 8 took: estimate the dynamics from data, then run Lecture 9 unchanged.

$$(\hat A,\hat B) = \argmin_{A,B}\ \sum_t \big\lVert x_{t+1} - Ax_t - Bu_t \big\rVert^2 \quad\Longrightarrow\quad \text{solve the Riccati equation for } \hat K$$

This is ==system identification==, it is the oldest idea in adaptive control, and it is perfectly valid.

::: reveal
But notice the same waste Lecture 8 noticed. To act we only ever need the controller — $m\times n$ numbers, or one network — yet here we first estimate a *whole dynamics model*, and then we act as though it were true. Why estimate $f$ at all,

::: keypoint
when we could estimate ==the controller directly?==
:::
:::

::: reveal
::: small
That question — *skip the model, learn the thing that acts* — is the entire policy-based programme, and it is Lecture 8's question with $Q^*$ replaced by $\pi_\theta$. (The model comes back, deliberately and learned, in Lecture 11.)
:::
:::

### The roadmap — four questions

::: lede
One question per Act. This strip returns at every transition — watch the highlight move.
:::

::: qstrip 0
:::

- **Q1 — How do we get a gradient without $f$?** The ==score-function trick==: the dynamics enter the trajectory's law and leave its log-derivative. {p}(Williams, 1992; Sutton et al., 2000)
- **Q2 — Why is the estimate so noisy?** Causality, baselines, the advantage — and the ==actor–critic==. {p}(Mnih et al., 2016)
- **Q3 — How do we handle continuous control?** ==DPG / DDPG==: the actor climbs $\nabla_a Q$ instead of searching it. {p}(Silver et al., 2014; Lillicrap et al., 2015)
- **Q4 — How large a step dare we take?** Trust regions in policy space: ==TRPO== and ==PPO==. {p}(Schulman et al., 2015; 2017)

### Learning route — make a good action more likely

**Bring:** log-likelihood and expectation (Lecture 2), feedback (Lecture 9), and TD targets (Lecture 8).

::: flow
- **REINFORCE** | reward weights a log-probability gradient
- **Baseline / critic** | compare an action with its alternatives
- **Deterministic actor** | follow a critic's action gradient
- !**TRPO / PPO** | limit incentives for large updates
:::

**Core goal:** calculate one policy update and one clipped objective. Occupancy measures, the exact optimal baseline, and the Fisher-matrix derivation are in the appendix.

We use **finite episodic, undiscounted returns** for the main score-function examples. When discounting is used, its weights must be retained consistently. Reward $r_{t+1}$ follows action $a_t$.

## Act 1 — a gradient without the model
{short: ACT 1, num: Act 1}

**Q1.** The thing we must differentiate is an expectation over trajectories, and the dynamics are inside it.

### The objective, and a gradient we cannot see
{q: 1}

::: qstrip
:::

Parameterise a stochastic policy $\pi_\theta(a\mid s)$ and maximise the expected return:

$$J(\theta) = \E_{\tau\sim\pi_\theta}\big[R(\tau)\big], \qquad \theta \leftarrow \theta + \alpha\,\nabla_\theta J(\theta)$$

The trouble is where the parameter lives. It is not in the integrand; it is in the ==distribution being integrated against==, and that distribution contains the dynamics:

$$p_\theta(\tau) = \mu(s_0)\prod_{t=0}^{T-1} \pi_\theta(a_t\mid s_t)\,\hl{P(s_{t+1}\mid s_t,a_t)}$$

::: reveal
::: block The naive answer, and why it is not enough | the source deck's own first attempt
Perturb one coordinate at a time and difference: $\;\partial J/\partial\theta_k \approx \big(J(\theta+\epsilon u_k)-J(\theta)\big)/\epsilon$. It can estimate local changes even without an analytic derivative — and it costs ==one full batch of rollouts per parameter==. For a large network, coordinatewise finite differences are prohibitively expensive; random-direction methods offer a different trade-off.
:::
:::

### The score-function trick — the dynamics vanish

One identity does all the work: $\;\nabla p = p\,\nabla \log p$. It turns the gradient of an expectation into an expectation of a gradient:

$$\nabla_\theta \E_{\tau\sim p_\theta}[R(\tau)] = \int \nabla_\theta p_\theta(\tau)R(\tau)\,d\tau = \int p_\theta(\tau)\,\nabla_\theta \log p_\theta(\tau)\,R(\tau)\,d\tau = \E_{\tau\sim p_\theta}\big[\nabla_\theta\log p_\theta(\tau)\,R(\tau)\big]$$

::: reveal
Now expand that log. The product becomes a sum, and every term without $\theta$ differentiates to zero:

$$\nabla_\theta\log p_\theta(\tau) = \underbrace{\nabla_\theta\log\mu(s_0)}_{=\,0} + \sum_t \nabla_\theta\log\pi_\theta(a_t\mid s_t) + \underbrace{\sum_t\nabla_\theta\log \hl{P(s_{t+1}\mid s_t,a_t)}}_{=\,0} \;=\; \sum_{t}\nabla_\theta\log\pi_\theta(a_t\mid s_t)$$
:::

::: reveal
::: keypoint
Their **log-density derivatives** are zero when they do not directly depend on $\theta$. They still affect which trajectories occur and therefore the expected gradient.
:::

::: small
This is the precise sense in which $f$ is "deleted": we never needed it. Where Lecture 9 *solved* the dynamics, here they simply drop out of the algebra — the policy's own log-probability is all that is left. We still *live* in the dynamics; we just never differentiate through them.
:::
:::

### Reading the estimator — it is weighted maximum likelihood

Put the two halves together and the whole of Act 1 is one line:

$$\nabla_\theta J(\theta) = \E_{\tau\sim\pi_\theta}\Big[\underbrace{\Big(\textstyle\sum_t \nabla_\theta\log\pi_\theta(a_t\mid s_t)\Big)}_{\hl{\nabla_\theta J_{\mathrm{ML}}(\theta)} \;-\; \text{make this trajectory likelier}}\ \underbrace{\Big(\textstyle\sum_t r_{t+1}\Big)}_{\text{how good it was}}\Big]$$

::: reveal
The first factor, alone, is the gradient of the log-likelihood of the trajectory — ==the maximum-likelihood gradient of Lecture 2==, the direction that would make *this* trajectory more probable. The return simply weights it.

- **Increase** the likelihood of trajectories with large accumulated reward;
- **decrease** likelihood for negative weights. A small positive return still has a positive weight; a baseline lets us compare with typical performance.
:::

::: reveal
::: keypoint
Policy gradient is ==imitation of your own better moments==, reweighted by how well they went.
:::

::: small
There is no $\argmax$ anywhere in that sentence, and no model. It is also, exactly, Lecture 6's move — a generative model trained to emit the *good* samples — one axis over.
:::
:::

### The policy gradient theorem, and REINFORCE

For $J(\theta)=\E[\sum_{t=0}^{T-1}\gamma^t r_{t+1}]$, define $G_t=\sum_{k=t}^{T-1}\gamma^{k-t}r_{k+1}$. Then

$$\nabla_\theta J=\E\Big[\sum_{t=0}^{T-1}\gamma^t\nabla_\theta\log\pi_\theta(a_t\mid s_t)\,G_t\Big].$$

**REINFORCE:** sample complete episodes under the current policy, average this expression, and take a gradient-ascent step. The full-return estimator is unbiased under the usual differentiation and integrability assumptions.

::: keypoint
Use **one score × its future return per action**. For the undiscounted episodic examples below, $\gamma=1$. Dropping $\gamma^t$ while claiming the same discounted objective is generally incorrect.
:::

The equivalent $Q^\pi$ theorem averages over the policy's state visitation weights. The appendix makes those weights explicit.

### One policy parameter — see the update direction

A one-step problem has actions A and B. Let $\pi_\theta(A)=p=\operatorname{sigmoid}(\theta)=0.5$. Then the log-probability derivatives are **$1-p=0.5$** for A and **$-p=-0.5$** for B.

With step size 0.1 and baseline 2:

| observed action | reward | advantage | gradient contribution | parameter change |
|---|---|---|---|---|
| A | 3 | 1 | $0.5(1)=0.5$ | +0.05 |
| B | 1 | −1 | $(-0.5)(-1)=0.5$ | +0.05 |

::: keypoint
Both observations increase the probability of A: A performed above the baseline; B performed below it. **The sign comes from both the score and the advantage.**
:::

### REINFORCE, run — and what it converges to
{sub: a scalar linear system, learned blind}

::: widget policy-gradient {"seed":4}
$x_{t+1}=x_t+u_t$ with cost $\sum(x^2+u^2)$ — Lecture 9's problem, scalar. The policy is $u=-kx+\sigma\varepsilon$ and the only parameter is the gain $k$. REINFORCE never sees $A$ or $B$; it only samples. The grey bowl $J(k)$ and the dashed line ==$k^\star = 0.618$, the Riccati gain==, are drawn for *us*, not for the agent — and that is where the gain walks to. Read the two numbers on the right: the estimate scatters *around* the true gradient, never away from it, and its spread falls like $1/\sqrt{N}$. Then set the batch to 8 and watch the gain stop settling — ==that residual wander is Act 2's subject.==
:::

### Check — why differentiate the policy at all
{q: 1}

::: quiz Value-based RL picks actions by $\argmax_a Q(s,a)$. Why does that break down in continuous control?
- =Because the $\argmax$ is itself an optimisation over a continuous space, solved afresh at every single step
- Because $Q$ cannot be represented for continuous actions
- Because the Bellman equation does not hold in continuous action spaces
- Because rewards become unbounded
A table lookup over four actions is free; a maximisation over a continuous vector is an inner optimisation problem, and it recurs at every timestep of every episode. Policy-based methods sidestep it by **storing the answer**: a parameterised $\pi_\theta(s)$ that outputs the action directly. That is the same forward/inverse move as Lectures 5 and 6, now in a sequential setting.
:::

## Act 2 — taming variance with a critic
{short: ACT 2, num: Act 2}

**Q2.** How can we reduce noise? Reward-to-go and action-independent baselines preserve the expected gradient; bootstrapping with an approximate critic can introduce bias.

### Why the estimate is so noisy
{q: 2}

::: qstrip
:::

Look again at what one episode contributes:

$$\hat g^{(i)} = \Big(\sum_{t=0}^{T-1}\nabla_\theta\log\pi_\theta(a_t\mid s_t)\Big)\Big(\sum_{t=0}^{T-1} r_{t+1}\Big)$$

Every score term is multiplied by the ==same== scalar — the whole episode's return. One unlucky tail rescales all $T$ of them together. And the return itself is a sum of $T$ random rewards along a random trajectory.

::: reveal
Worse, it is *credit assignment by superstition*: an action at $t=40$ is given credit for a reward already received at $t=1$, which it could not have caused.

::: keypoint
Three corrections follow, and ==the first two preserve the mean; a bootstrapped critic adds an accuracy–variance trade-off.==
:::
:::

::: reveal
::: small
Keep the distinction clear: subtracting a fixed state baseline from a Monte Carlo return is not the same operation as replacing the return with a learned TD target.
:::
:::

### Fix 1 — causality: half the terms were pure noise

An action at time $t$ cannot affect a reward at time $t' < t$. So those cross-terms have mean zero and contribute ==nothing but variance==. Drop them:

$$\nabla_\theta J = \E\Big[\sum_{t}\nabla_\theta\log\pi_\theta(a_t\mid s_t)\ \hl{\sum_{k=t}^{T-1}r_{k+1}}\Big] \;=\; \E\Big[\sum_t \nabla_\theta\log\pi_\theta(a_t\mid s_t)\;\hat Q_t\Big]$$

::: reveal
For an on-policy rollout continued to termination (or including the full discounted future), the inner sum is the **reward-to-go** $\hat Q_t$, an unbiased sample of $Q^\pi(s_t,a_t)$. A truncated or bootstrapped return needs a separate bias analysis.

::: small
The cost of this fix is one index. It is the cheapest variance reduction in reinforcement learning, and in the numbers of the Act 1 widget it removes about half.
:::
:::

### Fix 2 — a baseline: subtract anything action-independent

Subtract from each reward-to-go a quantity $b(s_t)$ that does not depend on the action taken:

$$\nabla_\theta J = \E\Big[\sum_t \nabla_\theta\log\pi_\theta(a_t\mid s_t)\big(\hat Q_t - b(s_t)\big)\Big]$$

::: block The baseline is free | it adds *exactly zero* bias
$$\E_{a\sim\pi_\theta}\big[\nabla_\theta\log\pi_\theta(a\mid s)\,b(s)\big] = b(s)\int \frac{\nabla_\theta \pi_\theta(a\mid s)}{\pi_\theta(a\mid s)}\pi_\theta(a\mid s)\,da = b(s)\,\nabla_\theta\!\int\!\pi_\theta(a\mid s)\,da = b(s)\,\nabla_\theta 1 = 0$$
:::

::: reveal
A useful baseline is $b(s)=V^\pi(s)=\E[G_t\mid s_t=s]$. It predicts the return typical of this state, so $G_t-b(s)$ asks whether the action did better than expected.

::: keypoint
The value baseline is practical, but not always the exact minimum-variance baseline: the latter also weights by the squared score magnitude. A poorly chosen baseline can increase variance.
:::

::: small
Treat the baseline as fixed in the actor gradient. Training it on independent or previously collected data avoids the extra dependence created by fitting and evaluating on the same action sample. The exact weighted formula is in Backup 3.
:::
:::

### The baseline, measured

::: widget baseline-variance {"seed":11}
The same task, the same seed, the same starting gain, ten episodes per update — the only difference is whether $b(s_t)$ is subtracted. Left: the gain over 100 updates. Right: the variance of the per-episode gradient, on a log axis. The baseline changes ==the mean of the estimator not at all== and its spread by nearly ==twenty-fold==, which is the difference between a run that settles on $k^\star$ and one that keeps wandering past it.
:::

### Fix 3 — the advantage, and the actor–critic

Put the two together. With $b(s)=V^\pi(s)$ and $\hat Q_t \to Q^\pi(s_t,a_t)$, what multiplies the score is the ==advantage==:

$$A^\pi(s,a) = Q^\pi(s,a) - V^\pi(s) \qquad\text{— "how much better than average was this action?"}$$

::: reveal
And now we need a *learned* $V$. Learn both:

::: flow trajectories
- !**Actor** $\pi_\theta(a\mid s)$ | steps $\theta$ along $\nabla_\theta\log\pi_\theta\cdot\hat A$
- **Critic** $V_w(s)$ | returns $\hat A = r + \gamma V_w(s') - V_w(s)$
:::
:::

::: reveal
::: small
That $\hat A$ is a ==TD error== — Lecture 8's engine, running inside a policy update. Here the two lineages briefly touch: a control-lineage actor, steadied by an OR-lineage critic. The three families of the field are not three; they are two circles and their intersection, and the intersection is where almost everything that works actually lives.
:::
:::

### Baseline versus bootstrap — separate the two operations

Suppose the observed full return is **4.6**, the baseline is **2**, and the next-state critic is **3**. With reward 1 and $\gamma=0.9$:

| signal | calculation | what it relies on |
|---|---|---|
| MC minus baseline | $4.6-2=2.6$ | the observed return |
| one-step TD advantage | $1+0.9(3)-2=1.7$ | a learned continuation value |

::: keypoint
A fixed action-independent baseline cancels in expectation. An inaccurate continuation value generally does not. **Actor–critic can trade some bias for faster, less noisy updates.**
:::

At a true terminal state, continuation value is zero. GAE combines multiple TD errors to control this trade-off.

### Two dials on the same idea
{sub: what the field does with the actor–critic once it has one}

- **A3C / A2C** — run many actors in parallel on separate copies of the environment. Their rollouts provide more diverse recent experience without a large replay buffer. A2C synchronises updates; A3C permits parameter lag, so neither parallelism nor freshness means exact sample independence. {p}(Mnih et al., 2016)
- **$n$-step returns** — bootstrap after $n$ steps rather than at the end: $\;R_t = \sum_{i=1}^{n}\gamma^{i-1}r_{t+i} + \gamma^{n}V(s_{t+n})$. A full Monte Carlo return continues to termination with zero bootstrap; one-step actor–critic uses $n=1$.
- **GAE** — do not pick $n$; average all of them geometrically, $\;\hat A_t^{\mathrm{GAE}(\gamma,\lambda)} = \sum_{l\ge0}(\gamma\lambda)^l\,\delta^V_{t+l}$. {p}(Schulman et al., 2016)

::: reveal
::: keypoint
GAE is ==TD($\lambda$) for the advantage== — Lecture 8's bias–variance dial, moved from the value to the thing that trains the policy.
:::
:::

### A3C and A2C — collect several short rollouts, then learn
{sub: original policy-RL PDF pp. 44–47 · parallel collection, not arbitrary replay}

Each worker interacts with its own environment copy and forms an $n$-step target. For the main lecture's undiscounted episodic convention,

$$G_t^{(n)}=\sum_{j=0}^{n-1}r_{t+j+1}+V_w(s_{t+n}),\qquad \hat A_t=G_t^{(n)}-V_w(s_t).$$

If an episode terminates within the window, stop the reward sum there and use zero continuation value. Discounted versions retain the corresponding powers of $\gamma$.

| Method | Coordination |
|---|---|
| **A3C** | workers apply updates asynchronously; local parameters can lag behind the shared ones |
| **A2C** | collect a batch from workers, then update synchronously |

::: keypoint
Parallel workers diversify recent experience. This does **not** make samples independent or justify uncorrected use of arbitrarily old off-policy data.
:::

### Off-policy policy gradients — correct the distribution you sampled
{sub: original policy-RL PDF pp. 39–40 · why reusing data needs care}

At a fixed state, data from behaviour policy $\beta$ can estimate an expectation under $\pi_\theta$ using importance ratios:

$$\mathbb E_{a\sim\pi_\theta}[h(s,a)]=\mathbb E_{a\sim\beta}\!\left[\frac{\pi_\theta(a\mid s)}{\beta(a\mid s)}h(s,a)\right].$$

This requires $\beta(a\mid s)>0$ wherever the target policy assigns probability. If $\pi(A\mid s)=0.8$ but $\beta(A\mid s)=0.4$, observed A actions receive weight **2**.

::: keypoint
That ratio corrects the **action distribution at this state**. It does not by itself correct which states the behaviour policy visits or give an exact gradient of the original on-policy return. Off-policy actor–critic methods need their own objective and assumptions.
:::

### Check — what a baseline does
{q: 2}

::: quiz REINFORCE's gradient estimate is unbiased but very noisy. Subtracting a state-dependent baseline $b(s)$ from the return:
- Reduces variance but introduces bias, which must be corrected later
- =Preserves the expected gradient; a well-chosen action-independent baseline can reduce variance
- Reduces bias but leaves variance unchanged
- Has no effect on either — it only rescales the learning rate
The score-function identity gives $\mathbb{E}[\nabla \log \pi \cdot b(s)] = 0$ for any $b$ that does not depend on the action, so subtracting it is **free**. Choosing $b(s) = V(s)$ turns the return into the advantage — "was this action better than average here?" — which is the signal you actually wanted, and is what makes the actor–critic architecture worth its second network.
:::

## Act 3 — continuous control: DDPG
{short: ACT 3, num: Act 3}

**Q3.** Lecture 8 handed over a wall. This is where it falls.

### The wall Lecture 8 left
{q: 3}

::: qstrip
:::

The source deck states the debt in one sentence: *"although DQN solves problems with high-dimensional observation spaces, it can only handle ==discrete and low-dimensional action spaces=="*. There are exactly two ways to put a continuous action into a Q-network, and both break.

::: cols
::: col Option 1 — discretise the action
One output head per action, as in DQN. Take $-1\le a\le 1$ and cut it into bins of width $\Delta a$.

*What is a good $\Delta a$?* Coarse bins mean poor control resolution; fine bins mean $n^d$ heads for $d$ joints. And the optimum is ==never exactly on the grid==.
:::
::: col.accent Option 2 — feed the action in
One network $Q_w(s,a)$ with the action as an input, so the action stays continuous.

But the update needs $\max_{a'}Q_w(s',a')$, and $Q_w$ is ==non-convex in $a'$==. That is a global optimisation, at every transition, forever.
:::
:::

::: reveal
::: small
Option 1 keeps the update and breaks the action space; option 2 keeps the action space and breaks the update. ==There is no third way that keeps Q-learning==, which is why the answer has to come from the other lineage.
:::
:::

### The wall, measured

::: widget continuous-argmax {"seed":3}
One state, one continuous action, and the critic's $Q(s,\cdot)$ across it. Nine bins already cost $9^6 = 531{,}441$ evaluations per transition on a six-joint arm — and still miss the peak by $0.16$. Twenty-one bins close the gap and cost ==85,766,121==. The actor emits its action in ==one forward pass== and refines it by following $\nabla_a Q$: cheap, and only ever *local* — move its start and watch it settle on the wrong hill, which is honest, and is why TD3 and SAC exist.
:::

### The deterministic fix — the actor climbs the critic

Make the actor **deterministic**, $a = \mu_\theta(s)$, and let it ascend the critic's action-gradient: {p}(Silver et al., 2014)

$$\nabla_\theta J(\mu_\theta) = \E_{s\sim\rho^\mu}\Big[\,\nabla_\theta \mu_\theta(s)\;\nabla_a Q(s,a)\big|_{a=\mu_\theta(s)}\Big]$$

::: reveal
::: keypoint
This is how the intractable $\max_a Q$ is finally beaten: ==the actor follows $\nabla_a Q$ uphill instead of searching for its summit.==
:::
:::

::: reveal
Determinism is not a stylistic preference. Compare the Bellman expectation in the two cases:

$$Q^\pi(s_t,a_t) = \E_{r,s'\sim E}\big[r + \gamma\,\hl{\E_{a'\sim\pi}}[Q^\pi(s',a')]\big] \qquad\text{versus}\qquad Q^\mu(s_t,a_t) = \E_{r,s'\sim E}\big[r + \gamma\,Q^\mu(s',\mu(s'))\big]$$

::: small
With a deterministic $\mu$ the **inner expectation disappears** and only the environment is left inside the expectation. Two consequences, both decisive: the critic can use **off-policy transitions with adequate coverage**, and the actor need not sample an action integral. Arbitrary unsupported data and inaccurate critics do not provide the theorem’s guarantee.
:::
:::

### DDPG — deterministic policy gradient, plus every DQN stabiliser
{sub: Lillicrap et al., 2015 — DQN (2013) → DPG (2014) → DDPG (2016)}

::: cols
::: col The two losses
**Critic**, by Bellman error on a replayed minibatch:

$$\begin{aligned}
y_i&=r_i+\gamma(1-d_i)\,Q_{w^-}(s_i\prime,\mu_{\theta^-}(s_i\prime)),\\
L(w)&=\frac1N\sum_i\big(Q_w(s_i,a_i)-y_i\big)^2.
\end{aligned}$$

Here $s_i\prime$ is the next state stored with sample $i$, and $d_i$ indicates true termination. **Actor**, by the deterministic policy gradient:

$$\nabla_\theta J \approx \frac1N\sum_i \nabla_a Q_w(s_i,a)\big|_{a=\mu_\theta(s_i)}\nabla_\theta\mu_\theta(s_i)$$
:::
::: col.accent The stabilisers, returning
- **replay buffer** — off-policy is now permitted, so use it;
- **target networks** $w^-,\theta^-$, updated *softly* every step, $w^-\leftarrow\tau w + (1-\tau)w^-$, rather than copied every $C$ steps;
- both are Lecture 8's deadly-triad fixes, unchanged. The paper's own verdict on ablating them: ==**"target networks matter a lot"**==.
:::
:::

::: reveal
::: small
**How the actor gradient appears in code.** In code the actor loss is written `pi_loss = -Q(s, mu(s))` and `.backward()` is called; autograd's chain rule $\partial_\theta Q(s,\mu_\theta(s)) = \partial_a Q\cdot\partial_\theta\mu_\theta$ implements the actor’s local chain-rule factor. The theorem also specifies the value function and state visitation distribution; replay-based DDPG uses approximations to them.
:::
:::

### Follow a critic uphill — a scalar actor calculation

At one state let $Q(a)=5-(a-2)^2$ and let the actor output $a=\theta$. Initially $\theta=0$.

$$\frac{dQ}{da}=-2(a-2),\qquad\frac{da}{d\theta}=1.$$

A step of size 0.1 gives $\theta_{\mathrm{new}}=0+0.1(4)=0.4$. The critic's score rises from **1** to **2.44**.

::: keypoint
The actor follows the **critic's slope**, without differentiating the environment. If the critic is wrong around 0.4, an improved predicted value may still mean worse real performance.
:::

### A deterministic actor explores nothing

A deterministic policy has no randomness to explore with, and the obvious repair — act uniformly at random — is a poor one. The source deck gives three reasons, and the third is unusual in this course:

- random actions drive the policy update into regions where the critic ==is not accurate== (Lecture 5's adversarial-optimiser hazard, in an RL costume);
- exploring *unseen states* needs action that is **consistent along the episode**, not resampled each step;
- and on real hardware, ==rapid random input changes can strain actuators==.

::: reveal
::: block The pendulum argument | the source deck's own picture
Swinging a pole upright takes a *sustained* push in one direction, then alternation near the top. Independent zero-mean noise often cancels across steps and may explore sustained maneuvers inefficiently, so a uniformly random policy might eventually find the swing-up — after enormously many samples.
:::

::: small
Hence the ==Ornstein–Uhlenbeck== process, $\,dx_t = -\kappa\,x_t\,dt + \sigma\,dW_t$, added to $\mu_\theta(s)$: noise that is *temporally correlated*, so exploration pushes rather than jitters.
:::
:::

### $\mu_\theta(s)$ and $K$ — compare their feedback role

::: lede
Put Lecture 9's Act 3 and this act side by side. Both produce feedback, using different assumptions and procedures.
:::

::: table center
|   | LQR *(Lecture 9)* | DDPG *(here)* |
|---|---|---|
| the controller | $u = -Kx$ | $a = \mu_\theta(s)$ |
| how it is obtained | solve the Riccati equation | ascend $\nabla_a Q$ from samples |
| does it need the model? | yes — $A$, $B$, $Q$, $R$ | ==no== — sampled transitions |
| what it is | an $m\times n$ matrix | a neural network |
| optimality | global under LQR assumptions | no general guarantee of a local or global optimum |
:::

::: reveal
::: keypoint
Same **role** — a state-to-action feedback rule — but different learning procedures and optimality guarantees.
:::

::: small
The Act 1 widget uses a simple LQ benchmark with a known Riccati answer to assess a learned gain. Success on this example illustrates the feedback role; it is not a general convergence guarantee for policy gradients or DDPG.
:::
:::

### Check — the deterministic gradient
{q: 3}

::: quiz DDPG trains a critic $Q(s,a)$ and a deterministic actor $\mu(s)$. How does the actor get its gradient?
- By finite differences on the environment
- By sampling actions and weighting them by their returns, as in REINFORCE
- =By backpropagating through the critic: $\nabla_\theta Q(s, \mu_\theta(s))$ — the critic is differentiable, so the actor climbs it
- By solving the $\argmax$ exactly at each step and regressing onto the result
The critic is a differentiable surrogate for "how good is this action here", so the actor can be moved uphill on it by the chain rule — no action sampling inside this deterministic actor derivative; the state samples still come from data. Notice what has just been re-created: an optimiser climbing a **learned model of the objective**, which is Lecture 5's setup exactly. Lecture 12 shows it failing in the same way.
:::

## Act 4 — stepping without falling
{short: ACT 4, num: Act 4}

**Q4.** We have a gradient and we have tamed its variance. How far along it dare we step?

### The step-size trap unique to RL
{q: 4}

::: qstrip
:::

In supervised learning a bad step costs one bad update; the next minibatch arrives from the same fixed dataset and pulls you back. In RL it is worse, because

::: keypoint
==the policy generates its own next batch of data.==
:::

::: reveal
A step that pushes $\pi_\theta$ too far lands in a region where the policy is bad — and now *every* subsequent sample comes from that bad policy. The gradient estimated there points somewhere else again. The damage is ==self-reinforcing==, and there is no fixed dataset to fall back on.

::: small
This is also why the parameter step size is the wrong thing to control. A tiny change in $\theta$ can produce a large change in *behaviour* (a sensitive neural network or a Gaussian policy with very small variance), and a large one can produce none at all. What must be bounded is the distance between the old and new **action distributions**.
:::
:::

### A trust region, in policy space

Maximise an importance-weighted advantage, subject to staying inside a ==KL ball== around the policy that collected the data: {p}(Schulman et al., 2015)

$$\max_{\theta}\ \E\Big[\frac{\pi_\theta(a\mid s)}{\pi_{\theta_{\mathrm{old}}}(a\mid s)}\,\hat A\Big] \quad\text{s.t.}\quad \E\big[D_{\mathrm{KL}}\big(\pi_{\theta_{\mathrm{old}}}(\cdot\mid s)\,\|\,\pi_\theta(\cdot\mid s)\big)\big] \le \delta $$

::: reveal
::: small
The ratio reweights old-policy actions. A local linear objective and quadratic KL give the natural-gradient step (Backup 5). Practical average-KL TRPO does **not** by itself guarantee monotonic real return; the theoretical bound uses stronger assumptions.
:::
:::

::: reveal
::: block This is Lecture 1's trust region, moved | the `trust-region` widget of Chapter 1, in policy space
| Lecture 1 · successive convexification | TRPO |
|---|---|
| a quadratic model of $f$ | a linear model of the advantage |
| trust radius $\rho$ in **parameter** space | KL radius $\delta$ in **behaviour** space |
| accept if the model was believable, else shrink | backtrack until estimated KL and surrogate improvement pass their checks |

Shared idea: **restrict an update to where its local model is useful.** The metrics and acceptance tests differ.
:::
:::

### PPO — discourage large changes with a clipped objective

Practical TRPO approximates a KL-constrained step. PPO uses a simpler surrogate with a similar intent: with $r(\theta) = \pi_\theta(a\mid s)/\pi_{\theta_{\mathrm{old}}}(a\mid s)$, {p}(Schulman et al., 2017)

$$J^{\mathrm{CLIP}}(\theta) = \E\Big[\min\big(\,r(\theta)\,\hat A,\ \ \mathrm{clip}\big(r(\theta),\,1-\epsilon,\,1+\epsilon\big)\,\hat A\,\big)\Big]$$

::: reveal
No second-order machinery, no conjugate gradient, no line search. When the ratio leaves $[1-\epsilon,1+\epsilon]$ *in the direction the update was pushing it*, the objective goes flat and ==the incentive to push further is simply removed==.

::: small
With shared actor–critic parameters the practical objective adds two terms — $-c_1(V_\theta(s)-V_{\text{target}})^2$ for the critic and $+c_2 H(\pi_\theta(\cdot\mid s))$, an entropy bonus for exploration. The entropy term is the seed of maximum-entropy RL and of SAC.
:::
:::

### Calculate the clip — the sign of advantage matters

Let $\epsilon=0.2$. For one sampled action, compare $r\hat A$ with $\operatorname{clip}(r,0.8,1.2)\hat A$, and keep the **smaller** number.

| advantage | ratio | ordinary term | clipped term | PPO term |
|---|---|---|---|---|
| +2 | 1.4 | 2.8 | 2.4 | **2.4** |
| −2 | 0.6 | −1.2 | −1.6 | **−1.6** |
| −2 | 1.4 | −2.8 | −2.4 | **−2.8** |

::: keypoint
PPO removes the incentive to increase a good action too much or decrease a bad one too much. It still penalizes making a bad action more likely. **Clipping is not a hard bound on every probability ratio or on KL.**
:::

### The clip, and the asymmetry nobody mentions

::: widget ppo-clip {"eps":0.2}
The clipped objective as a function of the ratio, for a good action ($\hat A>0$) and a bad one ($\hat A<0$). Read the slopes: for $\hat A>0$ the gradient is ==exactly zero above $1+\epsilon$== — no reward for making a good action still likelier. For $\hat A<0$ it is zero *below* $1-\epsilon$ but ==stays alive above $1+\epsilon$==: an action already too probable and known to be bad keeps being pushed down. The clip only removes the incentive that would take you out of the region.
:::

### Check — why large policy changes are discouraged
{q: 4}

::: quiz PPO discourages some large policy updates through its clipped surrogate. Why are large changes risky?
- The gradient estimate becomes biased
- The value function stops converging
- The policy becomes deterministic too quickly
- =The data was collected under the old policy, so a large step moves into a region the batch says nothing about — and the estimate of the improvement stops being valid
On-policy data is only evidence about policies near the one that gathered it. A large update leaves that neighbourhood, and the objective being maximised is then a surrogate evaluated well outside its region of validity — Lecture 1's trust region, arrived at from a completely different direction, and the same adversarial-optimiser problem as Lecture 5.
:::

## Closing
{short: CLOSING}

Both lineages have now had the model taken away. The grid is full.

### Where we are — both lineages, now data-driven

::: lineage dd-B
:::

::: reveal
Two traditions, each with a model-based origin and a data-driven extension, and the same move relates each pair:

| | model-based origin | what is deleted | data-driven extension |
|---|---|---|---|
| **Lineage A · OR** | MDP & DP *(Lec 7)* | the model $(P,R)$ | value-based RL *(Lec 8)* |
| **Lineage B · Control** | optimal control *(Lec 9)* | the dynamics $f$ | ==policy-based RL *(Lec 10)*== |
:::

::: reveal
::: keypoint
One orphaning move, made twice: ==delete the model, sample instead.==
:::
:::

### What we hand on

::: flow | 
- **Lecture 10 leaves** | the trust-region machinery — a KL ball, and a clip
- !**Lecture 11 puts the model back** | learned, and lets the two lineages rejoin
:::

::: reveal
Lecture 1 and TRPO both control where a local approximation is trusted, using different metrics and acceptance rules. PPO clipping instead changes incentives in its sampled objective; it does not impose a hard KL bound. Lecture 12 adds another issue: evaluating a changed policy using a fixed log.

::: small
Lecture 11 asks the question both extensions have been avoiding: if deleting the model cost us this much, what happens if we *learn* it — and plan with it, and let an optimal-control teacher train a policy student?
:::
:::

### Policy gradients learn feedback from experience; their guarantees differ from model-based optimal control.
{layout: standout}

The dynamics never solved, only experienced — and the controller learned, not derived.

### Questions?
{layout: standout}

Read against Lecture 8's closing and the symmetry is exact: value-based RL kept the Bellman equation and threw away the model; policy-based RL kept the feedback law and threw away the dynamics. Two parents, one orphaning move. And the through-line of every algorithm today is a single expression, $\E[\nabla_\theta\log\pi_\theta\cdot\hat A]$ — they differ only in *which advantage they trust* and *how large a step they dare*.

## Appendix — backup slides
{short: APPENDIX}

Complete arguments, kept out of the narrative.

### Backup 1 — the policy gradient theorem, the DP route (i): a recursion

Use a fixed start distribution $\mu$, bounded rewards, and $\gamma<1$: $J(\theta)=\sum_s\mu(s)V^\pi(s)$. Define $\phi(s)=\sum_a\nabla_\theta\pi_\theta(a\mid s)Q^\pi(s,a)$.

Differentiate $V^\pi(s)=\sum_a\pi_\theta(a\mid s)Q^\pi(s,a)$ and use the Bellman equation:

$$\nabla_\theta V^\pi(s)=\phi(s)+\gamma\sum_{s'}P^\pi(s'\mid s)\nabla_\theta V^\pi(s').$$

The transition law has no direct parameter derivative, but the **future policy** still does. Repeated substitution produces discounted state visitations. This is different from differentiating an objective with an arbitrary stationary start distribution that itself depends on $\theta$.

### Backup 2 — the policy gradient theorem, the DP route (ii): unrolled

Let $d_\gamma^\pi(s)=(1-\gamma)\sum_{t\ge0}\gamma^tP_\pi(S_t=s\mid S_0\sim\mu)$. This is a normalized discounted visitation distribution.

$$\nabla_\theta J(\theta)=\frac{1}{1-\gamma}\E_{s\sim d_\gamma^\pi,\,a\sim\pi_\theta}\big[\nabla_\theta\log\pi_\theta(a\mid s)Q^\pi(s,a)\big].$$

The factor $1/(1-\gamma)$ can be absorbed into a learning rate; the **state weighting cannot simply be discarded**. Finite-horizon episodic versions use a sum over time instead.

::: keypoint
The trajectory route and the Bellman route agree when they describe the same objective and the same visitation weights.
:::

### Backup 3 — the baseline: unbiased, and the best one

At a fixed state, put $z=\nabla_\theta\log\pi_\theta(a\mid s)$. Since $\E[z\mid s]=0$, subtracting a fixed $b(s)$ leaves the mean unchanged.

For the variance of **one score-weighted contribution**, minimize $\E[\lVert z\rVert^2(G-b)^2\mid s]$. Differentiation gives

$$b^*(s)=\frac{\E[\lVert z\rVert^2G\mid s]}{\E[\lVert z\rVert^2\mid s]}.$$

This equals $V^\pi(s)=\E[G\mid s]$ when the score weight is constant or suitably uncorrelated with return. Correlations across time add further considerations for a whole-trajectory variance optimum.

::: keypoint
A value critic is a useful baseline, not a universal exact variance minimizer. Keep its output fixed during the actor derivative; same-sample fitting can introduce statistical dependence.
:::

### Backup 4 — GAE, and the $\lambda$ dial
With $\delta^V_t = r_{t+1} + \gamma V(s_{t+1}) - V(s_t)$, the $k$-step advantage estimators telescope:

$$\hat A_t^{(k)} = \sum_{l=0}^{k-1}\gamma^l\delta^V_{t+l} = -V(s_t) + r_{t+1} + \gamma r_{t+2} + \cdots + \gamma^{k-1}r_{t+k} + \gamma^k V(s_{t+k})$$

$k=1$ is the one-step TD advantage: low variance, biased by whatever error $V$ carries. $k=\infty$ is the Monte-Carlo advantage: unbiased, and as noisy as REINFORCE. GAE takes the exponentially weighted average of all of them, {p}(Schulman et al., 2016)

$$\hat A_t^{\mathrm{GAE}(\gamma,\lambda)} := (1-\lambda)\big(\hat A_t^{(1)} + \lambda\hat A_t^{(2)} + \lambda^2\hat A_t^{(3)} + \cdots\big) = \sum_{l=0}^{\infty}(\gamma\lambda)^l\,\delta^V_{t+l}$$

which collapses to a single running sum of TD errors. $\lambda=0$ recovers one-step actor–critic, $\lambda=1$ recovers Monte-Carlo.

::: small
This is ==TD($\lambda$) applied to the advantage== rather than to the value, and the discount $\gamma$ is doing double duty: as the problem's discount, and as a variance-reduction parameter that downweights delayed effects at the cost of bias. Lecture 8's Backup 1 drew the same dial for MC-versus-TD; it is the same dial.
:::

### Backup 5 — TRPO's natural-gradient step, in closed form
Maximise $L(\theta) = \E[r(\theta)\hat A]$ subject to $\bar D_{\mathrm{KL}}(\theta_{\mathrm{old}},\theta)\le\delta$.

**Step 1 — local models.** To first and second order about $\theta_{\mathrm{old}}$,

$$L(\theta)\approx g^\top(\theta-\theta_{\mathrm{old}}), \qquad \bar D_{\mathrm{KL}} \approx \tfrac12 (\theta-\theta_{\mathrm{old}})^\top H\,(\theta-\theta_{\mathrm{old}})$$

with $g=\nabla_\theta L$ and $H$ the Fisher information matrix. The KL has zero gradient at $\theta_{\mathrm{old}}$, which is why its leading term is quadratic.

**Step 2 — a linear objective on an ellipsoid.** The maximiser lies along the natural-gradient direction $H^{-1}g$, scaled to the KL radius:

$$\theta_{\mathrm{new}} = \theta_{\mathrm{old}} + \sqrt{\frac{2\delta}{\,g^\top H^{-1}g\,}}\;H^{-1}g$$

**Step 3 — practice.** $H^{-1}g$ is obtained by conjugate gradient without ever forming $H$, and the step is backtracked until the sample-estimated KL and surrogate improvement pass the line-search checks — which is Lecture 1's accept-or-shrink test, verbatim.

::: small
The derivation assumes an invertible positive-definite local Fisher matrix and a nonzero gradient. Implementations use damping and estimated quantities. PPO removes the second-order solve, but does not inherit a hard trust-region or monotonic-improvement guarantee.
:::

### Backup 6 — the policy-based zoo, placed
All of them are $\E[\nabla_\theta\log\pi_\theta\,\hat A]$, or its deterministic form $\E[\nabla_\theta\mu_\theta\nabla_aQ]$. They differ only in ==which advantage they trust== (Act 2) and ==how large a step they dare== (Act 4).

| Method | Key idea | Reference |
|---|---|---|
| REINFORCE | Monte-Carlo policy gradient, no critic | Williams, 1992 |
| A3C / A2C | parallel actor–critic; parallelism replaces replay | Mnih et al., 2016 |
| GAE | $\lambda$-weighted advantage | Schulman et al., 2016 |
| DPG / DDPG | deterministic actor climbs $\nabla_a Q$; off-policy | Silver 2014; Lillicrap 2015 |
| TD3 | twin critics, delayed actor — the overestimation fix | Fujimoto et al., 2018 |
| TRPO | approximate KL trust-region update | Schulman et al., 2015 |
| PPO | clipped surrogate; the workhorse | Schulman et al., 2017 |
| SAC | maximum-entropy off-policy actor–critic | Haarnoja et al., 2018 |


### Source extension — MADDPG changes the number of decision makers
{sub: original policy-RL PDF pp. 71–74 · preview for IE579}

With several agents, a critic can use the joint state and actions during training, while each actor uses its own observation when deployed.

::: flow
- **Centralised training** | critic for agent i sees joint information and actions
- **Actor improvement** | differentiate the critic through agent i's action
- **Decentralised execution** | each actor acts from its permitted observation
:::

This is **centralised training with decentralised execution**. Other agents' changing policies make the learning problem different from single-agent DDPG; actor gradients do not by themselves guarantee convergence to a Nash equilibrium.

::: keypoint
The original PDF includes this extension. It belongs to the multi-agent face of the course map and is a preview, rather than an assumed prerequisite for Lecture 11.
:::
