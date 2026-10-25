# One term, one picture

*When a loss is built term by term, the professor wants one fitted curve per objective, side by side, each revealed together with its term — not one figure with all curves and a static equation*

On 2026-10-13, Lecture 5 slide 24 ("First attempt — push the attacker's designs down") showed
the first-attempt loss L₁ at the top while the figure already carried plain fit, first attempt and
full COMs. The professor's rule: "목적함수에 텀이 하나씩 추가될 때마다 fitted curve가 어떻게 변하는지
보여주면 된다 … 그림이 3개가 필요하다. 각 그림은 서로 다른 3개의 목적함수에 대응된다."
Shipped as "Three terms, three fits": `::: cols c3`, each column = objective (compact math, new
term in `\hl{}`) + one `conservative-coms {"mode":"term","term":k}` panel + a two-line caption;
columns (ii) and (iii) wrapped in `::: reveal`, so → adds a term and its fit together.

**Why:** a term the students cannot yet see in the equation must not already be in the picture
(see [one-figure-format-per-story](one-figure-format-per-story.md)), and three overlaid curves under one static equation
read as "the equation did not change, only the picture did".

**How to apply:** for any penalty built additively (COMs, CQL in Lec 12, trust-region penalties),
lay out one panel per objective, equation above each, revealed left to right. A term can also be
made to appear inside a KaTeX equation with `\htmlClass{frag}{…}` — the deck collects `.frag`
spans into reveal group 1 — which is how slide 24's single-equation version worked before the
three-panel rewrite. Related: [simplify-confusing-slides](simplify-confusing-slides.md).
