# Synthetic Audience: A Seven-Day Cinema Programming Problem

**HW1 sample answer · English · 2026-10-11**

Author / student ID: Public teaching sample; `N/A — not a student submission`.  
LLM use: OpenAI Codex assistant, 2026-10-11, for source inspection, scope review, English drafting and functional-check design. The exact deployed model identifier was not recorded.

This independently explained sample connects `problem-definition.md`, the executable `demo.html`, and the original-design 59-slide `proposal.html` (45 main slides and 14 appendix/Q&A slides). This full presentation is the primary proposal; its diagrams and animations are retained. `extended-proposal.html` carries the same full deck as an alternate copy. The demo packages an existing synthetic audience application. Its people, histories, movies, prices, signals and outcomes are fictional. It neither reconstructs real attendees from purchase accounts nor demonstrates real business improvement. Prepared numerical illustrations in the presentation use explicitly synthetic units; those illustrations and newer annual-model plans are outside the primary seven-day application's tested scope.

## 1. Decision, Scope & Problem Structure

> A cinema programming manager uses information available before a seven-day screening window, an agreed schedule baseline and explicit operating assumptions to choose a feasible plan, in order to improve the declared revenue-based schedule objective while respecting capacity and commitments; later, the manager may revise eligible future screenings after a new booking signal.

**D1 — Choose a fixed seven-day plan.** In the implemented example, each showing has a fixed theater/screen. Its film, start time and supported format may change. The operator can inspect a showing, apply an edit, re-simulate the plan, run a reference optimizer and decide whether to apply its candidate. The application starts with a deliberately weak synthetic challenger schedule; it is not a verified account of a real operator's practice. Real planning intervals, current practice, rights and commitments are `TBD`.

**D2 — Choose a revision after a new signal.** This extension's boundary includes the existing plan before observation, a new synthetic booking signal at a later clock time, and the subsequent revision. It preserves protected showings and synthetic confirmed reservations while searching eligible future changes. The three reported states separate the signal change from the schedule change. The initial state is the existing plan and commitments; the terminal state is the approved revision for the remaining seven-day window. The demo supplies one observation/revision cycle, not a validated continuous operational controller.

| Property | D1 | D2 extension | Basis |
|---|---|---|---|
| Decision Structure | Flat: one complete plan | A standalone revision is Flat. The combined D1 → D2 graph is Hierarchical because D1 changes D2's reference plan and allowed changes. | Actual decision dependency, not the order of prediction and simulation modules |
| State Structure | Stateless within the one-shot decision boundary | Stateful: existing plan, clock and confirmed reservations constrain the next plan | Retained commitments link revision epochs; a solver iteration is not an operational state |
| Information Structure | Open-loop: chosen using currently available information | Feedback: the newly available signal changes the subsequent revision | A genuine later observation would be required in deployment; the demo supplies a labeled synthetic shock |

The manager approves changes. D1's Open-loop boundary and D2's manual synthetic-shock demonstration are design choices for this sample; the brief does not establish an operator's trigger or automation policy. Theater construction, production integration, real attendee identification, learned graph models, annual optimization and guaranteed uplift are excluded. A profile estimator or forecast supports the decision; it is not itself a schedule decision. Histories inside the simulator do not alone change D1's classification. Classification follows the supplied [structure reference](../reference/problem-classification-reference.md).

## 2. Computable Problem

### Variables, inputs and outputs

For each showing `s`, choose `x_s = (m_s, t_s, f_s)`: film ID, integer start time in minutes, and compatible format. Its theater, screen and capacity are fixed inputs in this UI. The initial plan has 630 showings. A changed format also selects the fixture's associated ticket price. Let `x0` be the starting plan and `c(x,x0)` count changed, added or removed showing records. The implemented search changes existing showing fields; it does not promise to explore every possible cinema schedule.

