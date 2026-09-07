---
ch: 3
title: Bayesian Networks
subtitle: A belief about many things is a graph
tagline: Structure tames the joint — and once a decision hangs off the graph, every later lecture is already in the room
blurb: >-
  A belief about many variables at once, drawn as a graph. Factorization is what makes an
  intractable joint tractable, d-separation says what the graph implies about independence, and
  adding decision and utility nodes turns it into an influence diagram — a decision model that leads toward MDPs, and the
  seed of the entire second half of the course.
course: IE437 · Data-Driven Decision Making and Control
author: Jinkyoo Park
institute: KAIST
cube:
  stages: static
  model: data-driven
  agents: single agent
inherits: a belief over one parameter (Lecture 2)
handoff: structured belief, plus decision and utility nodes — the influence diagram, a precursor to MDPs (Lectures 4 and 7)
questions:
  - Why a graph?
  - What does it encode?
  - How do I infer?
  - How do I decide?
---

### Bayesian Networks
{layout: title}

### Where we are — one unknown becomes many
::: figure.plain original-system-modeling | 590
Original PDF p. 3 · probability + statistics + graph theory.
:::

Lecture 2 updated one unknown. A Bayesian network connects many interacting variables: **represent a system, infer its hidden parts, then decide**.

### Learning route — from a joint probability to a decision
**Bring:** Bayes' rule and marginalization from Lecture 2.

| First pass | What to do |
|---|---|
| **Follow the idea** | Represent → infer → learn local tables → track a hidden state → choose by utility |
| **Work without the solution** | Compute a posterior, one filtering update and an expected-utility choice. |
| **Return later** | Structure search, hybrid/time-series extensions and full elimination derivations are references. |

::: keypoint
For the temperature thread: **predict → calculate → reveal and check → change one condition**. Complete the core calculation before reading the research extensions.
:::

## Act 1 — the joint as a graph
{short: ACT 1, num: Act 1}

**Q1.** Every distribution factorises somehow. A Bayesian network is a factorisation you can draw — and drawing it is what makes it cheap.

### A joint, written out in full
{q: 1}

::: qstrip
:::

::: cols
::: col
| $A$ | $B$ | $C$ | $P(A,B,C)$ |
|---|---|---|---|
| 0 | 0 | 0 | 0.08 |
| 0 | 0 | 1 | 0.15 |
| 0 | 1 | 0 | 0.05 |
| 0 | 1 | 1 | 0.10 |
| 1 | 0 | 0 | 0.14 |
| 1 | 0 | 1 | 0.18 |
| 1 | 1 | 0 | 0.19 |
| 1 | 1 | 1 | 0.11 |
:::
::: col.accent Three binary variables, and what the table costs
$2^3 = 8$ rows — every combination $A$, $B$ and $C$ can take. The last is forced by the others, so $2^3-1 = 7$ free numbers.

The table is *complete*: every question about $A$, $B$ and $C$ is a sum over some of its rows, and nothing is assumed.

That completeness is exactly the problem. It is ==useless at scale==, because a flat table has no way to say that $A$ is irrelevant to $C$ once $B$ is known.

A graph can say it. That is the whole content of this act.
:::
:::

### First read the arrows — directed and undirected graphs
{sub: original PDF p. 6}

::: figure.plain original-directed-undirected | 770
Original node positions and arrow directions, PDF p. 6.
:::

::: keypoint
An edge connects two nodes. An arrow also gives a direction. A Bayesian network uses directed edges.
:::

### A directed acyclic graph, and the words for reading one
::: figure.plain original-cycle-dag | 820
Original PDF p. 7 · follow the arrows and try to return to the starting node.
:::

A **directed acyclic graph (DAG)** has no directed cycle. On the left, $A\to B\to C\to A$ returns to $A$; on the right it cannot.

::: keypoint
A DAG gives a **topological order**: generate each variable after its parents. Arbitrary tables on a directed cycle do not provide this guarantee.
:::

### Read one graph three ways — nodes, edges and a matrix
{sub: original PDF p. 8}

::: figure.plain original-graph-vocabulary | 1010
Original PDF p. 8 · the same eight-node graph, edge list and adjacency matrix.
:::

::: keypoint
Read arrows entering $x_4$: its parents are $x_1,x_2,x_3$. Follow arrows leaving it: its children are $x_5,x_6$.
:::

### A satellite — two causes and two visible symptoms
{sub: original PDF p. 11}

::: figure.plain original-satellite | 870
Original PDF pp. 10–12 · retain the diamond-shaped system diagram.
:::

::: keypoint
Battery $B$ and solar panel $S$ feed electrical state $E$; $E$ feeds trajectory $D$ and communication $C$. Read each node as a random variable.
:::

### The factorisation — one joint, written locally
A **Bayesian network** specifies $p(x_1,\ldots,x_n)=\prod_i p(x_i\mid\mathrm{pa}_i)$ on a DAG.

::: figure.plain original-satellite-tables | 740
Original PDF p. 13 · each table sits beside the node whose local distribution it specifies.
:::

$$p(B,S,E,D,C)=p(B)p(S)p(E\mid B,S)p(D\mid E)p(C\mid E).$$

**Free parameters:** $1+1+4+2+2=10$, compared with $2^5-1=31$ in the full joint.

### Multiply first, then sum — a two-node calculation
{sub: an illustrative sensor model; each row has a clear role}

Let $F$ mean a machine fault and $A$ mean an alarm: $F\to A$. Use $P(F)=0.1$, $P(A\mid F)=0.8$, $P(A\mid\neg F)=0.2$.

| Case | Local probabilities | Joint probability |
|---|---|---|
| Fault and alarm | $0.1\times0.8$ | $0.08$ |
| No fault and alarm | $0.9\times0.2$ | $0.18$ |

The alarm probability sums both possible causes: $P(A)=0.08+0.18=0.26$.

$$P(F\mid A)=\frac{P(F,A)}{P(A)}=\frac{0.08}{0.26}\approx0.308.$$

::: keypoint
==Multiply along a complete case, add mutually exclusive cases, normalise after observing evidence.== An alarm increases the fault probability from 10% to about 31%; it does not make a fault certain.
:::

### The collapse, in numbers
{fill: top}

::: widget factor-count
The joint's cost is $2^n-1$ whatever you do. With a fixed upper bound on the number of parents, each binary node needs a bounded-size table. ==The network then grows linearly in the number of nodes== while the full joint grows exponentially. Slide $n$ and watch the gap open; the satellite sits at $n=5$, where 31 becomes 10.
:::

### The wall — a joint distribution is exponentially large
{fill: center}

For $n$ binary variables the joint $p(x_1,\dots,x_n)$ is a table of $2^n$ rows, so specifying it takes

$$2^n - 1 \quad\text{independent numbers} \qquad (M^n - 1 \text{ if each variable has } M \text{ values})$$

::: reveal
Five binary variables need 31 numbers. Twenty need 1 048 575. Thirty need over a billion. ==Too many to store, far too many to estimate from data, and hopeless to sum over.==
:::

::: reveal
::: keypoint
The escape is structure: ==a belief about many things is a graph.==
:::
:::

### Every distribution is a Bayesian network — and that is the catch
The chain rule already writes any joint as a product of conditionals:

$$p(x_1,\dots,x_n) = p(x_n\mid x_1,\dots,x_{n-1})\,p(x_{n-1}\mid x_1,\dots,x_{n-2})\cdots p(x_1)$$

which is a Bayesian network — on the *fully connected* DAG. It costs exactly $2^n-1$ numbers and buys nothing.

::: reveal
::: keypoint
The saving is not in the factorisation. It is in ==the edges you leave out.==
:::
:::

::: reveal
::: small
$p(C \mid E)$ rather than $p(C \mid E,B,S,D)$ is a conditional-independence claim: once the electrical state is known, the other listed variables add no information about communication loss. Observing descendants $D,C$ can still change our belief about $E$, even when $B,S$ are known. The DAG *is* the model, and every missing arrow is an assumption you are on the hook for. Act 2 says exactly which assumptions a given DAG makes.
:::
:::

### Check — where the saving comes from
{q: 1}

::: quiz A Bayesian network factorises the joint as $\prod_i p(x_i \mid \mathrm{pa}(x_i))$. Where does the reduction from $2^n$ numbers actually come from?
- =From the edges left *out*: each factor conditions only on parents, not on all predecessors
- From the factorisation itself — writing the joint as a product of conditionals
- From assuming every variable is binary
- From the topological ordering chosen for the chain rule
The chain rule $p(x_1)p(x_2 \mid x_1)p(x_3 \mid x_1,x_2)\cdots$ is **always** true and saves nothing — the last factor still conditions on everything. What buys the reduction is each missing edge, every one of which is a claimed conditional independence. A Bayesian network is therefore a statement about what does *not* influence what, and its compactness is only as honest as those claims.
:::

