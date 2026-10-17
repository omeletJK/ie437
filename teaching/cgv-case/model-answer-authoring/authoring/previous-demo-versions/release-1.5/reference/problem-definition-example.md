# Problem Definition: Selecting a Morning Batch of Makerspace Jobs

**IE437 Assignment 1 · Illustrative example in a different domain**

This fictional example shows the seven-section format, not a solution to the cinema assignment. It includes no HTML artifacts. Planned features and unexecuted tests are marked accordingly; your submission must include functioning HTML files and actual observations.

Author: fictional example author · Version: 2.0  
Summary: Help a technician choose complete jobs within a morning time allowance, comparing an arrival-order baseline with exact subset selection.  
Files: planned `demo.html` and `proposal.html`, not supplied here.  
LLM use: Section 7 contains fictional review examples, not a claimed conversation history.

## 1. Decision, Scope & Problem Structure

A fictional makerspace has one technician, three eligible jobs, and 120 minutes available. Job times and priority points are invented in Section 2. Current operating practice is unknown; arrival-order selection is a proposed baseline, not an observed process.

> Before work starts, the technician uses eligible jobs, processing times, and priority points to select a batch maximizing completed priority points within the available minutes.

**Boundary:** one batch chosen before this morning's execution. `[ASSUMPTION]` Jobs are independent, performed sequentially, and either completed or omitted. Interruptions, parallel work, shared setup, mandatory jobs, and carryover are excluded. The recommendation is unsuitable if these exclusions change feasibility or priorities.

**Decision `morning-batch`:** choose which jobs to perform; the technician reviews and approves the selection. Validation and subset enumeration are computations supporting this decision. There are no other decisions or directed dependencies in scope; `evaluated_by` is N/A.

| Object | Property | Classification (or unresolved status) | Structural evidence or question to resolve |
|---|---|---|---|
| Decision dependency graph | Decision Structure | Flat | One decision; no parent–child dependency. |
| `morning-batch` | State Structure | Stateless | No state is carried between decision epochs in this boundary; no State-transition component. Execution is outside scope. |
| `morning-batch` | Information Structure | Open-loop | The batch is fixed before work begins. Basis: `design-decision`; adaptation during work is excluded. |

Users may edit and recalculate inputs before approval. This interface behavior does not introduce future execution observations or change the Information Structure.

## 2. Computable Problem

The invented input table is the specification for this example, not measured organizational data:

| Arrival position | Job ID | Minutes | Priority points |
|---|---|---|---|
| 1 | A | 60 | 100 |
| 2 | B | 50 | 90 |
| 3 | C | 70 | 120 |

Let `x_i` indicate whether job `i` is selected. Available time `C` defaults to 120 minutes. Outputs are selected IDs, total minutes, total points, and the baseline comparison. Priority points are example scores, not money or a validated business-value measure.

| Component ID | Decision ID | Role: Cost / Constraint / State-transition | Model: Formulation / Simulation / Data-driven | Definition, units, and evidence / assumption / unknown |
|---|---|---|---|---|
| `priority-total` | `morning-batch` | Cost | Formulation | Maximize `sum(points_i * x_i)` in priority points, using the fictional table. |
| `time-budget` | `morning-batch` | Constraint | Formulation | Hard limit: `sum(minutes_i * x_i) <= C`; minutes are assumed additive. |
| `whole-job` | `morning-batch` | Constraint | Formulation | Hard rule: each `x_i` is 0 or 1; complete jobs only. |

Proposed input contract: at most 12 jobs; unique nonempty IDs; positive integer minutes; nonnegative finite points; integer capacity from 0 to 480 minutes. Limits are teaching assumptions. Invalid input blocks calculation with a field-specific explanation. Empty input or zero capacity is valid and permits the empty selection. No state/observation model is needed for this scope. No learned model or simulation is used.

## 3. Information & Uncertainty

One row is one eligible job. Supplied minutes and points do not establish actual duration or organizational value. Duplicate IDs and invalid/missing numbers must not be silently replaced. All inputs are available before selection; actual completion outcomes would be collected afterward for evaluation.

| Fact / assumption / unknown or request | Evidence or reason for current treatment | Why it matters | How to confirm or obtain it; priority | Fallback or limit until confirmed |
|---|---|---|---|---|
| `[ASSUMPTION]` Independent, additive durations | Simplifies the invented example. | Shared setup or interruptions could invalidate feasibility. | Technician process review: setup, interruptions, eligibility; high. | Restrict the trial to jobs confirmed to meet the assumptions. |
| `TBD`: meaning of priority points | No actual manager has approved the scores. | Optimizing the wrong measure may not help operations. | Manager review of score definitions and mandatory work; high. | Report points only; do not claim business gains. |
| Request estimated and actual job durations | No real completed-job records supplied. | Quantifies time-estimation error. | Technician's completed-job records with job IDs and timestamps; high. | Keep recommendations advisory and treat actual completion as unverified. |

