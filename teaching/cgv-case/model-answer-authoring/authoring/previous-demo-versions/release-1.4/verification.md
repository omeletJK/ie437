# Verification record — IE437 worked examples

Version 1.4 · Updated 11 October 2026 · Synthetic classroom fixtures

There are exactly **two demo sites**, one per case, with different evaluators. Case A's standalone **Response Model Simulator** uses the original aggregate response calculation and ILS. Release 1.4 foregrounds editable film exchanges in actual screening records, with original/draft and applied/best timetable comparisons. Case B's movie-first M0 HTML and the four original proposal files are unchanged from 1.3. Older apps and private archives are outside publication.

The Response proposal describes future learned modeling and BO. The executable evaluator is an explicitly assumed aggregate formula and the search is **ILS**, without individual consumers. Case B uses synthetic individual choice and numerical reference-frequency calibration; learned M1 graphs are not implemented. Scores are fictional mechanism outputs, not measured customer effects.

## Case A — executed 1.4 exchange and search checks

The original S13 SIM2 response, packing, feasibility, presolve and search core is retained: **12 numerical functions** preserve their original parsed syntax. The new editor changes film assignments in selected original slots and an optional first-slot gap, then uses the same complete-plan engine to evaluate the result. Twelve retained functions do not mean all presentation or adapter code is unchanged. The exact delivered build is identified in [response/verification.json](response/verification.json) and [manifest.json](manifest.json).

The fixture has **six films, six sites, 18 screens and 90 default screenings in one synthetic operating day**. The original reference is **5,134**, constructed through uniform-site-response presolve and then evaluated with site-specific factors. It is not observed current business practice. Preview always begins from that original reference; it does not mutate the applied or searched plan. Search is disabled until the valid current draft is applied.

The final exact English build was exercised over local HTTP. The default exchange selected **Site D / Screen 2 / Film A / 11:05** and **Site D / Screen 3 / Film F / 20:15**, with additional gap **0**.

| Current-build experiment | Executed outcome |
|---|---|
| Reset / original reference | **5,134**, 90 screenings |
| Default exchange preview | **4,969**, **−165** from original; valid draft |
| Apply default → Finish search | **5,302**, **+333** from applied and **+168** from original; **2,600 iterations**, **1,711 response evaluations**, **90 screenings**, feasibility **PASS** |
| Identical default workflow repeated | Same final exact build reproduced **4,969 → 5,302**, 1,711 evaluations, 2,600 iterations and **PASS** |
| Positive exchange with gap 5 | Site B / Screen 2 / Film A / 11:20 ↔ Site B / Screen 3 / Film E / 14:05: **5,134 → 5,141 → 5,180**, **1,757 evaluations** |
| Incompatible room / blank gap | Rejected draft; no valid new score/application; prior applied/search results retained |
| Auxiliary closing boundary | Shift **365**: valid **5,099** preview, final end **24:36**, four-minute slack before **24:40**; applied search **5,352** |
| Auxiliary closing failure | Shift **370** rejected; prior **5,352** best retained; no valid score for the failed draft |

The positive exchange's **gap 5** is part of its input; gap 0 is a different experiment. The exchange swaps films, preserving the manual draft's total film counts. Different runtimes shift later starts on the affected screens. The response table also includes unchanged slots whose competition changed. Predictions incorporate film/site/time factors, room eligibility, nearby-screening penalties and capacity caps. These coefficients are declared assumptions, not learned effects.

Original reference, applied timetable and best-found timetable are kept separately. **−165** describes the manual edit; **+333** describes search from that edit; **+168** compares the searched result with original. They must not be merged into an arbitrary improvement claim. ILS can alter film supply within the hard rules; its best result is not a proven global optimum. Apply restarts the loaded search at seed **20260829**; Reset reconstructs the original reference through presolve and clears the applied edit. Repeat the same selectors, gap and entry path. Animation speed changes presentation time rather than the 2,600-iteration budget.

