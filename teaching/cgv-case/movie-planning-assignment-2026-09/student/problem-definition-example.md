# Problem Definition: Selecting a Morning Batch of Makerspace Jobs

> **Illustrative Markdown example.** This uses an entirely fictional problem to show how to complete the template. It is not a solution to the film-company assignment. No HTML demonstration accompanies this example: planned functionality and unexecuted tests are labeled accordingly. Your own submission must include both functioning HTML deliverables and your actual observations.

| Item | Entry |
|---|---|
| Author / student ID or team | Example author — fictional |
| Date / version | Illustrative version 1.0 |
| Proposal summary | Help a makerspace technician select a batch of independent jobs within a fixed morning time allowance. Compare an arrival-order baseline with an exact selection method for a small job list. |
| Demonstration / presentation | Planned: `demo.html` and `proposal.html`; not supplied with this example |
| LLM tools and scope of use | Section 9 contains fictional review records, not a claimed conversation history. |

## 1. Business Context and Scope

### 1.1 Problem to Address

A fictional campus makerspace has three jobs ready for one technician. Each job has a supplied processing time and priority score. The technician has 120 minutes available and must select complete jobs before starting work. These are invented conditions, not observations about an actual organization. [E1]

The tool would help the technician compare feasible selections. Actual current practice is unknown. Arrival-order selection is a proposed comparison baseline, not a claim about existing operations.

### 1.2 One-Sentence Problem Statement

> Before the morning batch begins, a technician uses eligible jobs, processing times, and priority scores to select complete jobs that maximize completed priority points within the available minutes.

### 1.3 Scope and Success Conditions

| Item | Description | Evidence / assumption / unknown |
|---|---|---|
| Included | Select jobs from one fixed batch for one technician. | Example conditions [E1] |
| Excluded or simplified | Interruptions, shared setup tasks, deadlines, parallel work, and carryover to another day. | [ASSUMPTION] Independent, complete jobs only. |
| Consequences | The result is unsuitable if omitted requirements change feasibility or priorities. | Derived from the scope. |
| Success conditions | Return a feasible selection with maximum points for valid example inputs; reject invalid input. | Proposed technical acceptance rule, not client approval. |

## 2. Problem Structure and Classification

### 2.1 Analysis and Decision Structure

| Element ID | Analysis or decision | Responsible person / user | Inputs | Outputs | Relationship to the next element |
|---|---|---|---|---|---|
| F1 | Validate and compare candidate subsets | Proposed calculation module | Jobs and time allowance | Baseline and recommended selections | Supports D1; this processing sequence is not a decision hierarchy. |
| D1 | Select the morning batch | Technician | F1 results and stated assumptions | Approved list of jobs | Actual work execution is outside this demonstration. |

### 2.2 Classification and Rationale

| Dimension | Object being classified | Classification | Supporting conditions | Unknown conditions / follow-up questions |
|---|---|---|---|---|
| Decision Structure | D1 | Flat | One batch-selection decision; no parent–child decisions in scope. | A separate staffing decision would require a scope review. |
| State Structure | D1 | Stateless | A single batch is evaluated; no state passes to another decision in scope. | Confirm carryover rules before extending the scope. |
| Information Structure | D1 | Open-loop | The batch is fixed before execution. | Interruptions and execution-time changes are excluded. |
| Component Model | F1 | Formulation | Explicit sums and binary variables determine feasibility and value. | Operational validity of the supplied times and scores remains unconfirmed. |

## 3. Computable Problem Definition

### 3.1 Objectives and Measurement

| Objective ID | Objective / metric | Formula, unit, and aggregation scope | Direction | Comparison baseline | Basis for the target or method to establish it |
|---|---|---|---|---|---|
| O1 | Priority points of selected jobs | `sum(value_i * selected_i)` for one batch; priority points | Maximize | Arrival-order selection | Find the best feasible subset for the toy inputs. Operational meaning of the scores is TBD. |

Priority points are supplied example scores. They are not revenue, satisfaction, or a validated measure of business value.

### 3.2 Outputs and Decisions

