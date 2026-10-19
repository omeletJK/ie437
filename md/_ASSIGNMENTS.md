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
    version: '2.0'
    due: 'Mon, 2 Nov 2026 · 10:00 KST (UTC+9)'
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
`kind: midterm` labels an entry "Midterm Project" and names its ZIP IE437-Midterm-Project.zip;
numbers are unique within a kind. Omit `kind` for an ordinary assignment.
Only the listed Markdown documents are published; the ZIP is built from them.
Set `due` to a quoted, student-facing deadline including the timezone when confirmed.
Omit it while the deadline is to be announced. List entries in display order.
