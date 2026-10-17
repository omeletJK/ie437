# Problem Definition: Cinema Programming Strategy Comparison

**IE437 Assignment 1 · Instructor discussion companion · 2026-10-11**

This companion connects the two anonymized strategy presentations to the published seven-section HW1 template. It is an instructor reference, not a claim that the presentations alone form a complete student submission. Both demos use fictional, illustrative fixtures; their numerical results are not directly comparable.

Files: `index.html`, `response-demo.html`, `audience-demo.html`, the two linked English presentations, and `DEMO_GUIDE.md`. Codex supported source review, translation, anonymization, demo packaging and verification. The reviewed materials and checks are recorded below.

## 1. Decision, Scope & Problem Structure

> A cinema programming manager uses records available at the planning cutoff, operating rules and explicitly stated demand assumptions to choose a feasible screening schedule, in order to improve expected purchased tickets under agreed operational conditions.

**D1 — Fixed-plan scheduling.** Choose the film, screen and start time for screenings in one stated planning window. The real window, screen inventory, film rights, minimum commitments and current scheduling policy are `TBD` and require operator confirmation. The two reference demos use their own stated fixtures, rather than the six teaching fields being sufficient to solve D1.

For a bounded one-shot plan, D1 can be **Flat / Stateless / Open-loop**: one complete schedule is selected from currently available information. Several analytical stages or repeated evaluator calls do not create a hierarchical decision dependency or operational feedback. Histories evolving inside a simulation concern the evaluator, not automatically the scheduling decision.

**D2 — Rolling revision is an extension.** If later bookings change commitments and later schedule choices within the same decision boundary, define state, action and transitions explicitly. That extension can be Stateful and Feedback. Its operational need and observation timing are `TBD`; do not derive it from the word “dynamic” alone.

The manager approves recommendations. Individual attendee identification, a complete production system and a guaranteed real-world uplift are outside this reference scope.

## 2. Computable Problem

Let `x[m,r,t] ∈ {0,1}` indicate whether film `m` starts on screen `r` at time `t`. Choose `x` in a feasible set `X`. Runtime, cleanup time, capacity, rights, format compatibility, opening hours and commitments defining `X` are operator-supplied inputs or explicitly labeled `[ASSUMPTION]` values.

Target: maximize expected purchased tickets `J(x | context)`. Purchased tickets, unique attendees, actual admissions and revenue are different outcomes. Revenue additionally needs prices/refunds; unique attendance additionally needs a defensible attendee model. Do not silently substitute one outcome for another.

The reference demos retain illustrative attendance/visit scores; they do not implement or validate the purchased-ticket target defined here. Adapting an evaluator and its aggregation to the agreed purchase unit is required before claiming an end-to-end HW1 solution. The fixture improvements below demonstrate a search mechanism under that fixture's own outcome definition.

| Component | Decision | Role | Model | Definition and status |
|---|---|---|---|---|
| C1-R | D1 | Cost, maximize | Data-driven if trained; Formulation in the current toy demo | A response evaluator `f(context,x)` estimates the defined outcome. The Response demo computes a synthetic formula; it is not evidence that a real response model was trained. |
| C1-S | D1 | Cost, maximize | Simulation | Run choices/events for an assumed audience under a schedule, then aggregate with weights. The Audience daily-path demo executes seeded sampling; its separate schedule-search storyboard is prepared. |
| C2 | D1 | Constraint | Formulation | Non-overlap, room/format compatibility, capacity, commitments and other confirmed rules. Exact operating values are `TBD`; source demo values are fixture assumptions. |
| C3 | Supplemental case | Constraint | Formulation | `[ASSUMPTION]` Fixed, non-overlapping slots. Available slots equal screen count times slots per screen. Integer inputs must be nonnegative; required screenings cannot exceed available slots. This separate check does not validate the full scheduling engine. |
| C4 | D2, only if included | State-transition | Formulation or another explicitly justified model | State includes confirmed commitments and relevant history; define how observations and chosen revisions change that state. `TBD` for an actual rolling implementation. |

