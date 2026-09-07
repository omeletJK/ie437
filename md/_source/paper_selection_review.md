# 대표 논문과 강의 비중 개편

2026-09-07 · 기준: `899c4cd`의 838쪽 강의 → **14개 강의, 872쪽**(본문·심화 포함).

논문의 유명세만으로 기존 자료를 교체하지 않고, 3학년 학생이 **질문 → 핵심 원리 → 작은 계산/그림 → 대표 연구 → 원래 응용**을 따라가도록 읽기 우선순위를 정했다. 각 강의 앞부분에 Core / Compare / Apply 가이드를 넣고, 제목에서 논문 원문으로 이동할 수 있게 했다. 기본 통계·DP 강의에는 논문 대신 필요한 교재 절을 지정했다.

**읽기 가이드 14장과 설명·계산·비교 20장을 추가했다.** 기존 heading은 한 개의 표현을 명확히 바꾼 경우를 제외하고 모두 남아 있다. 본문의 상세 연구 10장을 appendix로 옮겼다. 원본 PDF/PPTX 파일 자체와 기존 응용 사례는 보존했다. 학생 이해도를 실제 수업에서 측정한 결과가 아니라, 개념의 선행 관계와 수학·표현에 대한 편집 검토다.

## 강의별 선택과 설명 흐름

