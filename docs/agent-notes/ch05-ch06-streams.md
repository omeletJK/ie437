# Ch 5/6: streams with representative papers

*Professor's 2026-10-11 direction for Lectures 5–6: offline MBO → its OOD problem → research streams, 2–3 representative papers each (Ch 5 surrogate-based, Ch 6 generative-based)*

Direction given 2026-10-11 for the Lecture 5 / 6 rewrite (replaces the NEMO → COMs → RoMA paper tour):

- **Ch 5 (all surrogate-based):** introduce offline MBO → the problem it derives (the surrogate is
  undetermined out of distribution and the optimiser walks there) → the essential research streams for
  deciding with OOD in mind, each with 2–3 representative papers. The professor named three streams:
  **conservatism**, **how to use uncertainty**, **injecting knowledge of the system**.
- **Ch 6:** why generative models — the limits surrogates still have — then the major streams and
  methods of generation-based optimisation, about two representative papers each.

Plan after a second agent's review (same day; its factual claims were checked against the papers):
- Ch 5 → Ch 6 link: Ch 5 asks *on what evidence do we judge an unobserved design?*; Ch 6 asks *how do
  we produce structured designs and many good candidates?* Generative models structure the search but
  do not create evidence about unobserved performance. The three Ch 5 streams are combinable
  principles, not exclusive classes.
- Ch 5: conservatism = COMs (deep; it suppresses over-estimation at the candidates the optimiser
  visits, not "all OOD"), PRIME; uncertainty = Deep Ensembles + μ−κσ (not automatically a lower bound),
  Ovadia 2019 (calibration degrades under shift — ensembles were the *strongest* there), NEMO as an
  advanced extension; system knowledge = FGM (AISTATS 2024) and Kennedy & O'Hagan 2001, PINN/hPINN one
  line. IOM is **not** conservatism (the paper contrasts itself with pessimism) — comparison only.
- Ch 6 streams as intervention points: coordinate system (Gómez-Bombarelli 2018, JT-VAE), generative
  distribution (CbAS — deep; GFlowNet trains differently), performance condition (DDOM — conditions on
  the dataset's max y with strong classifier-free guidance; MINs uses a forward model and a
  self-consistency constraint at inference), sampling process (classifier guidance, RGD; LaMBO-2 as an
  application). Lab: BootGen (G2+G3), GTG, wind farm KDD 2025 (conditional + iterative evaluation,
  not guidance). The traffic-light KDD 2024 paper is offline-meta + online BO and already sits in
  Ch 4's frontier map — keep it out of Ch 5.
- Design-Bench results need dataset max, 128 candidates, percentile and oracle type; say in Act 1 that
  final evaluation uses a separate oracle, some of them learned.
- From a third review (checked against abstracts): Ch 5 closing separates **OOD from invalid** (an OOD
  design can be valid and excellent; a near-data one can violate constraints); close both chapters on
  **performance / validity / reliability**; present every method as *assumption added → what it solves
  → what it leaves*; unify Ch 5–6 with p*(x) ∝ p_data(x)·exp(βf̂(x)), the exact maximiser of
  E_p[f̂] − (1/β)KL(p‖p_data). FGM also infers its structure from data. LaMBO-2 generalises LaMBO, a
  **BO procedure** — an application, not the offline G4 deep dive; teach classifier guidance itself.
  Classifier-free guidance (DDOM, GTG) uses no surrogate, so it does not make a method G4. GTG = score-
  conditioned trajectories + proxy selection (G3). Genetic-guided GFlowNets uses reward calls (not
  offline). No lab column in Ch 5. Depth: one full derivation per chapter (COMs; CbAS), the other
  streams' lead papers at one equation + one picture.

