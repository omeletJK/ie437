# IE437 전체 강의 흐름 검토와 Chapter 6 개편 계획

작성일: 2026-10-12  
검토 범위: 현재 Chapter 1–5 원고의 본문과 부록, Chapter 6 초안, 장 사이의 연결 문서  
문서 상태: 다른 에이전트의 검토를 위한 개편 제안. 이 계획에 따른 강의 원고 수정은 아직 적용하지 않았다.

핵심 판단은 Chapter 6를 **좋은 후보를 찾는 공간과 분포를 학습하는 장**으로 구성하는 것이다. Chapter 1–5에서 배운 최적화, 확률분포, 추론, 샘플링, 실험 선택, 모델 신뢰성을 함께 활용한다. 기존 G1–G4는 유지하되, 생성 모델이 제공하는 능력과 필요한 가정을 구별한다.

Chapter 6의 제안 제목은 **Generating Better Designs from Offline Data**이다. 중심 메시지는 다음과 같다.

> 성능을 판단하는 모델에 더해, 좋은 후보를 찾는 공간과 분포를 학습한다.

**1. 검토할 실제 원고와 문서**

프로젝트 루트는 /Users/jinkyoo/Projects/ie437-slides 이다. 강의의 원본은 Markdown이며 HTML은 이 원본에서 생성된다.

| 자료 | 절대 경로 |
|---|---|
| Chapter 1 | [ch01_optimization_modeling.md](/Users/jinkyoo/Projects/ie437-slides/md/ch01_optimization_modeling.md) |
| Chapter 2 | [ch02_bayesian_statistics.md](/Users/jinkyoo/Projects/ie437-slides/md/ch02_bayesian_statistics.md) |
| Chapter 3 | [ch03_bayesian_network.md](/Users/jinkyoo/Projects/ie437-slides/md/ch03_bayesian_network.md) |
| Chapter 4 | [ch04_bayesian_optimization.md](/Users/jinkyoo/Projects/ie437-slides/md/ch04_bayesian_optimization.md) |
| Chapter 5 | [ch05_surrogate_design_optimization.md](/Users/jinkyoo/Projects/ie437-slides/md/ch05_surrogate_design_optimization.md) |
| 현재 Chapter 6 초안 | [ch06_generative_design_optimization.md](/Users/jinkyoo/Projects/ie437-slides/md/ch06_generative_design_optimization.md) |
| 장 사이의 선수 개념과 연결 | [_CHAIN.md](/Users/jinkyoo/Projects/ie437-slides/md/_CHAIN.md) |
| 기존 전체 구성 원칙 | [IE437_Course_Narrative_Spine.md](/Users/jinkyoo/Projects/ie437-slides/IE437_Course_Narrative_Spine.md) |
| 이전 Ch 5–6 집필 계획 | [ch05_ch06_plan.md](/Users/jinkyoo/Projects/ie437-slides/md/_source/ch05_ch06_plan.md) |

이 문서는 이전 계획을 그대로 요약한 것이 아니다. 현재 Ch 1–5를 함께 읽은 뒤 Ch 6의 선수 개념, 역할, 설명 순서와 논문 배치를 재검토한 제안이다. 기존 구성 원칙에는 Ch 6의 VAE·DDPM 학습 및 생성 절차를 강조하는 부분이 있다. 이번 제안은 그 기반을 유지하면서, 사용자가 요청한 네 가지 생성 기반 최적화 메커니즘에 본문의 중심을 둔다.

**2. 사용자의 교육 목표와 구성 조건**

- Ch 5는 Offline MBO의 문제 정의에서 출발하여 OOD와 optimizer exploitation을 설명한다. 이후 conservatism, uncertainty, system knowledge라는 세 가지 연구 방향을 비교한다.
- Ch 6는 생성 모델을 이용한 최적화의 큰 갈래와 메커니즘을 설명하고, 각 갈래에 대표 논문 약 두 편을 배치한다.
- 각 Chapter는 75분 수업 두 회, 총 150분이다.
- 논문 목록보다 문제 해결의 흐름이 먼저다. 논문은 어떤 질문을 해결하는지, 무엇을 추가로 가정하는지, 다른 연구와 어떻게 연결되는지를 보여준다.
- 숫자를 나열하는 설명보다 그림과 개념을 중심으로 강의한다. 필요한 수식과 계산은 유지하지만, 상세 숫자와 긴 유도는 노트 또는 부록으로 옮긴다.
- 연구실 논문은 교육적 연결이 분명한 곳에 배치한다. 모든 갈래에 연구실 논문을 넣을 필요는 없다.
- Strict offline 방법, 추가 시스템 지식을 사용하는 방법, 온라인 평가가 있는 응용을 구별한다.

**3. Chapter 1–5 검토와 Chapter 6로의 연결**

| Chapter | 학생이 배우는 핵심 | 현재 구성의 강점 | Chapter 6가 이어받을 내용 |
|---|---|---|---|
| 1 · Optimization Modeling | 결정변수·목적·제약을 명시하고, convexity와 최적성 조건을 이용한다. | 해를 찾는 것과 최적성을 증명하는 것을 구별한다. Trust region과 실제 모델 평가의 역할도 설명한다. | 생성한 후보도 원래 목적과 제약으로 평가해야 한다. 학습한 모델의 최적해가 실제 시스템의 최적해라는 결론은 별도로 검토해야 한다. |
| 2 · Bayesian Statistics | likelihood·posterior·predictive를 구별하고, 추정과 예측 및 정규화를 연결한다. | 모수 불확실성과 관측 잡음을 구별하며 MLE, MAP, full Bayes의 역할을 설명한다. | 생성 모델을 MLE와 연결한다. 설계분포의 다양성을 예측 불확실성과 구별하고, 무엇에 대한 분포인지 계속 밝힌다. |
| 3 · Bayesian Networks | 고차원 joint distribution을 구조로 표현하고, 추론·샘플링·학습·기대효용을 구별한다. | Ancestral sampling, likelihood weighting, rare-evidence failure, hidden-state inference가 이미 등장한다. | 생성은 이미 배운 연산이다. 조건부 생성과 CbAS를 기존 조건부 추론 및 재가중에서 발전시킨다. |
| 4 · Bayesian Optimization | 모델과 acquisition을 이용해 다음 실험을 선택한다. | 모델·선택 규칙·실제 평가를 구별한다. CMA-ES, latent-space BO, DiBO도 소개한다. | G1과 G2의 기본 아이디어를 복습으로 연결한다. 생성 기반 탐색의 온라인 사례와 strict offline 문제의 차이를 표시한다. |
| 5 · Surrogate-based Offline MBO | 예측 오류가 최적화의 선택 오류로 바뀌는 과정을 진단한다. | Conservatism, uncertainty, system knowledge를 같은 OOD 문제에 대한 상호보완적인 답으로 비교한다. | 생성·재학습·guidance에도 성능 모델의 오류가 작용한다. 후보 생성과 성능 평가의 역할을 함께 설계한다. |

전체 흐름은 다음과 같다.

> 문제를 쓴다 → 모르는 양을 추정한다 → 시스템의 분포를 표현한다 → 정보를 얻을 실험을 고른다 → 추가 실험 없이 판단한다 → 좋은 후보를 찾는 공간과 분포를 학습한다.

Ch 1–5의 큰 구조를 다시 쓰는 것은 권하지 않는다. 필요한 보완은 Ch 6로 넘기는 개념과 결론 문장을 정리하는 것이다.

Ch 1에서는 최적성 certificate가 명시한 수학적 문제에 대한 보장이라는 점을 계속 유지한다. Ch 2에서는 분포의 대상과 모형 가정을 유지한다. Ch 3에서는 확률적 추론과 결정의 차이를 재사용한다. Ch 4에서는 latent BO와 DiBO를 Ch 6의 예고로 취급하여 중복 설명을 줄인다. Ch 5에서는 신뢰성을 개선하는 방법을 배웠다는 결론을 내리고, 신뢰성이 일반적으로 확보되었다는 표현은 피한다.

Ch 5B의 NEMO 본문에는 CNML 분포를 구성한 뒤 어떤 의사결정 점수로 후보를 선택하는지 연결하는 설명을 보충할 필요가 있다. 또한 FGM의 함수 분해와 Ch 3의 확률분포 factorization은 관련된 구조 활용 사례이지만 같은 수학적 가정은 아니라는 점을 구별한다.

**4. Chapter 6의 정확한 역할**

Ch 6의 도입 질문은 다음이 적절하다.

> 우리는 이미 샘플링과 재가중을 배웠다. 이것을 이용해 고차원 설계에서 좋은 후보를 더 자주 제안할 수 있을까?

이 도입은 생성 모델을 처음 만나는 기술처럼 제시하지 않는다. 새로 배울 내용은 복잡한 설계분포를 학습하는 방법과, 그 모델을 최적화에 활용하는 네 가지 개입 위치다.

두 모델의 역할을 한 그림으로 비교한다.

- 성능 모델: 주어진 후보가 얼마나 좋은가?
- 생성 모델: 어떤 후보를 어떻게 제안할 것인가?

Ch 5의 모델은 성능을 판단할 근거를 개선한다. Ch 6의 모델은 후보를 찾는 좌표, 후보분포, 조건 및 샘플링 절차를 바꾼다. 두 모델은 결합할 수 있다.

현재 제목과 결론에 있는 “Don’t search the design — produce it” 또는 “search against produce”는 수정하는 편이 좋다. G1은 생성 모델의 좌표에서 실제로 탐색하며, G2·G4도 학습 또는 샘플링 과정에 최적화를 포함한다. 생성과 탐색을 배타적인 대안으로 설명하지 않는다.

**5. 공통 문제 설정과 정보의 경계**

두 장에서 같은 문제를 유지한다.

\[
\mathcal D=\{(x_i,y_i)\}_{i=1}^{N},\qquad y_i=f(x_i)+\epsilon_i,
\qquad \max_{x\in\mathcal X_{\mathrm{valid}}} f(x).
\]

알고리즘이 사용하는 것은 고정된 데이터와 명시적으로 허용한 사전 지식이다. Strict offline 실험에서는 학습, 후보 선택, 튜닝 중에 실제 objective를 호출하지 않는다. 최종 benchmark 채점과 강의용 결과 설명에 사용하는 hidden oracle은 별도로 표시한다.

생성 모델의 입력 공간 구조를 학습하는 것과 제약을 정확히 만족시키는 것은 구별한다. 알려진 제약은 직접 검사하거나 decoder에 강제할 수 있다. 관측으로만 파악할 수 있는 제약은 별도의 예측과 신뢰성 검토가 필요하다. 일반적인 learned prior는 plausibility를 제공하며 모든 설계의 feasibility를 보장하지 않는다.

