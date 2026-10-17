# IE437 Assignment 1 — Movie Programming Worked Examples

Release 1.6 · English proposals, problem definitions and interactive demos

Use these examples to connect a written problem definition to a proposed solution and an executable operator workflow. Open [the case index](index.html), read a problem definition, present the proposal, then run its demo. Each case has one selected app.

| Case | Problem definition | Proposal | Demo and guide |
|---|---|---|---|
| A · Aggregate response and scheduling | [Read HTML](response/problem-definition.html) · [Download MD](response/problem-definition.md) | [44-section proposal](response/proposal.html) | [Response planning app](response/demo.html) · [Guide](response/demo-guide.html) |
| B · Individual synthetic audience | [Read HTML](audience/problem-definition.html) · [Download MD](audience/problem-definition.md) | [59-section proposal](audience/proposal.html) | [Movie-first M0 app](audience/demo.html) · [Guide](audience/demo-guide.html) |

The proposals preserve their original visual designs. Case A's third slide again shows the two operating workflows: demand forecasting and timetable programming. The presentations develop the cinema problem, model, decision strategy and operating loop. Detailed classroom assumptions, evidence boundaries and verification guidance are in each Markdown definition and presenter notes. Meaningful modeling assumptions, constraints and evaluation methods stay beside the concepts they explain. Each `extended-proposal.html` is a byte-identical compatibility copy of its case's main proposal.

## Present and experiment

For Case A, explain why the timetable can change audience response, then open the app. Load [CinemaPlanning.json](response/CinemaPlanning.json) or [Screenings.csv](response/Screenings.csv), review the data and operating rules, confirm settings, run optimization and inspect/export results. **Load classroom sample** supplies the same complete package. The recorded default sample gives **4,969 → 5,247** expected attendance, gain **278**, **89 retained screenings**, **2,600 iterations** and **1,742 response evaluations**. Changing data or rules requires confirmation and a new run. The exported five-column timetable CSV can be reimported under the same planning definitions.

For Case B, prepare **2,000 profiles**, load the classroom movie sample, confirm **Admissions** and **1 forecast path**, then start simulation. The [Movies.csv](audience/Movies.csv) films are active January 1–4, 2027; the configured horizon is the full 2027 year. The recorded sample gives **757 potential viewings**, **726 baseline realized viewings** and **241 showings**. Inspect film/date/person details, then optionally try schedule improvement or response-change replanning using the English guide.

Use **All worked examples** to return to the index. On the course site, **Assignments → Assignment 1 → Open worked examples** opens the same materials. [Download the complete package](IE437-Assignment-01-Worked-Examples-EN.zip) to keep all definitions, proposals, demos, guides and planning samples together.

## Understand the implementation scope

The proposals describe a broader solution than the classroom apps. Case A executes an explicit aggregate response formula and deterministic ILS; response learning and Bayesian optimization are proposed extensions. Case B executes the M0 consumer-choice simulator; its broader M1 graph model is a proposed extension. All data and illustrated outcomes are synthetic. Different fixtures, horizons and units prevent comparing the two approaches by headline totals.

Both app files are unchanged from release 1.5. That public release was built and deployed through GitHub Pages, and both complete default app workflows, direct MD downloads, proposals, guides and the 29-file ZIP were checked on the public site. The [verification record](verification.html) separates those numerical/browser checks from this release's presentation revision. Direct offline execution remains unverified.

## Shared resources

The package contains **29 allowlisted public files** plus its generated ZIP. [manifest.json](manifest.json) records exact delivered checksums. The [assignment brief](reference/assignment.md), [problem-definition template](reference/problem-definition-template.md), [classification reference](reference/problem-classification-reference.md) and [third-party notices](THIRD_PARTY_NOTICES.md) are included. Each demo embeds its calculation code and assets; Case B also embeds its Worker. No installation, login or API key is required. Private archives, authoring checks, instructor notes and actual student submissions remain outside publication.
