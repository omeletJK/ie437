# Midterm Project: Distribution-Centre Network Redesign — A Hierarchical Decision under Uncertainty

**IE437 · Midterm project brief · Version 1.0**

**Release: Mon, 19 Oct 2026 · 10:00 KST. Submission deadline: Mon, 2 Nov 2026 · 10:00 KST (UTC+9).** Fourteen days. Individual submission.

## 1. Purpose

**Your central task is to turn an open management question into a hierarchical decision problem, build a reproducible fictional world in which to study it, and show with your own evidence which network is better — and why that evidence can be trusted.**

This project is the midterm examination of the course, in the form of Assignment 1: a problem definition in Markdown, an interactive demonstration in HTML, and a proposal presentation in HTML. It differs from Assignment 1 in one respect. **The methods are prescribed.** Lectures 1, 2, 4 and 5 supply the required tools (Section 4), and applying them correctly to this problem is what is assessed. Lectures 3 and 6 are optional extensions (Section 7, additional points).

Work with a large language model (LLM) throughout. You are responsible for every claim, calculation and line of code you submit.

## 2. Management Brief

Dasol Retail (fictional) runs a nationwide **convenience-store chain** of about ten thousand stores. Every store receives one delivery each day from a distribution centre (DC): a vehicle leaves its DC before dawn, visits several stores in sequence, and returns. There are twelve DCs today. Which store belongs to which DC was fixed long ago and has barely changed since. The chain is fictional; the industry is real, and the operating constraints in Section 2.1 are the ones your network must respect.

Several DC leases expire over the next few years, one after another. Management sees this as a chance to redesign the network and has asked for a review. At the review meeting, four people spoke:

- **Strategy & Planning:** "Cut the DCs from twelve to eight and the lease and staff costs fall sharply."
- **Delivery Operations:** "Fewer DCs means each one covers a wider area. Vehicles drive farther and longer, so we need more of them — it may end up costing more."
- **Data Team:** "Take the centre of gravity of store locations weighted by volume and you have the optimal site. The calculation takes minutes."
- **Field Manager:** "And if that centre of gravity lands across the river? It looks close on the map, but our trucks drive to the bridge."

Management then asked: **"How many DCs should we have, and where? And what will you show us to prove that the answer is right?"**

You have joined the company as a research engineer and must build the first prototype of a decision-support system that answers this question. **No operating data has been handed over yet.** Deciding what the data would look like, and generating it, is part of the task.

### 2.1 Company settings

To limit the assumptions you must invent, the company's basic settings are fixed below. You may change any of them with a stated reason.

| Item | Default setting |
|---|---|
| Stores | About 10,000 convenience stores, open 24 hours, spread nationwide but concentrated where population is dense; a small back room, so a store holds no more than about two days of stock |
| Order cycle | Each store orders by an evening cutoff for delivery the next day; the DC picks the orders overnight |
| Deliveries | One delivery per store per day in a multi-temperature vehicle carrying ambient and chilled goods together; a vehicle leaves its DC between 04:00 and 07:00, visits stores in sequence, and returns. Fresh food (lunch boxes, sandwiches) travels in a separate second wave that is **out of scope** unless you bring it in with a stated reason |
| Delivery window | Stores expect the delivery before noon; a delivery after 14:00 counts as a service failure, and a missed delivery costs a stock-out penalty |
| Distribution centres | 12 today; store-to-DC assignment fixed long ago; each DC plans its own routes from experience |
| DC capacity | Between 500 and 1,400 stores per DC — fewer and the DC is not worth keeping, more and loading docks and staff cannot cope |
| DC cost | A monthly fixed cost per open DC (lease, staff, equipment), nearly independent of how busy it is |
| Vehicle cost | A monthly fixed cost per owned vehicle plus fuel per kilometre; on a day when the owned fleet cannot cover the volume, a spot truck is hired for that day at a high daily rate |
| Vehicle limits | About 25 stops and 250 km per vehicle per day within a 10-hour shift including loading; a load capacity in roll cages, so a route whose stores' demand that day exceeds one load must be split |
| Demand | A daily volume per store in roll cages that rises and falls by weekday and season — weekends higher at residential stores and lower at office stores, a summer peak in drinks and ice, holiday spikes — and differs between stores; one to two months of past records exist; a few percent of stores open or close each year |
| Geography | Map distance and road distance differ: rivers with few bridges outside the capital region, mountain ranges crossed at a handful of passes, coastlines; islands are out of scope |
| Current operation | The 12 DCs, the historical assignment and experience-based routes form the **baseline** every proposal is compared with |

