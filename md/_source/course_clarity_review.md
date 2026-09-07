# Course clarity review — 2026-09-07

Scope: all 14 decks (Lectures 0–12 and the probability appendix). This review extends the recent Lecture 1 KKT and Lecture 2 Bayesian revisions to the whole course. The audience target is third-year undergraduates. This is an editorial, mathematical, and rendering review, not a measured student-comprehension study.

## Common teaching structure

Each deck now states prerequisites and a learning route. New worked calculations connect definitions to the existing experiments; interpretations explain what a number means for a decision. The four existing concept quizzes remain in every deck. The original topic order, section divisions, figures, videos, and widget placements are retained; a few misleading headings and mathematical statements are rewritten in place.

Core learning goals are separated from research extensions and appendix derivations. A student can first learn the scalar or small-table calculation, then use the original research material to see where it leads. The probability appendix is explicitly usable as a prerequisite refresher as well as a later reference.

| Deck | Pages before → after | Concrete learning support |
|---|---:|---|
| 0 Introduction | 62 → 64 | Learning route; one shop-order decision under known demand, uncertain demand, and repeated decisions; research-case reading guidance |
| 1 Optimization modeling | 87 → 88 | Prerequisites and core-versus-advanced goals; retain the production and wall examples, visible KKT statement, two-way theorem, examples, then proof |
| 2 Bayesian statistics | 85 → 86 | Shared specify–update–predict–check route; retain all twelve guided experiments and original conjugate/regression sequence |
| 3 Bayesian networks | 50 → 54 | Two-node alarm posterior, one numerical filtering step, and perfect-information utility calculation |
| 4 Bayesian optimization | 41 → 45 | Scalar GP conditioning, latent-versus-observation variance, and PI/EI/UCB comparison on the same two candidates |
| 5 Surrogate design | 44 → 48 | Prediction-versus-decision example, COMs loss and output derivatives, average-bound counterexample |
| 6 Generative design | 52 → 57 | Multimodal inverse example, scalar Gaussian VAE KL, finite conditioning table, importance-weight calculation |
| 7 MDP/DP | 50 → 55 | One Bellman backup, before/after-observation coin decision, two value-iteration sweeps, numerical contraction bound |
| 8 Value-based RL | 45 → 49 | Same trajectory for MC/TD, same transition for SARSA/Q-learning, DQN regression label and terminal handling |
| 9 Optimal control | 46 → 50 | One-step effort/error trade-off, scalar LQR gain and return, costate as marginal future cost |
| 10 Policy-based RL | 48 → 53 | One-parameter policy update, baseline versus bootstrap, actor chain rule, signed PPO clipping table |
| 11 Model-based RL | 57 → 61 | Two-step planning and replanning, error-propagation table, scalar implicit differentiation, real versus imagined Q update |
| 12 Offline RL | 43 → 47 | Unsupported-action target, two-action expectile, one-step importance sampling with support requirement |
| Appendix Probability | 35 → 38 | Common route, within/between variance calculation, scalar Gaussian conditioning |
| **Total** | **745 → 795** | **50 additional pages; 56 concept quizzes and 75 widget instances retained** |

## Mathematical corrections

- **Bayesian networks:** distinguish d-separation guarantees from accidental independence at particular parameters; correct conditioning on descendants, the treatment utility threshold, and likelihood-weighting claims. A DAG arrow needs additional assumptions for a causal interpretation. Stationarity shares parameters; it is not a missing-edge condition.
- **GP/BO:** fix the zero-variance EI limit and marginal-likelihood maximization notation; distinguish latent and observation variance. Posterior covariance is independent of observed values only with fixed hyperparameters. A product of kernels is valid; a product of GP sample functions is generally not Gaussian. PI/EI/UCB comparisons and final recommendation differ from cumulative bandit reward.
- **Surrogate/generative design:** average conservatism is not a pointwise certificate. A generator encourages plausible designs but does not guarantee feasibility. Clarify the empirical COMs candidate distribution, ELBO versus evidence, beta weighting, covariance parameterization, and the previous-proposal importance denominator in CbAS.
- **MDP/value RL:** unify reward timing as action at time t followed by reward at t+1; fix episodic summation limits. Separate current and next-action maxima. State discounted-MDP assumptions, unique value versus possibly multiple optimal policies, and proper-policy requirements in the undiscounted gridworld. Tabular Q-learning requires coverage and per-pair step-size conditions. TD variance comparisons and removing a deadly-triad component are not universal guarantees. Add terminal masks to DQN/DDPG explanations.
- **Control/policy RL:** distinguish HJB verification from Pontryagin necessity. Include terminal conditions, stabilizability/detectability for infinite-horizon LQR, and singular-R limitations. Keep a fixed terminal time in HJB verification. Correct policy-gradient objective/visitation weighting, causality direction, optimal score-weighted baseline, and the bias introduced by an approximate bootstrapped critic. Practical TRPO and PPO do not automatically guarantee monotonic return or a hard policy-distance bound.
- **Model-based RL:** replay already reuses model-free experience; a model supplies synthetic transitions. Error growth depends on dynamics sensitivity, not universally exponentially on horizon. PETS is a probabilistic neural-network ensemble, not an ensemble/GP combination. An ICNN alone does not make nonlinear equality-constrained MPC convex. Correct policy sensitivity recursion, dynamics time indexing, dual-ascent direction, and the sign in the QP adjoint gradient. Qualify local differentiability and Gaussian moment approximations.
- **Offline RL:** cloning has no universal performance ceiling and state-based cloning can recombine actions without reward-guided selection. MMD is not literally a support-only metric. Explain CQL theorem assumptions and its value-average scope; the discrete softmax penalty minimum is behavior entropy, not zero. Distinguish a finite expectile from the in-support maximum. Qualify MOPO bounds and all OPE claims. Estimator disagreement is a diagnostic, not a confidence interval; missing support cannot be repaired by reweighting. Relabel the widget's analytic direct reward-model estimator so it is not mistaken for trained FQE.
- **Probability:** average posterior-variance reduction is not a statement about each dataset; subtracting a conditional mean leaves a zero-mean residual. Policy-baseline unbiasedness uses the score identity. Require positive-definite covariance for the displayed Gaussian density; correct the variance convention in the numerical Gaussian KL example. State i.i.d./finite-variance conditions for Monte Carlo standard errors.

