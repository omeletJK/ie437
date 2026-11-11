# Ch 8 rework plan — four reviews, consolidated (2026-11-11)

*What Ch 8 (Value-Based RL) needed to meet the rules settled on Ch 7, and what was done. Four independent reviews of the 56-slide deck against the source PDF (`lecture_slides/8. Value Based Reinforcement Learning.pdf`, 114 pages, kept outside the repository) were merged into the plan below; the professor approved all of it on 2026-11-11 and it was applied the same day (56 → 77 slides).*

## Diagnosis (all four reviews agree)

- Layout is clean: no overflow, no overlapping blocks; slide 42 (Double DQN) has 5 px to spare.
- Six slides carry a picture (widgets `mc-vs-td`, `gpi-explore`, `cliff-walk`, `deadly-triad`; crops `windy-grid.svg`, `six-room-graph.svg`). The other fifty are formulas, tables and prose. The source deck is almost entirely diagrams, exactly the Ch 7 situation before 2026-11-09.
- The backup-tree grammar of Ch 7 (blue decision edge, green chance edge, fading for emphasis, red only for comparison) is never used, although the source draws SARSA (pp. 51–55) and Q-learning (pp. 62–66) on that very tree, one step per page.
- No algorithm boxes (the source has six: MC ES p34, ε-soft MC p39, TD(0) p46, SARSA p50, Q-learning p61, Q with function approximation p81, plus DQN p109), so every demo breaks the formula → algorithm → demo order.
- No ladder; the closing says "model → sample, wait → bootstrap, table → function" in words only.
- No line-by-line derivations (source: V^π five lines p43, incremental mean p29, ε-soft policy improvement p38, FA gradient p81).
- Backups still in an appendix (Backup 1–4, translation table, "One honest detour"); Ch 7 moved every backup into the body after its idea.
- Six arithmetic slides in prose or tables (two targets, same data different policy, temperature ×2, six-room updates, DQN label, Double DQN).
- Formula blocks unlabelled; US spelling in about twenty places; bullet fragments; no `::: paper` cards (DQN, Double DQN, Tsitsiklis & Van Roy, Watkins & Dayan are `{p}` citations only).

## Work plan, in priority order

**1. The backup tree continues into Ch 8** (`backup-tree` new modes). `return` (MC: one path to the terminal), `sample` (TD: one green edge actually taken, the rest faded), `sarsa` (at s′ the behaviour policy picks one a′, blue), `qlearn` (at s′ the red max arc). Each mode ends by writing the update out under the picture with the sampled numbers, as `eval` does. Replaces the "triangle" table (full / return / sample side by side) and "Two control rules" (sarsa / qlearn side by side), and absorbs the arithmetic of "One transition, two targets", "Same data, different policy" and the two temperature slides. Formulas stay below, labelled.

**2. Derivations, one line per press** (`\step`). (a) V^π written five ways (p43): definition → complete episode (label: the MC target) → sum → one step peeled → r + γV^π(s′) (label: the TD target, bootstrapping); the same device as Ch 7's Bellman derivation, so MC and TD read as "sample line 2" and "sample line 5". (b) Average of returns → incremental update → constant α (p29), one short block. (c) ε-soft policy improvement theorem (p38), four lines, right after the ε-greedy slide: the Ch 7 theorem extended to exploring policies. (d) The FA semi-gradient (p81), after the regression slide.

**3. The ladder** (`mdp-pictures` ladder plates; the plate text is currently hard-coded for Ch 7, so generalise the helper to take plates from the md). Plates: DP full backup → MC (return sampled) → TD (one step sampled, bootstrap) → SARSA (Q, sampled a′) → Q-learning (max over a′) → DQN (w, w⁻). Changed token red. Shown at the end of Act 3 and again in the closing; it replaces the appendix translation table and pairs with Ch 7's "One backup, four loop scopes" (Lecture 7 deletes loops, Lecture 8 deletes the model).

**4. Algorithm boxes** in the Ch 7 `::: block Algorithm — name | input …; output …` form, same ε, α, k conventions: TD(0) before `mc-vs-td`; MC control (ε-soft) replacing the numbered list and placed before `gpi-explore`; SARSA and Q-learning side by side, the one differing line red, before `cliff-walk`; DQN (p109) with the loop slide.

**5. The 2×2 roadmap as a tracker.** The source shows non-bootstrap/bootstrap × on/off-policy four times (pp. 12, 17, 49, 59) with the current cell filled. A small widget: all cells plain on the learning route, the current cell filled at each act opening (the `qstrip` role). Today it appears once, late in Act 3.

