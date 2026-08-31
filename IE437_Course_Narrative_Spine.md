# IE437 — 강의 전체 서사 설계 문서
### Data-Driven Decision Making and Control · 재저작 기준 문서 (Narrative Spine v3)

> **v3 개정 — 다중 에이전트 축 전체를 IE579로 이관.**
> v2는 Ch 12 Dynamic Games를 남겨 네 번째 전이(single→multi)를 건너게 했으나, IE437은 이제
> **근접면(단일 에이전트)에서 끝난다.** Ch 12 Dynamic Games와 Ch 13 MARL을 모두 제거하고,
> **Ch 12 Offline RL이 강의의 종결장**이 된다. 다중 에이전트 축은 0장에서 *이름을 붙이고 경계를 표시할 뿐* 건너지 않는다 —
> 큐브의 원거리면이 IE579의 것임을 보여주는 것이 이 강의의 범위를 읽히게 만든다.
>
> 최종 구성: **0–12장 + 부록**, 14개 파일. 네 번째 전이 대신 **interactive → offline**이
> 마지막 움직임이 된다.

> **v2 개정 (Option A) — 다중에이전트 축소, Offline RL 신설.**
> 근거: 원본 `0.Introduction.pdf` p.13–16이 같은 큐브 위에 **IE437은 단일에이전트 앞면**(①Optimization →
> ②Model-free Opt. → ③MDP/Optimal Control → ④Reinforcement Learning), **IE579는 다중에이전트 뒷면**으로
> 이미 선을 그어 두었다. 구 Ch 13(Policy-Based MARL, 91 frames = 전체의 28%)은 **IE579로 이관**한다.
> 대신 큐브에서 비어 있던 **동적 × 오프라인** 칸을 신설 **Ch 12 Offline RL**로 채운다 —
> 정적 세계의 Ch 4(질의 가능) → Ch 5–6(고정 데이터셋) 비대칭이 동적 세계에서도 닫힌다.
>
> | 새 번호 | 장 | 비고 |
> |---|---|---|
> | 11 | Model-Based RL | 유지 |
> | **12** | **Offline Reinforcement Learning** | **신설 · 최종장** · tex 소스 없음, 신규 집필 |
> | — | ~~Dynamic Games~~ · ~~Policy-Based MARL~~ | **전부 IE579로 이관** |
>
> 총량 322 → 약 250 frames. 다중에이전트 비중 33% → 6%.
> 큐브의 네 번째 전이(single→multi)는 Ch 13 하나로 그대로 건넌다.

> 이 문서는 모든 강의를 표준 형식(beamer + metropolis, 서사 중심)으로 재저작하기 위한 **단일 기준점**이다.
> 각 강의의 도입(handoff-in)과 결말(handoff-out)은 여기서 정의한 사슬을 따르도록 집필한다.

---

## 0. 메인 서사 — 큐브를 가로지르다 (The Main Narrative: Traversing the Cube)

**이 강의의 메인 서사는 단 하나다: 의사결정 문제의 3축 큐브를, 정해진 순서로 가로지른다.** 그리고 핵심은 *축을 건너는 전이(transition)*다 — 모든 강의는 도입부에서 **전이 트래커**로 "지금 어느 축을 건너는가"를 표시한다.

| 축 (axis) | 한쪽 끝 | 다른 끝 |
|---|---|---|
| 단계 (stages) | Static (단발) | Dynamic (다단계) |
| 모델 (model) | Model-based (주어짐) | Data-driven (학습) |
| 결정자 (agents) | Single agent (최적화) | Multi-agent (게임) |

큐브를 가로지르는 순서: **model→data (정적) → static→dynamic → model→data (동적) → single→multi.**

### 네 번의 전이 (the four crossings) — 강조 지점

| # | 건너는 축 | 위치 | 무엇이 바뀌나 |
|---|---|---|---|
| 1 | **model → data** (목적함수 $f$) | Lec 1→2 (Part I→II) | 미지수 **1개**: $f$. belief/surrogate로 학습 |
| 2 | **static → dynamic** | Lec 6→7 (Part III→IV) | 모델은 일시 복귀, 결정이 시간에 따라 펼쳐짐 — **가장 깊은 전이** |
| 3 | **model → data (다시)** | Lec 7→8, 9→10 | 미지수 **2개**: 보상 $r$ + 전이 $P$ (두 배!) |
| 4 | **single → multi** | Lec 11→12→13 | 결정자 둘 이상 — optimum → **equilibrium** |