## Act 2 — what the graph encodes
{short: ACT 2, num: Act 2}

**Q2.** The full graph specifies conditional independences. A missing direct arrow alone does not rule out dependence through another path.

### Conditional independence — the meaning of a missing edge
{q: 2}

::: qstrip
:::

::: cols
::: col Independence
$$X \perp Y \iff p(X,Y) = p(X)p(Y)$$

equivalently $p(X\mid Y) = p(X)$: learning $Y$ tells you nothing about $X$.
:::
::: col.accent Conditional independence
$$X \perp Y \mid Z \iff p(X,Y\mid Z) = p(X\mid Z)\,p(Y\mid Z)$$

equivalently $p(X\mid Y,Z) = p(X\mid Z)$: ==once you know $Z$, learning $Y$ tells you nothing further about $X$.==
:::
:::

::: reveal
The DAG's basic promise is the **local Markov property**: a variable is independent of its non-descendants given its parents. In the satellite network, $C \perp B \mid E$ — knowing the battery failed does not move your belief about communication loss ==if the electrical system's state is already known==. Likewise $D \perp S \mid E$.
:::

::: reveal
::: small
That single sentence is what the missing edges $B \to C$ and $S \to D$ mean. This is also why the binary conditional $p(C \mid E)$ has two free numbers; conditioning on four binary variables would require sixteen.
:::
:::

### See why the collider is different
{sub: original PDF p. 16}

::: figure.plain original-three-structures | 610
Original PDF p. 16 · blue: conditioning separates; red: conditioning can couple.
:::

::: keypoint
The three blue rows factor after observing $z$. In the red row, $p(z\mid x,y)$ still connects the two causes.
:::

### Three structures, three verdicts
Chain any two variables through a third and there are only three shapes. Whether $X$ and $Y$ are independent depends on the shape *and* on whether the middle node is observed.

::: table center
| structure | shape | $X \perp Y$ with $Z$ **unobserved** | $X \perp Y$ **given** $Z$ |
|---|---|---|---|
| chain | $X \to Z \to Y$ | not guaranteed | **yes** |
| fork (common cause) | $X \leftarrow Z \to Y$ | not guaranteed | **yes** |
| collider (common effect) | $X \to Z \leftarrow Y$ | **yes** | ==not guaranteed== |
:::

::: reveal
For these isolated graphs, observing a chain or fork middle node **blocks** the path; observing a collider **opens** it. An open path permits dependence:

$$\begin{aligned}
\text{fork: }\quad p(x,y\mid z)&=p(x\mid z)p(y\mid z),\\
\text{collider: }\quad p(x,y\mid z)&=\frac{p(x)p(y)\,\hl{p(z\mid x,y)}}{p(z)}\;\not\equiv\;p(x\mid z)p(y\mid z).
\end{aligned}$$
:::

::: reveal
::: small
D-separation guarantees independence for **every** compatible probability table. An open path gives no such guarantee; special tables can still make the variables independent.
:::
:::

### Marginalize or condition — watch the connection change
{sub: original PDF p. 17}

::: figure.plain original-marginalize-condition | 790
Original PDF p. 17 · left: common cause; right: common effect.
:::

::: keypoint
Crossed-out $z$: sum it out. Shaded $z$: observe it. A remaining line permits dependence; disconnected nodes are independent.
:::

### Explaining away — the collider, in words
{sub: nothing changed in the world; something changed in what you know}

::: figure.plain original-satellite-observed | 870
Original PDF p. 24 · the electrical failure is observed; the competing causes are highlighted.
:::

**Before:** $B$ and $S$ are independent. **Observe $E$:** the electrical system failed. **Then learn $B$ failed:** in a competing-causes model, less evidence is needed for $S$ to explain $E$.

::: keypoint
The collider permits **explaining away**. Its probability table determines the sign and size of the dependence.
:::

### Wet grass — the graph and its probability tables
{sub: original PDF p. 19}

::: figure.plain original-wet-grass | 690
Original PDF p. 19 · graph above, local probability tables below; the table label is corrected to $p(T\mid R,S)$.
:::

::: keypoint
First specify the model. Next ask whether wet grass supports the sprinkler, the rain, or both.
:::

### Wet grass — explaining away, with numbers
{sub: Example 3.1}

::: cols
::: col The model
$S$ sprinkler on · $R$ raining · $T$ Tracey's grass wet · $J$ Jack's grass wet

$$S \to T \leftarrow R \to J$$

$$p(T,J,R,S) = p(T\mid R,S)\,p(J\mid R)\,p(R)\,p(S)$$

$p(S{=}1) = 0.1$, $p(R{=}1)=0.2$; the grass is certainly wet if it rained, wet with probability 0.9 if only the sprinkler ran, and dry otherwise; $p(J{=}1\mid R{=}1)=1$, $p(J{=}1\mid R{=}0)=0.2$.
:::
::: col.accent The two queries
$$p(S{=}1) = \hl{0.100}$$

$$p(S{=}1\mid T{=}1) = \frac{0.092}{0.272} = \hl{0.338}$$

$$p(S{=}1\mid T{=}1,J{=}1) = \frac{0.0344}{0.2144} = \hl{0.160}$$

Tracey's wet grass more than triples the suspicion of the sprinkler. Then Jack's wet grass — ==evidence for the rival cause== — halves it again.
:::
:::

::: reveal
::: small
Note that $J$ is not on the collider path at all; it is a child of $R$. It moves the answer only because it moves $R$, and $R$ competes with $S$ to explain $T$. Note also that $p(S{=}1 \mid J{=}1) = 0.100$ exactly — with $T$ unobserved, Jack's lawn says nothing whatever about Tracey's sprinkler.
:::
:::

### Evidence, entered by hand
{fill: top}

::: widget d-separation
Click a node to observe it. The two blue edges are the collider path $S \to T \leftarrow R$; they light when observing $T$ opens it. The readout is the exact posterior over the sprinkler, computed by enumerating all sixteen states. Observe $T$ alone and the collider opens; ==add $J$ and the rain explains the sprinkler away==; observe $R$ directly and the sprinkler snaps back to its prior, because with the rain known, wet grass says nothing.
:::

### Burglar alarm — two competing explanations
{sub: original PDF p. 21}

::: figure.plain original-alarm | 835
Original PDF p. 21 · the first prior label is corrected to $P(B=1)=0.01$.
:::

::: keypoint
The alarm has two parents. A radio report is evidence about earthquake $E$; after hearing the alarm, it can change our belief about burglary $B$.
:::

### The burglar alarm — the same move, sharper
{sub: Example 3.2}

::: cols
::: col The model
$B$ burgled · $E$ earthquake · $A$ alarm sounds · $R$ radio reports a quake

$$B \to A \leftarrow E \to R$$

$p(B{=}1) = 0.01$, $p(E{=}1) = 10^{-6}$. The alarm is near-certain given either cause and almost never fires without one; the radio reports a quake exactly when there is one.
:::
::: col.accent The collapse
$$p(B{=}1) = 0.01$$

$$p(B{=}1 \mid A{=}1) = \hl{0.99}$$

$$p(B{=}1 \mid A{=}1, R{=}1) = \hl{0.01}$$

The alarm makes a burglary near-certain. One radio bulletin — which says nothing about burglars — sends it ==straight back to the prior.==
:::
:::

::: reveal
::: small
$R$ is not connected to $B$ by any edge, and the two are marginally independent. They become strongly dependent the instant the alarm is heard. If you wanted one slide to justify learning d-separation properly, this is it.
:::
:::

### What the missing edges buy
::: flow | | 
- **Storage** | $2^n-1$ numbers collapse to a sum of small local tables
- **Learning** | far fewer parameters, so far less data to estimate them from
- !**Reasoning** | independence lets sums factor — which is the whole of Act 3
:::

::: reveal
::: block.accent The complete test | d-separation
Chaining the three structures across a whole graph gives **d-separation**: a purely graphical criterion that decides, for any three disjoint sets $\mathbf{X}, \mathbf{Y}, \mathbf{Z}$, whether the DAG entails $\mathbf{X} \perp \mathbf{Y} \mid \mathbf{Z}$. A path is blocked by an observed chain or fork node, and by an *un*observed collider whose descendants are also unobserved. Block every path and the independence holds.
:::
:::

::: reveal
::: small
A blocked path supports an independence claim. An open path allows dependence; extra independence can occur for special parameters. Also, arrows encode a factorisation, not a causal intervention unless a causal interpretation is explicitly assumed.
:::
:::