**6. Restore the opening** (source pp. 3–16). (a) Bandit, two or three slides: the p5 job-vs-graduate-school picture (the Ch 7 career example), Q(a) as an average, ε-greedy with the p8 curves for ε = 0 / 0.01 / 0.1 as a counted demo. The closing table already promises "bandit (Lec 8, intro)". (b) The p9 relationship table (single/multiple state × model known/unknown = optimisation / bandit / DP / RL), tied to the course cube, as "Where we are". (c) RL template loop (reuse `mdp-pictures` loop) → model-based RL with the p15 grid, four episodes and the counted T̂, R̂ → p16 "why not estimate Q* directly". Backup 4 and "One honest detour" merge into this; the body currently points at a non-existent "Act 0".

**7. Demos must state their problem first, and show a count, not a statistic.** `gpi-explore` introduces a +1/+5 grid without a word (the dp-schedules complaint); add the problem picture before it or reuse a grid the students know. `mc-vs-td`: draw the A–E chain (p57) above the chart; one review would replace the RMS-error curve with per-state bars against the true values, updated one episode at a time. `deadly-triad`: the log-scale line is a derived statistic; use the p104–105 pictures (a table changes one cell, a network changes other states too) and show divergence as the value after 10, 20, 30 updates.

**8. More source pictures.** Off-policy (p75–77): the (s, a, r, s′, a′) tuple with π_B / π_E arrows, two states of one figure. GPI (p31, p33): reuse `mdp-pictures` gpi. ε/|A| bars with the 1−ε spike (p37) on the ε-greedy slide. Six rooms (pp. 67–73) as a widget in the `sweep-backup` style: graph + R matrix + Q matrix, one source update per press (B→F 50, D→B 20, B→F 75), the changed cell red, then the converged matrix (p73); the terminal-vs-continuing discussion becomes a note. DQN (`dqn-pictures`): replay buffer queue (p100), same network used twice with "do not differentiate" (p102), target network (p107), moving target (p104–105), full schematic (p108); grow it in the source's three problems (dimensionality → CNN, correlated samples → replay, moving target → target network). The deck says "two tricks", the source "three problems": align the wording. Crops worth taking: ε curves (p8), Pac-Man unseen states (p79), the ball three-frame picture (p96) instead of the velocity table, the DQN ablation table (p113) as published evidence after the two tricks.

**9. Dissolve the appendix.** Bias–variance after TD; Q-learning convergence after Q-learning (one review: a `noisy` mode of `contraction-machine`, a noisy table still contracts on average); FA gradient after the regression slide; translation table → the ladder; reading guide → closing.

