---
ch: 7
title: Markov Decision Processes & Dynamic Programming
subtitle: A good plan stays good from wherever you land
tagline: The deepest crossing — from choosing once, to choosing at every state your choices create
blurb: >-
  The deepest crossing in the course: from choosing once to choosing at every state your own
  choices create. The Bellman equation says what a good plan is, and value and policy iteration
  solve it exactly — so long as somebody hands you the model.
course: IE437 · Data-Driven Decision Making and Control
author: Jinkyoo Park
institute: KAIST
lineage: A
lineage_here: mb-A
cube:
  stages: dynamic
  model: model-based
  agents: single agent
crossing: stages
cube_from:
  stages: static
inherits: the dynamic generalisation of Lecture 1, and the decision network of Lecture 3
handoff: the Bellman equation, which still needs the model (Lecture 8)
questions:
  - Why not greedy?
  - What must value satisfy?
  - How do we solve it?
  - Why does it converge?
---

### Markov Decision Processes & Dynamic Programming
{layout: title}

### Where we are — the deepest crossing
::: tracker
:::

::: lineage mb-A
:::

::: reveal
::: keypoint
Lecture 1 chose once, and Lecture 3 added beliefs and utilities.
From here each action changes the next state and the choices after it: ==choose at every state your choices create.==
:::
:::

::: note
The tracker shows the crossing: static to dynamic, still model-based, still one agent. The lineage grid places this lecture in the OR row, model-based column. One picture carries the whole lecture: a state, the action taken there, and the states it may lead to; every equation is that picture with one thing changed.
:::

### Learning route — one backup before a whole algorithm
::: flow
- **Act 1 · the arena** | state, action, return, policy, $V$ and $Q$
- **Act 2 · the Bellman equation** | one backup diagram, read four ways
- !**Act 3 · solve it** | evaluate, improve, policy and value iteration
- **Act 4 · why it works** | the two processes meet; the contraction
:::

::: reveal
::: keypoint
Read each backup diagram aloud before its equation appears. The worked arithmetic and the proofs wait in the appendix.
:::
:::

::: note
Bring: expectation, a discounted sum and finite tables. First pass: follow the idea from state and action to the Bellman backup, then evaluate and improve. Return later for the contraction proof and the convergence assumptions.
:::

## Act 1 — the arena, and the value of a state
{short: ACT 1, num: Act 1}

**Q1.** A greedy rule scores an action by its own reward. Build the object that scores a *situation* instead.

