---
ch: 0
title: Data-Driven Decision Making and Control
subtitle: Deciding well under uncertainty — three criteria, four categories, four real systems
tagline: The map — how every chapter fits one story, and what each one decided in the field
blurb: >-
  The whole course on one picture: a cube whose three axes are the three ways a decision problem
  gets harder. Every later lecture is placed at a corner of it, and four working systems — wind
  farms, traffic signals, a semiconductor furnace, a robot fleet — show what the methods decided
  in the field.
course: IE437 · Data-Driven Decision Making and Control
author: Jinkyoo Park
institute: KAIST — Industrial & Systems Engineering
inherits: —
handoff: the three-axis cube, and the route through it (Lecture 1)
---

### Data-Driven Decision Making and Control
{layout: title}

## The one question
{num: 01}

Every lecture this term is the same question, asked again with one more thing made harder.

### What this course is about — in one sentence

::: keypoint
How do we make ==good decisions under uncertainty?==
:::

::: reveal
That is the entire course. Every lecture is this question, asked again with one more thing taken away — the model made uncertain, the dynamics unknown, the world shared with rivals.
:::

::: reveal
::: small
Two disciplines answer it differently, and this course lives where they meet — ==decision-centric AI==: use data and learning to make high-dimensional decisions that classical optimisation alone could not reach.
:::
:::

### AI, decision making, and what joins them

::: widget ai-vs-decision
:::

### From a real system to a solved problem

::: widget modeling-loop
Formulation and solution are two different arrows, policed by two different questions. ==Data helps on the left arrow too== — a model fitted to data represents the world more faithfully, not merely faster.
:::

### Engineering is all about decision making
{sub: p. 7 of the source deck — the zoo, and the two questions that organise it, fill: center}

::: cols wide-l
::: col The methods you will meet under one name or another
Machine learning · artificial intelligence · optimisation · optimal control · planning · Markov decision process · influence diagram · decision tree · dynamic control · **game theory** · search · stochastic programming · dynamic programming · reinforcement learning · the bandit problem · …
:::
::: col.accent Two questions
What are the ==differences== between these strategies?

What are the ==common aspects==?
:::
:::

::: reveal
::: keypoint
A course that answers only the first question is a catalogue. ==This one answers the second first.==
:::
:::

### Two kinds of uncertainty — name them once

::: lede
Everything we model is uncertain in one of two ways. The distinction recurs all term.
:::

- **Aleatoric** (statistical) uncertainty — the world is genuinely stochastic. Repeating the experiment gives different outcomes. No amount of data removes it; we can only *characterise* it, as a distribution.
- **Epistemic** (systematic) uncertainty — we simply *don't know* the model: its parameters, its state, its dynamics. Data ==reduces== it.

::: reveal
::: keypoint
The whole course is a campaign against ==epistemic== uncertainty.
:::
:::

::: reveal
::: small
Learning the parameter (Ch 2), the structure (Ch 3), the function (Ch 4), the design map (Ch 5–6), the dynamics (Ch 8–11) — while *respecting* the aleatoric uncertainty that no data can erase.
:::
:::

## Three criteria, four categories
{num: 02}

Decision making under uncertainty, split by three questions — and the four cells this course actually visits.

### The three criteria
{sub: p. 8 of the source deck — the sentence the whole taxonomy hangs on}

::: lede
"Decision making under uncertainties." Three questions divide every method in the zoo, and the answers are independent of one another.
:::

::: table center
| # | the criterion | one end | the other end |
|---|---|---|---|
| **1** | Is the **model** known? | model-based — handed to us | ==data-driven== — learned from data |
| **2** | How many **stages**? | static — one decision | ==dynamic== — a sequence |
| **3** | How many **decision makers**? | single agent — an optimum | ==many agents== — an equilibrium |
:::

::: reveal
::: small
Criterion 1 is where the two uncertainties live: epistemic uncertainty is exactly *not knowing the model*, and it is the axis this course is named after. Criteria 2 and 3 say what shape the problem has once you do know it.
:::
:::