## Source fidelity and references

The chapter-specific original PDFs in `lecture_slides/`, Lecture 1's previously reviewed PPTX, the existing `_source/chNN_extract.md` files, and `_CHAIN.md` supplied the source flow. Lecture 12 uses the repository's authoring specification and cited papers; there is no original Lecture 12 PDF in this workspace. The original input PDFs/PPTX were not rewritten. All original figure, video, and widget directives survive this change.

Primary references used to resolve theoretical scope:

- [CMU probabilistic graphical model notes](https://www.cs.cmu.edu/~epxing/Class/10708-19/notes/lecture-02/) — graphical independence.
- [Gaussian Processes for Machine Learning](https://gaussianprocess.org/gpml/chapters/) — GP conditioning and kernel versus sample-function products.
- [Conservative Objective Models](https://proceedings.mlr.press/v139/trabucco21a.html) and [CbAS](https://proceedings.mlr.press/v97/brookes19a/brookes19a.pdf) — conservative design and adaptive conditioning.
- [Sutton and Barto, Reinforcement Learning](https://www.incompleteideas.net/book/bookdraft2018mar21.pdf) — Bellman, tabular TD/control, and policy gradients.
- [MIT Underactuated Robotics: LQR](https://underactuated.mit.edu/lqr.html) — feedback and Riccati conditions.
- [Deterministic Policy Gradient](https://proceedings.mlr.press/v32/silver14.html), [PPO](https://arxiv.org/abs/1707.06347), and [Differentiable MPC](https://arxiv.org/abs/1810.13400) — gradients and approximation scope.
- [CQL](https://arxiv.org/abs/2006.04779) and [IQL](https://arxiv.org/abs/2110.06169) — offline value-learning claims.

New small numerical examples are instructional constructions, not new empirical research results. Source benchmark numbers are presented as reported cases, not general performance guarantees.

## Verification

- `node build.mjs --all`: 14 HTML decks, 14 matching PDFs, 795 pages and the site index.
- `node tests/course-review.mjs`: screen and print geometry (including intrinsic math widths inside columns), all 56 quiz answers, mounting and range controls for 75 widget instances, widget lifecycle exceptions, missing images, KaTeX errors, and the boxed-math CSS regression.
- `node tests/ch02-labs.mjs`: the six interactive Bayesian experiment models, controlled HHT updating, and keyboard navigation.
- Independent numerical checks cover 19 values/identities, including GP/EI, COMs, KL, Bellman/TD/control, expectiles, the CQL penalty minimum, and finite-difference verification of policy and implicit gradients.
- All exported PDF page counts are checked against source slide counts. Two representative pages per deck are rasterized and visually reviewed; the three initially dense pages and the boxed Bellman result receive additional review.
- Visual review found a class-name collision: diagram `.fbox` styles obscured KaTeX's `\boxed` content. Diagram styles are now scoped to `.flow > .fbox`; the integration test checks that mathematical boxes remain transparent and unconstrained by diagram height. A second visual check exposed long equations extending beyond their columns. The full-course check now measures KaTeX base widths, and affected expressions are split into calculation steps without shrinking the type.

The review does not assert that all research extensions are introductory or that classroom comprehension has been empirically tested. Core tasks and advanced extensions are explicitly identified to support teaching at the requested level.