### Why a sequence is not many single choices
{sub: the source deck's opening example}

::: widget mdp-pictures {"mode":"career"}
A one-step-greedy rule takes the job and never looks up. Graduate school pays less now and buys a ==state== from which a further action opens many futures.
:::

::: reveal
::: keypoint
Actions are coupled ==through the state==. An action cannot be scored by its own reward, only by ==the whole future it unlocks.==
:::
:::

::: note
Three actions in the final year: a job at 4,000 dollars a month, graduate school at 500, a start-up at 0. The 500 was never the point; the state it bought was. The new object we need is a number attached to a situation, the total future reward a good plan can extract from it, plus an equation tying each situation's number to its successors'. That equation is Bellman's, and it is the lecture.
:::

### The agent and the environment, in a loop
::: widget mdp-pictures {"mode":"loop"}
At each step the agent acts, the environment answers with a reward and a new state, and the loop repeats. The goal is the ==sum of the rewards==, not the next one.
:::

::: reveal
::: small
A warning from the source deck worth repeating: ==the reward signal says *what* you want achieved, never *how*.== Reward a chess engine for taking pieces and it will take pieces; it will not win.
:::
:::

### The arena — a Markov decision process
{q: 1, math: compact}

::: qstrip
:::

::: widget mdp-pictures {"mode":"graph"}
The MDP as a graphical model: the action and the state at $t$ decide the reward at $t$ and the state at $t+1$.
:::

**Definition** — the tuple every slide after this one uses:

$$\langle \mathcal S, \mathcal A, T, R, \gamma\rangle,\qquad T(s,a,s') = P(S_{t+1}=s'\mid S_t=s, A_t=a),\qquad R(s,a,s')$$

::: note
States and actions finite. T is also called the model or the dynamics; Lecture 8 writes it P(s'|s,a) and then deletes it. R may be the expectation of a random reward. The discount is in [0,1); episodic tasks add terminal states.
:::

### Stationary and Markov — one slice stands for all
{math: compact}
::: widget mdp-pictures {"mode":"graph","stationary":true}
Because $T$ and $R$ are the same at every step, the chain of time slices collapses to one picture: $S$, the action $A$ taken there, the reward $R$ and the next state $S'$.
:::

**Markov property** — what lets the value of a state be a single number:

$$P(S_{t+1}=s' \mid S_t, A_t, S_{t-1}, A_{t-1}, \dots) \;=\; P(S_{t+1}=s'\mid S_t, A_t)$$

::: reveal
::: keypoint
Given the present state, the past is irrelevant. So an optimal policy can use only the present state: ==$\pi^*(s_t, s_{t-1},\dots) = \pi^*(s_t)$.==
:::
:::

::: note
Without the Markov property the value of "here" would have to be indexed by every path that could have led here, and there are exponentially many. A table with one row per state is a sufficient answer only because of this line. Lecture 3 met the same condition as a missing-edge pattern in a Bayesian network over S_1..S_T. For a finite horizon the best action may also depend on the time left: use pi_t(s) or put t into the state.
:::

### The goal — return, and the discount
::: cols
::: col Episodic — there is a last step
$$U_t = r_{t+1} + \cdots + r_T$$

A maze, a game of chess. The sum is finite because the episode is.
:::
::: col.accent Continuing — there is not
$$U_t = \sum_{k=0}^{\infty}\gamma^k r_{t+k+1}$$

With bounded rewards, $\gamma<1$ makes the sum finite. Convention: take $a_t$ at $s_t$, then receive **$r_{t+1}$ and $s_{t+1}$**.
:::
:::

::: reveal
::: keypoint
$\gamma=0$ is the greedy rule that failed on the first slide. $\gamma\to1$ counts a distant reward almost as much as a near one.
:::
:::

### A policy is a rule, not a point
**What we are looking for** — compare Lecture 1's $x^* = \argmax_x f(x)$:

$$\pi:\mathcal S\to\mathcal A, \qquad \pi^* = \argmax_\pi\ \E\big[U^\pi(s)\big] \quad \hl{\text{for all } s}$$

::: reveal
::: keypoint
Not best on average over some start distribution: best ==from every state at once==. That such a policy exists is the first gift of the Bellman equation.
:::
:::

::: note
A policy may be deterministic or stochastic. For a finite, discounted, stationary MDP with bounded rewards a deterministic stationary optimal policy exists, so pi is deterministic throughout. Stochastic policies return in Lecture 8, where randomness buys exploration.
:::

### The value of a state — the rewards along the road ahead
::: figure route-values | 640
The source deck's picture: a route through the city, one reward per leg. $V^\pi(s)$ is the discounted sum of the rewards on the road the policy takes from $s$, ==averaged over where the traffic sends you.==
:::

### The value of a state, and the value of an action
::: cols
::: col $V^\pi$ — how good is it to *be* here
$$V^\pi(s) = \E_\pi\Big[\textstyle\sum_{k\ge0}\gamma^k r_{t+k+1}\,\Big|\,S_t=s\Big]$$

The expected return from following $\pi$ starting at $s$.
:::
::: col.accent $Q^\pi$ — how good is it to *do* this here
$$Q^\pi(s,a) = \E_\pi\big[U_t\mid S_t=s, A_t=a\big]$$

Take $a$ now, whatever $\pi$ would have said, then follow $\pi$ forever after.
:::
:::

::: reveal
::: keypoint
A value scores a state by ==the entire future a policy can extract from it==, not by one step's reward. That is exactly what the greedy rule lacked.
:::
:::

::: note
E_pi is not an expectation over the policy; with pi deterministic it is an expectation over every stochastic transition the policy leads you through. Both are defined with respect to a policy: there is no value of a state, only the value of a state under a way of behaving.
:::

### The discount is a decision, not bookkeeping
{fill: top}

::: widget discount-dial {"gamma":0.5}
A corridor with a small prize one step to the left of START and a large prize six steps to the right. Turn $\gamma$ and watch the arrows flip ==one cell at a time, from the far end inwards==. Same MDP, same optimality principle, opposite answer.
:::

::: note
Each cell has its own exact threshold: START switches at gamma = 10^(-1/5) ≈ 0.631, where gamma^5 · 10 overtakes 1; its neighbour at 10^(-1/3) ≈ 0.464; the three cells nearest the large prize never point left at all.
:::

### Check — why the state has to be Markov
{q: 1}

::: quiz The Markov property says the future depends on the past only through the current state. Why does the whole apparatus need it?
- =Because it lets the value of a state be written without reference to how you got there — which is what makes a recursion over states possible at all
- To make the transition probabilities easier to estimate from data
- To guarantee the reward is bounded
- To ensure the optimal policy is deterministic
Without a sufficient state, the value of "here" can depend on earlier observations; one may need to include history or a belief state. The Markov property is what collapses an exponential tree of histories into a graph of states, and everything after it — the Bellman equation, dynamic programming, every algorithm in Lectures 8 to 12 — is built on that collapse. Choosing the state representation *is* choosing whether the assumption holds.
:::

## Act 2 — the Bellman equation
{short: ACT 2, num: Act 2}

**Q2.** The value of a state sums an infinite future. Turn that sum into a relation between neighbours.

### Every possible future
{q: 2}

::: qstrip
:::

::: widget backup-tree {"mode":"tree"}
What $V^\pi(s)$ averages over. From $s$ every action, from each action every outcome, from each outcome every action again: ==a tree that never stops branching.==
:::

::: reveal
::: keypoint
Fix $\pi$ and the decision branches close. What is left is ==the red path==: one layer of chance, and beyond it a subtree that is itself a value function.
:::
:::

### The Bellman expectation equation
::: widget backup-tree {"mode":"eval"}
The red path, cut after one step. A **state node** $s$ leads to a **chance node** $(s,a_2)$, whose branches carry the weights $T$ and end at successors holding $V^\pi(s')$. Written out, the backup is ==one term per successor.==
:::

**Bellman expectation equation** — the update rule of policy evaluation in Act 3:

$$V^\pi(s) = \sum_{s'} T(s,\pi(s),s')\Big[R(s,\pi(s),s') + \gamma\, V^\pi(s')\Big]$$

::: note
Peel one step off the return; the Markov property says the rest from s' is V^pi(s'). The value of a state equals the expected immediate reward plus the discounted value of where you land. For a finite S this is |S| linear equations in |S| unknowns, solvable by matrix inversion in O(|S|^3): "sum an infinite future" has become "relate each state to its neighbours". Derivation: Appendix, Backup 1.
:::

### $Q$ and $V$ — one lookahead apart
::: widget backup-tree {"mode":"eval","q":true}
$Q^\pi$ lives on the chance node, $V^\pi$ on the state node. Force $a=\pi(s)$ and the chance node's number is the state's.
:::

**Action value, and its link to the state value** — Lecture 8 stores the first and drops the second:

$$Q^\pi(s,a) = \sum_{s'} T(s,a,s')\big[R(s,a,s') + \gamma V^\pi(s')\big], \qquad \hl{V^\pi(s) = Q^\pi(s,\pi(s))}$$

::: note
The source deck's sentence, kept whole: "The Q function effectively caches the results of all one-step-ahead search." The cache is worthless while the model is free. It becomes the whole ballgame the moment T is gone, because the lookahead is precisely what you can no longer perform. Lecture 8's first structural decision follows from this line.
:::

### Bellman optimality — choose the best action now
::: widget backup-tree {"mode":"opt"}
The same picture with the policy's single edge replaced by all the actions, and a ==max== where the choice is made.
:::

**Bellman optimality equation for $V^*$** — the update rule of value iteration in Act 3:

$$V^*(s)=\max_a\sum_{s'}T(s,a,s')\big[R(s,a,s')+\gamma V^*(s')\big]$$

::: note
Take the best action first, then follow the optimal policy. The max is over the actions available now; the expectation is over the transitions that action can produce. Any greedy policy with respect to V* is optimal, because V* already accounts for all future behaviour.
:::

### Bellman optimality for $Q^*$ — the max moves to the next state
::: widget backup-tree {"mode":"qopt"}
Start on the chance node: the action is already fixed, so the only choice left is at the successor. The two maxima choose actions at **different times**: ==we observe $s'$ before choosing $a'$.==
:::

**Bellman optimality equation for $Q^*$** — the form Lecture 8 opens with:

$$Q^*(s,a)=\sum_{s'}T(s,a,s')\big[R(s,a,s')+\gamma\max_{a'}Q^*(s',a')\big]$$

### Check the timing — guessing a coin before or after the toss
A fair coin will be tossed. Choose **heads** or **tails**; a correct guess pays 1.

::: cols
::: col Decide before observing
Either guess has expected reward $0.5$.

$$\max_a\E[R(a,C)]=0.5$$
:::
::: col.accent Decide after observing
You can match every outcome and collect 1.

$$\E[\max_a R(a,C)]=1$$
:::
:::

::: keypoint
A maximum inside the expectation describes a clairvoyant. In Bellman's equation only the **next** action is chosen after the next state is observed.
:::

### The principle of optimality, and the policy read off
::: block Bellman's principle of optimality
An optimal policy has the property that, whatever the first action and the state it leads to, the ==remaining decisions must themselves be optimal from that state.==
:::

::: reveal
**The optimal policy** — read off the optimal value with one lookahead:

$$\pi^*(s) = \argmax_a\, Q^*(s,a) = \argmax_a \sum_{s'} T(s,a,s')\big[R(s,a,s') + \gamma V^*(s')\big]$$
:::

::: reveal
::: keypoint
Greed was never the enemy. Greed applied to the immediate reward fails; greed applied to ==the right quantity== is exactly optimal.
:::
:::

### Check — expectation and maximum, in that order
{q: 2}

::: quiz The Bellman optimality equation contains both a $\max$ over actions and an expectation over next states. Why can the two not be swapped?
- They can be — the order is a matter of convention
- =Because you must commit to an action *before* seeing which next state occurs; maximising inside the expectation would let the agent choose after the fact
- Swapping them is valid only for deterministic environments, which is the usual case
- Because the expectation is over an infinite set and the maximum over a finite one
Moving the $\max$ inside the expectation gives $\mathbb{E}[\max\ldots]$, which values the ability to pick an action **after** the dice are thrown. That quantity is an upper bound and it describes a clairvoyant, not an agent. The gap between the two is the value of information, and keeping them in the right order is what makes the equation describe a decision made under genuine uncertainty.
:::

## Act 3 — solving it with the model
{short: ACT 3, num: Act 3}

**Q3.** The Bellman equations are conditions, not procedures. Turn them into iteration.

### Two halves of one machine
{q: 3}

::: qstrip
:::

**Dynamic programming** computes optimal policies ==given a perfect model of the environment==. It has exactly two moves:

::: cols
::: col Policy evaluation — make $V$ agree with $\pi$
$$V_{k+1}(s) \leftarrow \sum_{s'} T(s,\pi(s),s')\big[R + \gamma V_k(s')\big]$$

Sweep the expectation backup until it stops changing.
:::
::: col.accent Policy improvement — make $\pi$ greedy on $V$
$$\pi'(s) = \argmax_a \sum_{s'} T(s,a,s')\big[R + \gamma V^\pi(s')\big]$$

One $\argmax$ over a finite set, per state.
:::
:::

::: reveal
::: keypoint
The right-hand box *is* Lecture 1's $\argmax$, once per state over $|\mathcal A|$ candidates. What is new is ==the quantity being optimised.==
:::
:::

### Policy evaluation — sweeping the backup
::: widget mdp-pictures {"mode":"arrays"}
One sweep backs up ==every state, from every successor==, once. Two arrays keep the sweep order irrelevant; one array lets fresh values travel within a sweep.
:::

::: reveal
::: keypoint
This is a **full backup**: nothing is sampled, nothing is skipped. Lecture 8's central move is to replace it with a *sample* backup from one successor.
:::
:::

::: note
Initialise V_0 = 0. Repeat: for each state, V_{k+1}(s) ← Σ_{s'} T(s,π(s),s')[R + γ V_k(s')], until max_s |V_{k+1} − V_k| ≤ ε. In-place: usually faster, half the memory; the first crack in the idea that DP must proceed in lockstep. Act 4 widens it.
:::

### The gridworld — the source deck's worked example
::: widget mdp-pictures {"mode":"grid"}
Under the equiprobable random policy, what is $V^\pi$? Reward $-1$ on every move means $-V^\pi(s)$ is ==the expected number of steps a random walker takes to fall into a corner.==
:::

::: note
γ = 1 is admissible only because the policy being evaluated reaches a corner in finite expected time. Both corners are terminal, so value propagates inward from two sources. After one sweep every non-terminal state reads exactly −1: a step costs 1 and everything it can reach is still worth 0. After that the information moves one ring per sweep.
:::

### Watching the value propagate
{fill: top}

::: widget value-propagation {"mode":"eval"}
The deck's own figure, stepped. **Expectation backup** reproduces its printed table; switch to the **max backup** and the same sweep becomes value iteration, settling in three sweeps. The arrows are the greedy policy with respect to the numbers beside them, ==recomputed every sweep.==
:::

::: note
Expectation backup: −1.0, then −1.75 (printed as −1.7), then −2.4, and at last −14, −20, −22. Max backup: V* = minus the distance to the nearest corner.
:::

### The policy is optimal long before the value is
::: cols wide-r
::: col
::: figure.plain gridworld-sweeps | 260
:::
:::
::: col.accent What the blue cross says
At $k=3$ the values read $-2.4, -2.9, -3.0$ and are heading for $-14, -20, -22$. The greedy policy beside them is ==already optimal at every state== and never changes again.

::: reveal
::: keypoint
Evaluating to convergence was ==wasted work==. The $\argmax$ needs the values *ordered*, not converged.
:::
:::
:::
:::

::: note
The source deck draws the blue cross through the last two rows of its own figure. This is the licence for truncating the inner loop; everything in the rest of the act follows from it. It is also a warning: "the policy stopped changing" is a weaker certificate than "the value converged", and only the second bounds how suboptimal you might still be.
:::

### Policy improvement — greedy on your own value
::: widget backup-tree {"mode":"improve"}
We know how good it is to follow $\pi$ from $s$. Would it be better to take a different action at $s$, ==once==, and then follow $\pi$ as before?
:::

**Policy improvement theorem** — why the greedy step never hurts (proof in Backup 3):

$$\pi'(s)=\argmax_a Q^\pi(s,a) \;\Longrightarrow\; V^{\pi'}(s)\ge V^\pi(s)\ \text{ for every } s$$

::: note
The one-step inequality Q^pi(s,pi'(s)) ≥ V^pi(s) is cheap. The theorem is the leap from "one deviation" to "always", by telescoping. Equality at all states holds only when pi is already greedy with respect to its own value, which is exactly the Bellman optimality condition. A finite MDP has finitely many deterministic policies and each round strictly improves at least one state, so policy iteration terminates exactly.
:::

### Policy iteration — read the greedy policy off the value
::: figure.plain greedy-readoff | 620
One round: evaluate $\pi$ to get $V^\pi$, then at each cell point to the neighbour with the best value. ==Repeat until the arrows stop moving.==
:::

$$\pi_0 \xrightarrow{\;\text{evaluate}\;} V^{\pi_0} \xrightarrow{\;\text{improve}\;} \pi_1 \xrightarrow{\;\text{evaluate}\;} V^{\pi_1} \xrightarrow{\;\text{improve}\;} \pi_2 \longrightarrow \cdots \longrightarrow \pi^*$$

::: reveal
::: keypoint
Every *evaluate* arrow hides a whole iterative solve over the state set. ==Policy evaluation is slow to converge==, and the previous slide says most of that work is thrown away.
:::
:::

### Value iteration — one optimality backup per sweep
**Value iteration** — the Bellman optimality equation used as an update rule:

$$V_{k+1}(s)\leftarrow\max_a\sum_{s'}T(s,a,s')\big[R(s,a,s')+\gamma V_k(s')\big]$$

::: reveal
::: keypoint
Stop policy evaluation after one sweep and fold the improvement into it. Read the greedy policy off the final values.
:::
:::

::: note
Use V_k to score every action with a one-step lookahead; store the largest score as V_{k+1}(s); repeat. Lecture 8 replaces the model-weighted expectation with sampled transitions; tabular Q-learning first, a network later.
:::

### Two schedules, counted
{fill: top}

::: widget dp-schedules {"m":1}
One MDP, one stopping rule, both algorithms, and a dial for the number of evaluation sweeps per improvement. At $m=\infty$ the schedule *is* policy iteration; drive $m$ down and it slides toward value iteration. Same $V^*$, same $\pi^*$, an eightfold difference in work, and the cheapest schedule is ==neither endpoint.==
:::

::: note
Policy iteration reaches pi* in 9 improvements but spends 16,124 backups; value iteration needs 17 sweeps and 1,972 backups. The cheapest schedule is m = 2.
:::

## Act 4 — why it works
{short: ACT 4, num: Act 4}

**Q4.** Two processes that keep undoing each other, and an answer they nevertheless agree on.

### Generalised policy iteration — the dance behind both
{q: 4}

::: qstrip
:::

::: widget mdp-pictures {"mode":"gpi"}
Making $\pi$ greedy makes $V$ wrong for the new $\pi$; re-evaluating makes $\pi$ no longer greedy. The two processes meet only where ==both are satisfied at once.==
:::

::: reveal
::: keypoint
The meeting point is the solution of the Bellman optimality equation. Policy iteration and value iteration are two schedules of the same dance.
:::
:::

### Why the meeting point is unique — the contraction
**Contraction** — the one property the whole guarantee rests on (proof in Backup 2):

$$\lVert \mathcal T V - \mathcal T V'\rVert_\infty \;\le\; \gamma\,\lVert V - V'\rVert_\infty,\qquad (\mathcal T V)(s) = \max_a \sum_{s'} T(s,a,s')\big[R + \gamma V(s')\big]$$

::: reveal
Value iteration is $V_{k+1} = \mathcal T V_k$. Two value functions a distance $\delta$ apart are pushed to within $\gamma\delta$, so $\gamma<1$ buys three things at once:

- a **unique** fixed point $V^*$;
- **convergence from any $V_0$**;
- a **rate**: $\lVert V_k - V^*\rVert_\infty \le \gamma^k \lVert V_0 - V^*\rVert_\infty$.
:::

::: reveal
::: keypoint
$\gamma$ is not bookkeeping that keeps a sum finite. It is ==the number that makes the machine well-posed==, and it is also its convergence rate.
:::
:::

::: note
With γ = 0.8 and an initial error of 10 the bound gives 8, 3.3, 1.07 and 0.09 after 1, 5, 10 and 21 sweeps. An a posteriori certificate uses the Bellman residual: ‖V − V*‖ ≤ ‖TV − V‖ / (1 − γ). With γ = 1 the contraction argument no longer applies.
:::

### Check — what value iteration is really doing
{q: 3}

::: quiz For a finite MDP with bounded rewards and $0\le\gamma<1$, value iteration converges from any finite $V_0$. What guarantees that?
- The objective is convex in $V$
- The state space is finite
- =The Bellman operator is a $\gamma$-contraction in the sup-norm, so each sweep shrinks the distance to the unique fixed point by a factor $\gamma$
- The rewards are bounded, so $V$ cannot diverge
The Banach fixed-point theorem does the whole job. Each application of the operator brings any two value functions closer by a factor no greater than $\gamma$, which forces both a **unique** fixed point and convergence to it from anywhere. The error after $k$ sweeps decays like $\gamma^k$ — which is also why a $\gamma$ near 1 is not free, and why Lecture 8 has to worry when the operator is no longer a contraction.
:::

### The rate is the discount
{fill: top}

::: widget contraction-rate {"gamma":0.8,"seed":11}
$\lVert V_k - V^*\rVert_\infty$ against sweep number, on a log axis. The measured decay runs close to a straight line of slope $\log_{10}\gamma$ and always below the dashed bound. Move the dial and watch it tilt: ==far-sightedness is not free, and $\gamma$ is the invoice.==
:::

::: note
Reaching an error of 10^-3 takes 10 sweeps at γ = 0.5 and more than 60 at γ = 0.9.
:::

### Order does not matter either — asynchronous DP
::: widget mdp-pictures {"mode":"async"}
Every sweep so far updated all states in lockstep. Nothing required that: back states up in ==any order==, using the latest values, as long as every state is updated infinitely often.
:::

::: reveal
::: block The source deck's own arrow forward
"We can run the iterative DP algorithm at the same time that an agent is actually experiencing the MDP ==(reinforcement learning)==."
:::
:::

::: note
Backgammon has about 10^20 states and Go 3^361; one full sweep will not finish. Sampled RL is asynchronous DP driven by whichever states the trajectory visits. The "every state infinitely often" condition here is the ancestor of Lecture 8's exploration requirement.
:::

### Three things we have not paid for
The machine is complete and provably correct. Every part of it borrows something.

| what value iteration does | what it needs | what happens without it |
|---|---|---|
| $\sum_{s'} T(s,a,s')[\cdots]$ | ==the transition model $T$== | the expectation cannot be evaluated |
| $\argmax_a \sum_{s'} T[R+\gamma V(s')]$ | ==$T$ again, for the lookahead== | $V$ alone cannot name an action |
| one entry $V(s)$ per state | ==a table the size of $\mathcal S$== | no storage, and no generalisation to unseen states |

::: reveal
::: keypoint
Three debts, and the next lecture defaults on all three. The first two are the same debt, ==the model==, appearing once in evaluation and once in improvement.
:::
:::

### Check — what is still being assumed
{q: 4}

::: quiz Value iteration and policy iteration both solve the MDP exactly. What do they need that the next lecture will not have?
- A finite horizon
- A deterministic policy
- A discount factor strictly less than 1
- =The model — the transition probabilities $P$ and the reward function $R$, needed to compute the expectation
Every backup in this lecture evaluates $\sum_{s'} P(s' \mid s,a)[\ldots]$, which you can only write down if you own $P$ and $R$. Lecture 8 assumes the full model is unavailable and uses observed transitions, so the question becomes: how do you take an expectation you cannot compute? Sampling the backup is the starting point for the value-based methods in Lecture 8.
:::

## Closing
{short: CLOSING}

The equation is proved, the solvers are exact, and everything rested on owning the world.

### Where we are — one parent established
::: lineage mb-A
:::

::: reveal
We hold the Bellman equation, two exact solvers, and a convergence guarantee, and every line of it leaned on ==knowing $T$ and $R$==. Two roads lead out, and the course takes both.

::: cols
::: col.accent Down — Lecture 8
Keep the equation, ==delete the model==. Replace the expectation with a sample, $V$ with $Q$, the table with a network.
:::
::: col Right — Lecture 9
The *other* parent. Control theory solves the same dynamic problem with **continuous dynamics $f$** instead of finite tables, and Lecture 10 will delete $f$ exactly as Lecture 8 deletes $(T,R)$.
:::
:::
:::

### What Lecture 8 receives
{fill: tight, math: compact}

This lecture hands on ==the Bellman equation, which still needs the model:==

$$Q^*(s,a) \;=\; \sum_{s'} \hl{P(s'\mid s,a)}\Big[\,\hl{R(s,a,s')} + \gamma \max_{a'} Q^*(s',a')\,\Big]$$

::: reveal
| what we hand over | built in | what Lecture 8 does to it |
|---|---|---|
| the expectation $\sum_{s'} P(s'\mid s,a)[\cdots]$ | Act 2 | one sampled transition $(s,a,r,s')$ |
| policy evaluation, solved with $T,R$ | Act 3 | MC returns, or a TD bootstrap |
| greedy on $V$: $\argmax_a\sum_{s'}P[\cdots]$ | Acts 2–3 | greedy on $Q$ — the cache, now essential |
| value iteration | Act 3 | Q-learning: the same $\max$, sampled |
| the **full backup**, all successors | Act 3 | a sample backup, one successor |
| a table, exact, one entry per state | Acts 3–4 | a function $\hat Q(s,a;w)$ |

::: small
Column three is the whole of Lecture 8. Not one row changes the *principle*, only ==what we may look up.==
:::
:::

### A sequence of decisions seemed to need a plan for every possible future.
{layout: standout}

Bellman showed it needs only a **value for every state**, because an optimal plan, by its nature, stays optimal from wherever you happen to land.

### Questions?
{layout: standout}

Value, defined recursively, turns an intractable search over plans into local backups over states. It is the founding move of operations-research decision making, the equation Lecture 8 keeps after throwing the model away, and the problem Lecture 9 will solve all over again in a different language.

## Appendix — backup slides
{short: APPENDIX}

The worked arithmetic and the derivations, kept out of the narrative.

### Reading guide — understand the backup before the algorithm
{sub: one main idea to explain, one comparison, one application}

| Role | Read or revisit | Question to answer |
|---|---|---|
| **Core** | [Sutton & Barto, *Reinforcement Learning: An Introduction*, 2nd ed. (2018), Chapters 3–4](https://mitpress.mit.edu/9780262039246/reinforcement-learning/) | How does one expected return become a Bellman backup? |
| **Compare** | Policy iteration versus value iteration on the same MDP | Which operation evaluates a policy, and which improves it? |
| **Apply** | The gridworld, with the same transition and reward conventions | How many backups are needed before the preferred action changes? |

::: keypoint
Calculate one backup and two sweeps before reading the convergence proof.
:::

### Backup 1 — the Bellman equation, derived
{fill: top}

Start from the definition and peel off one step, using linearity of expectation and the Markov property:

$$\begin{aligned}
V^\pi(s) &= \E_\pi\Big[\textstyle\sum_{k\ge0}\gamma^k r_{t+k+1}\,\Big|\,S_t=s\Big]
= \E_\pi\Big[r_{t+1} + \gamma\textstyle\sum_{k\ge0}\gamma^k r_{t+2+k}\,\Big|\,S_t=s\Big]\\[2pt]
&= \sum_{s'} T(s,\pi(s),s')\Big[R(s,\pi(s),s') + \gamma\,\E_\pi\big[\textstyle\sum_{k\ge0}\gamma^k r_{t+2+k}\mid S_{t+1}=s'\big]\Big]\\[2pt]
&= \sum_{s'} T(s,\pi(s),s')\Big[R(s,\pi(s),s') + \gamma\, V^\pi(s')\Big] \qquad\blacksquare
\end{aligned}$$

The third line is where the Markov property is spent: the inner expectation depends on the whole history only through $s'$, so it *is* $V^\pi(s')$.

::: small
**Optimality form.** Maximise over the first action and use the principle of optimality for the remainder: $\pi(s)$ becomes $\max_a$ and $V^\pi$ becomes $V^*$. **$Q$ form.** Condition on $(s,a)$ before the transition instead of after it; the $\max$ then lands at the successor, $\max_{a'}Q^*(s',a')$, which is why $V^*$ maxes before the expectation and $Q^*$ after.
:::

### Backup 2 — the contraction proof
{fill: top}

**Claim.** $\lVert \mathcal T V - \mathcal T V'\rVert_\infty \le \gamma\lVert V - V'\rVert_\infty$, where $(\mathcal T V)(s)=\max_a\sum_{s'}T(s,a,s')[R+\gamma V(s')]$.

For any state $s$, using $\big|\max_a f(a) - \max_a g(a)\big| \le \max_a |f(a)-g(a)|$:

$$\begin{aligned}
\big|(\mathcal T V)(s) - (\mathcal T V')(s)\big|
&\le \max_a \Big|\sum_{s'} T(s,a,s')\,\gamma\,\big[V(s') - V'(s')\big]\Big|\\
&\le \gamma \max_a \sum_{s'} T(s,a,s')\,\big|V(s')-V'(s')\big|
\;\le\; \gamma \lVert V - V'\rVert_\infty
\end{aligned}$$

since $\sum_{s'}T(s,a,s')=1$. Taking the maximum over $s$ gives the claim. $\blacksquare$

::: small
**Consequence (Banach).** For $\gamma<1$, $\mathcal T$ has a unique fixed point $V^*$, and $V_{k+1}=\mathcal T V_k$ converges to it from any $V_0$ with $\lVert V_k - V^*\rVert_\infty \le \gamma^k\lVert V_0-V^*\rVert_\infty$. The $\max$ inequality is the only step that needs care. Q-learning combines this contraction with stochastic-approximation, coverage and step-size conditions (Lecture 8, Backup 2).
:::

### Backup 3 — policy improvement never hurts
{fill: top}

**Theorem.** Let $\pi'(s)=\argmax_a Q^\pi(s,a)$. Then $V^{\pi'}(s)\ge V^\pi(s)$ for all $s$.

By construction $Q^\pi(s,\pi'(s)) = \max_a Q^\pi(s,a) \ge Q^\pi(s,\pi(s)) = V^\pi(s)$. Now telescope, substituting that same inequality at each successor:

$$\begin{aligned}
V^\pi(s) &\le Q^\pi(s,\pi'(s)) = \E_{\pi'}\big[r_{t+1} + \gamma V^\pi(s_{t+1})\mid s_t=s\big]\\
&\le \E_{\pi'}\big[r_{t+1} + \gamma\, Q^\pi(s_{t+1},\pi'(s_{t+1}))\mid s_t=s\big]
= \E_{\pi'}\big[r_{t+1}+\gamma r_{t+2}+\gamma^2 V^\pi(s_{t+2})\mid s_t=s\big]\\
&\le \cdots \;\le\; \E_{\pi'}\big[r_{t+1}+\gamma r_{t+2}+\gamma^2 r_{t+3}+\cdots \mid s_t=s\big] \;=\; V^{\pi'}(s) \qquad\blacksquare
\end{aligned}$$

::: small
Each pass converts one more step of the trajectory from $\pi$ to $\pi'$, and the inequality never turns round. **Why policy iteration terminates.** A finite MDP has finitely many deterministic policies, and each improvement is strict unless $\pi$ is already greedy with respect to its own value, which is precisely the Bellman optimality condition.
:::

### Backup 4 — asynchronous and in-place DP
{fill: top}

**In-place value iteration.** Keep one array; overwrite $V(s)$ immediately and let later states in the same sweep read the new number. It converges, and usually faster, because fresh information propagates within a sweep instead of waiting for the next one. The sweep order now matters for *speed*, never for the answer.

**Asynchronous DP.** Back states up in any order, repeating some and skipping others. As long as every state is updated infinitely often, $V\to V^*$. This decouples the computation from any rigid sweep and is what lets DP be *prioritised*: order the backups by how large their Bellman residual was last time, and effort follows the states where the value is still wrong.

::: small
**Why it matters downstream.** Sampled RL is asynchronous DP whose update order is chosen for it by the environment: Q-learning backs up whatever $(s,a)$ the trajectory delivers. The "every state infinitely often" condition here is the model-based ancestor of the exploration requirement in Lecture 8, and the reason $\varepsilon$ must not reach zero too soon.
:::

### Backup 5 — one backup, worked: the temperature thread
{sub: shared teaching example · predict before revealing the calculation}

At $x=-2$, choose off ($u=0$) or heat ($u=1$). For now $x'=x+u$ is known. Reward $r=-[(x')^2+u^2]$, discount $0.9$, current continuation estimates $V(-2)=-3$, $V(-1)=-1$.

::: reveal
| Action | Reward | One Bellman target |
|---|---|---|
| Off | −4 | $-4+0.9(-3)=\mathbf{-6.7}$ |
| Heat | −2 | $-2+0.9(-1)=\mathbf{-2.9}$ |

This backup selects **heat**. The supplied values are inputs to this sweep, not a claim that convergence has occurred.
:::

::: reveal
**Try it.** Heat now reaches $x'=-1$ with probability $0.2$ and stays at $-2$ with probability $0.8$, still paying $u^2=1$. A failed step has reward $-5$ and target $-5+0.9(-3)=-7.7$; the heat target is $0.2(-2.9)+0.8(-7.7)=\mathbf{-6.74}$. Off gives $-6.7$, so this backup chooses **off**.
:::

::: keypoint
Changing a transition changes both the next-state cost and the continuation value. Take the expectation over complete outcomes.
:::

### Backup 6 — two sweeps: how a delayed reward reaches the action
Let $\gamma=0.9$. At **A**, stop for 2 or continue for 0 to B. At **B**, the only action pays 4 and terminates.

| synchronous sweep | value at A | value at B | greedy action at A |
|---|---|---|---|
| initial | 0 | 0 | stop: $2>0$ |
| first | $\max(2,0+0.9\cdot0)=2$ | 4 | continue: $3.6>2$ |
| second | $\max(2,0+0.9\cdot4)=3.6$ | 4 | continue |

::: keypoint
The first sweep discovers B's reward. The next sweep carries it back to A. At $\gamma=0.4$ continuing is worth only $1.6$, so stopping is optimal.
:::

### Where the two lineages split
{sub: the source deck's own taxonomy, pp. 4–5}

::: cols
::: col Model based — $T$ and $R$ given
| | finite actions | infinite actions |
|---|---|---|
| **discrete time** | ==MDP *(Lec 7)*== | dynamic system *(Lec 9)* |
| **continuous time** | continuous-time MDP | continuous-time system |

::: small
$P(s_{t+1}\mid s_t,a_t)$ &nbsp;·&nbsp; $x_{t+1}=f(x_t,u_t)$, $\dot x_t=f(x_t,u_t)$
:::
:::
::: col.accent Model free — learned from experience
| | finite actions | infinite actions |
|---|---|---|
| **discrete time** | ==value-based RL *(Lec 8)*== | policy-based RL *(Lec 10)* |
| **continuous time** | — | — |

::: small
The empty cells are outside this course's scope.
:::
:::
:::

::: reveal
These columns describe the examples chosen for this course: finite-action MDPs in Lecture 7 and continuous-control systems in Lecture 9. Lecture 9 is the mirror of this lecture, not its sequel.
:::