### Check — the collider
{q: 2}

::: quiz Two independent causes point at one effect: $X \to Z \leftarrow Y$. What is the relationship between $X$ and $Y$?
- Dependent, and conditioning on $Z$ makes them independent
- =Independent before conditioning; observing $Z$ can make them dependent
- Independent, and they stay independent whatever you condition on
- Dependent, and no conditioning changes that
This is the collider, and it runs opposite to the chain and the fork. Learning the alarm went off makes burglary and earthquake **compete** to explain it, so hearing that there was an earthquake lowers your belief in a burglary — they became dependent the moment you conditioned on their shared effect. *Explaining away* is the reason d-separation needs a special rule for colliders, and it is a standard way to introduce a correlation that is not there.
:::

## Act 3 — reasoning with the network
{short: ACT 3, num: Act 3}

**Q3.** A model you cannot query is decoration. Inference is where the factorisation earns its keep — and where it still, sometimes, fails.

### The query, and three kinds of variable
{q: 3}

::: figure.plain original-query-evidence | 860
Original PDF p. 25 · orange: query; green: observed evidence; white: hidden variables.
:::

$$P(B\mid D=1,C=1)$$

**Keep $B$** as the query. **Fix $D,C$** at their observed values. **Sum over $E,S$**, then normalise.

### Exact inference — and why it hurts
Marginalise the joint over the hidden variables and normalise:

$$P(b^1\mid d^1,c^1) \;\propto\; \sum_{s}\sum_{e} P(b^1)P(s)P(e\mid b^1,s)P(d^1\mid e)P(c^1\mid e)$$

::: reveal
This is correct, and it is a disaster. The number of terms is the number of joint assignments to the hidden variables — ==exponential in how many there are==. The curse the factorisation was supposed to have removed comes back the moment we sum.
:::

::: reveal
::: keypoint
Storing the joint cheaply is not the same as ==summing over it cheaply.==
:::
:::

### A factor covers the variables in one local table
{sub: original PDF p. 27}

::: figure.plain original-elimination-factors | 390
Original PDF p. 27 · each outline groups the variables of one factor.
:::

::: keypoint
The large outline covers $E,B,S$: it is $p(E\mid B,S)$. Eliminating $E$ combines every factor that mentions $E$.
:::

### Variable elimination — push each sum past what it cannot touch
$P(b^1)$ does not depend on $s$ or $e$. $P(s)$ does not depend on $e$. So slide each sum inward until it meets a factor that actually mentions its variable:

$$P(b^1\mid d^1,c^1) \;\propto\; P(b^1)\sum_{e} P(d^1\mid e)P(c^1\mid e)\hl{\sum_{s} P(s)P(e\mid b^1,s)}$$

::: reveal
Done systematically, this is an algorithm. Treat every conditional table as a **factor** over its variables; fix the evidence; then eliminate hidden variables one at a time, each elimination multiplying together the factors that mention it and summing it out into a new, smaller factor.

$$\underbrace{T_1(B)\,T_2(S)\,T_3(E,B,S)\,T_4(E)\,T_5(E)}_{\text{after fixing }d^1, c^1} \;\longrightarrow\; T_1(B)\,T_2(S)\,T_8(B,S) \;\longrightarrow\; T_1(B)\,T_9(B)$$
:::

::: reveal
::: small
$T_8(B,S) = \sum_e T_3(e,B,S)T_4(e)T_5(e)$, then $T_9(B) = \sum_s T_2(s)T_8(B,s)$; normalise $T_1(B)T_9(B)$ and you have the answer. The cost is set by the largest intermediate factor, which depends on the **elimination order** — and finding the best order is itself NP-hard. So the ordering is a heuristic: often linear, ==sometimes still exponential.==
:::
:::

### What the ordering is worth
{fill: top}

::: widget inference-cost
Both columns compute the identical number. On the left, enumeration: one term per assignment of the hidden variables, so the count doubles with every variable added. On the right, elimination: each hidden variable is summed out once into a small table, so the count grows by a constant. ==At twenty variables it is 262 144 terms in one sum against 146 multiplications in total== — and both answers agree to the last digit.
:::

### Generate one sample — 1/5 · Draw the battery
{sub: original PDF p. 28}

::: figure.plain original-sample-1 | 940
Original PDF p. 28 · sample each variable once its parents are available.
:::

::: keypoint
Draw $B$ from $p(B)$. This sample starts with $B=1$.
:::

### Generate one sample — 2/5 · Draw the solar panel
{sub: original PDF p. 29}

::: figure.plain original-sample-2 | 940
Original PDF p. 29 · sample each variable once its parents are available.
:::

::: keypoint
Draw $S$ from $p(S)$. The two root nodes have no parents.
:::

### Generate one sample — 3/5 · Draw the electrical state
{sub: original PDF p. 30}

::: figure.plain original-sample-3 | 940
Original PDF p. 30 · sample each variable once its parents are available.
:::

::: keypoint
Now both parents are available: draw $E$ from $p(E\mid B=1,S=1)$.
:::

### Generate one sample — 4/5 · Draw the trajectory
{sub: original PDF p. 31}

::: figure.plain original-sample-4 | 940
Original PDF p. 31 · sample each variable once its parents are available.
:::

::: keypoint
Draw $D$ from $p(D\mid E=1)$. A sampled outcome can be zero even when its parent is one.
:::

### Generate one sample — 5/5 · Draw communication
{sub: original PDF p. 32}

::: figure.plain original-sample-5 | 940
Original PDF p. 32 · sample each variable once its parents are available.
:::

::: keypoint
Draw $C$ from $p(C\mid E=1)$. The row is now one complete sample from the joint.
:::

### Reject rows that disagree with the evidence
{sub: original PDF p. 34}

::: figure.plain original-rejection-samples | 790
Original PDF pp. 33–34 · three of the nine displayed rows match $D=C=1$.
:::

::: keypoint
Among the three matching rows, one has $B=1$: the sample estimate is $1/3$. This is an estimate, not an exact posterior.
:::

### Weight the evidence instead of rejecting a row
{sub: original PDF p. 35 · the evidence columns are fixed}

::: figure.plain original-weighted-samples | 590
The red $D,C$ columns are observed; the final column records the likelihood weight.
:::

Draw the non-evidence variables $B,S,E$ in topological order. Set $D=C=1$ in **every** row and weight it by $w=P(D=1\mid E)P(C=1\mid E)$.

$$\widehat P(B=1\mid D=C=1)=\frac{\sum_k w_k\,\mathbf1[B_k=1]}{\sum_k w_k}.$$

::: keypoint
The displayed rows illustrate weighted samples. Generate fresh rows with clamped evidence; do not first reject samples using the observed values.
:::

### Rare causes — why weighting can still struggle
{sub: original PDF p. 36 · compare an exact posterior with rare prior draws}

::: figure.plain original-rare-cause | 980
A rare cause $C$ can have posterior probability 0.5 after observing $D=1$.
:::

But likelihood weighting still proposes $C=1$ with probability 0.001. In 1,000 draws, the probability of missing it entirely is $0.999^{1000}\approx0.368$.

::: keypoint
A run with no $C=1$ sample estimates zero. That is a sampling failure; the model's conditional probability has not become zero.
:::

### When exact inference is hopeless — sample
::: cols
::: col Direct sampling, with rejection
Walk the DAG in topological order, drawing each variable from $p(x_i \mid \mathrm{pa}_i)$; keep only the runs that happen to match the evidence, and count.

Nine samples of the satellite network, three of which show $d^1, c^1$, one of those with $b^1$:
$$\hat P(b^1 \mid d^1,c^1) = 1/3$$

**The flaw.** If the evidence is unlikely, almost every sample is thrown away.
:::
::: col.accent Likelihood weighting, and its flaw
Do not reject. Clamp each evidence variable to its observed value and carry a weight $w \leftarrow w \times P(x_i \mid \mathrm{pa}_i)$ for the clamping.

**A different failure mode.** Take $C \to D$ with $p(c^1) = 0.001$, $p(d^1\mid c^1) = 0.999$, $p(d^1 \mid c^0) = 0.001$. The exact posterior is $p(c^1\mid d^1) = \hl{0.5}$. But $C$ is still drawn from its prior. The chance of seeing no $c^1$ in 1,000 draws is $0.999^{1000}\approx0.368$. Such a run reports ==0 for an answer that is a half.==
:::
:::

