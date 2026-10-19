# 중간고사 프로젝트: 물류센터 네트워크 재설계 — 불확실성 아래의 계층적 의사결정

버전 1.0 · 2026-10-19

**출제: 2026-10-19(월) 10:00 KST · 제출 마감: 2026-11-02(월) 10:00 KST.** 14일, 개인 제출.

IE437 2026년 가을 중간고사(성적 30%)를 과제 1과 같은 형식의 **2주 테이크홈 프로젝트**로 출제한다. 학생은 LLM과 논의하며 문제를 정의하고, 가상 세계를 스스로 생성하고, 수업에서 배운 도구(Lec 1·2·4·5)로 탐색과 검증을 수행한 뒤 경영진 대상 제안 발표를 만든다. 학생용 문서는 영어, 교수자용 문서는 한국어다.

소재는 `/Users/jinkyoo/Teachings/midterm exam.pdf`(연구 엔지니어 채용 과제, 물류 거점 재배치)이다. 전국 단위 센터 네트워크 설계라는 원문의 규모를 유지하고, 산업은 **편의점 체인 하나로 통일**해 채점을 비교 가능하게 했다(2026-10-19 결정). 회사는 가상이고 산업과 운영 제약은 실제 편의점 물류의 것이다. 수업 도구가 필수로 들어가도록 R1–R5 요구사항을 추가했다. 자세한 변경 내역은 [배포 메모](instructor/preparation-notes.md)에 있다.

## 학생에게 배포할 자료

- [과제 안내 및 공개 평가 기준](student/assignment.md)
- [문제 정의서 Markdown 양식](student/problem-definition-template.md) — 과제 1 양식에 네 발언의 층위 표, I/O 스키마, 두 기준(G/E), 예산 탐색, Exploit 사례를 추가
- [문제 구조화 및 분류 참고자료](student/problem-classification-reference.md) — 과제 1과 동일, 부제만 조정
- [작성 형식 예시 — 가상의 메이커스페이스 문제](student/problem-definition-example.md) — 과제 1과 동일, 부제만 조정
- 사이트 배포용 ZIP — `npm run site`가 위 네 파일로 `html/assignments/midterm-depot-network/IE437-Midterm-Project.zip`을 자동 생성

## 학생이 제출할 결과물

| 파일 | 목적 | 배점 |
|---|---|---:|
| `problem-definition.md` | 층위·결정·의존관계·분류, 표준형, I/O 스키마, 두 기준, 세계 설계와 수요 모형, 접근 비교, 검증, 제안, LLM 검토 | 45 |
| 접근과 근거 (정의서 §4–5와 데모에 걸침) | 생성 기준 vs 판정 기준의 exploit 사례와 교정, 예산 탐색과 로그, 공정한 기준선 비교, 센터 수 sweep | 30 |
| `demo.html` | 세계 생성 → 설정 → 탐색 → 로그·추천 확인 → 기준선 비교 → 재실행 | 15 |
| `proposal.html` + LLM 검토 | 경영진의 두 질문에 대한 답과 근거, AI 활용 기록 | 10 |
| `code/` (선택) | 무거운 계산의 재현 스크립트 | — |

기본 100점과 심화 가산점 최대 10점을 별도로 기록한다. 과제 1(50/25/25)보다 방법·근거 쪽으로 배점을 옮겼다.

## 교수자 전용

- [세부 채점 가이드와 히든 포인트](instructor/grading-guide.md)
- [배포 전 확인·출처·미확정 운영 항목](instructor/preparation-notes.md)

**상위 폴더 전체를 학생에게 배포하지 않는다.** `instructor/`는 `.gitignore`의 `/teaching/*/instructor/` 패턴으로 Git과 사이트에서 제외된다. 랜딩 페이지는 `md/_ASSIGNMENTS.md`에 명시한 학생용 네 문서와 자동 생성 ZIP만 연결한다.

편집 원본은 `student/`이다. 변경 후 프로젝트 루트에서 `npm run site`를 실행하면 사이트 다운로드와 ZIP이 함께 갱신되고, `npm run test:assignments`로 검증한 뒤 `main`에 반영하면 자동 배포된다. 마감일을 바꿀 때에는 카탈로그의 `due`와 `student/assignment.md`의 날짜를 함께 갱신한다.
