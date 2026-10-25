# Demos: a literal count, not a derived statistic

*The professor rejects demos that need decoding; they asked for a literal count or a classic textbook picture instead (cells to fill the space, 10^d)*

A widget must say one thing that can be read at a glance. On 2026-10-07 the professor twice could not
tell what the Ch 4 curse-of-dimensionality demo was explaining:
1. a histogram of σ(x)/σ₀ at random points plus an "ignorant share" curve, then
2. a 2-D window through a d-knob design, shaded by what the GP knows, with fading dots and a curve
   ("여전히 이 위젯이 무엇을 설명하는 지 모르겠다").

A third version — each dot a new design at its distance to the nearest experiment, against a
band for the GP's reach — was also rejected: "distance … to its nearest experiment" still needed
interpreting. The professor then supplied the framing: **count what it takes to fill the
space** — cut each variable into 10 cells, one experiment per cell (pigeonhole, read backwards):
10, 100, 1 000 … 10^d, drawn as a segment, a square and a cube, then bars against a ~100 budget.
That is the version built on 2026-10-07; whether it works for them was not yet confirmed.

**Why:** the message has to reach a lecture hall without a decoding step. Slices, shadings of a
derived statistic and fading encodings each add a layer the viewer must reconstruct.

**How to apply:** before building a demo, write the one sentence it proves and make the title say
it. Prefer a literal count or picture (cells, points, a segment/square/cube) over any derived
distance, ratio or posterior statistic; avoid slices and encodings by opacity. When a concept has a
classic textbook picture, use that picture first. Keep everyday units (experiments, years) in the readout,
not the picture. Also: `.wlabel` and `.wt` are uppercased, so a Greek letter in them becomes the
capital (σ shows as Σ); write the words instead. Related: [ch04-frontier-lab-papers](ch04-frontier-lab-papers.md).