### 전이 3의 핵심 — 미지수가 두 배가 된다 (the course's deepest move)

전반부(정적)의 데이터 기반 전환은 미지수가 **하나**($f$)였다. 동적 세계로 들어선 뒤의 데이터 기반 전환은 미지수가 **둘**(보상 $r$ + 전이 $P$)이다. **Part IV 전체는 이 *두 배*에 대한 세 가지 답이다:**
- **Value 기반 (Ch 8)**: $Q$를 샘플로 직접 학습 — $r$·$P$를 **융합**, 둘 다 모델링 안 함
- **Policy 기반 (Ch 10)**: 정책을 직접 출력 — 동역학 $P$가 그래디언트에서 **소멸**
- **Model 기반 (Ch 11)**: 전이 $P$를 **명시적으로 추정** 후 계획

→ 이것이 "RL은 단지 데이터로 하는 최적화가 아니다"의 정확한 이유다. (0장에 2단 비교 프레임으로 시각화; 8·10장 도입 트래커가 "이제 r·P 둘"을 명시.)

---

## 1. 보조 기억장치 — "주어졌던 것을 하나씩 빼앗긴다" (a supporting mnemonic)

위 큐브 traversal을 장 단위로 풀면, 각 전이는 *직전에 누렸던 가정 하나를 제거*하는 것으로 읽힌다. 단, **엄밀한 단조 제거는 아니다**(전이 2에서 모델이 잠시 복귀) — 정확한 골격은 큐브이고, 이건 기억을 돕는 보조 서술일 뿐이다.

```
정적·단일, f가 확실            (Ch 1)
   └▶ f가 불확실               (Ch 2–3)      ◀── 전이 1: model→data (on f)
        └▶ f 미지, 질의 가능     (Ch 4)
             └▶ 고정 데이터셋만   (Ch 5–6)
  ══ 전이 2: static→dynamic (모델 일시 복귀) ══
                  └▶ 동적, 모델 주어짐   (Ch 7, 9)
                       └▶ r·P 둘 다 미지  (Ch 8, 10)  ◀── 전이 3: model→data (두 배)
                            └▶ 모델 학습해 되찾음  (Ch 11)
                                 └▶ 상호작용마저 꺼짐  (Ch 12 Offline RL)  ◀── 마지막 움직임
  ══ 전이 4: single→multi ══  ✗ 이 코스는 건너지 않는다 → IE579
                                      └▶ 다중 에이전트: 최적해가 균형이 되는 곳
```

---

## 2. 핵심 프레이밍 — 두 개의 학문적 계보 (The Two Lineages)

> 이것이 이 강의의 가장 중요한 메시지다. **Value-based RL과 Policy-based RL의 차이는 "방법의 선택"이 아니라 "출신 학문의 차이"다.**

동적 의사결정에는 두 개의 부모 학문이 있고, 각각이 데이터 기반으로 확장되어 RL의 두 갈래가 된다.

| | **계보 A — OR / Dynamic Programming** | **계보 B — Control Theory** |
|---|---|---|
| 모델기반 원형 | **MDP & Dynamic Programming** (Ch 7) | **Optimal Control / Planning** (Ch 9) |
| 다루는 대상 | 가치함수 V, Q | 제어법칙 u = γ(x), u = Kx |
| 핵심 연산 | 벨만 백업 | 궤적·제어 최적화 |
| 시간·행동 | 이산 (discrete) | 연속 (continuous) |
| 뿌리 인물 | Bellman | Pontryagin · Bellman(HJB) · Kalman(LQR) |
| **데이터기반 확장** | **Value-Based RL** (Ch 8) | **Policy-Based RL** (Ch 10) |
| 대표 알고리즘 | Q-learning, SARSA, DQN | REINFORCE, actor-critic, DDPG, PPO |
| 빼앗기는 것 | 모델 (P, R) | 동역학 f |

이 대칭이 목차에 그대로 드러나도록 7–10장을 **2×2 격자**로 배치한다.

