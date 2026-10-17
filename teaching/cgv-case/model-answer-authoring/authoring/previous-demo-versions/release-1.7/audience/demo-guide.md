# Case B — Movie-first audience demo guide

Open [the demo site](demo.html). This is the latest existing movie-first M0 app, presented in English. It forecasts movie demand before generating screenings, then evaluates the audience's choices under the actual schedule and seat limits.

## Start the classroom experiment

1. Keep **Computational profiles** at **2,000** and **Initial movie list** empty. Select **Prepare synthetic audience**, then **Next: Register movies**.
2. Select **Load classroom sample**. Confirm **2 movies registered**. This uses the application's existing file importer; you can also upload your own `Movies.csv` or XLSX.
3. Continue to **Objective & constraints**. Keep the **Admissions** objective, **1 forecast path**, opening **540**, closing **1470**, cleaning **20 minutes** and ticket price **1400 minor units**. Leave automatic improvement unchecked. Select **Confirm settings**, then **Start simulation**.
4. Wait for baseline evaluation to complete. Read **Schedule-independent potential viewings**, **Realized viewings under the baseline schedule** and the number of baseline showings.
5. Under **Displayed result**, compare potential and baseline modes. Select a movie title or bar, then a date and a person ID to inspect the synthetic viewing history.

The sample films are Stellar Voyage and Quiet Afternoon. Their release windows end exclusively on January 5, so screenings are available **January 1–4, 2027**. Importing this sample does not shorten the configured horizon: the engine still evaluates **January 1, 2027 to exclusive January 1, 2028**. The recorded run produced **757 potential viewings, 726 realized baseline viewings and 241 showings**.

## Experiment 1 — Improve the schedule

In the results task selector choose the option to find a better candidate from the baseline. Select **Start schedule improvement** in the bottom action bar. The app explores feasible changes to movie, time, format and screening supply, then compares candidate and baseline on the same **20 held-out paths**.

Read the paired comparison and recommendation. A candidate is recommended only when the lower endpoint of its reported Monte Carlo improvement interval is positive. Otherwise retain the baseline. The optimizer searches a bounded set of nearby schedules; it does not prove global optimality.

Search uses paths 100–103; validation uses 200–219. The initial baseline uses path 0. Use the paired comparison panel when assessing improvement, rather than subtracting headline values evaluated on different paths.

In the recorded sample run the separate validation comparison gave **767.30 admissions for both schedules**, a paired gain of **0.00** and **Uncertain gain · Baseline schedule retained**. Retaining the baseline is a valid decision when the explored candidates provide no supported gain.

## Experiment 2 — Change film response and replan

Choose the results option for a response change and replanning. Use **2027-01-03**, **Stellar Voyage** and an intensity multiplier of **0.2**, then run the bottom action.

Compare three states: before shock with the original plan; after shock with the original plan; after shock with the replanned schedule. **Replanning effect = third state minus second state.** The multiplier changes movie intensity; it does not force an 80% admissions decline. The same synthetic past and known commitments are preserved across the comparison. The sample contains no confirmed bookings.

The recorded three-state comparison displayed **741.5 → 619.6 → 620.4 viewings**, with a paired replanning gain of **0.70 admissions** and interval **[0.30, 1.10]**. Use the reported paired gain; subtracting rounded table values can differ. This is a simulation comparison with fixed history, not evidence of real-market performance.

## Units and assumptions

The 2,000 profile types support a fixed **10,000-person local seat market**. A seat-consuming visit is one person's visit, while the same person may watch different movies on different days. Visits are not distinct annual visitors.

The selectable objective is admissions or ticket revenue, with zero edit penalty in this UI. **100 minor units = 1 DEMO unit**; 1400 means 14.00 DEMO units. Revenue excludes operating costs. Potential demand uses a fixed reference environment; realized admissions use the generated schedule and seat capacities. These are synthetic model outcomes, not actual ticket sales or calibrated prediction intervals.

The app uses explicit preference rules and numerical reference-frequency calibration. It does not train the proposal's M1 graph model or execute Bayesian optimization.

## Repeat and return

Reopen the app for an independent experiment. Changing inputs clears results and requires confirmation and recalculation. **Stop calculation** retains inputs for deterministic replay from the beginning. Browser-local input saving is separate from the older simulator versions.

Use **All worked examples** to return to the landing page. Consult [the problem definition](problem-definition.html) and [verification record](../verification.html) for the recorded checks, failure cases and remaining validation.
