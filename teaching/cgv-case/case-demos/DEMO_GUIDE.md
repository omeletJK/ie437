# IE437 instructor demonstration guide

Start by opening `index.html` in a modern desktop browser. It links to both English slide decks, both interactive demos and the accompanying teaching documents. You can also open `response-demo.html` or `audience-demo.html` directly. Both demos contain their supporting HTML, styles, scripts, synthetic examples and presenter notes. A server, dependency installation, API key and internet connection are unnecessary.

For use on another classroom computer, unzip `IE437_Classroom_Case_EN.zip`, keep its files together, and open `index.html`. The package contains local slide copies, demos, the problem-definition companion, instructor review, this guide and the checksum manifest. The slide copies are identical to the canonical English decks; optional web fonts fall back to system fonts offline. Build scripts, QA images and student assignment assets are excluded.

These are instructor reference examples, separate from the student assignment materials. All displayed outcomes are illustrative synthetic results. They establish how the examples behave; they do not establish real forecasting accuracy or commercial impact.

The selector at the top opens a demonstration directly. **Reset** reloads the current example and resets its state. The original controls remain available: **F** fullscreen, **N** presenter notes, **S** full/compact presentation path, arrow keys to reveal or advance, and **P** print. A browser may require permission for the presenter popup. Moving away and returning also resets each example. In the response search, the dedicated reset button can start a second run.

The toolbar identifies what each view actually executes. **Executed** means calculations or sampling run in the browser. **Prepared** means the view displays predefined example values or a storyboard. Every view uses synthetic data.

## Response model and schedule optimization — about 8 minutes

This example evaluates candidate schedules with a response model. The implemented search is deterministic iterated local search (ILS), rather than Bayesian optimization. It does not contain a probabilistic surrogate or acquisition function.

