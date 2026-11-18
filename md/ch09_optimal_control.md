---
ch: 9
title: Optimal Control & Planning
subtitle: The control-theoretic origin of sequential decision making
tagline: Lecture 7 solved the dynamic optimum with operations research; *this is the other tradition.*
blurb: >-
  Sequential decision making's other parent. Control theory arrives where dynamic programming did
  by a different road: the same backup with a continuum of controls, the Riccati recursion as value
  iteration on a matrix, the HJB equation as the Bellman equation made infinitesimal, and
  Pontryagin's minimum principle as the view along one trajectory. It hands back a feedback law
  instead of a table of values.
course: IE437 · Data-Driven Decision Making and Control
author: Jinkyoo Park
institute: KAIST
lineage: B
lineage_here: mb-B
cube:
  stages: dynamic
  model: model-based
  agents: single agent
inherits: dynamic decision making's second parent — control theory, alongside Lecture 7's OR
handoff: the feedback law γ(x), u = -Kx (Lecture 10)
questions:
  - Same problem?
  - LQR feedback?
  - HJB meaning?
  - Two views?
---

### Optimal Control & Planning
{layout: title}

### Where we are — the other column of the map
::: widget control-grid {}
The course cube puts Lectures 7 and 9 in one cell: single agent, dynamic, model-based.
One level down two finer coordinates appear: ==how large the action set is, and whether time ticks or flows.==
:::

::: reveal
::: keypoint
Lecture 7 read this grid across the columns.
Today reads it down the right-hand column: the same backup, with a continuum of controls.
:::
:::

::: note
Source pp. 4–5, the professor's own overview figure, redrawn. The outer 2×2 is the course cube's cell; the zoom shows action space against time space, and the model axis as the vertical arrow that acts on both columns at once: 7 → 8 on the left, 9 → 10 on the right. The empty continuous-time row of the model-free layer is the source deck's own and stays empty.
:::

### Learning route — the same backup, four times
::: flow
- **Act 1 · same problem** | the backup with a continuum of controls
- **Act 2 · LQR** | the Riccati recursion: value iteration on a matrix
- **Act 3 · HJB** | let time flow: the backup becomes a PDE
- **Act 4 · the other view** | one trajectory and its costate
:::

::: small
**Bring from Lecture 7:** the Bellman optimality equation, value iteration, the backup tree.
**Bring from Lecture 8:** the wall it ended on, a max over a continuum of actions.
**Bring from Lecture 1:** a gradient set to zero, and a Lagrange multiplier.
:::

::: reveal
::: keypoint
One scalar system runs through the whole lecture: a heater, $x_{k+1}=x_k+u_k$, cost $x^2+u^2$.
Every derivation is worked on it, and every demo runs it.
:::
:::

::: note
First pass: Act 1 shows that control theory writes Lecture 7's recursion with one successor and a minimisation over a continuum; Act 2 solves the linear-quadratic case by the Riccati recursion and shows it is value iteration; Act 3 lets the time step go to zero and reaches the HJB equation, then the continuous-time LQ case; Act 4 is Pontryagin's view along one trajectory. Derivations are in the body, one line per press, each right after the idea it supports; cover or skip them on the spot.
:::

## Act 1 — it is the same problem
{short: ACT 1, num: Act 1}

**Q1.** Control theory writes different symbols.\
Is it solving anything different?

### Act 1 on the map
{q: 1}

::: qstrip
:::

::: widget control-grid {"cell":"dts","dim":true,"outer":"dim"}
Discrete time, a continuum of controls, the model $f$ known.
==Lecture 7's cell, with the finite action list replaced by a continuum.==
:::

::: note
The same figure returns at the start of every act with the current cell lit, as Lecture 8's map did. Act 1 and Act 2 stay in the discrete-time row; Acts 3 and 4 move down to continuous time.
:::

### Discrete-time optimal control — the problem, stated
**The discrete-time optimal control problem** — the object every act of this lecture solves:

$$L(u)=\sum_{k=0}^{K-1}g_k(x_k,u_k)+g_K(x_K),\qquad x_{k+1}=f_k(x_k,u_k),\quad u_k\in U_k,\quad k=0,\dots,K-1$$

::: reveal
**What is sought** — not a sequence of numbers but a rule from state to control, one per stage:

$$u_k=\hl{\gamma_k(x_k)},\qquad \gamma_k \text{ a permissible control strategy at stage } k$$
:::

::: reveal
::: keypoint
Control theory asks for a rule $\gamma_k$ from its first slide, for Lecture 7's reason.
==A rule is still valid from wherever the system actually lands.==
:::
:::

::: note
Source p. 8, verbatim in re-typed form. Translation to Lecture 7: x is the state s, u the action a, f the transition with one successor instead of a distribution, g a cost in place of a reward, and gamma_k the policy pi at stage k. The source's red phrase is "a control sequence", its tick is "gamma_k is a permissible control strategy": the two are the plan and the rule, and the whole HJB-against-Pontryagin distinction of Act 4 is already latent in that pair.
:::

### Dynamic programming, in control's notation
**The cost-to-go** — the minimum cost from any state $x$ at any stage $k$:

$$V(k,x)=\min_{\gamma_k,\dots,\gamma_{K-1}}\Big[\sum_{i=k}^{K-1}g_i(x_i,u_i)+g_K(x_K)\Big],\qquad x_k=x$$

::: reveal
::: small
**Bellman's principle of optimality:** whatever the initial state and decision are, ==the remaining decisions must be optimal== for the state that results.
:::
:::

::: reveal
**The recursion** — the principle applied once; Lecture 7's optimality backup, letter for letter:

$$V(k,x)=\min_{u_k\in U_k}\Big\{\,g_k(x,u_k)+V\big(k+1,\;\hl{f_k(x,u_k)}\big)\,\Big\}$$

::: keypoint
Each $u_k^*$ is read off as the minimiser of the right-hand side: ==a single-shot optimisation.==
:::
:::

::: note
Source p. 9. The phrase "single-shot optimization" is the source's own, in red: a problem that unfolds over time has been reduced to one static optimisation performed once per instant. It recurs as the pointwise minimisation in HJB (Act 3) and as the minimisation of H in Pontryagin (Act 4). Compare the Lecture 7 backup: a distribution over successors became one successor, a finite set of actions became a continuum, reward and max became cost and min. Two of the three are cosmetic; the continuum is not.
:::

### The backup, drawn — three branches become a wedge
::: widget backup-tree {"mode":"continuum"}
Lecture 7's optimality backup with the controls read off a continuum and the dynamics deterministic.
The max over three branches becomes ==a minimisation over a wedge==, and every chance node has one successor.
:::

::: reveal
::: keypoint
This is the wall Lecture 8 ended on: the inner minimisation is no longer a loop over a list.
==It is Lecture 1's optimisation problem, nested inside every backup.==
:::
:::

::: note
The tree is the one the students met in Lecture 7 (the optimality backup) and Lecture 8 (sampled). What changed: the decision edges are a continuum, so the max cannot be taken by trying each branch; the chance edges collapse because f is deterministic, so the expectation is a single point. Everything that follows is a way of coping with the continuum: a quadratic problem solved explicitly (Act 2), the smooth Bellman condition (Act 3), or conditions along one trajectory (Act 4).
:::

### Algorithm — backward dynamic programming with continuous controls
::: algorithm Backward dynamic programming | input $f_k$, $g_k$, $U_k$, horizon $K$; output $V(k,x)$ and the rules $\gamma_k$
[initialise] $V(K,x)\leftarrow g_K(x)$ for every $x$ // the terminal cost seeds the sweep
[for each] stage $k=K-1,\dots,0$ // backwards in time
  [for each] state $x$
    ! [learn] ${V(k,x)\leftarrow\red{\min_{u\in U_k}}\{\,g_k(x,u)+V(k+1,f_k(x,u))\,\}}$ // an optimisation, not a loop
    [read off] $\gamma_k(x)\leftarrow$ the minimising $u$ // the rule at $(k,x)$
