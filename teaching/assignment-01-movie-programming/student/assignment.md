# Assignment 1: Movie Programming — Problem Definition and Decision-Support Design

**IE437 · Student assignment brief · Version 2.0**

**Submission deadline: Fri, 9 Oct 2026 · 23:59 KST (UTC+9).** Submit by the end of Friday, 9 October.

## 1. Purpose

**Your central task is to turn an incomplete business request into a defensible decision problem, demonstrate its core mechanism, and propose a credible next step to the client.**

Develop a proposal for a fictional cinema operator. Here, **movie programming** means choosing which movies to screen, in which screening rooms, and at what times. Work with a large language model (LLM) to define the problem, identify information needs, compare approaches, and evaluate your proposal.

Your work will produce three connected deliverables:

**Problem definition in Markdown → interactive demonstration in HTML → proposal presentation in HTML.**

This assignment assesses your ability to interpret a business problem, distinguish evidence from assumptions, design and evaluate an approach, and communicate a proposal that a client can act on. You are encouraged to use generative AI throughout the assignment.

No particular algorithm or model is prescribed. A justified simple method can receive full base credit.

## 2. Client Brief and Available Information

A fictional cinema operator manages screening schedules at its cinemas. It wants to use its records to understand its audience and improve movie-programming decisions. You are proposing a solution to this company. The company is a cinema operator, rather than a film production studio; its precise operating practices and decision rules still need investigation.

The company has member booking and purchase records containing these fields:

| Field | Description |
|---|---|
| Member ID | Identifier of the member who made the booking or purchase |
| Movie | Identifier or title of the booked movie |
| Screening date and time | Date and time of the booked screening |
| Cinema | Location of the booked screening |
| Number of tickets purchased | Number of tickets paid for in that purchase |

For this assignment, you are given the existence and descriptions of these fields, rather than an actual dataset. Dataset size, coverage period, quality, current business practices, and existing performance are not specified. Do not treat unspecified information as an established fact. Create a small fictional dataset for your demonstration.

Using this information as your starting point, address the following questions:

- What problem should the company address first, and what is the scope of your proposal?
- Who will use the results, and what decisions will they support?
- What can you establish from the available information, and what needs further investigation?
- What additional information should you request, why do you need it, and what will you do if it is unavailable?
- Which approach do you recommend, and how will you evaluate its validity and usefulness?
- Under what conditions should the company test, adopt, revise, or stop the proposal?

Choose and justify your own scope and approach. Explain what you exclude. If your scope focuses on prediction or analysis, identify the programming decision it supports, who makes that decision, and how they would use the output. A small, well-defined demonstration is sufficient; you do not need to solve an entire cinema network's scheduling problem.

**A strong submission may explain why the available records are insufficient for the full programming decision and define a narrower first step, supported by explicit assumptions and an information-gathering plan.** You must still demonstrate a meaningful mechanism within that scope and explain what would be needed to extend it. A statement that information is missing, by itself, is not a complete submission.

## 3. Workflow

1. **Discuss the problem with an LLM and write the problem definition.** Define the problem boundary and decisions first. Identify dependencies and evaluation components, then derive classifications using the supplied reference. Organize the remaining definition in the seven-section template and record your own review of important LLM suggestions.
2. **Build a fictional demonstration from the problem definition.** Show what the proposed system takes as input, how it produces results, and how a user would inspect and use them.
3. **Revise the definition using what you learn from the demonstration.** Resolve omissions, contradictions, and unsupported assumptions where possible. Record remaining limitations.
4. **Create a proposal presentation for the company.** Use the definition and demonstration to explain the problem, recommended approach, evidence, evaluation plan, and requested next steps.

The final versions of all three deliverables must agree. Do not describe an unimplemented feature or an untested business benefit as an achieved result.

## 4. Deliverables

Write all three deliverables in English. Place them in the same folder and submit one ZIP file named `studentID_name.zip`. For a team submission, use the team identifier specified by your instructor.

The instructor will announce the individual/team format, submission location, and presentation duration separately.

| File | Required content | Intended reader |
|---|---|---|
| `problem-definition.md` | Problem definition using the supplied template, including LLM use and review | A colleague who needs to understand, challenge, or implement the approach |
| `demo.html` | An interactive fictional demonstration based on the definition | A user evaluating how the proposed system would work |
| `proposal.html` | A presentation proposing the solution to the company | A client deciding whether to support a trial or adoption |

