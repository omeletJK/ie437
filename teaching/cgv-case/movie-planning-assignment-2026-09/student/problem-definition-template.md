# Problem Definition: [Proposal Title]

| Item | Your entry |
|---|---|
| Author / student ID or team | |
| Date / version | |
| Proposal summary | Two or three sentences |
| Demonstration / presentation | `demo.html` / `proposal.html` |
| LLM tools and scope of use | Tool/model, dates used, and tasks supported |

> Writing rules: Connect factual claims to evidence IDs `[E#]`. Use `[ASSUMPTION]` for working assumptions, `TBD` for unresolved information, and `N/A — reason` when something does not apply. Replace instructions and empty example rows with your content before submitting. Keep the section headings and add table rows as needed. Save the completed file as `problem-definition.md`.

## 1. Business Context and Scope

### 1.1 Problem to Address

- The company's difficulty or opportunity:
- Intended users and their tasks:
- Current practice and established limitations, or questions that need confirmation:
- The outcome that should improve, and why:

### 1.2 One-Sentence Problem Statement

> [Who] uses [what information], [when or under what conditions], to [make what judgment or decision], in order to improve [what outcome].

### 1.3 Scope and Success Conditions

| Item | Description | Evidence / assumption / unknown |
|---|---|---|
| Included in this proposal | | |
| Excluded or simplified | | |
| Consequences of those exclusions or simplifications | | |
| Conditions for judging success | | |

## 2. Problem Structure and Classification

### 2.1 Analysis and Decision Structure

Explain the flow from inputs to the use of results. For multiple decisions, identify who makes each and how they affect one another. Distinguish analytical outputs from actions taken in practice.

| Element ID | Analysis or decision | Responsible person / user | Inputs | Outputs | Relationship to the next element |
|---|---|---|---|---|---|
| | | | | | |

### 2.2 Classification and Rationale

State the object being classified and the problem conditions supporting your judgment. If you lack enough information, record the questions needed to classify it.

| Dimension | Options and criteria |
|---|---|
| Decision Structure | `Flat`: no parent–child decision dependency. `Hierarchical`: a higher-level decision changes a lower-level decision's available actions, constraints, objectives, or other conditions. A sequence of tasks alone does not establish a hierarchy. |
| State Structure | `Stateless`: no problem state is carried between decisions. `Stateful`: state changes through actions and is passed to subsequent decisions. Using time-series data alone does not make a decision stateful. |
| Information Structure | `Open-loop`: actions are fixed before new information is observed. `Feedback`: new information is observed and used to change subsequent actions. Repeated execution alone does not establish feedback. |
| Component Model | `Formulation`: explicit variables, equations, objectives, or constraints calculate results. `Simulation`: time, events, or interactions are modeled to evaluate results. `Data-driven`: relationships are learned from data for estimation or evaluation. |

Apply Decision Structure to the overall relationship between decisions, State and Information Structure to each decision, and Component Model to each computational component. Preserve different classifications for different components. Decision-related dimensions may not apply to a scope limited to prediction or analysis; explain why and how its outputs will be used.

| Dimension | Object being classified | Classification | Supporting conditions | Unknown conditions / follow-up questions |
|---|---|---|---|---|
| Decision Structure | | | | |
| State Structure | | | | |
| Information Structure | | | | |
| Component Model | | | | |

## 3. Computable Problem Definition

### 3.1 Objectives and Measurement

Distinguish desired business outcomes from metrics calculated by your model or demonstration, and explain their relationship. Explain priorities if metrics conflict. Do not present unsupported targets as agreed requirements.

| Objective ID | Objective / metric | Formula, unit, and aggregation scope | Direction | Comparison baseline | Basis for the target or method to establish it |
|---|---|---|---|---|---|
| O1 | | | | | |

### 3.2 Outputs and Decisions

| Decision ID | Recipient | Analytical output | Judgment or action taken in practice | What can be controlled | Timing and frequency |
|---|---|---|---|---|---|
| D1 | | | | | |

### 3.3 Constraints, Preferences, and Settings

| Constraint ID | Rule | Hard constraint / preference | Applies to | Value or condition | Evidence / assumption | Demonstration implementation / check |
|---|---|---|---|---|---|---|
| C1 | | | | | | |

| Setting ID | Adjustable setting | Meaning | Default and range | Reason for the choice | Effect on results |
|---|---|---|---|---|---|
| P1 | | | | | |

### 3.4 Time, Information, and State Boundaries

- Period covered by one analysis or decision:
- Information available at the time of the decision:
- State carried forward, transition rules, and initial/terminal conditions:
- Conditions that trigger another calculation or decision:
- Changes allowed or prohibited after the decision is committed:

Explain why any item does not apply to your chosen scope.

## 4. Data Interpretation and Additional Information

### 4.1 Meaning and Intended Use of Existing Records

- The event represented by one row and the unit of analysis:
- What the records directly establish:
- What cannot be established from the records alone:
- Required transformations and their assumptions:
- Potential effects of missing values, duplicates, errors, or selection bias:

| Data ID | Field / entity | Meaning, unit, and linking key | Availability / quality checks | Transformation | Related objectives, decisions, or constraints |
|---|---|---|---|---|---|
| X1 | | | | | |

### 4.2 Additional Information Requests

| Request ID | Information and specific fields needed | Why it is needed | Analysis or decision it would change | Provider / collection method | Priority | Fallback if unavailable |
|---|---|---|---|---|---|---|
| R1 | | | | | | |

### 4.3 Assumptions and Open Questions

| ID | Assumption or unknown | Reason for current treatment | Consequence if incorrect | Question and verification method | Treatment before verification |
|---|---|---|---|---|---|
| Q1 | | | | | |

### 4.4 Uncertainty and Limits of Interpretation

- Main reasons the results might differ from expectations:
- How these differences will be represented or examined:
- Conditions under which the recommendation should not be trusted:
- What should be reviewed when additional information becomes available:

## 5. Proposed Approach and Rationale

### 5.1 Comparison of Alternatives

Compare at least two approaches. A simple approach is acceptable. Explain the inputs, mechanism, outputs, and conditions for use, rather than listing method names alone.

| Approach | How it works | Required information | Strengths | Limitations / assumptions | Implementation and operating effort | Selection and rationale |
|---|---|---|---|---|---|---|
| A | | | | | | |
| B | | | | | | |

### 5.2 Calculation Flow of the Selected Approach

Use equations, pseudocode, or a sequence of steps. Another person should be able to follow how inputs and settings affect outputs.

| Component | Inputs X#/P# | Processing logic | Output / next stage | What should be evaluated | Demonstration implementation level |
|---|---|---|---|---|---|
| | | | | | |

### 5.3 Failures and Fallback Actions

- Behavior under insufficient information, invalid input, or calculation failure:
- Conditions under which the output should not be used:
- What a person must review or modify:

## 6. Evaluation Plan and Demonstration Findings

### 6.1 Comparison and Evaluation Design

- Baseline method or reference plan and why it was chosen:
- Evaluation data and conditions for a fair comparison:
- Separation of information used as input from evaluation outcomes:
- Metrics and criteria for success or failure:
- What the demonstration can establish:
- What requires actual data or a field trial:

### 6.2 Normal, Boundary, and Failure Scenarios

| Scenario ID | Type | Inputs and conditions | Expected result or property | Pass criterion | Observed demonstration result | Reproduction steps |
|---|---|---|---|---|---|---|
| S1 | Normal | | | | | |
| S2 | Boundary | | | | | |
| S3 | Failure | | | | | |

### 6.3 Findings and Remaining Limitations

| Check or experiment | Observed result | Evidence / reproduction location | Supported conclusion | Conclusion not yet supported |
|---|---|---|---|---|
| | | | | |

Write `Not run` for checks you have not executed. Do not describe results from fictional cases as actual business performance.

## 7. Demonstration Design and Execution

### 7.1 Representative User Workflow

Describe who prepares inputs, what they inspect, and what they decide, in sequence.

### 7.2 Mapping from Definition to Implementation

| Screen / feature | Related O#/D#/C#/X#/S# | Actual calculation / mock calculation / not implemented | What the user can verify |
|---|---|---|---|
| | | | |

### 7.3 Fictional Data and Execution Instructions

- Data construction and generation rules:
- Differences from actual data:
- Reproduction method and use of randomness:
- How to open `demo.html` and reproduce representative scenarios:
- Browser checked and offline execution result:

## 8. Proposed Plan for the Company

### 8.1 Staged Plan

| Stage | Work to perform | Required information and roles | Result to examine | Criteria to proceed or stop |
|---|---|---|---|---|
| | | | | |

### 8.2 Decision Requested from the Company

- Information to obtain or confirm first:
- Scope of the first evaluation or trial:
- Required cooperation and responsibilities:
- Basis for estimates of cost, duration, and benefit, or conditions needed to estimate them:
- Specific next action you want the company to approve:

## 9. LLM Discussions and Independent Review

Select three important discussion examples rather than submitting entire conversations. Use short excerpts or accurate summaries. Verifying a suggestion you accepted is a valid example.

| Example | Question or purpose | Main LLM suggestion | Your assessment and reason | Verification method / evidence | Final use in the submission |
|---|---|---|---|---|---|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |

## 10. Evidence and Revision Record

### 10.1 Evidence Register

Distinguish the assignment's stated conditions, checked external sources, and observations from your own executed demonstration.

| Evidence ID | Type | Source / link or reproduction location | What it establishes | Date checked |
|---|---|---|---|---|
| E1 | Assignment brief | Assignment instructions | | |

### 10.2 Important Revisions

Record important changes prompted by LLM discussions or demonstration development. If your approach did not change, you may record how you rechecked its main assumptions.

| Item revised or reviewed | Trigger / evidence | Final judgment | Effect on the demonstration and proposal |
|---|---|---|---|
| | | | |
