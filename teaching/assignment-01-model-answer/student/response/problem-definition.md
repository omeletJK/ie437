# Response Schedule Optimizer: An Aggregate Cinema Planning Case

[One-page comparison of the course brief, case data and assumptions](../classroom-comparison.html).

**IE437 Assignment 1 · Public worked example · English · 11 October 2026 · Package release 1.6 · Demo runtime 1.5 · Document v6.0**

Author / student ID: Public teaching sample; not a student submission.  
LLM use: OpenAI Codex, a GPT-6-based assistant, supported source inspection, English drafting, importer implementation and independent review. Three actual review decisions appear in Section 7.

The [Response Schedule Optimizer](demo.html) is an independent aggregate-response application with four operator steps: **Import planning data → Objective & constraints → Run optimization → Review results**. It uses the existing SIM2 response equation and Iterated Local Search (ILS), with an explicit planning-package loader. It creates no individual synthetic audience and calls no audience-twin choice/seat engine. The established 44-slide [Response proposal](proposal.html) and identical [extended proposal](extended-proposal.html) retain their original design. Proposal revision 1.6 restores the operating-structure diagram and presents the proposed data, implementation and adoption plans in their original visual layouts; the detailed provenance and verification guidance appears in Appendix A and the built-in speaker notes (`N`). [Demo guide](demo-guide.md) · [Verification](verification.json) · [All worked examples](../index.html).

The film/site response coefficients are declared synthetic assumptions; the application does not fit a learned model from purchases or implement BO. The original proposal's broader learned-model and rolling-operation concepts remain proposed extensions. Release 1.5 starts from the uploaded timetable without a presolve. Its observed classroom search is **4,969 → 5,247**, rather than inheriting a previous release's search result. The exact artifact passed 39 independent Node checks; actual HTTP upload/configuration/rejection/export flows were exercised on the preceding candidate, with their scope recorded in Section 5. Final-SHA source replay and responsive checks passed; course-prefix navigation and staging checks passed. Direct offline execution remains unverified.

## 1. Decision, Scope & Problem Structure

> A cinema scheduling manager uses a complete reference timetable, film/site response assumptions and operating rules to choose a feasible film/screen/time plan for one operating day, in order to improve declared aggregate expected attendance.

**D1 — Select one operating-day plan.** The supported shape is six films A–F, six sites A–F and three screens at each site. An uploaded reference has 18–600 showings and uses all 18 screens, subject to its declared film caps, coverage and room rules. The classroom reference has 90 showings, opens at 10:00 and ends films by 24:40. The operator imports or replaces planning inputs, reviews the objective/rules, confirms a feasible reference, runs seeded ILS and inspects or exports the retained best plan. Upload/review/run/results are stages supporting this one decision. Real rights, inventory, policy, cutoff and approved baseline remain `TBD`.

| Property | Classification | Reason within D1's boundary |
|---|---|---|
| Decision Structure | Flat | Choose one complete schedule. File validation, response evaluation and search are computational stages, not parent–child operational schedule decisions. |
| State Structure | Stateless | A selected plan is scored for the current one-day case. Uploaded/session/search state does not carry bookings, commitments or audience history into a later operational decision. |
| Information Structure | Open-loop | No later booking or admission observation arrives during this decision. Reconfiguration and what-if experiments do not supply real outcome feedback. |

C1 evaluates D1 and C2 constrains it. Individual choice histories, revenue/profit, booking locks, production integration, learned response fitting, causal identification and rolling updates are outside this executable boundary. The original proposal discusses some wider capabilities, which are not implemented by this aggregate application. Classification follows the [supplied reference](../reference/problem-classification-reference.md).

## 2. Computable Problem

