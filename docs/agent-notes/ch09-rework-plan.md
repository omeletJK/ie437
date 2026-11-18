# Ch 9 rework plan — the Ch 7 and Ch 8 rules applied to Optimal Control (2026-11-15)

*What Ch 9 (Optimal Control & Planning, 55 slides) needs to meet the rules settled on Ch 7
(2026-11-09) and Ch 8 (2026-11-11). Written before the work, for the professor's approval; the
source is `lecture_slides/9. Optimal Control and Policy Based Reinforcement Learning (simple).pdf`,
pp. 1–21 (kept outside the repository), extracted in `md/_source/ch09_extract.md`.*

## Diagnosis

- **Layout is almost clean.** One overflow (slide 49, the translation table, 10 px); no console
  errors. The sentence-wrap detector (`_wrap.mjs`) flags 64 blocks where a sentence starts mid-line
  and 3 orphans; Ch 8 had 41 before its fix. The chapter has never had the one-sentence-per-line pass.
- **Four slides carry a picture** (widgets `control-grid`, `lqr-riccati`, `dt-to-hjb`,
  `pontryagin`). The other fifty-one are formulas, tables and prose: the Ch 7 and Ch 8 situation.
- **The source gives no diagram family to restore.** Unlike decks 7 and 8, the 21 optimal-control
  pages are formula pages; the one real figure is the Overview zoom grid (pp. 4–5), already redrawn as
  `control-grid`. The pictures have to be designed under the Ch 7 rules rather than recovered.
- **Something is used before it is explained.** Act 2 states LQR's answer ($V = x^\top P x$,
  $u = -Kx$) as a fact and defers the derivation to "the appendix after the HJB discussion"; HJB is
  Act 3. The source avoids this: it derives the **discrete-time** LQ problem straight from the DP
  recursion (pp. 10–14, five pages, the most detailed thing in the deck), and only after HJB does the
  continuous-time LQ case (p. 21). The deck dropped the discrete derivation and buried its payoff,
  "the Riccati recursion is value iteration", in slide 53 of an extension section nobody reaches.
- **No algorithm boxes, no ladder, no map tracker.** The control grid appears once (slide 6);
  Ch 8's map opens every act. Nothing relates the four forms of Bellman's equation on one page except
  the overflowing translation table.
- **Derivations are archived, and duplicated.** An Appendix (Backups 1–4, dialect, wall,
  translation table) and a "Derivations" section (five slides) hold the HJB derivation, the
  verification proof, the Riccati derivations and the scalar LQR solution; the HJB derivation and the
  Riccati derivation each appear twice, the scalar solution three times (slides 16, 33, 55). The
  professor's rule since 2026-11-11: derivations are taught in the body, one line per press, never in
  an appendix.
- **Three example systems.** Hand calculations use $\dot x = u$ with cost $x^2 + u^2$ (gain 1); the
  two continuous-time widgets use $\dot x = x + u$ on $[0,2]$; the LQR widget uses the double
  integrator. One figure format per story asks for one running system.
- **Arithmetic in tables and prose.** The one-step control table (slide 9), the temperature thread
  (10–11), the scalar gain with numbers (16), the costate as marginal cost (31), three views of one
  answer (33). Numbers belong in the presenter note; the slide shows the picture.
- **Clean-up.** Eighteen US spellings (minimize, optimize, stabilizing, controllable is fine);
  instructor cues in `sub` lines ("predict before revealing…", "work independently…"); bullet
  fragments on the cornerstone slide; two `{p}` citations (Jacobson & Mayne, Crandall & Lions) that
  carry no step; $c(x,u)$ in a quiz where the deck writes $g$; $K(t)$ and $K_t$ both used; the source
  folds the sign into $K$ ($u = Kx$) while the deck writes $u = -Kx$, which it should say once.

## Work plan, in priority order

