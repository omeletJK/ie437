# 중간고사 프로젝트: 물류센터 네트워크 재설계 — 계층적 의사결정의 정식화와 해법

버전 2.0 · 2026-10-19

**출제: 2026-10-19(월) 10:00 KST · 제출 마감: 2026-11-02(월) 10:00 KST.** 14일, 개인 제출.

IE437 2026년 가을 중간고사(성적 30%)를 과제 1과 같은 형식의 **2주 테이크홈 프로젝트**로 출제한다. 소재는 `/Users/jinkyoo/Teachings/midterm exam.pdf`(연구 엔지니어 채용 과제, 물류 거점 재배치)이며, 전국 단위 센터 네트워크 설계라는 원문의 규모를 유지하고 산업은 **편의점 체인 하나로 통일**했다. 교수자는 데이터를 주지 않는다. 회사가 가진 표를 명세로 적고, 학생이 가상 인스턴스를 시드를 고정해 만든다. 거리는 실제 도로 주행거리여야 하며 출처를 적고 캐시해 제출한다.

과제의 중심은 **하위 문제(센터 한 곳의 하루 운영)를 어떻게 정의해 풀고, 그 결과를 어떻게 상위 결정(센터 수·위치)에 연결하며, 현실의 복잡성과 계산 복잡도의 균형을 어떻게 잡는가**다. 이 둘이 배점 60점이다. 학생용 문서는 영어, 교수자용 문서는 한국어다.

## 학생에게 배포할 자료

- [과제 안내 및 공개 평가 기준](student/assignment.md)
- [문제 정의서 Markdown 양식](student/problem-definition-template.md) — 과제 1 양식에 네 발언의 층위 표, 하위·연결·상위 정식화, I/O 스키마, 알고리즘 계획, 현실성–계산 균형 표를 추가
- [문제 구조화 및 분류 참고자료](student/problem-classification-reference.md) — 과제 1과 동일, 부제만 조정
- [작성 형식 예시 — 가상의 메이커스페이스 문제](student/problem-definition-example.md) — 과제 1과 동일, 부제만 조정
- 사이트 배포용 ZIP — `npm run site`가 위 네 파일로 `html/assignments/midterm-depot-network/IE437-Midterm-Project.zip`을 자동 생성

## 학생이 제출할 결과물과 배점

| 제출물 | 평가 항목 | 배점 |
|---|---|---:|
| `problem-definition.md` | 문제 구조·데이터·I/O 15 · 하위 수준 정식화와 해법 15 · 연결과 상위 수준 정식화·탐색 15 · 현실성–계산 균형 15 · 수요 불확실성 10 · 근거(G vs E, 기준선, sweep, 추천) 15 | 85 |
| `code/` + `demo.html` | 세 명령 이내 오프라인 재현, 라이브 하위 solve, 정상·경계·실패 사례 | 10 |
| `proposal.html` + LLM 검토 | 경영진의 두 질문에 대한 답과 근거, AI 활용 기록 | 5 |

기본 100점과 심화 가산점 최대 10점을 별도로 기록한다.

## 교수자 전용

- [세부 채점 가이드와 히든 포인트](instructor/grading-guide.md)
- [배포 전 확인·출처·미확정 운영 항목](instructor/preparation-notes.md)
- [드라이런 프로토타입](instructor/dry-run/README.md) — 축소 세계에서 R1–R5를 끝까지 돌린 기록. 시간창이 센터 수 상충을 만들고, 위치의 exploit은 작으며, 좌표 그대로의 GP는 예산 40으로 학습하지 못한다는 측정이 채점 가이드의 기준이 되었다

**상위 폴더 전체를 학생에게 배포하지 않는다.** `instructor/`는 `.gitignore`의 `/teaching/*/instructor/` 패턴으로 Git과 사이트에서 제외된다. 랜딩 페이지는 `md/_ASSIGNMENTS.md`에 명시한 학생용 네 문서와 자동 생성 ZIP만 연결한다.

편집 원본은 `student/`이다. 변경 후 프로젝트 루트에서 `npm run site`를 실행하면 사이트 다운로드와 ZIP이 함께 갱신되고, `npm run test:assignments`로 검증한 뒤 `main`에 반영하면 자동 배포된다. 마감일을 바꿀 때에는 카탈로그의 `due`와 `student/assignment.md`의 날짜를 함께 갱신한다.
