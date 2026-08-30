# Source extract — Chapter 10 · Policy-Based Reinforcement Learning

**Source deck.** `lecture_slides/9. Optimal Control and Policy Based Reinforcement Learning
(simple).pdf`, **pages 22–70 and 75–89** — the whole of the deck's section "2. Policy-Based
Reinforcement Learning", minus pp. 71–74 (MADDPG, which belongs to the multi-agent axis and has
been moved to IE579). Pages 1–21 are Chapter 9's and are inventoried in `ch09_extract.md`.

The deck is PowerPoint 2016 at 960×540pt. Every equation extracts mangled (Korean-locale maths
fonts, subscripts inlined as literals), so **every formula below has been re-typed from the
rendered page**. Figures are a mixture of vector shapes drawn in PowerPoint and raster screenshots
lifted from the papers; the latter are flagged as such because they cannot be redrawn faithfully,
only re-expressed.

**Act mapping** — `tex/Lecture10_Policy_Based_RL.tex` has four acts:
*Act 1 · a gradient without the model* · *Act 2 · taming variance with a critic* ·
*Act 3 · continuous control: DDPG* · *Act 4 · stepping without falling*.

---

## The three structural findings

**1. The deck derives the policy gradient twice, and the tex keeps only the second.**
Pages 29–34 give the **DP derivation**: start from $J(\theta)=\sum_s d^\pi(s)V^\pi(s)$, product-rule
$\nabla_\theta V^\pi$, unroll the recursion through the $k$-step visitation $\rho^\pi(s\to x,k)$,
normalise into $d^\pi$. Pages 79–89, under the heading **"Policy Gradient Algorithm From Different
Angle"**, give the **trajectory derivation**: write $p_\theta(\tau)$, take $\nabla\log$, watch the
dynamics differentiate away. The professor states the reason for doing it twice on p. 80:

> *We derived Policy Gradient Theorem using the concept of state value function to employ recursive
> formula on the basis of dynamic programming (Bellman equation). Now let's derive similar result
> without using DP approach but using episodic approach where agent engages in multiple trajectories
> in its environment.*

==The trajectory derivation is the one this chapter needs==, because it is the only one in which the
transition kernel appears explicitly and is then visibly cancelled — which is the whole claim of the
chapter's handoff ("delete the dynamics"). The DP derivation belongs in an appendix; it is the
Bellman-flavoured route and it never writes $P$ down where the student can watch it die. The tex
already makes this split (its Backup 1 carries the DP proof); the PDF justifies it.

**2. The variance-reduction ladder on pp. 85–89 is a complete, three-rung argument that the tex
compresses into one frame.** The rungs are *causality* (reward-to-go), *baseline* (with a full
unbiasedness proof **and** a variance argument that derives the optimal $b(s_t)$), and *advantage*.
The tex's Act 2 gives only the baseline and the advantage; the causality rung — with the professor's
own triangular-expansion picture of $(\sum_t f_t)(\sum_t f_t)$ showing exactly which cross terms are
pure noise — is dropped and is worth restoring. It is the cheapest variance reduction in RL and it
costs nothing but an index.

