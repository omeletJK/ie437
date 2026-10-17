# Response Model Simulator: Demo Guide

[Open simulator](demo.html) · [Original Response proposal](proposal.html) · [Problem definition](problem-definition.md) · [All worked examples](../index.html)

This independent page uses SIM2's **aggregate synthetic response equation and deterministic ILS**. It generates no individual consumers and calls no audience-twin choice engine. No real-data fitting, BO or global-optimum claim is implemented. The final build passed 16 Node checks and an independent HTTP workflow review; direct offline opening remains unverified. See [verification.json](verification.json).

For the main demonstration:

1. Select **Reset**. The uniform-response ILS baseline is scored with site-specific response: **5,134**, **90 shows**, actual best-plan **PASS**. The fixture has six sites, six films and 18 screens, using seed 20260829.
2. Select **Run search**, then **Pause** to inspect progress. Choose **Finish search** to complete the same 2,600 iterations. The reviewed main result is **5,265**, **1,739 response calls**, **PASS**. Speed 1× and 4× produce the same completed result.
3. Select a site in the heatmap, such as **Site D**, and inspect its screen Gantt. Open **Data & method** for the equation, six film/site tables and the fictional purchase audit (six purchases, 13 tickets, five accounts).
4. Select **Export results**. The reviewed actual JSON download records baseline 5,134, best 5,265, 2,600 iterations, 1,739 calls, fixture/seed/source information and 90 feasible best-plan showings. Per-show attendance sums round to 5,265.

For a schedule experiment, change the selected screen's minute shift. The declared target is **Site D / Screen 1**, chosen for greatest closing slack. Preview evaluates the complete plan through the original packing, feasibility and response functions. A changed preview is not yet the applied search baseline; search is disabled until a valid preview is applied.

| Case | Experiment and execution | Reviewed result |
|---|---|---|
| Normal | Normal / **0 min** → Apply evaluated schedule → Finish search | Baseline **5,134**, best **5,134**, **1,715 calls**, 2,600 iterations; valid but no gain. |
| Boundary | Boundary / **365 min** → preview → apply → finish | Preview **5,099**, final film end **24:36**, four minutes before closing **24:40**. Applied search **5,099 → 5,352**, **1,750 calls**, 2,600 iterations, **PASS**. |
| Failure | After boundary search, choose Failure / **370 min** | **INFEASIBLE**, no preview score; apply/search disabled. Prior valid best 5,352 stays displayed and is not a result for the invalid preview. |
| Input failure | Clear the shift input | **INVALID**, no score or application/search. Node checked ten invalid inputs without changing the plan. |
| Recovery | Choose Normal / 0 and apply, or Reset | Normal application restores a valid loaded search; Reset restores the main comparison. |

**Normal Apply and Reset use different random streams.** Reset seeds before baseline presolve and continues afterward; applying a plan restarts ILS at seed 20260829 directly. Applying Normal 0 can therefore show no gain, while Reset gives 5,134 → 5,265. To present the main improvement, use Reset → Run/Finish search. To compare experiments, keep the same applied-plan starting mode. Speed affects presentation time, not results.

For replay, Reset → Finish search → export, then repeat the identical workflow in the same runtime. Node fresh-VM and same-VM repeats matched; the exact final HTTP build also reproduced the main result after Reset. The 390-pixel browser view had a 390-pixel body and 352-pixel method dialog; the desktop view was restored to 1280. All worked examples returned from the staged demo and guide to the hub under the course prefix. Direct-file opening has not been verified.

Scores are rounded synthetic expected attendance across screenings, not purchased tickets, observed admissions, unique people or revenue. The last film must end by 24:40; 15-minute cleaning separates consecutive films. Final-film closing does not add cleaning after the last show. Actual policies, learned response accuracy and business benefit require additional information and validation. The original full proposal explains the broader concept; slide navigation is unnecessary for this page.
