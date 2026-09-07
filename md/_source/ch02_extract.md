# Lecture 2: source alignment, experiments and redrawn figures

Primary source: `pptx/2. Fundamentals on Bayesian Statistics.pdf`, 70 pages, SHA-256 `c3ea5d2250cd4faf8039fe4e51e7adbd6bbe9903331ae09421069d49db786070`. The `lecture_slides/` copy is byte-identical. There is no Lecture 2 `.pptx` in the supplied workspace; the PDF in `pptx/` supplies the original slide order and diagrams. The source PDF is unchanged.

The current revision has 85 slides: 74 through the original closing question, one appendix divider, and ten optional supplements. There are 12 guided interactive experiments and four quizzes. Each experiment asks students to predict, manipulate a named control, and explain an observed result. Detailed integrations, asymptotic qualifications, and model-checking extensions stay in the appendix.

## Restore the original route

Prediction is taught alongside its model, so a coin or Normal example is completed before the next model starts. Full Bayesian regression again precedes the motivation and interpretation of regularisation. The regression roadmap from original p.52 has been restored.

| Original PDF | Current HTML slides | Preserved topic and local additions |
|---|---|---|
| 3–14 | 2–16 | Coin model; frequentist/Bayesian viewpoints; Bayes; coin MLE; inference targets. Add repeated-sampling experiment immediately after MLE. |
| 15–19 | 17–23 | Beta prior, posterior calculation, sequential updates. Recompute all ten original plotted count states over two readable slides. |
| 20–23 | 24–28 | Intervals, posterior compromise, average uncertainty reduction. Place CI and prior-sensitivity experiments with these explanations. |
| 24–25 | 29–33 | Coin prediction and the three-step Bayesian procedure. Compare single-toss and batch predictions before leaving the coin model. |
| 26–32 | 34–36 | Conjugacy table and Binomial–Beta recap establish the template. |
| 33–37 | 37–42 | Poisson–Gamma update, all 20 original Pokemon counts, rate interpretation and prediction. Add district-count/prior-exposure controls. |
| 38–44 | 43–47 | Normal–Normal update and prediction. Add a numerical temperature example, precision experiment and predictive-noise experiment. |
| 45–47 | 48–51 | Multinomial–Dirichlet update and prediction. Add observed-category controls and prior strength. |
| 48–58 | 52–59 | Housing task, original regression roadmap, least squares, normal equation and Gaussian MLE. Add a line/residual experiment on the same three-point calculation. |
| 59–62 | 60–65 | Bayesian weights, posterior, 2/10/100 comparison, prediction and sampling. Recompute the original two-row figure and pair it with its live version. |
| 63–69 | 66–72 | Generalisation problem, ridge, Bayesian interpretation and lasso. Add training/validation experiment and retain the geometry/prior experiment. |
| 70 | 73–74 | Recap and questions, followed by optional backup material. |

Each core slide also records its source-page alignment in a presenter note.

## Experiments

| No. / slide | Change | Hold fixed | Read / explain |
|---|---|---|---|
| 1 / 13 | Tosses per experiment; repeat 200 datasets | True coin bias 0.6; nested data within each replicate when n changes | Sampling variability of MLE, not a parameter posterior |
| 2 / 24 | Run 26 interval experiments | Known Normal noise and flat prior in the comparison | Coverage versus posterior probability |
| 3 / 27 | Prior; record H/T; simulate extra tosses | Observed data when switching prior | Beta update and prior/data weights; HHT preset reproduces Beta(4,3) |
| 4 / 31 | Future batch size | Beta(4,3) posterior | One-toss equivalence, extra batch-count variance |
| 5 / 41 | Number of original districts; prior exposure | Prior mean 20; source counts and their order | Gamma update, rate SD versus new-count SD |
| 6 / 45 | Number of readings, noise SD, prior SD | Prior mean 20, sample mean 23 | Precision-weighted posterior; likelihood curve normalised only for display |
| 7 / 47 | Number of readings | Prior variance 4, noise variance 9, sample mean 23 | New-reading variance retains the noise floor |
| 8 / 50 | Add a category count, change prior, clear data | Category meanings | Updated Dirichlet parameters and next-request probabilities |
| 9 / 59 | Intercept and slope; solve least squares | Three points (0,1), (1,2), (2,2) | Residuals, SSE and negative log likelihood have the same minimiser |
| 10 / 63 | 2, 10, 100 nested cases; resample | Linear data model and Gaussian prior | Weight uncertainty and mean-function uncertainty describe the same posterior |
| 11 / 68 | Penalty, training size, new training data | Same data across penalties; 200 independent fixed validation cases | Fit/shrinkage tradeoff; improvement is data-dependent |
| 12 / 71 | Penalty; ridge/lasso | Quadratic fitting objective and noise variance 1 | Smooth budget versus corners and the corresponding prior |

