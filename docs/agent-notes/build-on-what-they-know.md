# Build on what they know — an undergraduate course

*IE437 is an undergraduate course. Advanced models are built up, in the main body, from the Bayesian statistics and optimisation the students already have — never compressed to a formula with the derivation sent to the appendix.*

On 2026-10-26 the professor found that the 2026-10-13 rewrite of Ch 6 had compressed Act 2 ("generative
models, compressed") to six slides. Their source deck (Part 1 pp. 6–14) explained the basics of generative
models and the ELBO "very easily and systematically", and the rewrite had dropped most of it:
- the opening picture of what a generative model learns;
- the latent-variable motivation;
- the ELBO's **evidence perspective** (Jensen). It was gone even from the appendix.
- the **optimisation perspective** (KL to the true posterior). It survived as one identity in Backup 1.
- the source box that ties the two together;
- the three-panel reading of the two VAE terms.

Their instruction: "복원해라. 기억해라. 학부생 수업이다. Bayesian 통계를 배웠고, 최적화 기본을 배웠다. 이 기본 컨셉을
빌드해서 복잡한 생성형 모델의 기본 core와 방법론에 대해 핵심을 파악해야 한다."

Restored the same day as Act 2, "generative models, built from Bayes and optimisation". It went from 6 slides to 18, and the deck from 78 to 90. Each step names the lecture it reuses:
- **what a generative model learns** — the p. 6 picture;
- **KL**;
- **minimising the KL is maximum likelihood** — the Lecture 2 coin set beside a network;
- **hidden factors** — the p. 8 faces and the graph;
- **why the posterior** — the decoder is regression from codes to designs, but the codes are hidden (Lecture 3): training must first ask which codes made each design. Added after the professor noted that the jump from hidden factors to the posterior was unmotivated;
- **Bayes' rule again** — the evidence is the integral we cannot do. A picture of prior draws, most of which explain nothing: about 1 in 4 with one factor, about 1 in 800 000 with ten. Lecture 2 solved this integral by conjugacy, Lecture 3 by a sum; here neither works.
- **Jensen** — a concave function's chord, set against Lecture 1's convex tangent;
- **ELBO view 1** — from the evidence, by Jensen;
- **ELBO view 2** — from the posterior, by Bayes, every step on its own line;
- **the gap, drawn** — move a Gaussian q against the two-peaked posterior;
- **two views, one objective** — learning over θ, inference over φ;
- **VAE** — the architecture, and where each term attaches;
- **reparameterisation**, with the loss written as a squared error plus a closed-form KL;
- **the two terms** — the p. 13 three panels;
- **the β dial**;
- **from the VAE to diffusion** — pp. 16–18;
- **diffusion**;
- **the quiz**.

New widgets: `gen-pictures` (modes goal / latent / arch / reparam / terms / ladder) and `elbo-views`
(jensen / prior / gap; prior and gap share one toy, z ~ N(0,1), x | z ~ N(z², 0.5²), x = 2).

A second pass the same day, after the professor asked whether it was as easy as it could be:
- view 2's derivation was split into labelled steps, like view 1's;
- the Bayes slide's three text columns became the prior-draws picture;
- the Jensen widget no longer defines w before view 1 does;
- the reparameterisation loss was cut to one design with a one-number code;
- jargon was replaced: "the data's direction", "stand-in".

**Why:** the students are undergraduates. A result without its build-up cannot be lectured from, and it
cannot be understood either. The source decks already have the build-up. A compression that keeps the
papers and cuts the foundations inverts the course's priorities.

**How to apply:**
- When restructuring or timing a chapter, compress paper detail, benchmarks and secondary methods first.
- Keep the conceptual chain from the source deck in the main body, each step explicitly tied to the lecture it reuses:
  - Ch 1 — optimisation, convexity, bounds;
  - Ch 2 — Bayes' rule, the evidence, MLE/MAP;
  - Ch 3 — hidden variables, marginalising, sampling.
- A derivation the source deck teaches on a main slide stays a main slide: label every line, and reveal it step by step.
- When the source gives two derivations of one result, keep both and show where they meet.

Related: [ch05-ch06-streams](ch05-ch06-streams.md), [simplify-confusing-slides](simplify-confusing-slides.md) (which is about a
confusing slide, not about cutting foundations), [label-every-formula-block](label-every-formula-block.md).

**Follow-up, same day.** The professor found that Jensen's inequality, placed straight after "Bayes' rule again", broke the flow. The deck had just said why the posterior is needed (the encoder approximates it). The next thing the students need is what training learns and what it optimises. A slide was added between the two, revised the same day to "What training is for — θ generates designs, φ reads them". It leads with the practical goals: θ decodes a prior code into a new design, and φ gives a design its code. Each goal becomes a target: max_θ Σ log p_θ(x_i), and min_φ KL(q_φ‖p_θ(z|x)). The ELBO is not named until view 1 defines it (the professor: present the goal first, then the ELBO as the objective that serves it). The first version. It covers:
- the purpose: θ, the decoder, fitted by maximum likelihood;
- the helper: φ, the encoder, the posterior approximated;
- the exact objective: max over θ and φ of Σ ELBO, with ELBO = log p_θ(x) − KL(q_φ‖p_θ(z|x));
- why both are trained at once.

Jensen now follows it, as the tool view 1 needs. Ch 6 has 91 slides; both maps were refreshed by heading lookup. **How to apply:** before a derivation, say what is being learned and what objective is being optimised; a tool lemma comes after that, not before.
