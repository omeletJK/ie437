# Problem Structure and Classification Reference

**IE437 Assignment 1 · Reference, not an additional submission**

Define the problem before choosing labels or algorithms. Use these definitions consistently; do not replace them with a single label for the whole system.

## 1. Start with the Problem Boundary

Specify what is decided and what interval constitutes **one decision problem**. The same operation can have different structures under different boundaries: fixing an entire day's route using morning information differs from choosing dispatch actions as new orders arrive during that day.

Work in this order:

**Problem Boundary → Decisions → Decision Dependencies → State-transition Components → Information Structure → Cost / Constraint / State-transition Components and their Models.**

A **Decision** is something actually chosen, such as a complete schedule, an order quantity, a layout, or a policy for future actions. Prediction and simulation alone are not decision problems. Identify the decision they support; if it lies outside your scope, say so rather than inventing one inside it.

Use stable local IDs for decisions and components. Plain text, tables, or YAML can express the structure. Shared concept registries, application storage schemas, and software validation frameworks are not assignment requirements.

## 2. Derive the Classifications

| Property | Applied to | Categories and test |
|---|---|---|
| **Decision Structure** | Decision Dependency Graph | **Flat:** one decision, or multiple decisions without a directional parent–child dependency. **Hierarchical:** one decision changes another decision problem's feasible region, state, parameter, objective, constraint, or available action. |
| **State Structure** | Each decision problem within its boundary | **Stateless:** no state linking decision epochs needs to be modeled. **Stateful:** current state and action determine a next state that affects later parts of the problem. Derive this from meaningful **State-transition** components. |
| **Information Structure** | Each decision problem within its boundary | **Open-loop:** actions or an action sequence are fixed using currently available information. **Feedback:** newly observed future information is used to change subsequent actions within that problem. |
| **Component Model** | Each meaningful evaluation component | **Formulation**, **Simulation**, or **Data-driven**, according to how that component computes its result; see Section 3. |

**Dependencies:** Record `A → B` and what changes. Multiple decisions sharing a capacity constraint may still be Flat. A sequence of analytical tasks alone does not establish hierarchy.

**State:** Identify the state, action, and transition. Calendar indices, solver call counts, or dynamics inside an evaluation simulator are not sufficient. A missing transition in an incomplete draft does not establish Stateless; record `unknown` until the boundary is understood.

**Information:** Explain what is observed, when it becomes available, and which subsequent action it can change. Where known, record the basis as `operational-requirement` or `design-decision`, with a rationale. Choosing a fixed plan suggests Open-loop; choosing a rule/policy for future observations suggests Feedback. Confirm this against the boundary.

**Execution:** Frequency, schedules, triggers, automatic/manual operation, and API call counts belong to Operation / Execution Design. Re-running an independent problem every day does not by itself make each problem Feedback.

## 3. Separate Component Role from Component Model

Each component has a **Role** describing what it evaluates:

- **Cost** (`cost`): an objective or performance measure; specify whether it is minimized or maximized. It need not be monetary cost.
- **Constraint** (`constraint`): a feasibility condition or stated restriction.
- **State-transition** (`state-transition`): the relation carrying state between decision epochs inside the decision problem.

Its **Model** describes how the result is computed:

| Model | Definition | Example |
|---|---|---|
| **Formulation** (`formulation`) | Explicit variables, relationships, objectives, or constraints compute cost, feasibility, or state. | Distance sums, capacity limits, inventory balance equations. |
| **Simulation** (`simulation`) | System time, events, and interactions are executed to obtain an outcome that is difficult to calculate through a simple relationship. | Waiting time from simulated robot congestion. |
| **Data-driven** (`data-driven`) | A relationship between context, a decision, and its outcome is learned from observations to evaluate cost, constraint, or state transition. | A learned relationship from process settings to yield. |

Break evaluation into meaningful minimal components and preserve each component's Model. Do not force one Model onto the entire decision or introduce a replacement category such as "Hybrid."

**ML Usage ≠ Data-driven Evaluation.** A learned forecast may supply a parameter while the decision's cost and constraints remain explicit formulas. Identify the forecast as a supporting analysis and inspect how the actual evaluation components work. Do not classify every computation using data as Data-driven.

## 4. Distinguish Dependency from Evaluation

In a hierarchical problem, a layout decision may change the feasible paths and available actions of a robot-operation decision:

```text
layout-design → robot-operation: feasible-region, available-action
```

The layout's waiting-time component may in turn be evaluated through robot operation:

```yaml
id: waiting-time
role: cost
model: simulation
evaluated_by: robot-operation
```

These describe different relationships: the parent changes the child problem; the child supplies an evaluation of the parent. Record `evaluated_by` where relevant. Receiving an evaluation result is not, by itself, evidence of Feedback Information Structure.

## 5. Follow-up Questions: Only Where Applicable

| Structure / Model present | Information to define or investigate |
|---|---|
| **Stateful** | State, transition, initial/terminal conditions, balance/conservation, and horizon. |
| **Feedback** | What is observed at each decision, when information is revealed, partial observation, how observations affect actions, and responses to delayed or missing information. |
| **Formulation** | Decision variables, objective, hard/soft constraints, parameters, feasibility, and infeasible-input handling. |
| **Simulation** | Entities, events, internal state, resources, randomness, replications, calibration, and validation. |
| **Data-driven** | Context/input, action, outcome, training data, coverage, bias/leakage, generalization, and uncertainty. |
| **Hierarchical** | Parent/child decisions, what is passed or changed, whether the child evaluates the parent, and any feedback relationships to examine against the boundary. |

Answer relevant questions in the appropriate section of the definition; do not create a second copy here. An applicable but unresolved question is `TBD` with a confirmation plan. An irrelevant question is `N/A — reason`.

## 6. Boundary Examples and Common Mistakes

| Defined problem | Interpretation |
|---|---|
| Choose an entire monthly nurse schedule once. | Flat, Stateless, Open-loop with Formulation components in this example. Constraints spanning dates do not alone establish a state transition between decision epochs. Previous-month history used only as an initial parameter need not change this classification. |
| Fix 12 monthly replenishment quantities now, with inventory balance `I[t+1] = I[t] + q[t] - d[t]`. | Flat, Stateful, Open-loop with Formulation components. Inventory carries forward even if one solver call determines the whole plan. |
| Observe actual inventory and sales, then choose later replenishment actions. | Feedback; inventory balance also makes this Stateful. Evaluation can still be Formulation; Feedback does not require learning from data. |
| Solve an independent daily routing plan each morning. | Each problem can remain Flat, Stateless, Open-loop despite daily re-execution. |
| Fix a layout and evaluate it with a dynamic robot simulator. | Simulator dynamics alone do not make the layout decision Stateful. If robot operation is a separate decision, classify it separately. |

Stateful does not imply Simulation. Simulation does not imply Feedback. Multiple decisions do not imply Hierarchical. Preserve different classifications for different decisions and components.

## 7. Uncertainty in the Definition

The graph becomes more precise as understanding improves. `unknown` is an unresolved status, not an additional taxonomy category. State which fact would resolve it and how to obtain that fact. Incomplete definitions are acceptable when honestly identified; an unsupported claim of completeness is not.

Classification is assessed through the consistency of the boundary, structure, components, and reasoning. A small justified structure is sufficient; complexity earns no credit by itself.
