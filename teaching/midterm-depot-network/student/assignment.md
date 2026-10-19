# Midterm Project: Distribution-Centre Network Redesign — Formulating and Solving a Hierarchical Decision

**IE437 · Midterm project brief · Version 2.2**

**Release: Mon, 19 Oct 2026 · 10:00 KST. Submission deadline: Mon, 2 Nov 2026 · 10:00 KST (UTC+9).** Fourteen days. Individual submission.

### At a glance

- **The decision.** How many distribution centres (DCs) a convenience-store chain should run, at which sites, which stores each serves, and how many vehicles each owns.
- **The objective.** The lowest total monthly cost — DC fixed costs, vehicles, fuel, spot trucks, service failures — with at least 98% of a day's deliveries before noon.
- **You hand in** one ZIP (≤ 200 MB, English, individual): `problem-definition.md`, `code/` that reproduces every number offline with three commands, `demo.html` or a local app, and `proposal.html`.
- **The grader looks for twelve things:** the four meeting statements each placed at a level; every decision named, with dependencies and `evaluated_by`; the lower level in standard form with its method, cost per solve and measured accuracy; the connection, with the assignment's place stated; the upper level with its cheap criterion `G`, budget `B`, selection rule, log and a comparison with random selection; the fidelity–computation table with two checks; a demand model driving sampled-day evaluation; the gap between `G` and the full evaluation `E` measured and explained; a baseline scored under identical conditions; the number-of-DCs sweep; a recommendation with its uncertainty and the assumptions that reverse it; three LLM discussions with the checks you made.
- **Terms used throughout.** *Lower level*: one DC's daily routing and fleet. *Upper level*: the number, sites and assignment of DCs. *Candidate*: one upper-level proposal — a set of DCs with an assignment and a fleet policy. *`G`*: the cheap score that proposes candidates. *`E`*: the full evaluation — fixed cost plus the operating cost the lower level computes over sampled demand days. *Budget `B`*: the number of full evaluations in the reported search. *Sampled days*: demand days drawn from the posterior predictive. *Held-out days*: sampled days the search never saw, used to check the saving. *Baseline*: the current network, scored by the same `E`. *Thinning*: keeping a fraction of the stores to make computation tractable (Section 2.7).

## 1. Purpose

**Your central task is to formulate the company's problem as a hierarchy of decisions, define and solve the lower-level problem, connect it to the upper-level decision on the number and location of distribution centres, and justify the balance you strike between modelling the real operation faithfully and being able to compute an answer.**

This project is the midterm examination of the course, in the form of Assignment 1: a problem definition in Markdown, an interactive demonstration, a proposal presentation, and the code that produces your numbers. What is assessed, in order of weight:

