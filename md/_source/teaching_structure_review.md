> 후속 개정: [Bayesian Network 원본 그림 복원](ch03_visual_restoration.md). 아래 882장 검증은 전체 강의 구조 개편 당시의 기록이며, 현재 Lecture 3는 109장, 전체는 922장이다. 최신 페이지 번호는 teaching_route_map.json과 source_fidelity_traceability.md를 따른다.

# 전체 강의 학습 경로 개편 검토

2026-09-08 · 기준 커밋 `3fa48fd` 이후의 HTML 강의 개편. 대상은 0–12장과 확률 복습, 총 14개 덱이다.

대학교 3학년 학생이 **질문 → 직관/정의 → 작은 계산 → 해석 → 조건 변경 문제**를 따라가도록 수정했다. 기존 주제와 사례를 본문·부록·원문 대응표에 유지하면서 반복 도입을 합치고 고급 유도를 뒤로 옮겼다. 모든 장을 같은 길이로 맞추지는 않았다.

## 핵심 변화

- 처음에는 연결과 학습 목표를 짧게 제시한다. 1장과 3–12장은 4쪽에서 첫 본문 section을 시작한다. 2장은 원래 도입/사례 순서를 유지한다.
- 공통 온도 조절 예제 14개와 조건 변경 문제 14개를 추가했다. 계산 전에 예상하고, 답은 클릭으로 공개한다. PDF는 해설을 포함한 답안용 자료다.
- 필수 개념과 고급 연구를 구분했다. 읽기 가이드 14개는 핵심 경로 뒤의 appendix에 모았다. 기본 절차는 본문에 남고 전체 유도와 상세 응용은 재방문한다.
- 총량은 **872 → 882쪽**, appendix 앞의 핵심 경로는 **786 → 681쪽**이다. 후자는 title·section·closing을 포함한 물리 슬라이드 수이며 한 수업 시간에 모두 설명하라는 분량이 아니다.
- 기존 **위젯 75개와 주요 퀴즈 56개**를 유지했다. 본문과 퀴즈가 충돌하던 주장, 변경된 순서의 참조 문구, core 질문을 잘못 강조하던 심화 페이지를 정리했다.
- 사이트와 작성 규칙도 학부 핵심 경로에 맞췄다. 공식 등록 제한을 새로 정하지 않고, 필요한 기초 지식을 Expected preparation으로 설명한다. 학기·담당자·배점은 변경하지 않았다.

## 강의별 구성과 분량

