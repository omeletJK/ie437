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
