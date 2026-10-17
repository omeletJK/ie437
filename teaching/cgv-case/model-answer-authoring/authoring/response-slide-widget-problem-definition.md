# Problem Definition: Response-Aware Cinema Scheduling

**IE437 Assignment 1 · Movie Programming — Problem Definition and Decision-Support Design**

Author: Worked reference case  
Date / version: 11 October 2026 · 1.1  
Summary: A cinema scheduling manager compares feasible schedules using an explicitly assumed response function. The demonstration executes deterministic Iterated Local Search (ILS), exposes its baseline and rejects an operationally invalid schedule. A learned response model and any operational benefit require additional data and evaluation.  
Files: `problem-definition.md`, `demo.html`, `proposal.html`; the primary proposal restores the established 44-slide presentation and its original design. `extended-proposal.html` preserves the same full presentation as a reference copy. Both presentations and the demo link back to [all worked examples](../index.html).  
LLM use: Codex, a GPT-6-based assistant, supported source inspection, English drafting, the case adapter and executable checks on 11 October 2026. Three substantive reviews are recorded in Section 7.

## 1. Decision, Scope & Problem Structure

> A cinema scheduling manager uses information available at a stated planning cutoff, operational rules and declared response assumptions to choose a feasible film/screen/time schedule, in order to improve synthetic expected attendance while establishing what a real-data trial would need.

The HW1 brief supplies a purchase-record specification, not actual observations. It does not establish the operator's current scheduling practice or performance. Therefore, this first step demonstrates a **decision mechanism under declared assumptions**; it does not estimate demand from the supplied field descriptions.