### 2.2 How a delivery day runs

Evening: stores send their orders by the cutoff. Night: the DC picks each store's order into roll cages and stages them by route. Early morning: vehicles are loaded and leave; each follows a sequence of stores planned the evening before from the orders received. Morning: stores receive and shelve; the driver collects empty cages. Afternoon: vehicles return, and the next day's routes are planned once the next orders arrive.

Daily routing therefore happens **after** that day's demand is known, while the network — DCs, store assignments, fleet size — is fixed long before any of it is known. Keep this timing in mind when you decide what each level of your problem knows and when.

### 2.3 What you are given, and what you are not

You are given the settings above and the four statements. You are **not** given a dataset, a map, cost figures, or the company's current routes. Do not treat unspecified information as fact. Where you need a number, invent it, label it `[ASSUMPTION]`, and say what would change if it were different. Real map or road data is neither needed nor recommended; every number in your work must come from your own documented generator.

Using this as your starting point, answer the following:

- Are the four statements at the meeting claims of the same kind, which can be lined up and compared, or claims about different things? Which decision does each one concern, and which of your decisions depends on which?
- What exactly will you minimise, under which constraints, and with which inputs and outputs?
- What will you use to **judge** that one network is better than another, and may it be the same criterion you used to **generate** candidate networks? This question is worth a quarter of the marks.
- How many DCs, and where — with evidence, and with the uncertainty of that evidence stated?
- What would be different with real data, and what should the company do first?

## 3. The Fictional World You Must Build

You design and generate every dataset yourself. Your world must satisfy the following, so that the four statements in the meeting are all meaningful inside it. Everything beyond this list is your design, and designing it well is assessed.

- **Geography.** Store coordinates on a plane (kilometres), clustered rather than uniform. At least one **barrier** — a river with a small number of bridges, or an equivalent — so that road distance differs from map distance, and differs by a large factor for some pairs of points. State the rule that turns two coordinates into a road distance; this rule is part of your world and is what your evaluation criterion will use.
- **Demand.** A daily volume per store in roll cages, with weekday and seasonal variation of the kind described in Section 2.1 and with heterogeneity across stores. Some stores have a short history (recently opened). Generate one to two months of daily records.
- **The current network.** The DC locations, the current store-to-DC assignment (fixed long ago, so not necessarily optimal today), and a current fleet per DC. This is the baseline.
- **Candidate DC sites.** Either a finite list of candidate sites with fixed costs, or a continuous region — state which and why.
- **Reproducibility.** A fixed random seed; the same seed must reproduce the same world. The generator must be included in the submission, inside `demo.html` or as a script in `code/`.
- **Scale.** The demonstration world may be smaller than the company (for example one region with 1,500–3,000 stores and three to five DCs) if the capacity ratios and all four statements remain meaningful. Say what you expect to change at full scale.

Give the schema of every table you generate — field, type, unit, meaning — and say why each field exists and which real-world property it reflects. One row of each table must have a stated meaning ("one store", "one store on one day", "one delivery stop").

## 4. Required Analysis — the Course Tools

Each requirement names the lecture whose tool it expects. Completing a requirement with a different tool is possible when you justify the choice and the tool does the same job; naming a lecture is not credit by itself.

**R1 · Formulate the hierarchy (Lecture 1 and the classification reference).** Identify every decision actually taken — the number of DCs, their locations, the store-to-DC assignment, the fleet and daily routes — and write the dependencies between them: which decision changes another's feasible region, parameters or objective, and which lower decision *evaluates* an upper one (`evaluated_by`). Write each level in the standard form of Lecture 1 with its variables, objective and constraints. Say which subproblems are convex (for instance a location problem for one DC under map distance) and which are combinatorial, and what that implies for how far each can be solved exactly. Derive the Decision, State and Information Structure of your problem from this, within a stated boundary.

**R2 · Demand under uncertainty (Lecture 2).** Treat each store's daily demand as uncertain. Fit a Bayesian model with a conjugate update (Poisson–Gamma, Normal–Normal, or another you justify) to the generated history, state the prior and its strength, and show how stores with a short history are handled. Produce the **posterior predictive** of a planning day's demand and use it where demand enters a cost. Vehicle count and spot-truck cost depend on demand through a non-linear rule, so evaluate operating cost over **sampled demand days**, not on an average day, and show the difference the average-day shortcut makes.