---
Lecture 7's value iteration with two tokens changed: the sum over successors is one successor $f_k(x,u)$, and the loop over actions is a minimisation over a continuum
:::

::: note
The box the demos of Act 2 run. Two continua hide in it: the states x and the controls u. Act 2 removes both at once for the linear-quadratic case by carrying V in closed form, so that one sweep is exact over every state. In general the state loop needs a grid, which is the curse of dimensionality in Act 3's words.
:::

### One-step control — spend effort now to reduce the final error
::: widget heater-pictures {"mode":"parabola"}
The heater, one stage to go: $x_1=x_0+u$ from $x_0=2$, cost $J(u)=u^2+x_1^2$.
Three tried controls, then the whole curve: ==the minimum is in between.==
:::

::: reveal
::: keypoint
Reaching zero at once costs too much effort; doing nothing costs too much error.
For any $x_0$, $J(u)=u^2+(x_0+u)^2$ and $dJ/du=2u+2(x_0+u)=0$ give the rule ==$u^*(x)=-x/2$==.
:::
:::

::: note
The numbers, for the board: u = 0 gives 0 + 4 = 4; u = −1 gives 1 + 1 = 2; u = −2 gives 4 + 0 = 4. J(u) = u² + (2 + u)² = 2(u + 1)² + 2, minimised at u* = −1. For a general x: dJ/du = 2u + 2(x + u) = 0 gives u* = −x/2. This is the temperature thread's one-step problem: x is the measured temperature error, u the signed heating command, and (x + u)² + u² the one-step cost. It is also, as Act 2 will show, sweep one of the Riccati recursion.
:::

### Feedback — a rule, not a plan
::: widget heater-pictures {"mode":"feedback"}
The error over stages: the plan predicted $+1$ and fixed its command; the measurement says $+1.5$.
The plan keeps the command it computed; ==the rule $u^*(x)=-x/2$ recomputes it from the measured error.==
:::

::: reveal
::: keypoint
Feedback revises the decision after each measurement.
It does not require the previous prediction to have been correct.
:::
:::

::: note
Temperature thread, continuing the previous slide: from x₀ = 2 the plan applies u = −1 and predicts x₁ = +1, so it precomputes u₁ = −0.5 for that error. A disturbance lands the heater at x₁ = +1.5 instead. Reusing −0.5 ignores the new state and lands at +1.0; the rule reads −1.5/2 = −0.75 from the measured error and lands at +0.75. Ask the class to compute −0.75 before revealing the second press. Distinguish an action sequence computed once from a state-to-action rule used after each measurement: that is the plan-against-policy distinction of Lecture 7, and in Act 4 it becomes open-loop against feedback.
:::

### Check — the same problem, other clothes
{q: 1}

::: quiz Optimal control minimises a cost $\sum_k g(x_k,u_k)$ subject to dynamics $x_{k+1}=f(x_k,u_k)$.<br>Read as an MDP, what plays the role of the reward?
- =The negative of the cost, $-g(x,u)$: the two traditions differ by a sign and a vocabulary
- The dynamics $f$
- The control $u$
- The terminal constraint on $x(T)$
State is state, control is action, dynamics are the transition, and cost is negative reward. Operations research maximised a return; control theory minimises a cost; both solve the same object. Keeping the translation in view is what makes the second half of this course two parallel stories rather than two unrelated ones.
:::

## Act 2 — compute linear-quadratic feedback
{short: ACT 2, num: Act 2}

**Q2.** Linear dynamics, quadratic cost.\
Can the backup be carried in closed form?

### Act 2 on the map
{q: 2}

::: qstrip
:::

::: widget control-grid {"cell":"dts","dim":true,"outer":"dim"}
Still the discrete-time cell, now one special case of it: ==$f$ linear and $g$ quadratic.==
:::

::: note
Act 2 stays in discrete time on purpose: the Riccati recursion needs nothing but Act 1's backup, and it is the sharpest bridge to Lecture 7. The continuous-time LQ case comes after the HJB equation in Act 3, where it can be derived rather than asserted.
:::

### The infinite-horizon linear-quadratic problem
{sub: Kalman, Contributions to the theory of optimal control · Boletín de la Sociedad Matemática Mexicana 1960}

::: paper
- Why it is here | The one case of Act 1's backup that closes in a formula; the gain every later lecture compares a learned actor with.
- What it is | Linear dynamics and quadratic cost: the Riccati equation gives the optimal linear feedback.
- Why it matters | The local model that iLQR iterates on, and the known-model twin of Lecture 10's actor.
:::

**The problem** — choose $u_0,u_1,\dots$ to minimise an infinite sum under linear dynamics:

$$J=\sum_{\tau=0}^{\infty}\big(x_\tau^\top Qx_\tau+u_\tau^\top Ru_\tau\big),\qquad x_{\tau+1}=Ax_\tau+Bu_\tau,\quad x_0=x^{\text{init}},\qquad Q=Q^\top\succeq0,\ R=R^\top\succ0$$

::: reveal
::: keypoint
Infinitely many decisions, each a vector: ==an infinite-dimensional problem.==
The answer will be one matrix.
:::
:::

::: note
Source p. 10. The heater is the scalar case A = B = Q = R = 1. Sign convention for the whole lecture: the feedback law is written u = −Kx with K positive in the stable case; the source folds the minus into K and writes u = Kx. Q positive semidefinite: some state directions may be free of cost; R positive definite: every control costs something, which is what makes the inner minimisation strictly convex.
:::

### The hazard — a cost that is infinite for every input
::: widget heater-pictures {"mode":"unstable"}
$x_{t+1}=2x_t+0\cdot u_t$ from $x_0=1$: the state doubles and the input touches nothing.
==Every input sequence costs infinity==, so there is nothing to minimise.
:::

::: reveal
::: keypoint
Assume $(A,B)$ ==controllable==: some input steers any $x^{\text{init}}$ to zero in $n$ steps and holds it there.
That input has finite cost, so the minimum is finite for every start.
:::
:::

::: note
Source p. 11, the only place in either source that says the LQ problem can fail to have an answer. The sum of squares runs 1, 5, 21, 85, 341 and never settles. Controllability is the control lineage's analogue of "every state–action pair visited infinitely often": the condition under which the sweep has something to converge to. Weaker conditions suffice in practice: stabilisability (every unstable mode can be influenced) and detectability (no unstable mode is invisible to Q); they are named again with the continuous-time result in Act 3.
:::

### The cost-to-go, and a fact about its shape
**The value function** — the minimum cost-to-go from state $z$; no time argument, because the time to go is always infinite:

$$V(z)=\min_{u_0,u_1,\dots}\sum_{\tau=0}^{\infty}\big(x_\tau^\top Qx_\tau+u_\tau^\top Ru_\tau\big)\qquad\text{s.t. } x_0=z,\ x_{\tau+1}=Ax_\tau+Bu_\tau$$

::: reveal
::: block Fact | established by the derivation that follows
$V$ is quadratic: $\;V(z)=z^\top Pz$ with $P=P^\top\succeq0$, and the algebraic Riccati equation has ==exactly one== positive semidefinite solution.
:::
:::

::: reveal
::: keypoint
The infinite-horizon problem is ==shift invariant==: the same rule applies at every stage.
So the table of Lecture 7 collapses to one $n\times n$ matrix.
:::
:::

::: note
Source pp. 12 and 14. The source states "V is quadratic" as a fact to be established, not as an ansatz, and separately that the ARE plus P ⪰ 0 characterises the value function uniquely. Uniqueness of the PSD solution plays the role of uniqueness of the Bellman fixed point in Lecture 7.
:::

### The derivation — one line per press
{fill: top, math: compact}

**From Act 1's recursion to the algebraic Riccati equation** — the backup with one stage to go, forever:

$$\begin{aligned}
V(z)&=\min_w\big[\,z^\top Qz+w^\top Rw+V(Az+Bw)\,\big] &&\red{\scriptstyle\text{Act 1's recursion, shift invariant}}\\
\step{1}{z^\top Pz}&\step{1}{=\min_w\big[\,z^\top Qz+w^\top Rw+(Az+Bw)^\top P(Az+Bw)\,\big]} &&\step{1}{\red{\scriptstyle\text{the fact } V(z)=z^\top Pz\text{, on both sides}}}\\
\step{2}{w^*}&\step{2}{=-\big(R+B^\top PB\big)^{-1}B^\top PA\,z} &&\step{2}{\red{\scriptstyle\text{a convex quadratic in } w\text{: gradient to zero}}}\\
\step{3}{z^\top Pz}&\step{3}{=z^\top\big[\,Q+A^\top PA-A^\top PB\,(R+B^\top PB)^{-1}B^\top PA\,\big]z} &&\step{3}{\red{\scriptstyle\text{substitute } w^* \text{ back}}}\\
\step{4}{P}&\step{4}{=Q+A^\top PA-A^\top PB\,(R+B^\top PB)^{-1}B^\top PA} &&\step{4}{\red{\scriptstyle\text{it holds for every } z\text{: the ARE}}}
\end{aligned}$$

::: reveal
::: keypoint
The minimiser is constant linear state feedback: ==$u_t=-Kx_t$, $\;K=(R+B^\top PB)^{-1}B^\top PA$.==
The wall of the continuous minimisation falls to one line of linear algebra.
:::
:::

::: note
Source p. 13, line for line. On the heater (A = B = Q = R = 1) the ARE reads P = 1 + P − P²/(1 + P), that is P² − P − 1 = 0, whose positive root is the golden ratio 1.618, and K = P/(1 + P) = 0.618. The derivation is the same five lines as the continuous-time one in Act 3; only the backup changes from a sum to an integral.
:::

### Algorithm — the Riccati recursion
::: algorithm Riccati recursion | input $A,B,Q,R$; output $P$ and the gain $K$
[initialise] $P_1\leftarrow Q$ // one stage to go: the cost is the terminal cost
[repeat] for $k=1,2,\dots$
  ! [learn] ${P_{k+1}\leftarrow Q+A^\top P_kA-A^\top P_kB\,(R+B^\top P_kB)^{-1}B^\top P_kA}$ // one backward sweep, exact for every $x$ at once
[until] $P_{k+1}=P_k$ to the precision wanted // the gain stops moving
[read off] $K\leftarrow(R+B^\top PB)^{-1}B^\top PA$
[act] $u_t=-Kx_t$ at every step, from the measured $x_t$ // feedback, not a plan
---
Lecture 7's value iteration with the table $V(s)$ replaced by the matrix $P$: a sweep that touched every state is one line of algebra
:::

::: note
Source p. 14: the recursion converges to the unique PSD solution of the ARE when (A, B) is controllable, and "infinite-horizon LQR optimal control is the same as steady-state finite-horizon optimal control". P_k is the cost-to-go matrix with k stages to go, so running the recursion is solving ever longer finite-horizon problems until the answer stops changing. The demo on the next slide runs exactly this box.
:::

### The recursion, run on the heater — the gain stops moving
::: widget lqr-riccati {"mode":"recursion","system":"heater"}
One plate per sweep, the changed digits in red.
==Sweep one is the one-step problem of Act 1, gain $1/2$==; the sweeps settle at $0.618$.
:::

::: reveal
::: keypoint
The one-step gain was never wrong; it was the first backward sweep.
Value iteration, with the value carried as a number instead of a table.
:::
:::

::: note
A = B = Q = R = 1: P_{k+1} = 1 + P_k/(1 + P_k), K_k = P_k/(1 + P_k). P runs 1, 1.5, 1.6, 1.6154, 1.6176, converging to 1.618; K runs 0.5, 0.6, 0.6154, 0.6176, converging to 0.618. Predict before pressing: will the gain go up or down from 1/2, and why? Up, because with more stages to go a residual error costs more, so it is worth more effort now.
:::

### The recursion on a matrix — a sweep over a continuum of states
::: widget lqr-riccati {"mode":"recursion","system":"double"}
The double integrator, position and velocity, discretised: $P_k$ is $2\times2$ and $K_k$ a row.
==One sweep backs up every state at once==, because the whole value function is four numbers.
:::

::: note
A = [[1, h], [0, 1]], B = [h²/2, h], h = 0.5, Q = I, R = 1. Blue is the first gain entry (position), green the second (velocity); the dashed lines are the limit, which the sixth sweep has not quite reached. The point of this second demo is the shape of P: a 2×2 matrix carries the cost-to-go of a continuum of states, so a sweep never enumerates.
:::

### The Riccati recursion is value iteration
::: table center
| Lecture 7 | Lecture 9 |
|---|---|
| $V_{k+1}\leftarrow\max_a\E[R+\gamma V_k]$ | $P_{k+1}\leftarrow$ the Riccati map |
| $V_k$ is a table, one entry per state | $P_k$ is an $n\times n$ matrix |
| converges to the unique fixed point $V^*$ | converges to the unique positive semidefinite solution of the ARE |
| a sweep touches every state | a sweep is one line of algebra |
:::

::: reveal
::: keypoint
Value iteration, with the value function carried in closed form instead of enumerated.
==Infinite-horizon LQR is steady-state finite-horizon LQR==: one backward sweep, run to convergence.
:::
:::

::: note
Source p. 14's own remark. The uniqueness of the PSD solution plays the role of the uniqueness of the Bellman fixed point; controllability plays the role of the conditions under which value iteration converges. This is the ladder's third rung, drawn at the end of Act 3.
:::

### Why LQR is the cornerstone
For the stated unconstrained problem the Riccati solution is globally optimal, and the controller is one matrix.\
Linearise any smooth problem about a trajectory, take a quadratic model of the cost, solve the resulting LQR, step, repeat: that is iLQR, the backbone of trajectory optimisation in Lecture 11.\
In Lecture 10 a learned actor $\mu_\theta(s)$ occupies exactly the place of this gain, for a system whose $A$ and $B$ are unknown.

::: reveal
::: keypoint
Hold $u=-Kx$ in view: a known-model feedback law to compare with a learned one.
Policy-gradient methods optimise a chosen policy class from experience; ==they do not automatically recover this optimum.==
:::
:::

::: note
Almost nothing is truly linear-quadratic. What LQR gives is a solvable local approximation, and that is how the closed form earns its place: as the inner loop of methods for problems that are not LQ at all (Jacobson and Mayne, 1970, in the reading guide). Input constraints and a singular R change the solution; the displayed inverse formula needs R ≻ 0.
:::

### Check — what the Riccati recursion computes
{q: 2}

::: quiz The Riccati recursion starts at $P_1=Q$ and stops when $P_{k+1}=P_k$.<br>What is $P_k$ along the way?
- The gain after $k$ steps of the closed loop
- =The cost-to-go matrix with $k$ stages to go: each sweep solves a longer finite-horizon problem
- The $k$-th power of $A$
- The covariance of the state after $k$ steps
P_k is V with k stages to go, carried as a matrix: V_k(x) = xᵀP_kx. The recursion is Lecture 7's value iteration, and the infinite-horizon answer is the steady state of the finite-horizon one. The first sweep is the one-step problem, which is why its gain was 1/2 and the limit is 0.618.
:::

## Act 3 — let time flow
{short: ACT 3, num: Act 3}

**Q3.** Let the time step shrink to nothing.\
What does the Bellman equation become?

### Act 3 on the map
{q: 3}

::: qstrip
:::

::: widget control-grid {"cell":"cts","dim":true,"outer":"dim"}
Down one row: time no longer ticks, it flows.
==The same cost-to-go, now a function of $(t,x)$ with $t$ continuous.==
:::

### Continuous time — the problem, and the cost-to-go
**The continuous-time optimal control problem** — Act 1's sum as an integral, Act 1's successor as a derivative:

$$L(u)=\int_0^T g\big(t,x(t),u(t)\big)\,dt+q\big(T,x(T)\big),\qquad \dot x(t)=f\big(t,x(t),u(t)\big),\quad x(0)=x_0$$

with $u(t)=\gamma(t,x(t))\in U$ and $\gamma\in\Gamma$, the class of admissible feedback strategies.

::: reveal
**The cost-to-go** — over the remaining interval, seeded at the terminal time:

$$V(t,x)=\min_{u(s),\,t\le s\le T}\Big[\int_t^T g\big(s,x(s),u(s)\big)\,ds+q\big(T,x(T)\big)\Big],\qquad \hl{V(T,x)=q(T,x)}$$
:::

::: reveal
::: keypoint
Lecture 7 seeded the recursion at the last stage; here it is seeded at $t=T$.
==Same seed, same backward direction.==
:::
:::

::: note
Source pp. 15–16. The heater in continuous time: f = u, g = x² + u², T = 2, no terminal cost, x(0) = 1. Its cost-to-go will turn out to be V(t, x) = P(t)x² with P(t) = tanh(2 − t), the closed form every demo in this act and the next uses.
:::

### The HJB equation, derived — one line per press
{fill: top, math: compact}

**From the principle of optimality to a partial differential equation** — the backup over a short interval $\delta$, then $\delta\to0$:

$$\begin{aligned}
V(t,x)&=\min_{u\in U}\Big\{\,g(t,x,u)\,\delta+V\big(t+\delta,\;x+f(t,x,u)\,\delta\big)\Big\}+o(\delta) &&\red{\scriptstyle\text{the principle of optimality over }[t,t+\delta]}\\
\step{1}{V(t+\delta,x+f\delta)}&\step{1}{=V(t,x)+\frac{\partial V}{\partial t}\,\delta+\frac{\partial V}{\partial x}\,f(t,x,u)\,\delta+o(\delta)} &&\step{1}{\red{\scriptstyle\text{Taylor, assuming } V \text{ continuously differentiable}}}\\
\step{2}{V(t,x)}&\step{2}{=\min_{u\in U}\Big\{\,g\,\delta+V(t,x)+\frac{\partial V}{\partial t}\,\delta+\frac{\partial V}{\partial x}\,f\,\delta\Big\}+o(\delta)} &&\step{2}{\red{\scriptstyle\text{substitute; } V(t,x) \text{ is free of } u}}\\
\step{3}{-\frac{\partial V(t,x)}{\partial t}}&\step{3}{=\min_{u\in U}\Big\{\,\frac{\partial V(t,x)}{\partial x}\,f(t,x,u)+g(t,x,u)\Big\},\qquad V(T,x)=q(T,x)} &&\step{3}{\red{\scriptstyle\text{cancel } V(t,x)\text{, divide by } \delta\text{, let } \delta\to0}}
\end{aligned}$$

::: reveal
::: keypoint
The last line is the ==Hamilton–Jacobi–Bellman equation==.
It is Lecture 7's optimality equation; it has become a nonlinear PDE for $V$.
:::
:::

::: note
Source pp. 17–18, line for line. Compare Lecture 7's derivation of the Bellman optimality equation: identical, with delta to zero in place of a one-step sum. The minimising u at each (t, x) is the optimal feedback, a static pointwise minimisation embedded inside a PDE for V. Two caveats on the source slide: computing V is not easy in general, and continuous differentiability is restrictive; the honest fix is a weaker notion of solution (viscosity solutions, Crandall and Lions 1983, reading guide).
:::

### The claim, checked — shrink the step and watch the backup land on the PDE
::: widget dt-to-hjb {"seed":9}
The heater, $\dot x=u$, cost $\int_0^2(x^2+u^2)\,dt$, so $V(t,x)=P(t)x^2$ with $P$ from the Riccati ODE.
Act 1's discrete backup is run at step $\Delta t$; ==halve $\Delta t$ and the error halves.==
:::

::: note
The discrete backup on the Euler-discretised heater is exactly the discrete-time Riccati recursion of Act 2 with A = 1, B = Δt, Q = R = Δt; its P_0 converges to the HJB solution P(0) = tanh 2 = 0.964 at first order, as one Euler step should. Press the slider through the ladder and read the ratio each time.
:::

### What HJB gives — a certificate, and a rule everywhere
{sub: the sufficiency theorem, source p. 19}

::: block Theorem | HJB is a sufficient condition
If a continuously differentiable $V(t,x)$ satisfies the HJB equation and its boundary condition, then it generates the optimal strategy through the ==static, pointwise== minimisation on its right-hand side.
:::

::: algorithm Feedback from a value field | input $f$, $g$, $q$; output the rule $\gamma(t,x)$
[initialise] $V(T,x)\leftarrow q(T,x)$ // the boundary condition
[learn] solve ${-\partial_t V=\min_{u\in U}\{\partial_x V\,f+g\}}$ backwards from $T$ // a PDE over every $(t,x)$
[for each] $(t,x)$ the system reaches
  ! [read off] ${\gamma(t,x)\leftarrow\red{\argmin_{u\in U}}\{\partial_x V(t,x)\,f(t,x,u)+g(t,x,u)\}}$ // static, pointwise
  [act] $u=\gamma(t,x)$
---
the hard line is the second; the linear-quadratic case closes it with $V=x^\top P_tx$, and everything else needs a grid over the state space
:::

::: note
Source p. 19: the theorem and equation (10), u*(t) = argmin of the bracket. "Static (pointwise) minimisation" is the source's phrase and the same idea as Act 1's single-shot optimisation. It extends to stochastic dynamics with one extra term, ½ tr(σσᵀ ∂_xx V).
:::

### Why sufficient — the verification argument, one line per press
{fill: top, math: compact, sub: the proof — if time allows; the keypoint is what Act 4's comparison needs}

**The only optimality proof of this lecture** — any admissible $\gamma$ (trajectory $x$) against the minimising $\gamma^*$ (trajectory $x^*$):

$$\begin{aligned}
g(t,x,u)+\partial_xV\,f(t,x,u)+\partial_tV&\;\ge\;0,\qquad g(t,x^*,u^*)+\partial_xV\,f(t,x^*,u^*)+\partial_tV\;\equiv\;0 &&\red{\scriptstyle\text{any } u \text{ does no better; } u^* \text{ attains it}}\\
\step{1}{\int_0^T g\,dt+V(T,x(T))-V(0,x_0)}&\step{1}{\;\ge\;0,\qquad \int_0^T g^*\,dt+V(T,x^*(T))-V(0,x_0)\;=\;0} &&\step{1}{\red{\scriptstyle\text{integrate: the last two terms are } \tfrac{d}{dt}V(t,x(t))}}\\
\step{2}{\int_0^T g\,dt+q(T,x(T))}&\step{2}{\;\ge\;\int_0^T g^*\,dt+q(T,x^*(T))} &&\step{2}{\red{\scriptstyle\text{eliminate } V(0,x_0)\text{; apply } V(T,x)=q(T,x)}}\\
\step{3}{L(u)}&\step{3}{\;\ge\;L(u^*)\qquad\blacksquare} &&\step{3}{\red{\scriptstyle\text{from any initial state}}}
\end{aligned}$$

::: reveal
::: keypoint
A solution of the PDE is a ==certificate==: no admissible strategy beats $\gamma^*$, from any start.
Pontryagin's conditions in Act 4 will not give this; they are stationarity conditions.
:::
:::

::: note
Source p. 20, the proof the tex compressed to the word "sufficient". Four lines: inequality along any trajectory, identity along the optimum, integrate both, subtract. It is the exact reason HJB is sufficient while the minimum principle is only necessary, which Act 4's comparison table asserts.
:::

### The field — a rule at every state
::: widget field-trajectory {"mode":"field"}
The heater's value function $V(t,x)=P(t)x^2$ over the whole $(t,x)$ plane, and the rule it generates at every point.
Trajectories started anywhere follow the same arrows: ==feedback valid from any state the system reaches.==
:::

::: reveal
::: keypoint
HJB is the Eulerian view: stand still and watch a field over all states.
That is what makes its answer a feedback law, and what makes it expensive.
:::
:::

::: note
P(t) = tanh(2 − t), u* = −P(t)x; the level curves rise towards t = 2 because P → 0 there (no terminal cost). Press one: the arrows; press two: three trajectories from different starts, all obeying the same rule. This figure returns in Act 4 with one trajectory drawn through it and the costate as the field's slope along it.
:::

### And what it costs
::: keypoint
HJB is a ==nonlinear PDE over the entire state space.==
:::

::: reveal
Three prices, each a limitation the rest of the course works around.\
It needs the model: $f$ and $g$ sit inside the minimisation, and deleting them leaves no equation, which is Lecture 10.\
It assumes $V$ is differentiable, and often it is not.\
It does not survive dimension: a value field over $x\in\R^n$ is Lecture 7's table with the table replaced by a continuum.
:::

::: reveal
::: small
So HJB is the characterisation, rarely the computation.
The linear-quadratic case is the one that closes: a quadratic value function turns the PDE into an ordinary differential equation for a matrix.
:::
:::

::: note
The differentiability fix is viscosity solutions (Crandall and Lions 1983, reading guide), which buys existence at the cost of the clean formula. The dimension price is the same curse Lecture 7 named; grids over R^n for n beyond three or four are out of reach, which is why Act 4's trajectory view and Lecture 11's trajectory optimisation exist.
:::

### Linear-quadratic, in continuous time — from HJB, one line per press
{fill: top, math: compact}

**Continuous-time LQ by HJB** — $\dot x=Ax+Bu$, $g=x^\top Qx+u^\top Ru$, terminal $x(T)^\top Q_fx(T)$, try $V=x^\top P_tx$:

$$\begin{aligned}
-x^\top\dot P_tx&=\min_u\Big\{\,2x^\top P_t(Ax+Bu)+x^\top Qx+u^\top Ru\,\Big\} &&\red{\scriptstyle\partial_xV=2P_tx,\ \partial_tV=x^\top\dot P_tx\text{, into HJB}}\\
\step{1}{u^*}&\step{1}{=-R^{-1}B^\top P_t\,x} &&\step{1}{\red{\scriptstyle\text{a convex quadratic in } u\text{: gradient to zero}}}\\
\step{2}{-\dot P_t}&\step{2}{=A^\top P_t+P_tA-P_tBR^{-1}B^\top P_t+Q,\qquad P_T=Q_f} &&\step{2}{\red{\scriptstyle\text{substitute back, match for all } x\text{: the Riccati ODE}}}\\
\step{3}{0}&\step{3}{=A^\top P+PA-PBR^{-1}B^\top P+Q,\qquad u^*=-Kx,\quad K=R^{-1}B^\top P} &&\step{3}{\red{\scriptstyle\text{infinite horizon, } \dot P\to0\text{: the ARE}}}
\end{aligned}$$

::: reveal
::: keypoint
Act 2's five lines again, with the integral in place of the sum.
The Riccati ODE is integrated ==backwards from $T$==, exactly like the discrete sweep.
:::
:::

::: note
Source p. 21; the infinite-horizon limit is supplied here because the source leaves it implicit. Conditions for the stationary solution: (A, B) stabilisable, (Q^{1/2}, A) detectable, R ≻ 0; then the ARE has a unique PSD stabilising solution and the constant gain K. On the heater, A = 0, B = Q = R = 1: the ODE is −Ṗ = 1 − P², which with P(2) = 0 gives P(t) = tanh(2 − t), and the ARE 1 − P² = 0 gives P = 1, u* = −x: the gain the next slide draws.
:::

### The heater, in continuous time — one gain, three controls
::: widget heater-pictures {"mode":"decay"}
$\dot x=u$, cost $\int_0^\infty(x^2+u^2)\,dt$ from $x(0)=2$: the ARE gives $P=1$ and the rule $u=-x$.
==Do nothing and the cost is infinite; push twice as hard and it is higher too.==
:::

::: reveal
::: keypoint
The gain is $1$: error $2$ asks for command $-2$, error $0.5$ for $-0.5$.
Feedback weakens as the error shrinks, by itself.
:::
:::

::: note
Predict before pressing: which of the three controls costs least, and is doing nothing free? V(x) = Px² with 0 = min_u {x² + u² + 2Pxu} gives u* = −Px and 1 − P² = 0, P = 1. Under u = −x, x(t) = 2e^{−t} and J = ∫ 8e^{−2t} dt = 4 = V(2). Under u = 0 the integrand is 4 forever. Under u = −2x, x = 2e^{−2t} and J = ∫ (4 + 16)e^{−4t} dt = 5. The continuous gain 1 against the discrete gain 0.618: different problems, same recipe; the finite-horizon P(t) = tanh(2 − t) runs from 0 at T up towards 1 as the horizon recedes.
:::

### LQR, run — a mass you can push
{sub: the double integrator: position and velocity as the state, force as the input}

::: widget lqr-riccati {"q":1,"r":1}
Turn the dials and read the gain; the Riccati integration on the right flattens onto the algebraic solution, dashed.
==Cheap control buys speed with a violent input; expensive control is gentle and slow.==
:::

::: note
A = [[0, 1], [0, 0]], B = [0, 1]. Closed form k₁ = √(q/r), k₂ = √((2√(qr) + 1)/r). There is no tuning: the dials are the objective. The right-hand panel integrates the Riccati differential equation backwards and watches the gain stop moving, the continuous-time twin of Act 2's plates.
:::

### The ladder so far — one equation, three dialects
::: widget mdp-pictures {"mode":"ladder","start":0,"upto":3,"plates":[{"title":"Value iteration (Lecture 7)","line":"for each state s:","formula":"V(s) ← \\max_a \\sum_{s′} T(s,a,s′)[R + γ V(s′)]","note":"the full backup over a finite list","loop":"one sweep per round"},{"title":"Discrete-time optimal control","line":"for each state x, backwards in k:","formula":"V(k,x) ← \\red{\\min_{u∈U}} \\{ g(x,u) + V(k+1, \\red{f(x,u)}) \\}","note":"one successor; a minimum over a continuum","loop":"one stage per sweep"},{"title":"Riccati recursion","line":"for the whole state space at once:","formula":"\\red{P_{k+1}} ← Q + A^T P_k A − A^T P_k B (R + B^T P_k B)^{-1} B^T P_k A","note":"the table becomes a matrix","loop":"one sweep per press"},{"title":"HJB","line":"for every (t, x), as Δt → 0:","formula":"\\red{−∂V/∂t} = \\min_{u} \\{ ∂V/∂x · f(t,x,u) + g(t,x,u) \\}","note":"the backup becomes a PDE","loop":"backwards from T"}]}
Lecture 7's ladder continued: ==each rung changes one thing==, marked in red.
A finite list of actions becomes a continuum, the table becomes a matrix, and the step becomes a derivative.
:::

::: note
Read it with the Ch 7 and Ch 8 summaries in mind: Lecture 7 deleted loops, Lecture 8 deleted the model, this lecture changes what the backup ranges over. The fifth rung, the Riccati differential equation, closes the ladder in the closing. Pontryagin is not a rung: it is the other view of the same optimum, Act 4.
:::

### Check — what happens to Bellman in continuous time
{q: 3}

::: quiz Shrink the time step $\Delta t\to0$ in the discrete Bellman equation.<br>What do you get?
- The Riccati equation
- =The Hamilton–Jacobi–Bellman equation, a partial differential equation in the value function
- Pontryagin's minimum principle
- The Euler–Lagrange equation
The recursion becomes a PDE. HJB is the Bellman equation with the discrete step taken to its limit, and it inherits both the strength, a sufficient condition for global optimality, and the weakness, since solving a PDE over a high-dimensional state space is exactly as hard as the curse of dimensionality suggests. The LQ case avoids a grid because its value has a quadratic form. The next act studies conditions along one trajectory instead.
:::

## Act 4 — the other view
{short: ACT 4, num: Act 4}

**Q4.** HJB carries a value field over every state.\
Is there a way in that follows only one trajectory?

### Act 4 on the map
{q: 4}

::: qstrip
:::

::: widget control-grid {"cell":"cts","dim":true,"outer":"dim"}
The same cell as Act 3, the same optimum.
==Approached along one trajectory instead of over the whole field.==
:::

::: note
As Lecture 8's Act 4 opened on the cell it kept: nothing changes in the problem, only the view of it. Acts 3 and 4 are the Eulerian and the Lagrangian view of one continuous-time cell.
:::

### Adjoin the dynamics — the Hamiltonian and the costate
{sub: Pontryagin, Boltyanskii, Gamkrelidze and Mishchenko, The Mathematical Theory of Optimal Processes · 1962}

::: paper
- Why it is here | The second way into the same optimum: conditions along one trajectory instead of a field over every state.
- What it is | The minimum principle: a costate ODE and a pointwise minimisation of the Hamiltonian, necessary for optimality.
- Why it matters | It scales where HJB cannot, and its trajectory view returns as REINFORCE in Lecture 10 and iLQR in Lecture 11.
:::

**The Hamiltonian** — Lecture 1's Lagrangian move, applied once per instant: adjoin $\dot x=f$ with a multiplier $\lambda(t)$, the ==costate==:

$$H(t,x,u,\lambda)=g(t,x,u)+\lambda^\top f(t,x,u)$$

::: reveal
::: keypoint
One multiplier per instant, so a whole function $\lambda(\cdot)$ instead of a vector.
The constraint set of Lecture 1 has become the dynamics themselves.
:::
:::

::: note
No source pages: the source's outline (p. 3) promises the minimum principle and no slide delivers it, so this act is written from the standard references. HJB is the Eulerian view, a field V(t, x) over all states; this is the Lagrangian view, ride the optimal trajectory and enforce the dynamics as a constraint along it.
:::

### The necessary conditions
**The minimum principle** — smooth problem, fixed horizon, free terminal state, no state constraints; along an optimal trajectory:

$$\dot x^*=\frac{\partial H}{\partial\lambda}=f,\qquad \hl{\dot\lambda^*=-\frac{\partial H}{\partial x}},\qquad \lambda(T)=\frac{\partial q}{\partial x}\Big|_{x^*(T)},\qquad u^*=\argmin_{u\in U}H(t,x^*,u,\lambda^*)$$

::: reveal
The state runs forward from $x(0)=x_0$; the costate runs backward from the ==transversality condition== $\lambda(T)=\partial_xq$.\
They are coupled: a ==two-point boundary-value problem==, not an initial-value problem, so one cannot simply integrate.
:::

::: reveal
::: keypoint
The last condition is the familiar move again.
==Dynamic optimisation reduced to a static minimisation of $H$, freshly at each instant.==
:::
:::

::: note
"Normal" minimum principle: the abnormal multiplier is taken as one. Transversality: with the terminal state free, lambda(T) is the gradient of the terminal cost; with no terminal cost, lambda(T) = 0, which is the condition the shooting demo aims at.
:::

### From Euler–Lagrange to the minimum principle — adjoin the dynamics
{fill: top, math: compact, sub: the derivation, part 1 — if time allows; the keypoint two slides on is what the shooting demo needs}

**Where the conditions come from** — the dynamics adjoined at every instant, then the derivative moved off $x$:

$$\begin{aligned}
L(u)&=\int_0^T g(t,x,u)\,dt+q\big(x(T)\big),\qquad \dot x=f(t,x,u),\quad x(0)=x_0 &&\red{\scriptstyle\text{the cost to minimise; the dynamics constrain it at every instant}}\\
\step{1}{\bar J}&\step{1}{=\int_0^T\Big[\,g(t,x,u)+\lambda^\top\big(f(t,x,u)-\dot x\big)\Big]\,dt+q\big(x(T)\big)} &&\step{1}{\red{\scriptstyle\text{adjoin: } f-\dot x=0 \text{ when feasible, so } \bar J=L \text{ for any } \lambda(\cdot)}}\\
\step{2}{\bar J}&\step{2}{=\int_0^T\big[\,H(t,x,u,\lambda)-\lambda^\top\dot x\,\big]\,dt+q\big(x(T)\big)} &&\step{2}{\red{\scriptstyle H=g+\lambda^\top f \text{ collects everything without } \dot x}}\\
\step{3}{-\int_0^T\lambda^\top\dot x\,dt}&\step{3}{=-\lambda(T)^\top x(T)+\lambda(0)^\top x_0+\int_0^T\dot\lambda^\top x\,dt} &&\step{3}{\red{\scriptstyle\text{integrate by parts: the derivative moves from } x \text{ onto } \lambda}}\\
\step{4}{\bar J}&\step{4}{=\int_0^T\big[\,H+\dot\lambda^\top x\,\big]\,dt+q\big(x(T)\big)-\lambda(T)^\top x(T)+\lambda(0)^\top x_0} &&\step{4}{\red{\scriptstyle\text{no } \dot x \text{ left; } x_0 \text{ is fixed, so the last term cannot move}}}
\end{aligned}$$

::: reveal
::: keypoint
Nothing has been optimised yet.
The cost is only rewritten, so that a change of the control will show up term by term.
:::
:::

::: note
No source pages; the standard calculus-of-variations route, written out so that each move is one press. Line 0 is Act 3's problem again, with the dynamics now treated as Lecture 1 treated a constraint. Line 1 is the Lagrangian move: a multiplier λ(t) for the constraint ẋ = f at each instant, hence a function λ(·); on any trajectory that obeys the dynamics the bracket f − ẋ is identically zero, so J̄ and L agree whatever λ is, and λ can be chosen later for convenience. Line 2 only names the part without ẋ: the Hamiltonian of the previous slide. Line 3 is the one computation: d/dt(λᵀx) = λ̇ᵀx + λᵀẋ, integrated from 0 to T, gives the boundary term and moves the derivative onto λ, which is why the costate will obey a differential equation of its own. Line 4 substitutes it back; x(0) = x₀ is given, so λ(0)ᵀx₀ is a constant that no perturbation can change. The name: the conditions on the next slide are the Euler–Lagrange equations of this augmented functional.
:::

### From Euler–Lagrange to the minimum principle — perturb the control
{fill: top, math: compact, sub: the derivation, part 2 — if time allows; the keypoint is what the shooting demo needs}

**A first-order variation** — nudge the control, let the trajectory follow, and ask that the cost cannot fall:

$$\begin{aligned}
u&\to u+\epsilon p,\qquad x\to x+\epsilon\xi,\qquad \xi(0)=0 &&\red{\scriptstyle p(\cdot) \text{ nudges the control; the trajectory follows by } \xi(\cdot)\text{; the start is fixed}}\\
\step{1}{\frac{d\bar J}{d\epsilon}\Big|_0}&\step{1}{=\int_0^T\Big[\,\partial_xH^\top\xi+\partial_uH^\top p+\dot\lambda^\top\xi\,\Big]dt+\partial_xq^\top\xi(T)-\lambda(T)^\top\xi(T)} &&\step{1}{\red{\scriptstyle\text{chain rule, term by term; } \lambda(0)^\top\xi(0)=0}}\\
\step{2}{}&\step{2}{=\int_0^T\Big[\big(\partial_xH+\dot\lambda\big)^\top\xi+\partial_uH^\top p\Big]dt+\big(\partial_xq-\lambda(T)\big)^\top\xi(T)} &&\step{2}{\red{\scriptstyle\text{collect the } \xi \text{ terms and the } \xi(T) \text{ terms}}}\\
\step{3}{\dot\lambda}&\step{3}{=-\partial_xH,\qquad \lambda(T)=\partial_xq} &&\step{3}{\red{\scriptstyle\lambda \text{ was free: choose it so that both } \xi \text{ brackets vanish}}}\\
\step{4}{\frac{d\bar J}{d\epsilon}\Big|_0}&\step{4}{=\int_0^T\partial_uH^\top p\,dt=0\ \text{ for every } p\qquad\Longrightarrow\qquad \partial_uH=0} &&\step{4}{\red{\scriptstyle\text{no } p \text{ may lower the cost; zero against every } p \text{ forces a zero integrand}}}
\end{aligned}$$

::: reveal
::: keypoint
Stationarity $\partial_uH=0$ presumes $u$ interior to $U$.
Pontryagin replaces it by ==$u^*=\argmin_{u\in U}H$==, which holds on the boundary too: saturated actuators and bang-bang control.
:::
:::

::: note
Line 0: the control is the free variable; the state is not, it is whatever the dynamics produce, so a control change εp(t) drags the trajectory by εξ(t), with ξ(0) = 0 because x(0) = x₀ is given; ξ obeys the linearised dynamics ξ̇ = ∂_x f ξ + ∂_u f p, but that fact is never needed. Line 1 differentiates the previous slide's last line at ε = 0: H depends on x and u, so its change is ∂_xHᵀξ + ∂_uHᵀp; the λ̇ᵀx term gives λ̇ᵀξ; the two boundary terms give ∂_xqᵀξ(T) and −λ(T)ᵀξ(T); λ(0)ᵀx₀ gives nothing. Line 2 is bookkeeping. Line 3 is the whole trick: ξ is awkward, it depends on p through a differential equation, but λ was never pinned down, so choose it to make every coefficient of ξ zero: the costate equation and the transversality condition, which is why they come as a backward problem with a terminal condition. Line 4: with ξ gone the first-order change is a plain integral against p; at a minimum it cannot be negative for any p, and it changes sign with p, so it is zero for every p, and the fundamental lemma of the calculus of variations gives ∂_uH = 0 at almost every t. Three conditions, read off from three places: the integrand of ξ, the boundary of ξ, the integrand of p.

A conserved quantity: along a trajectory dH/dt = ∂_u H · u̇ + ∂_t H; for a time-invariant problem the second term vanishes and along a smooth interior extremal the first vanishes because ∂_u H = 0, so H is constant there. Constancy alone proves neither optimality nor the minimum principle; it is the invariant the shooting demo plots. The minimum principle is also the standard way to state equilibrium conditions for dynamic games, which is how IE579 uses it.
:::

### What the costate is — the field's slope along the trajectory
::: widget field-trajectory {"mode":"trajectory"}
The same field as Act 3, with one optimal trajectory drawn through it.
Along it ==$\lambda(t)=\partial V/\partial x$==, the slope of the value field in the state direction, and $\lambda(T)=0$ because there is no terminal cost.
:::

::: reveal
::: keypoint
Pontryagin carries the sensitivity along one trajectory instead of solving for the whole field.
Any other trajectory costs more; the conditions only hold along the optimum.
:::
:::

::: note
Under the smooth optimal-control assumptions, lambda(t) = ∂V/∂x (t, x*(t)). On the heater, V = P(t)x², so lambda = 2P(t)x*(t) = 2 sinh(2 − t)/cosh 2, and lambda(0) = 2 tanh 2 = 1.928, the number the shooting demo must find. The costate measures sensitivity to the state; it is not the gradient with respect to a policy's parameters, which is Lecture 10's object.
:::

### The costate measures marginal future cost
::: widget heater-pictures {"mode":"tangent"}
The infinite-horizon heater, $V(x)=x^2$: at $x=2$ the costate is the tangent's slope, ==$\lambda=4$.==
A small increase of the state raises the optimal future cost by about $\lambda$ times that increase.
:::

::: reveal
::: keypoint
Minimising $H=x^2+u^2+\lambda u$ pointwise gives $u=-\lambda/2=-x$: the same feedback law as Act 3.
Two views, one answer.
:::
:::

::: note
Increase x from 2 by 0.01: lambda times 0.01 = 0.04, and the exact change is 2.01² − 2² = 0.0401. With the step 0.5 drawn: predicted 2, exact 2.25. H_u = 2u + lambda = 0 gives u = −lambda/2, and along the solution lambda = 2x, so u = −x.
:::

### Algorithm — shooting for the minimum principle
::: algorithm Shooting | input $f$, $g$, $q$, $x_0$, horizon $T$; output $u^*(t)$ along one trajectory
[initialise] guess $\lambda(0)$ // the one number the boundary conditions do not give
[repeat]
  [for each] $t$ from $0$ to $T$ // forward in time
    [read off] $u(t)\leftarrow\argmin_uH(t,x,u,\lambda)$ // static, pointwise
    ! [move] ${\dot x=f(t,x,u),\qquad \dot\lambda=-\partial_xH(t,x,u,\lambda)}$ // state and costate, integrated together
  [learn] adjust $\lambda(0)$ by the residual $\lambda(T)-\partial_xq$ // bisection or Newton
[until] $\lambda(T)=\partial_xq\big(T,x(T)\big)$ // the transversality condition
---
a two-point boundary-value problem turned into an initial-value problem by guessing the missing initial condition; the demo runs exactly this box
:::

::: note
On the heater: H = x² + u² + lambda u, u = −lambda/2, so the canonical equations are ẋ = −lambda/2 and lambda-dot = −2x with x(0) = 1 and lambda(2) = 0. The residual is monotone in the guess, so bisection on lambda(0) finds the one value that lands.
:::

### Shooting, run — guess the costate, integrate, see whether it lands
::: widget pontryagin {"seed":11}
The heater once more: guess $\lambda(0)$, integrate state and costate forward, check $\lambda(2)=0$.
==Exactly one guess lands, and it is $2P(0)x_0$==, the value gradient from the other method.
:::

::: note
lambda*(0) = 2 tanh 2 = 1.928, agreeing with the independently integrated HJB solution to machine precision. The dashed trace on the right is a control that does not minimise H pointwise: its Hamiltonian drifts, while along the principled trajectory H is conserved. The residual, not the flatness, picks the optimum: H is conserved for every guess, because every guess integrates the canonical equations.
:::

### HJB versus Pontryagin — what each certifies
::: table center
| | HJB (dynamic programming) | Pontryagin (minimum principle) |
|---|---|---|
| view | Eulerian: a value field $V(t,x)$ | Lagrangian: one trajectory $x^*(t)$ |
| logic | ==sufficient==, over all $(t,x)$ | ==necessary==, along the optimum |
| output | a feedback law $\gamma(t,x)$ | an open-loop $u^*(t)$ from a costate ODE |
| mathematics | a nonlinear PDE | a two-point boundary-value ODE |
| cost | the curse of dimensionality | one trajectory; necessity alone does not certify a minimum |
:::

::: reveal
::: small
Feedback beats an open-loop plan for Lecture 7's reason: $\gamma(t,x)$ is valid from any state reached, $u^*(t)$ only along the trajectory predicted.
Pontryagin scales where HJB cannot, which is why trajectory methods exist.
:::
:::

::: note
Stochastic versions: second-order HJB with the diffusion term; stochastic maximum principles exist and are beyond this lecture. Lecture 10's REINFORCE is a trajectory view with the model deleted; Lecture 11's iLQR is a trajectory method with the model kept.
:::

### Check — the parallel about to be drawn
{q: 4}

::: quiz Lecture 8 deleted $T$ and $R$ from the MDP and got value-based RL.<br>Lecture 10 deletes what from optimal control?
- The cost function $g$
- The state $x$
- The horizon $T$
- =The dynamics $f$, leaving a controller that must be improved from experience alone
The two lineages lose their model in exactly the same way, one lecture apart. Delete T from dynamic programming and you must sample the expectation; delete f from optimal control and you can no longer differentiate through the rollout, so you must estimate the gradient from trajectories instead. Same deletion, two different repairs, and Lecture 11 gets the model back.
:::

## Closing
{short: CLOSING}

Both model-based origins are now on the table. Each one leaned entirely on knowing $f$.

### One scalar system, three views of the same answer
{sub: the heater, $\dot x=u$, cost $\int_0^\infty(x^2+u^2)\,dt$}

::: table center
| View | Calculation | Answer |
|---|---|---|
| **HJB** | try $V=Px^2$: $\;0=\min_u\{x^2+u^2+2Pxu\}$ | $u=-Px$, then $1-P^2=0$ |
| **Riccati** | $A=0$, $B=Q=R=1$: $\;1-P^2=0$ | the root with $P\ge0$: $P=1$ |
| **Pontryagin** | $H=x^2+u^2+\lambda u$, $\;\partial_uH=0$ | $u=-\lambda/2$, and $\lambda=2x$ along the optimum |
:::

::: reveal
::: keypoint
All three agree on ==$u=-x$==, $x(t)=x_0e^{-t}$ and $V(x_0)=x_0^2$.
Agreement here comes from the LQ structure; compare the guarantees, not only the answer.
:::
:::

::: note
At x_0 = 2 the total cost is 4. The other root, P = −1, gives u = +x and an error that grows: a cost-to-go must be non-negative, which is what 'stabilising' means here. Pontryagin's conditions alone do not certify an arbitrary nonlinear candidate as globally optimal; HJB does, when its PDE can be solved; the Riccati equation solves the one case that closes.
:::

### The ladder, complete — one equation, four dialects
::: widget mdp-pictures {"mode":"ladder","start":0,"upto":4,"plates":[{"title":"Value iteration (Lecture 7)","line":"for each state s:","formula":"V(s) ← \\max_a \\sum_{s′} T(s,a,s′)[R + γ V(s′)]","note":"the full backup over a finite list","loop":"one sweep per round"},{"title":"Discrete-time optimal control","line":"for each state x, backwards in k:","formula":"V(k,x) ← \\red{\\min_{u∈U}} \\{ g(x,u) + V(k+1, \\red{f(x,u)}) \\}","note":"one successor; a minimum over a continuum","loop":"one stage per sweep"},{"title":"Riccati recursion","line":"for the whole state space at once:","formula":"\\red{P_{k+1}} ← Q + A^T P_k A − A^T P_k B (R + B^T P_k B)^{-1} B^T P_k A","note":"the table becomes a matrix","loop":"one sweep per press"},{"title":"HJB","line":"for every (t, x), as Δt → 0:","formula":"\\red{−∂V/∂t} = \\min_{u} \\{ ∂V/∂x · f(t,x,u) + g(t,x,u) \\}","note":"the backup becomes a PDE","loop":"backwards from T"},{"title":"Riccati differential equation","line":"\\text{with } V(t,x) = x^T P(t)\\,x\\text{, the PDE closes:}","formula":"\\red{−dP/dt} = A^T P + P A − P B R^{-1} B^T P + Q","note":"a matrix ODE, integrated backwards","loop":"until dP/dt = 0"}]}
Each rung is the rung above with ==one thing changed==, in red.
Lecture 7 deleted loops, Lecture 8 deleted the model, Lecture 9 changed what the backup ranges over.
:::

::: note
Against the old translation table: transition T became dynamics f, reward and max became cost and min, the value table became a cost-to-go over state and time, the policy became a feedback law, the Bellman optimality equation became HJB, value iteration became the Riccati recursion. Keep the last rung in view: that is the seam where, in Lecture 10, samples replace the solver.
:::

### Where we are — the cell, filled
::: widget control-grid {"cells":["dts","cts","prl"],"arrow":"f","dim":true}
Both cells of the right-hand column are done.
==Lecture 10 deletes $f$== and learns a parameterised feedback controller from experience.
:::

::: reveal
::: keypoint
Lecture 9 leaves the feedback law $\gamma(x)$, and $u=-Kx$.
A learned actor $\mu_\theta(s)$ is a more general policy class in the same place; it is not guaranteed to recover this optimum.
:::
:::

::: note
Lecture 10 follows the same teaching move as Lecture 8: keep the decision objective, learn from experience when the model is unavailable. A learned actor avoids a fresh continuous minimisation at every step; the difficulty moves into training and evaluating it. The continuous-argmax wall Lecture 8 ended on is one of the seams where the two lineages meet: Act 1's backup, Act 2's closed form and Act 4's pointwise minimisation of H are control theory's three answers to it, and Lecture 10's network that outputs the minimiser is the fourth.
:::

### Notation — the symbols of this lecture
{sub: and where they differ from Lecture 7}

::: table center
| Symbol | Meaning | Symbol | Meaning |
|---|---|---|---|
| $x$, $u$ | state and control; Lecture 7's $s$ and $a$ | $K$, $K_t$, $K(t)$ | the feedback gain, $u=-Kx$ |
| $f$, $f_k$ | the dynamics, one successor; Lecture 7's $T(s,a,s')$ | $P$, $P_k$, $P(t)$ | the cost-to-go matrix, $V=x^\top Px$ |
| $g$, $q$ | running cost and terminal cost; Lecture 7's $-R$ | $A$, $B$, $Q$, $R$ | linear dynamics and quadratic cost weights |
| $\gamma_k$, $\gamma(t,x)$ | the control strategy; Lecture 7's $\pi$ | $H$ | the Hamiltonian $g+\lambda^\top f$ |
| $V(k,x)$, $V(t,x)$ | cost-to-go from a state at a stage or time | $\lambda(t)$ | the costate, $\partial V/\partial x$ along the optimum |
| $K$ | also the horizon in Act 1 | $\delta$, $\Delta t$ | a short interval; the discretisation step |
| $k$ | a stage in Act 1; a sweep, or stages to go, in Act 2 | $t$, $\tau$ | the time index in Acts 2 to 4 |
:::

::: note
Three clashes to say aloud: k is a stage in Act 1 and a sweep of the Riccati recursion in Act 2, where the time index is t or tau; K is the horizon in Act 1 and the gain from Act 2 on, and the source folds the minus sign into the gain while this lecture writes u = −Kx throughout. Q is a cost weight here, not the action-value function of Lectures 7 and 8.
:::

### Reading guide — the same system solved by different mathematical tools
{sub: one main idea to explain, one comparison, one application}

| Role | Read or revisit | Question to answer |
|---|---|---|
| **Core** | [Tedrake, *Underactuated Robotics*, the LQR chapter](https://underactuated.mit.edu/lqr.html)<br>Bertsekas, *Dynamic Programming and Optimal Control*, Vol. 1 | Why does the linear-quadratic case close in a formula? |
| **Compare** | Liberzon, *Calculus of Variations and Optimal Control Theory*, Ch. 4 and 5; Kalman (1960); Pontryagin et al. (1962) | Which method gives a value function, a gain, or conditions along a trajectory? |
| **Apply** | The heater three ways, then the double integrator with the dials | Do the methods agree under the stated LQ assumptions, and where do their guarantees differ? |

::: keypoint
Extensions: iLQR and DDP (Jacobson and Mayne, 1970), viscosity solutions (Crandall and Lions, 1983).
Each removes an assumption named today and keeps the backup.
:::

### Bellman wrote the same equation twice: as a sum over a table, and as a PDE.
{layout: standout}

LQR is the case where the value field is a matrix;\
Pontryagin is the view along one trajectory.\
Everything after this is what happens when you are no longer told $f$.

### Questions?
{layout: standout}

Two traditions, one destination.\
Control theory met the continuous minimisation in 1956; its three answers are today's acts.\
Lecture 10's answer is a network that outputs the minimiser, and it is a descendant of the third.