### 4.1 Problem Definition

Copy [the Markdown template](problem-definition-template.md) and save your completed version as `problem-definition.md`. Keep its seven section headings, but adapt table rows and depth to your scope:

1. Decision, Scope & Problem Structure
2. Computable Problem
3. Information & Uncertainty
4. Alternatives & Selected Approach
5. Demonstration & Evaluation
6. Client Proposal
7. LLM Review & Key Revisions

Use the [Problem Structure and Classification Reference](problem-classification-reference.md). It preserves four distinct properties: Decision Structure, State Structure, Information Structure, and Component Model. Derive labels from the boundary, dependencies, state transitions, information use, and component calculations. Keep the Role of a component (Cost, Constraint, State-transition) separate from its Model (Formulation, Simulation, Data-driven). Answer only the applicable follow-up questions; use `unknown` with a confirmation question when classification is unresolved, and `N/A — reason` for inapplicable items. The reference is not another deliverable.

An [illustrative completed example](problem-definition-example.md) shows the format using a separate, fictional makerspace problem. It demonstrates the writing style and level of specificity; it is not a solution to this assignment or a required choice of method.

Your definition must:

- Cite factual claims beside the text or table they support; a separate evidence register is optional.
- Mark working assumptions with `[ASSUMPTION]`.
- Mark unresolved information as `TBD` and state how it should be clarified.
- Explain the purpose, priority, and fallback for each additional information request.
- Compare at least two approaches and justify your choice.
- Document three important LLM discussion examples: the suggestion, your assessment, how you checked it, and what you finally used.

Write each explanation once and refer back to it when needed. Keep stable decision/component IDs for traceability; IDs for every datum, setting, source, or scenario are optional. Document length and the number of completed tables are not grading criteria. Relevant unanswered questions are preferable to invented completeness.

Do not invent facts to fill every field. Well-identified unknowns and useful follow-up questions are part of a strong submission.

### 4.2 Interactive Demonstration

Implement one small, meaningful workflow from your definition. A production system, a large trained model, and a complete optimization engine are not required. Simple rules, small calculations, and explicitly labeled mock calculations are acceptable.

The demonstration must:

- Allow input or condition changes to produce different results through an explained rule or calculation.
- Support input → execution → inspection of results and reasons → modification and another execution.
- Compare the proposed result with a baseline method or reference plan.
- Identify fictional data, the calculation method, mocked results, and unimplemented features.
- Include at least one normal case, one boundary case, and one failure case that can be executed or reproduced. For a failure, explain the problem and available response instead of presenting an invalid result as valid.
- Reproduce results for the same inputs and settings. If you use randomness, provide a fixed seed or another reproducibility mechanism.

Put the baseline and proposed result under the same stated inputs and evaluation conditions. Do not label a heuristic or illustrative recommendation as a proven optimum unless you can justify that claim for the defined problem.

Static screenshots or arbitrary changes to chart values are not sufficient. Explain how assumptions and calculations produce the results.

### 4.3 Proposal Presentation

Create `proposal.html` as a presentation you could deliver to the company. Approximately 8–12 slides are recommended; slide count itself is not graded. Connect these topics into a coherent argument:

1. The problem, intended users, and expected value
2. Available information, important assumptions, and unresolved questions
3. Alternatives considered and the reason for your recommendation
4. The system's inputs, processing, outputs, and user workflow
5. A representative demonstration, baseline comparison, and what was established
6. A plan for evaluating real-world effects, including success and stopping criteria
7. Additional information requests, implementation stages, and responsibilities
8. Limitations, risks, and the next decision requested from the company

Distinguish demonstrated functionality from effects that still require real data or a field trial. For estimated improvements, costs, or timelines, explain the evidence, assumptions, and calculation. If an estimate is not yet justified, explain what must be established before making it.

### 4.4 Technical Requirements

- Both HTML files must open directly in a standard desktop browser after extraction.
- They must work without a server, package installation, login, API key, or internet connection.
- Embed CSS, JavaScript, fictional data, and required assets within each HTML file. Do not depend on external CDNs, fonts, or images.
- You may link from `proposal.html` to `demo.html` using a relative link. The proposal must still contain its own essential explanation.
- Before submitting, open both files without internet access and check the main workflows and links.

## 5. Grading Rubric

### Problem Definition: 50 Points