- A later plan the professor relayed (2026-10-11) gives each chapter **two 75-minute sessions (150 min)**,
  one deck per chapter with a Session 1 ending / Session 2 opening: 5A = offline MBO, OOD failure, COMs
  (+PRIME, RoMA); 5B = uncertainty (Deep Ensembles + LCB, NEMO, Ovadia), system knowledge (FGM core),
  comparison; 6A = motivation, VAE/diffusion compressed, G1, G2 (CbAS, BootGen); 6B = G3 (MINs, DDOM),
  G4 (RGD …), integration. With 150 min, 3–4 deep dives per chapter are affordable. Corrections I raised
  on that plan: keep MINs' forward-model consistency; GTG is G3 (proxy only selects); name classifier
  guidance as G4's mechanism; keep Kennedy & O'Hagan in the knowledge stream; use the *signed* decision
  bound f(x*)−f(x̂) ≤ [f(x*)−f̂(x*)] + [f̂(x̂)−f(x̂)]; Ch 6 still shows "original Part N pp." subtitles.

- Converged after the last review round (2026-10-11, 75 min × 2 confirmed): the KL-tilted q* is exact
  (proof via E_q[f̂] − KL/β = (log Z − KL(q‖q*))/β) but it regularises the *search distribution*, while
  COMs regularises the *predictor* — complementary, not the same ("what to trust" vs "where to search").
  RGD's proxy only tunes the classifier-free guidance strength ω (its Eq. 8) and is itself refined
  toward the diffusion's p(y|x) — teach it as "the proxy is allowed one knob because Ch 5 says it is
  unreliable OOD". GTG: classifier-free guidance, proxy only filters (G3, trajectories). G3 = MINs (x,
  forward consistency) → DDOM (multimodal x) → GTG (improvement trajectory τ).

- Status 2026-10-11: the spec is `md/_source/ch05_ch06_plan.md`. **5A is written** (slides 1–37 of
  `ch05`, committed 2026-10-13, awaiting the professor's review); the Session 2 slides after it are the old draft
  kept as a placeholder, so ch05 has 3 quizzes until 5B adds one. Widgets `surrogate-exploit` (modes
  run / bound) and `conservative-coms` (modes dial / global) were rebuilt; five source figures were cut
  into `assets/ch05/`. Next: 5B, then Ch 6.

- 3rd revision (2026-10-11, after a reviewer read the paper): COMs' Algorithm 2 is **trust-region ascent**,
  L_opt = f̂(x) − β f̂(x + η∇f̂), β 0.9, T 450 (Eq. 4); μ is built by plain ascent (1 step in the
  implementation). The toy widgets now use Algorithm 2; doing so showed the earlier "COMs works at α 0.3"
  was 40-step early stopping — plain ascent on the conservative surrogate drifts to x = 10 by ~150 steps.
  Design-Bench numbers on slide 9 are the 2021 task versions (final ICML 2022: Superconductor 86-dim,
  GFP/MoleculeActivity dropped). Review packages live in the Desktop folder (`Ch05A_review_v3.md`).

- Status 2026-10-12: **both chapters are rewritten.** Committed 2026-10-13 as 58c328a (the rewrite) and c89f0b4 (RoMA's paper Figures 1–2 added to its main and backup slides); Later on 2026-10-13 the professor asked to accept everything and push: a531d15 (the look-ahead brake slide + `lookahead-brake` widget) and a follow-up commit with the parallel session's NML slide (`nml-explain`), COMs' three-term panels (`conservative-coms` mode `term`), the tabular proof moved to backup, plus `.claude/launch.json` and the Assignment 1 advanced example — all pushed to origin/main. Ch 5 = 73 slides (5B done). Ch 6 = 77
  slides: 6A generators → G1 → G2 (CbAS derived), 6B G3 → KL tilt (`kl-tilt`) → G4 → comparison. The paper
  map widget `mbo-papers` now takes `{"set":"ch06"}` (lab papers amber); numeric examples are drawn by
  `cond-bars`; `cbas-ladder` lost its buttons. "As built" facts and lab-paper citations are at the end of
  `md/_source/ch05_ch06_plan.md`. `tests/paper-selection.mjs` was updated to the new structure; each deck
  keeps exactly one "Reading guide —" heading (extras are "Reading guide, continued — …").
  teaching-route / source-fidelity still fail on ch02/ch04 only (older, not from this work).

- 2026-10-13: a course-flow review (`md/_source/ch01_ch06_course_flow_and_ch06_plan_2026-10-12.md`; my
  opinion §17, applied §18) was applied. Ch 6 = 79 slides; framing is now "a generator decides where to
  look, a performance model decides what to trust" (no "search vs produce"); KL is defined in Ch 6 (it is
  not taught in Ch 1–5); a 2-D thin-valid-set widget `manifold-search` carries G1 and G4. The chapter
  title was kept — my review argued against renaming it, and the professor answered "좋다" and asked
  for the revision. Ch 5's α dial now uses the trust region at every
  α — on the toy neither conservatism nor the trust region works alone.

- 2026-10-13, second review applied (plan file §19): Ch 6 = 80 slides. Lessons that generalise — never
  compare a model's prediction and the truth over different candidate sets (the G4 widget had done so and
  invented an "over-promise"); don't call a pessimistic estimate "safe"; Deep Ensembles are a
  non-Bayesian uncertainty signal, not p(w|D); G4 = "performance information modifies the sampling
  process" (gradient or guidance strength); the KL tilt is "a view", not the objective of every method.