1. **The formulation and the solution-algorithm plan.** How the lower-level problem (one distribution centre's daily operation) is defined and solved; how its result becomes the evaluation of an upper-level candidate; how the upper-level problem (how many centres, where, which stores to each) is defined and searched.
2. **The balance between fidelity and computation.** Which features of the real operation you model, which you simplify, what each simplification costs in accuracy and buys in computation, and whether it could reverse your conclusion. This must be explained explicitly, in its own section.
3. **The evidence.** A fair baseline, the number-of-centres sweep, demand uncertainty handled rather than averaged away, the gap between the cheap criterion that generates candidates and the expensive one that judges them, and a recommendation with its uncertainty.
4. **The proposal** to management, and your own review of the AI assistance you used.

The tools of Lectures 1, 2, 4 and 5 are the expected means — standard-form formulation and convexity, conjugate updating and the posterior predictive, surrogate-guided search under an evaluation budget, and the discipline of not trusting a proxy where it has not been checked. Using them well is assessed; naming them is not.

**Nothing here requires an exact solution of a 10,000-store problem.** It requires a clear formulation, a working pipeline on an instance you can compute, and honest reasoning about what the simplifications do. Section 5 says how to get there, and where AI assistance helps most.

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

- **The decision.** How many DCs to operate, at which sites, which stores each DC serves, and how many vehicles each DC owns. For the base design, assume that at the planning horizon every current site can be kept or given up and every candidate site can be leased; the current DC sites are themselves candidate sites. Treating the closures as a sequence in time is an extension (Section 7).
- **The objective.** The lowest **total monthly cost** — DC fixed costs, vehicle fixed costs, fuel, spot-truck hire and the cost of service failures — **while keeping the delivery service level**: at least 98% of a day's deliveries before 12:00, with a delivery after 14:00 counted as a failure.
- **The evidence.** A comparison with the current network under identical conditions, the cost as a function of the number of DCs, the uncertainty of the estimated saving, and the assumptions under which the recommendation would reverse.

### 2.3 Operating conditions

These are the company's settings. You may change any of them with a stated reason.

| Item | Setting |
|---|---|
| Stores | About 10,000 convenience stores, open 24 hours, spread nationwide but concentrated where population is dense; a small back room, so a store holds no more than about two days of stock |
| Order cycle | Each store orders by an evening cutoff for delivery the next day; the DC picks the orders overnight |
| Deliveries | One delivery per store per day in a multi-temperature vehicle carrying ambient and chilled goods together; a vehicle leaves its DC between 04:00 and 07:00, visits stores in sequence, and returns. Fresh food (lunch boxes, sandwiches) travels in a separate second wave that is **out of scope** unless you bring it in with a stated reason |
| Delivery window | Deliveries are expected before 12:00; at least 98% of a day's deliveries must meet this. A delivery after 14:00 is a service failure and a delivery that does not happen is a stock-out; both carry penalties (Section 2.6) |
| Distribution centres | 12 today; store-to-DC assignment fixed long ago; each DC plans its own routes from experience |
| DC capacity | Between 500 and 1,400 stores per DC — fewer and the DC is not worth keeping, more and loading docks and staff cannot cope. If you thin the instance (Section 2.7), scale these bounds in proportion |
| DC cost | A monthly fixed cost per open DC (lease, staff, equipment), nearly independent of how busy it is |
| Vehicle cost | A monthly fixed cost per owned vehicle plus fuel per kilometre; on a day when the owned fleet cannot cover the volume, a spot truck is hired for that day at a high daily rate |
| Fleet policy | Each DC owns enough vehicles for a chosen quantile of its daily vehicle need and hires spot trucks above it; the quantile is your choice (default in Section 2.6) |
| Vehicle limits | About 25 stops and 250 km per vehicle per day within a 10-hour shift including loading; a load capacity in roll cages, so a route whose stores' demand that day exceeds one load must be split |
| Demand | A daily volume per store in roll cages that varies by weekday and season — weekends higher at residential stores and lower at office stores, a summer peak in drinks and ice, holiday spikes that move the whole chain on the same day — and differs between stores; a few percent of stores open or close each year, so some stores have short histories |
| Distances and times | Travel between any two points is by road. Map distance is not road distance: rivers, mountains and the road network itself decide how far a truck actually drives. Travel **time** is road distance divided by a stated average speed, plus the stop time at each store; if you prefer a routing engine's durations, scale them to truck speeds and say so |
| Current operation | The 12 DCs, the historical assignment and experience-based routes form the **baseline** every proposal is compared with. The baseline is a fact of the operation: it is exempt from the capacity bounds you impose on new designs |

### 2.4 How a delivery day runs

Evening: stores send their orders by the cutoff. Night: the DC picks each store's order into roll cages and stages them by route. Early morning: vehicles are loaded and leave; each follows a sequence of stores planned the evening before from the orders received. Morning: stores receive and shelve; the driver collects empty cages. Afternoon: vehicles return, and the next day's routes are planned once the next orders arrive.

Daily routing therefore happens **after** that day's demand is known, while the network — DCs, store assignments, fleet size — is fixed long before any of it is known. Keep this timing in mind when you decide what each level of your problem knows and when.

### 2.5 The company's data

The company holds the following tables. **None is handed over for this project.** Instantiate them fictionally, consistent with this specification and with Sections 2.3 and 2.6, from a generator with a fixed seed, and state the generator's assumptions. Public sources may inform where stores are and how far roads run, when cited; the chain, its DCs, its demand and its costs are fictional.

The first five tables are **inputs you generate**. The last three record **outcomes of the current operation**: produce them by running your own lower level (Section 3.1) on the current network over the generated history, and say so. Their use is stated in the last column; do not generate a table you never use.

| Table | One row is … | Fields (type, unit) | Coverage; what it is for |
|---|---|---|---|
| `stores` | one store | `store_id`; `region` (text: province, district); `lat`, `lon` (decimal degrees); `store_type` (residential / office / mixed / roadside); `opened_on`, `closed_on` (date, nullable); `current_dc_id` | All stores. The location and type of every store; the current assignment |
| `demand_history` | one store on one day | `store_id`; `date`; `cages_ordered` (integer, roll cages) | Last 12 months; stores opened during the year have short histories. The demand model (R2) |
| `dcs` | one current DC | `dc_id`; `lat`, `lon`; `lease_expires_on` (date); `monthly_fixed_cost` (KRW); `max_stores`, `min_stores` | 12 rows. The baseline sites and their costs. Place them plausibly — near logistics zones and the large population clusters, as a chain that grew over decades would have — because the baseline's quality sets the saving you report; a strawman baseline is penalised under R5 |
| `candidate_sites` | one site the real-estate team could lease | `site_id`; `lat`, `lon`; `monthly_fixed_cost` (KRW); `max_stores` | Some 40–80 sites placed where a logistics site could exist — near motorway interchanges and industrial or logistics zones, with higher fixed costs in the capital region — including the 12 current sites; or a region you define. State which. The upper level's choice set |
| `cost_parameters` | one parameter | fuel per km; vehicle monthly cost; spot-truck daily rate; late-delivery penalty; stock-out penalty; vehicle capacity | Finance's figures; defaults in Section 2.6 |
| `deliveries` | one store on one day | `store_id`; `date`; `cages_delivered`; `delivered_at` (HH:mm); `vehicle_id` | Last 12 months, from your lower level on the current network. The baseline's service level |
| `vehicle_days` | one vehicle on one day | `vehicle_id`; `dc_id`; `date`; `km_driven`; `stops`; `departed_at`, `returned_at` | Last 12 months, same source. The baseline fleet and kilometres; a check of your routing estimate |
| `spot_hires` | one DC on one day | `dc_id`; `date`; `trucks_hired`; `cost` (KRW) | Last 12 months, same source. The baseline's spot-truck cost |

Give your own **I/O schema** on top of this: what your system takes in (which tables and parameters) and what it returns (the recommended network, its fleet, its cost breakdown with uncertainty, and the record of what was evaluated).

**Distances.** Every distance you use must be an **actual road value** or an approximation **calibrated against actual road values**, and you must say which. Acceptable routes to road values, in increasing effort:

- A **detour model**: map distance times a detour factor that depends on the region or on the pair's geometry, calibrated on a few hundred real road distances. A public routing demo server (the OSRM demo, for example) may be used for a calibration sample of that size, not for bulk queries.
- A **self-hosted routing engine** (OSRM on an OpenStreetMap extract runs in Docker on a laptop) queried for every pair you need; a thinned instance (Section 2.7) keeps this to minutes.
- Any mixture: engine values within a radius, a calibrated model beyond it.

State the source, version, extract date and vehicle profile. **Cache every distance you use in a file in `code/`** so that the grader reproduces your results without network access. Commercial map APIs are not forbidden, but their quotas and terms rarely allow the volumes and the caching this project needs. How many points, over what region and at what resolution you compute road distances is itself a fidelity–computation choice; justify it in Section 3.4.

### 2.6 Teaching defaults

Use these unless you have a reason not to; state the reason if you change one. They are classroom values chosen to make the trade-offs visible, not market data.

| Quantity | Default |
|---|---|
| DC fixed cost | 150,000,000 KRW per month per open DC |
| Owned vehicle | 5,500,000 KRW per month, driver included |
| Fuel | 350 KRW per km |
| Spot truck | 550,000 KRW per day |
| Late delivery (after 14:00) | 120,000 KRW each |
| Stock-out (no delivery) | 500,000 KRW each |
| Vehicle capacity | 48 roll cages |
| Store demand | Mean about 2.2 cages per day, between 0.5 and 6 across stores, before weekday, season and holiday effects |
| Stop time and speed | 15 minutes per stop; 35 km/h average road speed (30–45 with a reason) |
| Fleet policy | Own vehicles for the two-thirds quantile of daily need; spot trucks above |
| Sampled demand days | 7 days while searching, 28 days for the final comparison, plus 14 held-out days |
| Evaluation budget `B` | 40 full evaluations in the final search |

### 2.7 Making it tractable

You are not expected to route ten thousand stores in a browser. Two reductions are legitimate and expected; say which you used.

- **Thin the chain, keep the country.** Keep a fraction of the stores nationwide — for example one in five, about 2,000 — and keep the 12 current DCs, so that the geography and the question "how many DCs" survive. Do **not** shrink to a single region unless you can explain how the question survives with one or two DCs. Thinning changes two things, and you must say how you handled both:
  - *Fixed cost per store.* With one store in five, a DC's fixed cost is spread over a fifth of the stores and would dominate the trade-off. Scale the DC fixed cost and the capacity bounds by the same fraction (one in five: 150 M → 30 M KRW per month; 500–1,400 → 100–280 stores) so that the cost per store served is unchanged.
  - *Stop density.* Fewer stores means longer legs between stops, so kilometres per store rise — by roughly the square root of the thinning factor on a continuous-approximation argument — and the time window binds sooner. Two ways through: (i) keep each sampled store as one stop and record the distortion as a row of the balance table, checking it on a denser sub-instance; or (ii) merge *n* neighbouring stores into one aggregated stop with summed demand and *n*-fold stop time, which preserves the geometry at the cost of coarser routes. Either is acceptable when stated and checked. This choice can be one of the two checks Section 3.4 asks for.
- **Spend lower-level accuracy where it matters.** A continuous approximation of route length is fine inside the cheap criterion `G`; a routing heuristic belongs inside the full evaluation `E`; an exact solution belongs on small instances where you measure the heuristic's accuracy.

Start with a **toy instance** — a few hundred stores, two DCs, map distances — and have the whole pipeline running end to end before you scale anything (Section 5).

## 3. The Formulation and the Solution Plan

This section is the heart of the project. Write it so that a colleague could implement it.

### 3.1 The lower level — one DC's daily operation

Given a DC, the stores assigned to it, that day's demand per store, road distances and times, and the vehicle limits, decide the vehicles used and the sequence each one drives, at the least daily cost, subject to the delivery window.

- Write the problem in the standard form of Lecture 1: variables, objective, constraints. A compact formulation — sets, variables, objective and constraints in mathematics and words — is what is expected; a full arc-based integer programme is welcome but not required. Say which features of the real operation are in it and which are not — multiple trips per vehicle, driver breaks, time-of-day traffic, loading-dock congestion, returns — and why.
- Decide how the delivery window enters: as a **hard constraint** when routes are built (no route may reach a store after 12:00, so a long territory needs more vehicles), or as **penalties** on late and missed deliveries with the 98% level checked afterwards. State which, and report the realised service level of every network you compare.
- Choose a solution method and justify it against the instance size: an exact formulation for small instances, a constructive heuristic with improvement, a continuous approximation of route length, or a combination. State the **cost of one solve** and the **accuracy** of the method — against an exact solution on small instances, against a bound, or against an alternative heuristic — and what its error does to the upper level.
- Say what one lower-level solve returns to the upper level: vehicles needed, kilometres, late and missed deliveries, spot trucks.

### 3.2 The connection — how the lower level evaluates an upper-level candidate

An upper-level candidate is a set of DCs with a store assignment and a fleet policy. Its monthly cost is the DC fixed costs plus the operating cost that the lower level computes.

- State what passes **down** (DC set; the assignment, or the rule that produces it; the fleet policy) and what passes **up** (expected monthly operating cost, vehicles, failures), and how many lower-level solves one evaluation costs.
- State where **demand uncertainty** enters (R2): the lower level must be run over sampled demand days from the posterior predictive, not on one average day, because fleet size and spot-truck hire are not linear in demand.
- State whether the store-to-DC assignment is **part of the candidate** that the upper level proposes or is **re-solved inside the evaluation**, and why. The two choices lead to different costs, different search spaces and different conclusions about the cheap criterion.
- Write the relation as the classification reference does: `evaluated_by`, separately from the dependencies by which an upper decision changes a lower problem's feasible region or parameters.

### 3.3 The upper level — how many DCs, and where

Decide the number of DCs, their sites (from the candidate list or a region), the assignment if it is part of the candidate, and the fleet policy, under the capacity bounds, to minimise fixed plus operating cost.

- Write it in standard form. Say what is convex or linear in it (a one-site location problem under map distance, the assignment for fixed sites, a linear relaxation) and what is combinatorial, and what that implies for exact solution.
- One full evaluation is expensive — with the company's real routing system and data it would take hours per candidate — so the search cannot evaluate every candidate. Treat it that way: fix a **budget `B`** of full evaluations for the final search and justify it. State the **search strategy**: how the number of DCs is swept; how candidates are **generated** for each number — a cheap generation criterion `G` such as a p-median or centre-of-gravity solution on road distances, with local moves between candidate sites; and how the `B` evaluations are **chosen**. The course's default is a surrogate model with an acquisition rule (Lecture 4).
- A warning from a pilot run: the raw coordinates of all DCs make a box of two dimensions per DC that a few dozen evaluations cannot learn. Two parameterisations that work: (i) give the generator a few **knobs** — the number of DCs, the exponent on store volume in the site score, a penalty on a site's average detour ratio, a minimum spacing between sites — and let the surrogate work on those four or five numbers; (ii) generate a **pool** of candidates with `G` and local moves, describe each by a handful of summary features (number of DCs, `G`, mean and maximum road-to-map ratio, load imbalance, share of stores far from their DC), and model the **gap** `E − G` over the pool. A budgeted search without a surrogate earns partial credit when its budget and selection rule are explicit.
- **Compare your selection rule with random selection at the same budget** on the same pool of candidates; the comparison is what shows the rule earned its keep.
- **Development runs are free; the reported search is one fresh run.** While building, evaluate as much as you like. The search you report starts from the logged seeds, uses exactly `B` full evaluations including the one `G` seed per number of DCs, and the random-selection comparison uses the same `B` on the same pool. Say so in the log.
- Log every full evaluation: candidate, cost, the rule that chose it.

### 3.4 The balance between fidelity and computation — explicit

Write a table with one row per modelling choice — at least: the distance model, the demand model and the number of sampled days, the routing method, the delivery window, the assignment, the candidate set, the number of DCs swept, the search and its budget — and these columns. The first row is an example of the expected level of detail.

| Modelling choice | What the real operation does | What you model | What it costs to compute | What the simplification could get wrong | How you checked whether it changes the decision |
|---|---|---|---|---|---|
| Distance model | Trucks drive the road network; travel time varies by hour | Road distance from OSRM for pairs within 60 km, map distance × regional detour factor beyond; time = distance / 35 km/h + 15 min per stop | One-off: 1.3 M pair queries, 25 min; cached, 11 MB | Pairs beyond 60 km are rarely on one route, but DC-to-first-stop legs can be; peak-hour slowdowns are ignored, which flatters long routes | Re-ran the k = 8 and k = 10 evaluations with engine values for all pairs and with speed 30 km/h: ranking of the top three candidates unchanged; k = 8 vs 10 gap moved from 4.1% to 3.2% |

Follow the table with a short argument: where you chose to spend computation and why, which simplification you would remove first with more time, and for at least two of them the **check** — rerun with the simplification relaxed on a smaller instance, or a bound — showing whether the recommended number of DCs or the ranking of the top candidates changes. A simplification that could reverse the conclusion and was not checked is the main thing this section penalises.

## 4. Required Analysis — the Course Tools

**R1 · Hierarchy, standard form and classification (Lecture 1; the classification reference).** Sections 3.1–3.3 as above, plus the structure: every decision with a stable ID, dependencies as `parent → child: what changes`, `evaluated_by` relations, and the Decision, State and Information Structure derived within a stated boundary. Place each of the four meeting statements at a level — a decision, an evaluation of a decision, a method for a decision, or a claim about model validity — and draw the consequence for how they may be compared.

**R2 · Demand under uncertainty (Lecture 2).** Fit a conjugate model (Poisson–Gamma, Normal–Normal, or another you justify) per store to the generated history, with a shared calendar effect for weekday, season and holidays; state the prior and its strength and show how short-history stores depend on it. Lecture 2's Poisson–Gamma update with exposure is the natural tool: estimate the weekday, season and holiday multipliers once for the chain, treat them as each day's exposure, and update each store's rate against its exposure-weighted history. Produce the posterior predictive for planning days and run the lower level over sampled days. Report the difference between sampled-day and average-day cost; if it is small, say why — store-level noise cancels at the DC unless the chain moves together on a day — and what source of chain-wide variation in your world would make it matter.

**R3 · Generation criterion versus evaluation criterion (Lecture 5).** Keep `G` (the cheap score that proposes candidates) and the full evaluation `E` apart. Over every candidate you evaluated, report how well `G` predicts `E` (prediction quality) and how much the `G`-best candidate loses under `E` (decision quality); the two are different numbers. Name the cause of the gap in your world — capacity, vehicle limits, the time window, demand variability, the assignment, the distance model — and apply one of Lecture 5's remedies if the gap matters: a **conservative correction** to `G` (rescale `G` by the ratio `E/G` observed on the evaluated candidates, or penalise candidates whose summary features lie outside the range already evaluated), an **uncertainty penalty** from disagreement between proxies (two or three route-length approximations, penalised where they disagree), or **system knowledge** put into `G` (the detour ratio, and the window's effect on stops per route). If the gap is small, show what cancels it and what would make it appear.