| Example | Actions | Expected result | Discussion point |
|---|---|---|---|
| [Response and cannibalization](response-demo.html#s06) | Compare 19:00 / 300 seats / 5 screenings with 14:00 / 120 seats / 2 screenings. | Stored example values: first setting 1,050, −340, 4,110; second setting 380, −60, 3,720. | Illustrate acquisition and movement between films using a predefined response table. |
| [Potential vs realized demand](response-demo.html#s07) | Switch Schedule A to B. | Potential demand stays 5.0M; realized attendance changes from 1.20M to 0.90M. | A film-level forecast is not a schedule outcome. |
| [ILS search](response-demo.html#s13) | Select 4× speed, then run the search. Inspect a site to see its timetable. | Baseline 5,134 → best 5,265 (+2.6%); 2,600 iterations, 1,739 response-model calls, 0 constraint violations. | The optimizer repeatedly calls the response model under feasibility constraints. |
| [Booking signals and freeze](response-demo.html#s17) | Select the successive update days. | Weak signals do not trigger a change; later changes affect unopened screenings. | Stability and frozen commitments constrain recourse. |
| [Rolling horizon](response-demo.html#s18) | Step one day, then play four weeks. | Final cumulative gain +2.8%; 11 schedule changes. | Predictions update while the committed portion of the schedule remains fixed. |

Use **Reset** before repeating the search. The rolling example takes about 15 seconds to play; its figures are outcomes of the embedded synthetic model.

## Synthetic individuals and choice simulation — about 8 minutes

The same individuals and their history state remain in the simulation while the movie set or schedule changes. The examples distinguish desire, feasible opportunities, actual choice and population totals.

| Example | Actions | Expected result | Discussion point |
|---|---|---|---|
| [Daily viewing paths](audience-demo.html#s09a) | Step a day, or run automatically; use “Finish” to complete all four paths. | Four paths × 28 days; Movie A is watched in 3/4 paths, giving 0.75. | Frequency, recovery, competing movies and “No Movie” shape viewing events. |
| [Forecast evidence update](audience-demo.html#s10) | Change the horizon from Annual to T−2W. | Annual 3.6M [2.5M, 5.0M] → T−2W 4.5M [4.1M, 4.9M]. | New evidence changes the forecast and its illustrative range. |
| [Individual profiles](audience-demo.html#s12) | Select User 9,077. | Movie A 61%, Movie B 44%, Movie C 18%. | Individual movie desires are not mutually exclusive final choices. |
| [Schedule A/B](audience-demo.html#s22) | Select Schedule B. | Stored outcomes: attendance 31,420 → 34,180; revenue 410M → 448M in the example’s displayed units; four prepared audience-movement flows. | Illustrate new attendance vs substitution using prepared values, without executing a new prediction. |
| [Illustrative search storyboard](audience-demo.html#s23) | Play the candidate animation. | Prepared scores 4,820 → 5,265; six candidate frames; illustrative count 60,000 viewer-runs. | Explain same-population evaluation. The counter is computed from the frame index; no audience rerun or optimization occurs here. |
| [Rescheduling](audience-demo.html#s25) | Select the later update step. | Future screening blocks change; frozen commitments remain visible. | Simulation output can inform constrained future decisions. |

The candidate animation on slide S23 displays six prepared scores and prewritten schedule changes. It explains evaluation and search and does not execute optimization or 60,000 audience evaluations. S22 also selects predefined outcomes. The individual profile probabilities and horizon distributions are prepared examples. In contrast, S09A executes seeded daily Monte Carlo sampling, and the response example’s S13 executes its deterministic ILS calculations in the browser.

## HW1 normal, boundary and failure cases

The **HW1 case checks** button opens a separate supplemental feasibility calculation in either file. Its teaching assumption is fixed, non-overlapping slots: capacity = number of screens × slots per screen, with one requested screening per slot. It does not call or validate the original ILS/choice engines.

| Preset | Screens | Slots per screen | Required screenings | Expected behavior |
|---|---:|---:|---:|---|
| Normal | 2 | 3 | 4 | Feasible; capacity 6, unused slots 2. |
| Boundary | 2 | 3 | 6 | Feasible exactly at capacity; unused slots 0. |
| Failure | 2 | 3 | 7 | Infeasible; never reported as a valid schedule. |

The three inputs are editable. Negative, fractional, empty, or unsafe numeric inputs produce an explicit input error. Zero capacity with zero required screenings is feasible in this fixture; zero capacity with a positive request is infeasible. These cases use invented teaching inputs and establish only this arithmetic rule.

## Existing full application — optional instructor preparation

The repository also contains a prebuilt application in `dist/`, with a seven-day interface at `/legacy.html`, an annual interface at `/annual.html`, and a newer movie-first route at `/?model=movie-first`. Its interface includes Korean text, so the two standalone English files above are the classroom-ready path.

The full application uses ES-module Workers and browser storage. It needs a local HTTP server; opening its HTML with `file://` is unsupported. The project documents Node 24.4+ and pnpm 10.17.1 for rebuilding. With dependencies already installed, the documented local commands are `pnpm build` followed by `pnpm preview --host 127.0.0.1 --port 4173 --strictPort`. Existing `dist/` can instead be served by a local static server. The default annual workflow requires generating an audience, applying a film/schedule input, confirming settings, and then running the simulation. No network API or API key is required after setup.

The older annual simulation and the newer movie-first model have different validation status. Existing annual results must not be presented as evidence that a new movie-first or graph model has been validated. Large workloads are unnecessary for the lecture examples secured here.

## Reproduction and verification

`manifest.json` records each canonical source checksum, exact standalone output checksum, deep links and method. To refresh from the canonical English files, run `node teaching/ie437-case-demos/build-demos.mjs` from the repository root, then run `node teaching/ie437-case-demos/verify-demos.mjs`. The verification checks the preserved source topology and calculations, original controls, anonymization, offline execution, selector/reset, and representative deterministic results. Rebuilding intentionally changes output checksums when the canonical source changes.