| Criterion | Points | What a strong submission demonstrates |
|---|---:|---|
| Scope, intended use, and classification | 10 | Defines the boundary and decisions, explains dependencies and exclusions, and derives classifications consistently from the structure; identifies unresolved facts. |
| Computable problem definition | 15 | Connects variables/outputs, objectives, constraints, and inputs; defines meaningful evaluation components with separate Roles and Models, and relevant state/information details. |
| Data interpretation, assumptions, and information requests | 10 | Interprets records and their limitations accurately; separates facts, assumptions, and unknowns; makes specific requests with purposes, priorities, and fallbacks. |
| Approach selection and evaluation plan | 10 | Compares alternatives and connects the chosen approach to a baseline, metrics, experiments, and failure criteria; separates expected benefits from established results. |
| LLM use and independent review | 5 | Explains how important suggestions were checked, accepted, modified, deferred, or rejected, and identifies their final use. |

### Interactive Demonstration: 25 Points

| Criterion | Points | What a strong submission demonstrates |
|---|---:|---|
| Executable core workflow | 10 | Input changes, execution, result inspection, and repeated execution work and reveal the proposal's core mechanism. |
| Consistency with the definition | 8 | Stated inputs, assumptions, objectives, and constraints appear in the actual behavior and baseline comparison; mock and unimplemented elements are explicit. |
| Verifiability and reproducibility | 7 | Normal, boundary, and failure cases can be checked; calculation logic and reproduction steps are explained; the files run in the required environment. |

### Proposal Presentation: 25 Points

| Criterion | Points | What a strong submission demonstrates |
|---|---:|---|
| Communication of the problem and value | 7 | Explains the need, intended users, and expected value from the company's perspective. |
| Reasoning and supporting evidence | 8 | Connects alternatives, the recommendation, demonstration observations, and limitations; claims agree across all three deliverables. |
| Actionable adoption proposal | 7 | Specifies information needs, responsibilities, stages, evaluation conditions, and a concrete next decision. |
| Presentation clarity | 3 | Uses a readable structure and effective explanations, figures, tables, and links to the demonstration. |

**The base score is 100 points. Up to 10 additional points are available for advanced insight.** Independently identify an important feature of the problem and develop its implications through your approach, demonstration, comparison, or evaluation plan. Naming a sophisticated technique or adding complexity is not sufficient. Base and additional points will be recorded separately; the maximum total is 110.

Across all criteria:

- Clear evidence and well-defined unknowns are valued more than unsupported completeness.
- Classification is evaluated within your stated boundary. Complexity, a particular label, document length, or filling irrelevant sections does not earn credit by itself.
- A simple approach can receive high marks when it is appropriate, justified, and evaluated.
- Visual decoration, paid AI access, model brand or count, and prompt length or count do not earn marks by themselves.
- You may use AI-generated writing and code. You are responsible for explaining key assumptions, calculations, results, and limitations.

Partial credit reflects the quality of the work within each criterion: a strong answer is specific, supported, consistent, and checkable; a partially complete answer has a sound idea but missing connections or checks; a superficial answer names concepts without applying them; an absent or materially incorrect answer does not meet the criterion. A documented `TBD` with a useful investigation plan can earn credit. An unsupported assertion cannot replace evidence.

## 6. LLM Use and Sources

You may use LLMs to interpret the problem, explore alternatives, research, write formulas and code, debug, organize the presentation, and review your work. Record the tools or models used and their roles in the definition. Paid tools are not required.

An LLM response is not evidence that an external factual claim is true. Check original sources and cite them when you use such claims. Complete chat histories are not required. Select important discussion and review examples. You do not need to manufacture disagreements or mistakes; explaining how you verified an accepted suggestion is equally valid.

## 7. Submission Checklist

- [ ] The ZIP contains one Markdown file and two HTML files with the required names.
- [ ] All three deliverables are written in English.
- [ ] Scope, terminology, assumptions, calculations, and claims agree across the deliverables.
- [ ] Classifications follow the supplied reference and the defined structure; component Roles and Models are separate.
- [ ] Facts, assumptions, unknowns, and fictional results are clearly distinguished.
- [ ] Additional information requests include fallbacks if information is unavailable.
- [ ] A baseline comparison and normal, boundary, and failure cases have been checked.
- [ ] Three important LLM discussion examples and my own review are documented.
- [ ] Both HTML files work without internet access, a server, or an API key.
- [ ] The presentation includes an evaluation plan and a concrete decision requested from the company.
