# Response Model Simulator: Cinema Scheduling with an Aggregate Evaluator

**IE437 Assignment 1 · Public worked example · English · 11 October 2026 · Demo release 1.4 · Document v4.0**

Author / student ID: Public teaching sample; not a student submission.  
LLM use: OpenAI Codex, a GPT-6-based assistant, supported source inspection, English drafting and independent scope review. Three actual review decisions appear in Section 7.

The [Response Model Simulator](demo.html) is an independent page containing the existing **SIM2 aggregate response evaluator and Iterated Local Search (ILS)**. It does not create individual synthetic consumers or call the audience digital twin's choice/seat engine. The primary `proposal.html` retains the established 44-slide Response proposal and its original design; `extended-proposal.html` is the same full presentation. [Demo guide](demo-guide.md) · [Verification status](verification.json) · [All worked examples](../index.html).

The response equation, film/site parameters and operating rules are explicit synthetic assumptions. No model is fitted to real purchase data. BO is a possible future search extension, not the implemented algorithm. Broader learned-model and rolling-operation concepts in the presentation are proposals beyond this standalone simulator. Release 1.4 makes an explicit film-assignment exchange the main experiment. Section 5 separates exact-artifact Node results, final-build HTTP observations and course-prefix navigation and responsive observations. Direct offline file opening remains unverified; historical release results are not reused as new-build passes.

## 1. Decision, Scope & Problem Structure

> A cinema scheduling manager uses a declared film/site fixture, a reference schedule and operating rules to choose a feasible film/screen/time schedule for one operating day, in order to improve an explicitly assumed aggregate expected-attendance score.

**D1 — Select one operating-day plan.** The fixture has six sites, three screens per site and six films. Screens open at 10:00 and the last film must end by 24:40, relative to the operating day. The main experiment exchanges the film assignments of two actual screenings from the original reference timetable, optionally adding a gap before the first slot. The exchange preserves each film's chain-wide showing count; different runtimes can move later screenings on the affected screens. The manager compares the original and drafted timetables and their response predictions, applies a valid draft, then runs ILS and compares original, applied and best-found plans. ILS can revise film sequences, gaps and offsets across the chain. Real inventory, rights, planning window, current policy and information cutoff are `TBD`.

| Property | Classification | Reason within D1's boundary |
|---|---|---|
| Decision Structure | Flat | Select one complete plan. Forecasting, packing and search are computational stages, not parent–child schedule decisions. |
| State Structure | Stateless | The chosen plan is evaluated once. Temporary current/best search candidates and a UI draft are algorithm/session state, not carried operational commitments. |
| Information Structure | Open-loop | No later booking/outcome observation arrives during this decision. Interactive experimentation does not create operational feedback. |

D1 is evaluated by C1 and constrained by C2. There is no additional rolling decision in this standalone page. Personal choice trajectories, revenue/profit optimization, booking locks, true format policies, training, causal identification and production integration are excluded. The original proposal discusses some of those broader capabilities; they must not be attributed to this engine. Classification follows the [supplied reference](../reference/problem-classification-reference.md).

## 2. Computable Problem

A plan `x` contains ordered film assignments, nonnegative gaps and a starting offset for each site/screen. The packing function rounds show starts upward to a five-minute grid and advances by film runtime plus 15-minute cleaning. Screen capacity and film runtime are fixed inputs. The main editor exchanges films in two selected sequence slots and adds an optional nonnegative five-minute-grid gap before the first slot. Every draft starts from the original reference, rather than accumulating edits to the current search result. Repacking accounts for the exchanged films' runtimes and all later screenings. An auxiliary test shifts one screen's offset. ILS can replace or exchange films, change gaps/offsets, insert/delete screenings or exchange films across sites.

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

The editor calls **the same `packAll → feasible → evalS/predict` functions as ILS**. Its `inspectSwap` preview leaves the applied plan and search evaluation count unchanged; `loadSwap` applies only a feasible plan and restarts search at seed 20260829. Choosing the same screening or the same film twice, or an invalid gap, returns an input error. Room eligibility, closing time, film coverage and per-site caps are still checked even though the exchange preserves chain film counts. An un-packable or infeasible plan has no valid score and cannot be applied. A previous valid heatmap/search result is not a result for an invalid preview. The applied best plan's **PASS/FAIL** indicator is derived from its actual feasibility check; it is not a hardcoded zero-violation counter or a count of all rejected search candidates.

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

Reset constructs the original reference by the declared uniform-response presolve. The visible main workflow requires a valid draft to be applied before searching; applying an exchange restarts ILS at seed **20260829** directly and uses that edited plan as the search baseline. Generate a local move, add a multi-move kick after more than 80 stalled iterations, reject infeasible candidates and accept a non-worse current score or a kick. Separately retain the strictly best feasible score; ties keep the existing best. Run 2,600 iterations. The original, applied and best records remain separate. The manual exchange preserves chain film counts, while later ILS may change counts within the hard rules. Speed changes animation time, not the declared search budget.