### Three criteria make a cube

::: widget course-cube
The origin is plain optimisation. Step through the numbered route — ==step ④ is the one to watch==, where the data-driven axis is crossed a second time and the count of unknowns doubles.
:::

### Criterion 1 — model-based becomes data-driven
{sub: the deepest axis, and the course's namesake}

Two ways to know the world you decide in:

- **Model-based** — the objective, constraints, transition and dynamics are *given*. You compute the optimum. {p}(Lectures 1, 7, 9)
- **Data-driven** — you have only *data*. You must learn enough of the world to act: a belief (Ch 2–4), a surrogate (Ch 5–6), a value or a policy (Ch 8, 10, 11).

::: reveal
::: block The move that defines the course
Take a model-based method, ==delete the model==, and replace it with data.

$$\text{optimisation} \to \text{Bayesian optimisation} \qquad \text{DP} \to \text{value-based RL} \qquad \text{optimal control} \to \text{policy-based RL}$$
:::
:::

::: reveal
::: small
Almost every lecture *pair* in this course is one instance of this single move.
:::
:::

### Criterion 2 — static becomes dynamic

::: table center
|   | Single agent | Multi agent |
|---|---|---|
| **Static** | ==optimisation== | static game |
| **Dynamic** | ==dynamic optimisation / control== | dynamic game |
:::

::: reveal
**Static** — one decision. You choose $x$ once; the world does not move. This is classical optimisation (Lecture 1) and its uncertain, data-driven cousins (Lectures 2–6).

**Dynamic** — a sequence. Each decision reshapes the state the next one faces. This is the realm of MDPs, optimal control and reinforcement learning (Lectures 7–11).
:::

::: reveal
::: keypoint
The single optimisation splits into time — and ==the value function is born.==
:::
:::

### Criterion 3 — one decision maker becomes many

::: table center
|   | Optimisation | Game |
|---|---|---|
| **single objective** | one optimum $x^*$ | — |
| **coupled objectives** | — | ==equilibrium (Nash, …)== |
:::

::: reveal
When other agents — also optimising, also learning — share the world, the very notion of "optimal" changes. There is no single best action independent of what the others do. The solution concept shifts from an ==optimum== to an ==equilibrium==.
:::

::: reveal
::: small
This course stops before that axis. Crossing it is the subject of the follow-on course, ==IE579 Game Theory and Multi-Agent Reinforcement Learning== — and the cube above shows exactly which face it takes over. Naming the axis here is what makes the boundary of this course legible.
:::
:::

### The four categories, and the four systems that prove them
{sub: pp. 13–16, 19, 57–58 of the source — the badges ①②③④ you will see all term}

::: table center
| | category | what is given | lectures | the system it decided |
|---|---|---|---|---|
| **①** | Fundamentals — static, model-based | the model | 1–3 | *the template every other cell inherits* |
| **②** | Data-driven **static** decision making | data only | 4–6 | ==wind farm layout== · ==traffic signal split== |
| **③** | Fundamentals — dynamic, model-based | the model, over time | 7, 9 | *the template Part IV deletes* |
| **④** | Data-driven **dynamic** decision making | data only, over time | 8, 10–12 | ==semiconductor furnace== · ==offline meta control== |
:::

::: reveal
::: keypoint
The rest of this lecture walks the four categories — and shows, for each, ==a system where the decision was actually made.==
:::
:::

## Categories ① and ② — the static half
{num: 03}

One decision, made once. First with the model in hand, then with nothing but data — and two systems that were decided this way.

### ① Fundamentals — optimisation, and belief
{sub: Lectures 1–3 · static, model-based}

Given a model, a decision is a program:

$$\min_x\; f(x) \quad \text{s.t.}\quad g(x)\le 0,\; h(x)=0$$

::: reveal
Make the model *uncertain* rather than absent and the same program acquires a belief. Bayes' rule is how the belief moves:

$$p(\theta\mid \text{data}) = \frac{p(\text{data}\mid\theta)\,p(\theta)}{p(\text{data})}$$
:::

::: reveal
::: small
Lecture 2 carries the belief over one parameter; Lecture 3 gives it structure, and then adds decision and utility nodes — at which point the graph *is* a one-stage decision problem.
:::
:::

### From a Bayesian network to a decision
{sub: p. 18 of the source — a chance node, a decision node, a utility node}

::: figure decision-network | 900
Add a **decision** node and a **utility** node to a Bayesian network and you have an ==influence diagram== — which is already a one-stage MDP. Lecture 7 does nothing but add time to this picture.
:::

### ② Data-driven static — three routes when the model is gone
{sub: pp. 19 and 32 of the source · static, data-driven}

::: flow
- !**Online** | *Bayesian optimisation* — you may still query the system, so choose the next query well **(Ch 4)**
- **Offline · surrogate** | fit a forward model $\hat f$ to a fixed dataset, then search it **(Ch 5)**
- **Offline · generative** | learn the inverse map and *sample* good designs **(Ch 6)**
:::

::: reveal
::: small
And a fourth, which the field cares about most: ==offline meta optimisation with online adaptation== — learn across many past tasks, then adapt to today's in a handful of trials. The traffic-signal case below is exactly this.
:::
:::

### Case A · Wind farm layout
{sub: Application Example 1 — where do N turbines go, when each steals wind from the next?}

::: figure windfarm-overview | 900
The decision is $\mathbf{x}$, the turbine positions. The obstacle is that power $P_i(\mathbf{x};\theta, U)$ has no closed form: turbines sit in each other's ==wake==, so the objective couples every pair.
:::

### The farm is a graph, so the model should be one

::: cols
::: col The representation
::: figure windfarm-graph
:::
:::
::: col.accent Why a graph network
Nodes are turbines and carry free-flow wind speed; edges carry the ==down-stream wake distance $d$ and radial distance $r$==; the global feature is the wind itself.

A GNN is permutation-invariant and takes any $N$ — so one trained model serves a five-turbine farm and a twenty-turbine farm.
:::
:::

### Physics-induced graph network — do not learn what you already know

::: figure pgnn-model | 900
Four trainable modules and three aggregators, stacked. The edge update is where the physics enters: $\mathbf{e}'_{ij} = f_w(\mathbf{e}_{ij}) \times f_e(\cdot)$, with $f_w$ a ==wake weight== rather than a free function.
:::

### Let the network learn $\alpha, \kappa, R_0$

::: figure physics-weight | 900
The classical wake model gives the deficit $\delta u(d,r)$ in closed form, but its constants were ==hand-tuned to observed data==. Keep the functional form, and learn the constants. This is the whole idea of an inductive bias, in one figure.
:::

### Does it work — and then, does it decide?

::: cols
::: col Prediction
::: figure windfarm-accuracy
:::
==1.5% MAPE== on farm power.
:::
::: col.accent Decision
::: figure windfarm-layout-opt
:::
Total power ==7.5 → 20.0== over the optimisation, by gradient — because the surrogate is differentiable.
:::
:::

::: reveal
::: small
This is Lecture 5's thesis arriving early: a surrogate is worth building when it turns a problem you could only *simulate* into one you can *differentiate*. The warning that comes with it — that the optimiser will exploit the surrogate wherever it is wrong — is Lecture 5's other half.
:::
:::

### Case B · Traffic signal split
{sub: Application Example 2 — offline meta data-driven optimisation}

::: figure traffic-cities | 900
The same decision — the green split at every intersection — in Hangzhou, Manhattan and two synthetic districts. ==Every intersection is a new task==, and you cannot run a thousand trials on a live junction.
:::

### Why *meta* Bayesian optimisation

::: figure bo-vs-metabo | 900
Ordinary BO starts each new intersection from a prior that knows nothing. ==Meta-BO pre-trains $f_\theta$ on a buffer of past tasks==, then adapts online — so the first trial on a new junction is already informed.
:::

### The result

::: figure traffic-results | 900
Average number of waiting vehicles. Ours is best on every column, and the gain is largest where trials are scarcest — ==395.5 vs 408.5 in Hangzhou, 859.7 vs 920.1 in Manhattan.==
:::

## Categories ③ and ④ — the dynamic half
{num: 04}

Now the decision is a sequence, and each one reshapes the state the next one faces.

### ③ Fundamentals — two scientific parents
{sub: Lectures 7 and 9 · dynamic, model-based}

::: lineage
:::

::: reveal
::: keypoint
Value-based and policy-based RL are not two methods — ==they are two heritages.==
:::
:::

::: reveal
- **Value-based RL** is *dynamic programming with the model deleted* — discrete, value-centric, Bellman's operations research.
- **Policy-based RL** is *optimal control with the dynamics deleted* — continuous, control-law-centric, Pontryagin and Kalman's control theory.
:::

### The same claim, in two grids
{sub: pp. 57–58 of the source deck — where Lectures 7 to 10 come from}

Zoom into the dynamic, single-agent cell and split it twice: by **action space** and by **time**. Handed a model, the four boxes are the classical theories.

::: table center
| model-based | finite action space | infinite action space |
|---|---|---|
| **discrete time** | discrete-time MDP · $P(s_{t+1}\mid s_t,a_t)$ | discrete-time dynamic system · $x_{t+1}=f(x_t,u_t)$ |
| **continuous time** | continuous-time MDP · $P(s_{t+h}\mid s_t,a_t)$ | continuous-time dynamic system · $\dot x_t = f(x_t,u_t)$ |
:::

::: reveal
Now delete the model and the same grid names the data-driven methods:

::: table center
| model-free | finite action space | infinite action space |
|---|---|---|
| **discrete time** | ==value-based reinforcement learning== | ==policy-based reinforcement learning== |
:::
:::

### ④ The doubling — why the second crossing is not the first again

::: cols
::: col First crossing · Lecture 1 → 2
The static world. Delete the model and exactly ==one== object goes missing:

$$\min_x\; \hl{f(x)} \quad \text{s.t.}\quad g(x)\le 0$$

The answer is a **belief over $f$** — a posterior, a surrogate, a generative inverse.
:::
::: col.accent Second crossing · Lecture 7 → 8
The dynamic world. Delete the model and ==two== objects go missing at once:

$$Q^*(s,a)=\sum_{s'} \hl{P(s'\mid s,a)}\big[\hl{R(s,a,s')}+\gamma\max_{a'}Q^*(s',a')\big]$$

Reward $r$ **and** transition $P$ — the count doubles.
:::
:::

::: reveal
::: keypoint
This is why RL is not merely ==optimisation done with data.==
:::
:::

### Three answers to the same doubling

::: flow
- !**Value-based** | Ch 8 · learn $Q$ from samples — $r$ and $P$ are *fused* and neither is modelled
- **Policy-based** | Ch 10 · output the action — the dynamics *cancel* in the gradient
- **Model-based** | Ch 11 · estimate $P$ *explicitly*, then plan with it
:::

::: reveal
::: small
Each answer pays a different price: fusing loses the ability to plan ahead; cancelling costs sample efficiency; estimating invites model bias. No answer dominates — which is why all three are taught.
:::
:::

### Case C · Semiconductor furnace heat control
{sub: model-based RL, in production — the dynamics were learned, then planned with}

::: figure furnace-overview | 730
An **input-convex graph recurrent network** learns the heat-transfer dynamics from operating logs; **model-predictive control** then optimises the work-set over a horizon and executes only the first action. ==Convex in the control== is the design choice that makes the inner optimisation solvable at every step.
:::

::: reveal
::: small
The balance the professor's own slide names: *model expressivity* against *optimisation solvability*. A more faithful dynamics model is worthless if the controller cannot optimise through it in the time between two ticks.
:::
:::

### Case C · the result

::: figure furnace-results | 900
==2.03 °C average error at a 100-step prediction horizon==, and stable over 900 steps — enough that the overshoot region, the part an operator actually worries about, is predicted rather than merely tracked.
:::

### Extension toward practical RL
{sub: pp. 59 and 66 of the source — the professor's own roadmap}

Textbook reinforcement learning assumes a simulator you may query without limit. Three extensions close the gap to a real plant, and this course takes two of them.

::: flow
- **1 · Model-based RL** | learn the dynamics, then plan *(Lecture 11)*
- **2 · Meta RL** | one policy across tasks whose dynamics and objectives change
- !**3 · Offline RL** | learn from a log, with no interaction at all *(Lecture 12)*
:::

::: reveal
::: block Why offline RL — in the source deck's own words
"Industrial systems typically do not have simulators, and it can be prohibitive to learn a policy by directly interacting with the real system. ==Deriving a policy using previously collected data (offline data) is preferable.=="
:::
:::

### Case D · Offline meta policy learning, then online adaptation

::: figure offline-meta | 900
Collect operation data across many tasks; train a general controller offline — the encoder, the critic and the actor share a buffer per task; then adapt on the target task with ==a handful of interactions, not a million==. This is Lecture 12's territory, and it is where a plant deployment actually begins.
:::

## The single spine
{num: 05}

Read the whole course as a slow stripping-away of what you were handed.

### Each chapter removes one given

::: widget given-ledger
Walk the lectures and watch the ledger empty. The counter on the right is the argument of the previous act: it reads **1** for the whole static half, and **2** from Lecture 8 onward.
:::

### The four systems, and the categories they belong to
{fill: top}

::: lede
Every method in this course was built against a real system. These four run through the lectures, and the numbers are the professor's own.
:::

| system | category | what is decided | result |
|---|---|---|---|
| **Wind farm** | ② static, data-driven | where to place $N$ turbines, in a shared wake | 1.5% MAPE prediction; total power 7.5 → 20.0 |
| **Traffic signals** | ② static, data-driven *(meta)* | the green split at every intersection | 408.5 → **395.5** waiting vehicles in Hangzhou; 920.1 → **859.7** in Manhattan |
| **Semiconductor furnace** | ④ dynamic, data-driven | the heater work-set, every step | 2.03 °C average error at a 100-step horizon |
| **Combinatorial design** | ④ and beyond | a chip placement, a route, a schedule | search space $>10^{90{,}000}$ states — beyond Go's $10^{360}$ |

::: reveal
::: small
None of these is a benchmark. Each is a system where a wrong decision costs power, time or yield — which is why the course spends its first six lectures on *how to state the problem* before it spends any on how to learn one.
:::
:::

### The course, as a route through the map

- **Part I — the given world.** Ch 1: classical optimisation, the atom of every later method.
- **Part II — the uncertain world.** Ch 2 Bayesian statistics (belief as a distribution) → Ch 3 Bayesian networks (structured belief, plus decisions) → Ch 4 Bayesian optimisation (act on an unknown function).
- **Part III — design from data alone.** Ch 5–6 data-driven design optimisation: surrogate (forward) and generative (inverse).
- **Part IV — the world that unfolds.** Ch 7 MDP & DP → Ch 8 value-based RL  ‖  Ch 9 optimal control → Ch 10 policy-based RL → Ch 11 model-based RL.
- **Part V — when you cannot even try.** Ch 12 offline RL: the same dynamic, data-driven cell, with the right to interact withdrawn.

::: reveal
::: small
Appendix: a probability review — the toolbox underneath all of it.
:::
:::

## What comes next
{num: 06}

Everything above assumed a human writes the formulation. That assumption is the one now breaking — and it is what your class project is about.

### The bottleneck was never the solver
{sub: p. 69 of the source — the modelling loop, seen again with fresh eyes}

::: figure nco-motivation | 900
The same three boxes as the opening slide. Solvers have become extraordinary; the arrow that has *not* improved is the first one. ==Defining the problem mathematically is still the realm of advanced experts==, and there are not enough of them.
:::

### The paradigm shift
{sub: from writing a formulation to generating a solver}

::: cols
::: col Formulation-based
A human expert reads the operation, writes $\min f$ s.t. $g \le 0$, chooses a solver, tunes it.

Weeks per problem. Rewritten whenever the operation changes. **The expert is the bottleneck, and the expert does not scale.**
:::
::: col.accent Generative
A model is trained to *emit* a solution given an instance — ==optimisation as inference==.

$$f_\theta:\; \mathcal{X} \to \mathcal{Y}$$

Milliseconds per instance, once trained. **The instance may be one the expert never saw.**
:::
:::

::: reveal
::: keypoint
The source deck's own phrase for where this goes: ==“ChatGPT for Optimization — generative AI for optimisation.”==
:::
:::

### Neural combinatorial optimisation, defined

::: figure nco-definition | 900
Learn a ==solver==, not a solution: $f_\theta: \mathcal{X}\to\mathcal{Y}$, trained over a *distribution* of instances $x \sim g(\cdot)$ so that it generalises to $x' \sim g'(\cdot)$. Because the training signal spans tasks, ==learning an NCO solver is inherently multi-task learning== — which is why the meta-learning of Case B returns here.
:::

### Two ways to train it

::: figure nco-rl-vs-il | 880
**Imitation learning** needs an oracle solver's answers — easy to train, and capped by the oracle. **Reinforcement learning** needs only the objective value — no labels, poorer sample efficiency, better generalisation. The choice is Lecture 8 and Lecture 10 arriving in a new domain.
:::

### One engine, three domains — ① Vehicle routing
{sub: Case 1 of 3 · in production — generation, then test-time improvement search}

::: video solver-routing | 870
**Pre-training** generates several complete tours at once; **test-time search** improves each one and reports its length (62 · 64 · 61); the runs land in an **experience buffer** that **post-training** uses to re-learn the solver. ==Nothing here is a hand-written heuristic== — the search operator is itself learned.
:::

### ② Robot fleet — multi-agent path finding
{sub: Case 2 of 3 · same engine, new domain — generative assignment, then parallel plan improvement}

::: cols wide-l
::: col The same pipeline, retargeted
::: video solver-robot | 620
:::
:::
::: col.accent SILAB's own run
::: video robot-mapf | 230
:::
Agents blue, tasks red.
:::
:::

::: small
Generation now emits a **task assignment**; test-time search is a **path search** that reports the conflict count it is driving down (*iter 4 · conflicts: 12*). ==The plan is not an answer until the conflicts reach zero== — which is a validator, not an objective.
:::

### ③ Chip placement and routing
{sub: Case 3 of 3 · beyond logistics — the same relational search engine, applied to silicon}

::: cols wide-l
::: col Generation, then collision-free wire routing
::: video solver-chip | 620
:::
:::
::: col.accent Meta-learned placement
::: figure chip-decap-method
:::
:::
:::

::: small
Placement is *meta* design: the task changes with the higher-level design flow, so what must be learned is a solver that adapts, not a placement that is fixed. {p}(NeurIPS'23)
:::

### The same engine, measured against a commercial solver
{sub: delivery routing, in paid production}

::: cols
::: col Package delivery · Gangnam
::: figure case-package-delivery
:::
Distance ==25.32 → 21.98 km==, delivery time ==18 → 14 min== against Google OR-Tools.
:::
::: col.accent Food & pharmacy delivery
::: figure case-food-delivery
:::
200 couriers, ~25,000 pharmacies. Total distance ==873.5 → 695.1 km==; longest single route ==67.4 → 37.4 km.==
:::
:::

### Running in the field, across domains
{sub: one engine, wrapped per domain — these are operating systems, not demonstrations}

::: cols c3
::: col Delivery routing
::: video field-routing | 285
:::
:::
::: col Vessel stowage
::: video field-stowage | 285
:::
:::
::: col Airport operations
::: video field-airport | 285
:::
:::
:::

::: cols c3
::: col Parking allocation
::: video field-parking | 285
:::
:::
::: col Logistics network
::: video field-network | 285
:::
:::
::: col Defense logistics
::: video field-defense | 285
:::
:::
:::

::: small
Each is the *same* combinatorial engine behind a different domain grammar and a different operator screen. ==What is reused is the solver; what is rebuilt is the contract with the operation.==
:::

### The architecture this is heading toward
{sub: foundation model → solver → OCP server → agent}

::: video.plain omelet-stack-flow | 760
One **foundation model** feeds a small set of **problem-class solvers**; each solver is wrapped, per domain, into an **OCP server**; and the applications a field engineer opens are assembled from those. Watch the paths light in turn — one model, one solver, four different operations. ==Every layer exists to make the one before it reusable.==
:::

::: reveal
::: small
Each layer makes the one above reusable. The foundation model creates the intelligence, the ==OCP server== (Optimization Context Protocol) makes it reusable, and the platform makes it operable — deploy, connect, monitor, govern, remember, improve.
:::
:::

### The optimisation engine, talking to a language model
{sub: this is the structure that puts optimisation in a field engineer's hands}

::: video.plain omelet-ocp-loop | 1080
A request in words ($l$) is turned by the **Formulator** into an instance $x = (x_D, x_C)$ — problem data and solver configuration — which the **OCP server** solves; the **Analyzer** returns the answer in the engineer's language. ==Language models do the reading, writing and explaining; the solver does the deciding.== Nothing here asks an LLM to optimise, and nothing asks the solver to understand English.
:::

### The knowledge that makes the translation possible

::: widget opt-ontology
An ontology over ==objective, constraints, data and parameters== is what turns a sentence into exactly one formulation. Supply it once per problem class, and every later run inherits it.
:::

### The OI Factory
{sub: three gated loops inside one feedback loop — and the shape of your project}

::: video.plain omelet-oi-factory | 850
Three gated loops — business context, problem definition, product and delivery — each turning until the next role can act, all inside one outer loop that reopens when the operation talks back. ==Your project is one pass through this.==
:::

::: reveal
::: block The rule that makes it a factory, not a project
Each part is finished only when ==the next role can act on it==. Part 2 is done when another person — or a model — could rebuild a working solver from it alone.
:::
:::

### Your class project
{fill: top}

::: lede
You will run one pass of the OI Factory on a problem of your own choosing. The deliverable is not a notebook — it is the three parts, gated.
:::

::: table center
| part | what you hand in | the gate it must pass |
|---|---|---|
| **1 · Business context** | the decision as it is made today, and what a better one is worth | a reader can state the scope in one paragraph |
| **2 · Problem definition** | objective, variables, hard and soft constraints, and the data contract | ==zero hard-constraint violations, and a KPI at or above the incumbent== |
| **3 · Product & delivery** | the surface an operator would actually use | someone else can run it end to end |
:::

::: reveal
::: small
Every method in Lectures 1–12 is a candidate for part 2. The point of the gate is that ==the choice of method is not the deliverable== — a validated decision is.
:::
:::

## Closing
{num: 07}

One story, told in chapters — and a map to keep in view for the rest of the term.

### One question — decide well under uncertainty — asked along three criteria, answered by two lineages.
{layout: standout}

And unfolded by removing, one at a time, everything you were given.

### Let us begin — Lecture 1.
{layout: standout}

Keep the three-axis map in mind: at the start of every lecture we mark exactly where we stand on it, and which assumption we are about to give up.