```
              계보 A (OR/DP)              계보 B (Control)
모델기반    Ch 7  MDP & DP          ┃   Ch 9  Optimal Control/Planning
              │  모델 (P,R) 제거    ┃     │  동역학 f 제거
              ▼                     ┃     ▼
데이터기반  Ch 8  Value-Based RL    ┃   Ch 10 Policy-Based RL
```

세로축 = 모델기반→데이터기반, 가로축 = OR↔Control. 번호 순으로 읽으면 "원형 → 데이터 확장 → (다음 계보의) 원형 → 데이터 확장"이 같은 리듬으로 반복된다.

---

## 3. 파트별 서사 (Part-by-Part)

### Part I — 주어진 세계 (모델 확실, 단발 결정)

**Ch 1 · Optimization Problem Modeling**
깨끗한 목적함수 f와 제약이 주어진다. x*를 찾아라. 의사결정의 가장 순수한 형태 — 알려진 모델, 결정론적, 단일 결정. 마스터 템플릿 `min f(x) s.t. g(x)≤0`과 볼록성·KKT·trust region을 세운다. **이후 모든 장은 이 템플릿에서 무언가를 빼거나 불확실하게 만든 것이다.**

---

### Part II — 불확실한 세계 (모델을 데이터로 학습; 여전히 단발/소수)

**Ch 2 · Bayesian Statistics**
모델의 파라미터가 불확실하다. 한 값을 고르지 말고 *분포를 들고 다녀라.* prior → likelihood → posterior. 마스터 무브: 믿음을 데이터가 갱신하는 확률분포로 표현 (MLE / MAP / full Bayes, prior–데이터 균형).

**Ch 3 · Bayesian Network**
세계는 상호작용하는 다수 변수로 이뤄진다. 조건부 독립을 그래프로 인수분해해 belief를 다루기 쉽고 구조화되게 만든다. **decision·utility 노드를 더하면 decision network(영향 다이어그램)** — "belief + 행동 + 효용"의 첫 등장, 곧 *모든 순차적 의사결정의 씨앗*. (다리: 영향 다이어그램 = 단발 MDP.)

**Ch 4 · Bayesian Optimization**
belief를 실제 의사결정에 쓴다. f가 미지·고비용일 때 그 위에 posterior(GP — 함수값에 대한 연속 베이지안 네트워크)를 짓고, explore/exploit를 저울질해(acquisition) 다음 점을 고른다. **첫 능동적·순차적 결정 루프** — 본질적으로 *belief state 위의 bandit*. (다리: acquisition 정책 = RL 정책의 씨앗; bandit → RL.)

---

### Part III — 데이터만으로 설계 (오프라인; Ch 1의 문제를, 고정 데이터셋으로)

**Ch 5–6 · Data-Driven Design Optimization** *(한 모듈, 두 파트)*
두 장 모두 글자 그대로 동일한 문제로 시작한다: `find x* = argmax f(x), 단 고정 데이터셋 D만`. Ch 1의 목표를 라이브 질의 없이 푸는 오프라인 버전.

- **Ch 5 · Surrogate-based (순방향):** f의 대리모델을 학습 → 그 위에서 최적화. "오프라인 BO" (Ch 2·4의 GP/회귀 재사용, 능동 루프만 제거). 위험: 옵티마이저가 대리모델의 *오차를 악용* → 불확실성이 다시 중요.
- **Ch 6 · Generative-based (역방향):** 역함수 p(x | y≥y*)를 모델링해 좋은 설계를 *직접 샘플*. VAE / GAN / Diffusion을 prior p(x)로.

> 이 둘은 **"순방향 모델+최적화" vs "역방향 모델+샘플"**의 한 쌍이며, 뒤이은 *value-based(검색) vs policy-based(생성)* 듀얼리티와 같은 형태의 라임을 이룬다.

---

### Part IV — 동적 의사결정의 두 학문적 전통, 그리고 각각의 데이터 기반 확장

> Part IV가 이 강의의 심장이다. 위 §2의 두-계보 프레이밍을 그대로 구현한다.

