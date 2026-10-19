---
assignments:
  - id: assignment-01-movie-programming
    number: 1
    title: Movie Programming
    subtitle: Problem Definition and Decision-Support Design
    summary: Define a movie-programming problem, build an interactive demo, and propose a decision-support approach for a cinema operator.
    version: '2.1'
    due: 'Fri, 9 Oct 2026 · 23:59 KST (UTC+9)'
    files:
      - name: assignment.md
        label: Assignment brief & rubric
      - name: problem-definition-template.md
        label: Problem definition template
      - name: problem-definition-example.md
        label: Worked example
      - name: problem-classification-reference.md
        label: Problem classification reference
  - id: midterm-depot-network
    kind: midterm
    number: 1
    title: Distribution-Centre Network Redesign
    subtitle: Midterm project — formulating and solving a hierarchical decision
    summary: Redesign a nationwide convenience-store chain's distribution-centre network. Formulate one DC's daily operation as the lower level, connect it to the upper-level decision on how many centres and where, search under an evaluation budget, and justify the balance between modelling the real operation and computing an answer — with the tools of Lectures 1, 2, 4 and 5. Two-week take-home, individual.
    version: '2.2'
    due: 'Mon, 2 Nov 2026 · 10:00 KST (UTC+9)'
    intro: |
      **30% of the grade · released Mon 19 Oct 2026, 10:00 · due Mon 2 Nov 2026, 10:00 KST · individual.**

      The midterm is a two-week take-home project in the form of Assignment 1: a problem definition, the code behind it, an interactive demonstration and a proposal. A nationwide convenience-store chain must decide how many distribution centres to run and where. You formulate the daily routing of one centre as the lower level, connect it to the upper-level decision on the number and location of centres, search under an evaluation budget, and say explicitly how you balanced modelling the real operation against being able to compute an answer. The tools are those of Lectures 1, 2, 4 and 5.

      Read the brief's *At a glance* box and Section 5, *How to approach it*, first. Start with a toy instance and have the whole pipeline running by day 7. Submit one ZIP (at most 200 MB) per student on KLMS. Questions in class and by email to the TA; any answer that changes the brief is posted under Notices as a new version.
    files:
      - name: assignment.md
        label: Midterm brief & rubric
      - name: problem-definition-template.md
        label: Problem definition template
      - name: problem-classification-reference.md
        label: Problem classification reference
      - name: problem-definition-example.md
        label: Format example
---

Add one entry per assignment. Each file must live in teaching/<id>/student/.
`kind: midterm` labels an entry "Midterm Project", names its ZIP IE437-Midterm-Project.zip, and
gives it the Midterm section and tab instead of a place under Assignments; an optional `intro`
(markdown, literal block) is printed above its card. Numbers are unique within a kind. Omit `kind`
for an ordinary assignment.
Only the listed Markdown documents are published; the ZIP is built from them.
Set `due` to a quoted, student-facing deadline including the timezone when confirmed.
Omit it while the deadline is to be announced. List entries in display order.
