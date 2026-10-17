# IE437 Assignment 1 — Two worked examples

Version 1.4 · English proposals, independent demo sites and guides

Open `index.html`. Each case provides a **Markdown problem definition, interactive demo and proposal**. The original presentation designs are preserved in English with anonymized case labels. There is one selected demo per case.

| Case | Proposal | Selected demo | English instructions |
|---|---|---|---|
| A: Aggregate response and scheduling | [44-slide original presentation](response/proposal.html) | [Response Model Simulator](response/demo.html) | [Demo guide](response/demo-guide.html) |
| B: Synthetic audience simulation | [59-slide original presentation](audience/proposal.html) | [Latest movie-first M0 app](audience/demo.html) | [Demo guide](audience/demo-guide.html) |

Each proposal includes appendices and its original compact presentation route. The adjacent `extended-proposal.html` files are byte-identical compatibility copies. Editable definitions are [Case A Markdown](response/problem-definition.md) and [Case B Markdown](audience/problem-definition.md), with readable HTML versions beside them. The full 44/59-slide proposal files are unchanged from the preceding release.

## Classroom route

1. Introduce the cinema-programming decision and available purchase-record specification, then present the original Response proposal.
2. Open Case A's **Response Model Simulator** and select **Reset**. Keep the default exchange: **Site D / Screen 2 / Film A / 11:05** with **Site D / Screen 3 / Film F / 20:15**, and **Additional gap before the first screening** at **0**. Choose other actual screenings or change the gap to make another draft.
3. Compare the original/draft timetables, affected predictions and model factors. The default draft reduces the synthetic score **5,134 → 4,969 (−165)**. Select **Apply this timetable**, then **Run search** or **Finish search**. The verified best is **5,302**: **+333 from the applied edit**, **+168 from the original**, with 90 screenings, 2,600 iterations, 1,711 response evaluations and feasibility **PASS**. Inspect the three-way comparison, applied/best site timetables and heatmap; **Export results** saves all three plans and factors. Closing-time shift checks remain in the collapsed auxiliary section, rather than the main experiment.
4. Present the original Synthetic Audience proposal, then open Case B's movie-first app. Prepare **2,000 profiles**, continue to movies, and select **Load classroom sample**. Confirm objective and constraints, then run the simulation.
5. Inspect potential viewings and baseline admissions. Explore a film, date and person; then compare schedule improvement or a film-response shock and replanning. Compare the definitions' boundaries, units, baselines, constraints and information requests.

**All worked examples** in a proposal, app or document returns to the landing page. **Demo guide** opens each app's English instructions. Landing and reading views reuse the course portal CSS and embedded fonts. Case A's simulator uses the same portal styling; the original proposal designs are retained.

## How the two evaluators differ

Case A packages the original proposal's **SIM2 aggregate-response engine** as an independent simulator. A synthetic one-day fixture has six films, six sites and 18 screens; the default baseline and best-found schedule each contain 90 screenings. An explicit assumed rule calculates expected attendance for each screening from film strength, site preference, start time, room size, nearby-screening interaction and capacity, then sums it. It creates no individual audience population. The editable exchange preserves film counts but repacks affected screens when film runtimes differ. The response table includes every affected prediction, including unchanged screenings affected by nearby competition. Its search is deterministic **Iterated Local Search (ILS)**. The original proposal's learned response model and BO are future methods, not implemented engines here.

Case B retains the latest existing **movie-first M0** app byte-for-byte. It computes synthetic individual movie intent, reference potential demand, feasible baseline allocation, seat-constrained outcomes, local improvement and reaction-shock replanning. Its objective is admissions or synthetic ticket revenue. The proposed learned graph model is a research extension.

| Feature | Case A: Aggregate response | Case B: Synthetic audience |
|---|---|---|
| Evaluator | Screening-level expected-attendance rule, interactions and capacity caps | Individual movie/no-choice behavior, histories, availability, budgets and seats |
| Population | No individual person pool | Fixed 10,000 synthetic local people represented from profile types |
| Reported units | Rounded synthetic expected-attendance score | Simulated visit events or ticket-only DEMO revenue |
| Search evidence | Best found by deterministic ILS; no global guarantee | Bounded local search and separate paired simulation paths; no real-market validation |

The fixtures, horizons and units differ, so their totals cannot rank the approaches. Assumed coefficients, profiles, histories, movies and outcomes are synthetic. Improvements are not measured business effects. These instructor-authorized worked examples are separate from actual student submissions; a smaller justified scope can also address the assignment.

## Sharing and reproduction

Download the package ZIP, extract it and keep its folder structure. Case A embeds its calculation code; Case B embeds its app and computation Worker. Neither requires installation, login or an API key. Current checks and remaining items are documented in [verification.html](verification.html). The exact 1.4 Response build passed 27 Node checks and its default exchange/search/replay, rejection and responsive HTTP checks. The export record distinguishes the actual download from a later CSS-only adjustment. Release 1.4 assembly, course staging/build, worked-example and assignment checks passed. Fresh HTTP checks under the course prefix opened the exchange demo, guides, definition view and original proposals, and their return links reached the hub; Course portal and Open worked examples completed the Assignment 1 round trip. Direct-from-disk offline browser execution remains unverified.

For Case B, [Movies.csv](audience/Movies.csv) is also embedded in **Load classroom sample**. The importer requires that filename. Its two films are active January 1–4, 2027; the configured horizon remains the whole 2027 year.

The public allowlist contains **27 files**. [manifest.json](manifest.json) records delivered sizes and checksums. [Library and font notices](THIRD_PARTY_NOTICES.md) retain attribution for **11 libraries and three font families**. The [assignment brief](reference/assignment.md), [seven-section template](reference/problem-definition-template.md) and [classification reference](reference/problem-classification-reference.md) are included. Earlier release 1.2 apps and private authoring material are excluded, along with grading notes, student work and customer records.
