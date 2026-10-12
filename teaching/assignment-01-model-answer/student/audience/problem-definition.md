# Synthetic Audience: Movie-First Cinema Programming

[One-page comparison of the course brief, case data and assumptions](../classroom-comparison.html).

**HW1 sample answer · English · Annual-sample revision 1.8 · 2026-10-11**

Author / student ID: Public teaching sample; `N/A — not a student submission`.  
LLM use: OpenAI Codex assistant, 2026-10-11, for source inspection, scope review, English drafting, translation and functional-check design. The exact deployed model identifier was not recorded.

This worked example connects this definition, the latest Movie First M0 application in [demo.html](demo.html), and the original-design [proposal.html](proposal.html): 45 main slides plus 14 appendix/Q&A slides, with its diagrams and animations retained. The full presentation is the primary proposal; [extended-proposal.html](extended-proposal.html) is an alternate copy of the same deck. The presentation follows planning → audience model → demand → accessible choices → schedule experiments → operating decisions. Prepared illustrations and broader development plans are documented in the presentation-context appendix below, separate from the M0 calculations described here. The application uses fictional people, histories, movies, rules and DEMO money. It does not reconstruct real attendees from purchase accounts or establish real business improvement. Earlier seven-day applications and their measured outputs are outside this example.

## 1. Decision, Scope & Problem Structure

> A cinema programming manager uses information available at a stated cutoff, movie release windows and explicit operating assumptions to choose a feasible screening schedule, in order to increase simulated admissions or ticket revenue relative to an agreed baseline; after a later change in movie response, the manager may revise future screenings while preserving the confirmed past and bookings.

**D1 — Choose a fixed schedule from current information.** M0 starts with audience profiles and movie metadata, predicts schedule-independent potential viewings, constructs a feasible baseline, evaluates its actual times and seats, and searches nearby schedules. The manager inspects the comparison before recommending a candidate. The generated baseline is a synthetic demand-coverage heuristic; current real operator practice is `TBD`. Forecasting supports the decision rather than constituting a separate operational decision.

The configured interval is **2027-01-01 through exclusive 2028-01-01**, or 365 service days. The supplied [Movies.csv](Movies.csv) restores the existing annual simulator's **24 distinct fictional movie IDs**, with two new movies each month. Each monthly pair shares a release window, so every service day has two active, competing films. January's films end exclusively on February 1; December's end exclusively on January 1, 2028. The two preference templates are science fiction and drama; the controlled fixture uses 110-minute runtimes, all-age ratings and standard format. The CSV can be edited to test other catalogs. Importing movies does not change the annual horizon; the current UI has no separate horizon editor.

Use **2,000 computational profiles and one initial forecast path** for the classroom example. The local seat market always contains **10,000 distinct synthetic people**. Profiles describe input types, not the number of attendees. One local person consumes one seat per admitted visit. Multiple annual visits are possible, so viewings are not unique visitors.

**D2 — Revise after a movie-response change.** A hypothetical intensity change becomes effective on a selected date. The extension fixes the original baseline path's simulated records before that date, protects corresponding past screenings, preserves any known confirmed future reservations, and searches eligible future schedules. The terminal decision is a revision for the remaining period. This is one supplied observation/revision cycle, not a validated continuous controller. Its fixed past is explicitly synthetic, not newly observed customer data.

| Property | D1 | D2 extension | Basis |
|---|---|---|---|
| Decision Structure | Flat: choose one complete schedule | A standalone revision is Flat. The combined D1 → D2 graph is Hierarchical: D1 supplies D2's reference schedule and protected past. | Directional decision dependency, not the sequence of computational modules |
| State Structure | Stateless within the one-shot decision boundary | Stateful: existing schedule, history, date and bookings constrain the next schedule | Commitments link revision epochs; simulated person dynamics do not alone make D1 Stateful |
| Information Structure | Open-loop: choose the fixed plan from currently available inputs | Feedback: a later response signal changes a subsequent revision | A design choice here; deployment needs a real observation and trigger policy |

Approval rights, actual planning interval, current baseline and revision triggers remain `TBD`. Exclusions include production integration, inferred real identities, nationwide seat multiplication, learned M1 graph models, guaranteed uplift and proven global optimization. Classification follows the supplied [structure reference](../reference/problem-classification-reference.md); manual versus automatic execution is separate from classification.

## 2. Computable Problem

### Variables, inputs and outputs

Let candidate slot `k` identify a movie, service date, theater, screen, start time and format. Choose `z_k ∈ {0,1}` to include it. The selected records form schedule `x`. Slots use known movies inside their release windows, supported screen formats and the 30-minute enumeration grid. Capacities, runtimes and price rules are inputs. The local search edits, adds or removes nearby records; it does not enumerate every possible schedule.

