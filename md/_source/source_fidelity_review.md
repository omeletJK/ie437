# 전체 강의의 논리 흐름과 원본 충실도 검토

> 이전 개편 시점의 검토 기록입니다. 현재 페이지 번호·본문/심화 위치·검증 결과는 [학습 경로 개편 검토](teaching_structure_review.md)와 [원문 대응표](source_fidelity_traceability.md)를 따릅니다.

**이 문서는 838쪽 단계의 원본 대조 기록이다.** 이후 [대표 논문·본문/심화 개편](paper_selection_review.md)으로 872쪽이 되었다. 아래의 개별 쪽 번호는 당시 기준이며, [원본 대응표](source_fidelity_traceability.md)는 최신 위치로 갱신된다.

검토일: 2026-09-07 · 대상: HTML 14개 강의, 원본 PDF 13개/1,102쪽, 추가 PPTX 2개, 확률 appendix TeX, Offline RL 작성 명세.

이번 대조에서는 **기존 HTML의 큰 줄기는 연결되어 있지만, 원본 PDF의 주요 중간 단계가 일부 누락되거나 지나치게 압축되어 있었다**고 판단했다. 특히 Lecture 3·4·6·8·10을 보완했다. 43쪽을 추가하여 총 795쪽에서 **838쪽**이 되었고, 기존 퀴즈 56개와 위젯 75개 배치를 유지했다. 원본 PDF/PPTX 파일 자체는 수정하지 않았다.

[123개 원본 주제 구간과 HTML의 대응표](source_fidelity_traceability.md)에는 원본 쪽 번호, 대표 HTML 위치, 유지·복원·재배치·압축 여부와 생략 범위가 있다. [기계 검증용 데이터](source_fidelity_map.json)는 원본 파일 해시와 528개 HTML heading 참조를 포함한다. 원본 전체 페이지를 검토 구간에 배정했지만, 이는 **모든 원본 그림·유도·실험 결과를 빠짐없이 재현했다는 뜻이 아니다.**

## 각 강의의 흐름과 판정

판정은 개념·주제 단위의 편집 검토다. 학생에게 실제로 수업하거나 이해도를 측정한 결과는 아니다. 본문 계산을 따라갈 수 있는 수준을 3학년의 기본 목표로 두고, 연구 논문과 고급 유도는 두 번째 학습 단계로 구분한다.

