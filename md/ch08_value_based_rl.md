---
ch: 8
title: Value-Based Reinforcement Learning
subtitle: Learning to act when the model is gone
tagline: From the Bellman equation you can *solve* to the one you can only *sample*
blurb: >-
  Delete the model from Lecture 7 and the Bellman equation can no longer be solved, only sampled.
  The bandit, Monte Carlo and temporal-difference learning, SARSA and Q-learning on the same backup
  tree as Lecture 7, the price of exploring, and DQN: the table replaced by a network, and the three
  problems that replacement creates.
course: IE437 · Data-Driven Decision Making and Control
author: Jinkyoo Park
institute: KAIST
lineage: A
lineage_here: dd-A
cube:
  stages: dynamic
  model: data-driven
  agents: single agent
crossing: model
cube_from:
  model: model-based
inherits: the Bellman optimality equation (Lecture 7)
handoff: the continuous-argmax wall (Lecture 9)
questions:
  - Evaluate?
  - Improve?
  - Explore?
  - Scale?
---

### Value-Based Reinforcement Learning
{layout: title}

### Where we are — the OR lineage, made data-driven
::: tracker
:::

::: lineage dd-A
:::

::: reveal
::: keypoint
Lecture 7 owned the world: $T$ and $R$ were given, and every backup was computed.
From here the world only answers when acted upon: ==every backup must be sampled.==
:::
:::

::: note
The tracker shows the crossing: still dynamic, still one agent, but the model axis moves from model-based to data-driven. The lineage grid puts this lecture in the OR row, data-driven column. The whole lecture is Lecture 7's backup diagram with the expectation replaced by one observed transition.
:::

### Four problems, one grid
{sub: four cells the course has now visited}

::: widget rl-roadmap {"grid":"problems","cells":["bandit","rl"]}
Down a row the action changes the next state; across a column the model is gone and only experience remains. ==This lecture takes the step across, first for one state, then for many.==
:::

::: note
Source p. 9. The same frame returns as the map of model-free methods from the next act on. The students know three of the four cells: Lecture 1 and 4 optimise with a model, Lecture 7 plans with a model. The bandit is the warm-up: no states to move between, so exploration can be seen on its own before the Bellman equation returns.
:::

### Learning route — change the target, then change the representation
::: flow
- **Act 1 · evaluate** | bandit, experience, Monte Carlo and TD targets
- **Act 2 · improve** | greedy on $Q$, and the price of exploring
- **Act 3 · whose value** | SARSA and Q-learning on the backup tree
- **Act 4 · scale** | a network for the table, and the three problems it brings
:::

::: small
**Bring from Lecture 7:** the Bellman expectation and optimality equations, policy evaluation, policy improvement, and the backup tree.
:::

::: reveal
::: keypoint
Read every backup picture as Lecture 7's tree with one thing sampled. Algorithm boxes come before every demo: ==predict the demo from the box.==
:::
:::

::: note
First pass: follow the idea from a sampled return to a sampled one-step target, then to Q, then to the two control rules. The derivations, the worked numbers and the convergence conditions sit beside their ideas, in the body: they are taught, not archived.
:::

## Act 1 — evaluation without a model
{short: ACT 1, num: Act 1}

**Q1.** Fix a policy. With no $T$ and no $R$, how good is it?

### Act 1 on the map
::: widget rl-roadmap {}
The map of model-free methods. Columns: estimate from whole episodes, or from single transitions. Rows: evaluate the policy that collects the data, or another one. ==Act 1 fills in the two columns for a fixed policy.==
:::

::: small
**Four words the map uses.** *Prediction* scores a fixed policy; *control* finds a better one. To *bootstrap* is to build the target from your own current estimate of the next state, without waiting for the outcome. *On-policy* methods learn the value of the policy that collects the data; *off-policy* methods learn the value of a different one.
:::

::: note
Source pp. 12, 17, 49, 59: the same table appears four times with the current cell filled. Here it is the map; Acts 2 to 4 return to it with their cell lit. No cell is lit yet because Act 1 is prediction, before any control.
:::

### The smallest problem — one state, $n$ arms
{q: 1}

::: qstrip
:::

::: widget bandit-arms {"mode":"arms","eps":0.1,"seed":3}
Five levers, each paying a random reward around a hidden mean. Pull, and the bar is the ==average of what that arm paid so far==; the dot is the hidden mean. The count under each arm is how often it was tried. Before each pull, say which arm you would choose next.
:::

::: small
**The value of an arm** is its mean reward, $Q^*(a)=\E[r\mid a]$; the estimate under the picture is the sample mean of the pulls so far, and the greedy choice is its argmax.
:::

::: note
Source pp. 4–7: the n-armed bandit. No states to move between: choose an arm, receive a reward, repeat. The true value is the mean reward of the arm; the estimate is the sample mean of what it paid. Greedy choice: pull the arm with the largest estimate. The trap: an arm never pulled keeps its first poor estimate for ever. The exploiting-versus-exploring example from the source, a job versus graduate school, is Lecture 7's opening picture again.
:::

### The exploration trade-off, counted
::: widget bandit-arms {"mode":"curves"}
Ten arms, two hundred fresh bandits, a thousand pulls. The greedy player locks onto the first good arm. ==A little exploring pays a little every step and finds the best arm.==
:::

**$\varepsilon$-greedy** — the exploration rule of every algorithm in this lecture, with $Q_t(a)$ the estimate after $t$ pulls:

$$\pi(a) = \frac{\varepsilon}{|\mathcal A|} + (1-\varepsilon)\,\mathbb 1\big[a = \argmax_{a'} Q_t(a')\big] \qquad\text{every arm with probability at least } \varepsilon/|\mathcal A|$$

::: note
Source p. 8, Sutton and Barto's 10-armed testbed. With epsilon = 0.1 the average reward settles higher than with 0.01 at first, and 0.01 overtakes it eventually because it wastes fewer pulls once it has found the best arm. With epsilon = 0 the curve is flat and low. In the limit every arm is pulled infinitely often, so the estimates converge, and the probability of choosing the optimal action converges to more than 1 minus epsilon. The MDP version of this trade-off is Act 2.
:::

