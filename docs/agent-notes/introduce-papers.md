# Introduce a paper: why it is here, what it is, why it matters

*A slide that introduces a paper says why the lecture reads it, what kind of paper it is, and what it changed. It does not just put the authors in the subtitle and start on the mechanism.*

On 2026-10-26 the professor reviewed Ch 6 and found that its paper slides did not say three things:
- why each paper was being introduced;
- what kind of paper it was;
- what its significance was.

The slides named the authors and venue in `sub:` and went straight into the method. The reasons sat only in the clickable `mbo-papers` widget and in the appendix reading guides.

Instruction: "왜 그 논문을 소개하는 지, 해당 논문은 어떤 논문이고 어떤 의의가 있는지 … 전체적으로 보완해주라."

Applied to Ch 6 the same day, with a new block, `::: paper` (see `md/_SCHEMA.md`). It is a band of three cells under the title:
- **Why it is here** — the step of this lecture's argument the paper carries;
- **What it is** — the field, the group, and the problem the paper solved;
- **Why it matters** — what it changed, with one checkable fact, such as a result, an award, or a benchmark it became a baseline of.

`sub:` carries the quoted paper title, the authors and the venue.

Ch 6 has 17 cards. They cover VAE, DDPM, Gómez-Bombarelli, CbAS, GFlowNet, BootGen, the CVAE, MINs, classifier-free guidance, DDOM, GTG, wind farms, classifier guidance, RGD, NOS/LaMBO-2, road networks and Diffusion Policy. JT-VAE, LCOMs and DiBO appear inside tables, which gained a "why it matters" column or clause instead.

**Why:** the course is built on a flow, not a paper tour, as [papers-serve-the-flow](papers-serve-the-flow.md) says. Once a paper is on a slide, though, the professor has to say why it is there. A student cannot tell a landmark from a workshop paper by its venue alone. The card puts the step of the argument and the paper's standing on the slide being lectured from.

**How to apply:**
- Give every slide that introduces a paper a `::: paper` card. A results slide for a paper already introduced does not get a second card.
- Where two papers share a slide in columns, put one card inside each `::: col`; the cells stack there.
- Keep each cell to two lines. A three-line cell made five slides overflow on the first pass.
- Put the full title in `sub:` in typographic quotes. Never use `*…*` there: in the heading, emphasis renders as the blue accent.
- On a full slide, move detail to the presenter note and keep the figure. Fold a slide's intro sentence into the card's first cell, or into the note.
- State the significance honestly. A workshop paper is "read for the idea". The lab's own papers get their reported result, not praise.
- Check every factual claim (award, benchmark result, affiliation) before it goes on a slide. Run `node tests/course-review.mjs chNN`.
- Ch 5 got its 11 cards on 2026-10-26 (Design-Bench, COMs, PRIME, RoMA, Deep Ensembles, NEMO, Ovadia, FGM, Kennedy & O'Hagan, hPINN, LCOMs). PRIME's card first said it beat simulator-driven search outright; its own figure shows two ties and two wins — say what the figure shows.
- The RL chapters (8–12) introduce papers too and have no cards yet.

Related: [papers-serve-the-flow](papers-serve-the-flow.md), [build-on-what-they-know](build-on-what-they-know.md), [ch05-ch06-streams](ch05-ch06-streams.md).
