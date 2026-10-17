# Response Model Simulator: Cinema Scheduling with an Aggregate Evaluator

**IE437 Assignment 1 · Public worked example · English · 11 October 2026 · v3.1**

Author / student ID: Public teaching sample; not a student submission.  
LLM use: OpenAI Codex, a GPT-6-based assistant, supported source inspection, English drafting and independent scope review. Three actual review decisions appear in Section 7.

The [Response Model Simulator](demo.html) is an independent page containing the existing **SIM2 aggregate response evaluator and Iterated Local Search (ILS)**. It does not create individual synthetic consumers or call the audience digital twin's choice/seat engine. The primary `proposal.html` retains the established 44-slide Response proposal and its original design; `extended-proposal.html` is the same full presentation. [Demo guide](demo-guide.md) · [Verification status](verification.json) · [All worked examples](../index.html).

The response equation, film/site parameters and operating rules are explicit synthetic assumptions. No model is fitted to real purchase data. BO is a possible future search extension, not the implemented algorithm. Broader learned-model and rolling-operation concepts in the presentation are proposals beyond this standalone simulator. The exact standalone build has passed the Node and HTTP checks described in Section 5. Direct offline file opening remains unverified; historical widget results are not reused as current-build passes.

## 1. Decision, Scope & Problem Structure

> A cinema scheduling manager uses a declared film/site fixture, a reference schedule and operating rules to choose a feasible film/screen/time schedule for one operating day, in order to improve an explicitly assumed aggregate expected-attendance score.

**D1 — Select one operating-day plan.** The fixture has six sites, three screens per site and six films. Screens open at 10:00 and the last film must end by 24:40, relative to the operating day. The experiment shifts one selected screen's showtimes; ILS can revise film sequences, gaps and offsets across the chain. The manager previews the score and feasibility, applies a valid plan, inspects its timetable and searches for alternatives. Real inventory, rights, planning window, current policy and information cutoff are `TBD`.

| Property | Classification | Reason within D1's boundary |
|---|---|---|
| Decision Structure | Flat | Select one complete plan. Forecasting, packing and search are computational stages, not parent–child schedule decisions. |
| State Structure | Stateless | The chosen plan is evaluated once. Temporary current/best search candidates and a UI draft are algorithm/session state, not carried operational commitments. |
| Information Structure | Open-loop | No later booking/outcome observation arrives during this decision. Interactive experimentation does not create operational feedback. |

D1 is evaluated by C1 and constrained by C2. There is no additional rolling decision in this standalone page. Personal choice trajectories, revenue/profit optimization, booking locks, true format policies, training, causal identification and production integration are excluded. The original proposal discusses some of those broader capabilities; they must not be attributed to this engine. Classification follows the [supplied reference](../reference/problem-classification-reference.md).

## 2. Computable Problem

A plan `x` contains ordered film assignments, nonnegative gaps and a starting offset for each site/screen. The packing function rounds show starts upward to a five-minute grid and advances by film runtime plus 15-minute cleaning. Screen capacity and film runtime are fixed inputs. The experiment adds a nonnegative shift to one screen's offset. ILS can replace or exchange films, change gaps/offsets, insert/delete screenings or exchange films across sites.

The objective is:

```text
J(x) = round(sum_j a_j(x))

p_j = 130 × film_base[f] × site_taste[s,f] × time_weight(start_j)
      × film_day_or_prime_factor[f,start_j]
      × applicable_large_room_factor

At the same site, for every other screening:
  same film less than 90 minutes apart: multiply p_j by 0.72
  different film less than 20 minutes apart: multiply p_j by 0.94
Also multiply p_j by 0.93 ^ number_of_other_same_film_screenings.

a_j = min(screen_capacity[j], p_j)
```

`J` is **synthetic expected attendance summed across screenings**, rounded to a whole score unit. It is not observed admissions, purchased tickets, revenue or unique people. No individuals are generated, so no individual identity/history or person-level conservation claim is made. The business aim remains conditional on agreeing and validating a real target.

