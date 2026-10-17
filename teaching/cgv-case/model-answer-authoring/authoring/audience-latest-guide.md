# Synthetic Audience — Movie First M0 demo guide

Private authoring draft · 11 October 2026 · Based on the existing `annual-movie-first-v1.0.0` engine, schema 5

This guide describes the existing Movie First application and its actual Worker computations. The selected public entry is `audience/demo.html`. Earlier packaged app versions are private reference files under `authoring/previous-demo-versions/`. No new UI run or measured result is claimed in this draft. English action names below follow the current translation map while the English build is verified.

## What the experiment does

Prepare a synthetic audience, register movies and their release windows, predict schedule-independent potential visits in a reference environment, construct a feasible baseline schedule, and simulate audience choices with its actual screening times and seat capacities. Then search nearby schedules or apply a hypothetical film-response shock and replan the future.

This is the M0 development model. Preference scores use explicit rules, and numerical calibration matches a supplied annual frequency in a fixed synthetic reference environment. It does not train a response model from real customer outcomes, execute Bayesian optimization, or include the proposed M1 learned graph model. Search returns the best candidate it examined; it does not prove global optimality.

## Prepare a manageable classroom fixture

1. Open the Movie First application. Keep **Computational profiles** at **2,000** and **Initial movie list** at **Empty list · enter movies manually**.
2. For a reproducible declared-frequency example, select **Declare annual viewing frequency** and enter **10**. Without this override, the generated profiles retain their existing synthetic frequency estimates. Ten is a reference annual mean, not a requirement to make ten visits in this fixture.
3. Select **Prepare synthetic audience** in the bottom action bar. This creates the input audience; frequency calibration runs later when the simulation starts. The initial action then becomes **Next: Register movies**.
4. Register the two films with **Load classroom sample**, a packaging-added control that imports the inline CSV through the existing import handler. Alternatively, select **Download sample CSV** and upload the downloaded `Movies.csv`. These controls replace the original large sample links; they do not replace the calculation engine.
5. For your own file, use **Movie theatrical-run file**. **Save or rename a movie CSV to `Movies.csv` before uploading it.** The importer uses the filename as the sheet name and accepts exactly `Movies`, `ReleaseWindows` or `Showings`. A file named `movies-small.csv` is rejected even if its columns are correct. With an audience already prepared, choosing the file immediately requests import. Confirm that the screen shows **2 movies registered** and no error. If a file was selected before audience registration, the bottom bar offers **Apply selected file**.
6. Continue with **Next: Objective & constraints →**.

The supported minimal movie CSV is:

```csv
id,title,genres,runtimeMin,ratingClass,formats,releaseDate,endDate,knownAt
A,Stellar Voyage,sci-fi,110,ALL,standard,2027-01-01,2027-01-05,2027-01-01
B,Quiet Afternoon,drama,100,ALL,standard,2027-01-01,2027-01-05,2027-01-01
```

IDs must be unique. Genres and formats use the engine's identifiers; multiple values are separated with `|`. Dates use `YYYY-MM-DD`. `knownAt` is the date or timezone-qualified minute when the movie metadata became available. Here both films are known at the forecast cutoff. Omitted synopsis, cast, director and explicit feature columns receive the existing metadata-rule defaults. This file contains invented films and no attendee or purchase data.

**Date distinction:** `endDate` is exclusive, so the films are available on **January 1–4**, not January 5. Importing these rows does not shorten the planning configuration. The existing UI still evaluates **2027-01-01 through exclusive 2028-01-01**, a full 365-day horizon. This is a small movie catalog with a short active interval, not a four-day simulation horizon. The current UI has no separate planning-horizon editor.

## Set the objective and run the baseline

Keep **Objective** at **Admissions** for the first experiment. The alternative is **Ticket revenue, excluding costs**. Keep **Forecast paths** at **1 path** for the first run; 20 paths calculate an average and require more computation.

The default operational assumptions are:

| Control | Value | Meaning |
|---|---:|---|
| Opening minute | 540 | 09:00 |
| Closing minute | 1470 | 24:30 in service-day notation |
| Cleaning time | 20 minutes | Minimum separation between screenings on one screen |
| Ticket price | 1400 minor units | 14.00 DEMO units, not Korean won |
| Start-time enumeration grid | 30 minutes | Existing engine rule; not a separate UI control |

Leave **Run local improvement and separate 20-path validation after the baseline** unchecked for the first run. Select **Confirm settings**, then **Start simulation** in the bottom bar.