| 강의 | 핵심 논리 흐름 | 원본 반영과 이번 판단 | 첫 학습에서의 경계 |
|---|---|---|---|
| **00 Introduction** · 65쪽 | 결정·목표·제약 → 세 분류 축 → 정적/동적 사례 → 강의 지도 | 풍력·교통·furnace 사례 유지. 원본 PDF pp.69–75의 NCO 역할 분류를 복원. 추가 PPTX의 연구·사업 전망은 확장 자료이며 모든 연구 사례를 재현하지는 않음. | 방법 이름 암기보다 각 사례의 결정과 모형을 식별. 뒷부분의 최신 시스템은 연구 전망으로 읽음. |
| **01 Optimization** · 88쪽 | 표준형 → convexity → FO 필요/충분 → KKT 진술·예제·증명 → 비볼록 SCP | 핵심 모델과 engineering 사례가 충실히 연결됨. KKT는 p39에 명시적으로 진술되고 p41에서 보장 조건을 제시한 뒤 예제·증명으로 진행. PDF와 추가 PPTX를 함께 반영. | KKT 미분과 bilevel 연구는 고급 층. 일차 조건의 동치와 boundary 예제를 먼저 이해. |
| **02 Bayesian Statistics** · 86쪽 | specify → update → predict → check; coin → conjugate models → regression | 원본의 큰 순서, Pokémon 데이터, conjugate/regression 내용을 유지. 12개 실험이 같은 계산 절차를 반복하도록 구성되어 있음. 이번 검토에서 새 핵심 누락은 찾지 못함. | posterior와 predictive, MLE/MAP/full Bayes를 구분. 반복되는 conjugacy 표의 모든 family를 별도로 유도하지는 않음. |
| **03 Bayesian Network** · 66쪽 | joint factorisation → independence → inference → learning → temporal state → utility/decision | 기존 누락이 컸음. hybrid/naive Bayes, 파라미터·구조 학습, 전이 추정·stationarity, HMM 질문, AR/Kalman, 위험 선호·additive utility를 복원. | Kalman은 먼저 scalar 갱신. ARCH/GARCH는 appendix 개요. influence diagram→MDP에 필요한 추가 가정 명시. |
| **04 Bayesian Optimization** · 59쪽 | 함수 불확실성 → GP → acquisition → 반복 실험 → 제약·다목적·한계 | 원본 후반부의 압축이 과했음. multi-output GP, acquisition 내부 탐색, constrained EI, Pareto/HV/EHVI, 계산량/차원 한계와 실습 목적을 복원. | ICM/LMC·neural GP·세부 solver는 확장. 원본의 bandit 절은 HTML에서 BO 뒤에 배치됨. |
| **05 Surrogate Design** · 48쪽 | naive surrogate → optimizer exploitation → COMs → NEMO/RoMA → 실험 | 원본 핵심 방법·손실·benchmark가 있음. 원본 NEMO→COMs 순서를 HTML은 COMs→NEMO로 바꿔 한 손실의 직관을 먼저 설명. 원본과 동일한 순서라고 할 수는 없음. | COMs 평균 보장을 개별 설계의 안전 보장으로 읽지 않음. NEMO 정리 전체와 모든 ablation은 압축. |
| **06 Generative Design** · 62쪽 | one-to-many inverse → latent model/VAE → diffusion → 조건부 설계 | VAE–diffusion–CbAS–MINs–DDOM–BootGen 줄기 유지. DDPM 학습/생성, score conditioning, DDOM 및 BootGen 실제 단계가 너무 짧아 보완. | 생성 결과의 유효성·최적성은 별도 평가. SDE와 full ELBO 도출은 appendix의 고급 층. |
| **07 MDP/DP** · 55쪽 | state/action/return → V/Q → Bellman → 평가/개선 → PI/VI → 수렴 | 원본의 순차 전개가 유지됨. 반복 gridworld 패널은 위젯과 두 번의 수치 sweep으로 압축. Lecture 3과의 연결에 Markov 가정이 필요함을 수정. | Bellman backup을 손으로 계산한 뒤 contraction proof. discounted/undiscounted 조건 구분. |
| **08 Value-based RL** · 55쪽 | MC/TD prediction → 탐색과 control → SARSA/Q-learning → approximation/DQN | first/every-visit MC, MC control, windy grid, six-room 원본 업데이트, frame history 이유를 복원. 원본의 terminal/continuing 혼동을 분리. | 먼저 같은 데이터에서 target의 차이를 계산. DQN 전체 Atari 결과·CNN 상세는 압축. |
| **09 Optimal Control** · 50쪽 | discrete DP → continuous HJB → LQR → costate/Pontryagin | 원본 PDF9 pp.1–21을 HTML9로 분리. HJB와 LQR 유지. Pontryagin act는 추가 자료이며 원본 PDF의 누락 복원으로 분류하지 않음. | scalar control과 LQR이 기본. HJB verification과 PMP necessity는 서로 다른 보장. |
| **10 Policy-based RL** · 56쪽 | trajectory gradient → variance/baseline → actor-critic → DDPG → TRPO/PPO | PDF9 pp.22–89 반영. 원본 끝의 trajectory proof를 앞으로 이동. A3C/A2C·off-policy correction 복원, MADDPG는 appendix의 IE579 preview. | 배우는 정책이 LQR과 동일한 최적해라는 단정 제거. action ratio만으로 visitation shift가 해결되지 않음. |
| **11 Model-based RL** · 63쪽 | model use → fit/plan/replan → uncertainty → differentiable planner → model-to-policy | source PDF10의 planning versions, ICNN, PILCO/GPS/PLATO/Dyna, differentiable MPC가 반영됨. 내부 탐색과 uncertain-input propagation 보완. differentiable MPC는 원본 후반에서 HTML Act3로 이동. | 한 번의 계획·재계획이 기본. implicit differentiation과 GPS constrained program은 고급 층. |
| **12 Offline RL** · 47쪽 | distribution shift → policy restriction → value conservatism → model/sequence approaches → OPE | 고정 log라는 문제에서 각 해법으로 가는 흐름은 연결됨. **대응하는 원본 PDF가 없어 원본 충실도 판정은 N/A.** 작성 명세와 인용 논문에 따른 추가 강의. | 기존 데이터의 support, CQL 보장 범위, expectile와 maximum, OPE 한계를 구분. |
| **Appendix Probability** · 38쪽 | expectation → Bayes → Gaussian conditioning → sampling/KL | 별도 원본 PDF 없음. 저장소의 probability TeX와 PDF2·4의 기초 내용을 보완해 정리. TeX의 주요 절은 모두 반영. | Lecture 2 앞에서 필요한 부분을 미리 읽어도 됨. total variance와 policy score identity를 혼동하지 않도록 수정. |

