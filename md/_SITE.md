---
# ============================================================
# md/_SITE.md — everything on the landing page except the notices.
# Edit this file, run `node site.mjs`, and html/index.html is redrawn.
# The chapter list below only *groups* chapters; each chapter's title,
# subtitle and description come from its own front matter.
# ============================================================
course: IE437
title: Data-Driven Decision Making and Control
title_lines:                 # the hero, one line each; *word* is set in teal
  - Data-Driven
  - Decision Making
  - and *Control*
eyebrow: IE437 · KAIST Industrial & Systems Engineering
thesis: One question — how do we decide well under uncertainty? — asked along three axes, answered by two lineages.
lede: >
  Follow a decision from a known model to learning from experience and from a fixed log.
  Each chapter includes a core learning route, a worked example, and a short problem to try.
  These are the **interactive lecture notes** — fourteen chapters you can open in a browser,
  step through, and run the algorithms inside.
chips:
  - three axes
  - two lineages
  - 14 chapters

instructor: Jinkyoo Park
institute: KAIST — Industrial & Systems Engineering
contact:                      # e.g. jinkyoo.park@kaist.ac.kr

# The practical facts — term, room, office hours, grading — live in
# md/_SYLLABUS.md, which renders them as their own section.

course_heading: One question, three axes, two lineages
materials_intro: >
  Each chapter is a complete interactive deck and a downloadable PDF of the same slides.
  Start with the learning route, work through the main examples, and try the questions
  before revealing their answers. Research readings and detailed derivations follow in appendices.

# How the chapter list is grouped. Every chapter in md/ must appear
# exactly once; site.mjs warns if one is missing.
parts:
  - name: Map
    theme: The whole course on one cube
    chapters: [0]
  - name: Part I
    theme: The given world — one decision, a known objective
    chapters: [1]
  - name: Part II
    theme: The uncertain world — the objective becomes unknown
    chapters: [2, 3, 4]
  - name: Part III
    theme: Design from a fixed dataset — the oracle is gone
    chapters: [5, 6]
  - name: Part IV
    theme: The world that unfolds — two lineages, each losing its model
    chapters: [7, 8, 9, 10, 11]
  - name: Finale
    theme: Interaction itself is taken away
    chapters: [12]
  - name: Appendix
    theme: The toolbox underneath
    chapters: [99]
---

Industrial decisions do not arrive as solved problems. They arrive as a messy situation, a
budget, and a deadline — and turning that into something you can actually compute is the work.
This course builds that ability from the ground up: state a decision problem, admit what you do
not know about it, and then learn the missing part from data.

### One question

How do we make **good decisions under uncertainty**? That is the entire course. Every lecture
examines it under explicit assumptions: known models, uncertain quantities, sequential actions,
and training from a fixed log. A shared temperature-control example connects the calculations.

### Three axes

Any decision problem sits somewhere in a cube: is it one decision or a *sequence*; is the
world *given* to you as a model or must it be *learned* from data; and do you decide *alone*
or against others. The course is a route through that cube, and each lecture is one step
along it.

### Two lineages

Dynamic programming and optimal control provide complementary views of sequential decisions.
Both use values, policies and Bellman reasoning. The course uses this comparison to connect
known-model calculations with value-based, policy-based and model-based learning.