**Ch 7 · MDP & Dynamic Programming** — *계보 A의 모델기반 원형 (OR)*
결정이 순차적이고 상태가 진화한다. 모델 (P, R)은 여전히 주어진다. 벨만 원리, value/policy iteration. Ch 1 최적화의 동적 일반화이자 Ch 3 decision network의 다단계 버전.

**Ch 8 · Value-Based RL** — *계보 A의 데이터기반 확장* ✅ *(완료)*
모델을 빼앗는다. 벨만은 유지, 모델을 샘플로 교체. MC/TD, SARSA/Q-learning, DQN.
중심 명제: **"벨만 방정식은 살아남고, 모델은 사라진다."**

**Ch 9 · Optimal Control / Planning** — *계보 B의 모델기반 원형 (Control)* 🔨 *(기존 합본에서 분리·재서사 필요)*
Ch 7이 OR로 동적 의사결정을 풀었듯, 이제 *control theory*가 같은 문제를 어떻게 푸는가. HJB(연속시간 DP) · LQR(유일한 닫힌형, Riccati) · Pontryagin 최소원리(Hamiltonian, costate). 7장↔9장은 "같은 동적 의사결정의 두 학문적 형식"(0장 큐브의 같은 셀, action space만 finite/infinite).
*단독 장이 되어 HJB·LQR·Pontryagin을 충분히 펼칠 공간을 얻는다.*

**Ch 10 · Policy-Based RL** — *계보 B의 데이터기반 확장* 🔨 *(기존 합본에서 분리·재서사; 내용 집필됨)*
동역학 f를 빼앗는다. 컨트롤러를 직접 생산 — 정책 그래디언트를 샘플링. REINFORCE → actor-critic → DDPG → TRPO/PPO. DDPG의 μ_θ(s)는 LQR의 K의 후손.
중심 명제(8장과 라임): **"최적 행동을 검색할 수 없다면, 그것을 출력하는 법을 배워라."**

**Ch 11 · Model-Based RL** — *두 계보의 재결합* (기존 10장)
모델이 돌아온다 — 단, *학습된* 모델로. 학습된 동역학 + 계획/제어, 학습자가 최적제어 교사를 모방(GPS). Part I–II(모델링)와 III–IV(제어)의 루프를 닫는다. **bilevel 설계최적화(풍력단지·furnace)가 재등장** — 설계와 제어를 함께.

---

### Finale — 상호작용마저 빼앗긴다

**Ch 12 · Offline Reinforcement Learning** — *You cannot try. Learn from what was already done.*
큐브의 같은 셀(동적·데이터기반·단일)이되, **질의권이 꺼진다**. 정적 세계에서 Ch 4(질의 가능) → Ch 5–6(고정 데이터셋)로 이미 배운 축이 동적 세계에서 닫히는 자리.

중심 라임 — **Ch 5의 명제가 한 축 옮겨온 것**:
- Ch 5 "옵티마이저는 적대자, 대리모델의 오차를 착취" ↔ 정책이 OOD 행동에서 $Q$를 착취 (extrapolation error)
- Ch 5 **COMs**(대리모델이 자기 옵티마이저를 불신) ↔ **CQL**(가치가 OOD 행동에 비관적)

네 갈래: 정책 제약(BCQ·TD3+BC) · 가치 제약(CQL·IQL) · 비관적 모델(MOPO·MOReL) · 시퀀스 모델(Decision Transformer·Diffuser). 그리고 **off-policy evaluation** — 배포 전에 정책이 좋은지 아는 법(IS · doubly robust · FQE). 현장 적용에서 알고리즘 선택보다 먼저 나오는 질문이므로 반드시 포함한다.

---

### 프레이밍 / 보충

**Ch 0 · Introduction** — ✅ 제작 완료. **메인 서사(큐브 traversal)를 명시**: 세 축 + 네 번의 전이 + "미지수 1개→2개 두 배" 2단 비교 + 세 답. 모든 장이 도입부 전이 트래커로 "지금 건너는 축"을 표시.

**Appendix · Probability Review** (기존 21장) — ✅ 도구 상자 부록 (다변량 정규분포 4성질 중심 + 사용처 역참조).

---

## 4. 장별 사슬 요약 (Inherits → Question → Hands off)

