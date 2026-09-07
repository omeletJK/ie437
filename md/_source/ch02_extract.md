# Lecture 2: source comparison and teaching expansion

Source: `pptx/2. Fundamentals on Bayesian Statistics.pdf`, 70 pages, SHA-256 `c3ea5d2250cd4faf8039fe4e51e7adbd6bbe9903331ae09421069d49db786070`. The copy in `lecture_slides/` is byte-identical. The source PDF is unchanged.

The original HTML had 42 slides. The revised chapter has 76, including dividers and six backup derivations. The authoring source is `md/ch02_bayesian_statistics.md`. Added slides separate a model, its calculation and its interpretation rather than stacking more formulas into the original summary pages.

## Coverage of the original PDF

| PDF pages | Original topic | Revised treatment |
|---|---|---|
| 3-7 | Statistical viewpoints and coin model | Distinguish observation randomness and epistemic uncertainty; explain both frequentist and Bayesian uncertainty summaries. |
| 8-14 | Bayes' rule, likelihood, inference and prediction | Derive from joint factorisation; compute the two-candidate coin posterior and its evidence; distinguish density, likelihood and posterior. |
| 11-12, 15-19 | Bernoulli/Binomial, coin MLE and Beta updating | Separate a sequence from a count; derive log-likelihood MLE with boundary cases; collect exponents to obtain the normalised Beta posterior. |
| 19-23 | Updating picture, intervals, posterior compromise | Retain the source update figure; calculate Beta(4,3) summaries; show sequential updating and prior/data weights; distinguish average variance reduction from a pointwise guarantee. |
| 24-32 | Prediction and conjugate families | Clarify the assumptions in the conjugacy table; distinguish prior predictive, posterior and posterior predictive; separate training size n and future size m. |
| 33-37 | Poisson-Gamma and Pokemon counts | Retain the source map and all 20 counts; define shape-rate notation; derive the update, exposure adjustment and predictive variance; retain the full Negative Binomial formula in backup. |
| 39-44 | Normal-Normal inference and prediction | Explain sample-mean precision, provide a numerical temperature example and an interactive variance comparison; keep square completion in backup. |
| 46-47 | Multinomial-Dirichlet | Restore a model slide and a three-category calculation, including an unseen category; give the posterior Dirichlet-Multinomial formula in backup. |
| 49-58 | Supervised regression, normal equation and MLE | Retain the housing-model illustration; define X, w and y; solve a three-point example; connect convex optimality to the normal equation and derive Gaussian-noise MLE. |
| 59-62 | Bayesian regression and sampled fits | Explain posterior mean/covariance, retain the original two-row picture, repair the live figure and distinguish sampled mean functions from noisy observations. |
| 63-69 | Generalisation, ridge, lasso and MAP | Explain shrinkage and its tradeoff; derive exact Gaussian/Laplace prior scales, correct the geometry widget and derive Lasso's zero-coordinate condition in backup. |

## Figure provenance

`assets/ch02/sources.json` records original page, extraction or PDF crop, and SHA-256 for every asset. The map is an unmodified embedded image. Three scientific/model diagrams are rendered from the specified PDF regions at 144 dpi; no data or curves are redrawn inside them. Every figure's slide caption identifies its original PDF page.

## Corrections made instead of repeating misleading claims

- Frequentist inference is not limited to one point estimate. For independent Bernoulli trials, the sample proportion is unbiased even with small n; its variance is large when n is small.
- Bayesian uncertainty over a fixed parameter does not imply that its physical value changes from observation to observation. Statistical inference does not, by itself, identify causal effects.
- Likelihood is not a posterior density over parameters. For continuous parameters, probability is an area; density height is not a point probability.
- A posterior kernel is proportional to a density, not equal to an already normalised Beta density. MAP argmax expressions use equality, not proportionality.
- Coin prior strength is alpha + beta. The b/(b+n) weight belongs to the Poisson-Gamma model in shape-rate notation.
- Posterior variance decreases in expectation under the prior predictive joint model, not necessarily for each realised observation. Beta(1,20) to Beta(2,20) after one head supplies a numerical counterexample.
- Prior influence fading is model- and support-dependent; it does not establish recovery under every proper prior or a misspecified model.
- The inverse normal-equation expression needs full column rank. The convex least-squares optimality condition remains valid with rank deficiency.
- Regularisation corresponds to the negative log prior with noise/loss scaling included: lambda2 = sigma^2/tau^2 and lambda1 = 2 sigma^2/bL for the displayed unaveraged SSE objectives.
- A continuous Laplace prior has a density cusp but no atom of probability at zero. Exact zeros are a property of the MAP optimisation, not generic posterior draws.
- Integrating parameter uncertainty does not always produce a different distribution from plugging in its mean: one Bernoulli prediction is a counterexample. A future batch shares one uncertain parameter and has Beta-Binomial extra variance.
- Future sample size m is separate from observed n. Dirichlet posterior prediction uses updated parameters. Negative Binomial parameterisation is explicit and permits non-integer shape.
- Full Bayesian regression prediction adds observation noise to mean-function uncertainty. More data reduces parameter uncertainty but does not remove the assumed noise floor or model error.

## New worked examples and interactive calculations

The two candidate coins, Beta(2,2) + HHT, three request categories, three-point regression and temperature readings are original illustrative calculations, not additional empirical datasets. The Pokemon counts are exactly those supplied in source p. 36: n=20, sum=211, average=10.55 and sample variance=11.9447368421.

`bayes-predictive` implements exact Beta-Binomial and Binomial probabilities for 1-30 future tosses and the Normal-Normal update for 1-100 readings. The predictive Normal variance is 9 plus the posterior parameter variance. `bayes-update` now normalises in log space to avoid underflow and scales to include both prior and posterior. The ridge/lasso plot uses equal coordinate scales and the computed solution lies on the matching budget boundary. Regression plots keep simulated curves and covariance contours within their plotted domains.

## Supporting references

The supplied lecture PDF is the primary teaching source. Definitions of simulation and model checking were cross-checked against the official [Stan posterior prediction guide](https://mc-stan.org/docs/stan-users-guide/posterior-prediction.html) and [posterior/prior predictive checks](https://mc-stan.org/docs/stan-users-guide/posterior-predictive-checks.html). These references are also linked on the relevant slides. The text and worked calculations are newly written; no external textbook pages are reproduced.