| 강의 | 중심 읽기 | 반영 내용 |
|---|---|---|
| [00 · 67쪽](https://omeletjk.github.io/ie437/ch00_introduction.html) | Kool et al., Attention Model (ICLR 2019) | NCO의 네 역할 뒤에 4개 도시 경로 구성·비용 그림. 풍력·교통·furnace 등 기존 사례 유지. |
| [01 · 90쪽](https://omeletjk.github.io/ie437/ch01_optimization_modeling.html) | Boyd–Vandenberghe → OptNet (ICML 2017) | 최적성/KKT를 먼저 익히고 QP layer의 입력→해→손실 미분을 scalar 예제로 연결. ICNN과 역할 구분. |
| [02 · 87쪽](https://omeletjk.github.io/ie437/ch02_bayesian_statistics.html) | Murphy, PML: An Introduction (2022), 발췌 | 기존 specify–update–predict–check 및 coin/Pokémon/housing 흐름 유지. 논문 수보다 같은 계산의 반복을 우선. |
| [03 · 67쪽](https://omeletjk.github.io/ie437/ch03_bayesian_network.html) | Koller–Friedman, PGM (2009), 발췌 | 표현·추론·학습·의사결정의 질문을 구분. HMM/Kalman을 하나의 갱신 절차로 비교. |
| [04 · 61쪽](https://omeletjk.github.io/ie437/ch04_bayesian_optimization.html) | Frazier tutorial → EGO → Snoek et al. | GP/획득함수/다음 측정의 동일한 루프를 engineering 및 ML hyperparameter 사례에 적용. 동일 예산 비교 실험을 제안. |
| [05 · 50쪽](https://omeletjk.github.io/ie437/ch05_surrogate_design_optimization.html) | COMs (ICML 2021) | COMs 손실 계산을 본문 중심에 둠. NEMO/RoMA의 핵심 차이는 표로 남기고 상세 설명·benchmark는 심화로 이동. |
| [06 · 66쪽](https://omeletjk.github.io/ie437/ch06_generative_design_optimization.html) | VAE → DDPM → CbAS | MINs는 비교, DDOM/BootGen 상세와 원본 benchmark는 심화. Diffusion Policy (RSS 2023) 2장을 행동 생성 연결로 추가. |
| [07 · 56쪽](https://omeletjk.github.io/ie437/ch07_mdp_dp.html) | Sutton–Barto, Chapters 3–4 | 새 논문보다 Bellman backup·평가/개선·PI/VI를 우선하는 읽기 가이드. 기존 gridworld와 증명 유지. |
| [08 · 57쪽](https://omeletjk.github.io/ie437/ch08_value_based_rl.html) | DQN (Nature 2015) → Double DQN (AAAI 2016) | 선택과 평가를 분리하는 두 action 수치 예제. Rainbow 등은 개요 수준 유지. |
| [09 · 52쪽](https://omeletjk.github.io/ie437/ch09_optimal_control.html) | Tedrake LQR 발췌 + 기존 HJB/Pontryagin | 같은 scalar 시스템을 HJB/LQR/Pontryagin으로 비교. 안정화 해와 보장 조건을 명시. |
| [10 · 62쪽](https://omeletjk.github.io/ie437/ch10_policy_based_rl.html) | PPO, TD3, SAC | DDPG → TD3의 세 수정 → SAC 목적/갱신 → PPO–SAC 비교를 본문에 배치. TD3+BC와 MBPO의 선행 지식 제공. |
| [11 · 69쪽](https://omeletjk.github.io/ie437/ch11_model_based_rl.html) | Dyna/PETS → MBPO ↔ Dreamer | MBPO의 짧은 분기 rollout, Dreamer의 latent imagination·actor–critic, bootstrapped return 계산. DreamerV3 (Nature 2025)는 결과 해석 사례. |
| [12 · 49쪽](https://omeletjk.github.io/ie437/ch12_offline_rl.html) | TD3+BC → CQL → IQL | 가장 단순한 TD3+BC를 먼저 설명하고 BCQ/BEAR/BRAC은 비교표 유지. 세 방법의 개입 위치와 OPE를 본문 핵심으로 정리. |
| [99 · 39쪽](https://omeletjk.github.io/ie437/ch99_probability_review.html) | Murphy 및 Sutton–Barto의 필요한 절 | 새 논문 조사보다 확률 도구를 사용하는 강의로 되돌아가는 참조 방식. |

## 본문에서 심화로 이동한 자료

이동은 삭제가 아니다. 원본 주제와 현재 슬라이드 위치는 [원본 대응표](source_fidelity_traceability.md)와 [기계 검증 데이터](source_fidelity_map.json)에 연결되어 있다.

- [ch05 p48 — NEMO — how easily could the model have been talked into it?](https://omeletjk.github.io/ie437/ch05_surrogate_design_optimization.html#48)
- [ch05 p49 — RoMA — flatten the surface the optimiser is standing on](https://omeletjk.github.io/ie437/ch05_surrogate_design_optimization.html#49)
- [ch05 p50 — What the benchmark says](https://omeletjk.github.io/ie437/ch05_surrogate_design_optimization.html#50)
- [ch11 p67 — Guided policy search — solve it by alternation](https://omeletjk.github.io/ie437/ch11_model_based_rl.html#67)
- [ch11 p68 — What makes it work — and where the trust region reappears](https://omeletjk.github.io/ie437/ch11_model_based_rl.html#68)
- [ch11 p69 — The teacher that watches the student — PLATO](https://omeletjk.github.io/ie437/ch11_model_based_rl.html#69)
- [ch06 p63 — What it does on real design problems](https://omeletjk.github.io/ie437/ch06_generative_design_optimization.html#63)
- [ch06 p64 — The 2023 descendants](https://omeletjk.github.io/ie437/ch06_generative_design_optimization.html#64)
- [ch06 p65 — DDOM — reweight the data, then guide a conditional diffusion model](https://omeletjk.github.io/ie437/ch06_generative_design_optimization.html#65)
- [ch06 p66 — BootGen — generated labels do not become new measurements](https://omeletjk.github.io/ie437/ch06_generative_design_optimization.html#66)

## 새 그림과 계산의 출처

- **경로 비교:** 동일한 unit-square 도시의 perimeter/crossing 경로를 좌표로 직접 그렸다. 비용 4와 4.828은 설명용 계산이며 Kool 논문의 실험 결과가 아니다.
- **Diffusion Policy:** 관측 조건부 denoising → action prefix 실행 → 재관측을 SVG로 새로 그렸다. 예제의 horizon 4/실행 2는 설명용이며 논문의 고정 설정으로 제시하지 않았다.
- **Dreamer:** 실제 replay → latent inference/imagination → actor–critic → 실제 상호작용을 SVG로 그렸다. 2단계 return 6.14는 단순한 bootstrap 예제로, 논문의 전체 λ-return 손실을 대체하지 않는다.
- **추가 계산:** OptNet의 1차원 projection과 sensitivity, Double DQN/TD3 target, SAC entropy, scalar infinite-horizon LQR의 cost를 독립적으로 재계산했다. BO의 동일 예산 비교는 제안된 수업 실험이며 새 benchmark를 실행했다고 기술하지 않았다.

## 논문과 보장에 관한 구분

- [OptNet](https://proceedings.mlr.press/v70/amos17a.html)은 최적화 layer의 sensitivity를 다룬다. ICNN은 함수의 convex parameterization을 다룬다.
- [Double DQN](https://arxiv.org/abs/1509.06461)은 selection/evaluation 분리, [TD3](https://proceedings.mlr.press/v80/fujimoto18a.html)는 twin-critic minimum·delayed policy update·target smoothing을 사용한다. 어느 예제 target도 참값 인증서는 아니다.
- [SAC ICML 2018](https://proceedings.mlr.press/v80/haarnoja18b.html)의 별도 value-network 구성과 [후속 Algorithms and Applications](https://arxiv.org/abs/1812.05905)의 twin-Q 구성을 구분했다. 본문의 update 식은 후자다.
- [Diffusion Policy](https://diffusion-policy.cs.columbia.edu/)는 demonstration imitation으로 소개했다. 고정 데이터만 사용한다는 이유로 reward-optimized offline RL로 분류하지 않았다.
- [MBPO](https://arxiv.org/abs/1906.08253)는 짧은 rollout을 실제 데이터 상태에서 분기한다. 긴 rollout 자체를 MBPO의 핵심으로 묘사하던 문장을 수정했다.
- [Dreamer 2020](https://arxiv.org/abs/1912.01603)의 latent imagination 원리를 먼저 설명했다. [DreamerV3 Nature 2025](https://www.nature.com/articles/s41586-025-08744-2)는 8개 domain/150개 초과 task 및 Minecraft 결과를 해당 논문의 실험 범위로 제시했다. V3의 score-function actor와 원래 continuous-action Dreamer의 dynamics-gradient actor를 혼동하지 않게 했다.
- TD3+BC 결과의 출처를 데이터셋 논문 D4RL에서 [Fujimoto & Gu, NeurIPS 2021](https://arxiv.org/abs/2106.06860)로 바로잡았다. Q-normalization과 CQL의 Lagrangian constraint도 별개로 설명했다.

## 검증

- 원본 13개 PDF/1,102쪽의 파일 해시와 123개 주제 구간·528개 heading 참조가 통과했다. 원본 파일은 변경되지 않았다.
- 본문/심화 위치와 VAE→DDPM→CbAS, DDPG→TD3→SAC, Dyna→MBPO→Dreamer, TD3+BC→CQL→IQL의 선행 순서 검사가 통과했다.
- 기존 25개 수치 검증과 새 계산 16개, 총 **41개 계산 검사**가 통과했다. 수치 적분과 finite difference를 포함한다.
- 최종 로컬 화면/인쇄 검사: **14개 강의·872쪽·퀴즈 56개·위젯 75개**. overflow, KaTeX 오류, 누락 이미지, JavaScript 및 위젯 lifecycle 오류가 없다.
- PDF 14개도 합계 **872쪽**이다. 새로 추가하거나 수정·이동한 **61개 페이지를 렌더링하여 시각 검토**했다. PPO/SAC 비교표의 하단 넘침을 수정하고 재검사했다.
- [강의별 검증 데이터와 시각 검토 페이지 목록](paper_selection_validation.json)에 최종 source hash와 결과를 기록했다. 학생 대상 실험이나 새로운 논문 benchmark 실행 결과를 의미하지 않는다.

재현: `node build.mjs --all`, `node tests/source-fidelity.mjs`, `node tests/paper-selection.mjs`, `node tests/course-review.mjs`.
