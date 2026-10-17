# From the classroom brief to the two proposals

**IE437 Assignment 1 · Shared classroom comparison · English · Release 1.7**

One comparison before the two case studies. Read this comparison once, then follow the problem-solving argument in either proposal.

| Comparison | Course brief | Case A · Response + BO | Case B · Synthetic consumers |
|---|---|---|---|
| Starting records | Film, cinema, screening date/time, purchaser, paid tickets. One completed purchase per row; no dataset. | Joined schedules and purchase outcomes would train the model. The demo uses declared coefficients. | Purchasing accounts ≠ individual attendees. Fictional people and histories are generated. |
| Added data | Full schedules, runtimes, seats and operating rules are not supplied. | 6 films × 6 sites × 3 screens; 90 reference showings. Added runtimes, seats, rules and response factors. | Synthetic profiles/preferences/history; movie metadata/dates; screen seats, prices and supply rules. |
| Case assumptions | Planning horizon, current workflow and policies are left for students to define and justify. | One-day plan. Declared time/site/competition effects estimate attendance under operating rules. | Annual horizon; 10,000 local synthetic people. Preferences/frequency → movie choices → seats. |
| Proposed strategy | Choose and justify a programming strategy. No specific model or algorithm is prescribed. | Learn schedule → audience response; use Bayesian optimization (BO) to select schedule evaluations. | Model consumers → choices → demand → schedule search. Learned M1 is proposed. |
| Executable demo | Inputs → execution → inspection → revision, with a reference-plan comparison. | Upload → settings → ILS → compare/export. Synthetic response; no learned fitting or BO. | Profiles/movies → demand → plan/choices → compare/replan. Rule-based M0 + local search; M1 not applied. |

The examples add fictional planning inputs to make each strategy executable. Buying three tickets does not supply three attendee histories.

## What the six teaching fields mean

The [assignment brief](reference/assignment.md#2-client-brief-and-available-information) supplies a **record specification rather than an actual dataset**:

- `title_tag`: film alias; `venue_tag`: cinema alias.
- `play_day` and `curtain_time`: scheduled screening date and local start time, not purchase-event timestamps.
- `account_tag`: the purchasing account; `passes_bought`: the positive number of paid tickets in that completed purchase.

One row is one completed purchase for one screening. The brief does not supply dataset size, coverage period, quality, existing operating practice or measured performance. The records alone do not reveal zero-sales screenings, individual attendee histories, check-ins or the response to an alternative schedule.

## Where the added inputs are declared

- **Case A:** [CinemaPlanning.json](response/CinemaPlanning.json) declares films, runtimes, sites/screens/seats, response coefficients, operating rules and the 90-showing reference. [Screenings.csv](response/Screenings.csv) carries five timetable columns; it uses the active planning package's definitions. See the [Response problem definition](response/problem-definition.md) for the formula, supported inputs and one-day decision scope.
- **Case B:** [Movies.csv](audience/Movies.csv) supplies two fictional films, metadata and release windows (January 1–4, 2027; the January 5 end date is exclusive). The application generates fictional audience profiles/people and supplies synthetic market/rule inputs. Its configured horizon is the full 2027 year; the local seat market contains 10,000 people. See the [Synthetic audience problem definition](audience/problem-definition.md) for the M0 calculation and revision scope.

The proposed learned models and the executable demonstrations are different stages of each strategy. The Case A app uses an explicit aggregate formula and Iterated Local Search (ILS); the Case B app uses rule-based Movie First M0 and bounded local search. Neither app establishes real business performance from the homework's purchase-field specification.

[One-page presentation](classroom-comparison.html) · [All worked examples](index.html)