Inputs are the movie catalog and runtimes; screen capacities/formats; the seven-day window; synthetic observed profile histories and declared preferences; information cutoff; reference supply; operating rules; current clock; fixed seed; and any synthetic confirmed reservations. Output is a valid plan, simulated admissions, revenue units, occupancy, unmet capacity demand and a comparison with the baseline. A stale or invalid plan is not a new evaluated result.

### Objective and components

The packaged application's reference optimizer uses its **revenue objective**, rather than maximizing admissions alone:

`J(x) = R(x) − 0.2 × U(x) × 14 − 2 × c(x,x0)`.

`R` is synthetic ticket plus concession revenue, `U` is unmet capacity demand in simulated people, and the two penalty coefficients are `[ASSUMPTION]` fixture settings. Ticket prices are synthetic units; standard format is 14 units. Concession revenue is `admissions × 0.35 × 6`. These are neither KRW nor profit. Admissions are a separately reported simulated outcome; they are not sold tickets inferred from the six teaching fields. A business objective and real cost/penalty coefficients remain `TBD`.

| ID | Decision | Role | Model | Calculation |
|---|---|---|---|---|
| C1 | D1/D2 | Cost: report admissions and unmet demand | Simulation | The same 10,000 local synthetic people choose a showing or outside option; seats are allocated and full showings trigger reselection or exit. One local particle represents one person and one seat. |
| C2 | D1/D2 | Cost: maximize `J` | Formulation | Sum simulated ticket/concession revenue and subtract unmet-demand and change penalties as stated above. |
| C3 | D1/D2 | Constraint | Formulation | Valid film/screen IDs, supported format, operating window, runtime plus cleaning, non-overlap and unchanged protected reference showings. |
| C4 | D1/D2 | Constraint | Formulation | No allocation above physical capacity; no duplicate committed person; a confirmed reservation must refer to an existing showing and uses a seat before fresh allocation. |
| C5 | D2 | State-transition | Formulation | Retain protected plan records and commitments; update visible signal and clock; the selected eligible revision becomes the next plan. |

A shared model estimates synthetic observable profiles and film propensities; it is not one LLM per person. Theater/time/format/price utility modifies movie probabilities relative to a fixed reference supply, including an outside option. Equivalent showings are grouped so duplicate alternatives do not automatically create proportional movie demand. Full evaluation performs keyed random choice and seat allocation. The coefficients and generated histories are assumptions, not a fitted response model validated on real purchasers. Supporting estimates do not make every evaluation component Data-driven.

### Explicit restrictions and failure handling

- `[ASSUMPTION]` Local operating hours are 09:00–24:30, with 20 minutes of cleaning. Each showing must start within the window and finish, including cleaning, by closing. Consecutive screenings on a screen must satisfy `next start ≥ previous start + runtime + 20`.
- `[ASSUMPTION]` The seven-day local population is 10,000 and each person watches at most once during that period. Nationwide weighted demand, if explored, is a separate output and is not multiplied into local seats.
- `[ASSUMPTION]` Under revision, showings less than 24 hours ahead are Frozen, 24–48 hours are Limited, and only showings at least 48 hours ahead are Editable. This implementation rejects changes to both Frozen and Limited showings. These are demo policies, not established operator rules.
- An invalid edit can exist as a draft, but `Re-simulate` must reject it and explain the violation. Restore a valid time/film/format and re-run, or regenerate the original fixture. Previously displayed KPIs must not be interpreted as results for the invalid draft.

## 3. Information & Uncertainty

