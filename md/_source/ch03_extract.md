# Ch 3 · Bayesian Network — source extract

Inventory of `lecture_slides/3. Bayesian Network.pdf` (94 pages), mapped onto the four acts of
`tex/Lecture03_Bayesian_Network.tex`.

**Act key** — A1 the joint as a graph · A2 what the graph encodes · A3 reasoning with the network ·
A4 from belief to decision · H handoff/framing · X material the tex dropped entirely.

**The headline finding.** The tex is 14 frames; the PDF is 94 pages, and it drops **three whole
bodies of material**:

1. **every worked example with numbers** — Wet Grass (3.1), Burglar Alarm (3.2), Collision
   Avoidance (3.3), Should-I-do-a-PhD (3.4), PhD-and-startup (3.5);
2. **approximate inference** — direct sampling with rejection, likelihood weighting (with the
   counter-example where it fails outright), Gibbs;
3. **the entire Dynamic Bayesian Network half** (pp. 46–73, 28 pages) — Markov chains, HMM,
   filtering as predictor × corrector, IOHMM, AR/ARCH/GARCH, linear-Gaussian state space, Kalman.
   The IOHMM graph on p. 62 (`A_t → X_t`, `X_{t-1} → X_t`, `X_t → Y_t`) **is the MDP graph**, drawn
   three lectures early. This is the single most valuable thing the tex threw away.

Plus **value of information** (p. 85) and the **sequential-decision partial ordering** (pp. 86–89),
whose recursion `U(d₁|x₁) = Σ_{x₂} max_{d₂} Σ_{x₃} max_{d₃} …` is the Bellman equation written out
before the course has a name for it.

---

## Page-by-page

### pp. 1–2 — front matter · H
p.1 title card (IE437, 2023 Spring, Jinkyoo Park). p.2 section divider "Bayesian Network".

### p. 3 — Motivation · H
**"Bayesian Network is System Modeling."** A dense hairball graph figure (≈400 red nodes, grey
edges), and underneath, in three colours: **Probability + Statistics + Graph Theory**. This is the
chapter's framing sentence and the tex keeps it. *Figure worth redrawing: no — the hairball says
"big" and nothing else.*

### p. 4 — Degree of belief and probability · H
The comparability argument, in the professor's own joke:
> G: "we can be a billionaire if we go to graduate school" vs S: "we can be a billionaire if we go
> to Samsung"

Write `G ≻ S`, `G ≺ S`, `G ∼ S`. Assumptions: **universal comparability** and **transitivity**.
Conclusion: the degree of belief can be represented by a real-valued function with
`P(G) > P(S) ⟺ G ≻ S`. **Note:** this exact slide reappears on p. 76 as *Utility theory* with the
same joke and the same axioms — belief and preference are built by the identical argument. The tex
misses that rhyme entirely; it is worth a slide.

### p. 5 — Properties of probabilities for BNs · H
Conditional probability, law of total probability, Bayes' rule. Note the PDF's conditional
probability line is mis-typed as `P(A|B) = P(B|A)/P(B)` (missing the `P(A)`); Bayes' rule two lines
below is correct.

### pp. 6–8 — Introduction to Graph Theory · A1
- p.6 graph = nodes + edges; directed vs undirected, two 5-node figures (A,B,C,D,E).
- p.7 **DAG**: side-by-side *Cyclic* (A→B→C→A) and *Acyclic* (A→B→C, A→C). "DAG will play a central
  role … will be used for the belief networks … can encode the direction dependence between the
  parent nodes and child nodes."
- p.8 path, ancestors, descendants, with a worked 8-node figure:
  `E = {(x₁,x₄),(x₁,x₈),(x₂,x₄),(x₃,x₄),(x₄,x₅),(x₄,x₆),(x₇,x₆)}`, plus the 8×8 adjacency matrix.
  Read-offs: path `x₁→x₄→x₆`; `ac(x₆) = {x₁,x₂,x₃,x₄,x₇}`; `dc(x₂) = {x₄,x₅,x₆}`;
  `pa(x₄) = {x₁,x₂,x₃}`; `ch(x₄) = {x₅,x₆}`.
  *Worth keeping:* the vocabulary (parents, children, ancestors, descendants) is used unexplained by
  the tex.

### p. 9 — Motivation of BN: the full joint · A1 · **numbers**
The three-variable joint table, with its actual entries:

| A | B | C | P(A,B,C) |
|---|---|---|---|
| 0 0 0 | | | 0.08 |
| 0 0 1 | | | 0.15 |
| 0 1 0 | | | 0.05 |
| 0 1 1 | | | 0.10 |
| 1 0 0 | | | 0.14 |
| 1 0 1 | | | 0.18 |
| 1 1 0 | | | 0.19 |
| 1 1 1 | | | 0.11 |

(sums to 1.00). `2³` entries, `2³−1 = 7` free parameters, `2^N − 1` for N binary variables,
`M^N − 1` for M-ary. "The number of parameters grows exponentially → **difficult to represent the
probability distribution and learn the parameters from data**."

### p. 10 — the satellite network · A1
The chapter's running network, drawn as a diamond:

