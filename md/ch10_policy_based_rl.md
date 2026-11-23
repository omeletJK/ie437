---
ch: 10
title: Policy-Based Reinforcement Learning
subtitle: Optimal control with the dynamics replaced by data
tagline: Lecture 9 derived feedback from a model; *this lecture learns a feedback policy from experience.*
blurb: >-
  Lecture 9 with the dynamics replaced by data. One theorem, the policy gradient, derived twice
  in Lecture 9's order: through the backup over states, then along one sampled trajectory. The
  variance ladder from REINFORCE to the advantage, the deterministic actor that lets a critic be
  learned off-policy, and the clipped step that keeps the policy inside the region its own data
  describes. The heater of Lecture 9 runs through all four acts.
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
handoff: the trust-region machinery and the model put back (Lecture 11)
questions:
  - Gradient?
  - Variance?
  - Continuous?
  - Safe step?
---

### Policy-Based Reinforcement Learning
{layout: title}

### Where we are — the right-hand column, one level down
::: widget control-grid {"cell":"prl","dim":true,"arrow":"f","outer":"dim"}
Lecture 9's column of the grid, with the model gone.
==Lecture 8 deleted $P$ and $R$ from the left column; today deletes $f$ from the right.==
:::

::: reveal
::: keypoint
The same deletion, made twice, one lecture apart.
Delete $f$ and the backup can no longer be computed; it has to be estimated from experience.
:::
:::

::: note
Source pp. 23–24, the professor's own overview figure: the cell is model-free, discrete time, infinite action space, policy-based RL. The vertical arrow in the infinite column is this chapter. The empty continuous-time row of the model-free layer is the source deck's own and stays empty.
:::

### The debt Lecture 8 left, and the hand Lecture 9 held out
::: block Lecture 8's wall | the source deck's one sentence of motivation, p. 28
*"Although DQN solves problems with high-dimensional observation spaces, it can only handle discrete and low-dimensional action spaces."*
:::

::: reveal
::: block Lecture 9's last sentence | what today has to deliver
*"Lecture 10's answer is a network that outputs the minimiser, and it is a descendant of the third."*
:::
:::

::: reveal
::: small
The third answer was Pontryagin's: conditions along one trajectory, Lecture 9's Act 4.
:::

::: keypoint
Two debts, one lecture.
A policy that outputs the action pays the first; a gradient that needs no model pays the second.
:::
:::

::: note
The first quotation is p. 28 of the source deck, verbatim. The second is the closing line of Lecture 9: the third answer to the continuous minimisation was Pontryagin's view along one trajectory, and Act 1 derives today's gradient along one trajectory too. DDPG's actor in Act 3 is the network that outputs the minimiser.
:::

### Learning route — one theorem, then three ways of using it
::: flow
- **Act 1 · the gradient** | one theorem, two routes: the backup, then the trajectory
- **Act 2 · the variance** | better estimates of the weight on the score
- **Act 3 · continuous actions** | a deterministic actor climbs a learned critic
- **Act 4 · the safe step** | stay where the batch is evidence
:::

::: small
**Bring from Lecture 9:** the backup, the value field, the view along one trajectory.
**Bring from Lecture 8:** the TD error, the replay buffer, the target network.
**Bring from Lecture 2:** the gradient of a log-likelihood.
:::

::: reveal
::: keypoint
The heater of Lecture 9 runs through all four acts: $x_{t+1}=x_t+u_t$, cost $x^2+u^2$, policy $u=-kx$.
Every demo learns the gain $k$ and is read against the Riccati gain.
:::
:::

::: note
First pass: Act 1 derives the policy gradient theorem twice, through the Bellman equation first and along a sampled trajectory second, and ends on REINFORCE. Act 2 is the ladder of better weights on the score: reward to go, baseline, advantage, critic, n-step, GAE. Act 3 makes the actor deterministic and learns the critic off-policy: DPG, DDPG, TD3, SAC. Act 4 bounds the step in behaviour space: TRPO and PPO. Derivations are in the body, one line per press, right after the idea they support.
:::

### One honest detour — why not identify the system?
**System identification** — the rhyme of Lecture 8's detour: estimate the dynamics, then run Lecture 9 unchanged.

$$(\hat A,\hat B)=\argmin_{A,B}\sum_t\big\lVert x_{t+1}-Ax_t-Bu_t\big\rVert^2\quad\Longrightarrow\quad\text{the Riccati recursion gives }\hat K$$

::: reveal
::: small
It is the oldest idea in adaptive control, and it is valid.
But to act we only need the controller, and here a whole dynamics model is estimated first and then trusted as if it were true.
:::
:::

::: reveal
::: keypoint
Lecture 8 asked why estimate $P$ and $R$ when $Q^*$ is what acts.
Today asks why estimate $f$ when ==the controller can be estimated directly.==
:::
:::

::: note
Neither source has this slide; it is the course rhyme with Ch 8's "why not learn the model" detour, kept as the opening foil. The model comes back, deliberately and learned, in Lecture 11.
:::

## Act 1 — one theorem, two routes
{short: ACT 1, num: Act 1}

**Q1.** The objective is an expectation over trajectories, and the dynamics sit inside it.\
How can its gradient be taken without them?

### Act 1 on the map
{q: 1}

::: qstrip
:::

::: widget control-grid {"cell":"prl","dim":true,"arrow":"f","outer":"dim"}
The model-free cell of the infinite-action column.
==The object to learn is the controller itself, a parameterised policy $\pi_\theta$.==
:::

::: note
The same figure returns at the start of every act, as Lecture 9's did. All four acts stay in this one cell; what changes is how the gradient is estimated and how far along it the policy is moved.
:::

### The objective, in Lecture 7's objects
**The policy-gradient objective** — a parameterised policy $\pi_\theta(a\mid s)$, scored by the return of the episodes it produces from $s_0$:

$$\begin{aligned}J(\theta)&=V^\pi(s_0)=\E_{\tau\sim\pi_\theta}\Big[\sum_{t=0}^{T-1}r_{t+1}\Big]&&\red{\scriptstyle\text{the return from the start state}}\\ &\propto\sum_{s}d^\pi(s)\sum_{a}\pi_\theta(a\mid s)\,Q^\pi(s,a)&&\red{\scriptstyle\text{the same, averaged over the states visited}}\end{aligned}$$

::: small
$d^\pi(s)$ is how often $\pi_\theta$ visits $s$ when started from $s_0$, normalised to a distribution; Route 1 derives it.
$r_{t+1}$ is the reward paid after $a_t$, Lecture 8's convention, kept throughout; the sums over $a$ become integrals for a continuous action.
:::

::: reveal
**What is sought** — the best parameter, by gradient ascent:

$$\theta^*=\argmax_\theta J(\theta),\qquad\theta\leftarrow\theta+\alpha\,\nabla_\theta J(\theta)$$
:::

::: reveal
::: keypoint
$V^\pi$ and $Q^\pi$ are Lecture 7's; $d^\pi$, how often the policy visits each state, is the one new object.
What is new is where the parameter lives: ==inside the distribution being averaged over.==
:::
:::

