# Verification record — IE437 worked examples

Version 1.7 · Presentation revision · Synthetic classroom fixtures

There are two demo sites. Case A now provides the operator flow **Import planning data → Objective & constraints → Run optimization → Review results**, with the dark sidebar, light workspace and fixed action bar used by Case B. The old film exchange is a collapsed Results experiment. Both demo files remain byte-identical to the published 1.5 apps. The proposal files are revised for presentation flow; release 1.7 concentrates the brief-versus-case comparison on one separate page; each main/compatibility pair remains byte-identical. These examples execute different fictional evaluators, not measured business effects.

## Case A — executed operator-flow checks

The supplied planning package is the run's baseline. Its films, capacities, site/time factors, constraints and timetable are actually parsed and used. Configuration changes opening/closing, cleaning, coverage, per-site caps, reference response scale, iteration budget and seed; confirmation must still admit the uploaded timetable. **No optimization occurs before confirmation**, and no hidden uniform-response presolve replaces that uploaded reference. The engine API is `inspectDataset` / `loadDataset(package, {iterations, seed})`.

The public samples are [CinemaPlanning.json](response/CinemaPlanning.json) and [Screenings.csv](response/Screenings.csv). JSON contains the complete planning package. CSV requires exactly `showing_id,site_id,screen_id,film_id,start_time` and uses the active package, or the explicit classroom definitions. It replaces the complete timetable, not a subset of rows. Maximum input size is **2 MiB**; supported shape is **six films A–F, six sites A–F, three screens/site and 18–600 screening rows**, subject to operating, room-fit, cleaning, coverage and supply constraints, with all 18 screens used. Rich response inputs are declared assumptions, not fitted from uploaded purchase records.

The independent pure-parser test run passed **25 checks**. The separate final embedded-app Node verifier passed **39/39** on the exact 650,464-byte app (SHA-256 `77067435a531c809bc1e89f8a9b0bbf3b48dba09d5a7e2a6144fc283b1474d17`). Parser evidence covers JSON/CSV validation/canonicalization; the exact app suite covers the current numerical/engine behavior. Neither establishes a course-build pass or unexecuted browser checks.

The recorded HTTP sample run and final Node checks used default rules, **2,600 iterations**, seed **20260829**, and the loaded feasible sample. Its observed outputs were:

| Operator-flow measure | Recorded result |
|---|---:|
| Uploaded reference score | 4,969 |
| Retained best score | 5,247 |
| Gain from uploaded reference | +278 |
| Search iterations | 2,600 |
| Local response evaluations | 1,742 |
| Reference / best screenings | 90 / 89 |
| Best-plan feasibility | PASS |

The search can add/remove screenings within hard constraints; 90 → 89 is a genuine searched supply change. The default numerical results are confirmed by the exact final-build Node suite. The earlier configuration and invalid-file observations below preceded a final custom-ID metadata-only fix; the final Node suite confirms those contracts, and default recovery was replayed on the exact final app. Final exact-app pipeline, responsiveness, actual downloads and CSV reimport passed separately. **Do not reuse 1.4's 5,302 / 1,711 results:** reconstructing gaps from canonical uploaded start times changes the internal starting plan and random-search trajectory even though its reference score is 4,969. The reference is now the uploaded package, not the earlier presolved reference-plus-manual-edit entry path.

Actual browser downloads produced a **five-column CSV with 89 retained screening rows** and full results JSON with **90 input/reference rows, 89 best rows, confirmed settings and per-show factors**. The audited best prediction sum was reported as **5,246.789**, rounding to the displayed **5,247**. The downloaded CSV parsed successfully through the actual Node importer and was then reimported through the final browser app: **89 reference rows and baseline score 5,247**, with validation passed. **Save planning inputs** creates a reusable input JSON; a results JSON is an audit record, not automatically a valid input package. Fresh downloads were then obtained from the exact final app. The full results JSON audit passed (SHA-256 `248759acff3a39dc05e90f0b42c1ab4de4f8a61b9668804f7daa2fa2f7ad3179`), retaining 90 input rows, 89 best rows, settings and factors. The final CSV had the same five-column, 89-row content, and actual exact-final-browser reimport returned **5,247 / PASS**. Earlier configuration/error observations retain their stated metadata-only boundary; export verification no longer relies on that earlier candidate.

Additional real-control observations:

