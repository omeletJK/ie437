# The course handoff chain

The opening names a usable prerequisite and one new question; the closing names the resulting skill and its limitation. Keep the concepts consistent, but use natural wording rather than repeating a script. This is a 14-deck course (0–12 and the probability appendix).

| Chapter | Bring | Learn and pass on |
|---|---|---|
| 0 | A familiar engineering decision | Decision, objective, information and constraints; the course map |
| 1 | Calculus and linear algebra | Formulate; use convexity, first-order conditions and KKT with their assumptions |
| 2 | Basic probability | Specify a likelihood, update a parameter belief and predict a new observation |
| 3 | Bayes and marginalization | Represent → infer → learn local tables → filter a hidden state → choose by utility |
| 4 | Gaussian conditioning | GP → acquisition → evaluation → posterior update |
| 5 | Regression and optimization | Diagnose selected-model error; fit and use COMs conservatively |
| 6 | Probability distributions and latent variables | VAE → DDPM training/sampling → conditioning toward successful designs |
| 7 | One-step decisions and conditional expectation | MDP → Bellman backup → policy/value iteration → convergence meaning |
| 8 | Bellman targets | MC/TD → sampled control → Q-learning → DQN and Double DQN |
| 9 | Calculus and Bellman reasoning | One-step feedback → LQR → HJB interpretation → PMP interpretation |
| 10 | Values, derivatives and policy probabilities | REINFORCE → baseline/critic → DDPG/TD3/SAC → controlled policy updates |
| 11 | Regression, control and actor–critic | Model → MPC/PETS → Dyna/MBPO → Dreamer; advanced optimizer derivatives later |
| 12 | TD3, SAC and Bellman learning | Fixed-data failure → policy/value restrictions → evaluation with coverage assumptions |
| 99 | Arithmetic and basic probability | Expectation, total variance, Gaussian conditioning and sampling as a reusable toolbox |

## Common worked example

Use normalized temperature error x = T − 22, heater command u, next error x′ = x + u, and cost c = (x′)² + u² as the introductory one-step model. It is a teaching example, not building physics. State every variant: hidden dynamics, sensor noise, action restrictions, or access to new trials. The learner must not secretly know the simulator's hidden formula. The one-step LQR gain is not the infinite-horizon gain.

Each deck includes a `Temperature thread` example and a `Try it` variant. Ask for a prediction before the calculation, reveal the answer, then change one condition. Preserve the lecture's original engineering cases as applications, with detailed material in appendices where appropriate.

## Connections that must be precise

- The OR/control columns compare approaches; they are not exclusive historical categories. Both use values, policies and dynamic programming.
- 5 ↔ 12: optimization can select optimistic model errors. COMs and CQL have related motivations but different objectives, targets and guarantees. Maximizing true value plus error does not necessarily maximize error alone.
- 6 → 11: latent representation learning combines with hidden-state inference from 3 and actor–critic from 10 in Dreamer. Diffusion Policy is a demonstration-learning bridge, not automatically reward-based RL.
- 8 → 10: Double DQN separates selection and evaluation; TD3's twin-critic minimum is a different operation.
- 10 → 11 → 12: SAC is the learner in MBPO; TD3 precedes TD3+BC; offline training then restricts new interaction.
- Trust regions, conservative objectives and short rollouts all manage unreliable extrapolation in different ways. An analogy is not an equality or a guarantee.
- The cube is a teaching map. Chapters 7 and 9 restore known models; not every chapter monotonically removes an assumption. RL need not have both unknown rewards and unknown transitions.
- Multi-agent material is an IE579 preview. Offline RL closes the taught route.

## Structure and evidence

Keep opening orientation short: previous skill → current question → core route. Reading lists belong after the core route. Do not force equal slide counts or an identical number of conceptual sections. Keep four milestone quizzes per deck; place them after the concept needed to answer them.

State each theorem's assumptions and result before its proof. Teach a small calculation before abstract derivations. A research paper illustrates a named question; its popularity does not make every technical detail a prerequisite.

Preserve original topics through main slides, appendices and `md/_source/source_fidelity_map.json`. When a heading moves or repeated orientation is merged, update the map, including treatment and provenance. Detailed verification is recorded in `md/_source/teaching_structure_review.md`.