후보 수와 실제 평가 예산을 맞춰 비교한다. 후보 집합의 최고 oracle 점수는 단일 후보를 oracle 없이 정확하게 고를 수 있다는 뜻이 아니다.

**6. 새로 도입해야 하는 선수 개념**

분포의 대상부터 구별한다.

| 분포 | 질문 | Ch 6에서 주의할 점 |
|---|---|---|
| \(p(w\mid D)\) | 어떤 성능 예측 모델이 맞을 수 있는가? | 모수에 대한 믿음이다. |
| \(p(y\mid x,D)\) | 이 설계의 성능은 무엇일 수 있는가? | 예측 불확실성 및 관측 잡음과 연결된다. |
| \(p_\theta(x)\) | 어떤 설계를 제안할 것인가? | 후보 다양성 자체는 성능 예측의 불확실성을 뜻하지 않는다. |
| \(p_\theta(x\mid y)\) | 목표 성능 조건에 어떤 여러 설계가 대응하는가? | 조건을 요청한 것과 실제로 그 성능을 관측한 것은 다르다. |
| \(p(z)\) | 생성에 사용할 잠재 코드는 어떻게 뽑는가? | VAE의 latent randomness는 Bayesian parameter uncertainty와 같은 것이 아니다. |

“Prior”라는 말도 구별한다. Ch 2의 parameter prior, VAE의 latent prior, 설계에 대한 generative reference distribution은 서로 다른 대상에 놓인 분포다. 생성 모델의 가중치는 보통 점추정으로 학습되며, stochastic generation만으로 그 가중치의 posterior를 유지하는 것은 아니다.

Ch 1–5에는 KL divergence를 정의하고 설명하는 본문이 없다. KL은 이미 배운 개념으로 가정하지 않는다. VAE 전에 두 분포를 그림으로 비교하고, 다음 정의와 역할을 짧게 소개한다.

\[
D_{\mathrm{KL}}(q\|p)=\mathbb E_{x\sim q}
\left[\log\frac{q(x)}{p(x)}\right].
\]

KL은 방향이 있는 분포 비교다. 뒤에서 VAE, CbAS의 분포 근사, 설계분포의 regularization에 각각 사용되므로 무엇을 무엇에 맞추는지 표시한다. 유한한 KL을 논의할 때 필요한 support 조건도 함께 밝힌다.

Diffusion의 density score, \(\nabla_x\log p_t(x)\), 와 설계의 performance score, \(f(x)\), 는 다른 양이다. 두 의미를 같은 “score”라는 말로만 설명하지 않는다.

**7. 생성 모델 기초의 설명 깊이**

VAE와 DDPM은 이후 최적화 방법의 도구로 설명한다. 두 모델 모두 “무엇을 학습하는가 → 어떻게 생성하는가 → 어떤 최적화 개입이 가능한가”를 동일한 순서로 읽는다.

VAE는 Ch 3의 latent-variable inference를 연결점으로 삼는다. Decoder가 \(p_\theta(x\mid z)\)를 정의하고, encoder가 계산하기 어려운 posterior \(p_\theta(z\mid x)\)를 \(q_\phi(z\mid x)\)로 근사한다. 기본 ELBO는 다음 형태로 제시한다.

\[
\mathcal L(x)=
\mathbb E_{q_\phi(z\mid x)}[\log p_\theta(x\mid z)]
-D_{\mathrm{KL}}(q_\phi(z\mid x)\|p(z)).
\]

