# Ch 4 MOBO: restored source diagrams

*Ch 4's multi-objective BO section deliberately follows the source's MINIMISATION diagrams (HV/HVI/PHVI/EHVI/HVPI), reversing an earlier maximisation redraw*

On 2026-09-30 the professor asked for Ch 4's multi-objective BO to be explained in more detail and for
the source deck's hypervolume diagrams (original PDF pp. 186–208: HV → HVI → A(P) → PHVI → EHVI → HVPI)
to be **restored**. They now live in `deck/widgets/mobo-hypervolume.js` (modes front / hvi / phvi / ehvi /
hvpi), drawn on the source's own coordinates, as six Act 4 slides starting at "Several objectives — a
Pareto set replaces one best number"; the Extensions slide became "Computing EHVI — …".

**Why:** an earlier audit had redrawn this section for maximisation (A=(3,1), B=(1,3), r=(0,0); the old
`assets/ch04/pareto-hypervolume.svg`, now unused). The professor wanted the original pictures back, and
those minimise both objectives (the car example), with r in the upper-right corner.

**How to apply:** do not "fix" the MOBO slides back to maximisation for consistency with the rest of
Ch 4 — the switch is flagged on-slide ("both objectives are minimised"). When restoring other source
diagrams, keep the source's own orientation and coordinates and say so on the slide. PHVI/EHVI in the
widget are exact (strip decomposition of A(P)); the Monte Carlo dots are illustrative. See
[html-lecture-notes-plan](html-lecture-notes-plan.md).