The browser downloaded and audited the actual **Export results** JSON. It contained original/applied/best scores **5,134 / 4,969 / 5,302**, complete timetables, **90 best-screening rows**, model factors, fixture and reproduction settings. This actual download preceded the final CSS-only adjustment; the numerical/export code was unchanged and the final exact-byte Node checks verified its calculations. Exported best data came from the retained feasible plan. **Data & method** includes six films/sites, the formula and rules, plus six fictional purchases totaling **13 tickets and five purchasing accounts**; these purchases do not fit the evaluator or identify admissions. At a **390-pixel viewport**, body width remained **390 pixels** and the method dialog was **352 pixels** wide.

The separate fresh Node verifier passed **27 checks on the exact build**. Browser workflow/replay, rejection, positive-gap, auxiliary constraint, export and responsive observations above are fresh 1.4 checks, distinct from earlier 1.3 evidence. Node checks use rendering stubs and are distinct from browser execution. Fresh 1.4 assembly, course staging/build, package/assignment checks and course-prefix navigation passed as recorded below. Direct offline-file execution is not verified. See [the guide](response/demo-guide.html) for controls and [the per-case record](response/verification.json) for exact artifacts and checks.

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

The original English anonymized proposals retain their diagrams, animations, notes and controls: **44 Response sections** and **59 Audience sections**, including appendices. All four primary/compatibility proposal files are unchanged from 1.3; each `extended-proposal.html` equals its primary copy. Prepared illustrations are distinct from calculated app outputs.

The hub, reading views and Response app reuse course portal CSS and embedded Inter, IBM Plex Mono and Space Grotesk fonts. Each case provides one demo, one full proposal, an English guide and the seven-section definition in Markdown/HTML. **All worked examples** returns to the package index. Case A embeds its calculation code; Case B embeds its app and Worker. No learned model, external API or customer dataset is needed for these fictional calculations.

The public allowlist contains **27 files**. [manifest.json](manifest.json) records release sizes/checksums, and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) preserves attribution for **11 libraries and three font families**. Older demos, private authoring material, instructor reviews, grading notes and student submissions are excluded. Case B's exact app hash remains `8a2823a577059361d284542c42aafbd12b2a22022517f8dd335a5909dfabb08f`.

**Release 1.4 assembly, approved installer staging, course build, `node tests/worked-examples.mjs` and `node tests/assignments.mjs` passed.** The package tests checked the staged assembly, including public boundaries and archive/source consistency; [manifest.json](manifest.json) identifies delivered checksums. These are fresh 1.4 results, not inherited 1.3 passes.

Fresh course-prefix CUA checks exercised the exact Response build: default **5,134 → 4,969 → 5,302**, **1,711 evaluations**, **2,600 iterations**, **PASS**. Its **All worked examples** link returned to the hub. The Response guide and problem-definition reading view also returned to the hub; both original proposal covers loaded and returned. The unchanged Audience app opened its initial screen and returned to the hub, without a fresh full-workflow repeat. The hub's **Course portal** link reached Assignment 1, and **Open worked examples** reopened the hub. Reloading the hub confirmed the current **Exchange films** copy. No public deployment, commit or push was performed.

## Remaining checks and limits

- **Direct-from-disk offline browser execution:** not run. Embedded assets alone do not establish this assignment requirement; complete the classroom browser preflight.
- **Case B fresh independent full-workflow reset/repeat:** not remeasured for 1.4. Its unchanged bytes retain the earlier observed workflow above. Case A's current default exchange/search repeat passed.
- **Large annual catalogs, all objectives/rules and production validation:** not exhaustively tested. M0 formal readiness, M1 learning, real-record calibration and business effects remain unestablished.
- **Strategy comparison:** different fixtures, scales, horizons and units prevent numerical ranking of the approaches.

These instructor-authorized examples follow the public assignment brief and use synthetic records only.
