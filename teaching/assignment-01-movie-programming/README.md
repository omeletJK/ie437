# 과제 1: 영화 편성 — 문제 정의 및 의사결정 지원 설계

버전 2.0 · 2026-09-23

**제출 마감: 2026년 10월 9일(금) 23:59, 한국시간(KST, UTC+9).**

작업 기준 위치: `/Users/jinkyoo/Projects/ie437-slides/teaching/assignment-01-movie-programming/`. 기존 `ie437-platform`의 과제 패키지를 이곳으로 이동했다. 이후 편집과 배포 준비는 이 위치에서 진행한다.

IE437 과제 배포 자료. 학생은 LLM과 논의하며 문제를 정의하고, 그 정의에 근거한 가상 데모와 기업 대상 제안 발표를 만든다. 학생용 문서는 영어, 교수자용 문서는 한국어다.

## 학생에게 배포할 자료

- [과제 안내 및 공개 평가 기준](student/assignment.md)
- [문제 정의서 Markdown 양식](student/problem-definition-template.md)
- [작성 예시 — 가상의 메이커스페이스 문제](student/problem-definition-example.md)
- [문제 구조화 및 분류 참고자료](student/problem-classification-reference.md)
- [사이트 배포용 ZIP](../../html/assignments/assignment-01-movie-programming/IE437-Assignment-01.zip) — `npm run site`가 위 네 파일로 자동 생성

작성 예시는 다른 분야를 사용하며, HTML 구현을 제공하거나 검증했다고 주장하지 않는다. 학생에게 문제 정의서의 작성 형식과 기대하는 설명 수준을 보여준다.

문제 정의서는 **7개 항목**으로 간소화했다. 새 분류 원칙에 따라 문제 경계·결정·의존관계·상태 전이·정보 구조·평가 Component를 먼저 정의하고 분류를 도출한다. 분류 참고자료는 필요한 정의와 해당 구조의 후속 질문을 확인하는 자료이며 추가 제출물이 아니다.

반복되는 작업 흐름·근거·수정 이력 표를 통합했고, 근거는 주장 옆에 기록한다. 전체 편성을 다룰 정보가 부족하면 좁은 첫 단계를 정당화할 수 있지만, 그 범위의 데모와 다음 검증 계획은 필요하다. 특정 알고리즘을 요구하지 않는다.

## 학생이 제출할 결과물

| 파일 | 목적 | 배점 |
|---|---|---:|
| `problem-definition.md` | 문제 범위·분류, 계산 가능한 정의, 데이터 해석, 정보 요청, 접근·검증 계획, AI 제안 검토 | 50 |
| `demo.html` | 조건을 바꾸어 실행하고 기준안과 비교할 수 있는 가상 데모 | 25 |
| `proposal.html` | 극장 운영사에 제시하는 해결 방안·검증·도입 계획 발표 | 25 |

기본 100점과 심화 가산점 최대 10점을 별도로 기록한다. HTML은 설치·로그인·API 키·인터넷 연결 없이 열 수 있어야 한다.

## 교수자 전용

- [세부 채점 가이드](instructor/grading-guide.md)
- [배포 전 확인 및 참조 자료](instructor/preparation-notes.md)

**상위 폴더 전체를 학생에게 배포하지 않는다.** 교수자 폴더는 ZIP에 포함하지 않으며 `.gitignore`로 Git에서도 제외한다. 랜딩 페이지의 **Assignments** 섹션은 `md/_ASSIGNMENTS.md`에 명시한 학생용 네 문서와 자동 생성 ZIP만 연결한다. Pages는 `html/`만 공개하며, 배포 전에 파일 목록과 실제 다운로드 테스트를 실행한다.

편집 원본은 `student/`이다. 변경 후 프로젝트 루트에서 `npm run site`를 실행하면 사이트 다운로드와 ZIP이 함께 갱신된다. `npm run test:assignments`로 검증한 뒤 `main`에 반영하면 자동 배포된다. 마감일을 변경할 때에는 목록 설정의 `due`와 학생용 `assignment.md`를 함께 갱신한다.

이관 당시의 `student-assignment-01.zip`과 압축 해제 폴더 `student-assignment-01/`는 보관용 사본이다. 현재 배포에는 자동 생성된 `html/assignments/assignment-01-movie-programming/IE437-Assignment-01.zip`을 사용한다.
