**Note**: 한국어로 답변하고, 간결하게 진행하세요.

---

이번 주 작업을 주간보고 형식으로 정리합니다.

---

## 1단계: Serena Memory 보관 (선택)

주간보고 전에 최신 Serena 분석을 보관하여 참조 가능하게 합니다:

```bash
cd .context
node serena-sync/sync-memory.js --auto
```

**이유**:
- 이번 주 아키텍처 변경사항을 스냅샷으로 보관
- 주간보고에서 Serena 분석 참조 가능
- 다음 주 EPIC 생성 시 컨텍스트로 활용

---

## 2단계: 컨텍스트 수집

1. **이전 주간보고 확인** (연속성 유지)
   - `.context/weekly/` 폴더 존재 여부 확인
   - 존재하면 가장 최근 주간보고 파일 읽기 → 지난주 목표와 이번 주 성과 비교
   - 없으면 첫 주간보고로 간주

2. **현재 상태 파악**
   - `.context/{프로젝트}/progress.md` 읽기 (Story 진행률 + 일일 로그 확인)
   - 완료된 Story 파일 확인 (`.context/{프로젝트}/stories/` 내 ✅ Completed 상태)
   - Git 커밋 히스토리 확인 (`git log --oneline --since="1 week ago"`)
   - 변경된 파일 개수 및 주요 파일 확인 (`git diff --stat main...HEAD`)

3. **Serena 분석 참고** (선택)
   - `.context/archive/{프로젝트}/serena-*.md` 최신 파일 확인
   - 이번 주 아키텍처 변경이나 새로운 패턴 도입 여부 파악

---

## 3단계: 개발자에게 질문

다음 질문에 답변해주세요:

1. 이번 주에 완료한 주요 성과는 무엇인가요? (Story/Task 단위로)
2. 현재 진행 중인 작업과 진행률은 어떻게 되나요?
3. 다음 주에 완료할 목표는 무엇인가요?
4. 차단 이슈나 리스크가 있나요?
5. 다음 주 휴가 계획이 있나요?

---

## 4단계: 주간보고 작성

`.context/weekly/` 폴더를 생성하고 (없는 경우), 다음 형식으로 `YYYY-MM-DD_YYYY-MM-DD.md` 파일을 생성합니다.

**예시**: `.context/weekly/2025-11-25_2025-12-01.md`

### 주간보고 구조

```markdown
# 주간보고: YYYY-MM-DD ~ YYYY-MM-DD

## 전체 프로젝트 진행률

**[Project Name] v[version] 목표: XX% 진행**

| Epic | 상태 | 비고 |
|------|------|------|
| EPIC-XXX | ✅ 완료 | [주요 완료 사항] |
| EPIC-YYY | 🔄 진행중 | [진행 중인 Story] |
| EPIC-ZZZ | ⏳ 계획됨 | [시작 예정] |

---

## 지난주 목표 달성률

> 💡 **이전 주간보고 기반**: `.context/weekly/[이전 날짜].md` 참조

- ✅ Story 1.1 완료 (목표: Story 1.1 완료)
- ⚠️ Story 1.2 30% (목표: Story 1.2 완료) - 지연 사유: [이유]

---

## 이번 주 완료

### Backend
- Story 1.1: Provider Subscriptions API 완료 (6/6 tasks)
  - Subscription 모델 확장, Repository 메서드 구현
  - API 핸들러 작성, 유닛 테스트 완료

### Frontend
- Story 1.2: Subscription UI Components (4/4 tasks)
  - TanStack Query hooks 구현
  - 승인/거절 폼 컴포넌트

### Infrastructure
- [인프라 변경 사항]

### Serena 분석 요약 (선택)

> 📊 **Serena Memory 기반**: `.context/archive/{프로젝트}/serena-2025-11-29-*.md`

- 이번 주 아키텍처 변경: [주요 변경사항]
- 새로운 패턴 도입: [예: Repository 패턴, Service 계층]

---

## 진행 중

- Story 1.3: Dashboard Stats API (30% 진행)
- Story 1.4: Frontend Integration (계획됨)

---

## 통계

- 커밋: XX개
- 변경 파일: XX개
- 코드 추가: ~XX,XXX줄

---

## 다음 주 목표

1. Story 1.3 완료 (Dashboard Stats API)
2. Story 1.4 시작 (Frontend Integration)
3. EPIC-XXX GitHub Issues 동기화

---

## 이슈/리스크

- [블로커 이슈]
- [기술 부채]
- [의사결정 필요 사항]

**없음**: 없으면 "없음" 기재

---

## 휴가 계획

- [팀원 휴가 일정 또는 "없음"]
```

---

## 5단계: GitHub 동기화 (선택)

주간보고 완료 후 GitHub와 동기화:

```bash
# 1. progress.md 최신 상태 반영
/sync-progress-to-github

# 2. 릴리즈 계획이 있다면
/generate-release-notes
```

---

## 6단계: progress.md 업데이트 (선택)

주간보고 작성 후, `.context/{프로젝트}/progress.md`의 Story 진행률 테이블을 최신 상태로 업데이트합니다.

**업데이트 항목**:
- Story 상태 (⏳ → 🏗️ → ✅)
- 완료된 Tasks 수
- 진행률 퍼센트

---

## 7단계: 커밋 및 팀 공유

주간보고를 커밋하고 팀과 공유합니다:

```bash
cd .context
git add weekly/YYYY-MM-DD_YYYY-MM-DD.md
git add {프로젝트}/progress.md  # 업데이트한 경우
git commit -m "docs({프로젝트}): 주간보고 YYYY-MM-DD"
git push
```

**팀 공유 방법**:
- Slack/Discord에 주간보고 파일 링크 공유
- 또는 GitHub Discussion에 포스팅