The time-weight function linearly interpolates these assumed values: 10:00/.45, 13:00/.60, 16:00/.78, 19:00/1.00, 21:00/.92, 23:00/.55 and 24:40/.35. The film factor uses prime values from 18:00 onward, day values before 17:00 and 1.0 in between. Film C receives its stated large-room multiplier at capacities of at least 250. All numbers are fixture assumptions, not coefficients estimated from the six teaching fields. The **Data & method** panel exposes the film and site parameter tables.

| Component | Decision | Role | Model | Definition / status |
|---|---|---|---|---|
| C1 | D1 | Cost, maximize | Formulation | The explicit aggregate response rule computes `J`, per-screening attendance and site totals. |
| C2 | D1 | Constraint | Formulation | Pack runtime/cleaning intervals and check closing time, room fit, coverage and show caps. |
| C3, proposed replacement for C1 | Future D1 | Cost, maximize agreed target | Data-driven | A learned schedule/context → outcome evaluator would require exposure/action/outcome data and held-out validation; not implemented. |

The hard fixture rules are: each screen has at least one showing; each film appears at at least two sites; each film has at most five shows per site; chain show caps for films A–F are `[26,16,14,14,10,10]`; film C requires at least 180 seats; films E/F cannot use rooms of at least 250 seats. Packing prevents overlap, supplies 15 minutes between successive films and rejects a last film ending after 24:40. Cleaning after the final film is not part of this closing test. Actual rights, formats, contracts and commitments are `TBD`.

The experiment calls **the same `packAll → feasible → evalS/predict` functions as ILS**. Invalid shift input returns an input error; an un-packable or infeasible plan has no valid score and cannot be applied. A previous valid heatmap/search result is not a result for an invalid preview. The applied best plan's **PASS/FAIL** indicator is derived from its actual feasibility check; it is not a hardcoded zero-violation counter or a count of all rejected search candidates.

## 3. Information & Uncertainty

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
| Actual scheduling policy and approved baseline `TBD` | Fair practical comparison | Scheduling manager; high | Compare only with the declared uniform-response ILS baseline. |

Uncertainty includes missing exposure, historical schedule-selection bias, arbitrary response coefficients and changing preferences/policies. The fixed seed controls algorithm randomness; it does not establish response accuracy. Validate purchase counts/date aliases and coverage before aggregation. Keep later outcomes out of available-at-cutoff inputs. Sensitivity to plausible site/time/cannibalization parameters and time-separated validation should precede a trial; the current page exposes assumptions but does not fit them or offer a parameter-learning editor.

## 4. Alternatives & Selected Approach

| Approach | Mechanism / required information | Strength / limit | Use |
|---|---|---|---|
| A — Operator/rule plan | Confirmed current schedule and operational constraints | Auditable and simple; may ignore action response. Current real policy is unknown. | Practical baseline after audit. |
| B — Aggregate Response evaluator + ILS | Score entire schedules; generate feasible local moves | Direct action/outcome comparison; quality depends on evaluator and local search has no global guarantee. | Selected mechanism. C1 is currently an explicit assumed formula, not a learned model. |
| C — Individual synthetic-audience evaluator | Generate richer latent consumers, choices and seat allocation | Useful for mechanism questions; more assumptions and calibration demands. | A separate approach, not the SIM2 implementation. |

Response modeling and the search method are distinct choices. BO would require a fitted surrogate/posterior, an acquisition rule and posterior updates following selected evaluations. It may be considered if evaluations are expensive and useful uncertainty can be modeled. **This executable search is deterministic ILS, not BO.**

The baseline is explicit: construct capacity-based film rotations, then run 2,600 ILS moves with uniform site taste (`uni=true`). Evaluate that resulting plan using the site-specific C1 rule. Both baseline and displayed search candidates use the same site-specific response score, capacities and hard rules. It is not a measured current operator schedule or an unoptimized rule baseline.

The main search starts from that plan with seed **20260829**, continuing the same deterministic stream after presolve. Generate a local move, add a multi-move kick after more than 80 stalled iterations, reject infeasible candidates and accept a non-worse current score or a kick. Separately retain the strictly best feasible score; ties keep the existing best. Run 2,600 iterations. Loading an experiment plan initializes a new search at seed 20260829 directly and uses that plan as its baseline, so the two starting modes are distinct.

