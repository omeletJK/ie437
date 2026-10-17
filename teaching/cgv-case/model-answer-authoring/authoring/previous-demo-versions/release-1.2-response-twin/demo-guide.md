# Case A: Schedule Studio Demo Guide

[Open the full app](demo.html#schedule) · [Original Response proposal](proposal.html) · [Definition](problem-definition.md) · [All worked examples](../index.html)

This is the existing seven-day synthetic-audience application. Its evaluator is a simulated audience/seat model and its optimizer is bounded local candidate search. A separately learned Response model and BO are not implemented. The current English build passed the HTTP workflow below; direct offline opening and an independent fresh repeat remain unverified. See [verification.json](verification.json).

1. Open **Schedule Studio** and select **Generate Audience**. Keep **10,000 profiles**; wait until generation finishes. The local market is 10,000 and the fixed seed is 20260913.
2. Select **Re-simulate**. Inspect admissions, revenue units, occupancy, unmet demand and the evaluated-plan hash. The seven-day plan has 630 shows; the timetable displays its first 36 shows.
3. Click the first opening-day showing, initially 10:00. Keep its movie, screen and format unchanged. Apply the chained edits below, re-simulating after each applied edit. An open edit dialog has not changed the evaluated plan.
4. After recovery, select **Run Reference Optimizer**. Inspect progress, baseline/candidate revenue and objective delta. The objective is `J = revenue − 0.2 × unmet demand × 14 − 2 × changed records`, so its gain is not necessarily the rounded revenue difference. Select **Apply optimized plan** to re-evaluate the chosen candidate.

The independent HTTP review on 11 October 2026 executed this **single chained sequence**, without resetting between cases:

| Case | Edit from preceding state; apply and re-simulate | Observed evaluated hash / behavior |
|---|---|---|
| Fresh baseline | Generate default fixture; first showing 10:00 | `901ea84a`; valid. |
| Normal | From 10:00, **+30 min** once → 10:30 | `25526c16`; valid. |
| Opening boundary | From 10:30, **−30 min** three times → 09:00 | `01e09ee2`; valid exact-opening boundary. |
| Failure | From 09:00, **−30 min** once → 08:30 | `STALE`, recalculation required, optimizer disabled. Previous KPIs remain visible and do not describe the invalid draft. Exact error text was not captured. |
| Recovery | From 08:30, **+30 min** three times → 10:00 | `6434c256`; valid evaluation restored. |

Every valid pre-search state displayed **5,229 admissions, 97,013 rounded synthetic revenue units, 4.4% occupancy and zero unmet demand**. A changed plan need not change aggregate KPIs. Revision metadata are included in the hash, so returning to 10:00 need not restore the fresh baseline hash.

From the recovered state, the optimizer displayed **+19,030.9 objective units**, baseline revenue **97,013** and candidate revenue **116,476**. Applying the candidate produced **6,418 admissions, 116,476 rounded revenue units, 5.4% occupancy, zero unmet demand and hash `17d4a52f`**. This is the best found by the bounded search under its synthetic assumptions, not a proven optimum.

For an independent check, recreate the default fixture and repeat the same full sequence, recording build/settings/hash/results. That repeat was not executed in this review. Separately reset normal/boundary/failure cases are another proposed check; their revision hashes may differ from this chain. If recovery fails, use **Restart Audience** or reload and generate a fresh fixture.

The sidebar also offers **Audience Population**, **Movie Forecast**, **Historical Backtest**, **Choice Simulation** and **Dynamic Re-programming**. The dynamic view adds a synthetic booking shock, protects Frozen/Limited showings and commitments, and compares three states under a later-clock context. That extension was not re-executed in this Case A release review; do not compare its baseline directly with Schedule Studio's earlier context. All data/outcomes are fictional; purchased-ticket prediction, real business value and production readiness remain unverified.