C1-R and C1-S are alternatives, not a requirement to build both. Keep a component's Role separate from its Model. A learned forecast used only as an input parameter does not automatically make every evaluation component Data-driven.

For synthetic choice, an illustrative conditional model may use `P(j|u,x) = exp(V[u,j,x]) / (exp(V[u,none]) + Σ_k exp(V[u,k,x]))`. State eligibility, the outside option, capacity treatment and the unit counted by aggregation. The executed daily-path reference instead uses an intensity-driven joint daily distribution and history updates; see its slide explanation. These are declared examples, not fitted attendee behavior.

## 3. Information & Uncertainty

The published teaching specification supplies six fields: `title_tag`, `venue_tag`, `play_day`, `curtain_time`, `account_tag`, `passes_bought`. One row represents a completed purchase for one screening. Date and time refer to the screening, not purchase creation.

An account buying three tickets does not identify three individual histories. Repeating the purchaser's preferences for every ticket is an unsupported assumption. The records support purchase/ticket summaries under known coverage; they do not identify all viewers, no-purchase opportunities or the demand that an alternative schedule would have produced.

| Input / unknown / request | Why it matters | How to obtain it; priority | Fallback |
|---|---|---|---|
| Complete screening inventory, including zero-sales screenings | Exposure denominator and feasible alternatives | Operator schedule export; high | Restrict analysis to observed purchased screenings; do not infer full demand response. |
| Capacity, runtime, cleanup, formats, rights and opening rules | Feasible scheduling | Operations interviews and inventory/rule tables; high | Use explicit toy assumptions and defer operational recommendations. |
| Purchase creation/changes and historical schedule versions | Information cutoff and action/response identification | Event logs and schedule version history; high | Acknowledge limited identification; log prospectively and avoid causal claims. |
| Coverage, refunds/cancellations and actual admission definition | Correct target and evaluation unit | Data owner and record audit; high | Target the supplied completed-purchase unit only, with limits stated. |
| Party composition or privacy-preserving group feedback | Purchaser–attendee ambiguity | Aggregated consented feedback, not identity reconstruction; optional | Treat accounts as purchasing units; compare multiple plausible latent group compositions. |
| Film content, release conditions and market weights | Cold start and synthetic population calibration | Content records and justified market aggregates; conditional | Simple content assumptions and sensitivity ranges; no unsupported nationwide scaling. |

All toy preference, recovery, accessibility and population assumptions are `[ASSUMPTION]`. Examine alternative assumptions compatible with observed purchase statistics. A visually plausible synthetic world does not establish that it is the true world.

## 4. Alternatives & Selected Approach

| Approach | Mechanism / information | Strength and limitation | Decision |
|---|---|---|---|
| Simple baseline | Current operator plan, or a declared rule using the same feasible set | Cheap and auditable; may omit substitution | Always retain a common-input reference for evaluation. Current real policy is `TBD`. |
| Response model | Context and schedule action → expected outcome | Direct action scoring; needs coverage and careful identification | Appropriate when response can be estimated reliably at the chosen scope. Current demo is a toy formula plus executed ILS. |
| Synthetic audience | Plausible population → accessible choices/events → weighted aggregation | Explains substitution and no-visit choices; depends on latent composition and calibration | Useful for hypothesis and sensitivity analysis. It does not reconstruct actual individuals from purchase accounts. |

Select the evaluation approach after the data audit; no universal winner is established by these examples. Compare models using the same schedules, cutoff, target, baseline and evaluation conditions. The two reference fixtures have different scales and cannot establish relative model accuracy.

Search is a separate choice: enumeration for a tiny candidate set, feasible local search for a larger set, or a justified solver/BO strategy. BO requires a posterior, acquisition-based candidate selection, an evaluation and posterior updates. Neither supplied demonstration implements that loop. The Response search is deterministic ILS; Audience S23 animates six prepared candidates.