먼저 표준 목적함수의 두 항을 설명한다. Beta-VAE의 가중치 변화는 별도 변형으로 설명하며, 임의의 가중치가 붙은 목적함수를 표준 ELBO와 같은 식으로 취급하지 않는다. 완전한 유도와 reparameterization 세부 증명은 부록으로 둔다. [VAE 원논문](https://arxiv.org/abs/1312.6114)

DDPM은 clean design에 알려진 noise를 추가하고 이를 예측하는 학습 그림, pure noise에서 단계적으로 denoising하는 생성 그림으로 설명한다. 본문에서는 학습 loss와 생성 절차를 이해하는 것이 목표다. Hierarchical VAE, score matching, SDE의 상세 연결은 부록으로 둔다.

Classifier guidance와 classifier-free guidance의 차이는 유지하되, 본문의 상세 설명은 G3·G4에서 각각 필요해지는 시점에 배치한다. Denoising의 단계는 물리적 시간이나 실험 횟수가 아니라 알고리즘 내부의 단계다.

**8. 네 가지 개입 위치와 대표 논문**

G1–G4는 상호배타적인 알고리즘 분류가 아니다. 성능 신호가 어느 지점에 개입하는지를 나타낸다.

| 갈래 | 핵심 질문 | 이전 장과의 연결 | 대표 논문 |
|---|---|---|---|
| G1 · 탐색 좌표 | 어떤 공간에서 후보를 탐색할 것인가? | Ch 1의 최적화와 Ch 4의 latent BO | Gómez-Bombarelli et al. (2018), JT-VAE (2018) |
| G2 · 생성분포 학습 | 좋은 후보에 확률을 어떻게 더 배분할 것인가? | Ch 3의 재가중과 Ch 4의 분포 기반 탐색 | CbAS (2019), GFlowNet (2021) |
| G3 · 성능 조건 | 원하는 성능에서 여러 설계를 어떻게 생성할 것인가? | Ch 2·3의 조건부 분포와 Ch 5의 성능 신뢰성 | MINs (2020), DDOM (2023) |
| G4 · 샘플링 조절 | 생성 과정에 성능 모델을 어떻게 개입시킬 것인가? | Ch 5의 surrogate와 optimizer exploitation | RGD (2024), NOS/LaMBO-2 (2023) |

각 갈래는 문제 → 그림 → 핵심 메커니즘 → 대표 논문 → 추가 가정 → 남는 실패 가능성으로 설명한다. 두 편의 대표 논문을 같은 깊이로 가르칠 필요는 없다.

G1은 이미 Ch 4에서 소개한 latent BO를 짧게 복습한 뒤, 공간을 학습했다는 것이 무엇을 바꾸는지 설명한다. Gómez-Bombarelli의 역할은 discrete molecule을 continuous coordinates로 바꾸는 것이다. JT-VAE는 분자 구조를 반영한 생성 방식과 chemical validity를 설명하는 비교 사례다. Chemical validity를 합성 가능성이나 원하는 성능의 보장으로 확장하지 않는다. LCOMs는 Ch 5의 conservatism과 G1을 결합한 연결 사례로 둔다.

- [Gómez-Bombarelli et al., Automatic chemical design using a data-driven continuous representation of molecules](https://arxiv.org/abs/1610.02415)
- [Jin et al., Junction Tree Variational Autoencoder for Molecular Graph Generation](https://proceedings.mlr.press/v80/jin18a.html)

G2는 Ch 3의 rare-evidence sampling 문제에서 출발한다. 성공 사건 \(S\)가 드물면 기존 분포에서 뽑은 샘플 대부분이 작은 가중치를 가진다. CbAS는 이 문제를 완화하기 위해 proposal과 목표 조건을 적응적으로 바꾸며 생성분포를 학습한다. GFlowNet은 보상에 비례하는 terminal distribution을 flow consistency로 학습하는 비교 사례다. 두 방법의 목표와 학습 절차를 같은 반복 재학습 알고리즘으로 설명하지 않는다.

- [Brookes et al., Conditioning by adaptive sampling for robust design](https://proceedings.mlr.press/v97/brookes19a.html)
- [Bengio et al., Flow Network based Generative Models for Non-Iterative Diverse Candidate Generation](https://proceedings.neurips.cc/paper/2021/hash/e614f646836aaed9f89ce58e837e2310-Abstract.html)

GFlowNet이 strict offline 방법이 되려면 reward 신호의 출처를 명시해야 한다. 실제 objective를 새 후보에 호출한다면 온라인 설정이다. 학습한 proxy를 reward로 사용한다면 Ch 5의 신뢰성 문제가 남는다.

G3는 one-to-many inverse를 중심에 둔다. MINs의 forward–inverse consistency와 latent 제약을 유지한다. 목표 성능과 latent variable을 함께 최적화하는 inference가 있으므로 단순한 conditional sampling 또는 “no search”로 축약하지 않는다. DDOM은 score-conditioned diffusion, reweighting, classifier-free guidance의 조합으로 설명한다. 기본 생성 조건과 실제 성능이 dataset maximum을 넘을 가능성은 구별한다.

- [Kumar & Levine, Model Inversion Networks for Model-Based Optimization](https://proceedings.neurips.cc/paper/2020/hash/373e4c5d8edfa8b74fd4b6791d0cf6dc-Abstract.html)
- [Krishnamoorthy et al., Diffusion Models for Black-Box Optimization](https://proceedings.mlr.press/v202/krishnamoorthy23a.html)

G4는 성능 신호를 sampler에 넣는 개입이다. 별도 property model을 이용하는 guidance 원리를 먼저 설명한 뒤 RGD를 다룬다. RGD는 단순히 모든 좌표에 proxy gradient를 더하는 방식이 아니라 proxy로 CFG 강도 \(\omega\)를 조절하는 sampling과 diffusion 기반 proxy refinement를 결합한다. 한 개의 scalar를 조절한다는 사실만으로 안전성이 보장되었다고 설명하지 않는다.

- [Chen et al., Robust Guided Diffusion for Offline Black-Box Optimization](https://arxiv.org/html/2410.00983v1)
- [Gruver et al., Protein Design with Guided Discrete Diffusion](https://arxiv.org/abs/2305.20009)

NOS와 LaMBO-2는 같은 논문의 서로 연결된 방법이다. NOS는 discrete diffusion의 continuous hidden states에 guidance를 적용하고, LaMBO-2는 이를 BO에 활용한다. Guidance 메커니즘과 실험 feedback이 있는 응용을 구별하여 소개한다.

**9. CbAS를 중심 계산으로 두는 이유**

CbAS는 앞선 장의 Bayes, sampling, weighting, regression 및 OOD 문제를 함께 활용한다. 먼저 다음 식을 그림과 연결한다.

\[
q_{\mathrm{target}}(x)\propto
\underbrace{p_{\mathrm{base}}(x)}_{\text{기본 설계분포}}
\underbrace{\widehat P(S\mid x)}_{\text{모델이 예측하는 성공 가능성}}.
\]

여기서 성공 모델은 실제 새 관측이 아니라 기존 데이터에서 학습한 모델이다. 식은 해당 모델이 정의하는 조건부 목표분포를 나타내며, 실제 성공을 증명하지 않는다.

설명은 기본 후보분포 → 성공 가능성에 따른 가중치 → weighted maximum likelihood → proposal 갱신 → 더 어려운 성공 조건 순으로 진행한다.

현재 proposal \(r_t\)에서 샘플을 뽑을 때의 가중치는 다음처럼 읽는다.

\[
w_t(x)=\frac{p_{\mathrm{base}}(x)}{r_t(x)}
\widehat P(S_t\mid x).
\]

첫 비율은 proposal을 바꾼 데 대한 보정이다. 성공 가능성은 목표 조건의 가중치다. 비율 자체가 유효성 검사나 성능 보장은 아니다. 중요한 목표 영역을 proposal이 커버하지 못하면 재가중도 실패할 수 있다.

Ch 3의 likelihood weighting과 공통 원리를 비교하되, Ch 3의 고정 모형에서 관측 evidence를 처리하는 문제와 설계 최적화에서 proposal 및 성공 조건을 바꾸는 문제를 구별한다.

**10. KL 정규화 분포 최적화의 위치와 적용 범위**

Session 2에서 후보분포를 바꾸는 한 가지 수학적 관점을 제시한다.

\[
\max_{q\ll p_{\mathrm{gen}}}
\left\{\mathbb E_q[\tilde f(x)]
-\frac{1}{\beta}D_{\mathrm{KL}}(q\|p_{\mathrm{gen}})\right\}.
\]

\(\beta>0\)이고 \(Z_\beta=\mathbb E_{p_{\mathrm{gen}}}[e^{\beta\tilde f}]<\infty\)인 등 목적함수가 정의되는 조건에서,

\[
q^*(x)=\frac{p_{\mathrm{gen}}(x)e^{\beta\tilde f(x)}}{Z_\beta}.
\]

핵심 유도는 다음 한 줄이다.

\[
\mathbb E_q[\tilde f]-\frac1\beta D_{\mathrm{KL}}(q\|p_{\mathrm{gen}})
=\frac1\beta\log Z_\beta-\frac1\beta D_{\mathrm{KL}}(q\|q^*).
\]

이 관점은 Ch 1의 최적화, Ch 2의 분포, Ch 5의 신뢰성을 고려한 score를 연결한다. COMs는 predictor를 조정하고 이 목적함수의 KL은 후보분포를 조정한다. 규제 대상이 다르다.

이 식을 모든 G1–G4 논문의 정확한 목적함수로 제시하지 않는다. CbAS는 \(\tilde f=\log\widehat P(S\mid x)\), \(\beta=1\)인 목표분포와 연결할 수 있다. 하지만 MINs의 constrained inference, GFlowNet의 reward-proportional distribution, BootGen의 rank weighting과 bootstrapping을 모두 같은 최적화 문제로 동일시하지 않는다.

CbAS의 \(D_{\mathrm{KL}}(p_{\mathrm{target}}\|q_\theta)\)는 목표분포를 생성기에 근사시키는 fitting objective다. 위 식의 \(D_{\mathrm{KL}}(q\|p_{\mathrm{gen}})\)는 후보분포의 이동을 규제한다. KL의 방향이 다른 이유와 두 항의 역할을 설명한다.

정확한 target distribution이 유도되었다는 것과 실제 diffusion sampler가 그 분포에서 정확하게 샘플링한다는 것은 별개다. 또한 KL은 pointwise 이동 한도나 hard feasibility constraint가 아니다. 넓은 tail을 가진 prior에서는 큰 성능 신호가 먼 영역으로 확률을 옮길 수 있다.

**11. 연구실 논문과 응용의 배치**

| 논문 또는 사례 | 배치 | 설명할 차별점과 설정 |
|---|---|---|
| BootGen | G2+G3 연결 | Score conditioning, rank-weighted training, proxy-labelled bootstrapping. 추가 label은 실제 평가값이 아니다. |
| GTG | G3 확장 | 단일 설계 대신 개선 trajectory를 생성한다. Score 및 context conditioning, CFG, proxy 기반 후보 선별을 구별한다. |
| Genetic-guided GFlowNets | G2 확장 또는 부록 | 실제 reward calls를 사용하는 설정을 표시한다. |
| Wind-farm diffusion | 마지막 응용 비교 | Conditional generation → constraint repair → evaluation → data update. Offline-to-online 확장이다. |
| Guided discrete traffic-network design | G4 응용 | 이산 구조를 생성하고 평가·데이터 갱신이 있는 부분을 표시한다. |
| DiBO | Ch 4 복습 및 마지막 비교 | Acquisition을 이용하는 생성 기반 온라인 탐색. Strict offline 목표와 비교한다. |
| NOS/LaMBO-2 | G4 원리와 응용 | Hidden-state guidance와 BO 및 wet-lab feedback을 구별한다. |

GTG의 synthetic improvement trajectory, diffusion의 denoising sequence, 실제 시스템의 상태·행동 trajectory는 서로 다른 대상이다. GTG에 “trajectory”가 있다는 이유로 물리적 시간의 정책 학습 또는 RL과 같다고 설명하지 않는다. [GTG 원논문](https://arxiv.org/abs/2407.01624)

논문 관계 지도는 직접 사용하는 메커니즘 또는 확장 관계를 실선으로, 비교 및 상호보완 관계를 점선으로 표시한다. 같은 연구실 또는 같은 연도라는 정보는 방법론적 관계를 대신하지 않는다. Offline, 추가 시스템 지식, online evaluation, offline-to-online이라는 설정 표시도 붙인다.

**12. 두 차시의 권장 시간 배분**

| 차시 | 시간 | 내용 |
|---|---:|---|
| 6A | 8분 | Ch 1–5 연결, 공통 문제, 성능 모델과 후보 생성 모델, 네 개입 위치 |
| 6A | 25분 | 분포의 대상, KL 소개, VAE의 학습·생성, DDPM의 학습·생성 |
| 6A | 12분 | G1: 기존 latent BO 복습, decoder 구조와 성능 모델의 역할 |
| 6A | 25분 | G2: CbAS 계산·그림·실험, GFlowNet 비교, BootGen 연결 |
| 6A | 5분 | G1과 G2 비교 및 이해 확인 |
| 6B | 5분 | 복습과 이번 차시의 질문 |
| 6B | 25분 | G3: MINs consistency → DDOM → GTG 비교 |
| 6B | 8분 | KL 정규화 분포 최적화와 적용 범위 |
| 6B | 22분 | G4: guidance 구별, RGD, discrete guidance 사례 |
| 6B | 15분 | 설정이 다른 응용 비교, 방법 선택 과제, Ch 7 연결 |

각 차시의 합은 75분이다. 이는 집필을 위한 배분안이며, 실제 rehearsal에서 위젯 단계와 질문 시간을 포함해 조정해야 한다. 논문 두 편을 배치한다는 원칙이 두 편의 모든 수식과 실험을 같은 깊이로 설명해야 한다는 뜻은 아니다.

기초 모델, CbAS, G3의 메커니즘 차이와 G4의 surrogate 개입은 본문에 남긴다. 긴 ELBO·DDPM·SDE 유도, GFlowNet의 학습 정리와 상세 balance loss, 많은 benchmark 수치는 부록으로 둔다.

**13. 그림과 실습 설계**

주요 비교에서는 같은 offline dataset과 같은 설계 공간을 재사용한다. 예를 들어 두 개의 좋은 설계 영역이 떨어져 있는 2차원 문제를 사용할 수 있다. 두 모드의 평균이 낮은 성능 또는 invalid design이 되는 이유를 그림으로 보여준다. 유효성 제약과 실제 objective 중 알고리즘이 아는 정보를 먼저 명시한다.

- G1: 설계 공간과 latent coordinates를 나란히 그려 탐색 경로를 비교한다.
- G2: 샘플과 가중치, 재학습 후 확률 질량의 이동을 그린다.
- G3: 같은 목표 성능 조건이 서로 다른 여러 후보로 이어지는 모습을 그린다.
- G4: denoising과 performance guidance가 생성 경로를 함께 바꾸는 모습을 그린다.

한 위젯의 조작은 한 가지 개념을 검증하도록 한다. 모든 평가 지표를 동시에 표시하기보다 성능, 유효성, 다양성, 예측 오류 중 해당 그림의 메시지에 필요한 것을 선택한다.

Teacher view의 실제 objective는 알고리즘의 학습·선택·튜닝에 사용하지 않는다. 그림을 보고 새 후보의 true score를 아는 교수자의 정보와 알고리즘의 정보는 구별한다.

Temperature thread는 계속 유지한다. 다만 이산 설계나 heater placement로 문제를 바꾼 경우에는 기본 one-step heater와 무엇이 달라졌는지 먼저 명시한다. 상세 숫자는 노트로 보내고, 선택과 분포 변화를 그림으로 설명한다.

마지막 과제는 다음 질문이다.

> 주어진 문제에서 탐색 좌표, 후보분포, 성능 조건, 샘플링 과정 중 무엇을 바꿀 것인가? 그 선택은 어떤 데이터와 가정에 의존하는가?

학생은 높은 predicted score만으로 판단하지 않고, 데이터 coverage, 성능 모델의 신뢰성, 알려진 제약, 필요 후보 수와 평가 가능성을 근거로 답해야 한다.

**14. 현재 초안에서 우선 수정할 부분**

| 우선순위 | 대상 | 변경 방향 |
|---|---|---|
| P0 | KL 및 분포의 대상 | 이미 배운 것으로 가정하지 않고 기본 정의와 대상 구별을 추가한다. |
| P0 | “generator buys validity”, “support is the valid set” | 일반적인 generator의 plausibility와 특정 decoder 또는 명시적 제약의 보장을 구별한다. |
| P0 | “every method approximates one tilted distribution” | 일부 방법을 비교하는 유용한 관점으로 범위를 제한한다. |
| P0 | G3의 “no search” | MINs의 목표 성능·latent 최적화와 forward consistency를 유지한다. |
| P1 | Ch 3의 재가중과 Ch 4의 latent BO·CMA-ES | 새로 설명하는 대신 기존 개념을 명시적으로 재사용한다. |
| P1 | 논문 관계 지도 | 직접 확장, 공통 메커니즘, 비교 관계 및 문제 설정을 구별한다. DDOM과 RGD의 연결을 표시한다. |
| P1 | 신뢰성 관련 결론 | 보수적 score 또는 작은 guidance knob가 일반적인 안전성을 보장한다는 표현을 없앤다. |
| P1 | 기술적 교차 검증 | 같은 논문의 차원·조건·수치가 장마다 달라지지 않도록 확인한다. 예: Ch 4와 Ch 6의 latent dimension 설명. |
| P2 | VAE·DDPM·guidance의 배치 | 필요한 원리를 본문에 두고 상세 유도와 반복 배경 설명을 줄인다. |
| P2 | Ch 7 연결 | 시간이나 sequence가 처음 등장하는 것처럼 설명하지 않고, 행동이 미래 상태와 보상을 바꾸는 문제의 최적화로 연결한다. |

Ch 5의 α 다이얼이 training penalty와 최종 optimizer를 함께 바꾸는 비교는 효과를 분리해 설명할 필요가 있다. 이 문제는 Ch 6의 비교 실습에서도 재발하지 않도록 한다. 모델을 비교할 때 optimizer를 고정하고, optimizer를 비교할 때 모델과 초기점 및 예산을 고정한다.

Ch 5의 “predictions became trustworthy”와 hPINN의 “physics everywhere”처럼 보장 범위를 넓히는 문장은 Ch 6를 쓰기 전에 조정하는 것이 좋다. 생성 모델이 남은 한계를 일반적으로 해결한다는 연결을 만들지 않는다.

**15. Chapter 7로 넘길 내용**

Ch 3에서 이미 시간 추론과 sequential influence diagram을 다루고, Ch 4에서도 실험의 순차 선택을 다룬다. 따라서 “지금까지 모든 문제는 단일 결정이었고 이제 처음 시간이 등장한다”는 표현은 전체 원고와 맞지 않는다.

다음 연결이 적절하다.

> 앞선 장에서는 정적 설계 선택, 정보를 얻는 실험, 시간에 따른 추론을 배웠다. 이제 현재 행동이 다음 상태와 미래 보상을 바꾸는 연속 의사결정을 본격적으로 최적화한다.

Diffusion Policy는 여러 가능한 action sequences를 생성하는 짧은 예고로 남길 수 있다. Demonstration learning과 reward-based RL을 구별한다. 생성기와 성능 모델의 관계는 이후 policy와 value의 관계를 이해하는 데 도움이 되는 비교이지만, 두 관계를 같은 알고리즘이나 목적함수로 동일시하지 않는다.

**16. 검토 에이전트에게 요청할 사항**

다음 항목을 실제 Ch 1–6 원고와 대조해 평가해 주기 바란다.

1. 이 계획이 Ch 1–5에서 실제로 배운 개념을 적절하게 재사용하는가? 아직 배우지 않은 선수 개념을 가정하는 곳은 없는가?
2. Ch 6의 중심 질문이 전체 수업의 의사결정 흐름을 발전시키는가? 생성 모델 survey로 흐를 위험은 없는가?
3. G1–G4가 유용한 개입 위치인가? 서로 겹치는 논문을 잘못 배타적으로 분류하지 않는가?
4. 대표 논문 각각이 맡는 교육적 역할이 분명한가? 더 적합한 논문이 있다면 유명도뿐 아니라 메커니즘, 설정, 선수 개념을 기준으로 이유를 제시해 주기 바란다.
5. CbAS를 중심 계산으로 두는 것이 Ch 3의 sampling 및 weighting과 잘 연결되는가?
6. 생성 다양성, 성능 예측 불확실성, feasibility, 모델의 신뢰성을 충분히 구별하는가?
7. KL 정규화 결과의 수학적 조건과 실제 논문·sampler의 적용 범위가 정확한가?
8. MINs, DDOM, GTG, RGD의 설명이 실제 알고리즘의 핵심 차이를 보존하는가?
9. 온라인 평가가 있는 응용과 strict offline 방법의 경계가 명확한가?
10. 75분 두 차시에서 그림·위젯·질문 시간을 포함해 실행 가능한가? 줄일 부분과 반드시 남길 부분을 구체적으로 제안해 주기 바란다.

검토 결과는 **유지할 부분 / 반드시 고칠 부분 / 선택적으로 줄이거나 확장할 부분**으로 구별하고, 수정 대상 원고의 위치와 논문 근거를 함께 제시해 주기 바란다. 이 문서는 계획이므로, 아직 적용하지 않은 변경을 완료된 구현으로 평가하지 않도록 한다.

---

**17. 검토 의견 — Claude, 2026-10-13**

검토 대상은 이 계획과 현재 원고(Ch 6 77장, 2026-10-12 작성)다. 아래의 위치는 현재 원고의 슬라이드 번호와 Markdown 줄 번호이고, 사실 확인은 원고 검색과 원 논문 대조로, α 다이얼 문제는 계산으로 확인했다.

**17.1 총평**

계획의 방향에 동의한다. 특히 이전 장 개념의 명시적 재사용, 분포의 대상과 KL의 정의, 보장 범위를 넓히는 문장의 정리는 현재 원고의 실제 약점을 정확하게 짚었다. G1–G4, CbAS 중심 계산, KL tilt는 이미 원고에 들어 있으므로, 이번 개편은 재구성이라기보다 **경계와 연결을 정밀하게 다듬는 작업**이다. 이견은 세 곳이다. 장 제목 변경, 분포 대상 표의 제시 방식, 2-D 공통 문제의 범위(17.5).

**17.2 원고와 대조해 확인한 사실**

| 계획의 주장 | 확인 결과 | 근거 |
|---|---|---|
| Ch 1–5 본문에 KL 정의가 없다 | 사실 | ch01–ch05 전체에 KL, Kullback, divergence 정의가 없다. Ch 6 슬라이드 12(L173)가 처음 사용한다. |
| Ch 3에 likelihood weighting과 rare-evidence 실패가 있다 | 사실 | ch03 L751 "Likelihood weighting in one sentence", L778 "Rare causes — why weighting can still struggle" |
| Ch 4에 CMA-ES, latent BO, DiBO가 있다 | 사실 | ch04 L759 "Method 3 — CMA-ES", L1348 latent-space BO, L1392 DiBO |
| Ch 4와 Ch 6의 latent 차원 설명이 다르다 | 사실이며 Ch 6 쪽 오류 | Ch 4 L1356은 \(\mathbf z\in\mathbb R^{196}\)(ZINC)로 쓴다. Ch 6 슬라이드 24 노트(L387)의 "56-dimensional"은 196으로 고쳐야 한다. |
| "지금까지 모든 문제는 단일 결정"이라는 표현이 원고와 맞지 않는다 | 사실 | Ch 3 L1505 "Sequential decisions", L1519 "From an influence diagram to an MDP". Ch 6 슬라이드 60(L976)이 이 표현을 쓴다. |
| Ch 5 α 다이얼이 training penalty와 optimizer를 함께 바꾼다 | 사실 | `deck/widgets/conservative-coms.js`의 `search(a)`는 α = 0에서 plain ascent를, α > 0에서 trust region을 쓴다. 아래 2×2 계산 참조. |
| Ch 5에 보장 범위를 넓히는 문장이 있다 | 사실 | ch05 L969 "This lecture made predictions trustworthy", L904 "it must satisfy the physics everywhere" |
| NEMO 본문에 후보를 고르는 결정 규칙이 없다 | 사실 | 슬라이드 45(L767)는 \(p_{\text{NML}}\)만 보인다. \(x\) 갱신 규칙 \(x_{t+1}=x_t+\alpha_x\nabla_x\mathbb E_{p_{\text{NML}}}[g(y)]\)는 부록 Backup 2에만 있다. |
| GTG는 score와 context로 조건화한다 | 사실(원 논문으로 확인) | 학습 때는 trajectory score로만 조건화한다. 샘플링 때는 CFG(\(\omega=1.2\))에 더해 데이터에서 뽑은 context subtrajectory를 inpainting하고, proxy는 top-Q 선택에만 쓴다. 현재 슬라이드 46(L740)에는 context inpainting이 빠져 있다. |
| Ch 6에 보장 범위를 넓히는 문장이 있다 | 사실, 4곳 | 슬라이드 12 제목 "support is the valid set"(L173), 48 "No search and no surrogate gradient"(L782), 57 "every one of them is an approximation of one tilted distribution"(L921), 62 "A generator buys validity"(L988) |

Ch 5 toy(seed 17, 450 steps, 최적화 시작점은 데이터의 최고 설계)에서 모델과 optimizer를 분리해 다시 계산했다.

| | plain ascent | COMs trust region (Eq. 4) |
|---|---|---|
| α = 0 (보통의 회귀) | \(\hat x=10.00\), 실제값 −0.14 | \(\hat x=10.00\), 실제값 −0.14 (t = 50에 2.66을 지나감) |
| α = 0.3 (conservative) | \(\hat x=10.00\), 실제값 −0.14 (t = 50에 2.59) | \(\hat x=6.32\), 실제값 2.62 |

이 toy에서는 conservative training과 trust region 중 **어느 하나만으로는 실패하고, 둘을 함께 써야 성공한다**. 지금의 다이얼은 α = 0과 α > 0 사이에서 optimizer까지 바꾸므로, α의 효과를 과장해서 보여 준다. 다이얼은 모든 α에서 trust region을 쓰도록 바꾸고(α = 0이어도 결론은 같다), 이 2×2 표는 optimiser 모드나 발표자 노트에 넣는 것이 정확하다. 결론 문장도 "conservatism의 효과"가 아니라 "conservative training과 신중한 탐색의 결합"으로 바꾼다.

**17.3 유지할 부분**

1. **§4의 중심 질문과 두 모델의 비교.** 현재 슬라이드 9 "A generator is not an optimiser"와 같은 내용이다. 이 비교를 Act 1의 첫 그림으로 끌어올리면 좋다.
2. **§8의 G1–G4를 개입 위치로 정의한 것.** 상호배타적인 분류가 아니라는 설명은 슬라이드 22와 일치한다.
3. **§9의 CbAS 중심 계산.** 이전 장과의 연결이 실제로 강하다.
   - Ch 3 "Rare causes"(L778)의 실패는 CbAS의 one-shot 실패와 같은 구조다.
   - Ch 4의 CMA-ES(L759)는 샘플 가중치로 Gaussian을 다시 맞추는 연산이다. 현재 `cbas-ladder` 위젯의 \(q\)도 Gaussian이므로, CbAS를 "Lecture 4의 분포 이동에 prior ratio를 더한 것"으로 소개할 수 있다.
   - CbAS 논문 Fig. 2b(슬라이드 33)에서 prior anchor가 없는 같은 계열의 CEM-PI가 oracle 오류 쪽으로 drift한다. 이 그림이 그 차이를 그대로 보여 준다.
   - 따라서 슬라이드 30–33에 연결 문장을 하나씩 넣기를 권한다.
4. **§10 KL tilt의 조건과 적용 범위 제한.** \(q\ll p_{\text{gen}}\), \(Z_\beta<\infty\), 그리고 CbAS의 KL(목표 → 생성기 fitting)과 tilt의 KL(후보분포 → 기준분포 regularization)의 방향 차이는 모두 정확하다. "KL은 pointwise 이동 한도가 아니며, tail이 넓으면 먼 곳으로 질량이 옮겨간다"는 문장은 현재 `kl-tilt` 위젯이 그대로 보여 준다(β ≈ 3에서 질량이 x = 10으로 이동). 그 위젯의 결론 문장으로 쓰면 된다.
5. **§8의 논문 설명.** MINs의 \((y,z)\) inference와 forward consistency, DDOM의 dataset-max 조건, RGD의 \(\omega\) 조절과 proxy refinement, NOS와 LaMBO-2의 구별은 원 논문과 일치한다.
6. **§5, §13의 설정 구분.** strict offline, 추가 지식, online, offline-to-online을 나누고 teacher-view oracle을 분리하는 원칙이다. 현재 위젯은 모두 "true f — never queried"로 이 둘을 이미 분리하므로 일관된다.
7. **§15의 Ch 7 연결 문장.**

**17.4 반드시 고칠 부분**

| # | 위치 | 고칠 내용 |
|---|---|---|
| 1 | Ch 6 슬라이드 12 앞 또는 안 | KL 정의를 신설한다. 정의, 방향의 비대칭(어느 분포가 0인 곳이 문제가 되는지), support 조건을 그림 하나로 보인다. 처음 쓰는 곳이 슬라이드 12의 \(D_{\mathrm{KL}}(p_{\text{data}}\|p_\theta)\) = MLE이므로 거기서 정의한다. |
| 2 | Ch 6 슬라이드 12, 48, 57, 62 | 과장 문구 4곳을 고친다. 12 → "a distribution concentrated on plausible designs". 48 → MINs는 \((y,z)\)를 최적화하고 DDOM은 dataset 최고 label로 조건화하며, 둘 다 surrogate gradient로 \(x\)를 미는 방식은 아니라고 쓴다. 57 → "several of them can be read as approximations of one tilted distribution". 62 → "A generator buys plausibility, not evidence". |
| 3 | Ch 6 front matter, 슬라이드 60·61 | "Don't search the design — produce it"과 "search against produce"를 교체한다. G1은 탐색이고, MINs와 RGD도 최적화를 포함한다. |
| 4 | Ch 6 슬라이드 60 (L976) | "every problem so far has been a single decision"을 §15의 문장으로 교체한다. |
| 5 | Ch 6 슬라이드 24 노트 (L387) | "56-dimensional"을 196으로 고친다(Ch 4 L1356과 일치). |
| 6 | Ch 6 슬라이드 46 | GTG의 context inpainting을 추가하고, proxy는 최종 후보 선택에만 쓴다는 점은 그대로 둔다. |
| 7 | Ch 6 전반, `kl-tilt` 위젯 | "score"의 두 의미를 분리한다. 성능 쪽은 "objective estimate \(\hat f\)" 또는 "proxy"로, \(\nabla_x\log p\)는 "density score"로 부른다. 위젯 라벨 "score = …"도 바꾼다. |
| 8 | Ch 5 L969, L904 | L969 "made predictions trustworthy" → "gave predictions grounds for trust, under stated assumptions". L904 "physics everywhere" → hPINN은 학습점에서 PDE를 제약으로 강제하고(penalty, augmented Lagrangian) 데이터에만 맡기지 않는다는 표현으로 줄인다. |
| 9 | Ch 5 `conservative-coms` 다이얼 | 17.2의 2×2 결과대로 optimizer를 고정하고, 결론 문장을 고친다. |
| 10 | Ch 5 슬라이드 45 (NEMO) | 결정 규칙 한 줄을 본문에 넣는다. "\(x\)는 \(p_{\text{NML}}\) 아래의 기대 성능을 gradient로 올린다. 데이터에서 멀면 분포가 넓어져 기대값이 라벨 범위의 가운데로 끌려가므로 과도한 외삽이 약해진다." |

**17.5 계획과 다르게 판단하는 부분**

1. **장 제목 변경("Generating Better Designs from Offline Data")에는 반대한다.**
   - 원 강의 PDF 제목, Ch 5 "Surrogate-Based"와의 짝, 사이트 색인, `_CHAIN.md`와 front matter의 연결이 모두 현재 제목에 기대고 있다.
   - 탐색과 생성의 이분법을 없앤다는 계획의 목적은 부제와 결론 문장만 바꿔도 달성된다.
   - 제안하는 부제: "Learn where good designs live — then search, refit, condition or steer".
2. **§6의 분포 대상 표(5행)를 Act 2 앞에 한꺼번에 두는 것은 권하지 않는다.**
   - 내용은 맞지만, 추상적인 표를 먼저 보이면 6A의 진입이 무거워진다.
   - 각 분포를 처음 쓰는 슬라이드에 꼬리표로 붙이는 편이 낫다. 예: 슬라이드 26에서 "\(p(x)\): 무엇을 제안하는가 / \(P(S\mid x)\): 성능 모델의 예측".
   - 표 전체는 Session 2 시작(슬라이드 40)의 복습으로 둔다.
   - 다만 VAE의 latent prior와 Ch 2의 parameter prior를 구별하는 한 문장은 VAE 슬라이드(13)에 반드시 넣는다.
3. **§13의 2-D 공통 문제에는 부분적으로 동의한다.**
   - 현재 위젯 세 개(`cbas-ladder`, `condition-shift`, `kl-tilt`)는 Lecture 5와 같은 1-D 목적함수를 쓴다. 학생은 같은 함수 위에서 Ch 5의 실패가 생성 방식에서 어떻게 다시 나타나는지 보게 되는데, 이 연속성은 유지할 가치가 있다.
   - 새 2-D 문제는 1-D로는 보일 수 없는 한 가지, 즉 **유효 집합이 가는 곡선인 설계공간**에만 쓰기를 권한다.
   - 이 그림 하나로 두 가지를 보일 수 있다. G1: 곡선을 따라가는 1-D latent 좌표에서 탐색하면 유효성이 유지되고, \(x\)에서 직접 ascent하면 곡선을 벗어난다. G4: guidance 강도가 크면 denoising 경로가 곡선을 벗어나 proxy 오류 쪽으로 간다.
   - G4는 현재 그림이 없는 유일한 갈래이므로 이 위젯의 우선순위가 가장 높다. G3의 다봉성은 `forward-inverse` 위젯과 DDOM 원 그림이 이미 다룬다.
4. **DiBO 배치는 계획에 동의한다.** 현재 논문 맵은 DiBO를 G2 열에 두었다. 이를 빼고 Ch 4 복습과 KL tilt의 온라인 예시로 옮긴다.

**17.6 줄이거나 확장할 부분, 시간 배분**

현재 원고는 6A 38장, 6B 24장이다. 계획의 시간표(6A에서 기초 25분, G2 25분)를 지키려면 6A를 줄이고 6B로 옮겨야 한다.

- **줄일 것**
  - Guidance 슬라이드(18)를 나눠서 옮긴다. CFG는 DDOM(45)에서, classifier guidance는 G4 첫 장(51)에서 처음 필요해진다. RGD가 둘을 결합하므로 이 순서가 자연스럽다(§7과 같은 판단).
  - "A learned density is blind"(19)는 Ch 5와 잇는 한 문장만 남기고 부록 Backup 4로 보낸다.
  - G2의 A/B/C 슬라이드(26)와 Temperature thread(27)는 prior × success라는 같은 메시지를 두 번 보인다. A/B/C를 빼고 importance-ratio 위젯(31)이 세 설계를 스스로 소개하게 하면 3–4분이 남는다.
  - GFlowNet(34)은 한 장으로 유지하고, Genetic-guided GFlowNets는 맵과 부록으로만 남긴다.
- **확장할 것:** KL 정의(6A, +1장), G4 그림(6B, 위젯 1개), Session 2 시작의 분포 대상 복습.
- **예상 결과:** 6A 약 34장, 6B 약 27장.
- **논문 맵**
  - §11의 실선/점선 구분과 설정 배지(offline, knowledge, online, offline-to-online)를 추가한다.
  - DDOM → RGD 선("proxy가 CFG 강도만 조절")을 추가한다.
  - Ch 5 맵의 COMs → NEMO "same group, same year" 선은 §11의 원칙(같은 연구실·연도는 방법론적 관계를 대신하지 않는다)에 어긋난다. "같은 실패, 다른 수단(penalty 대 uncertainty)"으로 바꾼다(`mbo-papers.js` L115와 L72의 문구).
- **Temperature thread:** §13대로, 기본 one-step heater에서 무엇이 바뀌었는지(명령의 크기 대신 어느 히터를 켤지 고르는 이산 설계)를 위젯 캡션(L431)에 한 줄로 밝힌다. 숫자는 이미 노트로 옮겨져 있다.

**17.7 §16의 질문별 답**

1. **선수 개념.** 대부분 Ch 1–5에서 배운 것을 쓴다. 배우지 않은 것은 KL(신설 필요), reparameterization(부록으로 충분), density score \(\nabla\log p\)다. Density score는 본문을 noise prediction으로 설명하면 필요 없다.
2. **중심 질문과 survey 위험.** 중심 질문은 의사결정 흐름을 발전시킨다. Survey 위험은 논문 맵의 19편에 있다. 본문에서 깊게 다루는 논문은 7편(VAE, DDPM, latent search, CbAS, MINs, DDOM, RGD)이고 나머지는 맵이나 한 장으로 처리한다. DiBO, Genetic-guided GFlowNets, LCOMs를 맵에서 낮추면 시각적 부담도 준다.
3. **G1–G4의 유용성.** 유용하다. 갈래가 겹치는 논문은 BootGen(G2+G3), RGD(G3 기반에 G4 요소), GTG(G3, proxy는 선택만), 풍력발전단지(G3 + online 평가)이며, 원고도 이를 반영한다.
4. **대표 논문의 역할.** 분명하다. 대안으로 G1의 두 번째 논문에 Tripp, Daxberger & Hernández-Lobato의 weighted retraining(NeurIPS 2020)을 검토할 수 있다. 탐색하면서 latent space를 다시 학습하므로 G1과 G2를 잇는다. 다만 JT-VAE가 "유효성은 decoder 구조의 문제"라는 점을 가장 분명히 보이므로 현재 선택을 유지하는 편이 낫다. Weighted retraining은 Ch 4에서 이미 한 줄 언급된다.
5. **CbAS와 Ch 3의 연결.** 잘 맞는다(17.3-3). Ch 3는 고정된 모형에서 evidence를 처리하고, CbAS는 proposal과 성공 조건을 바꾼다는 계획의 구별도 정확하다.
6. **다양성, 불확실성, feasibility, 신뢰성의 구별.** 계획은 충분히 구별한다. 수정할 것은 원고 쪽이다(17.4의 2와 7).
7. **KL 결과의 조건과 범위.** 정확하다. \(\beta\to\infty\) 극한이 \(p_{\text{gen}}\)의 support 위에서의 arg-max이므로 Ch 5의 탐색과 같아진다는 점을 한 줄 덧붙이면 좋다.
8. **MINs, DDOM, GTG, RGD의 핵심 차이.** MINs, DDOM, RGD는 정확하다. GTG는 context inpainting을 추가해야 원 논문과 일치한다.
9. **온라인과 strict offline의 경계.** 계획은 명확하다. 원고에서는 풍력발전단지(47)와 NOS/LaMBO-2(53)에 이미 표시되어 있으므로, 논문 맵에 설정 배지만 추가하면 된다.
10. **75분 두 차시의 실행 가능성.** 17.6의 조정 뒤에는 가능하다.
    - 반드시 남길 것: G1의 본문 한 장과 비교 한 장, CbAS 유도와 사다리 위젯, MINs 식과 "Invalid" 그림, DDOM 한 장, KL tilt의 유도와 위젯, G4의 원리와 RGD.
    - 줄일 것: guidance 이동, blind-spot 부록화, A/B/C 제거, GFlowNet 축약.

**17.8 권장 작업 순서**

1. P0 문구와 사실 수정(Ch 6 일곱 곳, Ch 5 세 곳). 구조를 바꾸지 않으므로 바로 할 수 있다.
2. KL 슬라이드 신설, guidance 슬라이드 분할 이동, 6A 축약.
3. 논문 맵: 실선/점선, 설정 배지, DiBO 이동, Ch 5 맵의 lineage 선.
4. Ch 5 α 다이얼을 trust region으로 고정하고 2×2 표를 노트에 넣는다.
5. 2-D thin-manifold 위젯(G1·G4). 비용이 가장 크므로 마지막에 한다.

---

**18. Codex의 재검토 의견 — 2026-10-12**

검토 대상은 §17의 Claude 평가, 현재 Ch 5·6 원고와 관련 위젯 코드다. 기존 계획과 §17의 평가는 그대로 보존하고 이 의견을 추가한다. 아래의 결정은 계획에 대한 재검토이며, 강의 원고나 위젯에 아직 적용한 변경은 아니다.

**18.1 총평**

Claude의 주요 판단에 동의한다. 현재 G1–G4, CbAS 중심 설명, KL 분포 최적화 관점은 이미 원고에 있다. 따라서 다음 집필은 네 갈래를 다시 만드는 작업보다, 앞선 장의 개념을 연결하고 잘못 넓어진 보장 표현을 고치며 차시별 부담을 조정하는 작업이어야 한다.

제목 유지, 분포 대상의 단계적 소개, 기존 1-D 예제 보존이라는 세 가지 이견도 대부분 채택한다. 이는 원래 제안의 교육 목표를 더 적은 변경으로 구현하는 방법이다. 다만 §17의 일부 대체 문장은 같은 종류의 과장을 다시 만들 수 있어 수정이 필요하다.

핵심 결정은 다음과 같다.

| 항목 | 판단 | 다음 집필에 반영할 내용 |
|---|---|---|
| 공식 장 제목 유지 | 수용 | Ch 5와 짝을 이루는 현재 제목을 유지하고, 생성과 탐색의 이분법을 만드는 부제·결론을 바꾼다. |
| 분포 대상 표를 처음부터 모두 제시하지 않음 | 수용 | 각 분포를 처음 쓰는 곳에 대상 표시를 붙인다. 전체 표는 복습이나 부록에 둔다. |
| Ch 5와 연결되는 1-D 예제 보존 | 수용 | 같은 objective에서 실패 양상을 비교한다. 데이터와 surrogate가 달라지는 경우는 별도로 표시한다. |
| 2-D 그림을 G1·G4의 공간 구조 설명에 한정 | 조건부 수용 | 최종 clean design의 유효성과 noisy 중간 상태를 구별한다. |
| Guidance 설명을 G3·G4로 이동 | 수용 | CFG는 DDOM에서, 별도 성능 모델 guidance는 G4에서 설명하고 RGD에서 관계를 비교한다. |
| COMs α 다이얼의 optimizer 고정 | 수용 및 계산 확인 | 다이얼에서는 모든 α에 같은 optimizer를 적용한다. Naive baseline은 별도로 유지한다. |
| NEMO의 결정 규칙을 본문에 추가 | 수용 | CNML 분포에서 기대 성능을 계산해 최적화한다는 연결을 보여준다. |
| 넓은 NEMO 분포의 평균은 항상 가운데로 간다는 설명 | 수정 필요 | 한정된 label 범위의 예제 직관으로만 설명한다. 분산 증가의 일반적인 효과로 주장하지 않는다. |
| β가 무한대로 가면 Ch 5의 탐색과 같아진다는 설명 | 수정 필요 | 적절한 조건 아래 최대 score 영역으로 질량이 집중하는 분포의 극한과 실제 탐색 절차를 구별한다. |

**18.2 COMs 2×2 계산은 재현되었다**

현재 위젯의 수치 계산 부분을 추출하여 실제 engine의 난수 생성기를 사용하고, seed 17, 같은 시작점, 450 steps로 다시 계산했다. UI나 위젯 파일은 수정하지 않았다.

| Training penalty | Optimizer | 최종 x | 최종 실제 objective |
|---|---|---:|---:|
| α = 0 | Plain ascent | 10.000000 | −0.136338 |
| α = 0 | COMs lookahead/trust-region 방식 | 10.000000 | −0.136338 |
| α = 0.3 | Plain ascent | 10.000000 | −0.136338 |
| α = 0.3 | COMs lookahead/trust-region 방식 | 6.315762 | 2.624867 |

§17.2의 계산과 일치한다. 따라서 α = 0에서는 plain ascent, α > 0에서는 trust-region 방식으로 바뀌는 현재 다이얼은 training penalty의 효과와 optimizer의 효과를 동시에 보여준다. 이 두 효과를 분리하자는 수정은 타당하다.

다이얼의 optimizer를 고정하되, ordinary training + plain ascent라는 naive baseline을 별도 trace 또는 optimizer 비교 모드에 남기는 것이 좋다. 학생은 “penalty를 바꾸면 무엇이 달라지는가”와 “같은 모델을 다른 방식으로 탐색하면 무엇이 달라지는가”를 각각 볼 수 있어야 한다.

이 결과는 해당 toy, 초기점, step size, 탐색 예산에 대한 결과다. COMs 또는 다른 문제에서 항상 두 장치를 함께 써야 성공한다는 일반적인 결론으로 확장하지 않는다. 중간 단계의 true objective 최고점을 보고 종료 시점을 고르는 것도 strict offline 알고리즘의 허용 정보는 아니다.

수치는 교수자 노트에 두고, 발표 화면에서는 두 학습 방식과 두 탐색 방식의 경로를 비교하는 그림을 사용한다. 현재 위젯은 ridge 기반의 강의용 surrogate와 변형된 attacker를 사용하므로 COMs의 메커니즘을 설명하는 toy이며, 원 논문의 전체 실험을 재현한 구현으로 표시하지 않는다.

**18.3 교육적 이견에 대한 결정**

공식 제목은 현재의 **Data-Driven Design Optimization — Generative-Based**를 유지한다. Ch 5의 Surrogate-Based와 짝을 이루는 형식이 전체 강의 지도에서 유용하다. 이는 제목 변경이 기술적으로 불가능해서가 아니라 강의의 연속성을 위한 선택이다. 부제는 다음처럼 바꿀 수 있다.

> Learn where plausible designs live, then search, refit, condition or guide.

“Good designs”보다 “plausible designs”가 기본 생성 모델의 역할을 정확하게 표현한다. 성능 개선을 위한 신호가 어떻게 들어가는지는 이후 네 갈래에서 설명한다.

분포 대상 표는 계획을 검토하는 문서에는 유지한다. 실제 발표에서는 parameter belief, latent prior, design distribution을 처음부터 모두 외우게 하지 않는다. VAE에서는 latent prior와 parameter prior를 구별하고, CbAS에서는 기본 설계분포와 success model을 구별하며, G3에서는 원하는 score에 대한 조건부 설계분포를 설명한다. Session 2 시작에 이를 하나의 표로 다시 묶는 구성이 적절하다.

1-D 예제는 유지한다. 다만 “같은 함수”와 “같은 실험 설정”은 구별한다. 현재 COMs 예제와 CbAS 예제는 같은 objective 형태를 사용하지만 데이터 수, 데이터 생성 방식과 surrogate fit은 다르다. Ch 5와 Ch 6의 결과값을 직접 비교해 알고리즘의 우열을 주장하려면 이 조건도 맞춰야 한다.

2-D 그림은 공간의 구조를 보여주는 보완 예제로 한정한다. 기존의 forward-inverse와 DDOM 그림은 one-to-many와 다봉성을 이미 설명하므로, 새로운 그림은 G1의 좌표와 G4의 생성 경로를 설명하는 데 집중한다.

DiBO는 Ch 4 복습과 KL 관점의 온라인 사례로 이동하는 편이 본문 구성상 좋다. 다만 온라인 설정이라는 이유로 G2의 메커니즘과 무관해지는 것은 아니다. Generator를 fine-tune하여 후보분포를 바꾼다는 연결은 남길 수 있다. 개입 위치와 실험 설정은 논문 지도의 서로 다른 정보다.

**18.4 대체 문장에서 추가로 바로잡아야 할 내용**

MINs를 “surrogate gradient를 사용하지 않는다”고 설명하면 안 된다. MINs는 forward model을 포함한 목적함수를 y와 z에 대해 최적화하므로, 그 모델의 gradient가 inverse model을 통해 후보 변경에 영향을 준다. 직접 x를 최적화하는 방식과 최적화 변수 및 제약이 다를 뿐이다.

권장 문장은 다음과 같다.

> MINs는 forward–inverse consistency와 latent 제약 아래에서 y와 z를 최적화한다. DDOM은 학습한 성능 조건을 이용해 설계를 생성한다. 두 방법의 inference는 서로 다르다.

이는 §17.4-2의 취지를 유지하면서 gradient 사용에 관한 잘못된 인상을 피한다. [MINs 원논문 §3.2](https://proceedings.neurips.cc/paper/2020/file/373e4c5d8edfa8b74fd4b6791d0cf6dc-Paper.pdf)

NEMO에는 결정 규칙을 추가하되, “분포가 넓어지면 평균이 라벨 범위 가운데로 간다”를 일반적인 원리로 쓰지 않는다. 분산이 달라도 같은 평균을 갖는 분포를 얼마든지 만들 수 있다. 가상 label별 fitted likelihood가 유사해져 유한한 label 범위에서 CNML이 거의 균등해지는 예제라면 가운데 값에 가까워질 수 있지만, 넓다는 사실만으로 그런 결과가 나오지는 않는다.

권장 본문은 다음이다.

> 후보마다 CNML 예측분포를 구성하고, 그 분포 아래의 기대 성능을 높이도록 후보를 갱신한다. 따라서 CNML의 형태가 후보 선택을 바꾼다.

여기에 하나의 예제로 기대값과 선택이 어떻게 바뀌는지 보여준다. NEMO를 ensemble의 σ를 대신 계산한 뒤 LCB에 넣는 방법으로 설명하지 않는다. [NEMO 원논문 §4](https://arxiv.org/html/2102.07970)

β → ∞의 극한은 distributional concentration에 대한 설명이다. 유한한 설계 집합에서 prior가 양의 질량을 주는 후보들을 비교하거나, 연속 공간에서 필요한 regularity와 integrability 조건을 갖추면 최대 score 영역으로 질량이 집중한다. 이때도 Ch 5의 실제 optimizer가 같은 해를 찾아낸다는 보장은 아니다. Prior가 허용하는 영역, 사용한 score, 최적해의 존재 및 근사 sampler의 오차를 구별한다.

따라서 §17.7-7의 추가 문장은 다음처럼 제한한다.

> 적절한 조건 아래 β가 커지면 기준분포가 허용하는 최대 score 영역으로 질량이 집중한다. 이는 surrogate maximization과 목표를 연결하지만, 실제 탐색 알고리즘과 같다는 뜻은 아니다.

**18.5 새 2-D G1·G4 그림의 중요한 조건**

G1에서 decoder가 알려진 유효 곡선을 정확히 parameterize하도록 만든 toy라면, latent 좌표에서의 탐색이 그 곡선에 남는 것을 보여줄 수 있다. 다만 그것은 해당 decoder에 유효성을 구조적으로 넣었기 때문이다. Learned decoder가 데이터로부터 곡선을 근사하는 일반적인 경우까지 유효성을 보장한다고 설명하지 않는다.

G4에서는 noisy 중간 상태 x_t가 유효 곡선 밖에 있다는 사실을 실패로 표시하면 안 된다. Diffusion은 설계에 noise를 추가한 상태를 모델링하므로 중간 상태가 clean-data manifold 밖에 있는 것은 자연스럽다.

유효성 비교 대상은 다음 중 하나로 정한다.

- 최종 clean sample x_0
- 명시적으로 계산한 denoised clean estimate

Noisy path를 함께 보여주더라도 “중간 상태가 곡선을 벗어났다”와 “최종 설계가 제약을 위반했다”를 구별한다. 강한 guidance에서 최종 후보의 유효성 또는 실제 성능이 악화되는 모습은 해당 toy의 결과로 제시하고, 강도가 커질 때마다 단조롭게 위험이 증가한다는 일반적인 법칙으로 쓰지 않는다.

이 조건을 지키면 2-D 그림은 표현과 탐색의 효과를 설명하는 데 유용하다. 지키지 않으면 diffusion의 정상적인 중간 상태를 invalid design으로 오해하게 만드는 새로운 문제가 생긴다.

**18.6 Ch 3·4의 연결은 수학적 동일성보다 공통 연산으로 설명한다**

CbAS를 Ch 4의 CMA-ES와 연결하는 제안은 수용한다. 두 방법 모두 후보를 뽑고, 좋은 후보에 더 큰 영향을 주며, 후보분포를 갱신한다.

그러나 “CMA-ES에 prior ratio를 더하면 CbAS가 된다”는 등식으로 제시하지 않는다. CMA-ES의 rank-based selection, covariance 및 step-size adaptation과 CbAS의 success probability, importance correction, generative-model fitting은 구별한다. Gaussian q를 사용하는 현재 강의용 CbAS 위젯은 weighted MLE가 평균·분산 갱신으로 표현되어 그 공통 연산을 시각적으로 설명하기 좋은 사례다.

Ch 3의 likelihood weighting과 연결할 때도 동일한 주의를 유지한다. 관측한 evidence를 다루는 조건부 추론과 원하는 success event를 대상으로 후보를 만드는 설계 최적화는 정보의 의미가 다르다. 원하는 결과를 조건으로 요청한 것만으로 실제 성능에 대한 새 근거가 생기지는 않는다.

**18.7 누락하지 말아야 할 추가 수정**

현재 kl-tilt 위젯에는 “the pessimistic score makes β safe”라는 문장이 남아 있다. §17에서 언급한 score 이름 교체만으로는 이 문제가 해결되지 않는다.

권장 문장은 다음이다.

> 이 예제에서는 μ − 2σ를 사용하면 unsupported region에 배분되는 질량이 줄어든다. 그 효과는 uncertainty model에 의존한다.

Ch 5의 ensemble-alarm은 모델들이 함께 틀릴 수 있음을 이미 보여준다. 따라서 Ch 6의 LCB 예제가 임의의 β를 안전하게 만든다는 일반적인 결론은 그 앞선 설명과 충돌한다.

hPINN의 과장 문구를 고치면서 모든 제약을 같은 penalty로 처리하는 것으로 축약하지도 않는다. 일부 Dirichlet·periodic boundary conditions는 architecture로 정확히 강제하는 반면, PDE residual과 inequality constraints는 penalty 및 augmented-Lagrangian 최적화로 처리한다. 이 차이가 system knowledge의 개입 위치를 설명한다. [hPINN 원논문 §2.3–2.4 및 결론](https://arxiv.org/html/2102.04626)

GTG의 context inpainting 추가는 수용한다. 설명에서는 trajectory score conditioning, sampling 중 context 고정, proxy에 의한 최종 후보 선별을 세 단계로 구별한다. 특정 CFG 값은 알고리즘의 정의가 아니라 실험 설정이므로 교수자 노트에 두면 충분하다. [GTG 원논문 §3.2–3.4](https://arxiv.org/html/2407.01624v1)

현재 P0를 네 문구만 찾아 고치는 작업으로 끝내지 않는다. 같은 주장이 front matter, 비교표, quiz 해설, widget readout에 반복되는지 함께 확인해야 한다. 특히 “validity”, “safe”, “no search”, “same target”의 범위를 일관되게 맞춘다.

**18.8 분량과 검증에 대한 판단**

§17.6의 guidance 이동, blind-spot 설명의 축약, 중복된 prior × success 예시 제거는 채택한다. Temperature thread는 유지하고, importance-ratio 위젯이 세 후보를 처음 사용할 때 자체적으로 설명하도록 만든다. GFlowNet은 비교 한 장에 두고 상세 flow loss는 부록으로 보낸다.

다만 6A 약 34장, 6B 약 27장이라는 예상만으로 75분의 실행 가능성을 확정하지 않는다. 새 KL 설명, CbAS 단계, MINs consistency, guidance 비교에서 학생이 생각하고 답할 시간이 필요하다. 슬라이드 수뿐 아니라 reveal·widget 단계와 질문 시간을 포함해 rehearsal한다.

본문은 네 개입 위치가 먼저 보이도록 하고, 각 갈래에서 한 메커니즘을 끝까지 따라간다. VAE·DDPM은 기반 도구이고 개별 설계 최적화 논문은 그 도구를 어디에 개입시키는지 보여주는 사례다. “깊게 다룰 논문 7편”이라는 목록 자체를 학생의 학습 경로로 제시하지 않는다.

실제 원고 재배치 후에는 reading guide, 장 사이의 handoff, source fidelity map, teaching route map, 제목 순서를 검사하는 테스트를 함께 맞춘다. 현재 paper-selection 테스트는 두 guidance 설명이 CbAS보다 먼저 나오는 순서를 요구하므로, 새로운 교수 순서에 맞는 검사로 바꿔야 한다. 테스트의 이전 제목 순서 때문에 자연스러운 설명 배치를 유지할 필요는 없다.

화면 및 인쇄 배치, 수식 렌더링, 퀴즈, 위젯 lifecycle도 실제 변경 뒤에 검증한다. 이번 재검토에서 수행한 수치 검증은 COMs의 2×2 계산이며, 새 2-D 위젯이나 변경된 강의 전체가 구현·검증되었다는 뜻은 아니다.

**18.9 다음 집필에 적용할 결정**

1. 공식 장 제목은 유지한다. 부제와 결론에서 탐색·생성의 배타적인 대립을 없앤다.
2. KL 정의를 첫 사용 전에 추가하고 분포의 대상은 단계적으로 소개한다.
3. 기존 G1–G4와 CbAS 중심 설명은 유지한다. Guidance를 필요해지는 위치로 이동하고 6A의 반복 설명을 줄인다.
4. MINs의 gradient 사용, NEMO의 결정 규칙, GTG의 context, KL 극한의 적용 조건을 정확하게 표현한다.
5. COMs 다이얼의 optimizer를 고정하고 naive baseline과 2×2 비교를 별도로 남긴다.
6. 기존 1-D 예제를 유지한다. 2-D G1·G4 그림은 최종 clean design의 유효성과 좌표·sampling의 효과만 추가한다.
7. 논문 지도의 관계 유형과 실험 설정을 구별한다. DiBO의 온라인 응용 배치와 생성분포 학습이라는 메커니즘을 동시에 표시할 수 있다.
8. 원고, 퀴즈, 위젯에서 같은 보장 주장이 반복되지 않는지 확인한 뒤 차시별 rehearsal과 렌더링 검증을 수행한다.

이 결정을 반영하면 전체 구성은 유지하면서 Ch 1–5와의 연결, 방법별 차이, 남는 한계가 더 명확해진다. 실제 집필의 주인공은 논문 목록이 아니라 네 개입 위치와 각 선택에 필요한 가정이다.

---

**18. 적용 결과 — 2026-10-13**

17절의 의견에 따라 Ch 5와 Ch 6 원고를 수정했다. 장 제목은 유지하고 부제와 결론 문장만 바꿨다(17.5-1).

| 항목 | 적용 위치 |
|---|---|
| KL 정의와 방향 | Ch 6 슬라이드 12 신설, 위젯 `kl-direction` (데이터 기준 6.43, 모델 기준 0.69) |
| 과장 문구 | Ch 6 슬라이드 13 "concentrated on plausible designs", 49 MINs의 \((y,z)\) 최적화 명시, 59 "several of them can be read as …", 64 "buys plausibility, not evidence"; Ch 5 L969·L904 수정 |
| 탐색 대 생성 이분법 | 부제 "Learn where good designs live — then search, refit, condition or steer", standout "A generator decides where to look; a performance model decides what to trust.", 슬라이드 62 "a performance model and a generator" |
| Ch 7 연결 | 슬라이드 62 마지막 문단을 §15 문장으로 교체 |
| 196차원, GTG context | 슬라이드 23 노트, 슬라이드 47 |
| score 용어 | 성능 쪽은 "performance signal / estimate", \(\nabla\log p\)는 "density score"; `kl-tilt` 라벨 교체 |
| guidance 재배치 | CFG는 G3(슬라이드 45), classifier guidance는 G4 첫 장(52); blind-spot 내용은 Backup 4로 |
| 분포 대상 | VAE 슬라이드(14)에 latent prior 구별 문장, Session 2 시작(40)에 대상 표 |
| G1·G4 그림 | 2-D thin-manifold 위젯 `manifold-search` — g1(슬라이드 24): 평면 ascent는 첫 걸음에 무효, latent 탐색은 유효하지만 \(t=2.8\)에서 실제값 0.39; g4(슬라이드 53): \(s\) 0 → 4에서 유효 비율 87% → 19%, 유효 샘플의 실제값 0.68 → 약 0.99에서 정체 |
| A/B/C 슬라이드 | 제거; importance-ratio 위젯이 목표분포부터 스스로 보여 줌(슬라이드 31) |
| Ch 3·Ch 4 재사용 | 슬라이드 26(Lecture 3의 evidence와의 차이), 30 제목 "Lecture 3's rare cause, again", 32 캡션 "Lecture 4's CMA-ES move, with the prior ratio added", 33 CEM-PI |
| Ch 5 도구 연결 | 슬라이드 21 표에 "where Lecture 5's failure can re-enter" 열, 36·59에 pessimistic \(P(S\mid x)\)·LCOMs·제한된 proxy, KL tilt 위젯의 \(\mu-2\sigma\) 단계 |
| 논문 맵 | 실선(builds on)/점선(compared) 구분, 설정 태그(reward calls, online, offline → online, BO·lab rounds, evaluated), DiBO를 G2 열에서 제거(KL tilt 표와 reading guide로), DDOM → RGD 선 추가; Ch 5 맵의 "same group, same year" 선을 "same failure, another lever"로 |
| Ch 5 α 다이얼 | 모든 α에서 trust-region 탐색을 쓰도록 수정; optimiser 모드에 세 번째 단계(plain fit + trust region)를 넣어 2×2 완성 |
| Ch 5 NEMO | 슬라이드 45에 결정 규칙 한 줄 |

검증: 두 deck 모두 빌드 성공, `course-review`(화면·인쇄·위젯 lifecycle) 통과, `paper-selection` 통과, `teaching-route`·`source-fidelity`의 ch05·ch06 항목 통과(두 테스트 전체 실패는 이전부터 있던 ch02·ch04 문제). Ch 6은 79장(본문 64장)이고, 6A는 1–38장, 6B는 39–64장이다.

---

**19. 2차 검토 반영 — 2026-10-13**

2차 검토(구조 유지, 개념적 단정과 위젯 비교 기준 수정)의 일곱 항목을 모두 반영했다. Ch 6은 80장(본문 65장)이 되었다.

| 지적 | 반영 |
|---|---|
| 안전성 과장 | `kl-tilt` 문구를 "In this example, the pessimistic estimate suppresses improvements the data does not support. Its reliability still depends on the uncertainty estimate."로 교체. Session 2 표에서 \(p(w\mid D)\)(Bayesian posterior, Lecture 2)와 ensemble disagreement(non-Bayesian 신호, Lecture 5)를 별도 행으로 분리 |
| G4 정의 | 슬라이드 21 표와 마무리 표에서 G4를 "성능 정보가 샘플링 과정을 바꾼다 — 표본을 gradient로 옮기거나 guidance 강도를 정한다"로 확장. 슬라이드 53을 "G4 — use performance information to steer the sampler"로 바꾸고 확률적 conditioning(\(\nabla\log p_\phi(y\mid x_t)\))과 energy guidance(\(p(y\mid x)\propto e^{\hat f}\)를 가정한 \(\nabla\hat f\))를 구별. RGD를 G4의 두 번째 메커니즘으로 명시 |
| KL 슬라이드 | 제목 "A KL-regularised view of candidate distributions"; 두 장으로 분리(50: 목적함수·유도·\(\beta\)의 양 끝, 51: 방법과의 관계). \(\beta\to\infty\)는 "적절한 조건에서 목표 분포가 surrogate 최대점 부근에 집중 — 탐색 알고리즘의 결과와는 별개"로 서술. 학습 경로·Session 1 정리·Session 2 표의 "one target" 표현도 교체 |
| G4 위젯 비교 기준 | 예측과 실제를 **같은 유효 후보**에서 평균하도록 수정. 재계산 결과 유효 후보에서는 예측과 실제가 거의 같다(s = 2: 1.00 / 0.99, s = 4: 0.83 / 0.98). 메시지를 "과대예측"에서 "유효성 실패 — 데이터 밖의 gradient가 표본을 유효 집합 밖으로 끌어낸다"로 교체 |
| G1 위젯 | "첫 걸음부터" → "두 걸음 안에"; decoder가 알려진 곡선을 정확히 구현한 교육용 모델임을 캡션과 위젯 문구에 명시 |
| 지도 앞당기기 | 새 슬라이드 없이 슬라이드 9 "Two models, two jobs"에 네 질문(좌표·분포·성능 조건·샘플링 과정)을 예고 |
| CbAS–CMA-ES | "샘플링하고, 좋은 후보에 무게를 두어 분포를 다시 맞추는 공통 패턴"으로 표현 |
| Session 1 퀴즈 | "평가 전에 확인된 것은 유효성 실패뿐이며, 높은 예측은 성능의 증거가 아니고 예측 오류 여부는 평가로 판단한다"가 정답이 되도록 재작성 |

검증: 빌드, `course-review`, `paper-selection` 통과; `teaching-route`·`source-fidelity`의 ch05·ch06 항목 통과.

---

**20. 3차 검토 반영 — 2026-10-13**

구조와 논문 목록은 유지하고, 설명의 일관성과 수식을 다듬었다. 슬라이드 수는 80장 그대로다.

| 지적 | 반영 |
|---|---|
| guidance 수식 | 슬라이드 53: Bayes 식을 독립 수식 블록으로 옮기고, 회귀 surrogate는 \(p(y\mid x)\propto e^{\hat f}\) 가정 대신 후보 분포 \(q_t\propto p_t\,e^{s\hat f_t}\)를 직접 정의(\(\nabla\log q_t=\nabla\log p_t+s\nabla\hat f_t\)). "각 noise level의 score 해석이며, 전체 denoising이 최종 tilted distribution을 샘플링한다는 보장은 아니다"를 본문·51번 표·부록에 반영하고 Bradley & Nakkiran(2024, "Classifier-Free Guidance is a Predictor-Corrector")을 근거로 노트에 명시 |
| MINs gradient | 슬라이드 49: "No gradient on a surrogate in \(x\)" 삭제 → "MINs searches over \((y,z)\) through the generator and a forward model; DDOM generates without a separate forward surrogate." |
| Ch 5 한계 과장 | 슬라이드 6: "a pessimistic surrogate keeps every candidate close to the data" → "Reliable scoring alone does not provide convenient coordinates, or a distribution of diverse, plausible candidates." 퀴즈 1을 "a score-conditioned inverse model — one of this lecture's four routes"로 범위 축소 |
| BootGen pseudo-label | 본문과 부록의 "model-generated evidence" → "proxy-labelled synthetic samples — no new performance measurements". 슬라이드 59 결론에서 BootGen(proxy로 선별, 사후 평가)과 wind-farm(최적화 중 평가 추가)의 설정을 구별 |
| 지도 앞당기기 | 슬라이드 9에 G1–G4 네 칸 흐름 그림 추가(새 슬라이드 없음). 21번은 논문과 실패 위치를 붙인 상세판 |
| 그 밖 | 마무리 표 G4의 "what it leaves"에 무효 샘플 추가; 마무리 keypoint를 "the KL view connects several of them — a lens, not their common objective"로 |

검증: 빌드, `course-review`(ch05·ch06), `paper-selection` 통과; `teaching-route`·`source-fidelity`의 ch05·ch06 항목 통과.

---

**21. 강의 시간에 맞춘 정리 — 2026-10-13**

3차 검토의 권고(세부를 더하기보다 학생이 "각 방법이 무엇을 바꾸는가"를 설명할 시간을 확보)에 따라 Session 1을 38장에서 34장으로 줄였다. 내용은 지우지 않고 옮기거나 합쳤다. Ch 6은 78장(본문 62장, Session 1: 1–34장, Session 2: 35–62장)이다.

| 변경 | 이유 |
|---|---|
| "The inverse map" → 부록("Backup — the inverse map, as the source motivates it"); 핵심 한 문장은 다음 슬라이드(7) 캡션으로 | 역생성은 네 갈래 중 G3 하나이며, 7번 위젯이 같은 내용을 그림으로 보인다 |
| CVAE 슬라이드 → Session 2의 G3 시작(38) | guidance와 같은 원칙: 처음 필요해지는 곳에 둔다 |
| DDPM 학습·생성 두 장 → 한 장(15, 학습과 생성을 나란히) | 두 장 모두 가벼웠고, 학습/생성 대비가 한 화면에서 더 분명하다 |
| GFlowNet·BootGen 두 장 → 한 장(31); BootGen 그림은 부록 BootGen 슬라이드로 | 둘 다 "분포를 옮기는 또 다른 방식"이고, CbAS가 G2의 중심 계산이다 |

Session 1의 구성: 도입 5장(제목·위치·경로·문제·남은 문제) → 두 모델과 G1–G4 예고 → 도구(KL, VAE, 다이얼, diffusion) → G1(3장) → G2(CbAS 중심 8장 + 비교 1장) → 정리. 퀴즈 3개는 Act마다 하나씩이며, 학생이 개입 지점을 직접 설명하는 활동은 18번(네 개입 지점)과 34번(정리)에서 할 수 있다.

검증: 빌드, `course-review`, `paper-selection` 통과; `teaching-route`·`source-fidelity`의 ch05·ch06 항목 통과.