```
   B (battery failure)        S (solar panel failure)
              ↘             ↙
                E (electrical system failure)
              ↙             ↘
   D (trajectory deviation)   C (communication loss)
```

Same counting: `2⁵` entries, `2⁵ − 1 = 31` free parameters. (The M-ary line here reads
`M^N − (M−1)`, which contradicts p. 9's `M^N − 1`; p. 9 is the correct one.)

### p. 11 — BN as compact representation · A1
Node = random variable; edge = probabilistic dependency (conditional probability); "conditional
independence described by the graph greatly reduces the computational effort to learn the model and
infer".

### p. 12 — the chain rule for BNs · A1
`P(xᵢ | pa_{xᵢ})` is the **local conditional probability distribution**; e.g. `P(E|B,S)` because B
and S are the parents of E.
$$P(x_1,\dots,x_n) = \prod_{i=1}^n P(x_i \mid \mathrm{pa}_{x_i})$$

### p. 13 — the parameter collapse, with the tables drawn · A1 · **the key number**
The satellite figure with four CPTs drawn around it (`P(B)` 2 rows, `P(D|E)` 4 rows, `P(E|B,S)` 8
rows, `P(C|E)`), and:

- chain rule: `P(B,S,E,D,C) = P(B)P(S)P(E|B,S)P(D|E)P(C|E)`
- free parameters: `P(B):1, P(S):1, P(E|B,S):4, P(D|E):2, P(C|E):2` → **total 10 against 2⁵−1 = 31**
- "Bayesian network can greatly reduce the number of parameters"

*This one line is the entire motivation for the field and belongs in a widget.* **Verified:**
1+1+4+2+2 = 10; 2⁵−1 = 31.

### p. 14 — formal definition · A1
BN = a distribution of the form `p(x) = Π p(xᵢ|pa_{xᵢ})`, drawn as a DAG. **Every** distribution can
be written as a BN (the chain rule, applied in any order). "The particular role of BN is that the
structure of the DAG corresponds to a set of **conditional independence assumptions**, namely which
ancestral parental variables are sufficient to specify each conditional probability table."

### p. 15 — conditional independence, defined · A2
`X ⊥ Y`: `p(X,Y) = p(X)p(Y)`, equivalently `p(X|Y) = p(X)`.
`X ⊥ Y | Z`: `p(X,Y|Z) = p(X|Z)p(Y|Z)`, equivalently `p(X|Y,Z) = p(X|Z)`.
"The information of Y does not give further information on X."

### p. 16 — V-structure (collider), the algebra · A2 · **derivation the tex compressed**
Four cases derived line by line, three in a blue box (independence holds) and one in a red box
(it fails):

| structure | derivation | verdict |
|---|---|---|
| `x ← z → y` (fork) | `p(x,y|z) = p(z)p(x|z)p(y|z)/p(z) = p(x|z)p(y|z)` | ⊥ given z |
| `x → z → y` (chain) | `p(x,y\|z) = p(x)p(z\|x)p(y\|z)/p(z) = p(x,z)p(y\|z)/p(z) = p(x\|z)p(y\|z)` | ⊥ given z |
| `x ← z ← y` (chain, reversed) | symmetric | ⊥ given z |
| **`x → z ← y` (collider)** | `p(x,y\|z) = p(x)p(y)p(z\|x,y)/p(z) ≠ p(x\|z)p(y\|z)` | **not ⊥ given z** |

The red box's two bullets: "x and y are **unconditionally independent**"; "x and y are **dependent
conditional on z**." *This is the derivation the tex reduced to a one-line table; restore it.*

### p. 17 — marginalisation vs conditionalisation, drawn · A2 · **figure worth redrawing**
Two columns, fork on the left (`p(x,y,z)=p(x|z)p(y|z)`) and collider on the right
(`p(x,y,z)=p(z|x,y)p(x)p(y)`), each with the same two operations drawn as before/after graphs:

|  | fork `x ← z → y` | collider `x → z ← y` |
|---|---|---|
| **marginalise** z (strike the node out) | x — y **connected** | x   y **separate** |
| **condition** on z (shade the node) | x   y **separate** | x — y **connected** |

The two operations do exactly opposite things on the two structures. A single picture that carries
the whole of d-separation.

### pp. 18–19 — Example 3.1 (Wet Grass), the model · A2 · **numbers**
```
   S (sprinkler on)      R (raining)
          ↘            ↙        ↘
            T (Tracey's grass wet)   J (Jack's grass wet)
```
`p(T,J,R,S) = p(T|J,R,S)p(J|R,S)p(R|S)p(S)` needs `8+4+2+1 = 2⁴−1 = 15` parameters; the graph's
independences reduce it to `p(T|R,S)p(J|R)p(R)p(S)`.

CPTs, exactly as given:

| p(T=1 \| R,S) | R | S |
|---|---|---|
| 1 | 1 | 1 |
| 1 | 1 | 0 |
| 0.9 | 0 | 1 |
| 0 | 0 | 0 |

| p(J=1 \| R) | R |
|---|---|
| 1 | 1 |
| 0.2 | 0 |

`p(S=1) = 0.1`, `p(R=1) = 0.2`. "The tables and graphical structure fully specify the distribution."

### p. 20 — Example 3.1, inference · A2/A3 · **the money numbers**
Two queries, worked out in full with the `Σ_J p(J|R) = 1` cancellation highlighted:

$$p(S=1\mid T=1) = \frac{0.9(0.8)(0.1) + 1(0.2)(0.1)}{0.9(0.8)(0.1)+1(0.2)(0.1)+0(0.8)(0.9)+1(0.2)(0.9)} = 0.3382$$

$$p(S=1 \mid T=1, J=1) = \frac{0.0344}{0.2144} = 0.1604$$

> "The fact that Jack's grass is also wet increases the chance that the rain has played a role in
> making Tracey's grass wet."

**Verified by enumeration in node:** 0.338235 and 0.160448 — and the prior is 0.1, so the trajectory
is **0.100 → 0.338 → 0.160**: evidence for the collider raises the sprinkler; evidence for the rival
cause pushes it back down. Two further exact values worth using, not in the PDF:
`p(S=1|T=1,J=0) = 1.000` (Jack's grass dry ⇒ no rain ⇒ the sprinkler did it) and
`p(S=1|T=1,R=1) = 0.100` (with the rain seen directly, wet grass says nothing about the sprinkler —
straight back to the prior). Also `p(S=1|J=1) = 0.100` exactly: J is *not* a descendant of the
collider, so it does not unblock it.

### p. 21 — Example 3.2 (Burglar Alarm) · A2 · **numbers, with a typo**
```
   B (burgled)    E (earthquake)
        ↘        ↙        ↘
          A (alarm)        R (radio broadcast)
```
`p(B,E,A,R) = p(A|B,E)p(R|E)p(E)p(B)`

| p(A=1 \| B,E) | B | E |
|---|---|---|
| 0.9999 | 1 | 1 |
| 0.99 | 1 | 0 |
| 0.99 | 0 | 1 |
| 0.0001 | 0 | 0 |

`p(R=1|E=1) = 1`, `p(R=1|E=0) = 0`.

**Typo in the source:** the two priors are printed as `p(E=1) = 0.01` and `p(E=1) = 0.000001`. The
second must be `p(B=1)`. **Verified:** with `p(B=1)=0.01, p(E=1)=10⁻⁶` the slide's own answers come
out exactly — `p(B=1|A=1) = 0.9900`, `p(B=1|A=1,R=1) = 0.0101`. With the labels as printed the
answers are 10⁻⁴ and nothing like 0.99. Use the corrected labels.

The story: the alarm makes burglary near-certain; the radio confirming an earthquake collapses it to
1%. **0.99 → 0.01 in one observation** — a sharper explaining-away than the wet grass.

### p. 22 — where the parameters go · A2
"Where causes the number of parameters to be reduced? → **the conditional independence assumptions
encoded by the structure**." Independence and conditional independence restated with the one-line
derivation `P(X|Y) = P(X,Y)/P(Y) = P(X)P(Y)/P(Y) = P(X)`.

### p. 23 — the satellite's own independences · A2
- `C ⊥ B | E` — "information about battery failure does not affect my belief on communication loss
  if I already know the status of electrical system failure"
- `D ⊥ S | E` — same, for trajectory deviation and solar failure

The prose gloss is what makes conditional independence mean something; the tex has none of it.

### p. 24 — the satellite's V-structure · A2
- `B ⊥ S` when E is **not** observed — "knowing there is a battery failure does not affect my belief
  regarding solar panel failure"
- `B ⊥̸ S` **given** E — "if there was an electrical system failure and there was no battery
  failure, then it is likely that a solar panel fails"
- "**Influence flows only through B → E ← S when E is known.**"

*(The slide's second bullet is printed as "B is independent S given E", which contradicts its own
gloss; the gloss is right — it becomes dependent.)*

### p. 25 — Inference: the vocabulary · A3 · **figure**
The satellite network with B tinted red, D and C tinted green:
`P(B | d¹, c¹)` — **query variable** B, **evidence variables** D and C, **hidden variables** E and S.

### p. 26 — exact inference by enumeration · A3
$$P(b^1|d^1,c^1) \propto \sum_s\sum_e P(b^1)P(s)P(e|b^1,s)P(d^1|e)P(c^1|e)$$
"The number of terms to be added together can grow exponentially with the number of hidden
variables."

### p. 27 — nothing new (duplicate build of p. 26)

### p. 28–29 — Variable Elimination · A3 · **the algorithm, step by step**
The factors are named and reduced in four stages (p. 29 shows all of them at once):

```
T₁(B) T₂(S) T₃(E,B,S) T₄(d¹,E) T₅(c¹,E)        the five CPTs
T₁(B) T₂(S) T₃(E,B,S) T₆(E)    T₇(E)            observe evidence d¹, c¹
T₁(B) T₂(S) T₈(B,S)                             T₈(B,S) = Σ_e T₃(e,B,S)T₆(e)T₇(e)
T₁(B) T₉(B)                                     T₉(B)   = Σ_s T₂(s)T₈(B,s)
```
"Normalising the product of the two factors (`T₁(B)` and `T₉(B)`) results in `P(B|d¹,c¹)`."
Boxed: "Variable elimination algorithm relies on **heuristic ordering** of variables to eliminate in
sequence → **often linear but sometimes exponential**."

Also on p. 28: the satellite graph with rounded boxes drawn around each factor's scope — a good
picture of "a factor is a set of nodes".

### pp. 30–34 — approximate inference: direct sampling · A3 · **X, the tex drops all of this**
Five build-up pages walking one ancestral sample through the satellite network:
sample `P(B)` → `P(S)` → `P(E|B=1,S=1)` → `P(D|E=1)` → `P(C|E=1)`, filling one row `1 1 1 0 0`.

p. 34 shows the finished table of ten samples:

```
B S E D C
1 1 1 0 0
0 1 0 1 0
1 0 1 1 1   ←
0 1 0 0 1
0 1 1 1 1   ←
0 1 0 0 1
0 0 0 1 0
0 1 1 1 0
0 1 0 1 1   ←
```
"Three cases coincide observations d¹, c¹" → `P(b¹|d¹,c¹) = 1/3`, `P(b⁰|d¹,c¹) = 2/3`.

### p. 35 — the rejection problem · A3 · X
Same table, with the boxed warning: **"If likelihood of evidence is small, then many samples are
required."**

### p. 36 — likelihood weighting · A3 · X
Algorithm 2.5 (LikelihoodWeightedSample) reproduced: walk the topological order; if `oᵢ = NIL`
sample from `P(Xᵢ|pa)`, else clamp `xᵢ ← oᵢ` and multiply `w ← w × P(xᵢ|pa)`. Worked on the same
three surviving rows, giving

$$P(b^1|d^1,c^1) = \frac{P(d^1|e^1)P(c^1|e^1)}{P(d^1|e^1)P(c^1|e^1)+P(d^1|e^1)P(c^1|e^1)+P(d^1|e^0)P(c^1|e^0)}$$

### p. 37 — **likelihood weighting fails** · A3 · X · **numbers**
A two-node network `C → D` with `P(c¹) = 0.001`, `P(d¹|c⁰) = 0.001`, `P(d¹|c¹) = 0.999`.
Exact Bayes:
$$P(c^1|d^1) = \frac{0.999 \times 0.001}{0.999(0.001)+0.001(0.999)} = 0.5$$
But sampling C from its prior draws `c⁰, c⁰, c⁰, …` almost forever, so the estimate is 0 until a
`c¹` finally appears. **"P(d¹|c¹) = 0 because c¹ is not sampled due to the low prior."**
*A perfect cautionary slide: the estimator is unbiased and useless.* **Verified:** 0.5 exactly.

### p. 38 — Gibbs sampling · A3 · X
Full sampler pseudocode sweeping `x₁^{(i)} ∼ P(X₁|X₂^{(i−1)},…)`, then `x₂` conditioned on the
already-updated `x₁`, and so on. "Because the samples from the early iterations are not from the
target posterior, it is common to discard these samples — **burn-in**."

### p. 39 — Jupyter demo placeholder (Wet grass, PyMC). No content.

### pp. 40–43 — Hybrid Bayesian networks · X · **figure + numbers**
A four-node aircraft-classification network, built up one node per page:
```
   W (wing span, continuous)     M (military?, discrete)
              ↘                ↙
                C (radar cross section, continuous)
                        ↓
                D (detected?, discrete)
```
- p.41 `P(w) = N(w|μ,σ²)` — a continuous node.
- p.42 `P(m¹) = θ`, `P(m⁰) = 1−θ` — a discrete node.
- p.43 **conditional linear Gaussian**:
  `P(c|w,m) = N(c | a₀w+b₀, σ₀²)` if `m=m⁰`, `N(c | a₁w+b₁, σ₁²)` if `m=m¹`.
- p.44 discrete child of a continuous parent: **logit** `P(d¹|c) = 1/(1+exp(−2(c−α)/β))` and
  **probit** `P(d¹|c) = Φ((c−α)/β)`, with a plotted sigmoid over `c ∈ [−2,5]` dBsm crossing 0.5 at
  `c = 0`.

*Why it matters here:* it is the bridge to Lecture 4 — a Gaussian process is a Bayesian network with
continuous nodes, which is exactly what this page makes legal.

### p. 45 — Naïve Bayes for classification · X
`C → O¹ … Oⁿ`. Prior `P(C)`, class-conditional `P(Oⁱ|C)`, and
`P(C|O^{1:n}) ∝ P(C) Π_i P(Oⁱ|C)`. Two lines, but it names the most-used BN in the world — and it is
the *same shape* as the influence diagram of Act 4 (a hidden cause with many observed children).

### p. 46 — Parameter learning · X
One sentence on a blank slide: "We already know how to estimate the parameters for probability
distributions — **MLE or Bayesian approach**." A deliberate call-back to Lecture 2.

### p. 47 — Structure learning · X
Bayesian score `P(G|D) = P(G)P(D|G)/P(D) = P(G)∫_θ P(D|θ,G)P(θ|G)dθ / P(D)`, and
`G* = argmax_G P(G|D)`. "Not feasible to enumerate every possible structure, so use local search."

### p. 48 — divider: Dynamic Bayesian Network

### pp. 49–51 — DBN motivation and the cascade · X → **A3/A4 bridge**
- p.49 the DBN figure with **three rows**: `A₁…A_T` (top), `X₁…X_T` (middle, chained left to right),
  `Y₁…Y_T` (bottom), plus the curved `A_t → Y_t` edges. "DBN relates variables to each other **over
  adjacent time steps**." *This is the MDP/POMDP graph, drawn in Lecture 3.*
- p.50 system state `S_t`, trajectory `S₁,…,S_t`, "`P(S₁,…,S_t)` is a very complex probability space
  → **we need a series of simplifying assumptions**", drawn as a fully connected cascade.
- p.51 cascade decomposition `P(S₁,…,S_T) = P(S₁)Π_{t≥2} P(S_t|S_{1:t−1})`.

### pp. 52–53 — the two assumptions · X
1. **Markov chain**: `P(S_t|S_1,…,S_{t−1}) = P(S_t|S_{t−L},…,S_{t−1})`; first order gives
   `P(S₁)Π P(S_t|S_{t−1})`. Drawn: first-order vs second-order chains side by side.
   > "the future is conditionally independent of the past given the present: `S_{t+1} ⊥ S_{1:t−1}|S_t`"
2. **Stationary assumption**: `P(S_{t+1}=s'|S_t=s) = P(S'=s'|S=s)` for all t → "the number of
   parameters is reduced substantially".

*These are the two assumptions Lecture 7 will simply assume; here they are derived as conditional
independences on a graph.*

### p. 54 — equilibrium and stationary distribution · X
`P(S_t=i) = Σ_j P(S_t=i|S_{t−1}=j)P(S_{t−1}=j)`; with `(p_t)_i = P(S_t=i)`,
`p_t = M p_{t−1} = M^{t−1} p₁`, and the equilibrium `p_∞ = M p_∞`.

### p. 55 — fitting a Markov model · X · **numbers**
`θ_{i|j} = P(S_τ=i|S_{τ−1}=j) ∝ Σ_t 1[S_τ=i, S_{τ−1}=j]`, the 5×5 transition matrix with
`Σ_i θ_{i|j} = 1`. Worked count on the sequence
`1,3,2,4,1,4,3,5,1,3,4,2,1,4,4,2,4,5,1,3,3,4,…` giving `θ_{3|1} = 3/5`.

### p. 56 — the transition graph · X
`X = (X₁,X₂,X₃,X₄)`, four discretised states drawn as a weighted directed graph with self-loops
(0.3 on X₁, 0.1 on X₄) and labelled arcs 0.7, 0.4, 0.5, 0.5, 0.6, 0.9. "The state transition model
`P(X'|X)` is usually sparse → **can be represented as a directed graph**."

### pp. 57–58 — Hidden Markov Model · X
Two-row graph `X_{1:T}` (hidden, blue chain) over `Y_{1:T}` (observed, red emissions).
$$P(X_{1:t},Y_{1:t}) = P(X_1)P(Y_1|X_1)\prod_{t=2}^T P(X_t|X_{t-1})P(Y_t|X_t)$$
Transition matrix `M_{i,j} = P(X_t=i|X_{t−1}=j)` (H×H); emission matrix `O_{i,j} = P(Y_t=i|X_t=j)`
(V×H).

### pp. 59–63 — the five HMM queries · X · **a table the deck should keep**
The same figure five times, each with a different band highlighted:

| query | what it asks | formula |
|---|---|---|
| **Filtering** | infer the present | `P(x_t\|y_{1:t})` |
| **Prediction** | infer the future | `P(x_t\|y_{1:u})`, `t > s` |
| **Smoothing** | infer the past | `P(x_t\|y_{1:u})`, `t < u` |
| **Likelihood** | how probable was this run | `P(x_{1:t})` |
| **Viterbi** | the most likely hidden path | `argmax_{x_{1:t}} P(x_{1:t}\|y_{1:t})` |

### p. 64 — the filtering recursion · X · **derivation worth keeping**
Line-by-line, with the cancelled conditionings struck through:
$$P(x_t|y_{1:t}) \propto \underbrace{P(y_t|x_t)}_{\text{corrector}} \sum_{x_{t-1}} \underbrace{P(x_t|x_{t-1})P(x_{t-1},y_{1:t-1})}_{\text{predictor}}$$
"Bayesian view": the previous posterior becomes the new prior; the emission is the likelihood. It is
Lecture 2's prior → posterior loop, run once per time step.

### p. 65 — IOHMM · X → **A4, the most important dropped figure**
Three rows, `A_t` on top, `X_t` in the middle, `Y_t` at the bottom, with **blue** `A_t → X_t` and
**red** `A_t → Y_t` arcs:
- state transition model `P(X_t | X_{t−1}, A_t)`
- observation model `P(Y_t | X_t, A_t)`

**That is the POMDP.** Delete `Y` and it is the MDP. The tex says "unroll the decision network and
you get the MDP"; this page has already drawn it.

### p. 66 — divider: Continuous Dynamic Bayesian Network

### pp. 67–68 — continuous-state Markov models · X
`x_t = A_t x_{t−1}` (deterministic LDS); stochastic version `x_t = A_t x_{t−1} + η_t`,
`η_t ∼ N(μ_t,Σ_t)`, equivalent to a first-order Markov model with
`p(x_t|x_{t−1}) = N(x_t | A_t x_{t−1} + η_t, Σ_t)`. *This is Lecture 9's linear system, three
lectures early.*

### pp. 69–72 — AR, time-varying AR, ARCH/GARCH · X
- p.69 AR model `x_t = Σ_{l=1}^L a_l x_{t−l} + η_t`, drawn as an L-th order Markov belief network;
  `p(x_t|x̂_{t−1}) = N(x_t | aᵀx̂_{t−1}, σ²)` — labelled "**similar to Bayesian Regression**".
- p.70 ML fit: `a = [Σ_t x̂_{t−1}x̂ᵀ_{t−1}]^{−1} Σ_t x_t x̂_{t−1}`, `σ² = (1/T)Σ(x_t − aᵀx̂_{t−1})²`
  — the normal equation of Lecture 2, arrived at from a graph.
- p.71 time-varying AR: the coefficients themselves become a latent chain `a_t = a_{t−1} + η^a_t`;
  `a*_{1:T} = argmax p(a_{1:T}|x_{1:T})` is a MAP estimate.
- p.72 ARCH / GARCH figures with the σ²_t nodes drawn into the graph:
  `σ²_t = σ₀ + Σ_i α_i(x_{t−i} − x̄_{t−i})²` and the GARCH version with `+ Σ_i β_i σ²_{t−i}`.

### pp. 73–74 — linear-Gaussian state space model · X
Transition `x_t = A_t x_{t−1} + η^x_t`, emission `y_t = B_t x_t + η^y_t`, both Gaussian; the joint
`p(x_{1:T},y_{1:T}) = p(x₁)p(y₁|x₁)Π p(x_t|x_{t−1})p(y_t|x_t)`.

### p. 75 — Kalman filter · X
The HMM filtering recursion with the sum replaced by an integral; since a product of Gaussians is
Gaussian and the integral of a Gaussian is Gaussian, `P(x_t|y_{1:t}) = N(x_t|f_t,F_t)` and the
recursion carries only `(f_{t−1},F_{t−1}) → (f_t,F_t)`. **The Kalman filter is Bayes' rule on a
Gaussian graph** — the cleanest possible statement of it.

### p. 76 — divider: Influential Diagram

### p. 77 — Motivation · A4 · **the headline figure**
**Bayesian Network + Decision node + Utility node = Decision network (influence diagram).**
```
        T (treat?)          ⟵ ⟵ ⟵ (information edge, dashed blue, from O¹)
        │                 ↘
   D (disease?) ────────→ ◇ U
     ↙   ↓   ↘
   O¹   O²   O³   (results from diagnostic tests)
```
Legend: ◯ chance node = a random variable · ▢ decision node = a decision to be made ·
◇ utility node = an additive utility component.

### p. 78 — Utility theory · A4
**The same joke as p. 4**, with A/B instead of G/S: "we can be a millinery if we go to graduate
school" vs "… Samsung". `A ≻ B`, `A ≺ B`, `A ∼ B`. The deliberate rhyme: preference is built exactly
the way belief was.

### p. 79 — Constraints on rational preference · A4
Completeness, transitivity, **continuity** (`A ≻ B ≻ C` ⟹ ∃p with `[A:p; C:1−p] ∼ B`),
**monotonicity** (`A ≻ B` ⟹ `[A:p; C:1−p] ≻ [B:p; C:1−p]`). Then the representation:
`P(A) > P(B) ⟺ A ≻ B`.

### p. 80 — utility functions and lotteries · A4
"**Just as beliefs can be subjective, so can preferences.**" A lottery is `[S₁:p₁; …; S_n:p_n]` and
$$U([S_1{:}p_1;\dots;S_n{:}p_n]) = \sum_i p_i U(S_i)$$

### p. 81 — maximum expected utility · A4 · **the equation of the act**
$$\mathrm{EU}(a|o) = \sum_{s'} \underbrace{P(s'|o,a)}_{\text{probabilistic model}}\; \underbrace{U(s')}_{\text{utility function}}, \qquad a^* = \argmax_a \mathrm{EU}(a|o)$$
"Reach rational decisions with imperfect knowledge of the state of the world."

*Note the variable naming: `s'` for the outcome, `a` for the action, `P(s'|o,a)` for the model. This
is the Bellman one-step backup with the letters already correct.*

### p. 82 — utility of money · A4 · **figure**
Two curves side by side, concave (blue) and convex (red), utility against money, with the lottery
`A: winning $1 with probability 1` vs `B: winning $100 with probability 0.01` (equal expectation):
**risk averse** prefers A, utility concave · **risk neutral** indifferent, utility linear ·
**risk seeking** prefers B, utility convex.

### p. 83 — multiple-variable utility · A4 · **the parameter argument, again**
`U(X^{1:n})` with all n parents needs `2ⁿ` parameters; assuming an **additive decomposition**
`U(X^{1:n}) = Σ_i U(Xⁱ)` needs `2n`. Drawn as one diamond with n parents vs n diamonds with one
parent each. "**Different additive decomposition can be explicitly imposed on the network
structure.**" *The same exponential→linear move as Act 1, now on the utility rather than the belief.
That parallel is worth stating out loud; the tex misses it.*

### p. 84 — Example 3.3 (Collision avoidance) · A4
`A (alarm), C (collision) → U` with the 4-row table `U(a⁰,c⁰) … U(a¹,c¹)`, against the decomposed
version `H,V → U¹` and `A → U²` with `U(h,v,a) = U¹(h,v) + U²(a)`. (Symbolic — no numbers given.)

### p. 85 — Decision network, with a utility table · A4 · **numbers + edge taxonomy**
The treat/disease diagram again, now with

| T | D | U(T,D) |
|---|---|---|
| 0 | 0 | 0 |
| 0 | 1 | −10 |
| 1 | 0 | −1 |
| 1 | 1 | −1 |

and the three edge types named: **conditional edge** (green, into a chance node) ·
**functional edge** (red, into a utility node) · **information edge** (dashed blue, into a decision
node — "often omitted").

Read the table: not treating a sick patient costs 10; treating costs 1 whether or not they are ill.
So treat whenever `P(D=1) > 1/9`. *(That threshold is mine, not the slide's, but it is what the four
numbers say and it makes the table speak.)*

### p. 86 — computing the expected utility · A4
With a single observation `O¹ = o¹₁`:
$$\mathrm{EU}(t^1|o_1^1) = \sum_{o_3}\sum_{o_2}\sum_d P(d,o_2,o_3|t^1,o_1^1)U(t^1,d,o_1^1,o_2,o_3) = \sum_d \underbrace{P(d|t^1,o_1^1)}_{\text{any inference method}} U(t^1,d)$$
"Compare `EU(t⁰|o¹₁)` and `EU(t¹|o¹₁)` and choose the treatment that leads to maximum EU."
*The point the slide is quietly making: Act 3's inference machinery is the engine inside Act 4.*

### p. 87 — Value of information · A4 · **the bridge to Lecture 4**
`EU*(o) = max_a EU(a|o)` and
$$\mathrm{VOI}(O^{\text{new}}|o) = \Big(\sum_{o^{\text{new}}} P(o^{\text{new}}|o)\,\mathrm{EU}^*(o^{\text{new}},o)\Big) - \mathrm{EU}^*(o)$$
"The value of information about a variable is the increase in expected utility with the observation
of that variable." Caveat: "VPI only captures the increase in expected utility → need to consider
the cost of observing."

**This is the acquisition function of Bayesian optimisation** (Lecture 4's knowledge gradient /
expected improvement), written down here first. The tex has none of it.

### pp. 88–90 — sequential decision making, partial ordering · A4 · **the Bellman equation, early**
- p.88: "The sequential decision making problem will be extended later to problems in **control
  theory** and **reinforcement learning**." Influence diagram defines a partial ordering
  `X₀ ≺ D₁ ≺ X₁ ≺ D₂ ≺ … ≺ X_{n−1} ≺ D_n ≺ X_n`, `X_k` being the variables revealed between `D_k`
  and `D_{k+1}`.
- p.89: the four-step figure — `d₁…d₄` (decision squares, only `d₁` solid) over `x₁→x₂→x₃→x₄`
  (chance) over `u₂,u₃,u₄` (utility diamonds), with `d_t → x_{t+1}` arrows. Transition
  `p(x_{t+1}|x_t,d_t)`, additive utility `U(x_{1:4}) = Σ_{t=2}^4 u(x_t)`, and
  $$U(d_1|x_1) = \sum_{x_2}\max_{d_2}\sum_{x_3}\max_{d_3}\ \prod_{t=1}^{3} p(x_{t+1}|x_t,d_t)\sum_{t=2}^{4} u(x_t)$$
  then the general-T version.
- p.90: the general form
  $$U(d_1|x_0) \equiv \sum_{X_1}\max_{D_2}\cdots\sum_{X_{n-1}}\max_{D_n}\sum_{X_n}\prod_{i\in\mathcal L}p(x_i|\mathrm{pa}(x_i))\sum_{j\in\mathcal T}U_j(\mathrm{pa}(u_j))$$
  and `d*₁ = argmax_{d₁} U(d₁|x₀)`.

**The alternating `Σ max Σ max` is the Bellman recursion.** The transition `p(x_{t+1}|x_t,d_t)` is
`P(s'|s,a)`; the additive `Σ_t u(x_t)` is the return. Lecture 7's whole apparatus is on this page,
unnamed. *The single strongest reason the spine calls this chapter the seed.*

### pp. 91 — Example 3.4 (Should I do a PhD?) · A4 · **the worked influence diagram**
```
   E (do PhD / no PhD)  ─→  U_C          E ─→ P (prize / no prize)
        └──────────────→  I (low/avg/high) ←── P
                              └──→ U_B
```
Ordering `E* ≺ {I,P}`. Domains: `E ∈ {do PhD, no PhD}`, `P ∈ {prize, no prize}`,
`I ∈ {low, average, high}`.

**Utilities.** `U_C(do PhD) = −50 000`, `U_C(no PhD) = 0`;
`U_B(low) = 100 000`, `U_B(average) = 200 000`, `U_B(high) = 500 000`.

**Probabilities.** `p(prize | no PhD) = 10⁻⁷`, `p(prize | do PhD) = 0.001`.

| p(I \| E,P) | low | average | high |
|---|---|---|---|
| do PhD, no prize | 0.1 | 0.5 | 0.4 |
| no PhD, no prize | 0.2 | 0.6 | 0.2 |
| do PhD, prize | 0.01 | 0.04 | 0.95 |
| no PhD, prize | 0.01 | 0.04 | 0.95 |

$$U(E) = \sum_{I,P} p(I|E,P)\,p(P|E)\,[U_C(E) + U_B(I)]$$
**`U(do PhD) = 260 174` · `U(no PhD) = 240 000`** → do the PhD.

**Verified in node to the rupee:** 260 174.00 and 240 000.0244.

### pp. 92–93 — Example 3.5 (PhD and start-up companies) · A4 · **the answer flips**
Adds a second decision `S ∈ {yes, no}` (found a start-up), an information edge `P ⇢ S`, a utility
`U_S(start up) = −200 000`, `U_S(no start up) = 0`, and — the substantive change — **the income
node's parents move**: income is now conditioned on `S` and `P`, not on `E`.

| p(I \| S,P) | low | average | high |
|---|---|---|---|
| start up, no prize | 0.1 | 0.5 | 0.4 |
| no start up, no prize | 0.2 | 0.6 | 0.2 |
| start up, prize | 0.005 | 0.005 | 0.99 |
| no start up, prize | 0.05 | 0.15 | 0.8 |

Ordering `E* ≺ P ≺ S* ≺ I`, and
$$U(E) = \sum_P \max_S \sum_I p(I|S,P)\,p(P|E)\,[U_C(E)+U_B(I)+U_S(S)]$$
"(where we assume that the optimal decisions are taken in the future)"

**`U(do PhD) = 190 195` · `U(no PhD) = 240 002`** → **do not** do the PhD.

**Verified in node:** 190 195.00 and 240 000.0195 (the slide's 240 002 is a rounding artefact; the
comparison is unaffected). Also verified: at the inner `max`, **"no start up" wins in every branch** —
the added option is never exercised, yet the decision flips, because the PhD's only remaining route
to income is the 0.001 chance of the prize, which does not repay 50 000. *A genuinely instructive
result and the best possible advert for drawing the graph before arguing about the numbers.*

### p. 94 — Questions?

---

## What to build, and where the numbers come from

| widget | claim it settles | source pages | numbers verified |
|---|---|---|---|
| `factor-count` | a joint of 5 binary variables needs 31 numbers; its DAG needs 10 — exponential becomes linear | pp. 9, 10, 13 | 2⁵−1 = 31 vs 1+1+4+2+2 = 10; n·2^k against 2ⁿ−1 across n |
| `d-separation` | observing a **collider** creates dependence where there was none | pp. 16–20 | prior 0.100 → `P(S=1\|T=1)` 0.338 → `P(S=1\|T=1,J=1)` 0.160; `P(S=1\|J=1)` = 0.100 exactly |
| `inference-cost` | enumeration is exponential in the hidden variables; pushing the sums inward is linear | pp. 26, 28–29 | chain of n: 2^{n−2} terms vs 8(n−2) multiplications — at n = 20, 262 144 vs 144 |
| `influence-diagram` | belief + action + utility computes one decision, and it is a one-stage MDP | pp. 77, 81, 85, 91–93 | 260 174 vs 240 000; with the start-up option, 190 195 vs 240 000 |

## What the tex dropped that the chapter should restore

1. **Every number.** Wet grass (0.338 → 0.160), burglar alarm (0.99 → 0.01), the PhD (260 174 vs
   240 000, then 190 195 vs 240 000). The tex asserts explaining-away; the PDF proves it.
2. **The marginalise-vs-condition picture** (p. 17) — one figure that contains all of d-separation.
3. **Approximate inference**, and specifically the likelihood-weighting failure (p. 37) where the
   true answer is 0.5 and the sampler returns 0.
4. **The DBN half** (pp. 46–75), of which the load-bearing pages are the IOHMM (p. 65) and the
   filtering recursion (p. 64). The IOHMM is the POMDP; strike `Y` and it is the MDP.
5. **Value of information** (p. 87) — the acquisition function of Lecture 4, three weeks early.
6. **The `Σ max Σ max` recursion** (pp. 89–90) — the Bellman equation, four lectures early.
7. **Utility built by the same axioms as belief** (pp. 4 and 78, the same joke twice) — and the
   additive utility decomposition (p. 83) as the same exponential→linear move as Act 1.