| Decision ID | Recipient | Analytical output | Judgment or action taken in practice | What can be controlled | Timing and frequency |
|---|---|---|---|---|---|
| D1 | Technician | Selected job IDs, minutes, points, and baseline comparison | Approve which eligible jobs to perform | Include or exclude a whole job | Once before this morning batch |

### 3.3 Constraints, Preferences, and Settings

| Constraint ID | Rule | Hard constraint / preference | Applies to | Value or condition | Evidence / assumption | Demonstration implementation / check |
|---|---|---|---|---|---|---|
| C1 | Stay within available time | Hard constraint | Selected batch | `sum(minutes_i * selected_i) <= capacity` | [E1] | Planned feasibility check |
| C2 | Select a whole job or omit it | Hard constraint | Each job | `selected_i` is 0 or 1 | [E1] | Planned binary selection |
| C3 | Validate input | Hard constraint | Rows and capacity | Unique nonempty IDs; positive integer minutes; nonnegative finite points; capacity within P1 | Proposed input contract | Planned validation before calculation |
| C4 | Bound enumeration | Hard constraint | Input list | At most 12 jobs | [ASSUMPTION] Small teaching example | Planned row-count check |

| Setting ID | Adjustable setting | Meaning | Default and range | Reason for the choice | Effect on results |
|---|---|---|---|---|---|
| P1 | Capacity | Available technician minutes | Default 120; integer 0–480 | Default from [E1]; upper bound is a demo assumption | Changes which subsets satisfy C1 |

### 3.4 Time, Information, and State Boundaries

- One decision covers one fixed morning batch.
- Job properties and available time are supplied before calculation.
- State transitions and terminal-state rules: N/A — execution and subsequent batches are outside scope.
- Inputs may be edited and recalculated before approval.
- The demonstration does not change an approved batch during execution.

## 4. Data Interpretation and Additional Information

### 4.1 Meaning and Intended Use of Existing Records

One input row represents an eligible job with an ID, processing minutes, priority points, and arrival position. These inputs do not establish actual completion time or the organizational meaning of a priority point. Duplicate IDs, missing values, invalid durations, and non-finite numbers will be rejected rather than silently replaced.

| Data ID | Field / entity | Meaning, unit, and linking key | Availability / quality checks | Transformation | Related objectives, decisions, or constraints |
|---|---|---|---|---|---|
| X1 | Job list | ID, minutes, points, arrival position | Fictional table in Section 7.3; C3/C4 checks | Binary selection variables | O1, D1, C1–C4 |
| X2 | Available minutes | One integer for the batch | User setting; P1 checks | Compare with total selected minutes | C1, P1 |

### 4.2 Additional Information Requests

| Request ID | Information and specific fields needed | Why it is needed | Analysis or decision it would change | Provider / collection method | Priority | Fallback if unavailable |
|---|---|---|---|---|---|---|
| R1 | Estimated and actual job durations | Check whether estimates support feasible planning | Time inputs and acceptance rules | Technician / completed-job records | High | Keep results advisory; make no claims about actual completion. |
| R2 | Definition and approval process for priority scores | Check whether O1 represents the organization's intent | Objective and priorities | Manager / review meeting | High | Compare scores only; do not claim business improvement. |
| R3 | Setup requirements and job eligibility rules | Check independent, additive time assumptions | Constraints and scope | Technician / process review | High | Restrict a trial to jobs confirmed to meet the assumptions. |

### 4.3 Assumptions and Open Questions

| ID | Assumption or unknown | Reason for current treatment | Consequence if incorrect | Question and verification method | Treatment before verification |
|---|---|---|---|---|---|
| Q1 | [ASSUMPTION] Times are additive and independent. | Makes the toy calculation explicit. | A feasible selection may exceed actual available time. | Review setup interactions using R3. | Label recommendations as conditional. |
| Q2 | TBD — whether points reflect agreed priorities. | No actual client has approved O1. | The tool may optimize the wrong outcome. | Ask the manager to explain and approve score meanings. | Do not convert points into economic benefit. |

### 4.4 Uncertainty and Limits of Interpretation

This example treats supplied times and points as fixed inputs; it does not quantify estimation uncertainty. Before a trial, R1 should establish time-estimation errors and inform an agreed feasibility margin. If setup interactions or mandatory jobs are found, revise the definition before using recommendations.