| Ch | 제목 | 이어받음 (inherits) | 중심 질문 | 넘김 (hands off) | 계보 | 상태 |
|---|---|---|---|---|---|---|
| 1 | Optimization Modeling | — | 주어진 f를 어떻게 최적화? | `min f s.t. g` 템플릿 | — | ✅ |
| 2 | Bayesian Statistics | 최적화 대상 f | 파라미터가 불확실하면? | belief = 분포 | — | ✅ |
| 3 | Bayesian Network | belief 분포 | 변수가 많으면? | 구조화 belief + decision/utility 노드 | — | ✅ |
| 4 | Bayesian Optimization | 구조화 belief, GP | belief로 어떻게 결정? | acquisition 정책 (= RL 정책 씨앗), bandit | — | ✅ |
| 5 | Surrogate Design Opt. | argmax f, GP | 데이터셋만 있으면 (순방향)? | 순방향+최적화 / 오차 악용 위험 | — | ✅ |
| 6 | Generative Design Opt. | 동일 문제 (역방향) | 역방향으로 직접 샘플? | 역방향+샘플 (value↔policy 라임) | — | ✅ |
| 7 | MDP & DP | 동적 일반화, 벨만 | 모델 주어진 순차 결정? | 벨만 방정식 (모델 필요) | A | ✅ |
| 8 | Value-Based RL | 벨만 방정식 | 모델을 빼앗으면? | 연속 argmax 벽 | A | ✅ |
| 9 | Optimal Control | 동적 결정의 2번째 학문 | 동역학 알 때 컨트롤러? | 피드백법칙 γ(x), u=Kx | B | ✅ |
| 10 | Policy-Based RL | 최적제어 (동역학 f) | 동역학 빼앗으면? | trust-region 기계 (→ 11장) | B | ✅ |
| 11 | Model-Based RL | 두 계보 | 모델을 학습해 되찾으면? | 학습모델+계획, bilevel 설계 | A+B | ✅ |
| **12** | **Offline RL** | 학습모델(11), value·policy(8·10) | **상호작용을 빼앗으면?** | 보수적 가치·정책, OPE | A+B | ✅ |
| ~~—~~ | ~~Dynamic Games~~ · ~~MARL~~ | — | — | **전부 IE579로 이관** | B' | 이관 |
| 0 | Introduction | (전체) | 이 모든 게 어떻게 한 지도에? | 큐브 + 두 계보 지도 | — | ✅ |
| A | Probability Review | — | 도구 상자 | — | — | ✅ |

✅ 완료 · 🔨 분리/재서사 필요 (내용 집필됨) · ⬜ 미착수

---

## 5. 번호 재배치 맵 (Old → New)

원본 자료(`lecture_slides/`의 PDF와 `tex/`)에서 현재 14개 장으로 오는 대응표. **v3 기준**이다.

| 기존 파일 | 새 번호 / 제목 | 비고 |
|---|---|---|
| 0 Introduction | **0** Introduction | 마지막에 제작 |
| 1 Optimization Problem Modeling | **1** 동일 | |
| 2 Fundamentals on Bayesian Statistics | **2** 동일 | |
| 3 Bayesian Network | **3** 동일 | |
| 4 Bayesian Optimization | **4** 동일 | |
| 5 Surrogate (Part 1–2) | **5** Data-Driven Design Opt. — Surrogate | 6과 한 모듈 |
| 6 Generative (Part 1–2) | **6** Data-Driven Design Opt. — Generative | 5와 한 모듈 |
| 7 MDP and Dynamic Programming | **7** 동일 | 계보 A 원형 |
| 8 Value Based RL | **8** 동일 | |
| **9 Optimal Control + Policy Based RL (합본)** | **9** Optimal Control **+** **10** Policy-Based RL | **합본을 둘로 분리.** 여기 녹아 있던 게임이론(Nash·coupled HJB)은 **IE579로 이관** |
| 10 Model Based RL | **11** Model-Based RL | +1 이동 |
| 11 Policy-Based MARL (`tex/Lecture13`) | — | **IE579로 이관** |
| *(원본 없음)* | **12** Offline Reinforcement Learning | **신규 집필** · `md/_source/ch12_spec.md`가 유일한 기준 |
| 21 Probability Review | **Appendix** | 부록 |