- 2026-10-13 timing pass (plan file §21): Ch 6 = 78 slides, Session 1 = 1–34, Session 2 = 35–62. Content
  was moved or merged, not deleted (inverse-map slide → appendix, CVAE → start of G3, DDPM train+generate
  merged, GFlowNet+BootGen merged). The third reviewer judged the structure final.

- 2026-10-14: in the Ch 5 toy, COMs' trust-region search does NOT converge — on the ReLU-knot surrogate
  L_opt's gradient ≈ 0.1·f̂', so it is slowed ascent with a fixed T = 450 (an early stop). The conservative
  surrogate still rises to x = 10. Never claim the search "settles" or "stays inside μ" (x̂ = 6.32 is just
  outside μ, whose end is 5.84). Say: flattened surrogate + short, slow search. COMs widgets now plot only
  against the design axis (no search-step axes) — the professor found mixed axes confusing.

- 2026-10-26: the professor reversed "VAE/diffusion compressed" for Act 2 — it dropped the source's
  generative-model basics and both ELBO derivations. Act 2 is restored as a build-up from Lectures 1–3
  (18 slides, deck 90; Session 1 now ends near slide 46). See
  [build-on-what-they-know](build-on-what-they-know.md). Appendix positions shifted by 10, and both
  maps were refreshed by heading lookup.
- 2026-10-26: the professor asked for the decisive forward/inverse difference early in Ch 6, and
  which Ch 5 limitation inverse design might overcome. Added Act 1 "Forward or inverse — who does
  the searching" (`manifold-search` mode `fi`, on G1's road): forward searches a model, so the
  optimiser hunts its errors; inverse samples one, so there is no arg-max to exploit, until a
  performance model steers again. The note lists what it could repair (attacker, near → like,
  validity, a batch, a small space) and what it cannot (reach past the data).
- 2026-10-28: the professor read GFlowNet and BootGen as "prior × score" too and asked to show how
  each paper implements it. The main slide's keypoint now says so in three lines (GFlowNet: a
  uniform prior × reward, no data in it; BootGen: the data × rank weights, then × the proxy's top K).
  Two backup slides at the end carry the equations: GFlowNet's flow-matching loss with the
  `flow-balance` widget (AB built in two orders: weighting each order by R gives 4/6, balanced
  flows give R/Z = 1/2), and BootGen's round as a table of three products (train, ask at y†,
  label and keep). Kept honest against the KL table: these are prior × success in form, not the
  same target — GFlowNet's prior is uniform, BootGen has no fixed target, and rank weights that
  depend on y alone do not change the ideal p(x|y), only where a finite network spends capacity.

**How to apply:** each stream gets idea → mechanism → papers → what it cannot do. See
[papers-serve-the-flow](papers-serve-the-flow.md) and [ch04-frontier-lab-papers](ch04-frontier-lab-papers.md).