## 5. Proposed Approach and Rationale

### 5.1 Comparison of Alternatives

| Approach | How it works | Required information | Strengths | Limitations / assumptions | Implementation and operating effort | Selection and rationale |
|---|---|---|---|---|---|---|
| A: Arrival-order baseline | Scan in arrival order; accept a job if it fits remaining time, otherwise skip it. | X1, X2 | Simple and transparent | May miss a better combination. | One pass | Proposed baseline; not asserted current practice. |
| B: Exhaustive subset comparison | Enumerate subsets and choose the feasible subset with the highest points. | X1, X2 | Finds the optimum under this formulation | Grows as `2^n`; cannot address omitted requirements. | At most 4,096 subsets under C4 | Chosen for the small demo; reassess for larger inputs. |

### 5.2 Calculation Flow of the Selected Approach

Let `selected_i` be 1 when job `i` is chosen and 0 otherwise.

```text
Maximize: sum(value_i * selected_i)
Subject to: sum(minutes_i * selected_i) <= capacity
            selected_i in {0, 1}
```

Validate input, calculate the baseline, enumerate feasible subsets including the empty subset, and compare their points. Break ties by lower total minutes, then lexicographic order of sorted selected IDs. Use the same totals calculation to display both selections.

| Component | Inputs X#/P# | Processing logic | Output / next stage | What should be evaluated | Demonstration implementation level |
|---|---|---|---|---|---|
| Validator | X1, X2, P1 | Apply C3/C4 and P1 bounds | Valid input or specific errors | Invalid input must not reach calculation. | Planned; not implemented here |
| Comparator | Validated X1/X2 | Baseline scan and enumeration | IDs, points, minutes | Feasibility and correct totals | Planned; not implemented here |

### 5.3 Failures and Fallback Actions

Invalid input blocks calculation and identifies the field to fix. More than 12 jobs triggers a scope message rather than an unbounded search. Zero capacity is valid and returns an empty selection. A technician who identifies an omitted requirement should leave the result unapproved until the definition is revised.

## 6. Evaluation Plan and Demonstration Findings

### 6.1 Comparison and Evaluation Design

Use identical jobs, scores, and capacity for both methods. Manually enumerated toy subsets provide expected answers for implementation tests; they do not validate the business objective or time estimates. No predictive model is trained, so a training/test split is N/A.

The demonstration should establish whether validation, calculations, and display follow the definition. Actual benefit remains untested. A field evaluation requires separately collected completion outcomes and manager-approved priorities.

### 6.2 Normal, Boundary, and Failure Scenarios

| Scenario ID | Type | Inputs and conditions | Expected result or property | Pass criterion | Observed demonstration result | Reproduction steps |
|---|---|---|---|---|---|---|
| S1 | Normal | Section 7.3 jobs; capacity 120 | Baseline A+B: 110 minutes, 190 points. Recommendation B+C: 120 minutes, 210 points. | Match both selections and totals. | Not run — HTML not supplied. | Load defaults and compare. |
| S2 | Boundary | Same jobs; capacity 0 | Both select no jobs, with 0 minutes and 0 points. | Valid result, not an error. | Not run — HTML not supplied. | Set capacity to 0 and compare. |
| S3 | Failure | Change A's minutes to 0 | Reject the input and identify A's duration. | No valid comparison for the invalid input. | Not run — HTML not supplied. | Edit A and attempt comparison. |

### 6.3 Findings and Remaining Limitations

| Check or experiment | Observed result | Evidence / reproduction location | Supported conclusion | Conclusion not yet supported |
|---|---|---|---|---|
| Arithmetic check | Feasible nonempty subsets: A=100, B=90, C=120, A+B=190, B+C=210 points. A+C needs 130 minutes; all jobs need 180. | [E2]; inputs in Section 7.3 | B+C is best for the specified 120-minute example. | Correct HTML implementation or improved actual operations. |
| Browser and offline execution | Not run | No accompanying HTML artifact | None | Executability and interface correctness. |

## 7. Demonstration Design and Execution

### 7.1 Representative User Workflow

Planned workflow: load jobs → edit capacity or values → validate and compare → inspect selections, totals, and unused minutes → edit and compare again. The technician checks whether the assumptions apply before approving a selection.