Provenance: the engine comes from **S13/SIM2 in the original desktop Response proposal**, latest source revision `285e698` (30 August 2026). SIM2 was introduced at `1ddfa6a` and moved into S13 at `862298a` on 29 August. A syntax-tree comparison between that original source and the archived English extraction verified equality of 12 core functions: `tw`, `rnd`, `ri`, `clone`, `packSite`, `packAll`, `feasible`, `predict`, `evalS`, `presolve`, `ruleBaseline`, `move`. The standalone page reuses this aggregate engine. The final artifact also passed equality checks for these 12 functions against both the original and archived extraction, plus independent constraint and per-show calculation audits. The original display's hardcoded zero is replaced by a real best-plan feasibility indicator.

## 5. Demonstration & Evaluation

Open [Response Model Simulator](demo.html). Use **Reset → Run search → Pause → Finish search** for the main baseline comparison. Inspect the heatmap and select sites for their screen Gantt. The inline experiment previews a complete shifted plan; **Apply evaluated schedule** is available only when valid. **Data & method** displays the equation, six film/site assumption tables and the fictional purchase audit. **Export results** downloads the evaluated state as JSON. See the [guide](demo-guide.md).

The reviewed artifact is **526,169 bytes**, SHA256 `126b881250e394e725b3995ac10c70cce9f5929ccad1cb75568d498c50faeb37`. Verification was completed on 11 October 2026 by two distinct methods:

- **Node:** 16 checks passed on the exact HTML, including equality of 12 core functions with the original and English archive, independently checked constraints and per-show response recomputation, fresh-VM and same-VM replay, invalid-input non-mutation and stable repeated finish/export. Rendering-only DOM stubs do not establish browser behavior.
- **HTTP browser:** an independent CUA review of the exact build exercised search/pause/finish at both speeds, inline previews, applying valid plans, failure/recovery, site/Gantt inspection, Data & method and an actual JSON download. These observations establish the reviewed HTTP environment; **direct offline file opening remains unverified**. Course-prefix return navigation passed for the staged demo, guide and original proposal.

| Case / workflow | Inputs / steps | Executed result |
|---|---|---|
| Main Reset comparison | Reset → Run search → Pause → Finish search | Baseline **5,134 → best 5,265**, **1,739 response calls**, **2,600 iterations**, **90 shows**, actual best-plan **PASS**. Reset/Finish repeated the same result; speed 1× and 4× gave the same completed result. |
| Normal experiment | Reset → Normal / **0 min** → Apply evaluated schedule → Finish search | Loaded baseline **5,134**, best **5,134**, **1,715 calls**, 2,600 iterations. Valid; no improvement in this starting stream. |
| Boundary | Boundary / **365 min**, Site D / Screen 1 → preview → apply → finish | Preview **5,099**, last film end **24:36**, closing **24:40**, four minutes slack; valid application enabled. Applied baseline **5,099 → best 5,352**, **1,750 calls**, 2,600 iterations, **PASS**. Search is disabled until the changed preview is applied. |
| Failure | After the boundary search, preview Failure / **370 min** | **INFEASIBLE**, no valid preview score; apply/search disabled. The prior evaluated best **5,352** remains displayed without being attributed to this preview. The shifted final film would end at **24:41**. |
| Input failure | Clear the shift field | **INVALID**, no valid score; apply/search disabled. Node also checked ten invalid inputs without plan mutation. |
| Recovery / replay | Select Normal 0 and apply, or Reset → Finish search | A valid applied Normal search again gives 5,134/5,134/1,715. Reset restores the main 5,134→5,265/1,739 workflow. Fresh-VM and same-VM replay passed in Node. |
| Export | Reset → Finish search → Export results | Actual download contains baseline **5,134**, best **5,265**, 2,600 iterations, 1,739 calls, fixture/seed/source information and **90 bestFeasibleShowings**. Their per-show attendance sums round to **5,265**. Repeated finish/export is stable in Node. |

**The two starting modes are distinct.** Reset initializes the seed before the 2,600-move uniform-response presolve and continues that stream into the displayed search. Applying even Normal 0 starts search at seed 20260829 directly. Therefore a valid applied Normal can show no gain while Reset shows a gain; neither result should be substituted for the other. Keep fixture, seed and starting mode common in comparisons.

