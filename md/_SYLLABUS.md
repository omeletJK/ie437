---
# ============================================================
# md/_SYLLABUS.md — the syllabus section of the landing page.
# Edit this file, run `node site.mjs`, and html/index.html is redrawn.
#
# This file owns the practical facts of the term: who teaches it, when
# and where it meets, how it is graded, and what the final project asks
# for. They live here rather than in _SITE.md so that one fact has
# exactly one home.
# ============================================================
term: 2025 Fall
heading: How the term runs
lede: >
  A graduate-level course on data-driven decision making, taught twice a week.
  Everything you need is on this page — the fourteen chapters below are the
  material, and there is no textbook to buy.

# The people. `hours` and `office` are optional; a missing one is simply
# not printed.
people:
  - role: Instructor
    name: Jinkyoo Park
    office: "E2-1, #4212"          # quoted: an unquoted # starts a YAML comment
    email: jinkyoo.park@kaist.ac.kr
    hours: Mon 16:00 – 17:00, straight after class · other times by appointment, by email
  - role: Teaching assistant
    name: Inhyuck Song
    email: son9ih@kaist.ac.kr

# The practical facts, printed as the strip under the people.
facts:
  Term: 2025 Fall
  Lectures: Mon & Wed · 14:30 – 15:45
  Location: "(E2-2) Industrial Engineering & Management Bldg. #1501"
  Prerequisites: None
  Textbook: None — these lecture notes are the material
  Language: English

# Assessment. The weights must sum to 100; site.mjs asserts it, because a
# syllabus that does not add up is the one thing on this page nobody can
# be allowed to read wrong. `tba: true` badges an item whose details are
# still to be announced.
grading:
  - name: Final project
    weight: 40
    body: >
      One industrial problem, carried from business context to a deployed prototype.
      The course's largest piece of work and the only one that leaves the classroom —
      it is set out in full below.
  - name: Midterm examination
    weight: 30
    body: >
      One written examination, in class, over the first half of the course —
      optimisation modelling, Bayesian statistics and networks, Bayesian
      optimisation, and design optimisation from a fixed dataset.
  - name: Assignments
    weight: 20
    tba: true
    body: >
      **Two** assignments, each run as a hackathon: a problem taken from a
      well-posed statement through to a working algorithm in a single sitting.
      They are rehearsals for the project's middle stage — formulate, solve,
      verify — at a scale you can finish in a day. Details are announced with each.
  - name: Attendance
    weight: 10
    body: >
      Lectures meet on Monday and Wednesday at 14:30 in the same room, and
      attendance is recorded.

# ------------------------------------------------------------
# The final project. It is the one deliverable that leaves the
# classroom, so it gets its own block under the assessment table
# rather than a line inside it. The three stages are the course's
# whole argument in miniature: a problem is not solved until
# somebody can run the solution.
# ------------------------------------------------------------
project:
  heading: The final project
  tagline: One industrial problem, carried the whole way
  lede: >
    Industrial problems do not arrive as objective functions, and a verified answer
    that never reaches anyone has changed nothing. The project asks you to carry a
    single real problem across the whole distance — find it, formulate it, solve it
    with the methods of this course, and wrap the solution in something a person
    could actually operate. ==The scope is a working application prototype==, not a
    notebook and not a report.
  stages:
    - n: "01"
      name: Business context
      tone: amber
      q: Is this worth solving?
      body: >
        Begin where the problem lives rather than where the mathematics is convenient.
        Who decides, how often, and under what constraint? What does a better decision
        earn, and what does current practice already achieve? You finish this stage with
        a problem you can defend as worth solving and a **baseline you will have to beat**.
    - n: "02"
      name: Algorithm
      tone: teal
      q: Is the answer right?
      body: >
        Translate the situation into something computable — the objective, the levers,
        the constraints, and the part you do not know — then build the decision algorithm
        from the methods of this course. Verification is the graded half: bound it, test
        it against held-out reality, and show it beats the baseline you named.
    - n: "03"
      name: Application
      tone: plum
      q: Does it reach the user?
      body: >
        Wrap the verified solution so somebody else can run it — an interface, an API, or
        an **MCP server** an AI agent can call — and deploy it where it can be reached.
        The prototype has to survive contact with its own operating loop: real inputs,
        an answer returned, and a next decision that follows from it.
  deliverables:
    - name: A problem document
      body: The formulation and the case for it, kept up to date as the problem changes under you — not written the night before.
    - name: A deployed prototype
      body: Running where someone other than your team can reach it, with the algorithm behind it and a demonstration of the loop it closes.
    - name: A decision log
      body: What you asked the AI, what came back, and what you adopted or rejected — with the reason. **Unverified AI output is not a deliverable.**
  note: >
    Teams, milestone dates and the final showcase are announced during the term.
---

The course opens with optimisation and the fundamentals of Bayesian statistics, then spends its
static half on making a design decision from data alone — Bayesian optimisation when you may still
query the world, and surrogate-based and generative design optimisation when you may not. The
dynamic half turns to decisions that unfold over time: Markov decision processes and dynamic
programming, then value-based, policy-based, model-based and finally offline reinforcement learning.

The algorithms do not stay on paper. You will implement them, deploy them as APIs, and integrate
them as AI agents through **MCP servers** — which is what the final project asks you to demonstrate.
