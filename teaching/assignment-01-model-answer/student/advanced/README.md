# Additional interactive simulators

These optional apps retain primarily Korean interfaces. The two main worked examples and their three deliverables are English. All inputs and results here are synthetic.

## Annual simulator

Open `annual.html`.

1. Prepare a small synthetic audience in **Population 등록**.
2. In **영화·편성 등록**, download the embedded sample XLSX, upload it, inspect validation, and apply it.
3. Confirm **목적·제약 설정**, then start the simulation from the fixed action bar at the bottom.
4. Explore **결과 해석**: film timeline → date → attendee → synthetic history.
5. Save a comparison baseline, change a release date or screening, and run again to compare scenarios.

The older annual model evolves visits across the year. It provides manual scenario evaluation rather than automatic annual optimization. Annual visit count and distinct visitor count are different quantities. Large populations and many paths increase runtime.

## Movie-first simulator

Open `movie-first.html`.

1. Keep **계산 프로필 수** at 2,000 and **초기 영화 목록** at an empty list. Optionally select **연간 빈도 직접 설정** and enter 10.
2. Select **합성 관객 준비**, then proceed to film registration.
3. Upload [movies-small.csv](movies-small.csv). It contains two invented films with a short 2027-01-01 to 2027-01-05 window. Initial potential demand needs films, rather than an uploaded screening plan.
4. Confirm the objective and operating rules. Start the simulation with the bottom action button.
5. Compare potential demand and baseline allocation. Click a film, a date and an attendee to inspect the represented history.
6. Use **결과에서 이어서 할 작업** for improvement or reaction-shock replanning. For a small shock example, choose 2027-01-03, film A and multiplier 0.2.

Candidate improvement is not guaranteed. A candidate that does not outperform the baseline under the comparison rules should not be accepted merely because a search was executed.

## Evidence and limits

Both apps execute their existing local calculation Workers. Their synthetic preferences, visit frequency, choice and supply assumptions do not identify actual people from purchase accounts. These examples do not establish field accuracy, causal uplift, or production readiness. Movie-first is the M0 development model; a learned M1 graph model is not included.

Use a small example during class and consult each main problem definition for its assumptions and validation plan. Reset/reopen between independent experiments. No company or participating-engineer names are needed to interpret these examples.