**D1 — Select a fixed schedule.** The manager chooses which film starts on each screen, at what time, in one operating-day planning window. The fixture has six sites, three screens per site and six films; screens open at 10:00 and the last film must end by 24:40, expressed relative to the operating day. The manager inspects the recommendation and decides whether to use it. Inventory, rights, current policy, information cutoff and the real planning window are `TBD`. [Case implementation](demo.html#s13)

**D2 — Revise future allocations, an educational extension.** The separate four-week example observes synthetic outcomes, updates its beliefs weekly and revises eligible future allocations. Its state includes current allocations and learned multipliers. This is a different fixture from D1; its numerical outcomes are not compared with D1. Real observation timing and the need for automatic revision are `TBD`. [Rolling view](demo.html#s18)

There is no parent–child decision dependency between D1 and D2 in this package. Forecasting, candidate generation and evaluation are computational stages, not separate higher-level decisions. D1 is `evaluated_by C1` and constrained by `C2`; these relationships do not establish hierarchy.

| Object | Property | Classification | Structural evidence |
|---|---|---|---|
| Decision dependency graph | Decision Structure | Flat | Each fixture selects or revises a schedule directly. Neither changes a lower-level decision's feasible set or objective. |
| D1 | State Structure | Stateless | A complete plan is chosen once; the search's temporary candidate/best plan is algorithm state, not carried operational state. |
| D1 | Information Structure | Open-loop | No later booking information arrives during the fixed-plan decision. This is a scope/design choice, not an established operational requirement. |
| D2 | State Structure | Stateful | Allocations, observations and belief multipliers persist across the 28 simulated days. |
| D2 | Information Structure | Feedback | Newly simulated observations update beliefs and future actions. This is a declared demonstration design; real observation availability is unknown. |

Excluded: training on real data, individual-attendee identification, price/revenue optimization, film-rights verification, a production integration and guaranteed improvement. These exclusions mean the operator cannot adopt the result as an operational recommendation without the audits and validation in Section 6.

## 2. Computable Problem

For D1, a schedule `x` contains ordered film assignments, start offsets and nonnegative gaps for each site/screen. Start times are rounded upward to a 5-minute grid by the packing function. The search may replace, exchange, insert or delete film assignments and change gaps/offsets. Capacity and film runtimes are fixed fixture inputs. [Executed source in demo](demo.html#s13)

**Computed objective:** maximize `J(x) = round(Σ_j a_j(x))`, the chain-wide **synthetic expected-attendance score** summed across screenings in one operating day. It counts screening-level expected attendance, not unique people. The rule's rounding produces a score in whole expected-attendance units. It is not observed admissions or purchased tickets. The business aim of better scheduling remains conditional on validating a defensible real outcome; this package does not silently substitute this score for a ticket-sales target.

For screening `j` of film `f` at site `s` and start time `t`:

```text
p_j = 130 × film_base[f] × site_taste[s,f] × time_weight(t)
      × film_day_or_prime_factor[f,t] × applicable_large_room_factor

For other screenings at the same site:
  same film less than 90 minutes apart: multiply p_j by 0.72
  different film less than 20 minutes apart: multiply p_j by 0.94
Also multiply by 0.93 ^ number_of_other_same_film_screenings_at_that_site.

a_j = min(screen_capacity[j], p_j)
J(x) = round(sum(a_j))
```

All coefficients, tastes and demand scales are `[ASSUMPTION]` values embedded in the demo. `time_weight(t)` is a piecewise-linear table over the operating day. These rules model saturation and schedule interaction; they were not fitted to the purchase records. Their outputs are falsifiable fixture calculations, not causal estimates.

| Component ID | Decision ID | Role | Model | Definition and status |
|---|---|---|---|---|
| C1 | D1 | Cost, maximize | Formulation | The explicit response rule above returns the synthetic attendance score. A future learned response evaluator would be Data-driven; it is not implemented here. |
| C2 | D1 | Constraint | Formulation | Pack sequential shows with film runtime and 15-minute cleaning; reject closing-time overflow, room incompatibility and show-cap/coverage violations. |
| C3 | D2 | Cost, maximize | Formulation | Per film/day, `attendance(p,s)=min(p×(1−0.6^s),120s)`; aggregate over four films. Demand curves and capacities are assumed. |
| C4 | D2 | State-transition | Simulation | Advance days, accumulate synthetic observations, update weekday/weekend belief multipliers weekly and change eligible future allocations. |

C2's hard fixture rules are: every screen has at least one showing; each film appears at two or more sites; each film has at most five shows per site; chain show caps for films A–F are `[26,16,14,14,10,10]`; film C needs at least 180 seats; films E/F cannot use rooms with 250 or more seats. Packing enforces runtime, cleaning, non-overlap and closing time. Real rule values, contracts and formats are `TBD`. No stability penalty or booking lock is implemented in D1; those ideas must not be attributed to its engine.

D2 uses 28 days, four films and 12 shows/day, with at least one show per film. At each step it changes only days `d+3` and later, allowing at most four transfers with predicted relative gain above 2%. The synthetic beliefs update from observations at each week end. This represents an approximate protected near-term window; it is not a timestamp-accurate booking-lock implementation.

Invalid inputs to the new case adapter—blank, negative, fractional, non-5-minute or over 10,000-minute shifts—return an input error and no valid score. A packed schedule failing C2 returns infeasible and no score. The candidate is not offered as a valid plan. The adapter invokes the **same `packAll`, `feasible`, `evalS` and `predict` functions as ILS**, rather than a separate capacity arithmetic check.

## 3. Information & Uncertainty

The six HW1 teaching fields are `title_tag`, `venue_tag`, `play_day`, `curtain_time`, `account_tag` and `passes_bought`. One row is one completed purchase for one screening; date/time describe the screening, not the purchase event. An account that buys three tickets does not identify three attendee histories. A dataset with only purchased screenings cannot reveal zero-sales exposure, no-purchase opportunities, attendance or counterfactual demand.

This small fictional table illustrates the observation unit. It is not used to fit C1:

| title_tag | venue_tag | play_day | curtain_time | account_tag | passes_bought |
|---|---|---|---|---|---:|
| Film A | Site A | 2027-01-03 | 18:00 | Account P1 | 2 |
| Film A | Site A | 2027-01-03 | 18:00 | Account P2 | 1 |
| Film B | Site A | 2027-01-03 | 20:00 | Account P3 | 3 |
| Film C | Site B | 2027-01-03 | 18:00 | Account P1 | 2 |
| Film B | Site B | 2027-01-03 | 20:00 | Account P4 | 4 |
| Film C | Site B | 2027-01-03 | 20:00 | Account P5 | 1 |

These rows establish **13 purchased tickets and five purchasing accounts**, under the fictional coverage stated here. They do not establish 13 admissions or five distinct viewers. `demo.html` calculates these summaries in its Data & method panel. The scheduling fixture separately supplies assumed screens, films, demand factors and rules.

| Fact / assumption / request | Evidence or current treatment | Why it matters | Obtain or confirm; priority | Fallback or limit |
|---|---|---|---|---|
| Record semantics and actual coverage | Brief specification is known; size, dates and quality are `TBD` | Determine the unit, valid aggregation and information cutoff | Data owner: schema, sample, coverage, duplicates, refunds/cancellations; high | Report only defensible purchase summaries; do not infer admissions. |
| Full schedule exposure and versions | `TBD`, absent from six fields | Include zero-sales shows; identify actions available at the cutoff | Operations/system owner: screen IDs, full show list, creation/change timestamps and versions; high | Keep C1 synthetic; defer training and operational recommendations. |
| Capacity, runtime and operating rules | Demo values are `[ASSUMPTION]` | Define C2's feasible set | Operations owner: inventory, runtimes, cleaning, rights, formats and commitments; high | Use the declared toy fixture only. |
| Outcome agreement and linked observations | `TBD` | Purchased tickets, admissions, unique attendees and revenue differ | Business/data owners: target, refunds, admissions and prices if needed; high | Retain synthetic attendance score without claiming a business result. |
| Purchase-event times and booking locks | Screening time is not purchase time | Prevent future leakage and determine permissible D2 revisions | Booking system owner: events, status transitions and protected shows; high for D2 | Restrict to D1; do not operationalize rolling revision. |
| Substitution and site preferences | C1 coefficients are `[ASSUMPTION]` | Alternative schedules may be evaluated incorrectly | Modeling role: time-separated validation, natural variation and a controlled trial where suitable; conditional | Sensitivity analysis and recommendations limited to supported contexts. |
| Actual baseline policy | `TBD`; demo baseline is explicitly constructed | A fair practical comparison needs a real reference | Scheduling manager: approved schedules and decision rules; high | Compare only with the declared fixture baseline. |

Uncertainty comes from missing exposures, selection bias, unobserved demand, changed policies and arbitrary response coefficients. Check consistency of aliases, positive integer ticket counts, date/time parsing, duplicated purchases and canceled/refunded transactions before aggregation. Split by information availability and time; keep later outcomes out of decision inputs. Sensitivity and out-of-time validation should precede a trial. The current demo does not implement coefficient fitting or a parameter-sensitivity editor; these are future work, not demonstrated findings.

## 4. Alternatives & Selected Approach

| Approach | Mechanism and required information | Strengths, limitations and effort | Decision |
|---|---|---|---|
| A — Explicit rule/current plan | Retain an operator plan or allocate by a declared rule within confirmed constraints | Simple and auditable; may ignore substitution. The actual current policy remains unknown. | Always retain as a practical baseline after the audit. |
| B — Response evaluator + local search | Score context/schedule actions; generate feasible neighbors and retain better schedules | Directly connects actions and outcomes. Requires defensible response data for real use; local search has no global guarantee. | Selected for demonstrating the mechanism. C1 is currently an explicit synthetic formula; the executable search is ILS. |
| C — Synthetic audience evaluator | Simulate plausible individual choices and aggregate outcomes under each schedule | Useful for mechanism/sensitivity questions; latent composition and calibration remain uncertain. More modeling effort. | A separate alternative, not implemented in this Response case. |

Evaluator and search are separate choices. BO could be considered if evaluations were expensive and a useful surrogate/uncertainty representation were available. It would require a fitted posterior, an acquisition rule, selected evaluations and posterior updates. **This demo is ILS, not BO**; buying or naming a surrogate would not turn its current loop into BO.

Selected calculation flow:

1. Construct capacity-based film rotations and pack/validate them.
2. With seed `20260829`, presolve for 2,600 local moves using uniform site response. This creates the **declared reference baseline**, rather than a measured current operator schedule.
3. Evaluate that baseline using the site-specific C1 rule. Reset shows score **5,134** for 90 screenings.
4. Generate a neighbor by a film replacement/exchange, gap/offset change, insertion/deletion or cross-site exchange. Apply a multi-move kick after more than 80 stalled iterations.
5. Reject infeasible neighbors. Accept a non-worse current candidate or a kick; separately retain the strictly best feasible score found. Run 2,600 search iterations using the same C1/C2 inputs.
6. Display the best score, site/film allocation, screen timetable, response calls and change log. Retain the best feasible plan even if the current search path temporarily worsens.

The main Reset workflow initializes the seed before presolve and continues that deterministic stream into search. Loading an Engine case starts search with seed `20260829` directly and uses that case as the comparison baseline. These are distinct declared starting modes; their final scores are not evidence of different real-world effects. Ties keep the existing best plan because best retention requires a strict score increase.

Executed: S13 response/constraint calculations and ILS; S18 deterministic synthetic rolling model; Engine cases; purchase-summary calculation. Prepared: S06's eight-value response lookup and S07's two A/B values. Unimplemented: learned response fitting, causal identification, true APIs, real bookings and production deployment.

## 5. Demonstration & Evaluation

Open `demo.html` directly after extraction; it defaults to `#s13`. No server, installation, API key, login or external asset is needed. Use the View selector for S13/S06/S07/S18. Reset restores the selected view. In S13, run search, inspect site names to see screen schedules, and reset before a repeat. Prepared S06/S07 values explain concepts; they do not feed S13 or represent fitted predictions.

Choose **Engine cases**. Select a preset or enter a shift; the same original C1/C2 engine evaluates the complete schedule. A feasible case can be loaded into ILS, followed by **Run search**. Failure shows the violated boundary and disables loading. Reducing the shift or selecting Normal recovers a valid case.

Baseline and comparisons use the same fictional film/site inputs, C1 score definition and C2 rules. Best-found score, feasibility, determinism and rejection behavior are functional metrics. The zero accepted-plan violation counter refers to checked accepted plans; rejected candidates are not operationally feasible recommendations. The demo's score improvement is not independent validation of the assumed evaluator.

| Case | Inputs / reproduction steps | Expected result / pass criterion | Executed result and supported conclusion |
|---|---|---|---|
| Normal | S13 Reset → Run search to completion | Best ≥ baseline; accepted plan feasible; 2,600 iterations | **5,134 → 5,265**, 1,739 response calls, 90 shows. A full reset/repeat gives the same snapshot. |
| Boundary | Engine cases → Boundary | Last show remains within closing time; slack 0–4 min on the 5-min grid | Site D / Screen 1 shifted **365 min**; final end **24:36**, closing **24:40**; score **5,099**, 90 shows. Feasible, despite a lower score. |
| Boundary search | Load the boundary plan → Run search | A valid loaded plan is the baseline; best remains feasible and ≥ baseline | **5,099 → 5,352**, 2,600 iterations, 1,750 calls. This is a different initialized search workflow from Normal. |
| Failure | Engine cases → Failure | Reject final-show overflow; return no valid score; disable loading | Shift **370 min**; final end **24:41**. Packing rejects the schedule; no score is returned. |
| Input failure | Enter `2` or clear the shift input | Explicit error; no valid schedule or score | Both return `invalid` and no score. |

These results were executed in Node.js using the demo's extracted original calculation functions with rendering-only DOM stubs. All embedded scripts compiled. An independent static-HTTP browser review on 11 October 2026 confirmed the normal score 5,134; the 365-minute boundary score 5,099 with 90 shows, final end 24:36 and four minutes of slack; and the 370-minute failure with no valid score and loading disabled. The 4× search completed at 5,265 with 1,739 response calls, 2,600 iterations and zero accepted-plan violations. The earlier 10-slide authored proposal passed navigation and fit checks, including notes, ArrowRight and Home controls; that version is now archived outside the public package. The restored 44-slide original-design presentation and the new return links await independent HTTP navigation review. [Verification record](verification.json). **Direct offline file execution has not been verified.** The HTTP checks establish browser behavior in that environment and do not replace the assignment's offline-file check.

What this establishes: reproducible fixture evaluation, local improvement, reuse of the real engine for cases and explicit rejection/recovery. What it does not establish: prediction accuracy, actual ticket sales, attendance measurement, causal schedule effects, global optimality or operational adoption value. The restored full presentation's larger architecture is conceptual future scope, beyond the implemented demonstration.

## 6. Client Proposal

Request a bounded audit before estimating value or building a learned model. The data owner confirms semantics/coverage; the operations owner supplies schedules, constraints and the approved baseline; the modeling role agrees the outcome, cutoff and evaluation protocol. Use Section 3's priority requests rather than treating the fictional parameters as discovered facts.

Then evaluate candidate response models on time-separated observations and supported action contexts. Compare calibration/error and resulting schedule recommendations with the same feasible set and declared baseline. Numerical acceptance thresholds are `TBD` until a real baseline is measured and the operator agrees the business target and stability tolerance. A replay scored by the fitted model alone cannot prove field benefit.

Proceed to a bounded prospective trial only after the target unit is valid, critical rules are confirmed, prediction checks meet agreed thresholds and every proposed plan passes independent constraint checks. Measure the agreed purchase/admission outcome, disruptions and violations under a predeclared protocol. Revise or stop for inadequate coverage, unstable/miscalibrated response, unsupported extrapolation, rule violations or failed trial criteria.

Cost, duration and benefit estimates are **TBD**; estimate them after confirming data access, integration scope, sample size and validation effort. No commercial price or uplift promise is justified by the teaching brief or synthetic search result.

**Requested decision:** approve the data/rule audit, nominate the data and operations owners, and agree the next real-data validation gate. This does not authorize deployment of the synthetic recommendation.

## 7. LLM Review & Key Revisions

These are summaries of three actual discussions and checks during preparation of this case, not fabricated student conversations.

| Discussion / purpose | LLM suggestion | Assessment and verification evidence | Final decision / location |
|---|---|---|---|
| 1 — Identify the actual optimization method | Separate the response evaluator from its search and label the executed loop ILS | Inspected the original engine's mutation, stall/kick and best-retention code; no posterior, acquisition rule or posterior-update loop is present | Accepted. Sections 2/4 and the demo explicitly say ILS; BO remains an unimplemented option. |
| 2 — Align outcome units | Retain the actual demo's synthetic expected-attendance target instead of presenting it as purchased-ticket prediction | Checked the score formula against the six-field brief: completed purchases neither identify admissions nor counterfactual audience response | Accepted. Sections 1–3 and all score disclosures distinguish calculated attendance score from observed ticket/admission outcomes. |
| 3 — Make boundary/failure tests meaningful | Replace the disconnected fixed-slot arithmetic with a complete schedule shifted through the original engine | Executed the same packing/feasibility/response functions: 365-minute shift accepted; 370-minute shift rejected; reset/repeat and valid-case ILS tests passed | Accepted. Engine cases and Section 5 expose failure without a valid score and permit recovery to a feasible plan. |