Inputs are known movie metadata/features and release windows; synthetic preferences, availability, viewing frequency, budgets and historical observations; theaters/screens/capacities/formats; annual horizon/cutoff; operating rules; confirmed bookings; and fixed population/draw seeds. Outputs are reference potential viewings, a feasible baseline, seat-constrained admissions and ticket revenue, a candidate with paired comparison, and optional three-state shock/replanning results. Failed construction or invalid input is not a valid evaluated plan.

### Objective and components

For common evaluation paths `P`, choose one of:

`J_A(x) = mean_{p∈P} admissions(x,p)`

`J_R(x) = mean_{p∈P} ticketMinor(x,p)`.

The UI's edit penalty is **zero** for both objectives. Ticket revenue sums simulated paid ticket amounts and excludes operating costs, concessions and profit. Displayed revenue is `ticketMinor / 100` in **DEMO units**. Default price is 1,400 minor units, or 14.00 DEMO units. These are fictional units, not real currency. Admissions are visit events, not tickets or unique purchasers inferred from the teaching records.

| ID | Decision | Role | Model | Calculation |
|---|---|---|---|---|
| C1 | D1/D2 | Cost: estimate admissions/revenue | Simulation | Shared preference rules, availability, recovery since the last visit, no-choice option and keyed draws produce film/site/time choices; seat allocation produces admissions. |
| C2 | D1/D2 | Cost: maximize selected `J` | Formulation | Average admissions or ticket minor units over the common paths, with zero UI edit penalty. |
| C3 | D1/D2 | Constraint | Formulation | Known IDs/cutoff, release dates, formats, hours, runtime/cleaning separation, capacities, sourced requirements and protected records. |
| C4 | D1/D2 evaluator | State-transition inside the evaluator | Simulation | A visit updates the person's seen films, last-visit time and remaining budget; the operational D1 decision is still one-shot. |
| C5 | D2 | State-transition between decisions | Formulation | Retain confirmed prefix/bookings, apply the new response condition, and make the selected revision the next plan. |

A shared model supplies genre/style match and available interest, awareness and rating evidence. It is not one LLM per person. M0 uses explicit coefficients and genre-rule feature defaults rather than training a graph predictor. Positive movie intensity combines preference, calibrated frequency, release-day weight, recovery, access and any shock multiplier. Intensities define competing movie choices plus no visit. Equivalent access groups and remaining seats affect choices; an extra showing does not create another independent population.

Frequency calibration fits each profile's intercept in a **fixed synthetic reference environment with a neutral new movie each day**, known access rules and separate calibration-validation draws. It aims to match a declared or synthetically estimated annual reference frequency. It does not force that many visits to the uploaded catalog or calibrate against real attendance. Unattainable or unresolved calibration is reported as a failure.

### Restrictions and recovery

- `[ASSUMPTION]` Hours are 09:00–24:30, cleaning is 20 minutes, and enumerated starts use a 30-minute grid. A film must finish by closing. For consecutive screenings, `next start ≥ previous start + runtime + cleaning`. The validator does not require the final cleaning interval itself to end by closing.
- `[ASSUMPTION]` Capacity is a positive integer. Local draws use the 10,000-person pool; national weights are not seat multipliers. Each person has at most one visit per service day, does not rewatch a film, and must satisfy availability and any supplied budget.
- Only evidence available by the forecast cutoff enters observable preference/observation inputs. Here metadata are known on 2027-01-01. Unavailable future evidence is not an observed feature.
- Default sourced quota/rights requirements and additional locked-screening policies are empty. Real obligations need a source. M0 does **not** automatically impose the earlier application's 24/48-hour protection rules.
- Replanning freezes screenings and simulated records **before** its effective date and preserves confirmed bookings/payments. This fixture starts with no reservations; zero preserved bookings does not test nonempty reservation handling.
- Invalid import, rules or calibration must explain the issue without presenting a new result as valid. Correct, confirm and re-run. Input changes clear prior results; changing shock controls leaves the previous comparison unchanged until execution.

## 3. Information & Uncertainty