**R4 · Search under an evaluation budget (Lecture 4).** Section 3.3's search, executed: budget fixed and justified, candidates chosen by a stated rule with a surrogate and acquisition function or a justified alternative, compared with random selection at the same budget, every full evaluation logged.

**R5 · Baseline, sweep, recommendation.** Score the baseline under the same `E`, the same sampled days and the same routing method as every candidate; a worse routing method for the baseline would make any proposal look good, and so would current DCs placed implausibly (Section 2.5); both are penalised. Sweep the number of DCs and show total cost and its two components. Recommend a number of DCs and their sites, state the uncertainty of the saving (over sampled days, and on held-out days the search never saw), and say under which assumptions — stop time, speed, DC fixed cost, the distance model — the recommendation reverses.

Exact solution of the full problem is not expected; deciding how far to solve exactly and from where to approximate, and checking whether the approximation could reverse your conclusion, is.

## 5. How to Approach It — and Where AI Helps

**Build a toy first.** By the third or fourth day, have a few hundred stores, two DCs and map distances running end to end: generator → distances → lower level → `E` on the baseline → one `G` candidate → one comparison. Everything after that is scaling and refining a pipeline that already works. Students who start with the full instance usually finish nothing.

**Reason before you code.** Write the four statements' levels, the decisions and the `evaluated_by` relation on one page before any code exists. Most later confusion — what a candidate is, where the assignment lives, what the lower level returns — is settled there.