::: reveal
::: small
The cure is to stop sampling variables independently: **Gibbs sampling** sweeps through the variables, redrawing each from its conditional given the current value of all the others, and, under suitable irreducibility and mixing conditions, approaches the posterior. A finite burn-in does not guarantee exact posterior samples. Approximate inference is not a shortcut; it is a second set of failure modes, traded for the first.
:::
:::

### Check — cheap to store, cheap to use?
{q: 3}

::: quiz A network is sparse: every node has at most three parents, so the whole model is a few hundred numbers. What does that guarantee about the cost of exact inference?
- It is linear in the number of nodes
- It is at worst quadratic in the number of nodes
- =Nothing in general — exact inference can still be intractable; the cost follows the elimination order, not the storage
- Inference is always cheaper than storage, since it never builds the full joint
Storing the joint cheaply and **summing over it** cheaply are different problems. Exact inference is NP-hard in general, and its real cost is governed by how large the intermediate factors grow as variables are eliminated — the treewidth — which a sparse-looking graph can still make enormous. This is why the chapter has to talk about elimination order at all.
:::

### Naive Bayes — classification is posterior inference
{sub: original PDF p. 43 · a familiar use of the same graph}

::: cols
::: col
::: figure.plain original-naive-bayes | 260
Original PDF p. 43 · one class node, many observed features.
:::
:::
::: col
Given class $C$, the features are conditionally independent:

$$P(C=c\mid o_{1:n})\propto P(C=c)\prod_iP(o_i\mid C=c).$$
:::
:::

For an illustrative two-class, two-feature problem:

| Class | Prior × first-feature likelihood × second-feature likelihood | Unnormalised score |
|---|---|---|
| $A$ | $0.4\times0.8\times0.5$ | $0.16$ |
| $B$ | $0.6\times0.2\times0.5$ | $0.06$ |

Thus $P(A\mid o_1,o_2)=0.16/0.22\approx0.727$. Choose $A$ under equal misclassification costs.

::: keypoint
“Naive” describes the **conditional-independence assumption**. It does not mean that the observed features must be marginally independent.
:::

## Learning a model from data
{short: LEARNING}

Inference assumes the local tables are given. Learning estimates those tables from observations.

### Learning the tables — reuse Lecture 2 locally
{sub: original PDF p. 44 · parameter learning, with the graph fixed}

For complete discrete data, count each node separately for each configuration of its parents:

$$\hat p(X_i=k\mid\mathrm{pa}_i=j)=\frac{N_{ijk}}{\sum_{k'}N_{ijk'}}.$$

In the illustrative fault model, suppose 8 of 10 faulty machines and 18 of 90 healthy machines trigger the alarm.

| Conditional row | MLE | Posterior mean with a separate Beta(1,1) prior |
|---|---|---|
| $P(A=1\mid F=1)$ | $8/10=0.8$ | $9/12=0.75$ |
| $P(A=1\mid F=0)$ | $18/90=0.2$ | $19/92\approx0.207$ |

::: keypoint
A Bayesian network gives **many small estimation problems**. Missing or latent variables require inference as part of learning; counting observed rows alone is then insufficient.
:::

## Tracking a hidden state through time
{short: FILTERING}

Use the transition model to predict, then use a new observation to update.

### A dynamic Bayesian network — repeat the same local structure
{sub: original PDF p. 47}

::: figure.plain original-dynamic-network | 790
Original PDF p. 47 · input, hidden state and observation stay in three aligned rows.
:::

::: keypoint
The horizontal arrows carry the state forward. Vertical and curved arrows describe what happens within one time step.
:::

### The same graph, unrolled through time
Nothing so far said the variables were simultaneous. Index them by time and the identical machinery becomes a model of a system evolving.

$$P(S_1,\dots,S_T) = P(S_1)\prod_{t=2}^{T} P(S_t \mid S_{1:t-1}) \quad\xrightarrow{\ \text{two assumptions}\ }\quad P(S_1)\prod_{t=2}^{T}P(S_t\mid S_{t-1})$$

::: cols
::: col 1 · The Markov assumption
$$P(S_t \mid S_1,\dots,S_{t-1}) = P(S_t \mid S_{t-1})$$