**가장 큰 변화 둘.**

1. **구 9장 합본을 둘로 분리** — 새 9장(최적제어)·10장(policy RL). 이로써 계보 B가 계보 A(7→8)와 같은 모양을 갖는다. 합본에 섞여 있던 게임이론 자료는 이 코스에서 쓰지 않는다.
2. **비어 있던 "동적 × 오프라인" 칸을 12장 Offline RL로 신설** — 정적 세계의 4장(질의 가능) → 5–6장(고정 데이터셋) 비대칭이 동적 세계에서도 닫힌다. 이것이 코스의 종결장이다.

> **v2에서 달라진 점.** v2는 구 9장 합본을 **셋**으로 쪼개 신설 12장 Dynamic Games를 두고 MARL을 13장에 놓았다. v3는 다중 에이전트 축 전체를 IE579로 넘기면서 그 둘을 모두 제거했고, 대신 12장이 Offline RL이 되었다. 따라서 **`tex/Lecture12_Dynamic_Games.tex`와 `tex/Lecture13_Policy_Based_MARL.tex`는 이 코스에 대응 장이 없다** — 지우지 않고 IE579용으로 남겨 둔 것이다.

---

## 6. 통합/분리 결정

1. **5·6장 → 한 모듈("Data-Driven Design Optimization")의 두 파트.** 동일 문제 정의로 시작하는 명백한 쌍. "순방향+최적화 vs 역방향+샘플" 듀얼로 묶음. *(번호는 5·6 유지, 공통 도입 슬라이드 공유)*
2. **기존 9장 합본 → 9장(최적제어) + 10장(policy RL) 분리.** 두-계보 대칭을 목차로 드러내기 위함. 부수 효과로 각 장이 충분한 분량 확보(HJB/LQR/Pontryagin, REINFORCE→PPO 여유).
3. **7–10장을 2×2 격자로 명시.** §2 표가 0장·각 장 도입의 공통 시각 장치.

---

## 7. Handoff 설계 원칙 (대칭 라임)

두-계보 의도가 살려면 **8장과 10장이 같은 구조의 도입**을 가져야 한다.

- **Ch 8 도입:** "MDP/DP는 **OR**의 모델기반 원형이다. 모델 (P,R)을 빼앗으면 → value-based RL." *(이미 적용됨; OR 출처 한 줄 보강 예정)*
- **Ch 10 도입:** "Optimal Control은 **Control**의 모델기반 원형이다. 동역학 f를 빼앗으면 → policy-based RL." *(8장과 라임이 되도록 새로 작성)*

그리고 **Ch 9(최적제어)는 8장에서 이어받는 후속이 아니라, 두 번째 부모를 독립 소개하는 장**이다. 도입은 "7장이 OR로 동적 의사결정을 풀었듯, 이제 control theory가 같은 문제를 어떻게 푸는가"로 시작해 7장↔9장을 잇는다. ("연속 argmax 벽"은 두 계보가 만나는 접점 *중 하나*로만 등장.)

---

## 8. 표준 템플릿 규약 (모든 장 공통)

8·9장에서 확립한 형식을 전 장에 동일 적용한다.

- **클래스/테마:** `beamer`, metropolis, 동일 색상(dark/teal), xelatex 컴파일.
- **공통 커스텀 명령:** `\paper{}` (논문 인용), `\hl{}` (teal 강조), 강의별 **질문 strip**(전환마다 재등장, 하이라이트 이동).
- **오프닝 3종 세트:** ① *The handoff — what Lecture N−1 left us* ② *translation table* (이전 개념 → 이번 개념 일대일 대응) ③ *roadmap — N questions*.
- **본문:** Act 구조, `\pause` 점진 공개, 핵심 결과는 `block`.
- **클로징:** *Where we are* (큐브/격자에 현재 위치 표시) → *the one sentence*.
- **부록:** 완전한 증명 백업 슬라이드 (본문 서사에서 분리).
- **강의 간 연결:** Ch N−1 → Ch N의 명시적 전·후 포인터 일관 유지.

> 수식 주의: 원본 PDF는 수식이 깨져 추출되므로 **모든 수식은 원본 정독 후 LaTeX로 재타이핑**한다. 정확성(표기 컨벤션, 논문 연도)은 교수 검수 필요.