**Use AI where it is strong, and check it where it is weak.** Coding agents and LLMs are good at: setting up OSRM and reading its output; writing the readers, the plots, the surrogate and the acquisition rule; translating a standard form you wrote into code; finding the bug that makes a vehicle do sixty stops; drafting slides. They are unreliable at: deciding what is a decision and what is an evaluation; judging whether a number is plausible (a route of 25 stops at 15 minutes each cannot finish by noon from a 05:00 start if it also drives 250 km — check the arithmetic); guaranteeing that a heuristic is close to optimal (measure it on a small exact instance); filling the balance table honestly. Ask the AI to argue against your formulation and record what it said and what you did with it (Section 8).

**If you get stuck:**

| Obstacle | A legitimate way through |
|---|---|
| The routing engine will not build on your machine | Use the detour model of Section 2.5, calibrated on a few hundred public-server queries; put the choice in the balance table |
| The lower level is too slow for the search | Fewer sampled days while searching (Section 2.6); a continuous approximation inside `G`; the heuristic only inside `E`; thin the chain further and say so |
| The surrogate learns nothing | You are probably on raw coordinates; switch to the knobs or the pool of Section 3.3; compare with random selection |
| The sweep is flat, or fewer DCs always win | Ask what limits a vehicle's day in your model — load, stops, kilometres or the clock — and which of those changes when a DC's territory grows. Report what you find and what makes the trade-off appear |
| The average-day gap is tiny | Expected with independent store noise; say so and show the holiday-spike effect |
| The demonstration is too heavy for a browser | Serve a local app from `code/` instead (Section 6.3) |
| You cannot generate a table in Section 2.5 convincingly | Generate what the operation would produce by running your own lower level; label it |

