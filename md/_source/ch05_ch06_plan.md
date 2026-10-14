# Lectures 5–6 — the rewrite plan (agreed 2026-10-11)

The authority for rewriting `ch05_surrogate_design_optimization.md` and
`ch06_generative_design_optimization.md`. It replaces the earlier structure, which toured three 2021
methods (NEMO → COMs → RoMA) at equal weight.

## Direction (the professor's, 2026-10-11)

- No lecture that ends at "introducing a few papers". The core flow comes first; a paper appears only if
  it is genuinely well known or meaningful **and** carries a step of that flow.
- **Ch 5, all surrogate-based:** introduce offline MBO → the problem it derives (out-of-distribution
  error, which the optimiser seeks out) → the essential research streams for deciding with OOD in mind —
  **conservatism, using uncertainty, injecting knowledge of the system** — with 2–3 representative
  papers each.
- **Ch 6:** the limits surrogates still have → generative models → the main streams of generation-based
  optimisation, about two representative papers each.
- Each chapter is taught in **two 75-minute sessions** (one deck per chapter, with a Session 1 ending and
  a Session 2 opening).

## The questions the two chapters answer

| | Ch 4 · Observe | Ch 5 · Trust | Ch 6 · Generate |
|---|---|---|---|
| question | how should we collect the next observation? | on what evidence do we judge a design we never observed? | how do we produce structured designs and many good candidates? |

Closing frame for both: **performance / validity / reliability**. Ch 5 is mostly about reliability,
Ch 6 about validity. A generative model structures the search; it does not create evidence about
unobserved performance. OOD and invalid are different problems.

Every method is presented as **assumption added → what it solves → what it leaves**.

## Ch 5 — sessions

**5A (75 min).** Lecture 4's loop with the evaluation deleted → offline MBO, the best-observed-design
baseline, Design-Bench (and how it is scored: candidates are evaluated afterwards by an oracle the
method never queries) → two problems (values off the data; the valid set) → exploitation, run →
the signed decision bound → the three streams → **COMs in depth** → PRIME, RoMA → hand-off.

Signed decision bound, valid whenever $\hat f(\hat x)\ge\hat f(x^*)$ (true when $\hat x$ maximises $\hat f$):

$$f(x^*)-f(\hat x)\le\underbrace{[f(x^*)-\hat f(x^*)]}_{A:\ \text{under-estimate at the true optimum}}+\underbrace{[\hat f(\hat x)-f(\hat x)]}_{B:\ \text{over-estimate at the choice}}$$

A and B can be negative. Conservatism attacks B and can inflate A.

**5B (75 min).** Uncertainty: Deep Ensembles + $\mu-\kappa\sigma$ (Ch 4's UCB with the sign flipped —
offline, uncertainty cannot be reduced by observing, so it is avoided), NEMO (NML: how easily the model
could be talked into any label), Ovadia et al. (calibration degrades under shift for every method, the
strongest being ensembles; not an MBO paper) → system knowledge, ordered by how much is known:
FGM (structure; in depth) → Kennedy–O'Hagan (simulator + GP discrepancy) → hPINN (governing equations)
→ comparison → Ch 6 motivation.

| stream | in depth | supporting |
|---|---|---|
| conservatism | COMs (ICML 2021) | PRIME (ICLR 2022), RoMA (NeurIPS 2021, robust adaptation — adjacent, not a penalty) |
| uncertainty | Deep Ensembles (NeurIPS 2017) + LCB; NEMO (ICLR 2021) | Ovadia et al. (NeurIPS 2019) |
| system knowledge | FGM (AISTATS 2024) | Kennedy & O'Hagan (JRSS-B 2001), hPINN (SISC 2021) |

Comparison only: IOM (NeurIPS 2022 — domain adaptation, *contrasted* with pessimism in its own
abstract), ICNN (only for a concave score / convex cost), Low-N protein engineering (a learned prior,
not system knowledge). No lab column in Ch 5.

## Ch 6 — sessions

**6A.** Why generate (high-dimensional search, validity, over-conservatism; one $y$, many $x$; an
unconditional generator is not an optimiser and a prior does not guarantee validity) → VAE and
diffusion compressed (derivations to the appendix), ending on **classifier guidance vs classifier-free
guidance** stated exactly → the four streams as intervention points → G1 → G2.