::: note
Source p. 29 writes J = Σ_s d^π(s) V^π(s) with d^π the stationary distribution of the chain the policy induces; the start-state form J = V^π(s_0) is the one Route 1 differentiates and Route 2 samples, and d^π then comes out as the normalised visitation from s_0 (the source's p. 34). Say the two agree up to a constant; the source's closing bullets say why a policy is learned directly: there are infinitely many actions to value, and argmax_a Q needs a full scan of the action space. Gradient ascent, because J is a return; Lecture 9 minimised a cost.
:::

### The naive gradient — perturb one parameter at a time
**Finite differences** — the source deck's own first attempt, p. 30:

$$\frac{\partial J(\theta)}{\partial\theta_k}\approx\frac{J(\theta+\epsilon u_k)-J(\theta)}{\epsilon}$$

::: reveal
::: small
It works even when $J$ is not differentiable, and it needs no model.
It costs one full batch of rollouts per parameter: a million parameters, a million batches, for one step.
:::
:::

::: reveal
::: keypoint
This is Lecture 1's "you could always just search", applied to a policy.
The theorem that follows turns one batch of rollouts into the whole gradient.
:::
:::

::: note
Source p. 30: "it works even when J(θ) is not differentiable, but very slow. Is there a more efficient method?" Random-direction methods trade the coordinate loop for noise; they are the honest alternative that makes the score-function trick an achievement rather than a definition.
:::

### Route 1 — the backup, drawn: where the parameter lives
::: widget backup-tree {"mode":"score"}
Lecture 7's expectation backup for $V^\pi(s)$, every action weighted by $\pi_\theta(a\mid s)$.
==The parameter lives on the blue edges only; the green edges are the model, and they carry no $\theta$.==
:::

::: reveal
::: keypoint
Differentiate the backup and the gradient obeys a backup of its own.
$P$ routes the gradient from $s'$ back to $s$ and is never differentiated.
:::
:::

::: note
Source pp. 31–32 drawn on the Ch 7 tree. Press one tags the decision edges with θ and marks the chance edges "no θ"; press two writes the differentiated backup with the P factor in slate. The whole of Route 1 is this picture: ∇Q^π(s,a) = Σ_{s'} P(s'|s,a) ∇V^π(s'), the gradient passing through the chance node untouched. Lecture 9 read the same tree with a continuum of controls; today's tree has a continuum of parameters behind each blue edge.
:::

### Route 1 — the derivation, one line per press
{fill: top, math: compact}

**Bellman equation to policy gradient theorem** — the backup differentiated, then unrolled from $s_0$, with $J=V^\pi(s_0)$:

$$\begin{aligned}
V^\pi(s)&=\sum_a\pi_\theta(a\mid s)\,Q^\pi(s,a) &&\red{\scriptstyle\text{Lecture 7's expectation backup}}\\
\step{1}{\nabla_\theta V^\pi(s)}&\step{1}{=\sum_a\Big[\nabla_\theta\pi_\theta(a\mid s)\,Q^\pi(s,a)+\pi_\theta(a\mid s)\,\nabla_\theta Q^\pi(s,a)\Big]} &&\step{1}{\red{\scriptstyle\text{the product rule}}}\\
\step{2}{\nabla_\theta Q^\pi(s,a)}&\step{2}{=\nabla_\theta\sum_{s'}P(s'\mid s,a)\big[R+V^\pi(s')\big]=\sum_{s'}\hl{P(s'\mid s,a)}\,\nabla_\theta V^\pi(s')} &&\step{2}{\red{\scriptstyle P, R \text{ carry no } \theta\text{: pass through}}}\\
\step{3}{\nabla_\theta V^\pi(s)}&\step{3}{=\phi(s)+\sum_{s'}\rho^\pi(s\to s',1)\,\nabla_\theta V^\pi(s'),\quad \phi(s):=\sum_a\nabla_\theta\pi_\theta\,Q^\pi,\ \ \rho^\pi(s\to s',1):=\sum_a\pi_\theta P} &&\step{3}{\red{\scriptstyle\text{a Bellman equation for the gradient}}}\\
\step{4}{\nabla_\theta V^\pi(s)}&\step{4}{=\sum_{x}\sum_{k=0}^{\infty}\rho^\pi(s\to x,k)\,\phi(x)} &&\step{4}{\red{\scriptstyle\text{unroll; } \rho^\pi(s\to x,k)\text{: the } k\text{-step reach}}}\\
\step{5}{\nabla_\theta J}&\step{5}{=\sum_s\eta(s)\,\phi(s)\;\propto\;\sum_s d^\pi(s)\sum_a\pi_\theta\,\nabla_\theta\log\pi_\theta\,Q^\pi} &&\step{5}{\red{\scriptstyle\eta(s)=\sum_k\rho^\pi(s_0\to s,k)\propto d^\pi(s)}}
\end{aligned}$$

::: reveal
::: keypoint
The dynamics appear once, on line 2, and only as a weight: ==every $\theta$ in the gradient sits inside $\log\pi_\theta$.==
:::
:::

::: note
Source pp. 31–34, line for line. Line 0 is the Bellman expectation equation. Line 1 is the product rule. Line 2 extends Q^π one step with the next state value; P is not a function of θ, so ∇ passes through it, which the source annotates "gradient does not depend on ∇θ of the dynamics". Line 3 names φ(s), the one-step contribution, and ρ^π(s→s',1) = Σ_a π_θ(a|s)P(s'|s,a), the one-step visitation; the equation has the form of a Bellman equation with φ in place of the reward and ρ in place of the transition. Say the last move aloud: ∇π = π ∇log π turns the sum over a into an expectation under π_θ. Line 4 unrolls it with ρ^π(s→x,k) the k-step visitation, so the gradient at s is the sum of φ over every state reachable from s, weighted by how often it is reached. Line 5 sets η(s) = Σ_k ρ^π(s_0→s,k), the unnormalised visitation, and divides by Σ_s η(s) to get d^π; the constant is absorbed into the learning rate, and the proportionality sign is the source's own. The last move is ∇π = π ∇log π, which turns the sum over a into an expectation under π_θ. Discounted version: γ enters ρ and the constant becomes 1/(1−γ).
:::

### The policy gradient theorem
::: block Theorem | the policy gradient, Sutton et al. (2000), the source's p. 31
$$\nabla_\theta J(\theta)\;\propto\;\E_{s\sim d^\pi,\ a\sim\pi_\theta}\Big[\nabla_\theta\log\pi_\theta(a\mid s)\,Q^\pi(s,a)\Big]$$
:::

::: reveal
**What it says** — make an action likelier in proportion to how good it is, averaged over the states visited.\
**The score** — $\nabla_\theta\log\pi_\theta(a\mid s)$, the gradient of a log-likelihood, which Lecture 2 took for the coin; statistics calls it the score.\
**What it needs** — samples of $s$ and $a$ from running the policy, and an estimate of $Q^\pi(s,a)$.\
**The $\propto$** — its constant goes into the step size.\
**What it does not need** — the dynamics $P$, anywhere.
:::

::: reveal
::: keypoint
Route 1 says ==what to estimate==: a score, weighted by a value, under the on-policy distribution.
It does not yet say how to estimate $Q^\pi$ from experience; Route 2 does.
:::
:::

::: note
The theorem's expectation is on-policy: s from d^π and a from π_θ, as the source notes under p. 31. The name "score" is Lecture 2's: ∇_θ log π_θ(a|s) is the score function of the policy as a likelihood. Williams's REINFORCE (1992) is the sampled form of this expression; the theorem in this form is Sutton, McAllester, Singh and Mansour (2000), cited in the reading guide and not given a card because the step it carries is Route 1 itself.
:::

### Route 2 — the same theorem from a different angle
::: figure reward-landscape | 600
Three trajectories on a reward landscape, the source's p. 80: the ones that climbed earn a tick, the one that fell a cross.
:::

::: small
**Route 1** derived the theorem with the state value function, using the recursion of dynamic programming, the Bellman equation.
**Route 2** derives a similar result without dynamic programming: the *episodic* view, where the agent engages in many trajectories.
:::

::: reveal
::: keypoint
Route 2 asks one question: ==if a whole trajectory went well, how do I make it likelier?==
:::
:::

::: note
Source p. 80, the two bullets and the figure, verbatim in spirit: "we derived the policy gradient theorem using the concept of state value function to employ a recursive formula on the basis of dynamic programming (Bellman equation); now let us derive a similar result without using the DP approach but using an episodic approach where the agent engages in multiple trajectories in its environment." The figure returns on the interpretation slide, where the ticks and the cross become the sign of the weight.
:::

### A trajectory, and its probability
**A trajectory $\tau$ of length $T$** — source p. 81; $r_{t+1}$ is the reward paid after $a_t$, as the objective slide declared:

$$\tau=(s_0,\,a_0,\,r_1,\,s_1,\,a_1,\,r_2,\,\dots,\,s_{T-1},\,a_{T-1},\,r_T,\,s_T)$$

::: small
$s_0$ comes from the starting distribution of states, $p_0$.
$a_t\sim\pi_\theta(\cdot\mid s_t)$, with $\pi_\theta$ the parameterised **policy**: the only place $\theta$ appears.
$s_{t+1}\sim P(\cdot\mid s_t,a_t)$, with $P$ the dynamic model describing how the **environment** changes.
:::

::: reveal
**The probability of the trajectory** — the three kinds of factor multiplied, in the order they happen:

$$p_\theta(\tau)=p_0(s_0)\prod_{t=0}^{T-1}\pi_\theta(a_t\mid s_t)\,P(s_{t+1}\mid s_t,a_t)$$
:::

::: reveal
::: keypoint
One factor per thing that happened: ==the policy's factors carry $\theta$, the world's factors do not.==
:::
:::

::: note
Source p. 81, top half: the trajectory, the three check marks (s_0 from the starting distribution; a_i ~ π_θ(a_i|s_i) with π_θ the parameterised policy; s_i ~ P(s_i|s_{i−1},a_{i−1}) with P the dynamic model describing how the environment changes), and p(τ) = μ(s_0) Π π_θ(a_t|s_t) P(s_{t+1}|s_t,a_t). The source writes μ(s_0) for the starting distribution and r_t for the reward after a_t; this deck writes p_0(s_0), since μ is about to become the deterministic policy of Act 3, and r_{t+1}, as Lecture 8 did. Say it as a story: the world draws a start, the policy draws an action, the world draws the next state, and so on; the probability of the whole story is the product of the probabilities of its steps.
:::

### The log-gradient of the law — the dynamics drop out
{fill: top, math: compact}

**We can compute** — source p. 81, bottom half, with the law $p_\theta(\tau)=p_0(s_0)\prod_t\pi_\theta(a_t\mid s_t)\,P(s_{t+1}\mid s_t,a_t)$ of the previous slide:

$$\begin{aligned}
\nabla_\theta\log p_\theta(\tau)&=\nabla_\theta\log\Big(p_0(s_0)\prod_{t=0}^{T-1}\pi_\theta(a_t\mid s_t)\,P(s_{t+1}\mid s_t,a_t)\Big) &&\red{\scriptstyle\text{the log-gradient of the product}}\\
\step{1}{}&\step{1}{=\nabla_\theta\Big[\cancel{\log p_0(s_0)}+\sum_{t=0}^{T-1}\Big(\log\pi_\theta(a_t\mid s_t)+\cancel{\log P(s_{t+1}\mid s_t,a_t)}\Big)\Big]} &&\step{1}{\red{\scriptstyle\text{the log of a product is a sum; two kinds of term hold no } \theta}}\\
\step{2}{}&\step{2}{=\sum_{t=0}^{T-1}\nabla_\theta\log\pi_\theta(a_t\mid s_t)} &&\step{2}{\red{\scriptstyle\text{only the policy's factors survive: a sum of scores}}}
\end{aligned}$$

::: reveal
::: keypoint
The dynamics enter the law of a trajectory and ==leave its log-gradient==, because $\nabla_\theta$ of a term without $\theta$ is zero.
This is Lecture 9's Pontryagin move with the model deleted: conditions along one trajectory, with no $f$ to differentiate.
:::
:::

::: note
Source p. 81, bottom half, with the source's red strokes through log μ(s_0) and log P(s_{t+1}|s_t,a_t). This is "the single most important line in the chapter": the dynamics still decide which trajectories occur, and therefore what any expectation averages over, but they contribute nothing to the gradient with respect to θ. Lecture 9 taught the same pair, a value field over states and then conditions along one trajectory; here the trajectory conditions need no model.
:::

### The law, drawn on the heater
::: widget pg-trajectory {"mode":"law"}
One episode of the heater, five sampled $(s_t,a_t)$ marked; press for the law $p_\theta(\tau)$ and its log-gradient.
==The policy's factors sit on the points, the world's factors on the edges==; the law is their product.
:::

::: reveal
::: keypoint
Only the points carry $\theta$: the log-gradient of the whole episode is the sum of the scores at the points.
:::
:::

::: note
The previous two slides, drawn: the policy's factors π_θ(a_t|s_t) at the sampled points, the world's factors P(s_{t+1}|s_t,a_t) on the edges between them, p_0(s_0) at the start. On the heater the edge factors are Gaussian steps of the thermostat's dynamics, which the agent never writes down.
:::

### Route 2 — the gradient of the objective, one line per press
{fill: top, math: compact}

**We want to maximise** $J(\theta)=\E_{\pi_\theta}\big[\sum_{t=0}^{T-1}r_{t+1}\big]=\E_{\tau\sim p_\theta}\big[R(\tau)\big]$, because $\tau$ is influenced by $\pi_\theta$ — source p. 82, one move per line:

$$\begin{aligned}
\nabla_\theta\,\E_{\tau\sim p_\theta}\big[R(\tau)\big]&=\nabla_\theta\int p_\theta(\tau)\,R(\tau)\,d\tau &&\red{\scriptstyle\text{an expectation is an integral against the density}}\\
\step{1}{}&\step{1}{=\int\frac{p_\theta(\tau)}{p_\theta(\tau)}\,\nabla_\theta p_\theta(\tau)\,R(\tau)\,d\tau} &&\step{1}{\red{\scriptstyle\text{move } \nabla_\theta \text{ inside; multiply and divide by } p_\theta(\tau)}}\\
\step{2}{}&\step{2}{=\int p_\theta(\tau)\,\nabla_\theta\log p_\theta(\tau)\,R(\tau)\,d\tau} &&\step{2}{\red{\scriptstyle\nabla p/p=\nabla\log p\text{: the log-derivative trick}}}\\
\step{3}{}&\step{3}{=\E_{\tau\sim p_\theta}\Big[\nabla_\theta\log p_\theta(\tau)\,R(\tau)\Big]} &&\step{3}{\red{\scriptstyle\text{a density times something: an expectation again}}}\\
\step{4}{}&\step{4}{=\E_{\tau\sim p_\theta}\Big[\sum_{t=0}^{T-1}\nabla_\theta\log\pi_\theta(a_t\mid s_t)\,R(\tau)\Big]} &&\step{4}{\red{\scriptstyle\text{two slides back: } \nabla_\theta\log p_\theta(\tau)=\sum_t\nabla_\theta\log\pi_\theta(a_t\mid s_t)}}\\
\step{5}{}&\step{5}{=\E_{\tau\sim p_\theta}\Big[\Big(\sum_{t=0}^{T-1}\nabla_\theta\log\pi_\theta(a_t\mid s_t)\Big)\Big(\sum_{t=0}^{T-1}r_{t+1}\Big)\Big]} &&\step{5}{\red{\scriptstyle\text{write the return out}}}
\end{aligned}$$

::: reveal
::: keypoint
Two moves only: ==multiply and divide by $p_\theta(\tau)$==, then substitute the law of the trajectory.
The result has no model in it: the scores of the actions taken, times the return of the episode.
:::
:::

::: note
Source p. 82, line for line, in the source's order. Line 0: the expectation written as an integral; this is where θ sits, inside the density p_θ(τ), not inside R(τ). Line 1: the gradient moves inside the integral and the integrand is multiplied and divided by p_θ(τ), the one trick of the derivation. Line 2: ∇p/p = ∇log p, the derivative of a logarithm. Line 3: a density times something is an expectation again, so the gradient of an expectation has become an expectation of a gradient, which a sample average can estimate. Line 4: the log-gradient of the law, from two slides back. Line 5: R(τ) written as the sum of rewards. The source writes ln on lines 2 and 3 and log on lines 4 and 5; they are the same.
:::

### From the expectation to an estimator — a batch of episodes
**We have** — source p. 83; the expectation is with respect to the policy, so we may write $\tau\sim\pi_\theta$:

$$\nabla_\theta\E_{\tau\sim\pi_\theta}\big[R(\tau)\big]=\E_{\tau\sim\pi_\theta}\Big[\Big(\sum_{t=0}^{T-1}\nabla_\theta\log\pi_\theta(a_t\mid s_t)\Big)\Big(\sum_{t=0}^{T-1}r_{t+1}\Big)\Big]$$

::: reveal
**We need trajectories** — the naive way: run the agent on a batch $\mathcal T$ of $N$ episodes, average, and step:

$$\begin{aligned}\theta&\leftarrow\theta+\alpha\,\nabla_\theta\E_{\tau\in\mathcal T}\big[R(\tau)\big]\\
\nabla_\theta\E_{\tau\in\mathcal T}\big[R(\tau)\big]&\approx\frac1N\sum_{i=1}^{N}\Big(\sum_{t=0}^{T-1}\nabla_\theta\log\pi_\theta(a^{(i)}_t\mid s^{(i)}_t)\Big)\Big(\sum_{t=0}^{T-1}r^{(i)}_{t+1}\Big),\qquad\tau^{(i)}\text{ the } i\text{-th episode}\end{aligned}$$
:::

::: reveal
::: keypoint
Route 2 says ==how to estimate==: run the policy, score every action it took, weight the scores by the return.
The source's verdict: too slow and unreliable, from the high variance of the estimate, so Act 2 is variance reduction.
:::
:::

::: note
Source p. 83, verbatim in order: "the expectation is with respect to the policy function, so we can think τ ~ π_θ"; "we need trajectories to get an empirical expectation, which estimates the actual expectation; the naive way is to run the agent on a batch of episodes"; the update θ ← θ + α ∇_θ E_{τ∈T}[R(τ)] where T is the set of trajectories sampled; the estimator; τ^(i) is the i-th trajectory; "this approach will be too slow and unreliable due to high variance on the gradient estimate; we need various variance reduction techniques". No value function, no model, nothing but episodes.
:::

### Reading the estimator — weighted maximum likelihood
**The estimator, read factor by factor** — source p. 84, the landscape's ticks and cross as the sign of the weight:

$$\nabla_\theta J(\theta)=\E_{\tau\sim\pi_\theta}\Big[\underbrace{\sum_t\nabla_\theta\log\pi_\theta(a_t\mid s_t)}_{\hl{\nabla_\theta J_{\mathrm{ML}}(\theta)}\text{: make this trajectory likelier}}\ \ \underbrace{R(\tau)}_{\text{how good it was}}\Big]$$

::: reveal
::: small
The first factor alone is the gradient of the log-likelihood of the trajectory, Lecture 2's maximum-likelihood gradient.
The return weights it: increase the likelihood of trajectories with a large return, decrease it for those with a small one.
:::
:::

::: reveal
::: keypoint
Policy gradient is ==maximum likelihood on your own trajectories, weighted by how well they went.==
It is Lecture 6's move one axis over: a generative model trained to emit the good samples.
:::
:::

::: note
Source p. 84: the first factor labelled "probability of trajectory" and identified as ∇_θ J_ML(θ), the second "reward of trajectory", then the two bullets, increase the likelihood for large accumulated reward, decrease it for small. A small positive return still has a positive weight; Act 2's baseline is what lets the weight compare with typical performance.
:::

### One theorem, two views
::: table center
| | Route 1 · the backup | Route 2 · the trajectory |
|---|---|---|
| Lecture 9's twin | the value field and its rule everywhere | the conditions along one trajectory |
| starts from | $V^\pi=\sum_a\pi_\theta Q^\pi$, the Bellman equation | $p_\theta(\tau)$, the law of an episode |
| where the model goes | a weight the gradient passes through | a factor whose log-gradient is zero |
| what it gives | $\E_{d^\pi,\pi_\theta}[\nabla\log\pi_\theta\,Q^\pi]$: ==what to estimate== | $\E_\tau[\sum_t\nabla\log\pi_\theta\,R(\tau)]$: ==how to estimate it== |
:::

::: reveal
::: keypoint
REINFORCE is Route 2 sampling Route 1's $Q^\pi(s_t,a_t)$ with the return; Act 2's first rung shows that only the part after $t$ matters, $G_t$.
Everything in Act 2 is a better sample of that $Q^\pi$.
:::
:::

::: note
The two agree because Q^π(s,a) = E[G_t | s_t = s, a_t = a] (source p. 36); summing Route 1's expectation over the steps of an episode gives Route 2's. Lecture 9's "three views, one answer" table is the model for this slide; there the views were HJB, Riccati and Pontryagin, here the two routes to one theorem.
:::

### REINFORCE — the Monte Carlo policy gradient
{sub: Williams, "Simple statistical gradient-following algorithms for connectionist reinforcement learning" · Machine Learning 1992}

::: paper
- Why it is here | The first algorithm of the lecture: the theorem sampled with one return per action.
- What it is | A machine-learning paper: the score-times-reward update follows the gradient of the expected return.
- Why it matters | Every policy-gradient method since changes only its weight on the score.
:::

**The update** — the theorem with $Q^\pi(s_t,a_t)$ replaced by the return that actually followed, $G_t=\sum_{k\ge t}\gamma^{k-t}r_{k+1}$:

$$\begin{aligned}\nabla_\theta J(\theta)&\propto\E_{s\sim d^\pi,a\sim\pi_\theta}\big[\nabla_\theta\log\pi_\theta(a\mid s)\,Q^\pi(s,a)\big]&&\red{\scriptstyle\text{the theorem}}\\ &=\E_{\tau\sim\pi_\theta}\Big[\sum_t\gamma^t\,\nabla_\theta\log\pi_\theta(a_t\mid s_t)\,G_t\Big]&&\red{\scriptstyle\text{an episode's steps sample } d^\pi\text{; } Q^\pi(s_t,a_t)=\E[G_t\mid s_t,a_t]}\\ \theta&\leftarrow\theta+\alpha\sum_t\gamma^t\,\nabla_\theta\log\pi_\theta(a_t\mid s_t)\,G_t&&\red{\scriptstyle\text{the update, per episode}}\end{aligned}$$

::: reveal
::: keypoint
It relies on a full episode, which is why it is a Monte Carlo method.
The weight $\gamma^t$ in front of the score is dropped from here on, as implementations do; $\gamma$ inside returns and TD errors stays.
:::
:::

::: note
Source pp. 36–37: Q^π(s,a) = E_π[G_t | S_t, A_t], so G_t measured from real sample trajectories stands in for Q^π. The three update granularities of p. 37, per action, per episode, per episode and batch, are the three places the sum can stop; the algorithm box uses the batch form. The γ^t factor is written once here and then dropped, as the source does from p. 38 on; dropping it while claiming the same discounted objective is a known approximation. REINFORCE: REward Increment = Nonnegative Factor × Offset Reinforcement × Characteristic Eligibility.
:::

### Algorithm — REINFORCE
::: algorithm REINFORCE | input a policy class $\pi_\theta$, step size $\alpha$, batch size $N$; output $\theta$
[initialise] $\theta$ at random
[repeat]
  [for each] episode $i=1,\dots,N$
    [run $\pi_\theta$] $s_0,a_0,r_1,\dots,r_T,s_T$ // act to the end; no update yet
    [for each] step $t$
      [return] $G_t\leftarrow r_{t+1}+r_{t+2}+\cdots+r_T$ // what actually followed $a_t$
  ! [learn] $\theta\leftarrow\theta+\alpha\,\frac1N\sum_i\sum_t\nabla_\theta\log\pi_\theta(a_t^{(i)}\mid s_t^{(i)})\,\red{G_t^{(i)}}$ // the only line the ladder changes
[until] $J$ stops improving
---
the returns come from one backward pass per episode, $G\leftarrow r_{t+1}+\gamma G$, as in Lecture 8's Monte Carlo box; the lit line is Route 2's estimator
:::

::: note
The box the demo two slides on runs, with the heater's gain as the one parameter. Compare Lecture 8's Monte Carlo prediction box: the same run-to-the-end, the same returns, and the learn line writes into θ instead of into V(s). Act 2 changes the red token and nothing else.
:::

### The scored trajectory — update only after the episode ends
::: widget pg-trajectory {"mode":"return"}
The same episode: from every sampled point a line runs to the end, where the returns $G_t$ stack.
==Every score is weighted by a return that shares the same tail==, and nothing can be updated before $T$.
:::

::: reveal
::: keypoint
This drawing carries the whole of Act 2.
The lines to the end are the variance; where they start and where they stop is what the ladder changes.
:::
:::

::: note
Source p. 37's figure, redrawn: a trajectory with five sampled (S_t, A_t), a dashed line from each to the episode's end where G_1 … G_5 stack, each point labelled ∇ ln π(A_t|S_t) G_t, and the green annotation on the span, "can be updated only after an episode is finished". The same figure returns in Act 2 with the lines cut at t (reward to go), a bar subtracted at the end (baseline) and the lines stopped at t+n (bootstrap).
:::

### One parameter — both observations push the same way
::: widget pg-pictures {"mode":"scores"}
One state, two actions, $\pi_\theta(A)=\sigma(\theta)$ at $\theta=0$: the two scores point opposite ways.
Weight each by its reward minus the average reward, $+1$ for A and $-1$ for B, and ==both contributions move $\theta$ to the right.==
:::

::: reveal
::: keypoint
The sign of an update comes from the score and the weight together.
An action that did worse than average pushes the probability away from itself, which is the same direction; Act 2 says why subtracting the average is allowed.
:::
:::

::: note
The numbers, for the board: p = σ(0) = 0.5, so ∇_θ log π(A) = 1 − p = 0.5 and ∇_θ log π(B) = −p = −0.5. Rewards 3 for A and 1 for B against a baseline of 2 give advantages +1 and −1. Contributions: 0.5 × 1 = 0.5 and (−0.5) × (−1) = 0.5; with step 0.1 each moves θ by +0.05. Both increase the probability of A: A performed above the baseline, B below it.
:::

### REINFORCE, run — the gain, learned blind
::: widget policy-gradient {"seed":4}
The heater, $x_{t+1}=x_t+u_t$, reward $-(x^2+u^2)$ per step for twelve steps, policy $u=-kx+\sigma\varepsilon$: $x$ is $s$, $u$ is $a$, the gain $k$ is $\theta$.
REINFORCE never sees the dynamics, and the gain walks to ==the Riccati gain $0.618$== of Lecture 9.
:::

::: reveal
::: keypoint
The estimate scatters around the true gradient, never away from it, and its spread falls like $1/\sqrt N$.
Set the batch to 8 and watch the gain stop settling: ==that wander is Act 2's subject.==
:::
:::

::: note
The grey bowl J(k) and the dashed line are drawn from A and B for us; the agent sees twelve rewards per episode. Reward to go without a baseline, so it is exactly the Act 1 estimator. Verified in node: unbiased at three gains, convergence to 0.6086 at seed 4 with N = 32, spread halving as N quadruples. Lecture 9's Act 2 demo showed 0.618 being reached by the Riccati recursion; this is the same number reached without the model.
:::

### Check — where the dynamics went
{q: 1}

::: quiz Route 2 differentiates $\log p_\theta(\tau)$, and the dynamics $P(s_{t+1}\mid s_t,a_t)$ are a factor of $p_\theta(\tau)$.<br>Why do they not appear in the gradient?
- Because the dynamics are deterministic in control problems
- =Because $P$ carries no $\theta$: its log-derivative is zero, though it still decides which trajectories occur
- Because the policy gradient theorem assumes the model is known
- Because the return $R(\tau)$ does not depend on the states
The log of a product is a sum, and the P terms differentiate to zero because the parameter is not in them. They have not disappeared from the problem: they decide which trajectories are sampled, so they shape the expectation. That is the precise sense in which f is deleted: Lecture 9 solved the dynamics, Lecture 10 lives in them and never differentiates through them. Route 1 says the same thing in one picture: the gradient passes through the green edges.
:::

## Act 2 — the weight on the score
{short: ACT 2, num: Act 2}

**Q2.** The estimate is unbiased and very noisy.\
What can replace the return without moving the mean?

### Act 2 on the map
{q: 2}

::: qstrip
:::

::: widget control-grid {"cell":"prl","dim":true,"arrow":"f","outer":"dim"}
The same cell, the same theorem.
==Only the weight on the score changes, rung by rung.==
:::

::: note
The spine sentence of the source, p. 35: "This vanilla policy gradient update has no bias but high variance. Many following algorithms were proposed to reduce the variance while keeping the bias unchanged." Everything after REINFORCE is variance control or step control.
:::

### Why the estimate is so noisy
**One episode's contribution** — every score multiplied by the same scalar, the whole episode's return:

$$\hat g^{(i)}=\Big(\sum_{t=0}^{T-1}\nabla_\theta\log\pi_\theta(a_t\mid s_t)\Big)\Big(\sum_{t=0}^{T-1}r_{t+1}\Big)$$

::: reveal
::: small
One unlucky tail rescales all $T$ scores together, and the return is itself a sum of $T$ random rewards along a random path.
An action at $t=40$ is credited with a reward paid at $t=1$, before it was taken.
:::
:::

::: reveal
::: keypoint
Write the weight as $\Psi_t$: $\;\nabla_\theta J=\E\big[\sum_t\nabla_\theta\log\pi_\theta(a_t\mid s_t)\,\Psi_t\big]$.
==The problem of policy gradient reduces to finding good estimates $\Psi_t$==, and the mean must not move.
:::
:::

::: note
Source p. 89's closing sentence, promoted to the act's thesis: "the problem of policy gradient reduces to finding good estimates Ψ_t". The rungs: R(τ), the reward to go, minus a baseline, the advantage, the TD error, GAE. The first two preserve the mean exactly; a bootstrapped critic adds a bias for a large drop in variance.
:::

### Rung 1 — causality: half the terms were pure noise
::: widget pg-trajectory {"mode":"causal"}
The lines now start at $t$: an action at $t$ cannot affect a reward paid before it.
==The grey cells of the triangle have mean zero==, because the expected score is zero (next slide proves it); they added only variance.
:::

::: reveal
::: keypoint
The weight becomes the ==reward to go==, $\hat Q_t=\sum_{t'\ge t}r_{t'+1}$, an unbiased sample of $Q^\pi(s_t,a_t)$.
The cost of this rung is one index; in the Act 1 demo it removes about half the variance.
:::
:::

::: note
Source p. 85 with its margin picture: (f_0 + ⋯ + f_T)(r_0 + ⋯ + r_T) expanded, every product f_t r_{t'} with t' < t has mean zero because E[f_t | s_t] = 0 and the earlier reward is already fixed. The source labels Σ_{t'≥t} r_{t'} "reward to go" and writes it Q̂_t. For an on-policy rollout continued to termination the reward to go is an unbiased sample of Q^π; a truncated return is not, which is rung 5.
:::

### Rung 2 — a baseline: subtract anything that does not depend on the action
{fill: top, math: compact}

**The baseline, and the proof that it is free** — source pp. 86–87, one line per press:

$$\begin{aligned}
\nabla_\theta J&=\E_{\tau\sim\pi_\theta}\Big[\sum_t\nabla_\theta\log\pi_\theta(a_t\mid s_t)\Big(\hat Q_t-\hl{b(s_t)}\Big)\Big] &&\red{\scriptstyle\text{the claim: any } b(s_t)}\\
\step{1}{\E_\tau\big[\nabla_\theta\log\pi_\theta(a_t\mid s_t)\,b(s_t)\big]}&\step{1}{=\E_{s_{0:t},a_{0:t-1}}\Big[b(s_t)\;\E_{a_t\sim\pi_\theta}\big[\nabla_\theta\log\pi_\theta(a_t\mid s_t)\big]\Big]} &&\step{1}{\red{\scriptstyle\text{split at } t\text{; } b(s_t) \text{ fixed given } s_t}}\\
\step{2}{\E_{a_t\sim\pi_\theta}\big[\nabla_\theta\log\pi_\theta(a_t\mid s_t)\big]}&\step{2}{=\int\frac{\nabla_\theta\pi_\theta(a_t\mid s_t)}{\pi_\theta(a_t\mid s_t)}\,\pi_\theta(a_t\mid s_t)\,da_t=\nabla_\theta\int\pi_\theta(a_t\mid s_t)\,da_t} &&\step{2}{\red{\scriptstyle\nabla\log\pi=\nabla\pi/\pi}}\\
\step{3}{}&\step{3}{=\nabla_\theta 1=0\qquad\Longrightarrow\qquad\E_\tau\big[\nabla_\theta\log\pi_\theta(a_t\mid s_t)\,b(s_t)\big]=\E\big[b(s_t)\cdot0\big]=0} &&\step{3}{\red{\scriptstyle\text{the density integrates to one: zero bias}}}
\end{aligned}$$

::: reveal
::: keypoint
The expected score is zero, so anything that does not depend on the action rides on it for free.
Two things to check, and the source checks both: ==the mean does not move; the variance does.==
:::
:::

::: note
Source pp. 86–87, line for line: "we need to verify two things: inserting a baseline does not make the gradient estimate biased, and the baseline actually reduces variance". The proof splits the expectation over the trajectory at time t; conditional on s_t the baseline is a constant, and the inner expectation of the score is the derivative of a total probability, which is zero. The same identity is Lecture 2's: the expected score of a likelihood is zero. The next slide answers the second question.
:::

### Which baseline — the critic as a least-squares solution
{fill: top, math: compact}

**The variance-minimising baseline** — source p. 88, three lines per press:

$$\begin{aligned}
\mathrm{Var}\Big[\sum_t\nabla_\theta\log\pi_\theta(a_t\mid s_t)\big(\hat Q_t-b(s_t)\big)\Big]&\approx\sum_t\E\big[\lVert\nabla_\theta\log\pi_\theta(a_t\mid s_t)\rVert^2\big]\;\E\big[(\hat Q_t-b(s_t))^2\big] &&\red{\scriptstyle\text{approximation: } \lVert\text{score}\rVert^2 \text{ and } (\hat Q_t-b)^2 \text{ uncorrelated}}\\
\step{1}{b^*(s_t)}&\step{1}{=\argmin_{b}\;\E\big[(\hat Q_t-b(s_t))^2\big]} &&\step{1}{\red{\scriptstyle\text{a least-squares problem in } b}}\\
\step{2}{b^*(s_t)}&\step{2}{=\E_{\tau\sim\pi_\theta}\big[\hat Q_t\mid s_t\big]=V^\pi(s_t)} &&\step{2}{\red{\scriptstyle\text{the mean minimises a squared error}}}
\end{aligned}$$

::: reveal
::: keypoint
Under that approximation the best baseline is $V^\pi(s_t)$: ==the critic is the least-squares answer to a variance problem.==
Not a design choice, and re-fitted as the policy moves, because $V^\pi$ moves with $\pi$.
:::
:::

::: note
Source p. 88, with its two approximations stated on the slide: the variance of a sum taken as the sum of variances, and E[AB] ≈ E[A]E[B] for the score and the return. Under them the best baseline is the expected return from the state, V^π(s_t), and the source's practical note is "have to re-fit the baseline estimate each time". The exact minimiser weights by the squared score, b* = E[‖∇log π‖² R | s] / E[‖∇log π‖² | s], and equals V^π when the two factors are uncorrelated; a value critic is a useful baseline, not a universal exact minimiser. Treat the baseline as fixed in the actor gradient; fitting and evaluating on the same sample adds a dependence, which the demo avoids by fitting on previous batches.
:::

### The baseline, drawn — better or worse than expected
::: widget pg-trajectory {"mode":"baseline"}
At the episode's end, the cost that followed each sampled point is a bar; every return here is a cost paid.
Mark what was expected from that state and ==the sign of the difference says whether the action helped.==
:::

::: reveal
::: keypoint
Without the baseline every weight is negative and every action is pushed away from itself.
With it the weight reads: did this action do better than this state usually does?
:::
:::

::: note
The bars are −G_t for the five sampled points of the episode drawn; the amber tick is the expected cost to go of the mean policy from the state actually reached, the closed form of the heater. Blue: less cost than expected, the action is made likelier; red: more, less likely. This is the picture the temperature thread of the old deck computed in a table: a common offset to every return changes the baseline and leaves every advantage where it was.
:::

### The baseline, measured
::: widget baseline-variance {"seed":11}
The same task, seed, starting gain and estimator, ten episodes per update; the only difference is whether $b(s_t)$ is subtracted.
The baseline changes ==the mean of the estimator not at all== and its spread by nearly twenty-fold.
:::

::: reveal
::: keypoint
Twenty-fold is the difference between a run that settles on $k^*$ and one that keeps wandering past it.
:::
:::

::: note
Left: the gain over 100 updates, amber without and blue with the baseline; right: the variance of the per-episode gradient on a log axis. Verified in node: at k = 0.66 the three estimators, no baseline, reward to go, reward to go minus baseline, have means −0.158, −0.119, −0.116 against the exact −0.117 and variances 4282, 1965, 224. Seed 11: variance ratio 19.5, rms |k − k*| from 0.174 to 0.038. The baseline is fitted on previous batches only, so it is exactly unbiased; a baseline fitted on the same batch is slightly biased.
:::

### Rung 3 — the advantage
**The advantage** — the two rungs together, $b(s)=V^\pi(s)$ with the reward to go standing in for $Q^\pi$:

$$\Psi_t=\hat Q_t-V^\pi(s_t),\qquad\E\big[\Psi_t\mid s_t,a_t\big]=Q^\pi(s_t,a_t)-V^\pi(s_t)=:A^\pi(s_t,a_t)$$

::: small
Read $A^\pi$ as: how much better than this state's average was this action.
:::

::: reveal
$$\nabla_\theta J=\E_\tau\Big[\sum_t\nabla_\theta\log\pi_\theta(a_t\mid s_t)\,\big(Q^\pi(s_t,a_t)-V^\pi(s_t)\big)\Big]=\E_\tau\Big[\sum_t\nabla_\theta\log\pi_\theta(a_t\mid s_t)\,A^\pi(s_t,a_t)\Big]$$
:::

::: reveal
::: keypoint
Three rungs, and the mean has not moved once.
From here on $V^\pi$ has to be ==learned as a function of the state==, and that function is the critic.
:::
:::

::: note
Source p. 89: substitute b(s_t) = V^π(s_t) and Σ_{t'≥t} r_{t'} → Q^π(s_t,a_t). The advantage is the natural weight: zero for an average action, positive for a better one. Nothing so far needed a learned function; the next rung does.
:::

### Three families — the actor–critic is the intersection
::: widget pg-pictures {"mode":"families"}
The source deck's own map of the field: a value disc, a policy disc, and the lens where they overlap.
==An actor–critic is not a compromise between Lectures 8 and 10; it is their intersection.==
:::

::: reveal
::: keypoint
The critic learns a value and weights the score; the actor learns the policy and takes the step.
Lecture 8's engine, running inside a policy update.
:::
:::

::: note
Source p. 27, two overlapping discs: Value function (value based), Policy (policy-based), the lens Actor Critic. Source p. 38: "it makes a lot of sense to learn the value function in addition to the policy, since knowing the value function can assist the policy update, such as by reducing gradient variance". Critic: the value parameters w, for Q_w or V_w; actor: the policy parameters θ, in the direction the critic suggests. On-policy, as the source annotates.
:::

### Rung 4 — the critic's TD error as the weight
**One-step actor–critic** — Lecture 8's TD error as a one-sample advantage: $\E[\delta_t\mid s_t,a_t]=A^\pi(s_t,a_t)$ when $V_w=V^\pi$:

$$\hat A_t=\delta_t=r_{t+1}+\gamma V_w(s_{t+1})-V_w(s_t),\qquad\theta\leftarrow\theta+\alpha_\theta\,\nabla_\theta\log\pi_\theta(a_t\mid s_t)\,\delta_t,\qquad w\leftarrow w+\alpha_w\,\delta_t\,\nabla_wV_w(s_t)$$

::: algorithm One-step actor–critic | input $\pi_\theta$, $V_w$, step sizes $\alpha_\theta,\alpha_w$; output $\theta$ and $w$
[initialise] $\theta$, $w$
[for each] episode
  [start] $s\leftarrow s_0$
  [for each] step, until $s$ is terminal
    [act] $a\sim\pi_\theta(\cdot\mid s)$; take $a$, observe $r$, $s'$ // one transition, no waiting for $T$
    [critic] $\delta\leftarrow r+\gamma V_w(s')-V_w(s)$; $\;w\leftarrow w+\alpha_w\,\delta\,\nabla_wV_w(s)$ // Lecture 8's TD(0) update; $\delta$ is a one-sample advantage
  ! [learn] $\theta\leftarrow\theta+\alpha_\theta\,\nabla_\theta\log\pi_\theta(a\mid s)\,\red{\delta}$ // the TD error weights the score
    [move] $s\leftarrow s'$
---
while $V_w$ is wrong, bootstrapping on it puts its error into the actor's gradient as a bias; $\gamma$ as Lecture 8 wrote it, $1$ on the heater
:::

::: note
Source p. 60 writes the deterministic version of this box; the stochastic one is Sutton and Barto's one-step actor–critic. A fixed action-independent baseline cancels in expectation, an inaccurate continuation value does not: actor–critic trades some bias for faster, less noisy updates. At a terminal state the continuation value is zero. The subtraction of V_w(s) is the baseline; the bootstrap r + γV_w(s') is the new thing on this rung.
:::

### Rung 5 — stop after $n$ steps and bootstrap
::: widget pg-trajectory {"mode":"nstep"}
The same episode, the lines now stop at $t+n$ and read the rest off the critic.
==The sampled part is short and noisy, the bootstrapped part is biased by whatever error $V$ carries.==
:::

::: reveal
::: keypoint
$n=1$ is the one-step actor–critic; $n=T$ is REINFORCE with a baseline.
This is Lecture 8's Monte Carlo against TD dial, moved to the weight on the score.
:::
:::

::: note
Source p. 46's figure, the direct sequel to p. 37's: the same timeline, the dashed lines now stopping at t + n with the return accumulating backwards, R = V(s_{t+n}), then R ← r + γR. The n-step return R_t^{(n)} = Σ_{i=1}^{n} γ^{i−1} r_{t+i} + γ^n V(s_{t+n}); a full Monte Carlo return continues to termination with zero bootstrap. A3C's workers form exactly this target, p. 45.
:::

### Rung 6 — GAE: do not pick $n$, average all of them
{fill: top, math: compact, sub: Schulman, Moritz, Levine, Jordan and Abbeel, "High-Dimensional Continuous Control Using Generalized Advantage Estimation" · ICLR 2016}

::: paper
- Why it is here | The last rung of the ladder: Lecture 8's bias–variance dial, built into the advantage.
- What it is | A continuous-control paper: the λ-weighted advantage estimator, used inside TRPO.
- Why it matters | The advantage estimator PPO uses in practice; λ and γ are its two dials.
:::

$$\begin{aligned}
\hat A^{(k)}_t&=\sum_{l=0}^{k-1}\gamma^l\,\delta_{t+l}=-V(s_t)+r_{t+1}+\gamma r_{t+2}+\cdots+\gamma^{k-1}r_{t+k}+\gamma^kV(s_{t+k}) &&\red{\scriptstyle\text{rung 5's } k\text{-step return minus } V(s_t)\text{, which telescopes into TD errors}}\\
\step{1}{\hat A^{\mathrm{GAE}(\gamma,\lambda)}_t}&\step{1}{=(1-\lambda)\big(\hat A^{(1)}_t+\lambda\hat A^{(2)}_t+\lambda^2\hat A^{(3)}_t+\cdots\big)} &&\step{1}{\red{\scriptstyle\text{average every } k \text{ with weight } \lambda^{k-1}}}\\
\step{2}{}&\step{2}{=\sum_{l=0}^{\infty}(\gamma\lambda)^l\,\delta_{t+l}} &&\step{2}{\red{\scriptstyle\text{one running sum of TD errors; } \lambda=0 \text{ is rung 4, } \lambda=1 \text{ is rung 3}}}
\end{aligned}$$

::: reveal
::: keypoint
GAE is ==a $\lambda$-weighted average of every $n$-step advantage==: Lecture 8's Monte Carlo against TD dial, now on the weight.
$\gamma$ does double duty here, as the problem's discount and as a second variance dial.
:::
:::

::: note
Source pp. 42–43, the paper's equations (11)–(19) re-typed from the screenshots. The telescoping on line 0: adjacent V terms cancel pairwise, leaving the first and the last. λ = 0 recovers the one-step TD advantage, low variance and biased by the critic's error; λ = 1 recovers the Monte Carlo advantage, unbiased and as noisy as REINFORCE. The paper's framing sentence: γ "allows us to reduce variance by downweighting rewards corresponding to delayed effects, at the cost of introducing bias". Lecture 8 drew the same dial for MC against TD.
:::

### Two more dials — parallel workers, and data from another policy
::: cols
::: col A3C and A2C · parallelism in place of replay (Mnih et al., 2016)
Several workers run the environment in parallel.\
Each forms an $n$-step target for the shared parameters.\
A2C waits for every worker and makes one batched update.\
A3C lets each worker update when it is ready.\
Parallel workers diversify recent experience, as a buffer does.
:::
::: col.accent Off-policy gradient · the importance ratio (Degris et al., 2012)
Lecture 6's importance ratio, with the policy as the proposal: data from a behaviour policy $\beta$ estimate an expectation under $\pi_\theta$ at a fixed state, for any $h$:

$$\E_{a\sim\pi_\theta}[h(s,a)]=\E_{a\sim\beta}\Big[\frac{\pi_\theta(a\mid s)}{\beta(a\mid s)}\,h(s,a)\Big]$$

The ratio corrects the action distribution at this state.\
It does not correct which states $\beta$ visits.
:::
:::

::: reveal
::: keypoint
Hold on to the ratio $\pi_\theta/\beta$.
==It is the object that returns in Act 4== as the size of a policy step.
:::
:::

::: note
Source pp. 44–47 for A3C: "parallelism decorrelates the agents' data into a more stationary process" and "stabilizes learning, playing a role of experience replay buffer"; the A2C against A3C schematic is an external figure. Source pp. 39–40 for the off-policy gradient: with d^β the behaviour policy's state distribution, the gradient is approximated by dropping the π_θ ∇Q^π term, and Degris, White and Sutton show the approximation still reaches a local optimum. The ratio requires β(a|s) > 0 wherever π_θ puts mass. Neither dial changes the ladder's weight; both change where the data come from.
:::

### The ladder so far — one gradient, the weight changed
::: widget mdp-pictures {"mode":"ladder","start":0,"upto":5,"plates":[{"title":"REINFORCE","line":"for each step t of a finished episode:","formula":"∇_θ J = \\text{E}[ \\sum_t ∇_θ \\log π_θ(a_t|s_t) \\, \\red{R(τ)} ]","note":"the whole return weights every score","loop":"one episode per update"},{"title":"Reward to go","line":"for each step t:","formula":"∇_θ J = \\text{E}[ \\sum_t ∇_θ \\log π_θ(a_t|s_t) \\, \\red{\\sum_{t′ ≥ t} r_{t′+1}} ]","note":"only what the action could still cause","loop":"one episode per update"},{"title":"Baseline","line":"for each step t:","formula":"∇_θ J = \\text{E}[ \\sum_t ∇_θ \\log π_θ(a_t|s_t) \\, ( \\sum_{t′ ≥ t} r_{t′+1} \\red{− b(s_t)} ) ]","note":"anything action-independent is free","loop":"refit b each update"},{"title":"Advantage","line":"for each step t:","formula":"∇_θ J = \\text{E}[ \\sum_t ∇_θ \\log π_θ(a_t|s_t) \\, \\red{A^π(s_t,a_t)} ]","note":"Q − V: better than this state's average","loop":"needs a learned V"},{"title":"Actor–critic","line":"for each transition (s, a, r, s′):","formula":"∇_θ J ≈ \\text{E}[ ∇_θ \\log π_θ(a|s) \\, \\red{δ} ],\\quad δ = r + γ V_w(s′) − V_w(s)","note":"the TD error: one step sampled, the rest bootstrapped","loop":"one transition per update"},{"title":"GAE","line":"for each step t, with λ ∈ [0,1]:","formula":"∇_θ J ≈ \\text{E}[ \\sum_t ∇_θ \\log π_θ(a_t|s_t) \\, \\red{\\sum_l (γλ)^l δ_{t+l}} ]","note":"TD(λ) for the advantage","loop":"λ dials MC against TD"}]}
Six rungs, one formula: ==the score never changes, the weight on it does==, in red.
Lecture 8's ladder sampled the backup; this one samples the weight ever more locally.
:::

::: note
Read it with Lecture 8's ladder in mind: there MC → TD → SARSA → Q-learning sampled the backup and moved the max; here every rung keeps ∇ log π_θ and changes Ψ_t. The first three rungs are exact, the mean does not move; the last two trade a bias for variance. The closing ladder adds two rungs that change a different token: DPG replaces the score, PPO wraps the weight.
:::

### Check — what a baseline does
{q: 2}

::: quiz REINFORCE's gradient estimate is unbiased but very noisy.<br>Subtracting a state-dependent baseline $b(s_t)$ from the return:
- Reduces variance but introduces bias, which must be corrected later
- =Preserves the expected gradient; a well-chosen action-independent baseline reduces variance
- Reduces bias but leaves variance unchanged
- Has no effect on either: it only rescales the learning rate
The expected score is zero, so E[∇ log π · b(s)] = 0 for any b that does not depend on the action: subtracting it is free. Choosing b(s) = V(s) turns the return into the advantage, was this action better than average here, which is the signal wanted all along, and the least-squares argument says it is also the variance-minimising choice under mild approximations. A bootstrapped critic is a different operation: it replaces the return and does introduce bias.
:::

## Act 3 — continuous actions: the actor climbs the critic
{short: ACT 3, num: Act 3}

**Q3.** Lecture 8 handed over a wall, a max over a continuum of actions.\
This is where it falls.

### Act 3 on the map
{q: 3}

::: qstrip
:::

::: widget control-grid {"cell":"prl","dim":true,"arrow":"f","outer":"dim"}
The infinite-action cell, taken at its word: the action is a real vector, a motor torque.
==The policy outputs it directly; nothing is maximised over at run time.==
:::

### The wall, argued twice — the source's facing pages
::: cols
::: col Option 1 — discretise the action
One output head per action, as in DQN.\
Cut $-1\le a\le1$ into bins and run Q-learning on the grid.\
*How many bins?*\
Few mean poor resolution; many mean $n^d$ heads for $d$ joints.\
And the optimum may lie ==between grid points==.
:::
::: col.accent Option 2 — feed the action in
One network $Q_w(s,a)$ with the action as an input.\
The action stays continuous.\
But the update needs $\max_{a'}Q_w(s',a')$.\
$Q_w$ is ==non-convex in $a'$==.\
A global optimisation at every transition, forever.
:::
:::

::: reveal
::: keypoint
Option 1 keeps the update and breaks the action space; option 2 keeps the action space and breaks the update.
==There is no cheap third way that keeps Q-learning.==
:::
:::

::: note
Source pp. 51–52, both headed "Q-Learning on continuous action space?" with the note "Mujoco action = motor control input of each joint". The source's "too small Δa / too high Δa" refers to the number of bins; it is written here in terms of bins to avoid the ambiguity. Page 52 prints the Q-learning update at the top right for reference and concludes "we cannot perform the Q-learning update".
:::

### The wall, measured
::: widget continuous-argmax {"seed":3}
One state, one continuous action, and the critic's $Q(s,\cdot)$ across it.
A grid of bins pays $n^d$ evaluations per transition on $d$ joints and still misses the peak; ==the actor emits its action in one forward pass== and is trained by following $\nabla_aQ$.
:::

::: reveal
::: keypoint
Following $\nabla_aQ$ is cheap and only ever local: move the start and it settles on the wrong hill.
TD3 repairs the critic's errors and SAC changes the objective; neither finds the best peak for you.
:::
:::

::: note
Verified in node: true max Q = 0.9615 at a* = 0.416; 9 bins give Q = 0.797, a gap of 0.164, at 531,441 evaluations per transition on six joints; 21 bins close the gap to 0.007 at 85,766,121. Gradient ascent from four starts reaches the global peak from one of them. The honest shape of the resolution-against-cost trade-off is not monotone: 9 bins buy nothing over 5 here.
:::

### Why deterministic — the inner expectation disappears
::: widget backup-tree {"mode":"deterministic"}
The $Q$ backup with a stochastic policy: at each successor the next action is averaged over $\pi$.
Make the policy deterministic, $a=\mu(s)$, and ==the fan collapses to one edge: only the environment is left inside the expectation.==
:::

::: reveal
::: keypoint
The target $r+\gamma Q(s',\mu(s'))$ needs no next action from the data, as Q-learning's max did not in Lecture 8; $\mu(s')$ replaces the max.
So the critic can be trained ==off-policy==, from any transitions with coverage, and there is no inner integral to sample.
:::
:::

::: note
Source p. 54, the cleanest argument in the DDPG half: with a stochastic π, "environment and policy determine Q^π"; with a deterministic μ, "the environment solely determines Q^μ". Consequences, numbered on the slide: off-policy training, and no inner expectation to estimate, so less variance. This is where the control lineage's determinism stops being a style and becomes a variance argument. REINFORCE cannot be off-policy because its expectation is over the policy's own trajectories; DDPG can because its critic's target contains only the environment.
:::

### The deterministic policy gradient — one line per press
{fill: top, math: compact, sub: Silver, Lever, Heess, Degris, Wierstra and Riedmiller, "Deterministic Policy Gradient Algorithms" · ICML 2014}

::: paper
- Why it is here | The theorem that lets an actor be improved by the critic's slope rather than by returns.
- What it is | DeepMind theory: the deterministic gradient, the limit of the stochastic one.
- Why it matters | It made continuous control by actor–critic tractable; DDPG, TD3 and Lecture 12 build on it.
:::

::: small
**What breaks** — Act 2's actor needs a score and the critic's $\max_aQ$ needs a search; a continuous action defeats both.
**The change** — a deterministic actor $a=\mu_\theta(s)$, improved by differentiating the critic through the action.
:::

$$\begin{aligned}
J(\pi_\theta)&=\int_{\mathcal S}\rho^{\pi}(s)\int_{\mathcal A}\pi_\theta(a\mid s)\,r(s,a)\,da\,ds &&\red{\scriptstyle\text{the stochastic objective: } \rho^\pi \text{ is Act 1's } d^\pi\text{, discounted; two integrals}}\\
\step{1}{J(\mu_\theta)}&\step{1}{=\int_{\mathcal S}\rho^\mu(s)\,r\big(s,\mu_\theta(s)\big)\,ds} &&\step{1}{\red{\scriptstyle\text{deterministic: one integral instead of two, the variance argument as an absence}}}\\
\step{2}{\nabla_\theta J(\mu_\theta)}&\step{2}{=\int_{\mathcal S}\rho^\mu(s)\,\nabla_\theta\mu_\theta(s)\;\nabla_aQ^\mu(s,a)\big|_{a=\mu_\theta(s)}\,ds} &&\step{2}{\red{\scriptstyle\text{the chain rule through the action; the } \theta \text{ inside } \rho^\mu \text{ unrolls as in Route 1 (Theorem 1)}}}\\
\step{3}{}&\step{3}{=\E_{s\sim\rho^\mu}\Big[\nabla_\theta\mu_\theta(s)\;\red{\nabla_aQ^\mu(s,a)\big|_{a=\mu_\theta(s)}}\Big]} &&\step{3}{\red{\scriptstyle\text{the actor follows the critic uphill}}}
\end{aligned}$$

::: reveal
::: keypoint
The intractable $\max_aQ$ is finally beaten: ==the actor follows $\nabla_aQ$ uphill instead of searching for its summit.==
The deterministic gradient is the limit of the stochastic one as the policy's spread goes to zero.
:::
:::

::: note
Source pp. 56–59: ρ^μ is the discounted state distribution of p. 56, Act 1's d^π with γ^k weights; line 0 is p. 58's stochastic objective, line 1 its deterministic twin, line 2 the theorem on p. 57 with its two remarks, the deterministic policy as the limiting case of the stochastic one when the action distribution collapses to a point mass, and "we expect the stochastic policy to require more samples as it integrates the data over the whole state and action space". Line 3 is p. 58's pair of objectives side by side. What it takes to implement, p. 59: a policy whose gradient in θ is easy, and a critic whose gradient in a is easy; in DDPG both are networks. Theorem 2 of the paper, quoted on p. 59 as a known fact: the deterministic gradient is the limit of the stochastic one.
:::

### Nobody implements the theorem — autograd does
**The actor loss, in code** — source p. 68: write the critic's value of the actor's action and call `.backward()`:

$$\texttt{pi\_loss}=-Q_w\big(s,\mu_\theta(s)\big),\qquad\frac{\partial Q_w(s,\mu_\theta(s))}{\partial\theta}=\frac{\partial Q_w}{\partial a}\Big|_{a=\mu_\theta(s)}\frac{\partial\mu_\theta(s)}{\partial\theta}=\nabla_\theta\mu_\theta(s)\,\nabla_aQ_w(s,a)\big|_{a=\mu_\theta(s)}$$

::: reveal
::: keypoint
The chain rule autograd computes ==is== the deterministic policy gradient.
The theorem's content is which expectation it stands under: states from the data, the critic's slope at the actor's action.
:::
:::

::: note
Source p. 68, a PyTorch snippet beside the maths: pi_loss = −Q(s, mu(s)); pi_loss.backward(). The theorem also specifies the value function and state distribution; replay-based DDPG uses approximations to both. One line of code, and the student sees what the theorem is actually saying.
:::

### DDPG — the deterministic gradient, plus every DQN stabiliser
{sub: Lillicrap, Hunt, Pritzel, Heess, Erez, Tassa, Silver and Wierstra, "Continuous control with deep reinforcement learning" · ICLR 2016}

::: paper
- Why it is here | The algorithm of Act 3: a deterministic actor, a critic trained from replay, Lecture 8's stabilisers.
- What it is | A DeepMind paper: the deterministic gradient with deep networks on twenty simulated tasks, some from pixels.
- Why it matters | The reference continuous-control method of its time; its ablation: "target networks matter a lot".
:::

::: small
**What breaks** — the theorem needs a critic $Q_w$, and a critic trained on its own targets was Lecture 8's instability.
**The change** — Lecture 8's replay buffer and target copies, permitted now because the target reads $\mu(s')$, not the data's next action.
:::

::: cols
::: col The two losses
**Critic**, by Bellman error on a replayed minibatch, with target copies $w^-$, $\theta^-$:

$$\begin{aligned}y_i&=r_i+\gamma\,Q_{\red{w^-}}\big(s_i',\mu_{\red{\theta^-}}(s_i')\big)\\ L(w)&=\tfrac1N\textstyle\sum_i\big(Q_w(s_i,a_i)-y_i\big)^2\end{aligned}$$

**Actor**, by the deterministic policy gradient on the same states:

$$\nabla_\theta J\approx\frac1N\sum_i\nabla_\theta\mu_\theta(s_i)\,\nabla_aQ_w(s_i,a)\big|_{a=\mu_\theta(s_i)}$$
:::
::: col.accent The stabilisers, returning
**Replay buffer**: off-policy is now permitted, so use it.\
**Target networks** $w^-$, $\theta^-$, updated softly every step.\
$w^-\leftarrow\tau w+(1-\tau)w^-$, not copied every $C$ steps.\
**Exploration noise** added to $\mu_\theta(s)$ when acting.
:::
:::

::: reveal
::: keypoint
Lecture 8's recipe with the max replaced: ==the critic learns from replay, the actor climbs it.==
:::
:::

::: note
Source pp. 48–50 and 66–67: the timeline DQN (2013) → DPG (ICML 2014) → DDPG (ICLR 2016); the architecture, a value network and a deterministic policy network, the action fed back into the critic, the OU process added to the action, "+ target network, + experience replay". Soft target updates with τ ≪ 1 every step rather than DQN's hard copy every C steps, a small real difference from Lecture 8. The source's critic loss on p. 66 is missing a bracket; the intended form is written here.
:::

### Algorithm — DDPG
::: algorithm DDPG | input actor $\mu_\theta$, critic $Q_w$, noise process, step sizes; output $\theta$
[initialise] $\theta$, $w$; targets $\theta^-\leftarrow\theta$, $w^-\leftarrow w$; an empty replay buffer $D$
[for each] episode
  [start] $s\leftarrow s_0$; reset the noise process
  [for each] step
    [act] $a\leftarrow\mu_\theta(s)+\epsilon_t$; take $a$, observe $r$, $s'$; store $(s,a,r,s')$ in $D$ // the behaviour policy is the actor plus noise
    [sample] a minibatch of $N$ transitions from $D$ // off-policy: any past transition will do
    [critic] $y_i\leftarrow r_i+\gamma Q_{w^-}(s_i',\mu_{\theta^-}(s_i'))$; $\;w\leftarrow w-\alpha_w\nabla_w\frac1N\sum_i(Q_w(s_i,a_i)-y_i)^2$ // Lecture 8's target, the max replaced by the target actor
  ! [learn] $\theta\leftarrow\theta+\alpha_\theta\,\frac1N\sum_i\nabla_\theta\mu_\theta(s_i)\,\red{\nabla_aQ_w(s_i,a)\big|_{a=\mu_\theta(s_i)}}$ // the actor climbs the critic's slope
    [move] $\theta^-\leftarrow\tau\theta+(1-\tau)\theta^-$, $\;w^-\leftarrow\tau w+(1-\tau)w^-$; $\;s\leftarrow s'$ // soft target updates
---
the source's p. 67 annotates the paper's box in three places: "for every transition" on the inner loop, "gradually changing target networks" on the soft updates, "approximate it using minibatch samples" on the actor's expectation
:::

::: note
The box the next demo runs, on the heater: a quadratic critic, a one-parameter actor, Gaussian exploration noise in place of the OU process, two critic minibatches per actor step. Compare Lecture 8's DQN box: the same replay, the same target copy, and the lit line writes into the actor instead of reading a max. Act 2's actor–critic was on-policy and could not use a buffer; this one can, for the reason the deterministic slide gave.
:::

### DDPG, run on the heater — the actor climbs the critic
::: widget ddpg-gain {"seed":2}
A quadratic critic $Q_w(x,u)$ fitted by TD from a replay buffer, the actor $u=-kx$ climbing $\partial Q/\partial u$; $\gamma=0.9$ here, so that a stationary critic exists.
Early on the critic is wrong and ==the actor follows it anyway==; then both settle on the discounted Riccati gain, $0.588$ rather than $0.618$.
:::

::: reveal
::: keypoint
The dashed curve is the true critic of the current gain, which the agent never sees; the amber arrow is the slope the actor follows.
:::
:::

::: note
γ = 0.9 here, so that a stationary critic exists under exploration noise; the discounted Riccati gain is 0.588, against 0.618 for the undiscounted problem of Acts 1 and 2. Verified in node: the true critic of any gain is exactly quadratic, w = (−1 − γP_k, −2γP_k, −1 − γP_k) with P_k = (1 + k²)/(1 − γ(1 − k)²); from k = 1.15 the gain falls to about 0.2 while the critic is still wrong, then returns and settles at 0.59 by update 300 with the critic's weights within 0.01 of the exact ones. Turning the target copies off changes nothing visible on this linear problem, so the widget has no such switch; "target networks matter" is the paper's finding on MuJoCo, not something this heater can show.
:::

### $\mu_\theta(s)$ and $K$ — the same role, a different procedure
::: table center
| | LQR *(Lecture 9, Act 2)* | DDPG *(here)* |
|---|---|---|
| the controller | $u=-Kx$ | $a=\mu_\theta(s)$ |
| how it is obtained | solve the Riccati equation | ascend $\nabla_aQ$ from samples |
| what it needs | the model $A$, $B$, $Q$, $R$ | ==sampled transitions, nothing else== |
| what it is | an $m\times n$ matrix | a neural network |
| what is guaranteed | the global optimum, under the LQ assumptions | no general guarantee of a local or global optimum |
:::

::: reveal
::: keypoint
Same role, a state-to-action feedback rule; different procedure, and different guarantees.
On the heater the learned gain sits beside the Riccati gain, which is the one place the two can be compared.
:::
:::

::: note
This is Lecture 9's closing promise kept: "a learned actor μ_θ(s) is a more general policy class in the same place; it is not guaranteed to recover this optimum". The demo compares them on the one system where the optimum is known. Success on an LQ benchmark illustrates the feedback role; it is not a convergence guarantee for policy gradients or DDPG.
:::

### A deterministic actor explores nothing — and uniform noise is the wrong repair
::: widget pg-pictures {"mode":"noise"}
White noise against an Ornstein–Uhlenbeck path over one episode, and their running sums beneath.
==A pendulum swing-up needs the sum to grow in one direction==; independent noise averages to nothing.
:::

::: reveal
::: small
Random actions send the update where the critic has no evidence: Lecture 5's surrogate-exploitation hazard, in an RL costume.
Exploring unseen states needs action that is consistent along the episode, not resampled each step.
On real hardware, rapid random input changes strain actuators.
:::
:::

::: reveal
::: keypoint
Hence temporally correlated noise $\epsilon_t$, $d\epsilon_t=-\kappa\,\epsilon_t\,dt+\sigma\,dW_t$, added to $\mu_\theta(s)$: exploration that pushes rather than jitters.
:::
:::

::: note
Source pp. 62–65. The three reasons of p. 63 are verbatim in substance; the third is the only place in the course where a physical constraint decides an algorithm. The pendulum of p. 64: push in a consistent direction until near upright, then alternate; a random behaviour policy "might find it, but only after consuming a lot of samples". The OU process of p. 65 is written with κ for the mean-reversion rate, because θ is the policy parameter everywhere else in this lecture. The demo on the heater used Gaussian noise, which is enough for a one-dimensional linear system.
:::

### TD3 — keep the actor, repair three failures of the critic
{sub: Fujimoto, van Hoof and Meger, "Addressing Function Approximation Error in Actor-Critic Methods" · ICML 2018}

::: paper
- Why it is here | The repair of DDPG's critic that Lecture 12 starts from: an actor exploiting a high critic value.
- What it is | Overestimation in actor–critic analysed, with three changes to the target and the timing.
- Why it matters | The deterministic baseline since 2018; with behaviour cloning it is Lecture 12's method.
:::

::: small
**What breaks** — the actor climbs wherever $Q_w$ is too high, and the critic's own errors are exactly where it is too high.
**The change** — a smaller, smoother target from two critics, and an actor that waits for the critic to settle.
:::

::: algorithm TD3, the lines that differ from DDPG | two critics $Q_{w_1},Q_{w_2}$, a delay $d$, target noise $\epsilon\sim\mathcal N(0,\sigma)$ clipped to $[-c,c]$
[target action] $\tilde a'\leftarrow\operatorname{clip}\big(\mu_{\theta^-}(s')+\operatorname{clip}(\epsilon,-c,c),\,a_{\min},a_{\max}\big)$ // target policy smoothing: average over nearby actions, not a narrow peak
[critics] $y\leftarrow r+\gamma\,\red{\min_{i=1,2}}Q_{w_i^-}(s',\tilde a')$ // clipped double Q: both critics regress to the smaller target
! [learn] every $\red{d}$ critic updates only: DDPG's actor step, climbing $Q_{w_1}$ // delayed policy update: the critic settles first
---
everything else is the DDPG box; smoothing noise on the target is separate from the exploration noise used to collect data
:::

::: reveal
::: keypoint
A smaller target addresses one error mechanism; it is not a certified lower bound on the true return.
Critics can share errors, which is where Lecture 12 begins.
:::
:::

::: note
As Lecture 8 set SARSA against Q-learning by the one line that differs, this box lists only TD3's three changed lines; the rest is DDPG's. Numbers for the board, if asked: r = 1, γ = 0.9, target action 0.6 after smoothing, critics 8 and 6 at that action: y = 1 + 0.9 × 6 = 6.4 against 8.2 from the first critic alone; a terminal transition gives y = 1. The two critics each regress to this target, and on delayed steps the actor climbs the first critic.
:::

### SAC — a stochastic actor, trained from replay, rewarded for entropy
{sub: Haarnoja, Zhou, Abbeel and Levine, "Soft Actor-Critic: Off-Policy Maximum Entropy Deep Reinforcement Learning with a Stochastic Actor" · ICML 2018}

::: paper
- Why it is here | The other repair: a stochastic actor, exploration in the objective, the critic still off-policy.
- What it is | Berkeley: the maximum-entropy objective inside an off-policy actor–critic with twin critics.
- Why it matters | With PPO, a default continuous-control algorithm since 2018; Lecture 11's MBPO trains it.
:::

::: small
**What breaks** — a deterministic actor explores nothing, and the noise bolted on to it is not part of what is optimised.
**The change** — a stochastic actor, still trained from replay, with the entropy of its actions added to the objective.
:::

**The objective** — the return, with the entropy $\mathcal H$ of the action distribution added at every step, $\alpha_H>0$ the temperature:

$$J(\pi)=\E_\pi\Big[\sum_t\gamma^t\big(r_{t+1}\;\red{+\;\alpha_H\,\mathcal H(\pi(\cdot\mid s_t))}\big)\Big]$$

::: reveal
::: keypoint
Once entropy earns a bonus, spreading over near-equal actions can beat the single best one.
==The objective values entropy as well as reward.==
:::
:::

::: note
Numbers for the board, if asked: two actions with rewards 2 and 1.8 at α_H = 0.5; always the first scores 2, each with probability one half scores 1.9 + 0.5 log 2 = 2.247, so the mixture wins between these two candidates. Continuous SAC uses a density and differential entropy. The learning loop, a soft target for twin critics and an actor that trades critic value against lost entropy, is the next slide's box. Neither replay nor entropy fixes missing coverage in a fixed offline log, which is Lecture 12. α_H is the temperature, not a step size. The actor samples through the reparameterisation of Lecture 6; PPO's entropy bonus is the seed, SAC's objective the plant.
:::

### Algorithm — SAC, the lines that differ from TD3
::: algorithm SAC, the lines that differ from TD3 | a stochastic actor $\pi_\theta$, twin critics $Q_{w_1},Q_{w_2}$, temperature $\alpha_H$
[act] $a\sim\pi_\theta(\cdot\mid s)$ // the actor's own spread explores: no noise process
[target action] $a'\sim\pi_\theta(\cdot\mid s')$ // a sample, not a smoothed point
[critics] $y\leftarrow r+\gamma\big[\min_jQ_{w_j^-}(s',a')\;\red{-\;\alpha_H\log\pi_\theta(a'\mid s')}\big]$ // the soft target: the next step's entropy is paid in
! [learn] $\theta\leftarrow\theta-\alpha_\theta\nabla_\theta\tfrac1N\sum_i[\alpha_H\log\pi_\theta(a_i\mid s_i)-\min_jQ_{w_j}(s_i,a_i)]$ // climb the smaller critic, keep the entropy; a_i reparameterised, Lecture 6
[temperature] $\alpha_H$ moved so that the actor's entropy stays near a target // the 2019 version; the 2018 paper fixes it
---
everything else is TD3's box: replay, twin critics, soft target copies; the actor step is not delayed
:::

::: note
Against TD3's box line by line: the behaviour policy is the actor itself; the target action is a sample rather than a smoothed deterministic action, and the entropy term joins the target; the actor's loss trades the smaller critic against the log-density, differentiated through the sample by reparameterisation, Lecture 6's trick; the clipped double Q and the soft target copies stay. The temperature line is the automatic-entropy version of Haarnoja et al. 2019; the ICML 2018 paper used a fixed α_H and a separate state-value network. On the heater a Gaussian actor with a learned σ would shrink σ towards the entropy target rather than to zero. TD3, SAC and PPO now each have a box; DPG is a theorem and keeps its derivation.
:::

### Check — the deterministic gradient
{q: 3}

::: quiz DDPG trains a critic $Q(s,a)$ and a deterministic actor $\mu(s)$.<br>How does the actor get its gradient?
- By finite differences on the environment
- By sampling actions and weighting their scores by returns, $\nabla_\theta\log\pi_\theta(a\mid s)\,G_t$, as in REINFORCE
- =By backpropagating through the critic: $\nabla_\theta Q(s,\mu_\theta(s))$, since the critic is differentiable in the action
- By solving the $\argmax$ exactly at each step and regressing onto the result
The critic is a differentiable surrogate for how good this action is here, so the actor can be moved uphill on it by the chain rule; no action sampling is needed inside the deterministic gradient, and the states still come from data. Notice what has been re-created: an optimiser climbing a learned model of the objective, which is Lecture 5's setup exactly. Lecture 12 shows it failing in the same way.
:::

## Act 4 — stepping without falling
{short: ACT 4, num: Act 4}

**Q4.** We have a gradient and have tamed its variance.\
How far along it dare we step?

### Act 4 on the map
{q: 4}

::: qstrip
:::

::: widget control-grid {"cell":"prl","dim":true,"arrow":"f","outer":"dim"}
The same cell once more.
==Not what the gradient is, but how large a step to take along it.==
:::

### The policy makes its own next batch
::: widget pg-pictures {"mode":"loop"}
In supervised learning a bad step costs one bad update; the next minibatch comes from the same fixed dataset and pulls you back.
Here ==the next batch is collected by the policy the step produced==, and a step that leaves the region the batch describes is self-reinforcing.
:::

::: reveal
::: keypoint
The parameter step is the wrong thing to bound: a tiny change in $\theta$ can change the behaviour a lot, a large one not at all.
What must be bounded is ==the distance between the old and the new action distributions.==
:::
:::

::: note
Press one: one large step out of the region where the batch is evidence; the gradient estimated there pointed somewhere else again, and every subsequent sample now comes from the bad policy. Press two: the KL ball around π_old, Lecture 1's trust region measured in behaviour rather than in parameters. A sensitive network or a Gaussian policy with very small variance makes the parameter distance meaningless as a measure of change.
:::

### A trust region in policy space — TRPO
{sub: Schulman, Levine, Moritz, Jordan and Abbeel, "Trust Region Policy Optimization" · ICML 2015}

::: paper
- Why it is here | The first method to bound a policy step in behaviour space; Act 2's ratio was kept for it.
- What it is | Berkeley: a monotonic-improvement bound, and a surrogate maximised inside a KL ball.
- Why it matters | The theory behind PPO, and where Lecture 1's trust region re-enters in a new metric.
:::

::: small
**What breaks** — the batch comes from the policy being changed, so a step that is large in behaviour spoils its own next batch.
**The change** — measure the step by how far the behaviour moves, and keep it inside a ball of that measure.
:::

**The constrained step** — maximise the importance-weighted advantage $\hat A$ of Act 2, inside a ball of $D_{\mathrm{KL}}$, Lecture 6's divergence, around the policy that collected the data:

$$\max_\theta\ \E_{s\sim\rho^{\pi_{\mathrm{old}}},\,a\sim\pi_{\mathrm{old}}}\Big[\red{\frac{\pi_\theta(a\mid s)}{\pi_{\mathrm{old}}(a\mid s)}}\,\hat A(s,a)\Big]\quad\text{s.t.}\quad\red{\E_{s}\big[D_{\mathrm{KL}}\big(\pi_{\mathrm{old}}(\cdot\mid s)\,\|\,\pi_\theta(\cdot\mid s)\big)\big]\le\delta}$$

::: reveal
::: small
At $\theta=\theta_{\mathrm{old}}$ the ratio's gradient is the score, so this surrogate's slope is Act 2's policy gradient: the same step, now kept inside the ball.
:::
:::

::: reveal
::: keypoint
Lecture 1's trust region, with the radius measured in ==behaviour space== instead of parameter space.
The ratio is Act 2's importance weight, now read as the size of the step.
:::
:::

::: note
Source pp. 75–76: the off-policy objective with β, then β = π_old and the KL constraint; "in this way the old and new policies would not diverge too much", and the professor's own "(why?)" after the monotonic improvement claim, left as an exercise. The bound uses the maximum KL over states; the practical average-KL version does not by itself guarantee monotonic real return. Against Lecture 1's successive convexification: a quadratic model of f becomes a linear model of the advantage, the trust radius ρ in parameter space becomes the KL radius δ in behaviour space, and accept-or-shrink becomes a backtracking line search on the sampled KL and the surrogate improvement.
:::

### The natural-gradient step — the constrained problem in closed form
{fill: top, math: compact}

**From the KL ball to the step** — local models about $\theta_{\mathrm{old}}$, then a linear objective on an ellipsoid:

$$\begin{aligned}
L(\theta)&\approx g^\top(\theta-\theta_{\mathrm{old}}),\qquad g=\nabla_\theta L(\theta_{\mathrm{old}}) &&\red{\scriptstyle L\text{: the previous slide's surrogate, linearised}}\\
\step{1}{\bar D_{\mathrm{KL}}}&\step{1}{\approx\tfrac12(\theta-\theta_{\mathrm{old}})^\top H\,(\theta-\theta_{\mathrm{old}}),\qquad H \text{ the Fisher matrix}} &&\step{1}{\red{\scriptstyle\text{the KL is zero and flat at } \theta_{\mathrm{old}}\text{; } H \text{ is its Hessian there}}}\\
\step{2}{\theta_{\mathrm{new}}}&\step{2}{=\theta_{\mathrm{old}}+\sqrt{\frac{2\delta}{g^\top H^{-1}g}}\;H^{-1}g} &&\step{2}{\red{\scriptstyle\text{a linear function on an ellipsoid: the natural gradient}}}\\
\step{3}{H^{-1}g}&\step{3}{\ \text{by conjugate gradient; then backtrack on the sampled KL}} &&\step{3}{\red{\scriptstyle\text{Lecture 1's accept-or-shrink}}}
\end{aligned}$$

::: reveal
::: keypoint
Second-order machinery for a first-order idea: stay where the surrogate is trusted.
PPO keeps the idea and throws the machinery away.
:::
:::

::: note
The derivation assumes an invertible positive-definite local Fisher matrix and a nonzero gradient; implementations add damping and use sampled estimates. Why the KL's leading term is quadratic: D_KL(π_old ‖ π_θ) is zero at θ_old and non-negative, so its gradient vanishes there and its Hessian is the Fisher information. PPO removes the second-order solve and inherits neither the hard trust region nor the monotonic-improvement guarantee.
:::

### Algorithm — TRPO
::: algorithm TRPO | input $\pi_\theta$, $V_w$, radius $\delta$; output $\theta$
[initialise] $\theta$, $w$
[repeat]
  [collect] $N$ episodes under $\pi_{\mathrm{old}}=\pi_\theta$; $\hat A_t$ by GAE from $V_w$ // the batch, collected as REINFORCE's box collects it
  [gradient] $g\leftarrow\nabla_\theta L(\theta)\big|_{\theta_{\mathrm{old}}}$ // the slope of the surrogate: Act 2's policy gradient
  [direction] $x\leftarrow H^{-1}g$ by conjugate gradient // $H$ is never formed, only multiplied with a vector
  ! [step] $\theta\leftarrow\theta_{\mathrm{old}}+\red{\sqrt{2\delta/(g^\top x)}}\;x$ // to the edge of the KL ball
  [check] halve the step until the sampled $\bar D_{\mathrm{KL}}\le\delta$ and $L$ has improved // Lecture 1's accept-or-shrink
  [critic] $w\leftarrow w-\alpha_w\nabla_w\frac1N\sum(V_w(s_t)-G_t)^2$ // regress on the batch's returns
---
one constrained step per batch; the direction, the step and the check are the three lines PPO removes
:::

::: note
Algorithm 1 of Schulman et al. 2015 in the previous slide's symbols: g and H are the linearised surrogate and the Fisher matrix, x the natural-gradient direction, and the square root scales the step to the ball's edge. The conjugate-gradient solve uses ten or so Fisher-vector products, each one backward pass. The line search is the guard that the quadratic model of the KL is only local. PPO's box keeps collect, advantage and critic and replaces the three middle lines with K epochs of a clipped first-order step.
:::

### PPO — remove the incentive to leave the region
{sub: Schulman, Wolski, Dhariwal, Radford and Klimov, "Proximal Policy Optimization Algorithms" · arXiv 2017}

::: paper
- Why it is here | TRPO's idea with first-order machinery: the objective, not a constraint, bounds the step.
- What it is | An OpenAI paper: the clipped surrogate, and the multi-epoch minibatch update that goes with it.
- Why it matters | The default policy-gradient method since; the RL stage of InstructGPT was trained with it.
:::

::: small
**What breaks** — TRPO buys its guarantee with a conjugate-gradient solve and a line search on every step.
**The change** — clip the ratio inside the objective, so that it goes flat outside the region and no constraint is needed.
:::

**The clipped surrogate** — with the ratio $r(\theta)=\pi_\theta(a\mid s)/\pi_{\mathrm{old}}(a\mid s)$, the paper's letter, not a reward:

$$J^{\mathrm{CLIP}}(\theta)=\E\Big[\min\big(r(\theta)\,\hat A,\ \red{\operatorname{clip}\big(r(\theta),\,1-\epsilon,\,1+\epsilon\big)}\,\hat A\big)\Big]$$

::: reveal
::: keypoint
No conjugate gradient, no line search.
Once the ratio leaves $[1-\epsilon,1+\epsilon]$ in the direction of the push, the objective goes flat: ==the incentive is removed.==
:::
:::

::: reveal
::: small
With shared actor–critic parameters the practical objective adds $-c_1(V_\theta(s)-V_{\mathrm{target}})^2$ for the critic and $+c_2\,\mathcal H(\pi_\theta(\cdot\mid s))$ for exploration.
Clipping is not a hard bound on every ratio or on the KL.
:::
:::

::: note
Source pp. 77–78: "given that TRPO is relatively complicated and we still want to implement a similar constraint, PPO simplifies it by using a clipped surrogate objective while retaining similar performance", and the reason, that without a limit on the distance between θ_old and θ the surrogate would be maximised with extremely large updates and big ratios. The shared-parameter objective of p. 78 with c_1, c_2 and the entropy bonus "to encourage sufficient exploration".
:::

### Algorithm — PPO
::: algorithm PPO | input $\pi_\theta$, $V_w$, clip $\epsilon$, epochs $K$, minibatch size $M$; output $\theta$
[initialise] $\theta$, $w$
[repeat]
  [collect] $N$ episodes under $\pi_{\mathrm{old}}=\pi_\theta$; store $(s_t,a_t,\log\pi_{\mathrm{old}}(a_t\mid s_t))$ // the batch, and the probabilities it was collected with
  [advantage] $\hat A_t$ by GAE from $V_w$ // Act 2's rung 6
  [for each] epoch $1,\dots,K$, minibatch of size $M$
  ! [learn] $\theta\leftarrow\theta+\alpha\,\nabla_\theta\,\frac1M\sum\min\big(r(\theta)\hat A,\ \red{\operatorname{clip}(r(\theta),1-\epsilon,1+\epsilon)}\hat A\big)$ // several passes over one batch, the clip keeps them honest
    [critic] $w\leftarrow w-\alpha_w\nabla_w\frac1M\sum(V_w(s_t)-G_t)^2$ // regress on the batch's returns
  [move] $\pi_{\mathrm{old}}\leftarrow\pi_\theta$ // the new policy collects the next batch
---
the demo two slides on runs the lit line to its end on one batch, with and without the clip, on the heater's one-parameter policy
:::

::: note
Compare REINFORCE's box: the same collect, a GAE advantage in place of the return, and the one new thing, several epochs on the same batch. Without the clip those epochs would maximise a surrogate far from where it is trusted; the next two slides show why that matters.
:::

### The clip, and the asymmetry nobody mentions
::: widget ppo-clip {"eps":0.2}
The clipped objective as a function of the ratio, for a good action and a bad one.
For $\hat A>0$ the gradient is ==exactly zero above $1+\epsilon$==; for $\hat A<0$ it is zero below $1-\epsilon$ and ==stays alive above $1+\epsilon$.==
:::

::: reveal
::: keypoint
The clip removes only the incentive that would take the policy out of the region.
An action already too probable and known to be bad keeps being pushed down.
:::
:::

::: note
Numbers for the board, ε = 0.2: advantage +2 and ratio 1.4 give 2.8 unclipped, 2.4 clipped, PPO keeps 2.4; advantage −2 and ratio 0.6 give −1.2 and −1.6, PPO keeps −1.6; advantage −2 and ratio 1.4 give −2.8 and −2.4, PPO keeps −2.8, the gradient alive. Verified in node by central differences: for A = +1 the slope is 1 below 1.2 and 0 above; for A = −1 it is 0 below 0.8 and −1 all the way up.
:::

### PPO, run on the gain — maximise the surrogate to the end
::: widget ppo-gain {"seed":1}
The heater's Gaussian gain policy: one batch under $k_{\mathrm{old}}$, then the surrogate maximised over $k$ on that batch, fully.
==The plain surrogate keeps promising as $k$ leaves $k_{\mathrm{old}}$ and the gain jumps anywhere; the clipped one goes flat and the step stays small.==
:::

::: reveal
::: keypoint
The batch is evidence about gains near the one that collected it; the clip is what lets PPO take several epochs on it safely.
:::
:::

::: note
Verified in node, seeds 1 to 4, ε = 0.2: full maximisation of the plain surrogate per batch sends the gain 1.15 → 0.82 → 0.66 → 0.44 → 1.60 → … → 3.00, and on seed 2 to −1.00, unstable both ways; the clipped surrogate moves it by 0.05 to 0.1 per iteration and settles around 0.6 ± 0.07. On one batch at k_old = 1.15 the plain surrogate reads 0.6, 1.9, 3.7, 4.2 at k = 1.0, 0.8, 0.6, 0.4 and is still positive at k = 0, while the clipped one peaks near k = 1.0 at 0.20 and is negative by k = 0.6. Ratios outside [0.8, 1.2]: 5 of 192 at a step of 0.05 in k, 91 at 0.4. The ε button changes the width of the flat region.
:::

### PPO and SAC — two complete learning procedures
::: table center
| | PPO | SAC |
|---|---|---|
| which data | recent rollouts, reused for a few epochs | a replay buffer from earlier policies |
| what guides the actor | an estimated advantage, through the clipped ratio | soft $Q$ estimates and an entropy term |
| what controls the step | the clip removes the incentive to leave the ratio interval | an entropy temperature and the critic's slope |
| how exploration enters | a stochastic policy, often an entropy bonus | entropy is part of the stated objective |
:::

::: reveal
::: keypoint
Compare return, environment steps and computation under one evaluation protocol.
TD3 is the deterministic off-policy comparison; Lecture 12 removes further interaction altogether.
:::
:::

::: note
Both use stochastic neural policies in continuous control. PPO's clip is not a hard KL guarantee; SAC's replay is not a guarantee that arbitrary offline data will suffice. The two are the field's default choices since 2018, on-policy and off-policy respectively.
:::

### Check — why large policy changes are discouraged
{q: 4}

::: quiz PPO discourages large policy updates through its clipped surrogate.<br>Why are large changes risky?
- The gradient estimate becomes biased
- The value function stops converging
- The policy becomes deterministic too quickly
- =The batch was collected under the old policy and says nothing about policies far from it
On-policy data are only evidence about policies near the one that gathered them. A large update leaves that neighbourhood, and the objective being maximised is then a surrogate evaluated well outside its region of validity: Lecture 1's trust region, arrived at from a different direction, and the same adversarial-optimiser problem as Lecture 5. The heater demo showed it: the plain surrogate sent the gain to 3.0 and to −1.0, both unstable.
:::

## Closing
{short: CLOSING}

Both lineages have now had the model taken away. The grid is full.

### Where we are — the cell, filled
::: widget control-grid {"cells":["vrl","prl"],"arrow":"both","dim":true}
Both model-free cells are done, one deletion each.
==Delete the model, sample instead==: made twice, one lecture apart.
:::

::: reveal
::: keypoint
Lineage A: Lecture 7's MDP lost $P$ and $R$ and became value-based RL.
Lineage B: Lecture 9's optimal control lost $f$ and became policy-based RL.
:::
:::

::: note
The same figure as the opening with both model-free cells lit and both arrows emphasised, as Lecture 9's closing lit its two cells. The empty continuous-time row of the model-free layer stays empty; this course does not go there.
:::

### The ladder, complete — one gradient, then two tokens changed
::: widget mdp-pictures {"mode":"ladder","start":0,"upto":5,"plates":[{"title":"REINFORCE","line":"for each step t of a finished episode:","formula":"∇_θ J = \\text{E}[ \\sum_t ∇_θ \\log π_θ(a_t|s_t) \\, \\red{R(τ)} ]","note":"the whole return weights every score","loop":"one episode per update"},{"title":"Advantage","line":"for each step t, with a learned baseline:","formula":"∇_θ J = \\text{E}[ \\sum_t ∇_θ \\log π_θ(a_t|s_t) \\, \\red{(\\sum_{t′≥t} r_{t′+1} − b(s_t))} ]","note":"reward to go, minus what the state usually gives","loop":"refit b each update"},{"title":"Actor–critic, GAE","line":"for each step t, with a critic V_w:","formula":"∇_θ J ≈ \\text{E}[ \\sum_t ∇_θ \\log π_θ(a_t|s_t) \\, \\red{\\sum_l (γλ)^l δ_{t+l}} ]","note":"TD errors in place of returns: bias for variance","loop":"one transition per update"},{"title":"DPG, DDPG, TD3, SAC","line":"for each replayed state s, an actor that climbs the critic:","formula":"∇_θ J = \\text{E}_{s∼ρ}[ \\red{∇_θ μ_θ(s) \\, ∇_a Q_w(s,a)|_{a=μ_θ(s)}} ]","note":"the score is gone; SAC samples the action and adds an entropy bonus","loop":"off-policy, from a buffer"},{"title":"TRPO","line":"for a batch under π_old, inside a KL ball:","formula":"\\max_θ \\text{E}[ \\red{π_θ(a|s)/π_{old}(a|s)} \\, Â ] \\quad \\text{s.t.}\\quad \\text{KL}(π_{old} ‖ π_θ) ≤ δ","note":"the ratio measures the step; the ball bounds it","loop":"one constrained step per batch"},{"title":"PPO","line":"for K epochs on the same batch:","formula":"\\max_θ \\text{E}[ \\min( r Â, \\red{\\text{clip}(r, 1−ε, 1+ε)} Â ) ]","note":"the constraint becomes a flat objective","loop":"K epochs per batch"}]}
Act 2 changed the weight on the score; ==Act 3 replaced the score, Act 4 wrapped the weight.==
Six plates, and every method of the lecture is one of them with one token changed.
:::

::: note
The Act 2 ladder is compressed to its first and last rungs here so that the other acts fit: rungs 2 to 4 are the advantage plate, rungs 5 and 6 the actor–critic plate. DPG changes a different token from the rest: the score ∇ log π_θ is replaced by the chain rule through the action, which is why its plate reads as a break in the pattern. TRPO and PPO keep the score and the advantage and act on the ratio.
:::

### Optimal control, learned — the translation table
::: table center
| Lecture 9 (optimal control) | Lecture 10 (policy-based RL) | what replaces the model |
|---|---|---|
| the value field $V(t,x)$, HJB | the critic $V_w$, $Q_w$ | a learned value |
| the feedback law $u=-Kx$ | the actor $\pi_\theta(a\mid s)$, $\mu_\theta(s)$ | a learned controller |
| known dynamics $\dot x=f(x,u)$ | sampled transitions $(s,a,r,s')$ | the environment itself |
| the backup over states | Route 1: the gradient's own backup | $P$ as a weight, never differentiated |
| conditions along one trajectory | Route 2: the score along one episode | the log-derivative trick |
| solve Riccati or HJB | gradient ascent on $J(\theta)$ | stochastic optimisation |
| controllability of $(A,B)$ | sufficient exploration | a reachability assumption, either way |
:::

::: reveal
::: keypoint
Nothing here is a new principle.
==Policy gradient is optimal control with $f$ deleted and replaced by data==; the two routes of Act 1 are Lecture 9's two views, learned.
:::
:::

::: note
Read column three: Lecture 9's programme with the one piece we no longer own swapped out. DDPG's actor is the learned cousin of LQR's gain; REINFORCE uses trajectories as Pontryagin did, but the score-function gradient is a different mathematical argument from the costate equations, and the table says "view", not "derivation".
:::

### What we hand on
::: flow |
- **Lecture 10 leaves** | the trust-region machinery, a KL ball and a clip; SAC and TD3 as the off-policy actors
- !**Lecture 11 puts the model back** | learned, and lets the two lineages rejoin
:::

::: reveal
::: small
Lecture 11 adds a learned model: MBPO trains SAC on short synthetic rollouts, Dreamer trains an actor and a critic in latent imagination.
Lecture 12 starts from TD3 and adds behaviour cloning when fresh interaction is unavailable.
:::
:::

::: note
Lecture 1 and TRPO both control where a local approximation is trusted, in different metrics with different acceptance rules; PPO changes incentives in its sampled objective and imposes no hard KL bound. Lecture 12 adds a further issue, evaluating a changed policy from a fixed log.
:::

### Notation — the symbols of this lecture
{sub: and where they differ from Lectures 8 and 9}

::: table center
| Symbol | Meaning | Symbol | Meaning |
|---|---|---|---|
| $\pi_\theta(a\mid s)$, $\mu_\theta(s)$ | a stochastic and a deterministic policy | $x$, $u$, $k$ | the heater's state, control and gain |
| $\nabla_\theta\log\pi_\theta(a\mid s)$ | the score of the policy, Lecture 2's | $\Psi_t$ | the weight on the score, rung by rung |
| $d^\pi$, $\rho^\mu$ | how often a policy visits each state | $\beta$, $\pi_{\mathrm{old}}$ | the behaviour policy; the batch's policy |
| $V_w$, $Q_w$ | the critic; targets $w^-$, $\theta^-$ | $r(\theta)$ | the ratio $\pi_\theta/\pi_{\mathrm{old}}$ |
| $G_t$, $\hat Q_t$ | the return after $t$; the reward to go | $\alpha$, $\alpha_H$, $\kappa$ | step size; entropy temperature; OU rate |
| $A^\pi$, $\hat A$, $\delta_t$ | the advantage, its estimate, the TD error | $\epsilon$ | PPO's clip, or exploration noise |
:::

::: note
ρ^π(s→s',k) on the Route 1 slide is the k-step reach probability, not a distribution over states; d^π and ρ^μ are. Three clashes to say aloud: θ is the policy parameter everywhere, so the OU rate is κ; the source uses β for a general behaviour policy and μ′ for DDPG's, which is μ_θ plus noise; α is a step size and α_H the entropy temperature. Q is the action value here, not Lecture 9's cost weight.
:::

### Reading guide — learn feedback, then test the critic and the data regime
{sub: one main idea to explain, one comparison, one application}

| Role | Read or revisit | Question to answer |
|---|---|---|
| **Core** | Sutton, McAllester, Singh and Mansour, *Policy gradient methods for RL with function approximation* (2000); [Schulman et al., PPO (2017)](https://arxiv.org/abs/1707.06347) | Why does the model drop out of the gradient, and how is an advantage used while discouraging large steps? |
| **Compare** | [Haarnoja et al., SAC (ICML 2018)](https://proceedings.mlr.press/v80/haarnoja18b.html); [Fujimoto et al., TD3 (ICML 2018)](https://proceedings.mlr.press/v80/fujimoto18a.html) | What changes when learning from replay, with twin critics, or with entropy in the objective? |
| **Apply** | The heater through the four acts, REINFORCE to PPO | Does a better critic score imply a better real controller? |

::: keypoint
Multi-agent DDPG (Lowe et al., 2017) belongs to the multi-agent face of the map and is taught in IE579.
Derive REINFORCE and DPG first; then compare PPO and SAC as two complete procedures.
:::

### The dynamics never solved, only experienced; the controller learned, not derived.
{layout: standout}

One theorem, two routes, and three ways of using it:\
a better weight on the score, a critic to climb, a step that stays where the batch is evidence.

### Questions?
{layout: standout}

Lecture 8 learned action values; this lecture learned feedback policies.\
Explain the policy gradient from the backup and from the trajectory.\
Then distinguish DDPG's deterministic actor, PPO's clipped step and SAC's entropy.\
Which learned model would let each of them use fewer real interactions?