The teaching brief supplies a record specification, not an actual dataset. Its fields are `title_tag`, `venue_tag`, `play_day`, `curtain_time`, `account_tag`, `passes_bought`. One row is one completed purchase for one screening; date/time identify its scheduled start, not purchase creation. See the [client brief](../reference/assignment.md#2-client-brief-and-available-information).

A purchaser buying three tickets does not identify three attendees or their personal histories. Totals do not establish unique visitors, check-ins, preferences, unpurchased alternatives or another schedule's counterfactual outcome. Individual histories, tastes, availability and budgets in this app are richer **synthetic assumptions**, not facts derived from those six fields. Purchaser histories must not be copied to every companion as observations.

### Small fictional observation-unit audit

These invented rows illustrate the specification; they do not fit the app's profiles.

| title_tag | venue_tag | play_day | curtain_time | account_tag | passes_bought |
|---|---|---|---|---|---:|
| F-A | V-01 | 2027-02-10 | 10:00 | AC-01 | 3 |
| F-B | V-01 | 2027-02-10 | 15:00 | AC-02 | 1 |
| F-C | V-02 | 2027-02-10 | 19:00 | AC-03 | 2 |
| F-A | V-01 | 2027-02-11 | 10:00 | AC-01 | 1 |
| F-B | V-01 | 2027-02-11 | 15:00 | AC-04 | 2 |

The check is **5 purchases, 9 paid tickets and 4 distinct purchasing accounts**. AC-01 has two purchases/four tickets; neither four attendees nor one person's four admissions follows. Actual admissions, unique attendees, purchase times and zero-sale screening records are unknown.

| Information / status | Purpose | Provider and priority | Fallback |
|---|---|---|---|
| Six-field specification supplied; records/coverage `TBD` | Observation-unit, duplicates, missingness and temporal audit | Data owner; first | Fictional records; no real accuracy claim |
| Full showings including zero-sale screenings and historical schedule versions: `TBD` | Exposure denominator, baseline and action variation | Scheduling/data owner; high | Purchase summaries; defer action-response identification |
| Runtimes, capacities, formats, operating rules, rights and commitments: `TBD` | Feasible set and protected changes | Operations owner; high | Fixture rules only; no operational recommendation |
| Prices/refunds, purchase/change times, admissions/check-ins and costs: `TBD` | Outcome unit, leakage prevention, revenue versus profit | Data/finance owner; high for those targets | Ticket summaries; simulated admissions separately; defer profit |
| Aggregated availability, party composition and choice reasons: `TBD` | Purchaser–attendee ambiguity and behavioral inputs | Research owner; conditional, consented evidence | Purchasing accounts as units; compare plausible latent worlds |
| Movie metadata/features: supplied synthetically; real provenance `TBD` | Cold-start preference and competition | Content/modeling owner; high | Transparent genre defaults; distinguish reviewed/automatic features |
| Real response changes and cutoffs: `TBD` | D2 observation/trigger without future leakage | Operations/data owner; high for D2 | Labeled hypothetical intensity shock |

The annual CSV supplies genre/runtime/rating/format/date fields, a fictional synopsis and explicit preference-feature values from the existing sample workbook. Director and cast remain empty. The science-fiction and drama templates have different feature values; the month-specific IDs represent distinct fictional films, not repeat screenings of one movie. These are declared metadata-rule features, not AI interpretations or validated tastes. Profile IDs such as `U00002` and person IDs such as `P00010` identify different synthetic units; several people can share one profile's input history.

Separate **Monte Carlo variation**, **behavioral assumption error** and **missing real information**. A fixed seed makes replay checkable, not certain. The paired interval estimates simulation variation, not real forecast error, calibrated market uncertainty or causal uplift. Compare multiple attendance/group worlds compatible with the purchase totals and vary preferences, frequency, budgets and rules. Request evidence where it could change rankings or invalidate the feasible set.

## 4. Alternatives & Selected Approach

| Approach | Mechanism | Reason to retain or choose it | Main limitation |
|---|---|---|---|
| B0: fixed plan / demand-then-allocate rule | Keep a feasible reference, or greedily pack forecast cohorts, then evaluate | Cheap, reproducible reference. M0 constructs this baseline; real operator practice is `TBD`. | Coverage proxy is not final attendance and can miss substitution |
| A1: response evaluator plus search | Context and proposed schedule → expected outcome, optionally followed by BO | Direct action scoring if variation, exposure and identification suffice | Six purchase fields alone do not identify effects; BO needs its own posterior/acquisition/update loop |
| A2: synthetic audience choice and seats — selected | Profiles → intensity → potential demand → feasible schedule → choices/seats | M0 executes this mechanism and exposes films, dates and synthetic individual histories | People and coefficients are assumptions without real validation |

Hold audience, known evidence/cutoff, reference calibration, person pool, initial state, objective, constraints and paths common when comparing schedules. Changing profile settings produces a new fixture, not a same-population A/B test.

The baseline allocator enumerates feasible slots and greedily increases **covered cohort mass**, a capacity/time-access proxy. It stops when no positive proxy gain remains and validates its plan. A `not found` construction is not proof that every schedule is infeasible. Final admissions come from simulation of the returned plan, not the packing proxy.

Improvement is **bounded local search, not BO**: shift times ±30 minutes, substitute movie/format, swap films between same-day screenings, remove a screening, or add one on another screen at the same theater. Reject invalid candidates; evaluate at most 24 valid candidates per round and fully evaluate up to two finalists; stop after eight rounds or a round with no gain. For ordinary improvement, the coarse pass uses path 100 and the full local person pool; fuller search uses **100–103**. Replanning uses all four search paths for both ranking and finalist evaluation. Best means best among candidates explored, not a global optimum.

Compare the selected candidate and baseline on **20 unused paths, 200–219**, with matching input/reference/person-pool/initial-state hashes and common random conditions. For `d_p = J(candidate,p) − J(baseline,p)`, report its mean and paired 95% Monte Carlo interval. Recommend the candidate only if the lower endpoint is strictly positive; otherwise retain the baseline. Its timeline is inspectable even when not recommended. Unused paths address selection within the simulator, not independent real-world validation.

## 5. Demonstration & Evaluation

### Reproduce the actual M0 workflow

Open [demo.html](demo.html). Its UI, fictional inputs and calculation code are embedded. Direct offline execution is a required delivery check whose status is recorded separately below. No API key or customer data is involved.

1. Keep **Computational profiles** at **2,000** and **Initial movie list** at **Empty list · enter movies manually**. Leave **Declare annual viewing frequency** unchecked, then select **Prepare synthetic audience**. This uses the fixture's synthetic frequency estimates; current annual-sample observations are recorded below. An optional separate experiment may declare 10; that is a reference mean, not a quota for the uploaded catalog, and must not be mixed with the default run.
2. Select **Next: Register movies**, then **Load annual sample · 24 films**. This passes the existing annual sample's 24-film CSV through the existing importer as a file named `Movies.csv`; it does not supply mocked results. Alternatively, use **Download sample CSV** or the supplied [Movies.csv](Movies.csv) and upload it, preserving the exact filename. The importer uses its basename as the sheet name and expects `Movies`. Confirm 24 registered films/no error. A differently named file is not interchangeable even with identical columns.
3. Select **Next: Objective & constraints**. Keep **Admissions**, **1 path · exploratory simulation**, opening 540, closing 1470, cleaning 20 and price 1400. Leave **Run local improvement and separate 20-path validation after the baseline schedule** unchecked. Select **Confirm settings**, then **Start simulation**.
4. Actual stages are reference-frequency calibration → potential demand → baseline construction → choice/seat evaluation → results. Inspect potential viewings, baseline realized viewings, showings and path count. The annual sample has active movies on every date; uploading a sparse catalog can leave dates empty.
5. In **Displayed result**, inspect potential and baseline realized modes. Click a film title/bar, choose a date, and click a person ID. Charts average the result's paths; the person list is one sample path. Search/page through people; distinguish known synthetic completed watches from earlier predicted visits in that path. Close the dialog to continue.
6. In **Next task from these results**, choose **Find a better candidate from the baseline schedule**, then **Start schedule improvement** in the bottom bar. Inspect search trace, paired 20-path comparison and recommendation. Do not subtract an initial one-path KPI from a 20-path candidate to claim gain.
7. Choose **Compare re-programming after a response change**. Set **Shock effective date** to `2027-02-15`, **February · Stellar Voyage** (`OWN-02-A`), and **Movie intensity multiplier** to **0.2**. The selected movie is active February 1–28, with exclusive end date March 1. Select **Apply shock & start re-programming**. Inspect all three states and preservation identifiers.

The multiplier changes intensity: 0 removes fresh intensity, 1 leaves it unchanged, 2 doubles it. A value of 0.2 does not promise 80% fewer admissions. Every run starts from the original baseline; shocks do not accumulate. Confirmed future bookings stay protected. All three states use common 20-path evaluation and a fixed synthetic prefix. **Shock effect = after-shock same plan − before shock. Revision effect = after-shock revised plan − after-shock same plan.** These are whole-period results conditional on the common past.

### Presentation and persistence

Use [proposal.html](proposal.html) for the original full presentation. Arrow keys navigate; **S** switches compact/full main paths, **A** opens appendix, **Q** opens Q&A, **N** opens notes, **F** toggles full screen and **P** prints. **All worked examples** beside the slide counter returns to the index. Prepared slides are broader concept illustrations, not computed outputs of this run.

**Save inputs & rules** and **Download reproducibility manifest** preserve input/rules/path settings. Browser-local restore uses a separate Movie First store; it does not migrate old predictions or resume an interrupted computation checkpoint. Cancellation retains input; replay recalculates from the beginning with the same settings/paths. Altering input invalidates old results.

### Annual-sample verification — release 1.8

The 24-film CSV restores the `Movies` catalog from the existing annual simulator's sample workbook. Its 12 monthly pairs cover all 365 service days of 2027. Metadata are declared known at `2027-01-01T00:00+09:00`, matching the annual forecast cutoff. English titles and the fictional synopsis replace the sample's display text; the movie IDs, release dates, runtime, rating, format and feature values preserve its controlled workload.

**Current annual-sample baseline: completed through the actual English app over local HTTP.** The checked HTML SHA-256 is `d43c00a19489882c6e3ba082c8f6debd79c0ffcddc48c160be35e13b656997ea`. The run used 2,000 profiles, synthetic estimated frequency with displayed mean 10.84 viewings/year, Admissions, one initial path and default operating rules. The former two-film baseline and response-change numbers are preserved in the historical appendix; they are not outputs of this annual catalog.

| Current annual-sample measure | Observation |
|---|---|
| Movies registered | 24 |
| Monthly timeline / date eligibility | Source catalog covers January–December; forecast completed all 365 days, allocation completed and evaluation advanced through December 27 before finishing |
| Population and initial path count | 2,000 profiles, 10,000 local people, 1 path |
| Reference-frequency calibration | 130.6 seconds; displayed mean 10.84 viewings/year |
| Schedule-independent potential viewings | 9,576 |
| Baseline realized viewings / showings | 5,536 / 7,467 |
| Film/date/person drilldowns | Baseline December · Our Day: 234 visits; December 2: 27 people / 23 showings. P00094 (U00018): 25 completed synthetic input watches, zero earlier visits in this simulated path |
| Schedule improvement / shock replanning | Not run for this annual catalog; separate 20-path comparisons |

The complete observed annual run took approximately **419 seconds** on the checked environment. This is a functional-run observation, not a formal performance benchmark. Potential and realized viewings describe different choice environments; their difference alone is not a causal effect or an optimization gain. Schedule-improvement and response-change comparisons have not been run on this annual catalog.

### Normal, boundary and failure checks

Start independent cases fresh with the stated annual fixture. These are actual M0 controls; the old seven-day 10:30/09:00/08:30 editor examples do not apply.

| Case | Input / steps | Expected source-backed behavior | Current annual-sample observation |
|---|---|---|---|
| Normal | Valid `Movies.csv`, default estimated frequency, admissions/one path; execute baseline | Register 24 films; calculate annual potential demand and seat-constrained baseline | Local HTTP run completed: 9,576 potential viewings, 5,536 realized viewings and 7,467 showings |
| Shock/replan extension | From that baseline: Feb 15 / OWN-02-A / multiplier 0.2; execute | Report three comparable states under the same fixed past/bookings | Not run for the annual catalog |
| Boundary | Baseline → Feb 15 / OWN-02-A / multiplier **0**, an allowed endpoint | Accept 0; executed case removes fresh movie intensity after the date while preserving past/bookings | Not run for the annual catalog; historical two-film control observation is separate |
| Failure | Multiplier **6**, or empty, with otherwise valid shock inputs | Disable execution; previous comparison retains its original conditions. Restore 0–5 and execute for a new result. | Not run for the annual catalog; historical two-film control observation is separate |
| Import failure / recovery | Upload supplied file renamed `WrongName.csv`; then unchanged `Movies.csv` | Explain invalid input; no valid new evaluated plan from rejection; valid import gives a runnable 24-film fixture | Not run — pending UI/engine observation |
| Repeatability | Fresh reload, identical profile/declaration/CSV/rules/paths; repeat baseline/comparison | Matching provenance and deterministic outputs for the same browser/runtime and execution sequence | Not run — pending repeated current-build observation |

For model evaluation, use a held-out period/cutoff and target-matched error/calibration metrics. For action evaluation, compare with the agreed baseline under the same eligible information/feasible set; report objective, admissions, tickets/revenue, changes, violations and preserved commitments together. Vary plausible behavioral worlds and rules. Replay is not independent causal evidence; a prospective operational comparison is a later gate.

## 6. Client Proposal

Build a shared audience model and connect it to constrained schedule experiments. Begin with an agreed reference forecast and schedule, movies and releases, audience profiles, complete screening supply and operating rules. The data owner establishes semantics and cutoff; the operations owner provides capacities, controllable variables and commitments; the modeling owner defines admissions or ticket revenue and a common comparison. The result should let an operator prepare inputs, set rules, run candidates and inspect consequences.

The first deliverable is a reproducible shadow comparison: current practice versus a feasible candidate, with hard-rule audits, held-out predictive checks and sensitivity to latent worlds. Agree practical-value, error, calibration and stability thresholds after measuring the baseline and before a trial. Require zero hard violations and preserved reservations. M0 demonstrates comparison mechanics, not deployment readiness or commercial benefit.

**Proceed** when information is adequate and agreed gates pass. **Revise** when rankings depend strongly on plausible worlds, calibration is unresolved or workload is impractical. **Stop or narrow scope** when the target is unsupported, critical exposure/constraint information is absent, commitments fail or a controlled comparison does not justify adoption. Shadow work precedes a live pilot. Pilot unit/duration/sample size, cost and benefit are `TBD`, to estimate from variance, workload and operations after the audit. Revenue is not profit without costs.

The original full proposal presents the wider concept. Prepared scores, diagrams and future learning plans do not replace M0's source-backed mechanism and verified observations. The next decision is to approve a bounded prototype comparison with assigned data, operations and modeling roles. Estimate effort, cost and practical value from that scope; operational adoption follows the measured comparison and preserved commitments.

## 7. LLM Review & Key Revisions

These are actual review decisions during this sample's preparation, not an invented student's discussion history. Students must document their own checks.

| Suggestion / framing | Independent check | Assessment | Final use |
|---|---|---|---|
| Use the earlier seven-day editor as the audience example | Compared routes, latest checklist, 2026-09-18 development reports and M0 Worker/UI flow | Earlier controls, objective and shock values do not describe latest M0 | Promote the existing Movie First app; rewrite seven sections; preserve original proposal design and distinguish prepared illustrations |
| Make the annual simulator representative of a full teaching year | Inspected the existing annual sample workbook and preserved its 24 IDs, monthly release windows and feature values | Two new films each month; two competing films on all 365 days; metadata known at the annual cutoff | Restore its English CSV through the existing importer; use current annual results, keep earlier two-film checks historical |
| Carry over penalized revenue, BO and 48-hour freezing | Checked `objectiveNow`, `scorePlan`, `improvePlan`, `validateImprovement`, `executeReplanWorkflow`, `replanAt` and default rules | M0 selects admissions/ticket revenue with zero edit penalty, bounded search, four search paths, 20 paired unused paths and synthetic-prefix preservation | State exact mechanism/units; distinguish simulator validation from field evidence; keep unexecuted checks `Not run` |

Source basis: the [HW1 brief](../reference/assignment.md), [seven-section template](../reference/problem-definition-template.md), [classification reference](../reference/problem-classification-reference.md), [Movies.csv](Movies.csv), and reviewed functions above. Development README/checklist/source establish implementation scope, not observation of this public build. The purchase-unit audit independently checks why accounts cannot establish personal attendee histories.


## Appendix — Historical release 1.7 two-film verification

The following executed checks belong to the former `Movies.csv` containing **Stellar Voyage** and **Quiet Afternoon**, active January 1–4, 2027. Their app SHA-256 is stated below. They establish the earlier importer/calculation/detail/control workflow within that fixture; they are **not the release 1.8 annual catalog's numerical results or performance measurements**. Keep them separate when evaluating the 24-film run in Section 5.

### Historical two-film baseline

On **2026-10-11**, the English Movie First app retained through release 1.7 was exercised through CUA in the Codex in-app browser, served through an HTTP preview. The run used **2,000 profiles**, default synthetic estimated frequency with displayed mean **10.84 viewings/year**, the two imported `Movies.csv` films, **Admissions**, and **one path**. The local person pool was 10,000. The configured horizon was the full 2027 year; both films' active intervals ended at exclusive January 5.

| Observed result | Value | Interpretation |
|---|---:|---|
| Reference-frequency calibration time | 23.4 s | One observed run on the current host, not a performance guarantee |
| Local potential viewings | 757 | Reference-environment result, not booked or allocated screenings |
| Quiet Afternoon potential viewings | 409 | Film B; part of the same local reference total |
| Stellar Voyage potential viewings | 348 | Film A; part of the same local reference total |
| Baseline realized viewings | 726 | Choices under generated screenings and seat constraints |
| Stellar Voyage baseline realized viewings | 332 | Film A under the same baseline path |
| Quiet Afternoon baseline realized viewings | 394 | Film B under the same baseline path |
| Baseline showings | 241 | Generated schedule records, not attendees |
| Initial forecast/evaluation paths | 1 | Exploratory path, not a 20-path validation estimate |

The film totals match their respective totals: potential `409 + 348 = 757`; realized `332 + 394 = 726`. Potential and realized values describe different environments; their difference alone is not a causal estimate, pure capacity shortfall or a policy improvement. The 10.84 reference frequency does not force every person to visit that many times in this two-film catalog. This baseline demonstrates the import, calibration, demand, allocation and evaluation pipeline under declared synthetic assumptions. It does not validate real consumer behavior or establish that a searched candidate improves it.

Film/date exploration was also exercised: selecting **Stellar Voyage / January 3** in the baseline result showed **107 synthetic people**. In the earlier **potential Quiet Afternoon** result, opening **P00205** showed **10 completed synthetic historical watches** and **0 earlier visits in that simulation**. These are separate inspected selections, not an assertion that P00205 belongs to the 107-person baseline list. They establish that film/date and person-history drilldowns operate; they do not validate real identities or observed customer histories.

### Historical two-film schedule-improvement comparison

The historical two-film English build completed ordinary local search and the paired unused-path comparison under the same inputs. Search used **100–103** and validation used **200–219**.

| Observed comparison output | Value |
|---|---:|
| Baseline mean admissions on 20 validation paths | 767.30 |
| Candidate mean admissions on those same paths | 767.30 |
| Paired candidate-minus-baseline mean | 0.00 |
| Paired 95% Monte Carlo interval | [0.00, 0.00] |
| Search rounds / candidate evaluations | 1 / 24 |
| Recommendation | Uncertain gain · Baseline schedule retained |

No improvement was established in this search. The zero paired interval describes this comparison under the synthetic evaluator; it does not prove that real forecast error or all possible schedule gains are zero. The retained baseline's **767.30** is a 20-path mean, whereas **726** above is the initial one-path realization. Their difference is not an optimization gain. Best-among-searched and no-gain conclusions do not establish global optimality.

### Historical two-film response shock and replanning

The next task applied **2027-01-03 / Stellar Voyage / intensity multiplier 0.2**. All three states used **20 common validation paths**, conditional on the same confirmed synthetic history before January 3.

| Observed conditional state | Displayed mean viewings | Ticket revenue, DEMO units |
|---|---:|---:|
| Before shock, existing schedule | 741.5 | 10,381.00 |
| After shock, existing schedule | 619.6 | 8,675.10 |
| After shock, re-programmed schedule | 620.4 | 8,684.90 |

The authoritative paired revision gain was **0.70 admissions**, with **95% Monte Carlo interval [0.30, 1.10]** and **Recommend the improved schedule**. Search reported **2 rounds / 48 candidate evaluations**. The displayed means have one decimal place: subtracting 620.4 − 619.6 gives 0.8, which must not replace the paired **unrounded** gain of 0.70. The ticket-revenue difference is 9.80 DEMO units; neither figure is real field benefit.

The before-shock **741.5** uses a fixed synthetic history prefix and therefore has a different evaluation context from the earlier unrestricted **767.30** comparison. Do not mix those baselines or interpret their difference as the response shock. The recorded shock comparison separates the new intensity condition from the additional future schedule change. Exact preservation-hash values were not separately transcribed in this record. The fixture's empty bookings do not test preservation of a nonempty real reservation ledger.

The observed English application file's SHA256 was `8a2823a577059361d284542c42aafbd12b2a22022517f8dd335a5909dfabb08f`. These are historical two-film HTTP functional observations; direct offline execution and the repeatability/import-failure checks remain unexecuted where stated.

Record actual baseline/candidate values, paired interval, recommendation and hashes from the comparison panel, then all three shock values and preservation identifiers. A valid change need not change an aggregate; report what happens. Do not import measurements from an earlier app or label unexecuted expectations as observations.

Latest source implementation evidence is dated **2026-09-18**: film/person detail and the baseline-allocation stall fix were implemented and tested. Development reports do not themselves verify the corresponding two-film packaged English build. Overall M0 gates remain incomplete: formal repeated 10k/25k performance, independent-world statistics, M1 learning and real customer/business validation are not established. The baseline above is a historical two-film HTTP observation; other checks for that fixture remain `Not run` where indicated. Direct offline opening is **`Not run` in this verification session**; update only from an actual run.


## Appendix — Presentation context and presenter notes

The proposal retains the original visual system, diagrams and controls: **59 sections**, including **35 slides in the compact main path**. The MD explains scope and source limitations without inserting an administrative review between the business question and the solution. Press **N** in the proposal for the corresponding presenter note. A short **synthetic example** or **proposed extension** label remains beside numerical illustrations and future-model diagrams.

### Suggested presentation flow

- **S01–S04A:** planning horizons and a movie-feature reference forecast; why viewer behavior adds information.
- **S05–S15:** individual memory and preferences, daily joint movie choices, aggregation, market calibration and forecast uncertainty.
- **S16–S17:** time-cutoff backtesting and target-matched accuracy, calibration and usefulness measures.
- **S17A–S23:** desire versus accessible showtimes, choice among movie/site/time/no movie, before/after effects and constrained schedule search.
- **S25–S29:** revision of eligible future screenings, the integration options, development sequence, hypotheses and model inputs.
- **S30–S37:** privacy-aware data design, deliverables, operator workflow and end-to-end capabilities. **S32 links directly to the runnable M0 demo.**
- **A1–A13:** technical comparison, representations, calibration, backtesting, constraints, current M0/proposed M1 and formulation detail.

### Guidance moved out of the slide narrative

These entries preserve the distinctions that matter for evaluating the sample. They are attached to the same slide IDs in presenter notes; they are not a second presentation track.

| Slide(s) | Context, assumptions and evidence handling |
|---|---|
| **S03, Q&A** | Annual Aug–Sep planning, a 50–60-film portfolio and the pre-release horizons are declared case assumptions, not observed company practice. Confirm the actual decision window, current plan, approval rights and revision trigger for a real operator. |
| **S04, A1** | The top-down feature forecast is the reference comparator. The assignment does not establish that a company uses the pictured workflow; 5.0M is a prepared example. |
| **S04A** | The 300–600-film and 400,000+ viewer–movie sizes are illustrative. Viewer/movie repeats are dependent observations; extra records do not by themselves prove smaller uncertainty or better accuracy. Compare on later movies and time periods. |
| **S05, S09, S13, S14** | The 4.7M totals are prepared, weighted market examples. They are not local M0 admissions. The current M0 seat market is 10,000 distinct people, and national population weights are never seat multipliers. Real market expansion needs coverage/competitor calibration. |
| **S07, S08, S29** | Linked attendee history, companions, ratings, clicks and complete exposure/supply are proposed input types. Purchase accounts/ticket counts do not establish individual attendee histories. Inspect observation units, linkage, cutoff and coverage. Feedback is optional and may have response/incentive bias. Frequency from suitable history differs from a declared synthetic fallback. |
| **S09A** | The small four-week sampling widget illustrates one daily joint draw and repeated paths. It is distinct from the annual M0 application, its local person pool and its search/validation paths. |
| **S10, S15, A2** | Prior/posterior curves and 90% intervals are stored synthetic illustrations. M0 does not fit them or establish real coverage. Additional signals do not guarantee narrower uncertainty. Set target-matched forecast and interval criteria for actual comparison. |
| **S11A, S18, A3, A12** | The live M0 uses explicit taste/content/frequency rules, not trained encoders or GRU graph history. Learned M1 is proposed. Compare M1, M0 and a learned non-graph baseline under the same held-out target and information cutoff before adopting complexity. |
| **S12, S13, A12** | Prepared “evidence” lists and attention/connections are model references, not causal proof. Test contribution by removing signals and recalculating; forecasts and decompositions do not establish intervention effects. |
| **S17B, S19, S21, S22** | Desire, utility, choice and attendance values are prepared examples. The 31,420/34,180 attendance and 410M/448M example-unit revenue in S22 are stored A/B values, not a new simulation, actual currency or business improvement. Actual M0 observations appear in Section 5 above. |
| **S18B, A11** | The source deck's 2026-09-17 movie-first “engine pending” statement is a historical snapshot. The current packaged Movie First M0 is executable. Its execution does not establish learned M1, real-user calibration, independent-world validation or live benefit. |
| **S18C** | The four English diagrams summarize the earlier V2 prototype, rather than screenshots or results from current M0. Its 200-film workload, 107,359 visits, 9,996 visitors, 0.56% visit probability and 24h/48h freezing belong to the earlier visit-hazard→conditional-choice generation. |
| **S23, A9** | S23 animates six stored mock scores; the storyboard itself does not run an optimizer. M0 executes bounded local search, with zero UI edit penalty and separate evaluation paths. “Best” means best explored, not a guaranteed global optimum. Ticket revenue excludes costs and is not profit. |
| **S24, S25** | Integration and booked-showtime diagrams are proposed operating mechanisms. M0 offers one hypothetical shock/revision cycle, fixes a synthetic past and preserves supplied commitments. Default empty bookings do not test a nonempty real ledger or a continuous feedback controller. |
| **S27, S31–S33** | Cost, duration, commercial licensing, serving/retraining and operating approvals require a scoped real comparison. Original 2–3/12–16/1–2/10–16-week calendar and fee choices are not justified promises in this teaching example. S27 now presents implementation order; S32 hands off to the live experiment; S33 shows operator inputs versus simulator outputs. |
| **S30, A8** | Pseudonyms, limited purposes, minimum retention and controlled access are proposed design principles. Real records require applicable policies, permissions and responsible data roles; this package supplies no permission to process personal data. |
| **S34, S11A, A12** | The source proposal references *Learning Multivariate Hawkes Process via Graph Recurrent Neural Network* (KDD 2023) and *Attention is not Explanation* (NAACL 2019). Its cited financial-services workload is research background, not cinema accuracy or M0 performance evidence. |
| **S37** | The conclusion is the reusable decision mechanism: profiles → demand → accessible choices → feasible schedules → experiment. Synthetic comparisons demonstrate that mechanism and do not establish field benefit. |
| **A13** | Desire and schedule accessibility are not automatically identifiable from purchases. Declare travel, price, availability and supply interpretation, and use common conditions for comparisons. The source's internal reporting field was `supplyAdjustedAssumption`. The equations describe a proposed model family; the actual M0 functions and paths are specified above. |

### Archived earlier-generation figures (S18C / former A11)

The following figures were reported in the original V2 source deck. They are retained here for source traceability, **not as measurements of the current deployed M0 build** and not as real customer/business validation. A11 now compares the current M0 mechanism with proposed extensions.

| Archived V2 item | Source-deck report | Scope |
|---|---|---|
| Development workload | 2,000 profiles; 10,000 viewers; 200 movies; 32,850 screenings; 365 days | Fixed synthetic performance workload, not market size |
| Representative path | 107,359 visits; 9,996 / 10,000 people with a visit | Source hash family `ed896fe0`; 0 competitor visits and 0 seat-shortage failures reported |
| Runtime | 88.66s → 17.03s | Source reported matched input/result hash, not a fresh current-build timing |
| Statistical checks | 100 calibration + 100 evaluation + 100 null + 100 misspecified worlds | Source reported pass within synthetic scope; not transferred to M0 |
| UI/replay | Edit movie → annual run → viewer detail → manifest replay | Source reported Chromium execution with 0 console errors/external requests |
| Readiness flags | `annualReleaseReady=false`, `realWorldValidated=false` | Historical source flags, not a current release decision |

Current annual-sample outputs and unexecuted checks are recorded in Section 5. Historical two-film observations have their own appendix. Release 1.8 restores the existing annual catalog; it does not introduce a new simulation algorithm.