The teaching brief supplies a record specification, not an actual dataset. The six fields are `title_tag`, `venue_tag`, `play_day`, `curtain_time`, `account_tag`, `passes_bought`. One row is one completed purchase for one screening. Date/time are the scheduled screening start, not purchase creation. [Source: Client Brief and Available Information](../reference/assignment.md#2-client-brief-and-available-information).

A purchaser paying for three tickets does not identify three attendees or their histories. Purchase totals cannot establish unique visitors, check-ins, latent personal preferences, no-purchase opportunities or the counterfactual outcome of another schedule. The demo's individual histories and preferences are explicitly richer synthetic assumptions; they are not derived from the teaching records. Purchaser histories must not be copied to every companion as observed facts.

### Small fictional purchase-audit fixture

These five entirely invented records use the teaching specification. They illustrate the observation-unit audit; they are not the dataset used to fit the application's richer synthetic profiles. All aliases, dates and values in this table are fictional.

| title_tag | venue_tag | play_day | curtain_time | account_tag | passes_bought |
|---|---|---|---|---|---:|
| F-A | V-01 | 2027-02-10 | 10:00 | AC-01 | 3 |
| F-B | V-01 | 2027-02-10 | 15:00 | AC-02 | 1 |
| F-C | V-02 | 2027-02-10 | 19:00 | AC-03 | 2 |
| F-A | V-01 | 2027-02-11 | 10:00 | AC-01 | 1 |
| F-B | V-01 | 2027-02-11 | 15:00 | AC-04 | 2 |

The check is **5 purchases, 9 paid tickets and 4 distinct purchasing accounts**. AC-01 has two purchases and four paid tickets; neither four attendees nor one person's four admissions follows from those records. Actual unique attendees and admissions are unknown. No record of an unpurchased screening or purchase creation time is present. A richer simulator can be explored only with separately declared assumptions and input information.

| Information / status | Purpose | Provider and priority | Fallback |
|---|---|---|---|
| Six-field purchase specification: supplied; actual data/coverage `TBD` | Define the observed unit, duplicates, missingness and coverage | Data owner; first audit | Use labeled fictional purchases; make no real accuracy claim |
| Full showings, including zero-sale screenings: `TBD` | Exposure denominator and alternative schedules | Scheduling/data owner; high | Restrict to observed purchase summaries; defer action-response claims |
| Capacity, runtime, format, opening/cleaning, rights and commitments: `TBD` | Feasible set and protected changes | Operations owner; high | Use the declared fixture rules only; no operational recommendation |
| Purchase/change times, schedule versions and information cutoff: `TBD` | Prevent leakage; study why historical schedules were chosen | Data owner; high | Prospectively log versions; use conservative assumptions, not causal conclusions |
| Prices/refunds, admissions/check-ins and operating costs: `TBD` | Choose tickets versus actual admissions, revenue or profit | Finance/data owner; high if that target is chosen | Keep ticket summaries; report synthetic admissions/revenue separately; defer profit |
| Party composition, aggregate availability and choice reasons: `TBD` | Test purchaser–attendee ambiguity and latent choices | Research owner; conditional, aggregated consented feedback | Treat accounts as purchasing units; compare several plausible latent worlds |
| Movie content and market weighting evidence: `TBD` | Cold start and any market scaling | Content/research owner; conditional | Explicit simple content/weight assumptions; no unsupported nationwide inference |

Uncertainty has three sources: simulation randomness, uncertain behavioral assumptions, and missing real information. A fixed seed aids reproducibility but does not remove uncertainty. Compare several preference/group compositions compatible with the same observed purchase totals and test whether schedule rankings change. Additional survey or exposure evidence should be requested where it could change the recommendation. No calibrated real-world prediction interval is established by this sample.

## 4. Alternatives & Selected Approach

| Approach | Mechanism | Why retain or choose it | Main limitation |
|---|---|---|---|
| B0: declared fixed plan or demand-then-allocate rule | Evaluate the unchanged feasible plan using the same simulator and context | Cheap, auditable reference. Current real operator policy is `TBD`. | Fixed demand can miss substitution and outside choices |
| A1: learned response evaluator | Context and proposed schedule → expected outcome, followed by search | Directly scores scheduling actions if historical variation and identification are adequate | Six purchase fields alone do not identify action effects; correlation is not causality |
| A2: synthetic audience choice and seats — selected for this demo | Assumed individual states → schedule-accessible choices → seat allocation → aggregate outcomes | Makes substitution, outside options and capacity inspectable; the supplied app executes this mechanism | Latent composition and coefficients are not verified real-person behavior |

The demo demonstrates A2's operation, not its superior real forecasting accuracy. Hold population, histories, cutoff, fixed reference supply, seed/draw protocol, objective and feasibility rules common when comparing plans. Changing profile mode creates a new fixture, so it is not a same-population A/B comparison.

The reference optimizer is bounded heuristic search, **not BO**: up to eight rounds, at most 24 candidate mutations per round; reject invalid candidates; rank valid candidates using a 2,000-particle fast expected evaluator; give missing-film coverage candidates priority among finalists; fully evaluate up to two distinct finalists per round on the local population; choose the higher objective, with deterministic plan-hash tie-breaking for equal scores. Source logic was checked in `scheduleMutations`, `optimizeSchedule` and `scheduleObjectiveValue`. The returned plan is not a proven global optimum. BO would require its own posterior/acquisition/evaluation/update loop and justified evaluation budget; it is optional and not needed to meet HW1.

## 5. Demonstration & Evaluation

### Reproduce the actual application

Open `demo.html` directly after extraction. The packaged browser app needs no server, installation, login, API key or internet. Use its English navigation and controls:

Schedule Studio demonstrates D1 and components C1–C4; Dynamic Re-programming demonstrates D2 and components C1–C5. This maps the executed calculations to the definition rather than treating navigation pages as additional decisions.

1. Keep the default 10,000-profile fixture and fixed seed 20260913. Start or **Generate Audience**; wait for the ready state.
2. Inspect **Movie Forecast** and **Choice Simulation** to distinguish film propensity from the choice of a showing or outside option. Personal histories are synthetic observations.
3. In **Schedule Studio**, inspect the evaluated starting plan. Click a showing, change its movie/format/start time, choose **Apply edit**, then **Re-simulate**. Inspect stale/error status as well as the new KPIs.
4. Choose **Run Reference Optimizer**. Inspect the baseline, candidate objective, actual evaluated-plan hash and progress; **Apply optimized plan** evaluates the selected plan.
5. In **Dynamic Re-programming**, choose **Apply Shock & Re-program**. Compare Before shock, After shock · same plan, and After re-programming. This supplied shock increases one film's booking velocity by 35% and reduces another's by 20%, clipped to the signal range. It is not a probability multiplier or real booking observation. Inspect preserved commitments before applying the revision.

### Presentation navigation

Open `proposal.html` for the original full presentation. Arrow keys move through its current presentation path; **S** switches between the compact path and full main deck, **A** opens the appendix, **Q** opens Q&A, **N** opens presenter notes, **F** toggles full screen, and **P** prints the slides. The permanent **All worked examples** link beside the original slide counter returns to the package index. This presentation illustrates the broader audience concept; the application's measured seven-day results are recorded below. `extended-proposal.html` provides the same full presentation, rather than a separate shorter proposal.

### Recorded packaged-app results

Checked on 2026-10-11 in the Codex in-app browser through CUA, served from an HTTP preview of this public package. The final main app received a subsequent neutral heading-only change (“CURRENT CANDIDATE”); engine calculations were unchanged. Direct offline opening was `Not run` in this browser verification session. The packaged file contains its application and worker code; no remote data or API is needed.

| Evaluated state | Admissions | Rounded revenue units | Occupancy | Unmet demand | Plan hash / interpretation |
|---|---:|---:|---:|---:|---|
| Fresh default, 10,000 profiles, 630 showings | 5,229 | 97,013 | 4.4% | 0 | `901ea84a` — observed starting fixture |
| Normal edit: first showing 10:30 | 5,229 | 97,013 | 4.4% | 0 | `25526c16` — valid changed plan; repeated in the final build with matching KPIs/hash |
| Opening-time boundary: first showing 09:00 | 5,229 | 97,013 | Not separately recorded | Not separately recorded | `351e986f` — valid boundary plan |
| Recovered first showing to 10:00 | 5,229 | 97,013 | Not separately recorded | Not separately recorded | `58c8bfe4` — plan revision metadata differ from a fresh baseline |
| Reference optimizer applied to the recovered plan | 6,418 | 116,476 | 5.4% | 0 | Reported objective gain **19,030.9**; the same recovered plan was this search's baseline |

The search panel displayed baseline revenue 97,013 and candidate revenue 116,476. The objective gain differs from the revenue difference because it includes change/unmet-demand penalties and uses unrounded values. A synthetic search improvement does not establish real field benefit, a global optimum, or independent predictive validation. The unchanged normal/boundary KPIs show that a valid input change need not change the simulated aggregate. 

### Recorded booking-shock and revision extension

This run followed the applied reference-optimizer plan. Dynamic Re-programming advances the clock and constructs synthetic commitments; therefore its **Before shock** baseline differs from Schedule Studio's 6,418 admissions. Compare only the three states under this dynamic context.

| Dynamic state | Admissions | Rounded revenue units | Unmet demand | Plan hash |
|---|---:|---:|---:|---|
| Before shock | 6,421 | 116,550 | 0 | `2c568918` |
| After shock · same plan | 6,422 | 116,566 | 0 | `2c568918` |
| After re-programming | 6,433 | 117,329 | 0 | `f37678b3` |

Observed through the same HTTP workflow: **1,471 synthetic confirmed reservations preserved; 210 Frozen/Limited showings protected**. The affected booking-velocity signals were 88% → 100% after the +35% shock (clipped), and 70% → 56% after the −20% shock. The first two states isolate the supplied signal change on the same plan; the last comparison shows the additional schedule change under that shocked context. These are simulated outcomes with declared assumptions, not measured customer demand or a real deployment result.

The packaged app's final neutral-heading build was statically checked after these observations; its engine was unchanged. SHA256: `a4e54561d61f9f058a69b2531996419afa288ab9d558c8a1a328af4282c99004`.

### Normal, boundary and failure cases in the real schedule editor

Start each case from a newly generated default fixture. Its first opening-day showing is at 10:00. Keep its film, screen and format unchanged. These cases invoke the same engine validator and evaluator used by the proposal; they are not a separate arithmetic toy.

| Case | Input / steps | Expected behavior | Recorded observation |
|---|---|---|---|
| Normal | First showing: **+30 min** once → 10:30; **Apply edit → Re-simulate** | Mark draft stale, then evaluate the valid plan and update KPIs/hash | Observed: valid evaluation, 5,229 admissions / 97,013 rounded revenue units; hash `25526c16`. The changed plan has unchanged aggregate KPIs. |
| Boundary | Fresh fixture: **−30 min** twice → 09:00; apply and re-simulate | Accept the exact opening-time boundary; no overlap or turnaround violation | Observed: accepted, 5,229 admissions / 97,013 rounded revenue units; hash `351e986f`. |
| Failure | Fresh fixture: **−30 min** three times → 08:30; apply and re-simulate | Reject with an operating-window violation; no valid KPI claimed for the draft. Restore 10:00 and re-evaluate. | Observed in the HTTP browser preview, 2026-10-11: “Showing falls outside 09:00–24:30”, `STALE` / “Recalculation required”, optimizer disabled. Draft rejected; displayed previous KPIs are not a valid result for 08:30. Recovery to 10:00 was observed: 5,229 / 97,013; hash `58c8bfe4`. The full-plan hash includes revision metadata, so it need not return to the fresh hash. |
| Reproducibility | Reload Overview → generate default 10,000-profile fixture → Schedule Studio → first showing **+30 min** once → 10:30 → apply and re-simulate | Same within the same browser/runtime, input/seed and edit sequence; compare evaluated hash and KPIs | Observed again on the final packaged build: baseline 5,229 / 97,013, hash `901ea84a`; edited plan 5,229 / 97,013, 4.4% occupancy, zero unmet demand, hash `25526c16`. The original and repeated edit sequences match. |

Only applied edits enter evaluation. Format options are restricted to the screen's supported formats. Invalid schedule, frozen/limited edits, duplicate commitments and seat violations are engine failure contracts; the three UI cases above provide a minimal executable check, not complete production coverage. A recorded pass confirms the fixture behavior, not forecasting accuracy.

For model evaluation, use a held-out screening period and common baselines at a stated information cutoff, with error/calibration metrics matched to the target. For action evaluation, report objective, admissions, occupancy, unmet demand, penalties and hard violations together. Simulation replay under an assumed evaluator is not independent causal evidence. Sensitivity, misspecified worlds and a bounded prospective comparison are needed before adoption.

## 6. Client Proposal

Request a bounded data and operational-rule audit first. The data owner confirms record semantics, coverage and temporal availability. The operations owner confirms controllable variables, constraints, baseline and approval rights. A modeling owner chooses the outcome unit, checks assumptions and designs the comparison; no customer identity reconstruction is required.

Proceed to a leakage-safe historical comparison only when the feasible set, outcome and cutoff are defensible. Agree acceptance thresholds after measuring the current baseline. Require zero hard violations and preserved confirmed reservations; select error, calibration, stability and practical-value thresholds before a trial. Use shadow recommendations before any controlled live pilot. The pilot's unit, duration and sample size depend on observed variance and operational constraints, so they are `TBD` with an estimation plan.

**Proceed** if information is adequate, calculations are reproducible and the agreed held-out/operational gates pass. **Revise** if rankings are sensitive to plausible latent worlds or calibration fails. **Stop or narrow scope** if critical data are unavailable, the target cannot be supported, constraints fail, or a controlled comparison does not justify implementation. Revenue is not profit without costs. Cost, timeline and expected benefit are `TBD` until the audit supplies a defensible scope and estimates. The next requested decision is authorization of that audit and appointment of its data/operations owners.

## 7. LLM Review & Key Revisions

These are three actual review decisions made while preparing this sample with an LLM assistant. They do not invent a student's discussion history; students must document their own important discussions and checks.

| Suggestion / initial framing | Independent check | Assessment | Final use |
|---|---|---|---|
| Treat the audience presentation's animated search as the executed mechanism | Inspected the six prepared scores in the slide storyboard and the separate legacy app's actual evaluator, search and seat-allocation source | Prepared slide values do not prove optimizer execution | Use the real seven-day app as the primary executable demo; keep the original full presentation as the primary proposal and label its prepared storyboard separately |
| Describe the optimizer as maximizing admissions or as BO | Checked Worker objective='revenue' and `scheduleObjectiveValue`; inspected bounded mutations/fast/full evaluation, with no posterior/acquisition update | Admissions are a KPI; the actual default objective is penalized synthetic revenue and the search is heuristic | State the exact objective and bounded reference search; remove global-optimum and BO implementation claims |
| Infer every attendee's history from purchasing accounts | Checked the brief's one-purchase row, purchaser account and ticket count against the demo's richer synthetic profiles | Purchaser and attendees are different observational units | Separate supplied fields from assumptions, request exposure/party evidence, and test multiple plausible worlds |

Source basis: the published [HW1 brief and demonstration requirements](../reference/assignment.md), the required [seven-section template](../reference/problem-definition-template.md), and the packaged application's reviewed functions `validateSchedule`, `freezeState`, `choiceCore`, `evaluateScheduleDetailed`, `scheduleObjectiveValue`, `optimizeSchedule` and `runDynamicReprogramming`. The formulas, explicit assumptions, reproduction steps and observed-versus-unexecuted results above make the chosen scope checkable without requiring the original development repository.
