# Bayesian Network 원본 그림 복원

2026-09-08 · 기준 커밋 `d9e6dfaab4366f4236c130a074305303aa452db9`

사용자 요청: 설명 중심으로 재편하면서 사라진 원본 Lecture 3의 직관적 도식과 그림 구성을 최대한 동일하게 복원한다.

원본 `lecture_slides/3. Bayesian Network.pdf` 94쪽을 모두 렌더링해 검토했다. 51개 그림 영역을 SVG로 추출하여 노드 위치, 화살표, 관측 음영, 색상, 표와 그림의 상대적 배치를 유지했다. 원본 사진도 SVG 안에 포함된다. 확대 시 선과 수식은 벡터로 표시된다.

기존 69장은 109장(본문 92장, 부록 17장)이 되었다. 그림을 먼저 읽고 계산으로 이어지도록 40장을 추가했다. 기존 69개 제목, 네 퀴즈, 네 인터랙티브 도표, 온도 예제와 연습문제를 유지했다. 다른 렉처의 내용은 바꾸지 않았다.

## 복원 범위

| 원본 구성 | 반영 위치 |
|---|---|
| 시스템 모델링, directed/undirected, DAG, 8-node graph/adjacency matrix, satellite/CPT | 2, 6–10 |
| 세 구조의 대수 비교, 주변화/조건화 좌우 비교, Wet Grass, Burglar Alarm | 18, 20–25 |
| 질의·관측 음영, factor 영역, 5단계 ancestral sampling, rejection/weighted sample 표 | 30, 32, 35–42 |
| Naive Bayes, DBN, Markov order, transition counting/marginal, HMM, IOHMM, Kalman | 45, 49–68 |
| 세 노드·세 간선 종류, 효용 곡선, additive/collision utility, MEU, PhD/startup, sequential decisions | 70–86 |
| AR coefficient/variance diagrams, ARCH/GARCH, 4단계 hybrid aircraft example | 99–109 (부록) |

## 원본과 의도적으로 다른 부분

- 원본 페이지 전체를 이미지로 붙이지 않고 그림 영역을 사용했다. 제목과 보강 설명·수식은 HTML로 유지하고 그림별 원본 쪽수를 표기했다. 반복 그림은 대표 도식을 사용했다. Hybrid/AR 확장은 이전에 정한 부록 위치에 유지했다.
- p. 16의 collider가 항상 종속이라는 단정은 “Dependence can appear given z.”로 교정하고 항상 성립하지 않는 부등식 부분을 제거했다. 노드·색상·네 행 비교는 유지했다.
- p. 19의 Wet Grass 표 제목 `p(T|S,E)`를 `p(T|R,S)`로 교정했다.
- p. 21에서 첫 prior의 `E`를 `B`로 교정했다: `P(B=1)=0.01`, `P(E=1)=10^-6`.
- p. 35는 weighted table을 보존하고 rejection table에서 오는 화살표 조각을 가렸다. 모든 새 표본의 evidence를 고정하는 likelihood-weighting 절차를 설명했다. p. 36의 하단 잘못된 확률 표기는 가져오지 않고 모델 확률과 표본 추정값을 구분했다.
- p. 59의 likelihood 표기·음영을 복제하지 않고 본문의 올바른 sequence likelihood `p(y_1:T)` 설명을 유지했다.
- IOHMM 자체가 곧 POMDP라는 문장을 수정했다. 의사결정으로 확장하려면 효용과 관측 가능한 정보·시점을 지정해야 한다.
- 원본 rejection 표는 9개 행이므로 기존 설명의 10개를 9개로 교정했다. 기존 posterior/PhD/startup 계산의 교정은 유지했다.

## 검증

- 109장 전부: 화면·인쇄 영역 넘침 0, 손상 그림 0, JavaScript/KaTeX 오류 0, 네 퀴즈·네 도표 정상.
- 최종 PDF의 변경된 53장을 렌더링해 직접 확인했다. 원본 94쪽과 51개 추출 영역도 각각 시각 검토했다.
- 원본 대응·학습 경로·논문 구성 검증 및 기존 77개 수치 검증 통과. 추가로 원본 transition의 3/5, rejection의 1/3, rare-cause posterior의 0.5, treatment threshold를 확인했다.
- 재추출 스크립트로 51개 자산의 SHA-256을 모두 동일하게 재현했다.

[그림·좌표·교정·슬라이드 대응 데이터](ch03_visual_restoration.json) · [검증 결과](ch03_visual_validation.json) · [전체 주제 대응표](source_fidelity_traceability.md)

재추출: `python3 scripts/restore-ch03-figures.py` (로컬 원본 PDF와 PyMuPDF 필요). 일반 웹사이트 빌드는 커밋된 SVG만 사용하므로 원본 PDF나 Python 의존성이 필요하지 않다.