A plan `x` contains ordered film assignments, nonnegative gaps and a starting offset for each site/screen. Input showing IDs and film/site/screen IDs identify the supplied timetable. The loader normalizes film/site IDs to A–F and maps declared screen IDs to their positions, preserving the explicit starts through the engine adapter. Packing rounds starts upward to a five-minute grid and advances by film runtime plus declared between-film cleaning. ILS can replace/exchange films, change gaps/offsets, insert/delete showings or exchange films across sites.

The objective is:

```text
J(x) = round(sum_j a_j(x))

p_j = reference_response × film_base[f] × site_taste[s,f]
      × interpolated_time_weight(start_j) × day_or_prime_factor[f,start_j]
      × applicable_large_room_factor

At the same site, for every other screening:
  same film less than 90 minutes apart: multiply p_j by 0.72
  different film less than 20 minutes apart: multiply p_j by 0.94
Also multiply p_j by 0.93 ^ number_of_other_same_film_screenings.

a_j = min(screen_capacity[j], p_j)
```

`J` is **rounded synthetic expected attendance across screenings**. It is not observed admissions, purchased tickets, revenue or unique people. No individual people are generated, so no identity/history or person-level conservation claim is made. A real business target must be agreed and validated separately.

The classroom response scale is 130. Its time points are 10:00/.45, 13:00/.60, 16:00/.78, 19:00/1.00, 21:00/.92, 23:00/.55 and 24:40/.35, with linear interpolation. Day factors apply before 17:00, prime factors from 18:00 and 1.0 in between. Film C's declared large-room factor is 1.15 at capacities of at least 250. Film/site values, time points and screen threshold come from the explicit package; these are not coefficients fitted from the homework's six purchase fields.

| Component | Decision | Role | Model | Definition / status |
|---|---|---|---|---|
| C1 | D1 | Cost, maximize | Formulation | The explicit aggregate rule computes per-show/site predictions and the whole-plan score. |
| C2 | D1 | Constraint | Formulation | Packing and feasibility enforce operating/cleaning times, room eligibility, film coverage/caps and nonempty screens. |
| C3, proposed replacement for C1 | Future D1 | Cost, maximize agreed target | Data-driven | A learned schedule/context → outcome evaluator needs exposure/action/outcome data and held-out validation; not implemented. |

Every supported screen must have at least one showing. Each film must appear at the declared minimum number of sites; per-site and chain film caps apply. The sample minimum is two sites, maximum five shows per film/site and chain caps A–F `[26,16,14,14,10,10]`. Sample Film C needs at least 180 seats; E/F cannot use rooms at or above 250. Packing enforces declared opening/closing, runtime and cleaning between shows. The final film must finish by closing; cleaning after that final film is not part of the closing test. Real operational rules are `TBD`.

Step 2 can change opening/closing, cleaning, minimum coverage, per-site film cap and reference response scale. The updated rules must still admit the uploaded reference before a run is confirmed. Iterations are 100–20,000 in multiples of 100; seed is an integer 0–2,147,483,647. Fixed five-minute start grid, 17:00/18:00 periods and the .72/.94/.93 interaction rules cannot be changed in this release. Unsupported package fields or fixed-rule edits are rejected rather than silently applied. Selected settings affect real engine globals; they are not presentation-only values.

The importer accepts JSON/CSV up to **2 MiB**. JSON contains all definitions, explicit model/rules and the reference. CSV has exactly `showing_id,site_id,screen_id,film_id,start_time` and uses the currently loaded package's definitions, or classroom definitions when none are loaded. Times are relative to one operating day, so 24:40 is next-day 00:40. Invalid IDs/shapes/numbers, grid starts, conflicting intervals, closing, room fit, coverage or caps prevent acceptance. Rejected input cannot replace an accepted plan. Fresh HTTP checks rejected an invalid film-ID CSV, disabled the next action and retained the prior dataset; a changed infeasible closing rule also disabled results navigation. Final-SHA source rejection and recovery replay passed. Dynamic best-plan PASS/FAIL uses actual feasibility, not a cumulative count of rejected candidates.