**Plan for 40–60 hours, and check yourself on day 7.** By then the toy pipeline should run end to end, the four statements and the decisions should be written, and you should know where the assignment lives and how the window enters the lower level. If any of these is missing on day 7, cut scope — thin harder, fewer sampled days — rather than parts of the argument.

**Workflow.** (1) Define the problem with an LLM and write Sections 1–2 of the definition. (2) Instantiate the company's data; distances from a stated source, cached. (3) Build the lower level and the baseline; make `E` run on the current network before you search. (4) Connect and search under the budget; log every call; sweep the number of DCs. (5) Fill the balance table and run the two checks. (6) Revise the definition with what you learned; write the proposal. The final versions of all deliverables must agree; do not describe an unimplemented feature or an untested saving as an achieved result.

## 6. Deliverables

Write all deliverables in English. Place them in one folder and submit one ZIP named `studentID_name.zip`, at most 200 MB.

| File | Required content | Intended reader |
|---|---|---|
| `problem-definition.md` | The problem definition using the supplied template, with Sections 3.1–3.4 of this brief answered in full, the I/O schema, the evaluation log summary and your LLM review | A colleague who must understand, challenge or implement your approach |
| `code/` | The generator, the cached distances, the lower level, the evaluation, the search and the checks, with a README and `requirements.txt`; a fresh Python 3.10+ environment must reproduce every number in the other deliverables with at most three commands (install, full run, reduced run) and no network access. Any library may be used — solvers such as OR-Tools or PuLP, scikit-learn, scipy | The same colleague, reproducing your numbers |
| `demo.html` **or** a local app in `code/` | An interactive presentation of the results: the network drawn on a plotted map, the sweep, the log, the baseline comparison, and a **live** lower-level solve for one DC whose demand day, window and vehicle limits the reader can change | A manager's analyst checking how the recommendation was produced |
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