==the future is conditionally independent of the past given the present==, $S_{t+1} \perp S_{1:t-1} \mid S_t$. Which is a *conditional independence* — a chain structure, read off a graph.
:::
::: col.accent 2 · The stationarity assumption
$$P(S_{t+1}{=}s'\mid S_t{=}s) = P(S'{=}s'\mid S{=}s) \;\; \forall t$$

one transition table, shared by every time step, instead of $T$ of them.
:::
:::

::: reveal
::: small
Lecture 7 will open by *assuming* both of these. Markov structure is a conditional-independence assumption. Time homogeneity is a separate parameter-sharing assumption: the transition table does not change with time.
:::
:::

### Markov order — how far back do the arrows reach?
{sub: original PDF p. 49}

::: figure.plain original-full-history | 660
Original PDF p. 49 · without an assumption, a state may depend on the whole past.
:::

::: figure.plain original-markov-orders | 990
Original PDF p. 50 · first-order and second-order chains, side by side.
:::

::: keypoint
A first-order model keeps only the previous state. A second-order model keeps the previous two.
:::

### Fit a transition matrix — count where each state goes
{sub: original PDF p. 53 · the same count-and-normalise rule}

Use the source convention $M_{ij}=P(S_{t+1}=i\mid S_t=j)$: **column $j$ is the distribution of the next state given the current state**.

::: figure.plain original-transition-counts | 1000
Original PDF p. 53 · five departures from state 1; three go to state 3, giving $\hat\theta_{3\mid1}=3/5$.
:::

For the illustrative observed sequence $A,A,B,A,B,B$, the four transition counts are $N_{AA}=1$, $N_{BA}=2$, $N_{AB}=1$, $N_{BB}=1$.

$$\hat M=\begin{bmatrix}1/3&1/2\\2/3&1/2\end{bmatrix},\qquad p_{t+1}=\hat M p_t.$$

Starting at $A$ gives $p_t=[1,0]^\top$, so the next-state probabilities are $[1/3,2/3]^\top$. Every column sums to one.

::: keypoint
This is **model learning** from a trajectory. Predicting with $p_{t+1}=Mp_t$ is a different operation, performed after the matrix is specified or estimated.
:::

### Predict a marginal — collect probability from every predecessor
{sub: original PDF p. 52 · one destination receives mass from several possible previous states}

::: figure.plain original-markov-marginal | 760
Each blue arrow contributes transition probability times previous-state probability.
:::

$$P(S_t=i)=\sum_j P(S_t=i\mid S_{t-1}=j)P(S_{t-1}=j),\qquad p_t=Mp_{t-1}.$$

::: keypoint
Add all routes into state $i$. Repeating this calculation evolves the marginal; a stationary distribution is one that the update leaves unchanged.
:::

### A stationary model need not start in a stationary distribution
{sub: original PDF p. 52 · separate two uses of “stationary”}

**Time-homogeneous transitions:** the same matrix $M$ is used at each step. **Stationary distribution:** a probability vector $p_\infty$ satisfying $Mp_\infty=p_\infty$.

For a separate illustrative two-state model,

$$M=\begin{bmatrix}0.9&0.2\\0.1&0.8\end{bmatrix},\qquad p_\infty=\begin{bmatrix}2/3\\1/3\end{bmatrix}.$$

From $p_0=[1,0]^\top$, the first two distributions are $p_1=[0.9,0.1]^\top$ and $p_2=[0.83,0.17]^\top$: the marginal distribution changes even though $M$ stays fixed.

::: keypoint
For a finite irreducible, aperiodic chain, the distribution converges to its unique stationary distribution. A general Markov chain need not have that convergence property.
:::

### State transitions — a graph of possible next states
{sub: original PDF p. 55}

::: figure.plain original-state-transition | 930
Original PDF p. 55 · these four nodes are state values, not four time steps.
:::

::: keypoint
From $X_2$, move to $X_3$ with probability 0.4 or $X_4$ with probability 0.6. Outgoing probabilities sum to one.
:::

### Hidden Markov models — name the question before computing
{sub: original PDF pp. 54–61 · the same hidden states, different information sets}

::: figure.plain original-hmm | 640
Original PDF p. 54 · blue transitions, red emissions and grey observed nodes.
:::

| Question | Target | What the answer uses |
|---|---|---|
| Filtering | $p(x_t\mid y_{1:t})$ | observations available now |
| Prediction | $p(x_{t+h}\mid y_{1:t})$ | current belief, propagated into the future |
| Smoothing | $p(x_t\mid y_{1:T})$, $t<T$ | later observations to revise the past |
| Sequence likelihood / best hidden path | $p(y_{1:T})$ / $\argmax_{x_{1:T}}p(x_{1:T}\mid y_{1:T})$ | model comparison / Viterbi decoding |

### Filtering — locate the present
{sub: original PDF p. 56}

::: figure.plain original-hmm-filtering | 780
$p(x_t\mid y_{1:t})$ · original observation shading and target highlights.
:::

::: keypoint
The orange node is the current target. Use the grey observations up to now; the future observation is still unknown.
:::

### Prediction — look beyond the observations
{sub: original PDF p. 57}

::: figure.plain original-hmm-prediction | 780
$p(x_t\mid y_{1:s}),\ t>s$ · original observation shading and target highlights.
:::

::: keypoint
The observations stop at $s$. Push the current belief forward through transitions to the orange future node.
:::

### Smoothing — use later evidence to revise the past
{sub: original PDF p. 58}

::: figure.plain original-hmm-smoothing | 780
$p(x_t\mid y_{1:u}),\ t<u$ · original observation shading and target highlights.
:::

::: keypoint
The target stays at $t$, but grey observations extend to $u$. Later measurements can change what we believe happened earlier.
:::

### Decoding — choose a whole hidden path
{sub: original PDF p. 60}

::: figure.plain original-hmm-viterbi | 780
$\argmax_{x_{1:u}}p(x_{1:u}\mid y_{1:u})$ · original observation shading and target highlights.
:::

::: keypoint
All hidden nodes are targets together. Find the most probable complete path; separate per-time guesses need not form that path.
:::

### Filtering — Bayes' rule, once per time step
Hide the state and observe an emission — $X_t \to Y_t$ over a chain $X_{t-1}\to X_t$ — and you have a **hidden Markov model**. The standard query is *filtering*, the belief about now given everything seen so far:

$$P(x_t\mid y_{1:t}) \;\propto\; \underbrace{P(y_t\mid x_t)}_{\hl{\text{corrector}}}\sum_{x_{t-1}} \underbrace{P(x_t\mid x_{t-1})\,P(x_{t-1}\mid y_{1:t-1})}_{\hl{\text{predictor}}}$$

::: reveal
Read it as Lecture 2's loop, run once per tick: yesterday's posterior is pushed through the dynamics to become today's ==prior==; today's measurement is the ==likelihood==; the product is today's posterior. Make the chain linear and the noise Gaussian and every term stays Gaussian — the recursion then carries only a mean and a covariance, and it has a name: the **Kalman filter**.
:::

### One filtering step — predict, observe, normalise
{sub: a two-state machine, healthy or faulty}

Yesterday's posterior fault probability is $0.2$. A fault persists with probability $0.8$; a healthy machine develops a fault with probability $0.1$.

**Predict today's state:**

$$P(F_t)=0.8(0.2)+0.1(0.8)=0.24.$$

Now an alarm occurs, with $P(A_t\mid F_t)=0.9$ and $P(A_t\mid\neg F_t)=0.1$.

**Correct using the observation:**

$$P(F_t\mid A_t)=\frac{0.9(0.24)}{0.9(0.24)+0.1(0.76)}\approx0.740.$$

::: keypoint
The transition changes 0.20 to 0.24; the measurement changes 0.24 to 0.74. ==The corrected belief becomes the starting belief at the next time step.==
:::

### Temperature thread — infer a hidden heater mode
{sub: shared teaching example · predict before revealing the calculation}

In a two-mode variant, the heater is good ($G$) or weak ($W$). Initially $P(G)=0.6$. Next-step probabilities are $P(G'\mid G)=0.9$ and $P(G'\mid W)=0.3$. A warm reading has likelihood 0.8 under $G'$ and 0.2 under $W'$.

**Predict:** First predict the next mode without the reading. Then decide whether a warm reading should raise or lower its good-mode probability.

::: reveal
**Calculate and check.** $P(G')=0.9(0.6)+0.3(0.4)=0.66$. After a warm reading,

$$P(G'\mid\text{warm})=\frac{0.8(0.66)}{0.8(0.66)+0.2(0.34)}=\frac{132}{149}\approx0.886.$$
:::

::: keypoint
Prediction uses the transition table; updating uses the observation likelihood. The two tables have different jobs.
:::

### Try it — the next reading is cool
{sub: work independently · reveal only after writing an answer}

Keep the same predicted probabilities (0.66, 0.34). Instead observe “cool,” the complement of “warm.” Its likelihoods are therefore 0.2 under $G'$ and 0.8 under $W'$. Calculate the new posterior.

::: reveal
**Check your answer.** $P(G'\mid\text{cool})=0.132/(0.132+0.272)=33/101\approx\mathbf{0.327}$. Do not start from the posterior of the warm-reading example; these are alternative observations.
:::

::: keypoint
When changing a condition, identify exactly which factors change. Do not reuse evidence from a different scenario.
:::

### Add an input — the original IOHMM
{sub: original PDF p. 62}

::: figure.plain original-iohmm | 610
Original PDF p. 62 · $A_t$ affects both the transition and the observation.
:::

::: keypoint
This is an input-output HMM. Choosing inputs becomes a decision problem only after specifying utilities and the information available when acting.
:::

### A continuous hidden state — the same two-row picture
{sub: original PDF p. 71}

::: figure.plain original-kalman-model | 990
Original PDF p. 71 · the source writes the emission matrix as $B_t$; the next slide uses $C$.
:::

::: keypoint
The graph still separates transitions and measurements. Linear equations and Gaussian noise let us carry a mean and covariance instead of a probability table.
:::

### Kalman filtering — carry the mean and covariance forward
{sub: original PDF p. 73 · the source names the mean f and covariance F}

::: figure.plain original-kalman-update | 1040
The old Gaussian belief becomes a new Gaussian belief after prediction and measurement correction.
:::

The update carries two objects: **where the state is likely to be**, and **how uncertain that estimate remains**. The next slide writes these quantities as $m_t,P_t$.

::: keypoint
The whole posterior changes. Linear Gaussian assumptions let us represent that distribution using only its mean and covariance.
:::

### Linear Gaussian state space — the Kalman version of the same update
{sub: original PDF pp. 71–73 · transition and observation are different models}

$$x_t=Ax_{t-1}+w_t,\qquad y_t=Cx_t+v_t,\qquad w_t\sim\mathcal N(0,Q),\quad v_t\sim\mathcal N(0,R).$$

With a Gaussian initial belief and independent Gaussian noises, the posterior remains Gaussian. Track its mean and covariance instead of a table.

| Stage | Calculation |
|---|---|
| Predict state | $m_t^-=Am_{t-1}$, $P_t^-=AP_{t-1}A^\top+Q$ |
| Weight the measurement | $K_t=P_t^-C^\top(CP_t^-C^\top+R)^{-1}$ |
| Correct belief | $m_t=m_t^-+K_t(y_t-Cm_t^-)$, $P_t=(I-K_tC)P_t^-$ |

A scalar example with $m^-=10$, $P^-=4$, $C=1$, $R=1$, and $y=12$ gives $K=0.8$, **$m=11.6$ and $P=0.8$**.

::: keypoint
The Kalman filter is **predict → observe → update**, just like the discrete fault example. Gaussian conditioning makes those steps closed form.
:::

## Act 4 — from belief to decision
{short: ACT 4, num: Act 4}

**Q4.** Everything so far describes the world. Add two node types and the graph starts choosing.

### Bayesian network $+$ decision $+$ utility
{q: 4, sub: original PDF pp. 75 and 83}

::: figure.plain original-decision-network | 605
Circle: chance. Square: decision. Diamond: utility. Dashed blue: information known before choosing.
:::

::: keypoint
Read the dashed arrow first: the result of test $O^1$ is known before treatment $T$ is chosen.
:::

### Utility — a number for comparing outcomes
Probabilities describe **how likely** outcomes are. Utilities describe **how desirable** those outcomes are to the decision maker.

::: cols c2
::: col A certain outcome
Assign a utility $U(s)$ to outcome $s$. Higher is preferred; the units can be profit, comfort or a stated combination of objectives.
:::
::: col.accent An uncertain outcome
Under the expected-utility model, an action producing outcomes with probabilities $p_i$ is valued by

$$\mathrm{EU}(a)=\sum_i p_iU(s_i).$$
:::
:::

::: keypoint
==Average utilities, then compare actions.== Completeness and transitivity alone do not derive probability or expected utility; the latter also uses assumptions such as continuity and independence over lotteries.
:::

::: small
Utility need not equal money. A concave utility of money represents risk aversion; the same expected-utility calculation still applies.
:::

### Utility curves — the same money can have different value
{sub: original PDF p. 80}

::: figure.plain original-utility-curves | 1010
Original PDF p. 80 · compare the two utility shapes on the nonnegative money range.
:::

::: keypoint
On the nonnegative money range: blue bends downward (risk averse); red bends upward (risk seeking). Compare expected utility, not just expected money.
:::

### Utility is not necessarily money — the original lottery example
{sub: original PDF pp. 77–80 · probabilities describe beliefs; utilities describe preferences}

Compare **A: receive 1 dollar for sure** with **B: receive 100 dollars with probability 0.01, otherwise 0**. Both have expected money 1 dollar.

| Utility of money $m\ge0$ | $\mathbb E[U(A)]$ | $\mathbb E[U(B)]$ | Preferred |
|---|---|---|---|
| $U(m)=\sqrt m$ | $1$ | $0.01(10)=0.1$ | A: risk averse |
| $U(m)=m$ | $1$ | $0.01(100)=1$ | indifferent: risk neutral |
| $U(m)=m^2$ | $1$ | $0.01(10\,000)=100$ | B: risk seeking |

Expected-utility modelling assumes consistent lottery preferences, including completeness, transitivity, continuity, and independence. Under these assumptions, preferences admit an expected-utility representation; they are **not probabilities of the outcomes**.

::: keypoint
Choose by $\mathbb E[U(M)]$, which need not equal $U(\mathbb E[M])$. State the utility model before comparing decisions.
:::

### Utility factorisation — one large function or several small ones
{sub: original PDF p. 81}

::: figure.plain original-additive-utility | 1010
Original PDF p. 81 · one diamond with many parents versus separate utility diamonds.
:::

::: keypoint
Additivity is an assumption about preferences. It does not say the random variables are independent.
:::

### Several consequences — when can utilities be added?
{sub: original PDF pp. 81–82 · collision avoidance}

The original example distinguishes horizontal closeness $H$, vertical closeness $V$, and whether an alarm is raised $A$.

$$U(h,v,a)=U_{\mathrm{separation}}(h,v)+U_{\mathrm{alarm}}(a).$$

The first term represents the consequence of unsafe separation; the second can represent alarm cost. This **additive preference assumption** is separate from any independence assumption about the random variables.

| Representation for $n$ binary variables | Entries to specify before accounting for utility scaling |
|---|---|
| Arbitrary joint utility $U(x_1,\ldots,x_n)$ | $2^n$ |
| Additive utility $\sum_i U_i(x_i)$ | $2n$ |

::: keypoint
Probability factorisation makes beliefs manageable. Utility factorisation can make preferences manageable. Both gain simplicity by making explicit modelling assumptions.
:::

### Collision avoidance — safety and alarm cost in one picture
{sub: original PDF p. 82}

::: figure.plain original-collision-utility | 750
Original PDF p. 82 · joint alarm/collision utility on the left; additive components on the right.
:::

::: keypoint
Unsafe horizontal and vertical separation contribute $U^1(h,v)$. Raising an alarm contributes $U^2(a)$. Add the two only if that preference model is intended.
:::

### Maximum expected utility
For action $a$ after observation $o$, combine the belief model with the value of each outcome:

::: figure.plain original-expected-utility | 630
Original PDF p. 79 · green supplies the probability; red supplies the utility.
:::

$$a^*=\argmax_a\mathrm{EU}(a\mid o).$$

::: keypoint
The Bayesian network supplies probabilities. The utility function supplies values. **Average outcomes, then choose the best action.**
:::

### Read the treatment diagram — compare two actions
{sub: the original utility table, now used for a decision}

Let $p=P(D=1\mid O^1)$ be the disease probability after reading the test. The graph supplies $p$; the utility table supplies the consequences.

| Choose | Healthy: $D=0$ | Diseased: $D=1$ | Expected utility |
|---|---|---|---|
| No treatment | 0 | $-10$ | $-10p$ |
| Treatment | $-1$ | $-1$ | $-1$ |

::: keypoint
Treat when $-1>-10p$, or **$p>0.1$**; at $p=0.1$ the actions tie. These are the illustrative utilities specified in the model.
:::

### The PhD decision — follow cost and benefit through the graph
{sub: original PDF p. 91}

::: figure.plain original-phd-network | 1020
Original PDF pp. 90–91 · education changes both study cost and the income distribution.
:::

::: keypoint
Choose education $E$ first. Average over prize $P$ and income $I$, then add study cost $U_C$ and income benefit $U_B$.
:::

### Should I do a PhD?
{sub: Example 3.4 · a decision network with real numbers}

::: cols
::: col The network
$E$ *do PhD / no PhD* is the **decision**; $P$ *win the prize?* and $I$ *income: low / average / high* are **chance**; $U_C$ (cost of study) and $U_B$ (benefit of income) are **utility**.

$$E \to P,\quad \{E,P\}\to I,\quad E \to U_C,\quad I \to U_B$$

$U_C(\text{do PhD}) = -50\,000$, $U_C(\text{no PhD}) = 0$; $U_B = 100\,000 / 200\,000 / 500\,000$ for low / average / high income; $p(\text{prize}\mid \text{PhD}) = 0.001$ against $10^{-7}$ without.
:::
::: col.accent The computation
$$U(E) = \sum_{I,P} p(I\mid E,P)\,p(P\mid E)\big[U_C(E)+U_B(I)\big]$$

$$U(\text{do PhD}) = \hl{260\,174}$$
$$U(\text{no PhD}) = \hl{240\,000}$$

The doctorate wins by about 20 000 — and ==almost none of that comes from the prize.== It comes from the income table: a PhD shifts the chance of high income from 0.2 to 0.4, which is worth more than the 50 000 it costs.
:::
:::

### Pick a decision, watch the utility
{fill: top}

::: widget influence-diagram
The same network, live. Choose an action and the expected utility is computed by exactly the machinery of Acts 1–3: the network gives $p(I,P\mid E)$, the utility nodes give the value, the sum gives $\mathrm{EU}$. Then switch on the second decision and ==watch the recommendation reverse==.
:::

### A later start-up decision — the information arrow matters
{sub: original PDF p. 93}

::: figure.plain original-startup-network | 1020
Original PDF pp. 92–93 · the dashed edge says the prize is known before the start-up decision.
:::

::: keypoint
Read the order $E\prec P\prec S\prec I$. The income parents also change to $S,P$, so this is a different income model.
:::

### Add one option, and the answer flips
{sub: Example 3.5 · PhD and start-ups}

::: cols
::: col What changes
A second decision $S$ *found a start-up?* is added, with $U_S(\text{yes}) = -200\,000$, and an information edge $P \dashrightarrow S$ — the prize is known before the start-up is founded. Crucially, ==income now hangs off $S$ and $P$, not off $E$.==

$$\begin{aligned}
U(E)&=U_C(E)+\sum_P p(P\mid E)\\
&\quad\hl{\max_S}\Big[U_S(S)+\sum_I p(I\mid S,P)U_B(I)\Big].
\end{aligned}$$
:::
::: col.accent What happens
$$U(\text{do PhD}) = \hl{190\,195}$$
$$U(\text{no PhD}) = \hl{240\,000}$$

**Do not do the PhD.** And the start-up is never founded either — "no start-up" wins the inner $\max$ in every branch.

Changing the income model has ==reversed the decision==, because the doctorate's only surviving route to income is a 0.001 chance at the prize, which does not repay 50 000.
:::
:::

::: reveal
::: small
The income distribution now depends on start-up choice rather than education. This changes the model, not just the option set. Merely adding an optional action to an unchanged decision problem cannot reduce its maximum expected utility.
:::
:::

### The value of information
If the decision can wait, it may pay to observe something first. Let $\mathrm{EU}^{*}(o) = \max_a \mathrm{EU}(a\mid o)$ be the value of deciding well given what is known. Then observing a new variable is worth

$$\mathrm{VOI}(O^{\text{new}}\mid o) = \Big(\sum_{o^{\text{new}}} P(o^{\text{new}}\mid o)\,\mathrm{EU}^{*}(o^{\text{new}}, o)\Big) \;-\; \mathrm{EU}^{*}(o)$$

::: reveal
the expected value of the *better decision* the observation lets you make, minus what you would have got anyway. With the same available actions and the option to ignore the observation, its expected value is nonnegative. It must be weighed against the ==cost of the observation==, which the formula does not include.

:::

::: reveal
::: block.accent Where you will meet this again | Lecture 4
"How much is it worth to look here?" is precisely the question an **acquisition function** answers in Bayesian optimisation. The knowledge gradient measures improvement in the value of a final recommendation. Expected improvement instead measures expected improvement over an incumbent; both guide queries, but they are different objectives. Act 4 has already written the formula.
:::
:::

### A decision and the value of looking first
{sub: illustrative maintenance costs; this is a utility calculation}

A machine is faulty with probability $0.2$. Running it earns utility 10 if healthy and $-30$ if faulty. Stopping gives utility 0.

::: cols c2
::: col Decide without a test
$$\mathrm{EU}(\text{run})=0.8(10)+0.2(-30)=2.$$

Run is better than stop, so the best expected utility is **2**.
:::
::: col.accent A perfect test before deciding
If healthy, run; if faulty, stop.

$$\mathrm{EU}(\text{test then decide})=0.8(10)+0.2(0)=8.$$

The information is worth $8-2=\mathbf6$ before paying for the test.
:::
:::

::: keypoint
==Information matters because it can change the action.== A test costing 7 utility units is not worth buying here; a cost of 3 gives a net gain of 3.
:::

### Sequential decisions — average, observe, then choose again
{sub: original PDF p. 87}

::: figure.plain original-sequential-decisions | 690
Original PDF p. 87 · decisions above states, utilities below; later decisions are still pending.
:::

::: keypoint
At $d_1$, average the uncertain $x_2$. Once $x_2$ is known, choose $d_2$. The order of sums and maxima follows this information sequence.
:::

### From an influence diagram to an MDP — state the extra assumptions
A sequential influence diagram records **what is known before each decision**. For additive utility, let $h_t$ contain the observed history and define the best remaining value by

$$V_t(h_t)=\max_{a_t}\mathbb E\big[r_{t+1}+V_{t+1}(h_{t+1})\mid h_t,a_t\big],\qquad V_T=0.$$

::: cols
::: col Fully observed Markov state
If $s_t$ contains all information relevant to the next transition and reward, replace the history with $s_t$. This gives the finite-horizon MDP recursion used in Lecture 7.
:::
::: col.accent Hidden physical state
An observation may not be a sufficient state. A belief $b_t(s)=P(s_t=s\mid h_t)$ can serve as the information state in a partially observed model. This is why filtering matters.
:::
:::

::: keypoint
The common structure is **choose an action, average unknown outcomes, then choose again with the new information**. A general influence diagram does not become a fully observed MDP merely by adding a time index.
:::

### Check — the Bellman equation, four lectures early
{q: 4}

::: quiz An influence diagram adds decision and utility nodes to the network. Evaluating one alternates which two operations?
- Maximising over chance nodes and summing over decision nodes
- Summing over both, weighted by utility
- Maximising over both, in topological order
- =Summing over chance nodes and maximising over decision nodes
You **average** over what you cannot control and **maximise** over what you can, in the order the information actually arrives. That alternating $\sum \max \sum \max$ is the structure of the Bellman equation, met here in a one-shot setting. Lecture 7 adds a Markov state, a transition model, and a return objective so that this pattern becomes an MDP recursion.
:::

## Closing
{short: CLOSING}

Belief structured, and action attached. Two roads lead out of here, and they are the rest of the course.

### Where we are — the graph, and the seed
::: table center
|   | Model-based | Data-driven |
|---|---|---|
| **Static, single** | optimisation *(Lec 1 ✓)* | Bayesian statistics *(Lec 2 ✓)* → ==Bayesian networks *(Lec 3 ✓)*== → Lec 4 |
:::

::: reveal
We can now represent belief over a whole system as a graph, read its independences off the missing edges, answer questions within it by elimination or by sampling, and — newly — attach a decision and a value to it.

This lecture hands on ==structured belief, plus decision and utility nodes — the influence diagram, a precursor to MDPs.==
:::

::: reveal
::: cols
::: col Lecture 4 — belief that acts
Put belief to work on an *unknown function*. A Gaussian process specifies consistent Gaussian distributions over function values. A Bayesian optimiser uses that uncertainty to choose measurements; EI and value-of-information criteria answer related but different questions.
:::
::: col.accent Lecture 7 — belief through time
Unroll the decision network. One decision becomes a sequence, the utility node becomes a reward per step, and $\argmax_a \mathrm{EU}$ becomes ==the Bellman optimality operator.==
:::
:::
:::

### A joint distribution over a system is unmanageable — until conditional independence draws it as a graph.
{layout: standout}

Small local tables in place of one exponential one; sums that factor because the edges are missing; and then a decision node and a value node, which together are, in miniature, every decision problem still to come.

### Questions?
{layout: standout}

Remember the decision network. It is the static, one-shot ancestor of the MDP, of dynamic programming, and of the reinforcement learner — belief, action and value, before time enters the picture.

## Appendix — backup slides
{short: APPENDIX}

The complete arguments, kept out of the narrative.

### Reading guide — representation, inference, learning and decisions
{sub: one main idea to explain, one comparison, one application}

| Role | Read or revisit | Question to answer |
|---|---|---|
| **Core** | [Koller & Friedman, *Probabilistic Graphical Models* (2009): selected sections on Bayesian networks and inference](https://mitpress.mit.edu/9780262013192/probabilistic-graphical-models/) | What factorization and independence claims does a graph encode? |
| **Compare** | Discrete HMM filtering versus the linear Gaussian Kalman update | Which quantities change when a state becomes continuous? |
| **Apply** | The original alarm, aircraft and PhD-decision examples | Which question asks for a probability, a learned model, or an action? |

::: keypoint
The book is a reference for selected concepts. The core exercise is a small factorization and one predict–observe–update step; structure search and advanced time-series models are second-pass reading.
:::

### Backup 1 — variable elimination, step by step
{fill: top}

Query $P(B\mid d^1,c^1)$ on $p(B,S,E,D,C)=p(B)p(S)p(E\mid B,S)p(D\mid E)p(C\mid E)$. Write each conditional table as a factor over its variables:

$$T_1(B)\;T_2(S)\;T_3(E,B,S)\;T_4(D,E)\;T_5(C,E)$$

1. **Insert the evidence.** Fix $D=d^1$ and $C=c^1$, which reduces $T_4$ and $T_5$ to factors over $E$ alone: $T_6(E) = T_4(d^1,E)$, $T_7(E)=T_5(c^1,E)$.
2. **Eliminate $E$.** Multiply every factor mentioning $E$ and sum it out: $T_8(B,S) = \sum_e T_3(e,B,S)\,T_6(e)\,T_7(e)$.
3. **Eliminate $S$.** $T_9(B) = \sum_s T_2(s)\,T_8(B,s)$.
4. **Combine and normalise.** $P(B\mid d^1,c^1) \propto T_1(B)\,T_9(B)$.

::: small
**Cost.** Each elimination creates an intermediate factor whose size is $2^{k}$ where $k$ is the number of variables it couples — the *induced width* of the chosen ordering. A good ordering keeps every factor small; a bad one can build a factor over most of the network. Finding the optimal ordering is NP-hard, so heuristics (min-fill, min-degree) are used. This is the practical ceiling of exact inference, and the reason sampling exists.
:::

### Backup 2 — d-separation, the complete rule
{fill: top}

A path between $\mathbf{X}$ and $\mathbf{Y}$ (ignoring edge directions) is **blocked** by an observed set $\mathbf{Z}$ if it contains a node $m$ such that either

- $m$ is a **chain** ($\to m \to$) or a **fork** ($\leftarrow m \to$) on the path **and** $m \in \mathbf{Z}$; or
- $m$ is a **collider** ($\to m \leftarrow$) on the path **and** neither $m$ nor any descendant of $m$ is in $\mathbf{Z}$.

If **every** path is blocked, $\mathbf{Z}$ d-separates $\mathbf{X}$ from $\mathbf{Y}$, and the DAG entails $\mathbf{X}\perp\mathbf{Y}\mid\mathbf{Z}$.

::: cols
::: col What it guarantees
D-separation is **sound**: if it says independent, every distribution factorising over the DAG has that independence. So a graphical check licenses an algebraic simplification, with no arithmetic.
:::
::: col.accent What it does not
The converse fails in one direction: $\mathbf{X}$ and $\mathbf{Y}$ may happen to be independent in a particular distribution without being d-separated — an accident of the numbers rather than the structure. The graph states what *must* hold, not everything that does.
:::
:::

::: small
The "or any descendant" clause is why observing $J$ in the wet-grass example matters but observing it *without* $T$ does not: $J$ is a descendant of $R$, not of the collider $T$, so on its own it opens nothing.
:::

### Backup 3 — approximate inference, and where each method breaks
{fill: top}

| method | how it works | where it breaks |
|---|---|---|
| **Direct (rejection) sampling** | draw whole assignments in topological order; discard those disagreeing with the evidence | rare evidence throws away almost every sample |
| **Likelihood weighting** | clamp the evidence, weight each sample by $\prod P(x_i\mid\mathrm{pa}_i)$ over the clamped nodes | the *non*-evidence variables are still drawn from their priors, so a rare cause is never proposed |
| **Gibbs sampling** | redraw each variable from its conditional given all the others; discard a burn-in | correct in the limit, but can mix arbitrarily slowly |

::: small
**The likelihood-weighting counter-example.** Take $C \to D$ with $p(c^1)=0.001$, $p(d^1\mid c^1)=0.999$, $p(d^1\mid c^0)=0.001$, so that exactly $p(c^1\mid d^1) = \frac{0.999 \times 0.001}{0.999\times 0.001 + 0.001\times 0.999} = 0.5$. A 1,000-draw run has probability $0.999^{1000}\approx0.368$ of never proposing $c^1$, in which case the estimate is zero. The normalised weighted estimator is generally biased at finite sample sizes but consistent under suitable support conditions; rare important samples can make convergence slow.
:::

### Backup 4 — from maximum expected utility to Bellman
{fill: top}

**One decision.** Chance variables $X$ with a Bayesian network, a decision $D$, a utility $U(D,X)$. Given evidence $e$,

$$\mathrm{EU}(d\mid e) = \sum_x p(x\mid d, e)\,U(d,x), \qquad d^{*} = \argmax_d \mathrm{EU}(d\mid e), \qquad \mathrm{MEU}(e) = \max_d \mathrm{EU}(d\mid e)$$

**Many decisions.** With the partial ordering $\mathcal{X}_0 \prec D_1 \prec \cdots \prec D_n \prec \mathcal{X}_n$, the value of the first decision is

$$U(d_1\mid x_0) = \sum_{\mathcal{X}_1}\max_{D_2}\cdots\sum_{\mathcal{X}_{n-1}}\max_{D_n}\sum_{\mathcal{X}_n}\ \prod_{i\in\mathcal{L}} p\big(x_i\mid \mathrm{pa}(x_i)\big)\ \sum_{j\in\mathcal{T}} U_j\big(\mathrm{pa}(u_j)\big)$$

with $\mathcal{L}$ the chance variables and $\mathcal{T}$ the utility variables.

::: small
**The translation.** Let each decision move a state, $p(x_{t+1}\mid x_t,d_t)$; let utility accumulate as a per-step reward, $\sum_t u(x_t)$. Then $\mathrm{MEU}$ becomes the value function $V^{*}$, the alternating $\sum\max$ becomes the dynamic-programming recursion, and $\argmax_d \mathrm{EU}$ becomes the Bellman optimality operator. Lecture 7 adds a discount factor $\gamma$ and an infinite horizon; Lecture 8 removes $p$ and estimates the expectation from samples. The object itself was built here.
:::

### Changing coefficients — a hidden process above the observations
{sub: original PDF p. 68}

::: figure.plain original-varying-coefficients | 780
Original PDF p. 68 · the upper coefficient chain drives the lower autoregressive observations.
:::

::: keypoint
A changing coefficient is a hidden state to infer. It is different from fitting one fixed regression coefficient.
:::

### Backup — when the time-series model itself changes
{sub: original PDF pp. 68–70 · extensions to the AR model}

| What changes? | A model for the change | Interpretation |
|---|---|---|
| AR coefficients | $a_t=a_{t-1}+\eta_t$, $x_t=h_t^\top a_t+\epsilon_t$ | infer slowly changing coefficients as hidden states |
| Innovation variance: ARCH | $\sigma_t^2=\omega+\sum_i\alpha_i\epsilon_{t-i}^2$ | recent large residuals predict more variability |
| Innovation variance: GARCH | $\sigma_t^2=\omega+\sum_i\alpha_i\epsilon_{t-i}^2+\sum_j\beta_j\sigma_{t-j}^2$ | past variance also persists |

Use $\omega>0$ and nonnegative variance coefficients; stationarity requires additional parameter restrictions. A changing coefficient, a changing state, and changing observation noise are **different modelling choices**.

::: keypoint
These are extensions of the same graphical model. Bayesian updating estimates the quantities the model allows to vary; it does not make a fixed model automatically adapt to every kind of change.
:::

### Changing variance — ARCH and GARCH side by side
{sub: original PDF p. 70}

::: figure.plain original-arch-garch | 1030
Original PDF p. 70 · variance is modelled explicitly in the upper row.
:::

::: keypoint
ARCH uses past squared residuals. GARCH also carries past conditional variance forward.
:::

## Extensions — model classes and structure learning
{short: EXTENSION}

Read after completing the main route.

### Hybrid networks — a table is not the only local model
{sub: original PDF pp. 39–42 · the aircraft example}

The source network mixes **wing span** $W$ (continuous), **military type** $M$ (binary), **radar cross section** $C$ (continuous), and **detection** $D$ (binary).

$$p(w,m,c,d)=p(w)\,p(m)\,p(c\mid w,m)\,p(d\mid c).$$

| Node | A possible local model | Meaning |
|---|---|---|
| $W$ | $\mathcal N(\mu_W,\sigma_W^2)$ | distribution of wing spans |
| $M$ | Bernoulli probability $\theta$ | frequency of the aircraft type |
| $C\mid W,M=m$ | $\mathcal N(a_mW+b_m,\sigma_m^2)$ | each type has its own regression |
| $D\mid C$ | $P(D=1\mid C)=1/(1+e^{-(C-c_0)/b})$, $b>0$ | detection becomes more likely as the cross section grows |

::: keypoint
The **graph factorisation stays the same**. Sum discrete hidden variables and integrate continuous ones. Non-Gaussian factors can require approximate inference.
:::

### A continuous root — wing span
{sub: original PDF p. 39}

::: figure.plain original-hybrid-wing | 1000
Original PDF pp. 39–42 · the graph stays fixed while the highlighted local model changes.
:::

::: keypoint
The highlighted root $W$ has a Gaussian density. It is a continuous variable, so its local model is not a finite table.
:::

### A discrete root — aircraft type
{sub: original PDF p. 40}

::: figure.plain original-hybrid-type | 1000
Original PDF pp. 39–42 · the graph stays fixed while the highlighted local model changes.
:::

::: keypoint
The highlighted root $M$ is binary, so one Bernoulli parameter specifies its local distribution.
:::

### A conditional Gaussian — radar cross section
{sub: original PDF p. 41}

::: figure.plain original-hybrid-radar | 1000
Original PDF pp. 39–42 · the graph stays fixed while the highlighted local model changes.
:::

::: keypoint
The highlighted $C$ depends on wing span and type. Each type selects its own linear Gaussian regression.
:::

### A binary observation — detection probability
{sub: original PDF p. 42}

::: figure.plain original-hybrid-detection | 700
Original PDF pp. 39–42 · the graph stays fixed while the highlighted local model changes.
:::

::: keypoint
The highlighted $D$ is binary. Its probability changes smoothly with continuous radar cross section $C$.
:::

### Learning the graph — compare explanations, not just fitted tables
{sub: original PDF p. 45 · structure learning}

If the arrows are unknown, the candidate model is the graph $G$ as well as its parameters $\theta$:

$$P(G\mid D)\propto P(G)\underbrace{\int p(D\mid\theta,G)p(\theta\mid G)\,d\theta}_{p(D\mid G)\text{, the model evidence}}.$$

::: flow
- **Propose a graph** | add, remove, or reverse an edge while keeping a DAG
- **Score it** | combine prior preference and fit averaged over parameters
- **Compare** | keep a better candidate and continue the search
:::

Exhaustively checking every DAG is usually impractical. Search can stop at a local solution, and different graphs may encode the same observational independences.

::: keypoint
**Inference:** unknown variables in a fixed model. **Parameter learning:** unknown tables. **Structure learning:** unknown arrows. An observational graph alone does not establish causality.
:::

### Continuous time-series data — regression becomes a transition model
{sub: original PDF pp. 63–67 · time is discrete; the state is continuous}

::: figure.plain original-ar-graph | 500
Original PDF p. 66 · lagged observations point to the next value.
:::

An AR($L$) model uses the last $L$ values as regression features:

$$x_t=a^\top h_t+\epsilon_t,\quad h_t=[x_{t-1},\ldots,x_{t-L}]^\top,\quad\epsilon_t\sim\mathcal N(0,\sigma^2).$$

Lecture 2's regression now specifies a **transition model**. Gaussian MLE still minimises $\sum_t(x_t-a^\top h_t)^2$.

::: keypoint
AR(2) is generally not first-order Markov in $x_t$. It is first-order in $[x_t,x_{t-1}]$. **Choose a state that keeps the information needed for prediction.**
:::
