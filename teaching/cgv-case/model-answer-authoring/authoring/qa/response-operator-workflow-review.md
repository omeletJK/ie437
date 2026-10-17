# Case A operator workflow: read-only implementation notes

Reviewed 2026-10-11. This file changes no product, source app, generator or course file.

## Actual Case B visual structure

The packaged Movie-First app imports `src/styles/tokens.css`, `src/styles/global.css`, `src/components/annual/annual.css`, `timeline.css` and `workflow.css`. `build-apps.mjs` retains these layouts; its classroom changes translate labels, embed the CSV/Worker, add normal-flow return/guide links, and remove the previous-app link. The app interior is light, with a dark sidebar. It is not the dark portal interior used by the current Response Model Simulator.

- Tokens: background `#f7f7f5`, surface `#fff`, ink `#17181c`, muted `#6b7280`, border `#e5e7eb`, primary `#6d4aff`, primary wash `rgba(109,74,255,.08)`, error `#c84646`.
- `.console-shell`: two columns, `224px minmax(0,1fr)`. `.sidebar`: sticky top, full viewport height, dark `#15161a`, padding `28px 18px 20px`, vertical flex.
- Sidebar: brand, public return link, demo-guide link, numbered step buttons. Active step uses `#292931`/white text and `#b9a9ff` number. Invalid future steps are disabled, and running jobs block navigation.
- `.workspace` has `min-width:0`; `.annual-topbar` has a synthetic badge, workflow summary and model label; its minimum height is 68px. `.page` uses `38px 40px 56px`, max-width 1600px; annual overrides top padding to 30px.
- `.page-heading`: short kicker, 30px title, explanatory sentence. `.panel`: white, 1px border, radius 6px, padding 22px. `.annual-form-grid`: two equal columns, 15px gap. Form labels are 12px; inputs/selects minimum 40px, radius 4px.
- `.annual-workflow`: ordered strip with numbered, titled, subtitled steps. Current cell uses `#f0eaff` and a purple 3px top inset. Four-step Case A must change the five-column grid and footer denominator to four, rather than leaving an empty fifth column.
- `.annual-actionbar`: fixed bottom, left 224px, right 0, z-index 20, minimum 96px, white surface/top border, step context and hint at left, back/cancel/primary buttons at right. Primary is at least 204px wide and buttons at least 44px high. `.annual-page` reserves 155px bottom space so results and controls remain accessible.
- At ≤1100px: sidebar/footer left 76px, page padding `28px 24px`, footer primary width 180px, workflow subtitles hidden. At ≤760px: sidebar in document flow, step sidebar nav hidden, footer left 0/wrapping, page bottom reserve 230px, forms one column. The later mobile override makes the workflow strip two columns.

Reusable source boundaries: `MovieFirstApp.tsx` render at lines 99–121, `AnnualWorkflow.tsx` `WorkflowActions` at lines 24–34, and `workflow.css` `.annual-workflow`/`.annual-actionbar`/responsive rules. Scope the light variables to the operator workspace if the shared portal header remains; otherwise shared `--ink` and `--bg` names would change its colors too. Existing embedded Inter/IBM Plex Mono/Space Grotesk can remain without a font CDN.

## Four functional Case A steps

1. **Load planning data**: upload an actual planning JSON package and/or schedule CSV; classroom sample uses the identical parser. Parse and validate before replacing the accepted dataset. Show filename, schema version, sites, films, screens and screenings. A decorative filename display does not meet the request.
2. **Review data and settings**: expose the imported timetable and declared response inputs; edit opening, closing, cleaning and search iterations; require confirmation. Any change makes previous optimization/results stale until the current dataset/settings have been validated.
3. **Evaluate and optimize**: evaluate the loaded reference using the preserved aggregate predictor, optionally apply the paired film experiment, then run the bounded ILS with the configured iteration budget. Show the actual retained search start, best, evaluations and feasibility state.
4. **Inspect results**: original → applied → searched comparison, per-site totals, timetable/factor details and detached JSON export, including exact input/configuration and reproduction metadata. Return/back actions should preserve the loaded data and invalidate results only when inputs change.

## Engine implications and independent verification

The 12 numerical functions can retain identical ASTs while an adapter assigns validated `SITES`, `FILMS`, `OPEN`, `CLOSE`, `CLEAN`, `ITERS` and `SPAN`. The current code assumes exactly six films, six sites and three screens per site. `ruleBaseline` uses fixed film indices and `predict` allocates a six-element site-total vector, so variable-size datasets require additional numerical changes. Either retain an explicit fixed-size schema initially or treat generalization as separate work.

`presolve` has its own literal 2,600 loop, independent of `ITERS`. If imported references are accepted directly, do not silently replace them through presolve; the uploaded timetable must be the original reference. If synthetic sample generation still uses presolve, label that preparation separately from the configured search budget.

`packSite` checks closing but does not reject a negative offset or gap. The adapter must validate opening ≤ closing, nonnegative integer cleaning/gaps/offsets, finite positive seats/runtimes, five-minute start grid, index/identity uniqueness, room rules and non-overlap before calling the original feasibility function. For explicit CSV starts, derive the next gap from `startMinute - ceil((previousEnd + cleaning)/5)*5`; reject negative values rather than silently repairing the user's timetable. The first offset is `firstStart - opening`.

`TP`, 17:00 daytime cutoff and 18:00 prime cutoff remain absolute clock assumptions. Changing operating hours does not refit the response curve. Validate the configured domain does not yield negative time weights, and state these synthetic fixed response assumptions. Current manual mini-timetable controller hardcodes opening 600, span 880 and axis 10:00/17:20/24:40; those display constants must follow exported fixture values when configuration becomes editable.

The private verifier currently assumes the sample fixture 6×3×6, 2,600 search iterations, opening/closing 600/1480 and stable sample IDs. Keep those as a regression fixture, then add configuration/import checks rather than replacing all expected numbers with loose assertions:

- Sample uploaded through the real parser reproduces its 5,134 baseline and default manual/search path 4,969→5,302.
- A changed schedule row or response parameter in the file changes the actual evaluated reference/result; the export reports that same accepted dataset.
- Configured opening/closing/cleaning/iteration budgets appear in export and drive independent feasibility/packing/termination audits; budget does not merely change a UI label.
- Imported reference rows survive exactly (stable IDs and starts), without hidden presolve. Film/taste/base inputs are independently reconstructed in response factors.
- Malformed JSON/CSV, unknown IDs, duplicate rows, invalid numeric values, room conflicts, overlapping or out-of-window starts reject without replacing the last valid accepted dataset. Failed imports return no valid score.
- Changing confirmed data/config clears retained run/results or marks them stale and blocks search/export until re-evaluation; reset retains the currently loaded dataset/settings rather than reverting invisibly to the original sample.
- Identical accepted files/settings/seed/entry path exactly repeat; returned exports remain detached from internal model/reference state.

The existing string-rendered timetable/grid inserts site/film labels into HTML. Keep constrained IDs/labels or escape imported text before rendering arbitrary labels. File metadata alone must never determine the expected score. No Bayesian optimization, individual consumer population or learned aggregate model is introduced by this workflow adapter.