**6B.** G3 → KL-regularised optimisation, derived → G4 → integration.

| stream (intervention point) | in depth | supporting / lab |
|---|---|---|
| G1 coordinates (latent search) | Gómez-Bombarelli et al. (ACS Cent. Sci. 2018) | JT-VAE (ICML 2018; validity of molecular graphs only), LCOMs (Ch 5 + Ch 6) |
| G2 the generating distribution | CbAS (ICML 2019) | GFlowNet (NeurIPS 2021; trained differently — flow consistency, needs reward calls or a learned proxy); lab: BootGen (NeurIPS 2023, also G3), Genetic-guided GFlowNets (NeurIPS 2024, not offline) |
| G3 the performance condition | MINs (NeurIPS 2020), DDOM (ICML 2023) | lab: GTG (NeurIPS 2024) |
| G4 the sampling process | RGD (TMLR 2024) | classifier guidance (Dhariwal & Nichol, NeurIPS 2021) as the principle; NOS / LaMBO-2 (one paper, NeurIPS 2023; LaMBO-2 is a BO procedure); lab: wind farm (KDD 2025), traffic network (WSDM 2026) — offline-to-online |

G3 as a progression: MINs generates $x$ and needs a forward-model consistency check → DDOM generates
a multimodal $x$ → GTG generates an improvement trajectory $\tau$.

The KL result, exact: $q^*=\arg\max_q \mathbb E_q[\hat f]-\tfrac1\beta\mathrm{KL}(q\|p_{\text{gen}})$ is
$q^*\propto p_{\text{gen}}e^{\beta\hat f}$, because the objective equals
$\tfrac1\beta[\log Z_\beta-\mathrm{KL}(q\|q^*)]$. It regularises the **search distribution**; COMs
regularises the **predictor**. Complementary, not the same. Samplers only approximate $q^*$.

## Facts checked against the papers (2026-10-11)

- **MINs** §3.2: inference optimises $y$ and $z$ subject to $\|y-f_\theta(f^{-1}_\theta(z,y))\|^2\le\epsilon_1$
  with an independently trained forward model, and $p(z)\ge\epsilon_2$.
- **DDOM**: conditions on the **maximum $y$ in the dataset** with a large classifier-free guidance weight.
- **RGD**: the proxy only tunes the classifier-free guidance strength $\omega$ (its Eq. 8); the proxy is
  itself refined toward the diffusion model's $p(y\mid x)$.
- **GTG**: classifier-free guidance on score-conditioned trajectories; the proxy only filters the final
  candidates.
- **LaMBO-2**: "generalize LaMBO, a Bayesian optimization procedure" — an application, not offline MBO.
- **FGM** also infers its structure from data; its question is whether DDO can beat picking the best
  design in the dataset.
- **Traffic-light offline meta BBO (KDD 2024)**: ANP surrogate + BO with limited online simulation —
  already in Ch 4's frontier map; keep it out of Ch 5.
- **Wind farm (KDD 2025)**: conditional diffusion on high AEP, then evaluate and augment, repeated.
- **LCOMs** is a 2023 workshop paper (ICLR ML4Materials; NeurIPS AI4Mat), not "ICLR 2022" as the
  source deck labels it.
- Source page numbers: the Part 2 PDF runs one page *earlier* than `ch05_extract.md` says from p. 26 on
  (first attempt p. 30, Algorithms p. 35, ablations pp. 38–40, PRIME pp. 54–55, LCOMs p. 56).

## The Ch 5 toy (seed 17), as computed from `conservative-coms`

Best design in $D$: $x=5.23$, $f=2.43$. True optimum $x^*=6.04$, $f^*=2.657$. The attacker builds $\mu$
with 25 plain ascent steps from every data point; the search is COMs' Algorithm 2 — trust-region ascent
$L_{\text{opt}}(x)=\hat f(x)-\beta\hat f(x+\eta\nabla\hat f(x))$, β = 0.9, T = 450, from the best design
(Trabucco et al., 2021, Eq. 4 and §3.4). α = 0 is the naive method: plain fit, plain ascent.

