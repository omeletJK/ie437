# Ch 4 Frontier: three walls + lab papers

*Ch 4 ends with a \"Frontier\" section (three walls of BO) that places SILAB's own papers in the research streams — where the lab list lives and how to keep it accurate*

On 2026-10-07 the professor asked for Lecture 4 to end with BO's representative challenges and the
research streams that answer them — **kernel choice, high-dimensional input, GP training on many
data** — with the lab's own papers explained inside that flow. It is the `## Beyond the textbook loop
— three walls…` section (short `FRONTIER`), between Act 4's check quiz and `## Closing`. The old Act 4
slide "Two different scaling limits" was folded into it and removed.

Widget `deck/widgets/bo-frontier.js`: `map` (swimlanes × eras; `{"view":"lab"}` walks the lab thread
①–⑨), `kernel` (same 7 points, SE / Matérn-1/2 / periodic fitted by marginal likelihood → next x
0.08 / 0.45 / 0.82), `dim` (cell counting, the professor's own framing: 10 cells per variable, one
experiment per cell — a segment of 10, a square of 100, a cube of 1 000, then bars to 10²⁰
against a ~100-experiment BO budget), `data` (400 points, exact vs m
inducing points). Each "Wall" has a widget slide and a stream table with an "Our lab" column;
Gómez-Bombarelli et al. 2018 (latent-space BO, paper Figures 1 and 4a in `assets/ch04/latent-bo-*`)
and DiBO (ICML 2025) each have their own slides.

**Why:** the professor wants students to see where the lab's work sits; the lab list is
https://silab.kaist.ac.kr/publications-2/ and every description was written from the papers'
abstracts — Bayesian Ascent's abstract is publisher-elided, so its text rests on the SHM 2015
proceedings abstract and search summaries.

**How to apply:** when the lab publishes something relevant, add it to `NODES` in `bo-frontier.js`
(lab nodes carry `n` = thread order and a `long` text) *and* to the matching md table. Do not claim
results beyond the abstract. Contextual multi-objective BO (Song, Park & Park) was "under review" as
of 2026-10-07 — check before calling it published. Chip clicks must call `ev.stopPropagation()`:
a widget that re-renders on click detaches the target, and the deck's stage handler then reads the
click as "next slide". See [ch04-mobo-restored-diagrams](ch04-mobo-restored-diagrams.md).