**3. The continuous-action wall is argued twice, on two facing slides (pp. 51–52), and this is the
pair the whole of Act 3 rests on.** Option 1 discretise: *what is a good $\Delta a$?* Option 2 feed
the action to the network: *then $\max_{a'}Q_\theta(s',a')$ is a non-convex optimisation at every
update.* This is Lecture 8's handed-over wall in the professor's own drawing, and p. 28 states it in
one sentence — "Although DQN solves problems with high-dimensional observation spaces, it can only
handle discrete and low-dimensional action spaces." ==That sentence is Chapter 10's opening
debt-collection.==

**A fourth, smaller finding.** The deck's DDPG half is unusually implementation-minded: p. 68 shows
that in PyTorch the DPG chain rule is *not implemented at all* — you write `pi_loss = -Q(s, mu(s))`,
call `.backward()`, and autograd produces $\nabla_\theta\mu\,\nabla_a Q$ for free. That is a genuinely
clarifying page and the tex has nothing like it.

---

## Part A — page-by-page inventory

### p. 22 — section divider
"2. Policy-Based Reinforcement Learning".

### pp. 23–26 — the four Overview grids, byte-identical to pp. 4–7
Already inventoried in `ch09_extract.md` §pp. 4–7 and already redrawn as Chapter 9's `control-grid`
widget. **Chapter 10's cell is p. 24**: inner grid corner reads *Model free* (green), row *Discrete
time*, column **Infinite** action space → **Policy-based Reinforcement Learning**. The cell
diagonally opposite on p. 23 is *Discrete-time dynamic system* $x_{t+1}=f(x_t,u_t)$ — Lecture 9.
The vertical arrow between p. 23 and p. 24 in the *infinite* column **is this chapter**.

Note again the empty *Continuous time* row of p. 24: there is no model-free continuous-time cell in
this course. → *handoff; do not re-draw the widget, cite it.*

### p. 27 — ★ the three-families Venn  → *handoff or Act 2*
Two overlapping discs. Left disc labelled **Value function**, outer label *Value based*. Right disc
labelled **Policy**, outer label *Policy-Based*. The lens where they overlap is labelled **Actor
Critic**. Nothing else on the page.

The canonical picture of the field's three families, and the cheapest possible statement of where
Act 2 is going: an actor–critic is not a compromise, it is the intersection. Worth one sentence in
the handoff and one callback when the critic arrives.

### p. 28 — ★★ Motivation. The chapter's opening debt.  → *handoff*
Verbatim:

- "One of the primary goals of the field of artificial intelligence is to solve complex tasks from
  unprocessed, high-dimensional, sensory input."
- "Recent progresses in RL have shown the possibilities: Deep Q Network for Atari games and AlphaGo."
- **"Although DQN solves problems with high-dimensional observation spaces, it can only handle
  discrete and low-dimensional action spaces."**

The third bullet is Lecture 8's handed-off wall, in the professor's own words, and it is the *only*
motivation the deck offers. The chapter should quote it.

### p. 29 — Policy Gradient: the objective  → *Act 1*
Policy gradient methods learn the policy directly with a function parameterised by $\theta$,
$\pi_\theta(a\mid s)$. The objective:

$$J(\theta) = \sum_{s\in\mathcal S} d^\pi(s)\,V^\pi(s) = \sum_{s\in\mathcal S} d^\pi(s)\sum_{a\in\mathcal A}\pi_\theta(a\mid s)\,Q^\pi(s,a)$$

where $d^\pi$ is the stationary distribution of the Markov chain induced by $\pi_\theta$ — the
on-policy state distribution:

$$d^\pi(s) = \lim_{t\to\infty} P(s_t = s \mid s_0, \pi_\theta)$$

and $\theta^* = \argmax_\theta J(\theta)$ by gradient **ascent**.

Closing bullets — *why policy methods suit continuous spaces*:
- "There is an infinite number of actions and (or) states to estimate the values";
- "Difficult to compute $\argmax_{a\in\mathcal A} Q^\pi(s,a)$ **requiring full scan of the action
  space**."

### p. 30 — the naive gradient: finite differences  → *Act 1*
Perturb $\theta$ by $\epsilon$ in the $k$-th coordinate:

$$\frac{\partial J(\theta)}{\partial\theta_k} \approx \frac{J(\theta+\epsilon u_k) - J(\theta)}{\epsilon}$$

- "It works even when $J(\theta)$ is not differentiable, **but very slow**."
- "Is there a more efficient method?"

**Worth restoring.** The tex drops this slide, and it is the honest alternative that makes the
score-function trick look like an achievement rather than a definition: one extra rollout *per
parameter*, for a network with $10^6$ parameters. It is also the exact analogue of Lecture 1's
"you could always just search" move.

### p. 31 — Policy Gradient Theorem, the four-line chain  → *Act 1 / Backup*

$$\nabla_\theta J(\theta) = \nabla_\theta \sum_s d^\pi(s)\sum_a \pi_\theta(a\mid s)Q^\pi(s,a)
\;\propto\; \sum_s d^\pi(s)\sum_a \nabla_\theta\pi_\theta(a\mid s)\,Q^\pi(s,a)$$
$$= \sum_s d^\pi(s)\sum_a \pi_\theta(a\mid s)\frac{\nabla_\theta\pi_\theta(a\mid s)}{\pi_\theta(a\mid s)}Q^\pi(s,a)
= \sum_s d^\pi(s)\sum_a \pi_\theta(a\mid s)\,\nabla_\theta\ln\pi_\theta(a\mid s)\,Q^\pi(s,a)$$
$$= \E_\pi\big[\nabla_\theta\ln\pi_\theta(a\mid s)\,Q^\pi(s,a)\big]$$

with the margin annotation on line 2 — **"gradient does not depend on $\nabla_\theta$ of the
dynamics"** — and the note that $\E_\pi$ means $\E_{s\sim d^\pi, a\sim\pi_\theta}$ (on-policy).

The $\propto$ rather than $=$ is deliberate: the derivative of $d^\pi$ with respect to $\theta$ is
what the unrolling on pp. 32–34 disposes of, at the cost of a constant $\sum_s\eta(s)$.

### pp. 32–34 — ★ the full DP proof, three slides  → *Backup 1*

**p. 32 — the recursion.** Product rule on $\nabla_\theta V^\pi(s) = \nabla_\theta\sum_a\pi_\theta(a\mid s)Q^\pi(s,a)$:

$$= \sum_a\big[\nabla_\theta\pi_\theta(a\mid s)Q^\pi(s,a) + \pi_\theta(a\mid s)\nabla_\theta Q^\pi(s,a)\big]$$

Extend $Q^\pi$ with the next state value, $Q^\pi(s,a)=\sum_{s',r}P(s',r\mid s,a)[r+V^\pi(s')]$; since
$P$ is not a function of $\theta$, $\nabla_\theta$ passes through it:

$$\nabla_\theta V^\pi(s) = \sum_a\Big[\nabla_\theta\pi_\theta(a\mid s)Q^\pi(s,a) + \pi_\theta(a\mid s)\sum_{s'}P(s'\mid s,a)\nabla_\theta V^\pi(s')\Big]$$

**p. 33 — the unrolling.** With $\phi(s) := \sum_a \nabla_\theta\pi_\theta(a\mid s)Q^\pi(s,a)$ and
$\rho^\pi(s\to s',1) = \sum_a \pi_\theta(a\mid s)P(s'\mid s,a)$:

$$\nabla_\theta V^\pi(s) = \phi(s) + \sum_{s'}\rho^\pi(s\to s',1)\,\nabla_\theta V^\pi(s')$$

Substituting into itself repeatedly and using $\rho^\pi(s\to s'',2)=\sum_{s'}\rho^\pi(s\to s',1)\rho^\pi(s'\to s'',1)$:

$$\nabla_\theta V^\pi(s) = \sum_{x\in\mathcal S}\sum_{k=0}^{\infty}\rho^\pi(s\to x,k)\,\phi(x)$$

**p. 34 — the normalisation.** With $\eta(s)=\sum_{k=0}^\infty\rho^\pi(s_0\to s,k)$,

$$\nabla_\theta J(\theta)=\nabla_\theta V^\pi(s_0)=\sum_s\eta(s)\phi(s)
= \Big(\sum_s\eta(s)\Big)\sum_s\frac{\eta(s)}{\sum_s\eta(s)}\phi(s)
\;\propto\; \sum_s d^\pi(s)\phi(s)$$

and then the $\nabla\ln$ substitution as on p. 31, ending at $\E_\pi[\nabla_\theta\ln\pi_\theta(a\mid s)Q^\pi(s,a)]$.

### p. 35 — the roadmap of algorithms  → *Act 2 opening / appendix zoo*
Headed with the theorem, then: **"This vanilla policy gradient update has no bias but high variance.
Many following algorithms were proposed to reduce the variance while keeping the bias unchanged."**
The list, in the deck's order: REINFORCE · Actor-Critic · Off-Policy Policy Gradient · GAE
(Schulman 2016) · A3C (Mnih 2016) · DPG · DDPG (Lillicrap 2015) · TD3 (Fujimoto 2018) ·
TRPO (Schulman 2015) · PPO (Schulman 2017) · SAC (Haarnoja 2018) · MADDPG (Lowe 2017).

==That sentence is the spine of Acts 2–4==: everything after REINFORCE is variance control or step
control.

### pp. 36–37 — REINFORCE  → *Act 1*

**p. 36.** REINFORCE (Monte-Carlo policy gradient) uses an estimated return from episode samples:

$$\nabla_\theta J(\theta) = \E_\pi[\nabla_\theta\ln\pi_\theta(a\mid s)Q^\pi(s,a)]
= \E_\pi[\nabla_\theta\ln\pi_\theta(A_t\mid S_t)\,G_t] \qquad \because Q^\pi(s,a)=\E_\pi[G_t\mid S_t,A_t]$$

"Measure $G_t$ from real sample trajectories and use that to update the policy gradient. It relies
on a full trajectory and that's why it is a Monte-Carlo method." Closing bullet: "A widely used
variation of REINFORCE is to subtract a baseline value from the return $G_t$ to reduce the variance
of gradient estimation while keeping the bias unchanged."

**p. 37 — ★ the trajectory figure, and the three update granularities.** A red trajectory curve with
five sampled points $(S_1,A_1)\dots(S_5,A_5)$; from each, a dashed line runs *right* to the episode
end, where $G_1,\dots,G_5$ are stacked; each point carries the label
$\nabla_\theta\ln\pi_\theta(A_t\mid S_t)G_t$. A green annotation on the horizontal span $T$ reads
**"Can be updated only after an episode is finished."** Then three update rules:

$$\text{per action:}\quad \theta \leftarrow \theta + \alpha\gamma^t\nabla_\theta\ln\pi_\theta(A_t\mid S_t)G_t$$
$$\text{per episode:}\quad \theta \leftarrow \theta + \alpha\sum_{t=1}^{T}\gamma^t\nabla_\theta\ln\pi_\theta(A_t\mid S_t)G_t$$
$$\text{per episode \& batch:}\quad \theta \leftarrow \theta + \alpha\frac{1}{N}\sum_{i=1}^{N}\sum_{t=1}^{T}\gamma^t\nabla_\theta\ln\pi_\theta(A_t^{(i)}\mid S_t^{(i)})G_t^{(i)}$$

**Worth restoring:** the $\gamma^t$ factor (usually dropped in practice and rarely written), and the
green annotation — *the whole of Act 2's motivation is that arrow that must wait for the end of the
episode*. The dashed lines all running to the same terminal point are also, visually, exactly why
the naive estimator has such high variance: every term shares the same tail noise.

### p. 38 — Actor–Critic  → *Act 2*
"It makes a lot of sense to learn the value function in addition to the policy, since knowing the
value function can assist the policy update, such as by reducing gradient variance in vanilla policy
gradients." Two components:
- **Critic** updates the value parameters $w$ — either $Q_w(s,a)$ or $V_w(s)$;
- **Actor** updates the policy parameters $\theta$ for $\pi_\theta(a\mid s)$, *in the direction
  suggested by the critic*.

Annotated "(on-policy learning)". *(The slide's diagram is a raster screenshot of the standard
Sutton–Barto actor–critic box diagram; the tex redraws it in TikZ, which is the right move.)*

### pp. 39–40 — Off-policy policy gradient  → *Act 2 aside / Act 3 setup*
{p}(Degris, White & Sutton, 2012)

**p. 39 — why.** Both REINFORCE and vanilla actor–critic are on-policy: "training samples are
collected according to the target policy — the very same policy that we try to optimize for."
Off-policy buys: (i) no need for full trajectories, and reuse of any past episode (experience
replay) for much better sample efficiency; (ii) a behaviour policy different from the target,
bringing better exploration.

**p. 40 — the derivation.** With $d^\beta$ the state distribution of the behaviour policy $\beta$,

$$J(\theta) = \sum_s d^\beta(s)\sum_a \pi_\theta(a\mid s)Q^\pi(s,a)$$
$$\nabla_\theta J(\theta) = \E_{s\sim d^\beta}\Big[\sum_a\big(\nabla_\theta\pi_\theta(a\mid s)Q^\pi(s,a) + \pi_\theta(a\mid s)\nabla_\theta Q^\pi(s,a)\big)\Big]$$
$$\approx \E_{s\sim d^\beta}\Big[\sum_a \nabla_\theta\pi_\theta(a\mid s)Q^\pi(s,a)\Big] \qquad(\text{ignore } \pi_\theta\nabla_\theta Q^\pi)$$
$$= \E_\beta\Big[\underbrace{\frac{\pi_\theta(a\mid s)}{\beta(a\mid s)}}_{\text{importance weight}}\nabla_\theta\ln\pi_\theta(a\mid s)\,Q^\pi(s,a)\Big]$$

with the guarantee, from Degris et al., that the approximation still improves the policy and reaches
a true local optimum.

==This importance ratio is the same object that reappears as TRPO/PPO's $r(\theta)$ on pp. 75–77==,
and saying so joins Act 2 to Act 4.

### pp. 41–43 — GAE  → *Backup*
{p}(Schulman et al., 2016). **Three raster screenshots straight from the paper** — no text layer, no
PowerPoint content. Re-typed from the images:

- p. 41: the title page / problem framing.
- p. 42: equations (4)–(6) of the paper — the $\gamma$-discounted value, action-value and advantage,
  and $g^\gamma := \E_{s_{0:\infty},a_{0:\infty}}[\sum_{t}A^{\pi,\gamma}(s_t,a_t)\nabla_\theta\log\pi_\theta(a_t\mid s_t)]$,
  with the framing sentence: "$\gamma$ allows us to reduce variance by downweighting rewards
  corresponding to delayed effects, at the cost of introducing bias."
- p. 43: equations (11)–(19) — the $k$-step estimators
  $\hat A_t^{(k)} = \sum_{l=0}^{k-1}\gamma^l\delta^V_{t+l} = -V(s_t)+r_t+\cdots+\gamma^kV(s_{t+k})$,
  and the exponentially weighted average

$$\hat A_t^{\text{GAE}(\gamma,\lambda)} := (1-\lambda)\big(\hat A^{(1)}_t + \lambda\hat A^{(2)}_t + \lambda^2\hat A^{(3)}_t+\cdots\big) = \sum_{l=0}^{\infty}(\gamma\lambda)^l\,\delta^V_{t+l}$$

$\lambda=0$ gives the one-step TD advantage (low variance, biased); $\lambda=1$ gives the Monte-Carlo
advantage (unbiased, high variance). ==GAE is TD($\lambda$) for the advantage== — the same dial
Lecture 8's Backup 1 named for the value. Neither the tex nor the deck says that out loud; it is the
cleanest way to place GAE for a student who has had Lecture 8.

### pp. 44–47 — A3C / A2C  → *Act 2*
{p}(Mnih et al., 2016)

**p. 44 — why not replay.** "Deep RL algorithms based on experience replay have achieved
unprecedented success... However, experience replay has several drawbacks: it uses more memory and
computation per real interaction; it requires off-policy learning algorithms that can update from
data generated by an older policy." Instead A3C runs multiple agents **asynchronously in parallel**
on multiple instances of the environment:
- "Parallelism decorrelates the agents' data into a more stationary process, since at any given time
  step the parallel agents will be experiencing a variety of different states."
- "Parallelism stabilizes learning, **playing a role of experience replay buffer**."
- Different exploration policies per actor-learner maximise diversity.

**p. 45 — the pseudocode** (raster) with the $n$-step return

$$R = \sum_{i=1}^{t_{\max}}\gamma^{i-1}r_{t-i} + \gamma^{t_{\max}}V(s_t;\theta_v')$$

and the note "the gradient accumulation step can be considered as a parallelized reformation of a
mini-batch-based stochastic gradient update."

**p. 46 — ★ the $n$-step unrolling figure.** A timeline from $t_{\text{start}}$ to $t$, with
$\nabla_\theta\ln\pi_\theta(a_i\mid s_i)$ above each step and rewards $r_i$ below, and the return
accumulating *backwards* in four written lines:

$$R = V(s_t;\theta_v') \;\to\; R\leftarrow r_{t-1}+\gamma V \;\to\; R\leftarrow r_{t-2}+\gamma r_{t-1}+\gamma^2 V \;\to\; \cdots$$

ending at the update $\theta\leftarrow\theta+\alpha\sum_t\gamma^t\nabla_\theta\ln\pi_\theta(A_t\mid S_t)\big(R_t - V(s_t)\big)$.

This figure is the honest picture of "bootstrap after $n$ steps instead of at the end", and it is
the direct visual sequel to p. 37's REINFORCE figure — same timeline, but the dashed lines now stop
at $t$ instead of running to $T$. Worth naming the pair.

**p. 47** — the A2C-vs-A3C schematic, an external figure
(danieltakeshi.github.io/2018/06/28/a2c-a3c/). Synchronous A2C waits for all workers, then does one
batched update; A3C lets each worker update the shared parameters when it is ready.

### pp. 48–50 — DDPG, framed  → *Act 3*

**p. 48 — the timeline figure.** Three boxes on an arrow:
DQN (**Dec 19, 2013**) → Deterministic Policy Gradient (**ICML 2014**) → DDPG (**ICLR 2016**).
"DDPG is a deep version of *Deterministic Policy Gradient* (2014). The tricks for stabilizing DQN
were also used in DDPG."

**p. 49 — the architecture figure.** A MuJoCo frame feeds two networks: a **Value Network** emitting
$Q_\theta(s,a)$ and a **Deterministic Policy Network** emitting $a$; the action is fed back into the
value network; an **Ornstein–Uhlenbeck process** is added to $a$. Annotated at the top:
*+ Target network, + Experience replay*; at the left, *"Low dimensional inputs"*.

**p. 50 — the four claims.** DDPG combines DQN and deterministic PG; handles continuous action
space; deterministic-but-continuous policy enables off-policy training and sample-efficient
training; uses temporally correlated exploration (Ornstein–Uhlenbeck).

### pp. 51–52 — ★★★ THE PAIR. The continuous-action wall, argued twice.  → *Act 3*

Both pages are headed "1. Deterministic Policy Gradient (Silver et al., 2014)" and sub-headed
**"Q-Learning on continuous action space?"**, with the note *"Mujoco action = motor control input
of each joint."*

**p. 51 — Option 1: action discretisation.** Figure: MuJoCo frame → *Value Network* → a **column of
$|\mathcal A|$ output cells** labelled $Q_\theta(s,a)$ — one head per discretised action, the DQN
architecture. Text:

> Assume the range of control input $-1\le a\le 1$. Then we can discretize the action space as we
> want. For instance, $[-1, -1+\Delta a, -1+2\Delta a, \dots, 1]$. On the discretized action space,
> we can perform Q-Learning.
>
> **Then what is good $\Delta a$? Too small $\Delta a$ → less control resolution / too high
> $\Delta a$ → computationally intractable. Even if we can perform DQN with sufficiently high
> $\Delta a$, still optimal action couldn't be achievable.**

*(The deck's "too small / too high" wording refers to the number of bins, not the spacing — the
sense is: coarse grid → poor resolution; fine grid → intractable. The chapter should state it in
terms of the grid size to avoid the ambiguity.)*

**p. 52 — Option 2: the action as an extra input.** Figure: the same value network, but now with
**two** inputs (the frame *and* $\boldsymbol a$) and a **single** output cell $Q_\theta(s,a)$. The
Q-learning update is printed at the top right for reference:

$$Q(s,a)\leftarrow Q(s,a) + \eta\Big(r+\gamma\max_{a'}Q(s',a') - Q(s,a)\Big)$$

> Assume we decided to use "action" as additional input for the Q network.
> **It is hard to find the $\max_{a'}Q_\theta(s',a')$ since $Q_\theta(s',a')$ is (most of the case)
> non-convex. That is, we cannot perform the Q-learning update.**

==This is the exact wall Lecture 8 hands over==, and the pair says something the tex only gestures
at: the wall is not an inconvenience in the *representation*, it is in the *update rule*. Option 1
keeps the update and breaks the action space; option 2 keeps the action space and breaks the update.
There is no third way that keeps Q-learning. → **Act 3 widget.**

### pp. 53–61 — Deterministic Policy Gradient  → *Act 3*
{p}(Silver et al., 2014)

**p. 53.** "Continuous policy function is required. Let's use the actor–critic scheme: Critic = Q
network; Actor = deterministic policy." With the forward reference "Why deterministic? It has
several advantages over stochastic policy."

**p. 54 — ★ the reason to be deterministic.** Recall the Bellman expectation equation, with $E$ the
environment and $\pi$ the target policy:

$$Q^\pi(s_t,a_t) = \E_{r_t,s_{t+1}\sim E}\Big[r(s_t,a_t) + \gamma\,\E_{a_{t+1}\sim\pi}\big[Q^\pi(s_{t+1},a_{t+1})\big]\Big]$$

— "that is, environment **and policy** determine $Q^\pi$". If $\pi$ is deterministic, written
$\mu(s)$:

$$Q^\mu(s_t,a_t) = \E_{r_t,s_{t+1}\sim E}\big[r(s_t,a_t) + \gamma\,Q^\mu(s_{t+1},\mu(s_{t+1}))\big]$$

— "that is, the **environment solely** determines $Q^\mu$". Two consequences, numbered on the slide:
1. this enables training in an **off-policy** fashion;
2. **no need to estimate the inner expectation → less variance**.

**Worth restoring in full.** This is the cleanest single argument in the DDPG half, and the tex omits
it entirely. It is also the precise point at which the control lineage's determinism stops being a
stylistic preference and becomes a variance argument.

**p. 55.** "Remaining question: can we actually train a continuous deterministic policy? If yes,
what is the loss function? Answer is *yes we can*."

**p. 56 — notation.** $\rho_0(s)$ the initial state distribution; $\rho^\mu(s\to s',k)$ the
visitation density at $s'$ after $k$ steps from $s$; the discounted state distribution

$$\rho^\mu(s') = \int_{\mathcal S}\sum_{k=1}^{\infty}\gamma^{k-1}\rho_0(s)\,\rho^\mu(s\to s',k)\,ds$$

**p. 57 — the DPG theorem.**

$$J(\theta) = \int_{\mathcal S}\rho^\mu(s)\,Q\big(s,\mu_\theta(s)\big)\,ds$$
$$\nabla_\theta J(\theta) = \int_{\mathcal S}\rho^\mu(s)\,\nabla_a Q^\mu(s,a)\big|_{a=\mu_\theta(s)}\,\nabla_\theta\mu_\theta(s)\,ds
= \E_{s\sim\rho^\mu}\big[\nabla_a Q^\mu(s,a)\big|_{a=\mu_\theta(s)}\nabla_\theta\mu_\theta(s)\big]$$

with two remarks: the deterministic policy is the limiting case of the stochastic one when the
action distribution collapses to a point mass; and "we expect the stochastic policy to require more
samples as it integrates the data over the whole state **and action** space."

**p. 58 — the two objectives side by side.**

$$J(\pi_\theta) = \int_{s}\rho^{\pi_\theta}(s)\int_{a}\pi_\theta(s,a)\,r(s,a)\,da\,ds = \E_{s\sim\rho^{\pi_\theta}, a\sim\pi_\theta}[r(s,a)]$$
$$J(\mu_\theta) = \int_{s}\rho^{\mu_\theta}(s)\,r\big(s,\mu_\theta(s)\big)\,ds = \E_{s\sim\rho^{\mu_\theta}}\big[r(s,\mu_\theta(s))\big]$$

==One integral instead of two.== That difference is the whole variance argument, visible as an
absence.

**p. 59 — Theorem 1 restated, and what it takes to implement.** Two requirements:
1. "A deterministic policy function that allows us to compute the gradient w.r.t. $\theta$ easily";
2. "An action-value function $Q(s,a)$ that allows us to compute the gradient **w.r.t. $a$**."
   → *"In DDPG, both are neural networks."*
Plus Theorem 2 of the DPG paper, quoted as a known fact: **the deterministic policy gradient is the
limiting case of the stochastic policy gradient.**

**p. 60 — the on-policy deterministic actor–critic, written out.**

$$\delta_t = R_t + \gamma Q_w(s_{t+1},a_{t+1}) - Q_w(s_t,a_t)$$
$$w_{t+1} = w_t + \alpha_w\,\delta_t\,\nabla_w Q_w(s_t,a_t)$$
$$\theta_{t+1} = \theta_t + \alpha_\theta\,\nabla_a Q_w(s_t,a_t)\big|_{a_t=\mu_\theta(s_t)}\nabla_\theta\mu_\theta(s)$$

then the catch: "unless there is sufficient noise in the environment, it is very hard to guarantee
enough exploration due to the determinacy of the policy. We can either add noise to the policy
(ironically this makes it nondeterministic!) or learn it off-policy by following a different
stochastic behaviour policy."

**p. 61 — summary.** Vanilla deep Q-learning is not eligible for continuous action spaces;
actor–critic is natural; a deterministic continuous policy lets the critic train off-policy;
losses = Bellman error for the critic, deterministic policy gradient for the actor.

### pp. 62–65 — exploration for a deterministic actor  → *Act 3*

**p. 62.** "Since we choose to use a deterministic policy, we confront the *exploration problem*
again." Other methods' answers listed: MC with exploring starts; DQN with $\epsilon$-greedy; entropy
bonus on PG methods; soft value functions.

**p. 63 — ★ why uniform random is a bad behaviour policy. Three reasons, verbatim:**
1. "random action will force to optimize policy parameters on where the value estimate $Q$ is not
   accurate";
2. "doing (random) action but **consistently along the episode** is helpful for exploring unseen
   states";
3. "practically, random jittering would break the physical system."

Reason 1 is Lecture 5's adversarial-optimiser hazard restated for RL, and reason 3 is the only place
in the whole course where a *physical* constraint decides an algorithm. Both worth keeping.

**p. 64 — ★ the inverted-pendulum figure.** Four overlaid pendulum poses $s_0\to s_3$ swinging up
about a pivot, with orange torque arrows $a_0,a_1,a_2$. Caption: objective is to make the pole
upright and stay upright. **"Intuitive optimal actions: (1) push the pole in a consistent direction
until it is near the upright position; (2) when the pole is near upright, alternate the forcing
directions."** Then: "If we use a *random* behavioural policy, can the RL agent find the intuitive
optimal action? It might find it, but only after consuming a lot of samples."

This is the argument for temporally correlated noise, made physical, and it is much better than the
usual hand-wave. A swing-up needs a *sustained* push; white noise averages to nothing over the
episode and never sustains anything.

**p. 65 — the Ornstein–Uhlenbeck process.** "Generates random variables that are temporally
correlated." As an SDE and in Langevin form:

$$dx_t = -\theta x_t\,dt + \sigma\,dW_t, \qquad \frac{dx_t}{dt} = -\theta x_t + \sigma\eta(t)$$

with $\theta>0$, $\sigma>0$, $W_t$ a Wiener process and $\eta(t)$ white noise. *(Note the symbol
clash: this $\theta$ is the OU mean-reversion rate, not the policy parameters. The chapter must
rename it — $\theta_{\text{OU}}$ or $\kappa$.)*

### pp. 66–68 — DDPG proper  → *Act 3*

**p. 66 — the algorithm in four lines.** An off-policy actor–critic:
- critic loss $\;\frac1N\sum_i\big(Q^\mu(s_i,a_i) - (r_i + \gamma Q^\mu(s_{i+1},\mu(s_{i+1})))\big)^2$;
- actor gradient $\;\nabla_\theta J(\mu_\theta) = \E_{s\sim\rho^\beta}[\nabla_\theta\mu_\theta(s)\nabla_aQ(s,a)|_{a=\mu_\theta(s)}]$;
- behaviour policy $\;\mu'(s_t) = \mu_\theta(s_t) + \epsilon$, with $\epsilon$ from the OU process;
- **+ replay buffer**, **+ target networks for both policy and critic**.

**p. 67 — the boxed algorithm** (raster of the paper's Algorithm 1) with three margin annotations in
red: *"for every transition"* bracketing the inner loop; *"Gradually changing target networks"*
beside the soft updates

$$\theta^{Q'}\leftarrow\tau\theta^Q + (1-\tau)\theta^{Q'}, \qquad \theta^{\mu'}\leftarrow\tau\theta^\mu + (1-\tau)\theta^{\mu'}$$

and *"Approximate it using minibatch samples"* beside the boxed DPG expectation. The critic target
is $y_i = r_i + \gamma Q'(s_{i+1},\mu'(s_{i+1}\mid\theta^{\mu'})\mid\theta^{Q'})$ and the actor step is

$$\nabla_{\theta^\mu}J \approx \frac1N\sum_i \nabla_a Q(s,a\mid\theta^Q)\big|_{s=s_i,a=\mu(s_i)}\,\nabla_{\theta^\mu}\mu(s\mid\theta^\mu)\big|_{s_i}$$

Note **soft** target updates ($\tau\ll1$, every step) rather than DQN's hard copy every $C$ steps —
a small but real difference from Lecture 8 worth one clause.

**p. 68 — ★ the implementation trick.** A PyTorch snippet beside the maths. The actor loss is simply
`pi_loss` $= Q_\phi(s,\mu_\theta(s))$, and `pi_loss.backward()` computes

$$\frac{\partial Q_\phi(s,\mu_\theta(s))}{\partial\theta} = \frac{\partial Q_\phi(s,\mu_\theta(s))}{\partial\mu_\theta(s)}\frac{\partial\mu_\theta(s)}{\partial\theta} = \frac{\partial Q_\phi}{\partial a}\frac{\partial\mu_\theta}{\partial\theta} = \nabla_\theta\mu_\theta(s)\,\nabla_aQ(s,a)\big|_{a=\mu_\theta(s)}$$

**Nobody implements the DPG theorem.** Autograd's chain rule *is* the DPG theorem. This page is
worth a slide or a small aside — it converts a theorem into one line of code and shows the student
what the theorem is actually saying.

### pp. 69–70 — DDPG experiments  → *Act 3 closing*

**p. 69 — ten MuJoCo learning curves** (raster from the paper): Cart, Pendulum Swing-up, Cartpole
Swing-up, Fixed Reacher, Monoped Balancing / Gripper, Blockworld, Puck Shooting, Cheetah, Moving
Gripper. Four traces per panel: **DDPG (green)**, **DDPG w/o target networks (light grey)**,
**DDPG w/o batch norm (dark grey)**, **DDPG from pixel inputs (blue)**. Rewards normalised so 0 is
"as good as random" and 1 is "as good as planning". $x$-axis to ~1.5 million steps.
Caption, in bold on the slide: **"Target networks matter a lot!"**

The light-grey traces are visibly the worst in nearly every panel — Lecture 8's target-network trick
carried over intact, and evidence for it. The blue (pixel) traces reaching roughly the green ones is
the paper's other headline.

**p. 70 — low-dimensional vs pixel inputs.** "DDPG-lowd" and "DDPG-pix"; rewards normalised so 0 =
random policy and 1 = planning.

### pp. 71–74 — MADDPG. **Not this chapter.**
Multi-agent DDPG {p}(Lowe et al., 2017): the Markov-game formalisation, the centralised critic
$Q_i^{\vec\mu}(\vec o, a_1,\dots,a_N)$, decentralised actors, inferred opponent policies, policy
ensembles. Inventoried in `ch09_extract.md`. The whole multi-agent axis moved to IE579 under spine
v3; Chapter 10 should not touch these pages.

### pp. 75–78 — TRPO and PPO  → *Act 4*

**p. 75 — TRPO, the off-policy objective.** "To improve training stability, we should avoid
parameter updates that change the policy too much at one step. TRPO carries out this idea by
enforcing a KL divergence constraint on the size of the policy update at each iteration."

$$J(\theta) = \sum_s \rho^{\pi_{\theta_{\text{old}}}}(s)\sum_a \pi_\theta(a\mid s)\hat A_{\theta_{\text{old}}}(s,a)
= \E_{s\sim\rho^{\pi_{\theta_{\text{old}}}},\,a\sim\beta}\Big[\frac{\pi_\theta(a\mid s)}{\beta(a\mid s)}\hat A_{\theta_{\text{old}}}(s,a)\Big]$$

**p. 76 — TRPO, on-policy, and the constraint.** With $\beta=\pi_{\theta_{\text{old}}}$,

$$J(\theta) = \E_{s\sim\rho^{\pi_{\theta_{\text{old}}}},\,a\sim\pi_{\theta_{\text{old}}}}\Big[\frac{\pi_\theta(a\mid s)}{\pi_{\theta_{\text{old}}}(a\mid s)}\hat A_{\theta_{\text{old}}}(s,a)\Big]
\quad\text{s.t.}\quad \E_{s\sim\rho^{\pi_{\theta_{\text{old}}}}}\big[D_{\mathrm{KL}}(\pi_{\theta_{\text{old}}}(\cdot\mid s)\,\|\,\pi_\theta(\cdot\mid s))\big]\le\delta$$

"In this way, the old and new policies would not diverge too much when this hard constraint is met.
While still, TRPO can guarantee a **monotonic improvement** over policy iteration (why?)" — the
parenthetical "(why?)" is the professor's, left as an exercise.

**p. 77 — PPO.** "Given that TRPO is relatively complicated and we still want to implement a similar
constraint, PPO simplifies it by using a clipped surrogate objective while retaining similar
performance." With $r(\theta) = \pi_\theta(a\mid s)/\pi_{\theta_{\text{old}}}(a\mid s)$,
$J^{\text{TRPO}}(\theta) = \E[r(\theta)\hat A]$, and

$$J^{\text{CLIP}}(\theta) = \E\Big[\min\big(r(\theta)\hat A_{\theta_{\text{old}}},\ \mathrm{clip}(r(\theta),1-\epsilon,1+\epsilon)\hat A_{\theta_{\text{old}}}\big)\Big]$$

with the reason: "Without a limitation on the distance between $\theta_{\text{old}}$ and $\theta$,
maximizing $J^{\text{TRPO}}$ would lead to instability with extremely large parameter updates and
big policy ratios."

**p. 78 — the shared-parameter objective.** When actor and critic share a trunk:

$$J^{\text{CLIP}'}(\theta) = \E\Big[J^{\text{CLIP}}(\theta) - c_1\big(V_\theta(s)-V_{\text{target}}\big)^2 + c_2\,H\big(s,\pi_\theta(\cdot)\big)\Big]$$

$c_1,c_2$ hyperparameter constants; $H$ the entropy bonus, "to encourage sufficient exploration".
*(The entropy term is the bridge to SAC and, in the tex's Backup 3, onward.)*

### pp. 79–89 — ★★★ "Policy Gradient Algorithm From Different Angle" — the trajectory derivation
**This is the chapter's spine for Acts 1–2.** Eleven consecutive slides, self-contained.

**p. 79** — section title.

**p. 80 — why do it again.** Quoted in full at the top of this document. DP route already done;
now the episodic route.

**p. 81 — the trajectory and its law.** A trajectory of length $T$:

$$\tau = (s_0,a_0,r_0,s_1,a_1,r_1,\dots,s_{T-1},a_{T-1},s_T)$$

with $s_0$ from the starting distribution, $a_i\sim\pi_\theta(a_i\mid s_i)$, and
$s_i\sim P(s_i\mid s_{i-1},a_{i-1})$ with **"$P$ the dynamic model describing how the environment
changes"**. Then

$$p(\tau) = \mu(s_0)\prod_{t=0}^{T-1}\pi_\theta(a_t\mid s_t)\,P(s_{t+1}\mid s_t,a_t)$$

$$\nabla_\theta\log p(\tau) = \nabla_\theta\Big[\log\mu(s_0) + \sum_{t=0}^{T-1}\big(\log\pi_\theta(a_t\mid s_t) + \log P(s_{t+1}\mid s_t,a_t)\big)\Big] = \sum_{t=0}^{T-1}\nabla_\theta\log\pi_\theta(a_t\mid s_t)$$

==The single most important line in the chapter.== The dynamics enter $p(\tau)$ and leave
$\nabla\log p(\tau)$, because they carry no $\theta$.

**p. 82 — the log-derivative trick, in five steps.** Maximise
$\E_{\pi_\theta}[\sum_t r_t] = \E_{\tau\sim p_\theta}[R(\tau)]$ "because we know $\tau$ is influenced
by $\pi_\theta$":

$$\nabla_\theta\E_{\tau\sim p_\theta}[R(\tau)] = \nabla_\theta\int p_\theta(\tau)R(\tau)d\tau
= \int \frac{p_\theta(\tau)}{p_\theta(\tau)}\nabla_\theta p_\theta(\tau) R(\tau)d\tau
= \int p_\theta(\tau)\nabla_\theta\ln p_\theta(\tau)R(\tau)d\tau$$
$$= \E_{\tau\sim p_\theta}\big[\nabla_\theta\ln p_\theta(\tau)R(\tau)\big]
= \E_{\tau\sim\pi_\theta}\Big[\Big(\sum_{t=0}^{T-1}\nabla_\theta\log\pi_\theta(a_t\mid s_t)\Big)\Big(\sum_{t=0}^{T-1}r_t\Big)\Big]$$

**p. 83 — the empirical estimator.** $\theta\leftarrow\theta+\alpha\nabla_\theta\E_{\tau\in\mathcal T}[R(\tau)]$ with

$$\nabla_\theta\E_{\tau\in\mathcal T}[R(\tau)] \approx \frac1N\sum_{i=1}^{N}\Big(\sum_{t=0}^{T-1}\nabla_\theta\log\pi_\theta(a^{(i)}_t\mid s^{(i)}_t)\Big)\Big(\sum_{t=0}^{T-1}r^{(i)}_t\Big)$$

with the honest caveat: "This approach will be **too slow and unreliable due to high variance** on
the gradient estimate. We need various variance reduction techniques."

**p. 84 — ★ interpreting the policy gradient.** The same formula, annotated underneath:
the first factor is labelled *"probability of trajectory"* and identified as $\nabla_\theta J_{ML}(\theta)$
— **the maximum-likelihood gradient** — and the second factor *"reward of trajectory"*. Then:

> - **Increase the likelihood for the trajectory with large accumulated reward**
> - **Decrease the likelihood for the trajectories with small accumulated reward**

==Policy gradient is maximum likelihood on your own trajectories, weighted by how well they went.==
This is the interpretive centre of the whole chapter and the tex reduces it to the phrase "reweighted
imitation of one's own better moments". Restore the ML framing explicitly — it also connects
straight back to Lecture 2 (MLE) and Lecture 6 (a generative model trained to emit good designs).

**p. 85 — variance reduction 1: causality.** "Apply causality: the policy at time $t'$ cannot affect
the reward at time $t$ when $t<t'$." So

$$\nabla_\theta\E[R] \approx \frac1N\sum_i\sum_{t=0}^{T-1}\nabla_\theta\log\pi_\theta(a^{(i)}_t\mid s^{(i)}_t)\sum_{t'=t}^{T-1}r^{(i)}_{t'}
= \frac1N\sum_i\sum_t \nabla_\theta\log\pi_\theta(a^{(i)}_t\mid s^{(i)}_t)\,\hat Q^{(i)}_t$$

with $\hat Q_t$ labelled **"reward to go"**. The right-hand margin carries the expansion showing why:

$$(f_0+f_1+\cdots+f_T)(f_0+f_1+\cdots+f_T) = f_0(f_0+\cdots+f_T) + f_1(f_0+\cdots+f_T)+\cdots$$

— every product $f_t \cdot r_{t'}$ with $t' < t$ has zero mean and contributes only variance.

**pp. 86–87 — variance reduction 2: the baseline, and the proof it is free.**

$$\nabla_\theta\E_{\tau\sim\pi_\theta}[R(\tau)] = \E_{\tau\sim\pi_\theta}\Big[\sum_t \nabla_\theta\log\pi_\theta(a_t\mid s_t)\Big(\sum_{t'\ge t} r_{t'} - b(s_t)\Big)\Big]$$

"We need to verify two things: (1) inserting a baseline does not make the gradient estimate biased;
(2) the baseline actually reduces variance. **Staying unbiased and reducing variance is always
good!**"

*Proof of (1)*, in the deck's own four lines — split the expectation by time:

$$\E_{\tau\sim\pi_\theta}\big[\nabla_\theta\log\pi_\theta(a_t\mid s_t)\,b(s_t)\big]
= \E_{s_{0:t},a_{0:t-1}}\Big[b(s_t)\cdot\E_{s_{t+1:T},a_{t:T-1}}\big[\nabla_\theta\log\pi_\theta(a_t\mid s_t)\big]\Big]$$
$$= \E_{s_{0:t},a_{0:t-1}}\big[b(s_t)\cdot\E_{a_t}[\nabla_\theta\log\pi_\theta(a_t\mid s_t)]\big] = \E[b(s_t)\cdot 0] = 0$$

because

$$\E_{a_t}\big[\nabla_\theta\log\pi_\theta(a_t\mid s_t)\big] = \int\frac{\nabla_\theta\pi_\theta(a_t\mid s_t)}{\pi_\theta(a_t\mid s_t)}\pi_\theta(a_t\mid s_t)\,da_t = \nabla_\theta\int\pi_\theta(a_t\mid s_t)\,da_t = \nabla_\theta 1 = 0$$

**p. 88 — variance reduction 2b: *which* baseline.** Using $\mathrm{Var}(\sum_i X_i)\approx\sum_i\mathrm{Var}(X_i)$
and $\E[AB]\approx\E[A]\E[B]$ for the (approximately independent) score and return factors:

$$\mathrm{Var}\Big[\sum_t \nabla_\theta\log\pi_\theta(a_t\mid s_t)\big(R_t(\tau)-b(s_t)\big)\Big]
\approx \sum_t \E\big[\|\nabla_\theta\log\pi_\theta(a_t\mid s_t)\|^2\big]\;\E\big[(R_t(\tau)-b(s_t))^2\big]$$

so the variance-minimising baseline solves $\min_{b(s_t)}\E[(R_t(\tau)-b(s_t))^2]$ — a least-squares
problem whose solution is

$$b^*(s_t) = \E_{\tau\sim\pi_\theta}[R_t(\tau)]$$

with the practical note: "have to re-fit the baseline estimate each time to make it as close to the
expected return" — i.e. **$b(s)\approx V^\pi(s)$, and it must be re-fitted as the policy moves.**
==The critic is not a design choice; it is the least-squares solution to a variance-minimisation
problem.== Neither the tex nor any standard treatment in this course says it that sharply.

**p. 89 — variance reduction 3: the advantage.** Substituting $b(s_t)=V^\pi(s_t)$ and
$\sum_{t'\ge t}r_{t'} \to Q^\pi(s_t,a_t)$:

$$\nabla_\theta\E[R] = \E_\tau\Big[\sum_t\nabla_\theta\log\pi_\theta(a_t\mid s_t)\big(Q^\pi(s_t,a_t)-V^\pi(s_t)\big)\Big]
= \E_\tau\Big[\sum_t\nabla_\theta\log\pi_\theta(a_t\mid s_t)A^\pi(s_t,a_t)\Big]
= \E_\tau\Big[\sum_t\nabla_\theta\log\pi_\theta(a_t\mid s_t)\Psi_t\Big]$$

closing with: "The problem of policy gradient reduces to finding good estimates $\Psi_t$, a topic of
Generalized Advantage Estimation (Schulman et al., 2016)." — which is why pp. 41–43 exist.

---

## Part B — what the chapter takes, and where each piece lands

| slide-level content | source | act |
|---|---|---|
| the lineage 2×2, completed | spine §2 + tex frame 1 | handoff |
| "DQN can only handle discrete, low-dimensional action spaces" | **PDF p. 28** | handoff |
| the three-families Venn (value · policy · actor–critic) | **PDF p. 27** | handoff |
| the translation table, Lec 9 → Lec 10 | tex frame 3 | handoff |
| "why not identify $\hat A,\hat B$ and run Riccati?" | *neither source* — the rhyme with Ch 8's model-learning detour | handoff |
| $J(\theta)=\sum_s d^\pi V^\pi$; $\argmax_a Q$ needs a full scan | PDF p. 29 | Act 1 |
| finite differences: works, but one rollout per parameter | **PDF p. 30** | Act 1 |
| $p_\theta(\tau)$, and $\nabla\log p_\theta(\tau)=\sum_t\nabla\log\pi_\theta$ | **PDF p. 81** | Act 1 |
| the log-derivative trick, five lines | **PDF p. 82** | Act 1 |
| the empirical estimator, and the honest variance caveat | **PDF p. 83** | Act 1 |
| policy gradient **is** weighted maximum likelihood | **PDF p. 84** | Act 1 |
| REINFORCE, and the three update granularities | PDF pp. 36–37 | Act 1 |
| causality / reward-to-go, with the cross-term picture | **PDF p. 85** | Act 2 |
| the baseline, and the proof that it is unbiased | **PDF pp. 86–87** | Act 2 |
| the *optimal* baseline as a least-squares problem → the critic | **PDF p. 88** | Act 2 |
| advantage $A=Q-V$, and $\Psi_t$ | PDF p. 89 | Act 2 |
| actor–critic; the critic's TD error as $\hat A$ | PDF p. 38 + tex frame 8 | Act 2 |
| A3C: parallelism replaces the replay buffer; $n$-step returns | PDF pp. 44–46 | Act 2 |
| GAE as TD($\lambda$) for the advantage | **PDF pp. 42–43** | Act 2 + backup |
| the wall, option 1: discretise — what is a good $\Delta a$? | **PDF p. 51** | Act 3 |
| the wall, option 2: action as input — $\max_{a'}Q$ is non-convex | **PDF p. 52** | Act 3 |
| deterministic $\Rightarrow$ the inner expectation vanishes | **PDF p. 54** | Act 3 |
| the DPG theorem | PDF pp. 57–59 | Act 3 |
| one integral instead of two | **PDF p. 58** | Act 3 |
| DDPG = DPG + replay + soft target nets + OU noise | PDF pp. 66–67 | Act 3 |
| why uniform random exploration fails, three reasons | **PDF p. 63** | Act 3 |
| the pendulum swing-up needs a *sustained* push | **PDF p. 64** | Act 3 |
| "target networks matter a lot" — the MuJoCo evidence | **PDF p. 69** | Act 3 |
| autograd's chain rule *is* the DPG theorem | **PDF p. 68** | Act 3 |
| $\mu_\theta(s)$ against LQR's $K$ | tex frame 11 + Lec 9 Act 3 | Act 3 |
| the policy generates its own next batch | tex frame 12 | Act 4 |
| TRPO's ratio objective under a KL ball | PDF pp. 75–76 | Act 4 |
| the KL ball **is** Lecture 1's trust region, in policy space | *neither source* — the course rhyme | Act 4 |
| PPO's clipped surrogate; the shared-parameter objective | PDF pp. 77–78 | Act 4 |
| the natural-gradient step, closed form | tex Backup 2 | backup |
| the DP proof of the policy gradient theorem | **PDF pp. 31–34** | backup |
| the policy-based zoo | tex Backup 3 + PDF p. 35 | backup |

## Notation clashes to fix before writing

1. **$\theta$** is the policy parameter everywhere *except* p. 65, where it is the OU
   mean-reversion rate. Rename the latter.
2. The deck writes $\gamma^t$ inside the REINFORCE sum (p. 37) and drops it everywhere after.
   State it once and then drop it, saying so.
3. p. 51's "too small $\Delta a$ / too high $\Delta a$" is inverted relative to the intended sense;
   write it in terms of the *number of bins*.
4. p. 66's critic loss is missing a closing bracket in the source; the intended form is
   $\frac1N\sum_i\big(Q^\mu(s_i,a_i) - (r_i+\gamma Q^\mu(s_{i+1},\mu(s_{i+1})))\big)^2$.
5. The deck uses $\beta$ for the behaviour policy (pp. 40, 75) and $\mu'$ for DDPG's behaviour
   policy (p. 66). Keep $\beta$ for the general case and note that DDPG's $\beta$ is $\mu_\theta+\epsilon$.