Heavy computation belongs here. The README states the three commands, the expected run time of each, the seed, and the distance source. Cached distances are data files, not API calls. The **reduced run** must finish in a few minutes and reproduce the structure of the results (the sweep's shape, the baseline comparison, the `G`-versus-`E` gap) on a smaller instance; say how it differs from the full run. If the full distance cache does not fit the size limit, include the reduced run's cache and the script that regenerates the full one.

### 6.3 Interactive Demonstration

Either a self-contained `demo.html` that opens offline from the extracted ZIP (a `data/` folder of script files next to it is acceptable, external resources are not), or a local web app started by one command from `code/` and served on localhost without network access. Either way it must:

- Show the baseline and the recommended network on a plotted map (no tile server is needed — points and lines on latitude and longitude are enough), the number-of-DCs sweep with its two cost components, the evaluation log, and the `G`-versus-`E` comparison for every evaluated candidate.
- Run the lower level **live** for one DC — its routes, vehicles, kilometres, late deliveries — and let the reader change the demand day, the delivery window, the stop time and the vehicle limits, with the result computed by the same rules as the code (a local app can call the code directly; a static page may use a simplified version if it states the difference).
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
| Connection and upper-level formulation and search (3.2, 3.3, R4) | 15 | What passes down and up; where uncertainty enters; the assignment's place stated and justified; the upper level in standard form with its convex and combinatorial parts; a search strategy with generation, budget, selection rule, the comparison with random selection, and the log |
| Fidelity–computation balance (3.4) | 15 | The table complete and honest; the argument for where computation was spent; at least two checks showing whether a simplification changes the decision; the first simplification to remove named |
| Demand under uncertainty (R2) | 10 | Conjugate model with calendar effect, prior strength and short-history behaviour; sampled-day evaluation; the average-day gap reported and explained whatever its size |
| Evidence: `G` versus `E`, baseline, sweep, recommendation (R3, R5) | 15 | Prediction and decision quality as different numbers, the cause named, a remedy applied or shown unnecessary; baseline scored under identical conditions; the sweep; the saving's uncertainty on search and held-out days; reversal conditions |
| Code and demonstration (6.2, 6.3) | 10 | Every number reproducible offline with three commands; the reduced run works; the demonstration shows the results and runs the lower level live; normal, boundary and failure cases |
| Proposal and LLM review (6.4, §8) | 5 | Both questions answered with the evidence, fictional results separated from real effects; three discussions with the checks performed |

### Additional points: up to 10

- **Value of information (Lecture 3).** Should the company measure road travel times itself or collect more demand history before deciding? Quantify the gain to the decision.
- **A sequence of closures.** The leases expire in sequence. Treat the redesign as a sequence of decisions with a state, or show why a one-shot design suffices.
- **Candidate generation (Lecture 6).** Propose diverse good candidate networks from a learned or structured distribution rather than local moves, and show what it buys the search.
- **Robustness.** How the recommendation changes under a demand regime shift or a different distance source, and what that implies for the decision.

Across all criteria: clear evidence and well-defined unknowns are valued over unsupported completeness; a simple method that is appropriate, justified and checked can receive high marks; a thinned instance with honest checks beats a full instance with none; document length, decoration, model brand, prompt count and paid tools earn nothing by themselves. Partial credit reflects quality within a criterion.

## 8. LLM Use and Sources

You may use LLMs and coding agents for every stage and are encouraged to — Section 5 says where they help most. Record the tools used and their roles in the definition. An LLM's statement is not evidence that an external claim is true; check and cite sources for any such claim. Complete chat logs are not required; select three important discussions, including at least one in which you checked a suggestion with a calculation or a small experiment. You may be asked to explain any part of your code or design.

## 9. Submission Checklist

- [ ] The ZIP (≤ 200 MB) contains `problem-definition.md`, `code/` with README and `requirements.txt`, `demo.html` or the local app, and `proposal.html`.
- [ ] All deliverables are in English and agree with each other in scope, terms, assumptions, numbers and claims.
- [ ] The four meeting statements are each placed at a level, with the consequence for comparison drawn.
- [ ] The lower level, the connection and the upper level are each written in standard form, with the solution method, its cost and its accuracy stated.
- [ ] The fidelity–computation table is complete and at least two simplifications are checked against the decision.
- [ ] Every distance is an actual road value or calibrated against one, from a stated source, cached in `code/`.
- [ ] The demand model's posterior predictive drives sampled-day evaluation; the average-day gap is reported and explained.
- [ ] `G` and `E` are kept apart; prediction quality and decision quality are both reported; the cause of the gap is named.
- [ ] The budget is fixed; every full evaluation is logged; the selection rule is compared with random selection; the baseline is scored under identical conditions; the sweep is shown.
- [ ] The three commands run offline in a fresh environment; the reduced run finishes in minutes; the demonstration runs the lower level live.
- [ ] Three LLM discussions and your own review are documented.