The toy model treats times and points as fixed. A planned sensitivity check would vary these inputs and compare selected jobs; it has not been run. Before a field trial, duration errors should inform an agreed feasibility margin. Suspend recommendations if omitted rules or unreliable scores are found.

## 4. Alternatives & Selected Approach

| Approach | Mechanism and required information | Strengths, limitations, and effort | Selection and reason |
|---|---|---|---|
| A: Arrival-order baseline | Scan jobs in order; accept each if it fits, otherwise skip it. Uses the same times, points, and capacity. | One pass, transparent; may miss a better combination. | Reference method, not asserted current practice. |
| B: Enumerate subsets | Evaluate every subset, including the empty one, using Section 2's components. | Exact under this formulation; grows as `2^n`, at most 4,096 subsets for 12 jobs. | Chosen for a small, checkable demonstration. |

Planned flow: validate → compute baseline → enumerate feasible subsets → maximize points → display both selections and totals. Break ties by lower total minutes, then lexicographic order of sorted selected IDs. No randomness is used. These calculations are specified but not implemented in this example. Optimality applies to this small formulation, not to requirements omitted from it.

## 5. Demonstration & Evaluation

Planned workflow: open `demo.html` locally → load the embedded Section 2 jobs → edit capacity or values → compare → inspect IDs, minutes, points, and errors → modify and compare again. The comparison directly displays `priority-total` and checks `time-budget` / `whole-job`. All features, browser checks, and offline execution remain **Not run — HTML not supplied**.

Use identical inputs for both methods. Hand-enumerated subsets give expected functional answers; they do not validate the business objective or duration estimates. Training/test separation is N/A because no model is trained.

| Case | Inputs / reproduction steps | Expected result / pass criterion | Observed result and supported conclusion |
|---|---|---|---|
| Normal | Load Section 2 jobs; set capacity to 120; compare. | Baseline A+B: 110 minutes, 190 points. Recommendation B+C: 120 minutes, 210 points. Match IDs and totals. | Not run — no browser result claimed. |
| Boundary | Use the same jobs; set capacity to 0; compare. | Both return no jobs, 0 minutes, 0 points; a valid result. | Not run. |
| Failure | Change A's minutes to 0; attempt comparison. | Identify A's invalid duration; block the comparison and clear or label any previous result as stale. | Not run. |

Reproducible arithmetic: the eight subsets are empty, A, B, C, A+B, A+C, B+C, and A+B+C. At 120 minutes, A+C (130 minutes) and A+B+C (180) are infeasible; feasible point totals are 0, 100, 90, 120, 190, and 210 respectively. Thus B+C is best for these inputs. This establishes the expected answer only, not HTML correctness or an operational improvement.

## 6. Client Proposal

The client for this separate example is the makerspace manager. Request a scope-review meeting with the technician and access to the records identified in Section 3.

First confirm job eligibility, additive times, and score meanings. Next implement the demo and pass the three functional cases. Then conduct an advisory shadow evaluation using independently recorded completion outcomes. Before collecting trial outcomes, the manager and technician should agree acceptable overruns and how completed priority work will be compared. Revise or stop if omitted constraints or poorly defined scores invalidate the recommendation.

The immediate request is approval for definition review and data assessment, not production adoption. Cost, duration, and benefit estimates are TBD until scope and record quality are known. `proposal.html` should present the fictional 190-versus-210 comparison as an illustration and identify real-world effects as untested.

## 7. LLM Review & Key Revisions

**These are fictional examples of review records. Students must report their own discussions and checks.**

| Discussion / purpose | LLM suggestion | Your assessment and verification evidence | Final decision or revision; location in the deliverables |
|---|---|---|---|
| 1: Choose a method | Enumerate subsets for the small input. | Accept: check `2^12 = 4,096` and the eight three-job subsets in Section 5; no training data is needed. | Use enumeration in Section 4 and the planned comparison. |
| 2: Describe the baseline | Call arrival-order selection the current operating process. | Reject the factual claim: the fictional brief contains no current-practice evidence. | Label it a proposed reference in Sections 1 and 4 and in the planned presentation. |
| 3: Explain the difference | Call the 20-point difference a productivity improvement. | Restrict the claim: Section 2 defines points, and no operational outcomes were collected. | Report the toy objective difference in Section 5; require field evaluation in Section 6. |