| Actual UI action | Observed result / scope |
|---|---|
| JSON file upload | 90 reference rows; default score **4,969** |
| Search budget 100, seed 7, scale 130 | Best **5,126**, **63 response evaluations** |
| CSV upload with active reference scale 104 | Reference **3,975**; the CSV intentionally inherited the current package's scale |
| Scale 104 with budget 100 and seed 7 | Best **4,101** |
| Closing changed to 23:00 | Existing rows rejected under the tighter window; previous-results navigation invalidated |
| CSV row 2 with unknown film X | Import rejected, Next disabled, previous valid dataset retained |
| Recovery by Load classroom sample and default confirm/run | Reference **4,969** → best **5,247**, 1,742 evaluations, 2,600 iterations, 89 best rows |

CSV does not reset response assumptions: **3,975** at scale 104 is not a parsing error or the scale-130 baseline. Changing data/rules requires renewed confirmation, rather than reusing an earlier score. No invalid import or setting produced a new valid result.

| Required new-flow check | Completed evidence | Remaining scope |
|---|---|---|
| JSON/CSV validation and upload | Independent parser 25 passed; real files uploaded and used; final-browser 89-row optimized CSV reimport scored 5,247 | Broader custom-ID browser upload/download cases are not claimed |
| Review/configure/confirm | Real scale/seed/budget changes altered results; closing-time rejection invalidated old-results navigation | Broader untested setting combinations are not claimed |
| Default optimize/repeat | Final exact app Node 39/39; exact browser reload → default Run/Pause at iteration 1,605 → Finish: 5,247 / 1,742 evaluations / 2,600 iterations / 89 rows / PASS | Same fixed input/settings/seed scope |
| Failure/recovery | Unknown film X row 2 rejected with Next disabled/data retained; closing-time rejection; sample recovery observed | Remaining boundary combinations are not exhaustively tested |
| Export/reimport | Fresh exact-final JSON audit: 90 inputs/89 best/factors/settings; five-column 89-row CSV downloaded and actual final-browser reimport scored 5,247/PASS | Current sample and declared planning context |
| Responsive/course integration | Final app at 390 pixels: Import/Results body 390, method dialog 356; desktop restored. 29-file assembly/staging/build/tests and course navigation passed | Offline direct-file opening is not verified |

See [the Case A guide](response/demo-guide.html) and [per-case verification](response/verification.json) for the authoritative final API/results when recorded. The response formula is explicitly assumed and the search is ILS; neither a learned model nor BO nor global optimality is established. No individual consumers are created.

## Case B — executed latest M0 checks

Case B's HTML is byte-identical to the previously checked English movie-first build (SHA-256 `8a2823a577059361d284542c42aafbd12b2a22022517f8dd335a5909dfabb08f`). That app and its embedded Worker completed the full population → movie registration → objective → baseline → improvement → response-change workflow over local HTTP.

Inputs were **2,000 computational profiles**, estimated frequency with declaration unchecked, **Admissions**, one initial forecast path, default operating constraints and **Movies.csv** containing Stellar Voyage and Quiet Afternoon. The inline **Load classroom sample** action uses the original file importer. Both films have release windows January 1–5, 2027, with the end date excluded; the configured horizon remains the full year. The app displayed mean frequency **10.84 visits/year** and calibration time **23.4 seconds** in this run. Timing is an observation on this environment, not a performance benchmark.

| Baseline measure | Observed result |
|---|---:|
| Schedule-independent potential viewings | 757 |
| Potential: Stellar Voyage / Quiet Afternoon | 348 / 409 |
| Realized baseline viewings | 726 |
| Realized: Stellar Voyage / Quiet Afternoon | 332 / 394 |
| Baseline showings | 241 |

The results selector switched from potential to realized baseline. Selecting Stellar Voyage and January 3 displayed **107 people** on path 0. Opening P00205 from the potential Quiet Afternoon list displayed **10 completed synthetic historical watches** and **zero earlier visits in that simulation path**. All labels and explanatory text in these views were English.

Schedule improvement searched paths **100–103** and compared the schedules on the separate common validation paths **200–219**. It completed one round with 24 candidate evaluations. The validation panel gave **767.30 admissions for both schedules**, paired gain **0.00** and a 95% Monte Carlo interval **[0.00, 0.00]**, with **Uncertain gain · Baseline schedule retained**. This comparison is separate from the initial path-0 baseline of 726; their headline values must not be subtracted to claim improvement.

A shock on **January 3, 2027**, affecting **Stellar Voyage** with intensity multiplier **0.2**, completed the three-state comparison on 20 common validation paths with the same fixed synthetic history.