The application automatically executes these stages in order:

1. Calibrate each profile's annual reference frequency.
2. Forecast potential visits in a reference environment with no submitted screening timetable. The reference price remains 1400 minor units; changing the operational ticket price changes the evaluated schedules, not that fixed reference benchmark.
3. Enumerate feasible movie, site, screen, format and time choices and greedily pack a baseline schedule using a cohort-coverage heuristic.
4. Re-evaluate the returned schedule with actual seat constraints and the same synthetic local person pool.
5. Open **Interpret results**. If automatic improvement was selected, improvement and its separate validation occur before this screen opens.

The coverage heuristic used to create the baseline is not its final attendance score. The final baseline is calculated by the audience simulation. A failed greedy construction reports **not found**; that is not a proof that every possible schedule is infeasible.

## Read the units and distinguish result types

Selecting 2,000 profiles does **not** make the seat market contain 2,000 people. The application builds a fixed **10,000-person local synthetic market** from those profile types. Each admitted person consumes one seat. National profile weights are not used to fill local seats.

**Potential visits** are choices in the reference environment. Their site and time are reference anchors, not booked or allocated screenings. **Baseline admissions** are simulated choices under the generated screening schedule and seat capacities. Visits across several dates are not the same quantity as distinct visitors. No result identifies a real purchaser or attendee.

The M0 UI selects either admissions or ticket revenue as its objective. Its edit penalty is zero. It does not execute the older seven-day app's revenue-minus-unmet-demand-and-change objective. Revenue is the sum of simulated paid ticket amounts; operating costs are absent. One DEMO unit equals 100 minor units.

The first baseline uses paths `0` or `0–19`, depending on the forecast-path control. Subsequent improvement comparisons use other paths. Compare candidates using the paired comparison panel, rather than subtracting values produced on different path sets.

## Explore a film, date and person

Use **Displayed result** to choose **Schedule-independent potential viewings** or **Realized viewings under the baseline schedule**. Both are simulated counts; “realized” here means seat allocation within the model. The timeline includes the full configured year. Scroll horizontally and select a film's title or release bar.

The film-detail panel shows daily mean visits, site totals, an individual audience list and, for an allocated result, its screening rows. Select a date bar or use the date dropdown; a zero-count date is still a valid display. Select the same date again, or choose **Show full period**, to clear the filter.

The chart is an average across the current result's paths. The person list is one sample path, so its count can differ from the chart's average. Person IDs such as `P00010` and input profile IDs such as `U00002` are different identities; several synthetic people can refer to one profile's input history. The list is searchable and paginated in groups of 50.

Select a person ID to inspect the dialog. It separates known synthetic historical **completed watches** from visits already simulated earlier in the selected path. Exposure, interest and ratings alone do not count as completed historical watches. A missing history does not prove non-viewing. The displayed daily film-choice probability and no-choice probability are model outputs, not measured individual behavior. Close the dialog before continuing.

## Improve the baseline schedule

In the follow-up task selector, choose **Find a better candidate from the baseline schedule** and select **Start schedule improvement** in the bottom bar.

The existing search shifts a screening's start time by ±30 minutes, replaces its movie, changes its format, swaps movies between same-day screenings, removes a screening, or adds its screening on another screen at the same site. It rejects invalid candidates before evaluation. Defaults allow at most eight rounds, 24 valid candidates per round, and two candidates for fuller evaluation. It stops if a round finds no improving candidate. This is bounded local search, not Bayesian optimization.

Search uses paths **100–103**. A coarse pass uses path 100; it still uses the full local person pool. Baseline and candidate are then compared on **20 unused paths, 200–219**, with common random conditions and matching input, reference, person-pool and initial-state hashes.

The panel reports candidate minus baseline and a paired 95% Monte Carlo interval. A strictly positive lower endpoint recommends the candidate. Otherwise the panel recommends retaining the baseline. You can inspect the candidate timeline even when it is not recommended; its presence is not evidence of improvement. The interval describes simulation variation under the assumptions, not real forecasting error or causal uplift.

## Apply a film-response shock and replan

Choose **Compare re-programming after a response change** in the results task selector. For the supplied fixture use:

| Input | Value |
|---|---|
| Replanning date | `2027-01-03` |
| Movie | `A` / Stellar Voyage |
| Response-intensity multiplier | `0.2` |

The multiplier scales movie intensity from that date onward. It is not a command to reduce admissions or revenue by exactly 80%. The input must lie between 0 and 5. The date must be strictly inside the configured planning horizon.