Provenance: the engine comes from **S13/SIM2 in the original desktop Response proposal**, latest source revision `285e698` (30 August 2026). SIM2 was introduced at `1ddfa6a` and moved into S13 at `862298a` on 29 August. A syntax-tree comparison between that original source and the archived English extraction verified equality of 12 core functions: `tw`, `rnd`, `ri`, `clone`, `packSite`, `packAll`, `feasible`, `predict`, `evalS`, `presolve`, `ruleBaseline`, `move`. The standalone page reuses this aggregate engine. The 1.4 editor adds schedule records and explanatory response factors around this preserved engine; the final 1.4 artifact passed 27 independent Node checks, including numerical-core equality, independently reconstructed response factors and constraints, three-way record consistency and exported-state copy isolation. These results were refreshed rather than inferred from release 1.3. The original display's hardcoded zero is replaced by a real best-plan feasibility indicator.

## 5. Demonstration & Evaluation

Open [Response Model Simulator](demo.html). The main workflow is **choose two screenings → compare the complete response → Apply this timetable → Run search / Finish search → inspect the three-way result**. The default exchange is intentionally a worsening edit: moving a film later can increase its time weight while nearby same-film competition lowers the complete schedule score. The [guide](demo-guide.md) gives the exact choices.

Select **First screening · receives the second film** and **Second screening · receives the first film**. The default original slots are **Site D / Screen 2 / Film A / 11:05** (`3-1-0`) and **Site D / Screen 3 / Film F / 20:15** (`3-2-4`), with **Additional gap before the first screening (minutes) = 0**. Preview shows affected-screen original/draft Gantts, all changed per-show predictions and the whole-plan score. The response table includes screenings whose own film and time stay unchanged but whose competition changes. **Why does the response change?** exposes input factors for the two exchanged slots. Row predictions round to one decimal; whole-plan scores round once, so displayed row changes need not sum exactly to the score change.

After **Apply this timetable**, the three-way summary retains **Original reference**, **Applied timetable** and **Best found by search**. Apply restarts the loaded-plan search at seed 20260829. **Run search**, **Pause** and **Finish search** share a 2,600-iteration budget. **Compare a site's three screens** selects applied/best Gantts and site response totals; the explanation distinguishes film-count changes from timing/screen changes. Changing a draft pauses search and disables search until the current feasible draft is applied. Reset restores the original reference and default draft; it does not apply the draft.

The final artifact is **547,694 bytes**, SHA256 `8acef83cb082b02f747920f65f8a1d3ed473fa597ed7bdc8a02cc22e3a8da5f7`. Verification on 11 October 2026 used two distinct methods:

- **Node:** all **27 checks passed on this exact HTML**. Rendering-only DOM stubs exercised the engine. The verifier compared 12 numerical core functions, independently reconstructed packing, constraints, response factors and per-show/full-plan totals, audited the original/applied/best records, rejected invalid loads without mutation, repeated seeded search and tested export copy isolation. These are numerical/state checks, not browser or direct-file evidence.
- **HTTP browser:** independent CUA review of the final SHA reloaded the default draft, applied it, finished search and repeated the same result, then reviewed responsive layouts. Actual JSON was downloaded and audited before the last CSS-only responsive fix, with the same JavaScript and record values. The fresh 1.4 review also exercised Run/Pause, the positive-gap case, room/input rejection and auxiliary boundary/failure; those checks preceded the last capacity-label and export-copy changes. At a 390-pixel viewport, final-build body width was 390, the comparison grid 324 and method dialog 352; desktop was restored and the default result repeated. Fresh staged-course review passed demo, guide, problem-definition and both proposal returns to the hub, plus course portal → Assignment 1 → Open worked examples. Direct offline opening remains unverified.