| Comparison state | Viewings, displayed | Ticket revenue, DEMO units |
|---|---:|---:|
| Before the shock | 741.5 | 10,381.00 |
| Existing schedule after the shock | 619.6 | 8,675.10 |
| Re-programmed schedule after the shock | 620.4 | 8,684.90 |

The paired replanning gain was **0.70 admissions**, with interval **[0.30, 1.10]** and **Recommend the improved schedule**. Search completed two rounds with 48 candidate evaluations. Use the paired statistic rather than subtracting rounded table values. This is conditional simulation evidence, not calibrated real-market forecast accuracy or a causal effect.

The multiplier **6** disabled the run action. The valid boundary **0** enabled it; numerical evaluation at zero was not run. The tested numerical shock used **0.2**. The sample contains no confirmed bookings; preservation of real bookings was not tested. [The English demo guide](audience/demo-guide.html) explains the experiments and units.

## Presentations, navigation and package

The revised proposals retain **44 Response sections** and **59 Audience sections** and their original visual systems, with byte-identical main/compatibility pairs. Case A slide 03 restores the two-column operating structure. Classroom provenance/audit notices that interrupted the solution narrative are moved into presenter notes and each case’s Markdown appendix. Modeling assumptions, operating constraints, backtesting and decision evaluation remain in the relevant slides. Both apps retain their published 1.5 bytes.

The hub and reading views retain course portal styling. Case A's new operator shell matches Case B's dark sidebar/light workspace/fixed action bar. The public allowlist contains **31 files**, including the Response planning assets and the shared comparison page/Markdown. [manifest.json](manifest.json) identifies delivered checksums; [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) preserves 11 library notices and three font families. Private archives, grading notes, student work and customer records are excluded.

**Release 1.5 exact-app Node verification passed 39/39, alongside the independent parser's 25 passes and the scoped live upload/configuration/export observations above. Final exact-build browser Run–Pause–Finish, responsive Import/Results review and actual CSV reimport passed. The 29-file assembler, approved installer/site build, `node tests/worked-examples.mjs` and `node tests/assignments.mjs` passed on the staged assembly, including archive/publication-boundary checks.** These are fresh 1.5 results; older passes are not substituted. These checks preceded publication. The same release was subsequently deployed to GitHub Pages (commit `7c183a9`, successful workflow run `38187603308`). Public checks confirmed both direct MD downloads, both proposal/guide/definition pages, all 29 ZIP files and both complete default demo workflows.

Fresh course-prefix CUA ran the exact staged app through the complete pipeline: **4,969 → 5,247 / 1,742 evaluations / 2,600 iterations / 89 retained screenings / PASS**. Its home link returned to the hub. The Response guide and original proposal also returned to the hub. Course portal reached Assignment 1, and Open worked examples reopened the hub. The refreshed hub showed the new **Import** workflow copy.

## Remaining checks and limits

- **Direct-from-disk offline browser execution:** not run. Embedded assets alone do not establish this requirement.
- **Case B public default-workflow repeat (release 1.5):** completed with 2,000 profiles and two classroom films: 757 potential / 726 baseline realized viewings / 241 showings. Frequency calibration reported 120.5 seconds. Improvement/shock runs retain their earlier stated scopes.
- **Real-world validation:** no learned response accuracy, causal effects, real reservations, calibrated market uncertainty or production readiness is established. M1 remains future work.
- **Strategy comparison:** distinct fixtures, horizons and units prevent numerical ranking of the approaches.

These instructor-authorized examples use synthetic data and follow the public assignment brief.

## Presentation flow in release 1.7

The main slides develop the operating problem, the model and the proposed decision process. Case A starts from forecasting and timetable programming, examines why programming changes response, and develops constrained optimization and an operating loop. Case B starts from individual movie intent, connects choices and competition to demand and capacity, then develops schedule evaluation and replanning. Presenter notes and the appended Markdown guidance retain the assumptions and evidence that the original generic notice slides carried. Short labels still identify illustrative inputs, prepared values and proposed components.

The separate [one-page comparison](classroom-comparison.html) consolidates the brief-versus-case data and assumption differences. Main slides focus on the solution and operator process. This is a presentation/documentation revision. It does not add learning, BO, M1, measured customer effects or new demo algorithms. Checksums and slide identities identify the delivered deck revisions; the numerical and public execution evidence above applies to unchanged app bytes.
