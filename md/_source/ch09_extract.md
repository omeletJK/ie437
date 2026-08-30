# Source extract — Chapter 9 · Optimal Control & Planning

**Source deck.** `lecture_slides/9. Optimal Control and Policy Based Reinforcement Learning
(simple).pdf` — 89 pages, PowerPoint 2016, 960×540pt, no raster figures on the optimal-control
pages (every diagram is vector shapes drawn in PowerPoint, so the text layer is complete but the
maths comes out mangled and every equation below has been re-typed from the rendered page).

**This is a combined deck.** Under the spine's renumbering (§5) it splits into three chapters.
The split point is exact and clean:

| pages | belongs to | note |
|---|---|---|
| **1–21** | **Ch 9 · Optimal Control** — *this chapter* | the whole of section "1. Optimal Control" |
| 22–70, 75–89 | **Ch 10 · Policy-Based RL** | section "2. Policy-Based Reinforcement Learning" |
| 71–74 | **Ch 13 · MARL / multi-agent** | MADDPG — the only multi-agent algorithm in the deck |
| 4–7 · 23–26 | shared framing | the same four overview grids, repeated verbatim |

**A warning for the Ch 13 author.** The spine (§5) says the combined deck carried the game-theory
material for the new Dynamic Games chapter. In *this* ("simple") version of the deck it does not.
The only multi-agent content is (a) the *Multi Agent* column of the four overview grids — one cell
each: Static Game, Dynamic Game, Markov Game / stochastic game, CT Markov game / differential game,
multi-agent value-based RL, multi-agent policy-based RL — and (b) MADDPG on pp. 71–74. There are
**no** coupled-HJB, Nash-equilibrium or differential-game slides here. A fuller (non-"simple")
version of deck 9 may exist elsewhere; if not, Ch 13's model-based half has to be written from
`tex/Lecture12_Dynamic_Games.tex` and the four grid cells above.

**Act mapping** — `tex/Lecture09_Optimal_Control.tex` has four acts:
*Act 1 · it is the same problem* · *Act 2 · Bellman made infinitesimal (HJB)* · *Act 3 · the one
closed form (LQR)* · *Act 4 · the other view (Pontryagin)*.

**The single largest structural finding.** The tex presents the material in the order
*discrete → HJB → LQR → Pontryagin*. The PDF's order is **discrete-time optimal control → DP
recursion → the infinite-horizon LQ problem *in discrete time*, derived in full → continuous-time
problem → HJB → HJB proof → HJB sufficiency theorem + proof → the continuous-time LQ problem.**
The discrete-time LQR derivation (pp. 10–14, five slides) is the most detailed thing in the whole
optimal-control half, and **the tex drops it entirely** in favour of the two-line continuous-time
version. It contains three things worth restoring:

1. the hazard that $J=\infty$ for *every* input, with a one-line counterexample, and
   **controllability of $(A,B)$** as the condition that rules it out (p. 11);
2. "$V$ is quadratic" stated as a **Fact to be established**, not an ansatz (p. 13);
3. the **Riccati recursion** $P_{k+1} = Q + A^\top P_k A - A^\top P_k B (R+B^\top P_k B)^{-1}
   B^\top P_k A$, $P_1 = Q$, **converging** to the unique PSD solution of the ARE, and the remark
   that "infinite-horizon LQR optimal control is the same as steady-state finite-horizon optimal
   control" (p. 14). ==This is value iteration.== It is the sharpest available bridge from
   Lecture 7 to Lecture 9 and neither the tex nor the spine mentions it.