**1. Act 2 becomes discrete-time LQR, derived from Act 1's recursion (source pp. 10–14).**
Problem → the hazard $J = \infty$ ($x_{t+1} = 2x_t + 0u_t$, drawn: the state doubles while the
input does nothing) → controllability as the condition that rules it out → "$V$ is quadratic" as a
fact → the derivation one line per press (`\step`: substitute $z^\top Pz$, minimise over $w$,
substitute back, match for all $z$, the ARE) → the Riccati recursion → "infinite-horizon LQR is
steady-state finite-horizon LQR". The continuous-time LQ case, the Riccati ODE and the stabilisable /
detectable conditions move to the end of Act 3, where HJB has been derived. The forward reference
disappears and the sharpest bridge to Lecture 7 is in the body, in the act that needs it.

**2. The Riccati recursion as a counted demo, on the heater.** The temperature thread's one-step
problem ($x_1 = x + u$, cost $(x+u)^2 + u^2$, $u^* = -x/2$) is the scalar discrete LQ problem with
$A = B = Q = R = 1$, and its gain $1/2$ is the **first sweep** of the Riccati recursion:
$P_1 = 1,\ P_2 = 1.5,\ P_3 = 1.6,\ \dots \to (1+\sqrt5)/2$ and $K_k = P_k/(1+P_k) = 0.5, 0.6, 0.615,
\dots \to 0.618$. A `lqr-riccati` mode `recursion` shows one plate per press ($P_k$, $K_k$, the
changed digits red) and the gain stopping, first on the heater (scalar), then on the double
integrator (a $2\times2$ $P$): value iteration on a matrix, one backward sweep per press, in the
`sweep-backup` style. The keypoint "the one-step gain need not equal the infinite-horizon gain"
becomes "the one-step gain is sweep one". The existing dial panel (the Riccati ODE integrated
backwards, gain flattening on the closed form) stays as the Act 3 check for the continuous case.