### 7.2 Mapping from Definition to Implementation

| Screen / feature | Related O#/D#/C#/X#/S# | Actual calculation / mock calculation / not implemented | What the user can verify |
|---|---|---|---|
| Editable inputs | X1, X2, C3, C4 | Not implemented; actual validation planned | Data meanings and error messages |
| Comparison panel | O1, D1, C1, C2, S1, S2 | Not implemented; actual calculations planned | Selections, points, minutes, and baseline difference |
| Invalid-input message | C3, S3 | Not implemented | Failed field and correction |

### 7.3 Fictional Data and Execution Instructions

These values are invented for teaching, not actual jobs or measured estimates. [E1]

| Arrival position | Job ID | Processing minutes | Priority points |
|---|---|---|---|
| 1 | A | 60 | 100 |
| 2 | B | 50 | 90 |
| 3 | C | 70 | 120 |

Default capacity is 120 minutes. No randomness is needed. The planned implementation would store the example inside `demo.html` and calculate locally. Execution instructions and browser checks are **pending implementation**; this sample claims no offline execution test.

## 8. Proposed Plan for the Company

For this separate example, the client is the makerspace manager. Your own submission should address the film-company client.

### 8.1 Staged Plan

| Stage | Work to perform | Required information and roles | Result to examine | Criteria to proceed or stop |
|---|---|---|---|---|
| 1: Confirm the definition | Review eligibility, independence, and scores. | Manager and technician; R2/R3 | Agreed scope, objective, and constraints | Revise or stop if important requirements are missing. |
| 2: Implement and check | Build the demonstration and execute S1–S3. | Student developer; fictional inputs | Reproducible functional checks | Proceed only if the stated cases pass. |
| 3: Shadow evaluation | Compare recommendations without automatically changing operations. | R1 and separately recorded outcomes | Feasibility errors and priority tradeoffs | Agree acceptance thresholds before collecting evaluation outcomes. |

### 8.2 Decision Requested from the Company

Request a definition-review meeting and permission to inspect a small set of completed-job records. Ask the manager to confirm priority meanings and mandatory constraints. Cost, duration, and benefit estimates remain TBD until scope and record quality are reviewed. Do not request production adoption based solely on the toy comparison.

## 9. LLM Discussions and Independent Review

**These rows are fictional illustrations of the format, not actual chat records. Replace them with your real discussions and checks.**

| Example | Question or purpose | Main LLM suggestion | Your assessment and reason | Verification method / evidence | Final use in the submission |
|---|---|---|---|---|---|
| 1 | Choose a method for a small input. | Train a model to rank jobs. | Prefer enumeration because the explicit objective and constraints already define the toy calculation and no training data is supplied. | Review the input contract and 12-job bound. | Section 5 alternatives |
| 2 | Describe the baseline. | Call arrival-order selection the organization's current process. | Remove that claim: current practice is unknown. | Compare with the example's stated conditions. | Sections 1.1 and 5.1 |
| 3 | Explain the expected comparison. | Present the 20-point difference as a productivity improvement. | Restrict the claim to priority points on one fictional case. | Check O1 and the absence of operational outcomes. | Sections 3.1 and 6.3 |

## 10. Evidence and Revision Record

### 10.1 Evidence Register

| Evidence ID | Type | Source / link or reproduction location | What it establishes | Date checked |
|---|---|---|---|---|
| E1 | Fictional specification | Sections 1.1 and 7.3 of this file | Invented jobs, values, and default capacity | Illustrative version 1.0 |
| E2 | Reproducible arithmetic | Enumerate the eight subsets of A, B, C using E1 | Expected S1 selections and totals, not browser execution | Illustrative version 1.0 |

### 10.2 Important Revisions

These entries illustrate a revision record for the fictional discussion examples above.

| Item revised or reviewed | Trigger / evidence | Final judgment | Effect on the demonstration and proposal |
|---|---|---|---|
| Baseline description | No source for current practice | Call it a proposed comparison baseline. | Avoid an unsupported presentation claim. |
| Benefit wording | Points are not measured operational output. | Report 190 versus 210 on the fictional case only. | Include a separate real-world evaluation plan. |
