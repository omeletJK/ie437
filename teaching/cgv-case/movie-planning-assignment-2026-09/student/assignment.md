# Assignment: From Movie Transaction Records to a Decision-Support Proposal

## 1. Purpose

Develop a proposal for a fictional film company using limited information. Work with a large language model (LLM) to define the problem, identify information needs, compare possible approaches, and explain how your proposal should be evaluated.

Your work will produce three connected deliverables:

**Problem definition in Markdown → interactive demonstration in HTML → proposal presentation in HTML.**

This assignment assesses your ability to interpret a business problem, distinguish evidence from assumptions, design and evaluate an approach, and communicate a proposal that a client can act on. You are encouraged to use generative AI throughout the assignment.

## 2. Client Brief and Available Information

A fictional film company wants to use its records to understand its audience and improve decisions about movie demand and screening schedules. You are proposing a solution to this company.

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

Choose and justify your own scope and approach. Explain what you exclude. If your scope focuses on prediction or analysis, explain how its outputs will be used.

## 3. Workflow

1. **Discuss the problem with an LLM and write the problem definition.** Use the supplied template to organize the scope, classification, objectives, inputs, constraints, assumptions, information requests, and proposed approach. Critically review the LLM's suggestions and record the reasons for important decisions.
2. **Build a fictional demonstration from the problem definition.** Show what the proposed system takes as input, how it produces results, and how a user would inspect and use them.
3. **Revise the definition using what you learn from the demonstration.** Resolve omissions, contradictions, and unsupported assumptions where possible. Record remaining limitations.
4. **Create a proposal presentation for the company.** Use the definition and demonstration to explain the problem, recommended approach, evidence, evaluation plan, and requested next steps.

The final versions of all three deliverables must agree. Do not describe an unimplemented feature or an untested business benefit as an achieved result.

## 4. Deliverables

Write all three deliverables in English. Place them in the same folder and submit one ZIP file named `studentID_name.zip`. For a team submission, use the team identifier specified by your instructor.

| File | Required content | Intended reader |
|---|---|---|
| `problem-definition.md` | Problem definition using the supplied template, including LLM use and review | A colleague who needs to understand, challenge, or implement the approach |
| `demo.html` | An interactive fictional demonstration based on the definition | A user evaluating how the proposed system would work |
| `proposal.html` | A presentation proposing the solution to the company | A client deciding whether to support a trial or adoption |

### 4.1 Problem Definition

Copy [the Markdown template](problem-definition-template.md) and save your completed version as `problem-definition.md`. Keep its section headings, but adjust the depth and number of table rows to your scope. Use `N/A — reason` when a section does not apply.

An [illustrative completed example](problem-definition-example.md) shows the format using a separate, fictional makerspace problem. It demonstrates the writing style and level of specificity; it is not a solution to this assignment or a required choice of method.

Your definition must:

- Link factual claims to their sources.
- Mark working assumptions with `[ASSUMPTION]`.
- Mark unresolved information as `TBD` and state how it should be clarified.
- Explain the purpose, priority, and fallback for each additional information request.
- Compare at least two approaches and justify your choice.
- Document three important LLM discussion examples: the suggestion, your assessment, how you checked it, and what you finally used.

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
| Scope, intended use, and classification | 10 | Identifies who decides what and when; supports classifications with problem conditions; explains exclusions. |
| Computable problem definition | 15 | Connects objectives, outputs, decisions, constraints, settings, and inputs consistently enough for another person to understand the implementation direction. |
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
- A simple approach can receive high marks when it is appropriate, justified, and evaluated.
- Visual decoration, paid AI access, model brand or count, and prompt length or count do not earn marks by themselves.
- You may use AI-generated writing and code. You are responsible for explaining key assumptions, calculations, results, and limitations.

## 6. LLM Use and Sources

You may use LLMs to interpret the problem, explore alternatives, research, write formulas and code, debug, organize the presentation, and review your work. Record the tools or models used and their roles in the definition. Paid tools are not required.

An LLM response is not evidence that an external factual claim is true. Check original sources and cite them when you use such claims. Complete chat histories are not required. Select important discussion and review examples. You do not need to manufacture disagreements or mistakes; explaining how you verified an accepted suggestion is equally valid.

## 7. Submission Checklist

- [ ] The ZIP contains one Markdown file and two HTML files with the required names.
- [ ] All three deliverables are written in English.
- [ ] Scope, terminology, assumptions, calculations, and claims agree across the deliverables.
- [ ] Facts, assumptions, unknowns, and fictional results are clearly distinguished.
- [ ] Additional information requests include fallbacks if information is unavailable.
- [ ] A baseline comparison and normal, boundary, and failure cases have been checked.
- [ ] Three important LLM discussion examples and my own review are documented.
- [ ] Both HTML files work without internet access, a server, or an API key.
- [ ] The presentation includes an evaluation plan and a concrete decision requested from the company.