| α | search | x̂ | f̂(x̂) | f(x̂) | A | B | loss |
|---|---|---|---|---|---|---|---|
| 0 | plain | 10.00 | 4.31 | −0.14 | −0.03 | 4.44 | 2.79 |
| 0.15 | trust region | 6.93 | 2.23 | 2.32 | 0.52 | −0.10 | 0.33 |
| 0.3 | trust region | 6.32 | 2.00 | 2.62 | 0.67 | −0.62 | 0.03 |
| 0.45 | trust region | 6.06 | 1.90 | 2.66 | 0.76 | −0.76 | 0.00 |
| 0.6 | trust region | 5.90 | 1.84 | 2.65 | 0.81 | −0.81 | 0.01 |
| 0.9 | trust region | 6.22 | 1.83 | 2.64 | 0.84 | −0.81 | 0.01 |
| 1.3 | trust region | 4.42 | 1.67 | 1.96 | 1.41 | −0.28 | 0.70 |

- At α = 0 the exact split is loss 2.79 = A + gap + B = −0.03 − 1.62 + 4.44, with gap
  $\hat f(x^*)-\hat f(\hat x)\le0$; the bound $A+B=4.41$ drops the gap. Say "B is the only large positive
  term", never "the whole loss is B". A local search need not end at the surrogate's maximum, so the bound
  is not shown on the α dial.
- **Plain ascent is not enough even after conservative training.** At α = 0.3 plain ascent passes 6.20
  (worth 2.65) near step 40 and reaches the far edge x = 10 (f̂ 2.31, f −0.14) by about step 150 — the
  same point a global search of that surrogate returns (for every α in 0.15–0.9). The attacker never went
  there, so nothing pushed it down; the trust region is what keeps the search in μ's region. An earlier
  draft stopped plain ascent at 40 steps and so hid this.
- With the paper's one-step attacker this 1-D toy is too local to protect anything (every α ends near
  x = 10); the toy keeps 25 steps and says so in a presenter note.
- The "first attempt" (penalise $\mathbb E_\mu[\hat f]$ only) lowers the whole surface by exactly α — mean
  $\hat f-y$ on $D$ is −α — and chooses almost the same design; term (iii) restores the level, not the choice.
- The Hopper figure on slide 28 is the source deck's (50 steps); the published COMs Figure 3 runs to 450.
- Slide 9's task table is the 2021 version used by NEMO/COMs/RoMA; the final Design-Bench (ICML 2022)
  has Superconductor at 86 dimensions and moved GFP and MoleculeActivity to its appendix.

## Ch 6 — as built (2026-10-12)

77 slides (62 main + appendix), 4 quizzes. **6A (slides 1–38):** what surrogates leave (a huge space,
validity, one answer) → one $y$, many $x$ → a generator is not an optimiser → VAE, CVAE, DDPM training and
generation, then *two ways to steer* stated exactly (classifier guidance $\nabla\log p_t(x_t)+s\nabla\log
p_\phi(y\mid x_t)$; classifier-free $(1+w)\epsilon(x_t,t,y)-w\epsilon(x_t,t)$, an implicit classifier) → the
score's blind spot → **four places to intervene** + the paper map → G1 (latent search, JT-VAE, LCOMs) →
G2 (conditioning drawn as bars, temperature thread, CbAS derived, the ratio, the ladder, the CbAS paper's
Fig. 2b, GFlowNet, BootGen) → Session 1 wrap. **6B (39–62):** G3 (MINs, its Invalid figure,
condition-shift, DDOM, GTG, wind farm) → the KL tilt derived + `kl-tilt` → G4 (classifier guidance with
a surrogate, RGD, NOS/LaMBO-2 + road networks) → four interventions side by side → performance /
validity / reliability → Diffusion Policy → search against produce.

