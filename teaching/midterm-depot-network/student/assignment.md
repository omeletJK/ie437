# Midterm Project: Distribution-Centre Network Redesign — Formulating and Solving a Hierarchical Decision

**IE437 · Midterm project brief · Version 2.0**

**Release: Mon, 19 Oct 2026 · 10:00 KST. Submission deadline: Mon, 2 Nov 2026 · 10:00 KST (UTC+9).** Fourteen days. Individual submission.

## 1. Purpose

**Your central task is to formulate the company's problem as a hierarchy of decisions, define and solve the lower-level problem, connect it to the upper-level decision on the number and location of distribution centres, and justify the balance you strike between modelling the real operation faithfully and being able to compute an answer.**

This project is the midterm examination of the course, in the form of Assignment 1: a problem definition in Markdown, an interactive demonstration in HTML, and a proposal presentation in HTML, plus the code that produces your numbers. What is assessed, in order of weight:

1. **The formulation and the solution-algorithm plan.** How the lower-level problem (one distribution centre's daily operation) is defined and solved; how its result becomes the evaluation of an upper-level candidate; how the upper-level problem (how many centres, where, which stores to each) is defined and searched.
2. **The balance between fidelity and computation.** Which features of the real operation you model, which you simplify, what each simplification costs in accuracy and buys in computation, and whether it could reverse your conclusion. This must be explained explicitly, in its own section.
3. **The evidence.** A fair baseline, the number-of-centres sweep, demand uncertainty handled rather than averaged away, the gap between the cheap criterion that generates candidates and the expensive one that judges them, and a recommendation with its uncertainty.
4. **The proposal** to management, and your own review of the AI assistance you used.

The tools of Lectures 1, 2, 4 and 5 are the expected means — standard-form formulation and convexity, conjugate updating and the posterior predictive, surrogate-guided search under an evaluation budget, and the discipline of not trusting a proxy where it has not been checked. Using them well is assessed; naming them is not.

## 2. The Company's Problem

### 2.1 Management brief

Dasol Retail (fictional) runs a nationwide **convenience-store chain** of about ten thousand stores. Every store receives one delivery each day from a distribution centre (DC): a vehicle leaves its DC before dawn, visits several stores in sequence, and returns. There are twelve DCs today. Which store belongs to which DC was fixed long ago and has barely changed since.

Several DC leases expire over the next few years, one after another. Management sees this as a chance to redesign the network and has asked for a review. At the review meeting, four people spoke:

- **Strategy & Planning:** "Cut the DCs from twelve to eight and the lease and staff costs fall sharply."
- **Delivery Operations:** "Fewer DCs means each one covers a wider area. Vehicles drive farther and longer, so we need more of them — it may end up costing more."
- **Data Team:** "Take the centre of gravity of store locations weighted by volume and you have the optimal site. The calculation takes minutes."
- **Field Manager:** "And if that centre of gravity lands across the river? It looks close on the map, but our trucks drive to the bridge."

Management then asked: **"How many DCs should we have, and where? And what will you show us to prove that the answer is right?"**

You have joined the company as a research engineer and must build the first prototype of the decision-support system that answers this question.

### 2.2 What the company wants to achieve

- **The decision.** How many DCs to operate after the lease expiries, at which sites, which stores each DC serves, and how many vehicles each DC owns. The lease schedule fixes when each current DC can be closed or kept.
- **The objective.** The lowest **total monthly cost** — DC fixed costs, vehicle fixed costs, fuel, spot-truck hire and the cost of service failures — **while keeping the delivery service level**: deliveries before noon on an ordinary day.
- **The evidence.** A comparison with the current network under identical conditions, the cost as a function of the number of DCs, the uncertainty of the estimated saving, and the assumptions under which the recommendation would reverse.

### 2.3 Operating conditions

These are the company's settings. You may change any of them with a stated reason.

| Item | Setting |
|---|---|
| Stores | About 10,000 convenience stores, open 24 hours, spread nationwide but concentrated where population is dense; a small back room, so a store holds no more than about two days of stock |
| Order cycle | Each store orders by an evening cutoff for delivery the next day; the DC picks the orders overnight |
| Deliveries | One delivery per store per day in a multi-temperature vehicle carrying ambient and chilled goods together; a vehicle leaves its DC between 04:00 and 07:00, visits stores in sequence, and returns. Fresh food (lunch boxes, sandwiches) travels in a separate second wave that is **out of scope** unless you bring it in with a stated reason |
| Delivery window | Stores expect the delivery before noon; a delivery after 14:00 counts as a service failure, and a missed delivery costs a stock-out penalty |
| Distribution centres | 12 today; store-to-DC assignment fixed long ago; each DC plans its own routes from experience |
| DC capacity | Between 500 and 1,400 stores per DC — fewer and the DC is not worth keeping, more and loading docks and staff cannot cope. If you study a smaller instance, scale these bounds with it and say so |
| DC cost | A monthly fixed cost per open DC (lease, staff, equipment), nearly independent of how busy it is |
| Vehicle cost | A monthly fixed cost per owned vehicle plus fuel per kilometre; on a day when the owned fleet cannot cover the volume, a spot truck is hired for that day at a high daily rate |
| Vehicle limits | About 25 stops and 250 km per vehicle per day within a 10-hour shift including loading, at roughly 15 minutes per stop and an average road speed you state; a load capacity in roll cages, so a route whose stores' demand that day exceeds one load must be split |
| Demand | A daily volume per store in roll cages that varies by weekday and season — weekends higher at residential stores and lower at office stores, a summer peak in drinks and ice, holiday spikes that move the whole chain on the same day — and differs between stores; a few percent of stores open or close each year |
| Distances | Travel between any two points is by road. Map distance is not road distance: rivers, mountains and the road network itself decide how far a truck actually drives, and the company plans with actual road travel distances and times |
| Current operation | The 12 DCs, the historical assignment and experience-based routes form the **baseline** every proposal is compared with. The baseline is a fact of the operation: it is exempt from the capacity bounds you impose on new designs |

### 2.4 How a delivery day runs

Evening: stores send their orders by the cutoff. Night: the DC picks each store's order into roll cages and stages them by route. Early morning: vehicles are loaded and leave; each follows a sequence of stores planned the evening before from the orders received. Morning: stores receive and shelve; the driver collects empty cages. Afternoon: vehicles return, and the next day's routes are planned once the next orders arrive.

Daily routing therefore happens **after** that day's demand is known, while the network — DCs, store assignments, fleet size — is fixed long before any of it is known. Keep this timing in mind when you decide what each level of your problem knows and when.

### 2.5 The company's data

The company holds the following tables. **None is handed over for this project.** Instantiate each one fictionally, consistent with this specification and with Section 2.3, from a generator with a fixed seed, and state the generator's assumptions. Public sources may inform where stores are and how far roads run, when cited; the chain, its DCs, its demand and its costs are fictional.

| Table | One row is … | Fields (type, unit) | Coverage and known issues |
|---|---|---|---|
| `stores` | one store | `store_id`; `region` (text: province, district); `lat`, `lon` (decimal degrees); `store_type` (residential / office / mixed / roadside); `opened_on`, `closed_on` (date, nullable); `current_dc_id` | All stores; a few percent open or close each year |
| `deliveries` | one store on one day | `store_id`; `delivery_date`; `cages_delivered` (integer, roll cages); `delivered_at` (HH:mm); `vehicle_id` | Last 60 days; one row per store-day; recently opened stores have short histories |
| `dcs` | one current DC | `dc_id`; `lat`, `lon`; `lease_expires_on` (date); `monthly_fixed_cost` (KRW); `max_stores`, `min_stores` | 12 rows |
| `candidate_sites` | one site the real-estate team could lease | `site_id`; `lat`, `lon`; `monthly_fixed_cost` (KRW); `max_stores` | A list of tens of sites, or a region you define — state which |
| `vehicles` | one owned vehicle | `vehicle_id`; `dc_id`; `capacity_cages` (integer); `monthly_fixed_cost` (KRW) | Current fleet |
| `vehicle_days` | one vehicle on one day | `vehicle_id`; `date`; `km_driven` (km); `stops` (integer); `departed_at`, `returned_at` (HH:mm) | Last 60 days |
| `spot_hires` | one DC on one day | `dc_id`; `date`; `trucks_hired` (integer); `cost` (KRW) | Last 60 days |
| `cost_parameters` | one parameter | fuel cost per km; spot-truck daily rate; stock-out penalty per missed delivery; service-failure penalty per late delivery | Finance's current figures |

Give your own **I/O schema** on top of this: what your system takes in (which tables and parameters) and what it returns (the recommended network, its fleet, its cost breakdown with uncertainty, and the record of what was evaluated).

**Distances.** Every distance and travel time you use must be an **actual road value**, obtained from a routing engine — for example a self-hosted OSRM on an OpenStreetMap extract — or, where you argue it suffices, an approximation calibrated against such values. State the source, version, extract date and vehicle profile. **Cache every distance you use in a file in `code/`** so that the grader reproduces your results without network access. Commercial map APIs are not forbidden, but their quotas and terms rarely allow the volumes and the caching this project needs. Deciding how many points, over what region, at what resolution you compute road distances is itself a fidelity–computation choice; justify it in Section 3.4.

## 3. The Formulation and the Solution Plan

This section is the heart of the project. Write it so that a colleague could implement it.

### 3.1 The lower level — one DC's daily operation

Given a DC, the stores assigned to it, that day's demand per store, road distances and times, and the vehicle limits, decide the vehicles used and the sequence each one drives, at the least daily cost, subject to the delivery window.

- Write the problem in the standard form of Lecture 1: variables, objective, constraints. Say which features of the real operation are in it and which are not — multiple trips per vehicle, driver breaks, time-of-day traffic, loading-dock congestion, returns — and why.
- Choose a solution method and justify it against the instance size: an exact formulation for small instances, a constructive heuristic with improvement, a continuous approximation of route length, or a combination. State the **cost of one solve** and the **accuracy** of the method — against an exact solution on small instances, against a bound, or against an alternative heuristic — and what its error does to the upper level.
- Say what one lower-level solve returns to the upper level: vehicles needed, kilometres, late and missed deliveries, spot trucks.

### 3.2 The connection — how the lower level evaluates an upper-level candidate

An upper-level candidate is a set of DCs with a store assignment and a fleet policy. Its monthly cost is the DC fixed costs plus the operating cost that the lower level computes.

- State what passes **down** (DC set; the assignment, or the rule that produces it; the fleet policy) and what passes **up** (expected monthly operating cost, vehicles, failures), and how many lower-level solves one evaluation costs.
- State where **demand uncertainty** enters (Section 4, R2): the lower level must be run over sampled demand days from the posterior predictive, not on one average day, because fleet size and spot-truck hire are not linear in demand.
- State whether the store-to-DC assignment is **part of the candidate** that the upper level proposes or is **re-solved inside the evaluation**, and why. The two choices lead to different costs, different search spaces and different conclusions about the cheap criterion.
- Write the relation as the classification reference does: `evaluated_by`, separately from the dependencies by which an upper decision changes a lower problem's feasible region or parameters.

### 3.3 The upper level — how many DCs, and where

Decide the number of DCs, their sites (from the candidate list or a region), the assignment if it is part of the candidate, and the fleet policy, under the capacity bounds and the lease schedule, to minimise fixed plus operating cost.

- Write it in standard form. Say what is convex or linear in it (a one-site location problem under map distance, the assignment for fixed sites, a linear relaxation) and what is combinatorial, and what that implies for exact solution.
- Because one evaluation is expensive, the search cannot evaluate every candidate. State the **search strategy**: how the number of DCs is swept; how candidates are **generated** for each number — a cheap generation criterion `G` such as a p-median or centre-of-gravity solution on road distances, with local moves between candidate sites; how many candidates are **evaluated** by the full lower level (the budget `B`) and how those evaluations are **chosen**. The course's default is a surrogate model with an acquisition rule (Lecture 4). A warning from a pilot run: the raw coordinates of all DCs make a box of two dimensions per DC that a few dozen evaluations cannot learn; parameterise the generator with a few knobs instead, or model the **gap** between `G` and the full evaluation over a pool of generated candidates described by a handful of summary features. A budgeted search without a surrogate earns partial credit when its budget and selection rule are explicit.
- Log every full evaluation: candidate, cost, the rule that chose it.

### 3.4 The balance between fidelity and computation — explicit

Write a table with one row per modelling choice — at least: the distance model, the demand model and the number of sampled days, the routing method, the delivery window, the assignment, the candidate set, the number of DCs swept, the search and its budget — and these columns:

| Modelling choice | What the real operation does | What you model | What it costs to compute | What the simplification could get wrong | How you checked whether it changes the decision |
|---|---|---|---|---|---|

Follow the table with a short argument: where you chose to spend computation and why, which simplification you would remove first with more time, and for at least two of them the **check** — rerun with the simplification relaxed on a smaller instance, or a bound — showing whether the recommended number of DCs or the ranking of the top candidates changes. A simplification that could reverse the conclusion and was not checked is the main thing this section penalises.

## 4. Required Analysis — the Course Tools

**R1 · Hierarchy, standard form and classification (Lecture 1; the classification reference).** Sections 3.1–3.3 as above, plus the structure: every decision with a stable ID, dependencies as `parent → child: what changes`, `evaluated_by` relations, and the Decision, State and Information Structure derived within a stated boundary. Place each of the four meeting statements at a level — a decision, an evaluation of a decision, a method for a decision, or a claim about model validity — and draw the consequence for how they may be compared.

**R2 · Demand under uncertainty (Lecture 2).** Fit a conjugate model (Poisson–Gamma, Normal–Normal, or another you justify) per store to the generated history, with a shared calendar effect for weekday and season; state the prior and its strength and show how short-history stores depend on it. Produce the posterior predictive for planning days and run the lower level over sampled days. Report the difference between sampled-day and average-day cost; if it is small, say why — store-level noise cancels at the DC unless the chain moves together on a day — and what source of chain-wide variation in your world would make it matter.

**R3 · Generation criterion versus evaluation criterion (Lecture 5).** Keep `G` (the cheap score that proposes candidates) and the full evaluation `E` apart. Over every candidate you evaluated, report how well `G` predicts `E` (prediction quality) and how much the `G`-best candidate loses under `E` (decision quality); the two are different numbers. Name the cause of the gap in your world — capacity, vehicle limits, the time window, demand variability, the assignment, the distance model — and apply one of Lecture 5's remedies if the gap matters: a conservative correction to `G`, an uncertainty penalty from disagreement between proxies, or system knowledge put into `G`. If the gap is small, show what cancels it and what would make it appear.

**R4 · Search under an evaluation budget (Lecture 4).** Section 3.3's search, executed: budget fixed and justified, candidates chosen by a stated rule with a surrogate and acquisition function or a justified alternative, every full evaluation logged.

**R5 · Baseline, sweep, recommendation.** Score the baseline under the same `E`, the same sampled days and the same routing method as every candidate; a worse routing method for the baseline would make any proposal look good. Sweep the number of DCs and show total cost and its two components. Recommend a number of DCs and their sites, state the uncertainty of the saving (over sampled days, and on held-out days the search never saw), and say under which assumptions — stop time, speed, DC fixed cost, the distance model — the recommendation reverses.

Exact solution of the full problem is not expected; deciding how far to solve exactly and from where to approximate, and checking whether the approximation could reverse your conclusion, is.

## 5. Workflow

1. **Define the problem with an LLM and write Sections 1–2 of the definition.** Levels, decisions, dependencies, boundary, classification, I/O schema.
2. **Instantiate the company's data.** Generator with a fixed seed; road distances from a stated source, cached.
3. **Build the lower level and the baseline.** Make the full evaluation run on the current network before you search.
4. **Connect and search.** Generate with `G`, evaluate with `E` under the budget, log every call, sweep the number of DCs.
5. **Check the balance.** Section 3.4's table and the two checks.
6. **Revise the definition with what you learned; write the proposal.**

The final versions of all deliverables must agree. Do not describe an unimplemented feature or an untested saving as an achieved result.

## 6. Deliverables

Write all deliverables in English. Place them in one folder and submit one ZIP named `studentID_name.zip`.

| File | Required content | Intended reader |
|---|---|---|
| `problem-definition.md` | The problem definition using the supplied template, with Sections 3.1–3.4 of this brief answered in full, the I/O schema, the evaluation log summary and your LLM review | A colleague who must understand, challenge or implement your approach |
| `code/` | The generator, the cached distances, the lower level, the evaluation, the search and the checks, with a README and `requirements.txt`; a fresh Python 3.10+ environment must reproduce every number in the other deliverables with at most three commands and no network access | The same colleague, reproducing your numbers |
| `demo.html` | A self-contained interactive presentation of the results: the network on a map, the sweep, the log, the baseline comparison, and a **live** lower-level solve for one DC whose demand day, window and vehicle limits the reader can change | A manager's analyst checking how the recommendation was produced |
| `proposal.html` | A presentation answering management's two questions | Management deciding whether to proceed |

### 6.1 Problem Definition

Copy [the Markdown template](problem-definition-template.md) and save your completed version as `problem-definition.md`. Keep its seven section headings:

1. Decision, Scope & Problem Structure
2. Computable Problem — the lower level, the connection, the upper level, the I/O schema
3. Information & Uncertainty — the instantiated data, the distance source, the demand model
4. Alternatives & Selected Approach — the solution-algorithm plan, the budgeted search, and the fidelity–computation table
5. Demonstration & Evaluation
6. Client Proposal
7. LLM Review & Key Revisions

Use the [Problem Structure and Classification Reference](problem-classification-reference.md). It is the same reference as in Assignment 1; its Hierarchical example (`layout-design → robot-operation`, `evaluated_by`) is directly relevant. The [format example](problem-definition-example.md) is also the one from Assignment 1 — a Flat, Stateless problem in another domain. It shows the level of specificity expected, not the structure of this problem.

Your definition must mark assumptions `[ASSUMPTION]`, unresolved facts `TBD` with a plan to resolve them, and inapplicable items `N/A — reason`; compare at least the baseline, a proxy-only approach and your selected approach; and document three important LLM discussions: the suggestion, your assessment, how you checked it, and what you finally used.

### 6.2 Code

Heavy computation belongs here, not in the browser. The README states the commands, the expected run time, the seed, and the distance source. Cached distances are data files, not API calls. If a run takes longer than a few minutes, provide a reduced configuration that reproduces the structure of the results quickly and say how it differs.

### 6.3 Interactive Demonstration

The demonstration presents what the code computed and lets the reader probe it. It must open offline in a standard desktop browser from the extracted ZIP; a `data/` folder of script files next to it is acceptable, external resources are not. It must:

- Show the baseline and the recommended network on a map, the number-of-DCs sweep with its two cost components, the evaluation log, and the `G`-versus-`E` comparison for every evaluated candidate.
- Run the lower level **live** for one DC — its routes, vehicles, kilometres, late deliveries — and let the reader change the demand day, the delivery window, the stop time and the vehicle limits, with the result recomputed by the same rules as the code (state any difference).
- Include a normal case, a boundary case (a DC at a capacity bound, or a budget of one evaluation), and a failure case (a number of DCs that cannot satisfy the capacity bounds, or a day the fleet cannot cover) with the problem explained rather than an invalid result shown as valid.
- Label every precomputed number as such and say which command in `code/` reproduces it.

### 6.4 Proposal Presentation

Create `proposal.html` as a presentation to management; about 8–12 slides are recommended, and slide count is not graded. It must answer the two questions management asked and connect: the four statements and what kind of claim each is; the decision hierarchy and what the system takes in and gives out; what was assumed about the data and what would be measured with the real tables; the lower level, the connection and the upper level in plain words; where the cheap criterion would have misled the company and by how much; the sweep and the recommendation with its uncertainty; what would reverse it; what to measure first; and the next decision requested. Distinguish demonstrated results in the fictional instance from effects that need real data.

## 7. Grading Rubric

The base score is 100. Up to 10 additional points are available for the extensions below. Base and additional points are recorded separately; the maximum total is 110.

| Criterion | Points | What a strong submission demonstrates |
|---|---:|---|
| Problem structure, data and I/O (R1) | 15 | Places the four statements; names every decision with stable IDs, dependencies and `evaluated_by`; derives classifications within a stated boundary; instantiates the company's data faithfully to Section 2.5 with a complete I/O schema |
| Lower-level formulation and solution method (3.1) | 15 | Standard form with the modelled and omitted features stated; a solution method justified against instance size, with its cost per solve and its measured accuracy; a clear statement of what it returns upward |
| Connection and upper-level formulation and search (3.2, 3.3, R4) | 15 | What passes down and up; where uncertainty enters; the assignment's place stated and justified; the upper level in standard form with its convex and combinatorial parts; a search strategy with generation, budget, selection rule and log |
| Fidelity–computation balance (3.4) | 15 | The table complete and honest; the argument for where computation was spent; at least two checks showing whether a simplification changes the decision; the first simplification to remove named |
| Demand under uncertainty (R2) | 10 | Conjugate model with calendar effect, prior strength and short-history behaviour; sampled-day evaluation; the average-day gap reported and explained whatever its size |
| Evidence: `G` versus `E`, baseline, sweep, recommendation (R3, R5) | 15 | Prediction and decision quality as different numbers, the cause named, a remedy applied or shown unnecessary; baseline scored under identical conditions; the sweep; the saving's uncertainty on search and held-out days; reversal conditions |
| Code and demonstration (6.2, 6.3) | 10 | Every number reproducible offline with at most three commands; the demonstration shows the results and runs the lower level live; normal, boundary and failure cases |
| Proposal and LLM review (6.4, §8) | 5 | Both questions answered with the evidence, fictional results separated from real effects; three discussions with the checks performed |

### Additional points: up to 10

- **Value of information (Lecture 3).** Should the company measure road travel times itself or collect more demand history before deciding? Quantify the gain to the decision.
- **A sequence of closures.** The leases expire in sequence. Treat the redesign as a sequence of decisions with a state, or show why a one-shot design suffices.
- **Candidate generation (Lecture 6).** Propose diverse good candidate networks from a learned or structured distribution rather than local moves, and show what it buys the search.
- **Robustness.** How the recommendation changes under a demand regime shift or a different distance source, and what that implies for the decision.

Across all criteria: clear evidence and well-defined unknowns are valued over unsupported completeness; a simple method that is appropriate, justified and checked can receive high marks; document length, decoration, model brand, prompt count and paid tools earn nothing by themselves. Partial credit reflects quality within a criterion.

## 8. LLM Use and Sources

You may use LLMs and coding agents for every stage and are encouraged to. Record the tools used and their roles in the definition. An LLM's statement is not evidence that an external claim is true; check and cite sources for any such claim. Complete chat logs are not required; select three important discussions. You may be asked to explain any part of your code or design.

## 9. Submission Checklist

- [ ] The ZIP contains `problem-definition.md`, `code/` with README and `requirements.txt`, `demo.html`, `proposal.html`.
- [ ] All deliverables are in English and agree with each other in scope, terms, assumptions, numbers and claims.
- [ ] The four meeting statements are each placed at a level, with the consequence for comparison drawn.
- [ ] The lower level, the connection and the upper level are each written in standard form, with the solution method, its cost and its accuracy stated.
- [ ] The fidelity–computation table is complete and at least two simplifications are checked against the decision.
- [ ] Every distance is an actual road value from a stated source, cached in `code/`.
- [ ] The demand model's posterior predictive drives sampled-day evaluation; the average-day gap is reported and explained.
- [ ] `G` and `E` are kept apart; prediction quality and decision quality are both reported; the cause of the gap is named.
- [ ] The budget is fixed; every full evaluation is logged; the baseline is scored under identical conditions; the sweep is shown.
- [ ] Every number is reproducible offline with at most three commands; the demonstration runs the lower level live.
- [ ] Three LLM discussions and your own review are documented.