## 5. Demonstration & Evaluation

Open `index.html`, then either standalone demo directly in Chrome. No server, installation, login, API key or internet assets are needed. Use the top selector and Reset; both files include a separate **HW1 case checks** panel.

Response: change prepared response controls, then run the executed search. It evaluates its synthetic response function and feasible moves, comparing the initial and searched schedules under the same fixture. Its displayed `5,134 → 5,265` is an illustrative expected-attendance score improvement, not measured purchased tickets, a field benefit or proof of global optimality.

Audience: use Daily sampling, step/play, and reset. Eligibility, intensities, the joint draw and history update are executed with reproducible pseudo-random sampling. A/B values, profile/forecast examples and the search storyboard are prepared explanatory values. The storyboard's scores and viewer-run counter do not represent a newly executed optimizer or population evaluation.

| Case | Reproduction | Expected result | Scope of conclusion |
|---|---|---|---|
| Normal | Case checks: 2 screens, 3 slots each, require 4 screenings | Capacity 6; feasible with 2 spare slots | Supplemental feasibility arithmetic only. |
| Boundary | Same resources, require 6 screenings | Exactly at capacity | Same component at its capacity boundary. |
| Failure | Same resources, require 7 screenings | Infeasible; show a shortage and revise inputs | An invalid request must not be shown as a valid schedule. |
| Invalid input | Negative, fractional, empty or unsafe integer entries | Explicit validation error | Input validation only. |

The checked browser outputs are recorded in `qa/verification.json`; the build-source and output hashes are in `manifest.json`. The executed sampling/search behaviors and three-case checks establish software/fixture behavior. They do not validate fitted response, inferred individual preferences, causality or real adoption value. End-to-end operational failure tests remain a separate implementation requirement.

## 6. Client Proposal

First request a small data audit, operational-rule interview and access to historical versions. The data owner checks record semantics/coverage; the operations owner confirms feasible decisions and approves recommendations; a modeling role defines and validates the target and evaluator.

Proceed to a leakage-safe historical comparison only after the outcome unit, information cutoff and feasible set are defensible. Compare with the declared baseline and report error, calibration, constraint violations, sensitivity and reproducibility. Define numerical acceptance thresholds with the operator after measuring the baseline; the teaching brief supplies no justified thresholds or budget.

Revise or stop if the critical inputs are unavailable, record semantics invalidate the target, a model fails calibration/stability checks or recommendations violate hard rules. A replay using a fitted evaluator is not an independent causal test. Use a safely bounded prospective/controlled trial when operationally appropriate to assess field benefit.

Commercial cost and timeline figures in the full reference slide decks are illustrative proposal examples, not estimates justified by the HW1 brief. A student answer should justify them or state `TBD` with an estimation plan.

Requested decision: authorize the bounded data/rule audit and define the next validation gate. No real business improvement has been established by this classroom package.

## 7. LLM Review & Key Revisions

These are actual instructor-material review decisions during preparation, rather than invented student discussions.

| Discussion | Suggestion / initial framing | Independent assessment and check | Final use |
|---|---|---|---|
| Response approach and BO | Frame response scoring and optimization as a BO concept | Inspected the executed search source: deterministic ILS; no posterior/acquisition/update loop | Label actual demo ILS; discuss BO as a separate optional search design. |
| Synthetic audience evidence | Use the choice and search animations to explain the mechanism | Inspected daily sampling and S23 code: daily paths are sampled; six schedule scores/patches are prepared | Distinguish executed sampling from the illustrative search storyboard in the launcher and demos. |
| Purchase records and individuals | Use histories to characterize synthetic viewers | Checked the six-field specification: purchasing account and ticket count do not identify actual attendees | State the observation-unit limit, latent assumptions and calibration/sensitivity requests. |

Further student work must document the student's own three important discussions/checks and the consistency of that student's chosen definition, demo and proposal.