| 강의 | 이전 본문 → 현재 본문 | 전체 | 보강한 흐름 |
|---|---:|---:|---|
| [00](https://omeletjk.github.io/ie437/ch00_introduction.html) | 67 → 49 | 71 | 결정·정보·평가를 먼저 설명하고 공통 난방 예제를 시작. 풍력·교통·공정의 상세 연구 결과와 시스템 전망은 부록으로 분리. |
| [01](https://omeletjk.github.io/ie437/ch01_optimization_modeling.html) | 86 → 52 | 93 | 표준형 → 볼록성 → 일차 필요/충분 → KKT 진술·계산·증명 → 비볼록 근사 순서. 난방 상한을 바꾸어 multiplier 계산. 최적화 계층·상세 풍력 및 공동 설계는 심화. |
| [02](https://omeletjk.github.io/ie437/ch02_bayesian_statistics.html) | 76 → 76 | 88 | 원래 coin → conjugate pairs → regression 흐름과 12개 실험 유지. 센서 잡음을 바꿔 posterior와 predictive를 직접 비교. |
| [03](https://omeletjk.github.io/ie437/ch03_bayesian_network.html) | 61 → 58 | 69 | 표현·독립성·추론 뒤에 학습과 시간 추적을 별도 구분. HMM 난방 모드의 예측/갱신을 계산. 구조 학습 및 고급 모델 종류는 심화. |
| [04](https://omeletjk.github.io/ie437/ch04_bayesian_optimization.html) | 52 → 47 | 61 | GP → 획득함수 → 측정 → 갱신을 중심으로 재정렬. UCB 가중치를 바꾸는 문제. 다중 출력 커널과 EHVI의 상세는 심화. |
| [05](https://omeletjk.github.io/ie437/ch05_surrogate_design_optimization.html) | 42 → 39 | 49 | 예측 품질과 선택 품질을 구별. 최적화가 항상 최대 오차를 찾는다는 퀴즈/설명을 수정. COMs를 핵심으로 유지하고 상세 대안은 부록에서 비교. |
| [06](https://omeletjk.github.io/ie437/ch06_generative_design_optimization.html) | 55 → 54 | 67 | VAE와 DDPM의 학습·생성 절차는 핵심. ELBO는 두 항의 의미부터 설명하고 전체 유도는 부록. 성공 조건부 설계 확률과 잘못된 평균을 계산. |
| [07](https://omeletjk.github.io/ie437/ch07_mdp_dp.html) | 51 → 48 | 55 | Bellman backup 뒤에 변형 전이 문제. contraction 의미와 수치 bound를 배운 다음 수렴 퀴즈. 전체 증명은 기존 부록에서 확인. |
| [08](https://omeletjk.github.io/ie437/ch08_value_based_rl.html) | 52 → 48 | 56 | MC/TD → control → Q-learning → DQN 유지. 새 Q-learning 계산은 off-policy 개념 뒤에 배치하여 아직 배우지 않은 target을 먼저 요구하지 않도록 함. |
| [09](https://omeletjk.github.io/ie437/ch09_optimal_control.html) | 47 → 40 | 55 | 한 단계 피드백 → LQR → HJB → Pontryagin. LQR 결과를 먼저 진술하고 scalar 문제는 제곱 완성과 미적분으로 검증. HJB/Riccati 상세 유도는 부록. costate 설명의 수식/문장 배치 수정. |
| [10](https://omeletjk.github.io/ie437/ch10_policy_based_rl.html) | 54 → 50 | 61 | REINFORCE → baseline/critic → DDPG·TD3·SAC → PPO 비교. 행동 가치에 공통 상수를 더해도 경사 방향이 같은 예제. actor/critic을 배타적 학문 계보로 설명하지 않음. |
| [11](https://omeletjk.github.io/ie437/ch11_model_based_rl.html) | 60 → 43 | 67 | 모델 → MPC/PETS → Dyna/MBPO → Dreamer 순서. 측정 상태 갱신과 모델 재학습을 구분. KKT 미분·PILCO·GPS·bilevel은 부록. 마무리도 세 가지 핵심 모델 사용법으로 정렬. |
| [12](https://omeletjk.github.io/ie437/ch12_offline_rl.html) | 44 → 39 | 50 | 고정 로그의 문제 → 정책/가치 학습 → 평가. IS 수치 계산 및 support가 없는 경우를 비교. 마지막 정리는 정책·가치·평가로 구성하고 세부 모델 방법/보장/OPE는 심화. |
| [99](https://omeletjk.github.io/ie437/ch99_probability_review.html) | 39 → 38 | 40 | 기대값·조건부·가우시안·표본 도구의 사용 목적을 명시. 온도 불확실성과 센서 잡음을 전체 분산 법칙으로 구분. |

## 공통 예제의 가정

기본형은 목표 22°C, x=T−22, 다음 오차 x′=x+u, 비용 c=(x′)²+u²이다. 실제 건물 물리의 보정된 모델이 아니라 교육용 정규화 모형이다. 알려진 모형·숨겨진 반응·센서 잡음·전이 실패·이산/연속 행동·고정 로그 등 변경한 가정을 각 슬라이드에서 밝힌다. BO/오프라인 학습자가 검증용 simulator의 참값을 알고 있다고 가정하지 않는다.

예제 숫자는 논문의 실험 성능이 아니다. 수치적 적분, 격자 탐색, 유한 차분 및 직접 확률 계산으로 해설을 따로 검산했다. 단일 관측, 좋은 예측, 높은 학습 가치만으로 정책 성능이나 전역 최적성을 주장하지 않는다.

## 원본 반영과 경계

원본 PDF **13개·1,102쪽**, **123개 주제 구간**, **528개 대표 슬라이드 참조**의 추적 구조를 유지했다. PDF/PPTX/TeX/spec의 원본 해시를 검증했다. 모든 원본 페이지에 구간이 있지만, 모든 원문 그림·수식·유도가 동일하게 복제되었다는 뜻은 아니다. 병합한 도입과 변경한 heading, 본문/심화 위치는 기계 판독 대응표에 기록했다.

[원본 주제 대응표](source_fidelity_traceability.md) · [원본 및 구간 데이터](source_fidelity_map.json) · [개편 경로와 제목 변경 기록](teaching_route_map.json)

학습 효과는 실제 학생 평가로 측정한 결과가 아니다. 이 검토는 선수 개념 순서, 가정·결론의 일관성, 계산 정확성과 읽을 수 있는 표현을 확인한 편집·기술 검토다. 특히 2장은 여러 통계 모형을 다루므로 section 단위로 나누어 학습하는 자료다.

## 검증

최종 로컬 검증: **14개 덱·882쪽, 퀴즈 56개, 위젯 75개, 수치 검증 77개 통과**. 화면/인쇄 넘침과 실행 오류는 0건이다. 변경 및 이동된 시각 자료 **160쪽**을 PDF 이미지로 확인했다.

검증 결과는 [teaching_validation.json](teaching_validation.json)에 기록한다. 해당 기록에는 최종 markdown SHA-256, HTML/PDF 페이지 수, 퀴즈·위젯 수, 수치 검증 및 PDF 시각 검토 범위를 포함한다.

- `node tests/teaching-route.mjs`: 선수 개념 순서, 핵심/부록 경계, 14쌍의 연습, 기존 위젯 유지, 신규 수치 검증 36개.
- `node tests/source-fidelity.mjs`: 원본 해시, 모든 PDF 페이지의 연속 구간, 현재 참조 heading, 기존 수치 검증 25개.
- `node tests/paper-selection.mjs`: 대표 논문·선수 방법 순서와 수치 검증 16개.
- `node tests/course-review.mjs`: 모든 슬라이드 화면/인쇄 여백, 수식, 그림, 퀴즈 오답·정답 반응과 위젯 동작.
- PDF를 이미지로 렌더링하여 신규·수정 페이지 및 이동한 원본 그림/위젯을 시각 검토. 확인 중 발견한 LQR 선행 유도, costate 문장 분리와 페이지 여백을 수정 후 다시 확인.