**R3 · Generation criterion versus evaluation criterion (Lecture 5; Lecture 1's bilevel design slides).** Define two criteria and keep them apart.

- A **generation criterion** `G`: the cheap score you use to propose candidate networks — map distance, centre of gravity, a continuous approximation of route length, or similar.
- An **evaluation criterion** `E`: the expensive score you use to judge a network — total monthly cost from the DC fixed costs plus operating cost, where operating cost comes from the fleet and kilometres implied by actual routes (or a stated routing estimate) under **road** distance, over sampled demand days.

Show at least one concrete case in your world where the network that is best under `G` is worse under `E` than another candidate, and explain the mechanism — this is the optimiser exploiting a proxy, exactly as in Lecture 5. Then apply at least one of Lecture 5's remedies — a conservative correction to `G`, an uncertainty penalty on `G` using disagreement between several proxies, or system knowledge (put the barrier into `G`) — and show what it changes. Report both how well `G` predicts `E` (prediction quality) and how much cost the `G`-chosen network loses under `E` (decision quality); the two are different numbers.

**R4 · Search under an evaluation budget (Lecture 4).** One evaluation under `E` is expensive: routing every store for a whole network over many demand days. Fix an **evaluation budget** `B` — the number of full `E` evaluations your final search may use — and justify it. Choose where to spend it with a stated rule. The course's default is a surrogate model with an acquisition function over a low-dimensional parameterisation of the network (the number of DCs and a few location parameters), updated after each evaluation. A budgeted search without a surrogate can earn partial credit when its budget and its selection rule are explicit. **Log every call** to `E` — candidate, score, and the rule that chose it — and make the log visible in the demonstration.

**R5 · Baseline, centre-count sweep, recommendation.** Score the baseline under the same `E`, the same sampled demand days and the same routing method as every candidate; a worse routing method for the baseline would make any proposal look good. Sweep the number of DCs across a stated range and show how total cost and its two components move. Recommend a number of DCs and their locations, state the uncertainty of the estimated saving, and say under which assumptions the recommendation would reverse.

Do not claim optimality beyond what your method establishes. Exact solution of the full problem is not expected; deciding how far to solve exactly and from where to approximate — and checking whether the approximation could reverse your conclusion — is.

## 5. Workflow

1. **Define the problem with an LLM and write the definition.** Levels, decisions, dependencies, boundary, classifications, I/O schema.
2. **Design and generate the world.** Schema first, then the generator, then a check that the world has the properties in Section 3.
3. **Build the two criteria and the baseline.** Make `E` run on the baseline before you search.
4. **Search, under the budget.** Generate with `G`, judge with `E`, log every call, apply a remedy, sweep the DC count.
5. **Revise the definition with what the demonstration taught you.** Resolve contradictions; record what remains open.
6. **Write the proposal for management.** Their question, your answer, your evidence, and what to do next.

The final versions of all three deliverables must agree. Do not describe an unimplemented feature or an untested saving as an achieved result.

## 6. Deliverables

Write all deliverables in English. Place them in one folder and submit one ZIP named `studentID_name.zip`.

| File | Required content | Intended reader |
|---|---|---|
| `problem-definition.md` | The problem definition using the supplied template, including the I/O schema, the two criteria, the evaluation log summary, and your LLM review | A colleague who must understand, challenge or implement your approach |
| `demo.html` | A self-contained interactive demonstration: generate the world, change settings, run the search under the budget, inspect the log, compare with the baseline | A manager's analyst checking how the recommendation was produced |
| `proposal.html` | A presentation answering management's two questions | Management deciding whether to proceed |
| `code/` (optional) | Scripts used for heavy computation, with a README and `requirements.txt`; results embedded in the demo must be labelled as precomputed and be reproducible from these scripts with a fixed seed | The same analyst, reproducing your numbers |

### 6.1 Problem Definition

Copy [the Markdown template](problem-definition-template.md) and save your completed version as `problem-definition.md`. Keep its seven section headings:

1. Decision, Scope & Problem Structure
2. Computable Problem — including the I/O schema and the two criteria
3. Information & Uncertainty — including the generated world and the demand model
4. Alternatives & Selected Approach — including the budgeted search
5. Demonstration & Evaluation
6. Client Proposal
7. LLM Review & Key Revisions

Use the [Problem Structure and Classification Reference](problem-classification-reference.md). It is the same reference as in Assignment 1; its Hierarchical example (`layout-design → robot-operation`, `evaluated_by`) is directly relevant here. The [format example](problem-definition-example.md) is also the one from Assignment 1 — a Flat, Stateless problem in another domain. It shows the level of specificity expected, not the structure of this problem.

Your definition must:

- Place each of the four meeting statements at a level — a decision, an evaluation of a decision, a method for a decision, or a claim about model validity — or explain why it does not fit, and draw the consequence for how they may be compared.
- Give the **I/O schema** of the system: every input table and parameter with field, type and unit; every output with its form.
- Define `G` and `E` as components with their Role and Model kept separate, and state which components a learned demand model supplies parameters to (a learned forecast does not by itself make a component Data-driven).
- Mark assumptions `[ASSUMPTION]`, unresolved facts `TBD` with a plan to resolve them, and inapplicable items `N/A — reason`.
- Compare at least two approaches, including the baseline and a proxy-only approach.
- Document three important LLM discussions: the suggestion, your assessment, how you checked it, and what you finally used.

### 6.2 Interactive Demonstration

Implement the core workflow live: **generate (or load the embedded) world → set the budget and parameters → run the search → inspect the log and the recommendation → compare with the baseline → change a setting and run again.** The demonstration must:

- Run offline in a standard desktop browser from the extracted ZIP — no server, installation, login, API key, CDN, external font or image.
- Change results through explained rules when inputs change; at minimum the number of DCs, the evaluation budget, a cost parameter, and the barrier (present / absent) must be adjustable.
- Show the two criteria side by side for every evaluated candidate, and the evaluation log.
- Compare the baseline and the recommendation under identical conditions: same `E`, same sampled demand days, same routing method.
- Include at least one **normal** case, one **boundary** case (for example a DC at a capacity bound, or a budget of one evaluation), one **failure** case (for example an infeasible capacity setting, or a world with no bridge), and the **exploit** case of R3. For a failure, explain the problem and the available response instead of showing an invalid result as valid.
- Reproduce results for the same seed and settings. Searches that run too long for a browser may be precomputed by a script in `code/`, embedded as data, labelled as such, and reproducible from the script.

Static screenshots and arbitrary changes to chart values are not sufficient. Show how assumptions and calculations produce the results.

### 6.3 Proposal Presentation

Create `proposal.html` as a presentation to management; about 10–14 slides are recommended, and slide count is not graded. It must answer the two questions management asked and connect:

1. The question, the four statements, and what kind of claim each one is
2. The decision hierarchy, and what the system takes in and gives out
3. The fictional world: what was assumed, and what would be measured instead with real data
4. The two criteria, and the case where the cheap one would have misled the company
5. The search: budget, rule, log, and the centre-count sweep
6. The recommendation: how many DCs, where, the estimated saving and its uncertainty
7. What would reverse the recommendation; what to measure first with real data; the next decision requested

Distinguish demonstrated results in the fictional world from effects that need real data. For every estimated saving, give the evidence, the assumptions and the calculation.

### 6.4 Technical Requirements

- Both HTML files must open directly from the extracted ZIP in a standard desktop browser and work without network access.
- Embed CSS, JavaScript, data and assets in each HTML file.
- `proposal.html` may link to `demo.html` with a relative link but must carry its own essential explanation.
- If `code/` is included, a fresh Python 3.10+ environment must reproduce the embedded results with at most three commands given in its README.

## 7. Grading Rubric

The base score is 100. Up to 10 additional points are available for the optional extensions below. Base and additional points are recorded separately; the maximum total is 110.

### Problem Definition: 45 points

| Criterion | Points | What a strong submission demonstrates |
|---|---|---|
| Levels, decisions, dependencies and classification (R1) | 15 | Places the four statements correctly; names every decision with stable IDs; writes dependencies and `evaluated_by` relations; states each level in standard form and says which parts are convex; derives classifications within a stated boundary and identifies unresolved ones |
| Computable problem and I/O schema (R1, R3) | 15 | Connects variables, objective, constraints and inputs; defines `G` and `E` as components with separate Role and Model; gives a complete I/O schema; handles infeasible inputs |
| World design, demand model and uncertainty (R2) | 15 | Justifies the generated world's structure against Section 3; fits and reports the Bayesian demand model with prior, strength and predictive; evaluates over sampled days and quantifies the average-day error; separates facts, assumptions and unknowns and requests real information with priorities and fallbacks |

### Approach and Evidence: 30 points

| Criterion | Points | What a strong submission demonstrates |
|---|---|---|
| Generation versus evaluation criterion (R3) | 15 | Shows a concrete exploit case and its mechanism; applies a remedy and shows its effect; reports prediction quality and decision quality as different quantities |
| Budgeted search and fair comparison (R4, R5) | 15 | Fixes and justifies a budget; chooses evaluations by a stated rule with a surrogate and acquisition function or a justified alternative; logs every call; compares the baseline under identical conditions; sweeps the DC count; states the uncertainty of the saving and what would reverse the recommendation |

### Interactive Demonstration: 15 points

| Criterion | Points | What a strong submission demonstrates |
|---|---|---|
| Executable core workflow and consistency with the definition | 8 | Generation, settings, search, log, comparison and re-run work and reveal the mechanism; inputs and criteria in the demo are those of the definition |
| Verifiability and reproducibility | 7 | Normal, boundary, failure and exploit cases can be checked; same seed gives the same result; precomputed parts are labelled and reproducible |

### Proposal and Review: 10 points

| Criterion | Points | What a strong submission demonstrates |
|---|---|---|
| The answer and its evidence, for management | 6 | Answers both questions; connects the four statements, the criteria, the search and the recommendation; separates fictional results from real effects |
| LLM use and independent review | 4 | Three important discussions with the check performed and the final use; assumptions and AI use recorded where the reader needs them |

### Additional points: up to 10

Independently develop one or more of the following through your definition, demonstration and comparison. Naming the concept or adding complexity is not sufficient; the implication must be worked out and shown.

- **Value of information (Lecture 3).** Should the company measure real road distances or collect more demand history before deciding? Quantify what the decision would gain from the information.
- **A sequence of closures (Lecture 7 looks ahead; the reference's Stateful case).** The leases expire in sequence. Treat the redesign as a sequence of decisions with a state, or show why a one-shot design suffices.
- **Candidate generation (Lecture 6).** Propose diverse good candidate networks from a learned or structured distribution rather than from local moves, and show what it buys.
- **Robustness.** Show how the recommendation changes under a demand regime shift or a different barrier, and what that implies for the decision.

Across all criteria: clear evidence and well-defined unknowns are valued over unsupported completeness; a simple method that is appropriate, justified and evaluated can receive high marks; document length, decoration, model brand, prompt count and paid tools earn nothing by themselves. Partial credit reflects quality within a criterion: specific, supported, consistent and checkable work earns full marks; a sound idea with missing connections or checks earns part; naming concepts without applying them earns little; an absent or materially wrong answer earns none.

## 8. LLM Use and Sources

You may use LLMs and coding agents for every stage — interpreting the problem, designing data, writing formulas and code, debugging, organising the presentation and reviewing your work — and are encouraged to. Record the tools used and their roles in the definition. An LLM's statement is not evidence that an external claim is true; check and cite sources for any such claim. Complete chat logs are not required; select three important discussions. Explaining how you verified an accepted suggestion is as valid as recording a rejected one. You may be asked to explain any part of your code or design.

## 9. Submission Checklist

- [ ] The ZIP contains `problem-definition.md`, `demo.html`, `proposal.html`, and `code/` if used.
- [ ] All deliverables are in English and agree with each other in scope, terms, assumptions, numbers and claims.
- [ ] The four meeting statements are each placed at a level, with the consequence for comparison drawn.
- [ ] Decisions, dependencies and `evaluated_by` relations are written; classifications follow the reference within a stated boundary.
- [ ] The I/O schema is complete; every generated table has field, type, unit and meaning.
- [ ] The demand model is fitted, its predictive is used, and the average-day error is quantified.
- [ ] `G` and `E` are defined and kept apart; the exploit case and a remedy are shown; prediction quality and decision quality are both reported.
- [ ] The budget is fixed and justified; every `E` call is logged; the baseline is compared under identical conditions; the DC-count sweep is shown.
- [ ] Normal, boundary, failure and exploit cases run; the same seed reproduces the same result.
- [ ] Both HTML files work offline from the extracted ZIP; `code/` reproduces embedded results with at most three commands.
- [ ] Three LLM discussions and your own review are documented.