---

## 9. 제작 순서 & 현황

**집필 순서:** 1 → 2 → 3 → 4 → [5–6] → 7 → 8 → 9 → 10 → 11 → 12, **0장은 표지로 마지막**, Appendix는 부록.
*서사 사슬 일관성을 위해 번호 순서대로 이어서 집필 — 각 장의 handoff 슬라이드가 앞 장의 마지막 문장을 인용하기 때문.*

**산출물은 이제 beamer가 아니라 인터랙티브 HTML 덱이다.** `md/`가 유일한 진실이고, `build.mjs`가
`html/chNN_*.html`을, `pdf.mjs`가 같은 슬라이드의 PDF를 만든다. 각 장은 스타일시트·엔진·위젯·KaTeX·
폰트를 전부 인라인한 **단일 자립 파일**이라 네트워크 없이 열린다. 저작 규약은 `md/_SCHEMA.md`,
장별 handoff 문구의 권위는 `md/_CHAIN.md`에 있다 — **이 문서가 아니다.**

**현재 현황** — **전체 완성 (14/14)** · 0–12장 + 부록

| Part | 장 | 슬라이드 |
|---|---|---|
| Map | 0 Introduction | 62 |
| I | 1 Optimization Modeling | 38 |
| II | 2 Bayesian Statistics · 3 Bayesian Networks · 4 Bayesian Optimization | 42 · 50 · 41 |
| III | 5 Surrogate Design · 6 Generative Design | 44 · 52 |
| IV | 7 MDP & DP · 8 Value-Based RL · 9 Optimal Control · 10 Policy-Based RL · 11 Model-Based RL | 50 · 45 · 46 · 48 · 57 |
| Finale | 12 Offline RL | 43 |
| Appendix | Probability Review | 35 |

합계 **653 슬라이드 · 위젯 마운트 62개(고유 파일 60) · 퀴즈 56문항 · 그림·영상 32개**, PDF 전량 생성.
전 장 오버플로 0 · JS 에러 0으로 검증(`_qa.mjs`).

- ✅ **0장 재구성** — 큐브 traversal을 명시적 메인 서사로: "축 건너기" 프레임 + "미지수 1개(f) → 2개(r·P)" 2단 비교 + 세 답(value 융합 · policy 우회 · model 명시). 원본 pptx의 그림 19장·클립 11개를 복원해 넣었다.
- ✅ **전이 트래커**를 `::: tracker` 디렉티브로 만들어 전 강의 도입부에 삽입 — 지금 큐브의 어디에 있고 어느 축을 건너는지를 일관되게 표시:
  - **축을 건너는 강의**(화살표 + "Crossing an axis"): 2(1→2), 7(6→7 대전이), 8·10(7→8, 9→10 — 미지수 r·P 두 개)
  - **같은 셀에서 심화하는 강의**(화살표 없음): 1(출발 코너), 3·4·5·6, 9(제어 계보 원형, 모델축 리셋), 11(두 계보 재결합), 12(오프라인)
  - 부록은 큐브 위치가 없는 도구 상자이므로 트래커 미적용
- ✅ **agents 축은 건너지 않는다** — 0장이 이름을 붙이고 큐브의 원거리면을 IE579의 영역으로 표시하며, 12장이 그것을 코스의 마지막 문장으로 되받는다.

**해소된 항목**
- ✅ §2 두-계보 구조는 `::: lineage` 2×2 그리드로 시각화됨(표 형태 아님).
- ✅ PDF 일괄 생성 — `node pdf.mjs --all`, 헤드리스 Chromium이 1280×720 페이지로 출력. 퀴즈는 정답지로 인쇄된다.
- ✅ 강의 간 cross-reference 일관성 점검 완료 — 삭제된 Ch 13을 가리키던 참조 2건(7장·9장)을 IE579로 정정. 전 장의 `inherits`/`handoff`가 `_CHAIN.md`와 일치함을 확인.

**남은 선택지**
1. 1–12장에도 원본 덱의 그림을 복원해 넣기 — 현재 실물 그림은 0장에만 있고, 나머지는 위젯으로만 그린다. 원본은 `lecture_slides/`에 있다.