## 발견하고 바로잡은 내용

- **누락된 연결 단계:** Lecture 3은 추론만으로 학습을 대신할 수 없고, Lecture 4는 하나의 unconstrained EI만으로 원본의 constrained/multiobjective BO를 설명할 수 없었다. 해당 중간 모델·계산을 복원했다.
- **조건과 결론의 강도:** “influence diagram에 시간만 추가하면 MDP”, “kernel이 BN의 edge”, “Q-table이 GP posterior와 같은 belief”, “policy gradient가 Riccati 최적해를 그대로 찾음”처럼 오해를 만드는 연결을 수정했다. 비슷한 역할과 수학적으로 같은 대상을 구분한다.
- **생성과 평가:** encoder는 학습 후에도 inference에 사용할 수 있다. latent 축이 실제 물리적 요인이라는 보장은 없다. BootGen의 pseudo-label은 새로운 oracle 관측이 아니다.
- **교차 강의 보장:** HJB verification·LQR global solution·PMP necessity의 차이, PPO clipping과 hard KL 제약의 차이, 병렬 rollout과 독립 표본의 차이를 명시했다.
- **강의 지도:** data-driven optimization이 surrogate를 전혀 쓰지 않는다는 뜻으로 읽히지 않게 명칭을 수정했다. 다중 의사결정자는 전략적 상호작용을 추가하며 모든 문제를 자동으로 Nash equilibrium 문제로 바꾸지는 않는다.

## 원본 자체의 오류·불일치 처리

원본을 충실히 반영한다는 이유로 잘못된 수학까지 복사하지 않았다. 원본 파일은 보존하고 HTML 설명에서 구분했다.

| 원본 위치 | 확인한 문제 | HTML 처리 |
|---|---|---|
| PDF3 p56 | HMM likelihood를 hidden-state sequence 확률로 표기 | observation likelihood `p(y_1:T)`와 hidden-path decoding을 분리 |
| PDF3 p65 | Gaussian transition의 평균에 잡음 realization을 넣음 | dynamics의 random noise와 conditional Gaussian의 평균을 분리 |
| PDF3 p77 | preference ordering을 belief 확률 `P`로 표현 | outcome probability와 utility/preference를 구분 |
| PDF4 p24 | OU와 여러 Matérn 식에 같은 3/2 label 반복 | OU는 Matérn 1/2, 3/2와 5/2는 각 식으로 구분 |
| PDF4 p59 | ICM의 output covariance `B` 차원/랭크 표기 혼동 | `B`는 D×D, `B=AA^T`의 rank는 최대 min(D,R), stacked covariance는 DN×DN |
| PDF4 pp181–183 | CEI의 곱 분해를 가정 없이 읽기 쉬움 | objective/constraint posterior 독립 및 feasible incumbent 조건 명시 |
| PDF5 Part2 p47 | inner maximization을 projected gradient descent라고 표기 | max를 푸는 방향인 projected gradient ascent로 설명 |
| PDF8 p57–58 | p57 제목은 windy이지만 그림은 random-walk prediction | p58의 windy control task와 구분해 그림 재작성 |
| PDF8 pp68,70–73 | F에서 종료한다고 설명하지만 마지막 표는 F self-loop에서 계속 보상받아 Q(B,F)=500 | terminal이면100, continuing이면500. 원본 중간 업데이트50→20→75와 극한값을 별도로 설명 |

