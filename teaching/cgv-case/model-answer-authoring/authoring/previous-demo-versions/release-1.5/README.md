# IE437 Assignment 1 — Two worked examples

Version 1.5 · English proposals, operator workflows and guides

Open `index.html`. Each case has a Markdown/HTML problem definition, one interactive demo, an English guide and its original anonymized English proposal. The **44-slide Response** and **59-slide Synthetic Audience** presentations retain their designs and are unchanged from 1.4. Each `extended-proposal.html` is a byte-identical compatibility copy.

| Case | Proposal | Selected demo | Instructions |
|---|---|---|---|
| A: Aggregate response and scheduling | [Original 44-slide proposal](response/proposal.html) | [Response planning app](response/demo.html) | [English guide](response/demo-guide.html) |
| B: Individual synthetic audience | [Original 59-slide proposal](audience/proposal.html) | [Movie-first M0 app](audience/demo.html) | [English guide](audience/demo-guide.html) |

Editable definitions: [Case A](response/problem-definition.md) and [Case B](audience/problem-definition.md). The app and definition reading views link back through **All worked examples**.

## Case A classroom route

The Response app now follows the operator sequence **Import data → Objective & constraints → Run optimization → Review results**, using a dark sidebar, light workspace and fixed action bar like Case B.

1. Select **Load classroom sample**, or upload [CinemaPlanning.json](response/CinemaPlanning.json). This complete package supplies films, screens, declared response assumptions, rules and the current reference timetable. [Screenings.csv](response/Screenings.csv) replaces only the timetable using the currently loaded package, or explicit classroom definitions when none is loaded. Both samples can be downloaded inside the app.
2. Select **Review data & rules**. Inspect imported film/site/screen counts, showing IDs, runtimes, capacities, response factors and timetable validation. Keep opening **10:00**, closing **24:40**, cleaning **15**, minimum sites per film **2**, maximum shows per film/site **5**, response scale **130**, **2,600 iterations** and seed **20260829** for the recorded sample. Select **Confirm settings**. The uploaded schedule is the baseline; no hidden presolve replaces it.
3. Select **Run optimization**. Pause/resume if needed, or finish the remaining budget, then select **View results**. The recorded sample run, also checked by the final Node suite, gave **4,969 → 5,247**, gain **+278**, **1,742 local response evaluations**, **2,600 iterations**, feasibility **PASS**, and **89 best screenings** versus 90 reference screenings. The [verification record](verification.html) records the numerical, real-upload, final-browser, export and course checks and their limits.
4. Compare the uploaded reference and retained best, inspect site/film totals and timetables, and download the best timetable CSV or full results JSON. The CSV uses the five import columns; predictions and factors belong in the full JSON. **Save planning inputs** downloads a reusable complete input package. The earlier film exchange is a collapsed optional experiment in Results, not a required first step.

Accepted data/settings changes invalidate old results and require confirmation/recalculation. A rejected import or rule reports errors and cannot produce a new valid optimization result. Repeat with the same data, confirmed rules, seed and budget. Version 1.4's **5,302** result came from another internal starting representation and must not be reused for this workflow.

## Planning-file contract

Files must be at most **2 MiB**. The supported teaching shape is **six film IDs A–F**, **six site IDs A–F**, **three screens per site**, and **18–600 complete screening rows**, subject to the package's actual capacities, room eligibility, operating/cleaning rules, coverage and supply caps. Every screen must be used. Unsupported fields, bad/duplicate IDs, unknown references and infeasible times are rejected.

The CSV columns are exactly `showing_id,site_id,screen_id,film_id,start_time`. CSV does not contain movie definitions, screen capacities or response assumptions; it is not a purchase-record training file. JSON supplies the full supported package. These richer planning inputs are additional fictional assumptions or separately requested information, not values learned from the homework's six purchase fields.

## Case B classroom route

Case B's movie-first M0 app is byte-identical to 1.4. Prepare **2,000 profiles**, select **Load classroom sample**, confirm **Admissions** and one initial path, then run. Inspect potential viewings, baseline realized viewings and film/date/person detail; optionally compare local improvement or a response shock and replanning. Its [Movies.csv](audience/Movies.csv) films are active January 1–4, 2027; the configured horizon remains the full 2027 year. The previous **757 potential / 726 realized / 241 showings** observations retain their unchanged-build scope.

## What the examples establish

Case A uses an explicit aggregate screening-response formula and deterministic ILS. It creates no individual audience population, fits no learned response model and executes no BO. Case B simulates individual choices, histories, availability and seats; the broader M1 graph proposal is future scope. Scores are synthetic expected-attendance units in A, and simulated visits or DEMO ticket revenue in B. Different fixtures, horizons and units prevent ranking their strategies by totals. Neither establishes real customer effects or global optimality.

## Sharing and checks

Keep the extracted folder structure. Both apps embed calculation code/assets; Case B also embeds its Worker. No installation, login or API key is required. The public allowlist now contains **29 files**, including the two new Response planning samples. [manifest.json](manifest.json) records delivered checksums; [verification](verification.html) records performed checks and remaining limits. The independent planning parser passed 25 checks and the exact app's Node verifier passed 39/39. Real JSON/CSV uploads, setting effects and rejection/stale-state recovery were exercised. Fresh downloads from the exact final app were audited, and their five-column CSV reimported successfully. Final exact-build Run–Pause–Finish replay, 390-pixel Import/Results responsiveness and actual browser CSV reimport passed. The 29-file assembler, approved installer, course build and worked-example/assignment tests passed. Fresh course-prefix controls reproduced 4,969 → 5,247 and returned from the app, Response guide and proposal to the hub; Course portal → Assignment 1 → Open worked examples → hub also passed. Offline direct-file execution remains unverified.

[Third-party notices](THIRD_PARTY_NOTICES.md) retain 11 library notices and three font families. The [assignment brief](reference/assignment.md), [template](reference/problem-definition-template.md) and [classification reference](reference/problem-classification-reference.md) are included. The complete 1.4 public snapshot and older apps are privately archived; grading notes, student work and customer records are excluded. No public deployment, commit or push is asserted.