### From an average to an update
{math: compact, sub: the bandit's sample mean, rewritten so that nothing has to be stored}

**The incremental mean** — why every update today has the shape old estimate + step size × error:

$$\begin{aligned}
Q_n &= \frac{1}{n}\sum_{i=1}^{n} r_i &&\textcolor{#D64545}{\scriptstyle \text{the average of the } n \text{ rewards one arm has paid}} \\
&\step{1}{= \frac{1}{n}\Big(r_n + (n-1)\,Q_{n-1}\Big)} &&\step{1}{\textcolor{#D64545}{\scriptstyle \text{the first } n-1 \text{ rewards are the old average}}} \\
&\step{2}{= Q_{n-1} + \frac{1}{n}\big(r_n - Q_{n-1}\big)} &&\step{2}{\textcolor{#D64545}{\scriptstyle \text{old estimate, plus a fraction of the error}}} \\
&\step{3}{\approx Q_{n-1} + \alpha\big(r_n - Q_{n-1}\big)} &&\step{3}{\textcolor{#D64545}{\scriptstyle \text{a constant step size forgets the past: a moving target can be tracked}}}
\end{aligned}$$

::: reveal
::: keypoint
$\alpha$ is the ==step size==, or learning rate: how far one observation moves the estimate.
Every update rule in this lecture is this line with a different **target** in place of $r_n$: a return, a one-step target, a max.
:::
:::

::: note
Source p. 29, moved here so that alpha is met on the simplest problem before any algorithm uses it. With 1/n the estimate is the exact sample mean; with a constant alpha the recent rewards weigh more, which is what a policy that keeps changing needs. The stochastic gradient reading: this is one step of gradient descent on the squared error between the estimate and the observation. Typical values: alpha between 0.01 and 0.5 in the demos of this lecture.
:::

### The arena — from MDP to experience
::: widget mdp-pictures {"mode":"loop"}
Lecture 7's loop, unchanged. What changed is what we can see: the agent acts, the environment answers with a reward and a state, and ==that stream is the only window onto $T$ and $R$.==
:::

**The template of reinforcement learning** — one line per step:

$$\text{for } t=1,2,\dots:\quad a_t \leftarrow \pi(s_t)\ \ (\text{decision}),\qquad r_{t+1},\,s_{t+1}\ \ (\text{environment}),\qquad V,\,Q \leftarrow \text{update}\ \ (\text{learning})$$

::: note
Source pp. 10–11. The MDP of Lecture 7 is offline: have a model, find the policy. Reinforcement learning is online: act in the world, collect s_1, a_1, r_2, s_2, ..., and improve the policy from that. Decision making is the policy; learning is the update rule; the environment is the part we do not own.
:::

### Model-based RL first — count the model
{sub: four episodes, and the model they imply}

::: widget mdp-pictures {"mode":"count"}
Four episodes under one policy. ==Count how often each transition happened== and the model is a table of fractions; average the rewards and $\hat R$ is a table of means.
:::

**Model-based reinforcement learning** — estimate, then solve with Lecture 7; $T(s,a,s')$ is the transition probability $P(s'\mid s,a)$:

$$\hat T(s,a,s') = \frac{\#(s,a,s')}{\#(s,a)},\qquad \hat R(s,a,s') = \text{mean of } r \text{ over } (s,a,s'),\qquad \text{then value iteration on } (\hat T,\hat R)$$

::: note
Source pp. 14–15, one press per episode. Episodes: B east C −1, C east D −1, D exit +10 (twice); E north C −1, C east D −1, D exit +10; E north C −1, C east A −1, A exit −10. So T(B, east, C) = 2/2, T(C, east, D) = 3/4, T(C, east, A) = 1/4, R(D, exit) = +10, R(A, exit) = −10. The most literal idea: count how often each transition happened, average the rewards, plug the estimates into Lecture 7's value iteration. Perfectly valid, and the sample efficiency is good because a learned model can be replayed indefinitely. The costs: errors in the model compound through planning, and a full kernel has far more numbers than the thing we act on. Lecture 11 returns to this branch once the learned model can carry its weight.
:::

### Why not estimate $Q^*$ directly?
{sub: the question that starts model-free RL}

**What value iteration needs, and what we act on:**

$$Q^*(s,a) = \sum_{s'} \textcolor{#D64545}{\hat T(s,a,s')}\Big[\textcolor{#D64545}{\hat R(s,a,s')} + \gamma V^*(s')\Big], \qquad \pi^*(s) = \argmax_a Q^*(s,a)$$

::: reveal
::: keypoint
To choose an action we only ever read $Q^*$.
The model is a detour: a whole transition kernel estimated, then summed away.
==Skip the model and estimate the value.== That is the model-free programme, and the rest of today.
:::
:::

::: reveal
::: small
**The route there.** Act 1 scores a fixed policy, $V^\pi$, because the sampling idea is cleanest there. Act 2 runs the same update on pairs $(s,a)$ to get $Q^\pi$. Act 3 reaches $Q^*$.
:::
:::

::: note
Source p. 16. The red terms are the estimated model, used once in the backup and never again. Estimating them is far more than estimating Q^*: |S|^2 |A| numbers against |S| |A|. The source's sentence: why estimate T and R separately instead of Q^*(s,a) directly? The rest of the lecture answers it, and the model returns deliberately in Lecture 11.
:::

### The quantity, written two ways
{fill: top, math: compact}

**The value of a state, from the definition to one step** — each line a different way to read the same number:

$$\begin{aligned}
V^\pi(s) &= \E_\pi\big[G_t \mid s_t = s\big] &&\textcolor{#D64545}{\scriptstyle \text{definition: the expected return } G_t \text{, written } U_t \text{ in Lecture 7}} \\
&\step{1}{= \E_\pi\big[r_{t+1} + \gamma r_{t+2} + \gamma^2 r_{t+3} + \cdots \mid s_t = s\big]} &&\step{1}{\textcolor{#D64545}{\scriptstyle \text{a complete episode: what Monte Carlo samples}}} \\
&\step{2}{= \E_\pi\Big[\textstyle\sum_{k\ge0}\gamma^k r_{t+k+1} \,\Big|\, s_t = s\Big]} \\
&\step{3}{= \E_\pi\Big[r_{t+1} + \gamma\textstyle\sum_{k\ge0}\gamma^k r_{t+k+2} \,\Big|\, s_t = s\Big]} &&\step{3}{\textcolor{#D64545}{\scriptstyle \text{peel one step off}}} \\
&\step{4}{= \E_\pi\big[r_{t+1} + \gamma\,V^\pi(s_{t+1}) \mid s_t = s\big]} &&\step{4}{\textcolor{#D64545}{\scriptstyle \text{bootstrapping: what TD samples}}}
\end{aligned}$$

::: reveal
::: keypoint
Line 2 and line 5 are the same number.
Sample line 2 and you must wait for the episode to end: Monte Carlo.
Sample line 5 and one step is enough, if you trust your own estimate of the rest: temporal difference.
:::
:::

::: note
Source pp. 43–45. This is Lecture 7's Bellman derivation again, with the model gone: the last line still holds, but the expectation can no longer be computed, only sampled. The two sampling choices are the two halves of Act 1. Everything harder is built on getting this prediction problem right.
:::

### Monte Carlo prediction — average what actually happened
::: widget backup-tree {"mode":"return"}
Lecture 7's tree with one path lit: the episode that actually happened, reward by reward, to the end. ==The return along that path is the sample== of line 2.
:::

**Monte Carlo update** — policy evaluation by returns: the incremental mean with the return $G_t$ as its target; the episode ends at step $T$:

$$V(s_t) \;\leftarrow\; V(s_t) + \alpha\big[\,\textcolor{#D64545}{G_t} - V(s_t)\,\big], \qquad G_t = r_{t+1}+\gamma r_{t+2}+\cdots+\gamma^{T-t-1}r_T$$

::: note
Source pp. 19–25. Unbiased: the expectation of G_t is V^pi(s_t) exactly. No model, no bootstrap: each state's estimate stands alone and never leans on a neighbour; the source's tree on p. 25 draws the estimates as independent branches. The price: wait for the terminal state, and a long episode's return is one high-variance draw. Conventions: first-visit MC averages the return after the first visit to s in each episode; every-visit averages after every visit. Example: the episode A, B, A, terminal with rewards 1, 2, 3 and gamma 1 gives returns 6 and 3 after the two visits to A; first-visit uses 6, every-visit uses both. Neither single-episode number is the true value; the average over episodes is.
:::

### Algorithm — Monte Carlo prediction
**First-visit Monte Carlo** — the evaluation half of Act 2's control loop:

::: block Algorithm — Monte Carlo prediction | input $\pi$, step size $\alpha$; output $V\approx V^\pi$
Initialise $V(s)\leftarrow 0$ for every $s\in\mathcal S$.

1. Generate an episode $s_0,a_0,r_1,s_1,\dots,s_T$ by following $\pi$.
2. For $t=T-1,\dots,0$: &nbsp; $G\leftarrow r_{t+1}+\gamma G$; &nbsp; if $s_t$ is first visited at $t$: &nbsp; $V(s_t)\leftarrow V(s_t)+\alpha\,[G-V(s_t)]$.
3. Repeat from 1 for the next episode.
:::

::: small
**First-visit** uses only the return after the first time a state appears in an episode; **every-visit** uses the return after each appearance. Both converge to $V^\pi$; the boxes in this lecture use first-visit.
:::

::: note
Source pp. 19–21 and 34. Step 2 walks the episode backwards so each return is one addition. The same loop with (s_t, a_t) in place of s_t estimates Q^pi, which Act 2 needs.
:::

### Temporal difference — learn a guess from a guess
{sub: one real step, then your own estimate of the rest}

::: widget backup-tree {"mode":"sample"}
The same tree, cut after one step. Both successors were possible; ==only one of them happened==, with its reward. The cone at the state we landed in is our own current estimate of the rest.
:::

**TD(0) update** — policy evaluation by one step. Putting the estimate $V(s_{t+1})$ inside the target is what ==bootstrapping== means:

$$V(s_t) \;\leftarrow\; V(s_t) + \alpha\big[\,\underbrace{r_{t+1} + \gamma V(s_{t+1})}_{\textcolor{#D64545}{\text{the TD target}}} - V(s_t)\,\big]$$

::: note
Source pp. 44–46. Do not wait: after a single transition (s_t, r_{t+1}, s_{t+1}) update towards the one-step target. The target contains V(s_{t+1}), our own current estimate, which is bootstrapping. Online and incremental, so long or non-terminating tasks are fine. The target has lower variance than a whole return, one reward and one estimate instead of a trajectory of noise, and it is biased by whatever error V(s_{t+1}) carries now.
:::

### One transition, two targets
::: widget backup-tree {"mode":"sample","nums":{"v":2,"v1":3,"r":1,"alpha":0.2,"gamma":0.9,"mc":{"r2":4}}}
The same transition with numbers on it. The TD target is available ==the moment the step is taken==; the Monte Carlo target only once the episode has ended, one step and a reward of 4 later.
:::

::: note
V(s) = 2, V(s') = 3, alpha = 0.2, gamma = 0.9, reward 1 on the first step. TD target 1 + 0.9 × 3 = 3.7; TD error 1.7; new V(s) = 2 + 0.2 × 1.7 = 2.34. If the next transition pays 4 and ends the episode, the Monte Carlo target is 1 + 0.9 × 4 = 4.6 and the new V(s) would be 2 + 0.2 × 2.6 = 2.52. Both are old estimate + step size × prediction error; TD uses an estimate of the future, MC waits for the realised one. If the first transition had ended the episode both targets would be 1, because the terminal continuation is zero.
:::

### Algorithm — tabular TD(0)
**TD(0) prediction** — the loop the next demo runs:

::: block Algorithm — tabular TD(0) | input $\pi$, step size $\alpha$; output $V\approx V^\pi$
Initialise $V(s)\leftarrow 0$ for every $s\in\mathcal S$.

1. Initialise $s$ at the start of an episode.
2. Repeat for each step: &nbsp; $a\leftarrow\pi(s)$; &nbsp; take $a$, observe $r$, $s'$; &nbsp; $V(s)\leftarrow V(s)+\alpha\,[r+\gamma V(s')-V(s)]$; &nbsp; $s\leftarrow s'$;
3. until $s$ is terminal; then repeat from 1.
:::

::: reveal
::: keypoint
Predict the next demo from the two boxes: on identical episodes, ==whose error falls first, Monte Carlo's or TD's?==
:::
:::

::: note
Source p. 46. Compare with Lecture 7's iterative policy evaluation: the sum over successors weighted by T has become the one successor that occurred. One sample backup per step instead of one full backup per state.
:::

### Both estimators, the same episodes
::: widget mc-vs-td {"alpha":0.1,"seed":7,"auto":100}
Five states in a row, a random walk from C, reward 1 only on leaving to the right, so the true value of the $i$-th state from the left is $i/6$. Monte Carlo and TD see the ==identical== episodes and differ only in the target. Watch TD's one-step target settle while the realised returns keep jittering; raise $\alpha$ and watch Monte Carlo degrade first.
:::

::: note
Source p. 57, Sutton and Barto's random walk. The left panel is the estimate after the episodes so far against the true values; the right panel is the root-mean-square error over the five states. The slide arrives after 100 episodes, where TD's estimates have settled on the line and Monte Carlo's still jitter; press +100 once more in the lecture and Monte Carlo closes in too. With alpha = 0.1 TD is below MC after about twenty episodes; with alpha = 0.2 MC wanders more. Neither method dominates for every reward process, initialisation and step size, but TD usually converges faster on stochastic tasks.
:::

### Bias and variance — the ledger
::: cols
::: col Monte Carlo target $G_t$
**Bias:** none. $\E[G_t]=V^\pi(s_t)$ exactly.

**Variance:** high. A function of every random reward and transition along the whole episode.
:::
::: col.accent TD(0) target $r_{t+1}+\gamma V(s_{t+1})$
**Bias:** present. It uses the current estimate $V(s_{t+1})$; unbiased only once that estimate is right.

**Variance:** usually lower. One reward and one estimate; the downstream noise is discarded.
:::
:::

::: reveal
::: keypoint
Sample the whole thing, or sample one step and bootstrap: ==the most consequential choice in value-based RL.==
In Act 4 the bootstrap turns out to be one of three ingredients that can make learning diverge.
:::
:::

::: note
The bridge between them: bootstrap after n steps, G_t^(n) = r_{t+1} + ... + gamma^{n-1} r_{t+n} + gamma^n V(s_{t+n}); n = 1 is TD(0), n = infinity is Monte Carlo, and TD(lambda) averages all n geometrically. The whole family is one dial between low bias with high variance and higher bias with low variance.
:::

### DP, Monte Carlo, TD — what each one borrows
::: cols c3
::: col Dynamic programming (Lecture 7)
Updates from other estimates without waiting for the end: it **bootstraps**.

Needs the explicit model.
:::
::: col Monte Carlo
Learns from raw experience, **no model**.

Must wait until the episode ends to see a return.
:::
::: col.accent Temporal difference
Learns from raw experience, no model: from Monte Carlo.

Updates from its own estimates, online: from dynamic programming.
:::
:::

::: reveal
::: keypoint
TD $=$ the model-freeness of Monte Carlo $+$ ==the bootstrapping of dynamic programming.==
That single inheritance is why TD, not Monte Carlo, becomes the engine of control.
:::
:::

::: note
Source p. 42, the diagram with the two red arrows into TD. The yellow box at its foot is the rest of the lecture: TD generalised policy iteration, on-policy as SARSA and off-policy as Q-learning.
:::

### Check — Monte Carlo against TD
{q: 1}

::: quiz Monte Carlo waits for the episode to end and averages the actual return; TD updates after one step using its own estimate of what follows. What is the trade?
- =MC uses an unbiased full-return target; TD can introduce bootstrap bias, often reduces variance, and can update immediately
- MC has lower variance and higher bias; TD the reverse
- Both are unbiased; TD is simply faster to compute
- TD is unbiased only in deterministic environments, where it equals MC
MC's target is a real sampled return, correct in expectation but carrying the noise of every step that followed. TD's target $r + \gamma V(s')$ leans on a current estimate, importing whatever error that estimate has while discarding all the downstream noise. Bootstrapping is the trade at the heart of the lecture, and in Act 4 it turns out to be one of the three ingredients that can make learning diverge.
:::

## Act 2 — improvement without a model
{short: ACT 2, num: Act 2}

**Q2.** We can score a policy. How do we make it better, still without $T$?

### Act 2 on the map
::: widget rl-roadmap {"cell":"mc-on","dim":true}
The first cell: evaluate by whole episodes, and ==evaluate the very policy that collects them.== Act 2 builds control out of Monte Carlo prediction and one greedy step.
:::

### Why $V$ is not enough — the hidden $T$
{q: 2, math: compact, fill: tight}

::: qstrip
:::

::: widget backup-tree {"mode":"eval","q":true}
Lecture 7's picture: $Q$ lives on the chance node, ==one lookahead past $V$==. Below, the improvement step and its model-free replacement.
:::

$$\pi'(s) = \argmax_a \sum_{s'} \textcolor{#D64545}{T(s,a,s')}\big[R(s,a,s') + \gamma V(s')\big] \qquad\Longrightarrow\qquad \pi'(s) = \argmax_a\, \hl{Q(s,a)}$$

::: reveal
::: keypoint
The lookahead needs $T$. Stored in $Q$, it is already inside the number: ==no sum, no model.==
:::
:::

::: note
Source p. 26. The source's own sentence from Lecture 7: the Q function caches the results of all one-step-ahead search. The cache was worthless while the model was free; it is the whole game now. This is the reason value-based RL learns Q, not V. Estimating Q^pi by Monte Carlo is the same loop as before with (s, a) in place of s, pp. 27–28.
:::

### Generalised policy iteration, now from samples
{fill: tight, math: compact}
::: widget mdp-pictures {"mode":"gpi","labels":"q"}
Lecture 7's dance, unchanged: make $Q$ agree with $\pi$, make $\pi$ greedy on $Q$, meet where both hold. ==Each half is now sampled.==
:::

**The two halves, model-free:**

$$\text{evaluate:}\ \ Q \to Q^\pi \ \text{ by Monte Carlo returns here, by TD in Act 3}, \qquad \text{improve:}\ \ \pi \to \varepsilon\text{-greedy}(Q)$$

::: reveal
::: keypoint
To estimate $Q^\pi$ from data, ==every $(s,a)$ must actually be tried==, and trying a disliked action costs reward now: the ==exploration tax.==
:::
:::

::: note
A greedy policy never tries the actions it dislikes, so it never learns they were good: improvement now costs exploration, which is the next slide. Source pp. 31–33. Two assumptions make Monte Carlo control exact: infinitely many episodes, and exploring starts, every (s, a) begun from with positive probability. The first is relaxed as in Lecture 7, stopping evaluation early; the second is relaxed by a soft policy, the next slide.
:::

### The tax, paid — $\varepsilon$-soft policies
{math: compact, fill: tight}

::: widget bandit-arms {"mode":"soft","eps":0.2}
Every action keeps a floor of $\varepsilon/|\mathcal A|$; the $\varepsilon$-greedy policy stacks the remaining $1-\varepsilon$ on the greedy action. ==The bandit's rule, now a policy at every state.==
:::

**$\varepsilon$-soft** means every action has probability at least $\varepsilon/|\mathcal A(s)|$. **$\varepsilon$-greedy** is the $\varepsilon$-soft policy that puts all the rest on the greedy action:

$$\pi(a\mid s) = \frac{\varepsilon}{|\mathcal A(s)|} + (1-\varepsilon)\,\mathbb 1\big[a = \argmax_{a'} Q(s,a')\big]$$

::: reveal
::: keypoint
Every pair $(s,a)$ keeps being tried, with no need to start episodes at pairs chosen at random (exploring starts): ==coverage from the policy itself.==
Decay $\varepsilon$ and the greedy limit is optimal.
:::
:::

::: note
Source p. 37: the two bar charts, epsilon/|A| on every action with the greedy action's bar raised by 1 minus epsilon. For four actions and epsilon = 0.2 the greedy action has probability 0.85 and each other action 0.05. The bandit's dilemma, spend on what you know or pay to learn more, now lives inside every state; the dynamics are back but the trade is the same.
:::

### Policy improvement still holds for soft policies
{fill: top, math: compact}

**$\varepsilon$-greedy improvement theorem** — Lecture 7's theorem extended to policies that keep exploring. Let $\pi$ be any $\varepsilon$-soft policy and $\pi'$ the $\varepsilon$-greedy policy on $Q^\pi$. $Q^\pi(s,\pi'(s))$ is shorthand for the value of drawing one action from $\pi'$ and following $\pi$ afterwards:

$$\begin{aligned}
Q^\pi\big(s,\pi'(s)\big) &= \sum_a \pi'(a\mid s)\,Q^\pi(s,a) &&\textcolor{#D64545}{\scriptstyle \text{one step of } \pi' \text{, then } \pi} \\
&\step{1}{= \frac{\varepsilon}{|\mathcal A|}\sum_a Q^\pi(s,a) + (1-\varepsilon)\max_a Q^\pi(s,a)} &&\step{1}{\textcolor{#D64545}{\scriptstyle \text{the soft part, and the greedy part}}} \\
&\step{2}{\ge \frac{\varepsilon}{|\mathcal A|}\sum_a Q^\pi(s,a) + (1-\varepsilon)\sum_a \frac{\pi(a\mid s)-\varepsilon/|\mathcal A|}{1-\varepsilon}\,Q^\pi(s,a)} &&\step{2}{\textcolor{#D64545}{\scriptstyle \text{a max beats any average: weights} \,\ge 0\, \text{ as } \pi \text{ is } \varepsilon\text{-soft, summing to } 1}} \\
&\step{3}{= \sum_a \pi(a\mid s)\,Q^\pi(s,a) \;=\; V^\pi(s)} &&\step{3}{\textcolor{#D64545}{\scriptstyle \text{the two } \varepsilon \text{ terms cancel.}\quad\text{Then } V^{\pi'}\ge V^\pi \text{ by Lecture 7's theorem.}\quad\blacksquare}}
\end{aligned}$$

::: reveal
::: keypoint
The one-step criterion of Lecture 7 is met at every state, so the whole policy improves.
==Exploring does not break improvement; it only caps it== at the best $\varepsilon$-soft policy.
:::
:::

::: note
Source p. 38. Line 2 splits pi' into its uniform epsilon part and its greedy 1 minus epsilon part. Line 3 is the only inequality: the weights (pi(a|s) minus epsilon/|A|) divided by (1 minus epsilon) are non-negative because pi is epsilon-soft, and they sum to one, so their weighted average of Q is at most the max. Line 4 collects terms back into sum_a pi(a|s) Q^pi(s,a), which is V^pi(s). The policy improvement theorem of Lecture 7 then gives V^{pi'} at least V^pi everywhere. Equality means pi is already the best epsilon-soft policy.
:::

### Algorithm — on-policy Monte Carlo control
**Monte Carlo control with a soft policy** — evaluation and improvement proceed together within one episode:

::: block Algorithm — $\varepsilon$-soft on-policy Monte Carlo control | input $\varepsilon$, step size $\alpha$; output $Q\approx Q^*$ and $\pi$
Initialise $Q(s,a)\leftarrow 0$ and $\pi\leftarrow$ an arbitrary $\varepsilon$-soft policy.

1. Generate an episode using $\pi$.
2. For each $(s_t,a_t)$ first visited in the episode: &nbsp; $G\leftarrow$ the return that followed; &nbsp; $Q(s_t,a_t)\leftarrow Q(s_t,a_t)+\alpha\,[G-Q(s_t,a_t)]$.
3. For each $s$ in the episode: &nbsp; $a^*\leftarrow\argmax_a Q(s,a)$; &nbsp; set $\pi(a\mid s)$ to $1-\varepsilon+\varepsilon/|\mathcal A|$ for $a^*$ and $\varepsilon/|\mathcal A|$ otherwise.
4. Repeat from 1.
:::

::: note
Source pp. 34 and 39. Step 2 is policy evaluation by returns, step 3 is policy improvement with the soft greedy policy. Exploring starts, assuming every (s, a) can be a start, is the source's first version; the soft policy removes that assumption. The demo on the next two slides runs this box as written: first-visit returns, a constant step size, the soft greedy policy re-read from Q after every episode.
:::

### The problem the demo poses
::: widget gpi-explore {"mode":"problem"}
A corridor with a start, a near reward of $+1$ and a far reward of $+5$; every step costs a little and an episode ends on a reward. ==Will an agent that never explores ever see the $+5$?==
:::

::: note
State the arena before running anything: three rows, start in the middle, +1 two cells to the left, +5 at the far right, step cost 0.05, episode ends on either reward. Ask for a prediction: which reward does a greedy agent settle for, and what fraction of (s, a) pairs does it ever try.
:::

### The tax, seen — what a greedy agent never learns
::: widget gpi-explore {"eps":0.3,"seed":4,"rule":"mc"}
Two agents run the Monte Carlo control box, identical but for $\varepsilon$. The greedy one locks onto the near $+1$ it stumbled into first and stops looking: read its coverage, ==the actions it dislikes are never tried, so their values are never corrected.== The exploring one pays a little per episode and finds the far $+5$.
:::

::: note
The coverage figure under each grid is the count: the fraction of (s, a) pairs tried at least once. The widget runs 250 episodes of the Monte Carlo control box on arrival: the greedy agent has tried a quarter of the pairs and its arrows all point to the +1; the exploring agent has tried most of them and reaches the +5. Press +1 ep to replay. Cycle epsilon to see the trade: with epsilon 0.2 the +5 is still found, with less coverage; with epsilon 0.1 both agents settle for the +1 within 250 episodes, so too little exploring is slow, not safe.
:::

### Check — the price of exploring
{q: 2}

::: quiz On-policy Monte Carlo control keeps $\varepsilon$ fixed at $0.1$ and runs for ever. What does it converge to?
- The optimal policy, because $Q$ converges to $Q^*$
- =The best $\varepsilon$-soft policy: improvement is guaranteed, but the policy evaluated keeps taking a random action one time in ten
- Nothing: a fixed $\varepsilon$ prevents $Q$ from settling
- The optimal policy, but only if every episode starts from a random state–action pair
The $\varepsilon$-greedy improvement theorem guarantees each round improves the policy, so the loop converges, but only within the class it searches: policies that explore with probability $\varepsilon$. With two actions and one unique best action, $\varepsilon=0.1$ chooses the best with probability $0.9+0.1/2=0.95$, not 0.9. To reach the optimal policy itself, decay $\varepsilon$, or evaluate a different policy from the one that collects the data, which is Act 3.
:::

## Act 3 — whose value are we learning?
{short: ACT 3, num: Act 3}

**Q3.** The data come from an exploring policy. Which policy's value does the update actually estimate?

### Act 3 on the map
::: widget rl-roadmap {"cells":["sarsa","q"],"dim":true}
The bootstrap column. Two cells, two control rules, ==one difference between them==: whose action stands in the target.
:::

### SARSA — TD control on the backup tree
{q: 3, math: compact, fill: tight}

::: qstrip
:::

::: widget backup-tree {"mode":"sarsa"}
$\varepsilon$-greedy picks $a$, the world answers $r, s'$, ==the same policy picks $a'$==: back up the pair actually followed.
:::

**SARSA update** — on-policy TD control; the name is the tuple $(s,a,r,s',a')$:

$$Q(s,a)\leftarrow Q(s,a)+\alpha\big[r+\gamma\, \textcolor{#D64545}{Q(s',a')} - Q(s,a)\big]$$

::: note
Source pp. 51–55 draw exactly this: s^0, three actions, a^2 chosen with probability 1 minus epsilon, r_{t+1} and s^1 observed, then at s^1 the behaviour policy chooses a^1 and Q(s^1, a^1) stands in the target. State, Action, Reward, State, Action: the name is the tuple. Because the next action is the behaviour policy's, SARSA estimates Q^pi for the behaviour policy and improves it towards greediness at the same time, as all on-policy methods do.
:::

### Algorithm — SARSA
::: block Algorithm — SARSA, on-policy TD control | input $\varepsilon$, step size $\alpha$; output $Q$ and the $\varepsilon$-greedy $\pi$
Initialise $Q(s,a)\leftarrow 0$.

1. Initialise $s$; choose $a$ from $s$ by the $\varepsilon$-greedy policy on $Q$.
2. Repeat for each step: &nbsp; take $a$, observe $r$, $s'$; &nbsp; choose $a'$ from $s'$ by the $\varepsilon$-greedy policy on $Q$; &nbsp; ${Q(s,a)\leftarrow Q(s,a)+\alpha\,[r+\gamma\,\hl{Q(s',a')}-Q(s,a)]}$; &nbsp; $s\leftarrow s'$, $a\leftarrow a'$;
3. until $s$ is terminal; then repeat from 1.
:::

::: small
SARSA learns the value of the exploring policy it runs. It reaches the optimal policy only if every $(s,a)$ keeps being visited and $\varepsilon$ decays to zero, for example $\varepsilon_t = 1/t$.
:::

::: note
Source p. 50. The behaviour policy and the estimation policy are the same epsilon-greedy policy. Converges to the optimal policy if every (s, a) is visited infinitely often and epsilon decays, for example epsilon = 1/t.
:::

### Q-learning — the max moves into the target
{sub: learn the value of the best policy while following another}

::: widget backup-tree {"mode":"qlearn"}
The same tree, the same first two moves. At $s'$ we do not use the action we will take: ==we back up the best one==, taken or not. The red arc is Lecture 7's max, now taken at the one $s'$ that occurred.
:::

**Q-learning update** — off-policy TD control, the form Lecture 7 handed over with the expectation sampled:

$$Q(s,a)\leftarrow Q(s,a)+\alpha\big[r+\gamma\, \textcolor{#D64545}{\max_{a'} Q(s',a')} - Q(s,a)\big]$$

::: note
Source pp. 60–66. Lecture 7's Bellman optimality equation for Q^*: the sum over s' weighted by T is replaced by the one s' that occurred, and the max over a' stays. The learned Q approximates Q^* directly, whatever policy is being followed, as long as every pair keeps being visited. The one difference from SARSA is the red term.
:::

### Algorithm — Q-learning
::: block Algorithm — Q-learning, off-policy TD control | input $\varepsilon$, step size $\alpha$; output $Q\approx Q^*$
Initialise $Q(s,a)\leftarrow 0$.

1. Initialise $s$.
2. Repeat for each step: &nbsp; choose $a$ from $s$ by the $\varepsilon$-greedy policy on $Q$; &nbsp; take $a$, observe $r$, $s'$; &nbsp; ${Q(s,a)\leftarrow Q(s,a)+\alpha\,[r+\gamma\,\hl{\max_{a'}Q(s',a')}-Q(s,a)]}$; &nbsp; $s\leftarrow s'$;
3. until $s$ is terminal; then repeat from 1.
:::

::: reveal
::: keypoint
Set the two boxes side by side: one line differs.
SARSA chooses $a'$ and uses it. Q-learning ==never chooses $a'$ for the target==; it takes the max and then chooses whatever it likes for the next step.
:::
:::

::: note
Source p. 61. The behaviour policy is epsilon-greedy; the estimation policy is greedy. The argmax action is not necessarily the one taken in the next state.
:::

### The ladder so far — one backup, the model deleted rung by rung
::: widget mdp-pictures {"mode":"ladder","start":0,"upto":4,"plates":[{"title":"Value iteration (Lecture 7)","line":"for each state s:","formula":"V(s) ← \\max_a \\sum_{s′} T(s,a,s′)[R + γ V(s′)]","note":"the full backup: every successor, weighted by the model","loop":"one sweep per round"},{"title":"Monte Carlo","line":"for each visited state s, after the episode:","formula":"V(s) ← V(s) + α[\\red{G_t} − V(s)]","note":"the expectation replaced by one whole return","loop":"one episode per round"},{"title":"TD(0)","line":"for each transition (s, r, s′):","formula":"V(s) ← V(s) + α[\\red{r + γ V(s′)} − V(s)]","note":"one step sampled, the rest bootstrapped","loop":"one transition per round"},{"title":"SARSA","line":"for each transition (s, a, r, s′, a′):","formula":"Q(s,a) ← Q(s,a) + α[r + γ \\red{Q(s′,a′)} − Q(s,a)]","note":"V becomes Q; the next action is the one actually taken","loop":"one transition per round"},{"title":"Q-learning","line":"for each transition (s, a, r, s′):","formula":"Q(s,a) ← Q(s,a) + α[r + γ \\red{\\max_{a′} Q(s′,a′)} − Q(s,a)]","note":"the next action is the best one, taken or not","loop":"one transition per round"},{"title":"DQN","line":"for a minibatch from the replay buffer:","formula":"θ ← θ + α[r + γ \\max_{a′} Q(s′,a′;\\red{θ^-}) − Q(s,a;\\red{θ})]∇_θ Q(s,a;θ)","note":"the table becomes a network; the target is frozen","loop":"one minibatch per round"}]}
Lecture 7's ladder, continued downwards. ==Each rung changes one thing in the target==, marked in red: a return replaces the expectation, one step plus a bootstrap replaces the return, $V$ becomes $Q$ with the action taken next, and the max returns in that action's place.
:::

::: note
Read it with the Ch 7 summary in mind: Lecture 7 deleted loops, this lecture deletes the model. Value iteration's full backup becomes a return (Monte Carlo), the return becomes one step plus a bootstrap (TD), V becomes Q so that the greedy step needs no model (SARSA), and the sampled next action becomes the max (Q-learning). The sixth rung, the network, is Act 4.
:::

### Same data, different target
::: widget backup-tree {"mode":"qlearn","both":true,"nums":{"q":2,"r":1,"qnext":[5,1],"pick":1,"alpha":0.2,"gamma":0.9}}
One observed transition with numbers on it. At $s'$ the two actions are worth 5 and 1, and exploration happens to pick the one worth 1. ==Q-learning backs up the 5; SARSA backs up the 1.==
:::

::: note
Q(s, a) = 2, reward 1, gamma 0.9, alpha 0.2. Q-learning: target 1 + 0.9 × 5 = 5.5, new estimate 2 + 0.2 × 3.5 = 2.70. SARSA with the action actually taken: target 1 + 0.9 × 1 = 1.9, new estimate 2 + 0.2 × (−0.1) = 1.98. The reward and the transition are identical; the difference is what behaviour we assume after arriving. The cliff makes that visible.
:::

### Why Q-learning is off-policy, precisely
::: widget backup-tree {"mode":"qlearn","both":true,"policies":true}
The same tuple as the last slide, with its two policies named. Blue is $\pi_B$, the policy that acts: it chose $a_t$ and will choose $a'_B$. Red is $\pi_E$, the policy whose value is learnt. ==SARSA sets $\pi_E = \pi_B$; Q-learning sets $\pi_E$ greedy, and never executes it.==
:::

::: reveal
::: block The clean extreme | act with $\varepsilon = 1$, fully at random
SARSA learns the value of acting randomly.
Q-learning learns the value of the optimal policy, while acting randomly.
:::
:::

::: note
Source pp. 75–77. Three presses: the behaviour policy acts, the world answers, the target reads s′; the last press writes both rules. Behavioural policy pi_B generates the data; the estimation policy pi_E is what the target assumes about the next step. For SARSA they coincide; for Q-learning pi_E is greedy. The convergence statement for the extreme case is tabular: finite stationary MDP, bounded rewards, gamma below 1, every pair visited infinitely often, Robbins–Monro step sizes per pair. Random actions alone do not guarantee visits to unreachable states.
:::

### The map, filled
::: widget rl-roadmap {"cells":["mc-on","sarsa","q"],"skip":["mc-off"]}
Two forks organise everything: ==bootstrap or not==, and ==whose policy stands in the target==. Monte Carlo control and SARSA evaluate the policy that drives; Q-learning studies one policy while living as another.
:::

::: note
Source p. 59. On-policy: the policy that generates the data is the policy evaluated, exploration included. Off-policy: behaviour and target differ. Off-policy Monte Carlo control exists too, with importance weights; the grey cell says so, so that students read it as left out, not missing.
:::

### Temperature thread — learn from one measured transition

::: widget backup-tree {"mode":"qlearn","names":{"s":"x=−2","s1":"x=−1","s2":"x=−2","actions":["off","heat"]},"nums":{"q":-4,"r":-2,"qnext":[-3,-1],"alpha":0.5,"gamma":0.9}}
The heater of Lecture 7 without its model. One heating step is measured: from $-2$ to $-1$, reward $-2$. The old estimate was $-4$. ==Does this observation raise it or lower it?==
:::

::: note
Ask for the prediction before pressing. Q(−2, heat) = −4, max_a Q(−1, a) = −1, gamma 0.9, step size 0.5. Target −2 + 0.9 × (−1) = −2.9; TD error −2.9 − (−4) = 1.1; new estimate −4 + 0.5 × 1.1 = −3.45. One measured outcome moved the estimate; Lecture 7 averaged outcomes with a known model instead.
:::

### Try it — the heating step fails

::: widget backup-tree {"mode":"qlearn","names":{"s":"x=−2","s1":"x=−2","s2":"x=−1","actions":["off","heat"]},"nums":{"q":-4,"r":-5,"qnext":[-3,-4],"alpha":0.5,"gamma":0.9}}
Start again from $-4$. This time the heater fails: the state stays at $-2$, the reward is $-5$, and the best continuation from there is $-3$. ==Work the update before revealing it.==
:::

::: note
Students write the answer first. Target −5 + 0.9 × (−3) = −7.7; TD error −3.7; new estimate −4 + 0.5 × (−3.7) = −5.85. One good or bad observation does not identify the transition probability; repeated data and a decaying step size do.
:::

### Six rooms — Q-learning one update at a time
::: widget six-rooms {}
Rooms A to F, doors between them, reward 100 for stepping outside into F. Before each update, name the entry that will change. One observed transition, one update: ==only the visited entry changes==, and the reward at F reaches earlier rooms only through bootstrapping.
:::

::: note
Source pp. 67–73, one press per observed transition; step size 0.5, discount 0.8, Q initialised to 0. Episode 1, in B, choose F at random: Q(B, F) = 0 + 0.5 × (100 + 0.8 × 0 − 0) = 50; the episode ends. Episode 2, in D, choose B: Q(D, B) = 0 + 0.5 × (0 + 0.8 × 50 − 0) = 20; then B to F: Q(B, F) = 50 + 0.5 × (100 − 50) = 75. In this deck F is terminal, so a move into F has target 100 and the converged Q*(B, F) is 100 and Q*(D, B) is 80; the source's later page treats F as a continuing state that keeps paying 100, which gives 500, and the two conventions are different MDPs. A terminal mask is part of the problem definition.
:::

### The problem the cliff poses
::: widget cliff-walk {"mode":"problem"}
Start at S, reach G. Every step costs $1$; stepping onto the cliff costs $100$ and sends you back to S. ==The shortest path runs along the edge.== Would you walk it while exploring?
:::

### The cliff — where the difference becomes visible
::: widget cliff-walk {"eps":0.1,"seed":3}
Q-learning learns the optimal path along the edge, but it acts $\varepsilon$-greedily, and the occasional random step plunges it off: higher reward in theory, worse online. SARSA accounts for its own exploration and learns a ==cautious== detour.
:::

::: note
Source p. 74, Sutton and Barto's cliff walking. (The source's windy gridworld, p. 58, is the same lesson for SARSA alone: the intended move and the displacement differ, and SARSA learns from the actual next state without being handed the wind model; it is left to the reading guide.) Read the online return per episode: SARSA's is higher because it values the policy it actually runs, exploration included. Neither is better; the cliff teaches the design choice. SARSA learns about a policy that sometimes explores, and is careful where exploration is costly; Q-learning learns about the policy that only exploits, and its optimal path does not account for the risk of exploring.
:::

### When does tabular Q-learning converge?
{math: compact, sub: Watkins and Dayan, Q-learning · Machine Learning 1992}

::: paper
- Why it is here | The guarantee that Act 3's sampled max backup still reaches $Q^*$, and the two conditions it costs.
- What it is | The convergence proof for tabular Q-learning: a contraction fed with samples, under infinite visits and decaying step sizes.
- Why it matters | Every condition it names is one that function approximation breaks, which is Act 4's deadly triad.
:::

**Convergence theorem.** $Q_k \to Q^*$ with probability $1$ if every $(s,a)$ is visited infinitely often and the step sizes satisfy:

$$\underbrace{\sum_t \alpha_t(s,a)=\infty}_{\textcolor{#D64545}{\text{steps large enough to travel any distance}}} \qquad\text{and}\qquad \underbrace{\sum_t \alpha_t(s,a)^2<\infty}_{\textcolor{#D64545}{\text{steps small enough for the noise to average out}}}$$

::: small
$\alpha_t = 1/t$ satisfies both. The constant $\alpha$ of the algorithm boxes satisfies only the first: the estimate reaches the neighbourhood of $Q^*$ and keeps jittering there, in a band that shrinks with $\alpha$.
:::

::: reveal
::: keypoint
Lecture 7's machine is still underneath: the operator $Q\mapsto \E_{s'}[\,r+\gamma\max_{a'}Q(s',a')\,]$ is a $\gamma$-contraction, each application brings any two tables closer by the factor $\gamma$, with the unique fixed point $Q^*$.
Q-learning feeds it ==one sample instead of the expectation==; the step-size condition averages the noise away, and the visiting condition keeps every entry corrected.
:::
:::

::: note
Source p. 60 and the stochastic-approximation argument. Finite stationary MDP, bounded rewards, gamma below 1. Exploration supplies the infinite visits, for example a fixed epsilon; the Robbins–Monro step sizes must hold per pair. What breaks under function approximation: replace the table by Q(·; w) and the update is no longer a contraction in any norm the parameters respect; the projection onto the function class can expand distances. That is the formal root of Act 4's deadly triad.
:::

### Check — what makes Q-learning off-policy
{q: 3}

::: quiz SARSA updates toward $r + \gamma Q(s', a')$ using the action actually taken next; Q-learning uses $r + \gamma \max_{a'} Q(s', a')$. Why does that one difference make Q-learning off-policy?
- Because the $\max$ makes the update deterministic
- Because Q-learning needs a replay buffer and SARSA does not
- =Because the target refers to the greedy action, not the one the behaviour policy chose, so it estimates the optimal policy's value from another policy's data
- Because SARSA converges to $Q^*$ and Q-learning does not
SARSA evaluates the policy that is driving, exploration and all; on the cliff it learns the safe path, because it accounts for the chance of stepping off while exploring. Q-learning evaluates the greedy policy regardless of who is driving, so it learns the optimal edge-hugging path and then keeps falling off it. Neither is wrong; they are answers to different questions.
:::

## Act 4 — scaling past the table
{short: ACT 4, num: Act 4}

**Q4.** Everything so far stores one number per $(s,a)$. What happens when the state is an image?

### Act 4 on the map
::: widget rl-roadmap {"cell":"q","dim":true}
One cell, kept: Q-learning. Act 4 changes nothing in the update. ==It changes what holds $Q$.==
:::

### The wall — a table cannot hold the world
{q: 4}

::: qstrip
:::

::: figure pacman-states | 760
The left state was visited and turned out badly. The two on the right are new. ==A table has nothing to say about a state it has never seen.==
:::

**How many states there are** — four stacked Atari frames:

$$|\mathcal S| \approx 256^{\,84\times84\times4} \approx 10^{67\,970}$$

::: note
More configurations than atoms in the universe. A table fails three times over: too many states to visit, too many to store, and no generalisation, which is the fatal one. The machine-learning answer is to stop storing and start approximating: similar states should share answers.
:::

### Why history is part of the state
::: widget dqn-pictures {"mode":"ball"}
One frame gives the ball's position. ==It cannot give its velocity==: the same picture arises from a ball moving left or right. Two frames can.
:::

::: note
Source p. 96. The state must be Markov for everything in this course to apply; a single image usually is not. DQN stacks the four most recent frames so that velocity and acceleration can be approximated. Frame stacking supplies short-term motion; it does not guarantee a Markov state in every environment, and the DQN papers do not report the effect of the history length.
:::

### From a table to a function
**Function approximation** — the table entry becomes a function of features, and learning means fitting $w$:

$$Q(s,a;w) = w_1\phi_1(s,a)+\cdots+w_n\phi_n(s,a) = w^\top\phi(s,a), \qquad \text{later a network } Q(s,a;\theta)$$

**Q-learning with function approximation** — the same update, applied to the weights:

$$w \leftarrow w + \alpha\Big[\underbrace{r+\gamma\max_{a'}Q(s',a';w)}_{\text{target}} - \underbrace{Q(s,a;w)}_{\text{estimate}}\Big]\nabla_w Q(s,a;w)$$

::: reveal
::: keypoint
Features such as the distance to the nearest ghost or the number of pellets left are shared by states never seen.
==The update moves $w$, so it moves every state's estimate at once==: that is generalisation, and Act 4's trouble.
:::
:::

::: note
Source pp. 79–81. The tabular update is the special case phi(s, a) = a one-hot indicator of (s, a), so tabular RL is function approximation with the most local features possible. For a network, phi becomes the gradient of Q with respect to the weights and the same line holds.
:::

### The semi-gradient, derived
{fill: top, math: compact}

**Derivation of the function-approximation update** — one transition $(s,a,r,s')$, squared error, target held fixed:

$$\begin{aligned}
\text{Err}(w) &= \tfrac12\Big(r+\gamma\max_{a'}Q(s',a';w) - Q(s,a;w)\Big)^2 &&\textcolor{#D64545}{\scriptstyle \text{the error of one transition}} \\
&\step{1}{= \tfrac12\Big(r+\gamma\max_{a'}Q(s',a';w) - \textstyle\sum_k w_k\phi_k(s,a)\Big)^2} &&\step{1}{\textcolor{#D64545}{\scriptstyle \text{linear case}}} \\
\frac{\partial\,\text{Err}}{\partial w_k} &\step{2}{= -\Big(r+\gamma\max_{a'}Q(s',a';w) - \textstyle\sum_j w_j\phi_j(s,a)\Big)\,\phi_k(s,a)} &&\step{2}{\textcolor{#D64545}{\scriptstyle \text{differentiate the estimate only; the target is treated as a constant}}} \\
w_k &\step{3}{\leftarrow w_k + \alpha\Big(r+\gamma\max_{a'}Q(s',a';w) - Q(s,a;w)\Big)\,\phi_k(s,a)} &&\step{3}{\textcolor{#D64545}{\scriptstyle \text{one gradient step: the update on the previous slide.}\quad\blacksquare}}
\end{aligned}$$

::: reveal
::: keypoint
It is called a ==semi-gradient== for an honest reason: the target also depends on $w$, and we pretend it does not.
We are chasing a target that moves when we move.
:::
:::

::: note
Source p. 81. In the tabular world the chase still converged, Watkins and Dayan. With function approximation it can diverge, and the next slides say why before trusting a network.
:::

### Algorithm — Q-learning with function approximation
::: block Algorithm — Q-learning with function approximation | input features $\phi$, step size $\alpha$, $\varepsilon$; output $w$
Initialise $w\leftarrow 0$.

1. Initialise $s$.
2. Repeat for each step: &nbsp; choose $a$ from $s$ by the $\varepsilon$-greedy policy on $Q(s,\cdot;w)$; &nbsp; take $a$, observe $r$, $s'$; &nbsp; ${w\leftarrow w+\alpha\,[r+\gamma\max_{a'}Q(s',a';w)-Q(s,a;w)]\,\nabla_wQ(s,a;w)}$; &nbsp; $s\leftarrow s'$;
3. until $s$ is terminal; then repeat from 1.
:::

::: note
Source p. 81. The same loop as tabular Q-learning with the table write replaced by a gradient step. Everything DQN adds is a change to how this step is fed, not to the step itself.
:::

### From features to a network — what training means
{sub: the four words the rest of this act uses}

::: flow
- **Parameters $\theta$** | the weights of the network $Q_\theta$: the features are now learned too
- **Loss** | the squared gap between a target $y$ and the prediction $Q_\theta(s,a)$
- **Gradient step** | move $\theta$ a little in the direction that shrinks the loss
- **Minibatch** | average that step over $m$ samples, not one
:::

**One training step of a network** — the previous box's update, averaged over $m$ samples; every slide to the end of this act changes how it is fed:

$$\theta \leftarrow \theta - \alpha\,\nabla_\theta\,\frac{1}{m}\sum_{i=1}^{m} \tfrac12\big(y_i - Q_\theta(s_i,a_i)\big)^2, \qquad y_i = r_i + \gamma\max_{a'}Q_\theta(s'_i,a') \ \text{ held constant}$$

::: reveal
::: keypoint
Supervised learning rests on two assumptions: the samples are independent, and the labels $y_i$ do not move.
Reinforcement learning ==breaks both==: consecutive transitions are neighbours, and the labels are computed by the network being trained.
:::
:::

::: note
For students who have not trained a network. A network is a function with many weights theta; a loss says how wrong its predictions are on some samples; the gradient of the loss says which way to nudge each weight; a minibatch is the handful of samples one nudge is computed on. With m = 1 and a linear Q this is the box on the previous slide exactly, the factor one half cancelling the 2 of the derivative. In supervised learning the pairs (input, label) are drawn independently from a fixed data set. Here the inputs arrive in order from one trajectory and the labels come from the network itself: those two breaks are problems 2 and 3 of the next slide.
:::

### Three problems a network brings
::: flow
- !!Curse of dimensionality | the state is an image
- !!Correlated samples | consecutive frames are neighbours
- !!Moving target | the target is the network being trained
:::

::: reveal
::: keypoint
Three problems, and DQN's three answers: a convolutional network, experience replay, a target network.
The next slides take them in turn, ==the second and third are the ones that make or break training.==
:::
:::

::: note
Source p. 89 and the summary p. 114. The first problem is the convnet's job and belongs to a vision course; the other two are reinforcement learning's own, and both come from feeding the semi-gradient step with a stream of its own making.
:::

### Problem 1 — the state is an image, and the convolutional network
::: widget dqn-pictures {"mode":"pipeline"}
Four recent frames, grey-scaled and cropped, go into one convolutional network that outputs ==one $Q$ value per action==. One forward pass scores every action, so the argmax is a lookup.
:::

::: note
Source pp. 83–95. The network is Alexnet's grandchild: a convnet condenses the image into a small vector, and the deeper layers are a learned feature map phi. Output one Q per action rather than taking the action as an input, so the max over actions costs one pass.
:::

### The deadly triad — why naive deep Q-learning can blow up
{sub: Tsitsiklis and Van Roy, An analysis of temporal-difference learning with function approximation · IEEE TAC 1997}

::: paper
- Why it is here | The proof that the three ingredients below can diverge together, with the two-state example the next slide runs.
- What it is | Convergence of TD with linear features on-policy, and a counterexample once the updates are off-policy.
- Why it matters | The reason DQN needs stabilisers at all, and the reason deep RL stays fragile after them.
:::

::: flow
- !!Function approximation | one update moves many states
- !!Bootstrapping | Act 1's choice: the target is built from the moving estimate
- !!Off-policy | Act 3's choice: the data come from a policy other than the one valued
:::

::: reveal
::: keypoint
Q-learning with a network has all three. Each alone is fine; ==together they can diverge even when every true value is zero.==
DQN does not remove any of them. It weakens two.
The moving target is the first two legs meeting; replay is allowed only because of the third.
:::
:::

::: note
Sutton and Barto's name for the combination; Tsitsiklis and Van Roy's 1997 counterexample is the next slide. Their absence is not a universal guarantee for arbitrary algorithms or step sizes; their presence is a known source of instability.
:::

### The triad, switched on and off
::: widget deadly-triad {"seed":5}
Two states, every reward $0$, so the true value is $0$ everywhere. One shared weight: $s_1$ is valued $w$ and $s_2$ is valued $2w$. Updating $s_1$ towards $\gamma\cdot 2w$ has error $(2\gamma-1)\,w$, the same sign as $w$ once $\gamma>\tfrac12$, so ==every update pushes $w$ further from $0$.== Turn any one switch off and the same update sits at $0$.
:::

::: note
Tsitsiklis and Van Roy, 1997. s_1 has feature 1, s_2 has feature 2, both values are w times the feature; the update is made on the s_1 to s_2 transition only, off-policy, with the bootstrapped target gamma times 2w; the error is (2 gamma minus 1) w, positive for gamma above one half, so w grows geometrically. A table has two separate numbers and the coupling disappears; a Monte Carlo target is zero; on-policy updating visits s_2 as often and pulls w back.
:::

### Problem 2 — correlated samples, and experience replay
::: widget dqn-pictures {"mode":"buffer"}
Transitions are stored as they happen in a queue, oldest out first. Training draws ==a random minibatch== from the queue, so the frames in one update are no longer neighbours in time.
:::

**Experience replay** — the training step, with its minibatch drawn at random from the buffer $D$:

$$\theta \leftarrow \theta - \alpha\,\nabla_\theta\,\frac{1}{m}\sum_{i=1}^{m}\tfrac12\big(y_i - Q_\theta(s_i,a_i)\big)^2, \qquad (s_i,a_i,r_i,s'_i)\sim D$$

::: small
Replay reuses transitions collected by older policies, so it needs an off-policy rule: Q-learning qualifies, SARSA does not.
:::

::: note
Source pp. 97–103. Online Q-learning updates on consecutive, strongly correlated transitions, and the policy changes drastically after single updates; the source's two-layer regression demo shows online updates reaching lower training error and much higher validation error than minibatches. Replay reduces the correlation within a minibatch and reuses each transition several times; the buffer's finite contents are still not independent samples from a fixed distribution. Replay applies only to off-policy methods, which is one more reason Act 3's choice matters.
:::

### Problem 3 — the target is the network
::: widget dqn-pictures {"mode":"samenet"}
The loss of one stored transition. The upper branch computes the target from $s'$ ==with the same network== that the lower branch is training. The gradient is taken through the lower branch only.
:::

**The DQN loss, naive form** — the semi-gradient of this act, written for a network:

$$\mathcal L(\theta) = \Big\|\, r + \gamma\max_{a'}Q_\theta(s',a') - Q_\theta(s,a)\,\Big\|^2, \qquad \text{the target treated as a constant}$$

::: note
Source p. 102. Select the output entry for the action taken, compare with the target computed on s', and do not back-propagate through the target. The target changes every time theta changes, which is the next slide.
:::

### Why the target moves
::: widget dqn-pictures {"mode":"moving"}
With a table, one update changes one cell and nothing else. With a network, one update on any transition ==moves every entry of every state==, including the ones the next target will be read from.
:::

::: note
Source pp. 104–105. The degree of movement grows with the flexibility of the approximator; for a deep network it is severe. The target is therefore chasing itself: an update made to reduce the error also moves the quantity the error was measured against.
:::

### The target network
::: widget dqn-pictures {"mode":"targetnet"}
Freeze a copy. The target is computed by ==a second network that does not move== during a block of $C$ updates; then the copy is refreshed and the next block begins.
:::

**The DQN loss** — the form the Nature paper trains, with the frozen parameters $\theta^-$:

$$\mathcal L(\theta) = \E_{(s,a,r,s')\sim D}\Big[\big(r + \gamma \max_{a'}Q_{\theta^-}(s',a') - Q_\theta(s,a)\big)^2\Big], \qquad \theta^-\leftarrow\theta \text{ every } C \text{ updates}$$

::: note
Source pp. 106–107 and 110. The hard update copies theta into theta minus every C steps; the soft update of DDPG, theta minus = tau theta + (1 minus tau) theta minus, is the smooth version. The target is fixed within a block, which helps stability and restores no general convergence guarantee.
:::

### DQN — the three answers, assembled
{sub: Mnih et al., Human-level control through deep reinforcement learning · Nature 2015 (arXiv version 2013)}

::: paper
- Why it is here | The first method that learns control from pixels with the Q-learning of Act 3 unchanged; everything in Act 4 is what it had to add.
- What it is | A convolutional network for $Q$, trained by Q-learning on minibatches from a replay buffer, with the target computed by a frozen copy.
- Why it matters | One architecture and one set of hyperparameters reached human-level play on dozens of Atari games; the stabilisers are now standard.
:::

::: widget dqn-pictures {"mode":"schematic"}
Collect experience with the current network, store it, sample a minibatch, compute targets with the frozen copy, update, and ==every $C$ steps copy the weights across.==
:::

::: note
Source pp. 86–88 and 108. DQN is not the first neural value-function approximator; Lin 1993, neural fitted Q iteration and Riedmiller's work came before, and the non-linear methods were known to be unstable. What DQN added was the combination that worked at scale: Alexnet's convnet, replay, the target network, and frame histories.
:::

### Algorithm — deep Q-learning with experience replay
::: block Algorithm — DQN | input buffer size $N$, minibatch size $m$, copy period $C$, $\varepsilon$; output $\theta$
Initialise the replay buffer $D$, the network $Q_\theta$ at random, and the target network $\theta^-\leftarrow\theta$.

1. For each episode: observe $s_1$ and build the stacked frames.
2. For each step: &nbsp; choose $a_t$ $\varepsilon$-greedily on $Q_\theta(s_t,\cdot)$; &nbsp; take it, observe $r_{t+1}$, $s_{t+1}$; &nbsp; store $(s_t,a_t,r_{t+1},s_{t+1})$ in $D$.
3. Sample a minibatch of $m$ transitions from $D$; set $y_i = r_i$ if terminal, else $y_i = r_i+\gamma\max_{a'}Q_{\theta^-}(s'_i,a')$; take one gradient step on $\sum_i (y_i-Q_\theta(s_i,a_i))^2$.
4. Every $C$ steps: $\theta^-\leftarrow\theta$.
:::

::: reveal
::: keypoint
Trace each line to its act: $\varepsilon$-greedy from Act 2, the max in the target from Act 3, the bootstrap from Act 1, the buffer and the frozen copy from this act. ==One loop holds the whole lecture.==
:::
:::

::: note
Source p. 109, Algorithm 1 of the Nature paper. The terminal flag matters: for a true terminal transition y = r; a time-limit truncation is not a terminal and should still bootstrap. Worked label: r = 1, gamma 0.9, the target network's next values 5 and 1, so y = 5.5; if the current network predicts 2 the squared error is 6.125 and the gradient pushes the prediction up; do not differentiate through the label.
:::

### The evidence — switch the two stabilisers off
{sub: the Nature paper's ablation: score, and multiple of the naive network}

| game | replay + target | replay only | target only | neither |
|---|---|---|---|---|
| Breakout | 316.8 (×99.0) | 240.7 (×75.2) | 10.2 (×3.2) | 3.2 (×1) |
| Enduro | 1006.3 (×34.6) | 831.4 (×28.6) | 141.9 (×4.9) | 29.1 (×1) |
| River Raid | 7446.6 (×5.1) | 4102.8 (×2.8) | 2867.7 (×2.0) | 1453.0 (×1) |
| Seaquest | 2894.4 (×10.5) | 822.6 (×3.0) | 1003.0 (×3.6) | 275.8 (×1) |
| Space Invaders | 1088.9 (×3.6) | 826.3 (×2.7) | 373.2 (×1.2) | 302.0 (×1) |

::: reveal
::: keypoint
Both stabilisers help on every game, replay the more. ==Neither removes a leg of the triad==, and DQN still needs ten million frames per game.
:::
:::

::: note
Source p. 113, reproduced from the Nature paper. Higher is better; the multiple is against the naive network with neither device. The effectiveness varies across games. Sample inefficiency remains the notorious problem of deep RL.
:::

### Why the max over-estimates
{sub: five actions, each truly worth 0}

::: widget max-bias {"seed":5}
Five actions, every one truly worth $0$; the bars are one noisy estimate of each. ==The max picks the luckiest noise==, so on average it sits above the true value. A second, independent estimate of the picked action averages $0$.
:::

::: note
Ask first: every action is worth 0 and the estimates are unbiased, so what does the max of the estimates average? Then draw. One draw arrives with the slide; the ×200 button shows the averages: the max of five standard normal estimates averages about 1.16, the second estimate of the picked action about 0. In Q-learning the over-estimate does not stay put: it is the target of the previous state, so the bootstrap carries it backwards. The fix on the next slide is the blue dot: let one network pick the action and the other score it.
:::

### Double DQN — select with one network, evaluate with the other
{sub: van Hasselt, Guez and Silver, Deep reinforcement learning with double Q-learning · AAAI 2016}

::: paper
- Why it is here | The cure for the last slide: in DQN the same noisy estimate picks the action and scores it.
- What it is | Use the online network to choose $a^*$ at $s'$ and the frozen network to value it; one line of DQN changed.
- Why it matters | A named flaw of the Act 3 max, and the first of a decade of refinements that keep DQN's skeleton.
:::

**The two targets** — DQN and Double DQN, the max taken apart:

$$y_{\text{DQN}} = r+\gamma\max_{a'}Q_{\theta^-}(s',a'), \qquad y_{\text{Double}} = r+\gamma\,Q_{\theta^-}\big(s',\,\argmax_{a'}Q_\theta(s',a')\big)$$

::: note
Worked numbers: at s' the online network gives 8 for A and 7 for B, the target network 4 for A and 6 for B; reward 1, gamma 0.9. DQN takes max(4, 6) and y = 6.4. Double DQN selects A with the online network and evaluates it with the target network: y = 1 + 0.9 × 4 = 4.6. Separating selection from evaluation reduces a source of over-estimation; neither number is guaranteed correct. Different from TD3's minimum of two critics in Lecture 10. Dueling networks, prioritised replay and Rainbow are the reading guide's extensions.
:::

### One backup, one deletion per rung
::: widget mdp-pictures {"mode":"ladder","start":0,"upto":5,"plates":[{"title":"Value iteration (Lecture 7)","line":"for each state s:","formula":"V(s) ← \\max_a \\sum_{s′} T(s,a,s′)[R + γ V(s′)]","note":"the full backup: every successor, weighted by the model","loop":"one sweep per round"},{"title":"Monte Carlo","line":"for each visited state s, after the episode:","formula":"V(s) ← V(s) + α[\\red{G_t} − V(s)]","note":"the expectation replaced by one whole return","loop":"one episode per round"},{"title":"TD(0)","line":"for each transition (s, r, s′):","formula":"V(s) ← V(s) + α[\\red{r + γ V(s′)} − V(s)]","note":"one step sampled, the rest bootstrapped","loop":"one transition per round"},{"title":"SARSA","line":"for each transition (s, a, r, s′, a′):","formula":"Q(s,a) ← Q(s,a) + α[r + γ \\red{Q(s′,a′)} − Q(s,a)]","note":"V becomes Q; the next action is the one actually taken","loop":"one transition per round"},{"title":"Q-learning","line":"for each transition (s, a, r, s′):","formula":"Q(s,a) ← Q(s,a) + α[r + γ \\red{\\max_{a′} Q(s′,a′)} − Q(s,a)]","note":"the next action is the best one, taken or not","loop":"one transition per round"},{"title":"DQN","line":"for a minibatch from the replay buffer:","formula":"θ ← θ + α[r + γ \\max_{a′} Q(s′,a′;\\red{θ^-}) − Q(s,a;\\red{θ})]∇_θ Q(s,a;θ)","note":"the table becomes a network; the target is frozen","loop":"one minibatch per round"}]}
Lecture 7's summary ladder, continued. Each rung is the rung above with ==one thing changed==, marked in red: the expectation sampled, the return cut to one step, the next action taken and then maximised, the table replaced by a network.
:::

::: note
Read it top to bottom. Lecture 7 deleted loops; this lecture deletes the model. Against Lecture 7's hand-over table: the expectation over successors became one sampled transition (Act 1); policy evaluation solved with T and R became Monte Carlo returns or a TD bootstrap (Act 1); greedy on V with a lookahead became greedy on Q, the cache now essential (Act 2); value iteration became Q-learning, the same max sampled (Act 3); the exact table became a network with a buffer and a frozen copy (Act 4). The expectation becomes a return, the return becomes one step plus a bootstrap, V becomes Q so that the greedy step needs no model, the sampled next action becomes the max, and the table becomes a network whose target is frozen. Nothing changed the principle, only what we are allowed to look up.
:::

### Check — the three ingredients
{q: 4}

::: quiz The deadly triad names three things that together can make value learning diverge. Which set?
- Exploration, discounting, and a large state space
- Non-stationarity, correlated samples, and a moving target network
- High learning rate, sparse reward, and long horizon
- =Function approximation, bootstrapping, and off-policy training
All three together can send an estimate to infinity even when all rewards and true values are zero. Removing a leg helps in the displayed example; it does not prove every remaining algorithm converges. DQN's two devices are best read as attacks on this: a replay buffer decorrelates the updates and a frozen target network weakens the bootstrap. Neither removes the third leg, which is why deep RL remains fragile.
:::

## Closing
{short: CLOSING}

The equation stayed; what we were allowed to look up changed three times.

### The lecture on one page — six methods, one update
{sub: new estimate = old estimate + step size × (target − old estimate)}

::: table center
| Method | Target | Updates after | Whose value | Stored in |
|---|---|---|---|---|
| Monte Carlo prediction | $G_t$ | an episode | the policy followed | table $V$ |
| TD(0) | $r+\gamma V(s')$ | a step | the policy followed | table $V$ |
| Monte Carlo control | $G_t$ | an episode | the $\varepsilon$-greedy policy followed | table $Q$ |
| SARSA | $r+\gamma Q(s',a')$ | a step | the $\varepsilon$-greedy policy followed | table $Q$ |
| Q-learning | $r+\gamma\max_{a'}Q(s',a')$ | a step | the greedy policy | table $Q$ |
| DQN | $r+\gamma\max_{a'}Q_{\theta^-}(s',a')$ | a step, on a minibatch | the greedy policy | network $Q_\theta$ |
:::

::: reveal
::: keypoint
Read down any column: one thing changes at a time.
Cover the Target column and ==rebuild it from the other three.==
:::
:::

::: note
The ladder of the last act as a table, for revision. Rows 1 and 2 are Act 1, row 3 Act 2, rows 4 and 5 Act 3, row 6 Act 4. The column Whose value is the on-policy and off-policy fork; the column Updates after is the bootstrap fork.
:::

### Where we are — the cell, filled
::: lineage dd-A
:::

::: reveal
::: keypoint
One repeated move, three times over.
The model became a sample. The wait became a bootstrap. The table became a function.
:::
:::

### The wall ahead — a max over a continuum
**Every method today ends in the same line:**

$$a = \argmax_{a\in\mathcal A} Q(s,a), \qquad \text{cheap while } \mathcal A \text{ is a list, impossible to enumerate when } \mathcal A\subset\mathbb R^m$$

::: reveal
::: keypoint
Double DQN, dueling networks, prioritised replay and Rainbow all keep the skeleton: a sampled Bellman backup, $Q$ for model-free greed, a stabiliser.
None brings back the model, and none can enumerate a continuous action space. ==That wall is where Lecture 9 begins.==
:::
:::

::: note
The maximisation over a continuum needs structure or an optimiser; the actor of Lecture 10 is that optimiser. Lecture 9 first solves the same dynamic problem with continuous dynamics and a known model, the mirror of Lecture 7.
:::

### Notation — the symbols of this lecture
{sub: and where they differ from Lecture 7}

::: table center
| Symbol | Meaning | Symbol | Meaning |
|---|---|---|---|
| $G_t$ | the return from step $t$; Lecture 7 wrote $U_t$ | $\alpha$ | step size, or learning rate |
| $T(s,a,s')$ | transition probability $P(s'\mid s,a)$ | $\varepsilon$ | probability of a random action |
| $T$ in $G_t$ | the step at which the episode ends | $\gamma$ | discount factor |
| $r_{t+1}$ | the reward that follows $a_t$ | $\pi_B$, $\pi_E$ | the policy that acts; the policy valued |
| $V^\pi$, $Q^\pi$ | the value of following $\pi$ | $w$, $\phi$ | weights and features of a linear $Q$ |
| $V$, $Q$ | the current estimates | $\theta$, $\theta^-$ | network weights; their frozen copy |
| $Q^*$ | the value of acting optimally | $D$, $m$, $C$ | replay buffer, minibatch size, copy period |
:::

::: note
A page to keep open while reading the deck alone. Two clashes to say aloud: T is the transition function everywhere except inside the return, where it is the last step of the episode; and the return is G here and U in Lecture 7.
:::

### Reading guide — from a tabular target to a learned value function
{sub: one main idea to explain, one comparison, one application}

| Role | Read or revisit | Question to answer |
|---|---|---|
| **Core** | [Sutton and Barto, *Reinforcement Learning: An Introduction*, 2nd ed., Chapters 2, 5 and 6](http://incompleteideas.net/book/the-book-2nd.html) | How does one sampled transition become a backup? |
| **Compare** | [Mnih et al., *Human-level control through deep reinforcement learning* (Nature 2015)](https://doi.org/10.1038/nature14236) and [van Hasselt, Guez and Silver, *Double Q-learning* (AAAI 2016)](https://arxiv.org/abs/1509.06461) | Which device is about the target, and which about the data? |
| **Apply** | The random walk, the six rooms and the cliff from today; the windy gridworld of Sutton and Barto, Example 6.5 | Which experiment is prediction, and which is control? |

::: keypoint
Dueling networks (Wang et al., 2016), prioritised replay (Schaul et al., 2016) and Rainbow (Hessel et al., 2018) are the extension map: each patches a named flaw and keeps the loop.
:::

### Lecture 7 could solve the Bellman equation, because it owned the world. Lecture 8 learned to solve it.
{layout: standout}

by sampling the expectation, storing $Q$ instead of $V$, and replacing the table with a network whose stability had to be bought twice.

### Questions?
{layout: standout}

From a five-state random walk to human-level Atari with one update rule: the distance between knowing the dynamics and never needing to. What stays fixed through all of it is the equation Bellman wrote; we only ever changed what we were allowed to look up.
