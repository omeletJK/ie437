# Ch 7 source extract — `7. Markov Decision Process and Dynamic Programming.pdf`

54 pages, 960×540, PowerPoint 2019, 2023 Spring. Two numbered parts in the deck's own contents
(p.2): **1. Definition of Markov Decision Process** (pp. 3–15) and **2. Dynamic Programming
Approach** (pp. 16–54).

Mapping to the tex's four acts:

| PDF pages | tex act | what it carries |
|---|---|---|
| 1–6 | **Handoff** | the two taxonomy tables, the sequential-decision example |
| 7–15 | **Act 1** — the arena | Markov property, MDP tuple, reward/return/γ, policy |
| 16–21, 23–28 | **Act 1 / Act 2** | V^π and Q^π defined; the trajectory fan; the recursion |
| 22, 29–33 | **Act 2** — Bellman | expectation equation, optimality equation, greedy read-off |
| 33–51, 53 | **Act 3** — solving it | policy evaluation, improvement, policy iteration, value iteration |
| 52, 54 | **Act 4** — why it works | asynchronous DP; generalised policy iteration |

The tex has **no** page for: the two taxonomy tables (pp. 4–5), the graduate-school decision tree
(p. 6), the state/Markov examples (p. 7), the agent–environment interface (p. 10), the
stationarity slide (p. 11), the "goal of life" gag (p. 12), episodic-vs-continuing tasks (p. 13),
deterministic-vs-stochastic policies (p. 14), the trajectory fan (pp. 19–21, 24–26), the
two-arrays-vs-in-place update (p. 35), the numbers of the gridworld (pp. 36–37), the annotated
"you can stop evaluating early" figure (p. 49), or the asynchronous-DP → RL arrow (p. 52).
The tex *does* add the contraction / Banach material, which appears nowhere in the PDF.

---

## Part 0 · pp. 1–6 — the handoff

**p.1 — title.** IE437 Data-Driven Decision Making and Control, 2023 Spring. "7. Markov Decision
Process and Dynamic Programming." Jinkyoo Park, Associate Professor, ISysE, KAIST.

**p.2 — contents.** 1. Definition of Markov Decision Process · 2. Dynamic programming approach.

**p.3 — divider.** "1. Definition of Markov Decision Process".

**p.4 — Introduction · FIGURE (two nested tables).** ★ *The single most load-bearing figure in the
deck for the course spine, and the tex dropped it.*

Top table, 2×2, `Static/Dynamic` × `Single Agent/Multi Agent`:

|   | Single Agent | Multi Agent |
|---|---|---|
| Static | Static optimization | Static Game |
| Dynamic | **Dynamic Optimization** (highlighted blue) | Dynamic Game |

A wedge then zooms out of the highlighted **Dynamic Optimization** cell into a second table headed
**Model based** (in red), rows `Time space ∈ {Discrete, Continuous}`, columns
`Action space ∈ {Finite, Infinite}`:

|  Model based | Finite | Infinite |
|---|---|---|
| **Discrete** time | Discrete time **MDP**, $P(s_{t+1}\mid s_t,a_t)$ | Discrete-time **dynamic system**, $x_{t+1}=f(x_t,u_t)$ |
| **Continuous** time | Continuous time MDP, $P(s_{t+h}\mid s_t,a_t)$ | Continuous-time **dynamic system**, $\dot x_t=f(x_t,u_t)$ |