보장 조건을 확인할 때 참고한 1차 자료: [GPML](https://gaussianprocess.org/gpml/chapters/), [multi-output kernels survey](https://arxiv.org/abs/1106.6251), [Bayesian Optimization with Inequality Constraints](https://proceedings.mlr.press/v32/gardner14.html), [Constrained BO](https://jmlr.org/papers/volume17/15-616/15-616.pdf). 이전 검토에서 사용한 KKT·RL·PPO·COMs 등의 1차 참고문헌은 [이전 검토 기록](course_clarity_review.md)에 있다.

## 원본과 동일하지 않은 범위

1. 원본의 반복 animation 단계·유사 graph panel을 합쳤다. 모든 실험 결과 그림과 정리의 모든 중간 유도가 HTML에 있는 것은 아니다. 구체적인 범위는 대응표의 ‘압축’ 행에 기록했다.
2. 원본 BO 강의의 GPflowOpt 설치 screenshot과 과거 API는 실행 가능한 새 실습으로 포팅하지 않았다. 비교할 함수·budget·초기점·kernel·평가 지표라는 학습 목적을 복원했다.
3. Lecture 0의 최신 PPTX는 원본 PDF보다 길다. Sym-NCO/NCE/LS-GFN 등의 전체 연구 사례와 사업 전망을 그대로 재현한 강의는 아니다.
4. KKT/duality의 체계적 보충, Pontryagin의 독립 act, GAN/flow 비교, 추가 scalar 계산은 학습을 위한 확장이다.
5. 원본 PDF9는 HTML9/10으로 나뉘며, 원본 PDF10은 HTML11이다. HTML12는 Offline RL이고 `tex/Lecture12_Dynamic_Games.tex`와 다른 주제다. 파일 번호만으로 대응시키면 잘못된 누락 판정을 하게 된다.
6. 원본의 큰 틀을 유지했지만 BO/bandit, COMs/NEMO, policy-gradient proof, differentiable MPC의 위치는 다르다. 각 순서 변경은 대응표에 표시했다.

## 검증 기록

- 원본 13개 PDF의 해시·1,102쪽 구간 목록, 123개 주제 구간의 연속성, 528개 현재 HTML heading 참조를 검사했다. 추가 PPTX/TeX/spec 출처 해시도 기록했다.
- 새 예제의 25개 수치를 독립 계산했다: Bayesian row 추정, 전이 count/정상분포, Kalman 평균·분산, CEI, Pareto 면적, DDPM corruption/loss, MC return, six-room Q update, nonlinear expectation 등.
- 새로 추가하거나 중요하게 수정한 74개 PDF 페이지를 렌더링해 직접 검토했다. 그림과 설명의 column 종료가 누락된 3개 페이지를 수정했다.
- 최종 로컬 검사 통과: **14개 강의·838페이지·56개 퀴즈·75개 위젯**. 화면/인쇄 overflow, 수식 오류, 누락 이미지, JavaScript/위젯 lifecycle 오류가 발견되지 않았다. 배포용 PDF 14개의 총 페이지 수도 838쪽이다. [검증 결과 데이터](source_fidelity_validation.json)에 강의별 결과를 기록했다.

재현 명령: `node build.mjs --all`, `node tests/source-fidelity.mjs`, `node tests/course-review.mjs`. 원본 대조표 검사는 원본 파일이 있는 작업 저장소에서 실행한다.