**3. One running system.** Every hand calculation already uses the heater, $\dot x = u$ /
$x_{k+1} = x + u$, cost $x^2 + u^2$. Re-base the two continuous widgets on it ($a = 0$ in
`dt-to-hjb` and `pontryagin`): on $[0,2]$ the Riccati ODE $-\dot P = 1 - P^2$, $P(2) = 0$ has the
closed form $P(t) = \tanh(2 - t)$, the costate is $\lambda = 2P(t)x$, and $P \to 1$ as $T \to \infty$
is the infinite-horizon gain the students computed by hand. The double integrator stays only where a
matrix is the point (item 2's second demo and the Act 3 dials).

**4. Algorithm boxes (`::: algorithm`), each before the demo that runs it.**
(a) *Backward DP for discrete-time optimal control* in Act 1: Ch 7's value-iteration box with one
line changed, the lit line `min over u ∈ U` carrying the note "an optimisation, not a loop".
(b) *Riccati recursion* in Act 2: initialise $P \leftarrow Q$; repeat the map; until $P$ stops
moving; read off $K$; act $u = -Kx$; the footer says it is value iteration with the table replaced by
a matrix. (c) *Pointwise minimisation from HJB* in Act 3 (solve the PDE, then at each $(t,x)$ read
$u^*$ off a static minimisation; the sufficiency theorem's box). (d) *Shooting* in Act 4: guess
$\lambda(0)$; integrate $x$ forward and $\lambda$ with $u = \arg\min H$; read the residual
$\lambda(T)$; adjust; the `pontryagin` widget then runs exactly this.

**5. Derivations in the body, one line per press, each once.** The HJB derivation (p. 18, four
lines) right after the continuous-time cost-to-go; the verification proof (p. 20, four lines) right
after the sufficiency theorem, labelled as the only optimality proof of the lecture; continuous LQ
from HJB (p. 21, three lines) after it; the scalar HJB solution ($V = Px^2$, $1 - P^2 = 0$, $P = 1$)
as the heater worked once; Euler–Lagrange → minimum principle (Backup 4) after the necessary
conditions in Act 4. The Appendix and the Derivations section are dissolved; the reading guide,
notation card and dialect slide go to the closing.

**6. The ladder: Bellman's equation in four dialects.** `mdp-pictures` `ladder` plates from the
markdown, no engine change: *Value iteration (Lecture 7)* $V(s) \leftarrow \max_a \sum_{s'} T[\dots]$
→ *Discrete-time optimal control* ($\sum_{s'}T$ becomes one successor $f(x,u)$, $\max$ becomes
$\min$ over a continuum, red) → *Riccati recursion* (the table becomes $x^\top P x$, red) → *HJB*
($\Delta t \to 0$: the backup becomes $-\partial_t V = \min_u\{\partial_x V f + g\}$, red) →
*Riccati ODE* ($V = x^\top P_t x$ closes the PDE). Four rungs at the end of Act 3, all five in the
closing. It replaces the translation table and the dialect slide; Pontryagin is not a rung, it is
the other view (item 8).

**7. The map as a tracker.** `control-grid` gains `cell` / `cells` / `dim` / `layer` options in
the `rl-roadmap` manner. "Where we are" (slide 2, a table) becomes the grid with the model-based
layer's infinite-action column lit; Act 1 and 2 light the discrete-time cell, Acts 3 and 4 the
continuous-time cell; the closing lights the model-free layer below with the vertical arrow, the same
figure as the opening, as Ch 8's "the cell, filled" does.

**8. Two new pictures, the chapter's own figure family.**
(a) *The backup tree with a continuum*: a `continuum` mode of `backup-tree` in which the three blue
decision edges melt into a blue wedge and each chance node has a single green successor (deterministic
$f$). It replaces "Where the expectation went" (two columns of formulas) and "optimise over a
continuum" (prose): the picture says the max over three branches became a min over a wedge, the
caption says it is an optimisation, not a loop. Students met the tree in Ch 7 and Ch 8.
(b) *Field against trajectory*: one widget, two modes, on the heater with $P(t) = \tanh(2-t)$. `field`
draws $V(t,x) = P(t)x^2$ over the $(t,x)$ plane with the feedback arrows $u = -P(t)x$ everywhere
(HJB, Eulerian); `trajectory` draws one optimal $x^*(t)$ across that plane with $\lambda(t) =
\partial_x V$ as the field's slope along it (Pontryagin, Lagrangian). It carries "What the costate
actually is", "What does a costate measure" and the HJB-versus-Pontryagin table as one picture, and
returns in the closing as the thesis slide. Act 4 has no source pages (p. 3 promises the minimum
principle, nothing delivers it), so this is where the picture must be designed.

**9. Arithmetic slides become pictures, numbers to the notes.** One-step control and the two
temperature slides: the parabola $J(u) = 2(u+1)^2 + 2$ with the three tried controls marked, then
the feedback line $u^* = -x/2$ over $x$ with the predicted point (−1, 0.5) and the measured point
(−1.5, 0.75) — feedback as a line, not a recomputation. The scalar gain slide: $x(t)$ under
$u = -x$, $u = 0$ and $u = -2x$ with the running cost shaded, the optimal one lowest. The costate
slide: $V(x) = x^2$ with its tangent at $x = 2$, slope 4. "Three views, one answer" stays a table
(the thesis), one sentence per cell.

**10. Clean-up pass.** British spelling throughout; instructor cues from `sub` lines to notes;
the cornerstone slide's bullets as prose (iLQR as one sentence pointing at Lecture 11, DDPG's actor
as the hand-over); drop the two `{p}` citations or give Kalman (1960) and Pontryagin (1962) `::: paper`
cards if the professor wants the two founding papers named; $g$ in the Act 1 quiz; $K_t$ everywhere
in discrete time, $K(t)$ in continuous; one sentence on the sign convention; the Act 2 quiz asks
about the Riccati recursion; the one-sentence-per-line pass over all 64 blocks; the visual walk.

## Decisions for the professor

- Discrete-time LQR first (the source's order, derived from Act 1), continuous LQR after HJB — or
  keep continuous LQR in Act 2 with its forward reference to HJB.
- One running system: the heater for every hand calculation and both continuous widgets, the
  double integrator only for the matrix case — or keep the widgets' $\dot x = x + u$.
- The Riccati recursion on the heater as the Act 2 demo, which turns the temperature thread's
  "one-step gain" into sweep one.
- Act 4's length: Pontryagin has no source pages. Four body slides plus the field-against-trajectory
  picture and shooting, or two (the view, the shooting check), since Lecture 10 needs only the
  trajectory view.
- Paper cards: none, or Kalman 1960 and Pontryagin 1962.

## Effort

Smaller than Ch 8. Core (items 1, 2, 4, 5, 6, 7, 10): one day — the markdown largely rewritten,
`lqr-riccati` gains a recursion mode, `control-grid` gains tracker options, the appendix dissolves,
about 55 → 62 slides. Second pass (items 3, 8, 9): half a day — two widgets re-based on $a = 0$,
`backup-tree` `continuum`, the field-against-trajectory widget, three small drawn examples. If the
lecture is close, do the core first.

## What was done (2026-11-15)

The professor approved the whole plan ("좋아. 모두 작업을 시작하라") and it was applied the same
day, with the recommended option on every open decision: discrete-time LQR first, the heater as
the one running system, Act 4 at full length, Kalman (1960) and Pontryagin et al. (1962) as the two
paper cards. 55 → 56 slides; the appendix and the Derivations section are gone.

- `md/ch09_optimal_control.md` rewritten. Act 2 derives the discrete-time LQ problem from Act 1's
  recursion (hazard → controllability → fact → five `\step` lines → ARE → Riccati recursion box →
  two demos → "the recursion is value iteration"); the continuous-time LQ case follows the HJB
  derivation in Act 3; the verification proof, the Euler–Lagrange derivation and the scalar
  solution each appear once, in the body. Four `::: algorithm` boxes (backward DP with continuous
  controls, Riccati recursion, feedback from a value field, shooting), each before the demo that
  runs it. The ladder has four rungs at the end of Act 3 and five in the closing, plates from the
  markdown (`IE437.math` has no `\partial` or `\top`: the plates use ∂ and `^T`, and a plate `line`
  needs a backslash in it to be typeset as maths). The notation card lists the K clash (horizon in
  Act 1, gain after) and the sign convention u = −Kx.
- `deck/widgets/control-grid.js` — tracker options `cell`/`cells`, `dim`, `arrow` ("f" | "pr" |
  "both"), `outer: "dim"`; the default rendering is byte-identical to before. Used on the opening,
  every act opener and the closing.
- `deck/widgets/lqr-riccati.js` — `mode: "recursion"`, `system: "heater" | "double"`, `n` plates
  (default 6, steps = n): one plate per sweep with P_k and K_k, the changed digits red, a plot of
  K_k against k, the limit dashed on the last press. Heater: K = 0.5, 0.6, 0.6154, 0.6176, … →
  0.618 (P → the golden ratio). Double integrator discretised at h = 0.5: K∞ = [0.651, 1.314].
  The dial figure is unchanged and now sits in Act 3 as the continuous-time check.
- `deck/widgets/dt-to-hjb.js`, `deck/widgets/pontryagin.js` — re-based on the heater (a = 0):
  P(t) = tanh(2 − t), P(0) = 0.9640, λ*(0) = 2 tanh 2 = 1.9281; the error ladder still halves with
  Δt (ratio → 2 from above); H conserved to 1e-15 along the principled trajectory, drifting 0.23
  along u = 0.5 u*. Guess ladder 1.2 … 2.7 with the true value at index 3.
- `deck/widgets/field-trajectory.js` (new) — `mode: "field"` (level curves of V = P(t)x², the
  feedback arrows, three trajectories from different starts) and `mode: "trajectory"` (x*(t)
  through the faint field, λ(t) as amber gradient arrows shrinking to λ(2) = 0, a non-optimal
  dashed trajectory); steps 2 each; labels sit on small background plates.
- `deck/widgets/backup-tree.js` — mode `continuum` (steps 2): Ch 7's optimality backup relabelled
  for control, the three decision edges melting into a blue wedge with one green successor per
  sampled ray, then the backup written out with `min` red. `drawOpt` was factored into a shared
  `optTree` and is pixel-identical.
- `deck/widgets/heater-pictures.js` (new) — `parabola`, `feedback`, `decay`, `tangent`,
  `unstable`, each 900 × 300, closed forms verified in node. They replace the one-step table, the
  two temperature slides, the scalar-gain numbers, the costate arithmetic and the J = ∞ example.
- QA: `_qa9.mjs` walk clean (no overflow, no console errors, 56 slides); `_wrap.mjs` down from 64
  flagged blocks to one two-reference table cell; every widget slide looked at by eye at 1280 × 720.
  Lessons: a plate `line` without a backslash prints `x^T` literally; a self-loop label longer than
  about 18 characters is clipped at the ladder's right edge; a 5 px overflow on a formula slide
  went away by turning a `::: block` quotation into a `::: small` line.
- Not done: nothing from the plan. Not committed; the professor commits.

## Integration pass (2026-11-18)

The professor asked for Ch 9 to be revised "integrally, by the same standards as Ch 7 and 8"; the
rebuild of 2026-11-15 was still uncommitted on the MacBook Air. This pass checked the seams with
the neighbouring chapters and made the student-side pass Ch 8 had (define before use, one
notation). 56 → 57 slides, walk clean, no overflow, no console errors.

- *Lecture 8's hand-off answered.* Ch 8 closes on "a max over a continuum: that wall is where
  Lecture 9 begins". The learning route now says "Bring from Lecture 8: the wall it ended on", and
  the wedge slide's keypoint opens "This is the wall Lecture 8 ended on".
- *Lecture 10's reference corrected.* Ch 10's "μ_θ(s) and K" slide compared itself with "Lecture 9's
  Act 3"; LQR is Act 2 in both the old and the new Ch 9, so the lede now says Act 2. Ch 10's Act 1
  demo already quotes 0.618 as "the Riccati gain" of the scalar heater: Ch 9's Act 2 demo now shows
  that number being reached, which it never did before (the old deck gave 1/2 and 1 only).
- *Act 4 opens on the map* like Acts 1 to 3 (the same cell as Act 3, "approached along one
  trajectory"), and the Q4 strip moved there from the Hamiltonian slide.
- *Define before use, one notation.* The Act 1 quiz is written in Act 1's discrete notation (Σ g_k,
  x_{k+1} = f); "PSD" expanded; "the stabilising root" is "the root with P ≥ 0" on the slide and
  explained in the note; the transversality condition is named where λ(T) first appears; the
  notation card gained a row for k (stage, or sweep) against t, τ (time), and its note names the
  three clashes.
- *"If time allows"* on the verification proof and the Euler–Lagrange derivation, as Ch 8 marks
  its proofs.
- *A prediction cue* in the note of the three-controls demo.

## Feedback picture redrawn (2026-11-18, after the lecture-prep review)

The professor could not read the "Feedback — a rule, not a plan" picture: it drew the rule
u* = −x/2 as a line with three points clustered 0.25 apart near it, and the plan-against-feedback
story is a story about time, not about the state-to-action map. The `heater-pictures` mode
`feedback` now plots the error x_k over stages k = 0, 1, 2 from the previous slide's x₀ = 2: the
plan's predicted path in slate dashes with its precomputed command named, the measured error +1.5
landing off the path, then two branches from it, red dashes for the plan reusing −0.5 (lands at
+1.0) and blue for the rule recomputing −0.75 (lands at +0.75). The one-step slide's keypoint now
carries the rule's derivation in one line (dJ/du = 2u + 2(x₀ + u) = 0), which had lived only in the
note. Numbers in the presenter note follow the model x_{k+1} = x_k + u_k, so the prediction is +1,
not the −1 the old note said.

## Euler–Lagrange derivation split in two (2026-11-18)

The four-line derivation of the minimum principle compressed three moves per press (adjoin,
name H and integrate by parts on one line; perturb, chain-rule and collect on another), and the
professor asked for it step by step. It is now two slides of five lines each, under the same
"if time allows" marking. Part 1, *adjoin the dynamics*: the problem; the multiplier adjoined with
f − ẋ; the Hamiltonian named; the integration by parts with its boundary terms written out; the
rewritten cost with no ẋ left and the keypoint that nothing has been optimised yet. Part 2,
*perturb the control*: u → u + εp with x → x + εξ, ξ(0) = 0; the chain rule term by term; the ξ and
ξ(T) terms collected; λ chosen to kill both; the integral against p that must vanish for every p,
hence ∂_uH = 0. The three conditions are read off three places (the integrand of ξ, the boundary
of ξ, the integrand of p), which the note says in those words. The interior-stationarity keypoint
stays on part 2; the conserved-H remark stays in its note.
