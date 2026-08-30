---
ch: 0
title: Data-Driven Decision Making and Control
subtitle: Deciding well under uncertainty — one question, three axes
tagline: The map — how every chapter fits one story
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

## The three axes
{num: 02}

Any decision problem sits somewhere along three independent axes. The course is a tour of this cube.

### The map — three axes of every decision problem

::: table center
| Axis | one end | the other end |
|---|---|---|
| **Stages** | static — a single decision | dynamic — a sequence |
| **Model** | model-based — handed to us | data-driven — learned |
| **Decision makers** | single agent — optimisation | many agents — a game |
:::

::: reveal
We traverse the cube in a deliberate order:

::: keypoint
**static → dynamic**,  **model-based → data-driven**,  and then **interactive → offline**.
:::
:::

::: reveal
::: small
Each move is one bundle of lectures. None of the machinery is arbitrary — it is whatever that move requires.
:::
:::

### The cube, and the route this course takes through it

::: widget course-cube
The origin is plain optimisation. Step through the numbered route — ==step ④ is the one to watch==, where the data-driven axis is crossed a second time and the count of unknowns doubles.
:::

### Axis 1 — static becomes dynamic

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

### Axis 2 — model-based becomes data-driven
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

### Axis 3 — one decision maker becomes many

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

## The doubling
{num: 03}

The model axis is crossed twice — and the second crossing is not the first one again.

### Crossing the model axis, twice

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
Part IV of the course is exactly these three answers, in that order. Read the whole of it as three different ways to survive the same doubling.
:::

::: reveal
::: small
Each answer pays a different price: fusing loses the ability to plan ahead; cancelling costs sample efficiency; estimating invites model bias. No answer dominates — which is why all three are taught.
:::
:::

## The two lineages
{num: 04}

Inside the dynamic, single-agent cell there are two distinct intellectual origins — and this course teaches both, then their data-driven children.

### Inside the dynamic cell — two scientific parents

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

::: reveal
::: small
Lecture 11 then *reunites* them: learn the model back, and let value and policy methods teach each other.
:::
:::

## The single spine
{num: 05}

Read the whole course as a slow stripping-away of what you were handed.

### Each chapter removes one given

::: widget given-ledger
Walk the lectures and watch the ledger empty. The counter on the right is the argument of the previous act: it reads **1** for the whole static half, and **2** from Lecture 8 onward.
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

## Closing
{num: 06}

One story, told in chapters — and a map to keep in view for the rest of the term.

### One question — decide well under uncertainty — asked along three axes, answered by two lineages.
{layout: standout}

And unfolded by removing, one at a time, everything you were given.

### Let us begin — Lecture 1.
{layout: standout}

Keep the three-axis map in mind: at the start of every lecture we mark exactly where we stand on it, and which assumption we are about to give up.
