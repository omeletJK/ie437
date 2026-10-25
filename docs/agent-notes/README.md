# Agent notes — the decisions behind these decks

Carried over on 2026-10-25 from the memory of the agent that authored the decks, with everything
personal left out: no student names, grades or submissions appear here, and nothing of the
instructor-only material does. Dates are when each decision was made. Each note ends with **Why**
and **How to apply**; the second part is the one to follow. When a decision changes, update its
note in the same commit as the change, so a clone always carries the current rules.

## How the professor wants slides to teach — read before editing a deck

- [Demos: a literal count, not a derived statistic](demos-show-the-picture.md) — three curse-of-dimensionality demos were rejected; the professor asked for counting cells to fill the space (10^d)
- [Examples as pictures, not arithmetic](examples-as-pictures.md) — numeric worked examples in prose are hard to lecture; draw them, keep concept sentences
- [One figure format per story](one-figure-format-per-story.md) — related slides share the figure students met first (Ch 5 COMs → Act 1 chart); no panel ahead of its concept
- [Label every formula block](label-every-formula-block.md) — an unlabelled L_opt block read as "another interpretation"; say what a formula is and where it is used, then show the mechanism
- [One term, one picture](one-term-one-picture.md) — losses built term by term get one panel per objective, revealed with the term; the \htmlClass{frag} trick for growing an equation
- [Simplify confusing slides: picture + one keypoint, algebra to appendix](simplify-confusing-slides.md) — the Lec 5 p.30–31 merge the professor asked for, and the two map files to renumber when headings merge
- [Papers serve the flow](papers-serve-the-flow.md) — no paper tours; cite only famous papers that carry a step of the core argument

## Decisions about the course, the repository and the packages

- [IE437 HTML lecture notes — plan](html-lecture-notes-plan.md) — the four authoring decisions, pilot-then-rollout status, and the lecture-numbering drift to watch
- [IE437 distribution site](landing-site.md) — the landing-page decisions, and what still blocks going live
- [IE437 git identity: noreply address](git-identity.md) — the repo commits as the GitHub noreply email because the account blocks private-email pushes; never switch it back
- [QA: the visual pass without Playwright browsers](qa-visual-pass.md) — what to check per slide (footer clearance is not enough: check block overlap), and launching Chrome when Playwright has no browser
- [Ch 4 MOBO: restored source diagrams](ch04-mobo-restored-diagrams.md) — multi-objective slides minimise on purpose, as the source does; do not flip back to maximisation
- [Ch 4 Frontier: three walls + lab papers](ch04-frontier-lab-papers.md) — where the lab-paper map lives, how to add papers, and the re-render click trap
- [Ch 5/6: streams with representative papers](ch05-ch06-streams.md) — Ch 5 conservatism / uncertainty / system knowledge; Ch 6 four intervention points G1–G4; both rewritten and committed 2026-10-13
- [Midterm project — a two-week take-home in the Assignment 1 form](midterm-project.md) — what it asks, the decisions behind v2.0–2.2, due 2026-11-02 10:00 KST, and the rules for editing it before the deadline

The agent brief for building a whole chapter is `md/_AGENT_BRIEF.md`; the handoff chain is
`md/_CHAIN.md`; the markdown schema is `md/_SCHEMA.md`. Start from `CLAUDE.md` at the repository
root.
