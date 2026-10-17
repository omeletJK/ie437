# Response Model Simulator: Demo Guide

[Open simulator](demo.html) · [Original Response proposal](proposal.html) · [Problem definition](problem-definition.md) · [All worked examples](../index.html)

Use this demo to test a cinema programming decision, explain its predicted effect, and search for a better timetable. The aggregate response model predicts attendance for each screening and sums the predictions. The search uses **Iterated Local Search (ILS)**. All films, sites and outcomes are synthetic.

## Main classroom experiment

**Would moving Film A from a morning slot to an evening slot improve attendance?**

1. Select **Reset**. The original reference has **90 screenings**, six sites and 18 screens, with an expected-attendance score of **5,134**. Reset selects the example below but does not apply it.
2. Keep **First screening · receives the second film** at **Site D / Screen 2 / 11:05 / Film A** and **Second screening · receives the first film** at **Site D / Screen 3 / 20:15 / Film F**. Keep **Additional gap before the first screening (minutes)** at **0**.
3. Compare the original and draft timetables. Film A moves to the evening slot and Film F moves to the morning slot. Different runtimes also shift later screenings. The complete draft scores **4,969**, down **165**. Read the response table to see all affected predictions, including nearby screenings whose own film and start time did not change.
4. Open **Why does the response change?** Film A gets a higher time weight (**0.504 → 0.950**), but now starts within 90 minutes of two other Film A screenings at that site. The same-film competition factor becomes **0.72² = 0.5184**. Those neighboring screenings also lose predicted attendance. A better time slot for one film can make the complete timetable worse.
5. Select **Apply this timetable**, then **Run search**. You can pause the animation or select **Finish search**. The three-way comparison shows **5,134 original → 4,969 applied → 5,302 best found**. Search adds **333** over the applied timetable and **168** over the original, after **2,600 iterations** and **1,711 response evaluations**. The best plan passes the constraints.
6. Use **Compare a site's three screens** to inspect the applied and searched timetables. Check which films, times and screen assignments changed. The site × film heatmap reports showing counts and attendance; select a site name to inspect its detailed Gantt. The manual exchange preserves total film counts, while search can change counts within the constraints.
7. Open **Data & method** to inspect the equation, film/site inputs and rules. Select **Export results** to save the original, applied and best timetables, per-show predictions and model factors, edit settings and seed. The default result contains 90 screenings in each of the three records.

Every draft starts from the **original reference timetable**. Edits are not cumulative. Changing either screening or the added gap pauses a running search and disables search until you apply the current feasible draft. The draft preview and the retained search result are separate; the latter belongs to the applied timetable.

## Try another decision

Exchange **Site B / Screen 2 / Film A / 11:20** with **Site B / Screen 3 / Film E / 14:05**, adding a **5-minute gap before the first screening**. The checked result is **5,134 → 5,141 → 5,180**: a small manual improvement followed by a further search improvement. It uses 1,757 response evaluations and 2,600 iterations.

Keep the same pair but set the gap to **0**. The draft scores **5,148**, and the search retains **5,148**. Search does not always find a strictly better plan. Compare this outcome with the default experiment rather than assuming every search run must improve its starting timetable.

## Examine feasibility

Choose the same screening or two screenings with the same film, enter a blank or off-grid gap, or exchange a film into an unsuitable screen. The page explains why the draft cannot be applied. For example, Film C needs at least 180 seats; a 150-seat screen is rejected. The previous applied result is preserved.

For the default A/F exchange, an added gap of **65 minutes** is feasible and its final film ends at **24:38**. A gap of **70 minutes** is rejected because a film would end after closing. These two edge values were independently checked in the numerical verifier.

The collapsed **Auxiliary checks · operating-hours boundary and rejection** tests the older whole-screen delay scenario on **Site D / Screen 1**. **Boundary** uses 365 minutes: final end 24:36, four minutes before closing, score 5,099. Applying and searching that plan finds 5,352. **Failure** uses 370 minutes and is rejected. **Apply constraint-test timetable** replaces the search start with this auxiliary plan. Use the film exchange as the main class demonstration.

## Reproduce and interpret the result

Repeat **Reset → default pair and gap 0 → Apply this timetable → Finish search**. The checked result repeats **4,969 → 5,302**, with 1,711 evaluations. Applying a plan starts ILS at seed **20260829**. Reset rebuilds the reference through a uniform-response presolve; reproduce the same entry path when comparing runs. Speed 1×/4× changes animation speed, not the search budget. Search iterations include rejected moves; preview calls are excluded from the displayed evaluation count.

Scores are **rounded synthetic expected attendance across screenings**. They are not purchased tickets, observed admissions, unique people or revenue. Total scores round once, while table rows show one decimal. The six example purchase rows are illustrative and do not train this evaluator. The last film must finish by 24:40; 15-minute cleaning separates consecutive films.

This demo uses an explicit assumed response rule and ILS. Learned response fitting and Bayesian optimization remain proposal extensions. Its best feasible result is not a proven global optimum or measured business benefit. See the [verification record](verification.json) for executed checks, artifact identities and remaining tests, including unverified direct-file opening.
