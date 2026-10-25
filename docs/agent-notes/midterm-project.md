# Midterm project — a two-week take-home in the Assignment 1 form

*How the IE437 midterm was shaped on 2026-10-19, what it asks, and the rules for editing it before the deadline.*

The midterm (30% of the grade) is a **two-week individual take-home project in the form of
Assignment 1**: a Markdown problem definition, the code behind it, an offline HTML demo and a
proposal, graded by a public rubric plus instructor-only hidden points. Released Mon 2026-10-19
10:00 KST, due **Mon 2026-11-02 10:00 KST**, one ZIP (at most 200 MB) per student on KLMS.

Subject: a nationwide convenience-store chain deciding how many distribution centres to run and
where. The lower level is one centre's daily routing on actual road travel distances; the connection
is `evaluated_by`; the upper level is the number and location of centres, searched under an
evaluation budget. The formulation and solution-algorithm plan, plus an explicit
fidelity-vs-computation balance, carry 60 of 100 points; `code/` is required. The brief prescribes
methods from Lectures 1, 2, 4 and 5 (R1–R5); Lectures 3 and 6 earn bonus only.

Decisions, in order, all on 2026-10-19:

- As hard as or slightly harder than Assignment 1, and using as much lecture content as possible —
  hence prescribed methods, where Assignment 1 had prescribed none.
- One industry for everyone and the nationwide scale kept (10,000 stores, 12 centres). A
  per-student industry menu and a city-only version were rejected as artificial.
- v2.0: rivers and mountains are not a trap to plant; the core is routing on real road distances,
  so the barrier requirement went and R3 became "measure the G–E gap and name its cause". No
  instructor data package: the brief specifies the company's eight tables and students instantiate
  them from a seed, obtaining road distances themselves (OSRM allowed, cached in `code/`).
- v2.1, after a student's-eye review: teaching defaults (§2.6), a thinning rule (§2.7: thin
  nationwide, never one region), three routes to road distances, a 12-month demand history, a 98%
  before-noon service level, a random-selection comparison at equal budget, an approach-and-AI
  section (§5) with a stuck-table, and the demo as static HTML or a local app.
- v2.2, after a review as five students of different majors: thinning's two distortions, plausible
  placement of current centres and candidate sites, the reported search as one fresh run from logged
  seeds, the time window as constraint or penalty with the realised service level reported, an
  at-a-glance box, a glossary, hints for R2 and R3, a 40–60 h estimate and a day-7 self-check.

Where it lives: `teaching/midterm-depot-network/student/` (English, published);
`md/_ASSIGNMENTS.md` entry with `kind: midterm`, which gives it its own Midterm section and tab and
the ZIP `IE437-Midterm-Project.zip`; `md/_SYLLABUS.md` says take-home project; a pinned notice in
`md/_ANNOUNCEMENTS.md`. The instructor side — the grading guide with the hidden points, the
preparation notes and a dry-run — is gitignored and kept by the professor.

**Why:** Assignment 1 tested problem definition without prescribing a method; the midterm must test
the Ch 1–6 methods, and the hierarchical design-then-operation structure had been shown often in
class (the Ch 1 bilevel heater slides, the classification reference's robot example).

**How to apply:** the professor's standing wish is that it stays approachable — solvable by
reasoning and the course's tools, with AI encouraged for obstacles; keep that tone in any edit. Any
answer to a student question that changes the brief is published as a **new version** under Notices,
with the version bumped in both the brief and the catalogue. Change a deadline in both
`md/_ASSIGNMENTS.md` (`due`) and `student/assignment.md`. Write nothing into `student/` that
reveals how the hidden points are scored or what the instructor dry-run found. Open as of
2026-10-25: whether to add a mid-point checkpoint. Related: [landing-site](landing-site.md),
[html-lecture-notes-plan](html-lecture-notes-plan.md).