Select **Apply shock and start replanning**. The comparison produces three states on the same 20 validation paths:

1. Before shock, original schedule.
2. After shock, original schedule.
3. After shock, replanned schedule.

The replanning difference is **state 3 minus state 2**. The shock difference is **state 2 minus state 1**. Keep these separate. The source freezes screenings and the selected baseline path's synthetic visit records **before** the replanning date; it also preserves any known confirmed reservations and their payments. This fixture starts with no reservations. The frozen past is a synthetic demonstration prefix, not newly observed customer history. The M0 default pack does not automatically impose the older app's 48-hour protection rule.

Comparison values cover the whole configured period conditional on the same frozen prefix. Future choices and schedules may change. Editing shock inputs does not update a previously displayed comparison until it is executed again.

## Repeatability, cancellation and validation work

Reopen the app for an independent case. The generated workload has fixed seeds; within a comparison, candidate and baseline share the required random paths. Changing inputs clears prior results and requires another run. **Save inputs** and **Restore saved movie-first inputs** use a browser-local Movie First store; they do not migrate the older annual app's results or provide a resumed computation checkpoint.

**Download reproducibility manifest** and **Download computed results** save the inputs/paths and complete computed payloads for inspection. These files do not resume an interrupted Worker or imply an independently verified business outcome.

Cancel terminates the current Worker calculation and retains input for deterministic replay. Starting again recalculates from the beginning. No timing guarantee or completed offline-file check is asserted here.

Before this replaces the current public audience case, record actual English-build HTTP observations for valid import, baseline completion, individual-history exploration, candidate recommendation, and all three shock states. Add an invalid CSV case and operating-rule boundary cases. The current seven-day editor's 10:30/09:00/08:30 examples are not M0 UI actions and should not be reused as its evidence.

## Required changes to the seven-section problem definition

| Existing section | Change required for M0 promotion |
|---|---|
| 1. Decision, Scope & Problem Structure | Define the movie-first scheduling decision, default annual horizon, small catalog's exclusive release windows, fixed 10,000-person local market, and the selected known-input cutoff. Replace the seven-day editor scope. |
| 2. Computable Problem | Define feasible screenings and admissions or ticket-revenue objective with zero UI edit penalty. Separate reference potential demand, greedy initial coverage, seat-constrained evaluation and searched candidates. Document operating hours, runtime plus cleaning, formats, capacities, release/knowledge rules and preserved bookings. Remove the legacy unmet-demand/change objective and automatic 48-hour claim. |
| 3. Information & Uncertainty | List movie metadata and feature provenance, synthetic profile histories/frequency, operational rules, prices, bookings, available signals and unknown real attendee identity. Explain the reference-frequency calibration, annual versus unique-visitor units, no future-information projection, and why purchase accounts do not identify people. |
| 4. Alternatives & Selected Approach | Describe M0's explicit intent rules, reference forecast, packing heuristic, bounded local search and separate Monte Carlo validation. State that BO and a learned M1 graph model are alternatives, not executed engines. |
| 5. Demonstration & Evaluation | Replace legacy controls, fixtures and numerical evidence with `Movies.csv`, M0 inputs, full configured horizon, displayed modes, paired 20-path comparisons, three shock states, frozen-prefix evidence and actual executed normal/boundary/failure records. Keep unexecuted checks visibly pending. |
| 6. Client Proposal | Keep the original 59-slide English anonymized conceptual proposal as the primary presentation, but label broader design plans and prepared illustrations separately from M0's demonstrated mechanisms and measured synthetic outputs. Define a scoped validation pilot before operational adoption. |
| 7. LLM Review & Key Revisions | Record the promotion from seven-day legacy to M0, the exact CSV filename requirement, exclusive end dates, annual-horizon limitation, objective/unit corrections, independent search/validation paths and remaining untested claims. |

## Source basis

Reviewed without executing the UI: `src/components/annual/MovieFirstApp.tsx`, `MovieFirstTimeline.tsx`, `MovieFirstAudienceDetail.tsx`, `ScheduleComparison.tsx`; `src/annual/movieFirst/{movieFirst.worker,adapter,types,reference,demand,allocate,improve,evaluate,replan,workflow,rules,simulate,storage}.ts`; `src/annual/inputs/calendarImport.ts`; `src/annual/domain/time.ts`; `src/synthetic/annual/workload.ts`; and the classroom fixture `student/audience/Movies.csv`. The private original source basis predates the packaging-added inline sample and navigation controls.
