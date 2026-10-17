# IE437 Assignment 1 — Movie Programming Worked Examples

Release 1.8 · English proposals, problem definitions and interactive demos

Use these examples to connect a written problem definition to a proposed solution and an executable operator workflow. Open [the case index](index.html). First explain [the one-page comparison](classroom-comparison.html): the course brief, added case inputs, model assumptions and implemented demo scope. Then read a problem definition, present its solution, and run its demo. Each case has one selected app.

| Case | Problem definition | Proposal | Demo and guide |
|---|---|---|---|
| A · Aggregate response and scheduling | [Read HTML](response/problem-definition.html) · [Download MD](response/problem-definition.md) | [44-section proposal](response/proposal.html) | [Response planning app](response/demo.html) · [Guide](response/demo-guide.html) |
| B · Individual synthetic audience | [Read HTML](audience/problem-definition.html) · [Download MD](audience/problem-definition.md) | [59-section proposal](audience/proposal.html) | [Movie-first M0 app](audience/demo.html) · [Guide](audience/demo-guide.html) |

The proposals preserve their original visual designs. Case A's third slide again shows the two operating workflows: demand forecasting and timetable programming. The presentations develop the cinema problem, model, decision strategy and operating loop. The brief-versus-case differences are summarized once on the separate comparison page. Detailed evidence and verification guidance remain in each Markdown definition and presenter notes. Meaningful modeling assumptions, constraints and evaluation methods stay beside the concepts they explain. Each `extended-proposal.html` is a byte-identical compatibility copy of its case's main proposal.

## Present and experiment

For Case A, explain why the timetable can change audience response, then open the app. Load [CinemaPlanning.json](response/CinemaPlanning.json) or [Screenings.csv](response/Screenings.csv), review the data and operating rules, confirm settings, run optimization and inspect/export results. **Load classroom sample** supplies the same complete package. The recorded default sample gives **4,969 → 5,247** expected attendance, gain **278**, **89 retained screenings**, **2,600 iterations** and **1,742 response evaluations**. Changing data or rules requires confirmation and a new run. The exported five-column timetable CSV can be reimported under the same planning definitions.

For Case B, prepare **2,000 profiles**, select **Load annual sample · 24 films**, confirm **Admissions** and **1 forecast path**, then start simulation. [Movies.csv](audience/Movies.csv) restores the existing simulator's annual sample: **24 distinct films across 2027**, with two new movies and overlapping windows each month. Inspect the annual timeline and film/date/person details, then optionally try schedule improvement or response-change replanning using the English guide. The fresh local HTTP baseline produced **9,576 potential viewings**, **5,536 realized viewings** and **7,467 showings**. Start with that one-path baseline; the separate 20-path comparisons require more calculation. The observed complete annual run took approximately **419 seconds** in the checked environment.

Use **All worked examples** to return to the index. On the course site, **Assignments → Assignment 1 → Open worked examples** opens the same materials. [Download the complete package](IE437-Assignment-01-Worked-Examples-EN.zip) to keep all definitions, proposals, demos, guides and planning samples together.

## Understand the implementation scope

The proposals describe a broader solution than the classroom apps. Case A executes an explicit aggregate response formula and deterministic ILS; response learning and Bayesian optimization are proposed extensions. Case B executes the M0 consumer-choice simulator; its broader M1 graph model is a proposed extension. All data and illustrated outcomes are synthetic. Different fixtures, horizons and units prevent comparing the two approaches by headline totals.

Case A's app and both proposals retain their release 1.7 content. Case B keeps the existing Movie First M0 simulator and restores its 24-film annual sample in the English operator flow. The [verification record](verification.html) separates fresh annual-sample checks from the historical two-film observations. The fresh local HTTP run completed the annual baseline; its public release check follows publication. Direct offline execution remains unverified.

## Shared resources

The package contains **31 allowlisted public files** plus its generated ZIP. [manifest.json](manifest.json) records exact delivered checksums. The [assignment brief](reference/assignment.md), [problem-definition template](reference/problem-definition-template.md), [classification reference](reference/problem-classification-reference.md) and [third-party notices](THIRD_PARTY_NOTICES.md) are included. Each demo embeds its calculation code and assets; Case B also embeds its Worker. No installation, login or API key is required. Private archives, authoring checks, instructor notes and actual student submissions remain outside publication.
