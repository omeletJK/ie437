# Case B — Movie-first audience demo guide

Open [the demo site](demo.html). This is the latest existing movie-first M0 app, presented in English. It forecasts movie demand before generating screenings, then evaluates the audience's choices under the actual schedule and seat limits.

## Start the classroom experiment

1. Keep **Computational profiles** at **2,000** and **Initial movie list** empty. Select **Prepare synthetic audience**, then **Next: Register movies**.
2. Select **Load annual sample · 24 films**. Confirm **Movies: 24 registered**. This restores the existing simulator's annual sample through its original file importer. Use **Download sample CSV** to inspect or change the same catalog, or upload your own file named `Movies.csv` or XLSX with a `Movies` sheet.
3. Continue to **Objective & constraints**. Keep the **Admissions** objective, **1 forecast path**, opening **540**, closing **1470**, cleaning **20 minutes** and ticket price **1400 minor units**. Leave automatic improvement unchecked. Select **Confirm settings**, then **Start simulation**.
4. Wait for baseline evaluation to complete. Read **Schedule-independent potential viewings**, **Realized viewings under the baseline schedule** and the number of baseline showings.
5. Under **Displayed result**, compare potential and baseline modes. Select a movie title or bar, then a date and a person ID to inspect the synthetic viewing history.

Start the one-path simulation while introducing the proposal: reference-frequency calibration and the full 365-day, 10,000-person evaluation take several minutes in the browser. The app reports the current phase and completed dates. **Stop calculation** keeps the inputs so the same experiment can be replayed.

The existing annual sample contains **24 distinct fictional movie IDs: two new films each month across 2027**. Each month pairs a science-fiction movie and a drama with different preference features. Both are available throughout that month, so their release windows overlap and every service day has two competing films. The fixture uses 110-minute runtimes, all-age ratings and standard format. These are controlled sample inputs, which you can change in the downloadable CSV.

A movie is eligible from its `releaseDate` through the day before its exclusive `endDate`. Metadata are declared known at the annual forecast cutoff, **January 1, 2027**. The engine evaluates **January 1, 2027 to exclusive January 1, 2028**. Inspect dates in different months to see the active catalog change, then compare potential interest with the baseline's actual times and seats. The fresh local HTTP run with 2,000 profiles and one path produced **9,576 potential viewings**, **5,536 baseline realized viewings** and **7,467 showings**. Calibration reported **130.6 seconds**; the complete run took approximately **419 seconds** on the checked environment. This is an observed run, not a runtime guarantee. [The verification record](../verification.html) keeps the earlier two-film checks separately.

## Experiment 1 — Improve the schedule

In the results task selector choose the option to find a better candidate from the baseline. Select **Start schedule improvement** in the bottom action bar. The app explores feasible changes to movie, time, format and screening supply, then compares candidate and baseline on the same **20 held-out paths**.

Read the paired comparison and recommendation. A candidate is recommended only when the lower endpoint of its reported Monte Carlo improvement interval is positive. Otherwise retain the baseline. The optimizer searches a bounded set of nearby schedules; it does not prove global optimality.

Search uses paths 100–103; validation uses 200–219. The initial baseline uses path 0. Use the paired comparison panel when assessing improvement, rather than subtracting headline values evaluated on different paths.

Retaining the baseline is a valid decision when the explored candidates provide no supported gain. Run the one-path annual baseline first, then use this separate 20-path experiment when there is time to inspect its results.

## Experiment 2 — Change film response and replan

Choose the results option for a response change and replanning. Use **2027-02-15**, **February · Stellar Voyage** (`OWN-02-A`) and an intensity multiplier of **0.2**, then run the bottom action. This movie is active February 1–28; March 1 is its exclusive end date. For another experiment, check the chosen movie's release window before selecting an effective date.

Compare three states: before shock with the original plan; after shock with the original plan; after shock with the replanned schedule. **Replanning effect = third state minus second state.** The multiplier changes movie intensity; it does not force an 80% admissions decline. The same synthetic past and known commitments are preserved across the comparison. The sample contains no confirmed bookings.

Use the reported paired gain and interval; subtracting rounded table values can differ. Record the movie, effective date and multiplier with the comparison. The February annual-sample comparison has not yet been recorded. The former January 3 / Stellar Voyage results belong to the historical two-film fixture, documented separately in the verification record.

## Units and assumptions

The 2,000 profile types support a fixed **10,000-person local seat market**. A seat-consuming visit is one person's visit, while the same person may watch different movies on different days. Visits are not distinct annual visitors.

The selectable objective is admissions or ticket revenue, with zero edit penalty in this UI. **100 minor units = 1 DEMO unit**; 1400 means 14.00 DEMO units. Revenue excludes operating costs. Potential demand uses a fixed reference environment; realized admissions use the generated schedule and seat capacities. These are synthetic model outcomes, not actual ticket sales or calibrated prediction intervals.

The app uses explicit preference rules and numerical reference-frequency calibration. It does not train the proposal's M1 graph model or execute Bayesian optimization.

## Repeat and return

Reopen the app for an independent experiment. Changing inputs clears results and requires confirmation and recalculation. **Stop calculation** retains inputs for deterministic replay from the beginning. Browser-local input saving is separate from the older simulator versions.

Use **All worked examples** to return to the landing page. Consult [the problem definition](problem-definition.html) and [verification record](../verification.html) for the recorded checks, failure cases and remaining validation.