The whole right-hand (Infinite action space) column is shaded — it is the control-theory lineage,
Lecture 9. The top-left cell is this lecture. **The axis that separates Lecture 7 from Lecture 9
in the professor's own drawing is the size of the action space**, and the object that changes is
$P(s'\mid s,a)$ → $x_{t+1}=f(x_t,u_t)$.

**p.5 — Introduction · FIGURE (the same two tables, model-free).** Identical top table; the second
table is now headed **Model free** (in green) and only the Discrete-time row is filled:

|  Model free | Finite | Infinite |
|---|---|---|
| **Discrete** time | **Value-based** Reinforcement Learning | **Policy-based** Reinforcement Learning |
| Continuous time | *(blank)* | *(blank)* |

★ This is the professor's own derivation of the course's 2×2 lineage grid, and it says *why*
value-based and policy-based split: **finite vs. infinite action space**. That is exactly the
"continuous-argmax wall" Lecture 8 hands to Lecture 9. Restore both tables.

**p.6 — Introduction · FIGURE (decision tree) + text.** "Sequential Decision Making in
Uncertainties."
- Many important problems require the decision maker to make a series of decisions.
- It requires reasoning about future *sequences* of actions and observations.

The tree, with real numbers:

```
State: Senior year ──Action 1: Get a job              Reward: 4,000$ per/mon ──▶ …
                   ──Action 2: Go to graduate school  Reward:   500$ per/mon ──▶ State: grad student
                   ──Action 3: Start up company       Reward:     0$ per/mon ──▶ …

State: grad student ──Action: Publish X papers ──▶ {No job, Researcher, Professor,
                                                    Private company, Officer, House keeper}
```

Closing bullets: "taking an action might lead to any one of many possible states"; "how we can even
hope to act optimally in the face of randomness?"

★ **This is the myopic-greedy counterexample with numbers.** Greedy takes the $4{,}000$; the
optimal plan takes $500$ because of the *state it buys*. The tex asserts "a move that looks best
now can strand you in a state with no good future" abstractly — this slide is the concrete version.
Restore it.

---

## Part 1 · pp. 7–15 — the arena (Act 1)

**p.7 — State and Markov Property · FIGURE (two photographs).**
- The state is constructed and maintained on the basis of immediate sensations together with the
  previous state or some other memory of past sensations.
- An ideal state signal summarizes past sensations compactly, yet retains all relevant information.
- A state signal that succeeds in retaining all relevant information is said to be **Markov**.

Two examples: a flying cannonball, $s_t = (x_t, y_t, v_t)$ — "the location and velocity of the
flying cannon"; and a Go board — "$s_t$ = the configuration of the black and white stones."

**p.8 — The Markov Property.** Portrait of Andrey Markov (1856–1922).
- "Markov" generally means that *given the present state, the future and the past are independent*.
- For MDPs it means action outcomes depend only on the current state:

$$P(S_{t+1}=s' \mid S_t=s_t, A_t=a_t, S_{t-1}=s_{t-1}, A_{t-1}=a_{t-1},\dots,S_0=s_0,A_0=a_0)
= P(S_{t+1}=s'\mid S_t=s_t, A_t=a_t)$$

- **The consequence that matters:** "The best policy for choosing actions as a function of a Markov
  state is just as good as the best policy for choosing actions as a function of complete history":

$$\pi^*(s_t, s_{t-1},\dots,s_0) = \pi^*(s_t)$$

- Note: as states become more Markovian, the better the performance of the MDP solution; it is
  useful to think of the state at each time step as an *approximation* to a Markov state.

★ The second bullet is the licence for the whole lecture: it is *why* a value indexed by state
(rather than by history) is well-defined, and why a policy is a map $\mathcal S\to\mathcal A$.

**p.9 — Markov Decision Process · FIGURE (unrolled DBN).** Three rows of nodes across
$t-1, t, t+1$: $A_{t-1},A_t,A_{t+1}$ (action taken at time $t$); $R_{t-1},R_t,R_{t+1}$ (reward
received at time $t$); $S_{t-1},S_t,S_{t+1}$ (state at time $t$), with arrows $S_t\to A_t$,
$(S_t,A_t)\to R_t$, $(S_t,A_t)\to S_{t+1}$.

- Transition probability
  $T_t(s_t,a_t,s_{t+1}) = P(S_{t+1}=s_{t+1}\mid S_t=s_t, A_t=a_t) = P(s_{t+1}\mid s_t,a_t)$ —
  "represents the probability of transitioning from state $s_t$ to $s_{t+1}$ after executing action
  $a_t$ at time $t$ (Markov assumption)."
- Reward function $r_t = R_t(s_t,a_t)$.

★ This picture *is* Lecture 3's dynamic Bayesian network with a decision node and a utility node
per slice — the visual form of the Ch 3 debt. The two notations $T(s,a,s')$ and $P(s'\mid s,a)$
are declared equal here; Lecture 8 uses the $P$ form, so both must appear.

**p.10 — The Agent-Environment Interface.**
- The time steps $t=0,1,\dots$ need not refer to fixed intervals of real time: they can refer to
  arbitrary successive stages of decision-making and action.
- Actions can be low-level controls (voltages to a robot arm's motors) or high-level decisions
  (whether or not to go to graduate school).
- States can be completely determined by low-level sensations (sensor readings) or be high-level and
  abstract (an image, a mental status).
- The reward is a consequence of taking an action given a state; it can be specified according to
  the target task; maximizing reward should result in achieving the goals of the task.
- **In summary:** "Actions can be any decisions we want to learn how to make to affect rewards, and
  the states can be anything we can know that might be useful in making them."

**p.11 — (Stationary) Markov Decision Process · FIGURE.** A single collapsed slice: $A$, $R$, $S$,
$S'$. "Stationary MDP → transition and reward models are stationary": $T(s_t,a_t,s_{t+1})$ is the
same for all $t$; $r_t = R(s_t,a_t)$ is the same for all $t$.

★ Stationarity is what turns the unrolled chain of p.9 into a *single* recursive equation. Without
it there is one Bellman equation per time step.

**p.12 — Goal and Reward · FIGURE (agent/environment ladder).** Four repeated
`Agent —a_t, r_t→ Environment —s_t→` blocks marching right, arrowed to "Goals".
- The agent's goal is to maximize the total amount of reward (cumulative reward) it receives:
  $\max_{a_t,a_{t+1},\dots} \sum_k r_{t+k}$.
- Rewards we set up truly indicate what we want accomplished.
- ★ "The reward signal is your way of communicating to the agent **what** you want it to achieve,
  **not how** you want it achieved."
- The gag figure: $\max_{actions}\sum_{t=now}^{End of life} \text{Annual Income} = r_t$ →(?)→
  "The goal of life: Happy life".

**p.13 — Utility (Return).** "How to formally define the accumulated reward in the long run?"
- Reward $r_t = R(S_t,A_t)$.
- **Episodic tasks**, simplest utility: $U_t = r_t + r_{t+1} + \dots + r_T = \sum_{k=0}^{T} r_{t+k}$,
  $T$ the terminal step. Examples: maze, Go, chess.
- **Continuing tasks**, discounted utility:
  $U_t = r_t + \gamma r_{t+1} + \gamma^2 r_{t+2} + \dots = \sum_{k=0}^{\infty}\gamma^k r_{t+k}$.
- $\gamma\in[0,1]$ is the *discount rate*.
- $\gamma=0$ (**myopic**): concerned only with maximizing immediate rewards.
- $\gamma=1$ (**farsighted**): the objective takes future rewards into account more strongly.

★ Note the deck calls the return $U_t$ ("utility"), deliberately echoing Lecture 3's utility node.
The tex renames it $G_t$; both should be shown once so the Ch 3 join is visible.

**p.14 — Policy.** Small icons: Policy · Reward.
- A policy $\pi$ gives an action $a\in\mathcal A$ for each state $s\in\mathcal S$: $\pi:\mathcal S\to\mathcal A$.
- An optimal policy $\pi^*$ maximizes expected utility if followed:
  $\pi^* = \argmax_\pi \mathbb E[U^\pi(s)]$ **for all $s$**, where
  $\mathbb E[U^\pi(s)] = \mathbb E[r_t + \gamma r_{t+1} + \gamma^2 r_{t+2} + \dots]$.
- An optimal policy can be deterministic ($a^*=\pi^*(s)$, take $a^*$ with probability one) or
  stochastic ($p(a\mid s) = \pi^*(s,a)$).
- ★ "We will exclusively consider deterministic policy."

★ "for all $s$" is the whole difference from Lecture 1: not one optimum but a rule that is
simultaneously optimal from every state. That is the lecture's thesis in a subscript.

**p.15 — Summary: Markov Decision Process.** "Finite MDP: the state and action space are finite."
An MDP is defined by:
- a set of states $s\in\mathcal S$;
- a set of actions $a\in\mathcal A$;
- a transition function $T(s,a,s') = P(S_{t+1}=s'\mid S_t=s,A_t=a) = P(s'\mid s,a)$ — "probability
  that $a$ from $s$ leads to $s'$"; ★ "**also called the model or the dynamics**";
- a reward function $R(s,a,s')$, with $r_t=R(s_t,a_t,s_{t+1})$ or $r_{t+1}=R(s_t,a_t)$; if
  stochastic, $R(s,a,s') = \mathbb E[r_t\mid S_t=s,A_t=a,S_{t+1}=s']$;
- a start state $s_0\in\mathcal S$;
- a terminal state $s_T\in\mathcal S^+$ (episodic tasks).

"Goal of MDP is to find the optimal policy $\pi^*$ that maps the current state to the best action,
$a^*=\pi^*(s)$."

★ "also called **the model** or **the dynamics**" is the exact word Lecture 8 deletes. Quote it.

---

## Part 2a · pp. 16–28 — value, Q, and the recursion (Acts 1–2)

**p.16 — divider.** "2. Dynamic Programming Approach".

**p.17 — Value Function & Q Function.**
- Value function (state-value function for $\pi$): "How good it is for the agent to be in a given
  state." $V^\pi(s)$ is the expected utility received by following $\pi$ from $s$:
  $$V^\pi(s) = \mathbb E_\pi[U_t\mid S_t=s] = \mathbb E_\pi\Big[\sum_{k=0}^\infty \gamma^k r_{t+k}\Big| S_t=s\Big]$$
- ★ Footnote: "$\mathbb E_\pi$: **not** expectation over policy $\pi$ but all stochastic state
  transitions associated with $\pi$." (Consistent with the deterministic-policy choice on p.14.)
- Q-function (action-value function for $\pi$): "How good it is for the agent to perform a given
  action in a given state." $Q^\pi(s,a)$ is the expected utility of taking $a$ from $s$ and then
  following $\pi$:
  $$Q^\pi(s,a) = \mathbb E_\pi[U_t\mid S_t=s,A_t=a] = \mathbb E_\pi\Big[\sum_{k=0}^\infty \gamma^k r_{t+k}\Big|S_t=s,A_t=a\Big]$$
- "Because what the agent can expect to receive in the future depends on what actions it will take
  → value and Q functions are defined **with respect to a particular policy**."

**p.18 — Value Function · FIGURE (map).** A street map of the Daejeon / KAIST area with a closed
route drawn in red through five waypoints labelled $r_1,\dots,r_5$; the start of the route is
labelled $V^\pi(s)$. *The value of a state is the whole route you will travel from it, summed.*

★ Good prose image, not worth redrawing literally. Use the idea: a value is not a property of the
step you take, it is a property of the road you are on.

**p.19 — Value Function · FIGURE (trajectory fan).** "All possible trajectories." A three-ply tree,
columns $S_t\mid A_t\mid S_{t+1}\mid A_{t+1}\mid S_{t+2}$. From $s$: three actions $a_1,a_2,a_3$
each to a chance node $(s,a_i)$, each branching to $s_1,s_2$, each of those to three actions, then
to $s_1,s_2$ again. The full breadth of the future.

**p.20 — Value Function · FIGURE (fan, pruned by a policy).** Same tree, now with a policy given as
$\pi(s)=a_2$, $\pi(s_1)=a_1$, $\pi(s_2)=a_2$. The decision branches are pruned; only the chance
branches remain.

**p.21 — Value Function · FIGURE (fan collapsed).** The same tree reduced to a single decision node
and its two successors, with the values written on them:

$$V^\pi(s) = T(s,\pi(s),s_1)\big[R(s,\pi(s),s_1)+\gamma V^\pi(s_1)\big] + T(s,\pi(s),s_2)\big[R(s,\pi(s),s_2)+\gamma V^\pi(s_2)\big]$$

★ pp. 19→20→21 is the *derivation*, in three pictures: **all futures → the futures a policy allows
→ one step plus a value.** This is the single best teaching sequence in the deck and the tex
compressed it to one algebraic line. Restore it as the opening of Act 2.

**p.22 — The Bellman Equation for Value Function.** "Recursive Formulation (The Bellman equation)":

$$\begin{aligned}
V^\pi(s) &= \mathbb E_\pi\Big[\textstyle\sum_{k\ge0}\gamma^k r_{t+k}\,\Big|\,S_t=s\Big]\\
&= \mathbb E_\pi\Big[r_t + \gamma\textstyle\sum_{k\ge0}\gamma^k r_{t+1+k}\,\Big|\,S_t=s\Big]\\
&= \sum_{s'} T(s,\pi(s),s')\Big[R(s,\pi(s),s') + \gamma\,\mathbb E_\pi\big[\textstyle\sum_{k\ge0}\gamma^k r_{t+1+k}\mid S_{t+1}=s'\big]\Big]\\
&= \sum_{s'} T(s,\pi(s),s')\Big[R(s,\pi(s),s') + \gamma V^\pi(s')\Big]
\end{aligned}$$

★ In words on the slide: "The value of the start state must equal the (discounted) value of the
expected next state, plus the reward expected along the way."

Backup diagram beneath, with both node kinds named: **state node** $s$ → **chance node**
$(s,\pi(s))$ with branch weights $T(s,\pi(s),s')$ → successor states $s_1,s_2$ carrying
$V^\pi(s')$.

**p.23 — Value Function & Q-Function · FIGURE (map again).** The route map with
$V^\pi(s) = R(s,\pi(s),s') + \gamma V^\pi(s')$ overlaid: standing at a waypoint, the rest of the
journey is one leg plus the value of where that leg ends.

**pp.24–26 — Q-Function · FIGURES.** The identical three-picture sequence as pp.19–21, but the
first branch is left free instead of being pruned by $\pi$: all trajectories → policy given for
$s_1,s_2$ only → collapsed, giving

$$Q^\pi(s,a_2) = T(s,a_2,s_1)\big[R(s,a_2,s_1)+\gamma V^\pi(s_1)\big] + T(s,a_2,s_2)\big[R(s,a_2,s_2)+\gamma V^\pi(s_2)\big]$$

**p.27 — Q-Function.** The general form and the identity:

$$Q^\pi(s,a) = \sum_{s'} T(s,a,s')\big[R(s,a,s') + \gamma V^\pi(s')\big], \qquad
V^\pi(s) = \sum_{s'} T(s,\pi(s),s')\big[R+\gamma V^\pi(s')\big] = Q^\pi(s,\pi(s))$$

- "$Q^\pi(s,a)$ is more general since it has the option to select an action $a$ given state $s$."
- "If the action is enforced to select $a=\pi(s)$ according to the policy $\pi$, $V^\pi(s)=Q^\pi(s,\pi(s))$."

**p.28 — Summary for Value Function and Q-Function.** The three boxed equations of p.27 together
with the shared backup diagram. Nothing new.

---

## Part 2b · pp. 29–33 — optimality (Act 2)

**p.29 — Optimal Value Function & Q-Function.**
- Optimal policy: $\pi^*\ge\pi$ **if and only if** $V^{\pi^*}(s)\ge V^\pi(s)$ for all $s$.
- Optimal state-value function: $V^*(s)=\max_\pi V^\pi(s)$ for all $s$.
- Optimal action-value function: $Q^*(s,a)=\max_\pi Q^\pi(s,a)$ for all $s\in\mathcal S$, $a\in\mathcal A(s)$.
- ★ The derivation that lets the $\max_\pi$ move inside the expectation, written out:

$$\begin{aligned}
Q^*(s,a) &= \max_\pi Q^\pi(s,a) && \because Q^\pi(s,a)=\mathbb E[R(s,a,s')+\gamma V^\pi(s')\mid s_t=s,a_t=a]\\
&= \max_\pi \mathbb E[R(s,a,s')+\gamma V^\pi(s')\mid s_t=s,a_t=a] && \mathbb E \text{ is over the next state } s'\\
&= \mathbb E\big[R(s,a,s')+\gamma \max_\pi V^\pi(s')\mid s_t=s,a_t=a\big]\\
&= \mathbb E\big[R(s,a,s')+\gamma V^*(s')\mid s_t=s,a_t=a\big]
\end{aligned}$$

★ The third line is the principle of optimality, done as algebra: the expectation over $s'$ does
not depend on $\pi$, so the maximisation can be pushed past it and applied *at the successor*.
The tex states the principle in words and never shows this step. Restore it.

**p.30 — Bellman Optimality Equation for State-Value Function · FIGURE (backup diagram with a
max).** $V^*(s)$ at a state node with a $\max$ over $a_1,a_2,a_3$, each to a chance node
$Q^{\pi^*}(s,a_i)$, each branching to $s_1,s_2$ carrying $V^*(s')$. Derivation:

$$\begin{aligned}
V^*(s) &= \max_{a\in\mathcal A(s)} Q^{\pi^*}(s,a)
= \max_a \mathbb E_{\pi^*}\Big[\textstyle\sum_k\gamma^k r_{t+k}\mid S_t=s,A_t=a\Big]\\
&= \max_a \mathbb E_{\pi^*}\Big[r_t + \gamma\textstyle\sum_k \gamma^k r_{t+k+1}\mid S_t=s,A_t=a\Big]\\
&= \max_a \mathbb E\big[r_t + \gamma V^*(s_{t+1})\mid S_t=s,A_t=a\big]\\
&= \max_{a\in\mathcal A(s)} \sum_{s'} T(s,a,s')\big[R(s,a,s')+\gamma V^*(s')\big]
\end{aligned}$$

Marginal note: "First take optimum action and follow the optimum policy."

**p.31 — Bellman Optimality Equation (Q form) · FIGURE.** Backup diagram: $(s,a)$ → chance node →
$s_1,s_2$, and at **each** successor a $\max$ over $a'$ of $Q^*(s',a')$.

$$Q^*(s,a) = \mathbb E\big[r_t + \gamma \max_{a'} Q^*(s',a')\mid s_t=s,a_t=a\big]
= \sum_{s'} T(s,a,s')\big[R(s,a,s') + \gamma\max_{a'}Q^*(s',a')\big]$$

Marginal note: "First transits by transition probability and take the optimum action for each
consequent state." ★ Contrast with p.30's note — the two notes are the whole $V$/$Q$ difference:
$V^*$ maxes *before* the expectation, $Q^*$ maxes *after* it.

**p.32 — Summary.** Header: **"Optimum Planning as a Greedy Search."**
- Reconstructing the optimal policy from $Q^*$ and $V^*$:
  $$a^* = \argmax_a Q^*(s,a) = \argmax_a \mathbb E\big[R(s,a,s')+\gamma V^*(s')\mid s_t=s,a_t=a\big]$$
- ★ "Any greedy policy with respect to the optimal value function $V^*(s)$ is an optimal policy →
  because $V^*(s)$ already takes into account the reward consequences of all possible future
  behavior."
- ★ "**The Q function effectively caches the results of all one-step-ahead search.**"

★ Both starred lines are the exact hinge Lecture 8 turns on (its Act 2 says greedy-on-$V$ needs the
model, greedy-on-$Q$ does not). The second is the professor's own sentence; quote it verbatim.

**p.33 — Dynamic Programming.**
- ★ "The term dynamic programming (DP) refers to a collection of algorithms that can be used to
  compute optimal policies **given a perfect model of the environment as a Markov decision
  process**."
- "The key idea of DP (and reinforcement learning) is the use of **value functions to organize and
  structure the search for good policies**."
- "Optimal policies can be derived from the optimal value functions that satisfy the Bellman
  optimality equations":
  $$V^*(s)=\max_a \sum_{s'}T(s,a,s')[R+\gamma V^*(s')], \qquad
  Q^*(s,a)=\sum_{s'}T(s,a,s')[R+\gamma\max_{a'}Q^*(s',a')] = \sum_{s'}T(s,a,s')[R+\gamma V^*(s')]$$
  (using $V^*(s')=\max_{a'}Q^*(s',a')$), and
  $$\pi^*(s) = \argmax_a Q^*(s,a) = \argmax_a \sum_{s'}T(s,a,s')\big[R(s,a,s')+\gamma V^*(s')\big]$$

---

## Part 2c · pp. 34–51 — the two algorithms (Act 3)

**p.34 — Policy Evaluation.** "A method to compute the state-value function $V^\pi(s)$ for an
arbitrary policy $\pi:\mathcal S\to\mathcal A$."
$$V^\pi(s) = \sum_{s'}T(s,\pi(s),s')\big[R(s,\pi(s),s')+\gamma V^\pi(s')\big]$$
"➢ A system of $|\mathcal S|$ simultaneous linear equations in $|\mathcal S|$ unknowns."

Algorithm box:
```
Initialize V^π_{t=0}(s) ← 0 for all states s ∈ S
Repeat (iteration t = 0, …):
    For each state s:
        V^π_{t+1}(s) ← Σ_{s'} T(s,π(s),s') [ R(s,π(s),s') + γ V^π_t(s') ]
Until max_{s∈S} | V^π_{t+1}(s) − V^π_t(s) | ≤ e
```

★ "**Full backup**: Each iteration of iterative policy evaluation backs up the value of every state
once to produce the new approximate value function $V^\pi_{t+1}$." — the exact phrase Lecture 8's
translation table contrasts with "sample backup".

**p.35 — Policy Evaluation · FIGURE (two update schemes).** A worked instance,
$$V^\pi_{t+1}(s_2) = T(s_2,\pi(s_2),s_1)[R+\gamma V^\pi_t(s_1)] + T(s_2,\pi(s_2),s_3)[R+\gamma V^\pi_t(s_3)]$$
and two column diagrams side by side:
- **"Two-arrays" update** — read from the old array $V^\pi_t$, write into $V^\pi_{t+1}$.
- **"In place" update** — one array; the new $V(s_2)$ is written over the old and is read by later
  states in the same sweep. Annotated "**Usually faster! Less memory**".

★ The in-place variant is the first crack in the "lockstep sweep" idea, and the direct ancestor of
asynchronous DP on p.52 and of Q-learning's arbitrary update order. The tex has it in a backup slide.

**p.36 — Policy Evaluation · Example: Grid world.** $MDP=\{\mathcal S,\mathcal A,T,R,\gamma\}$ on a
$4\times4$ grid whose top-left and bottom-right cells are shaded (terminal); the other 14 are
numbered 1–14 in reading order.
- $\mathcal S=\{1,2,\dots,14\}$
- $\mathcal A=\{\uparrow,\downarrow,\rightarrow,\leftarrow\}$
- $T(s,s',a)=1$ if the move is allowed, $0$ otherwise. Examples given: $T(5,6,\rightarrow)=1$;
  $T(5,10,\rightarrow)=0$; $T(7,7,\rightarrow)=1$. "The actions that would take the agent off the
  grid leave the state unchanged."
- $R(s,s',a) = -1$ for all $s,s',a$.
- $\gamma = 1$.
- "Suppose the agent follows the **equiprobable random policy** (all actions equally likely), what
  is the value function?"

**p.37 — Policy Evaluation · FIGURE (Sutton & Barto Fig. 4.1).** ★ The central worked example.
Two columns, "$v_k$ for the Random Policy" and "Greedy Policy w.r.t. $v_k$", for
$k=0,1,2,3,10,\infty$. Every number, as printed:

| $k$ | $v_k$ (4×4, row-major) |
|---|---|
| 0 | `0.0 0.0 0.0 0.0 / 0.0 0.0 0.0 0.0 / 0.0 0.0 0.0 0.0 / 0.0 0.0 0.0 0.0` |
| 1 | `0.0 -1.0 -1.0 -1.0 / -1.0 -1.0 -1.0 -1.0 / -1.0 -1.0 -1.0 -1.0 / -1.0 -1.0 -1.0 0.0` |
| 2 | `0.0 -1.7 -2.0 -2.0 / -1.7 -2.0 -2.0 -2.0 / -2.0 -2.0 -2.0 -1.7 / -2.0 -2.0 -1.7 0.0` |
| 3 | `0.0 -2.4 -2.9 -3.0 / -2.4 -2.9 -3.0 -2.9 / -2.9 -3.0 -2.9 -2.4 / -3.0 -2.9 -2.4 0.0` |
| 10 | `0.0 -6.1 -8.4 -9.0 / -6.1 -7.7 -8.4 -8.4 / -8.4 -8.4 -7.7 -6.1 / -9.0 -8.4 -6.1 0.0` |
| ∞ | `0.0 -14. -20. -22. / -14. -18. -20. -20. / -20. -20. -18. -14. / -22. -20. -14. 0.0` |

The $k=0$ policy column is annotated "random policy"; the $k=3$, $k=10$ and $k=\infty$ policy
columns are all annotated "**optimal policy**" with arrows pointing at them.

*Reproduced independently (`/tmp/ie437-ch07/verify1.mjs`): every figure matches to the printed
precision. The one apparent discrepancy is $k=2$, where the exact value is $-1.75$ — the figure
truncates, giving $-1.7$, while ordinary rounding gives $-1.8$.*

**p.38 — Policy Improvement · FIGURE.** One state $s$ with three chance nodes
$Q^\pi(s,a_1), Q^\pi(s,a_2), Q^\pi(s,a_3)$; $a_2=\pi(s)$ is marked, and beside it
$V^\pi(s)=Q^\pi(s,\pi(s))$.
- "We know how good it is to follow the current policy from $s$ based on $V^\pi(s)$."
- "Would it be better or worse to change to the new policy? → Select $a$ given $s$ and thereafter
  following the existing policy $\pi$ (**a single step change**)."

**pp.39–40 — Policy Improvement · FIGURES.** The same diagram twice, first highlighting the $a_1$
branch and asking $Q^\pi(s,a_1)\ge V^\pi(s)=Q^\pi(s,\pi(s))$?, then the $a_3$ branch and asking the
same. The comparison, made one action at a time.

**p.41 — Policy Improvement.** $\pi'(s)=\argmax_{a\in\mathcal A(s)} Q^\pi(s,a)$, hence
$Q^\pi(s,\pi'(s))\ge Q^\pi(s,\pi(s))=V^\pi(s)$ — set beside the static analogue in a box on the
right: $x^*=\argmax_x f(x) \Rightarrow f(x^*)\ge f(x)$ for all $x$.
★ *The professor's own explicit link back to Lecture 1: policy improvement is `argmax` over a
finite set, done once per state.*
- "Improvement criterion = expected reward provided by changing one step action and following the
  original policy."
- The leap, posed as a question with a red "?": "If it is better to select $a=\pi'(s)$ **once** in
  $s$ and thereafter follow $\pi$ than it would be to follow $\pi$ all the time, **is it better
  still** to select $a=\pi'(s)$ whenever $s$ is encountered?"

**p.42 — Policy Improvement.** Same slide, with the answer: the **policy improvement theorem** —
"Policy improvement must give us a strictly better policy $\pi'(s)$ than the older policy $\pi(s)$
except when the original policy is already optimal, $\pi(s)=\pi^*(s)$":
$$Q^\pi(s,\pi'(s)) \ge V^\pi(s) \;\Rightarrow\; V^{\pi'}(s)\ge V^\pi(s) \text{ for all } s\in\mathcal S
\quad\text{i.e. } \pi'\ge\pi$$

**p.43 — Policy Improvement · the proof, in full.** ★ The telescoping argument, every line:

$$\begin{aligned}
V^\pi(s) &\le Q^\pi(s,\pi'(s)) &&\text{given}\\
&= \mathbb E_{\pi'}\big[r_{t+1}+\gamma V^\pi(s_{t+1})\mid s_t=s\big] &&\mathbb E_{\pi'}\text{ over } s_{t+1}\text{ induced by }\pi'\\
&\le \mathbb E_{\pi'}\big[r_{t+1}+\gamma Q^\pi(s_{t+1},\pi'(s_{t+1}))\mid s_t=s\big] &&\because Q^\pi(s_{t+1},\pi'(s_{t+1}))\ge V^\pi(s_{t+1})\\
&= \mathbb E_{\pi'}\big[r_{t+1}+\gamma\,\mathbb E_{\pi'}[r_{t+2}+\gamma V^\pi(s_{t+2})]\mid s_t=s\big]\\
&= \mathbb E_{\pi'}\big[r_{t+1}+\gamma r_{t+2}+\gamma^2 V^\pi(s_{t+2})\mid s_t=s\big]\\
&\le \mathbb E_{\pi'}\big[r_{t+1}+\gamma r_{t+2}+\gamma^2 Q^\pi(s_{t+2},\pi'(s_{t+2}))\mid s_t=s\big]\\
&\;\;\vdots\\
&= \mathbb E_{\pi'}\big[r_{t+1}+\gamma r_{t+2}+\gamma^2 r_{t+3}+\gamma^3 r_{t+4}+\cdots\mid s_t=s\big]
= V^{\pi'}(s)
\end{aligned}$$
"Thus $\pi\le\pi'$."

★ The rhythm is the point: *substitute, expand, substitute, expand* — each substitution converts one
more step from $\pi$ to $\pi'$, and the inequality never turns round.

**p.44 — Policy Improvement (algorithm).** "The process of making a new policy $\pi^{new}$ that
improves the original policy $\pi$, by making it greedy or nearly greedy with respect to the value
function of the original policy."
```
Input : value of policy V^π(s)
Output: new policy π'
For each state s ∈ S
  1. Compute Q^π(s,a) = Σ_{s'} T(s,a,s')[R(s,a,s') + γ V^π(s')] for each a
  2. Compute π'(s) = argmax_{a∈A(s)} Q^π(s,a)
              = argmax_{a∈A(s)} Σ_{s'} T(s,a,s')[R(s,a,s') + γ V^π(s')]
```
★ Step 1 is a full one-step lookahead through $T$, per action. It is the line Lecture 8 cannot
execute.

**p.45 — Policy Iteration.** "Iterative way of finding the optimum policy through a sequence of
policy evaluation and policy improvement":
$$\pi_0 \xrightarrow{PE} V^{\pi_0} \xrightarrow{PI} \pi_1 \xrightarrow{PE} V^{\pi_1} \xrightarrow{PI} \pi_2 \xrightarrow{PE} V^{\pi_2}\cdots$$
```
π ← arbitrary
For t = 1, …, t_PI (or until π stops changing)
    Run policy evaluation to compute V^π
    Run policy improvement to get new improved policy π'
    π ← π'
```
- "Policy evaluation requires iterative computation, requiring multiple sweeps through the state set."
- ★ "Policy evaluation **starts with the value function for the previous policy** → Fast convergence."
  (The warm start: the reason PI's inner loop is not as bad as it looks.)

**p.46 — Policy Iteration.** The same two nested loops written out as one algorithm — inner loop
"For $t=0,\dots$ until convergence, for each state $s$: $V^\pi_{t+1}(s)\leftarrow\sum_{s'}T(s,\pi(s),s')[R+\gamma V^\pi_t(s')]$",
producing "Converged state value function $V^\pi(s)$", then the outer improvement sweep.
★ Boxed **"Issues:"** "Policy evaluation requires iterative computation, requiring multiple sweeps
through the state set → **slow to converge**." — the motivation for value iteration.

**p.47 — Policy Iteration · FIGURE.** The Fig. 4.1 panel again on the left, and on the right a
zoomed pair: the converged $V^\pi$ of the random policy
(`0.0 -14 -20 -22 / -14 -18 -20 -20 / -20 -20 -18 -14 / -22 -20 -14 0.0`) with the cell holding
$-18$ highlighted in pink and two red arrows leaving it (up to $-14$, left to $-14$), and the
resulting $\pi'$ grid beside it with that cell's arrow now `↰` (up-or-left). A red curved arrow
labels the map $V^\pi(s)\mapsto\pi'(s)$. *Policy improvement, in one cell.*

**p.48 — Policy Iteration.** Repeat of p.46 with the "Issues" box.

**p.49 — Policy Iteration · FIGURE.** ★★ The Fig. 4.1 panel, annotated. A pink vertical band runs
down the $v_k$ column; a pink horizontal arrow crosses from the $k=3$ value grid to the $k=3$ policy
grid; and a large **blue X** is drawn over the $k=10$ and $k=\infty$ rows.

**The claim: you never needed to evaluate to convergence. The greedy policy is already the optimal
policy at $k=3$, while the values are still at $-3.0$ and will not reach $-22$ for many more
sweeps.** This is the whole justification for truncating policy evaluation, and it is the deck's
best slide. The tex dropped it entirely.

*Verified (`verify1.mjs`): greedy($v_2$) is **not** optimal at every state; greedy($v_3$) **is**,
and equals greedy($v_\infty$). So $k=3$ is exactly the first sweep at which the annotation holds.*

**p.50 — Value Iteration.** "Solution: stop policy evaluation after just one sweep (one backup of
each state); combine one sweep of policy evaluation and one sweep of policy improvement." The
derivation is drawn as an addition:
$$\underbrace{V_{t+1}(s)\leftarrow\sum_{s'}T(s,\pi(s),s')[R+\gamma V_t(s')]}_{\text{one evaluation sweep}}
\;+\;\underbrace{\pi'(s)=\argmax_a\sum_{s'}T(s,a,s')[R+\gamma V_{t+1}(s')]}_{\text{one improvement sweep}}
\;\longrightarrow\; V_{t+1}(s)\leftarrow\max_a\sum_{s'}T(s,a,s')[R+\gamma V_t(s')]$$
"or, can be obtained simply by **turning the Bellman optimality equation into an update rule**."

**p.51 — Value Iteration (algorithm).**
```
Initialize V(s) ← 0 for all states s ∈ S
Repeat
    For each state s:
        V(s) ← max_a Σ_{s'} T(s,a,s')[ R(s,a,s') + γ V(s') ]
Until max_{s∈S} | V_t(s) − V_{t−1}(s) | ≤ e
```
"Optimum policy can be obtained from the converged $V^*(s)$:
$\pi^*(s)=\argmax_a\sum_{s'}T(s,a,s')[R(s,a,s')+\gamma V^*(s')]$."
★ The policy is read off **only at the end** — the contrast with PI, which carries an explicit
policy throughout.

---

## Part 2d · pp. 52–54 — beyond the sweep (Act 4)

**p.52 — Asynchronous DP Algorithm · FIGURE.** "A major drawback to the DP methods is that they
involve operations over the **entire state set** of the MDP." Two column diagrams, "Conventional DP"
(a sweep arrow running down $s_1\dots s_N$) and "Asynchronous DP" (no sweep).
- Backgammon has $10^{20}$ states; Go has $3^{19\times19}$ states.
- "Take forever to sweep all states."
- "Does not improve policy until value functions are fully backed up."
- Asynchronous DP: "Back up the values of states **in any order whatsoever**, using whatever values
  of other states happen to be available." / "Allow great flexibility in selecting states to which
  backup operations are applied."
- ★ "Make it easier to intermix computation with real-time interaction: To solve a given MDP, we can
  run the iterative DP algorithm **at the same time that an agent is actually experiencing the MDP
  (Reinforcement Learning !!!!)**"

★ The professor's own arrow to Lecture 8, exclamation marks included. Sampled RL *is* asynchronous
DP driven by whatever states the trajectory visits. This is the deck's own statement of the join
and the tex hid it in a backup slide.

**p.53 — Summary · FIGURE (nested boxes).** The four algorithms drawn as a containment hierarchy:
policy evaluation + policy improvement together are boxed as **Policy Iteration**; inside/beside it
**Value Iteration** ($V_{t+1}(s)\leftarrow\max_a\sum_{s'}T[R+\gamma V_t]$); inside that
**Asynchronous Value Iteration** ("For any single state $s$: $V(s)\leftarrow\max_a\sum_{s'}T[R+\gamma V(s)]$").
Closing line: "As long as both processes continue to update all states, the ultimate result is
typically the same — convergence to the optimal value function and an optimal policy."

**p.54 — Generalized Policy Iteration · FIGURE.** ★ The two-lines picture. A grey line labelled
"Solution of policy evaluation, $V=V^\pi$" descending from upper-left; a red line labelled
"Solution of policy improvement, $\pi=greedy(V)$" ascending from lower-left; the two converge at the
right to a point marked $V^*,\pi^*$ and annotated in red "**Stabilized (solution of Bellman
optimality equation)**". A zigzag of arrows starting at "Start $V,\pi$" bounces alternately between
the two lines, the bounces getting shorter as they approach the meeting point.

Bullets:
- "Making policy greedy with respect to the value function typically makes the value function
  incorrect for the changed policy."
- "Making the value function consistent with the policy typically causes that policy no longer to be
  greedy."
- "In the long run, however, these two processes interact to find a **single joint solution**: the
  optimal value function and optimal policy."

★ The deck ends here. **There is no contraction, no Banach fixed-point theorem, and no convergence
rate anywhere in the PDF** — the tex's Act 4 supplies them. So Act 4 is: the PDF's GPI picture
(*why the two forces have a joint fixed point*) followed by the tex's contraction (*why that fixed
point is unique, and how fast you reach it*).

---

## Numerical checks run against this deck

All in `/tmp/ie437-ch07/`, plain `node`, no dependencies.

| script | claim checked | result |
|---|---|---|
| `verify1.mjs` | p.37's six value grids, $k=0,1,2,3,10,\infty$ | reproduce exactly ( $k{=}2$ is $-1.75$, printed truncated as $-1.7$ ) |
| `verify1.mjs` | p.49's annotation: greedy($v_k$) optimal from $k=3$ | greedy($v_2$) not optimal; greedy($v_3$) optimal everywhere ✓ |
| `verify2.mjs` | the max-backup on the same grid | converges in exactly 3 sweeps to $V^*$ = −(steps to nearest terminal) |
| `verify2.mjs` | policy evaluation of an improper policy at $\gamma=1$ | does not converge — the warm-start caveat p.45 hides |
| `verify6.mjs` | PI vs VI cost, 6×6 slip-0.2 grid, $\gamma=0.9$, tol $\lVert V-V^*\rVert_\infty\le0.01$ | VI 17 sweeps / 1 972 backups; PI 9 improvements / 16 124 backups; same $V^*,\pi^*$ |
| `verify6.mjs` | modified PI with $m$ evaluation sweeps | $m{=}2$ is cheapest (1 740); $m{=}1\to$ VI, $m{=}\infty\to$ PI |
| `verify7.mjs` | $\lVert V_k-V^*\rVert_\infty$ slope on a log axis | measured slope $=\log_{10}\gamma$ to 5 d.p. for $\gamma=0.5,0.8,0.95$; the bound $\gamma^k\lVert V_0-V^*\rVert$ holds at every $k$ |
| `verify7.mjs` | corridor discount threshold (+1 near, +10 far) | the start cell flips at $\gamma=10^{-1/5}=0.6310$, its neighbour at $10^{-1/3}=0.4642$ |