**10. Clean-up pass.** British spelling (behaviour, generalised, optimise, prioritised, stabiliser, grey); label every formula block ("Why V is not enough", the two losses in Act 4); `::: paper` cards for DQN and Double DQN (and the two theorems' papers where they carry a step); "What comes after DQN" is a four-paper tour: keep the continuous-action wall sentence, move the names to the reading guide; keypoints that describe the source ("page 57 depicts…", the 500-vs-100 slide) to notes; instructor cues in `sub` lines ("predict before revealing…", "work independently…") to notes; the DQN loop's two highlighted boxes un-highlighted; semicolon-joined keypoints split one idea per line; `Q^\*` typo in a quiz; "almost embarrassingly simple" and other colloquialisms; Learning route and "Where we are" in the Ch 7 form (lineage grid, four-act flow, `lineage-tables` with the model-free tab active first); slide 42's margin.

## Decisions for the professor

- Keep the four-act order (evaluation → improvement → on/off-policy → scaling) rather than the source's bandit → MC → TD → DQN order. All reviews recommend keeping it and changing what each slide shows, as in Ch 7.
- `mc-vs-td`: keep the error curve with the chain drawn above it, or replace with per-state bars. One review each way.
- Bandit opening: two or three new slides, or only fix the closing table's wording.
- Arithmetic slides: keep each in the body right after its idea, drawn on the tree with the numbers in the presenter note (the Ch 7 decision), or keep the tables.

## Effort

Comparable to the Ch 7 rebuild: new widget modes (backup-tree ×4, roadmap, six rooms, dqn-pictures ×5, ladder generalised), four or five crops, the markdown largely rewritten; about 56 → 70 slides. Items 1–4 are the core and fit in a day; 5–9 a second day; 10 half a day. If the lecture is close, do 1, 2, 4, 5 and 10 first.

## What was done (2026-11-11)

Everything in the plan, with these decisions on the open points: `mc-vs-td` keeps its charts and
gains the A–E chain drawn above them; the bandit opens Act 1 with two slides; every arithmetic
example is drawn on the backup tree with the numbers in the presenter note; `deadly-triad` shows the
two-state chain and |V(s₁)| after 0, 10, …, 50 updates as bars on a linear axis.

- `deck/widgets/backup-tree.js` — modes `return`, `sample`, `sarsa`, `qlearn`; `nums` writes the
  update out with the numbers and `names` relabels the nodes (the temperature thread).
- `deck/widgets/mdp-pictures.js` — the ladder takes `plates` from the markdown; Ch 7's three ladder
  slides are pixel-identical. Ch 8's six-rung ladder closes Act 4.
- New widgets `rl-roadmap` (the 2×2 map as a tracker, `cell`/`cells`/`dim`), `six-rooms` (one source
  update per press, converged Q* computed for terminal F), `dqn-pictures` (pipeline, ball, buffer,
  samenet, moving, targetnet, schematic), `bandit-arms` (arms, curves).
- `gpi-explore` and `cliff-walk` gained `mode: "problem"` for the slide before each demo.
- `build.mjs` now escapes `'` in widget option attributes; a formula's `s'` used to truncate the
  JSON silently. Use `′` in widget JSON anyway.
- `assets/ch08/pacman-states.png` is the one crop (p. 79); the ablation table (p. 113) is a markdown
  table.
- The appendix is gone: bias–variance after TD, convergence after Q-learning, the semi-gradient
  derivation after function approximation, the translation table and reading guide in the closing.

**Second pass, same day**, after three reviews of the rebuilt deck (consolidated, duplicates removed):
the five overflowing slides trimmed; "One transition, two targets" now writes the Monte Carlo line
too (`nums.mc`); "Same data, different target" writes SARSA's line beside Q-learning's (`both`);
the heater slides name the two actions and the fail state; negative numbers parenthesised; the model
count is a picture (`mdp-pictures` count); the GPI picture is labelled in Q; the ε-soft bars (p. 37)
precede the ε-greedy formula; the Act 2 quiz asks about Monte Carlo control, not Q-learning; the
windy gridworld slide is gone (the cliff carries SARSA; its asset removed); the three problems come
before the pipeline; Watkins & Dayan and Tsitsiklis & Van Roy have paper cards; the ladder uses θ on
the DQN rung, appears with four rungs after Q-learning and six at the end of Act 4, and the closing
hand-over table is folded into its note; source page numbers and teaching cues moved out of slide
text into notes; demos autoplay on arrival; `deck.js` now resets widgets before `showStep`, so
arriving from the next slide shows a stepped widget's last picture (a bug Ch 7 had too).

**Third pass, 2026-11-11**, after three post-deploy reviews (consolidated): the opening grid of
problems (p. 9) is drawn by `rl-roadmap` with `grid: "problems"` in the same frame as the map, so
slide 3 and the act openings read as one figure family; "Why Q-learning is off-policy" is the
`qlearn` tree with `both` and `policies`, π_B in blue on the data and π_E in red at the max arc, the
two rules written under it, in place of two underbrace formulas; the GPI caption says Q, and its
second keypoint sentence (the exploration tax) moved to the note, which also removes the last real
overflow; the Act 3 ladder is sized for its five plates (`upto`), not for all six; the random walk
arrives after 100 episodes; the convergence slide's label names the theorem; the four captions
that said "the source" or "press" are plain, with the press cues in notes. A fourth round the same
day: the problems grid's row heads widened and its in-figure title made an axis question; the
filled map greys off-policy Monte Carlo control as "not in this course" (`skip`); the control
tree's canvas is shorter when it writes one row, which ends SARSA's 3 px overflow; no slide is over
any more. The professor's policy, recorded in CLAUDE.md and `simplify-confusing-slides.md`:
derivations and formula theory stay in the body and are taught, never archived in an appendix.

**Fourth pass, 2026-11-11 — the student's side** (uncommitted until the professor asks). Two
readings of the deployed deck as an undergraduate or master's student would meet it, consolidated.
76 → 80 slides.

- *Nothing is used before it is explained.* "From an average to an update" moved to right after the
  bandit curves, written on rewards, so α is the step size before any update rule uses it. The first
  map slide defines prediction, control, bootstrap, on-policy and off-policy in one small block. The
  ε-soft slide defines ε-soft and ε-greedy; the soft-improvement proof says why a max beats an
  average with non-negative weights. TD's label names bootstrapping.
- *One notation.* The return is `G_t` everywhere, bridged once ("written `U_t` in Lecture 7");
  `T(s,a,s')` is glossed as `P(s'|s,a)`; the replay step uses α and the explicit squared loss, not
  η and an undefined L; the DQN box stores `r_{t+1}`. A notation card sits before the reading guide.
- *The demo runs the box.* `gpi-explore` takes `rule: "mc"` (first-visit Monte Carlo control with a
  constant step size), so the demo after the Monte Carlo control box runs that algorithm, not
  Q-learning. With ε 0.3 and seed 4 the ε-greedy agent reaches the +5 and the greedy one settles
  for the +1 inside 250 episodes.
- *New slides.* "From features to a network — what training means" (parameters, loss, gradient
  step, minibatch, and the two supervised-learning assumptions RL breaks) before the deadly triad;
  "Why the max over-estimates" with the new widget `max-bias` (five actions truly worth 0, the max
  of noisy estimates against a second independent estimate) before Double DQN; "The lecture on one
  page" (six methods × target, update timing, whose value, storage); the notation card.
- *Learning aids.* Prerequisites from Lecture 7 on the route slide; a prediction question before
  the Monte Carlo against TD demo, the bandit and six rooms; plain subtitles on TD and Q-learning;
  the convergence theorem's two step-size conditions carry red labels saying what each buys; the
  triad demo's caption gives the sign argument; first-visit against every-visit, SARSA's condition
  ε → 0 and "replay needs an off-policy rule" are on the slides, not only in notes; the windy
  gridworld in the reading guide is attributed to Sutton and Barto, Example 6.5.
- *Left out on purpose.* A student-notes toggle (an engine change), pacing marks or a split into
  two lectures, and a companion notebook: each is the professor's call. Lecture 7's own wording was
  not touched; the bridge is on the Lecture 8 side.
- *QA lessons.* The walk checks vertical overflow only: a display formula too wide for the slide is
  clipped silently, so look at wide formulas by eye (or compare each `.katex-html` right edge with
  the slide's). An inline update in an algorithm box breaks mid-bracket unless the whole expression
  is wrapped in one brace group, `${…}$`. A widget drawn at 640 px looks lost on a slide of its own;
  `max-bias` is drawn at 1040 × 340.

**Executed versus read, on the control trees (2026-11-11, after the lecture).** The SARSA and
Q-learning trees drew the next action as a *dashed* blue edge ("chosen, not yet taken") beside two
solid thin blue ones, and the professor read it the other way round: in the tree's own grammar a
thick solid blue edge is the action taken and a faded one the action not taken, and the dashed line
said nothing. The mechanism the pictures must carry is: SARSA chooses a′ by ε-greedy, puts it in
the target, *and then executes it*; Q-learning reads the best action's value for the target and
*never executes that choice*, the next action is chosen by ε-greedy only after the update. The
widget now draws it so: at s′ SARSA's chosen a′ is thick blue, the other two stay faded; Q-learning's
three branches are thin red (values read, not taken), the argmax thicker with "max … read for the
target, not executed" beside its node; and a last press draws the execution in both, a green
r_{t+2} transition from the blue branch to a blank s_{t+2} marked "executed", while the red max
branch ends at its node. Rule for the whole family: blue = taken, red = read, no dashed edges for
choices. The worked-number slides (names without `pick`) leave the execution out.

**SARSA moves into Act 2 (2026-11-11, after the lecture).** The professor asked whether Acts 2
and 3 were blurred: Act 2 is the improvement idea, Act 3 the on/off-policy question, yet Act 3
opened with SARSA, which answers Act 2's question (the GPI loop with Act 1's other estimator), and
"Act 3 on the map" lit a column (bootstrap) while its title names a row (whose value). The two
SARSA slides (tree, algorithm box) now sit at the end of Act 2, after the Monte Carlo control demo
so that box and demo stay adjacent, before the check. Act 2 lights the on-policy row (`mc-on`,
`sarsa`); Act 3 lights `q` with `mc-off` greyed "not in this course"; the Q3 strip moved to the
Q-learning slide, whose caption lost its second sentence to the note so the strip fits. Each act
now follows one axis of the map: Act 1 the columns, Act 2 the on-policy row, Act 3 the off-policy
row. Route slide, the GPI line and the revision-table note were updated to match.
