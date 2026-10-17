# Response-Aware Cinema Scheduling: Concept and Executable Reference

**IE437 Assignment 1 · Public worked example · English · 11 October 2026 · v2.0**

Author / student ID: Public teaching sample; not a student submission.  
LLM use: OpenAI Codex, a GPT-6-based assistant, supported source inspection, English drafting and independent scope review. Three actual review decisions appear in Section 7.

The primary `proposal.html` preserves the established 44-slide Response proposal and its original design. `extended-proposal.html` is the same full presentation. The executable [Schedule Studio](demo.html#schedule) is an existing full application, with population, forecast, backtest, choice, schedule and dynamic-revision views. [Demo guide](demo-guide.md) · [Verification status](verification.json) · [All worked examples](../index.html).

**Implementation boundary:** the proposal recommends learning how audiences respond to scheduling actions. The current application evaluates schedules with a declared synthetic audience model and a bounded local candidate search. It does not implement a separately trained Response model or Bayesian Optimization (BO). It is the closest existing full application found, rather than a separate Response/BO site. Its films, people, histories, prices, reservations and outcomes are fictional. Prepared figures and planned capabilities in the broader presentation are not validated results of this application.

## 1. Decision, Scope & Problem Structure

> A cinema scheduling manager uses information available before a seven-day screening window, a stated starting plan and explicit operating assumptions to choose a feasible schedule, in order to improve a declared synthetic revenue-based objective; a later signal can trigger a revision of eligible future screenings.

**D1 — Choose a seven-day schedule.** The application allows the manager to edit a showing's film, start time and compatible format, re-evaluate the complete plan, search for a better candidate and decide whether to apply it. Theater, screen and capacity are fixed inputs in this UI. The starting plan is a deliberately weak synthetic challenger, not an observed operator policy. The actual planning interval, rights, baseline and approval practice are `TBD`.

**D2 — Revise a plan after a new signal.** The Dynamic Re-programming extension retains the existing plan and synthetic commitments, advances the clock and supplies a synthetic booking-signal change. It compares before-shock, same-plan-after-shock and revised-plan-after-shock states. It demonstrates one observation/revision cycle; operational trigger frequency and real signal availability remain `TBD`.

| Property | D1 | D2 extension | Reason |
|---|---|---|---|
| Decision Structure | Flat: select one complete plan | A revision alone is Flat; the combined D1 → D2 graph is Hierarchical | D1 changes D2's reference plan and permissible revisions. The order of forecasting and evaluation modules does not create hierarchy. |
| State Structure | Stateless inside the one-shot decision boundary | Stateful | Existing plan, clock and confirmed reservations constrain the next revision. Search iterations are algorithm state, not operational state. |
| Information Structure | Open-loop | Feedback | D1 uses currently available information; D2 uses a newly supplied signal. A real later observation would be required in deployment. |

The manager approves changes. This boundary is a design choice, not a discovered operational requirement. Training a Response model, identifying causal effects, annual optimization, real attendee reconstruction, production integration and guaranteed benefit are excluded from the executable reference. See the [classification reference](../reference/problem-classification-reference.md).

## 2. Computable Problem

For each showing `s`, choose `x_s = (film_s, start_s, format_s)`. Start time is an integer minute; supported formats determine the fixture ticket price. The starting seven-day plan has **630 showings**. The film catalog, runtime, theater/screen inventory, capacities, information cutoff, population, clock and operating rules are fixed inputs for a comparison. Let `x0` be the starting plan and `c(x,x0)` count changed, added or removed showing records. The current search edits existing records; it does not explore every possible schedule.

The Worker selects the **revenue objective**:

```text
J(x) = R(x) − 0.2 × U(x) × 14 − 2 × c(x,x0)
R(x) = synthetic ticket revenue + admissions(x) × 0.35 × 6
```

`U` is simulated unmet capacity demand. Standard tickets cost 14 synthetic units; all prices, concession assumptions and penalty coefficients are fixture assumptions. `R` is not actual currency or profit. Admissions are simulated people allocated to screenings, not purchased tickets inferred from the six teaching fields. A business outcome and defensible real penalty/cost coefficients are `TBD`. The optimizer's objective gain can differ from the displayed rounded revenue difference.

| ID | Decision | Role | Model | Definition / implementation |
|---|---|---|---|---|
| C1 | D1/D2 | Cost: evaluate schedule outcomes | Simulation | The same 10,000 local synthetic people choose a showing or outside option; seat allocation and reselection produce admissions, revenue and unmet demand. |
| C2 | D1/D2 | Cost: maximize `J` | Formulation | Apply the stated revenue, unmet-demand and schedule-change calculation to C1's outputs. |
| C3 | D1/D2 | Constraint | Formulation | Validate catalog/screen IDs, supported formats, operating hours, runtime plus cleaning, non-overlap and protected showings. |
| C4 | D1/D2 | Constraint | Formulation | Allocate no more than physical seats; preserve valid commitments; do not duplicate committed people. |
| C5 | D2 | State-transition | Formulation | Retain protected records and commitments, update clock/signal and select an eligible revision. |
| C6 | Future D1/D2 | Cost: learned response evaluator | Data-driven | Proposed future component requiring linked exposure/action/outcome data and held-out validation; not implemented in this app. |

C1 uses shared profile/film-propensity estimates and theater, time, format and price utility relative to a fixed reference supply. It includes an outside option and groups equivalent showings; duplicating alternatives does not automatically create proportional demand. Full evaluation uses keyed random choice and seat allocation. This is not one LLM per person, and its synthetic histories and coefficients are not evidence of a fitted response model on real purchasers.

The explicit fixture restrictions are:

- Operating hours **09:00–24:30**, with **20 minutes cleaning**. A show plus runtime and cleaning must finish by closing. Consecutive screen intervals cannot overlap.
- A film and screen must exist; the screen must belong to the stated theater and support the selected format. Showing IDs must be unique.
- The local market contains **10,000** simulated people, each attending at most once in the seven-day choice window. Nationwide weighted demand is a separate output, not local seats.
- Under revision, less than 24 hours ahead is Frozen, 24–48 hours is Limited, and at least 48 hours is Editable. This implementation rejects changes to both Frozen and Limited records. These are assumed demo policies.

A draft edit marks the plan stale. Invalid re-evaluation reports the violation; previous KPIs are not results for that draft. Restore valid settings and re-evaluate, or regenerate the fixture. The UI must not offer an invalid draft as an evaluated recommendation.

## 3. Information & Uncertainty

The [HW1 brief](../reference/assignment.md#2-client-brief-and-available-information) provides a record specification, not actual observations: `title_tag`, `venue_tag`, `play_day`, `curtain_time`, `account_tag`, `passes_bought`. One row is a completed purchase for one screening. Date/time describe the screening, not when the purchase occurred. An account buying three tickets does not identify three attendee histories.

Purchase-only records cannot establish zero-sales exposure, no-purchase opportunities, check-ins, unique visitors, latent preferences or another schedule's counterfactual outcome. The application's richer personal histories and behavioral parameters are separately declared synthetic inputs. A purchased-ticket target requires purchase predictions and appropriate exposure data; the current synthetic admissions/revenue evaluator does not identify or validate that target from the six fields.

A small fictional audit illustrates the unit, independently of C1:

| title_tag | venue_tag | play_day | curtain_time | account_tag | passes_bought |
|---|---|---|---|---|---:|
| Film A | Site A | 2027-01-03 | 18:00 | Account P1 | 2 |
| Film A | Site A | 2027-01-03 | 18:00 | Account P2 | 1 |
| Film B | Site A | 2027-01-03 | 20:00 | Account P3 | 3 |
| Film C | Site B | 2027-01-03 | 18:00 | Account P1 | 2 |
| Film B | Site B | 2027-01-03 | 20:00 | Account P4 | 4 |
| Film C | Site B | 2027-01-03 | 20:00 | Account P5 | 1 |

This table has **6 purchases, 13 purchased tickets and 5 purchasing accounts**. It does not establish admissions or distinct attendees. This illustrative arithmetic is not a simulator training dataset or a separate input panel in the full app.

| Information / status | Purpose | Provider / priority | Fallback |
|---|---|---|---|
| Schema supplied; actual coverage/quality `TBD` | Confirm units, duplicates, missingness, cancellations and refunds | Data owner; first audit | Use labeled fictional records and defensible purchase summaries only. |
| Full showings, including zero-sale shows, and schedule versions `TBD` | Exposure denominator, available actions and historical selection policy | Scheduling/system owner; high | Defer learned response/action-effect claims; prospectively log versions. |
| Capacities, runtimes, formats, rights, cleaning, hours and commitments `TBD` | Real feasible set | Operations owner; high | Retain assumed fixture rules; no operational recommendation. |
| Purchase-event/change timestamps and cutoff `TBD` | Prevent leakage and define revision permissions | Booking/data owner; high | Restrict to a fixed decision; do not operationalize feedback. |
| Agreed target, prices/refunds, check-ins and costs `TBD` | Distinguish tickets, admissions, revenue and profit | Business/data owners; high | Keep synthetic metrics separate; defer profit and real value claims. |
| Current scheduling policy and approved baseline `TBD` | Fair practical comparison | Scheduling manager; high | Compare only with the declared challenger baseline. |
| Choice opportunities, substitution and party composition `TBD` | Support response calibration and attendee ambiguity | Modeling/research owner; conditional | Treat accounts as purchasers; compare plausible latent worlds. |

Uncertainty includes sampling randomness, uncertain behavior and missing real information. Seed **20260913** and keyed draws support replay; they do not establish accuracy. Keep population, histories, cutoff, reference supply, seed/draw protocol, objective and rules common across candidate comparisons. Test alternative plausible behavioral settings and time-separated outcomes before a field trial. No real-world calibrated prediction interval or causal effect is demonstrated.

## 4. Alternatives & Selected Approach

| Approach | Mechanism / information need | Strength and limit | Use |
|---|---|---|---|
| A — Operator/reference plan | Confirmed current plan and operating rules | Auditable and low effort; may ignore substitution | Retain as the practical baseline once obtained. The synthetic challenger is only a demonstration baseline. |
| B — Learned Response model + search | Learn schedule/context → target outcome from linked actions, exposures and outcomes | Direct action evaluation; identification and extrapolation require care | The original 44-slide proposal's concept; additional data and model validation required. |
| C — Synthetic audience evaluator + local candidate search | Shared synthetic profiles, choice/seat model and explicit constraints | Executable schedule comparison; outcomes depend on assumptions | Current full-app reference, used to demonstrate the evaluation/search workflow. |

The selected implementation is C while the presentation retains concept B. They are not identical evidence. Replacing C1 with a validated learned evaluator is future work; the interface alone cannot establish that it has happened.

The existing reference optimizer:

1. Evaluates the starting challenger schedule using the same full audience model.
2. Generates up to 24 neighboring candidates per round by changing film, start time ±30 minutes or supported format, including coverage-restoring candidates.
3. Rejects violations. Scores valid candidates with up to 2,000 local particles for screening, then fully re-evaluates at most two selected candidates on the complete local population.
4. Retains the best full objective found; deterministic hash order resolves ties. Executes eight bounded rounds and returns its plan, baseline, trace and objective delta.
5. Applying the candidate evaluates the returned plan again. If no candidate improves the comparison, the baseline remains available.

This is bounded heuristic candidate/local search, **not ILS from the archived slide widget and not BO**. BO would require a fitted surrogate/posterior, an acquisition rule, selected evaluator calls and posterior updates. It is an optional future search design only if evaluation cost and useful uncertainty justify it. No independently implemented Response/BO full site was found in the inspected projects.

## 5. Demonstration & Evaluation

Open [demo.html](demo.html#schedule); the primary entry is **Schedule Studio**. Use **Generate Audience**, keep the default **10,000 profiles**, then **Re-simulate** before editing or optimizing. The fixed seed is 20260913 and the initial plan has 630 shows. See the [guide](demo-guide.md) for exact steps and recovery. The packaged file contains the existing application and Worker code. Direct offline file execution remains **not verified**.

An independent reviewer executed the current English Case A over HTTP on **11 October 2026**. This was **one chained edit sequence**, without independently resetting each case. Keep the first showing's film, screen and format unchanged; apply each edit before re-simulation.

| State / case | Exact chained input | Observed behavior / evaluated hash |
|---|---|---|
| Fresh baseline | Generate default fixture; first showing 10:00; re-simulate | Valid; hash `901ea84a`. |
| Normal | From 10:00, **+30 min** once → 10:30; apply and re-simulate | Valid; hash `25526c16`. |
| Opening boundary | From 10:30, **−30 min** three times → 09:00; apply and re-simulate | Exact opening boundary accepted; hash `01e09ee2`. |
| Failure | From 09:00, **−30 min** once → 08:30; apply and re-simulate | `STALE`, recalculation required and optimizer disabled; previous KPIs remain visible. They are not evaluated results for the invalid draft. The exact error message was not captured. |
| Recovery | From 08:30, **+30 min** three times → 10:00; apply and re-simulate | Valid evaluation returns; hash `6434c256`. Revision metadata differ from the fresh baseline. |

All valid pre-search states above displayed **5,229 simulated admissions, 97,013 rounded revenue units, 4.4% occupancy and zero unmet demand**. The normal and boundary cases demonstrate that a valid input edit can change the evaluated plan without changing aggregate KPIs.

The reviewer then ran the reference optimizer on the recovered plan. Its panel displayed **+19,030.9 objective units**, baseline revenue **97,013** and candidate revenue **116,476**. After **Apply optimized plan**, the full re-evaluation displayed **6,418 admissions, 116,476 rounded revenue units, 5.4% occupancy, zero unmet demand and hash `17d4a52f`**. The objective gain differs from the rounded revenue difference because it includes penalties and uses unrounded values. This is a result for the declared synthetic evaluator and this starting context, not a proven global optimum or a business effect.

The reviewed `demo.html` SHA256 is `12e74234b5076208ddcf460ca39fee0136e3026950cc32f48920041a7bae59e8`. The review reported unchanged application-source SHA256 `35811838ee6e70062dacbcaed29e02bbff9ee49628321608bca552326564b1a2`. The [verification record](verification.json) separates executed observations from pending checks. An independent fresh repeat, separately reset cases, and direct offline opening were **not executed in this release review**; no replay or offline pass is claimed. Previous slide-widget ILS scores belong to another engine/fixture and do not verify this full app.

For functional evaluation, check valid input → execution → result inspection → modification → repeat; accepted-plan constraints; stale-state handling; failure recovery; and same-runtime replay with identical input/seed/edit order. For a learned model, use held-out screening periods, available-at-cutoff inputs, exposure-aware error/calibration metrics and the confirmed baseline. For action evaluation, inspect objective, admissions, revenue, unmet demand and changes together. Simulation improvement under an assumed evaluator is not independent evidence of forecast accuracy or real benefit.

The original proposal uses arrow keys for navigation and retains its presenter notes. Its permanent **All worked examples** link returns to the package index. Broader planned architecture, prepared illustrations and slide widgets in that deck must not be presented as measurements from the full Schedule Studio app.

## 6. Client Proposal

Request a bounded information and operating-rule audit first. The data owner confirms semantics, coverage and timestamp availability. The operations owner confirms controls, real constraints, approved baseline and change rights. The modeling role agrees the target, cutoff, validation split and supported recommendation scope. Use Section 3's requests and fallbacks rather than adopting synthetic parameters as operator facts.

Next, compare the confirmed baseline with an exposure-aware Response evaluator on held-out periods. Check misspecification, schedule ranking sensitivity and unsupported contexts. Agree predictive, stability and decision-value thresholds after measuring the baseline; keep zero hard violations and protected commitments as requirements. Use shadow recommendations before any controlled live pilot. Pilot size, duration, cost and expected benefit are `TBD`, to be estimated from variance, decision frequency, integration work and operational constraints.

**Proceed** only when information, reproducibility and agreed validation gates are adequate. **Revise** if rankings are unstable or calibration fails. **Stop or narrow scope** if the outcome cannot be supported, critical exposures/rules are missing, constraints fail or a prospective comparison shows no practical value. Revenue is not profit without costs. The next requested decision is approval of the audit and appointment of data/operations owners, not approval of a claimed business improvement.

## 7. LLM Review & Key Revisions

These are actual review decisions in preparing this public example; they do not invent a student's review history. Students must document their own discussions and independent checks.

| Suggestion / initial framing | Check and assessment | Final decision / use |
|---|---|---|
| Use the S13 ILS widget as the main demonstration | User review identified it as a widget rather than the requested full site. Inspected project entries and the existing seven-day app's schedule editor, Worker evaluator and optimizer. | Promote the established full Schedule Studio app; preserve the original 44-slide proposal and explicitly disclose the implementation gap. Archive the previous widget evidence separately. |
| Describe the executable engine as a learned Response model, BO or an admissions optimizer | Checked Worker `objective='revenue'`, `scheduleObjectiveValue`, neighbor generation and fast/full evaluation. No learned Response training, posterior/acquisition loop or BO implementation was found. | State exact penalized synthetic revenue objective and bounded candidate search. Keep learned Response/BO only as future options; do not reuse the previous ILS algorithm claim. |
| Treat old successful outputs as verification of the newly promoted app | Checked the exact current-build SHA against the independent HTTP review. Fresh baseline → normal → boundary → failure → recovery → search was a chained sequence, with unchanged pre-search KPIs and different plan hashes. | Replace borrowed results with current observations; disclose the sequence and missing independent repeat/offline checks. Do not report previous KPIs as results of the invalid 08:30 draft. |

Source basis: the [assignment](../reference/assignment.md), [seven-section template](../reference/problem-definition-template.md), [classification reference](../reference/problem-classification-reference.md), the original Response presentation and the existing application's reviewed `generateScheduleB`, `validateSchedule`, `freezeState`, `evaluateScheduleDetailed`, `scheduleObjectiveValue`, `optimizeSchedule` and `runDynamicReprogramming` functions. Their calculations and assumptions are described above; an LLM statement alone is not evidence of an external fact.