New experiments live in `deck/widgets/ch02-experiments.js`. Numerical snapshots are attached to each widget for reproducible checks. `finish()` and `reset()` use deterministic teaching states for export and replay. Range-control keys do not turn slides.

The regularisation example uses six Legendre polynomial features (degrees 0–5), which remain linear in their weights. The true mean is 8+11x with independent Gaussian noise SD 2.4. Training x values are equally spaced; validation x values are independent uniform draws. The default training seed is 9; validation seed is 739. The intercept is unpenalised in this experiment. The analytical all-weight-prior derivation is explicitly distinguished from that convention. Training size changes the design; this experiment does not claim nested designs. Repeatedly inspecting validation results is for teaching model selection, not an unbiased final test-performance estimate.

## Figure provenance and reproduction

`assets/ch02/sources.json` records source pages, transformations, use status and hashes. Original raster crops remain archived; the current slides use four vector reconstructions plus the original Pokemon map. No map geography or empirical counts are invented.

Run `MPLCONFIGDIR=/tmp/ie437-mpl python3 scripts/redraw_ch02.py` with NumPy, SciPy and Matplotlib to regenerate the vectors. This is an authoring tool; the site build consumes the committed SVGs without those Python dependencies. Matplotlib text is converted to vector paths for stable cross-platform appearance.

- Original p.19: all ten (tosses, heads) pairs are retained: (0,0), (1,1), (2,2), (3,2), (4,3), (5,3), (8,5), (15,9), (50,26), (500,259). The prior is Beta(1,1), and vertical density scales are explicitly labelled as different.
- Original p.50: retain task → model → solve structure. The small housing numbers are labelled illustrative.
- Original p.62: retain sampled functions above coefficient distributions, with columns n=2,10,100. Because the source provides no raw regression sample, this is a labelled simulation, not a claimed recovery of original data. It uses exactly the live widget's seed 9, true weights (8,11), noise SD 2.4 and prior SD 6. Both figure rows use common corresponding axes to make concentration comparable.
- `assets/ch02/redraw-data.json` stores count states, the nested regression data and computed posterior/OLS values.

## Corrections retained


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


## Supporting references

The supplied lecture PDF is the primary source. Optional prediction and model-checking extensions link to the official [Stan posterior prediction guide](https://mc-stan.org/docs/stan-users-guide/posterior-prediction.html) and [posterior/prior predictive checks](https://mc-stan.org/docs/stan-users-guide/posterior-predictive-checks.html). Text, additional examples and code are newly written.

## Validation

- `node build.mjs ch02`: 85-page HTML/PDF, four quizzes. All 85 slide layouts and print layouts checked, including figure captions and bottom takeaways; no overflow, leaked attributes or KaTeX errors.
- `node tests/ch02-labs.mjs`: exercises all six new experiment models, HHT recording, changes of prior/noise/sample size, held-fixed datasets and keyboard navigation.
- Independent NumPy/SciPy calculations confirm conjugate-model summaries, all displayed regularisation solutions and train/validation errors. SVG provenance hashes and the original PDF hash are retained.
- All slide screenshots and selected rendered PDF pages visually inspected, including the two coin grids, regression grid and new labs.