**The second finding.** The PDF's own outline slide (p. 3) promises "Minimum Principle" under
continuous-time optimal control — and then **no slide delivers it.** Act 4 (Pontryagin) has *no*
PDF source at all; it exists only in the tex (three body frames' worth of content plus Backup 3).
Anything on the costate, the Hamiltonian or the two-point boundary-value problem has to come from
the tex and from standard references, not from this deck.

**The third finding.** The HJB *sufficiency* theorem and its verification proof (pp. 19–20) are a
complete, self-contained argument that the tex compressed to the single word "sufficient". It is
short enough to be an appendix slide and is the only place the deck proves anything about
optimality rather than deriving a formula.

---

## Part A — the optimal-control pages (1–21). This chapter's material.

### p. 1 — title
"12. Optimal Control and Policy Based Reinforcement Learning". (The "12" is a stale number from an
older ordering; the file is deck 9.)

### p. 2 — section divider
"1. Optimal Control".

### p. 3 — the outline of the optimal-control half
Two groups, and this is the act structure the PDF actually follows:

- **Discrete-Time Optimal Control** — Dynamic Programming · Affine Quadratic Problem ·
  Infinite Horizon Linear Quadratic Problem
- **Continuous-Time Optimal Control** — Dynamic Programming (Hamilton-Jacobi-Bellman Equation) ·
  **Minimum Principle** · Affine Quadratic Problem · Infinite Horizon Linear Quadratic Problem

→ *Acts 1–3.* Note the promised Minimum Principle never appears (see finding 2 above). Note also
"Affine Quadratic Problem" — the slightly more general $\dot x = Ax + Bu + c$, $g = x^\top Qx +
2x^\top S u + u^\top R u + \dots$ — is listed twice and also never appears; only the pure LQ case
is covered.

### pp. 4–7 — **THE FIGURE OF THE CHAPTER.** Four "Overview" grids.  ★★★
*(repeated verbatim as pp. 23–26 at the start of the policy-RL half)*

This is the professor's own map, and it is **not** the course cube — it is a *zoom* into one cell
of it. Every one of the four pages has the identical structure:

**Outer 2×2** (top of the slide) — rows *Static* / *Dynamic*, columns *Single Agent* / *Multi
Agent*:

|  | Single Agent | Multi Agent |
|---|---|---|
| Static | Static optimization | Static Game |
| **Dynamic** | **Dynamic Optimization** *(highlighted blue on all four pages)* | Dynamic Game |

A grey wedge then **zooms out of the "Dynamic Optimization" cell** into an **inner 2×2**, whose
axes are labelled **"Action space"** (columns: *Finite* / *Infinite*) and **"Time space"** (rows:
*Discrete* / *Continuous*). The inner grid's corner cell carries the layer label, and it is the
layer that changes across the four pages:

**p. 4 — inner grid, corner reads "Model based" (in red).** Three cells filled, shaded amber:

|  | **Finite** action | **Infinite** action |
|---|---|---|
| **Discrete** time | Discrete-time MDP · $P(s_{t+1}\mid s_t,a_t)$ | Discrete-time dynamic system · $x_{t+1}=f(x_t,u_t)$ |
| **Continuous** time | Continuous-time MDP · $P(s_{t+h}\mid s_t,a_t)$ *(unshaded)* | Continuous-time dynamic system · $\dot x_t = f(x_t,u_t)$ |

**p. 5 — inner grid, corner reads "Model free" (in green).** Only the *Discrete time* row filled:

|  | **Finite** action | **Infinite** action |
|---|---|---|
| **Discrete** time | Value-based Reinforcement Learning | Policy-based Reinforcement Learning |
| **Continuous** time | *(empty)* | *(empty)* |

**p. 6 — "Model based", Multi Agent cell zoomed.** Discrete/finite: Markov Game (Stochastic Game).
Discrete/infinite: DT infinite dynamic game (Stochastic Game). Continuous/finite: Continuous-time
Markov Game. Continuous/infinite: CT-time infinite dynamic game (**differential game**).
→ *Ch 13.*

**p. 7 — "Model free", Multi Agent cell zoomed.** Discrete/finite: Multi-Agent Value-based RL.
Discrete/infinite: Multi-Agent Policy-based RL. → *Ch 13.*

**Why this matters more than any other page in the deck.** Read pp. 4 and 5 together and the two
lineages of the course *are* the two columns of the inner grid:

- **finite action space** → Lecture 7 (MDP) above, Lecture 8 (value-based RL) below;
- **infinite action space** → Lecture 9 (dynamic system / optimal control) above, Lecture 10
  (policy-based RL) below;
- the vertical arrow between the two pages — "model based" → "model free" — is the model axis, and
  it is the *same* arrow for both columns.

So Lecture 7 and Lecture 9 sit in **the same cell of the course cube** (single agent · dynamic ·
model-based) and differ only in two coordinates that the course cube does not resolve: how big the
action set is, and whether time ticks or flows. That is exactly the claim Act 1 has to make, drawn
by the professor. **Redraw this.** → *Act 1 widget* (`control-grid`).

Note also the empty *Continuous time* row of p. 5: model-free continuous-time control is not part
of this course, and saying so is honest — it is where the field is still open.

### p. 8 — Discrete-Time Optimal Control Problems  → *Act 1*
The problem statement, verbatim in re-typed form. Find a control sequence $u=\{u_k\},k\in\mathbf K$
minimising

$$L(u) = \sum_{k=0}^{K-1} g_k(x_k,u_k) + g_K(x_K) \tag{1}$$

subject to discrete-time system constraints

$$x_{k+1} = f_k(x_k,u_k), \qquad u_k \in U_k, \qquad k \in \mathbf{K} = \{0,1,\dots,K-1\} \tag{2}$$

with the bullet: $u = \{u_k\}$, $u_k = \gamma_k(x_k)$, where $\gamma_k(\cdot)$ is a **permissible
control strategy** at stage $k$.

**Worth restoring.** The object being sought is named a *strategy* $\gamma_k$ from the very first
slide — a rule from state to control, not a sequence of numbers. The whole HJB-vs-Pontryagin
distinction of Act 4 is already latent here.

### p. 9 — Dynamic Programming for Discrete-Time Optimal Control  → *Act 1*   ★
The value function, defined as the minimum cost from *any* starting point $x$ at *any* initial
time $k$ (both phrases coloured blue on the slide):

$$V(k,x) = \min_{\gamma_k,\dots,\gamma_K} \Big[ \sum_{i=k}^{K} g_i(x_{i+1},u_i,x_i) \Big] \tag{3}$$

with $u_i = \gamma_i(x_i) \in U_i$ and $x_k = x$. A direct application of the **principle of
optimality** gives the recursion

$$V(k,x) = \min_{u_k}\big[\, g_k(f_k(x,u_k),u_k,x) + V\big(k+1, f_k(x,u_k)\big) \,\big] \tag{4}$$

with $x_{k+1} = f_k(x,u_k)$ annotated in red over both occurrences.

Two further bullets:
- if the problem admits a solution $u^* = \{\gamma_k^*\}$ then $V(1,x)$ from (4) equals $L(u^*)$;
- **each $u_k^*$ is determined as an argument of the RHS of (4)** — labelled in red
  "**(single-shot optimization)**".

And a green box at the bottom, Bellman's own words:

> *An optimal policy has the property that whatever the initial state and initial decision are, the
> remaining decisions must constitute an optimal policy with regard to the state resulting from the
> first decision.*

**Worth restoring:** the phrase "single-shot optimization". It names the move the whole course
keeps making — a sequential problem reduced to a static optimisation performed once per instant.
It recurs as the pointwise $\arg\min$ in HJB (p. 19) and as $\arg\min_u H$ in Pontryagin.

### pp. 10–14 — **Infinite-horizon LQ problem, DISCRETE time.** Five slides. ★★★
*Dropped wholesale by the tex.* → *Act 3*

**p. 10 — the problem.** System $x_{t+1} = Ax_t + Bu_t$, $x_0 = x_{\text{init}}$; choose
$u_0,u_1,\dots$ to minimise

$$J = \sum_{\tau=0}^{\infty} \big( x_\tau^\top Q x_\tau + u_\tau^\top R u_\tau \big),
\qquad Q = Q^\top \succeq 0, \quad R = R^\top \succ 0$$

with the flat closing remark: **"this is an infinite dimensional problem."**

**p. 11 — the hazard, and controllability.** "It's possible that $J = \infty$ for all input
sequences", with the counterexample

$$x_{t+1} = 2x_t + 0\cdot u_t, \qquad x_{\text{init}} = 1$$

— an unstable mode the input cannot touch. Then: *assume $(A,B)$ is controllable*; then for any
$x_{\text{init}}$ there is an input sequence $u_0,\dots,u_{n-1},0,0,\dots$ that steers $x$ to zero
at $t=n$ and keeps it there. For that $u$, $J < \infty$, and therefore $\min_u J < \infty$ for
every $x_{\text{init}}$.

**Worth restoring.** It is the only place in either source that says the LQR problem can fail to
have a finite answer, and it is a two-second example ($B=0$ against an unstable $A$). It also
introduces controllability, which is the control lineage's analogue of "every state–action pair
visited infinitely often".

**p. 12 — the value function.** $V:\mathbf R^n \to \mathbf R$,

$$V(z) = \min_{u_0,\dots} \sum_{\tau=0}^{\infty} \big(x_\tau^\top Q x_\tau + u_\tau^\top R u_\tau\big)
\quad \text{s.t. } x_0=z,\ x_{\tau+1}=Ax_\tau+Bu_\tau$$

"$V(z)$ is the minimum LQR cost-to-go, starting from state $z$"; it "doesn't depend on time-to-go,
which is always $\infty$ — the infinite horizon problem is **shift invariant**."

**p. 13 — the derivation, in full.** ★★
- **Fact:** $V$ is quadratic, $V(z) = z^\top P z$ with $P = P^\top \succeq 0$.
- Applying "Bellman minimum principle (or HJB equation for discrete system)":
  $$V(z) = \min_w \big[ z^\top Q z + w^\top R w + V(Az+Bw) \big]$$
  $$z^\top P z = \min_w \big[ z^\top Q z + w^\top R w + (Az+Bw)^\top P (Az+Bw) \big]$$
- Minimising: $\;w^* = -\big(R + B^\top P B\big)^{-1} B^\top P A\, z$
- Substituting back:
  $$z^\top P z = z^\top Q z + w^{*\top} R w^* + (Az+Bw^*)^\top P (Az+Bw^*)
   = z^\top\big[Q + A^\top P A - A^\top P B (R + B^\top P B)^{-1} B^\top P A\big] z$$
- This must hold for all $z$, so $P$ satisfies the **ARE (Algebraic Riccati Equation)**
  $$P = Q + A^\top P A - A^\top P B (R + B^\top P B)^{-1} B^\top P A$$
- The optimal input is constant state feedback $u_t = Kx_t$ with
  $$K = -\big(R + B^\top P B\big)^{-1} B^\top P A$$

*(Sign convention note: this slide folds the minus into $K$, so $u = Kx$; the tex writes
$u = -Kx$ with $K = R^{-1}B^\top P$. The chapter should pick one — $u = -Kx$, matching the tex and
the usual continuous-time convention — and say so.)*

**p. 14 — uniqueness, and the recursion.** ★★★
- **Fact:** the ARE has **only one** positive semidefinite solution $P$; "ARE plus $P=P^\top\succeq
  0$ uniquely characterizes the value function."
- **Consequence:** the **Riccati recursion**
  $$P_{k+1} = Q + A^\top P_k A - A^\top P_k B\big(R + B^\top P_k B\big)^{-1} B^\top P_k A,
    \qquad P_1 = Q$$
  **converges** to the unique PSD solution of the ARE (when $(A,B)$ is controllable).
- "Infinite-horizon LQR optimal control is the same as steady-state finite-horizon optimal control."

**This is the chapter's bridge back to Lecture 7 and nothing else in either source states it.**
The recursion is value iteration — start from $V_1 = x^\top Q x$ and back up — except that the
value function is carried as an $n\times n$ matrix instead of a table, so one "sweep" is exact over
an uncountable state space. Uniqueness of the PSD solution plays the role of uniqueness of the
Bellman fixed point; controllability plays the role of the conditions under which value iteration
converges. → *Act 3, and a candidate for the LQR widget's second panel.*

### p. 15 — Continuous-Time Optimal Control Problems  → *Act 2*

$$L(u) = \int_0^T g\big(t,x(t),u(t)\big)\,dt + q\big(T,x(T)\big) \tag{5}$$

subject to $\dot x(t) = f\big(t,x(t),u(t)\big)$, $x(0)=x_0$, $t \ge 0$ (6), with
$u(t) = \gamma\big(t,x(t)\big) \in U$ and $\gamma \in \Gamma$ **the class of all admissible
feedback strategies**.

### p. 16 — the continuous-time value function  → *Act 2*

$$V(t,x) = \min_{u(s),\, t\le s\le T} \Big[ \int_t^T g\big(s,x(s),u(s)\big)\,ds + q\big(T,x(T)\big) \Big] \tag{7}$$

satisfying the boundary condition $V(T,x) = q(T,x(T))$ (8).

### p. 17 — the HJB equation  → *Act 2*  ★

"The dynamic programming approach, when applied to optimal control problems defined in continuous
time, leads to a partial differential equation (PDE) which is known as the Hamilton-Jacobi-Bellman
(HJB) equation." A direct application of the principle of optimality on (7), **under the assumption
of continuous differentiability of $V$**, leads to

$$-\frac{\partial V(t,x)}{\partial t}
  = \min_{u}\Big[ \frac{\partial V(t,x)}{\partial x} f(t,x,u) + g(t,x,u) \Big],
  \qquad V(T,x) = q(T,x(T)) \tag{9}$$

Two caveats, both on the slide:
- "In general, it is not easy to compute $V(t,x)$ and the continuous differentiability assumption is
  rather restrictive."
- "If $V(t,x)$ exists, the HJB equation provides a means of obtaining the optimal control strategy
  (**sufficient condition**)."

### p. 18 — Proof of the HJB equation  → *appendix backup*  ★
Complete and short. From Bellman's optimality principle, for small $\delta$:

$$V(t,x(t)) = \min_{u\in U}\big[\, g(t,x,u)\,\delta + V\big(t+\delta, x(t+\delta)\big) \,\big]$$

where $V(t+\delta, x(t+\delta)) = V\big(t+\delta,\, x(t) + f(t,x,u)\cdot\delta\big)$

$$= V(t,x(t)) + \frac{\partial V}{\partial t}\delta
  + \frac{\partial V}{\partial x} f(t,x,u)\cdot\delta + o(\delta)$$

Substituting, cancelling $V(t,x(t))$ from both sides and dividing by $\delta$:

$$-\frac{\partial V(t,x)}{\partial t} = \min_u \Big[ \frac{\partial V(t,x)}{\partial x} f(t,x,u) + g(t,x,u) \Big]$$

*(matches tex Backup 1 line for line — the tex re-typed this page.)*

### p. 19 — the sufficiency theorem  → *Act 2*  ★
> **Theorem.** If a continuously differentiable function $V(t,x)$ can be found that satisfies the
> HJB equation (9), then it generates the optimal strategy through the **static (pointwise)
> minimization problem** defined by the RHS of (9):

$$u^*(t) = \argmin_{u\in U}\Big[ \frac{\partial V(t,x)}{\partial x} f(t,x,u) + g(t,x,u) \Big] \tag{10}$$

The phrase "static (pointwise) minimization problem" is the professor's, and it is the same idea as
p. 9's "single-shot optimization". Both should survive into the chapter.

### p. 20 — proof of sufficiency (the verification argument)  → *appendix backup*  ★★
*Dropped by the tex; the only optimality proof in the deck.* Given two strategies, $\gamma^*\in
\Gamma$ (optimal) and $\gamma\in\Gamma$ (arbitrary), with trajectories $x^*$, $x$ and terminal
times $T^*$, $T$, equation (9) reads

$$g(t,x,u) + \frac{\partial V(t,x)}{\partial x} f(t,x,u) + \frac{\partial V(t,x)}{\partial t} \;\ge\; 0 \tag{11}$$

$$g(t,x^*,u^*) + \frac{\partial V(t,x^*)}{\partial x} f(t,x^*,u^*) + \frac{\partial V(t,x^*)}{\partial t} \;\equiv\; 0 \tag{12}$$

— (11) is an inequality because $u$ need not attain the minimum; (12) is an identity because $u^*$
does. Integrating (11) from $0$ to $T$ and (12) from $0$ to $T^*$, and noting that the second and
third terms integrate to $\frac{d}{dt}V(t,x(t))$:

$$\int_0^T g(t,x,u) + V(T,x(T)) - V(0,x_0) \;\ge\; 0, \qquad
  \int_0^{T^*} g(t,x^*,u^*) + V(T^*,x^*(T^*)) - V(0,x_0) \;=\; 0$$

Eliminating $V(0,x_0)$ and using the boundary condition $V(T,x)=q(T,x)$:

$$\int_0^T g(t,x,u) + q(T,x(T)) \;\ge\; \int_0^{T^*} g(t,x^*,u^*) + q(T^*,x^*(T^*))$$

so $u^*$ is the optimal control and $\gamma^*$ the optimal strategy. $\blacksquare$

**Why it is worth an appendix slide.** It is the exact reason HJB is *sufficient* while Pontryagin
is only *necessary*, and the argument is four lines: a solution of the PDE is a certificate that
every other trajectory costs more. Act 4's comparison table asserts the sufficient/necessary split;
this page earns it.

### p. 21 — Infinite-horizon LQ problem, CONTINUOUS time  → *Act 3*
System $\dot x(t) = Ax(t) + Bu(t)$; minimise

$$J(u) = \int_0^T \big( x(t)^\top Q x(t) + u(t)^\top R u(t) \big)\,dt + x(T)^\top Q_f x(T)$$

so $g = x^\top Q x + u^\top R u$ and $f = Ax + Bu$. Assume $V(t,x) = x^\top P_t x$. The HJB equation

$$-\frac{\partial V}{\partial t} = \min_{u\in U}\Big[\frac{\partial V}{\partial x} f + g\Big]
\;\Longrightarrow\;
-x^\top \dot P_t x = \min_u \big[\, 2 P_t x (Ax+Bu) + x^\top Q x + u^\top R u \,\big]$$

Minimising over $u$ yields $u^* = -R^{-1}B^\top P_t\,x$; substituting back,

$$-\dot P_t = A^\top P_t + P_t A - P_t B R^{-1} B^\top P_t + Q$$

"which is called the **Riccati differential equation** in optimal control."

*(The slide's `𝑢∗= −𝑅−1𝐵𝑇𝑃𝑡` is missing the trailing $x$ in the extracted text; the rendered page
has it. Note also the slide is headed "infinite horizon" but writes a finite-horizon problem with
terminal cost $Q_f$ — the infinite-horizon statement, $\dot P \to 0$ and the continuous ARE
$A^\top P + PA - PBR^{-1}B^\top P + Q = 0$, is left implicit and must be supplied.)*

**Nothing follows p. 21.** Page 22 is the "2. Policy-Based Reinforcement Learning" divider.

---

## Part B — pages the other two chapters need. Inventory only.

### Ch 10 · Policy-Based RL — pages 22–70 and 75–89

- **p. 22** — divider, "2. Policy-Based Reinforcement Learning".
- **pp. 23–26** — the four overview grids again, byte-identical to pp. 4–7 (see above). Ch 10's
  cell is *model free · discrete time · infinite action space* on p. 24.
- **p. 27** — a small Venn/overlap figure: three regions, *Value function* · *Policy* · overlap
  labelled **Actor Critic**, with the outer labels *Value based* and *Policy-Based*. The canonical
  "three families of RL" picture; worth redrawing for Ch 10's opening.
- **p. 28** — Motivation. "One of the primary goals of AI is to solve complex tasks from
  unprocessed, high-dimensional, sensory input"; DQN and AlphaGo as evidence; then the pivot:
  **"Although DQN solves problems with high-dimensional observation spaces, it can only handle
  discrete and low-dimensional action spaces."** This is Lecture 8's continuous-argmax wall, in the
  professor's own words. Ch 10's opening line.
- **p. 29** — Policy Gradient. $J(\theta) = \sum_s d^\pi(s) V^\pi(s) = \sum_s d^\pi(s)\sum_a
  \pi_\theta(a|s) Q^\pi(s,a)$, $d^\pi$ the stationary distribution; $\theta^* = \argmax_\theta
  J(\theta)$. Closes with the reason policy methods suit continuous spaces: infinitely many actions
  to value, and $\argmax_a Q^\pi(s,a)$ "requires a full scan of the action space".
- **p. 30** — finite-difference gradient $\partial J/\partial\theta_k \approx (J(\theta+\epsilon u_k)
  - J(\theta))/\epsilon$: works even when $J$ is non-differentiable, but very slow.
- **p. 31** — Policy Gradient Theorem, the four-line derivation to
  $\nabla_\theta J = \E_\pi[\nabla \ln\pi_\theta(a|s) Q^\pi(s,a)]$, with the crucial margin note
  **"gradient does not depend on $\nabla_\theta$ of the dynamics"** — i.e. $P$ vanishes.
- **pp. 32–34** — the full proof, three slides: product rule on $\nabla_\theta V^\pi(s)$, unrolling
  the recursion through $\rho^\pi(s\to x,k)$, normalising $\eta(s)$ into $d^\pi$.
- **p. 35** — a roadmap slide listing GAE, A3C, DPG, DDPG, TD3, TRPO, PPO, SAC, MADDPG, with the
  framing "vanilla policy gradient has no bias but high variance; the following algorithms reduce
  variance while keeping the bias unchanged."
- **pp. 36–37** — REINFORCE. Monte-Carlo policy gradient, $\nabla_\theta J = \E_\pi[\nabla\ln\pi_\theta
  (A_t|S_t) G_t]$; p. 37 is a good trajectory figure with per-step, per-episode and per-batch update
  rules written out.
- **p. 38** — Actor-Critic. Critic updates $w$ for $Q_w$ or $V_w$; actor updates $\theta$.
- **pp. 39–40** — Off-policy policy gradient (Degris, White & Sutton 2012); importance weight
  $\pi_\theta(a|s)/\beta(a|s)$; the approximation that drops $\pi_\theta \nabla_\theta Q^\pi$ and
  still guarantees improvement.
- **pp. 41–43** — GAE (Schulman et al., 2016). Figures only, no text layer.
- **pp. 44–47** — A3C (Mnih et al., 2016). Replay's drawbacks, parallel actor-learners as a
  decorrelator; p. 46 is an excellent $n$-step return unrolling figure.
- **pp. 48–50** — DDPG overview; timeline figure DQN (Dec 2013) → DPG (ICML 2014) → DDPG (ICLR 2016).
- **pp. 51–52** — ★ **the continuous-action wall, argued twice.** Option 1, discretise the action
  space: what is a good $\Delta a$? too small → poor resolution, too large → intractable, and the
  optimum is never exactly attainable. Option 2, feed the action into the network: then
  $\max_{a'}Q_\theta(s',a')$ is a non-convex optimisation in $a'$ **at every update**, so the
  Q-learning step cannot be performed. This is the pair of slides Ch 10's Act 3 is built on.
- **pp. 53–61** — Deterministic Policy Gradient (Silver et al., 2014). Deterministic $\mu(s)$ makes
  $Q^\mu(s_t,a_t)=\E_{r,s'}[r + \gamma Q^\mu(s_{t+1},\mu(s_{t+1}))]$ — only the environment appears
  in the expectation, so off-policy training is possible and the inner expectation vanishes
  (variance down). DPG theorem: $\nabla_\theta J(\mu_\theta) = \E_{s\sim\rho^\mu}[\nabla_\theta
  \mu_\theta(s)\,\nabla_a Q(s,a)|_{a=\mu_\theta(s)}]$.
- **pp. 62–65** — exploration for a deterministic policy; why uniform random behaviour is a poor
  choice (three reasons, p. 63); the inverted-pendulum "intuitive optimal action" story (p. 64);
  the Ornstein–Uhlenbeck process $dx_t = -\theta x_t\,dt + \sigma\,dW_t$ for temporally correlated
  noise.
- **pp. 66–68** — DDPG proper: critic loss, actor gradient, behaviour policy $\mu'(s_t)=\mu_\theta
  (s_t)+\epsilon$, replay buffer, soft target updates; p. 68 is a nice PyTorch implementation note
  showing that `pi_loss = Q(s, mu(s))` and `.backward()` reproduces the DPG chain rule exactly.
- **pp. 69–70** — DDPG experiments on MuJoCo: with/without target networks, with/without batch norm,
  low-dimensional vs pixel inputs. "Target networks matter a lot!"
- **pp. 75–78** — TRPO and PPO. The importance-ratio objective, the KL trust-region constraint
  $\E[D_{KL}(\pi_{\theta_{old}}\|\pi_\theta)] \le \delta$, the clipped surrogate
  $J^{CLIP} = \E[\min(r(\theta)\hat A, \mathrm{clip}(r(\theta),1-\epsilon,1+\epsilon)\hat A)]$, and
  the shared-parameter objective with value and entropy terms.
- **pp. 79–89** — "Policy Gradient Algorithm From Different Angle": the trajectory derivation.
  $p(\tau)=\mu(s_0)\prod\pi_\theta(a_t|s_t)P(s_{t+1}|s_t,a_t)$ so $\nabla_\theta\log p(\tau) =
  \sum_t \nabla_\theta\log\pi_\theta(a_t|s_t)$ — **the dynamics differentiate away**; the
  log-derivative trick; the maximum-likelihood interpretation (p. 84: raise the likelihood of
  high-return trajectories); then variance reduction in three steps — causality / reward-to-go
  (p. 85), the baseline with a full unbiasedness proof (pp. 86–87) and a variance argument with the
  optimal $b(s_t)=\E[R_t(\tau)]$ (p. 88), and finally the advantage $A^\pi = Q^\pi - V^\pi$ and
  $\Psi_t$ (p. 89). **This is the cleanest derivation in the deck** and is the natural spine for
  Ch 10's Acts 1–2.

### Ch 13 · multi-agent — pages 71–74 (plus the Multi-Agent column of pp. 6–7)

- **p. 71** — MADDPG (Lowe et al., 2017): multiple agents with local information; from one agent's
  viewpoint the environment is **non-stationary** because the others are learning too. Formalised as
  a **Markov game**: $\mathcal N$ agents, joint states $\mathcal S$, per-agent actions
  $\mathcal A_i$, observations $\mathcal O_i$, transition $\mathcal T:\mathcal S\times\mathcal A_1
  \times\cdots\times\mathcal A_N\mapsto\mathcal S$, policies $\pi_{\theta_i}$ or $\mu_{\theta_i}$.
- **p. 72** — the centralised critic $Q_i^{\vec\mu}(\vec o, a_1,\dots,a_N)$, learned separately per
  agent, so rewards may conflict (competitive settings included).
- **p. 73** — critic and actor updates in full, with target policies $\vec\mu'$ and the note that
  each agent learns approximations of the others' policies.
- **p. 74** — policy ensembles ($K$ policies per agent, sampled per rollout) for variance;
  three-line summary: centralised critic + decentralised actors, inferred opponent policies,
  ensembling.
- **pp. 6–7** — the model-based and model-free multi-agent grids (see above). p. 6's four cells —
  Markov game, DT infinite dynamic game, CT Markov game, **differential game** — are the closest
  thing in this deck to a dynamic-games taxonomy.

---

## What Chapter 9 takes, and where each piece lands

| slide-level content | source | act |
|---|---|---|
| the two-lineage grid | spine §2 + PDF pp. 4–5 | handoff |
| the inner Action-space × Time-space grid, redrawn | **PDF pp. 4–5** | Act 1 widget |
| discrete-time OCP, $L(u)$, $\gamma_k$ permissible strategy | PDF p. 8 | Act 1 |
| the DP recursion, principle of optimality, "single-shot optimization" | PDF p. 9 | Act 1 |
| the expectation collapsing to one successor; $\max\to\min$ | tex frame 5 + Lec 7 | Act 1 |
| the continuous $\arg\min$ as a nested Lecture-1 problem | inference from PDF p. 9 + p. 19 | Act 1 |
| continuous-time OCP, $V(t,x)$, boundary condition | PDF pp. 15–16 | Act 2 |
| the HJB equation and its derivation | PDF pp. 17–18 | Act 2 + backup |
| sufficiency theorem, pointwise minimisation | PDF p. 19 | Act 2 |
| the verification proof | **PDF p. 20** | backup |
| curse of dimensionality, differentiability caveat | PDF p. 17 + tex | Act 2 |
| the discrete-time LQ problem and its ARE | **PDF pp. 10–13** | Act 3 |
| $J=\infty$ hazard; controllability | **PDF p. 11** | Act 3 |
| ARE uniqueness; Riccati recursion converges; = value iteration | **PDF p. 14** | Act 3 |
| continuous-time Riccati differential equation | PDF p. 21 | Act 3 |
| iLQR/DDP, DDPG's $\mu_\theta$ as the descendant of $K$ | tex frame 10 | Act 3 |
| Hamiltonian, costate, minimum principle | **tex only** (PDF p. 3 promises, never delivers) | Act 4 |
| HJB vs Pontryagin comparison | tex frame 12 | Act 4 |
| Euler–Lagrange → minimum principle | tex Backup 3 | backup |
