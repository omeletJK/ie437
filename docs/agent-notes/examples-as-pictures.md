# Examples as pictures, not arithmetic

*The professor finds worked examples written as strings of numbers hard to lecture from; show them as a picture with concept sentences, numbers only on the figure*

On 2026-10-11, looking at Ch 5's Temperature-thread slide (a paragraph of "A = −2 − (−2.1) = 0.1, the gap
… = −1.1, B = … Exactly, 2 = 0.1 − 1.1 + 3"), the professor said numeric examples like this are hard to
explain in class and asked for picture- and concept-centred explanations instead.

**Why:** a lecturer talks over a slide; a chain of arithmetic in prose has to be read, not pointed at.
The same numbers drawn as points, bars and gaps on one chart can be explained by pointing.

**How to apply:** when a slide's example is mostly arithmetic in text, draw it — candidates as points,
errors as bars, the cost of a decision as a gap — and keep the prose to one or two concept sentences
(what was chosen, why it was wrong). Numbers may appear on the figure's labels and in a widget readout,
not as running text. Derivations (symbolic steps) are still welcome — this is about numeric worked
examples. Related: [demos-show-the-picture](demos-show-the-picture.md).

**Second instance, 2026-10-26.** Ch 6's temperature-thread slide on conditioning (bars: prior ×
success → posterior, then a "their average breaks the rule" panel) drew "무엇을 말하려고 하는 지 하나도
모르겠다". Bars of probabilities were still a derived statistic, the example had no story (why would
one heater succeed more?), and the slide asked two questions at once. Rebuilt as a literal count,
Lecture 3's rejection sampling: the generator proposes rooms, the ones that miss 22 °C are crossed
out, the kept rooms are counted (`cond-bars` modes `heater`, `try`). The right heater sits under a
window — the reason it fails. "Why one shot fails" followed in the same count (mode `rare`: 100
rooms, one kept), with its CbAS formulas moved to the presenter note. The averaging point was dropped to the note; Act 1 already makes it.
Whether the new version works for the professor is not yet confirmed. The lesson: give a toy
example a physical reason for its numbers, ask one question per slide, and show a conditional as
"keep what passes, count what is left".