| Case / workflow | Inputs / steps | Executed result and evidence |
|---|---|---|
| Default worsening exchange | Default Site D pair above, gap 0 → preview → apply → finish | **5,134 → 4,969 → 5,302**. Edit **−165**; search **+333** over applied, **+168** over original. **1,711 calls**, **2,600 iterations**, **90 shows**, best-plan **PASS**. Exact-artifact Node and final-SHA HTTP repeats agree. Fresh HTTP Run/Pause stopped at iteration 1,035 before finishing. |
| Response explanation | Inspect Film A's original and exchanged inputs | Time weight **0.504 → 0.950**, but nearby same-film starts **0 → 2** give competition factor **1 → 0.72² = 0.5184**. The full exchange changes **10 per-show predictions** while preserving film counts. Independent factor/packing reconstruction passed in Node. |
| Optional small positive exchange | Site B / Screen 2 / A / 11:20 (`1-1-0`) ↔ Site B / Screen 3 / E / 14:05 (`1-2-1`), gap **5** → apply → finish | Fresh 1.4 HTTP result **5,134 → 5,141 → 5,180**, **1,757 calls**, 2,600 iterations; an earlier Node observation matched. Gap 0 is a different experiment: exact-artifact Node preview gives **5,148**. Do not substitute its score for gap 5. |
| Invalid/infeasible exchange | Invalid addresses, same slot/film, malformed gap or incompatible room | Exact-artifact Node checked **14 invalid exchange cases** through preview and load, plus a room-fit failure, with no accepted-plan mutation. Fresh HTTP rejected Film C on a 150-seat screen and retained prior best **5,302**; a blank gap was **INVALID** and retained prior best **5,180**. Apply/search disabled. |
| Exchange closing boundary | Default pair with additional gap **65**, then **70** | Exact-artifact Node found 65 valid: last end **24:38**, two minutes slack. Gap 70 was infeasible, had no score and could not load. This is a Node constraint audit, not another browser walkthrough. |
| Auxiliary closing boundary/failure | Open **Auxiliary checks · operating-hours boundary and rejection**, Boundary / **365 min**, Site D / Screen 1; then Failure / **370 min** | Node preview **5,099**, last end **24:36**, four minutes slack; loaded search **5,352**, **1,750 calls**, 2,600 iterations. Fresh 1.4 HTTP matched scores and rejected Failure 370 without attributing retained **5,352** to it. Node also rejected ten malformed shift inputs without mutation. |
| Replay and state isolation | Repeat identical default pair/gap/apply/search; attempt rejected loads and mutate returned exports | Fresh-VM and same-VM default replay matched; previews and rejected loads did not change the subsequent seeded result. Repeated finish/export was stable. Mutating returned fixture/log/comparison copies did not alter internal state or future search. Node evidence. |
| Actual export | Default pair → apply → finish → **Export results** | The actual HTTP download, before the final CSS-only responsive fix, contains separate original/applied/best records scored **5,134 / 4,969 / 5,302**, **90 rows each**, response factors, applied edit, preview, fixture/seed/source information and retained best showings. Independent Node audits reconstruct totals and constraints. |

**Keep starting modes and inputs common.** Every exchange is drafted from the original timetable. Apply restarts ILS at seed 20260829; Reset constructs the reference through presolve before any draft is applied. The former direct Reset-search result and the applied Normal-0 shift result are different entry paths and are not the main 1.4 workflow. Identical film choices with gap 0 and gap 5 also define different plans. Do not combine their scores or evaluation counts.

**Data & method** displays the equation, six films, six sites and six fictional purchases totaling **13 purchased tickets and five purchasing accounts**. Those purchases do not fit the evaluator. Heatmap and Gantt inspection remain available. Shift presets are collapsed auxiliary feasibility tests, not the main response experiment.

The [verification record](verification.json) separates Node evidence, HTTP observations, artifact identity and remaining checks. The actual downloaded JSON SHA256 is `939599e9946aace67590e1fd90c22736badc4c63be7050ecad813eaf43f50d82`. Direct offline file opening remains unverified. Course-prefix navigation and responsive measurements passed for 1.4. Current-source Speed 4× Run automatically completed the same 4,969→5,302 result with 1,711 calls/2,600 iterations; speed was restored to 1×. Site B comparison displayed 883.9→972.5 with +88.5 computed from unrounded values; the Site D heatmap drill matched. Course build and worked-examples/assignment checks passed separately. Historical release-1.3 passes are archived privately and are not inherited.

Functional evidence establishes valid-only application, rejected-preview non-mutation, deterministic fixture execution, three-way comparison and a calculated local improvement. It cannot establish response accuracy, causal identification, a global optimum, operational legality or real business benefit. For a learned evaluator, use exposure-aware held-out periods and agreed error/calibration metrics; for action evaluation, keep baseline/target/rules common, test misspecification and use a bounded prospective comparison.

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
| Use a whole-screen closing-time shift as the main Response demonstration | User review found that shift-only controls obscured the schedule-to-response mechanism. Inspected the new exchange wrapper: two existing screenings exchange films, downstream runtime effects are repacked and the same full-plan evaluator exposes changed predictions and factors. | Foreground the worsening default exchange, then apply/search and compare original/applied/best; retain shifts as auxiliary constraint tests. Refresh exact-build Node/HTTP evidence rather than carrying release-1.3 passes forward; the final artifact has 27 passing Node checks and a separately audited HTTP export. |

Source basis: the [assignment](../reference/assignment.md), [template](../reference/problem-definition-template.md), [classification reference](../reference/problem-classification-reference.md), original 44-slide Response proposal, original S13/SIM2 source and the archived English simulator. [Verification](verification.json) records source hashes and the function-comparison scope. An LLM response alone is not evidence of response accuracy, external facts or operational value.