Browser search was paused mid-run and finished to the same completed result. Site D selection showed its heatmap/Gantt; Data & method contained six films, six sites, the equation, six fictional purchases totaling **13 tickets and five accounts**, in English. At a 390-pixel viewport the body width was 390 and the method dialog width 352; the desktop body returned to 1280. These are responsive observations, not a complete accessibility audit.

The [verification record](verification.json) separates Node evidence, HTTP observations, artifact identity, passed return navigation and unverified direct-file opening. The actual downloaded JSON SHA256 is `1071edecc99b7506790ac6bff07488024209f2d5908896a992af4a88ddd2013a`. Historical widget or audience-app results are not reused as passes for this release.

Functional evidence establishes deterministic fixture execution, valid-only application, failed-preview non-mutation, recovery, actual best-plan feasibility and a calculated local improvement in the main stream. It does not establish response accuracy, causal identification, a global optimum, operational legality or real business benefit. For a learned model, use exposure-aware held-out periods and agreed error/calibration metrics; for action evaluation, keep baseline/target/rules common, test misspecification and use a bounded prospective comparison.

The retained original proposal supports arrow-key navigation and presenter notes, with a permanent **All worked examples** return link. Its prepared illustrations and future architecture remain distinct from the standalone SIM2 page; no slide navigation is needed to run this demo.

## 6. Client Proposal

Request a bounded audit first. The data owner confirms record semantics, coverage and temporal availability; the operations owner supplies controllable actions, actual rules and the approved reference schedule; the modeling role agrees outcome unit, cutoff and comparison design. Section 3 specifies priorities and fallbacks.

Next, test an exposure-aware Response evaluator against that baseline on held-out periods. Estimate sensitivity and supported contexts before shadow recommendations or a controlled live pilot. Require zero hard-rule failures for recommendations and define predictive, stability and practical-value thresholds after measuring the current process. Data volume, trial duration, cost and expected benefit are `TBD`, to be estimated from variance, decision frequency and integration requirements rather than fictional engine values.

**Proceed** if information, reproducibility and agreed gates are adequate. **Revise** if rankings are sensitive to plausible parameters or calibration fails. **Stop or narrow scope** if the target is unsupported, exposures/rules are unavailable, a recommendation is infeasible or a prospective comparison shows no practical value. The next requested decision is approval of the audit and appointment of data/operations owners, not approval of a claimed uplift. The page demonstrates the aggregate evaluation/search loop; training, BO and operational feedback remain separate future decisions.

## 7. LLM Review & Key Revisions

These are actual preparation reviews, not an invented student's discussion history. Students must document their own significant suggestions and independent checks.

| Suggestion / initial framing | Independent check / assessment | Final use |
|---|---|---|
| Promote the existing audience-twin site as Case A because it is a full app | User clarified that Case A must be a separate Response simulator, even a simple widget. Inspected the desktop proposal's SIM2 and compared its core functions with the English archive. | Use the standalone aggregate SIM2 page, independent of person-level audience simulation; retain the original Response proposal. |
| Treat the prototype as a learned Response model/BO and its displayed zero as an audited violation count | Inspected `predict`, `presolve`, `move`, `step` and the original hardcoded display. The evaluator is assumed aggregate arithmetic; search is ILS. | State exact formula and baseline; keep learning/BO as future options; show dynamic applied-best-plan PASS/FAIL from actual feasibility. |
| Reuse old widget or audience-app results as proof of the standalone page | Checked the exact final SHA; the independent Node verifier and HTTP reviewer tested preview/apply, both search streams, failure non-mutation, replay and actual export. Node rendering stubs and HTTP review cover different environments. | Report the new build's executed results with their methods; distinguish Normal Apply from Reset, and record passed course-prefix return navigation and keep direct-file opening unverified. |

Source basis: the [assignment](../reference/assignment.md), [template](../reference/problem-definition-template.md), [classification reference](../reference/problem-classification-reference.md), original 44-slide Response proposal, original S13/SIM2 source and the archived English simulator. [Verification](verification.json) records source hashes and the function-comparison scope. An LLM response alone is not evidence of response accuracy, external facts or operational value.