- The paper map is `mbo-papers` with `{"set":"ch06"}`: 19 papers in five columns (generators, G1–G4);
  lab papers drawn amber. Lab facts checked 2026-10-11/12: BootGen (Kim, Berto, Ahn & Park, NeurIPS 2023);
  Genetic-guided GFlowNets (Kim, Kim, Choi & Park, NeurIPS 2024 — reward calls, online); GTG (Yun, Yun,
  Lee & Park, NeurIPS 2024); Wind Farm Layout Optimization with Diffusion Models (Shin, Yun, Yun, Woo,
  Lim & Park, KDD 2025 — conditional on high AEP and wind scenario, GNN denoiser, local-search repair,
  evaluate and augment); Urban Traffic Network Layout Optimization with Guided Discrete Diffusion Models
  (Yun, Song, Shin, Shin, Woo, Lim & Park, WSDM 2026); DiBO (Yun, Om, Lee, Yun & Park, ICML 2025 —
  diffusion prior × exp(β·UCB) of a deep ensemble, fine-tuned with relative trajectory balance, a
  GFlowNet-family loss). RGD = Chen, Beckham, Liu, Liu & Pal, TMLR 2024.
- CbAS Fig. 2b (cropped as `assets/ch06/cbas-iterations.png`): dashed = 80th percentile of oracle
  predictions, solid = mean ground truth of the same samples; "high dashed values and low solid ones are
  methods that have been led astray into pathological regions of the oracle" (paper caption). DbAS is
  CbAS without the prior ratio.
- `kl-tilt` (Lecture 5's toy, seed 17; generator = Gaussian KDE of the 15 designs, bandwidth 0.5, plus
  0.5 % uniform mass): tilt by the data-only surrogate — average true value 1.52 at β 0, 1.90 at β 2,
  1.49 at β 3 (mode jumps to x = 10), 0.15 at β 5; tilt by μ − 2σ (lcb-flip's GP) — 2.00 at β 2, 2.43 at
  β 8 (= the best design in D), under 1 % of mass past x = 6 at every β.
- Numeric worked examples (A/B/C, heater, importance ratio) are drawn by `cond-bars`; the one-coordinate
  VAE calculation and the DDPM scalar step moved to the appendix. `cbas-ladder` lost its buttons: → walks
  prior → one shot → rounds 1–3 → all eight.
- Tests: `paper-selection` now encodes the rewritten structure of Lectures 5–6 (the old one asserted
  NEMO/RoMA in the appendix and a COMs calculation in the main line). Each deck keeps one
  "Reading guide —" heading; the extra tables are "Reading guide, continued — …".

## Revision after the 2026-10-12 course-flow review (2026-10-13)

Applied the review in `ch01_ch06_course_flow_and_ch06_plan_2026-10-12.md` §17–18: KL defined (widget
`kl-direction`); the search-vs-produce framing replaced by "a generator decides where to look, a
performance model decides what to trust"; guidance split into G3 (classifier-free) and G4 (classifier);
a shared 2-D thin-valid-set problem (`manifold-search`, modes g1 and g4); DiBO moved off the G2 column;
paper-map lines solid (builds on) / dashed (compared) with setting tags. Ch 5: the α dial now uses the
trust-region search at every α — the earlier dial compared plain ascent at α = 0 with the trust region at
α > 0, so it credited the penalty with part of the search's effect. The 2 × 2 on the toy (450 steps):
plain fit + plain ascent → x 10.00 (f −0.14); plain fit + trust region → x 10.00 (−0.14, passes 2.66 near
step 50); conservative fit (α 0.3) + plain ascent → x 10.00 (−0.14); conservative fit + trust region →
x 6.32 (2.62). In this toy neither half works alone.

## Why COMs' search "stops" in the toy (2026-10-14)

The professor asked why the green search ends at x̂ = 6.32 when the conservative surrogate keeps rising.
It does not converge: Algorithm 2 runs a fixed T = 450. Here L_opt's gradient is about 0.1 × f̂′, because
the ReLU-knot surrogate has almost no curvature. On the α = 0.3 surrogate the slope beyond the data is about
0.07, against 0.41 for the plain fit, so each step moves about 0.0024 and 450 steps travel about 1.1.
Running longer at α = 0.3 gives x = 7.41 at 900 steps (f 1.90), 9.78 at 1,800, and the edge by 4,500. Only
α = 1.3 stops at a real peak (x = 4.43). The attacker's farthest point at α = 0.3 is 5.84, so x̂ is just
outside μ. The slides now say "a flattened surrogate plus a short, slow search", never "the search stays
inside μ". All three COMs widget modes (first attempt, dial, optimiser) now draw one figure — the design-axis chart of Act 1's "Where the loss comes from", with μ on the floor; nothing is plotted against search steps (unified by the other session, 2026-10-14).
