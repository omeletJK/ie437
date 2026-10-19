# Problem Definition: [Proposal Title]

**IE437 Midterm Project · Distribution-Centre Network Redesign — A Hierarchical Decision under Uncertainty**

Author / student ID: [entry]  
Date / version: [entry]  
Summary: [two or three sentences — the recommended number of DCs, the estimated saving and its uncertainty, and the one assumption that matters most]  
Files: `problem-definition.md`, `demo.html`, `proposal.html`, `code/` [if used]  
LLM tools and use: [tool/model, dates, and tasks supported]

Use the seven sections below. Replace prompts with your answer; adapt table rows to your scope. Cite sources beside the claims they support. Mark assumptions `[ASSUMPTION]`, unresolved facts `TBD`, and inapplicable items `N/A — reason`. Write each explanation once and refer back to it. Stable IDs are needed for decisions and components; a separate ID for every datum, setting, source or test is optional.

Read the [classification reference](problem-classification-reference.md) and the [format example](problem-definition-example.md). An unresolved classification is `unknown`, not a guessed label.

## 1. Decision, Scope & Problem Structure

State the business need and complete this sentence:

> [Who] uses [what information], [when], to decide [what], in order to improve [what outcome].

**The four statements.** Place each statement from the review meeting at a level — a decision, an evaluation of a decision, a method for taking a decision, or a claim about the validity of a model — or explain why it fits none. Draw the consequence: which of the four may be compared with which, and on what common scale.

| Statement | Level | Decision or component it concerns | Consequence for comparison |
|---|---|---|---|
| Strategy & Planning | | | |
| Delivery Operations | | | |
| Data Team | | | |
| Field Manager | | | |

**Boundary.** What interval and which decisions constitute one problem? One redesign chosen now, or a sequence of closures as leases expire? State exclusions and their consequences. Distinguish the company's known current practice from the baseline you construct.

**Decisions and dependencies.** List each real decision with a stable ID, what is chosen, and who approves it. Write dependencies as `parent → child: what changes` (feasible region, state, parameter, objective, constraint, available action). Write evaluation relations separately as `evaluated_by`. A forecast, a distance rule or a routing estimate is not a decision.

**Classification.** Derive it from the structure above; repeat decision rows as needed.

| Object | Property | Classification (or unresolved status) | Structural evidence or question to resolve |
|---|---|---|---|
| Decision dependency graph | Decision Structure | Flat / Hierarchical; if unresolved: unknown | |
| [Decision ID] | State Structure | Stateless / Stateful; if unresolved: unknown | |
| [Decision ID] | Information Structure | Open-loop / Feedback; if unresolved: unknown | |

Keep execution frequency, triggers and manual/automatic operation separate from classification.

## 2. Computable Problem

**Standard form, per level.** For each decision, give variables and their domains, the objective, and the constraints, in the form of Lecture 1. Say which subproblems are convex and which are combinatorial, and what that implies for exact solution.

**I/O schema.** Every input table and parameter the system takes, and every output it returns.

| Input / output | Table or parameter | Field | Type / unit | Meaning; one row is … |
|---|---|---|---|---|
| Input | | | | |
| Output | | | | |

**The two criteria.** Define the generation criterion `G` and the evaluation criterion `E` precisely — formulas, pseudocode or rules. State what each ignores. `E` must include DC fixed cost and an operating cost from the fleet and kilometres implied by routes (or a stated routing estimate) under road distance, over sampled demand days.

**Components.** Keep each component's Role and Model separate, using the reference definitions. Say which components the learned demand model supplies parameters to.

| Component ID | Decision ID | Role: Cost / Constraint / State-transition | Model: Formulation / Simulation / Data-driven | Definition, units, and evidence / assumption / unknown |
|---|---|---|---|---|
| | | | | |

Identify hard constraints versus preferences. Specify how infeasible inputs are handled (for instance a DC count that cannot satisfy the capacity bounds). Answer only the applicable follow-up questions in the [reference](problem-classification-reference.md#5-follow-up-questions-only-where-applicable).

## 3. Information & Uncertainty

**The generated world.** For each table, what one row represents, how it was generated (distribution, parameters, seed), and which real-world property it reflects. Give the road-distance rule and the barrier. State the scale of the demonstration world and what you expect to change at full scale.

**The demand model.** Prior and its strength, likelihood, update, posterior and posterior predictive for a planning day. How stores with a short history are handled. Where demand enters a cost, and the difference between evaluating on sampled days and on the average day.

**Facts, assumptions, unknowns and requests.** Separate information available at decision time from later outcomes.

| Fact / assumption / unknown or request | Evidence or reason for current treatment | Why it matters | How to confirm or obtain it; priority | Fallback or limit until confirmed |
|---|---|---|---|---|
| | | | | |

Explain the main uncertainties, how you examined their effect, and when the recommendation should not be trusted.

## 4. Alternatives & Selected Approach

Compare at least the baseline, a proxy-only approach (generate and judge with `G`), and your selected approach.

| Approach | Mechanism and required information | Strengths, limitations, and effort | Selection and reason |
|---|---|---|---|
| Baseline | | | |
| Proxy-only | | | |
| Selected | | | |

**The budgeted search.** The budget `B` and its justification; the parameterisation searched; the surrogate and acquisition rule (or the justified alternative); how the log is kept. Give the calculation flow from input to output, referring to Section 2. Explain tie-breaking and randomness. Identify actual calculations, precomputed results, illustrative calculations and unimplemented parts. Do not claim optimality beyond what the method establishes.

**The remedy.** Which Lecture 5 remedy you applied to `G`, and what it changed.

## 5. Demonstration & Evaluation

Explain how to open `demo.html`, generate or load the world, set the budget and parameters, run, inspect the log and the recommendation, compare with the baseline, and run again. State the browser checked, the offline result, and the seed mechanism. Map the demo's behaviour to the decisions and components of Section 2.

Define the comparison conditions shared by every candidate and the baseline. Keep evaluation outcomes separate from information used to make the recommendation.

| Case | Inputs / reproduction steps | Expected result / pass criterion | Observed result and supported conclusion |
|---|---|---|---|
| Normal | | | |
| Boundary | | | |
| Failure | | | |
| Exploit (R3) | | | |

**Prediction quality and decision quality.** How well `G` predicts `E` across the evaluated candidates, and how much the `G`-chosen network loses under `E`. **The sweep.** Total cost and its two components against the number of DCs. **The log.** Budget used, rule, and the sequence of evaluated candidates. Write `Not run` for unexecuted checks. Summarise what the demonstration establishes and what it does not.

## 6. Client Proposal

The recommended number of DCs and their locations; the estimated saving against the baseline with its uncertainty; the assumptions under which it would reverse. The information to obtain first with real data (refer to Section 3), the first real-data check, and the conditions to proceed, revise or stop. End with the concrete decision requested from management. Use this argument in `proposal.html`, keeping its claims consistent with the demonstration.

## 7. LLM Review & Key Revisions

Record three important discussions and your own checks. Accepted suggestions are valid examples. Combine important revisions with this record rather than keeping another change log.

| Discussion / purpose | LLM suggestion | Your assessment and verification evidence | Final decision or revision; location in the deliverables |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
