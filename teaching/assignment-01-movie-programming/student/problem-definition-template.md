# Problem Definition: [Proposal Title]

**IE437 Assignment 1 · Movie Programming — Problem Definition and Decision-Support Design**

Author / student ID or team: [entry]  
Date / version: [entry]  
Summary: [two or three sentences]  
Files: `problem-definition.md`, `demo.html`, `proposal.html`  
LLM tools and use: [tool/model, dates, and tasks supported]

Use the seven sections below. Replace prompts with your answer; adapt table rows to your scope. Cite sources beside the claims they support. Mark assumptions `[ASSUMPTION]`, unresolved facts `TBD`, and inapplicable items `N/A — reason`. Do not duplicate the same explanation across sections. Stable IDs are needed for decisions and components; a separate ID for every datum, setting, source, or test is optional.

Read the [classification reference](problem-classification-reference.md) and [separate-domain example](problem-definition-example.md). An unresolved classification is `unknown`, not a guessed label.

## 1. Decision, Scope & Problem Structure

State the business need and complete this sentence:

> [Who] uses [what information], [when], to decide [what], in order to improve [what outcome].

Define the **problem boundary**: what interval and sequence of decisions constitute one problem? State exclusions and their consequences. Distinguish known current practice from an assumed baseline. If you choose a narrower first step, justify it and name the decision it supports.

List each real decision with a stable ID, what is chosen, and who uses or approves it. Describe dependencies as `parent → child: what changes`, or explain why none exists. A forecast or processing step is not automatically a decision. Separate dependencies from any `evaluated_by` relationship. Plain text, a table, or YAML is acceptable.

Derive classifications from this structure; repeat decision rows as needed. Component Models belong in Section 2.

| Object | Property | Classification (or unresolved status) | Structural evidence or question to resolve |
|---|---|---|---|
| Decision dependency graph | Decision Structure | Flat / Hierarchical; if unresolved: unknown | |
| [Decision ID] | State Structure | Stateless / Stateful; if unresolved: unknown | |
| [Decision ID] | Information Structure | Open-loop / Feedback; if unresolved: unknown | |

For Information Structure, explain whether the choice follows an operational requirement or a design decision, where known. Keep execution frequency, triggers, and automatic/manual operation separate from classification.

## 2. Computable Problem

Define controllable variables or supported outputs, domains, units, and available inputs/settings. Specify the objective, how it is measured, and priorities if objectives conflict. Distinguish the computed metric from the business outcome it is intended to support.

Describe evaluation in meaningful components. Keep each component's Role and Model separate, using the reference definitions. Include equations, pseudocode, or precise rules here; refer back to them in Section 4.

| Component ID | Decision ID | Role: Cost / Constraint / State-transition | Model: Formulation / Simulation / Data-driven | Definition, units, and evidence / assumption / unknown |
|---|---|---|---|---|
| | | | | |

Identify hard constraints versus preferences. Specify how invalid or infeasible inputs are handled. Mark unresolved models `unknown`; do not invent components to fill categories. Cost can represent an objective/performance measure; state its direction.

Answer only the applicable follow-up questions in the [reference](problem-classification-reference.md#5-follow-up-questions-only-where-applicable), including state transitions or observation timing when relevant. Cross-reference an existing answer instead of writing it again.

## 3. Information & Uncertainty

Explain what one record represents, the unit of analysis, what is directly established, what is not, and any transformations or quality checks needed. Separate information available at decision time from later outcomes.

Use one table for important evidence, assumptions, unknowns, and information requests. Request specific fields, with a provider/collection method and priority. Explain the effect on the decision and the fallback if the information cannot be obtained.

| Fact / assumption / unknown or request | Evidence or reason for current treatment | Why it matters | How to confirm or obtain it; priority | Fallback or limit until confirmed |
|---|---|---|---|---|
| | | | | |

Explain the main uncertainties, how you will examine their effect, and when the recommendation should not be trusted. A justified unknown with a useful investigation plan is a valid result.

## 4. Alternatives & Selected Approach

Compare at least two approaches, including a simple option where useful.

| Approach | Mechanism and required information | Strengths, limitations, and effort | Selection and reason |
|---|---|---|---|
| A | | | |
| B | | | |

Give the selected calculation flow from input to output, referring to Section 2's rules. Explain tie-breaking or randomness where applicable. Identify actual calculations, illustrative/mock calculations, and unimplemented parts. Do not claim optimality beyond what your method establishes.

## 5. Demonstration & Evaluation

Explain how to open `demo.html`, construct or load the fictional data, change an input, execute, inspect the result, and repeat. State the browser checked, offline result, and seed/reset mechanism if used. Map the core behavior to named decisions/components in Section 2; a separate mapping table is unnecessary.

Define the baseline, metrics, and common comparison conditions. Keep evaluation outcomes separate from information used to make the recommendation.

| Case | Inputs / reproduction steps | Expected result / pass criterion | Observed result and supported conclusion |
|---|---|---|---|
| Normal | | | |
| Boundary | | | |
| Failure | | | |

Write `Not run` for unexecuted checks. Summarize what the demonstration establishes and what it does not. These are functional/model checks; real-world adoption criteria belong in Section 6.

## 6. Client Proposal

Briefly state the proposed next steps, responsible roles, required information, and the first real-data evaluation or trial. Define conditions to proceed, revise, or stop; distinguish these from the functional checks above. Refer to Section 3's information requests instead of repeating them.

End with the concrete decision requested from the company. Justify any cost, timing, or benefit estimate, or explain what is needed before estimating it. Use this argument in `proposal.html`, keeping its claims consistent with the demonstration.

## 7. LLM Review & Key Revisions

Record three important discussions and your own checks. Accepted suggestions are valid examples; you do not need to find three mistakes. Combine important revisions with this record rather than maintaining another change log.

| Discussion / purpose | LLM suggestion | Your assessment and verification evidence | Final decision or revision; location in the deliverables |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