## 3. Information & Uncertainty

The operator workflow needs a **separate planning package** beyond the purchase-field brief. [CinemaPlanning.json](CinemaPlanning.json) declares film runtimes/eligibility and response factors, site capacities/tastes, operating/coverage/cap rules and a complete current timetable. [Screenings.csv](Screenings.csv) supplies timetable rows against those declared definitions. Both are synthetic classroom inputs; their existence does not show that an actual client has supplied or validated these inputs. Request the corresponding real information from scheduling, operations and data owners before practical use.

The [HW1 brief](../reference/assignment.md#2-client-brief-and-available-information) supplies a specification, not an actual dataset: `title_tag`, `venue_tag`, `play_day`, `curtain_time`, `account_tag`, `passes_bought`. A row is one completed purchase for one screening. Date/time describe the screening, not the purchase event. Buying three tickets does not establish three attendee histories.

Purchase-only records do not reveal zero-sales exposure, no-purchase opportunities, check-ins, unique attendees, latent demand or another schedule's counterfactual outcome. A purchased-ticket target cannot be identified or validated by this aggregate attendance rule from those fields alone. Do not silently substitute its synthetic score for purchased tickets.

A fictional audit table illustrates the unit, separately from the simulator:

| title_tag | venue_tag | play_day | curtain_time | account_tag | passes_bought |
|---|---|---|---|---|---:|
| Film A | Site A | 2027-01-03 | 18:00 | Account P1 | 2 |
| Film A | Site A | 2027-01-03 | 18:00 | Account P2 | 1 |
| Film B | Site A | 2027-01-03 | 20:00 | Account P3 | 3 |
| Film C | Site B | 2027-01-03 | 18:00 | Account P1 | 2 |
| Film B | Site B | 2027-01-03 | 20:00 | Account P4 | 4 |
| Film C | Site B | 2027-01-03 | 20:00 | Account P5 | 1 |

The table has **6 purchases, 13 purchased tickets and 5 purchasing accounts**. It does not establish admissions or distinct viewers. The Data & method panel displays these six fictional records and their totals. They are not used to fit C1; the simulator has no transaction-fitting workflow.

| Fact / assumption / request | Purpose | Provider / priority | Fallback |
|---|---|---|---|
| Record semantics supplied; actual size/dates/quality `TBD` | Confirm valid units, duplicates and refunds/cancellations | Data owner; first audit | Labeled fictional purchases and defensible purchase summaries only. |
| Full schedule exposure and versions `TBD` | Include zero-sales shows and establish available actions/cutoff | Scheduling/system owner; high | Keep C1 assumed; prospectively log versions; defer learned/action-effect claims. |
| Capacity, runtime, hours, cleaning, rights and formats `TBD` | Real feasible set | Operations owner; high | Use the declared fixture only; no operational recommendation. |
| Target and linked outcomes `TBD` | Distinguish sold tickets, admissions, unique viewers and revenue | Business/data owners; high | Retain synthetic expected-attendance units without a business result. |
| Purchase-event times and booking/change rules `TBD` | Leakage prevention and any future revision design | Booking/system owner; conditional | Restrict to fixed-plan D1. No implemented lock or feedback claim. |
| Site/time/substitution response | Coefficients are assumptions; alternative plans may rank incorrectly | Modeling role; conditional | Sensitivity and out-of-time validation before real recommendations. |
| Actual scheduling policy and approved baseline `TBD` | Fair practical comparison | Scheduling manager; high | Use the uploaded feasible timetable as the declared reference; the classroom file is not an observed operator schedule. |

Uncertainty includes missing exposure, historical schedule-selection bias, arbitrary response coefficients and changing preferences/policies. The chosen seed controls algorithm randomness; it does not establish response accuracy. Validate purchase counts/date aliases and coverage before aggregation. Keep later outcomes out of available-at-cutoff inputs. Sensitivity to plausible site/time/cannibalization parameters and time-separated validation should precede a trial; the current page exposes imported assumptions and selected operating/search settings, but does not fit them or offer a parameter-learning editor.

## 4. Alternatives & Selected Approach

| Approach | Mechanism / required information | Strength / limit | Use |
|---|---|---|---|
| A — Current/operator schedule | Feasible current timetable and validated operational rules | Auditable reference; real scheduling policy and performance remain unknown. | The uploaded schedule is the declared comparison baseline. |
| B — Aggregate Response evaluator + ILS | Score complete plans and generate feasible local changes | Direct action comparison; ranks depend on response assumptions and search has no global guarantee. | Selected executable approach; C1 is a declared formula. |
| C — Individual synthetic-audience evaluator | Generate latent consumers, choices and seat access/history | Supports mechanism questions with additional assumptions and calibration needs. | A separate approach; not the Case A engine. |

Response modeling and search are separate choices. BO would require a surrogate/posterior, an acquisition rule and updates following selected evaluations; it may be useful when evaluation is costly and its uncertainty can be modeled. **The current algorithm is seeded ILS, not BO.**

The main baseline is **the exact uploaded and confirmed feasible reference timetable**, scored using the same response rule and constraints as the search candidates. There is no uniform-response presolve in this workflow. The sample is a synthetic feasible current schedule, not an observed client/operator policy. Changes to assumptions or constraints require reconfirmation and define a new comparison.

ILS starts from that reference with the selected seed and iteration budget. It makes local film/time/screen/supply moves, applies a multi-move kick after more than 80 stalled iterations, rejects infeasible candidates and accepts non-worse current states or a kick. It separately retains the strictly best feasible score; ties keep the current best. It may insert/delete shows, so the optimized showing count can differ from the input while every screen and the declared film rules remain satisfied. An extra Results what-if can apply a feasible exchange or delay as a new search start; it does not silently replace the original uploaded comparison record.

The numerical rule derives from S13/SIM2 in the original desktop Response proposal, source revision `285e698` (30 August 2026; introduced at `1ddfa6a`, promoted to S13 at `862298a`). Its 12 numerical functions are `tw`, `rnd`, `ri`, `clone`, `packSite`, `packAll`, `feasible`, `predict`, `evalS`, `presolve`, `ruleBaseline`, `move`. The new loader supplies validated fixture/plan variables; the exact 1.5 artifact passed 39 independent Node checks: 27 preserved regression cases and 12 new loader/configuration/operator cases. The old native/manual regression results are separate from the uploaded sample run. The pure importer separately passed 25 independent tests, including actual archived-engine packing/prediction fidelity, mutable assumption effects, round trips and rejected-input non-mutation. That importer evidence does not replace new UI/run verification.

## 5. Demonstration & Evaluation

Open [Response Schedule Optimizer](demo.html). The design uses a dark workflow sidebar, light work area and current-step actions at the bottom. Follow the four steps:

1. **Import planning data:** use **Load classroom sample**, or upload [CinemaPlanning.json](CinemaPlanning.json). [Screenings.csv](Screenings.csv) supplies the same reference against declared classroom definitions. **Download planning JSON** and **Download timetable CSV** provide templates. Import metrics expose films, sites/screens, reference showings and validation status.
2. **Objective & constraints:** use **Review data & rules**. Review film definitions, screen capacities/tastes, showing IDs/start times and model assumptions. Keep the sample settings at 10:00–24:40, 15-minute cleaning, two sites per film, maximum five shows per film/site, scale 130, 2,600 iterations and seed 20260829. **Confirm settings** evaluates and installs the reference but does not optimize it.
3. **Run optimization:** use **Run optimization** / **Run search**, **Pause** or **Finish search**. A confirmed run begins at the uploaded reference. **Restart reference search** restores that reference under the same confirmed settings. Inspect score, budget progress, response calls, log and feasibility; **View results** follows a completed run.
4. **Review results:** inspect reference/best/gain/showing metrics, site × film heatmap, Gantt and confirmed-start/best site comparison. **Download timetable CSV** exports the five importable columns; **Export full results JSON** includes the input package, fixture/settings, records/factors and best showings. Actual final-SHA downloads were audited; browser reimport of the downloaded optimized CSV preserved 89 rows and reference score 5,247. Film exchanges and closing tests are collapsed extra experiments in Results; applying one returns to Step 3 to prepare another optimization.

The reviewed artifact is **650,464 bytes**, SHA256 `77067435a531c809bc1e89f8a9b0bbf3b48dba09d5a7e2a6144fc283b1474d17`. Evidence is separated by method:

- **Exact-artifact Node:** **39/39 checks passed**, including 27 preserved regressions and 12 new operator-input cases. Independent audits reconstructed uploaded starts/identities, configured constraints, response factors and full totals; checked no presolve, immutable inputs/exports, rejected-load state preservation, custom screen IDs/duplicate display names and exact seeded replay. Rendering-only stubs do not establish UI or direct-file behavior.
- **Pure importer:** **25 independent tests passed** on the unchanged parser module, separately from the app. They cover supported shape/limits, IDs, actual-core mapping, coefficient effects, rules/boundaries, CSV/JSON syntax and round trips, byte limits and state isolation.
- **HTTP browser:** independent CUA checked actual files and sample/configuration/rejection/recovery. The final artifact fixes custom-screen inspection metadata; its Node audit passed. Final-SHA source/staged pipeline replay, Run/Pause/Finish, actual JSON/CSV exports and CSV reupload, invalid-file recovery, responsive layouts and course navigation passed. The 100-iteration/seed-7, scale-104 and closing-23:00 UI checks retain their preceding-candidate scope. Direct offline opening is unverified.

| Case / workflow | Inputs / steps | Executed evidence |
|---|---|---|
| Actual planning JSON | Upload **CinemaPlanning.json** → Review data & rules | Actual HTTP upload observed **90 reference showings / 4,969**. Exact-artifact Node independently preserved every film/screen/start and summed **4,968.820371149739 → 4,969**. |
| Confirmation | Keep declared settings → Confirm settings | Reference installed at **4,969**, iteration 0; no optimization yet. Exact-artifact Node confirms the starting record without presolve. |
| Default optimization / recovery | Sample, 2,600 iterations, seed 20260829 → Finish search | **4,969 → 5,247**, gain **+278 (about 5.6% of the synthetic reference score)**, **1,742 calls**, **2,600 iterations**, **89 retained showings**, all 18 screens, **PASS**. Exact-artifact Node and HTTP recovery agree. Independent best total **5,246.789178502658 → 5,247**. |
| Smaller explicit run | Sample, **100 iterations / seed 7** | Actual HTTP **4,969 → 5,126**, **63 calls**, 100 iterations. Exact-artifact Node repeated the same result, with 90 retained shows. |
| Response setting and current-package CSV | Reference scale **104**, same 100/seed-7 settings; upload **Screenings.csv** against the current definitions | HTTP confirmed **3,975 → 4,101**. The actual CSV upload uses the current scale 104 and therefore reviews at **3,975**; it does not reset to the classroom scale 130. This is a different objective configuration. |
| Settings failure | Change closing to **23:00** | Actual reference rows violate closing; confirmation rejected and results navigation disabled after the setting change. Node separately audited actual opening/closing/cleaning boundaries and state preservation. |
| File failure and recovery | CSV with unknown film **X** on row 2; then load a valid sample | HTTP showed row 2 and the film-ID field path, retained the previous accepted dataset and disabled Next. Valid sample recovery again completed **4,969→5,247 / 1,742 calls / 2,600 / 89 shows**. Node rejected 14 malformed run-setting cases through inspection and load without changing the completed result. |
| IDs and detached state | Custom screen IDs and duplicate names; mutated returned inputs/options/exports | Exact-artifact Node verified first/second inspections, load and search retain canonical IDs and correct screen metadata; display names are not identity keys. Caller/returned-object mutation did not affect accepted state or subsequent exact replay. |
| Actual full JSON download | Default completed sample → **Export full results JSON** | Actual download contains **90 input rows**, **89 best rows**, configured seed/budget and per-show factors; their sum **5,246.789178502658** rounds to **5,247**. Audited download SHA256 `248759acff3a39dc05e90f0b42c1ab4de4f8a61b9668804f7daa2fa2f7ad3179`. |
| Actual timetable CSV download | **Download timetable CSV** | Download has exactly the five declared columns and **89 rows**; it was successfully parsed and actually reuploaded in the final-source browser against the same planning definitions, giving 89 rows and reference **5,247**. SHA256 `f52df0d3d8b42f88cab80eb76b8d0f95b54d9b65229a58da9725af691972a866`. Reimporting uses the current model/rules. |
| Source replay / responsive | Final-SHA sample pipeline, Run/Pause at iteration 1,605 → Finish; 390-pixel Import/Results views | Repeated **4,969→5,247 / 1,742 / 2,600 / 89**, PASS. Mobile body width **390** on Import/Results; method dialog **356**. Desktop restored. Staged app, guide and proposal returned to the hub, as did course portal → Assignment 1 → Open worked examples. Assembly/installer/course build and worked-examples/assignment checks passed separately; no direct offline execution is claimed. |

The [verification record](verification.json) preserves artifact/input/export hashes and distinguishes earlier-candidate configuration flows, final-SHA source/course browser and export evidence, and exact-artifact Node checks. The sample input files are [CinemaPlanning.json](CinemaPlanning.json) and [Screenings.csv](Screenings.csv), validated by the same parser used in the page. A seed fixes algorithm replay for the same plan representation, rules/response assumptions, budget and entry path; it does not establish forecast accuracy. Explicit-start import canonicalizes gaps, so a previous internal-plan search trajectory is not a comparison run for this uploaded case. Old regression scores must not be used as the new operator result.

Functional verification can establish importer/engine fidelity, valid reference confirmation, feasible search, stated score arithmetic, state isolation and reproducible export/reimport. It cannot establish response accuracy, causal effects, global optimality, real policy compliance or business uplift. For a learned evaluator, use exposure-aware held-out periods and error/calibration metrics. For actions, preserve a common target/rules/baseline, test response misspecification and use a bounded prospective comparison.

## 6. Client Proposal

Request a bounded information audit. Scheduling/operations owners provide the actual current schedule, controllable actions, runtime/capacity/operating/rights rules and an approved reference policy; data/business owners agree target semantics, outcome links and information cutoff. Section 3 gives priorities and fallbacks. The planning package is a transparent input contract, not evidence that this information exists in purchase logs.

Next, evaluate an exposure-aware Response model on held-out periods and test schedule rankings under plausible assumption changes. Proceed to shadow recommendations or a controlled trial only after response and feasibility gates are agreed. Require zero hard-rule failures for recommended plans and establish predictive/stability/practical-value thresholds after measuring the current process. Data volume, pilot duration, cost and expected benefit are `TBD`, estimated from variance, decision frequency and integration needs rather than synthetic scores.

**Proceed** when information, reproducibility and agreed validation gates are adequate. **Revise** when rankings are unstable or response validation fails. **Stop or narrow** when the target is unsupported, exposure/rules are unavailable, the reference/recommendation is infeasible or a prospective comparison shows no practical value. The next requested decision is approval of the audit and assignment of information owners. Training, BO and operational feedback remain future decisions.

## 7. LLM Review & Key Revisions

These are actual preparation reviews, not an invented student's discussion history. Students must document their own significant suggestions and independent checks.

| Suggestion / initial framing | Independent check / assessment | Final use |
|---|---|---|
| Treat a response proposal as a learned model/BO, or promote the audience-twin app as its implementation | Inspected the original SIM2 numerical functions and user clarification; the evaluator is assumed aggregate arithmetic and the algorithm is ILS, independent of synthetic-person choices. | Keep the exact response scope, no fitting/BO claim, and preserve the established proposal as a broader concept. |
| Present film-exchange widgets as the whole Case A workflow | User requested an operator flow matching the input/configure/optimize/results structure. Defined a complete planning contract, then independently tested IDs, shape, packing, rules, CSV/JSON and state isolation. | Use four operator steps; explain that the purchase brief lacks these planning inputs; retain exchanges and closing tests as Results extras. |
| Reuse the previous search result or export a CSV with extra prediction fields | Fresh UI gave 4,969→5,247 after explicit-start import; canonical gaps change the seeded trajectory. Source review also found an extra CSV column incompatible with the declared importer; the generator was corrected to five columns. | Report only new-run observations, keep a common uploaded baseline/settings, and verify the corrected five-column export/reimport, final-artifact engine audit and separately scoped HTTP evidence before recording passes. |

Source basis: the [assignment](../reference/assignment.md), [template](../reference/problem-definition-template.md), [classification reference](../reference/problem-classification-reference.md), original 44-slide Response proposal, original S13/SIM2 source, explicit [planning JSON](CinemaPlanning.json) and [screening CSV](Screenings.csv). [Verification](verification.json) records the source/test scope. LLM output alone is not evidence of response accuracy, external facts or operational value.


## Appendix A. Proposal presentation notes and evidence boundaries

The presentation follows a decision story: **baseline forecasting and scheduling → schedule-dependent audience response → response evaluator → feasible search → operator decisions → proposed learning and rollout**. The 44 section IDs and 31-slide compact presentation path are retained. The diagram in `s03` is an illustrative classroom baseline, not an observed company workflow. Its original P1–P4 and A1–A4 labels have been restored.

### A.1 Proposed architecture and demonstrated calculation

The proposed architecture adds learned response estimation, uncertainty, service integration and rolling operation to a forecast-and-scheduling baseline. `s32` describes a possible constrained BO loop: **response estimate and uncertainty → acquisition choice → feasible candidate evaluation → posterior update**. The executable operator application remains the release 1.5 aggregate synthetic-response equation with seeded ILS. It does not fit purchase data or execute BO; its numerical engine and measured sample results are unchanged in proposal revision 1.7. The embedded rolling illustration also uses synthetic signals and scripted learning assumptions.

The proposed inputs in `s21` are a collection map: film/demand context, scheduling actions and screening outcomes, and operating constraints. The classroom purchase-field brief supplies transaction semantics, not a complete screening dataset. Purchase events must be joined to the entire screening inventory, capacities, zero-sales shows, schedule versions and event times before defining a real response target. No original data-category count is asserted as an available Assignment 1 dataset.

`s24` and `s29` show a proposed sequence and adoption path; they make no calendar, budget, licensing or commercial promise. `s30` describes value dimensions to measure. `s33` replaces vendor references with a test strategy. `s35` requests a focused prototype, useful inputs and a decision owner. `a2` retains meaningful validation gates and reusable outputs.

### A.2 Guidance moved out of audience-facing slides

The passages below preserve the previous classroom/audit wording verbatim. They are retained as evidence and planning notes, and are also available through the proposal’s built-in speaker-note view (`N`). Their location here prevents provenance bookkeeping from interrupting the problem-solving explanation.

#### `s03` — Start with separate forecasting and scheduling flows, then connect them through response

> A declared reference workflow, pending an operator audit The classroom brief supplies purchase-field meanings. A separated forecast → schedule process is an assumption for this expanded reference, not an observed current practice. Confirm the real planning window, current plan and rule ownership before designing a replacement.

#### `s21` — Organize the proposed inputs by their role in the decision loop

> Purchase records establish transactions, not demand response Known teaching fields: film, venue, screening date/time, purchasing account and paid-ticket count. One row is one completed purchase. No actual dataset is supplied. Request the complete screening inventory, capacities, zero-sales shows, schedule versions and purchase event times. The original 47-category inventory is not an available HW1 dataset.

#### `s24` — Build in three stages: feasibility → response → integrated operation

> Sequence the work by evidence, not calendar promises Stage 1: audit record semantics and operational rules. Stage 2: evaluate a declared response target on time-separated data. Stage 3: run a bounded trial with operator approval. Duration and dependencies: TBD after data coverage, permissions and validation effort are known.

#### `s29` — Adopt a phased structure : prototype → integration → ongoing operation

> Adopt through evidence gates Audit → historical validation → bounded operational trial → deployment decision. Define thresholds with the operator using a measured baseline. Budget, timeline and benefit estimates are TBD. This classroom example supplies no justified commercial estimate.

#### `s30` — The value goes beyond time saved on scheduling

> Value must be measured against a declared baseline Potential operational value: feasible recommendations, transparent tradeoffs and better measured outcomes. The demo establishes computation under a fixture. Search scores do not establish business uplift, causality or adoption readiness.

#### `s31` — Connect decision models to operating systems

> Make the analysis auditable Retain the input snapshot, planning cutoff, rules, evaluator version, seed, baseline, accepted candidates and reasons for rejection. A colleague should be able to reproduce a recommendation and explain what would invalidate it.

#### `s32` — Use response estimates to choose the next schedule to evaluate

> Separate evaluator choice from search choice A response formula or learned predictor evaluates actions. ILS, enumeration, a solver or BO determines which actions to examine. The executed demo uses deterministic ILS. BO would require a posterior, acquisition rule, evaluation and posterior update; these are not implemented here.

#### `s33` — Test the recommendation under changing demand and operating conditions

> Stress the model before making an operational claim Check time leakage, zero-sales coverage, calibration by film/site, capacity effects, policy changes and assumptions about substitution. Do not use a recommendation outside supported contexts or when hard-rule checks fail.

#### `s35` — Turn the proposal into action with three decisions

> Request a bounded data and rule audit The data owner confirms record semantics and coverage. The operations owner supplies the reference plan and rules. The modeling role defines the outcome and evaluation protocol. Approve an audit scope and a validation gate. Real-data modeling and a field trial remain future work; cost and duration are TBD.

#### `a2` — Validate through four gates, and retain useful assets at every outcome

> Proceed, revise or stop at explicit evidence gates Proceed only when the outcome unit, planning cutoff and feasible set are defensible. Validate prediction separately from optimization and operational effects. Stop or revise when critical information is missing, calibration is poor, recommendations violate hard rules or a trial fails the agreed outcome/stability criteria.

### A.3 Practical validation and record keeping

Before a real-data model or trial, agree the outcome unit, planning cutoff, feasible set, reference process and operator ownership. Split prediction assessment, optimizer assessment and observed operating effects. Check time leakage, zero-sales coverage, film/site calibration, capacity censoring, policy changes and substitution assumptions. Historical counterfactual comparisons depend on the response model and identification assumptions; they do not alone establish causal business improvement.

Retain input snapshots, source showing IDs, cutoffs, operating rules, evaluator versions, seeds, reference plans, candidate scores, accepted recommendations and rejection reasons. Use the same scenario and rules to compare the reference and candidate; repeat sensitivity tests before expanding the operating scope. A colleague should be able to reproduce the recommendation and state when it ceases to apply.

Agree data-processing permission, deidentification/aggregation, environment boundaries, retention and deliverable ownership with the relevant operator. The proposed security and integration diagrams describe design intent, not a completed platform or security audit.
