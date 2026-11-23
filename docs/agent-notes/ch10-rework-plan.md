# Ch 10 rework plan — the Ch 7–9 rules applied to Policy-Based RL (2026-11-18)

*What Ch 10 (Policy-Based Reinforcement Learning, 61 slides) needs to meet the rules settled on
Ch 7 (2026-11-09), Ch 8 (2026-11-11) and Ch 9 (2026-11-15). Written before the work, for the
professor's approval. The source is `lecture_slides/9. Optimal Control and Policy Based
Reinforcement Learning (simple).pdf`, pp. 22–70 and 75–89 (kept outside the repository), extracted
in `md/_source/ch10_extract.md`. One instruction came with the request: the policy gradient theorem
is derived from the dynamic-programming principle first and along a trajectory second, so that the
chapter runs in Lecture 9's order.*

## Diagnosis

- **Layout is nearly clean.** The walk (61 slides, every press) finds five overflows of a few
  pixels (A3C/A2C, SAC in the loop, the trust region, PPO against SAC, the zoo), no overlapping
  blocks, no over-wide formula, no console errors. The sentence-wrap detector (`_wrap.mjs`) flags
  86 blocks where a sentence starts mid-line and 11 orphans; Ch 9 had 64 before its pass. The
  chapter has never had the one-sentence-per-line pass.
- **Four slides carry a picture** (widgets `policy-gradient`, `baseline-variance`,
  `continuous-argmax`, `ppo-clip`). The other fifty-seven are formulas, tables and prose: the Ch 7–9
  situation. The source has a figure family to restore this time: the scored trajectory of p. 37
  (five sampled $(S_t,A_t)$, dashed lines running right to the episode's end where $G_1,\dots,G_5$
  stack), which p. 85 cuts short (reward-to-go) and p. 46 cuts at $t+n$ (bootstrap). Three ideas,
  one drawing. Also drawable: the three-families Venn (p. 27), the two facing wall pictures
  (pp. 51–52), the pendulum swing-up (p. 64) and the PyTorch chain rule (p. 68).
- **The derivation order is backwards for this course.** The source derives the theorem twice:
  the DP route through $V^\pi$ and the Bellman equation (pp. 29–34) *first*, the trajectory route
  through $p_\theta(\tau)$ (pp. 79–84) *second*, and says why on p. 80. The deck keeps only the
  trajectory route in Act 1 and sends the DP route to Backups 1–2, which nobody reaches. Lecture 9
  went backup → value field → one trajectory; Lecture 10 should open the same way.
- **Derivations are archived.** Ten appendix slides hold the DP route (Backups 1–2), the optimal
  baseline (3), GAE (4), the natural-gradient step (5), the zoo (6), MADDPG, the translation table
  and the system-identification detour. The rule since 2026-11-11: derivations are taught in the
  body, one line per press. The learning route even says "full policy-gradient/Fisher derivations
  … are references".
- **No algorithm boxes, no ladder, no map tracker, no paper cards.** The source has algorithms
  on pp. 37, 45, 60, 67 and 77; six `{p}` citations carry the papers; "Where we are" is a table
  and the closing is a `lineage` strip, where Ch 9 lights the control grid.
- **Eight arithmetic slides.** The one-parameter table (Act 1), the temperature thread and its
  variation, baseline-versus-bootstrap (Act 2), the scalar actor, the TD3 target, the SAC table
  (Act 3), the clip table (Act 4). Numbers belong in the presenter note; the slide shows the
  picture.
- **One running system, almost.** The two Act 1–2 widgets already run Lecture 9's heater
  ($x_{t+1}=x+u$, cost $x^2+u^2$, gain $k$, Riccati answer $0.618$). Acts 3 and 4 never return to
  it: their examples are an abstract $Q(a)=5-(a-2)^2$, invented TD3 numbers, a two-action SAC
  table and a clip table. The temperature thread uses a different heater (two actions, off/heat).
- **Clean-up.** About sixteen US spellings (optimization ×5, regularized ×4, parameterized,
  normalized, penalizes, minimize, behavior, center, discretization); thirty-seven bullet lines;
  instructor cues and source page references in `sub` lines; "Return later" contradicts the body
  rule; Lecture 9's closing says Lecture 10's actor "is a descendant of the third [Pontryagin]"
  and Ch 10 never picks the sentence up.

## The spine — one theorem, derived in Lecture 9's order

Lecture 9 taught three views of one answer: the backward backup over states (Act 1), the value
field and its rule everywhere (Act 3), and the conditions along one trajectory (Act 4). Lecture 10
has exactly the same pair of views of the policy gradient, and the source teaches them in that
order:

| Lecture 9 | Lecture 10, Act 1 | what the student sees |
|---|---|---|
| backward DP: $V(k,x)=\min_u\{g+V(k+1,f(x,u))\}$, a field over states | **Route 1**: differentiate $V^\pi(s)=\sum_a\pi_\theta Q^\pi$ through the Bellman equation (pp. 31–34) | the gradient obeys a backup of its own; $P$ routes it and carries no $\theta$ |
| Pontryagin: conditions along one $x^*(t)$ | **Route 2**: $p_\theta(\tau)$, $\nabla\log p_\theta(\tau)=\sum_t\nabla\log\pi_\theta$ (pp. 81–84) | the dynamics enter the law of a trajectory and leave its log-gradient |
| "three views, one answer" | **one theorem, two views**: Route 1 says *what* to estimate, $\E_{d^\pi,\pi}[\nabla\log\pi_\theta\,Q^\pi]$; Route 2 says *how*, from sampled episodes | REINFORCE is Route 2 sampling Route 1's $Q^\pi$ with $G_t$ |

Route 1 answers the objection the extract raised against it (that it "never writes $P$ down where
the student can watch it die"): p. 32 writes $\nabla_\theta Q^\pi(s,a)=\sum_{s'}P(s'\mid s,a)\,
\nabla_\theta V^\pi(s')$, and on the backup tree that is a gradient passing through the green
chance edges untouched. Drawn, it is the clearest statement in the chapter that the model only
routes the gradient. Route 2 then shows the same fact as algebra, and the two agree on the theorem.
Act 2's variance ladder becomes "better estimates of Route 1's $Q^\pi$", and Act 3's deterministic
actor is Route 1 with the inner expectation over $a$ collapsed (p. 54), which is why DDPG can be
off-policy and REINFORCE cannot.

## Work plan, in priority order

**1. Act 1 rebuilt around the two routes.** Act 1 on the map (the control grid, the policy-based
cell lit, the "delete $f$" arrow) → the objective in Lecture 7's objects, $J(\theta)=\sum_s
d^\pi(s)V^\pi(s)$, with the naive finite-difference answer (p. 30) as the foil → **Route 1**, the
backup tree first (item 7a), then the derivation one line per press (`\step`): the Bellman
expectation $V^\pi=\sum_a\pi_\theta Q^\pi$; the product rule; $\nabla Q^\pi=\sum_{s'}P\,\nabla V^\pi(s')$
with the red annotation "$P$ carries no $\theta$"; the recursion $\nabla V^\pi(s)=\phi(s)+\sum_{s'}
\rho^\pi(s\to s',1)\nabla V^\pi(s')$, labelled as a Bellman equation for the gradient; the
unrolling into $\sum_x\sum_k\rho^\pi(s\to x,k)\phi(x)$; the normalisation into $d^\pi$ and the
$\nabla\log$ substitution → the theorem, boxed and labelled → **Route 2**, the scored trajectory
first (item 7b), then $p_\theta(\tau)$, its log-gradient with the $P$ terms struck out, the
log-derivative trick, the sample estimator, the maximum-likelihood reading (p. 84, Lecture 2's
gradient reweighted) → **one theorem, two views**, a table in the form of Ch 9's "three views"
slide → the REINFORCE algorithm box (p. 37, per episode and batch, with $\gamma^t$ written once)
→ the `policy-gradient` demo → the one-parameter example drawn (item 9) → the check. Backups 1–2
dissolve into this.

**2. Act 2 as the $\Psi_t$ ladder, each rung derived where it is used.** The spine sentence of the
source (p. 35): everything after REINFORCE is variance control or step control. Causality with the
cross-term triangle of p. 85 and the trajectory picture cut short; the baseline with its
four-line unbiasedness proof in the body (pp. 86–87) and the **optimal baseline as a least-squares
problem** (p. 88, three lines, from Backup 3): the critic is not a design choice but the solution
of $\min_b\E[(R_t-b(s_t))^2]$, which is why it must be re-fitted as the policy moves; the
advantage; the actor–critic with the three-families Venn (p. 27, item 7c) and a one-step
actor–critic algorithm box before the `baseline-variance` demo; $n$-step returns on the trajectory
picture cut at $t+n$ (p. 46); GAE's telescoping (Backup 4) right after it, one line per press,
labelled "TD($\lambda$) for the advantage". A3C/A2C and off-policy policy gradients stay one slide
each, the importance ratio named as the object that returns in Act 4.

**3. Act 3 with its own pictures.** The wall pair (pp. 51–52) stays on `continuous-argmax`; the
reason to be deterministic (p. 54) is drawn on the backup tree (item 7d): at $s'$ the action node
collapses to one edge $\mu(s')$ and the inner expectation is gone, so the critic needs only the
environment's samples; the DPG theorem one line per press (p. 57: $J=\int\rho^\mu Q(s,\mu_\theta(s))$,
the chain rule, "one integral instead of two", p. 58); the DDPG algorithm box (p. 67) with TD3's
three changed lines beside it in red, as Ch 8 sets SARSA against Q-learning; the exploration
argument as a picture (item 7e); the autograd line (p. 68) kept as the one code aside; SAC's
objective with the entropy term revealed as its own term; the $\mu_\theta$-against-$K$ table kept
as the act's thesis. The scalar actor, the TD3 target and the SAC table go to the notes.

**4. Act 4 with the trust region drawn.** The self-generated-data loop as a picture (item 7f);
the surrogate and the KL ball with the natural-gradient step (Backup 5) in the body, three lines
per press, labelled; Lecture 1's trust-region table kept; a PPO algorithm box (collect under
$\pi_{\text{old}}$, $K$ epochs on the clipped surrogate, replace $\pi_{\text{old}}$) before the
`ppo-clip` demo, whose caption absorbs the clip table; the PPO-against-SAC table one sentence per
cell.

**5. Algorithm boxes (`::: algorithm`), each before the demo that runs it.** REINFORCE (Act 1),
one-step actor–critic (Act 2), DDPG with TD3's lines in red (Act 3), PPO (Act 4). Same keyword
column and act → observe → learn → move rhythm as Ch 7–9; the lit line is the actor's update.

**6. The ladder: one gradient, the weight changed.** `mdp-pictures` ladder plates from the
markdown. All rungs share $\nabla_\theta J=\E\big[\sum_t\nabla_\theta\log\pi_\theta(a_t\mid s_t)
\,\Psi_t\big]$ and change $\Psi_t$ in red: *REINFORCE* $R(\tau)$ → *reward-to-go*
$\sum_{t'\ge t}r_{t'}$ → *baseline* $\,-\,b(s_t)$ → *advantage* $Q^\pi-V^\pi$ → *actor–critic*
$\delta_t=r+\gamma V_w(s')-V_w(s)$ → *GAE* $\sum_l(\gamma\lambda)^l\delta_{t+l}$. Then two rungs
that change a different token: *DPG* replaces the score by $\nabla_\theta\mu_\theta\,\nabla_aQ$
(the expectation over $a$ is gone) and *PPO* wraps the weight in $\min(r\hat A,\operatorname{clip}(r)\hat A)$.
Six rungs at the end of Act 2, all eight in the closing. It replaces the zoo table and the
translation table's method rows.

**7. The pictures, the chapter's own figure family.**
(a) *The backup tree, scored* — `backup-tree` mode `score`: Ch 7's expectation backup for $V^\pi$;
press one tags the blue decision edges with $\theta$ and leaves the green chance edges plain; press
two writes $\nabla V^\pi$ under the tree with the $P$ factor grey. Route 1's picture.
(b) *The scored trajectory* — a new widget `pg-trajectory` in the p. 37 form, one episode of the
heater with five sampled $(s_t,u_t)$: mode `law` (the factors of $p_\theta(\tau)$ coloured, the
$P$ factors fading on press), `return` (dashed lines to the end, the stacked $G_t$, "update only
after the episode ends"), `causal` (the lines cut at $t$, the cross-term triangle beside), `baseline`
(a bar $b(s_t)$ subtracted at each point), `nstep` (the lines stop at $t+n$ and bootstrap on $V$).
One drawing for Acts 1–2, in the `sweep-backup` manner.
(c) *Three families* — a small widget: the value disc, the policy disc, the lens labelled
actor–critic; two presses.
(d) *The backup tree, deterministic* — `backup-tree` mode `deterministic`: Ch 8's SARSA tree at
$s'$ with the sampled $a'$ replaced by the single edge $\mu(s')$; the caption says which
expectation disappeared.
(e) *A sustained push* — `exploration-noise`: white noise against an Ornstein–Uhlenbeck path over
one episode, their running sums beneath, and the pole that needs the sum to grow.
(f) *The policy makes its own data* — a drawn loop (policy → batch → gradient → policy) with one
large step leaving the region the batch describes; the KL ball drawn around $\pi_{\text{old}}$ as
the Lecture 1 trust region in behaviour space.

**8. The heater through all four acts.** Acts 1–2 already learn the gain $k$ of
$x_{t+1}=x+u$ and reach $0.618$. Act 3 gets a DDPG demo on the same system: a quadratic critic
$Q_w(x,u)$ fitted by TD from a replay buffer, the actor $u=-kx$ climbing $\partial Q/\partial u$,
the learned gain against the Riccati gain, and a switch that turns the target network off so that
"target networks matter" is seen, not quoted. Act 4 gets a PPO demo on the Gaussian gain policy:
the ratio of two gains, the clip, and the step that no longer overshoots. Both closed forms are
checked in node before the widget is written, as the Act 1–2 widgets were. The two-action
temperature thread is redrawn once as a two-bar picture (the baseline line moves with the common
offset, the advantage arrows do not) or dropped in favour of the gain demos.

**9. Arithmetic slides become pictures, numbers to the notes.** The one-parameter update: the
sigmoid policy with the two scores drawn as arrows, both pointing the same way. The temperature
thread: item 8. Baseline against bootstrap: the `nstep` picture. The scalar actor: the
`continuous-argmax` climb. The TD3 target, the SAC table and the clip table: notes and captions.

**10. The map and the seams.** `control-grid` opens the chapter and every act with the policy-based
cell lit and the "delete $f$" arrow emphasised; the closing fills both model-free cells, the same
figure as Ch 9's "the cell, filled". The opening quotes p. 28 ("DQN … can only handle discrete and
low-dimensional action spaces") as the debt Lecture 8 left, answers Lecture 9's closing ("a network
that outputs the minimiser, a descendant of the third") by naming DDPG's actor as that descendant
and REINFORCE as the trajectory view's, and keeps the system-identification detour as the opening
foil (Ch 8's "why not estimate the model" rhyme). Lecture 11's "KL between policies" reference
stays true.

**11. Dissolve the appendix.** Backups 1–2 → Act 1; 3 and 4 → Act 2; 5 → Act 4; the zoo and the
translation table → the ladder and the closing thesis table; MADDPG → one reading-guide line
pointing at IE579; the reading guide and notation card → the closing.

**12. Clean-up pass.** British spelling; bullets as prose; cues and page references from `sub`
lines to notes; the learning route rewritten ("Bring from Lecture 9: the backup, the field, the
trajectory"); `::: paper` cards for the papers that carry a step (item 13); $\gamma^t$ stated once
and then dropped, saying so; the one-sentence-per-line pass; the visual walk.

**13. Paper cards.** Williams (1992) for REINFORCE, Silver et al. (2014) for the deterministic
gradient, Lillicrap et al. (2016) for DDPG, Fujimoto et al. (2018) for TD3, Haarnoja et al. (2018)
for SAC, Schulman et al. (2015, 2017) for TRPO and PPO, Schulman et al. (2016) for GAE. Mnih et al.
(2016) stays a sentence unless A3C keeps its slide.

## Decisions for the professor

- Route 1 in full (six lines, the unrolling included) or the recursion alone (three lines) with
  the unrolling and the normalisation in the note. Recommended: in full; the unrolling is where
  $d^\pi$ comes from, and the Riccati recursion of Lecture 9 was taught at the same length.
- The heater through Acts 3 and 4 (a DDPG demo and a PPO demo on the gain) or only through Acts
  1–2 as now. Recommended: both; the $\mu_\theta$-against-$K$ slide then ends on a picture of the
  learned gain beside the Riccati gain.
- The two-action temperature thread: redrawn as one picture, or dropped.
- A3C/A2C and off-policy policy gradients: one slide each, or folded into the $n$-step picture
  and the Act 4 ratio.
- Paper cards: all eight, or the five algorithms taught (REINFORCE, DDPG, TD3, SAC, PPO).
- MADDPG: a reading-guide line (recommended) or kept as a backup slide.

## Effort

Comparable to Ch 9. Core (items 1, 2, 5, 6, 10, 11, 12): one day — Act 1 and Act 2 rewritten
around the two routes and the ladder, four algorithm boxes, the tracker, the appendix dissolved;
about 61 → 66 slides. Pictures (item 7): one day — `backup-tree` ×2 modes, `pg-trajectory` ×5,
three small widgets. The heater demos (item 8): half a day each, closed forms verified in node
first. If the lecture is close, do the core and 7a–7b first; the two routes with their two pictures
are what the professor asked for.

## What was done (2026-11-21)

The professor asked for Ch 10 to be revised "by the method, form and standards of Ch 7, 8 and 9",
which approved the plan; it was applied the same day with the recommended option on every open
decision: Route 1 in full (six lines), the heater through Acts 3 and 4, the temperature thread
dropped in favour of the gain demos, A3C/A2C and the off-policy gradient as two columns of one
slide, all eight paper cards, MADDPG as one reading-guide line. 61 → 73 slides; the appendix is
gone. Walk clean (no overflow, no overlap, no over-wide maths, no console errors), the sentence-wrap
detector at zero, both CI test suites passing.

- `md/ch10_policy_based_rl.md` rewritten. Act 1: the map, the objective in Lecture 7's objects,
  finite differences as the foil, Route 1 on the backup tree and then six `\step` lines, the
  theorem boxed, Route 2 on the scored trajectory and then five lines, the maximum-likelihood
  reading, the "one theorem, two views" table in Ch 9's three-views form, REINFORCE with its card
  and box, the scored trajectory, the one-parameter picture, the demo. Act 2 is the Ψ_t ladder: the
  spine sentence of p. 35, causality with the cross-term triangle, the baseline with its four-line
  unbiasedness proof, the optimal baseline as least squares (the critic is the solution of a
  variance problem), the advantage, the three-families Venn, the one-step actor–critic box, n-step
  on the same figure, GAE's telescoping, A3C and the importance ratio, six rungs. Act 3: the wall
  pair, the collapsed backup, DPG in four lines, the autograd line, DDPG's card and box, the DDPG
  demo, the LQR-against-DDPG table, the noise picture, TD3's three changed lines in a box of its
  own, SAC. Act 4: the loop picture, TRPO with the natural-gradient step in the body, PPO's card and
  box, the clip, the PPO demo, the PPO-against-SAC table. Closing: the grid with both model-free
  cells lit, a six-plate ladder (REINFORCE, advantage, actor–critic/GAE, DPG, TRPO, PPO), the
  translation table, the hand-on, the notation card, the reading guide.
- `deck/widgets/backup-tree.js` — modes `score` and `deterministic`; `cone` takes an optional
  size. Everything else is byte-identical.
- `deck/widgets/pg-trajectory.js` (new) — one heater episode with five sampled points; modes
  `law`, `return`, `causal`, `baseline`, `nstep` (`n`); 760 × 336.
- `deck/widgets/pg-pictures.js` (new) — `families`, `scores`, `noise`, `loop`.
- `deck/widgets/ddpg-gain.js` (new) — DDPG on the heater at γ = 0.9 with a quadratic critic in the
  exact feature span of the true critic; the gain reaches the discounted Riccati gain 0.588 by
  update 300. Verified in node first. Turning the target copies off changes nothing visible on this
  linear system, so the planned toggle was dropped and "target networks matter" stays the paper's
  finding; the note says so.
- `deck/widgets/ppo-gain.js` (new) — per batch, full maximisation of the plain and the clipped
  surrogate over the gain by grid search; the plain one jumps to unstable gains (3.0, −1.0), the
  clipped one steps 0.05–0.1 and settles near 0.618. Verified in node first (seeds 1–4).
- `policy-gradient`, `continuous-argmax`, `ppo-clip` — their footer sentences broken one per line;
  `baseline-variance`, `ddpg-gain`, `ppo-gain` — the number row gets `min-height: 36px`, because the
  engine lays the slide out before the auto-run fills that row and an 8 px growth afterwards read
  as an overflow in the walk.
- Engine lessons: `IE437.math` has no `\prod`, `\Big`, `\big`; use the ∏ character and plain
  brackets. A label with a parenthesis or an underscore is routed through the maths renderer, so
  prose that contains one must be wrapped in `\text{}` or rephrased. The ladder takes six plates
  at most, which is why the closing ladder compresses Act 2 to two plates. A `::: algorithm`
  margin note is plain text: `\red{}` prints literally there.
- The one-sentence-per-line pass: 86 flagged blocks before, zero after. British spelling
  throughout; no exclamation marks.
- Not committed; the professor commits.

## Student-comprehension pass (2026-11-22)

The professor asked for the rebuilt chapter to be checked thoroughly for whether undergraduate
and master's students can follow it, and for fixes. Two reads: one by the author, one by a fresh
agent briefed only with the deck, the Ch 8 and Ch 9 decks and the schema, reporting as a careful
non-expert student. The two lists overlapped on the big items and the fresh read added the missing
bridges. All applied; 73 slides, walk clean, wrap detector at zero.

- *One objective.* The objective slide defined J with a stationary d^π while Route 1 unrolled from
  s_0 and Route 2 sampled E_τ[R(τ)]. Now J(θ) = V^π(s_0) = E_τ[Σ r_{t+1}] is the definition, the
  d^π form is "the same, averaged over the states visited", d^π is defined in words on that slide
  (how often the policy visits s from s_0; Route 1 derives it), and line 5 of Route 1 writes
  η(s) = Σ_k ρ^π(s_0→s,k) ∝ d^π on the slide. The keypoint no longer claims d^π is Lecture 7's.
- *One reward index.* r_{t+1} is the reward paid after a_t everywhere (Route 2, the noisy-estimate
  slide, every rung, the ladder plates, the pg-trajectory labels), stated once on the objective
  slide. Under the old mixed convention Rung 1's reward to go included the reward paid before a_t.
- *Symbols defined where used.* p_0(s_0) for the start distribution (μ was about to mean the
  deterministic policy); R(s,a,s') on Route 1's line 2; ρ^π(s→x,k) glossed as the k-step reach;
  Q̂_t throughout the baseline slides instead of a new R_t; the score named and tied to Lecture 2's
  log-likelihood gradient on the theorem slide, with the ∝ constant explained; h as "any h" and the
  ratio named as Lecture 6's importance ratio; ρ^μ as Act 1's d^π discounted; 𝓗 as the entropy of
  the action distribution; Â and D_KL glossed on the TRPO slide; L and H glossed on the
  natural-gradient slide; the PPO critic regresses on G_t, not an undefined Ĝ_t; r(θ) marked as
  the paper's letter, not a reward; the OU noise is ε_t, not x_t.
- *Bridges added.* REINFORCE's slide now shows the theorem turning into the per-episode sum (an
  episode's steps sample d^π, Q^π = E[G_t | s_t,a_t]) before the update; the γ sentence says the
  γ^t weight in front of the score is dropped, γ inside returns and TD errors stays. Rung 1's
  caption says the grey cells have mean zero because the expected score is zero, proved on the
  next slide. Rung 3 writes Ψ_t = Q̂_t − V^π(s_t) and its conditional expectation A^π. Rung 4 states
  E[δ_t | s_t,a_t] = A^π when V_w = V^π, so δ_t is a one-sample advantage, and the footer attributes
  the bias to bootstrapping on an inexact critic. The deterministic slide's keypoint uses Lecture
  8's bridge: the target r + γQ(s', μ(s')) needs no next action from the data, as Q-learning's max
  did not. The DPG derivation now runs stochastic objective → deterministic objective → chain rule
  (with the θ inside ρ^μ unrolling as in Route 1) → expectation. TRPO's slide says why maximising
  ratio × advantage is the policy-gradient step: at θ_old the ratio's gradient is the score.
- *Claims softened or made plain.* The optimal-baseline annotation calls the independence an
  approximation and the keypoint says "under that approximation"; "no third way" became "no cheap
  third way"; "the actor refines its action" became "is trained by following ∇_aQ"; GAE's keypoint
  no longer leans on TD(λ), which Lecture 8 never put on a slide; "diversity is paid for" became
  "once entropy earns a bonus" with the two-action numbers on the slide; the DDPG demo caption says
  γ = 0.9 and 0.588 against 0.618; the pendulum is named; Lecture 5's hazard is spelled out.
- *Quizzes.* Check 4's correct option was three lines against five-word distractors; it is now one
  line. Check 3's distractor B carries a formula so the correct option is not the only one with one.
- *The one-parameter slide* speaks of "reward minus the average reward" rather than "advantage",
  which Act 2 has not yet defined, and promises Act 2's justification.

## One format for the six algorithms (2026-11-22)

Asked whether DPG, DDPG, TD3, SAC, TRPO and PPO were each explained "easily, intuitively, at the
core, in the same format", the honest answer was half. All six had a paper card, a key equation and
a title naming the fix, but the format diverged: only TD3 marked its changed token red, SAC and TRPO
had no algorithm box while DDPG, TD3 and PPO did, DDPG's card slide had no keypoint, SAC's keypoint
carried arithmetic in prose (added in the comprehension pass, against the standing rule), and SAC
was missing from the six-plate closing ladder. The professor asked for one format. Now each of the
six card slides reads: card → a two-line `::: small` lede, **What breaks** and **The change** →
the key equation with the changed token in `\red{}` → a box where the method is a procedure →
keypoint. Added: an "Algorithm — SAC, the lines that differ from TD3" slide (act, soft target,
reparameterised actor step, temperature; footer says what stays from TD3) and an "Algorithm — TRPO"
slide (collect, gradient, conjugate-gradient direction, step to the ball's edge, backtracking check,
critic; footer names the three lines PPO removes) after the natural-gradient slide, whose keypoint
now says "PPO keeps the idea" rather than "the next slide". DDPG's card slide gained a one-line
keypoint; SAC's two-action numbers moved to the note; ladder plate 4 is "DPG, DDPG, TD3, SAC" with
the note "the score is gone; SAC samples the action and adds an entropy bonus", the plate cap of six
kept. DPG keeps its derivation in place of a box, being a theorem. 73 → 75 slides.
